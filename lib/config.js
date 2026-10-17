export const config = {
  port: Number(process.env.PORT) || 3000,
  baseUrl: (process.env.BASE_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || 'http://localhost:3000').replace(/\/$/, ''),
  timeZone: process.env.TIME_ZONE || 'Africa/Algiers',
  maxLogoBytes: 4 * 1024 * 1024, // Vercel limite le corps des requêtes à ~4,5 Mo
  ownerEmail: process.env.OWNER_EMAIL || '',
  countryCode: process.env.COUNTRY_CODE || '213',
  instagram: process.env.INSTAGRAM_URL || 'https://www.instagram.com/flocart_creation',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'FlocArt <no-reply@localhost>',
  },
  isProd: process.env.NODE_ENV === 'production',
};

export const PRODUCTS = [
  { id: 'tshirt', name: 'T-shirt coton', emoji: '👕', desc: 'Coton 100 %, coupe classique. Idéal pour clubs, équipes et événements.' },
  { id: 'hoodie', name: 'Hoodie oversized', emoji: '🧥', desc: 'Molleton épais à capuche, coupe oversize streetwear.' },
  { id: 'sweat', name: 'Sweat col rond', emoji: '🧶', desc: 'Sweat confortable, parfait pour les grands aplats de flocage.' },
  { id: 'polo', name: 'Polo', emoji: '👔', desc: 'Polo professionnel, broderie ou flocage poitrine.' },
  { id: 'casquette', name: 'Casquette', emoji: '🧢', desc: 'Casquette ajustable, logo face avant.' },
  { id: 'tote', name: 'Tote bag', emoji: '👜', desc: 'Sac en toile personnalisable, parfait pour les événements.' },
];

export const TECHNIQUES = ['Flex', 'Flocage velours', 'Transfert numérique (couleurs)', 'Je ne sais pas, conseillez-moi'];
export const PLACEMENTS = ['Logo cœur (poitrine gauche)', 'Poitrine centrale', 'Grand dos', 'Numéro dos', 'Manche gauche', 'Manche droite'];
export const STATUSES = { nouveau: 'Nouveau', en_cours: 'En cours', devis_envoye: 'Devis envoyé', accepte: 'Accepté', refuse: 'Refusé', termine: 'Terminé' };
