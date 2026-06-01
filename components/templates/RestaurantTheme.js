"use client";

import { useEffect } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import ScrollReveal from "../ScrollReveal";

// ══════════════════════════════════════════════════════════════════════
//  RestaurantTheme — Dark Elegant "Meaty Story" style
//  Props: { siteData, siteColors, lang }
// ══════════════════════════════════════════════════════════════════════
export default function RestaurantTheme({ cardId, siteData, siteColors, lang = "en", isMenuEnabled, menuMode, pdfMenuUrl, menuCategories, addToCart }) {
  const primary = siteColors?.primary    || "#EDD98A";
  const bgCream = siteColors?.background || "#F5EDD6";
  const isAr    = lang === "ar";

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primary);
    document.documentElement.style.setProperty("--bg-cream", bgCream);
    const h = primary.replace("#","");
    document.documentElement.style.setProperty("--primary-rgb",
      `${parseInt(h.slice(0,2),16)}, ${parseInt(h.slice(2,4),16)}, ${parseInt(h.slice(4,6),16)}`);
  }, [primary, bgCream]);

  const t  = (en, ar) => isAr && ar ? ar : en;
  const sd = siteData || {};

  const name    = t(sd.name || "", sd.nameAr || "");
  const sub     = t(sd.subtitle || "", sd.subtitleAr || "");
  const about   = t(sd.about || "", sd.aboutAr || "");
  const prinT   = t(sd.principlesTitle || "", sd.principlesTitleAr || "");
  const prinSub = t(sd.principlesSubtitle || "", sd.principlesSubtitleAr || "");
  const contactT= t(sd.contactsTitle || "", sd.contactsTitleAr || "");
  const address = sd.address || "";
  const hours   = sd.hours || "";
  const links   = sd.links   || [];
  const principles = sd.principles || [
    { num:"I",   title:"HONEST PRESENTATION", titleAr:"تقديم صادق",   desc:"Exactly as served.",          descAr:"كما يُقدَّم تماماً." },
    { num:"II",  title:"STREAMLINED PROCESS",  titleAr:"عملية مبسّطة", desc:"Clear, minimal waiting.",     descAr:"واضحة وانتظار أقل." },
    { num:"III", title:"ON-TIME DELIVERY",     titleAr:"توصيل في وقته",desc:"Always on schedule.",          descAr:"دائماً في موعده." },
  ];

  const imgs = sd.images || {};
  const hero1 = imgs.hero1 || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop";
  const about1 = imgs.about1 || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop";
  const chef1 = imgs.chef1 || "https://images.unsplash.com/photo-1614777735417-4040049e05d7?q=80&w=800&auto=format&fit=crop";

  // ── Dynamic Link Button ──
  const LinkBtn = ({ link, i }) => {
    const label = t(link.title, link.titleAr);
    const { IconComponent, color, bg } = getIconForLink(link.title || link.titleAr || "");
    const handleClick = () => {
      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});
    };
    return (
      <a
        href={link.url || "#"}
        onClick={handleClick}
        target={link.url && link.url !== "#" ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        style={{ background:"#1C1C1C", color:"#fff", boxShadow:"0 4px 16px rgba(0,0,0,0.22)", fontFamily:"Cairo,sans-serif", animationDelay:`${i*60}ms` }}
      >
        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: bg }}>
          <IconComponent size={17} color={color} />
        </div>
        <span className="flex-1 truncate">{label}</span>
        <LucideIcons.ArrowLeft size={15} color="rgba(255,255,255,0.30)" className={`flex-shrink-0 transition-transform group-hover:translate-x-[-3px]`} />
      </a>
    );
  };

  const STitle = ({ c, children }) => (
    <h2 className={`font-black text-[#1A1A1A] uppercase leading-tight tracking-tight mb-4 ${c?"text-center":""}`}
        style={{ fontSize:"clamp(20px,6.5vw,27px)", fontFamily:"Cairo,sans-serif" }}>
      {children}
    </h2>
  );
  const Body = ({ c, children }) => (
    <p className={`text-[#555] text-[14px] leading-[1.8] ${c?"text-center":""}`} style={{ fontFamily:"Cairo,sans-serif" }}>{children}</p>
  );

  return (
    <div className="w-full bg-white overflow-y-auto" dir={isAr?"rtl":"ltr"} style={{ fontFamily:"Cairo,sans-serif" }}>

      {/* ── HERO ── */}
      <section className="relative min-h-[500px] flex flex-col justify-end overflow-hidden">
        <Image src={hero1}
             alt="hero" fill priority style={{ objectFit: 'cover' }} className="absolute inset-0" />
        <div className="absolute inset-0" style={{ background:"linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.15) 38%,rgba(0,0,0,.70) 100%)" }} />
        <div className="relative z-10 px-6 pb-6 pt-16">
          <h1 className="text-[50px] font-black text-white leading-none tracking-tight mb-3 drop-shadow-lg uppercase" style={{ fontFamily:"Cairo,sans-serif" }}>
            {name}
          </h1>
          <p className="text-white/80 text-[14px] leading-relaxed max-w-[270px] mb-7">{sub}</p>

          {/* Primary CTA (View Menu) */}
          {isMenuEnabled ? (
            <a href={menuMode === 'pdf' ? (pdfMenuUrl || '#') : '#menu-section'} 
               target={menuMode === 'pdf' && pdfMenuUrl ? "_blank" : undefined}
               className="flex items-center justify-center w-full py-[17px] rounded-2xl font-bold text-[13px] uppercase tracking-[.15em] transition-all hover:brightness-110 active:scale-95"
               style={{ background:primary, color:"#1C1C1C", boxShadow:`0 8px 28px rgba(var(--primary-rgb),.45)` }}>
              {t("View Menu", "عرض المنيو")}
            </a>
          ) : links[0] ? (
            <a href={links[0].url||"#"} className="flex items-center justify-center w-full py-[17px] rounded-2xl font-bold text-[13px] uppercase tracking-[.15em] transition-all hover:brightness-110 active:scale-95"
               style={{ background:primary, color:"#1C1C1C", boxShadow:`0 8px 28px rgba(var(--primary-rgb),.45)` }}>
              {t(links[0].title, links[0].titleAr)}
            </a>
          ) : (
            <div className="w-full py-[17px] rounded-2xl text-center font-bold text-[13px] opacity-30 uppercase"
                 style={{ background:primary, color:"#1C1C1C" }}>
              {t("Add your first link", "أضف رابطك الأول")}
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT + LINKS ── */}
      <section className="bg-white px-5 pt-9 pb-10 food-pattern">
        <div className="relative rounded-[20px] overflow-hidden mb-7 shadow-card h-[190px]">
          <Image src={about1}
               alt="interior" fill style={{ objectFit: 'cover' }} />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-deep hover:scale-110 transition-transform">
            <LucideIcons.ChevronRight size={18} color="#1C1C1C" />
          </button>
        </div>

        <STitle>{name}</STitle>
        <div className="mb-8"><Body>{about}</Body></div>

        {links.length > 0 ? (
          <div className="flex flex-col gap-3">
            {links.map((lk, i) => (
                <ScrollReveal key={lk.id || i} yOffset={30}>
                    <LinkBtn link={lk} i={i} />
                </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 rounded-2xl text-center"
               style={{ background:"rgba(0,0,0,.03)", border:"2px dashed rgba(0,0,0,.08)" }}>
            <LucideIcons.Link2 size={28} color="#ccc" />
            <p className="text-[13px] text-gray-400">{t("No links yet","لا توجد روابط بعد")}</p>
          </div>
        )}
      </section>

      {/* ── MENU SECTION ── */}
      {isMenuEnabled && menuMode === 'interactive' && menuCategories && menuCategories.length > 0 && (
        <section id="menu-section" className="px-5 pt-9 pb-11 bg-white scroll-mt-6">
          <STitle c>{t("Our Menu", "قائمة الطعام")}</STitle>
          <div className="flex flex-col gap-8 mt-6">
            {menuCategories.map((cat, i) => (
              <div key={i}>
                <h3 className="font-black text-[18px] text-[#1C1C1C] mb-4 border-b-2 border-gray-100 pb-2">{t(cat.name, cat.nameAr)}</h3>
                <div className="flex flex-col gap-4">
                  {cat.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex-1">
                        <h4 className="font-bold text-[15px] text-[#1C1C1C]">{t(item.name, item.nameAr)}</h4>
                        {item.descAr && <p className="text-[12px] text-gray-500 mt-1 leading-relaxed max-w-[90%]">{t(item.desc, item.descAr)}</p>}
                        <div className="text-[14px] font-black mt-2" style={{ color: primary }}>{item.price} JOD</div>
                      </div>
                      <button onClick={() => addToCart && addToCart(item)} className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors">
                        <LucideIcons.Plus size={18} color="#1C1C1C" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PRINCIPLES ── */}
      <section className="px-5 pt-9 pb-11" style={{ background:bgCream }}>
        <div className="relative rounded-[20px] overflow-hidden mb-7 shadow-card h-[190px]">
          <Image src={chef1}
               alt="chef" fill style={{ objectFit: 'cover' }} />
        </div>
        <STitle>{prinT}</STitle>
        <div className="mb-7"><Body>{prinSub}</Body></div>
        <div className="flex flex-col gap-[10px]">
          {principles.map((p,i) => (
            <div key={i} className="flex items-start gap-4 bg-white rounded-2xl px-5 py-[14px] shadow-soft">
              <span className="text-[15px] font-black text-[#1C1C1C] min-w-[28px] pt-0.5" style={{ fontFamily:"Georgia,serif", fontStyle:"italic" }}>{p.num}</span>
              <div>
                <p className="font-black text-[12.5px] text-[#1C1C1C] uppercase tracking-wide mb-1">{t(p.title,p.titleAr)}</p>
                <p className="text-[12.5px] text-[#666] leading-snug">{t(p.desc,p.descAr)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACTS ── */}
      <section className="px-5 pt-9 pb-14" style={{ background:bgCream }}>
        <STitle c>{contactT}</STitle>
        <div className="relative rounded-2xl overflow-hidden shadow-card mb-5 h-[160px] bg-gray-200">
          <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
               alt="map" fill style={{ objectFit: 'cover' }} className="opacity-70" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <LucideIcons.MapPin size={36} color="#e74c3c" className="-mt-3 drop-shadow-xl" />
          </div>
        </div>
        <div className="text-center space-y-1 mb-4">
          <Body c>{address}</Body>
          <p className="font-black text-[11px] uppercase tracking-widest text-[#999] mt-2">{t("Business Hours","ساعات العمل")}</p>
          <p className="text-[#444] text-[14px] font-semibold">{hours}</p>
        </div>
      </section>
    </div>
  );
}
