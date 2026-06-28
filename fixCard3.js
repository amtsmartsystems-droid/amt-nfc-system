const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Card = require('./backend/models/Card');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const card = await Card.findOne({ shortCode: 'ABEER' });
  
  // Add mapping for card 3
  const targetUrl = 'https://wa.me/962793613330';
  
  const existingMapping = card.cardMappings.find(m => m.cardNumber === 3);
  if (existingMapping) {
      existingMapping.destinationUrl = targetUrl;
  } else {
      card.cardMappings.push({
          cardNumber: 3,
          destinationUrl: targetUrl,
          label: 'بطاقة رقم 3'
      });
  }
  
  await card.save();
  console.log("Fixed card 3 to " + targetUrl);
  
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
