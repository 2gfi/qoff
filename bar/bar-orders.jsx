/* QOff Back-Office Bar — Module Commandes (Kanban). Écran roi du barman.
   Colonnes : Nouvelles · En préparation · Prêtes · En attente (+ Remises/Remboursées via switch).
   Timer live (neutre → ambre >5min → rouge >10min), code retrait géant, note, téléphone tronqué,
   actions par statut, vue groupée, sheets pause / remboursement / code de remise. */

const COLS = [
  { key: 'new',      cls: 'col-new',      ttl: 'Nouvelles',      statuses: ['new'] },
  { key: 'prep',     cls: 'col-prep',     ttl: 'En préparation', statuses: ['preparing'] },
  { key: 'ready',    cls: 'col-ready',    ttl: 'Prêtes',         statuses: ['ready'] },
  { key: 'pause',    cls: 'col-pause',    ttl: 'En attente',     statuses: ['paused'] },
  { key: 'done',     cls: 'col-done',     ttl: 'Remises',        statuses: ['claimed'],  switch: true },
  { key: 'refunded', cls: 'col-refunded', ttl: 'Remboursées',    statuses: ['refunded'], switch: true },
];

function fmtTimer(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return m + ':' + ('0' + s).slice(-2);
}

function OrderCard({ o, now, ctx, onAct }) {
  const ts = o._ts;
  const secs = Math.max(0, Math.floor((now - ts) / 1000));
  const timerCls = secs > 600 ? 'urgent' : secs > 300 ? 'warn' : '';
  const urgent = o.status !== 'claimed' && o.status !== 'refunded' && secs > 600;
  return (
    <div className={'order-card' + (o._new ? ' new-anim' : '') + (urgent ? ' urgent' : '')}>
      <div className="oc-top">
        <span className="oc-id">{o.id}</span>
        <span className="oc-time">{o.time}</span>
        {o.status !== 'claimed' && o.status !== 'refunded'
          ? <span className={'oc-timer ' + timerCls}><Icon.clock size={11} />{fmtTimer(secs)}</span>
          : <span className="oc-timer" style={{ marginLeft: 'auto' }}>{o.status === 'claimed' ? 'Remise' : 'Remboursée'}</span>}
      </div>

      {o.status === 'paused' && o.pauseReason && (
        <div className="pause-reason"><Icon.alert size={11} /> {o.pauseReason}</div>
      )}
      {o.status === 'refunded' && o.refundReason && (
        <div className="pause-reason" style={{ background: 'var(--erl)', color: '#C53A39' }}><Icon.transfer size={11} /> {o.refundReason}</div>
      )}

      <div className="oc-code"><span className="oc-code-lbl">Code retrait</span>{o.code}</div>

      <div className="oc-items">
        {o.items.map((it, i) => (
          <div key={i} className="oc-item">
            <span className="oc-name"><span className="oc-qty">{it.qty}×</span>{it.name}</span>
          </div>
        ))}
      </div>

      {o.note && <div className="oc-note"><Icon.info size={13} /> {o.note}</div>}
      <div className="oc-phone"><Icon.phone size={11} /> {o.phone} · <span style={{ fontWeight: 600 }}>{QData.CHF(o.total)}</span></div>

      <div className="oc-actions">
        {o.status === 'new' && <Btn variant="or" size="sm" onClick={() => onAct('take', o)}>Prendre en charge</Btn>}
        {o.status === 'preparing' && <>
          <Btn variant="ok" size="sm" onClick={() => onAct('ready', o)}>Marquer prête</Btn>
          <Btn variant="gh" size="sm" className="grow0" icon={<Icon.clock size={13} />} onClick={() => onAct('pause', o)}>Pause</Btn>
        </>}
        {o.status === 'ready' && <>
          <Btn variant="bk" size="sm" onClick={() => onAct('claim', o)}>Remettre</Btn>
          <Btn variant="gh" size="sm" className="grow0" onClick={() => onAct('refund', o)} style={{ color: 'var(--er)', borderColor: 'rgba(226,75,74,.3)' }}>Rembourser</Btn>
        </>}
        {o.status === 'paused' && <Btn variant="or" size="sm" onClick={() => onAct('resume', o)} icon={<Icon.refresh size={13} />}>Reprendre</Btn>}
        {o.status === 'claimed' && <Btn variant="gh" size="sm" full disabled>✓ Terminée</Btn>}
        {o.status === 'refunded' && <Btn variant="gh" size="sm" full disabled>Remboursée · {QData.CHF(o.total)}</Btn>}
      </div>
    </div>
  );
}

function GroupedView({ orders }) {
  const active = orders.filter(o => ['new', 'preparing'].includes(o.status));
  const map = {};
  active.forEach(o => o.items.forEach(it => {
    if (!map[it.name]) map[it.name] = { name: it.name, qty: 0, orders: [] };
    map[it.name].qty += it.qty;
    if (!map[it.name].orders.includes(o.id)) map[it.name].orders.push(o.id);
  }));
  const rows = Object.values(map).sort((a, b) => b.qty - a.qty);
  const emojiFor = (name) => (BarData.menu.find(m => m.name === name) || {}).emoji || '🍸';
  if (!rows.length) return <div className="kempty" style={{ maxWidth: 360, margin: '40px auto' }}><div className="kei"><Icon.check size={20} /></div><span>Aucun article en préparation</span></div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
      <div className="sec-sub" style={{ marginBottom: 4 }}>Total à préparer, articles identiques regroupés — utile en plein rush.</div>
      {rows.map(r => (
        <div key={r.name} className="group-card">
          <span className="group-emoji">{emojiFor(r.name)}</span>
          <div className="group-info">
            <div className="group-name">{r.name}</div>
            <div className="group-orders">Commandes {r.orders.join(', ')}</div>
          </div>
          <span className="group-qty">{r.qty}</span>
        </div>
      ))}
    </div>
  );
}

function OrdersModule({ ctx, orders, setOrders }) {
  const [view, setView] = useState('kanban');
  const [showDone, setShowDone] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [pauseFor, setPauseFor] = useState(null);
  const [refundFor, setRefundFor] = useState(null);
  const [claimFor, setClaimFor] = useState(null);
  const tsMap = useRef({});

  /* horloge live */
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  /* attribuer un timestamp absolu à chaque commande (dérivé de elapsed pour les commandes seedées) */
  const baseRef = useRef(Date.now());
  orders.forEach(o => { if (!o._ts) { if (!tsMap.current[o.id]) tsMap.current[o.id] = baseRef.current - (o.elapsed || 0) * 60000; o._ts = tsMap.current[o.id]; } });

  const act = (type, o) => {
    if (type === 'pause') { setPauseFor(o); return; }
    if (type === 'refund') { setRefundFor(o); return; }
    if (type === 'claim') { setClaimFor(o); return; }
    const map = { take: 'preparing', ready: 'ready', resume: 'preparing' };
    const labels = { take: ' prise en charge', ready: ' prête', resume: ' reprise' };
    setOrders(list => list.map(x => x.id === o.id ? { ...x, status: map[type], pauseReason: type === 'resume' ? null : x.pauseReason } : x));
    ctx.toast('Commande ' + o.id + labels[type], type === 'ready' ? 'ok' : 'info');
  };
  const confirmPause = (reason) => { setOrders(l => l.map(x => x.id === pauseFor.id ? { ...x, status: 'paused', pauseReason: reason } : x)); ctx.toast('Commande ' + pauseFor.id + ' en attente', 'info'); setPauseFor(null); };
  const confirmClaim = () => { setOrders(l => l.map(x => x.id === claimFor.id ? { ...x, status: 'claimed' } : x)); ctx.toast('Commande ' + claimFor.id + ' remise au client', 'ok'); setClaimFor(null); };
  const confirmRefund = (amount, full) => { setOrders(l => l.map(x => x.id === refundFor.id ? { ...x, status: 'refunded', refundReason: full ? 'Remboursement total' : 'Remboursement partiel' } : x)); ctx.toast('Remboursé ' + QData.CHF(amount) + ' · ' + refundFor.id, 'er'); setRefundFor(null); };

  const cols = COLS.filter(c => !c.switch || showDone);

  return (
    <div>
      <div className="kanban-toolbar">
        <div className="tabs">
          <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>Kanban</button>
          <button className={view === 'grouped' ? 'active' : ''} onClick={() => setView('grouped')}>Groupés</button>
        </div>
        <span className="spacer" />
        <button className={'kswitch' + (showDone ? ' on' : '')} onClick={() => setShowDone(s => !s)}>
          <span className="ks-box">{showDone ? <Icon.check size={11} /> : null}</span>
          Remises &amp; remboursées
        </button>
      </div>

      {view === 'grouped' ? <GroupedView orders={orders} /> : (
        <div className="orders-board">
          {cols.map(col => {
            const list = orders.filter(o => col.statuses.includes(o.status));
            return (
              <div key={col.key} className={'kcol ' + col.cls}>
                <div className="kcol-hd">
                  <span className="kcol-dot" />
                  <span className="kcol-ttl">{col.ttl}</span>
                  <span className="kcol-cnt">{list.length}</span>
                </div>
                <div className="kcol-body">
                  {list.length === 0
                    ? <div className="kempty"><div className="kei"><Icon.check size={18} /></div><span>File vide</span></div>
                    : list.map(o => <OrderCard key={o.id} o={o} now={now} ctx={ctx} onAct={act} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pauseFor && <PauseSheet o={pauseFor} onClose={() => setPauseFor(null)} onConfirm={confirmPause} />}
      {claimFor && <ClaimSheet o={claimFor} onClose={() => setClaimFor(null)} onConfirm={confirmClaim} ctx={ctx} />}
      {refundFor && <RefundSheet o={refundFor} onClose={() => setRefundFor(null)} onConfirm={confirmRefund} />}
    </div>
  );
}

/* ---- Sheet : mise en pause ---- */
const PAUSE_REASONS = [
  { ic: '📦', t: 'Article indisponible' },
  { ic: '📵', t: 'Client injoignable' },
  { ic: '🔧', t: 'Problème technique' },
];
function PauseSheet({ o, onClose, onConfirm }) {
  const [sel, setSel] = useState(null);
  const [other, setOther] = useState('');
  const reason = sel === '__other' ? other : sel;
  return (
    <Sheet title="Mettre en pause" sub={'Commande ' + o.id} onClose={onClose} width={420}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!reason} onClick={() => onConfirm(reason)}>Mettre en pause</Btn></>}>
      <div className="lbl" style={{ marginBottom: 10 }}>Motif</div>
      <div className="pause-grid">
        {PAUSE_REASONS.map(r => (
          <button key={r.t} className={'pause-opt' + (sel === r.t ? ' on' : '')} onClick={() => setSel(r.t)}>
            <span className="po-ic">{r.ic}</span>{r.t}
          </button>
        ))}
        <button className={'pause-opt' + (sel === '__other' ? ' on' : '')} onClick={() => setSel('__other')}>
          <span className="po-ic">✏️</span>Autre motif…
        </button>
      </div>
      {sel === '__other' && <Field label="Préciser"><Input value={other} onChange={e => setOther(e.target.value)} placeholder="Motif personnalisé" autoFocus /></Field>}
      <div className="hint" style={{ display: 'flex', gap: 6 }}><Icon.info size={13} /> Le client est informé que sa commande est temporairement en attente.</div>
    </Sheet>
  );
}

/* ---- Sheet : saisie code de remise ---- */
function ClaimSheet({ o, onClose, onConfirm, ctx }) {
  const [code, setCode] = useState('');
  const ok = code === o.code;
  const submit = () => { if (ok) onConfirm(); else ctx.toast('Code incorrect — réessayez', 'er'); };
  return (
    <Sheet title="Remettre la commande" sub={o.id + ' · ' + QData.CHF(o.total)} onClose={onClose} width={420}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="ok" disabled={code.length < 4} onClick={submit}>Valider la remise</Btn></>}>
      <div className="card card-pad" style={{ background: 'var(--g50)', marginBottom: 16 }}>
        {o.items.map((it, i) => <div key={i} className="kv" style={{ padding: '6px 0' }}><span className="k"><b style={{ color: 'var(--or)' }}>{it.qty}×</b> {it.name}</span></div>)}
      </div>
      <div className="lbl" style={{ marginBottom: 10 }}>Code à 4 chiffres du client</div>
      <input className="code-inp" value={code} inputMode="numeric" maxLength={4} placeholder="••••" autoFocus
        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
        onKeyDown={e => e.key === 'Enter' && submit()} />
      <div className="hint" style={{ marginTop: 12, textAlign: 'center' }}>
        {code.length === 4 ? (ok ? <span style={{ color: 'var(--ok)', fontWeight: 600 }}>✓ Code valide</span> : <span style={{ color: 'var(--er)', fontWeight: 600 }}>Code ne correspond pas</span>)
          : 'Le client présente le code affiché dans son app, ou son QR.'}
      </div>
    </Sheet>
  );
}

/* ---- Sheet : remboursement partiel / total ---- */
function RefundSheet({ o, onClose, onConfirm }) {
  const [checked, setChecked] = useState(() => o.items.map(() => true));
  const amount = o.items.reduce((s, it, i) => s + (checked[i] ? it.qty * (o.total / o.items.reduce((a, x) => a + x.qty, 0)) : 0), 0);
  const lineAmt = (it) => +(it.qty * (o.total / o.items.reduce((a, x) => a + x.qty, 0))).toFixed(2);
  const full = checked.every(Boolean);
  return (
    <Sheet title="Rembourser" sub={'Commande ' + o.id} onClose={onClose} width={420}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="er" disabled={amount <= 0} onClick={() => onConfirm(+amount.toFixed(2), full)}>Confirmer le remboursement</Btn></>}>
      <div className="lbl" style={{ marginBottom: 6 }}>Articles à rembourser</div>
      {o.items.map((it, i) => (
        <label key={i} className="refund-row" style={{ cursor: 'pointer' }}>
          <input type="checkbox" className="refund-check" checked={checked[i]} onChange={() => setChecked(c => c.map((v, k) => k === i ? !v : v))} />
          <span className="refund-name"><b style={{ color: 'var(--or)' }}>{it.qty}×</b> {it.name}</span>
          <span className="refund-amt">{QData.CHF(lineAmt(it))}</span>
        </label>
      ))}
      <div className="refund-total">
        <span className="rt-lbl">Montant à rembourser</span>
        <span className="rt-val">{QData.CHF(+amount.toFixed(2))}</span>
      </div>
      <div className="hint" style={{ marginTop: 12, display: 'flex', gap: 6 }}><Icon.info size={13} /> Le remboursement est traité via le PSP. Le client est notifié automatiquement.</div>
    </Sheet>
  );
}

window.OrdersModule = OrdersModule;
