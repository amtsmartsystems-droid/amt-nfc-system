'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PartnerLoginPage() {
    const router = useRouter();
    const [groupId, setGroupId] = useState('');
    const [pin, setPin]         = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        if (!groupId.trim() || !pin.trim()) {
            setError('يرجى إدخال رمز الغرفة و PIN.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/partner/auth', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ groupId: groupId.trim(), pin: pin.trim() }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'خطأ في الدخول.');
                setLoading(false);
                return;
            }

            // Redirect to partner room
            router.push(`/partner/${data.groupId}`);
        } catch {
            setError('تعذّر الاتصال. تحقق من الإنترنت.');
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            fontFamily: "'Cairo', sans-serif",
        }}>
            {/* Logo / Header */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: 20,
                    background: 'linear-gradient(135deg, #B99146, #EDD98A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 0 40px rgba(185,145,70,0.3)',
                }}>
                    <span style={{ fontSize: 32 }}>🏠</span>
                </div>
                <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0 }}>
                    بوابة الشريك
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>
                    Partner Portal — AMT Smart Systems
                </p>
            </div>

            {/* Login Card */}
            <form onSubmit={handleLogin} style={{
                width: '100%',
                maxWidth: 380,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(185,145,70,0.2)',
                borderRadius: 20,
                padding: '32px 24px',
                backdropFilter: 'blur(20px)',
            }}>
                {/* Group ID */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
                        رمز الغرفة (Group ID)
                    </label>
                    <input
                        type="text"
                        value={groupId}
                        onChange={e => setGroupId(e.target.value)}
                        placeholder="أدخل رمز الغرفة..."
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(185,145,70,0.25)',
                            borderRadius: 12, padding: '14px 16px',
                            color: '#fff', fontSize: 15,
                            fontFamily: 'monospace',
                            outline: 'none',
                        }}
                        dir="ltr"
                    />
                </div>

                {/* PIN */}
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
                        رمز الدخول PIN
                    </label>
                    <input
                        type="password"
                        inputMode="numeric"
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="• • • •"
                        style={{
                            width: '100%', boxSizing: 'border-box',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(185,145,70,0.25)',
                            borderRadius: 12, padding: '14px 16px',
                            color: '#fff', fontSize: 22,
                            letterSpacing: 8, textAlign: 'center',
                            outline: 'none',
                        }}
                        dir="ltr"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 10, padding: '10px 14px',
                        color: '#fca5a5', fontSize: 13, marginBottom: 20, textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        background: loading ? 'rgba(185,145,70,0.4)' : 'linear-gradient(135deg, #B99146, #EDD98A)',
                        color: loading ? 'rgba(255,255,255,0.5)' : '#1a1a1a',
                        border: 'none', borderRadius: 14,
                        padding: '16px', fontSize: 17, fontWeight: 900,
                        fontFamily: "'Cairo', sans-serif",
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                    }}
                >
                    {loading ? 'جاري الدخول...' : '🚀 دخول'}
                </button>
            </form>

            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 32, textAlign: 'center' }}>
                رمز الغرفة يوفره فريق AMT Smart Systems
            </p>
        </div>
    );
}
