/* QOff Back-Office Bar — app shell : login (rôle + PIN), sidebar par rôle, topbar,
   bar switcher (patron multi-bar), bandeau notification, bottom-nav mobile, routeur.
   L'état des commandes vit ici pour alimenter le badge "nouvelles" + le bandeau temps réel. */

const BD = window.BarData;

/* ---- Définition de la navigation (filtrée par rôle) ---- */
const PAGES = {
  orders:   { group: 'Service',   label: 'Commandes',        icon: 'pulse',       title: 'Commandes',             sub: '· En direct' },
  stock:    { group: 'Service',   label: 'Stock',            icon: 'box',         title: 'Stock & disponibilité', sub: 'Marquer épuisé' },
  stats:    { group: 'Analytics', label: 'Chiffres',         icon: 'dashboard',   title: 'Chiffres du jour',      sub: "Vue d'ensemble" },
  clusters: { group: 'Analytics', label: 'Analytics IA',     icon: 'sparkAdmin',  title: 'Analytics IA',          sub: 'Clusters automatiques' },
  menu:     { group: 'Gestion',   label: 'Menu & Prix',      icon: 'tag',         title: 'Menu & Prix',           sub: 'Prix & articles' },
  team:     { group: 'Gestion',   label: 'Équipe',           icon: 'team',        title: 'Équipe',                sub: 'Accès & délégation' },
  history:  { group: 'Gestion',   label: 'Historique',       icon: 'clock',       title: 'Historique',            sub: 'Toutes les commandes' },
  refunds:  { group: 'Gestion',   label: 'Remboursements',   icon: 'transfer',    title: 'Remboursements',        sub: 'Vue financière' },
  profile:  { group: 'Compte',    label: 'Profil',           icon: 'settings',    title: 'Profil & établissements', sub: 'Paramètres' },
};
const GROUP_ORDER = ['Service', 'Analytics', 'Gestion', 'Compte'];

/* ===================== LOGIN ===================== */
const ROLE_OPTIONS = [
  { id: 'barman',  ic: '🍺', name: 'Barman',          desc: 'Gestion des commandes en temps réel' },
  { id: 'manager', ic: '🔑', name: 'Manager délégué', desc: 'Droits étendus selon délégation' },
  { id: 'patron',  ic: '👑', name: 'Patron',          desc: 'Accès complet — analytics & gestion' },
];
function LoginBar({ onEnter }) {
  const [role, setRole] = useState('patron');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pin === '1234') onEnter(role);
    else { setErr(true); setTimeout(() => setErr(false), 500); }
  };
  return (
    <div className="qbar-login">
      <div className="glow-a" /><div className="glow-b" />
      <div className="qbar-login-box" style={err ? { animation: 'pop .3s' } : null}>
        <div className="qbar-login-logo">Q<em>Off</em></div>
        <div className="qbar-login-tag">Back-office bar · Because time is precious, QOff it!</div>
        <div className="qbar-login-card">
          <div className="qbar-login-lbl">Je me connecte en tant que</div>
          <div className="role-cards">
            {ROLE_OPTIONS.map(r => (
              <button key={r.id} className={'role-card' + (role === r.id ? ' sel' : '')} onClick={() => setRole(r.id)}>
                <span className="rc-ic">{r.ic}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="rc-name" style={{ display: 'block' }}>{r.name}</span>
                  <span className="rc-desc">{r.desc}</span>
                </span>
                <span className="rc-check">{role === r.id ? <Icon.check size={13} /> : null}</span>
              </button>
            ))}
          </div>
          <div className="qbar-login-lbl">Code PIN</div>
          <div className="pin-wrap">
            <input className="pin-inp" value={pin} inputMode="numeric" maxLength={4} placeholder="••••"
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
          </div>
          <Btn variant="or" full size="lg" onClick={submit}>Accéder &nbsp;→</Btn>
          <div className="qbar-login-hint"><Icon.info size={13} /> POC — Sélectionnez un rôle puis PIN&nbsp;: <b className="mono">1234</b></div>
        </div>
      </div>
    </div>
  );
}

/* ===================== SIDEBAR ===================== */
function BarSidebar({ page, onNav, user, newCount, onLogout, mobile }) {
  const visible = Object.keys(PAGES).filter(k => BD.canSee(user.role, k, user));
  const groups = GROUP_ORDER.map(g => ({ g, items: visible.filter(k => PAGES[k].group === g) })).filter(x => x.items.length);
  if (mobile) {
    const items = visible.slice(0, 5);
    return (
      <nav className="bottom-nav"><div className="bn-items">
        {items.map(k => (
          <button key={k} className={'bn-item' + (page === k ? ' on' : '')} onClick={() => onNav(k)}>
            {k === 'orders' && newCount > 0 && <span className="bn-badge">{newCount}</span>}
            {React.createElement(Icon[PAGES[k].icon], { size: 20 })}
            <span>{PAGES[k].label.split(' ')[0]}</span>
          </button>
        ))}
      </div></nav>
    );
  }
  return (
    <aside className="a-sidebar">
      <div className="a-sb-top">
        <div className="a-sb-logo"><Icon.spark size={16} /><span>Q<em>Off</em></span></div>
        <span className={'qbar-sb-roleline ' + user.role}>
          {user.role === 'patron' ? '👑' : user.role === 'manager' ? '🔑' : '🍺'} {user.roleLabel}
        </span>
      </div>
      <div className="a-sb-user">
        <span className={'a-sb-avatar qbar-sb-avatar ' + user.role}>{user.ini}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="nm">{user.name}</div>
          <div className="rl">En service depuis {user.since}</div>
        </div>
      </div>
      <nav className="a-sb-nav">
        {groups.map(({ g, items }) => (
          <div className="a-sb-group" key={g}>
            <div className="a-sb-grouplabel">{g}</div>
            {items.map(k => (
              <button key={k} className={'a-navitem' + (page === k ? ' active' : '')} onClick={() => onNav(k)}>
                <span className="ic">{React.createElement(Icon[PAGES[k].icon], { size: 18 })}</span>
                <span className="lb">{PAGES[k].label}</span>
                {k === 'orders' && newCount > 0 ? <span className="a-navbadge">{newCount}</span> : null}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="a-sb-foot">
        <button className="a-logout" onClick={onLogout}><Icon.logout size={18} /> Déconnexion</button>
      </div>
    </aside>
  );
}

/* ===================== BAR SWITCHER ===================== */
function BarSwitcher({ bars, current, onPick, onClosed }) {
  return (
    <div className="bar-switcher">
      <span className="sw-lbl">Mes bars</span>
      {bars.map(b => (
        <button key={b.id} className={'bar-pill' + (current.id === b.id ? ' on' : '')} onClick={() => onPick(b)}>
          {current.id === b.id ? null : <span className="bp-dot" />}{b.name}
          <span style={{ opacity: .55, fontWeight: 500 }}>· {b.city}</span>
        </button>
      ))}
      <button className="bar-pill closed" onClick={onClosed}><Icon.lock size={12} /> Clôturés ({BD.BARS_CLOSED.length})</button>
    </div>
  );
}

/* ===================== APP SHELL ===================== */
function BarApp({ role, onLogout }) {
  const user = BD.USERS[role];
  const [page, setPage] = useState('orders');
  const [bar, setBar] = useState(BD.BARS[0]);
  const [orders, setOrders] = useState(() => BD.liveOrders.map(o => ({ ...o })));
  const [notif, setNotif] = useState(null);
  const { toasts, push } = useToasts();
  const incomingIdx = useRef(0);
  const nextId = useRef(4822);

  const newCount = orders.filter(o => o.status === 'new').length;

  const simulate = useCallback(() => {
    const tpl = BD.incomingPool[incomingIdx.current % BD.incomingPool.length];
    incomingIdx.current++;
    const now = new Date();
    const hh = ('0' + now.getHours()).slice(-2), mm = ('0' + now.getMinutes()).slice(-2);
    const ord = {
      id: '#' + nextId.current++, code: tpl.code, time: hh + ':' + mm, elapsed: 0, status: 'new',
      items: tpl.items, note: tpl.note, phone: tpl.phone, channel: 'App', total: tpl.total, _new: true,
    };
    setOrders(o => [ord, ...o]);
    setNotif(ord);
    push('Nouvelle commande ' + ord.id, 'ok');
    setTimeout(() => setOrders(o => o.map(x => x.id === ord.id ? { ...x, _new: false } : x)), 600);
    setTimeout(() => setNotif(n => (n && n.id === ord.id ? null : n)), 6000);
  }, [push]);

  const ctx = {
    toast: push, user, bar, role,
    go: (p) => setPage(p),
    simulate,
  };

  const meta = PAGES[page];
  const isMultibar = role === 'patron' && BD.BARS.length > 1;

  /* actions topbar par page */
  let topActions = null;
  if (page === 'orders') topActions = <Btn variant="gh" size="sm" icon={<Icon.plus size={14} />} onClick={simulate}>Simuler commande</Btn>;
  else if (page === 'menu' && role !== 'barman') topActions = <span id="menu-topslot" />;
  else if (page === 'team') topActions = <span id="team-topslot" />;

  const content = () => {
    switch (page) {
      case 'orders':   return <OrdersModule ctx={ctx} orders={orders} setOrders={setOrders} />;
      case 'stock':    return <StockModule ctx={ctx} />;
      case 'stats':    return <StatsModule ctx={ctx} />;
      case 'clusters': return <ClustersModule ctx={ctx} />;
      case 'menu':     return <MenuModule ctx={ctx} />;
      case 'team':     return <TeamModule ctx={ctx} />;
      case 'history':  return <HistoryModule ctx={ctx} />;
      case 'refunds':  return <RefundsModule ctx={ctx} />;
      case 'profile':  return <ProfileModule ctx={ctx} />;
      default:         return null;
    }
  };

  return (
    <div className="a-shell">
      <BarSidebar page={page} onNav={setPage} user={user} newCount={newCount} onLogout={onLogout} />
      <div className="a-main">
        <div className="a-topbar">
          <div>
            <div className="ttl">{meta.title}
              {page === 'orders' ? <span className="sub" style={{ marginLeft: 8 }}>{bar.name} · <span className="qbar-live-dot"><span className="pulse-dot" style={{ background: '#1D9E75' }} /> En direct</span></span> : null}
            </div>
            {page !== 'orders' ? <div className="sub">{meta.sub}</div> : null}
          </div>
          <div className="a-topbar-actions">
            {topActions}
            <button className="iconbtn" title="Notifications" style={{ position: 'relative' }} onClick={() => setPage('orders')}>
              <Icon.bell size={18} />
              {newCount > 0 && <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 14, height: 14, padding: '0 3px', borderRadius: 9, background: 'var(--or)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{newCount}</span>}
            </button>
          </div>
        </div>

        {isMultibar && <BarSwitcher bars={BD.BARS} current={bar} onPick={(b) => { setBar(b); push('Bar actif — ' + b.name, 'info'); }} onClosed={() => { setPage('profile'); push('Établissements clôturés — lecture seule', 'info'); }} />}

        {notif && (
          <div className="notif-banner">
            <span className="pulse-dot" />
            <span>Nouvelle commande <b>{notif.id}</b> — {notif.items.reduce((s, i) => s + i.qty, 0)} article(s) · {QData.CHF(notif.total)}</span>
            <button className="nb-close" onClick={() => setNotif(null)}><Icon.x size={14} /></button>
          </div>
        )}

        <div className="a-content"><div className="a-content-inner">{content()}</div></div>
        <ToastHost toasts={toasts} />
      </div>
      <BarSidebar mobile page={page} onNav={setPage} user={user} newCount={newCount} />
    </div>
  );
}

/* ===================== ROOT ===================== */
function RootBar() {
  const [role, setRole] = useState(null);
  return (
    <div className="qadmin qbar" style={{ height: '100vh', width: '100vw' }}>
      {role
        ? <BarApp role={role} onLogout={() => setRole(null)} />
        : <LoginBar onEnter={setRole} />}
    </div>
  );
}
window.RootBar = RootBar;
