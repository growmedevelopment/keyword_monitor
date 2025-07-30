#!/bin/bash

echo "🚀 Clearing Laravel optimization cache..."
cd "/var/www/keyword_monitor/backend"
php artisan optimize:clear

echo "📦 Installing backend dependencies..."
composer install --no-interaction --prefer-dist --no-scripts

echo "✅ Laravel update complete!"
