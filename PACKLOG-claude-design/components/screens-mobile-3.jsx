// Container View + AI Modal + Share Card + Review + Explore + Empty states
// v3 — magazine-grade refactor. Remove label spam, let imagery & type lead.

const { useState: useS3 } = React;

// ═════════════════════════════════════════════════════════════════
// CONTAINER VIEW — "Where does each thing live"
// Redesigned: one beautiful photographic-style container silhouette per card,
// clean item list underneath. No more stacked ugly SVG icons with tags floating.
// ═════════════════════════════════════════════════════════════════
const ScreenContainers = ({ lang = 'zh' }) => {
  const data = window.PACKLOG_DATA;
  const byContainer = data.items.reduce((a, it) => {
    const k = it.container || 'unassigned';
    (a[k] = a[k] || []).push(it);
    return a;
  }, {});

  const containers = [
    { k: 'suitcase', z: '托运行李箱', tw: '託運行李箱', e: 'Checked Luggage',    meta: '65 L · Rimowa Topas' },
    { k: 'backpack', z: '登山背包',    tw: '登山背包',    e: 'Mountain Pack',      meta: '44 L · Arc\u2019teryx Bora' },
    { k: 'body',     z: '随身携带',    tw: '隨身攜帶',    e: 'On Person',          meta: 'Pockets · sling · passport wallet' },
    { k: 'wearing',  z: '身上穿戴',    tw: '身上穿戴',    e: 'Worn',               meta: 'Traveling · Day 0' },
  ];

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 40 }}>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--ink2)', padding: 0, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <WordMark />
        <div style={{ width: 16 }} />
      </div>

      {/* Editorial header — big, quiet */}
      <div style={{ padding: '18px 24px 32px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          {T('按容器视图','按容器視圖','By container', lang)}
        </div>
        <h1 style={{
          fontFamily: 'var(--cjk-display)', fontSize: 34, fontWeight: 600,
          color: 'var(--ink)', margin: 0, lineHeight: 1.15, letterSpacing: '0.01em',
        }}>
          {T('每一件，归其所处','每一件，歸其所處','A place for each thing', lang)}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 10, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
          {T('34 件行李 · 分装至 4 处','34 件行李 · 分裝至 4 處','34 items across 4 containers', lang)}
        </div>
      </div>

      <hr className="mag-rule" style={{ margin: '0 24px' }}/>

      {/* Container sections — vertical, generous */}
      <div style={{ padding: '0 24px' }}>
        {containers.map((c, idx) => {
          const items = byContainer[c.k] || [];
          const packed = items.filter(i => i.packed).length;
          return (
            <ContainerSection
              key={c.k}
              idx={idx + 1}
              info={c}
              items={items}
              packed={packed}
              lang={lang}
              last={idx === containers.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
};

// Photo-like illustration of each container — styled as a product shot
const ContainerIllustration = ({ kind }) => {
  const common = { fill: 'none', stroke: 'var(--ink2)', strokeWidth: 0.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'suitcase':
      return (
        <svg width="100%" height="100%" viewBox="0 0 200 220" preserveAspectRatio="xMidYMid meet">
          {/* horizon */}
          <line x1="0" y1="180" x2="200" y2="180" stroke="var(--paper3)" strokeWidth="0.5"/>
          {/* shadow */}
          <ellipse cx="100" cy="182" rx="68" ry="3" fill="var(--paper2)"/>
          {/* handle */}
          <path d="M82 30 Q82 20 100 20 Q118 20 118 30 L118 44" {...common}/>
          {/* body */}
          <rect x="42" y="44" width="116" height="136" rx="6" fill="var(--cream)" stroke="var(--ink2)" strokeWidth="0.8"/>
          {/* spine */}
          <line x1="100" y1="50" x2="100" y2="174" stroke="var(--paper3)" strokeWidth="0.5" strokeDasharray="1 3"/>
          {/* latches */}
          <rect x="64" y="66" width="18" height="8" rx="1" fill="none" stroke="var(--ink2)" strokeWidth="0.8"/>
          <rect x="118" y="66" width="18" height="8" rx="1" fill="none" stroke="var(--ink2)" strokeWidth="0.8"/>
          {/* brand patch */}
          <rect x="86" y="110" width="28" height="8" fill="none" stroke="var(--ink3)" strokeWidth="0.5"/>
          {/* wheels */}
          <circle cx="58" cy="180" r="4" fill="var(--ink)" />
          <circle cx="142" cy="180" r="4" fill="var(--ink)" />
        </svg>
      );
    case 'backpack':
      return (
        <svg width="100%" height="100%" viewBox="0 0 200 220" preserveAspectRatio="xMidYMid meet">
          <line x1="0" y1="200" x2="200" y2="200" stroke="var(--paper3)" strokeWidth="0.5"/>
          <ellipse cx="100" cy="202" rx="58" ry="3" fill="var(--paper2)"/>
          {/* top loop */}
          <path d="M90 22 Q100 12 110 22" {...common}/>
          {/* shoulder straps behind */}
          <path d="M62 38 Q52 60 54 90 Q56 130 66 170" stroke="var(--paper4)" strokeWidth="0.8" fill="none"/>
          <path d="M138 38 Q148 60 146 90 Q144 130 134 170" stroke="var(--paper4)" strokeWidth="0.8" fill="none"/>
          {/* main body */}
          <path d="M54 42 Q54 30 70 28 L130 28 Q146 30 146 42 L150 180 Q150 200 130 200 L70 200 Q50 200 50 180 Z"
                fill="var(--cream)" stroke="var(--ink2)" strokeWidth="0.8"/>
          {/* front pocket */}
          <path d="M74 110 L126 110 L128 170 L72 170 Z" fill="var(--paper)" stroke="var(--ink2)" strokeWidth="0.6"/>
          {/* cinch straps */}
          <line x1="72" y1="78" x2="128" y2="78" stroke="var(--ink3)" strokeWidth="0.5"/>
          <line x1="72" y1="88" x2="128" y2="88" stroke="var(--ink3)" strokeWidth="0.5"/>
          {/* buckles */}
          <rect x="94" y="75" width="12" height="6" fill="var(--paper3)" stroke="var(--ink2)" strokeWidth="0.4"/>
          <rect x="94" y="85" width="12" height="6" fill="var(--paper3)" stroke="var(--ink2)" strokeWidth="0.4"/>
          {/* ice axe loop */}
          <circle cx="100" cy="140" r="2" fill="none" stroke="var(--ink3)" strokeWidth="0.5"/>
        </svg>
      );
    case 'body':
      return (
        <svg width="100%" height="100%" viewBox="0 0 200 220" preserveAspectRatio="xMidYMid meet">
          <line x1="0" y1="200" x2="200" y2="200" stroke="var(--paper3)" strokeWidth="0.5"/>
          {/* sling bag laid flat, product shot */}
          <ellipse cx="100" cy="202" rx="70" ry="3" fill="var(--paper2)"/>
          {/* passport wallet */}
          <rect x="36" y="70" width="70" height="90" rx="3" fill="var(--cream)" stroke="var(--ink2)" strokeWidth="0.8"/>
          <line x1="36" y1="115" x2="106" y2="115" stroke="var(--paper3)" strokeWidth="0.5"/>
          <text x="71" y="108" fontFamily="var(--serif)" fontStyle="italic" fontSize="10" fill="var(--ink3)" textAnchor="middle">passport</text>
          {/* phone, watch */}
          <rect x="120" y="50" width="38" height="74" rx="5" fill="var(--cream)" stroke="var(--ink2)" strokeWidth="0.8"/>
          <circle cx="139" cy="63" r="1" fill="var(--ink3)"/>
          {/* keys ring */}
          <circle cx="135" cy="160" r="14" fill="none" stroke="var(--ink2)" strokeWidth="0.8"/>
          <path d="M149 160 L168 160 M164 155 L168 160 L164 165" stroke="var(--ink2)" strokeWidth="0.8" fill="none"/>
        </svg>
      );
    case 'wearing':
      return (
        <svg width="100%" height="100%" viewBox="0 0 200 220" preserveAspectRatio="xMidYMid meet">
          {/* flat-lay jacket */}
          <line x1="0" y1="200" x2="200" y2="200" stroke="var(--paper3)" strokeWidth="0.5"/>
          <ellipse cx="100" cy="202" rx="74" ry="3" fill="var(--paper2)"/>
          {/* jacket */}
          <path d="M60 40 L100 30 L140 40 L155 55 L155 80 L140 75 L140 200 L60 200 L60 75 L45 80 L45 55 Z"
                fill="var(--cream)" stroke="var(--ink2)" strokeWidth="0.8" strokeLinejoin="round"/>
          {/* hood */}
          <path d="M85 30 Q100 22 115 30" {...common}/>
          {/* zipper */}
          <line x1="100" y1="40" x2="100" y2="200" stroke="var(--ink2)" strokeWidth="0.6" strokeDasharray="2 2"/>
          {/* pocket */}
          <path d="M72 130 L88 150" stroke="var(--ink3)" strokeWidth="0.5"/>
          <path d="M112 150 L128 130" stroke="var(--ink3)" strokeWidth="0.5"/>
          {/* shoes below */}
          <ellipse cx="78" cy="200" rx="16" ry="4" fill="var(--ink)" opacity="0.15"/>
          <ellipse cx="122" cy="200" rx="16" ry="4" fill="var(--ink)" opacity="0.15"/>
        </svg>
      );
    default: return null;
  }
};

const ContainerSection = ({ idx, info, items, packed, lang, last }) => {
  const name = lang === 'en' ? info.e : lang === 'tw' ? info.tw : info.z;
  const pct = items.length ? Math.round(packed / items.length * 100) : 0;

  return (
    <section style={{ padding: '36px 0', borderBottom: last ? 'none' : '0.5px solid var(--paper3)' }}>
      {/* Roman chapter number */}
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink4)', letterSpacing: '0.04em' }}>
        {['I.','II.','III.','IV.'][idx - 1]}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 14, alignItems: 'flex-start' }}>
        {/* Product illustration — big, proud */}
        <div style={{
          width: 110, height: 130, flexShrink: 0,
          background: 'var(--paper2)',
          borderRadius: 4,
        }}>
          <ContainerIllustration kind={info.k} />
        </div>

        {/* Info stack */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
          <h2 style={{
            fontFamily: 'var(--cjk-display)', fontSize: 22, fontWeight: 600,
            color: 'var(--ink)', margin: 0, lineHeight: 1.2,
          }}>{name}</h2>
          <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 4, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            {info.meta}
          </div>

          {/* simple stat line */}
          <div style={{ marginTop: 16, display: 'flex', gap: 18, alignItems: 'baseline' }}>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, color: 'var(--forest)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {items.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                {T('件','件','items', lang)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, color: packed === items.length ? 'var(--forest2)' : 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {pct}<span style={{ fontSize: 14, color: 'var(--ink3)' }}>%</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>
                {T('已打包','已打包','packed', lang)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item list — clean, typographic, no chaotic tags */}
      <div style={{ marginTop: 22 }}>
        {items.slice(0, 8).map((it, i) => (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0',
            borderBottom: i === Math.min(items.length, 8) - 1 ? 'none' : '0.5px solid var(--paper2)',
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: 7,
              border: '1px solid ' + (it.packed ? 'var(--forest2)' : 'var(--paper4)'),
              background: it.packed ? 'var(--forest2)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {it.packed && <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>}
            </div>
            <span style={{
              flex: 1, fontSize: 13.5, color: it.packed ? 'var(--ink3)' : 'var(--ink)',
              textDecoration: it.packed ? 'line-through' : 'none',
            }}>{it.name}</span>
            {it.brand && (
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--ink4)' }}>
                {it.brand.split(' ').slice(0, 2).join(' ')}
              </span>
            )}
          </div>
        ))}
        {items.length > 8 && (
          <div style={{ paddingTop: 12, fontSize: 12, color: 'var(--ink3)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            + {items.length - 8} more …
          </div>
        )}
      </div>
    </section>
  );
};

// ═════════════════════════════════════════════════════════════════
// AI MODAL
// ═════════════════════════════════════════════════════════════════
const ScreenAIModal = ({ lang = 'zh' }) => {
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* scrim top */}
      <div style={{ height: 70, background: 'var(--forest)', position: 'relative', overflow: 'hidden' }}>
        <DestArt name="yakushima" tone="dark" style={{ height: 70, width: '100%', borderRadius: 0 }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(36,61,31,.3), rgba(36,61,31,.8))' }}/>
      </div>

      <div style={{ flex: 1, marginTop: -28, background: 'var(--paper)', borderRadius: '18px 18px 0 0', padding: '24px 24px 0' }}>
        {/* drag handle */}
        <div style={{ width: 36, height: 3, background: 'var(--paper3)', borderRadius: 2, margin: '0 auto 22px' }}/>

        <div style={{ fontSize: 11, color: 'var(--forest3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
          {T('AI 起草','AI 起草','Drafted by AI', lang)}
        </div>
        <h1 style={{ fontFamily: 'var(--cjk-display)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}>
          {T('为屋久岛准备的清单','為屋久島準備的清單','A list, prepared for Yakushima', lang)}
        </h1>
        <div style={{ fontSize: 12.5, color: 'var(--ink3)', marginTop: 8, fontFamily: 'var(--serif)', fontStyle: 'italic', lineHeight: 1.6 }}>
          {T('基于气候、地形、出行方式与你过往 3 次徒步的偏好。','基於氣候、地形、出行方式與你過往 3 次徒步的偏好。','Based on climate, terrain, travel style, and your last 3 trips.', lang)}
        </div>

        <hr className="mag-rule" style={{ margin: '22px 0' }}/>

        {/* summary numbers */}
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { n: 34, l: T('件','件','items', lang) },
            { n: 8,  l: T('类','類','sections', lang) },
            { n: 5,  l: T('待购','待購','to buy', lang) },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, fontStyle: 'italic', color: 'var(--forest)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <hr className="mag-rule" style={{ margin: '22px 0' }}/>

        {/* sections — editorial table of contents */}
        <div>
          {[
            { n: '01', name: T('证件 & 出行必备','證件 & 出行必備','Documents', lang), c: 6, hi: T('护照 · 国际驾照','護照 · 國際駕照','Passport · license', lang) },
            { n: '02', name: T('鞋履','鞋履','Footwear', lang), c: 3, hi: 'Salomon X Ultra 4 GTX' },
            { n: '03', name: T('衣物','衣物','Clothing', lang), c: 9, hi: T('硬壳冲锋衣 · 羽绒','硬殼衝鋒衣 · 羽絨','Hardshell · down', lang) },
            { n: '04', name: T('背包 & 收纳','背包 & 收納','Bags', lang), c: 4, hi: '' },
            { n: '05', name: T('户外装备','戶外裝備','Gear', lang), c: 6, hi: 'Copper Spur UL2 · Spark III' },
            { n: '06', name: T('日用 & 护理','日用 & 護理','Toiletries', lang), c: 5, hi: '' },
            { n: '07', name: T('数码 & 通讯','數碼 & 通訊','Electronics', lang), c: 4, hi: '' },
            { n: '08', name: T('药品 & 急救','藥品 & 急救','Medical', lang), c: 3, hi: '' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: 14,
              padding: '12px 0', borderBottom: '0.5px solid var(--paper2)',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink4)', minWidth: 22 }}>
                {s.n}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{s.name}</div>
                {s.hi && (
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 11.5, color: 'var(--ink3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.hi}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink2)', letterSpacing: '-0.02em' }}>
                {s.c}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 24px 32px', background: 'var(--paper)', display: 'flex', gap: 10, position: 'sticky', bottom: 0 }}>
        <button className="btn ghost" style={{ flex: 0.6 }}>{T('重新生成','重新生成','Redraft', lang)}</button>
        <button className="btn" style={{ flex: 1 }}>{T('采纳 · 34 件','採納 · 34 件','Accept · 34 items', lang)}</button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// SHARE CARD
// ═════════════════════════════════════════════════════════════════
const ScreenShare = ({ lang = 'zh', ratio = '3:4' }) => {
  const data = window.PACKLOG_DATA;
  const { categories } = data;
  const aspect = { '3:4': 3/4, '1:1': 1, '9:16': 9/16 }[ratio];

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', padding: '14px 16px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0 20px' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--ink2)', padding: 0, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {T('分享','分享','Share', lang)}
        </span>
        <div style={{ width: 16 }} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18, justifyContent: 'center' }}>
        {['3:4','1:1','9:16'].map(r => <Chip key={r} active={r === ratio}>{r}</Chip>)}
      </div>

      {/* the card — photographic */}
      <div style={{
        borderRadius: 10, color: 'var(--cream)',
        aspectRatio: aspect, position: 'relative', overflow: 'hidden',
      }}>
        {/* hero imagery as full-bleed background */}
        <DestArt name="yakushima" tone="dark" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0 }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,35,18,.35) 0%, rgba(20,35,18,.55) 50%, rgba(20,35,18,.9) 100%)' }}/>

        {/* content */}
        <div style={{ position: 'relative', height: '100%', padding: '26px 24px', display: 'flex', flexDirection: 'column', color: 'var(--cream)' }}>
          {/* top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--forest4)', letterSpacing: '0.24em', textTransform: 'uppercase' }}>Field Journal № 04</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 4, letterSpacing: '0.08em' }}>May 8 — 14 · 2026</div>
            </div>
            <Logo size={24} color="var(--cream)" mono />
          </div>

          {/* big title */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ fontFamily: 'var(--cjk-display)', fontSize: 60, fontWeight: 600, color: 'var(--cream)', lineHeight: 0.95, letterSpacing: '0.02em' }}>
              屋久岛
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic', color: 'rgba(255,255,255,.75)', marginTop: 8 }}>
              Yakushima
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 16, fontFamily: 'var(--serif)', fontStyle: 'italic', lineHeight: 1.5 }}>
              徒步 · 露营 · 7 日 · 朋友同行
            </div>
          </div>

          {/* stats row */}
          <div style={{ display: 'flex', gap: 0, marginTop: 22, borderTop: '0.5px solid rgba(255,255,255,.2)', paddingTop: 16 }}>
            {[{ n: 34, l: 'ITEMS' },{ n: 18, l: 'PACKED' },{ n: 4, l: 'TO BUY' },{ n: 6, l: 'OPT' }].map((s,i) => (
              <div key={i} style={{ flex: 1, borderLeft: i ? '0.5px solid rgba(255,255,255,.15)' : 'none', paddingLeft: i ? 10 : 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, fontStyle: 'italic', color: 'var(--cream)', letterSpacing: '-0.02em' }}>{s.n}</div>
                <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,.45)', marginTop: 3, letterSpacing: '0.12em' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 }}>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,.4)' }}>PACKLOG · 行前志</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2, letterSpacing: '0.08em' }}>packlog.app/y/004</div>
            </div>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,.1)', borderRadius: 3, padding: 4 }}>
              <svg width="100%" height="100%" viewBox="0 0 12 12">
                {[[0,0],[2,0],[4,0],[0,2],[4,2],[0,4],[2,4],[4,4],[8,0],[10,0],[8,2],[10,4],[0,8],[4,8],[8,8],[10,8],[0,10],[2,10],[4,10],[10,10]].map(([x,y], i) => (
                  <rect key={i} x={x} y={y} width="2" height="2" fill="rgba(255,255,255,.6)"/>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn ghost" style={{ flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 10l4-4M10 10h4v-4M2 6h4V2"/></svg>
          {T('复制链接','複製連結','Copy link', lang)}
        </button>
        <button className="btn" style={{ flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v9M4 7l4 4 4-4M3 14h10"/></svg>
          {T('保存图片','保存圖片','Save image', lang)}
        </button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// REVIEW — redesigned with column table, not cramped right tags
// ═════════════════════════════════════════════════════════════════
const ScreenReview = ({ lang = 'zh' }) => {
  const items = [
    { name: '硬壳冲锋衣', brand: 'Arc\u2019teryx Beta AR', result: 'used', note: '屋久岛下了3天雨，救命' },
    { name: '羽绒服', brand: 'Montbell Plasma 1000', result: 'used', note: '' },
    { name: '国际驾照', brand: '', result: 'unused', note: '没租车' },
    { name: '越野跑鞋', brand: 'Hoka Speedgoat 5', result: 'unused', note: '路太湿太烂' },
    { name: '蚊香', brand: '', result: 'missed', note: '营地虫子多' },
    { name: '登山杖备用尖头', brand: '', result: 'missed', note: '' },
    { name: '相机', brand: 'Sony α7 IV', result: 'used', note: '重但值得' },
  ];

  const countBy = (r) => items.filter(i => i.result === r).length;

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 40 }}>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--ink2)', padding: 0, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <WordMark />
        <div style={{ width: 16 }} />
      </div>

      {/* Editorial header — restrained */}
      <div style={{ padding: '18px 24px 28px' }}>
        <div style={{ fontSize: 11, color: 'var(--forest3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          {T('归来复盘','歸來複盤','Post-trip review', lang)}
        </div>
        <h1 style={{ fontFamily: 'var(--cjk-display)', fontSize: 36, fontWeight: 600, color: 'var(--ink)', margin: 0, lineHeight: 1.1 }}>
          {T('屋久岛 · 归来','屋久島 · 歸來','Yakushima, in review', lang)}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 10, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
          May 8 — May 14, 2026 · {T('7 日 · 34 件','7 日 · 34 件','7 days · 34 items', lang)}
        </div>
      </div>

      <hr className="mag-rule" style={{ margin: '0 24px' }}/>

      {/* The verdict — huge type, three big numbers, no boxes */}
      <div style={{ padding: '32px 24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { n: countBy('used'),   l: T('用上了','用上了','Used', lang),          c: 'var(--forest2)' },
            { n: countBy('unused'), l: T('带了没用','帶了沒用','Unused', lang),    c: 'var(--ink3)' },
            { n: countBy('missed'), l: T('没带后悔','沒帶後悔','Missed', lang),    c: 'var(--amber)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 4px' }}>
              <div style={{
                fontFamily: 'var(--serif)', fontSize: 54, fontWeight: 400, fontStyle: 'italic',
                color: s.c, lineHeight: 1, letterSpacing: '-0.03em',
              }}>{s.n}</div>
              <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="mag-rule" style={{ margin: '0 24px' }}/>

      {/* Pull quote — AI insight as a magazine-style quote */}
      <div style={{ padding: '32px 24px' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 40, color: 'var(--forest3)', lineHeight: 0.5, marginBottom: 10 }}>“</div>
        <blockquote style={{
          margin: 0, padding: 0,
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, fontWeight: 400,
          color: 'var(--ink)', lineHeight: 1.5, letterSpacing: '0.01em',
        }}>
          {T(
            '下次屋久岛，减掉越野跑鞋与国际驾照，加入蚊香与杖尖备件。硬壳、羽绒、徒步鞋会自动沉淀到你的「雨季山区」模板。',
            '下次屋久島，減掉越野跑鞋與國際駕照，加入蚊香與杖尖備件。',
            'Next time, drop the trail runners and the license. Add a mosquito coil and spare pole tips.',
            lang
          )}
        </blockquote>
        <div style={{ marginTop: 16, fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          — {T('PACKLOG 的观察','PACKLOG 的觀察','Observed by PACKLOG', lang)}
        </div>
      </div>

      <hr className="mag-rule" style={{ margin: '0 24px' }}/>

      {/* Item table — magazine-style, cleaner layout */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
          {T('逐件评估','逐件評估','Item by item', lang)}
        </div>

        {items.map((it, i) => {
          const cfg = {
            used:   { dot: 'var(--forest2)', label: T('用上了','用上了','Used', lang) },
            unused: { dot: 'var(--ink3)',    label: T('没用上','沒用上','Unused', lang) },
            missed: { dot: 'var(--amber)',   label: T('后悔','後悔','Missed', lang) },
          }[it.result];
          return (
            <div key={i} style={{
              padding: '16px 0',
              borderBottom: i === items.length - 1 ? 'none' : '0.5px solid var(--paper2)',
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              {/* colored dot */}
              <div style={{ width: 8, height: 8, borderRadius: 4, background: cfg.dot, marginTop: 7, flexShrink: 0 }}/>

              {/* main info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{it.name}</div>
                  <div style={{ fontSize: 11, color: cfg.dot, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
                    {cfg.label}
                  </div>
                </div>
                {it.brand && (
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink3)', marginTop: 3 }}>
                    {it.brand}
                  </div>
                )}
                {it.note && (
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12.5, color: 'var(--ink2)', marginTop: 6, paddingLeft: 10, borderLeft: '2px solid var(--paper3)' }}>
                    "{it.note}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '32px 24px 20px' }}>
        <button className="btn" style={{ width: '100%' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 2h10v12L8 11l-5 3V2z"/></svg>
          {T('保存为个人模板','保存為個人模板','Save as template', lang)}
        </button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// EXPLORE — magazine grid
// ═════════════════════════════════════════════════════════════════
const ScreenExplore = ({ lang = 'zh' }) => {
  const trips = [
    { title: '屋久岛',      en: 'Yakushima',    sub: '徒步 · 露营',   days: 7,  author: 'Lin Mei',     likes: 342, dest: 'yakushima', tag: 'JAPAN' },
    { title: 'ABC 环线',    en: 'ABC Trek',     sub: '高海拔徒步',    days: 14, author: 'K. Tamang',   likes: 891, dest: 'abc',       tag: 'NEPAL' },
    { title: '冰岛环岛',    en: 'Iceland Ring', sub: '自驾 · 摄影',   days: 10, author: 'S. Reykdal',  likes: 214, dest: 'iceland',   tag: 'ICELAND' },
    { title: '阿尔卑斯 GR5', en: 'GR5 Traverse', sub: '长距离徒步',    days: 21, author: 'P. Dufour',   likes: 456, dest: 'yakushima', tag: 'FRANCE' },
  ];
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 40 }}>
      <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <WordMark />
        <button style={{ background: 'transparent', border: 'none', color: 'var(--ink2)', padding: 4, cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="5"/><path d="M14 14l-3-3"/></svg>
        </button>
      </div>

      <div style={{ padding: '18px 24px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
          {T('社区','社區','Community', lang)}
        </div>
        <h1 style={{ fontFamily: 'var(--cjk-display)', fontSize: 32, fontWeight: 600, color: 'var(--ink)', margin: 0, lineHeight: 1.1 }}>
          {T('别人怎么打包','別人怎麼打包','How others pack', lang)}
        </h1>
        <div style={{ fontSize: 13, color: 'var(--ink3)', marginTop: 8, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
          {T('每日更新 · 1,280 份清单','每日更新 · 1,280 份清單','Updated daily · 1,280 lists', lang)}
        </div>
      </div>

      <div className="no-scrollbar" style={{ padding: '0 16px 20px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {['全部','徒步','露营','越野跑','潜水','城市','滑雪','自驾'].map((s,i) => (
          <Chip key={i} active={i === 1}>{s}</Chip>
        ))}
      </div>

      <hr className="mag-rule" style={{ margin: '0 24px 20px' }}/>

      {/* Featured — first card big */}
      <div style={{ padding: '0 24px 28px' }}>
        <div style={{ fontSize: 10, color: 'var(--amber)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
          {T('本周精选','本週精選','Featured this week', lang)}
        </div>
        <div style={{ borderRadius: 4, overflow: 'hidden' }}>
          <DestArt name={trips[0].dest} tone="dark" style={{ width: '100%', height: 220, borderRadius: 0 }}/>
        </div>
        <div style={{ paddingTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              @{trips[0].author} · {trips[0].tag}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink3)' }}>♡ {trips[0].likes}</div>
          </div>
          <h2 style={{ fontFamily: 'var(--cjk-display)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', margin: '4px 0', lineHeight: 1.15 }}>
            {trips[0].title}
          </h2>
          <div style={{ fontSize: 13, color: 'var(--ink3)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            {trips[0].sub} · {trips[0].days} 日 · {trips[0].en}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
              {T('预览清单','預覽清單','Preview', lang)}
            </button>
            <button className="btn" style={{ padding: '8px 14px', fontSize: 12 }}>
              {T('复制到我的行程','複製到我的行程','Copy to mine', lang)}
            </button>
          </div>
        </div>
      </div>

      <hr className="mag-rule" style={{ margin: '0 24px 24px' }}/>

      {/* The rest — editorial list */}
      <div style={{ padding: '0 24px' }}>
        {trips.slice(1).map((t, i) => (
          <div key={i} style={{
            display: 'flex', gap: 16, alignItems: 'flex-start',
            padding: '18px 0',
            borderBottom: i === trips.length - 2 ? 'none' : '0.5px solid var(--paper2)',
            cursor: 'pointer',
          }}>
            <DestArt name={t.dest} tone="dark" style={{ width: 84, height: 108, flexShrink: 0, borderRadius: 3 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--ink3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {t.tag}
              </div>
              <h3 style={{ fontFamily: 'var(--cjk-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', margin: '6px 0 2px', lineHeight: 1.2 }}>
                {t.title}
              </h3>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink3)' }}>{t.en}</div>
              <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 6 }}>
                {t.sub} · {t.days} 日
              </div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)' }}>@{t.author}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)' }}>♡ {t.likes}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// EMPTY / LOADING
// ═════════════════════════════════════════════════════════════════
const ScreenEmpty = ({ lang = 'zh' }) => (
  <div style={{ background: 'var(--paper)', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
    <div style={{ marginBottom: 32, opacity: 0.35 }}>
      <Logo size={72} color="var(--forest)" />
    </div>
    <div style={{ fontSize: 11, color: 'var(--forest3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
      {T('空白一页','空白一頁','A blank page', lang)}
    </div>
    <h2 style={{
      fontFamily: 'var(--cjk-display)', fontSize: 28, fontWeight: 600,
      color: 'var(--ink)', margin: '0 0 14px', lineHeight: 1.2,
    }}>
      {T('下一次，从这里开始','下一次，從這裡開始','Begin the next journey', lang)}
    </h2>
    <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink3)', lineHeight: 1.6, maxWidth: 280, marginBottom: 32 }}>
      {T('从准备到归来 — 每一件装备都是一次记录。','從準備到歸來 — 每一件裝備都是一次記錄。','From preparation to return — each item, a note.', lang)}
    </div>
    <button className="btn">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>
      {T('新建第一次行程','新建第一次行程','New trip', lang)}
    </button>
  </div>
);

const ScreenLoading = ({ lang = 'zh' }) => (
  <div style={{ background: 'var(--forest)', minHeight: '100%', color: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
    <DestArt name="yakushima" tone="dark" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 0, opacity: 0.25 }}/>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,35,18,.6), rgba(20,35,18,.95))' }}/>

    <div style={{ position: 'relative', textAlign: 'center' }}>
      <Logo size={44} color="var(--cream)" mono />
      <div style={{ fontSize: 11, color: 'var(--forest4)', letterSpacing: '0.24em', textTransform: 'uppercase', marginTop: 28 }}>
        {T('AI 正在起草','AI 正在起草','Drafting', lang)}
      </div>
      <h2 style={{
        fontFamily: 'var(--cjk-display)', fontSize: 28, fontWeight: 600,
        margin: '16px 0 12px', color: 'var(--cream)', lineHeight: 1.2,
      }}>
        {T('为屋久岛的七日，准备一份清单','為屋久島的七日，準備一份清單','Preparing a list for seven days on Yakushima', lang)}
      </h2>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 8 }}>
        {T('气候 · 地形 · 过往偏好','氣候 · 地形 · 過往偏好','Climate · Terrain · Past preferences', lang)}
      </div>
      <div style={{ marginTop: 34, width: 220, height: 1, background: 'rgba(255,255,255,.15)', position: 'relative', overflow: 'hidden', margin: '34px auto 0' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 70, background: 'var(--forest4)', animation: 'loadbar 1.6s ease-in-out infinite' }} />
      </div>
    </div>

    <style>{`@keyframes loadbar { 0% {left:-70px} 100% {left:220px} }`}</style>
  </div>
);

Object.assign(window, { ScreenContainers, ScreenAIModal, ScreenShare, ScreenReview, ScreenExplore, ScreenEmpty, ScreenLoading });
