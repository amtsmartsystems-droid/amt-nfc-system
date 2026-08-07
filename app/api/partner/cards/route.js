import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Card from '../../../../backend/models/Card';
import Group from '../../../../backend/models/Group';
import { verifyToken } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

function getPartner(req) {
    const token = req.cookies.get('amt_partner_token')?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'Partner') return null;
    return decoded;
}

/**
 * GET /api/partner/cards
 * ──────────────────────
 * Returns all cards assigned to the authenticated partner's group.
 */
export async function GET(req) {
    const partner = getPartner(req);
    if (!partner) {
        return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
    }

    try {
        await connectDB();

        const group = await Group.findById(partner.groupId);
        if (!group || !group.isActive) {
            return NextResponse.json({ error: 'المجموعة غير موجودة.' }, { status: 404 });
        }

        const cards = await Card.find(
            { shortCode: { $in: group.assignedCards } },
            { shortCode: 1, businessName: 1, primaryColor: 1, themeName: 1,
              cardType: 1, 'siteData.name': 1, 'siteData.nameAr': 1,
              'siteData.subtitle': 1, 'siteData.images': 1, links: 1,
              subscriptionStatus: 1, allowEditing: 1, totalViews: 1 }
        ).lean();

        // Strip large base64 images from list view
        const safeCards = cards.map(c => {
            if (c.siteData?.images) {
                const imgs = {};
                for (const [k, v] of Object.entries(c.siteData.images)) {
                    imgs[k] = v?.startsWith('data:') ? `/api/cards/${c.shortCode}/image/${k}` : v;
                }
                c.siteData = { ...c.siteData, images: imgs };
            }
            return c;
        });

        return NextResponse.json({ 
            success: true, 
            cards: safeCards, 
            groupName: group.name,
            subgroups: group.subgroups || []
        });
    } catch (err) {
        console.error('[/api/partner/cards GET]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}
