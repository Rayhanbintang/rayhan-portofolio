// GET /api/health. Reports which mode /api/chat will answer in. No network call:
// a Groq round trip on every page load would spend quota for nothing.
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    mode: process.env.GROQ_API_KEY ? 'ai-powered' : 'rule-based',
  });
}
