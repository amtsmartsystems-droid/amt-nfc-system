"use client";

import { useEffect } from "react";
import { getIconForLink } from "./utils/iconMapper";
import * as LucideIcons from "lucide-react";

// ─────────────────────────────────────────────────────────────────────
// RestaurantTheme — Meaty Story style, fully dynamic links
// Props: { siteData, siteColors, lang }
// ─────────────────────────────────────────────────────────────────────
export default function RestaurantTheme({ siteData, siteColors, lang = "en" }) {
  const primary = siteColors?.primary || "#EDD98A";
  const bgCream = siteColors?.background || "#F5EDD6";
  const isAr = lang === "ar";

  // Sync CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primary);
    document.documentElement.style.setProperty("--bg-cream", bgCream);
    const hex = primary.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty("--primary-rgb", `${r}, ${g}, ${b}`);
  }, [primary, bgCream]);

  // ── Bilingual helper ──
  const t = (en, ar) => (isAr && ar ? ar : en);

  // ── Data ──
  const name             = t(siteData?.name || "MEATY STORY", siteData?.nameAr);
  const subtitle         = t(siteData?.subtitle || "Order two burgers and get the third one for 50% off", siteData?.subtitleAr);
  const about            = t(siteData?.about || "We make food where every detail counts. We use only top-quality ingredients, follow precise cooking methods, and stay true to every flavor.", siteData?.aboutAr);
  const principlesTitle  = t(siteData?.principlesTitle || "PRINCIPLES THAT DEFINE THE TASTE", siteData?.principlesTitleAr);
  const principlesSub    = t(siteData?.principlesSubtitle || "We value precision, consistency, and respect for your time. Everything we do focuses on convenience and honest service.", siteData?.principlesSubtitleAr);
  const deliveryTitle    = t(siteData?.deliveryTitle || "DELIVERY", siteData?.deliveryTitleAr);
  const delivery         = t(siteData?.delivery || "You can order by phone or through messaging apps. Minimum order — $20.", siteData?.deliveryAr);
  const contactsTitle    = t(siteData?.contactsTitle || "CONTACTS", siteData?.contactsTitleAr);
  const address          = siteData?.address || "123 Main Street, New York";
  const hours            = siteData?.hours   || "10:00 AM — 11:00 PM";
  const links            = siteData?.links   || [];
  const principles       = siteData?.principles || [
    { num: "I",   title: "HONEST PRESENTATION", titleAr: "تقديم صادق",     desc: "The food looks exactly how it's served.",          descAr: "الطعام يبدو تماماً كما يُقدَّم — بلا مبالغة." },
    { num: "II",  title: "STREAMLINED PROCESS",  titleAr: "عملية مبسّطة",  desc: "From order to packaging — clear and minimal.",     descAr: "من الطلب للتغليف — عملية واضحة وسريعة." },
    { num: "III", title: "ON-TIME DELIVERY",     titleAr: "توصيل في وقته", desc: "We respect your time. Orders arrive on schedule.", descAr: "نحترم وقتك. الطلبات تصل في موعدها دائماً." },
  ];

  // ── Shared sub-components ──
  const SectionTitle = ({ children, center }) => (
    <h2
      className={`font-black text-[#1A1A1A] uppercase leading-tight tracking-tight mb-4 ${center ? "text-center" : ""}`}
      style={{ fontSize: "clamp(22px, 7vw, 28px)", fontFamily: "Cairo, sans-serif" }}
    >
      {children}
    </h2>
  );

  const BodyText = ({ children, center }) => (
    <p className={`text-[#555] text-[14px] leading-[1.75] ${center ? "text-center" : ""}`} style={{ fontFamily: "Cairo, sans-serif" }}>
      {children}
    </p>
  );

  // ── Dynamic Link Button (Taplink-style) ──
  const LinkButton = ({ link, index }) => {
    const label = t(link.title, link.titleAr);
    const { IconComponent, color, bg } = getIconForLink(link.title);
    const delay = `${index * 60}ms`;

    return (
      <a
        href={link.url || "#"}
        target={link.url && link.url !== "#" ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        style={{
          background: "#1C1C1C",
          color: "#FFFFFF",
          boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
          animationDelay: delay,
          fontFamily: "Cairo, sans-serif",
        }}
      >
        {/* Icon Badge */}
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: bg }}
        >
          <IconComponent size={18} color={color} />
        </div>
        {/* Label */}
        <span className="flex-1 truncate">{label}</span>
        {/* Arrow */}
        <LucideIcons.ArrowLeft
          size={16}
          color="rgba(255,255,255,0.35)"
          className={`flex-shrink-0 transition-transform duration-300 ${isAr ? "group-hover:-translate-x-1" : "group-hover:translate-x-1 rotate-180"}`}
        />
      </a>
    );
  };

  return (
    <div
      className="w-full max-w-md mx-auto bg-white overflow-hidden shadow-2xl"
      dir={isAr ? "rtl" : "ltr"}
      style={{ fontFamily: "Cairo, sans-serif" }}
    >
      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section className="relative w-full min-h-[540px] flex flex-col justify-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.68) 100%)" }}
        />
        <div className="relative z-10 px-6 pb-5 pt-20">
          <h1
            className="text-[52px] font-black text-white leading-none tracking-tight mb-3 drop-shadow-lg"
            style={{ fontFamily: "Cairo, sans-serif", textTransform: "uppercase" }}
          >
            {name}
          </h1>
          <p className="text-white/85 text-[14px] leading-relaxed max-w-[270px] mb-8" style={{ fontFamily: "Cairo, sans-serif" }}>
            {subtitle}
          </p>

          {/* Hero CTA — first link in the list if available, else fallback */}
          {links.length > 0 ? (
            <a
              href={links[0].url || "#"}
              className="flex items-center justify-center w-full py-[17px] rounded-2xl font-bold text-[13px] uppercase tracking-[0.15em] transition-all duration-300 hover:brightness-110 hover:scale-[1.01] active:scale-95"
              style={{
                background: primary,
                color: "#1C1C1C",
                boxShadow: `0 8px 28px rgba(var(--primary-rgb), 0.45)`,
                fontFamily: "Cairo, sans-serif",
              }}
            >
              {t(links[0].title, links[0].titleAr)}
            </a>
          ) : (
            <div
              className="flex items-center justify-center w-full py-[17px] rounded-2xl font-bold text-[13px] uppercase tracking-[0.15em] opacity-40"
              style={{ background: primary, color: "#1C1C1C" }}
            >
              {t("ADD A LINK", "أضف رابطاً")}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — ABOUT + DYNAMIC LINKS
      ══════════════════════════════════════════ */}
      <section className="bg-white px-5 pt-9 pb-10 food-pattern">
        <div className="relative rounded-[20px] overflow-hidden mb-7 shadow-card">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop"
            alt="Interior"
            className="w-full h-[200px] object-cover"
          />
          <button
            aria-label="next"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-deep hover:scale-110 transition-transform"
          >
            <LucideIcons.ChevronRight size={18} color="#1C1C1C" />
          </button>
        </div>

        <SectionTitle>{name}</SectionTitle>
        <div className="mb-8">
          <BodyText>{about}</BodyText>
        </div>

        {/* ── DYNAMIC LINKS (all links rendered here) ── */}
        {links.length > 0 ? (
          <div className="flex flex-col gap-3">
            {links.map((link, i) => (
              <LinkButton key={link.id} link={link} index={i} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-3 py-10 rounded-2xl text-center"
            style={{ background: "rgba(0,0,0,0.03)", border: "2px dashed rgba(0,0,0,0.08)" }}
          >
            <LucideIcons.Link2 size={28} color="#ccc" />
            <p className="text-[13px] text-gray-400" style={{ fontFamily: "Cairo, sans-serif" }}>
              {t("No links yet — add them from the admin panel", "لا توجد روابط بعد — أضفها من لوحة التحكم")}
            </p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — PRINCIPLES (cream bg)
      ══════════════════════════════════════════ */}
      <section className="px-5 pt-9 pb-11" style={{ background: bgCream }}>
        <div className="rounded-[20px] overflow-hidden mb-7 shadow-card">
          <img
            src="https://images.unsplash.com/photo-1614777735417-4040049e05d7?q=80&w=800&auto=format&fit=crop"
            alt="Chef"
            className="w-full h-[200px] object-cover"
          />
        </div>
        <SectionTitle>{principlesTitle}</SectionTitle>
        <div className="mb-7"><BodyText>{principlesSub}</BodyText></div>
        <div className="flex flex-col gap-[10px]">
          {principles.map((p, i) => (
            <div key={i} className="flex items-start gap-4 bg-white rounded-2xl px-5 py-[14px] shadow-soft">
              <span className="text-[15px] font-black text-[#1C1C1C] min-w-[30px] pt-0.5 select-none" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                {p.num}
              </span>
              <div className="flex-1">
                <p className="font-black text-[12.5px] text-[#1C1C1C] uppercase tracking-wide mb-1" style={{ fontFamily: "Cairo, sans-serif" }}>
                  {t(p.title, p.titleAr)}
                </p>
                <p className="text-[12.5px] text-[#666] leading-snug" style={{ fontFamily: "Cairo, sans-serif" }}>
                  {t(p.desc, p.descAr)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — CONTACTS (cream bg)
      ══════════════════════════════════════════ */}
      <section className="px-5 pt-9 pb-14" style={{ background: bgCream }}>
        <SectionTitle center>{contactsTitle}</SectionTitle>

        <div className="relative rounded-2xl overflow-hidden shadow-card mb-5 h-[175px] bg-gray-200">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
            alt="Map"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute top-3 left-3 bg-white rounded-xl overflow-hidden shadow-soft flex flex-col">
            <button className="px-3 py-2 border-b border-gray-100 text-[15px] font-bold text-gray-700 hover:bg-gray-50 leading-none">+</button>
            <button className="px-3 py-2 text-[15px] font-bold text-gray-700 hover:bg-gray-50 leading-none">−</button>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <LucideIcons.MapPin size={38} color="#e74c3c" className="drop-shadow-xl -mt-4" />
          </div>
        </div>

        <div className="mb-5 text-center space-y-1">
          <p className="text-[#444] text-[14px]" style={{ fontFamily: "Cairo, sans-serif" }}>{address}</p>
          <p className="font-black text-[11px] uppercase tracking-widest text-[#888]" style={{ fontFamily: "Cairo, sans-serif" }}>
            {t("Business Hours", "ساعات العمل")}
          </p>
          <p className="text-[#444] text-[14px] font-semibold" style={{ fontFamily: "Cairo, sans-serif" }}>{hours}</p>
        </div>
      </section>
    </div>
  );
}
