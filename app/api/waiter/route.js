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

        if (sessionExpiredMs && sessionExpiredMs < now) {
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
        const isBill = (serviceType === 'bill');

        if (!isBill) {
            // Normal services: check limits
            const recentCalls = (tableReq.calls || []).filter(
                c => now - new Date(c.timestamp || c).getTime() < RATE_WINDOW_MS
            );

            if (recentCalls.length >= MAX_CALLS) {
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
                        { 
                            error: `⏳ يرجى الانتظار ${remaining} ثانية قبل نداء الويتر مرة أخرى.`,
                            remainingSeconds: remaining 
                        },
                        { status: 429 }
                    );
                }
            }
        }

        // ── 8. ATOMIC LOCK & PUSH (RACE CONDITION FIX) ───────────────────────
        let updateQuery = {
            $push: {
                "tableRequests.$.calls": { timestamp: new Date(now), service: serviceType, messageId: null }
            }
        };

        if (isBill) {
            updateQuery.$set = {
                "tableRequests.$.status": "closing",
                "tableRequests.$.sessionExpiresAt": new Date(now + 7200000)
            };
        } else {
            updateQuery.$set = {
                "tableRequests.$.status": "pending",
                "tableRequests.$.clientAuditStatus": "waiting",
                "tableRequests.$.sessionExpiresAt": new Date(now + 7200000)
            };
        }

        const lockedCard = await Card.findOneAndUpdate(
            {
                shortCode: restaurantId,
                tableRequests: {
                    $elemMatch: {
                        tableNumber: tableNumber,
                        sessionId: decodedPayload.sessionId,
                        calls: {
                            $not: {
                                $elemMatch: { timestamp: { $gt: new Date(now - COOLDOWN_MS) } }
                            }
                        }
                    }
                }
            },
            updateQuery,
            { new: true }
        );

        if (!lockedCard) {
            // Atomic check failed meaning another request beat us to it in the last 60s
            return NextResponse.json(
                { 
                    error: `⏳ عذراً، تم تسجيل طلبك بالفعل للتو (منع التكرار).`,
                    remainingSeconds: 60 
                },
                { status: 429 }
            );
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
            if (resultData.ok && !isBill) {
                // Atomically set the messageId of the newly pushed call
                await Card.updateOne(
                    { shortCode: restaurantId },
                    { $set: { "tableRequests.$[t].calls.$[c].messageId": resultData.result.message_id.toString() } },
                    { arrayFilters: [ { "t.tableNumber": tableNumber }, { "c.timestamp": new Date(now) } ] }
                );
            }
        }

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
