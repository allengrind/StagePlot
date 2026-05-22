# Stage Plot Generator

A self-contained, browser-based stage plot generator for live bands. Builds a top-down illustrated stage diagram, an editable input list (channel list), and a backline equipment list from a single editable form — exports to PNG and PDF.

## Features

- **Stage Plot** — top-down illustrated diagram with drum kit, amps, wedges, IEMs, DI boxes, pedalboards, sidefills, drumfill, mics
  - Drag-and-drop musicians, AC drops, and risers directly on stage
  - Position presets (DSC, DSR, USL, etc.) or fully custom coords
  - Stage sizes: Festival / Theater / Club (drum riser auto-scales)
  - Stage shapes: Wide / Box / Thrust
  - Plot views: Full / FOH / Monitors (dims irrelevant gear)
  - Toggleable grid with measurements
  - Light + dark themes, 4 brand color presets
  - Band logo upload (embedded in SVG so it exports cleanly)
- **Input List** — auto-generated from lineup, fully editable
  - Per-row channel #, source, mic/DI, stand, actor, notes
  - Microphone catalog: **Shure, Sennheiser, Audio-Technica, Beyerdynamic, Audix, AKG, DPA** + Neumann, Royer, Electro-Voice, Coles, Earthworks, Telefunken, Heil
  - Contextual autocomplete — typing "Kick In" suggests Beta 91A / D6 / etc; "Snare Top" suggests SM57 / e604 / etc
  - Source autocomplete (Kick In, Snare Top, OH L/R, Bass DI, Guitar 1, Keys L/R, Lead Vocal, BGV…)
  - Actor dropdown of all lineup members
  - Drag-reorder, add/remove rows, regenerate from lineup
- **Backline** — equipment list with curated brand/model database
  - Drum kits (DW, Yamaha, Pearl, Tama, Ludwig, Gretsch, Sonor, Mapex)
  - Snares, cymbals, hardware, thrones
  - Bass heads + cabs (Ampeg, Aguilar, Mesa, Markbass, GK, Orange, Darkglass…)
  - Guitar amps + cabs (Fender, Vox, Marshall, Mesa, Orange, Friedman, Bogner, PRS, Hiwatt, Two Rock, Magnatone…)
  - Electric + acoustic guitars
  - Keyboards (Nord, Yamaha, Korg, Roland, Sequential, Moog, Hammond…)
  - Keys stands, sustain pedals, mic stands, IEM packs, wireless systems, DI boxes, DJ controllers
  - Owner tags (Band / House / Venue / Rented) with color coding
- **Tweaks panel** — live design controls for theme, brand color, stage shape/size/scale, plot view, grid, tab visibility
- **Exports** — PNG (2× SVG rasterization) and PDF (native browser print with print stylesheet)

## How to run

It's a single HTML file. Just open `index.html` in any modern browser — no build step, no server.

For local hosting:
```bash
npx serve .
# or
python3 -m http.server 8000
```

## File structure

| File | Purpose |
|------|---------|
| `index.html` | **Inlined bundle** — everything in one file (CSS + JSX) for offline use |
| `app.jsx` | Main React app: state, layout, tabs, exports |
| `stage.jsx` | SVG stage canvas + illustrated icons + draggable wrapper |
| `form.jsx` | Show details + musicians + extras editor |
| `input-list.jsx` | Editable channel list table |
| `backline.jsx` | Editable backline (equipment) list |
| `mic-db.jsx` | Mic catalog organized by source type |
| `backline-db.jsx` | Backline catalog organized by equipment type |
| `constants.jsx` | Roles, positions, defaults, role→channels generator |
| `tweaks-panel.jsx` | Floating tweak controls (theme, brand color, etc.) |
| `styles.css` | All styling |

The source `.jsx` files use [in-browser Babel](https://babeljs.io/docs/babel-standalone) — no build pipeline. The bundled `Stage Plot Generator.html` inlines all `.jsx` and `.css` for fully offline operation.

## Stack

- React 18 (UMD, via unpkg)
- Babel Standalone 7 (in-browser JSX transform)
- Vanilla CSS with custom properties for theming
- No bundler, no npm install, no server required

## License

MIT — use it for your shows.
