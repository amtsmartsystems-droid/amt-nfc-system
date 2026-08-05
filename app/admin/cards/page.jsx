'use client';

import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Plus, Search, Trash2, Key, ChevronRight, Loader2, Database, Briefcase, X, Link2, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminCardsDirectory() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTenantId, setAuthTenantId] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Batch Modal State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchCount, setBatchCount] = useState(50);
  const [startingId, setStartingId] = useState('');
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);

  // Partner Share Link Modal
  const [shareGroup, setShareGroup] = useState(null); // { batchName, groupId }
  const [groups, setGroups] = useState([]);            // loaded from /api/admin/groups
  const [copiedLink, setCopiedLink] = useState(false);
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);
  const [quickPin, setQuickPin] = useState('');

  // Fetch partner groups for share-link mapping
  useEffect(() => {
    fetch('/api/admin/groups')
      .then(r => r.json())
      .then(d => { if (d.success) setGroups(d.groups); })
      .catch(() => {});
  }, []);

  function getGroupForBatch(batchName) {
    return groups.find(g =>
      (g.assignedCards || []).some(code =>
        code.toUpperCase() === batchName.toUpperCase()
      )
    );
  }

  function handleCopyShareLink(link) {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  const handleQuickCreateGroup = async (batchName) => {
    if (!quickPin || quickPin.length < 4) {
      alert("الرجاء إدخال PIN من 4 أرقام على الأقل");
      return;
    }
    setQuickCreateLoading(true);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: `غرفة ${batchName}`, 
          pin: quickPin, 
          assignedCards: [batchName],
          notes: 'أنشئت تلقائياً من لوحة المجموعات'
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setQuickPin('');
        const grpRes = await fetch('/api/admin/groups');
        const grpData = await grpRes.json();
        if (grpData.success) {
           setGroups(grpData.groups);
           const matchedGroup = grpData.groups.find(g => g._id === d.group._id);
           setShareGroup({ batchName, matchedGroup });
        }
      } else {
        alert(d.error || 'فشل إنشاء الغرفة');
      }
    } catch(e) {
      console.error(e);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setQuickCreateLoading(false);
    }
  };

  // 1. Fetch Cards on Load
  const fetchCards = async () => {
    try {
      setFetchError(null);
      const res = await fetch('/api/admin/cards');
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      } else {
        setFetchError(`Server returned ${res.status}`);
      }
    } catch (error) {
      console.error(error);
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // 2. Add New Card
  const handleCreateNewCard = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/cards', { method: 'POST' });
      if (res.ok) {
        fetchCards();
      } else {
        alert('حدث خطأ أثناء الإنشاء');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Edit Card
  const handleEditCard = (cardId) => {
    router.push(`/?cardId=${cardId}`);
  };

  // 4. Delete Card
  const handleDeleteCard = async (e, dbId) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذه البطاقة نهائياً؟')) return;
    try {
      const res = await fetch(`/api/admin/cards?id=${dbId}`, { method: 'DELETE' });
      if (res.ok) {
        setCards(cards.filter(c => c._id !== dbId));
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsCreatingBatch(true);
    try {
      const res = await fetch('/api/admin/cards/batch-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchName, count: parseInt(batchCount), startingId: parseInt(startingId) })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'تم إنشاء المجموعة بنجاح');
        setShowBatchModal(false);
        setBatchName('');
        setBatchCount(50);
        setStartingId('');
        fetchCards();
      } else {
        alert(data.error || 'Failed to create batch');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating batch');
    } finally {
      setIsCreatingBatch(false);
    }
  };

  // Grouping logic for batches
  let displayItems = [];
  if (selectedBatch) {
    // Show only cards inside the selected batch
    displayItems = cards.filter(c => c.batchName === selectedBatch)
      .sort((a, b) => a.batchSerial - b.batchSerial)
      .map(c => ({ ...c, isCard: true }));
  } else {
    // Show single cards and batch folders
    const batchMap = {};
    cards.forEach(c => {
      if (c.batchName) {
        if (!batchMap[c.batchName]) {
          batchMap[c.batchName] = { isBatchFolder: true, batchName: c.batchName, count: 0, _id: c.batchName };
        }
        batchMap[c.batchName].count++;
      } else {
        displayItems.push({ ...c, isCard: true });
      }
    });
    displayItems = [...displayItems, ...Object.values(batchMap)];
  }

  const filteredItems = displayItems.filter(item => {
    if (item.isBatchFolder) {
      return item.batchName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return (
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.cardId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedCards.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedCards.length} بطاقة نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/admin/cards?ids=${selectedCards.join(',')}`, { method: 'DELETE' });
      if (res.ok) {
        setCards(cards.filter(c => !selectedCards.includes(c._id)));
        setSelectedCards([]);
      } else {
        alert('حدث خطأ أثناء الحذف الجماعي');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredItems.filter(item => !item.isBatchFolder).map(item => item._id);
      setSelectedCards(allIds);
    } else {
      setSelectedCards([]);
    }
  };

  const handleSelectCard = (e, dbId) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedCards([...selectedCards, dbId]);
    } else {
      setSelectedCards(selectedCards.filter(id => id !== dbId));
    }
  };

  // 5. Create Owner Account
  const handleCreateOwnerAccount = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/auth/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: authTenantId, email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('تم إنشاء حساب المالك بنجاح');
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        alert(data.error || 'فشل إنشاء الحساب');
      }
    } catch (error) {
      console.error(error);
      alert('حدث خطأ');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] font-[Cairo,sans-serif]" dir="rtl">
      
      {/* Navbar */}
      <header className="bg-black/40 border-b border-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Database className="text-yellow-500 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white m-0">قاعدة البيانات</h1>
              <p className="text-xs text-gray-400">إدارة البطاقات</p>
            </div>
          </div>
          
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="ابحث عن بطاقة..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 pr-10 outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all text-sm placeholder:text-gray-500 text-white"
              />
              <Search size={18} className="absolute top-3 right-3 text-gray-500" />
            </div>
            
            <button 
              onClick={() => setShowBatchModal(true)}
              className="bg-blue-500 hover:bg-blue-400 text-black font-bold py-2.5 px-5 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] flex items-center gap-2 whitespace-nowrap"
            >
              <Briefcase size={18} />
              <span className="hidden sm:inline">إنشاء مجموعة</span>
            </button>

            <button 
              onClick={handleCreateNewCard}
              disabled={isCreating}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 px-5 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              <span className="hidden sm:inline">إنشاء بطاقة</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {selectedBatch && (
          <div className="flex items-center justify-between mb-6 bg-white/5 border border-white/10 p-3 rounded-2xl w-full">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedBatch(null)} className="text-gray-400 hover:text-white p-1 bg-black/40 rounded-lg">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" /> مجموعة: {selectedBatch}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Header */}
        {!isLoading && !fetchError && filteredItems.filter(i => !i.isBatchFolder).length > 0 && (
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-blue-500 cursor-pointer"
                onChange={handleSelectAll}
                checked={selectedCards.length > 0 && selectedCards.length === filteredItems.filter(i => !i.isBatchFolder).length}
              />
              <span className="text-xs text-gray-400 font-bold">تحديد الكل</span>
            </div>
            
            {selectedCards.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-xs font-bold transition-colors"
              >
                <Trash2 size={14} />
                حذف المحدد ({selectedCards.length})
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="animate-spin w-10 h-10 text-yellow-500" />
            <p className="font-bold text-sm tracking-widest">LOADING CARDS...</p>
          </div>
        ) : fetchError ? (
          <div className="text-center py-20 border border-red-500/20 rounded-3xl bg-red-500/5">
            <h3 className="text-xl font-bold text-red-500 mb-2">حدث خطأ في الاتصال بقاعدة البيانات</h3>
            <p className="text-gray-400 text-sm">{fetchError}</p>
            <p className="text-gray-400 text-sm mt-2">تأكد من تشغيل السيرفر مع إعدادات .env الصحيحة</p>
          </div>
        ) : (
          <>
            {filteredItems.length === 0 ? (
              <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
                <LayoutTemplate className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">لا يوجد بطاقات</h3>
                <p className="text-gray-400 text-sm">لم تقم بإنشاء أي بطاقات بعد أو لم يطابق بحثك أي نتيجة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredItems.map((item) => (
                  item.isBatchFolder ? (() => {
                    const matchedGroup = getGroupForBatch(item.batchName);
                    return (
                    <div 
                      key={item._id}
                      className="group bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-black/40 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <Briefcase size={22} />
                          </div>
                          {/* 🔗 Share Link Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setShareGroup({ batchName: item.batchName, matchedGroup }); setCopiedLink(false); }}
                            title="مشاركة رابط الشريك"
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: matchedGroup ? 'rgba(185,145,70,0.15)' : 'rgba(255,255,255,0.06)', border: matchedGroup ? '1px solid rgba(185,145,70,0.4)' : '1px solid rgba(255,255,255,0.1)', color: matchedGroup ? '#B99146' : '#6b7280' }}
                          >
                            <Link2 size={16} />
                          </button>
                        </div>
                        <h3 className="font-bold text-lg text-white mb-1 truncate leading-tight">
                          مجموعة: {item.batchName}
                        </h3>
                        <p className="text-xs text-blue-400 tracking-wide font-bold">
                          {item.count} بطاقات بالداخل
                        </p>
                        {matchedGroup && (
                          <p className="text-[10px] mt-1" style={{ color:'#B99146' }}>🏠 {matchedGroup.name}</p>
                        )}
                      </div>
                      <div
                        onClick={() => setSelectedBatch(item.batchName)}
                        className="relative z-10 flex justify-end items-center mt-4 pt-4 border-t border-blue-500/10 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <span className="text-xs font-bold mr-auto">فتح المجموعة</span>
                        <ChevronRight size={18} className="-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                    </div>
                    );
                  })()
                  : (
                    <div 
                      key={item._id}
                      onClick={() => handleEditCard(item.cardId)}
                      className="group bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/10 hover:border-yellow-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                    >
                      {/* Hover Glow Effect */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-3">
                            <input 
                              type="checkbox" 
                              className="mt-1 w-4 h-4 accent-blue-500 cursor-pointer z-20"
                              onClick={e => e.stopPropagation()}
                              onChange={e => handleSelectCard(e, item._id)}
                              checked={selectedCards.includes(item._id)}
                            />
                            <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                              {item.cardType === 'business_card' ? <Briefcase size={22} /> : <LayoutTemplate size={22} />}
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-end items-center gap-2 z-20 max-w-[50%]">
                            <span className="bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1">
                              ID: {item.cardId}
                              {item.batchSerial && <span className="text-blue-400">#{item.batchSerial}</span>}
                            </span>
                            {item.isMerged && (
                              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-lg">
                                مدمجة ({item.mergeStart}-{item.mergeEnd})
                              </span>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); setAuthTenantId(item.cardId); setShowAuthModal(true); }} 
                              className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"
                              title="إنشاء حساب صاحب المطعم"
                            >
                              <Key size={16} />
                            </button>
                            <button onClick={(e) => handleDeleteCard(e, item._id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-lg text-white mb-1 truncate leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize tracking-wide">
                          {item.cardType === 'business_card' ? 'Business Profile' : 'Restaurant Menu'}
                        </p>
                      </div>

                      <div className="relative z-10 flex justify-end items-center mt-4 pt-4 border-t border-white/5 text-gray-400 group-hover:text-yellow-500 transition-colors">
                        <span className="text-xs font-bold uppercase tracking-wider mr-auto">Edit Mode</span>
                        <ChevronRight size={18} className="-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Batch Create Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-blue-500/20 rounded-3xl p-6 w-full max-w-sm relative">
            <button onClick={() => setShowBatchModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Briefcase className="text-blue-500" /> إنشاء مجموعة جديدة
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              سيتم إنشاء بطاقات فرعية بروابط (ShortCodes) منفصلة وتجميعها في مجلد واحد.
            </p>
            
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">اسم المجموعة</label>
                <input 
                  type="text" 
                  required
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50"
                  placeholder="مثال: موظفين شركة AMT"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">عدد البطاقات</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    max="100"
                    value={batchCount}
                    onChange={e => setBatchCount(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50"
                    placeholder="50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">رقم البداية للـ ID</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={startingId}
                    onChange={e => setStartingId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50"
                    placeholder="مثال: 1"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isCreatingBatch}
                className="w-full bg-blue-500 hover:bg-blue-400 text-black font-bold py-3 rounded-xl mt-2 transition-all flex items-center justify-center gap-2"
              >
                {isCreatingBatch ? <Loader2 size={18} className="animate-spin" /> : 'إنشاء البطاقات'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Setup Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">إنشاء حساب المطعم</h2>
            <p className="text-xs text-gray-400 mb-5">معرف البطاقة: <span className="text-yellow-400 font-mono">{authTenantId}</span></p>
            
            <form onSubmit={handleCreateOwnerAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">البريد الإلكتروني (اسم المستخدم)</label>
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  dir="ltr"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-yellow-500/50"
                  placeholder="admin@restaurant.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">كلمة المرور</label>
                <input 
                  type="text" 
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  dir="ltr"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-yellow-500/50"
                  placeholder="Secret123"
                />
              </div>
              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl mt-2 transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? <Loader2 size={18} className="animate-spin" /> : 'إنشاء وتفعيل الحساب'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Partner Share Link Modal ── */}
      {shareGroup && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShareGroup(null)}
        >
          <div className="bg-[#111827] border border-yellow-500/20 rounded-3xl p-6 w-full max-w-md relative"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            <button onClick={() => setShareGroup(null)}
              className="absolute top-4 left-4 text-gray-500 hover:text-white w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(185,145,70,0.15)', border: '1px solid rgba(185,145,70,0.3)' }}>
                <Link2 size={20} style={{ color: '#B99146' }} />
              </div>
              <div>
                <p className="text-white font-black text-base">رابط مشاركة المجموعة</p>
                <p className="text-gray-400 text-xs">مجموعة: {shareGroup.batchName}</p>
              </div>
            </div>

            {shareGroup.matchedGroup ? (
              <>
                {/* Partner group found */}
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(185,145,70,0.08)', border: '1px solid rgba(185,145,70,0.2)' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#B99146' }}>🏠 {shareGroup.matchedGroup.name}</p>
                  <p className="text-gray-400 text-[11px]">
                    {(shareGroup.matchedGroup.assignedCards || []).length} بطاقة مرتبطة
                  </p>
                </div>

                {/* Partner URL */}
                <p className="text-xs text-gray-400 font-bold mb-2">رابط بوابة الشريك:</p>
                <div className="flex items-center gap-2 mb-5">
                  <input
                    readOnly
                    dir="ltr"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/partner?g=${shareGroup.matchedGroup._id}`}
                    className="flex-1 text-[12px] bg-black/40 text-gray-300 px-3 py-2.5 rounded-xl border border-white/10 outline-none font-mono overflow-hidden"
                  />
                  <button
                    onClick={() => handleCopyShareLink(`${window.location.origin}/partner?g=${shareGroup.matchedGroup._id}`)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: copiedLink ? 'rgba(34,197,94,0.2)' : 'rgba(185,145,70,0.2)',
                      border: copiedLink ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(185,145,70,0.4)',
                      color: copiedLink ? '#86efac' : '#B99146',
                    }}
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                {copiedLink && (
                  <p className="text-center text-xs font-bold mb-3" style={{ color: '#86efac' }}>✅ تم نسخ الرابط!</p>
                )}

                <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                  أرسل هذا الرابط للشريك. سيطلب منه إدخال PIN الذي حددته عند إنشاء الغرفة.
                </p>
              </>
            ) : (
              <>
                {/* No group linked yet -> Quick Create */}
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4 text-yellow-500">
                    <Plus size={32} />
                  </div>
                  <p className="text-white font-bold text-lg mb-2">إنشاء غرفة شريك فورية</p>
                  <p className="text-gray-400 text-xs leading-relaxed mb-6">
                    مجموعة <span className="text-yellow-400 font-mono font-bold">"{shareGroup.batchName}"</span> غير مرتبطة.
                    <br />أدخل رقم PIN سري لإنشاء غرفة مخصصة لها بضغطة زر.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="رقم PIN (مثال: 1234)"
                      value={quickPin}
                      onChange={e => setQuickPin(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-yellow-500/50 text-center font-mono tracking-widest"
                      maxLength={8}
                    />
                    <button
                      onClick={() => handleQuickCreateGroup(shareGroup.batchName)}
                      disabled={quickCreateLoading || quickPin.length < 4}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {quickCreateLoading ? <Loader2 size={18} className="animate-spin" /> : '🚀 إنشاء الغرفة الآن'}
                    </button>
                    <a
                      href="/superadmin/groups"
                      target="_blank"
                      className="text-gray-500 hover:text-gray-300 text-[11px] underline mt-2"
                    >
                      أو انتقل للإعدادات المتقدمة
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

