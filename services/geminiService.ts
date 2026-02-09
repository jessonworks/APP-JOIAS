
import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY não configurada no ambiente.");
  }
  return new GoogleGenAI({ apiKey });
};

const stripBase64Prefix = (base64: string): string => {
  if (!base64) return '';
  return base64.split(',')[1] || base64;
};

export const generateCatalogImage = async (
  productImageBase64: string,
  productMimeType: string,
  referenceImageBase64: string,
  referenceMimeType: string,
  ratio: AspectRatio
): Promise<string> => {
  const ai = getAiClient();
  
  const ratioInstruction = ratio === AspectRatio.STORY ? "9:16" : "1:1";

  const prompt = `
    TASK: High-End Jewelry Catalog Composite.
    
    INPUTS:
    - 'Product Image': A piece of jewelry.
    - 'Reference Image': The desired background, lighting, and mood.
    
    STRICT RULES:
    1. EXTRACT the jewelry from 'Product Image' with pixel-perfect precision.
    2. PRESERVE original materials: if it is 18k Gold, keep it gold. Do not change gemstone colors or clarity.
    3. MAINTAIN the exact shape and facets of the jewelry.
    4. PLACE the jewelry into the environment of the 'Reference Image'.
    5. MATCH the lighting, shadows, and reflections of the reference onto the jewelry surfaces to make it look realistic.
    6. OUTPUT: A professional, ultra-realistic 4k jewelry photography shot in ${ratioInstruction} aspect ratio.
    7. DO NOT add hands, necks, or models unless they are present in the reference image.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: stripBase64Prefix(productImageBase64), mimeType: productMimeType } },
        { inlineData: { data: stripBase64Prefix(referenceImageBase64), mimeType: referenceMimeType } },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: ratio === AspectRatio.STORY ? "9:16" : "1:1"
      }
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("A IA não conseguiu processar a imagem. Tente uma referência com iluminação mais clara.");
};

export const generateCreativeImage = async (
  prompt: string,
  ratio: AspectRatio
): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `Professional high-end jewelry photography: ${prompt}. Cinematic lighting, macro shot, 8k resolution, elegant background.`,
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
  throw new Error("Erro ao gerar imagem criativa.");
};

export const editImage = async (
  imageBase64: string,
  mimeType: string,
  instructions: string
): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: stripBase64Prefix(imageBase64), mimeType: mimeType } },
        { text: `Modify this jewelry photo following these instructions: ${instructions}. Keep the jewelry details sharp and realistic.` }
      ]
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("Erro ao editar imagem.");
};
