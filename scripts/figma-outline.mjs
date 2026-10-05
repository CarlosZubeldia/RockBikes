#!/usr/bin/env node
/**
 * figma-outline.mjs — imprime el esquema de un nodo ya descargado por figma-fetch.mjs.
 *
 * Sirve para orientarse en diseños grandes: muestra el árbol de contenedores con
 * sus coordenadas, de modo que se vean las secciones de la página y en qué orden van.
 *
 * Uso:
 *   node scripts/figma-outline.mjs
 *   node scripts/figma-outline.mjs --depth 3
 *   node scripts/figma-outline.mjs --input design/15076-5746.json --leaf
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTAINERS = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'GROUP', 'SECTION']);

function parseArgs(argv) {
  const opts = { input: 'design/15076-5746.json', depth: 2, leaf: false, flat: false, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input') opts.input = argv[++i];
    else if (a === '--depth') opts.depth = Number(argv[++i]);
    else if (a === '--leaf') opts.leaf = true;
    else if (a === '--flat') opts.flat = true;
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(`figma-outline.mjs — esquema de un nodo de Figma

  --input <ruta>   JSON descargado (por defecto design/15076-5746.json)
  --depth <n>      profundidad del árbol (por defecto 2)
  --leaf           incluye también nodos hoja (TEXT, VECTOR, RECTANGLE…)
  --flat           vuelca TODOS los nodos, uno por línea, con su id
  -h, --help       esta ayuda`);
      process.exit(0);
    } else {
      console.error(`Argumento no reconocido: ${a}`);
      process.exit(1);
    }
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const file = path.join(ROOT, opts.input);

let json;
try {
  json = JSON.parse(await readFile(file, 'utf8'));
} catch (err) {
  console.error(`\n  Error al leer ${opts.input}: ${err.message}\n`);
  process.exit(1);
}

const root = json.nodes?.[json.nodes ? Object.keys(json.nodes)[0] : '']?.document ?? json.document;
if (!root) {
  console.error('\n  No encontré el nodo raíz en ese JSON.\n');
  process.exit(1);
}

const round = (n) => (typeof n === 'number' ? Math.round(n) : '?');

function label(node) {
  const b = node.absoluteBoundingBox ?? {};
  const bits = [`${round(b.width)}×${round(b.height)}`];
  if (b.y !== undefined) bits.push(`y=${round(b.y)}`);
  const layout = node.layoutMode && node.layoutMode !== 'NONE' ? node.layoutMode.toLowerCase() : null;
  if (layout) bits.push(layout);
  if (node.type === 'TEXT' && node.characters) {
    const t = node.characters.replace(/\s+/g, ' ').trim();
    bits.push(`"${t.length > 40 ? t.slice(0, 40) + '…' : t}"`);
  }
  return bits.join('  ');
}

let counts = { shown: 0, total: 0 };

function walk(node, depth, prefix = '') {
  counts.total++;
  const isContainer = CONTAINERS.has(node.type);
  const show = depth <= opts.depth && (isContainer || opts.leaf);
  if (show) {
    counts.shown++;
    console.log(`${prefix}${node.type}  ${node.name}   [${label(node)}]`);
  }
  if (depth >= opts.depth) return;
  const kids = node.children ?? [];
  for (const kid of kids) {
    walk(kid, depth + 1, `${prefix}${show ? '  ' : ''}`);
  }
}

if (opts.flat) {
  // Volcado plano: una línea por nodo, pensado para redirigir a un archivo
  // y consultarlo después con grep.
  const lines = [];
  const flat = (node, depth) => {
    const b = node.absoluteBoundingBox ?? {};
    lines.push(
      [
        String(node.id ?? '').padEnd(26),
        String(depth).padStart(2),
        String(node.type).padEnd(11),
        `${round(b.width)}x${round(b.height)}`.padEnd(13),
        `x=${round(b.x)}`.padEnd(9),
        `y=${round(b.y)}`.padEnd(10),
        node.name,
      ].join(' ')
    );
    for (const kid of node.children ?? []) flat(kid, depth + 1);
  };
  flat(root, 0);
  if (opts.out) {
    await writeFile(path.join(ROOT, opts.out), lines.join('\n'), 'utf8');
    console.error(`  ${lines.length} nodos escritos en ${opts.out}`);
  } else {
    console.log(lines.join('\n'));
    console.error(`  ${lines.length} nodos volcados`);
  }
} else {
  console.log(`\n  ${opts.input}  →  ${root.name}  (${root.type})\n`);
  walk(root, 1);
  console.log(`\n  ${counts.total} nodos en total, ${counts.shown} mostrados a profundidad ${opts.depth}\n`);
}
