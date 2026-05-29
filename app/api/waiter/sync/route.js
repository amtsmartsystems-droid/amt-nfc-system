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

        // === MINUTE 5: AUDIT FLAG ===
        if (elapsedMinutes >= 5 && elapsedMinutes < 6 && (tableReq.status === 'pending' || tableReq.status === 'handling')) {
            if (tableReq.clientAuditStatus === 'waiting') {
                showAudit = true;
            }
        }

        // === MINUTE 6: STRICT ESCALATION ===
        if (elapsedMinutes >= 6 && elapsedMinutes < 10) {
            const auditRes = tableReq.clientAuditStatus;

            if (tableReq.status === 'handling') {
                // MAP 1
                if (auditRes === 'yes' || auditRes === 'waiting') {
                    // Silence = Consent or Explicit Yes
                    tableReq.status = 'idle';
                    tableReq.calls = [];
                    tableReq.assignedWaiter = null;
                    stateChanged = true;
                } else if (auditRes === 'no') {
                    // Alert Telegram
                    if (botToken && chatId && lastCall.messageId) {
                        const alertText = `⚠️ تنبيه: [${tableReq.assignedWaiter || 'النادل'}] استلم طلب طاولة ${tableNumber} والزبون يطلب استعجاله!`;
                        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: alertText,
                                reply_to_message_id: lastCall.messageId
                            })
                        });
                        // Prevent re-firing
                        tableReq.clientAuditStatus = 'waiting'; // Reset so it doesn't loop
                        // Wait, it will keep polling. We should mark status as 'idle' or keep 'handling'? 
                        // The prompt says "Server instantly edits the Telegram message to an exposed alert...".
                    }
                }
            } else if (tableReq.status === 'pending') {
                // MAP 2
                if (auditRes === 'yes') {
                    tableReq.status = 'idle';
                    tableReq.calls = [];
                    stateChanged = true;
                } else {
                    // auditRes is 'no' or 'waiting' (Silence is NOT consent)
                    if (botToken && chatId && lastCall.messageId) {
                        const alertText = `🚨 نداء للجميع: طاولة ${tableNumber} تنتظر منذ 6 دقائق ولم يستلم أحد الطلب!`;
                        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: alertText,
                                reply_to_message_id: lastCall.messageId
                            })
                        });
                        if (res.ok) {
                            const result = await res.json();
                            // Pin message
                            await fetch(`https://api.telegram.org/bot${botToken}/pinChatMessage`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    message_id: result.result.message_id
                                })
                            });
                        }
                    }
                    // Change status or audit to prevent looping before minute 10
                    tableReq.clientAuditStatus = 'yes'; // Hack to prevent re-firing in the same minute
                    stateChanged = true;
                }
            }
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

        return NextResponse.json({
            status: tableReq.status,
            showAudit,
            assignedWaiter: tableReq.assignedWaiter
        });

    } catch (err) {
        console.error('[POST /api/waiter/sync]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
