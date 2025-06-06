/**
 * Custom error classes for LLM Universal Library
 * Provides structured error handling with provider-specific information
 */

/**
 * Base error class for all LLM-related errors
 */
class LLMError extends Error {
  constructor(message, provider, statusCode = null, originalError = null) {
    super(message);
    this.name = 'LLMError';
    this.provider = provider;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LLMError);
    }
  }

  /**
   * Convert error to JSON for logging/serialization
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      provider: this.provider,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Authentication/Authorization errors (401, 403)
 */
class AuthenticationError extends LLMError {
  constructor(provider, message = null, originalError = null) {
    const defaultMessage = `Authentication failed for ${provider}. Please check your API key.`;
    super(message || defaultMessage, provider, 401, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limiting errors (429)
 */
class RateLimitError extends LLMError {
  constructor(provider, retryAfter = null, message = null, originalError = null) {
    const defaultMessage = `Rate limit exceeded for ${provider}${retryAfter ? `. Retry after ${retryAfter}s` : ''}`;
    super(message || defaultMessage, provider, 429, originalError);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Network connectivity errors
 */
class NetworkError extends LLMError {
  constructor(provider, message = null, originalError = null) {
    const defaultMessage = `Network error connecting to ${provider}`;
    super(message || defaultMessage, provider, null, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Request timeout errors
 */
class TimeoutError extends LLMError {
  constructor(provider, timeout, message = null, originalError = null) {
    const defaultMessage = `Request to ${provider} timed out after ${timeout}ms`;
    super(message || defaultMessage, provider, 408, originalError);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Invalid request errors (400, 422)
 */
class ValidationError extends LLMError {
  constructor(provider, validationErrors = [], message = null, originalError = null) {
    const defaultMessage = `Invalid request to ${provider}`;
    super(message || defaultMessage, provider, 400, originalError);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Provider service errors (500, 502, 503, 504)
 */
class ServiceError extends LLMError {
  constructor(provider, statusCode, message = null, originalError = null) {
    const defaultMessage = `Service error from ${provider} (${statusCode})`;
    super(message || defaultMessage, provider, statusCode, originalError);
    this.name = 'ServiceError';
  }
}

/**
 * Model not found or unavailable errors (404)
 */
class ModelNotFoundError extends LLMError {
  constructor(provider, model, message = null, originalError = null) {
    const defaultMessage = `Model '${model}' not found or unavailable on ${provider}`;
    super(message || defaultMessage, provider, 404, originalError);
    this.name = 'ModelNotFoundError';
    this.model = model;
  }
}

/**
 * Content filtering/safety errors
 */
class ContentFilterError extends LLMError {
  constructor(provider, reason = null, message = null, originalError = null) {
    const defaultMessage = `Content filtered by ${provider}${reason ? `: ${reason}` : ''}`;
    super(message || defaultMessage, provider, 400, originalError);
    this.name = 'ContentFilterError';
    this.reason = reason;
  }
}

/**
 * Quota/billing errors
 */
class QuotaExceededError extends LLMError {
  constructor(provider, quotaType = 'usage', message = null, originalError = null) {
    const defaultMessage = `${quotaType} quota exceeded for ${provider}`;
    super(message || defaultMessage, provider, 429, originalError);
    this.name = 'QuotaExceededError';
    this.quotaType = quotaType;
  }
}

/**
 * Configuration errors (invalid provider, missing config, etc.)
 */
class ConfigurationError extends LLMError {
  constructor(provider, configIssue, message = null, originalError = null) {
    const defaultMessage = `Configuration error for ${provider}: ${configIssue}`;
    super(message || defaultMessage, provider, null, originalError);
    this.name = 'ConfigurationError';
    this.configIssue = configIssue;
  }
}

/**
 * Factory function to create appropriate error from HTTP response
 * @param {Object} error - Axios error object
 * @param {string} provider - Provider name
 * @returns {LLMError} Appropriate error instance
 */
const createErrorFromResponse = (error, provider) => {
  // Network errors (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new TimeoutError(provider, null, error.message, error);
    }
    return new NetworkError(provider, error.message, error);
  }

  const { status, data } = error.response;
  const errorMessage = data?.error?.message || data?.message || error.message;

  switch (status) {
    case 401:
    case 403:
      return new AuthenticationError(provider, errorMessage, error);

    case 404:
      // Try to extract model name from error or URL
      const model = data?.error?.model || extractModelFromUrl(error.config?.url);
      return new ModelNotFoundError(provider, model, errorMessage, error);

    case 400:
    case 422:
      // Check for content filtering
      if (errorMessage?.toLowerCase().includes('content') &&
          (errorMessage.toLowerCase().includes('filter') ||
           errorMessage.toLowerCase().includes('policy') ||
           errorMessage.toLowerCase().includes('safety'))) {
        return new ContentFilterError(provider, errorMessage, null, error);
      }
      return new ValidationError(provider, data?.error?.details || [], errorMessage, error);

    case 429:
      const retryAfter = error.response?.headers?.['retry-after'];
      // Check if it's quota vs rate limiting
      if (errorMessage?.toLowerCase().includes('quota') ||
          errorMessage?.toLowerCase().includes('billing')) {
        return new QuotaExceededError(provider, 'billing', errorMessage, error);
      }
      return new RateLimitError(provider, retryAfter, errorMessage, error);

    case 500:
    case 502:
    case 503:
    case 504:
      return new ServiceError(provider, status, errorMessage, error);

    default:
      return new LLMError(errorMessage || `HTTP ${status} error`, provider, status, error);
  }
};

/**
 * Extract model name from URL for better error messages
 * @param {string} url - Request URL
 * @returns {string|null} Model name if found
 */
const extractModelFromUrl = (url) => {
  if (!url) return null;

  // Try to extract model from common URL patterns
  const patterns = [
    /\/models\/([^\/\?]+)/,  // /models/model-name
    /model=([^&]+)/,         // ?model=model-name
    /\/([^\/]+)\/chat/       // /model-name/chat
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return decodeURIComponent(match[1]);
  }

  return null;
};

/**
 * Check if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} Whether the error is retryable
 */
const isRetryableError = (error) => {
  if (error instanceof RateLimitError) return true;
  if (error instanceof ServiceError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof NetworkError) return true;

  return false;
};

module.exports = {
  LLMError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  ValidationError,
  ServiceError,
  ModelNotFoundError,
  ContentFilterError,
  QuotaExceededError,
  ConfigurationError,
  createErrorFromResponse,
  isRetryableError
};
