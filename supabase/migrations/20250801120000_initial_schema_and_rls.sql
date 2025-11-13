/*
# [Initial Schema & Security Policies]
This migration establishes the core database structure for the DoEase application, including tables for user profiles and tasks. It also implements critical security features like Row-Level Security (RLS) and automated user profile creation.

## Query Description: This is a foundational, but safe, structural change.
- It creates the `profiles` and `tasks` tables.
- It sets up a trigger to automatically create a user profile upon sign-up, ensuring data consistency.
- It enables Row-Level Security and applies policies so users can only see and manage their own data. This is a critical security and privacy measure.
- Existing data in `auth.users` is unaffected. No data will be lost.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true (by dropping tables and policies)

## Structure Details:
- **Tables Created:** `public.profiles`, `public.tasks`
- **Types Created:** `public.task_priority` (enum)
- **Functions Created:** `public.handle_new_user()`
- **Triggers Created:** `on_auth_user_created` on `auth.users`

## Security Implications:
- RLS Status: Enabled on `profiles` and `tasks`.
- Policy Changes: Yes, new policies are created to enforce data isolation between users.
- Auth Requirements: Policies rely on `auth.uid()` to identify the current user.

## Performance Impact:
- Indexes: Primary keys and foreign keys are indexed by default.
- Triggers: A single trigger on `auth.users` insertion, which is a low-frequency event. Impact is negligible.
- Estimated Impact: Low.
*/

-- 1. CREATE PRIORITY ENUM TYPE
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');

-- 2. CREATE PROFILES TABLE
-- Stores public user data. Links to auth.users via a one-to-one relationship.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  mobile TEXT,
  timezone TEXT,
  current_streak INT NOT NULL DEFAULT 0,
  last_streak_updated TIMESTAMPTZ,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user, linked to their authentication record.';

-- 3. CREATE TASKS TABLE
-- Stores tasks for each user.
CREATE TABLE public.tasks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tasks IS 'Stores individual tasks created by users.';

-- 4. CREATE FUNCTION TO HANDLE NEW USER SIGN-UPS
-- This function automatically inserts a new row into public.profiles when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, mobile, timezone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'timezone'
  );
  RETURN NEW;
END;
$$;

-- 5. CREATE TRIGGER TO CALL THE FUNCTION ON NEW USER CREATION
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. ENABLE ROW-LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES FOR PROFILES
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 8. CREATE RLS POLICIES FOR TASKS
CREATE POLICY "Users can perform all operations on their own tasks."
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. (Optional but Recommended) CREATE CRON JOBS FOR NOTIFICATIONS
-- These commands schedule your existing Edge Functions to run automatically.
-- You must run these queries in the Supabase SQL Editor after enabling the pg_cron extension.

-- Schedule streak check to run once daily at midnight UTC.
-- SELECT cron.schedule('check-streaks-daily', '0 0 * * *', 'SELECT net.http_post(url:=''https://ydtdwwvuzkwbgfmmmhby.supabase.co/functions/v1/check-streaks'', headers:=''{"Content-Type": "application/json", "x-supabase-caller": "postgres"}''::jsonb)');

-- Schedule task reminders to run every 5 minutes.
-- SELECT cron.schedule('send-task-reminders-5min', '*/5 * * * *', 'SELECT net.http_post(url:=''https://ydtdwwvuzkwbgfmmmhby.supabase.co/functions/v1/send-task-reminders'', headers:=''{"Content-Type": "application/json", "x-supabase-caller": "postgres"}''::jsonb)');
