// app.jsx — main shell: state, tabs, layout, exporters.

const { useState, useRef, useMemo, useCallback } = React;

const BRAND_PRESETS = [
  '#f59e0b', // amber
  '#ec4899', // magenta
  '#06b6d4', // cyan
  '#84cc16', // lime
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "#f59e0b",
  "stageShape": "wide",
  "stageSize": "festival",
  "plotType": "full",
  "stageScale": 1,
  "showInputListTab": true,
  "showBacklineTab": true,
  "showGrid": true
}/*EDITMODE-END*/;

// ── Export helpers ─────────────────────────────────────────────────────────

async function exportSvgAsPng(svgEl, filename, scale = 2) {
  const clone = svgEl.cloneNode(true);
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  `;
  clone.insertBefore(style, clone.firstChild);

  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((res, rej) => {
    img.onload = res; img.onerror = rej; img.src = url;
  });
  const vb = svgEl.viewBox.baseVal;
  const w = (vb.width || svgEl.clientWidth) * scale;
  const h = (vb.height || svgEl.clientHeight) * scale;
  const cnv = document.createElement('canvas');
  cnv.width = w; cnv.height = h;
  const ctx = cnv.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  cnv.toBlob((b) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }, 'image/png');
}

function exportPdf() {
  // Native print path — print stylesheet hides chrome and renders the visible
  // tab full-bleed. User saves as PDF in the print dialog.
  window.print();
}

// ── Tab bar ────────────────────────────────────────────────────────────────

const TabBar = React.memo(function TabBar({ tab, setTab, hasInputList, hasBackline }) {
  const tabs = [{ id: 'plot', label: 'Stage Plot' }];
  if (hasInputList) tabs.push({ id: 'list', label: 'Input List' });
  if (hasBackline)  tabs.push({ id: 'back', label: 'Backline' });
  return (
    <div className="sp-tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} className={`sp-tab ${tab === t.id ? 'on' : ''}`}
                role="tab" aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}>
          <span>{t.label}</span>
          {tab === t.id && <i className="sp-tab-bar" />}
        </button>
      ))}
    </div>
  );
});

// ── Header strip on top of the canvas ──────────────────────────────────────

const CanvasHeader = React.memo(function CanvasHeader({ show, accent, channelCount, performerCount, plotType }) {
  return (
    <div className="sp-canvas-head">
      <div className="sp-canvas-head-l">
        {show.logoDataUrl && (
          <img src={show.logoDataUrl} alt="" className="sp-header-logo" />
        )}
        <div>
          <div className="sp-canvas-eyebrow" style={{ color: accent }}>
            ▌ STAGE PLOT · {(PLOT_TYPES[plotType]?.label || 'Full').toUpperCase()} VIEW
          </div>
          <h1 className="sp-canvas-band">{show.band || '—'}</h1>
          <div className="sp-canvas-meta">
            {show.show && <span>{show.show}</span>}
            {show.venue && <span>·</span>}
            {show.venue && <span>{show.venue}</span>}
            {show.date && <span>·</span>}
            {show.date && <span>{new Date(show.date).toLocaleDateString('en-US',
              { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          </div>
        </div>
      </div>
      <div className="sp-canvas-head-r">
        <div className="sp-stat">
          <span className="sp-stat-num">{performerCount}</span>
          <span className="sp-stat-lbl">on stage</span>
        </div>
        <div className="sp-stat">
          <span className="sp-stat-num" style={{ color: accent }}>
            {channelCount}
          </span>
          <span className="sp-stat-lbl">channels</span>
        </div>
      </div>
    </div>
  );
});

// ── Legend strip under the canvas ──────────────────────────────────────────

const Legend = React.memo(function Legend({ accent, theme }) {
  const items = [
    { label: 'Performer',  swatch: 'role'   },
    { label: 'Wedge',      swatch: 'wedge'  },
    { label: 'Amp',        swatch: 'amp'    },
    { label: 'DI box',     swatch: 'di'     },
    { label: 'Pedalboard', swatch: 'ped'    },
    { label: 'IEM pack',   swatch: 'iem'    },
    { label: 'AC drop',    swatch: 'power'  },
    { label: 'Mic',        swatch: 'mic'    },
  ];
  return (
    <div className="sp-legend">
      {items.map((it) => (
        <div key={it.label} className="sp-legend-item">
          <Swatch kind={it.swatch} accent={accent} />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
});

const Swatch = React.memo(function Swatch({ kind, accent }) {
  const common = { width: 22, height: 22 };
  if (kind === 'role') return (
    <svg {...common} viewBox="-12 -12 24 24">
      <ellipse cx="0" cy="2" rx="8" ry="5" fill="#ef476f" opacity="0.25" />
      <circle cx="0" cy="-1" r="5" fill="#ef476f" />
    </svg>
  );
  if (kind === 'wedge') return (
    <svg {...common} viewBox="-12 -12 24 24">
      <path d="M -10 -3 L 10 -3 L 7 6 L -7 6 Z" fill="currentColor"
            opacity="0.4" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
  if (kind === 'amp') return (
    <svg {...common} viewBox="-12 -12 24 24">
      <rect x="-9" y="-6" width="18" height="12" rx="1" fill="currentColor"
            opacity="0.3" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="-3" cy="0" r="2.5" fill="none" stroke="currentColor"
              strokeWidth="0.8" />
      <circle cx="3" cy="0" r="2.5" fill="none" stroke="currentColor"
              strokeWidth="0.8" />
    </svg>
  );
  if (kind === 'di') return (
    <svg {...common} viewBox="-12 -12 24 24">
      <rect x="-6" y="-6" width="12" height="12" rx="1.5" fill={accent} />
      <text x="0" y="3" textAnchor="middle" fontSize="7" fontWeight="700"
            fill="#000" fillOpacity="0.78"
            fontFamily="ui-monospace,monospace">DI</text>
    </svg>
  );
  if (kind === 'ped') return (
    <svg {...common} viewBox="-12 -12 24 24">
      <rect x="-9" y="-4" width="18" height="8" rx="1.5" fill="currentColor"
            opacity="0.3" stroke="currentColor" strokeWidth="0.8" />
      {[-6, -2, 2, 6].map((px) => (
        <circle key={px} cx={px} cy="0" r="1.3" fill="currentColor" opacity="0.7" />
      ))}
    </svg>
  );
  if (kind === 'iem') return (
    <svg {...common} viewBox="-12 -12 24 24">
      <rect x="-7" y="-5" width="14" height="10" rx="1.2" fill="currentColor"
            opacity="0.3" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="2" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
  if (kind === 'power') return (
    <svg {...common} viewBox="-12 -12 24 24">
      <rect x="-9" y="-7" width="18" height="14" rx="1.5" fill="#fbbf24"
            stroke="#000" strokeOpacity="0.3" strokeWidth="0.8" />
      <path d="M -2 -4 L -3 0 L 1 0 L -1 4 L 4 -1 L 1 -1 L 2 -4 Z"
            fill="#000" fillOpacity="0.7" />
    </svg>
  );
  if (kind === 'mic') return (
    <svg {...common} viewBox="-12 -12 24 24">
      <circle cx="0" cy="0" r="4" fill={accent} stroke="#000"
              strokeOpacity="0.35" strokeWidth="0.8" />
      <circle cx="0" cy="0" r="1.6" fill="#000" fillOpacity="0.4" />
      <circle cx="0" cy="0" r="9" fill="none" stroke="currentColor"
              strokeWidth="0.6" strokeDasharray="2 2" opacity="0.5" />
    </svg>
  );
  return null;
});

// ── Main app ───────────────────────────────────────────────────────────────

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useState('plot');
  const [show, setShow] = useState(DEFAULT_SHOW);
  const [musicians, setMusicians] = useState(DEFAULT_MUSICIANS);
  const [extras, setExtras] = useState(DEFAULT_EXTRAS);
  const [channels, setChannels] = useState(() => buildChannelList(DEFAULT_MUSICIANS));
  const [backline, setBackline] = useState(() => buildBacklineList(DEFAULT_MUSICIANS));
  // Start with form collapsed on narrow viewports so mobile lands on the canvas.
  const [formCollapsed, setFormCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 900
  );
  const [tweaksOpen, setTweaksOpen] = useState(false);

  // Mirror TweaksPanel's open/closed state so the topbar button can reflect it.
  React.useEffect(() => {
    const onMsg = (e) => {
      const ty = e?.data?.type;
      if (ty === '__activate_edit_mode') setTweaksOpen(true);
      else if (ty === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const toggleTweaks = useCallback(() => {
    if (tweaksOpen) {
      window.postMessage({ type: '__deactivate_edit_mode' }, '*');
      window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
    } else {
      window.postMessage({ type: '__activate_edit_mode' }, '*');
    }
  }, [tweaksOpen]);

  const stageRef = useRef(null);

  // Drag handler — flips musician.pos to 'custom' and stores x/y.
  const onMusicianMove = useCallback((id, x, y) => {
    setMusicians((cur) => cur.map((m) =>
      m.id === id ? { ...m, pos: 'custom', x, y } : m));
  }, []);
  const onPowerMove = useCallback((id, x, y) => {
    setExtras((e) => ({
      ...e,
      powerDropList: (e.powerDropList || []).map((p) =>
        p.id === id ? { ...p, x, y } : p),
    }));
  }, []);
  const onRiserMove = useCallback((id, x, y) => {
    setExtras((e) => ({
      ...e,
      risers: (e.risers || []).map((r) =>
        r.id === id ? { ...r, x, y } : r),
    }));
  }, []);

  const onExportPng = useCallback(() => {
    const svg = stageRef.current?.querySelector('svg');
    if (!svg) return;
    exportSvgAsPng(svg, `${(show.band || 'stage-plot').replace(/\s+/g, '-')}.png`);
  }, [show.band]);

  // Apply theme class to document root so print + body bg get it too
  React.useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.style.setProperty('--sp-accent', t.accent);
  }, [t.theme, t.accent]);

  const validTabs = ['plot'];
  if (t.showInputListTab) validTabs.push('list');
  if (t.showBacklineTab)  validTabs.push('back');
  const showTab = validTabs.includes(tab) ? tab : 'plot';

  return (
    <div className={`sp-app sp-theme-${t.theme}`}
         data-screen-label="Stage Plot Generator">
      {/* TOP BAR */}
      <header className="sp-topbar">
        <div className="sp-brand">
          <div className="sp-brand-mark" style={{ background: t.accent }} />
          <div>
            <div className="sp-brand-name">STAGE PLOT</div>
            <div className="sp-brand-sub">generator · v1</div>
          </div>
        </div>
        <TabBar tab={showTab} setTab={setTab}
                hasInputList={t.showInputListTab}
                hasBackline={t.showBacklineTab} />
        <div className="sp-topbar-actions">
          <button className="sp-btn-ghost" onClick={() => setFormCollapsed((x) => !x)}>
            {formCollapsed ? '▸ Form' : '◂ Hide form'}
          </button>
          <button className={`sp-btn-ghost ${tweaksOpen ? 'on' : ''}`}
                  onClick={toggleTweaks}
                  title={tweaksOpen ? 'Hide tweaks' : 'Show tweaks'}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="5" cy="4" r="1.6" fill="currentColor" />
              <line x1="2" y1="4" x2="3.4" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="6.6" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="11" cy="8" r="1.6" fill="currentColor" />
              <line x1="2" y1="8" x2="9.4" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="12.6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="7" cy="12" r="1.6" fill="currentColor" />
              <line x1="2" y1="12" x2="5.4" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="8.6" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Tweaks
          </button>
          <button className="sp-btn" onClick={onExportPng}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8m0 0L5 7m3 3 3-3M2 12v2h12v-2"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            PNG
          </button>
          <button className="sp-btn sp-btn-primary" onClick={exportPdf}
                  style={{ background: t.accent, color: '#0d0e10' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h6l4 4v8H3V2z M9 2v4h4"
                    stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            PDF
          </button>
        </div>
      </header>

      <main className={`sp-main ${formCollapsed ? 'collapsed' : ''}`}>
        {/* FORM PANEL */}
        {!formCollapsed && (
          <>
            <div className="sp-form-backdrop"
                 onClick={() => setFormCollapsed(true)} />
            <aside className="sp-form-panel" data-screen-label="Form Panel">
              <div className="sp-form-mobile-close">
                <button className="sp-btn-ghost"
                        onClick={() => setFormCollapsed(true)}>
                  Close ✕
                </button>
              </div>
              <div className="sp-form-scroll">
                <ShowForm show={show} setShow={setShow} />
                <MusiciansForm musicians={musicians} setMusicians={setMusicians} />
                <ExtrasForm extras={extras} setExtras={setExtras} />
              </div>
            </aside>
          </>
        )}

        {/* CANVAS PANEL */}
        <section className="sp-canvas-panel" data-screen-label="Canvas">
          {showTab === 'plot' && (
            <>
              <CanvasHeader show={show} accent={t.accent}
                            channelCount={channels.length}
                            performerCount={musicians.length}
                            plotType={t.plotType} />
              <div className="sp-canvas-frame">
                <div className="sp-canvas-inner"
                     style={{ transform: `scale(${t.stageScale})` }}>
                  <StageCanvas show={show} musicians={musicians}
                               extras={extras} shape={t.stageShape}
                               stageSize={t.stageSize}
                               plotType={t.plotType}
                               showGrid={t.showGrid} theme={t.theme}
                               accent={t.accent} exportRef={stageRef}
                               onMusicianMove={onMusicianMove}
                               onPowerMove={onPowerMove}
                               onRiserMove={onRiserMove} />
                </div>
              </div>
              <div className="sp-canvas-foot">
                <Legend accent={t.accent} theme={t.theme} />
                {extras.notes && (
                  <div className="sp-notes">
                    <div className="sp-notes-h">PRODUCTION NOTES</div>
                    <div className="sp-notes-body">{extras.notes}</div>
                  </div>
                )}
              </div>
            </>
          )}
          {showTab === 'list' && (
            <InputList musicians={musicians} show={show}
                       channels={channels} setChannels={setChannels}
                       accent={t.accent} theme={t.theme} />
          )}
          {showTab === 'back' && (
            <BacklineList musicians={musicians} show={show}
                          backline={backline} setBackline={setBackline}
                          accent={t.accent} />
          )}
        </section>
      </main>

      {/* TWEAKS */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={t.theme}
                    options={['dark', 'light']}
                    onChange={(v) => setTweak('theme', v)} />
        <TweakColor label="Brand color" value={t.accent}
                    options={BRAND_PRESETS}
                    onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="Stage" />
        <TweakRadio label="Size" value={t.stageSize}
                    options={[
                      { value: 'festival', label: 'Festival' },
                      { value: 'theater',  label: 'Theater'  },
                      { value: 'club',     label: 'Club'     },
                    ]}
                    onChange={(v) => setTweak('stageSize', v)} />
        <TweakRadio label="Shape" value={t.stageShape}
                    options={[
                      { value: 'wide',   label: 'Wide' },
                      { value: 'rect',   label: 'Box'  },
                      { value: 'thrust', label: 'Thrust' },
                    ]}
                    onChange={(v) => setTweak('stageShape', v)} />
        <TweakSlider label="Scale" value={t.stageScale}
                     min={0.7} max={1.3} step={0.05} unit="×"
                     onChange={(v) => setTweak('stageScale', v)} />
        <TweakToggle label="Show grid" value={t.showGrid}
                     onChange={(v) => setTweak('showGrid', v)} />

        <TweakSection label="Plot view" />
        <TweakRadio label="Type" value={t.plotType}
                    options={[
                      { value: 'full',    label: 'Full'    },
                      { value: 'foh',     label: 'FOH'     },
                      { value: 'monitor', label: 'Mons'    },
                    ]}
                    onChange={(v) => setTweak('plotType', v)} />

        <TweakSection label="Layout" />
        <TweakToggle label="Input list tab" value={t.showInputListTab}
                     onChange={(v) => setTweak('showInputListTab', v)} />
        <TweakToggle label="Backline tab" value={t.showBacklineTab}
                     onChange={(v) => setTweak('showBacklineTab', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
