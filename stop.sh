#!/bin/bash

echo "Stopping Ollama and ngrok..."

# Stop ngrok
if pgrep -x "ngrok" > /dev/null; then
    pkill ngrok
    echo "✓ ngrok stopped"
else
    echo "ngrok not running"
fi

# Stop Ollama (try both methods)
if pgrep -x "ollama" > /dev/null; then
    # Try systemd first
    if systemctl is-active --quiet ollama 2>/dev/null; then
        sudo systemctl stop ollama
        echo "✓ Ollama service stopped"
    else
        # Kill process directly
        pkill ollama
        sleep 1
        # Force kill if still running
        if pgrep -x "ollama" > /dev/null; then
            pkill -9 ollama
        fi
        echo "✓ Ollama stopped"
    fi
else
    echo "Ollama not running"
fi

# Clean up log file
rm -f ngrok.log

echo ""
echo "All services stopped"
