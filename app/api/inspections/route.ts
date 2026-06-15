import { NextRequest, NextResponse } from 'next/server';
import { listJourneys } from '@/lib/aws/dynamo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy      = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'highest' | 'lowest';
    const statusFilter = searchParams.get('status') || undefined;

    const inspections = await listJourneys(statusFilter, sortBy);

    return NextResponse.json({ success: true, inspections });
  } catch (error) {
    console.error('Failed to fetch inspections:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inspections' }, { status: 500 });
  }
}
