"use client";

import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { getIconForLink } from "../../utils/icons";
import { motion, AnimatePresence } from "framer-motion";

// ══════════════════════════════════════════════════════════════════════
//  MaroufCoffeeTheme — Ultra Premium Animated Edition
//  True Black + Gold + Framer Motion + Moody Coffee Background
// ══════════════════════════════════════════════════════════════════════

export default function MaroufCoffeeTheme({ cardId, siteData, siteColors, lang = "en", isMenuEnabled, menuMode, menuCategories, addToCart, pdfMenuUrl, showMenuImages }) {
  const accent  = "#B99146";     // Marouf Gold
  const isAr    = lang === "ar";
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", accent);
    document.documentElement.style.setProperty("--primary-rgb", `185, 145, 70`);
  }, [accent]);

  const t   = (en, ar) => isAr && ar ? ar : en;
  const sd  = siteData || {};

  const name     = t(sd.name || "Marouf Coffee", sd.nameAr || "بن معروف");
  const tagline  = t(sd.subtitle, sd.subtitleAr);
  const defaultAbout = isAr ? "مزاجك على الطريق..." : "Your mood is on the way...";
  const about    = t(sd.about, sd.aboutAr) || defaultAbout;
  
  const address  = sd.address || "";
  const hours    = sd.hours   || "";
  const links    = sd.links   || [];

  const profileImg = sd.profileImage || "https://maroufcoffee.com/wp-content/uploads/2022/11/Marouf-Coffee-Logo-4.png";

  const handleMenuClick = (e) => {
    if (menuMode === 'pdf' && pdfMenuUrl) {
      window.open(pdfMenuUrl, '_blank');
    } else {
      setIsMenuModalOpen(true);
    }
  };

  // Shared Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  const LinkCard = ({ link }) => {
    const label = t(link.title, link.titleAr);
    const { IconComponent } = getIconForLink(link.title || link.titleAr || "");
    const handleClick = (e) => { 
      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{}); 
      if (link.url === '#menu-section') {
        e.preventDefault();
        handleMenuClick(e);
      }
    };
    return (
      <a href={link.url || "#"} onClick={handleClick} target={link.url && link.url !== "#" && !link.url.startsWith('#') ? "_blank" : undefined} rel="noopener noreferrer"
        className="flex items-center gap-4 w-full p-4 rounded-xl transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#B99146]/60 shadow-lg">
        
        {/* Subtle gold glow inside on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#B99146]/0 via-[#B99146]/10 to-[#B99146]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
             
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#111111]/80 group-hover:bg-[#B99146]/20 transition-colors duration-500 border border-white/5 group-hover:border-[#B99146]/40">
          <IconComponent size={22} className="text-[#B99146] group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(185,145,70,0.5)]" />
        </div>
        <span className="font-bold text-white tracking-wide flex-1 text-[16px]" style={{ fontFamily:"Cairo,sans-serif" }}>
            {label}
        </span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 group-hover:border-[#B99146]/50 transition-all duration-500 bg-black/50 group-hover:rotate-45">
          <LucideIcons.ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#B99146] transition-colors" />
        </div>
      </a>
    );
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-[#B99146]/30 bg-black relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Professional Coffee Image Background (Dark Moody Beans) */}
        <img 
          src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1080&auto=format&fit=crop" 
          alt="Coffee Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        {/* Heavy dark gradient overlay to ensure text readability & premium feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/90 to-[#050505]"></div>
        {/* Gold Radial Glow at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(185,145,70,0.15)_0%,transparent_70%)] opacity-80 mix-blend-screen"></div>
      </div>

      <motion.div 
        className="relative z-10 max-w-[480px] mx-auto min-h-screen pb-24 shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col items-center pt-20 px-6 text-center">
            
            <motion.div variants={itemVariants} className="relative mb-8 group">
                <motion.div 
                  className="absolute inset-0 rounded-full bg-[#B99146] blur-2xl opacity-30"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-[#B99146]/60 relative z-10 bg-black p-[3px] shadow-[0_0_40px_rgba(185,145,70,0.25)] group-hover:scale-105 transition-transform duration-700">
                    <img src={profileImg} alt={name} className="w-full h-full object-contain rounded-full bg-black" />
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <h1 className="text-[34px] font-black mb-3 tracking-wide uppercase drop-shadow-xl text-white" style={{ fontFamily:"Cairo,sans-serif" }}>
                    {name}
                </h1>
                {tagline && (
                    <div className="inline-block px-5 py-2 rounded-full bg-[#B99146]/10 border border-[#B99146]/30 mb-6 backdrop-blur-sm">
                      <p className="font-bold tracking-widest text-[13px] uppercase text-[#B99146]" style={{ fontFamily:"Cairo,sans-serif" }}>
                          {tagline}
                      </p>
                    </div>
                )}
            </motion.div>

            <motion.div variants={itemVariants}>
                {about && (
                    <p className={`text-[17px] leading-relaxed max-w-[90%] mx-auto text-gray-300 drop-shadow-md ${about === defaultAbout ? 'italic text-[#B99146]/90 font-medium' : 'font-light'}`} style={{ fontFamily:"Cairo,sans-serif" }}>
                        "{about}"
                    </p>
                )}
            </motion.div>
        </div>

        {/* ── MAIN MENU BUTTON ── */}
        {(isMenuEnabled || menuMode === 'pdf') && (
            <motion.div variants={itemVariants} className="px-6 mt-12">
                <button 
                    onClick={handleMenuClick}
                    className="w-full py-4.5 rounded-2xl font-black text-black text-[17px] tracking-[0.2em] uppercase relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 shadow-[0_5px_30px_rgba(185,145,70,0.4)] hover:shadow-[0_10px_40px_rgba(185,145,70,0.6)]"
                    style={{ backgroundColor: accent, fontFamily:"Cairo,sans-serif" }}
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        <LucideIcons.Coffee size={22} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-500" />
                        {t("VIEW MENU", "عرض قائمة الطعام")}
                    </span>
                    {/* Button Shine Effect */}
                    <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
                </button>
            </motion.div>
        )}

        {/* ── INFO SECTION (Hours & Address) ── */}
        {(hours || address) && (
            <motion.div variants={itemVariants} className="px-6 mt-12">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#B99146]/5 rounded-full blur-3xl"></div>
                    
                    {address && (
                        <div className="flex items-start gap-4 relative z-10 group">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/60 border border-white/5 flex-shrink-0 group-hover:border-[#B99146]/40 transition-colors">
                                <LucideIcons.MapPin size={20} className="text-[#B99146] group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 pt-2.5 text-[15px] leading-relaxed text-gray-300 font-medium" style={{ fontFamily:"Cairo,sans-serif" }}>
                                {address}
                            </div>
                        </div>
                    )}
                    
                    {hours && (
                        <div className="flex items-start gap-4 relative z-10 group">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/60 border border-white/5 flex-shrink-0 group-hover:border-[#B99146]/40 transition-colors">
                                <LucideIcons.Clock size={20} className="text-[#B99146] group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 pt-2.5 text-[15px] leading-relaxed text-gray-300 font-medium" style={{ fontFamily:"Cairo,sans-serif" }}>
                                {hours}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        )}

        {/* ── LINKS SECTION ── */}
        {links && links.length > 0 && (
            <div className="px-6 mt-14 flex flex-col gap-4 pb-12">
                <motion.div variants={itemVariants}>
                    <h3 className="text-center font-bold text-[14px] tracking-[0.3em] uppercase mb-8 flex items-center justify-center gap-4 text-[#B99146] drop-shadow-md">
                        <span className="h-[2px] w-14 bg-gradient-to-r from-transparent to-[#B99146]/60 rounded-full"></span>
                        {t("Connect With Us", "تواصل معنا")}
                        <span className="h-[2px] w-14 bg-gradient-to-l from-transparent to-[#B99146]/60 rounded-full"></span>
                    </h3>
                </motion.div>
                
                {links.map((link, idx) => (
                    <motion.div key={link.id || idx} variants={itemVariants}>
                        <LinkCard link={link} />
                    </motion.div>
                ))}
            </div>
        )}

        {/* ── WATERMARK ── */}
        <motion.div variants={itemVariants}>
          <div className="text-center pb-8 pt-6">
              <p className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-30 text-white hover:opacity-100 transition-opacity duration-300" style={{ fontFamily:"Cairo,sans-serif" }}>
                  Powered by AMT Smart Systems
              </p>
          </div>
        </motion.div>

      </motion.div>

      {/* ── MENU MODAL (Animated) ── */}
      <AnimatePresence>
        {isMenuModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#050505] overflow-hidden" 
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="relative flex-shrink-0 flex items-center justify-between p-5 border-b border-white/10 bg-black shadow-md z-10">
              <h2 className="text-[19px] font-black uppercase tracking-widest text-[#B99146] flex items-center gap-3" style={{ fontFamily:"Cairo,sans-serif" }}>
                <LucideIcons.BookOpen size={22} />
                {t("Our Menu", "قائمة الطعام")}
              </h2>
              <button 
                onClick={() => setIsMenuModalOpen(false)}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-[#111111] border border-white/10 text-gray-400 hover:text-white hover:bg-[#B99146] hover:border-[#B99146] hover:text-black transition-all duration-300"
              >
                <LucideIcons.X size={22} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 pb-24 bg-[#080808] relative">
              {/* Subtle background glow inside menu */}
              <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#B99146]/5 to-transparent pointer-events-none"></div>

              {(!menuCategories || menuCategories.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 opacity-50">
                  <div className="w-24 h-24 rounded-full bg-[#111111] flex items-center justify-center border border-white/5">
                    <LucideIcons.Coffee size={48} className="text-[#B99146]" />
                  </div>
                  <p className="text-[17px] font-semibold text-gray-400" style={{ fontFamily:"Cairo,sans-serif" }}>
                    {t("Menu is currently being updated.", "جاري تحديث قائمة الطعام حالياً.")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-12 relative z-10">
                  {menuCategories.map((cat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="font-black text-[24px] mb-6 pb-3 flex items-center gap-4 border-b border-white/10 text-white" style={{ fontFamily:"Cairo,sans-serif" }}>
                        <span className="w-2 h-8 rounded-full bg-[#B99146] shadow-[0_0_10px_rgba(185,145,70,0.5)]"></span>
                        {t(cat.name, cat.nameAr)}
                      </h3>
                      <div className="flex flex-col gap-5">
                        {cat.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#111111] p-4 rounded-2xl border border-white/5 hover:border-[#B99146]/40 transition-all duration-400 group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            {showMenuImages !== false && item.image && (
                                <div className="w-[85px] h-[85px] sm:w-[110px] sm:h-[110px] rounded-xl overflow-hidden flex-shrink-0 mr-4 ml-4 rtl:mr-0 rtl:ml-4 ltr:ml-0 ltr:mr-4 relative border border-white/10 group-hover:border-[#B99146]/30 transition-colors">
                                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                              )}
                              <div className="flex-1 py-1">
                                <h4 className="font-bold text-[18px] tracking-wide text-white" style={{ fontFamily:"Cairo,sans-serif" }}>{t(item.name, item.nameAr)}</h4>
                              {item.descAr && <p className="text-[14px] text-gray-400 mt-2 leading-relaxed max-w-[95%]" style={{ fontFamily:"Cairo,sans-serif" }}>{t(item.desc, item.descAr)}</p>}
                              <div className="text-[17px] font-black mt-3 tracking-widest text-[#B99146] drop-shadow-sm">{item.price} JOD</div>
                            </div>
                            <button onClick={() => addToCart && addToCart(item)} className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 bg-black border border-white/10 text-[#B99146] group-hover:bg-[#B99146] group-hover:text-black group-hover:scale-110 shadow-lg">
                              <LucideIcons.Plus size={22} strokeWidth={2.5} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
