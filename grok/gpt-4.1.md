# Grok Live Search API: Prompt Engineering Guide for Twitter & Web  
**File:** `/phase-1/research/prompts/gpt4-grok-search.md`  
**Analyst:** GPT-4.1  
**Last Updated:** 2025-05-31

---

## Overview

This document provides **optimized prompt strategies** for leveraging the Grok Live Search API, with a focus on **Twitter (X) and open web content**. It addresses real-time trend extraction, signal control, credibility checks, and unique aspects of Grok vs. traditional search APIs.

---

## 1. Meta-Observations on Grok Prompting

- **Explicit Signal Targeting:** Grok is tuned for *high-signal, real-time* results; prompts specifying engagement, virality, or recency outperform generic queries.
- **Time Window Control:** Timeframes (e.g., "past 2 hours") dramatically refine social trend and event detection.
- **Social Context Cues:** Prompts using "according to experts," "most shared," or "top discussions" yield richer, more curated snippets.
- **Sentiment & Actor Filtering:** Including stance ("positive about...", "critical of...") or account type ("industry insiders," "verified profiles") sharpens results.
- **Credibility/Source Bias:** Grok can prioritize or exclude sources (e.g., "excluding memes, only verified journalists").
- **Citation Anchoring:** For agent workflows, prompts should request direct source links or post IDs for auditability.

---

## 2. Example Prompts by Use Case

### A. **Trend Detection**

**Goal:** Surface emerging topics, memes, or events in near-real time.

```plaintext
Find the top trending discussions on [TOPIC] from Twitter and major news sites in the past 2 hours. Focus on posts with high engagement or viral spread. Summarize the 3 main themes, and list the original tweets or articles with timestamps.
```

```plaintext
What are the most shared or rapidly growing hashtags related to [EVENT] on Twitter within the last 60 minutes? Provide a bullet list with short context for each trend.
```

---

### B. **Credibility Screening**

**Goal:** Filter credible information, surface expert or authoritative sources.

```plaintext
Search for the latest expert commentary or analysis on [SUBJECT] from Twitter. Only include posts from verified profiles, industry leaders, or accounts with >10k followers, posted in the last 24 hours. Exclude jokes, memes, or spam.
```

```plaintext
Retrieve real-time posts about [ISSUE] from journalists or official news sources on Twitter, prioritizing original reporting and factual statements. Provide direct links to each post and note any consensus or conflicting views.
```

---

### C. **Persona Mining**

**Goal:** Profile influential actors, communities, or sentiment clusters.

```plaintext
Identify the most influential accounts driving conversation about [TOPIC] on Twitter in the last 7 days. Summarize each persona's main stance, follower count, and most viral post (with link).
```

```plaintext
Map out key opinion clusters around [CONTROVERSY] on Twitter. Group by sentiment (supportive, critical, neutral) and highlight notable voices in each group with a representative post.
```

---

### D. **Citation Harvesting**

**Goal:** Extract reference-quality links or primary sources for downstream agent consumption.

```plaintext
Find the top 5 most-cited links in recent Twitter discussions about [TECHNOLOGY] in the last 3 days. For each, provide the tweet text, source URL, and why it was shared.
```

```plaintext
Aggregate high-authority open web articles cited by experts in Twitter threads about [POLICY CHANGE]. List article titles, URLs, and associated tweet links.
```

---

## 3. LLM Integration & Agent Workflow Tips

* **Chaining:** Use Grok to retrieve and *rank* raw results; pipe output through LLM for aggregation, summarization, or action (e.g., alerting, fact-checking).
* **Parameterization:** Explicitly pass timeframe, min engagement, account type as structured parameters in agent prompts to maximize relevance.
* **Post-Processing:** LLMs can filter, de-duplicate, or cluster Grok results, e.g., to build a citation graph or persona map for downstream tasks.
* **Feedback Loop:** Design agent chains that assess result quality ("Is this trending post credible? Harvest 3 corroborating sources using Grok").

---

## 4. Comparative Notes: Grok vs. Traditional Search

* **Temporal Precision:** Grok is superior for *live* events and spike detection (Google and Sonar lag in ultra-fresh contexts).
* **Signal Bias:** Grok can rank by engagement or virality natively; traditional search prioritizes authority/SEO.
* **Social Web Native:** Grok is optimized for short-form, high-noise environments; expects filtering for sentiment, source, and actor more than classic search APIs.

---

## 5. Reference Patterns (for Prompt Writers)

* Always anchor timeframe: `"in the last [X] hours/days"`
* Specify platform: `"from Twitter"` or `"open web sites"`
* Target post attributes: `"most shared"`, `"original reporting"`, `"by experts"`
* Require links/IDs: `"provide post IDs and URLs"`
* Use role cues: `"excluding jokes or memes"`, `"from journalists or verified accounts"`

---

**End of file**
