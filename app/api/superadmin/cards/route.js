import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';

export async function GET(req) {
    try {
        await connectDB();
        
        // Fetch all cards, sorted by creation date (newest first)
        const cards = await Card.find({})
            .select('shortCode businessName siteData.name subscriptionStatus cardType createdAt scanCount')
            .sort({ createdAt: -1 })
            .lean();

        // Format for frontend
        const formattedCards = cards.map(card => ({
            _id: card._id,
            shortCode: card.shortCode,
            name: card.businessName || card.siteData?.name || card.shortCode,
            type: card.cardType,
            status: card.subscriptionStatus,
            createdAt: card.createdAt,
            scanCount: card.scanCount || 0
        }));

        return NextResponse.json(formattedCards);
    } catch (error) {
        console.error('SuperAdmin Fetch Cards Error:', error);
        return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        
        const body = await req.json();
        const { cardId, action } = body; // action: 'toggleStatus'

        if (!cardId) {
            return NextResponse.json({ error: 'Card ID required' }, { status: 400 });
        }

        const card = await Card.findById(cardId);
        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        if (action === 'toggleStatus') {
            card.subscriptionStatus = card.subscriptionStatus === 'active' ? 'suspended' : 'active';
            await card.save();
            return NextResponse.json({ 
                success: true, 
                message: 'Status toggled',
                newStatus: card.subscriptionStatus 
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('SuperAdmin Update Card Error:', error);
        return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
    }
}
