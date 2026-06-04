// Simulasi data sensor bahaya untuk trigger WA notification
const https = require('https');

const dangerData = JSON.stringify({
  co2: 600,
  nh3: 35,
  voc: 80,
  temp: 35,
  hum: 70,
  isUnhealthy: true,
  dominant: "CO2"
  // Tanpa device_id agar masuk ke semua user
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/sensor',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(dangerData)
  }
};

console.log('Mengirim data BAHAYA ke server...');
console.log('Data:', JSON.parse(dangerData));

const req = require('http').request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('\nResponse status:', res.statusCode);
    try {
      console.log('Response:', JSON.stringify(JSON.parse(body), null, 2));
    } catch {
      console.log('Response raw:', body);
    }
    console.log('\n>>> Periksa terminal npm run dev untuk log WhatsApp!');
    console.log('>>> Periksa WhatsApp Anda dalam 10-30 detik!');
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(dangerData);
req.end();
