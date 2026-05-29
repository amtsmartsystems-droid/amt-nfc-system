import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

export async function POST(req) {
    try {
        const body = await req.json();

        // ── Security Check: Verify Telegram Secret Token ──
        const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
        if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
            console.error('[Webhook] Unauthorized: Invalid secret token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!body.callback_query) {
            return NextResponse.json({ ok: true });
        }

        const callbackQuery = body.callback_query;
        const data = callbackQuery.data || '';

        // Match format: action_close_table_${tableNumber}_${restaurantId} OR claim_table_${tableNumber}_${restaurantId}
        const closeMatch = data.match(/^action_close_table_(.+?)_(.+)$/);
        const claimMatch = data.match(/^claim_table_(.+?)_(.+)$/);

        let isCloseAction = false;
        let isClaimAction = false;
        let tableNumber, restaurantId;

        if (closeMatch) {
            isCloseAction = true;
            tableNumber = closeMatch[1];
            restaurantId = closeMatch[2];
        } else if (claimMatch) {
            isClaimAction = true;
            tableNumber = claimMatch[1];
            restaurantId = claimMatch[2];
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
            // ── 1. Terminate Session centrally (Server-side Session Revocation) ─────
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

            // ── 2. Answer Callback Query to stop the spinning loading indicator ──
            const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
            await fetch(answerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: callbackQuery.id,
                    text: `✅ تم إغلاق جلسة الطاولة ${tableNumber} بنجاح.`,
                    show_alert: false
                })
            });

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
            // ── 1. Clear Active Calls to Reset Cooldown ─────
            if (existingIdx >= 0) {
                // Clear the calls array so the table is ready for a new request without cooldown
                card.tableRequests[existingIdx].calls = [];
                card.markModified('tableRequests');
                await card.save();
            }

            // ── 2. Extract Waiter Name ──
            const waiterName = callbackQuery.from?.first_name || 'موظف';

            // ── 3. Answer Callback Query Immediately ──
            const answerUrl = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
            await fetch(answerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callback_query_id: callbackQuery.id,
                    text: `✅ تم استلام طلب طاولة ${tableNumber} بنجاح.`,
                    show_alert: false
                })
            });

            // ── 4. Extract Original Service & Edit Message ──
            const originalText = callbackQuery.message?.text || '';
            let serviceRequested = 'نداء';
            
            // The original message has a line like: 🛎 الخدمة: 👨‍🍳 نداء للويتر
            const serviceMatch = originalText.match(/🛎\s*الخدمة:\s*(.+)/);
            if (serviceMatch) {
                serviceRequested = serviceMatch[1].trim();
            }

            // Exactly as requested: ✅ طاولة X تطلب: Y - (تم الاستلام بواسطة {waiter_name})
            const updatedText = `✅ طاولة ${tableNumber} تطلب: ${serviceRequested} - (تم الاستلام بواسطة ${waiterName})`;

            const editUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
            await fetch(editUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: callbackQuery.message?.chat?.id,
                    message_id: callbackQuery.message?.message_id,
                    text: updatedText,
                    parse_mode: 'HTML',
                    reply_markup: { inline_keyboard: [] } // Completely remove inline keyboard
                })
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[POST /api/waiter/webhook]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
