#!/bin/bash

# Lint script for KPPM
echo "🔍 Running ESLint..."
npm run lint:eslint

echo "🎨 Checking Prettier formatting..."
npm run lint:prettier

echo "📦 Checking TypeScript..."
npm run lint:types

echo "✅ All linting checks complete!"