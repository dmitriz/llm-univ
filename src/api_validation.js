#!/usr/bin/env node
/**
 * API URL Validation Script
 * 
 * This script validates that our hardcoded URLs in create_request.js are correct
 * by testing them against real API endpoints where possible (without API keys).
 * 
 * This is separate from unit tests and serves as integration validation.
 * 
 * Usage: npm run validate-apis [provider]
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Import our hardcoded URLs from create_request.js
const createRequest = require('./create_request.js');

/**
 * Base URLs for each provider (domain + base path only)
 */
const BASE_URLS = {
  'openai': 'https://api.openai.com',
  'anthropic': 'https://api.anthropic.com',
  'google': 'https://generativelanguage.googleapis.com',
  'gh-models': 'https://models.github.ai',
  'huggingface': 'https://api-inference.huggingface.co',
  'together': 'https://api.together.xyz',
  'deepseek': 'https://api.deepseek.com',
  'qwen': 'https://dashscope.aliyuncs.com',
  'siliconflow': 'https://api.siliconflow.cn',
  'grok': 'https://api.x.ai',
  'openrouter': 'https://openrouter.ai',
  'groq': 'https://api.groq.com',
  'ollama': 'http://localhost:11434',
  'perplexity': 'https://api.perplexity.ai',
  'cohere': 'https://api.cohere.ai',
  'mistral': 'https://api.mistral.ai',
  'replicate': 'https://api.replicate.com'
};

/**
 * Chat completion endpoints (require API keys)
 */
const CHAT_ENDPOINTS = {
  'openai': '/v1/chat/completions',
  'anthropic': '/v1/messages',
  'gh-models': '/inference/chat/completions',
  'huggingface': '/models/{model_id}',
  'together': '/v1/chat/completions',
  'deepseek': '/chat/completions',
  'qwen': '/api/v1/services/aigc/text-generation/generation',
  'siliconflow': '/v1/chat/completions',
  'grok': '/v1/chat/completions',
  'openrouter': '/api/v1/chat/completions',
  'groq': '/openai/v1/chat/completions',
  'ollama': '/api/chat',
  'perplexity': '/chat/completions',
  'cohere': '/v1/chat',
  'mistral': '/v1/chat/completions'
};

/**
 * Model listing endpoints (some work without API keys)
 */
const MODEL_ENDPOINTS = {
  'openai': '/v1/models',
  'anthropic': '/v1/models',
  'google': '/v1beta/models',
  'gh-models': '/catalog/models',
  'huggingface': '/api/models',
  'together': '/v1/models',
  'deepseek': '/v1/models',
  'qwen': '/api/v1/models',
  'siliconflow': '/v1/models',
  'grok': '/v1/models',
  'openrouter': '/api/v1/models',
  'groq': '/openai/v1/models',
  'ollama': '/api/tags',
  'perplexity': '/models',
  'cohere': '/v1/models',
  'mistral': '/v1/models',
  'replicate': '/v1/models'
};

/**
 * Public endpoints that work without API keys
 * Key format: provider.endpoint_name
 */
const PUBLIC_ENDPOINTS = {
  'gh-models': {
    models: 'https://models.github.ai/catalog/models'
  },
  'openrouter': {
    models: 'https://openrouter.ai/api/v1/models'
  },
  'huggingface': {
    models: 'https://huggingface.co/api/models',
    search: 'https://huggingface.co/api/models?filter=text-generation&sort=downloads&direction=-1&limit=10'
  },
  'ollama': {
    models: 'http://localhost:11434/api/tags',
    version: 'http://localhost:11434/api/version',
    status: 'http://localhost:11434/api/ps'
  }
};

/**
 * Make HTTP/HTTPS request with timeout
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
        'User-Agent': 'LLM-Universal-Wrapper-Validator/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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
        const result = {
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url,
          method: options.method || 'GET'
        };
        
        // Try to parse JSON
        if (res.headers['content-type']?.includes('application/json')) {
          try {
            result.json = JSON.parse(data);
          } catch (e) {
            // Not valid JSON, keep as string
          }
        }
        
        resolve(result);
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after 10s`));
    });

    if (options.data) {
      req.write(JSON.stringify(options.data));
    }
    
    req.end();
  });
}

/**
 * Test a URL endpoint
 */
async function testEndpoint(url, testName, options = {}) {
  console.log(`  🔍 Testing ${testName}: ${url}`);
  
  try {
    const response = await makeRequest(url, options);
    
    const result = {
      url,
      testName,
      method: options.method || 'GET',
      statusCode: response.statusCode,
      success: false,
      accessible: false,
      requiresAuth: false,
      error: null,
      dataReceived: response.data.length > 0,
      contentType: response.headers['content-type']
    };

    // Analyze response
    if (response.statusCode === 200) {
      result.success = true;
      result.accessible = true;
      console.log(`    ✅ SUCCESS: ${response.statusCode}`);
      
      // If JSON response, check for models/data
      if (response.json) {
        if (Array.isArray(response.json)) {
          result.itemCount = response.json.length;
          console.log(`    📊 Found ${response.json.length} items`);
        } else if (response.json.data && Array.isArray(response.json.data)) {
          result.itemCount = response.json.data.length;
          console.log(`    📊 Found ${response.json.data.length} items in data array`);
        } else if (response.json.models && Array.isArray(response.json.models)) {
          result.itemCount = response.json.models.length;
          console.log(`    📊 Found ${response.json.models.length} models`);
        }
      }
      
    } else if (response.statusCode === 401 || response.statusCode === 403) {
      result.requiresAuth = true;
      console.log(`    🔒 REQUIRES AUTH: ${response.statusCode}`);
      
    } else if (response.statusCode >= 300 && response.statusCode < 400) {
      console.log(`    🔄 REDIRECT: ${response.statusCode}`);
      
    } else if (response.statusCode === 404) {
      console.log(`    ❌ NOT FOUND: ${response.statusCode}`);
      
    } else {
      console.log(`    ⚠️  UNEXPECTED: ${response.statusCode}`);
    }

    return result;
    
  } catch (error) {
    console.log(`    ❌ ERROR: ${error.message}`);
    return {
      url,
      testName,
      method: options.method || 'GET',
      statusCode: null,
      success: false,
      accessible: false,
      requiresAuth: false,
      error: error.message,
      dataReceived: false
    };
  }
}

/**
 * Test chat completions endpoint with minimal payload
 */
async function testChatCompletions(provider, url) {
  const minimalPayload = {
    model: 'gpt-3.5-turbo', // Most providers have some version of this
    messages: [
      { role: 'user', content: 'Hello' }
    ],
    max_tokens: 1
  };

  return await testEndpoint(url, `${provider} chat completions`, {
    method: 'POST',
    data: minimalPayload
  });
}

/**
 * Validate a single provider
 */
async function validateProvider(provider) {
  console.log(`\n🔍 Validating ${provider.toUpperCase()}...`);
  
  const baseUrl = BASE_URLS[provider];
  const chatEndpoint = CHAT_ENDPOINTS[provider];
  const inferenceUrl = baseUrl && chatEndpoint ? `${baseUrl}${chatEndpoint}` : null;
  
  const results = {
    provider,
    timestamp: new Date().toISOString(),
    base_url: baseUrl,
    chat_endpoint: chatEndpoint,
    inference_url: inferenceUrl,
    tests: []
  };

  // Test chat completion endpoint (requires API key)
  if (inferenceUrl) {
    const inferenceResult = await testChatCompletions(provider, inferenceUrl);
    results.tests.push(inferenceResult);
  }

  // Test public endpoints
  if (PUBLIC_ENDPOINTS[provider]) {
    for (const [endpointName, url] of Object.entries(PUBLIC_ENDPOINTS[provider])) {
      const result = await testEndpoint(url, `${provider} ${endpointName}`);
      results.tests.push(result);
    }
  }

  return results;
}

/**
 * Run validation for all or specific providers
 */
async function runValidation(targetProvider = null) {
  console.log('🚀 API URL Validation Tool');
  console.log('==========================');
  
  if (targetProvider) {
    console.log(`🎯 Validating specific provider: ${targetProvider}`);
    
    if (!BASE_URLS[targetProvider]) {
      console.log(`❌ Unknown provider: ${targetProvider}`);
      console.log(`Available providers: ${Object.keys(BASE_URLS).join(', ')}`);
      process.exit(1);
    }
    
    const result = await validateProvider(targetProvider);
    await saveResults([result], `${targetProvider}_validation.json`);
    
  } else {
    console.log('🌐 Validating all providers...');
    
    const allResults = [];
    
    for (const provider of Object.keys(BASE_URLS)) {
      const result = await validateProvider(provider);
      allResults.push(result);
      
      // Small delay between providers to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await saveResults(allResults, 'api_validation_report.json');
    generateSummaryReport(allResults);
  }
}

/**
 * Save validation results
 */
async function saveResults(results, filename) {
  const outputDir = path.join(__dirname, '..', 'validation_results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${filepath}`);
}

/**
 * Generate summary report
 */
function generateSummaryReport(allResults) {
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('====================');
  
  const summary = {
    total_providers: allResults.length,
    accessible_without_auth: 0,
    requires_authentication: 0,
    not_accessible: 0,
    public_endpoints_found: 0,
    provider_details: {}
  };

  for (const result of allResults) {
    const { provider, tests } = result;
    let hasPublicAccess = false;
    let requiresAuth = false;
    let publicEndpoints = 0;

    for (const test of tests) {
      const { accessible, success, requiresAuth: testRequiresAuth } = test;
      if (accessible && success) {
        hasPublicAccess = true;
        publicEndpoints++;
      } else if (testRequiresAuth) {
        requiresAuth = true;
      }
    }

    if (hasPublicAccess) {
      summary.accessible_without_auth++;
      console.log(`✅ ${provider.toUpperCase()}: ${publicEndpoints} public endpoint(s) accessible`);
    } else if (requiresAuth) {
      summary.requires_authentication++;
      console.log(`🔒 ${provider.toUpperCase()}: Requires authentication`);
    } else {
      summary.not_accessible++;
      console.log(`❌ ${provider.toUpperCase()}: Not accessible`);
    }

    summary.public_endpoints_found += publicEndpoints;
    summary.provider_details[provider] = {
      public_endpoints: publicEndpoints,
      requires_auth: requiresAuth,
      accessible: hasPublicAccess
    };
  }

  console.log(`\n📈 TOTALS:`);
  console.log(`   Public access: ${summary.accessible_without_auth}/${summary.total_providers}`);
  console.log(`   Auth required: ${summary.requires_authentication}/${summary.total_providers}`);
  console.log(`   Not accessible: ${summary.not_accessible}/${summary.total_providers}`);
  console.log(`   Total public endpoints: ${summary.public_endpoints_found}`);

  // Save summary
  const summaryPath = path.join(__dirname, '..', 'validation_results', 'validation_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n💾 Summary saved to: ${summaryPath}`);
}

// CLI execution
if (require.main === module) {
  const targetProvider = process.argv[2];
  runValidation(targetProvider).catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runValidation,
  validateProvider,
  testEndpoint,
  BASE_URLS,
  CHAT_ENDPOINTS,
  MODEL_ENDPOINTS,
  PUBLIC_ENDPOINTS
};
