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

## termitas-tratamiento (73 s, sin voz)

Tratamiento antitermitas en una casa, paso a paso: toma aérea, inspección (canales de barro, madera comida, alas), perforación del perímetro, inyección al suelo, barrera no repelente, zoom al subsuelo y cierre.

Trazabilidad: el procedimiento, las medidas y los efectos son los que describió Francisco al pedir el video (criterio profesional del cliente), no citas de una fuente escrita.

| Texto en pantalla | Lo que pidió Francisco |
|---|---|
| inspección · se revisan los puntos críticos | "el paso de inspección, se revisan los puntos críticos" |
| canales de barro · madera comida · alas | "se ven los canales de barro, se ve la madera comida, se ven las alas" |
| perforación · por todo el perímetro exterior · a no más de 10 cm de la pared | "perforaciones por el perímetro de la casa con un taladro a no más de 10 centímetros de la pared por la parte exterior" |
| equipo de 100 litros, manguera y lanza · aprieta el gatillo | "máquina de 100 litros con manguera, con una lanza… Aprieta el gatillo" |
| el líquido ingresa al subsuelo · una barrera no repelente contra las termitas | "el líquido ingresa al subsuelo, generando una cobertura no repelente contra las termitas" |
| las termitas no la detectan · se van pasando el producto entre ellas · muerte en cadena | "van pasando por esta barrera química que no la detectan, y se van pasando ellas el químico… muerte en cadena" |
| una casa libre de termitas | "la casa de un aspecto saludable y libre de termitas" |

Interpretaciones propias, por confirmar:

- **"40 cm"**: se dibujó como la profundidad a la que llega la lanza bajo el suelo. El pedido decía "a 40 centímetros del suelo".
- La separación entre perforaciones, la profundidad del cimiento y la forma en que se expande el líquido son ilustrativas, no medidas.
- El inspector y el aplicador son figuras genéricas, sin logos.

### Clips de apoyo para un reel grabado

`node videos/render.js termitas-tratamiento --clips --limpio` exporta cada escena como un clip suelto, sin títulos (quedan los rótulos y las cotas), para ponerlos encima del video a cámara. La escena `gancho` abre el video: la casa se ve bien por fuera y la cámara baja al subsuelo, donde las termitas van hacia los cimientos. El texto del gancho ("por fuera, todo se ve bien / por debajo, ya llegaron") es una propuesta mía, no una cita; solo aparece en el video completo.

## termitas-madera-seca (106 s, sin voz)

Tratamiento de termita de madera seca por inyección en madera, según la pauta de 10 escenas que entregó Francisco (con sus fuentes: ficha técnica A&C del sistema MABI, catálogo MABI, Morales 2023, Ponce 2024-2025, Ripa y Luppichini 2004).

Los textos en pantalla son los de la pauta, sin cambios:
"la colonia vive dentro de la madera" · "granitos = colonia activa en esa pieza" · "primero la especie, después el tratamiento" · "puede haber varias colonias en una misma casa" · "hasta 2/3 del espesor" · "tarugo con válvula antirretorno" · "deja entrar, no deja salir" · "termiticida con registro ISP" · "se puede pintar o barnizar encima" · "cada pieza tratada queda registrada" · "sin granitos nuevos = sin actividad".

Las medidas de los tarugos (vigas, marcos, cabios) y los tres consejos de prevención también son los de la pauta.

Rótulos agregados, tomados de la descripción visual de la pauta: "sonido hueco", "alas sueltas", "madera seca", "subterránea / otro tratamiento", "viga / marco / mueble", "reemplazar", "patrón en zigzag", "viga gruesa: por ambos lados", "queda ajustado a la madera", "bolita metálica", "canales de difusión", "la válvula se cierra", "llega hasta la colonia", "tapón: permite reinyectar", "tarugo de haya: lo oculta en forma definitiva", "si aparecen granitos nuevos… se reinyecta por el mismo tarugo", "sin volver a perforar", "prevención".

Ilustrativo, por revisar contra la ficha y el catálogo MABI (no los tuve a la vista):

- La forma interna de la válvula (conducto, asiento, cámara, posición de los canales de difusión) y el aspecto exterior del tarugo.
- La profundidad de cada perforación en la viga gruesa (por ambos lados) y la separación entre orificios del zigzag.
- El calendario muestra "mes 1" a "mes 6" solo para indicar que pasa el tiempo; la pauta dice "varios meses", sin cifra.
- La ficha de registro no muestra producto ni fecha reales.

Respeta la lista "no mostrar": sin inyección en muros, sin fungicidas, cebos ni aspersión, sin termitas saliendo del suelo, sin plazos de garantía, sin dosis, y las termitas no tienen ojos. Los túneles de barro aparecen solo en la escena 3, rotulados como termita subterránea.

Dura 106 s y la pauta pedía ~90 s: se ajusta al tener la locución.
