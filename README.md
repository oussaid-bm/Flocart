# FlocArt

Boutique de flocage : les clients envoient des demandes de devis (avec logo), le propriétaire les gère dans un espace admin protégé par une clé à usage unique envoyée par e-mail.

## Fonctionnement
1. Un client remplit `/devis` → le devis est enregistré et le propriétaire reçoit un **e-mail de notification**.
2. Sur `/admin`, le propriétaire clique « Recevoir ma clé par e-mail » → clé `FLOC-XXXX-XXXX-XXXX` (valable 10 min, usage unique, 5 essais max).
3. Une fois connecté (session de 8 h), il consulte les devis, le logo, répond par WhatsApp et suit le statut.

## Lancer en local
```bash
npm install
cp .env.example .env     # puis renseignez OWNER_EMAIL
npm start                # http://localhost:3000
```
Sans `DATABASE_URL`, une base de test (PGlite) est créée dans `./data`. Sans `SMTP_HOST`, les e-mails s'affichent dans la console (la clé admin y apparaît).

## Déployer sur Vercel (depuis GitHub)
1. **Base de données** : créez un projet gratuit sur [neon.tech](https://neon.tech) et copiez la *connection string* (ou ajoutez l'intégration Neon depuis le Marketplace Vercel : `DATABASE_URL` est alors créée automatiquement). Les tables sont créées au premier lancement.
2. **GitHub** : poussez ce dossier dans un dépôt (privé de préférence).
3. **Vercel** : *Add New → Project* → importez le dépôt (aucun réglage de build nécessaire).
4. **Variables d'environnement** (Project → Settings → Environment Variables) :

| Variable | Valeur |
|---|---|
| `OWNER_EMAIL` | e-mail qui reçoit notifications et clés admin |
| `DATABASE_URL` | chaîne de connexion Neon |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | serveur d'envoi (ex. Gmail : `smtp.gmail.com`, port 587, mot de passe d'application) |
| `BASE_URL` | *(facultatif)* votre domaine perso ; sinon l'URL Vercel est détectée |

5. Redéployez après avoir ajouté les variables. Testez `/admin` : la clé doit arriver par e-mail.

## Limites à connaître
- Logo : PNG uniquement (signature vérifiée côté serveur), 4 Mo max (limite des requêtes Vercel), stocké en base (base64).
- Anti-spam : 5 demandes par heure et par IP + champ piège.
- Si les e-mails ne partent pas, la demande est quand même enregistrée et visible dans l'admin (mais `/admin` exige l'e-mail pour la clé).
