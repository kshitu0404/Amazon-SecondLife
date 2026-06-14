import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { mockProducts } from '@/data/mockProducts';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = apiKey ? new Groq({ apiKey }) : null;

export async function POST(req: Request) {
  try {
    if (!groq) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const { messages, currentProductContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // 1. Build the base System Prompt
    let systemPrompt = `You are Nova, Amazon SecondLife's AI Circular Commerce Assistant. Help users discover certified pre-owned products, understand condition grades, evaluate sustainability benefits, compare listings, navigate the marketplace, and make informed purchasing decisions. Keep answers concise, friendly, and helpful. Do not use markdown headers, just clean text and emojis. Provide brief, single-paragraph responses unless asked for a list.`;

    // 2. Inject Context (either the specific product they are viewing, or a general top 5 slice)
    if (currentProductContext) {
      systemPrompt += `\n\n[CONTEXT: USER IS CURRENTLY VIEWING THIS PRODUCT]
Product Name: ${currentProductContext.name}
Condition: ${currentProductContext.condition}
Price: ₹${currentProductContext.resalePrice} (Original: ₹${currentProductContext.originalPrice})
CO2 Saved: ${currentProductContext.co2SavedKg} kg
Warranty: ${currentProductContext.healthCard?.warrantyStatus || 'N/A'}
Notes: ${currentProductContext.conditionNotes}`;
    } else {
      // Inject top 5 products as general marketplace knowledge
      const topProducts = mockProducts.slice(0, 5).map(p => 
        `- ${p.name} (₹${p.resalePrice}, Condition: ${p.condition}, Saves ${p.co2SavedKg}kg CO2)`
      ).join('\n');
      
      systemPrompt += `\n\n[CONTEXT: CURRENT TOP MARKETPLACE LISTINGS]\n${topProducts}`;
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: apiMessages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content || 'I encountered an error thinking about that.';

    // Generate dynamic follow-up actions based on the reply content
    const lowerReply = reply.toLowerCase();
    const followUps = [];
    
    if (lowerReply.includes('condition') || lowerReply.includes('grade')) {
      followUps.push('Explain Condition Grade');
    }
    if (lowerReply.includes('price') || lowerReply.includes('₹')) {
      followUps.push('Compare Listings');
    }
    if (lowerReply.includes('co2') || lowerReply.includes('sustainability')) {
      followUps.push('Sustainability Impact');
    }
    if (lowerReply.includes('return') || lowerReply.includes('trade')) {
      followUps.push('Trade-In Advice');
    }
    
    // Default fallbacks if none match
    if (followUps.length === 0) {
      followUps.push('Find a Product', 'Trade-In Advice');
    }

    return NextResponse.json({ 
      reply,
      followUps: followUps.slice(0, 3) // Return max 3 dynamic chips
    });

  } catch (error) {
    console.error('Nova Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Nova' },
      { status: 500 }
    );
  }
}
