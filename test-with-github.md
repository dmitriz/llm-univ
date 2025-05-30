# Testing with GitHub Models

## Setup GitHub Token

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "LLM Testing"
4. Select scopes: **No special scopes needed** for GitHub Models
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

### 2. Set Environment Variable

**Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN="your_token_here"
```

**Windows (Command Prompt):**
```cmd
set GITHUB_TOKEN=your_token_here
```

**macOS/Linux:**
```bash
export GITHUB_TOKEN="your_token_here"
```

### 3. Run Tests

**Run integration tests with GitHub token:**
```bash
npm run test:integration
```

**Run all tests:**
```bash
npm run test:all
```

**Run only GitHub Models tests:**
```bash
RUN_INTEGRATION_TESTS=true npx jest --testNamePattern="GitHub Models"
```

## What the Tests Validate

### ✅ With GitHub Token
- **Real API calls** to GitHub Models
- **Successful response validation**
- **Streaming support**
- **Multiple model testing** (gpt-4o-mini, gpt-4o)
- **Rate limit handling**
- **Error scenarios**

### ✅ Without GitHub Token
- **Request format validation**
- **Authentication error handling**
- **Graceful degradation**

## Expected Output

### With Token:
```
🔑 Using GitHub token for authenticated test
✅ GitHub Models authenticated request successful
📝 Response: Hello World...
🔄 Testing streaming with GitHub token
✅ GitHub Models streaming request successful
✅ Model gpt-4o-mini works with GitHub token
✅ Model gpt-4o works with GitHub token
```

### Without Token:
```
🔓 No GitHub token found, testing unauthenticated request
✓ GitHub Models requires authentication (request format validated)
```

## Troubleshooting

### Rate Limits
- **Free tier**: 60 requests/hour
- **With token**: 5,000 requests/hour
- Tests handle rate limits gracefully

### Common Errors
- **401 Unauthorized**: Token invalid or missing
- **429 Rate Limited**: Too many requests
- **503 Service Unavailable**: Temporary GitHub issue

### Model Availability
Some models might return 404 - this is expected and handled in tests.
