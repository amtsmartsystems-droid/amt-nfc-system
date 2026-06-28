const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Card = require('./backend/models/Card');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const card = await Card.findOne({ shortCode: 'ABEER' });
  
  // Find card 2 and update it
  const mapping = card.cardMappings.find(m => m.cardNumber === 2);
  if (mapping) {
      mapping.destinationUrl = 'https://wa.me/962799000055';
      await card.save();
      console.log("Fixed card 2 to https://wa.me/962799000055");
  } else {
      console.log("Card 2 not found");
  }
  
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
