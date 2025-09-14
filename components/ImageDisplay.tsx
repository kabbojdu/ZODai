
import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import type { EditedImage } from '../types';

interface ImageDisplayProps {
  title: string;
  images: EditedImage[];
  isLoading?: boolean;
  loadingMessage?: string;
  on4kEnhance?: () => void;
  isPro?: boolean;
}

const ImageIconPlaceholder = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
)

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const EnhanceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 2.293a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-11 11a1 1 0 01-1.415-1.414l11-11zM11 7a1 1 0 100-2 1 1 0 000 2zm3-3a1 1 0 100-2 1 1 0 000 2zm-6 6a1 1 0 100-2 1 1 0 000 2zm-3 3a1 1 0 100-2 1 1 0 000 2zM3 7a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
);

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, images, isLoading, loadingMessage, on4kEnhance, isPro }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const goToPrevious = () => {
    const isFirst = currentIndex === 0;
    const newIndex = isFirst ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLast = currentIndex === images.length - 1;
    const newIndex = isLast ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage.dataUrl;
    link.download = `ai-studio-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;
  const isEditedPanel = title === 'Edited';
  const showControls = isEditedPanel && currentImage && !isLoading;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-300">{title}</h2>
          {hasMultipleImages && !isLoading && (
              <span className="text-sm font-mono bg-black/20 px-3 py-1 rounded-full">
                  {currentIndex + 1} / {images.length}
              </span>
          )}
        </div>
        {showControls && (
          <div className="flex items-center gap-2">
            {on4kEnhance && (
               <button 
                onClick={on4kEnhance} 
                className="relative flex items-center gap-2 pl-3 pr-4 py-1.5 bg-purple-600/80 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors"
                aria-label="Enhance image to 4K"
               >
                {!isPro && <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">PRO</span>}
                <EnhanceIcon />
                4K Enhance
              </button>
            )}
            <button 
              onClick={handleDownload} 
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Download image"
            >
              <DownloadIcon />
            </button>
          </div>
        )}
      </div>
      <div className="relative group w-full aspect-square bg-black/20 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center border border-white/10 flex-grow">
        {isLoading && <Loader message={loadingMessage} />}
        {!isLoading && images.length === 0 && (
          <div className="flex flex-col items-center text-gray-500 p-4">
            <ImageIconPlaceholder />
            <p className="mt-2 text-center">
              {isEditedPanel ? 'Your edited image will appear here' : 'Upload an image to start'}
            </p>
          </div>
        )}
        {currentImage && (
          <img
            src={currentImage.dataUrl}
            alt={`${title} ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        )}
        {hasMultipleImages && !isLoading && (
            <>
                <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-sm">
                    <ChevronLeftIcon />
                </button>
                <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-sm">
                    <ChevronRightIcon />
                </button>
            </>
        )}
      </div>
       {isEditedPanel && currentImage?.text && !isLoading && (
          <div className="bg-black/20 rounded-lg p-3 text-sm text-gray-300 border border-white/10 min-h-[4rem] max-h-24 overflow-y-auto">
              <p className="italic">{currentImage.text}</p>
          </div>
      )}
    </div>
  );
};

export default ImageDisplay;