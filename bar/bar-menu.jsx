/* QOff Back-Office Bar — Stock + Menu & Prix + Happy Hour + catégories + éditeur d'article.
   v2 : emoji en dropdown, catégorie & sous-filtre custom (catalogue superadmin), drag & drop
   de l'ordre des articles et des sous-filtres. */

/* ---- util : déplacer un id avant un autre dans un tableau d'objets {id} ---- */
function moveById(arr, fromId, toId) {
  if (fromId === toId) return arr;
  const a = [...arr];
  const fi = a.findIndex(x => x.id === fromId);
  if (fi < 0) return arr;
  const [it] = a.splice(fi, 1);
  const ti = a.findIndex(x => x.id === toId);
  a.splice(ti < 0 ? a.length : ti, 0, it);
  return a;
}
function moveStr(arr, from, to) {
  if (from === to) return arr;
  const a = [...arr];
  const fi = a.indexOf(from); if (fi < 0) return arr;
  a.splice(fi, 1);
  const ti = a.indexOf(to);
  a.splice(ti < 0 ? a.length : ti, 0, from);
  return a;
}

/* ===================== EMOJI PICKER (dropdown d'icône) ===================== */
function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const list = BarData.EMOJI_SET;
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button type="button" className={'emoji-trigger' + (open ? ' open' : '')} onClick={() => setOpen(o => !o)} title="Choisir une icône">
        {value}<span className="et-caret"><Icon.chevDown size={12} /></span>
      </button>
      {open && (
        <div className="emoji-pop">
          <div className="ep-search"><Search value={q} onChange={setQ} placeholder="Filtrer…" /></div>
          <div className="emoji-grid">
            {list.map((e, i) => (
              <button type="button" key={i} className={'emoji-cell' + (e === value ? ' on' : '')} onClick={() => { onChange(e); setOpen(false); }}>{e}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== STOCK (barman & patron) ===================== */
function StockModule({ ctx }) {
  const [menu, setMenu] = useState(() => BarData.menu.map(m => ({ ...m })));
  const [q, setQ] = useState('');
  const toggle = (id) => setMenu(m => m.map(it => {
    if (it.id !== id) return it;
    ctx.toast(it.name + (it.stock ? ' marqué épuisé — masqué côté client' : ' remis en stock'), it.stock ? 'er' : 'ok');
    return { ...it, stock: !it.stock };
  }));
  const cats = BarData.MENU_CATS.filter(c => menu.some(m => m.cat === c));
  const filtered = (c) => menu.filter(m => m.cat === c && (q === '' || m.name.toLowerCase().includes(q.toLowerCase())));
  const outCount = menu.filter(m => !m.stock).length;
  return (
    <div>
      <div className="toolbar">
        <Search value={q} onChange={setQ} placeholder="Rechercher un article…" />
        <span className="spacer" />
        <span className="cell-sub">{outCount > 0 ? <b style={{ color: 'var(--er)' }}>{outCount} épuisé(s)</b> : 'Tout en stock'} · {menu.length} articles</span>
      </div>
      {cats.map(c => {
        const rows = filtered(c);
        if (!rows.length) return null;
        return (
          <div key={c} className="sec">
            <div className="lbl" style={{ marginBottom: 8 }}>{c} · {rows.length}</div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {rows.map(it => (
                <div key={it.id} className={'stock-row' + (it.stock ? '' : ' out')}>
                  <span className="stock-emoji">{it.emoji}</span>
                  <div className="stock-info">
                    <div className="stock-name">{it.name}</div>
                    <div className="stock-cat">{it.desc}</div>
                  </div>
                  <span className="stock-price">{QData.CHF(it.price)}</span>
                  <span className="stock-state">{it.stock ? 'En stock' : 'Épuisé'}</span>
                  <Toggle on={it.stock} onClick={() => toggle(it.id)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===================== MENU & PRIX (patron / manager délégué) ===================== */
const HH_DISCOUNTS = [
  { v: 20, l: '−20%' }, { v: 30, l: '−30%' }, { v: 50, l: '−50%' }, { v: 100, l: 'Gratuit' },
];
function MenuModule({ ctx }) {
  const [menu, setMenu] = useState(() => BarData.menu.map(m => ({ ...m })));
  const [cats, setCats] = useState(() => [...BarData.MENU_CATS]);
  const [customCatSet, setCustomCatSet] = useState(() => new Set(BarData.customCats));
  const [subs, setSubs] = useState(() => {           // ordre des sous-filtres par catégorie (catalogue superadmin + custom)
    const o = {}; BarData.MENU_CATS.forEach(c => { o[c] = [...(BarData.SUBFILTERS[c] || [])]; }); return o;
  });
  const [customSubSet, setCustomSubSet] = useState(() => new Set());
  const [cat, setCat] = useState('Toutes');
  const [sub, setSub] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [hhSheet, setHhSheet] = useState(false);
  const [catSheet, setCatSheet] = useState(false);
  const [subSheet, setSubSheet] = useState(false);
  const [del, setDel] = useState(null);
  const [hh, setHh] = useState(() => ({ ...BarData.happyHour }));
  // drag state
  const [dragArt, setDragArt] = useState(null), [overArt, setOverArt] = useState(null);
  const [dragSub, setDragSub] = useState(null), [overSub, setOverSub] = useState(null);

  const tabs = ['Toutes', ...cats];
  const shown = menu.filter(m => (cat === 'Toutes' || m.cat === cat) && (!sub || m.sub === sub));

  const save = (d, newCat, newSub) => {
    if (newCat && !cats.includes(newCat)) { setCats(c => [...c, newCat]); setCustomCatSet(s => new Set(s).add(newCat)); }
    if (newSub && d.cat && !(subs[d.cat] || []).includes(newSub)) {
      setSubs(s => ({ ...s, [d.cat]: [...(s[d.cat] || []), newSub] }));
      setCustomSubSet(s => new Set(s).add(d.cat + '|' + newSub));
    }
    setMenu(m => {
      const exists = m.some(x => x.id === d.id);
      if (exists) return m.map(x => x.id === d.id ? { ...x, ...d } : x);
      return [...m, { ...d, id: 'it' + Date.now() }];
    });
    ctx.toast(sheet.mode === 'create' ? 'Article « ' + d.name + ' » ajouté' : 'Article « ' + d.name + ' » mis à jour', 'ok');
    setSheet(null);
  };
  const setPrice = (id, price) => setMenu(m => m.map(x => x.id === id ? { ...x, price } : x));
  const toggleActive = (id) => setMenu(m => m.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const toggleStock = (id) => setMenu(m => m.map(x => x.id === id ? { ...x, stock: !x.stock } : x));
  const remove = () => { setMenu(m => m.filter(x => x.id !== del.id)); ctx.toast(del.name + ' retiré de la carte', 'er'); setDel(null); };

  /* ---- DnD articles ---- */
  const dropArt = (targetId) => { if (dragArt && dragArt !== targetId) { setMenu(m => moveById(m, dragArt, targetId)); ctx.toast('Ordre des articles mis à jour', 'info'); } setDragArt(null); setOverArt(null); };
  /* ---- DnD sous-filtres ---- */
  const dropSub = (target) => { if (dragSub && dragSub !== target) { setSubs(s => ({ ...s, [cat]: moveStr(s[cat] || [], dragSub, target) })); ctx.toast('Ordre des sous-filtres mis à jour', 'info'); } setDragSub(null); setOverSub(null); };

  const subList = cat !== 'Toutes' ? (subs[cat] || []) : [];

  return (
    <div>
      {/* Happy Hour */}
      <div className="hh-config">
        <div className="hh-head">
          <span className="hh-ic"><Icon.spark size={19} /></span>
          <div style={{ flex: 1 }}>
            <div className="hh-ttl">Happy Hour</div>
            <div className="hh-sub">Tarif réduit automatique sur les articles sélectionnés</div>
            {hh.active && <span className="hh-active"><span style={{ width: 6, height: 6, borderRadius: 9, background: '#1D9E75' }} /> Actif — {hh.start} → {hh.end} · −{hh.discount}% · {hh.items.length} articles</span>}
          </div>
          <Toggle on={hh.active} onClick={() => { setHh(h => ({ ...h, active: !h.active })); ctx.toast('Happy Hour ' + (hh.active ? 'désactivé' : 'activé'), hh.active ? 'info' : 'ok'); }} />
          <Btn variant="gh" size="sm" style={{ marginLeft: 10 }} onClick={() => setHhSheet(true)}>Configurer</Btn>
        </div>
      </div>

      {/* Catégories */}
      <div className="cat-list">
        {tabs.map(c => (
          <button key={c} className={'cat-pill' + (cat === c ? ' on' : '')} onClick={() => { setCat(c); setSub(null); }}>
            {c}{c !== 'Toutes' ? <span className="cp-cnt">{menu.filter(m => m.cat === c).length}</span> : null}
            {customCatSet.has(c) ? <span className="sf-custom-tag">custom</span> : null}
          </button>
        ))}
        <button className="cat-pill add" onClick={() => setCatSheet(true)}><Icon.plus size={13} /> Nouvelle catégorie</button>
      </div>

      {/* Sous-filtres (catalogue superadmin + custom) — réordonnables par drag & drop */}
      {cat !== 'Toutes' && (
        <div className="subfilter-bar">
          <span className="sf-lbl"><Icon.grip size={13} /> Sous-filtres</span>
          <button className={'sf-chip' + (!sub ? ' on' : '')} onClick={() => setSub(null)} style={{ cursor: 'pointer' }}>Tous</button>
          {subList.map(s => (
            <div key={s} draggable
              onDragStart={() => setDragSub(s)}
              onDragOver={(e) => { e.preventDefault(); setOverSub(s); }}
              onDrop={() => dropSub(s)}
              onDragEnd={() => { setDragSub(null); setOverSub(null); }}
              className={'sf-chip' + (sub === s ? ' on' : '') + (dragSub === s ? ' dragging' : '') + (overSub === s ? ' dragover' : '')}
              onClick={() => setSub(sub === s ? null : s)}>
              <span className="sf-grip"><Icon.grip size={12} /></span>{s}
              {customSubSet.has(cat + '|' + s) ? <span className="sf-custom-tag">custom</span> : null}
            </div>
          ))}
          <button className="sf-chip add" onClick={() => setSubSheet(true)}><Icon.plus size={12} /> Sous-filtre</button>
        </div>
      )}

      <SectionHead title={cat === 'Toutes' ? 'Tous les articles' : cat + (sub ? ' · ' + sub : '')} sub={shown.length + ' article(s)'}
        action={<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span className="drag-hint"><Icon.grip size={13} /> Glissez pour réordonner</span><Btn variant="or" size="sm" icon={<Icon.plus size={14} />} onClick={() => setSheet({ mode: 'create', cat: cat !== 'Toutes' ? cat : 'Cocktails', sub })}>Ajouter un article</Btn></div>} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shown.map(it => (
          <div key={it.id}
            className={'art-card' + (it.active ? '' : ' inactive') + (dragArt === it.id ? ' dragging' : '') + (overArt === it.id ? ' dragover' : '')}
            onDragOver={(e) => { e.preventDefault(); setOverArt(it.id); }}
            onDrop={() => dropArt(it.id)}>
            <span className="art-grip" draggable
              onDragStart={() => setDragArt(it.id)}
              onDragEnd={() => { setDragArt(null); setOverArt(null); }}
              title="Glisser pour déplacer"><Icon.grip size={16} /></span>
            <span className="art-emoji">{it.emoji}</span>
            <div className="art-info">
              <div className="art-name">{it.name}</div>
              {it.desc ? <div className="art-sub">{it.desc}</div> : null}
              <div className="art-tags">
                {it.sub ? <span className="art-tag">{it.sub}</span> : null}
                {it.tags.map(t => <span key={t} className={'art-tag' + (t === 'Happy Hour' ? ' hh' : '')}>{t}</span>)}
              </div>
            </div>
            <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
              <input className="price-inp" type="number" step="0.5" value={it.price}
                onChange={e => setPrice(it.id, +e.target.value)} title="Modifier le prix (CHF)" />
              <span className="tva-badge">TVA {it.tva}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto', width: 92, justifyContent: 'center' }}>
              <Toggle on={it.stock} onClick={() => { toggleStock(it.id); ctx.toast(it.name + (it.stock ? ' épuisé' : ' en stock'), it.stock ? 'er' : 'ok'); }} />
            </div>
            <div className="art-actions">
              <Btn variant="gh" size="sm" icon={<Icon.edit size={13} />} onClick={() => setSheet({ mode: 'edit', item: it })}>Modifier</Btn>
              <RowMenu items={[
                { icon: <Icon.eye size={16} />, label: it.active ? 'Désactiver (masquer)' : 'Réactiver', onClick: () => { toggleActive(it.id); ctx.toast(it.name + (it.active ? ' masqué' : ' réactivé'), 'info'); } },
                { sep: true },
                { icon: <Icon.trash size={16} />, label: 'Supprimer', tone: 'danger', onClick: () => setDel(it) },
              ]} />
            </div>
          </div>
        ))}
        {shown.length === 0 && <Empty icon={<Icon.tag size={20} />} title="Aucun article">Aucun article dans ce filtre.</Empty>}
      </div>

      {sheet && <ArticleSheetBar sheet={sheet} cats={cats} subs={subs} onClose={() => setSheet(null)} onSave={save} ctx={ctx} />}
      {hhSheet && <HappyHourSheet hh={hh} menu={menu} onClose={() => setHhSheet(false)} onSave={(h) => { setHh(h); ctx.toast('Happy Hour enregistré', 'ok'); setHhSheet(false); }} />}
      {catSheet && <CategorySheet cats={cats} onClose={() => setCatSheet(false)} onSave={({ name, custom, subs }) => {
        setCats(c => c.includes(name) ? c : [...c, name]);
        if (custom) setCustomCatSet(s => new Set(s).add(name));
        setSubs(s => ({ ...s, [name]: (s[name] && s[name].length) ? s[name] : (subs || []) }));
        ctx.toast(custom ? 'Catégorie « ' + name + ' » créée — soumise au catalogue QOff' : 'Catégorie « ' + name + ' » ajoutée depuis le catalogue', 'ok'); setCatSheet(false);
      }} />}
      {subSheet && <SubFilterSheet cat={cat} existing={subs[cat] || []} onClose={() => setSubSheet(false)} onSave={(name, custom) => {
        setSubs(s => ({ ...s, [cat]: [...(s[cat] || []), name] }));
        if (custom) setCustomSubSet(s => new Set(s).add(cat + '|' + name));
        ctx.toast(custom ? 'Sous-filtre « ' + name + ' » créé — soumis au catalogue QOff' : 'Sous-filtre « ' + name + ' » ajouté à ' + cat, 'ok'); setSubSheet(false);
      }} />}
      {del && (
        <Modal icon={<Icon.trash size={22} />} iconTone="er" title="Supprimer cet article ?" onClose={() => setDel(null)}
          footer={<><Btn variant="gh" onClick={() => setDel(null)}>Annuler</Btn><Btn variant="er" onClick={remove}>Supprimer</Btn></>}>
          <p>« <b>{del.name}</b> » ne sera plus proposé aux clients. L'historique des commandes est conservé.</p>
        </Modal>
      )}
    </div>
  );
}

/* ---- Éditeur d'article (création / modification) ---- */
const ALL_BADGES = ['Nouveau', 'Happy Hour', 'Signature', 'Bio', 'Végé', 'Vegan', 'Sans lactose'];
const TVA_OPTS = [{ value: '8.1', label: '8.1% — taux normal (alcool CH)' }, { value: '2.6', label: '2.6% — taux réduit (food/soft CH)' }, { value: '20', label: '20% (FR)' }, { value: '19', label: '19% (DE)' }, { value: '22', label: '22% (IT)' }];
const LANGS = ['FR', 'DE', 'IT', 'EN'];
const ADD_CUSTOM = '__add__';
function ArticleSheetBar({ sheet, cats, subs, onClose, onSave, ctx }) {
  const edit = sheet.mode === 'edit';
  const it0 = sheet.item || { emoji: '🍸', name: '', cat: sheet.cat || 'Cocktails', price: 0, tva: 8.1, active: true, stock: true, tags: [], desc: '', sub: sheet.sub || '' };
  const [d, setD] = useState(() => ({ ...it0, tags: [...(it0.tags || [])] }));
  const [lang, setLang] = useState('FR');
  const [newCat, setNewCat] = useState('');      // nom de catégorie custom en cours de saisie
  const [newSub, setNewSub] = useState('');       // nom de sous-filtre custom en cours de saisie
  const [catMode, setCatMode] = useState('pick'); // pick | custom
  const [subMode, setSubMode] = useState('pick');
  const toggleTag = (t) => setD(s => ({ ...s, tags: s.tags.includes(t) ? s.tags.filter(x => x !== t) : [...s.tags, t] }));
  const subOptions = subs[d.cat] || [];
  const finalCat = catMode === 'custom' ? newCat.trim() : d.cat;
  const finalSub = subMode === 'custom' ? newSub.trim() : d.sub;
  const valid = d.name && finalCat;
  return (
    <Sheet title={edit ? 'Modifier l’article' : 'Nouvel article'} sub={edit ? d.name : 'Carte du bar'} onClose={onClose} width={460}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!valid}
        onClick={() => onSave({ ...d, cat: finalCat, sub: finalSub }, catMode === 'custom' ? finalCat : null, subMode === 'custom' ? finalSub : null)}>{edit ? 'Enregistrer' : 'Ajouter à la carte'}</Btn></>}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="Icône"><EmojiPicker value={d.emoji} onChange={(e) => setD({ ...d, emoji: e })} /></Field>
        <div style={{ flex: 1 }}><Field label="Nom de l’article" req><Input value={d.name} onChange={e => setD({ ...d, name: e.target.value })} placeholder="Spritz Aperol" /></Field></div>
      </div>
      <Field label="Description" hint="Affichée côté client"><Textarea value={d.desc} onChange={e => setD({ ...d, desc: e.target.value })} placeholder="Aperol, prosecco, eau pétillante, orange." style={{ minHeight: 56 }} /></Field>
      <div className="form-grid-2">
        <Field label="Prix" req hint="TVA incluse">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: 11, fontSize: 13, color: 'var(--g400)', fontWeight: 600 }}>CHF</span>
            <Input type="number" step="0.5" min="0" value={d.price} onChange={e => setD({ ...d, price: +e.target.value })} style={{ paddingLeft: 44 }} />
          </div>
        </Field>
        <Field label="TVA" hint="À terme : classes (normale / réduite) + bascule sur place ↔ à l’emporter automatique">
          <NativeSelect options={TVA_OPTS} value={'' + d.tva} onChange={v => setD({ ...d, tva: +v })} />
        </Field>
      </div>
      <div className="form-grid-2">
        <Field label="Catégorie" req>
          <NativeSelect options={[...cats.map(c => ({ value: c, label: c })), { value: ADD_CUSTOM, label: '+ Nouvelle catégorie…' }]}
            value={catMode === 'custom' ? ADD_CUSTOM : d.cat}
            onChange={v => { if (v === ADD_CUSTOM) setCatMode('custom'); else { setCatMode('pick'); setD({ ...d, cat: v, sub: '' }); setSubMode('pick'); } }} />
          {catMode === 'custom' && <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Ex. Spiritueux" autoFocus style={{ marginTop: 8 }} />}
        </Field>
        <Field label="Sous-filtre" hint="Catalogue QOff ou personnalisé">
          <NativeSelect options={[{ value: '', label: '— Aucun —' }, ...subOptions.map(s => ({ value: s, label: s })), { value: ADD_CUSTOM, label: '+ Nouveau sous-filtre…' }]}
            value={subMode === 'custom' ? ADD_CUSTOM : (d.sub || '')}
            onChange={v => { if (v === ADD_CUSTOM) setSubMode('custom'); else { setSubMode('pick'); setD({ ...d, sub: v }); } }} />
          {subMode === 'custom' && <Input value={newSub} onChange={e => setNewSub(e.target.value)} placeholder="Ex. Sans alcool" autoFocus style={{ marginTop: 8 }} />}
        </Field>
      </div>
      {(catMode === 'custom') && (
        <div className="card card-pad" style={{ background: 'var(--purplel)', border: '1px solid rgba(139,92,246,.2)', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--purpled)', display: 'flex', gap: 8 }}><Icon.info size={14} /> Cette catégorie custom est propre à votre bar et sera proposée à l’équipe QOff pour enrichir le catalogue par défaut.</div>
        </div>
      )}
      <Field label="Badges" hint="À terme : gestion des badges (création, ordre, visibilité) confiée aux responsables de bar — voir backlog">
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {ALL_BADGES.map(t => <button key={t} className={'badge ' + (d.tags.includes(t) ? 'or' : 'plain')} style={{ cursor: 'pointer', border: d.tags.includes(t) ? '1px solid var(--or)' : '1px solid transparent' }} onClick={() => toggleTag(t)}>{d.tags.includes(t) ? <Icon.check size={11} /> : null}{t}</button>)}
        </div>
      </Field>
      <Field label="Traductions">
        <div className="tabs" style={{ marginBottom: 10 }}>{LANGS.map(l => <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>{l}</button>)}</div>
        <Input placeholder={'Nom (' + lang + ')'} defaultValue={lang === 'FR' ? d.name : ''} style={{ marginBottom: 8 }} />
        <Textarea placeholder={'Description (' + lang + ')'} style={{ minHeight: 48 }} />
        <Btn variant="gh" full style={{ marginTop: 10 }} icon={<Icon.sparkAdmin size={14} />} onClick={() => ctx.toast('Traductions générées par IA', 'ok')}>Traduire avec l’IA</Btn>
      </Field>
      <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Toggle on={d.stock} onClick={() => setD({ ...d, stock: !d.stock })} /><span style={{ fontSize: 13 }}>{d.stock ? 'En stock — visible' : 'Épuisé — masqué côté client'}</span></div>
    </Sheet>
  );
}

/* ---- Sheet : configurer Happy Hour ---- */
function HappyHourSheet({ hh, menu, onClose, onSave }) {
  const [d, setD] = useState(() => ({ ...hh, items: [...hh.items] }));
  const toggleItem = (id) => setD(s => ({ ...s, items: s.items.includes(id) ? s.items.filter(x => x !== id) : [...s.items, id] }));
  return (
    <Sheet title="Happy Hour" sub="Tarif réduit planifié" onClose={onClose} width={460}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" onClick={() => onSave(d)}>Enregistrer</Btn></>}>
      <div className="form-grid-2">
        <Field label="Début"><Input type="time" value={d.start} onChange={e => setD({ ...d, start: e.target.value })} /></Field>
        <Field label="Fin"><Input type="time" value={d.end} onChange={e => setD({ ...d, end: e.target.value })} /></Field>
      </div>
      <Field label="Remise appliquée">
        <div className="disc-grid">
          {HH_DISCOUNTS.map(o => <button key={o.v} className={'disc-pill' + (d.discount === o.v ? ' on' : '')} onClick={() => setD({ ...d, discount: o.v })}>{o.l}</button>)}
        </div>
      </Field>
      <Field label={'Articles concernés (' + d.items.length + ')'}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {menu.map(it => (
            <label key={it.id} className="stock-row" style={{ cursor: 'pointer', padding: '10px 14px' }}>
              <input type="checkbox" className="refund-check" checked={d.items.includes(it.id)} onChange={() => toggleItem(it.id)} />
              <span className="stock-emoji" style={{ width: 24 }}>{it.emoji}</span>
              <div className="stock-info"><div className="stock-name" style={{ fontSize: 13 }}>{it.name}</div></div>
              <span className="stock-price">{QData.CHF(it.price)}</span>
              {d.items.includes(it.id) && <span className="art-tag hh">→ {QData.CHF(+(it.price * (1 - d.discount / 100)).toFixed(2))}</span>}
            </label>
          ))}
        </div>
      </Field>
    </Sheet>
  );
}

/* ---- Sheet : ajouter une catégorie (catalogue QOff + création custom) ---- */
function CategorySheet({ cats, onClose, onSave }) {
  const available = (BarData.CAT_CATALOG || []).filter(c => !cats.includes(c.name));
  const [mode, setMode] = useState(available.length ? 'pick' : 'custom'); // pick | custom
  const [pick, setPick] = useState(available[0] ? available[0].name : '');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍹');
  const [subsTxt, setSubsTxt] = useState('');
  const custom = mode === 'custom';
  const finalName = custom ? name.trim() : pick;
  const valid = custom ? !!finalName : !!pick;
  const submit = () => onSave({ name: finalName, custom, subs: custom ? subsTxt.split(',').map(s => s.trim()).filter(Boolean) : [] });
  return (
    <Sheet title="Ajouter une catégorie" sub="Catalogue QOff ou création" onClose={onClose} width={440}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!valid} onClick={submit}>{custom ? 'Créer' : 'Ajouter'}</Btn></>}>
      <Field label="Catégorie" req hint="Choisissez dans le catalogue QOff ou créez-en une nouvelle">
        <NativeSelect
          options={[...available.map(c => ({ value: c.name, label: c.emoji + '   ' + c.name })), { value: ADD_CUSTOM, label: '+ Créer une nouvelle catégorie…' }]}
          value={custom ? ADD_CUSTOM : pick}
          onChange={v => { if (v === ADD_CUSTOM) setMode('custom'); else { setMode('pick'); setPick(v); } }} />
      </Field>
      {!custom && available.length === 0 && <div className="hint">Toutes les catégories du catalogue QOff sont déjà ajoutées — créez-en une nouvelle.</div>}
      {custom && (
        <>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Icône"><EmojiPicker value={emoji} onChange={setEmoji} /></Field>
            <div style={{ flex: 1 }}><Field label="Nom" req><Input value={name} onChange={e => setName(e.target.value)} placeholder="Spiritueux" autoFocus /></Field></div>
          </div>
          <Field label="Sous-filtres" hint="Séparés par une virgule (optionnel)"><Input value={subsTxt} onChange={e => setSubsTxt(e.target.value)} placeholder="Whisky, Gin, Rhum, Vodka" /></Field>
          <div className="card card-pad" style={{ background: 'var(--purplel)', border: '1px solid rgba(139,92,246,.2)' }}>
            <div style={{ fontSize: 12, color: 'var(--purpled)', display: 'flex', gap: 8 }}><Icon.info size={14} /> Catégorie propre à ce bar. Elle est remontée à QOff (catalogue « créées par les bars, non ajoutées par défaut ») pour décider d’un ajout global.</div>
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ---- Sheet : ajouter un sous-filtre (catalogue QOff + création custom) ---- */
function SubFilterSheet({ cat, existing, onClose, onSave }) {
  const available = ((BarData.SUBFILTER_CATALOG && BarData.SUBFILTER_CATALOG[cat]) || []).filter(s => !existing.includes(s));
  const [mode, setMode] = useState(available.length ? 'pick' : 'custom'); // pick | custom
  const [pick, setPick] = useState(available[0] || '');
  const [name, setName] = useState('');
  const custom = mode === 'custom';
  const finalName = custom ? name.trim() : pick;
  const dup = existing.includes(finalName);
  const valid = !!finalName && !dup;
  return (
    <Sheet title="Ajouter un sous-filtre" sub={'Catégorie ' + cat} onClose={onClose} width={420}
      footer={<><Btn variant="gh" onClick={onClose}>Annuler</Btn><Btn variant="or" disabled={!valid} onClick={() => onSave(finalName, custom)}>{custom ? 'Créer' : 'Ajouter'}</Btn></>}>
      <Field label="Sous-filtre" req hint="Catalogue QOff de la catégorie ou création">
        <NativeSelect
          options={[...available.map(s => ({ value: s, label: s })), { value: ADD_CUSTOM, label: '+ Créer un nouveau sous-filtre…' }]}
          value={custom ? ADD_CUSTOM : pick}
          onChange={v => { if (v === ADD_CUSTOM) setMode('custom'); else { setMode('pick'); setPick(v); } }} />
      </Field>
      {!custom && available.length === 0 && <div className="hint">Tous les sous-filtres du catalogue QOff pour « {cat} » sont déjà présents — créez-en un nouveau.</div>}
      {custom && (
        <>
          <Field label="Nom du sous-filtre" req><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex. Sans alcool" autoFocus /></Field>
          {dup && <div className="hint" style={{ color: 'var(--er)' }}>Ce sous-filtre existe déjà.</div>}
          <div className="card card-pad" style={{ background: 'var(--purplel)', border: '1px solid rgba(139,92,246,.2)' }}>
            <div style={{ fontSize: 12, color: 'var(--purpled)', display: 'flex', gap: 8 }}><Icon.info size={14} /> Sous-filtre propre à ce bar, remonté à QOff pour enrichir le catalogue de « {cat} ».</div>
          </div>
        </>
      )}
      {existing.length > 0 && (
        <Field label="Déjà présents">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{existing.map(s => <span key={s} className="art-tag">{s}</span>)}</div>
        </Field>
      )}
    </Sheet>
  );
}

Object.assign(window, { StockModule, MenuModule, EmojiPicker });
