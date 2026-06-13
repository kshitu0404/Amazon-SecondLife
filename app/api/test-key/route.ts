import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: 'missing',
      message: 'GEMINI_API_KEY is not set in .env.local',
    });
  }

  if (!apiKey.startsWith('AIza')) {
    return NextResponse.json({
      status: 'wrong_format',
      message: `Key starts with "${apiKey.slice(0, 6)}..." — Gemini API keys must start with "AIza". Get one from https://aistudio.google.com/app/apikey`,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: 'Say the word OK and nothing else.',
    });
    return NextResponse.json({
      status: 'ok',
      message: 'API key is valid and working.',
      model_response: response.text,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: 'error',
      message,
    });
  }
}
