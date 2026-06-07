/* QOff Super Admin — Établissements: Bars, Patrons, Pays & Config */

/* small hook: publish topbar actions to the shell */
function useTopActions(ctx, node, deps) {
  useEffect(() => { ctx.setTopActions(node); return () => ctx.setTopActions(null); }, deps || []);
}

/* ============================ BARS ============================ */
function ModBars({ ctx }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('Tous');
  const [country, setCountry] = useState('Tous');
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(null);        // {mode:'create'|'edit'|'validate', bar}
  const [confirm, setConfirm] = useState(null);    // {kind, bar}
  const [commEdit, setCommEdit] = useState(null);  // bar
  const pageSize = 8;

  useTopActions(ctx, <Btn variant="or" icon={<Icon.plus size={16} />} onClick={() => setSheet({ mode: 'create' })}>Nouveau bar</Btn>, []);

  let rows = QD.bars.filter(b =>
    (status === 'Tous' || QD.S[b.status] === status) &&
    (country === 'Tous' || b.country === country) &&
    (q === '' || (b.name + ' ' + b.city).toLowerCase().includes(q.toLowerCase())));
  const total = rows.length;
  rows = rows.slice(page * pageSize, page * pageSize + pageSize);

  const menu = (b) => [
    { icon: <Icon.eye size={16} />, label: 'Voir le back-office', tone: 'admin', onClick: () => ctx.impersonate(b) },
    { sep: true },
    { icon: <Icon.edit size={16} />, label: 'Modifier les infos', onClick: () => setSheet({ mode: 'edit', bar: b }) },
    b.status === 'active'
      ? { icon: <Icon.ban size={16} />, label: 'Suspendre', tone: 'danger', onClick: () => setConfirm({ kind: 'suspend', bar: b }) }
      : { icon: <Icon.check size={16} />, label: 'Activer', onClick: () => ctx.toast(b.name + ' réactivé', 'ok') },
    { icon: <Icon.wrench size={16} />, label: 'Mode maintenance', onClick: () => ctx.toast(b.name + ' en maintenance', 'info') },
    { icon: <Icon.transfer size={16} />, label: 'Transférer à un patron', onClick: () => setSheet({ mode: 'transfer', bar: b }) },
    { icon: <Icon.list size={16} />, label: "Voir les logs d'activité", onClick: () => setSheet({ mode: 'logs', bar: b }) },
    { sep: true },
    { icon: <Icon.lock size={16} />, label: 'Clôturer définitivement', tone: 'danger', onClick: () => setConfirm({ kind: 'close', bar: b }) },
  ];

  return (
    <div className="a-content-inner">
      {QD.pendingBars.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(226,75,74,.3)', background: 'var(--erl)', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>🔴</span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>{QD.pendingBars.length} bars en attente de validation</b><div className="cell-sub" style={{ color: '#9B2C2B' }}>Soumis par des patrons — à vérifier</div></div>
          <Btn variant="er" size="sm" onClick={() => setSheet({ mode: 'validate', bar: QD.pendingBars[0] })}>Valider</Btn>
        </div>
      )}
      <div className="toolbar">
        <Search value={q} onChange={v => { setQ(v); setPage(0); }} placeholder="Nom, ville…" />
        <Select value={status} onChange={v => { setStatus(v); setPage(0); }} options={['Tous', 'Actif', 'Suspendu', 'Essai', 'Maintenance', 'Clôturé']} />
        <Select value={country} onChange={v => { setCountry(v); setPage(0); }} options={[{ value: 'Tous', label: 'Tous pays' }, { value: 'CH', label: '🇨🇭 Suisse' }, { value: 'FR', label: '🇫🇷 France' }]} />
        <span className="spacer" />
        <span className="cell-sub">{total} établissement{total > 1 ? 's' : ''}</span>
      </div>
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Bar</th><th>Patron</th><th>Statut</th><th className="r">Commission</th><th className="r">CA mois</th><th className="r">Cmd. 7 j</th><th>Créé le</th><th className="r">Actions</th></tr></thead>
          <tbody>
            {rows.map(b => (
              <tr key={b.id}>
                <td><div className="cell-strong">{b.flag} {b.name}</div><div className="cell-sub">{b.city}</div></td>
                <td>{b.patron}</td>
                <td><StatusBadge status={b.status} /></td>
                <td className="r"><span className="inline-edit mono" onClick={() => setCommEdit(b)}>{b.comm} %<Icon.edit size={12} /></span></td>
                <td className="r mono cell-strong">{QD.money(b.ca, b.country === 'FR' ? 'EUR' : 'CHF')}</td>
                <td className="r mono">{b.o7}</td>
                <td className="cell-sub">{b.created}</td>
                <td className="r"><RowMenu items={menu(b)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={page} pageSize={pageSize} total={total} onPage={setPage} />
      </div>

      {sheet && (sheet.mode === 'create' || sheet.mode === 'edit') && <BarSheet ctx={ctx} sheet={sheet} onClose={() => setSheet(null)} />}
      {sheet && sheet.mode === 'validate' && <ValidateSheet ctx={ctx} bar={sheet.bar} onClose={() => setSheet(null)} />}
      {sheet && sheet.mode === 'transfer' && <TransferSheet ctx={ctx} bar={sheet.bar} onClose={() => setSheet(null)} />}
      {sheet && sheet.mode === 'logs' && <BarLogsSheet bar={sheet.bar} onClose={() => setSheet(null)} />}

      {commEdit && (
        <Modal icon={<Icon.commissions size={22} />} iconTone="ok" title="Taux de commission"
          onClose={() => setCommEdit(null)}
          footer={<><Btn variant="gh" onClick={() => setCommEdit(null)}>Annuler</Btn><Btn variant="or" onClick={() => { ctx.toast('Commission de ' + commEdit.name + ' mise à jour', 'ok'); setCommEdit(null); }}>Enregistrer</Btn></>}>
          <p style={{ marginBottom: 14 }}>Commission appliquée à <b>{commEdit.name}</b>. La modification est tracée dans l'audit trail.</p>
          <Field label="Taux (%)"><Input defaultValue={commEdit.comm} type="number" step="0.5" style={{ fontFamily: 'var(--ff)', fontVariantNumeric: 'tabular-nums' }} /></Field>
        </Modal>
      )}
      {confirm && <ConfirmDestruct ctx={ctx} confirm={confirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}

function BarSheet({ ctx, sheet, onClose }) {
  const edit = sheet.mode === 'edit';
  const b = sheet.bar || {};
  return (
    <Sheet title={edit ? 'Modifier le bar' : 'Nouvel établissement'} sub={edit ? b.name : 'Création d’un bar QOff'} onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" onClick={() => { ctx.toast(edit ? 'Bar mis à jour' : 'Établissement créé', 'ok'); onClose(); }}>{edit ? 'Sauvegarder' : "Créer l'établissement"}</Btn></>}>
      <Field label="Photos de l'établissement" hint="La première photo sert de couverture côté client"><PhotoGrid ctx={ctx} /></Field>
      <Field label="Nom du bar" req><Input defaultValue={b.name} placeholder="Le Jetée" /></Field>
      <Field label="Adresse" req><Input defaultValue={b.address} placeholder="Place de la Navigation 1, 1006 Lausanne" /></Field>
      <div className="form-grid-2">
        <Field label="Téléphone"><Input placeholder="+41 21 555 00 00" /></Field>
        <Field label="Email"><Input placeholder="contact@bar.ch" /></Field>
      </div>
      <div className="divider" />
      <div className="lbl" style={{ marginBottom: 10 }}>Entité légale (facturation)</div>
      <Field label="Raison sociale" req><Input placeholder="Le Jetée Sàrl" /></Field>
      <div className="form-grid-2">
        <Field label="Forme / nom de société"><Input placeholder="Sàrl" /></Field>
        <Field label="N° TVA" req><Input placeholder="CHE-123.456.789 TVA" style={{ fontVariantNumeric: 'tabular-nums' }} /></Field>
      </div>
      <div className="divider" />
      <div className="form-grid-2">
        <Field label="Pays" req><NativeSelect value={b.country || 'CH'} onChange={() => {}} options={[{ value: 'CH', label: '🇨🇭 Suisse' }, { value: 'FR', label: '🇫🇷 France' }]} /></Field>
        <Field label="Langue principale" req><NativeSelect options={['Français', 'Deutsch', 'Italiano', 'English']} value="Français" onChange={() => {}} /></Field>
      </div>
      <Field label="Patron associé" req><NativeSelect options={QD.patrons.map(p => ({ value: p.id, label: p.name }))} value={b.patronId || 'P1'} onChange={() => {}} /></Field>
      <div className="form-grid-2">
        <Field label="Taux de commission (%)" req hint="Défaut 3 %"><Input defaultValue={b.comm || 3} type="number" step="0.5" /></Field>
        <Field label="Statut initial"><NativeSelect options={['Actif', 'Essai']} value="Actif" onChange={() => {}} /></Field>
      </div>
      <Field label="Notes internes" hint="Non visible par le patron"><Textarea placeholder="Contexte, accord commercial…" /></Field>
    </Sheet>
  );
}

function ValidateSheet({ ctx, bar, onClose }) {
  return (
    <Sheet title="Validation d'un nouveau bar" sub={'Soumis ' + bar.submitted + ' par ' + bar.patron} onClose={onClose}
      footer={<><Btn variant="er" onClick={() => { ctx.toast('Demande refusée — motif envoyé', 'er'); onClose(); }}>Refuser</Btn><Btn variant="ok" onClick={() => { ctx.toast(bar.name + ' validé & activé', 'ok'); onClose(); }}>Valider & activer</Btn></>}>
      <div className="card card-pad" style={{ marginBottom: 16, background: 'var(--g50)' }}>
        <div className="kv"><span className="k">Nom</span><span className="v">{bar.flag} {bar.name}</span></div>
        <div className="kv"><span className="k">Ville</span><span className="v">{bar.city}</span></div>
        <div className="kv"><span className="k">Adresse</span><span className="v" style={{ maxWidth: 220 }}>{bar.address}</span></div>
        <div className="kv"><span className="k">Téléphone</span><span className="v mono">{bar.phone}</span></div>
        <div className="kv"><span className="k">Email</span><span className="v">{bar.email}</span></div>
        <div className="kv"><span className="k">Patron</span><span className="v">{bar.patron}</span></div>
        <div className="kv"><span className="k">Langue</span><span className="v">{bar.lang}</span></div>
      </div>
      <Field label="Notes QOff"><Textarea placeholder="Remarques internes sur la validation…" /></Field>
    </Sheet>
  );
}

function TransferSheet({ ctx, bar, onClose }) {
  return (
    <Sheet title="Transférer le bar" sub={bar.name + ' · ' + bar.city} onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="purple" onClick={() => { ctx.toast(bar.name + ' transféré', 'purple'); onClose(); }}>Transférer</Btn></>}>
      <p style={{ fontSize: 13, color: 'var(--g600)', marginBottom: 16 }}>Patron actuel : <b style={{ color: 'var(--g800)' }}>{bar.patron}</b>. Le transfert est tracé dans l'audit trail.</p>
      <Field label="Nouveau patron" req><NativeSelect options={QD.patrons.filter(p => p.name !== bar.patron).map(p => ({ value: p.id, label: p.name }))} value="" onChange={() => {}} /></Field>
      <Field label="Motif"><Textarea placeholder="Raison du transfert…" /></Field>
    </Sheet>
  );
}

function BarLogsSheet({ bar, onClose }) {
  const ev = [
    { dot: 'or', t: "Aujourd'hui · 14:02", x: '312 commandes traitées ce jour' },
    { dot: 'ok', t: "Aujourd'hui · 08:11", x: 'Connexion barman (terminal iPad)' },
    { dot: '', t: 'Hier · 19:40', x: 'Menu modifié — 2 articles ajoutés' },
    { dot: 'purple', t: 'Hier · 14:11', x: 'Session impersonation [admin]' },
    { dot: 'er', t: '04 juin · 12:20', x: 'Incident PSP — capture retentée' },
  ];
  return (
    <Sheet title="Logs d'activité" sub={bar.name + ' · ' + bar.city} onClose={onClose} width={460}>
      <div className="timeline">
        {ev.map((e, i) => <div className="tl-item" key={i}><span className={'tl-dot ' + e.dot} /><div className="tl-time">{e.t}</div><div className="tl-txt">{e.x}</div></div>)}
      </div>
    </Sheet>
  );
}

function ConfirmDestruct({ ctx, confirm, onClose }) {
  const [txt, setTxt] = useState('');
  const map = {
    suspend: { title: 'Suspendre ce bar ?', body: 'Le bar ne pourra plus recevoir de commandes jusqu’à réactivation.', cta: 'Suspendre', tone: 'er', need: false },
    close: { title: 'Clôturer définitivement ?', body: 'Action irréversible. Le bar sera archivé et ne pourra plus être réactivé.', cta: 'Clôturer', tone: 'er', need: true },
  }[confirm.kind];
  const ok = !map.need || txt === 'CONFIRMER';
  return (
    <Modal icon={<Icon.alert size={22} />} iconTone="er" title={map.title} onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="er" disabled={!ok} onClick={() => { ctx.toast(confirm.bar.name + ' — ' + map.cta.toLowerCase() + ' effectué', 'er'); onClose(); }}>{map.cta}</Btn></>}>
      <p>{map.body}</p>
      {map.need && <Field label={'Saisir CONFIRMER pour valider'} ><Input value={txt} onChange={e => setTxt(e.target.value)} placeholder="CONFIRMER" /></Field>}
      <div style={{ marginTop: 12 }}><span className="cell-sub">Établissement : <b style={{ color: 'var(--g800)' }}>{confirm.bar.flag} {confirm.bar.name}</b></span></div>
    </Modal>
  );
}

/* ============================ PATRONS ============================ */
function ModPatrons({ ctx }) {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('Tous');
  const [status, setStatus] = useState('Tous');
  const [sheet, setSheet] = useState(null);   // { mode:'create'|'edit', patron }
  const [detail, setDetail] = useState(null);
  useTopActions(ctx, <Btn variant="or" icon={<Icon.plus size={16} />} onClick={() => setSheet({ mode: 'create' })}>Nouveau patron</Btn>, []);
  const rows = QD.patrons.filter(p =>
    (country === 'Tous' || p.country === country) &&
    (status === 'Tous' || (status === 'Actif') === (p.status === 'active')) &&
    (q === '' || (p.name + ' ' + p.email).toLowerCase().includes(q.toLowerCase())));
  const menu = (p) => [
    { icon: <Icon.eye size={16} />, label: 'Voir le profil complet', onClick: () => setDetail(p) },
    { icon: <Icon.edit size={16} />, label: 'Modifier les infos', onClick: () => setSheet({ mode: 'edit', patron: p }) },
    { icon: <Icon.key size={16} />, label: 'Reset PIN', tone: 'admin', onClick: () => ctx.toast('PIN jetable 6 chiffres envoyé à ' + p.email, 'purple') },
    { sep: true },
    { icon: <Icon.store size={16} />, label: 'Voir ses bars', onClick: () => ctx.go('bars') },
    { icon: <Icon.list size={16} />, label: 'Audit de ses actions', onClick: () => ctx.go('audit') },
    { sep: true },
    p.status === 'active'
      ? { icon: <Icon.ban size={16} />, label: 'Suspendre le compte', tone: 'danger', onClick: () => ctx.toast(p.name + ' suspendu', 'er') }
      : { icon: <Icon.check size={16} />, label: 'Réactiver', onClick: () => ctx.toast(p.name + ' réactivé', 'ok') },
  ];
  return (
    <div className="a-content-inner">
      <div className="toolbar">
        <Search value={q} onChange={setQ} placeholder="Nom, email…" />
        <Select value={country} onChange={setCountry} options={[{ value: 'Tous', label: 'Tous pays' }, { value: 'CH', label: '🇨🇭 Suisse' }, { value: 'FR', label: '🇫🇷 France' }]} />
        <Select value={status} onChange={setStatus} options={['Tous', 'Actif', 'Suspendu']} />
        <span className="spacer" /><span className="cell-sub">{rows.length} patron{rows.length > 1 ? 's' : ''}</span>
      </div>
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Patron</th><th>Bars</th><th>Statut</th><th>Pays</th><th className="r">CA total</th><th>Dernière connexion</th><th>Membre depuis</th><th className="r">Actions</th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} className="clk" onClick={(e) => { if (!e.target.closest('.kebab') && !e.target.closest('.menu')) setDetail(p); }}>
                <td><div className="row-id"><span className="avatar-sm" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D3DE0)' }}>{p.first[0]}{p.last[0]}</span><div><div className="cell-strong">{p.name}</div><div className="cell-sub">{p.email}</div></div></div></td>
                <td><Badge tone="plain">{p.bars} bar{p.bars > 1 ? 's' : ''}</Badge></td>
                <td><Badge tone={p.status === 'active' ? 'ok' : 'er'} dot={p.status === 'active'}>{p.status === 'active' ? 'Actif' : 'Suspendu'}</Badge></td>
                <td>{p.flag} {p.country}</td>
                <td className="r mono cell-strong">CHF {p.caTotal.toLocaleString('fr-CH')}</td>
                <td className="cell-sub">{p.lastLogin}</td>
                <td className="cell-sub">{p.since}</td>
                <td className="r"><RowMenu items={menu(p)} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8}><Empty icon={<Icon.patrons size={20} />} title="Aucun patron">Aucun patron ne correspond à ces filtres.</Empty></td></tr>}
          </tbody>
        </table>
      </div>
      {sheet && <PatronSheet ctx={ctx} sheet={sheet} onClose={() => setSheet(null)} />}
      {detail && <PatronDetail ctx={ctx} p={detail} onClose={() => setDetail(null)} onEdit={() => { setSheet({ mode: 'edit', patron: detail }); setDetail(null); }} />}
    </div>
  );
}

function PatronSheet({ ctx, sheet, onClose }) {
  const edit = sheet.mode === 'edit';
  const p = sheet.patron || {};
  return (
    <Sheet title={edit ? 'Modifier le patron' : 'Nouveau patron'} sub={edit ? p.name : 'Compte B2B'} onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" onClick={() => { ctx.toast(edit ? 'Infos de ' + p.name + ' mises à jour' : 'Compte créé · PIN jetable + email de bienvenue envoyés', 'ok'); onClose(); }}>{edit ? 'Enregistrer' : 'Créer le compte'}</Btn></>}>
      <div className="lbl" style={{ marginBottom: 10 }}>Identité</div>
      <div className="form-grid-2"><Field label="Prénom" req><Input defaultValue={p.first} placeholder="Sophie" /></Field><Field label="Nom" req><Input defaultValue={p.last} placeholder="Müller" /></Field></div>
      <div className="form-grid-2"><Field label="Email" req><Input defaultValue={p.email} placeholder="sophie@bar.ch" /></Field><Field label="Téléphone"><Input defaultValue={p.phone} placeholder="+41 79 000 00 00" /></Field></div>
      <div className="divider" />
      <div className="lbl" style={{ marginBottom: 10 }}>Localisation & compte</div>
      <div className="form-grid-2">
        <Field label="Pays" req><NativeSelect options={[{ value: 'CH', label: '🇨🇭 Suisse' }, { value: 'FR', label: '🇫🇷 France' }]} value={p.country || 'CH'} onChange={() => {}} /></Field>
        <Field label="Langue préférée"><NativeSelect options={['Français', 'Deutsch', 'Italiano', 'English']} value="Français" onChange={() => {}} /></Field>
      </div>
      {edit && <Field label="Statut du compte"><NativeSelect options={[{ value: 'active', label: 'Actif' }, { value: 'suspended', label: 'Suspendu' }]} value={p.status || 'active'} onChange={() => {}} /></Field>}
      <div className="divider" />
      <div className="lbl" style={{ marginBottom: 10 }}>Facturation</div>
      <Field label="Raison sociale"><Input defaultValue={edit ? (p.last + ' Sàrl') : ''} placeholder="Le Jetée Sàrl" /></Field>
      <Field label="N° TVA"><Input defaultValue={edit && p.country === 'CH' ? 'CHE-123.456.789 TVA' : ''} placeholder="CHE-123.456.789 TVA" style={{ fontVariantNumeric: 'tabular-nums' }} /></Field>
      <div className="divider" />
      <Field label="Bar associé" hint="Optionnel — peut être ajouté plus tard"><NativeSelect options={['—', ...QD.bars.map(b => b.name)]} value="—" onChange={() => {}} /></Field>
      <Field label="Notes internes" hint="Non visible par le patron"><Textarea defaultValue={edit ? '' : ''} placeholder="Contexte, accord commercial…" /></Field>
    </Sheet>
  );
}

function PatronDetail({ ctx, p, onClose, onEdit }) {
  const bars = QD.bars.filter(b => b.patronId === p.id);
  return (
    <Sheet title={p.name} sub={p.email} onClose={onClose} width={460}
      footer={<><Btn variant="or" icon={<Icon.edit size={15} />} onClick={onEdit}>Modifier les infos</Btn><Btn variant="ghost-purple" icon={<Icon.key size={15} />} onClick={() => { ctx.toast('PIN jetable envoyé à ' + p.email, 'purple'); }}>Reset PIN</Btn></>}>
      <div className="card card-pad" style={{ background: 'var(--g50)', marginBottom: 16 }}>
        <div className="kv"><span className="k">Statut</span><span className="v"><Badge tone={p.status === 'active' ? 'ok' : 'er'} dot={p.status === 'active'}>{p.status === 'active' ? 'Actif' : 'Suspendu'}</Badge></span></div>
        <div className="kv"><span className="k">Téléphone</span><span className="v mono">{p.phone}</span></div>
        <div className="kv"><span className="k">Pays</span><span className="v">{p.flag} {p.country}</span></div>
        <div className="kv"><span className="k">CA total (tous bars)</span><span className="v mono">CHF {p.caTotal.toLocaleString('fr-CH')}</span></div>
        <div className="kv"><span className="k">Dernière connexion</span><span className="v">{p.lastLogin}</span></div>
        <div className="kv"><span className="k">Membre depuis</span><span className="v">{p.since}</span></div>
      </div>
      <div className="lbl" style={{ marginBottom: 8 }}>Ses bars ({bars.length})</div>
      {bars.map(b => (
        <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}><div className="cell-strong">{b.flag} {b.name}</div><div className="cell-sub">{b.city}</div></div>
          <StatusBadge status={b.status} />
          <span className="mono cell-sub">{QD.money(b.ca, b.country === 'FR' ? 'EUR' : 'CHF')}</span>
        </div>
      ))}
    </Sheet>
  );
}

/* ============================ PAYS & CONFIG ============================ */
function ModCountries({ ctx }) {
  const [edit, setEdit] = useState(null);
  const [tab, setTab] = useState('Général');
  const [tvaMode, setTvaMode] = useState('Sur place');
  return (
    <div className="a-content-inner">
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Pays</th><th>Statut</th><th>Monnaie</th><th>Langues</th><th className="r">TVA std</th><th className="r">TVA réduite</th><th>Indicatif</th><th className="r">Bars</th><th className="r">Actions</th></tr></thead>
          <tbody>
            {QD.countries.map(c => (
              <tr key={c.code}>
                <td className="cell-strong">{c.flag} {c.name}</td>
                <td><Badge tone={c.active ? 'ok' : 'closed'} dot={c.active}>{c.active ? 'Actif' : 'Inactif'}</Badge></td>
                <td className="mono">{c.currency}</td>
                <td><div style={{ display: 'flex', gap: 4 }}>{c.langs.map(l => <span key={l} style={{ fontSize: 10.5, fontWeight: 700, background: 'var(--g100)', color: 'var(--g600)', padding: '2px 6px', borderRadius: 5 }}>{l}</span>)}</div></td>
                <td className="r mono">{c.tvaStd} %</td>
                <td className="r mono">{c.tvaRed} %</td>
                <td className="mono">{c.dial}</td>
                <td className="r mono">{c.bars}</td>
                <td className="r"><Btn variant="gh" size="sm" icon={<Icon.edit size={14} />} onClick={() => { setEdit(c); setTab('Général'); }}>Modifier</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <Sheet title={'Configurer · ' + edit.name} sub={edit.flag + ' ' + edit.code} onClose={() => setEdit(null)} tabs={['Général', 'Langues', 'TVA', 'Avancé']} tab={tab} onTab={setTab}
          footer={<><Btn variant="gh" onClick={() => setEdit(null)}>Annuler</Btn><Btn variant="or" onClick={() => { ctx.toast('Configuration ' + edit.name + ' enregistrée', 'ok'); setEdit(null); }}>Sauvegarder</Btn></>}>
          {tab === 'Général' && <><Field label="Nom"><Input defaultValue={edit.name} /></Field><div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Toggle on={edit.active} /><span style={{ fontSize: 13 }}>Pays actif sur la plateforme</span></div><div className="form-grid-2"><Field label="Monnaie"><NativeSelect options={['CHF', 'EUR']} value={edit.currency} onChange={() => {}} /></Field><Field label="Indicatif"><Input defaultValue={edit.dial} /></Field></div></>}
          {tab === 'Langues' && <>
            <div className="lbl" style={{ marginBottom: 10 }}>Langues disponibles</div>
            {['FR', 'DE', 'IT', 'EN'].map(l => <div key={l} className="kv"><span className="k">{l === 'FR' ? 'Français' : l === 'DE' ? 'Deutsch' : l === 'IT' ? 'Italiano' : 'English'}</span><Toggle on={edit.langs.includes(l)} /></div>)}
            <Field label="Langue par défaut" ><NativeSelect options={edit.langs} value={edit.defLang} onChange={() => {}} /></Field>
          </>}
          {tab === 'TVA' && <>
            <div className="tabs" style={{ marginBottom: 14 }}>{['Sur place', 'À l\'emporter'].map(t => <button key={t} className={tvaMode === t ? 'active' : ''} onClick={() => setTvaMode(t)}>{t}</button>)}</div>
            <div className="lbl" style={{ marginBottom: 10 }}>Taux par type d'article · <span style={{ color: 'var(--g600)' }}>{tvaMode}</span></div>
            {['Alcool', 'Nourriture', 'Boissons sans alcool', 'Services'].map(t => {
              const base = (t === 'Nourriture' || t.includes('sans')) ? edit.tvaRed : edit.tvaStd;
              const val = tvaMode === 'À l\'emporter' && (t === 'Nourriture' || t.includes('sans')) ? edit.tvaRed : base;
              return <Field key={t} label={t}><Input defaultValue={val} type="number" step="0.1" /></Field>;
            })}
            <div className="hint">À l'emporter applique généralement le taux réduit sur la nourriture et les softs (vente à emporter).</div>
          </>}
          {tab === 'Avancé' && <><div className="form-grid-2"><Field label="Format date"><NativeSelect options={['JJ/MM/AAAA', 'JJ.MM.AAAA']} value={edit.code === 'CH' ? 'JJ.MM.AAAA' : 'JJ/MM/AAAA'} onChange={() => {}} /></Field><Field label="Format heure"><NativeSelect options={['24 h', '12 h']} value="24 h" onChange={() => {}} /></Field></div><Field label="Séparateur décimal"><NativeSelect options={['. (point)', ', (virgule)']} value={edit.code === 'CH' ? '. (point)' : ', (virgule)'} onChange={() => {}} /></Field></>}
        </Sheet>
      )}
    </div>
  );
}

Object.assign(window, { ModBars, ModPatrons, ModCountries, useTopActions });
