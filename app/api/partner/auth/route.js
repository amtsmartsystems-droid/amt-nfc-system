import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import Group from '../../../../backend/models/Group';
import { signToken } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/partner/auth
 * ─────────────────────
 * Partner login with groupId + PIN.
 * Returns JWT in httpOnly cookie.
 *
 * Body: { groupId, pin }
 */
export async function POST(req) {
    try {
        await connectDB();
        const { groupId, pin } = await req.json();

        if (!groupId || !pin) {
            return NextResponse.json({ error: 'groupId و pin مطلوبان.' }, { status: 400 });
        }

        const group = await Group.findById(groupId);
        if (!group || !group.isActive) {
            return NextResponse.json({ error: 'مجموعة غير موجودة أو غير نشطة.' }, { status: 404 });
        }

        const valid = await bcrypt.compare(String(pin), group.partnerPin);
        if (!valid) {
            return NextResponse.json({ error: 'PIN غير صحيح.' }, { status: 401 });
        }

        const token = signToken({
            role:    'Partner',
            groupId: String(group._id),
            name:    group.name,
        }, '30d');

        const response = NextResponse.json({
            success:      true,
            groupId:      String(group._id),
            name:         group.name,
            assignedCards: group.assignedCards,
        });

        response.cookies.set({
            name:     'amt_partner_token',
            value:    token,
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path:     '/',
            maxAge:   60 * 60 * 24 * 30, // 30 days
        });

        return response;
    } catch (err) {
        console.error('[/api/partner/auth]', err);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}

/**
 * DELETE /api/partner/auth  — Logout
 */
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set({ name: 'amt_partner_token', value: '', maxAge: 0, path: '/' });
    return response;
}
