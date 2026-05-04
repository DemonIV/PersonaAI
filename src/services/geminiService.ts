import { GoogleGenAI } from "@google/genai";
import { HeadshotStyle, Customization } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateHeadshot(
  imageData: string, // base64
  mimeType: string,
  style: HeadshotStyle,
  customization: Customization
): Promise<string> {
  const prompt = `
    ACT AS A PROFESSIONAL PHOTOGRAPHER AND AI EDITOR.
    
    SUBJECT: The person in the provided image.
    GOAL: Generate a new, high-quality, professional headshot of this exact person.
    STYLE: ${style.prompt}
    LIGHTING: ${customization.lighting} (adjust shadows and highlights to match this vibe)
    BACKGROUND: ${customization.background} (incorporate this element into the background design)
    
    POST-PROCESSING REQUIREMENTS:
    - SHARPNESS: ${customization.sharpness}/100 (level of detail and edge definition)
    - SKIN SMOOTHING: ${customization.skinSmoothing}/100 (apply subtle retouching to skin textures for a polished look)
    - CLARITY: ${customization.clarity}/100 (mid-tone contrast adjustment for depth)
    
    INSTRUCTIONS:
    1. Maintain consistent facial features, hair color, and eye color of the person in the original image.
    2. Professional attire (suit, blazer, or smart blouse) should be automatically applied if they are wearing casual clothes.
    3. The lighting should be flattering, studio-grade, and professional.
    4. The background should be perfectly blurred (if applicable) or high-quality studio backdrop.
    5. The final output must be photorealistic, 4k resolution, and look like a real professional portrait.
    6. Ensure the person looks friendly, confident, and approachable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData.split(',')[1] || imageData, // Handle both data URL and raw base64
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image was generated in the response.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
}
