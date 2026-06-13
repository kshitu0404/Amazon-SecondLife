import { NextResponse } from 'next/server';
import { analyzeSellerReturnWithGroq } from '@/lib/sellerAgent';
import { calculateDynamicResalePrice, calculateUpgradeROI } from '@/lib/pricingEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { images, basePrice } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Images array is required.' }, { status: 400 });
    }

    // 1. Groq Vision Copilot Engine
    const analysis = await analyzeSellerReturnWithGroq(images);

    // Default base price for demo if not provided
    const referencePrice = basePrice || 1200.00;

    // Simulate nearby demand count for H3 cluster (e.g., 0 to 25 orders nearby)
    const nearbyDemandCount = Math.floor(Math.random() * 25);

    // 2. Auto Dynamic Pricing AI Engine
    const pricing = calculateDynamicResalePrice(
      referencePrice,
      analysis.damageLevel,
      analysis.estimatedAgeMonths,
      nearbyDemandCount
    );

    // 3. Predictive Upgrade ROI Calculator
    const roi = calculateUpgradeROI(
      referencePrice,
      analysis.damageLevel,
      analysis.estimatedAgeMonths
    );

    // 4. Return combined orchestrator payload
    return NextResponse.json({
      success: true,
      data: {
        analysis,
        pricing,
        roi,
        referencePrice,
        nearbyDemandCount
      }
    });
  } catch (error: any) {
    console.error('Copilot Evaluate API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process evaluation.',
      details: error.message 
    }, { status: 500 });
  }
}
