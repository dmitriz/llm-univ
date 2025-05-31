/**
 * Pure Functional Rate Limiting Module
 *
 * A standalone, dependency-free rate limiting implementation using pure functions.
 * This module provides:
 * - Token-based rate limiting (TPM)
 * - Request-based rate limiting (RPM)
 * - Multi-window tracking (minute and day)
 *
 * The module maintains state in an immutable way, making it suitable for use in
 * functional programming patterns and easy testing.
 *
 * Usage:
 * 1. Import the functions:
 *    const { cleanState, recordRequest, checkRateLimit } = require('./rate_limit_functions');
 *
 * 2. Initialize state:
 *    let state = {};
 *
 * 3. Before each request:
 *    state = cleanState(state, 'providerName');
 *    const limitCheck = checkRateLimit(state, 'providerName', 'tier', tokens, limits);
 *    if (!limitCheck.allowed) handleLimitExceeded(limitCheck);
 *
 * 4. After successful request:
 *    state = recordRequest(state, 'providerName', tokens);
 *
 * Note: This module has no external dependencies and is ready for production use.
 */

/**
 * Cleans expired entries from rate limit state and recalculates token usage
 *
 * This function:
 * 1. Filters out expired requests (older than 1 minute for minute window, older than 1 day for day window)
 * 2. Recalculates current token usage by summing tokens from non-expired requests
 * 3. Returns a new state object with cleaned data (immutable update)
 *
 * @param {Object} state - Current rate limit state (immutable)
 * @param {string} provider - Name of API provider (e.g., 'openai', 'anthropic')
 * @returns {Object} New state with cleaned data for the provider
 */
function cleanState(state, provider) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;   // 60 seconds
    const oneDayAgo = now - 86400000;    // 24 hours
    
    // Get current provider state or initialize empty state
    const providerState = state[provider] || {
        minute: [],   // Array of {time, tokens} for minute window
        day: [],      // Array of {time, tokens} for day window
        tokens: { minute: 0, day: 0 } // Current token counts (cached)
    };
    
    // Filter minute window: keep only entries from last minute
    const cleanedMinute = providerState.minute.filter(entry => entry.time > oneMinuteAgo);
    // Sum tokens from non-expired minute entries
    const minuteTokens = cleanedMinute.reduce((sum, entry) => sum + entry.tokens, 0);
    
    // Filter day window: keep only entries from last 24 hours
    const cleanedDay = providerState.day.filter(entry => entry.time > oneDayAgo);
    // Sum tokens from non-expired day entries
    const dayTokens = cleanedDay.reduce((sum, entry) => sum + entry.tokens, 0);
    
    // Return new state with updated provider data
    return {
        ...state,
        [provider]: {
            minute: cleanedMinute,
            day: cleanedDay,
            tokens: {
                minute: minuteTokens,
                day: dayTokens
            }
        }
    };
}

/**
 * Records a new request in the rate limit state
 *
 * This function:
 * 1. First cleans the state to remove expired entries
 * 2. Adds the new request to both minute and day windows
 * 3. Updates the token counters
 * 4. Returns a new state object (immutable update)
 *
 * @param {Object} state - Current rate limit state
 * @param {string} provider - Name of API provider
 * @param {number} tokens - Token cost of the request (default 0 for request-count limits)
 * @returns {Object} New state with recorded request
 */
function recordRequest(state, provider, tokens = 0) {
    const now = Date.now();
    // First clean existing state to remove expired entries
    const cleanedState = cleanState(state, provider);
    
    // Get current provider state from cleaned state (or initialize if new)
    const providerState = cleanedState[provider] || {
        minute: [],
        day: [],
        tokens: { minute: 0, day: 0 }
    };
    
    // Create new state with the recorded request
    return {
        ...cleanedState,
        [provider]: {
            // Add new request to minute window with timestamp and token cost
            minute: [...providerState.minute, { time: now, tokens }],
            // Add same request to day window
            day: [...providerState.day, { time: now, tokens }],
            // Update token counters by adding current request's tokens
            tokens: {
                minute: providerState.tokens.minute + tokens,
                day: providerState.tokens.day + tokens
            }
        }
    };
}

/**
 * Checks if a new request would exceed rate limits
 *
 * This function:
 * 1. Cleans the current state to remove expired entries
 * 2. Checks request-per-minute (RPM) limits
 * 3. Checks tokens-per-minute (TPM) limits
 * 4. Returns an object indicating if request is allowed and any wait time
 *
 * @param {Object} state - Current rate limit state
 * @param {string} provider - Name of API provider
 * @param {string} tier - Rate limit tier (currently unused, reserved for future)
 * @param {number} tokens - Tokens required for the new request
 * @param {Object} limits - Rate limits configuration object
 * @returns {Object} Result object with:
 *   - allowed: boolean (if request is allowed)
 *   - waitTime: number (milliseconds to wait if not allowed)
 *   - reason: string (explanation of the decision)
 */
function checkRateLimit(state, provider, tier, tokens, limits) {
    // If no limits defined, allow the request
    if (!limits) {
        return { allowed: true, waitTime: 0, reason: 'No limits defined' };
    }
    
    // Clean state before checking limits
    const cleanedState = cleanState(state, provider);
    const providerState = cleanedState[provider] || {
        minute: [],
        day: [],
        tokens: { minute: 0, day: 0 }
    };
    
    // Check requests per minute (RPM) limit
    if (limits.requests_per_minute && providerState.minute.length >= limits.requests_per_minute) {
        // Find oldest request in current minute window
        const oldestRequest = Math.min(...providerState.minute.map(entry => entry.time));
        // Calculate how long until the oldest request expires (freeing up a slot)
        const waitTime = 60000 - (Date.now() - oldestRequest);
        
        return {
            allowed: false,
            waitTime: Math.max(0, waitTime),
            reason: `RPM limit exceeded (${providerState.minute.length}/${limits.requests_per_minute})`
        };
    }
    
    // Check tokens per minute (TPM) limit
    if (limits.tokens_per_minute && (providerState.tokens.minute + tokens) > limits.tokens_per_minute) {
        return {
            allowed: false,
            waitTime: 60000, // Wait 1 minute if TPM exceeded
            reason: `TPM limit would be exceeded (${providerState.tokens.minute + tokens}/${limits.tokens_per_minute})`
        };
    }
    
    // Request is within all limits
    return { allowed: true, waitTime: 0, reason: 'Within limits' };
}

module.exports = {
    cleanState,
    recordRequest,
    checkRateLimit
};