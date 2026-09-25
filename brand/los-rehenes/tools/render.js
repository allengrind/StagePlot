// Frame-accurate renderer: drives animation/index.html via window.renderAt(style, t)
// and pipes PNG frames into ffmpeg together with the synthesized WAV.
//
//   node render.js <style|all> [--alpha] [--stills t1,t2,...]
//
// Outputs (in ../renders):
//   <style>.mp4           H.264 1080p30 + AAC 320k (black background)
//   <style>-alpha.mov     ProRes 4444 with alpha + PCM audio (--alpha)
//   stills/<style>-<t>.png (--stills)
const { chromium } = require('playwright');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TL = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8'));
const FFMPEG = process.env.FFMPEG ||
  execSync('python3 -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())"').toString().trim();

const args = process.argv.slice(2);
const alpha = args.includes('--alpha');
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const which = args[0] === 'all' || !args[0] ? Object.keys(TL.styles) : [args[0]];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: TL.width, height: TL.height } });
  const url = 'file://' + path.join(ROOT, 'animation', 'index.html') + '?render' + (alpha ? '&alpha' : '');
  await page.goto(url);
  const outDir = path.join(ROOT, 'renders');
  fs.mkdirSync(path.join(outDir, 'stills'), { recursive: true });

  for (const key of which) {
    const cfg = TL.styles[key];
    if (stillsArg) {
      for (const t of stillsArg.split(',').map(Number)) {
        await page.evaluate(([k, t]) => window.renderAt(k, t), [key, t]);
        await page.screenshot({ path: path.join(outDir, 'stills', `${key}-${t.toFixed(2)}.png`) });
      }
      continue;
    }
    const wav = path.join(ROOT, 'animation', 'audio', `${key}.wav`);
    const out = path.join(outDir, alpha ? `${key}-alpha.mov` : `${key}.mp4`);
    const vcodec = alpha
      ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-c:a', 'pcm_s24le']
      : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
         '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '320k'];
    const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(TL.fps), '-c:v', 'png', '-i', '-',
      '-i', wav, ...vcodec, '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const frames = Math.round(cfg.dur * TL.fps);
    for (let f = 0; f < frames; f++) {
      await page.evaluate(([k, t]) => window.renderAt(k, t), [key, f / TL.fps]);
      const buf = await page.screenshot({ omitBackground: alpha });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
    console.log('wrote', path.relative(ROOT, out));
  }
  await browser.close();
})();
