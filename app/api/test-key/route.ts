import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: 'missing',
      message: 'GROQ_API_KEY is not set in .env',
    });
  }

  if (!apiKey.startsWith('gsk_')) {
    return NextResponse.json({
      status: 'wrong_format',
      message: `Key starts with "${apiKey.slice(0, 6)}..." — Groq API keys must start with "gsk_".`,
    });
  }

  try {
    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say the word OK and nothing else.' }],
    });
    return NextResponse.json({
      status: 'ok',
      message: 'API key is valid and working.',
      model_response: response.choices[0]?.message?.content,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: 'error',
      message,
    });
  }
}
