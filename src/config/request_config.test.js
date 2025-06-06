const {
  DEFAULT_TIMEOUTS,
  RETRY_CONFIG,
  getProviderTimeout,
  calculateRetryDelay,
  shouldRetry,
  getRetryAfterDelay,
  createAxiosConfig
} = require('./request_config');

describe('Request Configuration', () => {
  describe('DEFAULT_TIMEOUTS', () => {
    it('should have timeouts for all major providers', () => {
      const expectedProviders = [
        'openai', 'anthropic', 'google', 'gh-models', 'huggingface',
        'together', 'groq', 'ollama'
      ];

      expectedProviders.forEach(provider => {
        expect(DEFAULT_TIMEOUTS[provider]).toBeDefined();
        expect(typeof DEFAULT_TIMEOUTS[provider]).toBe('number');
        expect(DEFAULT_TIMEOUTS[provider]).toBeGreaterThan(0);
      });
    });

    it('should have a default timeout', () => {
      expect(DEFAULT_TIMEOUTS.default).toBeDefined();
      expect(typeof DEFAULT_TIMEOUTS.default).toBe('number');
      expect(DEFAULT_TIMEOUTS.default).toBe(30000);
    });

    it('should have reasonable timeout values', () => {
      // Ollama should be fastest (local)
      expect(DEFAULT_TIMEOUTS.ollama).toBeLessThan(DEFAULT_TIMEOUTS.openai);

      // Hugging Face should be slowest (free tier model loading)
      expect(DEFAULT_TIMEOUTS.huggingface).toBeGreaterThan(DEFAULT_TIMEOUTS.openai);

      // All timeouts should be between 5s and 2 minutes
      Object.values(DEFAULT_TIMEOUTS).forEach(timeout => {
        expect(timeout).toBeGreaterThanOrEqual(5000);
        expect(timeout).toBeLessThanOrEqual(120000);
      });
    });
  });

  describe('getProviderTimeout', () => {
    it('should return correct timeout for known providers', () => {
      expect(getProviderTimeout('openai')).toBe(DEFAULT_TIMEOUTS.openai);
      expect(getProviderTimeout('anthropic')).toBe(DEFAULT_TIMEOUTS.anthropic);
      expect(getProviderTimeout('ollama')).toBe(DEFAULT_TIMEOUTS.ollama);
    });

    it('should return default timeout for unknown providers', () => {
      expect(getProviderTimeout('unknown-provider')).toBe(DEFAULT_TIMEOUTS.default);
      expect(getProviderTimeout('')).toBe(DEFAULT_TIMEOUTS.default);
      expect(getProviderTimeout(null)).toBe(DEFAULT_TIMEOUTS.default);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      const baseDelay = 1000;
      const multiplier = 2;

      expect(calculateRetryDelay(0, baseDelay, 10000, multiplier)).toBeGreaterThanOrEqual(750); // ~1000 ±25%
      expect(calculateRetryDelay(0, baseDelay, 10000, multiplier)).toBeLessThanOrEqual(1250);

      expect(calculateRetryDelay(1, baseDelay, 10000, multiplier)).toBeGreaterThanOrEqual(1500); // ~2000 ±25%
      expect(calculateRetryDelay(1, baseDelay, 10000, multiplier)).toBeLessThanOrEqual(2500);

      expect(calculateRetryDelay(2, baseDelay, 10000, multiplier)).toBeGreaterThanOrEqual(3000); // ~4000 ±25%
      expect(calculateRetryDelay(2, baseDelay, 10000, multiplier)).toBeLessThanOrEqual(5000);
    });

    it('should respect maximum delay', () => {
      const maxDelay = 5000;
      // Test multiple times to ensure max delay is always respected
      for (let i = 0; i < 20; i++) {
        const delay = calculateRetryDelay(10, 1000, maxDelay, 2);
        // Should never exceed maxDelay, even with jitter
        expect(delay).toBeLessThanOrEqual(maxDelay);
      }
    });

    it('should include jitter for randomization', () => {
      const delays = Array.from({ length: 10 }, () => calculateRetryDelay(1, 1000, 10000, 2));
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1); // Should have variation
    });

    it('should never return negative delays', () => {
      for (let i = 0; i < 10; i++) {
        const delay = calculateRetryDelay(i, 100, 1000, 2);
        expect(delay).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('shouldRetry', () => {
    it('should not retry if max attempts exceeded', () => {
      const error = { response: { status: 500 } };
      expect(shouldRetry(error, RETRY_CONFIG.maxRetries)).toBe(false);
      expect(shouldRetry(error, RETRY_CONFIG.maxRetries + 1)).toBe(false);
    });

    it('should retry on retryable HTTP status codes', () => {
      const retryableStatuses = [429, 500, 502, 503, 504];

      retryableStatuses.forEach(status => {
        const error = { response: { status } };
        expect(shouldRetry(error, 0)).toBe(true);
      });
    });

    it('should not retry on non-retryable HTTP status codes', () => {
      const nonRetryableStatuses = [400, 401, 403, 404, 422];

      nonRetryableStatuses.forEach(status => {
        const error = { response: { status } };
        expect(shouldRetry(error, 0)).toBe(false);
      });
    });

    it('should retry on retryable network errors', () => {
      const retryableErrors = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'];

      retryableErrors.forEach(code => {
        const error = { code };
        expect(shouldRetry(error, 0)).toBe(true);
      });
    });

    it('should retry on timeout errors', () => {
      const timeoutErrors = [
        { message: 'Request timeout' },
        { message: 'Connection ETIMEDOUT' },
        { message: 'Socket timeout' }
      ];

      timeoutErrors.forEach(error => {
        expect(shouldRetry(error, 0)).toBe(true);
      });
    });

    it('should not retry on unknown errors', () => {
      const unknownErrors = [
        { message: 'Unknown error' },
        { code: 'UNKNOWN_CODE' },
        {}
      ];

      unknownErrors.forEach(error => {
        expect(shouldRetry(error, 0)).toBe(false);
      });
    });
  });

  describe('getRetryAfterDelay', () => {
    it('should parse retry-after header as seconds', () => {
      expect(getRetryAfterDelay({ 'retry-after': '60' })).toBe(60000);
      expect(getRetryAfterDelay({ 'Retry-After': '30' })).toBe(30000);
    });

    it('should parse retry-after header as HTTP date', () => {
      const futureDate = new Date(Date.now() + 60000).toUTCString();
      const delay = getRetryAfterDelay({ 'retry-after': futureDate });
      expect(delay).toBeGreaterThan(50000); // Should be close to 60 seconds
      expect(delay).toBeLessThan(70000);
    });

    it('should return null for missing header', () => {
      expect(getRetryAfterDelay({})).toBe(null);
      expect(getRetryAfterDelay({ 'other-header': 'value' })).toBe(null);
    });

    it('should return null for invalid values', () => {
      expect(getRetryAfterDelay({ 'retry-after': 'invalid' })).toBe(null);
      expect(getRetryAfterDelay({ 'retry-after': '' })).toBe(null);
    });

    it('should not return negative delays for past dates', () => {
      const pastDate = new Date(Date.now() - 60000).toUTCString();
      const delay = getRetryAfterDelay({ 'retry-after': pastDate });
      expect(delay).toBeGreaterThanOrEqual(0);
    });
  });

  describe('createAxiosConfig', () => {
    it('should create config with provider-specific timeout', () => {
      const config = createAxiosConfig('openai');
      expect(config.timeout).toBe(DEFAULT_TIMEOUTS.openai);

      const ollamaConfig = createAxiosConfig('ollama');
      expect(ollamaConfig.timeout).toBe(DEFAULT_TIMEOUTS.ollama);
    });

    it('should allow timeout override', () => {
      const customTimeout = 15000;
      const config = createAxiosConfig('openai', { timeout: customTimeout });
      expect(config.timeout).toBe(customTimeout);
    });

    it('should include connection pooling in Node.js environment', () => {
      const config = createAxiosConfig('openai');

      // In Node.js environment, should have agents
      if (typeof window === 'undefined') {
        expect(config.httpAgent).toBeDefined();
        expect(config.httpsAgent).toBeDefined();
      }
    });

    it('should have reasonable default settings', () => {
      const config = createAxiosConfig('openai');

      expect(config.maxRedirects).toBe(3);
      expect(typeof config.validateStatus).toBe('function');

      // validateStatus should not throw on 4xx errors
      expect(config.validateStatus(400)).toBe(true);
      expect(config.validateStatus(404)).toBe(true);
      expect(config.validateStatus(500)).toBe(false);
    });
  });

  describe('RETRY_CONFIG', () => {
    it('should have reasonable retry configuration', () => {
      expect(RETRY_CONFIG.maxRetries).toBeGreaterThan(0);
      expect(RETRY_CONFIG.maxRetries).toBeLessThanOrEqual(5);

      expect(RETRY_CONFIG.baseDelay).toBeGreaterThan(0);
      expect(RETRY_CONFIG.maxDelay).toBeGreaterThan(RETRY_CONFIG.baseDelay);

      expect(RETRY_CONFIG.backoffMultiplier).toBeGreaterThan(1);
      expect(RETRY_CONFIG.backoffMultiplier).toBeLessThanOrEqual(3);
    });

    it('should include common retryable status codes', () => {
      const expectedCodes = [429, 500, 502, 503, 504];
      expectedCodes.forEach(code => {
        expect(RETRY_CONFIG.retryableStatusCodes).toContain(code);
      });
    });

    it('should include common retryable network errors', () => {
      const expectedErrors = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'];
      expectedErrors.forEach(error => {
        expect(RETRY_CONFIG.retryableNetworkErrors).toContain(error);
      });
    });
  });
});
