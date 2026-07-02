import connectDB from '../../backend/config/db';
import Card from '../../backend/models/Card';
import { notFound } from 'next/navigation';
import ClientCardViewer from './ClientCardViewer';

export const dynamic = 'force-dynamic'; // Always fetch fresh from MongoDB on every request

export async function generateMetadata({ params }) {
    await connectDB();
    const card = await Card.findOne({ shortCode: params.cardId });
    if (!card) return { title: 'Not Found' };

    // ── AMT Business Card — branded metadata ──
    if (card.cardType === 'business_card') {
        return {
            title: 'AMT Tech Solutions — نظام المنيو الذكي وبطاقات NFC',
            description: 'نؤتمت مطعمك ونحوّل طاولاتك إلى نقاط بيع ذكية. برمجة وتوريد بطاقات NFC للمطاعم والكافيهات.',
            openGraph: {
                title: 'AMT Tech Solutions',
                description: 'نؤتمت مطعمك ونحوّل طاولاتك إلى نقاط بيع ذكية 🚀',
                images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'],
            },
        };
    }

    // ── Restaurant / Cafe card ──
    const siteData = card.siteData || {};
    const title = siteData.name || siteData.nameAr || card.businessName || 'AMT Smart Card';
    const description = siteData.subtitle || siteData.subtitleAr || siteData.about || 'View this business card';

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop'],
        }
    };
}

export default async function PublicCardPage({ params, searchParams }) {
    await connectDB();
    const { cardId } = params;
    
    // جلب بيانات البطاقة من قاعدة البيانات
    const card = await Card.findOne({ shortCode: cardId });
    
    // التحقق من وجود البطاقة وحالتها
    if (!card) {
        return notFound();
    }
    
    // Safe serializer: strips Mongoose internals, base64 blobs, and prevents call stack overflow
    function safeJSON(val) {
        if (!val) return val;
        return JSON.parse(JSON.stringify(val));
    }

    const sd = safeJSON(card.siteData || {});
    if (sd.images) {
        for (const key in sd.images) {
            const url = sd.images[key];
            if (url && url.startsWith('data:')) {
                sd.images[key] = `/api/cards/${cardId}/image/${key}`;
            }
        }
    }
    if (sd.layoutBlocks) {
        sd.layoutBlocks = sd.layoutBlocks.map(({ url, ...rest }) =>
            (url && url.startsWith('data:'))
                ? { ...rest, imageUrl: `/api/cards/${cardId}/image/${rest.id}` }
                : { url, ...rest }
        );
    }
    if (sd.floatingImages) {
        sd.floatingImages = sd.floatingImages.map(({ url, ...rest }) =>
            (url && url.startsWith('data:'))
                ? { ...rest, imageUrl: `/api/cards/${cardId}/image/${rest.id}` }
                : { url, ...rest }
        );
    }

    const serializedCard = {
        shortCode:       String(card.shortCode || ''),
        cardType:        String(card.cardType  || 'restaurant'),
        themeName:       String(card.themeName || ''),
        businessName:    String(card.businessName || ''),
        primaryColor:    String(card.primaryColor || '#EDD98A'),
        background:      String(card.background   || ''),
        siteData:        sd,
        links:           safeJSON(card.links  || []),
        events:          safeJSON(card.events || []),
        telegramConfig:  safeJSON(card.telegramConfig  || { botToken:'', chatId:'', isEnabled: false }),
        isWaiterEnabled: card.telegramConfig?.isEnabled === true,
        tableMapping:    safeJSON(card.tableMapping || []),
        isMenuEnabled:   card.isMenuEnabled  || false,
        menuMode:        String(card.menuMode || 'interactive'),
        pdfMenuUrl:      String(card.pdfMenuUrl || ''),
        menuCategories:  safeJSON(card.menuCategories || []),
        cliqConfig:      safeJSON(card.cliqConfig || { isEnabled:false, alias:'', message:'' }),
        hasShisha:       card.hasShisha || false,
        cardMappings:    safeJSON(card.cardMappings || []),
    };

    // ══════════════════════════════════════════════════════════════
    // SERVER-SIDE ROUTING — Apply ?card=N or ?wa= override here
    // This runs BEFORE the client gets the data, so SWR cannot
    // overwrite it on first render. Most reliable approach.
    // ══════════════════════════════════════════════════════════════
    const applyServerRouting = () => {
        // ── Merge links using siteData.links as the Source of Truth ──
        const sdLinks = sd.links || [];
        const dbLinks = serializedCard.links || [];
        
        let effectiveLinks = sdLinks.map(sdLink => {
            const dbLink = dbLinks.find(l => String(l.id) === String(sdLink.id));
            if (dbLink && dbLink.clicks > (sdLink.clicks || 0)) {
                return { ...sdLink, clicks: dbLink.clicks };
            }
            return sdLink;
        });

        // Add any dbLinks that aren't in sdLinks
        dbLinks.forEach(dbLink => {
            if (!effectiveLinks.find(m => String(m.id) === String(dbLink.id))) {
                effectiveLinks.push({ ...dbLink });
            }
        });

        if (effectiveLinks.length === 0) return;

        let overrideUrl = null;

        // ?card=N or ?table=N  → look up destination in cardMappings
        const cardParam = searchParams?.card || searchParams?.table;
        if (cardParam) {
            const cardNum = parseInt(cardParam);
            if (!isNaN(cardNum)) {
                const mapping = (card.cardMappings || []).find(
                    m => Number(m.cardNumber) === cardNum
                );
                if (mapping?.destinationUrl) {
                    overrideUrl = mapping.destinationUrl;
                }
            }
        }

        // ?wa=  → direct number override (lower priority than ?card=)
        if (!overrideUrl && searchParams?.wa) {
            const rawWa = String(searchParams.wa).replace(/[^0-9]/g, '');
            if (rawWa) overrideUrl = `https://wa.me/${rawWa}`;
        }

        if (!overrideUrl) return;

        const patchedLinks = effectiveLinks.map(lk => {
            const titleStr = `${lk.title || ''} ${lk.titleAr || ''}`.toLowerCase();
            const urlStr   = (lk.url || '').toLowerCase();
            const isWaLink = titleStr.includes('whatsapp') || titleStr.includes('واتساب') || urlStr.includes('wa.me');
            
            // If it's the WhatsApp link, override its URL
            if (isWaLink) return { ...lk, url: overrideUrl };
            return lk;
        });

        // Patch both links arrays so nothing can overwrite them
        serializedCard.links    = patchedLinks;
        serializedCard.siteData = { ...serializedCard.siteData, links: patchedLinks };
    };

    applyServerRouting();

    return <ClientCardViewer initialCard={serializedCard} cardId={cardId} searchParams={searchParams} />;
}
