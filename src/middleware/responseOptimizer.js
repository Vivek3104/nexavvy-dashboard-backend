// Response optimization middleware
const responseOptimizer = (req, res, next) => {
  // Set response headers for better performance
  res.set({
    'X-Powered-By': false, // Remove Express signature
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });

  // Add response time header
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);
  });

  next();
};

// Quick response helper
const quickResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  responseOptimizer,
  quickResponse,
};