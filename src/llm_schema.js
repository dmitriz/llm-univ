const { z } = require('zod');

/**
 * Universal LLM input schema that works across different providers
 * This schema defines the common interface for OpenAI, Anthropic, Google, GitHub Models, etc.
 */
const llm_input_schema = z.object({
  /**
   * Universal provider field - specifies which LLM provider to use
   * API Reference Documentation links for each provider:
   * - OpenAI: https://platform.openai.com/docs/api-reference (Complete REST API Reference)
   * - Anthropic: https://docs.anthropic.com/en/api (Complete REST API Reference)
   * - Google (Gemini): https://ai.google.dev/gemini-api/docs/api-overview (Complete REST API Reference)
   * - GitHub Models: https://docs.github.com/en/rest/models (Complete REST API Reference - Free, no API key required for basic usage)
   * - Hugging Face: https://huggingface.co/docs/api-inference/index (Complete REST API Reference - Free tier available with API token)
   * - Together AI: https://docs.together.ai/reference/completions (Free $1 credit to start)
   * - Perplexity: https://docs.perplexity.ai/reference/post_chat_completions (Real-time search-augmented AI, 2000 RPM standard rate limits)
   * - DeepSeek: https://platform.deepseek.com/api-docs (Chinese provider, free tier available)
   * - Qwen: https://help.aliyun.com/zh/dashscope/developer-reference/api-details (Alibaba Cloud, Chinese provider)
   * - SiliconFlow: https://siliconflow.cn/zh-cn/siliconcloud (Chinese provider, free tier available)
   * - Grok (X.AI): https://docs.x.ai/api
   * - Groq: https://console.groq.com/docs/quickstart
   * - OpenRouter: https://openrouter.ai/docs/api-reference
   * - Ollama: https://github.com/ollama/ollama/blob/main/docs/api.md (Local, no API key required)
   */
  provider: z.enum(['openai', 'anthropic', 'google', 'gh-models', 'huggingface', 'together', 'perplexity', 'deepseek', 'qwen', 'siliconflow', 'grok', 'groq', 'openrouter', 'ollama']),
  
  /**
   * API Key for authentication with the LLM provider
   * 
   * OPTIONAL for these providers (free usage without API key):
   * - GitHub Models: Free usage without API key (rate limited)
   * - Ollama: Local installation, typically no authentication needed
   * 
   * REQUIRED for providers with free credits/tiers:
   * - Together AI: Free $1 credit to start (API key required)
   * - DeepSeek: Free tier available (API key required)  
   * - SiliconFlow: Free tier available (API key required)
   * - Hugging Face: Free tier available (API token required)
   * 
   * REQUIRED for all other providers:
   * - OpenAI, Anthropic, Google, Grok, Groq, OpenRouter, Qwen
   * 
   * Reference: https://platform.openai.com/docs/api-reference/authentication
   */
  apiKey: z.string().optional(),
  
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
   * Seed for deterministic outputs (when supported by provider)
   * Same seed with same parameters should produce similar outputs
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-seed
   */
  seed: z.number().optional(),

  /**
   * Batch processing configuration for cost optimization and bulk operations
   * Supported providers: OpenAI (50% discount), Anthropic (50% discount), Groq (25% discount)
   * Reference: OpenAI Batch API, Anthropic Message Batches, Groq Batch API
   */
  batch: z.object({
    /**
     * Enable batch processing mode
     * When true, requests are queued for asynchronous batch processing
     */
    enabled: z.boolean(),
    
    /**
     * Custom identifier for tracking this request within the batch
     * Must be unique within the batch, used for result correlation
     */
    customId: z.string().optional(),
    
    /**
     * Processing window for batch completion
     * OpenAI: '24h' (24 hours)
     * Anthropic: Auto-determined (typically <1 hour)
     * Groq: '24h' to '7d' (24 hours to 7 days)
     */
    completionWindow: z.enum(['24h', '48h', '7d']).optional(),
    
    /**
     * Multiple requests for batch processing
     * Used when submitting multiple requests in a single batch
     */
    requests: z.array(z.object({
      customId: z.string(),
      model: z.string(),
      messages: z.array(z.object({
        role: z.enum(['system', 'user', 'assistant', 'tool']),
        content: z.string()
      })),
      maxTokens: z.number().optional(),
      temperature: z.number().optional(),
      // Additional parameters can be added as needed
    })).optional()
  }).optional()
});

module.exports = {
  llm_input_schema
};
