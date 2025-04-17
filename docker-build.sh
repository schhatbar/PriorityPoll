#!/bin/bash

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
    exit 1
}

# Success message function
print_success() {
    echo "✅ $1"
}

# Make sure Docker is running
print_heading "CHECKING DOCKER STATUS"
docker info > /dev/null 2>&1
if [ $? -ne 0 ]; then
    handle_error "Docker is not running. Please start Docker and try again."
fi
print_success "Docker is running"

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
build_time=$((end_time - start_time))
build_minutes=$((build_time / 60))
build_seconds=$((build_time % 60))

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