import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { rateLimit } from '../../../lib/rateLimit';

export const maxDuration = 60;

const SYSTEM_PROMPT = `أنت محلل بيانات ومتخصص في تفريغ قوائم الطعام (المنيو) للمطاعم.
سيتم تزويدك بملف (PDF أو صورة) يحتوي على قائمة طعام.

مهمتك:
استخراج جميع الأقسام (التصنيفات) والوجبات والأسعار من هذا الملف، وتنسيقها في كائن JSON نقي ومطابق تماماً للهيكل التالي:

{
  "menuCategories": [
    {
      "id": "سيتم تجاوزه لاحقاً، ضع أي رقم",
      "name": "Category Name in English (e.g. Burgers, Drinks)",
      "nameAr": "اسم القسم بالعربي (مثال: برجر، مشروبات)",
      "items": [
        {
          "id": "سيتم تجاوزه لاحقاً، ضع أي رقم",
          "name": "Item Name in English",
          "nameAr": "اسم الوجبة بالعربي",
          "desc": "Item description in English if available",
          "descAr": "وصف الوجبة بالعربي إن وجد",
          "price": 5.5,
          "image": "",
          "available": true
        }
      ]
    }
  ]
}

══════ القواعد الحديدية ══════
❌ لا تعيد أي نص خارج الـ JSON.
❌ لا تضع علامات Markdown كـ \`\`\`json.
✅ أعد كائن JSON واحد نظيف يبدأ بـ { وينتهي بـ } فقط.
✅ السعر (price) يجب أن يكون رقماً وليس نصاً (مثال: 5.5 وليس "5.5 دينار").
✅ إذا كان الملف لا يحتوي على لغة إنجليزية، قم بترجمة الأسماء بشكل تقريبي ومناسب للمطاعم للـ (name) واترك (nameAr) للغة الأصلية.
✅ تأكد من تضمين كافة الأقسام الرئيسية والوجبات الموجودة في المنيو بشكل منظم.`;

export async function POST(req) {
  const { allowed, retryAfter } = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'generate_menu' });
  if (!allowed) {
    return NextResponse.json(
      { error: `طلبات كثيرة، انتظر ${retryAfter} ثانية.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const { fileBase64, fileMimeType } = await req.json();

    if (!fileBase64 || !fileMimeType) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف للتحليل' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY غير موجود' }, { status: 500 });
    }

    const b64 = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
    
    const parts = [
      { text: SYSTEM_PROMPT },
      { inlineData: { data: b64, mimeType: fileMimeType } }
    ];

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
    console.error('[/api/generate-menu]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
