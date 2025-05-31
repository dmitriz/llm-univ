/**
 * Universal Rate Limit Management Module
 * 
 * This module provides rate limit information and management for all supported LLM providers.
 * It handles different rate limit types (RPM, TPM, RPD, TPD, etc.) and provides utilities
 * for rate limit enforcement, monitoring, and backoff strategies.
 * 
 * Refactored to use pure functions for better testability and maintainability.
 * 
 * IMPORTANT: This module prioritizes real-time rate limit detection via API headers
 * and endpoints over documentation URLs, as documentation frequently becomes outdated.
 * 
 * Rate limit detection methods (in priority order):
 * 1. API Response Headers - Real-time limit info from each request
 * 2. Rate Limit Endpoints - Dedicated endpoints for current limits
 * 3. Error Response Analysis - Extract limits from 429 error responses
 * 4. Historical Baseline Data - Fallback estimates from known patterns
 * 5. Documentation URLs - Reference material (may be outdated)
 * 
 * Original rate limit documentation references (WARNING: May be outdated, use API headers when possible):
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
 * Each provider includes:
 * - Rate limit tiers with realistic estimates
 * - API response headers for real-time detection
 * - Rate limit endpoints for current status
 * - Error response patterns for limit extraction
 */
const PROVIDER_RATE_LIMITS = {
  // OpenAI rate limits - Headers provide real-time data
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - Status endpoint accessible (collected_info/all_providers_2025-05-30.json)
  // Pricing/documentation endpoints: BLOCKED (403 errors in collected_info)
  openai: {
    // Free trial tier (during $100 credit period)
    free_trial: {
      [RATE_LIMIT_TYPES.RPM]: 3,
      [RATE_LIMIT_TYPES.TPM]: 10000,
      [RATE_LIMIT_TYPES.RPD]: 200,
      notes: "$100 trial credit period"
    },
    tier1: {
      [RATE_LIMIT_TYPES.RPM]: 500,
      [RATE_LIMIT_TYPES.TPM]: 30000,
      notes: "$5+ paid"
    },
    tier2: {
      [RATE_LIMIT_TYPES.RPM]: 3500,
      [RATE_LIMIT_TYPES.TPM]: 180000,
      notes: "$50+ paid, 7+ days"
    },
    tier3: {
      [RATE_LIMIT_TYPES.RPM]: 5000,
      [RATE_LIMIT_TYPES.TPM]: 300000,
      notes: "$100+ paid, 7+ days"
    },
    tier4: {
      [RATE_LIMIT_TYPES.RPM]: 7000,
      [RATE_LIMIT_TYPES.TPM]: 600000,
      notes: "$250+ paid, 14+ days"
    },
    tier5: {
      [RATE_LIMIT_TYPES.RPM]: 10000,
      [RATE_LIMIT_TYPES.TPM]: {
        "gpt-4o": 12000000,
        "gpt-4-turbo": 2000000,
        "gpt-4": 300000
      },
      notes: "$1000+ paid, 30+ days"
    },
    documentation: 'https://platform.openai.com/docs/guides/rate-limits',
    // Real-time detection via API headers
    rateLimitHeaders: {
      requestsLimit: 'x-ratelimit-limit-requests',
      requestsRemaining: 'x-ratelimit-remaining-requests',
      tokensLimit: 'x-ratelimit-limit-tokens',
      tokensRemaining: 'x-ratelimit-remaining-tokens',
      requestsReset: 'x-ratelimit-reset-requests',
      retryAfter: 'retry-after'
    },
    // Live rate limit endpoints
    rateLimitEndpoint: 'https://api.openai.com/v1/usage',
    quotaEndpoint: 'https://api.openai.com/v1/dashboard/billing/subscription',
    // Extract from 429 error responses
    errorPatterns: {
      rateLimitExceeded: /Rate limit exceeded/,
      quotaExceeded: /You exceeded your current quota/
    }
  },

  // Anthropic rate limits - Models verified via API calls
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - Models endpoint accessible, found 4 models (collected_info/all_providers_2025-05-30.json)
  // Pricing endpoint: VERIFIED - Accessible (200 status in collected_info)
  // Documentation endpoint: BLOCKED (307 redirect in collected_info)
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
      notes: "Standard tier, varies by model"
    },
    enterprise: {
      [RATE_LIMIT_TYPES.RPM]: 50,
      [RATE_LIMIT_TYPES.TPM]: 100000,
      [RATE_LIMIT_TYPES.TPD]: 3000000,
      notes: "Enterprise tier with higher limits"
    },
    // Real-time detection via API headers
    rateLimitHeaders: {
      requestsRemaining: 'anthropic-ratelimit-requests-remaining',
      tokensRemaining: 'anthropic-ratelimit-tokens-remaining',
      requestsReset: 'anthropic-ratelimit-requests-reset',
      tokensReset: 'anthropic-ratelimit-tokens-reset',
      retryAfter: 'retry-after'
    },
    // Live rate limit endpoints
    rateLimitEndpoint: 'https://api.anthropic.com/v1/usage',
    quotaEndpoint: 'https://api.anthropic.com/v1/billing/subscription',
    // Extract from 429 error responses  
    errorPatterns: {
      rateLimitExceeded: /rate_limit_error/,
      quotaExceeded: /Your credit balance is too low/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://docs.anthropic.com/en/api/rate-limits'
  },

  // Google Gemini rate limits - Documentation endpoint accessible
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - Documentation endpoint accessible (200 status in collected_info)
  // Models endpoint: BLOCKED (403 error in collected_info)
  // Pricing endpoint: BLOCKED (301 redirect in collected_info)
  google: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 15,
      [RATE_LIMIT_TYPES.TPM]: 32000,
      [RATE_LIMIT_TYPES.RPD]: 1500,
      notes: "Free tier limits"
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: 2000,
      [RATE_LIMIT_TYPES.TPM]: 4000000,
      [RATE_LIMIT_TYPES.RPD]: null,
      notes: "Paid tier limits"
    },
    // Real-time detection via API headers
    rateLimitHeaders: {
      quotaUser: 'x-goog-quota-user',
      apiQuotaUser: 'x-goog-api-quota-user',
      rateLimitRemaining: 'x-goog-ratelimit-remaining',
      rateLimitReset: 'x-goog-ratelimit-reset'
    },
    // Live rate limit endpoints
    rateLimitEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models:countTokens',
    quotaEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    // Current quota endpoint
    quotaEndpoint: '/v1beta/models:quota',
    // Extract from 429 error responses
    errorPatterns: {
      quotaExceeded: /Quota exceeded/,
      rateLimitExceeded: /Rate limit exceeded/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://ai.google.dev/gemini-api/docs/quota'
  },

  // Groq rate limits - Pricing and documentation endpoints accessible
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - Pricing (200) and documentation (200) endpoints accessible (collected_info)
  // Models endpoint: BLOCKED (401 - requires auth key in collected_info)
  groq: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 30,
      [RATE_LIMIT_TYPES.TPM]: 6000,
      [RATE_LIMIT_TYPES.RPD]: 14400,
      [RATE_LIMIT_TYPES.ASH]: 3600
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: 6000,
      [RATE_LIMIT_TYPES.TPM]: 600000,
      [RATE_LIMIT_TYPES.RPD]: 14400,
      [RATE_LIMIT_TYPES.ASH]: 54000
    },
    // Real-time detection via API headers
    rateLimitHeaders: {
      limit: 'x-ratelimit-limit-requests',
      remaining: 'x-ratelimit-remaining-requests',
      reset: 'x-ratelimit-reset-requests',
      retryAfter: 'retry-after'
    },
    // Extract from 429 error responses
    errorPatterns: {
      rateLimitExceeded: /Rate limit exceeded/,
      quotaExceeded: /Quota exceeded/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://console.groq.com/docs/rate-limits'
  },

  // Together AI rate limits - Pricing and documentation endpoints accessible
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - Pricing (200) and documentation (200) endpoints accessible (collected_info)
  // Models endpoint: BLOCKED (401 - requires auth key in collected_info)
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
    // Real-time detection via API headers
    rateLimitHeaders: {
      remaining: 'x-ratelimit-remaining',
      reset: 'x-ratelimit-reset',
      retryAfter: 'retry-after'
    },
    errorPatterns: {
      rateLimitExceeded: /Rate limit exceeded/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://docs.together.ai/docs/rate-limits'
  },

  // OpenRouter rate limits - Models verified via API calls
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - Models endpoint accessible, found 322 models (collected_info/all_providers_2025-05-30.json)
  // Pricing and documentation endpoints: NOT TESTED in collected_info
  openrouter: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 20,
      [RATE_LIMIT_TYPES.RPD]: 50,
      notes: "For :free models and <$10 credits"
    },
    paid: {
      [RATE_LIMIT_TYPES.RPM]: null, // Model-dependent
      [RATE_LIMIT_TYPES.RPD]: 1000,
      notes: "For >=$10 credits"
    },
    // Real-time detection via API headers
    rateLimitHeaders: {
      limit: 'x-ratelimit-limit',
      remaining: 'x-ratelimit-remaining',
      reset: 'x-ratelimit-reset',
      retryAfter: 'retry-after'
    },
    errorPatterns: {
      rateLimitExceeded: /Rate limit exceeded/,
      quotaExceeded: /Insufficient credits/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://openrouter.ai/docs/limits'
  },

  // GitHub Models rate limits - Models and endpoint accessibility verified
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - Models endpoint accessible, found 24 models (collected_info/all_providers_2025-05-30.json)
  // Multiple endpoints accessible (2 out of 3 in collected_info)
  'gh-models': {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 60,
      [RATE_LIMIT_TYPES.RPD]: null,
      notes: "Unauthenticated requests"
    },
    authenticated: {
      [RATE_LIMIT_TYPES.RPM]: 5000,
      [RATE_LIMIT_TYPES.RPD]: null,
      notes: "With personal access token"
    },
    // Real-time detection via API headers
    rateLimitHeaders: {
      limit: 'x-ratelimit-limit',
      remaining: 'x-ratelimit-remaining', 
      reset: 'x-ratelimit-reset',
      retryAfter: 'retry-after'
    },
    errorPatterns: {
      rateLimitExceeded: /API rate limit exceeded/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api'
  },

  // Hugging Face rate limits - Models and endpoints verified
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - All endpoints accessible, found 50 models (collected_info/all_providers_2025-05-30.json)
  // Best endpoint accessibility: 3 out of 4 endpoints working (collected_info)
  huggingface: {
    free: {
      [RATE_LIMIT_TYPES.RPM]: 1000,
      [RATE_LIMIT_TYPES.TPM]: 100000
    },
    pro: {
      [RATE_LIMIT_TYPES.RPM]: 10000,
      [RATE_LIMIT_TYPES.TPM]: 1000000
    },
    // Real-time detection via API headers
    rateLimitHeaders: {
      waitForModel: 'x-wait-for-model',
      computeType: 'x-compute-type',
      retryAfter: 'retry-after'
    },
    errorPatterns: {
      rateLimitExceeded: /Model .* is currently loading/,
      quotaExceeded: /Rate limit reached/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://huggingface.co/docs/api-inference/en/rate-limits'
  },

  // DeepSeek rate limits - All endpoints blocked
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: BLOCKED - All endpoints inaccessible (0 out of 3 in collected_info)
  // No models found, no accessible endpoints (collected_info/all_providers_2025-05-30.json)
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
    // Real-time detection via API headers
    rateLimitHeaders: {
      limit: 'x-ratelimit-limit',
      remaining: 'x-ratelimit-remaining',
      reset: 'x-ratelimit-reset',
      retryAfter: 'retry-after'
    },
    errorPatterns: {
      rateLimitExceeded: /Rate limit exceeded/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://platform.deepseek.com/api-docs'
  },

  // Qwen (Alibaba Cloud) rate limits - Models verified via API calls
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - Models endpoint accessible, found 7 models (collected_info/all_providers_2025-05-30.json)
  // Limited endpoint accessibility: 1 out of 2 endpoints working (collected_info)
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
    // Real-time detection via API headers
    rateLimitHeaders: {
      limit: 'x-ratelimit-limit',
      remaining: 'x-ratelimit-remaining',
      reset: 'x-ratelimit-reset'
    },
    errorPatterns: {
      rateLimitExceeded: /Rate limit exceeded/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details'
  },

  // SiliconFlow rate limits - Limited endpoint accessibility
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: LIMITED - 1 out of 3 endpoints accessible (collected_info)
  // No models found in accessible endpoints (collected_info/all_providers_2025-05-30.json)
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
    // Real-time detection via API headers
    rateLimitHeaders: {
      limit: 'x-ratelimit-limit',
      remaining: 'x-ratelimit-remaining',
      reset: 'x-ratelimit-reset'
    },
    errorPatterns: {
      rateLimitExceeded: /Rate limit exceeded/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://siliconflow.cn/zh-cn/siliconcloud'
  },

  // Grok (X.AI) rate limits - All endpoints blocked
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: BLOCKED - All endpoints inaccessible (0 out of 2 in collected_info)
  // No models found, no accessible endpoints (collected_info/all_providers_2025-05-30.json)
  // Known for live web access and real-time search capabilities (collected_info)
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
    // Real-time detection via API headers
    rateLimitHeaders: {
      limit: 'x-ratelimit-limit',
      remaining: 'x-ratelimit-remaining',
      reset: 'x-ratelimit-reset'
    },
    errorPatterns: {
      rateLimitExceeded: /Rate limit exceeded/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://docs.x.ai/api'
  },

  // Ollama rate limits - Local deployment verified
  // NOTE: Rate limit values below are from documentation research, NOT from API calls
  // API endpoint accessibility: VERIFIED - All local endpoints accessible (3 out of 3 in collected_info)
  // Found 1 model in local deployment (collected_info/all_providers_2025-05-30.json)
  ollama: {
    local: {
      [RATE_LIMIT_TYPES.RPM]: null, // No network limits
      [RATE_LIMIT_TYPES.TPM]: null, // Hardware limited
      [RATE_LIMIT_TYPES.RPD]: null
    },
    // Local API typically doesn't include rate limit headers
    rateLimitHeaders: {},
    errorPatterns: {
      serverOverloaded: /server overloaded/,
      modelNotFound: /model not found/
    },
    // Documentation URLs (WARNING: May become outdated - use API headers for real-time data)
    documentation: 'https://github.com/ollama/ollama/blob/main/docs/api.md'
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
    } else if (this.usage.has(provider)) {
      const usage = this.usage.get(provider);
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
  if (!providerConfig || !providerConfig.rateLimitHeaders) {
    return {};
  }

  const rateLimitInfo = {};
  
  // Provider-specific header parsing
  switch (provider) {
    case 'openai':
    case 'groq':
      rateLimitInfo.requestsRemaining = headers['x-ratelimit-remaining-requests'] ? parseInt(headers['x-ratelimit-remaining-requests']) : null;
      rateLimitInfo.requestsLimit = headers['x-ratelimit-limit-requests'] ? parseInt(headers['x-ratelimit-limit-requests']) : null;
      rateLimitInfo.tokensRemaining = headers['x-ratelimit-remaining-tokens'] ? parseInt(headers['x-ratelimit-remaining-tokens']) : null;
      rateLimitInfo.tokensLimit = headers['x-ratelimit-limit-tokens'] ? parseInt(headers['x-ratelimit-limit-tokens']) : null;
      rateLimitInfo.resetTime = headers['x-ratelimit-reset-requests'] || null;
      rateLimitInfo.retryAfter = headers['retry-after'] ? parseInt(headers['retry-after']) : null;
      break;
      
    case 'anthropic':
      rateLimitInfo.requestsRemaining = headers['anthropic-ratelimit-requests-remaining'] ? parseInt(headers['anthropic-ratelimit-requests-remaining']) : null;
      rateLimitInfo.tokensRemaining = headers['anthropic-ratelimit-tokens-remaining'] ? parseInt(headers['anthropic-ratelimit-tokens-remaining']) : null;
      break;
      
    case 'openrouter':
    case 'gh-models':
      rateLimitInfo.remaining = headers['x-ratelimit-remaining'] ? parseInt(headers['x-ratelimit-remaining']) : null;
      rateLimitInfo.limit = headers['x-ratelimit-limit'] ? parseInt(headers['x-ratelimit-limit']) : null;
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

/**
 * Fetches current rate limit information from provider API endpoints
 * @param {string} provider - Provider name (e.g., 'openai', 'anthropic')
 * @param {string} apiKey - API key for authentication
 * @returns {Promise<Object>} Current rate limit status
 */
async function fetchCurrentRateLimits(provider, apiKey) {
  const config = PROVIDER_RATE_LIMITS[provider];
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  if (!apiKey) {
    throw new Error(`API key required for ${provider}`);
  }

  const result = {
    provider,
    timestamp: new Date().toISOString(),
    limits: {},
    usage: {},
    remaining: {},
    errors: []
  };

  try {
    // Try rate limit endpoint first
    if (config.rateLimitEndpoint) {
      try {
        const response = await fetch(config.rateLimitEndpoint, {
          headers: {
            'Authorization': provider === 'openai' ? `Bearer ${apiKey}` : `x-api-key: ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Parse rate limit headers if present
          if (config.rateLimitHeaders) {
            const headers = parseRateLimitHeaders(response.headers, config.rateLimitHeaders);
            if (headers) {
              result.limits = headers.limits;
              result.remaining = headers.remaining;
              result.usage = headers.usage;
            }
          }

          // Store raw API response
          result.apiResponse = data;
        } else {
          result.errors.push(`Rate limit endpoint returned ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        result.errors.push(`Rate limit endpoint error: ${error.message}`);
      }
    }

    // Try quota endpoint if available
    if (config.quotaEndpoint) {
      try {
        const response = await fetch(config.quotaEndpoint, {
          headers: {
            'Authorization': provider === 'openai' ? `Bearer ${apiKey}` : `x-api-key: ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          result.quotaInfo = data;
        } else {
          result.errors.push(`Quota endpoint returned ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        result.errors.push(`Quota endpoint error: ${error.message}`);
      }
    }

    // If no live data available, fall back to static configuration
    if (Object.keys(result.limits).length === 0 && Object.keys(result.usage).length === 0) {
      result.fallbackToStatic = true;
      result.staticLimits = config;
      result.errors.push('No live rate limit data available, using static configuration');
    }

  } catch (error) {
    result.errors.push(`General error: ${error.message}`);
    result.fallbackToStatic = true;
    result.staticLimits = config;
  }

  return result;
}

/**
 * Monitors rate limits in real-time by making a test request
 * @param {string} provider - Provider name
 * @param {string} apiKey - API key for authentication  
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Rate limit information from response headers
 */
async function monitorRateLimitsViaTestRequest(provider, apiKey, options = {}) {
  const config = PROVIDER_RATE_LIMITS[provider];
  if (!config || !config.rateLimitHeaders) {
    throw new Error(`Rate limit monitoring not supported for provider: ${provider}`);
  }

  const testEndpoints = {
    openai: 'https://api.openai.com/v1/models',
    anthropic: 'https://api.anthropic.com/v1/messages',
    google: 'https://generativelanguage.googleapis.com/v1beta/models',
    groq: 'https://api.groq.com/openai/v1/models',
    together: 'https://api.together.xyz/v1/models',
    openrouter: 'https://openrouter.ai/api/v1/models'
  };

  const endpoint = testEndpoints[provider];
  if (!endpoint) {
    throw new Error(`No test endpoint configured for provider: ${provider}`);
  }

  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add provider-specific authentication
    if (provider === 'openai' || provider === 'groq' || provider === 'together' || provider === 'openrouter') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
    } else if (provider === 'google') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });

    // Parse rate limit headers regardless of response status
    const rateLimitInfo = parseRateLimitHeaders(response.headers, config.rateLimitHeaders);
    
    return {
      provider,
      timestamp: new Date().toISOString(),
      endpoint,
      status: response.status,
      rateLimitInfo,
      headers: Object.fromEntries(response.headers.entries())
    };

  } catch (error) {
    return {
      provider,
      timestamp: new Date().toISOString(),
      endpoint,
      error: error.message,
      rateLimitInfo: null
    };
  }
}

module.exports = {
  RATE_LIMIT_TYPES,
  PROVIDER_RATE_LIMITS,
  RateLimitTracker,
  globalRateLimitTracker,
  parseRateLimitHeaders,
  calculateBackoffDelay,
  getProviderDocumentation,
  getRecommendedTier,
  fetchCurrentRateLimits,
  monitorRateLimitsViaTestRequest
};
