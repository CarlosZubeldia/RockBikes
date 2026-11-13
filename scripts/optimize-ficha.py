#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
optimize-ficha.py — pasa a WebP las fotos de la ficha de producto.

Las imágenes que devuelve Figma para el frame 15408:6030 (Ficha de Producto)
vienen en PNG de 1 024 a 2 482 px de lado y pesan entre 0,2 y 3,4 MB cada una.
La página las usa a la mitad de ese tamaño como mucho, así que se recortan al
encuadre exacto del diseño y se guardan en WebP.

El recorte imita a `object-fit: cover` centrado, que es como las pinta el CSS:
se escala la imagen hasta cubrir la caja y se recorta el sobrante por el centro.
Así lo que se ve en el navegador es lo mismo que se vio al recortar.

Uso:
  python scripts/optimize-ficha.py
  python scripts/optimize-ficha.py --out assets/opt --quality 78
"""

import argparse
import os
import sys

from PIL import Image, ImageOps

# La consola de Windows suele ir en cp1252 y no sabe escribir «✓» ni «→».
for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "ficha")
DESIGN = os.path.join(ROOT, "design", "ficha", "raw")

# (archivo de origen, nombre de salida, ancho, alto)
# El tamaño es el DOBLE del que ocupa en el diseño, para pantallas densas.
#
# La galería y las fotos de detalle NO se recortan aquí: se han exportado ya
# recortadas por Figma (scripts/figma-render.mjs), porque cada relleno del
# diseño lleva su propia matriz de transformación y recortarlas otra vez en
# local se comería las ruedas de la bici. El banner sí es la foto original: su
# encuadre se resuelve en CSS, con las proporciones que salen de esa matriz.
JOBS = [
    # Galería: diapositivas de 591x626 px.
    ("slide-01.png", "ficha-galeria-01", 1182, 1252),
    ("slide-02.png", "ficha-galeria-02", 1182, 1252),
    ("slide-03.png", "ficha-galeria-03", 1182, 1252),
    ("slide-04.png", "ficha-galeria-04", 1182, 1252),
    ("slide-05.png", "ficha-galeria-05", 1182, 1252),
    ("slide-06.png", "ficha-galeria-06", 1182, 1252),

    # Fotos de las cinco tarjetas de PRODUCT DETAILS, al encuadre del diseño.
    ("det-ruedas.png", "ficha-detalle-ruedas", 992, 712),
    ("det-pantalla.png", "ficha-detalle-pantalla", 848, 868),
    ("det-frenos.png", "ficha-detalle-frenos", 726, 896),
    ("det-compacto.png", "ficha-detalle-compacto", 1262, 848),
    ("det-plataforma.png", "ficha-detalle-plataforma", 1508, 1020),

    # Banner RIDE INTO THE WILD: la foto va dentro de los 1366x720 del marco.
    ("pantalla-horizontal-ride-into-the-wild-b35136.png", "ficha-banner", 1600, 901),

    # Fotos de las tarjetas relacionadas. Van sin recortar (modo "ancho"):
    # su encuadre lo pone el CSS con las mismas proporciones del diseño.
    ("pantalla-horizontal-ride-into-the-wild-b35136.png", "ficha-relacionada-01", 800, 0),
    ("img-d013e8.png", "ficha-relacionada-02", 800, 0),
    ("img-4be7f0.png", "ficha-relacionada-03", 800, 0),
    ("img-0b4ee9.png", "ficha-relacionada-04", 800, 0),
    ("img-40b415.png", "ficha-relacionada-05", 800, 0),
]


def find_source(name):
    for folder in (SRC, DESIGN):
        path = os.path.join(folder, name)
        if os.path.exists(path):
            return path
    return None


# Varias fotos de Figma llevan el fondo RECORTADO con alfa (croma). Si se
# convierte a RGB sin más, el fondo invisible reaparece: el PNG de las
# relacionadas guarda verde (71,112,76) bajo un alfa 0, y la tarjeta se vería
# verde. Se componen sobre el color que hay debajo en cada sitio.
FONDO = {
    "ficha-banner": (251, 191, 36),           # el banner va sobre ámbar #FBBF24
}


def aplanar(im, color):
    im = im.convert("RGBA")
    lienzo = Image.new("RGB", im.size, color)
    lienzo.paste(im, mask=im.getchannel("A"))
    return lienzo


def main():
    p = argparse.ArgumentParser(description="Optimiza las fotos de la ficha de producto.")
    p.add_argument("--out", default="assets/opt", help="carpeta de destino")
    p.add_argument("--quality", type=int, default=78, help="calidad WebP (por defecto 78)")
    args = p.parse_args()

    out_dir = os.path.join(ROOT, args.out)
    os.makedirs(out_dir, exist_ok=True)

    total_in = total_out = 0
    missing = []

    for src_name, out_name, w, h in JOBS:
        src = find_source(src_name)
        if not src:
            missing.append(src_name)
            continue

        im = Image.open(src)
        # Fondo de la foto: el que tenga debajo en la página.
        color = FONDO.get(out_name, (242, 242, 242))
        if im.mode in ("RGBA", "LA", "P") or "transparency" in im.info:
            im = aplanar(im, color)
        elif im.mode != "RGB":
            im = im.convert("RGB")

        if h:
            # ImageOps.fit = escalar cubriendo y recortar por el centro.
            fitted = ImageOps.fit(im, (w, h), method=Image.LANCZOS)
        else:
            # Solo por ancho: se conserva el encuadre original entero.
            ratio = w / im.width
            fitted = im.resize((w, max(1, round(im.height * ratio))), Image.LANCZOS)

        dest = os.path.join(out_dir, out_name + ".webp")
        fitted.save(dest, "WEBP", quality=args.quality, method=6)

        size_in = os.path.getsize(src)
        size_out = os.path.getsize(dest)
        total_in += size_in
        total_out += size_out
        print(f"  ✓ {out_name}.webp  {fitted.width}x{fitted.height}  "
              f"{size_in / 1024:6.0f} KB → {size_out / 1024:5.0f} KB")

    print(f"\n  {len(JOBS) - len(missing)} imágenes · "
          f"{total_in / 1024 / 1024:.1f} MB → {total_out / 1024 / 1024:.1f} MB")

    if missing:
        print("  Faltan (ejecuta antes scripts/figma-assets.mjs):")
        for name in missing:
            print(f"    · {name}")
        sys.exit(1)


if __name__ == "__main__":
    main()
