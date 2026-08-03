import { NextResponse } from 'next/server';
import connectDB from '../../../../../backend/config/db';
import Card from '../../../../../backend/models/Card';

export async function POST(req) {
    try {
        await connectDB();
        
        const { batchName, startSerial, endSerial } = await req.json();

        if (!batchName || !startSerial || !endSerial || startSerial >= endSerial) {
            return NextResponse.json({ error: 'Invalid merge parameters' }, { status: 400 });
        }

        // 1. Find all cards in this range
        const cardsToMerge = await Card.find({
            batchName: batchName,
            batchSerial: { $gte: startSerial, $lte: endSerial }
        }).sort({ batchSerial: 1 });

        if (cardsToMerge.length === 0) {
            return NextResponse.json({ error: 'No cards found in this range' }, { status: 404 });
        }

        // 2. The first card becomes the "Merged Card"
        const primaryCard = cardsToMerge[0];
        primaryCard.isMerged = true;
        primaryCard.mergeStart = startSerial;
        primaryCard.mergeEnd = endSerial;
        primaryCard.businessName = `${batchName} (${startSerial}-${endSerial})`;
        await primaryCard.save();

        // 3. Delete the rest, because the NFC tags will just be programmed with primaryCard.shortCode
        const idsToDelete = cardsToMerge.slice(1).map(c => c._id);
        if (idsToDelete.length > 0) {
            await Card.deleteMany({ _id: { $in: idsToDelete } });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'تم دمج البطاقات بنجاح!' 
        });
    } catch (error) {
        console.error('Master Hub Merge Error:', error);
        return NextResponse.json({ error: 'Failed to merge cards' }, { status: 500 });
    }
}
