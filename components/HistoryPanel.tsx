
import React from 'react';
import type { HistoryState } from '../types';

interface HistoryPanelProps {
  history: HistoryState[];
  onRevert: (historyItem: HistoryState) => void;
}

const RevertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5a2.25 2.25 0 002.25-2.25v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" />
    </svg>
)

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRevert }) => {
    if (history.length === 0) {
        return null;
    }
    
    return (
        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Edit History</h3>
            <div className="flex overflow-x-auto gap-3 pb-2">
                {history.map((item, index) => (
                    <div key={item.id} className="group relative flex-shrink-0">
                        <img 
                            src={item.images[0].dataUrl} 
                            alt={`History ${index + 1}`}
                            className="w-20 h-20 rounded-lg object-cover border-2 border-transparent group-hover:border-cyan-500 transition-colors"
                        />
                        <div 
                            className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => onRevert(item)}
                        >
                           <div className="text-center text-white">
                             <p className="text-xs font-bold">Revert</p>
                           </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;