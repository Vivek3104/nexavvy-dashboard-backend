const NodeCache = require('node-cache');

// Create cache instance with 10 minute TTL
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function (data) {
      cache.set(key, data, duration);
      originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache by pattern
const clearCache = pattern => {
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCache,
};