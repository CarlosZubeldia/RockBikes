#!/usr/bin/env node
/**
 * figma-fetch.mjs — trae un frame de Figma a este proyecto usando la API REST.
 *
 * Funciona en cualquier plan de Figma (no requiere Dev Mode ni asiento Dev/Full),
 * a diferencia del servidor MCP de escritorio.
 *
 * Uso:
 *   node scripts/figma-fetch.mjs
 *   node scripts/figma-fetch.mjs --node 15076:5746 --scale 2
 *   node scripts/figma-fetch.mjs --file 8mNr7UEzJA7LVwy7In9jlm --node 1:23
 *
 * Token: se lee de la variable de entorno FIGMA_TOKEN o, si no existe, de la
 * primera línea no vacía del archivo .figma-token en la raíz del proyecto.
 *
 * Salidas (por defecto en design/):
 *   <node>.json    árbol completo del nodo (geometría, estilos, texto)
 *   <node>.png     render del frame
 *   tokens.json    resumen: colores, tipografías, radios, textos
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.figma.com/v1';

// Valores por defecto tomados del enlace del proyecto rock-bikes.
const DEFAULTS = {
  file: '8mNr7UEzJA7LVwy7In9jlm',
  node: '15076:5746',
  out: 'design',
  scale: 2,
};

/* ------------------------------- argumentos ------------------------------- */

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) fail(`Falta el valor de ${a}`);
      return v;
    };
    if (a === '--file') opts.file = next();
    else if (a === '--node') opts.node = next();
    else if (a === '--out') opts.out = next();
    else if (a === '--scale') opts.scale = Number(next());
    else if (a === '--help' || a === '-h') { printHelp(); throw new HelpRequested(); }
    else fail(`Argumento no reconocido: ${a}`);
  }
  // La API acepta "1:23"; los enlaces de Figma usan "1-23".
  opts.node = opts.node.replace(/-/g, ':');
  if (!Number.isFinite(opts.scale) || opts.scale <= 0) fail('--scale debe ser un número positivo');
  return opts;
}

function printHelp() {
  console.log(`figma-fetch.mjs — descarga un frame de Figma como JSON + PNG

Opciones:
  --file  <file_key>   clave del archivo (por defecto ${DEFAULTS.file})
  --node  <node_id>    id del nodo, "15076:5746" o "15076-5746" (por defecto ${DEFAULTS.node})
  --out   <dir>        carpeta de salida (por defecto ${DEFAULTS.out})
  --scale <n>          escala del PNG, 1-4 (por defecto ${DEFAULTS.scale})
  -h, --help           muestra esta ayuda`);
}

class FatalError extends Error {}
class HelpRequested extends Error {}

// Lanza en lugar de llamar a process.exit(): salir mientras undici todavía
// cierra sockets provoca un fallo de aserción de libuv en Windows.
function fail(msg) {
  throw new FatalError(msg);
}

/* --------------------------------- token --------------------------------- */

async function loadToken() {
  const fromEnv = process.env.FIGMA_TOKEN?.trim();
  if (fromEnv) return { token: fromEnv, origin: 'variable FIGMA_TOKEN' };

  const file = path.join(ROOT, '.figma-token');
  if (existsSync(file)) {
    const raw = await readFile(file, 'utf8');
    const line = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s.length > 0 && !s.startsWith('#'));
    if (line) return { token: line, origin: '.figma-token' };
  }
  return null;
}

/* ---------------------------------- HTTP ---------------------------------- */

async function figmaGet(url, token) {
  let res;
  try {
    res = await fetch(url, { headers: { 'X-Figma-Token': token } });
  } catch (err) {
    fail(`No se pudo conectar con api.figma.com: ${err.message}`);
  }

  if (res.status === 403) {
    const body = (await res.text()).slice(0, 300).trim();
    fail(
      'Figma respondió 403 (prohibido).' +
      (body ? `\n  Detalle que devuelve Figma: ${body}\n` : '\n') +
      '  Causas típicas:\n' +
      '  - El token está mal copiado, caducó o fue revocado.\n' +
      '  - Al token le falta el scope file_content:read.\n' +
      '  - La cuenta del token no tiene permiso sobre este archivo.'
    );
  }
  if (res.status === 404) {
    fail('Figma respondió 404: el file_key no existe o no tienes acceso a él.');
  }
  if (res.status === 429) {
    fail('Figma respondió 429: has superado el límite de peticiones. Espera unos minutos.');
  }
  if (!res.ok) {
    fail(`Figma respondió ${res.status} ${res.statusText}: ${(await res.text()).slice(0, 300)}`);
  }
  return res;
}

/* ------------------------- recorrido y tokenización ------------------------ */

const toHex = ({ r, g, b }) =>
  '#' +
  [r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

function walk(node, visit, depth = 0) {
  visit(node, depth);
  for (const child of node.children ?? []) walk(child, visit, depth + 1);
}

function extractTokens(root) {
  const colors = new Map();
  const fonts = new Map();
  const radii = new Map();
  const texts = [];
  const stats = { nodes: 0, byType: {} };

  const bump = (map, key, label) => {
    const entry = map.get(key) ?? { key, label, count: 0 };
    entry.count++;
    map.set(key, entry);
  };

  walk(root, (node) => {
    stats.nodes++;
    stats.byType[node.type] = (stats.byType[node.type] ?? 0) + 1;

    for (const fill of node.fills ?? []) {
      if (fill.visible === false) continue;
      if (fill.type === 'SOLID') {
        const hex = toHex(fill.color);
        bump(colors, hex, hex);
      } else if (fill.type?.startsWith('GRADIENT')) {
        const stops = (fill.gradientStops ?? [])
          .map((s) => toHex(s.color))
          .join(' → ');
        bump(colors, `gradient:${stops}`, `degradado ${stops}`);
      }
    }

    if (node.type === 'TEXT') {
      const s = node.style ?? {};
      const key = `${s.fontFamily} ${s.fontWeight} ${s.fontSize}px`;
      bump(fonts, key, key);
      if (node.characters) texts.push(node.characters);
    }

    const r = node.cornerRadius ?? node.rectangleCornerRadii?.[0];
    if (typeof r === 'number' && r > 0) bump(radii, `${r}px`, `${r}px`);
  });

  const sortByCount = (map) =>
    [...map.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

  return {
    source: { file: null, node: null },
    stats,
    colors: sortByCount(colors),
    fonts: sortByCount(fonts),
    radii: sortByCount(radii),
    texts,
  };
}

/* ---------------------------------- main ---------------------------------- */

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const auth = await loadToken();
  if (!auth) {
    fail(
      'No encontré ningún token de Figma.\n\n' +
      '  Crea uno en: figma.com → tu avatar → Settings → Security → Personal access tokens\n' +
      '  Scope necesario: file_content:read\n\n' +
      `  Después guarda el token en: ${path.join(ROOT, '.figma-token')}\n` +
      '  (una sola línea, sin comillas) o expórtalo como FIGMA_TOKEN.'
    );
  }

  const outDir = path.join(ROOT, opts.out);
  await mkdir(outDir, { recursive: true });
  const slug = opts.node.replace(/:/g, '-');

  console.log(`\n  Figma → ${path.relative(ROOT, outDir)}\\`);
  console.log(`  Token:  ${auth.origin}`);
  console.log(`  Archivo: ${opts.file}`);
  console.log(`  Nodo:    ${opts.node}\n`);

  // 1. Árbol del nodo.
  const nodeUrl = `${API}/files/${opts.file}/nodes?ids=${encodeURIComponent(opts.node)}&geometry=paths`;
  const nodeRes = await figmaGet(nodeUrl, auth.token);
  const nodeJson = await nodeRes.json();

  const doc = nodeJson.nodes?.[opts.node]?.document;
  const apiErr = nodeJson.nodes?.[opts.node]?.err;
  if (apiErr) fail(`La API devolvió un error para ese nodo: ${apiErr}`);
  if (!doc) {
    const disponibles = Object.keys(nodeJson.nodes ?? {});
    fail(
      `El nodo ${opts.node} no existe en este archivo` +
      (disponibles.length ? ` (la API devolvió: ${disponibles.join(', ')})` : '.')
    );
  }

  const nodeFile = path.join(outDir, `${slug}.json`);
  await writeFile(nodeFile, JSON.stringify(nodeJson, null, 2), 'utf8');
  console.log(`  ✓ ${path.relative(ROOT, nodeFile)}`);

  // 2. Tokens de diseño.
  const tokens = extractTokens(doc);
  tokens.source = { file: opts.file, node: opts.node, name: doc.name };
  const tokensFile = path.join(outDir, 'tokens.json');
  await writeFile(tokensFile, JSON.stringify(tokens, null, 2), 'utf8');
  console.log(`  ✓ ${path.relative(ROOT, tokensFile)}`);

  // 3. Render PNG.
  const imgUrl = `${API}/images/${opts.file}?ids=${encodeURIComponent(opts.node)}&format=png&scale=${opts.scale}`;
  const imgRes = await figmaGet(imgUrl, auth.token);
  const imgJson = await imgRes.json();
  const renderUrl = imgJson.images?.[opts.node];

  if (imgJson.err) {
    console.log(`  ! No se pudo renderizar el PNG: ${imgJson.err}`);
  } else if (renderUrl) {
    const png = await fetch(renderUrl);
    if (!png.ok) fail(`No se pudo descargar el render: ${png.status}`);
    const buf = Buffer.from(await png.arrayBuffer());
    const pngFile = path.join(outDir, `${slug}.png`);
    await writeFile(pngFile, buf);
    console.log(`  ✓ ${path.relative(ROOT, pngFile)}  (${(buf.length / 1024).toFixed(0)} KB)`);
  } else {
    console.log('  ! La API no devolvió URL de render para este nodo.');
  }

  // 4. Resumen legible.
  const { width, height } = doc.absoluteBoundingBox ?? {};
  console.log(`\n  Frame "${doc.name}"`);
  if (width && height) console.log(`  Tamaño: ${Math.round(width)} × ${Math.round(height)} px`);
  console.log(`  Nodos:  ${tokens.stats.nodes}`);
  console.log(`  Colores: ${tokens.colors.length}   Tipografías: ${tokens.fonts.length}   Textos: ${tokens.texts.length}`);

  if (tokens.colors.length) {
    console.log('\n  Colores más usados:');
    for (const c of tokens.colors.slice(0, 12)) {
      console.log(`    ${String(c.count).padStart(4)} ×  ${c.label}`);
    }
  }
  if (tokens.fonts.length) {
    console.log('\n  Tipografías:');
    for (const f of tokens.fonts.slice(0, 12)) {
      console.log(`    ${String(f.count).padStart(4)} ×  ${f.label}`);
    }
  }
  console.log('');
}

try {
  await main();
} catch (err) {
  if (err instanceof HelpRequested) {
    process.exitCode = 0;
  } else if (err instanceof FatalError) {
    console.error(`\n  Error: ${err.message}\n`);
    process.exitCode = 1;
  } else {
    console.error(`\n  Error inesperado: ${err?.stack ?? err}\n`);
    process.exitCode = 1;
  }
}
