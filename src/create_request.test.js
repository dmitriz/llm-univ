const { z } = require('zod');
const { create_request } = require('./create_request');
const { llm_input_schema } = require('./llm_schema');

describe('create_request', () => {
  describe('should convert universal schema to axios request for different providers', () => {
    it('should create OpenAI-compatible request', () => {
      const inputData = {
        provider: 'openai',
        apiKey: 'sk-test123',
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        maxTokens: 1000,
        temperature: 0.7,
        stream: false
      };

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        data: inputData, // The function should validate and pass through the data
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${inputData.apiKey}`
        }
      });
    });

    it('should create Anthropic-compatible request', () => {
      const inputData = {
        provider: 'anthropic',
        apiKey: 'sk-ant-test123',
        model: 'claude-3-sonnet-20240229',
        messages: [
          { role: 'user', content: 'Hello Claude!' }
        ],
        maxTokens: 1024,
        temperature: 0.5
      };

      const options = {
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST'
      };

      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages',
        data: inputData,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': inputData.apiKey,
          'anthropic-version': '2023-06-01'
        }
      });
    });

    it('should create Azure OpenAI-compatible request', () => {
      const inputData = {
        provider: 'azure-openai',
        apiKey: 'azure-test-key',
        model: 'gpt-35-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is the weather like?' }
        ],
        maxTokens: 500,
        temperature: 0.3
      };

      const options = {
        url: 'https://your-resource.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-12-01-preview',
        method: 'POST'
      };

      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: options.url,
        data: inputData,
        headers: {
          'Content-Type': 'application/json',
          'api-key': inputData.apiKey
        }
      });
    });
  });

  describe('should validate input against schema', () => {
    it('should throw error for invalid provider', () => {
      const invalidData = {
        provider: 'invalid-provider',
        apiKey: 'test-key',
        model: 'test-model',
        messages: [{ role: 'user', content: 'test' }]
      };

      const options = { url: 'https://api.test.com' };

      expect(() => {
        create_request(llm_input_schema, invalidData, options);
      }).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidData = {
        provider: 'openai',
        // Missing apiKey, model, and messages
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      expect(() => {
        create_request(llm_input_schema, invalidData, options);
      }).toThrow();
    });

    it('should throw error for invalid message structure', () => {
      const invalidData = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        messages: [
          { role: 'invalid-role', content: 'test' } // Invalid role
        ]
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      expect(() => {
        create_request(llm_input_schema, invalidData, options);
      }).toThrow();
    });

    it('should throw error for invalid parameter ranges', () => {
      const invalidData = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 3.0 // Invalid: above max of 2.0
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      expect(() => {
        create_request(llm_input_schema, invalidData, options);
      }).toThrow();
    });
  });

  describe('should handle optional parameters correctly', () => {
    it('should work with minimal required parameters', () => {
      const minimalData = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      const requestConfig = create_request(llm_input_schema, minimalData, options);

      expect(requestConfig.data).toEqual(minimalData);
      expect(requestConfig.method).toBe('POST'); // Default method
    });

    it('should include all optional parameters when provided', () => {
      const fullData = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hello' }
        ],
        maxTokens: 2000,
        temperature: 0.8,
        topP: 0.9,
        stream: true,
        stop: ['\\n', 'END'],
        presencePenalty: 0.1,
        frequencyPenalty: -0.1,
        tools: [{
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get current weather',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' }
              }
            }
          }
        }],
        responseFormat: { type: 'json_object' },
        user: 'user123',
        seed: 42
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      const requestConfig = create_request(llm_input_schema, fullData, options);

      expect(requestConfig.data).toEqual(fullData);
    });
  });

  describe('should handle different message types and tools', () => {
    it('should validate tool calling schema', () => {
      const dataWithTools = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'What is the weather?' }],
        tools: [{
          type: 'function',
          function: {
            name: 'get_current_weather',
            description: 'Get the current weather in a given location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state, e.g. San Francisco, CA'
                },
                unit: {
                  type: 'string',
                  enum: ['celsius', 'fahrenheit']
                }
              },
              required: ['location']
            }
          }
        }]
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      expect(() => {
        create_request(llm_input_schema, dataWithTools, options);
      }).not.toThrow();
    });

    it('should validate complex message thread', () => {
      const conversationData = {
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-sonnet-20240229',
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant.' },
          { role: 'user', content: 'Can you help me write a function?' },
          { role: 'assistant', content: 'Of course! What kind of function do you need?' },
          { role: 'user', content: 'A function to calculate fibonacci numbers.' }
        ],
        maxTokens: 1500,
        temperature: 0.2
      };

      const options = { url: 'https://api.anthropic.com/v1/messages' };

      expect(() => {
        create_request(llm_input_schema, conversationData, options);
      }).not.toThrow();
    });
  });

  describe('should handle edge cases', () => {
    it('should handle empty optional arrays', () => {
      const dataWithEmptyTools = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [] // Empty array should be valid
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      expect(() => {
        create_request(llm_input_schema, dataWithEmptyTools, options);
      }).not.toThrow();
    });

    it('should handle string and array stop sequences', () => {
      const dataWithStringStop = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        stop: '\\n' // Single string
      };

      const dataWithArrayStop = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        stop: ['\\n', 'END', 'STOP'] // Array of strings
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      expect(() => {
        create_request(llm_input_schema, dataWithStringStop, options);
      }).not.toThrow();

      expect(() => {
        create_request(llm_input_schema, dataWithArrayStop, options);
      }).not.toThrow();
    });
  });
});
