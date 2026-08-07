import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get('phone');
        const name = searchParams.get('name') || 'جهة اتصال';
        const company = searchParams.get('company') || '';
        const email = searchParams.get('email') || '';
        const website = searchParams.get('website') || '';

        if (!phone) {
            return NextResponse.json({ error: 'رقم الهاتف مطلوب (phone param is required)' }, { status: 400 });
        }

        // بناء ملف جهة الاتصال (vCard)
        const vcard = `BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
${company ? `ORG:${company}` : ''}
TEL;TYPE=CELL:${phone}
${email ? `EMAIL;TYPE=WORK:${email}` : ''}
${website ? `URL:${website}` : ''}
END:VCARD`;

        // إرجاع الملف للتحميل المباشر
        return new NextResponse(vcard, {
            status: 200,
            headers: {
                'Content-Type': 'text/vcard; charset=utf-8',
                'Content-Disposition': `attachment; filename="contact.vcf"`,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
