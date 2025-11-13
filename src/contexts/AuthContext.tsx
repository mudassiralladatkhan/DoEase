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
      
      try {
        if (session && session.user) {
          // Always ensure a user is set when session exists to prevent redirect loops
          await refreshUserProfile(session.user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in handleSessionAndUser:", error);
        // Even on error, ensure we have a user if session exists
        if (session && session.user) {
          const fallbackUser: UserProfile = {
            ...session.user,
            username: session.user.email?.split('@')[0] || 'New User',
            mobile: null,
            current_streak: 0,
            last_streak_updated: null,
            email_notifications_enabled: true,
            timezone: null,
          };
          setCurrentUser(fallbackUser);
        } else {
          setCurrentUser(null);
        }
      } finally {
        // Always set loading to false and mark as complete
        if (mounted && !initialLoadComplete) {
          setLoading(false);
          initialLoadComplete = true;
        }
      }
    };

    // Fetch session immediately instead of waiting for INITIAL_SESSION
    const initializeAuth = async () => {
      if (!mounted || initialLoadComplete) return;
      
      try {
        const { data: sessionData, error: sessionError } = await api.getSession();
        if (!mounted || initialLoadComplete) return;
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted && !initialLoadComplete) {
            setSession(null);
            setCurrentUser(null);
            setLoading(false);
            initialLoadComplete = true;
          }
          return;
        }
        
        await handleSessionAndUser(sessionData?.session || null);
      } catch (error) {
        console.error("Error in initial session fetch:", error);
        if (mounted && !initialLoadComplete) {
          setCurrentUser(null);
          setSession(null);
          setLoading(false);
          initialLoadComplete = true;
        }
      }
    };

    // Start initialization immediately
    initializeAuth();

    // Set up auth state change listener for future changes
    const { data: authListener } = api.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Skip INITIAL_SESSION as we already handled it
      if (event === 'INITIAL_SESSION') {
        // Only update if we haven't completed initial load yet
        if (!initialLoadComplete) {
          await handleSessionAndUser(session);
        }
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

    // Safety timeout: ensure loading is always set to false after 2 seconds max
    const safetyTimeoutId = setTimeout(async () => {
      if (mounted && !initialLoadComplete) {
        console.warn("Loading timeout reached, forcing loading to false");
        // Try one last time to get session and set user
        try {
          const { data: sessionData } = await api.getSession();
          if (sessionData?.session?.user) {
            const fallbackUser: UserProfile = {
              ...sessionData.session.user,
              username: sessionData.session.user.email?.split('@')[0] || 'New User',
              mobile: null,
              current_streak: 0,
              last_streak_updated: null,
              email_notifications_enabled: true,
              timezone: null,
            };
            setCurrentUser(fallbackUser);
            setSession(sessionData.session);
          }
        } catch (error) {
          console.error("Error in safety timeout:", error);
        }
        setLoading(false);
        initialLoadComplete = true;
      }
    }, 2000);

    return () => {
      mounted = false;
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
