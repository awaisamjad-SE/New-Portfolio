import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.EMAIL_PORT || '465', 10);
const user = process.env.EMAIL_USER || process.env.EMAIL_FROM || '';
const pass = process.env.EMAIL_PASS || process.env.APP_PASSWORD || '';

if (!user || !pass) {
  // Do not throw here — allow app to start but warn in logs
  console.warn('⚠️  Email credentials not set. Set EMAIL_USER and EMAIL_PASS (or APP_PASSWORD) in .env to enable outbound emails.');
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for other ports
  auth: user && pass ? { user, pass } : undefined
});

export async function sendMail({ to, subject, html, text, from }) {
  try {
    const mailOptions = {
      from: from || process.env.EMAIL_FROM || user,
      to,
      subject,
      text: text || undefined,
      html
    };
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (err) {
    console.error('Failed to send email', err);
    throw err;
  }
}
