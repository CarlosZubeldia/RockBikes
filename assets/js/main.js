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

  // Tres productos de ejemplo para el tercer nivel (misma estructura que Spectral).
  var tresProductos = function (base, desc) {
    desc = desc || 'Carbon frame, killer components';
    return [
      { nombre: base + ' CF', precio: 'From 2.999€', desc: desc },
      { nombre: base + ' AL', precio: 'From 2.999€', desc: desc },
      { nombre: base + ' ON', precio: 'From 2.999€', desc: desc }
    ];
  };

  // Segundo nivel del menú. El subtítulo va en mayúsculas y los ítems en
  // Outfit 400; los que llevan `ficha` abren además el tercer nivel.
  // `em: true` marca los destacados en cursiva (Find your bike, Trail starter kit).
  var SUBMENUS = {
    'Mountain Bikes': {
      titulo: 'Mountain bikes',
      items: [
        { nombre: 'XC', href: '#terrain', ficha: 'xc' },
        { nombre: 'Trail', href: '#terrain', ficha: 'trail' },
        { nombre: 'Enduro', href: '#terrain', ficha: 'enduro' },
        { nombre: 'Downhill', href: '#terrain', ficha: 'downhill' },
        { nombre: 'E-MTB', href: '#terrain', ficha: 'emtb' },
        { nombre: 'Find your bike', href: '#products', em: true, ficha: 'find-bike' },
        { nombre: 'All mountain bikes', href: '#products', ficha: 'all-mtb' }
      ]
    },
    'Accessories': {
      titulo: 'Accessories',
      items: [
        { nombre: 'Protection', href: '#riders', ficha: 'protection' },
        { nombre: 'Tools & repair', href: '#riders', ficha: 'tools' },
        { nombre: 'Hydration', href: '#riders', ficha: 'hydration' },
        { nombre: 'Helmets', href: '#riders', ficha: 'helmets' },
        { nombre: 'Gloves & eyewear', href: '#riders', ficha: 'gloves' },
        { nombre: 'Lights & GPS', href: '#riders', ficha: 'lights' },
        { nombre: 'Shoes & pedals', href: '#riders', ficha: 'shoes' },
        { nombre: 'Trail starter kit', href: '#riders', em: true, ficha: 'starter' }
      ]
    },
    'Parts': {
      titulo: 'Parts',
      items: [
        { nombre: 'Wheels & tyres', ficha: 'wheels' },
        { nombre: 'Suspension', ficha: 'suspension' },
        { nombre: 'Drivetrain', ficha: 'drivetrain' },
        { nombre: 'Brakes', ficha: 'brakes' },
        { nombre: 'Cockpit', ficha: 'cockpit' },
        { nombre: 'Saddles & seatposts', ficha: 'saddles' }
      ]
    },
    'Clothing': {
      titulo: 'Clothing',
      items: [
        { nombre: 'Jerseys', href: '#riders', ficha: 'jerseys' },
        { nombre: 'Shorts', href: '#riders', ficha: 'shorts' },
        { nombre: 'Jackets', href: '#riders', ficha: 'jackets' },
        { nombre: 'Base layers & socks', href: '#riders', ficha: 'baselayers' }
      ]
    },
    'Other bikes': {
      titulo: 'Other bikes',
      items: [
        { nombre: 'Road', href: '#products', ficha: 'road' },
        { nombre: 'Gravel', href: '#products', ficha: 'gravel' },
        { nombre: 'City & touring', href: '#products', ficha: 'city' }
      ]
    },
    'Brands': {
      titulo: 'Brands',
      items: [
        { nombre: 'Cycling', href: '#brands', ficha: 'brand-cycling' },
        { nombre: 'Evil', href: '#brands', ficha: 'brand-evil' },
        { nombre: 'Lux Escape', href: '#brands', ficha: 'brand-escape' },
        { nombre: 'The Radavist', href: '#brands', ficha: 'brand-radavist' },
        { nombre: 'Bike Travel', href: '#brands', ficha: 'brand-travel' }
      ]
    }
  };

  // Tercer nivel: foto + lista de productos. Spectral mantiene el vídeo del diseño.
  var FICHAS = {
    xc: { imagen: 'assets/opt/news-bikepacking.webp', nombre: 'XC', productos: tresProductos('Lux XC') },
    trail: { imagen: 'assets/opt/news-trail-guides.webp', nombre: 'Trail', productos: tresProductos('Lux Trail') },
    enduro: { imagen: 'assets/opt/news-riding-skills.webp', nombre: 'Enduro', productos: tresProductos('Spectral') },
    downhill: { imagen: 'assets/opt/news-epic-rides.webp', nombre: 'Downhill', productos: tresProductos('Torque') },
    emtb: { imagen: 'assets/opt/frame-1410106428-b17ff0.webp', nombre: 'E-MTB', productos: tresProductos('Spectral ON') },
    'find-bike': { imagen: 'assets/opt/menu-spectral.webp', video: 'assets/video/menu-spectral.mp4', nombre: 'Find your bike', productos: tresProductos('Spectral') },
    'all-mtb': { imagen: 'assets/opt/menu-neuron.webp', nombre: 'Mountain bikes', productos: tresProductos('Neuron') },

    protection: { imagen: 'assets/opt/acc-protection.webp', nombre: 'Protection', productos: tresProductos('Guard', 'Trail and enduro protection') },
    tools: { imagen: 'assets/opt/acc-tools.webp', nombre: 'Tools & repair', productos: tresProductos('Multi', 'Workshop-ready kit') },
    hydration: { imagen: 'assets/opt/acc-hydration.webp', nombre: 'Hydration', productos: tresProductos('Hydro', 'With 2 L reservoir') },
    helmets: { imagen: 'assets/opt/acc-helmets.webp', nombre: 'Helmets', productos: tresProductos('Trail helmet', 'Open-face, MIPS') },
    gloves: { imagen: 'assets/opt/acc-gloves.webp', nombre: 'Gloves & eyewear', productos: tresProductos('Trail glove', 'Full finger, extra grip') },
    lights: { imagen: 'assets/opt/acc-lights.webp', nombre: 'Lights & GPS', productos: tresProductos('Beam', 'Rechargeable, USB-C') },
    shoes: { imagen: 'assets/opt/acc-shoes.webp', nombre: 'Shoes & pedals', productos: tresProductos('Flat', 'Sticky sole, all-day comfort') },
    starter: { imagen: 'assets/opt/acc-best-brands.webp', nombre: 'Trail starter kit', productos: tresProductos('Starter', 'Everything for your first trails') },

    wheels: { imagen: 'assets/opt/cat-wheels.webp', nombre: 'Wheels & tyres', productos: tresProductos('Wheelset', 'Tubeless-ready trail wheels') },
    suspension: { imagen: 'assets/opt/ficha-detalle-plataforma.webp', nombre: 'Suspension', productos: tresProductos('Fork', 'Plush travel, dialled damping') },
    drivetrain: { imagen: 'assets/opt/ficha-detalle-pantalla.webp', nombre: 'Drivetrain', productos: tresProductos('Groupset', 'Crisp shifts, long life') },
    brakes: { imagen: 'assets/opt/ficha-detalle-frenos.webp', nombre: 'Brakes', productos: tresProductos('Stop', 'Four-piston control') },
    cockpit: { imagen: 'assets/opt/ficha-detalle-compacto.webp', nombre: 'Cockpit', productos: tresProductos('Bar', 'Trail-tuned control') },
    saddles: { imagen: 'assets/opt/ficha-detalle-ruedas.webp', nombre: 'Saddles & seatposts', productos: tresProductos('Dropper', 'On-the-fly adjust') },

    jerseys: { imagen: 'assets/opt/acc-clothing.webp', nombre: 'Jerseys', productos: tresProductos('Jersey', 'Breathable trail fit') },
    shorts: { imagen: 'assets/opt/finder-other.webp', nombre: 'Shorts', productos: tresProductos('Short', 'Stretch, pocket space') },
    jackets: { imagen: 'assets/opt/blog-summit.webp', nombre: 'Jackets', productos: tresProductos('Shell', 'Light weather protection') },
    baselayers: { imagen: 'assets/opt/blog-sunrise.webp', nombre: 'Base layers', productos: tresProductos('Layer', 'Moisture-wicking comfort') },

    road: { imagen: 'assets/opt/prod-indiana.webp', nombre: 'Road', productos: tresProductos('Aero', 'Race-day efficiency') },
    gravel: { imagen: 'assets/opt/prod-escape.webp', nombre: 'Gravel', productos: tresProductos('Grail', 'Go further off the tarmac') },
    city: { imagen: 'assets/opt/prod-evil.webp', nombre: 'City & touring', productos: tresProductos('Commute', 'Comfort for every day') },

    'brand-cycling': { imagen: 'assets/opt/prod-spectral.webp', nombre: 'Cycling', productos: tresProductos('Spectral') },
    'brand-evil': { imagen: 'assets/opt/prod-evil.webp', nombre: 'Evil', productos: tresProductos('Following') },
    'brand-escape': { imagen: 'assets/opt/prod-escape.webp', nombre: 'Lux Escape', productos: tresProductos('Escape') },
    'brand-radavist': { imagen: 'assets/opt/blog-bikepacking.webp', nombre: 'The Radavist', productos: tresProductos('Edition') },
    'brand-travel': { imagen: 'assets/opt/blog-jump.webp', nombre: 'Bike Travel', productos: tresProductos('Tour') }
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

    // ¿Menú en modo compacto (desplegable, ≤1180)? Ahí el 2.º nivel va a pantalla.
    var menuCompacto = function () {
      return window.matchMedia('(max-width: 1180px)').matches;
    };

    // Al elegir un enlace sin submenú, el desplegable se cierra.
    // Si tiene submenú en móvil/tableta, se abre el segundo nivel en su lugar.
    menu.addEventListener('click', function (e) {
      var enlace = e.target.closest('a.nav__link');
      if (!enlace || !header.classList.contains('is-menu-open')) { return; }
      var clave = enlace.childNodes[0] && enlace.childNodes[0].textContent
        ? enlace.childNodes[0].textContent.trim()
        : enlace.textContent.trim();
      if (menuCompacto() && SUBMENUS[clave]) {
        e.preventDefault();
        abrirSub(enlace);
        return;
      }
      cerrarMenu();
    });

    // Segundo nivel: se rellena al pasar por encima de un enlace que lo tenga.
    if (sub) {
      // Botón «volver» para móvil/tableta (el CSS lo oculta en escritorio).
      if (!sub.querySelector('[data-sub-back]')) {
        var btnVolver = document.createElement('button');
        btnVolver.type = 'button';
        btnVolver.className = 'nav__sub-back';
        btnVolver.setAttribute('data-sub-back', '');
        btnVolver.setAttribute('aria-label', 'Back to main menu');
        btnVolver.textContent = '← Menu';
        sub.insertBefore(btnVolver, sub.firstChild);
        btnVolver.addEventListener('click', function (e) {
          e.preventDefault();
          cerrarSub();
        });
      }
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

      var marcarSubActiva = function (enlaceSub) {
        if (!subLista) { return; }
        subLista.querySelectorAll('a').forEach(function (a) {
          a.classList.toggle('is-hot', a === enlaceSub);
        });
      };

      var conectarFichas = function () {
        if (!subLista) { return; }
        subLista.querySelectorAll('a').forEach(function (a) {
          var mostrar = function () {
            var ficha = a.getAttribute('data-ficha');
            if (ficha) {
              marcarSubActiva(a);
              renderCards(ficha);
            } else if (cards) {
              marcarSubActiva(null);
              cards.removeAttribute('data-visible');
            }
          };
          a.addEventListener('mouseenter', mostrar);
          a.addEventListener('focus', mostrar);
        });
      };

      var abrirSub = function (enlace) {
        var clave = enlace.childNodes[0] && enlace.childNodes[0].textContent
          ? enlace.childNodes[0].textContent.trim()
          : enlace.textContent.trim();
        var datos = SUBMENUS[clave];
        if (!datos) { cerrarSub(); return; }
        if (subTitulo) { subTitulo.textContent = datos.titulo; }
        if (subLista) {
          // En la ficha, los anclas del home necesitan el prefijo index.html.
          var prefijo = /ficha-producto\.html/i.test(location.pathname)
            ? 'index.html'
            : '';
          subLista.innerHTML = datos.items.map(function (item) {
            var ficha = item.ficha ? ' data-ficha="' + item.ficha + '"' : '';
            var href = item.href || '#';
            if (prefijo && href.charAt(0) === '#') { href = prefijo + href; }
            var etiqueta = item.em
              ? '<em>' + item.nombre + '</em>'
              : item.nombre;
            return '<li><a href="' + href + '"' + ficha + '>' + etiqueta + '</a></li>';
          }).join('');
          conectarFichas();
        }
        // Al abrir una categoría, se muestra ya la ficha de la primera subcategoría.
        var primeraConFicha = null;
        for (var i = 0; i < datos.items.length; i++) {
          if (datos.items[i].ficha) { primeraConFicha = datos.items[i]; break; }
        }
        if (primeraConFicha && cards) {
          var primerEnlace = subLista && subLista.querySelector('[data-ficha="' + primeraConFicha.ficha + '"]');
          marcarSubActiva(primerEnlace);
          renderCards(primeraConFicha.ficha);
        } else if (cards) {
          cards.removeAttribute('data-visible');
        }
        sub.setAttribute('data-visible', '');
        header.classList.add('is-sub-open');
        if (enlaceActivo && enlaceActivo !== enlace) { enlaceActivo.classList.remove('is-active'); }
        enlaceActivo = enlace;
        enlace.classList.add('is-active');
      };

      menu.querySelectorAll('.nav__link').forEach(function (a) {
        a.addEventListener('mouseenter', function () {
          if (!menuCompacto()) { abrirSub(a); }
        });
        a.addEventListener('focus', function () {
          if (!menuCompacto()) { abrirSub(a); }
        });
      });

      // El segundo y el tercer nivel son descendientes de .nav, así que el
      // leave que vale es el de la barra entera: si se cuelga del menú de
      // 301 px, entrar en el segundo nivel ya lo cerraría.
      // En compacto no se cierra al salir: el usuario usa «← Menu» o Escape.
      var nav = document.querySelector('.nav');
      if (nav) {
        nav.addEventListener('mouseleave', function () {
          if (!menuCompacto()) { cerrarSub(); }
        });
      }

      // Un enlace del submenú o de las fichas también cierra el menú.
      sub.addEventListener('click', function (e) {
        if (e.target.closest('[data-sub-back]')) { return; }
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

  /* ----------------------------------- accesorios para riders -- */

  /* Escritorio: scroll largo + pista vertical. Móvil (≤900): un solo
     carrusel de cards (la lista de categorías se oculta en CSS). */
  var riders = document.querySelector('[data-riders]');

  if (riders) {
    var rSlides = [].slice.call(riders.querySelectorAll('.riders__slide'));
    var rCats = [].slice.call(riders.querySelectorAll('.riders__cat'));
    var rDots = [].slice.call(riders.querySelectorAll('.riders__dots span'));
    var rTrack = riders.querySelector('[data-riders-track]');
    var rStage = riders.querySelector('.riders__stage');
    var rMovil = window.matchMedia('(max-width: 900px)');
    var rReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var rTotal = rSlides.length;
    var rActiva = -1;

    var esRidersMovil = function () {
      return rMovil.matches;
    };

    var rScrollSuave = function () {
      return rReduce.matches ? 'auto' : 'smooth';
    };

    var indiceMasCercano = function (scroller, items) {
      if (!scroller || !items.length) { return 0; }
      var origen = scroller.scrollLeft;
      var mejor = 0;
      var mejorDist = Infinity;
      for (var i = 0; i < items.length; i++) {
        var dist = Math.abs(items[i].offsetLeft - origen);
        if (dist < mejorDist) {
          mejorDist = dist;
          mejor = i;
        }
      }
      return mejor;
    };

    var pintarRiders = function (indice, opts) {
      opts = opts || {};
      if (indice < 0 || indice >= rTotal) { return; }
      if (indice === rActiva) { return; }
      rActiva = indice;

      if (esRidersMovil()) {
        rTrack.style.transform = '';
        if (!opts.desdeFotos && rStage && rSlides[indice]) {
          rStage.scrollTo({
            left: rSlides[indice].offsetLeft,
            behavior: rScrollSuave()
          });
        }
      } else {
        rTrack.style.transform = 'translateY(-' + (indice * 100) + '%)';
      }

      rSlides.forEach(function (slide, i) {
        var activa = i === indice;
        slide.setAttribute('aria-hidden', activa ? 'false' : 'true');
        slide.classList.toggle('is-active', activa);
        var cta = slide.querySelector('.riders__cta');
        if (cta) { cta.setAttribute('tabindex', activa ? '0' : '-1'); }
      });

      rCats.forEach(function (texto, i) {
        var activa = i === indice;
        texto.classList.toggle('is-active', activa);
        if (activa) { texto.setAttribute('aria-current', 'true'); }
        else { texto.removeAttribute('aria-current'); }
      });

      rDots.forEach(function (punto, i) {
        punto.classList.toggle('is-active', i === indice);
      });
    };

    var scrollRiders = function () {
      if (esRidersMovil()) { return; }
      var caja = riders.getBoundingClientRect();
      var recorrido = caja.height - window.innerHeight;

      if (recorrido <= 0) { pintarRiders(0); return; }

      var progreso = Math.min(Math.max(-caja.top / recorrido, 0), 0.9999);
      pintarRiders(Math.floor(progreso * rTotal));
    };

    var alScrollStage = function () {
      if (!esRidersMovil() || !rStage || !rSlides[0]) { return; }
      pintarRiders(indiceMasCercano(rStage, rSlides), { desdeFotos: true });
    };

    if (rStage) {
      rStage.addEventListener('scroll', alScrollStage, { passive: true });
    }

    rCats.forEach(function (texto, i) {
      texto.setAttribute('role', 'button');
      texto.setAttribute('tabindex', '0');
      var irACategoria = function () {
        if (esRidersMovil()) {
          pintarRiders(i);
          return;
        }
        var caja = riders.getBoundingClientRect();
        var recorrido = riders.offsetHeight - window.innerHeight;
        if (recorrido <= 0) { return; }
        var destino = window.scrollY + caja.top + ((i + 0.01) / rTotal) * recorrido;
        window.scrollTo({ top: destino, behavior: rScrollSuave() });
      };
      texto.addEventListener('click', irACategoria);
      texto.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          irACategoria();
        }
      });
    });

    var alCambiarModo = function () {
      rActiva = -1;
      if (esRidersMovil()) {
        rTrack.style.transform = '';
        if (rStage) { rStage.scrollLeft = 0; }
        pintarRiders(0, { desdeFotos: true });
      } else {
        if (rStage) { rStage.scrollLeft = 0; }
        scrollRiders();
      }
    };

    if (rMovil.addEventListener) {
      rMovil.addEventListener('change', alCambiarModo);
    } else if (rMovil.addListener) {
      rMovil.addListener(alCambiarModo);
    }

    window.addEventListener('scroll', scrollRiders, { passive: true });
    window.addEventListener('resize', function () {
      if (esRidersMovil()) { alScrollStage(); }
      else { scrollRiders(); }
    });

    if (esRidersMovil()) {
      pintarRiders(0, { desdeFotos: true });
    } else {
      scrollRiders();
    }
  }

  /* ------------------------------------------------ elige tu terreno -- */
  /* Cinco paneles; el que tiene el ratón o el foco se ensancha. El ancho lo
     lleva el CSS (`.is-active`), aquí solo se mueve la clase. Trail activo de
     salida, como en el componente original. En móvil el CSS deja todas en
     «hover» y los puntos marcan el carrusel (sin flechas). */
  var terrain = document.querySelector('[data-terrain]');
  var terrainPanels = document.querySelector('.terrain__panels');
  var terrainDots = document.querySelector('[data-terrain-dots]');

  if (terrain) {
    var terrainItems = [].slice.call(terrain.querySelectorAll('.terrain__item'));
    var terrainLinks = terrain.querySelectorAll('[data-terrain-panel]');

    var terreno = function (activo) {
      for (var t = 0; t < terrainItems.length; t++) {
        terrainItems[t].classList.toggle('is-active', terrainItems[t] === activo);
      }
    };

    for (var p = 0; p < terrainLinks.length; p++) {
      (function (enlace) {
        var item = enlace.parentNode;
        enlace.addEventListener('mouseenter', function () { terreno(item); });
        enlace.addEventListener('focus', function () { terreno(item); });
        /* En pantalla táctil no hay ratón: el primer toque abre el panel y el
           segundo ya sigue el enlace. En el carrusel móvil todas van abiertas,
           así que el toque sigue el enlace. */
        enlace.addEventListener('click', function (e) {
          var movil = window.matchMedia('(max-width: 980px)').matches;
          if (!movil && !item.classList.contains('is-active')) {
            e.preventDefault();
            terreno(item);
          }
        });
      })(terrainLinks[p]);
    }

    terreno(terrainItems[1] || terrainItems[0]);

    if (terrainPanels && terrainDots && terrainItems.length) {
      var tGap = 12;

      for (var ti = 0; ti < terrainItems.length; ti++) {
        var tDot = document.createElement('button');
        tDot.type = 'button';
        tDot.setAttribute('aria-label', 'Ir a la disciplina ' + (ti + 1));
        if (ti === 0) { tDot.setAttribute('aria-current', 'true'); }
        terrainDots.appendChild(tDot);
      }

      var tDotButtons = terrainDots.querySelectorAll('button');

      function paintTerrainDots() {
        var step = terrainItems[0].offsetWidth + tGap;
        if (!step) { return; }
        var index = Math.round(terrainPanels.scrollLeft / step);
        if (index < 0) { index = 0; }
        if (index > tDotButtons.length - 1) { index = tDotButtons.length - 1; }
        for (var n = 0; n < tDotButtons.length; n++) {
          if (n === index) { tDotButtons[n].setAttribute('aria-current', 'true'); }
          else { tDotButtons[n].removeAttribute('aria-current'); }
        }
      }

      for (var td = 0; td < tDotButtons.length; td++) {
        (function (button, position) {
          button.addEventListener('click', function () {
            var step = terrainItems[0].offsetWidth + tGap;
            terrainPanels.scrollTo({ left: position * step, behavior: 'smooth' });
          });
        })(tDotButtons[td], td);
      }

      terrainPanels.addEventListener('scroll', paintTerrainDots, { passive: true });
    }
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

      /* El arrastre NO captura el puntero. Con setPointerCapture, el
         pointerup lo recibía la fila y el navegador lanzaba el clic sobre
         ella, no sobre la tarjeta: los enlaces de dentro no navegaban nunca.
         Escuchando en window, el clic vuelve a su destino (la tarjeta). */
      function onMove(e) {
        if (!down) { return; }
        var dx = e.clientX - startX;
        if (Math.abs(dx) > moved) { moved = Math.abs(dx); }
        row.scrollLeft = startLeft - dx;
      }

      function endDrag() {
        if (!down) { return; }
        down = false;
        row.classList.remove('is-dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
      }

      row.addEventListener('pointerdown', function (e) {
        /* Ratón: arrastre propio. Dedo/lápiz: scroll nativo (horizontal en el
           carrusel, vertical en la página); no interceptamos el puntero. */
        if (e.pointerType !== 'mouse' || e.button !== 0) { return; }
        // Los botones (flechas y miniaturas) no arrastran la fila.
        if (e.target.closest('button')) { return; }
        down = true;
        startX = e.clientX;
        startLeft = row.scrollLeft;
        moved = 0;
        row.classList.add('is-dragging');
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
      });

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
