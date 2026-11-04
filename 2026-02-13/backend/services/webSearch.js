const axios = require('axios');

async function searchMentions(query, braveApiKey = null) {
  const apiKey = braveApiKey;
  
  if (!apiKey) {
    console.log('No Brave Search API key provided, returning empty results');
    return [];
  }

  try {
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      params: {
        q: query,
        count: 20,
        search_lang: 'en'
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey
      },
      timeout: 10000
    });

    const mentions = [];

    if (response.data.web?.results) {
      response.data.web.results.forEach(result => {
        mentions.push({
          source: 'web',
          type: 'article',
          title: result.title,
          content: result.description || result.title,
          url: result.url,
          date: result.published_date || new Date().toISOString(),
          author: extractDomain(result.url)
        });
      });
    }

    return mentions;
  } catch (error) {
    console.error('Brave Search error:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid Brave Search API key');
    }
    if (error.response?.status === 429) {
      throw new Error('Brave Search API rate limit exceeded');
    }
    
    // Return empty array on error rather than failing
    return [];
  }
}

function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

module.exports = {
  searchMentions
};
