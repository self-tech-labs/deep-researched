#!/bin/bash
# Database operations script with proper environment loading

# Load environment variables
source .env.local

# Run the database push command
npm run db:push 