import { WILAYAS } from './algeria.js';
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

/*
 * Palette : bleu nuit 60 % (fonds) · sable 30 % (cartes, formulaires, sections claires) · bronze 10 % (accents).
 * "bronze-deep" est une version foncée du bronze, utilisée seulement pour du texte sur fond sable (lisibilité).
 */
const TAILWIND_CONFIG = `tailwind.config = { theme: { extend: { colors: {
  navy: { DEFAULT: '#0A192F', card: '#1A2238' },
  sand: { DEFAULT: '#EAE3D2', light: '#F5F0EB' },
  bronze: { DEFAULT: '#C89D7C', deep: '#7A5334' },
} } } }`;

function layout({ title, body, admin = false }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0A192F">
  <title>${esc(title)}</title>
  ${admin ? '<meta name="robots" content="noindex,nofollow">' : ''}
  <script src="https://cdn.tailwindcss.com"></script>
  <script>${TAILWIND_CONFIG}</script>
</head>
<body class="bg-navy text-sand-light font-sans min-h-screen flex flex-col antialiased">
${body}
</body>
</html>`;
}

// Styles partagés
const card = 'bg-sand-light text-navy rounded-2xl p-6 shadow-sm';
const field = 'w-full bg-white border border-navy/20 rounded-xl px-4 py-3 text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:border-bronze focus:ring-1 focus:ring-bronze';
const label = 'block text-xs font-bold text-navy/70 mb-1.5';
const btnPrimary = 'bg-bronze text-navy font-bold hover:brightness-110 transition';
const btnDark = 'bg-navy text-sand-light font-bold hover:bg-navy-card transition';
const alertErr = 'bg-red-50 border border-red-300 text-red-800 text-sm rounded-xl px-4 py-3 mb-6';
const alertOk = 'bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm rounded-xl px-4 py-3 mb-6';

function siteHeader() {
  return `<header class="flex justify-between items-center px-6 md:px-10 py-4 border-b border-sand/10 bg-navy">
  <a href="/" class="text-xl font-black tracking-tight text-sand-light">Floc<span class="text-bronze">Art</span></a>
  <nav class="flex items-center gap-5 text-sm">
    <a href="/#produits" class="text-sand/70 hover:text-sand-light hidden sm:inline">Produits</a>
    <a href="${esc(config.instagram)}" target="_blank" rel="noopener" class="text-sand/70 hover:text-sand-light hidden sm:inline">Instagram</a>
    <a href="/devis" class="${btnPrimary} px-4 py-2 rounded-xl">Demander un devis</a>
  </nav>
</header>`;
}
function siteFooter() {
  return `<footer class="mt-auto border-t border-sand/10 px-6 py-6 text-xs text-sand/60 flex justify-between flex-wrap gap-3">
  <span>© ${new Date().getFullYear()} FlocArt Création</span>
  <span><a href="${esc(config.instagram)}" target="_blank" rel="noopener" class="hover:text-sand-light">@flocart_creation</a></span>
</footer>`;
}

export function homePage() {
  const cards = PRODUCTS.map((p) => `
    <a href="/devis?produit=${p.id}" class="group bg-sand border border-navy/10 rounded-2xl p-6 hover:border-bronze hover:shadow-md transition">
      <div class="text-4xl mb-4">${p.emoji}</div>
      <h3 class="font-bold text-lg mb-1 text-navy">${esc(p.name)}</h3>
      <p class="text-sm text-navy/70 mb-4">${esc(p.desc)}</p>
      <span class="text-xs font-bold text-bronze-deep group-hover:underline">Demander un devis →</span>
    </a>`).join('');
  const steps = [
    ['1', 'Décrivez votre projet', 'Choisissez le vêtement, la quantité et envoyez votre logo.'],
    ['2', 'Recevez votre devis', 'L\'atelier étudie votre demande et vous répond par WhatsApp ou e-mail.'],
    ['3', 'Production & livraison', 'Après validation, votre flocage est réalisé dans nos ateliers.'],
  ].map(([n, t, d]) => `<div class="bg-navy-card border border-sand/10 rounded-2xl p-6"><div class="w-8 h-8 rounded-full bg-bronze text-navy font-black flex items-center justify-center mb-3">${n}</div><h3 class="font-bold mb-1 text-sand-light">${t}</h3><p class="text-sm text-sand/70">${d}</p></div>`).join('');
  return layout({
    title: 'FlocArt - Flocage & personnalisation textile',
    body: `${siteHeader()}
<main>
  <section class="max-w-6xl mx-auto px-6 py-20 text-center">
    <p class="text-bronze text-xs font-bold tracking-widest mb-4">FLOCAGE &amp; PERSONNALISATION TEXTILE</p>
    <h1 class="text-4xl md:text-6xl font-black leading-tight mb-6 text-sand-light">Votre logo, <br class="hidden md:block">sur mesure, sur textile.</h1>
    <p class="text-sand/70 max-w-xl mx-auto mb-8">T-shirts, hoodies, tenues de club ou d'entreprise : décrivez votre projet et recevez un devis détaillé de l'atelier FlocArt.</p>
    <a href="/devis" class="inline-block ${btnPrimary} px-8 py-4 rounded-xl">Demander un devis gratuit</a>
  </section>
  <section id="produits" class="bg-sand-light text-navy">
    <div class="max-w-6xl mx-auto px-6 py-16">
      <h2 class="text-2xl font-black mb-6">Nos produits à personnaliser</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>
    </div>
  </section>
  <section class="max-w-6xl mx-auto px-6 py-16">
    <h2 class="text-2xl font-black mb-6 text-sand-light">Comment ça marche</h2>
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
  const places = PLACEMENTS.map((p) => `<label class="flex items-center gap-2 text-sm text-navy bg-white border border-navy/15 rounded-xl px-3 py-2.5 cursor-pointer hover:border-bronze"><input type="checkbox" name="placements" value="${esc(p)}" ${checked.includes(p) ? 'checked' : ''} class="accent-[#C89D7C]"> ${esc(p)}</label>`).join('');
  const wilayaOpts = WILAYAS.map((w) => `<option value="${w.code}" ${values.wilaya === w.code ? 'selected' : ''}>${w.code} - ${esc(w.name)}</option>`).join('');
  const communesJson = JSON.stringify(Object.fromEntries(WILAYAS.map((w) => [w.code, w.communes]))).replace(/</g, '\\u003c');
  const section = (title, inner) => `<section class="${card} space-y-4"><h2 class="text-xs font-black tracking-wider text-bronze-deep uppercase">${title}</h2>${inner}</section>`;
  return layout({
    title: 'Demander un devis - FlocArt',
    body: `${siteHeader()}
<main class="max-w-2xl mx-auto w-full px-6 py-12">
  <h1 class="text-3xl font-black mb-2 text-sand-light">Demande de devis</h1>
  <p class="text-sand/70 text-sm mb-8">Plus votre description est précise, plus notre devis le sera. Réponse sous 24 h.</p>
  ${error ? `<div class="${alertErr}" role="alert">${esc(error)}</div>` : ''}
  <form method="post" action="/devis" enctype="multipart/form-data" class="space-y-6">
    <input type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">
    ${section('1. Le vêtement', `
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="${label}" for="product">Produit *</label><select id="product" name="product" required class="${field}">${opts}</select></div>
        <div><label class="${label}" for="quantity">Quantité *</label><input id="quantity" type="number" name="quantity" min="1" max="100000" required value="${v('quantity')}" class="${field}"></div>
        <div><label class="${label}" for="garment_color">Couleur du vêtement</label><input id="garment_color" name="garment_color" maxlength="60" value="${v('garment_color')}" placeholder="Noir, blanc…" class="${field}"></div>
        <div><label class="${label}" for="sizes">Répartition des tailles</label><input id="sizes" name="sizes" maxlength="200" value="${v('sizes')}" placeholder="S:5, M:10, L:10" class="${field}"></div>
      </div>`)}
    ${section('2. Le flocage', `
      <div><label class="${label}" for="technique">Technique</label><select id="technique" name="technique" class="${field}">${techs}</select></div>
      <div><span class="${label}">Emplacements</span><div class="grid sm:grid-cols-2 gap-2">${places}</div></div>
      <div><label class="${label}" for="flock_colors">Couleurs du flocage</label><input id="flock_colors" name="flock_colors" maxlength="200" value="${v('flock_colors')}" placeholder="Blanc, doré…" class="${field}"></div>
      <div>
        <label class="${label}" for="logo">Votre logo (format PNG uniquement, 4 Mo max)</label>
        <input id="logo" type="file" name="logo" accept=".png,image/png" class="${field} file:mr-3 file:bg-navy file:text-sand-light file:border-0 file:rounded-lg file:px-3 file:py-1 file:cursor-pointer">
        <p class="text-xs text-navy/60 mt-1.5">Idéalement en haute définition et sur fond transparent.</p>
      </div>
      <div><label class="${label}" for="details">Précisions</label><textarea id="details" name="details" rows="4" maxlength="2000" class="${field}" placeholder="Texte à ajouter, dimensions souhaitées, inspiration…">${v('details')}</textarea></div>
`)}
    ${section('3. Livraison', `
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="${label}" for="wilaya">Wilaya *</label><select id="wilaya" name="wilaya" required class="${field}"><option value="">Choisir une wilaya…</option>${wilayaOpts}</select></div>
        <div><label class="${label}" for="commune">Commune *</label><select id="commune" name="commune" required disabled data-selected="${v('commune')}" class="${field} disabled:bg-sand/60 disabled:text-navy/50"><option value="">Choisissez d'abord une wilaya</option></select></div>
      </div>
      <div><label class="${label}" for="address">Adresse <span class="font-normal text-navy/50">(facultatif)</span></label><textarea id="address" name="address" rows="2" maxlength="300" class="${field}" placeholder="Rue, quartier, point de repère…">${v('address')}</textarea></div>`)}
    ${section('4. Vos coordonnées', `
      <div class="grid sm:grid-cols-2 gap-4">
        <div><label class="${label}" for="name">Nom complet *</label><input id="name" name="name" required maxlength="100" value="${v('name')}" class="${field}"></div>
        <div><label class="${label}" for="phone">Téléphone (WhatsApp) *</label><input id="phone" type="tel" name="phone" required maxlength="30" value="${v('phone')}" class="${field}"></div>
      </div>
      <div><label class="${label}" for="email">E-mail</label><input id="email" type="email" name="email" maxlength="150" value="${v('email')}" class="${field}"></div>`)}
    <button class="w-full ${btnPrimary} py-4 rounded-xl text-base">Envoyer ma demande</button>
  </form>
  <script type="application/json" id="places">${communesJson}</script>
  <script>
    (function () {
      var places = JSON.parse(document.getElementById('places').textContent);
      var wilaya = document.getElementById('wilaya'), commune = document.getElementById('commune');
      function fill(keep) {
        var list = places[wilaya.value] || [];
        commune.innerHTML = '';
        var first = document.createElement('option');
        first.value = ''; first.textContent = list.length ? 'Choisir une commune…' : "Choisissez d'abord une wilaya";
        commune.appendChild(first);
        list.forEach(function (c) {
          var o = document.createElement('option');
          o.value = c; o.textContent = c; if (c === keep) o.selected = true;
          commune.appendChild(o);
        });
        commune.disabled = !list.length;
      }
      wilaya.addEventListener('change', function () { fill(''); });
      fill(commune.dataset.selected);
    })();
  </script>
</main>
${siteFooter()}`,
  });
}

export function thanksPage(ref) {
  return layout({
    title: 'Demande envoyée - FlocArt',
    body: `${siteHeader()}
<main class="max-w-xl mx-auto px-6 py-24 text-center">
  <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-bronze text-navy text-3xl font-black flex items-center justify-center">✓</div>
  <h1 class="text-3xl font-black mb-3 text-sand-light">Demande envoyée !</h1>
  <p class="text-sand/70 mb-2">Votre numéro de devis : <strong class="text-bronze">#${esc(ref)}</strong></p>
  <p class="text-sand/70 mb-8">L'atelier FlocArt vous recontactera très vite par WhatsApp ou par téléphone.</p>
  <a href="/" class="inline-block bg-sand text-navy font-bold hover:bg-sand-light transition px-6 py-3 rounded-xl text-sm">Retour à l'accueil</a>
</main>
${siteFooter()}`,
  });
}

export function notFoundPage() {
  return layout({ title: 'Page introuvable - FlocArt', body: `${siteHeader()}<main class="max-w-xl mx-auto px-6 py-24 text-center"><h1 class="text-4xl font-black mb-3 text-sand-light">404</h1><p class="text-sand/70 mb-6">Cette page n'existe pas.</p><a href="/" class="text-bronze font-bold hover:underline">Retour à l'accueil</a></main>${siteFooter()}` });
}

/* ---------------- Admin ---------------- */

function adminHeader() {
  return `<header class="flex justify-between items-center px-6 md:px-8 py-4 bg-navy-card border-b border-sand/10">
  <a href="/admin/devis" class="flex items-center space-x-3"><span class="bg-bronze w-3 h-3 rounded-full animate-pulse"></span><span class="font-bold tracking-wide text-sand-light">Espace Propriétaire</span></a>
  <form method="post" action="/admin/logout"><button class="text-xs bg-sand/10 text-sand-light px-3 py-1.5 rounded-lg hover:bg-sand/20 transition">Déconnexion</button></form>
</header>`;
}

export function adminLoginPage({ step = 'request', message = '', error = '' } = {}) {
  const msg = message ? `<div class="${alertOk}" role="status">${esc(message)}</div>` : '';
  const err = error ? `<div class="${alertErr}" role="alert">${esc(error)}</div>` : '';
  const requestForm = `<form method="post" action="/admin/request-key">
      <p class="text-sm text-navy/70 mb-4">Une clé d'accès à usage unique sera envoyée à l'e-mail du propriétaire. Elle est valable 10 minutes.</p>
      <button class="w-full ${btnPrimary} py-3 rounded-xl">Recevoir ma clé par e-mail</button>
    </form>`;
  const keyForm = `<form method="post" action="/admin/login" class="space-y-3 ${step === 'request' ? 'mt-6 pt-6 border-t border-navy/10' : ''}">
      <label class="${label}" for="key">J'ai reçu ma clé</label>
      <input id="key" name="key" required autocomplete="off" autofocus placeholder="FLOC-XXXX-XXXX-XXXX" class="${field} font-mono tracking-wider text-center">
      <button class="w-full ${btnDark} py-3 rounded-xl">Accéder à l'espace admin</button>
    </form>`;
  return layout({
    title: 'Admin - FlocArt',
    admin: true,
    body: `<main class="flex-1 flex items-center justify-center px-6 py-16">
  <div class="w-full max-w-sm ${card} p-8">
    <div class="text-center mb-6"><span class="text-2xl font-black text-navy">Floc<span class="text-bronze-deep">Art</span></span><p class="text-xs text-navy/60 mt-1">Espace Propriétaire</p></div>
    ${msg}${err}
    ${step === 'key' ? keyForm : requestForm + keyForm}
  </div>
</main>`,
  });
}

// Badges de statut (fonds pleins : lisibles sur sable comme sur bleu nuit) : un code couleur par étape
const statusColors = {
  nouveau: 'bg-bronze text-navy border-bronze',
  en_cours: 'bg-sky-100 text-sky-800 border-sky-300',
  devis_envoye: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  accepte: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  refuse: 'bg-red-100 text-red-800 border-red-300',
  termine: 'bg-sand text-navy/70 border-sand',
};
const badge = (s) => `<span class="text-xs font-bold px-2.5 py-1 rounded-md border ${statusColors[s] || statusColors.termine}">${esc(STATUSES[s] || s)}</span>`;
const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: config.timeZone });

export function adminListPage(quotes, filter) {
  const counts = quotes.reduce((a, q) => ((a[q.status] = (a[q.status] || 0) + 1), a), {});
  const tabs = [['', 'Tous', quotes.length], ...Object.entries(STATUSES).map(([k, l]) => [k, l, counts[k] || 0])]
    .map(([k, l, n]) => `<a href="/admin/devis${k ? '?statut=' + k : ''}" class="text-xs px-3 py-1.5 rounded-lg border ${filter === k ? 'bg-bronze text-navy border-bronze font-bold' : 'border-sand/20 text-sand/70 hover:text-sand-light hover:border-sand/40'}">${l} (${n})</a>`).join('');
  const shown = filter ? quotes.filter((q) => q.status === filter) : quotes;
  const rows = shown.map((q) => `
    <a href="/admin/devis/${q.id}" class="block ${card} hover:ring-2 hover:ring-bronze transition">
      <div class="flex flex-wrap items-center gap-3 mb-2">${badge(q.status)}<span class="text-xs font-bold text-navy">Devis #${q.id}</span><span class="text-xs text-navy/60">${fmtDate(q.created_at)}</span></div>
      <h3 class="text-lg font-bold">${esc(productName(q.product))} (x${q.quantity})</h3>
      <p class="text-sm text-navy/70">Client : <strong class="text-navy">${esc(q.name)}</strong> • 📞 ${esc(q.phone)}</p>
      <p class="text-xs text-navy/60 mt-1">${esc([q.commune && `${q.commune}, ${q.wilaya}`, q.technique, q.placements].filter(Boolean).join(' • '))}</p>
    </a>`).join('');
  return layout({
    title: 'Devis - Admin FlocArt',
    admin: true,
    body: `${adminHeader()}
<main class="max-w-6xl w-full mx-auto px-6 py-10">
  <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
    <div><h1 class="text-2xl font-black text-sand-light">Demandes de devis</h1><p class="text-sand/70 text-sm">Triées de la plus récente à la plus ancienne.</p></div>
    <div class="bg-navy-card border border-sand/10 px-4 py-2 rounded-xl text-sm"><span class="text-bronze font-bold">${counts.nouveau || 0}</span> nouveau(x) devis</div>
  </div>
  <div class="flex flex-wrap gap-2 mb-6">${tabs}</div>
  <div class="space-y-4">${rows || '<p class="text-sand/60 text-sm py-10 text-center">Aucun devis pour le moment.</p>'}</div>
</main>`,
  });
}

export function adminDetailPage(q) {
  const row = (k, v) => (v ? `<div class="py-3 border-b border-navy/10 last:border-0"><dt class="text-xs font-bold text-navy/60 mb-0.5">${k}</dt><dd class="text-sm whitespace-pre-wrap">${esc(v)}</dd></div>` : '');
  const statusOpts = Object.entries(STATUSES).map(([k, l]) => `<option value="${k}" ${q.status === k ? 'selected' : ''}>${l}</option>`).join('');
  const h = (t) => `<h2 class="text-xs font-black tracking-wider text-bronze-deep uppercase mb-2">${t}</h2>`;
  // Aperçu sur damier (un logo blanc ou noir reste visible) ; le bouton bascule sur fond sombre
  const logo = q.logo_mime
    ? `<div class="${card}">
        ${h('Logo du client')}
        <div id="logo-preview" class="rounded-xl p-4 mb-3 flex justify-center" style="background:repeating-conic-gradient(#d9d2c0 0% 25%, #f5f0eb 0% 50%) 50% / 20px 20px">
          <img src="/admin/logo/${q.id}" alt="Logo du client" class="max-h-56 object-contain">
        </div>
        <div class="flex flex-wrap gap-2">
          <a href="/admin/logo/${q.id}?download=1" class="text-xs ${btnDark} px-4 py-2.5 rounded-xl inline-block">⬇️ Télécharger ${esc(q.logo_name || 'le logo')}</a>
          <button type="button" id="logo-bg" class="text-xs bg-sand text-navy font-bold hover:brightness-95 px-4 py-2.5 rounded-xl transition">Fond sombre</button>
        </div>
        <script>
          document.getElementById('logo-bg').addEventListener('click', function () {
            var p = document.getElementById('logo-preview'), dark = p.dataset.dark !== '1';
            p.dataset.dark = dark ? '1' : '';
            p.style.background = dark ? '#0A192F' : 'repeating-conic-gradient(#d9d2c0 0% 25%, #f5f0eb 0% 50%) 50% / 20px 20px';
            this.textContent = dark ? 'Fond clair' : 'Fond sombre';
          });
        </script>
      </div>`
    : `<div class="${card} text-sm text-navy/60">Aucun logo envoyé.</div>`;
  const msg = encodeURIComponent(`Bonjour ${q.name}, c'est FlocArt concernant votre demande de devis #${q.id} (${productName(q.product)} x${q.quantity}).`);
  return layout({
    title: `Devis #${q.id} - Admin FlocArt`,
    admin: true,
    body: `${adminHeader()}
<main class="max-w-4xl w-full mx-auto px-6 py-10">
  <a href="/admin/devis" class="text-xs text-sand/70 hover:text-sand-light">← Retour aux devis</a>
  <div class="flex flex-wrap items-center gap-3 mt-3 mb-6">
    <h1 class="text-2xl font-black text-sand-light">Devis #${q.id}</h1>${badge(q.status)}<span class="text-xs text-sand/60">${fmtDate(q.created_at)}</span>
  </div>
  <div class="grid md:grid-cols-2 gap-4 items-start">
    <div class="space-y-4">
      <div class="${card}">
        ${h('Commande')}
        <dl>${row('Produit', productName(q.product))}${row('Quantité', q.quantity)}${row('Couleur du vêtement', q.garment_color)}${row('Tailles', q.sizes)}${row('Technique', q.technique)}${row('Emplacements', q.placements)}${row('Couleurs du flocage', q.flock_colors)}${row('Précisions', q.details)}</dl>
      </div>
      <div class="${card}">
        ${h('Client')}
        <dl>${row('Nom', q.name)}${row('Téléphone', q.phone)}${row('E-mail', q.email)}${row('Wilaya', q.wilaya)}${row('Commune', q.commune)}${row('Adresse', q.address)}</dl>
        <div class="flex flex-wrap gap-2 mt-4">
          <a href="${whatsappLink(q.phone)}?text=${msg}" target="_blank" rel="noopener" class="bg-emerald-700 text-white hover:bg-emerald-600 text-xs font-bold px-4 py-3 rounded-xl transition">💬 Répondre (WhatsApp)</a>
          <a href="tel:${esc(q.phone)}" class="${btnDark} text-xs px-4 py-3 rounded-xl">📞 Appeler</a>
          ${q.email ? `<a href="mailto:${esc(q.email)}" class="${btnDark} text-xs px-4 py-3 rounded-xl">✉️ E-mail</a>` : ''}
        </div>
      </div>
    </div>
    <div class="space-y-4">
      ${logo}
      <form method="post" action="/admin/devis/${q.id}" class="${card} space-y-3">
        ${h('Suivi')}
        <div><label class="${label}" for="status">Statut</label><select id="status" name="status" class="${field}">${statusOpts}</select></div>
        <div><label class="${label}" for="admin_note">Note interne (prix, remarques…)</label><textarea id="admin_note" name="admin_note" rows="4" maxlength="2000" class="${field}">${esc(q.admin_note)}</textarea></div>
        <button class="w-full ${btnPrimary} py-3 rounded-xl">Enregistrer</button>
      </form>
    </div>
  </div>
</main>`,
  });
}
