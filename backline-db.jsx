// backline-db.jsx — curated database of common backline brands & models, plus
// a category resolver so each row's BRAND/MODEL field gets context-aware
// autocomplete based on what the user typed in ITEM.

const BACKLINE_DB = {
  drumKits: [
    'DW Performance Series · 22/10/12/16',
    "DW Collector's Series Maple · 22/10/12/16",
    'DW Design Series · 22/10/12/16',
    'Yamaha Stage Custom Birch · 22/10/12/16',
    'Yamaha Recording Custom · 22/10/12/14',
    'Yamaha Absolute Hybrid Maple · 22/10/12/16',
    'Pearl Masters Maple Complete · 22/10/12/16',
    'Pearl Reference Pure · 22/10/12/16',
    'Pearl Decade Maple · 22/10/12/16',
    'Tama Starclassic Walnut/Birch · 22/10/12/16',
    'Tama Superstar Classic · 22/10/12/16',
    'Tama Imperialstar · 22/10/12/16',
    'Ludwig Classic Maple · 22/10/12/16',
    'Ludwig Neusonic · 22/12/14/16',
    'Gretsch USA Custom · 22/10/12/16',
    'Gretsch Catalina Maple · 22/10/12/16',
    'Sonor SQ2 · 22/10/12/14',
    'Sonor AQ2 · 22/10/12/16',
    'Mapex Mars Birch · 22/10/12/16',
    'Mapex Saturn V · 22/10/12/14',
  ],
  snares: [
    'Ludwig Black Beauty LB417 · 14×6.5',
    'Ludwig Supraphonic LM402 · 14×6.5',
    'Ludwig Supraphonic LM400 · 14×5',
    'Ludwig Acrolite · 14×5',
    'Pearl Free Floating Brass · 14×6.5',
    'Pearl Sensitone Heritage Alloy · 14×6.5',
    'Tama Bell Brass · 14×6.5',
    'Tama Starphonic Maple · 14×6',
    "DW Collector's Maple · 14×6",
    "DW Performance Steel · 14×6.5",
    'Yamaha Recording Custom Brass · 14×5.5',
    'Gretsch USA Bell Brass · 14×6.5',
    'Sonor AQ2 Maple · 14×6',
    'Sonor SQ2 · 14×6.5',
    'Slingerland Radio King · 14×6.5',
    'Craviotto Solid Maple · 14×6',
  ],
  cymbals: [
    'Zildjian K Custom · 14/16/18/21',
    'Zildjian K Constantinople · 14/18/20/22',
    'Zildjian A Custom · 14/16/18/20',
    'Zildjian A Avedis · 14/16/18/22',
    'Sabian HHX Evolution · 14/16/18/21',
    'Sabian AAX · 14/16/18/20',
    'Sabian HH Vanguard · 14/18/20/22',
    'Meinl Byzance Vintage · 14/16/18/20',
    'Meinl Byzance Extra Dry · 14/16/18/20',
    'Paiste 2002 · 14/16/18/22',
    'Paiste Signature Traditionals · 14/18/20/22',
    'Istanbul Agop Mel Lewis · 14/18/20/22',
    'Istanbul Agop Signature · 14/16/18/20',
  ],
  hardware: [
    'Pearl Eliminator Demon Drive',
    'Pearl Eliminator Redline',
    'DW 9000 Series Pedal',
    'DW 5000 Series Pedal',
    'Tama Speed Cobra HP910',
    'Tama Iron Cobra HP900',
    'Yamaha FP9500D',
    'Axis A Longboard',
    'Mapex Falcon',
    'Pearl Eliminator Hi-Hat H2050',
    'DW 9500 Hi-Hat Stand',
  ],
  thrones: [
    'Roc-N-Soc Manual Spindle',
    'Roc-N-Soc Nitro',
    'Roc-N-Soc Hugger',
    'DW 9100M Tractor',
    'Tama 1st Chair Ergo-Rider',
    'Pearl Roadster D-3500',
    'Gibraltar 9608 Moto Style',
  ],
  bassHeads: [
    'Ampeg SVT-CL · 300W tube',
    'Ampeg SVT-VR · 300W tube',
    'Ampeg SVT-7 PRO · 1000W hybrid',
    'Ampeg PF-800 · 800W class D',
    'Aguilar Tone Hammer 700',
    'Aguilar DB 751',
    'Mesa Subway D-800+',
    'Mesa Subway WD-800',
    'Markbass Little Mark III · 500W',
    'Markbass Big Bang · 500W',
    'Gallien-Krueger MB800 Fusion',
    'Gallien-Krueger 800RB',
    'Fender Bassman 800',
    'Orange AD200B MK3 · 200W tube',
    'Orange Terror Bass · 500W',
    'Trace Elliot Elf · 200W',
    'Darkglass Microtubes 900',
    'Darkglass M900v2',
    'Eden WT-800',
    'TC Electronic BH800',
  ],
  bassCabs: [
    'Ampeg SVT-810E · 8×10',
    'Ampeg SVT-810AV · 8×10',
    'Ampeg SVT-410HLF · 4×10',
    'Ampeg PF-115HE · 1×15',
    'Mesa Subway 4×10',
    'Mesa Subway 1×15',
    'Aguilar DB 410',
    'Aguilar DB 212',
    'Aguilar SL 112',
    'Markbass Standard 104HR · 4×10',
    'Markbass NY 122',
    'Gallien-Krueger Neo 412-II · 4×12',
    'Gallien-Krueger Neo 410-III · 4×10',
    'Bergantino NXT212',
    'Bergantino HDN210',
    'TC Electronic RS210',
  ],
  bassGuitars: [
    'Fender American Pro II Precision Bass',
    'Fender American Pro II Jazz Bass',
    'Fender American Ultra Jazz Bass V',
    'Fender Player Jazz Bass',
    'Music Man StingRay 4',
    'Music Man StingRay 5',
    'Music Man Sterling',
    'Rickenbacker 4003',
    'Lakland 44-94 Deluxe',
    'Lakland Skyline 55-02',
    'Sadowsky NYC Standard 5',
    'Sadowsky MetroLine RV5',
    'Spector Euro 5LX',
    'Spector NS-2',
    'Warwick Streamer Stage I',
    'Warwick Thumb Bolt-On',
    'Ibanez SR1000',
    'Ernie Ball Music Man Bongo',
    'G&L L-2000',
  ],
  guitarAmps: [
    "Fender Twin Reverb '65 RI · 85W",
    "Fender Deluxe Reverb '65 RI · 22W",
    "Fender Princeton Reverb '65 RI · 12W",
    'Fender Hot Rod Deluxe IV · 40W',
    'Fender Hot Rod DeVille 410 · 60W',
    'Fender Bassbreaker 18/30 · 30W',
    'Vox AC30C2 · 30W',
    'Vox AC15C1 · 15W',
    'Vox AC10C1 · 10W',
    'Marshall JCM800 2203 · 100W head',
    'Marshall JCM900 4100 · 100W head',
    'Marshall DSL40CR · 40W combo',
    'Marshall Origin 50C · 50W combo',
    'Marshall Plexi Super Lead 1959 · 100W head',
    'Mesa Boogie Mark V · 90W',
    'Mesa Boogie Dual Rectifier · 100W',
    'Mesa Boogie Lone Star · 100W',
    'Mesa Boogie California Tweed · 40W',
    'Mesa Boogie Mark VII · 90W head',
    'Orange Rockerverb MKIII · 100W head',
    'Orange OR15H · 15W head',
    'Orange TH30 · 30W combo',
    'Friedman BE-100 Deluxe · 100W head',
    'Friedman Smallbox 50 · 50W head',
    'Friedman Runt 20 · 20W combo',
    'Bogner Shiva · 80W head',
    'Bogner Ecstasy 101B',
    'PRS Archon · 100W head',
    'PRS HXDA · 50W head',
    'Hiwatt DR103 Custom · 100W head',
    'Two Rock Studio Pro 35 · 35W combo',
    'Two Rock Classic Reverb Signature',
    'Magnatone Super 59 · 45W combo',
    'Magnatone Twilighter Stereo',
    'Roland JC-120 · 120W combo',
    'Matchless DC30 · 30W',
    'Matchless Lightning · 15W',
    'Tone King Imperial MKII · 20W combo',
    'Suhr Bella Reverb · 22W combo',
    'Diezel VH4 · 100W head',
  ],
  guitarCabs: [
    'Marshall 1960A · 4×12 angled',
    'Marshall 1960B · 4×12 straight',
    'Marshall 1936 · 2×12',
    'Mesa Boogie Rectifier 4×12 Standard',
    'Mesa Boogie 1×12 Thiele',
    'Orange PPC212 · 2×12',
    'Orange PPC412 · 4×12',
    'Friedman 2×12 Vintage',
    'Vox V212C · 2×12',
    'Bogner OS 4×12',
    'Two-Rock 2×12 Signature',
  ],
  electricGuitars: [
    'Fender American Pro II Stratocaster',
    'Fender American Pro II Telecaster',
    'Fender American Ultra Stratocaster HSS',
    "Fender American Vintage II '61 Strat",
    "Fender '62 Telecaster Custom RI",
    'Fender Player Stratocaster',
    'Gibson Les Paul Standard 60s',
    'Gibson Les Paul Custom',
    'Gibson SG Standard',
    'Gibson ES-335',
    'Gibson ES-339',
    'Gibson Flying V',
    'Gibson Explorer',
    'PRS Custom 24',
    'PRS McCarty 594',
    'PRS Silver Sky',
    'Gretsch G6128T Duo Jet',
    'Gretsch G6120T Players Edition',
    'Rickenbacker 360',
    'Rickenbacker 330',
    "Fender Jazzmaster American Pro II",
    'Fender Mustang \'69 RI',
    'Jackson Pro Soloist',
    'ESP LTD EC-1000',
    'Suhr Modern Pro',
    'Tom Anderson Drop Top',
  ],
  acousticGuitars: [
    'Martin D-28',
    'Martin OM-28',
    'Martin HD-35',
    'Martin 000-15M',
    'Taylor 814ce',
    'Taylor 314ce',
    'Taylor 614ce',
    'Taylor GS Mini-e Koa',
    'Gibson J-45',
    'Gibson Hummingbird',
    'Gibson Songwriter Standard',
    'Guild D-55',
    'Guild M-20',
    'Collings D2H',
    'Yamaha LL16 ARE',
  ],
  keyboards: [
    'Nord Stage 4 · 88',
    'Nord Stage 4 Compact · 73',
    'Nord Stage 3 · 88',
    'Nord Stage 3 Compact · 73',
    'Nord Electro 6D · 73',
    'Nord Wave 2',
    'Nord Grand · 88 WK',
    'Yamaha Montage M8x · 88',
    'Yamaha CP88',
    'Yamaha CP73',
    'Yamaha MODX8+ · 88',
    'Korg Nautilus 88',
    'Korg Kronos 2 · 88',
    'Korg Kronos LS · 88',
    'Korg Grandstage 88',
    'Roland Fantom 8 EX · 88',
    'Roland RD-2000 · 88',
    'Roland Jupiter-X',
    'Roland VR-09 · 61',
    'Sequential Prophet-10',
    'Sequential Take 5',
    'Moog One · 16-voice',
    'Moog Matriarch',
    'Hammond SK Pro · 73',
    'Hammond XK-5',
    'Crumar Mojo 61',
    'Viscount Legend Solo',
    'Studiologic Numa X Piano GT',
  ],
  keysStands: [
    'K&M Omega 18810 · 2-tier',
    'K&M Spider Pro · single',
    'Ultimate Support Apex AX-48 Pro',
    'Ultimate Support IQ-3000 · 2-tier',
    'Quik-Lok Z-728 · 2-tier',
    'On-Stage KS7350 · 2-tier',
    'On-Stage KS7191 · double-X',
    'Hercules KS410B',
  ],
  sustainPedals: [
    'Yamaha FC3A · half-damper',
    'Korg DS-1H · half-damper',
    'Roland DP-10',
    'M-Audio SP-2',
    'Nord Sustain Pedal',
    'Studiologic VFP-1/15',
  ],
  micStands: [
    'K&M 210/9 · tall boom',
    'K&M 259 · short straight',
    'K&M 25950 · low boom',
    'K&M 25600 · overhead',
    'Atlas MS-25 · heavy boom',
    'Triad-Orbit T2/M2',
    'Triad-Orbit T3/M2',
    'On-Stage MS7701B · tripod boom',
    'On-Stage MS9701TB+ · heavy boom',
  ],
  vocalMics: [
    'Shure Beta 58A',
    'Shure SM58',
    'Shure SM7B',
    'Shure KSM8 Dualdyne',
    'Shure KSM9',
    'Sennheiser e935',
    'Sennheiser e945',
    'Sennheiser MD431-II',
    'Audix OM5',
    'Audix OM7',
    'Neumann KMS 105',
    'Telefunken M80',
    'Earthworks SR314',
    'DPA d:facto 4018',
    'Heil PR35',
  ],
  drumMics: [
    'Shure Beta 91A · kick in',
    'Shure Beta 52A · kick out',
    'AKG D6 · kick',
    'Audix D6 · kick',
    'Shure SM57 · snare top',
    'Sennheiser e604 · toms',
    'Sennheiser e904 · toms',
    'Audix D2/D4 · toms',
    'Shure KSM32 · overhead',
    'Shure KSM137 · overhead/hat',
    'Neumann KM184 · overhead',
    'AKG C414 XLII · overhead',
    'Earthworks DM6 · drum kit',
  ],
  instrumentMics: [
    'Shure SM57 · amp',
    'Sennheiser e906 · amp',
    'Sennheiser MD421 · amp',
    'Royer R-121 · ribbon',
    'Coles 4038 · ribbon',
    'AKG C414 XLII',
    'Neumann KM184',
    'Audix i5 · amp',
  ],
  iemPacks: [
    'Shure PSM 1000 (P10R+ receiver)',
    'Shure PSM 900 (P9RA receiver)',
    'Shure PSM 300 (P3RA receiver)',
    'Sennheiser EW IEM G4',
    'Sennheiser EW-DP IEM',
    'Sennheiser SR 2050 IEM',
    'Lectrosonics M2T/M2R',
    'Wisycom MPR50-IEM',
  ],
  wirelessSystems: [
    'Shure Axient Digital (AD4Q + AD2/B58)',
    'Shure ULX-D (ULXD4Q + ULXD2/B58)',
    'Shure QLX-D · QLXD2/B58',
    'Shure SLX-D',
    'Sennheiser EW-DX',
    'Sennheiser EW-D',
    'Sennheiser Digital 6000',
    'Lectrosonics Digital Hybrid',
    'Audio-Technica 3000 Series',
  ],
  DIs: [
    'Radial JDI Passive',
    'Radial J48 Active',
    'Radial Pro DI Passive',
    'Radial ProD2 Stereo',
    'Countryman Type 85',
    'Avalon U5',
    'BSS AR-133',
    'Whirlwind IMP 2',
    'Klark Teknik DN100',
  ],
  djControllers: [
    'Pioneer CDJ-3000 (x2) + DJM-A9',
    'Pioneer CDJ-3000 (x2) + DJM-V10',
    'Pioneer CDJ-2000 NXS2 (x2) + DJM-900 NXS2',
    'Pioneer DDJ-1000',
    'Pioneer DDJ-FLX10',
    'Pioneer Opus-Quad',
    'Pioneer XDJ-RX3',
    'Denon SC6000 (x2) + X1850 PRIME',
    'Denon Prime 4+',
    'Rane One',
    'Rane Twelve MK2 + Seventy-Two MKII',
    'Native Instruments S4 MK3',
    'Native Instruments S8 MK2',
  ],
};

// Common item names (for the ITEM column datalist).
const BACKLINE_ITEMS = [
  'Drum kit', 'Snare', 'Cymbals', 'Hardware', 'Throne', 'Kick pedal',
  'Hi-hat stand', 'Bass amp', 'Bass cab', 'Bass guitar', 'Guitar amp',
  'Guitar cab', 'Electric guitar', 'Acoustic guitar', 'Keyboard', 'Keys stand',
  'Sustain pedal', 'Mic stand', 'Vocal mic', 'Drum mic', 'Instrument mic',
  'IEM pack', 'Wireless system', 'DI box', 'DJ controller', 'Mixer',
  'Riser', 'Patch bay', 'Snake', 'Power conditioner',
];

// Resolve which DB category a row belongs to based on its ITEM text.
function backlineCategoryFor(item) {
  const i = (item || '').toLowerCase().trim();
  if (!i) return 'all';
  if (/\b(drum\s*kit|kit|drums)\b/.test(i) && !/snare|cymbal/.test(i)) return 'drumKits';
  if (/snare/.test(i)) return 'snares';
  if (/cymbal/.test(i)) return 'cymbals';
  if (/throne|stool/.test(i)) return 'thrones';
  if (/hi-?hat\s*stand/.test(i)) return 'hardware';
  if (/(kick\s*pedal|bass\s*pedal|hardware|double\s*pedal)/.test(i)) return 'hardware';
  if (/sustain/.test(i)) return 'sustainPedals';
  if (/bass\s*(amp|head)/.test(i)) return 'bassHeads';
  if (/bass\s*cab/.test(i)) return 'bassCabs';
  if (/bass(\s|$)/.test(i)) return 'bassGuitars';
  if (/(gtr|guitar)\s*amp/.test(i)) return 'guitarAmps';
  if (/(gtr|guitar)\s*cab/.test(i)) return 'guitarCabs';
  if (/acoustic/.test(i)) return 'acousticGuitars';
  if (/guitar|gtr/.test(i)) return 'electricGuitars';
  if (/(keyboard|keys|piano|organ|synth)\s*stand/.test(i)) return 'keysStands';
  if (/keyboard|piano|organ|synth/.test(i)) return 'keyboards';
  if (/keys(\s|$)/.test(i)) return 'keyboards';
  if (/mic\s*stand/.test(i)) return 'micStands';
  if (/(iem|in.?ear)/.test(i)) return 'iemPacks';
  if (/wireless/.test(i)) return 'wirelessSystems';
  if (/\bdi(\s|box|$)/.test(i)) return 'DIs';
  if (/dj|controller|cdj|turntable|mixer/.test(i)) return 'djControllers';
  if (/drum\s*mic|kick\s*mic|snare\s*mic|tom\s*mic|overhead/.test(i)) return 'drumMics';
  if (/vocal\s*mic|bgv\s*mic/.test(i)) return 'vocalMics';
  if (/instrument\s*mic|amp\s*mic|horn\s*mic/.test(i)) return 'instrumentMics';
  if (/mic\b/.test(i)) return 'vocalMics';
  return 'all';
}

// Precomputed list of every model across categories — used for the "all" fallback.
const BACKLINE_ALL = [...new Set(
  Object.values(BACKLINE_DB).flat()
)];

// Render the datalists once. Each row's BRAND/MODEL input references one by
// the resolved category ID.
const BacklineDatalists = React.memo(function BacklineDatalists() {
  return (
    <>
      <datalist id="sp-bldb-items">
        {BACKLINE_ITEMS.map((it) => <option key={it} value={it} />)}
      </datalist>
      {Object.entries(BACKLINE_DB).map(([cat, opts]) => (
        <datalist key={cat} id={`sp-bldb-${cat}`}>
          {opts.map((o) => <option key={o} value={o} />)}
        </datalist>
      ))}
      <datalist id="sp-bldb-all">
        {BACKLINE_ALL.map((o) => <option key={o} value={o} />)}
      </datalist>
    </>
  );
});

Object.assign(window, {
  BACKLINE_DB, BACKLINE_ITEMS, backlineCategoryFor, BacklineDatalists,
});
