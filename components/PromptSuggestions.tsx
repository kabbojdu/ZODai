
import React from 'react';

interface PromptSuggestionsProps {
  onSelect: (suggestion: string) => void;
  isDisabled: boolean;
}

const suggestions = [
  'Photorealistic',
  'Cinematic Lighting',
  '4K',
  'Masterpiece',
  'Epic',
  'Fantasy Art',
  'Vibrant Colors',
  'Minimalist',
];

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelect, isDisabled }) => {
  return (
    <div>
        <div className="flex flex-wrap gap-2">
            {suggestions.map(suggestion => (
                <button
                    key={suggestion}
                    onClick={() => onSelect(suggestion)}
                    disabled={isDisabled}
                    className="px-3 py-1 bg-black/20 text-xs text-gray-300 font-medium rounded-full hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    aria-label={`Add suggestion: ${suggestion}`}
                >
                    + {suggestion}
                </button>
            ))}
        </div>
    </div>
  );
};

export default PromptSuggestions;