const axios = require('axios');
const { execute_request } = require('./create_request');
const { llm_input_schema } = require('./llm_schema');

// Mock axios for controlled testing
jest.mock('axios');
const mockedAxios = axios;

describe('HTTP Mocking Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful API Responses', () => {
    it('should handle OpenAI successful response', async () => {
      const mockResponse = {
        status: 200,
        data: {
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: 1677652288,
          model: 'gpt-4',
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?'
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 9,
            completion_tokens: 12,
            total_tokens: 21
          }
        }
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      const input = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key'
      };

      const response = await execute_request(llm_input_schema, input);

      expect(response.status).toBe(200);
      expect(response.data.choices[0].message.content).toBe('Hello! How can I help you today?');
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.openai.com/v1/chat/completions',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );
    });

    it('should handle Anthropic successful response', async () => {
      const mockResponse = {
        status: 200,
        data: {
          id: 'msg_123',
          type: 'message',
          role: 'assistant',
          content: [{
            type: 'text',
            text: 'Hello! How can I assist you?'
          }],
          model: 'claude-3-sonnet-20240229',
          stop_reason: 'end_turn',
          usage: {
            input_tokens: 10,
            output_tokens: 15
          }
        }
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      const input = {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key'
      };

      const response = await execute_request(llm_input_schema, input);

      expect(response.status).toBe(200);
      expect(response.data.content[0].text).toBe('Hello! How can I assist you?');
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.anthropic.com/v1/messages',
          headers: expect.objectContaining({
            'x-api-key': 'test-key',
            'anthropic-version': '2025-05-22'
          })
        })
      );
    });

    it('should handle streaming response', async () => {
      const mockStreamResponse = {
        status: 200,
        data: 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: [DONE]\n\n'
      };

      mockedAxios.mockResolvedValueOnce(mockStreamResponse);

      const input = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
        apiKey: 'test-key'
      };

      const response = await execute_request(llm_input_schema, input);

      expect(response.status).toBe(200);
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stream: true
          })
        })
      );
    });
  });

  describe('Error Response Handling', () => {
    it('should handle 401 authentication errors', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: {
              message: 'Invalid API key provided',
              type: 'invalid_request_error',
              code: 'invalid_api_key'
            }
          }
        }
      };

      mockedAxios.mockRejectedValueOnce(mockError);

      const input = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'invalid-key'
      };

      await expect(execute_request(llm_input_schema, input)).rejects.toMatchObject({
        name: 'AuthenticationError',
        provider: 'openai',
        statusCode: 401,
        message: 'Invalid API key provided'
      });
    });

    it('should handle 429 rate limit errors', async () => {
      const mockError = {
        response: {
          status: 429,
          headers: {
            'retry-after': '60',
            'x-ratelimit-remaining-requests': '0'
          },
          data: {
            error: {
              message: 'Rate limit exceeded',
              type: 'rate_limit_error'
            }
          }
        }
      };

      mockedAxios.mockRejectedValueOnce(mockError);

      const input = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key'
      };

      // Disable retries for this test to avoid long waits
      const options = { retry: { maxRetries: 0 } };

      await expect(execute_request(llm_input_schema, input, options)).rejects.toMatchObject({
        name: 'RateLimitError',
        provider: 'openai',
        statusCode: 429,
        retryAfter: '60'
      });
    }, 10000);

    it('should handle 500 server errors', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            error: {
              message: 'Internal server error',
              type: 'server_error'
            }
          }
        }
      };

      mockedAxios.mockRejectedValueOnce(mockError);

      const input = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key'
      };

      // Disable retries for this test to avoid long waits
      const options = { retry: { maxRetries: 0 } };

      await expect(execute_request(llm_input_schema, input, options)).rejects.toMatchObject({
        name: 'ServiceError',
        provider: 'openai',
        statusCode: 500
      });
    }, 10000);

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'ECONNREFUSED';

      mockedAxios.mockRejectedValueOnce(networkError);

      const input = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key'
      };

      // Disable retries for this test to avoid long waits
      const options = { retry: { maxRetries: 0 } };

      await expect(execute_request(llm_input_schema, input, options)).rejects.toMatchObject({
        name: 'NetworkError',
        provider: 'openai',
        message: 'Network Error'
      });
    }, 10000);
  });

  describe('Batch Processing Mocking', () => {
    it('should handle batch request creation', async () => {
      const mockBatchResponse = {
        status: 200,
        data: {
          id: 'batch_123',
          object: 'batch',
          endpoint: '/v1/chat/completions',
          input_file_id: 'file-abc123',
          completion_window: '24h',
          status: 'validating',
          created_at: 1677652288
        }
      };

      mockedAxios.mockResolvedValueOnce(mockBatchResponse);

      const input = {
        provider: 'openai',
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: 'test-key',
        batch: {
          enabled: true,
          inputFileId: 'file-abc123',
          completionWindow: '24h'
        }
      };

      const response = await execute_request(llm_input_schema, input);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe('batch_123');
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.openai.com/v1/batches',
          data: expect.objectContaining({
            input_file_id: 'file-abc123'
          })
        })
      );
    });
  });

  describe('Provider-Specific Response Formats', () => {
    it('should handle different response formats correctly', async () => {
      // Test that our code works with various provider response formats
      const providers = [
        {
          name: 'openai',
          response: {
            status: 200,
            data: { choices: [{ message: { content: 'OpenAI response' } }] }
          }
        },
        {
          name: 'anthropic',
          response: {
            status: 200,
            data: { content: [{ text: 'Anthropic response' }] }
          }
        }
      ];

      for (const provider of providers) {
        mockedAxios.mockResolvedValueOnce(provider.response);

        const input = {
          provider: provider.name,
          model: 'test-model',
          messages: [{ role: 'user', content: 'Hello' }],
          apiKey: 'test-key'
        };

        const response = await execute_request(llm_input_schema, input);
        expect(response.status).toBe(200);
      }
    });
  });
});
