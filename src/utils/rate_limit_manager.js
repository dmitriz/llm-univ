/**
 * Generic Rate Limit Manager
 * 
 * Reusable rate limiting system that can be configured for any service
 */
class RateLimitManager {
  /**
   * @param {Object} config - Rate limit configuration
   * @param {Object} config.limits - Service limits (e.g., { requests_per_minute: 100 })
   * @param {Array} [config.headers=[]] - Custom rate limit headers to parse
   */
  constructor(config) {
    this.config = config;
    this.usage = {
      minute: [],
      day: [],
      tokens: { minute: 0, day: 0 }
    };
  }

  /**
   * Record a request for rate limit tracking
   * @param {number} tokens - Number of tokens/units used
   */
  recordRequest(tokens = 0) {
    const now = Date.now();
    this.cleanOldEntries();
    
    this.usage.minute.push(now);
    this.usage.day.push(now);
    this.usage.tokens.minute += tokens;
    this.usage.tokens.day += tokens;
  }

  /**
   * Check if request would exceed limits
   * @param {number} tokens - Tokens/units for the request
   * @returns {Object} - { allowed: boolean, waitTime: number, reason: string }
   */
  checkRateLimit(tokens = 0) {
    this.cleanOldEntries();
    const { limits } = this.config;

    // Check requests per minute
    if (limits.requests_per_minute && this.usage.minute.length >= limits.requests_per_minute) {
      const oldest = Math.min(...this.usage.minute);
      const waitTime = 60000 - (Date.now() - oldest);
      return {
        allowed: false,
        waitTime: Math.max(0, waitTime),
        reason: `RPM limit exceeded (${this.usage.minute.length}/${limits.requests_per_minute})`
      };
    }

    // Check tokens per minute
    if (limits.tokens_per_minute && (this.usage.tokens.minute + tokens) > limits.tokens_per_minute) {
      return {
        allowed: false,
        waitTime: 60000,
        reason: `TPM limit would be exceeded (${this.usage.tokens.minute + tokens}/${limits.tokens_per_minute})`
      };
    }

    return { allowed: true, waitTime: 0, reason: 'Within limits' };
  }

  /**
   * Clean old entries outside time windows
   */
  cleanOldEntries() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    this.usage.minute = this.usage.minute.filter(t => t > oneMinuteAgo);
    this.usage.day = this.usage.day.filter(t => t > oneDayAgo);
    
    if (this.usage.minute.length === 0) this.usage.tokens.minute = 0;
    if (this.usage.day.length === 0) this.usage.tokens.day = 0;
  }

  /**
   * Parse rate limit headers from API responses
   * @param {Object} headers - Response headers
   * @returns {Object} Parsed rate limit info
   */
  parseRateLimitHeaders(headers) {
    const result = {};
    const headerConfig = this.config.headers || [];
    
    headerConfig.forEach(header => {
      const value = headers[header];
      if (value) {
        // Simple heuristic: numeric values are quantities, others are reset times
        result[header] = isNaN(value) ? value : parseInt(value);
      }
    });
    
    return result;
  }
}

module.exports = RateLimitManager;