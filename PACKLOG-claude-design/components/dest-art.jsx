// Destination illustrations — real SVG art per location.
// Each is a confident editorial silhouette, not noisy contour wallpaper.

const DestArt = ({ name, size = 'md', tone = 'dark', style = {} }) => {
  const palette = tone === 'dark'
    ? { bg: 'var(--forest)', stroke: 'var(--forest3)', fill: '#1a2d16', sky: 'rgba(255,255,255,.05)', accent: 'var(--forest4)' }
    : { bg: 'var(--paper2)', stroke: 'var(--forest2)', fill: 'var(--paper3)', sky: 'var(--paper)', accent: 'var(--forest3)' };
  const h = { sm: 72, md: 120, lg: 180 }[size] || 120;
  const w = { sm: 72, md: '100%', lg: '100%' }[size] || '100%';

  const art = {
    yakushima: (
      // Yakushima — ancient cedar island, steep peaks, layered mist
      <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="300" height="180" fill={palette.bg}/>
        {/* distant mountain layers — atmospheric */}
        <path d="M0 140 L30 110 L60 125 L95 95 L130 115 L165 85 L200 105 L235 80 L270 100 L300 88 L300 180 L0 180Z" fill={palette.fill} opacity="0.45"/>
        <path d="M0 155 L40 130 L80 145 L115 120 L155 138 L195 118 L230 132 L270 118 L300 128 L300 180 L0 180Z" fill={palette.fill} opacity="0.7"/>
        {/* foreground — main peak Miyanoura */}
        <path d="M0 180 L50 150 L90 155 L140 115 L170 130 L210 108 L245 125 L300 115 L300 180Z" fill={palette.fill}/>
        {/* snow cap on highest peak */}
        <path d="M135 118 L143 122 L148 118 L152 122 L157 119" stroke={palette.accent} strokeWidth="1" fill="none"/>
        {/* mist lines */}
        <g stroke={palette.accent} strokeWidth="0.5" fill="none" opacity="0.35">
          <path d="M20 88 Q 80 85 140 88 T 280 90"/>
          <path d="M40 72 Q 100 68 160 72 T 290 74"/>
          <path d="M60 56 Q 120 52 180 56 T 290 58"/>
        </g>
        {/* tiny cedar trees on the nearer ridge */}
        <g fill={palette.bg} stroke={palette.accent} strokeWidth="0.4">
          {[60, 75, 92, 185, 205, 225, 260].map((x, i) => (
            <g key={i} transform={`translate(${x}, ${138 - (i%2)*3})`}>
              <path d="M0 0 L-2 4 L-1 4 L-2.5 8 L2.5 8 L1 4 L2 4 Z"/>
            </g>
          ))}
        </g>
      </svg>
    ),
    hokkaido: (
      <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="300" height="180" fill={palette.bg}/>
        {/* snow-capped mountain range */}
        <path d="M0 180 L0 130 L60 80 L100 110 L150 60 L200 100 L250 70 L300 110 L300 180Z" fill={palette.fill}/>
        {/* snow caps */}
        <path d="M44 96 L60 80 L80 96 M130 82 L150 60 L175 86 M235 84 L250 70 L270 88" stroke={palette.accent} strokeWidth="1" fill="none"/>
        {/* falling snow */}
        <g fill={palette.accent} opacity="0.7">
          {Array.from({length:22}).map((_,i) => <circle key={i} cx={(i*37)%300} cy={(i*23)%120} r="0.8"/>)}
        </g>
      </svg>
    ),
    abc: (
      <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="300" height="180" fill={palette.bg}/>
        {/* dramatic himalayan peaks */}
        <path d="M0 180 L0 140 L40 110 L80 135 L120 40 L160 95 L200 25 L240 85 L280 60 L300 100 L300 180Z" fill={palette.fill}/>
        <path d="M105 60 L120 40 L135 68 M185 50 L200 25 L220 60" stroke={palette.accent} strokeWidth="1" fill="none"/>
        {/* prayer flag line */}
        <path d="M30 30 Q 150 50 280 35" stroke={palette.accent} strokeWidth="0.4" fill="none" strokeDasharray="3 2" opacity="0.5"/>
      </svg>
    ),
    iceland: (
      <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="300" height="180" fill={palette.bg}/>
        {/* volcanic plateau + glacier */}
        <path d="M0 180 L0 120 L80 105 L120 115 L160 100 L220 115 L300 105 L300 180Z" fill={palette.fill}/>
        {/* waterfall */}
        <path d="M140 105 L140 170" stroke={palette.accent} strokeWidth="1.5" fill="none" opacity="0.7"/>
        <path d="M135 105 L135 170 M145 105 L145 170" stroke={palette.accent} strokeWidth="0.5" fill="none" opacity="0.4"/>
        {/* aurora lines */}
        <g stroke={palette.accent} strokeWidth="0.6" fill="none" opacity="0.5">
          <path d="M30 50 Q 100 30 180 45 T 290 50"/>
          <path d="M40 65 Q 110 48 190 62 T 295 68"/>
        </g>
      </svg>
    ),
    chiangmai: (
      <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="300" height="180" fill={palette.bg}/>
        {/* temple silhouette + hills */}
        <path d="M0 180 L0 145 L60 130 L120 140 L300 125 L300 180Z" fill={palette.fill} opacity="0.6"/>
        {/* stupa */}
        <g fill={palette.fill} stroke={palette.accent} strokeWidth="0.6">
          <path d="M145 140 L145 115 L155 85 L165 115 L165 140 Z"/>
          <circle cx="155" cy="78" r="3"/>
          <path d="M155 72 L155 65"/>
          <circle cx="155" cy="62" r="1.5"/>
        </g>
        {/* lanterns */}
        <g fill={palette.accent} opacity="0.6">
          {[50, 90, 220, 260].map((x,i) => <circle key={i} cx={x} cy={60 + (i%2)*15} r="1.5"/>)}
        </g>
      </svg>
    ),
    // generic fallback — soft horizon
    generic: (
      <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="300" height="180" fill={palette.bg}/>
        <path d="M0 180 L0 135 L80 115 L160 130 L240 110 L300 120 L300 180Z" fill={palette.fill}/>
      </svg>
    ),
  };

  return (
    <div style={{ width: w, height: h, overflow: 'hidden', borderRadius: 4, ...style }}>
      {art[name] || art.generic}
    </div>
  );
};

// Weather pictogram — solid, confident
const WeatherGlyph = ({ kind = 'rain', size = 40, color = 'var(--forest2)' }) => {
  const s = { width: size, height: size, viewBox: '0 0 40 40', fill: 'none', stroke: color, strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'rain') return (
    <svg {...s}>
      <path d="M10 22a6 6 0 010-12 9 9 0 0117-1.5A7 7 0 0126 22H10z"/>
      <path d="M12 28l-1.5 4M20 28l-1.5 4M28 28l-1.5 4"/>
    </svg>
  );
  if (kind === 'snow') return (
    <svg {...s}><circle cx="20" cy="14" r="6"/><path d="M20 4v20M10 14h20M13 7l14 14M27 7L13 21"/></svg>
  );
  return <svg {...s}><circle cx="20" cy="20" r="8"/><path d="M20 8v4M20 28v4M8 20h4M28 20h4"/></svg>;
};

// Topographic mini-map — for hero cards
const TopoMap = ({ width = '100%', height = 140, style = {} }) => (
  <svg width={width} height={height} viewBox="0 0 240 140" preserveAspectRatio="xMidYMid slice" style={{ display: 'block', ...style }}>
    {/* concentric contour rings representing an island */}
    <g fill="none" stroke="var(--forest3)" strokeWidth="0.5" opacity="0.4">
      <ellipse cx="120" cy="70" rx="100" ry="54"/>
      <ellipse cx="118" cy="68" rx="82" ry="44"/>
      <ellipse cx="116" cy="66" rx="64" ry="34"/>
      <ellipse cx="114" cy="64" rx="46" ry="24"/>
      <ellipse cx="112" cy="62" rx="28" ry="14"/>
      <ellipse cx="110" cy="60" rx="12" ry="6"/>
    </g>
    {/* location marker — peak */}
    <g>
      <circle cx="110" cy="60" r="3" fill="var(--forest4)"/>
      <path d="M110 50 L110 58 M110 62 L110 70 M100 60 L108 60 M112 60 L120 60" stroke="var(--forest4)" strokeWidth="0.6"/>
    </g>
  </svg>
);

// Elevation profile — as a functional chart, not decoration
const ElevationProfile = ({ color = 'var(--forest3)', fill = 'rgba(184,212,173,.15)', height = 60 }) => {
  const path = "M0 55 L15 50 L30 48 L45 38 L60 42 L78 20 L95 28 L115 10 L135 20 L155 32 L175 25 L195 38 L215 30 L235 45 L260 42 L280 50 L300 55 L300 60 L0 60 Z";
  return (
    <svg width="100%" height={height} viewBox="0 0 300 60" preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={path} fill={fill}/>
      <path d="M0 55 L15 50 L30 48 L45 38 L60 42 L78 20 L95 28 L115 10 L135 20 L155 32 L175 25 L195 38 L215 30 L235 45 L260 42 L280 50 L300 55" fill="none" stroke={color} strokeWidth="0.8"/>
      {/* summit marker */}
      <circle cx="115" cy="10" r="1.5" fill={color}/>
    </svg>
  );
};

Object.assign(window, { DestArt, WeatherGlyph, TopoMap, ElevationProfile });
