// Mobile screens — PACKLOG v2 · tightened typography, stronger hierarchy, real destination art.
const { useState, useEffect, useMemo } = React;
const T = (zh, tw, en, lang = 'zh') => (lang === 'en' ? en : lang === 'tw' ? tw : zh);

// ═════════════════════════════════════════════════════════════════
// SCREEN · HOME — Trip list
// ═════════════════════════════════════════════════════════════════
const ScreenHome = ({ lang = 'zh', density = 'comfort' }) => {
  const data = window.PACKLOG_DATA;
  const destMap = { t1: 'yakushima', t2: 'hokkaido', t3: 'abc', t4: 'iceland', t5: 'chiangmai' };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 120 }}>
      {/* masthead */}
      <div style={{ padding: '20px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={22} />
            <WordMark />
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: 'var(--cream)', border: '0.5px solid var(--paper3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ink2)" strokeWidth="1.3"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3 3-5 6-5s6 2 6 5"/></svg>
          </div>
        </div>
      </div>

      {/* Big editorial header */}
      <div style={{ padding: '4px 20px 20px' }}>
        <div style={{ fontFamily: 'var(--cjk-display)', fontSize: 40, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.05 }}>
          {T('行前志','行前誌','Field Journal', lang)}
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 10, alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, color: 'var(--ink3)' }}>2026</span>
          <span style={{ width: 3, height: 3, borderRadius: 2, background: 'var(--ink4)' }}/>
          <span style={{ fontSize: 13, color: 'var(--ink3)' }}>{T('5 次行程','5 次行程','5 trips', lang)}</span>
          <span style={{ width: 3, height: 3, borderRadius: 2, background: 'var(--ink4)' }}/>
          <span style={{ fontSize: 13, color: 'var(--forest2)', fontWeight: 500 }}>{T('1 进行中','1 進行中','1 active', lang)}</span>
        </div>
      </div>

      {/* tabs */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8 }}>
        {[T('全部','全部','All', lang), T('进行中','進行中','Active', lang), T('归档','歸檔','Archived', lang)].map((t, i) => (
          <Chip key={i} active={i === 0}>{t}</Chip>
        ))}
      </div>

      <div style={{ height: 0.5, background: 'var(--paper3)', margin: '0 20px 6px' }}/>

      {/* trip list */}
      <div style={{ padding: '0 20px' }}>
        {data.trips.map((t) => (
          <TripCard key={t.id} trip={t} dest={destMap[t.id]} lang={lang} />
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: 'absolute', bottom: 38, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
        <button className="btn" style={{ padding: '13px 26px', borderRadius: 99, boxShadow: '0 4px 20px rgba(36,61,31,.25)' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>
          {T('新建行程','新建行程','New trip', lang)}
        </button>
      </div>
    </div>
  );
};

const TripCard = ({ trip, dest, lang }) => {
  const pct = Math.round(trip.progress * 100);
  const statusLabel = {
    planning: T('筹备中','籌備中','Planning', lang),
    packing:  T('打包中','打包中','Packing', lang),
    done:     T('已完成','已完成','Done', lang),
    reviewed: T('已复盘','已複盤','Reviewed', lang),
  }[trip.status];
  const statusColor = trip.status === 'packing' ? 'var(--forest2)' : trip.status === 'planning' ? 'var(--amber)' : 'var(--ink3)';

  return (
    <div style={{ padding: '18px 0', borderBottom: '0.5px solid var(--paper3)', display: 'flex', gap: 14, cursor: 'pointer', alignItems: 'stretch' }}>
      {/* destination plate */}
      <div style={{ width: 92, flexShrink: 0 }}>
        <DestArt name={dest} tone="dark" size="md" style={{ height: 116, width: 92, borderRadius: 6 }}/>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: statusColor }}/>
              <span style={{ fontSize: 11, color: statusColor, fontWeight: 500 }}>{statusLabel}</span>
            </div>
            {trip.pinned && <span style={{ fontSize: 10, color: 'var(--forest3)' }}>◆</span>}
          </div>
          <div style={{ fontFamily: 'var(--cjk-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1, marginTop: 2 }}>{trip.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>{trip.sub}</div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--ink3)' }}>{trip.dateRange} · {trip.days}d</span>
            {trip.status !== 'planning' && (
              <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500, color: 'var(--forest)', letterSpacing: '-0.02em' }}>{pct}%</span>
            )}
          </div>
          {trip.status !== 'planning' && (
            <div style={{ height: 2, background: 'var(--paper2)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--forest3)' : 'var(--forest2)' }}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// SCREEN · NEW TRIP
// ═════════════════════════════════════════════════════════════════
const ScreenNewTrip = ({ lang = 'zh' }) => {
  const [step, setStep] = useState(1);
  const [days, setDays] = useState(7);
  const [travel, setTravel] = useState(['friends']);
  const [scenes, setScenes] = useState(['hiking', 'camping']);
  const toggle = (arr, v, set) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%', paddingBottom: 40 }}>
      <div style={{ padding: '18px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--ink2)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M10 3L5 8l5 5"/></svg>
          {T('取消','取消','Cancel', lang)}
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: 20, height: 2, background: i <= step ? 'var(--forest)' : 'var(--paper3)' }}/>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 20px 18px' }}>
        <div className="label">{T('新建行程 · ','新建行程 · ','New trip · ', lang)}{String(step).padStart(2,'0')}/03</div>
        <div style={{ fontFamily: 'var(--cjk-display)', fontSize: 28, fontWeight: 600, color: 'var(--ink)', marginTop: 8, lineHeight: 1.2 }}>
          {step === 1 && T('去哪里，多久？','去哪裡，多久？','Where & how long?', lang)}
          {step === 2 && T('和谁，做什么？','和誰，做什麼？','With whom, for what?', lang)}
          {step === 3 && T('确认标题与备注','確認標題與備註','Title & notes', lang)}
        </div>
      </div>

      {step === 1 && (
        <div style={{ padding: '0 20px' }}>
          <FormField label={T('目的地','目的地','Destination', lang)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 8 }}>
              {[['亚洲','Asia','CONTINENT'], ['日本','Japan','COUNTRY'], ['屋久岛','Yakushima','CITY']].map((f, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--cream)', border: '0.5px solid var(--paper3)', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--ink4)', marginBottom: 3 }}>{f[2]}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink)' }}>{lang === 'en' ? f[1] : f[0]}</div>
                </div>
              ))}
            </div>
          </FormField>

          <FormField label={T('天数','天數','Duration', lang)}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[3, 5, 7, 10, 14].map(d => (
                <Chip key={d} active={days === d} onClick={() => setDays(d)}>{d} {T('日','日','d', lang)}</Chip>
              ))}
              <Chip>+ {T('自定义','自訂','Custom', lang)}</Chip>
            </div>
          </FormField>

          <FormField label={T('日期','日期','Dates', lang)}>
            <MiniCalendar />
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div style={{ padding: '0 20px' }}>
          <FormField label={T('出行方式','出行方式','Travel style', lang)}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[{k:'solo',z:'独旅',e:'Solo'},{k:'friends',z:'朋友同行',e:'Friends'},{k:'family',z:'家庭',e:'Family'},{k:'race',z:'比赛',e:'Race'}].map(t => (
                <Chip key={t.k} active={travel.includes(t.k)} onClick={() => toggle(travel, t.k, setTravel)}>
                  {T(t.z, t.z, t.e, lang)}
                </Chip>
              ))}
            </div>
          </FormField>

          <FormField label={T('出行场景 · 可多选','出行場景 · 可多選','Scenes', lang)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                {k:'hiking',z:'徒步',e:'Hiking'},
                {k:'camping',z:'露营',e:'Camping'},
                {k:'trail_run',z:'越野跑',e:'Trail'},
                {k:'dive',z:'潜水',e:'Dive'},
                {k:'city',z:'城市',e:'City'},
                {k:'climb',z:'攀岩',e:'Climb'},
                {k:'cycle',z:'骑行',e:'Cycle'},
                {k:'ski',z:'滑雪',e:'Ski'},
                {k:'drive',z:'自驾',e:'Drive'},
              ].map(s => {
                const on = scenes.includes(s.k);
                return (
                  <button key={s.k} onClick={() => toggle(scenes, s.k, setScenes)}
                    style={{
                      padding: '14px 8px', background: on ? 'var(--forest)' : 'var(--cream)',
                      border: '0.5px solid ' + (on ? 'var(--forest)' : 'var(--paper3)'),
                      borderRadius: 10, color: on ? 'var(--cream)' : 'var(--ink2)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer',
                    }}>
                    <SceneIcon name={s.k} size={18} />
                    <span style={{ fontSize: 12 }}>{T(s.z, s.z, s.e, lang)}</span>
                  </button>
                );
              })}
            </div>
          </FormField>
        </div>
      )}

      {step === 3 && (
        <div style={{ padding: '0 20px' }}>
          <FormField label={T('行程预览','行程預覽','Preview', lang)}>
            <div style={{ background: 'var(--forest)', borderRadius: 14, color: 'var(--cream)', overflow: 'hidden', position: 'relative' }}>
              <DestArt name="yakushima" tone="dark" style={{ height: 110, width: '100%', borderRadius: 0 }}/>
              <div style={{ padding: '18px 20px 20px' }}>
                <div className="label label-green">FOLIO 005</div>
                <div style={{ fontFamily: 'var(--cjk-display)', fontSize: 28, fontWeight: 600, color: 'var(--cream)', marginTop: 8, lineHeight: 1.1 }}>屋久岛</div>
                <div style={{ fontSize: 13, opacity: 0.75, marginTop: 3 }}>徒步 · 露营 · 7日</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 10 }}>May 8 — May 14, 2026</div>
              </div>
            </div>
          </FormField>

          <FormField label={T('备注 · 可选','備註 · 可選','Notes · optional', lang)}>
            <textarea placeholder={T('任何提醒或想法…','任何提醒或想法…','Any reminders…', lang)} style={{ width: '100%', minHeight: 80, resize: 'none', fontSize: 13 }} />
          </FormField>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 38, left: 20, right: 20, display: 'flex', gap: 10 }}>
        {step > 1 && <button className="btn ghost" style={{ flex: 0.5 }} onClick={() => setStep(step - 1)}>{T('上一步','上一步','Back', lang)}</button>}
        <button className="btn" style={{ flex: 1 }} onClick={() => setStep(step < 3 ? step + 1 : 3)}>
          {step < 3 ? T('下一步','下一步','Continue', lang) : T('创建 · 生成 AI 清单','建立 · 生成 AI 清單','Create · Generate', lang)}
        </button>
      </div>
    </div>
  );
};

const FormField = ({ label, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div className="label" style={{ marginBottom: 10 }}>{label}</div>
    {children}
  </div>
);

const MiniCalendar = () => {
  const days = 35, start = 3, selStart = 10, selEnd = 16;
  return (
    <div style={{ padding: '14px', background: 'var(--cream)', border: '0.5px solid var(--paper3)', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>May 2026</div>
        <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--ink4)' }}>
          {['M','T','W','T','F','S','S'].map((d,i) => <span key={i} style={{ width: 10, textAlign: 'center' }}>{d}</span>)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {Array.from({ length: days }).map((_, i) => {
          const d = i - start;
          const show = d >= 0 && d < 31;
          const inRange = d >= selStart - 1 && d <= selEnd - 1;
          const isEnd = d === selStart - 1 || d === selEnd - 1;
          return (
            <div key={i} style={{
              aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: isEnd ? 600 : 400,
              color: !show ? 'transparent' : isEnd ? 'var(--cream)' : inRange ? 'var(--forest)' : 'var(--ink2)',
              background: isEnd ? 'var(--forest)' : inRange ? 'var(--forest5)' : 'transparent',
              borderRadius: isEnd ? 4 : 0,
            }}>{show ? d + 1 : ''}</div>
          );
        })}
      </div>
    </div>
  );
};

Object.assign(window, { ScreenHome, ScreenNewTrip, TripCard, FormField, MiniCalendar });
