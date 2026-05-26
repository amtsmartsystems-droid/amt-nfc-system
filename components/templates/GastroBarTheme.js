"use client";

import { useEffect } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import ScrollReveal from "../ScrollReveal";

// ══════════════════════════════════════════════════════════════════════
//  GastroBarTheme — "TARTROOM" Gastrobar Style
//  Black bg · Yellow accent · Photo grid · Section-based layout
//  Props: { siteData, siteColors, lang }
// ══════════════════════════════════════════════════════════════════════

const SOCIAL_KW = ["instagram","انستا","telegram","تيليغرام","whatsapp","واتس","tiktok","تيك","facebook","فيسبوك","twitter","تويتر","youtube","يوتيوب","vk","snapchat","سناب","linkedin"];

export default function GastroBarTheme({ cardId, siteData, siteColors, lang = "en" }) {
  const accent  = siteColors?.primary    || "#F5C518";   // gastrobar yellow
  const bgColor = siteColors?.background || "#111111";   // near-black
  const isAr    = lang === "ar";

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", accent);
    const h = accent.replace("#","");
    document.documentElement.style.setProperty("--primary-rgb",
      `${parseInt(h.slice(0,2),16)}, ${parseInt(h.slice(2,4),16)}, ${parseInt(h.slice(4,6),16)}`
    );
  }, [accent, bgColor]);

  const t   = (en, ar) => isAr && ar ? ar : en;
  const sd  = siteData || {};

  const name     = t(sd.name    || "GASTRO BAR",          sd.nameAr);
  const tagline  = t(sd.subtitle|| "Drink & Food",         sd.subtitleAr);
  const about    = t(sd.about   || "A gastropub dedicated to craft beers, a huge selection of styles and exclusive varieties. A variety of snacks and main courses lets you have a bite to eat or enjoy dinner with company.", sd.aboutAr);
  const address  = sd.address || "Main Street, City Center";
  const hours    = sd.hours   || "Mon–Fri 14:00–00:00, Sat–Sun 14:00–01:00";
  const phone    = sd.phoneUrl?.replace("tel:","") || "";
  const links    = sd.links   || [];

  const socialLinks  = links.filter(l => SOCIAL_KW.some(kw => (l.title||"").toLowerCase().includes(kw)));
  const primaryLinks = links.filter(l => !SOCIAL_KW.some(kw => (l.title||"").toLowerCase().includes(kw)));

  // ── Yellow accent button (main CTA) ──
  const YellowBtn = ({ link }) => {
    const label = t(link.title, link.titleAr);
    const { IconComponent } = getIconForLink(link.title || link.titleAr || "");
    const handleClick = () => { if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{}); };
    return (
      <a href={link.url || "#"} onClick={handleClick} target={link.url && link.url !== "#" ? "_blank" : undefined} rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-black text-[14px] uppercase tracking-wider transition-all duration-300 hover:brightness-110 active:scale-95 hover:shadow-[0_0_24px_rgba(var(--primary-rgb),0.45)]"
        style={{ background: accent, color: "#111", boxShadow: `0 4px 20px rgba(var(--primary-rgb),0.30)`, fontFamily:"Cairo,sans-serif" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"rgba(0,0,0,0.15)" }}>
          <IconComponent size={16} color="#111" />
        </div>
        {label}
      </a>
    );
  };

  // ── Dark outline button (secondary) ──
  const OutlineBtn = ({ link }) => {
    const label = t(link.title, link.titleAr);
    const { IconComponent } = getIconForLink(link.title || link.titleAr || "");
    const handleClick = () => { if(cardId) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(()=>{}); };
    return (
      <a href={link.url || "#"} onClick={handleClick} target={link.url && link.url !== "#" ? "_blank" : undefined} rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-[13px] uppercase tracking-wider transition-all duration-300 hover:bg-white/10 active:scale-95"
        style={{ background:"rgba(255,255,255,0.07)", color:"#fff", border:`1px solid rgba(255,255,255,0.12)`, fontFamily:"Cairo,sans-serif" }}>
        <IconComponent size={16} color={accent} />
        {label}
      </a>
    );
  };

  // ── Section Title ──
  const STitle = ({ children, center }) => (
    <h2 className={`text-white font-black uppercase tracking-tight mb-5 ${center?"text-center":""}`}
        style={{ fontSize:"clamp(20px,6vw,26px)", fontFamily:"Cairo,sans-serif", letterSpacing:"-0.01em" }}>
      {children}
    </h2>
  );

  // Feature list item
  const FeatureItem = ({ text }) => (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: accent }}>
        <LucideIcons.ArrowRight size={14} color="#111" />
      </div>
      <p className="text-[13.5px] leading-relaxed text-white/75" style={{ fontFamily:"Cairo,sans-serif" }}>
        {text}
      </p>
    </div>
  );

  return (
    <div
      className="w-full min-h-screen flex flex-col overflow-x-hidden"
      dir={isAr ? "rtl" : "ltr"}
      style={{ background: bgColor, fontFamily: "Cairo,sans-serif" }}
    >
      {/* ══════════════════════════════════════════
          HERO — Logo + photo collage + headline
      ══════════════════════════════════════════ */}
      <section className="relative w-full flex-shrink-0" style={{ isolation: "isolate" }}>

        {/* Image Grid — strict height, all images absolute-filled, overflow-hidden wrapper */}
        <div className="relative w-full overflow-hidden" style={{ height: "260px" }}>
          <div className="grid grid-cols-2 gap-[3px] w-full h-full">
            <div className="relative overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop"
                alt="" fill priority style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="grid grid-rows-2 gap-[3px] overflow-hidden">
              <div className="relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop"
                  alt="" fill style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1551218372-a8789b81b253?q=80&w=400&auto=format&fit=crop"
                  alt="" fill style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
          {/* Gradient — contained inside the 260px height box */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{ background: `linear-gradient(transparent, ${bgColor})` }}
          />
        </div>

        {/* Logo badge — z-10, pointer-events preserved for the badge only */}
        <div className="absolute top-0 inset-x-0 z-10 flex justify-center pointer-events-none">
          <div
            className="mt-4 px-5 py-3 rounded-b-2xl text-center pointer-events-auto"
            style={{
              background: "rgba(17,17,17,0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
            }}
          >
            <div className="flex items-center gap-2 justify-center">
              <LucideIcons.UtensilsCrossed size={18} style={{ color: accent }} />
              <span className="font-black text-white text-[15px] uppercase tracking-[0.2em]">{name}</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] mt-0.5" style={{ color: accent }}>{tagline}</p>
          </div>
        </div>
      </section>

      {/* Headline + Address — relative z-10 so always above any stacking context */}
      <section className="relative z-10 flex-shrink-0 px-5 pt-5 pb-7">
        <h1
          className="text-white font-black uppercase leading-tight mb-3"
          style={{ fontSize: "clamp(20px,6.5vw,28px)", fontFamily: "Cairo,sans-serif" }}
        >
          {about.substring(0, 60)}{about.length > 60 ? "…" : ""}
        </h1>
        {address && (
          <div className="flex items-center gap-2 mb-6">
            <LucideIcons.MapPin size={14} style={{ color: accent }} className="flex-shrink-0" />
            <p className="text-[12.5px] text-white/50" style={{ fontFamily: "Cairo,sans-serif" }}>{address}</p>
          </div>
        )}
        {/* CTA button — relative z-10 makes it always clickable */}
        {primaryLinks[0] && (
          <div className="relative z-10">
            <YellowBtn link={primaryLinks[0]} />
          </div>
        )}
      </section>


      {/* ══════════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════════ */}
      <section className="px-5 pt-6 pb-8" style={{ borderTop:`1px solid rgba(255,255,255,0.06)` }}>
        <STitle>{t(`${name} — THIS IS`, `${name} — هذا هو`)}</STitle>
        <FeatureItem text={t("A gastropub dedicated to craft beers and cider. A huge selection of styles and exclusive varieties.", "غاستروبار متخصص في البيرة الحرفية. تشكيلة ضخمة من الأنواع الحصرية.")} />
        <FeatureItem text={t("A variety of snacks and main courses lets you have a bite or enjoy dinner with company.", "تنوع في المقبلات والأطباق الرئيسية يتيح لك تناول وجبة خفيفة أو عشاء مع الأصحاب.")} />
        <FeatureItem text={t("Tastings and gastro-dinners with craft beer and cider producers.", "جلسات تذوق وعشاء غاسترونومي مع منتجي البيرة الحرفية والسيدر.")} />
        <FeatureItem text={t("A warm atmosphere for those who appreciate good drinks with friends.", "أجواء دافئة لمن يقدّر المشروبات الجيدة برفقة الأصدقاء.")} />
      </section>

      {/* ══════════════════════════════════════════
          FOOD SECTION — photo + menu button
      ══════════════════════════════════════════ */}
      <section className="pb-8" style={{ borderTop:`1px solid rgba(255,255,255,0.06)` }}>
        <div className="px-5 pt-7 mb-5">
          <STitle center>{t("WHAT TO EAT", "ماذا تأكل")}</STitle>
        </div>
        {/* Photo carousel-style */}
        <div className="relative mx-5 rounded-2xl overflow-hidden mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-[190px]">
          <Image src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop"
               alt="food" fill style={{ objectFit: 'cover' }} />
          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0,1,2].map(i=>(
              <div key={i} className="rounded-full transition-all" style={{ width: i===0?"18px":"6px", height:"6px", background: i===0?accent:"rgba(255,255,255,0.4)" }} />
            ))}
          </div>
        </div>
        <div className="px-5">
          {primaryLinks.find(l=>(l.title||"").toLowerCase().includes("menu")||("منيو قائمة").includes((l.titleAr||"").toLowerCase())) ? (
            <YellowBtn link={primaryLinks.find(l=>(l.title||"").toLowerCase().includes("menu"))} />
          ) : primaryLinks[1] ? (
            <YellowBtn link={primaryLinks[1]} />
          ) : null}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EVENTS SECTION — fully dynamic from siteData.events
      ══════════════════════════════════════════ */}
      <section className="px-5 pb-8" style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div className="pt-7 mb-5">
          <STitle>{t("EVENTS", "الفعاليات")}</STitle>
        </div>

        {(!sd.events || sd.events.length === 0) ? (
          /* Empty state */
          <div
            className="flex flex-col items-center gap-3 py-10 rounded-2xl text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px dashed ${accent}33` }}
          >
            <LucideIcons.CalendarDays size={28} style={{ color: accent, opacity: 0.3 }} />
            <p className="text-[13px] text-white/30" style={{ fontFamily: "Cairo,sans-serif" }}>
              {t("No events yet — add them from the admin panel", "لا توجد فعاليات بعد — أضفها من لوحة التحكم")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sd.events.map((ev) => (
              <div
                key={ev.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${accent}33` }}
              >
                {/* Event header */}
                <div
                  className="px-4 py-4"
                  style={{ background: `${accent}18`, borderBottom: `1px solid ${accent}22` }}
                >
                  <h3
                    className="font-black text-white uppercase text-[14px]"
                    style={{ fontFamily: "Cairo,sans-serif" }}
                  >
                    {t(ev.titleEn || ev.title, ev.title)}
                  </h3>
                </div>
                {/* Event body */}
                <div className="px-4 py-4">
                  {(t(ev.descEn || ev.desc, ev.desc) || "").split("،").filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2.5 mb-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                        style={{ background: accent }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      </div>
                      <p className="text-[12.5px] text-white/65 leading-relaxed" style={{ fontFamily: "Cairo,sans-serif" }}>
                        {line.trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          SOCIAL CHANNELS SECTION
      ══════════════════════════════════════════ */}
      {(socialLinks.length > 0 || primaryLinks.length > 2) && (
        <section className="px-5 pb-8" style={{ borderTop:`1px solid rgba(255,255,255,0.06)` }}>
          <div className="pt-7 mb-2"><STitle center>{t("OUR CHANNELS", "قنواتنا")}</STitle></div>
          <p className="text-center text-[13px] text-white/45 mb-6" style={{ fontFamily:"Cairo,sans-serif" }}>
            {t("Stay up to date with news and events.", "تابع أحدث أخبارنا وفعالياتنا.")}
          </p>
          
          {/* Social links as wide buttons */}
          {socialLinks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {socialLinks.map(lk => (
                <ScrollReveal key={lk.id} yOffset={30}>
                  <OutlineBtn link={lk} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center opacity-20" style={{ background: accent }}>
                <LucideIcons.Send size={22} color="#111" />
              </div>
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center opacity-20" style={{ background: accent }}>
                <LucideIcons.Camera size={22} color="#111" />
              </div>
            </div>
          )}

          {/* Remaining primary links */}
          {primaryLinks.length > 2 && (
            <div className="flex flex-col gap-3 mt-3">
              {primaryLinks.slice(2).map(lk => (
                <ScrollReveal key={lk.id} yOffset={30}>
                  <YellowBtn link={lk} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════
          CONTACTS SECTION
      ══════════════════════════════════════════ */}
      <section className="px-5 pb-12" style={{ borderTop:`1px solid rgba(255,255,255,0.06)` }}>
        <div className="pt-7 mb-5"><STitle>{t("CONTACTS", "التواصل")}</STitle></div>
        <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
          {/* Map image */}
          <div className="relative h-[130px] overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
                 alt="map" fill style={{ objectFit: 'cover' }} className="opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <LucideIcons.MapPin size={32} style={{ color: accent }} className="drop-shadow-xl -mt-2" />
            </div>
          </div>
          {/* Info rows */}
          <div className="p-4 space-y-3">
            {address && (
              <div className="flex items-start gap-3">
                <LucideIcons.MapPin size={15} style={{ color: accent }} className="flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-white/70" style={{ fontFamily:"Cairo,sans-serif" }}>{address}</p>
              </div>
            )}
            {hours && (
              <div className="flex items-start gap-3">
                <LucideIcons.Clock size={15} style={{ color: accent }} className="flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-white/70" style={{ fontFamily:"Cairo,sans-serif" }}>{hours}</p>
              </div>
            )}
            {phone && (
              <div className="flex items-start gap-3">
                <LucideIcons.Phone size={15} style={{ color: accent }} className="flex-shrink-0 mt-0.5" />
                <a href={`tel:${phone}`} className="text-[13px] transition-colors hover:opacity-100"
                   style={{ color: accent, fontFamily:"Cairo,sans-serif" }}>{phone}</a>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
