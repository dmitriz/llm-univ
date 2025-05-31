const {
  RATE_LIMIT_TYPES,
  PROVIDER_RATE_LIMITS,
  RateLimitTracker,
  parseRateLimitHeaders,
  calculateBackoffDelay,
  getProviderDocumentation,
  getRecommendedTier
} = require('./rate_limits');

describe('Rate Limits Module', () => {
  describe('RATE_LIMIT_TYPES', () => {
    it('should define all expected rate limit types', () => {
      expect(RATE_LIMIT_TYPES.RPM).toBe('requests_per_minute');
      expect(RATE_LIMIT_TYPES.TPM).toBe('tokens_per_minute');
      expect(RATE_LIMIT_TYPES.RPD).toBe('requests_per_day');
      expect(RATE_LIMIT_TYPES.TPD).toBe('tokens_per_day');
    });
  });

  describe('PROVIDER_RATE_LIMITS', () => {
    it('should have rate limits for all major providers', () => {
      const expectedProviders = [
        'openai', 'anthropic', 'google', 'groq', 'together',
        'openrouter', 'gh-models', 'huggingface'
      ];

      expectedProviders.forEach(provider => {
        expect(PROVIDER_RATE_LIMITS[provider]).toBeDefined();
        expect(PROVIDER_RATE_LIMITS[provider].documentation).toBeDefined();
      });
    });

    it('should have valid rate limit structures', () => {
      Object.entries(PROVIDER_RATE_LIMITS).forEach(([provider, config]) => {
        expect(config.documentation).toMatch(/^https?:\/\//);
        
        // Check that each tier has valid rate limits
        Object.entries(config).forEach(([tier, limits]) => {
          if (tier !== 'documentation' && tier !== 'rateLimitHeaders' && tier !== 'rateLimitEndpoint' && tier !== 'quotaEndpoint' && tier !== 'errorPatterns') {
            expect(typeof limits).toBe('object');
          }
        });
      });
    });
  });

  describe('RateLimitTracker', () => {
    let tracker;

    beforeEach(() => {
      tracker = new RateLimitTracker();
    });

    describe('recordRequest', () => {
      it('should record requests correctly', () => {
        tracker.recordRequest('openai', 100);
        
        const usage = tracker.usage.get('openai');
        expect(usage.minute).toHaveLength(1);
        expect(usage.day).toHaveLength(1);
        expect(usage.tokens.minute).toBe(100);
        expect(usage.tokens.day).toBe(100);
      });

      it('should handle multiple requests', () => {
        tracker.recordRequest('openai', 50);
        tracker.recordRequest('openai', 75);
        
        const usage = tracker.usage.get('openai');
        expect(usage.minute).toHaveLength(2);
        expect(usage.tokens.minute).toBe(125);
      });
    });

    describe('checkRateLimit', () => {
      it('should allow requests within limits', () => {
        const result = tracker.checkRateLimit('openai', 'tier1', 100);
        expect(result.allowed).toBe(true);
        expect(result.waitTime).toBe(0);
      });

      it('should block requests exceeding RPM limits', () => {
        // Record requests up to the limit
        const rpmLimit = PROVIDER_RATE_LIMITS.openai.tier1[RATE_LIMIT_TYPES.RPM];
        for (let i = 0; i < rpmLimit; i++) {
          tracker.recordRequest('openai', 10);
        }

        const result = tracker.checkRateLimit('openai', 'tier1', 10);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('RPM limit exceeded');
      });

      it('should block requests exceeding TPM limits', () => {
        const tpmLimit = PROVIDER_RATE_LIMITS.openai.tier1[RATE_LIMIT_TYPES.TPM];
        tracker.recordRequest('openai', tpmLimit - 100);

        const result = tracker.checkRateLimit('openai', 'tier1', 200);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('TPM limit would be exceeded');
      });

      it('should handle unknown providers gracefully', () => {
        const result = tracker.checkRateLimit('unknown-provider', 'free', 100);
        expect(result.allowed).toBe(true);
        expect(result.reason).toBe('No limits defined');
      });
    });

    describe('cleanOldEntries', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      
      afterEach(() => {
        jest.useRealTimers();
      });
      
      it('should remove old entries outside time windows', () => {
        tracker.recordRequest('openai', 100);

        const usage = tracker.usage.get('openai');
        const oldTime = Date.now() - 70000;
        usage.minute[0] = oldTime;
        usage.day[0] = oldTime;

        jest.advanceTimersByTime(70000);
        tracker.cleanOldEntries('openai');
        const updatedUsage = tracker.usage.get('openai');
        expect(updatedUsage.minute).toHaveLength(0);
      });
    });

    describe('getUsageStats', () => {
      it('should return correct usage statistics', () => {
        tracker.recordRequest('openai', 1000);
        tracker.recordRequest('openai', 500);

        const stats = tracker.getUsageStats('openai', 'tier1');
        
        expect(stats.requests.minute.used).toBe(2);
        expect(stats.requests.minute.limit).toBe(PROVIDER_RATE_LIMITS.openai.tier1[RATE_LIMIT_TYPES.RPM]);
        expect(stats.tokens.minute.used).toBe(1500);
      });
    });
  });

  describe('parseRateLimitHeaders', () => {
    it('should parse OpenAI headers correctly', () => {
      const headers = {
        'x-ratelimit-remaining-requests': '100',
        'x-ratelimit-limit-requests': '500',
        'x-ratelimit-remaining-tokens': '10000',
        'retry-after': '60'
      };

      const result = parseRateLimitHeaders(headers, 'openai');
      
      expect(result.requestsRemaining).toBe(100);
      expect(result.requestsLimit).toBe(500);
      expect(result.tokensRemaining).toBe(10000);
      expect(result.retryAfter).toBe(60);
    });

    it('should parse Anthropic headers correctly', () => {
      const headers = {
        'anthropic-ratelimit-requests-remaining': '50',
        'anthropic-ratelimit-tokens-remaining': '5000'
      };

      const result = parseRateLimitHeaders(headers, 'anthropic');
      
      expect(result.requestsRemaining).toBe(50);
      expect(result.tokensRemaining).toBe(5000);
    });

    it('should handle unknown providers gracefully', () => {
      const headers = { 'custom-header': 'value' };
      const result = parseRateLimitHeaders(headers, 'unknown-provider');
      expect(result).toEqual({});
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      expect(calculateBackoffDelay(0, 1000)).toBeGreaterThanOrEqual(1000);
      expect(calculateBackoffDelay(1, 1000)).toBeGreaterThanOrEqual(2000);
      expect(calculateBackoffDelay(2, 1000)).toBeGreaterThanOrEqual(4000);
    });

    it('should respect maximum delay', () => {
      const delay = calculateBackoffDelay(10, 1000, 5000);
      expect(delay).toBeLessThanOrEqual(5000);
    });

    it('should include jitter', () => {
      const delays = Array.from({ length: 10 }, () => calculateBackoffDelay(1, 1000));
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1); // Should have variation due to jitter
    });
  });

  describe('getProviderDocumentation', () => {
    it('should return documentation URLs for known providers', () => {
      const url = getProviderDocumentation('openai');
      expect(url).toMatch(/^https?:\/\//);
    });

    it('should handle unknown providers', () => {
      const result = getProviderDocumentation('unknown-provider');
      expect(result).toBe('Documentation not available');
    });
  });

  describe('getRecommendedTier', () => {
    it('should recommend appropriate tier based on requirements', () => {
      const requirements = { rpm: 100, tpm: 50000 };
      const tier = getRecommendedTier('openai', requirements);
      expect(tier).toBeDefined();
      expect(typeof tier).toBe('string');
    });

    it('should handle unknown providers', () => {
      const tier = getRecommendedTier('unknown-provider', { rpm: 100 });
      expect(tier).toBe('unknown');
    });
  });
});

