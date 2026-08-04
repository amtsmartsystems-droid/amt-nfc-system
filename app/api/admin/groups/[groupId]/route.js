import { NextResponse } from 'next/server';
import connectDB from '../../../../../backend/config/db';
import Group from '../../../../../backend/models/Group';
import Card from '../../../../../backend/models/Card';
import { isSuperAdmin } from '../../../../../lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/groups/[groupId]
 */
export async function GET(req, { params }) {
    if (!isSuperAdmin(req)) return NextResponse.json({ error: 'غير مصرح.' }, { status: 403 });

    try {
        await connectDB();
        const { groupId } = params;
        const group = await Group.findById(groupId).lean();
        if (!group) return NextResponse.json({ error: 'مجموعة غير موجودة.' }, { status: 404 });

        const { partnerPin, ...safe } = group;
        return NextResponse.json({ success: true, group: safe });
    } catch (err) {
        console.error('[/api/admin/groups/[groupId] GET]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/groups/[groupId]
 * Updatable: name, pin (optional), assignedCards, notes, isActive
 */
export async function PATCH(req, { params }) {
    if (!isSuperAdmin(req)) return NextResponse.json({ error: 'غير مصرح.' }, { status: 403 });

    try {
        await connectDB();
        const { groupId } = params;
        const body = await req.json();
        const update = {};

        if (typeof body.name === 'string')    update.name    = body.name.trim().slice(0, 100);
        if (typeof body.notes === 'string')   update.notes   = body.notes.slice(0, 500);
        if (typeof body.isActive === 'boolean') update.isActive = body.isActive;

        if (body.pin) {
            if (!/^\d{4,8}$/.test(String(body.pin))) {
                return NextResponse.json({ error: 'PIN يجب أن يكون 4-8 أرقام.' }, { status: 400 });
            }
            update.partnerPin = await bcrypt.hash(String(body.pin), 10);
            update.pinLength  = String(body.pin).length;
        }

        if (Array.isArray(body.assignedCards)) {
            // Validate all cards exist
            if (body.assignedCards.length > 0) {
                const found = await Card.countDocuments({ shortCode: { $in: body.assignedCards } });
                if (found !== body.assignedCards.length) {
                    return NextResponse.json({ error: 'بعض رموز البطاقات غير موجودة.' }, { status: 400 });
                }
            }
            update.assignedCards = [...new Set(body.assignedCards)];
        }

        const group = await Group.findByIdAndUpdate(groupId, { $set: update }, { new: true }).lean();
        if (!group) return NextResponse.json({ error: 'مجموعة غير موجودة.' }, { status: 404 });

        const { partnerPin, ...safe } = group;
        return NextResponse.json({ success: true, group: safe });
    } catch (err) {
        console.error('[/api/admin/groups/[groupId] PATCH]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/groups/[groupId]
 */
export async function DELETE(req, { params }) {
    if (!isSuperAdmin(req)) return NextResponse.json({ error: 'غير مصرح.' }, { status: 403 });

    try {
        await connectDB();
        const { groupId } = params;
        await Group.findByIdAndDelete(groupId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[/api/admin/groups/[groupId] DELETE]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}
