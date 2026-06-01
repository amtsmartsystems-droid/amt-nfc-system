const mongoose = require('mongoose');
const mongoUri = 'mongodb://AMTNFC:AMT12345@ac-b5pum75-shard-00-00.hvpgg7i.mongodb.net:27017,ac-b5pum75-shard-00-01.hvpgg7i.mongodb.net:27017,ac-b5pum75-shard-00-02.hvpgg7i.mongodb.net:27017/amt_nfc_db?ssl=true&replicaSet=atlas-7lsy0t-shard-0&authSource=admin&appName=AMT';

const images = {
  "Croissant Sandwich": "https://images.unsplash.com/photo-1549903072-7e6e0d65ee8f?w=400&q=80",
  "Eggs Benedict": "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80",
  "Herb Omelette": "https://images.unsplash.com/photo-1510693042738-eb4dbb02b546?w=400&q=80",
  "Granola": "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&q=80",
  "Club Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80",
  "Falafel Burger": "https://images.unsplash.com/photo-1593504049359-74330189a345?w=400&q=80",
  "Pancakes": "https://images.unsplash.com/photo-1528207776546-384111589133?w=400&q=80",
  "My.Recipe Breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80",
  "Quattro For Maggi": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
  "Grilled vegetables with basil sauce": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  "Margarita": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
  "Seafood pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  "Farm-fresh oregano": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80",
  "Assorted Arabic Cheeses": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80",
  "Mohammara": "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=400&q=80",
  "Pepperoni with Kashkaoan cheese": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80",
  "Duqqa with Sumac fresh olive oil": "https://images.unsplash.com/photo-1474600056930-615c3d706456?w=400&q=80"
};

async function run() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const card = await db.collection('cards').findOne({ shortCode: 'hanayen' });
  if (card && card.menuCategories) {
    let count = 0;
    for (let cat of card.menuCategories) {
      if (cat.items) {
        for (let item of cat.items) {
          if (images[item.name]) {
            item.image = images[item.name];
            count++;
          }
        }
      }
    }
    await db.collection('cards').updateOne({ shortCode: 'hanayen' }, { $set: { menuCategories: card.menuCategories } });
    console.log('Updated ' + count + ' images in DB.');
  }
  process.exit(0);
}
run();
