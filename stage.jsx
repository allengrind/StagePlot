// stage.jsx — SVG stage canvas with illustrated top-down icons, draggable
// musicians, stage size presets, and plot view emphasis (full/foh/monitor).

const STAGE_W = 1000;
const STAGE_H = 600;

// Stage shapes: each returns a clip path (and a stage outline path) given dims.
function stageShapePaths(shape, w, h) {
  switch (shape) {
    case 'thrust': {
      const tx = w * 0.36, tw = w * 0.28, th = h * 0.18;
      return {
        outline: `M0 0 H${w} V${h} H${tx + tw} V${h + th} H${tx} V${h} H0 Z`,
        viewExtend: th,
      };
    }
    case 'round': {
      // Circle inscribed in viewbox (we draw an ellipse using full width).
      // Audience surrounds — handled by callers.
      return { outline: '', viewExtend: 0, round: true };
    }
    case 'wide':
    case 'rect':
    default:
      return { outline: `M0 0 H${w} V${h} H0 Z`, viewExtend: 0 };
  }
}

// Resolve musician on-stage XY: preset key or custom coords.
function musicianXY(m) {
  if (m.pos === 'custom' && Number.isFinite(m.x) && Number.isFinite(m.y)) {
    return { x: m.x, y: m.y, label: 'Custom' };
  }
  const p = POSITIONS[m.pos];
  return p ? { x: p.x, y: p.y, label: p.label } : { x: STAGE_W / 2, y: STAGE_H / 2, label: '—' };
}

// Generic SVG drag wrapper. Translates client deltas into the SVG user-space
// of whatever <svg> owns the rendered <g>, then calls onMove with new x,y.
function DraggableG({ x, y, onMove, cursor = 'grab', className = '',
                      bounds = { x0: 30, y0: 30, x1: STAGE_W - 30, y1: STAGE_H - 30 },
                      children }) {
  const ref = React.useRef(null);
  const cleanupRef = React.useRef(null);

  React.useEffect(() => () => { cleanupRef.current?.(); }, []);

  const onPointerDown = (e) => {
    if (!onMove) return;
    e.preventDefault();
    e.stopPropagation();
    const svg = ref.current.ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const inv = ctm.inverse();
    const toSvg = (cx, cy) => {
      pt.x = cx; pt.y = cy;
      return pt.matrixTransform(inv);
    };
    const start = toSvg(e.clientX, e.clientY);
    const sp = { x, y };
    const move = (ev) => {
      const cur = toSvg(ev.clientX, ev.clientY);
      const nx = Math.max(bounds.x0, Math.min(bounds.x1, sp.x + (cur.x - start.x)));
      const ny = Math.max(bounds.y0, Math.min(bounds.y1, sp.y + (cur.y - start.y)));
      onMove(nx, ny);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      cleanupRef.current = null;
    };
    cleanupRef.current = up;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <g ref={ref} className={`sp-draggable ${className}`}
       transform={`translate(${x} ${y})`}
       style={onMove ? { cursor } : undefined}
       onPointerDown={onPointerDown}>
      {children}
    </g>
  );
}

// Plot-type emphasis: returns opacity for a category given current view.
function emphFor(plotType, category) {
  const t = PLOT_TYPES[plotType] || PLOT_TYPES.full;
  return t.emphasize.includes(category) ? 1 : 0.22;
}

// ── Illustrated icon primitives ─────────────────────────────────────────────

const MusicianIcon = React.memo(function MusicianIcon({ role, name, c, dimmed }) {
  const r = ROLES[role];
  const color = r?.color || '#888';
  const short = r?.short || '?';
  return (
    <g opacity={dimmed ? 0.5 : 1}>
      <ellipse cx="0" cy="6" rx="22" ry="14" fill={color} opacity="0.18" />
      <ellipse cx="0" cy="6" rx="22" ry="14" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="0" cy="-2" r="11" fill={color} />
      <circle cx="0" cy="-2" r="11" fill="none" stroke={c.bg} strokeWidth="1.5" />
      <text x="0" y="1.5" textAnchor="middle" fontSize="9" fontWeight="700"
            fontFamily="ui-monospace,'JetBrains Mono',monospace" fill={c.bg}>
        {short}
      </text>
      <g transform="translate(0 32)">
        <rect x="-38" y="-9" width="76" height="18" rx="3" fill={c.panel}
              stroke={color} strokeWidth="1" />
        <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="600"
              fontFamily="ui-sans-serif,system-ui" fill={c.text}>
          {(name || r?.label || '').slice(0, 14).toUpperCase()}
        </text>
      </g>
    </g>
  );
});

function WedgeIcon({ x, y, rot = 0, c, label }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M -18 -6 L 18 -6 L 14 8 L -14 8 Z" fill={c.panel2}
            stroke={c.muted} strokeWidth="1" />
      <line x1="-12" y1="0" x2="12" y2="0" stroke={c.muted} strokeWidth="0.8" />
      <line x1="-10" y1="3" x2="10" y2="3" stroke={c.muted} strokeWidth="0.8" />
      <text x="0" y="-9" textAnchor="middle" fontSize="6"
            fontFamily="ui-monospace,monospace" fill={c.muted}>{label || 'WEDGE'}</text>
    </g>
  );
}

function AmpIcon({ x, y, label = 'AMP', rot = 0, c }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-22" y="-12" width="44" height="24" rx="2" fill={c.panel2}
            stroke={c.muted} strokeWidth="1" />
      <circle cx="-10" cy="0" r="6" fill="none" stroke={c.muted} strokeWidth="1" />
      <circle cx="10" cy="0" r="6" fill="none" stroke={c.muted} strokeWidth="1" />
      <line x1="-22" y1="-12" x2="-18" y2="-8" stroke={c.muted} strokeWidth="0.6" />
      <line x1="22" y1="-12" x2="18" y2="-8" stroke={c.muted} strokeWidth="0.6" />
      <text x="0" y="-15" textAnchor="middle" fontSize="6"
            fontFamily="ui-monospace,monospace" fill={c.muted}>{label}</text>
    </g>
  );
}

function PedalboardIcon({ x, y, c, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-16" y="-7" width="32" height="14" rx="2" fill={c.panel2}
            stroke={c.muted} strokeWidth="1" />
      {[-10, -3, 4, 11].map((px, i) => (
        <circle key={i} cx={px} cy="0" r="2.2" fill={c.muted} opacity="0.7" />
      ))}
      <text x="0" y="-10" textAnchor="middle" fontSize="6"
            fontFamily="ui-monospace,monospace" fill={c.muted}>PEDALS</text>
    </g>
  );
}

function DIIcon({ x, y, c, label = 'DI' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-7" y="-7" width="14" height="14" rx="1.5" fill={c.accent}
            stroke="#000" strokeOpacity="0.3" strokeWidth="0.8" />
      <text x="0" y="2" textAnchor="middle" fontSize="7" fontWeight="700"
            fontFamily="ui-monospace,monospace" fill="#000" fillOpacity="0.78">
        {label}
      </text>
    </g>
  );
}

function IEMIcon({ x, y, c }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-8" y="-6" width="16" height="12" rx="1.5" fill={c.panel2}
            stroke={c.muted} strokeWidth="0.8" />
      <circle cx="0" cy="0" r="2.5" fill="none" stroke={c.muted} strokeWidth="0.8" />
      <text x="0" y="-9" textAnchor="middle" fontSize="5.5"
            fontFamily="ui-monospace,monospace" fill={c.muted}>IEM</text>
    </g>
  );
}

function MicIcon({ x, y, c, accent }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="4" fill={accent} stroke="#000" strokeOpacity="0.35"
              strokeWidth="0.8" />
      <circle cx="0" cy="0" r="1.6" fill="#000" fillOpacity="0.4" />
      <circle cx="0" cy="0" r="9" fill="none" stroke={c.muted} strokeWidth="0.6"
              strokeDasharray="2 2" opacity="0.5" />
    </g>
  );
}

function PowerIcon({ c }) {
  return (
    <g>
      <rect x="-9" y="-7" width="18" height="14" rx="1.5" fill="#fbbf24"
            stroke="#000" strokeOpacity="0.3" strokeWidth="0.8" />
      <path d="M -2 -4 L -3 0 L 1 0 L -1 4 L 4 -1 L 1 -1 L 2 -4 Z"
            fill="#000" fillOpacity="0.7" />
      <text x="0" y="-9.5" textAnchor="middle" fontSize="5.5"
            fontFamily="ui-monospace,monospace" fill={c.muted}>AC 20A</text>
    </g>
  );
}

// Riser — draggable rectangle, optional label + height in inches.
function Riser({ r, c, onMove, onResize }) {
  return (
    <DraggableG x={r.x} y={r.y} onMove={onMove} cursor="move"
                bounds={{ x0: r.w / 2 + 10, y0: r.h / 2 + 10,
                          x1: STAGE_W - r.w / 2 - 10,
                          y1: STAGE_H - r.h / 2 - 10 }}>
      <rect x={-r.w / 2} y={-r.h / 2} width={r.w} height={r.h} rx="3"
            fill={c.panel2} stroke={c.muted} strokeWidth="1.2" />
      <rect x={-r.w / 2 + 2} y={-r.h / 2 + 2} width={r.w - 4} height={r.h - 4}
            rx="2" fill="none" stroke={c.muted} strokeWidth="0.5"
            strokeDasharray="2 4" opacity="0.6" />
      <text x="0" y={-r.h / 2 - 6} textAnchor="middle" fontSize="7"
            fontFamily="ui-monospace,monospace" fill={c.muted}
            letterSpacing="0.16em">
        {(r.label || 'RISER').toUpperCase()} · {Math.round(r.w / 16)}′ × {Math.round(r.h / 16)}′ × {r.heightIn || 0}″
      </text>
    </DraggableG>
  );
}

const DrumKit = React.memo(function DrumKit({ x, y, c }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="32" r="6" fill={c.panel2} stroke={c.muted} strokeWidth="0.8" />
      <circle cx="0" cy="8" r="14" fill={c.panel2} stroke={c.muted} strokeWidth="1.2" />
      <circle cx="0" cy="8" r="8" fill="none" stroke={c.muted} strokeWidth="0.6" />
      <circle cx="-13" cy="14" r="7" fill={c.panel} stroke={c.muted} strokeWidth="1" />
      <circle cx="-22" cy="6" r="6" fill="none" stroke="#facc15" strokeWidth="1.5" />
      <circle cx="-22" cy="6" r="2" fill="#facc15" />
      <circle cx="-7" cy="-6" r="6" fill={c.panel} stroke={c.muted} strokeWidth="1" />
      <circle cx="16" cy="14" r="9" fill={c.panel} stroke={c.muted} strokeWidth="1" />
      <circle cx="-18" cy="-8" r="9" fill="none" stroke="#facc15" strokeWidth="1.2" opacity="0.7" />
      <circle cx="20" cy="-2" r="10" fill="none" stroke="#facc15" strokeWidth="1.2" opacity="0.7" />
    </g>
  );
});

// ── Build per-musician satellite gear positions ────────────────────────────

// Each satellite is annotated with a category so plot-type emphasis can dim
// the right things.
function gearForMusician(m, posXY, c) {
  const items = [];
  const { x, y } = posXY;

  for (let i = 0; i < (m.gear.wedges || 0); i++) {
    const offset = (i - (m.gear.wedges - 1) / 2) * 26;
    items.push({
      Comp: WedgeIcon, cat: 'mon',
      props: { x: x + offset, y: y + 38, rot: 0, c, label: `MIX ${i + 1}` },
      key: `w${i}`,
    });
  }

  if (m.role === 'vocal' || m.role === 'bgv') {
    items.push({
      Comp: MicIcon, cat: 'mic',
      props: { x, y: y + 22, c, accent: c.accent },
      key: 'mic',
    });
  }

  if (m.role === 'drums') {
    items.push({
      Comp: DrumKit, cat: 'perf',
      props: { x, y: y - 18, c },
      key: 'kit',
    });
    // Drum overhead mics
    items.push({
      Comp: MicIcon, cat: 'mic',
      props: { x: x - 26, y: y - 36, c, accent: c.accent },
      key: 'oh-l',
    });
    items.push({
      Comp: MicIcon, cat: 'mic',
      props: { x: x + 26, y: y - 36, c, accent: c.accent },
      key: 'oh-r',
    });
  }

  if (m.gear.amp) {
    items.push({
      Comp: AmpIcon, cat: 'amp',
      props: { x, y: y - 30, c, label: m.role === 'bass' ? 'BASS' : 'GTR' },
      key: 'amp',
    });
    // Amp mic
    items.push({
      Comp: MicIcon, cat: 'mic',
      props: { x: x - 4, y: y - 38, c, accent: c.accent },
      key: 'amp-mic',
    });
  }

  if (m.gear.pedalboard) {
    items.push({
      Comp: PedalboardIcon, cat: 'ped',
      props: { x: x - 30, y: y + 18, c },
      key: 'ped',
    });
  }

  if (m.gear.di) {
    items.push({
      Comp: DIIcon, cat: 'di',
      props: { x: x + 32, y: y + 20, c, label: 'DI' },
      key: 'di',
    });
  }

  if (m.gear.iem) {
    items.push({
      Comp: IEMIcon, cat: 'iem',
      props: { x: x - 38, y: y - 8, c },
      key: 'iem',
    });
  }

  return items;
}

// ── Draggable musician group ────────────────────────────────────────────────

function DraggableMusician({ m, posXY, c, onDrag, plotType }) {
  const [hovering, setHovering] = React.useState(false);
  const gear = gearForMusician(m, posXY, c);
  const role = ROLES[m.role];

  return (
    <g>
      {/* Gear renders at world coords; not part of the drag group */}
      {gear.map(({ Comp, props, key, cat }) => (
        <g key={key} opacity={emphFor(plotType, cat)}>
          <Comp {...props} />
        </g>
      ))}
      <DraggableG x={posXY.x} y={posXY.y}
                  onMove={(nx, ny) => onDrag(m.id, nx, ny)}
                  cursor="grab">
        <g onPointerEnter={() => setHovering(true)}
           onPointerLeave={() => setHovering(false)}>
          {hovering && (
            <circle cx="0" cy="0" r="30" fill="none"
                    stroke={role?.color} strokeWidth="1.5"
                    strokeDasharray="3 3" opacity="0.6" />
          )}
          <MusicianIcon role={m.role} name={m.name} c={c} />
        </g>
      </DraggableG>
    </g>
  );
}

// ── Main stage canvas ──────────────────────────────────────────────────────

function StageCanvas({ show, musicians, extras, shape, stageSize, plotType,
                       showGrid, theme, accent, exportRef,
                       onMusicianMove, onPowerMove, onRiserMove }) {
  const c = theme === 'dark' ? {
    bg: '#0d0e10', panel: '#16181c', panel2: '#1c1f25', border: '#2a2d33',
    text: '#e8e9ed', muted: '#8a8d96', subtle: '#3a3d44',
    stage: '#13151a', stageEdge: accent, accent,
  } : {
    bg: '#f7f6f3', panel: '#ffffff', panel2: '#efece6', border: '#dcd7cd',
    text: '#1a1a1a', muted: '#6b6b6b', subtle: '#c8c3b8',
    stage: '#f1ede5', stageEdge: accent, accent,
  };

  const sz = STAGE_SIZES[stageSize] || STAGE_SIZES.festival;
  const shapeData = stageShapePaths(shape, STAGE_W, STAGE_H);
  const viewH = STAGE_H + (shapeData.viewExtend || 0) + 90;

  const drummer = musicians.find((m) => m.role === 'drums');
  const riserPositionFromDrummer = drummer ? musicianXY(drummer) : null;

  const sidefills = extras.sidefills ? [
    { x: 50,  y: STAGE_H - 40, rot: 90 },
    { x: STAGE_W - 50, y: STAGE_H - 40, rot: -90 },
  ] : [];

  const drumfill = (extras.drumfill && riserPositionFromDrummer) ? {
    x: riserPositionFromDrummer.x,
    y: riserPositionFromDrummer.y - 60 * sz.riserScale,
    rot: 180,
  } : null;

  return (
    <div className="sp-stage-wrap" ref={exportRef}>
      <svg viewBox={`-20 -20 ${STAGE_W + 40} ${viewH}`}
           xmlns="http://www.w3.org/2000/svg"
           className="sp-stage" preserveAspectRatio="xMidYMid meet">
        <rect x="-20" y="-20" width={STAGE_W + 40} height={viewH} fill={c.bg} />

        <text x={STAGE_W / 2} y="-6" textAnchor="middle" fontSize="9"
              fontFamily="ui-monospace,monospace" fill={c.muted}
              letterSpacing="0.18em">↑ UPSTAGE  ·  BACKLINE WALL</text>

        {/* Stage floor */}
        {shapeData.round ? (
          <ellipse cx={STAGE_W / 2} cy={STAGE_H / 2}
                   rx={STAGE_W / 2 - 20} ry={STAGE_H / 2 - 20}
                   fill={c.stage} stroke={c.stageEdge} strokeWidth="2.5" />
        ) : (
          <path d={shapeData.outline} fill={c.stage} stroke={c.stageEdge}
                strokeWidth="2.5" />
        )}

        {showGrid && (
          <g opacity="0.4">
            {Array.from({ length: 10 }, (_, i) => (
              <line key={`v${i}`} x1={(i + 1) * 100} y1="0"
                    x2={(i + 1) * 100} y2={STAGE_H}
                    stroke={c.subtle} strokeWidth="0.5" strokeDasharray="3 3" />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={(i + 1) * 100}
                    x2={STAGE_W} y2={(i + 1) * 100}
                    stroke={c.subtle} strokeWidth="0.5" strokeDasharray="3 3" />
            ))}
            <text x={STAGE_W - 4} y="14" textAnchor="end" fontSize="7"
                  fontFamily="ui-monospace,monospace" fill={c.muted}>
              {sz.deck.toUpperCase()} DECK
            </text>
          </g>
        )}

        <line x1={STAGE_W / 2} y1="0" x2={STAGE_W / 2} y2={STAGE_H}
              stroke={c.subtle} strokeWidth="0.8" strokeDasharray="6 5"
              opacity="0.5" />
        <text x={STAGE_W / 2 + 4} y={STAGE_H - 8} fontSize="7"
              fontFamily="ui-monospace,monospace" fill={c.muted}
              opacity="0.7">⎯ CL ⎯</text>

        <text x="14" y={STAGE_H / 2} fontSize="10" fontFamily="ui-monospace,monospace"
              fill={c.muted} writingMode="vertical-rl" letterSpacing="0.2em">
          STAGE RIGHT
        </text>
        <text x={STAGE_W - 8} y={STAGE_H / 2} fontSize="10"
              fontFamily="ui-monospace,monospace" fill={c.muted}
              writingMode="vertical-rl" letterSpacing="0.2em">
          STAGE LEFT
        </text>

        {/* Risers — draggable. Render before musicians so drum kit sits on top. */}
        <g opacity={emphFor(plotType, 'perf')}>
          {(extras.risers || []).map((r) => (
            <Riser key={r.id} r={r} c={c}
                   onMove={(nx, ny) => onRiserMove(r.id, nx, ny)} />
          ))}
        </g>

        {/* Power drops — draggable */}
        <g opacity={emphFor(plotType, 'pwr')}>
          {(extras.powerDropList || []).map((p) => (
            <DraggableG key={p.id} x={p.x} y={p.y}
                        onMove={(nx, ny) => onPowerMove(p.id, nx, ny)}
                        cursor="grab">
              <PowerIcon c={c} />
            </DraggableG>
          ))}
        </g>

        {/* Drumfill */}
        {drumfill && (
          <g opacity={emphFor(plotType, 'mon')}>
            <WedgeIcon {...drumfill} c={c} label="DRUMFILL" />
          </g>
        )}

        {/* Sidefills */}
        <g opacity={emphFor(plotType, 'mon')}>
          {sidefills.map((s, i) => (
            <g key={`sf${i}`}>
              <rect x={s.x - 14} y={s.y - 22} width="28" height="44" rx="2"
                    fill={c.panel2} stroke={c.muted} strokeWidth="1" />
              <line x1={s.x - 10} y1={s.y - 10} x2={s.x + 10} y2={s.y - 10}
                    stroke={c.muted} strokeWidth="0.8" />
              <line x1={s.x - 10} y1={s.y} x2={s.x + 10} y2={s.y}
                    stroke={c.muted} strokeWidth="0.8" />
              <line x1={s.x - 10} y1={s.y + 10} x2={s.x + 10} y2={s.y + 10}
                    stroke={c.muted} strokeWidth="0.8" />
              <text x={s.x} y={s.y - 27} textAnchor="middle" fontSize="6"
                    fontFamily="ui-monospace,monospace" fill={c.muted}>SIDEFILL</text>
            </g>
          ))}
        </g>

        {/* Musicians + gear (draggable) */}
        {musicians.map((m) => {
          const xy = musicianXY(m);
          return (
            <DraggableMusician key={m.id} m={m} posXY={xy} c={c}
                               plotType={plotType} onDrag={onMusicianMove} />
          );
        })}

        {/* Logo (data URL) — embedded in SVG so PNG export includes it */}
        {show.logoDataUrl && (
          <g>
            <image href={show.logoDataUrl} x={20} y={STAGE_H - 90} width="80"
                   height="80" preserveAspectRatio="xMidYMid meet" />
          </g>
        )}

        {/* Audience strip */}
        <g transform={`translate(0 ${STAGE_H + (shapeData.viewExtend || 0) + 20})`}>
          <rect x="0" y="0" width={STAGE_W} height="36" fill={c.panel2}
                stroke={c.border} strokeWidth="0.5" />
          <text x={STAGE_W / 2} y="22" textAnchor="middle" fontSize="11"
                fontFamily="ui-monospace,monospace" fill={c.muted}
                letterSpacing="0.32em">▾  A U D I E N C E  ▾</text>
        </g>

        {/* Plot type watermark */}
        {plotType !== 'full' && (
          <g>
            <rect x={STAGE_W - 130} y={STAGE_H - 36} width="118" height="22" rx="3"
                  fill={c.accent} opacity="0.92" />
            <text x={STAGE_W - 71} y={STAGE_H - 21} textAnchor="middle" fontSize="10"
                  fontWeight="700" fontFamily="ui-monospace,monospace" fill="#000"
                  letterSpacing="0.14em">
              {PLOT_TYPES[plotType].label.toUpperCase()} VIEW
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

Object.assign(window, { StageCanvas, STAGE_W, STAGE_H, musicianXY });
