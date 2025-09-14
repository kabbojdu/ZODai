
import type { AspectRatio, VideoOperation } from '../types';

interface EditImageResult {
  imageData: string | null;
  text: string;
}

export interface MagicToolRequest {
  objectPrompt: string;
  coords: { x: number; y: number };
}

// Helper function to handle API calls to our secure serverless proxy
async function callApiProxy(action: string, params: object) {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...params }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    return await response.json();

  } catch (error) {
    console.error(`Error calling API proxy for action "${action}":`, error);
    if (error instanceof Error) {
        // Re-throw the error to be caught by the calling hook
        throw new Error(error.message);
    }
    throw new Error('An unknown network error occurred.');
  }
}

export const generateImageWithImagen = async (
  prompt: string,
  negativePrompt?: string,
  aspectRatio: AspectRatio = '1:1'
): Promise<string> => {
  const result = await callApiProxy('generateImageWithImagen', { prompt, negativePrompt, aspectRatio });
  if (result.imageData) {
    return result.imageData;
  }
  throw new Error("The model did not return any images. Please try a different prompt.");
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
  return callApiProxy('editImageWithGemini', { 
    base64ImageData, mimeType, prompt, negativePrompt, maskBase64Data, 
    magicToolRequest, styleReferenceBase64, styleReferenceMimeType, isEraseMode 
  });
};

export const enhanceImageTo4k = async (
  base64ImageData: string,
  mimeType: string,
): Promise<EditImageResult> => {
  return callApiProxy('enhanceImageTo4k', { base64ImageData, mimeType });
};

export const removeBackground = async (
  base64ImageData: string,
  mimeType: string,
): Promise<EditImageResult> => {
  return callApiProxy('removeBackground', { base64ImageData, mimeType });
};

export const generateVideoWithVeo = async (prompt: string): Promise<VideoOperation> => {
  return callApiProxy('generateVideoWithVeo', { prompt });
};

export const getVideosOperation = async (operation: VideoOperation): Promise<VideoOperation> => {
  return callApiProxy('getVideosOperation', { operation });
};

export const downloadVideoFromProxy = async (downloadLink: string): Promise<Blob> => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'downloadVideo', downloadLink }),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.error || `Video download failed with status ${response.status}`);
            } catch (e) {
                throw new Error(`Video download failed with status ${response.status}`);
            }
        }
        
        return await response.blob();

    } catch (error) {
        console.error(`Error downloading video via proxy:`, error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown network error occurred while downloading the video.');
    }
};
