#!/bin/bash

# Build and run script for WebSocket Server

set -e

echo "🐳 Building WebSocket Server Docker Image..."

# Build the Docker image
docker build -t websocket-server:latest .

echo "✅ Docker image built successfully!"

echo "🚀 Starting WebSocket Server..."

# Run the container
docker run -d \
  --name websocket-server \
  -p 3000:3000 \
  --restart unless-stopped \
  websocket-server:latest

echo "✅ WebSocket Server is now running!"
echo "📍 Server URL: http://localhost:3000"
echo "🌐 WebSocket URL: ws://localhost:3000"
echo "🏠 Home page: http://localhost:3000/home?botId=your-bot-id&roomId=your-room-id"

echo ""
echo "📋 Useful commands:"
echo "  Check logs: docker logs websocket-server"
echo "  Stop server: docker stop websocket-server"
echo "  Remove container: docker rm websocket-server"
echo "  Test API: curl -X POST http://localhost:3000/api/rooms/test/message -H 'Content-Type: application/json' -d '{\"message\": \"Hello World!\"}'"
