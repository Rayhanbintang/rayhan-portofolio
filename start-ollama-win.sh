#!/bin/bash

# Source Vercel configuration
if [ -f "$(dirname "$0")/vercel.config" ]; then
    source "$(dirname "$0")/vercel.config"
fi

echo "Starting ngrok tunnel to Windows Ollama..."

# Get Windows host IP
WINDOWS_HOST=$(ip route show | grep -i default | awk '{print $3}')
echo "Windows host IP: $WINDOWS_HOST"

# Verify Ollama is accessible
if curl -s http://${WINDOWS_HOST}:11434/api/tags > /dev/null; then
    echo "✓ Ollama is accessible from WSL"
else
    echo "✗ Cannot reach Ollama. Make sure it's running on Windows."
    exit 1
fi

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "Starting ngrok..."
    ngrok http ${WINDOWS_HOST}:11434 --log=stdout > ngrok.log 2>&1 &
    sleep 5  # Give ngrok more time to start
else
    echo "ngrok already running"
fi

# Wait for ngrok to establish tunnel
echo "Waiting for ngrok tunnel to establish..."
sleep 3

# Try multiple methods to get ngrok URL
NGROK_URL=""

# Method 1: Parse JSON properly
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)

# Method 2: Grep if jq not available
if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -oP '"public_url":"https://[^"]+' | grep -oP 'https://[^"]+' | head -1)
fi

# Method 3: Alternative grep
if [ -z "$NGROK_URL" ]; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1)
fi

if [ -z "$NGROK_URL" ]; then
    echo "Failed to get ngrok URL. Debug info:"
    echo ""
    echo "=== ngrok API response ==="
    curl -s http://localhost:4040/api/tunnels | jq . || curl -s http://localhost:4040/api/tunnels
    echo ""
    echo "=== ngrok.log tail ==="
    tail -20 ngrok.log
    exit 1
fi

echo ""
echo "✓ Services started successfully!"
echo ""
echo "Ollama endpoint: $NGROK_URL"
echo ""

# Test the public endpoint
echo "Testing public endpoint..."
if curl -s ${NGROK_URL}/api/tags > /dev/null 2>&1; then
    echo "✓ Public endpoint is working!"
    echo ""
    echo "Test with:"
    echo "curl ${NGROK_URL}/api/generate -d '{\"model\":\"rayhan-assistant\",\"prompt\":\"Hello!\",\"stream\":false}'"
else
    echo "⚠ Public endpoint not responding yet (may need a moment to propagate)"
fi
echo ""

# Update Vercel environment variable if configured
if [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_PROJECT_ID" ] && [ -n "$VERCEL_ENV_ID" ]; then
    echo "Updating Vercel environment variable..."
    
    RESPONSE=$(curl -s -X PATCH \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"value\": \"$NGROK_URL\", \"target\": [\"production\", \"preview\", \"development\"]}" \
        "https://api.vercel.com/v10/projects/$VERCEL_PROJECT_ID/env/$VERCEL_ENV_ID")
    
    if echo "$RESPONSE" | grep -q "error"; then
        echo "✗ Failed to update Vercel env var"
        echo "$RESPONSE"
    else
        echo "✓ Vercel env var updated"
        
        # Trigger rebuild
        echo "Triggering Vercel rebuild..."
        git commit --allow-empty -m "Update OLLAMA_URL to current ngrok tunnel"
        git push
        echo "✓ Rebuild triggered"
    fi
else
    echo "Add this to Vercel environment variables:"
    echo "OLLAMA_URL=$NGROK_URL"
    echo ""
    echo "To enable auto-update, configure:"
    echo "export VERCEL_TOKEN=your_token"
    echo "export VERCEL_PROJECT_ID=your_project_id"
    echo "export VERCEL_ENV_ID=your_env_id"
fi
echo ""