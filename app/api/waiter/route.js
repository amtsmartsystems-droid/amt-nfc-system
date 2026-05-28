import { NextResponse } from 'next/server';
import connectDB from '../../../backend/config/db';
import Card from '../../../backend/models/Card';

// Keep track of recent requests in memory to prevent spam
// Key: `${restaurantId}-${tableNumber}`, Value: timestamp
const rateLimitMap = new Map();

export async function POST(req) {
    try {
        const body = await req.json();
        const { restaurantId, tableNumber, serviceType } = body;

        if (!restaurantId || !tableNumber || !serviceType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Rate limiting logic (1 request per minute per table)
        const rateKey = `${restaurantId}-${tableNumber}`;
        const lastReqTime = rateLimitMap.get(rateKey);
        const now = Date.now();

        if (lastReqTime && (now - lastReqTime < 60_000)) {
            return NextResponse.json({ error: 'طلبات كثيرة. يرجى الانتظار دقيقة.' }, { status: 429 });
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const telegramConfig = card.telegramConfig || {};
        if (!telegramConfig.isEnabled || !telegramConfig.botToken || !telegramConfig.chatId) {
            return NextResponse.json({ error: 'Smart waiter is not enabled for this restaurant' }, { status: 403 });
        }

        const businessName = card.businessName || 'المطعم';
        
        let serviceIcon = '🔔';
        let serviceName = serviceType;
        
        if (serviceType === 'bill') { serviceIcon = '💸'; serviceName = 'طلب الحساب'; }
        else if (serviceType === 'coal') { serviceIcon = '💨'; serviceName = 'تغيير فحم الشيشة'; }
        else if (serviceType === 'clean') { serviceIcon = '🧹'; serviceName = 'تنظيف الطاولة'; }
        else if (serviceType === 'waiter') { serviceIcon = '👨‍🍳'; serviceName = 'نداء للويتر'; }

        const textMessage = `
🔔 <b>نداء جديد من طاولة!</b>

🏢 <b>المطعم:</b> ${businessName}
🍽 <b>الطاولة:</b> ${tableNumber}
🛎 <b>الخدمة:</b> ${serviceIcon} ${serviceName}

⏰ <i>الوقت: ${new Date().toLocaleTimeString('ar-SA')}</i>
        `.trim();

        // Send to Telegram
        const telegramUrl = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
        const telegramRes = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegramConfig.chatId,
                text: textMessage,
                parse_mode: 'HTML'
            })
        });

        if (!telegramRes.ok) {
            const err = await telegramRes.text();
            console.error('Telegram API error:', err);
            return NextResponse.json({ error: 'Failed to send notification to Telegram' }, { status: 500 });
        }

        // Update rate limit
        rateLimitMap.set(rateKey, now);

        // Cleanup old rate limit entries to prevent memory leak
        if (rateLimitMap.size > 1000) {
            rateLimitMap.clear();
        }

        return NextResponse.json({ success: true, message: 'تم إرسال النداء بنجاح' });

    } catch (error) {
        console.error('[POST /api/waiter]', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
