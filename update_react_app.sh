#!/bin/bash

echo "🌐 Building frontend assets..."
cd "/var/www/keyword_monitor/frontend"
npm install
npm run build

echo "✅ Sparse update complete!"
