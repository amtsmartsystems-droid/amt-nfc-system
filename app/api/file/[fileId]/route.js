import { NextResponse } from 'next/server';
import connectDB from '../../../../backend/config/db';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const FileSchema = new mongoose.Schema({
  name: String,
  mimeType: String,
  data: Buffer,
  createdAt: { type: Date, default: Date.now },
});

const FileModel = mongoose.models.UploadedFile || mongoose.model('UploadedFile', FileSchema);

export async function GET(request, { params }) {
  try {
    await connectDB();
    const file = await FileModel.findById(params.fileId);
    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Convert Mongoose Buffer to Uint8Array to avoid ByteString error on Vercel
    const buffer = file.data;
    const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new NextResponse('Error: ' + error.message, { status: 500 });
  }
}
