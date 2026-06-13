import * as h3 from 'h3-js';
import prisma from './prisma';

export interface MatchResult {
  success: boolean;
  ringSize?: number;
  match?: any;
  reason?: string;
  courierPayload?: any;
}

/**
 * Core Logic Module: Dynamic Radius Matcher
 * 
 * Performs an asynchronous dynamic, expanding radius search across real-world coordinate pairs.
 * It starts at ring size k=0 (same hexagon), and incrementally expands up to k=3 (~3km radius).
 * Looks for an active, unfulfilled order matching the specific product_id.
 */
export async function findHyperlocalBuyerMatch(
  tradeInId: string, 
  productId: string, 
  senderH3: string,
  senderLat: number,
  senderLng: number
): Promise<MatchResult> {
  const MAX_K_RING = 3;

  try {
    // Search incrementally across rings to prioritize the closest possible buyer
    for (let k = 0; k <= MAX_K_RING; k++) {
      // In h3-js v4+, gridDisk replaces kRing.
      const currentRingHexes = h3.gridDisk(senderH3, k);

      // Execute inside an isolated Prisma transaction to prevent race conditions 
      // where two incoming trade-ins might grab the exact same pending order.
      const match = await prisma.$transaction(async (tx) => {
        // 1. Find the first available pending order for this product in these specific hexes
        const availableOrder = await tx.order.findFirst({
          where: {
            productId: productId,
            status: 'PENDING_FULFILLMENT',
            h3_index: {
              in: currentRingHexes,
            },
          },
          orderBy: {
            createdAt: 'asc', // FIFO: fulfill older orders first
          },
        });

        // If nothing is found in this ring, skip and move to the next expansion ring
        if (!availableOrder) {
          return null;
        }

        // 2. We found a match! Lock the order by updating its status
        const updatedOrder = await tx.order.update({
          where: { id: availableOrder.id },
          data: { status: 'MATCHED_P2P' },
        });

        // 3. Lock the trade-in item as well
        const updatedTradeIn = await tx.tradeIn.update({
          where: { id: tradeInId },
          data: { status: 'MATCHED_P2P' },
        });

        // 4. Create the overarching P2P match record bridging them
        const p2pMatch = await tx.p2PMatch.create({
          data: {
            orderId: availableOrder.id,
            tradeInId: tradeInId,
            status: 'AWAITING_COURIER',
          },
        });

        return { p2pMatch, order: updatedOrder, tradeIn: updatedTradeIn };
      });

      // If the transaction succeeded and returned a match, we halt the expansion and return!
      if (match) {
        // Mock a dispatch payload to a Third-Party Logistics (3PL) on-demand courier API (e.g. Uber Direct)
        const mockCourierPayload = {
          dispatchProvider: 'Uber Direct',
          trackingUrl: `https://track.uber.direct/mock-${match.p2pMatch.id}`,
          pickup: { lat: senderLat, lng: senderLng },
          dropoff: { lat: match.order.lat, lng: match.order.lng },
          estimatedDeliveryMinutes: 45 + (k * 10), // Base 45 min + 10 min per hex ring expansion
        };

        // Persist the tracking stub back to our database
        await prisma.p2PMatch.update({
          where: { id: match.p2pMatch.id },
          data: { trackingUrl: mockCourierPayload.trackingUrl },
        });

        return {
          success: true,
          ringSize: k,
          match: match.p2pMatch,
          courierPayload: mockCourierPayload
        };
      }
    }

    // If loop finishes without returning, no match was found in the maximum radius.
    // Trigger fallback system (route back to central warehouse)
    
    // Update TradeIn to standard warehouse routing
    await prisma.tradeIn.update({
      where: { id: tradeInId },
      data: { status: 'ROUTED_TO_WAREHOUSE' },
    });

    return {
      success: false,
      reason: 'NO_MATCH_FOUND_IN_RADIUS_FALLBACK_TRIGGERED',
      courierPayload: {
        dispatchProvider: 'Amazon Internal Logistics',
        destination: 'Central Processing Warehouse',
        trackingUrl: `https://amazon.in/returns/track/${tradeInId}`
      }
    };

  } catch (error) {
    console.error("Critical error inside Matcher logic: ", error);
    throw new Error("Matcher failed due to internal error.");
  }
}
