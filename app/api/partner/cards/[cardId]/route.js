import { NextResponse } from 'next/server';
import connectDB from '../../../../../backend/config/db';
import Card from '../../../../../backend/models/Card';
import Group from '../../../../../backend/models/Group';
import { verifyToken } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

function getPartner(req) {
    const token = req.cookies.get('amt_partner_token')?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'Partner') return null;
    return decoded;
}

async function assertAccess(partner, cardId) {
    const group = await Group.findById(partner.groupId);
    if (!group || !group.isActive) return false;
    return group.assignedCards.includes(cardId);
}

/**
 * GET /api/partner/cards/[cardId]
 * ────────────────────────────────
 * Returns full card data for editing (partner-safe subset).
 */
export async function GET(req, { params }) {
    const partner = getPartner(req);
    if (!partner) return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });

    try {
        await connectDB();
        const { cardId } = params;

        const hasAccess = await assertAccess(partner, cardId);
        if (!hasAccess) return NextResponse.json({ error: 'لا صلاحية لهذه البطاقة.' }, { status: 403 });

        const card = await Card.findOne({ shortCode: cardId }).lean();
        if (!card) return NextResponse.json({ error: 'بطاقة غير موجودة.' }, { status: 404 });

        // Safe images
        const siteData = card.siteData ? { ...card.siteData } : {};
        if (siteData.images) {
            const imgs = {};
            for (const [k, v] of Object.entries(siteData.images)) {
                imgs[k] = v?.startsWith('data:') ? `/api/cards/${cardId}/image/${k}` : v;
            }
            siteData.images = imgs;
        }

        return NextResponse.json({
            success: true,
            card: {
                shortCode:    card.shortCode,
                businessName: card.businessName,
                primaryColor: card.primaryColor,
                themeName:    card.themeName,
                cardType:     card.cardType,
                siteData,
                links:        card.links || [],
                allowEditing: card.allowEditing,
                subscriptionStatus: card.subscriptionStatus,
            }
        });
    } catch (err) {
        console.error('[/api/partner/cards/[cardId] GET]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}

/**
 * PATCH /api/partner/cards/[cardId]
 * ────────────────────────────────────
 * Allows partner to update ONLY: businessName, siteData.name/nameAr,
 * siteData.subtitle/subtitleAr, siteData.about/aboutAr, siteData.address,
 * siteData.hours, links[], siteData.images.profile (uploaded separately).
 */
export async function PATCH(req, { params }) {
    const partner = getPartner(req);
    if (!partner) return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });

    try {
        await connectDB();
        const { cardId } = params;

        const hasAccess = await assertAccess(partner, cardId);
        if (!hasAccess) return NextResponse.json({ error: 'لا صلاحية لهذه البطاقة.' }, { status: 403 });

        const card = await Card.findOne({ shortCode: cardId });
        if (!card) return NextResponse.json({ error: 'بطاقة غير موجودة.' }, { status: 404 });

        if (!card.allowEditing || card.subscriptionStatus !== 'active') {
            return NextResponse.json({ error: 'التعديل معطّل لهذه البطاقة.' }, { status: 403 });
        }

        const body = await req.json();

        // ── Whitelist: only allow safe partner-editable fields ──
        const update = {};
        const sd = card.siteData ? { ...card.siteData } : {};

        if (typeof body.businessName === 'string')     update.businessName     = body.businessName.slice(0, 100);
        if (typeof body.name    === 'string')           sd.name                 = body.name.slice(0, 100);
        if (typeof body.nameAr  === 'string')           sd.nameAr               = body.nameAr.slice(0, 100);
        if (typeof body.subtitle === 'string')          sd.subtitle             = body.subtitle.slice(0, 200);
        if (typeof body.subtitleAr === 'string')        sd.subtitleAr           = body.subtitleAr.slice(0, 200);
        if (typeof body.about === 'string')             sd.about                = body.about.slice(0, 500);
        if (typeof body.aboutAr === 'string')           sd.aboutAr              = body.aboutAr.slice(0, 500);
        if (typeof body.address === 'string')           sd.address              = body.address.slice(0, 200);
        if (typeof body.hours === 'string')             sd.hours                = body.hours.slice(0, 100);

        // Links: validate each entry
        if (Array.isArray(body.links)) {
            const safeLinks = body.links
                .filter(l => l && typeof l.url === 'string')
                .map(l => ({
                    id:      l.id || Date.now() + Math.random(),
                    title:   String(l.title   || '').slice(0, 80),
                    titleAr: String(l.titleAr || '').slice(0, 80),
                    url:     String(l.url).slice(0, 500),
                    clicks:  Number(l.clicks) || 0,
                }));
            update.links    = safeLinks;
            sd.links        = safeLinks;
        }

        update.siteData = sd;
        update.updatedAt = new Date();

        await Card.updateOne({ shortCode: cardId }, { $set: update });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[/api/partner/cards/[cardId] PATCH]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}
