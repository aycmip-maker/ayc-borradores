/* Video: tratamiento de termita de madera seca por inyección en madera (A&C).
   Sigue la pauta de 10 escenas entregada por Francisco (ver README de videos).
   No mostrar: inyección en muros, fungicidas/cebos/aspersión, termitas saliendo del suelo,
   túneles de barro asociados a madera seca, plazos de garantía, obreras con ojos. */
const VIDEO = (() => {
  const { W, H, C, lerp, prog, eOut, eInOut, eBack, rnd, texto, rotulo, cierre, esc, pop } = M;
  const TEAL = '#2ec4b6', MAD = '#b98654', MAD2 = '#a87648', VETA = '#7d5330', GAL = '#43280f', GRAN = '#c9a36a';

  /* ---------- utilidades ---------- */
  const cam = (inner, cx, cy, z, rot = 0) =>
    `<g transform="translate(${W / 2} ${H / 2}) rotate(${rot}) scale(${z}) translate(${-cx} ${-cy})">${inner}</g>`;
  const velo = (h = 700, o = 0.85) => M.estado.limpio ? '' :
    `<defs><linearGradient id="velo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f130f" stop-opacity="${o}"/><stop offset=".55" stop-color="#0f130f" stop-opacity="${o * 0.7}"/><stop offset="1" stop-color="#0f130f" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="${h}" fill="url(#velo)"/>`;
  const madera = (x, y, w, h, col = MAD, seed = 0, veta = VETA) => {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}"/>`;
    const n = Math.max(3, Math.round(h / 42));
    for (let i = 0; i < n; i++) {
      const yy = y + (i + 0.5) * h / n, a = rnd(i + seed) * 26 - 13, b = rnd(i + seed + 7) * 22 - 11;
      s += `<path d="M${x} ${yy} Q${x + w * 0.3} ${yy + a} ${x + w * 0.55} ${yy} T${x + w} ${yy + b}" fill="none" stroke="${veta}" stroke-width="3" opacity=".45"/>`;
    }
    return s;
  };
  const etiqueta = (x, y, s, o = 1, col = C.orange, size = 34) => {
    const w = s.length * size * 0.62 + 36;
    return `<g opacity="${o}" transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-size * 0.8}" width="${w}" height="${size * 1.6}" rx="${size * 0.5}" fill="${col}"/>
      <text y="${size * 0.34}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="${size}" fill="#fff">${esc(s)}</text></g>`;
  };
  const linea = (x, y, s, o = {}) => {
    const { size = 40, fill = '#fff', weight = 700, anchor = 'start', op = 1 } = o;
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Inter, sans-serif" font-weight="${weight}" font-size="${size}" fill="${fill}" opacity="${op}">${esc(s)}</text>`;
  };

  /* Termita de madera seca vista desde arriba (mira hacia +x). Sin ojos.
     soldado: cabeza achatada y oscura. */
  function termita(x, y, ang, sc, t, o = {}) {
    const { seed = 0, walk = 1, soldado = false } = o;
    let legs = '';
    for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) {
      const a = Math.sin(t * 16 + seed * 3 + k * 2 + (sd > 0 ? 1.5 : 0)) * 8 * walk;
      legs += `<line x1="${-4 + k * 9}" y1="${sd * 7}" x2="${-8 + k * 11 + a}" y2="${sd * 20}" stroke="#d3bb85" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    const cabeza = soldado
      ? `<path d="M10 -10 H27 Q31 -10 31 -6 V6 Q31 10 27 10 H10 Q6 0 10 -10Z" fill="#33200f"/><path d="M31 -5 l7 3 M31 5 l7 -3" stroke="#33200f" stroke-width="3" stroke-linecap="round"/>`
      : `<circle cx="19" cy="0" r="8.5" fill="#ecd9a8"/><path d="M25 -4 L35 ${-10 + Math.sin(t * 8 + seed) * 2 * walk} M25 4 L35 ${10 - Math.sin(t * 8 + seed) * 2 * walk}" stroke="#d3bb85" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${ang + Math.sin(t * 16 + seed) * 3 * walk}) scale(${sc})">${legs}
      <ellipse cx="-14" cy="0" rx="17" ry="9.5" fill="#f6ecd0"/><path d="M-22 -8 V8 M-14 -9.5 V9.5 M-6 -8 V8" stroke="#000" stroke-opacity=".1" stroke-width="1.6"/>
      <ellipse cx="6" cy="0" rx="8" ry="7.5" fill="#f6ecd0"/>${cabeza}</g>`;
  }

  /* Granitos (fecas secas): montoncito bajo la pieza. k: cuántos se ven (0..1) */
  function monton(x, y, n, ancho, alto, k = 1, seed = 0) {
    let s = '';
    const m = Math.floor(n * k);
    for (let i = 0; i < m; i++) {
      const lv = Math.pow(rnd(i + seed), 1.6), dx = (rnd(i + seed + 40) - 0.5) * ancho * (1 - lv * 0.85);
      s += `<ellipse cx="${x + dx}" cy="${y - lv * alto}" rx="7" ry="4.3" transform="rotate(${rnd(i + seed + 9) * 180} ${x + dx} ${y - lv * alto})" fill="${rnd(i + seed + 3) > 0.45 ? GRAN : '#a9824b'}"/>`;
    }
    return s;
  }

  /* Viga en corte longitudinal con galerías limpias y una colonia pequeña. liq: avance del líquido 0..1 */
  const CAMS = [[230, 930, 130, 40], [520, 1020, 160, 46], [800, 925, 140, 42], [660, 868, 80, 24], [380, 1075, 100, 28], [940, 1050, 90, 30]];
  const TUN = 'M230 930 Q380 960 520 1020 T800 925 M520 1020 Q450 1060 380 1075 M660 868 Q740 880 800 925 M800 925 Q880 1000 940 1050';
  function vigaCorte(t, o = {}) {
    const { liq = 0, tarugo = false, quietas = 0 } = o;
    const gal = col => CAMS.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${col}"/>`).join('') + `<path d="${TUN}" fill="none" stroke="${col}" stroke-width="24" stroke-linecap="round"/>`;
    let s = madera(-200, 800, 1480, 360, MAD, 2) + `<rect x="-200" y="800" width="1480" height="14" fill="#000" opacity=".18"/><rect x="-200" y="1146" width="1480" height="14" fill="#000" opacity=".25"/>`;
    if (liq > 0) { // líquido que avanza por las fibras
      for (let i = 0; i < 9; i++) {
        const yy = 835 + i * 37, L = eOut(liq) * (520 + rnd(i + 5) * 420);
        s += `<path d="M150 ${yy} H${150 + L}" stroke="${TEAL}" stroke-width="${12 + rnd(i) * 10}" stroke-linecap="round" opacity=".42"/>`;
      }
    }
    s += gal(GAL);
    if (liq > 0) s += `<defs><clipPath id="cliq"><rect x="-200" y="700" width="${350 + eOut(liq) * 960}" height="600"/></clipPath></defs><g clip-path="url(#cliq)" opacity=".8">${gal(TEAL)}</g>`;
    // colonia
    let k = 0;
    CAMS.forEach(([x, y, rx, ry], c) => {
      const n = [4, 5, 4, 1, 2, 1][c];
      for (let i = 0; i < n; i++, k++) {
        const w = 1 - quietas, px = x + (rnd(k + 60) - 0.5) * rx * 1.3 + Math.sin(t * (0.6 + rnd(k)) + k) * 16 * w, py = y + (rnd(k + 80) - 0.5) * ry * 0.9 + Math.cos(t * 0.7 + k) * 5 * w;
        s += termita(px, py, rnd(k + 20) * 360 + Math.sin(t * 0.8 + k) * 40 * w, 0.82, t, { seed: k, walk: 0.7 * w, soldado: k === 6 });
      }
    });
    if (tarugo) s += `<rect x="128" y="800" width="44" height="240" fill="#e8e2d0"/>${[840, 880, 920, 960, 1000].map(v => `<line x1="128" x2="172" y1="${v}" y2="${v}" stroke="#b9b29c" stroke-width="4"/>`).join('')}<rect x="120" y="792" width="60" height="16" rx="5" fill="#d6cfba"/>`;
    return s;
  }

  /* Tarugo visto por fuera, vertical, con la cabeza arriba en (x,y). */
  function tarugo(x, y, w, h, o = 1) {
    let s = `<g opacity="${o}"><rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="${w * 0.12}" fill="#e8e2d0"/>`;
    const n = Math.max(2, Math.round(h / (w * 0.42)));
    for (let i = 1; i < n; i++) s += `<path d="M${x - w / 2 - w * 0.07} ${y + i * h / n} H${x + w / 2 + w * 0.07}" stroke="#b9b29c" stroke-width="${Math.max(3, w * 0.07)}" stroke-linecap="round"/>`;
    return s + `<rect x="${x - w * 0.62}" y="${y - w * 0.16}" width="${w * 1.24}" height="${w * 0.2}" rx="${w * 0.08}" fill="#d6cfba"/><rect x="${x - w * 0.3}" y="${y}" width="${w * 0.13}" height="${h}" fill="#fff" opacity=".35"/></g>`;
  }

  /* ================= ESCENAS ================= */

  // 1 — Lo que no se ve: la viga se ve sana por fuera; el corte revela la colonia.
  const e1 = {
    dur: 8.5,
    draw(t) {
      let w = `<rect x="-300" y="-300" width="1700" height="2600" fill="#2a2019"/>`;
      for (let i = 0; i < 5; i++) w += `<path d="M${-300 + i * 330} 760 L${60 + i * 330} -300" stroke="#5a3d25" stroke-width="80"/><path d="M${-300 + i * 330 + 44} 760 L${104 + i * 330} -300" stroke="#000" stroke-opacity=".2" stroke-width="12"/>`;
      w += `<rect x="-300" y="1160" width="1700" height="60" fill="#000" opacity=".3"/>`;
      w += vigaCorte(t);
      // la cara exterior, que se retira con el corte
      const c = eInOut(prog(t, 2.0, 1.1)), cx = -200 + c * 1480;
      w += `<defs><clipPath id="tapa"><rect x="${cx}" y="700" width="1700" height="600"/></clipPath></defs><g clip-path="url(#tapa)">${madera(-200, 800, 1480, 360, MAD2, 9)}<rect x="-200" y="800" width="1480" height="26" fill="#fff" opacity=".1"/></g>`;
      if (c > 0 && c < 1) w += `<rect x="${cx - 6}" y="770" width="12" height="420" fill="#fff"/>`;
      const z = eInOut(prog(t, 3.2, 4.5));
      return cam(w, lerp(540, 560, z), lerp(900, 970, z), lerp(0.95, 1.45, z)) + velo(640)
        + texto(['la colonia vive', { s: 'dentro de la madera', fill: C.orange }], { y: 330, size: 96, t, t0: 3.2 });
    },
  };

  // 2a — Inspección: la linterna encuentra el montoncito de granitos; el orificio se abre, expulsa y se cierra.
  const HX = 657, HY = 1180;
  const e2a = {
    dur: 8,
    draw(t) {
      let w = `<rect x="-200" y="-200" width="1480" height="1700" fill="#e9dcc0"/>`;
      w += madera(-200, 380, 1480, 90, '#8d5a36', 4) + madera(-200, 60, 1480, 90, '#8d5a36', 6) + `<rect x="-200" y="470" width="1480" height="14" fill="#000" opacity=".15"/>`;
      // marco de puerta
      w += `<rect x="674" y="654" width="232" height="846" fill="#3b2a1e"/>` + madera(640, 620, 34, 880, MAD, 3) + madera(906, 620, 34, 880, MAD, 5) + madera(640, 620, 300, 34, MAD, 8);
      // mueble
      w += madera(120, 1050, 350, 450, '#9c6b3f', 12) + `<rect x="120" y="1050" width="350" height="16" fill="#000" opacity=".2"/>${[1090, 1230, 1370].map(y => `<rect x="140" y="${y}" width="310" height="118" rx="8" fill="none" stroke="#6d4a2c" stroke-width="6"/><circle cx="295" cy="${y + 59}" r="10" fill="#f1c453"/>`).join('')}`;
      // piso
      w += madera(-200, 1500, 1480, 620, '#c9a36e', 15, '#a07c4c') + `<rect x="-200" y="1500" width="1480" height="12" fill="#000" opacity=".2"/>`;
      // orificio: se abre, expulsa granitos y se vuelve a cerrar
      const ab = eOut(prog(t, 4.3, 0.3)) * (1 - eInOut(prog(t, 6.6, 0.4)));
      w += `<circle cx="${HX}" cy="${HY}" r="13" fill="#c79a66"/><circle cx="${HX}" cy="${HY}" r="${13 * ab}" fill="#1c1108"/>`;
      let nuevos = 0;
      for (let i = 0; i < 12; i++) {
        const u = prog(t, 4.6 + i * 0.15, 0.55); if (u <= 0) continue;
        if (u >= 1) { nuevos++; continue; }
        w += `<ellipse cx="${HX - 6 - u * (10 + rnd(i) * 26)}" cy="${HY + u * u * (1492 - HY - 20)}" rx="4" ry="2.6" fill="${GRAN}" transform="rotate(${u * 300} ${HX - 6} ${HY + u * u * 290})"/>`;
      }
      w += monton(634, 1494, 46, 74, 26, 1, 5).replace(/rx="7" ry="4.3"/g, 'rx="4" ry="2.6"') + monton(628, 1488, 12, 40, 16, nuevos / 12, 70).replace(/rx="7" ry="4.3"/g, 'rx="4" ry="2.6"');
      // linterna
      const pts = [[300, 430], [790, 640], [300, 1230], [640, 1400]];
      const u = prog(t, 0.2, 2.8) * 3, k = Math.min(2, Math.floor(u)), f = eInOut(u - k);
      const lx = lerp(pts[k][0], pts[k + 1][0], f), ly = lerp(pts[k][1], pts[k + 1][1], f);
      const z = eInOut(prog(t, 3.0, 1.1));
      w += `<defs><radialGradient id="lint"><stop offset="${lerp(0.1, 0.22, z)}" stop-color="#000" stop-opacity="0"/><stop offset="${lerp(0.16, 0.4, z)}" stop-color="#000" stop-opacity=".78"/></radialGradient></defs><circle cx="${lerp(lx, 650, z)}" cy="${lerp(ly, 1340, z)}" r="2200" fill="url(#lint)"/>`;
      return cam(w, lerp(540, 650, z), lerp(960, 1335, z), lerp(1, 3.5, z)) + velo(640)
        + texto([{ s: 'granitos =', fill: C.orange }, 'colonia activa', 'en esa pieza'], { y: 280, size: 96, t, t0: 5.0 });
    },
  };

  // 2b — Golpe con el mango del destornillador: sonido hueco.
  const e2b = {
    dur: 3,
    draw(t) {
      const g = Math.abs(Math.sin(Math.min(t, 2.2) * Math.PI * 2.2)), hit = (t * 2.2) % 1;
      let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#e9dcc0"/>` + madera(-100, 700, 1280, 520, MAD, 3) + `<rect x="-100" y="700" width="1280" height="18" fill="#000" opacity=".18"/><rect x="-100" y="1202" width="1280" height="18" fill="#000" opacity=".22"/>`;
      if (t < 2.3) for (let i = 0; i < 3; i++) { const r = 60 + ((hit + i / 3) % 1) * 260; w += `<circle cx="520" cy="900" r="${r}" fill="none" stroke="#fff" stroke-width="8" opacity="${(1 - (r - 60) / 260) * 0.8}"/>`; }
      w += `<g transform="translate(${505 + g * 120} ${915 - g * 150}) rotate(220)"><rect x="-34" y="-20" width="68" height="250" rx="30" fill="${C.orange}"/><rect x="-34" y="60" width="68" height="16" fill="#b04c08"/><rect x="-9" y="228" width="18" height="230" fill="#c9d0d3"/><rect x="-14" y="450" width="28" height="26" fill="#aab0b3"/></g>`;
      return cam(w, 540, 960, lerp(1, 1.08, prog(t, 0, 3))) + rotulo('sonido hueco', { y: 1620, size: 56, t, t0: 0.4 });
    },
  };

  // 2c — Alas sueltas junto a la ventana.
  const e2c = {
    dur: 3,
    draw(t) {
      let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#f4e9d2"/><rect x="60" y="-100" width="960" height="1010" fill="#f3f6f0"/><rect x="110" y="-100" width="860" height="950" fill="#9fd6f5"/><rect x="520" y="-100" width="40" height="950" fill="#f3f6f0"/>
        <polygon points="110,850 500,850 300,-100 110,-100" fill="#fff" opacity=".25"/><polygon points="0,910 1080,910 1180,1500 -100,1500" fill="#ece5d6"/><rect x="-100" y="1500" width="1280" height="70" fill="#d6cdb9"/><rect x="-100" y="1570" width="1280" height="500" fill="#e9dcc0"/><polygon points="110,910 520,910 620,1500 60,1500" fill="#fff" opacity=".35"/>`;
      for (let i = 0; i < 24; i++) {
        const a = prog(t, 0.15 + rnd(i + 3) * 1.3, 0.35); if (a <= 0) continue;
        const x = 120 + rnd(i) * 840, y = 990 + rnd(i + 50) * 440, k = 0.8 + ((y - 990) / 440) * 0.5;
        w += `<g transform="translate(${x} ${y - (1 - eOut(a)) * 120}) rotate(${rnd(i + 9) * 180 - 90 + (1 - a) * 60}) scale(${k})" opacity="${a}"><ellipse cx="2" cy="5" rx="58" ry="15" fill="#000" opacity=".1"/><ellipse rx="58" ry="15" fill="#fff" fill-opacity=".62" stroke="#b9a777" stroke-width="2.5"/><path d="M-56 0 H52 M-40 -5 Q0 -12 44 -4 M-40 5 Q0 11 44 4" stroke="#b9a777" stroke-width="1.6" fill="none" opacity=".8"/></g>`;
      }
      return cam(w, 540, 960, lerp(1, 1.1, prog(t, 0, 3))) + rotulo('alas sueltas', { y: 1700, size: 56, t, t0: 0.5 });
    },
  };

  // 3 — Descartar la otra termita: pantalla dividida.
  const e3 = {
    dur: 6.5,
    draw(t) {
      // izquierda: madera seca (granitos secos bajo la madera)
      let L = `<rect x="0" y="0" width="540" height="${H}" fill="#e9dcc0"/>` + madera(0, 760, 540, 240, MAD, 3) + `<rect x="0" y="984" width="540" height="16" fill="#000" opacity=".22"/>` + madera(0, 1400, 540, 520, '#c9a36e', 15, '#a07c4c') + `<rect x="0" y="1400" width="540" height="10" fill="#000" opacity=".2"/><circle cx="270" cy="1000" r="10" fill="#1c1108"/>`;
      const k = eOut(prog(t, 0.6, 2.2));
      for (let i = 0; i < 6; i++) { const u = (t * 1.3 + i / 6) % 1; if (t > 0.5 && t < 3) L += `<ellipse cx="${270 + (rnd(i) - 0.5) * 30}" cy="${1010 + u * u * 380}" rx="7" ry="4.3" fill="${GRAN}"/>`; }
      L += monton(270, 1400, 90, 240, 78, k, 11);
      // derecha: subterránea (túneles de barro en un muro)
      let R = `<rect x="540" y="0" width="540" height="${H}" fill="#b8b3a8"/>`;
      for (let i = 0; i < 80; i++) R += `<circle cx="${540 + rnd(i) * 540}" cy="${rnd(i + 300) * 1500}" r="${2 + rnd(i + 8) * 5}" fill="${rnd(i + 2) > 0.5 ? '#a39e93' : '#c9c4b9'}"/>`;
      const g = eOut(prog(t, 0.8, 2.4));
      ['M740 1500 C720 1340 790 1250 760 1100 S820 900 780 760 S760 640 790 560', 'M760 1100 C860 1040 900 960 930 850', 'M960 1500 C990 1380 930 1300 970 1180'].forEach(d => {
        R += `<path d="${d}" pathLength="1" stroke-dasharray="${g} 1" fill="none" stroke="#5f3f24" stroke-width="40" stroke-linecap="round"/><path d="${d}" pathLength="1" stroke-dasharray="${g} 1" fill="none" stroke="#86603a" stroke-width="27" stroke-linecap="round"/>`;
      });
      R += `<rect x="540" y="1500" width="540" height="420" fill="#6b4a2f"/><rect x="540" y="1490" width="540" height="30" fill="#4f9a45"/>`;
      return L + R + `<rect x="534" y="0" width="12" height="${H}" fill="#fff"/>` + velo(700, 0.9)
        + texto(['primero la especie,', { s: 'después el tratamiento', fill: C.orange }], { y: 320, size: 78, t, t0: 3.6 })
        + rotulo('madera seca', { x: 270, y: 1640, size: 44, t, t0: 1.2 })
        + rotulo('subterránea', { x: 810, y: 1640, size: 44, t, t0: 1.9, color: '#aab5a7' })
        + texto(['otro tratamiento'], { x: 810, y: 1752, size: 42, weight: 700, t, t0: 2.3, fijo: true });
    },
  };

  // 4 — Mapear todas las piezas: plano de la casa.
  const e4 = {
    dur: 7,
    draw(t) {
      let s = `<rect width="${W}" height="${H}" fill="${C.night2}"/>`;
      [['LIVING', 90, 640], ['COCINA', 540, 640], ['DORMITORIO', 90, 1090], ['BAÑO', 540, 1090]].forEach(([n, x, y]) => {
        s += `<rect x="${x}" y="${y}" width="450" height="450" fill="#1f271e"/><text x="${x + 225}" y="${y + 400}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="30" letter-spacing="3" fill="#aab5a7" opacity=".55">${n}</text>`;
      });
      const muro = d => `<path d="${d}" fill="none" stroke="${C.paper}" stroke-width="12" stroke-linecap="square"/>`;
      s += muro('M90 640 H990 V1540 H90 Z') + muro('M540 640 V800 M540 930 V1250 M540 1380 V1540') + muro('M90 1090 H250 M380 1090 H700 M830 1090 H990');
      const marca = (t0, forma, lx, ly, txt) => {
        const a = prog(t, t0, 0.35); if (a <= 0) return '';
        const pul = 0.75 + Math.sin(t * 5 + t0) * 0.25;
        return `<g opacity="${a}">${forma(pul)}</g>` + etiqueta(lx, ly, txt, a);
      };
      s += marca(0.9, p => `<rect x="110" y="820" width="410" height="34" rx="6" fill="${C.orange}" opacity="${p}"/><rect x="110" y="820" width="410" height="34" rx="6" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>`, 315, 770, 'viga');
      s += marca(2.0, p => `<rect x="244" y="1074" width="142" height="32" rx="6" fill="${C.orange}" opacity="${p}"/>`, 315, 1160, 'marco');
      s += marca(3.1, p => `<rect x="120" y="1290" width="190" height="110" rx="8" fill="${C.orange}" opacity="${p}"/>`, 215, 1250, 'mueble');
      // pieza que se reemplaza
      const a = prog(t, 4.6, 0.35);
      if (a > 0) {
        const x = eOut(prog(t, 5.0, 0.4));
        s += `<g opacity="${a}"><rect x="560" y="800" width="410" height="34" rx="6" fill="#8a8479"/><path d="M580 770 L${580 + 370 * x} ${770 + 94 * x}" stroke="#e5484d" stroke-width="12" stroke-linecap="round"/><path d="M950 770 L${950 - 370 * x} ${770 + 94 * x}" stroke="#e5484d" stroke-width="12" stroke-linecap="round"/></g>`;
        s += rotulo('reemplazar', { x: 765, y: 930, size: 40, t, t0: 5.3, color: '#e5484d' });
      }
      return s + texto(['puede haber varias colonias', { s: 'en una misma casa', fill: C.orange }], { y: 330, size: 72, t, t0: 3.4 });
    },
  };

  // 5 — Perforación: patrón en zigzag y profundidad de hasta 2/3 del espesor.
  const e5 = {
    dur: 9,
    draw(t) {
      if (t < 4.2) { // cara de la viga: orificios en zigzag
        let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#2a2019"/>` + madera(-100, 760, 1280, 340, MAD, 4) + `<rect x="-100" y="760" width="1280" height="16" fill="#fff" opacity=".08"/><rect x="-100" y="1084" width="1280" height="16" fill="#000" opacity=".25"/>`;
        const pts = []; for (let i = 0; i < 8; i++) pts.push([130 + i * 120, i % 2 ? 1000 : 860]);
        const n = prog(t, 0.5, 3.0) * pts.length;
        w += `<path d="M${pts.slice(0, Math.max(1, Math.ceil(n))).map(p => p.join(' ')).join(' L')}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 12" opacity=".7"/>`;
        pts.forEach(([x, y], i) => { const a = eBack(prog(n, i, 0.6)); if (a > 0) w += `<circle cx="${x}" cy="${y}" r="${20 * a}" fill="#1c1108"/><circle cx="${x}" cy="${y}" r="${24 * a}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="5"/>`; });
        const i = Math.min(pts.length - 1, Math.floor(n)), [dx, dy] = pts[i];
        if (n < pts.length) w += `<g transform="translate(${dx + Math.sin(t * 80) * 3} ${dy})"><circle r="16" fill="#8a9096"/><rect x="-46" y="-46" width="92" height="92" rx="20" fill="${C.orange}" opacity=".95"/><circle r="22" fill="#3b4652"/></g>`;
        return cam(w, 540, 940, 1) + velo(640) + rotulo('patrón en zigzag', { y: 1320, size: 50, t, t0: 0.8 });
      }
      // corte transversal: hasta 2/3 del espesor; viga gruesa por ambos lados
      const u = t - 4.2;
      const seccion = (x, y, w, h, seed) => {
        let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${MAD}"/>`;
        for (let i = 1; i < 7; i++) s += `<ellipse cx="${x + w * 0.5}" cy="${y + h * 0.56}" rx="${i * w * 0.115}" ry="${i * h * 0.1}" fill="none" stroke="${VETA}" stroke-width="3" opacity=".4"/>`;
        return `<defs><clipPath id="sec${seed}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#sec${seed})">${s}</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#6d4a2c" stroke-width="8"/>`;
      };
      let w = `<rect width="${W}" height="${H}" fill="#2a2019"/>`;
      // viga normal: desde arriba hasta 2/3
      const d1 = eInOut(prog(u, 0.4, 1.3)) * 240;
      w += seccion(120, 760, 330, 360, 1) + `<rect x="267" y="760" width="36" height="${d1}" fill="#1c1108"/>`;
      const c = prog(u, 1.8, 0.3);
      w += `<g opacity="${c}"><path d="M500 760 V1000 M478 760 H522 M478 1000 H522 M478 1120 H522" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M500 1000 V1120" stroke="#fff" stroke-width="4" stroke-dasharray="8 10"/></g>` + etiqueta(500, 880, '2/3', c, C.orange, 46);
      // viga gruesa: por ambos lados
      const d2 = eInOut(prog(u, 2.3, 1.2)) * 190;
      w += seccion(600, 700, 400, 480, 2) + `<rect x="600" y="820" width="${d2}" height="34" fill="#1c1108"/><rect x="${1000 - d2}" y="1020" width="${d2}" height="34" fill="#1c1108"/>`;
      w += linea(285, 1200, 'viga', { anchor: 'middle', size: 40, op: prog(u, 0.3, 0.3) }) + linea(800, 1260, 'viga gruesa:', { anchor: 'middle', size: 40, op: prog(u, 2.2, 0.3) }) + linea(800, 1312, 'por ambos lados', { anchor: 'middle', size: 40, fill: C.orange, op: prog(u, 2.2, 0.3) });
      return `<g opacity="${prog(u, 0, 0.3)}">${w}</g>` + texto(['hasta 2/3', { s: 'del espesor', fill: C.orange }], { y: 340, size: 112, t: u, t0: 0.9 });
    },
  };

  // 6 — Instalación del tarugo: a golpe de martillo con botador; tarugo según la pieza.
  const e6 = {
    dur: 10.5,
    draw(t) {
      const titulo = texto(['tarugo con válvula', { s: 'antirretorno', fill: C.orange }], { y: 320, size: 88, t, t0: 0.5 });
      if (t < 5) {
        let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#e9dcc0"/>` + madera(-100, 1000, 1280, 700, MAD, 6) + `<rect x="-100" y="1000" width="1280" height="16" fill="#fff" opacity=".1"/><rect x="495" y="1000" width="90" height="330" fill="#1c1108"/>`;
        // tres golpes
        const fase = prog(t, 1.2, 2.7) * 3, g = Math.min(2, Math.floor(fase)), f = fase - g;
        const prof = t < 1.2 ? 0 : (t > 3.9 ? 1 : (g + eOut(Math.min(1, Math.max(0, (f - 0.55) / 0.2)))) / 3);
        const ty = lerp(720, 1012, prof);
        w += tarugo(540, ty, 96, 300);
        const sw = t > 1.2 && t < 3.9 ? (f < 0.55 ? eInOut(f / 0.55) : 1 - (f - 0.55) / 0.45 * 0.3) : 0;
        if (t < 4.2) {
          w += `<rect x="524" y="${ty - 210}" width="32" height="196" rx="6" fill="#8a9096"/><rect x="516" y="${ty - 222}" width="48" height="22" rx="6" fill="#6d7378"/>`;
          w += `<g transform="translate(540 ${ty - 222}) rotate(${lerp(-62, 0, sw)} 330 -40)"><rect x="-70" y="-110" width="140" height="110" rx="14" fill="#3b4652"/><rect x="40" y="-76" width="330" height="40" rx="18" fill="#8d5a36"/></g>`;
          if (f > 0.55 && f < 0.75 && t > 1.2 && t < 3.9) w += `<path d="M450 ${ty - 240} l-50 -30 M630 ${ty - 240} l50 -30 M540 ${ty - 250} v-56" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`;
        }
        return cam(w, 540, 1020, 1) + velo(640) + titulo + rotulo('queda ajustado a la madera', { y: 1660, size: 42, t, t0: 4.0 });
      }
      // tarugo según la pieza (a escala entre sí)
      const u = t - 5, K = 9;
      let s = `<rect width="${W}" height="${H}" fill="${C.night2}"/>`;
      [['vigas', 'Ø 9,5–10 mm', '32–37 mm de largo', 'semiperímetro de 17 cm o más', 10, 35],
       ['marcos', 'Ø 6,5 mm', '15 mm de largo', 'semiperímetro de 17 cm o menos', 6.5, 15],
       ['cabios', 'Ø 6,5 mm', '21 mm de largo', '', 6.5, 21]].forEach(([n, d, l, cond, dm, lg], i) => {
        const a = eOut(prog(u, 0.3 + i * 0.7, 0.4)), y = 640 + i * 370;
        s += `<g opacity="${a}" transform="translate(${(1 - a) * 80} 0)"><rect x="70" y="${y}" width="940" height="330" rx="28" fill="#1f271e"/>
          ${tarugo(230, y + 165 - lg * K / 2 + 8, dm * K, lg * K)}
          ${linea(400, y + 86, n, { size: 60, weight: 900, fill: C.orange })}${linea(400, y + 156, d, { size: 50, weight: 800 })}${linea(400, y + 216, l, { size: 50, weight: 800 })}${cond ? linea(400, y + 276, cond, { size: 32, weight: 600, fill: '#aab5a7' }) : ''}</g>`;
      });
      return `<g opacity="${prog(u, 0, 0.3)}">${s}</g>` + titulo;
    },
  };

  // 7a — Inyección: la válvula en corte. Deja entrar, no deja salir.
  const e7a = {
    dur: 9.5,
    draw(t) {
      const pres = t > 0.8 && t < 6.0;
      const ball = eInOut(prog(t, 1.7, 0.4)) - eInOut(prog(t, 6.1, 0.4)), by = lerp(928, 1040, ball);
      const lq1 = eOut(prog(t, 0.8, 0.9)), lq2 = eOut(prog(t, 2.0, 1.0)), lq3 = eOut(prog(t, 2.8, 3.0));
      let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#e9dcc0"/>` + madera(-100, 620, 1280, 1500, MAD, 6);
      // líquido que sale por los canales de difusión y avanza por las fibras
      if (lq3 > 0) [[1130, 0], [1250, 1], [1190, 2], [1310, 3]].forEach(([y, i]) => {
        for (const sd of [-1, 1]) w += `<path d="M${540 + sd * 180} ${y} H${540 + sd * (180 + lq3 * (300 + rnd(i + sd + 4) * 200))}" stroke="${TEAL}" stroke-width="${44 - i * 4}" stroke-linecap="round" opacity=".55"/>`;
      });
      if (lq3 > 0) w += `<ellipse cx="540" cy="1470" rx="${150 * lq3}" ry="${120 * lq3}" fill="${TEAL}" opacity=".5"/>`;
      // cuerpo del tarugo en corte
      w += `<path d="M360 620 H720 V1400 H360 Z" fill="#e8e2d0"/><rect x="320" y="580" width="440" height="60" rx="16" fill="#d6cfba"/>`;
      // conducto, asiento cónico y cámara
      const hueco = `M498 580 H582 V860 L650 930 V1400 H430 V930 L498 860 Z`;
      w += `<path d="${hueco}" fill="#3b3428"/>`;
      // canales de difusión (laterales)
      [1100, 1220].forEach(y => { w += `<rect x="360" y="${y}" width="80" height="60" fill="#3b3428"/><rect x="640" y="${y}" width="80" height="60" fill="#3b3428"/>`; });
      // líquido dentro
      w += `<defs><clipPath id="hue"><path d="${hueco}"/></clipPath></defs><g clip-path="url(#hue)"><rect x="430" y="580" width="220" height="${lq1 * 330}" fill="${TEAL}"/><rect x="430" y="${lerp(910, 910, 0)}" width="220" height="${lq2 * 500}" fill="${TEAL}"/></g>`;
      if (lq2 > 0.6) [1100, 1220].forEach(y => { w += `<rect x="360" y="${y}" width="80" height="60" fill="${TEAL}"/><rect x="640" y="${y}" width="80" height="60" fill="${TEAL}"/>`; });
      // flechas de flujo
      if (pres && t > 2.2) for (let i = 0; i < 3; i++) { const yy = 640 + ((t * 260 + i * 90) % 200); w += `<path d="M540 ${yy} v40 m-16 -18 l16 18 l16 -18" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`; }
      // bolita metálica
      w += `<defs><radialGradient id="bola" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#b8bec4"/><stop offset="1" stop-color="#5c6166"/></radialGradient></defs><circle cx="540" cy="${by}" r="66" fill="url(#bola)"/>`;
      // al cortar la presión: el líquido empuja de vuelta y la bolita lo detiene
      if (t > 6.6) for (const sd of [-1, 1]) { const k = Math.abs(Math.sin(t * 5)) * 18; w += `<path d="M${540 + sd * 70} ${1140 - k} v-50 m-14 16 l14 -16 l14 16" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`; }
      // boquilla del equipo de inyección
      const bq = eOut(prog(t, 0.2, 0.5)) - eInOut(prog(t, 5.9, 0.6)) * 1;
      w += `<g transform="translate(0 ${lerp(-420, 0, bq)})"><rect x="470" y="150" width="140" height="400" rx="20" fill="#3b4652"/><rect x="490" y="540" width="100" height="46" rx="8" fill="#8a9096"/><rect x="524" y="150" width="32" height="400" fill="${pres ? TEAL : '#27323b'}" opacity=".9"/><rect x="430" y="110" width="220" height="70" rx="18" fill="${C.orange}"/></g>`;
      return cam(w, 540, 1000, 0.98) + velo(520, 0.8)
        + texto(['deja entrar'], { y: 300, size: 108, t, t0: 2.2, t1: 6.2 })
        + texto(['deja entrar,', { s: 'no deja salir', fill: C.orange }], { y: 270, size: 108, t, t0: 6.3 })
        + rotulo('bolita metálica', { x: 820, y: 1040, size: 36, t, t0: 1.0, t1: 2.2, color: '#aab5a7' })
        + rotulo('canales de difusión', { y: 1640, size: 42, t, t0: 3.2, t1: 6.0, color: TEAL })
        + rotulo('la válvula se cierra', { y: 1640, size: 46, t, t0: 6.5 });
    },
  };

  // 7b — La cámara se aleja: el líquido avanza por las fibras y las galerías hasta la colonia.
  const e7b = {
    dur: 6.5,
    draw(t) {
      const lq = prog(t, 0.6, 4.4), z = eInOut(prog(t, 0, 2.2));
      let w = `<rect x="-300" y="-300" width="1700" height="2600" fill="#2a2019"/>` + vigaCorte(t, { liq: lq, tarugo: true, quietas: eInOut(prog(t, 3.2, 2.2)) });
      return cam(w, lerp(200, 560, z), lerp(900, 970, z), lerp(2.6, 1.02, z)) + velo(640)
        + texto(['termiticida', { s: 'con registro ISP', fill: TEAL }], { y: 330, size: 100, t, t0: 2.2 })
        + rotulo('llega hasta la colonia', { y: 1420, size: 46, t, t0: 4.2, color: TEAL });
    },
  };

  // 8 — Cierre de la pieza: tapón (permite reinyectar) o tarugo de haya (definitivo). Se puede pintar o barnizar.
  const e8 = {
    dur: 8,
    draw(t) {
      let w = madera(-100, -100, 1280, 2120, MAD, 4);
      const op = (x, t0, tipo) => {
        const a = eBack(prog(t, t0, 0.5)); if (a <= 0) return '';
        let s = `<g transform="translate(${x} 960) scale(${a})"><circle r="112" fill="#000" opacity=".15"/>`;
        s += tipo === 'tapon'
          ? `<circle r="100" fill="#a8743f"/><circle r="100" fill="none" stroke="#8d5a36" stroke-width="6"/><rect x="-46" y="-9" width="92" height="18" rx="9" fill="#7d5330"/>`
          : `<circle r="100" fill="#c79a66"/>${[80, 60, 40, 20].map(r => `<circle r="${r}" fill="none" stroke="#a8743f" stroke-width="4" opacity=".7"/>`).join('')}<circle r="100" fill="none" stroke="#a8743f" stroke-width="4"/>`;
        return s + `</g>`;
      };
      w += op(290, 0.5, 'tapon') + op(790, 1.5, 'haya');
      // barniz encima
      const b = eInOut(prog(t, 4.6, 2.2));
      if (b > 0) {
        w += `<rect x="-100" y="760" width="${1280 * b}" height="400" fill="#6d3f16" opacity=".42"/><rect x="-100" y="790" width="${1280 * b}" height="26" fill="#fff" opacity=".16"/>`;
        if (b < 1) w += `<g transform="translate(${-100 + 1280 * b} 960)"><rect x="-30" y="-210" width="70" height="420" rx="10" fill="#3b2a1e"/><rect x="40" y="-190" width="46" height="380" fill="#aab0b3"/><rect x="86" y="-60" width="330" height="120" rx="40" fill="${C.orange}"/></g>`;
      }
      return cam(w, 540, 960, 1) + velo(640)
        + texto(['se puede pintar', { s: 'o barnizar encima', fill: C.orange }], { y: 320, size: 92, t, t0: 4.4 })
        + rotulo('tapón', { x: 290, y: 1150, size: 46, t, t0: 0.8, t1: 4.4 }) + texto(['permite', 'reinyectar'], { x: 290, y: 1280, size: 46, weight: 700, t, t0: 1.0, t1: 4.4, fijo: true })
        + rotulo('tarugo de haya', { x: 790, y: 1150, size: 40, t, t0: 1.8, t1: 4.4 }) + texto(['lo oculta en', 'forma definitiva'], { x: 790, y: 1280, size: 46, weight: 700, t, t0: 2.0, t1: 4.4, fijo: true });
    },
  };

  // 9 — Registro: ficha con piezas tratadas, producto y fecha.
  const e9 = {
    dur: 4.8,
    draw(t) {
      const a = eBack(prog(t, 0.2, 0.5));
      let f = `<rect x="150" y="620" width="780" height="900" rx="26" fill="#000" opacity=".3" transform="translate(14 18)"/><rect x="150" y="620" width="780" height="900" rx="26" fill="${C.paper}"/><rect x="150" y="620" width="780" height="120" rx="26" fill="${C.green}"/><rect x="150" y="700" width="780" height="40" fill="${C.green}"/><rect x="440" y="590" width="200" height="64" rx="18" fill="#8a9096"/>`;
      f += linea(540, 700, 'ficha de tratamiento', { anchor: 'middle', size: 46, weight: 800 });
      f += linea(200, 830, 'PIEZAS TRATADAS', { size: 30, weight: 800, fill: '#556054' });
      ['viga', 'marco', 'mueble'].forEach((n, i) => {
        const c = eBack(prog(t, 1.0 + i * 0.5, 0.35)), y = 900 + i * 86;
        f += `<rect x="200" y="${y - 44}" width="56" height="56" rx="10" fill="none" stroke="#556054" stroke-width="5"/><path d="M210 ${y - 16} l14 16 l26 -34" fill="none" stroke="${C.orange}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="${Math.min(1, c)}"/>` + linea(290, y, n, { size: 46, fill: C.ink, weight: 700 });
      });
      [['PRODUCTO', 1210, 2.6], ['FECHA', 1360, 3.1]].forEach(([n, y, t0]) => {
        f += linea(200, y, n, { size: 30, weight: 800, fill: '#556054' }) + `<rect x="200" y="${y + 24}" width="${560 * eOut(prog(t, t0, 0.5))}" height="34" rx="10" fill="#c5cfc2"/>`;
      });
      return `<rect width="${W}" height="${H}" fill="${C.night2}"/><g transform="translate(540 1070) scale(${lerp(0.8, 1, a)}) translate(-540 -1070)" opacity="${Math.min(1, a)}">${f}</g>`
        + texto(['cada pieza tratada', { s: 'queda registrada', fill: C.orange }], { y: 320, size: 88, t, t0: 0.8 });
    },
  };

  // 10a — Verificación: se barre, pasa el tiempo; si aparecen granitos nuevos, se reinyecta por el mismo tarugo.
  const MESES = ['mes 1', 'mes 2', 'mes 3', 'mes 4', 'mes 5', 'mes 6'];
  const e10a = {
    dur: 11.5,
    draw(t) {
      let w = `<rect x="-100" y="-100" width="1280" height="1700" fill="#e9dcc0"/>` + madera(150, -100, 150, 1600, MAD, 3) + `<rect x="286" y="-100" width="14" height="1600" fill="#000" opacity=".15"/>`;
      w += madera(-100, 1500, 1280, 620, '#c9a36e', 15, '#a07c4c') + `<rect x="-100" y="1500" width="1280" height="12" fill="#000" opacity=".2"/>`;
      // tarugo ya instalado en la pieza
      w += `<circle cx="225" cy="1040" r="30" fill="#a8743f" stroke="#8d5a36" stroke-width="5"/><rect x="211" y="1036" width="28" height="8" rx="4" fill="#7d5330"/>`;
      // granitos y escoba
      const b = eInOut(prog(t, 0.6, 1.5));
      w += `<g transform="translate(${b * 900} 0)" opacity="${1 - prog(t, 1.7, 0.4)}">${monton(290, 1494, 80, 230, 70, 1, 11)}</g>`;
      if (t < 2.6) w += `<g transform="translate(${lerp(40, 1000, b)} 1490) rotate(-24)"><rect x="-12" y="-560" width="24" height="470" rx="10" fill="#8d5a36"/><path d="M-80 -100 H80 L100 0 H-100 Z" fill="#f2b705"/><path d="M-70 -20 V0 M-35 -20 V0 M0 -20 V0 M35 -20 V0 M70 -20 V0" stroke="#b8860b" stroke-width="5"/></g>`;
      // calendario: pasan los meses
      const m = prog(t, 2.4, 3.6) * (MESES.length - 1), mi = Math.floor(m), fl = m - mi;
      if (t > 2.1 && t < 7.2) {
        const a = prog(t, 2.1, 0.3) * (1 - prog(t, 6.8, 0.3));
        w += `<g opacity="${a}" transform="translate(700 760)"><rect x="-190" y="-170" width="380" height="380" rx="26" fill="#000" opacity=".2" transform="translate(10 14)"/><rect x="-190" y="-170" width="380" height="380" rx="26" fill="${C.paper}"/><rect x="-190" y="-170" width="380" height="96" rx="26" fill="${C.orange}"/><rect x="-190" y="-110" width="380" height="36" fill="${C.orange}"/>
          <circle cx="-100" cy="-170" r="16" fill="#3b4652"/><circle cx="100" cy="-170" r="16" fill="#3b4652"/>
          <g transform="translate(0 ${-fl * 26})" opacity="${1 - fl * 0.6}">${linea(0, 110, MESES[Math.min(MESES.length - 1, mi)], { anchor: 'middle', size: 104, weight: 900, fill: C.ink })}</g></g>`;
      }
      // rama: aparecen granitos nuevos → se reinyecta por el mismo tarugo
      const nv = prog(t, 7.4, 1.0);
      if (nv > 0) w += monton(250, 1494, 26, 110, 34, nv, 31);
      const gun = eOut(prog(t, 8.6, 0.6));
      if (gun > 0) {
        w += `<g transform="translate(${lerp(700, 0, gun)} 0)" opacity="${gun}"><rect x="255" y="1022" width="210" height="36" rx="10" fill="#8a9096"/><rect x="450" y="990" width="280" height="100" rx="24" fill="#3b4652"/><rect x="600" y="1080" width="80" height="230" rx="26" fill="#27323b"/><rect x="470" y="1010" width="60" height="60" rx="12" fill="${C.orange}"/></g>`;
        if (gun >= 1) w += `<circle cx="225" cy="1040" r="${40 + ((t * 80) % 50)}" fill="none" stroke="${TEAL}" stroke-width="8" opacity="${1 - ((t * 80) % 50) / 50}"/>`;
      }
      return cam(w, 540, 1000, 1) + velo(640)
        + texto([{ s: 'sin granitos nuevos', fill: C.white }, { s: '= sin actividad', fill: C.orange }], { y: 320, size: 88, t, t0: 3.2, t1: 7.2 })
        + texto(['si aparecen', 'granitos nuevos…'], { y: 320, size: 88, t, t0: 7.4, t1: 9.0 })
        + texto(['…se reinyecta por', { s: 'el mismo tarugo', fill: TEAL }], { y: 320, size: 88, t, t0: 9.1 })
        + rotulo('sin volver a perforar', { y: 1700, size: 46, t, t0: 9.6, color: TEAL });
    },
  };

  // 10b — Prevención: tres íconos.
  const e10b = {
    dur: 6.5,
    draw(t) {
      const ic = [
        `<rect x="-52" y="-6" width="104" height="44" rx="22" fill="#8d5a36"/><circle cx="-52" cy="16" r="22" fill="#c79a66"/><circle cx="-52" cy="16" r="10" fill="none" stroke="#8d5a36" stroke-width="4"/><circle cx="26" cy="-22" r="30" fill="#bfe6f2" fill-opacity=".5" stroke="#fff" stroke-width="9"/><path d="M48 2 l28 30" stroke="#fff" stroke-width="12" stroke-linecap="round"/>`,
        `<rect x="-62" y="-30" width="124" height="60" rx="8" fill="${MAD}"/><path d="M-62 -8 H62 M-62 12 H62" stroke="${VETA}" stroke-width="4" opacity=".6"/><circle cx="46" cy="-34" r="28" fill="${C.green}"/><path d="M33 -34 l10 11 l18 -22" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
        `<rect x="-14" y="-70" width="28" height="70" rx="10" fill="#8d5a36"/><rect x="-36" y="-6" width="72" height="26" rx="6" fill="#aab0b3"/><path d="M-36 20 H36 L28 66 H-28 Z" fill="${C.orange}"/>`,
      ];
      const tx = [['revisar leña y muebles usados', 'antes de entrarlos a la casa'], ['usar madera seca en horno o tratada', 'en las reparaciones'], ['proteger la madera expuesta', 'con pintura, barniz o sellador']];
      let s = `<rect width="${W}" height="${H}" fill="${C.night2}"/>`;
      ic.forEach((g, i) => {
        const a = eOut(prog(t, 0.4 + i * 1.3, 0.5)), y = 660 + i * 330;
        s += `<g opacity="${a}" transform="translate(${(1 - a) * 90} 0)"><circle cx="180" cy="${y}" r="104" fill="#243024" stroke="${C.orange}" stroke-width="6"/><g transform="translate(180 ${y}) scale(1.15)">${g}</g>
          ${linea(320, y - 12, tx[i][0], { size: 39, weight: 800 })}${linea(320, y + 44, tx[i][1], { size: 39, weight: 800, fill: C.orange })}</g>`;
      });
      return s + rotulo('prevención', { y: 380, size: 60, t, t0: 0.2 });
    },
  };

  const LOGO = (typeof window !== 'undefined' && window.LOGO_HREF) || '../img/logo-ayc.png';
  const fin = { dur: 4, draw: t => cierre(t, LOGO) };

  return {
    nombre: 'termitas-madera-seca',
    clips: ['01-lo-que-no-se-ve', '02a-granitos', '02b-sonido-hueco', '02c-alas', '03-descartar-subterranea', '04-mapear-piezas', '05-perforacion', '06-tarugo', '07a-valvula', '07b-liquido-a-la-colonia', '08-cierre-pieza', '09-registro', '10a-verificacion', '10b-prevencion', 'cierre'],
    escenas: [e1, e2a, e2b, e2c, e3, e4, e5, e6, e7a, e7b, e8, e9, e10a, e10b, fin],
  };
})();
