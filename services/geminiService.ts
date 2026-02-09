import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to convert base64 string to proper format if needed, 
 * though the SDK often takes raw base64 without the data URL prefix in some contexts.
 * For this SDK, inlineData expects the raw base64 string (without 'data:image/png;base64,').
 */
const stripBase64Prefix = (base64: string): string => {
  if (!base64) return '';
  return base64.split(',')[1] || base64;
};

/**
 * Generates a jewelry catalog image based on a source product and a style reference.
 * Uses gemini-2.5-flash-image (Nano Banana) for multimodal composition.
 */
export const generateCatalogImage = async (
  productImageBase64: string,
  productMimeType: string,
  referenceImageBase64: string,
  referenceMimeType: string,
  ratio: AspectRatio
): Promise<string> => {
  if (!productMimeType) throw new Error("O formato da imagem da joia não foi reconhecido.");
  if (!referenceMimeType) throw new Error("O formato da imagem de referência não foi reconhecido.");

  const ai = getAiClient();
  
  const ratioInstruction = ratio === AspectRatio.STORY 
    ? "vertical aspect ratio (9:16)" 
    : "square aspect ratio (1:1)";

  // Prompt engineering to strictly enforce size constraints
  const prompt = `
    You are a professional jewelry photographer and editor.
    
    Input Images:
    1. Product Image: A photo of a jewelry piece.
    2. Reference Image: A photo showing the desired style, background, and mood.

    Task:
    Create a COMPOSITE image.
    Take the jewelry piece from the Product Image and place it into a scene that matches the style/background of the Reference Image.

    Requirements:
    - PRESERVE THE JEWELRY: The physical shape, gemstone size, and metal details of the product must remain exactly as in the Product Image. Do not warp or resize the jewelry disproportionately.
    - MATCH STYLE: The lighting, shadows, and background should perfectly mimic the Reference Image.
    - OUTPUT FORMAT: Generate the result in a ${ratioInstruction}.
    - QUALITY: Photorealistic, high resolution, catalog quality.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: stripBase64Prefix(productImageBase64),
            mimeType: productMimeType
          }
        },
        {
          inlineData: {
            data: stripBase64Prefix(referenceImageBase64),
            mimeType: referenceMimeType
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseModalities: [Modality.IMAGE],
    }
  });

  // Flash Image (Nano Banana) returns generated images in the candidates content parts
  const part = response.candidates?.[0]?.content?.parts?.[0];
  
  if (part) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    // Handle refusal or text response which explains why image wasn't generated
    if (part.text) {
      console.warn("Model returned text instead of image:", part.text);
      throw new Error(`A IA não conseguiu gerar a imagem. Resposta da IA: ${part.text}`);
    }
  }

  throw new Error("O Gemini não retornou nenhuma imagem ou explicação. Tente novamente.");
};

/**
 * Generates a new image from scratch using text prompts.
 * Uses imagen-4.0-generate-001 (Imagen 3/4).
 */
export const generateCreativeImage = async (
  prompt: string,
  ratio: AspectRatio
): Promise<string> => {
  const ai = getAiClient();

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: ratio,
    }
  });

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (imageBytes) {
    return `data:image/jpeg;base64,${imageBytes}`;
  }

  throw new Error("O Imagen não conseguiu gerar a imagem. Tente um prompt diferente.");
};

/**
 * Edits an existing image based on instructions.
 * Uses gemini-2.5-flash-image.
 */
export const editImage = async (
  imageBase64: string,
  mimeType: string,
  instructions: string
): Promise<string> => {
  if (!mimeType) throw new Error("O formato da imagem não foi reconhecido.");

  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: stripBase64Prefix(imageBase64),
            mimeType: mimeType
          }
        },
        { text: `Edit instructions: ${instructions}. Maintain high resolution and photorealism.` }
      ]
    },
    config: {
      responseModalities: [Modality.IMAGE],
    }
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  
  if (part) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    if (part.text) {
        console.warn("Model returned text instead of image:", part.text);
        throw new Error(`A IA não pôde editar a imagem. Motivo: ${part.text}`);
    }
  }

  throw new Error("Nenhuma imagem editada foi retornada. Tente instruções mais simples.");
};