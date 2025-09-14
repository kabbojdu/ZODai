
import React from 'react';

interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-cyan-500 opacity-20 animate-ping"></div>
        <div className="absolute inset-2 rounded-full bg-cyan-500 opacity-30 animate-ping" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 shadow-lg shadow-cyan-500/50"></div>
        </div>
      </div>
      <p className="mt-8 text-lg font-semibold text-gray-200 tracking-wider">{message || 'AI is creating...'}</p>
      <p className="text-sm text-gray-400">This can take a moment.</p>
    </div>
  );
};

export default Loader;