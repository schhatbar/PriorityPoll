# Priority Polling Application Deployment Guide

This guide provides instructions for deploying the Priority Polling Application using Docker.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose installed
- Git to clone the repository (or download as a ZIP file)

## Deployment Options

### Option 1: Using the Automated Build Script (Recommended)

Run the provided build script:

#### For Linux/Mac:
```bash
chmod +x docker-build.sh
./docker-build.sh
```

#### For Windows Command Prompt:
```
deploy.bat
```

#### For Windows PowerShell:
```
.\deploy.ps1
```

The script is environment-aware and will:

**In Replit Environment:**
1. Detect it's running in Replit
2. Skip Docker-related operations
3. Provide guidance specific to the Replit environment
4. Display access information for the Replit app

**In Local/Server Environment:**
1. Check if Docker is installed and running
2. Ensure theme.json exists (creates it if missing)
3. Build the application Docker image
4. Start the application, PostgreSQL database, and pgAdmin
5. Display access information when complete

### Option 2: Manual Deployment

1. Make sure Docker is running
2. Open a terminal or command prompt
3. Navigate to the project directory
4. Run the following command:
```
docker-compose up --build -d
```

## Accessing the Application

Once deployed, you can access:

- **Application:** http://localhost:5000
- **pgAdmin (database management):** http://localhost:5050
  - Email: admin@example.com
  - Password: admin

## Database Connection Details

If you need to connect to the database directly:

- **Host:** localhost
- **Port:** 5432
- **User:** postgres
- **Password:** postgres
- **Database:** priority_poll_db

## Default Admin Account

The system comes with a default admin account:
- **Username:** admin
- **Password:** admin123

## Stopping the Application

To stop all containers:
```
docker-compose down
```

To stop and remove all data (including the database):
```
docker-compose down -v
```

## Troubleshooting

### Application not starting properly

Check the Docker logs:
```
docker-compose logs app
```

### Database connection issues

Check the database logs:
```
docker-compose logs db
```

### Missing theme.json error

If you see an error like `Error: Failed to read theme file: ENOENT: no such file or directory, open './theme.json'`:

1. Create a theme.json file in the project root with the following content:
   ```json
   {
     "variant": "professional",
     "primary": "hsl(222.2 47.4% 11.2%)",
     "appearance": "light",
     "radius": 0.5
   }
   ```

2. Update your docker-compose.yml to mount this file:
   ```yaml
   volumes:
     - ./theme.json:/app/theme.json
   ```

3. Rebuild the application:
   ```
   docker-compose down
   docker-compose up --build -d
   ```

### Entrypoint script error

If you see an error like `exec /app/entrypoint.sh: no such file or directory`:

1. This is a path resolution issue with the entrypoint script.

2. You can fix this by editing the Dockerfile and changing:
   ```
   ENTRYPOINT ["/app/entrypoint.sh"]
   ```
   to:
   ```
   ENTRYPOINT ["sh", "./entrypoint.sh"]
   ```

3. Make sure entrypoint.sh has proper line endings for Unix (LF, not CRLF):
   ```bash
   # For Linux/Mac:
   dos2unix entrypoint.sh
   
   # Or using sed:
   sed -i 's/\r$//' entrypoint.sh
   ```

4. Rebuild the application:
   ```
   docker-compose down
   docker-compose up --build -d
   ```

### Rebuilding after code changes

If you've made code changes and need to rebuild:
```
docker-compose up --build -d
```

## Custom Configuration

You can modify environment variables in the `docker-compose.yml` file, including:

- `DATABASE_URL`: Database connection string
- `SESSION_SECRET`: Secret key for session management
- Other environment variables as needed

## Replit Deployment

This application is also designed to run natively in Replit without Docker:

1. The project is pre-configured to run in Replit's Node.js environment
2. PostgreSQL is already configured in the Replit environment
3. To deploy:
   - Click the "Run" button in Replit to start the application
   - The application will be available at your Replit URL
   - No Docker configuration is required in Replit

### Replit DB Connection

In Replit, the PostgreSQL database is automatically provisioned and the connection details are available through environment variables:
- The connection string is available in the `DATABASE_URL` environment variable
- Individual connection parameters are available in `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, and `PGPORT`

## Support

If you encounter any issues, please [open an issue](https://github.com/your-repository/issues) on the GitHub repository.