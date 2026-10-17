import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { query } from './db.js';
import { config } from './config.js';

const MAX_ATTEMPTS = 5;
const SESSION_HOURS = 8;

const hash = (s) => createHash('sha256').update(s).digest('hex');
// Alphabet sans caractères ambigus (0/O, 1/I)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
const normalize = (k) => String(k || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Crée une clé à usage unique valable 10 min. Retourne null si une clé vient d'être émise (< 1 min). */
export async function issueKey() {
  const recent = await query(`SELECT 1 FROM admin_keys WHERE created_at > now() - interval '60 seconds' LIMIT 1`);
  if (recent.length) return null;
  await query('UPDATE admin_keys SET used = true WHERE used = false');
  const key = `FLOC-${block()}-${block()}-${block()}`;
  await query(`INSERT INTO admin_keys (key_hash, expires_at) VALUES ($1, now() + interval '10 minutes')`, [hash(normalize(key))]);
  return key;
}

/** Vérifie la clé saisie ; retourne un jeton de session ou null. */
export async function redeemKey(input) {
  const [row] = await query('SELECT * FROM admin_keys WHERE used = false AND expires_at > now() ORDER BY id DESC LIMIT 1');
  if (!row) return null;
  if (row.attempts >= MAX_ATTEMPTS) {
    await query('UPDATE admin_keys SET used = true WHERE id = $1', [row.id]);
    return null;
  }
  const a = Buffer.from(hash(normalize(input)));
  const b = Buffer.from(row.key_hash);
  if (!timingSafeEqual(a, b)) {
    await query('UPDATE admin_keys SET attempts = attempts + 1 WHERE id = $1', [row.id]);
    return null;
  }
  // Marque la clé comme utilisée seulement si personne ne l'a utilisée entre-temps
  const claimed = await query('UPDATE admin_keys SET used = true WHERE id = $1 AND used = false RETURNING id', [row.id]);
  if (!claimed.length) return null;
  const token = randomBytes(32).toString('hex');
  await query('DELETE FROM admin_sessions WHERE expires_at < now()');
  await query(`INSERT INTO admin_sessions (token_hash, expires_at) VALUES ($1, now() + make_interval(hours => $2))`, [hash(token), SESSION_HOURS]);
  return token;
}

function readCookie(req, name) {
  const m = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
const cookieFlags = `HttpOnly; SameSite=Strict; Path=/${config.isProd ? '; Secure' : ''}`;

export const setSession = (res, token) =>
  res.setHeader('Set-Cookie', `fa_admin=${token}; ${cookieFlags}; Max-Age=${SESSION_HOURS * 3600}`);

export async function clearSession(req, res) {
  const token = readCookie(req, 'fa_admin');
  if (token) await query('DELETE FROM admin_sessions WHERE token_hash = $1', [hash(token)]);
  res.setHeader('Set-Cookie', `fa_admin=; ${cookieFlags}; Max-Age=0`);
}

export async function isAdmin(req) {
  const token = readCookie(req, 'fa_admin');
  if (!token) return false;
  const rows = await query('SELECT 1 FROM admin_sessions WHERE token_hash = $1 AND expires_at > now()', [hash(token)]);
  return rows.length > 0;
}

export async function requireAdmin(req, res, next) {
  if (await isAdmin(req)) return next();
  res.redirect('/admin');
}
