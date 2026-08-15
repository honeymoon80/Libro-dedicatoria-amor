/* ============================================================
   SCRIPT.JS — Libro Virtual Interactivo v2
   Skills activas:
   • Emil design-eng: feedback en pointerdown, sin 'all',
     propiedades exactas, ease-out
   • Apple design: swipe 1:1 con inercia y rubber-banding,
     interrupción de animaciones en vuelo
   • motion-system: Tier-1 feedback (≤300ms), Tier-2 transición,
     Tier-3 apertura cinematográfica
   • cinematic-ui: sombra y brillo dinámicos de curvatura
   ============================================================ */
'use strict';

// ════════════════════════════════════════════
// ESTADO
// ════════════════════════════════════════════
const S = {
  // Fase 1
  digits:    '',          // dígitos ingresados
  clics:     0,           // clics en la carta
  fase:      'code',      // 'code' | 'carta' | 'book'

  // Libro
  bookOpen:  false,
  showBack:  false,       // true = contraportada visible
  vista:     0,           // índice de vista actual
  flipping:  false,       // volteo en curso (bloquea swipe)
  flipDir:   0,           // 1=forward, -1=back

  // Swipe — Apple design: tracking 1:1 + inercia
  swipeStartX:   null,
  swipeStartY:   null,
  swipeStartTime:null,
  swipeDelta:    0,
  swipePeaking:  false,   // ya superó el umbral visual

  // Reproductor
  songIdx:   0,
  playing:   false,
  playerOpen:false,
};

// Vistas construidas dinámicamente
let VISTAS = [];

// ════════════════════════════════════════════
// DOM
// ════════════════════════════════════════════
const $ = id => document.getElementById(id);
let D = {};   // cache de referencias DOM

function cacheDom() {
  D = {
    // Globales
    toast:       $('toast'),
    confettiCont:$('confettiCont'),
    heartsLayer: $('heartsLayer'),
    glowCanvas:  $('glowCanvas'),
    fxCanvas:    $('fxCanvas'),
    // Entrada
    entryScreen: $('entryScreen'),
    stepCode:    $('stepCode'),
    stepCarta:   $('stepCarta'),
    entryTitle:  $('entryTitle'),
    entrySub:    $('entrySub'),
    codePips:    Array.from(document.querySelectorAll('.code-pip')),
    codeMsg:     $('codeMsg'),
    numpad:      $('numpad'),
    delBtn:      $('delBtn'),
    okBtn:       $('okBtn'),
    // Carta
    cartaWrap:    $('cartaWrap'),
    cartaEnvelope:$('cartaEnvelope'),
    cartaFlap:    document.querySelector('.carta-flap'),
    cartaTitle:   $('cartaTitle'),
    cartaSub:     $('cartaSub'),
    ringFg:       $('ringFg'),
    ringCount:    $('ringCount'),
    ringTotal:    $('ringTotal'),
    cartaHito:    $('cartaHito'),
    cartaClosed:  $('cartaClosed'),
    cartaAbierta: $('cartaAbierta'),
    cartaOpenMsg: $('cartaOpenMsg'),
    btnSi:        $('btnSi'),
    btnNo:        $('btnNo'),
    // Libro
    bookScreen:  $('bookScreen'),
    bookStage:   $('bookStage'),
    book:        $('book'),
    spine:       $('spine'),
    groundShadow:$('groundShadow'),
    pageL:       $('pageL'),
    pageLFront:  $('pageLFront'),
    pageLBack:   $('pageLBack'),
    pageR:       $('pageR'),
    pageRInner:  $('pageRInner'),
    pageRFront:  $('pageRFront'),
    pageRBack:   $('pageRBack'),
    flipShadow:  $('flipShadow'),
    flipShine:   $('flipShine'),
    coverFront:  $('coverFront'),
    coverFrontImg:$('coverFrontImg'),
    coverTitle:  $('coverTitle'),
    coverSubtitle:$('coverSubtitle'),
    coverHint:   $('coverHint'),
    coverBack:   $('coverBack'),
    coverBackImg:$('coverBackImg'),
    coverBackText:$('coverBackText'),
    coverBackSub: $('coverBackSub'),
    btnPrev:     $('btnPrev'),
    btnNext:     $('btnNext'),
    navFill:     $('navFill'),
    navLabel:    $('navLabel'),
    btnClose:    $('btnClose'),
    btnRestore:  $('btnRestore'),
    // Reproductor
    playerToggle:$('playerToggle'),
    playerBody:  $('playerBody'),
    playerDisc:  $('playerDisc'),
    playerName:  $('playerName'),
    playerCur:   $('playerCur'),
    playerTot:   $('playerTot'),
    playerFill:  $('playerFill'),
    playerKnob:  $('playerKnob'),
    playerTrack: $('playerTrack'),
    pcPlay:      $('pcPlay'),
    pcPrev:      $('pcPrev'),
    pcNext:      $('pcNext'),
    playerVol:   $('playerVol'),
    audio:       $('audio'),
  };
}

// ════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  applyConfig();
  buildVistas();

  // Aplicar tiempos desde CONFIG a CSS custom properties
  const root = document.documentElement;
  root.style.setProperty('--t-flip',  CONFIG.duracionVolteo  + 'ms');
  root.style.setProperty('--t-open',  CONFIG.duracionApertura + 'ms');
  root.style.setProperty('--t-close', CONFIG.duracionCierre  + 'ms');

  initEntryCode();
  initGlowCanvas();
  initFxCanvas();
  startHearts();
  initPlayer();
});

// ════════════════════════════════════════════
// APLICAR CONFIG A TEXTOS
// ════════════════════════════════════════════
function applyConfig() {
  D.entryTitle.textContent     = CONFIG.texto_entrada_titulo  || `Un regalo para ${CONFIG.nombrePareja}`;
  D.entrySub.textContent       = CONFIG.texto_entrada_subtitulo || 'Ingresa tu código para abrirlo 💗';
  D.cartaTitle.textContent     = CONFIG.tituloCarta;
  D.cartaSub.textContent       = CONFIG.subtituloCarta;
  D.ringTotal.textContent      = '/ ' + CONFIG.clicsNecesarios;
  D.cartaOpenMsg.textContent   = CONFIG.mensajeDentroCarta;
  D.btnSi.textContent          = CONFIG.texto_btn_si   || '💗 Sí, quiero abrirla';
  D.btnNo.textContent          = CONFIG.texto_btn_no   || 'Espera un momento...';
  D.coverTitle.textContent     = CONFIG.tituloLibro;
  D.coverSubtitle.textContent  = CONFIG.subtituloLibro;
  D.coverHint.textContent      = CONFIG.texto_instruccion_portada || 'Toca la portada para abrir el libro 💗';
  D.coverBackText.textContent  = CONFIG.tapas.contraportada.texto;
  D.coverBackSub.textContent   = CONFIG.tapas.contraportada.subtexto;
  document.title               = CONFIG.tituloLibro + ' 💗';
}

// ════════════════════════════════════════════
// CONSTRUIR VISTAS (lógica par/impar)
// ════════════════════════════════════════════
// Descriptor: { type: 'portada_interior'|'pagina'|'contraportada_interior'|'contraportada_exterior', idx? }
function buildVistas() {
  const n    = CONFIG.paginas.length;
  const esPar = n % 2 === 0;
  VISTAS = [];

  // Vista 1 siempre: portada interior (izq) + página[0] (der)
  VISTAS.push({ left:{ type:'portada_interior' }, right:{ type:'pagina', idx:0 } });

  if (esPar) {
    // PAR: páginas 1..n-2 de dos en dos, última vista = pág[n-1] + contraportada exterior
    for (let j = 1; j <= n - 2; j += 2) {
      VISTAS.push({ left:{ type:'pagina',idx:j }, right:{ type:'pagina',idx:j+1 } });
    }
    VISTAS.push({ left:{ type:'pagina',idx:n-1 }, right:{ type:'contraportada_exterior' } });
  } else {
    // IMPAR: páginas 1..n-2 de dos en dos, pág[n-2]+pág[n-1], luego pág[n-1]+contraportada interior
    for (let j = 1; j <= n - 2; j += 2) {
      VISTAS.push({ left:{ type:'pagina',idx:j }, right:{ type:'pagina',idx:j+1 } });
    }
    // Si n-2 no alcanzó a emparejarse con n-1 dentro del loop, lo añadimos aquí
    // Con n impar: el loop j=1..n-2 itera j=1,3,...,n-2 (n-2 es impar).
    // j=n-2 → empareja pág[n-2]+pág[n-1] → ✓ ya incluido.
    // Última vista extra: pág[n-1] + contraportada interior
    VISTAS.push({ left:{ type:'pagina',idx:n-1 }, right:{ type:'contraportada_interior' } });
  }
}

// ════════════════════════════════════════════
// FASE 1A — CÓDIGO DE ACCESO
// ════════════════════════════════════════════
function initEntryCode() {
  // Apple: pointerdown para respuesta inmediata (kill tap delay)
  D.numpad.querySelectorAll('.nk[data-d]').forEach(btn => {
    btn.addEventListener('pointerdown', e => { e.preventDefault(); addDigit(btn.dataset.d); });
  });
  D.delBtn.addEventListener('pointerdown', e => { e.preventDefault(); delDigit(); });
  D.okBtn.addEventListener('pointerdown',  e => { e.preventDefault(); checkCode(); });

  // Soporte teclado físico
  document.addEventListener('keydown', e => {
    if (S.fase !== 'code') return;
    if (e.key >= '0' && e.key <= '9') addDigit(e.key);
    else if (e.key === 'Backspace')    delDigit();
    else if (e.key === 'Enter')        checkCode();
  });
}

function addDigit(d) {
  if (S.digits.length >= 6) return;
  S.digits += d;
  renderPips();
  if (S.digits.length === 6) checkCode();
}
function delDigit() {
  S.digits = S.digits.slice(0, -1);
  renderPips();
}
function renderPips() {
  D.codePips.forEach((pip, i) => {
    pip.classList.toggle('on', i < S.digits.length);
  });
}
function checkCode() {
  if (S.digits.length < 6) return;
  if (S.digits === String(CONFIG.codigoAcceso)) {
    D.codeMsg.style.color = '#4caf50';
    D.codeMsg.textContent = CONFIG.msgCodigoCorrecto;
    setTimeout(() => goToCarta(), 900);
  } else {
    D.codePips.forEach(p => p.classList.add('err'));
    D.codeMsg.style.color = '';
    D.codeMsg.textContent = CONFIG.msgCodigoIncorrecto;
    if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
    setTimeout(() => {
      D.codePips.forEach(p => p.classList.remove('err'));
      S.digits = '';
      renderPips();
      D.codeMsg.textContent = '';
    }, 700);
  }
}
function goToCarta() {
  S.fase = 'carta';
  D.stepCode.classList.add('hidden');
  D.stepCarta.classList.remove('hidden');
  initCartaEvents();
}

// ════════════════════════════════════════════
// FASE 1B — RITUAL DE CLICS (carta)
// ════════════════════════════════════════════
function initCartaEvents() {
  // Apple: pointerdown → feedback inmediato
  D.cartaEnvelope.addEventListener('pointerdown', handleCartaClick);
  D.btnSi.addEventListener('click', handleBtnSi);
  D.btnNo.addEventListener('click', handleBtnNo);
}

function handleCartaClick() {
  if (!D.cartaClosed.classList.contains('hidden')) incrementarClic();
}

function incrementarClic() {
  if (S.clics >= CONFIG.clicsNecesarios) return;
  S.clics++;

  // Tier-1 feedback: pulso inmediato ≤300ms (Emil)
  D.cartaEnvelope.classList.remove('pulsing');
  void D.cartaEnvelope.offsetWidth; // reflow para re-triggerear
  D.cartaEnvelope.classList.add('pulsing');
  setTimeout(() => D.cartaEnvelope.classList.remove('pulsing'), 360);

  // Actualizar contador visual
  D.ringCount.textContent = S.clics;

  // Anillo SVG: circumferencia ≈ 2π×52 = 326.7
  const circ = 326.7;
  const offset = circ - (S.clics / CONFIG.clicsNecesarios) * circ;
  D.ringFg.style.strokeDashoffset = offset;

  // Hito
  const hito = CONFIG.hitos.find(h => h.clic === S.clics);
  if (hito) {
    D.cartaHito.textContent = hito.mensaje;
    D.cartaHito.style.animation = 'none';
    void D.cartaHito.offsetWidth;
    D.cartaHito.style.animation = '';
  }

  // Partículas cada 5 clics
  if (S.clics % 5 === 0) {
    const r = D.cartaEnvelope.getBoundingClientRect();
    spawnFx(r.left + r.width/2, r.top + r.height/2, 7);
  }

  if (S.clics >= CONFIG.clicsNecesarios) abrirCarta();
}

function abrirCarta() {
  // Abrir el flap del envelope
  D.cartaFlap.classList.add('open');
  launchConfetti(70);
  spawnFx(window.innerWidth/2, window.innerHeight/2, 18);

  setTimeout(() => {
    D.cartaClosed.classList.add('hidden');
    D.cartaAbierta.classList.remove('hidden');
  }, 650);
}

function handleBtnSi() {
  D.entryScreen.classList.add('closing');
  setTimeout(() => {
    D.entryScreen.style.display = 'none';
    showBookScreen();
  }, 600);
}
function handleBtnNo() {
  showToast(CONFIG.mensaje_no_click || 'Cuando estés lista, aquí estaré esperándote 🌸');
}

// ════════════════════════════════════════════
// FASE 2 — LIBRO VIRTUAL
// ════════════════════════════════════════════
function showBookScreen() {
  S.fase = 'book';
  D.bookScreen.classList.remove('hidden');
  // Mostrar portada cerrada
  setBookState('closed-front');
  updateNav();
  initBookEvents();
  startMusicOnInteract();
}

// ── Estado del libro ─────────────────────────────────────────
// 'closed-front'  → portada exterior visible
// 'open'          → páginas visibles
// 'closed-back'   → contraportada exterior visible
function setBookState(state) {
  const book = D.book;
  // Limpiar clases de estado anteriores
  book.classList.remove('closed', 'open', 'closed-back', 'opening', 'closing');

  if (state === 'closed-front') {
    S.bookOpen = false; S.showBack = false;
    book.classList.add('closed');
    D.coverFront.classList.remove('hidden');
    D.coverBack.classList.add('hidden');
    D.groundShadow.style.opacity = '0.5';
  } else if (state === 'open') {
    S.bookOpen = true; S.showBack = false;
    book.classList.add('open');
    D.coverFront.classList.add('hidden');
    D.coverBack.classList.add('hidden');
    D.groundShadow.style.opacity = '0.65';
  } else if (state === 'closed-back') {
    S.bookOpen = false; S.showBack = true;
    book.classList.add('closed', 'closed-back');
    D.coverFront.classList.add('hidden');
    D.coverBack.classList.remove('hidden');
    D.groundShadow.style.opacity = '0.5';
  }
}

// ── Apertura cinematográfica (Tier-3 / cinematic-ui) ─────────
function abrirLibro() {
  if (S.bookOpen || S.flipping) return;
  const book = D.book;
  // Tier-3: animación de apertura con escala + rotateX
  book.classList.add('opening');
  book.addEventListener('animationend', () => {
    book.classList.remove('opening');
    setBookState('open');
    S.vista = 0;
    renderVista(0);
    updateNav();
  }, { once: true });
  launchConfetti(50);
  spawnFx(window.innerWidth / 2, window.innerHeight / 2, 12);
}

// ── Cierre del libro ──────────────────────────────────────────
function cerrarLibro() {
  if (!S.bookOpen || S.flipping) return;
  const book = D.book;
  book.classList.add('closing');
  book.addEventListener('animationend', () => {
    book.classList.remove('closing');
    setBookState('closed-back');
    updateNav();
    showToast('Libro cerrado 💗');
  }, { once: true });
}

// ── Restaurar al inicio ───────────────────────────────────────
function restaurarInicio() {
  S.flipping = false;
  S.vista = 0;
  // Reset del pageRInner sin animación
  D.pageRInner.style.transition = 'none';
  D.pageRInner.classList.remove('flip-fwd');
  D.pageRInner.style.transform = '';
  void D.pageRInner.offsetWidth;
  D.pageRInner.style.transition = '';
  // Ocultar sombra/brillo
  D.flipShadow.style.opacity = '0';
  D.flipShine.style.opacity  = '0';
  setBookState('closed-front');
  updateNav();
}

// ════════════════════════════════════════════
// RENDERIZADO DE PÁGINAS
// ════════════════════════════════════════════
function buildPageHTML(desc) {
  if (!desc) return '<div class="pg-wrap"></div>';
  const t = CONFIG.tapas;

  switch (desc.type) {

    case 'portada_interior': {
      const cfg = t.portadaInterior;
      return `<div class="pg-wrap" style="padding:0;position:relative;overflow:hidden">
        <img src="${cfg.imagen}" alt="Portada interior"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="tapa-wrap" style="display:none;position:relative;z-index:1">
          <div class="tapa-ornament">🌸</div>
          <div class="tapa-overlay">
            <div class="tapa-text">${cfg.textoDefault}</div>
            <div class="tapa-sub">${cfg.subDefault}</div>
          </div>
        </div>
      </div>`;
    }

    case 'contraportada_interior': {
      const cfg = t.contraportadaInterior;
      return `<div class="pg-wrap" style="padding:0;position:relative;overflow:hidden">
        <img src="${cfg.imagen}" alt="Contraportada interior"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="tapa-wrap" style="display:none;position:relative;z-index:1">
          <div class="tapa-ornament">💗</div>
          <div class="tapa-overlay">
            <div class="tapa-text">${cfg.textoDefault}</div>
            <div class="tapa-sub">${cfg.subDefault}</div>
          </div>
        </div>
      </div>`;
    }

    case 'contraportada_exterior': {
      const cfg = t.contraportada;
      return `<div class="pg-wrap" style="padding:0;position:relative;overflow:hidden">
        <img src="${cfg.imagen}" alt="Contraportada"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="tapa-wrap" style="display:none;position:relative;z-index:1">
          <div class="tapa-ornament">💕</div>
          <div class="tapa-overlay">
            <div class="tapa-text">${cfg.texto}</div>
            <div class="tapa-sub">${cfg.subtexto}</div>
          </div>
        </div>
      </div>`;
    }

    case 'pagina': {
      const pag = CONFIG.paginas[desc.idx];
      if (!pag) return '<div class="pg-wrap"></div>';
      return `<div class="pg-wrap">
        <div class="pg-img-box">
          <img class="pg-img" src="${pag.imagen}" alt="Página ${desc.idx+1}" loading="lazy"
            onerror="this.style.background='var(--r0)';this.removeAttribute('src')">
        </div>
        <p class="pg-frase">${pag.frase || ''}</p>
      </div>`;
    }

    default: return '<div class="pg-wrap"></div>';
  }
}

function renderVista(vistaIdx) {
  if (vistaIdx < 0 || vistaIdx >= VISTAS.length) return;
  const v = VISTAS[vistaIdx];
  D.pageLFront.innerHTML = buildPageHTML(v.left);
  D.pageRFront.innerHTML = buildPageHTML(v.right);
  // Pre-renderizar la vista siguiente en las caras traseras (para el volteo)
  preRenderNext(vistaIdx);
}

function preRenderNext(vistaIdx) {
  const next = VISTAS[vistaIdx + 1];
  if (next) {
    D.pageRBack.innerHTML = buildPageHTML(next.right);
    D.pageLBack.innerHTML = buildPageHTML(next.left);
  } else {
    D.pageRBack.innerHTML = '';
    D.pageLBack.innerHTML = '';
  }
}

// ════════════════════════════════════════════
// VOLTEO CON CURVATURA 3D REALISTA
// cinematic-ui: sombra y brillo dinámicos animados
// Emil: transition exacta, sin 'all'
// Apple: interruptible — si está en vuelo se puede cortar
// ════════════════════════════════════════════
function voltearAdelante() {
  if (S.flipping) return;
  if (S.vista >= VISTAS.length - 1) { cerrarLibro(); return; }
  S.flipping = true; S.flipDir = 1;

  // Pre-renderizar siguiente en back
  preRenderNext(S.vista);

  // 1) Activar sombra y brillo (curvatura 3D) — animar via JS para control fino
  animateCurvatura('fwd');

  // 2) Iniciar la rotación CSS
  D.pageRInner.classList.add('flip-fwd');

  D.pageRInner.addEventListener('transitionend', () => {
    // snap: actualizar estado, quitar clase, resetear transform sin animación
    S.vista++;
    renderVista(S.vista);
    // Reset sin transición (Emil: no usar 'all')
    D.pageRInner.style.transition = 'none';
    D.pageRInner.classList.remove('flip-fwd');
    D.pageRInner.style.transform  = '';
    void D.pageRInner.offsetWidth; // reflow
    D.pageRInner.style.transition = '';
    // Ocultar curvatura
    D.flipShadow.style.opacity = '0';
    D.flipShine.style.opacity  = '0';
    S.flipping = false;
    updateNav();
  }, { once: true });

  updateNav();
}

function voltearAtras() {
  if (S.flipping) return;
  if (S.vista <= 0) return;
  S.flipping = true; S.flipDir = -1;

  // Pre-renderizar anterior en back
  const prev = VISTAS[S.vista - 1];
  D.pageRBack.innerHTML = prev ? buildPageHTML(prev.right) : '';
  D.pageLBack.innerHTML = prev ? buildPageHTML(prev.left)  : '';

  // Partir desde rotateY(-180deg) y animar a 0 → efecto retroceso
  D.pageRInner.style.transition = 'none';
  D.pageRInner.style.transform  = 'rotateY(-180deg)';
  void D.pageRInner.offsetWidth;
  D.pageRInner.style.transition = ''; // reactivar CSS transition

  animateCurvatura('back');

  // La transición de 0deg se dispara automáticamente al quitar el transform forzado
  D.pageRInner.addEventListener('transitionend', () => {
    S.vista--;
    renderVista(S.vista);
    D.pageRInner.style.transition = 'none';
    D.pageRInner.style.transform  = '';
    void D.pageRInner.offsetWidth;
    D.pageRInner.style.transition = '';
    D.flipShadow.style.opacity = '0';
    D.flipShine.style.opacity  = '0';
    S.flipping = false;
    updateNav();
  }, { once: true });

  updateNav();
}

// Animación de sombra y brillo sincronizada con el volteo (curvatura 3D)
// cinematic-ui: la luz se mueve como en papel real
function animateCurvatura(dir) {
  const dur = CONFIG.duracionVolteo;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / dur);
    // Curva de sombra: máxima a mitad del volteo, mínima al inicio/final
    const curvature = Math.sin(t * Math.PI);
    D.flipShadow.style.opacity = (curvature * 0.65).toFixed(3);
    D.flipShine.style.opacity  = (curvature * 0.55).toFixed(3);

    // El brillo se mueve de izquierda a derecha (o derecha a izquierda en back)
    const pos = dir === 'fwd' ? 30 + t * 40 : 70 - t * 40;
    D.flipShine.style.background = `linear-gradient(90deg,
      transparent ${pos - 12}%,
      rgba(255,255,255,0.32) ${pos}%,
      rgba(255,255,255,0.10) ${pos + 8}%,
      transparent ${pos + 20}%)`;

    if (t < 1 && S.flipping) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ════════════════════════════════════════════
// SWIPE CON FÍSICA (Apple design)
// • 1:1 tracking: el pliegue sigue exactamente al dedo
// • Umbral de velocidad + distancia para decidir si voltear
// • Rubber-banding al superar el límite
// • Interrupción: si hay volteo en vuelo, se puede cancelar
// • Nunca llama a 'all' en transition (Emil)
// ════════════════════════════════════════════
function initSwipe() {
  const target = D.bookStage;

  // ── Pointer events (unifica mouse + touch) ──
  target.addEventListener('pointerdown', onSwipeStart, { passive: true });
  target.addEventListener('pointermove', onSwipeMove, { passive: true });
  target.addEventListener('pointerup',   onSwipeEnd,   { passive: true });
  target.addEventListener('pointercancel', resetSwipe, { passive: true });
}

function onSwipeStart(e) {
  if (!S.bookOpen) return;
  // Apple: no bloquear si el volteo está en vuelo (interrupción posible)
  S.swipeStartX    = e.clientX;
  S.swipeStartY    = e.clientY;
  S.swipeStartTime = performance.now();
  S.swipeDelta     = 0;
  S.swipePeaking   = false;
}

function onSwipeMove(e) {
  if (S.swipeStartX === null) return;

  const dx = e.clientX - S.swipeStartX;
  const dy = e.clientY - S.swipeStartY;

  // Ignorar si el gesto es más vertical que horizontal (scroll)
  if (Math.abs(dy) > Math.abs(dx) * 1.4) { resetSwipe(); return; }

  S.swipeDelta = dx;

  // 1:1 tracking — la página sigue exactamente al dedo (en grados)
  // Máximo útil: ±180deg (volteo completo)
  const maxDx   = D.pageR.offsetWidth || 280;
  const ratio   = Math.max(-1, Math.min(1, dx / maxDx));
  const degrees = ratio * 180; // -180..180

  // Rubber-banding: resistencia exponencial al superar el ancho de página
  const absRatio = Math.abs(ratio);
  const rubberDeg = absRatio > 0.85
    ? Math.sign(degrees) * (153 + (absRatio - 0.85) * 200)
    : degrees;

  // Si está flipping en vuelo, ignorar (interrupción solo al soltar)
  if (S.flipping) return;

  // Aplicar rotación 1:1 SIN transition (tracking directo)
  D.pageRInner.style.transition = 'none';

  if (dx < 0) {
    // Deslizar hacia izquierda → volteo adelante
    if (S.vista < VISTAS.length - 1) {
      D.pageRInner.style.transform = `rotateY(${Math.max(-180, rubberDeg)}deg)`;
      // Curvatura proporcional al progreso
      const prog = Math.min(1, Math.abs(ratio) * 2);
      const curve = Math.sin(prog * Math.PI);
      D.flipShadow.style.opacity = (curve * 0.6).toFixed(3);
      D.flipShine.style.opacity  = (curve * 0.5).toFixed(3);
      S.swipePeaking = Math.abs(dx) > maxDx * 0.3;
    }
  } else if (dx > 0) {
    // Deslizar hacia derecha → volteo atrás (solo si hay vista anterior)
    if (S.vista > 0) {
      const backDeg = Math.min(0, -180 + Math.min(180, Math.abs(rubberDeg)));
      D.pageRInner.style.transform = `rotateY(${backDeg}deg)`;
      const prog = Math.min(1, Math.abs(ratio) * 2);
      const curve = Math.sin(prog * Math.PI);
      D.flipShadow.style.opacity = (curve * 0.5).toFixed(3);
      D.flipShine.style.opacity  = (curve * 0.45).toFixed(3);
    }
  }
}

function onSwipeEnd(e) {
  if (S.swipeStartX === null) return;

  const dx  = e.clientX - S.swipeStartX;
  const dt  = performance.now() - S.swipeStartTime;
  const vel = dt > 0 ? Math.abs(dx) / dt : 0; // px/ms — velocidad

  const maxDx    = D.pageR.offsetWidth || 280;
  const threshold = maxDx * 0.28;  // 28% del ancho de página
  const velThresh = 0.28;           // px/ms (velocidad mínima)

  // Restaurar transition CSS
  D.pageRInner.style.transition = '';

  if (!S.flipping) {
    if (dx < -threshold || (dx < -30 && vel > velThresh)) {
      // Supera umbral → completar volteo adelante con inercia
      voltearAdelante();
    } else if (dx > threshold || (dx > 30 && vel > velThresh)) {
      // Supera umbral → completar volteo atrás con inercia
      voltearAtras();
    } else {
      // No supera umbral → snap de regreso a posición original (spring)
      snapBack();
    }
  }

  resetSwipe();
}

function resetSwipe() {
  S.swipeStartX    = null;
  S.swipeStartY    = null;
  S.swipeDelta     = 0;
  S.swipePeaking   = false;
}

function snapBack() {
  // Spring de regreso: usar transition corta con ease-out (Emil)
  D.pageRInner.style.transition = `transform 260ms cubic-bezier(0.23,1,0.32,1)`;
  D.pageRInner.style.transform  = 'rotateY(0deg)';
  D.flipShadow.style.opacity    = '0';
  D.flipShine.style.opacity     = '0';
  D.pageRInner.addEventListener('transitionend', () => {
    D.pageRInner.style.transition = '';
    D.pageRInner.style.transform  = '';
  }, { once: true });
}

// ════════════════════════════════════════════
// BOTONES DE NAVEGACIÓN
// ════════════════════════════════════════════
function initBookEvents() {
  // Portada: click abre el libro
  D.coverFront.addEventListener('click', () => { if (!S.bookOpen) abrirLibro(); });

  // Botón siguiente
  D.btnNext.addEventListener('click', () => {
    if (!S.bookOpen) { abrirLibro(); return; }
    voltearAdelante();
  });

  // Botón anterior
  D.btnPrev.addEventListener('click', () => {
    if (!S.bookOpen) return;
    if (S.vista === 0) { cerrarLibro(); return; }
    voltearAtras();
  });

  // Botón cerrar
  D.btnClose.addEventListener('click', () => { if (S.bookOpen) cerrarLibro(); });

  // Botón restaurar
  D.btnRestore.addEventListener('click', restaurarInicio);

  // Inicializar swipe
  initSwipe();

  // Teclado
  document.addEventListener('keydown', e => {
    if (S.fase !== 'book') return;
    if (e.key === 'ArrowRight') D.btnNext.click();
    if (e.key === 'ArrowLeft')  D.btnPrev.click();
  });
}

// ════════════════════════════════════════════
// NAVEGACIÓN — ESTADO DE UI
// ════════════════════════════════════════════
function updateNav() {
  const total  = VISTAS.length;
  const actual = S.vista + 1;

  // Label
  if (!S.bookOpen) {
    D.navLabel.textContent = S.showBack ? 'Contraportada' : 'Portada';
  } else {
    D.navLabel.textContent = `Vista ${actual} de ${total}`;
  }

  // Barra de progreso
  const pct = S.bookOpen ? (actual / total) * 100 : (S.showBack ? 100 : 0);
  D.navFill.style.width = pct + '%';

  // Deshabilitar botones en límites
  D.btnPrev.disabled = S.flipping || (!S.bookOpen);
  D.btnNext.disabled = S.flipping;

  // Opacidad del botón cerrar
  D.btnClose.style.opacity       = S.bookOpen ? '1' : '0.35';
  D.btnClose.style.pointerEvents = S.bookOpen ? 'auto' : 'none';
}

// ════════════════════════════════════════════
// REPRODUCTOR DE MÚSICA
// ════════════════════════════════════════════
function initPlayer() {
  D.playerToggle.addEventListener('click', e => { e.stopPropagation(); togglePlayer(); });
  D.pcPlay.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
  D.pcPrev.addEventListener('click', e => { e.stopPropagation(); changeSong(-1); });
  D.pcNext.addEventListener('click', e => { e.stopPropagation(); changeSong(1); });

  D.playerTrack.addEventListener('click', e => {
    if (!D.audio.duration) return;
    const r = D.playerTrack.getBoundingClientRect();
    D.audio.currentTime = ((e.clientX - r.left) / r.width) * D.audio.duration;
  });

  D.playerVol.addEventListener('input', e => {
    D.audio.volume = +e.target.value;
    const p = +e.target.value * 100;
    e.target.style.background =
      `linear-gradient(90deg,var(--r4) ${p}%,var(--r1) ${p}%)`;
  });

  D.audio.addEventListener('timeupdate', updateProgress);
  D.audio.addEventListener('play',  () => {
    S.playing = true;
    D.pcPlay.textContent = '⏸';
    D.playerDisc.classList.add('playing');
  });
  D.audio.addEventListener('pause', () => {
    S.playing = false;
    D.pcPlay.textContent = '▶';
    D.playerDisc.classList.remove('playing');
  });
  D.audio.addEventListener('ended', () => changeSong(1));
  D.audio.volume = 0.7;

  // Iniciar en mini (cerrado)
  D.playerBody.classList.add('mini');
  loadSong(0, false);
}

function startMusicOnInteract() {
  const go = () => {
    D.audio.play().catch(() => {});
    document.removeEventListener('pointerdown', go);
  };
  document.addEventListener('pointerdown', go, { once: true });
}

function loadSong(idx, autoplay = true) {
  S.songIdx = ((idx % CONFIG.playlist.length) + CONFIG.playlist.length) % CONFIG.playlist.length;
  const song = CONFIG.playlist[S.songIdx];
  D.audio.src       = song.archivo;
  D.playerName.textContent = song.nombre;
  if (autoplay) D.audio.play().catch(() => {});
}
function togglePlay()  { S.playing ? D.audio.pause() : D.audio.play().catch(() => {}); }
function changeSong(d) { loadSong(S.songIdx + d); }
function togglePlayer() {
  S.playerOpen = !S.playerOpen;
  D.playerBody.classList.toggle('mini', !S.playerOpen);
}

function updateProgress() {
  if (!D.audio.duration) return;
  const pct = D.audio.currentTime / D.audio.duration * 100;
  D.playerFill.style.width = pct + '%';
  D.playerKnob.style.left  = pct + '%';
  D.playerCur.textContent  = fmt(D.audio.currentTime);
  D.playerTot.textContent  = fmt(D.audio.duration);
}
function fmt(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), ss = Math.floor(s % 60);
  return m + ':' + (ss < 10 ? '0' : '') + ss;
}

// ════════════════════════════════════════════
// CANVAS DE BRILLO DE FONDO (glow particles)
// Partículas suaves, sin shadowBlur (rendimiento)
// ════════════════════════════════════════════
let glowParts = [], glowCtx;

function initGlowCanvas() {
  const cv = D.glowCanvas;
  glowCtx = cv.getContext('2d');
  resizeGlow();
  window.addEventListener('resize', resizeGlow);
  spawnGlow();
  requestAnimationFrame(loopGlow);
}

function resizeGlow() {
  const cv = D.glowCanvas;
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
}

function spawnGlow() {
  glowParts = [];
  const n = Math.min(55, Math.floor(window.innerWidth * window.innerHeight / 15000));
  const cols = ['rgba(240,98,146,', 'rgba(213,0,99,', 'rgba(244,143,177,', 'rgba(229,115,115,'];
  for (let i = 0; i < n; i++) {
    glowParts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3.5 + 1,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22,
      col: cols[Math.floor(Math.random() * cols.length)],
      a:  Math.random() * .42 + .07,
      tw: Math.random() * Math.PI * 2,
      ts: Math.random() * .022 + .008,
    });
  }
}

function loopGlow() {
  const cv = D.glowCanvas;
  glowCtx.clearRect(0, 0, cv.width, cv.height);
  glowParts.forEach(p => {
    p.x  += p.vx; p.y += p.vy;
    p.tw += p.ts;
    if (p.x < -10) p.x = cv.width + 10;
    if (p.x > cv.width  + 10) p.x = -10;
    if (p.y < -10) p.y = cv.height + 10;
    if (p.y > cv.height + 10) p.y = -10;
    const alpha = p.a * (.6 + Math.sin(p.tw) * .4);
    const g = glowCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
    g.addColorStop(0, p.col + alpha + ')');
    g.addColorStop(1, p.col + '0)');
    glowCtx.beginPath();
    glowCtx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
    glowCtx.fillStyle = g;
    glowCtx.fill();
  });
  requestAnimationFrame(loopGlow);
}

// ════════════════════════════════════════════
// PARTÍCULAS DE CLIC (canvas FX)
// Sin shadowBlur, tope global 400, decay fijo
// ════════════════════════════════════════════
let fxParts = [], fxRunning = false;
let fxCtx;
const MAX_FX = 400;
const EMOJIS = ['💗','💕','💖','🌸','✨','🌷','💫','💝'];
const WORDS  = ['Te amo','Siempre','Para ti','Amor','💗'];

function initFxCanvas() {
  const cv = D.fxCanvas;
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
  fxCtx = cv.getContext('2d');
  window.addEventListener('resize', () => {
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
  });
}

function spawnFx(x, y, n = 10) {
  const safe = Math.min(n, 14);
  for (let i = 0; i < safe; i++) {
    if (fxParts.length >= MAX_FX) break;
    const emoji = Math.random() > .42;
    const ang   = Math.random() * Math.PI * 2;
    const spd   = Math.random() * 3 + 1.2;
    fxParts.push({
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 1.4,
      g: .045, life: 1, decay: .022,
      sz: emoji ? Math.random()*13+14 : Math.random()*4+9,
      t:  emoji
        ? EMOJIS[Math.floor(Math.random()*EMOJIS.length)]
        : WORDS[Math.floor(Math.random()*WORDS.length)],
      emoji,
      col: ['#f06292','#e91e63','#f48fb1','#ab47bc'][Math.floor(Math.random()*4)],
    });
  }
  if (!fxRunning) { fxRunning = true; requestAnimationFrame(loopFx); }
}

function loopFx() {
  const cv = D.fxCanvas;
  fxCtx.clearRect(0, 0, cv.width, cv.height);
  fxCtx.textAlign    = 'center';
  fxCtx.textBaseline = 'middle';

  for (let i = fxParts.length - 1; i >= 0; i--) {
    const p = fxParts[i];
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= p.decay;
    if (p.life <= 0) { fxParts.splice(i, 1); continue; }
    fxCtx.globalAlpha = Math.max(0, p.life);
    fxCtx.font = p.emoji
      ? `${p.sz}px sans-serif`
      : `600 ${p.sz}px 'Dancing Script',cursive`;
    fxCtx.fillStyle = p.col;
    fxCtx.fillText(p.t, p.x, p.y);
  }
  fxCtx.globalAlpha = 1;
  fxRunning = fxParts.length > 0;
  if (fxRunning) requestAnimationFrame(loopFx);
}

// Partículas en clic de fondo (durante el libro)
document.addEventListener('pointerdown', e => {
  if (S.fase !== 'book') return;
  if (e.target.closest('button, input, .player, .book-nav, .book-aux, .cover')) return;
  spawnFx(e.clientX, e.clientY, 8);
});

// ════════════════════════════════════════════
// CORAZONES FLOTANTES (siempre presentes)
// ════════════════════════════════════════════
function startHearts() {
  const pool = ['💗','💕','💖','🌸','✨','💝','🌷','💞'];
  function spawn() {
    const el = document.createElement('div');
    el.className = 'heart-float';
    el.textContent = pool[Math.floor(Math.random() * pool.length)];
    el.style.cssText = `
      left:${Math.random()*100}%;
      font-size:${Math.random()*14+12}px;
      animation-duration:${Math.random()*8+10}s;
      animation-delay:${Math.random()*2}s;
      opacity:${(Math.random()*.3+.14).toFixed(2)};
    `;
    D.heartsLayer.appendChild(el);
    setTimeout(() => el.remove(), 20000);
  }
  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 350);
  setInterval(spawn, 1100);
}

// ════════════════════════════════════════════
// CONFETI
// ════════════════════════════════════════════
function launchConfetti(n = 80) {
  const cols = ['#f06292','#f48fb1','#ce93d8','#fff176','#b2dfdb','#fce4ec'];
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'cfp';
      el.style.cssText = `
        left:${Math.random()*100}vw;
        background:${cols[Math.floor(Math.random()*cols.length)]};
        width:${Math.random()*10+5}px;
        height:${Math.random()*10+5}px;
        border-radius:${Math.random()>.5?'50%':'3px'};
        animation-duration:${Math.random()*2+1.5}s;
        animation-delay:${Math.random()*.4}s;
      `;
      D.confettiCont.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, i * 11);
  }
}

// ════════════════════════════════════════════
// TOAST NOTIFICATION
// ════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  D.toast.textContent = msg;
  D.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => D.toast.classList.remove('show'), 3200);
}
