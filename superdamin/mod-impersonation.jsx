/* QOff Super Admin — Mode impersonation : back-office patron complet.
   Color-coding : orange = action patron · violet = action réservée Super Admin. */
function AdminTag() { return <span className="admin-tag"><Icon.sparkAdmin size={11} /> Admin</span>; }

function ModImpersonation({ ctx, bar }) {
  const [tab, setTab] = useState('live');
  const [menu, setMenu] = useState(() => QD.impMenu.map(g => ({ ...g, items: g.items.map((it, i) => ({ ...it, id: g.cat + '-' + i, desc: '' })) })));
  const [articleSheet, setArticleSheet] = useState(null); // { mode, item }
  const [delItem, setDelItem] = useState(null);
  const b = bar || QD.bars[0];
  const tabs = [
    { id: 'live', label: 'Commandes live', ic: <Icon.pulse size={16} /> },
    { id: 'menu', label: 'Menu', ic: <Icon.box size={16} /> },
    { id: 'stats', label: 'Statistiques', ic: <Icon.dashboard size={16} /> },
    { id: 'team', label: 'Équipe', ic: <Icon.team size={16} /> },
    { id: 'history', label: 'Historique', ic: <Icon.clock size={16} /> },
    { id: 'settings', label: 'Réglages bar', ic: <Icon.settings size={16} /> },
  ];
  const ordTone = { preparing: 'warn', ready: 'info', claimed: 'ok' };
  const ordLabel = { preparing: 'En préparation', ready: 'Prête', claimed: 'Récupérée' };

  const saveArticle = (d) => {
    const item = { ...d, id: d.id || 'it' + Date.now() };
    setMenu(m => {
      let groups = m.map(g => ({ ...g, items: g.items.filter(it => it.id !== item.id) }));
      const tgt = groups.find(g => g.cat === item.cat);
      if (tgt) groups = groups.map(g => g.cat === item.cat ? { ...g, items: [...g.items, item] } : g);
      else groups = [...groups, { cat: item.cat, items: [item] }];
      return groups.filter(g => g.items.length);
    });
    ctx.toast(articleSheet.mode === 'create' ? 'Article « ' + item.name + ' » ajouté à la carte' : 'Article « ' + item.name + ' » mis à jour', 'ok');
    setArticleSheet(null);
  };
  const toggleStock = (id) => setMenu(m => m.map(g => ({ ...g, items: g.items.map(it => it.id === id ? { ...it, stock: !it.stock } : it) })));
  const removeItem = () => { setMenu(m => m.map(g => ({ ...g, items: g.items.filter(it => it.id !== delItem.id) })).filter(g => g.items.length)); ctx.toast(delItem.name + ' retiré de la carte', 'er'); setDelItem(null); };

  return (
    <div className="a-content-inner" style={{ maxWidth: 1080 }}>
      {/* patron back-office sub-shell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bk)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🍹</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--ff-title)', fontWeight: 700, fontSize: 18 }}>{b.name}</div>
          <div className="cell-sub">{b.flag} {b.city} · Back-office patron · <b style={{ color: 'var(--purpled)' }}>{b.patron}</b></div>
        </div>
        <Badge tone="ok" dot>Ouvert</Badge>
      </div>

      <div className="tabs" style={{ marginBottom: 18, display: 'flex', flexWrap: 'wrap' }}>
        {tabs.map(t => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>{t.ic}{t.label}</button>)}
      </div>

      {/* LIVE ORDERS */}
      {tab === 'live' && (
        <div className="sec">
          <SectionHead title="Commandes en cours" sub="Tableau temps réel du barman"
            action={<Btn variant="purple" size="sm" icon={<Icon.refresh size={14} />} onClick={() => ctx.toast('Statut commande forcé [via admin]', 'purple')}>Forcer un statut <AdminTag /></Btn>} />
          <div className="grid3">
            {QD.impLiveOrders.map(o => (
              <div key={o.code} className="card card-pad">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--ff-title)', fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{o.code}</span>
                  <Badge tone={ordTone[o.status]} dot={o.status !== 'claimed'}>{ordLabel[o.status]}</Badge>
                </div>
                <div className="cell-sub" style={{ marginBottom: 4 }}>{o.time}</div>
                <div style={{ fontSize: 13, marginBottom: 12 }}>{o.items}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="lbl">Total</span><span className="mono" style={{ fontWeight: 700 }}>{QD.CHF(o.total)}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {o.status === 'preparing' && <Btn variant="or" size="sm" full onClick={() => ctx.toast('Commande ' + o.code + ' marquée prête', 'ok')}>Marquer prête</Btn>}
                  {o.status === 'ready' && <Btn variant="ok" size="sm" full onClick={() => ctx.toast('Commande ' + o.code + ' remise', 'ok')}>Remettre</Btn>}
                  {o.status === 'claimed' && <Btn variant="gh" size="sm" full disabled>Terminée</Btn>}
                  <Btn variant="purple" size="sm" onClick={() => ctx.toast('Remboursement ' + o.code + ' [via admin]', 'purple')} title="Action Super Admin"><Icon.transfer size={14} /></Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MENU */}
      {tab === 'menu' && (
        <div className="sec">
          <SectionHead title="Carte du bar" sub="Articles, prix et disponibilité"
            action={<div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="or" size="sm" icon={<Icon.plus size={14} />} onClick={() => setArticleSheet({ mode: 'create' })}>Ajouter un article</Btn>
              <Btn variant="purple" size="sm" onClick={() => ctx.toast('Synchronisation depuis la bibliothèque globale [via admin]', 'purple')}>Sync. bibliothèque <AdminTag /></Btn>
            </div>} />
          {menu.map((group, gi) => (
            <div key={group.cat} style={{ marginTop: gi === 0 ? 8 : 0, marginBottom: 16 }}>
              <div className="lbl" style={{ marginBottom: 8 }}>{group.cat} · {group.items.length}</div>
              <div className="card" style={{ overflow: 'hidden' }}>
                {group.items.map((it, i) => (
                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < group.items.length - 1 ? '1px solid var(--g100)' : 'none', opacity: it.stock ? 1 : .55 }}>
                    <span style={{ fontSize: 22 }}>{it.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cell-strong" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{it.name} {it.tags.map(t => <span key={t} className="badge or" style={{ fontSize: 10 }}>{t}</span>)}</div>
                      {it.desc ? <div className="cell-sub">{it.desc}</div> : null}
                    </div>
                    <span className="inline-edit mono" style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }} onClick={() => setArticleSheet({ mode: 'edit', item: it })} title="Modifier le prix">{QD.CHF(it.price)}<Icon.edit size={12} /></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 118, justifyContent: 'flex-end' }}>
                      <span className="cell-sub" style={{ whiteSpace: 'nowrap' }}>{it.stock ? 'En stock' : 'Épuisé'}</span>
                      <Toggle on={it.stock} onClick={() => { toggleStock(it.id); ctx.toast(it.name + (it.stock ? ' marqué épuisé' : ' remis en stock'), it.stock ? 'info' : 'ok'); }} />
                    </div>
                    <Btn variant="gh" size="sm" icon={<Icon.edit size={13} />} onClick={() => setArticleSheet({ mode: 'edit', item: it })}>Modifier</Btn>
                    <IconBtn icon={<Icon.trash size={15} />} title="Retirer de la carte" onClick={() => setDelItem(it)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STATS */}
      {tab === 'stats' && <BarStats ctx={ctx} b={b} />}

      {/* ÉQUIPE */}
      {tab === 'team' && <BarTeam ctx={ctx} b={b} />}

      {/* HISTORIQUE */}
      {tab === 'history' && <BarHistory ctx={ctx} b={b} />}

      {/* SETTINGS — patron + admin-only zone */}
      {tab === 'settings' && (
        <>
          <div className="sec">
            <SectionHead title="Réglages du bar" sub="Modifiables par le patron" />
            <div className="card card-pad">
              <Field label="Nom du bar"><Input defaultValue={b.name} /></Field>
              <Field label="Description"><Textarea defaultValue="Bar de plage les pieds dans l'eau, cocktails et planches à partager." /></Field>
              <div className="kv"><span className="k">Happy Hour activée</span><Toggle on /></div>
              <div className="kv"><span className="k">Accepter les commandes</span><Toggle on /></div>
              <div style={{ marginTop: 14 }}><Btn variant="or" onClick={() => ctx.toast('Réglages du bar enregistrés', 'ok')}>Enregistrer</Btn></div>
            </div>
          </div>

          <div className="sec">
            <div className="sec-head"><div><div className="sec-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Zone Super Admin <AdminTag /></div><div className="sec-sub">Réglages invisibles pour le patron — réservés à l'équipe QOff</div></div></div>
            <div className="card card-pad" style={{ border: '1px solid rgba(139,92,246,.3)', background: 'var(--purplel)' }}>
              <div className="kv" style={{ borderColor: 'rgba(139,92,246,.2)' }}><span className="k">Taux de commission</span><span className="inline-edit mono" style={{ borderColor: 'var(--purple)', color: 'var(--purpled)' }} onClick={() => ctx.toast('Commission modifiée [via admin]', 'purple')}>{b.comm} %<Icon.edit size={12} /></span></div>
              <div className="kv" style={{ borderColor: 'rgba(139,92,246,.2)' }}><span className="k">Statut de l'établissement</span><Select value={QD.S[b.status]} onChange={() => ctx.toast('Statut bar modifié [via admin]', 'purple')} options={['Actif', 'Suspendu', 'Maintenance']} /></div>
              <div className="kv" style={{ borderColor: 'rgba(139,92,246,.2)' }}><span className="k">Traduction IA articles (flag Pro)</span><Toggle on purple /></div>
              <div className="kv" style={{ border: 'none' }}><span className="k">Remboursement direct par le patron</span><Toggle purple /></div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <Btn variant="purple" onClick={() => ctx.toast('Réglages Super Admin enregistrés [via admin]', 'purple')}>Enregistrer (Admin)</Btn>
                <Btn variant="gh" icon={<Icon.list size={15} />} onClick={() => ctx.go('audit')}>Voir l'audit de ce bar</Btn>
              </div>
            </div>
          </div>
        </>
      )}

      {articleSheet && <ArticleSheet ctx={ctx} sheet={articleSheet} onClose={() => setArticleSheet(null)} onSave={saveArticle} />}
      {delItem && (
        <Modal icon={<Icon.trash size={22} />} iconTone="er" title="Retirer cet article ?" onClose={() => setDelItem(null)}
          footer={<><Btn variant="gh" onClick={() => setDelItem(null)}>Annuler</Btn><Btn variant="er" onClick={removeItem}>Retirer</Btn></>}>
          <p>« <b>{delItem.name}</b> » ne sera plus proposé aux clients. Les commandes passées restent dans l'historique.</p>
        </Modal>
      )}
    </div>
  );
}

window.ModImpersonation = ModImpersonation;
