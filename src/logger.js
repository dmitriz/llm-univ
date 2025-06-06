/**
 * Logging and monitoring utilities for LLM Universal Library
 * Provides structured logging with different levels and optional monitoring hooks
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level from environment
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LLM_LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

// Enable debug logging
const DEBUG_ENABLED = process.env.LLM_DEBUG === 'true' || process.env.NODE_ENV === 'development';

// Disable logging during tests unless explicitly enabled
const LOGGING_ENABLED = process.env.NODE_ENV !== 'test' || process.env.LLM_LOG_IN_TESTS === 'true';

/**
 * Core logging function
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 */
const log = (level, message, metadata = {}) => {
  // Skip logging if disabled (e.g., during tests)
  if (!LOGGING_ENABLED) {
    return;
  }

  const levelNum = LOG_LEVELS[level.toUpperCase()];

  if (levelNum > CURRENT_LOG_LEVEL) {
    return; // Skip if log level is too high
  }

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...metadata
  };

  // Format for console output
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  // Output to appropriate console method
  switch (level.toUpperCase()) {
    case 'ERROR':
      console.error(formattedMessage, metadata);
      break;
    case 'WARN':
      console.warn(formattedMessage, metadata);
      break;
    case 'DEBUG':
      if (DEBUG_ENABLED) {
        console.debug(formattedMessage, metadata);
      }
      break;
    default:
      console.log(formattedMessage, metadata);
  }

  // Call monitoring hooks if available
  if (global.llmMonitoringHooks) {
    global.llmMonitoringHooks.forEach(hook => {
      try {
        hook(logEntry);
      } catch (error) {
        console.error('Monitoring hook error:', error);
      }
    });
  }
};

/**
 * Log request start
 * @param {string} provider - Provider name
 * @param {string} model - Model name
 * @param {Object} metadata - Additional metadata
 */
const logRequestStart = (provider, model, metadata = {}) => {
  log('info', `Starting request to ${provider}`, {
    provider,
    model,
    type: 'request_start',
    ...metadata
  });
};

/**
 * Log request success
 * @param {string} provider - Provider name
 * @param {string} model - Model name
 * @param {number} duration - Request duration in ms
 * @param {Object} usage - Token usage information
 * @param {Object} metadata - Additional metadata
 */
const logRequestSuccess = (provider, model, duration, usage = {}, metadata = {}) => {
  log('info', `Request to ${provider} completed successfully`, {
    provider,
    model,
    duration,
    usage,
    type: 'request_success',
    ...metadata
  });
};

/**
 * Log request error
 * @param {string} provider - Provider name
 * @param {string} model - Model name
 * @param {Error} error - Error object
 * @param {number} duration - Request duration in ms
 * @param {number} attempt - Attempt number
 * @param {Object} metadata - Additional metadata
 */
const logRequestError = (provider, model, error, duration, attempt = 1, metadata = {}) => {
  log('error', `Request to ${provider} failed`, {
    provider,
    model,
    error: {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode || error.response?.status,
      code: error.code
    },
    duration,
    attempt,
    type: 'request_error',
    ...metadata
  });
};

/**
 * Log retry attempt
 * @param {string} provider - Provider name
 * @param {string} model - Model name
 * @param {number} attempt - Attempt number
 * @param {number} delay - Delay before retry in ms
 * @param {string} reason - Reason for retry
 * @param {Object} metadata - Additional metadata
 */
const logRetryAttempt = (provider, model, attempt, delay, reason, metadata = {}) => {
  log('warn', `Retrying request to ${provider}`, {
    provider,
    model,
    attempt,
    delay,
    reason,
    type: 'retry_attempt',
    ...metadata
  });
};

/**
 * Log rate limit hit
 * @param {string} provider - Provider name
 * @param {number} retryAfter - Retry after seconds
 * @param {Object} metadata - Additional metadata
 */
const logRateLimit = (provider, retryAfter, metadata = {}) => {
  log('warn', `Rate limit hit for ${provider}`, {
    provider,
    retryAfter,
    type: 'rate_limit',
    ...metadata
  });
};

/**
 * Log security event
 * @param {string} event - Security event type
 * @param {string} details - Event details
 * @param {Object} metadata - Additional metadata
 */
const logSecurityEvent = (event, details, metadata = {}) => {
  log('warn', `Security event: ${event}`, {
    event,
    details,
    type: 'security_event',
    ...metadata
  });
};

/**
 * Log performance metrics
 * @param {string} provider - Provider name
 * @param {Object} metrics - Performance metrics
 */
const logPerformanceMetrics = (provider, metrics) => {
  log('debug', `Performance metrics for ${provider}`, {
    provider,
    metrics,
    type: 'performance_metrics'
  });
};

/**
 * Add a monitoring hook
 * @param {Function} hook - Function to call with log entries
 */
const addMonitoringHook = (hook) => {
  if (!global.llmMonitoringHooks) {
    global.llmMonitoringHooks = [];
  }
  global.llmMonitoringHooks.push(hook);
};

/**
 * Remove a monitoring hook
 * @param {Function} hook - Hook function to remove
 */
const removeMonitoringHook = (hook) => {
  if (global.llmMonitoringHooks) {
    const index = global.llmMonitoringHooks.indexOf(hook);
    if (index > -1) {
      global.llmMonitoringHooks.splice(index, 1);
    }
  }
};

/**
 * Create a request timer
 * @returns {Object} Timer object with start time and stop function
 */
const createTimer = () => {
  const startTime = Date.now();

  return {
    startTime,
    stop: () => Date.now() - startTime
  };
};

/**
 * Debug helper for development
 * @param {string} message - Debug message
 * @param {Object} data - Debug data
 */
const debug = (message, data = {}) => {
  if (DEBUG_ENABLED) {
    log('debug', message, data);
  }
};

module.exports = {
  LOG_LEVELS,
  log,
  logRequestStart,
  logRequestSuccess,
  logRequestError,
  logRetryAttempt,
  logRateLimit,
  logSecurityEvent,
  logPerformanceMetrics,
  addMonitoringHook,
  removeMonitoringHook,
  createTimer,
  debug
};
