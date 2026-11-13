#!/usr/bin/env node
/* Exporta un video a MP4 (1080×1920, 30 fps, H.264).
   Uso:  node videos/render.js cucarachas-refugio [voz.m4a]
   Si se entrega un audio de voz, se normaliza a -14 LUFS y se mezcla. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const nombre = process.argv[2] || 'cucarachas-refugio';
  const voz = process.argv[3];
  const FPS = 30, dir = __dirname;
  const salida = path.join(dir, 'salida', nombre + '.mp4');
  require('fs').mkdirSync(path.dirname(salida), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(dir, 'ver.html') + `?v=${nombre}&render`);
  await page.waitForFunction('window.LISTO === true');
  await page.evaluate(() => document.fonts.ready);
  const dur = await page.evaluate('window.DUR');
  const total = Math.round(dur * FPS);

  const args = ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  if (voz) args.push('-i', voz, '-af', 'highpass=f=80,loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k');
  args.push('-c:v', 'libx264', '-preset', 'medium', '-b:v', '9M', '-maxrate', '12M', '-bufsize', '18M',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', '-t', String(dur), salida);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.renderAt(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) process.stdout.write(`\r${Math.round((i / total) * 100)}%`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log(`\rListo: ${salida} (${dur}s)`);
})();
