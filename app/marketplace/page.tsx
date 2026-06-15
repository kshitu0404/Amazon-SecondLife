import React from 'react';
import prisma from '@/lib/prisma';
import MarketplaceClient from './MarketplaceClient';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const page = parseInt(params.page as string || '1', 10);
  const pageSize = 24;
  const skip = (page - 1) * pageSize;

  // Build the where clause based on filters
  const where: any = { status: 'LIVE_ON_MARKETPLACE' };
  
  if (params.category && params.category !== 'All') {
    where.product = { ...where.product, category: params.category };
  }

  if (params.maxPrice) {
    where.product = { 
      ...where.product, 
      price: { lte: parseFloat(params.maxPrice as string) } 
    };
  }
  
  if (params.brand && params.brand !== 'All') {
    where.product = { ...where.product, brand: params.brand };
  }

  if (params.condition && params.condition !== 'All') {
    where.condition = params.condition;
  }
  
  if (params.search) {
    const search = params.search as string;
    where.product = {
      ...where.product,
      name: { contains: search }
    };
  }
  
  if (params.location && params.location !== 'All') {
    where.city = params.location;
  }

  // Fetch live items from the database with pagination
  const [liveItems, totalCount] = await Promise.all([
    prisma.tradeIn.findMany({
      where,
      include: { 
        product: true, 
        productHealthCard: true 
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.tradeIn.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // We need distinct brands and locations for the filters
  const [brands, locations] = await Promise.all([
    prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
      where: { brand: { not: null } }
    }),
    prisma.tradeIn.findMany({
      select: { city: true },
      distinct: ['city'],
      where: { city: { not: null }, status: 'LIVE_ON_MARKETPLACE' }
    })
  ]);

  const uniqueBrands = brands.map(b => b.brand).filter(Boolean) as string[];
  const uniqueLocations = locations.map(l => l.city).filter(Boolean) as string[];

  return (
    <MarketplaceClient 
      initialItems={liveItems} 
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={page}
      uniqueBrands={uniqueBrands}
      uniqueLocations={uniqueLocations}
    />
  );
}
