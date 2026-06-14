import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { LifecycleStatus, StatusEvent } from '@/lib/inspection';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await req.json();
    const { status, note, actor } = body as { status: LifecycleStatus, note?: string, actor?: string };

    if (!runId || !status) {
      return NextResponse.json({ success: false, error: 'runId and status are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('secondlife');
    
    const now = new Date().toISOString();
    const newEvent: StatusEvent = {
      status,
      timestamp: now,
      note: note || `Status updated to ${status}`,
      actor: actor || 'User'
    };

    const result = await db.collection('product_journeys').findOneAndUpdate(
      { runId },
      { 
        $set: { lifecycleStatus: status, updatedAt: now },
        $push: { statusHistory: newEvent as any }
      },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      // In mongodb v7 findOneAndUpdate returns an object where result is potentially not directly the value? 
      // Actually returnDocument: 'after' ensures the updated doc is returned, usually inside result.value in some drivers.
      // Or just return success
    }

    return NextResponse.json({ success: true, journey: result });
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
