import express from 'express';
import multer from 'multer';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { config, PRODUCTS, TECHNIQUES, PLACEMENTS, STATUSES } from './lib/config.js';
import { query } from './lib/db.js';
import { sendMail } from './lib/mail.js';
import { issueKey, redeemKey, setSession, clearSession, requireAdmin, isAdmin } from './lib/auth.js';
import * as views from './lib/views.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true); // derrière le proxy Vercel : req.ip = vraie IP du visiteur
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

/* ---------- Upload du logo (en mémoire, stocké en base) ---------- */
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxLogoBytes, files: 1, fields: 20 },
  fileFilter: (req, file, cb) => cb(null, extname(file.originalname).toLowerCase() in MIME),
});

/** Vérifie que le contenu correspond à l'extension (et pas seulement le nom). */
function looksValid(buf, ext) {
  const head = buf.subarray(0, 512);
  if (ext === '.png') return head.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (ext === '.jpg' || ext === '.jpeg') return head[0] === 0xff && head[1] === 0xd8;
  if (ext === '.pdf') return head.subarray(0, 4).toString() === '%PDF';
  if (ext === '.svg') return /<svg|<\?xml/.test(head.toString('utf8'));
  return false;
}

/* ---------- Pages clients ---------- */
app.get('/', (req, res) => res.send(views.homePage()));
app.get('/devis', (req, res) => {
  const product = PRODUCTS.some((p) => p.id === req.query.produit) ? req.query.produit : undefined;
  res.send(views.quotePage({ values: { product } }));
});

const clean = (v, max) => String(v ?? '').trim().slice(0, max);

app.post('/devis', (req, res, next) => {
  upload.single('logo')(req, res, async (uploadErr) => {
    try {
      const b = req.body || {};
      const fail = (error) => res.status(400).send(views.quotePage({ values: { ...b, placements: [].concat(b.placements || []) }, error }));
      if (uploadErr) return fail(uploadErr.code === 'LIMIT_FILE_SIZE' ? 'Le logo dépasse 4 Mo.' : 'Envoi du fichier impossible.');
      if (b.website) return res.send(views.thanksPage('0')); // honeypot : on fait semblant que c'est passé

      const ipHash = createHash('sha256').update(String(req.ip)).digest('hex');
      const [{ n }] = await query(`SELECT count(*)::int AS n FROM quotes WHERE ip_hash = $1 AND created_at > now() - interval '1 hour'`, [ipHash]);
      if (n >= 5) return fail('Trop de demandes. Réessayez dans une heure.');

      const quantity = Number.parseInt(b.quantity, 10);
      const phone = clean(b.phone, 30);
      const email = clean(b.email, 150);
      if (!PRODUCTS.some((p) => p.id === b.product)) return fail('Produit invalide.');
      if (!(quantity >= 1 && quantity <= 100000)) return fail('Quantité invalide.');
      if (!clean(b.name, 100)) return fail('Veuillez indiquer votre nom.');
      if (!/^[+\d][\d\s().-]{6,}$/.test(phone)) return fail('Numéro de téléphone invalide.');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Adresse e-mail invalide.');
      const ext = req.file ? extname(req.file.originalname).toLowerCase() : '';
      if (req.file && !looksValid(req.file.buffer, ext)) return fail('Le fichier du logo n\'est pas une image/PDF valide.');

      const placements = [].concat(b.placements || []).filter((p) => PLACEMENTS.includes(p)).join(', ');
      const technique = TECHNIQUES.includes(b.technique) ? b.technique : '';
      const deadline = /^\d{4}-\d{2}-\d{2}$/.test(b.deadline || '') ? b.deadline : '';

      const [{ id }] = await query(
        `INSERT INTO quotes (product, quantity, garment_color, sizes, technique, placements, flock_colors, details, deadline, logo_name, logo_mime, name, phone, email, ip_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
        [b.product, quantity, clean(b.garment_color, 60), clean(b.sizes, 200), technique, placements,
          clean(b.flock_colors, 200), clean(b.details, 2000), deadline,
          req.file ? clean(req.file.originalname, 120) : null, req.file ? MIME[ext] : null,
          clean(b.name, 100), phone, email, ipHash],
      );
      if (req.file) await query('INSERT INTO quote_logos (quote_id, data_b64) VALUES ($1, $2)', [id, req.file.buffer.toString('base64')]);

      // Sur Vercel la fonction est gelée dès la réponse envoyée : on attend l'e-mail avant de répondre.
      await notifyOwner(id);
      res.redirect(303, `/merci?ref=${id}`);
    } catch (err) {
      next(err);
    }
  });
});

app.get('/merci', (req, res) => res.send(views.thanksPage(String(req.query.ref || '').replace(/\D/g, ''))));

async function notifyOwner(id) {
  const [q] = await query('SELECT * FROM quotes WHERE id = $1', [id]);
  const product = PRODUCTS.find((p) => p.id === q.product)?.name || q.product;
  const lines = [
    `Nouvelle demande de devis #${q.id}`,
    '',
    `Produit : ${product} (x${q.quantity})`,
    `Client : ${q.name} - ${q.phone}${q.email ? ' - ' + q.email : ''}`,
    q.placements ? `Emplacements : ${q.placements}` : false,
    q.technique ? `Technique : ${q.technique}` : false,
    q.logo_mime ? 'Logo : joint (visible dans l\'espace admin)' : 'Logo : non fourni',
    '',
    `Voir le devis complet : ${config.baseUrl}/admin/devis/${q.id}`,
    `(L'accès à l'espace admin nécessite une clé envoyée par e-mail : ${config.baseUrl}/admin)`,
  ].filter((l) => l !== false);
  await sendMail({ to: config.ownerEmail, subject: `🆕 Devis #${q.id} - ${product} x${q.quantity} - ${q.name}`.replace(/[\r\n]+/g, ' '), text: lines.join('\n') });
}

/* ---------- Espace admin ---------- */
app.use('/admin', (req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

app.get('/admin', async (req, res) => (await isAdmin(req) ? res.redirect('/admin/devis') : res.send(views.adminLoginPage())));

app.post('/admin/request-key', async (req, res) => {
  if (!config.ownerEmail) return res.status(500).send(views.adminLoginPage({ error: 'OWNER_EMAIL n\'est pas configuré sur le serveur.' }));
  const key = await issueKey();
  if (!key) return res.status(429).send(views.adminLoginPage({ step: 'key', error: 'Une clé vient d\'être envoyée. Patientez 1 minute avant d\'en redemander une.' }));
  const sent = await sendMail({
    to: config.ownerEmail,
    subject: 'Votre clé d\'accès FlocArt Admin',
    text: `Votre clé d'accès à l'espace admin FlocArt :\n\n    ${key}\n\nElle est valable 10 minutes et utilisable une seule fois.\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
  });
  if (!sent) return res.status(502).send(views.adminLoginPage({ error: 'L\'e-mail n\'a pas pu être envoyé. Vérifiez la configuration SMTP.' }));
  res.send(views.adminLoginPage({ step: 'key', message: 'Clé envoyée à l\'e-mail du propriétaire. Saisissez-la ci-dessous.' }));
});

app.post('/admin/login', async (req, res) => {
  const token = await redeemKey(req.body?.key);
  if (!token) return res.status(401).send(views.adminLoginPage({ step: 'key', error: 'Clé invalide ou expirée. Demandez-en une nouvelle.' }));
  setSession(res, token);
  res.redirect(303, '/admin/devis');
});

app.post('/admin/logout', async (req, res) => { await clearSession(req, res); res.redirect(303, '/admin'); });

app.get('/admin/devis', requireAdmin, async (req, res) => {
  const quotes = await query('SELECT * FROM quotes ORDER BY id DESC');
  const filter = Object.hasOwn(STATUSES, req.query.statut) ? req.query.statut : '';
  res.send(views.adminListPage(quotes, filter));
});

const getQuote = async (id) => (Number.isInteger(Number(id)) ? (await query('SELECT * FROM quotes WHERE id = $1', [Number(id)]))[0] : undefined);

app.get('/admin/devis/:id', requireAdmin, async (req, res) => {
  const q = await getQuote(req.params.id);
  q ? res.send(views.adminDetailPage(q)) : res.status(404).send(views.notFoundPage());
});

app.post('/admin/devis/:id', requireAdmin, async (req, res) => {
  const q = await getQuote(req.params.id);
  if (!q) return res.status(404).send(views.notFoundPage());
  const status = Object.hasOwn(STATUSES, req.body.status) ? req.body.status : q.status;
  await query('UPDATE quotes SET status = $1, admin_note = $2 WHERE id = $3', [status, clean(req.body.admin_note, 2000), q.id]);
  res.redirect(303, `/admin/devis/${q.id}`);
});

app.get('/admin/logo/:id', requireAdmin, async (req, res) => {
  const q = await getQuote(req.params.id);
  const [logo] = q?.logo_mime ? await query('SELECT data_b64 FROM quote_logos WHERE quote_id = $1', [q.id]) : [];
  if (!logo) return res.status(404).send(views.notFoundPage());
  res.setHeader('Content-Type', q.logo_mime);
  // sandbox : un SVG ouvert directement ne peut exécuter aucun script
  res.setHeader('Content-Security-Policy', 'sandbox; default-src \'none\'; style-src \'unsafe-inline\'');
  if (req.query.download) res.attachment(q.logo_name || `logo-${q.id}`);
  res.send(Buffer.from(logo.data_b64, 'base64'));
});

app.use((req, res) => res.status(404).send(views.notFoundPage()));
app.use((err, req, res, next) => { console.error(err); res.status(500).send('Erreur serveur'); });

export default app;
