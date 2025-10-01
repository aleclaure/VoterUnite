import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Supabase PostgreSQL connection (when properly configured)
// Note: Currently using MemStorage in storage.ts
// To enable Supabase PostgreSQL, ensure SUPABASE_URL and SUPABASE_DB_PASSWORD are set

let db: any = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
  try {
    const supabaseRef = process.env.SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
    const connectionString = `postgresql://postgres.${supabaseRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
    
    const client = postgres(connectionString, {
      prepare: false,
      ssl: 'require'
    });
    
    db = drizzle(client, { schema });
    console.log('✓ Supabase PostgreSQL connection initialized');
  } catch (error) {
    console.error('⚠ Failed to initialize Supabase PostgreSQL:', error);
    console.warn('⚠ Using MemStorage as fallback');
  }
}

export { db };
