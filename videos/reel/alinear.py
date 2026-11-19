#!/usr/bin/env python3
"""Ubica cada oración del guion en la grabación sin reconocimiento de voz.
Usa las pausas (silencedetect) y el número de sílabas de cada oración: elige,
entre las pausas, los cortes que hacen más parejo el ritmo de habla.
Uso: alinear.py guion.txt silencios.txt duracion salida.json"""
import json, re, sys, math
guion, silf, dur, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
texto = open(guion, encoding='utf-8').read()
oraciones = [s.strip() for s in re.findall(r'[^.?!:]*?[^\s.?!:][^.?!]*?[.?!]+', texto.replace('\n', ' ')) if s.strip()]
V = 'aeiouáéíóúü'
def silabas(w):
    w = w.lower()
    n = 0; prev = None
    for ch in w:
        if ch in V:
            fuerte = ch in 'aeoáéíóú'
            if prev is None or (fuerte and prev):  # hiato entre fuertes o nueva vocal
                n += 1
            prev = fuerte
        else:
            prev = None
    return max(1, n)
def sil_or(o): return sum(silabas(w) for w in re.findall(r'[\wáéíóúüñ]+', o, re.I))
# silencios
v = [float(x.split(': ')[1]) for x in open(silf)]
pausas = [(v[i], v[i + 1]) for i in range(0, len(v) - 1, 2)]
if len(v) % 2: pausas.append((v[-1], dur))
ini_habla = pausas[0][1] if pausas and pausas[0][0] < 0.05 else 0.0
fin_habla = pausas[-1][0] if pausas and pausas[-1][1] >= dur - 0.05 else dur
cand = [p for p in pausas if p[0] > ini_habla + 0.3 and p[1] < fin_habla - 0.3 and p[1] - p[0] >= 0.2]
def voz(a, b):  # tiempo con voz entre a y b
    t = b - a
    for s, e in pausas:
        t -= max(0, min(b, e) - max(a, s))
    return t
S = [sil_or(o) for o in oraciones]; N = len(S)
r = voz(ini_habla, fin_habla) / sum(S)
P = [(ini_habla, ini_habla)] + cand + [(fin_habla, fin_habla)]
INF = 1e18
# dp[k][j]: oraciones 0..k-1 terminan en la pausa j
dp = [[INF] * len(P) for _ in range(N + 1)]; bk = [[-1] * len(P) for _ in range(N + 1)]
dp[0][0] = 0
for k in range(1, N + 1):
    for j in range(1, len(P)):
        if k == N and j != len(P) - 1: continue
        if k < N and j == len(P) - 1: continue
        for i in range(j):
            if dp[k - 1][i] >= INF: continue
            d = voz(P[i][1], P[j][0])
            if d <= 0.15: continue
            c = math.log(d / (r * S[k - 1])) ** 2 - (0.6 * (P[j][1] - P[j][0]) if 0 < j < len(P) - 1 else 0)
            if dp[k - 1][i] + c < dp[k][j]:
                dp[k][j] = dp[k - 1][i] + c; bk[k][j] = i
j = len(P) - 1; cortes = [j]
for k in range(N, 0, -1):
    j = bk[k][j]; cortes.append(j)
cortes = cortes[::-1]
res = []
for k in range(N):
    a, b = P[cortes[k]][1], P[cortes[k + 1]][0]
    # palabras repartidas por sílabas sobre el tiempo con voz
    ws = re.findall(r'\S+', oraciones[k]); syl = [silabas(re.sub(r'[^\wáéíóúüñ]', '', w) or 'a') for w in ws]
    tramos = []; t = a
    for s, e in pausas:
        if e <= a or s >= b: continue
        if s > t: tramos.append((t, s))
        t = max(t, e)
    if t < b: tramos.append((t, b))
    total = sum(e - s for s, e in tramos); acc = 0; palabras = []
    def en_tiempo(x):  # x: segundos de voz desde el inicio de la oración -> tiempo real
        for s, e in tramos:
            if x <= e - s: return s + x
            x -= e - s
        return b
    for w, sy in zip(ws, syl):
        d = total * sy / sum(syl)
        palabras.append({'w': w, 'a': round(en_tiempo(acc), 3), 'b': round(en_tiempo(acc + d), 3)}); acc += d
    res.append({'o': oraciones[k], 'a': round(a, 3), 'b': round(b, 3), 'voz': round(voz(a, b), 2), 'esperado': round(r * S[k], 2), 'palabras': palabras})
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for x in res: print(f"{x['a']:6.2f}-{x['b']:6.2f}  voz {x['voz']:5.2f} / esp {x['esperado']:5.2f}  {x['o'][:70]}")
