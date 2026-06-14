import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate slight network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const activity = [
      { id: 1, action: "listed", product: "Apple Watch Series 7", price: 215, time: "10 mins ago", status: "Active" },
      { id: 2, action: "repriced", product: "Patagonia Better Sweater", price: 115, time: "45 mins ago", status: "Optimized" },
      { id: 3, action: "donated", product: "Amazon Echo Dot (3rd Gen)", price: 0, time: "2 hours ago", status: "Routed" },
      { id: 4, action: "listed", product: "Sony A7III Camera Body", price: 1450, time: "5 hours ago", status: "Active" }
    ];

    return NextResponse.json({ activity });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
