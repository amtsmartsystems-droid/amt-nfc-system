"use client";
import React, { useState, useEffect } from 'react';
import { Settings, Power, PowerOff, Building2, Search, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/superadmin/cards');
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleToggleStatus = async (restaurantId) => {
    try {
      // Optimistic update
      setRestaurants(prev => prev.map(rest => 
        rest._id === restaurantId 
          ? { ...rest, status: rest.status === 'active' ? 'suspended' : 'active' } 
          : rest
      ));

      const res = await fetch('/api/superadmin/cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: restaurantId, action: 'toggleStatus' })
      });

      if (!res.ok) {
        // Revert on failure
        fetchRestaurants();
      }
    } catch (e) {
      console.error(e);
      fetchRestaurants();
    }
  };

  const handleManageClick = (shortCode) => {
    // Navigate to the main builder page with the shortCode as query param
    router.push(`/?id=${shortCode}`);
  };

  const filteredRestaurants = restaurants.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.shortCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans" dir="rtl">
      
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">إدارة النظام (Super Admin)</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">التحكم بجميع المطاعم والبطاقات في النظام</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="ابحث عن مطعم أو كود..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 pr-10 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <Search size={18} className="absolute top-2.5 right-3 text-gray-400" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Row */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 min-w-[160px] shadow-sm flex-1 md:flex-none">
            <p className="text-gray-500 text-sm font-medium mb-1">إجمالي المطاعم</p>
            <p className="text-3xl font-bold text-gray-900">{restaurants.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 min-w-[160px] shadow-sm flex-1 md:flex-none">
            <p className="text-green-600 text-sm font-medium mb-1">النشطة</p>
            <p className="text-3xl font-bold text-gray-900">
              {restaurants.filter(r => r.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 min-w-[160px] shadow-sm flex-1 md:flex-none">
            <p className="text-red-600 text-sm font-medium mb-1">المتوقفة</p>
            <p className="text-3xl font-bold text-gray-900">
              {restaurants.filter(r => r.status !== 'active').length}
            </p>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <div key={restaurant._id} className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col justify-between h-full">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                        {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-500" dir="ltr">@{restaurant.shortCode}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-emerald-100 text-emerald-700">
                    👁️ إجمالي الزيارات: {restaurant.totalViews || 0}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-blue-100 text-blue-700">
                    عدد المسحات 📊 {restaurant.scanCount || 0}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    restaurant.status === 'active'
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {restaurant.status === 'active' ? 'نشط' : 'متوقف'}
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => handleManageClick(restaurant.shortCode)}
                  className="flex-1 bg-black text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <Settings size={18} />
                  إدارة المطعم
                </button>
                
                <button 
                  onClick={() => handleToggleStatus(restaurant._id)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    restaurant.status === 'active'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                  title={restaurant.status === 'active' ? "إيقاف الاشتراك" : "تفعيل الاشتراك"}
                >
                  {restaurant.status === 'active' ? <PowerOff size={20} /> : <Power size={20} />}
                </button>
              </div>
            </div>
          ))}

          {filteredRestaurants.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              لا يوجد مطاعم مطابقة للبحث.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
