#!/bin/bash

# Format script for KPPM
echo "🎨 Formatting with Prettier..."
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

echo "🔧 Auto-fixing ESLint issues..."
npx eslint "src/**/*.{ts,tsx}" --fix

echo "✨ Code formatting complete!"