import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

const JWT_SECRET = process.env.JWT_SECRET || 'amt_smart_waiter_super_secret';
const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 mins

export async function POST(req) {
    try {
        const body = await req.json();
        const { restaurantId, tableNumber } = body;

        if (!restaurantId || !tableNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        if (!card.tableRequests) {
            card.tableRequests = [];
        }

        let tableReq = card.tableRequests.find(t => t.tableNumber === tableNumber);
        const now = Date.now();
        let needsSave = false;

        if (!tableReq) {
            // New table session
            tableReq = {
                tableNumber,
                status: 'active',
                sessionId: Math.random().toString(36).substring(2, 15),
                calls: [],
                sessionExpiresAt: new Date(now + SESSION_DURATION_MS)
            };
            card.tableRequests.push(tableReq);
            needsSave = true;
        } else {
            // Forcefully clear the old session and start a new 10-minute session
            tableReq.status = 'active';
            tableReq.sessionId = Math.random().toString(36).substring(2, 15);
            tableReq.calls = [];
            tableReq.sessionExpiresAt = new Date(now + SESSION_DURATION_MS);
            needsSave = true;
        }

        if (needsSave) {
            // CRITICAL: Mark the array as modified so Mongoose saves the nested changes!
            card.markModified('tableRequests');
            await card.save();
        }

        // Generate JWT
        const tokenPayload = {
            restaurantId,
            tableNumber,
            sessionId: tableReq.sessionId
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '2h' });

        const response = NextResponse.json({ 
            success: true, 
            message: 'Session active',
            sessionExpiresAt: tableReq.sessionExpiresAt,
            expiresInMs: SESSION_DURATION_MS,
            status: tableReq.status
        });

        response.cookies.set({
            name: 'waiter_session',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 120 * 60, // 2 hours
            sameSite: 'strict',
        });

        if (needsSave) {
            // Asynchronously update Live Dashboard since state changed
            const { updateLiveTelegramDashboard } = require('../../../../lib/telegramDashboard');
            updateLiveTelegramDashboard(restaurantId).catch(console.error);
        }

        return response;

    } catch (error) {
        console.error('[POST /api/waiter/session]', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
