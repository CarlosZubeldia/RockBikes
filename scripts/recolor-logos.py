#!/usr/bin/env python
"""
recolor-logos.py — pinta los logos de marca en amarillo plano.

En el diseño, la fila "Enjoy the best brands" muestra todos los logos en un
único amarillo (#FFD900), pero los archivos originales de Figma vienen con los
colores de cada marca (Segway en gris, Engwe en naranja...).

Se intentó recolorear con CSS (usar la imagen como máscara sobre un fondo
amarillo), pero al abrir la página con file:// el navegador no carga las
máscaras externas y los logos desaparecen. Generar los archivos ya pintados
evita depender del navegador por completo.

Para los PNG se conserva el canal alfa, que es lo que define la silueta del
logo. Para los SVG se reescriben los rellenos.

Uso:
  python scripts/recolor-logos.py
  python scripts/recolor-logos.py --color FFD900
"""

import argparse
import os
import re
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PNG_LOGOS = [
    "segway-logo-svg-1-699090.png",
    "engwe-logo-03-logo-1-66b4ba.png",
    "logo-1-cde675.png",
    "mark-1-dfc36e.png",
]

SVG_LOGOS = [
    "mask-group-15076-5898.svg",
    "vector-15076-5915.svg",
]


def recolor_png(src, dst, rgb):
    """Silueta del logo en color plano, conservando la transparencia."""
    img = Image.open(src).convert("RGBA")
    w, h = img.size

    alpha = img.getchannel("A")
    lo, hi = alpha.getextrema()

    if hi == 0:
        sys.exit(f"  Error: {os.path.basename(src)} está completamente transparente.")

    # Si la imagen es opaca (sin transparencia real), la silueta se deduce de la
    # luminosidad: lo oscuro es tinta.
    if lo == 255:
        grey = img.convert("L")
        alpha = grey.point(lambda v: 255 - v)

    flat = Image.new("RGBA", (w, h), rgb + (255,))
    flat.putalpha(alpha)
    flat.save(dst, "PNG", optimize=True)
    return os.path.getsize(dst)


def recolor_svg(src, dst, hex_color):
    """Reescribe todos los rellenos y trazos del SVG por el color indicado."""
    with open(src, "r", encoding="utf-8") as fh:
        text = fh.read()

    original = text
    # fill="#RRGGBB", fill="rgb(...)", style="fill:#RRGGBB"
    text = re.sub(r'(fill\s*[:=]\s*["\']?)(#[0-9A-Fa-f]{3,8}|rgb\([^)]*\)|white|black|none)',
                  lambda m: m.group(1) + (hex_color if m.group(2) != "none" else "none"),
                  text)
    text = re.sub(r'(stroke\s*[:=]\s*["\']?)(#[0-9A-Fa-f]{3,8}|rgb\([^)]*\)|white|black)',
                  lambda m: m.group(1) + hex_color,
                  text)

    if text == original:
        print(f"  ! {os.path.basename(src)}: no encontré rellenos que reescribir")

    with open(dst, "w", encoding="utf-8") as fh:
        fh.write(text)
    return os.path.getsize(dst)


def main():
    p = argparse.ArgumentParser(description="Pinta los logos de marca en un color plano.")
    p.add_argument("--color", default="FFD900", help="color en hexadecimal, sin # (por defecto FFD900)")
    p.add_argument("--img-dir", default="assets/opt")
    p.add_argument("--svg-dir", default="assets/svg")
    p.add_argument("--outdir", default="assets/logos")
    args = p.parse_args()

    hex_color = "#" + args.color.lstrip("#").upper()
    rgb = tuple(int(args.color.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))

    out_dir = os.path.join(ROOT, args.outdir)
    os.makedirs(out_dir, exist_ok=True)

    print(f"\n  Color: {hex_color}   destino: {args.outdir}\n")

    ok = 0
    for name in PNG_LOGOS:
        src = os.path.join(ROOT, args.img_dir, name)
        if not os.path.exists(src):
            print(f"  ! falta {name}")
            continue
        stem = re.sub(r"-[0-9a-f]{6}$", "", os.path.splitext(name)[0])
        dst = os.path.join(out_dir, f"{stem}.png")
        size = recolor_png(src, dst, rgb)
        print(f"  ok  {os.path.basename(dst)}  {size / 1024:.1f} KB")
        ok += 1

    for name in SVG_LOGOS:
        src = os.path.join(ROOT, args.svg_dir, name)
        if not os.path.exists(src):
            print(f"  ! falta {name}")
            continue
        dst = os.path.join(out_dir, name)
        size = recolor_svg(src, dst, hex_color)
        print(f"  ok  {name}  {size / 1024:.1f} KB")
        ok += 1

    print(f"\n  {ok} logos en {args.outdir}\n")


if __name__ == "__main__":
    main()
