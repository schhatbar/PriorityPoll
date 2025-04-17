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

# Copy all source files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/shared ./shared
COPY --from=build /app/client/index.html ./client/index.html
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/theme.json ./theme.json

# Expose the port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Copy the entrypoint script
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Use the entrypoint script to ensure theme.json exists
ENTRYPOINT ["/app/entrypoint.sh"]