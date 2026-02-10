# Vercel Serverless Functions

The chatbot backend is now deployed as Vercel serverless functions.

## Structure

```
api/
├── health.js   - Health check endpoint
└── chat.js     - Chatbot endpoint
```

## Endpoints

**Health Check:**
- URL: `https://your-site.vercel.app/api/health`
- Method: GET
- Response: `{ "status": "ok", "mode": "rule-based" }`

**Chat:**
- URL: `https://your-site.vercel.app/api/chat`
- Method: POST
- Body: `{ "message": "your question" }`
- Response: `{ "reply": "...", "mode": "rule-based" }`

## Benefits

✅ Same domain as frontend (no CORS issues)
✅ Auto-deploys with your site
✅ Always available (no cold starts)
✅ Free tier: 100k requests/month
✅ No separate backend to maintain

## Local Testing

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

Then visit `http://localhost:3000`

## Deployment

Just push to GitHub - Vercel auto-deploys everything including API functions.

```bash
git add .
git commit -m "Add serverless chatbot backend"
git push origin main
```

## Future: AI Integration

To add Ollama/AI mode later:
1. Keep these functions as fallback
2. Add external AI service (OpenAI, Anthropic)
3. Or deploy Ollama on separate VPS and call it from here
