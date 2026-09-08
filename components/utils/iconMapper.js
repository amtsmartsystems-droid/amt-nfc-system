import * as LucideIcons from "lucide-react";
import React from "react";

// ══════════════════════════════════════════════════════════════════════
//  SMART ICON MAPPER — Matches text to the best UI/Brand icon
// ══════════════════════════════════════════════════════════════════════

const BrandIcons = {
  Facebook: ({ size = 24, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  Instagram: ({ size = 24, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  WhatsApp: ({ size = 24, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  Twitter: ({ size = 24, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Youtube: ({ size = 24, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M21.582 6.186a2.67 2.67 0 0 0-1.884-1.884C17.986 3.84 12 3.84 12 3.84s-5.986 0-7.698.462a2.67 2.67 0 0 0-1.884 1.884C1.956 7.898 1.956 12 1.956 12s0 4.102.462 5.814a2.67 2.67 0 0 0 1.884 1.884C5.986 20.16 12 20.16 12 20.16s5.986 0 7.698-.462a2.67 2.67 0 0 0 1.884-1.884C22.044 16.102 22.044 12 22.044 12s0-4.102-.462-5.814zM9.912 15.228V8.772L15.36 12l-5.448 3.228z"/>
    </svg>
  ),
  Linkedin: ({ size = 24, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  Snapchat: ({ size = 24, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.025 1.701c-3.136 0-5.71 2.378-5.83 5.485-.022.569.043 1.15.198 1.716.425 1.543 1.554 2.87 2.38 4.257.268.452.336.985.3 1.512-.045.658-.335 1.258-.8 1.728a4.93 4.93 0 0 1-1.65.986c-.534.195-1.077.388-1.618.575a3.84 3.84 0 0 0-2.316 2.016 1.127 1.127 0 0 0-.015.938 1.134 1.134 0 0 0 .848.647 16.89 16.89 0 0 0 3.731.393c.17 0 .341.002.51.018a1.325 1.325 0 0 0 1.233-.51 2.977 2.977 0 0 1 1.743-1.096c.376-.08.761-.13 1.14-.149a4.81 4.81 0 0 1 1.91.318c.277.106.568.175.862.247a1.442 1.442 0 0 0 1.371-.408c.307-.32.493-.765.488-1.22-.008-.667-.32-1.3-.807-1.745a5.454 5.454 0 0 0-1.802-.996c-.533-.19-1.077-.384-1.619-.571a3.834 3.834 0 0 1-2.288-1.996c-.347-.732-.42-1.554-.255-2.335.253-1.218.995-2.274 1.597-3.344.498-.888.75-1.921.688-2.956-.12-2.92-2.584-5.185-5.553-5.088h-.024z"/>
    </svg>
  ),
  Tiktok: ({ size = 24, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.95v7.4c-.01 1.94-.8 3.83-2.19 5.2-1.39 1.37-3.31 2.14-5.26 2.15-1.95.01-3.87-.76-5.26-2.14-1.39-1.38-2.17-3.28-2.18-5.23-.01-1.95.76-3.86 2.14-5.25 1.38-1.38 3.28-2.16 5.23-2.17h.3v4.03c-1.12.02-2.19.49-2.97 1.29-.78.8-1.22 1.88-1.22 3.01s.44 2.21 1.22 3.01c.78.8 1.85 1.27 2.97 1.29 1.12.02 2.2-.45 2.98-1.25.79-.8 1.24-1.89 1.25-3.02V.02h-1.09z"/>
    </svg>
  )
};

const ICON_MAP = [
  // ── Social Media & Messaging ──
  { keywords: ["whatsapp","واتس","واتساب"],                    icon: "WhatsApp",      color: "#25D366", bg: "rgba(37,211,102,0.1)", isBrand: true },
  { keywords: ["instagram","انستا","انستقرام","ig"],          icon: "Instagram",     color: "#E1306C", bg: "rgba(225,48,108,0.1)", isBrand: true },
  { keywords: ["facebook","فيسبوك","فيس","fb"],               icon: "Facebook",      color: "#1877F2", bg: "rgba(24,119,242,0.1)", isBrand: true },
  { keywords: ["twitter","تويتر","x.com","x"],                icon: "Twitter",       color: "#1DA1F2", bg: "rgba(29,161,242,0.1)", isBrand: true },
  { keywords: ["tiktok","تيك توك","تيك"],                     icon: "Tiktok",        color: "#010101", bg: "rgba(1,1,1,0.1)",      isBrand: true },
  { keywords: ["youtube","يوتيوب","yt"],                      icon: "Youtube",       color: "#FF0000", bg: "rgba(255,0,0,0.1)",    isBrand: true },
  { keywords: ["snapchat","سناب","snap"],                     icon: "Snapchat",      color: "#FFCC00", bg: "rgba(255,204,0,0.1)",  isBrand: true },
  { keywords: ["linkedin","لينكدإن","لينكد"],                 icon: "Linkedin",      color: "#0A66C2", bg: "rgba(10,102,194,0.1)", isBrand: true },
  { keywords: ["telegram","تيليغرام","تلغرام","تيليجرام"],    icon: "Send",          color: "#229ED9", bg: "rgba(34,158,217,0.1)" },
  
  // ── Communication & Contact ──
  { keywords: ["phone","هاتف","اتصال","جوال","call","mobile"],icon: "PhoneCall",     color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  { keywords: ["email","mail","بريد","إيميل","ايميل"],         icon: "Mail",          color: "#6366F1", bg: "rgba(99,102,241,0.1)" },
  { keywords: ["website","موقع","web","site","رابط"],         icon: "Globe",         color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { keywords: ["save", "contact", "حفظ", "جهة اتصال", "vcard"],icon:"UserPlus",       color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  
  // ── Maps & Location ──
  { keywords: ["location","موقع","خريطة","map","directions","اتجاهات","لوكيشن"], icon: "MapPin", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  { keywords: ["google maps", "خرائط", "جوجل ماب"],           icon: "Map",           color: "#34A853", bg: "rgba(52,168,83,0.1)" },

  // ── Food & Restaurant Specific ──
  { keywords: ["menu","منيو","قائمة","قائمه","food","طعام"],   icon: "Utensils",      color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { keywords: ["reserve","reservation","حجز","احجز","table"],  icon: "CalendarDays",  color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  { keywords: ["order","اطلب","طلب","delivery","توصيل"],       icon: "ShoppingBag",   color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  { keywords: ["offer","discount","خصم","عرض","promo"],         icon: "Tag",           color: "#EC4899", bg: "rgba(236,72,153,0.1)" },
  { keywords: ["cake","كيك","pastry","حلويات","bakery","مخبوزات"], icon: "CakeSlice",     color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  { keywords: ["coffee","قهوة","كافيه","cafe","espresso"],      icon: "Coffee",        color: "#6B4226", bg: "rgba(107,66,38,0.1)" },
  { keywords: ["drink","مشروب","juice","عصير","beverage"],      icon: "CupSoda",       color: "#06B6D4", bg: "rgba(6,182,212,0.1)" },
  { keywords: ["chef","شيف","طاهي"],                            icon: "ChefHat",       color: "#475569", bg: "rgba(71,85,105,0.1)" },

  // ── Commerce & Business ──
  { keywords: ["shop","store","متجر","محل","buy","شراء"],      icon: "ShoppingCart",  color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  { keywords: ["review","rating","تقييم","stars","رأيك"],      icon: "Star",          color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { keywords: ["pdf","catalog","catalogue","كتالوج","ملف"],    icon: "FileText",      color: "#64748B", bg: "rgba(100,116,139,0.1)" },
  { keywords: ["about","عنا","من نحن","معلومات"],              icon: "Info",          color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  { keywords: ["faq","أسئلة","استفسارات","help","مساعدة"],     icon: "HelpCircle",    color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  { keywords: ["portfolio","معرض","أعمال","gallery","صور"],     icon: "Image",         color: "#14B8A6", bg: "rgba(20,184,166,0.1)" },
  { keywords: ["video","فيديو","مقطع"],                         icon: "Video",         color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  { keywords: ["music","موسيقى","صوت","audio"],                 icon: "Music",         color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  { keywords: ["payment","دفع","pay","سداد"],                   icon: "CreditCard",    color: "#10B981", bg: "rgba(16,185,129,0.1)" },
];

// ── Default fallback ──
const DEFAULT_ICON = { icon: "ArrowLeft", color: "#6B7280", bg: "#F3F4F6" };

/**
 * getIconForLink(title: string) → { IconComponent, color, bg, iconName }
 * Analyzes the link title and returns the best matching icon automatically.
 */
export function getIconForLink(title = "") {
  const lower = title.toLowerCase().trim();

  for (const entry of ICON_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      const IconComponent = entry.isBrand ? BrandIcons[entry.icon] : (LucideIcons[entry.icon] || LucideIcons.Link2);
      return {
        IconComponent,
        iconName: entry.icon,
        color: entry.color,
        bg: entry.bg,
      };
    }
  }

  // Fallback if no match
  return {
    IconComponent: LucideIcons.Link2,
    iconName: "Link2",
    color: "#6B7280",
    bg: "rgba(107,114,128,0.1)",
  };
}
