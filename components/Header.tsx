
import React from 'react';
import StudioModeToggle from './StudioModeToggle';
import type { AppMode, UserState, AuthUser } from '../types';

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const AdIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
    </svg>
);

const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
);

interface HeaderProps {
    appMode: AppMode;
    setAppMode: (mode: AppMode) => void;
    onReset: () => void;
    showReset: boolean;
    userState: UserState;
    onGoPro: () => void;
    onWatchAd: () => void;
    onToggleAdminPanel: () => void;
    handleAdminClick: () => void;
    currentUser: AuthUser | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    appMode, setAppMode, onReset, showReset, userState, onGoPro, onWatchAd, onToggleAdminPanel, handleAdminClick, currentUser, onLogout
}) => {
  const showAdButton = userState.plan === 'free' && userState.credits < 5 && userState.rewardedAdsWatchedToday < 5;

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleAdminClick} title="Click 5 times for admin access">
            <CameraIcon />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-white">
                AI Creative Suite
              </h1>
              <p className="text-xs text-gray-400">Ultimate Edition</p>
            </div>
        </div>
        
        <div className="hidden sm:flex mx-auto">
            <StudioModeToggle appMode={appMode} setAppMode={setAppMode} isPro={userState.plan === 'pro'} />
        </div>

        <div className="ml-auto flex items-center gap-2">
            {showAdButton && (
                <button
                    onClick={onWatchAd}
                    className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-300 font-semibold rounded-lg hover:bg-green-600/50 transition-all"
                >
                    <AdIcon />
                    <span>Watch Ad (+1)</span>
                </button>
            )}

            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 text-gray-200 font-semibold rounded-lg">
              <span>Credits: {userState.credits}</span>
            </div>
            
            {userState.plan === 'free' && (
              <button
                onClick={onGoPro}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-all"
              >
                Go Pro
              </button>
            )}

            {showReset && (
              <button 
                onClick={onReset} 
                className="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/50 transition-all text-sm font-semibold"
              >
                Reset
              </button>
            )}

            {currentUser && (
              <>
                <div className="h-6 w-px bg-white/10 mx-1"></div>
                <span className="hidden lg:inline text-sm text-gray-300">{currentUser.email}</span>
                {userState.isAdmin && (
                  <button onClick={onToggleAdminPanel} className="p-2.5 bg-yellow-600/20 text-yellow-300 rounded-lg hover:bg-yellow-600/50" title="Admin Panel">
                    <AdminIcon />
                  </button>
                )}
                <button onClick={onLogout} className="p-2.5 bg-white/10 text-gray-200 rounded-lg hover:bg-white/20" title="Logout">
                  <LogoutIcon />
                </button>
              </>
            )}
        </div>
      </div>
    </header>
  );
};
export default Header;