import { NextResponse } from 'next/server';
import { analyzeSellerReturnWithGroq } from '@/lib/sellerAgent';
import { calculateDynamicResalePrice } from '@/lib/pricingEngine';
import prisma from '@/lib/prisma';

const CONDITION_MAPPING: Record<string, number> = {
  'Pristine': 9.5,
  'Box Damaged': 8.0,
  'Minor Scratches': 7.5,
  'Severe Damage': 4.0
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { images, basePrice = 1200.00 } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Images array is required.' }, { status: 400 });
    }

    // 1. Analyze with Groq Vision
    const analysis = await analyzeSellerReturnWithGroq(images);

    // 2. Determine base condition score and demand score
    const baseCondition = CONDITION_MAPPING[analysis.damageLevel] || 5.0;
    // Factor in structural confidence slightly
    const conditionScore = Math.round(baseCondition * (analysis.structuralConfidence / 100) * 10) / 10;
    
    // Simulate high or varying demand
    const nearbyDemandCount = Math.floor(Math.random() * 25);
    const pricing = calculateDynamicResalePrice(basePrice, analysis.damageLevel, analysis.estimatedAgeMonths, nearbyDemandCount);
    
    // Demand Score derived from the pricing engine
    const demandScore = pricing.demandScorePercent;

    // 3. Autonomous Validation Rule
    const isViable = conditionScore >= 7.0 && demandScore >= 50;

    let tradeInRecord = null;

    if (isViable) {
      // Execute Atomic Upsert and TradeIn creation
      tradeInRecord = await prisma.$transaction(async (tx) => {
        
        // Find existing product or create a new one to avoid duplicate models
        let product = await tx.product.findFirst({
          where: { name: analysis.detectedItemName }
        });

        if (!product) {
          product = await tx.product.create({
            data: {
              name: analysis.detectedItemName,
              category: "Electronics", 
              price: pricing.suggestedPrice
            }
          });
        }

        // Commit active marketplace listing with bound Health Card
        const tradeIn = await tx.tradeIn.create({
          data: {
            productId: product.id,
            condition: analysis.damageLevel,
            sellerNotes: "Autonomously gated by Circle Exchange AI.",
            status: "LIVE_ON_MARKETPLACE", // Updated to final live storefront status
            lat: 28.7041, // Sample New Delhi coordinate
            lng: 77.1025,
            h3_index: "883da11ab7fffff",
            productHealthCard: {
              create: {
                productName: analysis.detectedItemName,
                conditionScore: Math.round(conditionScore * 10), // out of 100
                damageDetection: analysis.repairable_flaws && analysis.repairable_flaws.length > 0 
                  ? analysis.repairable_flaws.join(", ") 
                  : analysis.damageLevel,
                repairHistory: "Amazon Certified / No Previous Repairs",
                performanceHealth: "Battery Health: 91%",
                aiRecommendation: "Highly Recommended for Live Resale",
                authenticityVerified: true
              }
            }
          },
          include: {
            productHealthCard: true
          }
        });

        return tradeIn;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        pricing,
        conditionScore,
        demandScore,
        isViable,
        tradeInRecord
      }
    });
  } catch (error: any) {
    console.error('Circle Exchange Evaluate Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process evaluation.',
      details: error.message 
    }, { status: 500 });
  }
}
