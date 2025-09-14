
import React, { useState, useRef, useEffect } from 'react';

interface MagicToolModalProps {
  onSubmit: (objectPrompt: string) => void;
  onClose: () => void;
}

const MagicToolModal: React.FC<MagicToolModalProps> = ({ onSubmit, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50" onClick={onClose}>
        <div 
            className="bg-gray-900/50 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
            <form onSubmit={handleSubmit}>
                <label htmlFor="magic-prompt" className="block text-lg font-semibold text-gray-100 mb-3">
                    What should be here?
                </label>
                <input
                    ref={inputRef}
                    id="magic-prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., a top hat"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
                />
                <div className="flex justify-end gap-3 mt-4">
                     <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!prompt.trim()}
                        className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        Place
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default MagicToolModal;