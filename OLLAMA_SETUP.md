# AI-Powered Chatbot Setup

The chatbot automatically switches between AI-powered (Ollama) and rule-based modes.

## How It Works

1. **Vercel checks** if Ollama is available at `OLLAMA_URL`
2. **If available:** Uses AI-powered responses (Ollama)
3. **If not:** Falls back to rule-based responses

## Setup Ollama on Your PC

### 1. Install Ollama

```bash
# Linux/WSL
curl -fsSL https://ollama.com/install.sh | sh

# Or download from https://ollama.com
```

### 2. Pull a Model

```bash
ollama pull llama3
# or
ollama pull mistral
```

### 3. Run Ollama

```bash
ollama serve
```

Ollama runs on `http://localhost:11434`

## Expose Ollama to Vercel

Vercel needs to reach your local Ollama. Use Cloudflare Tunnel:

### 1. Create Tunnel for Ollama

```bash
cloudflared tunnel --url http://localhost:11434
```

You'll get a URL like: `https://random-name.trycloudflare.com`

### 2. Set Environment Variable in Vercel

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - **Name:** `OLLAMA_URL`
   - **Value:** `https://your-tunnel-url.trycloudflare.com`
4. Redeploy

### 3. Test

Visit your site and chat. Status should show:
- 🟢 **AI-powered mode** (when PC is on with tunnel)
- 🟡 **Rule-based mode** (when PC is off)

## Permanent Setup (Optional)

For a permanent tunnel URL that doesn't change:

```bash
# Login to Cloudflare
cloudflared tunnel login

# Create named tunnel
cloudflared tunnel create ollama-tunnel

# Configure tunnel
cloudflared tunnel route dns ollama-tunnel ollama.yourdomain.com

# Run tunnel
cloudflared tunnel run ollama-tunnel
```

Then set `OLLAMA_URL=https://ollama.yourdomain.com` in Vercel.

## Alternative: Cloud Ollama

Deploy Ollama on a VPS for 24/7 availability:

1. Rent VPS with GPU (e.g., Vast.ai, RunPod)
2. Install Ollama
3. Expose with reverse proxy (nginx)
4. Set `OLLAMA_URL` to VPS address

## Cost Comparison

| Option | Cost | Uptime | Speed |
|--------|------|--------|-------|
| Local PC + Tunnel | FREE | When PC on | Fast |
| Cloud VPS | $10-50/month | 24/7 | Fast |
| Rule-based only | FREE | 24/7 | Instant |

## Troubleshooting

**Chatbot stuck in rule-based mode:**
- Check if Ollama is running: `curl http://localhost:11434/api/tags`
- Check if tunnel is active
- Verify `OLLAMA_URL` in Vercel environment variables
- Check Vercel logs for errors

**Slow responses:**
- Normal for first request (model loading)
- Subsequent requests should be faster
- Consider using smaller model (mistral vs llama3)
