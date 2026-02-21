const axios = require('axios');
const logger = require('../../utils/logger');

class OpenAIProvider {
  constructor(modelName = 'gpt-4-turbo-preview') {
    this.modelName = modelName;
    this.apiKey = process.env.OPENAI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    this.baseURL = 'https://api.openai.com/v1';
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
        `${this.baseURL}/chat/completions`,
        {
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.8,
          max_tokens: 500,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      return await this.handleStream(response.data, onChunk);

    } catch (error) {
      logger.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error(`OpenAI generation failed: ${error.message}`);
    }
  }

  /**
   * Handle SSE stream from OpenAI
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
            
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullContent += content;
                onChunk(content);
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

module.exports = OpenAIProvider;
