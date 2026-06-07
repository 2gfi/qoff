/* QOff Super Admin — Données: Clients, Transactions, Commissions */

/* ============================ CLIENTS ============================ */
function ModClients({ ctx }) {
  const [q, setQ] = useState('');
  const [searched, setSearched] = useState(false);
  const [detail, setDetail] = useState(null);
  const [blacklist, setBlacklist] = useState(null);
  const [anon, setAnon] = useState(null);
  const results = QD.clients.filter(c => q === '' ? false : (c.name + ' ' + c.phone + ' ' + c.email).toLowerCase().includes(q.toLowerCase()));
  const run = () => setSearched(true);
  return (
    <div className="a-content-inner">
      <div className="ribbon-rgpd" style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--erl)', color: '#9B2C2B', border: '1px solid rgba(226,75,74,.25)', borderRadius: 12, padding: '11px 16px', fontSize: 13, marginBottom: 18 }}>
        <Icon.lock size={16} /> Module réservé aux admins habilités. <b>Tout accès est loggé dans l'audit trail.</b>
      </div>
      <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center', padding: searched ? '0 0 20px' : '40px 0' }}>
        <div className="sec-title" style={{ fontSize: 18, marginBottom: 6 }}>Recherche client</div>
        <p className="cell-sub" style={{ marginBottom: 16, fontSize: 13 }}>Les données personnelles ne sont jamais affichées à la volée — recherchez par téléphone, email ou nom.</p>
        <div style={{ display: 'flex', gap: 9 }}>
          <div className="search" style={{ flex: 1, height: 44, maxWidth: 'none' }}>
            <Icon.search size={18} />
            <input value={q} placeholder="+41 79 234 56 78 · jean@mail.ch · Jean Martin" onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} style={{ fontSize: 14 }} />
          </div>
          <Btn variant="bk" size="lg" onClick={run}>Rechercher</Btn>
        </div>
      </div>
      {searched && (
        results.length === 0
          ? <Empty icon={<Icon.client size={22} />} title="Aucun résultat">Aucun client ne correspond à « {q} ». Vérifiez l'orthographe ou le format du numéro.</Empty>
          : <div className="tablewrap" style={{ maxWidth: 760, margin: '0 auto' }}>
              <table className="grid">
                <thead><tr><th>Client</th><th>Téléphone</th><th className="r">Commandes</th><th>Statut</th><th className="r"></th></tr></thead>
                <tbody>
                  {results.map(c => (
                    <tr key={c.id} className="clk" onClick={() => setDetail(c)}>
                      <td className="cell-strong">{c.name}</td>
                      <td className="mono">{c.phone}</td>
                      <td className="r mono">{c.orders}</td>
                      <td>{c.status === 'active' ? <Badge tone="ok" dot>Actif</Badge> : c.status === 'blacklisted' ? <Badge tone="er">Blacklisté</Badge> : <Badge tone="closed">Anonymisé</Badge>}</td>
                      <td className="r"><Icon.chevRight size={16} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}
      {detail && <ClientDetail ctx={ctx} c={detail} onClose={() => setDetail(null)} onBlacklist={() => { setBlacklist(detail); setDetail(null); }} onAnon={() => { setAnon(detail); setDetail(null); }} />}
      {blacklist && <BlacklistSheet ctx={ctx} c={blacklist} onClose={() => setBlacklist(null)} />}
      {anon && <AnonymizeModal ctx={ctx} c={anon} onClose={() => setAnon(null)} />}
    </div>
  );
}

function ClientDetail({ ctx, c, onClose, onBlacklist, onAnon }) {
  const tl = [
    { dot: 'or', t: '06 juin · 21:14', x: 'Commande QO-48210 · Le Jetée · CHF 24.50 · Récupérée' },
    { dot: 'ok', t: '06 juin · 21:02', x: 'Connexion OTP · Le Jetée · succès' },
    { dot: '', t: '28 mai · 19:40', x: 'Facture générée · QO-47980' },
    { dot: 'or', t: '28 mai · 19:22', x: 'Commande QO-47980 · Quai 9 · CHF 38.00 · Récupérée' },
    { dot: 'ok', t: '12 mai · 18:05', x: 'Connexion OTP · Bains des Pâquis · succès' },
  ];
  const orders = [
    { id: 'QO-48210', dateLabel: "Aujourd'hui · 21:14", bar: 'Le Jetée', total: 37, status: 'claimed', refundable: true, items: [{ n: '2× Spritz Aperol', p: 24 }, { n: '1× Mojito', p: 13 }] },
    { id: 'QO-47980', dateLabel: '28 mai · 19:22', bar: 'Quai 9', total: 38, status: 'claimed', refundable: false, items: [{ n: '1× IPA artisanale', p: 8 }, { n: '2× Blonde 33cl', p: 13 }, { n: '1× Planche', p: 17 }] },
    { id: 'QO-47120', dateLabel: '12 mai · 18:05', bar: 'Bains des Pâquis', total: 21, status: 'refunded', refundable: false, items: [{ n: '1× Mojito', p: 13 }, { n: '1× Limonade', p: 8 }] },
  ];
  const [view, setView] = useState('profile');   // 'profile' | 'orders'
  const [order, setOrder] = useState(null);
  const [bill, setBill] = useState({ addr: 'Rue du Lac 14', cp: '1006', city: 'Lausanne', editing: false });

  if (order) return <OrderDetail ctx={ctx} c={c} order={order} onBack={() => setOrder(null)} />;

  return (
    <Sheet title={c.name} sub={c.phone} onClose={onClose} width={480}
      tabs={c.status === 'anonymized' ? null : ['profile', 'orders']} tab={view}
      onTab={(t) => setView(t)}
      footer={c.status === 'anonymized' ? <Btn variant="gh" full onClick={onClose}>Fermer</Btn> : <><Btn variant="er" icon={<Icon.ban size={15} />} onClick={onBlacklist}>Blacklister</Btn><Btn variant="er" icon={<Icon.trash size={15} />} onClick={onAnon}>RGPD · Anonymiser</Btn></>}>
      {view === 'profile' && <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span className="avatar-sm" style={{ width: 44, height: 44, fontSize: 15, borderRadius: 12, background: c.status === 'blacklisted' ? 'var(--er)' : 'var(--g400)' }}>{c.name === '[ANONYMISÉ]' ? '–' : c.name.split(' ').map(s => s[0]).join('')}</span>
          <div style={{ flex: 1 }}><div className="cell-strong" style={{ fontSize: 15 }}>{c.name}</div><div className="cell-sub">{c.email}</div></div>
          {c.status === 'active' ? <Badge tone="ok" dot>Actif</Badge> : c.status === 'blacklisted' ? <Badge tone="er">Blacklisté</Badge> : <Badge tone="closed">Anonymisé</Badge>}
        </div>
        <div className="card card-pad" style={{ background: 'var(--g50)', marginBottom: 16 }}>
          <div className="kv"><span className="k">Compte créé</span><span className="v">{c.since}</span></div>
          <div className="kv"><span className="k">Commandes</span><span className="v mono">{c.orders}</span></div>
          <div className="kv"><span className="k">Total dépensé</span><span className="v mono">CHF {c.spent.toLocaleString('fr-CH', { minimumFractionDigits: 2 })}</span></div>
          <div className="kv"><span className="k">Dernier bar</span><span className="v">{c.lastBar}</span></div>
        </div>

        {/* Facturation éditable */}
        <div className="sec-head" style={{ marginBottom: 8 }}><div className="lbl">Adresse de facturation</div>{!bill.editing ? <button className="btn gh sm" onClick={() => setBill(b => ({ ...b, editing: true }))}><Icon.edit size={13} /> Éditer</button> : null}</div>
        {bill.editing ? <>
          <Field label="Adresse"><Input value={bill.addr} onChange={e => setBill(b => ({ ...b, addr: e.target.value }))} /></Field>
          <div className="form-grid-2"><Field label="Code postal"><Input value={bill.cp} onChange={e => setBill(b => ({ ...b, cp: e.target.value }))} /></Field><Field label="Ville"><Input value={bill.city} onChange={e => setBill(b => ({ ...b, city: e.target.value }))} /></Field></div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}><Btn variant="gh" size="sm" onClick={() => setBill(b => ({ ...b, editing: false }))}>Annuler</Btn><Btn variant="or" size="sm" onClick={() => { setBill(b => ({ ...b, editing: false })); ctx.toast('Adresse de facturation mise à jour', 'ok'); }}>Enregistrer</Btn></div>
        </> : (
          <div className="card card-pad" style={{ marginBottom: 18, fontSize: 13 }}>{bill.addr}<br />{bill.cp} {bill.city}</div>
        )}

        <div className="lbl" style={{ marginBottom: 10 }}>Timeline</div>
        <div className="timeline">
          {tl.map((e, i) => <div className="tl-item" key={i}><span className={'tl-dot ' + e.dot} /><div className="tl-time">{e.t}</div><div className="tl-txt">{e.x}</div></div>)}
        </div>
        <div style={{ marginTop: 14 }}><Btn variant="gh" full icon={<Icon.transactions size={15} />} onClick={() => setView('orders')}>Voir toutes les commandes ({orders.length})</Btn></div>
      </>}

      {view === 'orders' && <>
        <div className="lbl" style={{ marginBottom: 10 }}>Toutes les commandes</div>
        {orders.map(o => (
          <div key={o.id} className="card" style={{ padding: 13, marginBottom: 9, cursor: 'pointer' }} onClick={() => setOrder(o)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <span className="mono cell-strong">{o.id}</span>
              {o.status === 'refunded' ? <Badge tone="info">Remboursée</Badge> : o.refundable ? <Badge tone="warn" dot>Aujourd'hui</Badge> : <Badge tone="ok">Récupérée</Badge>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="cell-sub">{o.bar} · {o.dateLabel}</span>
              <span className="mono cell-strong">{QD.CHF(o.total)}</span>
            </div>
          </div>
        ))}
      </>}
    </Sheet>
  );
}

function OrderDetail({ ctx, c, order, onBack }) {
  return (
    <Sheet title={'Commande ' + order.id} sub={order.bar + ' · ' + order.dateLabel} onClose={onBack} width={480}
      footer={<><Btn variant="er" disabled={!order.refundable} icon={<Icon.transfer size={15} />} onClick={() => ctx.toast(order.refundable ? 'Remboursement déclenché · ' + order.id : '', order.refundable ? 'er' : 'info')}>{order.refundable ? 'Rembourser' : 'Hors délai (J)'}</Btn><Btn variant="gh" icon={<Icon.download size={15} />} onClick={() => ctx.toast('Facture ' + order.id + ' générée (PDF)', 'ok')}>Facture (export)</Btn></>}>
      <button className="btn gh sm" onClick={onBack} style={{ marginBottom: 14 }}><Icon.chevLeft size={14} /> Retour aux commandes</button>
      <div className="card card-pad" style={{ marginBottom: 14 }}>
        {order.items.map((it, i) => <div key={i} className="kv"><span className="k">{it.n}</span><span className="v mono">{QD.CHF(it.p)}</span></div>)}
        <div className="kv" style={{ borderTop: '1px solid var(--g200)', marginTop: 4, paddingTop: 10 }}><span className="k" style={{ fontWeight: 700, color: 'var(--g800)' }}>Total</span><span className="v mono" style={{ fontSize: 15 }}>{QD.CHF(order.total)}</span></div>
      </div>
      {order.refundable
        ? <div className="card card-pad" style={{ background: 'var(--warnl)', fontSize: 12.5, color: '#B45309', display: 'flex', gap: 8 }}><Icon.info size={15} /> Commande du jour — remboursement possible directement.</div>
        : order.status === 'refunded'
          ? <div className="card card-pad" style={{ background: 'var(--bluel)', fontSize: 12.5, color: '#2563C9', display: 'flex', gap: 8 }}><Icon.info size={15} /> Cette commande a déjà été remboursée.</div>
          : <div className="card card-pad" style={{ background: 'var(--g50)', fontSize: 12.5, color: 'var(--g600)', display: 'flex', gap: 8 }}><Icon.info size={15} /> Remboursement indisponible (commande antérieure au jour courant).</div>}
    </Sheet>
  );
}

function BlacklistSheet({ ctx, c, onClose }) {
  return (
    <Sheet title="Blacklister un client" sub={c.phone} onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="er" onClick={() => { ctx.toast(c.name + ' blacklisté', 'er'); onClose(); }}>Blacklister</Btn></>}>
      <Field label="Numéro concerné"><Input defaultValue={c.phone} readOnly /></Field>
      <Field label="Motif" req><NativeSelect options={['Fraude', 'Abus', 'Demande client', 'Autre']} value="Fraude" onChange={() => {}} /></Field>
      <Field label="Durée"><div style={{ display: 'flex', gap: 6 }}>{['30 j', '90 j', '1 an', 'Permanent'].map((d, i) => <button key={d} className="btn gh sm" style={i === 1 ? { borderColor: 'var(--er)', color: 'var(--er)', background: 'var(--erl)' } : null}>{d}</button>)}</div></Field>
      <Field label="Notes internes"><Textarea /></Field>
    </Sheet>
  );
}

function AnonymizeModal({ ctx, c, onClose }) {
  const [txt, setTxt] = useState('');
  return (
    <Modal icon={<Icon.trash size={22} />} iconTone="er" title="Anonymisation RGPD" onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="er" disabled={txt !== 'CONFIRMER'} onClick={() => { ctx.toast('Client anonymisé · entrée audit créée', 'er'); onClose(); }}>Anonymiser définitivement</Btn></>}>
      <p style={{ marginBottom: 14 }}><b style={{ color: 'var(--er)' }}>Action irréversible.</b> Les données personnelles de <b>{c.name}</b> seront remplacées par <span className="mono">[ANONYMISÉ]</span>. Les montants de transactions sont conservés.</p>
      <Field label="Motif" req><Input placeholder="Demande d'effacement RGPD du…" /></Field>
      <Field label="Saisir CONFIRMER pour valider"><Input value={txt} onChange={e => setTxt(e.target.value)} placeholder="CONFIRMER" /></Field>
    </Modal>
  );
}

/* ============================ TRANSACTIONS ============================ */
function ModTransactions({ ctx }) {
  const [q, setQ] = useState('');
  const [bar, setBar] = useState('Tous');
  const [country, setCountry] = useState('Tous');
  const [psp, setPsp] = useState('Tous');
  const [period, setPeriod] = useState({ mode: 'month' });
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState(null);
  const pageSize = 12;
  useEffect(() => { ctx.setTopActions(<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PeriodPicker value={period} onChange={p => { setPeriod(p); setPage(0); }} /><Btn variant="gh" icon={<Icon.download size={15} />} onClick={() => ctx.toast('Export CSV des transactions filtrées lancé', 'info')}>Exporter CSV</Btn></div>); return () => ctx.setTopActions(null); }, [period]);

  const now = QD.NOW;
  const inPeriod = (d) => {
    if (period.mode === 'today') return d.toDateString() === now.toDateString();
    if (period.mode === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return d >= new Date(period.from) && d <= new Date(new Date(period.to).setHours(23, 59, 59));
  };
  const barCountry = {}; QD.bars.forEach(b => barCountry[b.name] = b.country);
  const fmtDate = (d) => d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit' }) + ' · ' + d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
  let all = QD.transactions.filter(t => inPeriod(t.date) &&
    (country === 'Tous' || barCountry[t.bar] === country) &&
    (bar === 'Tous' || t.bar === bar) &&
    (psp === 'Tous' || QD.psp[t.psp] === psp) &&
    (q === '' || (t.id + ' ' + t.client).toLowerCase().includes(q.toLowerCase())));
  const total = all.length;
  const refundCount = all.filter(t => t.psp === 'refunded' || t.psp === 'partial').length;
  const failRate = all.length ? ((all.filter(t => t.psp === 'failed').length / all.length) * 100).toFixed(1) : '0.0';
  const sumOk = all.filter(t => t.psp === 'success').reduce((s, t) => s + t.amount, 0);
  const rows = all.slice(page * pageSize, page * pageSize + pageSize);
  const pspTone = { success: 'ok', refunded: 'info', partial: 'warn', failed: 'er', pending: 'closed' };
  const ordTone = { claimed: 'ok', ready: 'info', preparing: 'warn', pending: 'closed', cancelled: 'er' };

  return (
    <div className="a-content-inner">
      <div className="kpi-row">
        <KPI label="CA total (période)" cur="CHF" value={Math.round(sumOk).toLocaleString('fr-CH')} />
        <KPI label="Commandes réussies" value={all.filter(t => t.psp === 'success').length} />
        <KPI label="Remboursements" value={refundCount} />
        <KPI label="Taux d'échec PSP" value={failRate + ' %'} dir={+failRate > 5 ? 'down' : 'up'} delta={+failRate > 5 ? 'à surveiller' : 'sous contrôle'} />
      </div>
      <div className="toolbar">
        <Search value={q} onChange={v => { setQ(v); setPage(0); }} placeholder="ID commande, téléphone…" />
        <Select value={country} onChange={v => { setCountry(v); setPage(0); }} options={[{ value: 'Tous', label: 'Tous pays' }, { value: 'CH', label: '🇨🇭 Suisse' }, { value: 'FR', label: '🇫🇷 France' }]} />
        <Select value={bar} onChange={v => { setBar(v); setPage(0); }} options={['Tous', ...Array.from(new Set(QD.transactions.map(t => t.bar)))]} />
        <Select value={psp} onChange={v => { setPsp(v); setPage(0); }} options={['Tous', 'Succès', 'Remboursé', 'Partiel', 'Échoué', 'En attente']} />
        <span className="spacer" />
        <span className="cell-sub">{total} transactions</span>
      </div>
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>ID</th><th>Date</th><th>Bar</th><th>Client</th><th className="r">Montant</th><th className="r">Commission</th><th>Statut PSP</th><th>Commande</th><th className="r">Actions</th></tr></thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} className="clk" onClick={(e) => { if (!e.target.closest('button')) setDetail(t); }}>
                <td className="mono cell-strong">{t.id}</td>
                <td className="mono cell-sub">{fmtDate(t.date)}</td>
                <td>{t.bar}</td>
                <td className="mono cell-sub">{t.client === 'Client invité' ? 'Invité' : t.client.split(' ').map(s => s[0]).join('.') + '. •••'}</td>
                <td className="r mono cell-strong">{QD.money(t.amount, t.cur)}</td>
                <td className="r mono cell-sub">{QD.money(t.comm, t.cur)}</td>
                <td><Badge tone={pspTone[t.psp]} dot={t.psp === 'success'}>{QD.psp[t.psp]}</Badge></td>
                <td><Badge tone={ordTone[t.order]}>{QD.ostat[t.order]}</Badge></td>
                <td className="r"><Btn variant="gh" size="sm" onClick={() => setDetail(t)}>Voir</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={page} pageSize={pageSize} total={total} onPage={setPage} />
      </div>
      {detail && <TxDetail ctx={ctx} t={detail} onClose={() => setDetail(null)} fmtDate={fmtDate} />}
    </div>
  );
}

function TxDetail({ ctx, t, onClose, fmtDate }) {
  const [mode, setMode] = useState(null); // 'refund' | 'force'
  const pipe = [
    { dot: 'ok', t: 'Initié', s: fmtDate(t.date), w: 'payment.created' },
    { dot: 'ok', t: 'Capturé', s: fmtDate(t.date), w: 'payment.captured' },
    { dot: t.psp === 'pending' ? '' : 'ok', t: 'Reversé', s: t.psp === 'pending' ? 'en attente' : fmtDate(t.date), w: 'transfer.settled' },
    { dot: t.psp === 'refunded' ? 'er' : (t.psp === 'pending' ? '' : 'ok'), t: t.psp === 'refunded' ? 'Remboursé' : 'Confirmé', s: t.psp === 'pending' ? '—' : fmtDate(t.date), w: t.psp === 'refunded' ? 'refund.succeeded' : 'order.confirmed' },
  ];
  if (mode === 'refund') return <RefundSheet ctx={ctx} t={t} onClose={onClose} />;
  if (mode === 'force') return <ForceSheet ctx={ctx} t={t} onClose={onClose} />;
  return (
    <Sheet title={'Transaction ' + t.id} sub={t.bar + ' · ' + QD.money(t.amount, t.cur)} onClose={onClose} width={480}
      footer={<><Btn variant="purple" icon={<Icon.refresh size={15} />} onClick={() => setMode('force')}>Forcer le statut</Btn><Btn variant="er" icon={<Icon.transfer size={15} />} onClick={() => setMode('refund')}>Rembourser</Btn></>}>
      <div className="card card-pad" style={{ background: 'var(--g50)', marginBottom: 16 }}>
        <div className="kv"><span className="k">Statut PSP</span><span className="v"><Badge tone={t.psp === 'success' ? 'ok' : t.psp === 'failed' ? 'er' : 'warn'}>{QD.psp[t.psp]}</Badge></span></div>
        <div className="kv"><span className="k">Articles</span><span className="v">{t.items} article{t.items > 1 ? 's' : ''}</span></div>
        <div className="kv"><span className="k">Montant</span><span className="v mono">{QD.money(t.amount, t.cur)}</span></div>
        <div className="kv"><span className="k">Commission QOff</span><span className="v mono">{QD.money(t.comm, t.cur)}</span></div>
      </div>
      <div className="lbl" style={{ marginBottom: 10 }}>Pipeline PSP Wallee</div>
      <div className="timeline">
        {pipe.map((p, i) => <div className="tl-item" key={i}><span className={'tl-dot ' + p.dot} /><div style={{ display: 'flex', justifyContent: 'space-between' }}><div className="tl-txt" style={{ fontWeight: 600 }}>{p.t}</div><div className="tl-time">{p.s}</div></div><code style={{ fontSize: 11, color: 'var(--g400)' }}>webhook · {p.w}</code></div>)}
      </div>
    </Sheet>
  );
}

function RefundSheet({ ctx, t, onClose }) {
  const [full, setFull] = useState(true);
  return (
    <Sheet title="Remboursement" sub={t.id + ' · ' + QD.money(t.amount, t.cur)} onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="er" onClick={() => { ctx.toast('Remboursement déclenché via PSP', 'er'); onClose(); }}>Déclencher le remboursement</Btn></>}>
      <div className="kv" style={{ borderBottom: '1px solid var(--g200)', paddingBottom: 12, marginBottom: 6 }}><span className="k">Remboursement total</span><Toggle on={full} onClick={() => setFull(f => !f)} /></div>
      {!full && <>
        <div className="lbl" style={{ margin: '12px 0 8px' }}>Articles à rembourser</div>
        {Array.from({ length: t.items }).map((_, i) => <div key={i} className="kv"><span className="k" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--er)' }} /> Article {i + 1}</span><span className="v mono">{QD.money(+(t.amount / t.items).toFixed(2), t.cur)}</span></div>)}
      </>}
      <Field label="Motif" hint="Visible dans l'audit trail"><Textarea placeholder="Commande non reçue, erreur bar…" /></Field>
      <div className="card card-pad" style={{ background: 'var(--erl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="lbl">Montant remboursé</span><span className="mono" style={{ fontWeight: 700, fontSize: 16, color: 'var(--er)' }}>{QD.money(t.amount, t.cur)}</span></div>
    </Sheet>
  );
}

function ForceSheet({ ctx, t, onClose }) {
  return (
    <Sheet title="Forcer le statut" sub={t.id} onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="purple" onClick={() => { ctx.toast('Statut commande forcé', 'purple'); onClose(); }}>Forcer & logguer</Btn></>}>
      <p style={{ fontSize: 13, color: 'var(--g600)', marginBottom: 16 }}>À utiliser quand le paiement est capturé mais la commande reste bloquée. L'action est tracée dans l'audit trail.</p>
      <Field label="Statut cible" req><NativeSelect options={['Récupérée', 'Prête', 'En préparation', 'Annulée']} value="Récupérée" onChange={() => {}} /></Field>
      <Field label="Motif" req><Textarea placeholder="Commande bloquée suite à incident PSP…" /></Field>
    </Sheet>
  );
}

/* ============================ COMMISSIONS ============================ */
function ModCommissions({ ctx }) {
  const [credit, setCredit] = useState(null);
  const [country, setCountry] = useState('Tous');
  const [barF, setBarF] = useState('Tous');
  const [period, setPeriod] = useState({ mode: 'month' });
  useEffect(() => { ctx.setTopActions(<PeriodPicker value={period} onChange={setPeriod} />); return () => ctx.setTopActions(null); }, [period]);
  const pi = QD.periodInfo(period);
  const bars = QD.bars.filter(b => b.ca > 0 && (country === 'Tous' || b.country === country) && (barF === 'Tous' || b.name === barF));
  const caTot = bars.reduce((s, b) => s + b.ca * pi.mult, 0);
  const commTot = Math.round(bars.reduce((s, b) => s + b.ca * b.comm / 100 * pi.mult, 0));
  return (
    <div className="a-content-inner">
      <div className="kpi-row">
        <KPI label={'CA total · ' + pi.label} cur="CHF" value={Math.round(caTot).toLocaleString('fr-CH')} />
        <KPI label={'Commissions brutes · ' + pi.label} cur="CHF" value={commTot.toLocaleString('fr-CH')} dir="up" delta={'+11,8 % vs ' + pi.prev} />
        <KPI label="Remboursements" cur="CHF" value={Math.round(184.5 * pi.mult).toLocaleString('fr-CH')} />
        <KPI label="Net commissions" cur="CHF" value={Math.round(commTot - 184.5 * pi.mult).toLocaleString('fr-CH')} />
      </div>
      <div className="toolbar">
        <span className="sec-title">Commissions par bar</span><span className="spacer" />
        <Select value={country} onChange={setCountry} options={[{ value: 'Tous', label: 'Tous pays' }, { value: 'CH', label: '🇨🇭 Suisse' }, { value: 'FR', label: '🇫🇷 France' }]} />
        <Select value={barF} onChange={setBarF} options={['Tous', ...QD.bars.filter(b => b.ca > 0).map(b => b.name)]} />
      </div>
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Bar</th><th className="r">CA brut</th><th className="r">Comm. %</th><th className="r">Comm. CHF</th><th className="r">Rembours.</th><th className="r">Crédits</th><th className="r">Solde net</th><th className="r">Actions</th></tr></thead>
          <tbody>
            {bars.map(b => {
              const comm = +(b.ca * b.comm / 100).toFixed(2);
              const refund = b.id === 'B02' ? 64.5 : b.id === 'B06' ? 38 : 0;
              const credit = b.id === 'B03' ? 120 : 0;
              return (
                <tr key={b.id}>
                  <td><div className="cell-strong">{b.flag} {b.name}</div><div className="cell-sub">{b.patron}</div></td>
                  <td className="r mono">{QD.money(b.ca, b.country === 'FR' ? 'EUR' : 'CHF')}</td>
                  <td className="r mono cell-sub">{b.comm} %</td>
                  <td className="r mono cell-strong">{QD.money(comm, b.country === 'FR' ? 'EUR' : 'CHF')}</td>
                  <td className="r mono cell-sub">{refund ? '–' + QD.money(refund, b.country === 'FR' ? 'EUR' : 'CHF') : '—'}</td>
                  <td className="r mono cell-sub">{credit ? '–' + QD.money(credit, b.country === 'FR' ? 'EUR' : 'CHF') : '—'}</td>
                  <td className="r mono cell-strong">{QD.money(+(comm - refund * b.comm / 100 - credit).toFixed(2), b.country === 'FR' ? 'EUR' : 'CHF')}</td>
                  <td className="r"><RowMenu items={[
                    { icon: <Icon.commissions size={16} />, label: 'Modifier le taux', onClick: () => ctx.toast('Édition du taux de ' + b.name, 'info') },
                    { icon: <Icon.wallet size={16} />, label: 'Émettre un crédit', tone: 'admin', onClick: () => setCredit(b) },
                  ]} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="sec" style={{ marginTop: 18 }}>
        <SectionHead title="Réconciliation Wallee" sub="Rapprochement automatique des paiements" action={<Btn variant="purple" icon={<Icon.refresh size={15} />} onClick={() => ctx.toast('Réconciliation lancée…', 'purple')}>Lancer une réconciliation</Btn>} />
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--okl)', color: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.check size={20} /></span>
          <div style={{ flex: 1 }}><div className="cell-strong">Dernière réconciliation — 01 juin 2026 · 08:00</div><div className="cell-sub">Aucun écart détecté sur la période Mai 2026.</div></div>
          <Badge tone="ok" dot>Écart 0.00 · OK</Badge>
        </div>
        <div className="tablewrap">
          <table className="grid">
            <thead><tr><th>Date</th><th>Période</th><th className="r">Écart détecté</th><th>Statut</th></tr></thead>
            <tbody>
              {[['01 juin 2026', 'Mai 2026', '0.00', 'ok'], ['01 mai 2026', 'Avril 2026', '0.00', 'ok'], ['02 avr. 2026', 'Mars 2026', '12.40', 'warn'], ['01 mars 2026', 'Févr. 2026', '0.00', 'ok']].map((r, i) => (
                <tr key={i}><td className="mono cell-sub">{r[0]}</td><td>{r[1]}</td><td className="r mono">{r[2] === '0.00' ? 'CHF 0.00' : <span style={{ color: 'var(--warn)' }}>CHF {r[2]}</span>}</td><td><Badge tone={r[3]} dot={r[3] === 'warn'}>{r[3] === 'ok' ? 'Résolu' : 'Écart corrigé'}</Badge></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {credit && (
        <Sheet title="Émettre un crédit / avoir" sub={credit.name} onClose={() => setCredit(null)}
          footer={<><Btn variant="gh" onClick={() => setCredit(null)}>Annuler</Btn><Btn variant="ok" onClick={() => { ctx.toast('Crédit émis · note PDF envoyée au patron', 'ok'); setCredit(null); }}>Émettre</Btn></>}>
          <Field label="Bar concerné"><Input defaultValue={credit.name} readOnly /></Field>
          <Field label="Type" req><NativeSelect options={['Crédit commercial', "Correction d'erreur", 'Geste commercial']} value="Geste commercial" onChange={() => {}} /></Field>
          <Field label="Montant (CHF)" req><Input type="number" step="0.05" placeholder="120.00" /></Field>
          <Field label="Motif" req hint="Inclus dans la note PDF au patron"><Textarea placeholder="Compensation incident PSP du 04 juin…" /></Field>
        </Sheet>
      )}
    </div>
  );
}

Object.assign(window, { ModClients, ModTransactions, ModCommissions });
