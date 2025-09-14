
import React from 'react';
import StyleReferenceUploader from './StyleReferenceUploader';
import type { StyleReference } from '../types';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onEdit: () => void;
  onGenerateVariations: () => void;
  isLoading: boolean;
  hasImage: boolean;
  isMaskActive?: boolean;
  styleReference: StyleReference | null;
  onStyleReferenceChange: (file: File | null) => void;
  isOutOfCredits: boolean;
}

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.293 2.293a1 1 0 011.414 0l.001.001a1 1 0 010 1.414l-11 11a1 1 0 01-1.415-1.414l11-11zM11 7a1 1 0 100-2 1 1 0 000 2zm3-3a1 1 0 100-2 1 1 0 000 2zm-6 6a1 1 0 100-2 1 1 0 000 2zm-3 3a1 1 0 100-2 1 1 0 000 2zM3 7a1 1 0 100-2 1 1 0 000 2z" />
      <path fillRule="evenodd" d="M5 2a1 1 0 011-1h1.586l1.293-1.293a1 1 0 111.414 1.414L9.414 2H11a1 1 0 010 2H9.414l-1.293 1.293a1 1 0 11-1.414-1.414L8.414 3H7a1 1 0 01-1-1H5zm10 10a1 1 0 011-1h1.586l1.293-1.293a1 1 0 111.414 1.414L17.414 13H19a1 1 0 110 2h-1.586l-1.293 1.293a1 1 0 01-1.414-1.414L16.414 14H15a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

const VariationsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-5.571 3m-5.571 0l5.571 3m0 0l5.571-3m0 0l4.179-2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
);

const Tooltip = ({ text }: { text: string }) => (
    <span className="absolute bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {text}
    </span>
);

const PromptInput: React.FC<PromptInputProps> = ({ 
    prompt, setPrompt, onEdit, onGenerateVariations, isLoading, hasImage, isMaskActive, styleReference, onStyleReferenceChange, isOutOfCredits
}) => {
  const isEditDisabled = isLoading || !hasImage || (!prompt.trim() && !isMaskActive) || isOutOfCredits;
  const isVariationsDisabled = isLoading || !hasImage || !prompt.trim() || isOutOfCredits;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isEditDisabled) {
        e.preventDefault();
        onEdit();
    }
  };

  const placeholderText = isMaskActive 
    ? "Describe what to add, or leave blank to generative fill..."
    : "Describe your edit or select an AI style...";

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholderText}
          className="w-full h-24 bg-black/20 border border-white/10 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow resize-none"
          onKeyDown={handleKeyDown}
          aria-label="Editing prompt"
        />
         <span className="absolute top-3 right-3 text-gray-500 text-xs">↵</span>
      </div>
      <StyleReferenceUploader
        styleReference={styleReference}
        onStyleReferenceChange={onStyleReferenceChange}
        isDisabled={isLoading}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="relative group">
            <button
                onClick={onEdit}
                disabled={isEditDisabled}
                className="w-full relative flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform"
                aria-label="Apply prompt edit"
            >
                <span className="absolute top-0 left-0 w-full h-full rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" style={{boxShadow: '0 0 15px 3px rgba(34, 211, 238, 0.6)'}}></span>
                <WandIcon />
                <span>{isLoading ? 'Editing...' : 'Apply Edit'}</span>
            </button>
            {isOutOfCredits && <Tooltip text="Out of credits. Upgrade or watch an ad." />}
        </div>
         <div className="relative group">
            <button
                onClick={onGenerateVariations}
                disabled={isVariationsDisabled}
                className="w-full relative flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform"
                aria-label="Generate 3 variations"
            >
                <span className="absolute top-0 left-0 w-full h-full rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" style={{boxShadow: '0 0 15px 3px rgba(129, 140, 248, 0.6)'}}></span>
                <VariationsIcon />
                <span>{isLoading ? 'Working...' : '3 Variations'}</span>
            </button>
            {isOutOfCredits && <Tooltip text="Out of credits. Upgrade or watch an ad." />}
        </div>
      </div>
    </div>
  );
};

export default PromptInput;