# Los Rehenes — logo vectorial y animaciones

| Archivo | Qué es |
|---|---|
| `los-rehenes-logo.svg` | Logo vectorial limpio, fondo transparente, 3 capas (`outer` amarillo, `band` contorno rojo, `inner` línea interior roja) |
| `renders/neon.mp4` · `glitch.mp4` · `impact.mp4` | 1920×1080, 30 fps, 5 s, H.264 + AAC 320k |
| `animation/index.html` | Reproductor/motor: abre en el navegador, elige estilo, audio sincronizado |
| `animation/audio/*.wav` | Diseño sonoro de cada estilo, 48 kHz / 24 bit, −14 LUFS, pico ≤ −2 dBFS |
| `source-trazo.pdf` | PDF fuente (retrazo amarillo/rojo) |
| `tools/` | Scripts para regenerar todo |

Colores: amarillo `#F4DF06`, rojo `#ED1C24`.

## Estilos

1. **Neón** — los tubos rojos se dibujan solos (riser de sierras + barrido de ruido), el relleno amarillo parpadea como neón al encender (zaps de 120 Hz) y aterriza en un impacto con sub y reverb; queda un zumbido de balastro que se desvanece.
2. **Glitch VHS** — señal con estática, cortes horizontales, split RGB; cada salto visual tiene su ráfaga de datos bit-crusheada. Tape-stop y se estabiliza en un *sub drop* 808.
3. **Impacto** — ensamble por capas: silueta (thud), contorno que cae desde grande (hit metálico), barrido de luz izquierda→derecha (swoosh paneado L→R siguiendo el borde), y golpe final con onda expansiva, chispas y cola larga.

Los tiempos de imagen y audio salen del mismo archivo, `tools/timeline.json`: se mueve un cue ahí y ambos se actualizan.

## Regenerar

Requiere Python 3 (`pymupdf numpy scipy pyloudnorm imageio-ffmpeg`) y Node con `playwright`.

```bash
cd tools
python3 extract.py            # PDF -> SVG + animation/data.js (incluye timeline)
python3 audio.py              # -> animation/audio/*.wav
node render.js all            # -> renders/*.mp4
node render.js impact --alpha # -> renders/impact-alpha.mov (ProRes 4444 + alfa, ~125 MB)
```

## Notas

- **Loudness**: −14 LUFS es referencia web/redes. Para PA o playback en show, bajar/subir en consola; el contenido tiene mucho sub (30–60 Hz) que en bocinas de laptop casi no se oye y en un sistema con subs sí pega.
- **Alfa**: `neon` e `impact` funcionan bien con alfa. `glitch` en alfa arrastra sus capas de estática/scanlines de pantalla completa; para componer sobre video conviene la versión con fondo.
- El tagline "CHICOS LOCOS" del escaneo original no está en el retrazo, así que no se incluye.
