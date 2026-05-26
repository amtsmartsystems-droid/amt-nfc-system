import { NextResponse } from 'next/server';
import connectDB from '../../../backend/config/db';
import Card from '../../../backend/models/Card';
import { rateLimit } from '../../../lib/rateLimit';

// ── POST /api/clicks ─────────────────────────────────────────────────
// 30 clicks per minute per IP — prevents fake analytics inflation
export async function POST(req) {
    const { allowed, retryAfter } = rateLimit(req, { limit: 30, windowMs: 60_000, prefix: 'clicks' });
    if (!allowed) {
        return NextResponse.json(
            { error: 'طلبات كثيرة جداً' },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    try {
        await connectDB();
        const { cardId, linkId } = await req.json();

        if (!cardId || linkId === undefined) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Validate inputs — no injection possible with these checks
        if (typeof cardId !== 'string' || !/^[a-zA-Z0-9_-]{1,50}$/.test(cardId)) {
            return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
        }

        const card = await Card.findOne({ shortCode: cardId });

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        let updated = false;
        if (card.links?.length > 0) {
            const linkIndex = card.links.findIndex(l => l.id === linkId || l._id?.toString() === linkId);
            if (linkIndex !== -1) {
                if (card.links[linkIndex].clicks === undefined) card.links[linkIndex].clicks = 0;
                card.links[linkIndex].clicks += 1;
                updated = true;
            }
        }

        if (card.siteData?.links) {
            const sdLinkIndex = card.siteData.links.findIndex(l => l.id === linkId);
            if (sdLinkIndex !== -1) {
                if (card.siteData.links[sdLinkIndex].clicks === undefined) card.siteData.links[sdLinkIndex].clicks = 0;
                card.siteData.links[sdLinkIndex].clicks += 1;
                updated = true;
                card.markModified('siteData');
            }
        }

        if (updated) await card.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
