import connectDB from '../backend/config/db';
import Card from '../backend/models/Card';

// ── Rate Limiting / Debouncing Configuration ──
const THROTTLE_MS = 5000; // Telegram allows roughly 1 msg/sec in a group, but 5 seconds is perfect for a live dashboard

// Global variables to persist across serverless warm starts
global.dashboardUpdateTimers = global.dashboardUpdateTimers || {};
global.dashboardUpdateLastRun = global.dashboardUpdateLastRun || {};

/**
 * Updates the live telegram dashboard message for a given restaurant.
 * Wrapped in a debouncer to prevent Telegram 429 Rate Limit errors.
 * @param {string} restaurantId The shortCode of the restaurant card
 */
export async function updateLiveTelegramDashboard(restaurantId) {
    const now = Date.now();
    const lastRun = global.dashboardUpdateLastRun[restaurantId] || 0;
    const timeSinceLastRun = now - lastRun;

    // Core worker function that actually queries the DB and hits the Telegram API
    const executeUpdate = async () => {
        // Mark the run time
        global.dashboardUpdateLastRun[restaurantId] = Date.now();
        
        // Clear the active timer since we are running now
        if (global.dashboardUpdateTimers[restaurantId]) {
            clearTimeout(global.dashboardUpdateTimers[restaurantId]);
            global.dashboardUpdateTimers[restaurantId] = null;
        }

        try {
            await connectDB();
            const card = await Card.findOne({ shortCode: restaurantId });

            if (!card) return;

            const telegramConfig = card.telegramConfig || {};
            if (!telegramConfig.isEnabled || !telegramConfig.botToken || !telegramConfig.chatId || !telegramConfig.dashboardMessageId) {
                return; // Dashboard not set up or disabled
            }

            const tableRequests = card.tableRequests || [];

            // Exactly as requested: Database-Driven Counts
            const occupiedCount = tableRequests.filter(t => t.status === 'active' || t.status === 'handling').length;
            const closingCount = tableRequests.filter(t => t.status === 'closing').length;
            const totalActive = occupiedCount + closingCount;

            const timestamp = new Date().toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true,
                timeZone: 'Asia/Riyadh' // Ensure KSA time globally
            });

            const dashboardText = `
📊 <b>لوحة التحكم المباشرة (Live Dashboard)</b> 📊

🟢 <b>الطاولات النشطة:</b> ${occupiedCount}
🟡 <b>بانتظار الفاتورة:</b> ${closingCount}
──────────────────
📈 <b>إجمالي الطاولات المشغولة:</b> ${totalActive}

<i>آخر تحديث: ${timestamp}</i>
            `.trim();

            const editUrl = `https://api.telegram.org/bot${telegramConfig.botToken}/editMessageText`;
            
            const res = await fetch(editUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramConfig.chatId,
                    message_id: telegramConfig.dashboardMessageId,
                    text: dashboardText,
                    parse_mode: 'HTML'
                })
            });

            if (!res.ok) {
                const errBody = await res.text();
                // 429 Too Many Requests check
                if (res.status === 429) {
                    console.warn(`[Dashboard] Rate limited by Telegram! Retrying later...`, errBody);
                } else {
                    console.error('[Dashboard] Error updating message:', errBody);
                }
            }
        } catch (err) {
            console.error('[Dashboard] Exception during update:', err);
        }
    };

    if (timeSinceLastRun >= THROTTLE_MS) {
        // Safe to execute immediately
        await executeUpdate();
    } else {
        // Throttle: schedule it to run at the next available slot to ensure the FINAL state is sent
        if (!global.dashboardUpdateTimers[restaurantId]) {
            const delay = THROTTLE_MS - timeSinceLastRun;
            global.dashboardUpdateTimers[restaurantId] = setTimeout(() => {
                executeUpdate();
            }, delay);
        }
    }
}
