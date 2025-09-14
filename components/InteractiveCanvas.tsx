
import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { ActiveTool } from '../types';

interface InteractiveCanvasProps {
  imageUrl: string;
  brushSize: number;
  onMaskChange: (dataUrl: string | null) => void;
  externalClear: boolean;
  activeTool: ActiveTool;
  onMagicToolSelect: (coords: { x: number; y: number }) => void;
  onExpandConfirm: (expandedImageDataUrl: string, maskDataUrl: string) => void;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ 
    imageUrl, brushSize, onMaskChange, externalClear, activeTool, onMagicToolSelect, onExpandConfirm
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number, y: number } | null>(null);
  
  // State for expand tool
  const [imageDims, setImageDims] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [expandRect, setExpandRect] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  const [draggingHandle, setDraggingHandle] = useState<string | null>(null);

  const drawImage = useCallback((forExpansion = false) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    image.onload = () => {
      const container = containerRef.current;
      const imageCanvas = imageCanvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      if (!container || !imageCanvas || !drawingCanvas) return;

      const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
      const imageAspectRatio = image.width / image.height;
      const containerAspectRatio = containerWidth / containerHeight;
      
      let renderWidth, renderHeight, renderX, renderY;
      if (imageAspectRatio > containerAspectRatio) {
        renderWidth = containerWidth;
        renderHeight = containerWidth / imageAspectRatio;
        renderX = 0;
        renderY = (containerHeight - renderHeight) / 2;
      } else {
        renderHeight = containerHeight;
        renderWidth = containerHeight * imageAspectRatio;
        renderY = 0;
        renderX = (containerWidth - renderWidth) / 2;
      }

      setImageDims({ width: renderWidth, height: renderHeight, x: renderX, y: renderY });
      if (forExpansion) return; // Skip canvas drawing if only updating dims

      [imageCanvas, drawingCanvas].forEach(canvas => {
          canvas.width = image.width;
          canvas.height = image.height;
          canvas.style.width = `${renderWidth}px`;
          canvas.style.height = `${renderHeight}px`;
          canvas.style.position = 'absolute';
          canvas.style.top = '50%';
          canvas.style.left = '50%';
          canvas.style.transform = 'translate(-50%, -50%)';
      });

      const imageCtx = imageCanvas.getContext('2d');
      if (imageCtx) {
        imageCtx.drawImage(image, 0, 0);
      }
      clearMask(true);
    };
  }, [imageUrl]);
  
  useEffect(() => {
    setExpandRect({ top: 0, left: 0, right: 0, bottom: 0 });
    drawImage();
  }, [imageUrl, drawImage]);

  useEffect(() => {
    const handleResize = () => drawImage(activeTool === 'expand');
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawImage, activeTool]);
  
  const clearMask = useCallback((initial = false) => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (!initial) onMaskChange(null);
  }, [onMaskChange]);

  useEffect(() => {
    if (externalClear) clearMask();
  }, [externalClear, clearMask]);

  const getCoords = (e: React.MouseEvent | MouseEvent): { x: number, y: number } | null => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  // MASK & MAGIC TOOL HANDLERS
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'mask' || activeTool === 'erase') {
        setIsDrawing(true);
    }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || (activeTool !== 'mask' && activeTool !== 'erase')) return;

    const coords = getCoords(e);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !coords) return;
    
    if (!lastPos) {
      setLastPos(coords);
      return;
    }

    ctx.beginPath(); ctx.strokeStyle = 'white'; ctx.lineWidth = brushSize;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.x, lastPos.y); ctx.lineTo(coords.x, coords.y);
    ctx.stroke(); setLastPos(coords);
  };
  const handleMouseUp = () => {
    if (!isDrawing || (activeTool !== 'mask' && activeTool !== 'erase')) return;

    setIsDrawing(false); setLastPos(null);
    const canvas = drawingCanvasRef.current; if (!canvas) return;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width; exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      exportCtx.fillStyle = 'black'; exportCtx.fillRect(0, 0, canvas.width, canvas.height);
      exportCtx.drawImage(canvas, 0, 0); onMaskChange(exportCanvas.toDataURL('image/png'));
    }
  };
  const handleClick = (e: React.MouseEvent) => {
    if (activeTool === 'magic') {
      const coords = getCoords(e); const canvas = drawingCanvasRef.current;
      if (coords && canvas) onMagicToolSelect({ x: coords.x / canvas.width, y: coords.y / canvas.height });
    }
  };

  // EXPAND TOOL HANDLERS
  const handleExpandMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation(); setDraggingHandle(handle);
  };
  const handleExpandMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingHandle || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    setExpandRect(prev => {
      const newRect = {...prev};
      if (draggingHandle.includes('top')) newRect.top = Math.max(0, imageDims.y - (e.clientY - containerRect.top));
      if (draggingHandle.includes('bottom')) newRect.bottom = Math.max(0, (e.clientY - containerRect.top) - (imageDims.y + imageDims.height));
      if (draggingHandle.includes('left')) newRect.left = Math.max(0, imageDims.x - (e.clientX - containerRect.left));
      if (draggingHandle.includes('right')) newRect.right = Math.max(0, (e.clientX - containerRect.left) - (imageDims.x + imageDims.width));
      return newRect;
    });
  }, [draggingHandle, imageDims]);
  const handleExpandMouseUp = useCallback(() => {
    setDraggingHandle(null);
  }, []);

  useEffect(() => {
    if (draggingHandle) {
      window.addEventListener('mousemove', handleExpandMouseMove);
      window.addEventListener('mouseup', handleExpandMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleExpandMouseMove);
        window.removeEventListener('mouseup', handleExpandMouseUp);
      };
    }
  }, [draggingHandle, handleExpandMouseMove, handleExpandMouseUp]);

  const confirmExpansion = () => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    image.onload = () => {
      const scaleX = image.width / imageDims.width;
      const scaleY = image.height / imageDims.height;

      const newWidth = image.width + (expandRect.left + expandRect.right) * scaleX;
      const newHeight = image.height + (expandRect.top + expandRect.bottom) * scaleY;

      const expandedCanvas = document.createElement('canvas');
      expandedCanvas.width = newWidth;
      expandedCanvas.height = newHeight;
      const expandedCtx = expandedCanvas.getContext('2d');

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = newWidth;
      maskCanvas.height = newHeight;
      const maskCtx = maskCanvas.getContext('2d');

      if (!expandedCtx || !maskCtx) return;

      expandedCtx.drawImage(image, expandRect.left * scaleX, expandRect.top * scaleY);

      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, newWidth, newHeight);
      maskCtx.clearRect(expandRect.left * scaleX, expandRect.top * scaleY, image.width, image.height);

      onExpandConfirm(expandedCanvas.toDataURL('image/png'), maskCanvas.toDataURL('image/png'));
    };
  };

  const getCursorStyle = () => {
    if (activeTool === 'mask' || activeTool === 'erase') {
      const safeBrushSize = Math.max(2, brushSize);
      const color = activeTool === 'erase' ? 'rgba(255,100,100,0.6)' : 'rgba(255,255,255,0.6)';
      const stroke = activeTool === 'erase' ? 'red' : 'white';
      
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="${color}" stroke="${stroke}" stroke-width="2" width="${safeBrushSize}" height="${safeBrushSize}" viewBox="0 0 ${safeBrushSize} ${safeBrushSize}"><circle cx="${safeBrushSize/2}" cy="${safeBrushSize/2}" r="${(safeBrushSize/2)-1.5}"/></svg>`;
      
      return { cursor: `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') ${safeBrushSize/2} ${safeBrushSize/2}, auto` };
    }
    if (activeTool === 'magic') {
       const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.5 2.5a2.12 2.12 0 0 0-3 0L8 7l-1.5-1.5a2.12 2.12 0 0 0-3 0v0a2.12 2.12 0 0 0 0 3L5 10l-2.5 2.5a2.12 2.12 0 0 0 0 3v0a2.12 2.12 0 0 0 3 0L7 14l1.5 1.5a2.12 2.12 0 0 0 3 0v0a2.12 2.12 0 0 0 0-3L10 11l2.5-2.5l1.5 1.5a2.12 2.12 0 0 0 3 0v0a2.12 2.12 0 0 0 0-3L15.5 8.5z"/></svg>`;
       return { cursor: `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') 16 16, crosshair` };
    }
    return {};
  };

  const handles = ['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right'];

  return (
    <div 
        ref={containerRef} 
        className="relative w-full aspect-square bg-black/20 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center border border-white/10"
        style={getCursorStyle()}
    >
        <canvas ref={imageCanvasRef} style={{opacity: activeTool === 'expand' ? 0.5 : 1}}></canvas>
        <canvas 
            ref={drawingCanvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
        ></canvas>
        
        {activeTool === 'expand' && (
          <>
            <div 
              className="absolute border-2 border-dashed border-cyan-400"
              style={{
                top: imageDims.y - expandRect.top,
                left: imageDims.x - expandRect.left,
                width: imageDims.width + expandRect.left + expandRect.right,
                height: imageDims.height + expandRect.top + expandRect.bottom,
              }}
            >
              {handles.map(handle => (
                <div
                  key={handle}
                  onMouseDown={(e) => handleExpandMouseDown(e, handle)}
                  className="absolute bg-cyan-400 w-4 h-4 rounded-full border-2 border-gray-900"
                  style={{
                    top: handle.includes('top') ? -8 : handle.includes('bottom') ? 'auto' : '50%',
                    bottom: handle.includes('bottom') ? -8 : 'auto',
                    left: handle.includes('left') ? -8 : handle.includes('right') ? 'auto' : '50%',
                    right: handle.includes('right') ? -8 : 'auto',
                    transform: `translate(${handle.includes('left') || handle.includes('right') ? 0 : -50}%, ${handle.includes('top') || handle.includes('bottom') ? 0 : -50}%)`,
                    cursor: `${handle.includes('top') ? 'n' : ''}${handle.includes('left') ? 'w' : ''}${handle.includes('bottom') ? 's' : ''}${handle.includes('right') ? 'e' : ''}-resize`
                  }}
                />
              ))}
            </div>
            <button 
                onClick={confirmExpansion}
                className="absolute bottom-4 z-20 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:bg-cyan-500 transition-all transform hover:scale-105 active:scale-100"
            >
                Confirm Expansion
            </button>
          </>
        )}

        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'}}></div>
    </div>
  );
};

export default InteractiveCanvas;