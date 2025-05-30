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

      const options = { url: 'https://api.openai.com/v1/chat/completions' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: options.url, // Or 'https://api.openai.com/v1/chat/completions' directly if options is not used elsewhere
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
          'anthropic-version': '2025-05-22'
        }
      });
    });

    it('should create GitHub Models-compatible request (without API key)', () => {
      const inputData = {
        provider: 'gh-models',
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: 'Hello from GitHub Models!' }
        ],
        maxTokens: 500,
        temperature: 0.3
      };

      const options = {
        url: 'https://models.inference.ai.azure.com/chat/completions',
        method: 'POST'
      };

      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: options.url,
        data: inputData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    it('should create Hugging Face-compatible request (with API key)', () => {
      const inputData = {
        provider: 'huggingface',
        apiKey: 'hf_test123',
        model: 'microsoft/DialoGPT-medium',
        messages: [
          { role: 'user', content: 'Hello from Hugging Face!' }
        ],
        maxTokens: 500,
        temperature: 0.7
      };

      const options = {
        url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        method: 'POST'
      };

      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: options.url,
        data: inputData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${inputData.apiKey}`
        }
      });
    });

    it('should create DeepSeek-compatible request', () => {
      const inputData = {
        provider: 'deepseek',
        apiKey: 'sk-deepseek-test123',
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: 'Hello from DeepSeek!' }
        ],
        maxTokens: 1000,
        temperature: 0.7
      };

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
      const inputData = {
        provider: 'qwen',
        apiKey: 'sk-qwen-test123',
        model: 'qwen-plus',
        messages: [
          { role: 'user', content: 'Hello from Qwen!' }
        ],
        maxTokens: 1000,
        temperature: 0.7
      };

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

      const options = { url: 'https://api.test.com' };

      expect(() => {
        create_request(llm_input_schema, invalidData, options);
      }).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidData = {
        provider: 'openai',
        // Missing model and messages (apiKey is now optional)
      };

      const options = { url: 'https://api.openai.com/v1/chat/completions' };

      expect(() => {
        create_request(llm_input_schema, invalidData, options);
      }).toThrow();
    });

    it('should work without API key for providers that support it', () => {
      const inputDataGitHub = {
        provider: 'gh-models',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello without API key!' }]
      };

      const inputDataOllama = {
        provider: 'ollama',
        model: 'llama2',
        messages: [{ role: 'user', content: 'Hello local model!' }]
      };

      expect(() => {
        create_request(llm_input_schema, inputDataGitHub);
      }).not.toThrow();

      expect(() => {
        create_request(llm_input_schema, inputDataOllama);
      }).not.toThrow();
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

  describe('should handle batch processing for supported providers', () => {
    it('should create OpenAI batch request', () => {
      const inputData = {
        provider: 'openai',
        apiKey: 'sk-test123',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true,
          inputFileId: 'file-abc123',
          completionWindow: '24h',
          metadata: { project: 'test' }
        }
      };

      const options = { url: 'https://api.openai.com/v1/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

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
      const inputData = {
        provider: 'anthropic',
        apiKey: 'sk-ant-test123',
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true,
          inputFileId: 'file-xyz789',
          completionWindow: '24h'
        }
      };

      const options = { url: 'https://api.anthropic.com/v1/messages/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages/batches',
        data: {
          requests: [{
            custom_id: expect.any(String),
            params: {
              model: 'claude-3-sonnet-20240229',
              max_tokens: 1024,
              messages: [{ role: 'user', content: 'Hello' }]
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
      const inputData = {
        provider: 'groq',
        apiKey: 'gsk_test123',
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true,
          inputFileId: 'file-groq123',
          completionWindow: '24h'
        }
      };

      const options = { url: 'https://api.groq.com/openai/v1/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

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
      const inputData = {
        provider: 'siliconflow',
        apiKey: 'sk-silicon123',
        model: 'Qwen/Qwen2-72B-Instruct',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true,
          inputFileId: 'file-silicon456',
          completionWindow: '24h',
          metadata: { environment: 'test' }
        }
      };

      const options = { url: 'https://api.siliconflow.cn/v1/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

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
      const inputData = {
        provider: 'siliconflow',
        apiKey: 'sk-silicon789',
        model: 'Qwen/Qwen2-72B-Instruct',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true,
          inputFileId: 'file-silicon-minimal'
        }
      };

      const options = { url: 'https://api.siliconflow.cn/v1/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

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
      const inputData = {
        provider: 'together',
        apiKey: 'together_test123',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true
        }
      };

      const options = { url: 'https://api.together.xyz/v1/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.together.xyz/v1/batches',
        data: {
          requests: [{
            customId: expect.any(String),
            model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
            maxTokens: 1024,
            messages: [{ role: 'user', content: 'Hello' }]
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
      const inputData = {
        provider: 'together',
        apiKey: 'together_test123',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        batch: {
          enabled: true,
          batchSize: 20,
          timeout: 500
        }
      };

      const options = { url: 'https://api.together.xyz/v1/batches' };
      const requestConfig = create_request(llm_input_schema, inputData, options);

      expect(requestConfig).toEqual({
        method: 'POST',
        url: 'https://api.together.xyz/v1/batches',
        data: {
          requests: [{
            customId: expect.any(String),
            model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
            maxTokens: 1024,
            messages: [{ role: 'user', content: 'Hello' }]
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
