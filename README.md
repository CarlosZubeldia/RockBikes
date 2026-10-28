# RockBikes

Página de inicio construida a partir del diseño de Figma **rock-bikes**, como pieza de porfolio.

Es **HTML, CSS y JavaScript sin frameworks**. No hace falta instalar nada ni compilar:
abre `index.html` en el navegador y funciona. Para publicarla, sube la carpeta a
GitHub Pages, Netlify o cualquier hosting estático.

- Archivo de Figma: `8mNr7UEzJA7LVwy7In9jlm`
- Frame de partida: nodo `15076:5746` — *Frame 1410106479*, 1366 × 8790 px

```
index.html              la página completa
assets/
  css/style.css         estilos, con los tokens del diseño arriba del todo
  js/main.js            menú adhesivo, menú móvil y carrusel reutilizable
  fonts/                Obviously Demo (variante Wide), ver aviso de licencia
  video/                aquí va hero.mp4, el vídeo de fondo del hero
  logos/                logos de marca ya pintados en amarillo (ver más abajo)
  opt/                  fotos optimizadas para web (4,2 MB)
  svg/                  logos e iconos vectoriales exportados de Figma
  img/                  originales de Figma (110 MB, no se publican)
scripts/                utilidades de extracción y verificación
design/                 datos crudos de Figma y capturas de verificación (no se publica)
```

## Tres decisiones que conviene conocer

**La tipografía de titulares es la del diseño: Obviously Demo**, de OH no Type Company,
servida desde `assets/fonts/` para que funcione en cualquier navegador y no dependa de
que el visitante la tenga instalada.

Pero el archivo de Figma **no lo cuenta todo**. Declara la misma familia —«Obviously
Demo»— en los diez titulares, y los estilos por carácter pueden cambiar la fuente
respecto al estilo base del nodo. Hay que medirlo. Comparando el ancho de tinta del
render del diseño con el de cada archivo:

| Titular | Medido en el diseño | Coincide con |
|---|---|---|
| hero «MOUNTAIN» | 478 px | **Wide** (487) |
| «CATEGORIES» | 692 px | normal (705) — Wide daría 927 |
| «MOST WANTED» | 791 px | normal |
| «ENJOY THE BEST BRANDS» | 845 px | normal |
| «DISCOVER OUR» | 512 px | normal (521) |
| «OPINIONES DE» | 483 px | normal (493) |
| «ACCESORIOS» | 448 px | normal (453) |

O sea: **solo el hero va en Wide**. El resto, en ancho normal.

Y de ahí salieron tres correcciones que el estilo base escondía:

- **«Categories», «Opiniones» y «Accesorios» no son Work Sans**, como parecía por el
  estilo base de su nodo: sus caracteres llevan un override a Obviously. Al final
  **solo dos titulares usan Work Sans**, y los dos en cursiva.
- **«Taller propio en nuestras instalaciones» y «Últimas noticias» van en cursiva**
  (Work Sans 800 italic). De ahí la clase `display--italic`.
- **«Accesorios para riders» es un titular a dos colores**: «Accesorios» en gris
  `#929292` y «para riders» en el color normal del texto.

Además, **«Categories» y «Most wanted» van a 96 px**, no a 60 como el resto. La clase
`display--xl` estaba definida pero sin aplicar en ninguno de los dos.

Los saltos de línea de los titulares son los del diseño. El texto de Figma no lleva
saltos explícitos —envuelve solo según el ancho de su caja—, así que están puestos a
mano para reproducir dónde corta cada uno.

> **Aviso de licencia.** Es la versión de demostración. Para publicar el sitio hace falta
> comprar la licencia; si el repositorio va a ser público, estas fuentes no deberían
> subirse. `--font-display` cae a Work Sans si no están.

**Los logos de marca van repintados.** En el diseño, la fila «Enjoy the best brands»
muestra los seis logos en amarillo plano, pero los archivos originales de Figma traen
los colores de cada marca. `scripts/recolor-logos.py` genera las versiones amarillas en
`assets/logos/`. Se intentó antes con CSS (usar cada imagen como máscara sobre un fondo
amarillo), pero al abrir la página con `file://` el navegador no carga las máscaras
externas y los logos desaparecen.

**El contenido es de relleno.** El diseño original trae *Lorem ipsum* en el hero, las
categorías y «Most wanted», y las reseñas llevan texto generado por Figma. Se ha
mantenido tal cual para que la estructura sea idéntica.

## Los vídeos

La página tiene **dos vídeos de fondo**, los dos a sangre, en bucle y silenciados:

| Dónde | Archivo | Del original | Queda en |
|---|---|---|---|
| Hero | `assets/video/hero.mp4` | 131,87 MB · 1920×1080 · 59,94 fps · 47,8 Mbps | **12,64 MB** (−90 %) |
| Sección de marcas | `assets/video/brands.mp4` | 58,16 MB · 1920×1080 · 59,94 fps · 69 Mbps | **4,06 MB** (−93 %) |

Los dos venían a 60 fotogramas por segundo y con un bitrate enorme. Se recodificaron con
ffmpeg:

```powershell
# Hero. 1600x900 porque es lo que mide en pantalla: el hero son 1366x768 y el
# desplazamiento del vídeo lleva una escala de 1,15 -> 1572x884.
ffmpeg -i original.mp4 -map 0:v:0 -an `
  -vf "fps=25,scale=1600:900:flags=lanczos,setsar=1" `
  -c:v libx264 -preset slow -crf 31 -pix_fmt yuv420p `
  -movflags +faststart assets/video/hero.mp4

# Sección de marcas, recortado ya a la proporción de su hueco (639x509) para no
# codificar lo que no se ve.
ffmpeg -i original.mp4 -map 0:v:0 -an `
  -vf "fps=25,scale=1280:1020:flags=lanczos,setsar=1" `
  -c:v libx264 -preset slow -crf 33 -pix_fmt yuv420p `
  -movflags +faststart assets/video/brands.mp4
```

El material es muy detallado —ramas, hojas, gravilla— y castiga mucho el bitrate: a
1600×900 no baja de 12 MB sin que se note.

### Por qué el hero pesa 12,64 MB y no 5,73

La primera versión salió a 720p y CRF 33 para dejarla en 5,73 MB, y **se quedaba corta**.
El motivo es que el vídeo del hero no se muestra a 1280 sino a 1572: el desplazamiento
que saca al ciclista de debajo del titular lleva una escala de 1,15. O sea que el
navegador estiraba un 23 % un archivo ya de por sí comprimido.

Medido con SSIM contra el original llevado a la resolución de pantalla, en dos tramos
distintos del vídeo y con búsqueda exacta al fotograma:

| | Tamaño | SSIM |
|---|---|---|
| Original contra sí mismo (techo del método) | 131,87 MB | 0,995 |
| 720p CRF 33 *(la versión anterior)* | 5,73 MB | **0,822** |
| 1600×900 CRF 31 | 12,64 MB | **0,901** |

Se probaron también 1440×810 y varios CRF; 1600×900 con CRF 31 es el punto donde el
tamaño deja de comprar calidad de forma apreciable. Y **VP9 salió peor que x264** en este
material —40 MB para un SSIM que x264 lograba con 30—, así que se descartó.

### Un detalle de ffmpeg que cuesta un fotograma

```powershell
-vf "fps=25"     # descarta el PRIMER fotograma del original
-r 25            # lo conserva, pero muestrea peor (SSIM 0,41) y duplica fotogramas
```

Con `fps=25` como filtro, el primer fotograma del resultado no es el primero del original
—difiere en 23 sobre 255, y coincide con el *segundo*—, así que al arrancar hay un salto
respecto al póster. Se comprobó que `-r 25` a la salida sí lo conserva, pero a cambio
muestrea peor: comparado contra el original en el mismo instante da SSIM 0,41 frente a
0,90, porque reparte los fotogramas duplicando y descartando.

Se eligió `fps=25` porque **la precisión temporal se nota en todo el vídeo y el primer
fotograma solo en el arranque**, y porque el póster es la imagen del diseño, que es la
misma escena: la diferencia es de compresión, no de composición.

El **póster** de cada uno es la imagen que ya estaba en el diseño, de modo que si el
vídeo no carga la página se ve igual que antes. En el hero encaja perfectamente: el
primer fotograma y la imagen del diseño difieren en 2,1 sobre 255, o sea que Figma usó
ese mismo fotograma como póster. En marcas no coinciden porque es **otro momento del
rodaje**, no el mismo fotograma, pero es el mismo sitio.

Tres detalles que hacen que arranquen solos:

- **`muted` es imprescindible.** Los navegadores bloquean la reproducción automática con
  sonido, y es la causa habitual de que un vídeo de fondo «no arranque».
- **`playsinline`** evita que en iPhone se abra a pantalla completa.
- `main.js` **reintenta la reproducción en el primer toque** por si el navegador la
  bloqueó igualmente, y la **pausa** para quien tenga activado «reducir movimiento».

### El encuadre del vídeo del hero

El vídeo va **desplazado a la derecha** para sacar al ciclista de debajo del titular. En
el diseño original estaba en x≈581, justo detrás de «SPECIALIST», y no se veía.

Aquí no sirve `object-position`, que es lo primero que uno intenta. El vídeo es
1280×720 y el hero 1366×768: **exactamente la misma proporción**, 1,778 las dos. Con
`object-fit: cover` no sobra nada que recortar, así que no hay margen que repartir y
`object-position` no mueve ni un píxel. Hay que desplazar el elemento entero.

El ligero aumento de escala (1,15) tiene dos motivos. Uno, da el **margen vertical** que
falta para subir al ciclista, porque la tarjeta de producto empieza en y=379 y sin
escalar no hay hueco hacia arriba. Y dos, agranda una figura que en el original es
bastante pequeña. Con eso pasa de (581, 355) a (1112, 313).

Al desplazarlo, su borde izquierdo se mete en la zona donde el degradado todavía es
opaco, así que la costura no se ve. De ahí que los dos cambios vayan juntos.

### El degradado del hero

Encima del vídeo va un degradado lineal **horizontal**: `#20131C` opaco a la izquierda
—donde está el texto— y al 32 % a la derecha, donde se ve el vídeo.

Las posiciones no salen de mirar una captura. Los puntos de control del archivo de Figma
son (0,298·0,596)→(0,731·0,500) sobre una caja de 1366×768, es decir de x=407 a x=1007.
Proyectando eso sobre la línea de un `linear-gradient` de 83°, salen el **30,5 %** y el
**71,6 %**.

Se comprobó además despejando el alfa del render del diseño, usando la imagen de fondo
como referencia: α = 0,99 hasta el 28 %, 0,84 en el 41 % y 0,61 en el 54 %, que es lo que
da ese reparto. El resultado final es un degradado de tres paradas, no de cinco.

Ese reparto era el del diseño, con el vídeo a sangre. Ahora que el vídeo va desplazado,
la parte opaca se **estira del 30 % al 45 %**: hace falta para tapar el borde izquierdo
del vídeo, que ha entrado hasta x≈444. La caída se corre en la misma medida, hasta el
78 %, y así el ciclista —que acaba en x≈1112— cae ya en la zona clara, con solo un 36 %
de oscurecido en vez del 62 % que tendría con el reparto original.

Por debajo de 1180 px el titular ocupa todo el ancho y el degradado horizontal deja de
cubrirlo, así que ahí se añade un oscurecido vertical extra.

### El titular del hero

Mide 94 px a 1366, pero por debajo no cabe. «SPECIALIST» ocupa 9,36 veces el tamaño de
fuente, y a su derecha hay que dejar sitio para la tarjeta (312 px) y su separación (48).
Despejando, el máximo es `(ancho − 428) / 9,36`. Se aplica con un `clamp()`, usando 9,8
en vez de 9,36 para dejar margen —`100vw` incluye la barra de desplazamiento en algunos
navegadores—.

Sin eso, entre 981 y 1310 px el titular se metía **debajo** de la tarjeta y «SPECIALIST»
aparecía cortado.

## El menú

No es una barra continua sino **tres píldoras separadas**: marca, enlaces y acciones.
Medidas tomadas del propio diseño (`Menu_desktop`, nodo `15076:6464`):

| | |
|---|---|
| Alto de cada píldora | 52 px |
| Margen del conjunto | 35 px a los lados, 16 arriba y abajo (84 px en total) |
| Fondo | negro al **74 %** |
| Separación entre píldoras | repartida con `space-between`, salen 131 px |
| Radios | 200 px en marca y enlaces, **24 px en la de acciones** |
| Enlaces | 40 px de alto, relleno 8/10 |
| «Ofertas» | 81×35, fondo `#0D7678` |

El radio 24 de la píldora derecha es fácil de pasar por alto: las otras dos están
redondeadas del todo y esa no. Y el color de «Ofertas» no es el `#009CDF` que aparecía en
el resumen de colores —ese se usa en otro sitio—, sino `#0D7678`.

Las píldoras necesitan unos 1160 px para caber, así que **por debajo de 1180 px el menú
pasa a desplegable**, y lo abre la hamburguesa. En escritorio ese mismo botón oculta y
vuelve a mostrar la píldora central.

El menú va **fijo a la ventana**, de modo que acompaña toda la navegación. Al bajar se
acerca al borde y gana sombra. El fondo se queda en el 74 % que pide el diseño: lo que
evita que se lea el contenido de detrás es el `backdrop-filter: blur(12px)`, no la
opacidad.

> **Sin verificar.** Chrome headless no arranca sin `--disable-gpu`, y con ese flag el
> `backdrop-filter` no se aplica. En las capturas de comprobación el texto de debajo se
> transparenta más de lo que debería; en un navegador normal el desenfoque sí se ve. Si
> aun así molesta al pasar por las secciones claras, basta con subir ese 74 %.

Como el menú tapa unos 84 px, las secciones llevan `scroll-margin-top` para que al usar
un enlace con `#` el titular no quede oculto debajo.

### El menú en móvil

Por debajo de **980 px** —el mismo punto en el que el hero se apila en columna— el menú
deja las píldoras y pasa a una **barra limpia**: el círculo suelto a la izquierda y las
tres acciones sueltas a la derecha, sin contenedores.

Medidas tomadas del diseño móvil, que viene a 390 px:

| | |
|---|---|
| Alto de la barra | 68 px |
| Círculo del menú | 40×40, en x=16 |
| Logo | 150×16, en x=72 |
| Iconos | 24 px, en x=254, 298 y 342 |
| Márgenes | 16 px a la izquierda, 24 a la derecha |

Se comprobó que el resultado clava las seis: 390×68 de barra, círculo en 16 de 40, logo en
72 de 150×16 e iconos de 24 en 254, 298 y 342.

Dos decisiones que no vienen en la imagen:

- **La barra lleva fondo sólido** (`#20131C`), no el negro al 74 % con desenfoque de las
  píldoras. El diseño la muestra plana, pero sobre todo hace falta porque la barra es fija
  y el contenido pasa por debajo: sin fondo, al llegar a una sección clara el logo blanco
  desaparecería.
- **El desplegable comparte ese fondo sólido.** Va pegado a la barra y uno opaco con otro
  translúcido justo debajo se notaría.

El círculo sube de 30 a 40 px y el logo de 118 a 150, que era lo que tenía antes: el
diseño móvil no encoge estos elementos respecto al escritorio, al contrario.

## Los botones

Al pasar el ratón, **todos** van al amarillo corporativo con el texto en negro puro, sea
cual sea su variante, y la flecha hace un relevo: la de la derecha sale deslizándose y
otra idéntica entra por la izquierda del texto.

Cuatro detalles de cómo está hecho:

- **El negro es `#000`, no `--c-ink`** (que es `#1E1F1F`). Sobre el amarillo la
  diferencia se nota, y es lo que se pidió.
- **La flecha que entra no está en el HTML.** Va como `::before` con el mismo trazo
  recortado en una máscara —`--arrow-mask`, un SVG en línea como data URI—, así que se
  pinta sola con `currentColor` y no hay que duplicar el `<svg>` en los nueve botones que
  la llevan. Al ser un data URI funciona también con `file://`, donde las máscaras que
  apuntan a un archivo sí fallan.
- **Solo se aplica a quien tiene flecha**, con `.btn:has(.icon-arrow)`. «See all
  categories» y «Subscribe» no la llevan, y no deben ganarla al pasar por encima.
- **El botón lleva `overflow: hidden`** para recortar la flecha mientras está fuera de
  sitio. No afecta al foco: el contorno se dibuja por fuera y el overflow del propio
  elemento no lo recorta.

Las transiciones son de 0,3 s, y el bloque de `prefers-reduced-motion` ya las anula solo,
porque alcanza también a los pseudo-elementos.

## Ver la página

Abriendo el archivo directamente funciona casi todo, pero **conviene servirlo**, porque
con `file://` el navegador aplica reglas más estrictas:

```powershell
start index.html                          # rápido, sin servidor
python scripts/serve.py                   # http://127.0.0.1:5500
python scripts/serve.py 8000              # otro puerto
```

`scripts/serve.py` es un `http.server` con dos detalles: **declara los tipos que Python
no trae** —`.webp`, `.otf`, `.woff2`, `.webm`, `.avif`— y manda `Cache-Control: no-store`
para que al recargar se vea siempre lo último.

No es un capricho: `python -m http.server` a secas sirve las imágenes `.webp` como
`application/octet-stream`. Los navegadores lo adivinan y se ven igual, pero es
incorrecto, y al depurar conviene que la respuesta diga la verdad.

## Volver a extraer el diseño

Solo hace falta si el diseño de Figma cambia.

### 1. Crea un token personal

1. [figma.com](https://www.figma.com) → tu avatar → **Settings** → pestaña **Security**.
2. **Personal access tokens** → **Generate new token**.
3. Marca solo el scope **`file_content:read`**.
4. Pulsa **Copiar este token** (Figma solo lo muestra una vez).

### 2. Guárdalo

```powershell
# del portapapeles al archivo, sin pasar por ningún otro sitio
Set-Content .figma-token -Value (Get-Clipboard -Raw).Trim() -NoNewline -Encoding ascii
```

`.figma-token` está en `.gitignore`.

### 3. Ejecuta la cadena

```powershell
node scripts/figma-fetch.mjs      # árbol del nodo + render + tokens de diseño
node scripts/figma-assets.mjs     # fotos incrustadas
node scripts/figma-outline.mjs --flat --out design/outline-all.txt
node scripts/figma-node.mjs --texts --out design/text-styles.txt
node scripts/figma-node.mjs --frames --out design/frame-styles.txt
python scripts/optimize-images.py # reescala a 1600 px y pasa a WebP
python scripts/recolor-logos.py   # logos de marca en amarillo plano
```

## Por qué no se usa el MCP de Figma

El servidor MCP de escritorio exige un **asiento Dev o Full en un plan de pago**, y el
servidor remoto solo admite clientes listados en el catálogo de Figma, donde DSH no
aparece. La API REST, en cambio, **funciona con cualquier plan**.

## Scripts

| Script | Para qué sirve |
|---|---|
| `figma-fetch.mjs` | Descarga un nodo como JSON + PNG y destila `tokens.json` (colores, tipografías, radios, textos) |
| `figma-assets.mjs` | Baja las fotos incrustadas, cruzando cada `imageRef` con el nombre del nodo que la usa |
| `figma-svg.mjs` | Exporta nodos concretos como SVG. Acepta `--ids` o `--match <regex>`, y `--list` para solo mirar |
| `figma-outline.mjs` | Árbol del diseño. Con `--flat` vuelca los 1332 nodos a un `.txt` consultable con grep |
| `figma-node.mjs` | Detalle fino por nodo: `--texts` (fuente, tamaño, color de cada texto) y `--frames` (relleno, radios, auto layout) |
| `slice-render.py` | Parte un render muy alto en trozos legibles, o recorta una zona con `--crop` |
| `optimize-images.py` | Reescala y convierte a WebP; deja PNG solo donde hay transparencia real |
| `recolor-logos.py` | Pinta los logos de marca en un color plano |
| `mobile-check.html` | Herramienta de revisión: mete la página en un iframe del ancho que pidas |
| `scroll-check.html` | Herramienta de revisión: carga la página en un iframe y lo desplaza a la altura que pidas |
| `video-check.html` | Herramienta de revisión: escribe sobre la página el estado real del `<video>` del hero (error, pausa, tiempo, fuente elegida) |

### Opciones

```
node scripts/figma-fetch.mjs   [--file <key>] [--node <id>] [--out <dir>] [--scale <n>]
node scripts/figma-assets.mjs  [--input <ruta>] [--file <key>] [--out <dir>]
node scripts/figma-svg.mjs     (--ids <a,b,c> | --match <regex>) [--out <dir>] [--list] [--min-size <px>]
node scripts/figma-outline.mjs [--input <ruta>] [--depth <n>] [--leaf] [--flat] [--out <ruta>]
node scripts/figma-node.mjs    (--texts | --frames | --id <nodo>) [--out <ruta>]
python scripts/slice-render.py [--input <png>] [--slices <n>] [--width <px>] [--crop x,y,w,h]
python scripts/optimize-images.py [--max-width <px>] [--quality <n>] [--min-bytes <n>]
python scripts/recolor-logos.py   [--color RRGGBB] [--outdir <dir>]
```

## Comprobar el resultado en el navegador

Comparar la página con `design/slices/` es lo que permite detectar desviaciones. Chrome
en modo headless hace capturas completas:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
  --user-data-dir="$env:TEMP\rb" --virtual-time-budget=9000 --window-size=1366,10000 `
  --screenshot="design/render-full.png" `
  "file:///C:/Users/carlos/Documents/deepseek-harness/RockBikes/index.html"
```

Dos avisos que cuestan tiempo si no se saben:

- **Chrome necesita salir del sandbox de DSH.** Su comunicación interna usa tuberías con
  nombre, que el sandbox bloquea, y falla con `Check failed: platform_channel.cc`. No es
  un problema de la página.
- **Chrome impone un ancho mínimo de ventana de unos 492 px.** Pedir `--window-size=390`
  no da una vista de 390: da una de 492 y la captura sale recortada, lo que parece un
  fallo de maquetación sin serlo. Para anchos pequeños, usa `scripts/mobile-check.html`,
  que mete la página en un iframe del ancho exacto:

```powershell
& "...\chrome.exe" --headless=new --disable-gpu --hide-scrollbars `
  --user-data-dir="$env:TEMP\rb-m" --virtual-time-budget=9000 --window-size=430,9200 `
  --screenshot="design/mobile.png" `
  "file:///.../scripts/mobile-check.html?ancho=390"
```

Y una captura normal siempre sale con la página arriba del todo, así que no sirve para
comprobar si el menú se queda pegado al bajar. Para eso está `scroll-check.html`, que
desplaza la página dentro de un iframe. Tiene que ir por `http`, no por `file://`, o el
padre no puede tocar el iframe:

```powershell
& "...\chrome.exe" --headless=new --disable-gpu --hide-scrollbars `
  --user-data-dir="$env:TEMP\rb-s" --virtual-time-budget=9000 --window-size=1400,700 `
  --screenshot="design/scroll.png" `
  "http://127.0.0.1:5500/scripts/scroll-check.html?y=1500&alto=640"
```

Para saber si el vídeo del hero **realmente se reproduce**, `video-check.html` escribe
encima de la página el estado del elemento: si hay error, si está pausado, cuánto lleva
reproducido y qué fuente eligió el navegador. Una captura normal solo enseña un
fotograma y no distingue «se está reproduciendo» de «se ve el póster».

```powershell
& "...\chrome.exe" --headless=new --disable-gpu --hide-scrollbars `
  --autoplay-policy=no-user-gesture-required `
  --user-data-dir="$env:TEMP\rb-v" --virtual-time-budget=12000 --window-size=1400,860 `
  --screenshot="design/video.png" `
  "http://127.0.0.1:5500/scripts/video-check.html?t=4"
```

## El diseño

E-commerce de bicicletas y patinetes eléctricos, tema oscuro con amarillo `#FFD900`
como acento. Ocho secciones más la barra de navegación:

1. **Hero** — «MOUNTAIN BIKES SPECIALIST» sobre foto de bosque, con tarjeta de producto
2. **Categories** — rejilla de categorías sobre `#FAFAFA`
3. **Most wanted** — carrusel de productos
4. **Best brands** — logos en amarillo sobre `#101010`, con un resplandor
5. **Find your perfect bike** — cuatro tarjetas de categoría
6. **Opiniones** — reseñas de Google y rejilla de accesorios
7. **Taller y noticias** — llamada a la acción sobre foto y carrusel de blog
8. **Footer** — texto SEO, newsletter, cinco columnas de enlaces, contacto y medios de pago

La página resultante mide 9266 px de alto frente a los 8790 px del diseño, un 5,4 % más.
