#!/bin/bash
# Deployment script for PDD Backend Server on VM
# This script helps set up the backend on a fresh VM

set -e

echo "🚀 Setting up PDD Backend Server..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pdd CLI is installed
if ! command -v pdd &> /dev/null; then
    echo "⚠️  Warning: pdd CLI not found in PATH."
    echo "   Please install pdd from: https://github.com/promptdriven/pdd"
    echo "   Continuing with setup anyway..."
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Setup complete!"
echo ""
echo "To run the server:"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "Or using uvicorn directly:"
echo "  uvicorn app.main:app --host 0.0.0.0 --port 8000"

