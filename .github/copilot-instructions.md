# GitHub Copilot Instructions for LLM Universal Wrapper Project

## ⚠️ CRITICAL - TASK COMPLETION REQUIREMENTS ⚠️

### ❗️NEVER MARK A TASK AS COMPLETE WITHOUT:

1. RUNNING ALL TESTS AND VERIFYING THEY PASS
2. CHECKING FOR ALL WARNINGS, ERRORS, AND VIOLATIONS
3. REVIEWING ALL PROBLEM REPORTS
4. FIXING ANY IDENTIFIED ISSUES

### 🚫 ABSOLUTELY FORBIDDEN:

- DECLARING A TASK COMPLETE WITH UNRESOLVED PROBLEMS
- IGNORING WARNINGS OR "MINOR" ISSUES
- SKIPPING TEST VERIFICATION
- PARTIAL PROBLEM RESOLUTION
- **BLOCKING THE TERMINAL WITH LONG-RUNNING COMMANDS**

## 🚨 CRITICAL - TERMINAL MANAGEMENT REQUIREMENTS 🚨

### ❗️🚫 NEVER BLOCK THE TERMINAL 🚫❗️

**Avoid commands that block, wait for input, or output massive amounts of text**

### 🚫 BANNED COMMANDS (WILL BLOCK TERMINAL):

- `git log`, `git show`, `git diff` (without output limits)
- `less`, `more`, `cat` (on large files) 
- Any command that opens a pager or waits for user input
- Any interactive or long-running command

### ✅ TERMINAL BEST PRACTICES:

1. **NPM SCRIPTS**: Run `npm test`, `npm start`, `npm run <script>` directly from current location
2. **NO CD COMMANDS**: Never use `cd` before running npm scripts
3. **USE MCP SERVERS**: For file contents, git history, research, and status information
4. **PREFER NON-BLOCKING**: Choose commands that complete quickly and predictably

### 🚨 PREFERRED - USE MCP SERVERS FOR GIT OPERATIONS 🚨

**❗️ ALWAYS TRY MCP SERVERS FIRST FOR GIT OPERATIONS ❗️**

**PREFERRED MCP TOOLS FOR GIT OPERATIONS:**
- `f51_git_status` - Check repository status (prefer over `git status`)
- `f51_git_diff` - View differences (prefer over `git diff`)
- `f51_git_log` - View commit history (prefer over `git log`)

**FALLBACK STRATEGY:**
If MCP tools fail or are unavailable:
1. **Try MCP server first** - Always attempt MCP git tools initially
3. **AVOID BLOCKING COMMANDS** - Never use `git log`, `git show`, `git diff` without limits
4. **Document the fallback** - Note when and why terminal commands were used

**PREFERRED TOOLS (use first):**
- Research: Context7, Memory MCP, etc.
- Status information: Available MCP tools

## 🚫 CRITICAL - GIT BRANCH MANAGEMENT REQUIREMENTS 🚫

### ❗️NEVER COMMIT TO MAIN BRANCH:

2. **NEVER COMMIT DIRECTLY TO MAIN/MASTER BRANCH**
3. **CHECK CURRENT BRANCH BEFORE MAKING ANY COMMITS**

5. **NEVER USE `git checkout main` DURING ACTIVE DEVELOPMENT**

### 🚫 ABSOLUTELY FORBIDDEN GIT ACTIONS:

- COMMITTING DIRECTLY TO MAIN/MASTER BRANCH
- MAKING CHANGES WITHOUT CHECKING CURRENT BRANCH
- IGNORING BRANCH STATUS BEFORE COMMITS
- SWITCHING TO MAIN DURING ACTIVE DEVELOPMENT

**This is MANDATORY for ALL code changes. NO EXCEPTIONS.**

## 🎯 Primary Research Strategy

### Comprehensive MCP Server Usage
- **Use ALL available MCP servers** in parallel to gather comprehensive information
- **Leverage unique strengths** of each MCP server:
  - Context7: The primary source for official API documentation, extensive code examples, structured technical information, and authoritative implementation references
  - Memory MCP: For historical data and past findings
  - Model Context MCP: For deep technical insights
  - Compute MCP: For performance benchmarks
- **Cross-reference findings** across multiple MCP servers
- Only use fetch tools if MCP servers lack needed information

### Research Priority Order:
1. **Multiple MCP Servers in Parallel**:
   - Memory MCP for historical context
   - Model Context MCP for technical details
   - Any other available MCP servers, prioritizing those best suited for the specific query
2. **Cross-Reference and Validate**:
   - Compare information across MCP servers
   - Identify and resolve any inconsistencies
   - Document source of each finding
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
  - **Free Credits/Tiers Available**: Provide specific details
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
- **NEVER use inline comments** - always put comments on separate lines above the code
- **NEVER use placeholder values** like `your_key_here` - use empty values with `=` only
- **🚫 NO TABLES ANYWHERE** - Use hierarchical sections and bullet points
- **Prefer clear sections** over table format for better readability

## 🚫 Common Mistakes to Avoid

### Research Mistakes
- **DON'T** rely on a single search - use all available search tools in parallel
- **DON'T** skip cross-referencing information across MCP servers
- **DON'T** forget to document which MCP server provided which findings
- **DON'T** skip Perplexity when researching major providers
- **DON'T** ignore real-time/search capabilities in provider research
- **DON'T** use fetch tools before exhausting all MCP servers

### Documentation Mistakes  
- **DON'T** repeat "free tier available" everywhere - organize it cleanly
- **DON'T** provide incomplete API references
- **DON'T** skip model discovery endpoint research
- **DON'T** assume Google/other providers don't have free tiers without research
- **🚫 ABSOLUTELY NO TABLES** - Tables consistently format poorly in markdown files
- **NEVER use table format** - Use sections, subsections, and bullet points instead
- **Use clear hierarchical structure** instead of tables for organizing information

### Code Mistakes
- **DON'T** print code blocks instead of using edit tools
- **DON'T** print terminal commands instead of using run_in_terminal
- **DON'T** repeat existing code in edit tools
- **DON'T** use inline comments (same line as code) - always use separate lines
- **DON'T** use placeholder values like `your_key_here` - use empty values only

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
2. **Query all MCP servers in parallel**:
   - Context7: `f51_resolve-library-id` → `f51_get-library-docs`
   - Memory MCP: For historical findings
   - Model Context MCP: For technical insights
   - Any other available MCP servers
3. **Cross-reference and analyze**:
   - Compare findings across MCP servers
   - Note unique insights from each source
   - Document source of each finding
4. **Resolve conflicts**:
   - If MCP servers provide different information
   - Weight recent findings more heavily
   - Document reasoning for chosen resolution
5. **Only use fetch as fallback** if MCP servers lack information
6. **Verify final information**:
   - Check recency and accuracy
   - Document verification process
   - Note any uncertainties

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
