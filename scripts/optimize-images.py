#!/usr/bin/env python
"""
optimize-images.py — prepara las imágenes de Figma para publicarlas en web.

Las imágenes que devuelve la API de Figma son los originales a resolución
completa: en este proyecto suman más de 100 MB, inviable para una web. Este
script las reescala y las convierte a WebP, dejando en PNG solo las que tienen
transparencia (logos), donde WebP no aporta y el PNG ya es pequeño.

Uso:
  python scripts/optimize-images.py
  python scripts/optimize-images.py --max-width 1920 --quality 85
"""

import argparse
import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def human(n):
    return f"{n / 1024 / 1024:.2f} MB" if n >= 1024 * 1024 else f"{n / 1024:.0f} KB"


def main():
    p = argparse.ArgumentParser(description="Optimiza las imágenes descargadas de Figma.")
    p.add_argument("--input", default="assets/img")
    p.add_argument("--outdir", default="assets/opt")
    p.add_argument("--max-width", type=int, default=1600)
    p.add_argument("--quality", type=int, default=82)
    p.add_argument("--min-bytes", type=int, default=120 * 1024, help="no tocar archivos menores que esto")
    args = p.parse_args()

    src_dir = os.path.join(ROOT, args.input)
    out_dir = os.path.join(ROOT, args.outdir)
    if not os.path.isdir(src_dir):
        sys.exit(f"\n  Error: no existe {args.input}\n")
    os.makedirs(out_dir, exist_ok=True)

    names = sorted(
        f for f in os.listdir(src_dir)
        if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp")) and f != "manifest.json"
    )
    if not names:
        sys.exit(f"\n  No hay imágenes en {args.input}\n")

    print(f"\n  {len(names)} imágenes en {args.input} -> {args.outdir}\n")

    total_before = 0
    total_after = 0
    rows = []

    for name in names:
        src = os.path.join(src_dir, name)
        before = os.path.getsize(src)
        total_before += before

        try:
            img = Image.open(src)
            img.load()
        except Exception as exc:  # noqa: BLE001
            print(f"  ! no pude abrir {name}: {exc}")
            continue

        # Figma exporta muchas fotos opacas en RGBA. Solo cuenta como
        # transparencia real si algún píxel tiene alfa por debajo de 255;
        # si no, conviene tratarlas como opacas y pasarlas a WebP.
        has_alpha = False
        if img.mode in ("RGBA", "LA"):
            has_alpha = img.convert("RGBA").getchannel("A").getextrema()[0] < 255
        elif img.mode == "P" and "transparency" in img.info:
            has_alpha = True

        # Redimensionar solo si excede el ancho máximo.
        if img.width > args.max_width:
            ratio = args.max_width / img.width
            new_size = (args.max_width, max(1, round(img.height * ratio)))
            img = img.resize(new_size, Image.LANCZOS)

        small = before < args.min_bytes

        if has_alpha or small:
            # PNG para transparencias y para archivos ya pequeños.
            stem = os.path.splitext(name)[0]
            dst = os.path.join(out_dir, f"{stem}.png")
            img.save(dst, "PNG", optimize=True)
            fmt = "PNG"
        else:
            stem = os.path.splitext(name)[0]
            dst = os.path.join(out_dir, f"{stem}.webp")
            img.convert("RGB").save(dst, "WEBP", quality=args.quality, method=6)
            fmt = "WebP"

        after = os.path.getsize(dst)
        total_after += after
        rows.append((os.path.basename(dst), fmt, img.width, img.height, before, after))

    print(f"  {'archivo':<52} {'formato':<6} {'tamaño':<12} {'antes':>10} {'después':>10}")
    print(f"  {'-' * 52} {'-' * 6} {'-' * 12} {'-' * 10} {'-' * 10}")
    for fname, fmt, w, h, before, after in rows:
        short = fname if len(fname) <= 52 else fname[:49] + "..."
        print(f"  {short:<52} {fmt:<6} {f'{w}x{h}':<12} {human(before):>10} {human(after):>10}")

    saved = total_before - total_after
    pct = (saved / total_before * 100) if total_before else 0
    print(f"\n  Antes:   {human(total_before)}")
    print(f"  Después: {human(total_after)}")
    print(f"  Ahorro:  {human(saved)}  ({pct:.1f}%)\n")


if __name__ == "__main__":
    main()
