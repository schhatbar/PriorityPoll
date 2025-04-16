Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "     Priority Polling System - Docker Deployment" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
$dockerInstalled = $null
try {
    $dockerInstalled = Get-Command docker -ErrorAction Stop
} catch {
    Write-Host "ERROR: Docker is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Docker Desktop for Windows first."
    Write-Host "Visit: https://www.docker.com/products/docker-desktop/"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "ERROR: Docker is not running." -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Building and starting containers..." -ForegroundColor Yellow
Write-Host ""

# Build and start the containers
try {
    docker-compose up --build -d
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build and start containers"
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to build and start containers." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "SUCCESS! Priority Polling System is now running." -ForegroundColor Green
Write-Host ""
Write-Host "Access your application at: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Access pgAdmin at: http://localhost:5050" -ForegroundColor Yellow
Write-Host "  - Email: admin@example.com"
Write-Host "  - Password: admin"
Write-Host ""
Write-Host "Database connection details:"
Write-Host "  - Host: localhost"
Write-Host "  - Port: 5432"
Write-Host "  - User: postgres"
Write-Host "  - Password: postgres"
Write-Host "  - Database: priority_poll_db"
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to view container status"

Write-Host ""
Write-Host "Container status:" -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Read-Host "Press Enter to exit"