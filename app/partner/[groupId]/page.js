'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, FolderPlus, FolderOpen, MoreVertical, X, Check, ArrowRightLeft, FolderDown } from 'lucide-react';

export default function PartnerRoomPage({ params }) {
    const { groupId } = params;
    const router = useRouter();
    const [cards, setCards]       = useState([]);
    const [groupName, setGroupName] = useState('');
    const [subgroups, setSubgroups] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    // Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    
    // UI State for Accordions
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = () => {
        setLoading(true);
        fetch('/api/partner/cards')
            .then(r => r.json())
            .then(d => {
                if (!d.success) {
                    if (d.error?.includes('مصرح')) router.push('/partner');
                    else setError(d.error || 'خطأ');
                } else {
                    setCards(d.cards);
                    setGroupName(d.groupName);
                    setSubgroups(d.subgroups || []);
                }
                setLoading(false);
            })
            .catch(() => { setError('تعذّر التحميل.'); setLoading(false); });
    };

    async function handleLogout() {
        await fetch('/api/partner/auth', { method: 'DELETE' });
        router.push('/partner');
    }

    const toggleSelection = (shortCode) => {
        setSelectedCards(prev => 
            prev.includes(shortCode) ? prev.filter(id => id !== shortCode) : [...prev, shortCode]
        );
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        const res = await fetch('/api/partner/subgroups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newGroupName, cardIds: selectedCards })
        });
        const d = await res.json();
        if (d.success) {
            setSubgroups(d.subgroups);
            setIsCreateModalOpen(false);
            setNewGroupName('');
            setSelectedCards([]);
            setIsSelectionMode(false);
        } else {
            alert(d.error || 'حدث خطأ');
        }
    };

    const handleMoveCards = async (targetSubgroupId) => {
        const res = await fetch('/api/partner/subgroups', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'move_cards', 
                targetSubgroupId: targetSubgroupId, // null means ungroup
                cardIds: selectedCards 
            })
        });
        const d = await res.json();
        if (d.success) {
            setSubgroups(d.subgroups);
            setIsMoveModalOpen(false);
            setSelectedCards([]);
            setIsSelectionMode(false);
        } else {
            alert(d.error || 'حدث خطأ');
        }
    };

    const handleDeleteGroup = async (subgroupId) => {
        if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟ لن يتم حذف البطاقات، ستعود فقط للقائمة الرئيسية.')) return;
        const res = await fetch('/api/partner/subgroups', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_group', subgroupId })
        });
        const d = await res.json();
        if (d.success) {
            setSubgroups(d.subgroups);
        } else {
            alert(d.error || 'حدث خطأ');
        }
    };

    const toggleGroup = (id) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

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

    // Filter cards into grouped and ungrouped
    const groupedCardIds = new Set(subgroups.flatMap(sg => sg.cards));
    const ungroupedCards = cards.filter(c => !groupedCardIds.has(c.shortCode));

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'linear-gradient(160deg, #0f0f0f 0%, #1a1a2e 100%)',
            fontFamily: "'Cairo', sans-serif",
            direction: 'rtl',
            paddingBottom: selectedCards.length > 0 ? '100px' : '0' // Space for floating toolbar
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
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            setSelectedCards([]);
                        }}
                        style={{
                            background: isSelectionMode ? '#B99146' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isSelectionMode ? '#EDD98A' : 'rgba(255,255,255,0.1)'}`,
                            color: isSelectionMode ? '#000' : '#fff', borderRadius: 10,
                            padding: '8px 14px', fontSize: 13,
                            cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                            fontWeight: 700, transition: 'all 0.2s'
                        }}
                    >
                        {isSelectionMode ? 'إلغاء التحديد' : 'تحديد'}
                    </button>
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
            </div>

            {/* Content */}
            <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
                
                {/* Subgroups (Folders) */}
                {subgroups.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                        <h3 style={{ color: '#EDD98A', fontSize: 14, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Folder size={18} /> المجموعات
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {subgroups.map(sg => {
                                const isExpanded = expandedGroups[sg.id];
                                const sgCards = cards.filter(c => sg.cards.includes(c.shortCode));
                                return (
                                    <div key={sg.id} style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(185,145,70,0.2)',
                                        borderRadius: 16,
                                        overflow: 'hidden'
                                    }}>
                                        <div 
                                            onClick={() => toggleGroup(sg.id)}
                                            style={{
                                                padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                cursor: 'pointer', background: isExpanded ? 'rgba(185,145,70,0.05)' : 'transparent',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ color: '#B99146' }}>{isExpanded ? <FolderOpen size={24} /> : <Folder size={24} />}</div>
                                                <div>
                                                    <p style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: 15 }}>{sg.name}</p>
                                                    <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: 12 }}>{sgCards.length} بطاقات</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteGroup(sg.id); }}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', padding: 4, cursor: 'pointer', opacity: 0.7 }}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {isExpanded && (
                                            <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                                                {sgCards.length === 0 ? (
                                                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>لا توجد بطاقات هنا</p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {sgCards.map(card => (
                                                            <PartnerCardItem
                                                                key={card.shortCode}
                                                                card={card}
                                                                groupId={groupId}
                                                                isSelectionMode={isSelectionMode}
                                                                isSelected={selectedCards.includes(card.shortCode)}
                                                                onToggle={() => toggleSelection(card.shortCode)}
                                                                onEdit={() => router.push(`/partner/${groupId}/edit/${card.shortCode}`)}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Ungrouped Cards Grid */}
                <div>
                    {subgroups.length > 0 && (
                        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>البطاقات الأخرى</h3>
                    )}
                    
                    {ungroupedCards.length === 0 && subgroups.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                            <p style={{ fontSize: 16 }}>لا توجد بطاقات في مجموعتك بعد</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {ungroupedCards.map(card => (
                                <PartnerCardItem
                                    key={card.shortCode}
                                    card={card}
                                    groupId={groupId}
                                    isSelectionMode={isSelectionMode}
                                    isSelected={selectedCards.includes(card.shortCode)}
                                    onToggle={() => toggleSelection(card.shortCode)}
                                    onEdit={() => router.push(`/partner/${groupId}/edit/${card.shortCode}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Toolbar for Selection Mode */}
            {isSelectionMode && selectedCards.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(20,20,25,0.95)', border: '1px solid rgba(185,145,70,0.3)',
                    borderRadius: 20, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(10px)',
                    width: '90%', maxWidth: 400, justifyContent: 'space-between'
                }}>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                        تم تحديد: <span style={{ color: '#B99146' }}>{selectedCards.length}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                            onClick={() => setIsMoveModalOpen(true)}
                            style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff', borderRadius: 12, padding: '8px 12px', fontSize: 12, fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                            }}
                        >
                            <FolderDown size={14} /> نقل
                        </button>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            style={{
                                background: '#B99146', border: 'none',
                                color: '#000', borderRadius: 12, padding: '8px 12px', fontSize: 12, fontWeight: 800,
                                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                            }}
                        >
                            <FolderPlus size={14} /> مجلد جديد
                        </button>
                    </div>
                </div>
            )}

            {/* Create Group Modal */}
            {isCreateModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div style={{ background: '#1a1a1a', borderRadius: 20, padding: 24, width: '100%', maxWidth: 320, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: 18 }}>مجلد جديد</h3>
                        <input 
                            type="text" 
                            placeholder="اسم المجلد (مثال: كافيهات عمان)" 
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(185,145,70,0.3)', color: '#fff', outline: 'none', marginBottom: 20,
                                fontFamily: 'Cairo, sans-serif'
                            }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button 
                                onClick={handleCreateGroup}
                                style={{ flex: 1, padding: 12, borderRadius: 12, background: '#B99146', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
                            >
                                إنشاء
                            </button>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                style={{ flex: 1, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Move Modal */}
            {isMoveModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#1a1a1a', borderRadius: '24px', padding: 24, width: '90%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ color: '#fff', margin: 0, fontSize: 18 }}>نقل ({selectedCards.length}) بطاقات إلى...</h3>
                            <button onClick={() => setIsMoveModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button 
                                onClick={() => handleMoveCards(null)} // null = ungroup
                                style={{
                                    padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                                    border: '1px dashed rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
                                    cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700
                                }}
                            >
                                <ArrowRightLeft size={18} /> إزالة من أي مجلد (البطاقات الأخرى)
                            </button>
                            
                            {subgroups.map(sg => (
                                <button 
                                    key={sg.id}
                                    onClick={() => handleMoveCards(sg.id)}
                                    style={{
                                        padding: '16px', borderRadius: 12, background: 'rgba(185,145,70,0.1)',
                                        border: '1px solid rgba(185,145,70,0.2)', color: '#fff', display: 'flex', alignItems: 'center', gap: 12,
                                        cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700
                                    }}
                                >
                                    <Folder size={18} color="#B99146" /> {sg.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PartnerCardItem({ card, onEdit, isSelectionMode, isSelected, onToggle }) {
    const name = card.siteData?.name || card.businessName || card.shortCode;
    const subtitle = card.siteData?.subtitle || '';
    const img = card.siteData?.images?.profile;
    const linksCount = (card.links || []).length;
    const isLocked = !card.allowEditing || card.subscriptionStatus !== 'active';

    return (
        <div style={{
            background: isSelected ? 'rgba(185,145,70,0.1)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLocked ? 'rgba(239,68,68,0.2)' : isSelected ? '#B99146' : 'rgba(185,145,70,0.15)'}`,
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: isLocked ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
        }}
        onClick={!isLocked ? (isSelectionMode ? onToggle : onEdit) : undefined}
        >
            {isSelectionMode && (
                <div style={{
                    width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? '#B99146' : 'rgba(255,255,255,0.3)'}`,
                    background: isSelected ? '#B99146' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {isSelected && <Check size={14} color="#000" />}
                </div>
            )}
            
            {/* Avatar */}
            <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `rgba(185,145,70,0.1)`,
                border: '1px solid rgba(185,145,70,0.2)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {img ? (
                    <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ fontSize: 20 }}>🏷️</span>
                )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 15, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                {subtitle && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{
                        background: 'rgba(185,145,70,0.1)', border: '1px solid rgba(185,145,70,0.2)',
                        borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#B99146', fontWeight: 700,
                    }}>
                        🔗 {linksCount} رابط
                    </span>
                    <span style={{
                        fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace',
                    }}>/{card.shortCode}</span>
                </div>
            </div>

            {/* Edit Arrow - Hide in selection mode */}
            {!isSelectionMode && (
                <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: isLocked ? 'rgba(239,68,68,0.1)' : 'rgba(185,145,70,0.1)',
                    border: `1px solid ${isLocked ? 'rgba(239,68,68,0.2)' : 'rgba(185,145,70,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                }}>
                    {isLocked ? '🔒' : '✏️'}
                </div>
            )}
        </div>
    );
}
