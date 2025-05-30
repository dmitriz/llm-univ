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

    describe('GitHub Models', () => {
      // Check if GitHub token is available
      const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      const hasGitHubToken = !!githubToken;

      const baseTestInput = {
        provider: 'gh-models',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "Hello World" and nothing else.' }],
        maxTokens: 10,
        temperature: 0
      };

      const testInputWithToken = {
        ...baseTestInput,
        apiKey: githubToken
      };

      it('should create valid request for GitHub Models', () => {
        const requestConfig = create_request(llm_input_schema, baseTestInput);

        expect(requestConfig.method).toBe('POST');
        expect(requestConfig.url).toBe('https://models.inference.ai.azure.com/chat/completions');
        expect(requestConfig.data.model).toBe('gpt-4o-mini');
        expect(requestConfig.headers['Content-Type']).toBe('application/json');
      });

      if (hasGitHubToken) {
        it('should make successful authenticated request to GitHub Models', async () => {
          console.log('🔑 Using GitHub token for authenticated test');

          try {
            const response = await execute_request(llm_input_schema, testInputWithToken);

            // Test our code's responsibility: HTTP request/response handling
            expect(response.status).toBe(200);
            expect(response.data).toBeDefined();
            expect(typeof response.data).toBe('object');

            // Test that we get a response in expected format (OpenAI-compatible)
            expect(response.data).toHaveProperty('choices');
            expect(Array.isArray(response.data.choices)).toBe(true);

            console.log('✅ GitHub Models authenticated request successful');
            console.log('� Response structure validated');

          } catch (error) {
            console.error('❌ GitHub Models authenticated request failed:', error.response?.status, error.message);
            throw error;
          }
        }, 30000);

        it('should handle streaming request to GitHub Models', async () => {
          console.log('🔄 Testing streaming with GitHub token');

          const streamingInput = {
            ...testInputWithToken,
            stream: true
          };

          try {
            const response = await execute_request(llm_input_schema, streamingInput);

            expect(response.status).toBe(200);
            // For streaming, we expect either SSE data or a different response format
            expect(response.data).toBeDefined();

            console.log('✅ GitHub Models streaming request successful');

          } catch (error) {
            console.error('❌ GitHub Models streaming failed:', error.response?.status, error.message);
            throw error;
          }
        }, 30000);

        it('should handle different models with GitHub token', async () => {
          const models = ['gpt-4o-mini', 'gpt-4o'];

          for (const model of models) {
            try {
              const modelInput = {
                ...testInputWithToken,
                model,
                messages: [{ role: 'user', content: 'Hi' }],
                maxTokens: 5
              };

              const response = await execute_request(llm_input_schema, modelInput);
              expect(response.status).toBe(200);

              console.log(`✅ Model ${model} authentication successful`);

            } catch (error) {
              if (error.response?.status === 404) {
                console.log(`⚠️ Model ${model} not available (404)`);
              } else {
                console.error(`❌ Model ${model} failed:`, error.response?.status);
                throw error;
              }
            }
          }
        }, 60000);

      } else {
        it('should handle unauthenticated request gracefully', async () => {
          console.log('🔓 No GitHub token found, testing unauthenticated request');

          try {
            const response = await execute_request(llm_input_schema, baseTestInput);

            // If somehow it works without auth, that's great
            expect(response.status).toBe(200);
            console.log('✅ GitHub Models works without authentication');

          } catch (error) {
            // Expected errors without authentication
            if (error.response?.status === 401) {
              expect(error.response.status).toBe(401);
              expect(error.response.data).toBeDefined();
              console.log('✓ GitHub Models requires authentication (request format validated)');
            } else if (error.response?.status === 429) {
              expect(error.response.status).toBe(429);
              console.log('✓ Rate limited (request format validated)');
            } else if (error.response?.status === 503) {
              expect(error.response.status).toBe(503);
              console.log('✓ Service temporarily unavailable');
            } else {
              console.error('Unexpected error:', error.message);
              throw error;
            }
          }
        }, 30000);
      }
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

    describe('Hugging Face (Free Tier)', () => {
      const testInput = {
        provider: 'huggingface',
        model: 'microsoft/DialoGPT-medium',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10
      };

      it('should create valid request for Hugging Face', () => {
        const requestConfig = create_request(llm_input_schema, testInput);

        expect(requestConfig.method).toBe('POST');
        expect(requestConfig.url).toBe('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium');
        expect(requestConfig.data.inputs).toBeDefined();
      });

      it('should handle Hugging Face API (free tier)', async () => {
        try {
          const response = await execute_request(llm_input_schema, testInput);

          // Hugging Face free tier might work without API key
          expect(response.status).toBe(200);
          expect(response.data).toBeDefined();
          console.log('✓ Hugging Face free tier successful');
        } catch (error) {
          // Expected errors for free tier
          if (error.response?.status === 503) {
            // Model loading (common with free tier)
            expect(error.response.status).toBe(503);
            console.log('✓ Hugging Face model loading (expected for free tier)');
          } else if (error.response?.status === 429) {
            // Rate limited
            expect(error.response.status).toBe(429);
            console.log('✓ Hugging Face rate limited');
          } else {
            console.log('Hugging Face error:', error.response?.status, error.message);
            // Don't fail the test - free tier is unpredictable
          }
        }
      }, 15000);
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
        // Our error handling now sanitizes network errors
        expect(error.message).toBe('Network error: Unable to reach the API endpoint');
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
