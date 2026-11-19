#!/usr/bin/env python3
"""Edita el reel de cucarachas sobre la grabación de Francisco.
Uso: editar.py original.mp4 alineado.json logo.png placa.png salida.mp4
- Zoom (punch-in y acercamiento lento) en los énfasis, anclado a la cara.
- Clips de la animación sobre la voz, ajustados al largo de cada frase.
- Subtítulos animados (2 a 4 palabras, palabra clave en naranja).
- Logo al 30 %, llamada de WhatsApp, nombre en la firma y placa final de 3 s.
- Audio a -14 LUFS (dos pasadas) con highpass de 80 Hz. Video sin bajar resolución ni fps."""
import json, re, subprocess, sys, os
orig, alin, logo, placa, salida = sys.argv[1:6]
V = os.path.dirname(os.path.abspath(__file__)) + '/..'
CL = V + '/salida/cucarachas-refugio-clips-limpios/'
O = json.load(open(alin, encoding='utf-8'))
DUR = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', orig]))
PLACA = 3.0

def palabra(i, w):  # tiempo de inicio de la palabra w dentro de la oración i
    for p in O[i]['palabras']:
        if re.sub(r'[^\wáéíóúüñ]', '', p['w'].lower()) == w: return p['a']
    raise SystemExit(f'no encontré "{w}" en la oración {i + 1}')

# --- clips sobre la voz: (archivo, desde, hasta)
clips = [
    (CL + '04-de-dia.mp4', O[1]['a'] - 0.05, O[2]['a'] - 0.05),
    (CL + '03-refugio.mp4', palabra(4, 'refugio') - 0.1, O[6]['a'] - 0.05),
    (CL + '02-capsula-40-huevos.mp4', O[8]['a'] - 0.05, O[9]['a'] - 0.05),
    (CL + '05-aerosol.mp4', O[11]['a'] - 0.05, O[12]['a'] - 0.05),
    (V + '/salida/cucarachas-inspeccion-clips-limpios/01-inspeccion.mp4', O[13]['a'] - 0.05, O[15]['a'] - 0.05),
]
# --- zoom de Francisco a cámara: (desde, hasta, zoom inicial, zoom final)
zooms = [
    (O[2]['a'], O[2]['b'] + 0.3, 1.08, 1.08),     # "ya no caben escondidas"
    (O[6]['a'], O[6]['b'] + 0.3, 1.05, 1.05),     # "no es toda la población"
    (O[7]['a'], O[7]['b'] + 0.3, 1.0, 1.05),      # "sigue creciendo"
    (O[9]['a'], O[9]['b'] + 0.3, 1.10, 1.10),     # "falla el aerosol"
    (O[12]['a'], O[12]['b'] + 0.3, 1.08, 1.08),   # "parte por la inspección"
    (O[15]['a'], O[16]['b'] + 0.3, 1.0, 1.07),    # cierre: acercamiento lento
    (O[17]['a'], O[17]['b'] + 0.3, 1.07, 1.07),
]
def zexpr():
    e = '1'
    for a, b, z0, z1 in reversed(zooms):
        e = f"if(between(t,{a:.3f},{b:.3f}),{z0}+({z1}-{z0})*(t-{a:.3f})/{b - a:.3f},{e})"
    return e

# --- subtítulos
CLAVES = ['nocturna', 'a plena luz', 'ya no caben', 'dónde', 'refugio', 'último tercio', 'no es toda', 'sigue creciendo',
          'cuarenta huevos', 'falla el aerosol', 'en el refugio', 'repelentes', 'la dispersan', 'la inspección', 'trampas',
          'erradicación total', 'siguen ahí', 'solución real', 'WhatsApp', 'Francisco Aracena', 'de verdad']
norm = lambda w: re.sub(r'[^\wáéíóúüñ]', '', w.lower())
def marcar(ws):  # índices de palabras que forman una frase clave
    n = [norm(w) for w in ws]; m = set()
    for c in CLAVES:
        cs = c.lower().split()
        for i in range(len(n) - len(cs) + 1):
            if n[i:i + len(cs)] == cs: m.update(range(i, i + len(cs)))
    return m
def ts(x): x = max(0, x); return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
ev = []
for i, o in enumerate(O):
    ps = o['palabras']; ws = [p['w'] for p in ps]; m = marcar(ws)
    trozos, cur = [], []
    for k, w in enumerate(ws):
        cur.append(k)
        if len(cur) >= 4 or (len(cur) >= 2 and re.search(r'[,.:;?!]$', w)) or k == len(ws) - 1:
            trozos.append(cur); cur = []
    if len(trozos) > 1 and len(trozos[-1]) == 1:  # no dejar una palabra sola al final
        trozos[-2] += trozos.pop()
    for j, tr in enumerate(trozos):
        a = ps[tr[0]]['a']; b = ps[trozos[j + 1][0]]['a'] if j + 1 < len(trozos) else o['b'] + 0.15
        txt = ' '.join((r'{\c&H0F6BF2&}' + ws[k] + r'{\c&HFFFFFF&}') if k in m else ws[k] for k in tr)
        ev.append(f"Dialogue: 0,{ts(a - 0.04)},{ts(b)},Sub,,0,0,0,,{{\\fscx82\\fscy82\\t(0,120,\\fscx100\\fscy100)}}{txt}")
# llamada de WhatsApp y nombre en la firma
ev.append(f"Dialogue: 1,{ts(O[17]['a'] - 0.1)},{ts(O[18]['a'] - 0.05)},CTA,,0,0,0,,{{\\pos(540,1130)\\fad(150,150)}}escríbenos por WhatsApp")
ev.append(f"Dialogue: 1,{ts(O[17]['a'] + 0.1)},{ts(O[18]['a'] - 0.05)},Num,,0,0,0,,{{\\pos(540,1250)\\fad(150,150)}}+56 9 8154 4036")
ev.append(f"Dialogue: 1,{ts(O[18]['a'] + 0.2)},{ts(O[18]['b'] + 0.3)},Nombre,,0,0,0,,{{\\pos(70,1120)\\fad(200,200)}}Francisco Aracena")
ev.append(f"Dialogue: 1,{ts(O[18]['a'] + 0.35)},{ts(O[18]['b'] + 0.3)},Cargo,,0,0,0,,{{\\pos(70,1200)\\fad(200,200)}}especialista en plagas urbanas")
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter ExtraBold,76,&H00FFFFFF,&H00FFFFFF,&H70000000,&H90000000,0,0,0,0,100,100,0,0,1,3,4,2,90,90,470,1
Style: CTA,Inter ExtraBold,60,&H00FFFFFF,&H00FFFFFF,&H00346B1F,&H00346B1F,0,0,0,0,100,100,0,0,3,26,0,5,0,0,0,1
Style: Num,Inter ExtraBold,72,&H000F6BF2,&H000F6BF2,&H70000000,&H90000000,0,0,0,0,100,100,0,0,1,3,4,5,0,0,0,1
Style: Nombre,Inter ExtraBold,64,&H00FFFFFF,&H00FFFFFF,&H000F6BF2,&H000F6BF2,0,0,0,0,100,100,0,0,3,16,0,7,0,0,0,1
Style: Cargo,Inter SemiBold,44,&H00FFFFFF,&H00FFFFFF,&H40130F0F,&H40130F0F,0,0,0,0,100,100,0,0,3,14,0,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + '\n'.join(ev) + '\n'
assf = os.path.splitext(salida)[0] + '.ass'; open(assf, 'w', encoding='utf-8').write(ass)

# --- audio: medir y normalizar a -14 LUFS
med = subprocess.run(['ffmpeg', '-hide_banner', '-i', orig, '-af', 'highpass=f=80,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(med[med.rindex('{'):med.rindex('}') + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
      f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")

# --- grafo de video
ins = ['-i', orig]
for c in clips: ins += ['-i', c[0]]
ins += ['-i', logo, '-loop', '1', '-t', str(PLACA), '-framerate', '30', '-i', placa]
nlogo, nplaca = len(clips) + 1, len(clips) + 2
z = zexpr()
f = [f"[0:v]fps=30,scale=w='trunc(1080*({z})/2)*2':h='trunc(1920*({z})/2)*2':eval=frame:flags=lanczos,crop=1080:1920:x='(iw-1080)*0.47':y='(ih-1920)*0.30',setsar=1[b0]"]
for k, (path, a, b) in enumerate(clips, 1):
    cd = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]))
    span = b - a; fac = min(1.8, max(0.8, span / cd))
    f.append(f"[{k}:v]fps=30,setpts=PTS*{fac:.4f},tpad=stop_mode=clone:stop_duration={max(0, span - cd * fac) + 0.5:.3f},trim=duration={span:.3f},setpts=PTS-STARTPTS+{a:.3f}/TB[c{k}]")
    f.append(f"[b{k - 1}][c{k}]overlay=enable='between(t,{a:.3f},{b:.3f})':eof_action=pass[b{k}]")
n = len(clips)
f.append(f"[b{n}]subtitles='{assf}'[s]")
f.append(f"[{nlogo}:v]scale=230:-1,format=rgba,colorchannelmixer=aa=0.30[lg]")
f.append("[s][lg]overlay=x=W-w-50:y=300,format=yuv420p,trim=duration=" + f"{DUR:.3f}" + ",setpts=PTS-STARTPTS[m]")
f.append(f"[{nplaca}:v]scale=1080:1920,setsar=1,format=yuv420p,fade=t=in:st=0:d=0.3[p]")
f.append("[m][p]concat=n=2:v=1:a=0[v]")
f.append(f"[0:a]highpass=f=80,{ln},aresample=48000,apad=pad_dur={PLACA},atrim=duration={DUR + PLACA:.3f}[a]")
cmd = ['ffmpeg', '-v', 'error', '-stats', '-y'] + ins + ['-filter_complex', ';'.join(f), '-map', '[v]', '-map', '[a]',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-maxrate', '16M', '-bufsize', '32M', '-profile:v', 'high',
       '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', salida]
subprocess.run(cmd, check=True)
print('Listo:', salida)
for c in clips: print(f"  clip {os.path.basename(c[0])}: {c[1]:.2f}–{c[2]:.2f}")
