import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { uploadImageToS3, buildInspectionImageKey } from '@/lib/aws/s3';
import { saveJourney } from '@/lib/aws/dynamo';
import { logger } from '@/lib/aws/cloudwatch';
import type { InspectionReport, InspectionApiResponse, ProductJourney, StatusEvent } from '@/lib/inspection';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = apiKey ? new Groq({ apiKey }) : null;

const INSPECTION_PROMPT = `You are an expert product condition inspector for Amazon SecondLife, a circular commerce platform.
You will receive multiple images of a product taken from different angles, along with the product name, category, and any seller-provided condition notes.

Your task is to:
1. Analyze ALL uploaded images together as a holistic view of the product.
2. Identify any visible damage, wear, scratches, dents, discoloration, missing parts, or defects.
3. Compare angles to find inconsistencies or hidden damage.
4. Estimate an overall condition score from 0.0 to 1.0 (1.0 = like new, 0.0 = completely destroyed).
5. Determine if the product is approved for resale based on its integrity.

You MUST return a valid JSON object matching this exact schema:
{
  "is_approved": boolean,
  "condition_score": float,
  "detected_flaws": ["string"]
}

Return ONLY the JSON object. Do not wrap in markdown or add explanations outside the JSON structure.`;

export async function POST(req: NextRequest) {
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    const formData = await req.formData();

    const productName    = formData.get('productName')    as string | null;
    const category       = formData.get('category')       as string | null;
    const conditionNotes = formData.get('conditionNotes') as string | null;

    if (!productName?.trim() || !category?.trim()) {
      return NextResponse.json<InspectionApiResponse>(
        { success: false, error: 'Product name and category are required.' },
        { status: 400 }
      );
    }

    // Collect uploaded images
    const imageFiles: File[]    = [];
    const imageAngles: string[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        imageFiles.push(value);
        const idx   = parseInt(key.replace('image_', ''), 10);
        const angle = formData.get(`angle_${idx}`) as string | null;
        imageAngles.push(angle || `View ${idx + 1}`);
      }
    }

    if (imageFiles.length > 5) {
      return NextResponse.json<InspectionApiResponse>(
        { success: false, error: 'Maximum 5 images are allowed.' },
        { status: 400 }
      );
    }
    if (imageFiles.length < 1) {
      return NextResponse.json<InspectionApiResponse>(
        { success: false, error: 'At least 1 image is required for inspection.' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    for (const file of imageFiles) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json<InspectionApiResponse>(
          { success: false, error: `Unsupported file type: ${file.type}. Use JPG, PNG, or WebP.` },
          { status: 400 }
        );
      }
    }

    if (!groq) {
      return NextResponse.json<InspectionApiResponse>({
        success: false,
        setup_message: 'Groq API key is not configured. Add GROQ_API_KEY to your .env.local file.',
        error: 'GROQ_API_KEY environment variable is missing.',
      }, { status: 503 });
    }

    // ── Upload images to S3 (falls back to base64 locally) ─────────────────
    const imageUrls: string[] = [];
    const contentParts: any[] = [];

    await Promise.all(
      imageFiles.map(async (file, idx) => {
        const bytes  = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext    = file.type.split('/')[1] ?? 'jpg';

        // Upload to S3 (or get base64 locally)
        const s3Key  = buildInspectionImageKey(runId, idx, imageAngles[idx], ext);
        const url    = await uploadImageToS3(buffer, file.type, s3Key);
        imageUrls[idx] = url;

        // Groq still needs base64 inline data for vision inference
        const base64 = buffer.toString('base64');
        contentParts.push({
          type: 'image_url',
          image_url: { url: `data:${file.type};base64,${base64}` },
        });
      })
    );

    await logger.info('inspection-api', {
      runId,
      productName,
      category,
      imageCount: imageFiles.length,
      s3Uploaded: imageUrls.length,
    });

    // ── Build the Groq prompt ────────────────────────────────────────────────
    const angleContext = imageAngles.map((a, i) => `Image ${i + 1}: ${a}`).join(', ');
    const contextualPrompt = `${INSPECTION_PROMPT}\n\nProduct Context:\n- Name: ${productName}\n- Category: ${category}\n- Notes: ${conditionNotes || 'None'}\n- Angles: ${angleContext}`;

    contentParts.unshift({ type: 'text', text: contextualPrompt });

    // ── Call Groq vision ─────────────────────────────────────────────────────
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: contentParts }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const rawText = response.choices[0]?.message?.content?.trim() || '';

    let report: InspectionReport;
    try {
      const groqReport = JSON.parse(rawText);

      report = {
        product_name: productName,
        overall_condition_score: Math.round((groqReport.condition_score || 0) * 100),
        confidence_score: 95,
        summary: groqReport.is_approved
          ? 'Item has passed Llama-4 structural integrity inspection.'
          : 'Item failed inspection due to detected flaws.',
        defects: (groqReport.detected_flaws || []).map((flaw: string) => ({
          type: 'Detected Flaw',
          severity: 'medium' as const,
          description: flaw,
          likely_location: 'General',
        })),
        angle_analysis: [],
        missing_images_needed: [],
        final_recommendation: groqReport.is_approved ? 'relist' : 'recycle',
        reasoning: 'Groq Llama-4 rapid inference determined this status.',
        next_actions: ['Proceed with logistics routing.'],
        resale_impact: { estimated_value_change: 'Standard', notes: 'Llama-4 estimate' },
        sustainability_impact: {
          estimated_co2_saved: '15 kg',
          estimated_waste_diverted: '2 kg',
          notes: 'Groq Fast Vision',
        },
      };
    } catch {
      await logger.error('inspection-api', { runId, error: 'Failed to parse Groq JSON', rawText });
      return NextResponse.json<InspectionApiResponse>(
        { success: false, error: 'AI returned an unparseable response.' },
        { status: 500 }
      );
    }

    // ── Persist journey to DynamoDB (falls back to in-memory locally) ────────
    const now = new Date().toISOString();
    const statusHistory: StatusEvent[] = [
      { status: 'UPLOADED',  timestamp: now, note: 'Images uploaded via S3',   actor: 'System' },
      { status: 'INSPECTED', timestamp: now, note: 'AI inspection completed',   actor: 'Groq Llama-4' },
    ];

    const journey: ProductJourney = {
      runId,
      productName,
      category,
      conditionNotes: conditionNotes || '',
      uploadedImages: imageUrls,   // S3 URLs (or base64 locally)
      inspectionReport: report,
      lifecycleStatus: 'INSPECTED',
      statusHistory,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveJourney(journey);
    } catch (dbErr) {
      await logger.warn('inspection-api', { runId, warning: 'Failed to save journey', error: String(dbErr) });
    }

    return NextResponse.json<InspectionApiResponse>({ success: true, report, runId });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    await logger.error('inspection-api', { runId, error: message });
    return NextResponse.json<InspectionApiResponse>(
      { success: false, error: `Inspection failed: ${message}` },
      { status: 500 }
    );
  }
}
