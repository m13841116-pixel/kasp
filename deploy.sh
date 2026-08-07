#!/bin/bash

# KASP.ir Ubuntu VPS One-Click Deployment Script
# Requirements: Ubuntu 22.04 or 24.04, Node.js 22, PM2, Nginx, Certbot

set -e

echo "🚀 Starting KASP.ir Production Deployment..."

# 1. Pull Latest Code
git pull origin main

# 2. Install Dependencies
echo "📦 Installing npm dependencies..."
npm ci --production=false

# 3. Build Application
echo "🏗️ Building Vite frontend and bundling Express server..."
npm run build

# 4. Reload PM2 Process Manager (Zero-downtime reload)
echo "⚡ Reloading PM2 Cluster..."
if pm2 list | grep -q "kasp-portal"; then
    pm2 reload ecosystem.config.cjs --env production
else
    pm2 start ecosystem.config.cjs --env production
fi

# 5. Save PM2 state
pm2 save

echo "✅ KASP.ir successfully deployed and running!"
