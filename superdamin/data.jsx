/* QOff Super Admin — demo dataset (POC, "data figée"). → window.QData */
(function () {
  const CHF = (n) => 'CHF ' + n.toLocaleString('fr-CH', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  const EUR = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
  const money = (n, cur) => cur === 'EUR' ? EUR(n) : CHF(n);

  const countries = [
    { code: 'CH', flag: '🇨🇭', name: 'Suisse', active: true, currency: 'CHF', langs: ['FR', 'DE', 'IT', 'EN'], defLang: 'FR', tvaStd: 8.1, tvaRed: 2.6, dial: '+41', bars: 14 },
    { code: 'FR', flag: '🇫🇷', name: 'France', active: true, currency: 'EUR', langs: ['FR', 'EN'], defLang: 'FR', tvaStd: 20, tvaRed: 10, dial: '+33', bars: 3 },
    { code: 'DE', flag: '🇩🇪', name: 'Allemagne', active: false, currency: 'EUR', langs: ['DE', 'EN'], defLang: 'DE', tvaStd: 19, tvaRed: 7, dial: '+49', bars: 0 },
    { code: 'IT', flag: '🇮🇹', name: 'Italie', active: false, currency: 'EUR', langs: ['IT', 'EN'], defLang: 'IT', tvaStd: 22, tvaRed: 10, dial: '+39', bars: 0 },
  ];

  const patrons = [
    { id: 'P1', first: 'Sophie', last: 'Müller', name: 'Sophie Müller', email: 'sophie@jetee.ch', phone: '+41 79 412 33 21', country: 'CH', flag: '🇨🇭', bars: 3, status: 'active', caTotal: 41280, lastLogin: 'il y a 2 h', since: '12 mars 2024' },
    { id: 'P2', first: 'Marc', last: 'Dupont', name: 'Marc Dupont', email: 'marc@paleo.ch', phone: '+41 76 220 84 10', country: 'CH', flag: '🇨🇭', bars: 2, status: 'active', caTotal: 28640, lastLogin: 'il y a 5 h', since: '02 mai 2024' },
    { id: 'P3', first: 'Anna', last: 'Keller', name: 'Anna Keller', email: 'anna@rooftop.ch', phone: '+41 78 991 02 47', country: 'CH', flag: '🇨🇭', bars: 2, status: 'active', caTotal: 19410, lastLogin: 'hier', since: '21 janv. 2024' },
    { id: 'P4', first: 'Luca', last: 'Rossi', name: 'Luca Rossi', email: 'luca@spiaggia.ch', phone: '+41 79 663 17 55', country: 'CH', flag: '🇨🇭', bars: 2, status: 'active', caTotal: 22180, lastLogin: 'il y a 1 j', since: '08 avr. 2024' },
    { id: 'P5', first: 'Camille', last: 'Favre', name: 'Camille Favre', email: 'camille@guinguette.fr', phone: '+33 6 41 22 87 03', country: 'FR', flag: '🇫🇷', bars: 2, status: 'active', caTotal: 14920, lastLogin: 'il y a 3 j', since: '14 juin 2024' },
    { id: 'P6', first: 'Noah', last: 'Schmid', name: 'Noah Schmid', email: 'noah@seeblick.ch', phone: '+41 77 304 91 28', country: 'CH', flag: '🇨🇭', bars: 2, status: 'active', caTotal: 17650, lastLogin: 'il y a 6 h', since: '29 févr. 2024' },
    { id: 'P7', first: 'Inès', last: 'Berger', name: 'Inès Berger', email: 'ines@lakeside.ch', phone: '+41 76 808 44 19', country: 'CH', flag: '🇨🇭', bars: 1, status: 'active', caTotal: 9340, lastLogin: 'il y a 4 h', since: '11 sept. 2024' },
    { id: 'P8', first: 'Théo', last: 'Girard', name: 'Théo Girard', email: 'theo@nomade.fr', phone: '+33 6 78 55 21 90', country: 'FR', flag: '🇫🇷', bars: 1, status: 'suspended', caTotal: 4120, lastLogin: 'il y a 18 j', since: '03 oct. 2024' },
  ];

  const S = { active: 'Actif', suspended: 'Suspendu', trial: 'Essai', maintenance: 'Maintenance', closed: 'Clôturé' };
  const bars = [
    { id: 'B01', name: 'Le Jetée', city: 'Lausanne', country: 'CH', flag: '🇨🇭', patron: 'Sophie Müller', patronId: 'P1', status: 'active', comm: 3, ca: 8420, o7: 312, basket: 18.4, created: '12 mars 2024', trend: 'up' },
    { id: 'B02', name: 'Paléo Bar', city: 'Nyon', country: 'CH', flag: '🇨🇭', patron: 'Marc Dupont', patronId: 'P2', status: 'active', comm: 3, ca: 15300, o7: 540, basket: 21.1, created: '02 mai 2024', trend: 'up' },
    { id: 'B03', name: 'Beach Club', city: 'Genève', country: 'CH', flag: '🇨🇭', patron: 'Luca Rossi', patronId: 'P4', status: 'trial', comm: 3, ca: 1200, o7: 64, basket: 16.8, created: '28 avr. 2025', trend: 'up' },
    { id: 'B04', name: 'La Terrasse', city: 'Zürich', country: 'CH', flag: '🇨🇭', patron: 'Noah Schmid', patronId: 'P6', status: 'suspended', comm: 3, ca: 0, o7: 0, basket: 0, created: '29 févr. 2024', trend: 'flat' },
    { id: 'B05', name: 'Rooftop Bar', city: 'Berne', country: 'CH', flag: '🇨🇭', patron: 'Anna Keller', patronId: 'P3', status: 'closed', comm: 3, ca: 3100, o7: 0, basket: 0, created: '21 janv. 2024', trend: 'down' },
    { id: 'B06', name: 'Quai 9', city: 'Lausanne', country: 'CH', flag: '🇨🇭', patron: 'Sophie Müller', patronId: 'P1', status: 'active', comm: 3.5, ca: 11240, o7: 388, basket: 19.7, created: '03 avr. 2024', trend: 'up' },
    { id: 'B07', name: 'Spiaggia', city: 'Lugano', country: 'CH', flag: '🇨🇭', patron: 'Luca Rossi', patronId: 'P4', status: 'active', comm: 3, ca: 9820, o7: 274, basket: 20.3, created: '19 mai 2024', trend: 'flat' },
    { id: 'B08', name: 'Guinguette du Lac', city: 'Annecy', country: 'FR', flag: '🇫🇷', patron: 'Camille Favre', patronId: 'P5', status: 'active', comm: 4, ca: 9300, o7: 248, basket: 17.2, created: '14 juin 2024', trend: 'up' },
    { id: 'B09', name: 'Seeblick', city: 'Lucerne', country: 'CH', flag: '🇨🇭', patron: 'Noah Schmid', patronId: 'P6', status: 'active', comm: 3, ca: 7480, o7: 201, basket: 18.9, created: '07 juil. 2024', trend: 'up' },
    { id: 'B10', name: 'Lakeside', city: 'Montreux', country: 'CH', flag: '🇨🇭', patron: 'Inès Berger', patronId: 'P7', status: 'active', comm: 3, ca: 9340, o7: 263, basket: 22.4, created: '11 sept. 2024', trend: 'up' },
    { id: 'B11', name: 'Le Nomade', city: 'Lyon', country: 'FR', flag: '🇫🇷', patron: 'Théo Girard', patronId: 'P8', status: 'suspended', comm: 4, ca: 0, o7: 0, basket: 0, created: '03 oct. 2024', trend: 'down' },
    { id: 'B12', name: 'Bains des Pâquis', city: 'Genève', country: 'CH', flag: '🇨🇭', patron: 'Anna Keller', patronId: 'P3', status: 'active', comm: 3, ca: 16310, o7: 502, basket: 23.8, created: '21 janv. 2024', trend: 'up' },
    { id: 'B13', name: 'Terrasse du Port', city: 'Marseille', country: 'FR', flag: '🇫🇷', patron: 'Camille Favre', patronId: 'P5', status: 'maintenance', comm: 4, ca: 5620, o7: 0, basket: 19.1, created: '02 août 2024', trend: 'flat' },
    { id: 'B14', name: 'Alpenblick', city: 'Interlaken', country: 'CH', flag: '🇨🇭', patron: 'Marc Dupont', patronId: 'P2', status: 'active', comm: 3, ca: 13340, o7: 421, basket: 20.6, created: '15 mai 2024', trend: 'up' },
    { id: 'B15', name: 'Riva', city: 'Locarno', country: 'CH', flag: '🇨🇭', patron: 'Luca Rossi', patronId: 'P4', status: 'trial', comm: 3, ca: 980, o7: 41, basket: 15.4, created: '12 mai 2025', trend: 'up' },
    { id: 'B16', name: 'Le Phare', city: 'Neuchâtel', country: 'CH', flag: '🇨🇭', patron: 'Sophie Müller', patronId: 'P1', status: 'active', comm: 3, ca: 6740, o7: 188, basket: 17.8, created: '24 juin 2024', trend: 'flat' },
    { id: 'B17', name: 'Sunset Deck', city: 'Sion', country: 'CH', flag: '🇨🇭', patron: 'Inès Berger', patronId: 'P7', status: 'active', comm: 3, ca: 5120, o7: 142, basket: 18.1, created: '30 juil. 2024', trend: 'up' },
    { id: 'B18', name: 'Dampfschiff', city: 'Zoug', country: 'CH', flag: '🇨🇭', patron: 'Noah Schmid', patronId: 'P6', status: 'active', comm: 3, ca: 8870, o7: 231, basket: 21.0, created: '18 juin 2024', trend: 'up' },
  ];
  const pendingBars = [
    { id: 'PB1', name: 'Plage Bleu', city: 'Vevey', country: 'CH', flag: '🇨🇭', patron: 'Inès Berger', submitted: 'il y a 2 j', address: "Quai Perdonnet 12, 1800 Vevey", phone: '+41 21 555 88 02', email: 'contact@plagebleu.ch', lang: 'FR' },
    { id: 'PB2', name: 'Café des Arbres', city: 'Fribourg', country: 'CH', flag: '🇨🇭', patron: 'Marc Dupont', submitted: 'il y a 5 j', address: "Rue de Lausanne 41, 1700 Fribourg", phone: '+41 26 322 14 09', email: 'hello@desarbres.ch', lang: 'FR' },
  ];

  const clients = [
    { id: 'C1', name: 'Jean Martin', phone: '+41 79 234 56 78', email: 'jean.martin@bluewin.ch', orders: 12, spent: 218.4, status: 'active', since: '04 avr. 2024', lastBar: 'Le Jetée' },
    { id: 'C2', name: 'Lisa Blanc', phone: '+41 76 543 21 09', email: 'lisa.blanc@gmail.com', orders: 5, spent: 96.5, status: 'active', since: '17 juin 2024', lastBar: 'Bains des Pâquis' },
    { id: 'C3', name: '[ANONYMISÉ]', phone: '+41 79 ••• •• ••', email: '[anonymisé]', orders: 3, spent: 54.2, status: 'anonymized', since: '—', lastBar: '—' },
    { id: 'C4', name: 'Thomas Graf', phone: '+41 78 901 23 45', email: 'tgraf@hotmail.com', orders: 1, spent: 14.0, status: 'blacklisted', since: '02 sept. 2024', lastBar: 'Paléo Bar' },
    { id: 'C5', name: 'Élodie Roux', phone: '+41 77 612 09 88', email: 'elodie.roux@proton.me', orders: 8, spent: 162.9, status: 'active', since: '11 mai 2024', lastBar: 'Quai 9' },
    { id: 'C6', name: 'Daniel Weber', phone: '+41 79 455 71 30', email: 'd.weber@gmx.ch', orders: 21, spent: 401.7, status: 'active', since: '28 févr. 2024', lastBar: 'Alpenblick' },
  ];

  const psp = { success: 'Succès', refunded: 'Remboursé', partial: 'Partiel', failed: 'Échoué', pending: 'En attente' };
  const ostat = { claimed: 'Récupérée', ready: 'Prête', preparing: 'En prépa.', pending: 'En attente', cancelled: 'Annulée' };
  const txBars = bars.filter(b => b.status === 'active' || b.status === 'trial');
  const txNames = ['Jean Martin', 'Lisa Blanc', 'Élodie Roux', 'Daniel Weber', 'Client invité', 'Thomas Graf'];
  const transactions = [];
  (function buildTx() {
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const statuses = [['success', 'claimed'], ['success', 'ready'], ['success', 'preparing'], ['success', 'claimed'], ['success', 'claimed'], ['refunded', 'cancelled'], ['partial', 'claimed'], ['failed', 'cancelled'], ['pending', 'pending']];
    for (let i = 0; i < 45; i++) {
      const b = txBars[Math.floor(rnd() * txBars.length)];
      const st = statuses[Math.floor(rnd() * statuses.length)];
      const amount = +(8 + rnd() * 64).toFixed(2);
      const items = 1 + Math.floor(rnd() * 5);
      const d = new Date(2026, 5, 6 - Math.floor(rnd() * 9), 9 + Math.floor(rnd() * 13), Math.floor(rnd() * 60));
      transactions.push({
        id: 'QO-' + (48210 - i), date: d, bar: b.name, barId: b.id, cur: b.country === 'FR' ? 'EUR' : 'CHF',
        client: txNames[Math.floor(rnd() * txNames.length)], items, amount,
        comm: +(amount * b.comm / 100).toFixed(2), psp: st[0], order: st[1],
      });
    }
  })();

  const audit = [
    { admin: 'Admin QOff', role: 'Super Admin', type: 'bar.suspend', kind: 'danger', entity: 'La Terrasse — Zürich', diff: 'Actif → Suspendu', time: '06 juin 2026 · 14:32', ip: '178.197.x.x' },
    { admin: 'Léa Fontaine', role: 'Support', type: 'client.anonymize', kind: 'danger', entity: 'Client #C3', diff: 'Données → [ANONYMISÉ]', time: '06 juin 2026 · 11:08', ip: '85.218.x.x' },
    { admin: 'Admin QOff', role: 'Super Admin', type: 'bar.create', kind: 'create', entity: 'Riva — Locarno', diff: '∅ → Essai', time: '05 juin 2026 · 17:54', ip: '178.197.x.x' },
    { admin: 'Karim Haddad', role: 'Finance', type: 'commission.credit', kind: 'create', entity: 'Beach Club — Genève', diff: 'Crédit CHF 120.00', time: '05 juin 2026 · 16:20', ip: '212.51.x.x' },
    { admin: 'Léa Fontaine', role: 'Support', type: 'transaction.refund', kind: 'admin', entity: 'QO-48207', diff: 'Succès → Remboursé', time: '05 juin 2026 · 15:02', ip: '85.218.x.x' },
    { admin: 'Admin QOff', role: 'Super Admin', type: 'patron.pin_reset', kind: 'admin', entity: 'Sophie Müller', diff: 'PIN jetable émis (1 h)', time: '05 juin 2026 · 09:41', ip: '178.197.x.x' },
    { admin: 'Tobias Frei', role: 'Tech', type: 'flag.toggle', kind: 'admin', entity: 'Traduction IA articles', diff: 'Off → On (global)', time: '04 juin 2026 · 18:33', ip: '193.5.x.x' },
    { admin: 'Admin QOff', role: 'Super Admin', type: 'bar.impersonate', kind: 'admin', entity: 'Le Jetée — Lausanne', diff: '[via admin] session ouverte', time: '04 juin 2026 · 14:11', ip: '178.197.x.x' },
    { admin: 'Karim Haddad', role: 'Finance', type: 'commission.rate', kind: 'admin', entity: 'Quai 9 — Lausanne', diff: '3% → 3.5%', time: '04 juin 2026 · 10:27', ip: '212.51.x.x' },
    { admin: 'Léa Fontaine', role: 'Support', type: 'client.blacklist', kind: 'danger', entity: 'Thomas Graf', diff: 'Actif → Blacklisté (90 j)', time: '03 juin 2026 · 16:49', ip: '85.218.x.x' },
    { admin: 'Admin QOff', role: 'Super Admin', type: 'bar.validate', kind: 'create', entity: 'Lakeside — Montreux', diff: 'En attente → Actif', time: '03 juin 2026 · 11:15', ip: '178.197.x.x' },
    { admin: 'Tobias Frei', role: 'Tech', type: 'settings.update', kind: 'admin', entity: 'Template SMS OTP', diff: 'Message modifié', time: '02 juin 2026 · 19:02', ip: '193.5.x.x' },
    { admin: 'Admin QOff', role: 'Super Admin', type: 'bar.transfer', kind: 'admin', entity: 'Spiaggia — Lugano', diff: 'Patron P2 → P4', time: '02 juin 2026 · 14:38', ip: '178.197.x.x' },
    { admin: 'Karim Haddad', role: 'Finance', type: 'reconciliation.run', kind: 'create', entity: 'Wallee — Mai 2026', diff: 'Écart 0.00 · OK', time: '01 juin 2026 · 08:00', ip: '212.51.x.x' },
    { admin: 'Admin QOff', role: 'Super Admin', type: 'admin.invite', kind: 'create', entity: 'Tobias Frei (Tech)', diff: '∅ → Invité', time: '31 mai 2026 · 17:20', ip: '178.197.x.x' },
  ];

  const services = [
    { name: 'PSP Wallee', icon: 'wallet', desc: 'Paiements, captures, remboursements', state: 'ok', latency: 42, uptime: '99.98%', last: 'il y a 12 s' },
    { name: 'SMS OTP', icon: 'phone', desc: "Envoi codes d'identification", state: 'ok', latency: 88, uptime: '99.92%', last: 'il y a 30 s' },
    { name: 'WebSocket', icon: 'pulse', desc: 'Temps réel barman / client', state: 'ok', latency: 16, uptime: '99.99%', last: 'il y a 5 s' },
    { name: 'Base de données', icon: 'server', desc: 'Lecture / écriture', state: 'ok', latency: 9, uptime: '100%', last: 'il y a 8 s' },
    { name: 'CDN', icon: 'grid', desc: 'Assets, photos articles', state: 'warn', latency: 410, uptime: '98.40%', last: 'il y a 22 s' },
    { name: 'Claude API', icon: 'sparkAdmin', desc: 'Modération IA, traductions', state: 'ok', latency: 640, uptime: '99.80%', last: 'il y a 40 s' },
  ];
  const incidents = [
    { time: '06 juin · 13:48', service: 'CDN', kind: 'warn', type: 'Latence élevée', bar: '—', detail: 'p95 latency 410ms sur eu-west', status: 'open' },
    { time: '06 juin · 09:12', service: 'PSP Wallee', kind: 'er', type: 'Échec capture', bar: 'Paléo Bar', detail: 'webhook timeout — retry OK', status: 'resolved' },
    { time: '05 juin · 21:36', service: 'SMS OTP', kind: 'er', type: 'OTP non délivré', bar: 'Beach Club', detail: 'opérateur Sunrise — file pleine', status: 'progress' },
    { time: '05 juin · 18:02', service: 'WebSocket', kind: 'warn', type: 'Reconnexion', bar: 'Le Jetée', detail: '3 reconnexions barman en 2 min', status: 'resolved' },
    { time: '04 juin · 12:20', service: 'PSP Wallee', kind: 'er', type: 'Commande bloquée', bar: 'Quai 9', detail: 'capturé mais commande en pending', status: 'resolved' },
    { time: '03 juin · 08:55', service: 'Claude API', kind: 'warn', type: 'Quota', bar: '—', detail: '80% du quota mensuel atteint', status: 'open' },
  ];

  // Référentiel catégories — noms multilingues + sous-catégories (icône + noms FR/DE/IT/EN + position)
  const CAT_DEF = [
    { e: '🍺', fr: 'Bières', de: 'Biere', it: 'Birre', en: 'Beers', tva: 'Alcool', active: true, subs: [['🍺', 'Blonde', 'Helles', 'Bionda', 'Lager'], ['🍺', 'Blanche', 'Weizen', 'Bianca', 'Wheat'], ['🍺', 'Brune', 'Dunkles', 'Scura', 'Brown'], ['🌿', 'IPA', 'IPA', 'IPA', 'IPA'], ['🚫', 'Sans alcool', 'Alkoholfrei', 'Analcolica', 'Alcohol-free']] },
    { e: '🍷', fr: 'Vins', de: 'Weine', it: 'Vini', en: 'Wines', tva: 'Alcool', active: true, subs: [['🥂', 'Blanc', 'Weiss', 'Bianco', 'White'], ['🍷', 'Rouge', 'Rot', 'Rosso', 'Red'], ['🌸', 'Rosé', 'Rosé', 'Rosato', 'Rosé'], ['🫧', 'Pétillant', 'Schaumwein', 'Spumante', 'Sparkling'], ['🍇', 'Naturel', 'Naturwein', 'Naturale', 'Natural']] },
    { e: '🍸', fr: 'Cocktails', de: 'Cocktails', it: 'Cocktail', en: 'Cocktails', tva: 'Alcool', active: true, subs: [['🍸', 'Classiques', 'Klassiker', 'Classici', 'Classics'], ['🍹', 'Sans alcool', 'Alkoholfrei', 'Analcolici', 'Mocktails'], ['🏠', 'Maison', 'Hausgemacht', 'Della casa', 'House'], ['✨', 'Signature', 'Signature', 'Signature', 'Signature']] },
    { e: '🥤', fr: 'Softs', de: 'Softdrinks', it: 'Analcolici', en: 'Soft drinks', tva: 'Soft', active: true, subs: [['🥤', 'Sodas', 'Limonaden', 'Bibite', 'Sodas'], ['🧃', 'Jus', 'Säfte', 'Succhi', 'Juices'], ['💧', 'Eaux', 'Wasser', 'Acque', 'Waters'], ['⚡', 'Energy', 'Energy', 'Energy', 'Energy']] },
    { e: '🥃', fr: 'Spiritueux', de: 'Spirituosen', it: 'Distillati', en: 'Spirits', tva: 'Alcool', active: true, subs: [['🥃', 'Whisky', 'Whisky', 'Whisky', 'Whisky'], ['🍸', 'Gin', 'Gin', 'Gin', 'Gin'], ['🍹', 'Rhum', 'Rum', 'Rum', 'Rum'], ['🧊', 'Vodka', 'Wodka', 'Vodka', 'Vodka']] },
    { e: '☕', fr: 'Chauds', de: 'Heissgetränke', it: 'Caldi', en: 'Hot drinks', tva: 'Soft', active: true, subs: [['☕', 'Café', 'Kaffee', 'Caffè', 'Coffee'], ['🍵', 'Thé', 'Tee', 'Tè', 'Tea'], ['🍫', 'Chocolat', 'Schokolade', 'Cioccolata', 'Chocolate']] },
    { e: '🍕', fr: 'Food', de: 'Essen', it: 'Cibo', en: 'Food', tva: 'Nourriture', active: true, subs: [['🔥', 'Chaud', 'Warm', 'Caldo', 'Hot'], ['🥗', 'Froid', 'Kalt', 'Freddo', 'Cold'], ['🥦', 'Végétarien', 'Vegetarisch', 'Vegetariano', 'Vegetarian'], ['🌱', 'Vegan', 'Vegan', 'Vegano', 'Vegan'], ['🥨', 'Snacks', 'Snacks', 'Snack', 'Snacks']] },
    { e: '🍦', fr: 'Desserts', de: 'Desserts', it: 'Dolci', en: 'Desserts', tva: 'Nourriture', active: true, subs: [['🍦', 'Glaces', 'Eis', 'Gelati', 'Ice cream'], ['🍰', 'Pâtisseries', 'Gebäck', 'Pasticceria', 'Pastries']] },
    { e: '🍾', fr: 'Champagnes', de: 'Champagner', it: 'Champagne', en: 'Champagne', tva: 'Alcool', active: false, subs: [['🍾', 'Brut', 'Brut', 'Brut', 'Brut'], ['🌸', 'Rosé', 'Rosé', 'Rosato', 'Rosé'], ['👑', 'Prestige', 'Prestige', 'Prestige', 'Prestige']] },
  ];
  let _cid = 0, _sid = 0;
  const categories = CAT_DEF.map(c => ({
    id: 'cat' + (++_cid), emoji: c.e, name: c.fr,
    names: { FR: c.fr, DE: c.de, IT: c.it, EN: c.en },
    tva: c.tva, active: c.active,
    subs: c.subs.map(s => ({ id: 'sub' + (++_sid), emoji: s[0], name: s[1], names: { FR: s[1], DE: s[2], IT: s[3], EN: s[4] }, active: true })),
  }));
  const tvaMatrix = [
    { type: 'Alcool', CH: 8.1, FR: 20 },
    { type: 'Nourriture', CH: 2.6, FR: 10 },
    { type: 'Soft', CH: 2.6, FR: 10 },
    { type: 'Services', CH: 8.1, FR: 20 },
  ];

  const flags = [
    { name: 'Traduction IA articles', desc: 'Menus traduits automatiquement (plan Pro)', scope: 'Par bar', global: true, overrides: 4 },
    { name: 'Clustering IA analytics', desc: 'Segmentation clients automatique', scope: 'Global', global: false, overrides: 0 },
    { name: 'Happy Hour', desc: 'Tarifs dynamiques planifiés', scope: 'Par bar', global: true, overrides: 9 },
    { name: 'Export CSV avancé', desc: 'Colonnes TVA détaillées', scope: 'Par patron', global: true, overrides: 2 },
    { name: 'Remboursement patron', desc: 'Le patron peut rembourser lui-même', scope: 'Par bar', global: false, overrides: 3 },
    { name: 'Blacklist client', desc: 'Blocage numéros au niveau bar', scope: 'Par bar', global: false, overrides: 1 },
    { name: 'Multi-bar patron', desc: 'Un patron gère plusieurs bars', scope: 'Par patron', global: true, overrides: 5 },
    { name: 'WebSocket temps réel', desc: 'Notifications live barman', scope: 'Global', global: true, overrides: 0 },
    { name: 'Twint', desc: 'Paiement Twint (Suisse uniquement)', scope: 'Par bar', global: true, overrides: 0 },
  ];

  const admins = [
    { name: 'Admin QOff', email: 'admin@qoff.ch', role: 'Super Admin', status: 'active', last: 'à l’instant' },
    { name: 'Léa Fontaine', email: 'lea@qoff.ch', role: 'Support', status: 'active', last: 'il y a 1 h' },
    { name: 'Karim Haddad', email: 'karim@qoff.ch', role: 'Finance', status: 'active', last: 'il y a 3 h' },
    { name: 'Tobias Frei', email: 'tobias@qoff.ch', role: 'Tech', status: 'active', last: 'hier' },
    { name: 'Marco Bianchi', email: 'marco@qoff.ch', role: 'Support', status: 'inactive', last: 'il y a 24 j' },
  ];
  const roles = [
    { role: 'Super Admin', access: 'Tout — création admins, modification rôles', color: 'purple' },
    { role: 'Support', access: 'Clients, Transactions (lecture), Audit, Bars (lecture)', color: 'info' },
    { role: 'Finance', access: 'Commissions, Transactions, Export', color: 'ok' },
    { role: 'Tech', access: 'Santé services, Feature flags, Réglages', color: 'warn' },
  ];

  // 30-day CA series (current vs previous month) + per-country donut
  const caCurrent = [], caPrev = [];
  (function () { let s = 3; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 30; i++) { caCurrent.push(2600 + Math.round(r() * 2600 + i * 28)); caPrev.push(2200 + Math.round(r() * 2200 + i * 18)); } })();
  const caByCountry = [{ name: 'Suisse', v: 86, color: '#FF6B35' }, { name: 'France', v: 14, color: '#8B5CF6' }];

  // Sample patron back-office data (for impersonation) — Le Jetée
  const impMenu = [
    { cat: 'Bières', items: [
      { emoji: '🍺', name: 'Blonde pression 33cl', price: 6.5, stock: true, tags: [] },
      { emoji: '🍺', name: 'IPA artisanale', price: 8.0, stock: true, tags: ['Nouveau'] },
      { emoji: '🍺', name: 'Blanche citron', price: 7.0, stock: false, tags: [] },
    ] },
    { cat: 'Cocktails', items: [
      { emoji: '🍸', name: 'Spritz Aperol', price: 12.0, stock: true, tags: ['Happy Hour'] },
      { emoji: '🍹', name: 'Mojito', price: 13.0, stock: true, tags: [] },
    ] },
    { cat: 'Softs', items: [
      { emoji: '🥤', name: 'Limonade maison', price: 5.0, stock: true, tags: [] },
      { emoji: '💧', name: 'Eau pétillante 50cl', price: 4.0, stock: true, tags: [] },
    ] },
  ];
  const impLiveOrders = [
    { code: '4821', time: 'il y a 1 min', items: '2× Spritz · 1× Mojito', total: 37.0, status: 'preparing' },
    { code: '4820', time: 'il y a 3 min', items: '1× IPA · 1× Limonade', total: 13.0, status: 'ready' },
    { code: '4819', time: 'il y a 6 min', items: '4× Blonde', total: 26.0, status: 'preparing' },
    { code: '4818', time: 'il y a 9 min', items: '2× Mojito', total: 26.0, status: 'claimed' },
  ];

  // ----- Bar back-office: équipe -----
  const impTeam = [
    { id: 'T1', first: 'Sophie', last: 'Müller', name: 'Sophie Müller', role: 'Manager', email: 'sophie@jetee.ch', phone: '+41 79 412 33 21', status: 'active', since: '12 mars 2024', shifts: 142 },
    { id: 'T2', first: 'Lucas', last: 'Perret', name: 'Lucas Perret', role: 'Barman', email: 'lucas@jetee.ch', phone: '+41 78 220 11 04', status: 'active', since: '03 avr. 2024', shifts: 96 },
    { id: 'T3', first: 'Elena', last: 'Costa', name: 'Elena Costa', role: 'Barman', email: 'elena@jetee.ch', phone: '+41 76 884 52 19', status: 'active', since: '21 mai 2024', shifts: 71 },
    { id: 'T4', first: 'Maxime', last: 'Roch', name: 'Maxime Roch', role: 'Serveur', email: 'maxime@jetee.ch', phone: '+41 79 330 78 62', status: 'active', since: '14 juin 2024', shifts: 58 },
    { id: 'T5', first: 'Nadia', last: 'Benali', name: 'Nadia Benali', role: 'Cuisine', email: 'nadia@jetee.ch', phone: '+41 77 119 40 25', status: 'active', since: '02 juil. 2024', shifts: 44 },
    { id: 'T6', first: 'Tom', last: 'Favre', name: 'Tom Favre', role: 'Serveur', email: 'tom@jetee.ch', phone: '—', status: 'invited', since: 'il y a 2 j', shifts: 0 },
    { id: 'T7', first: 'Léa', last: 'Girard', name: 'Léa Girard', role: 'Barman', email: 'lea.g@jetee.ch', phone: '+41 78 552 09 71', status: 'off', since: '18 mars 2024', shifts: 88 },
  ];

  // ----- Bar back-office: historique des commandes (≈ 60 jours, filtrable) -----
  const ITEMS_POOL = [
    { name: 'Spritz Aperol', cat: 'Cocktails', price: 12 }, { name: 'Mojito', cat: 'Cocktails', price: 13 },
    { name: 'Blonde pression 33cl', cat: 'Bières', price: 6.5 }, { name: 'IPA artisanale', cat: 'Bières', price: 8 },
    { name: 'Limonade maison', cat: 'Softs', price: 5 }, { name: 'Eau pétillante 50cl', cat: 'Softs', price: 4 },
    { name: 'Verre de blanc', cat: 'Vins', price: 7 }, { name: 'Gin tonic', cat: 'Spiritueux', price: 14 },
    { name: 'Planche mixte', cat: 'Food', price: 18 }, { name: 'Glace artisanale', cat: 'Desserts', price: 6 },
  ];
  const impOrders = (function () {
    let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const out = []; let code = 4818;
    const chans = ['App', 'App', 'App', 'Comptoir'];
    const sts = [['success', 'claimed'], ['success', 'claimed'], ['success', 'claimed'], ['success', 'claimed'], ['refunded', 'cancelled'], ['partial', 'claimed']];
    for (let d = 0; d < 58; d++) {
      const day = new Date(2026, 5, 6 - d);
      const n = 4 + Math.floor(r() * 9); // commandes/jour
      for (let k = 0; k < n; k++) {
        const nItems = 1 + Math.floor(r() * 3);
        const items = []; let total = 0;
        for (let j = 0; j < nItems; j++) { const it = ITEMS_POOL[Math.floor(r() * ITEMS_POOL.length)]; const qty = 1 + Math.floor(r() * 3); items.push({ name: it.name, cat: it.cat, qty, price: it.price }); total += qty * it.price; }
        const st = sts[Math.floor(r() * sts.length)];
        const dt = new Date(day); dt.setHours(11 + Math.floor(r() * 12), Math.floor(r() * 60));
        out.push({ id: 'QO-' + (code--), date: dt, items, total: +total.toFixed(2), client: txNames[Math.floor(r() * txNames.length)], channel: chans[Math.floor(r() * chans.length)], psp: st[0], status: st[1] });
      }
    }
    return out.sort((a, b) => b.date - a.date);
  })();

  // ----- Bar back-office: statistiques (consommations, % par catégorie, perf/jour, tendances) -----
  const impStats = {
    catBreak: [
      { name: 'Cocktails', v: 34, ca: 4280, color: '#FF6B35', trend: 'up', d: '+6%' },
      { name: 'Bières', v: 26, ca: 3270, color: '#8B5CF6', trend: 'up', d: '+3%' },
      { name: 'Vins', v: 14, ca: 1760, color: '#3B82F6', trend: 'flat', d: '0%' },
      { name: 'Softs', v: 12, ca: 1510, color: '#1D9E75', trend: 'up', d: '+8%' },
      { name: 'Spiritueux', v: 8, ca: 1010, color: '#F59E0B', trend: 'down', d: '-2%' },
      { name: 'Food', v: 6, ca: 760, color: '#9E9B96', trend: 'up', d: '+4%' },
    ],
    topItems: [
      { name: 'Spritz Aperol', cat: 'Cocktails', qty: 218, ca: 2616, trend: 'up', d: '+12%' },
      { name: 'Mojito', cat: 'Cocktails', qty: 184, ca: 2392, trend: 'up', d: '+7%' },
      { name: 'Blonde pression 33cl', cat: 'Bières', qty: 312, ca: 2028, trend: 'flat', d: '+1%' },
      { name: 'IPA artisanale', cat: 'Bières', qty: 156, ca: 1248, trend: 'up', d: '+9%' },
      { name: 'Limonade maison', cat: 'Softs', qty: 142, ca: 710, trend: 'up', d: '+15%' },
      { name: 'Gin tonic', cat: 'Spiritueux', qty: 64, ca: 896, trend: 'down', d: '-4%' },
      { name: 'Verre de blanc', cat: 'Vins', qty: 98, ca: 686, trend: 'flat', d: '0%' },
      { name: 'Planche mixte', cat: 'Food', qty: 41, ca: 738, trend: 'up', d: '+5%' },
    ],
    // perf par jour (14 derniers jours) — CA & commandes
    daily: (function () { let s = 5; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
      const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; const out = [];
      for (let i = 13; i >= 0; i--) { const dt = new Date(2026, 5, 6 - i); const we = dt.getDay() === 5 || dt.getDay() === 6; out.push({ day: days[(dt.getDay() + 6) % 7], date: dt.getDate(), ca: Math.round((we ? 1500 : 900) + r() * 700), orders: Math.round((we ? 78 : 48) + r() * 28) }); }
      return out; })(),
    byHour: [4, 3, 6, 12, 28, 41, 38, 52, 64, 88, 79, 96, 72, 58], // 11h→24h
  };

  window.QData = {
    money, CHF, EUR, S, psp, ostat,
    countries, patrons, bars, pendingBars, clients, transactions, audit, services, incidents,
    categories, tvaMatrix, flags, admins, roles, caCurrent, caPrev, caByCountry,
    impMenu, impLiveOrders, impTeam, impOrders, impStats,
    NOW: new Date(2026, 5, 6),
    periodInfo, fmtDate, fmtTime, inPeriod,
  };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(d) { return pad(d.getDate()) + ' ' + MONTHS[d.getMonth()].slice(0, 4) + '. ' + d.getFullYear(); }
  function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function inPeriod(d, p) {
    p = p || { mode: 'today' };
    const N = new Date(2026, 5, 6);
    if (p.mode === 'today') return d.toDateString() === N.toDateString();
    if (p.mode === 'month') return d.getFullYear() === N.getFullYear() && d.getMonth() === N.getMonth();
    const from = new Date(p.from); from.setHours(0, 0, 0, 0);
    const to = new Date(p.to); to.setHours(23, 59, 59, 999);
    return d >= from && d <= to;
  }

  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function fmtDay(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 4) + '.'; }
  function periodInfo(p) {
    p = p || { mode: 'today' };
    if (p.mode === 'today') return { mult: 1 / 26, days: 1, label: "Aujourd'hui", prev: 'hier' };
    if (p.mode === 'month') return { mult: 1, days: 30, label: 'Mois en cours', prev: 'mois préc.' };
    const from = new Date(p.from), to = new Date(p.to);
    const days = Math.max(1, Math.round((to - from) / 86400000) + 1);
    return { mult: days / 30, days, label: fmtDay(from) + ' – ' + fmtDay(to), prev: 'période préc.' };
  }
})();
