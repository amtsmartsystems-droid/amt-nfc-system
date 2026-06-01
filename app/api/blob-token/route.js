import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// Client-side upload token endpoint — allows browser to upload directly to Vercel Blob
// This bypasses the 4.5MB serverless function body limit entirely
export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Allow PDF and image uploads only
        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
