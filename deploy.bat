@echo off
echo ======================================================
echo      Priority Polling System - Docker Deployment
echo ======================================================
echo.

REM Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Docker is not installed or not in PATH.
  echo Please install Docker Desktop for Windows first.
  echo Visit: https://www.docker.com/products/docker-desktop/
  pause
  exit /b 1
)

echo Checking Docker status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Docker is not running.
  echo Please start Docker Desktop and try again.
  pause
  exit /b 1
)

echo.
echo Building and starting containers...
echo.

REM Build and start the containers
docker-compose up --build -d

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ERROR: Failed to build and start containers.
  pause
  exit /b 1
)

echo.
echo ======================================================
echo SUCCESS! Priority Polling System is now running.
echo.
echo Access your application at: http://localhost:5000
echo Access pgAdmin at: http://localhost:5050
echo   - Email: admin@example.com
echo   - Password: admin
echo.
echo Database connection details:
echo   - Host: localhost
echo   - Port: 5432
echo   - User: postgres
echo   - Password: postgres
echo   - Database: priority_poll_db
echo ======================================================
echo.

echo Press any key to view container status...
pause >nul

echo.
echo Container status:
docker-compose ps

echo.
echo Press any key to exit...
pause >nul