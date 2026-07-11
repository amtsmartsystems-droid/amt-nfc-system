import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../backend/config/db';
import Card from '../../../backend/models/Card';

const SCAN_SECRET = process.env.JWT_SECRET || 'amt_smart_waiter_super_secret';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        
        // Allow fallback between "r"/"restaurantId" and "t"/"tableNumber"
        const restaurantId = searchParams.get('restaurantId') || searchParams.get('r');
        const tableNumber = searchParams.get('tableNumber') || searchParams.get('t');

        if (!restaurantId || !tableNumber) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const payload = {
            restaurantId,
            tableNumber,
            createdAt: Date.now()
        };

        // --- SMART RESET LOGIC ---
        await connectDB();
        const card = await Card.findOneAndUpdate({ shortCode: restaurantId }, { $inc: { scanCount: 1 } }, { new: true });
        if (card) {
            let tableReq = (card.tableRequests || []).find(t => t.tableNumber === tableNumber);
            const now = Date.now();
            let needsSave = false;

            if (!tableReq) {
                // Brand new table record
                if ((card.tableRequests || []).length < 300) {
                    tableReq = {
                        tableNumber,
                        status: 'idle',
                        sessionId: Math.random().toString(36).substring(2, 15),
                        calls: [],
                        sessionExpiresAt: new Date(now + 7200000) // 2 Hours
                    };
                    card.tableRequests.push(tableReq);
                    needsSave = true;
                }
            } else {
                // Table exists, check if expired
                const sessionExpiresAtMs = tableReq.sessionExpiresAt ? new Date(tableReq.sessionExpiresAt).getTime() : 0;
                if (sessionExpiresAtMs < now) {
                    // Session Expired -> Brand new customer -> Wipe state
                    tableReq.status = 'idle';
                    tableReq.sessionId = Math.random().toString(36).substring(2, 15);
                    tableReq.calls = [];
                    tableReq.sessionExpiresAt = new Date(now + 7200000); // 2 Hours
                    needsSave = true;
                } else {
                    // Session Active -> Do nothing (keep existing requests alive)
                    // We only renew it during active service requests, but we could optionally renew here too.
                }
            }

            if (needsSave) {
                card.markModified('tableRequests');
                await card.save();
                
                // Asynchronously update dashboard
                const { updateLiveTelegramDashboard } = require('../../../lib/telegramDashboard');
                updateLiveTelegramDashboard(restaurantId).catch(console.error);
            }
        }
        // -------------------------

        const scanToken = jwt.sign(payload, SCAN_SECRET, { expiresIn: '2m' });
        
        // Redirect to the frontend menu page with the ephemeral token
        const redirectUrl = new URL(`/${restaurantId}?table=${tableNumber}&auth=nfc&token=${scanToken}`, req.url);
        
        return NextResponse.redirect(redirectUrl, 302);
    } catch (error) {
        console.error('[GET /api/scan]', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
