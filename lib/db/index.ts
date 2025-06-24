import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// For local development, we'll use a mock connection
const sql = neon(process.env.DATABASE_URL || 'postgresql://mock:mock@localhost/mock');

export const db = drizzle(sql, { schema });

export * from './schema'; 