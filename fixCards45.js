const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
const Card = require('./backend/models/Card');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const card = await Card.findOne({ shortCode: 'ABEER' });
  
  // Add mapping for card 4
  let m4 = card.cardMappings.find(m => m.cardNumber === 4);
  if (m4) m4.destinationUrl = 'https://wa.me/962785600005';
  else card.cardMappings.push({ cardNumber: 4, destinationUrl: 'https://wa.me/962785600005', label: 'بطاقة رقم 4' });

  // Add mapping for card 5
  let m5 = card.cardMappings.find(m => m.cardNumber === 5);
  if (m5) m5.destinationUrl = 'https://wa.me/962785600005';
  else card.cardMappings.push({ cardNumber: 5, destinationUrl: 'https://wa.me/962785600005', label: 'بطاقة رقم 5' });
  
  await card.save();
  console.log("Fixed cards 4 and 5");
  
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
