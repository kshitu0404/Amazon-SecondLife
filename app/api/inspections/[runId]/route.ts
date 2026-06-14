import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    if (!runId) {
      return NextResponse.json({ success: false, error: 'runId is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('secondlife');
    const journey = await db.collection('product_journeys').findOne({ runId });

    if (!journey) {
      return NextResponse.json({ success: false, error: 'Journey not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, journey });
  } catch (error) {
    console.error('Failed to fetch journey:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch journey' }, { status: 500 });
  }
}
