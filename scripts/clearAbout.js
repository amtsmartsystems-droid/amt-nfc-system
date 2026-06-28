const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const uri = process.env.MONGO_URI;
console.log('Connecting to:', uri ? uri.substring(0, 40) + '...' : 'UNDEFINED');

mongoose.connect(uri).then(async () => {
  const result = await mongoose.connection.collection('cards').updateOne(
    { shortCode: 'ABEER' },
    { $set: { 'siteData.about': '', 'siteData.aboutAr': '' } }
  );
  console.log('Updated:', result.modifiedCount);
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
