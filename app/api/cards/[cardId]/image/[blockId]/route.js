import { NextResponse } from 'next/server';
import connectDB from '../../../../../../backend/config/db';
import Card from '../../../../../../backend/models/Card';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cards/[cardId]/image/[blockId]
 * Returns a specific image block's base64 data as a proper image response.
 * This avoids embedding huge base64 strings in SSR/SWR JSON payloads.
 */
export async function GET(req, { params }) {
    try {
        const { cardId, blockId } = params;

        if (!/^[a-zA-Z0-9_-]{1,50}$/.test(cardId)) {
            return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 });
        }

        await connectDB();
        const card = await Card.findOne({ shortCode: cardId }, { 'siteData.layoutBlocks': 1, 'siteData.floatingImages': 1, 'siteData.images': 1 });
        if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Search for the block in layoutBlocks and floatingImages
        const allBlocks = [
            ...(card.siteData?.layoutBlocks || []),
            ...(card.siteData?.floatingImages || []),
        ];
        const block = allBlocks.find(b => String(b.id) === String(blockId));

        let targetUrl = null;
        if (block && block.url) {
            targetUrl = block.url;
        } else if (card.siteData?.images && card.siteData.images[blockId]) {
            targetUrl = card.siteData.images[blockId];
        }

        if (!targetUrl || !targetUrl.startsWith('data:')) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Parse the data URL: data:<mime>;base64,<data>
        const [header, base64Data] = targetUrl.split(',');
        const mimeMatch = header.match(/data:([^;]+);base64/);
        if (!mimeMatch || !base64Data) {
            return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
        }

        const mimeType = mimeMatch[1];
        const buffer = Buffer.from(base64Data, 'base64');

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Image fetch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
