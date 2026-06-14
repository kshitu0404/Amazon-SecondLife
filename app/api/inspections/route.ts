import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('secondlife');
    
    const { searchParams } = new URL(req.url);
    const sortParams = searchParams.get('sort') || 'newest';
    const routeFilter = searchParams.get('route');
    const statusFilter = searchParams.get('status');

    let query: any = {};
    if (routeFilter) query['routingResult.route'] = routeFilter;
    if (statusFilter) query['lifecycleStatus'] = statusFilter;

    let sortOption: any = { createdAt: -1 };
    if (sortParams === 'oldest') sortOption = { createdAt: 1 };
    else if (sortParams === 'highest') sortOption = { 'inspectionReport.overall_condition_score': -1 };
    else if (sortParams === 'lowest') sortOption = { 'inspectionReport.overall_condition_score': 1 };

    const inspections = await db.collection('product_journeys')
      .find(query)
      .sort(sortOption)
      .toArray();

    return NextResponse.json({ success: true, inspections });
  } catch (error) {
    console.error('Failed to fetch inspections:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch inspections' }, { status: 500 });
  }
}
