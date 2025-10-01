import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not set');
}

// Construct Supabase PostgreSQL connection string
// Supabase PostgreSQL is available at: project-ref.supabase.co:5432
const supabaseRef = process.env.SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
const connectionString = `postgresql://postgres.${supabaseRef}:${process.env.SUPABASE_ANON_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const client = postgres(connectionString, {
  prepare: false
});

export const db = drizzle(client, { schema });
