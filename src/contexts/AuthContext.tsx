import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { api } from '../services/api';
import { isSupabaseConfigured, supabaseConfigurationError } from '../services/supabase';
import { UserProfile } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  configurationError: string | null;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async (sessionUser?: any) => {
    if (!isSupabaseConfigured) {
      setCurrentUser(null);
      return;
    }
    
    try {
      const user = await api.getUser();
      if (user) {
        setCurrentUser(user);
        return;
      }
    } catch (error) {
      console.error("Error in getUser:", error);
    }
    
    // If getUser failed or returned null, create fallback from session
    // Use provided sessionUser or fetch from session
    let userToUse = sessionUser;
    
    if (!userToUse) {
      try {
        const { data: sessionData } = await api.getSession();
        userToUse = sessionData?.session?.user;
      } catch (sessionError) {
        console.error("Failed to get session:", sessionError);
      }
    }
    
    if (userToUse) {
      const fallbackUser: UserProfile = {
        ...userToUse,
        username: userToUse.email?.split('@')[0] || userToUse.user_metadata?.username || 'New User',
        mobile: userToUse.user_metadata?.mobile || null,
        current_streak: 0,
        last_streak_updated: null,
        email_notifications_enabled: true,
        timezone: userToUse.user_metadata?.timezone || null,
      };
      setCurrentUser(fallbackUser);
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let authListenerUnsubscribe: (() => void) | undefined;
    let initialLoadComplete = false;

    const handleSessionAndUser = async (session: Session | null) => {
      if (!mounted) return;
      
      setSession(session);
      
      if (session && session.user) {
        // Always ensure a user is set when session exists to prevent redirect loops
        await refreshUserProfile(session.user);
      } else {
        setCurrentUser(null);
      }
      
      if (mounted && !initialLoadComplete) {
        setLoading(false);
        initialLoadComplete = true;
      }
    };

    // Set up auth state change listener - this fires immediately with INITIAL_SESSION
    const { data: authListener } = api.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Handle INITIAL_SESSION - this fires immediately when listener is set up
      if (event === 'INITIAL_SESSION') {
        await handleSessionAndUser(session);
        return;
      }

      // Handle other events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (initialLoadComplete) {
          setLoading(true);
        }
        await handleSessionAndUser(session);
        // Always set loading to false after handling SIGNED_IN/TOKEN_REFRESHED
        if (mounted) {
          setLoading(false);
          if (!initialLoadComplete) {
            initialLoadComplete = true;
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setSession(null);
        setLoading(false);
        if (!initialLoadComplete) {
          initialLoadComplete = true;
        }
      }
    });

    if (authListener?.subscription) {
      authListenerUnsubscribe = authListener.subscription.unsubscribe;
    }

    // Fallback: if INITIAL_SESSION doesn't fire within 2 seconds, fetch manually
    const timeoutId = setTimeout(async () => {
      if (!mounted || initialLoadComplete) return;
      
      try {
        const { data: sessionData, error: sessionError } = await api.getSession();
        if (!mounted) return;
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setSession(null);
          setCurrentUser(null);
          setLoading(false);
          initialLoadComplete = true;
          return;
        }
        
        await handleSessionAndUser(sessionData?.session || null);
      } catch (error) {
        console.error("Error in fallback session fetch:", error);
        if (mounted) {
          setCurrentUser(null);
          setSession(null);
          setLoading(false);
          initialLoadComplete = true;
        }
      }
    }, 2000);

    // Safety timeout: ensure loading is always set to false after 5 seconds max
    const safetyTimeoutId = setTimeout(() => {
      if (mounted && !initialLoadComplete) {
        console.warn("Loading timeout reached, forcing loading to false");
        setLoading(false);
        initialLoadComplete = true;
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeoutId);
      if (authListenerUnsubscribe) {
        authListenerUnsubscribe();
      }
    };
  }, []);
  
  const signOut = async () => {
    await api.signOut();
    setCurrentUser(null);
    setSession(null);
  };

  const value = {
    currentUser,
    session,
    loading,
    signOut,
    isConfigured: isSupabaseConfigured,
    configurationError: supabaseConfigurationError,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
