"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Globe, Wifi, Check, Copy } from 'lucide-react';
import RestaurantTheme  from '../../components/templates/RestaurantTheme';
import CafeTheme        from '../../components/templates/CafeTheme';
import CafeTheme1       from '../../components/templates/CafeTheme1';
import GastroBarTheme   from '../../components/templates/GastroBarTheme';
import AMTBusinessCard  from '../../components/templates/AMTBusinessCard';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ClientCardViewer({ initialCard, cardId }) {
    const [lang,      setLang]      = useState('ar');
    const [wifiState, setWifiState] = useState('idle');

    /* ── Smart Waiter State ── */
    const [tableNumber, setTableNumber] = useState(null);
    const [waiterToast, setWaiterToast] = useState(null);
    const [cooldown, setCooldown]       = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setTableNumber(params.get('table'));
        }
    }, []);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleWaiterRequest = async (serviceType) => {
        if (cooldown > 0 || !tableNumber) return;
        setCooldown(60);
        try {
            const res = await fetch('/api/waiter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId: cardId, tableNumber, serviceType })
            });
            const data = await res.json();
            if (res.ok) {
                setWaiterToast({ message: data.message || "تم إرسال طلبك للويتر بنجاح! 🚀", type: 'success' });
            } else {
                setWaiterToast({ message: data.error || "عذراً، حدث خطأ", type: 'error' });
                setCooldown(5); // reduced cooldown on error
            }
        } catch(e) {
            setWaiterToast({ message: "خطأ في الاتصال بالخادم", type: 'error' });
            setCooldown(5);
        }
        setTimeout(() => setWaiterToast(null), 4000);
    };

    /* ── SWR ── */
    const { data: fetchedCard } = useSWR(`/api/cards/${cardId}`, fetcher, {
        fallbackData:      initialCard,
        revalidateOnFocus: false,
        refreshInterval:   15000,
    });

    const card    = fetchedCard || initialCard;
    const wifi    = card.wifi || { ssid: '', password: '' };
    const hasWifi = !!(wifi.ssid || wifi.password);
    const primary = card.primaryColor || '#EDD98A';

    /* ── Locked card ── */
    if (card.isLocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100" dir="rtl">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm border border-slate-200 mx-4">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h1 className="text-xl font-black mb-2 text-slate-900">البطاقة مقفلة مؤقتاً</h1>
                    <p className="text-sm text-slate-500">هذه البطاقة غير مفعلة حالياً. يرجى التواصل مع الإدارة.</p>
                </div>
            </div>
        );
    }

    /* ── Build props ── */
    const siteData = { ...(card.siteData || {}) };
    if (card.links?.length  > 0) siteData.links  = card.links;
    if (card.events?.length > 0) siteData.events = card.events;

    const props = {
        cardId:     card.shortCode || cardId,
        siteData,
        siteColors: { primary, background: card.background || '#F5EDD6' },
        lang,
    };

    const handleCopyWifi = () => {
        if (!wifi.password) return;
        navigator.clipboard.writeText(wifi.password).then(() => {
            setWifiState('copied');
            setTimeout(() => setWifiState('idle'), 3500);
        }).catch(() => {});
    };

    /* ── Shared pill button style ── */
    const pillBtn = (active) => ({
        display:        'flex',
        alignItems:     'center',
        gap:            6,
        padding:        '7px 15px',
        borderRadius:   999,
        fontSize:       12,
        fontWeight:     900,
        fontFamily:     'Cairo, sans-serif',
        cursor:         'pointer',
        transition:     'all 0.35s cubic-bezier(0.23,1,0.32,1)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        lineHeight:     1,
        ...(active
            ? { background: 'rgba(16,185,129,0.82)', color: '#fff',    border: '1.5px solid rgba(16,185,129,0.45)', boxShadow: '0 6px 20px rgba(16,185,129,0.38)' }
            : { background: 'rgba(0,0,0,0.48)',      color: primary,   border: `1.5px solid ${primary}50`,          boxShadow: `0 4px 18px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.08)` }
        ),
    });

    /* ════════════════════════════════════════════════════════════════
       AMT BUSINESS CARD — full-bleed dark landing page
       No white wrapper, no floating pill buttons (not needed here)
    ════════════════════════════════════════════════════════════════ */
    if (card.cardType === 'business_card') {
        return <AMTBusinessCard />;
    }

    /* ════════════════════════════════════════════════════════════════
       RESTAURANT / CAFE THEMES — normal wrapper with pill buttons
    ════════════════════════════════════════════════════════════════ */
    return (
        <>
            {/* ════════ WI-FI TOAST (fixed, portal-like) ════════ */}
            {hasWifi && (
                <div style={{
                    position:   'fixed',
                    bottom:     20,
                    left:       12,
                    right:      12,
                    zIndex:     9999,
                    maxWidth:   420,
                    margin:     '0 auto',
                    pointerEvents: 'none',
                    transform:  wifiState === 'copied' ? 'translateY(0) scale(1)' : 'translateY(120px) scale(0.93)',
                    opacity:    wifiState === 'copied' ? 1 : 0,
                    transition: 'transform 0.55s cubic-bezier(0.23,1,0.32,1), opacity 0.4s ease',
                }}>
                    <div style={{
                        borderRadius: 18, overflow: 'hidden',
                        background:  'rgba(6,6,10,0.97)',
                        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
                        border:      '1px solid rgba(255,255,255,0.07)',
                        boxShadow:   '0 28px 64px rgba(0,0,0,0.6)',
                        fontFamily:  'Cairo, sans-serif',
                    }}>
                        {/* Gradient stripe */}
                        <div style={{ height: 3, background: `linear-gradient(90deg, ${primary}, #10b981)` }} />
                        <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px' }} dir={lang==='ar'?'rtl':'ltr'}>
                            <div style={{ width:36, height:36, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(16,185,129,0.14)', marginTop:2 }}>
                                <Check size={17} color="#10b981" strokeWidth={3} />
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                                <p style={{ fontSize:13.5, fontWeight:900, color:'#fff', margin:'0 0 6px', lineHeight:1.3 }}>
                                    {lang==='ar' ? 'تم نسخ الباسوورد! 🎉' : 'Password copied! 🎉'}
                                </p>
                                <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'3px 10px', borderRadius:8, background:`${primary}18`, border:`1px solid ${primary}28`, marginBottom:6 }}>
                                    <Wifi size={10} color={primary} />
                                    <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:700, color:primary, letterSpacing:'0.06em' }}>{wifi.ssid||'—'}</span>
                                </div>
                                <p style={{ fontSize:11, color:'#64748b', lineHeight:1.5, margin:0 }}>
                                    {lang==='ar' ? 'اذهب لإعدادات الواي فاي والصقه 📲' : 'Go to Wi-Fi settings and paste it 📲'}
                                </p>
                            </div>
                            <Copy size={13} color="#10b981" opacity={0.65} style={{ flexShrink:0, marginTop:4 }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ PAGE WRAPPER ════════ */}
            <div style={{ background: props.siteColors.background, minHeight: '100vh' }}>
                <div
                    style={{
                        maxWidth:  448,
                        margin:    '0 auto',
                        minHeight: '100vh',
                        background: '#fff',
                        boxShadow: '0 0 80px rgba(0,0,0,0.16)',
                        position:  'relative',   // ← key: absolute children anchor here
                        overflowX: 'hidden',
                    }}
                >
                    {/* ──────────────────────────────────────────────────
                        FLOATING PILL BUTTONS — absolute over hero image
                        No white bar, fully transparent, glass effect
                    ────────────────────────────────────────────────── */}
                    <div style={{
                        position:       'absolute',
                        top:            14,
                        left:           14,
                        right:          14,
                        zIndex:         50,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'space-between',
                        pointerEvents:  'none',   // let clicks pass through gap between buttons
                    }}>
                        {/* Language toggle */}
                        <button
                            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
                            style={{ ...pillBtn(false), pointerEvents: 'auto' }}
                        >
                            <Globe size={13} color={primary} strokeWidth={2.5} />
                            <span style={{ paddingTop: 1 }}>{lang === 'ar' ? 'EN' : 'عربي'}</span>
                        </button>

                        {/* Wi-Fi */}
                        {hasWifi && (
                            <button
                                onClick={handleCopyWifi}
                                style={{ ...pillBtn(wifiState === 'copied'), pointerEvents: 'auto' }}
                            >
                                {wifiState === 'copied' ? (
                                    <><Check size={13} color="#fff" strokeWidth={3}/><span style={{paddingTop:1}}>{lang==='ar'?'تم ✓':'Done ✓'}</span></>
                                ) : (
                                    <><Wifi size={13} color={primary} strokeWidth={2.5}/><span style={{paddingTop:1}}>{lang==='ar'?'واي فاي':'Wi-Fi'}</span></>
                                )}
                            </button>
                        )}
                    </div>

                    {/* ── Restaurant / Cafe Theme Content ── */}
                    {card.themeName === 'cafe'   ? <CafeTheme      {...props} /> :
                     card.themeName === 'cafe1'  ? <CafeTheme1     {...props} /> :
                     card.themeName === 'gastro' ? <GastroBarTheme {...props} /> :
                                                   <RestaurantTheme {...props} />}

                    {/* ── AMT Branding Footer ── */}
                    <div style={{
                        textAlign:  'center',
                        padding:    '18px 16px 22px',
                        borderTop:  '1px solid rgba(0,0,0,0.06)',
                        background: 'rgba(0,0,0,0.02)',
                    }}>
                        <a
                            href="/amt"
                            style={{
                                display:        'inline-flex',
                                alignItems:     'center',
                                gap:            5,
                                fontSize:       11,
                                fontWeight:     700,
                                color:          'rgba(0,0,0,0.30)',
                                textDecoration: 'none',
                                fontFamily:     'Cairo,sans-serif',
                                transition:     'color 0.2s',
                                letterSpacing:  '0.02em',
                            }}
                            onMouseOver={e  => e.currentTarget.style.color = '#f5c518'}
                            onMouseOut={e   => e.currentTarget.style.color = 'rgba(0,0,0,0.30)'}
                        >
                            <span>⚡</span>
                            <span>Powered by AMT Smart</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* ════════ SMART WAITER TOAST ════════ */}
            {waiterToast && (
                <div style={{
                    position: 'fixed', top: 20, left: 12, right: 12, zIndex: 9999,
                    maxWidth: 420, margin: '0 auto', pointerEvents: 'none',
                    animation: 'fadeInDown 0.3s ease-out'
                }}>
                    <div style={{
                        background: waiterToast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
                        color: '#fff', padding: '12px 16px', borderRadius: 12,
                        textAlign: 'center', fontWeight: 'bold', fontSize: 13,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontFamily: 'Cairo, sans-serif'
                    }}>
                        {waiterToast.message}
                    </div>
                </div>
            )}

            {/* ════════ SMART WAITER FABs ════════ */}
            {card.isWaiterEnabled && tableNumber && (
                <div style={{
                    position: 'fixed', bottom: 20, left: 0, right: 0, zIndex: 9998,
                    display: 'flex', justifyContent: 'center', pointerEvents: 'none'
                }}>
                    <div style={{
                        display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 24,
                        background: 'rgba(10,15,28,0.85)', backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${primary}40`,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)', pointerEvents: 'auto',
                        fontFamily: 'Cairo, sans-serif'
                    }} dir="rtl">
                        {[
                            { id: 'bill',   label: 'حساب',  icon: '💸' },
                            { id: 'coal',   label: 'فحم',   icon: '💨' },
                            { id: 'clean',  label: 'تنظيف', icon: '🧹' },
                            { id: 'waiter', label: 'ويتر',  icon: '🔔' },
                        ].map(btn => (
                            <button key={btn.id}
                                onClick={() => handleWaiterRequest(btn.id)}
                                disabled={cooldown > 0}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                    background: 'transparent', border: 'none', color: '#fff',
                                    opacity: cooldown > 0 ? 0.5 : 1, cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                                    padding: '4px 8px', transition: 'all 0.2s'
                                }}>
                                <span style={{ fontSize: 20 }}>{cooldown > 0 ? '⏳' : btn.icon}</span>
                                <span style={{ fontSize: 10, fontWeight: 700 }}>{cooldown > 0 ? `${cooldown}s` : btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
