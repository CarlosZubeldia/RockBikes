#!/usr/bin/env node
/**
 * shot.mjs â€” captura una pÃ¡gina en Chrome headless y, si se pide, mide cajas.
 *
 * Existe porque el proyecto se comprueba cotejando el render con el diseÃ±o de
 * Figma, y `chrome --screenshot` no deja medir nada: solo da la imagen. AquÃ­ se
 * habla con Chrome por el protocolo de depuraciÃ³n (CDP), que sÃ­ permite pedir
 * la geometrÃ­a real de cada elemento ademÃ¡s de la foto.
 *
 * Chrome se arranca aparte, con el puerto de depuraciÃ³n abierto:
 *
 *   chrome --headless=new --no-sandbox --remote-debugging-port=9222 \
 *          --user-data-dir=<tmp> about:blank
 *
 * Uso:
 *   node scripts/shot.mjs --url http://127.0.0.1:5500/ficha-producto.html \
 *        --out design/ficha/render-desktop.png --width 1366 --height 5448
 *
 *   node scripts/shot.mjs --url ... --width 390 --measure
 *        (no captura: imprime las cajas de los selectores de --selectors)
 */

const args = process.argv.slice(2);
const opt = { width: 1366, height: 900, out: null, url: null, measure: false, port: 9222, wait: 600, eval: null, do: null, viewport: false, hover: null, click: null, clickOn: null, drag: null, dragOn: null, dragBy: null };

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--url') opt.url = args[++i];
  else if (a === '--out') opt.out = args[++i];
  else if (a === '--width') opt.width = Number(args[++i]);
  else if (a === '--height') opt.height = Number(args[++i]);
  else if (a === '--port') opt.port = Number(args[++i]);
  else if (a === '--wait') opt.wait = Number(args[++i]);
  else if (a === '--measure') opt.measure = true;
  else if (a === '--eval') opt.eval = args[++i];
  else if (a === '--do') opt.do = args[++i];
  else if (a === '--viewport') opt.viewport = true;
  else if (a === '--hover') opt.hover = args[++i];
  else if (a === '--click') opt.click = args[++i];
  else if (a === '--click-on') opt.clickOn = args[++i];
  else if (a === '--drag') opt.drag = args[++i];
  else if (a === '--drag-on') opt.dragOn = args[++i];
  else if (a === '--drag-by') opt.dragBy = args[++i];
}

if (!opt.url) {
  console.error('Falta --url');
  process.exit(1);
}

const SELECTORS = [
  ['.crumbs', 'migas'],
  ['.ficha__top', 'bloque superior'],
  ['.gallery', 'galeria'],
  ['.gallery__slide', 'diapositiva'],
  ['.buybox', 'caja de compra'],
  ['.buybox__card', 'tarjeta compra 1'],
  ['.ficha__detail', 'columna detalle'],
  ['.specs', 'caracteristicas'],
  ['.faq', 'acordeones'],
  ['.faq__item', 'acordeon 1'],
  ['.share', 'compartir'],
  ['.share__label', 'texto compartir'],
  ['.share__list', 'iconos compartir'],
  ['.trust', 'garantias'],
  ['.trust__logo', 'logo garantias'],
  ['.fdet', 'detalles'],
  ['.fdet__title', 'titulo detalles'],
  ['.fdet__row', 'fila detalles'],
  ['.fdet__card', 'tarjeta detalle'],
  ['.fdet__name', 'nombre tarjeta'],
  ['.fdet__img', 'foto tarjeta'],
  ['.fdet__card:nth-child(2) .fdet__img', 'foto tarjeta 2'],
  ['.ureviews', 'opiniones'],
  ['.ureviews__title', 'titulo opiniones'],
  ['.rreview', 'primera opinion'],
  ['.rreview__rate', 'fila estrellas'],
  ['.rreview__who', 'autor'],
  ['.rreview__text', 'comentario'],
  ['.ureviews__all', 'ver todas'],
  ['.ride', 'banner'],
  ['.ride__logo', 'logo banner'],
  ['.ride__title', 'titulo banner'],
  ['.ride__bike', 'bici banner'],
  ['.related', 'relacionados'],
  ['.related .prod', 'tarjeta relacionada'],
  ['.related__dots', 'puntos'],
  ['.site-footer', 'footer'],
  ['.footer__logo', 'logo footer'],
];

const list = await fetch(`http://127.0.0.1:${opt.port}/json/list`).then((r) => r.json());
const page = list.find((t) => t.type === 'page');
if (!page) {
  console.error('No hay pestaÃ±a abierta en el puerto', opt.port);
  process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener('open', res, { once: true });
  ws.addEventListener('error', rej, { once: true });
});

let id = 0;
const pending = new Map();
const events = new Map();

function send(method, params = {}) {
  const msgId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

function once(event) {
  return new Promise((resolve) => {
    const list = events.get(event) ?? [];
    list.push(resolve);
    events.set(event, list);
  });
}

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
    return;
  }
  if (msg.method && events.has(msg.method)) {
    const list = events.get(msg.method);
    const resolve = list.shift();
    if (resolve) resolve(msg.params);
  }
});

await send('Page.enable');
await send('Runtime.enable');
/* Sin esto Chrome reutiliza el CSS de la memoria y la captura sale con la
   version anterior: es el motivo de que dos capturas seguidas sean idénticas
   después de tocar la hoja de estilos. */
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });

await send('Emulation.setDeviceMetricsOverride', {
  width: opt.width,
  height: opt.height,
  deviceScaleFactor: 1,
  mobile: false,
});

const loaded = once('Page.loadEventFired');
await send('Page.navigate', { url: opt.url });
await loaded;
await new Promise((r) => setTimeout(r, opt.wait));

if (opt.do) {
  await send('Runtime.evaluate', { expression: opt.do, awaitPromise: true });
  await new Promise((r) => setTimeout(r, 500));
}

/* Para ver estados :hover hace falta un raton de verdad: mover el puntero. */
if (opt.hover) {
  const [hx, hy] = opt.hover.split(',').map(Number);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hx, y: hy, buttons: 0 });
  await new Promise((r) => setTimeout(r, 400));
}

/* Clic de verdad (no element.click()): asi se prueba el mismo camino que un
   usuario, con sus pointer events y su captura de puntero.
   --click-on busca el elemento en el momento del clic, que es lo unico fiable
   cuando la pagina se ha desplazado. */
if (opt.clickOn) {
  const r = await send('Runtime.evaluate', {
    expression: `(() => { const el = document.querySelector(${JSON.stringify(opt.clickOn)}); if (!el) return null; el.scrollIntoView({ block: 'center', behavior: 'instant' }); const b = el.getBoundingClientRect(); return [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)]; })()`,
    returnByValue: true,
  });
  if (Array.isArray(r.result.value)) {
    opt.click = r.result.value.join(',');
    await new Promise((res) => setTimeout(res, 400));
  } else {
    console.error('no encontrado:', opt.clickOn);
  }
}

if (opt.click) {
  const [cx, cy] = opt.click.split(',').map(Number);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cx, y: cy, buttons: 0 });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: cx, y: cy, buttons: 1, clickCount: 1, button: 'left' });
  await new Promise((r) => setTimeout(r, 60));
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: cx, y: cy, buttons: 0, clickCount: 1, button: 'left' });
  await new Promise((r) => setTimeout(r, 700));
}

/* Arrastre de verdad: pulsar, mover por pasos y soltar. Sirve para comprobar
   que las filas se desplazan y que un arrastre no dispara el enlace.
   Con --drag-on el punto de partida es el centro de ese elemento. */
if (opt.dragOn) {
  const r = await send('Runtime.evaluate', {
    expression: `(() => { const el = document.querySelector(${JSON.stringify(opt.dragOn)}); if (!el) return null; el.scrollIntoView({ block: 'center', behavior: 'instant' }); const b = el.getBoundingClientRect(); return [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)]; })()`,
    returnByValue: true,
  });
  if (Array.isArray(r.result.value)) {
    const [cx, cy] = r.result.value;
    const [dx, dy] = (opt.dragBy || '-300,0').split(',').map(Number);
    opt.drag = `${cx},${cy},${cx + dx},${cy + dy}`;
    await new Promise((res) => setTimeout(res, 300));
  } else {
    console.error('no encontrado:', opt.dragOn);
  }
}

if (opt.drag) {
  const [x1, y1, x2, y2] = opt.drag.split(',').map(Number);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x1, y: y1, buttons: 0 });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x1, y: y1, buttons: 1, clickCount: 1, button: 'left' });
  const pasos = 12;
  for (let i = 1; i <= pasos; i++) {
    const x = Math.round(x1 + ((x2 - x1) * i) / pasos);
    const y = Math.round(y1 + ((y2 - y1) * i) / pasos);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 1 });
    await new Promise((r) => setTimeout(r, 16));
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2, y: y2, buttons: 0, clickCount: 1, button: 'left' });
  await new Promise((r) => setTimeout(r, 700));
}

if (opt.eval) {
  const r2 = await send('Runtime.evaluate', { expression: opt.eval, returnByValue: true });
  console.log(JSON.stringify(r2.result.value, null, 2));
} else if (opt.measure) {
  const expr = `(() => {
    const out = [];
    const add = (label, el) => {
      if (!el) { out.push(label + ': FALTA'); return; }
      const r = el.getBoundingClientRect();
      out.push(label + ': y=' + Math.round(r.top + window.scrollY) +
        ' h=' + Math.round(r.height) + ' x=' + Math.round(r.left) +
        ' w=' + Math.round(r.width));
    };
    ${JSON.stringify(SELECTORS)}.forEach(([sel, label]) => add(label, document.querySelector(sel)));
    out.push('pagina: ' + document.documentElement.scrollHeight);
    return out.join('\\n');
  })()`;

  const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  console.log(res.result.value);
} else {
  const shot = opt.viewport
    ? await send('Page.captureScreenshot', { format: 'png' })
    : await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: opt.width, height: opt.height, scale: 1 },
      });
  const { writeFile, mkdir } = await import('node:fs/promises');
  const path = await import('node:path');
  await mkdir(path.dirname(opt.out), { recursive: true });
  await writeFile(opt.out, Buffer.from(shot.data, 'base64'));
  console.log('âœ“', opt.out);
}

ws.close();
