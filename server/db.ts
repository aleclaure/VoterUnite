import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Supabase PostgreSQL connection
let db: any = null;
let rawClient: any = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
  try {
    // Extract project reference from SUPABASE_URL (e.g., "sonyiatltmqdyoezfbnj" from "https://sonyiatltmqdyoezfbnj.supabase.co")
    const urlMatch = process.env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!urlMatch) {
      throw new Error('Invalid SUPABASE_URL format. Expected: https://your-project.supabase.co');
    }
    const supabaseRef = urlMatch[1];
    const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD);
    
    // Supabase Session pooler connection (supports all PostgreSQL features)
    // Username format: postgres.{project-ref} (NOT just "postgres")
    // Using port 5432 for session pooler (NOT 6543 transaction pooler)
    const connectionString = `postgresql://postgres.${supabaseRef}:${password}@aws-1-us-east-2.pooler.supabase.com:5432/postgres`;
    
    console.log('🔌 Connecting to Supabase PostgreSQL (session pooler - port 5432)...');
    console.log('📍 Username:', `postgres.${supabaseRef}`);
    
    const client = postgres(connectionString, {
      prepare: false,
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      onconnect: async (connection) => {
        await connection`SET search_path TO public`;
      }
    });
    
    rawClient = client; // Save raw client for direct SQL queries
    db = drizzle(client, { schema });
    
    // Test the connection
    client`SELECT 1`.then(async () => {
      console.log('✅ Supabase PostgreSQL connected successfully!');
      // Verify search_path is set
      const result = await client`SHOW search_path`;
      console.log('📍 Search path:', result[0].search_path);
      
      // Test if channel_sessions table exists, create if missing
      try {
        const tableCheck = await client`
          SELECT table_schema, table_name 
          FROM information_schema.tables 
          WHERE table_name = 'channel_sessions'
        `;
        
        if (tableCheck.length === 0) {
          console.log('📋 Creating channel_sessions and session_participants tables...');
          
          // Create tables separately
          await client`
            CREATE TABLE IF NOT EXISTS public.channel_sessions (
              id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
              channel_id VARCHAR NOT NULL,
              session_token VARCHAR NOT NULL,
              room_url TEXT NOT NULL,
              room_name VARCHAR NOT NULL,
              started_at TIMESTAMP DEFAULT NOW() NOT NULL,
              ended_at TIMESTAMP,
              is_active BOOLEAN DEFAULT true NOT NULL
            )
          `;
          
          await client`
            CREATE TABLE IF NOT EXISTS public.session_participants (
              id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
              session_id VARCHAR NOT NULL REFERENCES public.channel_sessions(id) ON DELETE CASCADE,
              user_id UUID NOT NULL,
              joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
              left_at TIMESTAMP,
              is_active BOOLEAN DEFAULT true NOT NULL,
              is_muted BOOLEAN DEFAULT false NOT NULL,
              is_video_on BOOLEAN DEFAULT false NOT NULL
            )
          `;
          
          await client`CREATE INDEX IF NOT EXISTS idx_channel_sessions_channel ON public.channel_sessions(channel_id)`;
          await client`CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id)`;
          await client`CREATE INDEX IF NOT EXISTS idx_session_participants_user ON public.session_participants(user_id)`;
          
          console.log('✅ Session tables created successfully!');
        } else {
          console.log('✅ Session tables already exist');
        }
      } catch (err: any) {
        console.error('❌ Error with session tables:', err.message);
      }
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

export { db, rawClient };
