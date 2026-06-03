const mongoose = require('mongoose');

async function testConnection() {
  // Let's try specifying all 3 nodes without SRV, and without directConnection
  const baseNodes = 'ac-b5pum75-shard-00-00.hvpgg7i.mongodb.net:27017,ac-b5pum75-shard-00-01.hvpgg7i.mongodb.net:27017,ac-b5pum75-shard-00-02.hvpgg7i.mongodb.net:27017';
  const uri = `mongodb://AMTNFC:AMT12345@${baseNodes}/amt_nfc_db?ssl=true&authSource=admin&retryWrites=true&w=majority`;
  
  try {
    console.log('Testing 3 nodes...');
    // We can also try discovering replicaSet automatically or explicitly setting it to 'atlas-b5pum75-shard-0'
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, replicaSet: 'atlas-b5pum75-shard-0' });
    console.log('SUCCESS for 3 nodes');
    
    // Test write
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.models.Test || mongoose.model('Test', testSchema);
    await TestModel.create({ test: 'write_test' });
    console.log('WRITE SUCCESS');
    
    await mongoose.disconnect();
    return uri;
  } catch (e) {
    console.log('FAILED replicaSet atlas-b5pum75-shard-0:', e.message);
  }

  try {
    console.log('Testing 3 nodes without explicit replicaSet param...');
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('SUCCESS for 3 nodes NO REPLICASET');
    
    // Test write
    const testSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.models.Test || mongoose.model('Test', testSchema);
    await TestModel.create({ test: 'write_test' });
    console.log('WRITE SUCCESS');
    
    await mongoose.disconnect();
    return uri;
  } catch (e) {
    console.log('FAILED NO REPLICASET:', e.message);
  }
}

testConnection();
