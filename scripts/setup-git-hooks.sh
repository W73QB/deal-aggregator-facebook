#!/bin/bash

# Setup Git Hooks for GA4 ID Protection
echo "🔧 Setting up Git hooks for GA4 ID protection..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-commit hook
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "🛡️ Protection enabled:"
echo "  - Pre-commit hook will validate GA4 IDs"
echo "  - Only G-9ZVTTTBD03 is allowed"
echo "  - Duplicate load guards are required"
echo ""
echo "🔬 To test the hook:"
echo "  git add . && git commit -m 'test commit'"