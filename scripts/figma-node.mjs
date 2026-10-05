#!/usr/bin/env node
/**
 * figma-node.mjs — consulta detalles finos de un diseño ya descargado.
 *
 * figma-outline.mjs da la estructura (dónde está cada cosa) y tokens.json da el
 * resumen global. Esto da el detalle que hace falta para maquetar con fidelidad:
 * tamaños de fuente exactos, interlineados, colores por nodo, rellenos, radios y
 * parámetros de auto layout.
 *
 * Uso:
 *   node scripts/figma-node.mjs --texts                 # todos los textos con su estilo
 *   node scripts/figma-node.mjs --texts --out design/text-styles.txt
 *   node scripts/figma-node.mjs --id 15076:5751         # detalle de un nodo
 *   node scripts/figma-node.mjs --frames                # relleno y auto layout de los contenedores
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const opts = { input: 'design/15076-5746.json', id: null, texts: false, frames: false, out: null, raw: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input') opts.input = argv[++i];
    else if (a === '--id') opts.id = argv[++i];
    else if (a === '--texts') opts.texts = true;
    else if (a === '--frames') opts.frames = true;
    else if (a === '--raw') opts.raw = true;
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(`figma-node.mjs — detalle fino de un diseño de Figma

  --input <ruta>   JSON descargado (por defecto design/15076-5746.json)
  --texts          lista todos los TEXT con fuente, tamaño, color y posición
  --frames         lista los contenedores con relleno, radios y auto layout
  --id <nodo>      detalle completo de un nodo concreto
  --out <ruta>     escribe el resultado en un archivo en vez de por pantalla
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

const R = (n) => (typeof n === 'number' ? Math.round(n) : undefined);

function hexOf(color, opacity) {
  if (!color) return undefined;
  const hex =
    '#' +
    [color.r, color.g, color.b]
      .map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  const a = (color.a ?? 1) * (opacity ?? 1);
  return a < 1 ? `${hex} ${(a * 100).toFixed(0)}%` : hex;
}

function fillOf(node) {
  const out = [];
  for (const f of node.fills ?? []) {
    if (f.visible === false) continue;
    if (f.type === 'SOLID') out.push(hexOf(f.color, f.opacity));
    else if (f.type?.startsWith('GRADIENT')) {
      // Los puntos de control dicen hacia dónde va el degradado: sin ellos solo
      // se sabe el color, no la dirección ni el reparto.
      const stops = (f.gradientStops ?? [])
        .map((s) => `${hexOf(s.color, s.opacity)}@${Math.round(s.position * 100)}%`)
        .join(' ');
      const h = (f.gradientHandlePositions ?? [])
        .map((p) => `(${p.x.toFixed(3)},${p.y.toFixed(3)})`)
        .join('→');
      out.push(`${f.type.replace('GRADIENT_', 'grad-')}[${h}] {${stops}}`);
    } else if (f.type === 'IMAGE') out.push(`IMAGE:${(f.imageRef ?? '?').slice(0, 8)}`);
    else if (f.type === 'VIDEO') out.push(`VIDEO:${f.videoRef ?? '?'}`);
    else out.push(`?${f.type}`);
  }
  return out.join(', ') || '-';
}

function layoutOf(node) {
  const bits = [];
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    bits.push(node.layoutMode.toLowerCase());
    const pad = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].map(R);
    if (pad.some((v) => v)) bits.push(`pad ${pad.join('/')}`);
    if (node.itemSpacing) bits.push(`gap ${R(node.itemSpacing)}`);
    if (node.primaryAxisAlignItems) bits.push(`justify ${node.primaryAxisAlignItems.toLowerCase()}`);
    if (node.counterAxisAlignItems) bits.push(`align ${node.counterAxisAlignItems.toLowerCase()}`);
  }
  const r = node.cornerRadius ?? node.rectangleCornerRadii?.[0];
  if (typeof r === 'number' && r > 0) bits.push(`radio ${R(r)}`);
  if (node.rectangleCornerRadii && new Set(node.rectangleCornerRadii.map(R)).size > 1) {
    bits.push(`radios ${node.rectangleCornerRadii.map(R).join('/')}`);
  }
  return bits.join('  ');
}

const lines = [];

function walk(node, visit, depth = 0) {
  visit(node, depth);
  for (const child of node.children ?? []) walk(child, visit, depth + 1);
}

if (opts.id) {
  let found = null;
  walk(root, (n, d) => {
    if (n.id === opts.id) found = { node: n, depth: d };
  });
  if (!found) {
    console.error(`\n  No encontré el nodo ${opts.id}\n`);
    process.exit(1);
  }
  const n = found.node;

  if (opts.raw) {
    // Volcado en crudo: para ver cosas que el resumen no cubre, como los estilos
    // por carácter (characterStyleOverrides) o si el texto es cursiva.
    // Se escribe con --out en vez de por pantalla porque el redirect de
    // PowerShell genera UTF-16 y luego cuesta leerlo.
    const volcado = JSON.stringify(n, null, 2);
    if (opts.out) {
      await writeFile(path.join(ROOT, opts.out), volcado, 'utf8');
      console.error(`  volcado en ${opts.out}`);
    } else {
      console.log(volcado);
    }
    process.exit(0);
  }

  const b = n.absoluteBoundingBox ?? {};
  lines.push(`Nodo ${n.id}  (profundidad ${found.depth})`);
  lines.push(`  nombre   ${n.name}`);
  lines.push(`  tipo     ${n.type}`);
  lines.push(`  caja     ${R(b.width)}×${R(b.height)}  en x=${R(b.x)} y=${R(b.y)}`);
  lines.push(`  relleno  ${fillOf(n)}`);
  const l = layoutOf(n);
  if (l) lines.push(`  layout   ${l}`);
  if (n.opacity !== undefined && n.opacity < 1) lines.push(`  opacidad ${n.opacity}`);
  if (n.type === 'TEXT') {
    const s = n.style ?? {};
    lines.push(`  texto    "${(n.characters ?? '').replace(/\n/g, '\\n')}"`);
    lines.push(`  fuente   ${s.fontFamily} ${s.fontWeight} ${s.fontSize}px`);
    lines.push(`  línea    ${s.lineHeightPx ? R(s.lineHeightPx) + 'px' : '-'}   letter-spacing ${s.letterSpacing ?? 0}`);
    lines.push(`  alineado ${s.textAlignHorizontal} / ${s.textAlignVertical}  caja ${s.textCase ?? 'ORIGINAL'}`);
  }
  lines.push(`  hijos    ${(n.children ?? []).length}`);
} else if (opts.texts) {
  walk(root, (n, d) => {
    if (n.type !== 'TEXT') return;
    const b = n.absoluteBoundingBox ?? {};
    const s = n.style ?? {};
    const text = (n.characters ?? '').replace(/\s+/g, ' ').trim();
    const shown = text.length > 58 ? text.slice(0, 58) + '…' : text;
    lines.push(
      [
        String(n.id).padEnd(26),
        String(d).padStart(2),
        `${R(b.width)}x${R(b.height)}`.padEnd(11),
        `x=${R(b.x)}`.padEnd(9),
        `y=${R(b.y)}`.padEnd(10),
        `${s.fontFamily ?? '?'} ${s.fontWeight ?? '?'} ${s.fontSize ?? '?'}`.padEnd(28),
        (s.lineHeightPx ? `lh${R(s.lineHeightPx)}` : 'lh-').padEnd(6),
        fillOf(n).padEnd(9),
        `"${shown}"`,
      ].join(' ')
    );
  });
} else if (opts.frames) {
  walk(root, (n) => {
    if (n.type !== 'FRAME' && n.type !== 'INSTANCE') return;
    const l = layoutOf(n);
    const f = fillOf(n);
    if (!l && f === '-') return;
    const b = n.absoluteBoundingBox ?? {};
    lines.push(
      [
        String(n.id).padEnd(26),
        `${R(b.width)}x${R(b.height)}`.padEnd(11),
        `x=${R(b.x)}`.padEnd(9),
        `y=${R(b.y)}`.padEnd(10),
        f.padEnd(22),
        l.padEnd(46),
        n.name,
      ].join(' ')
    );
  });
} else {
  console.error('\n  Indica --texts, --frames o --id <nodo>. Usa --help.\n');
  process.exit(1);
}

const output = lines.join('\n');
if (opts.out) {
  await writeFile(path.join(ROOT, opts.out), output, 'utf8');
  console.error(`  ${lines.length} líneas escritas en ${opts.out}`);
} else {
  console.log(output);
}
