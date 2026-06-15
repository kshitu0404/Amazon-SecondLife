'use server';

import prisma from '@/lib/prisma';

export async function getLifecycleData(tradeInId?: string) {
  let tradeIn;
  
  if (tradeInId) {
    tradeIn = await prisma.tradeIn.findUnique({
      where: { id: tradeInId },
      include: { product: true, productHealthCard: true }
    });
  } else {
    // If no ID provided, grab the first one that is LIVE_ON_MARKETPLACE for a robust demo
    tradeIn = await prisma.tradeIn.findFirst({
      where: { status: 'LIVE_ON_MARKETPLACE' },
      include: { product: true, productHealthCard: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  if (!tradeIn) return null;

  return {
    id: tradeIn.id,
    productId: tradeIn.product.id,
    productName: tradeIn.product.name,
    productImage: tradeIn.product.image || "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80",
    price: tradeIn.product.price,
    condition: tradeIn.condition,
    sellerNotes: tradeIn.sellerNotes,
    grade: tradeIn.productHealthCard?.conditionScore ? (tradeIn.productHealthCard.conditionScore > 80 ? 'B' : 'C') : 'B',
    healthCard: tradeIn.productHealthCard,
    location: `${tradeIn.city || 'Seattle'}, ${tradeIn.state || 'WA'}`,
    createdAt: tradeIn.createdAt,
    updatedAt: tradeIn.updatedAt,
    status: tradeIn.status
  };
}
