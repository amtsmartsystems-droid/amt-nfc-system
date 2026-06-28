const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Card = require('./backend/models/Card');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const card = await Card.findOne({ shortCode: 'ABEER' });
  if (!card) {
      console.log("Card not found");
      process.exit(1);
  }
  
  card.cardMappings = [{ cardNumber: 1, destinationUrl: 'https://wa.me/962799999999', label: 'test' }];
  await card.save();
  
  console.log("Updated to 962799999999");
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
