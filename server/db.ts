import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Configure for non-Neon PostgreSQL
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineConnect = false;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
