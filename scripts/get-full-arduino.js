const fs = require('fs');

const logPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\d4493a26-2032-4bf0-9f77-ac777c359e83\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && data.content && data.content.includes('LiquidCrystal_I2C.h')) {
      console.log('--- ARDUINO CODE START ---');
      console.log(data.content);
      console.log('--- ARDUINO CODE END ---');
      process.exit(0);
    }
  } catch (e) {}
}
console.log('Not found');
