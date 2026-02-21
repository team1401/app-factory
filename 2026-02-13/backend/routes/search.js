const express = require('express');
const router = express.Router();
const githubService = require('../services/github');
const webSearchService = require('../services/webSearch');
const aiService = require('../services/ai');
const cache = require('../utils/cache');

router.post('/', async (req, res, next) => {
  try {
    const { name, username, sources = ['github', 'web'] } = req.body;

    if (!name && !username) {
      return res.status(400).json({ error: 'Name or username is required' });
    }

    // Extract BYOK credentials from headers
    // Support both single x-ai-provider/x-ai-api-key headers and individual provider keys
    let aiProvider = req.headers['x-ai-provider'];
    let aiApiKey = req.headers['x-ai-api-key'];
    
    // If individual keys provided, auto-detect provider
    if (!aiProvider || !aiApiKey) {
      if (req.headers['x-openai-key']) {
        aiProvider = 'openai';
        aiApiKey = req.headers['x-openai-key'];
      } else if (req.headers['x-anthropic-key']) {
        aiProvider = 'anthropic';
        aiApiKey = req.headers['x-anthropic-key'];
      }
    }

    let searchQuery = username || name;
    
    // Sanitize and limit input length
    searchQuery = searchQuery.trim().substring(0, 200);
    
    const cacheKey = `search:${searchQuery}:${sources.join(',')}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached results for:', searchQuery);
      return res.json(cached);
    }

    let allMentions = [];

    // Search GitHub if requested
    if (sources.includes('github')) {
      try {
        const githubMentions = await githubService.searchMentions(searchQuery, req.headers['x-github-token']);
        allMentions.push(...githubMentions);
      } catch (error) {
        console.error('GitHub search error:', error.message);
      }
    }

    // Search web if requested
    if (sources.includes('web')) {
      try {
        const webMentions = await webSearchService.searchMentions(searchQuery, req.headers['x-brave-key'] || req.headers['x-brave-api-key']);
        allMentions.push(...webMentions);
      } catch (error) {
        console.error('Web search error:', error.message);
      }
    }

    // Analyze mentions with AI
    const analyzedMentions = await Promise.all(
      allMentions.map(async (mention) => {
        try {
          const analysis = await aiService.analyzeSentiment(
            mention.content,
            aiProvider,
            aiApiKey
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
