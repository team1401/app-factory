const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const githubService = require('../services/github');
const webSearchService = require('../services/webSearch');
const aiService = require('../services/ai');
const cache = require('../utils/cache');
const { resolveCredentials } = require('../utils/credentials');

const VALID_SOURCES = ['github', 'web'];
const MAX_ANALYZED_MENTIONS = parseInt(process.env.MAX_ANALYZED_MENTIONS) || 20;

router.post('/', async (req, res, next) => {
  try {
    const { name, username, sources = ['github', 'web'] } = req.body;

    if (!name && !username) {
      return res.status(400).json({ error: 'Name or username is required' });
    }

    if (!Array.isArray(sources) || !sources.every((source) => VALID_SOURCES.includes(source))) {
      return res.status(400).json({ error: `sources must be an array of: ${VALID_SOURCES.join(', ')}` });
    }

    const credentials = resolveCredentials(req);
    const canSearchGithub = sources.includes('github') && Boolean(credentials.githubToken);
    const canSearchWeb = sources.includes('web') && Boolean(credentials.braveApiKey);

    if (!credentials.ai.available) {
      return res.status(401).json({
        error: 'Provide your own AI credentials (X-AI-Provider/X-AI-API-Key, X-OpenAI-Key or X-Anthropic-Key) or a valid X-App-Token'
      });
    }

    if (!canSearchGithub && !canSearchWeb) {
      return res.status(401).json({
        error: 'Provide your own search credentials (X-GitHub-Token or X-Brave-Key) or a valid X-App-Token'
      });
    }

    let searchQuery = username || name;
    
    // Sanitize and limit input length
    searchQuery = searchQuery.trim().substring(0, 200);
    
    const searchedSources = [canSearchGithub && 'github', canSearchWeb && 'web'].filter(Boolean);
    // GitHub results depend on what the token can see, so scope cached results to it.
    const githubScope = canSearchGithub
      ? crypto.createHash('sha256').update(credentials.githubToken).digest('hex')
      : 'none';
    const cacheKey = `search:${searchQuery}:${searchedSources.join(',')}:${githubScope}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached results for:', searchQuery);
      return res.json(cached);
    }

    let allMentions = [];

    // Search GitHub if requested
    if (canSearchGithub) {
      try {
        const githubMentions = await githubService.searchMentions(searchQuery, credentials.githubToken);
        allMentions.push(...githubMentions);
      } catch (error) {
        console.error('GitHub search error:', error.message);
      }
    }

    // Search web if requested
    if (canSearchWeb) {
      try {
        const webMentions = await webSearchService.searchMentions(searchQuery, credentials.braveApiKey);
        allMentions.push(...webMentions);
      } catch (error) {
        console.error('Web search error:', error.message);
      }
    }

    allMentions = interleaveByKind(allMentions).slice(0, MAX_ANALYZED_MENTIONS);

    // Analyze mentions with AI
    const analyzedMentions = await Promise.all(
      allMentions.map(async (mention) => {
        try {
          const analysis = await aiService.analyzeSentiment(
            mention.content,
            credentials.ai.provider,
            credentials.ai.apiKey,
            { allowOllamaFallback: credentials.useServerKeys }
          );
          return {
            ...mention,
            sentiment: analysis.sentiment,
            isHostile: analysis.isHostile,
            claims: analysis.claims,
            summary: analysis.summary
          };
        } catch (error) {
          console.error('AI analysis error:', error.message);
          return {
            ...mention,
            sentiment: 'unknown',
            isHostile: false,
            claims: [],
            summary: 'Analysis unavailable'
          };
        }
      })
    );

    // Calculate risk score (0-100)
    const riskScore = calculateRiskScore(analyzedMentions);

    // Build timeline
    const timeline = analyzedMentions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(m => ({
        date: m.date,
        source: m.source,
        sentiment: m.sentiment,
        title: m.title,
        url: m.url
      }));

    const result = {
      mentions: analyzedMentions,
      riskScore,
      timeline,
      totalMentions: analyzedMentions.length,
      searchQuery,
      timestamp: new Date().toISOString()
    };

    // Cache results
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Round-robin across source/type so the analysis cap keeps a mix of issues, commits and web results.
function interleaveByKind(mentions) {
  const groups = new Map();
  for (const mention of mentions) {
    const kind = `${mention.source}:${mention.type}`;
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind).push(mention);
  }

  const queues = [...groups.values()];
  const result = [];
  for (let i = 0; result.length < mentions.length; i++) {
    for (const queue of queues) {
      if (i < queue.length) result.push(queue[i]);
    }
  }
  return result;
}

function calculateRiskScore(mentions) {
  if (mentions.length === 0) return 0;

  const sentimentWeights = {
    positive: -10,
    neutral: 0,
    negative: 30,
    hostile: 60
  };

  let totalScore = 0;
  mentions.forEach(mention => {
    const weight = sentimentWeights[mention.sentiment] || 0;
    totalScore += weight;
    if (mention.isHostile) totalScore += 20; // Extra penalty for hostile content
  });

  // Normalize to 0-100 range
  const avgScore = totalScore / mentions.length;
  const normalized = Math.max(0, Math.min(100, avgScore));

  return Math.round(normalized);
}

module.exports = router;
