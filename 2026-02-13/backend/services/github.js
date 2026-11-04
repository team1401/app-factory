const axios = require('axios');

async function searchMentions(query, githubToken = null) {
  const token = githubToken;
  
  if (!token) {
    console.log('No GitHub token provided, skipping GitHub search');
    return [];
  }

  const mentions = [];

  try {
    // Search issues and PRs
    const issuesResponse = await axios.get('https://api.github.com/search/issues', {
      params: {
        q: query,
        sort: 'created',
        order: 'desc',
        per_page: 20
      },
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Agent-Rep-Check/1.0'
      },
      timeout: 10000
    });

    if (issuesResponse.data.items) {
      issuesResponse.data.items.forEach(item => {
        mentions.push({
          source: 'github',
          type: item.pull_request ? 'pull_request' : 'issue',
          title: item.title,
          content: item.body || item.title,
          url: item.html_url,
          date: item.created_at,
          author: item.user?.login,
          repository: extractRepoFromUrl(item.html_url)
        });
      });
    }

    // Search commits (if username provided)
    if (query.length < 30 && !query.includes(' ')) {
      try {
        const commitsResponse = await axios.get('https://api.github.com/search/commits', {
          params: {
            q: `author:${query}`,
            sort: 'author-date',
            order: 'desc',
            per_page: 10
          },
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.cloak-preview+json',
            'User-Agent': 'Agent-Rep-Check/1.0'
          },
          timeout: 10000
        });

        if (commitsResponse.data.items) {
          commitsResponse.data.items.forEach(commit => {
            mentions.push({
              source: 'github',
              type: 'commit',
              title: commit.commit.message.split('\n')[0],
              content: commit.commit.message,
              url: commit.html_url,
              date: commit.commit.author.date,
              author: commit.author?.login || commit.commit.author.name,
              repository: commit.repository?.full_name
            });
          });
        }
      } catch (commitError) {
        console.error('GitHub commits search error:', commitError.message);
      }
    }

  } catch (error) {
    console.error('GitHub search error:', error.message);
    if (error.response?.status === 401) {
      throw new Error('Invalid GitHub token');
    }
    if (error.response?.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw error;
  }

  return mentions;
}

function extractRepoFromUrl(url) {
  const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
  return match ? match[1] : null;
}

module.exports = {
  searchMentions
};
