import * as LucideIcons from "lucide-react";

// ══════════════════════════════════════════════════════════════════════
//  SMART ICON ENGINE — lucide-react only (no brand icons)
//  All icon names verified to exist in lucide-react
// ══════════════════════════════════════════════════════════════════════

const RULES = [
  // Social — use generic equivalents (brand icons removed from lucide-react)
  { kw: ["instagram","انستا","انستغرام","ig"],              icon:"Camera",        color:"#E1306C", bg:"#fce4ec" },
  { kw: ["whatsapp","واتس","واتساب"],                        icon:"MessageCircle", color:"#25D366", bg:"#e8f5e9" },
  { kw: ["telegram","تيليغرام","تيليجرام","تلغرام"],         icon:"Send",          color:"#229ED9", bg:"#e3f2fd" },
  { kw: ["tiktok","تيك توك","تيك"],                          icon:"Music2",        color:"#010101", bg:"#f0f0f0" },
  { kw: ["facebook","فيسبوك","fb","فيس"],                    icon:"Globe",         color:"#1877F2", bg:"#e8f0fe" },
  { kw: ["twitter","تويتر","tweet","x.com"],                 icon:"MessageSquare", color:"#1DA1F2", bg:"#e8f4fd" },
  { kw: ["youtube","يوتيوب","yt"],                           icon:"Play",          color:"#FF0000", bg:"#ffebee" },
  { kw: ["snapchat","سناب","snap"],                          icon:"Aperture",      color:"#FFCC00", bg:"#fffde7" },
  { kw: ["linkedin","لينكدإن","لينكد"],                      icon:"Briefcase",     color:"#0A66C2", bg:"#e8f0fe" },
  { kw: ["threads","ثريدز"],                                 icon:"AtSign",        color:"#000000", bg:"#f5f5f5" },

  // Food & Restaurant
  { kw: ["menu","منيو","قائمة","قائمه","food","طعام"],       icon:"Utensils",      color:"#F59E0B", bg:"#fff8e1" },
  { kw: ["reserve","reservation","حجز","احجز","table"],      icon:"CalendarDays",  color:"#8B5CF6", bg:"#ede9fe" },
  { kw: ["order","اطلب","طلب","delivery","توصيل"],           icon:"ShoppingBag",   color:"#10B981", bg:"#d1fae5" },
  { kw: ["offer","discount","خصم","عرض","promo"],             icon:"Tag",           color:"#EC4899", bg:"#fce7f3" },
  { kw: ["cake","كيك","pastry","حلويات","bakery","مخبوزات"], icon:"CakeSlice",     color:"#F97316", bg:"#fff7ed" },
  { kw: ["coffee","قهوة","كافيه","cafe","espresso"],          icon:"Coffee",        color:"#6B4226", bg:"#efebe9" },

  // Contact & Location
  { kw: ["location","موقع","خريطة","map","directions","اتجاهات","لوكيشن"], icon:"MapPin", color:"#EF4444", bg:"#fee2e2" },
  { kw: ["phone","call","هاتف","اتصل","اتصال","تلفون"],      icon:"Phone",         color:"#3B82F6", bg:"#dbeafe" },
  { kw: ["email","mail","بريد","إيميل","ايميل"],              icon:"Mail",          color:"#6366F1", bg:"#ede9fe" },
  { kw: ["website","site","موقع الكتروني","web"],             icon:"Globe",         color:"#0EA5E9", bg:"#e0f2fe" },

  // Commerce
  { kw: ["shop","store","متجر","محل","buy","شراء","merch"],   icon:"ShoppingCart",  color:"#F97316", bg:"#fff7ed" },
  { kw: ["review","rating","تقييم","stars"],                  icon:"Star",          color:"#F59E0B", bg:"#fff8e1" },
  { kw: ["pdf","catalog","catalogue","كتالوج"],               icon:"FileText",      color:"#64748B", bg:"#f1f5f9" },
  { kw: ["about","عنا","من نحن"],                             icon:"Info",          color:"#6B7280", bg:"#F3F4F6" },
];

const FALLBACK = { icon:"Link2", color:"#6B7280", bg:"#F3F4F6" };

/**
 * getIconForLink(title: string)
 * Returns { IconComponent, iconName, color, bg }
 */
export function getIconForLink(title = "") {
  const lower = title.toLowerCase();
  for (const rule of RULES) {
    if (rule.kw.some((k) => lower.includes(k.toLowerCase()))) {
      const IconComponent = LucideIcons[rule.icon] || LucideIcons.Link2;
      return { IconComponent, iconName: rule.icon, color: rule.color, bg: rule.bg };
    }
  }
  return {
    IconComponent: LucideIcons.Link2,
    iconName: "Link2",
    color: FALLBACK.color,
    bg: FALLBACK.bg,
  };
}
