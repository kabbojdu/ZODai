
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptInput from './components/PromptInput';
import ImageDisplay from './components/ImageDisplay';
import ErrorDisplay from './components/ErrorDisplay';
import useCreativeStudio from './hooks/useCreativeStudio';
import EditingToolbar from './components/EditingToolbar';
import InteractiveCanvas from './components/InteractiveCanvas';
import MagicToolModal from './components/MagicToolModal';
import AiStylesPanel from './components/AiStylesPanel';
import HistoryPanel from './components/HistoryPanel';
import AdvancedOptions from './components/AdvancedOptions';
import GenerationInput from './components/GenerationInput';
import VideoGenerationInput from './components/VideoGenerationInput';
import Loader from './components/Loader';
import PromptSuggestions from './components/PromptSuggestions';
import useUser from './hooks/useUser';
import UpgradeModal from './components/UpgradeModal';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import Auth from './components/Auth';
import useAuth from './hooks/useAuth';
import Notification from './components/Notification';
import type { AspectRatio, TrackableFeatures, Notification as NotificationType } from './types';

const CreativeSuite: React.FC<{ userHook: ReturnType<typeof useUser>, authHook: ReturnType<typeof useAuth>, addNotification: (message: string, type?: NotificationType['type']) => void }> = ({ userHook, authHook, addNotification }) => {
  const { userState, allUserProfiles, spendCredits, earnCreditFromAd, upgradeToPro, setUserCredits, setUserPlan, handleAdminClick, showAdminLoginModal, setShowAdminLoginModal, handleAdminLogin } = userHook;
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const studio = useCreativeStudio(addNotification);

  const handleActionWithCredits = (cost: number, feature: TrackableFeatures, actionFn: () => void) => {
    if (userState.plan === 'pro' || userState.credits >= cost) {
      actionFn();
      spendCredits(cost, feature);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleProFeature = (feature: TrackableFeatures, actionFn: () => void) => {
    if (userState.plan === 'pro') {
      actionFn();
      spendCredits(0, feature); // Still log the usage for pro users
    } else {
      setShowUpgradeModal(true);
    }
  };

  const [isEditorVisible, setIsEditorVisible] = useState(false);

  useEffect(() => {
    if (studio.originalImage) {
      const timer = setTimeout(() => setIsEditorVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsEditorVisible(false);
    }
  }, [studio.originalImage]);

  const handleStyleSelect = (stylePrompt: string) => {
    const newPrompt = `${studio.prompt} ${stylePrompt}`.trim();
    studio.setPrompt(newPrompt);
    handleActionWithCredits(1, 'style_filter', () => setTimeout(() => studio.handleEditImage(newPrompt), 0));
  };

  const handleSuggestionSelect = (suggestion: string) => {
    studio.setPrompt(prev => prev ? `${prev}, ${suggestion}` : suggestion);
  };

  const isOutOfCredits = userState.plan === 'free' && userState.credits <= 0;

  const renderGenerationView = () => (
    <div className="flex-grow flex flex-col items-center justify-center p-4 w-full">
      {studio.isLoading && <Loader message={studio.loadingMessage} />}
      <GenerationInput
        prompt={studio.prompt}
        setPrompt={studio.setPrompt}
        negativePrompt={studio.negativePrompt}
        setNegativePrompt={studio.setNegativePrompt}
        onGenerate={(aspectRatio: AspectRatio) => handleActionWithCredits(1, 'image_generation', () => studio.handleGenerateImage(studio.prompt, studio.negativePrompt, aspectRatio))}
        isLoading={studio.isLoading}
        isOutOfCredits={isOutOfCredits}
      />
      <div className="my-8 flex items-center w-full max-w-2xl">
        <div className="flex-grow border-t border-gray-600"></div>
        <span className="flex-shrink mx-4 text-gray-400 font-semibold">OR</span>
        <div className="flex-grow border-t border-gray-600"></div>
      </div>
      <ImageUploader onImageSelect={studio.handleImageSelect} />
      {studio.error && !studio.isLoading && (
        <div className="mt-8 w-full max-w-2xl">
          <ErrorDisplay message={studio.error} />
        </div>
      )}
    </div>
  );

  const renderEditorView = () => (
    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="flex flex-col gap-4">
        <div className="relative">
          {studio.activeTool && ['mask', 'magic', 'expand', 'erase', 'cutout'].includes(studio.activeTool) ? (
            <InteractiveCanvas
              imageUrl={studio.originalImage!.dataUrl}
              brushSize={studio.brushSize}
              onMaskChange={studio.setMaskDataUrl}
              externalClear={!studio.maskDataUrl}
              activeTool={studio.activeTool}
              onMagicToolSelect={studio.setMagicToolCoords}
              onExpandConfirm={(expanded, mask) => handleActionWithCredits(1, 'expand_canvas', () => studio.handleExpandImage(expanded, mask))}
            />
          ) : (
            <ImageDisplay title="Original" images={[{ dataUrl: studio.originalImage!.dataUrl, text: '' }]} />
          )}
          {studio.magicToolCoords && (
            <MagicToolModal
              onSubmit={(objectPrompt) => handleActionWithCredits(1, 'magic_tool', () => studio.handleMagicToolPlacement(objectPrompt, studio.magicToolCoords!))}
              onClose={() => studio.setMagicToolCoords(null)}
            />
          )}
        </div>
        <EditingToolbar
          activeTool={studio.activeTool}
          onToolChange={(tool) => {
            if (tool === 'cutout') {
              handleProFeature('background_cutout', () => studio.setActiveTool(tool));
            } else {
              studio.setActiveTool(tool);
            }
          }}
          brushSize={studio.brushSize}
          onBrushSizeChange={studio.setBrushSize}
          onClearMask={studio.clearMask}
          isDisabled={studio.isLoading}
          onErase={() => handleActionWithCredits(1, 'erase_tool', studio.handleErase)}
          onUndo={studio.handleUndo}
          onRedo={studio.handleRedo}
          canUndo={studio.canUndo}
          canRedo={studio.canRedo}
          isPro={userState.plan === 'pro'}
        />
      </div>

      <div className={`flex flex-col gap-6 transition-all duration-700 ease-in-out ${isEditorVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 flex flex-col gap-6">
          <PromptInput
            prompt={studio.prompt}
            setPrompt={studio.setPrompt}
            onEdit={() => handleActionWithCredits(1, 'image_edit', () => studio.handleEditImage())}
            onGenerateVariations={() => handleActionWithCredits(1, 'image_variation', () => studio.handleGenerateVariations(3))}
            isLoading={studio.isLoading}
            hasImage={!!studio.originalImage}
            isMaskActive={studio.activeTool === 'mask' && !!studio.maskDataUrl}
            styleReference={studio.styleReference}
            onStyleReferenceChange={studio.setStyleReference}
            isOutOfCredits={isOutOfCredits}
          />
          <PromptSuggestions onSelect={handleSuggestionSelect} isDisabled={studio.isLoading} />
          <AiStylesPanel onSelectStyle={handleStyleSelect} isLoading={studio.isLoading} />
          <AdvancedOptions
            negativePrompt={studio.negativePrompt}
            setNegativePrompt={studio.setNegativePrompt}
            isDisabled={studio.isLoading}
          />
          {studio.error && !studio.isLoading && <ErrorDisplay message={studio.error} />}
        </div>
        <div className="flex-grow flex flex-col">
          <ImageDisplay
            title="Edited"
            images={studio.editedImages}
            isLoading={studio.isLoading}
            loadingMessage={studio.loadingMessage}
            on4kEnhance={() => handleProFeature('4k_enhance', () => handleActionWithCredits(1, '4k_enhance', studio.handle4kEnhance))}
            isPro={userState.plan === 'pro'}
          />
        </div>
        <HistoryPanel history={studio.history} onRevert={studio.revertToHistoryState} />
      </div>
    </div>
  );

  const renderVideoView = () => (
    <div className="flex-grow flex flex-col items-center justify-center p-4 w-full">
      {studio.videoUrl ? (
        <div className="w-full max-w-3xl flex flex-col gap-4 items-center">
          <h2 className="text-2xl font-bold text-white mb-4">Your Video is Ready!</h2>
          <video src={studio.videoUrl} controls autoPlay loop className="rounded-2xl shadow-lg border border-white/10 w-full aspect-video" />
          <a
            href={studio.videoUrl}
            download={`ai-studio-video-${Date.now()}.mp4`}
            className="mt-4 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 transition-all"
          >
            Download Video
          </a>
        </div>
      ) : (
        <VideoGenerationInput
          prompt={studio.videoPrompt}
          setPrompt={studio.setVideoPrompt}
          onGenerate={() => handleProFeature('video_generation', () => handleActionWithCredits(1, 'video_generation', studio.handleGenerateVideo))}
          isLoading={studio.videoGenerationState.status === 'generating'}
          isOutOfCredits={isOutOfCredits}
        />
      )}
      {studio.error && !studio.isLoading && (
        <div className="mt-8 w-full max-w-2xl">
          <ErrorDisplay message={studio.error} />
        </div>
      )}
    </div>
  );
  
  const renderVideoLoading = () => (
     <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 transition-opacity duration-500">
        <Loader message={studio.videoGenerationState.message} />
    </div>
  );

  const renderContent = () => {
    if (studio.appMode === 'video') return renderVideoView();
    return studio.originalImage ? renderEditorView() : renderGenerationView();
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
      <Header
        appMode={studio.appMode}
        setAppMode={(mode) => {
          if (mode === 'video') {
            handleProFeature('video_generation', () => studio.setAppMode(mode));
          } else {
            studio.setAppMode(mode);
          }
        }}
        onReset={studio.handleReset}
        showReset={!!studio.originalImage || !!studio.videoUrl}
        userState={userState}
        onGoPro={() => setShowUpgradeModal(true)}
        onWatchAd={earnCreditFromAd}
        onToggleAdminPanel={() => setShowAdminPanel(p => !p)}
        handleAdminClick={handleAdminClick}
        currentUser={authHook.currentUser}
        onLogout={authHook.logout}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6 flex flex-col items-center relative">
        {renderContent()}
        {studio.videoGenerationState.status === 'generating' && renderVideoLoading()}
        {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={upgradeToPro} />}
        {showAdminLoginModal && (
          <AdminLoginModal
            onClose={() => setShowAdminLoginModal(false)}
            onLogin={handleAdminLogin}
          />
        )}
        {showAdminPanel && userState.isAdmin && (
          <AdminPanel
            userState={userState}
            allUserProfiles={allUserProfiles}
            onClose={() => setShowAdminPanel(false)}
            onSetCredits={setUserCredits}
            onSetPlan={setUserPlan}
          />
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

    const addNotification = (message: string, type: NotificationType['type'] = 'success') => {
        const newNotification: NotificationType = {
            id: Date.now(),
            message,
            type
        };
        setNotifications(prev => [...prev, newNotification]);
    };
    
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    const auth = useAuth(addNotification);
    const user = useUser(auth.currentUser?.id || null, addNotification);

    if (!auth.currentUser || !user.userState) {
        return <Auth onLogin={auth.login} onSignup={auth.signup} />;
    }

    return (
        <>
            <CreativeSuite userHook={user} authHook={auth} addNotification={addNotification} />
            <div className="fixed bottom-4 right-4 z-[200] w-full max-w-sm space-y-3">
                {notifications.map(notification => (
                    <Notification 
                        key={notification.id}
                        {...notification}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </>
    );
};

export default App;