const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Card = require('./backend/models/Card');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const card = await Card.findOne({ shortCode: 'ABEER' });
  
  // Update mapping for card 5
  let m5 = card.cardMappings.find(m => m.cardNumber === 5);
  if (m5) {
      m5.destinationUrl = 'https://wa.me/962799000020';
      await card.save();
      console.log("Updated card 5 to https://wa.me/962799000020");
  } else {
      console.log("Card 5 not found!");
  }
  
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
