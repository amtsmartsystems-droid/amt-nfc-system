import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const body = await req.json();
        const { restaurantId, tableNumber } = body;

        if (!restaurantId || !tableNumber) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        const tableReq = card.tableRequests?.find(t => t.tableNumber === tableNumber);
        if (!tableReq || tableReq.calls?.length === 0) {
            return NextResponse.json({ status: 'idle', showAudit: false });
        }

        const now = Date.now();
        const lastCall = tableReq.calls[tableReq.calls.length - 1];
        const lastCallMs = new Date(lastCall.timestamp || lastCall).getTime();
        const elapsedMinutes = (now - lastCallMs) / (60 * 1000);

        let stateChanged = false;
        let showAudit = false;

        // Ensure variables
        const botToken = card.telegramConfig?.botToken;
        const chatId = card.telegramConfig?.chatId;

        // === 60-SECOND AUTO-LOCKDOWN ===
        if (tableReq.status === 'handling' && tableReq.claimedAt && !tableReq.undoExpired) {
            const claimElapsedSecs = (now - new Date(tableReq.claimedAt).getTime()) / 1000;
            if (claimElapsedSecs >= 60) {
                tableReq.undoExpired = true;
                stateChanged = true;
                
                if (botToken && chatId && lastCall.messageId) {
                    // Update Telegram Message to remove the Undo Button
                    const originalText = `✅ طاولة ${tableNumber} تطلب: ${lastCall.service || 'نداء'} - (تم الاستلام بواسطة ${tableReq.assignedWaiter || 'النادل'})`;
                    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            message_id: lastCall.messageId,
                            text: `<b>${originalText}</b>\n\n✅ <b>الطلب في عهدة ${tableReq.assignedWaiter || 'النادل'}</b>`,
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [[{ text: '✅ تم التوصيل والإنجاز', callback_data: `complete_table_${tableNumber}_${restaurantId}` }]]
                            }
                        })
                    }).catch(console.error);
                }
            }
        }

        // === MINUTE 5: SMART REMINDER FLAG ===
        if (elapsedMinutes >= 5 && elapsedMinutes < 6 && (tableReq.status === 'pending' || tableReq.status === 'handling')) {
            if (tableReq.clientAuditStatus === 'waiting' || tableReq.clientAuditStatus === 'reminded') {
                showAudit = true;
            }
        }

        // === MINUTE 6: SILENCE = CONSENT (AUTO-CLOSE) ===
        if (elapsedMinutes >= 6 && elapsedMinutes < 10) {
            tableReq.status = 'idle';
            tableReq.calls = [];
            tableReq.assignedWaiter = null;
            stateChanged = true;
        }

        // === MINUTE 10: AUTO EXPIRE CALL ===
        // Note: the /api/waiter filter naturally ignores old calls, but let's actively clear it
        if (elapsedMinutes >= 10 && tableReq.status !== 'closing') {
            tableReq.status = 'idle';
            tableReq.calls = [];
            tableReq.assignedWaiter = null;
            stateChanged = true;
            showAudit = false;
        }

        if (stateChanged) {
            card.markModified('tableRequests');
            await card.save();
            try {
                const { updateLiveTelegramDashboard } = require('../../../../lib/telegramDashboard');
                await updateLiveTelegramDashboard(restaurantId);
            } catch (err) {
                console.error(err);
            }
        }

        let lastService = null;
        if (tableReq.calls && tableReq.calls.length > 0) {
            lastService = tableReq.calls[tableReq.calls.length - 1].service || null;
        }

        return NextResponse.json({
            status: tableReq.status,
            showAudit,
            assignedWaiter: tableReq.assignedWaiter,
            lastService
        });

    } catch (err) {
        console.error('[POST /api/waiter/sync]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
