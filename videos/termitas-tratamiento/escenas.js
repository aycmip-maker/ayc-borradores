/* Video: tratamiento antitermitas en una casa, paso a paso.
   Tomas aéreas tipo dron, primeros planos y corte al subsuelo.
   El procedimiento y las medidas son los que describió Francisco (ver README de esta carpeta). */
const VIDEO = (() => {
  const { W, H, C, lerp, prog, eOut, eInOut, eBack, rnd, texto, rotulo, cierre, esc } = M;
  const TEAL = '#2ec4b6', SUELO = '#6b4a2f', SUELO2 = '#553923', CONC = '#a9a59b';

  /* ---------- utilidades ---------- */
  const cam = (inner, cx, cy, z, rot = 0) =>
    `<g transform="translate(${W / 2} ${H / 2}) rotate(${rot}) scale(${z}) translate(${-cx} ${-cy})">${inner}</g>`;
  const velo = (h = 700, o = 0.85) => M.estado.limpio ? '' :
    `<defs><linearGradient id="velo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f130f" stop-opacity="${o}"/><stop offset=".55" stop-color="#0f130f" stop-opacity="${o * 0.7}"/><stop offset="1" stop-color="#0f130f" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="${h}" fill="url(#velo)"/>`;
  const paso = (n, s, t, t0 = 0.2, t1 = 1e9) => {
    const p = M.pop(t, t0, t1); if (p.o <= 0 || M.estado.limpio) return '';
    const w = s.length * 37 + 150;
    return `<g transform="translate(${W / 2} 330) scale(${p.s})" opacity="${p.o}" filter="url(#sombra)">
      <rect x="${-w / 2}" y="-52" width="${w}" height="104" rx="52" fill="${C.night}" fill-opacity=".92"/>
      <circle cx="${-w / 2 + 52}" cy="0" r="40" fill="${C.orange}"/>
      <text x="${-w / 2 + 52}" y="19" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="54" fill="#fff">${n}</text>
      <text x="${-w / 2 + 112}" y="17" font-family="Inter, sans-serif" font-weight="900" font-size="48" letter-spacing="2" fill="#fff">${esc(s.toUpperCase())}</text></g>`;
  };
  const piedras = (n, x0, y0, w, h, seed = 0) => {
    let s = '';
    for (let i = 0; i < n; i++) s += `<ellipse cx="${x0 + rnd(i + seed) * w}" cy="${y0 + rnd(i + seed + 77) * h}" rx="${4 + rnd(i + seed + 5) * 10}" ry="${3 + rnd(i + seed + 9) * 6}" fill="${rnd(i + seed + 3) > 0.5 ? '#7d5a3a' : '#4a301c'}" opacity=".7"/>`;
    return s;
  };
  const cota = (x1, y1, x2, y2, label, o = 1, lx = 0, ly = 0) => {
    const v = x1 === x2;
    const tick = (x, y) => (v ? `M${x - 22} ${y} H${x + 22}` : `M${x} ${y - 22} V${y + 22}`);
    return `<g opacity="${o}" filter="url(#sombra)"><path d="M${x1} ${y1} L${x2} ${y2} ${tick(x1, y1)} ${tick(x2, y2)}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g transform="translate(${(x1 + x2) / 2 + lx} ${(y1 + y2) / 2 + ly})"><rect x="-120" y="-44" width="240" height="88" rx="20" fill="${C.orange}"/>
      <text y="19" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="54" fill="#fff">${esc(label)}</text></g></g>`;
  };

  /* Termita obrera vista desde arriba, mirando hacia +x. estado: 0 sana, 1 con producto, 2 muerta */
  function termita(x, y, ang, sc, t, o = {}) {
    const { seed = 0, estado = 0, walk = 1 } = o;
    const m = estado >= 2, w = m ? 0 : walk;
    const body = m ? '#9a927f' : '#f3e6c0', head = m ? '#857a62' : '#dba24a';
    let legs = '';
    for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) {
      const a = Math.sin(t * 22 + seed * 3 + k * 2 + (sd > 0 ? 1.5 : 0)) * 9 * w;
      legs += `<line x1="${-4 + k * 9}" y1="${sd * 7}" x2="${-8 + k * 11 + a}" y2="${sd * (m ? 14 : 21)}" stroke="${m ? '#7a705c' : '#c9a86a'}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${ang + (m ? 0 : Math.sin(t * 22 + seed) * 3 * w)}) scale(${sc})" opacity="${m ? 0.75 : 1}">
      ${estado === 1 ? `<circle r="34" fill="${TEAL}" opacity="${0.28 + Math.sin(t * 6 + seed) * 0.08}"/>` : ''}
      ${legs}
      <ellipse cx="-14" cy="0" rx="17" ry="9.5" fill="${body}"/>
      <path d="M-22 -8 V8 M-14 -9.5 V9.5 M-6 -8 V8" stroke="#000" stroke-opacity=".13" stroke-width="1.6"/>
      <ellipse cx="6" cy="0" rx="8" ry="7.5" fill="${body}"/>
      <circle cx="19" cy="0" r="8.5" fill="${head}"/>
      <path d="M25 -4 L36 ${-11 + Math.sin(t * 9 + seed) * 2 * w} M25 4 L36 ${11 - Math.sin(t * 9 + seed) * 2 * w}" stroke="${head}" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${estado === 1 ? `<circle cx="-14" cy="-2" r="3.2" fill="${TEAL}"/><circle cx="-4" cy="3" r="2.6" fill="${TEAL}"/><circle cx="12" cy="-2" r="2.6" fill="${TEAL}"/>` : ''}
    </g>`;
  }

  /* Persona de perfil (pies en 0,0; mira hacia +x). tipo: 'aplicador' (traje, mascarilla, guantes,
     zapato de seguridad) o 'inspector'. mano: posición local de la mano delantera. */
  function persona(x, y, s, t, o = {}) {
    const { tipo = 'aplicador', walk = 0, mano = [80, -260], mano2 = null, flip = false } = o;
    const ap = tipo === 'aplicador';
    const traje = ap ? '#eef1f2' : C.green, pant = ap ? '#e1e6e8' : '#3b4652', piel = '#e2b48c';
    const leg = ph => {
      const a = Math.sin(t * 8 + ph) * 20 * walk * Math.PI / 180;
      const fx = Math.sin(a) * 250, fy = -250 + Math.cos(a) * 250 - Math.max(0, Math.sin(t * 8 + ph + 1.5)) * 14 * walk;
      return `<line x1="0" y1="-250" x2="${fx}" y2="${fy - 22}" stroke="${pant}" stroke-width="50" stroke-linecap="round"/>
        <path d="M${fx - 30} ${fy - 34} h62 a26 26 0 0 1 26 26 v8 h-88 z" fill="#1c1f22"/><path d="M${fx + 30} ${fy - 34} h2 a26 26 0 0 1 26 26 v8 h-28 z" fill="#f2b705"/>
        <rect x="${fx - 32}" y="${fy - 4}" width="92" height="8" rx="3" fill="#0c0d0e"/>`;
    };
    const arm = (h, col) => {
      const sx = 6, sy = -425, ex = (sx + h[0]) / 2 - 10, ey = (sy + h[1]) / 2 + 42;
      return `<path d="M${sx} ${sy} Q${ex} ${ey} ${h[0]} ${h[1]}" fill="none" stroke="${col}" stroke-width="38" stroke-linecap="round"/>
        <circle cx="${h[0]}" cy="${h[1]}" r="23" fill="${ap ? '#2a6fdb' : piel}"/>`;
    };
    const cabeza = ap
      ? `<circle cx="-4" cy="-505" r="56" fill="${traje}"/><circle cx="4" cy="-500" r="42" fill="${piel}"/>
         <rect x="6" y="-524" width="46" height="26" rx="10" fill="#bfe6f2" stroke="#3b4652" stroke-width="5"/>
         <path d="M8 -492 h40 a10 10 0 0 1 10 10 v14 a16 16 0 0 1 -16 16 h-34 z" fill="#4a5560"/>
         <circle cx="30" cy="-470" r="15" fill="#e0457b"/><circle cx="30" cy="-470" r="7" fill="#b62f5e"/>
         <path d="M-46 -480 Q-10 -470 8 -478" stroke="#3b4652" stroke-width="5" fill="none"/>`
      : `<circle cx="2" cy="-500" r="44" fill="${piel}"/><path d="M-44 -508 a46 46 0 0 1 90 -6 h22 v12 h-112 z" fill="${C.orange}"/>
         <circle cx="22" cy="-498" r="4.5" fill="#3b2a1e"/>`;
    return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      ${mano2 ? arm(mano2, ap ? '#dfe4e6' : '#195a2b') : ''}
      ${leg(Math.PI)}${leg(0)}
      <rect x="-58" y="-460" width="116" height="235" rx="42" fill="${traje}"/>
      ${ap ? `<path d="M0 -455 V-235" stroke="#c9d0d3" stroke-width="5"/><rect x="-58" y="-262" width="116" height="16" fill="#c9d0d3"/>` : `<rect x="-58" y="-262" width="116" height="20" fill="#2a3138"/>`}
      ${cabeza}${arm(mano, traje)}
    </g>`;
  }

  /* ---------- mundo 1: vista aérea (dron) ---------- */
  // Casa centrada en (1000,1000). hoyos: 0..1 perforaciones que aparecen; barrera: 0..1
  const PERIM = (() => { // puntos del perímetro, a pocos cm del muro
    const pts = [], x0 = 632, y0 = 722, x1 = 1368, y1 = 1278, d = 64;
    for (let x = x0; x <= x1; x += d) pts.push([x, y0]);
    for (let y = y0 + d; y <= y1; y += d) pts.push([x1, y]);
    for (let x = x1 - d; x >= x0; x -= d) pts.push([x, y1]);
    for (let y = y1 - d; y > y0; y -= d) pts.push([x0, y]);
    return pts;
  })();
  function aerea(t, o = {}) {
    const { hoyos = 0, barrera = 0, camion = true, sana = false } = o;
    let s = `<rect x="-1600" y="-1600" width="5200" height="5200" fill="#5aa34a"/>`;
    for (let i = 0; i < 110; i++) s += `<ellipse cx="${-1400 + rnd(i) * 4800}" cy="${-1400 + rnd(i + 200) * 4800}" rx="${60 + rnd(i + 9) * 120}" ry="${40 + rnd(i + 4) * 80}" fill="${rnd(i + 2) > 0.5 ? '#63ad52' : '#4f9642'}" opacity=".6"/>`;
    // calle y vereda
    s += `<rect x="-1600" y="1720" width="5200" height="330" fill="#454b52"/><rect x="-1600" y="1670" width="5200" height="50" fill="#c9c6bd"/>`;
    for (let i = 0; i < 26; i++) s += `<rect x="${-1560 + i * 200}" y="1878" width="100" height="12" fill="#f3f6f0" opacity=".8"/>`;
    // sitio, entrada de auto, sendero
    s += `<rect x="330" y="420" width="1340" height="1250" fill="#6ab35a" stroke="#f3f6f0" stroke-width="10"/>`;
    s += `<rect x="1400" y="1290" width="200" height="380" fill="#bdb8ae"/><rect x="950" y="1290" width="100" height="380" fill="#d8d2c4"/>`;
    // radier perimetral
    s += `<rect x="610" y="700" width="780" height="600" rx="8" fill="#cfcabf"/>`;
    if (barrera > 0) s += `<rect x="622" y="712" width="756" height="576" rx="14" fill="none" stroke="${TEAL}" stroke-width="${44 + Math.sin(t * 3) * 6}" opacity="${0.55 * barrera}" filter="url(#brillo)"/>
      <rect x="626" y="716" width="748" height="568" rx="10" fill="none" stroke="${TEAL}" stroke-width="20" opacity="${0.85 * barrera}"/>`;
    // perforaciones
    const n = Math.floor(hoyos * PERIM.length);
    for (let i = 0; i < n; i++) {
      const [x, y] = PERIM[i], fresh = i === n - 1 && hoyos < 1;
      s += `<circle cx="${x}" cy="${y}" r="${fresh ? 15 : 9}" fill="${fresh ? C.orange : '#2b2018'}"/>`;
    }
    // sombra y techo de la casa
    s += `<rect x="700" y="790" width="660" height="500" fill="#000" opacity=".22"/>`;
    s += `<rect x="670" y="760" width="660" height="480" fill="#f4e9d2"/><rect x="655" y="745" width="690" height="255" fill="#b5533c"/><rect x="655" y="1000" width="690" height="255" fill="#9c4532"/>`;
    for (let i = 1; i < 14; i++) s += `<line x1="${655 + i * 49.3}" y1="745" x2="${655 + i * 49.3}" y2="1255" stroke="#000" stroke-opacity=".1" stroke-width="4"/>`;
    s += `<rect x="655" y="992" width="690" height="16" fill="#7d3526"/><rect x="1150" y="820" width="70" height="70" fill="#8a8479"/><rect x="1164" y="834" width="42" height="42" fill="#2b2018"/>`;
    // árboles
    [[470, 560, 95], [1540, 600, 110], [450, 1380, 85], [1560, 1090, 70], [520, 980, 60], [130, 300, 120], [1900, 900, 130], [-100, 1200, 120], [1850, 250, 100]].forEach(([x, y, r], i) => {
      const sw = Math.sin(t * 1.4 + i) * 4;
      s += `<circle cx="${x + 26}" cy="${y + 30}" r="${r}" fill="#000" opacity=".2"/><circle cx="${x + sw}" cy="${y}" r="${r}" fill="#2f7d3a"/><circle cx="${x - r * 0.25 + sw}" cy="${y - r * 0.25}" r="${r * 0.62}" fill="#3f9649"/>`;
    });
    if (sana) for (let i = 0; i < 22; i++) s += `<circle cx="${380 + rnd(i + 40) * 1240}" cy="${1340 + rnd(i + 60) * 290}" r="9" fill="${['#ffd84a', '#f26b0f', '#fff'][i % 3]}"/>`;
    // camioneta de servicio (sin logos)
    if (camion) s += `<g transform="translate(1500 1480)"><rect x="-58" y="-128" width="124" height="262" rx="22" fill="#000" opacity=".22"/><rect x="-62" y="-135" width="124" height="262" rx="22" fill="#f3f6f0"/>
      <rect x="-50" y="-90" width="100" height="56" rx="10" fill="#27323b"/><rect x="-62" y="10" width="124" height="16" fill="${C.orange}"/><rect x="-50" y="36" width="100" height="78" rx="8" fill="#d9dedb"/></g>`;
    return s;
  }

  /* ---------- mundo 2: casa de frente, con el subsuelo debajo ---------- */
  const GY = 1300; // nivel del suelo
  function casa(t, o = {}) {
    const { barrera = 0, sana = false, barro = true, sub = true } = o;
    let s = `<defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ec1ee"/><stop offset="1" stop-color="#d4eefb"/></linearGradient>
      <linearGradient id="tierra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SUELO}"/><stop offset="1" stop-color="#3a2616"/></linearGradient></defs>`;
    s += `<rect x="-400" y="-900" width="1880" height="${GY + 900}" fill="url(#cielo)"/>`;
    s += `<circle cx="880" cy="250" r="${74 + Math.sin(t * 2) * 4}" fill="#ffd84a"/><circle cx="880" cy="250" r="120" fill="#ffd84a" opacity=".22"/>`;
    [[180, 300, 1], [700, 120, 0.7], [-200, 520, 0.8]].forEach(([x, y, k], i) => {
      const cx = x + ((t * 14 * k + i * 90) % 400);
      s += `<g opacity=".92" transform="translate(${cx} ${y}) scale(${k})"><ellipse rx="110" ry="38" fill="#fff"/><ellipse cx="-50" cy="-26" rx="56" ry="40" fill="#fff"/><ellipse cx="34" cy="-36" rx="70" ry="50" fill="#fff"/></g>`;
    });
    s += `<ellipse cx="80" cy="${GY}" rx="420" ry="200" fill="#4d9a48"/><ellipse cx="1050" cy="${GY}" rx="380" ry="150" fill="#57a651"/>`;
    // árbol
    s += `<rect x="20" y="900" width="44" height="400" fill="#6d4a2c"/><circle cx="42" cy="840" r="150" fill="#2f7d3a"/><circle cx="-10" cy="790" r="96" fill="#3f9649"/><circle cx="110" cy="800" r="80" fill="#3f9649"/>`;
    // casa
    s += `<rect x="690" y="560" width="74" height="170" fill="#8a8479"/>`;
    s += `<rect x="200" y="820" width="680" height="430" fill="#f4e9d2"/><rect x="200" y="820" width="680" height="30" fill="#000" opacity=".08"/>`;
    s += `<polygon points="140,836 540,540 940,836" fill="#b5533c"/><polygon points="140,836 940,836 920,862 160,862" fill="#8d3e2c"/>`;
    s += `<rect x="186" y="1240" width="708" height="60" fill="${CONC}"/><rect x="186" y="1240" width="708" height="10" fill="#fff" opacity=".2"/>`;
    // puerta y ventanas
    s += `<rect x="470" y="990" width="140" height="250" fill="#f3f6f0"/><rect x="484" y="1004" width="112" height="236" fill="#7a4a2a"/><rect x="498" y="1022" width="84" height="80" rx="6" fill="#8d5a36"/><rect x="498" y="1122" width="84" height="100" rx="6" fill="#8d5a36"/><circle cx="578" cy="1120" r="9" fill="#f1c453"/>`;
    [[250, 930], [680, 930]].forEach(([x, y]) => {
      s += `<rect x="${x}" y="${y}" width="160" height="170" fill="#f3f6f0"/><rect x="${x + 14}" y="${y + 14}" width="132" height="142" fill="#9fd6f5"/><path d="M${x + 80} ${y + 14} V${y + 156} M${x + 14} ${y + 85} H${x + 146}" stroke="#f3f6f0" stroke-width="10"/><rect x="${x - 12}" y="${y + 166}" width="184" height="18" rx="4" fill="#e3ddcf"/>`;
      if (sana) s += `<rect x="${x - 4}" y="${y + 184}" width="168" height="34" rx="6" fill="#8d5a36"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${x + 20 + i * 30}" cy="${y + 176}" r="13" fill="${['#f26b0f', '#ffd84a', '#e0457b'][i % 3]}"/>`).join('')}`;
    });
    if (barro && !sana) s += `<path d="M330 1300 q-8 -20 4 -34 q10 -14 -2 -30 M338 1262 q14 -8 18 -22 M700 1300 q10 -24 -2 -40 q-8 -12 2 -24" fill="none" stroke="#7a5230" stroke-width="9" stroke-linecap="round"/>`;
    // suelo y subsuelo
    s += `<rect x="-400" y="${GY}" width="1880" height="1700" fill="url(#tierra)"/>` + piedras(140, -380, GY + 50, 1840, 1500, 3);
    s += `<path d="M-400 ${GY + 520} Q200 ${GY + 470} 540 ${GY + 540} T1480 ${GY + 500} V${GY + 560} Q900 ${GY + 610} 540 ${GY + 590} T-400 ${GY + 580}Z" fill="#000" opacity=".12"/>`;
    // cimientos
    s += `<rect x="200" y="${GY}" width="70" height="270" fill="#8f8b82"/><rect x="810" y="${GY}" width="70" height="270" fill="#8f8b82"/><rect x="270" y="${GY}" width="540" height="46" fill="#9d988e"/>`;
    // galerías de termitas subterráneas
    if (!sana) s += `<path d="M-400 ${GY + 700} Q-100 ${GY + 640} 60 ${GY + 420} T190 ${GY + 60} M-400 ${GY + 900} Q300 ${GY + 980} 700 ${GY + 760} T960 ${GY + 420} T892 ${GY + 60}" fill="none" stroke="#2f1e10" stroke-width="13" stroke-linecap="round" opacity=".75"/>`;
    if (barrera > 0) {
      const g = `M186 ${GY} h-100 q-20 0 -20 20 v300 q0 40 40 40 h60 q20 0 20 -20 z M894 ${GY} h100 q20 0 20 20 v300 q0 40 -40 40 h-60 q-20 0 -20 -20 z`;
      s += `<path d="${g}" fill="${TEAL}" opacity="${barrera * (0.5 + Math.sin(t * 3) * 0.12)}" filter="url(#brillo)"/><path d="${g}" fill="${TEAL}" opacity="${barrera * 0.72}"/>`;
    }
    s += `<rect x="-400" y="${GY - 4}" width="1880" height="30" fill="#4f9a45"/>`;
    if (!sub) s += `<rect x="-400" y="${GY}" width="1880" height="1700" fill="#4f9a45"/><rect x="470" y="${GY}" width="140" height="1700" fill="#d8d2c4"/>`;
    if (sana) for (let i = 0; i < 12; i++) s += `<circle cx="${-60 + i * 22 + (i > 5 ? 940 : 0)}" cy="${GY - 10 - rnd(i) * 14}" r="9" fill="${['#ffd84a', '#fff', '#f26b0f'][i % 3]}"/>`;
    return s;
  }

  /* ================= ESCENAS ================= */

  // 0 — Gancho: la casa se ve bien por fuera; la cámara baja al subsuelo y las termitas van hacia los cimientos.
  const qb = (a, c, b, u) => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
  const RUTAS = [
    [[[-400, 2000], [-100, 1940], [60, 1720]], [[60, 1720], [220, 1500], [190, 1360]]],
    [[[-400, 2200], [300, 2280], [700, 2060]], [[700, 2060], [1100, 1840], [960, 1720]], [[960, 1720], [820, 1600], [892, 1360]]],
  ];
  const enRuta = (r, u) => { const n = r.length, k = Math.min(n - 1, Math.floor(u * n)), g = r[k]; return qb(g[0], g[1], g[2], u * n - k); };
  const gancho = {
    dur: 5,
    draw(t) {
      let w = casa(t);
      RUTAS.forEach((r, k) => {
        for (let i = 0; i < 9; i++) {
          const u = (t * 0.07 + i / 9 + k * 0.05) % 1, [x, y] = enRuta(r, u), [x2, y2] = enRuta(r, Math.min(1, u + 0.01));
          w += termita(x, y + (i % 2 ? 5 : -5), Math.atan2(y2 - y, x2 - x) * 180 / Math.PI, 0.8, t, { seed: i + k * 9 });
        }
      });
      const p = eInOut(prog(t, 1.1, 1.3)), q = prog(t, 2.4, 2.6);
      return cam(w, lerp(540, 300, p), lerp(790, 1640, p) - q * 40, lerp(1.22, 1.75, p) + q * 0.15) + velo(640, 0.85)
        + texto(['por fuera,', 'todo se ve bien'], { y: 330, size: 96, t, t0: 0.2, t1: 1.5 })
        + texto([{ s: 'por debajo,' }, { s: 'ya llegaron', fill: C.orange }], { y: 330, size: 108, t, t0: 2.3 });
    },
  };

  // 1 — Dron: llegada a la casa.
  const dron = {
    dur: 5.5,
    draw(t) {
      const p = eInOut(prog(t, 0, 5.5));
      return cam(aerea(t), 1000, lerp(1180, 1020, p), lerp(0.62, 1.0, p), lerp(-14, 5, p)) + velo(760)
        + texto(['tratamiento', { s: 'antitermitas', fill: C.orange }], { y: 360, size: 124, t, t0: 0.4 })
        + texto(['paso a paso, en una casa'], { y: 590, size: 54, weight: 700, t, t0: 1.2 });
    },
  };

  // 2 — Inspección: recorrido por los puntos críticos.
  const PUNTOS = [[310, 1262], [540, 1236], [760, 1104]];
  const inspeccion = {
    dur: 5.5,
    draw(t) {
      const p = eInOut(prog(t, 0, 5.5)), px = lerp(60, 640, eInOut(prog(t, 0.2, 4.6)));
      let w = casa(t, { sub: false });
      PUNTOS.forEach(([x, y], i) => {
        const a = prog(t, 1.2 + i * 1.1, 0.3); if (a <= 0) return;
        const r = 30 + ((t * 60 + i * 20) % 50);
        w += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.orange}" stroke-width="7" opacity="${a * (1 - (r - 30) / 50)}"/><circle cx="${x}" cy="${y}" r="20" fill="${C.orange}" opacity="${a}" stroke="#fff" stroke-width="6"/>`;
      });
      const walking = t > 0.2 && t < 4.8 ? 1 : 0;
      w += `<polygon points="${px + 68},${GY - 262} ${px + 250},${GY - 120} ${px + 250},${GY - 10}" fill="#fff6c9" opacity=".45"/>`;
      w += persona(px, GY + 6, 0.62, t, { tipo: 'inspector', walk: walking, mano: [100, -330] });
      w += `<rect x="${px + 52}" y="${GY - 220}" width="34" height="16" rx="5" fill="#1c1f22" transform="rotate(38 ${px + 62} ${GY - 205})"/>`;
      return cam(w, lerp(500, 560, p), lerp(880, 960, p), lerp(1.02, 1.3, p)) + velo(620, 0.8)
        + paso(1, 'inspección', t) + texto(['se revisan los puntos críticos'], { y: 470, size: 54, weight: 700, t, t0: 1.0 });
    },
  };

  // 3a — Primer plano: canales de barro en el sobrecimiento.
  const barro = {
    dur: 3.2,
    draw(t) {
      const z = lerp(1.0, 1.12, prog(t, 0, 3.2));
      let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#b8b3a8"/>`;
      for (let i = 0; i < 160; i++) w += `<circle cx="${rnd(i) * W}" cy="${rnd(i + 300) * 1560}" r="${2 + rnd(i + 8) * 5}" fill="${rnd(i + 2) > 0.5 ? '#a39e93' : '#c9c4b9'}"/>`;
      w += `<rect x="-100" y="0" width="1280" height="360" fill="#f4e9d2"/><rect x="-100" y="345" width="1280" height="22" fill="#000" opacity=".12"/>`;
      const g = eOut(prog(t, 0.15, 1.9));
      const tubos = ['M300 1560 C280 1380 350 1290 320 1120 S380 880 340 700 S300 520 330 410', 'M320 1120 C420 1060 470 980 500 850 S560 700 540 600', 'M720 1560 C760 1400 690 1300 730 1150 S800 950 770 800'];
      tubos.forEach(d => {
        w += `<path d="${d}" pathLength="1" stroke-dasharray="${g} 1" fill="none" stroke="#5f3f24" stroke-width="44" stroke-linecap="round"/>
          <path d="${d}" pathLength="1" stroke-dasharray="${g} 1" fill="none" stroke="#86603a" stroke-width="30" stroke-linecap="round"/>
          <path d="${d}" fill="none" stroke="#a47a4c" stroke-width="9" stroke-linecap="round" stroke-dasharray="3 26" opacity="${g}"/>`;
      });
      w += `<rect x="-100" y="1560" width="1280" height="500" fill="${SUELO}"/><rect x="-100" y="1548" width="1280" height="34" fill="#4f9a45"/>`;
      const lx = 420 + Math.sin(t * 1.6) * 150, ly = 950 + Math.cos(t * 1.3) * 190;
      const luz = `<defs><radialGradient id="luz"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient></defs>
        <circle cx="${lx}" cy="${ly}" r="1700" fill="url(#luz)"/>`;
      return cam(w + luz, 540, 960, z) + rotulo('canales de barro', { y: 1700, size: 56, t, t0: 0.5 });
    },
  };

  // 3b — Primer plano: madera comida.
  const madera = {
    dur: 3.2,
    draw(t) {
      const z = lerp(1.12, 1.0, prog(t, 0, 3.2));
      let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#3b2a1e"/>`;
      [[380, 340], [740, 420], [1180, 340]].forEach(([y, h], k) => {
        w += `<rect x="-100" y="${y}" width="1280" height="${h}" fill="${k === 1 ? '#b98654' : '#a87648'}"/>`;
        for (let i = 0; i < 9; i++) { const yy = y + 20 + i * (h - 40) / 8; w += `<path d="M-100 ${yy} Q300 ${yy + rnd(i + k * 9) * 30 - 15} 600 ${yy} T1180 ${yy + rnd(i + k) * 20 - 10}" fill="none" stroke="#7d5330" stroke-width="3" opacity=".5"/>`; }
        w += `<rect x="-100" y="${y}" width="1280" height="10" fill="#000" opacity=".25"/>`;
      });
      // galerías que siguen la veta
      let gal = `<path d="M180 800 Q360 760 620 790 T940 800 Q980 900 930 1010 Q700 1090 420 1070 T170 1020 Q130 900 180 800Z" fill="#3a2414"/>`;
      for (let i = 0; i < 7; i++) { const yy = 815 + i * 36; gal += `<path d="M${190 + rnd(i) * 40} ${yy} Q500 ${yy + rnd(i + 5) * 26 - 13} ${920 - rnd(i + 2) * 50} ${yy + 6}" fill="none" stroke="#d2a06a" stroke-width="${6 + rnd(i + 3) * 5}" stroke-linecap="round" stroke-dasharray="${90 + rnd(i) * 160} ${30 + rnd(i + 7) * 50}"/>`; }
      for (let i = 0; i < 26; i++) gal += `<circle cx="${220 + rnd(i + 20) * 680}" cy="${1040 + rnd(i + 30) * 30}" r="${3 + rnd(i) * 4}" fill="#caa475"/>`;
      for (let i = 0; i < 6; i++) { const x = 240 + ((t * (40 + i * 9) + i * 130) % 640); gal += termita(x, 832 + i * 36, Math.sin(t * 2 + i) * 8, 1.15, t, { seed: i }); }
      w += gal;
      // la capa superficial se desprende con el punzón
      const b = eInOut(prog(t, 0.5, 0.9));
      w += `<g transform="translate(${b * 140} ${b * 520}) rotate(${b * 24} 560 920)" opacity="${1 - prog(t, 1.2, 0.5)}"><path d="M170 790 Q360 750 620 780 T950 790 Q990 900 940 1020 Q700 1100 420 1080 T160 1030 Q120 900 170 790Z" fill="#b98654"/><path d="M200 880 Q500 860 920 890 M200 960 Q520 950 920 970" stroke="#7d5330" stroke-width="3" fill="none" opacity=".5"/></g>`;
      const px = lerp(1100, 800, eOut(prog(t, 0.1, 0.5))) + prog(t, 1.3, 0.6) * 400;
      w += `<g transform="translate(${px} ${lerp(500, 760, eOut(prog(t, 0.1, 0.5)))}) rotate(40)"><rect x="-8" y="0" width="16" height="170" fill="#c9d0d3"/><polygon points="-8,170 8,170 0,205" fill="#aab0b3"/><rect x="-28" y="-190" width="56" height="195" rx="22" fill="${C.orange}"/></g>`;
      return cam(w, 540, 960, z) + rotulo('madera comida', { y: 1700, size: 56, t, t0: 1.1 });
    },
  };

  // 3c — Primer plano: alas junto a la ventana.
  const alas = {
    dur: 3.2,
    draw(t) {
      const z = lerp(1.0, 1.1, prog(t, 0, 3.2));
      let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#f4e9d2"/>`;
      w += `<rect x="60" y="-100" width="960" height="1010" fill="#f3f6f0"/><rect x="110" y="-100" width="860" height="950" fill="#9fd6f5"/><rect x="520" y="-100" width="40" height="950" fill="#f3f6f0"/>`;
      w += `<polygon points="110,850 500,850 300,-100 110,-100" fill="#fff" opacity=".25"/>`;
      w += `<polygon points="0,910 1080,910 1180,1500 -100,1500" fill="#ece5d6"/><rect x="-100" y="1500" width="1280" height="70" fill="#d6cdb9"/><rect x="-100" y="1570" width="1280" height="500" fill="#e9dcc0"/>`;
      w += `<polygon points="110,910 520,910 620,1500 60,1500" fill="#fff" opacity=".35"/>`;
      for (let i = 0; i < 26; i++) {
        const a = prog(t, 0.2 + rnd(i + 3) * 1.5, 0.35); if (a <= 0) continue;
        const x = 120 + rnd(i) * 840, y = 990 + rnd(i + 50) * 440, r = rnd(i + 9) * 180 - 90, k = 0.8 + ((y - 990) / 440) * 0.5;
        w += `<g transform="translate(${x} ${y - (1 - eOut(a)) * 120}) rotate(${r + (1 - a) * 60}) scale(${k})" opacity="${a}">
          <ellipse cx="2" cy="5" rx="58" ry="15" fill="#000" opacity=".1"/>
          <ellipse rx="58" ry="15" fill="#fff" fill-opacity=".62" stroke="#b9a777" stroke-width="2.5"/><path d="M-56 0 H52 M-40 -5 Q0 -12 44 -4 M-40 5 Q0 11 44 4" stroke="#b9a777" stroke-width="1.6" fill="none" opacity=".8"/></g>`;
      }
      return cam(w, 540, 960, z) + rotulo('alas', { y: 1700, size: 60, t, t0: 0.6 });
    },
  };

  // 4a — Dron: perforaciones por todo el perímetro exterior.
  const perforacion = {
    dur: 5.5,
    draw(t) {
      const p = prog(t, 0, 5.5), h = prog(t, 0.6, 4.2);
      let w = aerea(t, { hoyos: h });
      const i = Math.min(PERIM.length - 1, Math.floor(h * PERIM.length)), [x, y] = PERIM[i];
      if (h > 0 && h < 1) w += `<g transform="translate(${x + 34} ${y + 30})"><ellipse cx="6" cy="10" rx="34" ry="26" fill="#000" opacity=".25"/><ellipse rx="30" ry="24" fill="#eef1f2"/><circle r="15" fill="#f2b705"/></g>`;
      return cam(w, 1000 + Math.sin(p * 3) * 30, 1010, lerp(1.2, 1.32, p), lerp(6, -8, eInOut(p))) + velo(700)
        + paso(2, 'perforación', t) + texto(['por todo el perímetro exterior'], { y: 470, size: 54, weight: 700, t, t0: 0.9 });
    },
  };

  // 4b — Primer plano: el taladro, a no más de 10 cm de la pared.
  const taladro = {
    dur: 4,
    draw(t) {
      const gy = 1330, hx = 400, d = eInOut(prog(t, 0.5, 1.9)) * 250 - eInOut(prog(t, 2.4, 0.6)) * 900;
      const vib = t > 0.5 && t < 2.4 ? Math.sin(t * 90) * 4 : 0;
      let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#cfe9f7"/><ellipse cx="800" cy="${gy}" rx="500" ry="170" fill="#57a651"/>`;
      w += `<rect x="-100" y="-100" width="390" height="${gy + 100}" fill="#f4e9d2"/><rect x="-100" y="${gy - 260}" width="390" height="260" fill="${CONC}"/><rect x="270" y="-100" width="20" height="${gy + 100}" fill="#000" opacity=".1"/>`;
      w += `<rect x="-100" y="${gy}" width="1280" height="800" fill="${SUELO}"/>` + piedras(50, -100, gy + 90, 1280, 500, 11);
      w += `<rect x="290" y="${gy}" width="890" height="70" fill="#c9c6bd"/><rect x="290" y="${gy}" width="890" height="12" fill="#fff" opacity=".3"/><rect x="-100" y="${gy}" width="390" height="420" fill="#8f8b82"/>`;
      w += `<rect x="${hx - 15}" y="${gy}" width="30" height="${eInOut(prog(t, 0.5, 1.9)) * 250 + (t > 0.5 ? 20 : 0)}" fill="#2b2018"/>`;
      // polvo
      if (t > 0.6 && t < 2.4) for (let i = 0; i < 12; i++) { const a = ((t * 2.2 + rnd(i)) % 1); w += `<circle cx="${hx + (rnd(i + 4) - 0.5) * 240 * a}" cy="${gy - 10 - a * 120 * rnd(i + 8)}" r="${7 + rnd(i) * 10}" fill="#d8d2c4" opacity="${(1 - a) * 0.8}"/>`; }
      // taladro
      w += `<g transform="translate(${hx + vib} ${gy - 300 + d})"><rect x="-10" y="0" width="20" height="300" fill="#8a9096"/><path d="M-10 30 L10 60 M-10 90 L10 120 M-10 150 L10 180 M-10 210 L10 240" stroke="#5c6166" stroke-width="5"/>
        <rect x="-26" y="-50" width="52" height="54" rx="8" fill="#3b4652"/><rect x="-62" y="-250" width="124" height="205" rx="26" fill="${C.orange}"/><rect x="-62" y="-190" width="124" height="26" fill="#b04c08"/>
        <rect x="58" y="-230" width="150" height="62" rx="24" fill="#27323b"/><rect x="170" y="-230" width="54" height="190" rx="22" fill="#27323b"/>
        <circle cx="200" cy="-110" r="50" fill="#2a6fdb"/><rect x="186" y="-640" width="60" height="540" rx="30" fill="#eef1f2" transform="rotate(52 216 -110)"/></g>`;
      const c = prog(t, 2.9, 0.3);
      w += cota(290, gy - 110, hx, gy - 110, 'máx. 10 cm', c, 150, -78);
      return cam(w, 500, 1100, 1.12) + velo(620, 0.8) + texto(['a no más de 10 cm', { s: 'de la pared', fill: C.orange }], { y: 330, size: 88, t, t0: 0.3 });
    },
  };

  // 5a — Plano general: aplicador, lanza, manguera y equipo de 100 litros.
  const equipo = {
    dur: 4.5,
    draw(t) {
      const gy = 1420, p = prog(t, 0, 4.5);
      let w = `<defs><linearGradient id="cielo2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ec1ee"/><stop offset="1" stop-color="#d4eefb"/></linearGradient></defs><rect x="-300" y="-300" width="1700" height="2500" fill="url(#cielo2)"/>`;
      w += `<ellipse cx="900" cy="${gy}" rx="600" ry="210" fill="#57a651"/><rect x="-300" y="-300" width="430" height="${gy + 300}" fill="#f4e9d2"/><rect x="-300" y="${gy - 150}" width="430" height="150" fill="${CONC}"/><rect x="-60" y="560" width="140" height="260" fill="#9fd6f5" stroke="#f3f6f0" stroke-width="16"/>`;
      w += `<rect x="-300" y="${gy}" width="1700" height="900" fill="#4f9a45"/><rect x="130" y="${gy}" width="330" height="900" fill="#c9c6bd"/>`;
      // manguera
      const sw = Math.sin(t * 2) * 14;
      w += `<path d="M196 ${gy - 330} C320 ${gy - 230} 380 ${gy + 40 + sw} 560 ${gy + 30} S780 ${gy - 20 - sw} 830 ${gy - 130}" fill="none" stroke="#1c1f22" stroke-width="16" stroke-linecap="round"/>`;
      // equipo de 100 L
      w += `<g transform="translate(900 ${gy})"><ellipse cx="0" cy="8" rx="210" ry="22" fill="#000" opacity=".2"/>
        <rect x="-160" y="-70" width="320" height="34" rx="8" fill="#3b4652"/><circle cx="-110" cy="-34" r="40" fill="#1c1f22"/><circle cx="-110" cy="-34" r="16" fill="#8a9096"/><circle cx="110" cy="-34" r="40" fill="#1c1f22"/><circle cx="110" cy="-34" r="16" fill="#8a9096"/>
        <rect x="-150" y="-330" width="230" height="262" rx="34" fill="#f3f6f0" stroke="#c9d0d3" stroke-width="6"/><rect x="-144" y="${-230 + Math.sin(t * 5) * 4}" width="218" height="156" rx="26" fill="${TEAL}" opacity=".55"/>
        <rect x="-70" y="-358" width="70" height="32" rx="8" fill="${C.orange}"/><rect x="84" y="-190" width="78" height="122" rx="12" fill="#3b4652"/><circle cx="123" cy="-140" r="20" fill="#f2b705"/>
        <path d="M150 -330 q60 -60 30 -140" fill="none" stroke="#3b4652" stroke-width="14" stroke-linecap="round"/>
        <text x="-35" y="-250" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="64" fill="#27323b">100 L</text></g>`;
      // lanza y aplicador (mira hacia la casa)
      w += `<rect x="188" y="${gy - 330}" width="12" height="330" fill="#aab0b3"/><rect x="176" y="${gy - 390}" width="36" height="74" rx="10" fill="#27323b"/><rect x="150" y="${gy - 372}" width="90" height="20" rx="8" fill="#27323b"/>`;
      w += persona(400, gy + 4, 0.92, t, { tipo: 'aplicador', flip: true, mano: [205, -385], mano2: [190, -330] });
      return cam(w, lerp(520, 470, p), lerp(1020, 1080, p), lerp(0.9, 1.04, p)) + velo(620, 0.8)
        + paso(3, 'inyección', t) + texto(['equipo de 100 litros, manguera y lanza'], { y: 470, size: 46, weight: 700, t, t0: 0.9 });
    },
  };

  // 5b — Inserto: aprieta el gatillo.
  const gatillo = {
    dur: 2.2,
    draw(t) {
      const g = eOut(prog(t, 0.5, 0.3)), sh = t > 0.6 ? Math.sin(t * 60) * 3 : 0;
      let w = `<rect x="-100" y="-100" width="1280" height="2120" fill="#57a651"/>`;
      for (let i = 0; i < 12; i++) w += `<circle cx="${rnd(i) * W}" cy="${rnd(i + 20) * H}" r="${80 + rnd(i + 40) * 140}" fill="#fff" opacity=".05"/>`;
      w += `<g transform="translate(${sh} 0)"><rect x="500" y="-100" width="70" height="2200" fill="#aab0b3"/><rect x="500" y="-100" width="20" height="2200" fill="#fff" opacity=".3"/>
        <rect x="462" y="620" width="146" height="520" rx="40" fill="#27323b"/>
        <g transform="rotate(${-18 + g * 18} 608 700)"><rect x="596" y="690" width="44" height="330" rx="20" fill="${C.orange}"/></g>
        <path d="M462 760 C200 780 60 980 -140 1100" fill="none" stroke="#1c1f22" stroke-width="64" stroke-linecap="round"/>
        <path d="M1200 700 C900 720 760 760 640 800" fill="none" stroke="#eef1f2" stroke-width="210" stroke-linecap="round"/>
        <rect x="420" y="700" width="${250 - g * 16}" height="330" rx="90" fill="#2a6fdb"/><rect x="420" y="700" width="${250 - g * 16}" height="330" rx="90" fill="none" stroke="#1f56ad" stroke-width="8"/>
        <path d="M440 790 H${650 - g * 16} M440 870 H${650 - g * 16} M440 950 H${650 - g * 16}" stroke="#1f56ad" stroke-width="7"/></g>`;
      if (t > 0.6) for (let i = 0; i < 8; i++) { const yy = 1160 + ((t * 900 + i * 120) % 900); w += `<rect x="524" y="${yy}" width="22" height="60" rx="11" fill="${TEAL}" opacity=".9"/>`; }
      return cam(w, 540, 960, lerp(1.0, 1.08, prog(t, 0, 2.2))) + rotulo('aprieta el gatillo', { y: 1700, size: 54, t, t0: 0.4 });
    },
  };

  // 5c — El suelo se corta: el líquido ingresa al subsuelo (lanza a 40 cm).
  const corte = {
    dur: 7.5,
    draw(t) {
      const sy = 760, K = 8, hx = 300 + 9 * K, tip = sy + 40 * K;
      let w = `<rect x="-100" y="-100" width="1280" height="${sy + 100}" fill="#cfe9f7"/><ellipse cx="820" cy="${sy}" rx="460" ry="120" fill="#57a651"/>`;
      // corte del subsuelo
      w += `<defs><linearGradient id="tierra2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SUELO}"/><stop offset="1" stop-color="#3a2616"/></linearGradient></defs>
        <rect x="-100" y="${sy}" width="1280" height="1400" fill="url(#tierra2)"/>` + piedras(110, 310, sy + 70, 760, 1050, 21);
      w += `<path d="M300 ${sy + 520} Q700 ${sy + 480} 1180 ${sy + 540} V${sy + 600} Q700 ${sy + 560} 300 ${sy + 590}Z" fill="#000" opacity=".12"/>`;
      // líquido: se expande desde la punta de la lanza y forma la barrera junto al cimiento
      const q = prog(t, 2.6, 4.2);
      if (q > 0) {
        let b = '';
        const src = [[hx, tip, 150], [hx + 10, tip - 110, 130], [hx - 6, tip - 220, 110], [hx + 70, tip + 60, 120], [hx + 120, tip - 60, 110], [hx + 30, tip + 130, 100], [hx + 150, tip - 190, 90], [hx - 10, sy + 70, 80], [hx + 190, tip + 30, 80]];
        src.forEach(([x, y, r], i) => { const a = eOut(prog(q, i * 0.07, 0.6)); b += `<circle cx="${x}" cy="${y}" r="${r * a}"/>`; });
        w += `<g fill="${TEAL}" opacity="${0.42 + Math.sin(t * 4) * 0.05}" filter="url(#brillo)">${b}</g><g fill="${TEAL}" opacity=".7">${b}</g>`;
        for (let i = 0; i < 14; i++) { const a = (t * 0.9 + rnd(i)) % 1, an = rnd(i + 5) * Math.PI * 2; w += `<circle cx="${hx + 20 + Math.cos(an) * a * 190}" cy="${tip - 40 + Math.sin(an) * a * 200}" r="${6 + rnd(i + 2) * 6}" fill="#bff3ec" opacity="${(1 - a) * 0.9}"/>`; }
      }
      // muro, cimiento y radier (en corte)
      w += `<rect x="-100" y="-100" width="400" height="${sy + 100}" fill="#f4e9d2"/><rect x="-100" y="${sy - 170}" width="400" height="170" fill="${CONC}"/><rect x="60" y="${sy}" width="240" height="${60 * K}" fill="#8f8b82"/><rect x="-100" y="${sy}" width="160" height="60" fill="#9d988e"/>`;
      for (let i = 0; i < 9; i++) w += `<path d="M${70 + i * 30} ${sy + 60 * K} l60 -60" stroke="#000" stroke-opacity=".08" stroke-width="5" transform="translate(0 ${-i * 46})"/>`;
      w += `<rect x="300" y="${sy}" width="880" height="44" fill="#c9c6bd"/><rect x="${hx - 13}" y="${sy}" width="26" height="44" fill="#2b2018"/>`;
      // tapa: el suelo antes del corte, que cae y deja ver el subsuelo
      const c = eInOut(prog(t, 0.5, 1.0));
      if (c < 1) w += `<g transform="translate(0 ${c * 1400})"><rect x="-100" y="${sy}" width="1280" height="1400" fill="#4f9a45"/><rect x="300" y="${sy}" width="330" height="1400" fill="#c9c6bd"/><rect x="-100" y="${sy}" width="400" height="1400" fill="#8f8b82"/></g>`;
      const l = prog(t, 0.15, 0.4) * (1 - prog(t, 1.3, 0.3));
      w += `<rect x="-100" y="${sy - 5}" width="${1280 * prog(t, 0.15, 0.4)}" height="10" fill="#fff" opacity="${l}"/>`;
      // lanza entrando por la perforación
      const ins = eInOut(prog(t, 1.3, 1.0)), ly = lerp(sy - 400, tip, ins);
      w += `<rect x="${hx - 6}" y="${ly - 1200}" width="12" height="1200" fill="#c9d0d3"/><polygon points="${hx - 6},${ly} ${hx + 6},${ly} ${hx},${ly + 18}" fill="#8a9096"/>`;
      w += cota(760, sy + 22, 760, tip, '40 cm', prog(t, 2.3, 0.3), 150, 0);
      return cam(w, 540, lerp(900, 1010, eInOut(prog(t, 0.4, 2))), 1) + velo(600, 0.85)
        + texto(['el suelo, en corte'], { y: 330, size: 84, t, t0: 0.4, t1: 2.8 })
        + texto(['el líquido ingresa', { s: 'al subsuelo', fill: TEAL }], { y: 300, size: 96, t, t0: 2.9 });
    },
  };

  // 6 — Plano general en corte: la barrera rodea los cimientos.
  const barrera = {
    dur: 4.5,
    draw(t) {
      const p = eInOut(prog(t, 0, 4.5));
      return cam(casa(t, { barrera: eOut(prog(t, 0.3, 1.6)) }), 540, lerp(1330, 1420, p), lerp(0.94, 1.08, p)) + velo(620, 0.85)
        + texto(['una barrera', { s: 'no repelente', fill: TEAL }], { y: 300, size: 104, t, t0: 0.4 })
        + rotulo('contra las termitas', { y: 1720, size: 46, t, t0: 1.6, color: TEAL });
    },
  };

  // 7 — Zoom al subsuelo: no la detectan, se la traspasan, muerte en cadena.
  const N_A = 6, N_B = 18;
  const subsuelo = {
    dur: 11,
    draw(t) {
      let w = `<rect x="-600" y="-200" width="2400" height="2400" fill="${SUELO2}"/>` + piedras(150, -500, 0, 2200, 1920, 31);
      // cámara del nido (izquierda), galerías y cimiento (derecha)
      w += `<ellipse cx="60" cy="1130" rx="330" ry="270" fill="#2f1e10"/>`;
      const ys = [930, 1070, 1210, 1340];
      ys.forEach((y, i) => { w += `<path d="M260 ${1060 + i * 40} Q520 ${y - 40} 760 ${y} T1100 ${y + 10}" fill="none" stroke="#2f1e10" stroke-width="72" stroke-linecap="round"/>`; });
      w += `<rect x="1090" y="-200" width="700" height="2400" fill="#8f8b82"/><rect x="1090" y="-200" width="26" height="2400" fill="#000" opacity=".15"/>`;
      // zona tratada
      w += `<rect x="640" y="-200" width="330" height="2400" fill="${TEAL}" opacity="${0.3 + Math.sin(t * 3) * 0.05}" filter="url(#brillo)"/><rect x="670" y="-200" width="270" height="2400" fill="${TEAL}" opacity=".3"/>`;
      for (let i = 0; i < 26; i++) w += `<circle cx="${660 + rnd(i + 3) * 290}" cy="${700 + rnd(i + 9) * 900}" r="${4 + rnd(i) * 5}" fill="#bff3ec" opacity="${0.35 + Math.sin(t * 3 + i) * 0.2}"/>`;
      // A: obreras que cruzan la barrera y vuelven al nido
      const pathA = (i, u) => { // u: 0 nido → 1 cimiento
        const y = ys[i % 4] - 6 + (i > 3 ? 16 : 0), x = lerp(250, 1040, u);
        return [x, lerp(1060 + (i % 4) * 40, y, Math.min(1, u * 1.8)) + Math.sin(u * 9 + i) * 8];
      };
      for (let i = 0; i < N_A; i++) {
        const d = i * 0.28, go = prog(t, 0.2 + d, 2.4), back = prog(t, 3.3 + d, 2.2);
        const u = go - back, [x, y] = pathA(i, u), [x2, y2] = pathA(i, u + (back > 0 ? -0.02 : 0.02));
        const muerte = 7.6 + i * 0.25, est = t > muerte ? 2 : (go > 0.55 ? 1 : 0);
        const fx = back >= 1 ? x - 40 - (i % 3) * 46 : x, fy = back >= 1 ? y + (i % 2 ? 60 : -50) : y;
        w += termita(fx, fy, Math.atan2(y2 - y, x2 - x) * 180 / Math.PI, 1.7, t, { seed: i, estado: est, walk: go > 0 && back < 1 ? 1 : 0.2 });
      }
      // B: las que estaban en el nido reciben el producto por contacto
      for (let i = 0; i < N_B; i++) {
        const an = rnd(i + 70) * Math.PI * 2, r = 40 + rnd(i + 80) * 210;
        const bx = 60 + Math.cos(an) * r * 1.05, by = 1130 + Math.sin(an) * r * 0.85;
        const dist = Math.hypot(bx - 250, by - 1100), inf = 5.6 + dist / 260, muerte = inf + 1.5;
        const est = t > muerte ? 2 : (t > inf ? 1 : 0);
        const jx = est < 2 ? Math.sin(t * (0.8 + rnd(i)) + i) * 20 : Math.sin(muerte * (0.8 + rnd(i)) + i) * 20;
        const jy = est < 2 ? Math.cos(t * (0.7 + rnd(i + 1)) + i) * 14 : Math.cos(muerte * (0.7 + rnd(i + 1)) + i) * 14;
        w += termita(bx + jx, by + jy, rnd(i + 90) * 360 + (est < 2 ? Math.sin(t + i) * 30 : 0), 1.5, t, { seed: i + 10, estado: est, walk: 0.5 });
        if (est === 1 && t - inf < 0.5) w += `<circle cx="${bx + jx}" cy="${by + jy}" r="${30 + (t - inf) * 120}" fill="none" stroke="${TEAL}" stroke-width="6" opacity="${1 - (t - inf) * 2}"/>`;
      }
      const cx = lerp(lerp(700, 620, eInOut(prog(t, 0, 3))), 250, eInOut(prog(t, 3.6, 2.2)));
      const z = lerp(lerp(0.7, 1.25, eOut(prog(t, 0, 1.2))), 1.5, eInOut(prog(t, 3.6, 2.2)));
      return cam(w, cx, 1130, z) + velo(640, 0.9)
        + texto(['las termitas', { s: 'no la detectan', fill: TEAL }], { y: 300, size: 100, t, t0: 0.5, t1: 3.9 })
        + texto(['se van pasando', { s: 'el producto', fill: TEAL }, 'entre ellas'], { y: 260, size: 92, t, t0: 4.0, t1: 7.5 })
        + texto([{ s: 'muerte', fill: C.white }, { s: 'en cadena', fill: C.orange }], { y: 300, size: 124, t, t0: 7.6 })
        + rotulo('barrera química', { x: 760, y: 1700, size: 44, t, t0: 0.9, t1: 3.6, color: TEAL });
    },
  };

  // 8a — La cámara sube desde el subsuelo hasta la casa.
  const subida = {
    dur: 4.5,
    draw(t) {
      const p = eInOut(prog(t, 0.2, 3.4));
      return cam(casa(t, { barrera: 1, sana: true }), 540, lerp(1900, 900, p), lerp(1.25, 1.0, p)) ;
    },
  };

  // 8b — Dron: se aleja, con la casa protegida.
  const salida = {
    dur: 4.5,
    draw(t) {
      const p = eInOut(prog(t, 0, 4.5));
      return cam(aerea(t, { hoyos: 1, barrera: 1, camion: false, sana: true }), 1000, lerp(1010, 1120, p), lerp(1.15, 0.62, p), lerp(-6, 12, p)) + velo(700)
        + texto(['una casa', { s: 'libre de termitas', fill: C.orange }], { y: 340, size: 104, t, t0: 0.5 });
    },
  };

  const LOGO = (typeof window !== 'undefined' && window.LOGO_HREF) || '../img/logo-ayc.png';
  const fin = { dur: 7.5, draw: t => cierre(t, LOGO) };

  return {
    nombre: 'termitas-tratamiento',
    clips: ['gancho', 'dron-llegada', 'inspeccion', 'canales-de-barro', 'madera-comida', 'alas', 'perforacion-aerea', 'taladro-10cm', 'equipo-100L', 'gatillo', 'corte-suelo-40cm', 'barrera', 'subsuelo-muerte-en-cadena', 'subida-casa-sana', 'dron-salida', 'cierre'],
    escenas: [gancho, dron, inspeccion, barro, madera, alas, perforacion, taladro, equipo, gatillo, corte, barrera, subsuelo, subida, salida, fin],
  };
})();
