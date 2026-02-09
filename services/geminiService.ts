
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
    Aja como um fotógrafo profissional de joias de luxo.
    OBJETIVO: Criar uma foto de catálogo perfeita.
    
    INSTRUÇÕES:
    1. Pegue a JOIA da 'Imagem do Produto'.
    2. Aplique o ESTILO, ILUMINAÇÃO e FUNDO da 'Imagem de Referência'.
    3. Preserve a geometria exata, cor e detalhes da joia original.
    4. O resultado deve ser uma composição fotorrealista de alta qualidade em formato ${ratioInstruction}.
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

  // Itera pelas partes para encontrar a imagem conforme as diretrizes
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("A IA não retornou uma imagem válida. Tente novamente.");
};

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
        { text: `Edit instructions: ${instructions}` }
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
