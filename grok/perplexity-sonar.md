# Perplexity Sonar

**Key Differentiators**

- **Real-Time Web Search:** Unlike traditional LLMs limited by training data cutoffs, Perplexity Sonar models are optimized for live web search, delivering answers based on current, real-time information[2][3][13].
- **Multiple Model Variants:**  
  - **sonar:** Balanced for general, fast, and factual queries.
  - **sonar-pro:** Enhanced for deeper research, with more sources and citations per query.
  - **sonar-reasoning:** Specialized for logical reasoning and multi-step analysis.
  - **sonar-deep-research:** Designed for in-depth, multi-source synthesis and comprehensive report generation[3][6][7].
- **Depth and Breadth:** Sonar models cite 2–3x more sources than comparable models like Gemini, and outperform or match frontier models (GPT-4o, Claude 3.5 Sonnet) in user satisfaction and factual accuracy[1][2][12].
- **Source Attribution:** Built-in citations and transparent source attribution, allowing users to verify information and trace the origin of answers[1][7][18].
- **Fast Inference:** Powered by specialized hardware (Cerebras Wafer Scale Engines), Sonar can generate responses at speeds up to 1,200 tokens per second, enabling near-instant answers[2][12].

**Optimal Prompts and Controls**

- **Live Search Trigger:** Prompts should be explicit and factual (e.g., "Summarize the latest news on renewable energy policy"). Sonar models automatically perform web searches unless disabled by API or UI settings[2][3][13].
- **Date Filters:** Use `search_after_date_filter` and `search_before_date_filter` in API requests to restrict results to a specific publication date range (format: `MM/DD/YYYY`)[5][14].
- **Source Control:**  
  - **Domain Filtering:** Use `search_domain_filter` to include or exclude specific domains (e.g., `["wikipedia.org", "nature.com", "-reddit.com"]`)[14].
  - **Recency Filtering:** Use `search_recency_filter` to prioritize recent sources (options: `'month'`, `'week'`, `'day'`, `'hour'`)[14].
- **Structured Output:** Request JSON or markdown output for easier parsing and integration[14].
- **Related Questions:** Enable `return_related_questions` to get follow-up question suggestions[14].

**Rate Limits, Token Sizes, and Integration Bottlenecks**

- **Rate Limits:**  
  - Default for Sonar online models: 50 requests/minute for all API users[7][18].
  - Higher limits or enterprise options may be available upon request.
- **Token Sizes:**  
  - **Standard Sonar:** Up to 4,000 tokens per query by default[8].
  - **Extended Context:** Pro subscribers and certain models (e.g., sonar-deep-research) support up to 200,000 tokens for long research sessions[3][13].
  - **Output Tokens:** Up to 4,000 tokens for GPT-4 Omni and Claude 3.5 Sonnet responses[8].
- **Integration Bottlenecks:**  
  - **Streaming Issues:** Some integrations (e.g., with OpenRouter or custom MCP clients) may encounter 502 errors or timeouts if streaming is enabled for models like sonar-deep-research. Disabling streaming resolves this[10].
  - **API Reliability:** Occasional API failures or hallucinations have been reported, especially with complex or niche queries[16].
  - **Custom Connectors:** Limited support for custom enterprise connectors; feature requests are under consideration[16].

**Limitations in Logic, Accuracy, or Citation Quality**

- **Occasional Inaccuracies:** Like all LLMs, Sonar models can produce hallucinations or incorrect information, especially on complex or niche topics[9][15][16].
- **Citation Quality:**  
  - **Empty Citations:** The `citations` key in API responses can sometimes be empty or incomplete, particularly with sonar-deep-research[11].
  - **Broken Links:** Occasional issues with hallucinated or broken links, especially under heavy load or with certain domain filters[16].
- **Logic and Reasoning:**  
  - **Complex Queries:** May struggle with highly technical, interdisciplinary, or nuanced queries where information is sparse or contradictory[9][15].
  - **Repetitive Outputs:** Some redundancy or repetition in answers, especially for multi-part or ambiguous prompts[9].
- **Domain-Specific Limitations:** Accuracy varies across domains; specialized or emerging fields may yield less reliable results[9][15].
- **Human Nuance and Creativity:** Limited ability to generate truly novel ideas or nuanced human judgment; best suited for factual, research-oriented tasks[9][15].

---

This profile is suitable for inclusion under `/models/perplexity/` and is informed by internal repository documentation, MCP search results, and published benchmarks.

Citations:
[1] https://www.perplexity.ai/hub/blog/perplexity-sonar-dominates-new-search-arena-evolution
[2] https://www.perplexity.ai/hub/blog/meet-new-sonar
[3] https://www.kerlig.com/blog/perplexity-deep-research
[4] https://www.perplexity.ai/hub/blog/introducing-the-sonar-pro-api
[5] https://docs.perplexity.ai/guides/date-range-filter-guide
[6] https://github.com/felores/perplexity-sonar-mcp
[7] https://docs.perplexity.ai/changelog/changelog
[8] https://www.perplexity.ai/hub/technical-faq/what-is-a-token-and-how-many-tokens-can-perplexity-read-at-once
[9] https://www.aidemystified.ai/ai-knowledge-base/limitations-of-perplexity-ais-current-technology/
[10] https://meta.discourse.org/t/problems-manually-configuring-perplexity-sonar-deep-research/365572
[11] https://www.reddit.com/r/perplexity_ai/comments/1iyfq0q/api_issues_with_sonardeepresearch/
[12] https://the-decoder.com/perplexity-ai-launches-new-ultra-fast-ai-search-model-sonar/
[13] https://relevanceai.com/llm-models/set-up-and-use-perplexity-llama3-sonar-8b-for-ai-applications
[14] https://www.promptfoo.dev/docs/providers/perplexity/
[15] https://www.byteplus.com/en/topic/407361
[16] https://github.com/ppl-ai/api-discussion/issues
[17] https://github.com/continuedev/continue/issues/4512
[18] https://docs.perplexity.ai/llms-full.txt
[19] https://xpert.digital/en/ai-search-for-ranking/
[20] https://www.reddit.com/r/perplexity_ai/comments/1hg4il9/what_model_you_usebest_model/
[21] https://www.techtarget.com/searchenterpriseai/tutorial/How-to-use-Perplexity-AI-Tutorial-pros-and-cons
[22] https://www.zdnet.com/article/is-perplexitys-sonar-really-more-factual-than-its-ai-rivals-see-for-yourself/
[23] https://docs.perplexity.ai/faq/faq
[24] https://sonar.perplexity.ai
[25] https://docs.perplexity.ai/guides/prompt-guide
[26] https://community.perplexity.ai/t/citations-public-release-and-increased-default-rate-limits/89
[27] https://docs.perplexity.ai/guides/pricing
[28] https://www.reddit.com/r/MachineLearning/comments/13jrwe0/perplexity_ai_strengths_limitations_discussion/
[29] https://www.perplexity.ai/hub/blog/new-sonar-search-modes-outperform-openai-in-cost-and-performance
[30] https://www.godofprompt.ai/blog/grok-3-vs-perplexity-ai-which-ai-tool-is-best-for-research
[31] https://www.reddit.com/r/perplexity_ai/comments/1fhtpp8/can_someone_explain_to_me_which_ai_model_suitable/
[32] https://www.reddit.com/r/perplexity_ai/comments/1ipe1q4/sonar_model_adding_internal_code_to_writing/
[33] https://www.youtube.com/watch?v=oMmzFeuvo6w
[34] https://www.reddit.com/r/perplexity_ai/comments/1fp9w1g/query_rate_limit_exceeded_please_try_perplexity/
[35] https://www.youtube.com/watch?v=OTWekfcFdOI
[36] https://www.perplexity.ai/help-center/en/articles/10354924-about-tokens
[37] https://www.reddit.com/r/perplexity_ai/comments/1gz0ge4/perplexity_is_fraudulently_using_chatgpt_35_to/

---
Answer from Perplexity: pplx.ai/share
