const { z } = require('zod');

/**
 * Universal LLM input schema that works across different providers
 * This schema defines the common interface for OpenAI, Anthropic, Google, Azure OpenAI, etc.
 */
const llm_input_schema = z.object({
  /**
   * Universal provider field - specifies which LLM provider to use
   * Documentation links for each provider:
   * - OpenAI: https://platform.openai.com/docs/api-reference
   * - Anthropic: https://docs.anthropic.com/en/api
   * - Google (Gemini): https://ai.google.dev/gemini-api/docs
   * - Azure OpenAI: https://learn.microsoft.com/en-us/azure/ai-services/openai/reference
   * - Grok (X.AI): https://docs.x.ai/api
   * - Groq: https://console.groq.com/docs/quickstart
   * - OpenRouter: https://openrouter.ai/docs
   * - Ollama: https://github.com/ollama/ollama/blob/main/docs/api.md
   */
  provider: z.enum(['openai', 'anthropic', 'google', 'azure-openai', 'grok', 'groq', 'openrouter', 'ollama']),
  
  /**
   * API Key for authentication with the LLM provider
   * Required for all providers to authenticate API requests
   * Reference: https://platform.openai.com/docs/api-reference/authentication
   */
  apiKey: z.string(),
  
  /**
   * Model identifier/name to use for the LLM request
   * Each provider has different model names (e.g., gpt-4, claude-3, gemini-pro)
   * OpenAI models: https://platform.openai.com/docs/models
   * Anthropic models: https://docs.anthropic.com/en/docs/models-overview
   */
  model: z.string(),
  
  /**
   * Messages array following the chat completion format
   * Standard format used by OpenAI and adopted by most providers
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages
   */
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string()
  })),
  
  /**
   * Maximum number of tokens to generate in the response
   * Controls the length of the generated output
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_tokens
   */
  maxTokens: z.number().min(1).max(100000).optional(),
  
  /**
   * Temperature controls randomness in the response (0-2)
   * 0 = deterministic, 2 = very random
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature
   */
  temperature: z.number().min(0).max(2).optional(),
  
  /**
   * Top-p (nucleus sampling) controls diversity via cumulative probability (0-1)
   * Alternative to temperature for controlling randomness
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_p
   */
  topP: z.number().min(0).max(1).optional(),
  
  /**
   * Whether to stream the response as it's generated (boolean)
   * When true, partial messages are sent as server-sent events
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-stream
   */
  stream: z.boolean().optional(),
  
  /**
   * Stop sequences - strings where the model should stop generating
   * Can be a single string or array of strings
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop
   */
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  
  /**
   * Presence penalty (-2 to 2) - penalizes new tokens based on whether they appear in the text so far
   * Positive values increase likelihood of talking about new topics
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-presence_penalty
   */
  presencePenalty: z.number().min(-2).max(2).optional(),
  
  /**
   * Frequency penalty (-2 to 2) - penalizes new tokens based on their existing frequency in the text
   * Positive values decrease likelihood of repeating the same line verbatim
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-frequency_penalty
   */
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  
  /**
   * Tools/Functions that the model can call during the conversation
   * Enables function calling capabilities for structured interactions
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-tools
   * Function calling guide: https://platform.openai.com/docs/guides/function-calling
   */
  tools: z.array(z.object({
    type: z.literal('function'),
    function: z.object({
      name: z.string(),
      description: z.string().optional(),
      parameters: z.record(z.unknown()).optional()
    })
  })).optional(),
  
  /**
   * Response format specification for structured outputs
   * 'text' - regular text response, 'json_object' - structured JSON response
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-response_format
   * JSON mode guide: https://platform.openai.com/docs/guides/text-generation/json-mode
   */
  responseFormat: z.object({
    type: z.enum(['text', 'json_object'])
  }).optional(),
  
  /**
   * User identifier for tracking and abuse monitoring
   * Helps providers identify and track usage patterns
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-user
   */
  user: z.string().optional(),
  
  /**
   * Seed for deterministic outputs (when supported by provider)
   * Same seed with same parameters should produce similar outputs
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-seed
   */
  seed: z.number().optional()
});

module.exports = {
  llm_input_schema
};
