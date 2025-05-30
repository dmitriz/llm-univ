# LLM Universal Wrapper - Future Tasks

## Batch Processing Implementation

### Completed
- ✅ Fixed Groq batch processing implementation (was incorrectly reporting no support)
- ✅ Updated schema to include `inputFileId` and `metadata` fields for Groq batch API
- ✅ Added `create_batch_request` and `create_batch_jsonl` to module exports
- ✅ Verified implementation with tests

### Future Tasks
1. **Fireworks AI Batch Processing**
   - Research endpoint: https://api.fireworks.ai/v1/batches (likely similar to OpenAI format)
   - Implement JSONL format support
   - Add to provider documentation and schema

2. **Mistral AI Batch Processing**
   - Researched endpoint appears to be: https://api.mistral.ai/v1/batches
   - Similar to OpenAI format, needs validation

3. **Cohere Batch Processing**
   - Research specific format (limited docs available publicly)

## Additional Provider Research

These providers need more comprehensive research and documentation:

### High Priority
1. **SiliconFlow**
   - Base URL: https://api.siliconflow.cn/v1/
   - Find batch processing support
   - Document rate limits

2. **Fireworks AI**
   - Comprehensive endpoint documentation
   - Batch processing capabilities
   - Rate limit structure

3. **Replicate**
   - API structure
   - Batch capabilities
   - Pricing model

4. **Mistral AI**
   - Updated model list and capabilities
   - Function calling support
   - Pricing and rate limits

### Lower Priority
1. **Perplexity**
   - Complete API reference
   - Real-time search capability documentation

2. **AI21 Labs**
   - Batch processing capabilities
   - Updated model information

## Code Improvements

1. **Rate Limiting Implementation**
   - Create reusable module for rate limit handling
   - Document provider-specific limits (from research)
   - Implement adaptive retry strategies

2. **Batch Processing Module**
   - Create separate module for batch processing logic
   - Support file upload and batch management
   - Add batch status tracking

3. **Unified Error Handling**
   - Create structured error types for each provider
   - Standardize error reporting format

## Documentation

1. **Provider Comparison Matrix**
   - Create comprehensive comparison chart
   - Include batch processing support
   - Include real-time capabilities
   - Include function calling support
   - Include rate limits

2. **Provider-Specific Guides**
   - Create detailed guide for each provider
   - Include code examples
   - Include batch processing examples
   - Include rate limit handling examples

## Testing

1. **Unit Tests for Batch Processing**
   - Create tests for each provider's batch implementation
   - Mock API responses

2. **Integration Tests**
   - Create end-to-end tests for key features
   - Include rate limit handling tests
   - Include batch processing tests
   
## Research Methodology 

1. **MCP Server Usage Guidelines**
   - Document when to use specific MCP servers for research
   - Context7 best practices for documentation research
   - Memory MCP for storing findings
   - Fetch MCP as fallback

Last updated: May 30, 2025
