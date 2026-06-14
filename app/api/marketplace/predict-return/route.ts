import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { behavior, context, category } = body;

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate mock prediction based on category
    let riskLevel = "LOW";
    let returnProbability = 12;
    let topFactors = ["Item condition aligns with description", "User has low return history"];
    let recommendations = ["Offer standard 30-day return policy"];

    if (category?.toLowerCase() === 'apparel' || category?.toLowerCase() === 'apparel/fashion') {
      riskLevel = "MEDIUM";
      returnProbability = 38;
      topFactors = ["Sizing variance reported for this brand", "High return rate for this category"];
      recommendations = ["Highlight size chart", "Offer 'Fit Guarantee' credit instead of cash return"];
    } else if (behavior?.timeOnPage < 10) {
      riskLevel = "HIGH";
      returnProbability = 75;
      topFactors = ["Impulse buy detected (short session)", "No questions asked or descriptions read"];
      recommendations = ["Implement 'Are you sure?' confirmation", "Delay shipping by 2 hours to allow cancellation"];
    }

    return NextResponse.json({
      riskLevel,
      returnProbability,
      topFactors,
      recommendations
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to predict return intent.' }, { status: 500 });
  }
}
