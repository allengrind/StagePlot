// mic-db.jsx — curated mic database (Shure, Sennheiser, Audio-Technica,
// Beyerdynamic, Audix, AKG, DPA + Neumann, Royer, Electro-Voice for
// completeness). Contextual autocomplete for the INPUT LIST's MIC/DI column
// based on what the user typed in SOURCE.

const MIC_DB = {
  // Vocal (dynamic first — most common live — then condensers)
  vocal: [
    'Shure SM58',
    'Shure Beta 58A',
    'Shure SM58S',
    'Shure SM7B',
    'Shure SM7dB',
    'Shure KSM8 Dualdyne',
    'Shure KSM9',
    'Shure KSM9HS',
    'Sennheiser e835',
    'Sennheiser e845',
    'Sennheiser e935',
    'Sennheiser e945',
    'Sennheiser e965',
    'Sennheiser MD421-II',
    'Sennheiser MD431-II',
    'Sennheiser MD441-U',
    'Audio-Technica AE6100',
    'Audio-Technica AE5400',
    'Audio-Technica AE3300',
    'Audio-Technica ATM510',
    'Audio-Technica ATM710',
    'Beyerdynamic TG V70d',
    'Beyerdynamic M88 TG',
    'Beyerdynamic Opus 99',
    'Beyerdynamic TG V90r (ribbon)',
    'Beyerdynamic TG V96',
    'Audix OM5',
    'Audix OM7',
    'Audix VX5',
    'AKG D5',
    'AKG D7',
    'AKG C5',
    'AKG C535 EB',
    'AKG C414 XLII',
    'Neumann KMS 105',
    'Neumann KMS 104',
    'DPA d:facto 4018VL',
    'DPA d:facto 4018',
    'DPA 2028',
    'DPA 4099 Vocal (clip-on)',
    'Electro-Voice RE20',
    'Telefunken M80',
    'Heil PR35',
    'Earthworks SR314',
    'Earthworks SR40V',
  ],
  // Kick drum
  kick: [
    'Shure Beta 91A',
    'Shure Beta 52A',
    'Shure SM91',
    'Sennheiser e602-II',
    'Sennheiser e901 (boundary)',
    'Sennheiser e902',
    'Sennheiser MD421-II',
    'AKG D112 MKII',
    'AKG D12 VR',
    'Audix D6',
    'Audix D4 (sub-kick)',
    'Audio-Technica ATM250',
    'Audio-Technica AE2500 (dual capsule)',
    'Beyerdynamic TG D71c (boundary)',
    'Beyerdynamic M88 TG',
    'Electro-Voice RE20',
    'Yamaha SKRM-100 Subkick',
  ],
  // Snare top / bottom
  snare: [
    'Shure SM57',
    'Shure Beta 57A',
    'Shure Beta 56A',
    'Sennheiser e604',
    'Sennheiser e905',
    'Sennheiser MD441-U',
    'Audio-Technica ATM230',
    'Audio-Technica AE5100',
    'Audix i5',
    'Audix DP7 (clip-on)',
    'Beyerdynamic TG D57c',
    'Beyerdynamic M201 TG',
    'AKG C5900',
    'Telefunken M80-SH',
    'DPA 4055 (kick / snare)',
    'Neumann KM 184',
  ],
  // Toms (rack + floor)
  tom: [
    'Sennheiser e604',
    'Sennheiser e904',
    'Sennheiser MD421-II',
    'Audix D2 (rack tom)',
    'Audix D4 (floor tom)',
    'Audix DP7 (clip-on)',
    'Shure SM57',
    'Shure Beta 56A',
    'Shure Beta 98A (clip-on)',
    'Audio-Technica ATM230',
    'Beyerdynamic TG D35d',
    'Beyerdynamic Opus 88 (clip-on)',
    'AKG C518 ML (clip-on)',
    'DPA 4055 (clip-on)',
  ],
  // Hi-hat
  hat: [
    'Shure KSM137',
    'Shure SM81',
    'Shure Beta 181 (side-address)',
    'Sennheiser MKH 8040',
    'Sennheiser e914',
    'Audio-Technica AT4051b',
    'Audio-Technica AE5100',
    'Beyerdynamic MC 930',
    'AKG C451 B',
    'Neumann KM 184',
    'DPA 4011 (cardioid)',
    'DPA 2011',
    'DPA 4015 (wide cardioid)',
    'Earthworks SR20',
  ],
  // Overheads
  overhead: [
    'Shure KSM32',
    'Shure KSM137 (pair)',
    'Shure SM81 (pair)',
    'Sennheiser MKH 8040 (pair)',
    'Sennheiser e914 (pair)',
    'Audio-Technica AT4050',
    'Audio-Technica AT4051b (pair)',
    'AKG C414 XLII (pair)',
    'AKG C451 B (pair)',
    'AKG C214 (pair)',
    'Neumann KM 184 (pair)',
    'Neumann TLM 103',
    'Beyerdynamic MC 930 (pair)',
    'DPA 4011A (pair)',
    'DPA 2011 (pair)',
    'Earthworks SR40 (pair)',
    'Earthworks SR20LS (pair)',
    'Royer R-121 (ribbon, pair)',
    'Coles 4038 (ribbon, pair)',
  ],
  // Bass cab
  bassAmp: [
    'Shure Beta 52A',
    'Shure SM7B',
    'Shure SM57',
    'Sennheiser MD421-II',
    'Sennheiser e602-II',
    'Sennheiser e906',
    'Electro-Voice RE20',
    'Electro-Voice RE320',
    'AKG D112 MKII',
    'Audio-Technica ATM250',
    'Audix D6',
    'Beyerdynamic M88 TG',
    'Beyerdynamic Opus 99',
    'DPA 4055',
    'Neumann FET 47',
  ],
  // Guitar amp
  guitarAmp: [
    'Shure SM57',
    'Shure Beta 57A',
    'Shure SM7B',
    'Sennheiser e906',
    'Sennheiser e609 Silver',
    'Sennheiser MD421-II',
    'Sennheiser MD441-U',
    'Audio-Technica AE3000',
    'Audio-Technica ATM450',
    'Audix i5',
    'Audix D2',
    'Beyerdynamic M201 TG',
    'Beyerdynamic M160 (ribbon)',
    'AKG C414 XLII',
    'AKG C451 B',
    'Royer R-121 (ribbon)',
    'Royer R-10 (ribbon)',
    'Coles 4038 (ribbon)',
    'DPA 4055',
    'DPA 2011',
    'Neumann TLM 102',
  ],
  // Horns / brass / sax
  horn: [
    'Shure Beta 98H (clip-on)',
    'Shure SM57',
    'Sennheiser e906',
    'Sennheiser e908B (clip-on)',
    'Sennheiser MD441-U',
    'Audio-Technica ATM350 (clip-on)',
    'Audio-Technica AT4050',
    'Audix D2',
    'Audix Microboom MB5050',
    'Beyerdynamic MC 930',
    'Beyerdynamic Opus 88 (clip-on)',
    'AKG C519 ML (clip-on)',
    'AKG C414 XLII',
    'Neumann KM 184',
    'DPA 4099 (clip-on)',
    'DPA 4061 (lavalier)',
    'Royer R-121 (ribbon)',
  ],
  // Acoustic instruments
  acoustic: [
    'Shure SM81',
    'Shure KSM137',
    'Shure Beta 181',
    'Sennheiser MKH 8040',
    'Sennheiser e914',
    'Audio-Technica AT4051b',
    'Audio-Technica PRO 35 (clip-on)',
    'AKG C414 XLII',
    'AKG C451 B',
    'Neumann KM 184',
    'Neumann KM 185',
    'Beyerdynamic MC 930',
    'DPA 4011',
    'DPA 4099 (clip-on)',
    'DPA 2011',
    'Earthworks SR25',
  ],
  // Piano
  piano: [
    'Shure KSM32 (pair)',
    'Shure SM81 (pair)',
    'Shure Beta 91A (boundary)',
    'Sennheiser MKH 8040 (pair)',
    'Sennheiser e614 (pair)',
    'AKG C414 XLII (pair)',
    'AKG C451 B (pair)',
    'Neumann KM 184 (pair)',
    'DPA 4011 (pair)',
    'DPA 4099P (clip-on, pair)',
    'Earthworks PianoMic',
    'Earthworks SR25 (pair)',
  ],
  // Room
  room: [
    'AKG C414 XLII (pair)',
    'Shure KSM32 (pair)',
    'Shure KSM44A',
    'Neumann TLM 103',
    'Neumann U87 Ai',
    'Sennheiser MKH 8020 (pair)',
    'Royer R-121 (pair)',
    'Coles 4038 (pair)',
    'DPA 4006A',
    'Earthworks QTC40',
  ],
  // DI (also covers keys, sample pads, laptops, acoustic pickups)
  di: [
    'Radial JDI Passive',
    'Radial J48 Active',
    'Radial Pro DI Passive',
    'Radial ProD2 Stereo',
    'Radial JDV Mk5',
    'Radial Reamp JCR',
    'Countryman Type 85',
    'Avalon U5',
    'BSS AR-133',
    'BSS AR-116',
    'Whirlwind IMP 2',
    'Klark Teknik DN100',
    'Klark Teknik LBB 200',
  ],
  // IEM systems
  iem: [
    'Shure PSM 1000 (P10R+ receiver)',
    'Shure PSM 900 (P9RA receiver)',
    'Shure PSM 300 (P3RA receiver)',
    'Sennheiser EW IEM G4',
    'Sennheiser EW-DP IEM',
    'Sennheiser SR 2050 IEM',
    'Lectrosonics M2T/M2R',
    'Wisycom MPR50-IEM',
  ],
  // Wireless mic systems
  wireless: [
    'Shure Axient Digital · AD2/B58',
    'Shure ULX-D · ULXD2/B58',
    'Shure QLX-D · QLXD2/B58',
    'Shure SLX-D · SLXD2/B58',
    'Sennheiser EW-DX SKM-S',
    'Sennheiser EW-D SKM-S',
    'Sennheiser Digital 6000 · SKM 6000',
    'Sennheiser Digital 9000 · SKM 9000',
    'Audio-Technica 3000 Series',
    'Audio-Technica 5000 Series',
  ],
};

// Common SOURCE values for the input list — used as suggestions on the
// SOURCE field datalist.
const INPUT_SOURCES = [
  'Kick In', 'Kick Out', 'Snare Top', 'Snare Btm', 'Hi-Hat',
  'Rack Tom', 'Floor Tom 1', 'Floor Tom 2',
  'OH L', 'OH R',
  'Bass DI', 'Bass Mic',
  'Guitar 1', 'Guitar 2', 'Gtr Amp L', 'Gtr Amp R',
  'Acoustic Guitar',
  'Keys L', 'Keys R', 'Synth L', 'Synth R',
  'Sample Pad', 'Tracks L', 'Tracks R', 'Click',
  'Horn 1', 'Horn 2', 'Sax', 'Trumpet', 'Trombone',
  'Perc OH L', 'Perc OH R', 'Conga', 'Bongo',
  'Lead Vocal', 'BGV 1', 'BGV 2', 'BGV 3',
  'Piano L', 'Piano R', 'Room L', 'Room R',
  'Talkback',
];

// Source → mic category resolver.
function micCategoryFor(src) {
  const s = (src || '').toLowerCase().trim();
  if (!s) return 'all';
  if (/\bkick\b/.test(s)) return 'kick';
  if (/snare/.test(s)) return 'snare';
  if (/(rack\s*tom|floor\s*tom|\btom\b)/.test(s)) return 'tom';
  if (/(hi.?hat|^hat\b|\shat\b)/.test(s)) return 'hat';
  if (/(^| )oh( |$|\.|,)|overhead/.test(s)) return 'overhead';
  if (/bass\s*(mic|amp|cab)/.test(s)) return 'bassAmp';
  if (/(bass\s*di|bass$)/.test(s)) return 'di';
  if (/(gtr|guitar)\s*(amp|cab|mic|\d|\sL\b|\sR\b)/.test(s)) return 'guitarAmp';
  if (/^(gtr|guitar)\s*\d*$/.test(s)) return 'guitarAmp';
  if (/horn|sax|trumpet|trombone|brass|tuba|french/.test(s)) return 'horn';
  if (/(acoustic|nylon|mandolin|fiddle|violin|cello|ukulele|banjo)/.test(s)) return 'acoustic';
  if (/piano/.test(s)) return 'piano';
  if (/room|audience|amb/.test(s)) return 'room';
  if (/(keys|synth|sample|track|click|laptop|pad|drum\s*machine)/.test(s)) return 'di';
  if (/\bdi\b/.test(s)) return 'di';
  if (/iem|in.?ear/.test(s)) return 'iem';
  if (/wireless/.test(s)) return 'wireless';
  if (/(vocal|bgv|lead|backing|chorus|talkback)/.test(s)) return 'vocal';
  if (/(perc|conga|bongo|cajon|tambourine|shaker|cowbell|timbale|clave)/.test(s)) return 'tom';
  return 'all';
}

const MIC_DB_ALL = [...new Set(Object.values(MIC_DB).flat())].sort();

const MicDatalists = React.memo(function MicDatalists() {
  return (
    <>
      <datalist id="sp-micdb-sources">
        {INPUT_SOURCES.map((s) => <option key={s} value={s} />)}
      </datalist>
      {Object.entries(MIC_DB).map(([cat, opts]) => (
        <datalist key={cat} id={`sp-micdb-${cat}`}>
          {opts.map((o) => <option key={o} value={o} />)}
        </datalist>
      ))}
      <datalist id="sp-micdb-all">
        {MIC_DB_ALL.map((o) => <option key={o} value={o} />)}
      </datalist>
    </>
  );
});

Object.assign(window, {
  MIC_DB, INPUT_SOURCES, micCategoryFor, MicDatalists,
});
