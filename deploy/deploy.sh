#!/bin/bash

# Simple deployment script for Priority Poll application

echo "===== DEPLOYING PRIORITY POLL APPLICATION ====="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ ERROR: Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is ready"

# Build and start the containers
echo "🔄 Building and starting the application..."
cd deploy
docker-compose up -d --build

# Check if the containers are running
if [ $? -eq 0 ]; then
    echo "✅ Application is running"
    echo "📊 Access the application at: http://localhost:5000"
    echo ""
    echo "👤 Default admin credentials:"
    echo "   - Username: admin"
    echo "   - Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: Make sure your PostgreSQL database is running and accessible"
    echo "   The application expects a database at: host.docker.internal:5432/priority_poll_db"
    echo "   You may need to update DATABASE_URL in docker-compose.yml if your setup is different"
else
    echo "❌ Failed to start the application"
fi