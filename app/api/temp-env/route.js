import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    MONGO_URI: process.env.MONGO_URI,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  });
}
