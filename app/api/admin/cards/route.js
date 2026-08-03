import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';
import { headers } from 'next/headers';

export async function GET(req) {
    try {
        headers();
        await connectDB();
        
        // Fetch all created cards, sorting newest first
        const cards = await Card.find({})
            .select('_id shortCode cardType businessName siteData.name createdAt batchName isBatch batchSerial isMerged mergeStart mergeEnd')
            .sort({ createdAt: -1 })
            .lean();

        // Map data for the preview grid
        const formattedCards = cards.map(card => ({
            _id: card._id,
            cardId: card.shortCode, // The custom 123 identifier
            cardType: card.cardType || 'restaurant', // e.g. Restaurant, Business
            title: card.businessName || card.siteData?.name || `Card ${card.shortCode}`,
            createdAt: card.createdAt,
            batchName: card.batchName,
            isBatch: card.isBatch,
            batchSerial: card.batchSerial,
            isMerged: card.isMerged,
            mergeStart: card.mergeStart,
            mergeEnd: card.mergeEnd
        }));

        return NextResponse.json(formattedCards);
    } catch (error) {
        console.error('Master Hub Fetch Cards Error:', error);
        return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        
        // Generate a random 6 digit shortcode for the new card
        const shortCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        const newCard = new Card({
            shortCode,
            cardType: 'restaurant',
            businessName: 'New Restaurant',
            siteData: {
                name: 'New Restaurant',
                subtitle: '',
                about: '',
                aboutAr: '',
                links: []
            }
        });

        await newCard.save();

        return NextResponse.json({ 
            success: true, 
            cardId: newCard.shortCode,
            message: 'Blank card created successfully!' 
        });
    } catch (error) {
        console.error('Master Hub Create Card Error:', error);
        return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const connectDB = (await import('../../../../backend/config/db')).default;
        const Card = (await import('../../../../backend/models/Card')).default;
        await connectDB();
        const url = new URL(req.url);
        
        const idsParam = url.searchParams.get('ids');
        if (idsParam) {
            const idsArray = idsParam.split(',');
            await Card.deleteMany({ _id: { $in: idsArray } });
            return new Response(JSON.stringify({ success: true, deletedCount: idsArray.length }));
        }

        const id = url.searchParams.get('id');
        if (!id) return new Response(JSON.stringify({ error: 'ID or IDs are required' }), { status: 400 });
        
        await Card.findByIdAndDelete(id);
        return new Response(JSON.stringify({ success: true }));
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
    }
}
