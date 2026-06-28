import { NextResponse }   from 'next/server';
import connectDB          from '../../../../../backend/config/db';
import Card               from '../../../../../backend/models/Card';
import { getUser }        from '../../../../../lib/auth';
import { sanitizeString } from '../../../../../lib/sanitize';

export const dynamic = 'force-dynamic';

// ── GET /api/cards/[cardId]/mappings ─────────────────────────────────
// Returns the cardMappings array for a given card
export async function GET(req, { params }) {
    const user = getUser(req);
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    try {
        await connectDB();
        const card = await Card.findOne({ shortCode: params.cardId }).select('cardMappings shortCode');
        if (!card) return NextResponse.json({ error: 'البطاقة غير موجودة' }, { status: 404 });

        return NextResponse.json({ cardMappings: card.cardMappings || [] });
    } catch (e) {
        return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 });
    }
}

// ── PUT /api/cards/[cardId]/mappings ─────────────────────────────────
// Upserts a single card mapping: {cardNumber, destinationUrl, label}
// Only updates that one numbered card; all others remain untouched.
export async function PUT(req, { params }) {
    const user = getUser(req);
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    try {
        await connectDB();
        const { cardId } = params;

        // Validate cardId format
        if (!/^[a-zA-Z0-9_-]{1,50}$/.test(cardId)) {
            return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
        }

        const card = await Card.findOne({ shortCode: cardId });
        if (!card) return NextResponse.json({ error: 'البطاقة غير موجودة' }, { status: 404 });

        // Tenant isolation: Restaurant_Owner can only edit their own card
        if (user.role === 'Restaurant_Owner' && user.tenantId !== cardId) {
            return NextResponse.json({ error: 'ممنوع' }, { status: 403 });
        }

        const body = await req.json();
        const cardNumber     = parseInt(body.cardNumber);
        const destinationUrl = sanitizeString(body.destinationUrl || '', 500);
        const label          = sanitizeString(body.label || '', 100);

        if (!cardNumber || isNaN(cardNumber) || cardNumber < 1) {
            return NextResponse.json({ error: 'رقم البطاقة غير صالح' }, { status: 400 });
        }
        if (!destinationUrl) {
            return NextResponse.json({ error: 'رابط الوجهة مطلوب' }, { status: 400 });
        }

        // Upsert: find existing mapping for this cardNumber and update,
        // or push a new one if not found
        const existingIndex = (card.cardMappings || []).findIndex(m => m.cardNumber === cardNumber);

        if (existingIndex >= 0) {
            card.cardMappings[existingIndex].destinationUrl = destinationUrl;
            card.cardMappings[existingIndex].label          = label;
        } else {
            card.cardMappings = [
                ...(card.cardMappings || []),
                { cardNumber, destinationUrl, label }
            ];
        }

        card.markModified('cardMappings');
        await card.save();

        return NextResponse.json({
            success: true,
            message: `✅ تم حفظ رابط البطاقة رقم ${cardNumber} بنجاح`,
            cardMappings: card.cardMappings,
        });
    } catch (e) {
        console.error('[PUT /mappings]', e);
        return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 });
    }
}

// ── DELETE /api/cards/[cardId]/mappings?cardNumber=N ─────────────────
// Removes a single mapping by cardNumber
export async function DELETE(req, { params }) {
    const user = getUser(req);
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    try {
        await connectDB();
        const { cardId } = params;
        const url = new URL(req.url);
        const cardNumber = parseInt(url.searchParams.get('cardNumber'));

        if (!cardNumber || isNaN(cardNumber)) {
            return NextResponse.json({ error: 'رقم البطاقة مطلوب' }, { status: 400 });
        }

        const card = await Card.findOne({ shortCode: cardId });
        if (!card) return NextResponse.json({ error: 'البطاقة غير موجودة' }, { status: 404 });

        if (user.role === 'Restaurant_Owner' && user.tenantId !== cardId) {
            return NextResponse.json({ error: 'ممنوع' }, { status: 403 });
        }

        card.cardMappings = (card.cardMappings || []).filter(m => m.cardNumber !== cardNumber);
        card.markModified('cardMappings');
        await card.save();

        return NextResponse.json({ success: true, message: `تم حذف البطاقة رقم ${cardNumber}` });
    } catch (e) {
        return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 });
    }
}
