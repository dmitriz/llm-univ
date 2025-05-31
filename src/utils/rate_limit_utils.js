const { RATE_LIMIT_TYPES } = require('../rate_limits');

/**
 * Rate Limit Utilities
 * 
 * This module provides utilities for handling rate limits
 * using constants imported from the rate_limits module.
 */
function calculateBackoffDelay(attempt = 0, baseDelay = 1000, maxDelay = 30000) {
  const exponential = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponential;
  return Math.min(exponential + jitter, maxDelay);
}

module.exports = {
  RATE_LIMIT_TYPES,
  calculateBackoffDelay
};

/**
 * Exponential backoff with jitter
 * @param {number} attempt - Retry attempt number (0-based)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @param {number} maxDelay - Maximum delay in ms (default: 30000)
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(attempt = 0, baseDelay = 1000, maxDelay = 30000) {
  const exponential = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponential;
  return Math.min(exponential + jitter, maxDelay);
}

module.exports = {
  RATE_LIMIT_TYPES,
  calculateBackoffDelay
};