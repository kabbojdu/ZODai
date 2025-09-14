
import { useState, useEffect, useCallback } from 'react';
import type { AuthUser, Notification } from '../types';
import { createNewUserProfile } from './useUser';

const USERS_STORAGE_KEY = 'ai-studio-users';
const SESSION_STORAGE_KEY = 'ai-studio-session';
const PROFILES_STORAGE_KEY = 'ai-studio-user-profiles';

// This is a simple, UNSAFE "hash" for demonstration purposes.
// In a real app, you MUST use a proper, secure hashing library like bcrypt on a backend server.
const simpleHash = (s: string): string => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h.toString();
};

const useAuth = (addNotification: (message: string, type?: Notification['type']) => void) => {
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        try {
            const currentUserId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (currentUserId) {
                const users = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]') as AuthUser[];
                const user = users.find(u => u.id === currentUserId);
                if (user) {
                    setCurrentUser(user);
                }
            }
        } catch (error) {
            console.error("Failed to initialize session", error);
        }
    }, []);

    const login = useCallback((email: string, password: string): { success: boolean, message: string } => {
        try {
            const users = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]') as AuthUser[];
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (user && user.passwordHash === simpleHash(password)) {
                setCurrentUser(user);
                window.sessionStorage.setItem(SESSION_STORAGE_KEY, user.id);
                addNotification(`Welcome back, ${user.email}!`, 'success');
                return { success: true, message: 'Login successful!' };
            } else {
                addNotification('Invalid email or password.', 'error');
                return { success: false, message: 'Invalid email or password.' };
            }
        } catch (error) {
            console.error("Login failed", error);
            addNotification('An unexpected error occurred during login.', 'error');
            return { success: false, message: 'An unexpected error occurred.' };
        }
    }, [addNotification]);

    const signup = useCallback((email: string, password: string): { success: boolean, message: string } => {
        try {
            const users = JSON.parse(window.localStorage.getItem(USERS_STORAGE_KEY) || '[]') as AuthUser[];
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                addNotification('An account with this email already exists.', 'error');
                return { success: false, message: 'An account with this email already exists.' };
            }

            const newUser: AuthUser = {
                id: email.toLowerCase(), // Use email as ID for simplicity
                email: email.toLowerCase(),
                passwordHash: simpleHash(password),
            };

            const newUsers = [...users, newUser];
            window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
            
            // Create user profile
            const profiles = JSON.parse(window.localStorage.getItem(PROFILES_STORAGE_KEY) || '{}');
            profiles[newUser.id] = createNewUserProfile(newUser.id);
            window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));

            // Log in the new user
            return login(email, password);

        } catch (error) {
            console.error("Signup failed", error);
            addNotification('An unexpected error occurred during signup.', 'error');
            return { success: false, message: 'An unexpected error occurred during signup.' };
        }
    }, [login, addNotification]);

    const logout = useCallback(() => {
        addNotification("You have been logged out.", 'info');
        setCurrentUser(null);
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }, [addNotification]);
    
    return {
        currentUser,
        login,
        signup,
        logout
    };
};

export default useAuth;