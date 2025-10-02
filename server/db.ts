import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// PostgreSQL connection using DATABASE_URL
let db: any = null;
let rawClient: any = null;

if (process.env.DATABASE_URL) {
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    
    const client = postgres(process.env.DATABASE_URL, {
      prepare: false,
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10
    });
    
    rawClient = client;
    db = drizzle(client, { schema });
    
    // Test the connection
    client`SELECT 1`.then(() => {
      console.log('✅ PostgreSQL connected successfully!');
    }).catch((err) => {
      console.error('❌ Database connection test failed:', err.message);
      db = null;
    });
    
  } catch (error: any) {
    console.error('❌ Failed to initialize database connection:', error.message);
    db = null;
  }
} else {
  console.warn('⚠️  Missing DATABASE_URL');
  console.log('   → Using in-memory storage (data will not persist)\n');
}

export { db, rawClient };
