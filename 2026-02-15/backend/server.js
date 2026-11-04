require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3100;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

const MAX_PERSONAS = 30;
const MAX_CONTENT_LENGTH = 2000;
const MAX_PERSONA_FIELD_LENGTH = 200;
const MAX_PERSONA_TRAITS = 10;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function hasValidAccessToken(req) {
  const expected = process.env.SERVER_ACCESS_TOKEN;
  const provided = req.headers['x-access-token'];
  if (!expected || typeof provided !== 'string') return false;
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

// Helper to get AI client based on headers or env.
// Server keys are only used for callers presenting SERVER_ACCESS_TOKEN.
function getAIClient(req) {
  const provider = req.headers['x-ai-provider'] || 'openai';
  const apiKey = req.headers['x-ai-api-key'];

  if (provider !== 'openai' && provider !== 'anthropic') {
    throw new HttpError(400, 'Invalid AI provider');
  }

  let key = typeof apiKey === 'string' && apiKey.trim() ? apiKey.trim() : null;
  if (!key) {
    if (!hasValidAccessToken(req)) {
      throw new HttpError(401, 'An API key or valid access token is required');
    }
    key = provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;
    if (!key) throw new HttpError(503, 'Server API key not configured');
  }

  if (provider === 'anthropic') {
    return { type: 'anthropic', client: new Anthropic({ apiKey: key }) };
  }
  return { type: 'openai', client: new OpenAI({ apiKey: key }) };
}

function isShortString(value) {
  return typeof value === 'string' && value.length <= MAX_PERSONA_FIELD_LENGTH;
}

function isValidPersona(p) {
  return (
    p && typeof p === 'object' &&
    isShortString(p.name) &&
    isShortString(p.background) &&
    Array.isArray(p.traits) &&
    p.traits.length <= MAX_PERSONA_TRAITS &&
    p.traits.every(isShortString)
  );
}

// Persona templates for different audiences
const AUDIENCE_TEMPLATES = {
  'hacker-news': {
    name: 'Hacker News',
    traits: [
      'skeptical of marketing hype',
      'values technical depth',
      'dislikes clickbait',
      'appreciates novel approaches',
      'critical of AI hype',
      'prefers substance over style',
      'enjoys intellectual discussion',
      'dislikes oversimplification',
      'values open source',
      'skeptical of proprietary solutions'
    ],
    backgrounds: [
      'Senior Software Engineer at FAANG',
      'Startup CTO',
      'Independent OSS maintainer',
      'Security researcher',
      'Systems architect',
      'ML engineer',
      'DevOps specialist',
      'Compiler developer',
      'Database expert',
      'Performance engineer'
    ]
  },
  'product-hunt': {
    name: 'Product Hunt',
    traits: [
      'early adopter mindset',
      'loves innovative tools',
      'values clean design',
      'appreciates productivity hacks',
      'excited by AI applications',
      'shares discoveries eagerly',
      'entrepreneur or founder',
      'values time-saving solutions',
      'design-conscious',
      'community-oriented'
    ],
    backgrounds: [
      'Indie hacker building SaaS',
      'Product designer at startup',
      'Growth marketer',
      'Serial entrepreneur',
      'No-code builder',
      'Content creator',
      'UX researcher',
      'Developer advocate',
      'Community manager',
      'Angel investor'
    ]
  },
  'reddit-technology': {
    name: 'Reddit r/technology',
    traits: [
      'concerned about privacy',
      'skeptical of big tech',
      'values consumer rights',
      'interested in policy impact',
      'environmentally conscious',
      'dislikes corporate PR',
      'fact-checks claims',
      'values accessibility',
      'concerned about monopolies',
      'appreciates deep dives'
    ],
    backgrounds: [
      'Tech journalist',
      'IT administrator',
      'Privacy advocate',
      'Tech support specialist',
      'Gaming enthusiast',
      'Hardware reviewer',
      'Network engineer',
      'Cybersecurity analyst',
      'Tech educator',
      'Policy researcher'
    ]
  },
  'twitter-tech': {
    name: 'Twitter Tech',
    traits: [
      'follows AI trends closely',
      'interested in crypto/web3',
      'values hot takes',
      'enjoys rapid discourse',
      'excited by AGI potential',
      'contrarian viewpoints',
      'startup ecosystem insider',
      'values thought leadership',
      'shares breakthrough news',
      'debates fiercely'
    ],
    backgrounds: [
      'AI researcher',
      'Venture capitalist',
      'Tech influencer',
      'Blockchain developer',
      'Startup founder',
      'Product manager at tech co',
      'Tech podcaster',
      'Developer relations',
      'Research scientist',
      'Tech policy analyst'
    ]
  },
  'linkedin-business': {
    name: 'LinkedIn Business',
    traits: [
      'values ROI and metrics',
      'professional tone required',
      'interested in industry trends',
      'appreciates case studies',
      'values networking',
      'career-focused',
      'interested in leadership',
      'values credentials',
      'professional development',
      'B2B mindset'
    ],
    backgrounds: [
      'VP of Engineering',
      'Chief Product Officer',
      'Business consultant',
      'Sales director',
      'Marketing executive',
      'HR leader',
      'Enterprise architect',
      'Management consultant',
      'Innovation director',
      'Strategic advisor'
    ]
  },
  'general-public': {
    name: 'General Public',
    traits: [
      'varied tech literacy',
      'values practicality',
      'curious but cautious',
      'needs clear explanations',
      'concerned about cost',
      'values ease of use',
      'diverse interests',
      'word-of-mouth influenced',
      'brand aware',
      'value-conscious'
    ],
    backgrounds: [
      'Teacher',
      'Small business owner',
      'Student',
      'Retail worker',
      'Freelancer',
      'Healthcare professional',
      'Parent',
      'Retired professional',
      'Creative professional',
      'Service industry worker'
    ]
  }
};

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Generate personas endpoint
app.post('/api/generate-personas', async (req, res) => {
  try {
    const { audience } = req.body;
    
    if (!audience || !AUDIENCE_TEMPLATES[audience]) {
      return res.status(400).json({ error: 'Invalid audience type' });
    }

    const template = AUDIENCE_TEMPLATES[audience];
    const { type, client } = getAIClient(req);
    
    const prompt = `Generate 30 diverse personas for ${template.name} audience. Each persona should have:
- name: A realistic first name
- background: One of these backgrounds (distribute evenly): ${template.backgrounds.join(', ')}
- interests: 2-3 specific interests related to their background
- traits: 2-3 of these traits: ${template.traits.join(', ')}
- votingPattern: Either "critical", "balanced", or "enthusiastic"

Return ONLY a JSON array of 30 persona objects. No other text.`;

    let personas;
    
    if (type === 'anthropic') {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      try {
        personas = JSON.parse(response.content[0].text);
      } catch (parseErr) {
        console.error('Failed to parse Anthropic persona response:', response.content[0].text.substring(0, 200));
        throw new Error('AI returned invalid JSON for personas');
      }
    } else {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: prompt
        }],
        response_format: { type: 'json_object' },
        temperature: 0.9
      });
      try {
        const result = JSON.parse(response.choices[0].message.content);
        personas = result.personas || result;
      } catch (parseErr) {
        console.error('Failed to parse OpenAI persona response:', response.choices[0].message.content.substring(0, 200));
        throw new Error('AI returned invalid JSON for personas');
      }
    }

    res.json({ personas: Array.isArray(personas) ? personas : [personas] });
    
  } catch (error) {
    console.error('Error generating personas:', error);
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ 
      error: 'Failed to generate personas',
      details: error.message 
    });
  }
});

// Test content endpoint
app.post('/api/test-content', async (req, res) => {
  try {
    const { content, personas } = req.body;
    
    if (typeof content !== 'string' || !content.trim() || !Array.isArray(personas)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: `Content must be at most ${MAX_CONTENT_LENGTH} characters` });
    }
    if (personas.length === 0 || personas.length > MAX_PERSONAS) {
      return res.status(400).json({ error: `Between 1 and ${MAX_PERSONAS} personas are required` });
    }
    if (!personas.every(isValidPersona)) {
      return res.status(400).json({ error: 'Invalid persona format' });
    }

    const { type, client } = getAIClient(req);
    
    // Process personas in batches for efficiency
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < personas.length; i += batchSize) {
      const batch = personas.slice(i, i + batchSize);
      
      const prompt = `You are simulating multiple personas voting on content. For each persona below, respond with their vote.

Content to evaluate: "${content}"

Personas:
${batch.map((p, idx) => `${idx + 1}. ${p.name} - ${p.background} - Traits: ${p.traits.join(', ')}`).join('\n')}

For each persona, provide:
- wouldEngage: true/false (would they upvote/share?)
- interestLevel: 1-10
- reaction: One brief sentence (max 15 words) with their take

Return ONLY a JSON array of ${batch.length} vote objects in the same order. No other text.`;

      let batchResults;
      
      if (type === 'anthropic') {
        const response = await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });
        try {
          batchResults = JSON.parse(response.content[0].text);
        } catch (parseErr) {
          console.error('Failed to parse Anthropic vote response:', response.content[0].text.substring(0, 200));
          throw new Error('AI returned invalid JSON for votes');
        }
      } else {
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: prompt
          }],
          response_format: { type: 'json_object' },
          temperature: 0.7
        });
        try {
          const result = JSON.parse(response.choices[0].message.content);
          batchResults = result.votes || result;
        } catch (parseErr) {
          console.error('Failed to parse OpenAI vote response:', response.choices[0].message.content.substring(0, 200));
          throw new Error('AI returned invalid JSON for votes');
        }
      }
      
      results.push(...(Array.isArray(batchResults) ? batchResults : [batchResults]));
    }

    // Calculate virality score
    const engagementCount = results.filter(r => r.wouldEngage).length;
    const viralityScore = Math.round((engagementCount / results.length) * 100);
    
    // Get average interest
    const avgInterest = results.reduce((sum, r) => sum + (r.interestLevel || 0), 0) / results.length;
    
    // Get top reactions (most interesting comments)
    const topReactions = results
      .filter(r => r.reaction)
      .sort((a, b) => b.interestLevel - a.interestLevel)
      .slice(0, 8)
      .map((r, idx) => ({
        persona: personas[results.indexOf(r)]?.name || 'Anonymous',
        reaction: r.reaction
      }));

    // Generate improvement suggestions
    const suggestionPrompt = `Based on this feedback, suggest 3 brief improvements to increase virality:

Content: "${content}"
Virality Score: ${viralityScore}%
Top concerns: ${results.filter(r => !r.wouldEngage).map(r => r.reaction).slice(0, 5).join('; ')}

Return ONLY a JSON array of 3 suggestion strings. Each max 20 words.`;

    let suggestions;
    if (type === 'anthropic') {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: suggestionPrompt
        }]
      });
      try {
        suggestions = JSON.parse(response.content[0].text);
      } catch (parseErr) {
        console.error('Failed to parse suggestions response');
        suggestions = ['Unable to generate suggestions'];
      }
    } else {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: suggestionPrompt
        }],
        response_format: { type: 'json_object' },
        temperature: 0.8
      });
      try {
        const result = JSON.parse(response.choices[0].message.content);
        suggestions = result.suggestions || result;
      } catch (parseErr) {
        console.error('Failed to parse suggestions response');
        suggestions = ['Unable to generate suggestions'];
      }
    }

    res.json({
      viralityScore,
      avgInterest: Math.round(avgInterest * 10) / 10,
      distribution: {
        wouldEngage: engagementCount,
        wouldNotEngage: results.length - engagementCount
      },
      topReactions,
      suggestions: Array.isArray(suggestions) ? suggestions : [suggestions],
      votes: results
    });
    
  } catch (error) {
    console.error('Error testing content:', error);
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ 
      error: 'Failed to test content',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ViralCheck backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
