const { z } = require('zod');
const { create_request } = require('./create_request');
const { llm_input_schema } = require('./llm_schema');

// ✅ REUSABLE TEST DATA - No more duplication!
const baseTestData = {
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello, how are you?' }],
  maxTokens: 1000,
  temperature: 0.7,
  stream: false
};

const createProviderData = (provider, apiKey = 'test-key-123') => ({
  ...baseTestData,
  provider,
  ...(apiKey && { apiKey })
});

// ✅ REUSABLE BATCH TEST DATA
const createBatchData = (provider, apiKey, batchConfig = {}) => ({
  ...createProviderData(provider, apiKey),
  batch: {
    enabled: true,
    ...batchConfig
  }
});

describe('create_request', () => {
  describe('should convert universal schema to axios request for different providers', () => {
    it('should create OpenAI-compatible request', () => {
      const inputData = createProviderData('openai', 'sk-test123');

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        data: inputData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${inputData.apiKey}`
        }
      });
    });

    it('should create Anthropic-compatible request', () => {
      const inputData = createProviderData('anthropic', 'sk-ant-test123');
      inputData.model = 'claude-3-sonnet-20240229';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages',
        data: inputData,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': inputData.apiKey,
          'anthropic-version': '2025-05-22'
        }
      });
    });

    it('should create GitHub Models-compatible request (without API key)', () => {
      const inputData = createProviderData('gh-models', null);
      inputData.model = 'gpt-4o';
      inputData.maxTokens = 500;
      inputData.temperature = 0.3;

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://models.inference.ai.azure.com/chat/completions',
        data: inputData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('should create Hugging Face-compatible request (with API key)', () => {
      const inputData = createProviderData('huggingface', 'hf_test123');
      inputData.model = 'microsoft/DialoGPT-medium';
      inputData.maxTokens = 500;

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api-inference.huggingface.co/models',
        data: inputData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${inputData.apiKey}`
        }
      });
    });

    it('should create DeepSeek-compatible request', () => {
      const inputData = createProviderData('deepseek', 'sk-deepseek-test123');
      inputData.model = 'deepseek-chat';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.deepseek.com/chat/completions',
        data: inputData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${inputData.apiKey}`
        }
      });
    });

    it('should create Qwen-compatible request', () => {
      const inputData = createProviderData('qwen', 'sk-qwen-test123');
      inputData.model = 'qwen-plus';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        data: inputData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${inputData.apiKey}`
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
      const inputDataGitHub = createProviderData('gh-models', null);
      inputDataGitHub.model = 'gpt-4o';

      const inputDataOllama = createProviderData('ollama', null);
      inputDataOllama.model = 'llama2';

      expect(() => {
        create_request(llm_input_schema, inputDataGitHub);
      }).not.toThrow();

      expect(() => {
        create_request(llm_input_schema, inputDataOllama);
      }).not.toThrow();
    });

    it('should throw error for invalid message structure', () => {
      const invalidData = createProviderData('openai');
      invalidData.messages = [
        { role: 'invalid-role', content: 'test' } // Invalid role
      ];

      expect(() => {
        create_request(llm_input_schema, invalidData);
      }).toThrow();
    });

    it('should throw error for invalid parameter ranges', () => {
      const invalidData = createProviderData('openai');
      invalidData.temperature = 3.0; // Invalid: above max of 2.0

      expect(() => {
        create_request(llm_input_schema, invalidData);
      }).toThrow();
    });
  });

  describe('should handle optional parameters correctly', () => {
    it('should work with minimal required parameters', () => {
      const minimalData = createProviderData('openai');

      const requestConfig = create_request(llm_input_schema, minimalData);

      expect(requestConfig.data).toEqual(minimalData);
      expect(requestConfig.method).toBe('POST'); // Default method
    });

    it('should include all optional parameters when provided', () => {
      const fullData = createProviderData('openai');
      Object.assign(fullData, {
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
      });

      const requestConfig = create_request(llm_input_schema, fullData);

      expect(requestConfig.data).toEqual(fullData);
    });
  });

  describe('should handle different message types and tools', () => {
    it('should validate tool calling schema', () => {
      const dataWithTools = createProviderData('openai');
      dataWithTools.messages = [{ role: 'user', content: 'What is the weather?' }];
      dataWithTools.tools = [{
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
      }];

      expect(() => {
        create_request(llm_input_schema, dataWithTools);
      }).not.toThrow();
    });

    it('should validate complex message thread', () => {
      const conversationData = createProviderData('anthropic');
      conversationData.model = 'claude-3-sonnet-20240229';
      conversationData.messages = [
        { role: 'system', content: 'You are a helpful coding assistant.' },
        { role: 'user', content: 'Can you help me write a function?' },
        { role: 'assistant', content: 'Of course! What kind of function do you need?' },
        { role: 'user', content: 'A function to calculate fibonacci numbers.' }
      ];
      conversationData.maxTokens = 1500;
      conversationData.temperature = 0.2;

      expect(() => {
        create_request(llm_input_schema, conversationData);
      }).not.toThrow();
    });
  });

  describe('should handle edge cases', () => {
    it('should handle empty optional arrays', () => {
      const dataWithEmptyTools = createProviderData('openai');
      dataWithEmptyTools.tools = []; // Empty array should be valid

      expect(() => {
        create_request(llm_input_schema, dataWithEmptyTools);
      }).not.toThrow();
    });

    it('should handle string and array stop sequences', () => {
      const dataWithStringStop = createProviderData('openai');
      dataWithStringStop.stop = '\\n'; // Single string

      const dataWithArrayStop = createProviderData('openai');
      dataWithArrayStop.stop = ['\\n', 'END', 'STOP']; // Array of strings

      expect(() => {
        create_request(llm_input_schema, dataWithStringStop);
      }).not.toThrow();

      expect(() => {
        create_request(llm_input_schema, dataWithArrayStop);
      }).not.toThrow();
    });
  });

  describe('should handle batch processing for supported providers', () => {
    it('should create OpenAI batch request', () => {
      const inputData = createBatchData('openai', 'sk-test123', {
        inputFileId: 'file-abc123',
        completionWindow: '24h',
        metadata: { project: 'test' }
      });

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.openai.com/v1/batches',
        data: {
          input_file_id: 'file-abc123',
          endpoint: '/v1/chat/completions',
          completion_window: '24h',
          metadata: { project: 'test' }
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-test123'
        }
      });
    });

    it('should create Anthropic batch request', () => {
      const inputData = createBatchData('anthropic', 'sk-ant-test123', {
        inputFileId: 'file-xyz789',
        completionWindow: '24h'
      });
      inputData.model = 'claude-3-sonnet-20240229';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages/batches',
        data: {
          requests: [{
            custom_id: expect.any(String),
            params: {
              model: 'claude-3-sonnet-20240229',
              max_tokens: 1000, // From baseTestData
              messages: [{ role: 'user', content: 'Hello, how are you?' }] // From baseTestData
            }
          }]
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-ant-test123',
          'anthropic-version': '2025-05-22',
          'anthropic-beta': 'message-batches-2024-09-24'
        }
      });
    });

    it('should create Groq batch request', () => {
      const inputData = createBatchData('groq', 'gsk_test123', {
        inputFileId: 'file-groq123',
        completionWindow: '24h'
      });
      inputData.model = 'mixtral-8x7b-32768';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/batches',
        data: {
          input_file_id: 'file-groq123',
          endpoint: '/v1/chat/completions',
          completion_window: '24h'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer gsk_test123'
        }
      });
    });

    it('should create SiliconFlow batch request', () => {
      const inputData = createBatchData('siliconflow', 'sk-silicon123', {
        inputFileId: 'file-silicon456',
        completionWindow: '24h',
        metadata: { environment: 'test' }
      });
      inputData.model = 'Qwen/Qwen2-72B-Instruct';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.siliconflow.cn/v1/batches',
        data: {
          input_file_id: 'file-silicon456',
          endpoint: '/v1/chat/completions',
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
      const inputData = createBatchData('siliconflow', 'sk-silicon789', {
        inputFileId: 'file-silicon-minimal'
      });
      inputData.model = 'Qwen/Qwen2-72B-Instruct';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.siliconflow.cn/v1/batches',
        data: {
          input_file_id: 'file-silicon-minimal',
          endpoint: '/v1/chat/completions',
          completion_window: '24h'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-silicon789'
        }
      });
    });

    it('should create Together AI batch request', () => {
      const inputData = createBatchData('together', 'together_test123');
      inputData.model = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.together.xyz/v1/batches',
        data: {
          requests: [{
            customId: expect.any(String),
            model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
            maxTokens: 1000, // From baseTestData
            messages: [{ role: 'user', content: 'Hello, how are you?' }] // From baseTestData
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
      const inputData = createBatchData('together', 'together_test123', {
        batchSize: 20,
        timeout: 500
      });
      inputData.model = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';

      const requestConfig = create_request(llm_input_schema, inputData);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.together.xyz/v1/batches',
        data: {
          requests: [{
            customId: expect.any(String),
            model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
            maxTokens: 1000, // From baseTestData
            messages: [{ role: 'user', content: 'Hello, how are you?' }] // From baseTestData
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
      }).toThrow('SiliconFlow batch processing requires inputFileId');
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
      }).toThrow('openai batch processing requires inputFileId');
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
      }).toThrow('groq batch processing requires inputFileId');
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
