import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await connectDB();
        
        // Find all cards that have active waiter telegram integrations
        const cards = await Card.find({ "telegramConfig.isEnabled": true });

        let processedCount = 0;
        const now = Date.now();

        for (const card of cards) {
            let stateChanged = false;
            const botToken = card.telegramConfig?.botToken;
            const chatId = card.telegramConfig?.chatId;

            if (!botToken || !chatId || !card.tableRequests) continue;

            for (const tableReq of card.tableRequests) {
                if (tableReq.status === 'idle' || tableReq.status === 'closing' || !tableReq.calls || tableReq.calls.length === 0) continue;

                const lastCall = tableReq.calls[tableReq.calls.length - 1];
                const lastCallMs = new Date(lastCall.timestamp || lastCall).getTime();
                const elapsedMinutes = (now - lastCallMs) / (60 * 1000);

                // === 60-SECOND AUTO-LOCKDOWN ===
                if (tableReq.status === 'handling' && tableReq.claimedAt && !tableReq.undoExpired) {
                    const claimElapsedSecs = (now - new Date(tableReq.claimedAt).getTime()) / 1000;
                    if (claimElapsedSecs >= 60) {
                        tableReq.undoExpired = true;
                        stateChanged = true;
                        if (botToken && chatId && lastCall.messageId) {
                            const originalText = `✅ طاولة ${tableReq.tableNumber} تطلب: ${lastCall.service || 'نداء'} - (تم الاستلام بواسطة ${tableReq.assignedWaiter || 'النادل'})`;
                            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    message_id: lastCall.messageId,
                                    text: `<b>${originalText}</b>\n\n✅ <b>الطلب في عهدة ${tableReq.assignedWaiter || 'النادل'}</b>`,
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: [[{ text: '✅ تم التوصيل والإنجاز', callback_data: `complete_table_${tableReq.tableNumber}_${card.shortCode}` }]]
                                    }
                                })
                            }).catch(console.error);
                        }
                    }
                }

                // Skip if not minute 6+ yet
                if (elapsedMinutes < 6) continue;

                // === MINUTE 6: STRICT ESCALATION ===
                if (elapsedMinutes >= 6 && elapsedMinutes < 10) {
                    const auditRes = tableReq.clientAuditStatus;

                    if (tableReq.status === 'handling') {
                        // MAP 1
                        if (auditRes === 'yes' || auditRes === 'waiting') {
                            tableReq.status = 'idle';
                            tableReq.calls = [];
                            tableReq.assignedWaiter = null;
                            stateChanged = true;
                        } else if (auditRes === 'no') {
                            if (lastCall.messageId) {
                                const alertText = `⚠️ تنبيه: [${tableReq.assignedWaiter || 'النادل'}] استلم طلب طاولة ${tableReq.tableNumber} والزبون يطلب استعجاله!`;
                                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        chat_id: chatId,
                                        text: alertText,
                                        reply_to_message_id: lastCall.messageId
                                    })
                                });
                                tableReq.clientAuditStatus = 'waiting';
                            }
                        }
                    } else if (tableReq.status === 'pending') {
                        // MAP 2
                        if (auditRes === 'yes') {
                            tableReq.status = 'idle';
                            tableReq.calls = [];
                            stateChanged = true;
                        } else {
                            if (lastCall.messageId) {
                                const alertText = `🚨 نداء للجميع: طاولة ${tableReq.tableNumber} تنتظر منذ 6 دقائق ولم يستلم أحد الطلب!`;
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
                                    await fetch(`https://api.telegram.org/bot${botToken}/pinChatMessage`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            chat_id: chatId,
                                            message_id: result.result.message_id
                                        })
                                    });
                                }
                                tableReq.clientAuditStatus = 'yes';
                                stateChanged = true;
                            }
                        }
                    }
                }

                // === MINUTE 10: AUTO EXPIRE CALL ===
                if (elapsedMinutes >= 10 && tableReq.status !== 'closing') {
                    tableReq.status = 'idle';
                    tableReq.calls = [];
                    tableReq.assignedWaiter = null;
                    stateChanged = true;
                }
            }

            if (stateChanged) {
                card.markModified('tableRequests');
                await card.save();
                const { updateLiveTelegramDashboard } = require('../../../../../lib/telegramDashboard');
                updateLiveTelegramDashboard(card.shortCode).catch(console.error);
                processedCount++;
            }
        }

        return NextResponse.json({ success: true, processedCards: processedCount });

    } catch (err) {
        console.error('[GET /api/cron/escalation]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
