#!/bin/bash

# Predation
# Quick start script

echo "Starting Predation"
echo "=================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "Installing dependencies..."
    cd server && npm install && cd ..
fi

echo "Starting OSC Bridge Server..."
echo "Open client/index.html in your browser"
echo "Load docs/lotka-osc-receiver.scd in SuperCollider (optional)"
echo ""
echo "Available models:"
echo "  • Predator-Prey (Lotka-Volterra)"
echo "  • Reaction-Diffusion (Gray-Scott)"
echo "  • Kuramoto Oscillators"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
cd server && node osc-bridge.js
