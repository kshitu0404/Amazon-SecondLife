import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Routing — delivery estimate + CO2 offset.
 *
 * Uses deterministic logic instead of an LLM call to avoid burning Groq
 * tokens on every product card render.  Output contract is identical to
 * the previous Groq-powered version so the frontend requires no changes.
 */

// Rough distance tiers between major Indian cities (km, symmetric)
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  delhi:   { mumbai: 1415, bangalore: 2150, hyderabad: 1575, chennai: 2175, kolkata: 1450, pune: 1410, delhi: 0 },
  mumbai:  { delhi: 1415, bangalore: 980, hyderabad: 710, chennai: 1330, kolkata: 1980, pune: 150, mumbai: 0 },
  bangalore: { delhi: 2150, mumbai: 980, hyderabad: 570, chennai: 350, kolkata: 1870, pune: 830, bangalore: 0 },
  hyderabad: { delhi: 1575, mumbai: 710, bangalore: 570, chennai: 625, kolkata: 1495, pune: 560, hyderabad: 0 },
  chennai: { delhi: 2175, mumbai: 1330, bangalore: 350, hyderabad: 625, kolkata: 1660, pune: 1180, chennai: 0 },
  kolkata: { delhi: 1450, mumbai: 1980, bangalore: 1870, hyderabad: 1495, chennai: 1660, pune: 1930, kolkata: 0 },
  pune:    { delhi: 1410, mumbai: 150, bangalore: 830, hyderabad: 560, chennai: 1180, kolkata: 1930, pune: 0 },
};

function normCity(city: string): string {
  return city.toLowerCase().trim().replace(/\s+/g, '');
}

function estimateDistance(from: string, to: string): number {
  const f = normCity(from);
  const t = normCity(to);
  if (f === t) return 0;
  return CITY_DISTANCES[f]?.[t] ?? CITY_DISTANCES[t]?.[f] ?? 800; // default 800km
}

function formatDeliveryDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userCity: string      = body.userCity      || 'Unknown';
    const warehouseCity: string = body.warehouseCity || 'Delhi';
    const userPincode: string   = body.userPincode   || '';

    const distanceKm = estimateDistance(warehouseCity, userCity);
    const isLocal    = distanceKm < 50;

    // Delivery days: same city 1d, <300km 2d, <800km 3d, else 4–5d
    let days: number;
    if (distanceKm === 0 || isLocal) days = 1;
    else if (distanceKm < 300)       days = 2;
    else if (distanceKm < 800)       days = 3;
    else if (distanceKm < 1500)      days = 4;
    else                              days = 5;

    // CO2 offset: second-hand products save ~70% vs new manufacturing;
    // add a small routing bonus for shorter distances
    const routingBonus = Math.max(0, (1500 - distanceKm) / 1500) * 3;
    const co2Offset    = Math.round((4.5 + routingBonus) * 10) / 10;

    const diagnostics = [
      'Optimized via nearest circular hub',
      'Green route selected — minimal carbon footprint',
      'SecondLife logistics network engaged',
      'Eco-priority lane assigned',
    ];
    const routingDiagnostic = diagnostics[days % diagnostics.length];

    return NextResponse.json({
      days,
      dateString:        formatDeliveryDate(days),
      isLocal,
      co2Offset,
      routingDiagnostic,
    });
  } catch (error) {
    console.error('AI routing error:', error);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    return NextResponse.json({
      days:              3,
      dateString:        deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }),
      isLocal:           false,
      co2Offset:         5.2,
      routingDiagnostic: 'Standard routing applied.',
    });
  }
}
