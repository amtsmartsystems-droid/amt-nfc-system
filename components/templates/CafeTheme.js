"use client";

import { useEffect } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import ScrollReveal from "../ScrollReveal";

// ══════════════════════════════════════════════════════════════════════
//  CafeTheme — Warm Minimalist Light style
//  Props: { siteData, siteColors, lang }
// ══════════════════════════════════════════════════════════════════════
export default function CafeTheme({ cardId, siteData, siteColors, lang = "en", isMenuEnabled, menuMode, menuCategories, addToCart, pdfMenuUrl }) {
  const primary = siteColors?.primary    || "#6B4226";
  const bgLight = siteColors?.background || "#FAFAF7";
  const isAr    = lang === "ar";

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primary);
    const h = primary.replace("#","");
    document.documentElement.style.setProperty("--primary-rgb",
      `${parseInt(h.slice(0,2),16)}, ${parseInt(h.slice(2,4),16)}, ${parseInt(h.slice(4,6),16)}`);
  }, [primary]);

  const t  = (en, ar) => isAr && ar ? ar : en;
  const sd = siteData || {};

  const name  = t(sd.name    || "COFFEE HOUSE",         sd.nameAr);
  const sub   = t(sd.subtitle|| "Good coffee, better moments", sd.subtitleAr);
  const about = t(sd.about   || "We believe in slow mornings and perfectly crafted cups. Every bean sourced with love, every cup served with care.", sd.aboutAr);
  const hours = sd.hours   || "7:00 AM — 10:00 PM";
  const address = sd.address || "42 Coffee Lane, Brooklyn";
  const links = sd.links || [];
  
  const imgs = sd.images || {};
  const hero1 = imgs.hero1 || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop";

  const LinkBtn = ({ link, i }) => {
    const label = t(link.title, link.titleAr);
    const { IconComponent, color, bg } = getIconForLink(link.title || link.titleAr || "");
    const handleClick = (e) => {
      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});
      if (link.url === '#menu-section') {
        e.preventDefault();
        document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    return (
      <a
        href={link.url || "#"}
        onClick={handleClick}
        target={link.url && link.url !== "#" ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="group flex items-center gap-4 w-full px-5 py-[15px] rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
        style={{ background: primary, color:"#fff", boxShadow:`0 4px 18px rgba(var(--primary-rgb),.28)`, fontFamily:"Cairo,sans-serif" }}
      >
        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 bg-white/20">
          <IconComponent size={17} color="#fff" />
        </div>
        <span className="flex-1 truncate">{label}</span>
        <LucideIcons.ArrowLeft size={15} color="rgba(255,255,255,0.50)" />
      </a>
    );
  };

  return (
    <div className="w-full overflow-y-auto" dir={isAr?"rtl":"ltr"} style={{ background: bgLight, fontFamily:"Cairo,sans-serif" }}>

      {/* ── HERO HEADER ── */}
      <section className="relative px-6 pt-14 pb-10 text-center overflow-hidden">
        {/* Subtle background blobs */}
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2" style={{ background: primary }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-10 translate-x-1/2 translate-y-1/2" style={{ background: primary }} />

        {/* Logo circle */}
        <div className="relative z-10 mx-auto w-[88px] h-[88px] rounded-full flex items-center justify-center mb-6 shadow-deep"
             style={{ background: primary }}>
          <LucideIcons.Coffee size={36} color="#fff" />
        </div>

        <h1 className="text-[36px] font-black leading-none tracking-tight mb-2" style={{ color: primary, textTransform:"uppercase" }}>
          {name}
        </h1>
        <p className="text-[14px] leading-relaxed opacity-60" style={{ color: primary }}>{sub}</p>

        {/* Hours pill */}
        {hours && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-[12px] font-semibold"
               style={{ background:`rgba(var(--primary-rgb),.10)`, color: primary }}>
            <LucideIcons.Clock size={13} />
            {hours}
          </div>
        )}
      </section>

      {/* ── FEATURE IMAGE ── */}
      <section className="px-5 pb-8">
        <div className="rounded-3xl overflow-hidden shadow-deep relative h-[220px]">
          <Image src={hero1}
               alt="cafe" fill priority style={{ objectFit: 'cover' }} />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="px-6 pb-8">
        <p className="text-[14px] leading-[1.85] text-center" style={{ color: primary, opacity:.7, fontFamily:"Cairo,sans-serif" }}>
          {about}
        </p>
      </section>

      {/* ── DYNAMIC LINKS ── */}
      <section className="px-5 pb-10">
        {links.length > 0 ? (
          <div className="flex flex-col gap-3">
            {links.map((lk) => (
              <ScrollReveal key={lk.id} yOffset={30}>
                <LinkBtn link={lk} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 rounded-3xl text-center"
               style={{ background:`rgba(var(--primary-rgb),.06)`, border:`2px dashed rgba(var(--primary-rgb),.15)` }}>
            <LucideIcons.Link2 size={26} style={{ color: primary, opacity:.4 }} />
            <p className="text-[13px] opacity-40" style={{ color: primary }}>
              {t("No links yet","لا توجد روابط بعد")}
            </p>
          </div>
        )}
      </section>

      {/* ── MENU SECTION ── */}
      {isMenuEnabled && menuMode === 'interactive' && menuCategories && menuCategories.length > 0 && (
        <section id="menu-section" className="px-5 pb-10 scroll-mt-6">
          <div className="text-center mb-6">
            <h2 className="text-[22px] font-black uppercase" style={{ color: primary, fontFamily:"Cairo,sans-serif" }}>
              {t("Our Menu", "قائمة الطعام")}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            {menuCategories.map((cat, i) => (
              <div key={i}>
                <h3 className="font-bold text-[18px] mb-4 pb-2 border-b-2" style={{ color: primary, borderColor: `rgba(var(--primary-rgb),.1)` }}>
                  {t(cat.name, cat.nameAr)}
                </h3>
                <div className="flex flex-col gap-3">
                  {cat.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-2xl shadow-sm transition-transform hover:-translate-y-0.5" style={{ background: '#ffffff', border: `1px solid rgba(var(--primary-rgb),.05)` }}>
                      <div className="flex-1">
                        <h4 className="font-bold text-[15px]" style={{ color: '#1f2937' }}>{t(item.name, item.nameAr)}</h4>
                        {item.descAr && <p className="text-[12px] text-gray-500 mt-1 leading-relaxed max-w-[90%]">{t(item.desc, item.descAr)}</p>}
                        <div className="text-[14px] font-black mt-2" style={{ color: primary }}>{item.price} JOD</div>
                      </div>
                      <button onClick={() => addToCart && addToCart(item)} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-95" style={{ background: `rgba(var(--primary-rgb),.1)` }}>
                        <LucideIcons.Plus size={18} color={primary} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTACT INFO ── */}
      {address && (
        <section className="px-5 pb-12">
          <div className="flex items-center gap-3 p-4 rounded-2xl"
               style={{ background:`rgba(var(--primary-rgb),.07)` }}>
            <LucideIcons.MapPin size={18} style={{ color: primary }} className="flex-shrink-0" />
            <p className="text-[13.5px] font-medium" style={{ color: primary }}>{address}</p>
          </div>
        </section>
      )}
    </div>
  );
}
