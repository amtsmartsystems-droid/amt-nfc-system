import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../backend/config/db';
import Card from '../../../backend/models/Card';

const JWT_SECRET = process.env.JWT_SECRET || 'amt_smart_waiter_super_secret';
const COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown for orders

export async function POST(req) {
    try {
        const body = await req.json();
        const { restaurantId, tableNumber, cart, paymentMethod, total } = body;

        if (!restaurantId || !cart || cart.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) {
            return NextResponse.json({ error: 'المطعم غير موجود.' }, { status: 404 });
        }

        const { telegramConfig = {}, isHouseSystemActive } = card;
        if (!telegramConfig.botToken || !telegramConfig.chatId) {
            return NextResponse.json(
                { error: 'النظام الذكي غير مفعّل لهذا المطعم.' },
                { status: 403 }
            );
        }

        if (!isHouseSystemActive) {
            return NextResponse.json(
                { error: 'نظام الطلبات الذاتية مغلق حالياً.' },
                { status: 403 }
            );
        }

        // ── TABLE VERIFICATION & ANTI-SPAM (IF DINE-IN) ──
        if (tableNumber) {
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get('waiter_session');

            if (!sessionCookie?.value) {
                return NextResponse.json(
                    { error: 'غير مصرح لك. يرجى مسح بطاقة الـ NFC الموجودة على الطاولة لتأكيد الطلب.' },
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

            if (tableReq.status === 'closing') {
                return NextResponse.json(
                    { error: '🧾 تم طلب الفاتورة مسبقاً. الجلسة مقفلة حتى يتم إغلاق الطاولة.' },
                    { status: 403 }
                );
            }
        } else {
            // ── TAKEAWAY / DELIVERY ORDERS ──
            if (card.isTakeawayEnabled === false) {
                return NextResponse.json(
                    { error: 'عذراً، الطلبات الخارجية (تيك أوي) مغلقة حالياً. لا يمكن الطلب إلا من داخل المطعم (يجب مسح البطاقة).' },
                    { status: 403 }
                );
            }
        }

        // ── GLOBAL COOKIE COOLDOWN (DINE-IN & TAKEAWAY) ──
        const cookieStore = await cookies();
        const lastOrderCookie = cookieStore.get('last_order_time');
        if (lastOrderCookie?.value) {
            const elapsed = Date.now() - parseInt(lastOrderCookie.value, 10);
            if (elapsed < COOLDOWN_MS) {
                const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
                return NextResponse.json(
                    { error: `⏳ يرجى الانتظار ${remaining} ثانية قبل إرسال طلب طعام جديد.` },
                    { status: 429 }
                );
            }
        }

        // ── Formulate Telegram Message ──
        let messageText = `🟡 <b>طلب طعام جديد (New Order)</b>\n`;
        messageText += `━━━━━━━━━━━━━━━━━━━━━\n`;
        messageText += `🏠 <b>المطعم:</b> ${card.businessName || 'المطعم'}\n`;
        if (tableNumber) {
            messageText += `📍 <b>الطاولة:</b> ${tableNumber}\n`;
        } else {
            messageText += `📍 <b>تيك أوي / ديلفري</b>\n`;
        }
        messageText += `━━━━━━━━━━━━━━━━━━━━━\n`;
        
        cart.forEach(item => {
            messageText += `🛒 <b>${item.qty}x</b> ${item.nameAr || item.name}  -  <i>${item.price * item.qty} JOD</i>\n`;
        });
        
        messageText += `━━━━━━━━━━━━━━━━━━━━━\n`;
        messageText += `💰 <b>المجموع:</b> ${total} JOD\n`;
        
        if (paymentMethod === 'cliq') {
            messageText += `💳 <b>الدفع:</b> عبر كليك (CliQ)\n`;
            messageText += `⚠️ <i>الزبون يبلغ بأنه أتم التحويل. يرجى من الكاشير التأكد من وصول الحوالة.</i>\n`;
        } else {
            messageText += `💵 <b>الدفع:</b> نقداً (Cash)\n`;
        }

        const replyMarkup = {
            inline_keyboard: [
                [
                    {
                        text: '✅ تجهيز واستلام الطلب',
                        callback_data: `order_ready_${restaurantId}`
                    }
                ]
            ]
        };

        const tgUrl = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
        const res = await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegramConfig.chatId,
                text: messageText,
                parse_mode: 'HTML',
                reply_markup: replyMarkup
            })
        });

        if (!res.ok) {
            const tgError = await res.text();
            console.error('Telegram API Error (Order):', tgError);
            return NextResponse.json({ error: 'فشل إرسال الطلب، يرجى إبلاغ الكاشير' }, { status: 500 });
        }

        // Set Cooldown Cookie on Success
        const response = NextResponse.json({ message: 'Order sent successfully' }, { status: 200 });
        response.cookies.set('last_order_time', Date.now().toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 // 1 minute
        });
        
        return response;

    } catch (error) {
        console.error('Order API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
