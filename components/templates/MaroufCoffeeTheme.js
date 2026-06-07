"use client";

import { useEffect, useState, useRef } from "react";
import * as LucideIcons from "lucide-react";
import { getIconForLink } from "../../utils/icons";
import { motion, AnimatePresence, Reorder, useInView } from "framer-motion";

// ══════════════════════════════════════════════════════════════════════
//  MaroufCoffeeTheme — Apple-Level Ultra Premium Edition
//  True Black + Gold + Framer Motion + Scroll Reveal + Edge Glow
// ══════════════════════════════════════════════════════════════════════

// ── Scroll Reveal wrapper (GPU-optimised) ──
function BlockReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.52, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// ── Glow Button — proximity-aware edge glow ──
function GlowLinkCard({ link, accent, cardId, t, handleMenuClick, handleOffersClick }) {
  const label = t(link.title, link.titleAr);
  const { IconComponent } = getIconForLink(link.title || link.titleAr || "");
  const btnRef = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowPos({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setGlowPos(p => ({ ...p, opacity: 0 }));
  };

  const handleClick = (e) => {
    if (cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(() => {});
    if (link.url === '#menu-section') {
      e.preventDefault();
      handleMenuClick(e);
    }
    if (link.url === '#offers' || link.type === 'offers') {
      e.preventDefault();
      handleOffersClick && handleOffersClick();
    }
  };

  return (
    <a
      href={link.url || "#"}
      onClick={handleClick}
      target={link.url && link.url !== "#" && !link.url.startsWith('#') ? "_blank" : undefined}
      rel="noopener noreferrer"
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex items-center gap-4 w-full p-4 rounded-2xl relative overflow-hidden group"
      style={{
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        transition: "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(var(--primary-rgb),0.4), inset 0 1px 0 rgba(255,255,255,0.08)`;
        e.currentTarget.style.borderColor = "rgba(var(--primary-rgb),0.5)";
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {/* Proximity glow spot */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(200px circle at ${glowPos.x}% ${glowPos.y}%, rgba(var(--primary-rgb),0.18), transparent 70%)`,
          opacity: glowPos.opacity,
        }}
      />

      {/* Edge shimmer on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.6), transparent)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.3), transparent)" }}
        />
      </div>

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-500 group-hover:scale-105"
        style={{
          background: "rgba(var(--primary-rgb),0.08)",
          border: "1px solid rgba(var(--primary-rgb),0.2)",
          boxShadow: "0 0 0 0 rgba(var(--primary-rgb),0)",
          transition: "all 0.4s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(var(--primary-rgb),0.35)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 0 0 rgba(var(--primary-rgb),0)"; }}
      >
        <IconComponent size={22} style={{ color: "var(--primary-color)", filter: "drop-shadow(0 0 6px rgba(var(--primary-rgb),0.5))" }} />
      </div>

      {/* Label */}
      <span
        className="font-semibold text-white tracking-wide flex-1 relative z-10 text-[15.5px]"
        style={{ fontFamily: "Cairo,sans-serif", letterSpacing: "0.01em" }}
      >
        {label}
      </span>

      {/* Arrow */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 transition-all duration-500 group-hover:rotate-45"
        style={{
          background: "rgba(var(--primary-rgb),0.08)",
          border: "1px solid rgba(var(--primary-rgb),0.2)",
        }}
      >
        <LucideIcons.ArrowUpRight size={14} style={{ color: "rgba(var(--primary-rgb),0.7)" }} />
      </div>
    </a>
  );
}

export default function MaroufCoffeeTheme({ cardId, siteData, siteColors, lang = "en", isMenuEnabled, menuMode, isHouseSystemActive, menuCategories, addToCart, pdfMenuUrl, offersUrl, showMenuImages, isPreview, onUpdateLayoutBlocks }) {
  
  const accent = siteColors?.primary || "#B99146";
  const bgDark = siteColors?.background || "#050505";

  const hexToRgbStr = (hex) => {
    let c = (hex||'#B99146').substring(1);
    if(c.length===3) c = c.split('').map(x=>x+x).join('');
    const num = parseInt(c, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  };

  const isAr = lang === "ar";
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', accent);
    document.documentElement.style.setProperty('--primary-rgb', hexToRgbStr(accent));
    document.documentElement.style.setProperty('--bg-color', bgDark);
  }, [accent, bgDark]);

  const t  = (en, ar) => isAr && ar ? ar : en;
  const sd = siteData || {};

  const name    = t(sd.name || "Marouf Coffee", sd.nameAr || "بن معروف");
  const tagline = t(sd.subtitle, sd.subtitleAr);
  const defaultAbout = isAr ? "مزاجك على الطريق..." : "Your mood is on the way...";
  const about   = t(sd.about, sd.aboutAr) || defaultAbout;

  const address = sd.address || "";
  const hours   = sd.hours   || "";
  const links   = sd.links   || [];

  const profileImg = sd.images?.profile || sd.profileImage || "https://maroufcoffee.com/wp-content/uploads/2022/11/Marouf-Coffee-Logo-4.png";

  const handleMenuClick = (e) => {
    if (menuMode === 'pdf' && pdfMenuUrl) {
      window.open(pdfMenuUrl, '_blank');
    } else {
      setIsMenuModalOpen(true);
    }
  };

  // ════ LAYOUT BLOCKS ════
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
          <div
            className="flex flex-col items-center pt-20 px-6 text-center"
            style={{ cursor: isPreview ? 'grab' : 'default' }}
          >
            <BlockReveal delay={0}>
              <div className="relative mb-8 flex justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, rgba(var(--primary-rgb),0.3) 0%, transparent 70%)` }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div
                  className="w-40 h-40 rounded-full relative z-10 overflow-hidden flex items-center justify-center"
                  style={{
                    boxShadow: `0 0 0 2px rgba(var(--primary-rgb),0.5), 0 0 40px rgba(var(--primary-rgb),0.3), 0 20px 60px rgba(0,0,0,0.6)`,
                  }}
                >
                  <img
                    src={profileImg}
                    alt={name}
                    className="w-full h-full object-cover"
                    draggable="false"
                  />
                </div>
              </div>
            </BlockReveal>

            <BlockReveal delay={0.08}>
              <h1
                className="text-[34px] font-black mb-3 tracking-wide uppercase text-white"
                style={{
                  fontFamily: "Cairo,sans-serif",
                  textShadow: "0 0 60px rgba(var(--primary-rgb),0.3)",
                  letterSpacing: "0.04em",
                }}
              >
                {name}
              </h1>

              {tagline && (
                <div
                  className="inline-block px-5 py-2 rounded-full mb-6"
                  style={{
                    background: "rgba(var(--primary-rgb),0.08)",
                    border: "1px solid rgba(var(--primary-rgb),0.25)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <p
                    className="font-bold tracking-widest text-[12px] uppercase"
                    style={{ color: accent, fontFamily: "Cairo,sans-serif" }}
                  >
                    {tagline}
                  </p>
                </div>
              )}
            </BlockReveal>

            <BlockReveal delay={0.14}>
              {about && (
                <p
                  className="text-[16px] leading-relaxed max-w-[88%] mx-auto text-gray-400 font-light"
                  style={{ fontFamily: "Cairo,sans-serif" }}
                >
                  {about}
                </p>
              )}
            </BlockReveal>
          </div>
        );

      case 'menu_button':
        if (!isMenuEnabled && menuMode !== 'pdf') return null;
        return (
          <BlockReveal delay={0}>
            <div className="px-6 mt-12" style={{ cursor: isPreview ? 'grab' : 'default' }}>
              <button
                onClick={handleMenuClick}
                className="w-full py-5 rounded-2xl font-black text-black text-[18px] tracking-[0.15em] uppercase relative overflow-hidden group transition-all duration-400"
                style={{
                  backgroundColor: accent,
                  fontFamily: "Cairo,sans-serif",
                  boxShadow: "0 8px 40px rgba(var(--primary-rgb),0.45), 0 0 0 1px rgba(var(--primary-rgb),0.3)",
                  transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 16px 60px rgba(var(--primary-rgb),0.6), 0 0 0 1px rgba(var(--primary-rgb),0.5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 40px rgba(var(--primary-rgb),0.45), 0 0 0 1px rgba(var(--primary-rgb),0.3)";
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <LucideIcons.Coffee size={24} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-500" />
                  {t("VIEW MENU", "عرض قائمة الطعام")}
                </span>
                {/* Shine sweep */}
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-900 ease-in-out" />
              </button>
            </div>
          </BlockReveal>
        );

      case 'info':
        if (!hours && !address) return null;
        return (
          <BlockReveal delay={0}>
            <div className="px-6 mt-10" style={{ cursor: isPreview ? 'grab' : 'default' }}>
              <div
                className="rounded-2xl p-5 flex flex-col gap-5 relative overflow-hidden"
                style={{
                  background: "rgba(10,10,10,0.8)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(var(--primary-rgb),0.06) 0%, transparent 70%)" }} />

                {address && (
                  <div className="flex items-start gap-4 relative z-10 group">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-400"
                      style={{
                        background: "rgba(var(--primary-rgb),0.08)",
                        border: "1px solid rgba(var(--primary-rgb),0.2)",
                      }}
                    >
                      <LucideIcons.MapPin size={18} style={{ color: accent, filter: "drop-shadow(0 0 6px rgba(var(--primary-rgb),0.4))" }} />
                    </div>
                    <div className="flex-1 pt-2.5 text-[14.5px] leading-relaxed text-gray-300 font-medium" style={{ fontFamily: "Cairo,sans-serif" }}>
                      {address}
                    </div>
                  </div>
                )}

                {hours && (
                  <div className="flex items-start gap-4 relative z-10 group">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-400"
                      style={{
                        background: "rgba(var(--primary-rgb),0.08)",
                        border: "1px solid rgba(var(--primary-rgb),0.2)",
                      }}
                    >
                      <LucideIcons.Clock size={18} style={{ color: accent, filter: "drop-shadow(0 0 6px rgba(var(--primary-rgb),0.4))" }} />
                    </div>
                    <div className="flex-1 pt-2.5 text-[14.5px] leading-relaxed text-gray-300 font-medium" style={{ fontFamily: "Cairo,sans-serif" }}>
                      {hours}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </BlockReveal>
        );

      case 'links':
        if (!links || links.length === 0) return null;
        return (
          <div className="px-6 mt-12 flex flex-col gap-3 pb-4" style={{ cursor: isPreview ? 'grab' : 'default' }}>
            <BlockReveal delay={0}>
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="h-[1px] flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--primary-rgb),0.4))" }} />
                <span className="font-bold tracking-[0.25em] text-[11px] uppercase" style={{ color: accent, fontFamily: "Cairo,sans-serif" }}>
                  {t("Connect With Us", "تواصل معنا")}
                </span>
                <span className="h-[1px] flex-1" style={{ background: "linear-gradient(90deg, rgba(var(--primary-rgb),0.4), transparent)" }} />
              </div>
            </BlockReveal>

            {links.map((link, idx) => (
              <BlockReveal key={link.id || idx} delay={idx * 0.06}>
                <GlowLinkCard
                  link={link}
                  accent={accent}
                  cardId={cardId}
                  t={t}
                  handleMenuClick={handleMenuClick}
                  handleOffersClick={() => setIsOffersOpen(true)}
                />
              </BlockReveal>
            ))}
          </div>
        );

      case 'image':
        if (!block.url && !block.imageUrl) return null;
        return (
          <BlockReveal delay={0}>
            <div
              className="mt-6 relative overflow-hidden group"
              style={{
                cursor: isPreview ? 'grab' : 'default',
                width: "100%",
              }}
            >
              {/* Full-width cinematic image section */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxHeight: block.size ? `${block.size}px` : "320px",
                  overflow: "hidden",
                }}
              >
                {/* Top fade from black */}
                <div
                  className="absolute inset-x-0 top-0 h-16 pointer-events-none z-10"
                  style={{ background: "linear-gradient(180deg, var(--bg-color) 0%, transparent 100%)" }}
                />
                {/* Bottom fade to black */}
                <div
                  className="absolute inset-x-0 bottom-0 h-16 pointer-events-none z-10"
                  style={{ background: "linear-gradient(0deg, var(--bg-color) 0%, transparent 100%)" }}
                />
                {/* Gold vignette sides */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{ boxShadow: "inset 0 0 60px rgba(var(--primary-rgb),0.08)" }}
                />
                <img
                  src={block.imageUrl || block.url}
                  alt="Image"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: block.size ? `${block.size}px` : "320px",
                    objectFit: "cover",
                    display: "block",
                    backgroundColor: "transparent",
                    transition: "transform 0.8s ease",
                  }}
                  className="group-hover:scale-105"
                  draggable="false"
                />
              </div>
            </div>
          </BlockReveal>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen text-white font-sans selection:bg-[var(--primary-color)]/30 relative overflow-hidden"
      style={{ background: "var(--bg-color)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── LAYERED BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Coffee background image */}
        <img
          src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1080&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(5,5,5,0.95) 50%, var(--bg-color) 100%)" }}
        />
        {/* Gold radial glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle at center, rgba(var(--primary-rgb),0.12) 0%, transparent 70%)",
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
            backgroundSize: "150px",
          }}
        />
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-[480px] mx-auto min-h-screen pb-28">
        {isPreview && onUpdateLayoutBlocks ? (
          <Reorder.Group axis="y" values={layoutBlocks} onReorder={onUpdateLayoutBlocks} className="flex flex-col">
            {layoutBlocks.map((block) => (
              <Reorder.Item key={block.id} value={block} dragListener={true}>
                {renderBlock(block)}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="flex flex-col">
            {layoutBlocks.map((block) => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
          </div>
        )}

        {/* ── WATERMARK ── */}
        <div className="text-center pb-8 pt-8">
          <p
            className="text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Cairo,sans-serif" }}
          >
            Powered by AMT Smart Systems
          </p>
        </div>
      </div>

      {/* ── MENU MODAL ── */}
      <AnimatePresence>
        {isMenuModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
            style={{ background: "var(--bg-color)" }}
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Modal Header */}
            <div
              className="relative flex-shrink-0 flex items-center justify-between px-6 py-5 z-10"
              style={{
                background: "rgba(10,10,10,0.95)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h2
                className="text-[18px] font-black uppercase tracking-widest flex items-center gap-3"
                style={{ color: accent, fontFamily: "Cairo,sans-serif" }}
              >
                <LucideIcons.BookOpen size={20} style={{ filter: "drop-shadow(0 0 8px rgba(var(--primary-rgb),0.5))" }} />
                {t("Our Menu", "قائمة الطعام")}
              </h2>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: "rgba(var(--primary-rgb),0.08)",
                  border: "1px solid rgba(var(--primary-rgb),0.25)",
                  color: accent,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = "#000"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(var(--primary-rgb),0.08)"; e.currentTarget.style.color = accent; }}
              >
                <LucideIcons.X size={20} />
              </button>
            </div>

            {/* Scrollable Menu */}
            <div className="flex-1 overflow-y-auto p-5 pb-24" style={{ background: "#080808" }}>
              <div className="absolute top-0 left-0 w-full h-64 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(var(--primary-rgb),0.04) 0%, transparent 100%)" }} />

              {(!menuCategories || menuCategories.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 opacity-40">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(var(--primary-rgb),0.08)", border: "1px solid rgba(var(--primary-rgb),0.2)" }}>
                    <LucideIcons.Coffee size={40} style={{ color: accent }} />
                  </div>
                  <p className="text-[16px] font-semibold text-gray-400" style={{ fontFamily: "Cairo,sans-serif" }}>
                    {t("Menu is being updated.", "جاري تحديث القائمة حالياً.")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-10 relative z-10">
                  {menuCategories.map((cat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: i * 0.07 }}
                    >
                      <div className="flex items-center gap-3 mb-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        <span className="w-[3px] h-7 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}80` }} />
                        <h3 className="font-black text-[22px] text-white" style={{ fontFamily: "Cairo,sans-serif" }}>
                          {t(cat.name, cat.nameAr)}
                        </h3>
                      </div>
                      <div className="flex flex-col gap-4">
                        {cat.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-4 rounded-2xl group transition-all duration-400"
                            style={{
                              background: "rgba(15,15,15,0.9)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.borderColor = "rgba(var(--primary-rgb),0.35)";
                              e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(var(--primary-rgb),0.2)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                              e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.3)";
                            }}
                          >
                            {showMenuImages !== false && item.image && (
                              <div className="w-[80px] h-[80px] rounded-xl overflow-hidden flex-shrink-0 mx-3 relative border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                                <img src={item.image} alt={item.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              </div>
                            )}
                            <div className="flex-1 py-1">
                              <h4 className="font-bold text-[17px] text-white" style={{ fontFamily: "Cairo,sans-serif" }}>
                                {t(item.name, item.nameAr)}
                              </h4>
                              {item.descAr && (
                                <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed" style={{ fontFamily: "Cairo,sans-serif" }}>
                                  {t(item.desc, item.descAr)}
                                </p>
                              )}
                              <div className="text-[16px] font-black mt-2 tracking-widest" style={{ color: accent }}>
                                {item.price} JOD
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart && addToCart(item)}
                              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                              style={{
                                background: "rgba(var(--primary-rgb),0.08)",
                                border: "1px solid rgba(var(--primary-rgb),0.25)",
                                color: accent,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.color = "#000"; e.currentTarget.style.transform = "scale(1.1)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(var(--primary-rgb),0.08)"; e.currentTarget.style.color = accent; e.currentTarget.style.transform = "scale(1)"; }}
                            >
                              <LucideIcons.Plus size={20} strokeWidth={2.5} />
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

      {/* ═══ OFFERS MODAL ═══ */}
      <AnimatePresence>
        {isOffersOpen && offersUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex flex-col"
            style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(var(--primary-rgb),0.2)", background: "rgba(0,0,0,0.6)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `rgba(var(--primary-rgb),0.15)`, border: `1px solid rgba(var(--primary-rgb),0.3)` }}>
                  <LucideIcons.Megaphone size={16} style={{ color: accent }} />
                </div>
                <h2 className="font-black text-[16px] text-white" style={{ fontFamily: "Cairo,sans-serif" }}>
                  {t('Our Offers', 'عروضنا')}
                </h2>
              </div>
              <button
                onClick={() => setIsOffersOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
              >
                <LucideIcons.X size={20} />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-auto flex items-start justify-center p-4">
              {offersUrl.startsWith('data:application/pdf') || offersUrl.includes('/api/file/') ? (
                <iframe
                  src={offersUrl}
                  className="w-full rounded-2xl border"
                  style={{ minHeight: '80vh', borderColor: `rgba(var(--primary-rgb),0.2)` }}
                  title="offers"
                />
              ) : (
                <img
                  src={offersUrl}
                  alt="offers"
                  className="max-w-full rounded-2xl object-contain"
                  style={{ maxHeight: '85vh', boxShadow: `0 0 60px rgba(var(--primary-rgb),0.2)` }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

