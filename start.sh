#!/bin/bash

# Source Vercel configuration
# Copy vercel.config.example to vercel.config and fill in your tokens
if [ -f "$(dirname "$0")/vercel.config" ]; then
    source "$(dirname "$0")/vercel.config"
fi

echo "Starting Ollama and ngrok..."

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
else
    echo "Ollama already running"
fi

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "Starting ngrok..."
    ngrok http 11434 --host-header=localhost --log=stdout > ngrok.log 2>&1 &
    sleep 3
else
    echo "ngrok already running"
fi

# Wait for ngrok to establish tunnel
sleep 2

# Get ngrok public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app')

if [ -z "$NGROK_URL" ]; then
    echo "Failed to get ngrok URL. Check if ngrok is running properly."
    exit 1
fi

echo ""
echo "✓ Services started successfully!"
echo ""
echo "Ollama endpoint: $NGROK_URL"
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
        
        # Trigger rebuild by creating empty commit
        echo "Triggering Vercel rebuild..."
        git commit --allow-empty -m "Update OLLAMA_URL to $NGROK_URL"
        git push
        echo "✓ Rebuild triggered"
    fi
else
    echo "Add this to Vercel environment variables:"
    echo "OLLAMA_URL=$NGROK_URL"
    echo ""
    echo "To enable auto-update, set these environment variables:"
    echo "export VERCEL_TOKEN=your_token"
    echo "export VERCEL_PROJECT_ID=your_project_id"
    echo "export VERCEL_ENV_ID=your_env_id"
fi
echo ""
