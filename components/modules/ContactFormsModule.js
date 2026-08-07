"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "../ScrollReveal";

export default function ContactFormsModule({ siteData, links }) {
  const sd = siteData || {};
  const whatsappNumber = sd.whatsappNumber || "";
  const showAppointmentForm = sd.showAppointmentForm !== false;
  const showContactForm = sd.showContactForm !== false;
  const hasAnyForm = showAppointmentForm || showContactForm;

  if (!hasAnyForm) return null;

  // Extract fallback WhatsApp number from links if dedicated number is missing
  const fallbackWaLink = (links || []).find(l => l.url && l.url.includes('wa.me/'));
  const fallbackWa = fallbackWaLink ? fallbackWaLink.url.split('wa.me/')[1]?.split('?')[0] : "";
  const finalWaNumber = whatsappNumber || fallbackWa;

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

  return (
    <ScrollReveal>
      <div className="px-6 mb-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#1E293B] mb-2">{activeTab === 'appointment' ? 'طلب موعد' : 'نماذج التواصل'}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {activeTab === 'appointment' ? 'أدخل بياناتك وسنفتح واتساب برسالة جاهزة للإرسال' : 'نماذج بسيطة تُرسل مباشرة إلى واتساب'}
          </p>
          {showAppointmentForm && showContactForm && (
            <div className="flex justify-center items-center gap-2 mb-8">
              <button
                onClick={() => setActiveTab('appointment')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'appointment' ? 'text-white shadow-md' : 'text-gray-500 hover:bg-black/5'}`}
                style={activeTab === 'appointment' ? { background: 'var(--primary-color, #10b981)' } : { background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                طلب استشارة
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'contact' ? 'text-white shadow-md' : 'text-gray-500 hover:bg-black/5'}`}
                style={activeTab === 'contact' ? { background: 'var(--primary-color, #10b981)' } : { background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                تواصل معنا
              </button>
            </div>
          )}
        </div>

        <div className="rounded-3xl p-6 shadow-sm overflow-hidden text-right" dir="rtl" style={{ background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'appointment' && showAppointmentForm ? (
              <motion.div key="appointment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">الاسم</label>
                  <input type="text" placeholder="اسمك الكامل" value={appName} onChange={e => setAppName(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">رقم الجوال</label>
                  <input type="tel" placeholder="05xxxxxxxx" value={appPhone} onChange={e => setAppPhone(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors text-left" dir="ltr" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1">التاريخ المفضل</label>
                    <div className="relative">
                      <input type="date" value={appDate} onChange={e => setAppDate(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.1)' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1E293B] mb-1">الوقت المفضل</label>
                    <div className="relative">
                      <input type="time" value={appTime} onChange={e => setAppTime(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.1)' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">ملاحظات (اختياري)</label>
                  <textarea placeholder="مثال: أفضل الفترة المسائية" value={appNotes} onChange={e => setAppNotes(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors min-h-[100px] resize-y" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.1)' }}></textarea>
                </div>
                <button onClick={handleSendAppointment} className="w-full hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] mt-2" style={{ background: 'var(--primary-color, #10b981)' }}>
                  إرسال عبر واتساب
                </button>
              </motion.div>
            ) : showContactForm ? (
              <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 text-center mb-4">صف حالتك باختصار وسنتواصل معك</p>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">الاسم</label>
                  <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">الجوال</label>
                  <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors text-left" dir="ltr" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1E293B] mb-1">رسالتك</label>
                  <textarea placeholder="اكتب باختصار..." value={contactMessage} onChange={e => setContactMessage(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors min-h-[100px] resize-y" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.1)' }}></textarea>
                </div>
                <button onClick={handleSendContact} className="w-full hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] mt-2" style={{ background: 'var(--primary-color, #10b981)' }}>
                  إرسال عبر واتساب
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </ScrollReveal>
  );
}
