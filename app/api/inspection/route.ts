import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Part } from '@google/genai';
import type { InspectionReport, InspectionApiResponse } from '@/lib/inspection';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const INSPECTION_PROMPT = `You are an expert product condition inspector for Amazon SecondLife, a circular commerce platform.
You will receive multiple images of a product taken from different angles, along with the product name, category, and any seller-provided condition notes.

Your task is to:
1. Analyze ALL uploaded images together as a holistic view of the product.
2. Identify any visible damage, wear, scratches, dents, discoloration, missing parts, or defects.
3. Compare angles to find inconsistencies or hidden damage.
4. Evaluate how much of the product is covered across all angles.
5. Estimate an overall condition score from 0-100 (100 = like new, 0 = completely destroyed).
6. Estimate a confidence score from 0-100 based on image quality and coverage completeness.
7. Recommend the appropriate circular economy action.

Return ONLY a valid JSON object with no markdown formatting, no code blocks, no extra text before or after. 
The JSON must strictly follow this schema:

{
  "product_name": "string - exact or improved product name based on what you see",
  "overall_condition_score": number between 0 and 100,
  "confidence_score": number between 0 and 100,
  "summary": "string - 2-3 sentence summary of overall condition",
  "defects": [
    {
      "type": "string - defect category e.g. Scratch, Dent, Discoloration, Missing Part, Cracked Screen, etc.",
      "severity": "low or medium or high",
      "description": "string - detailed description of this specific defect",
      "likely_location": "string - where on the product this defect is located"
    }
  ],
  "angle_analysis": [
    {
      "angle": "string - the angle name e.g. Front, Back, Left Side, etc.",
      "observations": "string - detailed observations for this angle",
      "coverage_status": "good or partial or missing"
    }
  ],
  "missing_images_needed": ["string - describe angles or close-ups still needed for full confidence"],
  "final_recommendation": "relist or refurbish or donate or recycle or exchange",
  "reasoning": "string - detailed reasoning for the recommendation",
  "next_actions": ["string - specific actionable next steps"],
  "resale_impact": {
    "estimated_value_change": "string - e.g. -15% to -25% from retail",
    "notes": "string - notes about resale value implications"
  },
  "sustainability_impact": {
    "estimated_co2_saved": "string - estimated CO2 in kg saved by reusing instead of buying new",
    "estimated_waste_diverted": "string - estimated kg of waste diverted from landfill",
    "notes": "string - sustainability context"
  }
}

Be thorough, deterministic, and precise. If you cannot determine something from the images, state that clearly in the relevant field. Do not hallucinate defects not visible in the images. Return ONLY the JSON object.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const productName = formData.get('productName') as string | null;
    const category = formData.get('category') as string | null;
    const conditionNotes = formData.get('conditionNotes') as string | null;

    // Validate required form fields
    if (!productName?.trim()) {
      return NextResponse.json<InspectionApiResponse>(
        { success: false, error: 'Product name is required.' },
        { status: 400 }
      );
    }
    if (!category?.trim()) {
      return NextResponse.json<InspectionApiResponse>(
        { success: false, error: 'Product category is required.' },
        { status: 400 }
      );
    }

    // Collect all uploaded image files
    const imageFiles: File[] = [];
    const imageAngles: string[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
        // Key format: image_0, image_1 ... extract index and map to angle
        const idx = parseInt(key.replace('image_', ''), 10);
        const angleKey = `angle_${idx}`;
        const angle = formData.get(angleKey) as string | null;
        imageAngles.push(angle || `View ${idx + 1}`);
      }
    }

    if (imageFiles.length < 4) {
      return NextResponse.json<InspectionApiResponse>(
        { success: false, error: `At least 4 images are required. You provided ${imageFiles.length}.` },
        { status: 400 }
      );
    }
    if (imageFiles.length > 6) {
      return NextResponse.json<InspectionApiResponse>(
        { success: false, error: 'Maximum 6 images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    for (const file of imageFiles) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json<InspectionApiResponse>(
          { success: false, error: `Unsupported file type: ${file.type}. Please upload JPG, PNG, or WebP images.` },
          { status: 400 }
        );
      }
    }

    // If no Gemini API key, return helpful setup message instead of crashing
    if (!ai) {
      return NextResponse.json<InspectionApiResponse>({
        success: false,
        setup_message: 'Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file to enable AI inspection. Example: GEMINI_API_KEY=your_key_here',
        error: 'GEMINI_API_KEY environment variable is missing.',
      }, { status: 503 });
    }

    // Convert all images to base64 inline data parts for Gemini
    const imageParts: Part[] = await Promise.all(
      imageFiles.map(async (file, idx) => {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        return {
          inlineData: {
            mimeType: file.type,
            data: base64,
          },
        } as Part;
      })
    );

    // Build angle context string
    const angleContext = imageAngles
      .map((angle, idx) => `Image ${idx + 1}: ${angle}`)
      .join(', ');

    // Assemble the prompt with product context
    const contextualPrompt = `${INSPECTION_PROMPT}

Product Context:
- Product Name: ${productName}
- Category: ${category}
- Seller Condition Notes: ${conditionNotes?.trim() || 'No additional notes provided.'}
- Images provided (${imageFiles.length} total): ${angleContext}

Analyze these ${imageFiles.length} images now and return the JSON inspection report.`;

    // Call Gemini Vision with all images + text prompt
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            ...imageParts,
            { text: contextualPrompt },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text?.trim() || '';

    // Safely parse the JSON response from Gemini
    let report: InspectionReport;
    try {
      // Strip any accidental markdown fences just in case
      const cleanText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      report = JSON.parse(cleanText);
    } catch {
      console.error('Failed to parse Gemini response as JSON:', rawText);
      return NextResponse.json<InspectionApiResponse>(
        {
          success: false,
          error: 'AI returned an unparseable response. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<InspectionApiResponse>({ success: true, report });
  } catch (error) {
    console.error('Inspection API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    return NextResponse.json<InspectionApiResponse>(
      { success: false, error: `Inspection failed: ${message}` },
      { status: 500 }
    );
  }
}
