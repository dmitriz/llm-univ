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
const {
  getProviderTimeout,
  calculateRetryDelay,
  shouldRetry,
  getRetryAfterDelay,
  createAxiosConfig,
  RETRY_CONFIG
} = require('./config/request_config');
const {
  createErrorFromResponse,
  isRetryableError,
  TimeoutError,
  NetworkError
} = require('./errors');
const {
  logRequestStart,
  logRequestSuccess,
  logRequestError,
  logRetryAttempt,
  createTimer
} = require('./logger');

// API version constants for maintainability
const API_VERSIONS = {
  anthropic: '2025-05-22',
  anthropicBeta: 'message-batches-2024-09-24'
};

/**
 * Validates and sanitizes API key to prevent header injection attacks
 * @param {string} apiKey - The API key to validate
 * @param {string} provider - The provider name for error messages
 * @returns {string} Sanitized API key
 */
const validateApiKey = (apiKey, provider) => {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error(`Invalid API key format for provider: ${provider}`);
  }

  // Remove potential header injection characters (CRLF injection prevention)
  const sanitized = apiKey.replace(/[\r\n\t]/g, '').trim();

  if (sanitized.length === 0) {
    throw new Error(`Empty API key provided for provider: ${provider}`);
  }

  // Basic format validation for common API key patterns
  // Allow shorter keys in test environment
  const minLength = process.env.NODE_ENV === 'test' ? 3 : 10;
  if (sanitized.length < minLength) {
    throw new Error(`API key too short for provider: ${provider}`);
  }

  return sanitized;
};

/**
 * Validates URL to prevent SSRF attacks
 * @param {string} url - The URL to validate
 * @returns {string} Validated URL
 */
const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL format');
  }

  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS and HTTP protocols
    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }

    // Block localhost and private IP ranges for security, except for Ollama
    const hostname = parsedUrl.hostname.toLowerCase();
    if ((hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) &&
        !url.includes('localhost:11434')) {
      throw new Error('Private IP addresses are not allowed');
    }

    return url;
  } catch (error) {
    throw new Error(`Invalid URL: ${error.message}`);
  }
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
        'Authorization': `Bearer ${validateApiKey(data.apiKey, data.provider)}`
      };

    case 'anthropic':
      return {
        ...baseHeaders,
        'x-api-key': validateApiKey(data.apiKey, data.provider),
        'anthropic-version': API_VERSIONS.anthropic
      };

    case 'google':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${validateApiKey(data.apiKey, data.provider)}`
      };

    case 'gh-models':
      // GitHub Models can work without API key for basic usage
      if (data.apiKey) {
        return {
          ...baseHeaders,
          'Authorization': `Bearer ${validateApiKey(data.apiKey, data.provider)}`
        };
      }
      return baseHeaders;

    case 'huggingface':
      // Hugging Face has free tier, API key optional
      if (data.apiKey) {
        return {
          ...baseHeaders,
          'Authorization': `Bearer ${validateApiKey(data.apiKey, data.provider)}`
        };
      }
      return baseHeaders;

    case 'together':
    case 'deepseek':
    case 'qwen':
    case 'siliconflow':
    case 'fireworks':
    case 'groq':
    case 'grok':
    case 'openrouter':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${validateApiKey(data.apiKey, data.provider)}`
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
  const requiresInputFileId = ['siliconflow', 'openai', 'groq', 'fireworks'];
  if (requiresInputFileId.includes(data.provider) && data.batch && !data.batch.inputFileId) {
    // Capitalize first letter for better error message formatting
    const providerName = data.provider.charAt(0).toUpperCase() + data.provider.slice(1);
    throw new Error(`${providerName} batch processing requires inputFileId`);
  }

  switch (data.provider) {
    case 'openai':
    case 'groq':
    case 'siliconflow':
    case 'fireworks':
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
 *
 * @param {Object} validatedData - The validated input data
 * @returns {Object} Clean API payload with snake_case keys
 *
 * @example
 * const result = extract_api_payload({
 *   model: 'gpt-4',
 *   messages: [{role: 'user', content: 'Hello'}],
 *   maxTokens: 1000,
 *   provider: 'openai', // excluded from output
 *   apiKey: 'sk-...'    // excluded from output
 * });
 * // Returns: { model: 'gpt-4', messages: [...], max_tokens: 1000 }
 */
const extract_api_payload = (validatedData) => {
  if (!validatedData || typeof validatedData !== 'object') {
    throw new Error('extract_api_payload: validatedData must be a non-null object');
  }

  // Define comprehensive allowlist mapping from camelCase to snake_case
  // This explicit allowlist approach prevents data leakage if new internal
  // fields are added to the schema in the future
  const API_FIELD_MAPPING = {
    // Core required fields
    'model': 'model',
    'messages': 'messages',

    // Generation parameters
    'maxTokens': 'max_tokens',
    'temperature': 'temperature',
    'topP': 'top_p',
    'stream': 'stream',
    'stop': 'stop',

    // Advanced parameters
    'presencePenalty': 'presence_penalty',
    'frequencyPenalty': 'frequency_penalty',
    'tools': 'tools',
    'responseFormat': 'response_format',
    'seed': 'seed'
  };

  // Extract and map only allowlisted fields from validated data
  const apiPayload = {};
  for (const [camelCaseField, snakeCaseField] of Object.entries(API_FIELD_MAPPING)) {
    const value = validatedData[camelCaseField];
    if (value !== undefined && value !== null) {
      apiPayload[snakeCaseField] = value;
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
    const batchRequest = create_batch_request(validatedData);
    if (batchRequest) {
      // Override URL if provided in options (with validation)
      if (options.url) {
        batchRequest.url = validateUrl(options.url);
      }
      // Merge custom headers if provided
      if (options.headers) {
        batchRequest.headers = { ...batchRequest.headers, ...options.headers };
      }
      return batchRequest;
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
  const finalUrl = options.url || get_default_url(validatedData.provider, validatedData.model);
  return {
    method: options.method || 'POST',
    url: validateUrl(finalUrl),
    data: extract_api_payload(validatedData),
    headers: {
      ...create_provider_headers(validatedData),
      ...options.headers // Allow overriding provider headers
    }
  };
};

/**
 * Creates and executes an axios request from a schema with retry logic and proper error handling
 * @param {z.ZodSchema} schema - The Zod schema to validate input against
 * @param {Object} data - The input data to validate and convert
 * @param {Object} options - Request options (url, method, headers, etc.)
 * @param {Object} options.retry - Retry configuration override
 * @param {number} options.timeout - Request timeout override
 * @returns {Promise} Axios response promise
 * @throws {LLMError} Structured error with provider information
 */
const execute_request = async (schema, data, options = {}) => {
  const validatedData = schema.parse(data);
  const { provider, model } = validatedData;

  // Start timing and logging
  const timer = createTimer();
  logRequestStart(provider, model, {
    requestSize: JSON.stringify(validatedData).length,
    hasApiKey: !!validatedData.apiKey
  });

  // Create base request configuration
  const requestConfig = create_request(schema, data, options);

  // Add timeout and connection pooling
  const axiosConfig = createAxiosConfig(provider, options);
  const finalConfig = { ...requestConfig, ...axiosConfig };

  // Retry configuration
  const retryConfig = { ...RETRY_CONFIG, ...options.retry };
  let lastError;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await axios(finalConfig);

      // Log successful request
      const duration = timer.stop();
      const usage = response.data?.usage || {};
      logRequestSuccess(provider, model, duration, usage, {
        statusCode: response.status,
        attempt: attempt + 1
      });

      return response;

    } catch (error) {
      lastError = error;
      const duration = timer.stop();

      // Create structured error
      const structuredError = createErrorFromResponse(error, provider);

      // Log the error
      logRequestError(provider, model, structuredError, duration, attempt + 1);

      // Check if we should retry
      if (attempt < retryConfig.maxRetries && isRetryableError(structuredError)) {
        // Calculate delay
        let delay;

        // Use Retry-After header if available for rate limits
        if (structuredError.name === 'RateLimitError') {
          const retryAfterDelay = getRetryAfterDelay(error.response?.headers || {});
          delay = retryAfterDelay || calculateRetryDelay(attempt);
        } else {
          delay = calculateRetryDelay(attempt);
        }

        // Log retry attempt
        logRetryAttempt(provider, model, attempt + 1, delay, structuredError.message);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));

        // Reset timer for next attempt
        timer.startTime = Date.now();
        continue;
      }

      // No more retries or non-retryable error
      throw structuredError;
    }
  }

  // This should never be reached, but just in case
  throw createErrorFromResponse(lastError, provider);
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
