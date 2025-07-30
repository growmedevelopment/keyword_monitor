#!/bin/bash

# Root repository directory
REPO_DIR="/var/www/keyword_monitor"

# Backend and frontend directories
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"

echo "🔐 Setting up sparse checkout..."
cd $REPO_DIR
git sparse-checkout init
git sparse-checkout set backend frontend README.md

git stash push -m "Auto-stash before pull"
git pull origin main

echo "🔄 Pulling latest code from Git..."
git pull origin main

echo "🚀 Clearing Laravel optimization cache..."
cd $BACKEND_DIR
php artisan optimize:clear

echo "📦 Installing backend dependencies..."
composer install --no-interaction --prefer-dist --no-scripts

echo "🧪 Running Laravel migrations (force)..."
php artisan migrate --force

echo "🌐 Building frontend assets..."
cd $FRONTEND_DIR
npm install
npm run build

echo "✅ Sparse update complete!"
