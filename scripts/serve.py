# -*- coding: utf-8 -*-
"""
Servidor estatico para ver la pagina en local.

Existe porque `python -m http.server` a secas no conoce el tipo .webp y sirve
las imagenes optimizadas como application/octet-stream. Los navegadores lo
adivinan y se ven igual, pero es incorrecto y ensucia la comprobacion.

Ademas atiende peticiones Range (206 Partial Content). Sin ellas los
navegadores no arrancan los videos grandes ni dejan buscar dentro: Safari/iOS
se niega a reproducir, y Chrome descarga el archivo entero antes de pintar el
primer fotograma.

Uso:
    python scripts/serve.py            # http://127.0.0.1:5500
    python scripts/serve.py 8000       # otro puerto
"""
import http.server
import io
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
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    @staticmethod
    def _parsear_rango(cabecera, tam):
        """Devuelve (inicio, fin) o None si la cabecera no sirve."""
        if not cabecera or not cabecera.startswith('bytes='):
            return None
        # Solo se atiende un rango simple: bytes=a-b, bytes=a- o bytes=-n.
        trozo = cabecera[len('bytes='):].split(',')[0].strip()
        if '-' not in trozo:
            return None
        desde, hasta = trozo.split('-', 1)
        try:
            if desde == '':
                if hasta == '':
                    return None
                n = int(hasta)
                inicio, fin = max(0, tam - n), tam - 1
            else:
                inicio = int(desde)
                fin = int(hasta) if hasta != '' else tam - 1
        except ValueError:
            return None
        if inicio < 0 or inicio >= tam:
            return None
        fin = min(fin, tam - 1)
        if fin < inicio:
            return None
        return inicio, fin

    def send_head(self):
        ruta = self.translate_path(self.path)
        rango = None
        if os.path.isfile(ruta):
            tam = os.path.getsize(ruta)
            rango = self._parsear_rango(self.headers.get('Range'), tam)
        if rango is None:
            if self.headers.get('Range') and os.path.isfile(ruta):
                self.send_error(416, 'Requested Range Not Satisfiable')
                return None
            return super().send_head()

        inicio, fin = rango
        try:
            with open(ruta, 'rb') as f:
                f.seek(inicio)
                datos = f.read(fin - inicio + 1)
        except OSError:
            self.send_error(404, 'File not found')
            return None
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(ruta))
        self.send_header('Content-Range', 'bytes %d-%d/%d' % (inicio, fin, tam))
        self.send_header('Content-Length', str(len(datos)))
        self.end_headers()
        return io.BytesIO(datos)

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
