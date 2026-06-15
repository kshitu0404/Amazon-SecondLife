import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { invokeBedrockChat, isBedrockConfigured, BEDROCK_MODEL } from '@/lib/aws/bedrock';
import { logger } from '@/lib/aws/cloudwatch';
import prisma from '@/lib/prisma';

const groqKey = process.env.GROQ_API_KEY || '';
const groq    = groqKey ? new Groq({ apiKey: groqKey }) : null;

const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Nova, Amazon SecondLife's AI Circular Commerce Assistant.
Your goal is to help users discover certified pre-owned products, understand condition grades, evaluate sustainability benefits, and explain return or passport details.
Rules:
- NEVER hallucinate product facts, order details, or sustainability numbers.
- If you don't know the exact data, ask a clarifying question or use a tool.
- Keep answers concise, friendly, and helpful.

CRITICAL: You MUST respond with a valid JSON object only. No markdown formatting, no code fences.
Format:
{
  "intent": "search_marketplace" | "get_sustainability" | "explain_return" | "chat",
  "search_keyword": "optional search keyword if intent is search_marketplace",
  "search_category": "optional category if intent is search_marketplace",
  "search_max_price": 50000,
  "reply": "Your chat response. REQUIRED if intent is chat. Leave empty otherwise."
}`;

// ── Helpers ──────────────────────────────────────────────────────────────────

const GREETINGS = new Set(['hi', 'hello', 'hey', 'hii', 'helo']);

function isSimpleGreeting(msg: string): boolean {
  return GREETINGS.has(msg.trim().toLowerCase());
}

function buildPayload(reply: string) {
  const low = reply.toLowerCase();
  const followUps: string[] = [];
  if (low.includes('condition') || low.includes('grade'))   followUps.push('Why was this item rated Good?');
  if (low.includes('price')     || low.includes('₹'))       followUps.push('Find laptops under ₹30,000');
  if (low.includes('co2')       || low.includes('sustain')) followUps.push('How much carbon did I save?');
  if (low.includes('return')    || low.includes('trade'))   followUps.push('Explain return decisions');
  if (followUps.length === 0)
    followUps.push('Explain return decisions', 'Find laptops under ₹30,000', 'Show my product passport');
  return NextResponse.json({ reply, followUps: followUps.slice(0, 3) });
}

/**
 * Mistral sometimes escapes underscores in JSON keys (search\_keyword).
 * Strip those before parsing so JSON.parse doesn't fail.
 */
function safeParseJSON(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    // Try unescaping Mistral's backslash-escaped underscores
    try {
      return JSON.parse(raw.replace(/\\_/g, '_'));
    } catch {
      return {};
    }
  }
}

// ── Tool dispatch ─────────────────────────────────────────────────────────────

async function runTool(intent: string, parsed: Record<string, unknown>): Promise<string> {
  if (intent === 'search_marketplace') {
    try {
      const products = await prisma.product.findMany({
        where: {
          ...(parsed.search_category ? { category: { contains: parsed.search_category as string } } : {}),
          ...(parsed.search_keyword  ? { name:     { contains: parsed.search_keyword  as string } } : {}),
          ...(parsed.search_max_price ? { price:   { lte: parsed.search_max_price as number }      } : {}),
        },
        take: 3,
        select: { name: true, price: true, category: true },
      });
      return products.length > 0
        ? JSON.stringify(products)
        : 'No products found matching those criteria.';
    } catch {
      return 'Database error while searching.';
    }
  }
  if (intent === 'get_sustainability') {
    return 'Amazon SecondLife users have collectively saved over 12,000 kg of CO2 and diverted 4,500 kg of e-waste from landfills this year by shopping circular.';
  }
  if (intent === 'explain_return') {
    return 'All SecondLife items are backed by a 7-day verified return policy. If an item arrives differently than its AI-graded Health Card states, users can return it for a full refund.';
  }
  return '';
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const reqStart = Date.now();

  try {
    const { messages, currentProductContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    const lastMessage: string = messages[messages.length - 1]?.content ?? '';

    // Hard shortcut for greetings — no AI call needed
    if (messages.length === 1 && isSimpleGreeting(lastMessage)) {
      return buildPayload(
        "Hello! 👋 I'm Nova, your Amazon SecondLife assistant. I can help you search the marketplace, explain our sustainability impact, clarify return policies, or review product health cards. How can I assist you today?"
      );
    }

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (currentProductContext) {
      systemPrompt +=
        `\n\n[CONTEXT: USER IS VIEWING THIS PRODUCT]\n` +
        `Name: ${currentProductContext.name}\n` +
        `Condition: ${currentProductContext.condition}\n` +
        `Price: ₹${currentProductContext.resalePrice || currentProductContext.price}\n` +
        `Notes: ${currentProductContext.conditionNotes || currentProductContext.sellerNotes || 'N/A'}`;
    }

    const apiMessages = messages.map((m: any) => ({
      role:    m.role    as 'user' | 'assistant',
      content: m.content as string,
    }));

    // ── First LLM call — intent classification ────────────────────────────────

    let rawContent   = '';
    let provider     = 'groq';
    let fallbackUsed = false;
    const t1         = Date.now();

    if (isBedrockConfigured) {
      try {
        rawContent = await invokeBedrockChat(systemPrompt, apiMessages, 400);
        provider   = 'bedrock';
      } catch (bedrockErr) {
        fallbackUsed = true;
        await logger.warn('nova-chat', {
          event:    'bedrock_fallback',
          model:    BEDROCK_MODEL,
          reason:   String(bedrockErr),
          latency_ms: Date.now() - t1,
        });
      }
    }

    if (!rawContent) {
      if (!groq) {
        return buildPayload("Sorry, Nova is offline right now. Please try again shortly.");
      }
      const groqRes = await groq.chat.completions.create({
        model:           GROQ_MODEL,
        messages:        [{ role: 'system', content: systemPrompt }, ...apiMessages],
        response_format: { type: 'json_object' },
        max_tokens:      400,
      });
      rawContent = groqRes.choices[0]?.message?.content || '{}';
      provider   = 'groq';
    }

    const latency1 = Date.now() - t1;
    const parsed   = safeParseJSON(rawContent);
    const intent   = typeof parsed.intent === 'string' ? parsed.intent : 'chat';

    await logger.info('nova-chat', {
      event:         'first_call',
      provider,
      model:         provider === 'bedrock' ? BEDROCK_MODEL : GROQ_MODEL,
      intent,
      fallback_used: fallbackUsed,
      latency_ms:    latency1,
    });

    // ── Tool dispatch + second LLM call ───────────────────────────────────────

    if (intent !== 'chat') {
      const toolResult = await runTool(intent, parsed);
      const followUp   = `Tool result: ${toolResult}. Now write a helpful, friendly reply to the user. Output JSON: {"reply":"..."}`;

      let finalContent   = '';
      let finalProvider  = provider;
      const t2           = Date.now();

      if (isBedrockConfigured && provider === 'bedrock') {
        try {
          finalContent  = await invokeBedrockChat(systemPrompt, [
            ...apiMessages,
            { role: 'assistant', content: rawContent },
            { role: 'user',      content: followUp },
          ], 300);
          finalProvider = 'bedrock';
        } catch {
          finalProvider = 'groq'; // fall through
        }
      }

      if (!finalContent && groq) {
        const finalRes = await groq.chat.completions.create({
          model:           GROQ_MODEL,
          messages:        [
            { role: 'system',    content: systemPrompt },
            ...apiMessages,
            { role: 'assistant', content: rawContent },
            { role: 'user',      content: followUp },
          ],
          response_format: { type: 'json_object' },
          max_tokens:      300,
        });
        finalContent  = finalRes.choices[0]?.message?.content || '{}';
        finalProvider = 'groq';
      }

      await logger.info('nova-chat', {
        event:      'second_call',
        provider:   finalProvider,
        model:      finalProvider === 'bedrock' ? BEDROCK_MODEL : GROQ_MODEL,
        intent,
        latency_ms: Date.now() - t2,
        total_ms:   Date.now() - reqStart,
      });

      const fp = safeParseJSON(finalContent);
      return buildPayload(
        typeof fp.reply === 'string' && fp.reply
          ? fp.reply
          : 'I processed that but had a small glitch. Please try again.'
      );
    }

    // ── Plain chat reply ──────────────────────────────────────────────────────

    await logger.info('nova-chat', {
      event:    'chat_reply',
      provider,
      model:    provider === 'bedrock' ? BEDROCK_MODEL : GROQ_MODEL,
      total_ms: Date.now() - reqStart,
    });

    return buildPayload(
      typeof parsed.reply === 'string' && parsed.reply
        ? parsed.reply
        : 'I encountered a small issue. Could you rephrase that?'
    );

  } catch (error: any) {
    await logger.error('nova-chat', {
      event:    'unhandled_error',
      error:    error?.message ?? String(error),
      total_ms: Date.now() - reqStart,
    });
    return NextResponse.json(
      {
        reply:     "I'm having a little trouble right now. Please try again in a moment. 🐝",
        followUps: ['Explain return decisions'],
      },
      { status: 200 }
    );
  }
}
