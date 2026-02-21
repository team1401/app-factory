const axios = require('axios');

/**
 * Detect which AI provider to use based on environment variables
 * @returns {string} 'openai' | 'anthropic' | null
 */
function detectProvider() {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

/**
 * Analyze vulnerabilities using OpenAI
 * @param {Array} vulnerabilities
 * @param {Array} dependencies
 * @returns {object} AI analysis
 */
async function analyzeWithOpenAI(vulnerabilities, dependencies) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL || 'gpt-4o';

  const prompt = buildAnalysisPrompt(vulnerabilities, dependencies);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a security expert analyzing software vulnerabilities. Provide clear, actionable explanations in plain English.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content;
    return parseAnalysisResponse(content);
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    throw new Error('AI analysis failed');
  }
}

/**
 * Analyze vulnerabilities using Anthropic Claude
 * @param {Array} vulnerabilities
 * @param {Array} dependencies
 * @returns {object} AI analysis
 */
async function analyzeWithAnthropic(vulnerabilities, dependencies) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.AI_MODEL || 'claude-3-5-sonnet-20241022';

  const prompt = buildAnalysisPrompt(vulnerabilities, dependencies);

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: 'You are a security expert analyzing software vulnerabilities. Provide clear, actionable explanations in plain English.'
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    const content = response.data.content[0].text;
    return parseAnalysisResponse(content);
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    throw new Error('AI analysis failed');
  }
}

/**
 * Build the analysis prompt
 * @param {Array} vulnerabilities
 * @param {Array} dependencies
 * @returns {string} prompt
 */
function buildAnalysisPrompt(vulnerabilities, dependencies) {
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'CRITICAL');
  const highVulns = vulnerabilities.filter(v => v.severity === 'HIGH');

  let prompt = `Analyze these ${vulnerabilities.length} vulnerabilities found in a project:\n\n`;

  // Include top 5 most severe vulnerabilities
  const topVulns = [...criticalVulns, ...highVulns].slice(0, 5);
  
  topVulns.forEach((vuln, idx) => {
    prompt += `${idx + 1}. ${vuln.id} - ${vuln.package} (${vuln.severity})\n`;
    prompt += `   ${vuln.summary}\n\n`;
  });

  prompt += `\nProvide:\n`;
  prompt += `1. SUMMARY: A 2-3 sentence overview of the security posture\n`;
  prompt += `2. TOP_RISKS: The 3 most critical issues to fix first\n`;
  prompt += `3. RECOMMENDATIONS: Specific actionable steps to remediate\n\n`;
  prompt += `Format your response as:\n`;
  prompt += `SUMMARY: [your summary]\n`;
  prompt += `TOP_RISKS:\n- [risk 1]\n- [risk 2]\n- [risk 3]\n`;
  prompt += `RECOMMENDATIONS:\n- [recommendation 1]\n- [recommendation 2]\n- [recommendation 3]`;

  return prompt;
}

/**
 * Parse AI response into structured format
 * @param {string} content
 * @returns {object} parsed analysis
 */
function parseAnalysisResponse(content) {
  const lines = content.split('\n');
  const result = {
    summary: '',
    topRisks: [],
    recommendations: []
  };

  let currentSection = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('SUMMARY:')) {
      result.summary = trimmed.replace('SUMMARY:', '').trim();
      currentSection = 'summary';
    } else if (trimmed.startsWith('TOP_RISKS:')) {
      currentSection = 'topRisks';
    } else if (trimmed.startsWith('RECOMMENDATIONS:')) {
      currentSection = 'recommendations';
    } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      const text = trimmed.replace(/^[-•]\s*/, '').trim();
      if (text && currentSection === 'topRisks') {
        result.topRisks.push(text);
      } else if (text && currentSection === 'recommendations') {
        result.recommendations.push(text);
      }
    } else if (currentSection === 'summary' && trimmed) {
      result.summary += ' ' + trimmed;
    }
  }

  return result;
}

/**
 * Analyze vulnerabilities using available AI provider
 * @param {Array} vulnerabilities
 * @param {Array} dependencies
 * @returns {object} AI analysis
 */
async function analyzeVulnerabilities(vulnerabilities, dependencies) {
  const provider = detectProvider();

  if (!provider) {
    console.warn('No AI provider configured');
    return {
      summary: 'AI analysis not available - please configure OPENAI_API_KEY or ANTHROPIC_API_KEY',
      topRisks: [],
      recommendations: []
    };
  }

  if (provider === 'openai') {
    return await analyzeWithOpenAI(vulnerabilities, dependencies);
  } else {
    return await analyzeWithAnthropic(vulnerabilities, dependencies);
  }
}

module.exports = {
  analyzeVulnerabilities,
  detectProvider
};
