const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\AMT\\.gemini\\antigravity\\brain\\92807002-137c-4f75-89ae-3efbf68b4141\\.system_generated\\steps\\10462\\content.md', 'utf8');

const regex = /"title":"(?:WhatsApp|واتساب)","titleAr":"(?:WhatsApp|واتساب)","url":"([^"]+)"/g;
let match;
console.log("=== Found WhatsApp links in HTML payload ===");
while ((match = regex.exec(content)) !== null) {
  console.log(match[1]);
}
