#!/usr/bin/env sh

# Check if theme.json exists
if [ ! -f ./theme.json ]; then
  echo "theme.json not found, creating default theme file"
  echo '{
  "variant": "professional",
  "primary": "hsl(222.2 47.4% 11.2%)",
  "appearance": "light",
  "radius": 0.5
}' > ./theme.json
fi

# Show current directory and files (for debugging)
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Run the application
exec node --experimental-specifier-resolution=node dist/index.js