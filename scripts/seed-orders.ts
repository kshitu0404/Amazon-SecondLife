import { PrismaClient } from '@prisma/client';
import { cellToLatLng } from 'h3-js';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing Orders and P2P Matches...');
  await prisma.p2PMatch.deleteMany({});
  await prisma.order.deleteMany({});

  console.log('Seeding Orders and P2P Matches...');

  // Get some products and trade-ins
  const products = await prisma.product.findMany({ take: 20 });
  const tradeIns = await prisma.tradeIn.findMany({ take: 20 });

  if (products.length === 0 || tradeIns.length === 0) {
    console.log('No products or trade-ins found. Run prisma/seed.ts first.');
    return;
  }

  // Create Orders
  const statuses = ['PENDING_FULFILLMENT', 'MATCHED_P2P', 'SHIPPED_FROM_WAREHOUSE'];
  let count = 0;

  for (let i = 0; i < tradeIns.length; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const tradeIn = tradeIns[i]; // GUARANTEED UNIQUE

    // 1. Create an Order
    const order = await prisma.order.create({
      data: {
        productId: product.id,
        lat: 34.0522 + (Math.random() - 0.5) * 0.1,
        lng: -118.2437 + (Math.random() - 0.5) * 0.1,
        h3_index: '8828308281fffff',
        status: status,
      }
    });

    // 2. If matched, create P2PMatch
    if (status === 'MATCHED_P2P') {
      const matchStatuses = ['AWAITING_COURIER', 'COURIER_DISPATCHED', 'PICKED_UP', 'DELIVERED'];
      await prisma.p2PMatch.create({
        data: {
          orderId: order.id,
          tradeInId: tradeIn.id,
          status: matchStatuses[Math.floor(Math.random() * matchStatuses.length)],
          trackingUrl: 'https://track.amazon.com/mock-123',
        }
      });
      count++;
    }
  }

  console.log(`Created ${tradeIns.length} Orders and ${count} P2P Matches.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
