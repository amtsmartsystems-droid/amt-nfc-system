const http = require('http');

const data = JSON.stringify({
  cardNumber: 2,
  destinationUrl: 'https://wa.me/962799999999',
  label: 'بطاقة رقم 2'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/cards/ABEER/mappings',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // Fake the auth cookie if needed, but the endpoint requires auth
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', console.error);
req.write(data);
req.end();
