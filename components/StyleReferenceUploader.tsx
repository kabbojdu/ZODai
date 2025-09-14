
import React, { useRef } from 'react';
import type { StyleReference } from '../types';

interface StyleReferenceUploaderProps {
  styleReference: StyleReference | null;
  onStyleReferenceChange: (file: File | null) => void;
  isDisabled: boolean;
}

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const StyleReferenceUploader: React.FC<StyleReferenceUploaderProps> = ({ styleReference, onStyleReferenceChange, isDisabled }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onStyleReferenceChange(event.target.files[0]);
        }
        event.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onStyleReferenceChange(null);
    }
    
    if (styleReference) {
        return (
            <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-400">Style:</p>
                <div className="relative group">
                    <img 
                        src={styleReference.dataUrl} 
                        alt="Style Reference" 
                        className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500"
                    />
                     <button
                        onClick={handleClear}
                        disabled={isDisabled}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        aria-label="Remove style reference"
                    >
                        <ClearIcon />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                disabled={isDisabled}
            />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={isDisabled}
                className="flex items-center gap-2 px-4 py-2 bg-black/20 text-gray-200 text-sm font-medium rounded-lg shadow-sm hover:bg-white/10 hover:text-white disabled:bg-black/20 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Upload style reference"
            >
                <PlusIcon />
                Add Style Reference
            </button>
        </div>
    );
};

export default StyleReferenceUploader;