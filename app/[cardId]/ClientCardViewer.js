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
    const COOLDOWN_SECONDS     = 60;

    const [tableNumber, setTableNumber]         = useState(null);
    const [isNfc, setIsNfc]                     = useState(false);
    const [waiterToast, setWaiterToast]         = useState(null);
    const [cooldown, setCooldown]               = useState(0);
    const [showServiceMenu, setShowServiceMenu] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [confirmBill, setConfirmBill]         = useState(false);
    const [waiterStatus, setWaiterStatus]       = useState('idle'); // 'idle' | 'session_expired' | 'bill_sent'

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
                if (data.sessionExpiresAt) {
                    const expireMs = new Date(data.sessionExpiresAt).getTime() - Date.now();
                    if (expireMs > 0) {
                        setTimeout(() => setWaiterStatus('session_expired'), expireMs);
                    } else {
                        setWaiterStatus('session_expired');
                    }
                }
            }).catch(() => {});
        }
    }, [cardId]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
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

    // Main Click Handler for Services
    const handleWaiterRequest = async (serviceType) => {
        if (!tableNumber) return;

        const block = computeWaiterBlock();
        if (block !== 'ready') {
            if (block === 'qr_mode') {
                setWaiterToast({ message: "🔐 لطلب الويتر، يرجى تمرير هاتفك على شعار الـ NFC.", type: 'error' });
                setTimeout(() => setWaiterToast(null), 4000);
            }
            return;
        }

        setShowServiceMenu(false);

        // 1. BILL BYPASS: Intercept bill click, stop API, show Payment UI
        if (serviceType === 'bill') {
            setShowPaymentOptions(true);
            return; // STRICT RETURN: Do not fire API
        }

        // 2. NORMAL SERVICES: Fire directly
        await sendWaiterAPI(serviceType, null);
    };

    // Confirmed Bill Handler
    const handleBillConfirm = async () => {
        if (!tableNumber || !selectedPayment) return;
        const block = computeWaiterBlock();
        if (block !== 'ready') return;

        setConfirmBill(false);
        await sendWaiterAPI('bill', selectedPayment);
        setSelectedPayment(null);
    };

    // Central API Caller
    const sendWaiterAPI = async (serviceType, paymentMethod) => {
        setShowServiceMenu(false);
        setConfirmBill(false);
        setShowPaymentOptions(false);

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
                // LOCK UI permanently if bill is sent
                if (serviceType === 'bill') setWaiterStatus('bill_sent');
                setWaiterToast({ message: data.message || "تم إرسال طلبك للويتر بنجاح! 🚀", type: 'success' });
                setCooldown(COOLDOWN_SECONDS);
            } else {
                if (res.status === 401) {
                    setWaiterStatus('session_expired');
                } else if (res.status === 403) {
                    if (data.error?.includes('فاتورة')) {
                        setWaiterStatus('bill_sent'); // Already locked from another tab/device
                    } else {
                        setWaiterStatus('session_expired');
                    }
                } else if (res.status === 429) {
                    setCooldown(15);
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

    const { data: fetchedCard } = useSWR(`/api/cards/${cardId}`, fetcher, {
        fallbackData: initialCard, revalidateOnFocus: false, refreshInterval: 15000,
    });
    const card = fetchedCard || initialCard;
    const wifi = card.wifi || { ssid: '', password: '' };
    const hasWifi = !!(wifi.ssid || wifi.password);
    const primary = card.primaryColor || '#EDD98A';

    if (card.isLocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100" dir="rtl">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm mx-4">
                    <h1 className="text-xl font-black mb-2">البطاقة مقفلة مؤقتاً</h1>
                </div>
            </div>
        );
    }

    const siteData = { ...(card.siteData || {}) };
    if (card.links?.length > 0) siteData.links = card.links;
    if (card.events?.length > 0) siteData.events = card.events;
    const props = { cardId: card.shortCode || cardId, siteData, siteColors: { primary, background: card.background || '#F5EDD6' }, lang };

    const handleCopyWifi = () => {
        if (!wifi.password) return;
        navigator.clipboard.writeText(wifi.password).then(() => {
            setWifiState('copied'); setTimeout(() => setWifiState('idle'), 3500);
        }).catch(() => {});
    };

    const pillBtn = (active) => ({
        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 999, fontSize: 12, fontWeight: 900, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', transition: 'all 0.35s', backdropFilter: 'blur(14px)',
        ...(active ? { background: 'rgba(16,185,129,0.82)', color: '#fff' } : { background: 'rgba(0,0,0,0.48)', color: primary })
    });

    if (card.cardType === 'business_card') return <AMTBusinessCard />;

    return (
        <>
            <div className="min-h-screen bg-slate-50 flex justify-center w-full">
                <div className="w-full max-w-md bg-white shadow-2xl relative flex flex-col" style={{ minHeight: '100vh', paddingBottom: 110 }}>
                    <div style={{ position: 'absolute', top: 18, left: 18, right: 18, display: 'flex', justifyContent: 'space-between', zIndex: 50 }}>
                        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={pillBtn(false)}><Globe size={15} /><span>{lang === 'ar' ? 'EN' : 'AR'}</span></button>
                        {hasWifi && <button onClick={handleCopyWifi} style={pillBtn(wifiState === 'copied')}>{wifiState === 'copied' ? <Check size={15} /> : <Wifi size={15} />}<span>{wifiState === 'copied' ? 'تم النسخ' : 'WiFi'}</span></button>}
                    </div>
                    <div className="flex-1">
                        {card.template === 'restaurant' && <RestaurantTheme {...props} />}
                        {card.template === 'cafe'       && <CafeTheme       {...props} />}
                        {card.template === 'cafe_1'     && <CafeTheme1      {...props} />}
                        {card.template === 'gastro_bar' && <GastroBarTheme  {...props} />}
                        {!['restaurant','cafe','cafe_1','gastro_bar'].includes(card.template) && <RestaurantTheme {...props} />}
                    </div>
                </div>
            </div>

            {waiterToast && (
                <div style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', pointerEvents: 'none', padding: '0 16px' }}>
                    <div style={{ background: waiterToast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)', backdropFilter: 'blur(10px)', color: '#fff', padding: '14px 20px', borderRadius: 16, fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        {waiterToast.message}
                    </div>
                </div>
            )}

            {card.isWaiterEnabled && tableNumber && (() => {
                const bg = card.background || '#F5EDD6'; const pc = primary;
                const isDark = (() => { const hex = bg.replace('#',''); if (hex.length !== 6) return false; return (0.299*parseInt(hex.slice(0,2),16) + 0.587*parseInt(hex.slice(2,4),16) + 0.114*parseInt(hex.slice(4,6),16)) < 128; })();
                const sheetBg = isDark ? '#1e293b' : '#ffffff';
                const textColor = isDark ? '#f8fafc' : '#1e293b';
                const subTextColor = isDark ? 'rgba(248,250,252,0.5)' : '#64748b';
                const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

                const btnBase = { display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderRadius: 16, cursor: 'pointer', fontSize: 15, fontWeight: 700, textAlign: 'right', width: '100%', background: isDark ? `${pc}14` : `${pc}22`, color: textColor, border: `1px solid ${pc}38` };
                const btnHighlight = { ...btnBase, background: pc, color: '#1e293b', border: `1px solid ${pc}`, fontWeight: 900 };

                const block = computeWaiterBlock();
                const isBusy = block !== 'ready' && block !== 'qr_mode';

                let fabBg, fabLabel;
                if (block === 'session_expired' || block === 'bill_sent') { fabBg = 'rgba(100,116,139,0.85)'; fabLabel = block === 'bill_sent' ? '🧾 تم طلب الفاتورة' : '⏳ انتهت الجلسة'; }
                else if (block === 'cooldown') { fabBg = 'rgba(100,116,139,0.85)'; fabLabel = `⏳ الرجاء الانتظار ${cooldown}ث`; }
                else if (block === 'qr_mode') { fabBg = 'rgba(148,163,184,0.9)'; fabLabel = '🔔 نداء الويتر'; }
                else { fabBg = pc; fabLabel = '🔔 نداء الويتر'; }

                const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' };
                const sheetStyle = { background: sheetBg, width: '100%', maxWidth: 448, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '8px 20px 36px', borderTop: `2px solid ${pc}60` };

                return (
                    <>
                        <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, zIndex: 9998, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                            <button onClick={() => block === 'qr_mode' ? handleWaiterRequest('ping') : (block === 'ready' && setShowServiceMenu(true))} disabled={isBusy} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 999, background: fabBg, color: (block === 'ready') ? '#1e293b' : '#fff', border: 'none', cursor: isBusy ? 'not-allowed' : 'pointer', pointerEvents: 'auto', fontFamily: 'Cairo, sans-serif', fontWeight: 900, fontSize: 14 }}>
                                <span>{fabLabel}</span>
                            </button>
                        </div>

                        {showPaymentOptions && (
                            <div style={overlayStyle} onClick={() => setShowPaymentOptions(false)}>
                                <div style={sheetStyle} onClick={e => e.stopPropagation()}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16, direction:'rtl', marginTop: 15 }}>
                                        <h3 style={{ margin:0, color: textColor, fontSize: 18, fontWeight: 900, display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:20 }}>💸</span>كيف تفضل الدفع؟</h3>
                                        <button onClick={() => setShowPaymentOptions(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 24, cursor: 'pointer' }}>×</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} dir="rtl">
                                        <button onClick={() => { setSelectedPayment('cash'); setShowPaymentOptions(false); setConfirmBill(true); }} style={btnBase}><span style={{ fontSize: 22 }}>💵</span><span>الدفع نقداً (Cash)</span></button>
                                        <button onClick={() => { setSelectedPayment('visa'); setShowPaymentOptions(false); setConfirmBill(true); }} style={btnBase}><span style={{ fontSize: 22 }}>💳</span><span>الدفع بالبطاقة (Visa/Mada)</span></button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {confirmBill && (
                            <div style={overlayStyle} onClick={() => setConfirmBill(false)}>
                                <div style={{ ...sheetStyle, padding: '24px 20px 32px' }} onClick={e => e.stopPropagation()}>
                                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                        <span style={{ fontSize: 40 }}>{selectedPayment === 'visa' ? '💳' : '💵'}</span>
                                        <h3 style={{ color: textColor, fontSize: 18, fontWeight: 900, margin: '12px 0 6px' }}>تأكيد الفاتورة</h3>
                                        <p style={{ color: subTextColor, fontSize: 13, margin: 0 }}>الدفع عبر: <b>{selectedPayment === 'visa' ? 'فيزا / شبكة' : 'كاش'}</b></p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, direction: 'rtl' }}>
                                        <button onClick={handleBillConfirm} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: pc, color: '#1e293b', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>نعم، تأكيد</button>
                                        <button onClick={() => { setConfirmBill(false); setShowPaymentOptions(true); }} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1px solid ${dividerColor}`, background: 'transparent', color: subTextColor, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>تغيير الدفع</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showServiceMenu && (
                            <div style={overlayStyle} onClick={() => setShowServiceMenu(false)}>
                                <div style={sheetStyle} onClick={e => e.stopPropagation()}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16, direction:'rtl', marginTop: 15 }}>
                                        <h3 style={{ margin:0, color: textColor, fontSize: 18, fontWeight: 900, display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:20 }}>🛎️</span>الخدمات</h3>
                                        <button onClick={() => setShowServiceMenu(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 24, cursor: 'pointer' }}>×</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} dir="rtl">
                                        <button onClick={() => handleWaiterRequest('bill')} style={btnBase}><span style={{ fontSize: 22 }}>🧾</span><span>طلب الفاتورة</span></button>
                                        <button onClick={() => handleWaiterRequest('clean')} style={btnBase}><span style={{ fontSize: 22 }}>🧻</span><span>تنظيف الطاولة</span></button>
                                        <button onClick={() => handleWaiterRequest('waiter')} style={btnHighlight}><span style={{ fontSize: 22 }}>👨‍🍳</span><span>مساعدة عامة</span></button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                );
            })()}
        </>
    );
}