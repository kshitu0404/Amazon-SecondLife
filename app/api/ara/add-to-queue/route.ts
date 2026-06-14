import { NextResponse } from 'next/server';
import { addToInventory } from '@/lib/araAgent';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    addToInventory({
      id: "inv-copilot-" + Date.now(),
      purchase_price: body.suggestedPrice * 0.8,
      age_months: 6,
      status: "owned",
      title: body.detectedItemName,
      brand: "Certified Pre-Owned",
      category: "electronics", 
      msrp: body.suggestedPrice * 1.2,
      weight_kg: 1.0,
      embedded_carbon_kg: 20,
      monthly_depreciation: 2.0,
      image_url: body.image || "https://images.unsplash.com/photo-1550009158-9effb64fda70?auto=format&fit=crop&w=400&q=80",
      eco_score: 80,
      size: "Standard"
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to add to queue' }, { status: 500 });
  }
}
