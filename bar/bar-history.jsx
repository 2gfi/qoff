/* QOff Back-Office Bar — Historique commandes, Remboursements, Profil & établissements. */

const OSTAT_TONE = { claimed: 'ok', ready: 'info', preparing: 'warn', pending: 'plain', cancelled: 'er' };
const PSP_TONE2 = { success: 'ok', refunded: 'info', partial: 'warn', failed: 'er', pending: 'plain' };

/* ===================== HISTORIQUE ===================== */
function HistoryModule({ ctx }) {
  const [period, setPeriod] = useState({ mode: 'month' });
  const [status, setStatus] = useState('Tous');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState(null);
  const [refundFor, setRefundFor] = useState(null);
  const pageSize = 12;
  const all = QData.impOrders.filter(o => QData.inPeriod(o.date, period) && (status === 'Tous' || QData.ostat[o.status] === status));
  const total = all.length;
  const rows = all.slice(page * pageSize, page * pageSize + pageSize);
  const ca = all.filter(o => o.psp !== 'refunded' && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const basket = total ? ca / total : 0;
  const summary = (o) => o.items.map(it => it.qty + '× ' + it.name).join(' · ');
  const trunc = (name) => '+41 7' + (name.length % 9) + ' ••• •• ' + ('0' + (name.charCodeAt(0) % 90 + 10)).slice(-2);
  useEffect(() => { setPage(0); }, [period, status]);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div className="filter-bar" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <PeriodPicker value={period} onChange={setPeriod} />
          <Select value={status} onChange={setStatus} options={['Tous', 'Récupérée', 'Annulée']} />
        </div>
        <Btn variant="gh" size="sm" icon={<Icon.download size={14} />} onClick={() => ctx.toast('Export CSV de l’historique généré', 'ok')}>Exporter CSV</Btn>
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <KPI label="Commandes" value={total} />
        <KPI label="Chiffre d'affaires" cur="CHF" value={ca.toLocaleString('fr-CH', { maximumFractionDigits: 0 })} />
        <KPI label="Panier moyen" cur="CHF" value={basket ? basket.toFixed(2) : '—'} />
      </div>
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Commande</th><th>Date & heure</th><th>Articles</th><th>Canal</th><th>Client</th><th className="r">Montant</th><th>Statut</th><th className="r"></th></tr></thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id} className="clk" onClick={() => setDetail(o)}>
                <td className="mono cell-strong">{o.id}</td>
                <td className="cell-sub">{QData.fmtDate(o.date)} · <span className="mono">{QData.fmtTime(o.date)}</span></td>
                <td style={{ maxWidth: 230 }}><div className="cell-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary(o)}</div></td>
                <td><Badge tone={o.channel === 'App' ? 'info' : 'plain'}>{o.channel}</Badge></td>
                <td className="cell-sub mono">{trunc(o.client)}</td>
                <td className="r mono cell-strong">{QData.CHF(o.total)}</td>
                <td><Badge tone={OSTAT_TONE[o.status]} dot={o.status === 'claimed'}>{QData.ostat[o.status]}</Badge></td>
                <td className="r"><Icon.chevRight size={15} style={{ color: 'var(--g400)' }} /></td>
              </tr>
            ))}
            {total === 0 && <tr><td colSpan={8}><Empty icon={<Icon.clock size={20} />} title="Aucune commande">Aucune commande sur cette période.</Empty></td></tr>}
          </tbody>
        </table>
        {total > pageSize && <Pager page={page} pageSize={pageSize} total={total} onPage={setPage} />}
      </div>

      {detail && (
        <Sheet title={detail.id} sub={QData.fmtDate(detail.date) + ' · ' + QData.fmtTime(detail.date)} onClose={() => setDetail(null)} width={440}
          footer={detail.status !== 'cancelled' && detail.psp !== 'refunded'
            ? <><Btn variant="gh" onClick={() => setDetail(null)}>Fermer</Btn><Btn variant="er" icon={<Icon.transfer size={14} />} onClick={() => { setRefundFor(detail); setDetail(null); }}>Rembourser</Btn></>
            : <Btn variant="gh" full onClick={() => setDetail(null)}>Fermer</Btn>}>
          <div className="card card-pad" style={{ background: 'var(--g50)', marginBottom: 16 }}>
            <div className="kv"><span className="k">Statut</span><span className="v"><Badge tone={OSTAT_TONE[detail.status]} dot={detail.status === 'claimed'}>{QData.ostat[detail.status]}</Badge></span></div>
            <div className="kv"><span className="k">Paiement</span><span className="v"><Badge tone={PSP_TONE2[detail.psp]}>{QData.psp[detail.psp]}</Badge></span></div>
            <div className="kv"><span className="k">Canal</span><span className="v">{detail.channel}</span></div>
            <div className="kv"><span className="k">Client</span><span className="v mono">{trunc(detail.client)}</span></div>
            <div className="kv"><span className="k">Réf. PSP</span><span className="v mono">WAL-{detail.id.replace('#', '').replace('QO-', '')}</span></div>
          </div>
          <div className="lbl" style={{ marginBottom: 8 }}>Détail</div>
          {detail.items.map((it, i) => <div key={i} className="kv"><span className="k"><b style={{ color: 'var(--or)' }}>{it.qty}×</b> {it.name}</span><span className="v mono">{QData.CHF(it.qty * it.price)}</span></div>)}
          <div className="kv" style={{ borderTop: '1px solid var(--g200)', marginTop: 4, paddingTop: 10 }}><span className="k" style={{ fontWeight: 700, color: 'var(--g800)' }}>Total</span><span className="v mono" style={{ fontSize: 15 }}>{QData.CHF(detail.total)}</span></div>
          <div className="card card-pad" style={{ marginTop: 14, background: detail.status !== 'cancelled' && detail.psp !== 'refunded' ? 'var(--warnl)' : 'var(--g100)', border: 'none' }}>
            <div style={{ fontSize: 12, color: 'var(--g600)', display: 'flex', gap: 7 }}>
              <Icon.info size={14} />
              {detail.status !== 'cancelled' && detail.psp !== 'refunded' ? 'Remboursable jusqu’à 14 jours après la commande.' : 'Commande déjà remboursée ou annulée — hors délai de remboursement.'}
            </div>
          </div>
        </Sheet>
      )}
      {refundFor && <HistRefundModal o={refundFor} onClose={() => setRefundFor(null)} onConfirm={() => { ctx.toast('Remboursement de ' + refundFor.id + ' confirmé', 'er'); setRefundFor(null); }} />}
    </div>
  );
}
function HistRefundModal({ o, onClose, onConfirm }) {
  return (
    <Modal icon={<Icon.transfer size={22} />} iconTone="er" title="Rembourser cette commande ?" onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="er" onClick={onConfirm}>Rembourser {QData.CHF(o.total)}</Btn></>}>
      <p>Le montant de <b>{QData.CHF(o.total)}</b> sera remboursé au client via le PSP. Cette action est définitive et tracée.</p>
    </Modal>
  );
}

/* ===================== REMBOURSEMENTS ===================== */
function RefundsModule({ ctx }) {
  const [period, setPeriod] = useState({ mode: 'month' });
  const list = BarData.refunds;
  const totalAmt = list.reduce((s, r) => s + r.amount, 0);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <PeriodPicker value={period} onChange={setPeriod} />
        <Btn variant="gh" size="sm" icon={<Icon.download size={14} />} onClick={() => ctx.toast('Export CSV des remboursements généré', 'ok')}>Exporter CSV</Btn>
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <KPI label="Remboursements" value={list.length} />
        <div className="kpi"><div className="k-lbl">Total remboursé</div><div className="k-val" style={{ color: 'var(--er)' }}><span className="cur" style={{ color: 'var(--er)' }}>−CHF</span>{totalAmt.toFixed(2)}</div><div className="k-delta"><Icon.transfer size={13} /> sur la période</div></div>
      </div>
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Commande</th><th>Articles remboursés</th><th>Motif</th><th>Par</th><th>Date</th><th className="r">Montant</th></tr></thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td className="mono cell-strong">{r.id}</td>
                <td className="cell-sub">{r.items}</td>
                <td><Badge tone="plain">{r.reason}</Badge></td>
                <td className="cell-sub">{r.by}</td>
                <td className="cell-sub">{r.date}</td>
                <td className="r mono" style={{ color: 'var(--er)', fontWeight: 600 }}>−{QData.CHF(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== PROFIL & ÉTABLISSEMENTS ===================== */
/* Gestionnaire de photos du bar (POC : vignettes d'ambiance, couverture, suppression, réordonnable au drag) */
const BAR_PHOTO_GRADS = [
  'linear-gradient(135deg,#FF9A3C,#E55A28)', 'linear-gradient(135deg,#5BC8AC,#1D9E75)',
  'linear-gradient(140deg,#8B5CF6,#3B82F6)', 'linear-gradient(135deg,#F4B860,#FF6B35)',
  'linear-gradient(150deg,#2A2826,#5A5550)', 'linear-gradient(135deg,#60A5FA,#6D3DE0)',
];
function BarPhotos({ ctx }) {
  const [photos, setPhotos] = useState(() => [
    { id: 'p1', g: 0, cap: 'Terrasse' }, { id: 'p2', g: 1, cap: 'Bar & comptoir' }, { id: 'p3', g: 3, cap: 'Cocktails' },
  ]);
  const [drag, setDrag] = useState(null), [over, setOver] = useState(null);
  const drop = (tid) => { if (drag && drag !== tid) { setPhotos(p => { const a = [...p]; const fi = a.findIndex(x => x.id === drag); const [it] = a.splice(fi, 1); const ti = a.findIndex(x => x.id === tid); a.splice(ti < 0 ? a.length : ti, 0, it); return a; }); ctx.toast('Ordre des photos mis à jour', 'info'); } setDrag(null); setOver(null); };
  const add = () => { const id = 'p' + Date.now(); setPhotos(p => [...p, { id, g: p.length % BAR_PHOTO_GRADS.length, cap: 'Nouvelle photo' }]); ctx.toast('Photo ajoutée', 'ok'); };
  const del = (id) => { setPhotos(p => p.filter(x => x.id !== id)); ctx.toast('Photo supprimée', 'er'); };
  const setCover = (id) => { setPhotos(p => { const f = p.find(x => x.id === id); return [f, ...p.filter(x => x.id !== id)]; }); ctx.toast('Photo de couverture mise à jour', 'ok'); };
  return (
    <div className="photo-mgr">
      {photos.map((ph, i) => (
        <div key={ph.id} draggable
          onDragStart={() => setDrag(ph.id)}
          onDragOver={(e) => { e.preventDefault(); setOver(ph.id); }}
          onDrop={() => drop(ph.id)}
          onDragEnd={() => { setDrag(null); setOver(null); }}
          className={'photo-tile' + (drag === ph.id ? ' dragging' : '') + (over === ph.id ? ' dragover' : '')}
          style={{ background: BAR_PHOTO_GRADS[ph.g] }}>
          {i === 0 ? <span className="pt-cover-badge"><Icon.check size={11} /> Couverture</span> : null}
          <span className="pt-grip"><Icon.grip size={14} /></span>
          <div className="pt-actions">
            {i !== 0 ? <span className="pt-btn" title="Définir comme couverture" onClick={() => setCover(ph.id)}><Icon.eye size={14} /></span> : null}
            <span className="pt-btn" title="Supprimer" onClick={() => del(ph.id)}><Icon.trash size={14} /></span>
          </div>
          <span style={{ position: 'absolute', bottom: 7, right: 9, fontSize: 11, fontWeight: 600, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.4)' }}>{ph.cap}</span>
        </div>
      ))}
      <button type="button" className="photo-add" onClick={add}><Icon.plus size={18} /> Ajouter une photo</button>
    </div>
  );
}

function ProfileModule({ ctx }) {
  const [accept, setAccept] = useState(true);
  const [hh, setHh] = useState(true);
  const [newBar, setNewBar] = useState(false);
  const [closeBar, setCloseBar] = useState(null);
  const bar = ctx.bar;
  return (
    <div style={{ maxWidth: 760 }}>
      <div className="sec">
        <SectionHead title="Réglages du bar" sub="Visibles par vos clients" />
        <div className="card card-pad">
          <Field label="Nom du bar"><Input defaultValue={bar.name} /></Field>
          <Field label="Description (visible client)"><Textarea defaultValue="Bar de plage les pieds dans l’eau, cocktails et planches à partager. Commande sans file d’attente." /></Field>
          <Field label="Photos du bar" hint="La 1ʳᵉ photo sert de couverture. Glissez pour réordonner."><BarPhotos ctx={ctx} /></Field>
          <div className="form-grid-2">
            <Field label="Langue principale"><NativeSelect options={['Français', 'Deutsch', 'Italiano', 'English']} value="Français" onChange={() => {}} /></Field>
            <Field label="TVA par défaut" hint="Appliquée à tout nouvel article"><NativeSelect options={[{ value: '8.1', label: '8.1% (alcool)' }, { value: '2.6', label: '2.6% (food/soft)' }]} value="8.1" onChange={() => {}} /></Field>
          </div>
          <div className="toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--g50)', borderRadius: 10, marginBottom: 8 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>Accepter les commandes</div><div className="cell-sub">Coupez pour mettre le bar en pause</div></div>
            <Toggle on={accept} onClick={() => { setAccept(a => !a); ctx.toast(accept ? 'Commandes en pause' : 'Commandes réactivées', accept ? 'info' : 'ok'); }} />
          </div>
          <div className="toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--g50)', borderRadius: 10 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>Happy Hour</div><div className="cell-sub">Raccourci · configuration dans Menu & Prix</div></div>
            <Toggle on={hh} onClick={() => setHh(h => !h)} />
          </div>
          <div style={{ marginTop: 14 }}><Btn variant="or" onClick={() => ctx.toast('Réglages enregistrés', 'ok')}>Enregistrer</Btn></div>
        </div>
      </div>

      <div className="sec">
        <SectionHead title="Mes établissements" sub="Gérez vos bars" action={<Btn variant="or" size="sm" icon={<Icon.plus size={14} />} onClick={() => setNewBar(true)}>Soumettre un nouveau bar</Btn>} />
        <div className="card card-pad">
          {[...BarData.BARS, ...BarData.BARS_CLOSED].map(b => (
            <div key={b.id} className="estab-row">
              <span className="estab-ic">{b.emoji}</span>
              <div className="estab-info">
                <div className="estab-name">{b.name} {b.status === 'closed' && <span className="badge closed" style={{ marginLeft: 6 }}>Clôturé</span>}</div>
                <div className="estab-meta">{b.city} · Commission {b.comm}% · depuis {b.created}</div>
              </div>
              <div className="estab-ca">{b.status === 'closed' ? '—' : QData.CHF(b.caMonth)}<div className="tva-badge">CA ce mois</div></div>
              <RowMenu items={b.status === 'closed'
                ? [{ icon: <Icon.eye size={16} />, label: 'Voir (lecture seule)', onClick: () => ctx.toast('Établissement clôturé — lecture seule', 'info') }]
                : [
                  { icon: <Icon.settings size={16} />, label: 'Gérer', onClick: () => ctx.toast('Ouverture de ' + b.name, 'info') },
                  { icon: <Icon.clock size={16} />, label: 'Suspendre', onClick: () => ctx.toast(b.name + ' suspendu', 'info') },
                  { sep: true },
                  { icon: <Icon.ban size={16} />, label: 'Fermer définitivement', tone: 'danger', onClick: () => setCloseBar(b) },
                ]} />
            </div>
          ))}
        </div>
      </div>

      <div className="sec">
        <SectionHead title="Commission QOff" sub="Lecture seule — définie par QOff" />
        <div className="card card-pad" style={{ background: 'var(--g100)', border: 'none' }}>
          <div className="kv"><span className="k">Taux de commission actuel</span><span className="v mono">{bar.comm} %</span></div>
          <div className="kv"><span className="k">Début du contrat</span><span className="v">{bar.created}</span></div>
          <div className="kv" style={{ border: 'none' }}><span className="k">Prélèvement</span><span className="v">Automatique · mensuel</span></div>
        </div>
      </div>

      {newBar && <NewBarSheet onClose={() => setNewBar(false)} onSave={() => { ctx.toast('Demande envoyée à QOff', 'ok'); setNewBar(false); }} />}
      {closeBar && <CloseBarModal bar={closeBar} onClose={() => setCloseBar(null)} onConfirm={() => { ctx.toast(closeBar.name + ' fermé définitivement', 'er'); setCloseBar(null); }} />}
    </div>
  );
}
function NewBarSheet({ onClose, onSave }) {
  const [d, setD] = useState({ name: '', address: '', city: '', country: 'Suisse', desc: '' });
  return (
    <Sheet title="Soumettre un nouveau bar" sub="Validation par l’équipe QOff" onClose={onClose} width={460}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!d.name || !d.address || !d.city} onClick={onSave}>Soumettre à QOff</Btn></>}>
      <Field label="Nom du bar" req><Input value={d.name} onChange={e => setD({ ...d, name: e.target.value })} placeholder="Plage Bleue" /></Field>
      <Field label="Adresse" req><Input value={d.address} onChange={e => setD({ ...d, address: e.target.value })} placeholder="Quai Perdonnet 12" /></Field>
      <div className="form-grid-2">
        <Field label="Ville" req><Input value={d.city} onChange={e => setD({ ...d, city: e.target.value })} placeholder="Vevey" /></Field>
        <Field label="Pays"><NativeSelect options={['Suisse', 'France', 'Allemagne', 'Italie']} value={d.country} onChange={v => setD({ ...d, country: v })} /></Field>
      </div>
      <Field label="Description"><Textarea value={d.desc} onChange={e => setD({ ...d, desc: e.target.value })} placeholder="Décrivez votre établissement." /></Field>
      <div className="hint" style={{ display: 'flex', gap: 6 }}><Icon.info size={13} /> Votre demande sera examinée par l’équipe QOff. Confirmation sous 24–48h.</div>
    </Sheet>
  );
}
function CloseBarModal({ bar, onClose, onConfirm }) {
  const [txt, setTxt] = useState('');
  return (
    <Modal icon={<Icon.ban size={22} />} iconTone="er" title="Fermer définitivement ?" onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="er" disabled={txt !== 'CONFIRMER'} onClick={onConfirm}>Fermer définitivement</Btn></>}>
      <p style={{ marginBottom: 14 }}>La fermeture de <b>{bar.name}</b> est <b>irréversible</b>. Le bar passe en lecture seule, les commandes sont stoppées. Tapez <b className="mono">CONFIRMER</b> pour valider.</p>
      <Input value={txt} onChange={e => setTxt(e.target.value)} placeholder="CONFIRMER" autoFocus />
    </Modal>
  );
}

Object.assign(window, { HistoryModule, RefundsModule, ProfileModule });
