import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'لم يتم توفير أي ملف' }, { status: 400 });
    }

    const blob = await put(`menus/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true, 
    });

    // Generate proxy URL instead of raw Vercel Storage URL
    const proxyUrl = blob.url.replace('https://9vaqqf9s1c4ou0pk.public.blob.vercel-storage.com', '/blob');

    return NextResponse.json({ url: proxyUrl });
  } catch (error) {
    console.error('Error uploading file to blob:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الرفع' }, { status: 500 });
  }
}
