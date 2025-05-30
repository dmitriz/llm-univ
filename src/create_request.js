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
      return 'https://models.inference.ai.azure.com/chat/completions';
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
  
  // Return request configuration directly
  return {
    method: options.method || 'POST',
    url: options.url || get_default_url(validatedData.provider),
    data: validatedData,
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
  get_default_url
};
