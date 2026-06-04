import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import mongoose from 'mongoose';

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
    return new NextResponse(file.data, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.name}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return new NextResponse('Error: ' + error.message, { status: 500 });
  }
}
