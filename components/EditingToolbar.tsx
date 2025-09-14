
import React from 'react';
import type { ActiveTool } from '../types';

interface EditingToolbarProps {
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onClearMask: () => void;
  isDisabled?: boolean;
  onErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPro: boolean;
}

const FillReplaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
    </svg>
);

const EraseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M13.477 2.523a1.75 1.75 0 012.475 2.475L8.23 12.72a1.75 1.75 0 01-1.238.51l-2.25.001a1.75 1.75 0 01-1.59-2.433L6.002 4.974a1.75 1.75 0 012.474-2.45l5.001-.001zM4.524 14.842l1.99 1.99a1.75 1.75 0 002.475-2.475L7.001 12.37l-2.476 2.472z" clipRule="evenodd" />
    </svg>
);

const MagicWandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622-3.385m-5.043.025a15.998 15.998 0 01-3.388-1.621m7.543 8.342a15.998 15.998 0 00-3.388-1.622m-5.043-.025a15.998 15.998 0 01-1.622-3.385m5.043.025a15.998 15.998 0 00-1.622-3.385M15 2.25a3 3 0 00-3 3v.167c0 .482.308.926.75 1.125a3 3 0 003.75 0c.442-.199.75-.643.75-1.125V5.25a3 3 0 00-3-3z" />
    </svg>
);

const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 4a1 1 0 00-1 1v1H8a1 1 0 000 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V5a1 1 0 00-1-1zM3 3a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1H3zm14 0a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V4a1 1 0 00-1-1h-4zM3 13a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1H3zm14 0a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1h-4z" />
    </svg>
);

const CutoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const BrushIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
);

const RedoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const Tooltip = ({ text }: { text: string }) => (
    <span className="absolute bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded-lg py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {text}
    </span>
);

const EditingToolbar: React.FC<EditingToolbarProps> = ({ 
    activeTool, onToolChange, brushSize, onBrushSizeChange, onClearMask, isDisabled, onErase, onUndo, onRedo, canUndo, canRedo, isPro
}) => {
  const showBrushControls = activeTool === 'mask' || activeTool === 'erase';

  const getToolClass = (tool: ActiveTool) => {
    const isActive = activeTool === tool;
    let colorClasses = '';
    
    switch(tool) {
        case 'mask': colorClasses = isActive ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/40' : 'bg-white/5 hover:bg-white/10 text-gray-200'; break;
        case 'erase': colorClasses = isActive ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/40' : 'bg-white/5 hover:bg-white/10 text-gray-200'; break;
        case 'magic': colorClasses = isActive ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/40' : 'bg-white/5 hover:bg-white/10 text-gray-200'; break;
        case 'expand': colorClasses = isActive ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/40' : 'bg-white/5 hover:bg-white/10 text-gray-200'; break;
        case 'cutout': colorClasses = isActive ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/40' : 'bg-white/5 hover:bg-white/10 text-gray-200'; break;
    }
    
    return `relative flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 ${colorClasses}`;
  }

  return (
    <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-4 w-full">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <div className="relative group">
            <button onClick={onUndo} disabled={!canUndo || isDisabled} className="p-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 bg-white/5 hover:bg-white/10 text-gray-200">
                <UndoIcon />
            </button>
            <Tooltip text="Undo (Ctrl+Z)" />
        </div>
         <div className="relative group">
            <button onClick={onRedo} disabled={!canRedo || isDisabled} className="p-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 bg-white/5 hover:bg-white/10 text-gray-200">
                <RedoIcon />
            </button>
            <Tooltip text="Redo (Ctrl+Y)" />
        </div>

        <div className="h-6 w-px bg-white/10 mx-2"></div>
        
        <div className="relative group">
            <button onClick={() => onToolChange(activeTool === 'cutout' ? null : 'cutout')} disabled={isDisabled} className={getToolClass('cutout')}>
                {!isPro && <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">PRO</span>}
                <CutoutIcon /> <span className="hidden md:inline">Cutout</span>
            </button>
            <Tooltip text="Remove background" />
        </div>
        <div className="relative group">
            <button onClick={() => onToolChange(activeTool === 'mask' ? null : 'mask')} disabled={isDisabled} className={getToolClass('mask')}>
                <FillReplaceIcon /> <span className="hidden md:inline">Fill / Replace</span>
            </button>
            <Tooltip text="Fill or replace part of the image" />
        </div>
        <div className="relative group">
            <button onClick={() => onToolChange(activeTool === 'erase' ? null : 'erase')} disabled={isDisabled} className={getToolClass('erase')}>
                <EraseIcon /> <span className="hidden md:inline">Erase</span>
            </button>
            <Tooltip text="Remove unwanted objects" />
        </div>
        <div className="relative group">
            <button onClick={() => onToolChange(activeTool === 'magic' ? null : 'magic')} disabled={isDisabled} className={getToolClass('magic')}>
                <MagicWandIcon /> <span className="hidden md:inline">Magic</span>
            </button>
            <Tooltip text="Add new objects" />
        </div>
         <div className="relative group">
            <button onClick={() => onToolChange(activeTool === 'expand' ? null : 'expand')} disabled={isDisabled} className={getToolClass('expand')}>
                <ExpandIcon /> <span className="hidden md:inline">Expand</span>
            </button>
            <Tooltip text="Expand canvas (Outpainting)" />
        </div>
      </div>
      
      {showBrushControls && (
        <div className="flex items-center gap-4 sm:ml-auto w-full sm:w-auto justify-center">
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-2">
                <BrushIcon />
                <input
                    type="range"
                    min="2"
                    max="150"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                    className="w-24 md:w-32 accent-cyan-500"
                    disabled={isDisabled}
                    aria-label="Brush size"
                />
            </div>
            <div className="relative group">
                <button onClick={onClearMask} disabled={isDisabled} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                    <ClearIcon />
                </button>
                <Tooltip text="Clear selection" />
            </div>
             {activeTool === 'erase' && (
                <button 
                    onClick={onErase} 
                    disabled={isDisabled}
                    className="px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/40"
                >
                    Confirm Erase
                </button>
            )}
        </div>
      )}
    </div>
  );
};
export default EditingToolbar;