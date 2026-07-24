"use client";

import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";

export default function CategoryManagerModal({ isOpen, onClose, initialCategories, onSave }) {
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCategories(JSON.parse(JSON.stringify(initialCategories || [])));
        }
    }, [isOpen, initialCategories]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setSaving(true);
        await onSave(categories);
        setSaving(false);
        onClose();
    };

    const addCategory = () => {
        const newCat = {
            id: `cat_${Date.now()}`,
            name: "تصنيف جديد",
            themes: []
        };
        setCategories([...categories, newCat]);
    };

    const updateCategoryName = (catId, newName) => {
        setCategories(cats => cats.map(c => c.id === catId ? { ...c, name: newName } : c));
    };

    const deleteCategory = (catId) => {
        if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;
        setCategories(cats => cats.filter(c => c.id !== catId));
    };

    const addTheme = (catId) => {
        const newTheme = {
            id: `theme_${Date.now()}`,
            label: "قالب جديد"
        };
        setCategories(cats => cats.map(c => {
            if (c.id === catId) {
                return { ...c, themes: [...(c.themes || []), newTheme] };
            }
            return c;
        }));
    };

    const updateThemeName = (catId, themeId, newLabel) => {
        setCategories(cats => cats.map(c => {
            if (c.id === catId) {
                return {
                    ...c,
                    themes: c.themes.map(t => t.id === themeId ? { ...t, label: newLabel } : t)
                };
            }
            return c;
        }));
    };

    const updateThemeId = (catId, themeId, newId) => {
         setCategories(cats => cats.map(c => {
            if (c.id === catId) {
                return {
                    ...c,
                    themes: c.themes.map(t => t.id === themeId ? { ...t, id: newId } : t)
                };
            }
            return c;
        }));
    }

    const deleteTheme = (catId, themeId) => {
        if (!confirm("هل أنت متأكد من حذف هذا القالب؟")) return;
        setCategories(cats => cats.map(c => {
            if (c.id === catId) {
                return { ...c, themes: c.themes.filter(t => t.id !== themeId) };
            }
            return c;
        }));
    };

    return (
        <div className="fixed inset-0 z-[200] flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl" style={{ fontFamily: "Cairo,sans-serif" }}>
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#161616]">
                    <h2 className="text-white font-black text-[16px] flex items-center gap-2">
                        <LucideIcons.Settings size={18} className="text-yellow-400" />
                        إدارة التصنيفات والقوالب (للمسؤول فقط)
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <LucideIcons.X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {categories.map((cat, idx) => (
                        <div key={cat.id} className="bg-white/5 border border-white/10 rounded-xl p-4 relative group">
                            <button onClick={() => deleteCategory(cat.id)} className="absolute top-4 left-4 text-slate-500 hover:text-red-400 transition-colors">
                                <LucideIcons.Trash2 size={16} />
                            </button>

                            <div className="mb-4">
                                <label className="text-[10px] text-slate-400 mb-1.5 block">اسم التصنيف (مثل: مطعم، مقهى)</label>
                                <input
                                    value={cat.name}
                                    onChange={(e) => updateCategoryName(cat.id, e.target.value)}
                                    className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:border-yellow-400/50 outline-none transition-colors"
                                />
                                <div className="text-[10px] text-slate-500 mt-1 font-mono">ID: {cat.id}</div>
                            </div>

                            <div className="pl-4 border-r-2 border-white/10 space-y-3 pr-4">
                                <label className="text-[11px] text-slate-400 flex items-center justify-between font-bold">
                                    القوالب المتاحة لهذا التصنيف
                                    <button onClick={() => addTheme(cat.id)} className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded">
                                        <LucideIcons.Plus size={12} /> أضف قالب
                                    </button>
                                </label>
                                
                                {(!cat.themes || cat.themes.length === 0) && (
                                    <p className="text-[12px] text-slate-500">لا يوجد قوالب.</p>
                                )}
                                
                                {cat.themes?.map((th) => (
                                    <div key={th.id} className="flex flex-col md:flex-row items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/5">
                                        <div className="flex-1 w-full flex items-center gap-2">
                                            <LucideIcons.LayoutTemplate size={14} className="text-slate-500" />
                                            <input
                                                value={th.label}
                                                onChange={(e) => updateThemeName(cat.id, th.id, e.target.value)}
                                                className="flex-1 bg-transparent border-none text-[12px] text-white outline-none"
                                                placeholder="اسم القالب (مثل: قالب كلاسيكي)"
                                            />
                                        </div>
                                        <div className="flex-1 w-full flex items-center gap-2 border-t md:border-t-0 md:border-r border-white/10 pt-2 md:pt-0 md:pr-2">
                                            <span className="text-[10px] text-slate-500">Key:</span>
                                            <input
                                                value={th.id}
                                                onChange={(e) => updateThemeId(cat.id, th.id, e.target.value)}
                                                className="flex-1 bg-transparent border-none text-[12px] text-slate-300 outline-none font-mono"
                                                placeholder="theme_key"
                                            />
                                        </div>
                                        <button onClick={() => deleteTheme(cat.id, th.id)} className="text-slate-600 hover:text-red-400 p-1">
                                            <LucideIcons.X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button onClick={addCategory} className="w-full border-2 border-dashed border-white/10 hover:border-yellow-400/30 text-slate-400 hover:text-yellow-400 rounded-xl py-4 flex flex-col items-center gap-2 transition-colors">
                        <LucideIcons.FolderPlus size={24} />
                        <span className="text-[12px] font-bold">إضافة تصنيف جديد</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-[#161616] flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl text-[12px] font-bold text-slate-400 hover:text-white transition-colors bg-white/5">
                        إلغاء
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-xl text-[12px] font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition-colors flex items-center gap-2">
                        {saving ? <LucideIcons.Loader2 size={14} className="animate-spin" /> : <LucideIcons.Save size={14} />}
                        حفظ التغييرات
                    </button>
                </div>
            </div>
        </div>
    );
}
