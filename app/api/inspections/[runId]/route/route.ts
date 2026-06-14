import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { StatusEvent } from '@/lib/inspection';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await req.json();
    const { routingResult } = body;

    if (!runId || !routingResult) {
      return NextResponse.json({ success: false, error: 'runId and routingResult are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('secondlife');
    
    const now = new Date().toISOString();
    const newEvent: StatusEvent = {
      status: 'ROUTED',
      timestamp: now,
      note: `Automated routing decision: ${routingResult.route}`,
      actor: 'Smart Logistics Engine'
    };

    await db.collection('product_journeys').updateOne(
      { runId },
      { 
        $set: { 
          routingResult, 
          lifecycleStatus: 'ROUTED', 
          updatedAt: now 
        },
        $push: { statusHistory: newEvent as any }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update route:', error);
    return NextResponse.json({ success: false, error: 'Failed to update route' }, { status: 500 });
  }
}
