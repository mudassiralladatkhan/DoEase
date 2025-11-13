import { User } from '@supabase/supabase-js';

export interface Profile {
  username: string;
  mobile: string | null;
  current_streak: number;
  last_streak_updated: string | null;
  email_notifications_enabled: boolean;
  timezone: string | null;
}

export type UserProfile = User & Profile;

export type Task = {
  id: number;
  created_at: string;
  user_id: string;
  name: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  start_time: string | null;
  end_time: string | null;
  due_date: string;
};

export type Priority = 'low' | 'medium' | 'high';
