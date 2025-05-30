# LLM Universal Wrapper

A minimalistic universal wrapper for different LLM API providers.

## Purpose

This library provides a unified interface to interact with multiple LLM providers including:

- OpenAI
- Anthropic (Claude)
- Google (Gemini)
- Azure OpenAI
- Grok
- Groq
- OpenRouter
- Ollama

## Features

- Universal schema validation using Zod
- Provider-specific header configuration
- Consistent request/response handling
- Type-safe API interactions

## Usage

Define your input schema, provide your data, and let the wrapper handle provider-specific formatting and requests.

## Environment Variables

Copy your API keys to `.env` file:

```env
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
GROK_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
OLLAMA_API_KEY=your_key_here
```
