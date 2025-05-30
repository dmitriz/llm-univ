# LLM Universal Wrapper - Implementation To-Do List

**Date**: May 30, 2025
**Priority**: High

## Urgent Provider Implementations

The following providers need implementation in `create_request.js`:

### High Priority Providers

#### SiliconFlow

- [ ] Complete API documentation research
- [ ] Add batch processing support
- [ ] Update rate limiting information

#### Fireworks AI

- [ ] Verify batch API endpoint: `https://api.fireworks.ai/v1/batches`
- [ ] Research JSONL format requirements
- [ ] Document rate limits and pricing

#### Mistral AI

- [ ] Verify batch API endpoint: `https://api.mistral.ai/v1/batches`
- [ ] Research function calling capabilities
- [ ] Document rate limits

### Research Required Providers

#### Replicate

- [ ] Research complete API structure
- [ ] Investigate batch processing compatibility
- [ ] Document unique pricing model
- [ ] Determine universal schema compatibility

#### Cohere

- [ ] Research API endpoint structure
- [ ] Investigate batch processing support
- [ ] Document authentication requirements

#### AI21 Labs

- [ ] Research API structure for Jurassic models
- [ ] Document model capabilities
- [ ] Investigate batch processing possibilities

### Common Tasks for All Providers

- [ ] Add to provider enum in schema
- [ ] Implement in create_request.js
- [ ] Add comprehensive test cases
- [ ] Update documentation

## Rate Limiting Implementation

- [ ] Create rate_limits.js module
- [ ] Implement provider-specific retry strategies
- [ ] Add exponential backoff with jitter
- [ ] Create comprehensive documentation
- [ ] Integrate with create_request.js

## Testing

- [ ] Create test suite for batch processing
- [ ] Add provider-specific tests
- [ ] Test with real API endpoints using free tiers
- [ ] Test error handling and rate limiting
- [ ] Create comprehensive testing guide

## Documentation

- [ ] Create comprehensive provider comparison matrix
- [ ] Document provider-specific rate limits
- [ ] Add batch processing workflow examples
- [ ] Create troubleshooting guide

---

**Assignee**: LLM Universal Wrapper Team
**Deadline**: June 15, 2025
**Review Date**: June 7, 2025
