import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Group from '../../../../backend/models/Group';
import Card from '../../../../backend/models/Card';
import { isSuperAdmin } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/groups
 * ─────────────────────
 * List all partner groups (super admin only).
 */
export async function GET(req) {
    if (!isSuperAdmin(req)) return NextResponse.json({ error: 'غير مصرح.' }, { status: 403 });

    try {
        await connectDB();
        const groups = await Group.find({}).sort({ createdAt: -1 }).lean();

        // Don't expose hashed PIN
        const safe = groups.map(({ partnerPin, ...g }) => g);
        return NextResponse.json({ success: true, groups: safe });
    } catch (err) {
        console.error('[/api/admin/groups GET]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}

/**
 * POST /api/admin/groups
 * ──────────────────────
 * Create a new partner group.
 * Body: { name, pin (4-8 digits), assignedCards[], notes? }
 */
export async function POST(req) {
    if (!isSuperAdmin(req)) return NextResponse.json({ error: 'غير مصرح.' }, { status: 403 });

    try {
        await connectDB();
        const { name, pin, assignedCards = [], notes = '' } = await req.json();

        if (!name || !pin) return NextResponse.json({ error: 'الاسم و PIN مطلوبان.' }, { status: 400 });
        if (!/^\d{4,8}$/.test(String(pin))) {
            return NextResponse.json({ error: 'PIN يجب أن يكون 4-8 أرقام.' }, { status: 400 });
        }

        // Validate assigned cards exist
        if (assignedCards.length > 0) {
            const found = await Card.countDocuments({ shortCode: { $in: assignedCards } });
            if (found !== assignedCards.length) {
                return NextResponse.json({ error: 'بعض رموز البطاقات غير موجودة.' }, { status: 400 });
            }
        }

        const hashed = await bcrypt.hash(String(pin), 10);
        const group = await Group.create({
            name:          name.trim().slice(0, 100),
            partnerPin:    hashed,
            pinLength:     String(pin).length,
            assignedCards: [...new Set(assignedCards)],
            notes:         notes.slice(0, 500),
        });

        return NextResponse.json({
            success: true,
            group:   { _id: group._id, name: group.name, assignedCards: group.assignedCards },
        }, { status: 201 });
    } catch (err) {
        console.error('[/api/admin/groups POST]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}
