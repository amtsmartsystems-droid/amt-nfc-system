import { NextResponse } from 'next/server';
import connectDB from '../../../backend/config/db';
import Card from '../../../backend/models/Card';

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

        const { telegramConfig = {} } = card;
        if (!telegramConfig.isEnabled || !telegramConfig.botToken || !telegramConfig.chatId) {
            return NextResponse.json(
                { error: 'النظام الذكي غير مفعّل لهذا المطعم.' },
                { status: 403 }
            );
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

        const tgUrl = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
        const res = await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegramConfig.chatId,
                text: messageText,
                parse_mode: 'HTML'
            })
        });

        if (!res.ok) {
            const tgError = await res.text();
            console.error('Telegram API Error (Order):', tgError);
            return NextResponse.json({ error: 'فشل إرسال الطلب، يرجى إبلاغ الكاشير' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Order sent successfully' }, { status: 200 });

    } catch (error) {
        console.error('Order API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
