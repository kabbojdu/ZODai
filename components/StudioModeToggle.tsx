
import React from 'react';
import type { AppMode } from '../types';

interface StudioModeToggleProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isPro: boolean;
}

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
  </svg>
);


const StudioModeToggle: React.FC<StudioModeToggleProps> = ({ appMode, setAppMode, isPro }) => {
  return (
    <div className="relative bg-black/20 p-1 rounded-full flex items-center">
      <div
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-cyan-600 rounded-full transition-transform duration-300 ease-in-out ${
          appMode === 'video' ? 'translate-x-full' : 'translate-x-0'
        }`}
      ></div>
      <button
        onClick={() => setAppMode('image')}
        className={`z-10 w-1/2 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
          appMode === 'image' ? 'text-white' : 'text-gray-300 hover:text-white'
        }`}
        aria-pressed={appMode === 'image'}
      >
        <ImageIcon />
        Create Image
      </button>
      <button
        onClick={() => setAppMode('video')}
        className={`relative z-10 w-1/2 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
          appMode === 'video' ? 'text-white' : 'text-gray-300 hover:text-white'
        }`}
        aria-pressed={appMode === 'video'}
      >
        <VideoIcon />
        Create Video
        {!isPro && <span className="absolute -top-1 right-1 bg-yellow-400 text-black text-[9px] font-bold px-1 rounded-full">PRO</span>}
      </button>
    </div>
  );
};

export default StudioModeToggle;