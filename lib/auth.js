/**
 * lib/auth.js — JWT Utilities
 * ────────────────────────────
 * Sign, verify, and extract user from request cookies.
 */
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET && process.env.NODE_ENV === 'production') {
    console.error('[AUTH] ⚠️  JWT_SECRET is not set! Set it in Vercel environment variables.');
}
const EFFECTIVE_SECRET = SECRET || 'amt-dev-secret-change-in-production';

/**
 * Sign a JWT payload.
 * @param {{ role: string, tenantId?: string, email?: string }} payload
 * @param {string} [expiresIn='7d']
 */
export function signToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn });
}

/**
 * Verify a JWT token string.
 * @param {string} token
 * @returns {object|null} decoded payload or null if invalid
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, EFFECTIVE_SECRET);
    } catch {
        return null;
    }
}

/**
 * Extract the authenticated user from a Next.js request.
 * Checks `amt_token` JWT cookie first, then falls back to legacy `admin_session`.
 *
 * @param {Request} req
 * @returns {{ role: string, tenantId?: string, email?: string }|null}
 */
export function getUser(req) {
    // 1. Try JWT token
    const token = req.cookies.get('amt_token')?.value;
    if (token) {
        const decoded = verifyToken(token);
        if (decoded) return decoded;
    }

    // 2. Fallback: legacy admin_session cookie (backward compat)
    const session = req.cookies.get('admin_session')?.value;
    if (session === 'authenticated') {
        return { role: 'Super_Admin', tenantId: null, email: 'admin' };
    }

    return null;
}

/**
 * Check if the user is authenticated at all.
 */
export function isAuthenticated(req) {
    return getUser(req) !== null;
}

/**
 * Check if the user is a Super_Admin.
 */
export function isSuperAdmin(req) {
    const user = getUser(req);
    return user?.role === 'Super_Admin';
}
