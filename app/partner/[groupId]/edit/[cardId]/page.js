'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ClientCardViewer from '../../../../[cardId]/ClientCardViewer';
import { Settings, Palette, LayoutTemplate, X, Check } from 'lucide-react';

// ── Smart link icon detector ──────────────────────────────────────────
function detectLinkIcon(url = '') {
    const u = url.toLowerCase();
    if (u.includes('wa.me') || u.includes('whatsapp'))  return { icon: '💬', label: 'WhatsApp' };
    if (u.includes('instagram'))                         return { icon: '📸', label: 'Instagram' };
    if (u.includes('facebook') || u.includes('fb.com')) return { icon: '👤', label: 'Facebook' };
    if (u.includes('twitter') || u.includes('x.com'))   return { icon: '🐦', label: 'X / Twitter' };
    if (u.includes('tiktok'))                           return { icon: '🎵', label: 'TikTok' };
    if (u.includes('youtube'))                          return { icon: '▶️', label: 'YouTube' };
    if (u.includes('maps.google') || u.includes('goo.gl/maps') || u.includes('maps.app')) return { icon: '📍', label: 'Google Maps' };
    if (u.includes('snapchat'))                         return { icon: '👻', label: 'Snapchat' };
    if (u.includes('linkedin'))                         return { icon: '💼', label: 'LinkedIn' };
    if (u.includes('tel:') || u.startsWith('tel'))      return { icon: '📞', label: 'اتصال' };
    if (u.includes('mailto:'))                          return { icon: '📧', label: 'بريد' };
    if (u.includes('cliq') || u.includes('jokpay'))    return { icon: '💳', label: 'CliQ' };
    return { icon: '🔗', label: 'رابط' };
}

const GOLD = '#B99146';
const GOLD_LIGHT = '#EDD98A';
const BG = '#0f0f0f';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(185,145,70,0.18)';

export default function PartnerEditCardPage({ params }) {
    const { groupId, cardId } = params;
    const router = useRouter();

    const [card, setCard]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [saved, setSaved]     = useState(false);
    const [error, setError]     = useState('');

    // Editable fields
    const [name, setName]         = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [address, setAddress]   = useState('');
    const [hours, setHours]       = useState('');
    const [links, setLinks]       = useState([]);
    const [faqs, setFaqs]         = useState([]);
    const [googleReviewUrl, setGoogleReviewUrl] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');

    
    // WYSIWYG Modals
    const [editingLinkKey, setEditingLinkKey] = useState(null);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

    // Image upload
    const [profileImg, setProfileImg] = useState('');
    const [imgUploading, setImgUploading] = useState(false);
    const fileInputRef = useRef();

    // Design Customization
    const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
    const [primaryColor, setPrimaryColor] = useState('#B99146');
    const [backgroundColor, setBackgroundColor] = useState('#0a0a0f');
    const [template, setTemplate] = useState('GastroBarTheme');

    const TEMPLATES = [
        { id: 'AMTBusinessCard', label: 'بزنس كارد' },
        { id: 'CafeTheme', label: 'كافيه كلاسيك' },
        { id: 'CafeTheme1', label: 'كافيه داكن' },
        { id: 'GastroBarTheme', label: 'غاسترو بار' },
        { id: 'MaroufCoffeeTheme', label: 'معروف المميز' },
        { id: 'RestaurantTheme', label: 'مطعم فخم' },
        { id: 'RusticCafeTheme', label: 'كافيه ريفي' },
        { id: 'DoctorTheme', label: 'بطاقة طبيب' }
    ];

    const PRESET_COLORS = [
        { primary: '#B99146', bg: '#050505', name: 'ذهبي وأسود' },
        { primary: '#359BB0', bg: '#F6EFE6', name: 'أزرق فاتح وخشبي' },
        { primary: '#D35400', bg: '#Fdfbf7', name: 'برتقالي وأبيض' },
        { primary: '#27AE60', bg: '#1A1A1A', name: 'أخضر وداكن' },
        { primary: '#E74C3C', bg: '#2C3E50', name: 'أحمر وكحلي' },
    ];

    // Fetch card data
    useEffect(() => {
        fetch(`/api/partner/cards/${cardId}`)
            .then(r => r.json())
            .then(d => {
                if (!d.success) {
                    if (d.error?.includes('مصرح')) router.push('/partner');
                    else setError(d.error || 'خطأ في التحميل');
                    setLoading(false);
                    return;
                }
                const c = d.card;
                setCard(c);
                setName(c.siteData?.name || c.businessName || '');
                setSubtitle(c.siteData?.subtitle || '');
                setAddress(c.siteData?.address || '');
                setHours(c.siteData?.hours || '');
                setLinks((c.links || []).map(l => ({ ...l, _key: String(l.id || Math.random()) })));
                setProfileImg(c.siteData?.images?.profile || '');
                setPrimaryColor(c.siteColors?.primary || '#B99146');
                setBackgroundColor(c.siteColors?.background || '#050505');
                setTemplate(c.template || 'GastroBarTheme');
                setFaqs(c.siteData?.faqs || []);
                setGoogleReviewUrl(c.siteData?.googleReviewUrl || '');
                setWhatsappNumber(c.siteData?.whatsappNumber || '');
                setLoading(false);
            })
            .catch(() => { setError('تعذّر التحميل.'); setLoading(false); });
    }, [cardId]);

    // ── Save ─────────────────────────────────────────────────────────
    async function handleSave() {
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`/api/partner/cards/${cardId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName: name,
                    template: template,
                    siteColors: { primary: primaryColor, background: backgroundColor },
                    name, subtitle, address, hours,
                    siteData: {
                        faqs, googleReviewUrl, whatsappNumber
                    },
                    links: links.map(({ _key, ...l }) => l),
                }),
            });
            const d = await res.json();
            if (!res.ok) { setError(d.error || 'خطأ في الحفظ'); setSaving(false); return; }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch { setError('تعذّر الاتصال.'); }
        setSaving(false);
    }

    // ── Links CRUD ────────────────────────────────────────────────────
    function addLink() {
        const key = String(Date.now());
        setLinks(prev => [...prev, { _key: key, id: Date.now(), title: 'رابط جديد', titleAr: 'رابط جديد', url: 'https://', clicks: 0 }]);
        setEditingLinkKey(key);
    }
    function removeLink(key) {
        setLinks(prev => prev.filter(l => l._key !== key));
    }
    function updateLink(key, field, value) {
        setLinks(prev => prev.map(l => l._key === key ? { ...l, [field]: value } : l));
    }
    function moveLink(key, dir) {
        setLinks(prev => {
            const idx = prev.findIndex(l => l._key === key);
            const next = [...prev];
            const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= next.length) return prev;
            [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
            return next;
        });
    }

    // ── Profile image upload ─────────────────────────────────────────
    async function handleImageChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError('الصورة أكبر من 5MB.'); return; }
        setImgUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('cardId', cardId);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const d = await res.json();
            if (d.url) {
                setProfileImg(d.url);
                // Also save immediately
                await fetch(`/api/partner/cards/${cardId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        businessName: name, 
                        template: template,
                        siteColors: { primary: primaryColor, background: backgroundColor },
                        name, subtitle, address, hours,
                        siteData: { faqs, googleReviewUrl, whatsappNumber },
                        images: { profile: d.url },
                        links: links.map(({ _key, ...l }) => l) 
                    }),
                });
            } else { setError('فشل رفع الصورة.'); }
        } catch { setError('خطأ في رفع الصورة.'); }
        setImgUploading(false);
    }

    // ── Renders ───────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ minHeight:'100dvh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cairo,sans-serif' }}>
            <div style={{ textAlign:'center', color:GOLD }}>
                <div style={{ fontSize:40, marginBottom:12 }}>⏳</div>
                <p>جاري التحميل...</p>
            </div>
        </div>
    );

    const liveCard = card ? {
        ...card,
        template,
        siteColors: { primary: primaryColor, background: backgroundColor },
        businessName: name,
        siteData: {
            ...(card.siteData || {}),
            name,
            subtitle,
            address,
            hours,
            images: {
                ...(card.siteData?.images || {}),
                profile: profileImg
            },
            faqs,
            googleReviewUrl,
            whatsappNumber
        },
        links: links
    } : null;

    // WYSIWYG Handlers
    const handleUpdateField = (field, value) => {
        if (field === 'name') setName(value);
        if (field === 'subtitle') setSubtitle(value);
        if (field === 'address') setAddress(value);
        if (field === 'hours') setHours(value);
    };

    return (
        <div className="w-full min-h-screen relative flex justify-center bg-[#0a0a0f] overflow-hidden">
            {/* Header / Top Bar */}
            <div className="absolute top-0 inset-x-0 z-50 p-4 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => router.push(groupId === 'admin' ? '/admin/cards' : `/partner/${groupId}`)}
                    className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                    ←
                </button>
                <div className="pointer-events-auto px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-sm font-bold flex items-center gap-2 backdrop-blur-md">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                    وضع التعديل المباشر
                </div>
            </div>

            {/* Hidden file input for image uploads */}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageChange} />

            {/* Preview Container - centered like a phone or full width on mobile */}
            <div className="relative w-full max-w-[480px] min-h-screen bg-black shadow-2xl overflow-y-auto overflow-x-hidden border-x border-white/5 pb-32" style={{ scrollbarWidth: 'none' }}>
                {liveCard && (
                    <ClientCardViewer 
                        initialCard={liveCard} 
                        cardId={cardId} 
                        isPreview={true} 
                        isWYSIWYG={true}
                        onUpdateField={handleUpdateField}
                        onImageUpload={() => fileInputRef.current?.click()}
                        onAddLink={addLink}
                        onUpdateLink={updateLink}
                        onRemoveLink={removeLink}
                        onEditLink={setEditingLinkKey}
                    />
                )}
            </div>

            {/* Link Edit Modal */}
            {editingLinkKey && (() => {
                const activeEditingLink = links.find(l => l._key === editingLinkKey);
                if (!activeEditingLink) return null;
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-white/10" dir="rtl" style={{fontFamily:'Cairo,sans-serif'}}>
                            <h3 className="text-white text-lg font-bold mb-4 text-center">تعديل الرابط</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-white/60 text-xs mb-1 block">العنوان</label>
                                    <input 
                                        type="text" 
                                        value={activeEditingLink.titleAr || activeEditingLink.title} 
                                        onChange={e => { updateLink(editingLinkKey, 'titleAr', e.target.value); updateLink(editingLinkKey, 'title', e.target.value); }}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-yellow-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-white/60 text-xs mb-1 block">الرابط (URL)</label>
                                    <input 
                                        type="url" 
                                        value={activeEditingLink.url} 
                                        onChange={e => updateLink(editingLinkKey, 'url', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-left outline-none focus:border-yellow-500" dir="ltr"
                                    />
                                </div>
                                <div className="flex items-center gap-3 mt-6">
                                    <button 
                                        onClick={() => setEditingLinkKey(null)}
                                        className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
                                    >
                                        تم
                                    </button>
                                    <button 
                                        onClick={() => { removeLink(editingLinkKey); setEditingLinkKey(null); }}
                                        className="py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold transition-all"
                                    >
                                        حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Error Message */}
            {error && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-xl backdrop-blur-md font-bold text-sm shadow-xl border border-red-400">
                    ⚠️ {error}
                </div>
            )}

            {/* Floating Action Buttons for saving and settings */}
            <div className="fixed bottom-6 inset-x-0 flex justify-center gap-3 z-50 pointer-events-none px-4 max-w-[480px] mx-auto">
                {template === 'DoctorTheme' && (
                    <>
                        <button 
                            onClick={() => setIsFaqModalOpen(true)}
                            className="pointer-events-auto h-14 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#0F7A8A] border border-white/10 text-white"
                            title="إدارة الأسئلة الشائعة"
                        >
                            FAQs
                        </button>
                        <button 
                            onClick={() => {
                                const newWa = prompt('أدخل رقم الواتساب الخاص بالعيادة لاستقبال الطلبات:', whatsappNumber);
                                if (newWa !== null) setWhatsappNumber(newWa);
                                
                                const newG = prompt('أدخل رابط التقييم على جوجل (Google Review URL):', googleReviewUrl);
                                if (newG !== null) setGoogleReviewUrl(newG);
                            }}
                            className="pointer-events-auto h-14 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#0F7A8A] border border-white/10 text-white"
                            title="إعدادات بطاقة الطبيب"
                        >
                            <Settings size={20} />
                        </button>
                    </>
                )}
                <button 
                    onClick={() => setIsDesignModalOpen(true)} 
                    className="pointer-events-auto h-14 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#1a1a1a] border border-white/10 text-white"
                >
                    <Palette size={20} />
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="pointer-events-auto flex-1 h-14 rounded-2xl font-bold text-black flex items-center justify-center gap-2 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)` }}
                >
                    {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ بنجاح!' : 'حفظ التعديلات 💾'}
                </button>
            </div>

            {/* FAQ Manager Modal */}
            {isFaqModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-md shadow-2xl border border-white/10 flex flex-col max-h-[85vh]" dir="rtl" style={{fontFamily:'Cairo,sans-serif'}}>
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                            <h3 className="text-white text-lg font-bold">إدارة الأسئلة الشائعة</h3>
                            <button onClick={() => setIsFaqModalOpen(false)} className="text-white/60 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 mb-4 scrollbar-hide">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3 relative">
                                    <button 
                                        onClick={() => setFaqs(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-2 left-2 text-red-500 hover:bg-red-500/20 p-1 rounded-md"
                                        title="حذف السؤال"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div>
                                        <label className="text-white/60 text-xs mb-1 block">السؤال</label>
                                        <input 
                                            type="text" 
                                            value={faq.question} 
                                            onChange={e => {
                                                const newFaqs = [...faqs];
                                                newFaqs[idx].question = e.target.value;
                                                setFaqs(newFaqs);
                                            }}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-yellow-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-white/60 text-xs mb-1 block">الإجابة</label>
                                        <textarea 
                                            value={faq.answer} 
                                            onChange={e => {
                                                const newFaqs = [...faqs];
                                                newFaqs[idx].answer = e.target.value;
                                                setFaqs(newFaqs);
                                            }}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-yellow-500 text-sm min-h-[60px]"
                                        />
                                    </div>
                                </div>
                            ))}
                            {faqs.length === 0 && (
                                <div className="text-center text-white/40 py-8">لا يوجد أسئلة شائعة حتى الآن</div>
                            )}
                        </div>
                        <div className="pt-4 border-t border-white/10 flex gap-3">
                            <button 
                                onClick={() => setFaqs([...faqs, { question: 'سؤال جديد', answer: 'إجابة السؤال الجديد' }])}
                                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
                            >
                                + إضافة سؤال
                            </button>
                            <button 
                                onClick={() => setIsFaqModalOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-yellow-500 text-black font-bold transition-all"
                            >
                                تم
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Design Customization Modal */}
            {isDesignModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
                    <div className="bg-[#1a1a1a] w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300" dir="rtl" style={{fontFamily:'Cairo,sans-serif'}}>
                        
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <h3 className="text-white text-lg font-bold flex items-center gap-2"><Palette size={20} className="text-yellow-500" /> التخصيص والمظهر</h3>
                            <button onClick={() => setIsDesignModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="p-5 overflow-y-auto space-y-8 flex-1 scrollbar-hide">
                            
                            {/* Templates Section */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-bold flex items-center gap-2"><LayoutTemplate size={16} /> القالب</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {TEMPLATES.map(t => (
                                        <button 
                                            key={t.id}
                                            onClick={() => setTemplate(t.id)}
                                            className={`relative p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center text-center gap-2
                                                ${template === t.id ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-black/30 border-white/10 text-white/70 hover:border-white/30'}
                                            `}
                                        >
                                            {t.label}
                                            {template === t.id && <Check size={14} className="absolute top-2 left-2" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preset Colors Section */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-bold flex items-center gap-2"><Palette size={16} /> الألوان الجاهزة</label>
                                <div className="flex flex-wrap gap-3">
                                    {PRESET_COLORS.map((c, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setPrimaryColor(c.primary); setBackgroundColor(c.bg); }}
                                            className="group flex flex-col items-center gap-1"
                                            title={c.name}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all 
                                                ${primaryColor === c.primary && backgroundColor === c.bg ? 'border-yellow-500 scale-110' : 'border-transparent hover:scale-105'}
                                            `}>
                                                <div className="w-1/2 h-full" style={{ background: c.primary }} />
                                                <div className="w-1/2 h-full" style={{ background: c.bg }} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Colors Section */}
                            <div className="space-y-3">
                                <label className="text-white/80 text-sm font-bold">ألوان مخصصة</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-white/50 text-xs mb-1 block">اللون الأساسي</label>
                                        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl p-1">
                                            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                                            <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full bg-transparent text-white text-sm outline-none font-mono uppercase" dir="ltr" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white/50 text-xs mb-1 block">لون الخلفية</label>
                                        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl p-1">
                                            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                                            <input type="text" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full bg-transparent text-white text-sm outline-none font-mono uppercase" dir="ltr" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        
                        <div className="p-4 border-t border-white/10">
                            <button onClick={() => setIsDesignModalOpen(false)} className="w-full py-3 rounded-xl font-bold bg-yellow-500 text-black active:scale-[0.98] transition-transform">
                                تطبيق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Shared sub-components ────────────────────────────────────────────
function Section({ title, children, style: extraStyle }) {
    return (
        <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 18, padding: '20px 16px',
            ...extraStyle,
        }}>
            <p style={{ color: GOLD_LIGHT, fontSize: 14, fontWeight: 900, margin: '0 0 16px' }}>{title}</p>
            {children}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
};

const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid rgba(185,145,70,0.2)`,
    borderRadius: 10,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 15,
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
};

const iconBtn = {
    width: 30, height: 30, borderRadius: 8, border: `1px solid ${BORDER}`,
    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
    fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 0,
};
