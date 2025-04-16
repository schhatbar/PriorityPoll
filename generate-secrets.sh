#!/bin/bash
# Script to generate secure secrets for deployment

# Generate a random 64-character string for SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 48)

# Create .env file with the generated secrets
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/priority_poll_db

# Session Secret (automatically generated)
SESSION_SECRET=${SESSION_SECRET}

# Node Environment
NODE_ENV=production
EOF

echo "Secrets generated successfully!"
echo "SESSION_SECRET has been set to a secure random value."
echo "Environment file (.env) has been created."