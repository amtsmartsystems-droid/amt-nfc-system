import connectDB from '../backend/config/db';
import Card from '../backend/models/Card';

/**
 * Updates the live telegram dashboard message for a given restaurant.
 * @param {string} restaurantId The shortCode of the restaurant card
 */
export async function updateLiveTelegramDashboard(restaurantId) {
    try {
        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) return;

        const telegramConfig = card.telegramConfig || {};
        if (!telegramConfig.isEnabled || !telegramConfig.botToken || !telegramConfig.chatId || !telegramConfig.dashboardMessageId) {
            return; // Dashboard not set up or disabled
        }

        const tableRequests = card.tableRequests || [];

        // Count tables with status 'active' or 'handling' (though 'handling' might not be used currently)
        const occupiedCount = tableRequests.filter(t => t.status === 'active' || t.status === 'handling').length;
        
        // Count tables with status 'closing'
        const closingCount = tableRequests.filter(t => t.status === 'closing').length;

        const totalActive = occupiedCount + closingCount;

        const timestamp = new Date().toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true,
            timeZone: 'Asia/Riyadh' // Assuming KSA time, or default
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
            console.error('[Dashboard] Error updating message:', errBody);
            // If the message was deleted by admin, we might want to clear the dashboardMessageId.
            // But we'll just ignore for now or handle gracefully.
        }

    } catch (err) {
        console.error('[Dashboard] Exception during update:', err);
    }
}
