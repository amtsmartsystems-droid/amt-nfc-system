"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as LucideIcons from "lucide-react";
import RestaurantTheme  from "../components/templates/RestaurantTheme";
import CafeTheme        from "../components/templates/CafeTheme";
import CafeTheme1       from "../components/templates/CafeTheme1";
import GastroBarTheme   from "../components/templates/GastroBarTheme";
import { getIconForLink } from "../utils/icons";

// ─────────────────────────────────────────────────────────────────────
// DEFAULT DATA
// ─────────────────────────────────────────────────────────────────────
const DEFAULT = {
  name:"MEATY STORY", nameAr:"ميتي ستوري",
  subtitle:"Bold burgers, real flavors", subtitleAr:"برغر جريء، نكهة حقيقية",
  about:"We make food where every detail counts. Top-quality ingredients, precise methods, true flavors — no shortcuts.",
  aboutAr:"نصنع الطعام بعناية فائقة. أجود المكونات، أدق الطرق، نكهات حقيقية — بلا اختصارات.",
  principlesTitle:"PRINCIPLES THAT DEFINE THE TASTE", principlesTitleAr:"مبادئنا في تعريف الطعم",
  principlesSubtitle:"Precision, consistency, and respect for your time.", principlesSubtitleAr:"الدقة والاتساق واحترام وقتك.",
  contactsTitle:"CONTACTS", contactsTitleAr:"تواصل معنا",
  address:"123 Main Street, New York", hours:"10:00 AM — 11:00 PM",
  principles:[
    { num:"I",  title:"HONEST PRESENTATION", titleAr:"تقديم صادق",  desc:"Exactly as served.",      descAr:"كما يُقدَّم تماماً." },
    { num:"II", title:"STREAMLINED PROCESS", titleAr:"عملية مبسّطة",desc:"Clear, minimal waiting.", descAr:"واضحة وانتظار أقل." },
    { num:"III",title:"ON-TIME DELIVERY",    titleAr:"توصيل في وقته",desc:"Always on schedule.",     descAr:"دائماً في موعده." },
  ],
  links:[
    { id:1, title:"View Menu",     titleAr:"عرض القائمة", url:"#" },
    { id:2, title:"Reserve Table", titleAr:"احجز طاولة",  url:"#" },
    { id:3, title:"WhatsApp",      titleAr:"واتساب",       url:"#" },
    { id:4, title:"Instagram",     titleAr:"انستغرام",     url:"#" },
    { id:5, title:"Location",      titleAr:"الموقع",       url:"#" },
  ],
  events:[
    { id:1, title:"أمسية عائلية مميزة",       titleEn:"Special Family Evening",   desc:"عشاء فاخر مع الأهل في أجواء مريحة، قائمة خاصة من أفخر الأطباق", descEn:"A premium family dinner with a specially curated menu." },
    { id:2, title:"جلسة تذوق المشويات",       titleEn:"Grill Tasting Session",    desc:"تجربة فريدة لتذوق أفضل المشويات بإشراف الشيف مباشرة",           descEn:"A unique experience tasting our finest grills with the head chef." },
  ],
};

const DEFAULT_COLORS = {
  restaurant:{ primary:"#EDD98A", background:"#F5EDD6" },
  cafe:      { primary:"#6B4226", background:"#FAFAF7" },
  cafe1:     { primary:"#C9A96E", background:"#2C1503" },
  gastro:    { primary:"#F5C518", background:"#111111" },
};

const THEMES = [
  { id:"restaurant", label:"مطعم فاخر",       icon:"Utensils"        },
  { id:"cafe",       label:"مقهى منيمل",      icon:"Coffee"          },
  { id:"cafe1",      label:"كافيه رايق ☕",    icon:"Bean"            },
  { id:"gastro",     label:"غاسترو بار 🍺",   icon:"UtensilsCrossed" },
];

// ─────────────────────────────────────────────────────────────────────
// Helper small components
// ─────────────────────────────────────────────────────────────────────
const AdminInput = ({ value, onChange, placeholder, type="text", dir }) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} dir={dir}
    className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/8 outline-none focus:border-yellow-400/40 focus:bg-white/8 transition-all placeholder:text-slate-600 font-[Cairo,sans-serif]" />
);

const Label = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{children}</p>
);

// ─────────────────────────────────────────────────────────────────────
// PageContent
// ─────────────────────────────────────────────────────────────────────
function PageContent() {
  const searchParams = useSearchParams();
  const [mounted,    setMounted]    = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password,   setPassword]   = useState("");
  const [siteData,   setSiteData]   = useState(DEFAULT);
  const [theme,      setTheme]      = useState("restaurant");
  const [siteColors, setSiteColors] = useState(DEFAULT_COLORS.restaurant);
  const [lang,       setLang]       = useState("en");
  const [adminTab,   setAdminTab]   = useState("links");
  const [aiText,     setAiText]     = useState("");
  const [aiFile,     setAiFile]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [toast,      setToast]      = useState({ msg:"", ok:true });
  const [editId,     setEditId]     = useState(null);
  const [newLink,    setNewLink]    = useState({ title:"", titleAr:"", url:"" });
  const [editEvId,   setEditEvId]   = useState(null);
  const [newEvent,   setNewEvent]   = useState({ title:"", titleEn:"", desc:"", descEn:"" });
  const [targetCardId, setTargetCardId] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [wifi,       setWifi]       = useState({ ssid: "", password: "" });
  // Subscription gate state
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [allowEditing,       setAllowEditing]       = useState(true);
  const [currentUserRole,    setCurrentUserRole]    = useState(null);
  const isSuspended = subscriptionStatus === 'suspended' || !allowEditing;

  useEffect(() => { 
    setMounted(true);
    // Check auth status + get current user role
    fetch('/api/admin-auth').then(r => r.json()).then(d => {
      if(d.authenticated) setIsAuthenticated(true);
    });
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if(d.authenticated) setCurrentUserRole(d.role);
    }).catch(() => {});
  }, []);
  }, []);


  const showToast = (msg, ok=true) => {
    setToast({msg,ok}); setTimeout(()=>setToast({msg:"",ok:true}), 3500);
  };

  const up = (key, val) => setSiteData(p => ({...p, [key]: val}));

  // Switch theme — also swap color defaults
  const switchTheme = (id) => {
    setTheme(id);
    setSiteColors(DEFAULT_COLORS[id]);
  };

  // ── AI Generate ──
  const handleAI = async () => {
    if (!aiText.trim() && !aiFile) return showToast("⚠️ أدخل نصاً أو ارفع ملفاً", false);
    setLoading(true);
    try {
      let fileBase64=null, fileMimeType=null;
      if (aiFile) {
        fileBase64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(aiFile); });
        fileMimeType = aiFile.type;
      }
      const res  = await fetch("/api/generate", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ promptText: aiText, fileBase64, fileMimeType }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSiteData(prev => ({
        ...prev,
        ...(json.name     && { name:     json.name     }),
        ...(json.nameAr   && { nameAr:   json.nameAr   }),
        ...(json.subtitle && { subtitle: json.subtitle }),
        ...(json.subtitleAr && { subtitleAr: json.subtitleAr }),
        ...(json.about    && { about:    json.about    }),
        ...(json.aboutAr  && { aboutAr:  json.aboutAr  }),
        ...(json.hours    && { hours:    json.hours    }),
        ...(json.address  && { address:  json.address  }),
        ...(json.links && Array.isArray(json.links) && {
          links: json.links.map((l,i) => ({ ...l, id: Date.now()+i }))
        }),
        ...(json.events && Array.isArray(json.events) && {
          events: json.events.map((ev,i) => ({ ...ev, id: Date.now()+1000+i }))
        }),
      }));
      if (json.colors) setSiteColors({ primary: json.colors.primary||siteColors.primary, background: json.colors.background||siteColors.background });
      showToast("✅ تم حقن البيانات بنجاح!");
    } catch(e) {
      showToast(`❌ ${e.message}`, false);
    } finally { setLoading(false); }
  };

  // ── Save & Publish ──
  const handleSavePublish = async () => {
    if (!targetCardId.trim()) return showToast("⚠️ يرجى إدخال رقم البطاقة (Card ID) أولاً", false);
    if (isSuspended && currentUserRole !== 'Super_Admin') {
      return showToast("⚠️ التعديل معلق بسبب الاشتراك.", false);
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/cards/${targetCardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteData,
          themeName: theme,
          primaryColor: siteColors.primary,
          background: siteColors.background,
          wifi: { ssid: wifi.ssid.trim(), password: wifi.password.trim() },
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setPublishedUrl(`${window.location.origin}/${targetCardId}`);
      showToast("✅ تم حفظ ونشر التعديلات بنجاح!");
    } catch (e) {
      showToast(`❌ خطأ: ${e.message}`, false);
    } finally {
      setSaving(false);
    }
  };

  // ── Load Card Data (and check subscription status) ──
  const handleLoadCard = async (id) => {
    const cid = (id || targetCardId).trim();
    if (!cid) return;
    try {
      const res = await fetch(`/api/cards/${cid}`);
      if (!res.ok) return;
      const data = await res.json();
      setSubscriptionStatus(data.subscriptionStatus || 'active');
      setAllowEditing(data.allowEditing !== false);
      if (data.siteData) setSiteData(prev => ({ ...prev, ...data.siteData }));
      if (data.themeName) setTheme(data.themeName);
      if (data.primaryColor || data.background) {
        setSiteColors({
          primary:    data.primaryColor || siteColors.primary,
          background: data.background   || siteColors.background,
        });
      }
      if (data.wifi) setWifi(data.wifi);
    } catch {}
  };

  // ── Links CRUD ──
  const addLink = () => {
    const title = newLink.title.trim() || newLink.titleAr.trim();
    if (!title) return showToast("⚠️ أدخل عنوان الرابط", false);
    setSiteData(p => ({ ...p, links: [...p.links, { id:Date.now(), title: newLink.title.trim()||title, titleAr: newLink.titleAr.trim()||title, url: newLink.url.trim()||"#" }] }));
    setNewLink({ title:"", titleAr:"", url:"" });
    showToast("✅ تمت الإضافة");
  };
  const delLink  = id => { setSiteData(p=>({...p, links:p.links.filter(l=>l.id!==id)})); showToast("🗑️ تم الحذف"); };
  const updLink  = (id,f,v) => setSiteData(p=>({...p, links:p.links.map(l=>l.id===id?{...l,[f]:v}:l)}));
  const moveLink = (idx,dir) => {
    const a=[...siteData.links];
    if(dir==="up"   && idx>0)          [a[idx-1],a[idx]]=[a[idx],a[idx-1]];
    if(dir==="down" && idx<a.length-1) [a[idx+1],a[idx]]=[a[idx],a[idx+1]];
    setSiteData(p=>({...p,links:a}));
  };

  // ── Events CRUD ──
  const addEvent = () => {
    const title = newEvent.title.trim() || newEvent.titleEn.trim();
    if (!title) return showToast("⚠️ أدخل عنوان الفعالية", false);
    setSiteData(p => ({ ...p, events: [...(p.events||[]), { id:Date.now(), title: newEvent.title.trim()||title, titleEn: newEvent.titleEn.trim()||title, desc: newEvent.desc.trim(), descEn: newEvent.descEn.trim() }] }));
    setNewEvent({ title:"", titleEn:"", desc:"", descEn:"" });
    showToast("✅ تمت إضافة الفعالية");
  };
  const delEvent = id => { setSiteData(p=>({...p, events:(p.events||[]).filter(e=>e.id!==id)})); showToast("🗑️ تم حذف الفعالية"); };
  const updEvent = (id,f,v) => setSiteData(p=>({...p, events:(p.events||[]).map(e=>e.id===id?{...e,[f]:v}:e)}));

  // ── Active Theme Renderer ──
  const ThemeView = () => {
    const props = { siteData, siteColors, lang };
    switch (theme) {
      case "cafe":   return <CafeTheme      {...props} />;
      case "cafe1":  return <CafeTheme1     {...props} />;
      case "gastro": return <GastroBarTheme {...props} />;
      default:       return <RestaurantTheme {...props} />;
    }
  };

  if (!mounted) return null;

  if (!isAuthenticated && currentUserRole !== 'Super_Admin' && currentUserRole !== 'Restaurant_Owner') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 font-[Cairo,sans-serif]" dir="rtl">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-yellow-400/10 blur-[50px] -z-10" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500 to-yellow-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
              <LucideIcons.ShieldCheck size={32} className="text-black" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">تسجيل الدخول</h1>
            <p className="text-sm text-slate-400">نظام إدارة المطاعم الذكي</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="كلمة مرور المدير العام..."
                className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-black/40 border border-white/10 outline-none focus:border-yellow-400/50 focus:bg-black/60 transition-all placeholder:text-slate-600 text-center font-mono tracking-widest shadow-inner"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13px] bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              دخول للوحة التحكم <LucideIcons.ArrowLeft size={16} />
            </button>
          </form>
        </div>
        
        <p className="text-slate-600 text-[11px] mt-8 flex items-center gap-1.5 font-medium">
          <LucideIcons.Lock size={12} /> محمي بتشفير متقدم (JWT + AES)
        </p>
      </div>
    );
  }

  // ── ADMIN PANEL ──
  const THEME_COMPONENTS = { restaurant: RestaurantTheme, cafe: CafeTheme, cafe1: CafeTheme1, gastro: GastroBarTheme };
  const PreviewTheme = THEME_COMPONENTS[theme];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    setLoading(false);
    if (res.ok) {
      setIsAuthenticated(true);
      showToast("✅ تم تسجيل الدخول");
    } else {
      showToast("❌ كلمة المرور غير صحيحة", false);
    }
  };

  // ── Admin split-screen layout ──
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#07090E]" dir="rtl">

        {/* ════════════════════════════════════════════
            LEFT: LIVE PREVIEW (phone mockup)
        ════════════════════════════════════════════ */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#070A10] border-l border-white/5 overflow-hidden">
          <div className="relative">
            {/* Phone frame */}
            <div className="relative rounded-[40px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)] border-[6px] border-slate-700 bg-white"
                 style={{ width:360, height:700 }}>
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-full z-50" />
              {/* Scrollable content */}
              <div className="w-full h-full overflow-y-auto overflow-x-hidden pt-8" style={{ scrollbarWidth:"none" }}>
                <ThemeView />
              </div>
            </div>
            {/* Live badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              معاينة مباشرة
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RIGHT: ADMIN DASHBOARD
        ════════════════════════════════════════════ */}
        <div className="w-[400px] flex flex-col h-full text-white overflow-hidden border-r border-white/5" style={{ background:"#07090E" }}>

          {/* Header */}
          <div className="flex-shrink-0 px-5 pt-6 pb-4 border-b border-white/5">

            {/* ════ SUSPENSION BANNER ════ */}
            {isSuspended && (
              <div className="mb-4 flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.40)' }}>
                <span className="text-red-400 text-xl flex-shrink-0">&#x26A0;&#xFE0F;</span>
                <div>
                  <p className="text-[12px] font-black text-red-400 mb-0.5">صلاحية التعديل معلقة</p>
                  <p className="text-[11px] text-red-400/75 leading-relaxed">
                    لانتهاء الاشتراك. يرجى التواصل مع الإدارة لتفعيل الحساب.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-[16px] font-black flex items-center gap-2">
                  <LucideIcons.Cpu size={16} style={{ color:"var(--primary-color, #EDD98A)" }} />
                  لوحة المدير الرقمي
                </h1>
                <p className="text-[10px] text-slate-600 mt-0.5">SaaS Link-in-Bio · Static Themes</p>
              </div>
              <button onClick={()=>setLang(l=>l==="en"?"ar":"en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black border border-yellow-500/30 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all">
                <LucideIcons.Languages size={13} />
                {lang==="en"?"عربي":"English"}
              </button>
            </div>

            {/* Save Section */}
            <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <LucideIcons.CreditCard size={14} className="text-yellow-400" />
                <Label>رقم البطاقة (Card ID)</Label>
              </div>
              <div className="flex gap-2">
                <AdminInput
                  value={targetCardId}
                  onChange={v => { setTargetCardId(v); }}
                  placeholder="مثال: c123"
                  dir="ltr"
                />
                <button
                  onClick={() => handleLoadCard()}
                  title="تحميل بيانات البطاقة"
                  className="flex-shrink-0 px-3 rounded-xl text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 hover:bg-yellow-400/20 transition-all text-[11px] font-bold"
                >
                  تحميل
                </button>
              </div>
              <button
                onClick={handleSavePublish}
                disabled={saving || (isSuspended && currentUserRole !== 'Super_Admin')}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[12px] transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: isSuspended && currentUserRole !== 'Super_Admin' ? '#4b5563' : '#10b981', color: '#fff' }}
              >
                {saving ? <LucideIcons.Loader2 size={14} className="animate-spin" /> : <LucideIcons.Send size={14} />}
                {isSuspended && currentUserRole !== 'Super_Admin' ? 'التعديل معلق ⛔' : 'حفظ ونشر التعديلات (Publish)'}
              </button>


              {publishedUrl && (
                <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                  <p className="text-[11px] text-emerald-400 font-bold mb-2 flex items-center gap-1.5"><LucideIcons.CheckCircle2 size={14}/> الرابط المباشر للبطاقة:</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={publishedUrl} className="w-full text-[11px] bg-black/40 text-slate-300 px-2 py-2 rounded-lg border border-white/5 outline-none font-mono" dir="ltr" />
                    <button onClick={()=>{navigator.clipboard.writeText(publishedUrl); showToast("✅ تم نسخ الرابط بنجاح");}} className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-all shadow-lg shrink-0" title="نسخ الرابط">
                      <LucideIcons.Copy size={14} />
                    </button>
                    <a href={publishedUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all shrink-0" title="فتح الرابط">
                      <LucideIcons.ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(th => {
                const Ic = LucideIcons[th.icon]||LucideIcons.Layout;
                const active = theme === th.id;
                return (
                  <button key={th.id} onClick={()=>switchTheme(th.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${active?"border-yellow-400/50 bg-yellow-400/10 text-yellow-400":"border-white/8 bg-white/3 text-slate-500 hover:text-slate-300 hover:border-white/15"}`}>
                    <Ic size={14} /> {th.label}
                    {active && <span className="text-[9px] text-yellow-400/70">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Nav */}
          <div className="flex-shrink-0 flex gap-1 px-4 py-3 border-b border-white/5">
            {[
              { id:"links",  label:"روابط",   icon:"Link2"        },
              { id:"events", label:"فعاليات", icon:"CalendarDays" },
              { id:"ai",     label:"AI",       icon:"Sparkles"    },
              { id:"design", label:"تصميم",   icon:"Palette"      },
            ].map(tb => {
              const Ic = LucideIcons[tb.icon]||LucideIcons.Circle;
              const active = adminTab===tb.id;
              return (
                <button key={tb.id} onClick={()=>setAdminTab(tb.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all ${active?"bg-yellow-400/15 text-yellow-400 border border-yellow-400/25":"text-slate-500 hover:text-slate-300 border border-transparent"}`}>
                  <Ic size={12} />{tb.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Tab Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ scrollbarWidth:"thin", scrollbarColor:"rgba(255,255,255,.1) transparent" }}>

            {/* ═══ TAB: LINKS MANAGER ═══ */}
            {adminTab==="links" && (
              <>
                {/* Link List */}
                <div className="space-y-2">
                  {siteData.links.length===0 && (
                    <div className="text-center py-10 text-slate-600 text-[13px]">
                      <LucideIcons.Link2 size={26} className="mx-auto mb-2 opacity-20" />
                      لا توجد روابط — أضف رابطاً أدناه
                    </div>
                  )}
                  {siteData.links.map((lk,idx) => {
                    const { IconComponent:Ic, color, bg } = getIconForLink(lk.title||lk.titleAr||"");
                    const editing = editId===lk.id;
                    return (
                      <div key={lk.id} className="rounded-2xl overflow-hidden" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                        {/* Row */}
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background:bg }}>
                            <Ic size={16} color={color} />
                          </div>
                          <button onClick={()=>setEditId(editing?null:lk.id)} className="flex-1 text-right min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-bold text-slate-100 truncate">{lk.title||lk.titleAr}</p>
                              <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white/70">
                                🔥 {lk.clicks || 0}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 truncate">{lk.url||"بدون رابط"}</p>
                          </button>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={()=>setEditId(editing?null:lk.id)} className={`p-1.5 rounded-lg transition-all ${editing?"text-yellow-400 bg-yellow-400/10":"text-slate-500 hover:text-white hover:bg-white/8"}`}><LucideIcons.PenLine size={12} /></button>
                            <button onClick={()=>moveLink(idx,"up")} disabled={idx===0} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 disabled:opacity-20 transition-all"><LucideIcons.ArrowUp size={12} /></button>
                            <button onClick={()=>moveLink(idx,"down")} disabled={idx===siteData.links.length-1} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 disabled:opacity-20 transition-all"><LucideIcons.ArrowDown size={12} /></button>
                            <button onClick={()=>delLink(lk.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"><LucideIcons.Trash2 size={12} /></button>
                          </div>
                        </div>
                        {/* Edit panel */}
                        {editing && (
                          <div className="px-4 pb-4 pt-1 space-y-2 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-2">
                              <div><Label>إنجليزي</Label><AdminInput value={lk.title} onChange={v=>updLink(lk.id,"title",v)} placeholder="View Menu" dir="ltr" /></div>
                              <div><Label>عربي</Label><AdminInput value={lk.titleAr||""} onChange={v=>updLink(lk.id,"titleAr",v)} placeholder="عرض القائمة" dir="rtl" /></div>
                            </div>
                            <div><Label>الرابط</Label><AdminInput value={lk.url} onChange={v=>updLink(lk.id,"url",v)} placeholder="https://..." type="url" dir="ltr" /></div>
                            <div className="flex items-center gap-2 pt-1">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:bg }}><Ic size={14} color={color} /></div>
                              <p className="text-[9.5px] text-slate-600">الأيقونة تتغير تلقائياً بناءً على الاسم ✨</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add New Link */}
                <div className="rounded-2xl p-4 space-y-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(255,255,255,0.10)" }}>
                  <Label>➕ إضافة رابط جديد</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>إنجليزي</Label><AdminInput value={newLink.title} onChange={v=>setNewLink(p=>({...p,title:v}))} placeholder="Instagram" dir="ltr" /></div>
                    <div><Label>عربي</Label><AdminInput value={newLink.titleAr} onChange={v=>setNewLink(p=>({...p,titleAr:v}))} placeholder="انستغرام" dir="rtl" /></div>
                  </div>
                  <div><Label>الرابط</Label><AdminInput value={newLink.url} onChange={v=>setNewLink(p=>({...p,url:v}))} placeholder="https://..." type="url" dir="ltr" /></div>
                  {/* Live icon preview */}
                  {(newLink.title||newLink.titleAr) && (()=>{
                    const { IconComponent:Ic, color:c, bg:b } = getIconForLink(newLink.title||newLink.titleAr);
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:b }}><Ic size={14} color={c} /></div>
                        <p className="text-[10px] text-slate-500">الأيقونة المكتشفة تلقائياً</p>
                      </div>
                    );
                  })()}
                  <button onClick={addLink} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[13px] text-[#1C1C1C] hover:brightness-110 active:scale-95 transition-all" style={{ background:"var(--primary-color,#EDD98A)" }}>
                    <LucideIcons.Plus size={15} /> إضافة الرابط
                  </button>
                </div>
              </>
            )}

            {/* ═══ TAB: EVENTS MANAGER ═══ */}
            {adminTab==="events" && (
              <>
                {/* Events list */}
                <div className="space-y-3">
                  {(!siteData.events || siteData.events.length === 0) && (
                    <div className="text-center py-8 text-slate-600 text-[13px]">
                      <LucideIcons.CalendarDays size={26} className="mx-auto mb-2 opacity-20" />
                      لا توجد فعاليات — أضف فعالية أدناه
                    </div>
                  )}
                  {(siteData.events||[]).map((ev) => {
                    const isEditing = editEvId === ev.id;
                    return (
                      <div key={ev.id} className="rounded-2xl overflow-hidden"
                           style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                        {/* Row header */}
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                               style={{ background:"rgba(245,197,24,0.15)" }}>
                            <LucideIcons.CalendarDays size={16} style={{ color:"#F5C518" }} />
                          </div>
                          <button onClick={()=>setEditEvId(isEditing?null:ev.id)} className="flex-1 text-right min-w-0">
                            <p className="text-[13px] font-bold text-slate-100 truncate">{ev.title || ev.titleEn}</p>
                            <p className="text-[10px] text-slate-600 truncate">{(ev.desc||ev.descEn||"").substring(0,45)}…</p>
                          </button>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={()=>setEditEvId(isEditing?null:ev.id)}
                              className={`p-1.5 rounded-lg transition-all ${isEditing?"text-yellow-400 bg-yellow-400/10":"text-slate-500 hover:text-white hover:bg-white/8"}`}>
                              <LucideIcons.PenLine size={12} />
                            </button>
                            <button onClick={()=>delEvent(ev.id)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                              <LucideIcons.Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        {/* Edit panel */}
                        {isEditing && (
                          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>العنوان (AR)</Label>
                                <AdminInput value={ev.title||""} onChange={v=>updEvent(ev.id,"title",v)} placeholder="أمسية عائلية" dir="rtl" />
                              </div>
                              <div>
                                <Label>العنوان (EN)</Label>
                                <AdminInput value={ev.titleEn||""} onChange={v=>updEvent(ev.id,"titleEn",v)} placeholder="Family Night" dir="ltr" />
                              </div>
                            </div>
                            <div>
                              <Label>الوصف (AR)</Label>
                              <textarea value={ev.desc||""} onChange={e=>updEvent(ev.id,"desc",e.target.value)}
                                placeholder="وصف الفعالية بالعربي..." rows={3} dir="rtl"
                                className="w-full px-3 py-2.5 rounded-xl text-[12px] text-white bg-white/5 border border-white/8 outline-none focus:border-yellow-400/40 transition-all resize-none placeholder:text-slate-600" />
                            </div>
                            <div>
                              <Label>الوصف (EN)</Label>
                              <textarea value={ev.descEn||""} onChange={e=>updEvent(ev.id,"descEn",e.target.value)}
                                placeholder="Event description in English..." rows={3} dir="ltr"
                                className="w-full px-3 py-2.5 rounded-xl text-[12px] text-white bg-white/5 border border-white/8 outline-none focus:border-yellow-400/40 transition-all resize-none placeholder:text-slate-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add new event */}
                <div className="rounded-2xl p-4 space-y-3"
                     style={{ background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(255,255,255,0.10)" }}>
                  <Label>➕ إضافة فعالية جديدة</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>العنوان (AR)</Label><AdminInput value={newEvent.title} onChange={v=>setNewEvent(p=>({...p,title:v}))} placeholder="أمسية عائلية" dir="rtl" /></div>
                    <div><Label>العنوان (EN)</Label><AdminInput value={newEvent.titleEn} onChange={v=>setNewEvent(p=>({...p,titleEn:v}))} placeholder="Family Night" dir="ltr" /></div>
                  </div>
                  <div>
                    <Label>الوصف (AR)</Label>
                    <textarea value={newEvent.desc} onChange={e=>setNewEvent(p=>({...p,desc:e.target.value}))}
                      placeholder="وصف الفعالية بالعربي..." rows={2} dir="rtl"
                      className="w-full px-3 py-2.5 rounded-xl text-[12px] text-white bg-white/5 border border-white/8 outline-none focus:border-yellow-400/40 transition-all resize-none placeholder:text-slate-600" />
                  </div>
                  <div>
                    <Label>الوصف (EN)</Label>
                    <textarea value={newEvent.descEn} onChange={e=>setNewEvent(p=>({...p,descEn:e.target.value}))}
                      placeholder="Event description..." rows={2} dir="ltr"
                      className="w-full px-3 py-2.5 rounded-xl text-[12px] text-white bg-white/5 border border-white/8 outline-none focus:border-yellow-400/40 transition-all resize-none placeholder:text-slate-600" />
                  </div>
                  <button onClick={addEvent}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[13px] text-[#1C1C1C] hover:brightness-110 active:scale-95 transition-all"
                    style={{ background:"#F5C518", boxShadow:"0 4px 20px rgba(245,197,24,.3)" }}>
                    <LucideIcons.Plus size={15} /> إضافة الفعالية
                  </button>
                </div>
              </>
            )}

            {/* ═══ TAB: AI ═══ */}

            {adminTab==="ai" && (
              <>
                <div>
                  <Label>اكتب معلومات مطعمك أو الصق نص المنيو</Label>
                  <textarea
                    value={aiText}
                    onChange={e=>setAiText(e.target.value)}
                    placeholder={"مثال:\nاسم المطعم: ميتي ستوري\nبرغر فاخر في قلب المدينة\nالتواصل عبر واتساب: 0501234567\nانستغرام: @meatystory\nساعات العمل: 10 ص – 12 م"}
                    rows={7}
                    dir="rtl"
                    className="w-full px-4 py-3 rounded-2xl text-[13px] text-white bg-white/5 border border-white/8 outline-none focus:border-yellow-400/40 transition-all resize-none placeholder:text-slate-600 leading-relaxed"
                  />
                </div>

                <div>
                  <Label>أو ارفع صورة المنيو / PDF</Label>
                  <label className="flex flex-col items-center gap-2 p-5 rounded-2xl cursor-pointer transition-all"
                    style={{ border:`2px dashed ${aiFile?"rgba(237,217,138,.5)":"rgba(255,255,255,.10)"}`, background:aiFile?"rgba(237,217,138,.07)":"rgba(255,255,255,.02)" }}>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={e=>setAiFile(e.target.files[0]||null)} />
                    {aiFile ? (
                      <>
                        <LucideIcons.FileCheck2 size={26} style={{ color:"#EDD98A" }} />
                        <p className="text-sm font-bold text-yellow-400">{aiFile.name}</p>
                        <button onClick={e=>{e.preventDefault();setAiFile(null);}} className="text-[11px] text-slate-600 hover:text-red-400">× حذف</button>
                      </>
                    ) : (
                      <>
                        <LucideIcons.UploadCloud size={26} className="text-slate-500" />
                        <p className="text-[12px] text-slate-400">JPG، PNG، PDF</p>
                      </>
                    )}
                  </label>
                </div>

                <button onClick={handleAI} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[14px] text-[#1C1C1C] transition-all disabled:opacity-50 hover:brightness-110 active:scale-95"
                  style={{ background:"#EDD98A", boxShadow:"0 4px 22px rgba(237,217,138,.35)" }}>
                  {loading ? <><LucideIcons.Loader2 size={18} className="animate-spin" /> يحلل...</> : <><LucideIcons.Sparkles size={18} /> تحليل وحقن البيانات</>}
                </button>
                <p className="text-[11px] text-center text-slate-700">الذكاء الاصطناعي يستخرج البيانات فقط — التصميم ثابت دائماً</p>
              </>
            )}

            {/* ═══ TAB: DESIGN ═══ */}
            {adminTab==="design" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>الاسم (EN)</Label><AdminInput value={siteData.name} onChange={v=>up("name",v)} placeholder="MEATY STORY" /></div>
                  <div><Label>الاسم (AR)</Label><AdminInput value={siteData.nameAr||""} onChange={v=>up("nameAr",v)} placeholder="ميتي ستوري" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>الشعار (EN)</Label><AdminInput value={siteData.subtitle||""} onChange={v=>up("subtitle",v)} placeholder="..." /></div>
                  <div><Label>الشعار (AR)</Label><AdminInput value={siteData.subtitleAr||""} onChange={v=>up("subtitleAr",v)} placeholder="..." /></div>
                </div>
                <div><Label>ساعات العمل</Label><AdminInput value={siteData.hours||""} onChange={v=>up("hours",v)} placeholder="10AM–11PM" /></div>
                <div><Label>العنوان</Label><AdminInput value={siteData.address||""} onChange={v=>up("address",v)} placeholder="Main St..." /></div>

                {/* Wi-Fi Section */}
                <div className="rounded-2xl p-4 space-y-3" style={{ background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.20)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <LucideIcons.Wifi size={14} className="text-emerald-400" />
                    <Label>إعدادات الواي فاي (Wi-Fi)</Label>
                  </div>
                  <div>
                    <Label>اسم الشبكة (SSID)</Label>
                    <AdminInput value={wifi.ssid} onChange={v=>setWifi(p=>({...p,ssid:v}))} placeholder="مثال: Restaurant_Free" dir="ltr" />
                  </div>
                  <div>
                    <Label>كلمة المرور (Password)</Label>
                    <AdminInput value={wifi.password} onChange={v=>setWifi(p=>({...p,password:v}))} placeholder="مثال: 12345678" dir="ltr" />
                  </div>
                  <p className="text-[10px] text-emerald-600/80">📶 ستظهر زر "الواي فاي" تلقائياً في صفحة الزبون عند حفظ هذه البيانات</p>
                </div>

                <div>
                  <Label>ألوان القالب</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[["اللون الأساسي","primary"],["الخلفية","background"]].map(([lbl,key])=>(
                      <div key={key} className="flex items-center gap-3 p-3 rounded-xl" style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)" }}>
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <input type="color" value={siteColors[key]} onChange={e=>setSiteColors(p=>({...p,[key]:e.target.value}))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="w-10 h-10 rounded-lg border-2 pointer-events-none" style={{ background:siteColors[key], borderColor:"rgba(255,255,255,.15)" }} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">{lbl}</p>
                          <p className="text-[11px] font-mono text-slate-400">{siteColors[key]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>{/* end scroll area */}
        </div>{/* end right panel */}
      </div>
    );
  }

  // ── VISITOR VIEW ──
  return (
    <div className="min-h-screen" style={{ background:"#F5F5F5" }}>
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl">
        <ThemeView />
      </div>
      {/* Toast */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl transition-all duration-300 pointer-events-none ${toast.msg?"opacity-100 translate-y-0":"opacity-0 -translate-y-3"}`}
           style={{ background:toast.ok?"#1C1C1C":"#EF4444", color:"#fff", direction:"rtl" }}>
        {toast.msg}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><LucideIcons.Loader2 size={24} className="animate-spin text-slate-700" /></div>}>
      <PageContent />
    </Suspense>
  );
}
