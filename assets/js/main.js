/* ==========================================================================
   ROCK BIKES — comportamiento de la página
   Dos cosas: el menú en pantallas pequeñas y un carrusel reutilizable.

   El carrusel funciona con atributos en el HTML, así que sirve para los cuatro
   sitios donde hace falta (tarjeta del hero, productos, reseñas y noticias)
   sin escribir lógica nueva para cada uno:

     <div data-carousel>
       <div data-carousel-track> ...diapositivas... </div>
       <button data-carousel-prev>  <button data-carousel-next>
       <ol data-carousel-dots></ol>
     </div>

   Con data-carousel-mode="fade" cambia de diapositiva con un fundido en vez de
   desplazar la fila (es lo que necesita la tarjeta del hero).
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------- menú -- */

  var header = document.querySelector('.site-header');
  var burger = document.querySelector('.nav__burger');
  var menu = document.getElementById('nav-menu');

  // El menú va fijo: al bajar se marca para que gane sombra y se lea bien
  // sobre las secciones claras.
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (burger && menu) {
    // El mismo botón hace dos cosas según el ancho: en escritorio las tres
    // píldoras están siempre visibles y el botón las oculta; en pantallas
    // pequeñas el menú no cabe y el botón lo despliega.
    var esEscritorio = function () {
      return window.matchMedia('(min-width: 1181px)').matches;
    };

    burger.addEventListener('click', function () {
      if (esEscritorio()) {
        var oculto = menu.classList.toggle('is-collapsed');
        burger.setAttribute('aria-expanded', String(!oculto));
      } else {
        var abierto = menu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(abierto));
      }
    });

    // Al elegir un enlace, el menú desplegado se cierra solo.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    // Los estados de una disposición no valen para la otra.
    window.addEventListener('resize', function () {
      menu.classList.remove('is-open', 'is-collapsed');
      burger.setAttribute('aria-expanded', 'false');
    });
  }

  /* -------------------------------------------------------------- vídeos -- */

  // La página tiene dos vídeos de fondo: el del hero y el de la sección de
  // marcas. El mismo tratamiento sirve para los dos.

  var videos = Array.prototype.slice.call(document.querySelectorAll('video'));

  if (videos.length) {
    var reproducir = function (v) {
      var intento = v.play();
      // El navegador puede rechazar la reproducción; no es un fallo que deba
      // romper nada, porque el póster sigue viéndose.
      if (intento && typeof intento.catch === 'function') {
        intento.catch(function () {});
      }
    };

    // Si el navegador bloqueó el autoplay, se reintenta al primer toque.
    var desbloquear = function () {
      videos.forEach(function (v) { if (v.paused) { reproducir(v); } });
      document.removeEventListener('pointerdown', desbloquear);
    };
    document.addEventListener('pointerdown', desbloquear);

    // Quien pide menos movimiento no debería tener vídeos en bucle delante.
    var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    var aplicarPreferencia = function () {
      videos.forEach(function (v) {
        if (quieto.matches) { v.pause(); } else { reproducir(v); }
      });
    };
    aplicarPreferencia();
    if (quieto.addEventListener) { quieto.addEventListener('change', aplicarPreferencia); }
  }

  /* ----------------------------------------------------------- carrusel -- */

  function Carousel(root) {
    this.root = root;
    this.track = root.querySelector('[data-carousel-track]');
    if (!this.track) return;

    this.slides = Array.prototype.slice.call(this.track.children);
    if (!this.slides.length) return;

    this.viewport = root.querySelector('.carousel__viewport') || this.track.parentElement;
    this.prevBtn = root.querySelector('[data-carousel-prev]');
    this.nextBtn = root.querySelector('[data-carousel-next]');
    this.dotsBox = root.querySelector('[data-carousel-dots]');
    this.fade = root.getAttribute('data-carousel-mode') === 'fade';

    this.index = 0;
    this.pages = 1;
    this.dots = [];

    this.measure();
    this.buildDots();
    this.bind();
    this.render();

    var self = this;
    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { self.refresh(); }, 150);
    });
  }

  /* Cuántas diapositivas caben enteras y cuántas posiciones hay. */
  Carousel.prototype.measure = function () {
    if (this.fade) {
      this.perView = 1;
      this.pages = this.slides.length;
      return;
    }

    var style = window.getComputedStyle(this.track);
    var gap = parseFloat(style.columnGap || style.gap) || 0;
    var slideWidth = this.slides[0].getBoundingClientRect().width;
    var viewWidth = this.viewport.getBoundingClientRect().width;
    if (!slideWidth) return;

    this.gap = gap;
    this.pageWidth = slideWidth + gap;
    this.perView = Math.max(1, Math.floor((viewWidth + gap) / this.pageWidth));
    this.pages = Math.max(1, this.slides.length - this.perView + 1);
    this.track.style.transform = 'translate3d(0,0,0)';
  };

  /* Un punto por posición posible. */
  Carousel.prototype.buildDots = function () {
    if (!this.dotsBox) return;

    if (this.dotsBox.children.length === this.pages) return;

    this.dotsBox.innerHTML = '';
    this.dots = [];

    for (var i = 0; i < this.pages; i++) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      btn.dataset.index = String(i);
      li.appendChild(btn);
      this.dotsBox.appendChild(li);
      this.dots.push(btn);
    }

    if (!this.dotsHandler) {
      var self = this;
      this.dotsHandler = function (e) {
        var btn = e.target.closest('button[data-index]');
        if (btn) self.go(parseInt(btn.dataset.index, 10));
      };
      this.dotsBox.addEventListener('click', this.dotsHandler);
    }
  };

  Carousel.prototype.bind = function () {
    var self = this;

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', function () { self.step(-1); });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', function () { self.step(1); });
    }

    // Teclado: útil cuando el foco está en los botones.
    this.root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { self.step(-1); }
      else if (e.key === 'ArrowRight') { self.step(1); }
    });

    // Gesto táctil.
    var startX = null;
    this.viewport.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.viewport.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 40) { self.step(delta < 0 ? 1 : -1); }
      startX = null;
    });
  };

  /* Avanza o retrocede, dando la vuelta en los extremos. */
  Carousel.prototype.step = function (delta) {
    var next = this.index + delta;
    if (next < 0) { next = this.pages - 1; }
    if (next > this.pages - 1) { next = 0; }
    this.go(next);
  };

  Carousel.prototype.go = function (index) {
    this.index = Math.max(0, Math.min(index, this.pages - 1));
    this.render();
  };

  Carousel.prototype.refresh = function () {
    var before = this.pages;
    var index = this.index;
    this.measure();
    this.buildDots();
    this.go(Math.min(index, this.pages - 1));
    if (before !== this.pages) { this.render(); }
  };

  Carousel.prototype.render = function () {
    if (this.fade) {
      for (var i = 0; i < this.slides.length; i++) {
        this.slides[i].classList.toggle('is-active', i === this.index);
      }
    } else if (this.pageWidth) {
      this.track.style.transform = 'translate3d(' + (-this.index * this.pageWidth) + 'px,0,0)';
    }

    for (var d = 0; d < this.dots.length; d++) {
      this.dots[d].setAttribute('aria-current', String(d === this.index));
    }

    if (this.prevBtn) { this.prevBtn.disabled = false; }
    if (this.nextBtn) { this.nextBtn.disabled = false; }
  };

  /* ------------------------------------------------------------- arranque -- */

  var roots = document.querySelectorAll('[data-carousel]');
  for (var i = 0; i < roots.length; i++) {
    new Carousel(roots[i]);
  }
})();
