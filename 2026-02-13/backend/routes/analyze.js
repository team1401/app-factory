const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');
const axios = require('axios');

router.post('/', async (req, res, next) => {
  try {
    const { url, content } = req.body;

    if (!url && !content) {
      return res.status(400).json({ error: 'URL or content is required' });
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
      aiProvider,
      aiApiKey
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
