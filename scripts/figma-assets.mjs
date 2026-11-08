#!/usr/bin/env node
/**
 * figma-assets.mjs — descarga las imágenes incrustadas de un diseño de Figma.
 *
 * El JSON de figma-fetch.mjs guarda, para cada relleno de tipo IMAGE, una
 * referencia (imageRef). Este script recoge esas referencias, las cruza con el
 * nombre y el id del nodo que las usa, pide a Figma las URLs reales y baja los
 * archivos con nombres legibles.
 *
 * Uso:
 *   node scripts/figma-assets.mjs
 *   node scripts/figma-assets.mjs --input design/15076-5746.json --out assets/img
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.figma.com/v1';

function parseArgs(argv) {
  const opts = { input: 'design/15076-5746.json', file: '8mNr7UEzJA7LVwy7In9jlm', out: 'assets/img' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input') opts.input = argv[++i];
    else if (a === '--file') opts.file = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(`figma-assets.mjs — descarga las imágenes incrustadas de un diseño

  --input <ruta>     JSON descargado (por defecto design/15076-5746.json)
  --file  <key>      clave del archivo de Figma (por defecto ${opts.file})
  --out   <dir>      carpeta de destino (por defecto assets/img)
  -h, --help         esta ayuda`);
      process.exit(0);
    } else {
      console.error(`Argumento no reconocido: ${a}`);
      process.exit(1);
    }
  }
  return opts;
}

async function loadToken() {
  const fromEnv = process.env.FIGMA_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  const file = path.join(ROOT, '.figma-token');
  if (existsSync(file)) {
    const line = (await readFile(file, 'utf8'))
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s.length > 0 && !s.startsWith('#'));
    if (line) return line;
  }
  console.error('\n  Error: no encontré el token. Ejecuta antes figma-fetch.mjs o crea .figma-token.\n');
  process.exit(1);
}

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'imagen';

function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

const opts = parseArgs(process.argv.slice(2));
const token = await loadToken();

let json;
try {
  // Los JSON de Figma pueden venir con BOM; los de design/menu/ lo traen.
  const raw = await readFile(path.join(ROOT, opts.input), 'utf8');
  json = JSON.parse(raw.replace(/^\uFEFF/, ''));
} catch (err) {
  console.error(`\n  Error al leer ${opts.input}: ${err.message}\n`);
  process.exit(1);
}

const rootKey = Object.keys(json.nodes ?? {})[0];
const root = json.nodes?.[rootKey]?.document ?? json.document;
if (!root) {
  console.error('\n  No encontré el nodo raíz en ese JSON.\n');
  process.exit(1);
}

/* 1. Recoger referencias de imagen y quién las usa. */

const uses = new Map(); // imageRef -> [{ id, name, width, height }]

walk(root, (node) => {
  for (const fill of node.fills ?? []) {
    if (fill.type !== 'IMAGE' || !fill.imageRef) continue;
    if (fill.visible === false) continue;
    const list = uses.get(fill.imageRef) ?? [];
    list.push({
      id: node.id,
      name: node.name,
      width: node.absoluteBoundingBox?.width,
      height: node.absoluteBoundingBox?.height,
    });
    uses.set(fill.imageRef, list);
  }
});

console.log(`\n  Referencias de imagen encontradas: ${uses.size}`);

if (uses.size === 0) {
  console.log('  (Este nodo no contiene imágenes incrustadas.)\n');
  process.exit(0);
}

/* 2. Pedir a Figma las URLs reales. */

const res = await fetch(`${API}/files/${opts.file}/images`, { headers: { 'X-Figma-Token': token } });
if (!res.ok) {
  const body = (await res.text()).slice(0, 300);
  console.error(`\n  Error: Figma respondió ${res.status}. ${body}\n`);
  process.exit(1);
}
const payload = await res.json();
const urls = payload.meta?.images ?? {};

/* 3. Descargar cada imagen con nombre legible. */

const outDir = path.join(ROOT, opts.out);
await mkdir(outDir, { recursive: true });

const manifest = [];
let ok = 0;
let missing = 0;

for (const [ref, nodes] of uses) {
  const url = urls[ref];
  const primary = nodes[0];
  const count = nodes.length;

  if (!url) {
    missing++;
    console.log(`  ! sin URL para ${ref.slice(0, 12)}…  (usada por "${primary.name}")`);
    continue;
  }

  const extMatch = new URL(url).pathname.match(/\.(png|jpe?g|gif|webp)$/i);
  const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '.png';
  const hash = createHash('sha1').update(ref).digest('hex').slice(0, 6);
  const filename = `${slug(primary.name)}-${hash}${ext}`;

  const imgRes = await fetch(url);
  if (!imgRes.ok) {
    missing++;
    console.log(`  ! fallo al descargar "${filename}": HTTP ${imgRes.status}`);
    continue;
  }
  const buf = Buffer.from(await imgRes.arrayBuffer());
  await writeFile(path.join(outDir, filename), buf);
  ok++;

  manifest.push({
    archivo: filename,
    imageRef: ref,
    usos: count,
    nodos: nodes.slice(0, 8).map((n) => ({ id: n.id, nombre: n.name })),
    bytes: buf.length,
  });

  const kb = (buf.length / 1024).toFixed(0).padStart(5);
  console.log(`  ✓ ${filename}  ${kb} KB  (${count} uso${count > 1 ? 's' : ''})`);
}

await writeFile(
  path.join(outDir, 'manifest.json'),
  JSON.stringify({ file: opts.file, total: manifest.length, assets: manifest }, null, 2),
  'utf8'
);

console.log(`\n  ${ok} imágenes en ${path.relative(ROOT, outDir)}\\  (${missing} sin descargar)`);
console.log(`  Manifiesto: ${path.relative(ROOT, path.join(outDir, 'manifest.json'))}\n`);
