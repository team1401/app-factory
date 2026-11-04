const crypto = require('crypto');

const SUPPORTED_AI_PROVIDERS = ['openai', 'anthropic', 'ollama'];

function header(req, name) {
  const value = req.headers[name];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

// Server-side keys are only used when the operator has set SERVER_KEYS_ACCESS_TOKEN
// and the caller presents the same value in the X-App-Token header.
function canUseServerKeys(req) {
  const expected = process.env.SERVER_KEYS_ACCESS_TOKEN;
  const provided = header(req, 'x-app-token');
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function resolveAiCredentials(req, useServerKeys) {
  let provider = header(req, 'x-ai-provider');
  let apiKey = header(req, 'x-ai-api-key');

  if (!provider || !apiKey) {
    if (header(req, 'x-openai-key')) {
      provider = 'openai';
      apiKey = header(req, 'x-openai-key');
    } else if (header(req, 'x-anthropic-key')) {
      provider = 'anthropic';
      apiKey = header(req, 'x-anthropic-key');
    }
  }

  provider = (provider || 'openai').toLowerCase();
  if (!SUPPORTED_AI_PROVIDERS.includes(provider)) {
    const error = new Error(`Unsupported AI provider. Use one of: ${SUPPORTED_AI_PROVIDERS.join(', ')}`);
    error.status = 400;
    throw error;
  }

  if (provider === 'ollama') {
    // Ollama runs on the operator's infrastructure, so treat it as a server resource.
    return useServerKeys ? { provider, apiKey: null, available: true } : { provider, apiKey: null, available: false };
  }

  if (!apiKey && useServerKeys) {
    apiKey = process.env[provider === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY'] || null;
  }

  return { provider, apiKey, available: Boolean(apiKey) };
}

function resolveCredentials(req) {
  const useServerKeys = canUseServerKeys(req);

  let githubToken = header(req, 'x-github-token');
  let braveApiKey = header(req, 'x-brave-key') || header(req, 'x-brave-api-key');

  if (useServerKeys) {
    githubToken = githubToken || process.env.GITHUB_TOKEN || null;
    braveApiKey = braveApiKey || process.env.BRAVE_API_KEY || process.env.BRAVE_SEARCH_API_KEY || null;
  }

  return {
    useServerKeys,
    githubToken,
    braveApiKey,
    ai: resolveAiCredentials(req, useServerKeys)
  };
}

module.exports = {
  SUPPORTED_AI_PROVIDERS,
  resolveCredentials
};
