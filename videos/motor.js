/* Motor de animación A&C — videos explicativos 2D en vertical (1080×1920).
   Cada video es una lista de escenas { dur, draw(t) } que devuelven SVG.
   El mismo código sirve para la vista previa (ver.html) y para exportar a MP4 (render.js). */
const M = (() => {
  const W = 1080, H = 1920;
  const C = {
    night: '#0f130f', night2: '#181e17', paper: '#f3f6f0', white: '#ffffff',
    ink: '#141a14', orange: '#f26b0f', green: '#1f6b34', greenSoft: '#dcead9',
    bug: '#d08a47', bugDark: '#5a3418', bugLight: '#e0a162',
  };

  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const prog = (t, t0, d) => clamp((t - t0) / d);
  const eOut = p => 1 - Math.pow(1 - p, 3);
  const eInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const eBack = p => { const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const defs = `<defs>
    <filter id="sombra" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity=".55"/></filter>
    <filter id="brillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>`;

  /* Aparición con rebote entre t0 y t1 (desaparece con fundido). Devuelve {s, o}. */
  function pop(t, t0, t1 = 1e9) {
    const a = prog(t, t0, 0.35), b = prog(t, t1 - 0.25, 0.25);
    return { s: lerp(0.8, 1, eBack(a)), o: a * (1 - b) };
  }

  /* Texto centrado multilínea. lines: 'texto' | ['a','b'] | [{s:'a',fill:'#..'}] */
  function texto(lines, o = {}) {
    const { x = W / 2, y = 400, size = 84, fill = C.white, lh = 1.12, t = 1, t0 = 0, t1 = 1e9, weight = 900, sombra = true } = o;
    const arr = [].concat(lines).map(l => (typeof l === 'string' ? { s: l } : l));
    const p = pop(t, t0, t1);
    if (p.o <= 0) return '';
    const spans = arr.map((l, i) =>
      `<text x="0" y="${i * size * lh}" font-size="${l.size || size}" fill="${l.fill || fill}">${esc(l.s)}</text>`).join('');
    return `<g transform="translate(${x} ${y}) scale(${p.s})" opacity="${p.o}" text-anchor="middle"
      font-family="Inter, 'Inter Display', sans-serif" font-weight="${weight}" letter-spacing="-1.5"
      ${sombra ? 'filter="url(#sombra)"' : ''}>${spans}</g>`;
  }

  /* Etiqueta de concepto clave (pastilla con borde), como los rótulos del video de referencia. */
  function rotulo(s, o = {}) {
    const { x = W / 2, y = 1500, size = 50, color = C.orange, t = 1, t0 = 0, t1 = 1e9 } = o;
    const p = pop(t, t0, t1);
    if (p.o <= 0) return '';
    const w = s.length * size * 0.72 + 80, h = size * 1.75;
    return `<g transform="translate(${x} ${y}) scale(${p.s})" opacity="${p.o}" filter="url(#sombra)">
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 4}" fill="${C.night}" fill-opacity=".9" stroke="${color}" stroke-width="5"/>
      <text y="${size * 0.35}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="${size}" letter-spacing="2" fill="${C.white}">${esc(s.toUpperCase())}</text></g>`;
  }

  /* Tarjeta de tiempo tipo "DÍA 30" (para líneas de tiempo con datos de fuente). */
  function tarjetaDia(s, o = {}) {
    const { y = 900, t = 1, t0 = 0, t1 = 1e9, color = C.orange } = o;
    const p = pop(t, t0, t1);
    if (p.o <= 0) return '';
    return `<g opacity="${p.o}"><rect x="0" y="${y - 170}" width="${W}" height="340" fill="${C.night}" fill-opacity=".82"/>
      <g transform="translate(${W / 2} ${y}) scale(${p.s})" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900">
      <text y="55" font-size="190" fill="${color}" filter="url(#brillo)" opacity=".8">${esc(s)}</text>
      <text y="55" font-size="190" fill="${C.white}">${esc(s)}</text></g></g>`;
  }

  /* Cucaracha alemana vista desde arriba (mirando hacia -y). Dos bandas oscuras en el pronoto,
     que es el rasgo que distingue a Blattella germanica. walk: 0 quieta, 1 caminando. */
  function cucaracha(x, y, ang, sc, t, o = {}) {
    const { ooteca = false, seed = 0, walk = 1, color = C.bug } = o;
    const ph = seed * 2.4;
    const leg = (side, ly, base, k) => {
      const a = base + Math.sin(t * 20 + ph + k * 2.1) * 16 * walk;
      const r = a * Math.PI / 180, x0 = side * 30, x1 = side * (30 + 62 * Math.cos(r)), y1 = ly + 62 * Math.sin(r);
      const x2 = x1 + side * 22, y2 = y1 + 34;
      return `<path d="M${x0} ${ly} L${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${C.bugDark}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    };
    const ant = side => {
      const sw = Math.sin(t * 5 + ph + side) * 14;
      return `<path d="M${side * 9} -98 Q${side * 40 + sw} -170 ${side * 78 + sw * 1.6} -238" fill="none" stroke="${C.bugDark}" stroke-width="4" stroke-linecap="round"/>`;
    };
    const sway = Math.sin(t * 20 + ph) * 2.5 * walk;
    return `<g transform="translate(${x} ${y}) rotate(${ang + sway}) scale(${sc})">
      ${leg(-1, -40, -155, 0)}${leg(1, -40, -155, 1)}${leg(-1, 5, 10, 1)}${leg(1, 5, 10, 0)}${leg(-1, 45, 35, 0)}${leg(1, 45, 35, 1)}
      ${ant(-1)}${ant(1)}
      ${ooteca ? `<g><rect x="-17" y="86" width="34" height="58" rx="13" fill="#a8652c"/>
        ${[98, 108, 118, 128].map(v => `<line x1="-15" x2="15" y1="${v}" y2="${v}" stroke="#7c4519" stroke-width="2.5"/>`).join('')}</g>` : ''}
      <ellipse cx="0" cy="-90" rx="19" ry="15" fill="#8a5426"/>
      <ellipse cx="0" cy="22" rx="45" ry="82" fill="${color}"/>
      <path d="M0 -40 L0 100" stroke="${C.bugDark}" stroke-opacity=".45" stroke-width="3"/>
      <path d="M-30 -10 Q-34 50 -14 96 M30 -10 Q34 50 14 96" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="5"/>
      <ellipse cx="0" cy="-56" rx="40" ry="31" fill="${C.bugLight}"/>
      <rect x="-21" y="-78" width="10" height="44" rx="5" fill="${C.bugDark}"/>
      <rect x="11" y="-78" width="10" height="44" rx="5" fill="${C.bugDark}"/>
    </g>`;
  }

  /* Cocina de frente. modo: 'noche' | 'dia'. rayosX (0..1) abre el mueble y muestra el refugio. */
  function cocina(modo, t, rayosX = 0) {
    const n = modo === 'noche';
    const wall = n ? '#1d2a33' : '#f1e3c4', line = n ? '#263642' : '#e2d0a9';
    const top = n ? '#39424a' : '#8a8f96', cab = n ? '#3a2a1f' : '#b0703c', cabIn = n ? '#463325' : '#c5854d';
    const floor = n ? '#151b20' : '#d9c7a2';
    let s = `<rect width="${W}" height="${H}" fill="${wall}"/>`;
    for (let i = 0; i <= 9; i++) s += `<line x1="${i * 120}" y1="0" x2="${i * 120}" y2="1150" stroke="${line}" stroke-width="4"/>`;
    for (let j = 0; j <= 9; j++) s += `<line x1="0" y1="${j * 120 + 70}" x2="${W}" y2="${j * 120 + 70}" stroke="${line}" stroke-width="4"/>`;
    // ventana
    s += `<rect x="640" y="640" width="330" height="360" rx="14" fill="${n ? '#0c1626' : '#9fd6f5'}" stroke="${n ? '#4a5560' : '#fff'}" stroke-width="16"/>`;
    s += n
      ? `<circle cx="880" cy="740" r="46" fill="#f4f0d8"/><circle cx="862" cy="728" r="40" fill="#0c1626"/>
         ${[0, 1, 2, 3, 4].map(i => `<circle cx="${680 + rnd(i) * 250}" cy="${680 + rnd(i + 9) * 260}" r="${3 + Math.sin(t * 3 + i) * 1.5}" fill="#fff" opacity=".8"/>`).join('')}`
      : `<circle cx="870" cy="750" r="${58 + Math.sin(t * 2) * 4}" fill="#ffd84a"/><circle cx="870" cy="750" r="92" fill="#ffd84a" opacity=".25"/>`;
    s += `<line x1="805" y1="640" x2="805" y2="1000" stroke="${n ? '#4a5560' : '#fff'}" stroke-width="10"/>`;
    // piso, muebles, mesón
    s += `<rect y="1650" width="${W}" height="270" fill="${floor}"/>`;
    s += `<rect y="1190" width="${W}" height="460" fill="${cab}"/>`;
    [40, 380, 720].forEach(x => {
      s += `<rect x="${x}" y="1235" width="320" height="370" rx="10" fill="${cabIn}"/><circle cx="${x + 275}" cy="1420" r="13" fill="${n ? '#8d7a52' : '#f1c453'}"/>`;
    });
    s += `<rect y="1150" width="${W}" height="46" fill="${top}"/><rect y="1150" width="${W}" height="10" fill="#fff" opacity=".15"/>`;
    if (rayosX > 0) {
      s += `<g opacity="${rayosX}"><rect x="60" y="1225" width="960" height="395" rx="18" fill="#120c08" stroke="${C.orange}" stroke-width="6" stroke-dasharray="22 14"/></g>`;
    }
    return s;
  }

  /* Cierre estándar con logo y contacto. */
  function cierre(t, logoHref) {
    const a = eOut(prog(t, 0.1, 0.5));
    return `<rect width="${W}" height="${H}" fill="${C.night}"/>
      <circle cx="540" cy="760" r="${520 * a}" fill="${C.night2}"/>
      <g transform="translate(540 700) scale(${lerp(0.7, 1, eBack(a))})" opacity="${a}">
        <rect x="-250" y="-115" width="500" height="230" rx="36" fill="#fff"/>
        <image href="${logoHref}" x="-198" y="-77" width="396" height="154"/></g>
      ${texto(['control de plagas urbanas'], { y: 930, size: 62, t, t0: 0.5, fill: C.white })}
      ${texto([{ s: 'Región de Valparaíso' }, { s: '+56 9 8154 4036', fill: C.orange }, { s: 'www.aycmip.cl' }], { y: 1120, size: 64, lh: 1.5, t, t0: 0.9, weight: 700 })}
      ${texto(['Resolución sanitaria Nº 402/2020 · SEREMI de Salud Valparaíso'], { y: 1500, size: 30, t, t0: 1.4, weight: 600, fill: '#aab5a7', sombra: false })}`;
  }

  /* Compone el cuadro en el tiempo t con fundido entre escenas. */
  function frame(video, t) {
    const X = 0.4; let acc = 0, out = '';
    video.escenas.forEach((e, i) => {
      const t0 = acc, t1 = acc + e.dur; acc = t1;
      if (t < t0 - 0.001 || t >= t1 + X) return;
      if (t >= t1 && i === video.escenas.length - 1) return;
      const op = i === 0 ? 1 : prog(t, t0, X);
      out += `<g opacity="${op}">${e.draw(t - t0)}</g>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%">${defs}<rect width="${W}" height="${H}" fill="${C.night}"/>${out}</svg>`;
  }
  const duracion = v => v.escenas.reduce((a, e) => a + e.dur, 0);

  return { W, H, C, clamp, lerp, prog, eOut, eInOut, eBack, rnd, esc, pop, texto, rotulo, tarjetaDia, cucaracha, cocina, cierre, frame, duracion };
})();
if (typeof module !== 'undefined') module.exports = M;
