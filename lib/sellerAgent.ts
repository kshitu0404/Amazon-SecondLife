import Groq from 'groq-sdk';

// Initialize Groq client. Expects GROQ_API_KEY in environment
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface SellerReturnAnalysis {
  detectedItemName: string;
  damageLevel: 'Pristine' | 'Minor Scratches' | 'Box Damaged' | 'Severe Damage';
  estimatedAgeMonths: number;
  structuralConfidence: number; // 0 to 100
  repairable_flaws: string[];
  step_by_step_restoration_guide: string[];
}

/**
 * Analyzes seller return images using Groq's Vision model.
 * 
 * @param imagesBase64 Array of base64 encoded image strings.
 * @returns Parsed structural analysis of the product including repair logic.
 */
export async function analyzeSellerReturnWithGroq(imagesBase64: string[]): Promise<SellerReturnAnalysis> {
  // Defensive guard: limit to maximum 5 images
  if (!imagesBase64 || imagesBase64.length === 0) {
    throw new Error("No images provided for analysis.");
  }
  
  if (imagesBase64.length > 5) {
    console.warn(`Provided ${imagesBase64.length} images. Limiting to the first 5 to prevent overload.`);
    imagesBase64 = imagesBase64.slice(0, 5);
  }

  try {
    // Construct the message payload with multiple images
    const contentPayload: any[] = [
      {
        type: "text",
        text: `You are an expert product inspector and restoration specialist. Analyze these returned product images and respond with a STRICT JSON object containing exactly the following keys:
- detectedItemName (string): Best guess at the product name.
- damageLevel (string): Must be exactly one of: "Pristine", "Minor Scratches", "Box Damaged", "Severe Damage".
- estimatedAgeMonths (integer): Guess the age in months based on wear.
- structuralConfidence (integer): Confidence in your assessment from 0 to 100.
- repairable_flaws (array of strings): List fixable cosmetic or structural issues found. Empty array if Pristine.
- step_by_step_restoration_guide (array of strings): Ordered list of clear text instructions explaining exactly how a small merchant can fix these specific defects at a workbench. Empty array if Pristine or unfixable.

Return ONLY the raw JSON object, no markdown formatting or backticks.`
      }
    ];

    for (const base64 of imagesBase64) {
      contentPayload.push({
        type: "image_url",
        image_url: {
          url: base64.startsWith('data:image') ? base64 : `data:image/jpeg;base64,${base64}`
        }
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: contentPayload,
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct", 
    });

    const responseContent = completion.choices[0]?.message?.content || "{}";
    
    // Attempt to parse the response
    let parsedData: Partial<SellerReturnAnalysis> = {};
    try {
      // Strip potential markdown wrappers if the model ignores instructions
      const cleanJsonStr = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJsonStr);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", responseContent);
      // Fallback defaults if parsing fails entirely
      return {
        detectedItemName: "Unknown Item",
        damageLevel: "Pristine",
        estimatedAgeMonths: 0,
        structuralConfidence: 10,
        repairable_flaws: [],
        step_by_step_restoration_guide: []
      };
    }

    // Return the sanitized output with safe fallbacks for new array structures
    return {
      detectedItemName: parsedData.detectedItemName || "Unknown Item",
      damageLevel: parsedData.damageLevel as any || "Pristine",
      estimatedAgeMonths: parsedData.estimatedAgeMonths || 0,
      structuralConfidence: parsedData.structuralConfidence || 50,
      repairable_flaws: Array.isArray(parsedData.repairable_flaws) ? parsedData.repairable_flaws : [],
      step_by_step_restoration_guide: Array.isArray(parsedData.step_by_step_restoration_guide) ? parsedData.step_by_step_restoration_guide : []
    };
  } catch (error) {
    console.error("Groq Vision API Error:", error);
    throw new Error("Failed to analyze images with Groq Vision Engine.");
  }
}
