"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

// ══════════════════════════════════════════════════════════════════════
//  SchoolCardTheme — AMT School Card (بطاقة الأطفال)
//  للطوارئ: زر اتصال سريع + ملف طبي مصغر
//  Child Safety Card — helps reunite lost children with their parents
// ══════════════════════════════════════════════════════════════════════

function SlideIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ── One-Click Call Button ──
function CallButton({ label, phone, icon: Icon, color, bg, pulse = false }) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  return (
    <a
      href={`tel:${cleanPhone}`}
      className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-black text-white text-[15px] transition-all duration-300 active:scale-[0.97] select-none relative overflow-hidden${pulse ? " school-pulse" : ""}`}
      style={{
        background: bg || color,
        boxShadow: `0 8px 24px ${color}55`,
        fontFamily: "Cairo,sans-serif",
        textDecoration: "none",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.18)" }}
      >
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <span className="flex-1">{label}</span>
      <LucideIcons.ChevronLeft size={20} style={{ opacity: 0.7 }} />
    </a>
  );
}

// ── WhatsApp Urgent Button ──
function WhatsAppButton({ phone, childName }) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const msg = encodeURIComponent(
    `مرحباً، لقد عثرت على طفلكم${childName ? " " + childName : ""}. أرجو التواصل معي في أقرب وقت ممكن. شكراً.`
  );
  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-black text-white text-[15px] transition-all duration-300 active:scale-[0.97] select-none"
      style={{
        background: "linear-gradient(135deg,#25d366,#128C7E)",
        boxShadow: "0 8px 24px rgba(37,211,102,0.4)",
        fontFamily: "Cairo,sans-serif",
        textDecoration: "none",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.18)" }}
      >
        <LucideIcons.MessageCircle size={22} strokeWidth={2.5} />
      </div>
      <span className="flex-1">💬 رسالة واتساب عاجلة</span>
      <LucideIcons.ChevronLeft size={20} style={{ opacity: 0.7 }} />
    </a>
  );
}

// ── Medical ID Field Row ──
function MedField({ icon: Icon, label, value, color }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}18` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <span
          className="block text-[11px] font-bold uppercase tracking-widest mb-0.5"
          style={{ color: `${color}99`, fontFamily: "Cairo,sans-serif" }}
        >
          {label}
        </span>
        <span
          className="text-[14px] font-bold text-[#1E293B]"
          style={{ fontFamily: "Cairo,sans-serif" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function SchoolCardTheme({
  cardId,
  siteData = {},
  siteColors,
  lang = "ar",
  footerComponent,
}) {
  const sd      = siteData;
  const isAr    = lang === "ar";
  const t       = (en, ar) => (isAr && ar ? ar : en);
  const accent  = siteColors?.primary   || "#1E88E5"; // School Blue
  const bgColor = siteColors?.background || "#EFF6FF"; // Light blue bg

  // ── Child info ──
  const childName     = t(sd.name,     sd.nameAr)     || "الطفل";
  const childClass    = t(sd.subtitle, sd.subtitleAr)  || "";
  const childPhoto    = sd.images?.profile || sd.profileImage || null;

  // ── Emergency contacts ──
  const fatherPhone   = sd.fatherPhone   || sd.whatsappNumber || "";
  const motherPhone   = sd.motherPhone   || "";
  const whatsappPhone = sd.whatsappNumber || fatherPhone || "";

  // ── Medical ID ──
  const bloodType     = sd.bloodType    || "";
  const allergies     = sd.allergies    || "";
  const conditions    = sd.conditions   || "";
  const medNotes      = sd.medNotes     || "";

  const hasMedicalData = bloodType || allergies || conditions || medNotes;

  return (
    <div
      className="min-h-screen font-sans relative overflow-hidden"
      style={{ background: bgColor }}
      dir="rtl"
    >
      {/* ── Inline pulse animation ── */}
      <style>{`
        @keyframes schoolPulse {
          0%,100% { box-shadow: 0 8px 24px rgba(239,68,68,0.4); }
          50%      { box-shadow: 0 8px 24px rgba(239,68,68,0.4), 0 0 0 10px rgba(239,68,68,0.1); }
        }
        .school-pulse { animation: schoolPulse 1.8s ease-in-out infinite; }
      `}</style>

      {/* ── Soft top wave ── */}
      <div
        className="absolute top-0 inset-x-0 h-72 z-0 pointer-events-none"
        style={{
          background: `linear-gradient(160deg, ${accent}22 0%, transparent 70%)`,
          borderRadius: "0 0 60% 60% / 0 0 30% 30%",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-[480px] mx-auto min-h-screen pb-24">

        {/* ════ HEADER STRIP ════ */}
        <SlideIn delay={0}>
          <div
            className="flex items-center justify-center gap-3 py-4 px-6 mb-2"
            style={{
              background: accent,
              boxShadow: `0 4px 20px ${accent}44`,
            }}
          >
            <LucideIcons.ShieldAlert size={20} color="#fff" />
            <span
              className="font-black text-white text-[14px] tracking-widest uppercase"
              style={{ fontFamily: "Cairo,sans-serif" }}
            >
              {t("Child Safety Card", "بطاقة طفل — حالة طوارئ")}
            </span>
          </div>
        </SlideIn>

        {/* ════ CHILD PROFILE ════ */}
        <SlideIn delay={0.06}>
          <div className="flex flex-col items-center pt-8 pb-6 px-6 text-center">
            {/* Photo */}
            <div
              className="w-32 h-32 rounded-full overflow-hidden mb-5 flex items-center justify-center"
              style={{
                boxShadow: `0 0 0 4px ${accent}33, 0 12px 40px ${accent}33`,
                background: `${accent}15`,
              }}
            >
              {childPhoto ? (
                <img
                  src={childPhoto}
                  alt={childName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <LucideIcons.Baby size={52} style={{ color: accent }} />
              )}
            </div>

            {/* Name */}
            <h1
              className="font-black text-[32px] text-[#1E293B] mb-2 leading-tight"
              style={{ fontFamily: "Cairo,sans-serif" }}
            >
              {childName}
            </h1>

            {/* Class / Grade */}
            {childClass && (
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{
                  background: `${accent}18`,
                  border: `1px solid ${accent}33`,
                }}
              >
                <LucideIcons.GraduationCap size={14} style={{ color: accent }} />
                <span
                  className="font-bold text-[13px]"
                  style={{ color: accent, fontFamily: "Cairo,sans-serif" }}
                >
                  {childClass}
                </span>
              </div>
            )}

            {/* Helper prompt */}
            <p
              className="mt-4 text-[13px] text-[#64748b] leading-relaxed max-w-[280px] font-medium"
              style={{ fontFamily: "Cairo,sans-serif" }}
            >
              {t(
                "If you found this child, please contact their parents immediately using the buttons below.",
                "إذا عثرت على هذا الطفل، يرجى التواصل مع أهله فوراً عبر الأزرار أدناه."
              )}
            </p>
          </div>
        </SlideIn>

        {/* ════ EMERGENCY CALL BUTTONS ════ */}
        <SlideIn delay={0.12}>
          <div className="px-6 flex flex-col gap-3 mb-6">
            <p
              className="text-[11px] font-bold uppercase tracking-widest text-center mb-2"
              style={{ color: `${accent}99`, fontFamily: "Cairo,sans-serif" }}
            >
              {t("Emergency Contacts", "أرقام الطوارئ")}
            </p>

            {/* Father */}
            <CallButton
              label={t("Call Father", "📞 اتصال بوالده")}
              phone={fatherPhone}
              icon={LucideIcons.Phone}
              color="#1E88E5"
              bg="linear-gradient(135deg,#1E88E5,#1565C0)"
              pulse
            />

            {/* Mother */}
            <CallButton
              label={t("Call Mother", "📞 اتصال بوالدته")}
              phone={motherPhone}
              icon={LucideIcons.Phone}
              color="#8B5CF6"
              bg="linear-gradient(135deg,#8B5CF6,#6D28D9)"
            />

            {/* WhatsApp */}
            <WhatsAppButton phone={whatsappPhone} childName={childName} />
          </div>
        </SlideIn>

        {/* ════ MEDICAL ID ════ */}
        {hasMedicalData && (
          <SlideIn delay={0.18}>
            <div className="px-6 mb-6">
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(16px)",
                  border: "1.5px solid rgba(239,68,68,0.3)",
                  boxShadow: "0 4px 20px rgba(239,68,68,0.08)",
                }}
              >
                {/* Red top stripe */}
                <div
                  className="absolute top-0 inset-x-0 h-1 rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg,#ef4444,#f97316)" }}
                />

                {/* Header */}
                <div className="flex items-center gap-2 mb-4 pt-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.12)" }}
                  >
                    <LucideIcons.HeartPulse size={18} style={{ color: "#ef4444" }} />
                  </div>
                  <span
                    className="font-black text-[14px] text-[#1E293B]"
                    style={{ fontFamily: "Cairo,sans-serif" }}
                  >
                    {t("Medical ID", "الملف الطبي المصغر")}
                  </span>
                  <span
                    className="mr-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      fontFamily: "Cairo,sans-serif",
                    }}
                  >
                    {t("For Emergency Use", "للإسعاف فقط")}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="mb-4"
                  style={{ height: 1, background: "rgba(239,68,68,0.15)" }}
                />

                <div className="flex flex-col gap-3">
                  <MedField
                    icon={LucideIcons.Droplets}
                    label={t("Blood Type", "فصيلة الدم")}
                    value={bloodType}
                    color="#ef4444"
                  />
                  <MedField
                    icon={LucideIcons.AlertTriangle}
                    label={t("Allergies", "الحساسية")}
                    value={allergies}
                    color="#f97316"
                  />
                  <MedField
                    icon={LucideIcons.Activity}
                    label={t("Chronic Conditions", "أمراض مزمنة")}
                    value={conditions}
                    color="#8B5CF6"
                  />
                  <MedField
                    icon={LucideIcons.FileText}
                    label={t("Notes", "ملاحظات إضافية")}
                    value={medNotes}
                    color="#0ea5e9"
                  />
                </div>

                {/* Emergency disclaimer */}
                <div
                  className="mt-4 rounded-xl p-3 flex items-start gap-2"
                  style={{ background: "rgba(239,68,68,0.06)" }}
                >
                  <LucideIcons.Info size={13} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
                  <p
                    className="text-[11px] text-[#64748b] leading-relaxed"
                    style={{ fontFamily: "Cairo,sans-serif" }}
                  >
                    {t(
                      "This medical information is intended for first responders and emergency personnel only.",
                      "هذه المعلومات الطبية مخصصة لأفراد الإسعاف والطوارئ فقط."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </SlideIn>
        )}

        {/* ════ FOOTER ════ */}
        {footerComponent}

        {/* ── Watermark ── */}
        <div
          style={{
            textAlign: "center",
            paddingBottom: 32,
            paddingTop: 16,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <a
            href="https://amt-nfc-system.vercel.app/AMT"
            target="_blank"
            rel="noopener noreferrer"
            className="amt-brand-link"
          >
            <span className="amt-brand-text">Powered by AMT Smart Systems</span>
          </a>
        </div>
      </div>
    </div>
  );
}
