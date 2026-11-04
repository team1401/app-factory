const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');
const axios = require('axios');
const { resolveCredentials } = require('../utils/credentials');

router.post('/', async (req, res, next) => {
  try {
    const { url, content } = req.body;

    if (!url && !content) {
      return res.status(400).json({ error: 'URL or content is required' });
    }

    const { ai, useServerKeys } = resolveCredentials(req);
    if (!ai.available) {
      return res.status(401).json({
        error: 'Provide your own AI credentials (X-AI-Provider/X-AI-API-Key, X-OpenAI-Key or X-Anthropic-Key) or a valid X-App-Token'
      });
    }

    let textToAnalyze = content;

    // Fetch content from URL if provided
    if (url && !content) {
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Agent-Rep-Check/1.0'
          }
        });
        
        // Extract text from HTML (basic extraction)
        textToAnalyze = response.data
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        // Limit to first 10000 characters to avoid token limits
        textToAnalyze = textToAnalyze.substring(0, 10000);
      } catch (error) {
        return res.status(400).json({ 
          error: 'Failed to fetch content from URL',
          details: error.message 
        });
      }
    }

    if (!textToAnalyze || textToAnalyze.length < 10) {
      return res.status(400).json({ error: 'Content too short or empty' });
    }

    // Analyze with AI
    const analysis = await aiService.analyzeSentiment(
      textToAnalyze,
      ai.provider,
      ai.apiKey,
      { allowOllamaFallback: useServerKeys }
    );

    res.json({
      ...analysis,
      analyzedAt: new Date().toISOString(),
      sourceUrl: url || null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
