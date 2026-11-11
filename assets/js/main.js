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

  // Segundo nivel del menú. El subtítulo va en mayúsculas y los ítems en
  // Outfit 400; los que llevan `ficha` abren además el tercer nivel.
  var SUBMENUS = {
    'Mountain Bikes': {
      titulo: 'Mountain bikes',
      items: [
        { nombre: 'Spectral', ficha: 'spectral' },
        { nombre: 'Neuron', ficha: 'neuron' },
        { nombre: 'Lux Trail' },
        { nombre: 'Lux World Cup' },
        { nombre: 'Torque' }
      ]
    },
    'Brands': {
      titulo: 'Brands',
      items: [
        { nombre: 'Cycling' },
        { nombre: 'Evil' },
        { nombre: 'Lux Escape' },
        { nombre: 'The Radavist' },
        { nombre: 'Bike Travel' }
      ]
    }
  };

  // Tercer nivel: fichas de producto de Menu_spectral y Variante6. Los nombres
  // van como en Figma; la caja los pone en mayúsculas con text-transform.
  var FICHAS = {
    spectral: {
      imagen: 'assets/opt/menu-spectral.webp',
      video: 'assets/video/menu-spectral.mp4',
      nombre: 'Spectral',
      productos: [
        { nombre: 'Spectral CF', precio: 'From 2.999€', desc: 'Carbon frame, killer components' },
        { nombre: 'Spectral al', precio: 'From 2.999€', desc: 'Carbon frame, killer components' },
        { nombre: 'Spectral on', precio: 'From 2.999€', desc: 'Carbon frame, killer components' }
      ]
    },
    neuron: {
      imagen: 'assets/opt/menu-neuron.webp',
      nombre: 'Neuron',
      productos: [
        { nombre: 'Neuron oil', precio: 'From 2.999€', desc: 'Carbon frame, killer components' },
        { nombre: 'neuron above', precio: 'From 2.999€', desc: 'Carbon frame, killer components' },
        { nombre: 'neuron fx', precio: 'From 2.999€', desc: 'Carbon frame, killer components' }
      ]
    }
  };

  var header = document.querySelector('.site-header');
  var burger = document.querySelector('.nav__burger');
  var menu = document.getElementById('nav-menu');

  // Piezas del segundo y tercer nivel. Van fuera del bloque del menú para que
  // el buscador pueda cerrarlas al abrirse, igual que cierra el menú.
  var sub = document.querySelector('[data-sub]');
  var subTitulo = sub && sub.querySelector('.nav__sub-title');
  var subLista = sub && sub.querySelector('.nav__sub-list');
  var cards = sub && sub.querySelector('[data-cards]');
  var cardsImg = cards && cards.querySelector('[data-cards-img]');
  var cardsVideo = cards && cards.querySelector('[data-cards-video]');
  var cardsLabel = cards && cards.querySelector('[data-cards-label]');
  var cardsList = cards && cards.querySelector('[data-cards-list]');
  var enlaceActivo = null;

  // El vídeo de la ficha solo suena con el menú abierto y una ficha a la vista.
  var arrancarFicha = function () {
    if (!cardsVideo) { return; }
    var intento = cardsVideo.play();
    if (intento && typeof intento.catch === 'function') { intento.catch(function () {}); }
    // Al cambiar el src el archivo aún no está cargado; en cuanto haya datos
    // para reproducir se vuelve a intentar (el primer play() puede quedarse
    // esperando y el navegador no siempre lo reanuda solo).
    cardsVideo.addEventListener('canplay', function () {
      if (cardsVideo.paused) {
        var otro = cardsVideo.play();
        if (otro && typeof otro.catch === 'function') { otro.catch(function () {}); }
      }
    }, { once: true });
  };
  var pararFicha = function () {
    if (cardsVideo) { cardsVideo.pause(); }
  };

  var cerrarSub = function () {
    if (!sub) { return; }
    pararFicha();
    sub.removeAttribute('data-visible');
    if (cards) { cards.removeAttribute('data-visible'); }
    if (header) { header.classList.remove('is-sub-open'); }
    if (enlaceActivo) {
      enlaceActivo.classList.remove('is-active');
      enlaceActivo = null;
    }
  };

  var cerrarMenu = function () {
    if (!header) { return; }
    header.classList.remove('is-menu-open');
    if (burger) { burger.setAttribute('aria-expanded', 'false'); }
    cerrarSub();
  };

  // El menú va fijo: al bajar se marca para que gane sombra y se lea bien
  // sobre las secciones claras. Cuando el pie llega a la barra, la barra se
  // retira: así nunca se superpone al footer (ni la barra ni el desplegable).
  var recalcularPie = null;
  if (header) {
    var pie = document.querySelector('.site-footer');
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
      if (!pie) { return; }
      var alto = header.offsetHeight || 70;
      var llegada = pie.getBoundingClientRect().top <= alto;
      header.classList.toggle('is-pie', llegada);
      // Si llega el pie con el menú abierto, se cierra: no debe verse sobre el
      // footer.
      if (llegada && header.classList.contains('is-menu-open')) { cerrarMenu(); }
    };
    recalcularPie = onScroll;
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', onScroll);
  }

  if (burger && menu) {
    // El menú del diseño nuevo no lleva los enlaces en línea: a cualquier ancho
    // viven dentro del desplegable que abre el círculo, así que el botón hace
    // siempre lo mismo. Antes en escritorio se limitaba a ocultar y mostrar la
    // píldora central.
    burger.addEventListener('click', function () {
      // Se recalcula antes de abrir por si se llegó al pie sin mover el ratón.
      if (recalcularPie) { recalcularPie(); }
      // Sobre el footer el menú no se abre: la barra está retirada.
      if (header.classList.contains('is-pie')) { return; }
      var abierto = header.classList.toggle('is-menu-open');
      burger.setAttribute('aria-expanded', String(abierto));
      if (!abierto) { cerrarSub(); }
      // Al reabrir con una ficha ya cargada, el vídeo vuelve a arrancar.
      if (abierto && cards && cards.hasAttribute('data-visible')) { arrancarFicha(); }
    });

    // Al elegir un enlace, el menú desplegado se cierra solo.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') && header.classList.contains('is-menu-open')) {
        cerrarMenu();
      }
    });

    // Segundo nivel: se rellena al pasar por encima de un enlace que lo tenga.
    if (sub) {
      var renderCards = function (ficha) {
        var datos = FICHAS[ficha];
        if (!datos || !cards) { return; }
        if (cardsImg) { cardsImg.src = datos.imagen; }
        if (cardsLabel) { cardsLabel.textContent = datos.nombre; }
        if (cardsList) {
          cardsList.innerHTML = datos.productos.map(function (p, i) {
            return (i ? '<div class="nav__cards-sep"></div>' : '') +
              '<div class="nav__card">' +
                '<div class="nav__card-head">' +
                  '<span class="nav__card-name">' + p.nombre + '</span>' +
                  '<span class="nav__card-price">' + p.precio + '</span>' +
                '</div>' +
                '<p class="nav__card-desc">' + p.desc + '</p>' +
              '</div>';
          }).join('');
        }
        cards.setAttribute('data-ficha', ficha);
        cards.setAttribute('data-visible', '');

        // El vídeo se carga con la página; aquí solo se muestra u oculta y se
        // reproduce. No se toca el src: recargarlo con el menú abierto dejaba la
        // descarga a medias.
        if (cardsVideo) {
          if (datos.video) {
            cardsVideo.hidden = false;
            cardsVideo.poster = datos.imagen;
            arrancarFicha();
          } else {
            cardsVideo.hidden = true;
            cardsVideo.pause();
          }
        }
      };

      var conectarFichas = function () {
        if (!subLista) { return; }
        subLista.querySelectorAll('a').forEach(function (a) {
          var mostrar = function () {
            var ficha = a.getAttribute('data-ficha');
            if (ficha) { renderCards(ficha); }
            else if (cards) { cards.removeAttribute('data-visible'); }
          };
          a.addEventListener('mouseenter', mostrar);
          a.addEventListener('focus', mostrar);
        });
      };

      var abrirSub = function (enlace) {
        var datos = SUBMENUS[enlace.textContent.trim()];
        if (!datos) { cerrarSub(); return; }
        if (subTitulo) { subTitulo.textContent = datos.titulo; }
        if (subLista) {
          subLista.innerHTML = datos.items.map(function (item) {
            var ficha = item.ficha ? ' data-ficha="' + item.ficha + '"' : '';
            return '<li><a href="#"' + ficha + '>' + item.nombre + '</a></li>';
          }).join('');
          conectarFichas();
        }
        if (cards) { cards.removeAttribute('data-visible'); }
        sub.setAttribute('data-visible', '');
        header.classList.add('is-sub-open');
        if (enlaceActivo && enlaceActivo !== enlace) { enlaceActivo.classList.remove('is-active'); }
        enlaceActivo = enlace;
        enlace.classList.add('is-active');
      };

      menu.querySelectorAll('.nav__link').forEach(function (a) {
        a.addEventListener('mouseenter', function () { abrirSub(a); });
        a.addEventListener('focus', function () { abrirSub(a); });
      });

      // El segundo y el tercer nivel son descendientes de .nav, así que el
      // leave que vale es el de la barra entera: si se cuelga del menú de
      // 301 px, entrar en el segundo nivel ya lo cerraría.
      var nav = document.querySelector('.nav');
      if (nav) { nav.addEventListener('mouseleave', cerrarSub); }

      // Un enlace del submenú o de las fichas también cierra el menú.
      sub.addEventListener('click', function (e) {
        if (e.target.closest('a') && header.classList.contains('is-menu-open')) {
          cerrarMenu();
        }
      });
    }

    // Un clic fuera o la tecla Escape también lo cierran.
    document.addEventListener('click', function (e) {
      if (!header.classList.contains('is-menu-open')) { return; }
      if (e.target.closest('.nav__menu') || e.target.closest('.nav__sub') ||
          e.target.closest('.nav__burger')) { return; }
      cerrarMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-menu-open')) {
        cerrarMenu();
      }
    });
  }

  /* ----------------------------------------------------------- buscador -- */

  // Variante Mneu_search del mismo menú. Comparte barra con el desplegable, así
  // que los dos estados son excluyentes: abrir uno cierra el otro.
  var searchBtn = document.querySelector('[data-search-open]');
  var searchForm = document.querySelector('[data-search]');

  if (header && searchBtn && searchForm) {
    var searchInput = searchForm.querySelector('[data-search-input]');
    var searchClose = searchForm.querySelector('[data-search-close]');

    var cerrarBuscador = function () {
      if (!header.classList.contains('is-search-open')) { return; }
      header.classList.remove('is-search-open');
      searchBtn.setAttribute('aria-expanded', 'false');
    };

    var abrirBuscador = function () {
      // Cierra el menú (y sus dos niveles) si estaba abierto.
      cerrarMenu();
      header.classList.add('is-search-open');
      searchBtn.setAttribute('aria-expanded', 'true');
      // El campo acaba de pasar de display:none a flex; hasta el siguiente
      // fotograma el navegador no lo deja enfocar.
      if (searchInput) {
        window.requestAnimationFrame(function () { searchInput.focus(); });
      }
    };

    searchBtn.addEventListener('click', function () {
      if (header.classList.contains('is-search-open')) { cerrarBuscador(); }
      else { abrirBuscador(); }
    });

    if (searchClose) {
      searchClose.addEventListener('click', function () {
        cerrarBuscador();
        searchBtn.focus();
      });
    }

    // El menú desplegable y el buscador no pueden estar abiertos a la vez.
    if (burger) {
      burger.addEventListener('click', function () { cerrarBuscador(); });
    }

    // Las búsquedas populares del diseño rellenan el campo.
    searchForm.querySelectorAll('[data-search-term]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!searchInput) { return; }
        searchInput.value = btn.getAttribute('data-search-term');
        searchInput.focus();
      });
    });

    // Sin backend: enviar el formulario solo devuelve el foco al campo.
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (searchInput) { searchInput.focus(); }
    });

    // Un clic fuera de la cabecera lo cierra.
    document.addEventListener('click', function (e) {
      if (!header.classList.contains('is-search-open')) { return; }
      if (e.target.closest('.site-header')) { return; }
      cerrarBuscador();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-search-open')) {
        cerrarBuscador();
        searchBtn.focus();
      }
    });
  }

  /* -------------------------------------------------------------- vídeos -- */

  // La página tiene dos vídeos de fondo: el del hero y el de la sección de
  // marcas. El mismo tratamiento sirve para los dos.

  // El vídeo del menú se gestiona aparte (solo con el menú abierto), así que
  // aquí se cogen los de fondo de la página.
  var videos = Array.prototype.slice.call(document.querySelectorAll('video:not([data-cards-video])'));

  if (videos.length) {
    // Botón de socorro: si el navegador no deja arrancar solo el vídeo, queda
    // un botón visible para hacerlo con un clic.
    var botones = new WeakMap();

    function crearBoton(v) {
      var boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'video-play';
      boton.textContent = 'Reproducir vídeo';
      boton.hidden = true;
      boton.addEventListener('click', function () {
        reproducir(v);
        boton.hidden = true;
      });
      v.parentNode.insertBefore(boton, v.nextSibling);
      botones.set(v, boton);
    }

    function mostrarBoton(v) {
      var boton = botones.get(v);
      if (boton) { boton.hidden = false; }
    }

    function ocultarBoton(v) {
      var boton = botones.get(v);
      if (boton) { boton.hidden = true; }
    }

    function reproducir(v) {
      // Se fuerza por propiedad, no solo por atributo: algunos navegadores
      // ignoran el atributo y sin muted la política de autoplay lo rechaza.
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      var intento = v.play();
      // El navegador puede rechazar la reproducción; no es un fallo que deba
      // romper nada, porque el póster sigue viéndose y queda el botón.
      if (intento && typeof intento.catch === 'function') {
        intento.catch(function () { mostrarBoton(v); });
      }
    }

    // Quien pide menos movimiento no debería tener vídeos en bucle delante.
    var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

    videos.forEach(function (v) {
      crearBoton(v);

      v.addEventListener('playing', function () { ocultarBoton(v); });

      // Con archivos grandes el primer play() puede adelantarse a los datos;
      // en cuanto el navegador tiene suficiente para reproducir, se reintenta.
      v.addEventListener('canplay', function () {
        if (v.paused && !quieto.matches) { reproducir(v); }
      });

      // Si a los 1,6 s sigue parado, se ofrece el botón.
      setTimeout(function () {
        if (v.paused && !quieto.matches) { mostrarBoton(v); }
      }, 1600);
    });

    // Si el navegador bloqueó el autoplay, se reintenta al primer gesto. En
    // móvil el primer gesto suele ser touchstart, no pointerdown.
    var desbloquear = function () {
      videos.forEach(function (v) { if (v.paused) { reproducir(v); } });
      document.removeEventListener('pointerdown', desbloquear);
      document.removeEventListener('touchstart', desbloquear);
      document.removeEventListener('keydown', desbloquear);
    };
    document.addEventListener('pointerdown', desbloquear);
    document.addEventListener('touchstart', desbloquear, { passive: true });
    document.addEventListener('keydown', desbloquear);

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

  /* ------------------------------------------------------ arrastrar filas -- */

  /* La fila de noticias se arrastra con el ratón. El scroll nativo sigue
     funcionando con rueda, trackpad y teclado; aquí solo se añade el arrastre y
     se evita que un arrastre termine abriendo el enlace de una tarjeta. */
  var dragRows = document.querySelectorAll('[data-drag-scroll]');
  for (var j = 0; j < dragRows.length; j++) {
    (function (row) {
      var down = false;
      var startX = 0;
      var startLeft = 0;
      var moved = 0;

      // Que el ratón arrastre la fila y no la imagen: sin esto el navegador
      // inicia su propio arrastre de imagen y aparece la miniatura fantasma.
      row.addEventListener('dragstart', function (e) { e.preventDefault(); });

      row.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) { return; }
        // Los botones (flechas y miniaturas) no arrastran la fila: si se captura
        // el puntero, su clic se pierde y la galería deja de cambiar.
        if (e.target.closest('button')) { return; }
        down = true;
        startX = e.clientX;
        startLeft = row.scrollLeft;
        moved = 0;
        row.classList.add('is-dragging');
        if (row.setPointerCapture) { row.setPointerCapture(e.pointerId); }
      });

      row.addEventListener('pointermove', function (e) {
        if (!down) { return; }
        var dx = e.clientX - startX;
        if (Math.abs(dx) > moved) { moved = Math.abs(dx); }
        row.scrollLeft = startLeft - dx;
      });

      function endDrag(e) {
        if (!down) { return; }
        down = false;
        row.classList.remove('is-dragging');
        if (row.hasPointerCapture && row.hasPointerCapture(e.pointerId)) {
          row.releasePointerCapture(e.pointerId);
        }
      }

      row.addEventListener('pointerup', endDrag);
      row.addEventListener('pointercancel', endDrag);

      /* Un arrastre no debe abrir la tarjeta; un clic normal sí. */
      row.addEventListener('click', function (e) {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
          moved = 0;
        }
      }, true);
    })(dragRows[j]);
  }

  /* ------------------------------------- galería de la tarjeta de producto -- */

  // Cada tarjeta de «Most wanted» lleva cinco fotos. Las flechas pasan de una a
  // otra y las miniaturas (visibles al pasar el ratón) saltan a la que se pulse.
  var productGalleries = document.querySelectorAll('[data-prod-gallery]');
  for (var p = 0; p < productGalleries.length; p++) {
    (function (gallery) {
      var images = gallery.querySelectorAll('.prod__img');
      var thumbs = gallery.querySelectorAll('.prod__thumb');
      var index = 0;

      function show(i) {
        index = (i + images.length) % images.length;
        for (var n = 0; n < images.length; n++) {
          images[n].classList.toggle('is-active', n === index);
        }
        for (var t = 0; t < thumbs.length; t++) {
          thumbs[t].classList.toggle('is-active', t === index);
        }
      }

      for (var t = 0; t < thumbs.length; t++) {
        (function (thumb, position) {
          thumb.addEventListener('click', function () { show(position); });
        })(thumbs[t], t);
      }
    })(productGalleries[p]);
  }

  /* --------------------------------- «Most wanted»: arrastre y puntos -- */

  // La fila de productos se arrastra con el ratón (el mismo comportamiento que
  // «Las noticias») y los puntos marcan y llevan a cada tarjeta.
  var mostWanted = document.getElementById('products');
  if (mostWanted) {
    var scroller = mostWanted.querySelector('[data-drag-scroll]');
    var dotsList = mostWanted.querySelector('.dots');
    var productCards = mostWanted.querySelectorAll('.prod');

    if (scroller && dotsList && productCards.length) {
      var gap = 24;

      for (var i = 0; i < productCards.length; i++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Ir a la tarjeta ' + (i + 1));
        if (i === 0) { dot.setAttribute('aria-current', 'true'); }
        dotsList.appendChild(dot);
      }

      var dotButtons = dotsList.querySelectorAll('button');

      function paintDots() {
        var step = productCards[0].offsetWidth + gap;
        var index = Math.round(scroller.scrollLeft / step);
        if (index < 0) { index = 0; }
        if (index > dotButtons.length - 1) { index = dotButtons.length - 1; }
        for (var n = 0; n < dotButtons.length; n++) {
          if (n === index) { dotButtons[n].setAttribute('aria-current', 'true'); }
          else { dotButtons[n].removeAttribute('aria-current'); }
        }
      }

      for (var d = 0; d < dotButtons.length; d++) {
        (function (button, position) {
          button.addEventListener('click', function () {
            scroller.scrollTo({ left: position * (productCards[0].offsetWidth + gap), behavior: 'smooth' });
          });
        })(dotButtons[d], d);
      }

      scroller.addEventListener('scroll', paintDots, { passive: true });
    }
  }
})();
