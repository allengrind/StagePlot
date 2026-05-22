// constants.jsx — role catalog, mic library, position presets, defaults.

const ROLES = {
  vocal:   { label: 'Lead Vocal',   color: '#ef476f', short: 'VOX',  inst: 'vocal' },
  bgv:     { label: 'Backing Vox',  color: '#c77dff', short: 'BGV',  inst: 'vocal' },
  guitar:  { label: 'Lead Guitar',  color: '#f78c2a', short: 'GTR',  inst: 'guitar' },
  rguitar: { label: 'Rhythm Guitar',color: '#ffb347', short: 'RGT',  inst: 'guitar' },
  bass:    { label: 'Bass',         color: '#ffd166', short: 'BAS',  inst: 'bass' },
  drums:   { label: 'Drums',        color: '#06d6a0', short: 'DRM',  inst: 'drums' },
  keys:    { label: 'Keys',         color: '#6c8cff', short: 'KEY',  inst: 'keys' },
  perc:    { label: 'Percussion',   color: '#4ecdc4', short: 'PRC',  inst: 'perc' },
  horns:   { label: 'Horns',        color: '#f4a261', short: 'HRN',  inst: 'horns' },
  dj:      { label: 'DJ / Tracks',  color: '#a78bfa', short: 'DJ',   inst: 'keys' },
};

const ROLE_KEYS = Object.keys(ROLES);

// Festival stage coordinate system: 1000 wide × 600 deep.
// Audience is at bottom (y = 600), backstage at top (y = 0).
// Stage Left from performer POV = audience's right (higher x).
// Positions named from audience POV per industry convention.
const POSITIONS = {
  // Downstage (front, near audience)
  'DSR2': { x:  80, y: 470, label: 'Stage Right 2' },
  'DSR':  { x: 220, y: 470, label: 'Stage Right' },
  'DSC':  { x: 500, y: 480, label: 'Down Center' },
  'DSL':  { x: 780, y: 470, label: 'Stage Left' },
  'DSL2': { x: 920, y: 470, label: 'Stage Left 2' },
  // Center stage
  'CSR':  { x: 220, y: 340, label: 'Center Right' },
  'CSC':  { x: 500, y: 340, label: 'Center' },
  'CSL':  { x: 780, y: 340, label: 'Center Left' },
  // Upstage / riser
  'USR':  { x: 250, y: 200, label: 'Upstage Right' },
  'RISER':{ x: 500, y: 180, label: 'Drum Riser' },
  'USL':  { x: 750, y: 200, label: 'Upstage Left' },
};

const POSITION_KEYS = Object.keys(POSITIONS);

// Stage size presets. Same viewBox; what changes is the labeled dimensions,
// drum riser size, and how many position presets feel "natural". Keeping one
// viewBox keeps icon sizes consistent across presets so the drum kit doesn't
// shrink when the deck shrinks.
const STAGE_SIZES = {
  festival: { label: 'Festival',  deck: "60' \u00d7 36'", riser: "8' \u00d7 8' \u00d7 24\"", riserScale: 1.0 },
  theater:  { label: 'Theater',   deck: "40' \u00d7 28'", riser: "8' \u00d7 8' \u00d7 16\"", riserScale: 0.85 },
  club:     { label: 'Club',      deck: "24' \u00d7 16'", riser: 'floor mount',          riserScale: 0.7 },
};

// Plot views. Each highlights a subset of equipment by dimming the rest.
const PLOT_TYPES = {
  full:    { label: 'Full',     emphasize: ['perf', 'mic', 'mon', 'di', 'amp', 'ped', 'pwr'] },
  monitor: { label: 'Monitors', emphasize: ['perf', 'mon', 'iem'] },
  foh:     { label: 'FOH',      emphasize: ['perf', 'mic', 'di', 'amp'] },
};

// Backline generators per role. Returns array of equipment rows.
function backlineForRole(role, name) {
  switch (role) {
    case 'drums': return [
      { item: 'Drum kit', detail: 'DW Performance 5pc · 22/10/12/16', owner: 'Band', note: 'house cymbals ok' },
      { item: 'Snare',    detail: 'Ludwig Black Beauty 14×6.5',     owner: 'Band', note: '' },
      { item: 'Hardware', detail: 'Pearl Eliminator pedals + boom arms', owner: 'Band', note: '' },
      { item: 'Throne',   detail: 'Roc-N-Soc Manual Spindle',         owner: 'Band', note: '' },
    ];
    case 'bass': return [
      { item: 'Bass amp', detail: 'Ampeg SVT-CL head',                owner: 'Venue', note: 'band brings preamp pedal' },
      { item: 'Bass cab', detail: 'Ampeg 8×10',                       owner: 'Venue', note: '' },
    ];
    case 'guitar': return [
      { item: 'Guitar amp', detail: 'Fender Twin Reverb ’65 RI',     owner: 'Rented', note: 'on caster board' },
    ];
    case 'rguitar': return [
      { item: 'Guitar amp', detail: 'Vox AC30',                       owner: 'Band',  note: '' },
    ];
    case 'keys': return [
      { item: 'Keyboard',     detail: 'Nord Stage 3 · 88',            owner: 'Band',  note: 'stereo out' },
      { item: 'Keys stand',   detail: 'K&M Omega 2-tier',             owner: 'Band',  note: '' },
      { item: 'Sustain pedal',detail: 'Yamaha FC3A',                  owner: 'Band',  note: '' },
    ];
    case 'dj': return [
      { item: 'DJ controller',detail: 'Pioneer DDJ-1000',             owner: 'Band',  note: 'USB-C to laptop' },
    ];
    case 'vocal': return [
      { item: 'Vocal mic',    detail: 'Shure Beta 58A',               owner: 'House', note: 'wired' },
      { item: 'Mic stand',    detail: 'K&M boom · round base',         owner: 'House', note: '' },
    ];
    case 'bgv': return [
      { item: 'BGV mic',      detail: 'Shure SM58',                   owner: 'House', note: '' },
      { item: 'Mic stand',    detail: 'K&M boom',                     owner: 'House', note: '' },
    ];
    case 'horns': return [
      { item: 'Horn stand',   detail: 'sax peg + trumpet pegs',       owner: 'Band',  note: '' },
    ];
    case 'perc': return [
      { item: 'Perc rig',     detail: 'congas + bongos + LP tree',    owner: 'Band',  note: '' },
    ];
    default: return [];
  }
}

// Channel generators per role/instrument. Returns array of channel rows.
function channelsForRole(role, name) {
  const n = name || ROLES[role].label;
  switch (role) {
    case 'drums': return [
      { src: 'Kick In',    mic: 'Beta 91A',   note: 'inside kick', actor: n, stand: '—' },
      { src: 'Kick Out',   mic: 'D6',         note: 'outside',     actor: n, stand: 'short' },
      { src: 'Snare Top',  mic: 'SM57',       note: '',            actor: n, stand: 'clip' },
      { src: 'Snare Btm',  mic: 'e604',       note: 'phase rev',   actor: n, stand: 'clip' },
      { src: 'Hi-Hat',     mic: 'KSM137',     note: '',            actor: n, stand: 'tall' },
      { src: 'Rack Tom',   mic: 'e604',       note: '',            actor: n, stand: 'clip' },
      { src: 'Floor Tom',  mic: 'e604',       note: '',            actor: n, stand: 'clip' },
      { src: 'OH L',       mic: 'KSM32',      note: 'cardioid',    actor: n, stand: 'tall' },
      { src: 'OH R',       mic: 'KSM32',      note: 'cardioid',    actor: n, stand: 'tall' },
    ];
    case 'bass': return [
      { src: 'Bass DI',    mic: 'DI Active',  note: 'pre-amp tap', actor: n, stand: '—' },
      { src: 'Bass Mic',   mic: 'RE20',       note: 'on cab',      actor: n, stand: 'short' },
    ];
    case 'guitar':
    case 'rguitar': return [
      { src: `${ROLES[role].short} Amp`, mic: 'SM57', note: 'edge of cone', actor: n, stand: 'short' },
    ];
    case 'keys':
    case 'dj': return [
      { src: 'Keys L',     mic: 'DI Active',  note: 'stereo L',    actor: n, stand: '—' },
      { src: 'Keys R',     mic: 'DI Active',  note: 'stereo R',    actor: n, stand: '—' },
    ];
    case 'vocal': return [
      { src: 'Lead Vocal', mic: 'Beta 58A',   note: 'wireless ok', actor: n, stand: 'tall' },
    ];
    case 'bgv': return [
      { src: 'BGV',        mic: 'SM58',       note: '',            actor: n, stand: 'tall' },
    ];
    case 'horns': return [
      { src: 'Horn',       mic: 'e906',       note: 'on bell',     actor: n, stand: 'clip' },
    ];
    case 'perc': return [
      { src: 'Perc OH L',  mic: 'KSM32',      note: '',            actor: n, stand: 'tall' },
      { src: 'Perc OH R',  mic: 'KSM32',      note: '',            actor: n, stand: 'tall' },
    ];
    default: return [];
  }
}

// Default band for first load — 7-piece rock/pop touring act.
const DEFAULT_SHOW = {
  band: 'NORTHERN FAULT',
  show: 'Summer Mainstage Tour',
  date: '2026-07-18',
  venue: 'Festival Norte · Mexico City',
  contact: 'Mara Lozano · Tour Mgr · +52 55 4421 9087',
  engineer: 'David Pell · FOH / Monitors',
  power: '4× 20A circuits required · 1× isolated for backline',
};

const DEFAULT_MUSICIANS = [
  { id: 'm1', role: 'vocal',   name: 'Iris Vega',     pos: 'DSC',   gear: { wedges: 2, iem: true,  amp: false, pedalboard: false, di: false } },
  { id: 'm2', role: 'guitar',  name: 'Theo Marín',    pos: 'DSR',   gear: { wedges: 1, iem: false, amp: true,  pedalboard: true,  di: false } },
  { id: 'm3', role: 'rguitar', name: 'Sol Cárdenas',  pos: 'DSL',   gear: { wedges: 1, iem: false, amp: true,  pedalboard: true,  di: false } },
  { id: 'm4', role: 'bass',    name: 'Yuri Halász',   pos: 'DSL2',  gear: { wedges: 1, iem: false, amp: true,  pedalboard: true,  di: true  } },
  { id: 'm5', role: 'keys',    name: 'Aldo Reyes',    pos: 'DSR2',  gear: { wedges: 1, iem: true,  amp: false, pedalboard: false, di: true  } },
  { id: 'm6', role: 'bgv',     name: 'Mei Tanaka',    pos: 'CSC',   gear: { wedges: 1, iem: true,  amp: false, pedalboard: false, di: false } },
  { id: 'm7', role: 'drums',   name: 'Río Beltrán',   pos: 'RISER', gear: { wedges: 0, iem: true,  amp: false, pedalboard: false, di: false } },
];

const DEFAULT_EXTRAS = {
  sidefills: true,
  drumfill: true,
  powerDropList: [
    { id: 'p1', x: 120, y: 38 },
    { id: 'p2', x: 380, y: 38 },
    { id: 'p3', x: 620, y: 38 },
    { id: 'p4', x: 880, y: 38 },
  ],
  risers: [
    { id: 'r1', x: 500, y: 180, w: 160, h: 140, label: 'DRUM RISER', heightIn: 24 },
  ],
  notes: 'Backline shared with co-headliner. House drum kit OK; band brings cymbals + snare. 2× extra DI for guests during last song.',
};

function uid(prefix) {
  return prefix + Math.random().toString(36).slice(2, 8);
}

Object.assign(window, {
  ROLES, ROLE_KEYS, POSITIONS, POSITION_KEYS,
  STAGE_SIZES, PLOT_TYPES,
  channelsForRole, backlineForRole,
  DEFAULT_SHOW, DEFAULT_MUSICIANS, DEFAULT_EXTRAS,
  uid,
});
