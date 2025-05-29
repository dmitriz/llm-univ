const fs = require('fs');

// Read the file
const filePath = './src/create_request.test.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences
content = content.replace(/llm_input_schema/g, 'LLM_INPUT_SCHEMA');

// Write back to file
fs.writeFileSync(filePath, content);

console.log('Schema references updated successfully');
