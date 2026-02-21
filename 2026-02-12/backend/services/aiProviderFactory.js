const OpenAIProvider = require('./providers/openai');
const AnthropicProvider = require('./providers/anthropic');
const OllamaProvider = require('./providers/ollama');

class AIProviderFactory {
  /**
   * Get appropriate AI provider based on provider type
   */
  static getProvider(providerType, modelName) {
    switch (providerType.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(modelName);
      
      case 'anthropic':
        return new AnthropicProvider(modelName);
      
      case 'ollama':
        return new OllamaProvider(modelName);
      
      default:
        throw new Error(`Unsupported provider: ${providerType}`);
    }
  }

  /**
   * Validate provider configuration
   */
  static validateConfig(providerType) {
    switch (providerType.toLowerCase()) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      
      case 'ollama':
        return !!process.env.OLLAMA_BASE_URL;
      
      default:
        return false;
    }
  }
}

module.exports = AIProviderFactory;
