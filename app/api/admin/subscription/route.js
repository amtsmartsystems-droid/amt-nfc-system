import { NextResponse } from 'next/server';
import { getUser }      from '../../../../lib/auth';
import { rateLimit }    from '../../../../lib/rateLimit';
import connectDB        from '../../../../backend/config/db';
import Card             from '../../../../backend/models/Card';

/**
 * POST /api/admin/subscription
 * ─────────────────────────────
 * Super_Admin only.
 * Activate or suspend a restaurant's subscription.
 *
 * Body: { cardId: string, action: 'activate' | 'suspend' }
 */
export async function POST(req) {
    // Rate limit
    const { allowed } = rateLimit(req, { limit: 30, windowMs: 60_000, prefix: 'admin-sub' });
    if (!allowed) {
        return NextResponse.json({ error: 'طلبات كثيرة.' }, { status: 429 });
    }

    // Auth — Super_Admin only
    const user = getUser(req);
    if (!user || user.role !== 'Super_Admin') {
        return NextResponse.json({ error: 'غير مصرح. هذه الميزة للمدير العام فقط.' }, { status: 403 });
    }

    try {
        await connectDB();
        const { cardId, action } = await req.json();

        if (!cardId || !['activate', 'suspend'].includes(action)) {
            return NextResponse.json(
                { error: 'حقول مطلوبة: cardId و action (activate | suspend).' },
                { status: 400 }
            );
        }

        const card = await Card.findOne({ shortCode: cardId });
        if (!card) {
            return NextResponse.json({ error: `بطاقة غير موجودة: ${cardId}` }, { status: 404 });
        }

        // Toggle subscription
        if (action === 'suspend') {
            card.subscriptionStatus = 'suspended';
            card.allowEditing       = false;
        } else {
            card.subscriptionStatus = 'active';
            card.allowEditing       = true;
        }

        await card.save();

        return NextResponse.json({
            success:            true,
            cardId,
            subscriptionStatus: card.subscriptionStatus,
            allowEditing:       card.allowEditing,
            message:            action === 'suspend'
                ? `✅ تم تعليق اشتراك ${cardId} بنجاح.`
                : `✅ تم تفعيل اشتراك ${cardId} بنجاح.`,
        });
    } catch (error) {
        console.error('[/api/admin/subscription]', error.message);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}

/**
 * GET /api/admin/subscription
 * ────────────────────────────
 * Super_Admin only — list all cards with their subscription status.
 */
export async function GET(req) {
    const user = getUser(req);
    if (!user || user.role !== 'Super_Admin') {
        return NextResponse.json({ error: 'غير مصرح.' }, { status: 403 });
    }

    try {
        await connectDB();
        const cards = await Card.find(
            {},
            { shortCode: 1, businessName: 1, subscriptionStatus: 1, allowEditing: 1, updatedAt: 1 }
        ).sort({ updatedAt: -1 });

        return NextResponse.json({ cards });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}
