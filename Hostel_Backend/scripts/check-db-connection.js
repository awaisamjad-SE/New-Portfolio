// scripts/check-db-connection.js
// Simple DB connection tester. Run with: node scripts/check-db-connection.js

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

(async () => {
  if (!uri) {
    console.error('❌ MONGO_URI is not set in .env.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'HostelDB',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err && err.message ? err.message : err);
    // print some additional fields when available
    if (err && err.code) console.error('code:', err.code);
    if (err && err.name) console.error('name:', err.name);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
