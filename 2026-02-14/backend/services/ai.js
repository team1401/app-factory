const axios = require('axios');
const logger = require('../utils/logger');

const SYSTEM_PROMPT = `You are an expert research paper analyst. Your task is to analyze research papers and provide clear, structured explanations.

Output ONLY valid JSON with the following structure:
{
  "tldr": "One sentence summary",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "methodology": "How the research was conducted",
  "implications": "Why this matters and real-world impact",
  "eli5": "Explain the core concept like I'm five years old",
  "relatedWork": ["Paper title 1", "Paper title 2", "Paper title 3"]
}

Be concise, clear, and accessible. No markdown, just pure JSON.`;

/**
 * Send paper to OpenAI for analysis
 */
async function analyzeWithOpenAI(paperText, apiKey, model = 'gpt-4o') {
  try {
    logger.info('Analyzing paper with OpenAI', { model, textLength: paperText.length });
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this research paper:\n\n${paperText}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    const content = response.data.choices[0].message.content.trim();
    logger.info('OpenAI analysis complete', { responseLength: content.length });
    
    return parseAIResponse(content);
    
  } catch (error) {
    logger.error('OpenAI API error', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key');
    }
    throw new Error(`OpenAI analysis failed: ${error.message}`);
  }
}

/**
 * Send paper to Anthropic for analysis
 */
async function analyzeWithAnthropic(paperText, apiKey, model = 'claude-3-5-sonnet-20241022') {
  try {
    logger.info('Analyzing paper with Anthropic', { model, textLength: paperText.length });
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          { 
            role: 'user', 
            content: `Analyze this research paper:\n\n${paperText}` 
          }
        ]
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    const content = response.data.content[0].text.trim();
    logger.info('Anthropic analysis complete', { responseLength: content.length });
    
    return parseAIResponse(content);
    
  } catch (error) {
    logger.error('Anthropic API error', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Anthropic API key');
    }
    throw new Error(`Anthropic analysis failed: ${error.message}`);
  }
}

/**
 * Parse AI response and validate JSON structure
 */
function parseAIResponse(content) {
  try {
    // Try to extract JSON if wrapped in markdown code blocks
    let jsonStr = content;
    const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate required fields
    const required = ['tldr', 'keyFindings', 'methodology', 'implications', 'eli5', 'relatedWork'];
    for (const field of required) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Ensure arrays are arrays
    if (!Array.isArray(parsed.keyFindings)) {
      parsed.keyFindings = [parsed.keyFindings];
    }
    if (!Array.isArray(parsed.relatedWork)) {
      parsed.relatedWork = [parsed.relatedWork];
    }
    
    return parsed;
    
  } catch (error) {
    logger.error('Failed to parse AI response', { error: error.message, content });
    throw new Error('AI returned invalid response format');
  }
}

/**
 * Main function to analyze paper with appropriate provider
 */
async function analyzePaper(paperText, provider, apiKey, model) {
  // Truncate paper text to reasonable length (most models have limits)
  const maxLength = 15000;
  const truncatedText = paperText.length > maxLength 
    ? paperText.substring(0, maxLength) + '\n\n[Paper truncated for analysis]'
    : paperText;
  
  if (provider === 'openai') {
    return analyzeWithOpenAI(truncatedText, apiKey, model);
  } else if (provider === 'anthropic') {
    return analyzeWithAnthropic(truncatedText, apiKey, model);
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

module.exports = {
  analyzePaper
};
