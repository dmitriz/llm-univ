const { z } = require('zod');
const axios = require('axios');

/**
 * Creates provider-specific headers based on the input data
 * @param {Object} data - The validated input data
 * @returns {Object} Provider-specific headers
 */
function createProviderHeaders(data) {
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
        'anthropic-version': '2023-06-01'
      };
    
    case 'azure-openai':
      return {
        ...baseHeaders,
        'api-key': data.apiKey
      };
    
    case 'google':
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${data.apiKey}`
      };
    
    default:
      return baseHeaders;
  }
}

/**
 * Creates an axios request configuration from a Zod schema and input data
 * @param {z.ZodSchema} schema - The Zod schema to validate input against
 * @param {Object} data - The input data to validate and convert
 * @param {Object} options - Additional request options
 * @param {string} options.url - The request URL
 * @param {string} options.method - HTTP method (default: 'POST')
 * @param {Object} options.headers - Additional headers (will override provider headers)
 * @returns {Object} Axios request configuration object
 */
function createRequest(schema, data, options = {}) {
  // Validate input data against schema
  const validatedData = schema.parse(data);
  
  // Create provider-specific headers
  const providerHeaders = createProviderHeaders(validatedData);
  
  // Create base request configuration
  const requestConfig = {
    method: options.method || 'POST',
    url: options.url,
    data: validatedData,
    headers: {
      ...providerHeaders,
      ...options.headers // Allow overriding provider headers
    }
  };
  
  return requestConfig;
}

/**
 * Creates and executes an axios request from a schema
 * @param {z.ZodSchema} schema - The Zod schema to validate input against
 * @param {Object} data - The input data to validate and convert
 * @param {Object} options - Request options (url, method, headers, etc.)
 * @returns {Promise} Axios response promise
 */
async function executeRequest(schema, data, options = {}) {
  const requestConfig = createRequest(schema, data, options);
  return axios(requestConfig);
}

module.exports = {
  createRequest,
  executeRequest,
  createProviderHeaders
};
