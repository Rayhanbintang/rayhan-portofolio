export default async function handler(req, res) {
  // Check if Ollama is available
  const ollamaAvailable = await checkOllama();
  
  res.status(200).json({ 
    status: 'ok', 
    mode: ollamaAvailable ? 'ai-powered' : 'rule-based'
  });
}

async function checkOllama() {
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
