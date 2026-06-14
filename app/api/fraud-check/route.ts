import { NextRequest, NextResponse } from 'next/server';
import { calculateEnsembleFraudScore } from '@/lib/fraud/ensemble';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, productCategory, claimNotes, imageUrl, forceFraudSim } = body;
    
    // In a real app, behavioralContext would be fetched from DB using userId
    const result = calculateEnsembleFraudScore(
      userId || 'anonymous', 
      productCategory || 'General', 
      claimNotes || '', 
      imageUrl || '', 
      undefined, // Let it generate synthetic data
      forceFraudSim
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
