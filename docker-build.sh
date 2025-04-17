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

# Check if running in Replit
is_replit() {
    if [ -n "$REPL_ID" ] || [ -n "$REPLIT_DEPLOYMENT" ]; then
        return 0  # true in shell
    else
        return 1  # false in shell
    fi
}

# Make sure Docker is running (Skip check if in Replit)
print_heading "CHECKING DOCKER STATUS"

if is_replit; then
    echo "📝 Running in Replit environment. Docker check skipped."
    echo "Note: To deploy this application outside of Replit:"
    echo "1. Download the project files"
    echo "2. Install Docker on your local machine"
    echo "3. Run this script on your local machine"
    
    # Provide alternative instructions for Replit
    print_heading "REPLIT DEPLOYMENT INSTRUCTIONS"
    echo "To deploy in Replit:"
    echo "1. Click the 'Run' button in Replit to start the application"
    echo "2. Use the Express.js server with PostgreSQL that's already configured"
    echo ""
    print_success "Ready for Replit deployment"
else
    # Check Docker for non-Replit environments
    docker info > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        handle_error "Docker is not running. Please start Docker and try again."
    fi
    print_success "Docker is running"
fi

# Make sure theme.json exists
print_heading "CHECKING THEME.JSON"
if [ ! -f theme.json ]; then
    echo "❗ theme.json file not found. Creating default theme file..."
    echo '{
  "variant": "professional",
  "primary": "hsl(222.2 47.4% 11.2%)",
  "appearance": "light",
  "radius": 0.5
}' > theme.json
    print_success "Created default theme.json file"
else
    print_success "theme.json file found"
fi

# Build the Docker images
print_heading "BUILDING DOCKER IMAGES"
print_step "Building Docker images (this may take a few minutes)..."

# First, check if node_modules exists
if [ -d "node_modules" ]; then
    print_step "Moving node_modules temporarily (to avoid copying to Docker context)..."
    mv node_modules node_modules.bak
fi

# Track the start time
start_time=$(date +%s)

# Build with error handling
docker-compose build --no-cache
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

print_success "Docker images built successfully in ${build_minutes}m ${build_seconds}s"

# Start the containers
print_heading "STARTING CONTAINERS"
print_step "Starting Docker containers..."
docker-compose up -d
if [ $? -ne 0 ]; then
    handle_error "Failed to start Docker containers. Please check the error messages above."
fi

print_success "Docker containers started successfully"

# Report status and provide useful commands
print_heading "APPLICATION STATUS"
echo "✨ Priority Poll application is now running!"
echo ""
echo "📊 Access the application at: http://localhost:5000"
echo "🔧 Access the database admin at: http://localhost:5050"
echo ""
echo "💡 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop application: docker-compose down"
echo "   - Restart application: docker-compose restart"
echo ""
echo "👤 Default admin credentials:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo ""
echo "🔄 Changes to your code won't be reflected until you rebuild."
echo "   To rebuild: ./docker-build.sh"