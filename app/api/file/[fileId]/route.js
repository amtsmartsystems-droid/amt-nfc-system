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
    // Use .lean() to get plain JS object (BSON Binary) instead of Mongoose doc
    const file = await FileModel.findById(params.fileId).lean();
    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Convert BSON Binary / Mongoose Buffer to plain Node.js Buffer
    const rawData = file.data;
    let nodeBuffer;
    if (Buffer.isBuffer(rawData)) {
      nodeBuffer = rawData;
    } else if (rawData && rawData.buffer instanceof ArrayBuffer) {
      // BSON Binary object has .buffer (ArrayBuffer)
      nodeBuffer = Buffer.from(rawData.buffer);
    } else if (rawData && rawData.buffer) {
      nodeBuffer = Buffer.from(rawData.buffer);
    } else {
      nodeBuffer = Buffer.from(rawData);
    }

    // Use ReadableStream — the only reliable way to stream binary on Vercel serverless
    const bytes = new Uint8Array(nodeBuffer);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType || 'application/pdf',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[file route] Error:', error);
    return new NextResponse('Error: ' + error.message, { status: 500 });
  }
}
