import { NextRequest, NextResponse } from 'next/server';
import { getJourney } from '@/lib/aws/dynamo';

/**
 * GET /api/inspections/[runId]
 *
 * Retrieves a single product journey by runId.
 * Source: DynamoDB (primary) → in-memory fallback when AWS is not configured.
 * MongoDB dependency has been removed.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    if (!runId) {
      return NextResponse.json(
        { success: false, error: 'runId is required' },
        { status: 400 }
      );
    }

    const journey = await getJourney(runId);

    if (!journey) {
      return NextResponse.json(
        { success: false, error: 'Journey not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, journey });
  } catch (error) {
    console.error('[inspections/[runId]] Failed to fetch journey:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch journey' },
      { status: 500 }
    );
  }
}
