const rateLimit = require('express-rate-limit');

// Rate limiting options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

// Apply rate limiting middleware to authentication endpoints
const applyRateLimit = (req, res, next) => {
  limiter(req, res, next);
};

module.exports = {
  applyRateLimit,
};
