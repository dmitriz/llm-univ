const { z } = require('zod');
const axios = require('axios');
const { 
  BASE_URLS, 
  CHAT_ENDPOINTS, 
  MODEL_ENDPOINTS, 
  getChatEndpoint, 
  getModelEndpoint,
  getHuggingFaceUrl,
  getBatchEndpoint
} = require('./config/url_config');

// API version constants for maintainability
const API_VERSIONS = {
  anthropic: '2025-05-22',
  anthropicBeta: 'message-batches-2024-09-24'
};

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
        'anthropic-version': API_VERSIONS.anthropic
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
    case 'deepseek':
    case 'qwen':
    case 'siliconflow':
    case 'groq':
    case 'grok':
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
 * @param {string} model - The model name (required for some providers like Hugging Face)
 * @returns {string} Default URL for the provider
 */
const get_default_url = (provider, model) => {
  if (provider === 'huggingface') {
    return getHuggingFaceUrl(model);
  }
  return getChatEndpoint(provider);
};

/**
 * Creates OpenAI-compatible batch request for providers that use the same format
 * @param {Object} data - The validated input data
 * @param {string} provider - The provider name
 * @returns {Object} OpenAI-compatible batch request configuration
 */
const create_openai_compatible_batch = (data, provider) => {
  return {
    method: 'POST',
    url: getBatchEndpoint(provider),
    data: {
      input_file_id: data.batch.inputFileId, 
      endpoint: getChatEndpoint(provider), // Use provider-specific chat endpoint
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
  const requiresInputFileId = ['siliconflow', 'openai', 'groq'];
  if (requiresInputFileId.includes(data.provider) && !data.batch.inputFileId) {
    // Capitalize first letter for better error message formatting
    const providerName = data.provider.charAt(0).toUpperCase() + data.provider.slice(1);
    throw new Error(`${providerName} batch processing requires inputFileId`);
  }

  switch (data.provider) {
    case 'openai':
    case 'groq':
    case 'siliconflow':
      return create_openai_compatible_batch(data, data.provider);
    
    case 'anthropic':
      return {
        method: 'POST',
        url: getBatchEndpoint('anthropic'),
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
        url: getBatchEndpoint('together'),
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
    url: CHAT_ENDPOINTS[req.provider] || '/v1/chat/completions',
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
 * Uses allowlist approach to include only API-relevant fields
 * Excludes internal fields like provider, apiKey, batch
 * Maps camelCase field names to snake_case API format
 * @param {Object} validatedData - The validated input data
 * @returns {Object} Clean API payload with snake_case keys
 */
const extract_api_payload = (validatedData) => {
  // Define mapping from camelCase internal fields to snake_case API fields
  const fieldMapping = {
    'model': 'model',
    'messages': 'messages', 
    'maxTokens': 'max_tokens',
    'temperature': 'temperature',
    'topP': 'top_p',
    'stream': 'stream',
    'stop': 'stop',
    'presencePenalty': 'presence_penalty',
    'frequencyPenalty': 'frequency_penalty',
    'tools': 'tools',
    'responseFormat': 'response_format',
    'seed': 'seed'
  };
  
  // Extract and map fields from validated data
  const apiPayload = {};
  for (const [camelCaseField, snakeCaseField] of Object.entries(fieldMapping)) {
    if (validatedData[camelCaseField] !== undefined) {
      apiPayload[snakeCaseField] = validatedData[camelCaseField];
    }
  }
  
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
      // Don't wrap the error message, just let it propagate
      throw error;
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
    url: options.url || get_default_url(validatedData.provider, validatedData.model),
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
