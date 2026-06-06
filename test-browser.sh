#!/bin/bash
# Start the Next.js production server and keep it running
cd /home/z/my-project
node .next/standalone/server.js > /dev/null 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
sleep 3

# Verify it's running
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "FATAL: Server failed to start"
  exit 1
fi

echo "Server is running"

# Keep server alive by holding the script
echo "Server running - press Ctrl+C to stop"
while kill -0 $SERVER_PID 2>/dev/null; do
  sleep 5
done

echo "Server stopped"
