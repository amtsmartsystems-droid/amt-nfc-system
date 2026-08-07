"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getIconForLink } from "../../utils/icons";
import * as LucideIcons from "lucide-react";
import { EditableText, EditableImage } from "../EditableElements";
import ScrollReveal from "../ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorTheme({
  cardId,
  siteData,
  siteColors,
  lang = "ar",
  menuCategories,
  isPreview,
  onUpdateLayoutBlocks,
  isWYSIWYG,
  onUpdateField,
  onImageUpload,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
  footerComponent
}) {
  const primary = siteColors?.primary || "#0F7A8A";
  const bg = siteColors?.background || "#F4F7F9";
  const isAr = true; // Force RTL for Arabic doctor theme by default

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", primary);
    document.documentElement.style.setProperty("--bg-color", bg);
  }, [primary, bg]);

  const sd = siteData || {};
  const name = sd.name || "";
  const sub = sd.subtitle || "";
  const about = sd.about || "";
  const links = sd.links || [];
  const faqs = sd.faqs || [];
  const whatsappNumber = sd.whatsappNumber || "";
  const googleReviewUrl = sd.googleReviewUrl || "";

  const profileImg = sd.images?.profile || "";
  
  // Toggles for forms (default true)
  const showAppointmentForm = sd.showAppointmentForm !== false;
  const showContactForm = sd.showContactForm !== false;
  const hasAnyForm = showAppointmentForm || showContactForm;

  // Extract fallback WhatsApp number from links if dedicated number is missing
  const fallbackWaLink = links.find(l => l.url && l.url.includes('wa.me/'));
  const fallbackWa = fallbackWaLink ? fallbackWaLink.url.split('wa.me/')[1]?.split('?')[0] : "";
  const finalWaNumber = whatsappNumber || fallbackWa;

  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState(showAppointmentForm ? "appointment" : "contact");

  // Form states
  const [appName, setAppName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appDate, setAppDate] = useState('');
  const [appTime, setAppTime] = useState('');
  const [appNotes, setAppNotes] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleSendAppointment = () => {
    if (!finalWaNumber) {
      alert("رقم الواتساب غير متوفر. يرجى إضافة الرقم من الإعدادات.");
      return;
    }
    const text = `مرحباً، أود طلب موعد:
الاسم: ${appName}
الجوال: ${appPhone}
التاريخ المفضل: ${appDate}
الوقت المفضل: ${appTime}
ملاحظات: ${appNotes}`;
    window.open(`https://wa.me/${finalWaNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendContact = () => {
    if (!finalWaNumber) {
      alert("رقم الواتساب غير متوفر. يرجى إضافة الرقم من الإعدادات.");
      return;
    }
    const text = `مرحباً:
الاسم: ${contactName}
الجوال: ${contactPhone}
الرسالة: ${contactMessage}`;
    window.open(`https://wa.me/${finalWaNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── Dynamic Link Button ──
  const LinkBtn = ({ link }) => {
    const label = link.title || link.titleAr;
    const { IconComponent, color } = getIconForLink(label);
    const handleClick = (e) => {
      if (cardId && !isPreview) fetch('/api/clicks', { method: 'POST', body: JSON.stringify({ cardId, linkId: link.id || link._id }) }).catch(() => { });
    };
    return (
      <a
        href={link.url || "#"}
        onClick={handleClick}
        target={link.url && link.url !== "#" ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl font-bold text-[14px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white border border-[#E2E8F0] text-[#1E293B]"
        style={{ fontFamily: "Cairo,sans-serif" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-[var(--primary-color)]">
          {link.iconUrl ? (
            <img src={link.iconUrl} alt={label} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <IconComponent size={20} color={primary} />
          )}
        </div>
        <span className="flex-1 truncate">{label}</span>
        <LucideIcons.ChevronLeft size={18} className="text-gray-400" />
      </a>
    );
  };

  return (
    <div className="min-h-screen relative font-[Cairo,sans-serif]" style={{ backgroundColor: bg }} dir="rtl">
      <div className="max-w-[480px] mx-auto min-h-screen bg-white/40 shadow-2xl relative overflow-hidden pb-32">
        
        {/* PROFILE ONLY (No Cover Banner) */}
        <div className="relative px-6 pt-12 flex flex-col items-center">
          <div className="w-[120px] h-[120px] rounded-[30px] border-4 border-white shadow-xl overflow-hidden bg-white">
            <EditableImage
              src={profileImg || "https://images.unsplash.com/photo-1612349317150-e410f624c427?q=80&w=400&auto=format&fit=crop"}
              alt="Profile"
              className="w-full h-full object-cover"
              onUpload={(file) => onImageUpload(file, "images.profile")}
              isEditing={isWYSIWYG}
            />
          </div>

          <div className="mt-4 text-center w-full">
            <h1 className="text-2xl font-black text-[#1E293B] mb-2">
              <EditableText value={name} onChange={(v) => onUpdateField("name", v)} isEditing={isWYSIWYG} fallback="اسم العيادة / الطبيب" />
            </h1>
            <p className="text-[15px] font-medium text-[var(--primary-color)] mb-4">
              <EditableText value={sub} onChange={(v) => onUpdateField("subtitle", v)} isEditing={isWYSIWYG} fallback="التخصص الطبي" />
            </p>
            {about && (
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-[90%] mx-auto mb-6">
                <EditableText value={about} onChange={(v) => onUpdateField("about", v)} isEditing={isWYSIWYG} fallback="وصف قصير عن الطبيب أو العيادة" />
              </p>
            )}
          </div>
        </div>

        {/* LINKS SECTION */}
        {links?.length > 0 && (
          <ScrollReveal>
            <div className="px-6 space-y-3 mb-10">
              {links.map((link, idx) => (
                <LinkBtn key={link.id || link._id || idx} link={link} />
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* SERVICES SECTION */}
        {menuCategories?.length > 0 && menuCategories.some(c => c.items?.length > 0) && (
          <ScrollReveal>
            <div className="px-6 mb-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-[#1E293B] mb-1">الخدمات</h2>
                <p className="text-sm text-gray-500">ما نقدمه لمرضانا</p>
              </div>
              <div className="space-y-4">
                {menuCategories.map(cat => cat.items?.map(item => (
                  <div key={item.id || item._id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#1E293B] text-[16px] mb-2">{item.name || item.nameAr}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc || item.descAr}</p>
                      </div>
                      {(item.priceLabel || item.price > 0) && (
                        <div className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                          {item.priceLabel || `${item.price} ر.س`}
                        </div>
                      )}
                    </div>
                  </div>
                )))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* FAQ SECTION */}
        {faqs?.length > 0 && (
          <ScrollReveal>
            <div className="px-6 mb-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-[#1E293B] mb-1">الأسئلة الشائعة</h2>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-right outline-none"
                    >
                      <span className="font-bold text-[#1E293B] text-[15px]">{faq.question}</span>
                      <LucideIcons.ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-5 pb-4 text-sm text-gray-500 leading-relaxed"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* GOOGLE REVIEW SECTION */}
        {googleReviewUrl && (
          <ScrollReveal>
            <div className="px-6 mb-12 text-center">
              <h2 className="text-2xl font-black text-[#1E293B] mb-2">آراؤكم تهمنا</h2>
              <p className="text-sm text-gray-500 mb-6">شاركنا تجربتك على Google</p>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-white border border-[#E2E8F0] text-[#1E293B] font-bold py-3 px-8 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                اترك تقييماً على Google
                <LucideIcons.Star className="text-yellow-400" fill="currentColor" size={20} />
              </a>
            </div>
          </ScrollReveal>
        )}

        {footerComponent}

      </div>
    </div>
  );
}
