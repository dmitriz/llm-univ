
/**
 * Universal Rate Limit Management Module
 * 
 * This module provides rate limit information and management for all supported LLM providers.
 * It handles different rate limit types (RPM, TPM, RPD, TPD, etc.) and provides utilities
 * for rate limit enforcement, monitoring, and backoff strategies.
 * 
 * Rate limit data is based on official provider documentation (as of May 2025):
 * - OpenAI: https://platform.openai.com/docs/guides/rate-limits
 * - Anthropic: https://docs.anthropic.com/en/api/rate-limits  
 * - Google Gemini: https://ai.google.dev/gemini-api/docs/quota
 * - Groq: https://console.groq.com/docs/rate-limits
 * - Together AI: https://docs.together.ai/docs/rate-limits
 * - OpenRouter: https://openrouter.ai/docs/limits
 * - GitHub Models: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
 * - Hugging Face: https://huggingface.co/docs/api-inference/en/rate-limits
 */

/**
 * Rate limit types enum
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
 * Provider rate limit configurations
 * Each provider has different tiers and limits based on usage/payment
 */
const PROVIDER_RATE_LIMITS = {
  // OpenAI rate limits (based on official documentation as of May 2024)
  // https://help.openai.com/en/articles/7127986-what-are-the-gpt-4-rate-limits
  openai: {
    // Note: "free" tier is not an official rate limit tier, but represents the $100 trial credit
    free_trial: {
      [RATE_LIMIT_TYPES.RPM]: 3,
      [RATE_LIMIT_TYPES.TPM]: 10000,
      [RATE_LIMIT_TYPES.RPD]: 200,
      notes: "$100 trial credit, not a distinct rate-limit tier"
    },
    tier1: {
      [RATE_LIMIT_TYPES.RPM]: 500,
      [RATE_LIMIT_TYPES.TPM]: 30000,
      notes: "$5 paid"
    },
    tier2: {
      [RATE_LIMIT_TYPES.RPM]: 3500,
      [RATE_LIMIT_TYPES.TPM]: 180000,
      notes: "$50 paid and 7+ days since first successful payment"
    },
    tier3: {
      [RATE_LIMIT_TYPES.RPM]: 5000,
      [RATE_LIMIT_TYPES.TPM]: 300000,
      notes: "$100 paid and 7+ days since first successful payment"
    },
    tier4: {
      [RATE_LIMIT_TYPES.RPM]: 7000,
      [RATE_LIMIT_TYPES.TPM]: 600000,
      notes: "$250 paid and 14+ days since first successful payment"
    },
    tier5: {
      [RATE_LIMIT_TYPES.RPM]: 10000,
      [RATE_LIMIT_TYPES.TPM]: {
        "gpt-4o": 12000000,
        "gpt-4-turbo": 2000000,
        "gpt-4": 300000
      },
      notes: "$1,000 paid and 30+ days since first successful payment"
    },
    documentation: 'https://help.openai.com/en/articles/7127986-what-are-the-gpt-4-rate-limits',
    headers: ['x-ratelimit-limit-requests', 'x-ratelimit-remaining-requests', 'x-ratelimit-reset-requests']
  },

  // Anthropic rate limits (based on official documentation as of May 2024)
  // https://docs.anthropic.com/en/api/rate-limits
  anthropic: {
    claude3: {
      [RATE_LIMIT_TYPES.RPM]: 5,
      [RATE_LIMIT_TYPES.TPM]: {
        "claude-3-opus": 10000,
        "claude-3-sonnet": 20000,
        "claude-3-haiku": 25000,
        "claude-3.5-sonnet": 20000
      },
      [RATE_LIMIT_TYPES.TPD]: 300000,
      notes: "Limits apply to all Claude 3 models with slight TPM variation by model"
    },
    enterprise: {
      [RATE_LIMIT_TYPES.RPM]: 50,
      [RATE_LIMIT_TYPES.TPM]: 100000,
      [RATE_LIMIT_TYPES.TPD]: 3000000,
      notes: "Custom enterprise tier with higher limits"
    },
    documentation: 'https://docs.anthropic.com/en/api/rate-limits',
    headers: ['anthropic-ratelimit-requests-remaining', 'anthropic-ratelimit-tokens-remaining']
  },

  // Google Gemini rate limits (estimated - official detailed limits not publicly released)
  google: {
    preview: {
      [RATE_LIMIT_TYPES.RPM]: 15,
      [RATE_LIMIT_TYPES.TPM]: 250000,
      [RATE_LIMIT_TYPES.RPD]: 1500,
      notes: "Preview estimates - detailed rate limits not publicly released"
    },
    tier1: {
      [RATE_LIMIT_TYPES.RPM]: 2000,
      [RATE_LIMIT_TYPES.TPM]: 4000000,
      [RATE_LIMIT_TYPES.RPD]: null, // No daily limit specified
      notes: "Estimated values - refer to official documentation for confirmation"
    },
    tier2: {
      [RATE_LIMIT_TYPES.RPM]: 10000,
      [RATE_LIMIT_TYPES.TPM]: 4000000,
      [RATE_LIMIT_TYPES.RPD]: null,
      notes: "Estimated values - refer to official documentation for confirmation"
    },
    documentation: 'https://ai.google.dev/gemini-api/docs/quota',
    headers: ['x-goog-quota-user', 'x-goog-api-quota-user']
  },

  // Groq rate limits (from official docs)
  groq: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 30,
      [RATE_LIMIT_TYPES.TPM]: 6000,
      [RATE_LIMIT_TYPES.RPD]: 14400,
      [RATE_LIMIT_TYPES.ASH]: 3600 // 1 hour of audio per hour
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: 6000,
      [RATE_LIMIT_TYPES.TPM]: 600000,
      [RATE_LIMIT_TYPES.RPD]: 14400,
      [RATE_LIMIT_TYPES.ASH]: 54000 // 15 hours per hour
    },
    documentation: 'https://console.groq.com/docs/rate-limits',
    headers: ['x-ratelimit-limit-requests', 'x-ratelimit-remaining-requests', 'x-ratelimit-reset-requests', 'retry-after']
  },

  // Together AI rate limits (from official docs)
  together: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 60,
      [RATE_LIMIT_TYPES.TPM]: 60000
    },
    tier1: {
      [RATE_LIMIT_TYPES.RPM]: 600,
      [RATE_LIMIT_TYPES.TPM]: 180000
    },
    tier2: {
      [RATE_LIMIT_TYPES.RPM]: 1800,
      [RATE_LIMIT_TYPES.TPM]: 250000
    },
    tier3: {
      [RATE_LIMIT_TYPES.RPM]: 3000,
      [RATE_LIMIT_TYPES.TPM]: 500000
    },
    documentation: 'https://docs.together.ai/docs/rate-limits',
    headers: ['x-ratelimit-remaining', 'x-ratelimit-reset']
  },

  // OpenRouter rate limits (from official docs)
  openrouter: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 20, // For :free models
      [RATE_LIMIT_TYPES.RPD]: 50  // For users with <$10 credits
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: null, // Model-dependent
      [RATE_LIMIT_TYPES.RPD]: 1000  // For users with >=$10 credits
    },
    documentation: 'https://openrouter.ai/docs/limits',
    headers: ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset']
  },

  // GitHub Models rate limits (from GitHub REST API docs)
  'gh-models': {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 60, // Unauthenticated
      [RATE_LIMIT_TYPES.RPD]: null
    },
    authenticated: {
      [RATE_LIMIT_TYPES.RPM]: 5000, // With personal access token
      [RATE_LIMIT_TYPES.RPD]: null
    },
    documentation: 'https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api',
    headers: ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset']
  },

  // Hugging Face rate limits (estimated based on service tiers)
  huggingface: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 1000,
      [RATE_LIMIT_TYPES.TPM]: 100000
    },
    pro: {
      [RATE_LIMIT_TYPES.RPM]: 10000,
      [RATE_LIMIT_TYPES.TPM]: 1000000
    },
    documentation: 'https://huggingface.co/docs/api-inference/en/rate-limits',
    headers: ['x-wait-for-model', 'x-compute-type']
  },

  // DeepSeek rate limits (estimated based on Chinese market standards)
  deepseek: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 60,
      [RATE_LIMIT_TYPES.TPM]: 60000,
      [RATE_LIMIT_TYPES.RPD]: 1000
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: 1000,
      [RATE_LIMIT_TYPES.TPM]: 500000,
      [RATE_LIMIT_TYPES.RPD]: 10000
    },
    documentation: 'https://platform.deepseek.com/api-docs',
    headers: ['x-ratelimit-limit', 'x-ratelimit-remaining']
  },

  // Qwen (Alibaba Cloud) rate limits (estimated)
  qwen: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 60,
      [RATE_LIMIT_TYPES.TPM]: 60000,
      [RATE_LIMIT_TYPES.RPD]: 1000
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: 1000,
      [RATE_LIMIT_TYPES.TPM]: 500000,
      [RATE_LIMIT_TYPES.RPD]: 10000
    },
    documentation: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details',
    headers: ['x-ratelimit-limit', 'x-ratelimit-remaining']
  },

  // SiliconFlow rate limits (estimated)
  siliconflow: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 60,
      [RATE_LIMIT_TYPES.TPM]: 60000,
      [RATE_LIMIT_TYPES.RPD]: 1000
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: 1000,
      [RATE_LIMIT_TYPES.TPM]: 500000,
      [RATE_LIMIT_TYPES.RPD]: 10000
    },
    documentation: 'https://siliconflow.cn/zh-cn/siliconcloud',
    headers: ['x-ratelimit-limit', 'x-ratelimit-remaining']
  },

  // Grok (X.AI) rate limits (estimated based on OpenAI-like model)
  grok: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 10,
      [RATE_LIMIT_TYPES.TPM]: 10000,
      [RATE_LIMIT_TYPES.RPD]: 100
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: 1000,
      [RATE_LIMIT_TYPES.TPM]: 500000,
      [RATE_LIMIT_TYPES.RPD]: 10000
    },
    documentation: 'https://docs.x.ai/api',
    headers: ['x-ratelimit-limit', 'x-ratelimit-remaining']
  },

  // Ollama rate limits (local deployment, typically unlimited)
  ollama: {
    local: {
      [RATE_LIMIT_TYPES.RPM]: null, // No network limits
      [RATE_LIMIT_TYPES.TPM]: null, // Hardware limited
      [RATE_LIMIT_TYPES.RPD]: null
    },
    documentation: 'https://github.com/ollama/ollama/blob/main/docs/api.md',
    headers: [] // Local API typically doesn't include rate limit headers
  }
};

/**
 * Rate limit tracker class for managing usage across time windows
 */
class RateLimitTracker {
  constructor() {
    this.usage = new Map(); // provider -> { minute: [], day: [], tokens: {} }
    this.resetTimers = new Map();
  }

  /**
   * Record a request for rate limit tracking
   * @param {string} provider - Provider name
   * @param {number} tokens - Number of tokens used (optional)
   */
  recordRequest(provider, tokens = 0) {
    const now = Date.now();
    
    if (!this.usage.has(provider)) {
      this.usage.set(provider, {
        minute: [],
        day: [],
        tokens: { minute: 0, day: 0 }
      });
    }

    const usage = this.usage.get(provider);
    
    // Clean old entries
    this.cleanOldEntries(provider);
    
    // Record new request
    usage.minute.push(now);
    usage.day.push(now);
    usage.tokens.minute += tokens;
    usage.tokens.day += tokens;
  }

  /**
   * Check if a request would exceed rate limits
   * @param {string} provider - Provider name
   * @param {string} tier - Rate limit tier (free, tier1, etc.)
   * @param {number} tokens - Number of tokens for the request
   * @returns {Object} - { allowed: boolean, waitTime: number, reason: string }
   */
  checkRateLimit(provider, tier = 'free', tokens = 0) {
    const limits = PROVIDER_RATE_LIMITS[provider]?.[tier];
    if (!limits) {
      return { allowed: true, waitTime: 0, reason: 'No limits defined' };
    }

    const usage = this.usage.get(provider) || { minute: [], day: [], tokens: { minute: 0, day: 0 } };
    this.cleanOldEntries(provider);

    // Check requests per minute
    if (limits[RATE_LIMIT_TYPES.RPM] && usage.minute.length >= limits[RATE_LIMIT_TYPES.RPM]) {
      const oldestRequest = Math.min(...usage.minute);
      const waitTime = 60000 - (Date.now() - oldestRequest);
      return {
        allowed: false,
        waitTime: Math.max(0, waitTime),
        reason: `RPM limit exceeded (${usage.minute.length}/${limits[RATE_LIMIT_TYPES.RPM]})`
      };
    }

    // Check tokens per minute
    if (limits[RATE_LIMIT_TYPES.TPM] && (usage.tokens.minute + tokens) > limits[RATE_LIMIT_TYPES.TPM]) {
      return {
        allowed: false,
        waitTime: 60000, // Wait a full minute
        reason: `TPM limit would be exceeded (${usage.tokens.minute + tokens}/${limits[RATE_LIMIT_TYPES.TPM]})`
      };
    }

    // Check requests per day
    if (limits[RATE_LIMIT_TYPES.RPD] && usage.day.length >= limits[RATE_LIMIT_TYPES.RPD]) {
      const oldestRequest = Math.min(...usage.day);
      const waitTime = 86400000 - (Date.now() - oldestRequest); // 24 hours
      return {
        allowed: false,
        waitTime: Math.max(0, waitTime),
        reason: `RPD limit exceeded (${usage.day.length}/${limits[RATE_LIMIT_TYPES.RPD]})`
      };
    }

    return { allowed: true, waitTime: 0, reason: 'Within limits' };
  }

  /**
   * Clean old entries outside the time windows
   * @param {string} provider - Provider name
   */
  cleanOldEntries(provider) {
    const usage = this.usage.get(provider);
    if (!usage) return;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneDayAgo = now - 86400000;

    // Clean minute entries
    usage.minute = usage.minute.filter(time => time > oneMinuteAgo);
    usage.day = usage.day.filter(time => time > oneDayAgo);

    // Recalculate token usage for current windows
    // Note: This is a simplified approach. In production, you'd want more precise token tracking
    const minuteRequests = usage.minute.length;
    const dayRequests = usage.day.length;
    
    // Reset token counters if no recent requests (simplified)
    if (minuteRequests === 0) usage.tokens.minute = 0;
    if (dayRequests === 0) usage.tokens.day = 0;
  }

  /**
   * Get current usage statistics for a provider
   * @param {string} provider - Provider name
   * @param {string} tier - Rate limit tier
   * @returns {Object} - Usage statistics
   */
  getUsageStats(provider, tier = 'free') {
    const limits = PROVIDER_RATE_LIMITS[provider]?.[tier] || {};
    const usage = this.usage.get(provider) || { minute: [], day: [], tokens: { minute: 0, day: 0 } };
    this.cleanOldEntries(provider);

    return {
      requests: {
        minute: {
          used: usage.minute.length,
          limit: limits[RATE_LIMIT_TYPES.RPM] || null,
          percentage: limits[RATE_LIMIT_TYPES.RPM] ? (usage.minute.length / limits[RATE_LIMIT_TYPES.RPM]) * 100 : 0
        },
        day: {
          used: usage.day.length,
          limit: limits[RATE_LIMIT_TYPES.RPD] || null,
          percentage: limits[RATE_LIMIT_TYPES.RPD] ? (usage.day.length / limits[RATE_LIMIT_TYPES.RPD]) * 100 : 0
        }
      },
      tokens: {
        minute: {
          used: usage.tokens.minute,
          limit: limits[RATE_LIMIT_TYPES.TPM] || null,
          percentage: limits[RATE_LIMIT_TYPES.TPM] ? (usage.tokens.minute / limits[RATE_LIMIT_TYPES.TPM]) * 100 : 0
        },
        day: {
          used: usage.tokens.day,
          limit: limits[RATE_LIMIT_TYPES.TPD] || null,
          percentage: limits[RATE_LIMIT_TYPES.TPD] ? (usage.tokens.day / limits[RATE_LIMIT_TYPES.TPD]) * 100 : 0
        }
      }
    };
  }
}

/**
 * Parse rate limit headers from API responses
 * @param {Object} headers - Response headers
 * @param {string} provider - Provider name
 * @returns {Object} - Parsed rate limit information
 */
function parseRateLimitHeaders(headers, provider) {
  const providerConfig = PROVIDER_RATE_LIMITS[provider];
  if (!providerConfig || !providerConfig.headers) {
    return {};
  }

  const rateLimitInfo = {};
  
  // Provider-specific header parsing
  switch (provider) {
    case 'openai':
    case 'groq':
      rateLimitInfo.requestsRemaining = parseInt(headers['x-ratelimit-remaining-requests']) || null;
      rateLimitInfo.requestsLimit = parseInt(headers['x-ratelimit-limit-requests']) || null;
      rateLimitInfo.tokensRemaining = parseInt(headers['x-ratelimit-remaining-tokens']) || null;
      rateLimitInfo.tokensLimit = parseInt(headers['x-ratelimit-limit-tokens']) || null;
      rateLimitInfo.resetTime = headers['x-ratelimit-reset-requests'] || null;
      rateLimitInfo.retryAfter = parseInt(headers['retry-after']) || null;
      break;
      
    case 'anthropic':
      rateLimitInfo.requestsRemaining = parseInt(headers['anthropic-ratelimit-requests-remaining']) || null;
      rateLimitInfo.tokensRemaining = parseInt(headers['anthropic-ratelimit-tokens-remaining']) || null;
      break;
      
    case 'openrouter':
    case 'gh-models':
      rateLimitInfo.remaining = parseInt(headers['x-ratelimit-remaining']) || null;
      rateLimitInfo.limit = parseInt(headers['x-ratelimit-limit']) || null;
      rateLimitInfo.reset = headers['x-ratelimit-reset'] || null;
      break;
      
    default:
      // Generic parsing for unknown providers
      Object.keys(headers).forEach(key => {
        if (key.toLowerCase().includes('ratelimit') || key.toLowerCase().includes('rate-limit')) {
          rateLimitInfo[key] = headers[key];
        }
      });
  }
  
  return rateLimitInfo;
}

/**
 * Implement exponential backoff with jitter for rate limit retries
 * @param {number} attempt - Retry attempt number (starting from 0)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} maxDelay - Maximum delay in milliseconds (default: 30000)
 * @returns {number} - Delay in milliseconds
 */
function calculateBackoffDelay(attempt = 0, baseDelay = 1000, maxDelay = 30000) {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Get provider rate limit documentation URL
 * @param {string} provider - Provider name
 * @returns {string} - Documentation URL
 */
function getProviderDocumentation(provider) {
  return PROVIDER_RATE_LIMITS[provider]?.documentation || 'Documentation not available';
}

/**
 * Get recommended tier for a provider based on usage requirements
 * @param {string} provider - Provider name
 * @param {Object} requirements - Usage requirements { rpm, tpm, rpd, tpd }
 * @returns {string} - Recommended tier
 */
function getRecommendedTier(provider, requirements) {
  const providerLimits = PROVIDER_RATE_LIMITS[provider];
  if (!providerLimits) return 'unknown';

  const tiers = Object.keys(providerLimits).filter(key => key !== 'documentation' && key !== 'headers');
  
  for (const tier of tiers) {
    const limits = providerLimits[tier];
    const meetsRequirements = (
      (!requirements.rpm || !limits[RATE_LIMIT_TYPES.RPM] || limits[RATE_LIMIT_TYPES.RPM] >= requirements.rpm) &&
      (!requirements.tpm || !limits[RATE_LIMIT_TYPES.TPM] || limits[RATE_LIMIT_TYPES.TPM] >= requirements.tpm) &&
      (!requirements.rpd || !limits[RATE_LIMIT_TYPES.RPD] || limits[RATE_LIMIT_TYPES.RPD] >= requirements.rpd) &&
      (!requirements.tpd || !limits[RATE_LIMIT_TYPES.TPD] || limits[RATE_LIMIT_TYPES.TPD] >= requirements.tpd)
    );
    
    if (meetsRequirements) {
      return tier;
    }
  }
  
  return tiers[tiers.length - 1] || 'unknown'; // Return highest tier if none meet requirements
}

// Create a global rate limit tracker instance
const globalRateLimitTracker = new RateLimitTracker();

module.exports = {
  RATE_LIMIT_TYPES,
  PROVIDER_RATE_LIMITS,
  RateLimitTracker,
  globalRateLimitTracker,
  parseRateLimitHeaders,
  calculateBackoffDelay,
  getProviderDocumentation,
  getRecommendedTier
};
