# LLM Universal Wrapper

A minimalistic universal wrapper for different LLM API providers.

## Purpose

This library provides a unified interface to interact with multiple LLM providers including:

**International Providers:**

- OpenAI
- Anthropic (Claude)
- Google (Gemini)
- GitHub Models (Free, no API key required)
- Hugging Face (Free tier available)
- Together AI (Free credits to start)
- Grok (X.AI)
- Groq
- OpenRouter
- Ollama (Local, no API key required)

**Chinese Providers:**

- DeepSeek (Free tier available)
- Qwen (Alibaba Cloud)
- SiliconFlow (Free tier available)

## Features

- Universal schema validation using Zod
- Provider-specific header configuration
- Consistent request/response handling
- Type-safe API interactions
- Batch processing support for cost optimization

## 🔄 Batch Processing

Several providers offer batch processing capabilities that can significantly reduce costs and improve efficiency for bulk operations:

### 🏢 Supported Providers

**🟢 OpenAI Batch API** *(✅ Recommended)*

- **💰 Cost Savings**: 50% discount on eligible endpoints
- **⏱️ Processing Window**: 24 hours
- **🎯 Support**: `/v1/chat/completions`, `/v1/embeddings`, `/v1/completions`
- **📄 Format**: JSONL file upload with custom IDs for tracking
- **📊 Status**: Generally available with comprehensive examples

**🔵 Anthropic Message Batches** *(✅ Recommended)*

- **💰 Cost Savings**: 50% discount on Message Batches API
- **⏱️ Processing Window**: Typically under 1 hour
- **🎯 Support**: All Claude models via `/v1/messages/batches`
- **📄 Format**: JSON array of requests with custom IDs
- **📊 Status**: Available in public beta

**🟡 Groq Batch Processing** *(⚠️ Limited)*

- **💰 Cost Savings**: 25% discount on batch requests  
- **⏱️ Processing Window**: 24 hours to 7 days
- **🎯 Support**: Limited model availability
- **📊 Status**: Check latest documentation for availability

### 🎯 Batch Processing Benefits

• **💰 Cost Optimization**: 25-50% savings on processing costs  
• **⚡ Higher Throughput**: Process thousands of requests efficiently  
• **🚀 Rate Limit Bypass**: Avoid individual request rate limits  
• **⏰ Asynchronous Processing**: Submit jobs and retrieve results later  
• **📊 Better Resource Planning**: Predictable processing windows

### 🛠️ Implementation Strategy

The universal wrapper will support batch processing through:

• **📝 Batch Schema Extension**: Additional batch-specific parameters  
• **🔍 Provider Detection**: Automatic batch capability detection  
• **🔄 Format Conversion**: Universal-to-provider batch format translation  
• **📈 Status Monitoring**: Unified batch job status tracking  
• **⚙️ Result Processing**: Automatic result file handling and parsing

### 💻 Usage Example (Planned)

```javascript
// Batch processing (when implemented)
const batchRequest = {
  provider: 'openai',
  apiKey: 'your-key',
  batch: {
    enabled: true,
    completionWindow: '24h',
    requests: [
      {
        customId: 'req-1',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }]
      },
      // ... more requests
    ]
  }
};
```

### 📊 Provider Support Matrix

| Provider    | Batch Support  | Cost Savings | Processing Time | Status              |
|-------------|----------------|--------------|-----------------|---------------------|
| OpenAI      | ✅ **Full**    | **50%**      | 24h             | ✅ Available        |
| Anthropic   | ✅ **Full**    | **50%**      | <1h             | 🧪 Beta             |
| Groq        | ⚠️ **Limited** | **25%**      | 24h-7d          | ⚠️ Limited          |
| Others      | ❌ None        | -            | -               | 📤 Individual only  |

## Usage

Define your input schema, provide your data, and let the wrapper handle provider-specific formatting and requests.

Copy your API keys to `.env` file:

```env
# Required API keys
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
GROK_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
TOGETHER_API_KEY=your_key_here

# Chinese providers
DEEPSEEK_API_KEY=your_key_here
QWEN_API_KEY=your_key_here  # Alibaba Cloud DashScope API key
SILICONFLOW_API_KEY=your_key_here

# Optional API keys (providers offer free tiers)
GITHUB_TOKEN=your_token_here  # Optional - for higher rate limits on GitHub Models
HUGGINGFACE_API_KEY=your_key_here  # Optional - for higher rate limits on Hugging Face

# Ollama configuration (local deployment)
# Note: OLLAMA_API_KEY is optional for most local Ollama setups
OLLAMA_API_KEY=your_key_here  
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```
