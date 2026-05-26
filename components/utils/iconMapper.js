import * as LucideIcons from "lucide-react";

// ══════════════════════════════════════════════════════════════════════
// SMART ICON MAPPER — Taplink-style automatic icon detection
// Usage: const { Icon, color } = getIconForLink("instagram")
// ══════════════════════════════════════════════════════════════════════

const ICON_MAP = [
  // ── Social Media ──
  {
    keywords: ["instagram", "انستا", "انستغرام", "insta", "ig"],
    icon: "Instagram",
    color: "#E1306C",
    bg: "#fce4ec",
  },
  {
    keywords: ["whatsapp", "واتس", "واتساب", "whats"],
    icon: "MessageCircle",
    color: "#25D366",
    bg: "#e8f5e9",
  },
  {
    keywords: ["telegram", "تيليغرام", "تيليجرام", "تيلجرام", "تلغرام"],
    icon: "Send",
    color: "#2AABEE",
    bg: "#e3f2fd",
  },
  {
    keywords: ["tiktok", "تيك توك", "تيك", "tik tok"],
    icon: "Music2",
    color: "#010101",
    bg: "#f5f5f5",
  },
  {
    keywords: ["facebook", "فيسبوك", "fb", "فيس"],
    icon: "Facebook",
    color: "#1877F2",
    bg: "#e8f0fe",
  },
  {
    keywords: ["twitter", "تويتر", "x ", "X"],
    icon: "Twitter",
    color: "#1DA1F2",
    bg: "#e8f4fd",
  },
  {
    keywords: ["youtube", "يوتيوب", "yt", "يوتيب"],
    icon: "Youtube",
    color: "#FF0000",
    bg: "#ffebee",
  },
  {
    keywords: ["snapchat", "سناب", "snap"],
    icon: "Camera",
    color: "#FFFC00",
    bg: "#fffde7",
  },
  {
    keywords: ["linkedin", "لينكدإن", "لينكد"],
    icon: "Linkedin",
    color: "#0A66C2",
    bg: "#e8f0fe",
  },

  // ── Food & Restaurant ──
  {
    keywords: ["menu", "منيو", "قائمة", "قائمه", "food", "طعام", "أكل", "اكل"],
    icon: "Utensils",
    color: "#F59E0B",
    bg: "#fff8e1",
  },
  {
    keywords: ["reserve", "reservation", "booking", "حجز", "احجز", "حجزi", "table"],
    icon: "CalendarDays",
    color: "#8B5CF6",
    bg: "#ede9fe",
  },
  {
    keywords: ["order", "اطلب", "طلب", "delivery", "توصيل", "توصل"],
    icon: "ShoppingBag",
    color: "#10B981",
    bg: "#d1fae5",
  },

  // ── Contact & Location ──
  {
    keywords: ["location", "موقع", "خريطة", "خريطه", "map", "directions", "الاتجاهات", "اتجاهات"],
    icon: "MapPin",
    color: "#EF4444",
    bg: "#fee2e2",
  },
  {
    keywords: ["phone", "call", "هاتف", "اتصل", "اتصال", "تلفون", "جوال"],
    icon: "Phone",
    color: "#3B82F6",
    bg: "#dbeafe",
  },
  {
    keywords: ["email", "mail", "بريد", "إيميل", "ايميل", "email"],
    icon: "Mail",
    color: "#6366F1",
    bg: "#ede9fe",
  },
  {
    keywords: ["website", "site", "موقع الكتروني", "الموقع", "web", "سايت"],
    icon: "Globe",
    color: "#0EA5E9",
    bg: "#e0f2fe",
  },

  // ── Commerce ──
  {
    keywords: ["shop", "store", "متجر", "محل", "buy", "شراء", "اشتري"],
    icon: "ShoppingCart",
    color: "#F97316",
    bg: "#fff7ed",
  },
  {
    keywords: ["offer", "discount", "عرض", "خصم", "تخفيض", "promo"],
    icon: "Tag",
    color: "#EC4899",
    bg: "#fce7f3",
  },
  {
    keywords: ["rating", "review", "تقييم", "تقييمات", "star", "نجوم"],
    icon: "Star",
    color: "#F59E0B",
    bg: "#fff8e1",
  },
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
      const IconComponent = LucideIcons[entry.icon] || LucideIcons.Link2;
      return {
        IconComponent,
        iconName: entry.icon,
        color: entry.color,
        bg: entry.bg,
      };
    }
  }

  const IconComponent = LucideIcons[DEFAULT_ICON.icon] || LucideIcons.Link2;
  return {
    IconComponent,
    iconName: DEFAULT_ICON.icon,
    color: DEFAULT_ICON.color,
    bg: DEFAULT_ICON.bg,
  };
}

/**
 * Renders a Lucide icon dynamically by name (string).
 */
export function DynamicIcon({ name, size = 20, className = "", color }) {
  const Comp = LucideIcons[name] || LucideIcons.Link2;
  return <Comp size={size} className={className} color={color} />;
}
