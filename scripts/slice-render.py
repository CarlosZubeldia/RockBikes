#!/usr/bin/env python
"""
slice-render.py — parte el render de un frame alto en trozos legibles.

Un frame de 1366x8790 px no se puede revisar de una sola vez: al reducirlo para
que quepa, el texto deja de leerse. Este script lo corta en secciones verticales
y las reescala a un ancho manejable.

Uso:
  python scripts/slice-render.py
  python scripts/slice-render.py --input design/15076-5746.png --slices 6 --width 1100
"""

import argparse
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    p = argparse.ArgumentParser(description="Parte un render alto en trozos legibles.")
    p.add_argument("--input", default="design/15076-5746.png")
    p.add_argument("--outdir", default="design/slices")
    p.add_argument("--slices", type=int, default=6, help="número de trozos verticales")
    p.add_argument("--width", type=int, default=1100, help="ancho de salida de cada trozo")
    p.add_argument(
        "--crop",
        default=None,
        help="recorta una zona en coordenadas del DISEÑO: x,y,ancho,alto (ignora --slices)",
    )
    p.add_argument("--crop-out", default="crop.png", help="nombre del archivo recortado")
    args = p.parse_args()

    src = os.path.join(ROOT, args.input)
    if not os.path.exists(src):
        sys.exit(f"\n  Error: no existe {args.input}\n")

    img = Image.open(src).convert("RGB")
    w, h = img.size
    scale = args.width / w
    outdir = os.path.join(ROOT, args.outdir)
    os.makedirs(outdir, exist_ok=True)

    print(f"\n  Origen: {args.input}  {w}×{h} px")

    if args.crop:
        parts = [float(v) for v in args.crop.split(",")]
        if len(parts) != 4:
            sys.exit("\n  Error: --crop espera x,y,ancho,alto en coordenadas del diseño\n")
        # El render viene a más resolución que el diseño: hay que convertir.
        k = w / 1366.0
        x, y, cw, ch = parts
        box = (
            max(0, round(x * k)),
            max(0, round(y * k)),
            min(w, round((x + cw) * k)),
            min(h, round((y + ch) * k)),
        )
        tile = img.crop(box)
        target_w = min(max(tile.width, 900), 1400)
        if tile.width != target_w:
            ratio = target_w / tile.width
            tile = tile.resize((target_w, max(1, round(tile.height * ratio))), Image.LANCZOS)
        path = os.path.join(outdir, args.crop_out)
        tile.save(path, "PNG", optimize=True)
        print(f"  -> {os.path.relpath(path, ROOT)}  ({tile.width}×{tile.height})\n")
        return

    # Tira completa reducida, para tener la página entera de un vistazo.
    overview = img.resize((args.width, max(1, round(h * scale))), Image.LANCZOS)
    ov_path = os.path.join(outdir, "00-overview.png")
    overview.save(ov_path, "PNG", optimize=True)
    rel = os.path.relpath(ov_path, ROOT)
    print(f"  -> {rel}  ({overview.width}×{overview.height})")

    step = h / args.slices
    for i in range(args.slices):
        top = round(i * step)
        bottom = h if i == args.slices - 1 else round((i + 1) * step)
        # Un poco de solape para no cortar bloques justo en la junta.
        top = max(0, top - 40)
        bottom = min(h, bottom + 40)
        tile = img.crop((0, top, w, bottom))
        th = max(1, round(tile.height * scale))
        tile = tile.resize((args.width, th), Image.LANCZOS)
        name = f"{i + 1:02d}-y{top}-{bottom}.png"
        path = os.path.join(outdir, name)
        tile.save(path, "PNG", optimize=True)
        print(f"  -> {os.path.relpath(path, ROOT)}  ({tile.width}×{tile.height})")

    print()


if __name__ == "__main__":
    main()
