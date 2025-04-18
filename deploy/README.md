# Priority Poll Deployment Guide

This guide contains simple instructions for deploying the Priority Poll application using Docker.

## Prerequisites

1. **Docker and Docker Compose installed**
2. **PostgreSQL database running locally**
   - Database name: `priority_poll_db`
   - Default PostgreSQL port (5432)

## Quick Start

1. **Download the code** from Replit

2. **Run the deploy script**:
   ```bash
   chmod +x deploy/deploy.sh
   ./deploy/deploy.sh
   ```

3. **Access the application** at http://localhost:5000

4. **Login with default admin credentials**:
   - Username: `admin`
   - Password: `admin123`

## Manual Deployment

If you prefer to run the commands manually:

1. **Build and start the container**:
   ```bash
   cd deploy
   docker-compose up -d --build
   ```

2. **Stop the application**:
   ```bash
   cd deploy
   docker-compose down
   ```

## Configuring the Database Connection

By default, the application tries to connect to PostgreSQL using `host.docker.internal:5432`. This works for Docker Desktop on Windows and Mac.

If you need to use a different connection:

1. Edit the `docker-compose.yml` file
2. Update the `DATABASE_URL` environment variable:
   ```yaml
   environment:
     - DATABASE_URL=postgres://username:password@hostname:5432/priority_poll_db
   ```

## Troubleshooting

If you encounter issues:

1. **Check database connection**:
   - Make sure PostgreSQL is running
   - Verify the database name and credentials
   - Check that Docker can access your PostgreSQL (network settings)

2. **View logs**:
   ```bash
   cd deploy
   docker-compose logs
   ```

3. **Restart the application**:
   ```bash
   cd deploy
   docker-compose restart
   ```