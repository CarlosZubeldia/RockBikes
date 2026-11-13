# Rock Bikes — contexto para continuar el proyecto

Documento de traspaso. Está pensado para que otra IA (o una persona) pueda seguir trabajando sin
haber visto la conversación anterior: qué hay hecho, cómo se verifica, qué reglas tiene el proyecto y
qué queda abierto.

Última actualización: **13 de noviembre de 2026**.

### Si acabas de llegar, haz esto en orden

1. Arranca el servidor (`python scripts/serve.py 5500`) y comprueba que responde.
2. Abre `index.html` a 1366 × 900 y mira la home entera; luego `ficha-producto.html`.
3. Lee el `README.md` por encima: es la bitácora de decisiones y trampas.
4. Antes de tocar nada, mide. Todo lo que se afirma en este documento está medido con Chrome.

---

## 1. Qué es este proyecto

Réplica estática de la web de **Rock Bikes** a partir de un diseño de Figma, más una **ficha de
producto** y varios **componentes de Figma Make** (React + Tailwind) que se han pasado a HTML, CSS y
JS a mano.

- Sin frameworks, sin build, sin `package.json`. Se abre el HTML y funciona.
- Todo el CSS y el JS están escritos a mano, comentados en castellano.
- Las únicas dependencias de red en ejecución son las tipografías de Google Fonts (Outfit y Work
  Sans). Las Obviously se sirven en local.
- Objetivo del cliente: que se vea **idéntico al diseño** y que las interacciones se sientan como en
  la web real.

| Archivo | Líneas | Qué es |
|---|---|---|
| `index.html` | ~1006 | Home completa |
| `ficha-producto.html` | ~709 | Ficha de producto |
| `assets/css/style.css` | ~3181 | Todo el CSS de la home |
| `assets/css/ficha.css` | ~899 | Todo el CSS de la ficha |
| `assets/js/main.js` | ~832 | Toda la interacción de la home |
| `assets/js/ficha.js` | ~243 | Acordeones, galería, visor y copiar enlace de la ficha |
| `README.md` | ~1347 | Bitácora técnica detallada, decisión a decisión |

**El `README.md` es la fuente de verdad del detalle.** Este documento es el mapa; el README explica
por qué cada cosa está como está (mediciones contra Figma incluidas). Antes de cambiar algo
estructural, búscalo en el README: probablemente ya se probó.

### Estructura de carpetas

```
RockBikes/
├─ index.html                 Home
├─ ficha-producto.html        Ficha de producto
├─ README.md                  Bitácora técnica (la fuente de verdad)
├─ CONTEXTO-IA.md             Este documento
├─ .figma-token               Token de la API de Figma (ignorado por git)
├─ assets/
│  ├─ css/style.css           CSS de la home (bloques numerados)
│  ├─ css/ficha.css           CSS de la ficha
│  ├─ js/main.js              Interacción de la home
│  ├─ js/ficha.js             Interacción de la ficha
│  ├─ fonts/                  Obviously Demo (4 variantes, licencia DEMO)
│  ├─ svg/                    Iconos y logos del diseño
│  ├─ logos/                  Logos de marcas
│  ├─ opt/                    TODAS las imágenes que usa la página (WebP/PNG optimizados)
│  ├─ ficha/                  Iconos SVG de la ficha
│  ├─ video/                  hero.mp4, hero-1440.mp4, brands.mp4, menu-spectral.mp4
│  └─ img/                    Exportaciones originales de Figma (110 MB, ignoradas por git)
├─ scripts/                   Servidor, capturas y utilidades de Figma (ver §3)
└─ design/                    Descargas, renders y capturas de trabajo (ignorado por git)
```

`assets/img/` **no la usa la página**: es la entrada de `scripts/optimize-images.py`, que genera
`assets/opt/`. Por eso está ignorada y por eso nunca hay que enlazar desde `assets/img/`.

---

## 2. Cómo se arranca

```powershell
# Servidor local (sirve .webp con su tipo y admite Range para los vídeos)
python scripts/serve.py 5500
# → http://127.0.0.1:5500/index.html
```

`sirve con Cache-Control: no-store`, así que al recargar siempre se ve lo último. **Ojo:** el servidor
es un proceso aparte; si se cierra, la página deja de cargar y el navegador muestra lo que tuviera en
memoria. Si el usuario dice «lo veo igual» o «no abre», lo primero es comprobar que el servidor
sigue vivo:

```powershell
Invoke-WebRequest http://127.0.0.1:5500/index.html -UseBasicParsing -TimeoutSec 5
```

Para los scripts de Figma hace falta un token en `.figma-token` (ver §8).

---

## 3. Cómo se verifica (importante)

**Nada se da por bueno sin medirlo.** El proyecto usa un Chrome headless por CDP:

```powershell
node scripts/shot.mjs --url http://127.0.0.1:5500/index.html --width 1366 --height 900 --out out.png
```

| Opción | Para qué |
|---|---|
| `--width` / `--height` | Tamaño de la ventana (sin barra, es viewport) |
| `--out` | Captura PNG |
| `--viewport` | Captura solo el viewport (sin `--out` no hace nada) |
| `--measure` | Cajas reales de selectores |
| `--eval "<js>"` | Devuelve el valor de una expresión; **la forma de comprobar números** |
| `--do "<js>"` | Ejecuta JS antes de capturar (scroll, click, abrir diálogos…) |
| `--wait ms` | Espera antes de capturar (por defecto 600) |
| `--hover "x,y"` | Mueve el ratón de verdad (para `:hover`) |
| `--click "x,y"` / `--click-on "<sel>"` | Clic real, con sus pointer events |
| `--drag "x1,y1,x2,y2"` / `--drag-on "<sel>"` / `--drag-by "dx,dy"` | Arrastre real |

**Chrome headless necesita permiso ampliado** en este entorno (el sandbox lo bloquea). Si un comando
falla con `Check failed: platform_channel.cc` o `ECONNREFUSED` en el 9222, hay que relanzar el comando
pidiendo `danger-full-access`.

### Comparar con Figma

Hay scripts para bajar nodos por la API REST (funcionan con cualquier plan):

| Script | Qué hace |
|---|---|
| `figma-fetch.mjs` | Nodo como JSON + PNG y `tokens.json` |
| `figma-assets.mjs` | Baja las fotos incrustadas |
| `figma-render.mjs` | PNG de un nodo ya recortado por Figma |
| `figma-svg.mjs` | SVG de un nodo |
| `figma-outline.mjs` | Árbol del diseño (`--flat` para volcarlo a txt) |
| `figma-node.mjs` | Fuentes, tamaños, colores y rellenos de cada nodo |

`design/` está en `.gitignore`: es para las descargas y los renders temporales.

---

## 4. Reglas de la casa

Son las convenciones que ya sigue todo el código. Respetarlas es lo que hace que las secciones
nuevas no desentonen.

### Código

1. **Sin dependencias nuevas.** Nada de frameworks, bundlers ni librerías. Vanilla JS y CSS.
2. **Comentarios en castellano** y que expliquen el *porqué*, no el *qué*. Los números medidos van
   en el comentario («a 1366 el titular mide 94 px…»).
3. **Nombres de clase en inglés** con prefijo de sección: `.hero__title`, `.terrain__link`,
   `.riders__cat`, `.article__meta`. BEM simplificado, sin guiones de más.
4. **Bloques de CSS numerados** en `style.css` (1. Tipografías, 2. Tokens, … , 17. Adaptación). Un
   bloque nuevo se intercala con letra (`11.b`).
5. **Tokens para todo color o medida repetida** (`--c-yellow`, `--gutter`, `--container`…). Los hex
   sueltos solo se admiten con un comentario que los justifique.
6. **Cada cambio estructural actualiza el README.** No es opcional: es la memoria del proyecto.

### Diseño

7. **Marco de 1366 px.** El diseño se dibuja a 1366; la web se adapta pero la referencia es esa. A
   partir de 1366 el contenido se centra con `.container` (`min(100% - 50px, 1316px)`).
8. **Titulares en Obviously Demo** (`.display`, 60 px). Es la regla de la casa: todos los titulares
   de sección miden lo mismo. Excepciones documentadas: el hero (94 px) y algunos de Figma Make.
9. **Texto en Outfit**. Los párrafos y los CTA van en Outfit.
10. **Amarillo corporativo `#FFD900`** (`--c-yellow`). Ojo: el diseño original pedía `#FFD400` en
    algún componente y se unificó.
11. **Azules**: `--c-blue` (`#0057FF`) es el acento secundario (antetítulos, etiquetas). Aparte,
    `#2B74FF` es el azul de los **hovers de enlaces** (menú, CTAs de texto) y no se ha unificado.
12. **Los botones de la web** son `.btn` + variante (`--light`, `--dark`, `--ghost`,
    `--outline-light`, `--outline-dark`). Al pasar el ratón **todos** van a amarillo con texto negro
    y hacen el relevo de flecha (`.btn:has(.icon-arrow)`), **salvo** el del hero, que se invierte a
    blanco.
13. **Los CTA de texto** (`.terrain__shop`, `.article__link`, `.riders__cta`) comparten el hover del
    menú: `color: #2B74FF` y `padding-left: 8px` en `.15s`.
14. **Antetítulos** con `.section__eyebrow` (azul, 14 px, versalitas, `letter-spacing .12em`) o
    `.section__eyebrow--light` (amarillo, para fondos oscuros). Sin margen inferior: se pegan al
    titular.
15. **Imágenes**: siempre en `assets/opt/`, WebP, con `width`/`height` en el HTML y `loading="lazy"`
    salvo lo que esté sobre el pliegue. Nada de enlazar a CDNs ajenos.
16. **Vídeos**: dos renditions del mismo clip con `<source media>` (1600 y 2560) y póster propio.
17. **Accesibilidad**: foco visible (`:focus-visible`), `aria-current`/`aria-selected` donde toca, y
    lo que está oculto va con `tabindex="-1"` o `aria-hidden`.

### Cómo trabajar con el cliente

18. **El usuario cambia de opinión a menudo y está bien.** Cuando pide un ajuste («súbelo 10 px»),
    hazlo y **da la medida antes y después**; no discutas la preferencia.
19. **Cuando pide algo ambiguo, mide y decide**, y explica el criterio en la respuesta. Si dos cosas
    son incompatibles (aire fijo + caja fija), dilo con la resta delante.
20. **Nunca digas «hecho» sin verificar.** Todas las respuestas terminan con la comprobación real
    (captura o número). Es lo que ha evitado la mayoría de los fallos.

---

## 5. Mapa de la home (`index.html`)

| # | Sección | `id` | Fondo | Interacción |
|---|---|---|---|---|
| 1 | Cabecera | — | degradado/vidrio | Menú desplegable, buscador, se retira al llegar al footer |
| 2 | Hero | — | vídeo a sangre | Sticky + capa negra al 30 % |
| 3 | Elige tu terreno | `terrain` | `#1C1117` | Cinco paneles que se ensanchan al hover/foco |
| 4 | Most wanted | `products` | `#FAFAFA` | Carrusel por arrastre + puntos |
| 5 | Marcas | `brands` | `--c-dark` | Vídeo, logos |
| 6 | Accesorios para riders | `riders` | `#1F1F1F` | Scroll largo con panel pegado |
| 7 | Encuentra tu bici | `finder` | `--c-surface` | Tarjetas con CTA al hover |
| 8 | Opiniones | `reviews` | blanco | — |
| 9 | Accesorios | `accessories` | blanco | Tarjetas |
| 10 | Noticias (blog) | `news` | `--c-plum` | Fila arrastrable de 8 tarjetas |
| 11 | Footer | `footer` | amarillo | — |

**Ya no existe** la sección de categorías destacadas («Featured categories»): se quitó a petición.
El CSS de `.cat*` sigue porque lo usa «Find your bike». Los enlaces a `#categories` se repuntaron.

### El hero, en detalle

- **Vídeo**: `assets/video/hero.mp4` (1600×900) y `hero-1440.mp4` (2560×1440), servidos con
  `<source media="(min-width: 1600px)">`. Póster `assets/opt/hero-poster.webp`.
- **Altura**: `min-height: max(900px, calc(100svh - 18px + 24px))`. Los 18 px son la franja de la
  sección siguiente que asoma al abrir; los 24 son el radio de esa sección, que se monta encima.
- **Sticky**: `.hero { position: sticky; top: 0; z-index: 0 }` y las secciones `z-index: 1`, así que
  suben por encima. Requiere `body { overflow-x: clip }` (con `hidden` el sticky no funciona).
- **Bloque de texto**: alineado al `.container`, abajo, con `padding: 0 0 116px` y
  `align-items: flex-end`.
- **Contraste**: `.hero--plain::after` con `rgba(0,0,0,.3)` plano. El degradado del diseño solo vuelve
  a ≤620 px.
- **Titular**: 94 px, amarillo; `SPECIALIST` va en **Outfit Black a `1.17em`** (110 px) porque Outfit
  tiene la mayúscula más baja. Lleva `opacity: .8`.
- **Subtítulo**: 18/25 px, en una línea.
- **Botón**: `btn btn--dark`; al pasar, blanco con texto oscuro (regla `.hero .btn--dark:hover`).

### Accesorios para riders (la más delicada)

- Sección de **420vh** (7 categorías × 60vh) con el contenido pegado (`position: sticky`).
- `.riders__sticky`: `height: 100vh`, `align-items: flex-start`, `padding: 90px 24px 120px`.
  Es decir: **90 px arriba** (70 de la barra + 20) y **120 abajo**, constantes en cualquier ventana.
- `.riders__cols`: `height: 100%`, sin tope. La caja mide ventana − 210 (708 a 918, 1011 a 1221).
- **La lista de categorías no se pulsa**: son `<span>`; solo el scroll cambia la categoría activa.
- El panel derecho es una pista vertical que se mueve con `translateY(-n × 100%)`.
- Fotos en `assets/opt/acc-*.webp` (900 px, WebP 80, 867 KB las siete), descargadas de Unsplash.

**Historial de esta sección** (por si vuelve a pedir «lo de antes»): se probaron centrada con cajas
de 720, con rectas de aire 60/120 y 60/100, cajas 50 px más bajas y centradas… La versión que el
cliente aceptó es la de arriba: pegada al menú y con 120 px libres abajo.

---

## 6. La ficha de producto (`ficha-producto.html`)

Nodo de Figma **`15408:6030`**, marco de 1366 × 5448.

| Bloque | Qué tiene |
|---|---|
| Cabecera | La misma del home pero clara (`site-header--light`) |
| Migas y ficha | Galería con 6 fotos, título, precio, caja de compra sticky |
| Características | Pestañas y acordeones (uno abierto) |
| Garantías | Barra con envíos, devoluciones… |
| Detalles del producto | Cuatro fichas pequeñas |
| Opiniones | Panel con nota y reseñas |
| Ride into the wild | Banner amarillo |
| Relacionados | Cinco tarjetas con arrastre |
| Footer | El del home |

Detalles que costaron y están documentados en el README: la caja de compra es sticky y se para a la
altura de «SHARE»; el cristal es `rgba(252,252,252,.74)` con `backdrop-filter`; la galería abre un
`<dialog>` a pantalla completa con velo de cristal; las fotos de la galería son enlaces a su archivo.

La ficha tiene **1,89 % de píxeles distintos** frente al render de Figma (sin contar el footer), y ese
resto es antialiasing y compresión WebP.

---

## 7. Trampas ya pisadas (no volver a caer)

| Problema | Causa | Solución |
|---|---|---|
| Los enlaces de las tarjetas no navegaban | El arrastre de filas usaba `setPointerCapture`; el `click` acababa en la fila | Escuchar `pointermove`/`pointerup` en `window`, sin captura |
| El sticky del hero no funcionaba | `body { overflow-x: hidden }` crea contenedor de scroll | `overflow-x: clip` |
| La página entera se desplazaba 19 px | Un **BOM** entre `</header>` y `<main>` | Quitarlo (y `meta charset` arriba del todo) |
| Acentos rotos en el HTML/CSS | UTF-8 doblemente codificado al escribir con PowerShell | Reparar por tramos con round-trip cp1252; escribir con `write`/Python |
| Un vídeo no arrancaba en Safari/lento en Chrome | Sin `Range` en el servidor | `scripts/serve.py` atiende 206 |
| La negrita de Outfit salía sintética | Google Fonts pedía hasta 800 | Añadir `900` al `<link>` |
| El número de una tarjeta se veía gris | `#CFC7CC` sobre foto clara | Blanco puro + amarillo solo en el activo |
| Los CTA del blog parecían botones | Eran píldoras amarillas | Texto + flecha, con el hover azul del menú |
| «No veo los cambios» | El servidor se había caído | Relanzar `scripts/serve.py` y recargar |

---

## 8. Estado y pendientes

### Hecho y verificado

- Home completa con las 11 secciones y sus interacciones.
- Ficha de producto completa, con visor de galería, acordeones y relacionados.
- Navegación entre home y ficha (logo → home, tarjetas de producto → ficha).
- Vídeos del hero con dos renditions y póster propio.
- Fotografías del blog propias (`assets/opt/blog-*.webp`).
- Sección de accesorios con scroll largo.
- Documentación al día en el README.

### Pendiente / bloqueado

1. **Token de Figma caducado** (`403 Token expired`). El usuario pasó el nodo
   **`15547:1755`** pidiendo implementarlo y no se pudo bajar. Para retomarlo: crear un token en
   Figma (*Settings → Security → Personal access tokens*, scope `file_content:read`), guardarlo en
   `.figma-token` y ejecutar:
   ```powershell
   node scripts/figma-fetch.mjs --node 15547:1755 --scale 2
   node scripts/figma-node.mjs --input design/15547-1755.json --texts
   ```
2. **El titular del hero sigue sin convencer al cliente.** `SPECIALIST` pasó a Outfit Black y luego a
   1.17em (110 px). Está pendiente de lo que diga el nodo de Figma: podría ser otro tamaño, otro peso
   o incluso otra familia.
3. **Sección de riders**: el cliente está afinando márgenes y alto de caja. Cualquier cambio debe
   medirse a 900, 918 y 1080 de alto antes de darlo por bueno.
4. **Contenido de relleno heredado del diseño**: los textos del hero y de las categorías son el
   «Lorem ipsum» del Figma, y los precios y las fichas técnicas de la ficha de producto están
   inventados. Si el sitio se publica de verdad, hay que sustituirlo.

### Entregables sueltos

- **`design/snippets/blog-section.html`**: la sección de blog completa y autocontenida (HTML + CSS +
  JS en un archivo) para copiar a otro proyecto. Ojo: `design/` está en `.gitignore`, así que ese
  archivo no se versiona; si hay que conservarlo, muévelo fuera de `design/`.
- `design/ficha/` tiene las capturas de todas las iteraciones. También está ignorado.

---

## 9. Comandos rápidos

```powershell
# Arrancar y comprobar el servidor
python scripts/serve.py 5500
Invoke-WebRequest http://127.0.0.1:5500/index.html -UseBasicParsing

# Capturas de referencia
node scripts/shot.mjs --url http://127.0.0.1:5500/index.html  --width 1366 --height 900 --viewport --out design/x/home.png
node scripts/shot.mjs --url http://127.0.0.1:5500/ficha-producto.html --width 1366 --height 5448 --out design/x/ficha.png

# Medir algo concreto
node scripts/shot.mjs --url http://127.0.0.1:5500/index.html --width 1366 --height 900 `
  --eval "(() => { const h = document.querySelector('.hero').getBoundingClientRect(); return JSON.stringify({ alto: h.height }); })()"

# Probar un hover de verdad
node scripts/shot.mjs --url http://127.0.0.1:5500/index.html --width 1366 --height 900 `
  --hover "130,634" --eval "document.querySelector('.btn').matches(':hover')"

# Optimizar una foto nueva a WebP
python scripts/optimize-images.py           # toda la carpeta
```

---

## 10. Resumen en cinco líneas

1. Es una web estática, sin build, replicada de Figma y medida píxel a píxel.
2. Se verifica **siempre** con capturas y números de Chrome headless, no «a ojo».
3. El diseño manda: 1366, `.container` de 1316, Obviously + Outfit, amarillo `#FFD900`.
4. Todo va comentado en castellano y todo cambio estructural se cuenta en el `README.md`.
5. Lo primero al retomar: comprobar servidor, pedir token nuevo de Figma y leer el README.
