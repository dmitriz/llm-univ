# LLM Provider Information Collection

This directory contains data collected by the LLM Provider Information Collector script. The script gathers publicly available information from various LLM providers without requiring API keys.

## Files Overview

| File | Description |
|------|-------------|
| `provider_summary.md` | **Human-readable summary** of all provider information, authentication requirements, free tiers, special features, and research methodology |
| `all_providers_2025-05-30.json` | Raw data collected from all providers including model lists, endpoints, and capabilities |
| `summary_report.json` | Statistical summary of all providers (19 providers, 405 models) - latest version |
| `summary_2025-05-30.json` | Previous statistical summary (14 providers, 382 models) |
| `openrouter_info_2025-05-30.json` | Detailed information specific to OpenRouter provider |

## Usage

The most useful files for understanding provider capabilities are:

- `provider_summary.md` - Start here for a human-readable overview
- `summary_report.json` - For statistical analysis and quick reference

## Research Methodology

Information was collected through:
1. Public API endpoints when available without authentication
2. Documentation scraping when direct API access wasn't available
3. Context7 MCP server for comprehensive documentation research
4. Memory MCP for storing and retrieving research findings
5. Fetch MCP for web-based verification and additional research

## Recent Updates

### May 30, 2025 - Batch Processing Verification
- **Groq Batch API Confirmed**: Verified that Groq does support dedicated batch processing via `/v1/batches` endpoint
- **Endpoint Correction**: Updated from "async requests recommended" to full batch API support
- **Documentation Source**: Context7 MCP research confirmed official Groq Cloud documentation
- **Implementation Updated**: `create_request.js` now properly implements Groq batch processing with:
  - File upload via Files API
  - Batch creation with completion windows (24h-7d)
  - JSONL format support
  - Metadata and custom ID support

Last updated: May 30, 2025
