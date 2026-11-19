/* Clip para el reel de cucarachas: inspección → refugio → trampa de monitoreo → tratamiento en el refugio.
   Acompaña: "Encontrar el refugio, saber qué especie es y medir con trampas cuántas hay.
   Recién ahí se trata, y se trata donde viven, no donde las ves, hasta la erradicación total."
   No nombra productos ni muestra cifras de conteo. */
const VIDEO = (() => {
  const { W, H, C, lerp, prog, eOut, eInOut, rnd, rotulo, cucaracha, cocina } = M;
  const TEAL = '#2ec4b6';
  const PUNTOS = [[600, 1310], [740, 1500], [870, 1340], [960, 1510]];
  const TRAMPA = [[220, 1440], [300, 1490], [370, 1445], [440, 1500], [260, 1515]];
  const escena = {
    dur: 9.5,
    draw(t) {
      const abre = eInOut(prog(t, 2.0, 0.8));
      let s = cocina('noche', t, abre);
      // refugio con la colonia; se vacía al final
      const vacia = prog(t, 7.4, 1.5);
      if (abre > 0) {
        let g = '';
        for (let i = 0; i < 22; i++) {
          const bx = 560 + rnd(i) * 420, by = 1290 + rnd(i + 50) * 270;
          const dx = Math.sin(t * (0.5 + rnd(i + 7)) + i) * 24, dy = Math.cos(t * (0.4 + rnd(i + 3)) + i) * 12;
          const o = (1 - Math.min(1, vacia * (1 + rnd(i + 4)))) * prog(t, 2.2 + rnd(i + 11) * 0.8, 0.3);
          if (o > 0.01) g += `<g opacity="${o}">${cucaracha(bx + dx, by + dy, rnd(i + 30) * 360 + t * 12 * (rnd(i) - 0.5), 0.3 + rnd(i + 90) * 0.12, t, { seed: i, walk: 0.7 })}</g>`;
        }
        s += `<g opacity="${abre}">${g}</g>`;
      }
      // trampa de monitoreo: entra y van quedando pegadas
      const tr = eOut(prog(t, 3.2, 0.6));
      if (tr > 0) {
        let k = `<g transform="translate(0 ${(1 - tr) * 500})" opacity="${tr}">
          <rect x="160" y="1395" width="340" height="160" rx="10" fill="#f6e7a1" stroke="#c9a94a" stroke-width="6"/>`;
        for (let i = 1; i < 6; i++) k += `<line x1="${160 + i * 57}" y1="1400" x2="${160 + i * 57}" y2="1550" stroke="#d8c06a" stroke-width="3"/>`;
        for (let j = 1; j < 3; j++) k += `<line x1="165" y1="${1395 + j * 53}" x2="495" y2="${1395 + j * 53}" stroke="#d8c06a" stroke-width="3"/>`;
        TRAMPA.forEach(([x, y], i) => { const a = prog(t, 3.9 + i * 0.35, 0.25); if (a > 0) k += `<g opacity="${a}">${cucaracha(x, y, rnd(i + 70) * 360, 0.3, t, { seed: i + 40, walk: 0 })}</g>`; });
        s += k + '</g>';
      }
      // tratamiento: la boquilla recorre las grietas del refugio
      const tz = prog(t, 5.6, 2.2);
      if (tz > 0 && t < 8.6) {
        const u = tz * PUNTOS.length, i = Math.min(PUNTOS.length - 1, Math.floor(u)), f = eInOut(Math.min(1, (u - i) * 1.6));
        const [x0, y0] = i === 0 ? [1180, 1250] : PUNTOS[i - 1], [x1, y1] = PUNTOS[i];
        const x = lerp(x0, x1, f), y = lerp(y0, y1, f), sal = 1 - prog(t, 8.0, 0.5);
        s += `<g opacity="${sal}"><path d="M${x + 30} ${y - 30} L1240 ${y - 260}" stroke="#aab0b3" stroke-width="16" stroke-linecap="round"/>
          <rect x="${x + 20}" y="${y - 60}" width="70" height="40" rx="10" fill="#3b4652" transform="rotate(-50 ${x + 55} ${y - 40})"/>
          <circle cx="${x}" cy="${y}" r="8" fill="#c9d0d3"/></g>`;
      }
      PUNTOS.forEach(([x, y], i) => { const a = prog(t, 5.6 + (i + 0.6) * 2.2 / PUNTOS.length, 0.3); if (a > 0) s += `<circle cx="${x}" cy="${y}" r="${18 * eOut(a)}" fill="${TEAL}" opacity=".95"/><circle cx="${x}" cy="${y}" r="${34 * eOut(a)}" fill="${TEAL}" opacity=".25"/>`; });
      // linterna de la inspección
      const lx = lerp(150, 560, eInOut(prog(t, 0.2, 1.8))), ly = lerp(820, 1420, eInOut(prog(t, 0.2, 1.8)));
      const luz = 1 - prog(t, 2.4, 0.6);
      if (luz > 0) s += `<defs><radialGradient id="lint" gradientUnits="userSpaceOnUse" cx="${lx}" cy="${ly}" r="420"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${0.8 * luz}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#lint)"/>`;
      const z = eInOut(prog(t, 1.3, 1.3));
      s = `<g transform="translate(${W / 2} ${H / 2}) scale(${lerp(1, 1.65, z)}) translate(${-lerp(540, 570, z)} ${-lerp(960, 1360, z)})">${s}</g>`;
      s += rotulo('inspección', { y: 1720, size: 54, t, t0: 0.3, t1: 2.2 });
      s += rotulo('refugio', { y: 1720, size: 54, t, t0: 2.3, t1: 3.6 });
      s += rotulo('trampa de monitoreo', { y: 1720, size: 50, t, t0: 3.7, t1: 5.6 });
      s += rotulo('tratamiento en el refugio', { y: 1720, size: 46, t, t0: 5.7, t1: 7.7, color: TEAL });
      s += rotulo('erradicación total', { y: 1720, size: 52, t, t0: 7.8 });
      return s;
    },
  };
  return { nombre: 'cucarachas-inspeccion', clips: ['inspeccion'], escenas: [escena] };
})();
