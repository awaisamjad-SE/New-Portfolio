import { sendMail } from './mail.js';
import NotificationLog from '../models/NotificationLog.js';

/**
 * notify - send email and persist a log entry
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.html]
 * @param {string} [opts.text]
 * @param {Object} [opts.meta]
 */
export async function notify({ to, subject, html, text, meta }) {
  const log = new NotificationLog({ to, subject, text, html: !!html, status: 'pending', meta });
  await log.save();
  try {
    const info = await sendMail({ to, subject, html, text });
    log.status = 'sent';
    log.response = info;
    await log.save();
    return { status: 'sent', info, logId: log._id };
  } catch (err) {
    log.status = 'error';
    log.error = err && err.message ? err.message : String(err);
    await log.save();
    return { status: 'error', error: log.error, logId: log._id };
  }
}
