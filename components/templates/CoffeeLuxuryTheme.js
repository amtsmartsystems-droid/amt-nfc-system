"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { motion, Reorder } from "framer-motion";

// ══════════════════════════════════════════════════════════════════════
//  CoffeeLuxuryTheme — "Marouf Coffee" Bespoke Style
//  Deep Pitch Black bg · Warm Gold accent · Elegant vibe
//  Props: { siteData, siteColors, lang }
// ══════════════════════════════════════════════════════════════════════

export default function CoffeeLuxuryTheme({ cardId, siteData, siteColors, lang = "en", isMenuEnabled, menuMode, isHouseSystemActive, menuCategories, addToCart, pdfMenuUrl, showMenuImages, isPreview, onUpdateLayoutBlocks }) {
  // Use explicitly requested colors or fallbacks from siteColors if they match
  const accent  = siteColors?.primary    || "#C59B4D";   // Warm Gold
  const bgColor = siteColors?.background || "#050505";   // Deep Pitch Black
  const isAr    = lang === "ar";
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", accent);
    const h = accent.replace("#","");
    // Fallback if accent isn't exactly a 6 char hex
    if(h.length === 6) {
        document.documentElement.style.setProperty("--primary-rgb",
        `${parseInt(h.slice(0,2),16)}, ${parseInt(h.slice(2,4),16)}, ${parseInt(h.slice(4,6),16)}`
        );
    } else {
        document.documentElement.style.setProperty("--primary-rgb", `197, 155, 77`); // Fallback gold
    }
  }, [accent, bgColor]);

  const t   = (en, ar) => isAr && ar ? ar : en;
  const sd  = siteData || {};

  const name     = t(sd.name    || "Marouf Coffee",          sd.nameAr);
  const tagline  = t(sd.subtitle|| "Premium Coffee House",   sd.subtitleAr);
  const about    = t(sd.about   || "Experience the authentic taste of luxury coffee, carefully crafted to deliver a unique and unforgettable moment.", sd.aboutAr);
  const address  = sd.address || "";
  const hours    = sd.hours   || "";
  const links    = sd.links   || [];

  const profileImg = sd.profileImage || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop";

  // ── Action Button (Menu) ──
  const handleMenuClick = (e) => {
    if (menuMode === 'pdf' && pdfMenuUrl) {
      window.open(pdfMenuUrl, '_blank');
    } else {
      setIsMenuModalOpen(true);
    }
  };

  // ── Links Button ──
  const LinkCard = ({ link }) => {
    const label = t(link.title, link.titleAr);
    const { IconComponent } = getIconForLink(link.title || link.titleAr || "");
    const handleClick = (e) => { 
      if(cardId && !isPreview) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{}); 
      if (link.url === '#menu-section') {
        e.preventDefault();
        handleMenuClick(e);
      }
    };
    return (
      <a href={link.url || "#"} onClick={handleClick} target={link.url && link.url !== "#" && !link.url.startsWith('#') ? "_blank" : undefined} rel="noopener noreferrer"
        className="flex items-center gap-4 w-full p-4 rounded-xl transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden"
        style={{ background: "#111", border: `1px solid rgba(197, 155, 77, 0.3)` }}>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
             style={{ boxShadow: `inset 0 0 20px rgba(197, 155, 77, 0.15)` }} />
             
        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/5 bg-[#1a1a1a] group-hover:bg-[#C59B4D]/10 transition-colors duration-500">
          <IconComponent size={20} className="text-[#C59B4D]" />
        </div>
        <span className="font-semibold text-white tracking-wide flex-1 text-center pr-10 rtl:pr-0 rtl:pl-10 text-[15px]" style={{ fontFamily:"Cairo,sans-serif" }}>
            {label}
        </span>
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
                  <div className="flex flex-col items-center pt-16 px-6 text-center pb-2" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <ScrollReveal animation="fade-up" duration={700}>
                          <div className="relative mb-6 group pointer-events-none">
                              <div className="absolute inset-0 rounded-full bg-[#C59B4D] blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                              <div className="w-32 h-32 rounded-full overflow-hidden border-[2px] border-[#C59B4D] relative z-10 p-1 bg-[#050505]">
                                  <img src={profileImg} alt={name} className="w-full h-full object-cover rounded-full" draggable="false" />
                              </div>
                          </div>
                      </ScrollReveal>

                      <ScrollReveal animation="fade-up" duration={700} delay={100}>
                          <h1 className="text-3xl font-black mb-2 tracking-wide text-white uppercase drop-shadow-md pointer-events-none" style={{ fontFamily:"Cairo,sans-serif" }}>
                              {name}
                          </h1>
                          {tagline && (
                              <p className="text-[#C59B4D] font-medium tracking-widest text-[13px] uppercase mb-5 pointer-events-none" style={{ fontFamily:"Cairo,sans-serif" }}>
                                  {tagline}
                              </p>
                          )}
                      </ScrollReveal>

                      <ScrollReveal animation="fade-up" duration={700} delay={200}>
                          {about && (
                              <p className="text-gray-300 text-[15px] leading-relaxed max-w-[90%] mx-auto font-light pointer-events-none" style={{ fontFamily:"Cairo,sans-serif" }}>
                                  {about}
                              </p>
                          )}
                      </ScrollReveal>
                  </div>
              );

          case 'menu_button':
              if (!isMenuEnabled && menuMode !== 'pdf') return null;
              return (
                  <div className="px-6 mt-8" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <ScrollReveal animation="fade-up" duration={700}>
                          <button 
                              onClick={handleMenuClick}
                              className="w-full py-4 rounded-xl font-black text-[#050505] text-[15px] tracking-[0.2em] uppercase relative overflow-hidden group transition-all duration-500 hover:scale-[1.02] shadow-[0_4px_20px_rgba(197,155,77,0.25)] hover:shadow-[0_4px_30px_rgba(197,155,77,0.4)]"
                              style={{ backgroundColor: "#C59B4D", fontFamily:"Cairo,sans-serif" }}
                          >
                              <span className="relative z-10 flex items-center justify-center gap-3">
                                  <LucideIcons.BookOpen size={18} strokeWidth={2.5} />
                                  {t("VIEW MENU", "عرض قائمة الطعام")}
                              </span>
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                          </button>
                      </ScrollReveal>
                  </div>
              );

          case 'info':
              if (!hours && !address) return null;
              return (
                  <div className="px-6 mt-8" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <ScrollReveal animation="fade-up" duration={700}>
                          <div className="bg-[#111]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 flex flex-col gap-4 pointer-events-none">
                              {address && (
                                  <div className="flex items-start gap-4">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C59B4D]/10 flex-shrink-0">
                                          <LucideIcons.MapPin size={18} className="text-[#C59B4D]" />
                                      </div>
                                      <div className="flex-1 pt-2 text-gray-300 text-[14px] leading-relaxed" style={{ fontFamily:"Cairo,sans-serif" }}>
                                          {address}
                                      </div>
                                  </div>
                              )}
                              {hours && (
                                  <div className="flex items-start gap-4">
                                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C59B4D]/10 flex-shrink-0">
                                          <LucideIcons.Clock size={18} className="text-[#C59B4D]" />
                                      </div>
                                      <div className="flex-1 pt-2 text-gray-300 text-[14px] leading-relaxed" style={{ fontFamily:"Cairo,sans-serif" }}>
                                          {hours}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </ScrollReveal>
                  </div>
              );

          case 'links':
              if (!links || links.length === 0) return null;
              return (
                  <div className="px-6 mt-8 flex flex-col gap-4 pb-2" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <ScrollReveal animation="fade-up" duration={700}>
                          <h3 className="text-center text-[#C59B4D] font-bold text-[14px] tracking-widest uppercase mb-4 flex items-center justify-center gap-4 pointer-events-none">
                              <span className="h-[1px] w-12 bg-[#C59B4D]/30"></span>
                              {t("Connect With Us", "تواصل معنا")}
                              <span className="h-[1px] w-12 bg-[#C59B4D]/30"></span>
                          </h3>
                      </ScrollReveal>
                      
                      {links.map((link, idx) => (
                          <ScrollReveal key={link.id || idx} animation="fade-up" duration={500}>
                              <LinkCard link={link} />
                          </ScrollReveal>
                      ))}
                  </div>
              );

          case 'image':
              return (
                  <div className="px-6 pb-6 mt-8 flex justify-center" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <img 
                          src={block.imageUrl || block.url} 
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
    <div className="min-h-screen text-white font-sans selection:bg-[#C59B4D]/30" style={{ backgroundColor: bgColor }} dir={isAr ? "rtl" : "ltr"}>
      
      {/* Background Texture/Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(circle at 50% 0%, rgba(197, 155, 77, 0.08) 0%, transparent 60%)` }} />

      <div className="relative z-10 max-w-[480px] mx-auto min-h-screen pb-24 flex flex-col">
        
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

        {/* WATERMARK */}
        <div className="text-center pb-8 pt-8 mt-auto">
            <p className="text-[11px] text-gray-500 font-medium tracking-widest uppercase" style={{ fontFamily:"Cairo,sans-serif" }}>
                Powered by AMT Smart Systems
            </p>
        </div>

      </div>

      {/* ── MENU MODAL ── */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
          {/* Header */}
          <div className="relative flex-shrink-0 flex items-center justify-between p-5 border-b border-[#C59B4D]/20 bg-[#050505]">
            <h2 className="text-[#C59B4D] text-[18px] font-black uppercase tracking-widest" style={{ fontFamily:"Cairo,sans-serif" }}>
              {t("Our Menu", "قائمة الطعام")}
            </h2>
            <button 
              onClick={() => setIsMenuModalOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-[#C59B4D]/30 text-[#C59B4D] hover:bg-[#C59B4D] hover:text-[#050505] transition-colors duration-300"
            >
              <LucideIcons.X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 pb-20">
            {(!menuCategories || menuCategories.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
                <LucideIcons.Coffee size={40} className="text-[#C59B4D]" />
                <p className="text-gray-300 text-[15px]" style={{ fontFamily:"Cairo,sans-serif" }}>
                  {t("Menu is currently being updated.", "جاري تحديث قائمة الطعام حالياً.")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {menuCategories.map((cat, i) => (
                  <div key={i}>
                    <h3 className="font-black text-[22px] text-white mb-6 border-b border-[#C59B4D]/20 pb-3 flex items-center gap-3" style={{ fontFamily:"Cairo,sans-serif" }}>
                      <span className="w-2 h-2 rounded-full bg-[#C59B4D]"></span>
                      {t(cat.name, cat.nameAr)}
                    </h3>
                    <div className="flex flex-col gap-5">
                      {cat.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#111] p-4 rounded-xl border border-white/5 hover:border-[#C59B4D]/30 transition-colors duration-300">
                          {showMenuImages !== false && item.image && (
                              <div className="w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] rounded-lg overflow-hidden flex-shrink-0 mr-4 ml-4 rtl:mr-0 rtl:ml-4 ltr:ml-0 ltr:mr-4 relative border border-[#C59B4D]/20">
                                <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 py-1">
                              <h4 className="font-bold text-[16px] text-white tracking-wide" style={{ fontFamily:"Cairo,sans-serif" }}>{t(item.name, item.nameAr)}</h4>
                            {item.descAr && <p className="text-[13px] text-gray-400 mt-1 leading-relaxed max-w-[95%]" style={{ fontFamily:"Cairo,sans-serif" }}>{t(item.desc, item.descAr)}</p>}
                            <div className="text-[16px] font-black mt-2 tracking-widest text-[#C59B4D]">{item.price} JOD</div>
                          </div>
                          {isHouseSystemActive && ( <button onClick={() => addToCart && addToCart(item)} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 border border-[#C59B4D]/50 text-[#C59B4D] hover:bg-[#C59B4D] hover:text-[#050505]">
                            <LucideIcons.Plus size={18} />
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

    </div>
  );
}

