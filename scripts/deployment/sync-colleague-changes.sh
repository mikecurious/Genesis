#!/bin/bash
# Script to sync colleague's changes to your Genesis repo

echo "🔄 Syncing changes from colleague's repo to Genesis..."

# Navigate to your Genesis repo
cd /home/michael/OneDrive/Documents/Code/Genesis

# Fetch from colleague's repo (already added as 'colleague' remote)
echo "📥 Fetching from DidierNiy/MyGF-AI..."
git fetch colleague

# Merge colleague's changes
echo "🔀 Merging changes..."
git merge colleague/main -m "Sync changes from colleague's repository"

# Push to your Genesis repo
echo "📤 Pushing to mikecurious/Genesis..."
git push origin main

echo "✅ Sync complete! Render will auto-deploy from mikecurious/Genesis"
