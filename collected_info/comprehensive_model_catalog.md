# Comprehensive Model Catalog

A complete catalog of LLM providers and their available models, organized for the Universal LLM Wrapper project.

## OpenAI

**API Endpoint:** `https://api.openai.com/v1/chat/completions`

**Authentication:** Bearer token (API key)

**Available Models:**

- gpt-4o (GPT-4 Omni - $2.50/1M input tokens, $10.00/1M output tokens)
- gpt-4o-mini (GPT-4 Omni Mini - $0.15/1M input tokens, $0.60/1M output tokens)
- gpt-4-turbo (GPT-4 Turbo - $10.00/1M input tokens, $30.00/1M output tokens)
- gpt-4 (GPT-4 - $30.00/1M input tokens, $60.00/1M output tokens)
- gpt-3.5-turbo (GPT-3.5 Turbo - $0.50/1M input tokens, $1.50/1M output tokens)
- o1-preview (Reasoning model - $15.00/1M input tokens, $60.00/1M output tokens)
- o1-mini (Mini reasoning model - $3.00/1M input tokens, $12.00/1M output tokens)

**Features:**

- Function calling
- JSON mode
- Vision capabilities (GPT-4V models)
- Real-time web browsing (with plugins)
- DALL-E integration
- Whisper for audio transcription

---

## Anthropic

**API Endpoint:** `https://api.anthropic.com/v1/messages`

**Authentication:** API key in x-api-key header

**Available Models:**

- claude-3-5-sonnet-20241022 (Claude 3.5 Sonnet - $3.00/1M input tokens, $15.00/1M output tokens)
- claude-3-5-haiku-20241022 (Claude 3.5 Haiku - $0.25/1M input tokens, $1.25/1M output tokens)
- claude-3-opus-20240229 (Claude 3 Opus - $15.00/1M input tokens, $75.00/1M output tokens)
- claude-3-sonnet-20240229 (Claude 3 Sonnet - $3.00/1M input tokens, $15.00/1M output tokens)

**Features:**

- Tool use (function calling)
- Vision capabilities
- Large context windows (up to 200k tokens)
- System prompts
- Constitutional AI safety

---

## Google (Gemini)

**API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

**Authentication:** API key parameter

**Available Models:**

- gemini-2.0-flash-exp (Gemini 2.0 Flash - Experimental)
- gemini-2.5-flash-exp (Gemini 2.5 Flash - Experimental)
- gemini-2.5-pro-exp (Gemini 2.5 Pro - Experimental)
- gemini-1.5-pro (Gemini 1.5 Pro - $1.25/1M input tokens, $5.00/1M output tokens)
- gemini-1.5-flash (Gemini 1.5 Flash - $0.075/1M input tokens, $0.30/1M output tokens)
- gemini-1.0-pro (Gemini 1.0 Pro - $0.50/1M input tokens, $1.50/1M output tokens)

**Features:**

- Grounding with Google Search
- Multimodal capabilities (text, image, video, audio)
- Code execution
- Function calling
- Large context windows (up to 2M tokens)

---

## Groq

**API Endpoint:** `https://api.groq.com/openai/v1/chat/completions`

**Authentication:** Bearer token (API key)

**Available Models:**

- llama-3.3-70b-versatile (Llama 3.3 70B - Ultra-fast inference)
- deepseek-r1-distill-llama-70b (DeepSeek R1 Distilled - Reasoning model)
- llama-3.1-405b-reasoning (Llama 3.1 405B - Reasoning optimized)
- llama-3.1-70b-versatile (Llama 3.1 70B)
- llama-3.1-8b-instant (Llama 3.1 8B)
- mixtral-8x7b-32768 (Mixtral 8x7B)
- gemma2-9b-it (Gemma 2 9B)
- llama-guard-3-8b (Llama Guard 3 8B - Safety model)

**Features:**

- Ultra-fast inference (500+ tokens/second)
- Function calling
- JSON mode
- Agentic reasoning models
- Free tier available

---

## Ollama

**API Endpoint:** `http://localhost:11434/api/chat` (local)

**Authentication:** None (local deployment)

**Available Models:**

- llama3.3:70b (Llama 3.3 70B)
- deepseek-r1:32b (DeepSeek R1 32B - Reasoning model)
- phi4:14b (Microsoft Phi-4 14B)
- gemma3:latest (Google Gemma 3)
- mistral-small:latest (Mistral Small 3.1)
- qwen2.5:72b (Qwen 2.5 72B)
- codestral:22b (Codestral 22B - Code specialist)
- nomic-embed-text (Text embeddings)
- llava:13b (Vision-language model)
- wizard-vicuna:13b (Wizard Vicuna 13B)

**Features:**

- Local deployment (no API keys needed)
- 278+ models available
- Custom model support
- GGUF format support
- CPU and GPU inference
- Model library management

---

## Hugging Face

**API Endpoint:** `https://api-inference.huggingface.co/models/{model_id}`

**Authentication:** Bearer token (API key)

**Available Models:**

- meta-llama/Llama-3.3-70B-Instruct
- microsoft/Phi-4
- Qwen/Qwen2.5-72B-Instruct
- deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- mistralai/Mistral-Small-Instruct-2409
- google/gemma-2-27b-it
- NousResearch/Hermes-3-Llama-3.1-405B
- anthropic/claude-3-haiku-20240307

**Features:**

- Inference API (serverless)
- Custom model deployment
- Free tier available
- Transformers library integration
- Model Hub access
- AutoTrain capabilities

---

## OpenRouter

**API Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Authentication:** Bearer token (API key)

**Available Models:**

- openai/gpt-4o (GPT-4 Omni)
- anthropic/claude-3.5-sonnet
- google/gemini-2.0-flash-exp
- meta-llama/llama-3.3-70b-instruct
- deepseek/deepseek-r1
- qwen/qwen-2.5-72b-instruct
- microsoft/phi-4
- mistralai/mistral-small-2409

**Features:**

- Unified API for multiple providers
- Model routing and fallbacks
- Pay-per-use pricing
- Model comparison tools
- Rate limiting management
- Provider redundancy

---

## Qwen

**API Endpoint:** `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`

**Authentication:** API key in Authorization header

**Available Models:**

- qwen-max (Qwen Max - Most capable model)
- qwen-max-1201 (Qwen Max December 2024)
- qwen-plus (Qwen Plus - Balanced performance)
- qwen-turbo (Qwen Turbo - Fast inference)
- qwen2.5-72b-instruct (Qwen 2.5 72B)
- qwen2.5-32b-instruct (Qwen 2.5 32B)
- qwen2.5-14b-instruct (Qwen 2.5 14B)

**Features:**

- Chinese and English language support
- Code generation capabilities
- Mathematical reasoning
- Function calling
- Long context support
- Multimodal capabilities

---

## GitHub Models

**API Endpoint:** `https://models.inference.ai.azure.com/chat/completions`

**Authentication:** GitHub token

**Available Models:**

- gpt-4o (OpenAI GPT-4 Omni)
- gpt-4o-mini (OpenAI GPT-4 Omni Mini)
- Meta-Llama-3.1-405B-Instruct
- Meta-Llama-3.1-70B-Instruct
- Meta-Llama-3.1-8B-Instruct
- Phi-3-medium-4k-instruct
- Phi-3-mini-4k-instruct
- Mistral-large-2407
- Mistral-small-2409

**Features:**

- Free access with GitHub account
- Azure AI infrastructure
- Rate limiting (requests per minute)
- No API key required (uses GitHub token)
- Model playground
- Educational use focus

---

Last updated: May 30, 2025

Model availability and pricing subject to change
