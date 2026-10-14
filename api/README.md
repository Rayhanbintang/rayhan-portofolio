# Vercel Serverless Functions

The chatbot backend runs as Vercel serverless functions on the same domain as the site.

| Endpoint | Method | Returns |
|---|---|---|
| `/api/health` | GET | `{ "status": "ok", "mode": "ai-powered" \| "rule-based" }` |
| `/api/chat` | POST `{ message, conversationHistory }` | `{ "reply": "...", "mode": "...", "model"?: "..." }` |

## How `/api/chat` answers

1. With `GROQ_API_KEY` set, it calls Groq (`GROQ_MODEL`, default `openai/gpt-oss-20b`).
2. On any Groq error, including HTTP 429 when the free-plan limit is hit, it answers from the scripted
   knowledge base in `getRuleBasedResponse`.

Groq meters quota per model. The same key serves csps-calc (`openai/gpt-oss-120b`) and Bundahara
(`qwen/qwen3.8-27b`), so this site uses a model of its own.

Input limits: message up to 1,000 characters, the last 10 history turns, user/assistant roles only.

## Environment (Vercel project settings)

| Variable | Required | Value |
|---|---|---|
| `GROQ_API_KEY` | yes, for live answers | the shared Groq key (source: `side-gig/finance-tracker/code/.env`) |
| `GROQ_MODEL` | no | override the model id |

## Keeping the facts current

`SYSTEM_PROMPT` and `getRuleBasedResponse` in `chat.js` carry the CV facts. Update both when the CV changes.

## Deployment

Push `main` from WSL (personal GitHub account). Vercel deploys the site and these functions.
