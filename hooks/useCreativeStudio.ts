
import { useState, useCallback, useEffect } from 'react';
import type { 
    OriginalImage, EditedImage, HistoryState, ActiveTool, AspectRatio, AppMode, 
    StyleReference, VideoGenerationState, VideoOperation, Notification
} from '../types';
import { 
    editImageWithGemini, generateImageWithImagen, generateVideoWithVeo, getVideosOperation, MagicToolRequest,
    enhanceImageTo4k, removeBackground, downloadVideoFromProxy
} from '../services/geminiService';

const CREATIVE_VIDEO_MESSAGES = [
    "Warming up the digital cameras...",
    "Teaching pixels to dance...",
    "Consulting with the muse of motion pictures...",
    "Stitching frames together with virtual thread...",
    "Rendering dreams into reality...",
    "Applying the final cinematic touches...",
    "The digital premiere is almost ready...",
];

const getApiErrorMessage = (err: unknown): string => {
    const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
    const status = (err as any)?.status;

    if (status === 429 || (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('quota'))) {
      return "You've exceeded the free tier limit. Please try again later or upgrade to Pro for unlimited access.";
    }
    if (typeof errorMsg === 'string' && errorMsg.includes("billed users")) {
      return "This feature requires a billed account setup. Please upgrade to Pro.";
    }
    return errorMsg;
};


const useCreativeStudio = (addNotification: (message: string, type?: Notification['type']) => void) => {
  // Global State
  const [appMode, setAppMode] = useState<AppMode>('image');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('AI is creating...');

  // Image Editing State
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [editedImages, setEditedImages] = useState<EditedImage[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [styleReference, setStyleReference] = useState<StyleReference | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  // Tools State
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [brushSize, setBrushSize] = useState<number>(40);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [magicToolCoords, setMagicToolCoords] = useState<{x: number, y: number} | null>(null);

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoGenerationState, setVideoGenerationState] = useState<VideoGenerationState>({ status: 'idle', message: '' });

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  // --- UTILITY FUNCTIONS ---
  const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [meta, base64] = result.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        resolve({ base64, mimeType });
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const base64ToFile = (base64: string, filename: string, mimeType: string): Promise<File> => {
    return fetch(`data:${mimeType};base64,${base64}`)
      .then(res => res.blob())
      .then(blob => new File([blob], filename, { type: mimeType }));
  }

  // --- GENERAL ACTIONS ---
  const resetImageState = () => {
    setOriginalImage(null);
    setEditedImages([]);
    setError(null);
    setPrompt('');
    setNegativePrompt('');
    setStyleReference(null);
    setMaskDataUrl(null);
    setActiveTool(null);
    setMagicToolCoords(null);
    setHistory([]);
    setHistoryIndex(-1);
  }

  const resetVideoState = () => {
    setVideoPrompt('');
    setVideoUrl(null);
    setVideoGenerationState({ status: 'idle', message: '' });
    setError(null);
  }

  const handleReset = () => {
    resetImageState();
    resetVideoState();
    if (appMode === 'video') setAppMode('image');
    addNotification('Workspace cleared.', 'info');
  }

  const handleAppModeChange = (mode: AppMode) => {
    handleReset();
    setAppMode(mode);
  }
  
  // --- IMAGE ACTIONS ---
  const handleImageSelect = (file: File | null) => {
    resetImageState();
    if (file) {
      const dataUrl = URL.createObjectURL(file);
      setOriginalImage({ dataUrl, file });
      addNotification('Image uploaded successfully.', 'success');
    }
  };

  const handleStyleReferenceChange = (file: File | null) => {
    if (file) {
        const dataUrl = URL.createObjectURL(file);
        setStyleReference({ dataUrl, file });
        addNotification('Style reference added.', 'info');
    } else {
        setStyleReference(null);
    }
  }
  
  const handleGenerateImage = useCallback(async (genPrompt: string, genNegPrompt: string, aspectRatio: AspectRatio) => {
    if (!genPrompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setLoadingMessage('Generating your vision...');
    setIsLoading(true);
    setError(null);
    resetImageState();

    try {
      const imageData = await generateImageWithImagen(genPrompt, genNegPrompt, aspectRatio);
      const imageFile = await base64ToFile(imageData, "generated-image.jpg", "image/jpeg");
      handleImageSelect(imageFile);
    } catch (err) {
      console.error('Error generating image:', err);
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg);
      addNotification(errorMsg, 'error');
      handleReset();
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const performEdit = async (currentPrompt: string, currentNegativePrompt: string, magicToolRequest?: MagicToolRequest, overrideBase64?: string, overrideMimeType?: string, overrideMask?: string, isEraseMode: boolean = false) => {
    if (!originalImage && !overrideBase64) {
      setError('Please provide an image.');
      return null;
    }
    
    const { base64: base64Data, mimeType } = overrideBase64 
        ? { base64: overrideBase64, mimeType: overrideMimeType! }
        : await fileToBase64(originalImage!.file);
        
    const { base64: styleRefBase64, mimeType: styleRefMimeType } = styleReference 
        ? await fileToBase64(styleReference.file) 
        : { base64: undefined, mimeType: undefined };

    const maskBase64 = overrideMask ?? (maskDataUrl ? maskDataUrl.split(',')[1] : undefined);
    
    return editImageWithGemini(
        base64Data, mimeType, currentPrompt, currentNegativePrompt, maskBase64,
        magicToolRequest, styleRefBase64, styleRefMimeType, isEraseMode
    );
  }

  const updateHistory = useCallback((newImages: EditedImage[], currentPrompt: string, currentNegativePrompt: string) => {
    if (newImages.length > 0) {
        const newHistoryState: HistoryState = {
            id: Date.now().toString(),
            images: newImages,
            prompt: currentPrompt,
            negativePrompt: currentNegativePrompt,
        };

        const newHistory = history.slice(0, historyIndex + 1);

        setHistory([...newHistory, newHistoryState]);
        setHistoryIndex(newHistory.length);
    }
  }, [history, historyIndex]);

  const executeEdit = async (editFn: () => Promise<any>, currentPrompt: string, currentNegativePrompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await editFn();
      if (!result) return;
      
      const newImages = result.imageData ? [{
          dataUrl: `data:image/png;base64,${result.imageData}`,
          text: result.text,
      }] : [];

      setEditedImages(newImages);
      updateHistory(newImages, currentPrompt, currentNegativePrompt);

      if (newImages.length > 0) {
        addNotification('Edit applied successfully!', 'success');
      } else {
        const errorMsg = result.text || "The model didn't return an image. Please try again.";
        setError(errorMsg);
        addNotification(errorMsg, 'error');
      }

    } catch (err) {
      console.error('Error editing image:', err);
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg);
      addNotification(errorMsg, 'error');
    } finally {
      setIsLoading(false);
      setMagicToolCoords(null);
      if (activeTool && activeTool !== 'expand') setActiveTool(null);
      if (maskDataUrl) setMaskDataUrl(null);
    }
  }

  const handleEditImage = useCallback(async (overridePrompt?: string) => {
     const currentPrompt = overridePrompt ?? prompt;
     if (!originalImage || (!currentPrompt.trim() && !maskDataUrl)) {
        setError("Please provide a prompt or select an area to fill.");
        return;
     }
     setLoadingMessage(maskDataUrl && !currentPrompt.trim() ? 'Applying Generative Fill...' : 'Applying your edit...');
     await executeEdit(() => performEdit(currentPrompt, negativePrompt), currentPrompt, negativePrompt);
  }, [originalImage, prompt, negativePrompt, activeTool, maskDataUrl, styleReference, updateHistory, addNotification]);

  const handleGenerateVariations = useCallback(async (count: number) => {
    if (!originalImage || !prompt) {
      setError('Please provide an image and a prompt.');
      return;
    }
    setLoadingMessage('Generating creative variations...');
    setIsLoading(true);
    setError(null);
    try {
      const successfulEdits: EditedImage[] = [];
      for (let i = 0; i < count; i++) {
        setLoadingMessage(`Generating variation ${i + 1} of ${count}...`);
        const result = await performEdit(prompt, negativePrompt);
        if (result?.imageData) {
          successfulEdits.push({
            dataUrl: `data:image/png;base64,${result.imageData}`,
            text: result.text,
          });
        }
      }

      setEditedImages(successfulEdits);
      updateHistory(successfulEdits, prompt, negativePrompt);
      
      if (successfulEdits.length > 0) {
        addNotification(`${successfulEdits.length} variation(s) generated!`, 'success');
      } else {
        // This part might be reached if all requests fail gracefully within performEdit
        setError('Could not generate any variations.');
        addNotification('Could not generate any variations.', 'error');
      }
    } catch(err) {
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg);
      addNotification(errorMsg, 'error');
    } finally {
      setIsLoading(false);
      setLoadingMessage('AI is creating...');
    }
  }, [originalImage, prompt, negativePrompt, updateHistory, addNotification]);
  
  const handleMagicToolPlacement = useCallback(async (objectPrompt: string, coords: {x: number, y: number}) => {
    const magicToolRequest = { objectPrompt, coords };
    setLoadingMessage('Placing the magic object...');
    await executeEdit(() => performEdit(prompt, negativePrompt, magicToolRequest), prompt, negativePrompt);
  }, [originalImage, prompt, negativePrompt, activeTool, maskDataUrl, styleReference, updateHistory, addNotification]);

  const handleExpandImage = useCallback(async (expandedImageDataUrl: string, maskDataUrl: string) => {
    setLoadingMessage('Expanding the canvas...');
    setIsLoading(true); setError(null);
    try {
        const expandedBase64 = expandedImageDataUrl.split(',')[1];
        const maskBase64 = maskDataUrl.split(',')[1];
        const outpaintingPrompt = prompt || "Continue the image naturally, filling in the masked area.";
        const result = await performEdit(outpaintingPrompt, negativePrompt, undefined, expandedBase64, 'image/png', maskBase64);
        if (result?.imageData) {
            const finalImageFile = await base64ToFile(result.imageData, "outpainted.png", "image/png");
            const newDataUrl = URL.createObjectURL(finalImageFile);
            setOriginalImage({ dataUrl: newDataUrl, file: finalImageFile });
            const newImages = [{ dataUrl: newDataUrl, text: result.text }];
            setEditedImages(newImages);
            setHistory([]);
            setHistoryIndex(-1);
            updateHistory(newImages, "", "");
            setPrompt('');
            addNotification('Canvas expanded successfully!', 'success');
        } else {
            throw new Error(result?.text || "Outpainting failed.");
        }
    } catch (err) {
        const errorMsg = getApiErrorMessage(err);
        setError(errorMsg);
        addNotification(errorMsg, 'error');
    } finally {
        setIsLoading(false);
        setActiveTool(null);
    }
  }, [originalImage, prompt, negativePrompt, updateHistory, addNotification]);

  const handleErase = useCallback(async () => {
    if (!maskDataUrl) {
      setError("Please mark an area to erase.");
      return;
    }
    const currentPrompt = "Erase masked area";
    setLoadingMessage('Erasing the selected area...');
    await executeEdit(() => performEdit(currentPrompt, negativePrompt, undefined, undefined, undefined, undefined, true), currentPrompt, negativePrompt);
  }, [originalImage, maskDataUrl, negativePrompt, updateHistory, addNotification]);

  const handle4kEnhance = useCallback(async () => {
    if (editedImages.length === 0) {
        const errorMsg = "There is no image to enhance.";
        setError(errorMsg);
        addNotification(errorMsg, 'error');
        return;
    }
    const currentImage = editedImages[0];
    const base64Data = currentImage.dataUrl.split(',')[1];
    const mimeType = currentImage.dataUrl.split(';')[0].split(':')[1];

    setLoadingMessage('Enhancing to 4K...');
    setIsLoading(true);
    setError(null);

    try {
        const result = await enhanceImageTo4k(base64Data, mimeType);
        
        if (result?.imageData) {
            const newEnhancedImage: EditedImage = {
                dataUrl: `data:image/png;base64,${result.imageData}`,
                text: result.text,
            };
            const newImages = [newEnhancedImage];
            setEditedImages(newImages);
            updateHistory(newImages, "4K Enhance", negativePrompt);
            addNotification('Image enhanced to 4K!', 'success');
        } else {
            throw new Error(result.text || "4K enhancement failed to return an image.");
        }
    } catch (err) {
      console.error('Error enhancing image to 4K:', err);
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg);
      addNotification(errorMsg, 'error');
    } finally {
        setIsLoading(false);
    }
  }, [editedImages, negativePrompt, updateHistory, addNotification]);

  const handleBackgroundRemoval = useCallback(async () => {
    if (!originalImage) {
      setError("Please provide an image.");
      return;
    }
    setLoadingMessage('Removing background...');
    const { base64, mimeType } = await fileToBase64(originalImage.file);
    await executeEdit(
      () => removeBackground(base64, mimeType),
      "Remove background",
      ""
    );
  }, [originalImage, updateHistory, addNotification]);
  
  useEffect(() => {
    if (activeTool === 'cutout') {
        handleBackgroundRemoval();
        setActiveTool(null);
    }
  }, [activeTool, handleBackgroundRemoval]);


  const clearMask = () => setMaskDataUrl(null);
  
  const revertToHistoryState = (historyItem: HistoryState) => {
    const index = history.findIndex(h => h.id === historyItem.id);
    if (index > -1) {
        setHistoryIndex(index);
        setEditedImages(historyItem.images);
        setPrompt(historyItem.prompt);
        setNegativePrompt(historyItem.negativePrompt);
        addNotification(`Reverted to a previous state.`, 'info');
    }
  };

  const handleUndo = () => {
    if (!canUndo) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    if (newIndex >= 0) {
        const prevState = history[newIndex];
        setEditedImages(prevState.images);
        setPrompt(prevState.prompt);
        setNegativePrompt(prevState.negativePrompt);
    } else {
        setEditedImages([]);
        if (history.length > 0) {
          setPrompt(history[0].prompt);
          setNegativePrompt(history[0].negativePrompt);
        }
    }
    addNotification('Undo successful.', 'info');
  };

  const handleRedo = () => {
// Fix: Changed canDo to canRedo
    if (!canRedo) return;
    const newIndex = historyIndex + 1;
    const nextState = history[newIndex];
    setHistoryIndex(newIndex);
    setEditedImages(nextState.images);
    setPrompt(nextState.prompt);
    setNegativePrompt(nextState.negativePrompt);
    addNotification('Redo successful.', 'info');
  };

  // --- VIDEO ACTIONS ---
  const handleGenerateVideo = useCallback(async () => {
    if (!videoPrompt.trim()) {
      setError("Please enter a prompt to generate a video.");
      return;
    }
    setVideoGenerationState({ status: 'generating', message: CREATIVE_VIDEO_MESSAGES[0] });
    setError(null);
    setVideoUrl(null);
    let messageIndex = 1;

    try {
        let operation = await generateVideoWithVeo(videoPrompt);
        
        const poll = async () => {
            if (operation.done) {
                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink) {
                    const blob = await downloadVideoFromProxy(downloadLink);
                    const url = URL.createObjectURL(blob);
                    setVideoUrl(url);
                    setVideoGenerationState({ status: 'done', message: 'Video generated!' });
                    addNotification('Video generated successfully!', 'success');
                } else {
                    throw new Error("Video generation finished but no video link was found.");
                }
                return;
            }

            setVideoGenerationState(prev => ({ ...prev, message: CREATIVE_VIDEO_MESSAGES[messageIndex % CREATIVE_VIDEO_MESSAGES.length] }));
            messageIndex++;

            operation = await getVideosOperation(operation);
            setTimeout(poll, 10000);
        };

        poll();
    } catch(err) {
        const errorMsg = getApiErrorMessage(err);
        setError(errorMsg);
        setVideoGenerationState({ status: 'error', message: errorMsg });
        addNotification(errorMsg, 'error');
    }
  }, [videoPrompt, addNotification]);

  return {
    appMode,
    setAppMode: handleAppModeChange,
    originalImage,
    editedImages,
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    styleReference,
    setStyleReference: handleStyleReferenceChange,
    isLoading,
    error,
    history,
    canUndo,
    canRedo,
    handleImageSelect,
    handleEditImage,
    handleGenerateVariations,
    handleGenerateImage,
    handleExpandImage,
    handleErase,
    handle4kEnhance,
    handleBackgroundRemoval,
    revertToHistoryState,
    handleUndo,
    handleRedo,
    activeTool,
    setActiveTool,
    brushSize,
    setBrushSize,
    maskDataUrl,
    setMaskDataUrl,
    clearMask,
    magicToolCoords,
    setMagicToolCoords,
    handleMagicToolPlacement,
    handleReset,
    videoPrompt,
    setVideoPrompt,
    videoUrl,
    videoGenerationState,
    handleGenerateVideo,
    loadingMessage,
  };
};

export default useCreativeStudio;
