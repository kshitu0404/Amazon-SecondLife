import React from 'react';
import prisma from '@/lib/prisma';
import SmartMarketplaceClient from './SmartMarketplaceClient';

export const dynamic = 'force-dynamic';

export default async function SmartMarketplacePage() {
  // Fetch active marketplace products with geodata
  const tradeIns = await prisma.tradeIn.findMany({
    where: { status: 'LIVE_ON_MARKETPLACE' },
    include: {
      product: true,
      productHealthCard: true
    },
    take: 150
  });

  // Map database records to the smart map format
  const mappedProducts = tradeIns.map(ti => {
    // Generate some mock AI data based on the condition
    const isGood = ti.condition.toLowerCase().includes('like new') || ti.condition.toLowerCase().includes('good');
    const isModerate = ti.condition.toLowerCase().includes('fair');
    
    let grade = 'C';
    let trustScore = 75;
    let returnReason = "Customer changed their mind or didn't like the color.";
    let co2Saved = 12.5;

    if (isGood) {
      grade = 'B';
      trustScore = 92;
      co2Saved = 18.2;
    } else if (!isGood && !isModerate) {
      grade = 'D';
      trustScore = 65;
      returnReason = "Moderate cosmetic damage, but fully functional after repair.";
      co2Saved = 8.5;
    } else {
      grade = 'C';
      trustScore = 80;
      returnReason = "Slight wear and tear, returned after 14 days of use.";
    }

    // Force Indian Geolocation for Map Demo
    const indianCities = [
      { city: "Mumbai, MH", lat: 19.0760, lng: 72.8777 },
      { city: "Delhi, DL", lat: 28.7041, lng: 77.1025 },
      { city: "Bangalore, KA", lat: 12.9716, lng: 77.5946 },
      { city: "Hyderabad, TS", lat: 17.3850, lng: 78.4867 },
      { city: "Chennai, TN", lat: 13.0827, lng: 80.2707 },
      { city: "Kolkata, WB", lat: 22.5726, lng: 88.3639 },
      { city: "Pune, MH", lat: 18.5204, lng: 73.8567 },
      { city: "Ahmedabad, GJ", lat: 23.0225, lng: 72.5714 }
    ];
    
    const hash = ti.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const location = indianCities[hash % indianCities.length];
    const latJitter = ((hash % 100) - 50) * 0.005; // ~5km spread
    const lngJitter = (((hash * 3) % 100) - 50) * 0.005;

    return {
      id: ti.id,
      name: ti.product.name,
      image: ti.product.image,
      price: Math.floor(ti.product.price * (grade === 'B' ? 0.7 : grade === 'C' ? 0.5 : 0.3)), // discount
      originalPrice: ti.product.price,
      grade,
      city: location.city,
      lat: location.lat + latJitter,
      lng: location.lng + lngJitter,
      returnReason,
      trustScore,
      co2Saved
    };
  });

  return (
    <div className="min-h-screen pb-20 text-slate-900 font-sans">
      <SmartMarketplaceClient initialProducts={mappedProducts} />
    </div>
  );
}
