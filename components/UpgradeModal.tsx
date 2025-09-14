
import React, { useState, useEffect } from 'react';

// QR code image provided by the user, hosted for use in the app
const BINANCE_QR_CODE_URL = "https://i.ibb.co/L9fK72b/image.png";

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M21.926 3.116a2.35 2.35 0 0 0-2.32-2.32c-.37.008-.733.125-1.049.33L3.48 8.196a2.35 2.35 0 0 0 .28 4.417l4.545 1.515 1.516 4.545a2.35 2.35 0 0 0 4.416.281l7.07-15.076a2.35 2.35 0 0 0-.332-2.762Zm-4.99 2.529-6.28 5.656-3.23-1.076 9.51-7.095ZM9.89 17.618l-1.077-3.23L14.47 8.73l-7.096 9.51Z"/>
    </svg>
);

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleConfirmPayment = () => {
        setIsProcessing(true);
        // Simulate a network request for payment verification
        setTimeout(() => {
            onUpgrade();
            onClose();
        }, 1500);
    };

    const features = [
        { name: "Daily Credits", free: "5", pro: "Unlimited" },
        { name: "Image Generation", free: true, pro: true },
        { name: "Advanced Editing Tools", free: true, pro: true },
        { name: "Ad-Free Experience", free: false, pro: true },
        { name: "4K Enhancement", free: false, pro: true },
        { name: "AI Background Cutout", free: false, pro: true },
        { name: "AI Video Generation", free: false, pro: true },
        { name: "Team Features", free: false, pro: true },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-gray-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Pro</h2>
                    <p className="text-gray-400 mb-8">Unlock your full creative potential.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 pb-8">
                    {/* Features Table */}
                    <div className="bg-white/5 p-6 rounded-lg">
                        <div className="space-y-4">
                            {features.map(feature => (
                                <div key={feature.name} className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <span className="text-gray-300">{feature.name}</span>
                                    <div className="flex items-center gap-8">
                                        <span className="w-16 text-center">
                                            {typeof feature.free === 'boolean' ? (feature.free ? <CheckIcon/> : <XIcon/>) : feature.free}
                                        </span>
                                        <span className="w-16 text-center font-bold text-cyan-400">
                                            {typeof feature.pro === 'boolean' ? (feature.pro ? <CheckIcon/> : <XIcon/>) : feature.pro}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white/5 p-6 rounded-lg flex flex-col items-center justify-center">
                        <h3 className="text-xl font-semibold mb-4">Pay with Binance</h3>
                        <p className="text-gray-400 text-sm mb-4">Scan the QR code with your Binance app to complete the payment.</p>
                        <div className="bg-white p-2 rounded-lg shadow-lg">
                            <img src={BINANCE_QR_CODE_URL} alt="Binance Payment QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-gray-400 text-xs mt-4">Simulated payment for demonstration.</p>
                        
                        <div className="w-full mt-auto pt-6">
                            <p className="text-4xl font-bold text-white text-center mb-4">$50<span className="text-lg text-gray-400">/month</span></p>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={isProcessing}
                                className="w-full px-6 py-4 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-gray-600 transition-all"
                            >
                                {isProcessing ? "Processing..." : "I've Sent The Payment"}
                            </button>
                             <div className="mt-4 text-center">
                                <a 
                                    href="https://t.me/kabbo343434" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-3 px-4 py-2 bg-sky-500/10 text-sky-300 font-semibold rounded-lg hover:bg-sky-500/20 transition-all text-sm"
                                >
                                    <TelegramIcon />
                                    <span>Contact Admin</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;