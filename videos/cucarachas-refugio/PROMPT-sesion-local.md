Edita el reel de cucarachas de A&C con el video que grabé y que está en mi carpeta Videos_AYC.

1. Clona https://github.com/aycmip-maker/ayc-borradores y cámbiate a la rama `claude/hacer-videos-nwp8zn`. Todo lo que necesitas está en `videos/`:
   - `videos/cucarachas-refugio/reel-guion.md`: el guion que grabé y la PAUTA DE EDICIÓN (qué clip va con cada frase, qué palabra se resalta, dónde va zoom y dónde la fuente).
   - `videos/render.js` y `videos/motor.js`: el motor que genera las animaciones.
2. Si falta algo, instálalo: Node.js, ffmpeg y el Chromium de Playwright (`npm i playwright` y `npx playwright install chromium` dentro de `videos/`).
3. Exporta los clips de la animación sin títulos: `node videos/render.js cucarachas-refugio --clips --limpio` (quedan en `videos/salida/cucarachas-refugio-clips-limpios/`).
4. Busca mi grabación en Videos_AYC (el video más reciente; si hay varios, pregúntame cuál es) y edítala según la pauta:
   - Corta los silencios de más de 0,5 s (silencedetect ≈ −42 dB, margen 0,25 s) y normaliza el audio a −14 LUFS con highpass de 80 Hz.
   - Ubica cada frase del guion por las pausas que dejé entre párrafos. Si mi grabación no coincide palabra por palabra con el guion, avísame qué cambió antes de poner subtítulos.
   - Inserta los clips sobre mi voz donde dice la pauta (cocina de día, refugio, cápsula 40 huevos, aerosol). Falta el clip de la inspección: créalo con el mismo motor (linterna que encuentra el refugio, trampa de monitoreo con conteo, tratamiento dentro del refugio).
   - Subtítulos animados de 2 a 4 palabras, blancos con la palabra clave en naranja #f26b0f, sombra suave, tercio inferior.
   - Zoom de 105 a 110 % en los énfasis marcados; nunca sobre los clips animados.
   - Logo `img/logo-ayc.png` arriba a la derecha al 30 %, y placa final de 3 s con logo, +56 9 8154 4036 y www.aycmip.cl.
   - Fuentes en pequeño: todavía no tengo las referencias. Deja el espacio y pregúntame antes de escribir cualquier fuente; no inventes ninguna.
5. Exporta en 1080×1920, H.264, 30 fps, 8 a 12 Mbps, AAC, y guarda el resultado en Videos_AYC como `reel-cucarachas-v1.mp4`.
6. No cambies el texto del guion ni el cierre: primero "¿Has intentado erradicarlas y siguen ahí? Nosotros te podemos dar la solución real. Escríbenos por WhatsApp." y al final "Soy Francisco Aracena, especialista en plagas urbanas, y acá vas a entender cómo funcionan las plagas de verdad."
