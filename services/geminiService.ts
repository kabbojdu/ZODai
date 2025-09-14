
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";
import type { AspectRatio, VideoOperation } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface EditImageResult {
  imageData: string | null;
  text: string;
}

export interface MagicToolRequest {
  objectPrompt: string;
  coords: { x: number; y: number };
}

export const generateImageWithImagen = async (
  prompt: string,
  negativePrompt?: string,
  aspectRatio: AspectRatio = '1:1'
): Promise<string> => {
  try {
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
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("The model did not return any images. Please try a different prompt.");
    }

  } catch (error) {
    console.error("Imagen API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image with AI: ${error.message}`);
    }
    throw new Error("Failed to generate image with AI. Please check the console for details.");
  }
};

export const editImageWithGemini = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  negativePrompt?: string,
  maskBase64Data?: string,
  magicToolRequest?: MagicToolRequest,
  styleReferenceBase64?: string,
  styleReferenceMimeType?: string,
  isEraseMode?: boolean,
): Promise<EditImageResult> => {
  try {
    const parts: Part[] = [
      { inlineData: { data: base64ImageData, mimeType } },
    ];
    
    let constructedPrompt = prompt;
    if (negativePrompt?.trim()) {
      constructedPrompt += `\n\nIMPORTANT: Do NOT include the following elements: "${negativePrompt.trim()}".`;
    }

    if (styleReferenceBase64 && styleReferenceMimeType) {
        parts.push({ inlineData: { data: styleReferenceBase64, mimeType: styleReferenceMimeType }});
        parts.push({ text: `You are an expert photo editor. The user has provided two images. The first image is the one to be edited. The second is a style reference. You must apply the artistic style, color palette, and texture from the style reference image to the first image, guided by the user's prompt. User's prompt: "${constructedPrompt}"`})
    } else if (magicToolRequest) {
      parts.push({
        text: `You are an expert photo editor. The user wants to add an object to the image. Add a '${magicToolRequest.objectPrompt}'. Place it naturally on or near the normalized coordinates (x: ${magicToolRequest.coords.x.toFixed(2)}, y: ${magicToolRequest.coords.y.toFixed(2)}), integrating it seamlessly with the lighting and style of the original photo. Only add this object; do not perform other edits unless specified in the main prompt. User's main prompt: "${constructedPrompt}"`,
      });
    } else if (maskBase64Data) {
      parts.push({
        inlineData: {
          data: maskBase64Data,
          mimeType: 'image/png',
        },
      });
      if (isEraseMode) {
          parts.push({ text: `You are an expert photo editor. The user has provided an image and a mask. You must remove the object indicated by the white area in the mask and realistically fill in the background, making it look as if the object was never there. Do not change any part of the original image that corresponds to the black area in the mask.`});
      } else if (!constructedPrompt.trim()) {
          // Generative Fill case
          parts.push({ text: `You are an expert photo editor. The user has provided an image and a mask but an empty prompt. This is a generative fill request. You must creatively and realistically fill the white area indicated in the mask based on the surrounding context of the image. Do not change any part of the original image that corresponds to the black area in the mask.` });
      } else {
          // Generative Replace case
          parts.push({
            text: `You are an expert photo editor. The user has provided two images and a prompt. The first image is the original photo. The second image is a mask. You must apply the user's prompt ONLY to the white area indicated in the mask. Do not change any part of the original image that corresponds to the black area in the mask. User's prompt: "${constructedPrompt}"`,
          });
      }
    } else {
      parts.push({ text: constructedPrompt });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let result: EditImageResult = { imageData: null, text: '' };
    
    if (response.candidates && response.candidates.length > 0) {
      const responseParts = response.candidates[0].content.parts;
      for (const part of responseParts) {
        if (part.inlineData) {
          result.imageData = part.inlineData.data;
        } else if (part.text) {
          result.text += part.text;
        }
      }
    } else {
        throw new Error("No candidates returned from the API.");
    }
    
    if (!result.imageData && !result.text) {
        result.text = "The model returned an empty response. Please try a different prompt.";
    }

    return result;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to process image with AI: ${error.message}`);
    }
    throw new Error("Failed to process image with AI. Please check the console for details.");
  }
};

export const enhanceImageTo4k = async (
  base64ImageData: string,
  mimeType: string,
): Promise<EditImageResult> => {
  try {
    const parts: Part[] = [
      { inlineData: { data: base64ImageData, mimeType } },
      { text: "Upscale this image to 4K resolution. Enhance details, improve sharpness, and increase clarity to a professional standard. Do not change the content or artistic style of the image." },
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let result: EditImageResult = { imageData: null, text: '' };
    
    if (response.candidates && response.candidates.length > 0) {
      const responseParts = response.candidates[0].content.parts;
      for (const part of responseParts) {
        if (part.inlineData) {
          result.imageData = part.inlineData.data;
        } else if (part.text) {
          result.text += part.text;
        }
      }
    } else {
        throw new Error("No candidates returned from the 4K enhancement API call.");
    }
    
    if (!result.imageData) {
        throw new Error(result.text || "The model did not return an enhanced image.");
    }

    result.text = result.text || "Image enhanced to 4K successfully.";
    return result;

  } catch (error) {
    console.error("Gemini 4K enhancement failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to enhance image with AI: ${error.message}`);
    }
    throw new Error("Failed to enhance image with AI. Please check the console for details.");
  }
};

export const removeBackground = async (
  base64ImageData: string,
  mimeType: string,
): Promise<EditImageResult> => {
  try {
    const parts: Part[] = [
      { inlineData: { data: base64ImageData, mimeType } },
      { text: "You are an expert photo editor. Your task is to accurately identify the main subject of this image and remove the background completely. The output must be a PNG image with a transparent background. Do not alter the subject." },
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let result: EditImageResult = { imageData: null, text: '' };
    
    if (response.candidates && response.candidates.length > 0) {
      const responseParts = response.candidates[0].content.parts;
      for (const part of responseParts) {
        if (part.inlineData) {
          result.imageData = part.inlineData.data;
        } else if (part.text) {
          result.text += part.text;
        }
      }
    } else {
        throw new Error("No candidates returned from the background removal API call.");
    }
    
    if (!result.imageData) {
        throw new Error(result.text || "The model did not return an image with the background removed.");
    }

    result.text = result.text || "Background removed successfully.";
    return result;

  } catch (error) {
    console.error("Gemini background removal failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to remove background with AI: ${error.message}`);
    }
    throw new Error("Failed to remove background with AI. Please check the console for details.");
  }
};


export const generateVideoWithVeo = async (prompt: string): Promise<VideoOperation> => {
    try {
        return await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
    } catch (error) {
        console.error("Veo API call failed:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate video with AI: ${error.message}`);
        }
        throw new Error("Failed to generate video with AI.");
    }
};

export const getVideosOperation = async (operation: VideoOperation): Promise<VideoOperation> => {
    try {
        // FIX: Cast operation to 'any' to satisfy the SDK's expected type.
        // The object passed at runtime is the full SDK object, so this is safe.
        // This resolves the type error about missing properties like '_fromAPIResponse'.
        return await ai.operations.getVideosOperation({ operation: operation as any });
    } catch (error) {
        console.error("Veo operation status check failed:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get video status: ${error.message}`);
        }
        throw new Error("Failed to get video status.");
    }
};