
import { useState, useEffect, useCallback } from 'react';
import type { UserState, UsageRecord, TrackableFeatures, UserPlan, Notification } from '../types';
import { trackUsage as logUsageToSupabase } from '../services/supabaseService';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const FREE_CREDITS_PER_DAY = 5;
const MAX_AD_REWARDS_PER_DAY = 5;

const PROFILES_STORAGE_KEY = 'ai-studio-user-profiles';

const getAllProfiles = (): Record<string, UserState> => {
    try {
        const item = window.localStorage.getItem(PROFILES_STORAGE_KEY);
        return item ? JSON.parse(item) : {};
    } catch (error) {
        console.error("Error reading all profiles from localStorage", error);
        return {};
    }
};

export const createNewUserProfile = (userId: string): UserState => {
    const now = Date.now();
    return {
        plan: 'free',
        credits: FREE_CREDITS_PER_DAY,
        lastCreditReset: now,
        rewardedAdsWatchedToday: 0,
        lastAdReset: now,
        usageLog: [],
        isAdmin: false,
    };
};

const useUser = (userId: string | null, addNotification: (message: string, type?: Notification['type']) => void) => {
    const [allUserProfiles, setAllUserProfiles] = useState<Record<string, UserState>>(getAllProfiles);
    const [userState, setUserState] = useState<UserState | null>(null);
    
    const [adminClickCount, setAdminClickCount] = useState(0);
    const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

    useEffect(() => {
        if (!userId) {
            setUserState(null);
            return;
        }

        const profiles = getAllProfiles();
        let userProfile = profiles[userId];

        if (userProfile) {
            const now = Date.now();
            let updated = false;
            
            if (now - userProfile.lastCreditReset > ONE_DAY_MS) {
                userProfile.credits = userProfile.plan === 'free' ? FREE_CREDITS_PER_DAY : 999;
                userProfile.lastCreditReset = now;
                updated = true;
            }

            if (now - userProfile.lastAdReset > ONE_DAY_MS) {
                userProfile.rewardedAdsWatchedToday = 0;
                userProfile.lastAdReset = now;
                updated = true;
            }

            if (updated) {
                const newProfiles = { ...profiles, [userId]: userProfile };
                setAllUserProfiles(newProfiles);
                 try {
                    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(newProfiles));
                } catch (error) {
                    console.error("Error writing updated profile to localStorage", error);
                }
            }
        }
        
        setUserState(userProfile || null);

    }, [userId]);
    
    const updateUserState = (updater: (prevState: UserState) => UserState) => {
        if (!userId) return;

        setUserState(prev => {
            if (!prev) return null;
            const newState = updater(prev);
            
            setAllUserProfiles(allProfiles => {
                const newProfiles = { ...allProfiles, [userId]: newState };
                 try {
                    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(newProfiles));
                } catch (error) {
                    console.error("Error writing profile to localStorage", error);
                }
                return newProfiles;
            });
            return newState;
        });
    };

    const logUsage = useCallback((feature: TrackableFeatures, credits: number) => {
        if (!userId) return;
        const newRecord: UsageRecord = {
            id: Date.now().toString(),
            userId,
            featureUsed: feature,
            creditsSpent: credits,
            timestamp: new Date().toISOString()
        };
        logUsageToSupabase(newRecord);
        updateUserState(prev => ({ ...prev, usageLog: [newRecord, ...prev.usageLog] }));
    }, [userId]);

    const spendCredits = useCallback((amount: number, feature: TrackableFeatures) => {
        if (userState?.plan === 'pro') {
            logUsage(feature, 0);
            return;
        };
        updateUserState(prev => {
            if (prev.credits >= amount) {
                logUsage(feature, amount);
                return { ...prev, credits: prev.credits - amount };
            }
            return prev;
        });
    }, [logUsage, userState?.plan]);

    const earnCreditFromAd = useCallback(() => {
        updateUserState(prev => {
            if (prev.rewardedAdsWatchedToday < MAX_AD_REWARDS_PER_DAY) {
                logUsage('rewarded_ad_credit', -1);
                addNotification('+1 Credit Earned!', 'success');
                return { 
                    ...prev, 
                    credits: prev.credits + 1,
                    rewardedAdsWatchedToday: prev.rewardedAdsWatchedToday + 1
                };
            }
            addNotification('Daily ad reward limit reached.', 'info');
            return prev;
        });
    }, [logUsage, addNotification]);

    const upgradeToPro = useCallback(() => {
        updateUserState(prev => ({ ...prev, plan: 'pro', credits: 999 }));
        logUsage('admin_plan_change', 0);
        addNotification('Welcome to Pro! Your account has been upgraded.', 'success');
    }, [logUsage, addNotification]);

    const handleAdminClick = () => {
        if (userState?.isAdmin) return;
        const newCount = adminClickCount + 1;
        setAdminClickCount(newCount);
        if (newCount >= 5) {
            setShowAdminLoginModal(true);
            setAdminClickCount(0);
        }
    };
    
    const handleAdminLogin = (password: string): boolean => {
        if (password === 'Kabbo45@') {
            updateUserState(prev => ({ ...prev, isAdmin: true }));
            setShowAdminLoginModal(false);
            addNotification('Admin mode unlocked.', 'info');
            return true;
        }
        return false;
    };

    const setUserCredits = (amount: number) => {
        const parsedAmount = isNaN(amount) ? 0 : amount;
        updateUserState(prev => ({ ...prev, credits: parsedAmount }));
        logUsage('admin_credit_set', 0);
        addNotification(`User credits set to ${parsedAmount}.`, 'info');
    };
    
    const setUserPlan = (plan: UserPlan) => {
        if (plan === 'pro') {
             updateUserState(prev => ({ ...prev, plan: 'pro', credits: 999 }));
        } else {
             const now = Date.now();
             updateUserState(prev => ({
                ...prev,
                plan: 'free',
                credits: FREE_CREDITS_PER_DAY,
                lastCreditReset: now,
                lastAdReset: now,
                rewardedAdsWatchedToday: 0
            }));
        }
        logUsage('admin_plan_change', 0);
        addNotification(`User plan changed to ${plan.toUpperCase()}.`, 'info');
    };

    return {
        userState,
        allUserProfiles,
        showAdminLoginModal,
        setShowAdminLoginModal,
        spendCredits,
        earnCreditFromAd,
        upgradeToPro,
        handleAdminClick,
        handleAdminLogin,
        setUserCredits,
        setUserPlan,
    };
};

export default useUser;