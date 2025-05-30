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
