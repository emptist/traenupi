#!/bin/bash

# Lively-Puter Integration Test Server
# 
# This script starts a simple HTTP server to test the Lively-Puter integration

echo "🚀 Starting Lively-Puter Integration Test Server..."
echo ""

# Check if we're in the TraeNuPI directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the TraeNuPI root directory"
  exit 1
fi

# Check if Python is available
if command -v python3 &> /dev/null; then
  echo "✓ Using Python 3 HTTP server"
  echo "📍 Server running at: http://localhost:8000/examples/lively-puter-test.html"
  echo ""
  echo "Press Ctrl+C to stop the server"
  echo ""
  python3 -m http.server 8000
elif command -v python &> /dev/null; then
  echo "✓ Using Python 2 HTTP server"
  echo "📍 Server running at: http://localhost:8000/examples/lively-puter-test.html"
  echo ""
  echo "Press Ctrl+C to stop the server"
  echo ""
  python -m SimpleHTTPServer 8000
else
  echo "❌ Error: Python not found. Please install Python or use another HTTP server."
  echo ""
  echo "Alternative: Use Node.js http-server"
  echo "  npm install -g http-server"
  echo "  http-server -p 8000"
  exit 1
fi
