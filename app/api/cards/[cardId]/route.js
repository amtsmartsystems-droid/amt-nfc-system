import { NextResponse }      from 'next/server';
import connectDB             from '../../../../backend/config/db';
import Card                  from '../../../../backend/models/Card';
import { rateLimit }         from '../../../../lib/rateLimit';
import { getUser }           from '../../../../lib/auth';
import { sanitizeString, sanitizeColor, sanitizeSiteData } from '../../../../lib/sanitize';

// ── GET /api/cards/[cardId] ──────────────────────────────────────────
export async function GET(req, { params }) {
    const { allowed, retryAfter } = rateLimit(req, { limit: 60, windowMs: 60_000, prefix: 'get-card' });
    if (!allowed) {
        return NextResponse.json(
            { error: 'طلبات كثيرة جداً، حاول بعد قليل.' },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    try {
        await connectDB();
        const { cardId } = params;

        if (!/^[a-zA-Z0-9_-]{1,50}$/.test(cardId)) {
            return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
        }

        const card = await Card.findOne({ shortCode: cardId });
        if (!card) return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        if (card.isLocked) return NextResponse.json({ error: 'مقفلة', isLocked: true }, { status: 403 });

        const user = getUser(req);

        return NextResponse.json({
            cardType:           card.cardType   || 'restaurant',   // ← NEW
            themeName:          card.themeName,
            businessName:       card.businessName,
            primaryColor:       card.primaryColor,
            background:         card.background,
            siteData:           card.siteData,
            links:              card.links,
            events:             card.events,
            isLocked:           card.isLocked,
            wifi:               card.wifi || { ssid: '', password: '' },
            // Subscription info — for admin dashboard UI lock
            subscriptionStatus: card.subscriptionStatus,
            allowEditing:       card.allowEditing,
            telegramConfig:     card.telegramConfig || { botToken: '', chatId: '', isEnabled: false },
            isWaiterEnabled:    card.telegramConfig?.isEnabled === true,
            tableMapping:       card.tableMapping || [],
        });
    } catch (error) {
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}

// ── PUT /api/cards/[cardId] ──────────────────────────────────────────
export async function PUT(req, { params }) {
    const { allowed, retryAfter } = rateLimit(req, { limit: 20, windowMs: 60_000, prefix: 'put-card' });
    if (!allowed) {
        return NextResponse.json(
            { error: 'طلبات كثيرة جداً، حاول بعد قليل.' },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    // ── 1. Authentication ─────────────────────────────────────────
    const user = getUser(req);
    if (!user) {
        return NextResponse.json({ error: 'غير مصرح. سجّل الدخول أولاً.' }, { status: 401 });
    }

    try {
        await connectDB();
        const { cardId } = params;

        if (!/^[a-zA-Z0-9_-]{1,50}$/.test(cardId)) {
            return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
        }

        const card = await Card.findOne({ shortCode: cardId });
        if (!card) {
            // Super_Admin can create new cards; Restaurant_Owner cannot
            if (user.role !== 'Super_Admin') {
                return NextResponse.json({ error: 'غير مصرح بإنشاء بطاقات جديدة.' }, { status: 403 });
            }
        }

        // ── 2. Tenant Isolation ────────────────────────────────────
        if (user.role === 'Restaurant_Owner') {
            if (!user.tenantId || user.tenantId !== cardId) {
                return NextResponse.json(
                    { error: 'ممنوع. لا يمكنك تعديل بطاقة لا تملكها.' },
                    { status: 403 }
                );
            }
        }

        // ── 3. Subscription Gate ───────────────────────────────────
        // Super_Admin can always bypass this check
        if (user.role !== 'Super_Admin' && card) {
            if (card.subscriptionStatus === 'suspended' || card.allowEditing === false) {
                return NextResponse.json(
                    { error: 'Editing disabled due to subscription status. يرجى التواصل مع الإدارة لتفعيل الحساب.' },
                    { status: 403 }
                );
            }
        }

        // ── 4. XSS Sanitize ───────────────────────────────────────
        const body = await req.json();

        const cleanSiteData = body.siteData ? sanitizeSiteData(body.siteData) : undefined;
        const cleanTheme    = body.themeName    ? sanitizeString(body.themeName,    50)  : undefined;
        const cleanCardType = body.cardType && ['restaurant','business_card'].includes(body.cardType)
            ? body.cardType : undefined;                                    // ← NEW
        const cleanPrimary  = body.primaryColor ? sanitizeColor(body.primaryColor)       : undefined;
        const cleanBg       = body.background   ? sanitizeColor(body.background)         : undefined;
        const cleanWifi     = body.wifi
            ? { ssid: sanitizeString(body.wifi.ssid || '', 100), password: sanitizeString(body.wifi.password || '', 100) }
            : undefined;
        const cleanTelegram = body.telegramConfig
            ? {
                botToken:  sanitizeString(body.telegramConfig.botToken || '', 200),
                chatId:    sanitizeString(body.telegramConfig.chatId || '', 100),
                isEnabled: Boolean(body.telegramConfig.isEnabled)
              }
            : undefined;
        const cleanTableMapping = body.tableMapping !== undefined
            ? (Array.isArray(body.tableMapping) ? body.tableMapping.map(t => ({
                tagId: sanitizeString(t.tagId || '', 100),
                tableName: sanitizeString(t.tableName || '', 100)
              })).filter(t => t.tagId && t.tableName) : [])
            : undefined;

        // ── 5. Save ────────────────────────────────────────────────
        if (!card) {
            // Create (Super_Admin only, already checked above)
            const newCard = new Card({
                shortCode:    cardId,
                cardType:     cleanCardType  || 'restaurant',          // ← NEW
                themeName:    cleanTheme    || 'luxury',
                businessName: cleanSiteData?.name || cleanSiteData?.nameAr || 'New Business',
                primaryColor: cleanPrimary  || '#D4AF37',
                background:   cleanBg       || '#111111',
                siteData:     cleanSiteData || {},
                links:        cleanSiteData?.links  || [],
                events:       cleanSiteData?.events || [],
                isLocked:     false,
                tableMapping: cleanTableMapping || [],
            });
            await newCard.save();
            return NextResponse.json({ success: true, card: newCard });
        }

        if (cleanTheme)              card.themeName    = cleanTheme;
        if (cleanCardType)           card.cardType     = cleanCardType;   // ← NEW
        if (cleanPrimary)            card.primaryColor = cleanPrimary;
        if (cleanBg)                 card.background   = cleanBg;
        if (cleanWifi !== undefined) card.wifi         = cleanWifi;
        if (cleanTelegram !== undefined) card.telegramConfig = cleanTelegram;
        if (cleanTableMapping !== undefined) card.tableMapping = cleanTableMapping;
        if (cleanSiteData) {
            card.siteData     = cleanSiteData;
            card.markModified('siteData');
            card.businessName = cleanSiteData.name || cleanSiteData.nameAr || card.businessName;
            card.links        = cleanSiteData.links  || card.links;
            card.events       = cleanSiteData.events || card.events;
        }

        await card.save();
        return NextResponse.json({ success: true, card });

    } catch (error) {
        console.error('[PUT /api/cards]', error.message);
        return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
    }
}
