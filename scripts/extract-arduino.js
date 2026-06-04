const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\d4493a26-2032-4bf0-9f77-ac777c359e83\\.system_generated\\logs\\transcript.jsonl';
const outPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\d4493a26-2032-4bf0-9f77-ac777c359e83\\scratch\\arduino_code.ino';

// Ensure scratch directory exists
const scratchDir = path.dirname(outPath);
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.step_index === 413) {
      // It might be 413 or 392 or something. Let's check step_index or content.
      let content = data.content;
      if (content && content.includes('LiquidCrystal_I2C.h')) {
        content = content.replace('<USER_REQUEST>', '').replace('</USER_REQUEST>', '');
        fs.writeFileSync(outPath, content, 'utf8');
        console.log('Saved to', outPath);
        process.exit(0);
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
}

// Fallback search by string
for (const line of lines) {
  if (line.includes('LiquidCrystal_I2C.h') && line.includes('USER_INPUT')) {
    try {
      const data = JSON.parse(line);
      let content = data.content;
      if (content) {
        content = content.replace('<USER_REQUEST>', '').replace('</USER_REQUEST>', '');
        fs.writeFileSync(outPath, content, 'utf8');
        console.log('Saved fallback to', outPath);
        process.exit(0);
      }
    } catch(e) {}
  }
}

console.log('Not found!');
