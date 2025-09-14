
import React, { useCallback, useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4 transition-colors duration-300 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageSelect(event.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = () => setIsDragging(true);
  const handleDragLeave = () => setIsDragging(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const borderStyle = isDragging ? 'border-cyan-500' : 'border-gray-600/50 group-hover:border-cyan-500/50';

  return (
    <div 
        className="w-full max-w-2xl flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl bg-white/5 backdrop-blur-sm transition-all duration-300 cursor-pointer group"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
    >
        <div className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed ${borderStyle} rounded-xl p-8`}>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
            <UploadIcon />
            <p className="text-xl font-semibold text-gray-300">
                Drag & Drop or <span className="text-cyan-400 font-bold">Click to Upload</span>
            </p>
            <p className="text-gray-500 mt-2">Recommended: High-resolution PNG, JPG, or WEBP</p>
        </div>
    </div>
  );
};

export default ImageUploader;