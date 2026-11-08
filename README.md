# RockBikes

Página de inicio construida a partir del diseño de Figma **rock-bikes**, como pieza de porfolio.

> **Estado y por dónde seguir.** Actualizada la sección de categorías, la tipografía (Outfit en
> el cuerpo, Obviously en los titulares) y **todo el menú**: barra a 70 px con degradado vertical
> de negro a transparente, hover a negro sólido, desplegable amarillo con panel negro de 301 px,
> segundo nivel para Mountain Bikes y Brands, tercer nivel con fichas de producto y **la
> pantalla de búsqueda** (`Mneu_search`).
>
> El tercer nivel es la parte que faltaba de `Menu_spectral` y `Variante6`: al pasar por
> Spectral o por Neuron en el segundo nivel se abre un panel de 429.5 px con la foto
> (349.5×224) y tres fichas, y el velo sube del 20 % al 30 %. El conjunto mide 1051 px
> (301 + 320.5 + 429.5) y se comprueba con `scripts/menu-check.html`. Los cuatro renders de
> `design/menu/` están cotejados: las bandas de texto quedan a 1–2 px.
>
> La búsqueda es la variante `Mneu_search` del menú (nodo `15342:5074`). Al pulsar la lupa la
> barra pasa a amarilla `#FFD900` y las tres acciones dejan su sitio a una píldora blanca de
> 344×36 en 932,17, «Close» en 1286,25 y un panel blanco de 394×215 en 932,70 con «Popular
> Search» y cuatro entradas. Comparte el velo del menú (`#888888` al 20 %) y tiene su propia
> adaptación por debajo de 1060 px. El render está en `design/menu/search.png` y se comprueba
> con `scripts/search-check.html`.
>
> Los logos de la sección de marcas ya son los cinco del diseño actual —Cycling, Evil, Lux
> Escape, The Radavist y Bike Travel—, exportados como SVG en amarillo. Sustituyen a los seis
> patinetes de la revisión anterior.
>
> El **footer** ya es el nuevo: fondo amarillo, logo grande y una fila inferior con newsletter,
> redes y las tiendas de apps.
>
> La sección de **noticias** también es la del Figma actual: «LATEST NEWS» a la izquierda y
> ocho tarjetas de 416×580 con 60 px de margen arriba y abajo (foto, categoría, tiempo de
> lectura, titular en Obviously y botón amarillo). La primera tarjeta baja al 50 % de opacidad
> y el degradado ocupa los 22 px del hueco antes de ella, **sin tocar la foto**; al
> desplazarse, la tarjeta entra en ese hueco y queda más cerca del titular. Sustituye al
> bloque anterior, que llevaba el texto SEO.
>
> La sección del **taller** («Our own workshop at our facilities») se ha retirado a petición;
> las noticias van ahora justo después de accesorios.
>
> Con las dos, **la home queda completa**.
>
> Lo siguiente sería una pasada de QA: móvil, foco, contraste y las secciones que aún no se
> hayan cotejado.
>
> Cuatro trampas que han costado tiempo y conviene no repetir: en el CSS de este proyecto **las
> reglas empatadas en especificidad dependen del orden del archivo** (el hover del botón del
> menú chocaba con el del estado abierto); el **amarillo sobre la barra amarilla es
> invisible**, así que el hover del botón va limitado a `:not(.is-menu-open):not(.is-search-open)`;
> el logo **no va en el centro de la ventana**, sino 30 px a la izquierda, porque el diseño
> reparte la barra con `space-between` y el bloque de acciones pesa 60 px más que el del círculo;
> y el `mouseleave` del menú **no puede colgar del panel de 301 px**, porque al entrar en el
> segundo nivel ya se cerraría: va en `.nav`, que contiene los tres paneles.

Es **HTML, CSS y JavaScript sin frameworks**. No hace falta instalar nada ni compilar:
abre `index.html` en el navegador y funciona. Para publicarla, sube la carpeta a
GitHub Pages, Netlify o cualquier hosting estático.

- Archivo de Figma: `8mNr7UEzJA7LVwy7In9jlm`
- Frame de partida: nodo `9440:3975` — *desktop*, 1366 × 7426 px (con el footer y las noticias nuevas)
- El nodo antiguo (`15076:5746`) ya no existe: Figma reasigna identificadores.

```
index.html              la página completa
assets/
  css/style.css         estilos, con los tokens del diseño arriba del todo
  js/main.js            menú adhesivo, menú móvil, carrusel y arrastre de filas
  fonts/                Obviously Demo (variante Wide), ver aviso de licencia
  video/                aquí va hero.mp4, el vídeo de fondo del hero
  logos/                los cinco logos de marca en SVG, ya en amarillo
  opt/                  fotos optimizadas para web (4,7 MB)
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

- **«Categories», «Opiniones» y «Accesorios» no eran Work Sans**, como parecía por el
  estilo base de su nodo: sus caracteres llevan un override. Hoy los tres van en
  Obviously.
- **«Accesorios para riders» es un titular a dos colores**: «Accesorios» en gris
  `#929292` y «para riders» en el color normal del texto.
- En la revisión de noviembre, «Taller» y «Últimas noticias» pasaron a **Outfit 800 sin
  cursiva** (antes eran Work Sans 800 en cursiva). La clase se llama ahora
  `display--outfit`; el taller se ha retirado después.

Los saltos de línea de los titulares son los del diseño. El texto de Figma no lleva
saltos explícitos —envuelve solo según el ancho de su caja—, así que están puestos a
mano para reproducir dónde corta cada uno.

### El cuerpo va en Outfit

Cuando se actualizó el diseño desde Figma, en noviembre, **el cuerpo pasó de Work Sans a
Outfit**, una geométrica. Está medido: el texto más repetido del archivo pasó de «Work
Sans 400 14px» a «Outfit 400 14px», y el resto de escalas acompañó.

De ahí salieron dos limpiezas:

- **Geologica salió del proyecto.** No aparece en el diseño nuevo; solo se usaba para las
  iniciales de los avatares de las reseñas, que ahora usan la fuente del cuerpo.
- **Work Sans se queda únicamente como respaldo** de Obviously, por si la fuente de
  titulares no carga.

Los titulares siguen en Obviously Demo: el diseño nuevo la conserva en ocho de los doce
titulares grandes.

> **Aviso de licencia.** Obviously Demo es la versión de demostración. Para publicar el
> sitio hace falta comprar la licencia; si el repositorio va a ser público, estas fuentes
> no deberían subirse. `--font-display` cae a Outfit si no están.

**Los logos de marca son SVG exportados de Figma.** La fila «Enjoy the best brands» del
diseño actual trae cinco marcas de bici —Cycling, Evil, Lux Escape, The Radavist y Bike
Travel— ya dibujadas en amarillo plano, así que se exportan como SVG con
`scripts/figma-svg.mjs` y se colocan tal cual en `assets/logos/`. Sus tamaños son los del
diseño y la fila los reparte con 81.6 px de separación.

Los seis logos de patinetes de la revisión anterior (Segway, smartGyro, Engwe, Xiaomi, Aovo
y Dualtron) eran imágenes con color y se repintaban con `scripts/recolor-logos.py`. Se
retiraron al actualizar la sección; el script sigue en `scripts/` por si hace falta para
otras imágenes.

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

Es **una barra de 70 px** a todo el ancho, no las tres píldoras del diseño anterior. Va
fija a la ventana y lleva un degradado vertical de negro a transparente; al pasar el ratón
se rellena de negro sólido.

| | |
|---|---|
| Barra | 70 px de alto, 40 de relleno a los lados, degradado negro → transparente |
| Círculo + «Menu» | círculo de 32 px y texto Outfit 500 16 px, a la izquierda |
| Logo | 228×24, centrado 30 px a la izquierda del centro |
| Acciones | tres iconos de 24 px con 16 de separación, a la derecha |
| Desplegable | panel negro de 301 px con 10 enlaces y 5 redes en oro `#DFBE00` |
| Al abrir | el círculo pasa a X y la barra a amarilla `#FFD900` |

El logo no va en el centro de la ventana: el diseño reparte la barra con `space-between`
entre círculo, logo y acciones, y el bloque de acciones pesa 60 px más que el del círculo.
Despejado, el centro del logo cae siempre en `ancho/2 − 30`.

Como la barra tapa 70 px, las secciones llevan `scroll-margin-top` para que al usar un
enlace con `#` el titular no quede oculto debajo.

El velo que oscurece y desenfoca el contenido de debajo es el `.nav__scrim`; en headless el
`backdrop-filter` no se aplica, así que en las capturas se transparenta más de lo que
debería.

### El menú en móvil

Por debajo de **980 px** —el mismo punto en el que el hero se apila en columna— el menú
pasa a una **barra limpia**: el círculo suelto a la izquierda y las tres acciones sueltas
a la derecha, sin contenedores.

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

- **La barra lleva fondo sólido** (`#20131C`), no el velo translúcido con desenfoque del
  escritorio. El diseño la muestra plana, pero sobre todo hace falta porque la barra es fija
  y el contenido pasa por debajo: sin fondo, al llegar a una sección clara el logo blanco
  desaparecería.
- **El desplegable comparte ese fondo sólido.** Va pegado a la barra y uno opaco con otro
  translúcido justo debajo se notaría.

El círculo sube de 30 a 40 px y el logo de 118 a 150, que era lo que tenía antes: el
diseño móvil no encoge estos elementos respecto al escritorio, al contrario.

### El menú desplegado

Al abrir el círculo, la barra pasa a amarilla y despliega un panel negro de 301 px pegado a
la izquierda, con «LET'S ROCK !», diez enlaces y las cinco redes al pie en oro `#DFBE00`.

**Los diez enlaces no son un error.** «Road Bikes» aparece dos veces en el diseño; se
deduplicó en un primer momento y hubo que devolverlo, porque se pidió copiarlo tal cual.

El componente completo vive en Figma en el set `menu_desktop`, nodo `15318:5361`, con
**ocho variantes**: `Menu_default`, `Menu_hover`, `Menu_open`, `Mneu_search`,
`Menu_mountain` (lista de Mountain Bikes), `Menu_spectral` (con las fichas de Spectral),
`Variante5` (lista de Brands) y `Variante6` (con las fichas de Neuron). Todas se pueden pedir
por la API con su identificador; no hace falta exportarlas a mano.

#### El modo exclusión, y por qué no está

En Figma el **contenido** del menú —logo, texto «Menu» e iconos— va en blanco con
`blendMode: EXCLUSION`, mientras la barra solo lleva su degradado negro. Así el blanco se
invierte según lo que tenga detrás y se lee sobre cualquier fondo sin necesidad de una
barra opaca.

**Eso no se puede reproducir en CSS con este montaje.** `mix-blend-mode` se mezcla con el
fondo del **mismo contexto de apilado**, y el menú es `position: fixed`, que crea uno
propio: el contenido no llega a ver el vídeo del hero. Se comprobó midiendo el fondo
calculado con la clase puesta.

Se compensa con el degradado de la barra —negro al 78 % arriba— y con el negro sólido al
pasar el ratón. Da la misma legibilidad —que es el objetivo del exclusión— por otro camino,
aunque la transición no es idéntica.

### El segundo y el tercer nivel

Cuatro paneles abren desde los enlaces del menú. El contenido real de Figma es este (la tabla
que había antes tenía `Variante5` y `Variante6` cambiados):

| Variante | Ancho | Contenido |
|---|---|---|
| `Menu_mountain` | 621.5 px | «MOUNTAIN BIKES» + Spectral, Neuron, Lux Trail, Lux World Cup, Torque + SEE ALL |
| `Menu_spectral` | 1051 px | Lo anterior + foto y fichas de Spectral |
| `Variante5` | 621.5 px | «BRANDS» + Cycling, Evil, Lux Escape, The Radavist, Bike Travel + SEE ALL |
| `Variante6` | 1051 px | Lista de Mountain Bikes + foto y fichas de Neuron |

Medidas del segundo nivel:

| | |
|---|---|
| Panel | 320.5×698 en (301, 70), negro, relleno 31/40 |
| Título | Outfit 600 18 px en (341, 113) |
| Filas | 44 px, texto 400 16 px, desde (341, 152) |
| «SEE ALL» | 47 px bajo la lista, en (341, 419), 36 px de alto |

El panel del diseño empieza 5 px por encima de la barra (y=65). Aquí el menú y el tercer
nivel empiezan en 70, así que sus rellenos superiores bajan de 24 a 19; el segundo nivel ya
empezaba en 70 y conserva los 31. Con eso el contenido cae donde toca: el título del menú en
105, la lista en 145 y la foto del tercer nivel en 89.

El diseño no es consistente entre variantes: en `Menu_open` el panel de 301 va a y=60 y todo
su contenido queda 5 px más arriba. Aquí se sigue la posición de las variantes con submenú,
que son las que se cotejan.

**El `mouseleave` va en `.nav`, no en el panel de 301.** Al pasar del menú al segundo nivel
se sale del panel de 301; si el cierre colgara de ahí, el submenú desaparecería justo al
intentar entrar. Como los tres paneles son descendientes de `.nav`, el leave de la barra sí
distingue «salir del menú» de «entrar en el siguiente panel».

El tercer nivel (429.5 px en 621.5):

| | |
|---|---|
| Foto | 349.5×224 en (661.5, 89), radio 8 |
| Rótulo | «Spectral» / «Neuron» Obviously, 33.65 px, a 35 de la izquierda y 11.68 del pie |
| Fichas | 3, desde (661.5, 337); nombre 600 16 px y precio 400 14 px |
| Descripción | Outfit 400 14 px, 12 px bajo el nombre |
| Separadores | 1 px `#8C8C8C`, 24 arriba y 23 abajo |
| «SEE ALL» | 30 px bajo las fichas, en (661.5, 613) |

La foto lleva el degradado de ciruela del diseño (`#270A3A`, del 32 % al 100 %) con
`mix-blend-mode: multiply` y opacidad 0.4; en Neuron baja a 0.1. El rótulo va por encima de
la sombra. Los separadores llevan 23 px abajo y no 24 porque la línea de Figma no ocupa
altura; así la ficha siguiente arranca 24 px después de la anterior.

**El rótulo no tiene fuente exacta.** Figma pide `ObviouslyDemo-ExtdSemi` (Extended
Semibold), que no está entre los dos archivos de demostración del proyecto. Se usa Wide Bold
estirado un 27 % en horizontal: mide 277 px frente a los 275 del render. Sin estirar se
quedaba en 226. El «LET'S ROCK !» del menú tiene el mismo problema: el diseño lo pide en
`ObviouslyDemo-Blck` y aquí va con el Semibold, unos 4 px más ancho.

Las fotos se bajaron con `scripts/figma-assets.mjs` y se optimizaron a
`assets/opt/menu-spectral.webp` (800×450) y `assets/opt/menu-neuron.webp`. La de Neuron se
recorta antes de escalar con el `imageTransform` del diseño (región de 1187×761), porque el
original es cuadrado y con `object-fit: cover` se habría comido el casco.

Con un submenú abierto el velo sube al **30 %** (`#888888` sobre blanco da `#DCDCDC`); el
`Menu_open` sin submenú se queda en el 20 %. El enlace cuyo panel está abierto pasa a 600. En
`Variante5` el diseño deja «Mountain Bikes» en 600 aunque el panel sea el de Brands —un
override del componente—; aquí se marca el que corresponde.

Por debajo de **1060 px** los tres paneles ya no caben (suman 1051) y las fichas se ocultan;
el segundo nivel se queda solo. El diseño no trae una versión móvil de estos paneles.

Comprobado con `scripts/menu-check.html` (`?ficha=spectral`, `?ficha=neuron`, `?ficha=0`,
`?link=Brands`) a 1366×768: las bandas de texto quedan a 1–2 px del render y el rótulo, las
fichas, los separadores y el «SEE ALL» también.

### La pantalla de búsqueda

La variante `Mneu_search` no es un desplegable del menú abierto: **sustituye la barra
entera**. Al pulsar la lupa, el desplegable se cierra si estaba abierto y la barra pasa a
amarilla sólida con el contenido en negro; el círculo y «Menu» siguen siendo una hamburguesa
—no se convierten en la X del menú abierto— y el logo no se mueve.

| | |
|---|---|
| Barra | `#FFD900`, 70 px, contenido negro |
| Campo | píldora blanca 344×36 en (932, 17), radio 100 |
| Icono | 24×24 en (942, 23), a 10 del borde y 6 de arriba |
| «Close» | 40×20 en (1286, 25), Outfit 400 16 px |
| Panel | 394×215 en (932, 70), blanco, esquinas de abajo de 24 |
| Título | «Popular Search» en (956, 94), Outfit 600 16 px |
| Entradas | Grail, Gloves, Wheels, Accesories, cada 30 px desde (956, 151) |

Tres cosas que el JSON no dice a simple vista:

- **El panel no cuelga del campo, sino de la barra.** El campo está centrado en la barra a
  17 px, así que su borde inferior queda en 53 y el panel empieza en 70. Por eso se ancla al
  formulario con `top: calc(100% + 17px)` en vez de `100%`.
- **El hueco entre «Popular Search» y la lista son 37 px**, no los 10 del auto layout. El
  panel mide 215 fijos y reparte título y lista con `space-between`; reproducirlo con un
  margen de 37 px habría copiado el resultado en vez de la regla.
- **El velo es el mismo del menú.** El fondo del componente es `#888888` al 20 %, que sobre
  blanco da el `#E7E7E7` del render; es exactamente el `rgba(136,136,136,.2)` del
  `.nav__scrim`, con el desenfoque de 10 px que el render no muestra.

La búsqueda se abre con la lupa y se cierra con «Close», con Escape o con un clic fuera.
Abrir el menú cierra la búsqueda y al revés, porque comparten la barra. Las entradas
populares rellenan el campo; no hay backend, así que enviar el formulario solo devuelve el
foco.

Por debajo de **1060 px** el campo fijo de 394 px se montaría sobre el logo (el logo acaba en
ancho/2 + 84 y el campo empieza en ancho − 434; chocan por debajo de 1036). Ahí el logo se
retira y el campo se estira entre el círculo y el margen derecho.

Se comprobó con `scripts/search-check.html` a 1366×768: las bandas de tinta del título y de
las cuatro entradas caen en las mismas filas y columnas que en `design/menu/search.png`, y el
campo, «Close», el icono y el logo también. La única diferencia es el rasterizado de la
fuente (el render de Figma sale en escala de grises y el navegador con subpíxel).

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

La flecha que entra tiene que caer donde caía el contenido en reposo: a **24 px del
borde** y a **10 px del texto**. Como al irse deja libres sus 20 px más los 10 de
separación, ese hueco se le pasa al relleno izquierdo y se le quita al derecho:

```
en reposo   24 + texto + 10 + 20 + 24                  = texto + 78
con hover   24+20+10 + texto + 10 + 0  (relleno 14)    = texto + 78
```

Las dos suman lo mismo, así que **el ancho no cambia**: medido, 152,42 px en los dos
estados. Si no se hiciera así, el botón crecería 30 px y empujaría a los de al lado.

Las transiciones son de 0,3 s, y el bloque de `prefers-reduced-motion` ya las anula solo,
porque alcanza también a los pseudo-elementos.

## Los carruseles

El mismo componente sirve a tres: los productos más buscados, las reseñas y la tarjeta del
hero. Se gobierna con `data-carousel` en el contenedor y cuatro atributos dentro
—`data-carousel-track`, `-prev`, `-next` y `-dots`—, así que añadir uno nuevo no necesita
tocar el JavaScript. La fila de noticias va aparte, con scroll nativo y arrastre (ver «Las
noticias»).

El del hero usa `data-carousel-mode="fade"`: cambia de diapositiva con un fundido en vez
de deslizar el track.

Cada tarjeta de «Most wanted» es, además, una galería de cinco fotos: las flechas de la
foto y las miniaturas que aparecen al pasar el ratón cambian la imagen principal
(`[data-prod-gallery]` en `main.js`). Las cinco de la galería van en
`assets/opt/prod-special-*.webp`; las portadas de cada producto, en
`assets/opt/prod-neuron.webp`, `prod-spectral.webp`, `prod-indiana.webp`, `prod-evil.webp`
y `prod-escape.webp`. La tarjeta es el componente `Component 260` del Figma: 400×507, con
la foto de 400×390 y la ficha blanca de 400×134 solapada 17 px.

La fila de «Most wanted» no lleva flechas: se arrastra con el ratón (el mismo
`[data-drag-scroll]` de «Las noticias») y los puntos del pie marcan y llevan a cada
tarjeta. La foto de la bici va con `object-fit: contain` para que se vea entera y
centrada; las cuatro de detalle, con `cover`. El pedal se guardó con el fondo
transparente para que tome el mismo `#F2F2F2` que las demás.

Las miniaturas de la tarjeta no arrastran la fila: el gesto se ignora cuando empieza
sobre un `button`, para que su clic cambie la foto en vez de perderse en la captura del
puntero. Las flechas de la galería se quitaron; la foto se cambia con las miniaturas.

Responden a las flechas, a las de teclado y al gesto táctil. **Y hasta hace poco no
funcionaban.** El número de píxeles que avanza una página se guardaba en `this.step`,
que es también el nombre del método que avanza. La propiedad de instancia tapaba al
método del prototipo, así que el manejador del clic lanzaba `self.step is not a function`
y no pasaba nada.

Lo engañoso es que los puntos **sí** funcionaban —llaman a `go()`, no a `step()`—, así
que parecía que el carrusel respondía. El número pasó a llamarse `pageWidth`.

Las flechas laterales son píldoras blancas al **30 % de opacidad**. Va en el fondo
(`rgba(255,255,255,.3)`) y no en la opacidad del botón a propósito: con `opacity` el
icono se desvanecería también y, como las flechas son blancas sobre secciones blancas,
acabarían sin verse. Al pasar el ratón el fondo se pone amarillo y el botón se agranda
un 6 %.

## Las noticias

La sección de noticias es la del Figma actual (nodo `15407:14819`). Mide **700 px en todos
los anchos**: la tarjeta es siempre **416×580**, con 60 px de margen arriba y abajo, y no se
deforma ni se estira. Lo que cambia con el ancho es la columna y el titular: de 556/60 a 1366
a 618/89 a 1473 (la captura de referencia), con el hueco de 22 px, la tarjeta en 640 y 101 px
hasta la siguiente. Los valores intermedios se interpolan con `calc()`/`clamp()`.

A la izquierda va «LATEST NEWS» (Outfit 800, «NEWS» en amarillo), el subtítulo y el botón
«Ver todas». A la derecha, la fila de tarjetas con la foto a sangre y el scrim del Figma
(transparente al 36 %, opaco desde el 65 %), la píldora azul `#2B74FF`, el tiempo de lectura,
el titular en Obviously 36/40, el resumen y el botón amarillo «Read the story». Son ocho, con
cuatro fotos y cuatro textos que se repiten.

**La primera tarjeta es la anterior**: su contenido baja al 50 % de opacidad; el degradado
ocupa los 22 px del hueco entre la columna y las tarjetas, **sin tocar la foto**; al
desplazarse, la tarjeta entra en ese hueco y queda más cerca del titular. La fila se desplaza
en horizontal de forma nativa y se puede arrastrar con el ratón (`data-drag-scroll` en
`main.js`); no usa el carrusel de diapositivas. Las fotos son 896×1200 del Figma, recortadas a
832×1160 WebP en `assets/opt/news-*.webp`.

Los dos botones de la sección («Ver todas» y «Read the story») comparten el efecto del resto
de la web: al pasar el ratón la flecha sale a la derecha y entra otra por la izquierda, el
fondo va al amarillo, el texto a negro y el botón sube 1 px, conservando su ancho.

## El footer

El footer nuevo es **amarillo `#FFD900` con el texto en negro**, al revés que el anterior
oscuro. Mide 837 px a 1366 y tiene tres partes:

| | |
|---|---|
| Logo | «ROCK⚡BIKES» de 1293×136 en (36, 72) |
| Columnas | cinco, de 16 px en negrita y enlaces de 14 px, a 149 px |
| Fila inferior | newsletter a la izquierda, redes centradas y tiendas a la derecha |

El logo es **el SVG del logo de la barra recoloreado**: las letras pasan de blanco a negro y
el rayo de amarillo a blanco (`assets/svg/rock-bikes-footer.svg`). Las cinco redes son los
mismos SVG del footer anterior, ennegrecidos con `filter: brightness(0)`. Las insignias de
App Store y Google Play están recortadas de la imagen del diseño a su tamaño (160×52 y
180×52) en `assets/opt/`.

Las columnas se reparten con `justify-content: space-between`: con los anchos que salen de
Outfit 14, las separaciones quedan en los 149 px del diseño. La fila inferior es una rejilla
de tres columnas (`1fr auto 1fr`) con las redes centradas.

El Figma actual ya incluye este footer en la página (contenedor `15366:30491`, 837 px). Se
montó primero desde la imagen que se pasó y las medidas coinciden con el frame.

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

# Los cinco logos de la sección de marcas; luego se copian a assets/logos con
# nombres legibles (cycling.svg, evil.svg, lux-escape.svg…).
node scripts/figma-svg.mjs --input design/9440-3975.json --ids "15300:32030,15300:32073,15300:32056,15300:31975,15300:32599" --out design/logos
```

Las dos fotos del tercer nivel del menú no están en el JSON principal y se bajan aparte:

```powershell
node scripts/figma-assets.mjs --input design/menu/spectral.json --out design/menu/assets/spectral
node scripts/figma-assets.mjs --input design/menu/brands.json   --out design/menu/assets/neuron
```

De ahí salen los dos PNG de `design/menu/assets/`; los WebP publicados
(`assets/opt/menu-spectral.webp` y `menu-neuron.webp`) se recortan y escalan a mano con el
`imageTransform` de Neuron que se explica en «El segundo y el tercer nivel».

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
| `recolor-logos.py` | Pinta una imagen en un color plano (se usó con los logos de la revisión anterior) |
| `mobile-check.html` | Herramienta de revisión: mete la página en un iframe del ancho que pidas |
| `scroll-check.html` | Herramienta de revisión: carga la página en un iframe y lo desplaza a la altura que pidas |
| `menu-check.html` | Herramienta de revisión: abre el menú y recorre el segundo y tercer nivel (`?ficha=`, `?link=`, `?ancho=`) |
| `search-check.html` | Herramienta de revisión: abre el buscador en un iframe del tamaño pedido (`?ancho=`, `?alto=`, `?blur=1`) |
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
2. **Categories** — rejilla de categorías sobre `#FFFFFF`
3. **Most wanted** — carrusel de tarjetas de producto sobre `#FAFAFA`: foto de 400×390 con cinco imágenes
   (flechas y galería de miniaturas al pasar el ratón), insignia «New bike», categoría,
   nombre, precio y colores
4. **Best brands** — logos en amarillo sobre `#101010`, con un resplandor
5. **Find your perfect bike** — cuatro tarjetas de categoría
6. **Opiniones** — reseñas de Google y rejilla de accesorios
7. **Noticias** — la nueva sección «LATEST NEWS» con ocho tarjetas y la primera oculta en el degradado
8. **Footer** — logo grande, cinco columnas de enlaces, newsletter, redes y tiendas de apps sobre amarillo

La página resultante mide 8134 px de alto. El frame de Figma (7426 px) todavía incluye el
taller, que se ha retirado de la web a petición.
