/* QOff Back-Office Bar — Équipe : membres, ajout d'accès (PIN jetable), délégation de droits. */

const TEAM_ROLE_TONE = { Patron: 'patron', Manager: 'manager', Barman: 'barman' };
const TEAM_STATUS = { active: ['ok', 'Actif'], invited: ['warn', 'Invité'], off: ['closed', 'En congé'] };

function TeamModule({ ctx }) {
  const [team, setTeam] = useState(() => BarData.team.map(m => ({ ...m })));
  const [addSheet, setAddSheet] = useState(false);
  const [editFor, setEditFor] = useState(null);
  const [delegateFor, setDelegateFor] = useState(null);
  const [pinFor, setPinFor] = useState(null);       // { member, pin }
  const [del, setDel] = useState(null);

  const addAccess = (d) => {
    const pin = ('' + Math.floor(1000 + Math.random() * 9000));
    const member = { ...d, id: 'T' + Date.now(), name: d.first + ' ' + d.last, status: 'invited', since: "aujourd'hui", delegate: null, otherBars: [] };
    setTeam(t => [...t, member]);
    setAddSheet(false);
    setPinFor({ member, pin });
  };
  const saveEdit = (d) => {
    setTeam(t => t.map(m => m.id === editFor.id ? { ...m, ...d, name: d.first + ' ' + d.last } : m));
    ctx.toast(d.first + ' ' + d.last + ' mis à jour', 'ok');
    setEditFor(null);
  };
  const saveDelegate = (rights) => {
    setTeam(t => t.map(m => m.id === delegateFor.id ? { ...m, delegate: rights, role: rights ? 'Manager' : 'Barman' } : m));
    ctx.toast(rights ? 'Droits délégués à ' + delegateFor.name : 'Délégation révoquée', rights ? 'ok' : 'info');
    setDelegateFor(null);
  };
  const remove = () => { setTeam(t => t.filter(m => m.id !== del.id)); ctx.toast(del.name + ' retiré de l’équipe', 'er'); setDel(null); };

  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 };
  return (
    <div>
      <div className="toolbar">
        <span className="cell-sub">{team.filter(m => m.status === 'active').length} actifs · {team.length} membres</span>
        <span className="spacer" />
        <Btn variant="or" size="sm" icon={<Icon.plus size={14} />} onClick={() => setAddSheet(true)}>Ajouter un accès</Btn>
      </div>
      <div style={grid}>
        {team.map(m => {
          const [tone, label] = TEAM_STATUS[m.status];
          return (
            <div key={m.id} className="team-card">
              <div className="tc-head">
                <span className={'tc-avatar ' + TEAM_ROLE_TONE[m.role]}>{m.first[0]}{m.last[0]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tc-name">{m.name}</div>
                  <div className="tc-role">{m.role} · dans l’équipe depuis {m.since}</div>
                </div>
                <Badge tone={tone} dot={m.status === 'active'}>{label}</Badge>
                <RowMenu items={[
                  { label2: m.name },
                  { icon: <Icon.edit size={16} />, label: 'Modifier le membre', onClick: () => setEditFor(m) },
                  ...(m.role !== 'Patron' ? [{ icon: <Icon.shield size={16} />, label: m.delegate ? 'Modifier la délégation' : 'Déléguer des droits', onClick: () => setDelegateFor(m) }] : []),
                  { icon: <Icon.key size={16} />, label: 'Renvoyer un PIN', onClick: () => { const pin = ('' + Math.floor(1000 + Math.random() * 9000)); setPinFor({ member: m, pin }); } },
                  ...(m.role !== 'Patron' ? [{ sep: true }, { icon: <Icon.trash size={16} />, label: 'Retirer l’accès', tone: 'danger', onClick: () => setDel(m) }] : []),
                ]} />
              </div>
              <div className="cell-sub" style={{ marginTop: 10, fontSize: 12 }}>
                {m.phone && m.phone !== '—' ? <span><Icon.phone size={12} style={{ verticalAlign: -2, marginRight: 4 }} /><span className="mono">{m.phone}</span></span> : null}
                {m.email ? <span style={{ marginLeft: m.phone && m.phone !== '—' ? 12 : 0 }}><Icon.mail size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{m.email}</span> : null}
              </div>
              {m.otherBars && m.otherBars.length > 0 && (
                <div className="cell-sub" style={{ marginTop: 7, fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--g400)' }}>
                  <Icon.store size={12} /> Aussi un accès dans : <b style={{ color: 'var(--g600)', fontWeight: 600 }}>{m.otherBars.join(', ')}</b>
                </div>
              )}
              {m.delegate && (
                <div className="delegate-box">
                  <div className="delegate-box-ttl"><Icon.shield size={12} /> Droits délégués</div>
                  {[['Modifier les prix', m.delegate.prices], ['Gérer le Happy Hour', m.delegate.hh], ['Modifier le menu', m.delegate.menu]].map(([lbl, on]) => (
                    <div key={lbl} className="delegate-right">
                      <span>{lbl}</span>
                      {on ? <span className="dr-on"><Icon.check size={13} /> Autorisé</span> : <span className="dr-off">Refusé</span>}
                    </div>
                  ))}
                  <div className="delegate-until"><Icon.clock size={12} /> Valide jusqu’au {m.delegate.until}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addSheet && <AddAccessSheet bar={ctx.bar} onClose={() => setAddSheet(false)} onSave={addAccess} />}
      {editFor && <EditMemberSheet member={editFor} bar={ctx.bar} onClose={() => setEditFor(null)} onSave={saveEdit} />}
      {delegateFor && <DelegateSheet member={delegateFor} onClose={() => setDelegateFor(null)} onSave={saveDelegate} />}
      {pinFor && <PinRevealModal data={pinFor} onClose={() => setPinFor(null)} ctx={ctx} />}
      {del && (
        <Modal icon={<Icon.trash size={22} />} iconTone="er" title="Retirer cet accès ?" onClose={() => setDel(null)}
          footer={<><Btn variant="gh" onClick={() => setDel(null)}>Annuler</Btn><Btn variant="er" onClick={remove}>Retirer</Btn></>}>
          <p><b>{del.name}</b> perdra immédiatement l’accès au back-office du bar. L’historique de ses services est conservé.</p>
        </Modal>
      )}
    </div>
  );
}

/* ---- Sheet : ajouter un accès ---- */
function AddAccessSheet({ bar, onClose, onSave }) {
  const [d, setD] = useState({ first: '', last: '', role: 'Barman', email: '', phone: '' });
  return (
    <Sheet title="Ajouter un accès" sub="Le membre reçoit un PIN jetable par SMS." onClose={onClose} width={440}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!d.first || !d.phone} onClick={() => onSave(d)}>Créer l’accès</Btn></>}>
      <div className="form-grid-2">
        <Field label="Prénom" req><Input value={d.first} onChange={e => setD({ ...d, first: e.target.value })} placeholder="Lucas" /></Field>
        <Field label="Nom" req><Input value={d.last} onChange={e => setD({ ...d, last: e.target.value })} placeholder="Perret" /></Field>
      </div>
      <Field label="Rôle" req>
        <div className="tabs" style={{ display: 'flex' }}>{['Barman', 'Manager'].map(r => <button key={r} className={d.role === r ? 'active' : ''} onClick={() => setD({ ...d, role: r })}>{r === 'Manager' ? 'Manager délégué' : 'Barman'}</button>)}</div>
      </Field>
      <Field label="Téléphone" req hint="Le PIN jetable y est envoyé par SMS"><Input value={d.phone} onChange={e => setD({ ...d, phone: e.target.value })} placeholder="+41 78 000 00 00" /></Field>
      <Field label="Email" hint="Facultatif"><Input value={d.email} onChange={e => setD({ ...d, email: e.target.value })} placeholder="lucas@jetee.ch" /></Field>
      <div className="card card-pad" style={{ background: 'var(--purplel)', border: '1px solid rgba(139,92,246,.2)' }}>
        <div style={{ fontSize: 12, color: 'var(--purpled)', display: 'flex', gap: 8 }}><Icon.info size={14} /> Cet accès ne concerne que <b>{bar ? bar.name : 'ce bar'}</b>. Si la personne travaille aussi dans vos autres bars, ajoutez-y un accès distinct depuis chaque établissement.</div>
      </div>
    </Sheet>
  );
}

/* ---- Sheet : modifier un membre (accès propre à ce bar) ---- */
function EditMemberSheet({ member, bar, onClose, onSave }) {
  const [d, setD] = useState({ first: member.first, last: member.last, role: member.role, email: member.email || '', phone: member.phone || '' });
  const isPatron = member.role === 'Patron';
  return (
    <Sheet title="Modifier le membre" sub={member.name} onClose={onClose} width={440}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!d.first || !d.last} onClick={() => onSave(d)}>Enregistrer</Btn></>}>
      <div className="form-grid-2">
        <Field label="Prénom" req><Input value={d.first} onChange={e => setD({ ...d, first: e.target.value })} placeholder="Lucas" /></Field>
        <Field label="Nom" req><Input value={d.last} onChange={e => setD({ ...d, last: e.target.value })} placeholder="Perret" /></Field>
      </div>
      <Field label="Rôle" req hint={isPatron ? 'Le rôle de patron ne se modifie pas ici' : ''}>
        {isPatron
          ? <div className="inp" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--g500)', background: 'var(--g50)' }}><Icon.shield size={14} /> Patron — accès complet</div>
          : <div className="tabs" style={{ display: 'flex' }}>{['Barman', 'Manager'].map(r => <button key={r} className={d.role === r ? 'active' : ''} onClick={() => setD({ ...d, role: r })}>{r === 'Manager' ? 'Manager délégué' : 'Barman'}</button>)}</div>}
      </Field>
      <Field label="Téléphone" hint="Sert à l’envoi des PIN jetables"><Input value={d.phone} onChange={e => setD({ ...d, phone: e.target.value })} placeholder="+41 78 000 00 00" /></Field>
      <Field label="Email" hint="Facultatif"><Input value={d.email} onChange={e => setD({ ...d, email: e.target.value })} placeholder="lucas@jetee.ch" /></Field>
      <div className="card card-pad" style={{ background: 'var(--purplel)', border: '1px solid rgba(139,92,246,.2)' }}>
        <div style={{ fontSize: 12, color: 'var(--purpled)', display: 'flex', gap: 8 }}>
          <Icon.info size={14} />
          <span>Ces modifications n’affectent que l’accès à <b>{bar ? bar.name : 'ce bar'}</b>.
          {member.otherBars && member.otherBars.length > 0
            ? <> {member.first} dispose aussi d’un compte distinct dans : <b>{member.otherBars.join(', ')}</b> — géré séparément.</>
            : <> La même personne peut disposer d’un compte distinct dans vos autres bars.</>}
          </span>
        </div>
      </div>
    </Sheet>
  );
}

/* ---- Modal : PIN jetable généré ---- */
function PinRevealModal({ data, onClose, ctx }) {
  return (
    <Modal icon={<Icon.key size={22} />} iconTone="ok" title="Accès créé" onClose={onClose}
      footer={<><Btn variant="gh" onClick={onClose}>Fermer</Btn><Btn variant="or" icon={<Icon.copy size={14} />} onClick={() => { ctx.toast('PIN copié', 'ok'); onClose(); }}>Copier le PIN</Btn></>}>
      <p style={{ marginBottom: 14 }}><b>{data.member.name}</b> peut maintenant se connecter. Un SMS contenant ce code a été envoyé{data.member.phone && data.member.phone !== '—' ? ' au ' + data.member.phone : ''}.</p>
      <div className="pin-reveal">
        <div className="pr-lbl">PIN jetable</div>
        <div className="pr-code">{data.pin}</div>
        <div className="pr-exp"><Icon.clock size={11} style={{ verticalAlign: -1 }} /> Valable 15 minutes · usage unique</div>
      </div>
    </Modal>
  );
}

/* ---- Sheet : déléguer des droits ---- */
function DelegateSheet({ member, onClose, onSave }) {
  const init = member.delegate || { prices: false, hh: false, menu: false, until: '' };
  const [d, setD] = useState({ ...init });
  const Row = ({ k, label, sub }) => (
    <div className="toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--g50)', borderRadius: 10, marginBottom: 8 }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div><div className="cell-sub">{sub}</div></div>
      <Toggle on={d[k]} purple onClick={() => setD(s => ({ ...s, [k]: !s[k] }))} />
    </div>
  );
  return (
    <Sheet title="Déléguer des droits" sub={member.name} onClose={onClose} width={440}
      footer={<>
        {member.delegate && <Btn variant="gh" onClick={() => onSave(null)} style={{ color: 'var(--er)' }}>Révoquer</Btn>}
        <Btn variant="purple" disabled={!d.until} onClick={() => onSave(d)}>Enregistrer la délégation</Btn>
      </>}>
      <div className="card card-pad" style={{ background: 'var(--purplel)', border: '1px solid rgba(139,92,246,.2)', marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: 'var(--purpled)', display: 'flex', gap: 8 }}><Icon.shield size={15} /> Les actions du manager sont tracées et révoquées automatiquement à l’expiration.</div>
      </div>
      <Row k="prices" label="Modifier les prix" sub="Ajuster les tarifs des articles" />
      <Row k="hh" label="Gérer le Happy Hour" sub="Activer et configurer les promos" />
      <Row k="menu" label="Modifier le menu" sub="Ajouter / retirer des articles" />
      <Field label="Valide jusqu’au" req hint="Délégation révoquée automatiquement à cette date"><Input type="datetime-local" value={d.until && d.until.includes('-') ? d.until : ''} onChange={e => setD({ ...d, until: e.target.value })} /></Field>
    </Sheet>
  );
}

window.TeamModule = TeamModule;
