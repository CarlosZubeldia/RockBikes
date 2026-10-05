#!/usr/bin/env node
/**
 * figma-svg.mjs — exporta nodos de Figma como SVG (iconos, logos, vectores).
 *
 * Las imágenes incrustadas las baja figma-assets.mjs, pero los logos e iconos
 * vectoriales no son imágenes: hay que pedirle a Figma que los renderice como SVG.
 *
 * Uso:
 *   node scripts/figma-svg.mjs --list --match "logo"
 *   node scripts/figma-svg.mjs --match "logo" --out assets/svg
 *   node scripts/figma-svg.mjs --ids "15076:5746,15076:5747" --out assets/svg
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.figma.com/v1';

function parseArgs(argv) {
  const opts = {
    input: 'design/15076-5746.json',
    file: '8mNr7UEzJA7LVwy7In9jlm',
    out: 'assets/svg',
    match: null,
    ids: null,
    list: false,
    minSize: 8,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input') opts.input = argv[++i];
    else if (a === '--file') opts.file = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--match') opts.match = argv[++i];
    else if (a === '--ids') opts.ids = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--min-size') opts.minSize = Number(argv[++i]);
    else if (a === '--list') opts.list = true;
    else if (a === '--help' || a === '-h') {
      console.log(`figma-svg.mjs — exporta nodos de Figma como SVG

  --input <ruta>     JSON descargado (por defecto design/15076-5746.json)
  --file  <key>      clave del archivo de Figma
  --out   <dir>      carpeta de destino (por defecto assets/svg)
  --match <regex>    exporta los nodos cuyo nombre coincida
  --ids   <a,b,c>    exporta estos nodos por id
  --min-size <px>    ignora nodos menores de N px de ancho (por defecto 8)
  --list             solo muestra lo que coincidiría, sin descargar
  -h, --help         esta ayuda`);
      process.exit(0);
    } else {
      console.error(`Argumento no reconocido: ${a}`);
      process.exit(1);
    }
  }
  if (!opts.match && !opts.ids) {
    console.error('\n  Error: indica --match <regex> o --ids <a,b,c>.\n');
    process.exit(1);
  }
  return opts;
}

async function loadToken() {
  if (process.env.FIGMA_TOKEN?.trim()) return process.env.FIGMA_TOKEN.trim();
  const file = path.join(ROOT, '.figma-token');
  if (existsSync(file)) {
    const line = (await readFile(file, 'utf8'))
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s.length > 0 && !s.startsWith('#'));
    if (line) return line;
  }
  console.error('\n  Error: no encontré el token en .figma-token.\n');
  process.exit(1);
}

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'nodo';

function walk(node, visit, depth = 0) {
  visit(node, depth);
  for (const child of node.children ?? []) walk(child, visit, depth + 1);
}

const opts = parseArgs(process.argv.slice(2));
const token = await loadToken();

let json;
try {
  json = JSON.parse(await readFile(path.join(ROOT, opts.input), 'utf8'));
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

/* Seleccionar nodos. */

let targets = [];
if (opts.ids) {
  const wanted = new Set(opts.ids);
  walk(root, (n) => {
    if (wanted.has(n.id)) targets.push(n);
  });
  const found = new Set(targets.map((n) => n.id));
  for (const id of opts.ids) if (!found.has(id)) console.log(`  ! no encontré el nodo ${id}`);
} else {
  const re = new RegExp(opts.match, 'i');
  walk(root, (n) => {
    const w = n.absoluteBoundingBox?.width ?? 0;
    if (re.test(n.name) && w >= opts.minSize) targets.push(n);
  });
}

if (targets.length === 0) {
  console.log('\n  Ningún nodo coincide.\n');
  process.exit(0);
}

console.log(`\n  ${targets.length} nodo(s) seleccionado(s):\n`);
for (const n of targets) {
  const b = n.absoluteBoundingBox ?? {};
  console.log(
    `    ${n.id}  ${n.type.padEnd(10)} ${Math.round(b.width ?? 0)}×${Math.round(b.height ?? 0)}  ${n.name}`
  );
}

if (opts.list) {
  console.log('');
  process.exit(0);
}

/* Pedir los SVG a Figma, por lotes. */

const outDir = path.join(ROOT, opts.out);
await mkdir(outDir, { recursive: true });

const BATCH = 20;
let ok = 0;
let failed = 0;
const manifest = [];

for (let i = 0; i < targets.length; i += BATCH) {
  const batch = targets.slice(i, i + BATCH);
  const ids = batch.map((n) => n.id).join(',');
  const url = `${API}/images/${opts.file}?ids=${encodeURIComponent(ids)}&format=svg`;

  const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) {
    console.error(`  ! Figma respondió ${res.status} en el lote ${i / BATCH + 1}`);
    failed += batch.length;
    continue;
  }
  const payload = await res.json();
  if (payload.err) {
    console.error(`  ! ${payload.err}`);
    failed += batch.length;
    continue;
  }

  for (const node of batch) {
    const svgUrl = payload.images?.[node.id];
    if (!svgUrl) {
      failed++;
      console.log(`  ! sin SVG para ${node.id} (${node.name})`);
      continue;
    }
    const svgRes = await fetch(svgUrl);
    if (!svgRes.ok) {
      failed++;
      console.log(`  ! fallo al bajar ${node.name}: HTTP ${svgRes.status}`);
      continue;
    }
    const text = await svgRes.text();
    const filename = `${slug(node.name)}-${node.id.replace(/:/g, '-')}.svg`;
    await writeFile(path.join(outDir, filename), text, 'utf8');
    ok++;
    manifest.push({ archivo: filename, id: node.id, nombre: node.name, tipo: node.type });
    console.log(`  ✓ ${filename}  ${(text.length / 1024).toFixed(1)} KB`);
  }
}

if (manifest.length) {
  await writeFile(
    path.join(outDir, 'manifest.json'),
    JSON.stringify({ file: opts.file, total: manifest.length, svgs: manifest }, null, 2),
    'utf8'
  );
}

console.log(`\n  ${ok} SVG en ${path.relative(ROOT, outDir)}\\  (${failed} con fallo)\n`);
