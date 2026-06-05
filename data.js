/* QOff — données partagées */

const BARS = [
  {
    id: 'jetee',
    name: 'Le Jetée',
    emoji: '🍺',
    address: 'Quai de Belgique 3, Lausanne',
    distance: '120 m',
    phone: '+41 21 601 23 45',
    web: 'lejetee-lausanne.ch',
    description: "Bar emblématique du bord du lac, ambiance décontractée face au Léman. Terrasse ombragée, cocktails maison et petite restauration.",
    happyHour: { active: true, label: 'Bières Blanche du Lac', discount: '−50%' },
    socials: ['Instagram', 'Facebook', 'TikTok'],
    hours: [
      ['Lun', '11:00 – 23:00'],
      ['Mar', '11:00 – 23:00'],
      ['Mer', '11:00 – 23:00'],
      ['Jeu', '11:00 – 00:00'],
      ['Ven', '11:00 – 01:00'],
      ['Sam', '10:00 – 01:00'],
      ['Dim', '10:00 – 22:00'],
    ],
    todayIdx: 4,
    wait: 6,
    heroGradients: [
      'linear-gradient(135deg, #1A1A2E 0%, #0F3460 60%, #16213E 100%)',
      'linear-gradient(160deg, #0F3460 0%, #1A1A2E 50%, #0a1929 100%)',
      'linear-gradient(135deg, #16213E 0%, #1A1A2E 50%, #2a1a3e 100%)',
    ],
    pin: { left: 28, top: 62 },
  },
  {
    id: 'flon',
    name: 'Terrasse du Flon',
    emoji: '🍹',
    address: "Place de l'Europe 12, Lausanne",
    distance: '340 m',
    phone: '+41 21 311 44 22',
    web: 'terrasse-flon.ch',
    description: 'Au cœur du quartier branché du Flon, cocktails créatifs et vins naturels. Ambiance lounge en soirée.',
    happyHour: null,
    socials: ['Instagram', 'Facebook'],
    hours: [
      ['Lun', 'Fermé'],
      ['Mar', '16:00 – 00:00'],
      ['Mer', '16:00 – 00:00'],
      ['Jeu', '16:00 – 01:00'],
      ['Ven', '15:00 – 02:00'],
      ['Sam', '12:00 – 02:00'],
      ['Dim', '12:00 – 22:00'],
    ],
    todayIdx: 4,
    wait: 9,
    heroGradients: [
      'linear-gradient(135deg, #2D1B69 0%, #4A2080 60%, #1d0e4d 100%)',
      'linear-gradient(160deg, #4A2080 0%, #2D1B69 100%)',
    ],
    pin: { left: 52, top: 40 },
  },
  {
    id: 'ouchy',
    name: 'Ouchy Plage Bar',
    emoji: '🥂',
    address: "Avenue d'Ouchy 60, Lausanne",
    distance: '580 m',
    phone: '+41 21 612 90 10',
    web: 'ouchyplage.ch',
    description: "Directement les pieds dans l'eau sur la plage d'Ouchy. L'endroit idéal pour siroter un verre au coucher du soleil.",
    happyHour: null,
    socials: ['Instagram', 'Facebook', 'TikTok'],
    hours: [
      ['Lun', '12:00 – 22:00'],
      ['Mar', '12:00 – 22:00'],
      ['Mer', '12:00 – 22:00'],
      ['Jeu', '12:00 – 23:00'],
      ['Ven', '11:00 – 00:00'],
      ['Sam', '10:00 – 00:00'],
      ['Dim', '10:00 – 21:00'],
    ],
    todayIdx: 4,
    wait: 4,
    heroGradients: [
      'linear-gradient(135deg, #1a3a4a 0%, #0d6a6a 60%, #1a4a3a 100%)',
      'linear-gradient(160deg, #0d6a6a 0%, #1a3a4a 100%)',
    ],
    pin: { left: 68, top: 72 },
  },
];

const MENU = {
  barId: 'jetee',
  categories: [
    {
      id: 'biere', label: 'Bières', icon: '🍺',
      filters: ['Blonde', 'Blanche', 'IPA', '2.5dl', '5dl'],
      items: [
        { id: 'blanche', emoji: '🍺', name: 'Blanche du Lac', desc: 'Bière blanche artisanale, légère et fruitée · 33cl', price: 7.00, hhPrice: 3.50, tags: ['vege'], ingredients: ['Eau', 'Malt de blé', 'Orge', 'Houblon', 'Levure', "Écorce d'orange"], allergens: ['Gluten'], abv: '4.8%' },
        { id: 'ipa', emoji: '🍺', name: 'IPA Léman', desc: "India Pale Ale houblonnée, amère et aromatique · 33cl", price: 8.50, tags: ['vege'], ingredients: ["Eau", "Malt d'orge", 'Houblon Cascade', 'Levure'], allergens: ['Gluten'], abv: '6.2%' },
        { id: 'lager', emoji: '🍺', name: 'Lager Pression', desc: 'Blonde rafraîchissante, bien fraîche · 33cl', price: 6.50, tags: ['vege'], ingredients: ["Eau", "Malt d'orge", 'Houblon', 'Levure'], allergens: ['Gluten'], abv: '4.5%' },
      ],
    },
    {
      id: 'cocktail', label: 'Cocktails', icon: '🍹',
      filters: ['Avec alcool', 'Sans alcool', 'Classiques', 'Maison'],
      items: [
        { id: 'spritz', emoji: '🍹', name: 'Spritz Maison', desc: 'Apérol, prosecco, eau pétillante, orange', price: 12.00, tags: ['vegan'], ingredients: ['Apérol', 'Prosecco', 'Eau pétillante', 'Orange fraîche', 'Glace'], allergens: ['Sulfites'], abv: '11%' },
        { id: 'gintonic', emoji: '🍸', name: 'Gin Tonic', desc: 'Gin artisanal, tonic premium, citron vert', price: 14.00, tags: ['vegan'], ingredients: ['Gin artisanal', 'Tonic premium', 'Citron vert', 'Glace'], allergens: ['Quinine'], abv: '12%' },
        { id: 'mojito', emoji: '🍹', name: 'Mojito', desc: 'Rhum, menthe fraîche, citron vert, sucre de canne', price: 13.00, soldOut: true, tags: ['vegan'], ingredients: ['Rhum blanc', 'Menthe fraîche', 'Citron vert', 'Sucre de canne', 'Eau gazeuse'], allergens: [], abv: '10%' },
      ],
    },
    {
      id: 'vin', label: 'Vins', icon: '🍷',
      filters: ['Rouge', 'Blanc', 'Rosé', 'Verre', 'Bouteille', 'Suisse', 'France'],
      items: [
        { id: 'chasselas', emoji: '🍷', name: 'Chasselas AOC', desc: 'Blanc sec local, vif et minéral · 1dl', price: 6.00 },
        { id: 'rose', emoji: '🥂', name: 'Rosé de Provence', desc: 'Frais et fruité · 1dl', price: 7.00 },
      ],
    },
    {
      id: 'soft', label: 'Softs', icon: '🥤',
      filters: ['Pétillant', 'Plat', 'Jus', 'Sodas'],
      items: [
        { id: 'limonade', emoji: '🍋', name: 'Limonade artisanale', desc: 'Citron pressé, menthe fraîche', price: 5.00 },
        { id: 'eau', emoji: '💧', name: 'Eau minérale', desc: 'Plate ou gazeuse · 50cl', price: 4.00 },
      ],
    },
    {
      id: 'snack', label: 'À grignoter', icon: '🥨',
      filters: ['Salé', 'À partager', 'Végé'],
      items: [
        { id: 'planche', emoji: '🧀', name: 'Planche apéro', desc: 'Fromages & charcuterie locale, pain', price: 18.00, oldPrice: 22.00, tags: ['solde'], ingredients: ["Fromages d'alpage", 'Charcuterie locale', 'Pain artisanal', 'Cornichons', 'Noix'], allergens: ['Lait', 'Gluten', 'Fruits à coque'] },
        { id: 'frites', emoji: '🍟', name: 'Frites maison', desc: 'Croustillantes, sauce du chef', price: 8.00, tags: ['vege'], ingredients: ['Pommes de terre', 'Huile de tournesol', 'Sel', 'Sauce maison'], allergens: ['Œuf'] },
      ],
    },
  ],
};

// Lookup plat par id
const ITEMS = {};
MENU.categories.forEach(c => c.items.forEach(it => { ITEMS[it.id] = { ...it, category: c.label }; }));

const SAMPLE_CART = [
  { id: 'blanche', emoji: '🍺', name: 'Blanche du Lac', qty: 2, price: 3.50, hh: true },
  { id: 'spritz',  emoji: '🍹', name: 'Spritz Maison',  qty: 1, price: 12.00 },
  { id: 'planche', emoji: '🧀', name: 'Planche apéro',  qty: 1, price: 18.00 },
];

const LAST_ORDER = [
  { id: 'blanche', emoji: '🍺', name: 'Blanche du Lac', usual: 2, price: 3.50, hh: true },
  { id: 'spritz',  emoji: '🍹', name: 'Spritz Maison',  usual: 1, price: 12.00 },
  { id: 'mojito',  emoji: '🍹', name: 'Mojito',          usual: 1, price: 13.00, soldOut: true },
  { id: 'frites',  emoji: '🍟', name: 'Frites maison',  usual: 1, price: 8.00 },
];

const UPSELL = { id: 'frites', emoji: '🍟', name: 'Frites maison', desc: 'Parfait avec une bière', price: 8.00 };

const ORDERS = [
  { id: 1, bar: 'Le Jetée',          emoji: '🍺', date: "Aujourd'hui · 18:42", preview: '2× Blanche · 1× Spritz · 1× Planche', total: 37.00, status: 'prep', code: '4827' },
  { id: 2, bar: 'Terrasse du Flon',  emoji: '🍹', date: 'Hier · 21:15',         preview: '2× Gin Tonic · 1× Planche apéro',     total: 46.00, status: 'done', code: '1903' },
  { id: 3, bar: 'Ouchy Plage Bar',   emoji: '🥂', date: '24 mai · 19:30',       preview: '1× Rosé · 2× Limonade',               total: 17.00, status: 'done', code: '7715' },
];

const COUNTRIES = [
  { code: 'CH', flag: '🇨🇭', name: 'Suisse',       dial: '+41' },
  { code: 'FR', flag: '🇫🇷', name: 'France',       dial: '+33' },
  { code: 'DE', flag: '🇩🇪', name: 'Allemagne',    dial: '+49' },
  { code: 'IT', flag: '🇮🇹', name: 'Italie',       dial: '+39' },
  { code: 'AT', flag: '🇦🇹', name: 'Autriche',     dial: '+43' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgique',     dial: '+32' },
  { code: 'ES', flag: '🇪🇸', name: 'Espagne',      dial: '+34' },
  { code: 'GB', flag: '🇬🇧', name: 'Royaume-Uni',  dial: '+44' },
];

const SAVED_METHODS = [
  { brand: 'twint', name: 'Twint',              meta: '+41 79 412 88 30',        isDefault: true },
  { brand: 'visa',  name: 'Visa •••• 4242',     meta: 'Expire 12/28 · Camille Roux', isDefault: false },
  { brand: 'mc',    name: 'Mastercard •••• 8830', meta: 'Expire 09/27 · Camille Roux', isDefault: false },
  { brand: 'apple', name: 'Apple Pay',           meta: 'iPhone · Face ID',       isDefault: false },
];

const FAQ = [
  { q: 'Comment passer une commande ?', a: "Scannez le QR du bar ou choisissez-le dans la liste, ajoutez vos consommations au panier, puis validez le paiement. Votre code de retrait s'affiche immédiatement." },
  { q: 'Comment fonctionne le retrait ?', a: "Présentez votre code de retrait ou le QR au comptoir. Le barman le scanne et vous remet votre commande — pas besoin de faire la queue." },
  { q: 'Puis-je modifier ou annuler une commande ?', a: "Tant que le bar n'a pas accepté la commande, vous pouvez l'annuler depuis le suivi. Une fois en préparation, contactez directement le bar via la page Aide." },
  { q: 'Quels moyens de paiement sont acceptés ?', a: "Twint, Visa, Mastercard, Apple Pay et Google Pay. Vous pouvez enregistrer un moyen par défaut dans Moyens de paiement." },
  { q: 'Comment obtenir une facture ?', a: "Depuis Mes commandes, ouvrez la commande concernée et touchez « Demander une facture ». Elle vous sera envoyée par e-mail." },
];

function formatPrice(v) { return 'CHF ' + v.toFixed(2); }

// Lecture/écriture du panier en sessionStorage
function getCart() {
  try { return JSON.parse(sessionStorage.getItem('qoff_cart') || '{}'); } catch { return {}; }
}
function setCart(obj) { sessionStorage.setItem('qoff_cart', JSON.stringify(obj)); }
function cartCount(cart) { return Object.values(cart).reduce((a, b) => a + b, 0); }
function cartTotal(cart) {
  let total = 0;
  MENU.categories.forEach(c => c.items.forEach(it => {
    const n = cart[it.id] || 0;
    if (n) total += n * (it.hhPrice != null ? it.hhPrice : it.price);
  }));
  return total;
}

// Favoris en localStorage
function getFavs() {
  try { return new Set(JSON.parse(localStorage.getItem('qoff_favs') || '[]')); } catch { return new Set(); }
}
function toggleFav(barId) {
  const f = getFavs();
  if (f.has(barId)) f.delete(barId); else f.add(barId);
  localStorage.setItem('qoff_favs', JSON.stringify([...f]));
  return f;
}

// Bar sélectionné
function getSelectedBar() { return sessionStorage.getItem('qoff_bar') || 'jetee'; }
function setSelectedBar(id) { sessionStorage.setItem('qoff_bar', id); }

// Auth simulé
function isConnected() { return localStorage.getItem('qoff_connected') === '1'; }
function setConnected(v) { v ? localStorage.setItem('qoff_connected','1') : localStorage.removeItem('qoff_connected'); }
