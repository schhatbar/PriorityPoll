#!/bin/bash

# Database setup and migration script for Priority Poll application

# Ensure this script is executable with: chmod +x db-setup.sh

echo "Priority Poll Database Setup and Migration Script"
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create an .env file with your database configuration."
  echo "You can copy .env.example and update it with your settings."
  exit 1
fi

# Load environment variables
source .env

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set in your .env file!"
  exit 1
fi

echo "Running database migrations..."

# Run Drizzle push to create/update database schema
echo "Applying schema changes..."
npx drizzle-kit push

# Status check
if [ $? -eq 0 ]; then
  echo "✅ Database migration completed successfully!"
  
  echo "Would you like to create an admin user? (y/n)"
  read CREATE_ADMIN
  
  if [ "$CREATE_ADMIN" = "y" ] || [ "$CREATE_ADMIN" = "Y" ]; then
    echo "Enter admin username (default: admin):"
    read ADMIN_USERNAME
    ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
    
    echo "Enter admin password (default: admin123):"
    read -s ADMIN_PASSWORD
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
    
    echo "Creating admin user..."
    # Execute a script to create admin user
    node -e "
    const { scrypt } = require('crypto');
    const { promisify } = require('util');
    const { Pool } = require('@neondatabase/serverless');
    
    const scryptAsync = promisify(scrypt);
    
    async function createAdmin() {
      try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        
        // Hash the password
        const salt = require('crypto').randomBytes(16).toString('hex');
        const buf = await scryptAsync('$ADMIN_PASSWORD', salt, 64);
        const hashedPassword = \`\${buf.toString('hex')}.\${salt}\`;
        
        // Check if user exists
        const userResult = await pool.query(
          'SELECT * FROM users WHERE username = $1',
          ['$ADMIN_USERNAME']
        );
        
        if (userResult.rows.length > 0) {
          console.log('Admin user already exists!');
        } else {
          // Insert admin user
          await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
            ['$ADMIN_USERNAME', hashedPassword, 'admin']
          );
          console.log('Admin user created successfully!');
        }
        
        await pool.end();
      } catch (error) {
        console.error('Error creating admin user:', error);
      }
    }
    
    createAdmin();
    "
  fi
  
  echo "Would you like to start Drizzle Studio to view the database? (y/n)"
  read START_STUDIO
  
  if [ "$START_STUDIO" = "y" ] || [ "$START_STUDIO" = "Y" ]; then
    echo "Starting Drizzle Studio..."
    npx drizzle-kit studio
  fi
  
  echo "Database setup complete. You can now start your application with: npm run dev"
else
  echo "❌ Database migration failed!"
  exit 1
fi