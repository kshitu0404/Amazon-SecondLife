import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (category?.toLowerCase() === 'apparel') {
      return NextResponse.json({
        confidenceScore: 88,
        recommendedSize: "M",
        fitPrediction: "True to size",
        reasoning: "Based on your previous Amazon purchases and returns in this category, Medium provides the optimal chest-to-shoulder ratio for this brand.",
        alternativeSizes: [
          { size: "S", tradeoff: "Tighter fit around shoulders" },
          { size: "L", tradeoff: "Loose and baggy" }
        ]
      });
    }

    return NextResponse.json(null); // Not applicable
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch size advice.' }, { status: 500 });
  }
}
