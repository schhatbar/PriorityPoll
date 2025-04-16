FROM node:20-alpine as base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including development dependencies
RUN npm ci

# Copy application code
COPY . .

# Build stage
FROM base as build

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine as production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (not just production)
# This is needed because your app is importing some dev dependencies in production
RUN npm ci

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/index.js"]