import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

const JWT_SECRET = process.env.JWT_SECRET || 'amt_smart_waiter_super_secret';

export async function POST(req) {
    try {
        const body = await req.json();
        const { restaurantId, tableNumber } = body;

        if (!restaurantId || !tableNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('waiter_session');

        if (!sessionCookie?.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decodedPayload;
        try {
            decodedPayload = jwt.verify(sessionCookie.value, JWT_SECRET);
        } catch {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        if (decodedPayload.restaurantId !== restaurantId || decodedPayload.tableNumber !== tableNumber) {
            return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const tableReq = card.tableRequests?.find(t => t.tableNumber === tableNumber);

        if (!tableReq || tableReq.sessionId !== decodedPayload.sessionId) {
            return NextResponse.json({ error: 'Invalid or expired table session' }, { status: 403 });
        }

        if (tableReq.status !== 'pending' && tableReq.status !== 'handling') {
            return NextResponse.json({ error: 'No active request to remind about' }, { status: 400 });
        }
        
        if (tableReq.clientAuditStatus === 'reminded') {
            return NextResponse.json({ error: 'تم التذكير مسبقاً' }, { status: 429 });
        }

        const telegramConfig = card.telegramConfig || {};
        if (telegramConfig.isEnabled && telegramConfig.botToken && telegramConfig.chatId) {
            const lastService = (tableReq.calls && tableReq.calls.length > 0) ? tableReq.calls[tableReq.calls.length - 1].service : 'نداء';
            
            // Send Priority Reminder
            const alertText = `⚠️ <b>تذكير:</b> طاولة ${tableNumber} تستعجل طلب الخدمة (${lastService})!`;
            
            // If it's handling, mention the waiter
            const message = tableReq.status === 'handling' 
                ? `${alertText}\n<i>الطلب حالياً في عهدة: ${tableReq.assignedWaiter}</i>`
                : alertText;

            let replyTo = null;
            if (tableReq.calls && tableReq.calls.length > 0 && tableReq.calls[tableReq.calls.length - 1].messageId) {
                replyTo = tableReq.calls[tableReq.calls.length - 1].messageId;
            }

            const bodyObj = {
                chat_id: telegramConfig.chatId,
                text: message,
                parse_mode: 'HTML'
            };
            if (replyTo) {
                bodyObj.reply_to_message_id = replyTo;
            }

            await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyObj)
            }).catch(console.error);
        }

        tableReq.clientAuditStatus = 'reminded';
        tableReq.sessionExpiresAt = new Date(Date.now() + 7200000); // Auto-renew session on activity
        card.markModified('tableRequests');
        await card.save();

        return NextResponse.json({ success: true, message: 'تم إرسال التذكير بنجاح' });

    } catch (error) {
        console.error('[POST /api/waiter/remind]', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
