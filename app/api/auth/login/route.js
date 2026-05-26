import { NextResponse } from 'next/server';
import { signToken }    from '../../../../lib/auth';
import { rateLimit }    from '../../../../lib/rateLimit';
import connectDB        from '../../../../backend/config/db';
import User             from '../../../../backend/models/User';
import bcrypt           from 'bcryptjs';

/**
 * POST /api/auth/login
 * ─────────────────────
 * Restaurant_Owner login with email + password.
 * Returns a JWT in an httpOnly cookie.
 */
export async function POST(req) {
    // 10 attempts per 15 minutes per IP — brute-force protection
    const { allowed, retryAfter } = rateLimit(req, { limit: 10, windowMs: 15 * 60_000, prefix: 'owner-login' });
    if (!allowed) {
        return NextResponse.json(
            { error: `محاولات كثيرة، انتظر ${retryAfter} ثانية.` },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان.' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !user.isActive) {
            return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return NextResponse.json({ error: 'بيانات الدخول غير صحيحة.' }, { status: 401 });
        }

        const token = signToken({
            role:     user.role,
            tenantId: user.tenantId,
            email:    user.email,
            name:     user.name,
        });

        const response = NextResponse.json({
            success:  true,
            role:     user.role,
            tenantId: user.tenantId,
            name:     user.name,
        });

        response.cookies.set({
            name:     'amt_token',
            value:    token,
            httpOnly: true,
            secure:   process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path:     '/',
            maxAge:   60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error('[/api/auth/login]', error.message);
        return NextResponse.json({ error: 'خطأ في الخادم.' }, { status: 500 });
    }
}
