// api/gemini.ts
// IMPORTANT: This is a server-side file. It will be deployed as a Vercel Edge Function.
// DO NOT import this file in any frontend component.

import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { AspectRatio, VideoOperation } from '../types';

// This is a server-side check. Vercel will inject this from environment variables.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set on the server.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using the Edge runtime for best performance on Vercel
export const config = {
  runtime: 'edge',
};

// Main handler for all incoming requests from our frontend
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;

    let result;

    switch (action) {
      case 'generateImageWithImagen':
        result = await generateImageWithImagen(params.prompt, params.negativePrompt, params.aspectRatio);
        break;
      case 'editImageWithGemini':
        result = await editImageWithGemini(params);
        break;
      case 'enhanceImageTo4k':
        result = await enhanceImageTo4k(params.base64ImageData, params.mimeType);
        break;
      case 'removeBackground':
        result = await removeBackground(params.base64ImageData, params.mimeType);
        break;
      case 'generateVideoWithVeo':
        result = await generateVideoWithVeo(params.prompt);
        break;
      case 'getVideosOperation':
        result = await getVideosOperation(params.operation);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in /api/gemini:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// --- Server-Side AI Implementation Functions ---

async function generateImageWithImagen(prompt: string, negativePrompt?: string, aspectRatio: AspectRatio = '1:1') {
    const fullPrompt = negativePrompt?.trim()
      ? `${prompt.trim()}. IMPORTANT: Do NOT include the following elements: "${negativePrompt.trim()}".`
      : prompt.trim();

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return { imageData: response.generatedImages[0].image.imageBytes };
    } else {
      throw new Error("The model did not return any images. Please try a different prompt.");
    }
}

async function editImageWithGemini(params: any) {
  const { base64ImageData, mimeType, prompt, negativePrompt, maskBase64Data, magicToolRequest, styleReferenceBase64, styleReferenceMimeType, isEraseMode } = params;
  const parts: Part[] = [{ inlineData: { data: base64ImageData, mimeType } }];
  let constructedPrompt = prompt;

  if (negativePrompt?.trim()) {
    constructedPrompt += `\n\nIMPORTANT: Do NOT include the following elements: "${negativePrompt.trim()}".`;
  }

  if (styleReferenceBase64 && styleReferenceMimeType) {
      parts.push({ inlineData: { data: styleReferenceBase64, mimeType: styleReferenceMimeType }});
      parts.push({ text: `You are an expert photo editor. The user has provided two images. The first is the one to be edited. The second is a style reference. Apply the artistic style from the reference image to the first image, guided by the user's prompt. User's prompt: "${constructedPrompt}"`})
  } else if (magicToolRequest) {
    parts.push({ text: `Expert photo editor: add a '${magicToolRequest.objectPrompt}' at normalized coordinates (x: ${magicToolRequest.coords.x.toFixed(2)}, y: ${magicToolRequest.coords.y.toFixed(2)}), integrating it seamlessly. User's main prompt: "${constructedPrompt}"` });
  } else if (maskBase64Data) {
    parts.push({ inlineData: { data: maskBase64Data, mimeType: 'image/png' } });
    if (isEraseMode) {
        parts.push({ text: `Expert photo editor: Remove the object in the masked (white) area and realistically fill the background. Do not alter the unmasked (black) area.`});
    } else if (!constructedPrompt.trim()) {
        parts.push({ text: `Expert photo editor: This is a generative fill request. Creatively and realistically fill the masked (white) area based on the surrounding context. Do not alter the unmasked (black) area.` });
    } else {
        parts.push({ text: `Expert photo editor: Apply the user's prompt ONLY to the masked (white) area. Do not alter the unmasked (black) area. User's prompt: "${constructedPrompt}"` });
    }
  } else {
    parts.push({ text: constructedPrompt });
  }

  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image-preview', contents: { parts }, config: { responseModalities: [Modality.IMAGE, Modality.TEXT] } });
  
  let result = { imageData: null, text: '' };
  if (response.candidates && response.candidates.length > 0) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) result.imageData = part.inlineData.data;
      else if (part.text) result.text += part.text;
    }
  }
  if (!result.imageData && !result.text) result.text = "The model returned an empty response. Please try again.";
  return result;
}

async function enhanceImageTo4k(base64ImageData: string, mimeType: string) {
    const parts: Part[] = [
      { inlineData: { data: base64ImageData, mimeType } },
      { text: "Upscale this image to 4K resolution. Enhance details, improve sharpness, and increase clarity to a professional standard. Do not change the content or artistic style of the image." },
    ];
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image-preview', contents: { parts }, config: { responseModalities: [Modality.IMAGE, Modality.TEXT] } });
    let result = { imageData: null, text: '' };
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) result.imageData = part.inlineData.data;
        else if (part.text) result.text += part.text;
      }
    }
    if (!result.imageData) throw new Error(result.text || "The model did not return an enhanced image.");
    result.text = result.text || "Image enhanced to 4K successfully.";
    return result;
}

async function removeBackground(base64ImageData: string, mimeType: string) {
    const parts: Part[] = [
      { inlineData: { data: base64ImageData, mimeType } },
      { text: "Expert photo editor: Identify the main subject and remove the background completely. Output must be a PNG with a transparent background. Do not alter the subject." },
    ];
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image-preview', contents: { parts }, config: { responseModalities: [Modality.IMAGE, Modality.TEXT] } });
    let result = { imageData: null, text: '' };
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) result.imageData = part.inlineData.data;
        else if (part.text) result.text += part.text;
      }
    }
    if (!result.imageData) throw new Error(result.text || "The model did not return an image with the background removed.");
    result.text = result.text || "Background removed successfully.";
    return result;
}

async function generateVideoWithVeo(prompt: string): Promise<VideoOperation> {
    return await ai.models.generateVideos({ model: 'veo-2.0-generate-001', prompt, config: { numberOfVideos: 1 } });
}

async function getVideosOperation(operation: VideoOperation): Promise<VideoOperation> {
    return await ai.operations.getVideosOperation({ operation: operation as any });
}
