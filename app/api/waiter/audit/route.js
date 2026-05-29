import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

export async function POST(req) {
    try {
        const body = await req.json();
        const { restaurantId, tableNumber, answer } = body;

        if (!restaurantId || !tableNumber || !['yes', 'no'].includes(answer)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: restaurantId });

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        const tableReq = card.tableRequests?.find(t => t.tableNumber === tableNumber);
        if (!tableReq) {
            return NextResponse.json({ error: 'Table session not found' }, { status: 404 });
        }

        tableReq.clientAuditStatus = answer;
        card.markModified('tableRequests');
        await card.save();

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('[POST /api/waiter/audit]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
