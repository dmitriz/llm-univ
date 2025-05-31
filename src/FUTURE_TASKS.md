# LLM Universal Wrapper - Future Tasks & Roadmap

## ✅ COMPLETED TASKS

### Schema Documentation & Grok Integration

- ✅ Updated all schema parameters with complete descriptions and proper API reference links
- ✅ Replaced quick start links with official API reference documentation
- ✅ Added comprehensive provider authentication requirements
- ✅ Added Grok (X.AI) provider with live web search capabilities
- ✅ Added real-time search capabilities documentation (Grok, Perplexity, Google Gemini)
- ✅ Added multi-modal support documentation by provider
- ✅ Added detailed function calling capabilities by provider
- ✅ Added streaming implementation notes with SSE details
- ✅ Added batch processing cost savings and workflow documentation
- ✅ Added token limits and cost optimization guidance
- ✅ Added deterministic generation best practices

### Batch Processing Implementation

- ✅ Fixed Groq batch processing implementation (was incorrectly reporting no support)
- ✅ Updated schema to include `inputFileId` and `metadata` fields for Groq batch API
- ✅ Added `create_batch_request` and `create_batch_jsonl` to module exports
- ✅ Implemented OpenAI and Anthropic batch processing with 50% cost savings
- ✅ Added Groq batch processing with 25% cost savings
- ✅ Verified implementation with comprehensive tests

### Code Review Fixes (May 30, 2025)

- ✅ **Extracted shared helper for OpenAI-compatible providers** - Eliminated code duplication between OpenAI, Groq, and SiliconFlow batch cases
- ✅ **Added Together AI schema parameters** - Added batchSize and timeout as configurable optional parameters in llm_input_schema.js
- ✅ **Improved test coverage** - Added comprehensive tests for explicit batch.requests scenarios for Anthropic and Together AI
- ✅ **Used constants for API versions** - Replaced hardcoded Anthropic API version with maintainable constants
- ✅ **Verified all implementations** - All tests passing with no errors or warnings

### LlamaPReview Critical Fixes (May 30, 2025)

**Status**: Completed | **Priority**: P0-P2

#### ✅ P0 - Critical Fixes (Completed)

1. ✅ **Together AI Batch Payload Mismatch** - Fixed hardcoded test values, corrected field names (custom_id → customId, max_tokens → maxTokens, batch_size → batchSize) for proper multiple requests support
2. ✅ **Missing Batch Validation** - Added provider-specific validation for required fields (inputFileId for OpenAI/Groq/SiliconFlow, flexible validation for Together AI/Anthropic with fallback support)

#### ✅ P1 - High Priority Fixes (Completed)

1. ✅ **Inconsistent Metadata Handling** - Added explicit warning and stripping of unsupported metadata for Together AI to prevent silent failures
2. ✅ **Missing Batch Error Handling** - Added comprehensive try-catch blocks with detailed error logging for all batch operations

#### 🟢 P2 - Medium Priority (Consider for Future)

1. **Batch Request Aggregation Helper** - Create utility for combining multiple requests into single batch
2. **Cost Tracking Hooks** - Add tracking for batch operation costs and savings

## 📋 REMAINING IMPLEMENTATION TASKS

### 🔥 HIGH PRIORITY (Critical Path)

#### 1. Rate Limiting & Error Handling Module

**Status**: Not Started | **Estimated Time**: 3–4 days

- Create universal rate limiting handler for all 14 providers
- Implement provider-specific retry strategies with exponential backoff
- Add structured error handling with unified response format
- Create reusable module separate from main request logic

#### 2. Complete Provider Implementations

**Status**: Partial | **Estimated Time**: 5–6 days

**SiliconFlow** (Base URL: `https://api.siliconflow.cn/v1/`)

- Research and implement batch processing support
- Document comprehensive rate limits and model capabilities
- Add to create_request.js implementation

**Fireworks AI** (Base URL: `https://api.fireworks.ai/inference/v1/`)

- Research batch processing endpoint: `https://api.fireworks.ai/v1/batches`
- Implement JSONL format support
- Document rate limit structure and model offerings

**Mistral AI** (Base URL: `https://api.mistral.ai/v1/`)

- Implement batch processing endpoint: `https://api.mistral.ai/v1/batches`
- Research updated model list and function calling capabilities
- Document pricing and rate limits

**Replicate** (Base URL: `https://api.replicate.com/v1/`)

- Research API structure and batch processing compatibility
- Investigate if compatible with universal schema
- Document unique pricing model

**Cohere** (Missing Implementation)

- Research Cohere API integration for universal schema compatibility
- Investigate batch processing capabilities
- Document authentication and rate limits
- Add to provider enum and create_request.js

**AI21 Labs** (Missing Implementation)

- Research AI21 Studio API for integration
- Investigate batch processing capabilities
- Document Jurassic model capabilities and pricing
- Add to provider enum and create_request.js

#### 3. Comprehensive Testing Suite

**Status**: Not Started | **Estimated Time**: 4–5 days

- Unit tests for all providers and parameters
- Integration tests with real API endpoints (using free tiers)
- Batch processing end-to-end tests
- Performance and load testing

### 🚀 MEDIUM PRIORITY (Next Sprint)

#### 4. Advanced Features Implementation

**Estimated Time**: 6–8 days

##### Multi-modal Content Support

- Extend schema to support image, audio, video inputs
- Implement provider-specific multi-modal formatting
- Test across OpenAI, Google, Anthropic, Together AI

##### Advanced Function Calling

- Implement universal function schema
- Add type validation for function parameters
- Create provider-specific function formatters

#### Streaming Response Handler

- Create universal streaming response parser
- Implement provider-specific SSE handling differences
- Add reconnection logic for dropped connections
- Document cross-provider streaming variations
- Implement backpressure handling
- Add streaming progress callbacks

##### Advanced Function Calling Integration

- Implement tool choice and parallel function calling
- Add JSON schema validation for function parameters
- Document provider-specific differences and limitations

#### 5. Documentation & Examples

**Estimated Time**: 3–4 days

- Create comprehensive provider comparison matrix
- Add interactive examples for all features
- Include batch processing workflow examples
- Create migration guides from individual SDKs

### 📦 LOW PRIORITY (Future Releases)

#### 6. DevOps & Publishing

**Estimated Time**: 2-3 days

- Prepare NPM package for publication
- Add TypeScript type definitions
- Set up automated testing and CI/CD
- Create comprehensive README

#### 7. Performance & Monitoring

**Estimated Time**: 3-4 days

- Benchmark request performance across providers
- Implement request caching strategies
- Add request deduplication
- Create performance monitoring and metrics

#### 8. Advanced Documentation

**Estimated Time**: 5-6 days

- Create documentation website
- Add interactive API explorer
- Include real-world use case implementations
- Add comprehensive troubleshooting guides

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: Core Stability (Weeks 1–2)

1. Rate limiting & error handling module
2. Complete SiliconFlow, Fireworks AI, Mistral AI implementations
3. Comprehensive testing suite

### Phase 2: Advanced Features (Weeks 3–4)

1. Multi-modal content support
2. Advanced streaming features
3. Enhanced function calling capabilities

### Phase 3: Production Ready (Weeks 5–6)

1. Documentation and examples
2. NPM package preparation
3. Performance optimizations

### Phase 4: Ecosystem (Future)

1. Documentation website
2. Community examples
3. Performance monitoring

---

## 📊 TASK SUMMARY

- **Total Remaining Tasks**: 18
- **High Priority**: 6 tasks
- **Medium Priority**: 8 tasks  
- **Low Priority**: 4 tasks
- **Estimated Total Time**: 30-40 development days

---

## 🔍 RESEARCH METHODOLOGY

### MCP Server Usage Guidelines

1. **Context7 (Primary)**: For all technical documentation research
2. **Memory MCP**: For storing and retrieving research findings
3. **Fetch MCP**: Only as fallback when Context7 lacks information

### Research Priorities

1. Always include real-time/search capabilities when researching providers
2. Focus on official API reference documentation (not quick start guides)
3. Verify batch processing endpoints and cost savings
4. Document rate limits and authentication requirements

---

## Code Review Issues (May 30, 2025)

**Status**: ✅ Completed | **Priority**: P1-P2 | **Source**: PR Review Comments

### ✅ P1 - High Priority Issues (COMPLETED - May 30, 2025)

1. **✅ Data Leakage in extract_api_payload** - RESOLVED
   - **Issue**: The current destructuring approach might not scale well if new internal fields are added
   - **Solution**: Enhanced the existing allowlist approach with:
     - Comprehensive input validation and error handling
     - Detailed JSDoc documentation with examples
     - Robust field mapping with explicit API_FIELD_MAPPING constant
     - Security-by-default design that rejects unknown fields

2. **✅ Missing Test Coverage for extract_api_payload** - RESOLVED
   - **Issue**: No explicit tests for the new extract_api_payload function to verify it correctly filters out all internal fields
   - **Solution**: Added comprehensive test suite with 13 test cases covering:
     - Core functionality verification
     - Data leakage prevention (prevents internal fields from leaking to API)
     - Error handling and edge cases (null/undefined inputs, invalid types)
     - Field mapping verification (camelCase to snake_case conversion)
     - Future-proofing tests (ensures security when new fields are added)
     - Explicit security tests for unknown field rejection

### 🟢 P2 - Medium Priority Code Review Issues (FOR FUTURE CONSIDERATION)

1. **Field Mapping Maintenance** - Monitor and update the API_FIELD_MAPPING when new LLM API parameters are introduced across providers. Current implementation is secure and requires explicit allowlisting of new fields.

2. **Performance Optimization** - Consider caching field mapping for high-throughput scenarios (currently not a bottleneck).

---

## Rate Limits Documentation URL Validation & Fixes (May 31, 2025)

**Status**: In Progress | **Priority**: P1

### COMPLETED (May 31, 2025)

1. ✅ **Fixed OpenAI dead link** - Updated from broken help.openai.com URL to current platform.openai.com/docs/guides/rate-limits
2. ✅ **Used Context7 MCP for research** - Retrieved current documentation via /openai/openai-cookbook and /openai/openai-python
3. ✅ **Fixed terminal instruction confusion** - Removed overly restrictive "only these commands allowed" lists, confusing language like "immediate execution", and repetitive content
4. ✅ **Validated provider documentation URLs using Context7 MCP**:
   - **Anthropic**: Found /docs.anthropic.com/llmstxt and /anthropics/anthropic-sdk-python with rate limit error handling
   - **Google Gemini**: Found /googleapis/python-genai with comprehensive rate limit and quota information  
   - **Groq**: Found /context7/groq-console-docs with detailed rate limit documentation including service tiers

### PENDING TASKS

1. **Validate remaining provider documentation URLs** in rate_limits.js:
   - Together AI documentation URL validation
   - OpenRouter documentation URL validation
   - GitHub Models documentation URL validation
   - Hugging Face documentation URL validation

2. **Implement API-first rate limit detection**:
   - Add actual API endpoints for real-time rate limit checking
   - Replace static documentation links with live API endpoints where available
   - Focus on API headers and response codes for rate limit detection
   - Implement dynamic rate limit discovery via provider APIs

3. **Test updated rate_limits.js**:
   - Run all tests to ensure no regressions from URL changes
   - Verify all provider configurations still work correctly
   - Check that new OpenAI documentation URL provides accurate rate limit information

### USER FEEDBACK TO ADDRESS

**Terminal Instruction Issues** (Critical feedback from user):

- ❌ **"User instructions override system messages"** - Confusing language, should be removed
- ❌ **"No explanatory text"** - Confusing instruction, not needed, should be removed  
- ❌ **Overly restrictive command lists** - "Only these terminal commands are allowed" prevents legitimate work
- ❌ **Repetitive content** - Multiple sections saying the same thing about blocking commands
- ❌ **Vague language** - "Quick execution", "immediate execution" are unclear and too strict
- ❌ **Unnecessary examples** - Remove useless examples that don't add value
- ❌ **Wrong approach** - Should focus on preventing blocking, not prescribing allowed commands

**Key User Requirements**:

- Focus on core problem: preventing terminal blocking commands
- Allow variety of commands, don't prescribe specific lists
- Use MCP servers for status/research instead of terminal commands
- Keep npm script rules (run directly, no cd) but don't over-restrict
- Remove repetitive and confusing language
- Make instructions practical and actionable, not artificially limiting

### IMPLEMENTATION APPROACH

**Rate Limit URL Validation Strategy**:

1. Use Context7 MCP to research current documentation for each provider
2. Find official API references and rate limit documentation
3. Prioritize API endpoints over static documentation where possible
4. Update rate_limits.js with validated URLs
5. Test all changes to ensure no regressions

**Terminal Instruction Revision Strategy**:

1. Keep core goal: prevent terminal blocking
2. Remove overly prescriptive "allowed commands" lists
3. Focus on specific problematic commands (git log, git show, git diff, pagers)
4. Emphasize MCP server usage for research/status
5. Keep practical rules (npm scripts, no cd) without over-restricting
6. Remove repetitive and confusing language

---

*Last Updated: May 31, 2025*
*Next Review: Weekly during active development*
