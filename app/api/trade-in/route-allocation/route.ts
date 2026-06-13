import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { geocodeAddress, isValidH3 } from '@/lib/geocoding';
import { findHyperlocalBuyerMatch } from '@/lib/matcher';

/**
 * Route Allocation Controller for Trade-ins
 * 
 * Accepts the payload from the portal frontend after a trade-in item has "INSPECTED_PASSED".
 * Resolves the address to coordinates, executes the matching module, and handles routing dynamically.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tradeInId, productId, addressString, condition, sellerNotes } = body;

    if (!tradeInId || !productId || !addressString) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Geocode the textual address into exact coordinates and an H3 Index
    let geo;
    try {
      geo = await geocodeAddress(addressString);
    } catch (err: any) {
      console.error("Geocoding failed for trade-in:", err);
      return NextResponse.json({ error: "Invalid address, geocoding failed." }, { status: 422 });
    }

    if (!isValidH3(geo.h3_index)) {
      return NextResponse.json({ error: "Fatal error generating H3 spatial index." }, { status: 500 });
    }

    // 2. Ensure product exists in the system (upsert fallback)
    await prisma.product.upsert({
      where: { id: productId },
      update: {},
      create: {
        id: productId,
        name: "Unknown Product Placeholder",
        category: "General",
        price: 0.0,
      }
    });

    // 3. Register the incoming TradeIn as INSPECTED_PASSED in our DB
    const tradeIn = await prisma.tradeIn.upsert({
      where: { id: tradeInId },
      update: {
        lat: geo.lat,
        lng: geo.lng,
        h3_index: geo.h3_index,
        status: 'INSPECTED_PASSED',
        condition: condition || 'Unknown',
        sellerNotes: sellerNotes || '',
      },
      create: {
        id: tradeInId,
        productId: productId,
        lat: geo.lat,
        lng: geo.lng,
        h3_index: geo.h3_index,
        status: 'INSPECTED_PASSED',
        condition: condition || 'Unknown',
        sellerNotes: sellerNotes || '',
      }
    });

    // 4. Trigger the Core Matcher Logic
    const matchingResult = await findHyperlocalBuyerMatch(
      tradeIn.id, 
      productId, 
      geo.h3_index,
      geo.lat,
      geo.lng
    );

    if (matchingResult.success) {
      // Return a successful localized dispatch
      return NextResponse.json({
        success: true,
        routeType: 'P2P_LOCAL_COURIER',
        message: `Hyperlocal match found at ring distance ${matchingResult.ringSize}. Order locked.`,
        matchDetails: {
          matchId: matchingResult.match.id,
          orderId: matchingResult.match.orderId,
        },
        dispatchPayload: matchingResult.courierPayload
      });
    } else {
      // Fallback: Dispatch to central warehouse
      return NextResponse.json({
        success: true,
        routeType: 'CENTRAL_WAREHOUSE_MAIL_IN',
        message: matchingResult.reason,
        dispatchPayload: matchingResult.courierPayload
      });
    }

  } catch (error) {
    console.error('Route Allocation Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
