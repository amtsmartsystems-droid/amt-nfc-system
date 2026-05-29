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

export default async function PublicCardPage({ params }) {
    await connectDB();
    const { cardId } = params;
    
    // جلب بيانات البطاقة من قاعدة البيانات
    const card = await Card.findOne({ shortCode: cardId });
    
    // التحقق من وجود البطاقة وحالتها
    if (!card) {
        return notFound();
    }
    
    // Serialize data to match API response so SWR fallback works perfectly
    const serializedCard = {
        shortCode:    card.shortCode,
        cardType:     card.cardType || 'restaurant',
        themeName:    card.themeName,
        businessName: card.businessName,
        primaryColor: card.primaryColor,
        background:   card.background,
        siteData:  JSON.parse(JSON.stringify(card.siteData  || {})),
        links:     JSON.parse(JSON.stringify(card.links     || [])),
        events:    JSON.parse(JSON.stringify(card.events    || [])),
        isLocked:  card.isLocked,
        isWaiterEnabled: card.telegramConfig?.isEnabled === true,
    };
    
    return <ClientCardViewer initialCard={serializedCard} cardId={cardId} />;
}
