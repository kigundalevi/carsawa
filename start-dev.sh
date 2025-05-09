#!/bin/bash

PORT=5174

echo "🔍 Checking for processes using port $PORT..."
PID=$(lsof -ti tcp:$PORT)

if [ -n "$PID" ]; then
  echo "🛑 Killing process $PID on port $PORT..."
  kill -9 $PID
else
  echo "✅ Port $PORT is free."
fi

echo "🚀 Starting Vite server..."
npm run dev
