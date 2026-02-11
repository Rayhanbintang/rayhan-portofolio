#!/bin/bash

echo "Stopping Ollama and ngrok..."

# Stop ngrok
if pgrep -x "ngrok" > /dev/null; then
    pkill ngrok
    echo "✓ ngrok stopped"
else
    echo "ngrok not running"
fi

# Stop Ollama
if pgrep -x "ollama" > /dev/null; then
    pkill ollama
    echo "✓ Ollama stopped"
else
    echo "Ollama not running"
fi

# Clean up log file
rm -f ngrok.log

echo ""
echo "All services stopped"
