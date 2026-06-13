import React from 'react';
import prisma from '@/lib/prisma';
import MarketplaceClient from './MarketplaceClient';

export default async function MarketplacePage() {
  // Fetch live items from the database
  const liveItems = await prisma.tradeIn.findMany({
    where: { status: 'LIVE_ON_MARKETPLACE' },
    include: { 
      product: true, 
      productHealthCard: true 
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <MarketplaceClient initialItems={liveItems} />
  );
}
