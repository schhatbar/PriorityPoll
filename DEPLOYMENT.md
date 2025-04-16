# Priority Polling Application Deployment Guide

This guide provides instructions for deploying the Priority Polling Application using Docker.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose installed
- Git to clone the repository (or download as a ZIP file)

## Deployment Options

### Option 1: Using the Quick Deploy Scripts (Recommended)

#### For Windows Command Prompt:
```
deploy.bat
```

#### For Windows PowerShell:
```
.\deploy.ps1
```

This will automatically:
1. Check if Docker is installed and running
2. Build the application Docker image
3. Start the application, PostgreSQL database, and pgAdmin
4. Display access information when complete

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

## Support

If you encounter any issues, please [open an issue](https://github.com/your-repository/issues) on the GitHub repository.