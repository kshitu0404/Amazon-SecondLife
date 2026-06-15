import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const cat = category?.toLowerCase();

    if (cat === 'apparel') {
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

    if (cat === 'shoes') {
      return NextResponse.json({
        confidenceScore: 92,
        recommendedSize: "12",
        fitPrediction: "Runs slightly narrow",
        reasoning: "Based on your 3D foot scan and previous returns of Nike and Converse shoes, size 12 will provide optimal arch support and toe-box room.",
        alternativeSizes: [
          { size: "11.5", tradeoff: "May pinch at the toes" },
          { size: "12.5", tradeoff: "Heel slippage likely" }
        ]
      });
    }

    return NextResponse.json(null); // Not applicable
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch size advice.' }, { status: 500 });
  }
}
