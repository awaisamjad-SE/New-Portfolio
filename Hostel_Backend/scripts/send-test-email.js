#!/usr/bin/env node
// Send a quick test email using the project's mail util.
// Usage (PowerShell):
//   $env:EMAIL_HOST='smtp.gmail.com'; $env:EMAIL_PORT='465'; $env:EMAIL_USER='you@gmail.com'; $env:EMAIL_PASS='app-password'; node .\scripts\send-test-email.js recipient@example.com
// Or set TEST_EMAIL_TO in .env and run: node .\scripts\send-test-email.js

import 'dotenv/config';
import { sendMail } from '../src/utils/mail.js';

const recipientArg = process.argv[2];
const to = process.env.TEST_EMAIL_TO || recipientArg;
const subject = process.env.TEST_EMAIL_SUBJECT || 'Hostel Backend - Test email';
const html = process.env.TEST_EMAIL_HTML || `<p>This is a test email sent from the Hostel Backend at ${new Date().toUTCString()}.</p>`;

if (!to) {
  console.error('No recipient specified. Provide a recipient as the first argument or set TEST_EMAIL_TO in .env.');
  process.exit(1);
}

(async () => {
  try {
    const info = await sendMail({ to, subject, html });
    console.log('Test email sent successfully. Mailer info:');
    console.log(info);
    process.exit(0);
  } catch (err) {
    console.error('Failed to send test email:');
    console.error(err);
    process.exit(2);
  }
})();
