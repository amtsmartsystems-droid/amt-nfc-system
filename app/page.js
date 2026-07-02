"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import * as LucideIcons from "lucide-react";
import { upload } from '@vercel/blob/client';
import RestaurantTheme  from "../components/templates/RestaurantTheme";
import CafeTheme        from "../components/templates/CafeTheme";
import CafeTheme1       from "../components/templates/CafeTheme1";
import GastroBarTheme   from "../components/templates/GastroBarTheme";
import MaroufCoffeeTheme from "../components/templates/MaroufCoffeeTheme";
import RusticCafeTheme  from "../components/templates/RusticCafeTheme";
import AMTBusinessCard  from "../components/templates/AMTBusinessCard";
import QRCodeGenerator  from "../components/QRCodeGenerator";
import { getIconForLink } from "../utils/icons";

// ─────────────────────────────────────────────────────────────────────
// DEFAULT DATA
// ─────────────────────────────────────────────────────────────────────
const DEFAULT = {
  name:"MEATY STORY", nameAr:"ميتي ستوري",
  subtitle:"Bold burgers, real flavors", subtitleAr:"برغر جريء، نكهة حقيقية",
  about:"We make food where every detail counts. Top-quality ingredients, precise methods, true flavors — no shortcuts.",
  aboutAr:"نصنع الطعام بعناية فائقة. أجود المكونات، أدق الطرق، نكهات حقيقية — بلا اختصارات.",
  principlesTitle:"PRINCIPLES THAT DEFINED THE TASTE", principlesTitleAr:"مبادئنا في تعريف الطعم",
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
  gastro:    { primary:"#EDD98A", background:"#0A0A0A" },
  marouf_coffee: { primary:"#B99146", background:"#050505" },
  rustic_cafe: { primary:"#3B9FB1", background:"#F3E9DD" },
};

const THEMES = [
  { id:"restaurant",    label:"مطعم فاخر",        icon:"Utensils"        },
  { id:"cafe",          label:"مقهى منيمل",       icon:"Coffee"          },
  { id:"cafe1",         label:"مقهى حديث",     icon:"Bean"            },
  { id:"gastro",        label:"مطعم فاخر",   icon:"UtensilsCrossed" },
  { id:"marouf_coffee", label:"بن معروف ✓",   icon:"Coffee" },
  { id:"rustic_cafe",   label:"عشق البوهيمي",  icon:"Tent" },
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
  const [cardType,   setCardType]   = useState("restaurant");   // ← NEW: tracks cardType for DB
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
  const [telegramConfig, setTelegramConfig] = useState({ botToken: "", chatId: "", isEnabled: false });
  const [nfcTableNum, setNfcTableNum] = useState("");
  const [nfcDestUrl, setNfcDestUrl]   = useState("");
  const [cardMappings, setCardMappings] = useState([]);
  const [savingMapping, setSavingMapping] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [isMenuEnabled, setIsMenuEnabled] = useState(false);
  const [isHouseSystemActive, setIsHouseSystemActive] = useState(false);
  const [isTakeawayEnabled, setIsTakeawayEnabled] = useState(true);
  const [showMenuImages, setShowMenuImages] = useState(true);
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuMode, setMenuMode] = useState('interactive');
  const [pdfMenuUrl, setPdfMenuUrl] = useState('');
  const [offersUrl, setOffersUrl] = useState(''); // NEW: عروضنا URL
  const [uploadingIcon, setUploadingIcon] = useState(null);
  const [cliqConfig, setCliqConfig] = useState({ isEnabled: false, alias: '', message: 'لإتمام طلبك، يرجى تحويل المجموع عبر كليك' });
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

    // Auto-load card if ?id=xyz is present
    const idParam = searchParams.get('id');
    if (idParam) {
      setTargetCardId(idParam);
      // Wait a tick for state to settle then fetch
      setTimeout(() => {
        handleLoadCard(idParam);
      }, 500);
    }
  }, [searchParams]);

  const showToast = (msg, ok=true) => {
    setToast({msg,ok}); setTimeout(()=>setToast({msg:"",ok:true}), 3500);
  };

  const up = (key, val) => setSiteData(p => ({...p, [key]: val}));

  // Switch theme — also swap color defaults
  const switchTheme = (id) => {
    setTheme(id);
    if (DEFAULT_COLORS[id]) setSiteColors(DEFAULT_COLORS[id]);
  };

  // ── AI Generate ──
  const handleAI = async () => {
    if (!aiText.trim() && !aiFile) return showToast("⚠️ أدخل نصاً أو ارفع ملفاً", false);
    
    if (aiFile && aiFile.size > 3.5 * 1024 * 1024) {
      showToast("⚠️ عذراً، حجم الملف كبير جداً! يرجى رفع ملف بحجم أقل من 3.5 ميجابايت.", false);
      return;
    }
    
    setLoading(true);
    try {
      let fileBase64=null, fileMimeType=null;
      if (aiFile) {
        fileBase64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(aiFile); });
        fileMimeType = aiFile.type;
      }
      const res  = await fetch("/api/generate", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ promptText: aiText, fileBase64, fileMimeType }) });
      
      if (res.status === 413) {
        throw new Error("حجم الملف كبير جداً للسيرفر. يرجى تصغير حجم الملف والمحاولة مرة أخرى.");
      }
      
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        throw new Error("حدث خطأ غير متوقع أثناء معالجة الملف.");
      }
      
      if (!res.ok) throw new Error(json.error || "خطأ في السيرفر");

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

  // ── AI Generate Menu ──
  const handleGenerateMenu = async (file) => {
    if (!file) return;
    
    // Check file size (max ~3.5MB to stay under Vercel's 4.5MB limit after Base64 encoding)
    if (file.size > 3.5 * 1024 * 1024) {
      showToast("⚠️ عذراً، حجم الملف كبير جداً! يرجى رفع ملف بحجم أقل من 3.5 ميجابايت.", false);
      return;
    }
    
    setLoading(true);
    try {
      const fileBase64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
      const fileMimeType = file.type;
      
      const res  = await fetch("/api/generate-menu", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ fileBase64, fileMimeType }) });
      
      if (res.status === 413) {
        throw new Error("حجم الملف كبير جداً للسيرفر. يرجى تصغير حجم الملف والمحاولة مرة أخرى.");
      }
      
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (err) {
        throw new Error("حدث خطأ غير متوقع أثناء معالجة الملف.");
      }
      
      if (!res.ok) throw new Error(json.error || "خطأ في السيرفر");

      if (json.menuCategories && Array.isArray(json.menuCategories)) {
          const cats = json.menuCategories.map((c, i) => ({
              ...c,
              id: Date.now().toString() + i,
              items: (c.items || []).map((it, j) => ({
                  ...it,
                  id: Date.now().toString() + i + j
              }))
          }));
          setMenuCategories(cats);
          showToast("✅ تم استخراج المنيو بنجاح!");
      }
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
          cardType,
          themeName: theme === 'business_card' ? 'business_card' : theme,
          primaryColor: siteColors.primary,
          background: siteColors.background,
          wifi: { ssid: wifi.ssid.trim(), password: wifi.password.trim() },
          telegramConfig,
          isMenuEnabled,
          isHouseSystemActive,
          isTakeawayEnabled,
          menuMode,
          pdfMenuUrl,
          offersUrl,
          menuCategories,
          cliqConfig,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      const baseUrl = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : 'https://amt-nfc-system.vercel.app';
      setPublishedUrl(`${baseUrl}/${targetCardId}`);
      showToast("✅ تم حفظ ونشر التعديلات بنجاح!");
    } catch (e) {
      showToast(`❌ خطأ: ${e.message}`, false);
    } finally {
      setSaving(false);
    }
  };

  // ══ Save Card Mapping (per-physical-card destination URL) ══
  const handleSaveCardMapping = async () => {
    if (!targetCardId.trim()) return showToast("⚠️ يرجى تحديد رقم البطاقة أولاً", false);
    if (!nfcTableNum)        return showToast("⚠️ أدخل رقم البطاقة المادية", false);
    if (!nfcDestUrl.trim())  return showToast("⚠️ أدخل رابط الوجهة (WhatsApp أو غيره)", false);

    setSavingMapping(true);
    try {
      const res = await fetch(`/api/cards/${targetCardId}/mappings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber:     parseInt(nfcTableNum),
          destinationUrl: nfcDestUrl.trim(),
          label:          `بطاقة رقم ${nfcTableNum}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ');
      showToast(data.message || `✅ تم حفظ البطاقة رقم ${nfcTableNum}`);
      setCardMappings(data.cardMappings || []);
    } catch (e) {
      showToast(`❌ ${e.message}`, false);
    } finally {
      setSavingMapping(false);
    }
  };

  const handleDeleteCardMapping = async (cardNumber) => {
    if (!targetCardId.trim()) return;
    try {
      const res = await fetch(`/api/cards/${targetCardId}/mappings?cardNumber=${cardNumber}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحذف');
      showToast(data.message);
      setCardMappings(prev => prev.filter(m => m.cardNumber !== cardNumber));
    } catch (e) {
      showToast(`❌ ${e.message}`, false);
    }
  };

  // ── Load Card Data (and check subscription status) ──
  const normalizeTheme = (name) => {
    if (!name) return 'restaurant';
    const n = name.toLowerCase();
    if (n === 'cafe' || n === 'cafetheme')         return 'cafe';
    if (n === 'cafe1' || n === 'cafetheme1')       return 'cafe1';
    if (n === 'gastro' || n === 'gastrobartheme')  return 'gastro';
    if (n === 'marouf_coffee')                     return 'marouf_coffee';
    if (n === 'rustic_cafe')                       return 'rustic_cafe';
    if (n === 'business_card')                     return 'business_card';
    return 'restaurant'; // covers 'restauranttheme', 'luxury', etc.
  };

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
      // ── Restore cardType + theme (normalize old DB values) ──
      if (data.cardType) {
        setCardType(data.cardType);
        if (data.cardType === 'business_card') {
          setTheme('business_card');
        } else {
          setTheme(normalizeTheme(data.themeName));
        }
      } else {
        setTheme(normalizeTheme(data.themeName));
      }
      if (data.primaryColor || data.background) {
        setSiteColors({
          primary:    data.primaryColor || siteColors.primary,
          background: data.background   || siteColors.background,
        });
      }
      if (data.wifi) setWifi(data.wifi);
      else setWifi({ ssid: '', password: '' });

      if (data.telegramConfig) setTelegramConfig(data.telegramConfig);
      else setTelegramConfig({ botToken: '', chatId: '', isEnabled: false, dashboardMessageId: '' });

      if (data.isMenuEnabled !== undefined) setIsMenuEnabled(data.isMenuEnabled);
      if (data.isHouseSystemActive !== undefined) setIsHouseSystemActive(data.isHouseSystemActive);
      if (data.isTakeawayEnabled !== undefined) setIsTakeawayEnabled(data.isTakeawayEnabled);
      if (data.showMenuImages !== undefined) setShowMenuImages(data.showMenuImages !== false);
      if (data.menuMode) setMenuMode(data.menuMode);
      if (data.pdfMenuUrl) setPdfMenuUrl(data.pdfMenuUrl);
      if (data.offersUrl) setOffersUrl(data.offersUrl);
      if (data.menuCategories) setMenuCategories(data.menuCategories);
      if (data.cliqConfig) setCliqConfig(data.cliqConfig);
      else setCliqConfig({ isEnabled: false, alias: '', message: 'لإتمام طلبك، يرجى تحويل المجموع عبر كليك' });

      // ── Load card mappings ──
      if (data.cardMappings) setCardMappings(data.cardMappings);
      else setCardMappings([]);

      showToast(`✅ تم تحميل بيانات البطاقة: ${cid}`);
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

  // ── File Upload (Direct Server Upload — no Vercel Blob token needed) ──
  const handlePdfUpload = async (file, linkId) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showToast("❌ حجم الملف كبير جداً! الحد الأقصى 50 ميجابايت.", false);
      return;
    }

    setUploadingPdf(linkId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'فشل الرفع');

      if (linkId === 'menu') {
        setPdfMenuUrl(data.url);
      } else {
        setSiteData(p => ({
          ...p,
          links: p.links.map(l => l.id === linkId ? { ...l, url: data.url } : l)
        }));
      }
      showToast("✅ تم رفع الملف بنجاح! (لا تنسَ الضغط على حفظ ونشر)");
    } catch (e) {
      showToast(`❌ خطأ في الرفع: ${e.message}`, false);
    } finally {
      setUploadingPdf(null);
    }
  };

  const handleIconUpload = async (file, linkId) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("❌ حجم الصورة كبير جداً! الحد الأقصى 5 ميجابايت.", false);
      return;
    }

    setUploadingIcon(linkId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'فشل الرفع');

      setSiteData(p => ({
        ...p,
        links: p.links.map(l => l.id === linkId ? { ...l, iconUrl: data.url } : l)
      }));
      showToast("✅ تم رفع الأيقونة بنجاح!");
    } catch (e) {
      showToast(`❌ خطأ في رفع الأيقونة: ${e.message}`, false);
    } finally {
      setUploadingIcon(null);
    }
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

  // ── Image Upload (Client-Side Compression) ──
  const handleImageUpload = (slot, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        // Clear canvas to preserve transparency (prevents black background on PNG/WebP)
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Use PNG for images with transparency, WebP otherwise
        const isPng = file.type === 'image/png';
        const dataUrl = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/webp', 0.92);
        setSiteData(p => ({
          ...p,
          images: { ...(p.images || {}), [slot]: dataUrl }
        }));
        showToast(`✅ تم رفع وتخصيص الصورة`);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const renderTheme = () => {
    const props = { 
      siteData, 
      siteColors, 
      lang, 
      isMenuEnabled, 
      isHouseSystemActive,
      menuMode, 
      pdfMenuUrl,
      offersUrl,
      menuCategories, 
      showMenuImages,
      isPreview: true,
      onUpdateLayoutBlocks: (newBlocks) => setSiteData(p => ({ ...p, layoutBlocks: newBlocks }))
    };
    if (theme === 'business_card') return <AMTBusinessCard {...props} />;
    switch (theme) {
      case "cafe":   return <CafeTheme      {...props} />;
      case "cafe1":  return <CafeTheme1     {...props} />;
      case "gastro": return <GastroBarTheme {...props} />;
      case "marouf_coffee": return <MaroufCoffeeTheme {...props} />;
      case "rustic_cafe": return <RusticCafeTheme {...props} />;
      default:       return <RestaurantTheme {...props} />;
    }
  };

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
      const data = await res.json().catch(() => ({}));
      showToast(`❌ ${data.error || "كلمة المرور غير صحيحة"}`, false);
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
              <div className="w-full h-full overflow-y-auto overflow-x-hidden pt-8 relative" style={{ scrollbarWidth:"none" }}>
                {renderTheme()}
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
                {currentUserRole === 'Super_Admin' ? (
                  <>
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
                  </>
                ) : (
                  <div className="w-full px-3 py-2.5 rounded-xl text-sm text-yellow-500 font-bold bg-yellow-500/10 border border-yellow-500/20 text-center uppercase tracking-wider" dir="ltr">
                    {targetCardId}
                  </div>
                )}
              </div>

              {/* NEW: Card Type Selector */}
              <div className="mt-4 mb-2">
                <Label>نوع البطاقة (Card Type)</Label>
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mt-1.5">
                  <button
                    onClick={() => {
                        setCardType('restaurant');
                        if (theme === 'business_card') setTheme('restaurant');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${cardType === 'restaurant' ? 'bg-yellow-400/20 text-yellow-400 shadow-sm' : 'text-slate-500 hover:text-white'}`}
                  >
                    🍔 منيو مطعم
                  </button>
                  <button
                    onClick={() => {
                        setCardType('business_card');
                        setTheme('business_card');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${cardType === 'business_card' ? 'bg-yellow-400/20 text-yellow-400 shadow-sm' : 'text-slate-500 hover:text-white'}`}
                  >
                    💳 بطاقة أعمال
                  </button>
                </div>
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
            {cardType === 'restaurant' && (
              <div className="grid grid-cols-2 gap-2 mt-4">
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
            )}
          </div>

          {/* Tab Nav */}
          <div className="flex-shrink-0 flex flex-wrap gap-1 px-4 py-3 border-b border-white/5">
            {[
              { id:"links",  label:"روابط",   icon:"Link2"        },
              ...(cardType === 'restaurant' ? [{ id:"menu", label:"المنيو", icon:"UtensilsCrossed" }] : []),
              { id:"events", label:"فعاليات", icon:"CalendarDays" },
              { id:"images", label:"صـور",    icon:"Image"        },
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


            {/* ═══ TAB: IMAGES MANAGER ═══ */}
            {adminTab==="images" && (
              <div className="space-y-4">
                <p className="text-[12px] text-slate-400 mb-2 leading-relaxed">
                  اختر الصور التي ترغب بتبديلها. سيتم ضغطها تلقائياً لتسريع الموقع ⚡
                </p>
                {[
                  { slot: 'profile', label: '🖼️ اللوغو / صورة البروفايل', icon: 'User' },
                  { slot: 'hero1', label: 'الصورة الرئيسية 1 (Hero)', icon: 'Image' },
                  { slot: 'hero2', label: 'الصورة الرئيسية 2 (لبعض القوالب)', icon: 'Image' },
                  { slot: 'hero3', label: 'الصورة الرئيسية 3 (لبعض القوالب)', icon: 'Image' },
                  { slot: 'food1', label: 'صورة المنيو/الطعام', icon: 'Coffee' },
                  { slot: 'about1', label: 'صورة النبذة/الداخلية', icon: 'Utensils' },
                  { slot: 'chef1', label: 'صورة الطاهي/التحضير', icon: 'User' },
                ].map(({ slot, label, icon }) => {
                  const Ic = LucideIcons[icon] || LucideIcons.Image;
                  const currentImage = siteData.images?.[slot];
                  return (
                    <div key={slot} className="rounded-2xl p-4 space-y-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Ic size={14} className="text-yellow-400" /> {label}
                        </Label>
                        {currentImage && (
                          <button onClick={() => setSiteData(p => { const newImgs = {...(p.images||{})}; delete newImgs[slot]; return {...p, images: newImgs}; })} className="text-[10px] text-red-400 hover:text-red-300">
                            إزالة التخصيص
                          </button>
                        )}
                      </div>
                      <div className="flex gap-3 items-center">
                        {currentImage && (
                          <img src={currentImage} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleImageUpload(slot, e.target.files[0]);
                            e.target.value = '';
                          }}
                          className="block w-full text-[11px] text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
                
                {/* ═══ BLOCK IMAGES EDITOR (Drag & Drop Blocks) ═══ */}
                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[13px] flex items-center gap-2">
                        <LucideIcons.LayoutList size={14} className="text-yellow-400" />
                        صور البلوكات (اسحب ورتب!)
                      </h3>
                      <button 
                        onClick={() => {
                          const blocks = siteData.layoutBlocks || [
                            { id: "header", type: "header" },
                            { id: "menu_button", type: "menu_button" },
                            { id: "info", type: "info" },
                            { id: "links", type: "links" }
                          ];
                          // Separate images from core blocks
                          const coreBlocks = blocks.filter(b => b.type !== 'image');
                          const imageBlocks = blocks.filter(b => b.type === 'image');
                          
                          if (imageBlocks.length === 0) {
                              alert("أضف بعض الصور أولاً لتوزيعها!");
                              return;
                          }
                          
                          // Smart distribute: interleaving images evenly
                          let newLayout = [];
                          let coreIdx = 0;
                          let imgIdx = 0;
                          
                          // Always put header first
                          newLayout.push(coreBlocks[coreIdx++]);
                          
                          while (coreIdx < coreBlocks.length || imgIdx < imageBlocks.length) {
                              if (imgIdx < imageBlocks.length) {
                                  newLayout.push(imageBlocks[imgIdx++]);
                              }
                              if (coreIdx < coreBlocks.length) {
                                  newLayout.push(coreBlocks[coreIdx++]);
                              }
                          }
                          
                          setSiteData(p => ({ ...p, layoutBlocks: newLayout }));
                        }}
                        className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 hover:bg-yellow-400 hover:text-black transition-all"
                      >
                        <LucideIcons.Sparkles size={12} /> توزيع ذكي AI
                      </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                    هذه الصور ستصبح "بلوكات" حرة بين أزرار القالب. يمكنك تغيير ترتيبها بسحبها لأعلى ولأسفل في واجهة المعاينة المباشرة!
                  </p>
                  
                  {((siteData.layoutBlocks || []).filter(b => b.type === 'image')).map((imgBlock) => (
                    <div key={imgBlock.id} className="rounded-2xl p-4 space-y-3 mb-3 relative group" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <button 
                        onClick={() => setSiteData(p => ({...p, layoutBlocks: p.layoutBlocks.filter(b => b.id !== imgBlock.id)}))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-10"
                      >
                        <LucideIcons.X size={12} />
                      </button>
                      <div className="flex gap-4 items-center pr-2">
                        <img src={imgBlock.imageUrl || imgBlock.url} alt="block" className="w-14 h-14 rounded-lg object-contain border border-white/10 bg-black/40" />
                        <div className="flex-1">
                           <Label className="text-[10px] text-slate-400 mb-2 flex justify-between">
                             <span>الحجم التقريبي (العرض)</span>
                             <span className="text-yellow-400">{imgBlock.size}px</span>
                           </Label>
                           <input 
                              type="range" 
                              min="50" max="400" 
                              value={imgBlock.size || 250}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setSiteData(p => ({
                                  ...p,
                                  layoutBlocks: p.layoutBlocks.map(b => b.id === imgBlock.id ? {...b, size: val} : b)
                                }));
                              }}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                           />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-2xl p-4 mt-4 text-center cursor-pointer hover:bg-white/5 transition-all" style={{ border:"1px dashed rgba(255,255,255,0.2)" }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="upload-block-img"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const url = ev.target.result;
                          // Standard max dimensions to prevent huge base64 strings
                          const img = new window.Image();
                          img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_WIDTH = 1200;
                              let width = img.width;
                              let height = img.height;
                              if (width > MAX_WIDTH) {
                                  height = Math.round((height * MAX_WIDTH) / width);
                                  width = MAX_WIDTH;
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              // Clear to preserve PNG transparency
                              ctx.clearRect(0, 0, width, height);
                              ctx.drawImage(img, 0, 0, width, height);
                              const isPng = file.type === 'image/png';
                              const compressedUrl = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/webp', 0.92);
                              
                              setSiteData(p => {
                                  const currentBlocks = p.layoutBlocks || [
                                      { id: "header", type: "header" },
                                      { id: "menu_button", type: "menu_button" },
                                      { id: "info", type: "info" },
                                      { id: "links", type: "links" }
                                  ];
                                  const newImageBlock = {
                                      id: `img_${Date.now()}`,
                                      type: 'image',
                                      url: compressedUrl,
                                      size: 250
                                  };
                                  return { ...p, layoutBlocks: [...currentBlocks, newImageBlock] };
                              });
                          };
                          img.src = url;
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                    <label htmlFor="upload-block-img" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                       <LucideIcons.PlusCircle size={20} className="text-yellow-400" />
                       <span className="text-[11px] font-bold text-slate-300">إضافة بلوك صورة جديد</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAB: LINKS MANAGER ═══ */}
            {adminTab==="links" && (
              <>
                {/* ═══ SMART WAITER (Telegram) ═══ */}
                <div className="rounded-2xl p-4 mb-4 space-y-4" style={{ background:"rgba(16,185,129,0.08)", border:"1.5px dashed rgba(16,185,129,0.5)" }}>
                  <div className="flex items-center justify-between">
                    <Label className="font-bold flex items-center gap-2 text-emerald-300 text-[12px]">
                      <LucideIcons.MessageCircle size={15} className="text-emerald-400" />
                      🔔 إعدادات نداء الويتر (Telegram)
                    </Label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={telegramConfig.isEnabled} onChange={(e) => setTelegramConfig(p => ({ ...p, isEnabled: e.target.checked }))} />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  
                  {telegramConfig.isEnabled && (
                    <>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        يتيح للزبون طلب الخدمات عبر مسح البطاقة وتحديد رقم الطاولة، وستصلك الإشعارات فوراً على تليغرام.
                      </p>
                      <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Label className="text-[11px] text-slate-400">Telegram Bot Token</Label>
                          <AdminInput
                            value={telegramConfig.botToken}
                            onChange={(v) => setTelegramConfig(p => ({ ...p, botToken: v }))}
                            placeholder="مثال: 123456:ABC-DEF1234ghIkl..."
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[11px] text-slate-400">Chat ID (معرف المجموعة)</Label>
                          <AdminInput
                            value={telegramConfig.chatId}
                            onChange={(v) => setTelegramConfig(p => ({ ...p, chatId: v }))}
                            placeholder="مثال: -100123456789"
                            dir="ltr"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">تأكد من إضافة البوت إلى المجموعة وإعطائه صلاحية مسؤول.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ═══ CLIQ PAYMENT CONFIG ═══ */}
                <div className="rounded-2xl p-4 mb-4 space-y-4" style={{ background:"rgba(234,179,8,0.08)", border:"1.5px dashed rgba(234,179,8,0.5)" }}>
                  <div className="flex items-center justify-between">
                    <Label className="font-bold flex items-center gap-2 text-yellow-400 text-[12px] mb-0">
                      <LucideIcons.CreditCard size={15} />
                      💳 نظام الدفع المباشر (CliQ كليك)
                    </Label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={cliqConfig.isEnabled} onChange={(e) => setCliqConfig(p => ({ ...p, isEnabled: e.target.checked }))} />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                  {cliqConfig.isEnabled && (
                    <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        عند تفعيل هذا الخيار، سيتمكن الزبائن من إضافة الوجبات للسلة والدفع لك مباشرة عبر كليك، وسيصلك إشعار بالطلب عبر تليغرام.
                      </p>
                      <div className="space-y-2">
                        <Label className="text-[11px] text-slate-400">معرف كليك (Alias)</Label>
                        <AdminInput
                          value={cliqConfig.alias}
                          onChange={(v) => setCliqConfig(p => ({ ...p, alias: v }))}
                          placeholder="مثال: SHAMAKA"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] text-slate-400">رسالة تعليمات الدفع للزبون</Label>
                        <AdminInput
                          value={cliqConfig.message}
                          onChange={(v) => setCliqConfig(p => ({ ...p, message: v }))}
                          placeholder="لإتمام طلبك، يرجى تحويل المجموع عبر كليك"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ═══ NFC LINK GENERATOR + TARGETED UPDATE ═══ */}
                {targetCardId && (
                  <div className="rounded-2xl p-4 mb-4 space-y-4" style={{ background:"rgba(59,130,246,0.08)", border:"1.5px dashed rgba(59,130,246,0.4)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <LucideIcons.Nfc size={15} className="text-blue-400" />
                      <Label className="font-bold text-blue-300 text-[12px] mb-0">
                        مُولّد روابط البطاقات (NFC) — التحديث المستهدف
                      </Label>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      أدخل رقم البطاقة المادية ورابط الوجهة (واتساب أو غيره) ثم احفظ. كل بطاقة تُحدَّث باستقلالية تامة دون المساس بالأخريات.
                    </p>

                    {/* ── Inputs Row ── */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-slate-400 mb-1">رقم البطاقة المادية</Label>
                        <AdminInput
                          value={nfcTableNum}
                          onChange={setNfcTableNum}
                          placeholder="مثال: 1"
                          type="number"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-slate-400 mb-1">رابط الوجهة</Label>
                        <AdminInput
                          value={nfcDestUrl}
                          onChange={setNfcDestUrl}
                          placeholder="https://wa.me/962..."
                          type="url"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* ── NFC Scan URL + Copy & Save buttons ── */}
                    {nfcTableNum && (
                      <div className="space-y-2">
                        {/* Scan URL row */}
                        <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <input
                            type="text"
                            readOnly
                            value={`https://amt-nfc-system.vercel.app/api/scan?r=${targetCardId}&t=${nfcTableNum}`}
                            className="w-full text-[10px] bg-black/40 text-blue-200 px-2 py-2 rounded border border-white/5 outline-none font-mono"
                            dir="ltr"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://amt-nfc-system.vercel.app/api/scan?r=${targetCardId}&t=${nfcTableNum}`);
                              showToast("✅ تم نسخ رابط الـ NFC");
                            }}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded transition-all flex items-center gap-1 shrink-0"
                          >
                            <LucideIcons.Copy size={13} /> نسخ
                          </button>
                        </div>

                        {/* Save mapping button */}
                        <button
                          onClick={handleSaveCardMapping}
                          disabled={savingMapping || !nfcDestUrl.trim()}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: savingMapping ? '#1d4ed8' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}
                        >
                          {savingMapping
                            ? <LucideIcons.Loader2 size={14} className="animate-spin" />
                            : <LucideIcons.Save size={14} />}
                          {savingMapping ? 'جاري الحفظ...' : `💾 حفظ للبطاقة رقم ${nfcTableNum}`}
                        </button>
                        
                        {/* QR Code Generator */}
                        <div className="mt-4 pt-4 border-t border-blue-500/20">
                          <QRCodeGenerator 
                            tableNumber={nfcTableNum} 
                            baseUrl={`https://amt-nfc-system.vercel.app/api/scan?r=${targetCardId}&t=[tableNumber]`} 
                          />
                        </div>
                      </div>
                    )}

                    {/* ── Saved Mappings List ── */}
                    {cardMappings.length > 0 && (
                      <div className="pt-3 border-t border-blue-500/20 space-y-2">
                        <Label className="text-[10px] text-blue-300 font-bold flex items-center gap-1">
                          <LucideIcons.List size={11} /> البطاقات المحفوظة ({cardMappings.length})
                        </Label>
                        {[...cardMappings].sort((a,b) => a.cardNumber - b.cardNumber).map(m => (
                          <div key={m.cardNumber} className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/15">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-300 flex items-center justify-center text-[11px] font-black flex-shrink-0">
                              {m.cardNumber}
                            </div>
                            <p className="flex-1 text-[10px] text-slate-400 truncate font-mono" dir="ltr">
                              {m.destinationUrl}
                            </p>
                            <button
                              onClick={() => { setNfcTableNum(String(m.cardNumber)); setNfcDestUrl(m.destinationUrl); }}
                              title="تعديل"
                              className="p-1 rounded text-slate-500 hover:text-blue-400 transition-all"
                            >
                              <LucideIcons.PenLine size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteCardMapping(m.cardNumber)}
                              title="حذف"
                              className="p-1 rounded text-slate-600 hover:text-red-400 transition-all"
                            >
                              <LucideIcons.Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}


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
                          <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div><Label>إنجليزي</Label><AdminInput value={lk.title} onChange={v=>updLink(lk.id,"title",v)} placeholder="View Menu" dir="ltr" /></div>
                              <div><Label>عربي</Label><AdminInput value={lk.titleAr||""} onChange={v=>updLink(lk.id,"titleAr",v)} placeholder="عرض القائمة" dir="rtl" /></div>
                            </div>

                            <div>
                              <Label className="text-slate-400 text-[10px]">الرابط</Label>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <AdminInput value={lk.url} onChange={v=>updLink(lk.id,"url",v)} placeholder="https://..." type="url" dir="ltr" />
                                </div>
                                <label title="رفع ملف PDF كمرجع للرابط" className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all ${uploadingPdf === lk.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                  {uploadingPdf === lk.id ? <LucideIcons.Loader2 size={16} className="animate-spin" /> : <LucideIcons.UploadCloud size={16} />}
                                  <input type="file" accept="application/pdf,image/*" className="hidden" disabled={uploadingPdf === lk.id} onChange={(e) => handlePdfUpload(e.target.files[0], lk.id)} />
                                </label>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1 justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden" style={{ background:bg }}>
                                  {lk.iconUrl ? (
                                    <img src={lk.iconUrl} alt="icon" className="w-full h-full object-cover" />
                                  ) : (
                                    <Ic size={14} color={color} />
                                  )}
                                </div>
                                <p className="text-[9.5px] text-slate-600">
                                  {lk.iconUrl ? 'أيقونة مخصصة' : 'الأيقونة تتغير تلقائياً بناءً على الاسم ✨'}
                                </p>
                              </div>
                              <label title="رفع أيقونة مخصصة للرابط" className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer transition-all ${uploadingIcon === lk.id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploadingIcon === lk.id ? <LucideIcons.Loader2 size={14} className="animate-spin" /> : <LucideIcons.Image size={14} />}
                                <input type="file" accept="image/*" className="hidden" disabled={uploadingIcon === lk.id} onChange={(e) => handleIconUpload(e.target.files[0], lk.id)} />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>



                {/* ═══ OFFERS LINK QUICK-ADD ═══ */}
                <div className="rounded-2xl p-4 space-y-3" style={{ background:"rgba(139,92,246,0.08)", border:"1px dashed rgba(139,92,246,0.4)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <LucideIcons.Megaphone size={15} className="text-purple-400" />
                    <Label className="text-purple-300 text-[12px] mb-0 font-bold">🎉 زر "عروضنا" — فتح صورة أو PDF داخل التطبيق</Label>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    ارفع صورة عروضك أو ملف PDF ، سيظهر للزبون بشكل احترافي داخل الصفحة دون فتح تبويب جديد.
                  </p>
                  <div className="flex gap-2 items-center">
                    {offersUrl && (
                      <div className="flex items-center gap-2 flex-1 bg-purple-500/10 rounded-xl px-3 py-2 border border-purple-500/20">
                        <LucideIcons.CheckCircle size={14} className="text-purple-400 shrink-0" />
                        <p className="text-[10px] text-purple-300 truncate">تم رفع ملف العروض ✔️</p>
                        <button onClick={() => setOffersUrl('')} className="ml-auto text-[9px] text-red-400 hover:text-red-300">حذف</button>
                      </div>
                    )}
                    <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${uploadingPdf === 'offers' ? 'opacity-50' : 'hover:bg-purple-500/30'}`}
                      style={{ background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.4)", color:"#c084fc" }}>
                      {uploadingPdf === 'offers' ? <LucideIcons.Loader2 size={14} className="animate-spin" /> : <LucideIcons.UploadCloud size={14} />}
                      {uploadingPdf === 'offers' ? 'جاري الرفع...' : 'رفع صورة أو PDF'}
                      <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploadingPdf === 'offers'}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const url = await handlePdfUpload(file, 'offers_temp');
                          // Upload and save
                          const formData = new FormData();
                          formData.append('file', file);
                          setUploadingPdf('offers');
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.url) {
                              setOffersUrl(data.url);
                              // Auto-add link if not exists
                              const hasOffersLink = siteData.links.some(l => l.type === 'offers');
                              if (!hasOffersLink) {
                                setSiteData(p => ({ ...p, links: [...p.links, { id: Date.now(), title: 'Our Offers', titleAr: 'عروضنا', url: '#offers', type: 'offers' }] }));
                              }
                              showToast('✅ تم رفع ملف العروض بنجاح!');
                            }
                          } catch(err) {
                            showToast('❌ خطأ في رفع ملف العروض', false);
                          } finally { setUploadingPdf(null); }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Add New Link */}
                <div className="rounded-2xl p-4 space-y-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(255,255,255,0.10)" }}>
                  <Label>➕ إضافة رابط يدوياً</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>إنجليزي</Label><AdminInput value={newLink.title} onChange={v=>setNewLink(p=>({...p,title:v}))} placeholder="Instagram" dir="ltr" /></div>
                    <div><Label>عربي</Label><AdminInput value={newLink.titleAr} onChange={v=>setNewLink(p=>({...p,titleAr:v}))} placeholder="انستغرام" dir="rtl" /></div>
                  </div>
                  <div><Label>الرابط</Label><AdminInput value={newLink.url} onChange={v=>setNewLink(p=>({...p,url:v}))} placeholder="https://..." type="url" dir="ltr" /></div>
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

            {/* ═══ TAB: MENU BUILDER ═══ */}
            {adminTab === "menu" && cardType === 'restaurant' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="flex items-center gap-2 mb-0 font-bold text-yellow-400 text-[14px]">
                      <LucideIcons.Utensils size={18} />
                      تفعيل قائمة الطعام (Menu)
                    </Label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isMenuEnabled} onChange={(e) => {
                          setIsMenuEnabled(e.target.checked);
                      }} />
                      <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between bg-[#1f2937]/50 border border-white/5 p-4 rounded-xl">
                    <div>
                      <h4 className="font-bold text-white mb-1">تفعيل نظام الهاوس (House System)</h4>
                      <p className="text-[12px] text-white/50">للطلبات الذاتية من الطاولة مباشرة (نظام الكارت)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isHouseSystemActive} onChange={(e) => {
                        setIsHouseSystemActive(e.target.checked);
                      }} />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between bg-[#1f2937]/50 border border-white/5 p-4 rounded-xl">
                    <div>
                      <h4 className="font-bold text-white mb-1">تفعيل الطلبات الخارجية (التيك أوي)</h4>
                      <p className="text-[12px] text-white/50">السماح للزبائن بالطلب من خارج المطعم (بدون مسح كارت)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={isTakeawayEnabled} onChange={(e) => {
                        setIsTakeawayEnabled(e.target.checked);
                      }} />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>

                  {isMenuEnabled && (
                    <div className="space-y-4 pt-4 border-t border-yellow-500/10 animate-in fade-in slide-in-from-top-2">
                      <div className="flex gap-2 p-1.5 bg-black/40 rounded-xl">
                        <button onClick={() => setMenuMode('interactive')} className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-colors ${menuMode === 'interactive' ? 'bg-yellow-500 text-black shadow-md' : 'text-white/60 hover:text-white'}`}>قوائم تفاعلية</button>
                        <button onClick={() => setMenuMode('pdf')} className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-colors ${menuMode === 'pdf' ? 'bg-yellow-500 text-black shadow-md' : 'text-white/60 hover:text-white'}`}>ملف PDF جاهز</button>
                      </div>

                      {menuMode === 'pdf' ? (
                        <div className="space-y-3">
                          <Label className="text-[11px] text-white/70">رابط ملف المنيو PDF</Label>
                          <div className="flex gap-2">
                            <input type="text" value={pdfMenuUrl} onChange={e => { setPdfMenuUrl(e.target.value); }} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-yellow-500 transition-all" dir="ltr" />
                            <label title="رفع ملف PDF" className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white cursor-pointer transition-all shadow-lg ${uploadingPdf === 'menu' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              {uploadingPdf === 'menu' ? <LucideIcons.Loader2 size={20} className="animate-spin" /> : <LucideIcons.UploadCloud size={20} />}
                              <input type="file" accept="application/pdf,image/*" className="hidden" disabled={uploadingPdf === 'menu'} onChange={(e) => handlePdfUpload(e.target.files[0], 'menu')} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <h4 className="font-bold text-yellow-400 text-[13px] flex items-center justify-center gap-2">بناء المنيو بالذكاء الاصطناعي ✨</h4>
                            <p className="text-[11px] text-yellow-400/70 mt-2 mb-3 leading-relaxed">ارفع صورة أو ملف PDF لقائمة الطعام الخاصة بك وسنقوم بتفريغها وتصنيفها تلقائياً!</p>
                            <input type="file" accept="image/*,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => { if(e.target.files[0]) handleGenerateMenu(e.target.files[0]); }} disabled={loading} />
                            <button disabled={loading} className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[12px] rounded-xl pointer-events-none flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(250,204,21,0.3)] transition-all">
                              {loading ? <LucideIcons.Loader2 size={16} className="animate-spin" /> : <LucideIcons.Wand2 size={16} />}
                              {loading ? 'جاري تحليل القائمة سحرياً...' : 'ارفع المنيو الآن ودع السحر يبدأ'}
                            </button>
                          </div>
                          
                          <button onClick={() => setMenuCategories([...menuCategories, { id: Date.now().toString(), name: 'New Category', nameAr: 'تصنيف جديد', items: [] }])} className="w-full py-3 bg-white/5 border border-white/10 border-dashed rounded-xl text-yellow-500 font-bold text-[12px] hover:bg-white/10 hover:border-yellow-500/30 flex items-center justify-center gap-2 transition-all">
                            <LucideIcons.Plus size={16} /> إضافة تصنيف جديد
                          </button>
                          
                          <div className="space-y-4">
                            {menuCategories.map((cat, cIdx) => (
                              <div key={cat.id} className="p-3 bg-black/40 border border-white/10 rounded-2xl shadow-sm">
                                <div className="flex gap-2 mb-3 items-center">
                                  <div className="flex-1">
                                    <input type="text" value={cat.nameAr} onChange={e => { const newCat=[...menuCategories]; newCat[cIdx].nameAr=e.target.value; setMenuCategories(newCat); }} placeholder="اسم التصنيف بالعربي (مثال: مشروبات ساخنة)" className="w-full bg-white/5 border-none rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:ring-1 focus:ring-yellow-500 focus:bg-white/10 transition-all" />
                                  </div>
                                  <div className="w-1/3">
                                    <input type="text" value={cat.name} onChange={e => { const newCat=[...menuCategories]; newCat[cIdx].name=e.target.value; setMenuCategories(newCat); }} placeholder="English" className="w-full bg-white/5 border-none rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:ring-1 focus:ring-yellow-500 focus:bg-white/10 transition-all" dir="ltr" />
                                  </div>
                                  <button onClick={() => setMenuCategories(menuCategories.filter(c=>c.id!==cat.id))} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><LucideIcons.Trash2 size={14}/></button>
                                </div>
                                <div className="space-y-2">
                                  {cat.items.map((item, iIdx) => (
                                    <div key={item.id} className="flex gap-2 relative pl-8 items-start">
                                      <button onClick={() => { const newCat=[...menuCategories]; newCat[cIdx].items = newCat[cIdx].items.filter(i=>i.id!==item.id); setMenuCategories(newCat); }} className="absolute left-1 top-2 text-red-500/70 hover:text-red-400 p-1"><LucideIcons.X size={12}/></button>
                                      <div className="flex-1 space-y-1">
                                          <input type="text" value={item.nameAr} onChange={e => { const newCat=[...menuCategories]; newCat[cIdx].items[iIdx].nameAr=e.target.value; setMenuCategories(newCat); }} placeholder="اسم الصنف" className="w-full bg-white/5 border-none rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none focus:bg-white/10" />
                                          <input type="text" value={item.descAr} onChange={e => { const newCat=[...menuCategories]; newCat[cIdx].items[iIdx].descAr=e.target.value; setMenuCategories(newCat); }} placeholder="وصف الصنف (اختياري)" className="w-full bg-transparent border-none px-2.5 py-1 text-[10px] text-white/50 outline-none" />
                                      </div>
                                      <div className="w-20">
                                        <input type="text" value={item.price} onChange={e => { const newCat=[...menuCategories]; newCat[cIdx].items[iIdx].price=e.target.value; setMenuCategories(newCat); }} placeholder="السعر" className="w-full bg-white/5 border-none rounded-lg px-2.5 py-1.5 text-[11px] text-center text-yellow-400 font-bold outline-none focus:bg-white/10" dir="ltr" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button onClick={() => { const newCat=[...menuCategories]; newCat[cIdx].items.push({ id: Date.now().toString(), name: 'New Item', nameAr: 'صنف جديد', price: '0.00', desc: '', descAr: '' }); setMenuCategories(newCat); }} className="w-full mt-3 py-2 text-[11px] font-bold text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-yellow-500/10">
                                  <LucideIcons.Plus size={14} /> إضافة صنف
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
    <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center text-white">Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
