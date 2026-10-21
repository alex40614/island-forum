#!/bin/bash
# Render 后端构建脚本

set -e

echo "📦 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
alembic upgrade head

echo "✅ Build complete!"
