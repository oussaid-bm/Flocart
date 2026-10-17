import { mkdirSync } from 'node:fs';

// Postgres : Neon en production (DATABASE_URL), PGlite (fichier local) en développement.
let runner;
// Une initialisation qui échoue n'est pas gardée en cache (panne réseau passagère sur une instance déjà chaude).
const once = (create, reset) => create().catch((err) => { reset(); throw err; });

async function getRunner() {
  runner ??= once(async () => {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (url) {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(url);
      return (text, params) => sql.query(text, params);
    }
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL manquant : ajoutez la chaîne de connexion Neon dans les variables d\'environnement.');
    }
    const { PGlite } = await import('@electric-sql/pglite');
    mkdirSync('data', { recursive: true });
    const pg = new PGlite('data/pglite');
    console.log('ℹ️  DATABASE_URL absent : base locale PGlite dans ./data (développement uniquement).');
    return async (text, params) => (await pg.query(text, params)).rows;
  }, () => { runner = undefined; });
  return runner;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'nouveau',
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    garment_color TEXT,
    sizes TEXT,
    technique TEXT,
    placements TEXT,
    flock_colors TEXT,
    details TEXT,
    deadline TEXT,
    logo_name TEXT,
    logo_mime TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    admin_note TEXT,
    ip_hash TEXT
  )`,
  // Le logo est stocké à part (base64) pour ne pas alourdir la liste des devis
  `CREATE TABLE IF NOT EXISTS quote_logos (
    quote_id INTEGER PRIMARY KEY REFERENCES quotes(id) ON DELETE CASCADE,
    data_b64 TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS admin_keys (
    id SERIAL PRIMARY KEY,
    key_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    used BOOLEAN NOT NULL DEFAULT false
  )`,
  `CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL
  )`,
];

let ready;
/** Exécute une requête SQL paramétrée ($1, $2…) et retourne les lignes. */
export async function query(text, params = []) {
  const run = await getRunner();
  ready ??= once(async () => { for (const stmt of SCHEMA) await run(stmt, []); }, () => { ready = undefined; });
  await ready;
  return run(text, params);
}
