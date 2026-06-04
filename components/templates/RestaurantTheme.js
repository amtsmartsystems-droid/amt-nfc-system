"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { motion, Reorder } from "framer-motion";

// ══════════════════════════════════════════════════════════════════════
//  RestaurantTheme — Dark Elegant "Meaty Story" style
//  Props: { siteData, siteColors, lang }
// ══════════════════════════════════════════════════════════════════════
export default function RestaurantTheme({ cardId, siteData, siteColors, lang = "en", isMenuEnabled, menuMode, pdfMenuUrl, menuCategories, addToCart, showMenuImages, isPreview, onUpdateLayoutBlocks }) {
  const primary = siteColors?.primary    || "#EDD98A";
  const bgCream = siteColors?.background || "#F5EDD6";
  const isAr    = lang === "ar";
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

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
  const address = sd.address || "";
  const hours   = sd.hours || "";
  const links   = sd.links   || [];

  const imgs = sd.images || {};
  const hero1 = imgs.hero1 || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop";
  const about1 = imgs.about1 || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop";

  // ── Dynamic Link Button ──
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
        className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-[13.5px] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        style={{ background:"#1C1C1C", color:"#fff", boxShadow:"0 4px 16px rgba(0,0,0,0.22)", fontFamily:"Cairo,sans-serif" }}
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
                  <section className="relative min-h-[500px] flex flex-col justify-end overflow-hidden" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <Image src={hero1} alt="hero" fill priority style={{ objectFit: 'cover' }} className="absolute inset-0" draggable="false" />
                      <div className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.15) 38%,rgba(0,0,0,.70) 100%)" }} />
                      <div className="relative z-10 px-6 pb-12 pt-16 pointer-events-none">
                        <h1 className="text-[50px] font-black text-white leading-none tracking-tight mb-3 drop-shadow-lg uppercase" style={{ fontFamily:"Cairo,sans-serif" }}>
                          {name}
                        </h1>
                        <p className="text-white/80 text-[14px] leading-relaxed max-w-[270px] drop-shadow-md">{sub}</p>
                      </div>
                  </section>
              );

          case 'menu_button':
              if (!isMenuEnabled && menuMode !== 'pdf' && !links[0]) return null;
              
              const primaryBtnAction = (e) => {
                if (isMenuEnabled) {
                  if (menuMode === 'pdf' && pdfMenuUrl) { window.open(pdfMenuUrl, '_blank'); } 
                  else { setIsMenuModalOpen(true); }
                } else if (links[0]) {
                  if (cardId && !isPreview) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: links[0].id || links[0]._id }) }).catch(()=>{});
                  if (links[0].url && links[0].url !== '#') window.open(links[0].url, '_blank');
                }
              };
              const primaryBtnText = isMenuEnabled ? t("View Menu", "عرض القائمة") : (links[0] ? t(links[0].title, links[0].titleAr) : t("View Menu", "عرض القائمة"));

              return (
                  <div className="px-6 -mt-6 relative z-20 mb-6" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                    <button
                      onClick={primaryBtnAction}
                      className="flex items-center justify-center w-full py-[17px] rounded-2xl font-bold text-[13px] uppercase tracking-[.15em] transition-all hover:brightness-110 active:scale-95 shadow-xl"
                      style={{ background:primary, color:"#1C1C1C", boxShadow:`0 8px 28px rgba(var(--primary-rgb),.45)` }}>
                      {primaryBtnText}
                    </button>
                  </div>
              );

          case 'info':
              if (!about && !address && !hours) return null;
              return (
                  <div className="px-5 mb-8" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      <div className="relative rounded-[20px] overflow-hidden mb-7 shadow-card h-[190px]">
                        <Image src={about1} alt="interior" fill style={{ objectFit: 'cover' }} draggable="false" />
                      </div>
                      <STitle>{name}</STitle>
                      <div className="mb-4"><Body>{about}</Body></div>
                      
                      {(hours || address) && (
                        <div className="flex flex-col gap-3 mt-6 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                           {address && (
                             <div className="flex items-start gap-3">
                               <LucideIcons.MapPin size={18} className="text-[#555] mt-0.5" />
                               <span className="text-[14px] text-[#444] font-medium leading-relaxed font-[Cairo]">{address}</span>
                             </div>
                           )}
                           {hours && (
                             <div className="flex items-start gap-3">
                               <LucideIcons.Clock size={18} className="text-[#555] mt-0.5" />
                               <span className="text-[14px] text-[#444] font-medium leading-relaxed font-[Cairo]">{hours}</span>
                             </div>
                           )}
                        </div>
                      )}
                  </div>
              );

          case 'links':
              const displayLinks = isMenuEnabled ? links : links.slice(1);
              if (!displayLinks || displayLinks.length === 0) return null;
              return (
                  <div className="px-5 mb-10 flex flex-col gap-3" style={{ cursor: isPreview ? 'grab' : 'default' }}>
                      {displayLinks.map((lk, i) => (
                          <ScrollReveal key={lk.id || i} yOffset={30}>
                              <LinkBtn link={lk} i={i} />
                          </ScrollReveal>
                      ))}
                  </div>
              );

          case 'image':
              return (
                  <div className="px-6 mb-8 flex justify-center" style={{ cursor: isPreview ? 'grab' : 'default' }}>
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
    <div className="w-full bg-white min-h-screen overflow-hidden pb-10" dir={isAr?"rtl":"ltr"} style={{ fontFamily:"Cairo,sans-serif" }}>

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

      {/* ── MENU MODAL ── */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#111] overflow-hidden">
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
                            <LucideIcons.Plus size={18} color="#1C1C1C" />
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

    </div>
  );
}
