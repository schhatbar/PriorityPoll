#!/usr/bin/env sh
# This script uses /bin/sh syntax to be compatible with most Unix shells

# Print heading function
print_heading() {
    echo "============================================================"
    echo "  $1"
    echo "============================================================"
}

# Print steps function
print_step() {
    echo "➤ $1"
}

# Error handling function
handle_error() {
    echo "❌ ERROR: $1"
    if [ "$2" != "no_exit" ]; then
        exit 1
    fi
}

# Success message function
print_success() {
    echo "✅ $1"
}

# Make sure Docker is running
print_heading "CHECKING DOCKER STATUS"
docker info > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Docker is not running or you don't have permission to access it."
    echo ""
    echo "Common solutions:"
    echo "1. Make sure Docker Desktop (or Docker daemon) is running"
    echo "2. On Linux, you may need to add your user to the 'docker' group:"
    echo "   sudo usermod -aG docker $USER"
    echo "   (Log out and back in for this to take effect)"
    echo "3. On some systems, you may need to use 'sudo' to run this script"
    echo ""
    handle_error "Please fix Docker access and try again."
fi
print_success "Docker is running"

# No need to check for theme.json as it's created in the Dockerfile
print_heading "CHECKING DIRECTORIES"
# Make sure logs directory exists
if [ ! -d logs ]; then
    echo "❗ logs directory not found. Creating directory..."
    mkdir -p logs
    print_success "Created logs directory"
else
    print_success "logs directory found"
fi

# Create .env file if it doesn't exist
print_heading "CHECKING .ENV FILE"
if [ ! -f .env ]; then
    echo "❗ .env file not found. Creating a minimal .env file..."
    echo "# This is the minimum required environment variables for the application
NODE_ENV=production
HOST=0.0.0.0
PORT=5000
SESSION_SECRET=your-secret-key-here
# Replace this with your local PostgreSQL connection string
DATABASE_URL=postgres://localhost:5432/priority_poll_db" > .env
    print_success "Created minimal .env file. IMPORTANT: Update DATABASE_URL with your local database!"
else
    print_success ".env file found"
fi

# Only run Docker steps
print_heading "BUILDING DOCKER IMAGE"
print_step "Building Docker image (this may take a few minutes)..."

# First, check if node_modules exists
if [ -d "node_modules" ]; then
    print_step "Moving node_modules temporarily (to avoid copying to Docker context)..."
    mv node_modules node_modules.bak
fi

# Track the start time
start_time=$(date +%s)

# Build with error handling
cd simplified-docker
docker-compose -f docker-compose.simplified.yml build --no-cache
if [ $? -ne 0 ]; then
    # Restore node_modules if there was an error
    if [ -d "node_modules.bak" ]; then
        mv node_modules.bak node_modules
    fi
    handle_error "Docker build failed. Please check the error messages above."
fi

# Restore node_modules
if [ -d "node_modules.bak" ]; then
    mv node_modules.bak node_modules
fi

# Calculate build time
end_time=$(date +%s)
build_time=$(expr $end_time - $start_time)
build_minutes=$(expr $build_time / 60)
build_seconds=$(expr $build_time % 60)

print_success "Docker image built successfully in ${build_minutes}m ${build_seconds}s"

# Start the containers
print_heading "STARTING CONTAINER"
print_step "Starting Docker container..."
# We're already in the simplified-docker directory from the build step
docker-compose -f docker-compose.simplified.yml up -d
if [ $? -ne 0 ]; then
    # Go back to the root directory before exiting
    cd ..
    handle_error "Failed to start Docker container. Please check the error messages above."
fi

print_success "Docker container started successfully"
# Go back to the root directory
cd ..

# Report status and provide useful commands
print_heading "APPLICATION STATUS"
echo "✨ Priority Poll application is now running!"
echo ""
echo "📊 Access the application at: http://localhost:5000"
echo ""
echo "💡 Useful commands:"
echo "   - View logs: cd simplified-docker && docker-compose -f docker-compose.simplified.yml logs -f"
echo "   - Stop application: cd simplified-docker && docker-compose -f docker-compose.simplified.yml down"
echo "   - Restart application: cd simplified-docker && docker-compose -f docker-compose.simplified.yml restart"
echo ""
echo "👤 Default admin credentials:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "⚠️ IMPORTANT: Make sure your local PostgreSQL database is running and accessible"
echo "   Check your DATABASE_URL in the .env file to ensure it points to your local database"
echo ""
echo "🔄 Changes to your code won't be reflected until you rebuild."
echo "   To rebuild: ./docker-build-simplified.sh"