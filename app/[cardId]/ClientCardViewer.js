"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Globe, Wifi, Check, Copy } from 'lucide-react';
import RestaurantTheme  from '../../components/templates/RestaurantTheme';
import CafeTheme        from '../../components/templates/CafeTheme';
import CafeTheme1       from '../../components/templates/CafeTheme1';
import GastroBarTheme   from '../../components/templates/GastroBarTheme';
import AMTBusinessCard  from '../../components/templates/AMTBusinessCard';

// Always bypass browser cache so we get the latest data from MongoDB
const fetcher = async (url) => {
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.error || 'Failed to fetch');
    return json;
};
export default function ClientCardViewer({ initialCard, cardId }) {
    const [lang,      setLang]      = useState('ar');
    const [wifiState, setWifiState] = useState('idle');

    /* ── Smart Waiter State (Server-Side Session) ── */
    const COOLDOWN_SECONDS     = 60;

    const [tableNumber, setTableNumber]         = useState(null);
    const [isNfc, setIsNfc]                     = useState(false);
    const [waiterToast, setWaiterToast]         = useState(null);
    const [cooldown, setCooldown]               = useState(0);
    const [limitReached, setLimitReached]       = useState(false);
    const [assignedWaiter, setAssignedWaiter]   = useState(null);
    const [lastService, setLastService]         = useState(null);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [confirmBill, setConfirmBill]         = useState(false);
    const [showWaiterMenu, setShowWaiterMenu]   = useState(false);
    const [waiterStatus, setWaiterStatus]       = useState('idle'); // 'idle' | 'session_expired' | 'bill_sent'

    const postFetcher = async ([url, body]) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return res.json();
    };

    const { data: syncData, mutate: mutateSync } = useSWR(
        isNfc && tableNumber ? ['/api/waiter/sync', { restaurantId: cardId, tableNumber }] : null,
        postFetcher,
        { refreshInterval: 10000, revalidateOnFocus: true }
    );

    const submitAudit = async (answer) => {
        // Optimistic UI hide
        mutateSync({ ...syncData, showAudit: false }, false);
        try {
            await fetch('/api/waiter/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId: cardId, tableNumber, answer })
            });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const tbl = params.get('table');
        const auth = params.get('auth');
        
        if (!tbl) return;
        
        setTableNumber(tbl);
        setIsNfc(auth === 'nfc');

        if (auth === 'nfc') {
            fetch('/api/waiter/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId: cardId, tableNumber: tbl })
            }).then(res => res.json()).then(data => {
                const expireMs = data.expiresInMs || (10 * 60 * 1000); // 10 minutes fallback
                if (expireMs > 0) {
                    setTimeout(() => setWaiterStatus('session_expired'), expireMs);
                } else {
                    setWaiterStatus('session_expired');
                }
                
                if (data.assignedWaiter) setAssignedWaiter(data.assignedWaiter);
                if (data.lastService) setLastService(data.lastService);
                
                if (data.rateLimitExpiresInMs && data.rateLimitExpiresInMs > 0) {
                    setLimitReached(true);
                } else if (data.cooldownRemainingMs && data.cooldownRemainingMs > 0) {
                    setCooldown(Math.ceil(data.cooldownRemainingMs / 1000));
                }
            }).catch(() => {});
        }
    }, [cardId]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const computeWaiterBlock = () => {
        if (!isNfc)                             return 'qr_mode';
        if (waiterStatus === 'session_expired') return 'session_expired';
        if (waiterStatus === 'bill_sent')       return 'bill_sent';
        if (cooldown > 0)                       return 'cooldown';
        return 'ready';
    };

    const handleWaiterRequest = async (serviceType) => {
        if (!tableNumber) return;

        const block = computeWaiterBlock();
        if (block !== 'ready') {
            if (block === 'qr_mode') {
                setWaiterToast({ message: "🔐 لطلب الويتر أو الفاتورة، يرجى تمرير هاتفك على شعار الـ NFC الموجود على الطاولة.", type: 'error' });
                setTimeout(() => setWaiterToast(null), 4000);
            }
            return;
        }

        // 1. BILL BYPASS: Intercept bill click, stop API, show Payment UI
        if (serviceType === 'bill') {
            setShowPaymentOptions(true);
            return; // STRICT RETURN: Do not fire API
        }

        await sendWaiterAPI(serviceType, null);
    };

    const handleBillConfirm = async () => {
        if (!tableNumber || !selectedPayment) return;

        const block = computeWaiterBlock();
        if (block !== 'ready') return;

        setConfirmBill(false);
        await sendWaiterAPI('bill', selectedPayment);
        setSelectedPayment(null);
    };

    const sendWaiterAPI = async (serviceType, paymentMethod) => {
        setConfirmBill(false);
        setShowPaymentOptions(false);
        setShowWaiterMenu(false);

        try {
            const bodyPayload = { restaurantId: cardId, tableNumber, serviceType };
            if (paymentMethod) bodyPayload.paymentMethod = paymentMethod;

            const res = await fetch('/api/waiter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            const data = await res.json();

            if (res.ok) {
                if (serviceType === 'bill') setWaiterStatus('bill_sent');
                setLastService(serviceType);
                setWaiterToast({ message: data.message || "تم إرسال طلبك للويتر بنجاح! 🚀", type: 'success' });
                setCooldown(COOLDOWN_SECONDS);
            } else {
                if (res.status === 401) {
                    setWaiterStatus('session_expired');
                } else if (res.status === 403) {
                    if (data.error?.includes('فاتورة')) {
                        setWaiterStatus('bill_sent');
                    } else {
                        setWaiterStatus('session_expired');
                    }
                } else if (res.status === 429) {
                    if (data.error && data.error.includes('الحد الأقصى')) {
                        setLimitReached(true);
                    } else if (data.remainingSeconds) {
                        setCooldown(data.remainingSeconds);
                    } else {
                        setCooldown(15);
                    }
                } else {
                    setCooldown(5);
                }
                setWaiterToast({ message: data.error || "عذراً، حدث خطأ", type: 'error' });
            }
        } catch(e) {
            setCooldown(5);
            setWaiterToast({ message: "خطأ في الاتصال بالخادم", type: 'error' });
        }
        setTimeout(() => setWaiterToast(null), 4000);
    };

    /* ── SWR ── */
    const { data: fetchedCard } = useSWR(`/api/cards/${cardId}`, fetcher, {
        fallbackData:       initialCard,
        revalidateOnMount:  true,      // Always fetch fresh when page loads
        revalidateOnFocus:  false,
        refreshInterval:    5000,      // Poll every 5 seconds
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
                                    {lang==='ar' ? 'تم نسخ الباسورد! 🎉' : 'Password copied! 🎉'}
                                </p>
                                <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'3px 10px', borderRadius:8, background:`${primary}18`, border:`1px solid ${primary}28`, marginBottom:6 }}>
                                    <Wifi size={10} color={primary} />
                                    <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:700, color:primary, letterSpacing:'0.06em' }}>{wifi.ssid||'—'}</span>
                                </div>
                                <p style={{ fontSize:11, color:'#64748b', lineHeight:1.5, margin:0 }}>
                                    {lang==='ar' ? 'اذهب لإعدادات الواي فاي والصقه 📱' : 'Go to Wi-Fi settings and paste it 📱'}
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
                    {/* ════════ MODERN HEADER ════════ */}
                    <div style={{
                        background: 'linear-gradient(to right, #ea580c, #f5c518)', // orange to yellow gradient
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        position: 'relative',
                        zIndex: 50
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 40, height: 40,
                                borderRadius: '50%',
                                background: '#111827', // dark background for contrast against gradient
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#f5c518', fontWeight: 900, fontSize: 18
                            }}>
                                {card.businessName ? card.businessName.charAt(0) : 'R'}
                            </div>
                            <div>
                                <h1 style={{ color: '#ffffff', fontSize: 16, fontWeight: 900, margin: 0, fontFamily: 'Cairo, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                    {card.businessName || 'المطعم الذكي'}
                                </h1>
                                {tableNumber && (
                                    <p style={{ color: '#ffffff', opacity: 0.9, fontSize: 13, margin: 0, fontWeight: 700, fontFamily: 'Cairo, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                        الطاولة {tableNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            {hasWifi && (
                                <button
                                    onClick={handleCopyWifi}
                                    style={{
                                        background: wifiState === 'copied' ? '#10b981' : '#1f2937',
                                        color: wifiState === 'copied' ? '#fff' : '#f5c518',
                                        border: `1px solid ${wifiState === 'copied' ? '#10b981' : '#f5c518'}`,
                                        borderRadius: 8,
                                        width: 36, height: 36,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {wifiState === 'copied' ? <Check size={18} /> : <Wifi size={18} />}
                                </button>
                            )}
                            <button
                                onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
                                style={{
                                    background: '#1f2937',
                                    color: '#f5c518',
                                    border: '1px solid #f5c518',
                                    borderRadius: 8,
                                    width: 36, height: 36,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, fontSize: 13,
                                    transition: 'all 0.3s'
                                }}
                            >
                                {lang === 'ar' ? 'EN' : 'ع'}
                            </button>
                        </div>
                    </div>

                    {/* ════════ Restaurant / Cafe Theme Content ════════ */}
                    {(() => {
                        const tn = (card.themeName || '').toLowerCase().trim();
                        console.log("ClientCardViewer Render -> Current Theme:", tn);
                        if (tn === 'cafe' || tn === 'cafetheme')          return <CafeTheme      {...props} />;
                        if (tn === 'cafe1' || tn === 'cafetheme1')        return <CafeTheme1     {...props} />;
                        if (tn === 'gastro' || tn === 'gastrobartheme')   return <GastroBarTheme {...props} />;
                        // 'restaurant', 'restauranttheme', 'luxury', default
                        return <RestaurantTheme {...props} />;
                    })()}

                    {/* ════════ AMT Branding Footer ════════ */}
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

            {/* ════════ SMART WAITER MAIN BUTTON ════════ */}
            {card.isWaiterEnabled && tableNumber && (() => {
                const block = computeWaiterBlock();
                const isBusy = block !== 'ready' && block !== 'qr_mode';
                const waiterName = syncData?.assignedWaiter || assignedWaiter;
                const currentService = syncData?.lastService || lastService;

                const getAssignedMessage = () => {
                    const isAr = lang === 'ar';
                    if (!currentService) return isAr ? `🏃‍♂️ طلبك في عهدة النادل [${waiterName}] ويتم تلبيته الآن.` : `🏃‍♂️ Your request is handled by [${waiterName}].`;
                    
                    if (currentService === 'clean') {
                        return isAr ? `🧻 طلب تنظيف الطاولة في عهدة النادل [${waiterName}]` : `🧻 Table cleaning is assigned to [${waiterName}]`;
                    }
                    if (currentService === 'waiter') {
                        return isAr ? `👨‍🍳 الويتر [${waiterName}] في طريقه إليك` : `👨‍🍳 Waiter [${waiterName}] is on the way`;
                    }
                    if (currentService === 'coal') {
                        return isAr ? `💨 طلب تغيير فحم الشيشة في عهدة النادل [${waiterName}]` : `💨 Coal replacement is assigned to [${waiterName}]`;
                    }
                    if (currentService === 'bill') {
                        return isAr ? `🧾 طلب الفاتورة في عهدة النادل [${waiterName}]` : `🧾 Bill request is assigned to [${waiterName}]`;
                    }
                    return isAr ? `🏃‍♂️ طلبك في عهدة النادل [${waiterName}] ويتم تلبيته الآن.` : `🏃‍♂️ Your request is handled by [${waiterName}].`;
                };

                return (
                    <>
                        <div style={{
                            position: 'fixed', bottom: 20, left: 0, right: 0, zIndex: 9998,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, pointerEvents: 'none'
                        }}>
                            {waiterName && block === 'ready' && !limitReached && cooldown === 0 && (
                                <div style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: 999, border: '1px solid rgba(245,197,24,0.3)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', pointerEvents: 'auto', animation: 'fadeInUp 0.4s ease-out' }}>
                                    <span style={{ color: '#f5c518', fontSize: 13, fontWeight: 800, fontFamily: 'Cairo, sans-serif' }}>
                                        {getAssignedMessage()}
                                    </span>
                                </div>
                            )}

                            {block === 'session_expired' ? (
                                <div style={{ background: '#111827', color: '#ea580c', border: '1px solid #ea580c', borderRadius: 24, padding: '12px 24px', fontWeight: 900, pointerEvents: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontFamily: 'Cairo, sans-serif' }}>
                                    ⏳ انتهت الجلسة. يرجى مسح البطاقة مجدداً.
                                </div>
                            ) : block === 'bill_sent' ? (
                                <div style={{ background: '#111827', color: '#f5c518', border: '1px solid #f5c518', borderRadius: 24, padding: '12px 24px', fontWeight: 900, pointerEvents: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontFamily: 'Cairo, sans-serif' }}>
                                    🧾 تم طلب الفاتورة. الجلسة مغلقة.
                                </div>
                            ) : limitReached ? (
                                <div style={{ background: '#111827', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 24, padding: '12px 24px', fontWeight: 900, pointerEvents: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', fontFamily: 'Cairo, sans-serif' }}>
                                    🛑 تم استهلاك الحد الأقصى للطلبات (3) لهذه الجلسة.
                                </div>
                            ) : cooldown > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'auto', animation: 'fadeInUp 0.3s ease-out' }}>
                                    <button disabled style={{ background: '#374151', color: '#9ca3af', border: 'none', borderRadius: 999, padding: '16px 36px', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', gap: 12, cursor: 'not-allowed', fontFamily: 'Cairo, sans-serif', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                                        <span style={{ fontSize: 24, animation: 'spin 2s linear infinite' }}>⏳</span>
                                        <span>{lang === 'ar' ? 'الرجاء الانتظار' : 'Please Wait'}</span>
                                    </button>
                                    <div style={{ background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ color: '#f5c518', fontSize: 12, fontWeight: 700, fontFamily: 'Cairo, sans-serif' }}>
                                            ⏱️ يمكنك طلب خدمة أخرى بعد {cooldown} ثانية
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowWaiterMenu(true)}
                                    disabled={isBusy}
                                    style={{
                                        background: 'linear-gradient(135deg, #f5c518, #ea580c)',
                                        color: '#111827',
                                        border: 'none',
                                        borderRadius: 999,
                                        padding: '16px 36px',
                                        fontWeight: 900,
                                        fontSize: 18,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        pointerEvents: 'auto',
                                        cursor: isBusy ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 10px 30px rgba(234,88,12,0.4)',
                                        fontFamily: 'Cairo, sans-serif',
                                        opacity: isBusy ? 0.6 : 1,
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <span style={{ fontSize: 24 }}>🛎️</span>
                                    <span>{lang === 'ar' ? 'طلب خدمة' : 'Call Waiter'}</span>
                                </button>
                            )}
                        </div>

                        {/* ════════ WAITER BOTTOM SHEET MODAL ════════ */}
                        {showWaiterMenu && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' }} onClick={() => setShowWaiterMenu(false)}>
                                <div style={{ background: '#111827', width: '100%', maxWidth: 448, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 20px 40px', borderTop: '2px solid #ea580c', boxShadow: '0 -10px 40px rgba(0,0,0,0.6)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                                        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 20, fontWeight: 900 }}>{lang === 'ar' ? 'ماذا تحتاج؟' : 'What do you need?'}</h3>
                                        <button onClick={() => setShowWaiterMenu(false)} style={{ background: '#1f2937', border: 'none', color: '#9ca3af', width: 32, height: 32, borderRadius: 16, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                                        {[
                                            { id: 'waiter', label: lang === 'ar' ? 'نداء ويتر' : 'Waiter',  icon: '👨‍🍳', color: '#3b82f6' },
                                            { id: 'clean',  label: lang === 'ar' ? 'تنظيف الطاولة' : 'Clean', icon: '🧻', color: '#10b981' },
                                            ...(card.hasShisha ? [{ id: 'coal',   label: lang === 'ar' ? 'تغيير فحم' : 'Coal',   icon: '💨', color: '#8b5cf6' }] : []),
                                            { id: 'bill',   label: lang === 'ar' ? 'طلب الفاتورة' : 'Bill',  icon: '🧾', color: '#ea580c' },
                                        ].map(btn => (
                                            <button key={btn.id}
                                                onClick={() => handleWaiterRequest(btn.id)}
                                                disabled={cooldown > 0}
                                                style={{
                                                    background: '#1f2937',
                                                    border: `1px solid ${btn.color}40`,
                                                    borderRadius: 20,
                                                    padding: '20px 10px',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                                                    color: '#f8fafc',
                                                    cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                                                    opacity: cooldown > 0 ? 0.5 : 1,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ width: 56, height: 56, borderRadius: 28, background: `${btn.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                                    {cooldown > 0 ? '⏳' : btn.icon}
                                                </div>
                                                <span style={{ fontSize: 15, fontWeight: 800 }}>{cooldown > 0 ? `${cooldown}s` : btn.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Modals */}
                        {showPaymentOptions && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' }} onClick={() => setShowPaymentOptions(false)}>
                                <div style={{ background: '#111827', width: '100%', maxWidth: 448, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '24px 20px 40px', borderTop: `2px solid #f5c518`, boxShadow: '0 -10px 40px rgba(0,0,0,0.6)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                                        <h3 style={{ margin:0, color: '#f8fafc', fontSize: 20, fontWeight: 900, display:'flex', alignItems:'center', gap:8 }}>
                                            <span style={{ fontSize:24 }}>💸</span>{lang === 'ar' ? 'كيف تفضل الدفع؟' : 'How would you like to pay?'}
                                        </h3>
                                        <button onClick={() => setShowPaymentOptions(false)} style={{ background: '#1f2937', border: 'none', color: '#9ca3af', width: 32, height: 32, borderRadius: 16, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                                        <button onClick={() => { setSelectedPayment('cash'); setShowPaymentOptions(false); setConfirmBill(true); }} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: 20, cursor: 'pointer', fontSize: 16, fontWeight: 800, textAlign: lang === 'ar' ? 'right' : 'left', background: '#1f2937', color: '#f8fafc', border: `1px solid #10b98140`, transition: 'all 0.2s' }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 24, background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>💵</div>
                                            <span>{lang === 'ar' ? 'الدفع نقداً (Cash)' : 'Cash'}</span>
                                        </button>
                                        <button onClick={() => { setSelectedPayment('visa'); setShowPaymentOptions(false); setConfirmBill(true); }} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderRadius: 20, cursor: 'pointer', fontSize: 16, fontWeight: 800, textAlign: lang === 'ar' ? 'right' : 'left', background: '#1f2937', color: '#f8fafc', border: `1px solid #3b82f640`, transition: 'all 0.2s' }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 24, background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>💳</div>
                                            <span>{lang === 'ar' ? 'الدفع بالبطاقة (Visa/Mada)' : 'Card (Visa/Mada)'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {confirmBill && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' }} onClick={() => setConfirmBill(false)}>
                                <div style={{ background: '#111827', width: '100%', maxWidth: 448, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '32px 20px 40px', borderTop: `2px solid #ea580c`, boxShadow: '0 -10px 40px rgba(0,0,0,0.6)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} onClick={e => e.stopPropagation()}>
                                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                                        <div style={{ width: 80, height: 80, borderRadius: 40, background: selectedPayment === 'visa' ? '#3b82f620' : '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40 }}>
                                            {selectedPayment === 'visa' ? '💳' : '💵'}
                                        </div>
                                        <h3 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>{lang === 'ar' ? 'تأكيد الفاتورة' : 'Confirm Bill'}</h3>
                                        <p style={{ color: '#9ca3af', fontSize: 15, margin: 0 }}>
                                            {lang === 'ar' ? 'الدفع عبر: ' : 'Pay via: '}
                                            <b style={{ color: '#f5c518' }}>{selectedPayment === 'visa' ? (lang === 'ar' ? 'فيزا / شبكة' : 'Visa / Mada') : (lang === 'ar' ? 'كاش' : 'Cash')}</b>
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                                        <button onClick={handleBillConfirm} style={{ flex: 1, padding: '16px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #f5c518, #ea580c)', color: '#111827', fontWeight: 900, fontSize: 16, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                            {lang === 'ar' ? 'نعم، تأكيد' : 'Yes, Confirm'}
                                        </button>
                                        <button onClick={() => { setConfirmBill(false); setShowPaymentOptions(true); }} style={{ flex: 1, padding: '16px', borderRadius: 16, border: `2px solid #374151`, background: 'transparent', color: '#d1d5db', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
                                            {lang === 'ar' ? 'تغيير الدفع' : 'Change Payment'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                );
            })()}

            {/* ════════ MINUTE 5 AUDIT MODAL ════════ */}
            {syncData?.showAudit && syncData?.status !== 'idle' && syncData?.status !== 'closing' && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' }}>
                    <div style={{ background: '#1e293b', width: '90%', maxWidth: 360, borderRadius: 24, padding: '28px 20px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: `1px solid ${primary}40`, animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🕒</div>
                        <h3 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>هل وصلك طلبك؟</h3>
                        
                        {syncData.status === 'handling' ? (
                            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                                لقد استلم <b style={{ color: primary }}>{syncData.assignedWaiter || 'النادل'}</b> طلبك.<br/>هل استلمته بالفعل؟
                            </p>
                        ) : (
                            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                                لقد مر بعض الوقت منذ طلبك الأخير.<br/>هل استلمته بالفعل؟
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: 12, direction: 'rtl' }}>
                            <button onClick={() => submitAudit('yes')} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}>
                                نعم ✅
                            </button>
                            <button onClick={() => submitAudit('no')} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 800, fontSize: 16, cursor: 'pointer', transition: 'all 0.2s' }}>
                                لا ❌
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}