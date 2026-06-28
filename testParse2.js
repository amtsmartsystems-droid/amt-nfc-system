const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\AMT\\.gemini\\antigravity\\brain\\92807002-137c-4f75-89ae-3efbf68b4141\\.system_generated\\steps\\10462\\content.md', 'utf8');

const regex = /"links":(\[[^\]]*\])/;
const match = regex.exec(content);
if (match) {
  console.log("Found links array:");
  console.log(match[1]);
} else {
  console.log("Links array not found in JSON payload");
}
