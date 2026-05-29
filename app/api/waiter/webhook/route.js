import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("[Webhook] Received:", JSON.stringify(body, null, 2));

        // ── Security Check: Verify Telegram Secret Token ──
        // BYPASSED FOR NOW: The webhook was set without a secret token.
        /*
        const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
        if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
            console.error('[Webhook] Unauthorized: Invalid secret token');
            return NextResponse.json({ ok: true }); // Return 200 to prevent Telegram from retrying
        }
        */

        const callbackQuery = body.callback_query;
        
        // ── Handle Commands (e.g. /setup_dashboard) ──
        if (body.message && body.message.text === '/setup_dashboard') {
            const chatId = body.message.chat.id.toString();
            await connectDB();
            const card = await Card.findOne({ "telegramConfig.chatId": chatId });
            
            if (card && card.telegramConfig?.botToken) {
                // Send initial dashboard message
                const initText = `📊 <b>جاري إعداد لوحة التحكم المباشرة...</b>`;
                const sendUrl = `https://api.telegram.org/bot${card.telegramConfig.botToken}/sendMessage`;
                
                const sendRes = await fetch(sendUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: initText,
                        parse_mode: 'HTML'
                    })
                });
                
                if (sendRes.ok) {
                    const sendData = await sendRes.json();
                    card.telegramConfig.dashboardMessageId = sendData.result.message_id.toString();
                    card.markModified('telegramConfig');
                    await card.save();
                    
                    // Trigger immediate update
                    const { updateLiveTelegramDashboard } = require('../../../../lib/telegramDashboard');
                    await updateLiveTelegramDashboard(card.shortCode);
                }
            }
            return NextResponse.json({ ok: true });
        }

        if (!callbackQuery) {
            return NextResponse.json({ ok: true });
        }

        const data = callbackQuery.data || '';

        // Match format: action_close_table_${tableNumber}_${restaurantId} OR claim_table_${tableNumber}_${restaurantId} OR complete_table_${tableNumber}_${restaurantId} OR undo_claim_table_${tableNumber}_${restaurantId}
        const closeMatch = data.match(/^action_close_table_(.+?)_(.+)$/);
        const claimMatch = data.match(/^claim_table_(.+?)_(.+)$/);
        const completeMatch = data.match(/^complete_table_(.+?)_(.+)$/);
        const undoMatch = data.match(/^undo_claim_table_(.+?)_(.+)$/);

        let isCloseAction = false;
        let isClaimAction = false;
        let isCompleteAction = false;
        let isUndoClaimAction = false;
        let tableNumber, restaurantId;

        if (closeMatch) {
            isCloseAction = true;
            tableNumber = closeMatch[1];
            restaurantId = closeMatch[2];
        } else if (claimMatch) {
            isClaimAction = true;
            tableNumber = claimMatch[1];
            restaurantId = claimMatch[2];
        } else if (completeMatch) {
            isCompleteAction = true;
            tableNumber = completeMatch[1];
            restaurantId = completeMatch[2];
        } else if (undoMatch) {
            isUndoClaimAction = true;
            tableNumber = undoMatch[1];
            restaurantId = undoMatch[2];
        } else {
            return NextResponse.json({ ok: true });
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) {
            console.error(`[Webhook] Restaurant card not found: ${restaurantId}`);
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const telegramConfig = card.telegramConfig || {};
        const botToken = telegramConfig.botToken;

        if (!botToken) {
            console.error(`[Webhook] Telegram bot token is missing for: ${restaurantId}`);
            return NextResponse.json({ error: 'Bot token not configured' }, { status: 400 });
        }

        const existingIdx = (card.tableRequests || []).findIndex(t => t.tableNumber === tableNumber);

        if (isCloseAction) {
            // ── 1. Answer Callback Query to stop the spinning loading indicator ──
            const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
            await fetch(answerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: callbackQuery.id,
                    text: `✅ تم إغلاق جلسة الطاولة ${tableNumber} بنجاح.`,
                    show_alert: false
                })
            }).catch(e => console.error("Failed to answer callback:", e));

            // ── 2. Terminate Session centrally (Server-side Session Revocation) ─────
            if (existingIdx >= 0) {
                card.tableRequests[existingIdx].status = 'idle';
                card.tableRequests[existingIdx].sessionId = null;
                card.tableRequests[existingIdx].calls = [];
                card.tableRequests[existingIdx].sessionExpiresAt = null;
            } else {
                if (!card.tableRequests) card.tableRequests = [];
                card.tableRequests.push({ 
                    tableNumber, 
                    status: 'idle',
                    sessionId: null,
                    calls: [],
                    sessionExpiresAt: null 
                });
            }
            card.markModified('tableRequests');
            await card.save();

            // ── 3. Edit original message to remove the inline button and show feedback ──
            const originalText = callbackQuery.message?.text || '';
            const updatedText = `<b>${originalText}</b>\n\n✅ <b>تم إغلاق الجلسة وإنهاء طلبات الطاولة.</b>`;
            
            const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
            await fetch(editUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: callbackQuery.message?.chat?.id,
                    message_id: callbackQuery.message?.message_id,
                    text: updatedText,
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: [] } // Clears the inline keyboard buttons
                })
            });

        } else if (isClaimAction) {
            // ── 1. Answer Callback Query Immediately ──
            const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
            await fetch(answerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: callbackQuery.id,
                    text: `✅ تم استلام طلب طاولة ${tableNumber} بنجاح.`,
                    show_alert: false
                })
            }).catch(e => console.error("Failed to answer callback:", e));

            // ── 2. Update Status to Handling (DO NOT CLEAR CALLS) ─────
            const waiterName = callbackQuery.from?.first_name || 'موظف';
            if (existingIdx >= 0) {
                card.tableRequests[existingIdx].status = 'handling';
                card.tableRequests[existingIdx].assignedWaiter = waiterName;
                card.tableRequests[existingIdx].claimedAt = new Date();
                card.tableRequests[existingIdx].undoExpired = false;
                card.markModified('tableRequests');
                await card.save();
            }

            // ── 3. Edit Message and Replace Button ──
            const originalText = callbackQuery.message?.text || '';
            const updatedText = `<b>${originalText}</b>\n\n✅ <b>الطلب في عهدة ${waiterName}</b>`;

            const replyMarkup = {
                inline_keyboard: [
                    [
                        {
                            text: '✅ تم التوصيل والإنجاز',
                            callback_data: `complete_table_${tableNumber}_${restaurantId}`
                        }
                    ],
                    [
                        {
                            text: '↩️ تراجع (متاح لدقيقة)',
                            callback_data: `undo_claim_table_${tableNumber}_${restaurantId}`
                        }
                    ]
                ]
            };

            const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
            await fetch(editUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: callbackQuery.message?.chat?.id,
                    message_id: callbackQuery.message?.message_id,
                    text: updatedText,
                    parse_mode: 'HTML',
                    reply_markup: replyMarkup
                })
            });
        } else if (isCompleteAction) {
            // ── 1. Answer Callback Query ──
            const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
            await fetch(answerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: callbackQuery.id,
                    text: `✅ تم إنهاء طلب طاولة ${tableNumber}.`,
                    show_alert: false
                })
            }).catch(e => console.error("Failed to answer callback:", e));

            // ── 2. Update Status to Idle and Clear Calls ─────
            if (existingIdx >= 0) {
                card.tableRequests[existingIdx].status = 'idle';
                card.tableRequests[existingIdx].calls = [];
                card.tableRequests[existingIdx].assignedWaiter = null;
                card.markModified('tableRequests');
                await card.save();
            }

            // ── 3. Edit Message to indicate completion ──
            const originalText = callbackQuery.message?.text || '';
            const updatedText = `<b>${originalText}</b>\n\n🎉 <i>(تم إنجاز الطلب)</i>`;

            const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
            await fetch(editUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: callbackQuery.message?.chat?.id,
                    message_id: callbackQuery.message?.message_id,
                    text: updatedText,
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: [] }
                })
            });
        } else if (isUndoClaimAction) {
            // ── 1. Check if 60 seconds have passed ──
            let canUndo = true;
            if (existingIdx >= 0) {
                const claimedAt = card.tableRequests[existingIdx].claimedAt;
                if (claimedAt) {
                    const elapsedSecs = (Date.now() - new Date(claimedAt).getTime()) / 1000;
                    if (elapsedSecs > 60) {
                        canUndo = false;
                    }
                }
            }

            if (!canUndo) {
                // Reject
                const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
                await fetch(answerUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        callback_query_id: callbackQuery.id,
                        text: `❌ انتهت الدقيقة! لا يمكن التراجع عن استلام الطلب.`,
                        show_alert: true
                    })
                });
                
                // Remove the undo button visually since it expired
                const originalText = callbackQuery.message?.text || '';
                const replyMarkup = {
                    inline_keyboard: [
                        [
                            {
                                text: '✅ تم التوصيل والإنجاز',
                                callback_data: `complete_table_${tableNumber}_${restaurantId}`
                            }
                        ]
                    ]
                };
                const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
                await fetch(editUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: callbackQuery.message?.chat?.id,
                        message_id: callbackQuery.message?.message_id,
                        text: originalText,
                        parse_mode: 'HTML',
                        reply_markup: replyMarkup
                    })
                });
                
                return NextResponse.json({ ok: true });
            }

            // ── 2. Answer Callback Query FIRST ──
            const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
            await fetch(answerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: callbackQuery.id,
                    text: `↩️ تم التراجع. الطلب متاح الآن للجميع.`,
                    show_alert: false
                })
            }).catch(e => console.error("Failed to answer callback:", e));

            // ── 3. Allow Undo: Revert Status ──
            if (existingIdx >= 0) {
                card.tableRequests[existingIdx].status = 'pending';
                card.tableRequests[existingIdx].assignedWaiter = null;
                card.tableRequests[existingIdx].claimedAt = null;
                card.markModified('tableRequests');
                await card.save();
            }

            // ── 4. Edit Message Back to Original ──
            const currentText = callbackQuery.message?.text || '';
            const originalLines = currentText.split('\n').filter(line => !line.includes('الطلب في عهدة'));
            const updatedText = originalLines.join('\n').trim();

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

            const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
            await fetch(editUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: callbackQuery.message?.chat?.id,
                    message_id: callbackQuery.message?.message_id,
                    text: updatedText,
                    parse_mode: 'HTML',
                    reply_markup: replyMarkup
                })
            });
        }

        // ── Asynchronously update Live Dashboard ──
        const { updateLiveTelegramDashboard } = require('../../../../lib/telegramDashboard');
        // Do not await to avoid blocking webhook response unnecessarily
        updateLiveTelegramDashboard(restaurantId).catch(console.error);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[POST /api/waiter/webhook]', error);
        // Return 200 OK even on error to stop Telegram from retrying the failing webhook infinitely
        return NextResponse.json({ ok: true });
    }
}
