import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Asynchronous Lifecycle Handler (Holding Window Daemon)
 * 
 * Enforces a strict 2-hour holding window.
 * This endpoint is designed to be triggered periodically (e.g., every 5 minutes)
 * by an external CRON scheduler (like Vercel Cron or GitHub Actions).
 * 
 * If a local courier handoff is not completed or is canceled within 2 hours,
 * the worker automatically releases the matched open buyer order back to the main warehouse queue,
 * discards the P2P route, and switches the sender's status to a standard warehouse mail-in return.
 */
export async function GET(req: NextRequest) {
  // In production, ensure this endpoint is secured (e.g., verifying a CRON_SECRET token)
  /*
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  */

  try {
    // Define the threshold: 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Find all expired holds
    const expiredMatches = await prisma.p2PMatch.findMany({
      where: {
        status: 'AWAITING_COURIER',
        createdAt: {
          lt: twoHoursAgo
        }
      }
    });

    if (expiredMatches.length === 0) {
      return NextResponse.json({ success: true, message: "No expired holds found.", releasedCount: 0 });
    }

    let releasedCount = 0;

    // Process each expired match within an isolated transaction
    for (const match of expiredMatches) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Release the buyer Order back to the main queue
          await tx.order.update({
            where: { id: match.orderId },
            data: { status: 'PENDING_FULFILLMENT' }
          });

          // 2. Reroute the seller TradeIn to the central warehouse
          await tx.tradeIn.update({
            where: { id: match.tradeInId },
            data: { status: 'ROUTED_TO_WAREHOUSE' }
          });

          // 3. Mark the P2P Match as cancelled due to timeout
          await tx.p2PMatch.update({
            where: { id: match.id },
            data: { status: 'CANCELLED_TIMEOUT' }
          });
        });
        
        releasedCount++;
      } catch (err) {
        console.error(`Failed to release hold for match ${match.id}:`, err);
        // Continue processing others even if one fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully released ${releasedCount} expired holds.`,
      releasedCount 
    });

  } catch (error) {
    console.error('Daemon execution error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
