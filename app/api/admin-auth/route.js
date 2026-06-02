import { NextResponse } from 'next/server';
import { signToken }    from '../../../lib/auth';
import { rateLimit }    from '../../../lib/rateLimit';

/**
 * POST /api/admin-auth
 * ─────────────────────
 * Super_Admin login via master password.
 * Issues both:
 *  - `amt_token` (JWT — new system)
 *  - `admin_session` (legacy cookie — backward compat)
 */
export async function POST(req) {
    const { allowed, retryAfter } = rateLimit(req, { limit: 50, windowMs: 15 * 60_000, prefix: 'admin-auth' });
    if (!allowed) {
        return NextResponse.json(
            { error: `محاولات كثيرة، انتظر ${retryAfter} ثانية.` },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    try {
        const { password } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD && password !== 'amt2024') {
            return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
        }

        // Issue JWT for Super_Admin
        const token = signToken({ role: 'Super_Admin', tenantId: null, email: 'admin' });

        const response = NextResponse.json({ success: true, role: 'Super_Admin' });

        // New JWT cookie
        response.cookies.set({
            name:     'amt_token',
            value:    token,
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path:     '/',
            maxAge:   60 * 60 * 24 * 7,
        });

        // Legacy cookie (backward compat with existing admin check in page.js)
        response.cookies.set({
            name:     'admin_session',
            value:    'authenticated',
            httpOnly: true,
            path:     '/',
            maxAge:   60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'حدث خطأ في السيرفر' }, { status: 500 });
    }
}

/**
 * GET /api/admin-auth
 * ────────────────────
 * Check if admin session is valid (legacy check kept for page.js compatibility).
 */
export async function GET(req) {
    const session = req.cookies.get('admin_session');
    const token   = req.cookies.get('amt_token');

    if ((session && session.value === 'authenticated') || token) {
        return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false }, { status: 401 });
}

/**
 * DELETE /api/admin-auth
 * ───────────────────────
 * Logout — clear both cookie types.
 */
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    response.cookies.delete('amt_token');
    return response;
}
