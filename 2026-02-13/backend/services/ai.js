const axios = require('axios');

const AI_PROVIDERS = {
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-haiku-20241022',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    })
  },
  ollama: {
    endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: 'llama3.2',
    headers: () => ({
      'Content-Type': 'application/json'
    })
  }
};

// Callers resolve credentials (see utils/credentials.js); this service never reads
// keys from the environment so server keys cannot be spent implicitly.
async function analyzeSentiment(text, provider = 'openai', apiKey = null, { allowOllamaFallback = false } = {}) {
  const selectedProvider = provider?.toLowerCase() || 'openai';
  if (!AI_PROVIDERS[selectedProvider]) {
    throw new Error(`Unsupported AI provider: ${selectedProvider}`);
  }
  if (selectedProvider !== 'ollama' && !apiKey) {
    throw new Error(`No API key provided for ${selectedProvider}`);
  }

  const prompt = `Analyze the following text for sentiment about a person or entity. Determine:
1. Overall sentiment: positive, neutral, negative, or hostile
2. Whether this is a "hit piece" or potentially damaging content (isHostile: true/false)
3. Key claims or accusations made (if any)
4. A brief summary

Text to analyze:
${text}

Respond in JSON format:
{
  "sentiment": "positive|neutral|negative|hostile",
  "isHostile": true|false,
  "claims": ["claim1", "claim2"],
  "summary": "brief summary"
}`;

  try {
    if (selectedProvider === 'openai') {
      return await analyzeWithOpenAI(prompt, apiKey);
    } else if (selectedProvider === 'anthropic') {
      return await analyzeWithAnthropic(prompt, apiKey);
    } else {
      return await analyzeWithOllama(prompt);
    }
  } catch (error) {
    console.error(`AI analysis failed with ${selectedProvider}:`, error.message);
    
    // Try fallback to Ollama if primary provider fails
    if (selectedProvider !== 'ollama' && allowOllamaFallback) {
      try {
        console.log('Falling back to Ollama...');
        return await analyzeWithOllama(prompt);
      } catch (ollamaError) {
        console.error('Ollama fallback failed:', ollamaError.message);
      }
    }
    
    // Return default analysis if all providers fail
    return {
      sentiment: 'neutral',
      isHostile: false,
      claims: [],
      summary: 'Analysis unavailable - AI provider error'
    };
  }
}

async function analyzeWithOpenAI(prompt, apiKey) {
  const config = AI_PROVIDERS.openai;
  
  const response = await axios.post(config.endpoint, {
    model: config.model,
    messages: [
      { role: 'system', content: 'You are a sentiment analysis expert. Always respond with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  }, {
    headers: config.headers(apiKey),
    timeout: 30000
  });

  const content = response.data.choices[0].message.content;
  return JSON.parse(content);
}

async function analyzeWithAnthropic(prompt, apiKey) {
  const config = AI_PROVIDERS.anthropic;
  
  const response = await axios.post(config.endpoint, {
    model: config.model,
    max_tokens: 1024,
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: 0.3
  }, {
    headers: config.headers(apiKey),
    timeout: 30000
  });

  const content = response.data.content[0].text;
  
  // Extract JSON from response (Claude might wrap it in markdown)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return JSON.parse(content);
}

async function analyzeWithOllama(prompt) {
  const config = AI_PROVIDERS.ollama;
  
  const response = await axios.post(`${config.endpoint}/api/generate`, {
    model: config.model,
    prompt: prompt,
    stream: false,
    format: 'json'
  }, {
    headers: config.headers(),
    timeout: 60000
  });

  return JSON.parse(response.data.response);
}

module.exports = {
  analyzeSentiment
};
