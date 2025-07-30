#!/bin/bash

echo "🔐 Setting up sparse checkout..."
cd "/var/www/keyword_monitor"
git sparse-checkout init
git sparse-checkout set --skip-checks backend frontend README.md


git stash push -m "Auto-stash before pull"
echo "🔄 Pulling latest code from Git..."
git pull origin main

