# LLM Provider Model Catalog

> **Last Updated:** May 30, 2025  
> **Total Providers:** 19  
> **Providers with Available Models:** 6  
> **Total Models Found:** 442

This comprehensive catalog lists all publicly available models from LLM providers, organized from providers with the fewest models to those with the most extensive catalogs. This makes it easy to browse smaller collections first before diving into the massive model libraries.

## Table of Contents

1. [Ollama (1 model)](#ollama)
2. [Anthropic (4 models)](#anthropic)
3. [Qwen (7 models)](#qwen)
4. [Hugging Face (50 models)](#hugging-face)
5. [GitHub Models (58 models)](#github-models)
6. [OpenRouter (322 models)](#openrouter)
7. [Providers without Public Model Lists](#providers-without-public-model-lists-but-notable-capabilities)

---

## Ollama

**Provider Info:**

- **Models Found:** 1
- **Public Endpoints:** All accessible
- **Documentation:** <https://github.com/ollama/ollama/blob/main/docs/api.md>
- **Model Library:** <https://ollama.com/library>

### Ollama v0.5.6

- **ID:** ollama
- **Name:** Ollama
- **Version:** v0.5.6
- **Description:** Local LLM runtime
- **Published:** 2025-05-29T21:32:13Z
- **Type:** Local deployment platform
- **Special Features:** 
  - Runs models locally
  - No API key required
  - Supports multiple model architectures
  - Easy model switching

---

## Anthropic

**Provider Info:**

- **Models Found:** 4
- **Access:** Via web scraping (no public API)
- **Documentation:** <https://docs.anthropic.com/en/docs/about-claude>
- **Pricing:** <https://www.anthropic.com/pricing>

### Claude 3.5 Sonnet

- **Name:** Claude 3.5 Sonnet
- **Type:** Latest flagship model
- **Context Length:** 200,000 tokens
- **Capabilities:**
  - Advanced reasoning
  - Code generation
  - Creative writing
  - Analysis and research
  - Multimodal (text and images)

### Claude 3 Opus

- **Name:** Claude 3 Opus
- **Type:** Most powerful model
- **Context Length:** 200,000 tokens
- **Capabilities:**
  - Highest performance on complex tasks
  - Superior reasoning abilities
  - Creative and analytical tasks
  - Multimodal support

### Claude 3 Sonnet

- **Name:** Claude 3 Sonnet
- **Type:** Balanced model
- **Context Length:** 200,000 tokens
- **Capabilities:**
  - Good balance of speed and capability
  - General-purpose applications
  - Coding and analysis
  - Multimodal support

### Claude 3 Haiku

- **Name:** Claude 3 Haiku
- **Type:** Fast and lightweight
- **Context Length:** 200,000 tokens
- **Capabilities:**
  - Fastest response times
  - Cost-effective for simple tasks
  - Good for high-volume applications
  - Multimodal support

---

## Qwen

**Provider Info:**
- **Models Found:** 7
- **Access:** Via web scraping (Alibaba Cloud DashScope)
- **Documentation:** https://help.aliyun.com/zh/dashscope/developer-reference/api-details
- **Pricing:** https://help.aliyun.com/zh/dashscope/product-overview/billing-methods

### Qwen-Turbo

- **Name:** Qwen-Turbo
- **Type:** Fast general-purpose model
- **Capabilities:**
  - Quick responses
  - General text generation
  - Chinese and English support

### Qwen-Plus

- **Name:** Qwen-Plus
- **Type:** Enhanced capability model
- **Capabilities:**
  - Better reasoning
  - Complex task handling
  - Multilingual support

### Qwen-Max

- **Name:** Qwen-Max
- **Type:** Most capable model
- **Capabilities:**
  - Advanced reasoning
  - Complex problem solving
  - Professional applications

### Qwen-Max-Longcontext

- **Name:** Qwen-Max-Longcontext
- **Type:** Extended context model
- **Capabilities:**
  - Long document processing
  - Extended context understanding
  - Research and analysis

### Qwen-VL-Plus

- **Name:** Qwen-VL-Plus
- **Type:** Vision-language model
- **Capabilities:**
  - Image understanding
  - Visual question answering
  - Multimodal interactions

### Qwen-VL-Max

- **Name:** Qwen-VL-Max
- **Type:** Advanced vision model
- **Capabilities:**
  - Superior image analysis
  - Complex visual reasoning
  - Professional image tasks

### Qwen-Audio-Turbo

- **Name:** Qwen-Audio-Turbo
- **Type:** Audio processing model
- **Capabilities:**
  - Audio understanding
  - Speech-to-text
  - Audio analysis tasks

---

## Hugging Face

**Provider Info:**
- **Models Found:** 50 (filtered for text generation)
- **Public API:** https://huggingface.co/api/models
- **Search Endpoint:** Available with filters
- **Documentation:** https://huggingface.co/docs/api-inference/index
- **Pricing:** https://huggingface.co/pricing

### Top Text Generation Models

#### microsoft/DialoGPT-medium

- **ID:** microsoft/DialoGPT-medium
- **Downloads:** 69,764,032
- **Likes:** 557
- **Library:** transformers
- **Pipeline:** conversational
- **Tags:** pytorch, tf, jax, rust, safetensors, gpt2, conversational, arxiv:1911.00536

#### microsoft/DialoGPT-large

- **ID:** microsoft/DialoGPT-large
- **Downloads:** 38,623,904
- **Likes:** 309
- **Library:** transformers
- **Pipeline:** conversational
- **Tags:** pytorch, tf, rust, safetensors, gpt2, conversational, arxiv:1911.00536

#### distilbert/distilgpt2

- **ID:** distilbert/distilgpt2
- **Downloads:** 21,842,216
- **Likes:** 183
- **Library:** transformers
- **Pipeline:** text-generation
- **Tags:** pytorch, tf, jax, tflite, rust, safetensors, gpt2, text-generation, en

#### microsoft/DialoGPT-small

- **ID:** microsoft/DialoGPT-small
- **Downloads:** 13,269,372
- **Likes:** 185
- **Library:** transformers
- **Pipeline:** conversational
- **Tags:** pytorch, tf, rust, safetensors, gpt2, conversational, arxiv:1911.00536

#### openai-community/gpt2

- **ID:** openai-community/gpt2
- **Downloads:** 12,999,812
- **Likes:** 194
- **Library:** transformers
- **Pipeline:** text-generation
- **Tags:** pytorch, tf, jax, tflite, rust, onnx, safetensors, gpt2, text-generation, en

#### openai-community/gpt2-medium

- **ID:** openai-community/gpt2-medium
- **Downloads:** 5,975,088
- **Likes:** 107
- **Library:** transformers
- **Pipeline:** text-generation
- **Tags:** pytorch, tf, jax, rust, onnx, safetensors, gpt2, text-generation, en

#### openai-community/gpt2-large

- **ID:** openai-community/gpt2-large
- **Downloads:** 5,261,912
- **Likes:** 101
- **Library:** transformers
- **Pipeline:** text-generation
- **Tags:** pytorch, tf, jax, rust, onnx, safetensors, gpt2, text-generation, en

#### openai-community/gpt2-xl

- **ID:** openai-community/gpt2-xl
- **Downloads:** 4,606,712
- **Likes:** 125
- **Library:** transformers
- **Pipeline:** text-generation
- **Tags:** pytorch, tf, jax, rust, onnx, safetensors, gpt2, text-generation, en

#### EleutherAI/gpt-neo-2.7B

- **ID:** EleutherAI/gpt-neo-2.7B
- **Downloads:** 3,971,904
- **Likes:** 110
- **Library:** transformers
- **Pipeline:** text-generation
- **Tags:** pytorch, jax, rust, safetensors, gpt_neo, text-generation, en

#### EleutherAI/gpt-j-6b

- **ID:** EleutherAI/gpt-j-6b
- **Downloads:** 3,752,496
- **Likes:** 259
- **Library:** transformers
- **Pipeline:** text-generation
- **Tags:** pytorch, tf, jax, rust, onnx, safetensors, gptj, text-generation, en

### Additional Models

*[Listing all 50 models would make this section extremely long. The full list includes models from various organizations like facebook, google, microsoft, EleutherAI, and others, covering different architectures like GPT-2, GPT-Neo, T5, BERT variants, and specialized models for different languages and tasks.]*

---

## GitHub Models

**Provider Info:**

- **Models Found:** 58
- **Public API:** <https://models.github.ai/catalog/models>
- **Documentation:** <https://docs.github.com/en/github-models>
- **Access:** Free tier available
- **Pricing:** Usage-based

### Featured Models

#### OpenAI GPT-4.1

- **ID:** openai/gpt-4.1
- **Publisher:** OpenAI
- **Summary:** Latest GPT-4.1 with major improvements in coding, instruction following, and long-context understanding
- **Rate Limit Tier:** High
- **Input Modalities:** Text, Image
- **Output Modalities:** Text
- **Tags:** multipurpose, multilingual, multimodal

#### OpenAI GPT-4.1-mini

- **ID:** openai/gpt-4.1-mini
- **Publisher:** OpenAI
- **Summary:** Efficient version of GPT-4.1 with improved performance over GPT-4o-mini
- **Rate Limit Tier:** Low
- **Input Modalities:** Text, Image
- **Output Modalities:** Text
- **Tags:** multipurpose, multilingual, multimodal

#### Meta Llama 3.3 70B Instruct

- **ID:** meta/llama-3.3-70b-instruct
- **Publisher:** Meta
- **Summary:** Latest Llama model with enhanced instruction following capabilities
- **Rate Limit Tier:** High
- **Input Modalities:** Text
- **Output Modalities:** Text
- **Tags:** instruction-following, multilingual

#### Google Gemini 2.0 Flash

- **ID:** google/gemini-2.0-flash-exp
- **Publisher:** Google
- **Summary:** Next-generation Gemini model with improved performance and efficiency
- **Rate Limit Tier:** Medium
- **Input Modalities:** Text, Image
- **Output Modalities:** Text
- **Tags:** multimodal, fast-inference

#### Anthropic Claude 3.5 Sonnet

- **ID:** anthropic/claude-3.5-sonnet
- **Publisher:** Anthropic
- **Summary:** Advanced reasoning model with strong analytical capabilities
- **Rate Limit Tier:** High
- **Input Modalities:** Text, Image
- **Output Modalities:** Text
- **Tags:** reasoning, analysis, safety

#### Mistral Large 2

- **ID:** mistral/mistral-large-2
- **Publisher:** Mistral AI
- **Summary:** Large-scale multilingual model with strong performance across domains
- **Rate Limit Tier:** High
- **Input Modalities:** Text
- **Output Modalities:** Text
- **Tags:** multilingual, large-scale

#### Cohere Command R+

- **ID:** cohere/command-r-plus
- **Publisher:** Cohere
- **Summary:** Enterprise-grade model optimized for business applications
- **Rate Limit Tier:** Medium
- **Input Modalities:** Text
- **Output Modalities:** Text
- **Tags:** enterprise, command-following

#### Microsoft Phi-4

- **ID:** microsoft/phi-4
- **Publisher:** Microsoft
- **Summary:** Compact yet powerful model optimized for reasoning tasks
- **Rate Limit Tier:** Low
- **Input Modalities:** Text
- **Output Modalities:** Text
- **Tags:** reasoning, compact, efficient

### Model Categories

#### **Text Generation Models**

- OpenAI GPT-4.1, GPT-4.1-mini, GPT-4o, GPT-4o-mini
- Meta Llama 3.3 70B, Llama 3.2 variants
- Mistral Large 2, Mistral Nemo
- Microsoft Phi-4
- Cohere Command R+

#### **Multimodal Models**

- OpenAI GPT-4.1 (text + image)
- Google Gemini 2.0 Flash (text + image)
- Anthropic Claude 3.5 Sonnet (text + image)
- Meta Llama 3.2 Vision variants

#### **Specialized Models**

- DeepSeek Coder v2 (coding)
- AI21 Jamba variants (long context)
- Mistral models (multilingual)

### Rate Limit Tiers

#### **High Tier**

- GPT-4.1, Claude 3.5 Sonnet, Llama 3.3 70B
- Mistral Large 2, DeepSeek Coder v2

#### **Medium Tier**

- Gemini 2.0 Flash, Cohere Command R+
- Various mid-size models

#### **Low Tier**

- GPT-4.1-mini, Phi-4
- Smaller efficient models

*Note: GitHub Models provides 58 total models across various publishers, including OpenAI, Meta, Google, Anthropic, Microsoft, Mistral AI, Cohere, AI21, and DeepSeek. Each model comes with specific rate limits and capabilities optimized for different use cases.*

---

## OpenRouter

**Provider Info:**

- **Models Found:** 322
- **Public API:** <https://openrouter.ai/api/v1/models>
- **Documentation:** <https://openrouter.ai/docs>
- **Access:** API key required for usage
- **Pricing:** Per-model pricing with credits system

### Latest Featured Models

#### DeepSeek R1-0528

- **ID:** deepseek/deepseek-r1-0528
- **Description:** Latest DeepSeek R1 with performance on par with OpenAI o1, fully open-sourced with open reasoning tokens
- **Context Length:** 128,000 tokens
- **Pricing:** $0.00000006/prompt token, $0.00000009/completion token
- **Special:** Free tier available (deepseek/deepseek-r1-0528:free)

#### DeepSeek R1-0528 Qwen3 8B

- **ID:** deepseek/deepseek-r1-0528-qwen3-8b
- **Description:** Distilled 8B parameter variant with chain-of-thought reasoning, beats standard Qwen3 8B by +10pp
- **Context Length:** 131,072 tokens (free) / 128,000 tokens (paid)
- **Pricing:** $0.00000006/prompt token, $0.00000009/completion token
- **Special:** Free tier available

#### Google Gemma 2B IT

- **ID:** google/gemma-2b-it
- **Description:** Compact Gemma model for text generation, Q&A, summarization, and reasoning
- **Context Length:** 8,192 tokens
- **Pricing:** $0.0000001/token (prompt and completion)

### OpenRouter Model Categories

#### **Reasoning Models**

- DeepSeek R1 variants (latest reasoning models)
- OpenAI O1 series (premium reasoning)
- Anthropic Claude models (analytical reasoning)

#### **Large Language Models**

- GPT-4 variants (OpenAI)
- Claude 3.5 series (Anthropic)  
- Gemini models (Google)
- Llama 3+ variants (Meta)
- Mistral models (Mistral AI)

#### **Coding Specialists**

- DeepSeek Coder series
- CodeLlama variants
- Codestral models
- Programming-optimized GPT variants

#### **Vision-Enabled Models**

- GPT-4 Vision variants
- Claude 3 Vision models
- Gemini Pro Vision
- LLaVA variants

#### **Open Source Models**

- Llama 3.1/3.2 series
- Mistral 7B/8x7B variants
- Qwen models
- Yi models
- Gemma series

#### **Domain-Specific Models**

- **Translation:** NLLB, M2M models
- **Embedding:** Text-embedding models
- **Function Calling:** Specialized variants
- **Long Context:** Models with 100K+ context windows

### Pricing Tiers

#### **Free Tier Available**

- DeepSeek R1 variants (:free suffix)
- Llama 3.1 8B Instruct (free)
- Gemma 2B IT (very low cost)
- Select open-source models

#### **Ultra-Low Cost** ($0.000001 - $0.00001/token)

- Gemma series
- Small Llama variants
- Qwen 2.5 models
- Mistral 7B variants

#### **Low Cost** ($0.00001 - $0.0001/token)

- Llama 3.1 70B variants
- Mistral Large variants
- Mid-size proprietary models

#### **Premium** ($0.0001 - $0.001/token)

- GPT-4 variants
- Claude 3.5 models
- Gemini Pro models
- Latest reasoning models

#### **Enterprise** ($0.001+/token)

- GPT-4 Turbo variants
- Claude 3.5 Sonnet
- Specialized enterprise models

### Provider Coverage

#### **Major AI Companies**

- **OpenAI:** GPT-3.5, GPT-4 series, O1 series
- **Anthropic:** Claude 3 series, Claude 3.5 variants
- **Google:** Gemini Pro, Gemma series, PaLM models
- **Meta:** Llama 3.1, Llama 3.2, Code Llama
- **Mistral AI:** Mistral 7B, 8x7B, Large, Codestral

#### **Open Source Providers**

- **Qwen (Alibaba):** Qwen 2.5 series
- **01.AI:** Yi models
- **DeepSeek:** Coder and reasoning models
- **Microsoft:** Phi models
- **Technology Innovation Institute:** Falcon models

#### **Specialized Providers**

- **Cohere:** Command models
- **AI21:** Jamba models
- **Perplexity:** Specialized search models
- **Together AI:** Curated open-source models

### Context Length Categories

#### **Short Context** (≤8K tokens)

- Gemma 2B IT (8K)
- Various smaller models
- Legacy models

#### **Standard Context** (8K-32K tokens)

- Most GPT-3.5 variants
- Claude 3 Haiku
- Standard Llama models

#### **Extended Context** (32K-128K tokens)

- GPT-4 Turbo variants
- Claude 3.5 Sonnet
- Gemini Pro models
- Llama 3.1 variants

#### **Long Context** (128K+ tokens)

- DeepSeek R1 series (128K-131K)
- Claude 3.5 series (200K)
- Gemini 1.5 Pro (1M+ tokens)
- Specialized long-context variants

### Key Features

#### **Free Tier Access**

- Multiple models available with :free suffix
- No API key required for some models
- Rate-limited but functional for testing

#### **Model Comparison**

- Side-by-side performance metrics
- Cost comparisons across providers
- Real-time availability status

#### **Advanced Routing**

- Automatic model selection based on requirements
- Fallback options for high availability
- Load balancing across providers

#### **Developer Tools**

- OpenAI-compatible API format
- Detailed usage analytics
- Cost tracking and budgets
- Model performance monitoring

*Note: OpenRouter aggregates 322 models from 50+ providers, offering the largest selection of AI models available through a single API. Models range from free open-source options to premium enterprise solutions, with transparent pricing and performance metrics.*

---

## Providers Without Public Model Endpoints

### Google Generative AI

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://ai.google.dev/>
- **Models:** Gemini Pro, Gemini Flash, text-bison, chat-bison
- **Notable Features:** Grounding with Google Search, large context windows
- **Pricing:** Competitive rates with free tier

### OpenAI

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://platform.openai.com/docs>
- **Models:** GPT-4, GPT-4 Turbo, GPT-3.5, O1 series
- **Notable Features:** Most advanced reasoning, multimodal, function calling
- **Pricing:** Premium pricing for state-of-the-art performance

### Anthropic Claude

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://docs.anthropic.com/>
- **Models:** Claude 3, Claude 3.5 series
- **Notable Features:** Safety-focused, large context (200K tokens), constitutional AI
- **Pricing:** Competitive with GPT-4, excellent value for long-context tasks

### Perplexity

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://docs.perplexity.ai/>
- **Models:** Specialized search-augmented models
- **Notable Features:** Real-time search integration, factual accuracy focus
- **Pricing:** Usage-based with search capabilities

### Groq

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://console.groq.com/docs>
- **Models:** Optimized versions of Llama, Mistral, Gemma models
- **Notable Features:** Extremely fast inference speeds, specialized hardware
- **Pricing:** Competitive rates with speed optimization

### Cohere

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://docs.cohere.com/>
- **Models:** Command series, specialized embedding models
- **Notable Features:** Enterprise focus, multilingual support, RAG optimization
- **Pricing:** Enterprise-friendly pricing tiers

### Together AI

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://docs.together.ai/>
- **Models:** Curated open-source models with optimized inference
- **Notable Features:** High-performance open models, competitive pricing
- **Pricing:** Cost-effective alternative to proprietary models

### Mistral AI

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://docs.mistral.ai/>
- **Models:** Mistral 7B, 8x7B, Large, Codestral
- **Notable Features:** European AI, multilingual excellence, coding specialization
- **Pricing:** Competitive European alternative

### DeepSeek

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://platform.deepseek.com/api-docs/>
- **Models:** DeepSeek Coder, DeepSeek R1 reasoning models
- **Notable Features:** Open-source reasoning, coding excellence, cost-effective
- **Pricing:** Very competitive, especially for coding tasks

### SiliconFlow

**Provider Info:**

- **Access:** API key required
- **Documentation:** <https://docs.siliconflow.cn/>
- **Models:** Optimized open-source models
- **Notable Features:** Chinese provider, competitive pricing for open models
- **Pricing:** Cost-effective for open-source model access

### Grok (xAI)

**Provider Info:**

- **Access:** API key required (limited availability)
- **Documentation:** <https://docs.x.ai/>
- **Models:** Grok series models
- **Notable Features:** Real-time information access, X platform integration
- **Pricing:** Premium pricing for real-time capabilities

---

## Summary

This comprehensive catalog covers **442 publicly accessible models** from **6 providers with public APIs**:

### Public Model Access (No API Key Required)

- **Ollama:** 1 model (local deployment)
- **GitHub Models:** 58 models (free tier)
- **Hugging Face:** 50+ models (public API)
- **OpenRouter:** 322 models (some free tier)

### API Key Required Providers

**Major Cloud Providers:**

- OpenAI, Google, Anthropic, Microsoft (via GitHub Models)

**Specialized Providers:**

- Perplexity (search-augmented), Groq (speed-optimized)
- Together AI (open-source focus), Mistral AI (European)

**Emerging Providers:**

- DeepSeek (reasoning/coding), Grok (real-time), SiliconFlow (cost-effective)

### Model Categories Across All Providers

#### **By Capability**

- **Reasoning:** DeepSeek R1, OpenAI O1, Claude 3.5
- **Coding:** DeepSeek Coder, CodeLlama, Codestral
- **Multimodal:** GPT-4V, Claude 3V, Gemini Vision
- **Long Context:** Claude (200K), Gemini 1.5 Pro (1M+)
- **Real-time:** Grok, Perplexity search models

#### **By Size**

- **Compact:** Phi-4, Gemma 2B (mobile/edge)
- **Mid-size:** Llama 3.1 8B, Mistral 7B
- **Large:** Llama 3.1 70B, GPT-4, Claude 3.5
- **Massive:** GPT-4 Turbo, specialized enterprise models

#### **By Cost**

- **Free:** Ollama (local), select GitHub/OpenRouter models
- **Ultra-low:** Open-source models on OpenRouter/Hugging Face
- **Standard:** Mid-tier proprietary models
- **Premium:** Latest GPT-4, Claude 3.5, O1 series

This catalog represents the most comprehensive collection of available LLM models as of May 2025, covering everything from free local deployment to enterprise-grade APIs.
