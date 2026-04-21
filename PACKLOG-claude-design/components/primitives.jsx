// Shared UI primitives for PACKLOG
// All components write to window for cross-file access.

const Logo = ({ size = 28, color, mono }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" style={{ color: color || 'currentColor', flexShrink: 0 }}>
    <circle cx="22" cy="22" r="19" stroke={mono ? 'currentColor' : 'var(--forest3)'} strokeWidth="1" opacity={mono ? 0.35 : 1}/>
    <path d="M12 30 L22 12 L32 30" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    <path d="M16 30 L28 30" stroke={mono ? 'currentColor' : 'var(--forest3)'} strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M17 23 L22 16 L27 23" stroke={mono ? 'currentColor' : 'var(--forest3)'} strokeWidth="0.9" fill="none"/>
    <circle cx="22" cy="12" r="2" fill={mono ? 'currentColor' : 'var(--forest3)'}/>
  </svg>
);

const WordMark = ({ color = 'var(--ink)', serif = 'var(--serif)' }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, color }}>
    <span style={{ fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.22em' }}>PACKLOG</span>
    <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: 'var(--ink3)' }}>行前志</span>
  </div>
);

// Scene icon — minimal line glyphs
const SceneIcon = ({ name, size = 14, stroke = 1.3 }) => {
  const s = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'hiking':    return <svg {...s}><path d="M3 13l3-6 2 2 3-5 2 9"/><circle cx="10" cy="3" r="1.2"/></svg>;
    case 'camping':   return <svg {...s}><path d="M8 2L2 14h12L8 2z M8 6v8"/></svg>;
    case 'trail_run': return <svg {...s}><circle cx="11" cy="3.5" r="1.3"/><path d="M3 14l3-4 2 1 1-3 3 2"/></svg>;
    case 'dive':      return <svg {...s}><path d="M2 10c2-1 3-1 5 0s3 1 5 0 2-1 3 0M2 13c2-1 3-1 5 0s3 1 5 0 2-1 3 0"/><circle cx="11" cy="4" r="1.3"/></svg>;
    case 'music':     return <svg {...s}><path d="M5 13V3l7-1v10"/><circle cx="4" cy="13" r="1.3"/><circle cx="11" cy="12" r="1.3"/></svg>;
    case 'city':      return <svg {...s}><path d="M2 14V7l3-2 3 2v7M8 14V4l3-2 3 2v10"/></svg>;
    case 'climb':     return <svg {...s}><path d="M3 14l4-8 3 3 4-7"/><circle cx="5" cy="3" r="1"/></svg>;
    case 'cycle':     return <svg {...s}><circle cx="4" cy="11" r="2.5"/><circle cx="12" cy="11" r="2.5"/><path d="M4 11l3-5h3l2 5M7 6h2"/></svg>;
    case 'ski':       return <svg {...s}><path d="M2 13l12-9M3 11l11 2"/></svg>;
    case 'swim':      return <svg {...s}><path d="M2 8c2-1 3-1 5 0s3 1 5 0 2-1 3 0M2 11c2-1 3-1 5 0s3 1 5 0 2-1 3 0"/><circle cx="10" cy="4" r="1.3"/></svg>;
    case 'business':  return <svg {...s}><rect x="3" y="5" width="10" height="8"/><path d="M6 5V3h4v2"/></svg>;
    case 'drive':     return <svg {...s}><path d="M2 10h12M3 10l1-4h8l1 4v3H3v-3z"/><circle cx="5" cy="13" r="0.8"/><circle cx="11" cy="13" r="0.8"/></svg>;
    default: return null;
  }
};

// Container icon — silhouette for body / backpack / suitcase / wearing
const ContainerIcon = ({ name, size = 14 }) => {
  const s = { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'suitcase': return <svg {...s}><rect x="2" y="5" width="12" height="9" rx="1"/><path d="M6 5V3h4v2M2 9h12"/></svg>;
    case 'backpack': return <svg {...s}><path d="M4 6v7c0 1 .5 1 1 1h6c.5 0 1 0 1-1V6c0-2-2-3-4-3s-4 1-4 3z"/><path d="M6 3V2h4v1M5 9h6"/></svg>;
    case 'body':     return <svg {...s}><circle cx="8" cy="4" r="2"/><path d="M4 14v-2c0-2 1.5-4 4-4s4 2 4 4v2"/></svg>;
    case 'wearing':  return <svg {...s}><path d="M4 4l2-1 2 1 2-1 2 1v10H4V4z M6 3v11M10 3v11"/></svg>;
    default: return null;
  }
};

// Chip with icon + label
const Chip = ({ active, onClick, children, icon }) => (
  <button className={`chip ${active ? 'active' : ''}`} onClick={onClick}>
    {icon}
    {children}
  </button>
);

// Status tag
const Tag = ({ kind, children }) => (
  <span className={`tag tag-${kind}`}>{children}</span>
);

// Contour divider — SVG topographic band
const Contour = ({ height = 20, lines = 4, opacity = 0.4, color }) => (
  <svg width="100%" height={height} viewBox={`0 0 400 ${height}`} preserveAspectRatio="none" style={{ display: 'block', opacity }}>
    {Array.from({ length: lines }).map((_, i) => {
      const y = (height / (lines + 1)) * (i + 1);
      const amp = 1.5 + i * 0.5;
      const d = `M0 ${y} Q 50 ${y - amp} 100 ${y} T 200 ${y} T 300 ${y} T 400 ${y}`;
      return <path key={i} d={d} stroke={color || 'var(--paper3)'} strokeWidth="0.5" fill="none"/>;
    })}
  </svg>
);

// Hairline divider with optional label
const Rule = ({ label, color = 'var(--paper3)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 0.5, background: color }} />
    {label && <span className="mono" style={{ fontSize: 9, color: 'var(--ink4)' }}>{label}</span>}
    {label && <div style={{ flex: 1, height: 0.5, background: color }} />}
  </div>
);

// Progress spine — tiny ticks, one per item
const ProgressSpine = ({ total, packed, color = 'var(--forest4)', off = 'rgba(255,255,255,.12)', height = 14 }) => (
  <div className="progress-spine" style={{ height }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`tick ${i < packed ? 'on' : ''}`} style={{ background: i < packed ? color : off }} />
    ))}
  </div>
);

// Placeholder image — striped
const Placeholder = ({ width = '100%', height = 160, label = 'image', tone = 'paper' }) => (
  <div style={{
    width, height,
    background: tone === 'dark'
      ? 'repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0 8px, transparent 8px 16px)'
      : 'repeating-linear-gradient(45deg, var(--paper2) 0 8px, var(--paper) 8px 16px)',
    border: '0.5px solid ' + (tone === 'dark' ? 'rgba(255,255,255,.15)' : 'var(--paper3)'),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: tone === 'dark' ? 'rgba(255,255,255,.4)' : 'var(--ink4)',
  }}>[ {label} ]</div>
);

// Coordinate strip
const CoordStrip = ({ items, color = 'rgba(255,255,255,.5)' }) => (
  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
    {items.map((it, i) => (
      <div key={i} style={{ display: 'flex', gap: 4 }}>
        <span style={{ opacity: 0.5 }}>{it.k}</span>
        <span>{it.v}</span>
      </div>
    ))}
  </div>
);

Object.assign(window, {
  Logo, WordMark, SceneIcon, ContainerIcon, Chip, Tag, Contour, Rule, ProgressSpine, Placeholder, CoordStrip,
});
