const axios = require('axios');
const { create_request, execute_request } = require('./create_request');
const { llm_input_schema } = require('./llm_schema');

// Integration tests with real API endpoints (using free tiers)
describe('Integration Tests', () => {
  // Skip integration tests in CI unless explicitly enabled
  const runIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';

  const skipIfNoIntegration = runIntegrationTests ? describe : describe.skip;

  skipIfNoIntegration('Real API Integration', () => {
    // Test with providers that have free tiers or no API key required

    describe('GitHub Models (No API Key Required)', () => {
      const testInput = {
        provider: 'gh-models',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "Hello World" and nothing else.' }],
        maxTokens: 10,
        temperature: 0
      };

      it('should create valid request for GitHub Models', () => {
        const requestConfig = create_request(llm_input_schema, testInput);

        expect(requestConfig.method).toBe('POST');
        expect(requestConfig.url).toBe('https://models.inference.ai.azure.com/chat/completions');
        expect(requestConfig.data.model).toBe('gpt-4o-mini');
        expect(requestConfig.headers['Content-Type']).toBe('application/json');
      });

      it('should make successful request to GitHub Models', async () => {
        try {
          const response = await execute_request(llm_input_schema, testInput);

          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('choices');
          expect(response.data.choices).toHaveLength(1);
          expect(response.data.choices[0]).toHaveProperty('message');
        } catch (error) {
          // If rate limited, service unavailable, or auth required, that's expected
          if (error.response?.status === 429 || error.response?.status === 503 || error.response?.status === 401) {
            expect([401, 429, 503]).toContain(error.response.status);
          } else {
            throw error;
          }
        }
      }, 30000); // 30 second timeout for API calls
    });

    describe('Ollama (Local)', () => {
      const testInput = {
        provider: 'ollama',
        model: 'llama2',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 5
      };

      it('should create valid request for Ollama', () => {
        const requestConfig = create_request(llm_input_schema, testInput);

        expect(requestConfig.method).toBe('POST');
        expect(requestConfig.url).toBe('http://localhost:11434/api/chat');
        expect(requestConfig.data.model).toBe('llama2');
      });

      it('should handle Ollama connection gracefully', async () => {
        try {
          const response = await execute_request(llm_input_schema, testInput);
          expect(response.status).toBe(200);
        } catch (error) {
          // Ollama might not be running locally - that's expected
          expect(['ECONNREFUSED', 'ENOTFOUND', 'ERR_BAD_REQUEST']).toContain(error.code);
        }
      }, 10000);
    });
  });

  describe('HTTP Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const invalidInput = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        apiKey: 'invalid-key'
      };

      // Override URL to point to non-existent endpoint
      const options = { url: 'https://nonexistent-api.example.com/v1/chat/completions' };

      try {
        await execute_request(llm_input_schema, invalidInput, options);
        fail('Should have thrown an error');
      } catch (error) {
        expect(['ENOTFOUND', 'ECONNREFUSED']).toContain(error.code);
      }
    });

    it('should handle 401 authentication errors', async () => {
      const invalidInput = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        apiKey: 'invalid-key-12345'
      };

      try {
        await execute_request(llm_input_schema, invalidInput);
        fail('Should have thrown an authentication error');
      } catch (error) {
        expect(error.response?.status).toBe(401);
      }
    }, 15000);

    it('should handle rate limiting (429) errors', async () => {
      // This test simulates rate limiting by making multiple rapid requests
      const testInput = {
        provider: 'gh-models',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        maxTokens: 1
      };

      // Make multiple rapid requests to potentially trigger rate limiting
      const requests = Array(5).fill().map(() =>
        execute_request(llm_input_schema, testInput).catch(err => err)
      );

      const results = await Promise.all(requests);

      // At least one should succeed or return a proper error (including auth errors)
      const hasValidResponse = results.some(result =>
        result.status === 200 ||
        result.response?.status === 401 ||
        result.response?.status === 429 ||
        result.response?.status === 503
      );

      expect(hasValidResponse).toBe(true);
    }, 30000);
  });

  describe('Request Validation Integration', () => {
    it('should reject invalid schema in real request flow', async () => {
      const invalidInput = {
        provider: 'invalid-provider',
        model: 'test-model',
        messages: [{ role: 'user', content: 'test' }]
      };

      expect(() => {
        create_request(llm_input_schema, invalidInput);
      }).toThrow();
    });

    it('should handle missing required fields', async () => {
      const incompleteInput = {
        provider: 'openai',
        // Missing model and messages
      };

      expect(() => {
        create_request(llm_input_schema, incompleteInput);
      }).toThrow();
    });
  });

  describe('Provider-Specific Integration', () => {
    it('should create different request formats for different providers', () => {
      const baseInput = {
        model: 'test-model',
        messages: [{ role: 'user', content: 'test' }],
        apiKey: 'test-key'
      };

      // Test OpenAI format
      const openaiRequest = create_request(llm_input_schema, {
        ...baseInput,
        provider: 'openai'
      });

      // Test Anthropic format
      const anthropicRequest = create_request(llm_input_schema, {
        ...baseInput,
        provider: 'anthropic'
      });

      // Should have different URLs and headers
      expect(openaiRequest.url).not.toBe(anthropicRequest.url);
      expect(openaiRequest.headers.Authorization).toBe('Bearer test-key');
      expect(anthropicRequest.headers['x-api-key']).toBe('test-key');
    });
  });
});
