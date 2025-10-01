import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Supabase PostgreSQL connection
let db: any = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
  try {
    // Extract project reference from SUPABASE_URL (e.g., "sonyiatltmqdyoezfbnj" from "https://sonyiatltmqdyoezfbnj.supabase.co")
    const urlMatch = process.env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!urlMatch) {
      throw new Error('Invalid SUPABASE_URL format. Expected: https://your-project.supabase.co');
    }
    const supabaseRef = urlMatch[1];
    const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
    
    // Supabase pooler connection (IPv4 compatible - required for Replit)
    // Username format: postgres.{project-ref} (NOT just "postgres")
    const connectionString = `postgresql://postgres.${supabaseRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
    
    console.log('🔌 Connecting to Supabase PostgreSQL (pooler)...');
    console.log('📍 Username:', `postgres.${supabaseRef}`);
    
    const client = postgres(connectionString, {
      prepare: false,
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10
    });
    
    db = drizzle(client, { schema });
    
    // Test the connection
    client`SELECT 1`.then(() => {
      console.log('✅ Supabase PostgreSQL connected successfully!');
    }).catch((err) => {
      console.error('❌ Supabase connection test failed:', err.message);
      console.log('\n📋 TROUBLESHOOTING STEPS:');
      console.log('1. Check SUPABASE_URL secret is set correctly');
      console.log('   - Format: https://your-project.supabase.co');
      console.log('2. Check SUPABASE_DB_PASSWORD secret matches your database password');
      console.log('3. Verify tables exist in Supabase Dashboard → SQL Editor');
      console.log('4. Ensure pooler is enabled in Supabase (Port 6543)\n');
      db = null; // Force fallback to MemStorage
    });
    
  } catch (error: any) {
    console.error('❌ Failed to initialize Supabase connection:', error.message);
    console.log('\n📋 TROUBLESHOOTING STEPS:');
    console.log('1. Verify SUPABASE_URL and SUPABASE_DB_PASSWORD secrets exist');
    console.log('2. Check your Supabase project is not paused');
    console.log('3. Confirm database tables are created\n');
    db = null;
  }
} else {
  console.warn('⚠️  Missing Supabase credentials (SUPABASE_URL or SUPABASE_DB_PASSWORD)');
  console.log('   → Using in-memory storage (data will not persist)\n');
}

export { db };
