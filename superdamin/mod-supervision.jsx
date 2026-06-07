/* QOff Super Admin — Supervision modules: Dashboard, Santé services, Audit trail */
const QD = window.QData;

/* ============================ DASHBOARD ============================ */
function ModDashboard({ ctx }) {
  const D = QD;
  const [period, setPeriod] = useState({ mode: 'today' });
  useEffect(() => { ctx.setTopActions(<PeriodPicker value={period} onChange={setPeriod} />); return () => ctx.setTopActions(null); }, [period]);
  const pi = D.periodInfo(period);
  const r = (n) => Math.round(n).toLocaleString('fr-CH');
  const activeBars = D.bars.filter(b => b.status === 'active' || b.status === 'trial');
  const caBase = D.bars.reduce((s, b) => s + b.ca, 0);
  const commBase = D.bars.reduce((s, b) => s + b.ca * b.comm / 100, 0);
  const ordersBase = D.bars.reduce((s, b) => s + b.o7, 0) / 7 * 30;
  const caMonth = caBase * pi.mult, commTotal = commBase * pi.mult, orders = ordersBase * pi.mult;
  const top = [...activeBars].sort((a, b) => b.ca - a.ca).slice(0, 5);

  const alerts = [
    { tone: 'er', dot: '🔴', label: 'Bars en attente de validation', n: D.pendingBars.length, cta: 'Valider', go: () => ctx.go('bars', { pending: true }) },
    { tone: 'warn', dot: '🟡', label: 'Bars en risque de churn', n: 2, cta: 'Voir', go: () => ctx.go('bars', { churn: true }) },
    { tone: 'or', dot: '🟠', label: 'Incidents non résolus', n: 3, cta: 'Traiter', go: () => ctx.go('health') },
    { tone: 'info', dot: '🔵', label: 'Réclamations clients en attente', n: 4, cta: 'Traiter', go: () => ctx.go('transactions') },
  ];

  return (
    <div className="a-content-inner">
      <div className="kpi-row">
        <KPI label={'CA plateforme · ' + pi.label} cur="CHF" value={r(caMonth)} delta={'+12,4 % vs ' + pi.prev} dir="up" />
        <KPI label={'Commissions QOff · ' + pi.label} cur="CHF" value={r(commTotal)} delta={'+11,8 % vs ' + pi.prev} dir="up" />
        <KPI label="Bars actifs" value={activeBars.length} delta="+3 nouveaux ce mois" dir="up" />
        <KPI label={'Commandes · ' + pi.label} value={r(orders)} delta={'+6,2 % vs ' + pi.prev} dir="up" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, marginBottom: 18 }}>
        <div className="card">
          <div className="card-h"><h3>Activité plateforme</h3><span className="grow" />
            <span className="lbl" style={{ display: 'flex', gap: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 3, background: 'var(--or)', borderRadius: 2 }} />Ce mois</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 3, background: 'var(--g300,#D6D1C8)', borderRadius: 2 }} />Mois préc.</span>
            </span>
          </div>
          <div className="card-pad"><div className="lbl" style={{ marginBottom: 8 }}>CA journalier · 30 jours (CHF)</div><LineChart a={D.caCurrent} b={D.caPrev} h={186} /></div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Répartition par pays</h3></div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Donut data={D.caByCountry} />
            <div style={{ width: '100%' }}>
              {D.caByCountry.map(c => <div key={c.name} className="kv"><span className="k" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />{c.name}</span><span className="v">{c.v} %</span></div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="sec">
        <SectionHead title="Alertes & actions requises" sub="Cliquez une alerte pour ouvrir le module concerné" />
        <div className="grid2">
          {alerts.map((a, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
              <span style={{ fontSize: 18 }}>{a.dot}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.label}</div>
                <div className="cell-sub">{a.n} élément{a.n > 1 ? 's' : ''} à traiter</div>
              </div>
              <Badge tone={a.tone}>{a.n}</Badge>
              <Btn variant="gh" size="sm" onClick={a.go}>{a.cta}</Btn>
            </div>
          ))}
        </div>
      </div>

      <div className="sec">
        <SectionHead title="Top bars" sub="Les 5 établissements les plus actifs ce mois" action={<Btn variant="gh" size="sm" icon={<Icon.arrowRight size={14} />} onClick={() => ctx.go('bars')}>Tous les bars</Btn>} />
        <div className="tablewrap">
          <table className="grid">
            <thead><tr><th>Bar</th><th className="r">CA mois</th><th className="r">Commandes</th><th className="r">Panier moy.</th><th className="r">Tendance</th></tr></thead>
            <tbody>
              {top.map(b => (
                <tr key={b.id} className="clk" onClick={() => ctx.go('bars')}>
                  <td><div className="cell-strong">{b.flag} {b.name}</div><div className="cell-sub">{b.city}</div></td>
                  <td className="r mono cell-strong">{QD.money(b.ca, b.country === 'FR' ? 'EUR' : 'CHF')}</td>
                  <td className="r mono">{b.o7}</td>
                  <td className="r mono">{QD.money(b.basket, b.country === 'FR' ? 'EUR' : 'CHF')}</td>
                  <td className="r">{b.trend === 'up' ? <span style={{ color: 'var(--ok)' }}><Icon.trendUp size={17} /></span> : b.trend === 'down' ? <span style={{ color: 'var(--er)' }}><Icon.trendDown size={17} /></span> : <span style={{ color: 'var(--g400)' }}>→</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sec">
        <SectionHead title="Santé services — résumé" action={<Btn variant="gh" size="sm" icon={<Icon.arrowRight size={14} />} onClick={() => ctx.go('health')}>Voir détails</Btn>} />
        <div className="card card-pad" style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
          {D.services.map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <HealthDot state={s.state} />
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div><div className="cell-sub">{s.state === 'ok' ? 'Opérationnel' : s.state === 'warn' ? 'Dégradé' : 'Hors service'} · {s.latency} ms</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================ SANTÉ SERVICES ============================ */
function ModHealth({ ctx }) {
  const [filt, setFilt] = useState('all');
  const inc = QD.incidents.filter(i => filt === 'all' ? true : i.status === filt);
  const stLabel = { open: 'Ouvert', progress: 'En cours', resolved: 'Résolu' };
  const stTone = { open: 'er', progress: 'warn', resolved: 'ok' };
  return (
    <div className="a-content-inner">
      <div className="sec">
        <SectionHead title="Services monitorés" sub="Statut temps réel · vérification continue" />
        <div className="grid3">
          {QD.services.map(s => {
            const I = Icon[s.icon] || Icon.server;
            return (
              <div key={s.name} className="card card-pad">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--g600)' }}><I size={18} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div><div className="cell-sub">{s.desc}</div></div>
                  <HealthDot state={s.state} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge tone={s.state === 'ok' ? 'ok' : s.state === 'warn' ? 'warn' : 'er'} dot>{s.state === 'ok' ? 'Opérationnel' : s.state === 'warn' ? 'Dégradé' : 'Hors service'}</Badge>
                  <Btn variant="gh" size="sm" onClick={() => ctx.toast('Test « ' + s.name +' » lancé · ' + s.latency + ' ms', 'info')}>Tester</Btn>
                </div>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span className="cell-sub">Latence <b className="mono" style={{ color: 'var(--g800)' }}>{s.latency} ms</b></span>
                  <span className="cell-sub">Uptime <b className="mono" style={{ color: 'var(--g800)' }}>{s.uptime}</b></span>
                </div>
                <div className="cell-sub" style={{ marginTop: 6 }}>Dernière vérif. {s.last}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sec">
        <SectionHead title="Journal des incidents" sub="Trié anti-chronologique" action={
          <div className="tabs">{['all', 'open', 'progress', 'resolved'].map(t => <button key={t} className={filt === t ? 'active' : ''} onClick={() => setFilt(t)}>{t === 'all' ? 'Tous' : stLabel[t]}</button>)}</div>
        } />
        <div className="tablewrap">
          <table className="grid">
            <thead><tr><th>Date / heure</th><th>Service</th><th>Type</th><th>Bar concerné</th><th>Détail</th><th>Statut</th><th className="r">Actions</th></tr></thead>
            <tbody>
              {inc.map((i, k) => (
                <tr key={k}>
                  <td className="mono cell-sub">{i.time}</td>
                  <td><Badge tone={i.kind === 'er' ? 'er' : 'warn'}>{i.service}</Badge></td>
                  <td className="cell-strong">{i.type}</td>
                  <td>{i.bar === '—' ? <span className="cell-sub">—</span> : i.bar}</td>
                  <td className="cell-sub" style={{ maxWidth: 220 }}>{i.detail}</td>
                  <td><Badge tone={stTone[i.status]} dot={i.status !== 'resolved'}>{stLabel[i.status]}</Badge></td>
                  <td className="r">
                    {i.status !== 'resolved'
                      ? <Btn variant="gh" size="sm" onClick={() => ctx.toast('Incident marqué résolu', 'ok')}>Marquer résolu</Btn>
                      : <Btn variant="gh" size="sm" onClick={() => ctx.toast('Détail incident', 'info')}>Voir</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================ AUDIT TRAIL ============================ */
function ModAudit({ ctx }) {
  const [admin, setAdmin] = useState('Tous');
  const [type, setType] = useState('Tous');
  const [period, setPeriod] = useState({ mode: 'today' });
  useEffect(() => { ctx.setTopActions(<PeriodPicker value={period} onChange={setPeriod} />); return () => ctx.setTopActions(null); }, [period]);
  const pi = QD.periodInfo(period);
  const loggedCount = Math.max(3, Math.round(248 * pi.mult));
  const admins = ['Tous', ...Array.from(new Set(QD.audit.map(a => a.admin)))];
  const rows = QD.audit.filter(a => (admin === 'Tous' || a.admin === admin) && (type === 'Tous' || a.kind === type));
  const dotCls = { danger: 'er', create: 'ok', admin: 'purple', read: '' };
  return (
    <div className="a-content-inner">
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <KPI label={'Actions loggées · ' + pi.label} value={loggedCount} />
        <KPI label="Admins actifs" value="4" />
        <KPI label="Dernière action" value="à l’instant" />
      </div>
      <div style={{ background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16, fontSize: 12.5, color: 'var(--g600)' }}>
        <Icon.lock size={15} /> Ce journal est <b style={{ color: 'var(--g800)', margin: '0 3px' }}>immuable et certifié</b> — append-only, aucune entrée ne peut être modifiée ou supprimée.
      </div>
      <div className="toolbar">
        <span className="lbl" style={{ alignSelf: 'center' }}>Filtrer</span>
        <Select value={admin} onChange={setAdmin} options={admins} />
        <Select value={type} onChange={setType} options={[{ value: 'Tous', label: 'Tous types' }, { value: 'create', label: 'Création' }, { value: 'danger', label: 'Destructif' }, { value: 'admin', label: 'Admin' }]} />
        <span className="spacer" />
        <Btn variant="gh" size="sm" icon={<Icon.download size={14} />} onClick={() => ctx.toast('Export du journal lancé', 'info')}>Exporter</Btn>
      </div>
      <div className="card card-pad">
        <div className="timeline">
          {rows.map((a, i) => (
            <div className="tl-item" key={i}>
              <span className={'tl-dot ' + (dotCls[a.kind] || '')} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>
                    <b>{a.admin}</b> <Badge tone={a.role === 'Super Admin' ? 'admin' : 'plain'}>{a.role}</Badge>
                    <code style={{ fontFamily: 'var(--ff)', background: 'var(--g100)', padding: '2px 7px', borderRadius: 6, fontSize: 12, marginLeft: 6, color: 'var(--g800)', fontWeight: 600 }}>{a.type}</code>
                    {a.type.includes('impersonate') ? <Badge tone="admin">[via admin]</Badge> : null}
                  </div>
                  <div className="tl-txt">{a.entity} · <span style={{ color: 'var(--g600)' }}>{a.diff}</span></div>
                  <div className="tl-time">{a.time} · IP {a.ip}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ModDashboard, ModHealth, ModAudit });
