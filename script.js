/* ============================================================
   SCRIPT.JS — Libro Virtual Interactivo para May
   Arquitectura: módulos IIFE, sin frameworks externos.
   Emil design-eng: sin "all" en transitions, ease-out preferido,
   feedback en pointerdown, animaciones interruptibles.
   ============================================================ */
'use strict';

// ════════════════════════════════════════════
// ESTADO GLOBAL
// ════════════════════════════════════════════
const STATE = {
  // Fase 1
  codigoIntroducido: '',
  clicsRealizados: 0,
  fase: 'code',       // 'code' | 'card' | 'book'

  // Libro
  bookOpen: false,
  bookShowingBack: false, // true = mostrando contraportada
  vistaActual: 0,         // índice de vista actual (0 = portada cerrada / cubierta)
  flipping: false,        // animación de volteo en curso (evita doble-clic)

  // Reproductor
  songIdx: 0,
  playing: false,
  playerOpen: false,

  // Swipe/drag
  dragStartX: null,
  dragging: false,
};

// Vista = par de páginas que se muestran a la vez.
// Se calculan dinámicamente desde CONFIG.paginas.
// Las vistas se construyen en buildVistas().
let VISTAS = [];  // Array de { left: PageDescriptor, right: PageDescriptor }
// PageDescriptor: { type: 'portada_interior'|'pagina'|'contraportada_interior'|'contraportada', idx?, frase? }

// ════════════════════════════════════════════
// DOM REFS
// ════════════════════════════════════════════
const $ = id => document.getElementById(id);
let dom = {};

function cacheDom() {
  dom = {
    // Globales
    toast:           $('toast'),
    confettiCont:    $('confettiCont'),
    heartsLayer:     $('heartsLayer'),
    glowCanvas:      $('glowCanvas'),
    // Entrada
    entryScreen:     $('entryScreen'),
    stepCode:        $('stepCode'),
    stepCard:        $('stepCard'),
    entryTitle:      $('entryTitle'),
    entrySubtitle:   $('entrySubtitle'),
    codeDots:        Array.from(document.querySelectorAll('.code-dot')),
    codeFeedback:    $('codeFeedback'),
    numpad:          $('numpad'),
    confirmCodeBtn:  $('confirmCodeBtn'),
    clearBtn:        $('clearBtn'),
    // Carta
    cartaCard:       $('cartaCard'),
    cartaTitulo:     $('cartaTitulo'),
    cartaSubtitulo:  $('cartaSubtitulo'),
    cartaRingFg:     $('cartaRingFg'),
    cartaClickCount: $('cartaClickCount'),
    cartaClickTotal: $('cartaClickTotal'),
    cartaHitoMsg:    $('cartaHitoMsg'),
    cartaClosedContent: $('cartaClosedContent'),
    cartaOpenContent:   $('cartaOpenContent'),
    cartaOpenMensaje:   $('cartaOpenMensaje'),
    cartaBtnSi:      $('cartaBtnSi'),
    cartaBtnNo:      $('cartaBtnNo'),
    // Libro
    bookScreen:      $('bookScreen'),
    bookStage:       $('bookStage'),
    book:            $('book'),
    bookSpine:       $('bookSpine'),
    bookShadow:      $('bookShadow'),
    pageLeft:        $('pageLeft'),
    pageLeftContent: $('pageLeftContent'),
    pageLeftBack:    $('pageLeftBack'),
    pageRight:       $('pageRight'),
    pageRightInner:  $('pageRightInner'),
    pageRightContent:$('pageRightContent'),
    pageRightBack:   $('pageRightBack'),
    coverFront:      $('coverFront'),
    coverFrontImg:   $('coverFrontImg'),
    coverBack:       $('coverBack'),
    coverBackImg:    $('coverBackImg'),
    coverTitle:      $('coverTitle'),
    coverSubtitle:   $('coverSubtitle'),
    coverOpenHint:   $('coverOpenHint'),
    coverBackText:   $('coverBackText'),
    coverBackSub:    $('coverBackSub'),
    // Nav
    btnPrev:         $('btnPrev'),
    btnNext:         $('btnNext'),
    navLabel:        $('navLabel'),
    navProgressFill: $('navProgressFill'),
    btnClose:        $('btnClose'),
    btnRestore:      $('btnRestore'),
    // Reproductor
    playerWrap:      $('playerWrap'),
    playerToggle:    $('playerToggle'),
    playerPanel:     $('playerPanel'),
    playerDisc:      $('playerDisc'),
    playerName:      $('playerName'),
    playerCur:       $('playerCur'),
    playerTot:       $('playerTot'),
    playerFill:      $('playerFill'),
    playerThumb:     $('playerThumb'),
    playerTrack:     $('playerTrack'),
    playerPlay:      $('playerPlay'),
    playerPrev:      $('playerPrev'),
    playerNext:      $('playerNext'),
    playerVol:       $('playerVol'),
    bookAudio:       $('bookAudio'),
  };
}

// ════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  applyConfig();
  buildVistas();
  initEntryScreen();
  initGlowCanvas();
  startFloatingHearts();
  initPlayer();
  // Aplicar duración de volteo desde CONFIG
  document.documentElement.style.setProperty('--flip-duration', CONFIG.duracion_volteo + 'ms');
  document.documentElement.style.setProperty('--book-open-dur', CONFIG.duracion_apertura + 'ms');
  document.documentElement.style.setProperty('--book-close-dur', CONFIG.duracion_cierre + 'ms');
});

// ════════════════════════════════════════════
// APLICAR CONFIG A TEXTOS DEL HTML
// ════════════════════════════════════════════
function applyConfig() {
  dom.entryTitle.textContent     = CONFIG.texto_entrada_titulo;
  dom.entrySubtitle.textContent  = CONFIG.texto_entrada_subtitulo;
  dom.cartaTitulo.textContent    = CONFIG.titulo_carta;
  dom.cartaSubtitulo.textContent = CONFIG.subtitulo_carta;
  dom.cartaClickTotal.textContent= `/ ${CONFIG.clics_necesarios}`;
  dom.cartaOpenMensaje.textContent = CONFIG.mensaje_dentro_carta;
  dom.cartaBtnSi.textContent     = CONFIG.texto_btn_si;
  dom.cartaBtnNo.textContent     = CONFIG.texto_btn_no;
  dom.coverTitle.textContent     = CONFIG.titulo_libro;
  dom.coverSubtitle.textContent  = CONFIG.subtitulo_libro;
  dom.coverOpenHint.textContent  = CONFIG.texto_instruccion_portada;
  dom.coverBackText.textContent  = CONFIG.contraportada_texto;
  dom.coverBackSub.textContent   = CONFIG.contraportada_subtexto;
  document.title = `${CONFIG.titulo_libro} 💗`;
}

// ════════════════════════════════════════════
// CONSTRUIR VISTAS (pares de páginas)
// ════════════════════════════════════════════
function buildVistas() {
  const pags = CONFIG.paginas;
  const n    = pags.length;
  const esPar = n % 2 === 0;
  VISTAS = [];

  // Vista 1 siempre: portada interior (izq) + página 0 (der)
  VISTAS.push({ left:{ type:'portada_interior' }, right:{ type:'pagina', idx:0 } });

  if (esPar) {
    // PAR: páginas 1..n-2 van de dos en dos, luego última vista con contraportada exterior
    for (let j = 1; j <= n - 2; j += 2) {
      VISTAS.push({ left:{ type:'pagina',idx:j }, right:{ type:'pagina',idx:j+1 } });
    }
    // Última vista: página[n-1] izq + contraportada exterior der
    VISTAS.push({ left:{ type:'pagina',idx:n-1 }, right:{ type:'contraportada_exterior' } });
  } else {
    // IMPAR: páginas 1..n-2 de dos en dos
    for (let j = 1; j <= n - 2; j += 2) {
      VISTAS.push({ left:{ type:'pagina',idx:j }, right:{ type:'pagina',idx:j+1 } });
    }
    // Penúltima vista: página[n-2] izq + página[n-1] der  (el par final)
    // NOTA: ya fue incluida en el loop si n-1 es par. Si n=9: j llega a j=7 → pag7+pag8 ✓
    // Última vista: página[n-1] izq + contraportada interior der (spec: solo en impar)
    VISTAS.push({ left:{ type:'pagina',idx:n-1 }, right:{ type:'contraportada_interior' } });
  }
}

// ════════════════════════════════════════════
// FASE 1A — CÓDIGO DE ACCESO
// ════════════════════════════════════════════
function initEntryScreen() {
  // Numpad: responder en pointerdown (Apple design: kill latency)
  dom.numpad.querySelectorAll('.num-btn[data-digit]').forEach(btn => {
    btn.addEventListener('pointerdown', e => { e.preventDefault(); addDigit(btn.dataset.digit); });
  });
  dom.clearBtn.addEventListener('pointerdown', e => { e.preventDefault(); removeDigit(); });
  dom.confirmCodeBtn.addEventListener('pointerdown', e => { e.preventDefault(); checkCode(); });

  // Teclado físico
  document.addEventListener('keydown', e => {
    if (STATE.fase !== 'code') return;
    if (e.key >= '0' && e.key <= '9') addDigit(e.key);
    else if (e.key === 'Backspace') removeDigit();
    else if (e.key === 'Enter') checkCode();
  });
}

function addDigit(d) {
  if (STATE.codigoIntroducido.length >= 6) return;
  STATE.codigoIntroducido += d;
  renderCodeDots();
  if (STATE.codigoIntroducido.length === 6) checkCode();
}
function removeDigit() {
  STATE.codigoIntroducido = STATE.codigoIntroducido.slice(0, -1);
  renderCodeDots();
}
function renderCodeDots() {
  dom.codeDots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < STATE.codigoIntroducido.length);
  });
}
function checkCode() {
  if (STATE.codigoIntroducido.length < 6) return;
  if (STATE.codigoIntroducido === String(CONFIG.codigo_acceso)) {
    dom.codeFeedback.style.color = '#4caf50';
    dom.codeFeedback.textContent = CONFIG.mensaje_codigo_correcto;
    setTimeout(() => {
      STATE.fase = 'card';
      dom.stepCode.classList.add('hidden');
      dom.stepCard.classList.remove('hidden');
      initCartaStep();
    }, 900);
  } else {
    // Error: vibración + shake
    dom.codeDots.forEach(d => d.classList.add('error'));
    dom.codeFeedback.style.color = '';
    dom.codeFeedback.textContent = CONFIG.mensaje_codigo_incorrecto;
    if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
    setTimeout(() => {
      dom.codeDots.forEach(d => d.classList.remove('error'));
      STATE.codigoIntroducido = '';
      renderCodeDots();
    }, 700);
  }
}

// ════════════════════════════════════════════
// FASE 1B — RITUAL DE CLICS (la carta)
// ════════════════════════════════════════════
function initCartaStep() {
  // Apple: responde en pointerdown, no en click
  dom.cartaCard.addEventListener('pointerdown', handleCartaClick);
  dom.cartaBtnSi.addEventListener('click', handleBtnSi);
  dom.cartaBtnNo.addEventListener('click', handleBtnNo);
}

function handleCartaClick(e) {
  // Si ya se completaron los clics y se muestra la carta abierta: no hacer nada
  if (!dom.cartaClosedContent.classList.contains('hidden')) {
    incrementarClic();
  }
}

function incrementarClic() {
  if (STATE.clicsRealizados >= CONFIG.clics_necesarios) return;
  STATE.clicsRealizados++;

  // Feedback visual Tier-1: pulso en la carta
  dom.cartaCard.classList.remove('pulsing');
  void dom.cartaCard.offsetWidth; // reflow para re-triggear la animación
  dom.cartaCard.classList.add('pulsing');
  setTimeout(() => dom.cartaCard.classList.remove('pulsing'), 350);

  // Actualizar contador
  dom.cartaClickCount.textContent = STATE.clicsRealizados;

  // Actualizar anillo SVG (circumferencia = 2π × 54 ≈ 339.3)
  const circ = 339.3;
  const offset = circ - (STATE.clicsRealizados / CONFIG.clics_necesarios) * circ;
  dom.cartaRingFg.style.strokeDashoffset = offset;

  // Hitos
  const hito = CONFIG.hitos.find(h => h.clic === STATE.clicsRealizados);
  if (hito) {
    dom.cartaHitoMsg.textContent = hito.mensaje;
    dom.cartaHitoMsg.style.animation = 'none';
    void dom.cartaHitoMsg.offsetWidth;
    dom.cartaHitoMsg.style.animation = '';
  }

  // Partículas pequeñas cada 5 clics para feedback extra
  if (STATE.clicsRealizados % 5 === 0) spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 6);

  // Al completar
  if (STATE.clicsRealizados >= CONFIG.clics_necesarios) {
    cartaCompleta();
  }
}

function cartaCompleta() {
  launchConfetti(80);
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 20);
  // Mostrar contenido de carta abierta
  dom.cartaClosedContent.classList.add('hidden');
  dom.cartaOpenContent.classList.remove('hidden');
}

function handleBtnSi() {
  // Transición al libro con Tier-2
  dom.entryScreen.classList.add('closing');
  setTimeout(() => {
    dom.entryScreen.style.display = 'none';
    showBookScreen();
  }, 600);
}

function handleBtnNo() {
  showToast(CONFIG.mensaje_no_click);
}

// ════════════════════════════════════════════
// PANTALLA DEL LIBRO
// ════════════════════════════════════════════
function showBookScreen() {
  STATE.fase = 'book';
  dom.bookScreen.classList.remove('hidden');
  // Mostrar portada cerrada con botón de abrir
  renderCoverClosed('front');
  updateNav();
  // Iniciar música con interacción del usuario
  initMusicOnInteract();
}

// ════════════════════════════════════════════
// ESTADO DEL LIBRO: CERRADO / ABIERTO
// ════════════════════════════════════════════
function renderCoverClosed(side) {
  STATE.bookOpen = false;
  STATE.bookShowingBack = side === 'back';
  dom.book.className = 'book closed' + (side === 'back' ? ' closed-back' : '');
  dom.bookShadow.style.opacity = '0.6';
  // Portada siempre cargada desde assets
  dom.coverFrontImg.src = 'assets/portada.webp';
  dom.coverBackImg.src  = 'assets/contraportada.webp';
  // Portada es clickeable para abrir
  dom.coverFront.style.cursor = 'pointer';
  dom.coverFront.onclick = () => { if (!STATE.bookOpen) abrirLibro(); };
  updateNav();
}

function abrirLibro() {
  if (STATE.bookOpen || STATE.flipping) return;
  STATE.bookOpen = true;
  STATE.vistaActual = 0;
  // Tier-3: apertura cinematic
  dom.book.className = 'book opening';
  dom.book.addEventListener('animationend', () => {
    dom.book.className = 'book open';
    renderVista(0, false);
    updateNav();
  }, { once: true });
  launchConfetti(50);
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 12);
}

function cerrarLibro() {
  if (!STATE.bookOpen || STATE.flipping) return;
  STATE.bookOpen = false;
  dom.book.className = 'book closing';
  dom.book.addEventListener('animationend', () => {
    renderCoverClosed('back');
    showToast('Libro cerrado 💗');
    updateNav();
  }, { once: true });
}

function restaurarInicio() {
  STATE.bookOpen = false;
  STATE.flipping = false;
  STATE.vistaActual = 0;
  STATE.bookShowingBack = false;
  dom.book.className = 'book closed';
  dom.pageRightInner.className = 'book-page-inner';
  dom.pageRightInner.style.transform = '';
  dom.coverFront.style.opacity = '';
  dom.coverBack.style.opacity = '';
  updateNav();
}

// ════════════════════════════════════════════
// RENDERIZADO DE VISTAS (pares de páginas)
// ════════════════════════════════════════════
function buildPageHTML(descriptor) {
  if (!descriptor) return '<div class="page-content-wrap"></div>';

  switch (descriptor.type) {
    case 'portada_interior': {
      const cfg = CONFIG.portada_interior_default;
      return `<div class="page-content-wrap inner-cover" style="background:${cfg.color_fondo}">
        <div class="inner-cover-ornament">🌸</div>
        <div class="inner-cover-text">${cfg.texto}</div>
        <div class="inner-cover-sub">${cfg.subtexto}</div>
      </div>`;
    }
    case 'contraportada_interior': {
      const cfg = CONFIG.contraportada_interior_default;
      return `<div class="page-content-wrap inner-cover" style="background:${cfg.color_fondo}">
        <div class="inner-cover-ornament">💗</div>
        <div class="inner-cover-text">${cfg.texto}</div>
        <div class="inner-cover-sub">${cfg.subtexto}</div>
      </div>`;
    }
    case 'contraportada_exterior': {
      return `<div class="page-content-wrap inner-cover" style="background:linear-gradient(160deg,#fce4ec,#f8bbd0)">
        <div class="inner-cover-ornament">💕</div>
        <div class="inner-cover-text">${CONFIG.contraportada_texto}</div>
        <div class="inner-cover-sub">${CONFIG.contraportada_subtexto}</div>
      </div>`;
    }
    case 'pagina': {
      const pag = CONFIG.paginas[descriptor.idx];
      if (!pag) return '<div class="page-content-wrap"></div>';
      return `<div class="page-content-wrap">
        <div class="page-img-wrap">
          <img class="page-img" src="${pag.imagen}" alt="Página ${descriptor.idx + 1}" loading="lazy"
            onerror="this.style.background='#fce4ec';this.removeAttribute('src')">
        </div>
        <p class="page-frase">${pag.frase || ''}</p>
      </div>`;
    }
    default:
      return '<div class="page-content-wrap"></div>';
  }
}

function renderVista(vistaIdx, animate) {
  if (vistaIdx < 0 || vistaIdx >= VISTAS.length) return;
  const vista = VISTAS[vistaIdx];
  dom.pageLeftContent.innerHTML  = buildPageHTML(vista.left);
  dom.pageRightContent.innerHTML = buildPageHTML(vista.right);
  // Pre-renderizar la siguiente vista en el "back" de la página derecha
  const nextVista = VISTAS[vistaIdx + 1];
  dom.pageRightBack.innerHTML = nextVista ? buildPageHTML(nextVista.right) : '';
  dom.pageLeftBack.innerHTML  = nextVista ? buildPageHTML(nextVista.left) : '';
}

// ════════════════════════════════════════════
// VOLTEO DE PÁGINA (Tier-2 + Tier-3)
// Emil: no 'all', exactamente transform.
// Apple: interruptible (bloqueamos solo durante el vuelo, re-habilitamos al terminar).
// ════════════════════════════════════════════
function voltearPaginaAdelante() {
  if (STATE.flipping) return;
  if (STATE.vistaActual >= VISTAS.length - 1) {
    // Llegamos al final → cerrar el libro (muestra contraportada)
    cerrarLibro();
    return;
  }
  STATE.flipping = true;

  const siguienteVista = STATE.vistaActual + 1;
  // Pre-cargar la siguiente vista en el "back"
  const nextVista = VISTAS[siguienteVista];
  dom.pageRightBack.innerHTML = nextVista ? buildPageHTML(nextVista.right) : '';
  dom.pageLeftBack.innerHTML  = nextVista ? buildPageHTML(nextVista.left)  : '';

  // Iniciar volteo: clase 'flipping-fwd' activa la transición CSS rotateY(-180deg)
  dom.pageRightInner.classList.add('flipping-fwd');

  dom.pageRightInner.addEventListener('transitionend', () => {
    // Al terminar el vuelo: actualizar la vista, quitar la clase, snap de vuelta
    STATE.vistaActual = siguienteVista;
    renderVista(STATE.vistaActual, false);
    dom.pageRightInner.classList.remove('flipping-fwd');
    dom.pageRightInner.style.transform = '';
    STATE.flipping = false;
    updateNav();
  }, { once: true });

  updateNav();
}

function voltearPaginaAtras() {
  if (STATE.flipping) return;
  if (STATE.vistaActual <= 0) return;
  STATE.flipping = true;

  const anteriorVista = STATE.vistaActual - 1;
  // Pre-cargar anterior en el back
  const prevVista = VISTAS[anteriorVista];
  dom.pageRightBack.innerHTML = buildPageHTML(prevVista?.right);
  dom.pageLeftBack.innerHTML  = buildPageHTML(prevVista?.left);

  // Partir desde -180 y animar a 0 → efecto de vuelta atrás
  dom.pageRightInner.style.transition = 'none';
  dom.pageRightInner.style.transform  = 'rotateY(-180deg)';
  void dom.pageRightInner.offsetWidth; // reflow
  dom.pageRightInner.style.transition = '';
  dom.pageRightInner.classList.add('flipping-back');

  dom.pageRightInner.addEventListener('transitionend', () => {
    STATE.vistaActual = anteriorVista;
    renderVista(STATE.vistaActual, false);
    dom.pageRightInner.classList.remove('flipping-back');
    dom.pageRightInner.style.transform = '';
    STATE.flipping = false;
    updateNav();
  }, { once: true });

  updateNav();
}

// ════════════════════════════════════════════
// SWIPE / DRAG (Apple: 1:1 tracking + velocidad)
// ════════════════════════════════════════════
function initSwipe() {
  const target = dom.bookStage;
  let startX = 0, startTime = 0;

  target.addEventListener('pointerdown', e => {
    if (STATE.flipping || !STATE.bookOpen) return;
    startX = e.clientX;
    startTime = Date.now();
    STATE.dragging = true;
    target.setPointerCapture(e.pointerId);
  });

  target.addEventListener('pointerup', e => {
    if (!STATE.dragging) return;
    STATE.dragging = false;
    const dx = e.clientX - startX;
    const dt = Date.now() - startTime;
    const velocidad = Math.abs(dx) / dt; // px/ms

    // Umbral: más de 40px O velocidad > 0.3px/ms
    if (dx < -40 || (dx < -10 && velocidad > 0.3)) voltearPaginaAdelante();
    else if (dx > 40 || (dx > 10 && velocidad > 0.3)) voltearPaginaAtras();
  });

  target.addEventListener('pointercancel', () => { STATE.dragging = false; });
}

// ════════════════════════════════════════════
// BOTONES DE NAVEGACIÓN
// ════════════════════════════════════════════
function initNavButtons() {
  dom.btnNext.addEventListener('click', () => {
    if (STATE.bookOpen) voltearPaginaAdelante();
    else if (STATE.bookShowingBack) restaurarInicio();
    else abrirLibro();
  });
  dom.btnPrev.addEventListener('click', () => {
    if (!STATE.bookOpen) return;
    if (STATE.vistaActual === 0) cerrarLibro();
    else voltearPaginaAtras();
  });
  dom.btnClose.addEventListener('click', () => {
    if (STATE.bookOpen) cerrarLibro();
  });
  dom.btnRestore.addEventListener('click', restaurarInicio);
  // También la portada cerrada
  dom.coverFront.addEventListener('click', () => { if (!STATE.bookOpen) abrirLibro(); });
}

function updateNav() {
  const total = VISTAS.length;
  const actual = STATE.vistaActual + 1;
  // Label
  if (!STATE.bookOpen) {
    dom.navLabel.textContent = STATE.bookShowingBack ? 'Contraportada' : 'Portada';
  } else {
    dom.navLabel.textContent = `Vista ${actual} de ${total}`;
  }
  // Barra de progreso
  const pct = STATE.bookOpen ? (actual / total) * 100 : (STATE.bookShowingBack ? 100 : 0);
  dom.navProgressFill.style.width = pct + '%';
  // Botones deshabilitados en límites
  dom.btnPrev.disabled = !STATE.bookOpen || STATE.flipping;
  dom.btnNext.disabled = STATE.flipping;
  // Botón de cerrar
  dom.btnClose.style.opacity = STATE.bookOpen ? '1' : '0.4';
  dom.btnClose.style.pointerEvents = STATE.bookOpen ? 'auto' : 'none';
}

// ════════════════════════════════════════════
// REPRODUCTOR DE MÚSICA
// ════════════════════════════════════════════
function initPlayer() {
  dom.playerToggle.addEventListener('click', e => { e.stopPropagation(); togglePlayerPanel(); });
  dom.playerPlay.addEventListener('click',   e => { e.stopPropagation(); togglePlay(); });
  dom.playerPrev.addEventListener('click',   e => { e.stopPropagation(); changeSong(-1); });
  dom.playerNext.addEventListener('click',   e => { e.stopPropagation(); changeSong(1); });

  dom.playerTrack.addEventListener('click', e => {
    if (!dom.bookAudio.duration) return;
    const r = dom.playerTrack.getBoundingClientRect();
    dom.bookAudio.currentTime = ((e.clientX - r.left) / r.width) * dom.bookAudio.duration;
  });

  dom.playerVol.addEventListener('input', e => {
    dom.bookAudio.volume = e.target.value;
    const pct = e.target.value * 100;
    e.target.style.background = `linear-gradient(90deg, var(--rose-400) ${pct}%, var(--rose-100) ${pct}%)`;
  });

  dom.bookAudio.addEventListener('timeupdate', updatePlayerProgress);
  dom.bookAudio.addEventListener('play',  () => {
    STATE.playing = true;
    dom.playerPlay.textContent = '⏸';
    dom.playerDisc.classList.add('playing');
  });
  dom.bookAudio.addEventListener('pause', () => {
    STATE.playing = false;
    dom.playerPlay.textContent = '▶';
    dom.playerDisc.classList.remove('playing');
  });
  dom.bookAudio.addEventListener('ended', () => changeSong(1));
  dom.bookAudio.volume = 0.7;

  loadSong(0, false);
}

function initMusicOnInteract() {
  const tryPlay = () => {
    dom.bookAudio.play().catch(() => {});
    document.removeEventListener('pointerdown', tryPlay);
  };
  document.addEventListener('pointerdown', tryPlay, { once: true });
}

function loadSong(idx, autoplay = true) {
  STATE.songIdx = ((idx % CONFIG.canciones.length) + CONFIG.canciones.length) % CONFIG.canciones.length;
  const song = CONFIG.canciones[STATE.songIdx];
  dom.bookAudio.src = song.archivo;
  dom.playerName.textContent = song.nombre;
  if (autoplay) dom.bookAudio.play().catch(() => {});
}

function togglePlay() {
  if (STATE.playing) dom.bookAudio.pause();
  else dom.bookAudio.play().catch(() => {});
}
function changeSong(dir) { loadSong(STATE.songIdx + dir); }

function updatePlayerProgress() {
  if (!dom.bookAudio.duration) return;
  const pct = dom.bookAudio.currentTime / dom.bookAudio.duration * 100;
  dom.playerFill.style.width  = pct + '%';
  dom.playerThumb.style.left  = pct + '%';
  dom.playerCur.textContent   = fmtTime(dom.bookAudio.currentTime);
  dom.playerTot.textContent   = fmtTime(dom.bookAudio.duration);
}

function togglePlayerPanel() {
  STATE.playerOpen = !STATE.playerOpen;
  dom.playerPanel.classList.toggle('mini', !STATE.playerOpen);
}

function fmtTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), ss = Math.floor(s % 60);
  return m + ':' + (ss < 10 ? '0' : '') + ss;
}

// ════════════════════════════════════════════
// CANVAS DE BRILLOS (glow background)
// Partículas de luz flotando en el fondo
// ════════════════════════════════════════════
let glowParticles = [];
let glowCtx, glowCanvas;

function initGlowCanvas() {
  glowCanvas = dom.glowCanvas;
  glowCtx = glowCanvas.getContext('2d');
  resizeGlowCanvas();
  window.addEventListener('resize', resizeGlowCanvas);
  spawnGlowParticles();
  requestAnimationFrame(loopGlow);
}

function resizeGlowCanvas() {
  glowCanvas.width  = window.innerWidth;
  glowCanvas.height = window.innerHeight;
}

function spawnGlowParticles() {
  glowParticles = [];
  const count = Math.min(60, Math.floor(window.innerWidth * window.innerHeight / 14000));
  const colors = ['rgba(240,98,146,', 'rgba(213,0,99,', 'rgba(244,143,177,', 'rgba(243,229,245,'];
  for (let i = 0; i < count; i++) {
    glowParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3.5 + 1,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.45 + 0.08,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.025 + 0.008,
    });
  }
}

function loopGlow() {
  glowCtx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
  glowParticles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.twinkle += p.twinkleSpeed;
    if (p.x < -10) p.x = glowCanvas.width + 10;
    if (p.x > glowCanvas.width + 10) p.x = -10;
    if (p.y < -10) p.y = glowCanvas.height + 10;
    if (p.y > glowCanvas.height + 10) p.y = -10;
    const a = p.alpha * (0.6 + Math.sin(p.twinkle) * 0.4);
    const grad = glowCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
    grad.addColorStop(0, p.color + a + ')');
    grad.addColorStop(1, p.color + '0)');
    glowCtx.beginPath();
    glowCtx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
    glowCtx.fillStyle = grad;
    glowCtx.fill();
  });
  requestAnimationFrame(loopGlow);
}

// ════════════════════════════════════════════
// CORAZONES FLOTANTES (siempre presentes)
// ════════════════════════════════════════════
function startFloatingHearts() {
  const hearts = ['💗','💕','💖','🌸','✨','💝','🌷','💞'];
  function spawn() {
    const el = document.createElement('div');
    el.className = 'heart-float';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left              = Math.random() * 100 + '%';
    el.style.fontSize          = (Math.random() * 14 + 12) + 'px';
    el.style.animationDuration = (Math.random() * 8 + 9) + 's';
    el.style.animationDelay    = (Math.random() * 2) + 's';
    el.style.opacity           = (Math.random() * 0.3 + 0.15).toFixed(2);
    dom.heartsLayer.appendChild(el);
    setTimeout(() => el.remove(), 18000);
  }
  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 400);
  setInterval(spawn, 1100);
}

// ════════════════════════════════════════════
// PARTÍCULAS DE EXPLOSIÓN
// (sistema optimizado: sin shadowBlur, tope global)
// ════════════════════════════════════════════
let clickParticles = [];
let clickFxRunning = false;
const MAX_CLICK_P = 400;
const EMOJIS_P = ['💗','✨','🌸','💕','🌷','💫','💖'];
const WORDS_P  = ['Te amo','Siempre','Amor','Para ti','💗'];

function spawnParticles(x, y, count = 10) {
  const safeCount = Math.min(count, 14);
  for (let i = 0; i < safeCount; i++) {
    if (clickParticles.length >= MAX_CLICK_P) break;
    const useEmoji = Math.random() > 0.45;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1.2;
    clickParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      gravity: 0.045,
      life: 1, decay: 0.022,
      size: useEmoji ? Math.random() * 13 + 14 : Math.random() * 4 + 9,
      text: useEmoji
        ? EMOJIS_P[Math.floor(Math.random() * EMOJIS_P.length)]
        : WORDS_P[Math.floor(Math.random() * WORDS_P.length)],
      isEmoji: useEmoji,
      color: ['#f06292','#e91e63','#f48fb1','#ce93d8'][Math.floor(Math.random() * 4)],
    });
  }
  if (!clickFxRunning) { clickFxRunning = true; requestAnimationFrame(loopParticles); }
}

// Canvas para partículas (creado bajo demanda, sin id fijo)
let pCanvas = null, pCtx = null;
function ensureParticleCanvas() {
  if (pCanvas) return;
  pCanvas = document.createElement('canvas');
  pCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:8000;';
  pCanvas.width = window.innerWidth;
  pCanvas.height = window.innerHeight;
  document.body.appendChild(pCanvas);
  pCtx = pCanvas.getContext('2d');
  window.addEventListener('resize', () => { if(pCanvas){pCanvas.width=window.innerWidth;pCanvas.height=window.innerHeight;} });
}

function loopParticles() {
  ensureParticleCanvas();
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';

  for (let i = clickParticles.length - 1; i >= 0; i--) {
    const p = clickParticles[i];
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.life -= p.decay;
    if (p.life <= 0) { clickParticles.splice(i, 1); continue; }
    pCtx.globalAlpha = Math.max(0, p.life);
    pCtx.font = p.isEmoji ? `${p.size}px sans-serif` : `600 ${p.size}px 'Dancing Script',cursive`;
    pCtx.fillStyle = p.color;
    pCtx.fillText(p.text, p.x, p.y);
  }
  pCtx.globalAlpha = 1;
  if (clickParticles.length > 0) requestAnimationFrame(loopParticles);
  else clickFxRunning = false;
}

// ════════════════════════════════════════════
// CONFETI
// ════════════════════════════════════════════
function launchConfetti(count = 80) {
  const colors = ['#f06292','#f48fb1','#ce93d8','#fff9c4','#b2ebf2','#c8e6c9','#ffe0b2','#fce4ec'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `
        left:${Math.random()*100}vw;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        width:${Math.random()*10+5}px; height:${Math.random()*10+5}px;
        border-radius:${Math.random()>0.5?'50%':'3px'};
        animation-duration:${Math.random()*2+1.5}s;
        animation-delay:${Math.random()*0.4}s;
      `;
      dom.confettiCont.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, i * 12);
  }
}

// ════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════
let toastTimer = null;
function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 3200);
}

// ════════════════════════════════════════════
// BOOTSTRAP FINAL: conectar todos los módulos
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Estos se ejecutan DESPUÉS del DOMContentLoaded principal en libro_p1.js
  // porque ambos están en el mismo archivo concatenado.
  // El DOMContentLoaded de p1 ya cachea el DOM y aplica config;
  // aquí solo conectamos los botones del libro y el swipe.
  // Usamos un pequeño timeout de 0 para asegurarnos que p1 terminó.
  setTimeout(() => {
    initNavButtons();
    initSwipe();
    // Inicializar panel del reproductor cerrado (mini) por defecto
    dom.playerPanel.classList.add('mini');
  }, 0);
});
