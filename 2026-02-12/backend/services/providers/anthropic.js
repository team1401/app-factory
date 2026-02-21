const axios = require('axios');
const logger = require('../../utils/logger');

class AnthropicProvider {
  constructor(modelName = 'claude-3-5-sonnet-20241022') {
    this.modelName = modelName;
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    this.baseURL = 'https://api.anthropic.com/v1';
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
        `${this.baseURL}/messages`,
        {
          model: this.modelName,
          max_tokens: 500,
          temperature: 0.8,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ],
          stream: true
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      return await this.handleStream(response.data, onChunk);

    } catch (error) {
      logger.error('Anthropic API error:', error.response?.data || error.message);
      throw new Error(`Anthropic generation failed: ${error.message}`);
    }
  }

  /**
   * Handle SSE stream from Anthropic
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
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text;
                
                if (content) {
                  fullContent += content;
                  onChunk(content);
                }
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
}

module.exports = AnthropicProvider;
