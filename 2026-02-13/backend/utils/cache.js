const NodeCache = require('node-cache');

// Create cache instance with TTL from env or default to 1 hour
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 3600,
  checkperiod: 120,
  useClones: false
});

// Log cache stats periodically
setInterval(() => {
  const stats = cache.getStats();
  if (stats.keys > 0) {
    console.log(`Cache stats - Keys: ${stats.keys}, Hits: ${stats.hits}, Misses: ${stats.misses}`);
  }
}, 300000); // Every 5 minutes

module.exports = cache;
