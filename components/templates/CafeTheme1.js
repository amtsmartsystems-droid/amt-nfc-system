"use client";

import { useEffect } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import ScrollReveal from "../ScrollReveal";

// ══════════════════════════════════════════════════════════════════════
//  CafeTheme1 — "Sticky Wicks" Style
//  Dark espresso bg · circular logo badge · pill buttons · social icons
//  Props: { siteData, siteColors, lang }
// ══════════════════════════════════════════════════════════════════════
export default function CafeTheme1({ cardId, siteData, siteColors, lang = "en" }) {
  const primary    = siteColors?.primary    || "#C9A96E";   // warm gold
  const bgDark     = siteColors?.background || "#2C1503";   // espresso brown
  const isAr       = lang === "ar";

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

  const name     = t(sd.name     || "STICKY WICKS",           sd.nameAr);
  const subtitle = t(sd.subtitle || "Your local bakery · Est. 1972", sd.subtitleAr);
  const links    = sd.links || [];

  // ── Categorize links: social vs regular ──
  const SOCIAL_KEYWORDS = ["instagram","انستا","تيك توك","tiktok","youtube","يوتيوب","facebook","twitter","تويتر","فيسبوك","snapchat","سناب","linkedin","threads"];
  const socialLinks  = links.filter(l => SOCIAL_KEYWORDS.some(kw => (l.title||"").toLowerCase().includes(kw)));
  const regularLinks = links.filter(l => !SOCIAL_KEYWORDS.some(kw => (l.title||"").toLowerCase().includes(kw)));

  // ── Pill Button (main links) ──
  const PillBtn = ({ link }) => {
    const label = t(link.title, link.titleAr);
    const handleClick = () => {
      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});
    };
    return (
      <a
        href={link.url || "#"}
        onClick={handleClick}
        target={link.url && link.url !== "#" ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-full py-[18px] rounded-full font-semibold text-[14.5px] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.97]"
        style={{
          background: "rgba(255,255,255,0.97)",
          color: bgDark,
          boxShadow: "0 4px 20px rgba(0,0,0,0.30)",
          fontFamily: "Cairo, sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </a>
    );
  };

  // ── Social Icon Button ──
  const SocialBtn = ({ link }) => {
    const { IconComponent } = getIconForLink(link.title || link.titleAr || "");
    const handleClick = () => {
      if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{});
    };
    return (
      <a
        href={link.url || "#"}
        onClick={handleClick}
        target={link.url && link.url !== "#" ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95"
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
        }}
      >
        <IconComponent size={20} color="#fff" />
      </a>
    );
  };

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      dir={isAr ? "rtl" : "ltr"}
      style={{ background: bgDark, fontFamily: "Cairo, sans-serif" }}
    >
      {/* ══════════════════════════════════════════
          HERO SECTION — Full bleed coffee image
      ══════════════════════════════════════════ */}
      <section className="relative w-full h-[52vh] overflow-hidden">
        {/* Background hero image */}
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
          alt="Hero"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />

        {/* Gradient: transparent top → dark bottom (matches reference) */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, transparent 45%, ${bgDark}CC 80%, ${bgDark} 100%)`,
          }}
        />

        {/* ── Logo Badge (centered on image) ── */}
        <div className="absolute inset-x-0 top-0 flex justify-center pt-10 z-10">
          <div
            className="w-[88px] h-[88px] rounded-full flex flex-col items-center justify-center shadow-2xl border-2 border-white/20"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${primary}EE, ${primary}AA)`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 3px rgba(var(--primary-rgb), 0.25)`,
            }}
          >
            <span
              className="text-white font-black text-center leading-tight uppercase"
              style={{
                fontSize: name.length > 8 ? "9px" : "11px",
                textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                maxWidth: "70px",
                wordBreak: "break-word",
                textAlign: "center",
              }}
            >
              {name}
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          IDENTITY SECTION
      ══════════════════════════════════════════ */}
      <section className="px-6 pt-5 pb-6 text-center">
        <h1
          className="font-black text-white text-[22px] mb-1 tracking-wide"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          {name}
        </h1>
        <p
          className="text-[13.5px] font-medium"
          style={{ color: "rgba(255,255,255,0.50)", fontFamily: "Cairo, sans-serif" }}
        >
          {subtitle}
        </p>
      </section>

      {/* ══════════════════════════════════════════
          PILL BUTTONS — main links
      ══════════════════════════════════════════ */}
      <section className="px-5 pb-6 space-y-3">
        {regularLinks.length > 0 ? (
          regularLinks.map((lk) => (
            <ScrollReveal key={lk.id} yOffset={30}>
              <PillBtn link={lk} />
            </ScrollReveal>
          ))
        ) : (
          /* Empty state with placeholder pills */
          ["القائمة", "احجز طاولة", "تواصل معنا"].map((txt, i) => (
            <div
              key={i}
              className="flex items-center justify-center w-full py-[18px] rounded-full text-[14px] font-semibold opacity-20"
              style={{ background: "rgba(255,255,255,0.9)", color: bgDark }}
            >
              {txt}
            </div>
          ))
        )}
      </section>

      {/* ══════════════════════════════════════════
          SOCIAL ICONS ROW
      ══════════════════════════════════════════ */}
      {socialLinks.length > 0 && (
        <section className="flex justify-center gap-4 pb-8">
          {socialLinks.map((lk) => (
            <ScrollReveal key={lk.id} yOffset={20}>
              <SocialBtn link={lk} />
            </ScrollReveal>
          ))}
        </section>
      )}

      {/* ── If no social links, show placeholder icons ── */}
      {socialLinks.length === 0 && (
        <section className="flex justify-center gap-4 pb-8">
          {[LucideIcons.Camera, LucideIcons.Music2, LucideIcons.Play].map((Ic, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full flex items-center justify-center opacity-20"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <Ic size={20} color="#fff" />
            </div>
          ))}
        </section>
      )}

      {/* ══════════════════════════════════════════
          BOTTOM IMAGE SECTION
      ══════════════════════════════════════════ */}
      <section className="relative w-full h-[38vh] overflow-hidden">
        {/* Gradient fade from dark at top into image */}
        <div
          className="absolute inset-x-0 top-0 h-16 z-10 pointer-events-none"
          style={{ background: `linear-gradient(180deg, ${bgDark} 0%, transparent 100%)` }}
        />
        <Image
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop"
          alt="Coffee beans"
          fill
          style={{ objectFit: 'cover' }}
        />
      </section>
    </div>
  );
}
