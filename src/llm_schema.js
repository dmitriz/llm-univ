const { z } = require('zod');

/**
 * Universal LLM input schema that works across different providers
 * This schema defines the common interface for OpenAI, Anthropic, Google, GitHub Models, etc.
 */
const llm_input_schema = z.object({
  /**
   * Universal provider field - specifies which LLM provider to use
   * 
   * Complete API Reference Documentation for each provider:
   * - OpenAI: https://platform.openai.com/docs/api-reference (Complete REST API Reference)
   * - Anthropic: https://docs.anthropic.com/en/api (Complete REST API Reference) 
   * - Google (Gemini): https://ai.google.dev/gemini-api/docs/models (Complete REST API Reference with Grounding Search)
   * - GitHub Models: https://docs.github.com/en/rest/models (Complete REST API Reference - Free, no API key required)
   * - Hugging Face: https://huggingface.co/docs/api-inference/index (Complete REST API Reference - Free tier available)
   * - Together AI: https://docs.together.ai/reference/completions (Complete REST API Reference with web search tools)
   * - Perplexity: https://docs.perplexity.ai/reference/post_chat_completions (Real-time search-augmented AI, complete API reference)
   * - DeepSeek: https://platform.deepseek.com/api-docs (Complete REST API Reference - Chinese provider with free tier)
   * - Qwen: https://help.aliyun.com/zh/dashscope/developer-reference/api-details (Complete API Reference - Alibaba Cloud)
   * - SiliconFlow: https://docs.siliconflow.cn/api-reference (Complete REST API Reference - Chinese provider)
   * - Grok (X.AI): https://console.x.ai/docs/api-reference (Complete REST API Reference with live web search capabilities)
   * - Groq: https://console.groq.com/docs/api-reference (Complete REST API Reference with web search tools)
   * - OpenRouter: https://openrouter.ai/docs/api-reference (Complete REST API Reference - Multi-provider gateway)
   * - Ollama: https://github.com/ollama/ollama/blob/main/docs/api.md (Complete API Reference - Local deployment)
   */
  provider: z.enum(['openai', 'anthropic', 'google', 'gh-models', 'huggingface', 'together', 'perplexity', 'deepseek', 'qwen', 'siliconflow', 'grok', 'groq', 'openrouter', 'ollama']),
  
  /**
   * API Key for authentication with the LLM provider
   * 
   * Provider Authentication Requirements:
   * 
   * NO API KEY REQUIRED (Free usage without authentication):
   * - GitHub Models: Free usage without API key, rate limited to community tier
   *   Reference: https://docs.github.com/en/rest/models#rate-limiting
   * - Ollama: Local installation, typically no authentication needed
   *   Reference: https://github.com/ollama/ollama/blob/main/docs/api.md#authentication
   * 
   * FREE TIERS AVAILABLE (API key required but free credits/usage provided):
   * - Together AI: Free $1 credit to start, extensive free tier
   *   Reference: https://docs.together.ai/docs/quickstart#step-1-get-an-api-key
   * - DeepSeek: Free tier available with API key registration
   *   Reference: https://platform.deepseek.com/api-docs#authentication
   * - SiliconFlow: Free tier available with generous limits
   *   Reference: https://docs.siliconflow.cn/quick-start/authentication
   * - Hugging Face: Free tier available for most models with API token
   *   Reference: https://huggingface.co/docs/api-inference/quicktour#get-your-api-token
   * - Groq: Free tier with high speed inference
   *   Reference: https://console.groq.com/docs/quickstart#step-1-create-an-api-key
   * 
   * PAYMENT REQUIRED (Minimum deposit or subscription required):
   * - OpenAI: Requires payment method and minimum deposit ($5-10)
   *   Reference: https://platform.openai.com/docs/api-reference/authentication
   * - Anthropic: Pay-per-use pricing, requires payment method
   *   Reference: https://docs.anthropic.com/en/api/getting-started#authentication
   * - Google/Gemini: Free tier available, requires billing account for higher usage
   *   Reference: https://ai.google.dev/gemini-api/docs/api-key
   * - Grok (X.AI): Subscription-based access through X Premium
   *   Reference: https://console.x.ai/docs/authentication
   * - Perplexity: Limited free tier, subscription for higher usage
   *   Reference: https://docs.perplexity.ai/docs/getting-started#authentication
   * - OpenRouter: Pay-per-use model with free credits for testing
   *   Reference: https://openrouter.ai/docs/authentication
   * - Qwen: Alibaba Cloud billing required for production usage
   *   Reference: https://help.aliyun.com/zh/dashscope/developer-reference/api-details#auth
   */
  apiKey: z.string().optional(),
  
  /**
   * Model identifier/name to use for the LLM request
   * Each provider has different model names and capabilities
   * 
   * Model Documentation by Provider:
   * - OpenAI: https://platform.openai.com/docs/models (GPT-4, GPT-3.5, o1, o3 series)
   * - Anthropic: https://docs.anthropic.com/en/docs/models-overview (Claude 3, Claude 3.5 series)
   * - Google: https://ai.google.dev/gemini-api/docs/models/gemini (Gemini Pro, Flash, Ultra)
   * - Groq: https://console.groq.com/docs/models (Fast inference for Llama, Mixtral, Gemma)
   * - Together AI: https://docs.together.ai/docs/inference-models (Open source models)
   * - Perplexity: https://docs.perplexity.ai/docs/model-cards (Search-augmented models)
   * - Grok: https://console.x.ai/docs/models (Grok models with live web search)
   * 
   * Real-time Search Capabilities:
   * - Grok (X.AI): Built-in live web search and real-time data access
   * - Perplexity: Specialized search-augmented AI models  
   * - Google Gemini: Grounding with Search feature for real-time information
   * - OpenAI: Web browsing capabilities in certain configurations
   * - Groq: Web search tools integration
   * 
   * Function Calling Support:
   * - OpenAI: Advanced function calling and structured outputs
   * - Anthropic: Tool use capabilities with Claude models
   * - Google: Function calling with Gemini models
   * - Together AI: Function calling with JSON schema support
   * - Groq: Tool use support for compatible models
   */
  model: z.string(),
  
  /**
   * Messages array following the chat completion format
   * Standard format used by OpenAI and adopted by most providers
   * 
   * Message Structure:
   * - role: Defines the message sender (system, user, assistant, tool)
   * - content: The actual message text or structured content
   * 
   * Message Types:
   * - system: Instructions for the AI assistant's behavior
   * - user: Input from the end user
   * - assistant: Previous responses from the AI
   * - tool: Results from function/tool calls
   * 
   * Multi-modal Support (where available):
   * - OpenAI: Text, images, audio (GPT-4 Vision, GPT-4 Audio)
   * - Google: Text, images, video (Gemini models)
   * - Anthropic: Text, images (Claude 3 series)
   * - Together AI: Text, images, video in single requests
   * 
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages
   * Advanced usage: https://platform.openai.com/docs/guides/vision
   */
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string()
  })),
  
  /**
   * Maximum number of tokens to generate in the response
   * Controls the length of the generated output
   * 
   * Token Limits by Provider:
   * - OpenAI: Up to 128K context, varies by model (GPT-4: 8K-128K, o1: 200K)
   * - Anthropic: Up to 200K tokens (Claude 3 series)
   * - Google: Up to 2M tokens (Gemini 1.5 Pro)
   * - Groq: Model-dependent, optimized for speed
   * - Together AI: Varies by model, up to 200K+ for some
   * 
   * Cost Optimization:
   * - Lower max_tokens reduces costs for all providers
   * - Use batch processing for additional savings where available
   * 
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_tokens
   * Token counting: https://platform.openai.com/docs/guides/text-generation/managing-tokens
   */
  maxTokens: z.number().min(1).max(100000).optional(),
  
  /**
   * Temperature controls randomness in the response (0-2)
   * Higher values make output more random, lower values more focused and deterministic
   * 
   * Recommended Values:
   * - 0: Deterministic, consistent outputs (good for factual queries)
   * - 0.1-0.3: Slightly creative but still focused
   * - 0.7-0.9: Balanced creativity and coherence (default for most use cases)
   * - 1.0+: More creative and varied outputs
   * - 2.0: Maximum randomness (rarely recommended)
   * 
   * Provider Differences:
   * - Most providers support 0-2 range
   * - Some providers may have different defaults
   * - Cannot be used simultaneously with top_p in some providers
   * 
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature
   * Best practices: https://platform.openai.com/docs/guides/text-generation/temperature-and-top_p
   */
  temperature: z.number().min(0).max(2).optional(),
  
  /**
   * Top-p (nucleus sampling) controls diversity via cumulative probability (0-1)
   * Alternative to temperature for controlling randomness
   * 
   * How it works:
   * - 0.1: Only consider tokens comprising top 10% probability mass
   * - 0.5: Consider tokens comprising top 50% probability mass  
   * - 0.9: Consider tokens comprising top 90% probability mass (common default)
   * - 1.0: Consider all tokens (equivalent to no filtering)
   * 
   * Usage Guidelines:
   * - Use EITHER temperature OR top_p, not both simultaneously
   * - Lower values = more focused outputs
   * - Higher values = more diverse outputs
   * - Generally recommended over temperature for most applications
   * 
   * Provider Support:
   * - OpenAI: Full support (0-1 range)
   * - Anthropic: Supported as top_p
   * - Google: Supported as topP
   * - Most other providers: Standard support
   * 
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_p
   * Comparison guide: https://platform.openai.com/docs/guides/text-generation/temperature-and-top_p
   */
  topP: z.number().min(0).max(1).optional(),
  
  /**
   * Whether to stream the response as it's generated (boolean)
   * When true, partial messages are sent as server-sent events
   * 
   * Streaming Benefits:
   * - Real-time response display (better user experience)
   * - Lower perceived latency for long responses
   * - Ability to process response chunks as they arrive
   * 
   * Implementation Notes:
   * - Returns Server-Sent Events (SSE) format
   * - Requires special handling in client code
   * - Each chunk contains partial response data
   * - Stream ends with [DONE] message
   * 
   * Provider Support:
   * - OpenAI: Full streaming support with delta updates
   * - Anthropic: Streaming with event-based chunks
   * - Google: Streaming support for Gemini models
   * - Groq: High-speed streaming (optimized inference)
   * - Together AI: Streaming support for real-time applications
   * - Most providers: Standard SSE implementation
   * 
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-stream
   * Streaming guide: https://platform.openai.com/docs/api-reference/streaming
   */
  stream: z.boolean().optional(),
  
  /**
   * Stop sequences - strings where the model should stop generating
   * Can be a single string or array of strings
   * Up to 4 sequences supported by most providers
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
   * 
   * Function Calling Capabilities by Provider:
   * - OpenAI: Advanced function calling, JSON mode, structured outputs
   *   Reference: https://platform.openai.com/docs/guides/function-calling
   * - Anthropic: Tool use capabilities with Claude models
   *   Reference: https://docs.anthropic.com/en/docs/tool-use
   * - Google: Function calling with Gemini models
   *   Reference: https://ai.google.dev/gemini-api/docs/function-calling
   * - Together AI: Function calling with JSON schema support
   *   Reference: https://docs.together.ai/docs/function-calling
   * - Groq: Tool use support for compatible models
   *   Reference: https://console.groq.com/docs/tool-use
   * 
   * Web Search Tools (Real-time capabilities):
   * - Grok (X.AI): Built-in live web search, real-time X/Twitter data
   * - Perplexity: Native search-augmented generation
   * - Google Gemini: Grounding with Search tool
   * - OpenAI: Web browsing tool (ChatGPT plugins)
   * - Groq: Web search integration via tools
   * - Together AI: Web search via function calling
   * 
   * Tool Structure:
   * - type: Currently only 'function' supported
   * - function.name: Unique identifier for the function
   * - function.description: Clear description of what the function does
   * - function.parameters: JSON schema defining expected parameters
   * 
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-tools
   * Advanced usage: https://platform.openai.com/docs/guides/function-calling/advanced-usage
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
   * Controls how the model formats its response
   * 
   * Format Types:
   * - 'text': Regular text response (default for most use cases)
   * - 'json_object': Forces response to be valid JSON
   * 
   * JSON Mode Benefits:
   * - Guaranteed valid JSON output
   * - Useful for data extraction, API responses
   * - Reduces parsing errors in applications
   * - Enables structured data workflows
   * 
   * Provider Support:
   * - OpenAI: Full JSON mode support, structured outputs
   *   Reference: https://platform.openai.com/docs/guides/structured-outputs
   * - Anthropic: JSON mode available with Claude models
   * - Google: JSON mode support with Gemini
   * - Together AI: JSON schema validation
   * - Groq: JSON mode for compatible models
   * 
   * Advanced Features (OpenAI):
   * - JSON Schema validation for strict structure
   * - Structured outputs with guaranteed schema compliance
   * - Function calling with structured responses
   * 
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-response_format
   * JSON mode guide: https://platform.openai.com/docs/guides/text-generation/json-mode
   */
  responseFormat: z.object({
    type: z.enum(['text', 'json_object'])
  }).optional(),
  
  /**
   * Seed for deterministic outputs (when supported by provider)
   * Same seed with same parameters should produce similar outputs
   * 
   * Deterministic Generation:
   * - Helps ensure reproducible results for testing
   * - Useful for A/B testing different prompts
   * - Enables consistent outputs for specific use cases
   * - Not guaranteed to be 100% identical across all providers
   * 
   * Provider Support:
   * - OpenAI: Full seed support with system_fingerprint tracking
   *   Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-seed
   * - Anthropic: Limited deterministic support
   * - Google: Seed support in some models
   * - Groq: Basic seed support
   * - Others: Varies by provider and model
   * 
   * Best Practices:
   * - Use integer values for seeds
   * - Combine with temperature=0 for maximum determinism
   * - Monitor system_fingerprint for backend changes
   * - Test determinism with your specific use case
   * 
   * Reference: https://platform.openai.com/docs/api-reference/chat/create#chat-create-seed
   */
  seed: z.number().optional(),

  /**
   * Batch processing configuration for cost optimization and bulk operations
   * Supported providers: OpenAI (50% discount), Anthropic (50% discount), Groq (25% discount), SiliconFlow (estimated discount)
   * Reference: OpenAI Batch API, Anthropic Message Batches, Groq Batch API, SiliconFlow Batch API
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
    })).optional(),
    
    /**
     * File ID for uploaded JSONL batch file
     * Required for Groq and OpenAI batch processing
     * File must be uploaded via Files API before creating batch
     */
    inputFileId: z.string().optional(),
    
    /**
     * Optional metadata to associate with the batch
     * Useful for tracking and organization
     */
    metadata: z.record(z.string()).optional(),
    
    /**
     * Batch size for Together AI batch processing
     * Controls how many requests are processed together
     * Default: 10
     * Provider: Together AI only
     */
    batchSize: z.number().min(1).max(100).optional(),
    
    /**
     * Timeout in seconds for Together AI batch processing
     * Maximum time to wait for batch completion
     * Default: 300 seconds (5 minutes)
     * Provider: Together AI only
     */
    timeout: z.number().min(60).max(3600).optional()
  }).optional()
});

module.exports = {
  llm_input_schema
};
