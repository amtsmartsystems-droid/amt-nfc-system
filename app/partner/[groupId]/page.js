'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartnerRoomPage({ params }) {
    const { groupId } = params;
    const router = useRouter();
    const [cards, setCards]       = useState([]);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    useEffect(() => {
        fetch('/api/partner/cards')
            .then(r => r.json())
            .then(d => {
                if (!d.success) {
                    if (d.error?.includes('مصرح')) router.push('/partner');
                    else setError(d.error || 'خطأ');
                } else {
                    setCards(d.cards);
                    setGroupName(d.groupName);
                }
                setLoading(false);
            })
            .catch(() => { setError('تعذّر التحميل.'); setLoading(false); });
    }, []);

    async function handleLogout() {
        await fetch('/api/partner/auth', { method: 'DELETE' });
        router.push('/partner');
    }

    const color = '#B99146';

    if (loading) return (
        <div style={{ minHeight: '100dvh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#B99146', fontFamily: 'Cairo, sans-serif' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <p>جاري التحميل...</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100dvh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#ef4444', fontFamily: 'Cairo, sans-serif', padding: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <p>{error}</p>
                <button onClick={() => router.push('/partner')} style={{ marginTop: 16, padding: '12px 24px', background: '#B99146', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>
                    إعادة الدخول
                </button>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'linear-gradient(160deg, #0f0f0f 0%, #1a1a2e 100%)',
            fontFamily: "'Cairo', sans-serif",
            direction: 'rtl',
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(185,145,70,0.15)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 50,
                backdropFilter: 'blur(20px)',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #B99146, #EDD98A)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16,
                        }}>🏠</div>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, margin: 0 }}>{groupName}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>
                                {cards.length} {cards.length === 1 ? 'بطاقة' : 'بطاقات'}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5', borderRadius: 10,
                        padding: '8px 14px', fontSize: 13,
                        cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                        fontWeight: 600,
                    }}
                >
                    خروج
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
                {/* Welcome */}
                <div style={{
                    background: 'rgba(185,145,70,0.06)',
                    border: '1px solid rgba(185,145,70,0.15)',
                    borderRadius: 16, padding: '16px 20px',
                    marginBottom: 24,
                }}>
                    <p style={{ color: '#EDD98A', fontSize: 14, fontWeight: 700, margin: 0 }}>
                        👋 مرحباً! اختر البطاقة التي تريد تعديلها
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '4px 0 0' }}>
                        يمكنك تعديل الاسم، الروابط، والصورة لكل بطاقة
                    </p>
                </div>

                {/* Cards Grid */}
                {cards.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                        <p style={{ fontSize: 16 }}>لا توجد بطاقات في مجموعتك بعد</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {cards.map(card => (
                            <PartnerCardItem
                                key={card.shortCode}
                                card={card}
                                groupId={groupId}
                                onEdit={() => router.push(`/partner/${groupId}/edit/${card.shortCode}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PartnerCardItem({ card, onEdit }) {
    const name = card.siteData?.name || card.businessName || card.shortCode;
    const subtitle = card.siteData?.subtitle || '';
    const img = card.siteData?.images?.profile;
    const linksCount = (card.links || []).length;
    const isLocked = !card.allowEditing || card.subscriptionStatus !== 'active';

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLocked ? 'rgba(239,68,68,0.2)' : 'rgba(185,145,70,0.15)'}`,
            borderRadius: 16,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: isLocked ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
        }}
        onClick={!isLocked ? onEdit : undefined}
        >
            {/* Avatar */}
            <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `rgba(185,145,70,0.1)`,
                border: '1px solid rgba(185,145,70,0.2)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {img ? (
                    <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ fontSize: 22 }}>🏷️</span>
                )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 15, margin: 0, truncate: true }}>{name}</p>
                {subtitle && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{
                        background: 'rgba(185,145,70,0.1)', border: '1px solid rgba(185,145,70,0.2)',
                        borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#B99146', fontWeight: 700,
                    }}>
                        🔗 {linksCount} رابط
                    </span>
                    <span style={{
                        fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace',
                    }}>/{card.shortCode}</span>
                </div>
            </div>

            {/* Edit Arrow */}
            <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: isLocked ? 'rgba(239,68,68,0.1)' : 'rgba(185,145,70,0.1)',
                border: `1px solid ${isLocked ? 'rgba(239,68,68,0.2)' : 'rgba(185,145,70,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
            }}>
                {isLocked ? '🔒' : '✏️'}
            </div>
        </div>
    );
}
