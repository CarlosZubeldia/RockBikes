/* ==========================================================================
   ROCK BIKES — comportamiento de la ficha de producto

   Solo lo que esta página necesita de verdad: los acordeones, los puntos de la
   fila de relacionados y el botón de copiar enlace.
   El arrastre de la galería y de la fila de tarjetas lo pone main.js con
   [data-drag-scroll], y la cabecera adhesiva también viene de allí.
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------------------- acordeones ---------------------------- */

  /* Un solo acordeón abierto a la vez, como en el diseño: al abrir
     «Technical Specifications» se cierra «Description». El panel se oculta con
     [hidden] y no con display:none, para que el lector de pantalla lo anuncie
     igual y el botón siga apuntando a su región con aria-controls. */
  var faq = document.querySelector('[data-faq]');

  if (faq) {
    var items = faq.querySelectorAll('.faq__item');

    function setOpen(item, open) {
      var toggle = item.querySelector('.faq__toggle');
      var panel = item.querySelector('.faq__panel');
      if (!toggle || !panel) { return; }
      item.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    }

    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var toggle = item.querySelector('.faq__toggle');
        if (!toggle) { return; }
        toggle.addEventListener('click', function () {
          var willOpen = !item.classList.contains('is-open');
          for (var n = 0; n < items.length; n++) { setOpen(items[n], false); }
          if (willOpen) { setOpen(item, true); }
        });
      })(items[i]);
    }
  }

  /* ------------------------- puntos de los relacionados ------------------- */

  /* La fila se desplaza a mano; los puntos solo la reflejan y sirven para
     saltar. Como las tarjetas miden 400 px y caben tres y pico, cada punto
     lleva a una tarjeta, no a una «página». */
  var related = document.querySelector('.related');
  if (related) {
    var scroller = related.querySelector('[data-drag-scroll]');
    var dotsBox = related.querySelector('[data-dots]');
    var cards = related.querySelectorAll('.prod');

    if (scroller && dotsBox && cards.length) {
      var dots = dotsBox.querySelectorAll('button');

      var current = function () {
        var left = scroller.scrollLeft;
        var best = 0;
        var bestGap = Infinity;
        for (var n = 0; n < cards.length; n++) {
          var gap = Math.abs(cards[n].offsetLeft - left);
          if (gap < bestGap) { bestGap = gap; best = n; }
        }
        return best;
      };

      var paint = function () {
        var index = current();
        for (var n = 0; n < dots.length; n++) {
          dots[n].setAttribute('aria-current', n === index ? 'true' : 'false');
        }
      };

      for (var d = 0; d < dots.length; d++) {
        (function (dot, index) {
          dot.addEventListener('click', function () {
            if (!cards[index]) { return; }
            scroller.scrollTo({ left: cards[index].offsetLeft, behavior: 'smooth' });
          });
        })(dots[d], d);
      }

      var ticking = false;
      scroller.addEventListener('scroll', function () {
        if (ticking) { return; }
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          paint();
        });
      }, { passive: true });

      paint();
    }
  }

  /* -------------------------------- galería ------------------------------- */

  /* En el móvil la tira de fotos lleva flechas y puntos, como el marco de
     390 px. En escritorio no se ven (display:none), pero el código es el
     mismo: si algún día se quieren también en escritorio, ya están. */
  var gallery = document.querySelector('.gallery-wrap');
  if (gallery) {
    var strip = gallery.querySelector('.gallery');
    var slides = gallery.querySelectorAll('.gallery__slide');
    var prev = gallery.querySelector('[data-gallery-prev]');
    var next = gallery.querySelector('[data-gallery-next]');
    var dotsBox = gallery.querySelector('[data-gallery-dots]');

    var step = function () {
      if (!slides.length) { return 0; }
      var first = slides[0].getBoundingClientRect();
      var second = slides[1] ? slides[1].getBoundingClientRect() : null;
      return second ? second.left - first.left : first.width;
    };

    if (dotsBox) {
      for (var s = 0; s < slides.length; s++) {
        (function (index) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Image ' + (index + 1));
          dot.addEventListener('click', function () {
            strip.scrollTo({ left: step() * index, behavior: 'smooth' });
          });
          dotsBox.appendChild(dot);
        })(s);
      }
    }

    var page = function (dir) {
      strip.scrollBy({ left: step() * dir, behavior: 'smooth' });
    };

    if (prev) { prev.addEventListener('click', function () { page(-1); }); }
    if (next) { next.addEventListener('click', function () { page(1); }); }

    var sync = function () {
      var i = step() ? Math.round(strip.scrollLeft / step()) : 0;
      var dots = dotsBox ? dotsBox.children : [];
      for (var n = 0; n < dots.length; n++) {
        dots[n].setAttribute('aria-current', n === i ? 'true' : 'false');
      }
      if (prev) { prev.disabled = strip.scrollLeft <= 2; }
      if (next) {
        next.disabled = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 2;
      }
    };

    strip.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---------------------------- visor de la galería ---------------------- */

  /* Las fotos de la galería son enlaces a su propio archivo; con esto se abre
     un <dialog> a pantalla completa en su lugar. Si el navegador no soporta
     showModal (o el JS falla) los enlaces siguen abriendo la imagen, que es
     un comportamiento aceptable. */
  var zoomLinks = document.querySelectorAll('.gallery__zoom');
  var box = document.querySelector('[data-lightbox]');

  if (box && zoomLinks.length && typeof box.showModal === 'function') {
    var boxImg = box.querySelector('[data-lightbox-img]');
    var boxCount = box.querySelector('[data-lightbox-count]');
    var actual = 0;

    var pintar = function (i) {
      actual = (i + zoomLinks.length) % zoomLinks.length;
      var enlace = zoomLinks[actual];
      var origen = enlace.querySelector('img');
      boxImg.src = enlace.getAttribute('href');
      boxImg.alt = origen ? origen.alt : '';
      boxCount.textContent = (actual + 1) + ' / ' + zoomLinks.length;
    };

    for (var z = 0; z < zoomLinks.length; z++) {
      (function (enlace, i) {
        enlace.addEventListener('click', function (e) {
          e.preventDefault();
          pintar(i);
          box.showModal();
          document.documentElement.classList.add('is-lightbox');
        });
      })(zoomLinks[z], z);
    }

    /* El cierre con Escape no pasa por nuestro botón: se escucha el evento
       close del propio dialog para devolver el desplazamiento en todos los
       casos. */
    box.addEventListener('close', function () {
      document.documentElement.classList.remove('is-lightbox');
    });

    box.querySelector('[data-lightbox-close]').addEventListener('click', function () { box.close(); });
    box.querySelector('[data-lightbox-prev]').addEventListener('click', function () { pintar(actual - 1); });
    box.querySelector('[data-lightbox-next]').addEventListener('click', function () { pintar(actual + 1); });

    /* Flechas del teclado mientras el visor está abierto. */
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { pintar(actual - 1); }
      else if (e.key === 'ArrowRight') { pintar(actual + 1); }
    });

    /* Clic fuera de la foto (sobre el fondo) cierra. */
    box.addEventListener('click', function (e) {
      if (e.target === box) { box.close(); }
    });
  }

  /* -------------------------------- copiar enlace ------------------------- */

  /* Sin esto el cuarto icono de «Share» sería un botón muerto. */
  var copy = document.querySelector('[data-copy]');
  if (copy && navigator.clipboard) {
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        copy.classList.add('is-done');
        window.setTimeout(function () { copy.classList.remove('is-done'); }, 1400);
      }).catch(function () { /* sin permiso de portapapeles: no se hace nada */ });
    });
  }
})();
