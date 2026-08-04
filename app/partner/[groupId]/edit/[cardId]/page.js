'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

    // Image upload
    const [profileImg, setProfileImg] = useState('');
    const [imgUploading, setImgUploading] = useState(false);
    const fileInputRef = useRef();

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
                    name, subtitle, address, hours,
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
        setLinks(prev => [...prev, { _key: String(Date.now()), id: Date.now(), title: '', titleAr: '', url: '', clicks: 0 }]);
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
                    body: JSON.stringify({ businessName: name, name, subtitle, address, hours,
                        links: links.map(({ _key, ...l }) => l) }),
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

    if (error && !card) return (
        <div style={{ minHeight:'100dvh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cairo,sans-serif', padding:24 }}>
            <div style={{ textAlign:'center', color:'#ef4444' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
                <p>{error}</p>
                <button onClick={() => router.push(`/partner/${groupId}`)} style={{ marginTop:16, padding:'12px 24px', background:GOLD, color:'#1a1a1a', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'Cairo,sans-serif', fontWeight:700 }}>
                    العودة للغرفة
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight:'100dvh', background:`linear-gradient(160deg, ${BG} 0%, #1a1a2e 100%)`, fontFamily:"'Cairo', sans-serif", direction:'rtl', paddingBottom:120 }}>

            {/* ── Header ── */}
            <div style={{
                background:'rgba(255,255,255,0.03)', borderBottom:`1px solid ${BORDER}`,
                padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
                position:'sticky', top:0, zIndex:50, backdropFilter:'blur(20px)',
            }}>
                <button
                    onClick={() => router.push(`/partner/${groupId}`)}
                    style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.06)', border:`1px solid ${BORDER}`, color:'rgba(255,255,255,0.7)', fontSize:18, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}
                >
                    ←
                </button>
                <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'#fff', fontWeight:900, fontSize:15, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        ✏️ تعديل البطاقة
                    </p>
                    <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, margin:0 }}>/{cardId}</p>
                </div>
                {/* Preview */}
                <a href={`/${cardId}`} target="_blank" rel="noreferrer"
                    style={{ padding:'8px 12px', background:`rgba(185,145,70,0.1)`, border:`1px solid ${BORDER}`, borderRadius:10, color:GOLD, fontSize:12, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>
                    👁️ عرض
                </a>
            </div>

            <div style={{ maxWidth:600, margin:'0 auto', padding:'20px 16px' }}>

                {/* ── Profile Image ── */}
                <div style={{ textAlign:'center', marginBottom:28 }}>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width:100, height:100, borderRadius:24, margin:'0 auto',
                            background:CARD_BG, border:`2px dashed ${BORDER}`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            cursor:'pointer', overflow:'hidden', position:'relative',
                            transition:'border-color 0.2s',
                        }}
                    >
                        {imgUploading ? (
                            <span style={{ color:GOLD, fontSize:13 }}>...</span>
                        ) : profileImg ? (
                            <img src={profileImg} alt="profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : (
                            <span style={{ fontSize:36 }}>📷</span>
                        )}
                        <div style={{ position:'absolute', bottom:4, right:4, width:22, height:22, borderRadius:6, background:GOLD, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>✏️</div>
                    </div>
                    <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:8 }}>اضغط لتغيير الصورة</p>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageChange} />
                </div>

                {/* ── Identity Section ── */}
                <Section title="🏷️ معلومات الهوية">
                    <Field label="اسم المشروع / النشاط">
                        <input
                            type="text" value={name} onChange={e => setName(e.target.value)}
                            placeholder="مثال: مطعم الفخر"
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="وصف مختصر">
                        <input
                            type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
                            placeholder="مثال: أفضل مطعم في المدينة"
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="العنوان">
                        <input
                            type="text" value={address} onChange={e => setAddress(e.target.value)}
                            placeholder="مثال: شارع الملك عبدالله، عمّان"
                            style={inputStyle}
                        />
                    </Field>
                    <Field label="أوقات العمل">
                        <input
                            type="text" value={hours} onChange={e => setHours(e.target.value)}
                            placeholder="مثال: 9:00 AM – 11:00 PM"
                            style={{ ...inputStyle, fontFamily:'monospace' }}
                        />
                    </Field>
                </Section>

                {/* ── Links Section ── */}
                <Section title="🔗 الروابط والتواصل" style={{ marginTop:16 }}>
                    {links.length === 0 && (
                        <div style={{ textAlign:'center', padding:'20px', color:'rgba(255,255,255,0.3)', fontSize:13 }}>
                            لا توجد روابط بعد. اضغط "إضافة رابط" لإضافة أول رابط.
                        </div>
                    )}

                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {links.map((link, idx) => {
                            const { icon } = detectLinkIcon(link.url);
                            return (
                                <div key={link._key} style={{
                                    background:'rgba(255,255,255,0.03)', border:`1px solid ${BORDER}`,
                                    borderRadius:14, padding:'14px',
                                }}>
                                    {/* Header row */}
                                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                                        <span style={{ fontSize:20 }}>{icon}</span>
                                        <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12, flex:1 }}>رابط #{idx + 1}</span>
                                        {/* Move buttons */}
                                        <button onClick={() => moveLink(link._key, 'up')} disabled={idx === 0}
                                            style={{ ...iconBtn, opacity: idx === 0 ? 0.3 : 1 }}>↑</button>
                                        <button onClick={() => moveLink(link._key, 'down')} disabled={idx === links.length - 1}
                                            style={{ ...iconBtn, opacity: idx === links.length - 1 ? 0.3 : 1 }}>↓</button>
                                        <button onClick={() => removeLink(link._key)}
                                            style={{ ...iconBtn, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5' }}>✕</button>
                                    </div>

                                    {/* URL */}
                                    <div style={{ marginBottom:8 }}>
                                        <label style={labelStyle}>الرابط (URL)</label>
                                        <input
                                            type="url"
                                            value={link.url}
                                            onChange={e => updateLink(link._key, 'url', e.target.value)}
                                            placeholder="https://wa.me/96279..."
                                            style={{ ...inputStyle, fontFamily:'monospace', fontSize:13 }}
                                            dir="ltr"
                                        />
                                    </div>

                                    {/* Title row */}
                                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                                        <div>
                                            <label style={labelStyle}>اسم الرابط (EN)</label>
                                            <input
                                                type="text" value={link.title}
                                                onChange={e => updateLink(link._key, 'title', e.target.value)}
                                                placeholder="WhatsApp"
                                                style={{ ...inputStyle, fontSize:13 }}
                                                dir="ltr"
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>اسم الرابط (AR)</label>
                                            <input
                                                type="text" value={link.titleAr || ''}
                                                onChange={e => updateLink(link._key, 'titleAr', e.target.value)}
                                                placeholder="واتساب"
                                                style={{ ...inputStyle, fontSize:13 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add link button */}
                    <button
                        onClick={addLink}
                        style={{
                            width:'100%', marginTop:12,
                            padding:'14px', border:`1.5px dashed ${BORDER}`,
                            borderRadius:12, background:'transparent',
                            color:GOLD, fontSize:14, fontWeight:700,
                            fontFamily:"'Cairo', sans-serif",
                            cursor:'pointer', transition:'all 0.2s',
                        }}
                    >
                        + إضافة رابط جديد
                    </button>
                </Section>

                {/* Error */}
                {error && (
                    <div style={{
                        background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
                        borderRadius:12, padding:'12px 16px', color:'#fca5a5',
                        fontSize:13, marginTop:16, textAlign:'center',
                    }}>
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {/* ── Fixed Save Button ── */}
            <div style={{
                position:'fixed', bottom:0, left:0, right:0,
                padding:'16px', background:'rgba(10,10,20,0.95)',
                borderTop:`1px solid ${BORDER}`, backdropFilter:'blur(20px)',
                zIndex:100,
            }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        width:'100%', maxWidth:600, display:'block', margin:'0 auto',
                        padding:'17px',
                        background: saved
                            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                            : saving
                            ? 'rgba(185,145,70,0.4)'
                            : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                        color: saving ? 'rgba(255,255,255,0.5)' : (saved ? '#fff' : '#1a1a1a'),
                        border:'none', borderRadius:16,
                        fontSize:17, fontWeight:900,
                        fontFamily:"'Cairo', sans-serif",
                        cursor: saving ? 'not-allowed' : 'pointer',
                        transition:'all 0.3s',
                        boxShadow: saved ? '0 4px 20px rgba(34,197,94,0.4)' : `0 4px 20px rgba(185,145,70,0.3)`,
                    }}
                >
                    {saved ? '✅ تم الحفظ بنجاح!' : saving ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات'}
                </button>
            </div>
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
