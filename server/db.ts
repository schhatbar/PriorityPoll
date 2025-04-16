import * as schema from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

// Import pg using a more compatible approach
import pkg from 'pg';
const { Pool } = pkg;

// More graceful error handling for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("\x1b[31m%s\x1b[0m", "ERROR: DATABASE_URL environment variable is not set!");
  console.error("Please make sure you have a valid .env file with DATABASE_URL defined.");
  console.error("Example: DATABASE_URL=postgres://postgres:password@localhost:5432/polling_app");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure PostgreSQL connection options
const postgresOptions = {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max seconds a client can be idle before being closed
  connect_timeout: 60, // Max seconds to wait for connection
  // SSL is managed via the sslmode parameter in the connection string
};

// Standard PostgreSQL connection for use with pg-based packages
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Only enable SSL in production or when explicitly requested
  ssl: process.env.NODE_ENV === 'production' || process.env.ENABLE_SSL === 'true'
    ? { rejectUnauthorized: false } // Allow self-signed certificates
    : undefined // No SSL in development by default
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
// Use the database URL as provided, relying on explicit sslmode in the URL
// This allows local development with sslmode=disable and production with sslmode=require
const client = postgres(process.env.DATABASE_URL, postgresOptions);

// Drizzle ORM instance
export const db = drizzle(client, { schema });