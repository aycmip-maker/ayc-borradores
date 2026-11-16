# VIDEO ANIMADO — Tratamiento de termita subterránea | A&C

**Ángulo:** por fuera la casa se ve bien, pero las termitas ya llegaron por debajo; cómo es el tratamiento paso a paso, desde la inspección hasta la casa libre de termitas.

**Formato:** animación 2D vertical 9:16 con voz en off. La animación es `videos/termitas-tratamiento/escenas.js`; la locución está escrita dentro del mismo archivo (`VOZ`), con el segundo exacto en que empieza cada línea, y las escenas duran lo que dura su línea.

**Fuente:** la descripción del procedimiento que dio Francisco al pedir el video (14-nov-2026) y su indicación del reporte digital con CentralMIP (15-nov-2026). No hay fuente escrita.

| Palabras habladas | Duración de la voz a 125 ppm | Duración del video | Cuándo publicar |
|---|---|---|---|
| 189 | 1:31 | 1:49 | por definir |

La diferencia entre voz y video son las pausas donde la imagen trabaja sola: el corte del suelo, el zoom al subsuelo y el vuelo del dron.

---

## GUION

**[0:00 · Escena 1 — la casa por fuera; la cámara baja al subsuelo y las termitas suben por las galerías] — GANCHO**

"Por fuera, todo se ve bien. Por debajo, las termitas ya llegaron."

**[0:06 · Escena 2 — dron: llegada a la casa]**

"Así se trata una casa con termita subterránea, paso a paso."

**[0:12 · Escena 3 — el técnico recorre la fachada con linterna; se marcan los puntos críticos]**

"Primero, la inspección: se revisan los puntos críticos."

**[0:18 · Escenas 4, 5 y 6 — primeros planos: canales de barro, madera comida, alas]**

"Se ven los canales de barro, la madera comida por dentro, y las alas sueltas junto a la ventana."

**[0:29 · Escena 7 — teléfono con el reporte de inspección]**

"La inspección queda en un reporte digital, hecho con CentralMIP."

**[0:35 · Escenas 8 y 9 — dron: perforaciones por el perímetro; primer plano del taladro con la cota]**

"Después se perfora todo el perímetro de la casa, por la parte exterior, a no más de diez centímetros de la pared."

**[0:47 · Escena 10 — el aplicador con su equipo; la cámara pasa al equipo de 100 L]**

"El aplicador va con traje, mascarilla y zapatos de seguridad. Usa un equipo de cien litros, con manguera y lanza."

**[0:57 · Escenas 11 y 12 — inserto del gatillo; el suelo en corte, la lanza baja y el líquido se expande]**

"Aprieta el gatillo con la lanza dentro de la perforación, y el líquido ingresa al subsuelo, a cuarenta centímetros."

**[1:08 · Escena 13 — corte de la casa: la barrera alrededor de los cimientos]**

"Así se forma una barrera no repelente contra las termitas."

**[1:13 · Escena 14 — zoom al subsuelo]**

"Las termitas pasan por la barrera sin detectarla, se van pasando el producto entre ellas, y eso genera una muerte en cadena."

**[1:25 · Escenas 15 y 16 — la cámara sube a la casa sana; el dron se aleja]**

"Y arriba, la casa queda sana y libre de termitas."

**[1:34 · Escena 17 — teléfono con el reporte de servicio]**

"Terminado el servicio, el tratamiento queda en otro reporte digital."

**[1:40 · Escena 18 — cierre]**

"¿Has intentado erradicarlas y siguen ahí? Nosotros te podemos dar la solución real. Escríbenos por WhatsApp."

---

## TABLA DE SINCRONIZACIÓN

Cada línea empieza en el segundo indicado y cabe dentro de su escena a 125 palabras por minuto. Se genera con `node videos/tiempos.js termitas-tratamiento`, que también escribe `voz.srt` (subtítulos, sirven para CapCut) y `voz.txt`.

| # | Escena | Tiempo en el video | Locución | Palabras |
|---|---|---|---|---|
| 1 | gancho | 0:00.2 – 0:03.1 | "Por fuera, todo se ve bien." | 6 |
| 1 | gancho | 0:03.2 – 0:06.1 | "Por debajo, las termitas ya llegaron." | 6 |
| 2 | dron-llegada | 0:06.9 – 0:12.2 | "Así se trata una casa con termita subterránea, paso a paso." | 11 |
| 3 | inspeccion | 0:13.0 – 0:16.8 | "Primero, la inspección: se revisan los puntos críticos." | 8 |
| 4 | canales-de-barro | 0:18.4 – 0:21.3 | "Se ven los canales de barro," | 6 |
| 5 | madera-comida | 0:21.9 – 0:24.3 | "la madera comida por dentro," | 5 |
| 6 | alas | 0:25.1 – 0:28.9 | "y las alas sueltas junto a la ventana." | 8 |
| 7 | reporte-inspeccion | 0:29.6 – 0:34.4 | "La inspección queda en un reporte digital, hecho con CentralMIP." | 10 |
| 8 | perforacion-aerea | 0:35.1 – 0:41.3 | "Después se perfora todo el perímetro de la casa, por la parte exterior," | 13 |
| 9 | taladro-10cm | 0:41.9 – 0:46.2 | "a no más de diez centímetros de la pared." | 9 |
| 10 | equipo-100L | 0:46.9 – 0:51.7 | "El aplicador va con traje, mascarilla y zapatos de seguridad." | 10 |
| 10 | equipo-100L | 0:51.9 – 0:56.7 | "Usa un equipo de cien litros, con manguera y lanza." | 10 |
| 11 | gatillo | 0:57.3 – 0:58.7 | "Aprieta el gatillo" | 3 |
| 12 | corte-suelo-40cm | 0:59.6 – 1:03.0 | "con la lanza dentro de la perforación," | 7 |
| 12 | corte-suelo-40cm | 1:03.1 – 1:07.4 | "y el líquido ingresa al subsuelo, a cuarenta centímetros." | 9 |
| 13 | barrera | 1:08.1 – 1:12.9 | "Así se forma una barrera no repelente contra las termitas." | 10 |
| 14 | subsuelo-muerte-en-cadena | 1:13.7 – 1:17.5 | "Las termitas pasan por la barrera sin detectarla," | 8 |
| 14 | subsuelo-muerte-en-cadena | 1:17.7 – 1:21.1 | "se van pasando el producto entre ellas," | 7 |
| 14 | subsuelo-muerte-en-cadena | 1:21.3 – 1:24.7 | "y eso genera una muerte en cadena." | 7 |
| 15 | subida-casa-sana | 1:26.1 – 1:29.0 | "Y arriba, la casa queda sana" | 6 |
| 16 | dron-salida | 1:29.9 – 1:31.8 | "y libre de termitas." | 4 |
| 17 | reporte-servicio | 1:34.4 – 1:39.2 | "Terminado el servicio, el tratamiento queda en otro reporte digital." | 10 |
| 18 | cierre | 1:39.8 – 1:42.7 | "¿Has intentado erradicarlas y siguen ahí?" | 6 |
| 18 | cierre | 1:43.0 – 1:46.4 | "Nosotros te podemos dar la solución real." | 7 |
| 18 | cierre | 1:46.5 – 1:47.9 | "Escríbenos por WhatsApp." | 3 |

---

## TEXTO EN PANTALLA (y cuándo aparece respecto de la voz)

| Escena | Texto | Aparece |
|---|---|---|
| 1 | "por fuera, todo se ve bien" → "por debajo, ya llegaron" | con cada frase |
| 2 | "tratamiento antitermitas · paso a paso, en una casa" | con la frase |
| 3 | "1 inspección · se revisan los puntos críticos" | con la frase |
| 4–6 | "canales de barro" · "madera comida" · "alas" | con cada palabra |
| 7 | "reporte digital de la inspección · con CentralMIP" | con la frase |
| 8 | "2 perforación · por todo el perímetro exterior" | con la frase |
| 9 | "a no más de 10 cm de la pared" + cota "máx. 10 cm" | con la frase |
| 10 | "3 inyección" · "traje · mascarilla · zapatos de seguridad" → "equipo de 100 litros, manguera y lanza" | cada uno con su frase |
| 11 | "aprieta el gatillo" | con la frase |
| 12 | "el suelo, en corte" → "el líquido ingresa al subsuelo" + cota "40 cm" | la cota, cuando la voz dice "cuarenta centímetros" |
| 13 | "una barrera no repelente" · "contra las termitas" | con cada parte |
| 14 | "las termitas no la detectan" → "se van pasando el producto entre ellas" → "muerte en cadena" | con cada frase |
| 16 | "una casa libre de termitas" | con la frase |
| 17 | "reporte digital del servicio · con CentralMIP" | con la frase |
| 18 | "¿has intentado erradicarlas y siguen ahí?" → logo · "nosotros te podemos dar la solución real" → "escríbenos por WhatsApp" + contacto | con cada frase |

---

## CAPTION

¿Canales de barro en un muro, madera comida o alas sueltas cerca de una ventana? Son las señales que revisamos en la inspección.

Mándanos una foto por WhatsApp y te decimos qué es.

📍 Región de Valparaíso
💬 +56 9 8154 4036
🌐 www.aycmip.cl

#Termitas #TermitaSubterránea #ControlDePlagas #Valparaíso #AYC

---

## ⚠️ ANTES DE GRABAR

### Tabla de trazabilidad

La cita es contra lo que dijo Francisco en el chat, no contra una fuente escrita.

| Frase del guion | Lo que dijo Francisco |
|---|---|
| "Primero, la inspección: se revisan los puntos críticos" | "se vea primero el paso de inspección, se revisan los puntos críticos" |
| "Se ven los canales de barro, la madera comida… y las alas" | "se ven los canales de barro, se ve la madera comida, se ven las alas" |
| "La inspección queda en un reporte digital, hecho con CentralMIP" · "Terminado el servicio… otro reporte digital" | "en la inspección y terminado el servicio, se le hace un reporte digital con Central MIP" |
| "se perfora todo el perímetro de la casa, por la parte exterior, a no más de diez centímetros de la pared" | "perforaciones por el perímetro de la casa con un taladro a no más de 10 centímetros de la pared por la parte exterior" |
| "con traje, mascarilla y zapatos de seguridad" | "con su traje de aplicador, traje, mascarilla, zapato de seguridad" |
| "un equipo de cien litros, con manguera y lanza" | "una máquina de 100 litros con manguera, con una lanza" |
| "Aprieta el gatillo… y el líquido ingresa al subsuelo, a cuarenta centímetros" | "Aprieta el gatillo… el líquido ingresa al subsuelo" · "a 40 centímetros del suelo" |
| "una barrera no repelente contra las termitas" | "generando una cobertura no repelente contra las termitas" |
| "pasan por la barrera sin detectarla, se van pasando el producto entre ellas… muerte en cadena" | "van pasando por esta barrera química que no la detectan, y se van pasando ellas el químico, haciendo que genere una muerte en cadena" |
| "la casa queda sana y libre de termitas" | "la casa de un aspecto saludable y libre de termitas" |
| Cierre | pedido de Francisco: "has intentado erradicarlas y siguen ahí, nosotros te podemos dar la solución real y un call to action" |

### Lo que no es cita

- El gancho ("Por fuera, todo se ve bien. Por debajo, las termitas ya llegaron") es redacción mía: describe la escena, no es un dato.
- "por dentro" (madera comida) y "junto a la ventana" (alas) describen lo que muestra la animación.
- "Así se trata una casa con termita subterránea, paso a paso": frase de enlace.
- "Escríbenos por WhatsApp": propuesta mía para el llamado a la acción.

### Pendientes

- **Los 40 cm.** Tu descripción dice "a 40 centímetros del suelo". La voz dice "ingresa al subsuelo, a cuarenta centímetros" y la animación lo dibuja como la profundidad a la que llega la lanza. Si los 40 cm son otra cosa (por ejemplo, la separación entre perforaciones), hay que cambiar la frase y la cota.
- **Velocidad de la voz generada.** Los tiempos están calculados a 125 palabras por minuto. Si Voice Studio lee más rápido, cada línea termina antes y queda más silencio, pero no se desincroniza: genera el audio con una pausa entre párrafos (como viene en `voz.txt`), súbelo, y yo corto por los silencios y pongo cada línea en su segundo.
- **Teléfono.** El cierre usa +56 9 8154 4036, pendiente de confirmar.
