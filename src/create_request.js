const { z } = require('zod');
const axios = require('axios');

/**
 * Creates provider-specific headers based on the input data
 * @param {Object} data - The validated input data
 * @returns {Object} Provider-specific headers
 */
const create_provider_headers = (data) => {
  const baseHeaders = {
    'Content-Type': 'application/json'
  };

  switch (data.provider) {
    case 'openai':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
    
    case 'anthropic':
      return {
        ...baseHeaders,
        'x-api-key': data.apiKey,
        'anthropic-version': '2025-05-22'
      };
    
    case 'google':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
    
    case 'gh-models':
      // GitHub Models can work without API key for basic usage
      if (data.apiKey) {
        return {
          ...baseHeaders,
          'Authorization': `Bearer ${data.apiKey}`
        };
      }
      return baseHeaders;
    
    case 'huggingface':
      // Hugging Face has free tier, API key optional
      if (data.apiKey) {
        return {
          ...baseHeaders,
          'Authorization': `Bearer ${data.apiKey}`
        };
      }
      return baseHeaders;
    
    case 'together':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
    
    case 'deepseek':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
    
    case 'qwen':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
    
    case 'siliconflow':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
    
    case 'groq':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
      
    case 'grok':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
      
    case 'openrouter':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
      
    case 'ollama':
      // Ollama typically runs locally and doesn't require API key authentication
      return baseHeaders;
    
    default:
      // For any other providers, return base headers
      return baseHeaders;
  }
};

/**
 * Gets the default URL for a provider
 * @param {string} provider - The provider name
 * @returns {string} Default URL for the provider
 */
const get_default_url = (provider) => {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    case 'google':
      return 'https://generativelanguage.googleapis.com/v1/models';
    case 'gh-models':
      return 'https://models.github.ai/inference/chat/completions';
    case 'huggingface':
      return 'https://api-inference.huggingface.co/models';
    case 'together':
      return 'https://api.together.xyz/v1/chat/completions';
    case 'deepseek':
      return 'https://api.deepseek.com/chat/completions';
    case 'qwen':
      return 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    case 'siliconflow':
      return 'https://api.siliconflow.cn/v1/chat/completions';
    case 'groq':
      return 'https://api.groq.com/openai/v1/chat/completions';
    case 'grok':
      return 'https://api.x.ai/v1/chat/completions';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/chat/completions';
    case 'ollama':
      return 'http://localhost:11434/api/chat';
    default:
      return undefined;
  }
};

// API version constants for maintainability
const API_VERSIONS = {
  anthropic: '2025-05-22',
  anthropicBeta: 'message-batches-2024-09-24'
};

/**
 * Creates OpenAI-compatible batch request for providers that use the same format
 * @param {Object} data - The validated input data
 * @param {string} baseUrl - The base URL for the provider
 * @returns {Object} OpenAI-compatible batch request configuration
 */
const create_openai_compatible_batch = (data, baseUrl) => {
  return {
    method: 'POST',
    url: `${baseUrl}/batches`,
    data: {
      input_file_id: data.batch.inputFileId, // File ID from uploaded JSONL
      endpoint: '/v1/chat/completions',
      completion_window: data.batch.completionWindow || '24h',
      ...(data.batch.metadata && { metadata: data.batch.metadata })
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.apiKey}`
    }
  };
};

/**
 * Handles batch processing request creation for supported providers
 * @param {Object} data - The validated input data with batch configuration
 * @returns {Object} Batch-specific request configuration
 */
const create_batch_request = (data) => {
  if (!data.batch?.enabled) {
    return null; // Not a batch request
  }

  // Provider-specific validation for required batch fields
  switch (data.provider) {
    case 'siliconflow':
      if (!data.batch.inputFileId) {
        throw new Error('SiliconFlow batch processing requires inputFileId');
      }
      break;
    case 'openai':
    case 'groq':
      if (!data.batch.inputFileId) {
        throw new Error(`${data.provider} batch processing requires inputFileId`);
      }
      break;
    case 'together':
      // Together AI can work with either explicit requests array or fallback to single request
      // No strict validation needed as fallback is supported
      break;
    case 'anthropic':
      // Anthropic can work with either explicit requests array or fallback to single request
      // No strict validation needed as fallback is supported
      break;
  }

  switch (data.provider) {
    case 'openai':
      return create_openai_compatible_batch(data, 'https://api.openai.com/v1');
    
    case 'groq':
      return create_openai_compatible_batch(data, 'https://api.groq.com/openai/v1');
    
    case 'siliconflow':
      return create_openai_compatible_batch(data, 'https://api.siliconflow.cn/v1');
    
    case 'anthropic':
      return {
        method: 'POST',
        url: 'https://api.anthropic.com/v1/messages/batches',
        data: {
          requests: data.batch.requests || [{
            custom_id: data.batch.customId || `req-${Date.now()}`,
            params: {
              model: data.model,
              max_tokens: data.maxTokens || 1024,
              messages: data.messages,
              ...(data.temperature && { temperature: data.temperature }),
              ...(data.topP && { top_p: data.topP })
            }
          }]
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': data.apiKey,
          'anthropic-version': API_VERSIONS.anthropic,
          'anthropic-beta': API_VERSIONS.anthropicBeta
        }
      };
    
    case 'together':
      // Together AI doesn't support metadata - strip it to prevent silent failures
      if (data.batch.metadata) {
        console.warn('Together AI batch processing does not support metadata. Metadata will be ignored.');
      }
      return {
        method: 'POST',
        url: 'https://api.together.xyz/v1/batches',
        data: {
          requests: data.batch.requests || [{
            customId: data.batch.customId || `batch-${Date.now()}`,
            model: data.model,
            maxTokens: data.maxTokens || 1024,
            messages: data.messages,
            ...(data.temperature && { temperature: data.temperature }),
            ...(data.topP && { topP: data.topP })
          }],
          batchSize: data.batch.batchSize || 10,
          timeout: data.batch.timeout || 300
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.apiKey}`
        }
      };
    
    default:
      throw new Error(`Batch processing not supported for provider: ${data.provider}`);
  }
};

/**
 * Creates JSONL batch file content for OpenAI/Groq format
 * @param {Array} requests - Array of request objects
 * @returns {string} JSONL format string
 */
const create_batch_jsonl = (requests) => {
  return requests.map(req => JSON.stringify({
    custom_id: req.customId,
    method: 'POST',
    url: '/v1/chat/completions',
    body: {
      model: req.model,
      messages: req.messages,
      ...(req.maxTokens && { max_tokens: req.maxTokens }),
      ...(req.temperature && { temperature: req.temperature })
    }
  })).join('\n');
};

/**
 * Extracts only the API payload fields from validated data
 * Excludes internal fields like provider, apiKey, batch
 * @param {Object} validatedData - The validated input data
 * @returns {Object} Clean API payload
 */
const extract_api_payload = (validatedData) => {
  // Extract only the fields that should be sent to the API
  const { provider, apiKey, batch, ...apiPayload } = validatedData;
  return apiPayload;
};

/**
 * Creates an axios request configuration from a Zod schema and input data
 * @param {z.ZodSchema} schema - The Zod schema to validate input against
 * @param {Object} data - The input data to validate and convert
 * @param {Object} options - Additional request options
 * @param {string} options.url - The request URL (optional, will use provider default if not specified)
 * @param {string} options.method - HTTP method (default: 'POST')
 * @param {Object} options.headers - Additional headers (will override provider headers)
 * @returns {Object} Axios request configuration object
 */
const create_request = (schema, data, options = {}) => {
  const validatedData = schema.parse(data);
  
  // Check if this is a batch processing request
  if (validatedData.batch?.enabled) {
    try {
      const batchRequest = create_batch_request(validatedData);
      if (batchRequest) {
        // Override URL if provided in options
        if (options.url) {
          batchRequest.url = options.url;
        }
        // Merge custom headers if provided
        if (options.headers) {
          batchRequest.headers = { ...batchRequest.headers, ...options.headers };
        }
        return batchRequest;
      }
    } catch (error) {
      console.error(`Batch processing error for provider ${validatedData.provider}:`, error.message);
      throw new Error(`Failed to create batch request: ${error.message}`);
    }
  }
  
  // Validate API key requirements
  const requiresApiKey = [
    'openai',
    'anthropic',
    'google',
    'together',
    'deepseek',
    'qwen',
    'siliconflow',
    'groq',
    'grok',
    'openrouter'
  ];
  if (requiresApiKey.includes(validatedData.provider) && !validatedData.apiKey) {
    throw new Error(`API key is required for provider: ${validatedData.provider}`);
  }

  // Return request configuration directly
  return {
    method: options.method || 'POST',
    url: options.url || get_default_url(validatedData.provider),
    data: extract_api_payload(validatedData),
    headers: {
      ...create_provider_headers(validatedData),
      ...options.headers // Allow overriding provider headers
    }
  };
};

/**
 * Creates and executes an axios request from a schema
 * @param {z.ZodSchema} schema - The Zod schema to validate input against
 * @param {Object} data - The input data to validate and convert
 * @param {Object} options - Request options (url, method, headers, etc.)
 * @returns {Promise} Axios response promise
 */
const execute_request = async (schema, data, options = {}) => {
  return axios(create_request(schema, data, options));
};

module.exports = {
  create_request,
  execute_request,
  create_provider_headers,
  get_default_url,
  create_batch_request,
  create_batch_jsonl,
  extract_api_payload
};
