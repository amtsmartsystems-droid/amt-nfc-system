import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
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
 * POST /api/partner/subgroups
 * Create a new subgroup (folder) and add cards to it.
 * Body: { name: string, cardIds: string[] }
 */
export async function POST(req) {
    const partner = getPartner(req);
    if (!partner) return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });

    try {
        const { name, cardIds = [] } = await req.json();
        if (!name) return NextResponse.json({ error: 'اسم المجموعة مطلوب.' }, { status: 400 });

        await connectDB();
        
        const group = await Group.findById(partner.groupId);
        if (!group) return NextResponse.json({ error: 'المجموعة غير موجودة.' }, { status: 404 });

        // Ensure all cardIds actually belong to this partner
        const validCards = cardIds.filter(id => group.assignedCards.includes(id));

        const newSubgroup = {
            id: Date.now().toString(),
            name,
            cards: validCards
        };

        // Remove these cards from any existing subgroup first to prevent duplicates
        if (group.subgroups && group.subgroups.length > 0) {
            group.subgroups.forEach(sg => {
                sg.cards = sg.cards.filter(id => !validCards.includes(id));
            });
        } else {
            group.subgroups = [];
        }

        group.subgroups.push(newSubgroup);
        await group.save();

        return NextResponse.json({ success: true, subgroups: group.subgroups });
    } catch (err) {
        console.error('[/api/partner/subgroups POST]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}

/**
 * PATCH /api/partner/subgroups
 * Update subgroups (rename, move cards, delete)
 * Body: { action: 'rename'|'add_cards'|'remove_cards'|'delete_group', subgroupId?: string, targetSubgroupId?: string, name?: string, cardIds?: string[] }
 */
export async function PATCH(req) {
    const partner = getPartner(req);
    if (!partner) return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });

    try {
        const { action, subgroupId, targetSubgroupId, name, cardIds = [] } = await req.json();
        await connectDB();

        const group = await Group.findById(partner.groupId);
        if (!group) return NextResponse.json({ error: 'المجموعة غير موجودة.' }, { status: 404 });

        if (!group.subgroups) group.subgroups = [];

        // Ensure valid cards
        const validCards = cardIds.filter(id => group.assignedCards.includes(id));

        if (action === 'rename') {
            if (!subgroupId || !name) return NextResponse.json({ error: 'بيانات غير مكتملة.' }, { status: 400 });
            const sg = group.subgroups.find(s => s.id === subgroupId);
            if (sg) sg.name = name;
        } 
        else if (action === 'delete_group') {
            if (!subgroupId) return NextResponse.json({ error: 'بيانات غير مكتملة.' }, { status: 400 });
            group.subgroups = group.subgroups.filter(s => s.id !== subgroupId);
        }
        else if (action === 'move_cards') {
            // Remove from all existing subgroups first
            group.subgroups.forEach(sg => {
                sg.cards = sg.cards.filter(id => !validCards.includes(id));
            });
            // If moving to a target subgroup, add them there
            if (targetSubgroupId) {
                const target = group.subgroups.find(s => s.id === targetSubgroupId);
                if (target) {
                    target.cards.push(...validCards);
                    // Deduplicate just in case
                    target.cards = [...new Set(target.cards)];
                }
            }
        }
        else {
            return NextResponse.json({ error: 'إجراء غير معروف.' }, { status: 400 });
        }

        await group.save();
        return NextResponse.json({ success: true, subgroups: group.subgroups });
    } catch (err) {
        console.error('[/api/partner/subgroups PATCH]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}
