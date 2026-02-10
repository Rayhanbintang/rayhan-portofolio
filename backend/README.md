# Portfolio Chatbot Backend

Hybrid chatbot with rule-based fallback and AI-powered mode (Ollama).

## Features

- ✅ Rule-based responses (always available)
- 🤖 AI-powered mode with Ollama (when available)
- 🔄 Automatic fallback if AI is down
- 📊 Status indicator (rule-based vs AI-powered)

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Run Backend

```bash
npm start
```

Server runs on `http://localhost:3000`

### 3. Test Endpoints

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Chat:**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your skills?"}'
```

## Environment Variables

Create `.env` file:

```env
PORT=3000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

## API Endpoints

### GET /health
Returns backend status

**Response:**
```json
{
  "status": "ok",
  "mode": "rule-based"
}
```

### POST /chat
Send message to chatbot

**Request:**
```json
{
  "message": "What services do you offer?"
}
```

**Response:**
```json
{
  "reply": "Rayhan offers...",
  "mode": "rule-based"
}
```

When AI is available:
```json
{
  "reply": "...",
  "mode": "ai-powered",
  "model": "llama3"
}
```

## Rule-Based Topics

The bot can answer questions about:
- Skills & expertise
- AWS services
- Kubernetes/Docker
- Terraform/IaC
- Services offered
- Pricing
- Availability
- Contact information
- Projects/portfolio
- Experience

## Future: AI-Powered Mode

When Ollama is running, the bot will automatically switch to AI mode.

### Setup Ollama (Optional)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3

# Run Ollama
ollama serve
```

The backend will detect Ollama and use it automatically.

## Deployment Options

### Option 1: Local with Cloudflare Tunnel (FREE)

```bash
# Install cloudflared
# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

### Option 2: Railway.app (FREE tier)

1. Push to GitHub
2. Connect Railway to repo
3. Deploy `/backend` directory

### Option 3: VPS (Self-hosted)

```bash
# On your server
git clone <repo>
cd backend
npm install
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name chatbot
pm2 save
```

## Development

```bash
npm run dev  # Auto-reload with nodemon
```

## Testing

Test different queries:
- "What are your skills?"
- "Tell me about AWS"
- "What services do you offer?"
- "How much do you charge?"
- "Are you available?"
- "How can I contact you?"
