const mongoose = require('mongoose');

// Need to match exactly what's in backend/config/db.js or just connect directly
const URI = 'mongodb+srv://dya1000b:G7eZpsH6t2lS5jI4@cluster0.hvpgg7i.mongodb.net/amt_nfc_db?retryWrites=true&w=majority&appName=Cluster0';

async function checkDB() {
    await mongoose.connect(URI);
    const db = mongoose.connection.db;
    
    // Check DIAMOND card
    const card = await db.collection('cards').findOne({ shortCode: 'DIAMOND' });
    
    console.log("=== siteData.links ===");
    console.log(JSON.stringify(card.siteData.links, null, 2));
    
    console.log("\n=== card.links ===");
    console.log(JSON.stringify(card.links, null, 2));
    
    mongoose.disconnect();
}

checkDB().catch(console.error);
