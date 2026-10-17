import { config, PRODUCTS, TECHNIQUES, PLACEMENTS, STATUSES } from './config.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const productName = (id) => PRODUCTS.find((p) => p.id === id)?.name || id;
export const whatsappLink = (phone) => {
  let d = String(phone).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = config.countryCode + d.slice(1);
  return `https://wa.me/${d}`;
};

function layout({ title, body, admin = false }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  ${admin ? '<meta name="robots" content="noindex,nofollow">' : ''}
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f0f0f] text-white font-sans min-h-screen flex flex-col">
${body}
</body>
</html>`;
}

const field = 'w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400';
const label = 'block text-xs font-bold text-gray-400 mb-1.5';

function siteHeader() {
  return `<header class="flex justify-between items-center px-6 md:px-10 py-4 border-b border-gray-800 bg-[#141414]">
  <a href="/" class="text-xl font-black tracking-tight">Floc<span class="text-yellow-400">Art</span></a>
  <nav class="flex items-center gap-5 text-sm">
    <a href="/#produits" class="text-gray-400 hover:text-white hidden sm:inline">Produits</a>
    <a href="${esc(config.instagram)}" target="_blank" rel="noopener" class="text-gray-400 hover:text-white hidden sm:inline">Instagram</a>
    <a href="/devis" class="bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl hover:bg-yellow-300 transition">Demander un devis</a>
  </nav>
</header>`;
}
function siteFooter() {
  return `<footer class="mt-auto border-t border-gray-800 px-6 py-6 text-xs text-gray-500 flex justify-between flex-wrap gap-3">
  <span>© ${new Date().getFullYear()} FlocArt Création</span>
  <span><a href="${esc(config.instagram)}" target="_blank" rel="noopener" class="hover:text-white">@flocart_creation</a></span>
</footer>`;
}

export function homePage() {
  const cards = PRODUCTS.map((p) => `
    <a href="/devis?produit=${p.id}" class="group bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-yellow-400/50 transition">
      <div class="text-4xl mb-4">${p.emoji}</div>
      <h3 class="font-bold text-lg mb-1">${esc(p.name)}</h3>
      <p class="text-sm text-gray-400 mb-4">${esc(p.desc)}</p>
      <span class="text-xs font-bold text-yellow-400 group-hover:underline">Demander un devis →</span>
    </a>`).join('');
  const steps = [
    ['1', 'Décrivez votre projet', 'Choisissez le vêtement, la quantité et envoyez votre logo.'],
    ['2', 'Recevez votre devis', 'L\'atelier étudie votre demande et vous répond par WhatsApp ou e-mail.'],
    ['3', 'Production & livraison', 'Après validation, votre flocage est réalisé dans nos ateliers.'],
  ].map(([n, t, d]) => `<div class="bg-[#141414] border border-gray-800 rounded-2xl p-6"><div class="w-8 h-8 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center mb-3">${n}</div><h3 class="font-bold mb-1">${t}</h3><p class="text-sm text-gray-400">${d}</p></div>`).join('');
  return layout({
    title: 'FlocArt - Flocage & personnalisation textile',
    body: `${siteHeader()}
<main>
  <section class="max-w-6xl mx-auto px-6 py-20 text-center">
    <p class="text-yellow-400 text-xs font-bold tracking-widest mb-4">FLOCAGE &amp; PERSONNALISATION TEXTILE</p>
    <h1 class="text-4xl md:text-6xl font-black leading-tight mb-6">Votre logo, <br class="hidden md:block">sur mesure, sur textile.</h1>
    <p class="text-gray-400 max-w-xl mx-auto mb-8">T-shirts, hoodies, tenues de club ou d'entreprise : décrivez votre projet et recevez un devis détaillé de l'atelier FlocArt.</p>
    <a href="/devis" class="inline-block bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition">Demander un devis gratuit</a>
  </section>
  <section id="produits" class="max-w-6xl mx-auto px-6 pb-16">
    <h2 class="text-2xl font-black mb-6">Nos produits à personnaliser</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>
  </section>
  <section class="max-w-6xl mx-auto px-6 pb-20">
    <h2 class="text-2xl font-black mb-6">Comment ça marche</h2>
    <div class="grid md:grid-cols-3 gap-4">${steps}</div>
  </section>
</main>
${siteFooter()}`,
  });
}

export function quotePage({ values = {}, error = '' } = {}) {
  const v = (k) => esc(values[k] ?? '');
  const opts = PRODUCTS.map((p) => `<option value="${p.id}" ${values.product === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
  const techs = TECHNIQUES.map((t) => `<option ${values.technique === t ? 'selected' : ''}>${esc(t)}</option>`).join('');
  const checked = [].concat(values.placements || []);
  const places = PLACEMENTS.map((p) => `<label class="flex items-center gap-2 text-sm bg-[#141414] border border-gray-800 rounded-xl px-3 py-2.5 cursor-pointer"><input type="checkbox" name="placements" value="${esc(p)}" ${checked.includes(p) ? 'checked' : ''} class="accent-yellow-400"> ${esc(p)}</label>`).join('');
  return layout({
    title: 'Demander un devis - FlocArt',
    body: `${siteHeader()}
<main class="max-w-2xl mx-auto w-full px-6 py-12">
  <h1 class="text-3xl font-black mb-2">Demande de devis</h1>
  <p class="text-gray-400 text-sm mb-8">Plus votre description est précise, plus notre devis le sera. Réponse sous 24 h.</p>
  ${error ? `<div class="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">${esc(error)}</div>` : ''}
  <form method="post" action="/devis" enctype="multipart/form-data" class="space-y-6">
    <input type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">
    <fieldset class="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-4">
      <legend class="text-xs font-bold text-yellow-400 px-2">1. Le vêtement</legend>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="${label}" for="product">Produit *</label><select id="product" name="product" required class="${field}">${opts}</select></div>
        <div><label class="${label}" for="quantity">Quantité *</label><input id="quantity" type="number" name="quantity" min="1" max="100000" required value="${v('quantity')}" class="${field}"></div>
        <div><label class="${label}" for="garment_color">Couleur du vêtement</label><input id="garment_color" name="garment_color" maxlength="60" value="${v('garment_color')}" placeholder="Noir, blanc…" class="${field}"></div>
        <div><label class="${label}" for="sizes">Répartition des tailles</label><input id="sizes" name="sizes" maxlength="200" value="${v('sizes')}" placeholder="S:5, M:10, L:10" class="${field}"></div>
      </div>
    </fieldset>
    <fieldset class="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-4">
      <legend class="text-xs font-bold text-yellow-400 px-2">2. Le flocage</legend>
      <div><label class="${label}" for="technique">Technique</label><select id="technique" name="technique" class="${field}">${techs}</select></div>
      <div><span class="${label}">Emplacements</span><div class="grid sm:grid-cols-2 gap-2">${places}</div></div>
      <div><label class="${label}" for="flock_colors">Couleurs du flocage</label><input id="flock_colors" name="flock_colors" maxlength="200" value="${v('flock_colors')}" placeholder="Blanc, doré…" class="${field}"></div>
      <div><label class="${label}" for="logo">Votre logo (PNG, JPG, SVG ou PDF, 5 Mo max)</label><input id="logo" type="file" name="logo" accept=".png,.jpg,.jpeg,.svg,.pdf,image/png,image/jpeg,image/svg+xml,application/pdf" class="${field} file:mr-3 file:bg-gray-800 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1"></div>
      <div><label class="${label}" for="details">Précisions</label><textarea id="details" name="details" rows="4" maxlength="2000" class="${field}" placeholder="Texte à ajouter, dimensions souhaitées, inspiration…">${v('details')}</textarea></div>
      <div><label class="${label}" for="deadline">Date souhaitée de livraison</label><input id="deadline" type="date" name="deadline" value="${v('deadline')}" class="${field}"></div>
    </fieldset>
    <fieldset class="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-4">
      <legend class="text-xs font-bold text-yellow-400 px-2">3. Vos coordonnées</legend>
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="${label}" for="name">Nom complet *</label><input id="name" name="name" required maxlength="100" value="${v('name')}" class="${field}"></div>
        <div><label class="${label}" for="phone">Téléphone (WhatsApp) *</label><input id="phone" type="tel" name="phone" required maxlength="30" value="${v('phone')}" class="${field}"></div>
      </div>
      <div><label class="${label}" for="email">E-mail</label><input id="email" type="email" name="email" maxlength="150" value="${v('email')}" class="${field}"></div>
    </fieldset>
    <button class="w-full bg-yellow-400 text-black font-black py-4 rounded-xl hover:bg-yellow-300 transition">Envoyer ma demande</button>
  </form>
</main>
${siteFooter()}`,
  });
}

export function thanksPage(ref) {
  return layout({
    title: 'Demande envoyée - FlocArt',
    body: `${siteHeader()}
<main class="max-w-xl mx-auto px-6 py-24 text-center">
  <div class="text-5xl mb-6">✅</div>
  <h1 class="text-3xl font-black mb-3">Demande envoyée !</h1>
  <p class="text-gray-400 mb-2">Votre numéro de devis : <strong class="text-yellow-400">#${esc(ref)}</strong></p>
  <p class="text-gray-400 mb-8">L'atelier FlocArt vous recontactera très vite par WhatsApp ou par téléphone.</p>
  <a href="/" class="inline-block bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl text-sm font-bold">Retour à l'accueil</a>
</main>
${siteFooter()}`,
  });
}

export function notFoundPage() {
  return layout({ title: 'Page introuvable - FlocArt', body: `${siteHeader()}<main class="max-w-xl mx-auto px-6 py-24 text-center"><h1 class="text-3xl font-black mb-3">404</h1><p class="text-gray-400 mb-6">Cette page n'existe pas.</p><a href="/" class="text-yellow-400 font-bold">Retour à l'accueil</a></main>${siteFooter()}` });
}

/* ---------------- Admin ---------------- */

function adminHeader() {
  return `<header class="flex justify-between items-center px-6 md:px-8 py-4 bg-[#141414] border-b border-gray-800">
  <a href="/admin/devis" class="flex items-center space-x-3"><span class="bg-red-500 w-3 h-3 rounded-full animate-pulse"></span><span class="font-bold tracking-wide">Espace Propriétaire</span></a>
  <form method="post" action="/admin/logout"><button class="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition">Déconnexion</button></form>
</header>`;
}

export function adminLoginPage({ step = 'request', message = '', error = '' } = {}) {
  const msg = message ? `<div class="bg-green-500/10 border border-green-500/30 text-green-300 text-sm rounded-xl px-4 py-3 mb-4">${esc(message)}</div>` : '';
  const err = error ? `<div class="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">${esc(error)}</div>` : '';
  const requestForm = `<form method="post" action="/admin/request-key">
      <p class="text-sm text-gray-400 mb-4">Une clé d'accès à usage unique sera envoyée à l'e-mail du propriétaire. Elle est valable 10 minutes.</p>
      <button class="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition">Recevoir ma clé par e-mail</button>
    </form>`;
  const keyForm = `<form method="post" action="/admin/login" class="space-y-3 ${step === 'request' ? 'mt-6 pt-6 border-t border-gray-800' : ''}">
      <label class="${label}" for="key">J'ai reçu ma clé</label>
      <input id="key" name="key" required autocomplete="off" autofocus placeholder="FLOC-XXXX-XXXX-XXXX" class="${field} font-mono tracking-wider text-center">
      <button class="w-full bg-gray-800 hover:bg-gray-700 font-bold py-3 rounded-xl transition">Accéder à l'espace admin</button>
    </form>`;
  return layout({
    title: 'Admin - FlocArt',
    admin: true,
    body: `<main class="flex-1 flex items-center justify-center px-6 py-16">
  <div class="w-full max-w-sm bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
    <div class="text-center mb-6"><span class="text-2xl font-black">Floc<span class="text-yellow-400">Art</span></span><p class="text-xs text-gray-500 mt-1">Espace Propriétaire</p></div>
    ${msg}${err}
    ${step === 'key' ? keyForm : requestForm + keyForm}
  </div>
</main>`,
  });
}

const statusColors = {
  nouveau: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  en_cours: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  devis_envoye: 'bg-purple-400/10 text-purple-300 border-purple-400/20',
  accepte: 'bg-green-400/10 text-green-300 border-green-400/20',
  refuse: 'bg-red-400/10 text-red-300 border-red-400/20',
  termine: 'bg-gray-400/10 text-gray-300 border-gray-400/20',
};
const badge = (s) => `<span class="text-xs font-bold px-2.5 py-1 rounded-md border ${statusColors[s] || statusColors.termine}">${esc(STATUSES[s] || s)}</span>`;
const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: config.timeZone });

export function adminListPage(quotes, filter) {
  const counts = quotes.reduce((a, q) => ((a[q.status] = (a[q.status] || 0) + 1), a), {});
  const tabs = [['', 'Tous', quotes.length], ...Object.entries(STATUSES).map(([k, l]) => [k, l, counts[k] || 0])]
    .map(([k, l, n]) => `<a href="/admin/devis${k ? '?statut=' + k : ''}" class="text-xs px-3 py-1.5 rounded-lg border ${filter === k ? 'bg-yellow-400 text-black border-yellow-400 font-bold' : 'border-gray-800 text-gray-400 hover:text-white'}">${l} (${n})</a>`).join('');
  const shown = filter ? quotes.filter((q) => q.status === filter) : quotes;
  const rows = shown.map((q) => `
    <a href="/admin/devis/${q.id}" class="block bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition">
      <div class="flex flex-wrap items-center gap-3 mb-2">${badge(q.status)}<span class="text-xs font-bold text-gray-300">Devis #${q.id}</span><span class="text-xs text-gray-500">${fmtDate(q.created_at)}</span></div>
      <h3 class="text-lg font-bold">${esc(productName(q.product))} (x${q.quantity})</h3>
      <p class="text-sm text-gray-400">Client : <strong class="text-white">${esc(q.name)}</strong> • 📞 ${esc(q.phone)}</p>
      <p class="text-xs text-gray-500 mt-1">${esc([q.technique, q.placements].filter(Boolean).join(' • '))}</p>
    </a>`).join('');
  return layout({
    title: 'Devis - Admin FlocArt',
    admin: true,
    body: `${adminHeader()}
<main class="max-w-6xl w-full mx-auto px-6 py-10">
  <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
    <div><h1 class="text-2xl font-black">Demandes de devis</h1><p class="text-gray-400 text-sm">Triées de la plus récente à la plus ancienne.</p></div>
    <div class="bg-[#1a1a1a] border border-gray-800 px-4 py-2 rounded-xl text-sm"><span class="text-yellow-400 font-bold">${counts.nouveau || 0}</span> nouveau(x) devis</div>
  </div>
  <div class="flex flex-wrap gap-2 mb-6">${tabs}</div>
  <div class="space-y-4">${rows || '<p class="text-gray-500 text-sm py-10 text-center">Aucun devis pour le moment.</p>'}</div>
</main>`,
  });
}

export function adminDetailPage(q) {
  const row = (k, v) => (v ? `<div class="py-3 border-b border-gray-800 last:border-0"><dt class="text-xs font-bold text-gray-500 mb-0.5">${k}</dt><dd class="text-sm whitespace-pre-wrap">${esc(v)}</dd></div>` : '');
  const statusOpts = Object.entries(STATUSES).map(([k, l]) => `<option value="${k}" ${q.status === k ? 'selected' : ''}>${l}</option>`).join('');
  const isImg = /^image\//.test(q.logo_mime || '');
  const logo = q.logo_mime
    ? `<div class="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
        <h2 class="text-xs font-bold text-yellow-400 mb-3">LOGO DU CLIENT</h2>
        ${isImg ? `<div class="bg-white/5 rounded-xl p-4 mb-3 flex justify-center"><img src="/admin/logo/${q.id}" alt="Logo" class="max-h-56 object-contain"></div>` : ''}
        <a href="/admin/logo/${q.id}?download=1" class="text-xs bg-gray-800 hover:bg-gray-700 font-bold px-4 py-2.5 rounded-xl inline-block">⬇️ Télécharger ${esc(q.logo_name || 'le fichier')}</a>
      </div>`
    : '<div class="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 text-sm text-gray-500">Aucun logo envoyé.</div>';
  const msg = encodeURIComponent(`Bonjour ${q.name}, c'est FlocArt concernant votre demande de devis #${q.id} (${productName(q.product)} x${q.quantity}).`);
  return layout({
    title: `Devis #${q.id} - Admin FlocArt`,
    admin: true,
    body: `${adminHeader()}
<main class="max-w-4xl w-full mx-auto px-6 py-10">
  <a href="/admin/devis" class="text-xs text-gray-400 hover:text-white">← Retour aux devis</a>
  <div class="flex flex-wrap items-center gap-3 mt-3 mb-6">
    <h1 class="text-2xl font-black">Devis #${q.id}</h1>${badge(q.status)}<span class="text-xs text-gray-500">${fmtDate(q.created_at)}</span>
  </div>
  <div class="grid md:grid-cols-2 gap-4">
    <div class="space-y-4">
      <div class="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
        <h2 class="text-xs font-bold text-yellow-400 mb-2">COMMANDE</h2>
        <dl>${row('Produit', productName(q.product))}${row('Quantité', q.quantity)}${row('Couleur du vêtement', q.garment_color)}${row('Tailles', q.sizes)}${row('Technique', q.technique)}${row('Emplacements', q.placements)}${row('Couleurs du flocage', q.flock_colors)}${row('Précisions', q.details)}${row('Livraison souhaitée', q.deadline)}</dl>
      </div>
      <div class="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
        <h2 class="text-xs font-bold text-yellow-400 mb-2">CLIENT</h2>
        <dl>${row('Nom', q.name)}${row('Téléphone', q.phone)}${row('E-mail', q.email)}</dl>
        <div class="flex flex-wrap gap-2 mt-4">
          <a href="${whatsappLink(q.phone)}?text=${msg}" target="_blank" rel="noopener" class="bg-green-600 hover:bg-green-500 text-xs font-bold px-4 py-3 rounded-xl transition">💬 Répondre (WhatsApp)</a>
          <a href="tel:${esc(q.phone)}" class="bg-gray-800 hover:bg-gray-700 text-xs font-bold px-4 py-3 rounded-xl transition">📞 Appeler</a>
          ${q.email ? `<a href="mailto:${esc(q.email)}" class="bg-gray-800 hover:bg-gray-700 text-xs font-bold px-4 py-3 rounded-xl transition">✉️ E-mail</a>` : ''}
        </div>
      </div>
    </div>
    <div class="space-y-4">
      ${logo}
      <form method="post" action="/admin/devis/${q.id}" class="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-3">
        <h2 class="text-xs font-bold text-yellow-400">SUIVI</h2>
        <div><label class="${label}" for="status">Statut</label><select id="status" name="status" class="${field}">${statusOpts}</select></div>
        <div><label class="${label}" for="admin_note">Note interne (prix, remarques…)</label><textarea id="admin_note" name="admin_note" rows="4" maxlength="2000" class="${field}">${esc(q.admin_note)}</textarea></div>
        <button class="w-full bg-yellow-400 text-black font-black py-3 rounded-xl hover:bg-yellow-300 transition">Enregistrer</button>
      </form>
    </div>
  </div>
</main>`,
  });
}
