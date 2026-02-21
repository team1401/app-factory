const axios = require('axios');
const logger = require('../../utils/logger');

class OllamaProvider {
  constructor(modelName = 'llama2') {
    this.modelName = modelName;
    this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  /**
   * Generate argument with streaming support
   */
  async generateArgument(topic, context, onChunk) {
    const systemPrompt = `You are a skilled debater participating in a formal debate. ${context}

Present a well-structured, persuasive argument that:
- Addresses the topic directly
- Uses logical reasoning and evidence
- Anticipates counterarguments
- Is concise but impactful (aim for 150-250 words)
- Maintains a professional, respectful tone`;

    const userPrompt = `Debate topic: "${topic}"

Present your argument:`;

    try {
      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.modelName,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: true,
          options: {
            temperature: 0.8,
            num_predict: 500
          }
        },
        {
          responseType: 'stream'
        }
      );

      return await this.handleStream(response.data, onChunk);

    } catch (error) {
      logger.error('Ollama API error:', error.response?.data || error.message);
      throw new Error(`Ollama generation failed: ${error.message}`);
    }
  }

  /**
   * Handle stream from Ollama
   */
  async handleStream(stream, onChunk) {
    return new Promise((resolve, reject) => {
      let fullContent = '';
      let buffer = '';

      stream.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              
              if (parsed.response) {
                fullContent += parsed.response;
                onChunk(parsed.response);
              }

              if (parsed.done) {
                // Stream complete
              }
            } catch (e) {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      });

      stream.on('end', () => {
        resolve(fullContent);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Check if Ollama is available
   */
  async checkHealth() {
    try {
      await axios.get(`${this.baseURL}/api/tags`);
      return true;
    } catch (error) {
      logger.warn('Ollama not available:', error.message);
      return false;
    }
  }
}

module.exports = OllamaProvider;
