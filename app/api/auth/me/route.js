import { NextResponse } from 'next/server';
import { getUser } from '../../../../lib/auth';

/**
 * GET /api/auth/me
 * ─────────────────
 * Returns the currently authenticated user from JWT cookie.
 */
export async function GET(req) {
    const user = getUser(req);
    if (!user) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
        authenticated: true,
        role:          user.role,
        tenantId:      user.tenantId || null,
        email:         user.email    || null,
        name:          user.name     || null,
    });
}

/**
 * DELETE /api/auth/me
 * ─────────────────────
 * Logout — clears both JWT and legacy session cookies.
 */
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('amt_token');
    response.cookies.delete('admin_session');
    return response;
}
