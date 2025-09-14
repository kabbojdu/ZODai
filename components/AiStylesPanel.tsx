
import React from 'react';
import type { AiStyle } from '../types';

interface AiStylesPanelProps {
    onSelectStyle: (prompt: string) => void;
    isLoading: boolean;
}

const styles: AiStyle[] = [
    { id: 'anime', name: 'Anime', prompt: 'masterpiece, modern anime style, vibrant, cel-shaded, sharp lines, cinematic', imageUrl: 'https://placehold.co/100x100/3B82F6/FFFFFF?text=Anime' },
    { id: 'claymation', name: 'Claymation', prompt: 'charming claymation style, stop-motion look, handcrafted, textured, detailed', imageUrl: 'https://placehold.co/100x100/F97316/FFFFFF?text=Clay' },
    { id: 'cinematic', name: 'Cinematic', prompt: 'cinematic still, dramatic lighting, high detail, professional color grading, film grain', imageUrl: 'https://placehold.co/100x100/10B981/FFFFFF?text=Film' },
    { id: 'vintage', name: 'Vintage Film', prompt: 'vintage 1970s film photograph, grainy, warm tones, nostalgic, slight motion blur', imageUrl: 'https://placehold.co/100x100/A16207/FFFFFF?text=70s' },
    { id: 'sketch', name: 'Pencil Sketch', prompt: 'detailed pencil sketch, hand-drawn, artistic, cross-hatching, monochrome', imageUrl: 'https://placehold.co/100x100/6B7280/FFFFFF?text=Sketch' },
    { id: 'pixel-art', name: 'Pixel Art', prompt: '8-bit pixel art style, vibrant retro colors, detailed sprites, nostalgic gaming aesthetic', imageUrl: 'https://placehold.co/100x100/8B5CF6/FFFFFF?text=8-Bit' },
];

const AiStylesPanel: React.FC<AiStylesPanelProps> = ({ onSelectStyle, isLoading }) => {
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 px-1">AI Styles</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {styles.map(style => (
                    <button
                        key={style.id}
                        onClick={() => onSelectStyle(style.prompt)}
                        disabled={isLoading}
                        className="group relative aspect-square flex flex-col items-center justify-end p-2 bg-black/20 rounded-lg shadow-sm hover:bg-white/10 disabled:bg-black/20 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-100 disabled:scale-100 overflow-hidden"
                        aria-label={`Apply ${style.name} style`}
                    >
                       <img src={style.imageUrl} alt={style.name} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                       <span className="relative text-xs font-semibold text-white z-10">{style.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AiStylesPanel;