# LLM Provider Information Summary

## Overview

This document summarizes the information collected by the provider_info_collector.js script as of May 30, 2025.

| Metric | Value |
|--------|-------|
| Total Providers | 19 |
| Providers With Public Models | 6 |
| Total Models Available | 405 |
| Last Updated | May 30, 2025 |

## Provider Accessibility Analysis

### Providers with Public Model APIs

These providers offer publicly accessible model information without requiring API keys:

1. **OpenRouter** - 322 models available through public API
2. **Hugging Face** - 50 models available through public API
3. **GitHub Models** - 24 models available through public API
4. **Qwen** - 7 models available (via scraping)
5. **Anthropic** - 1 model available (via scraping)
6. **Ollama** - 1 model available (local deployment info)

### Providers Requiring Authentication

These providers require API keys to access their model information:

1. **OpenAI** - Requires API key for all model information
2. **Google/Gemini** - Requires API key for model access
3. **Groq** - Public documentation but API key required for models
4. **Together AI** - Requires API key but has extensive documentation
5. **DeepSeek** - Requires API key for all model information
6. **SiliconFlow** - Requires API key but has public documentation
7. **Grok (X.AI)** - Requires API key for all model information
8. **Perplexity** - Requires API key for all model information
9. **Cohere** - Partial public documentation available
10. **AI21 Labs** - Requires API key for model information
11. **Fireworks AI** - Requires API key for model information
12. **Replicate** - Requires API key for model information
13. **Mistral AI** - Requires API key for model information

## Authentication & Free Tier Options

### No API Key Required
- **GitHub Models** - Free tier available without API key
- **Ollama** - Free local deployment, no API key required

### Free Tiers/Credits Available
- **OpenRouter** - Free credits available for testing
- **Hugging Face** - Free tier for many models
- **Qwen (Alibaba)** - Free tiers available for certain models
- **Groq** - Free credits for new users
- **Together AI** - Free credits for new users
- **Perplexity** - Limited free tier available
- **Google/Gemini** - Free tier with limited usage

### Payment Required
- **OpenAI** - Paid subscriptions only, minimum deposit required
- **Anthropic** - Paid API access only
- **DeepSeek** - Paid API access required
- **SiliconFlow** - Paid API access required
- **Grok (X.AI)** - Subscription based
- **Cohere** - Paid API access with trials
- **AI21 Labs** - Paid API with minimum deposit
- **Fireworks AI** - Paid API access
- **Replicate** - Pay-per-use model
- **Mistral AI** - Paid API access

## Real-Time Search Capabilities

Several providers offer real-time search or web access capabilities:

1. **Perplexity** - Specialized in real-time search and web information retrieval
2. **Google/Gemini** - Offers "Grounding with Search" capability
3. **Grok (X.AI)** - Has direct web browsing capabilities
4. **OpenAI** - GPT models support web browsing in certain configurations
5. **Anthropic** - Claude offers web browsing capabilities via plugins

## Batch Processing Support

The following providers offer batch processing capabilities:

1. **OpenAI** - Comprehensive batch API via file uploads
2. **Anthropic** - Supports batched requests with custom IDs
3. **Groq** - ✅ Dedicated batch API via `/v1/batches` endpoint (25% discount)
4. **Together AI** - Supports batch processing for cost optimization (50% savings)
5. **Cohere** - Limited batch processing support

## Rate Limiting

All providers implement rate limiting but with different approaches:

- **OpenAI** - Tiered rate limits based on spend
- **Anthropic** - TPM (tokens per minute) and RPM (requests per minute) limits
- **Google** - QPM (queries per minute) limits
- **Groq** - RPM (requests per minute) limits
- **Together AI** - Exponential backoff with retry mechanism
- **OpenRouter** - Flexible limits based on provider
- **Hugging Face** - Varied based on model and user tier

## Special Features

### Multimodal Capabilities
- **OpenAI** - Text, vision, audio
- **Google/Gemini** - Text, vision, audio integration
- **Anthropic** - Text, vision (Claude 3)
- **Together AI** - Text, images, video in single requests
- **Perplexity** - Text and image understanding

### Function Calling
- **OpenAI** - Advanced function calling and JSON mode
- **Anthropic** - Tool use capabilities
- **Google/Gemini** - Function calling
- **Together AI** - Function calling with JSON schema
- **Groq** - Tool use support

## Research Methodology

This data was collected using the provider_info_collector.js script which:
1. Attempts to access public API endpoints without authentication
2. Scrapes documentation websites when direct API access isn't available
3. Verifies endpoint accessibility and documents rate limitations
4. Detects special capabilities like search and multimodal features

For comprehensive research, multiple MCP servers were utilized:
- Context7 for detailed API documentation research
- Memory MCP for storing and retrieving research findings
- Fetch MCP for web-based verification and additional research
- Regular tools for data collection and processing
