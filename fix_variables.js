const fs = require('fs');

// Read the file
const filePath = './src/create_request.test.js';
let content = fs.readFileSync(filePath, 'utf8');

// Fix all the variable naming issues
const replacements = [
  [/llm_input_schema/g, 'LLM_INPUT_SCHEMA'],
  [/invalidData/g, 'invalid_data'],
  [/dataWithTools/g, 'data_with_tools'],
  [/conversationData/g, 'conversation_data'],
  [/fullData/g, 'full_data'],
  [/minimalData/g, 'minimal_data'],
  [/dataWithEmptyTools/g, 'data_with_empty_tools'],
  [/dataWithStringStop/g, 'data_with_string_stop'],
  [/dataWithArrayStop/g, 'data_with_array_stop'],
  [/topP/g, 'top_p'],
  [/presencePenalty/g, 'presence_penalty'],
  [/frequencyPenalty/g, 'frequency_penalty'],
  [/responseFormat/g, 'response_format']
];

// Apply all replacements
replacements.forEach(([search, replace]) => {
  content = content.replace(search, replace);
});

// Write back to file
fs.writeFileSync(filePath, content);

console.log('All variable names fixed successfully');
