import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { rateLimit } from '../../../lib/rateLimit';

export const maxDuration = 60;

const SYSTEM_PROMPT = `أنت محلل بيانات ومدير محتوى متخصص في منصات المطاعم والكافيهات العربية.

══════ القواعد الحديدية ══════
❌ لا تعيد أي كود HTML أو CSS أو React أو JavaScript.
❌ لا تضع علامات Markdown كـ \`\`\`json.
❌ لا تضع أي نص خارج الـ JSON.
❌ لا تنسخ النصوص الثابتة من القوالب الأجنبية (مثل: أسماء فعاليات بيرة، نصوص روسية أو إنجليزية ثقافية محددة).
✅ أعد كائن JSON واحد نظيف يبدأ بـ { وينتهي بـ } فقط.

══════ قاعدة إعادة الصياغة للسياق العربي ══════
عندما تجد محتوى ثقافياً غير مناسب (مثل: فعاليات كحول، ثقافات أجنبية محددة)، قم بإعادة صياغته ليتناسب مع مطعم عربي محافظ:
- فعاليات بيرة/كحول → أمسيات عائلية، عشاء مع الأهل، فعاليات تذوق عصائر
- بار/نادٍ → مطعم عائلي، كافيه راقٍ، مكان مميز للعائلات
- قوائم كحولية → قوائم عصائر طازجة، مشروبات باردة وساخنة

══════ الهيكل الإلزامي للـ JSON ══════
{
  "name": "اسم المطعم أو الكافيه",
  "nameAr": "الاسم بالعربي إن وجد",
  "subtitle": "جملة تسويقية إنجليزية جذابة ≤ 8 كلمات",
  "subtitleAr": "الجملة التسويقية بالعربي",
  "about": "وصف المطعم بالإنجليزي (2-3 جمل)",
  "aboutAr": "وصف المطعم بالعربي (2-3 جمل)",
  "hours": "ساعات العمل (مثال: 10:00 AM — 11:00 PM)",
  "address": "العنوان الكامل إن وُجد",
  "colors": {
    "primary": "#HEX يعكس هوية المطعم بدقة",
    "background": "#HEX للخلفية"
  },
  "links": [
    {
      "id": 1,
      "title": "اسم الرابط بالإنجليزي (View Menu / WhatsApp / Instagram / Reserve / Location)",
      "titleAr": "اسم الرابط بالعربي",
      "url": "#"
    }
  ],
  "events": [
    {
      "id": 1,
      "title": "عنوان الفعالية بالعربي — مناسب للسياق العربي المحافظ",
      "titleEn": "Event title in English",
      "desc": "وصف الفعالية بالعربي (2-3 جمل تسويقية)",
      "descEn": "Event description in English (2-3 marketing sentences)"
    }
  ]
}

قواعد قسم الفعاليات (events):
- اقترح دائماً 2 إلى 3 فعاليات مناسبة لسياق المطعم.
- إذا كان المحتوى المُدخل يحتوي فعاليات كحول/بار → أعد صياغتها لأمسيات عائلية.
- إذا لم يوجد محتوى فعاليات → اقترح فعاليات تناسب نوع المطعم (مطعم فاخر، كافيه، مطعم عائلي).
- اجعل عناوين الفعاليات جذابة ومناسبة للثقافة العربية.

إذا لم تجد معلومة اترك القيمة "".`;

export async function POST(req) {
  // 5 Gemini calls per minute per IP — prevents API key exhaustion
  const { allowed, retryAfter } = rateLimit(req, { limit: 5, windowMs: 60_000, prefix: 'generate' });
  if (!allowed) {
    return NextResponse.json(
      { error: `طلبات كثيرة، انتظر ${retryAfter} ثانية.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const { promptText, fileBase64, fileMimeType } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY غير موجود في .env.local' }, { status: 500 });
    }

    const parts = [{ text: SYSTEM_PROMPT }];

    // File attachment (image/pdf)
    if (fileBase64 && fileMimeType) {
      const b64 = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
      parts.push({ inlineData: { data: b64, mimeType: fileMimeType } });
    }

    // Text description from user
    if (promptText?.trim()) {
      parts.push({ text: `المحتوى المُدخل للتحليل:\n${promptText.trim()}` });
    }

    // Fallback if nothing provided
    if (parts.length === 1) {
      parts.push({ text: 'أنشئ بيانات نموذجية كاملة لمطعم عربي فاخر متخصص بالمشويات والأكلات الشعبية.' });
    }

    const tryModel = async (modelName) => {
      const genAI  = new GoogleGenerativeAI(apiKey);
      const model  = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(parts);
      let text = result.response.text().trim()
        .replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/\s*```$/im, '').trim();
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('الرد ليس JSON صحيحاً');
      return parsed;
    };

    let data;
    try       { data = await tryModel('gemini-2.5-flash'); }
    catch (e1) {
      console.warn('[route] gemini-2.5-flash failed:', e1.message);
      data = await tryModel('gemini-flash-latest');
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('[/api/generate]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
