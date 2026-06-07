/* QOff Super Admin — Config & Équipe: Catégories, Feature flags, Réglages, Comptes admin */

/* ============================ BIBLIOTHÈQUE CATÉGORIES ============================ */
const LANGS = ['FR', 'DE', 'IT', 'EN'];
const reorder = (arr, from, to) => { const a = [...arr]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a; };
const blankNames = () => ({ FR: '', DE: '', IT: '', EN: '' });

function ModCategories({ ctx }) {
  const [cats, setCats] = useState(() => QD.categories.map(c => ({ ...c, names: { ...c.names }, subs: c.subs.map(s => ({ ...s, names: { ...s.names } })) })));
  const [open, setOpen] = useState(cats[0] && cats[0].id);
  const [catSheet, setCatSheet] = useState(null);   // { mode:'create'|'edit', cat }
  const [subSheet, setSubSheet] = useState(null);    // { mode, catId, sub }
  const [del, setDel] = useState(null);              // { catId, sub }
  const dragRef = useRef(null);                       // { kind:'cat'|'sub', catId, idx }
  const [dragging, setDragging] = useState(null);     // { kind, id } — visual feedback

  useTopActions(ctx, <Btn variant="or" icon={<Icon.plus size={16} />} onClick={() => setCatSheet({ mode: 'create', cat: { emoji: '🍹', names: blankNames(), tva: 'Alcool', active: true, subs: [] } })}>Nouvelle catégorie</Btn>, []);

  /* ---- drag & drop ---- */
  const overCat = (i) => { const d = dragRef.current; if (!d || d.kind !== 'cat' || d.idx === i) return; const from = d.idx; d.idx = i; setCats(cs => reorder(cs, from, i)); };
  const overSub = (catId, i) => { const d = dragRef.current; if (!d || d.kind !== 'sub' || d.catId !== catId || d.idx === i) return; const from = d.idx; d.idx = i; setCats(cs => cs.map(c => c.id === catId ? { ...c, subs: reorder(c.subs, from, i) } : c)); };
  const endDrag = (msg) => { if (dragRef.current) { dragRef.current = null; setDragging(null); ctx.toast(msg, 'ok'); } else { setDragging(null); } };

  /* ---- mutations ---- */
  const saveCat = (draft) => {
    if (catSheet.mode === 'create') { setCats(cs => [...cs, { ...draft, id: 'cat' + Date.now(), name: draft.names.FR || 'Catégorie' }]); ctx.toast('Catégorie « ' + (draft.names.FR || 'sans nom') + ' » créée', 'ok'); }
    else { setCats(cs => cs.map(c => c.id === draft.id ? { ...c, ...draft, name: draft.names.FR || c.name } : c)); ctx.toast('Catégorie mise à jour', 'ok'); }
    setCatSheet(null);
  };
  const saveSub = (draft) => {
    const { catId } = subSheet;
    if (subSheet.mode === 'create') { setCats(cs => cs.map(c => c.id === catId ? { ...c, subs: [...c.subs, { ...draft, id: 'sub' + Date.now(), name: draft.names.FR || 'Sous-cat.' }] } : c)); ctx.toast('Sous-catégorie ajoutée', 'ok'); }
    else { setCats(cs => cs.map(c => c.id === catId ? { ...c, subs: c.subs.map(s => s.id === draft.id ? { ...draft, name: draft.names.FR || s.name } : s) } : c)); ctx.toast('Sous-catégorie mise à jour', 'ok'); }
    setSubSheet(null);
  };
  const removeSub = () => { setCats(cs => cs.map(c => c.id === del.catId ? { ...c, subs: c.subs.filter(s => s.id !== del.sub.id) } : c)); ctx.toast('Sous-catégorie supprimée', 'er'); setDel(null); };
  const toggleCat = (id) => setCats(cs => cs.map(c => c.id === id ? { ...c, active: !c.active } : c));

  return (
    <div className="a-content-inner">
      <div style={{ background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 12, padding: '11px 16px', fontSize: 12.5, color: 'var(--g600)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 9 }}>
        <Icon.info size={15} /> Référentiel global partagé. Les patrons y piochent comme base et peuvent créer leurs propres catégories.<span className="spacer" style={{ flex: 1 }} /><span className="cell-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.grip size={13} /> Glissez-déposez pour réordonner</span>
      </div>
      <div className="sec">
        <div className="sec-title" style={{ marginBottom: 11 }}>Catégories globales · {cats.length}</div>
        <div className="card" style={{ overflow: 'hidden' }}>
          {cats.map((c, i) => (
            <div key={c.id} className="dnd-row" draggable
              onDragStart={(e) => { dragRef.current = { kind: 'cat', idx: i }; setDragging({ kind: 'cat', id: c.id }); }}
              onDragOver={(e) => { e.preventDefault(); overCat(i); }}
              onDragEnd={() => endDrag('Ordre des catégories enregistré')}
              style={{ borderBottom: i < cats.length - 1 ? '1px solid var(--g100)' : 'none', background: dragging && dragging.kind === 'cat' && dragging.id === c.id ? 'var(--g50)' : 'transparent', opacity: dragging && dragging.kind === 'cat' && dragging.id === c.id ? .5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px' }}>
                <span className="drag-handle" title="Glisser pour réordonner"><Icon.grip size={16} /></span>
                <span className="pos-chip mono">{i + 1}</span>
                <span style={{ fontSize: 22, cursor: 'pointer' }} onClick={() => setOpen(open === c.id ? '' : c.id)}>{c.emoji}</span>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setOpen(open === c.id ? '' : c.id)}>
                  <div className="cell-strong" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{c.names.FR}<span className="lang-mini">{LANGS.filter(l => c.names[l]).join(' · ')}</span></div>
                  <div className="cell-sub">{c.subs.length} sous-catégorie{c.subs.length > 1 ? 's' : ''} · TVA {c.tva}</div>
                </div>
                <Badge tone={c.active ? 'ok' : 'closed'} dot={c.active}>{c.active ? 'Actif' : 'Inactif'}</Badge>
                <Btn variant="gh" size="sm" icon={<Icon.edit size={13} />} onClick={() => setCatSheet({ mode: 'edit', cat: c })}>Modifier</Btn>
                <span className="cat-chev" onClick={() => setOpen(open === c.id ? '' : c.id)} style={{ transform: open === c.id ? 'rotate(90deg)' : 'none' }}><Icon.chevRight size={16} /></span>
              </div>
              {open === c.id && (
                <div style={{ padding: '2px 14px 14px 52px' }}>
                  {c.subs.length === 0 && <div className="cell-sub" style={{ padding: '4px 0 10px' }}>Aucune sous-catégorie.</div>}
                  {c.subs.map((s, si) => (
                    <div key={s.id} className="dnd-subrow" draggable
                      onDragStart={(e) => { e.stopPropagation(); dragRef.current = { kind: 'sub', catId: c.id, idx: si }; setDragging({ kind: 'sub', id: s.id }); }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); overSub(c.id, si); }}
                      onDragEnd={(e) => { e.stopPropagation(); endDrag('Ordre des sous-catégories enregistré'); }}
                      style={{ background: dragging && dragging.kind === 'sub' && dragging.id === s.id ? 'var(--orl)' : 'var(--g50)', opacity: dragging && dragging.kind === 'sub' && dragging.id === s.id ? .5 : 1 }}>
                      <span className="drag-handle sm"><Icon.grip size={14} /></span>
                      <span className="pos-chip mono sm">{si + 1}</span>
                      <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{s.emoji || '·'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="cell-strong" style={{ fontSize: 13 }}>{s.names.FR}</span>
                        <span className="lang-mini" style={{ marginLeft: 8 }}>{LANGS.filter(l => s.names[l]).map(l => l + ' ' + s.names[l]).join('  ·  ')}</span>
                      </div>
                      <IconBtn icon={<Icon.edit size={15} />} title="Modifier" onClick={() => setSubSheet({ mode: 'edit', catId: c.id, sub: s })} />
                      <IconBtn icon={<Icon.trash size={15} />} title="Supprimer" onClick={() => setDel({ catId: c.id, sub: s })} />
                    </div>
                  ))}
                  <button className="add-sub-btn" onClick={() => setSubSheet({ mode: 'create', catId: c.id, sub: { emoji: '', names: blankNames(), active: true } })}><Icon.plus size={14} /> Ajouter une sous-catégorie</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="sec">
        <SectionHead title="TVA par type d'article" sub="Valeurs par défaut appliquées à chaque nouveau bar créé dans le pays" />
        <div className="tablewrap">
          <table className="grid">
            <thead><tr><th>Type d'article</th><th className="r">🇨🇭 Suisse</th><th className="r">🇫🇷 France</th></tr></thead>
            <tbody>
              {QD.tvaMatrix.map(t => (
                <tr key={t.type}>
                  <td className="cell-strong">{t.type}</td>
                  <td className="r"><span className="inline-edit mono" onClick={() => ctx.toast('TVA ' + t.type + ' (CH) éditée', 'info')}>{t.CH} %<Icon.edit size={12} /></span></td>
                  <td className="r"><span className="inline-edit mono" onClick={() => ctx.toast('TVA ' + t.type + ' (FR) éditée', 'info')}>{t.FR} %<Icon.edit size={12} /></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {catSheet && <CategorySheet sheet={catSheet} onClose={() => setCatSheet(null)} onSave={saveCat} />}
      {subSheet && <SubcatSheet sheet={subSheet} cat={cats.find(c => c.id === subSheet.catId)} onClose={() => setSubSheet(null)} onSave={saveSub} />}
      {del && (
        <Modal icon={<Icon.trash size={22} />} iconTone="er" title="Supprimer la sous-catégorie ?" onClose={() => setDel(null)}
          footer={<><Btn variant="gh" onClick={() => setDel(null)}>Annuler</Btn><Btn variant="er" onClick={removeSub}>Supprimer</Btn></>}>
          <p>« <b>{del.sub.names.FR}</b> » sera retirée du référentiel global. Les bars qui l'utilisent conserveront leurs articles existants.</p>
        </Modal>
      )}
    </div>
  );
}

/* multilingual name editor block (shared by category + subcat sheets) */
function NameTabs({ names, onChange }) {
  const [tab, setTab] = useState('FR');
  return (
    <>
      <div className="tabs" style={{ marginBottom: 8 }}>
        {LANGS.map(l => <button key={l} className={tab === l ? 'active' : ''} onClick={() => setTab(l)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{l}{names[l] ? <span className="lang-dot" /> : null}</button>)}
      </div>
      <Input value={names[tab]} onChange={e => onChange({ ...names, [tab]: e.target.value })} placeholder={'Nom en ' + tab + (tab !== 'FR' ? ' (optionnel)' : '')} />
      <div className="hint">{LANGS.filter(l => names[l]).length}/4 langues renseignées · le FR sert de valeur de repli.</div>
    </>
  );
}

function CategorySheet({ sheet, onClose, onSave }) {
  const [d, setD] = useState(() => ({ ...sheet.cat, names: { ...sheet.cat.names } }));
  return (
    <Sheet title={sheet.mode === 'edit' ? 'Modifier la catégorie' : 'Nouvelle catégorie'} sub={sheet.mode === 'edit' ? d.names.FR : 'Référentiel global partagé'} onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!d.names.FR} onClick={() => onSave(d)}>Enregistrer</Btn></>}>
      <Field label="Icône" req hint="Emoji affiché côté client"><Input value={d.emoji} onChange={e => setD({ ...d, emoji: e.target.value })} style={{ fontSize: 20, textAlign: 'center', width: 72 }} maxLength={2} /></Field>
      <Field label="Nom (multilingue)" req><NameTabs names={d.names} onChange={names => setD({ ...d, names })} /></Field>
      <Field label="TVA associée" req><NativeSelect options={['Alcool', 'Nourriture', 'Soft', 'Services']} value={d.tva} onChange={v => setD({ ...d, tva: v })} /></Field>
      <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Toggle on={d.active} onClick={() => setD({ ...d, active: !d.active })} /><span style={{ fontSize: 13 }}>Catégorie active</span></div>
      {sheet.mode === 'edit' && <div className="hint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon.grip size={13} /> La position se règle par glisser-déposer dans la liste.</div>}
    </Sheet>
  );
}

function SubcatSheet({ sheet, cat, onClose, onSave }) {
  const [d, setD] = useState(() => ({ ...sheet.sub, names: { ...sheet.sub.names } }));
  return (
    <Sheet title={sheet.mode === 'edit' ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'} sub={cat ? (cat.emoji + ' ' + cat.names.FR) : ''} onClose={onClose} width={440}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!d.names.FR} onClick={() => onSave(d)}>Enregistrer</Btn></>}>
      <Field label="Icône" hint="Emoji optionnel"><Input value={d.emoji} onChange={e => setD({ ...d, emoji: e.target.value })} style={{ fontSize: 20, textAlign: 'center', width: 72 }} maxLength={2} placeholder="🏷️" /></Field>
      <Field label="Nom (multilingue)" req><NameTabs names={d.names} onChange={names => setD({ ...d, names })} /></Field>
      <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Toggle on={d.active} onClick={() => setD({ ...d, active: !d.active })} /><span style={{ fontSize: 13 }}>Sous-catégorie active</span></div>
    </Sheet>
  );
}

/* ============================ FEATURE FLAGS ============================ */
function ModFlags({ ctx }) {
  const [flags, setFlags] = useState(QD.flags.map(f => ({ ...f })));
  const [override, setOverride] = useState(null);
  const toggle = (i) => { setFlags(fs => fs.map((f, k) => k === i ? { ...f, global: !f.global } : f)); ctx.toast(flags[i].name + ' ' + (!flags[i].global ? 'activé' : 'désactivé') + ' (global)', flags[i].global ? 'info' : 'ok'); };
  return (
    <div className="a-content-inner">
      <div className="tablewrap">
        <table className="grid">
          <thead><tr><th>Fonctionnalité</th><th>Portée</th><th>Actif (global)</th><th className="r">Overrides</th><th className="r">Actions</th></tr></thead>
          <tbody>
            {flags.map((f, i) => (
              <tr key={f.name}>
                <td><div className="cell-strong">{f.name}</div><div className="cell-sub">{f.desc}</div></td>
                <td><Badge tone={f.scope === 'Global' ? 'info' : 'plain'}>{f.scope}</Badge></td>
                <td><Toggle on={f.global} onClick={() => toggle(i)} /></td>
                <td className="r">{f.overrides > 0 ? <span className="mono" style={{ fontWeight: 600 }}>{f.overrides} bar{f.overrides > 1 ? 's' : ''}</span> : <span className="cell-sub">—</span>}</td>
                <td className="r"><Btn variant="gh" size="sm" disabled={f.scope === 'Global'} onClick={() => setOverride(f)}>Gérer les overrides</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {override && (
        <Sheet title="Overrides par bar / patron" sub={override.name} onClose={() => setOverride(null)}
          footer={<><Btn variant="gh" onClick={() => setOverride(null)}>Fermer</Btn><Btn variant="or" onClick={() => { ctx.toast('Override enregistré · loggé dans l\'audit', 'ok'); setOverride(null); }}>Enregistrer</Btn></>}>
          <p style={{ fontSize: 13, color: 'var(--g600)', marginBottom: 14 }}>Activez ou désactivez « {override.name} » pour un bar ou un patron spécifique. Toute modification est tracée.</p>
          <Field label="Cible" req><NativeSelect options={['— Choisir un bar —', ...QD.bars.map(b => b.name)]} value="— Choisir un bar —" onChange={() => {}} /></Field>
          <div className="lbl" style={{ margin: '16px 0 8px' }}>Bars avec configuration spécifique</div>
          {QD.bars.slice(0, override.overrides || 2).map(b => <div key={b.id} className="kv"><span className="k">{b.flag} {b.name}</span><Toggle on={b.id !== 'B07'} /></div>)}
        </Sheet>
      )}
    </div>
  );
}

/* ============================ RÉGLAGES PLATEFORME ============================ */
function ModSettings({ ctx }) {
  const [tab, setTab] = useState('Général');
  const tabs = ['Général', 'SMS OTP', 'PSP Wallee', 'Claude API', 'Notifications'];
  useTopActions(ctx, <Btn variant="or" onClick={() => ctx.toast('Réglages enregistrés', 'ok')}>Enregistrer</Btn>, []);
  return (
    <div className="a-content-inner" style={{ maxWidth: 760 }}>
      <div className="tabs" style={{ marginBottom: 18 }}>{tabs.map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="card card-pad">
        {tab === 'Général' && <>
          <Field label="Commission par défaut (%)" req hint="Appliquée à chaque nouveau bar"><Input defaultValue="3" type="number" step="0.5" /></Field>
          <div className="form-grid-2"><Field label="Durée session client"><NativeSelect options={['30 jours', '60 jours', '90 jours']} value="60 jours" onChange={() => {}} /></Field><Field label="Durée validité OTP"><NativeSelect options={['3 min', '5 min', '10 min']} value="5 min" onChange={() => {}} /></Field></div>
        </>}
        {tab === 'SMS OTP' && <>
          <Field label="Template du message" hint="Variables : {{code}}, {{bar}}"><Textarea defaultValue={'Votre code QOff : {{code}}\nValable 5 minutes. Bar : {{bar}}'} style={{ minHeight: 96 }} /></Field>
          <div className="lbl" style={{ marginBottom: 8 }}>Aperçu</div>
          <div className="card card-pad" style={{ background: 'var(--g50)', fontSize: 13, lineHeight: 1.5 }}>Votre code QOff : <b className="mono">4821</b><br />Valable 5 minutes. Bar : Le Jetée</div>
        </>}
        {tab === 'PSP Wallee' && <>
          <Field label="Clé API"><Input defaultValue="••••••••••••••••3f9a" type="password" /></Field>
          <Field label="Webhook URL"><Input defaultValue="https://api.qoff.ch/psp/webhook" /></Field>
          <div className="kv" style={{ paddingTop: 10 }}><span className="k">Mode</span><div className="tabs"><button className="active">Sandbox</button><button>Production</button></div></div>
        </>}
        {tab === 'Claude API' && <>
          <Field label="Clé API"><Input defaultValue="••••••••••••••••a72c" type="password" /></Field>
          <div className="form-grid-2"><Field label="Modèle"><NativeSelect options={['claude-sonnet-4.5', 'claude-opus-4.1', 'claude-haiku-4']} value="claude-sonnet-4.5" onChange={() => {}} /></Field><Field label="Quota mensuel"><Input defaultValue="500 000 tokens" /></Field></div>
          <div className="card card-pad" style={{ background: 'var(--warnl)', display: 'flex', alignItems: 'center', gap: 10 }}><Icon.alert size={16} /><span style={{ fontSize: 12.5, color: '#B45309' }}>80 % du quota mensuel atteint.</span></div>
        </>}
        {tab === 'Notifications' && <>
          <div className="lbl" style={{ marginBottom: 10 }}>Alertes email vers l'équipe admin</div>
          {['Nouveau bar soumis', 'Incident PSP', 'Réclamation client', 'Écart de réconciliation', 'Quota Claude API'].map((n, i) => <div key={n} className="kv"><span className="k">{n}</span><Toggle on={i !== 4} /></div>)}
          <Field label="Destinataires" hint="Séparés par une virgule"><Input defaultValue="admin@qoff.ch, tech@qoff.ch" /></Field>
        </>}
      </div>
    </div>
  );
}

/* ============================ COMPTES ADMIN ============================ */
function ModAdmins({ ctx }) {
  const [sheet, setSheet] = useState(false);
  useTopActions(ctx, <Btn variant="purple" icon={<Icon.plus size={16} />} onClick={() => setSheet(true)}>Nouvel admin</Btn>, []);
  const roleTone = { 'Super Admin': 'admin', 'Support': 'info', 'Finance': 'ok', 'Tech': 'warn' };
  return (
    <div className="a-content-inner">
      <div className="tablewrap" style={{ marginBottom: 18 }}>
        <table className="grid">
          <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th><th className="r">Actions</th></tr></thead>
          <tbody>
            {QD.admins.map(a => (
              <tr key={a.email}>
                <td><div className="row-id"><span className="avatar-sm" style={{ background: a.role === 'Super Admin' ? 'linear-gradient(135deg,#8B5CF6,#6D3DE0)' : 'var(--g400)' }}>{a.name.split(' ').map(s => s[0]).join('')}</span><span className="cell-strong">{a.name}</span></div></td>
                <td className="cell-sub">{a.email}</td>
                <td><Badge tone={roleTone[a.role]}>{a.role}</Badge></td>
                <td><Badge tone={a.status === 'active' ? 'ok' : 'closed'} dot={a.status === 'active'}>{a.status === 'active' ? 'Actif' : 'Inactif'}</Badge></td>
                <td className="cell-sub">{a.last}</td>
                <td className="r"><RowMenu items={[
                  { icon: <Icon.edit size={16} />, label: 'Modifier', onClick: () => ctx.toast('Édition de ' + a.name, 'info') },
                  a.status === 'active'
                    ? { icon: <Icon.ban size={16} />, label: 'Désactiver', tone: 'danger', onClick: () => ctx.toast(a.name + ' désactivé', 'er') }
                    : { icon: <Icon.check size={16} />, label: 'Réactiver', onClick: () => ctx.toast(a.name + ' réactivé', 'ok') },
                ]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sec">
        <SectionHead title="Rôles et permissions" />
        <div className="grid2">
          {QD.roles.map(r => (
            <div key={r.role} className="card card-pad" style={{ display: 'flex', gap: 12 }}>
              <span style={{ width: 34, height: 34, flex: '0 0 34px', borderRadius: 9, background: 'var(--' + (r.color === 'admin' ? 'purplel' : r.color === 'info' ? 'bluel' : r.color === 'ok' ? 'okl' : 'warnl') + ')', color: 'var(--' + (r.color === 'admin' ? 'purple' : r.color === 'info' ? 'blue' : r.color === 'ok' ? 'ok' : 'warn') + ')', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.shield size={17} /></span>
              <div><div className="cell-strong" style={{ marginBottom: 3 }}>{r.role}</div><div className="cell-sub" style={{ lineHeight: 1.45 }}>{r.access}</div></div>
            </div>
          ))}
        </div>
      </div>
      {sheet && (
        <Sheet title="Nouvel admin" sub="Inviter un membre de l'équipe QOff" onClose={() => setSheet(false)}
          footer={<><Btn variant="gh" onClick={() => setSheet(false)}>Annuler</Btn><Btn variant="purple" onClick={() => { ctx.toast('Invitation envoyée · lien de création de mot de passe', 'purple'); setSheet(false); }}>Inviter</Btn></>}>
          <div className="form-grid-2"><Field label="Prénom" req><Input /></Field><Field label="Nom" req><Input /></Field></div>
          <Field label="Email" req><Input placeholder="prenom@qoff.ch" /></Field>
          <Field label="Rôle" req><NativeSelect options={['Super Admin', 'Support', 'Finance', 'Tech']} value="Support" onChange={() => {}} /></Field>
        </Sheet>
      )}
    </div>
  );
}

Object.assign(window, { ModCategories, ModFlags, ModSettings, ModAdmins });
