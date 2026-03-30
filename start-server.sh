#!/bin/bash
cd /home/z/my-project
while true; do
  PORT=3000 node .next/standalone/server.js </dev/null >>server.log 2>&1
  echo "$(date): Server crashed, restarting in 2s..." >>server.log
  sleep 2
done
