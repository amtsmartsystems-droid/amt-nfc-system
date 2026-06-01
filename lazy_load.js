const fs = require('fs');

const files = [
  'c:\\AM\\amt-nfc-system\\components\\templates\\GastroBarTheme.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\CafeTheme1.js',
  'c:\\AM\\amt-nfc-system\\components\\templates\\RestaurantTheme.js'
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replaceAll('<img src={item.image} alt={item.name}', '<img src={item.image} alt={item.name} loading="lazy" decoding="async"');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated', file);
}
