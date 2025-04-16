/**
 * Run-local script for Windows compatibility
 * This script starts both the React frontend and Express backend
 * with proper environment variables for local development
 */

// Import required modules
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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

console.log('\x1b[32m%s\x1b[0m', '✓ Environment variables loaded successfully');
console.log(`DATABASE_URL is ${env.DATABASE_URL ? 'set' : 'not set'}`);
console.log(`NODE_ENV is set to ${env.NODE_ENV || 'not set'}`);

// Start the server
console.log('\x1b[36m%s\x1b[0m', 'Starting Express server and React frontend...');

const server = spawn('npx', ['tsx', 'server/index.ts'], { 
  env,
  stdio: 'inherit',
  shell: true
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\x1b[36m%s\x1b[0m', 'Shutting down...');
  server.kill('SIGINT');
  process.exit(0);
});

console.log('\x1b[32m%s\x1b[0m', `
✓ Server is running at http://localhost:${env.PORT || 5000}
✓ Access the application in your browser
`);