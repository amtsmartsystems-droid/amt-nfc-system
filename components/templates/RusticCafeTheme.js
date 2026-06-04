"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { Reorder } from "framer-motion";

// ══════════════════════════════════════════════════════════════════════
//  RusticCafeTheme — "Eshq" Rustic Bohemian Style
//  Deep Stone bg · Cyan/Teal accents · Lantern Gold borders
//  Props: { siteData, siteColors, lang }
// ══════════════════════════════════════════════════════════════════════
export default function RusticCafeTheme({ cardId, siteData, siteColors, lang = "en", isMenuEnabled, menuMode, isHouseSystemActive, menuCategories, addToCart, pdfMenuUrl, showMenuImages, isPreview, onUpdateLayoutBlocks }) {
  // Using user provided colors as defaults if not provided via props
  const primary    = siteColors?.primary    || "#3B9FB1";   // Eshq Cyan
  const bgDark     = siteColors?.background || "#1C1917";   // Deep warm stone/charcoal
  const secondary  = "#D49A6A";                             // Lantern Warmth Gold
  const textCream  = "#F5F5F4";                             // Soft cream
  const cardBg     = "#292524";                             // Stone 800

  const isAr       = lang === "ar";
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primary);
    document.documentElement.style.setProperty("--bg-dark", bgDark);
    const h = primary.replace("#", "");
    document.documentElement.style.setProperty("--primary-rgb",
      `${parseInt(h.slice(0,2),16)}, ${parseInt(h.slice(2,4),16)}, ${parseInt(h.slice(4,6),16)}`
    );
  }, [primary, bgDark]);

  const t   = (en, ar) => isAr && ar ? ar : en;
  const sd  = siteData || {};

  const name     = t(sd.name     || "عِـشْـق | ESHQ",           sd.nameAr);
  const subtitle = t(sd.subtitle || "A Cozy Rustic Bohemian Cafe", sd.subtitleAr);
  const about    = t(sd.about    || "Experience the warmth of our lantern-lit space, serving authentic coffee and hearty meals.", sd.aboutAr);
  const links    = sd.links || [];

  const imgs = sd.images || {};
  const profileImg = imgs.profile || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop";

  // ── Card Button (all links) ──
  const LinkCardBtn = ({ link }) => {
    const label = t(link.title, link.titleAr);
    const { IconComponent } = getIconForLink(link.title || link.titleAr || "");
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
        target={link.url && link.url !== "#" && !link.url.startsWith('#') ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="group flex items-center p-4 rounded-lg transition-all duration-300 hover:-translate-y-1"
        style={{
          background: cardBg,
          color: textCream,
          border: `1px solid rgba(255,255,255,0.05)`,
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          fontFamily: "Cairo, sans-serif",
        }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = secondary;
            e.currentTarget.style.boxShadow = `0 6px 20px rgba(212, 154, 106, 0.15)`;
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = `rgba(255,255,255,0.05)`;
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
        }}
      >
        <div className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
             style={{ background: "rgba(255,255,255,0.03)" }}>
            <IconComponent size={24} color={primary} />
        </div>
        <span className="flex-1 font-semibold text-[15px] mx-4 tracking-wide text-left rtl:text-right">{label}</span>
        <LucideIcons.ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-all" color={secondary} />
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
                  <div className="flex flex-col px-6 pt-12 pb-4 text-center" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <ScrollReveal delay={0}>
                          <div className="flex justify-center mb-6">
                              <div className="w-32 h-32 rounded-full overflow-hidden p-1 bg-stone-800"
                                   style={{ border: `2px solid ${secondary}`, boxShadow: `0 8px 30px rgba(0,0,0,0.5)` }}>
                                  <img src={profileImg} alt="Profile" className="w-full h-full object-cover rounded-full" draggable="false" />
                              </div>
                          </div>
                          <h1 className="font-bold text-[28px] mb-2 tracking-wide" style={{ color: textCream, fontFamily: "Cairo, sans-serif" }}>
                            {name}
                          </h1>
                          <p className="text-[14px] font-medium mb-4" style={{ color: secondary, fontFamily: "Cairo, sans-serif" }}>
                            {subtitle}
                          </p>
                          {about && (
                            <p className="text-[15px] leading-relaxed max-w-[90%] mx-auto opacity-80" style={{ color: textCream, fontFamily: "Cairo, sans-serif" }}>
                                {about}
                            </p>
                          )}
                      </ScrollReveal>
                  </div>
              );

          case 'menu_button':
              if (!isMenuEnabled && menuMode !== 'pdf') return null;
              return (
                  <section className="px-6 py-4" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                    <ScrollReveal delay={0.1}>
                        <button
                          onClick={() => {
                            if (menuMode === 'pdf' && pdfMenuUrl) {
                              window.open(pdfMenuUrl, '_blank');
                            } else {
                              setIsMenuModalOpen(true);
                            }
                          }}
                          className="flex items-center justify-center gap-3 w-full py-[16px] rounded-lg font-bold text-[16px] transition-all duration-300 hover:brightness-110 active:scale-95"
                          style={{ background: primary, color: "#fff", fontFamily: "Cairo, sans-serif", boxShadow: `0 8px 25px rgba(59, 159, 177, 0.3)` }}
                        >
                          <LucideIcons.Coffee size={20} />
                          {t("VIEW MENU", "عرض القائمة")}
                        </button>
                    </ScrollReveal>
                  </section>
              );

          case 'links':
              return (
                  <section className="px-6 py-4" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <div className="space-y-4">
                        {links.length > 0 ? (
                          links.map((lk, i) => (
                            <ScrollReveal key={lk.id} delay={0.1 + (i * 0.05)} yOffset={20}>
                              <LinkCardBtn link={lk} />
                            </ScrollReveal>
                          ))
                        ) : (
                          ["القائمة", "احجز طاولة", "انستغرام", "الموقع"].map((txt, i) => (
                            <div key={i} className="flex items-center p-4 rounded-lg opacity-30 pointer-events-none"
                                 style={{ background: cardBg, border: `1px solid rgba(255,255,255,0.05)` }}>
                              <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center"><LucideIcons.Link size={20} color={textCream} /></div>
                              <span className="flex-1 mx-4 font-semibold text-[15px]" style={{ color: textCream, fontFamily: "Cairo, sans-serif" }}>{txt}</span>
                            </div>
                          ))
                        )}
                      </div>
                  </section>
              );

          case 'info':
              // In this theme we render contact info or a secondary image if we have one. Let's just render a subtle separator and contact text if address exists
              if (!sd.address && !sd.hours) return null;
              return (
                  <section className="px-6 py-6" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <ScrollReveal delay={0.2}>
                          <div className="flex flex-col items-center p-6 rounded-lg text-center" style={{ background: cardBg, border: `1px solid rgba(255,255,255,0.05)` }}>
                              <LucideIcons.MapPin size={24} color={secondary} className="mb-3" />
                              {sd.address && <p className="text-[14px] mb-2" style={{ color: textCream, fontFamily: "Cairo, sans-serif" }}>{sd.address}</p>}
                              {sd.hours && <p className="text-[13px] opacity-70" style={{ color: textCream, fontFamily: "Cairo, sans-serif" }}>{sd.hours}</p>}
                          </div>
                      </ScrollReveal>
                  </section>
              );

          case 'image':
              return (
                  <div className="px-6 py-4 flex justify-center" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <ScrollReveal delay={0.1}>
                          <img 
                              src={block.imageUrl || block.url} 
                              alt="Layout Block" 
                              className="rounded-lg shadow-lg"
                              style={{ width: "100%", maxHeight: block.size ? `${block.size}px` : "300px", objectFit: 'cover' }}
                              draggable="false"
                          />
                      </ScrollReveal>
                  </div>
              );

          default:
              return null;
      }
  };

  return (
    <>
      <div className="w-full min-h-screen overflow-x-hidden relative" dir={isAr ? "rtl" : "ltr"} style={{ background: bgDark, fontFamily: "Cairo, sans-serif" }}>
        
        {/* Subtle noise/texture overlay to enhance the rustic feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        <div className="relative z-10 w-full max-w-lg mx-auto pb-10">
            {isPreview && onUpdateLayoutBlocks ? (
                <Reorder.Group axis="y" values={layoutBlocks} onReorder={onUpdateLayoutBlocks} className="flex flex-col w-full h-full">
                    {layoutBlocks.map((block) => (
                        <Reorder.Item key={block.id} value={block} dragListener={true} className="w-full">
                            {renderBlock(block)}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            ) : (
                <div className="flex flex-col w-full h-full">
                    {layoutBlocks.map(block => (
                        <div key={block.id} className="w-full">
                            {renderBlock(block)}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
      
      {/* ── MENU MODAL ── */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden" style={{ background: bgDark }} dir={isAr ? "rtl" : "ltr"}>
          {/* Header */}
          <div className="relative flex-shrink-0 flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: cardBg }}>
            <h2 className="text-[18px] font-bold uppercase tracking-wide" style={{ color: textCream, fontFamily:"Cairo,sans-serif" }}>
              {t("Our Menu", "قائمة الطعام")}
            </h2>
            <button 
              onClick={() => setIsMenuModalOpen(false)}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: textCream }}
            >
              <LucideIcons.X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 pb-20">
            {(!menuCategories || menuCategories.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
                <LucideIcons.BookOpen size={40} color={secondary} />
                <p className="text-[15px]" style={{ color: textCream, fontFamily:"Cairo,sans-serif" }}>
                  {t("Menu is currently being updated.", "جاري تحديث قائمة الطعام حالياً.")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8 max-w-lg mx-auto">
                {menuCategories.map((cat, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-4 border-b pb-2" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <LucideIcons.Coffee size={20} color={secondary} />
                        <h3 className="font-bold text-[20px]" style={{ color: secondary, fontFamily:"Cairo,sans-serif" }}>
                          {t(cat.name, cat.nameAr)}
                        </h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      {cat.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 rounded-lg shadow-sm" style={{ background: cardBg, border: "1px solid rgba(255,255,255,0.03)" }}>
                          {showMenuImages !== false && item.image && (
                              <div className="w-[70px] h-[70px] sm:w-20 sm:h-20 rounded-md overflow-hidden flex-shrink-0 mr-3 ml-3 rtl:mr-0 rtl:ml-3 ltr:ml-0 ltr:mr-3 relative shadow-md">
                                <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-bold text-[16px]" style={{ color: textCream, fontFamily:"Cairo,sans-serif" }}>{t(item.name, item.nameAr)}</h4>
                            {item.descAr && <p className="text-[13px] mt-1 leading-relaxed max-w-[90%] opacity-70" style={{ color: textCream, fontFamily:"Cairo,sans-serif" }}>{t(item.desc, item.descAr)}</p>}
                            <div className="text-[15px] font-bold mt-2" style={{ color: primary }}>{item.price} JOD</div>
                          </div>
                          {isHouseSystemActive && ( <button onClick={() => addToCart && addToCart(item)} className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 hover:brightness-110" style={{ background: primary }}>
                            <LucideIcons.Plus size={18} color="#fff" />
                          </button> )}
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
