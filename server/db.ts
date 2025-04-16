import * as schema from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

// Import pg using a more compatible approach
import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure PostgreSQL connection options
const postgresOptions = {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max seconds a client can be idle before being closed
  connect_timeout: 60, // Max seconds to wait for connection
  ssl: true // Always enable SSL for security
};

// Standard PostgreSQL connection for use with pg-based packages
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Allow self-signed certificates
});

// Check if we're running in Docker/production environment
// This is particularly important for Docker deployments
if (process.env.NODE_ENV === 'production' || process.env.NEON_CONNECTION_TYPE === 'standard') {
  console.log('Using standard PostgreSQL connection mode');
  // Standard connection is preferred in Docker containers
} else {
  console.log('Using WebSocket-enabled PostgreSQL connection mode');
  // Setup WebSocket for Neon Database
  try {
    neonConfig.webSocketConstructor = ws;
    console.log('WebSocket setup successful');
  } catch (error) {
    console.warn('WebSocket setup failed, falling back to standard connection:', 
      error instanceof Error ? error.message : String(error));
  }
}

// Postgres.js client for use with Drizzle ORM
const client = postgres(process.env.DATABASE_URL, postgresOptions);

// Drizzle ORM instance
export const db = drizzle(client, { schema });