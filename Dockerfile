FROM node:20-alpine as base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean slate
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

# Copy package files for production
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from build stage - this includes both backend and frontend
COPY --from=build /app/dist ./dist

# Expose the port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/index.js"]