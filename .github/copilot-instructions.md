# GitHub Copilot Instructions for LLM Universal Wrapper Project

## 🎯 Primary Research Strategy

### Context7 MCP Server - ALWAYS FIRST CHOICE
- **ALWAYS** use Context7 (MCP server) for documentation research BEFORE trying fetch tools
- Context7 provides more comprehensive, up-to-date, and structured documentation
- Only fallback to fetch tools if Context7 doesn't have the needed information
- For technical documentation, Context7 has proven superior with extensive code examples

### Research Priority Order:
1. **Context7 MCP Server** (`f51_resolve-library-id` → `f51_get-library-docs`)
2. **Other MCP Servers** (if available and relevant)  
3. **Fetch tools** (only as last resort due to frequent 403 errors from bot protection)

## 🔧 Project-Specific Guidelines

### LLM Provider Research
- **Always include Perplexity** as a major provider with real-time search capabilities
- Focus on **live search/real-time capabilities** when researching providers:
  - Grok's live search functionality
  - Google's Grounding with Search
  - Perplexity's search-augmented models
  - OpenAI's web browsing capabilities
  - Any provider-specific real-time data access

### Free Tier Information Organization
- **Avoid repetition** - create clean sections instead of repeating "free tier available"
- Structure as:
  - **No API Key Required**: GitHub Models, Ollama
  - **Free Credits/Tiers Available**: List with specific details
  - **Payment Required**: Focus on minimum deposit requirements, not just "payment required"

### Model Discovery & Documentation
- **Research model discovery endpoints** for dynamic model retrieval
- Document **official model listing APIs** where available
- Provide **direct links** to complete API references
- Focus on **cost-effective model selection** guidance

### Schema Field Verification
- Ensure every schema field corresponds to **real API parameters**
- Provide **direct links** to parameter documentation
- Verify **cross-provider compatibility**

## 📝 Documentation Standards

### Link Quality
- Use **complete REST API reference** links, not specific endpoint links
- Verify links point to comprehensive documentation
- Include **model discovery endpoints** where available
- Add **pricing/tier information** links

### Code Organization
- Use **comments** (`// ...existing code...`) instead of repeating existing code in edits
- Group changes by file
- Provide **clear explanations** for each edit

## 🚫 Common Mistakes to Avoid

### Research Mistakes
- **DON'T** use fetch tools first - always try Context7 first
- **DON'T** skip Perplexity when researching major providers
- **DON'T** ignore real-time/search capabilities in provider research
- **DON'T** assume information is up-to-date without checking Context7

### Documentation Mistakes  
- **DON'T** repeat "free tier available" everywhere - organize it cleanly
- **DON'T** provide incomplete API references
- **DON'T** skip model discovery endpoint research
- **DON'T** assume Google/other providers don't have free tiers without research

### Code Mistakes
- **DON'T** print code blocks instead of using edit tools
- **DON'T** print terminal commands instead of using run_in_terminal
- **DON'T** repeat existing code in edit tools

## 🎯 Current Project Focus Areas

### Batch Processing
- **Cost savings**: OpenAI (50%), Anthropic (50%), Groq (25%)
- **Implementation**: Focus on universal schema integration
- **Documentation**: Provider-specific batch API differences

### Rate Limits Management
- **Comprehensive provider coverage**: All 13 providers
- **Reusable module design**: Separate from main logic
- **Real usage data**: From official documentation via Context7

### Real-Time Search Integration
- **Grok live search**: Latest search capabilities
- **Google Grounding**: Search integration for Gemini
- **Perplexity models**: Search-augmented AI capabilities
- **Cross-provider comparison**: Real-time data access features

## 🔍 Research Workflow

1. **Identify information need**
2. **Use Context7 first**: `f51_resolve-library-id` → `f51_get-library-docs`
3. **Check multiple MCP servers** if available
4. **Only use fetch as fallback** for information not in Context7
5. **Verify information recency** and accuracy
6. **Cross-reference multiple sources** when possible

## 📊 Quality Metrics

### Research Quality
- ✅ Used Context7 for technical documentation
- ✅ Included all major providers (including Perplexity)
- ✅ Found real-time/search capabilities where available
- ✅ Provided complete API reference links

### Documentation Quality  
- ✅ Clean, organized structure without repetition
- ✅ Direct links to relevant documentation
- ✅ Practical implementation guidance
- ✅ Cost and tier information accuracy

### Code Quality
- ✅ Used appropriate edit tools instead of printing code
- ✅ Clean, commented changes
- ✅ Proper file organization
- ✅ Working tests after changes

---

*These instructions help ensure consistent, high-quality work on the LLM Universal Wrapper project. Always prioritize Context7 for research and maintain clean, organized documentation.*
