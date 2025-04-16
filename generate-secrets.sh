#!/bin/bash
# Script to generate secure secrets for deployment

# Generate a random 64-character string for SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 48)

# Create .env file with the generated secrets
echo "# Database Configuration" > .env
echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/priority_poll_db" >> .env
echo "" >> .env
echo "# Session Secret (automatically generated)" >> .env
echo "SESSION_SECRET=${SESSION_SECRET}" >> .env
echo "" >> .env
echo "# Node Environment" >> .env
echo "NODE_ENV=production" >> .env
echo "" >> .env
echo "# For Neon Database - forces standard connection mode instead of WebSocket" >> .env
echo "NEON_CONNECTION_TYPE=standard" >> .env
echo "# Server configuration" >> .env
echo "PORT=5000" >> .env
echo "HOST=0.0.0.0" >> .env

echo "Secrets generated successfully!"
echo "SESSION_SECRET has been set to a secure random value."
echo "Environment file (.env) has been created."