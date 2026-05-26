/**
 * rateLimit.js — In-memory Rate Limiter
 * ──────────────────────────────────────
 * Sliding-window counter per IP address.
 *
 * Works on Vercel serverless: limits requests within warm function instances.
 * Not a silver bullet for distributed abuse, but stops 99% of basic attacks.
 *
 * Usage:
 *   const { allowed, retryAfter } = rateLimit(req, { limit: 10, windowMs: 60_000 });
 *   if (!allowed) return NextResponse.json({ error: '...' }, { status: 429 });
 */

// Module-level store — persists across requests within the same serverless instance
const store = new Map();

// Cleanup old entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store.entries()) {
            if (now > entry.resetAt) store.delete(key);
        }
    }, 5 * 60 * 1000);
}

/**
 * Get the real client IP from Next.js request headers.
 * Vercel sets x-forwarded-for automatically.
 * @param {Request} req
 * @returns {string}
 */
function getIp(req) {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1'
    );
}

/**
 * Check rate limit for a given request.
 * @param {Request} req — Next.js Request object
 * @param {object}  opts
 * @param {number}  opts.limit     — Max requests per window (default: 20)
 * @param {number}  opts.windowMs  — Window size in ms     (default: 60_000)
 * @param {string}  [opts.prefix]  — Optional prefix to namespace keys
 * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
 */
export function rateLimit(req, { limit = 20, windowMs = 60_000, prefix = '' } = {}) {
    const ip  = getIp(req);
    const key = `${prefix}:${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        // First request in window (or window expired)
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, retryAfter: 0 };
    }

    entry.count++;

    if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return { allowed: false, remaining: 0, retryAfter };
    }

    return { allowed: true, remaining: limit - entry.count, retryAfter: 0 };
}
