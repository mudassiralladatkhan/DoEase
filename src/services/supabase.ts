import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidSupabaseUrl = (url: string | undefined): boolean => {
    return typeof url === 'string' && url.startsWith('https') && url.includes('.supabase.co');
};

let supabase: ReturnType<typeof createClient<Database>>;
let isSupabaseConfigured = false;
let supabaseConfigurationError: string | null = null;

if (isValidSupabaseUrl(supabaseUrl) && supabaseAnonKey) {
  try {
    supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);
    isSupabaseConfigured = true;
  } catch (error) {
    supabaseConfigurationError = `Failed to initialize Supabase client: ${(error as Error).message}`;
    console.error(supabaseConfigurationError);
    // Create a dummy client to prevent TypeScript errors, but it won't be used due to isSupabaseConfigured check
    supabase = createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');
  }
} else {
  let specificError: string;
  if (!supabaseUrl || !supabaseAnonKey) {
    specificError = "One or more Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing.";
  } else if (!isValidSupabaseUrl(supabaseUrl)) {
    specificError = `The provided Supabase URL is invalid. It must be a full HTTPS URL.`;
  } else {
    specificError = "The Supabase configuration is invalid for an unknown reason.";
  }
  
  supabaseConfigurationError = `${specificError} Please check your .env file or connect your Supabase project via the Integrations tab.`;
  // Create a dummy client to prevent TypeScript errors, but it won't be used due to isSupabaseConfigured check
  supabase = createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase, isSupabaseConfigured, supabaseConfigurationError };
