#!/usr/bin/env node
/* Tabla de sincronización de la locución y subtítulos .srt.
   Uso: node videos/tiempos.js <video> [ppm]   (ppm: palabras por minuto, 125 por defecto)
   Escribe <video>/voz.srt y <video>/voz.txt, y muestra la tabla por escena. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const nombre = process.argv[2], PPM = +(process.argv[3] || 125), dir = path.join(__dirname, nombre);
global.M = require('./motor.js');
const VIDEO = vm.runInThisContext(fs.readFileSync(path.join(dir, 'escenas.js'), 'utf8') + ';VIDEO');
const palabras = s => (s.match(/[\wáéíóúñü]+/gi) || []).length;
const hms = x => { const ms = Math.round(x * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const mmss = x => `${Math.floor(x / 60)}:${(x % 60).toFixed(1).padStart(4, '0')}`;
let t0 = 0, n = 0, srt = '', txt = [], filas = [], avisos = [], totalP = 0;
VIDEO.escenas.forEach((e, i) => {
  const clip = VIDEO.clips[i], lineas = (VIDEO.voz || {})[clip] || [];
  lineas.forEach(([at, s], k) => {
    const p = palabras(s), d = p * 60 / PPM, a = t0 + at, b = a + d;
    totalP += p;
    srt += `${++n}\n${hms(a)} --> ${hms(b)}\n${s}\n\n`;
    filas.push(`| ${i + 1} | ${clip} | ${mmss(a)} – ${mmss(b)} | "${s}" | ${p} |`);
    const sig = lineas[k + 1] ? lineas[k + 1][0] : e.dur;
    if (at + d > sig + 0.01) avisos.push(`escena ${i + 1} (${clip}): "${s}" dura ${d.toFixed(1)} s y se pasa ${(at + d - sig).toFixed(1)} s`);
  });
  txt.push(lineas.map(l => l[1]).join(' '));
  t0 += e.dur;
});
fs.writeFileSync(path.join(dir, 'voz.srt'), srt);
fs.writeFileSync(path.join(dir, 'voz.txt'), txt.filter(Boolean).join('\n\n') + '\n');
console.log(`| # | Escena | Tiempo en el video | Locución | Palabras |\n|---|---|---|---|---|\n${filas.join('\n')}`);
console.log(`\nTotal: ${totalP} palabras · video ${mmss(t0)} · ${PPM} ppm`);
console.log(avisos.length ? 'AVISOS:\n' + avisos.join('\n') : 'Sin choques: cada línea cabe en su escena.');
