// Render the intro demo or the full animatic frame by frame.
//   node render_demo.js                         -> ../renders/intro-demo.mp4
//   node render_demo.js --stills 5,20           -> ../renders/stills/demo-<t>.png
//   node render_demo.js --from 20 --to 30       partial render (preview)
//   node render_demo.js --animatic [--w 960]    -> ../renders/intro-animatic.mp4 (cut to presentacion.wav)
const { chromium } = require('playwright');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ANIM = process.argv.includes('--animatic');
const PAGE = ANIM ? 'animatic.html' : 'index.html';
const NAME = ANIM ? 'intro-animatic' : 'intro-demo';
const AUDIO = ANIM ? 'presentacion.wav' : 'demo.wav';
const src = fs.readFileSync(path.join(ROOT, 'intro-demo', ANIM ? 'animatic-cues.js' : 'timeline.js'), 'utf8');
const D = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const FFMPEG = process.env.FFMPEG ||
  execSync('python3 -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())"').toString().trim();
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const W = +(arg('--w') || 1920), H = Math.round(W * 9 / 16);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + path.join(ROOT, 'intro-demo', PAGE) + '?render&w=' + W);
  await page.evaluate(() => window.ready);
  const outDir = path.join(ROOT, 'renders');
  const stills = arg('--stills');
  if (stills) {
    fs.mkdirSync(path.join(outDir, 'stills'), { recursive: true });
    for (const t of stills.split(',').map(Number)) {
      await page.evaluate(t => window.renderAt(t), t);
      await page.screenshot({ path: path.join(outDir, 'stills', `${NAME}-${t.toFixed(2)}.png`) });
    }
    return browser.close();
  }
  const from = +(arg('--from') || 0), to = +(arg('--to') || D.dur);
  const out = path.join(outDir, from === 0 && to === D.dur ? `${NAME}.mp4` : `${NAME}-${from}-${to}.mp4`);
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(D.fps), '-c:v', 'mjpeg', '-i', '-',
    '-ss', String(from), '-t', String(to - from), '-i', path.join(ROOT, 'intro-demo', 'audio', AUDIO),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '320k', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const f0 = Math.round(from * D.fps), f1 = Math.round(to * D.fps);
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.renderAt(t), f / D.fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log('frame', f, '/', f1);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  console.log('wrote', path.relative(ROOT, out));
  await browser.close();
})();
