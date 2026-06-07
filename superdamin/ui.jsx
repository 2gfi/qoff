/* QOff Super Admin — shared UI primitives. Babel JSX. Exports → window */
const { useState, useRef, useEffect, useCallback } = React;

/* ---- Buttons / badges ---- */
function Btn({ variant = 'gh', size, full, icon, children, onClick, disabled, type, style }) {
  const cls = ['btn', variant, size, full ? 'full' : '', icon && !children ? 'icononly' : ''].filter(Boolean).join(' ');
  return (
    <button type={type || 'button'} className={cls} onClick={onClick} disabled={disabled} style={style}>
      {icon ? <span className="bic">{icon}</span> : null}
      {children}
    </button>
  );
}
function IconBtn({ icon, onClick, title, style }) {
  return <button className="iconbtn" onClick={onClick} title={title} aria-label={title} style={style}>{icon}</button>;
}
function Badge({ tone = 'plain', dot, children }) {
  return <span className={'badge ' + tone}>{dot ? <span className="dot" /> : null}{children}</span>;
}
const BAR_STATUS = { active: 'ok', suspended: 'er', trial: 'warn', maintenance: 'warn', closed: 'closed' };
function StatusBadge({ status }) {
  const tone = BAR_STATUS[status] || 'plain';
  return <Badge tone={tone} dot={status === 'active'}>{window.QData.S[status] || status}</Badge>;
}

/* ---- KPI ---- */
function KPI({ label, value, cur, delta, dir }) {
  return (
    <div className="kpi">
      <div className="k-lbl">{label}</div>
      <div className="k-val">{cur ? <span className="cur">{cur}</span> : null}{value}</div>
      {delta != null && (
        <div className={'k-delta ' + (dir || '')}>
          {dir === 'up' ? <Icon.trendUp size={14} /> : dir === 'down' ? <Icon.trendDown size={14} /> : null}
          {delta}
        </div>
      )}
    </div>
  );
}
function SectionHead({ title, sub, action }) {
  return (
    <div className="sec-head">
      <div>
        <div className="sec-title">{title}</div>
        {sub ? <div className="sec-sub">{sub}</div> : null}
      </div>
      {action || null}
    </div>
  );
}

/* ---- Toggle / Select / Search ---- */
function Toggle({ on, onClick, purple }) {
  return <div className={'toggle' + (on ? ' on' : '') + (purple ? ' purple' : '')} onClick={onClick} role="switch" aria-checked={!!on} />;
}
function Select({ value, onChange, options, style }) {
  return (
    <select className="field-sel" value={value} onChange={e => onChange && onChange(e.target.value)} style={style}>
      {options.map(o => typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Search({ value, onChange, placeholder, wide }) {
  return (
    <div className="search" style={wide ? { maxWidth: 380, flex: '1 1 320px' } : null}>
      <Icon.search size={17} />
      <input value={value || ''} placeholder={placeholder || 'Rechercher…'} onChange={e => onChange && onChange(e.target.value)} />
    </div>
  );
}

/* ---- Pager ---- */
function Pager({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  const nums = [];
  for (let i = 0; i < pages; i++) nums.push(i);
  return (
    <div className="pager">
      <span>{from}–{to} sur {total}</span>
      <div className="pages">
        <button className="pg" disabled={page === 0} onClick={() => onPage(page - 1)}><Icon.chevLeft size={14} /></button>
        {nums.map(n => <button key={n} className={'pg' + (n === page ? ' active' : '')} onClick={() => onPage(n)}>{n + 1}</button>)}
        <button className="pg" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}><Icon.chevRight size={14} /></button>
      </div>
    </div>
  );
}

/* ---- Row context menu (•••) ---- */
function RowMenu({ items, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
      <button className="kebab" onClick={() => setOpen(o => !o)} aria-label="Actions"><Icon.kebab size={16} /></button>
      {open && (
        <div className="menu" style={{ top: 36, [align]: 0 }}>
          {items.map((it, i) => it.sep
            ? <div key={i} className="menu-sep" />
            : it.label2
              ? <div key={i} className="menu-lbl">{it.label2}</div>
              : <button key={i} className={it.tone || ''} onClick={() => { setOpen(false); it.onClick && it.onClick(); }}>
                  <span className="mi">{it.icon}</span>{it.label}
                </button>)}
        </div>
      )}
    </div>
  );
}

/* ---- Overlay hosts: Sheet & Modal ---- */
function Sheet({ title, sub, onClose, footer, children, width, tabs, tab, onTab }) {
  return (
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="sheet" style={width ? { width } : null} onMouseDown={e => e.stopPropagation()}>
        <div className="sheet-h">
          <div className="grow">
            <div className="ttl">{title}</div>
            {sub ? <div className="sub">{sub}</div> : null}
          </div>
          <IconBtn icon={<Icon.x size={18} />} onClick={onClose} title="Fermer" />
        </div>
        {tabs ? <div style={{ padding: '12px 20px 0' }}><div className="tabs">{tabs.map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => onTab(t)}>{t}</button>)}</div></div> : null}
        <div className="sheet-body">{children}</div>
        {footer ? <div className="sheet-foot">{footer}</div> : null}
      </div>
    </div>
  );
}
function Modal({ icon, iconTone, title, children, footer, onClose, width }) {
  return (
    <div className="overlay" style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}
         onMouseDown={e => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="modal" style={width ? { width } : null} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-body">
          {icon ? <div className={'modal-ic ' + (iconTone || 'purple')}>{icon}</div> : null}
          <h3>{title}</h3>
          {children}
        </div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ---- Toasts ---- */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), tone === 'er' ? 5000 : 3000);
  }, []);
  return { toasts, push };
}
function ToastHost({ toasts }) {
  const ic = { ok: <Icon.check size={18} />, er: <Icon.alert size={18} />, purple: <Icon.sparkAdmin size={18} />, info: <Icon.info size={18} /> };
  return (
    <div className="toasts">
      {toasts.map(t => <div key={t.id} className={'toast ' + t.tone}><span className="ti">{ic[t.tone] || ic.ok}</span>{t.msg}</div>)}
    </div>
  );
}

/* ---- Form helpers ---- */
function Field({ label, req, hint, children }) {
  return (
    <div className="form-row">
      {label ? <label>{label}{req ? <span className="req"> *</span> : null}</label> : null}
      {children}
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}
function Input(props) { return <input className="inp" {...props} />; }
function Textarea(props) { return <textarea className="ta" {...props} />; }
function NativeSelect({ value, onChange, options }) {
  return <select className="sel" value={value} onChange={e => onChange && onChange(e.target.value)}>
    {options.map(o => typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}
function Empty({ icon, title, children }) {
  return <div className="empty"><div className="ei">{icon}</div><h4>{title}</h4><p>{children}</p></div>;
}

/* ---- Charts ---- */
function LineChart({ a, b, h = 180 }) {
  const w = 640, pad = 8;
  const max = Math.max(...a, ...b) * 1.1;
  const pts = (arr) => arr.map((v, i) => `${pad + (i / (arr.length - 1)) * (w - pad * 2)},${h - pad - (v / max) * (h - pad * 2)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map(g => <line key={g} x1={pad} x2={w - pad} y1={h - pad - g * (h - pad * 2)} y2={h - pad - g * (h - pad * 2)} stroke="#F2EFE9" strokeWidth="1" />)}
      <polyline points={pts(b)} fill="none" stroke="#D6D1C8" strokeWidth="2" strokeDasharray="4 4" />
      <polyline points={pts(a)} fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
function Donut({ data, size = 132 }) {
  const total = data.reduce((s, d) => s + d.v, 0);
  const r = 52, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F2EFE9" strokeWidth="16" />
      {data.map((d, i) => {
        const len = (d.v / total) * C;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="16"
          strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />;
        off += len; return el;
      })}
      <text x={cx} y={cy - 1} textAnchor="middle" fontFamily="Syne" fontWeight="700" fontSize="20" fill="#2A2826">{Math.max(...data.map(d => d.v))}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#9E9B96" letterSpacing="1">{data.reduce((m, d) => d.v > m.v ? d : m, data[0]).name.toUpperCase()}</text>
    </svg>
  );
}
function Spark({ data, h = 42 }) {
  const max = Math.max(...data);
  return <div className="spark-row" style={{ height: h }}>{data.map((v, i) => <div key={i} className={'spark-bar' + (v === max ? ' hi' : '')} style={{ height: (v / max * 100) + '%' }} />)}</div>;
}
function HealthDot({ state }) { return <span className={'health-dot ' + (state === 'ok' ? 'ok' : state === 'warn' ? 'warn' : 'er')} />; }

/* ---- Period picker (Aujourd'hui / Mois en cours / calendrier range) ---- */
const CAL_MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const CAL_DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
function MiniCalendar({ from, to, onChange }) {
  const [view, setView] = useState(new Date((from || window.QData.NOW).getFullYear(), (from || window.QData.NOW).getMonth(), 1));
  const y = view.getFullYear(), m = view.getMonth();
  const first = new Date(y, m, 1);
  const startDow = (first.getDay() + 6) % 7; // Monday-first
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));
  const same = (a, b) => a && b && a.toDateString() === b.toDateString();
  const inRange = (d) => from && to && d >= from && d <= to;
  const pick = (d) => {
    if (!from || (from && to)) onChange(d, null);
    else if (d < from) onChange(d, from);
    else onChange(from, d);
  };
  return (
    <div style={{ width: 248 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button className="iconbtn" onClick={() => setView(new Date(y, m - 1, 1))}><Icon.chevLeft size={16} /></button>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{CAL_MONTHS[m]} {y}</span>
        <button className="iconbtn" onClick={() => setView(new Date(y, m + 1, 1))}><Icon.chevRight size={16} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {CAL_DOW.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--g400)', padding: '2px 0' }}>{d}</div>)}
        {cells.map((d, i) => d ? (
          <button key={i} onClick={() => pick(d)} style={{
            height: 30, borderRadius: same(d, from) || same(d, to) ? 7 : 0, fontSize: 12, fontWeight: same(d, from) || same(d, to) ? 700 : 500,
            background: same(d, from) || same(d, to) ? 'var(--or)' : inRange(d) ? 'var(--orl)' : 'transparent',
            color: same(d, from) || same(d, to) ? '#fff' : inRange(d) ? 'var(--ord)' : 'var(--g800)',
          }}>{d.getDate()}</button>
        ) : <div key={i} />)}
      </div>
    </div>
  );
}
function PeriodPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value && value.from ? new Date(value.from) : null);
  const [to, setTo] = useState(value && value.to ? new Date(value.to) : null);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const info = window.QData.periodInfo(value);
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <div className="tabs">
        <button className={value.mode === 'today' ? 'active' : ''} onClick={() => onChange({ mode: 'today' })}>Aujourd'hui</button>
        <button className={value.mode === 'month' ? 'active' : ''} onClick={() => onChange({ mode: 'month' })}>Mois en cours</button>
        <button className={value.mode === 'range' ? 'active' : ''} onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon.calendar size={14} />{value.mode === 'range' ? info.label : 'Période'}
        </button>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 42, right: 0, zIndex: 70, background: 'var(--wh)', borderRadius: 12, boxShadow: 'var(--shadow-pop)', padding: 12 }}>
          <MiniCalendar from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button className="btn gh sm" style={{ flex: 1 }} onClick={() => setOpen(false)}>Annuler</button>
            <button className="btn or sm" style={{ flex: 1 }} disabled={!from} onClick={() => { onChange({ mode: 'range', from: +from, to: +(to || from) }); setOpen(false); }}>Appliquer</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Photo grid (bar gallery — POC placeholders) ---- */
const PHOTO_GRADS = ['linear-gradient(135deg,#FF9A3C,#FF6B35)', 'linear-gradient(135deg,#5BC8AC,#1D9E75)', 'linear-gradient(135deg,#8B5CF6,#6D3DE0)', 'linear-gradient(135deg,#60A5FA,#3B82F6)', 'linear-gradient(135deg,#F4B860,#E55A28)'];
function PhotoGrid({ ctx }) {
  const [photos, setPhotos] = useState([0, 1, 2]);
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {photos.map((g, i) => (
        <div key={i} style={{ position: 'relative', width: 92, height: 70, borderRadius: 10, background: PHOTO_GRADS[g % PHOTO_GRADS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.85)' }}>
          {i === 0 && <span style={{ position: 'absolute', top: 5, left: 5, fontSize: 9, fontWeight: 700, background: 'rgba(0,0,0,.4)', color: '#fff', padding: '2px 6px', borderRadius: 5 }}>Couverture</span>}
          <Icon.grid size={18} />
          <button onClick={() => setPhotos(p => p.filter((_, k) => k !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 6, background: 'rgba(0,0,0,.5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.x size={12} /></button>
        </div>
      ))}
      <button onClick={() => setPhotos(p => [...p, p.length])} style={{ width: 92, height: 70, borderRadius: 10, border: '1.5px dashed var(--g300,#D6D1C8)', background: 'var(--g50)', color: 'var(--g400)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 11, fontWeight: 600 }}>
        <Icon.plus size={16} /> Ajouter
      </button>
    </div>
  );
}

Object.assign(window, {
  Btn, IconBtn, Badge, StatusBadge, KPI, SectionHead, Toggle, Select, Search, Pager,
  RowMenu, Sheet, Modal, useToasts, ToastHost, Field, Input, Textarea, NativeSelect, Empty,
  LineChart, Donut, Spark, HealthDot, PeriodPicker, MiniCalendar, PhotoGrid,
});
