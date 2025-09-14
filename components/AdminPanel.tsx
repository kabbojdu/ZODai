
import React, { useState } from 'react';
import type { UserState, UserPlan } from '../types';

interface AdminPanelProps {
  userState: UserState;
  allUserProfiles: Record<string, UserState>;
  onClose: () => void;
  onSetCredits: (amount: number) => void;
  onSetPlan: (plan: UserPlan) => void;
}

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ userState, allUserProfiles, onClose, onSetCredits, onSetPlan }) => {
    const [creditInput, setCreditInput] = useState<string>(userState.credits.toString());

    const handleCreditSet = () => {
        const amount = parseInt(creditInput, 10);
        if (!isNaN(amount)) {
            onSetCredits(amount);
        }
    };
    
    const premiumSubscribers = Object.entries(allUserProfiles)
        .filter(([, profile]) => profile.plan === 'pro')
        .map(([userId, profile]) => ({
            id: userId,
            subscribedAt: new Date(profile.lastCreditReset).toISOString() // Using lastCreditReset as a proxy for subscription date
        }));

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-gray-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {/* Premium Subscribers */}
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Premium Subscribers</h3>
                         <div className="max-h-48 overflow-y-auto pr-2">
                            {premiumSubscribers.length > 0 ? (
                                <ul className="space-y-2">
                                    {premiumSubscribers.map(sub => (
                                        <li key={sub.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center text-sm">
                                            <p className="font-mono text-gray-300 truncate">{sub.id}</p>
                                            <p className="text-xs text-gray-400 flex-shrink-0 ml-4">Subscribed: {new Date(sub.subscribedAt).toLocaleDateString()}</p>

                                        </li>
                                    ))}
                                </ul>
                             ) : (
                                <p className="text-gray-500 text-center py-4">No premium subscribers yet.</p>
                             )}
                        </div>
                    </div>
                
                    {/* Current User Management */}
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Current User Management</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Subscription Plan</label>
                                <div className="flex gap-2">
                                    <button onClick={() => onSetPlan('free')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${userState.plan === 'free' ? 'bg-cyan-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                                        Free
                                    </button>
                                    <button onClick={() => onSetPlan('pro')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${userState.plan === 'pro' ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                                        Pro
                                    </button>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm text-gray-400 block mb-2">Set Credits</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number"
                                        value={creditInput}
                                        onChange={(e) => setCreditInput(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow"
                                    />
                                    <button onClick={handleCreditSet} className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-500">
                                        Set
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usage History */}
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Usage History (Current User)</h3>
                        <div className="max-h-80 overflow-y-auto pr-2">
                            {userState.usageLog.length > 0 ? (
                                <ul className="space-y-2">
                                    {userState.usageLog.map(log => (
                                        <li key={log.id} className="bg-black/20 p-3 rounded-lg flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-semibold text-gray-200">{log.featureUsed.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                                <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                            </div>
                                            <div className={`font-mono px-2 py-1 rounded text-xs ${log.creditsSpent > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {log.creditsSpent > 0 ? `-${log.creditsSpent}` : log.creditsSpent < 0 ? `+${-log.creditsSpent}` : '0'}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No usage recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;