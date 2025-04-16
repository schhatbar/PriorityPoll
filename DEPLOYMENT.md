# Deployment Guide

This guide covers how to deploy the Priority Poll application on your local server or any hosting environment.

## Prerequisites

- Node.js v18+ and npm
- PostgreSQL database
- Git (for cloning the repository)

## Local Development Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd priority-poll
```

2. **Set up environment variables**

Copy the example environment file and edit it with your configuration:

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials and other settings:

```
DATABASE_URL=postgresql://username:password@localhost:5432/priority_poll_db
SESSION_SECRET=your_session_secret_here
NODE_ENV=development
PORT=5000
```

3. **Install dependencies**

```bash
npm install
```

4. **Set up the database**

The project uses Drizzle ORM for database migrations. Run the following to create all tables:

```bash
# Push the schema to the database
npm run db:push

# Optional: View the database structure in Drizzle Studio
npx drizzle-kit studio
```

5. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Production Deployment

### Building for Production

1. **Set environment variables for production**

Make sure to update the `.env` file with production settings:

```
DATABASE_URL=postgresql://username:password@your-production-db-host:5432/priority_poll_db
SESSION_SECRET=your_secure_production_secret
NODE_ENV=production
PORT=5000
```

2. **Build the application**

```bash
# Build the client and server
npm run build
```

This creates a `dist` directory with the compiled server and a `dist/client` directory with the compiled frontend.

3. **Start the production server**

```bash
npm start
```

### Using PM2 for Process Management (Recommended)

For production environments, it's recommended to use a process manager like PM2:

1. **Install PM2 globally**

```bash
npm install -g pm2
```

2. **Create a PM2 ecosystem file**

Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [{
    name: "priority-poll",
    script: "dist/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    instances: "max",
    exec_mode: "cluster"
  }]
};
```

3. **Start the application with PM2**

```bash
pm2 start ecosystem.config.js
```

4. **Setup PM2 to start on system boot**

```bash
pm2 startup
pm2 save
```

### Nginx Configuration (Optional)

If you're using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment (Alternative)

1. **Create a Dockerfile**

Create a `Dockerfile` at the root of your project:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

2. **Create a docker-compose.yml file**

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://username:password@db:5432/priority_poll_db
      - SESSION_SECRET=your_secure_production_secret
      - NODE_ENV=production
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=your_password
      - POSTGRES_USER=username
      - POSTGRES_DB=priority_poll_db

volumes:
  postgres_data:
```

3. **Build and run with Docker Compose**

```bash
docker-compose up -d
```

## Running Database Migrations

### Running Migrations for Schema Changes

When you need to update the database schema:

1. **Update the schema definitions in `shared/schema.ts`**

2. **Generate migration files (recommended for production)**

```bash
npx drizzle-kit generate:pg
```

This will create SQL migration files in the `drizzle` directory.

3. **Apply the migrations**

```bash
# Using our provided migration script
npx tsx server/migrate.ts

# Or directly with drizzle-kit
npx drizzle-kit push
```

## Troubleshooting

### Database Connection Issues

- Ensure your PostgreSQL server is running
- Verify the DATABASE_URL is correct
- Check firewall settings to ensure the database port is accessible

### Application Startup Problems

- Check the logs for any error messages
- Verify that all environment variables are set correctly
- Ensure the build process completed successfully

## Backup and Restore

### Database Backup

```bash
pg_dump -U username -h localhost -d priority_poll_db > backup.sql
```

### Database Restore

```bash
psql -U username -h localhost -d priority_poll_db < backup.sql
```

## Monitoring and Maintenance

- Use PM2's monitoring features: `pm2 monit`
- Set up regular database backups
- Keep Node.js and all dependencies updated

## Security Considerations

- Always use HTTPS in production
- Keep the SESSION_SECRET secure and unique
- Implement rate limiting for authentication endpoints
- Regularly update dependencies