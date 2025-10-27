import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../src/models/Admin.js';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb+srv://awaisamjad:JuGujylg9ToHSI8x@cluster0.zmzyi.mongodb.net/';
const dbName = process.env.DB_NAME || 'HostelDB';

async function run() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Initial Admin';
  const admin_id = process.argv[5] || 'ADM001';

  await mongoose.connect(uri, { dbName, useNewUrlParser: true, useUnifiedTopology: true });

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin already exists with email:', email);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const admin = new Admin({ admin_id, name, email, password: hashed });
  await admin.save();
  console.log('Admin created successfully:');
  console.log({ email, password });
  console.log('\nNow login to get a JWT token:');
  console.log(`curl -X POST http://localhost:${process.env.PORT || 5000}/api/admin/login -H "Content-Type: application/json" -d '{"email":"${email}","password":"${password}"}'`);

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
