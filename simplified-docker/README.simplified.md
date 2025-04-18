# Priority Poll App - Simplified Docker Deployment

This setup is for users who want to run only the Node.js and React application in Docker, while using a local PostgreSQL database.

## Prerequisites

- Docker installed and running on your machine
- PostgreSQL database running locally
- Git to clone the repository (or download as a ZIP file)

## Quick Start

### 1. Set Up Your Local Database

Make sure your PostgreSQL database is running and accessible. You'll need to:

- Create a database named `priority_poll_db` (or use any name you prefer)
- Have the username and password for your PostgreSQL server
- Know the host and port for your PostgreSQL server (typically localhost:5432)

### 2. Configure Environment Variables

Edit the `.env` file (or create one if it doesn't exist) with your local database connection string:

```
NODE_ENV=production
HOST=0.0.0.0
PORT=5000
SESSION_SECRET=your-secret-key-here
DATABASE_URL=postgres://username:password@localhost:5432/priority_poll_db
```

Replace `username`, `password`, and other values with your local PostgreSQL credentials.

### 3. Run the Build Script

Make the script executable and run it:

```bash
chmod +x docker-build-simplified.sh
./docker-build-simplified.sh
```

This will:
1. Check if Docker is running
2. Ensure theme.json and .env files exist
3. Build the Docker image
4. Start the application container

### 4. Access the Application

Once the container is running, you can access:

- **Application:** http://localhost:5000

## Default Admin Account

The system comes with a default admin account:
- **Username:** admin
- **Password:** admin123

## Useful Commands

- **View logs:**
  ```
  docker-compose -f docker-compose.simplified.yml logs -f
  ```

- **Stop the application:**
  ```
  docker-compose -f docker-compose.simplified.yml down
  ```

- **Restart the application:**
  ```
  docker-compose -f docker-compose.simplified.yml restart
  ```

- **Rebuild after code changes:**
  ```
  ./docker-build-simplified.sh
  ```

## Troubleshooting

### Connection to PostgreSQL fails

- Make sure your PostgreSQL server is running
- Check that the DATABASE_URL in the .env file points to your local PostgreSQL server
- Ensure your PostgreSQL server allows connections from Docker containers
  - For Docker Desktop on macOS and Windows, localhost in the container should resolve to the host machine
  - For Linux, you might need to use the host's IP address instead of localhost

### Missing theme.json error

If you see an error related to theme.json, run the build script again which will create the file automatically.

### Docker build fails with "failed to calculate checksum" errors

If you encounter errors like `failed to calculate checksum` or `not found` during build:

- This version has the entrypoint script directly embedded in the Dockerfile
- No external entrypoint.sh file is required
- Theme.json is also created directly in the container

## Database Schema

The application will attempt to create the necessary tables in your database on first run. If you need to manually set up the schema:

1. Connect to your PostgreSQL database
2. Run the SQL commands in the db-init.sql file