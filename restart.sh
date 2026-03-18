#!/bin/bash
# CarsIgnite — Full restart script
echo "🔴 Stopping services..."
kill $(lsof -t -i:3001) 2>/dev/null
kill $(lsof -t -i:3000) 2>/dev/null

echo "🗑  Clearing database..."
rm -f db/carsignite.db db/carsignite.db-shm db/carsignite.db-wal

echo "🚀 Starting API server (port 3001)..."
cd "$(dirname "$0")"
npm start &
sleep 2

echo "🌐 Starting Next.js frontend (port 3000)..."
cd frontend
npm run dev &

echo ""
echo "✅ CarsIgnite running:"
echo "   Frontend → http://localhost:3000"
echo "   API      → http://localhost:3001"
echo "   Admin    → admin@carsignite.co.za / admin123"
