#!/usr/bin/env python3
"""Alinea el guion con la voz grabada, palabra por palabra (alineación forzada CTC).
Usa el modelo de español de torchaudio (wav2vec2 VoxPopuli). No transcribe por su cuenta:
ubica en el audio las palabras del guion y, aparte, muestra lo que el modelo oye para
detectar frases que se dijeron distinto.
Uso: alinear_ctc.py video_o_audio guion.txt salida.json"""
import json, re, subprocess, sys
import numpy as np, torch, torchaudio

src, guion, out = sys.argv[1:4]
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
wav = torch.from_numpy(np.frombuffer(pcm, dtype=np.float32).copy())[None]
B = torchaudio.pipelines.VOXPOPULI_ASR_BASE_10K_ES
model = B.get_model().eval(); labels = B.get_labels()
idx = {c: i for i, c in enumerate(labels)}
with torch.inference_mode():
    em, _ = model(wav)
em = torch.log_softmax(em, dim=-1)
FR = wav.shape[1] / 16000 / em.shape[1]  # segundos por cuadro

# lo que el modelo oye (decodificación directa), con tiempos, para comparar con el guion
ids = em[0].argmax(-1).tolist(); oido = []; prev = None
for f, i in enumerate(ids):
    if i != prev and i != 0: oido.append((f * FR, labels[i]))
    prev = i
txt = ''.join(c for _, c in oido).replace('|', ' ')
print('LO QUE OYE EL MODELO:\n' + txt + '\n')

# guion -> oraciones y palabras
texto = open(guion, encoding='utf-8').read().replace('\n', ' ')
oraciones = [s.strip() for s in re.findall(r'[^.?!]*?[^\s.?!][^.?!]*?[.?!]+', texto) if s.strip()]
FON = {'whatsapp': 'guatsap'}
def fon(w):
    w = re.sub(r'[^a-záéíóúüñ]', '', w.lower())
    w = FON.get(w, w)
    return ''.join(c for c in w if c in idx) or 'a'
palabras = [(k, w) for k, o in enumerate(oraciones) for w in o.split()]
toks = []; lim = []
for n, (_, w) in enumerate(palabras):
    a = len(toks); toks += [idx[c] for c in fon(w)]; lim.append((a, len(toks)))
    if n < len(palabras) - 1 and '|' in idx: toks.append(idx['|'])
ali, sc = torchaudio.functional.forced_align(em, torch.tensor([toks]), blank=0)
spans = torchaudio.functional.merge_tokens(ali[0], sc[0].exp())
assert len(spans) == len(toks), (len(spans), len(toks))
res = [{'o': o, 'palabras': []} for o in oraciones]
for (k, w), (a, b) in zip(palabras, lim):
    c = float(np.mean([spans[i].score for i in range(a, b)]))
    res[k]['palabras'].append({'w': w, 'a': round(spans[a].start * FR, 3), 'b': round(spans[b - 1].end * FR, 3), 'conf': round(c, 2)})
for r in res:
    r['a'] = r['palabras'][0]['a']; r['b'] = r['palabras'][-1]['b']
    r['conf'] = round(float(np.mean([p['conf'] for p in r['palabras']])), 2)
    print(f"{r['a']:6.2f}-{r['b']:6.2f}  conf {r['conf']:.2f}  {r['o'][:80]}")
    bajas = [p['w'] for p in r['palabras'] if p['conf'] < 0.35]
    if bajas: print('        dudosas:', ' '.join(bajas))
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
