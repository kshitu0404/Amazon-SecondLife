import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import prisma from '@/lib/prisma';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = apiKey ? new Groq({ apiKey }) : null;

export async function POST(req: Request) {
  try {
    if (!groq) {
      return NextResponse.json({ reply: 'Sorry, my AI core is currently offline (Missing API Key).' }, { status: 200 });
    }

    const { messages, currentProductContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Extract the latest user message for fallback checks
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

    // Hard fallback for simple greetings to ensure we NEVER fail on "hi"
    if (messages.length === 1 && (lastMessage === 'hi' || lastMessage === 'hello' || lastMessage === 'hey')) {
      return NextResponse.json({ 
        reply: "Hello! 👋 I'm Nova, your Amazon SecondLife assistant. I can help you search the marketplace, explain our sustainability impact, clarify return policies, or review product health cards. How can I assist you today?",
        followUps: ["Find laptops under ₹30,000", "Explain return decisions", "How much carbon did I save?"]
      });
    }

    let systemPrompt = `You are Nova, Amazon SecondLife's AI Circular Commerce Assistant. 
Your goal is to help users discover certified pre-owned products, understand condition grades, evaluate sustainability benefits, and explain return or passport details.
Rules:
- NEVER hallucinate product facts, order details, or sustainability numbers.
- If you don't know the exact data, ask a clarifying question or use a tool.
- Keep answers concise, friendly, and helpful. 

CRITICAL: You MUST respond with a valid JSON object only. No markdown formatting.
Format:
{
  "intent": "search_marketplace" | "get_sustainability" | "explain_return" | "chat",
  "search_keyword": "optional search keyword if intent is search_marketplace",
  "search_category": "optional category if intent is search_marketplace",
  "search_max_price": 50000,
  "reply": "Your chat response. REQUIRED if intent is chat. If intent is not chat, leave this empty."
}`;

    if (currentProductContext) {
      systemPrompt += `\n\n[CONTEXT: USER IS CURRENTLY VIEWING THIS PRODUCT]
Product Name: ${currentProductContext.name}
Condition: ${currentProductContext.condition}
Price: ₹${currentProductContext.resalePrice || currentProductContext.price}
Notes: ${currentProductContext.conditionNotes || currentProductContext.sellerNotes || 'N/A'}`;
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    // First LLM Call (Intent Classification via JSON)
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: apiMessages,
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch(e) {
      return generateResponsePayload('I encountered an error thinking about that.');
    }

    if (parsed.intent && parsed.intent !== 'chat') {
      let functionResponse = '';

      if (parsed.intent === 'search_marketplace') {
        try {
          const products = await prisma.product.findMany({
            where: {
              ...(parsed.search_category ? { category: { contains: parsed.search_category } } : {}),
              ...(parsed.search_keyword ? { name: { contains: parsed.search_keyword } } : {}),
              ...(parsed.search_max_price ? { price: { lte: parsed.search_max_price } } : {}),
            },
            take: 3,
            select: { name: true, price: true, category: true }
          });
          functionResponse = products.length > 0 
            ? JSON.stringify(products) 
            : 'No products found matching those criteria.';
        } catch (e) {
          functionResponse = 'Database error while searching.';
        }
      } else if (parsed.intent === 'get_sustainability') {
        functionResponse = 'Amazon SecondLife users have collectively saved over 12,000 kg of CO2 and diverted 4,500 kg of e-waste from landfills this year by shopping circular.';
      } else if (parsed.intent === 'explain_return') {
        functionResponse = 'All SecondLife items are backed by a 7-day verified return policy. If an item arrives differently than its AI-graded Health Card states, users can return it for a full refund. Items are rigorously inspected via computer vision before listing.';
      }

      // Second LLM Call to generate answer based on data
      apiMessages.push({ role: 'assistant', content: JSON.stringify(parsed) });
      apiMessages.push({ role: 'user', content: `Data result: ${functionResponse}. Please provide a natural, helpful, friendly response to the user based on this data. Output JSON format: { "reply": "..." }` });

      const finalResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: apiMessages,
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      });

      try {
        const finalParsed = JSON.parse(finalResponse.choices[0]?.message?.content || '{}');
        return generateResponsePayload(finalParsed.reply || 'I processed that information but ran into a slight glitch finalizing my response.');
      } catch(e) {
        return generateResponsePayload('I processed that information but ran into a slight glitch finalizing my response.');
      }
    }

    // Standard reply
    return generateResponsePayload(parsed.reply || 'I encountered an error thinking about that.');

  } catch (error: any) {
    console.error('Nova Chat Error:', error);
    return NextResponse.json(
      { 
        reply: "I'm having a little trouble connecting to my central servers right now. Can you please try asking again in a moment? 🐝",
        followUps: ["Explain return decisions"]
      },
      { status: 200 } // Return 200 so UI doesn't crash, just shows the graceful fallback
    );
  }
}

function generateResponsePayload(reply: string) {
  const lowerReply = reply.toLowerCase();
  const followUps = [];
  
  if (lowerReply.includes('condition') || lowerReply.includes('grade')) {
    followUps.push('Why was this item rated Good?');
  }
  if (lowerReply.includes('price') || lowerReply.includes('₹')) {
    followUps.push('Find laptops under ₹30,000');
  }
  if (lowerReply.includes('co2') || lowerReply.includes('sustainability')) {
    followUps.push('How much carbon did I save?');
  }
  if (lowerReply.includes('return') || lowerReply.includes('trade')) {
    followUps.push('Explain return decisions');
  }
  
  if (followUps.length === 0) {
    followUps.push('Explain return decisions', 'Find laptops under ₹30,000', 'Show my product passport');
  }

  return NextResponse.json({ 
    reply,
    followUps: followUps.slice(0, 3)
  });
}
