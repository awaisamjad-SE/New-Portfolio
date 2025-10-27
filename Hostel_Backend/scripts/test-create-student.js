#!/usr/bin/env node
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// Usage:
// node scripts/test-create-student.js <JWT_TOKEN> [student_id] [name] [email] [password] [department]

const argv = process.argv.slice(2);
const token = argv[0] || process.env.TEST_JWT || '';
const student_id = argv[1] || 'STU_TEST1';
const name = argv[2] || 'Test Student';
const email = argv[3] || 'teststudent@example.com';
const password = argv[4] || 'testpass123';
const department = argv[5] || 'CSE';

if(!token) {
  console.error('Provide a JWT token as the first argument or set TEST_JWT in .env');
  process.exit(1);
}

const payload = {
  student_id,
  name,
  email,
  password,
  department
};

const API = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;

(async () => {
  try {
    const res = await fetch(`${API}/students/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = text; }

    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Request failed', err);
  }
})();
