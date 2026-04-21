// Desktop variant — side-by-side trip list + detail
const ScreenDesktop = ({ lang = 'zh' }) => {
  const data = window.PACKLOG_DATA;
  const { trip, categories, items } = data;
  const [packedSet, setPackedSet] = React.useState(() => {
    const s = new Set();
    items.forEach(it => it.packed && s.add(it.id));
    return s;
  });
  const toggle = (id) => {
    const n = new Set(packedSet);
    n.has(id) ? n.delete(id) : n.add(id);
    setPackedSet(n);
  };
  const pct = Math.round((packedSet.size / items.length) * 100);
  const tickCount = items.length;

  const grouped = {};
  items.forEach(it => { (grouped[it.cat] = grouped[it.cat] || []).push(it); });

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'grid', gridTemplateColumns: '280px 1fr 340px' }}>
      {/* LEFT sidebar */}
      <aside style={{ borderRight: '0.5px solid var(--paper3)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={26} />
          <WordMark />
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>§ LIBRARY</div>
          {[
            { z: '行程目录', e: 'Ledger', n: 5, active: true },
            { z: '个人模板', e: 'Templates', n: 3 },
            { z: '社区广场', e: 'Explore', n: null },
            { z: '装备笔记', e: 'Gear notes', n: 12 },
          ].map((x,i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
              borderRadius: 8, background: x.active ? 'var(--forest5)' : 'transparent',
              color: x.active ? 'var(--forest)' : 'var(--ink2)', fontSize: 13, cursor: 'pointer',
            }}>
              <span className="folio" style={{ fontSize: 10, color: x.active ? 'var(--forest3)' : 'var(--ink4)' }}>0{i+1}</span>
              <span style={{ flex: 1 }}>{x.z}</span>
              {x.n !== null && <span className="mono">{String(x.n).padStart(2,'0')}</span>}
            </div>
          ))}
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>§ YOUR TRIPS</div>
          {data.trips.map((t, i) => {
            const active = i === 0;
            return (
              <div key={t.id} style={{ padding: '10px 8px', borderRadius: 6, cursor: 'pointer', background: active ? 'var(--cream)' : 'transparent', border: active ? '0.5px solid var(--paper3)' : '0.5px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="serif-h" style={{ fontSize: 14, color: 'var(--ink)' }}>{t.title}</span>
                  <span className="mono" style={{ fontSize: 8 }}>§{t.folio}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ flex: 1, display: 'flex', gap: 1, height: 3 }}>
                    {Array.from({length: 16}).map((_,k) => (
                      <div key={k} style={{ flex: 1, background: k < Math.round(t.progress*16) ? 'var(--forest2)' : 'var(--paper2)' }}/>
                    ))}
                  </div>
                  <span className="mono" style={{ fontSize: 8 }}>{Math.round(t.progress*100)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn" style={{ marginTop: 'auto' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>
          新建行程
        </button>
      </aside>

      {/* CENTER */}
      <main style={{ padding: '24px 36px 40px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="folio" style={{ fontSize: 13 }}>§ FOLIO 004</span>
              <span className="mono">PACKING · T—21</span>
              <span className="mono" style={{ color: 'var(--forest2)' }}>◆ IN PROGRESS</span>
            </div>
            <h1 className="serif-h" style={{ fontSize: 56, margin: '6px 0 2px', fontStyle: 'italic', lineHeight: 1 }}>屋久岛 · Yakushima</h1>
            <div style={{ fontSize: 14, color: 'var(--ink3)' }}>徒步 · 露营 · 越野跑 · 7日 · 朋友同行</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v9M4 7l4 4 4-4M3 14h10"/></svg>
              分享
            </button>
            <button className="btn ghost">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg>
              AI 补充
            </button>
          </div>
        </div>

        {/* hero band */}
        <div style={{ background: 'var(--forest)', color: 'var(--cream)', borderRadius: 16, padding: '22px 26px', position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
          <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.14 }}>
            {Array.from({length: 9}).map((_,i) => <path key={i} d={`M0 ${20+i*22} Q200 ${10+i*22} 400 ${20+i*22} T800 ${20+i*22}`} stroke="var(--forest3)" strokeWidth="0.5" fill="none"/>)}
          </svg>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 28, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--forest3)' }}>§ PACKING PROGRESS</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                <span className="serif-h" style={{ fontSize: 48, fontStyle: 'italic' }}>{pct}</span>
                <span style={{ fontSize: 14, opacity: 0.6 }}>%</span>
                <span className="mono" style={{ marginLeft: 12, color: 'rgba(255,255,255,.5)' }}>{packedSet.size} / {items.length} ITEMS</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <ProgressSpine total={tickCount} packed={packedSet.size} />
              </div>
            </div>
            {[
              { k: 'DATES', v: 'MAY 8—14' },
              { k: 'CLIMATE', v: '14°—22°' },
              { k: 'RAIN', v: '68%', warn: true },
            ].map((x,i) => (
              <div key={i} style={{ borderLeft: '0.5px solid rgba(255,255,255,.15)', paddingLeft: 18 }}>
                <div className="mono" style={{ color: 'rgba(255,255,255,.45)' }}>{x.k}</div>
                <div className="serif-h" style={{ fontSize: 22, fontStyle: 'italic', color: x.warn ? 'var(--forest4)' : 'var(--cream)', marginTop: 4 }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* notice */}
        <div style={{ padding: '14px 18px', background: 'var(--amberL)', borderLeft: '2px solid var(--amber)', borderRadius: '0 12px 12px 0', marginBottom: 20, fontSize: 13, color: '#5C3D10', fontFamily: 'var(--serif)', fontStyle: 'italic', lineHeight: 1.6 }}>
          "{trip.notes}"
        </div>

        {/* filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {['全部 40','待打包 12','已打包 18','待购买 04','可选 06','按容器'].map((t,i) => <Chip key={i} active={i===0}>{t}</Chip>)}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['列表','容器','分类'].map((v,i) => <Chip key={v} active={i===0}>{v}</Chip>)}
          </div>
        </div>

        {/* items — two columns */}
        <div style={{ columnCount: 2, columnGap: 36 }}>
          {categories.map(cat => {
            const catItems = grouped[cat.id] || [];
            if (!catItems.length) return null;
            return (
              <div key={cat.id} style={{ breakInside: 'avoid', marginBottom: 18 }}>
                <div className="section-head">
                  <span className="num">§ {cat.n}</span>
                  <span className="name">{cat.name}</span>
                  <span className="count">{catItems.filter(i => packedSet.has(i.id)).length} / {catItems.length}</span>
                </div>
                {catItems.map(it => (
                  <ItemRow key={it.id} item={it} packed={packedSet.has(it.id)} onToggle={() => toggle(it.id)} />
                ))}
              </div>
            );
          })}
        </div>
      </main>

      {/* RIGHT panel — containers, suggestions */}
      <aside style={{ borderLeft: '0.5px solid var(--paper3)', padding: '24px 22px', background: 'var(--paper2)', overflow: 'auto' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>§ CONTAINER FLOW</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { k: 'suitcase', z: '托运', n: items.filter(i => i.container === 'suitcase').length },
            { k: 'backpack', z: '背包', n: items.filter(i => i.container === 'backpack').length },
            { k: 'body', z: '随身', n: items.filter(i => i.container === 'body').length },
            { k: 'wearing', z: '穿戴', n: items.filter(i => i.container === 'wearing').length },
          ].map(c => (
            <div key={c.k} style={{ padding: 14, background: 'var(--cream)', border: '0.5px solid var(--paper3)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--forest2)', marginBottom: 10 }}>
                <ContainerIcon name={c.k} size={16} />
                <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink2)' }}>{c.z}</span>
              </div>
              <div className="serif-h" style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--ink)' }}>{String(c.n).padStart(2,'0')}</div>
              <div className="mono" style={{ fontSize: 8 }}>ITEMS</div>
            </div>
          ))}
        </div>

        <div className="eyebrow" style={{ marginBottom: 12 }}>§ CLIMATE · MAY · YAKUSHIMA</div>
        <div style={{ padding: 16, background: 'var(--cream)', border: '0.5px solid var(--paper3)', borderRadius: 12, marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div className="serif-h" style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--ink)' }}>14°—22°</div>
              <div className="mono">AVG TEMPERATURE</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="serif-h" style={{ fontSize: 22, fontStyle: 'italic', color: 'var(--amber)' }}>68%</div>
              <div className="mono" style={{ color: 'var(--amber)' }}>PRECIPITATION</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2, height: 22, alignItems: 'flex-end' }}>
            {[18,14,22,28,34,42,38,30,22,16,10,8].map((h,i) => (
              <div key={i} style={{ flex: 1, height: `${h*0.5}px`, background: i === 4 ? 'var(--amber)' : 'var(--forest4)' }} />
            ))}
          </div>
          <div className="mono" style={{ fontSize: 8, marginTop: 6 }}>J F M A <span style={{ color: 'var(--amber)' }}>M</span> J J A S O N D</div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 12 }}>§ REFERENCE · COMMUNITY</div>
        {[
          { t: '屋久岛7日 · 徒步装备', a: 'Lin Mei', l: 342 },
          { t: '雨季出行生存指南', a: 'Ando T.', l: 128 },
        ].map((r,i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: i===0 ? '0.5px solid var(--paper3)' : 'none', cursor: 'pointer' }}>
            <div className="serif-h" style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 2 }}>{r.t}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono">@{r.a}</span>
              <span className="mono">♡ {r.l}</span>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
};

Object.assign(window, { ScreenDesktop });
