import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

export async function POST(req) {
    try {
        const { cardId } = await req.json();
        
        if (!cardId) {
            return NextResponse.json({ error: 'Card ID required' }, { status: 400 });
        }

        await connectDB();
        
        // Increment total views in background
        await Card.findOneAndUpdate(
            { shortCode: cardId },
            { $inc: { totalViews: 1 } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics View Error:', error);
        return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
    }
}
