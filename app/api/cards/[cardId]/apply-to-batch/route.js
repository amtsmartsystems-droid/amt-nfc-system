import { NextResponse } from 'next/server';
import connectDB from '../../../../../backend/config/db';
import Card from '../../../../../backend/models/Card';

export async function POST(req, { params }) {
    try {
        await connectDB();
        const { cardId } = params;

        // Find the current card to get its data and batchName
        const currentCard = await Card.findOne({ shortCode: cardId });
        if (!currentCard) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        if (!currentCard.isBatch || !currentCard.batchName) {
            return NextResponse.json({ error: 'This card is not part of a batch' }, { status: 400 });
        }

        // We only want to apply specific data to the batch, not overwrite unique things like cardId, shortCode, batchSerial
        const dataToApply = {
            cardType: currentCard.cardType,
            themeName: currentCard.themeName,
            businessName: currentCard.businessName,
            primaryColor: currentCard.primaryColor,
            background: currentCard.background,
            siteData: currentCard.siteData,
            links: currentCard.links,
            events: currentCard.events,
            isMenuEnabled: currentCard.isMenuEnabled,
            // DO NOT copy telegramConfig completely if it has unique data, 
            // but usually they share the same bot token/chat id in a restaurant scenario.
            // Assuming they want the same design/menu:
            telegramConfig: currentCard.telegramConfig
        };

        // Update all other cards in the same batch
        const result = await Card.updateMany(
            { 
                batchName: currentCard.batchName, 
                shortCode: { $ne: cardId } // Don't update self again to save write cycles
            },
            { $set: dataToApply }
        );

        return NextResponse.json({ 
            success: true, 
            message: `Applied configuration to ${result.modifiedCount} other cards in the batch.`,
            modifiedCount: result.modifiedCount 
        });

    } catch (error) {
        console.error('Apply to Batch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
