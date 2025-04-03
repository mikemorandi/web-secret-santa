#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Start application in production mode
if [ "$NODE_ENV" = "production" ]; then
  echo "Starting Secret Santa app in production mode..."
  node dist/main.js
else
  # Start application in development mode
  echo "Starting Secret Santa app in development mode..."
  npm run start:dev
fi