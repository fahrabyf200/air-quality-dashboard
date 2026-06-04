const https = require('https');

const dangerData = JSON.stringify({
  co2: 650,
  nh3: 35,
  voc: 80,
  temp: 35,
  hum: 70,
  isUnhealthy: true,
  dominant: "CO2",
  device_id: "ESP32_AGNA"
});

const options = {
  hostname: 'air-quality-dashboard-sage.vercel.app',
  path: '/api/sensor',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(dangerData)
  }
};

console.log('Mengirim data BAHAYA ke Vercel...');
const req = https.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    try {
      console.log('Response JSON:', JSON.stringify(JSON.parse(body), null, 2));
    } catch {
      console.log('Response Raw:', body);
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(dangerData);
req.end();
