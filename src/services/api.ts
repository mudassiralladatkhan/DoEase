import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, Task, Profile } from '../types';
import { AuthError, PostgrestError } from '@supabase/supabase-js';

type ApiResult<T> = { data: T | null; error: AuthError | PostgrestError | null };

class ApiService {
  // --- Auth ---
  async signUp(userData: any): Promise<ApiResult<any>> {
    if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase is not configured.") as any };
    const { email, password, username, mobile, timezone } = userData;
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          mobile: mobile,
          timezone: timezone,
        }
      }
    });
  }

  async signIn(email: string, password: string): Promise<ApiResult<any>> {
    if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase is not configured.") as any };
    return supabase.auth.signInWithPassword({ email, password });
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    if (!isSupabaseConfigured) return { error: null };
    return supabase.auth.signOut();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }

  async getSession(): Promise<ApiResult<any>> {
    if (!isSupabaseConfigured) return { data: null, error: null };
    return supabase.auth.getSession();
  }

  async getUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        return null;
      }
      
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // PGRST116 means no rows returned (profile doesn't exist yet)
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile:", profileError);
        // Don't throw - return a user with default values instead
        return {
          ...user,
          username: user.email?.split('@')[0] || 'New User',
          mobile: null,
          current_streak: 0,
          last_streak_updated: null,
          email_notifications_enabled: true,
          timezone: null,
        };
      }

      return {
        ...user,
        username: profile?.username || user.email?.split('@')[0] || 'New User',
        mobile: profile?.mobile || null,
        current_streak: profile?.current_streak || 0,
        last_streak_updated: profile?.last_streak_updated || null,
        email_notifications_enabled: profile?.email_notifications_enabled ?? true,
        timezone: profile?.timezone || null,
      };
    } catch (error) {
      console.error("Unexpected error in getUser:", error);
      return null;
    }
  }
  
  async updateUser(userId: string, userData: Partial<Profile>): Promise<ApiResult<Profile>> {
    if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase is not configured.") as any };
    const result = await supabase
      .from('profiles')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (!result.error) await supabase.auth.refreshSession();
    return result;
  }

  // --- Tasks ---
  async getTasks(userId: string): Promise<ApiResult<Task[]>> {
    if (!isSupabaseConfigured || !userId) return { data: [], error: null };
    return supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  async addTask(userId: string, taskData: Partial<Task>): Promise<ApiResult<Task>> {
    if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase is not configured.") as any };
    return supabase
      .from('tasks')
      .insert([{ ...taskData, user_id: userId }])
      .select()
      .single();
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<ApiResult<Task>> {
    if (!isSupabaseConfigured) return { data: null, error: new Error("Supabase is not configured.") as any };
    return supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
  }

  async deleteTask(taskId: number): Promise<{ error: PostgrestError | null }> {
    if (!isSupabaseConfigured) return { error: null };
    return supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
  }
}

export const api = new ApiService();
