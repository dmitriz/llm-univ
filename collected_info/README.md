# LLM Provider Information Collection

This## Usage

The most useful files for understanding provider capabilities:

- **[provider_summary.md](provider_summary.md)** - Start here for an overview
- **[summary_report.json](summary_report.json)** - For statistical analysis and quick referencetory contains data collected by the LLM Provider Information Collector script. The script gathers publicly available information from various LLM providers without requiring API keys.

## Files Overview

### Primary Files

#### provider_summary.md

- Human-readable summary of all provider information
- Authentication requirements and free tiers
- Special features and research methodology
- Start here for an overview

#### summary_report.json

- Statistical summary of all providers
- Latest version with 19 providers and 408 models
- Includes validation and data freshness indicators
- Use for statistical analysis and quick reference

### Raw Data Files

#### all_providers_2025-05-30.json

- Complete raw data collected from all providers
- Includes model lists, endpoints, and capabilities
- Most comprehensive data source

#### openrouter_info_2025-05-30.json

- Detailed information specific to OpenRouter provider
- Specialized collection results

### Backup Files

#### backups/ directory

- Contains previous versions of summary files
- summary_2025-05-30.json: Previous statistical summary (14 providers, 382 models)
- summary_report_2025-05-30T05-33-00-014Z.json: Timestamped backup

## Usage

The most useful files for understanding provider capabilities:

- **provider_summary.md** - Start here for a human-readable overview
- **summary_report.json** - For statistical analysis and quick reference

## Research Methodology

Information was collected through multiple sources:

1. Public API endpoints when available without authentication
2. Documentation scraping when direct API access wasn't available  
3. Context7 MCP (Model Context Protocol) server for comprehensive documentation research
4. Memory MCP for storing and retrieving research findings
5. Fetch MCP for web-based verification and additional research

## Recent Updates

### May 30, 2025 - Batch Processing Verification

#### Groq Batch API Confirmed

- Verified that Groq does support dedicated batch processing via `/v1/batches` endpoint
- Updated from "async requests recommended" to full batch API support
- Documentation Source: Context7 MCP research confirmed official Groq Cloud documentation

#### Implementation Updated

The `create_request.js` now properly implements Groq batch processing with:

- File upload via Files API
- Batch creation with completion windows (24h-7d)  
- JSONL format support
- Metadata and custom ID support

Last updated: May 30, 2025
