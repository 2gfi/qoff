/* QOff Back-Office Bar — demo dataset (POC, data figée). → window.BarData
   Reuses window.QData (shared with Super Admin) where possible; adds bar-only surfaces:
   roles/users for login, multi-bar, Kanban live orders, clusters IA, heatmap, refunds, happy hour. */
(function () {
  const QD = window.QData;

  /* ---- Rôles / utilisateurs (login PIN) ---- */
  const USERS = {
    patron:  { id: 'U1', name: 'Sophie Müller', first: 'Sophie', ini: 'SM', role: 'patron',  roleLabel: 'Patronne', since: '17:30' },
    manager: { id: 'U4', name: 'Sofia Rossi',   first: 'Sofia',  ini: 'SR', role: 'manager', roleLabel: 'Manager délégué', since: '16:00',
               delegates: { prices: true, hh: true, menu: false, until: '31/12/2026 23:00' } },
    barman:  { id: 'U2', name: 'Lucas Perret',  first: 'Lucas',  ini: 'LP', role: 'barman',  roleLabel: 'Barman', since: '18:00' },
  };

  /* ---- Multi-bar (patron) ---- */
  const BARS = [
    { id: 'bar1', name: 'Le Jetée',        emoji: '🍹', city: 'Lausanne', status: 'active', caMonth: 16310, comm: 3,   created: '12 mars 2024' },
    { id: 'bar2', name: 'Quai 9',          emoji: '🍸', city: 'Lausanne', status: 'active', caMonth: 11240, comm: 3.5, created: '03 avr. 2024' },
    { id: 'bar3', name: 'Le Phare',        emoji: '🍺', city: 'Neuchâtel',status: 'active', caMonth: 6740,  comm: 3,   created: '24 juin 2024' },
  ];
  const BARS_CLOSED = [
    { id: 'bar9', name: 'Rooftop Bar', emoji: '🌆', city: 'Berne', status: 'closed', caMonth: 0, comm: 3, created: '21 janv. 2024' },
  ];

  /* ---- Commandes live (Kanban) ----
     status: new | preparing | ready | paused | claimed | refunded
     elapsed = minutes depuis la commande (pour le timer) */
  const liveOrders = [
    { id: '#4821', code: '3847', time: '18:32', elapsed: 1,  status: 'new',
      items: [{ qty: 2, name: 'IPA artisanale 5dl' }, { qty: 1, name: 'Mojito' }, { qty: 1, name: 'Limonade maison' }],
      note: 'Sans glaçons pour le mojito svp', phone: '+41 79 ••• •• 67', channel: 'App', total: 32.5 },
    { id: '#4820', code: '2156', time: '18:31', elapsed: 2, status: 'new',
      items: [{ qty: 3, name: 'Blonde pression 33cl' }], phone: '+41 76 ••• •• 12', channel: 'App', total: 19.5 },
    { id: '#4819', code: '9023', time: '18:27', elapsed: 6, status: 'preparing',
      items: [{ qty: 1, name: 'Spritz Aperol' }, { qty: 2, name: 'Blonde pression 33cl' }],
      phone: '+41 78 ••• •• 90', channel: 'App', total: 25.0 },
    { id: '#4818', code: '4412', time: '18:23', elapsed: 10, status: 'preparing',
      items: [{ qty: 2, name: 'Gin tonic' }, { qty: 1, name: 'Planche mixte' }],
      note: 'Allergie arachides', phone: '+41 79 ••• •• 34', channel: 'Comptoir', total: 46.0 },
    { id: '#4817', code: '7188', time: '18:18', elapsed: 15, status: 'ready',
      items: [{ qty: 1, name: 'Mojito' }, { qty: 1, name: 'Verre de blanc' }],
      phone: '+41 77 ••• •• 05', channel: 'App', total: 20.0 },
    { id: '#4816', code: '5530', time: '18:14', elapsed: 19, status: 'ready',
      items: [{ qty: 4, name: 'Blonde pression 33cl' }, { qty: 2, name: 'Eau pétillante 50cl' }],
      phone: '+41 76 ••• •• 88', channel: 'App', total: 34.0 },
    { id: '#4815', code: '6701', time: '18:09', elapsed: 24, status: 'paused',
      items: [{ qty: 2, name: 'Spritz Aperol' }], pauseReason: 'Article indisponible',
      phone: '+41 78 ••• •• 41', channel: 'App', total: 24.0 },
    { id: '#4812', code: '1109', time: '17:58', elapsed: 35, status: 'claimed',
      items: [{ qty: 1, name: 'IPA artisanale 5dl' }, { qty: 1, name: 'Limonade maison' }],
      phone: '+41 79 ••• •• 22', channel: 'App', total: 13.0 },
    { id: '#4811', code: '8845', time: '17:52', elapsed: 41, status: 'claimed',
      items: [{ qty: 2, name: 'Mojito' }], phone: '+41 77 ••• •• 73', channel: 'Comptoir', total: 26.0 },
    { id: '#4809', code: '3360', time: '17:44', elapsed: 49, status: 'refunded',
      items: [{ qty: 1, name: 'Planche mixte' }], refundReason: 'Article épuisé',
      phone: '+41 76 ••• •• 18', channel: 'App', total: 18.0 },
  ];

  /* nouvelles commandes injectables (simulation temps réel) */
  const incomingPool = [
    { code: '5021', items: [{ qty: 1, name: 'Spritz Aperol' }, { qty: 1, name: 'Mojito' }], phone: '+41 79 ••• •• 51', total: 25.0 },
    { code: '5022', items: [{ qty: 2, name: 'Gin tonic' }], note: 'Citron vert en plus', phone: '+41 78 ••• •• 14', total: 28.0 },
    { code: '5023', items: [{ qty: 4, name: 'Blonde pression 33cl' }, { qty: 1, name: 'Planche mixte' }], phone: '+41 76 ••• •• 39', total: 44.0 },
    { code: '5024', items: [{ qty: 1, name: 'Verre de blanc' }, { qty: 2, name: 'Eau pétillante 50cl' }], phone: '+41 77 ••• •• 62', total: 15.0 },
    { code: '5025', items: [{ qty: 3, name: 'Mojito' }], note: 'Pour la terrasse', phone: '+41 79 ••• •• 08', total: 39.0 },
  ];

  /* ---- Menu / Stock — articles plats groupés par catégorie ---- */
  const menu = [
    { id: 'bi1', cat: 'Bières',    emoji: '🍺', name: 'Blonde pression 33cl', desc: 'Lager maison · 33cl', price: 6.5,  tva: 8.1, active: true,  stock: true,  tags: [], sub: 'Blonde' },
    { id: 'bi2', cat: 'Bières',    emoji: '🍺', name: 'IPA artisanale 5dl',   desc: 'Houblonnée · 50cl',  price: 8.0,  tva: 8.1, active: true,  stock: true,  tags: ['Nouveau'], sub: 'IPA' },
    { id: 'bi3', cat: 'Bières',    emoji: '🍺', name: 'Blanche citron',       desc: 'Wheat · 33cl',       price: 7.0,  tva: 8.1, active: true,  stock: false, tags: [], sub: 'Blanche' },
    { id: 'vi1', cat: 'Vins',      emoji: '🥂', name: 'Verre de blanc',       desc: 'Chasselas vaudois · 1dl', price: 7.0, tva: 8.1, active: true, stock: true, tags: [], sub: 'Blanc' },
    { id: 'vi2', cat: 'Vins',      emoji: '🌸', name: 'Verre de rosé',        desc: 'Provence · 1dl',     price: 7.5,  tva: 8.1, active: true,  stock: true,  tags: [], sub: 'Rosé' },
    { id: 'co1', cat: 'Cocktails', emoji: '🍸', name: 'Spritz Aperol',        desc: 'Aperol, prosecco, eau pétillante', price: 12.0, tva: 8.1, active: true, stock: true, tags: ['Happy Hour', 'Signature'], sub: 'Signature' },
    { id: 'co2', cat: 'Cocktails', emoji: '🍹', name: 'Mojito',               desc: 'Rhum, menthe, citron vert', price: 13.0, tva: 8.1, active: true, stock: true, tags: ['Happy Hour'], sub: 'Classiques' },
    { id: 'co3', cat: 'Cocktails', emoji: '🍸', name: 'Gin tonic',            desc: 'Gin, tonic, concombre', price: 14.0, tva: 8.1, active: false, stock: true, tags: [], sub: 'Classiques' },
    { id: 'so1', cat: 'Softs',     emoji: '🥤', name: 'Limonade maison',      desc: 'Citron, menthe · 33cl', price: 5.0, tva: 2.6, active: true, stock: true, tags: ['Bio'], sub: 'Sodas' },
    { id: 'so2', cat: 'Softs',     emoji: '💧', name: 'Eau pétillante 50cl',  desc: '50cl',               price: 4.0,  tva: 2.6, active: true,  stock: true,  tags: [], sub: 'Eaux' },
    { id: 'fo1', cat: 'Food',      emoji: '🧀', name: 'Planche mixte',        desc: 'Fromages & charcuterie', price: 18.0, tva: 2.6, active: true, stock: true, tags: ['Végé'], sub: 'Planches' },
  ];
  const MENU_CATS = ['Bières', 'Vins', 'Cocktails', 'Softs', 'Food'];

  /* ---- Catalogue QOff des CATÉGORIES (défini par le superadmin).
     Le bar ajoute depuis cette liste OU crée une catégorie custom (remontée en backlog superadmin). ---- */
  const CAT_CATALOG = [
    { name: 'Bières',           emoji: '🍺' },
    { name: 'Vins',             emoji: '🥂' },
    { name: 'Cocktails',        emoji: '🍸' },
    { name: 'Softs',            emoji: '🥤' },
    { name: 'Food',             emoji: '🧀' },
    { name: 'Spiritueux',       emoji: '🥃' },
    { name: 'Champagnes',       emoji: '🍾' },
    { name: 'Mocktails',        emoji: '🧉' },
    { name: 'Boissons chaudes', emoji: '☕' },
    { name: 'Desserts',         emoji: '🍰' },
  ];

  /* ---- Sous-filtres ACTIFS de ce bar (sous-ensemble choisi dans le catalogue QOff). ---- */
  const SUBFILTERS = {
    'Bières':    ['Blonde', 'IPA', 'Blanche'],
    'Vins':      ['Blanc', 'Rosé'],
    'Cocktails': ['Signature', 'Classiques'],
    'Softs':     ['Sodas', 'Eaux'],
    'Food':      ['Planches'],
  };

  /* ---- Catalogue QOff des SOUS-FILTRES (par catégorie, défini par le superadmin).
     Le bar pioche dans cette liste OU crée un sous-filtre custom (remonté en backlog superadmin). ---- */
  const SUBFILTER_CATALOG = {
    'Bières':    ['Blonde', 'IPA', 'Blanche', 'Ambrée', 'Triple', 'Stout', 'Sans alcool'],
    'Vins':      ['Blanc', 'Rouge', 'Rosé', 'Mousseux', 'Orange', 'Nature'],
    'Cocktails': ['Signature', 'Classiques', 'Sans alcool (mocktail)', 'Tiki', 'Shots'],
    'Softs':     ['Sodas', 'Jus', 'Eaux', 'Chaud', 'Énergisants', 'Kombucha'],
    'Food':      ['Planches', 'Snacks', 'Sucré', 'Tapas', 'Vegan'],
  };

  /* ---- Catégories & sous-filtres custom créés par CE bar (à valider côté superadmin → backlog).
     En POC, conteneur en mémoire ; côté superadmin ils apparaîtraient dans « créés par les bars, non ajoutés par défaut ». ---- */
  const customCats = [];
  const customSubs = {};

  /* ---- Palette d'emojis curée pour le dropdown d'icône d'article ---- */
  const EMOJI_SET = [
    '🍺','🍻','🍷','🥂','🍸','🍹','🍶','🥃','🧉','🍾',
    '🥤','🧊','💧','☕','🫖','🧃','🥛','🍵','🧋','🍫',
    '🍋','🍊','🍓','🍑','🍍','🥥','🌿','🌸','🫐','🍒',
    '🧀','🥖','🥨','🍕','🍟','🌮','🥗','🍤','🫒','🥜',
    '🍰','🍮','🍩','🍪','🧁','🍦','⭐','🔥','✨','🎉',
  ];

  /* ---- Happy Hour ---- */
  const happyHour = { active: true, start: '17:00', end: '19:00', discount: 50, items: ['co1', 'co2', 'bi1'] };

  /* ---- Équipe (bar) — avec délégation ---- */
  const team = [
    { id: 'T1', first: 'Sophie', last: 'Müller', name: 'Sophie Müller', role: 'Patron',  email: 'sophie@jetee.ch', phone: '+41 79 412 33 21', status: 'active', since: '12 mars 2024', delegate: null, otherBars: ['Quai 9', 'Le Phare'] },
    { id: 'T4', first: 'Sofia',  last: 'Rossi',  name: 'Sofia Rossi',   role: 'Manager', email: 'sofia@jetee.ch',  phone: '+41 76 884 52 19', status: 'active', since: '21 mai 2024',
      delegate: { prices: true, hh: true, menu: false, until: '31/12/2026 · 23:00' }, otherBars: ['Quai 9'] },
    { id: 'T2', first: 'Lucas',  last: 'Perret', name: 'Lucas Perret',  role: 'Barman',  email: 'lucas@jetee.ch',  phone: '+41 78 220 11 04', status: 'active', since: '03 avr. 2024', delegate: null, otherBars: ['Le Phare'] },
    { id: 'T3', first: 'Elena',  last: 'Costa',  name: 'Elena Costa',   role: 'Barman',  email: 'elena@jetee.ch',  phone: '+41 76 884 52 19', status: 'active', since: '21 mai 2024', delegate: null, otherBars: [] },
    { id: 'T6', first: 'Tom',    last: 'Favre',  name: 'Tom Favre',     role: 'Barman',  email: '',                phone: '+41 79 661 28 40', status: 'invited', since: 'il y a 2 j', delegate: null, otherBars: [] },
    { id: 'T7', first: 'Léa',    last: 'Girard', name: 'Léa Girard',    role: 'Barman',  email: 'lea.g@jetee.ch',  phone: '+41 78 552 09 71', status: 'off',     since: '18 mars 2024', delegate: null, otherBars: [] },
  ];

  /* ---- Clusters IA (analytics patron) ---- */
  const clusters = [
    { emoji: '🍹', color: '#FF6B35', name: 'Les festifs du soir',
      insight: 'Pic de commandes entre 21h et 23h. Forte affinité cocktails + bières. Panier élevé, viennent en groupe.',
      items: ['Spritz Aperol', 'Mojito', 'IPA artisanale', 'Gin tonic'],
      stats: [['34%', 'du CA'], ['CHF 28', 'panier moy.'], ['2,4', 'articles/cmd']] },
    { emoji: '☀️', color: '#F59E0B', name: 'Apéro terrasse',
      insight: 'Actifs 17h–19h, très sensibles au Happy Hour. Convertissent +40% pendant la promo.',
      items: ['Spritz Aperol', 'Verre de blanc', 'Planche mixte'],
      stats: [['22%', 'du CA'], ['CHF 19', 'panier moy.'], ['68%', 'pendant HH']] },
    { emoji: '🍺', color: '#3B82F6', name: 'Les habitués bière',
      insight: 'Reviennent 3+ fois/semaine. Commandes rapides, mono-produit, faible note moyenne.',
      items: ['Blonde pression 33cl', 'IPA artisanale'],
      stats: [['18%', 'du CA'], ['CHF 13', 'panier moy.'], ['3,1×', '/semaine']] },
    { emoji: '💧', color: '#1D9E75', name: 'Soft & sobres',
      insight: 'Préfèrent softs et eaux. Souvent conducteurs du groupe. Opportunité mocktails signature.',
      items: ['Limonade maison', 'Eau pétillante 50cl', 'Verre de blanc'],
      stats: [['14%', 'du CA'], ['CHF 9', 'panier moy.'], ['1,8', 'articles/cmd']] },
    { emoji: '🌙', color: '#8B5CF6', name: 'Derniers verres',
      insight: 'Commandent après 23h. Tickets courts mais réguliers. Sensibles aux temps d’attente.',
      items: ['Gin tonic', 'Mojito', 'Blonde pression 33cl'],
      stats: [['12%', 'du CA'], ['CHF 16', 'panier moy.'], ['4,2 min', 'attente']] },
  ];

  /* ---- Heatmap (jour × heure 11h→23h) ---- */
  const HM_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const HM_HOURS = [];
  for (let h = 11; h <= 23; h++) HM_HOURS.push(h);
  const heatmap = (function () {
    let s = 13; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    return HM_HOURS.map((h, hi) => HM_DAYS.map((d, di) => {
      const we = di >= 4; const evening = h >= 18 && h <= 22;
      let v = r() * .35 + (evening ? .4 : .05) + (we ? .2 : 0);
      if (h === 20 || h === 21) v += .2;
      return Math.min(1, +v.toFixed(2));
    }));
  })();

  /* ---- Remboursements (vue patron) ---- */
  const refunds = [
    { id: '#4809', items: '1× Planche mixte', amount: 18.0, date: '06 juin 2026', reason: 'Article épuisé', by: 'Lucas Perret' },
    { id: '#4788', items: '2× Mojito', amount: 26.0, date: '05 juin 2026', reason: 'Client injoignable', by: 'Sofia Rossi' },
    { id: '#4751', items: '1× Spritz Aperol, 1× IPA', amount: 20.0, date: '04 juin 2026', reason: 'Erreur de commande', by: 'Sophie Müller' },
    { id: '#4720', items: '1× Gin tonic', amount: 14.0, date: '02 juin 2026', reason: 'Problème technique', by: 'Lucas Perret' },
    { id: '#4698', items: '3× Blonde pression', amount: 19.5, date: '01 juin 2026', reason: 'Annulation client', by: 'Sofia Rossi' },
  ];

  /* ---- Dashboard KPI (jour / 7j / mois) ---- */
  const dash = {
    today: { ca: 1284.5, orders: 87, avg: 14.76, peak: '20h–21h', delta: 12 },
    week:  { ca: 7832,   orders: 523, avg: 14.98, peak: 'Vendredi', delta: 8 },
    month: { ca: 23410,  orders: 1842, avg: 12.71, peak: 'Sem. 23', delta: 15 },
  };

  window.BarData = {
    USERS, BARS, BARS_CLOSED, liveOrders, incomingPool, menu, MENU_CATS,
    SUBFILTERS, SUBFILTER_CATALOG, CAT_CATALOG, customCats, customSubs, EMOJI_SET,
    happyHour, team, clusters, HM_DAYS, HM_HOURS, heatmap, refunds, dash,
    // nav par rôle
    canSee: function (role, key, user) {
      const P = { // pages accessibles par rôle
        patron:  ['orders', 'stock', 'stats', 'clusters', 'menu', 'team', 'history', 'refunds', 'profile'],
        manager: ['orders', 'stock', 'stats'].concat(
          (user && user.delegates && (user.delegates.prices || user.delegates.menu)) ? ['menu'] : []),
        barman:  ['orders', 'stock'],
      };
      return (P[role] || []).includes(key);
    },
  };
})();
