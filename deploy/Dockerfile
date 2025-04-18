FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Create the theme file
RUN echo '{ "variant": "professional", "primary": "hsl(222.2 47.4% 11.2%)", "appearance": "light", "radius": 0.5 }' > ./theme.json

# Expose the port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Run the application
CMD ["node", "--experimental-specifier-resolution=node", "dist/index.js"]