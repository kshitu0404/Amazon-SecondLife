import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate database delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return NextResponse.json({
    totals: {
      carbon_saved_kg: 145020.5,
      water_saved_l: 890400.0,
      waste_diverted_kg: 42350.2,
      circular_events: 18450,
    },
    equivalents: {
      driving: 'like not driving 358,961 miles',
      trees: 'equal to 6,661 tree-years of CO₂ absorption',
      phone_charges: '17,472,349 smartphone charges avoided',
    },
    products_given_second_life: 18450,
    second_life_breakdown: {
      listed: 25000,
      sold: 12000,
      donated: 4000,
      resold: 2450
    },
    most_impactful_product: {
      brand: 'Apple',
      title: 'MacBook Pro 16" M2 Max',
      carbon: 345.5,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    },
    top_circular_users: [
      { rank: 1, name: 'Sarah J.', city: 'Seattle', score: 94, tier: 'Legend' },
      { rank: 2, name: 'Michael T.', city: 'Austin', score: 88, tier: 'Legend' },
      { rank: 3, name: 'Emily R.', city: 'Portland', score: 76, tier: 'Champion' },
      { rank: 4, name: 'David K.', city: 'New York', score: 72, tier: 'Champion' },
      { rank: 5, name: 'Jessica W.', city: 'Denver', score: 65, tier: 'Advocate' }
    ],
    recent_activity: [
      { action: 'buy_preloved', product: 'Sony WH-1000XM5', user: 'Alex M.', city: 'Chicago', carbon_saved_kg: 12.4, at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { action: 'donated', product: 'Patagonia Fleece', user: 'Sam B.', city: 'Boulder', carbon_saved_kg: 8.2, at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { action: 'resell', product: 'iPad Air 5th Gen', user: 'Taylor P.', city: 'San Francisco', carbon_saved_kg: 45.1, at: new Date(Date.now() - 1000 * 60 * 32).toISOString() },
      { action: 'repair', product: 'Dyson V11', user: 'Chris L.', city: 'Boston', carbon_saved_kg: 68.9, at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    ],
    live_inspections: [
      { product: 'iPhone 13 Pro', grade: 'A', grade_label: 'Pristine', confidence: 0.98, model: 'Qwen-VL-Max', at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
      { product: 'Nintendo Switch', grade: 'B', grade_label: 'Good', confidence: 0.94, model: 'Qwen-VL-Max', at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
      { product: 'Bose QuietComfort 45', grade: 'A+', grade_label: 'Like New', confidence: 0.99, model: 'Qwen-VL-Max', at: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
    ]
  });
}
