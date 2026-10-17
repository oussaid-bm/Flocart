import nodemailer from 'nodemailer';
import { config } from './config.js';

const transport = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    })
  : null;

export async function sendMail({ to, subject, text }) {
  if (!to) {
    console.warn('[mail] OWNER_EMAIL non défini, e-mail ignoré :', subject);
    return false;
  }
  if (!transport) {
    console.log(`\n[mail:console] À: ${to}\nObjet: ${subject}\n${text}\n`);
    return true;
  }
  try {
    await transport.sendMail({ from: config.smtp.from, to, subject, text });
    return true;
  } catch (err) {
    console.error('[mail] échec d\'envoi :', err.message);
    return false;
  }
}
