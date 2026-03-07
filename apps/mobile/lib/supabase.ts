import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './database-types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://jnbgbsprmxfkwgokmgtw.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuYmdic3BybXhma3dnb2ttZ3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODMxMDAsImV4cCI6MjA4ODE1OTEwMH0.cFGOh3Aq_RImNlnSuN4UKkKc1IMcOCh8cat6G2zglxM';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
