# -*- coding: utf-8 -*-
"""
Servidor estatico para ver la pagina en local.

Existe porque `python -m http.server` a secas no conoce el tipo .webp y sirve
las imagenes optimizadas como application/octet-stream. Los navegadores lo
adivinan y se ven igual, pero es incorrecto y ensucia la comprobacion.

Uso:
    python scripts/serve.py            # http://127.0.0.1:5500
    python scripts/serve.py 8000       # otro puerto
"""
import http.server
import mimetypes
import os
import socketserver
import sys

# Tipos que la tabla de Python no trae en todas las versiones.
EXTRA = {
    '.webp': 'image/webp',
    '.otf': 'font/otf',
    '.woff2': 'font/woff2',
    '.webm': 'video/webm',
    '.avif': 'image/avif',
}
for ext, tipo in EXTRA.items():
    mimetypes.add_type(tipo, ext)

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 5500


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=RAIZ, **kw)

    def end_headers(self):
        # Sin cache, para que al recargar se vea siempre lo ultimo.
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        # Solo los errores: si no, recargar la pagina llena la consola.
        if not str(args[1]).startswith('2'):
            sys.stderr.write('  %s %s\n' % (args[1], args[0]))


class Servidor(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


with Servidor(('127.0.0.1', PUERTO), Handler) as httpd:
    print('sirviendo %s en http://127.0.0.1:%d' % (RAIZ, PUERTO), flush=True)
    httpd.serve_forever()
