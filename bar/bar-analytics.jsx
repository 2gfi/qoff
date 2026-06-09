/* QOff Back-Office Bar — Analytics : Dashboard (Chiffres), Clusters IA, Heatmap. */

function DeltaBar({ trend, d }) {
  return <span className={'delta-chip ' + (trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'flat')}>
    {trend === 'up' ? <Icon.trendUp size={12} /> : trend === 'down' ? <Icon.trendDown size={12} /> : null}{d}
  </span>;
}
function DayBarsBar({ data }) {
  const max = Math.max(...data.map(d => d.ca));
  return (
    <div className="daybars">
      {data.map((d, i) => (
        <div key={i} className="daybar-col" title={QData.CHF(d.ca) + ' · ' + d.orders + ' cmd'}>
          <div className="daybar-val">{(d.ca / 1000).toFixed(1)}k</div>
          <div className="daybar-track"><div className="daybar-fill" style={{ height: Math.max(4, d.ca / max * 100) + '%' }} /></div>
          <div className="daybar-day">{d.day}<span>{d.date}</span></div>
        </div>
      ))}
    </div>
  );
}

/* ===================== CHIFFRES (Dashboard) ===================== */
/* Période façon Google Analytics : presets + plage de dates personnalisée (calendrier). */
const ANALYTICS_NOW = QData.NOW;
function caForDay(d) {
  const we = d.getDay() === 5 || d.getDay() === 6;
  const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  let r = (Math.sin(seed) * 10000) % 1; if (r < 0) r += 1;
  return Math.round((we ? 1480 : 940) + r * 660);
}
function datesForPeriod(p) {
  const out = [];
  if (p.mode === 'range' && p.from) {
    let d = new Date(p.from); const end = new Date(p.to || p.from); d.setHours(0, 0, 0, 0); end.setHours(0, 0, 0, 0);
    while (d <= end) { out.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return out;
  }
  const n = p.mode === 'today' ? 1 : p.mode === '7d' ? 7 : p.mode === '30d' ? 30 : ANALYTICS_NOW.getDate();
  for (let i = n - 1; i >= 0; i--) out.push(new Date(ANALYTICS_NOW.getFullYear(), ANALYTICS_NOW.getMonth(), ANALYTICS_NOW.getDate() - i));
  return out;
}
function computeStats(p) {
  const dates = datesForPeriod(p);
  const ca = dates.reduce((s, d) => s + caForDay(d), 0);
  const orders = dates.reduce((s, d) => s + Math.round(caForDay(d) / 14.8), 0);
  // période précédente (même longueur, juste avant) pour le delta
  const span = dates.length;
  const prevStart = new Date(dates[0]); prevStart.setDate(prevStart.getDate() - span);
  let prevCa = 0; for (let i = 0; i < span; i++) { const d = new Date(prevStart); d.setDate(d.getDate() + i); prevCa += caForDay(d); }
  const delta = prevCa ? Math.round((ca - prevCa) / prevCa * 100) : 0;
  const monthRef = (function () { let s = 0; for (let i = 0; i < 30; i++) { const d = new Date(ANALYTICS_NOW); d.setDate(d.getDate() - i); s += caForDay(d); } return s; })();
  const mult = ca / monthRef;
  const avg = orders ? ca / orders : 0;
  const peak = span === 1 ? '20h–21h' : 'Vendredi';
  const label = span === 1 ? (p.mode === 'today' ? "Aujourd'hui" : QData.fmtDate(dates[0]))
    : QData.fmtDate(dates[0]) + ' → ' + QData.fmtDate(dates[span - 1]);
  return { dates, ca, orders, avg, delta, mult, peak, span, label };
}
function AnalyticsPeriod({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value.from ? new Date(value.from) : null);
  const [to, setTo] = useState(value.to ? new Date(value.to) : null);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const presets = [['today', "Aujourd'hui"], ['7d', '7 jours'], ['30d', '30 jours'], ['month', 'Ce mois']];
  const rangeLabel = value.mode === 'range' && value.from
    ? QData.fmtDate(new Date(value.from)) + ' → ' + QData.fmtDate(new Date(value.to || value.from))
    : 'Personnalisé';
  return (
    <div className="ga-period" ref={ref}>
      <div className="ga-presets">
        {presets.map(([k, l]) => <button key={k} className={value.mode === k ? 'on' : ''} onClick={() => onChange({ mode: k })}>{l}</button>)}
      </div>
      <button className={'ga-range-btn' + (value.mode === 'range' ? ' on' : '')} onClick={() => setOpen(o => !o)}>
        <Icon.calendar size={14} />{rangeLabel}<Icon.chevDown size={12} />
      </button>
      {open && (
        <div className="ga-pop">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--g400)', marginBottom: 8 }}>Choisir une plage</div>
          <MiniCalendar from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
          <div style={{ fontSize: 11.5, color: 'var(--g600)', margin: '8px 2px 0', minHeight: 16 }}>
            {from ? (QData.fmtDate(from) + (to ? ' → ' + QData.fmtDate(to) : ' → …')) : 'Cliquez une date de début puis de fin.'}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button className="btn gh sm" style={{ flex: 1 }} onClick={() => setOpen(false)}>Annuler</button>
            <button className="btn or sm" style={{ flex: 1 }} disabled={!from} onClick={() => { onChange({ mode: 'range', from: +from, to: +(to || from) }); setOpen(false); }}>Appliquer</button>
          </div>
        </div>
      )}
    </div>
  );
}
function StatsModule({ ctx }) {
  const [period, setPeriod] = useState({ mode: 'today' });
  const st = QData.impStats;
  const D = computeStats(period);
  const mult = D.mult;
  const prevLabel = period.mode === 'range' ? 'période préc.' : period.mode === 'today' ? 'hier' : period.mode === '7d' ? '7j préc.' : period.mode === '30d' ? '30j préc.' : 'mois préc.';
  const up = D.delta >= 0;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
        <AnalyticsPeriod value={period} onChange={setPeriod} />
        <Btn variant="gh" size="sm" icon={<Icon.download size={14} />} onClick={() => ctx.toast('Export CSV généré', 'ok')}>Exporter</Btn>
      </div>
      <div className="ga-compare" style={{ marginBottom: 16 }}><Icon.calendar size={13} /> {D.label} · {D.span} jour{D.span > 1 ? 's' : ''} — comparé à la {prevLabel}</div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="k-lbl">Chiffre d'affaires</div>
          <div className="k-val"><span className="cur">CHF</span>{Math.round(D.ca).toLocaleString('fr-CH')}</div>
          <div className={'k-delta ' + (up ? 'up' : 'down')}>{up ? <Icon.trendUp size={14} /> : <Icon.trendDown size={14} />}{up ? '+' : ''}{D.delta}% vs {prevLabel}</div>
        </div>
        <div className="kpi">
          <div className="k-lbl">Commandes</div>
          <div className="k-val">{D.orders.toLocaleString('fr-CH')}</div>
          <div className={'k-delta ' + (up ? 'up' : 'down')}>{up ? <Icon.trendUp size={14} /> : <Icon.trendDown size={14} />}{up ? '+' : ''}{Math.round(D.delta * 0.8)}% vs {prevLabel}</div>
        </div>
        <div className="kpi">
          <div className="k-lbl">Panier moyen</div>
          <div className="k-val"><span className="cur">CHF</span>{D.avg.toFixed(2)}</div>
          <div className="k-delta">{Math.abs(D.delta) < 3 ? 'Stable' : (up ? '+2%' : '−1%')}</div>
        </div>
        <div className="kpi">
          <div className="k-lbl">{D.span === 1 ? 'Heure de pointe' : 'Jour le plus chargé'}</div>
          <div className="k-val" style={{ fontSize: 22 }}>{D.peak}</div>
          <div className="k-delta"><Icon.clock size={13} /> moment le plus chargé</div>
        </div>
      </div>

      <div className="grid2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-h"><h3>CA par catégorie</h3><span className="grow" /><span className="cell-sub">% du CA</span></div>
          <div className="card-pad" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Donut data={st.catBreak} size={128} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {st.catBreak.map(c => (
                <div key={c.name} className="statlist-row">
                  <span className="sw" style={{ background: c.color }} />
                  <span className="lab">{c.name}</span>
                  <span className="cell-sub mono">{QData.CHF(Math.round(c.ca * mult))}</span>
                  <span className="mono" style={{ fontWeight: 700, width: 32, textAlign: 'right' }}>{c.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>Affluence par heure</h3><span className="grow" /><span className="cell-sub">commandes</span></div>
          <div className="card-pad">
            <div className="hourbars">
              {st.byHour.map((v, i) => { const max = Math.max(...st.byHour); return <div key={i} className="hourbar"><div className="hourbar-fill" style={{ background: v === max ? 'var(--or)' : '#FFC4A8', height: Math.max(3, v / max * 100) + '%' }} /><span>{11 + i}</span></div>; })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--g600)' }}>
              <span>Pic <b style={{ color: 'var(--g800)' }}>21h–22h</b></span>
              <span>Creux <b style={{ color: 'var(--g800)' }}>11h–12h</b></span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Performance par jour</h3><span className="grow" /><span className="cell-sub">CA · 14 derniers jours</span></div>
        <div className="card-pad"><DayBarsBar data={st.daily} /></div>
      </div>

      <div className="sec">
        <SectionHead title="Top articles" sub="Articles les plus vendus sur la période" />
        <div className="tablewrap">
          <table className="grid">
            <thead><tr><th>Article</th><th>Catégorie</th><th className="r">Quantité</th><th className="r">CA</th><th className="r">Tendance</th></tr></thead>
            <tbody>
              {st.topItems.slice(0, 6).map((it, i) => (
                <tr key={it.name}>
                  <td><div className="row-id"><span className="pos-chip mono">{i + 1}</span><span className="cell-strong">{it.name}</span></div></td>
                  <td><Badge tone="plain">{it.cat}</Badge></td>
                  <td className="r mono cell-strong">{Math.round(it.qty * mult)}</td>
                  <td className="r mono">{QData.CHF(Math.round(it.ca * mult))}</td>
                  <td className="r"><DeltaBar trend={it.trend} d={it.d} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== ANALYTICS IA (Clusters + Heatmap) ===================== */
function ClustersModule({ ctx }) {
  const [tab, setTab] = useState('clusters');
  return (
    <div>
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button className={tab === 'clusters' ? 'active' : ''} onClick={() => setTab('clusters')}>Clusters clients</button>
        <button className={tab === 'heatmap' ? 'active' : ''} onClick={() => setTab('heatmap')}>Heatmap affluence</button>
      </div>

      {tab === 'clusters' && (
        <div>
          <div className="card card-pad" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start', borderLeft: '4px solid var(--or)' }}>
            <span style={{ width: 36, height: 36, flex: '0 0 36px', borderRadius: 10, background: 'var(--orl)', color: 'var(--or)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.sparkAdmin size={18} /></span>
            <div>
              <div style={{ fontFamily: 'var(--ff-title)', fontWeight: 700, fontSize: 14 }}>5 segments détectés automatiquement</div>
              <div className="cell-sub" style={{ marginTop: 2 }}>L’IA regroupe vos clients selon leurs habitudes de consommation. Sans aucune donnée personnelle nominative.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 12 }}>
            {BarData.clusters.map(c => (
              <div key={c.name} className="cluster-card" style={{ borderLeftColor: c.color }}>
                <div className="cc-hd">
                  <div className="cc-name"><span className="cc-emoji" style={{ background: c.color + '22', color: c.color }}>{c.emoji}</span>{c.name}</div>
                </div>
                <div className="cc-insight">{c.insight}</div>
                <div className="cc-items" style={{ marginTop: 11 }}>{c.items.map(it => <span key={it} className="cc-item-pill">{it}</span>)}</div>
                <div className="cc-stats">
                  {c.stats.map(([v, l]) => <div key={l} className="cc-stat"><div className="cc-stat-val">{v}</div><div className="cc-stat-lbl">{l}</div></div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'heatmap' && (
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div><div style={{ fontFamily: 'var(--ff-title)', fontWeight: 700, fontSize: 14 }}>Affluence par jour & heure</div><div className="cell-sub">Densité des commandes · 4 dernières semaines</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--g400)' }}>
              Moins
              <span style={{ display: 'inline-flex', gap: 3 }}>{[.1, .3, .5, .7, .9].map(o => <span key={o} style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(255,107,53,' + o + ')' }} />)}</span>
              Plus
            </div>
          </div>
          <div className="heatmap">
            <div className="hm-corner" />
            {BarData.HM_DAYS.map(d => <div key={d} className="hm-daylbl">{d}</div>)}
            {BarData.HM_HOURS.map((h, hi) => (
              <React.Fragment key={h}>
                <div className="hm-hourlbl">{h}h</div>
                {BarData.HM_DAYS.map((d, di) => {
                  const v = BarData.heatmap[hi][di];
                  return <div key={di} className="hm-cell" title={d + ' ' + h + 'h · intensité ' + Math.round(v * 100) + '%'} style={{ background: v < 0.08 ? 'var(--g100)' : 'rgba(255,107,53,' + (0.12 + v * 0.78) + ')' }} />;
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="cell-sub" style={{ marginTop: 14, display: 'flex', gap: 6, alignItems: 'center' }}><Icon.info size={13} /> Les vendredis et samedis 20h–22h concentrent l’essentiel de votre activité.</div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { StatsModule, ClustersModule });
