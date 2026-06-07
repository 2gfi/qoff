/* QOff Super Admin — app shell, navigation, router, login */

const NAV = [
  { group: 'Supervision', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', title: 'Dashboard', sub: 'Vue globale plateforme' },
    { id: 'health', label: 'Santé services', icon: 'health', title: 'Santé services', sub: 'Monitoring temps réel', badge: 2 },
    { id: 'audit', label: 'Audit trail', icon: 'audit', title: 'Audit trail', sub: 'Journal immuable des actions admin' },
  ] },
  { group: 'Établissements', items: [
    { id: 'bars', label: 'Bars', icon: 'store', title: 'Bars', sub: 'Gestion des établissements', badge: 2 },
    { id: 'patrons', label: 'Patrons', icon: 'patrons', title: 'Patrons', sub: 'Comptes B2B' },
    { id: 'countries', label: 'Pays & Config', icon: 'globe2', title: 'Pays & Internationalisation', sub: 'Configuration globale par pays' },
  ] },
  { group: 'Données', items: [
    { id: 'clients', label: 'Clients', icon: 'client', title: 'Clients', sub: 'Données personnelles — accès restreint' },
    { id: 'transactions', label: 'Transactions', icon: 'transactions', title: 'Transactions', sub: 'Toutes les transactions plateforme' },
    { id: 'commissions', label: 'Commissions', icon: 'commissions', title: 'Commissions', sub: 'Finances plateforme' },
  ] },
  { group: 'Configuration', items: [
    { id: 'categories', label: 'Bibliothèque catégories', icon: 'box', title: 'Bibliothèque catégories', sub: 'Référentiel global partagé' },
    { id: 'flags', label: 'Feature flags', icon: 'flags', title: 'Feature flags', sub: 'Activation par bar ou patron' },
    { id: 'settings', label: 'Réglages plateforme', icon: 'settings', title: 'Réglages', sub: 'Configuration globale QOff' },
  ] },
  { group: 'Équipe', items: [
    { id: 'admins', label: 'Comptes admin', icon: 'shield', title: 'Équipe QOff', sub: 'Gestion des accès internes' },
  ] },
];
const MODCOMP = {
  dashboard: 'ModDashboard', health: 'ModHealth', audit: 'ModAudit',
  bars: 'ModBars', patrons: 'ModPatrons', countries: 'ModCountries',
  clients: 'ModClients', transactions: 'ModTransactions', commissions: 'ModCommissions',
  categories: 'ModCategories', flags: 'ModFlags', settings: 'ModSettings', admins: 'ModAdmins',
};
const META = {}; NAV.forEach(g => g.items.forEach(it => META[it.id] = it));

function Sidebar({ active, onNav, imp }) {
  return (
    <aside className="a-sidebar">
      <div className="a-sb-top">
        <div className="a-sb-logo"><Icon.spark size={17} className="" /><span>Q<em>Off</em></span></div>
        <span className="a-sb-adminbadge"><Icon.sparkAdmin size={12} /> Super Admin Console</span>
      </div>
      <div className="a-sb-user">
        <span className="a-sb-avatar">AQ</span>
        <div><div className="nm">Admin QOff</div><div className="rl">Accès total</div></div>
      </div>
      <nav className="a-sb-nav">
        {NAV.map(g => (
          <div className="a-sb-group" key={g.group}>
            <div className="a-sb-grouplabel">{g.group}</div>
            {g.items.map(it => (
              <button key={it.id} className={'a-navitem' + (active === it.id && !imp ? ' active' : '')} onClick={() => onNav(it.id)}>
                <span className="ic">{React.createElement(Icon[it.icon], { size: 18 })}</span>
                <span className="lb">{it.label}</span>
                {it.badge ? <span className="a-navbadge">{it.badge}</span> : null}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="a-sb-foot">
        <button className="a-logout" onClick={() => onNav('__logout')}><Icon.logout size={18} /> Déconnexion</button>
      </div>
    </aside>
  );
}

function AdminApp({ initialModule = 'dashboard', initialImpersonation }) {
  const [module, setModule] = useState(initialModule);
  const [imp, setImp] = useState(initialImpersonation || null);
  const [topActions, setTopActions] = useState(null);
  const { toasts, push } = useToasts();

  const ctx = {
    toast: push,
    go: (id) => { setImp(null); setTopActions(null); setModule(id); },
    impersonate: (bar) => { setTopActions(null); setImp(bar); push('Mode gestion ouvert — ' + bar.name + ' [via admin]', 'purple'); },
    setTopActions,
  };
  const exitImp = () => { push('Mode gestion fermé', 'info'); setImp(null); };

  const meta = META[module] || META.dashboard;
  const Comp = window[MODCOMP[module]] || window.ModDashboard;
  const title = imp ? 'Mode gestion — ' + imp.name : meta.title;
  const sub = imp ? imp.flag + ' ' + imp.city + ' · back-office patron' : meta.sub;

  return (
    <div className="a-shell">
      <Sidebar active={module} imp={!!imp} onNav={(id) => { if (id === '__logout') { push('Déconnexion…', 'info'); return; } ctx.go(id); }} />
      <div className="a-main">
        <div className="a-topbar">
          <div><div className="ttl">{title}</div><div className="sub">{sub}</div></div>
          <div className="a-topbar-actions">
            {!imp && topActions}
            <button className="iconbtn" title="Notifications" style={{ position: 'relative' }}><Icon.bell size={18} /><span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 9, background: 'var(--or)', border: '2px solid #fff' }} /></button>
          </div>
        </div>
        {imp && (
          <div className="a-imp-banner">
            <span className="eye"><Icon.eye size={16} /></span>
            <span>Mode gestion — <b>{imp.name}</b> · {imp.city}</span>
            <span className="a-imp-legend">
              <span className="lg"><span className="sw" style={{ background: 'var(--or)' }} /> Action patron</span>
              <span className="lg"><span className="sw" style={{ background: 'var(--purple)' }} /> Action Super Admin</span>
            </span>
            <span className="spacer" />
            <Btn variant="gh" size="sm" icon={<Icon.x size={14} />} onClick={exitImp}>Quitter</Btn>
          </div>
        )}
        <div className="a-content">
          {imp ? <ModImpersonation ctx={ctx} bar={imp} /> : <Comp ctx={ctx} />}
        </div>
        <ToastHost toasts={toasts} />
      </div>
    </div>
  );
}

function LoginScreen({ onEnter }) {
  const [shake, setShake] = useState(false);
  const enter = () => { if (onEnter) { onEnter(); } else { setShake(true); setTimeout(() => setShake(false), 320); } };
  return (
    <div style={{ height: '100%', width: '100%', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.18), transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: '-25%', left: '-5%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,.12), transparent 70%)' }} />
      <div style={{ width: 380, position: 'relative', animation: shake ? 'pop .3s' : 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontFamily: 'var(--ff-title)', fontWeight: 800, fontSize: 34, letterSpacing: '-.02em', color: '#fff' }}>Q<span style={{ color: 'var(--or)' }}>Off</span></div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '5px 12px', borderRadius: 100, background: 'rgba(139,92,246,.16)', color: '#C7B3FF', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}><Icon.sparkAdmin size={13} /> Super Admin Console</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: 26, boxShadow: '0 24px 60px rgba(0,0,0,.4)' }}>
          <Field label="Email"><Input defaultValue="admin@qoff.ch" placeholder="vous@qoff.ch" /></Field>
          <Field label="Mot de passe"><Input type="password" defaultValue="1234" /></Field>
          <Btn variant="purple" full size="lg" style={{ marginTop: 6 }} onClick={enter}>Accéder à la console</Btn>
          <div style={{ marginTop: 16, padding: '9px 12px', borderRadius: 9, background: 'var(--g50)', border: '1px solid var(--g200)', fontSize: 11.5, color: 'var(--g600)', textAlign: 'center' }}>
            <Icon.info size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} /> POC · <span className="mono">admin@qoff.ch</span> / <span className="mono">1234</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,.32)', fontSize: 11.5 }}>Because time is precious, QOff it!</div>
      </div>
    </div>
  );
}

window.AdminApp = AdminApp;
window.LoginScreen = LoginScreen;

/* Full-screen navigable build: login → console */
function RootApp() {
  const [entered, setEntered] = useState(false);
  return (
    <div className="qadmin" style={{ height: '100vh', width: '100vw' }}>
      {entered ? <AdminApp initialModule="dashboard" /> : <LoginScreen onEnter={() => setEntered(true)} />}
    </div>
  );
}
window.RootApp = RootApp;
