
import React from 'react';

interface VideoGenerationInputProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isOutOfCredits: boolean;
}

const FilmIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
);

const Tooltip = ({ text }: { text: string }) => (
    <span className="absolute bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {text}
    </span>
);


const VideoGenerationInput: React.FC<VideoGenerationInputProps> = ({
    prompt,
    setPrompt,
    onGenerate,
    isLoading,
    isOutOfCredits
}) => {
    const isDisabled = isLoading || !prompt.trim() || isOutOfCredits;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
            e.preventDefault();
            onGenerate();
        }
    };
    
    return (
        <div className="w-full max-w-2xl flex flex-col gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-center text-white">
                Describe Your Video Scene
            </h2>
            <div className="relative w-full">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A majestic cinematic shot of a futuristic city with flying vehicles..."
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow resize-none text-lg"
                    onKeyDown={handleKeyDown}
                    aria-label="Video generation prompt"
                    disabled={isLoading}
                />
                <span className="absolute top-3 right-3 text-gray-500 text-xs">↵</span>
            </div>

            <div className="relative group">
                <button
                    onClick={onGenerate}
                    disabled={isDisabled}
                    className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-cyan-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform"
                    aria-label="Generate Video"
                >
                    <span className="absolute top-0 left-0 w-full h-full rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" style={{boxShadow: '0 0 15px 3px rgba(34, 211, 238, 0.6)'}}></span>
                    <FilmIcon />
                    <span>{isLoading ? 'Creating...' : 'Generate Video'}</span>
                </button>
                {isOutOfCredits && <Tooltip text="Out of credits. Upgrade or watch an ad." />}
            </div>
        </div>
    );
}

export default VideoGenerationInput;