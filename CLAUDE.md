# Instrucciones para Claude en este proyecto (A&C)

## Pensar en el fin antes de hacer trabajar a Francisco

Regla pedida por Francisco el 19-nov-2026, después de un error grave.

Antes de proponer un flujo que depende de que Francisco haga algo (grabar, exportar, subir, conectar), verifica primero que el último paso es posible y díselo al comienzo, no al final.

Qué pasó: pidió un reel que él grabaría y me pasaría para editar. Le escribí el guion y la pauta de edición sin comprobar cómo me iba a llegar la grabación. Al final:

- El adjunto del chat no aceptó el video por el peso (un video de referencia de 4,7 MB sí había pasado; una grabación de 1 a 2 minutos pesa mucho más).
- Agregar carpeta solo existe en sesiones locales, y en esta cuenta la conexión de carpetas a sesiones en la nube aparece como "not_available".
- Google Drive está bloqueado por la red del entorno, y él no quiere subir sus videos a Drive.

Le hice trabajar y probar cosas que no podían funcionar.

Cómo aplicarlo:

- Si el trabajo termina con "me pasas el archivo", resuelve el canal de entrada antes de empezar: revisa `list_computer_folders`, si Drive está permitido y el tamaño probable del archivo, y dile de frente qué camino sirve.
- Si un camino no está disponible o no se puede verificar, avísalo antes de pedirle que grabe, exporte o configure algo.
- No le des pasos que no comprobaste. Si no sabes si algo va a funcionar, dilo así.
- No le pidas cortar sus videos. Lo descartó.

## Cierre fijo de sus videos

Primero la llamada y después la firma, siempre en este orden:

1. "¿Has intentado erradicarlas y siguen ahí? Nosotros te podemos dar la solución real. Escríbenos por WhatsApp."
2. "Soy Francisco Aracena, especialista en plagas urbanas, y acá vas a entender cómo funcionan las plagas de verdad."

No se reescribe ni se reemplaza.

## A&C no vende productos

Vende control efectivo: inspección, tratamiento y erradicación. Ningún guion habla de vender productos, ni para afirmarlo ni para negarlo ("no vendemos productos milagrosos" también está mal).

## "Basado en" es referencia, no copia

Si pide un guion basado en otro video, usa los datos e imágenes como referencia y escribe un relato propio (gancho, desarrollo, cierre). No copies el texto del otro video.

## Al editar un guion

Cambia solo lo que pidió. Lo demás queda igual, palabra por palabra.

## Edición de reels grabados por Francisco

Reglas que salieron de la primera edición (19-nov-2026), en la que el audio quedó degradado y los subtítulos desfasados:

- **Audio: no procesar la voz.** Solo una ganancia fija que deje el pico real en −1,5 dBTP. Nada de `loudnorm` dinámico, compresor, limitador ni filtros: eso fue lo que bajó la calidad. Verificar comparando contra el original (correlación ≈ 1).
- **Subtítulos: alineación real, nunca estimada.** `videos/reel/alinear_ctc.py` ubica cada palabra en el audio con el modelo de español de torchaudio y muestra lo que el modelo oye. Francisco improvisa sobre el guion: los subtítulos llevan lo que dijo, no lo que estaba escrito.
- **Efectos de sonido:** suaves y por debajo de la voz (−24 dB o menos), con el banco de `earshot` (`earshot sfx render`).
- `videos/reel/editar.py` hace la edición completa: clips, zoom, subtítulos, logo, placa final.

Herramientas y cómo quedan disponibles en una sesión nueva:

- Modelo de alineación: `pip install torch torchaudio`; el modelo se baja de `download.pytorch.org` (permitido en el entorno `ayc-borradores`).
- earshot: `pip install git+https://github.com/Leonxlnx/earshot` (el banco de sonidos no necesita modelos ni red).
- real-sfx (github.com/Clipwing/skills): pone grabaciones reales de una biblioteca propia de sonidos; A&C no tiene una todavía.
- mcp-openverse (github.com/neno-is-ooo/mcp-openverse): busca imágenes con licencia abierta en `api.openverse.org`; descargar la imagen exige permitir además el sitio donde está alojada.
