
import React, { useState } from 'react';
import AdvancedOptions from './AdvancedOptions';
import type { AspectRatio } from '../types';

interface GenerationInputProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    negativePrompt: string;
    setNegativePrompt: (prompt: string) => void;
    onGenerate: (aspectRatio: AspectRatio) => void;
    isLoading: boolean;
    isOutOfCredits: boolean;
}

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-6.857 2.143L12 21l-2.143-6.857L3 12l6.857-2.143L12 3z" />
    </svg>
);

const Tooltip = ({ text }: { text: string }) => (
    <span className="absolute bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {text}
    </span>
);

const aspectRatios: { id: AspectRatio, name: string }[] = [
    { id: '1:1', name: 'Square' },
    { id: '16:9', name: 'Landscape' },
    { id: '9:16', name: 'Portrait' },
    { id: '4:3', name: 'Standard' },
    { id: '3:4', name: 'Tall' },
];

const GenerationInput: React.FC<GenerationInputProps> = ({
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    onGenerate,
    isLoading,
    isOutOfCredits
}) => {
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('1:1');
    const isDisabled = isLoading || !prompt.trim() || isOutOfCredits;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
            e.preventDefault();
            onGenerate(selectedAspectRatio);
        }
    };
    
    return (
        <div className="w-full max-w-2xl flex flex-col gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center text-white">
                Describe Your Vision
            </h2>
            <div className="relative w-full">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A photorealistic image of a cat wearing a wizard hat, magical library background..."
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow resize-none text-lg"
                    onKeyDown={handleKeyDown}
                    aria-label="Image generation prompt"
                    disabled={isLoading}
                />
                <span className="absolute top-3 right-3 text-gray-500 text-xs">↵</span>
            </div>
            
            <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 px-1">Aspect Ratio</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {aspectRatios.map(({ id, name }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedAspectRatio(id)}
                            disabled={isLoading}
                            className={`px-2 py-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 ${
                                selectedAspectRatio === id
                                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                                : 'bg-white/5 hover:bg-white/10 text-gray-200'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <AdvancedOptions 
                negativePrompt={negativePrompt}
                setNegativePrompt={setNegativePrompt}
                isDisabled={isLoading}
            />

            <div className="relative group">
                <button
                    onClick={() => onGenerate(selectedAspectRatio)}
                    disabled={isDisabled}
                    className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-cyan-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform"
                    aria-label="Generate Image"
                >
                    <span className="absolute top-0 left-0 w-full h-full rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" style={{boxShadow: '0 0 15px 3px rgba(34, 211, 238, 0.6)'}}></span>
                    <SparklesIcon />
                    <span>{isLoading ? 'Creating...' : 'Generate Image'}</span>
                </button>
                {isOutOfCredits && <Tooltip text="Out of credits. Upgrade or watch an ad." />}
            </div>
        </div>
    );
}

export default GenerationInput;