import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = apiKey ? new Groq({ apiKey }) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userCity, userPincode, warehouseCity, productId } = body;

    if (!groq) {
      // Mock fallback if no API key is provided
      const isLocal = userCity.toLowerCase() === warehouseCity.toLowerCase();
      const days = isLocal ? 1 : 3;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      return NextResponse.json({
        days,
        dateString: deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }),
        isLocal,
        co2Offset: 5.2,
        routingDiagnostic: "Standard fallback routing applied (API Key missing)."
      });
    }

    const prompt = `
      You are an AI logistics engine for Amazon SecondLife.
      Calculate the delivery routing and estimate from warehouse city: "${warehouseCity}" to destination city: "${userCity}" (Pincode: ${userPincode}).
      Also consider the carbon footprint reduction for this second-hand product delivery.
      
      Return ONLY a JSON object with the following schema:
      {
        "days": number, // estimated delivery days (1-7)
        "dateString": string, // formatted delivery date (e.g., "Monday, June 15")
        "isLocal": boolean, // true if warehouseCity and userCity are nearby/same
        "co2Offset": number, // estimated kg of CO2 saved by optimized routing and buying second-hand (e.g., between 2.0 and 15.0)
        "routingDiagnostic": string // A brief AI diagnostic message (e.g. "Optimized via nearest green hub")
      }
    `;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const text = response.choices[0]?.message?.content;
    const data = JSON.parse(text || "{}");

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating AI routing:', error);
    // Fallback response in case of error
    return NextResponse.json({
      days: 3,
      dateString: "Standard Delivery",
      isLocal: false,
      co2Offset: 0,
      routingDiagnostic: "Standard fallback routing applied due to error.",
      error: "AI diagnostic unavailable."
    }, { status: 500 });
  }
}
