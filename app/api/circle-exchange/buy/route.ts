import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tradeInId, buyerLat = 28.5355, buyerLng = 77.3910 } = body; // Buyer default near Noida

    if (!tradeInId) {
      return NextResponse.json({ error: 'tradeInId is required.' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate the TradeIn is actively listed
      const tradeIn = await tx.tradeIn.findUnique({
        where: { id: tradeInId },
        include: { product: true }
      });

      if (!tradeIn) {
        throw new Error("Listing not found.");
      }
      
      if (tradeIn.status !== 'LIVE_ON_MARKETPLACE') {
        throw new Error("Item is not actively listed on the marketplace.");
      }

      // 2. Update Status to PENDING_PICKUP
      const updatedTradeIn = await tx.tradeIn.update({
        where: { id: tradeInId },
        data: { status: 'PENDING_PICKUP' }
      });

      // 3. Create Simulated Buyer Order
      const order = await tx.order.create({
        data: {
          productId: tradeIn.productId,
          lat: buyerLat,
          lng: buyerLng,
          h3_index: "883da11139fffff", // Sample destination index
          status: "MATCHED_P2P"
        }
      });

      // 4. Generate P2PMatch Logistics Record
      const trackingId = `AMZN-CEX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      const p2pMatch = await tx.p2PMatch.create({
        data: {
          orderId: order.id,
          tradeInId: tradeIn.id,
          status: "AWAITING_COURIER",
          trackingUrl: `https://track.amazon.in/${trackingId}`
        }
      });

      return {
        tradeIn: updatedTradeIn,
        order,
        p2pMatch,
        logistics: {
          trackingId,
          originAddress: "Sector 14, Rohini, New Delhi, DL 110085",
          destinationAddress: "Sector 62, Noida, UP 201309",
          courier: "Amazon Logistics (ATS)"
        }
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Settlement executed. 3PL courier dispatched.',
      data: result
    });
  } catch (error: any) {
    console.error('Circle Exchange Buy API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to execute settlement.',
      details: error.message 
    }, { status: 500 });
  }
}
