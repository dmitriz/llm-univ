# LLM Universal Wrapper

A minimalistic universal wrapper for different LLM API providers with comprehensive batch processing and rate limit handling.

## Latest Updates (May 30, 2025)

- **✅ Fixed Groq Batch Processing**: Implemented proper support for Groq batch API via `/v1/batches`
- **✅ Provider Information Collection**: Expanded collector to 20 providers, 405 models
- **✅ Comprehensive Documentation**: Added detailed provider_summary.md with capabilities matrix
- **📋 Future Tasks**: Created FUTURE_TASKS.md to document pending research and implementation

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

#### OpenAI Batch API ✅

*Recommended Implementation*

- 💰 Cost Savings: 50% discount on eligible endpoints
- Method: Upload JSONL file → Create batch → Monitor status → Download results
- Implementation: Fully integrated via `create_batch_request` and `create_batch_jsonl`
- Processing Window: 24 hours
- Support: `/v1/chat/completions`, `/v1/embeddings`, `/v1/completions`
- Format: JSONL file upload with custom IDs for tracking
- Status: Generally available with comprehensive examples

#### Anthropic Message Batches ✅

*Recommended Implementation*

- 💰 Cost Savings: 50% discount on Message Batches API
- Processing Window: Typically under 1 hour
- Support: All Claude models via `/v1/messages/batches`
- Format: JSON array of requests with custom IDs
- Status: Available in public beta with stable performance
- Best For: Bulk analysis, content moderation, research applications

#### Groq Batch Processing ⚠️

*Limited Availability*

- 💰 Cost Savings: 25% discount on batch requests
- Processing Window: 24 hours to 7 days (variable based on queue)
- Support: Limited model availability
- Status: Check latest documentation for availability
- Best For: Non-urgent bulk processing when extreme speed is not required

### Batch Processing Benefits

- Cost Optimization: 25-50% savings on processing costs
- Higher Throughput: Process thousands of requests efficiently
- Rate Limit Bypass: Avoid individual request rate limits
- Asynchronous Processing: Submit jobs and retrieve results later
- Better Resource Planning: Predictable processing windows

### Implementation Strategy

The universal wrapper supports batch processing through:

- Batch Schema Extension: Additional batch-specific parameters
- Provider Detection: Automatic batch capability detection
- Format Conversion: Universal-to-provider batch format translation
- Status Monitoring: Unified batch job status tracking
- Result Processing: Automatic result file handling and parsing

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

## 💰 Comprehensive Cost Analysis

### 🆓 No API Key Required (Completely Free)

**🏠 Ollama (Local Deployment)**
• **Cost**: Completely free - no API charges, no usage limits
• **Requirements**: Local hardware (CPU/GPU) and storage space
• **Models**: Access to Llama 3.3, DeepSeek-R1, Phi-4, Gemma 3, Mistral Small 3.1, and hundreds more
• **Performance**: Unlimited requests limited only by your hardware capabilities
• **Best For**: Development, testing, privacy-sensitive applications, cost-conscious deployments

**🐙 GitHub Models**
• **Cost**: Free access with no API key required  
• **Rate Limits**: Generous limits for individual developers
• **Models**: Access to state-of-the-art models from major providers
• **Best For**: Experimentation, learning, and prototype development

### 🎁 Free Tiers and Credits Available

**🤗 Hugging Face**
• **Free Tier**: Available with basic rate limits
• **API Key**: Optional - provides higher rate limits and priority access
• **Inference**: Free community inference endpoints available
• **Cost Optimization**: 70% savings when deployed on AWS SageMaker Spot Instances
• **Best For**: Research, model testing, community-driven projects

**🔮 Together AI**
• **Free Credits**: Generous starting credits for new users
• **Pay-as-you-go**: Competitive pricing after free credits
• **Models**: Wide selection of open-source and fine-tuned models
• **Best For**: Startups and developers getting started with AI

**🧠 DeepSeek**
• **Free Tier**: Available with competitive rate limits
• **Pricing**: Very competitive rates for paid usage
• **Performance**: High-quality reasoning and coding capabilities
• **Best For**: Cost-effective AI applications, especially coding and reasoning tasks

**💫 SiliconFlow**
• **Free Tier**: Available for individual developers
• **Chinese Provider**: Optimized for Asian markets
• **Models**: Access to popular open-source and proprietary models
• **Best For**: Applications targeting Chinese markets or developers in Asia

**☁️ Azure OpenAI**
• **Free Services**: Azure Cosmos DB free SKU eliminates database costs
• **Cost Control**: Detailed environment variable configurations for precise cost management
• **Enterprise Features**: Advanced security, compliance, and integration capabilities
• **Best For**: Enterprise applications requiring compliance and integration with Microsoft ecosystem

### 🏭 Batch Processing Cost & Performance

#### OpenAI (✅ Recommended - 50% Cost Savings)

- Processing Time: 24-hour completion window
- Endpoints: `/v1/chat/completions`, `/v1/embeddings`, `/v1/completions`
- Format: JSONL file upload with custom request IDs for tracking
- Status: Generally available with comprehensive documentation
- Best For: Large-scale content processing, embeddings generation, bulk translations

#### Anthropic

#### Anthropic (✅ Recommended - 50% Cost Savings)
- Support: All Claude models via `/v1/messages/batches` endpoint
- Format: JSON array of requests with custom IDs
- Status: Available in public beta with stable performance
- Best For: Bulk analysis, content moderation, research applications

#### Groq

*⚠️ Limited - 25% Cost Savings*

#### Groq (⚠️ Limited - 25% Cost Savings)

- Best For: Non-urgent bulk processing when extreme speed is not required

### Cost Optimization Strategies

#### Rate Limit Management

- Smart Queuing: Implement request queuing to stay within free tier limits
- Request Batching: Combine multiple requests to reduce API call overhead
- Caching: Cache responses for repeated queries to minimize API usage
- Load Balancing: Distribute requests across multiple providers based on cost

#### Performance Optimization

- Model Selection: Choose the most cost-effective model for your specific use case
- Token Optimization: Minimize input/output tokens through efficient prompting
- Streaming: Use streaming responses to reduce perceived latency and improve UX
- Regional Deployment: Choose regions with lower costs or better performance

#### Hybrid Approaches

- Development vs Production: Use free tiers for development, paid services for production
- Fallback Strategies: Implement provider fallbacks based on cost and availability
- Local + Cloud: Use Ollama for development and testing, cloud providers for production

### Provider-Specific Batch Support

#### Full Batch Support

- OpenAI: Complete batch API with 50% cost savings, 24h processing, JSONL format
- Anthropic: Message Batches API with 50% cost savings, <1h processing, JSON format

#### Limited Batch Support

- Groq: 25% cost savings available but limited model selection and longer processing times

#### Individual Requests Only

- Google (Gemini): No batch processing currently available
- Grok (X.AI): Individual requests only
- OpenRouter: Individual requests only
- Perplexity: Individual requests only (but 2000 RPM standard rate limits)
- Hugging Face: Individual requests only (community inference)
- Together AI: Individual requests only
- Qwen (Alibaba): Individual requests only
- Ollama: Local processing only (unlimited by design)
- GitHub Models: Individual requests only

### Cost Transparency

#### Clear Pricing Providers

- OpenAI: Transparent per-token pricing with batch discounts clearly documented
- Anthropic: Clear pricing structure with batch savings well-documented
- Azure OpenAI: Enterprise pricing with detailed cost control mechanisms

#### Limited Pricing Transparency

- Grok (X.AI): Pricing information requires X Premium subscription context
- GitHub Models: Free tier limits not clearly specified in public documentation
- OpenRouter: Aggregates multiple providers with varying pricing structures

#### Cost Planning Guide

- Start Free: Begin with Ollama (local) or GitHub Models for development
- Scale Gradually: Move to free tiers of major providers as needs grow
- Batch When Possible: Use batch processing for any bulk operations (50% savings)
- Monitor Usage: Implement usage tracking and alerts for cost control
- Plan for Growth: Design applications to easily switch between providers based on cost

## Usage

Define your input schema, provide your data, and let the wrapper handle provider-specific formatting and requests.

Copy your API keys to `.env` file:

```env
# Required API keys
OPENAI_API_KEY=
GEMINI_API_KEY=
GROK_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
TOGETHER_API_KEY=

# Chinese providers
DEEPSEEK_API_KEY=
# Alibaba Cloud DashScope API key
QWEN_API_KEY=
SILICONFLOW_API_KEY=

# Optional API keys (providers offer free tiers)
# Optional - for higher rate limits on GitHub Models
GITHUB_TOKEN=
# Optional - for higher rate limits on Hugging Face
HUGGINGFACE_API_KEY=

# Ollama configuration (local deployment)
# Note: OLLAMA_API_KEY is optional for most local Ollama setups
OLLAMA_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```
