import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sonyiatltmqdyoezfbnj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbnlpYXRsdG1xZHlvZXpmYm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE2MTksImV4cCI6MjA3NDg3NzYxOX0.qr76yAQ8Rrjx9dvwWggx3hOURqwO0pp4gXiahRn86Dc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
