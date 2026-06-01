const https = require('https');

https.get('https://amt-nfc-system.vercel.app/api/cards/hanayen', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('isMenuEnabled:', json.isMenuEnabled);
    console.log('menuMode:', json.menuMode);
    console.log('menuCategories:', json.menuCategories ? json.menuCategories.length : 0);
  });
}).on('error', (err) => {
  console.error(err);
});
