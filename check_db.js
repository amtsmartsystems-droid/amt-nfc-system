const mongoose = require('mongoose');

const mongoUri = 'mongodb://AMTNFC:AMT12345@ac-b5pum75-shard-00-00.hvpgg7i.mongodb.net:27017,ac-b5pum75-shard-00-01.hvpgg7i.mongodb.net:27017,ac-b5pum75-shard-00-02.hvpgg7i.mongodb.net:27017/amt_nfc_db?ssl=true&replicaSet=atlas-7lsy0t-shard-0&authSource=admin&appName=AMT';

async function check() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const card = await db.collection('cards').findOne({ shortCode: 'hanayen' });
  console.log('isMenuEnabled:', card.isMenuEnabled);
  console.log('menuMode:', card.menuMode);
  console.log('pdfMenuUrl:', card.pdfMenuUrl);
  console.log('menuCategories length:', card.menuCategories ? card.menuCategories.length : 0);
  console.log('links:', JSON.stringify(card.links));
  process.exit(0);
}

check().catch(console.error);
