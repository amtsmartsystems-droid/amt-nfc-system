import { NextResponse } from 'next/server';
import connectDB from '../../../backend/config/db';
import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  name: String,
  mimeType: String,
  data: Buffer,
  createdAt: { type: Date, default: Date.now },
});

const FileModel = mongoose.models.UploadedFile || mongoose.model('UploadedFile', FileSchema);

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
    const mimeType = file.type || 'application/octet-stream';

    // Store in MongoDB
    await connectDB();
    const saved = await FileModel.create({
      name: file.name,
      mimeType,
      data: buffer,
    });

    // Return a proper URL to serve the file
    const fileUrl = `/api/file/${saved._id}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الرفع: ' + error.message }, { status: 500 });
  }
}
