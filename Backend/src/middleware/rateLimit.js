const rateLimit = require('express-rate-limit');

// Create a rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 5, // Limit each IP to 5 requests per windowMs (default from .env)
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  headers: true, // Include rate limit info in response headers
});

module.exports = apiRateLimiter;
