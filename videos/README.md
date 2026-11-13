# Videos animados A&C

Videos explicativos 2D en vertical (1080×1920, 30 fps), hechos con código: sin CapCut ni programas de animación.

- `motor.js` — piezas reutilizables: textos animados, rótulos, tarjeta "DÍA 30", cucaracha alemana, cocina, cierre con contacto.
- `<video>/escenas.js` — las escenas de cada video.
- `ver.html?v=<video>` — vista previa en el navegador.
- `render.js` — exporta a MP4: `node videos/render.js <video> [voz.m4a]`. Si se entrega un audio de voz, lo normaliza a −14 LUFS y lo mezcla. El MP4 queda en `videos/salida/` (no se sube al repositorio).

## cucarachas-refugio (37 s, sin voz)

Trazabilidad: todo el texto en pantalla sale de `landing/cucarachas/index.html`.

| Texto en pantalla | Frase de la landing |
|---|---|
| ≈40 huevos por cápsula · la hembra la carga hasta un día antes de que nazcan | "≈40 huevos por cápsula. La hembra de cucaracha alemana los carga hasta un día antes de que nazcan." |
| lo que ves en el mesón no es toda la población | "Lo que ves en el mesón no es toda la población, y la que no ves sigue creciendo." |
| son nocturnas · si las ves de día, ya no caben escondidas | "Son nocturnas. Si las ves a plena luz, la población creció tanto que ya no caben escondidas." |
| muchos aerosoles son repelentes · dispersan la colonia a otras zonas de la casa | "Muchos aerosoles son repelentes: dispersan la colonia a otras zonas de la casa." |

No son cita:

- El gancho ("viste una cucaracha, ¿y las que no ves?") es una pregunta, no un dato.
- Los dibujos son ilustrativos: la cantidad de cucarachas en el refugio, el plano de la casa y las piezas a las que se mueven no representan cifras.
- La landing no cita la fuente primaria de estos datos; falta amarrarlos a la lámina o paper original antes de publicar.

Pendiente de confirmar: el cierre usa el WhatsApp +56 9 8154 4036; la landing de cucarachas muestra +56 9 3667 8897.
