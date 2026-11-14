/* Video: "las que no ves" — cucaracha alemana y el refugio.
   Todas las afirmaciones salen de landing/cucarachas/index.html (ver README de esta carpeta). */
const VIDEO = (() => {
  const { W, H, C, lerp, prog, eOut, eInOut, eBack, rnd, texto, rotulo, cucaracha, cocina, cierre } = M;

  // 1 — Gancho: de noche, una cucaracha cruza la pared de la cocina.
  const gancho = {
    dur: 5,
    draw(t) {
      const p = prog(t, 0.2, 4.6);
      const x = lerp(-140, 1230, p), y = 1010 - Math.sin(p * Math.PI) * 60;
      return cocina('noche', t)
        + cucaracha(x, y, 86 - Math.cos(p * Math.PI) * 6, 0.85, t, { seed: 1 })
        + texto(['viste una', 'cucaracha'], { y: 360, size: 112, t, t0: 0.5, t1: 2.7 })
        + texto([{ s: '¿y las que', fill: C.white }, { s: 'no ves?', fill: C.orange }], { y: 360, size: 124, t, t0: 2.8 });
    },
  };

  // 2 — ≈40 huevos por cápsula.
  const capsula = {
    dur: 7,
    draw(t) {
      const zoom = lerp(1.9, 2.25, eInOut(prog(t, 0, 7)));
      let s = `<rect width="${W}" height="${H}" fill="${C.green}"/>`;
      for (let i = 0; i < 9; i++) s += `<circle cx="${rnd(i) * W}" cy="${rnd(i + 20) * H}" r="${40 + rnd(i + 40) * 70}" fill="#fff" opacity=".05"/>`;
      s += `<ellipse cx="540" cy="1250" rx="330" ry="90" fill="#000" opacity=".18"/>`;
      s += cucaracha(540, 1010, -14 + Math.sin(t * 0.8) * 3, zoom, t, { ooteca: true, walk: 0.08, seed: 2 });
      // anillo que marca la cápsula
      const a = prog(t, 1.6, 0.4), r = lerp(140, 78, eOut(a));
      const cx = 540 + Math.sin(14 * Math.PI / 180) * 115 * zoom, cy = 1010 + Math.cos(14 * Math.PI / 180) * 115 * zoom;
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="16 12" opacity="${a * (1 - prog(t, 6.5, 0.4))}"/>`;
      // contador
      const n = Math.round(lerp(0, 40, eOut(prog(t, 2.0, 1.3))));
      s += rotulo('cucaracha alemana', { y: 330, size: 46, t, t0: 0.3, color: C.orange });
      s += texto([{ s: '≈' + n, fill: C.white }], { y: 590, size: 250, t, t0: 2.0 });
      s += texto(['huevos por cápsula'], { y: 690, size: 74, t, t0: 2.3 });
      s += texto(['la hembra la carga hasta un día', 'antes de que nazcan'], { y: 1560, size: 50, weight: 700, t, t0: 4.0 });
      return s;
    },
  };

  // 3 — El refugio: lo que ves en el mesón no es toda la población.
  const refugio = {
    dur: 7,
    draw(t) {
      const rx = eInOut(prog(t, 1.6, 0.8));
      let s = cocina('noche', t, rx);
      s += cucaracha(lerp(250, 330, prog(t, 0, 7)), 1105, 90, 0.6, t, { seed: 3, walk: 0.5 });
      if (rx > 0) {
        let g = '';
        for (let i = 0; i < 26; i++) {
          const bx = 130 + rnd(i) * 820, by = 1290 + rnd(i + 50) * 270;
          const dx = Math.sin(t * (0.5 + rnd(i + 7)) + i) * 26, dy = Math.cos(t * (0.4 + rnd(i + 3)) + i) * 14;
          const born = prog(t, 2.0 + rnd(i + 11) * 2.2, 0.3);
          if (born > 0) g += `<g opacity="${born}">${cucaracha(bx + dx, by + dy, rnd(i + 30) * 360 + t * 12 * (rnd(i) - 0.5), 0.3 + rnd(i + 90) * 0.14, t, { seed: i, walk: 0.7 })}</g>`;
        }
        s += `<g opacity="${rx}">${g}</g>`;
      }
      s += texto(['lo que ves', 'en el mesón…'], { y: 330, size: 104, t, t0: 0.3, t1: 2.9 });
      s += texto([{ s: '…no es toda' }, { s: 'la población', fill: C.orange }], { y: 330, size: 110, t, t0: 3.0 });
      s += rotulo('refugio', { y: 1700, size: 54, t, t0: 2.2 });
      return s;
    },
  };

  // 4 — De día: ya no caben escondidas.
  const deDia = {
    dur: 6,
    draw(t) {
      let s = cocina('dia', t);
      const rutas = [[-100, 760, 330, 700, 80], [1180, 1080, 380, 1040, -92], [-120, 880, 520, 930, 95], [300, 1250, 250, 1120, 0], [1200, 1090, 800, 1080, -95]];
      rutas.forEach((r, i) => {
        const p = eOut(prog(t, 0.6 + i * 0.5, 2.4));
        s += cucaracha(lerp(r[0], r[2], p), lerp(r[1], r[3], p), r[4], 0.62, t, { seed: i + 5, walk: p < 1 ? 1 : 0.15 });
      });
      s += `<rect width="${W}" height="720" fill="url(#gdia)"/><defs><linearGradient id="gdia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141a14" stop-opacity=".92"/><stop offset=".6" stop-color="#141a14" stop-opacity=".7"/><stop offset="1" stop-color="#141a14" stop-opacity="0"/></linearGradient></defs>`;
      s += texto(['son nocturnas'], { y: 380, size: 112, t, t0: 0.3, t1: 2.4 });
      s += texto([{ s: 'si las ves de día,' }, { s: 'ya no caben', fill: C.orange }, { s: 'escondidas', fill: C.orange }], { y: 300, size: 96, t, t0: 2.5 });
      return s;
    },
  };

  // 5 — Aerosol repelente: dispersa la colonia a otras zonas de la casa.
  const aerosol = {
    dur: 7,
    draw(t) {
      const piezas = [['COCINA', 90, 700], ['BAÑO', 540, 700], ['DORMITORIO', 90, 1150], ['LIVING', 540, 1150]];
      let s = `<rect width="${W}" height="${H}" fill="${C.night2}"/>`;
      piezas.forEach(([n, x, y], i) => {
        s += `<rect x="${x}" y="${y}" width="450" height="450" fill="${i === 0 ? '#243024' : '#1f271e'}"/>
          <text x="${x + 225}" y="${y + 62}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="34" letter-spacing="3" fill="#aab5a7" opacity=".7">${n}</text>`;
      });
      // muros con vanos de puerta
      const muro = d => `<path d="${d}" fill="none" stroke="${C.paper}" stroke-width="12" stroke-linecap="square"/>`;
      s += muro('M90 700 H990 V1600 H90 Z') + muro('M540 700 V860 M540 990 V1310 M540 1440 V1600') + muro('M90 1150 H250 M380 1150 H700 M830 1150 H990');
      // nube de aerosol
      const sp = prog(t, 1.8, 1.6), fade = 1 - prog(t, 4.2, 1.2);
      if (sp > 0) for (let i = 0; i < 16; i++) {
        const k = rnd(i + 60), d = eOut(sp) * (120 + k * 260);
        const an = (20 + rnd(i + 70) * 50) * Math.PI / 180;
        s += `<circle cx="${215 + Math.cos(an) * d}" cy="${760 + Math.sin(an) * d}" r="${(30 + k * 60) * eOut(sp)}" fill="#fff" opacity="${0.16 * fade}"/>`;
      }
      // lata
      const lin = eBack(prog(t, 1.0, 0.5)), lout = prog(t, 4.6, 0.5);
      s += `<g transform="translate(${lerp(-240, 150, lin) - lout * 420} 600) rotate(38)" filter="url(#sombra)">
        <rect x="-45" y="-10" width="90" height="190" rx="14" fill="#c9302c"/><rect x="-45" y="50" width="90" height="46" fill="#fff"/>
        <rect x="-32" y="-34" width="64" height="26" rx="6" fill="#d7dbe0"/><rect x="-14" y="-56" width="30" height="24" rx="5" fill="#f3f6f0"/></g>`;
      // colonia: parte agrupada en la cocina y se dispersa
      for (let i = 0; i < 16; i++) {
        const x0 = 230 + rnd(i) * 220, y0 = 900 + rnd(i + 5) * 190;
        const dest = [[540, 700], [90, 1150], [540, 1150]][i % 3];
        const x1 = dest[0] + 70 + rnd(i + 13) * 310, y1 = dest[1] + 110 + rnd(i + 17) * 280;
        const p = eInOut(prog(t, 2.5 + rnd(i + 23) * 0.9, 1.8));
        // pasa por el vano de la puerta correspondiente
        const via = [[540, 925], [315, 1150], [540, 1150 - 0]][i % 3];
        const q = p < 0.5 ? p * 2 : (p - 0.5) * 2;
        const ax = p < 0.5 ? lerp(x0, via[0], q) : lerp(via[0], x1, q), ay = p < 0.5 ? lerp(y0, via[1], q) : lerp(via[1], y1, q);
        const tx = p < 0.5 ? via[0] - x0 : x1 - via[0], ty = p < 0.5 ? via[1] - y0 : y1 - via[1];
        const ang = p > 0 && p < 1 ? Math.atan2(ty, tx) * 180 / Math.PI + 90 : rnd(i + 31) * 360;
        s += cucaracha(ax, ay, ang, 0.27, t, { seed: i, walk: p > 0 && p < 1 ? 1 : 0.2 });
      }
      s += texto(['muchos aerosoles', 'son repelentes'], { y: 340, size: 96, t, t0: 0.3, t1: 3.3 });
      s += texto([{ s: 'dispersan la colonia', fill: C.orange }, { s: 'a otras zonas de la casa' }], { y: 340, size: 80, t, t0: 3.4 });
      return s;
    },
  };

  const fin = { dur: 7.5, draw: t => cierre(t, LOGO) };
  const LOGO = (typeof window !== 'undefined' && window.LOGO_HREF) || '../img/logo-ayc.png';

  return { nombre: 'cucarachas-refugio', escenas: [gancho, capsula, refugio, deDia, aerosol, fin] };
})();
