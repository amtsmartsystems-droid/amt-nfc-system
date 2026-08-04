'use client';
import { useState, useEffect } from 'react';

const GOLD      = '#B99146';
const GOLD_LIGHT = '#EDD98A';
const BG        = '#0f0f0f';
const CARD_BG   = 'rgba(255,255,255,0.03)';
const BORDER    = 'rgba(185,145,70,0.18)';

export default function GroupsManagementPage() {
    const [groups, setGroups]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    // New group form
    const [showForm, setShowForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formPin, setFormPin]   = useState('');
    const [formCards, setFormCards] = useState(''); // comma-separated shortCodes
    const [formNotes, setFormNotes] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError]   = useState('');

    // Edit group
    const [editGroup, setEditGroup]   = useState(null);
    const [editName, setEditName]     = useState('');
    const [editPin, setEditPin]       = useState('');
    const [editCards, setEditCards]   = useState('');
    const [editNotes, setEditNotes]   = useState('');
    const [editActive, setEditActive] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError]     = useState('');

    // Copy PIN toast
    const [copiedId, setCopiedId] = useState(null);

    async function loadGroups() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/groups');
            const d   = await res.json();
            if (d.success) setGroups(d.groups);
            else setError(d.error || 'خطأ في التحميل');
        } catch { setError('تعذّر الاتصال'); }
        setLoading(false);
    }

    useEffect(() => { loadGroups(); }, []);

    async function handleCreate(e) {
        e.preventDefault();
        setFormLoading(true); setFormError('');
        const cards = formCards.split(',').map(s => s.trim()).filter(Boolean);
        try {
            const res = await fetch('/api/admin/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formName, pin: formPin, assignedCards: cards, notes: formNotes }),
            });
            const d = await res.json();
            if (!res.ok) { setFormError(d.error || 'خطأ'); setFormLoading(false); return; }
            setShowForm(false);
            setFormName(''); setFormPin(''); setFormCards(''); setFormNotes('');
            loadGroups();
        } catch { setFormError('خطأ في الشبكة'); }
        setFormLoading(false);
    }

    function openEdit(g) {
        setEditGroup(g);
        setEditName(g.name);
        setEditPin('');
        setEditCards((g.assignedCards || []).join(', '));
        setEditNotes(g.notes || '');
        setEditActive(g.isActive !== false);
        setEditError('');
    }

    async function handleUpdate(e) {
        e.preventDefault();
        setEditLoading(true); setEditError('');
        const cards = editCards.split(',').map(s => s.trim()).filter(Boolean);
        const body  = { name: editName, assignedCards: cards, notes: editNotes, isActive: editActive };
        if (editPin) body.pin = editPin;
        try {
            const res = await fetch(`/api/admin/groups/${editGroup._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const d = await res.json();
            if (!res.ok) { setEditError(d.error || 'خطأ'); setEditLoading(false); return; }
            setEditGroup(null);
            loadGroups();
        } catch { setEditError('خطأ في الشبكة'); }
        setEditLoading(false);
    }

    async function handleDelete(id, name) {
        if (!confirm(`حذف مجموعة "${name}"؟ لا يمكن التراجع.`)) return;
        await fetch(`/api/admin/groups/${id}`, { method: 'DELETE' });
        loadGroups();
    }

    function copyLink(groupId) {
        const url = `${window.location.origin}/partner?g=${groupId}`;
        navigator.clipboard.writeText(url);
        setCopiedId(groupId);
        setTimeout(() => setCopiedId(null), 2000);
    }

    const inp = {
        width:'100%', boxSizing:'border-box',
        background:'rgba(255,255,255,0.05)', border:`1px solid ${BORDER}`,
        borderRadius:10, padding:'11px 14px', color:'#fff', fontSize:14,
        fontFamily:"'Cairo', sans-serif", outline:'none', marginBottom:12,
    };

    return (
        <div style={{
            minHeight:'100dvh',
            background:`linear-gradient(160deg, ${BG} 0%, #1a1a2e 100%)`,
            fontFamily:"'Cairo', sans-serif", direction:'rtl', paddingBottom:60,
        }}>
            {/* Header */}
            <div style={{
                background:'rgba(255,255,255,0.03)', borderBottom:`1px solid ${BORDER}`,
                padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between',
                position:'sticky', top:0, zIndex:50, backdropFilter:'blur(20px)',
            }}>
                <div>
                    <p style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>🏠 غرف الشركاء</p>
                    <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, margin:0 }}>Partner Groups Management</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        background:`linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                        color:'#1a1a1a', border:'none', borderRadius:12,
                        padding:'10px 18px', fontSize:14, fontWeight:900,
                        fontFamily:"'Cairo', sans-serif", cursor:'pointer',
                    }}
                >
                    + غرفة جديدة
                </button>
            </div>

            <div style={{ maxWidth:800, margin:'0 auto', padding:'24px 16px' }}>
                {loading ? (
                    <div style={{ textAlign:'center', color:GOLD, padding:60 }}>
                        <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : error ? (
                    <div style={{ color:'#ef4444', textAlign:'center', padding:40 }}>{error}</div>
                ) : groups.length === 0 ? (
                    <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:60 }}>
                        <div style={{ fontSize:48, marginBottom:12 }}>🏚️</div>
                        <p>لا توجد غرف بعد. اضغط "+ غرفة جديدة" لإنشاء أول غرفة.</p>
                    </div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        {groups.map(g => (
                            <div key={g._id} style={{
                                background:CARD_BG, border:`1px solid ${g.isActive !== false ? BORDER : 'rgba(239,68,68,0.2)'}`,
                                borderRadius:18, padding:'18px 20px',
                            }}>
                                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                                    {/* Icon */}
                                    <div style={{
                                        width:48, height:48, borderRadius:14, flexShrink:0,
                                        background:`rgba(185,145,70,0.1)`, border:`1px solid ${BORDER}`,
                                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
                                    }}>
                                        {g.isActive !== false ? '🏠' : '🔒'}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                                            <p style={{ color:'#fff', fontWeight:900, fontSize:16, margin:0 }}>{g.name}</p>
                                            {g.isActive === false && (
                                                <span style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:6, padding:'2px 8px', fontSize:11, color:'#fca5a5' }}>معطّل</span>
                                            )}
                                        </div>

                                        {/* Stats row */}
                                        <div style={{ display:'flex', gap:12, marginTop:6, flexWrap:'wrap' }}>
                                            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>
                                                🃏 {(g.assignedCards || []).length} بطاقة
                                            </span>
                                            <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12, fontFamily:'monospace' }}>
                                                PIN: {'•'.repeat(g.pinLength || 4)}
                                            </span>
                                            <span style={{ color:'rgba(255,255,255,0.25)', fontSize:11, fontFamily:'monospace' }}>
                                                ID: {String(g._id).slice(-8)}
                                            </span>
                                        </div>

                                        {/* Cards list */}
                                        {(g.assignedCards || []).length > 0 && (
                                            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
                                                {(g.assignedCards || []).map(code => (
                                                    <span key={code} style={{
                                                        background:'rgba(185,145,70,0.08)', border:`1px solid ${BORDER}`,
                                                        borderRadius:6, padding:'2px 8px', fontSize:11, color:GOLD,
                                                        fontFamily:'monospace',
                                                    }}>/{code}</span>
                                                ))}
                                            </div>
                                        )}

                                        {g.notes && (
                                            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, margin:'6px 0 0' }}>{g.notes}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display:'flex', gap:8, marginTop:14, flexWrap:'wrap' }}>
                                    {/* Partner link */}
                                    <button onClick={() => copyLink(g._id)} style={{
                                        flex:1, minWidth:120,
                                        padding:'9px 12px', borderRadius:10,
                                        background: copiedId === g._id ? 'rgba(34,197,94,0.15)' : 'rgba(185,145,70,0.1)',
                                        border: copiedId === g._id ? '1px solid rgba(34,197,94,0.3)' : `1px solid ${BORDER}`,
                                        color: copiedId === g._id ? '#86efac' : GOLD,
                                        fontSize:12, fontWeight:700, cursor:'pointer',
                                        fontFamily:"'Cairo', sans-serif",
                                    }}>
                                        {copiedId === g._id ? '✅ تم النسخ!' : '🔗 نسخ رابط الشريك'}
                                    </button>

                                    {/* Full group ID */}
                                    <button onClick={() => { navigator.clipboard.writeText(g._id); }} style={{
                                        padding:'9px 12px', borderRadius:10,
                                        background:'rgba(255,255,255,0.04)', border:`1px solid ${BORDER}`,
                                        color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer',
                                        fontFamily:'monospace',
                                    }}>
                                        نسخ ID
                                    </button>

                                    {/* Edit */}
                                    <button onClick={() => openEdit(g)} style={{
                                        padding:'9px 14px', borderRadius:10,
                                        background:'rgba(255,255,255,0.05)', border:`1px solid ${BORDER}`,
                                        color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:700, cursor:'pointer',
                                        fontFamily:"'Cairo', sans-serif",
                                    }}>
                                        ✏️ تعديل
                                    </button>

                                    {/* Delete */}
                                    <button onClick={() => handleDelete(g._id, g.name)} style={{
                                        padding:'9px 12px', borderRadius:10,
                                        background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)',
                                        color:'#fca5a5', fontSize:12, cursor:'pointer',
                                        fontFamily:"'Cairo', sans-serif",
                                    }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create Group Modal ── */}
            {showForm && (
                <Modal title="إنشاء غرفة جديدة" onClose={() => setShowForm(false)}>
                    <form onSubmit={handleCreate}>
                        <label style={lblStyle}>اسم الغرفة (اسم الشريك)</label>
                        <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="مثال: شريك الرياض" required style={inp} />

                        <label style={lblStyle}>رمز PIN (4-8 أرقام)</label>
                        <input value={formPin} onChange={e => setFormPin(e.target.value.replace(/\D/g,'').slice(0,8))}
                            placeholder="مثال: 1234" inputMode="numeric" required style={{ ...inp, letterSpacing:8, textAlign:'center', fontSize:20 }} dir="ltr" />

                        <label style={lblStyle}>رموز البطاقات (مفصولة بفاصلة)</label>
                        <input value={formCards} onChange={e => setFormCards(e.target.value)}
                            placeholder="مثال: ALI, AHMAD, MAROUF" style={{ ...inp, fontFamily:'monospace' }} dir="ltr" />

                        <label style={lblStyle}>ملاحظات (اختياري)</label>
                        <input value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="ملاحظات داخلية..." style={inp} />

                        {formError && <p style={{ color:'#fca5a5', fontSize:13, marginBottom:12 }}>⚠️ {formError}</p>}

                        <button type="submit" disabled={formLoading} style={btnStyle}>
                            {formLoading ? 'جاري الإنشاء...' : '✅ إنشاء الغرفة'}
                        </button>
                    </form>
                </Modal>
            )}

            {/* ── Edit Group Modal ── */}
            {editGroup && (
                <Modal title={`تعديل: ${editGroup.name}`} onClose={() => setEditGroup(null)}>
                    <form onSubmit={handleUpdate}>
                        <label style={lblStyle}>اسم الغرفة</label>
                        <input value={editName} onChange={e => setEditName(e.target.value)} required style={inp} />

                        <label style={lblStyle}>PIN جديد (اتركه فارغاً للإبقاء على القديم)</label>
                        <input value={editPin} onChange={e => setEditPin(e.target.value.replace(/\D/g,'').slice(0,8))}
                            placeholder="اتركه فارغاً..." inputMode="numeric"
                            style={{ ...inp, letterSpacing: editPin ? 8 : 0, textAlign:'center', fontSize:18 }} dir="ltr" />

                        <label style={lblStyle}>رموز البطاقات (مفصولة بفاصلة)</label>
                        <input value={editCards} onChange={e => setEditCards(e.target.value)}
                            placeholder="ALI, AHMAD, MAROUF" style={{ ...inp, fontFamily:'monospace' }} dir="ltr" />

                        <label style={lblStyle}>ملاحظات</label>
                        <input value={editNotes} onChange={e => setEditNotes(e.target.value)} style={inp} />

                        <label style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, cursor:'pointer' }}>
                            <input type="checkbox" checked={editActive} onChange={e => setEditActive(e.target.checked)}
                                style={{ width:18, height:18, accentColor:GOLD }} />
                            <span style={{ color:'rgba(255,255,255,0.7)', fontSize:14 }}>الغرفة نشطة</span>
                        </label>

                        {editError && <p style={{ color:'#fca5a5', fontSize:13, marginBottom:12 }}>⚠️ {editError}</p>}

                        <button type="submit" disabled={editLoading} style={btnStyle}>
                            {editLoading ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position:'fixed', inset:0, zIndex:200,
            background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)',
            display:'flex', alignItems:'flex-end',
            fontFamily:"'Cairo', sans-serif",
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                width:'100%', maxWidth:520, margin:'0 auto',
                background:'#141420', border:`1px solid ${BORDER}`,
                borderRadius:'24px 24px 0 0', padding:'24px 20px 40px',
                maxHeight:'90dvh', overflowY:'auto',
            }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <p style={{ color:'#fff', fontWeight:900, fontSize:17, margin:0 }}>{title}</p>
                    <button onClick={onClose} style={{
                        background:'rgba(255,255,255,0.08)', border:`1px solid ${BORDER}`,
                        borderRadius:10, width:34, height:34,
                        color:'rgba(255,255,255,0.5)', fontSize:16, cursor:'pointer',
                    }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

const lblStyle = { display:'block', color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, marginBottom:6 };
const btnStyle = {
    width:'100%', padding:'15px',
    background:`linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
    color:'#1a1a1a', border:'none', borderRadius:14,
    fontSize:15, fontWeight:900,
    fontFamily:"'Cairo', sans-serif", cursor:'pointer',
};
