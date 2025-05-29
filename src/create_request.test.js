const { z } = require('zod');
const { create_request } = require('./create_request');

// Define the universal LLM input schema as a constant
const LLM_INPUT_SCHEMA = z.object({
  // Universal provider field
  provider: z.enum(['openai', 'anthropic', 'google', 'azure_openai']),
  
  // Authentication
  api_key: z.string(),
  
  // Model configuration
  model: z.string(),
  
  // Messages (OpenAI/Anthropic style)
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string()
  })),
  
  // Common parameters across providers
  max_tokens: z.number().min(1).max(100000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  stream: z.boolean().optional(),
  
  // Optional parameters
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  
  // Tool/function calling support
  tools: z.array(z.object({
    type: z.literal('function'),
    function: z.object({
      name: z.string(),
      description: z.string().optional(),
      parameters: z.record(z.unknown()).optional()
    })
  })).optional(),
  
  // Response format
  response_format: z.object({
    type: z.enum(['text', 'json_object'])
  }).optional(),
  
  // Additional metadata
  user: z.string().optional(),
  seed: z.number().optional()
});

describe('create_request', () => {

  describe('should convert universal schema to axios request for different providers', () => {
    it('should create OpenAI-compatible request', () => {
      const input_data = {
        provider: 'openai',
        api_key: 'sk-test123',
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      };

      const options = {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST'
      };

      const request_config = create_request(LLM_INPUT_SCHEMA, input_data, options);

      expect(request_config).toEqual({
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        data: input_data, // The function should validate and pass through the data
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${input_data.api_key}`
        }
      });
    });

    it('should create Anthropic-compatible request', () => {
      const input_data = {
        provider: 'anthropic',
        api_key: 'sk-ant-test123',
        model: 'claude-3-sonnet-20240229',
        messages: [
          { role: 'user', content: 'Hello Claude!' }
        ],
        max_tokens: 1024,
        temperature: 0.5
      };

      const options = {
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST'
      };

      const request_config = create_request(llm_input_schema, input_data, options);

      expect(request_config).toEqual({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages',
        data: input_data,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': input_data.api_key,
          'anthropic-version': '2023-06-01'
        }
      });
    });

    it('should create Azure OpenAI-compatible request', () => {
      const input_data = {
        provider: 'azure-openai',
        api_key: 'azure-test-key',
        model: 'gpt-35-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is the weather like?' }
        ],
        max_tokens: 500,
        temperature: 0.3
      };

      const options = {
        url: 'https://your-resource.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-12-01-preview',
        method: 'POST'
      };

      const request_config = create_request(llm_input_schema, input_data, options);

      expect(request_config).toEqual({
        method: 'POST',
        url: options.url,
        data: input_data,
        headers: {
          'Content-Type': 'application/json',
          'api-key': input_data.api_key
        }
      });
    });
  });

  describe('should validate input against schema', () => {
    it('should throw error for invalid provider', () => {
      const invalidData = {
        provider: 'invalid-provider',
        api_key: 'test-key',
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
        // Missing api_key, model, and messages
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      expect(() => {
        create_request(llm_input_schema, invalidData, options);
      }).toThrow();
    });

    it('should throw error for invalid message structure', () => {
      const invalidData = {
        provider: 'openai',
        api_key: 'test-key',
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
        api_key: 'test-key',
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
        api_key: 'test-key',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      const request_config = create_request(llm_input_schema, minimalData, options);

      expect(request_config.data).toEqual(minimalData);
      expect(request_config.method).toBe('POST'); // Default method
    });

    it('should include all optional parameters when provided', () => {
      const fullData = {
        provider: 'openai',
        api_key: 'test-key',
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 2000,
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

      const request_config = create_request(llm_input_schema, fullData, options);

      expect(request_config.data).toEqual(fullData);
    });
  });

  describe('should handle different message types and tools', () => {
    it('should validate tool calling schema', () => {
      const dataWithTools = {
        provider: 'openai',
        api_key: 'test-key',
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
        api_key: 'test-key',
        model: 'claude-3-sonnet-20240229',
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant.' },
          { role: 'user', content: 'Can you help me write a function?' },
          { role: 'assistant', content: 'Of course! What kind of function do you need?' },
          { role: 'user', content: 'A function to calculate fibonacci numbers.' }
        ],
        max_tokens: 1500,
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
        api_key: 'test-key',
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
        api_key: 'test-key',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        stop: '\\n' // Single string
      };

      const dataWithArrayStop = {
        provider: 'openai',
        api_key: 'test-key',
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
