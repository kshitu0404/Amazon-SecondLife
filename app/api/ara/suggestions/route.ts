import { NextResponse } from 'next/server';
import { scanInventory } from '@/lib/araAgent';

export async function GET() {
  try {
    // Simulate slight network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const plan = await scanInventory();
    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to scan inventory' }, { status: 500 });
  }
}
