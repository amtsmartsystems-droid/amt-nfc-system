"use client";

import Image from "next/image";
import * as LucideIcons from "lucide-react";

// ══════════════════════════════════════════════════════════════════════
//  AMTBusinessCard — صفحة الهبوط الشخصية لشركة AMT Tech Solutions
//  تُعرض عندما cardType === 'business_card'
// ══════════════════════════════════════════════════════════════════════

const WHATSAPP_MSG = encodeURIComponent(
    "مرحباً AMT، أريد الاستفسار عن نظام المنيو الذكي وبطاقات NFC لمطعمي 🍽️"
);
const WHATSAPP_URL = `https://wa.me/966782786585?text=${WHATSAPP_MSG}`;
const DEMO_VIDEO_URL  = "https://youtu.be/dQw4w9WgXcQ";
const DEMO_MENU_URL   = "/hanayen";
const AMT_CARD_URL    = "/amt";

export default function AMTBusinessCard() {
    return (
        <div
            className="w-full min-h-screen flex flex-col"
            style={{ background: "linear-gradient(160deg,#0a0f1c 0%,#0d1526 55%,#0a0f1c 100%)", fontFamily: "Cairo,sans-serif" }}
            dir="rtl"
        >
            {/* ══ HEADER / IDENTITY ══ */}
            <section className="flex flex-col items-center pt-14 pb-8 px-6 text-center">
                {/* شعار دائري */}
                <div
                    className="w-28 h-28 rounded-full flex items-center justify-center mb-5 shadow-2xl"
                    style={{
                        background: "linear-gradient(135deg,#f5c518 0%,#e8a800 100%)",
                        boxShadow: "0 0 0 4px rgba(245,197,24,0.18), 0 12px 40px rgba(245,197,24,0.30)",
                    }}
                >
                    <span
                        className="font-black tracking-tight"
                        style={{ fontSize: 32, color: "#0a0f1c", letterSpacing: "-0.05em", lineHeight: 1 }}
                    >
                        AMT
                    </span>
                </div>

                <h1
                    className="font-black text-white mb-3"
                    style={{ fontSize: "clamp(22px,7vw,28px)", letterSpacing: "-0.02em", lineHeight: 1.2 }}
                >
                    AMT Tech Solutions
                </h1>

                <p
                    className="text-[14px] leading-[1.8] max-w-[280px]"
                    style={{ color: "rgba(255,255,255,0.62)" }}
                >
                    نؤتمت مطعمك ونحوّل طاولاتك إلى نقاط بيع ذكية 🚀
                </p>
            </section>

            {/* ══ CALL TO ACTION (Pulse) ══ */}
            <section className="px-5 pb-7">
                <style>{`
                    @keyframes amtPulse {
                        0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.65), 0 8px 28px rgba(22,163,74,0.35); }
                        50%      { box-shadow: 0 0 0 14px rgba(22,163,74,0), 0 8px 28px rgba(22,163,74,0.35); }
                    }
                    .amt-pulse { animation: amtPulse 2s ease-in-out infinite; }
                `}</style>

                <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="amt-pulse flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black text-white text-[15px] transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
                    style={{
                        background: "linear-gradient(135deg,#16a34a 0%,#15803d 100%)",
                        letterSpacing: "0.01em",
                    }}
                >
                    <LucideIcons.MessageCircle size={20} />
                    💬 اطلب المنيو الذكي لمطعمك الآن
                </a>
            </section>

            {/* ══ PROOF OF CONCEPT ══ */}
            <section className="px-5 pb-7">
                <p
                    className="text-[11px] font-bold uppercase tracking-widest mb-4 text-center"
                    style={{ color: "rgba(245,197,24,0.7)" }}
                >
                    جرّب بنفسك
                </p>
                <div className="flex flex-col gap-3">
                    <a
                        href={DEMO_VIDEO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-[13.5px] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)",
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ background: "rgba(239,68,68,0.15)" }}
                        >
                            <LucideIcons.Play size={18} color="#ef4444" />
                        </div>
                        <span className="flex-1">📱 شاهد سرعة النظام</span>
                        <LucideIcons.ChevronLeft size={16} color="rgba(255,255,255,0.35)" />
                    </a>

                    <a
                        href={DEMO_MENU_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-[13.5px] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)",
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ background: "rgba(245,197,24,0.15)" }}
                        >
                            <LucideIcons.UtensilsCrossed size={18} color="#f5c518" />
                        </div>
                        <span className="flex-1">🍔 جرب المنيو الحي بنفسك</span>
                        <LucideIcons.ChevronLeft size={16} color="rgba(255,255,255,0.35)" />
                    </a>
                </div>
            </section>

            {/* ══ OUR SERVICES ══ */}
            <section className="px-5 pb-8">
                <p
                    className="text-[11px] font-bold uppercase tracking-widest mb-4 text-center"
                    style={{ color: "rgba(245,197,24,0.7)" }}
                >
                    خدماتنا التقنية
                </p>
                <div
                    className="flex items-center gap-4 px-5 py-5 rounded-2xl"
                    style={{
                        background: "linear-gradient(135deg, rgba(245,197,24,0.08) 0%, rgba(245,197,24,0.04) 100%)",
                        border: "1px solid rgba(245,197,24,0.18)",
                    }}
                >
                    <div
                        className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                        style={{ background: "rgba(245,197,24,0.15)" }}
                    >
                        <LucideIcons.CreditCard size={22} color="#f5c518" />
                    </div>
                    <p className="text-[13.5px] leading-[1.7] text-white font-bold">
                        💳 برمجة وتوريد بطاقات الـ NFC الذكية للمطاعم والكافيهات
                    </p>
                </div>
            </section>

            {/* ══ DIVIDER ══ */}
            <div className="mx-5 mb-8" style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

            {/* ══ FOOTER ══ */}
            <footer className="flex flex-col items-center gap-4 pb-12 px-5 mt-auto">
                {/* Social icons */}
                <div className="flex gap-3">
                    <a
                        href="https://www.facebook.com/amt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                        <LucideIcons.Facebook size={18} color="#1877f2" />
                    </a>
                    <a
                        href="mailto:info@amt-tech.com"
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                        <LucideIcons.Mail size={18} color="#f5c518" />
                    </a>
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                        <LucideIcons.MessageCircle size={18} color="#25d366" />
                    </a>
                </div>

                {/* Copyright */}
                <p className="text-[11.5px] text-center" style={{ color: "rgba(255,255,255,0.30)", lineHeight: 1.7 }}>
                    © 2026 AMT Tech Solutions. جميع الحقوق محفوظة.
                </p>
            </footer>
        </div>
    );
}
