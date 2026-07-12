import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const body = await req.json();
        const { cardId } = body;
        
        console.log('[Analytics] POST /api/analytics/view - cardId:', cardId);
        
        if (!cardId) {
            console.error('[Analytics] Missing cardId in request body');
            return NextResponse.json({ error: 'Card ID required' }, { status: 400 });
        }

        await connectDB();
        
        // Increment total views and return updated value
        const updated = await Card.findOneAndUpdate(
            { shortCode: cardId },
            { $inc: { totalViews: 1 } },
            { new: true, select: 'totalViews' }
        );

        if (!updated) {
            console.error('[Analytics] Card not found:', cardId);
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        console.log('[Analytics] Updated totalViews to:', updated.totalViews, 'for card:', cardId);
        return NextResponse.json({ success: true, totalViews: updated.totalViews });
    } catch (error) {
        console.error('[Analytics] View Error:', error);
        return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
    }
}
