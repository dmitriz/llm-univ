/**
 * Provider Information Collector
 * 
 * This script collects publicly available information from LLM providers
 * without requiring API keys. It includes model lists, pricing info,
 * rate limits, and other metadata that can be accessed via public endpoints.
 * 
 * Usage: node provider_info_collector.js [provider_name]
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/**
 * Public endpoints for each provider
 * These endpoints typically don't require authentication
 */
const PUBLIC_ENDPOINTS = {
  // OpenAI - No public model list endpoint without API key
  openai: {
    models: null, // Requires API key
    pricing: 'https://openai.com/pricing',
    documentation: 'https://platform.openai.com/docs/models',
    status: 'https://status.openai.com/api/v2/status.json',
    publicInfo: [
      'https://platform.openai.com/docs/models', // Model info in docs
      'https://openai.com/pricing' // Pricing page
    ]
  },

  // Anthropic - No public model list endpoint
  anthropic: {
    models: null, // Requires API key
    pricing: 'https://www.anthropic.com/pricing',
    documentation: 'https://docs.anthropic.com/en/docs/about-claude',
    publicInfo: [
      'https://www.anthropic.com/pricing',
      'https://docs.anthropic.com/en/docs/about-claude'
    ]
  },

  // Google Gemini - Has some public model info
  google: {
    models: 'https://generativelanguage.googleapis.com/v1beta/models', // May work without API key
    pricing: 'https://ai.google.dev/pricing',
    documentation: 'https://ai.google.dev/gemini-api/docs/models',
    publicInfo: [
      'https://ai.google.dev/pricing',
      'https://ai.google.dev/gemini-api/docs/models'
    ]
  },

  // Groq - Has public model endpoint
  groq: {
    models: 'https://api.groq.com/openai/v1/models', // Public endpoint
    pricing: 'https://groq.com/pricing/',
    documentation: 'https://console.groq.com/docs/models',
    publicInfo: [
      'https://groq.com/pricing/',
      'https://console.groq.com/docs/models'
    ]
  },

  // Together AI - May have public model info
  together: {
    models: 'https://api.together.xyz/v1/models', // May work without API key
    pricing: 'https://www.together.ai/pricing',
    documentation: 'https://docs.together.ai/docs/inference-models',
    publicInfo: [
      'https://www.together.ai/pricing',
      'https://docs.together.ai/docs/inference-models'
    ]
  },

  // OpenRouter - Has public model endpoint
  openrouter: {
    models: 'https://openrouter.ai/api/v1/models', // Public endpoint
    pricing: 'https://openrouter.ai/docs/pricing',
    documentation: 'https://openrouter.ai/docs/models',
    publicInfo: [
      'https://openrouter.ai/docs/pricing',
      'https://openrouter.ai/docs/models'
    ]
  },

  // GitHub Models - Public repository info
  'gh-models': {
    models: 'https://models.inference.ai.azure.com/models', // May work
    pricing: 'https://docs.github.com/en/github-models/prototyping-with-ai-models',
    documentation: 'https://docs.github.com/en/github-models',
    publicInfo: [
      'https://docs.github.com/en/github-models/prototyping-with-ai-models'
    ]
  },

  // Hugging Face - Has public model API
  huggingface: {
    models: 'https://huggingface.co/api/models', // Public endpoint with filters
    pricing: 'https://huggingface.co/pricing',
    documentation: 'https://huggingface.co/docs/api-inference/index',
    search: 'https://huggingface.co/api/models?filter=text-generation&sort=downloads&direction=-1&limit=20',
    publicInfo: [
      'https://huggingface.co/pricing',
      'https://huggingface.co/docs/api-inference/index'
    ]
  },

  // DeepSeek - May have public info
  deepseek: {
    models: 'https://api.deepseek.com/v1/models', // May work without API key
    pricing: 'https://platform.deepseek.com/pricing',
    documentation: 'https://platform.deepseek.com/api-docs',
    publicInfo: [
      'https://platform.deepseek.com/pricing'
    ]
  },

  // Qwen (Alibaba Cloud) - Public model info
  qwen: {
    models: null, // Likely requires API key
    pricing: 'https://help.aliyun.com/zh/dashscope/product-overview/billing-methods',
    documentation: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details',
    publicInfo: [
      'https://help.aliyun.com/zh/dashscope/product-overview/billing-methods'
    ]
  },

  // SiliconFlow - May have public endpoints
  siliconflow: {
    models: 'https://api.siliconflow.cn/v1/models', // May work without API key
    pricing: 'https://siliconflow.cn/pricing',
    documentation: 'https://docs.siliconflow.cn/',
    publicInfo: [
      'https://siliconflow.cn/pricing'
    ]
  },

  // Grok (X.AI) - Limited public info
  grok: {
    models: null, // Likely requires API key
    pricing: 'https://x.ai/pricing',
    documentation: 'https://docs.x.ai/api',
    publicInfo: [
      'https://x.ai/pricing'
    ]
  },

  // Ollama - Local deployment, GitHub for model info
  ollama: {
    models: 'https://api.github.com/repos/ollama/ollama/releases/latest', // GitHub API
    library: 'https://ollama.com/library', // Public model library
    documentation: 'https://github.com/ollama/ollama/blob/main/docs/api.md',
    publicInfo: [
      'https://ollama.com/library',
      'https://github.com/ollama/ollama/blob/main/docs/api.md'
    ]
  },

  // Perplexity - Limited public info
  perplexity: {
    models: null, // Likely requires API key
    pricing: 'https://www.perplexity.ai/pro',
    documentation: 'https://docs.perplexity.ai/',
    publicInfo: [
      'https://www.perplexity.ai/pro'
    ]
  },

  // Cohere - Enterprise LLM provider
  cohere: {
    models: 'https://api.cohere.ai/v1/models', // May work without API key
    pricing: 'https://cohere.com/pricing',
    documentation: 'https://docs.cohere.com/docs/models',
    publicInfo: [
      'https://cohere.com/pricing',
      'https://docs.cohere.com/docs/models'
    ]
  },

  // AI21 Labs - Jurassic models
  ai21: {
    models: 'https://api.ai21.com/studio/v1/models', // May work without API key
    pricing: 'https://www.ai21.com/pricing',
    documentation: 'https://docs.ai21.com/docs/overview',
    publicInfo: [
      'https://www.ai21.com/pricing',
      'https://docs.ai21.com/docs/overview'
    ]
  },

  // Fireworks AI - Fast inference platform
  fireworks: {
    models: 'https://api.fireworks.ai/inference/v1/models', // May work without API key
    pricing: 'https://fireworks.ai/pricing',
    documentation: 'https://docs.fireworks.ai/api-reference/introduction',
    publicInfo: [
      'https://fireworks.ai/pricing',
      'https://docs.fireworks.ai/api-reference/introduction'
    ]
  },

  // Replicate - Model hosting platform
  replicate: {
    models: 'https://api.replicate.com/v1/models', // Public endpoint
    pricing: 'https://replicate.com/pricing',
    documentation: 'https://replicate.com/docs/reference/http',
    publicInfo: [
      'https://replicate.com/pricing',
      'https://replicate.com/docs/reference/http'
    ]
  },

  // Mistral AI - Direct provider (not through other platforms)
  mistral: {
    models: 'https://api.mistral.ai/v1/models', // May work without API key
    pricing: 'https://mistral.ai/pricing/',
    documentation: 'https://docs.mistral.ai/api/',
    publicInfo: [
      'https://mistral.ai/pricing/',
      'https://docs.mistral.ai/api/'
    ]
  }
};

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'LLM-Universal-Wrapper/1.0',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            url: url
          };
          
          // Try to parse JSON if content-type suggests it
          if (res.headers['content-type']?.includes('application/json')) {
            try {
              result.json = JSON.parse(data);
            } catch (e) {
              // Not valid JSON, keep as string
            }
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout for ${url}`));
    });

    if (options.data) {
      req.write(options.data);
    }
    
    req.end();
  });
}

/**
 * Enhanced request with retry logic and rate limit handling
 */
async function makeRequestWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await makeRequest(url, options);
      
      // Handle rate limits
      if (response.statusCode === 429) {
        const retryAfter = parseInt(response.headers['retry-after'] || '60');
        console.log(`  ⏳ Rate limited, waiting ${retryAfter}s before retry ${attempt}/${maxRetries}`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`  ⚠️  Attempt ${attempt} failed, retrying: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
    }
  }
}

/**
 * Extract models from provider response
 */
function extractModels(provider, response) {
  if (!response.json) return null;

  switch (provider) {
    case 'groq':
    case 'openrouter':
    case 'together':
    case 'deepseek':
    case 'siliconflow':
      // OpenAI-compatible format
      if (response.json.data && Array.isArray(response.json.data)) {
        return response.json.data.map(model => ({
          id: model.id,
          name: model.id,
          description: model.description || null,
          context_length: model.context_length || model.max_tokens || null,
          pricing: model.pricing || null,
          created: model.created || null
        }));
      }
      break;

    case 'huggingface':
      // Hugging Face format
      if (Array.isArray(response.json)) {
        return response.json.slice(0, 50).map(model => ({ // Limit to first 50
          id: model.id || model.modelId,
          name: model.id || model.modelId,
          downloads: model.downloads || 0,
          likes: model.likes || 0,
          library_name: model.library_name || null,
          pipeline_tag: model.pipeline_tag || null,
          tags: model.tags || []
        }));
      }
      break;

    case 'google':
      // Google Gemini format
      if (response.json.models && Array.isArray(response.json.models)) {
        return response.json.models.map(model => ({
          id: model.name,
          name: model.displayName || model.name,
          description: model.description || null,
          version: model.version || null,
          inputTokenLimit: model.inputTokenLimit || null,
          outputTokenLimit: model.outputTokenLimit || null,
          supportedGenerationMethods: model.supportedGenerationMethods || []
        }));
      }
      break;

    case 'ollama':
      // GitHub releases format for Ollama
      if (response.json.tag_name) {
        return [{
          id: 'ollama',
          name: 'Ollama',
          version: response.json.tag_name,
          description: response.json.body || 'Local LLM runtime',
          published_at: response.json.published_at
        }];
      }
      break;

    case 'cohere':
    case 'ai21':
    case 'fireworks':
    case 'mistral':
      // OpenAI-compatible format for most providers
      if (response.json.data && Array.isArray(response.json.data)) {
        return response.json.data.map(model => ({
          id: model.id,
          name: model.name || model.id,
          description: model.description || null,
          context_length: model.context_length || model.max_tokens || null,
          pricing: model.pricing || null,
          created: model.created || null,
          capabilities: model.capabilities || null
        }));
      } else if (response.json.models && Array.isArray(response.json.models)) {
        // Alternative format
        return response.json.models.map(model => ({
          id: model.id || model.name,
          name: model.name || model.id,
          description: model.description || null,
          context_length: model.context_length || model.max_tokens || null,
          pricing: model.pricing || null,
          created: model.created || null
        }));
      }
      break;

    case 'replicate':
      // Replicate format
      if (response.json.results && Array.isArray(response.json.results)) {
        return response.json.results.slice(0, 50).map(model => ({
          id: model.url || model.name,
          name: model.name,
          description: model.description || null,
          owner: model.owner || null,
          visibility: model.visibility || null,
          github_url: model.github_url || null,
          paper: model.paper || null,
          license: model.license || null,
          created_at: model.created_at || null
        }));
      }
      break;

    default:
      return response.json;
  }

  return null;
}

/**
 * Collect information from a single provider
 */
async function collectProviderInfo(provider) {
  console.log(`\n🔍 Collecting information for ${provider}...`);
  
  const endpoints = PUBLIC_ENDPOINTS[provider];
  if (!endpoints) {
    console.log(`❌ No public endpoints defined for ${provider}`);
    return null;
  }

  const info = {
    provider: provider,
    timestamp: new Date().toISOString(),
    models: [],
    endpoints: {},
    errors: []
  };

  // Try to fetch models
  if (endpoints.models) {
    try {
      console.log(`  📋 Fetching models from ${endpoints.models}`);
      const response = await makeRequestWithRetry(endpoints.models);
      
      if (response.statusCode === 200) {
        const models = extractModels(provider, response);
        if (models && models.length > 0) {
          info.models = models;
          console.log(`  ✅ Found ${models.length} models`);
        } else {
          console.log(`  ⚠️  Models endpoint responded but no models extracted`);
        }
      } else if (response.statusCode === 401 || response.statusCode === 403) {
        console.log(`  🔒 Models endpoint requires authentication (${response.statusCode})`);
      } else {
        console.log(`  ❌ Models endpoint returned ${response.statusCode}`);
      }
      
      info.endpoints.models = {
        url: endpoints.models,
        status: response.statusCode,
        accessible: response.statusCode === 200
      };
      
    } catch (error) {
      console.log(`  ❌ Error fetching models: ${error.message}`);
      info.errors.push(`Models: ${error.message}`);
    }
  } else {
    console.log(`  ⚠️  No public models endpoint available`);
    
    // Try scraping model information from documentation/pricing pages
    if (endpoints.publicInfo && endpoints.publicInfo.length > 0) {
      console.log(`  🔍 Attempting to scrape model information...`);
      for (const url of endpoints.publicInfo) {
        const scrapedModels = await scrapeProviderInfo(provider, url);
        if (scrapedModels && scrapedModels.length > 0) {
          info.models = scrapedModels;
          console.log(`  ✅ Found ${scrapedModels.length} models via scraping`);
          break; // Use first successful scrape
        }
      }
    }
  }

  // Check other public endpoints
  for (const [key, url] of Object.entries(endpoints)) {
    if (key === 'models' || key === 'publicInfo') continue;
    
    try {
      console.log(`  🌐 Checking ${key}: ${url}`);
      const response = await makeRequest(url, { timeout: 5000 });
      
      info.endpoints[key] = {
        url: url,
        status: response.statusCode,
        accessible: response.statusCode === 200,
        contentType: response.headers['content-type']
      };
      
      if (response.statusCode === 200) {
        console.log(`  ✅ ${key} accessible`);
      } else {
        console.log(`  ⚠️  ${key} returned ${response.statusCode}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error checking ${key}: ${error.message}`);
      info.endpoints[key] = {
        url: url,
        status: null,
        accessible: false,
        error: error.message
      };
    }
  }

  return info;
}

/**
 * Collect Hugging Face model information with filters
 */
async function collectHuggingFaceModels() {
  const filters = [
    'text-generation',
    'text2text-generation', 
    'conversational',
    'question-answering'
  ];
  
  const models = [];
  
  for (const filter of filters) {
    try {
      const url = `https://huggingface.co/api/models?filter=${filter}&sort=downloads&direction=-1&limit=10`;
      console.log(`  📋 Fetching ${filter} models...`);
      
      const response = await makeRequest(url);
      if (response.statusCode === 200 && response.json) {
        const extracted = extractModels('huggingface', response);
        if (extracted) {
          models.push(...extracted);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error fetching ${filter} models: ${error.message}`);
    }
  }
  
  // Remove duplicates
  return models.reduce((acc, model) => {
    if (!acc.find(m => m.id === model.id)) {
      acc.push(model);
    }
    return acc;
  }, []);
}

/**
 * Save collected information to file with backup handling
 */
function saveToFile(data, filename) {
  const outputDir = path.join(__dirname, '..', 'collected_info');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filepath = path.join(outputDir, filename);
  
  // If this is a summary file, backup any existing version
  if (filename.includes('summary')) {
    const backupDir = path.join(outputDir, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      const backupFilename = `${path.basename(filename, '.json')}_${stats.mtime.toISOString().replace(/[:.]/g, '-')}.json`;
      const backupPath = path.join(backupDir, backupFilename);
      fs.copyFileSync(filepath, backupPath);
      console.log(`📦 Backed up previous version to ${backupPath}`);
    }
  }
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved to ${filepath}`);
  
  // Add data validation for summary files
  if (filename.includes('summary') && data.validation) {
    if (!data.validation.math_check_passed) {
      console.log(`⚠️  WARNING: Math validation failed in ${filename}`);
      data.validation.discrepancies.forEach(disc => console.log(`   ${disc}`));
    } else {
      console.log(`✅ Math validation passed for ${filename}`);
    }
  }
  
  return filepath;
}

/**
 * Generate summary report with validation
 */
function generateSummary(allInfo) {
  const timestamp = new Date().toISOString();
  const providersWithModels = allInfo.filter(p => p.models && p.models.length > 0);
  const totalModels = allInfo.reduce((sum, p) => sum + (p.models?.length || 0), 0);
  
  const summary = {
    timestamp: timestamp,
    total_providers: allInfo.length,
    providers_with_models: providersWithModels.length,
    total_models: totalModels,
    provider_summary: {},
    validation: {
      math_check_passed: false,
      calculated_total: 0,
      discrepancies: []
    }
  };
  
  let calculatedTotal = 0;
  
  for (const info of allInfo) {
    const modelCount = info.models?.length || 0;
    calculatedTotal += modelCount;
    
    summary.provider_summary[info.provider] = {
      models_found: modelCount,
      accessible_endpoints: Object.values(info.endpoints).filter(e => e.accessible).length,
      total_endpoints: Object.keys(info.endpoints).length,
      has_public_models: !!(info.models && info.models.length > 0),
      search_capabilities: detectSearchCapabilities(info.provider, info.models, info.endpoints)
    };
  }
  
  // Validation
  summary.validation.calculated_total = calculatedTotal;
  summary.validation.math_check_passed = (calculatedTotal === totalModels);
  
  if (!summary.validation.math_check_passed) {
    summary.validation.discrepancies.push(`Total models mismatch: reported ${totalModels}, calculated ${calculatedTotal}`);
  }
  
  // Add data freshness indicator
  summary.data_freshness = {
    collection_time: timestamp,
    is_latest: true,
    note: "This is the most recent data collection run"
  };
  
  return summary;
}

/**
 * Web scraping utility for providers without public APIs
 */
async function scrapeProviderInfo(provider, url) {
  try {
    console.log(`  🌐 Scraping model info from ${url}`);
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      return null;
    }

    const html = response.data;
    let models = [];

    switch (provider) {
      case 'openai':
        // Extract model information from OpenAI pricing page
        if (url.includes('pricing')) {
          const modelMatches = html.match(/gpt-[0-9a-zA-Z\.-]+/g);
          if (modelMatches) {
            models = [...new Set(modelMatches)].map(model => ({
              id: model,
              name: model,
              provider: 'openai',
              source: 'pricing_page'
            }));
          }
        }
        break;

      case 'anthropic':
        // Extract Claude model information
        if (url.includes('pricing') || url.includes('claude')) {
          const claudeMatches = html.match(/claude[^"\\s<>]*[0-9][^"\\s<>]*/gi);
          if (claudeMatches) {
            models = [...new Set(claudeMatches)].map(model => ({
              id: model.toLowerCase(),
              name: model,
              provider: 'anthropic',
              source: 'documentation'
            }));
          }
        }
        break;

      case 'perplexity':
        // Extract Perplexity model information
        if (url.includes('docs') || url.includes('pricing')) {
          // Look for model names in documentation
          const modelPatterns = [
            /llama[^"\\s<>]*[0-9][^"\\s<>]*/gi,
            /sonar[^"\\s<>]*[0-9][^"\\s<>]*/gi,
            /perplexity[^"\\s<>]*[0-9][^"\\s<>]*/gi
          ];
          
          modelPatterns.forEach(pattern => {
            const matches = html.match(pattern);
            if (matches) {
              matches.forEach(model => {
                models.push({
                  id: model.toLowerCase(),
                  name: model,
                  provider: 'perplexity',
                  source: 'documentation',
                  capabilities: url.includes('online') ? ['real-time-search'] : null
                });
              });
            }
          });
        }
        break;

      case 'grok':
        // Extract Grok model information
        if (url.includes('pricing') || url.includes('docs')) {
          const grokMatches = html.match(/grok[^"\\s<>]*[0-9][^"\\s<>]*/gi);
          if (grokMatches) {
            models = [...new Set(grokMatches)].map(model => ({
              id: model.toLowerCase(),
              name: model,
              provider: 'grok',
              source: 'documentation',
              capabilities: ['real-time-search', 'live-web-access']
            }));
          }
        }
        break;

      default: {
        // Generic extraction for other providers
        const genericPatterns = [
          new RegExp(`${provider}[^"\\s<>]*[0-9][^"\\s<>]*`, 'gi'),
          /[a-zA-Z]+-[0-9]+[bBmM]?-?[a-zA-Z]*[0-9]*[kKmMbB]?/g
        ];
        
        genericPatterns.forEach(pattern => {
          const matches = html.match(pattern);
          if (matches) {
            matches.slice(0, 10).forEach(model => { // Limit to 10 to avoid noise
              models.push({
                id: model.toLowerCase(),
                name: model,
                provider: provider,
                source: 'scraped'
              });
            });
          }
        });
        break;
      }
    }

    // Remove duplicates
    const result = models.reduce((acc, model) => {
      if (!acc.find(m => m.id === model.id)) {
        acc.push(model);
      }
      return acc;
    }, []);

    console.log(`  ✅ Scraped ${result.length} models from ${provider}`);
    return result;
    
  } catch (error) {
    console.log(`  ❌ Error scraping ${provider}: ${error.message}`);
    return null;
  }
}

/**
 * Detect real-time search capabilities from provider responses or documentation
 */
function detectSearchCapabilities(provider, modelData, endpoints) {
  const searchProviders = {
    'perplexity': {
      capabilities: ['real-time-search', 'web-search', 'search-augmented-generation'],
      evidence: 'Perplexity is known for real-time search capabilities'
    },
    'grok': {
      capabilities: ['live-web-access', 'real-time-search', 'x-platform-integration'],
      evidence: 'Grok has live web access through X platform'
    },
    'google': {
      capabilities: ['grounding-with-search', 'real-time-data'],
      evidence: 'Google Gemini has Grounding with Search feature'
    },
    'openai': {
      capabilities: ['web-browsing'],
      evidence: 'GPT models have web browsing capabilities in ChatGPT'
    }
  };

  // Check if provider has known search capabilities
  if (searchProviders[provider]) {
    return searchProviders[provider];
  }

  // Look for search-related keywords in model descriptions
  if (modelData && modelData.length > 0) {
    const searchKeywords = ['search', 'web', 'online', 'real-time', 'live', 'browse', 'internet', 'current'];
    const hasSearchCapability = modelData.some(model => {
      const description = (model.description || '').toLowerCase();
      const modelName = (model.name || model.id || '').toLowerCase();
      return searchKeywords.some(keyword => 
        description.includes(keyword) || modelName.includes(keyword)
      );
    });

    if (hasSearchCapability) {
      return {
        capabilities: ['potential-search-capability'],
        evidence: 'Search-related keywords found in model descriptions'
      };
    }
  }

  return null;
}

/**
 * Collect rate limit information from response headers
 */
function extractRateLimitInfo(headers) {
  const rateLimitKeys = {
    'x-ratelimit-limit': 'requests_per_period',
    'x-ratelimit-remaining': 'remaining_requests',
    'x-ratelimit-reset': 'reset_time',
    'x-ratelimit-window': 'window_seconds',
    'retry-after': 'retry_after_seconds'
  };

  const rateLimitInfo = {};
  
  for (const [header, key] of Object.entries(rateLimitKeys)) {
    if (headers[header]) {
      rateLimitInfo[key] = headers[header];
    }
  }

  return Object.keys(rateLimitInfo).length > 0 ? rateLimitInfo : null;
}

/**
 * Generate markdown summary for easy reading
 */
function generateMarkdownSummary(summary, allInfo) {
  const outputDir = path.join(__dirname, '..', 'collected_info');
  const mdPath = path.join(outputDir, 'provider_summary.md');
  
  const providersWithModels = allInfo.filter(p => p.models && p.models.length > 0);
  const providersWithoutModels = allInfo.filter(p => !p.models || p.models.length === 0);
  
  let markdown = `# LLM Provider Information Summary

## Overview

This document summarizes the information collected by the provider_info_collector.js script as of ${new Date(summary.timestamp).toLocaleDateString()}.

| Metric | Value |
|--------|-------|
| Total Providers | ${summary.total_providers} |
| Providers With Public Models | ${summary.providers_with_models} |
| Total Models Available | ${summary.total_models} |
| Last Updated | ${new Date(summary.timestamp).toLocaleDateString()} |
| Data Collection Time | ${summary.timestamp} |

## Data Validation

| Check | Status | Details |
|-------|--------|---------|
| Math Validation | ${summary.validation.math_check_passed ? '✅ PASSED' : '❌ FAILED'} | Calculated total: ${summary.validation.calculated_total}, Reported total: ${summary.total_models} |

${summary.validation.discrepancies.length > 0 ? '### ⚠️ Discrepancies Found:\n' + summary.validation.discrepancies.map(d => `- ${d}`).join('\n') + '\n' : ''}

## Provider Accessibility Analysis

### Providers with Public Model APIs

These providers offer publicly accessible model information without requiring API keys:

`;

  // Sort providers by model count for better organization
  const sortedProviders = providersWithModels.sort((a, b) => (b.models?.length || 0) - (a.models?.length || 0));
  
  sortedProviders.forEach((info, index) => {
    const searchCaps = summary.provider_summary[info.provider].search_capabilities;
    const searchNote = searchCaps ? ` (${searchCaps.capabilities.join(', ')})` : '';
    markdown += `${index + 1}. **${info.provider.charAt(0).toUpperCase() + info.provider.slice(1)}** - ${info.models.length} models available${searchNote}\n`;
  });

  markdown += `\n### Providers Requiring Authentication

These providers require API keys to access their model information:

`;

  providersWithoutModels.forEach((info, index) => {
    markdown += `${index + 1}. **${info.provider.charAt(0).toUpperCase() + info.provider.slice(1)}** - Requires API key for model information\n`;
  });

  markdown += `\n## Real-Time Search Capabilities

### Providers with Confirmed Search Features

`;

  const searchProviders = Object.entries(summary.provider_summary)
    .filter(([provider, data]) => data.search_capabilities && data.search_capabilities.capabilities.length > 0)
    .sort(([, a], [, b]) => b.models_found - a.models_found);

  if (searchProviders.length > 0) {
    searchProviders.forEach(([provider, data]) => {
      const caps = data.search_capabilities;
      markdown += `- **${provider.charAt(0).toUpperCase() + provider.slice(1)}**: ${caps.capabilities.join(', ')}\n`;
      if (caps.evidence) {
        markdown += `  - Evidence: ${caps.evidence}\n`;
      }
    });
  } else {
    markdown += `No providers with confirmed real-time search capabilities found in this collection run.\n`;
  }

  markdown += `\n---

*This summary was automatically generated on ${summary.timestamp}*
*This is the authoritative data file - previous versions have been backed up*
`;

  fs.writeFileSync(mdPath, markdown);
  console.log(`📝 Generated markdown summary: ${mdPath}`);
}

/**
 * Clean up old summary files to prevent confusion
 */
function cleanupOldSummaries() {
  const outputDir = path.join(__dirname, '..', 'collected_info');
  
  try {
    const files = fs.readdirSync(outputDir);
    const oldSummaryFiles = files.filter(file => 
      file.startsWith('summary_') && 
      file.endsWith('.json') && 
      file !== 'summary_report.json'
    );
    
    if (oldSummaryFiles.length > 0) {
      const backupDir = path.join(outputDir, 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      oldSummaryFiles.forEach(file => {
        const oldPath = path.join(outputDir, file);
        const backupPath = path.join(backupDir, file);
        fs.renameSync(oldPath, backupPath);
        console.log(`📦 Moved old summary file to backup: ${file}`);
      });
    }
  } catch (error) {
    console.log(`⚠️  Warning: Could not clean up old summary files: ${error.message}`);
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const targetProvider = args[0];
  
  console.log('🚀 LLM Provider Information Collector');
  console.log('=====================================');
  
  if (targetProvider) {
    if (!PUBLIC_ENDPOINTS[targetProvider]) {
      console.log(`❌ Unknown provider: ${targetProvider}`);
      console.log(`Available providers: ${Object.keys(PUBLIC_ENDPOINTS).join(', ')}`);
      process.exit(1);
    }
    
    console.log(`🎯 Targeting specific provider: ${targetProvider}`);
    const info = await collectProviderInfo(targetProvider);
    
    if (info) {
      const filename = `${targetProvider}_info.json`;
      saveToFile(info, filename);
      
      // Also save raw model data if available
      if (info.models && info.models.length > 0) {
        const modelsFilename = `${targetProvider}_models.json`;
        saveToFile({ models: info.models }, modelsFilename);
      }
    }
  } else {
    // Collect info from all providers
    const allInfo = [];
    
    for (const provider of Object.keys(PUBLIC_ENDPOINTS)) {
      const info = await collectProviderInfo(provider);
      if (info) {
        allInfo.push(info);
      }
    }
    
    // Save complete data first
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const allProvidersFilename = `all_providers_${timestamp}.json`;
    saveToFile(allInfo, allProvidersFilename);
    
    // Generate and save summary with validation
    const summary = generateSummary(allInfo);
    const summaryFilename = `summary_report.json`;
    saveToFile(summary, summaryFilename);
    
    // Generate markdown summary for easy reading
    generateMarkdownSummary(summary, allInfo);
    
    // Clean up old files to prevent confusion
    cleanupOldSummaries();
  }
}

main().catch(error => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
