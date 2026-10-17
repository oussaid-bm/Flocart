// Démarrage local : `npm start`. Sur Vercel, c'est api/index.js qui est utilisé.
import app from './app.js';
import { config } from './lib/config.js';

app.listen(config.port, () => {
  console.log(`FlocArt sur ${config.baseUrl}  (admin: ${config.baseUrl}/admin)`);
  if (!config.ownerEmail) console.warn('⚠️  OWNER_EMAIL non défini : copiez .env.example vers .env et renseignez-le.');
  if (!config.smtp.host) console.warn('ℹ️  SMTP non configuré : les e-mails s\'affichent dans cette console.');
});
