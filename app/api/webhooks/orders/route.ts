import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { geocodeAddress, isValidH3 } from '@/lib/geocoding';

/**
 * Webhook Receiver for New Orders
 * 
 * Actively listens for incoming platform orders, geocodes their shipping addresses, 
 * indexes them via H3, and inserts them into the streaming PENDING_FULFILLMENT queue.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, productId, shippingAddress } = body;

    if (!orderId || !productId || !shippingAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Geocode the textual address into exact coordinates and an H3 Index
    let geo;
    try {
      geo = await geocodeAddress(shippingAddress);
    } catch (err: any) {
      console.error("Geocoding failed for order:", err);
      return NextResponse.json({ error: "Invalid shipping address, geocoding failed." }, { status: 422 });
    }

    // Double check that the index string is mathematically valid
    if (!isValidH3(geo.h3_index)) {
      return NextResponse.json({ error: "Fatal error generating H3 spatial index." }, { status: 500 });
    }

    // 2. Insert the Order into the database under PENDING_FULFILLMENT status
    // Note: We use an upsert/create approach. For this demo, we assume the Product already exists in the DB.
    // If not, we create a generic placeholder product to prevent foreign key constraint failures.
    
    // Ensure product exists
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

    const newOrder = await prisma.order.create({
      data: {
        id: orderId, // using external order ID directly
        productId: productId,
        lat: geo.lat,
        lng: geo.lng,
        h3_index: geo.h3_index,
        status: 'PENDING_FULFILLMENT',
      }
    });

    return NextResponse.json({
      success: true,
      message: "Order queued for spatial routing",
      data: {
        id: newOrder.id,
        h3_index: newOrder.h3_index,
        status: newOrder.status
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
