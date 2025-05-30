const { llm_input_schema } = require('./llm_schema');

describe('llm_input_schema', () => {
  const validBaseInput = {
    provider: 'openai',
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello' }]
  };

  describe('Provider validation', () => {
    it('should accept valid providers', () => {
      const validProviders = [
        'openai', 'anthropic', 'google', 'gh-models', 'huggingface',
        'together', 'perplexity', 'deepseek', 'qwen', 'siliconflow',
        'grok', 'groq', 'openrouter', 'ollama'
      ];

      validProviders.forEach(provider => {
        expect(() => {
          llm_input_schema.parse({ ...validBaseInput, provider });
        }).not.toThrow();
      });
    });

    it('should reject invalid providers', () => {
      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, provider: 'invalid-provider' });
      }).toThrow();
    });
  });

  describe('Required fields validation', () => {
    it('should require provider', () => {
      const { provider, ...inputWithoutProvider } = validBaseInput;
      expect(() => {
        llm_input_schema.parse(inputWithoutProvider);
      }).toThrow();
    });

    it('should require model', () => {
      const { model, ...inputWithoutModel } = validBaseInput;
      expect(() => {
        llm_input_schema.parse(inputWithoutModel);
      }).toThrow();
    });

    it('should require messages', () => {
      const { messages, ...inputWithoutMessages } = validBaseInput;
      expect(() => {
        llm_input_schema.parse(inputWithoutMessages);
      }).toThrow();
    });
  });

  describe('Message validation', () => {
    it('should accept valid message roles', () => {
      const validRoles = ['system', 'user', 'assistant', 'tool'];
      
      validRoles.forEach(role => {
        expect(() => {
          llm_input_schema.parse({
            ...validBaseInput,
            messages: [{ role, content: 'Test message' }]
          });
        }).not.toThrow();
      });
    });

    it('should reject invalid message roles', () => {
      expect(() => {
        llm_input_schema.parse({
          ...validBaseInput,
          messages: [{ role: 'invalid-role', content: 'Test' }]
        });
      }).toThrow();
    });

    it('should require message content', () => {
      expect(() => {
        llm_input_schema.parse({
          ...validBaseInput,
          messages: [{ role: 'user' }] // Missing content
        });
      }).toThrow();
    });
  });

  describe('Parameter validation', () => {
    it('should validate maxTokens range', () => {
      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, maxTokens: 0 });
      }).toThrow();

      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, maxTokens: 100001 });
      }).toThrow();

      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, maxTokens: 1000 });
      }).not.toThrow();
    });

    it('should validate temperature range', () => {
      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, temperature: -0.1 });
      }).toThrow();

      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, temperature: 2.1 });
      }).toThrow();

      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, temperature: 0.7 });
      }).not.toThrow();
    });

    it('should validate topP range', () => {
      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, topP: -0.1 });
      }).toThrow();

      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, topP: 1.1 });
      }).toThrow();

      expect(() => {
        llm_input_schema.parse({ ...validBaseInput, topP: 0.9 });
      }).not.toThrow();
    });
  });

  describe('Optional fields', () => {
    it('should accept valid optional fields', () => {
      const inputWithOptionals = {
        ...validBaseInput,
        apiKey: 'test-key',
        maxTokens: 1000,
        temperature: 0.7,
        topP: 0.9,
        stream: true,
        stop: ['END'],
        presencePenalty: 0.5,
        frequencyPenalty: -0.5,
        seed: 42
      };

      expect(() => {
        llm_input_schema.parse(inputWithOptionals);
      }).not.toThrow();
    });

    it('should work without optional fields', () => {
      expect(() => {
        llm_input_schema.parse(validBaseInput);
      }).not.toThrow();
    });
  });

  describe('Tools validation', () => {
    it('should accept valid tools', () => {
      const inputWithTools = {
        ...validBaseInput,
        tools: [{
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get current weather',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' }
              }
            }
          }
        }]
      };

      expect(() => {
        llm_input_schema.parse(inputWithTools);
      }).not.toThrow();
    });

    it('should reject invalid tool types', () => {
      expect(() => {
        llm_input_schema.parse({
          ...validBaseInput,
          tools: [{ type: 'invalid-type' }]
        });
      }).toThrow();
    });
  });

  describe('Batch processing validation', () => {
    it('should accept valid batch configuration', () => {
      const inputWithBatch = {
        ...validBaseInput,
        batch: {
          enabled: true,
          customId: 'test-batch',
          completionWindow: '24h',
          inputFileId: 'file-123',
          metadata: { project: 'test' }
        }
      };

      expect(() => {
        llm_input_schema.parse(inputWithBatch);
      }).not.toThrow();
    });

    it('should require enabled field in batch', () => {
      expect(() => {
        llm_input_schema.parse({
          ...validBaseInput,
          batch: { customId: 'test' } // Missing enabled
        });
      }).toThrow();
    });
  });
});
