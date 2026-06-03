const mongoose = require('mongoose');

async function checkCard() {
  const uri = 'mongodb://AMTNFC:AMT12345@ac-b5pum75-shard-00-00.hvpgg7i.mongodb.net:27017,ac-b5pum75-shard-00-01.hvpgg7i.mongodb.net:27017,ac-b5pum75-shard-00-02.hvpgg7i.mongodb.net:27017/amt_nfc_db?ssl=true&authSource=admin&retryWrites=true&w=majority';
  
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    
    // Define minimal schema just to read
    const cardSchema = new mongoose.Schema({}, { strict: false });
    const Card = mongoose.models.Card || mongoose.model('Card', cardSchema);
    
    const card = await Card.findOne({ shortCode: '368781' }).lean();
    console.log('--- CARD DATA FROM MONGODB ---');
    console.log('themeName:', card.themeName);
    console.log('businessName:', card.businessName);
    
    await mongoose.disconnect();
  } catch (e) {
    console.log('Error:', e.message);
  }
}

checkCard();
