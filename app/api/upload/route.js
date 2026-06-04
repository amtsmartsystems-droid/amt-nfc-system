import { NextResponse } from 'next/server';

// Upload images/PDFs via base64 encoding — no external storage needed
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'لم يتم توفير أي ملف' }, { status: 400 });
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to base64 data URL
    const mimeType = file.type || 'application/octet-stream';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Return the data URL directly (works for images and PDFs up to ~10MB)
    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الرفع: ' + error.message }, { status: 500 });
  }
}
