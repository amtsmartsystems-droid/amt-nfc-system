/**
 * sanitize.js — XSS Protection
 * ──────────────────────────────
 * Strips HTML tags, dangerous protocols, and event handlers from user input.
 * Safe to use on any string before saving to DB.
 */

const DANGEROUS_PROTOCOLS = /^(javascript|vbscript|file):/i;
const HTML_TAGS           = /<[^>]*>/g;
const EVENT_HANDLERS      = /\bon\w+\s*=/gi;
const NULL_BYTES           = /\0/g;

/**
 * Sanitize a single string value.
 * - Removes HTML tags
 * - Removes dangerous URL protocols
 * - Removes inline event handlers (onclick=, onerror=, etc.)
 * - Removes null bytes
 * - Trims whitespace
 * @param {any} value
 * @param {number} [maxLength=2000000] // allow large base64 strings
 * @returns {any}
 */
export function sanitizeString(value, maxLength = 2000000) {
    if (typeof value !== 'string') return value;
    let sanitized = value
        .replace(NULL_BYTES, '')
        .replace(HTML_TAGS, '')
        .replace(EVENT_HANDLERS, '')
        .replace(/javascript:/gi, '');
        
    // Only strip 'data:' if it's not an image or PDF (prevent data:text/html XSS)
    if (!/^data:(image|application)\//i.test(sanitized)) {
        sanitized = sanitized.replace(/data:/gi, '');
    }

    return sanitized.trim().slice(0, maxLength);
}

/**
 * Sanitize a URL — only allow http/https/tel/mailto/data:image.
 * Falls back to '#' if the URL is dangerous.
 * @param {string} url
 * @returns {string}
 */
export function sanitizeUrl(url) {
    if (typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (!trimmed) return '#';
    if (DANGEROUS_PROTOCOLS.test(trimmed)) return '#';
    
    // Allow data:image or data:application (PDF)
    if (/^data:(image|application)\//i.test(trimmed)) {
        return trimmed;
    }
    
    // Allow safe protocols, relative paths, and /api/ paths
    if (!/^(https?|tel|mailto|#|\/)/i.test(trimmed)) return '#';
    return trimmed.slice(0, 2000);
}

/**
 * Recursively sanitize an object/array of siteData.
 * Walks all string fields and sanitizes them.
 * @param {any} data
 * @returns {any}
 */
export function sanitizeSiteData(data) {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') return sanitizeString(data);

    if (Array.isArray(data)) return data.map(sanitizeSiteData);

    if (typeof data === 'object') {
        const clean = {};
        for (const [key, val] of Object.entries(data)) {
            // URLs get special treatment
            if (key === 'url' || key === 'href' || key === 'src') {
                clean[key] = sanitizeUrl(val);
            } else {
                clean[key] = sanitizeSiteData(val);
            }
        }
        return clean;
    }

    return data; // numbers, booleans, etc. — pass through
}

/**
 * Sanitize a hex color string. Returns fallback if invalid.
 * @param {string} color
 * @param {string} fallback
 * @returns {string}
 */
export function sanitizeColor(color, fallback = '#000000') {
    if (typeof color !== 'string') return fallback;
    const hex = color.trim();
    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) return hex;
    return fallback;
}
