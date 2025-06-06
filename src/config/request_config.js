/**
 * Request configuration and timeout settings for different providers
 */

// Provider-specific timeout configurations (in milliseconds)
const DEFAULT_TIMEOUTS = {
  openai: 30000,        // 30 seconds - generally fast
  anthropic: 45000,     // 45 seconds - can be slower for long responses
  google: 35000,        // 35 seconds - Gemini API
  'gh-models': 40000,   // 40 seconds - GitHub Models via Azure
  huggingface: 60000,   // 60 seconds - free tier can be slow for model loading
  together: 35000,      // 35 seconds - usually fast
  perplexity: 30000,    // 30 seconds - optimized for speed
  deepseek: 40000,      // 40 seconds - Chinese provider, may have latency
  qwen: 40000,          // 40 seconds - Chinese provider
  siliconflow: 35000,   // 35 seconds - Chinese provider
  grok: 30000,          // 30 seconds - X.AI, optimized
  groq: 25000,          // 25 seconds - very fast inference
  openrouter: 35000,    // 35 seconds - proxy service
  ollama: 10000,        // 10 seconds - local, should be very fast
  default: 30000        // 30 seconds fallback
};

// Retry configuration for different error types
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,      // 1 second base delay
  maxDelay: 10000,      // 10 seconds max delay
  backoffMultiplier: 2, // Exponential backoff

  // HTTP status codes that should trigger retries
  retryableStatusCodes: [
    429, // Rate limited
    500, // Internal server error
    502, // Bad gateway
    503, // Service unavailable
    504, // Gateway timeout
    520, // Unknown error (Cloudflare)
    521, // Web server is down (Cloudflare)
    522, // Connection timed out (Cloudflare)
    524  // A timeout occurred (Cloudflare)
  ],

  // Network error codes that should trigger retries
  retryableNetworkErrors: [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN'
  ]
};

// Connection pooling configuration
const CONNECTION_CONFIG = {
  keepAlive: true,
  keepAliveMsecs: 30000,  // 30 seconds
  maxSockets: 50,         // Max concurrent connections per host
  maxFreeSockets: 10,     // Max idle connections per host
  timeout: 5000,          // Socket timeout
  freeSocketTimeout: 15000 // How long to keep idle sockets
};

/**
 * Get timeout for a specific provider
 * @param {string} provider - The provider name
 * @returns {number} Timeout in milliseconds
 */
const getProviderTimeout = (provider) => {
  return DEFAULT_TIMEOUTS[provider] || DEFAULT_TIMEOUTS.default;
};

/**
 * Calculate retry delay with exponential backoff and jitter
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @param {number} multiplier - Backoff multiplier
 * @returns {number} Delay in milliseconds
 */
const calculateRetryDelay = (attempt, baseDelay = RETRY_CONFIG.baseDelay, maxDelay = RETRY_CONFIG.maxDelay, multiplier = RETRY_CONFIG.backoffMultiplier) => {
  // Exponential backoff: baseDelay * (multiplier ^ attempt)
  const exponentialDelay = baseDelay * Math.pow(multiplier, attempt);

  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (±25% randomization) to prevent thundering herd
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  const finalDelay = cappedDelay + jitter;

  // Ensure we never exceed maxDelay even with jitter
  return Math.max(0, Math.round(Math.min(finalDelay, maxDelay)));
};

/**
 * Check if an error should trigger a retry
 * @param {Error} error - The error to check
 * @param {number} attempt - Current attempt number
 * @returns {boolean} Whether to retry
 */
const shouldRetry = (error, attempt) => {
  // Don't retry if we've exceeded max attempts
  if (attempt >= RETRY_CONFIG.maxRetries) {
    return false;
  }

  // Check for retryable HTTP status codes
  if (error.response?.status) {
    return RETRY_CONFIG.retryableStatusCodes.includes(error.response.status);
  }

  // Check for retryable network errors
  if (error.code) {
    return RETRY_CONFIG.retryableNetworkErrors.includes(error.code);
  }

  // Check for timeout errors
  if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
    return true;
  }

  return false;
};

/**
 * Get retry-after delay from response headers
 * @param {Object} headers - Response headers
 * @returns {number} Delay in milliseconds, or null if not specified
 */
const getRetryAfterDelay = (headers) => {
  const retryAfter = headers['retry-after'] || headers['Retry-After'];

  if (!retryAfter) {
    return null;
  }

  // Parse as seconds (most common) or HTTP date
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Try parsing as HTTP date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return null;
};

/**
 * Create axios configuration with timeouts and connection pooling
 * @param {string} provider - The provider name
 * @param {Object} options - Additional options
 * @returns {Object} Axios configuration
 */
const createAxiosConfig = (provider, options = {}) => {
  const config = {
    timeout: options.timeout || getProviderTimeout(provider),
    maxRedirects: 3,
    validateStatus: (status) => status < 500, // Don't throw on 4xx errors

    // Connection pooling (Node.js only)
    ...(typeof window === 'undefined' && {
      httpAgent: new (require('http').Agent)(CONNECTION_CONFIG),
      httpsAgent: new (require('https').Agent)(CONNECTION_CONFIG)
    })
  };

  return config;
};

module.exports = {
  DEFAULT_TIMEOUTS,
  RETRY_CONFIG,
  CONNECTION_CONFIG,
  getProviderTimeout,
  calculateRetryDelay,
  shouldRetry,
  getRetryAfterDelay,
  createAxiosConfig
};
