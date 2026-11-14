#!/usr/bin/env node
/* Exporta a MP4 (1080×1920, 30 fps, H.264).
   Video completo:   node videos/render.js <video> [voz.m4a]
   Clips por escena: node videos/render.js <video> --clips [--limpio]
     --limpio quita los títulos (quedan rótulos y cotas), para usarlos como apoyo visual sobre un video grabado.
   Si se entrega un audio de voz, se normaliza a -14 LUFS y se mezcla. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const args = process.argv.slice(2), flags = args.filter(a => a.startsWith('--')), pos = args.filter(a => !a.startsWith('--'));
  const nombre = pos[0] || 'cucarachas-refugio', voz = pos[1];
  const clips = flags.includes('--clips'), limpio = flags.includes('--limpio');
  const FPS = 30, dir = __dirname;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(dir, 'ver.html') + `?v=${nombre}&render${limpio ? '&limpio' : ''}`);
  await page.waitForFunction('window.LISTO === true');
  await page.evaluate(() => document.fonts.ready);

  async function exportar(salida, dur, pintar, audio) {
    fs.mkdirSync(path.dirname(salida), { recursive: true });
    const a = ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
    if (audio) a.push('-i', audio, '-af', 'highpass=f=80,loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k');
    a.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-maxrate', '12M', '-bufsize', '18M',
      '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', '-t', String(dur), salida);
    const ff = spawn('ffmpeg', a, { stdio: ['pipe', 'inherit', 'inherit'] });
    const total = Math.round(dur * FPS);
    for (let i = 0; i < total; i++) {
      await pintar(i / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log(`Listo: ${salida} (${dur}s)`);
  }

  if (clips) {
    const escenas = await page.evaluate('window.ESCENAS');
    for (let i = 0; i < escenas.length; i++) {
      const f = `${String(i + 1).padStart(2, '0')}-${escenas[i].nombre}.mp4`;
      await exportar(path.join(dir, 'salida', nombre + (limpio ? '-clips-limpios' : '-clips'), f), escenas[i].dur, t => page.evaluate(([k, tt]) => window.renderEscena(k, tt), [i, t]));
    }
  } else {
    const dur = await page.evaluate('window.DUR');
    await exportar(path.join(dir, 'salida', nombre + '.mp4'), dur, t => page.evaluate(tt => window.renderAt(tt), t), voz);
  }
  await browser.close();
})();
