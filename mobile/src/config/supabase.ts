import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase project credentials
const SUPABASE_URL = 'https://sonyiatltmqdyoezfbnj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbnlpYXRsdG1xZHlvZXpmYm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE2MTksImV4cCI6MjA3NDg3NzYxOX0.qr76yAQ8Rrjx9dvwWggx3hOURqwO0pp4gXiahRn86Dc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
