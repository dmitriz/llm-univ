/**
 * URL Configuration Module
 * 
 * This module centralizes all provider URL configurations for API endpoints,
 * including base URLs, chat endpoints, model endpoints, and public info URLs.
 */

// Base URLs for providers (without version paths)
const BASE_URLS = {
  openai: 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
  google: 'https://generativelanguage.googleapis.com',
  'gh-models': 'https://models.inference.ai.azure.com',
  huggingface: 'https://api-inference.huggingface.co/models',
  together: 'https://api.together.xyz',
  perplexity: 'https://api.perplexity.ai',
  deepseek: 'https://api.deepseek.com',
  qwen: 'https://dashscope.aliyuncs.com',
  siliconflow: 'https://api.siliconflow.cn',
  fireworks: 'https://api.fireworks.ai',
  grok: 'https://api.x.ai',
  groq: 'https://api.groq.com',
  openrouter: 'https://openrouter.ai',
  ollama: 'http://localhost:11434'
};

// Chat completion endpoints (with version paths)
const CHAT_ENDPOINTS = {
  openai: '/v1/chat/completions',
  anthropic: '/v1/messages',
  google: '/v1beta/models',
  'gh-models': '/chat/completions',
  huggingface: '', // Uses model name in path
  together: '/v1/chat/completions',
  perplexity: '/chat/completions',
  deepseek: '/chat/completions',
  qwen: '/compatible-mode/v1/chat/completions',
  siliconflow: '/v1/chat/completions',
  fireworks: '/inference/v1/chat/completions',
  grok: '/v1/chat/completions',
  groq: '/openai/v1/chat/completions',
  openrouter: '/api/v1/chat/completions',
  ollama: '/api/chat'
};

// Model list endpoints (with version paths)
const MODEL_ENDPOINTS = {
  openai: '/v1/models',
  anthropic: '/v1/models',
  google: '/v1beta/models',
  'gh-models': '/models',
  huggingface: '',
  together: '/v1/models',
  perplexity: '/models',
  deepseek: '/models',
  qwen: '/compatible-mode/v1/models',
  siliconflow: '/v1/models',
  fireworks: '/inference/v1/models',
  grok: '/v1/models',
  groq: '/openai/v1/models',
  openrouter: '/api/v1/models',
  ollama: '/api/tags'
};

// Batch endpoints configuration (with version paths)
const BATCH_ENDPOINTS = {
  openai: '/v1/batches',
  anthropic: '/v1/messages/batches',
  together: '/v1/batches',
  groq: '/openai/v1/batches',
  siliconflow: '/v1/batches',
  fireworks: '/inference/v1/batches',
};

// Public info endpoints that don't require API keys
const PUBLIC_ENDPOINTS = {
  openai: {
    pricing: 'https://openai.com/pricing',
    documentation: 'https://platform.openai.com/docs/models',
    status: 'https://status.openai.com/api/v2/status.json'
  },
  anthropic: {
    pricing: 'https://www.anthropic.com/pricing',
    documentation: 'https://docs.anthropic.com/en/docs/about-claude'
  },
  google: {
    pricing: 'https://ai.google.dev/pricing',
    documentation: 'https://ai.google.dev/gemini-api/docs/models'
  },
  'gh-models': {
    documentation: 'https://docs.github.com/en/github-models',
    pricing: 'https://docs.github.com/en/github-models/prototyping-with-ai-models'
  },
  huggingface: {
    pricing: 'https://huggingface.co/pricing',
    documentation: 'https://huggingface.co/docs/api-inference/index',
    search: 'https://huggingface.co/api/models?filter=text-generation&sort=downloads&direction=-1&limit=20'
  },
  together: {
    pricing: 'https://www.together.ai/pricing',
    documentation: 'https://docs.together.ai/docs/inference-models'
  },
  perplexity: {
    pricing: 'https://www.perplexity.ai/pro',
    documentation: 'https://docs.perplexity.ai/'
  },
  deepseek: {
    pricing: 'https://platform.deepseek.com/pricing',
    documentation: 'https://platform.deepseek.com/api-docs'
  },
  qwen: {
    pricing: 'https://help.aliyun.com/zh/dashscope/product-overview/billing-methods',
    documentation: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details'
  },
  siliconflow: {
    pricing: 'https://siliconflow.cn/pricing',
    documentation: 'https://docs.siliconflow.cn/'
  },
  fireworks: {
    pricing: 'https://fireworks.ai/pricing',
    documentation: 'https://docs.fireworks.ai/api-reference/introduction'
  },
  grok: {
    pricing: 'https://x.ai/pricing',
    documentation: 'https://docs.x.ai/api'
  },
  groq: {
    pricing: 'https://groq.com/pricing/',
    documentation: 'https://console.groq.com/docs/models'
  },
  openrouter: {
    pricing: 'https://openrouter.ai/docs/pricing',
    documentation: 'https://openrouter.ai/docs/models'
  },
  ollama: {
    library: 'https://ollama.com/library',
    documentation: 'https://github.com/ollama/ollama/blob/main/docs/api.md'
  }
};

/**
 * Get the full URL for a chat completion endpoint for a given provider
 * @param {string} provider - The provider name
 * @returns {string} The full URL for chat completions
 */
function getChatEndpoint(provider) {
  const baseUrl = BASE_URLS[provider];
  const chatPath = CHAT_ENDPOINTS[provider];
  
  if (!baseUrl || chatPath === undefined) {
    return undefined;
  }
  
  return `${baseUrl}${chatPath}`;
}

/**
 * Get the full URL for a model list endpoint for a given provider
 * @param {string} provider - The provider name
 * @returns {string} The full URL for the models list
 */
function getModelEndpoint(provider) {
  const baseUrl = BASE_URLS[provider];
  const modelPath = MODEL_ENDPOINTS[provider];
  
  if (!baseUrl || modelPath === undefined) {
    return undefined;
  }
  
  return `${baseUrl}${modelPath}`;
}

/**
 * Get the full URL for a batch operations endpoint for a given provider
 * @param {string} provider - The provider name
 * @returns {string} The full URL for batch operations
 */
function getBatchEndpoint(provider) {
  return `${BASE_URLS[provider]}${BATCH_ENDPOINTS[provider]}`;
}

/**
 * Special handling for Hugging Face URLs that require model names in path
 * @param {string} modelName - The name of the model
 * @returns {string} The full URL for the specific model
 */
function getHuggingFaceUrl(modelName) {
  return `${BASE_URLS.huggingface}/${modelName}`;
}

exports.BASE_URLS = BASE_URLS;
exports.CHAT_ENDPOINTS = CHAT_ENDPOINTS;
exports.MODEL_ENDPOINTS = MODEL_ENDPOINTS;
exports.BATCH_ENDPOINTS = BATCH_ENDPOINTS;
exports.PUBLIC_ENDPOINTS = PUBLIC_ENDPOINTS;
exports.getChatEndpoint = getChatEndpoint;
exports.getModelEndpoint = getModelEndpoint;
exports.getBatchEndpoint = getBatchEndpoint;
exports.getHuggingFaceUrl = getHuggingFaceUrl;
