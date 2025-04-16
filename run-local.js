/**
 * Run-local script for Windows compatibility
 * This script starts both the React frontend and Express backend
 * with proper environment variables for local development
 */

// Import required modules
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
try {
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('Loading environment variables from .env file');
    dotenv.config({ path: envPath });
  } else {
    console.log('No .env file found, creating one with default values');
    
    // Create default .env file
    const defaultEnv = 
`DATABASE_URL=postgres://postgres:postgres@localhost:5432/polling_app?sslmode=disable
SESSION_SECRET=localdevelopmentsecret
NODE_ENV=development
NEON_CONNECTION_TYPE=standard
PORT=5000`;
    
    fs.writeFileSync(envPath, defaultEnv);
    dotenv.config({ path: envPath });
    
    console.log('\x1b[33m%s\x1b[0m', 'WARNING: Default .env file created. Edit it with your actual database credentials!');
    console.log(`The file is located at: ${envPath}`);
  }
} catch (error) {
  console.error('Error setting up environment:', error);
  process.exit(1);
}

// Set environment variables for child processes
const env = { ...process.env };

// Verify DATABASE_URL is present
if (!env.DATABASE_URL) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: DATABASE_URL is not defined in your environment');
  console.log('Make sure to set DATABASE_URL in your .env file or in your environment variables');
  console.log('Example: DATABASE_URL=postgres://postgres:your_password@localhost:5432/polling_app');
  process.exit(1);
}

// If no port is specified, use 5000 as default
// If port 5000 is in use, common alternatives are 3000, 8000, or 8080
if (!env.PORT) {
  env.PORT = '5000';
  console.log(`Setting default PORT to ${env.PORT}`);
}

console.log('\x1b[32m%s\x1b[0m', '✓ Environment variables loaded successfully');
console.log(`DATABASE_URL is ${env.DATABASE_URL ? 'set' : 'not set'}`);
console.log(`NODE_ENV is set to ${env.NODE_ENV || 'not set'}`);
console.log(`PORT is set to ${env.PORT}`);

// Start the server with port conflict handling
console.log('\x1b[36m%s\x1b[0m', 'Starting Express server and React frontend...');

let serverStarted = false;
let server;

// List of alternative ports to try if the primary port is in use
const alternativePorts = ['3000', '8000', '8080', '9000'];
let currentPortIndex = -1; // Start with the configured port

function startServer() {
  server = spawn('npx', ['tsx', 'server/index.ts'], { 
    env,
    stdio: ['inherit', 'inherit', 'pipe'], // Pipe stderr so we can detect port conflicts
    shell: true
  });

  // Listen for successful start or errors
  server.stderr.on('data', (data) => {
    const output = data.toString();
    
    // Check for port conflict (EADDRINUSE)
    if (output.includes('EADDRINUSE') && currentPortIndex < alternativePorts.length) {
      console.log('\x1b[33m%s\x1b[0m', `Port ${env.PORT} is already in use!`);
      
      // Try next alternative port
      currentPortIndex++;
      if (currentPortIndex < alternativePorts.length) {
        env.PORT = alternativePorts[currentPortIndex];
        console.log('\x1b[36m%s\x1b[0m', `Trying alternative port: ${env.PORT}`);
        
        // Kill the current server and start a new one
        server.kill();
        setTimeout(startServer, 1000);
      } else {
        console.error('\x1b[31m%s\x1b[0m', 'ERROR: All ports are in use! Please free a port or specify a custom PORT in .env file.');
        process.exit(1);
      }
    } else {
      // Pass through other stderr output
      process.stderr.write(data);
    }
  });

  // Flag as started when no errors after a short delay
  setTimeout(() => {
    if (server.exitCode === null) { // Still running
      serverStarted = true;
      console.log('\x1b[32m%s\x1b[0m', `
✓ Server is running at http://localhost:${env.PORT}
✓ Access the application in your browser
`);
    }
  }, 2000);
}

// Start the server with the initial port
startServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\x1b[36m%s\x1b[0m', 'Shutting down...');
  if (server) server.kill('SIGINT');
  process.exit(0);
});