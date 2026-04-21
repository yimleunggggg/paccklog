// Trip Detail + Packing List — PACKLOG v2
const { useState: useState2, useMemo: useMemo2 } = React;

const ScreenTripDetail = ({ lang = 'zh', density = 'comfort', heroStyle = 'cover' }) => {
  const data = window.PACKLOG_DATA;
  const { trip, categories, items } = data;
  const [filter, setFilter] = useState2('all');
  const [packed, setPacked] = useState2(() => {
    const s = new Set();
    items.forEach(it => it.packed && s.add(it.id));
    return s;
  });

  const filtered = useMemo2(() => {
    return items.filter(it => {
      if (filter === 'all') return true;
      if (filter === 'todo') return it.status === 'must' && !packed.has(it.id);
      if (filter === 'done') return packed.has(it.id);
      if (filter === 'buy') return it.status === 'buy';
      if (filter === 'opt') return it.status === 'opt';
      return true;
    });
  }, [filter, packed]);

  const grouped = useMemo2(() => {
    const g = {};
    filtered.forEach(it => { (g[it.cat] = g[it.cat] || []).push(it); });
    return g;
  }, [filtered]);

  const totalPacked = packed.size;
  const pct = Math.round((totalPacked / items.length) * 100);

  const toggle = (id) => {
    const n = new Set(packed);
    n.has(id) ? n.delete(id) : n.add(id);
    setPacked(n);
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 40 }}>
      {/* top chrome */}
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <button style={{ background: 'rgba(254,252,248,.7)', border: '0.5px solid var(--paper3)', borderRadius: 18, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ink)" strokeWidth="1.3"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: 'rgba(254,252,248,.7)', border: '0.5px solid var(--paper3)', borderRadius: 18, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ink)" strokeWidth="1.3"><path d="M8 2v9M4 7l4 4 4-4M3 14h10"/></svg>
          </button>
          <button style={{ background: 'rgba(254,252,248,.7)', border: '0.5px solid var(--paper3)', borderRadius: 18, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ink)" strokeWidth="1.3"><circle cx="3" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="13" cy="8" r="1"/></svg>
          </button>
        </div>
      </div>

      {/* HERO — dramatic destination plate, then info block */}
      <div style={{ margin: '0 16px 18px', borderRadius: 18, overflow: 'hidden', background: 'var(--forest)', color: 'var(--cream)', position: 'relative' }}>
        {/* real destination art as background */}
        <div style={{ position: 'relative', height: 160 }}>
          <DestArt name="yakushima" tone="dark" style={{ height: 160, width: '100%', borderRadius: 0 }}/>
          {/* gradient scrim at bottom for legibility */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(36,61,31,0) 40%, rgba(36,61,31,.95) 100%)' }}/>
          {/* T-minus badge — top right */}
          <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,.25)', backdropFilter: 'blur(4px)', border: '0.5px solid rgba(255,255,255,.2)', padding: '6px 10px', borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.65)', letterSpacing: '0.04em' }}>{T('还剩','還剩','T—', lang)}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: 'var(--cream)', lineHeight: 1 }}>{trip.daysToGo}<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 3, opacity: 0.7 }}>{T('天','天','d', lang)}</span></div>
          </div>
          {/* title overlaid at bottom */}
          <div style={{ position: 'absolute', left: 22, right: 22, bottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--forest4)', letterSpacing: '0.14em', marginBottom: 4, textTransform: 'uppercase' }}>Folio 004 · Yakushima</div>
            <div style={{ fontFamily: 'var(--cjk-display)', fontSize: 38, fontWeight: 600, color: 'var(--cream)', lineHeight: 1, letterSpacing: '0.02em' }}>{trip.title}</div>
          </div>
        </div>

        {/* info block */}
        <div style={{ padding: '18px 22px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>{trip.subtitle} · {trip.days} {T('日','日','days', lang)}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>May 8 — May 14, 2026</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 500, color: 'var(--cream)', lineHeight: 1, letterSpacing: '-0.02em' }}>{pct}<span style={{ fontSize: 14, opacity: 0.6, marginLeft: 2 }}>%</span></div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{T('已打包','已打包','packed', lang)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 1.5, height: 3, marginBottom: 12 }}>
            {Array.from({ length: items.length }).map((_, i) => (
              <div key={i} style={{ flex: 1, background: i < totalPacked ? 'var(--forest4)' : 'rgba(255,255,255,.15)' }}/>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: 11, color: 'rgba(255,255,255,.65)' }}>
            <span>{totalPacked}/{items.length} {T('打包','打包','packed', lang)}</span>
            <span>{items.filter(i=>i.status==='buy').length} {T('待购','待購','to buy', lang)}</span>
            <span>{items.filter(i=>i.status==='opt').length} {T('可选','可選','optional', lang)}</span>
          </div>
        </div>
      </div>

      {/* weather — cleaner */}
      <div style={{ margin: '0 16px 12px', padding: '14px 16px', background: 'var(--cream)', border: '0.5px solid var(--paper3)', borderRadius: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
        <WeatherGlyph kind="rain" size={36}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>14°–22°</span>
            <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 500 }}>{T('降雨','降雨','Rain', lang)} 68%</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{T('春 · 山区 · 多雨多雾 · 早晚温差大','春 · 山區 · 多雨多霧','Spring · mountains · rainy & misty', lang)}</div>
        </div>
      </div>

      {/* AI notice */}
      <div style={{ margin: '0 16px 18px', padding: '14px 16px', background: 'var(--amberL)', borderLeft: '2px solid var(--amber)', borderRadius: '0 10px 10px 0' }}>
        <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5 }}>{T('行程专属提示','行程專屬提示','Trip note', lang)}</div>
        <div style={{ fontSize: 13, color: '#5C3D10', lineHeight: 1.55 }}>
          {T(trip.notes,'年降雨量全日本最高，硬殼衝鋒衣必須。','Rainiest region in Japan — a hardshell is non-negotiable. Download offline maps; Type-A plugs.', lang)}
        </div>
      </div>

      {/* filter bar */}
      <div className="no-scrollbar" style={{ padding: '0 16px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { k: 'all', l: T('全部','全部','All', lang), c: items.length },
          { k: 'todo', l: T('待打包','待打包','To pack', lang), c: items.filter(i=>i.status==='must'&&!packed.has(i.id)).length },
          { k: 'done', l: T('已打包','已打包','Packed', lang), c: totalPacked },
          { k: 'buy', l: T('待购买','待購買','To buy', lang), c: items.filter(i=>i.status==='buy').length },
          { k: 'opt', l: T('可选','可選','Optional', lang), c: items.filter(i=>i.status==='opt').length },
        ].map(f => (
          <Chip key={f.k} active={filter === f.k} onClick={() => setFilter(f.k)}>
            {f.l}<span style={{ marginLeft: 5, opacity: 0.5, fontSize: 10 }}>{f.c}</span>
          </Chip>
        ))}
      </div>

      {/* quick add */}
      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--cream)', border: '0.5px solid var(--paper3)', borderRadius: 10 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ink3)" strokeWidth="1.3"><path d="M8 3v10M3 8h10"/></svg>
          <span style={{ fontSize: 13, color: 'var(--ink3)', flex: 1 }}>{T('快速添加物品…','快速添加物品…','Quick add item…', lang)}</span>
        </div>
      </div>

      {/* AI suggestion */}
      <div style={{ margin: '0 16px 14px', padding: '12px 14px', background: 'var(--forest5)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: 'var(--forest)', color: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v2M8 12v2M2 8h2M12 8h2M4 4l1.5 1.5M10.5 10.5L12 12"/><circle cx="8" cy="8" r="2.5"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, color: 'var(--forest)', fontWeight: 500 }}>{T('AI 推荐补充 3 件','AI 推薦補充 3 件','AI suggests 3 more', lang)}</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 1 }}>{T('蚊香 · 离线地图 · 杖尖备件','','Mosquito coil · Maps · Pole tips', lang)}</div>
        </div>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--forest)" strokeWidth="1.4"><path d="M5 3l5 5-5 5"/></svg>
      </div>

      {/* groups */}
      <div style={{ padding: '0 16px' }}>
        {categories.map((cat) => {
          const catItems = grouped[cat.id] || [];
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="section-head">
                <span className="num">{cat.n}</span>
                <span className="name">{cat.name}</span>
                <span className="count">{catItems.filter(i=>packed.has(i.id)).length}/{catItems.length}</span>
              </div>
              {catItems.map(it => (
                <ItemRow key={it.id} item={it} packed={packed.has(it.id)} onToggle={() => toggle(it.id)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ItemRow = ({ item, packed, onToggle }) => {
  const statusTag = {
    must: { kind: 'must', label: '必带' },
    buy:  { kind: 'buy',  label: '待购买' },
    opt:  { kind: 'opt',  label: '可选' },
    packed:{ kind: 'pack', label: '已打包' },
  }[packed ? 'packed' : item.status];

  return (
    <div className={`item-row ${packed ? 'packed' : ''}`} onClick={onToggle}>
      <div className={`check ${packed ? 'on' : ''}`}>
        {packed && <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="var(--cream)" strokeWidth="1.8" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="item-name" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{item.name}</div>
        {item.brand && <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>{item.brand}</div>}
        {item.note && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 3, lineHeight: 1.5 }}>{item.note}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
        {statusTag && <Tag kind={statusTag.kind}>{statusTag.label}</Tag>}
        {item.container && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ink4)' }}>
            <ContainerIcon name={item.container} size={10}/>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { ScreenTripDetail, ItemRow });
