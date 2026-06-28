const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const card = await mongoose.connection.collection('cards').findOne(
    { shortCode: 'ABEER' },
    { projection: { cardMappings: 1, 'links.title': 1, 'links.titleAr': 1, 'links.url': 1 } }
  );
  console.log('=== cardMappings ===');
  console.log(JSON.stringify(card.cardMappings, null, 2));
  console.log('\n=== links ===');
  console.log(JSON.stringify(card.links, null, 2));
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
