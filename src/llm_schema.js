const { z } = require('zod');

/**
 * Universal LLM input schema that works across different providers
 * This schema defines the common interface for OpenAI, Anthropic, Google, Azure OpenAI, etc.
 */
const llm_input_schema = z.object({
  // Universal provider field
  provider: z.enum(['openai', 'anthropic', 'google', 'azure-openai', 'grok', 'groq', 'openrouter', 'ollama']),
  
  // Authentication
  apiKey: z.string(),
  
  // Model configuration
  model: z.string(),
  
  // Messages (OpenAI/Anthropic style)
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant', 'tool']),
    content: z.string()
  })),
  
  // Common parameters across providers
  maxTokens: z.number().min(1).max(100000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
  stream: z.boolean().optional(),
  
  // Optional parameters
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  
  // Tool/function calling support
  tools: z.array(z.object({
    type: z.literal('function'),
    function: z.object({
      name: z.string(),
      description: z.string().optional(),
      parameters: z.record(z.unknown()).optional()
    })
  })).optional(),
  
  // Response format
  responseFormat: z.object({
    type: z.enum(['text', 'json_object'])
  }).optional(),
  
  // Additional metadata
  user: z.string().optional(),
  seed: z.number().optional()
});

module.exports = {
  llm_input_schema
};
