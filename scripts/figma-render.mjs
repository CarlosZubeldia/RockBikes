#!/usr/bin/env node
/**
 * figma-render.mjs — exporta nodos de Figma como PNG, recortados por Figma.
 *
 * figma-assets.mjs baja las imágenes ORIGINALES de los rellenos. Muchas veces
 * eso no sirve tal cual: cada relleno del diseño lleva su propia matriz de
 * transformación (imageTransform), así que la foto queda dentro del marco
 * encogida, movida o recortada. Si se coloca en CSS "a ojo", se comen las
 * ruedas de la bici.
 *
 * Este script pide a Figma el render del nodo ya compuesto —con su matriz
 * aplicada— y lo guarda al doble de tamaño. Es lo que usan la galería y las
 * fotos de «Product details» de la ficha de producto.
 *
 * Uso:
 *   node scripts/figma-render.mjs --ids "15408:6239,15408:6244" --out design/ficha/raw
 *   node scripts/figma-render.mjs --pairs "15408:6239:det-ruedas,15408:6244:det-pantalla"
 *
 * Token: FIGMA_TOKEN o la primera línea de .figma-token.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.figma.com/v1';

const opt = {
  file: '8mNr7UEzJA7LVwy7In9jlm',
  out: 'design/render',
  scale: 2,
  pairs: [],
};

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--file') opt.file = argv[++i];
  else if (a === '--out') opt.out = argv[++i];
  else if (a === '--scale') opt.scale = Number(argv[++i]);
  else if (a === '--ids') {
    // "15408:6239,15408:6244" -> nombre = id saneado
    for (const id of argv[++i].split(',')) {
      opt.pairs.push([id.trim(), id.trim().replace(/[^a-zA-Z0-9]+/g, '-')]);
    }
  } else if (a === '--pairs') {
    // "15408:6239:det-ruedas,15408:6244:det-pantalla"
    for (const chunk of argv[++i].split(',')) {
      const id = chunk.slice(0, chunk.lastIndexOf(':')).trim();
      const name = chunk.slice(chunk.lastIndexOf(':') + 1).trim();
      opt.pairs.push([id, name]);
    }
  } else if (a === '--help' || a === '-h') {
    console.log(`figma-render.mjs — exporta nodos de Figma como PNG al doble

  --ids   <a,b>         ids de nodo, separados por comas
  --pairs <id:nombre>   ids con nombre de archivo propio
  --out   <dir>         carpeta de destino (por defecto ${opt.out})
  --file  <key>         clave del archivo de Figma (por defecto ${opt.file})
  --scale <n>           escala del PNG (por defecto ${opt.scale})
  -h, --help            esta ayuda`);
    process.exit(0);
  } else {
    console.error(`Argumento no reconocido: ${a}`);
    process.exit(1);
  }
}

if (!opt.pairs.length) {
  console.error('Falta --ids o --pairs. Usa --help.');
  process.exit(1);
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
  console.error('No hay token: exporta FIGMA_TOKEN o crea .figma-token.');
  process.exit(1);
}

const token = await loadToken();
const outDir = path.join(ROOT, opt.out);
await mkdir(outDir, { recursive: true });

/* Figma devuelve las URLs de todos los nodos de una tacada. */
const ids = opt.pairs.map((p) => p[0]).join(',');
const url = `${API}/images/${opt.file}?ids=${encodeURIComponent(ids)}&format=png&scale=${opt.scale}`;
const res = await fetch(url, { headers: { 'X-Figma-Token': token } });

if (!res.ok) {
  console.error(`Figma respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}

const payload = await res.json();
if (payload.err) {
  console.error('Figma devolvió un error:', payload.err);
  process.exit(1);
}

let ok = 0;
for (const [id, name] of opt.pairs) {
  const img = payload.images?.[id];
  if (!img) {
    console.log(`  ! ${name}: Figma no devolvió imagen para ${id}`);
    continue;
  }
  const bin = await fetch(img);
  const buf = Buffer.from(await bin.arrayBuffer());
  await writeFile(path.join(outDir, `${name}.png`), buf);
  ok++;
  console.log(`  ✓ ${name}.png  ${(buf.length / 1024).toFixed(0)} KB`);
}

console.log(`\n  ${ok}/${opt.pairs.length} nodos en ${path.relative(ROOT, outDir)}\\`);
