import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      detectedItemName, 
      suggestedPrice, 
      damageLevel, 
      sellerNotes,
      lat = 28.7041, // Default to New Delhi coordinates
      lng = 77.1025,
      h3_index = "883da11ab7fffff" // Sample resolution 8 index
    } = body;

    if (!detectedItemName || !suggestedPrice || !damageLevel) {
      return NextResponse.json({ error: 'Missing required fields for relisting.' }, { status: 400 });
    }

    // Execute Prisma Interactive Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Find the Reference Product
      let product = await tx.product.findFirst({
        where: { name: detectedItemName }
      });

      if (!product) {
        product = await tx.product.create({
          data: {
            name: detectedItemName,
            category: "Electronics", // Defaulted for this copilot demo
            price: suggestedPrice, // Set initial market price to suggested
          }
        });
      }

      // 2. Create the TradeIn Record with 'INSPECTED_PASSED'
      const tradeIn = await tx.tradeIn.create({
        data: {
          productId: product.id,
          condition: damageLevel,
          sellerNotes: sellerNotes || "Relisted via AI Copilot",
          status: "INSPECTED_PASSED", // Actively listed inside open inventory
          lat,
          lng,
          h3_index,
        }
      });

      return { product, tradeIn };
    });

    return NextResponse.json({
      success: true,
      message: 'Item successfully relisted to active marketplace.',
      data: result
    });

  } catch (error: any) {
    console.error('Relist Item API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to relist item.',
      details: error.message 
    }, { status: 500 });
  }
}
