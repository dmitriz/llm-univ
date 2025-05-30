const {
  BASE_URLS,
  CHAT_ENDPOINTS,
  MODEL_ENDPOINTS,
  BATCH_ENDPOINTS,
  PUBLIC_ENDPOINTS,
  getChatEndpoint,
  getModelEndpoint,
  getBatchEndpoint,
  getHuggingFaceUrl
} = require('./url_config');

describe('URL Configuration', () => {
  describe('Base URLs', () => {
    it('should have valid base URLs for all providers', () => {
      const expectedProviders = [
        'openai', 'anthropic', 'google', 'gh-models', 'huggingface',
        'together', 'perplexity', 'deepseek', 'qwen', 'siliconflow',
        'grok', 'groq', 'openrouter', 'ollama'
      ];

      expectedProviders.forEach(provider => {
        expect(BASE_URLS[provider]).toBeDefined();
        expect(typeof BASE_URLS[provider]).toBe('string');

        if (provider !== 'ollama') { // ollama uses localhost
          expect(BASE_URLS[provider]).toMatch(/^https:\/\//);
        }
      });
    });

    it('should have correct base URLs for major providers', () => {
      expect(BASE_URLS.openai).toBe('https://api.openai.com');
      expect(BASE_URLS.anthropic).toBe('https://api.anthropic.com');
      expect(BASE_URLS.google).toBe('https://generativelanguage.googleapis.com');
      expect(BASE_URLS.groq).toBe('https://api.groq.com');
    });
  });

  describe('Chat Endpoints', () => {
    it('should have chat endpoints for all providers', () => {
      Object.keys(BASE_URLS).forEach(provider => {
        expect(CHAT_ENDPOINTS[provider]).toBeDefined();
        expect(typeof CHAT_ENDPOINTS[provider]).toBe('string');

        // Hugging Face uses empty endpoint (special case)
        if (provider !== 'huggingface') {
          expect(CHAT_ENDPOINTS[provider]).toMatch(/^\//); // Should start with /
        }
      });
    });

    it('should have correct chat endpoints for major providers', () => {
      expect(CHAT_ENDPOINTS.openai).toBe('/v1/chat/completions');
      expect(CHAT_ENDPOINTS.anthropic).toBe('/v1/messages');
      expect(CHAT_ENDPOINTS.groq).toBe('/openai/v1/chat/completions');
    });
  });

  describe('Model Endpoints', () => {
    it('should have model endpoints for all providers', () => {
      Object.keys(BASE_URLS).forEach(provider => {
        expect(MODEL_ENDPOINTS[provider]).toBeDefined();
        expect(typeof MODEL_ENDPOINTS[provider]).toBe('string');
      });
    });

    it('should have correct model endpoints', () => {
      expect(MODEL_ENDPOINTS.openai).toBe('/v1/models');
      expect(MODEL_ENDPOINTS.anthropic).toBe('/v1/models');
      expect(MODEL_ENDPOINTS.ollama).toBe('/api/tags');
    });
  });

  describe('Batch Endpoints', () => {
    it('should have batch endpoints for supported providers', () => {
      const batchProviders = ['openai', 'anthropic', 'together', 'groq', 'siliconflow'];

      batchProviders.forEach(provider => {
        expect(BATCH_ENDPOINTS[provider]).toBeDefined();
        expect(typeof BATCH_ENDPOINTS[provider]).toBe('string');
        expect(BATCH_ENDPOINTS[provider]).toMatch(/^\//);
      });
    });

    it('should have correct batch endpoints', () => {
      expect(BATCH_ENDPOINTS.openai).toBe('/v1/batches');
      expect(BATCH_ENDPOINTS.anthropic).toBe('/v1/messages/batches');
      expect(BATCH_ENDPOINTS.groq).toBe('/openai/v1/batches');
    });
  });

  describe('Public Endpoints', () => {
    it('should have public endpoints for information gathering', () => {
      Object.keys(PUBLIC_ENDPOINTS).forEach(provider => {
        const endpoints = PUBLIC_ENDPOINTS[provider];
        expect(typeof endpoints).toBe('object');

        // Should have at least one endpoint
        const endpointKeys = Object.keys(endpoints);
        expect(endpointKeys.length).toBeGreaterThan(0);

        // All endpoints should be valid URLs
        Object.values(endpoints).forEach(url => {
          expect(url).toMatch(/^https?:\/\//);
        });
      });
    });
  });

  describe('getChatEndpoint', () => {
    it('should return correct full chat URLs', () => {
      expect(getChatEndpoint('openai')).toBe('https://api.openai.com/v1/chat/completions');
      expect(getChatEndpoint('anthropic')).toBe('https://api.anthropic.com/v1/messages');
      expect(getChatEndpoint('groq')).toBe('https://api.groq.com/openai/v1/chat/completions');
    });

    it('should handle unknown providers gracefully', () => {
      expect(() => getChatEndpoint('unknown-provider')).not.toThrow();
    });
  });

  describe('getModelEndpoint', () => {
    it('should return correct full model URLs', () => {
      expect(getModelEndpoint('openai')).toBe('https://api.openai.com/v1/models');
      expect(getModelEndpoint('anthropic')).toBe('https://api.anthropic.com/v1/models');
      expect(getModelEndpoint('ollama')).toBe('http://localhost:11434/api/tags');
    });

    it('should handle unknown providers gracefully', () => {
      expect(() => getModelEndpoint('unknown-provider')).not.toThrow();
    });
  });

  describe('getBatchEndpoint', () => {
    it('should return correct full batch URLs', () => {
      expect(getBatchEndpoint('openai')).toBe('https://api.openai.com/v1/batches');
      expect(getBatchEndpoint('anthropic')).toBe('https://api.anthropic.com/v1/messages/batches');
      expect(getBatchEndpoint('groq')).toBe('https://api.groq.com/openai/v1/batches');
    });

    it('should handle providers without batch support', () => {
      expect(() => getBatchEndpoint('ollama')).not.toThrow();
    });
  });

  describe('getHuggingFaceUrl', () => {
    it('should construct correct Hugging Face model URLs', () => {
      const modelName = 'microsoft/DialoGPT-medium';
      const expectedUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

      expect(getHuggingFaceUrl(modelName)).toBe(expectedUrl);
    });

    it('should handle model names with special characters', () => {
      const modelName = 'meta-llama/Llama-2-7b-chat-hf';
      const result = getHuggingFaceUrl(modelName);

      expect(result).toContain('meta-llama/Llama-2-7b-chat-hf');
      expect(result).toMatch(/^https:\/\//);
    });

    it('should handle empty model names', () => {
      expect(() => getHuggingFaceUrl('')).not.toThrow();
      expect(getHuggingFaceUrl('')).toBe('https://api-inference.huggingface.co/models/');
    });
  });

  describe('URL Structure Validation', () => {
    it('should have consistent URL structures', () => {
      // All base URLs should not end with slash
      Object.values(BASE_URLS).forEach(url => {
        expect(url).not.toMatch(/\/$/);
      });

      // All endpoint paths should start with slash (except huggingface)
      Object.values(CHAT_ENDPOINTS).forEach(endpoint => {
        if (endpoint !== '') { // huggingface has empty endpoint
          expect(endpoint).toMatch(/^\//);
        }
      });

      Object.values(MODEL_ENDPOINTS).forEach(endpoint => {
        if (endpoint !== '') { // huggingface has empty endpoint
          expect(endpoint).toMatch(/^\//);
        }
      });
    });

    it('should construct valid complete URLs', () => {
      Object.keys(BASE_URLS).forEach(provider => {
        const chatUrl = getChatEndpoint(provider);
        const modelUrl = getModelEndpoint(provider);

        expect(chatUrl).toMatch(/^https?:\/\//);
        expect(modelUrl).toMatch(/^https?:\/\//);

        // Should not have double slashes (except after protocol)
        expect(chatUrl.replace(/^https?:\/\//, '')).not.toContain('//');
        expect(modelUrl.replace(/^https?:\/\//, '')).not.toContain('//');
      });
    });
  });

  describe('Provider Coverage', () => {
    it('should have complete configuration for all providers', () => {
      const allProviders = Object.keys(BASE_URLS);

      allProviders.forEach(provider => {
        // Every provider should have base URL and chat endpoint
        expect(BASE_URLS[provider]).toBeDefined();
        expect(CHAT_ENDPOINTS[provider]).toBeDefined();
        expect(MODEL_ENDPOINTS[provider]).toBeDefined();

        // Public endpoints should exist for information gathering
        expect(PUBLIC_ENDPOINTS[provider]).toBeDefined();
      });
    });

    it('should maintain consistency between configurations', () => {
      const baseProviders = Object.keys(BASE_URLS);
      const chatProviders = Object.keys(CHAT_ENDPOINTS);
      const modelProviders = Object.keys(MODEL_ENDPOINTS);

      expect(baseProviders.sort()).toEqual(chatProviders.sort());
      expect(baseProviders.sort()).toEqual(modelProviders.sort());
    });
  });
});
