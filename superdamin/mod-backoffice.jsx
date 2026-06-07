/* QOff Super Admin — Bar back-office sub-views used in impersonation:
   ArticleSheet (édition menu/prix), BarStats (statistiques), BarTeam (équipe), BarHistory (historique commandes).
   Exported to window for use by ModImpersonation. */

const ROLE_TONE = { Manager: 'manager', Barman: 'barman', Serveur: 'serveur', Cuisine: 'cuisine' };
const ORD_TONE = { claimed: 'ok', ready: 'info', preparing: 'warn', pending: 'plain', cancelled: 'er' };
const PSP_TONE = { success: 'ok', refunded: 'info', partial: 'warn', failed: 'er', pending: 'plain' };
function DeltaChip({ trend, d }) {
  return <span className={'delta-chip ' + (trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'flat')}>
    {trend === 'up' ? <Icon.trendUp size={12} /> : trend === 'down' ? <Icon.trendDown size={12} /> : null}{d}
  </span>;
}

/* ----- Article editor (menu + prix) ----- */
function ArticleSheet({ ctx, sheet, onClose, onSave }) {
  const edit = sheet.mode === 'edit';
  const it0 = sheet.item || { emoji: '🍹', name: '', cat: 'Cocktails', price: 0, stock: true, tags: [], desc: '' };
  const [d, setD] = useState(() => ({ ...it0, tags: [...(it0.tags || [])] }));
  const cats = QD.categories.map(c => c.names ? c.names.FR : c.name);
  const ALL_TAGS = ['Nouveau', 'Happy Hour', 'Signature', 'Bio'];
  const toggleTag = (t) => setD(s => ({ ...s, tags: s.tags.includes(t) ? s.tags.filter(x => x !== t) : [...s.tags, t] }));
  return (
    <Sheet title={edit ? 'Modifier l’article' : 'Nouvel article'} sub={edit ? d.name : 'Carte du bar'} onClose={onClose} width={440}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!d.name} onClick={() => onSave(d)}>{edit ? 'Enregistrer' : 'Ajouter à la carte'}</Btn></>}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="Icône"><Input value={d.emoji} onChange={e => setD({ ...d, emoji: e.target.value })} maxLength={2} style={{ fontSize: 20, textAlign: 'center', width: 64 }} /></Field>
        <div style={{ flex: 1 }}><Field label="Nom de l’article" req><Input value={d.name} onChange={e => setD({ ...d, name: e.target.value })} placeholder="Spritz Aperol" /></Field></div>
      </div>
      <div className="form-grid-2">
        <Field label="Catégorie" req><NativeSelect options={cats} value={d.cat} onChange={v => setD({ ...d, cat: v })} /></Field>
        <Field label="Prix" req hint="TVA incluse">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: 11, fontSize: 13, color: 'var(--g400)', fontWeight: 600 }}>CHF</span>
            <Input type="number" step="0.5" min="0" value={d.price} onChange={e => setD({ ...d, price: +e.target.value })} style={{ paddingLeft: 44, fontVariantNumeric: 'tabular-nums' }} />
          </div>
        </Field>
      </div>
      <Field label="Description" hint="Affichée côté client (optionnel)"><Textarea value={d.desc} onChange={e => setD({ ...d, desc: e.target.value })} placeholder="Aperol, prosecco, eau pétillante, orange." style={{ minHeight: 60 }} /></Field>
      <Field label="Badges">
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {ALL_TAGS.map(t => <button key={t} className={'badge ' + (d.tags.includes(t) ? 'or' : 'plain')} style={{ cursor: 'pointer', border: d.tags.includes(t) ? '1px solid var(--or)' : '1px solid transparent' }} onClick={() => toggleTag(t)}>{d.tags.includes(t) ? <Icon.check size={11} /> : null}{t}</button>)}
        </div>
      </Field>
      <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Toggle on={d.stock} onClick={() => setD({ ...d, stock: !d.stock })} /><span style={{ fontSize: 13 }}>{d.stock ? 'En stock — visible' : 'Épuisé — masqué côté client'}</span></div>
    </Sheet>
  );
}

/* ----- Statistiques ----- */
function DayBars({ data }) {
  const max = Math.max(...data.map(d => d.ca));
  return (
    <div className="daybars">
      {data.map((d, i) => (
        <div key={i} className="daybar-col" title={QD.CHF(d.ca) + ' · ' + d.orders + ' cmd'}>
          <div className="daybar-val">{(d.ca / 1000).toFixed(1)}k</div>
          <div className="daybar-track"><div className="daybar-fill" style={{ height: Math.max(4, d.ca / max * 100) + '%' }} /></div>
          <div className="daybar-day">{d.day}<span>{d.date}</span></div>
        </div>
      ))}
    </div>
  );
}
function HourBars({ data }) {
  const max = Math.max(...data);
  return (
    <div className="hourbars">
      {data.map((v, i) => <div key={i} className="hourbar"><div className="hourbar-fill" style={{ height: Math.max(3, v / max * 100) + '%' }} /><span>{11 + i}</span></div>)}
    </div>
  );
}
function BarStats({ ctx, b }) {
  const [period, setPeriod] = useState({ mode: 'month' });
  const st = QD.impStats;
  const info = QD.periodInfo(period);
  const baseCA = st.catBreak.reduce((s, c) => s + c.ca, 0);
  const ca = Math.round(baseCA * info.mult);
  const orders = Math.round(1684 * info.mult);
  const fmtK = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : '' + n;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div className="sec-title">Statistiques · <span style={{ color: 'var(--g400)', fontWeight: 600 }}>{info.label}</span></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PeriodPicker value={period} onChange={setPeriod} />
          <Btn variant="gh" size="sm" icon={<Icon.download size={14} />} onClick={() => ctx.toast('Export CSV des statistiques généré', 'ok')}>Exporter</Btn>
        </div>
      </div>

      <div className="kpi-row">
        <KPI label="Chiffre d'affaires" cur="CHF" value={fmtK(ca)} dir="up" delta={'+8 % vs ' + info.prev} />
        <KPI label="Commandes" value={orders} dir="up" delta={'+5 % vs ' + info.prev} />
        <KPI label="Panier moyen" cur="CHF" value={b.basket.toFixed(2)} dir="up" delta="+2 %" />
        <KPI label="Temps de prépa. moy." value="3,2 min" dir="down" delta="-0,4 min" />
      </div>

      <div className="grid2" style={{ marginBottom: 18 }}>
        {/* % par catégorie en fonction du chiffre */}
        <div className="card">
          <div className="card-h"><h3>Répartition par catégorie</h3><span className="grow" /><span className="cell-sub">% du CA</span></div>
          <div className="card-pad" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Donut data={st.catBreak} size={128} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {st.catBreak.map(c => (
                <div key={c.name} className="statlist-row">
                  <span className="sw" style={{ background: c.color }} />
                  <span className="lab">{c.name}</span>
                  <span className="cell-sub mono">{QD.CHF(Math.round(c.ca * info.mult))}</span>
                  <span className="mono" style={{ fontWeight: 700, width: 34, textAlign: 'right' }}>{c.v}%</span>
                  <DeltaChip trend={c.trend} d={c.d} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Affluence par heure */}
        <div className="card">
          <div className="card-h"><h3>Affluence par heure</h3><span className="grow" /><span className="cell-sub">commandes</span></div>
          <div className="card-pad">
            <HourBars data={st.byHour} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--g600)' }}>
              <span>Pic d'affluence <b style={{ color: 'var(--g800)' }}>21h–22h</b></span>
              <span>Heure creuse <b style={{ color: 'var(--g800)' }}>11h–12h</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance par jour */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Performance par jour</h3><span className="grow" /><span className="cell-sub">CA · 14 derniers jours</span></div>
        <div className="card-pad"><DayBars data={st.daily} /></div>
      </div>

      {/* Top consommations */}
      <div className="sec">
        <SectionHead title="Top consommations" sub="Articles les plus vendus sur la période" action={<Btn variant="gh" size="sm" onClick={() => ctx.toast('Voir tous les articles', 'info')}>Tout voir</Btn>} />
        <div className="tablewrap">
          <table className="grid">
            <thead><tr><th>Article</th><th>Catégorie</th><th className="r">Quantité</th><th className="r">CA</th><th className="r">Tendance</th></tr></thead>
            <tbody>
              {st.topItems.map((it, i) => (
                <tr key={it.name}>
                  <td><div className="row-id"><span className="pos-chip mono">{i + 1}</span><span className="cell-strong">{it.name}</span></div></td>
                  <td><Badge tone="plain">{it.cat}</Badge></td>
                  <td className="r mono cell-strong">{Math.round(it.qty * info.mult)}</td>
                  <td className="r mono">{QD.CHF(Math.round(it.ca * info.mult))}</td>
                  <td className="r"><DeltaChip trend={it.trend} d={it.d} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ----- Équipe ----- */
function BarTeam({ ctx, b }) {
  const [team, setTeam] = useState(() => QD.impTeam.map(m => ({ ...m })));
  const [sheet, setSheet] = useState(null);   // { mode, member }
  const [del, setDel] = useState(null);
  const [q, setQ] = useState('');
  const rows = team.filter(m => q === '' || m.name.toLowerCase().includes(q.toLowerCase()));
  const save = (d) => {
    if (sheet.mode === 'create') { setTeam(t => [...t, { ...d, id: 'T' + Date.now(), name: d.first + ' ' + d.last, since: 'aujourd’hui', shifts: 0 }]); ctx.toast('Membre invité — email envoyé à ' + d.email, 'ok'); }
    else { setTeam(t => t.map(m => m.id === d.id ? { ...m, ...d, name: d.first + ' ' + d.last } : m)); ctx.toast('Membre mis à jour', 'ok'); }
    setSheet(null);
  };
  const remove = () => { setTeam(t => t.filter(m => m.id !== del.id)); ctx.toast(del.name + ' retiré de l’équipe', 'er'); setDel(null); };
  const stTone = { active: 'ok', invited: 'warn', off: 'closed' };
  const stLabel = { active: 'Actif', invited: 'Invité', off: 'Congé' };
  return (
    <div>
      <div className="toolbar">
        <Search value={q} onChange={setQ} placeholder="Rechercher un membre…" />
        <span className="spacer" />
        <span className="cell-sub">{team.filter(m => m.status === 'active').length} actifs · {team.length} au total</span>
        <Btn variant="or" size="sm" icon={<Icon.plus size={14} />} onClick={() => setSheet({ mode: 'create', member: { first: '', last: '', role: 'Barman', email: '', phone: '', status: 'invited' } })}>Ajouter un membre</Btn>
      </div>
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Membre</th><th>Rôle</th><th>Contact</th><th>Statut</th><th>Dans l'équipe depuis</th><th className="r">Services</th><th className="r">Actions</th></tr></thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.id}>
                <td><div className="row-id"><span className="avatar-sm" style={{ background: m.role === 'Manager' ? 'linear-gradient(135deg,#8B5CF6,#6D3DE0)' : 'var(--g400)' }}>{m.first[0]}{m.last[0]}</span><span className="cell-strong">{m.name}</span></div></td>
                <td><span className={'role-chip ' + ROLE_TONE[m.role]}>{m.role}</span></td>
                <td><div className="cell-strong" style={{ fontSize: 12.5 }}>{m.email}</div><div className="cell-sub mono">{m.phone}</div></td>
                <td><Badge tone={stTone[m.status]} dot={m.status === 'active'}>{stLabel[m.status]}</Badge></td>
                <td className="cell-sub">{m.since}</td>
                <td className="r mono">{m.shifts}</td>
                <td className="r"><RowMenu items={[
                  { icon: <Icon.edit size={16} />, label: 'Modifier', onClick: () => setSheet({ mode: 'edit', member: m }) },
                  { icon: <Icon.key size={16} />, label: 'Renvoyer l’accès', onClick: () => ctx.toast('Accès renvoyé à ' + m.email, 'info') },
                  { sep: true },
                  { icon: <Icon.trash size={16} />, label: 'Retirer de l’équipe', tone: 'danger', onClick: () => setDel(m) },
                ]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sheet && <TeamSheet sheet={sheet} onClose={() => setSheet(null)} onSave={save} />}
      {del && (
        <Modal icon={<Icon.trash size={22} />} iconTone="er" title="Retirer ce membre ?" onClose={() => setDel(null)}
          footer={<><Btn variant="gh" onClick={() => setDel(null)}>Annuler</Btn><Btn variant="er" onClick={remove}>Retirer</Btn></>}>
          <p><b>{del.name}</b> perdra l'accès au terminal et à l'application barman de {b.name}. L'historique de ses services est conservé.</p>
        </Modal>
      )}
    </div>
  );
}
function TeamSheet({ sheet, onClose, onSave }) {
  const [d, setD] = useState(() => ({ ...sheet.member }));
  const edit = sheet.mode === 'edit';
  return (
    <Sheet title={edit ? 'Modifier le membre' : 'Ajouter un membre'} sub={edit ? d.name : 'Équipe du bar'} onClose={onClose} width={440}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!d.first || !d.email} onClick={() => onSave(d)}>{edit ? 'Enregistrer' : 'Inviter le membre'}</Btn></>}>
      <div className="form-grid-2"><Field label="Prénom" req><Input value={d.first} onChange={e => setD({ ...d, first: e.target.value })} placeholder="Lucas" /></Field><Field label="Nom" req><Input value={d.last} onChange={e => setD({ ...d, last: e.target.value })} placeholder="Perret" /></Field></div>
      <Field label="Rôle" req>
        <div className="tabs" style={{ display: 'flex', flexWrap: 'wrap' }}>{['Manager', 'Barman', 'Serveur', 'Cuisine'].map(r => <button key={r} className={d.role === r ? 'active' : ''} onClick={() => setD({ ...d, role: r })}>{r}</button>)}</div>
      </Field>
      <div className="form-grid-2"><Field label="Email" req><Input value={d.email} onChange={e => setD({ ...d, email: e.target.value })} placeholder="lucas@bar.ch" /></Field><Field label="Téléphone"><Input value={d.phone} onChange={e => setD({ ...d, phone: e.target.value })} placeholder="+41 78 000 00 00" /></Field></div>
      {edit && <Field label="Statut"><NativeSelect options={[{ value: 'active', label: 'Actif' }, { value: 'invited', label: 'Invité' }, { value: 'off', label: 'En congé' }]} value={d.status} onChange={v => setD({ ...d, status: v })} /></Field>}
      <div className="hint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon.info size={13} /> Le membre reçoit un lien d'accès au terminal barman. Aucun mot de passe à gérer.</div>
    </Sheet>
  );
}

/* ----- Historique des commandes ----- */
function BarHistory({ ctx, b }) {
  const [period, setPeriod] = useState({ mode: 'month' });
  const [status, setStatus] = useState('Tous');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState(null);
  const pageSize = 12;
  const all = QD.impOrders.filter(o => QD.inPeriod(o.date, period) && (status === 'Tous' || QD.ostat[o.status] === status));
  const total = all.length;
  const rows = all.slice(page * pageSize, page * pageSize + pageSize);
  const ca = all.filter(o => o.psp !== 'refunded' && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const basket = total ? ca / all.length : 0;
  const summary = (o) => o.items.map(it => it.qty + '× ' + it.name).join(' · ');
  React.useEffect(() => { setPage(0); }, [period, status]);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <PeriodPicker value={period} onChange={setPeriod} />
          <Select value={status} onChange={setStatus} options={['Tous', 'Récupérée', 'Annulée']} />
        </div>
        <Btn variant="gh" size="sm" icon={<Icon.download size={14} />} onClick={() => ctx.toast('Export CSV de l’historique généré', 'ok')}>Exporter</Btn>
      </div>
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <KPI label="Commandes" value={total} />
        <KPI label="Chiffre d'affaires" cur="CHF" value={ca.toLocaleString('fr-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} />
        <KPI label="Panier moyen" cur="CHF" value={basket ? basket.toFixed(2) : '—'} />
      </div>
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Commande</th><th>Date & heure</th><th>Articles</th><th>Canal</th><th>Client</th><th className="r">Montant</th><th>Statut</th><th className="r"></th></tr></thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id} className="clk" onClick={() => setDetail(o)}>
                <td className="mono cell-strong">{o.id}</td>
                <td className="cell-sub">{QD.fmtDate(o.date)} · <span className="mono">{QD.fmtTime(o.date)}</span></td>
                <td style={{ maxWidth: 230 }}><div className="cell-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary(o)}</div></td>
                <td><Badge tone={o.channel === 'App' ? 'info' : 'plain'}>{o.channel}</Badge></td>
                <td className="cell-sub">{o.client}</td>
                <td className="r mono cell-strong">{QD.CHF(o.total)}</td>
                <td><Badge tone={ORD_TONE[o.status]} dot={o.status === 'claimed'}>{QD.ostat[o.status]}</Badge></td>
                <td className="r"><Icon.chevRight size={15} style={{ color: 'var(--g400)' }} /></td>
              </tr>
            ))}
            {total === 0 && <tr><td colSpan={8}><Empty icon={<Icon.clock size={20} />} title="Aucune commande">Aucune commande sur cette période.</Empty></td></tr>}
          </tbody>
        </table>
        {total > pageSize && <Pager page={page} pageSize={pageSize} total={total} onPage={setPage} />}
      </div>
      {detail && (
        <Sheet title={detail.id} sub={QD.fmtDate(detail.date) + ' · ' + QD.fmtTime(detail.date)} onClose={() => setDetail(null)} width={440}
          footer={<><Btn variant="gh" onClick={() => setDetail(null)}>Fermer</Btn><Btn variant="purple" icon={<Icon.transfer size={14} />} onClick={() => { ctx.toast('Remboursement de ' + detail.id + ' [via admin]', 'purple'); setDetail(null); }}>Rembourser <span className="admin-tag"><Icon.sparkAdmin size={11} /> Admin</span></Btn></>}>
          <div className="card card-pad" style={{ background: 'var(--g50)', marginBottom: 16 }}>
            <div className="kv"><span className="k">Statut</span><span className="v"><Badge tone={ORD_TONE[detail.status]} dot={detail.status === 'claimed'}>{QD.ostat[detail.status]}</Badge></span></div>
            <div className="kv"><span className="k">Paiement</span><span className="v"><Badge tone={PSP_TONE[detail.psp]}>{QD.psp[detail.psp]}</Badge></span></div>
            <div className="kv"><span className="k">Canal</span><span className="v">{detail.channel}</span></div>
            <div className="kv"><span className="k">Client</span><span className="v">{detail.client}</span></div>
          </div>
          <div className="lbl" style={{ marginBottom: 8 }}>Détail</div>
          {detail.items.map((it, i) => (
            <div key={i} className="kv"><span className="k">{it.qty}× {it.name}</span><span className="v mono">{QD.CHF(it.qty * it.price)}</span></div>
          ))}
          <div className="kv" style={{ borderTop: '1px solid var(--g200)', marginTop: 4, paddingTop: 10 }}><span className="k" style={{ fontWeight: 700, color: 'var(--g800)' }}>Total</span><span className="v mono" style={{ fontSize: 15 }}>{QD.CHF(detail.total)}</span></div>
        </Sheet>
      )}
    </div>
  );
}

Object.assign(window, { ArticleSheet, BarStats, BarTeam, BarHistory });
