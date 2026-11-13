---
name: revisar-pagina
description: Revisa una página HTML del proyecto (accesibilidad, diseño responsive y errores) sin modificarla
---
Revisa la página indicada y NO modifiques nada. Comprueba:
1. Enlaces rotos y archivos que no existen (CSS, JS, imágenes).
2. Accesibilidad según la rule de accesibilidad: contraste, teclado, foco, alt, etiquetas y semántica.
3. Diseño responsive en móvil (375 px), tablet (768 px) y escritorio (1440 px).
4. Errores en la consola del navegador.
Devuelve una tabla con estas columnas: problema, gravedad (alta/media/baja), dónde está y cómo arreglarlo.
Al final, pregunta qué problemas quiero que arregles.
