import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../backend/config/db';
import Card from '../../../backend/models/Card';

const JWT_SECRET      = process.env.JWT_SECRET || 'amt_smart_waiter_super_secret';
const RATE_WINDOW_MS  = 10 * 60 * 1000; // 10 minutes sliding window
const MAX_CALLS       = 3;               // max calls per window
const COOLDOWN_MS     = 60 * 1000;       // 60 second cooldown between calls

export async function POST(req) {
    try {
        const body = await req.json();
        const { restaurantId, tableNumber, serviceType, paymentMethod } = body;

        if (!restaurantId || !tableNumber || !serviceType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('waiter_session');

        if (!sessionCookie?.value) {
            return NextResponse.json(
                { error: 'غير مصرح لك. يرجى مسح بطاقة الـ NFC الموجودة على الطاولة.' },
                { status: 401 }
            );
        }

        let decodedPayload;
        try {
            decodedPayload = jwt.verify(sessionCookie.value, JWT_SECRET);
        } catch {
            return NextResponse.json(
                { error: 'جلسة غير صالحة. يرجى مسح البطاقة مجدداً.' },
                { status: 401 }
            );
        }

        if (
            decodedPayload.restaurantId !== restaurantId ||
            decodedPayload.tableNumber  !== tableNumber
        ) {
            return NextResponse.json(
                { error: 'بيانات الجلسة لا تتطابق مع الطلب الحالي.' },
                { status: 403 }
            );
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) {
            return NextResponse.json({ error: 'المطعم غير موجود.' }, { status: 404 });
        }

        const { telegramConfig = {} } = card;
        if (!telegramConfig.isEnabled || !telegramConfig.botToken || !telegramConfig.chatId) {
            return NextResponse.json(
                { error: 'نظام الويتر الذكي غير مفعّل لهذا المطعم.' },
                { status: 403 }
            );
        }

        const tableReq = (card.tableRequests || []).find(
            t => t.tableNumber === tableNumber
        );

        if (!tableReq) {
            return NextResponse.json(
                { error: 'الطاولة غير مسجلة. يرجى مسح البطاقة مجدداً.' },
                { status: 403 }
            );
        }

        if (tableReq.sessionId !== decodedPayload.sessionId) {
            return NextResponse.json(
                { error: 'الجلسة انتهت أو تم إعادة تعيينها. يرجى مسح البطاقة.' },
                { status: 403 }
            );
        }

        const now = Date.now();
        const sessionExpiredMs = tableReq.sessionExpiresAt
            ? new Date(tableReq.sessionExpiresAt).getTime()
            : null;

        if (tableReq.status === 'idle' || (sessionExpiredMs && sessionExpiredMs < now)) {
            return NextResponse.json(
                { error: 'الجلسة مغلقة. يرجى مسح البطاقة لتفعيل طاولة جديدة.' },
                { status: 403 }
            );
        }

        // ── 6. BILL LOCK ENFORCEMENT ─────────────────────────────────────────
        if (tableReq.status === 'closing') {
            return NextResponse.json(
                { error: '🧾 تم طلب الفاتورة مسبقاً. الجلسة مقفلة حتى يتم إغلاق الطاولة.' },
                { status: 403 }
            );
        }

        // ── 7. RATE LIMITING & BYPASS ────────────────────────────────────────
        // Keep only calls from the last 10 minutes (Support backward compatible Date or new Object schema)
        tableReq.calls = (tableReq.calls || []).filter(
            c => now - new Date(c.timestamp || c).getTime() < RATE_WINDOW_MS
        );

        const isBill = (serviceType === 'bill');

        if (!isBill) {
            // Normal services: check limits and cooldowns
            if (tableReq.calls.length >= MAX_CALLS) {
                return NextResponse.json(
                    { error: '🚫 تم الوصول للحد الأقصى للنداءات. يرجى الانتظار.' },
                    { status: 429 }
                );
            }

            if (tableReq.calls.length > 0) {
                const lastCall = tableReq.calls[tableReq.calls.length - 1];
                const lastCallMs = new Date(lastCall.timestamp || lastCall).getTime();
                const elapsed = now - lastCallMs;
                if (elapsed < COOLDOWN_MS) {
                    const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
                    return NextResponse.json(
                        { error: `⏳ يرجى الانتظار ${remaining} ثانية قبل نداء الويتر مرة أخرى.` },
                        { status: 429 }
                    );
                }
            }
            
            // Register this normal call. We will add the messageId AFTER sending to Telegram.
            tableReq.calls.push({ timestamp: new Date(now), service: serviceType, messageId: null });
            
            // Set status to pending and reset client audit
            tableReq.status = 'pending';
            tableReq.clientAuditStatus = 'waiting';
        }

        if (isBill) {
            // Bill bypasses calls limit and instantly locks the table
            tableReq.status = 'closing';
            // Hard expiry 10 minutes from now just as a fallback
            tableReq.sessionExpiresAt = new Date(now + 10 * 60 * 1000);
        }

        // ── 9. TELEGRAM NOTIFICATION ─────────────────────────────────────────
        const businessName = card.businessName || 'المطعم';
        let serviceIcon = '🔔';
        let serviceName = serviceType;
        let paymentLine = '';

        if (isBill) {
            serviceIcon = '🧾';
            serviceName = 'طلب الفاتورة';
            if      (paymentMethod === 'cash') paymentLine = '\n💳 <b>طريقة الدفع:</b> 💵 كاش';
            else if (paymentMethod === 'visa') paymentLine = '\n💳 <b>طريقة الدفع:</b> 💳 فيزا / شبكة';
        } else if (serviceType === 'coal')  { serviceIcon = '💨'; serviceName = 'تغيير فحم الشيشة'; }
          else if (serviceType === 'clean') { serviceIcon = '🧻'; serviceName = 'تنظيف الطاولة';   }
          else if (serviceType === 'waiter'){ serviceIcon = '👨‍🍳'; serviceName = 'نداء للويتر';       }

        const textMessage = `
🔔 <b>نداء جديد من طاولة!</b>

🏢 <b>المطعم:</b> ${businessName}
🍽 <b>الطاولة:</b> ${tableNumber}
🛎 <b>الخدمة:</b> ${serviceIcon} ${serviceName}${paymentLine}

⏰ <i>الوقت: ${new Date().toLocaleTimeString('ar-SA')}</i>
        `.trim();

        const replyMarkup = {
            inline_keyboard: [
                [
                    {
                        text: '✋ أنا أخذت الطلب',
                        callback_data: `claim_table_${tableNumber}_${restaurantId}`
                    }
                ],
                [
                    {
                        text: '🛑 إنهاء الجلسة (إغلاق الطاولة)',
                        callback_data: `action_close_table_${tableNumber}_${restaurantId}`
                    }
                ]
            ]
        };

        const telegramRes = await fetch(
            `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id:      telegramConfig.chatId,
                    text:         textMessage,
                    parse_mode:   'HTML',
                    reply_markup: replyMarkup,
                }),
            }
        );

        if (!telegramRes.ok) {
            console.error('[/api/waiter] Telegram error:', await telegramRes.text());
            // Even if Telegram fails, we still save the db state (status pending)
        } else {
            const resultData = await telegramRes.json();
            if (resultData.ok && !isBill && tableReq.calls.length > 0) {
                // Save the messageId of the newly sent message
                tableReq.calls[tableReq.calls.length - 1].messageId = resultData.result.message_id.toString();
            }
        }

        // ── 8. SAVE STATE EXPLICITLY ─────────────────────────────────────────
        card.markModified('tableRequests');
        await card.save();

        // ── Asynchronously update Live Dashboard ──
        if (isBill) {
            const { updateLiveTelegramDashboard } = require('../../../lib/telegramDashboard');
            updateLiveTelegramDashboard(restaurantId).catch(console.error);
        }

        return NextResponse.json({ success: true, message: 'تم إرسال النداء بنجاح ✅' });

    } catch (err) {
        console.error('[POST /api/waiter]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
