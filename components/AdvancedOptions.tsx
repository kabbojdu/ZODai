
import React from 'react';

interface AdvancedOptionsProps {
    negativePrompt: string;
    setNegativePrompt: (prompt: string) => void;
    isDisabled: boolean;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ negativePrompt, setNegativePrompt, isDisabled }) => {
    return (
        <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-white">
                Advanced Options
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </summary>
            <div className="mt-4">
                <label htmlFor="negative-prompt" className="block text-xs font-medium text-gray-300 mb-1">
                    Negative Prompt
                </label>
                <textarea
                    id="negative-prompt"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    disabled={isDisabled}
                    placeholder="e.g., blurry, text, watermark..."
                    className="w-full h-16 bg-black/20 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow resize-none text-sm"
                    aria-label="Negative prompt"
                />
            </div>
        </details>
    );
};

export default AdvancedOptions;