"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { motion, Reorder } from "framer-motion";

// ══════════════════════════════════════════════════════════════════════
//  CafeTheme — Warm Minimalist Light style
//  Props: { siteData, siteColors, lang }
// ══════════════════════════════════════════════════════════════════════
export default function CafeTheme({ cardId, siteData, siteColors, lang = "en", isMenuEnabled, menuMode, menuCategories, addToCart, pdfMenuUrl, showMenuImages, isPreview, onUpdateLayoutBlocks }) {
  const primary = siteColors?.primary    || "#6B4226";
  const bgLight = siteColors?.background || "#FAFAF7";
  const isAr    = lang === "ar";
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

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
      if(cardId && !isPreview) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});
      if (link.url === '#menu-section') {
          e.preventDefault();
          if (menuMode === 'pdf' && pdfMenuUrl) {
            window.open(pdfMenuUrl, '_blank');
          } else {
            setIsMenuModalOpen(true);
          }
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

  // ════ LAYOUT BLOCKS SYSTEM ════
  const defaultBlocks = [
      { id: "header", type: "header" },
      { id: "menu_button", type: "menu_button" },
      { id: "info", type: "info" },
      { id: "links", type: "links" }
  ];
  const layoutBlocks = (siteData.layoutBlocks && siteData.layoutBlocks.length > 0) ? siteData.layoutBlocks : defaultBlocks;

  const renderBlock = (block) => {
      switch (block.type) {
          case 'header':
              return (
                  <section className="relative px-6 pt-14 pb-10 text-center overflow-hidden" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2" style={{ background: primary }} />
                      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-10 translate-x-1/2 translate-y-1/2" style={{ background: primary }} />
                      <div className="relative z-10 mx-auto w-[88px] h-[88px] rounded-full flex items-center justify-center mb-6 shadow-deep pointer-events-none"
                           style={{ background: primary }}>
                        <LucideIcons.Coffee size={36} color="#fff" />
                      </div>
                      <h1 className="text-[36px] font-black leading-none tracking-tight mb-2 pointer-events-none" style={{ color: primary, textTransform:"uppercase", fontFamily:"Cairo,sans-serif" }}>
                        {name}
                      </h1>
                      <p className="text-[14px] leading-relaxed opacity-60 pointer-events-none" style={{ color: primary, fontFamily:"Cairo,sans-serif" }}>{sub}</p>
                      
                      {hours && (
                        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-[12px] font-semibold pointer-events-none"
                             style={{ background:`rgba(var(--primary-rgb),.10)`, color: primary, fontFamily:"Cairo,sans-serif" }}>
                          <LucideIcons.Clock size={13} />
                          {hours}
                        </div>
                      )}
                  </section>
              );

          case 'menu_button':
              if (!isMenuEnabled && menuMode !== 'pdf') return null;
              return (
                  <section className="px-5 pb-8" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                    <button
                      onClick={() => {
                        if (menuMode === 'pdf' && pdfMenuUrl) {
                          window.open(pdfMenuUrl, '_blank');
                        } else {
                          setIsMenuModalOpen(true);
                        }
                      }}
                      className="group flex items-center gap-4 w-full px-5 py-[15px] rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                      style={{ background: primary, color:"#fff", boxShadow:`0 4px 18px rgba(var(--primary-rgb),.28)`, fontFamily:"Cairo,sans-serif" }}
                    >
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 bg-white/20">
                        <LucideIcons.UtensilsCrossed size={18} color="#fff" />
                      </div>
                      <span className="flex-1 text-center pr-9 rtl:pr-0 rtl:pl-9">{t("View Menu", "عرض القائمة")}</span>
                    </button>
                  </section>
              );

          case 'info':
              if (!about && !address) return null;
              return (
                  <section className="px-5 pb-8" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <div className="rounded-3xl overflow-hidden shadow-deep relative h-[220px] mb-8 pointer-events-none">
                        <Image src={hero1} alt="cafe" fill priority style={{ objectFit: 'cover' }} draggable="false" />
                      </div>
                      {about && (
                          <p className="text-[14px] leading-[1.85] text-center mb-8" style={{ color: primary, opacity:.7, fontFamily:"Cairo,sans-serif" }}>
                            {about}
                          </p>
                      )}
                      {address && (
                          <div className="flex items-center gap-3 p-4 rounded-2xl pointer-events-none" style={{ background:`rgba(var(--primary-rgb),.07)` }}>
                            <LucideIcons.MapPin size={18} style={{ color: primary }} className="flex-shrink-0" />
                            <p className="text-[13.5px] font-medium" style={{ color: primary, fontFamily:"Cairo,sans-serif" }}>{address}</p>
                          </div>
                      )}
                  </section>
              );

          case 'links':
              if (!links || links.length === 0) return null;
              return (
                  <section className="px-5 pb-10" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <div className="flex flex-col gap-3">
                        {links.map((lk) => (
                          <ScrollReveal key={lk.id} yOffset={30}>
                            <LinkBtn link={lk} />
                          </ScrollReveal>
                        ))}
                      </div>
                  </section>
              );

          case 'image':
              return (
                  <div className="px-6 pb-8 flex justify-center" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <img 
                          src={block.url} 
                          alt="Layout Block" 
                          style={{ width: block.size || 250, objectFit: 'contain' }}
                          draggable="false"
                      />
                  </div>
              );

          default:
              return null;
      }
  };

  return (
    <>
      <div className="w-full min-h-screen overflow-hidden" dir={isAr?"rtl":"ltr"} style={{ background: bgLight, fontFamily:"Cairo,sans-serif" }}>

        {isPreview && onUpdateLayoutBlocks ? (
            <Reorder.Group axis="y" values={layoutBlocks} onReorder={onUpdateLayoutBlocks} className="flex flex-col w-full h-full pb-10">
                {layoutBlocks.map((block) => (
                    <Reorder.Item key={block.id} value={block} dragListener={true} className="w-full">
                        {renderBlock(block)}
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        ) : (
            <div className="flex flex-col w-full h-full pb-10">
                {layoutBlocks.map(block => (
                    <div key={block.id} className="w-full">
                        {renderBlock(block)}
                    </div>
                ))}
            </div>
        )}
      </div>
      
      {/* ── MENU MODAL ── */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#111] overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
          {/* Header */}
          <div className="relative flex-shrink-0 flex items-center justify-between p-5 border-b border-white/10 bg-[#1A1A1A]">
            <h2 className="text-white text-[18px] font-black uppercase tracking-wide" style={{ fontFamily:"Cairo,sans-serif" }}>
              {t("Our Menu", "قائمة الطعام")}
            </h2>
            <button 
              onClick={() => setIsMenuModalOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            >
              <LucideIcons.X size={20} color="#fff" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 pb-20">
            {(!menuCategories || menuCategories.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
                <LucideIcons.UtensilsCrossed size={40} color="#fff" />
                <p className="text-white text-[15px]" style={{ fontFamily:"Cairo,sans-serif" }}>
                  {t("Menu is currently being updated.", "جاري تحديث قائمة الطعام حالياً.")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {menuCategories.map((cat, i) => (
                  <div key={i}>
                    <h3 className="font-black text-[20px] text-white mb-4 border-b border-white/10 pb-2" style={{ fontFamily:"Cairo,sans-serif" }}>
                      {t(cat.name, cat.nameAr)}
                    </h3>
                    <div className="flex flex-col gap-4">
                      {cat.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 shadow-sm">
                          {showMenuImages !== false && item.image && (
                              <div className="w-[70px] h-[70px] sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 mr-3 ml-3 rtl:mr-0 rtl:ml-3 ltr:ml-0 ltr:mr-3 relative shadow-md border border-white/5">
                                <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-bold text-[16px] text-white" style={{ fontFamily:"Cairo,sans-serif" }}>{t(item.name, item.nameAr)}</h4>
                            {item.descAr && <p className="text-[13px] text-white/50 mt-1 leading-relaxed max-w-[90%]" style={{ fontFamily:"Cairo,sans-serif" }}>{t(item.desc, item.descAr)}</p>}
                            <div className="text-[15px] font-black mt-2 tracking-wide" style={{ color: primary }}>{item.price} JOD</div>
                          </div>
                          <button onClick={() => addToCart && addToCart(item)} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 hover:brightness-110" style={{ background: primary }}>
                            <LucideIcons.Plus size={18} color="#111" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
