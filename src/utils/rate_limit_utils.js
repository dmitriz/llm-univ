/**
 * Rate Limit Utilities
 */
const RATE_LIMIT_TYPES = {
  RPM: 'requests_per_minute',
  TPM: 'tokens_per_minute', 
  RPD: 'requests_per_day',
  TPD: 'tokens_per_day',
  ASH: 'audio_seconds_per_hour',
  ASD: 'audio_seconds_per_day',
  IPM: 'images_per_minute',
  VPM: 'videos_per_minute',
  VPD: 'videos_per_day'
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