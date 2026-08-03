import { NextResponse } from 'next/server';
import connectDB from '../../../../../backend/config/db';
import Card from '../../../../../backend/models/Card';

export async function POST(req) {
    try {
        await connectDB();
        
        const { batchName, count, startingId } = await req.json();

        if (!batchName || !count || count < 1 || count > 100 || !startingId) {
            return NextResponse.json({ error: 'Invalid batch parameters' }, { status: 400 });
        }

        const startId = parseInt(startingId);
        if (isNaN(startId) || startId < 1) {
            return NextResponse.json({ error: 'Invalid starting ID' }, { status: 400 });
        }

        const newCards = [];
        for (let i = 0; i < count; i++) {
            const shortCode = (startId + i).toString();
            
            // Check for collision (this will slow down if many collisions, but is necessary)
            const existing = await Card.findOne({ shortCode });
            if (existing) {
                return NextResponse.json({ error: `الرقم ${shortCode} محجوز مسبقاً لبطاقة أخرى. يرجى اختيار رقم بداية مختلف.` }, { status: 400 });
            }

            const batchSerial = i + 1;
            
            newCards.push({
                shortCode,
                cardType: 'restaurant',
                businessName: `${batchName} #${batchSerial}`,
                siteData: {
                    name: `${batchName} #${batchSerial}`,
                    subtitle: '',
                    about: '',
                    aboutAr: '',
                    links: []
                },
                batchName,
                isBatch: true,
                batchSerial: batchSerial
            });
        }

        await Card.insertMany(newCards);

        return NextResponse.json({ 
            success: true, 
            message: `تم إنشاء ${count} بطاقات بنجاح!` 
        });
    } catch (error) {
        console.error('Master Hub Batch Create Error:', error);
        return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
    }
}
