import { NextResponse } from 'next/server';
import connectDB from '../../../../../backend/config/db';
import Card from '../../../../../backend/models/Card';

export const dynamic = 'force-dynamic';

// POST /api/analytics/view  — زيادة عداد الزيارات الكلية
export async function POST(req) {
    try {
        const body = await req.json();
        const { cardId } = body;

        if (!cardId) {
            return NextResponse.json({ error: 'cardId required' }, { status: 400 });
        }

        await connectDB();

        const updated = await Card.findOneAndUpdate(
            { shortCode: cardId },
            { $inc: { totalViews: 1 } },
            { new: true, select: 'totalViews scanCount' }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            totalViews: updated.totalViews,
            scanCount: updated.scanCount
        });
    } catch (err) {
        console.error('[analytics/view] Error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
