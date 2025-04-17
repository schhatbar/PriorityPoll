#!/bin/sh

# Check if theme.json exists
if [ ! -f /app/theme.json ]; then
  echo "theme.json not found, creating default theme file"
  echo '{
  "variant": "professional",
  "primary": "hsl(222.2 47.4% 11.2%)",
  "appearance": "light",
  "radius": 0.5
}' > /app/theme.json
fi

# Run the application
exec node --experimental-specifier-resolution=node dist/index.js