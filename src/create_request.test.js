const { z } = require('zod');
const { create_request, extract_api_payload } = require('./create_request');
const { llm_input_schema } = require('./llm_schema');

// Base API payload (what gets sent to APIs) - now in correct snake_case format
const basePayload = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello, how are you?' }],
  max_tokens: 1000,
  temperature: 0.7,
  stream: false
};

// Base payload with API key (what we pass to create_request) - still in camelCase for internal use
const baseWithApiKey = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello, how are you?' }],
  maxTokens: 1000,
  temperature: 0.7,
  stream: false,
  apiKey: 'test-key-123'
};

describe('create_request', () => {
  describe('should convert universal schema to axios request for different providers', () => {
    it('should create OpenAI-compatible request', () => {
      const requestConfig = create_request(llm_input_schema, { ...baseWithApiKey, provider: 'openai' });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        data: basePayload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key-123'
        }
      });
    });

    it('should create Anthropic-compatible request', () => {
      const requestConfig = create_request(llm_input_schema, { 
        ...baseWithApiKey, 
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229'
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages',
        data: {
          ...basePayload,
          model: 'claude-3-sonnet-20240229'
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-key-123',
          'anthropic-version': '2025-05-22'
        }
      });
    });

    it('should create GitHub Models-compatible request (without API key)', () => {
      const requestConfig = create_request(llm_input_schema, {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
        maxTokens: 1000,
        temperature: 0.7,
        stream: false,
        provider: 'gh-models'
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://models.inference.ai.azure.com/chat/completions',
        data: basePayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('should create Hugging Face-compatible request (with API key)', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'huggingface',
        model: 'gpt-4'  // Using the model from basePayload
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api-inference.huggingface.co/models/gpt-4',
        data: basePayload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key-123'
        }
      });
    });

    it('should create DeepSeek-compatible request', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'deepseek',
        model: 'deepseek-chat'
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.deepseek.com/chat/completions',
        data: {
          ...basePayload,
          model: 'deepseek-chat'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key-123'
        }
      });
    });

    it('should create Qwen-compatible request', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'qwen',
        model: 'qwen-plus'
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        data: {
          ...basePayload,
          model: 'qwen-plus'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key-123'
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

      expect(() => {
        create_request(llm_input_schema, invalidData);
      }).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidData = {
        provider: 'openai',
        // Missing model and messages (apiKey is now optional)
      };

      expect(() => {
        create_request(llm_input_schema, invalidData);
      }).toThrow();
    });

    it('should work without API key for providers that support it', () => {
      expect(() => {
        create_request(llm_input_schema, {
          ...basePayload,
          provider: 'gh-models'
        });
      }).not.toThrow();

      expect(() => {
        create_request(llm_input_schema, {
          ...basePayload,
          provider: 'ollama'
        });
      }).not.toThrow();
    });

    it('should throw error for invalid message structure', () => {
      expect(() => {
        create_request(llm_input_schema, {
          ...baseWithApiKey,
          provider: 'openai',
          messages: [
            { role: 'invalid-role', content: 'test' } // Invalid role
          ]
        });
      }).toThrow();
    });

    it('should throw error for invalid parameter ranges', () => {
      expect(() => {
        create_request(llm_input_schema, {
          ...baseWithApiKey,
          provider: 'openai',
          temperature: 3.0 // Invalid: above max of 2.0
        });
      }).toThrow();
    });
  });

  describe('should handle optional parameters correctly', () => {
    it('should work with minimal required parameters', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'openai'
      });

      expect(requestConfig.data).toEqual(basePayload);
      expect(requestConfig.method).toBe('POST'); // Default method
    });

    it('should include all optional parameters when provided', () => {
      const fullRequestData = {
        ...baseWithApiKey,
        provider: 'openai',
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
        seed: 42
      };

      const requestConfig = create_request(llm_input_schema, fullRequestData);

      // Expected payload with snake_case keys (as API expects)
      const expectedFullPayload = {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 2000,
        temperature: 0.8,
        top_p: 0.9,
        stream: true,
        stop: ['\\n', 'END'],
        presence_penalty: 0.1,
        frequency_penalty: -0.1,
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
        response_format: { type: 'json_object' },
        seed: 42
      };
      expect(requestConfig.data).toEqual(expectedFullPayload);
    });
  });

  describe('should handle different message types and tools', () => {
    it('should validate tool calling schema', () => {
      expect(() => {
        create_request(llm_input_schema, {
          ...baseWithApiKey,
          provider: 'openai',
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
        });
      }).not.toThrow();
    });

    it('should validate complex message thread', () => {
      expect(() => {
        create_request(llm_input_schema, {
          ...baseWithApiKey,
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          messages: [
            { role: 'system', content: 'You are a helpful coding assistant.' },
            { role: 'user', content: 'Can you help me write a function?' },
            { role: 'assistant', content: 'Of course! What kind of function do you need?' },
            { role: 'user', content: 'A function to calculate fibonacci numbers.' }
          ],
          maxTokens: 1500,
          temperature: 0.2
        });
      }).not.toThrow();
    });
  });

  describe('should handle edge cases', () => {
    it('should handle empty optional arrays', () => {
      expect(() => {
        create_request(llm_input_schema, {
          ...baseWithApiKey,
          provider: 'openai',
          tools: [] // Empty array should be valid
        });
      }).not.toThrow();
    });

    it('should handle string and array stop sequences', () => {
      expect(() => {
        create_request(llm_input_schema, {
          ...baseWithApiKey,
          provider: 'openai',
          stop: '\\n' // Single string
        });
      }).not.toThrow();

      expect(() => {
        create_request(llm_input_schema, {
          ...baseWithApiKey,
          provider: 'openai',
          stop: ['\\n', 'END', 'STOP'] // Array of strings
        });
      }).not.toThrow();
    });
  });

  describe('should handle batch processing for supported providers', () => {
    it('should create OpenAI batch request', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'openai',
        batch: {
          enabled: true,
          inputFileId: 'file-abc123',
          completionWindow: '24h',
          metadata: { project: 'test' }
        }
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.openai.com/v1/batches',
        data: {
          input_file_id: 'file-abc123',
          endpoint: 'https://api.openai.com/v1/chat/completions',
          completion_window: '24h',
          metadata: { project: 'test' }
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key-123'
        }
      });
    });

    it('should create Anthropic batch request', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        batch: {
          enabled: true,
          inputFileId: 'file-xyz789',
          completionWindow: '24h'
        }
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages/batches',
        data: {
          requests: [{
            custom_id: expect.any(String),
            params: {
              model: 'claude-3-sonnet-20240229',
              max_tokens: 1000, // From basePayload
              messages: [{ role: 'user', content: 'Hello, how are you?' }], // From basePayload
              temperature: 0.7 // From basePayload
            }
          }]
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-key-123',
          'anthropic-version': '2025-05-22',
          'anthropic-beta': 'message-batches-2024-09-24'
        }
      });
    });

    it('should create Groq batch request', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'groq',
        model: 'mixtral-8x7b-32768',
        batch: {
          enabled: true,
          inputFileId: 'file-groq123',
          completionWindow: '24h'
        }
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/batches',
        data: {
          input_file_id: 'file-groq123',
          endpoint: 'https://api.groq.com/openai/v1/chat/completions',
          completion_window: '24h'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key-123'
        }
      });
    });

    it('should create SiliconFlow batch request', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'siliconflow',
        model: 'Qwen/Qwen2-72B-Instruct',
        apiKey: 'sk-silicon123',
        batch: {
          enabled: true,
          inputFileId: 'file-silicon456',
          completionWindow: '24h',
          metadata: { environment: 'test' }
        }
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.siliconflow.cn/v1/batches',
        data: {
          input_file_id: 'file-silicon456',
          endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
          completion_window: '24h',
          metadata: { environment: 'test' }
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-silicon123'
        }
      });
    });

    it('should create SiliconFlow batch request with minimal parameters', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'siliconflow',
        model: 'Qwen/Qwen2-72B-Instruct',
        apiKey: 'sk-silicon789',
        batch: {
          enabled: true,
          inputFileId: 'file-silicon-minimal'
        }
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.siliconflow.cn/v1/batches',
        data: {
          input_file_id: 'file-silicon-minimal',
          endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
          completion_window: '24h'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-silicon789'
        }
      });
    });

    it('should create Together AI batch request', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'together',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        apiKey: 'together_test123',
        batch: {
          enabled: true
        }
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.together.xyz/v1/batches',
        data: {
          requests: [{
            customId: expect.any(String),
            model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
            maxTokens: 1000, // From basePayload
            messages: [{ role: 'user', content: 'Hello, how are you?' }], // From basePayload
            temperature: 0.7 // From basePayload
          }],
          batchSize: 10, // Default value
          timeout: 300    // Default value
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer together_test123'
        }
      });
    });

    it('should create Together AI batch request with custom batch size and timeout', () => {
      const requestConfig = create_request(llm_input_schema, {
        ...baseWithApiKey,
        provider: 'together',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        apiKey: 'together_test123',
        batch: {
          enabled: true,
          batchSize: 20,
          timeout: 500
        }
      });

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.together.xyz/v1/batches',
        data: {
          requests: [{
            customId: expect.any(String),
            model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
            maxTokens: 1000, // From basePayload
            messages: [{ role: 'user', content: 'Hello, how are you?' }], // From basePayload
            temperature: 0.7 // From basePayload
          }],
          batchSize: 20,
          timeout: 500
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer together_test123'
        }
      });
    });
    it('should create Anthropic batch request with explicit requests array', () => {
      const inputData = {
        provider: 'anthropic',
        apiKey: 'sk-ant-test123',
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: 'Fallback message' }],
        batch: {
          enabled: true,
          requests: [
            {
              customId: 'req-001',
              model: 'claude-3-sonnet-20240229',
              messages: [{ role: 'user', content: 'First request' }],
              maxTokens: 500,
              temperature: 0.7
            },
            {
              customId: 'req-002',
              model: 'claude-3-sonnet-20240229',
              messages: [{ role: 'user', content: 'Second request' }],
              maxTokens: 1000,
              temperature: 0.3
            }
          ]
        }
      };

      const options = { url: 'https://api.anthropic.com/v1/messages/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages/batches',
        data: {
          requests: [
            {
              customId: 'req-001',
              model: 'claude-3-sonnet-20240229',
              messages: [{ role: 'user', content: 'First request' }],
              maxTokens: 500,
              temperature: 0.7
            },
            {
              customId: 'req-002',
              model: 'claude-3-sonnet-20240229',
              messages: [{ role: 'user', content: 'Second request' }],
              maxTokens: 1000,
              temperature: 0.3
            }
          ]
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-ant-test123',
          'anthropic-version': '2025-05-22',
          'anthropic-beta': 'message-batches-2024-09-24'
        }
      });
    });

    it('should create Together AI batch request with explicit requests array', () => {
      const inputData = {
        provider: 'together',
        apiKey: 'together_test123',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [{ role: 'user', content: 'Fallback message' }],
        batch: {
          enabled: true,
          batchSize: 5,
          timeout: 600,
          requests: [
            {
              customId: 'together-001',
              model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
              messages: [{ role: 'user', content: 'Process this text' }],
              maxTokens: 200
            },
            {
              customId: 'together-002',
              model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
              messages: [{ role: 'user', content: 'Analyze this data' }],
              maxTokens: 300,
              temperature: 0.5
            }
          ]
        }
      };

      const options = { url: 'https://api.together.xyz/v1/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.together.xyz/v1/batches',
        data: {
          requests: [
            {
              customId: 'together-001',
              model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
              messages: [{ role: 'user', content: 'Process this text' }],
              maxTokens: 200
            },
            {
              customId: 'together-002',
              model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
              messages: [{ role: 'user', content: 'Analyze this data' }],
              maxTokens: 300,
              temperature: 0.5
            }
          ],
          batchSize: 5,
          timeout: 600
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer together_test123'
        }
      });
    });
  });

  describe('should validate batch processing requirements', () => {
    it('should throw error when SiliconFlow batch lacks inputFileId', () => {
      const inputData = {
        provider: 'siliconflow',
        apiKey: 'sk-silicon123',
        model: 'Qwen/Qwen2-72B-Instruct',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true
          // Missing inputFileId
        }
      };

      const options = { url: 'https://api.siliconflow.cn/v1/batches' };

      expect(() => {
        create_request(llm_input_schema, inputData, options);
      }).toThrow('Siliconflow batch processing requires inputFileId');
    });

    it('should throw error when OpenAI batch lacks inputFileId', () => {
      const inputData = {
        provider: 'openai',
        apiKey: 'sk-test123',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true
          // Missing inputFileId
        }
      };

      const options = { url: 'https://api.openai.com/v1/batches' };

      expect(() => {
        create_request(llm_input_schema, inputData, options);
      }).toThrow('Openai batch processing requires inputFileId');
    });

    it('should throw error when Groq batch lacks inputFileId', () => {
      const inputData = {
        provider: 'groq',
        apiKey: 'gsk_test123',
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true
          // Missing inputFileId
        }
      };

      const options = { url: 'https://api.groq.com/openai/v1/batches' };

      expect(() => {
        create_request(llm_input_schema, inputData, options);
      }).toThrow('Groq batch processing requires inputFileId');
    });

    it('should allow Together AI batch without inputFileId (uses fallback)', () => {
      const inputData = {
        provider: 'together',
        apiKey: 'together_test123',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true
          // No inputFileId or requests - should use fallback
        }
      };

      const options = { url: 'https://api.together.xyz/v1/batches' };

      expect(() => {
        create_request(llm_input_schema, inputData, options);
      }).not.toThrow();
    });

    it('should allow Anthropic batch without explicit requests (uses fallback)', () => {
      const inputData = {
        provider: 'anthropic',
        apiKey: 'sk-ant-test123',
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true
          // No explicit requests - should use fallback
        }
      };

      const options = { url: 'https://api.anthropic.com/v1/messages/batches' };

      expect(() => {
        create_request(llm_input_schema, inputData, options);
      }).not.toThrow();
    });
  });

  describe('should warn and strip metadata for Together AI (unsupported)', () => {
    it('should warn and strip metadata for Together AI (unsupported)', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const inputData = {
        provider: 'together',
        apiKey: 'together_test123',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true,
          metadata: { project: 'test' } // This should be stripped and warn
        }
      };

      const options = { url: 'https://api.together.xyz/v1/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

      // Should warn about unsupported metadata
      expect(consoleSpy).toHaveBeenCalledWith(
        'Together AI batch processing does not support metadata. Metadata will be ignored.'
      );

      // Should not include metadata in the request
      expect(requestConfig.data.metadata).toBeUndefined();
      
      consoleSpy.mockRestore();
    });
  });

  describe('should handle and log batch processing errors properly', () => {
    it('should handle and log batch processing errors properly', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const inputData = {
        provider: 'unsupported-provider', // This will cause an error
        apiKey: 'test-key',
        model: 'test-model',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true,
          inputFileId: 'file-123'
        }
      };

      const options = { url: 'https://api.test.com/batches' };

      expect(() => {
        create_request(llm_input_schema, inputData, options);
      }).toThrow(); // Should throw an error for unsupported provider

      consoleErrorSpy.mockRestore();
    });
  });
});

describe('extract_api_payload', () => {
    const { extract_api_payload } = require('./create_request');

    describe('Core functionality', () => {
      it('should extract only API-relevant fields and exclude internal fields', () => {
        const inputData = {
          // API fields that should be included
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello' }],
          maxTokens: 1000,
          temperature: 0.7,
          topP: 0.9,
          stream: false,
          stop: ['END'],
          presencePenalty: 0.5,
          frequencyPenalty: 0.3,
          tools: [{ type: 'function', function: { name: 'test' } }],
          responseFormat: { type: 'json_object' },
          seed: 12345,
          
          // Internal fields that should be excluded
          provider: 'openai',
          apiKey: 'test-key-123',
          batch: { enabled: true, customId: 'test' }
        };

        const result = extract_api_payload(inputData);

        // Should include all API fields with snake_case keys
        expect(result).toEqual({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
          stream: false,
          stop: ['END'],
          presence_penalty: 0.5,
          frequency_penalty: 0.3,
          tools: [{ type: 'function', function: { name: 'test' } }],
          response_format: { type: 'json_object' },
          seed: 12345
        });

        // Should not include internal fields
        expect(result).not.toHaveProperty('provider');
        expect(result).not.toHaveProperty('apiKey');
        expect(result).not.toHaveProperty('batch');
      });

      it('should handle minimal input with only required fields', () => {
        const inputData = {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }],
          provider: 'openai',
          apiKey: 'sk-test'
        };

        const result = extract_api_payload(inputData);

        expect(result).toEqual({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test' }]
        });

        expect(result).not.toHaveProperty('provider');
        expect(result).not.toHaveProperty('apiKey');
      });

      it('should handle undefined optional fields correctly', () => {
        const inputData = {
          model: 'claude-3-haiku',
          messages: [{ role: 'user', content: 'Test' }],
          temperature: undefined,
          maxTokens: 500,
          provider: 'anthropic',
          apiKey: 'test-key',
          unknownField: 'should be excluded'
        };

        const result = extract_api_payload(inputData);

        expect(result).toEqual({
          model: 'claude-3-haiku',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 500
        });

        // Should not include undefined fields
        expect(result).not.toHaveProperty('temperature');
        // Should not include internal fields
        expect(result).not.toHaveProperty('provider');
        expect(result).not.toHaveProperty('apiKey');
        // Should not include unknown fields
        expect(result).not.toHaveProperty('unknownField');
      });
    });

    describe('Data leakage prevention', () => {
      it('should prevent data leakage when new internal fields are added', () => {
        const inputData = {
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
          provider: 'openai',
          apiKey: 'test-key',
          
          // Simulate future internal fields that should never leak to API
          newInternalConfig: { secret: 'value' },
          internalUserId: 'user-123',
          debugMode: true,
          internalMetrics: { calls: 5, errors: 0 },
          privateSettings: { billing: 'premium' }
        };

        const result = extract_api_payload(inputData);

        expect(result).toEqual({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }]
        });

        // Verify NO internal fields leaked through
        expect(result).not.toHaveProperty('provider');
        expect(result).not.toHaveProperty('apiKey');
        expect(result).not.toHaveProperty('newInternalConfig');
        expect(result).not.toHaveProperty('internalUserId');
        expect(result).not.toHaveProperty('debugMode');
        expect(result).not.toHaveProperty('internalMetrics');
        expect(result).not.toHaveProperty('privateSettings');
      });

      it('should only include explicitly allowlisted API fields', () => {
        const inputData = {
          // Known allowlisted fields
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
          maxTokens: 100,
          
          // Simulate unknown/future API fields that would need explicit allowlisting
          newApiField: 'this needs to be explicitly added to allowlist',
          experimentalFeature: { enabled: true },
          futureParameter: 42
        };

        const result = extract_api_payload(inputData);

        // Should only include explicitly allowlisted fields
        expect(result).toEqual({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 100
        });

        // Should NOT include fields not in allowlist, even if they seem API-related
        expect(result).not.toHaveProperty('newApiField');
        expect(result).not.toHaveProperty('experimentalFeature');
        expect(result).not.toHaveProperty('futureParameter');
      });
    });

    describe('Error handling and edge cases', () => {
      it('should throw error for null input', () => {
        expect(() => {
          extract_api_payload(null);
        }).toThrow('extract_api_payload: validatedData must be a non-null object');
      });

      it('should throw error for undefined input', () => {
        expect(() => {
          extract_api_payload(undefined);
        }).toThrow('extract_api_payload: validatedData must be a non-null object');
      });

      it('should throw error for non-object input', () => {
        expect(() => {
          extract_api_payload('string');
        }).toThrow('extract_api_payload: validatedData must be a non-null object');

        expect(() => {
          extract_api_payload(123);
        }).toThrow('extract_api_payload: validatedData must be a non-null object');
      });

      it('should handle empty object input', () => {
        const result = extract_api_payload({});
        expect(result).toEqual({});
      });

      it('should handle null values in allowlisted fields', () => {
        const inputData = {
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
          temperature: null,
          maxTokens: 100,
          stop: null
        };

        const result = extract_api_payload(inputData);

        expect(result).toEqual({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 100
        });

        // Null values should be excluded
        expect(result).not.toHaveProperty('temperature');
        expect(result).not.toHaveProperty('stop');
      });
    });

    describe('Field mapping verification', () => {
      it('should correctly map all camelCase fields to snake_case', () => {
        const inputData = {
          model: 'test-model',
          messages: [{ role: 'user', content: 'Test' }],
          maxTokens: 100,
          temperature: 0.7,
          topP: 0.9,
          stream: true,
          stop: ['STOP'],
          presencePenalty: 0.5,
          frequencyPenalty: 0.3,
          tools: [{ type: 'function' }],
          responseFormat: { type: 'text' },
          seed: 42
        };

        const result = extract_api_payload(inputData);

        // Verify each field mapping is correct
        expect(result.model).toBe('test-model');
        expect(result.messages).toEqual([{ role: 'user', content: 'Test' }]);
        expect(result.max_tokens).toBe(100);
        expect(result.temperature).toBe(0.7);
        expect(result.top_p).toBe(0.9);
        expect(result.stream).toBe(true);
        expect(result.stop).toEqual(['STOP']);
        expect(result.presence_penalty).toBe(0.5);
        expect(result.frequency_penalty).toBe(0.3);
        expect(result.tools).toEqual([{ type: 'function' }]);
        expect(result.response_format).toEqual({ type: 'text' });
        expect(result.seed).toBe(42);

        // Verify no camelCase fields remain
        expect(result).not.toHaveProperty('maxTokens');
        expect(result).not.toHaveProperty('topP');
        expect(result).not.toHaveProperty('presencePenalty');
        expect(result).not.toHaveProperty('frequencyPenalty');
        expect(result).not.toHaveProperty('responseFormat');
      });
    });

    describe('Future-proofing tests', () => {
      it('should handle future schema additions gracefully', () => {
        const inputData = {
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
          provider: 'openai',
          apiKey: 'test-key',
          
          // Simulate future internal fields that should be excluded
          newInternalField: 'should not appear in API payload',
          anotherInternalField: { complex: 'object' },
          
          // Simulate future API fields that need to be explicitly added to allowlist
          futureApiField: 'would need to be added to allowlist'
        };

        const result = extract_api_payload(inputData);

        expect(result).toEqual({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }]
        });

        // Should not include any unknown fields (internal or API)
        expect(result).not.toHaveProperty('newInternalField');
        expect(result).not.toHaveProperty('anotherInternalField');
        expect(result).not.toHaveProperty('futureApiField');
      });

      it('should be secure by default - reject all unknown fields', () => {
        const inputWithManyUnknownFields = {
          // Known good fields
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }],
          
          // Many potential future/unknown fields
          unknownField1: 'value1',
          unknownField2: { nested: 'value' },
          unknownField3: [1, 2, 3],
          adminAccess: true,
          secretKey: 'should-never-leak',
          internalDebugInfo: { logs: ['error1', 'error2'] },
          userCredentials: { username: 'admin', password: 'secret' }
        };

        const result = extract_api_payload(inputWithManyUnknownFields);

        // Should only contain the two known allowlisted fields
        expect(Object.keys(result)).toEqual(['model', 'messages']);
        expect(Object.keys(result)).toHaveLength(2);
        
        expect(result).toEqual({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Test' }]
        });
      });
    });
  });
