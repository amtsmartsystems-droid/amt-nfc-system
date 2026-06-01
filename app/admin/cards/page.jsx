"use client";
import React, { useState, useEffect } from 'react';
import { Plus, LayoutTemplate, Briefcase, ChevronRight, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CardsDirectory() {
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchError, setFetchError] = useState(null);

  // 1. Fetch Cards on Load
  const fetchCards = async () => {
    try {
      const res = await fetch('/api/admin/cards');
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      } else {
        const errData = await res.json();
        setFetchError(errData.error || 'Server error');
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // 2. Create New Blank Card
  const handleCreateNewCard = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/cards', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        // Redirect directly to the editor for the new card
        router.push(`/?id=${data.cardId}`);
      } else {
        alert(data.error || 'Failed to create card');
        setIsCreating(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error creating card');
      setIsCreating(false);
    }
  };

  // 3. Navigate to Editor
  const handleEditCard = (cardId) => {
    // Navigate to the existing editor page and pass the cardId
    router.push(`/?id=${cardId}`);
  };

  const filteredCards = cards.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.cardId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-[Cairo,sans-serif] pb-24" dir="rtl">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#111111]/80 backdrop-blur-xl border-b border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <LayoutTemplate className="text-yellow-500" />
              Cards Directory
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-medium">إدارة جميع البطاقات والمطاعم (Master Hub)</p>
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
            {filteredCards.length === 0 ? (
              <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.02]">
                <LayoutTemplate className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">لا يوجد بطاقات</h3>
                <p className="text-gray-400 text-sm">لم تقم بإنشاء أي بطاقات بعد أو لم يطابق بحثك أي نتيجة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredCards.map((card) => (
                  <div 
                    key={card._id}
                    onClick={() => handleEditCard(card.cardId)}
                    className="group bg-white/5 border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/10 hover:border-yellow-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                          {card.cardType === 'business_card' ? <Briefcase size={22} /> : <LayoutTemplate size={22} />}
                        </div>
                        <span className="bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                          ID: {card.cardId}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg text-white mb-1 truncate leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize tracking-wide">
                        {card.cardType === 'business_card' ? 'Business Profile' : 'Restaurant Menu'}
                      </p>
                    </div>

                    <div className="relative z-10 flex justify-end items-center mt-4 pt-4 border-t border-white/5 text-gray-400 group-hover:text-yellow-500 transition-colors">
                      <span className="text-xs font-bold uppercase tracking-wider mr-auto">Edit Mode</span>
                      <ChevronRight size={18} className="-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
