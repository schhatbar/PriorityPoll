# Local Development Setup Guide

## Overview
This guide helps you set up and run the Priority Polling application on your local Windows machine. The application includes both a React frontend and an Express backend, with a PostgreSQL database for data storage.

## Prerequisites
- Node.js (v16 or later) installed
- PostgreSQL installed and running
- Git for cloning the repository

## Quick Start (One Command)

After cloning the repository, you can start the application with a single command:

### Using Command Prompt:
```
start-local.bat
```

### Using PowerShell:
```
.\start-local.ps1
```

### Or Simply Use Node Directly:
```
node --experimental-modules run-local.js
```

This will:
1. Create a default `.env` file with `sslmode=disable` for local development
2. Start the application server on port 5000
3. Connect to your local PostgreSQL database

The first time you run this, it will:
1. Create a default `.env` file if one doesn't exist
2. Start the application server

## Manual Setup

### 1. Setup Database
1. Install PostgreSQL if you haven't already
2. Create a new database:
   ```sql
   CREATE DATABASE polling_app;
   ```

### 2. Configure Environment
1. Create a `.env` file in the project root with:
   ```
   DATABASE_URL=postgres://postgres:your_password@localhost:5432/polling_app
   SESSION_SECRET=your_session_secret
   NODE_ENV=development
   NEON_CONNECTION_TYPE=standard
   ```
   
   Replace `your_password` with your actual PostgreSQL password.

### 3. Install Dependencies
```
npm install
```

### 4. Initialize Database
```
npm run db:push
```

### 5. Start the Application
```
node --experimental-modules run-local.js
```

## Troubleshooting

### Database Connection Issues
- Check if PostgreSQL service is running
- Verify your credentials in the `.env` file
- Make sure the database exists

### ESM Module Issues
If you see errors related to ES modules or `require is not defined in ES module scope`:
1. Make sure to use `node --experimental-modules run-local.js` instead of just `node run-local.js`
2. Alternatively, you can rename the file to `run-local.cjs` to use CommonJS mode

### Port Already in Use
If port 5000 is already in use:
1. Find the process:
   ```
   netstat -ano | findstr :5000
   ```
2. Kill the process:
   ```
   taskkill /PID <PID> /F
   ```
3. Alternatively, change the PORT in your `.env` file

### SSL Connection Issues
The application is now configured to use the `sslmode` parameter in the connection string:

1. For local development (no SSL):
   ```
   DATABASE_URL=postgres://postgres:your_password@localhost:5432/polling_app?sslmode=disable
   ```

2. For production (with SSL):
   ```
   DATABASE_URL=postgres://postgres:your_password@localhost:5432/polling_app?sslmode=require
   ```

3. For other SSL options:
   - `prefer`: Try SSL but fallback to non-SSL
   - `require`: Require SSL but don't verify certificate
   - `verify-ca`: Verify server certificate
   - `verify-full`: Verify server certificate and hostname

### Host Binding Issues
If you encounter issues with the server binding to network interfaces:

1. The application now uses `127.0.0.1` (localhost) instead of `0.0.0.0` to avoid compatibility issues
2. If you need to access the application from other devices on your network:
   - Add `HOST=0.0.0.0` to your `.env` file (if your system supports it)
   - Or, set up a reverse proxy like Nginx

## Default Admin Account
- Username: `admin`
- Password: `admin123`

## Database Schema
The application uses Drizzle ORM with the following main tables:
- users: Admin users for the application
- polls: Poll definitions with options
- votes: User votes on polls
- user_points: Gamification data for participants

## Support
If you encounter any issues, please check the console output for error messages and refer to the troubleshooting section above.