/* ============================================================
   SCRIPT.JS — Libro Virtual Interactivo para May
   Skills activas: emil-design-eng, apple-design, impeccable,
   taste-skill, cinematic-ui, motion-and-interaction-system
   CORREGIDO PARA ANDROID — contraseña funcionando
   ============================================================ */
'use strict';

// ════════════════════════════════════════════
// ESTADO GLOBAL
// ════════════════════════════════════════════
const S = {
  digits: '',
  clics: 0,
  fase: 'code',
  bookOpen: false,
  showBack: false,
  vista: 0,
  flipping: false,
  flipDir: 0,
  swipeStartX: null,
  swipeStartY: null,
  swipeStartTime: null,
  swipeDelta: 0,
  swipePeaking: false,
  songIdx: 0,
  playing: false,
  playerOpen: false,
};

let VISTAS = [];

// ════════════════════════════════════════════
// DOM
// ════════════════════════════════════════════
const $ = id => document.getElementById(id);
let D = {};

function cacheDom() {
  D = {
    toast: $('toast'),
    confettiCont: $('confettiCont'),
    heartsLayer: $('heartsLayer'),
    glowCanvas: $('glowCanvas'),
    fxCanvas: $('fxCanvas'),
    entryScreen: $('entryScreen'),
    stepCode: $('stepCode'),
    stepCarta: $('stepCarta'),
    entryTitle: $('entryTitle'),
    entrySub: $('entrySub'),
    codePips: Array.from(document.querySelectorAll('.code-pip')),
    codeMsg: $('codeMsg'),
    numpad: $('numpad'),
    delBtn: $('delBtn'),
    okBtn: $('okBtn'),
    cartaWrap: $('cartaWrap'),
    cartaEnvelope: $('cartaEnvelope'),
    cartaFlap: document.querySelector('.carta-flap'),
    cartaTitle: $('cartaTitle'),
    cartaSub: $('cartaSub'),
    ringFg: $('ringFg'),
    ringCount: $('ringCount'),
    ringTotal: $('ringTotal'),
    cartaHito: $('cartaHito'),
    cartaClosed: $('cartaClosed'),
    cartaAbierta: $('cartaAbierta'),
    cartaOpenMsg: $('cartaOpenMsg'),
    btnSi: $('btnSi'),
    btnNo: $('btnNo'),
    bookScreen: $('bookScreen'),
    bookStage: $('bookStage'),
    book: $('book'),
    spine: $('spine'),
    groundShadow: $('groundShadow'),
    pageL: $('pageL'),
    pageLFront: $('pageLFront'),
    pageLBack: $('pageLBack'),
    pageR: $('pageR'),
    pageRInner: $('pageRInner'),
    pageRFront: $('pageRFront'),
    pageRBack: $('pageRBack'),
    flipShadow: $('flipShadow'),
    flipShine: $('flipShine'),
    coverFront: $('coverFront'),
    coverFrontImg: $('coverFrontImg'),
    coverTitle: $('coverTitle'),
    coverSubtitle: $('coverSubtitle'),
    coverHint: $('coverHint'),
    coverBack: $('coverBack'),
    coverBackImg: $('coverBackImg'),
    coverBackText: $('coverBackText'),
    coverBackSub: $('coverBackSub'),
    btnPrev: $('btnPrev'),
    btnNext: $('btnNext'),
    navFill: $('navFill'),
    navLabel: $('navLabel'),
    btnClose: $('btnClose'),
    btnRestore: $('btnRestore'),
    playerToggle: $('playerToggle'),
    playerBody: $('playerBody'),
    playerDisc: $('playerDisc'),
    playerName: $('playerName'),
    playerCur: $('playerCur'),
    playerTot: $('playerTot'),
    playerFill: $('playerFill'),
    playerKnob: $('playerKnob'),
    playerTrack: $('playerTrack'),
    pcPlay: $('pcPlay'),
    pcPrev: $('pcPrev'),
    pcNext: $('pcNext'),
    playerVol: $('playerVol'),
    audio: $('audio'),
  };
}

// ════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  cacheDom();
  applyConfig();
  buildVistas();

  var root = document.documentElement;
  root.style.setProperty('--t-flip', CONFIG.duracionVolteo + 'ms');
  root.style.setProperty('--t-open', CONFIG.duracionApertura + 'ms');
  root.style.setProperty('--t-close', CONFIG.duracionCierre + 'ms');

  initEntryCode();
  initGlowCanvas();
  initFxCanvas();
  startHearts();
  initPlayer();
});

// ════════════════════════════════════════════
// APLICAR CONFIG
// ════════════════════════════════════════════
function applyConfig() {
  D.entryTitle.textContent = CONFIG.texto_entrada_titulo || 'Un regalo para ' + CONFIG.nombrePareja;
  D.entrySub.textContent = CONFIG.texto_entrada_subtitulo || 'Ingresa tu código para abrirlo 💗';
  D.cartaTitle.textContent = CONFIG.tituloCarta;
  D.cartaSub.textContent = CONFIG.subtituloCarta;
  D.ringTotal.textContent = '/ ' + CONFIG.clicsNecesarios;
  D.cartaOpenMsg.textContent = CONFIG.mensajeDentroCarta;
  D.btnSi.textContent = CONFIG.texto_btn_si || '💗 Sí, quiero abrirla';
  D.btnNo.textContent = CONFIG.texto_btn_no || 'Espera un momento...';
  D.coverTitle.textContent = CONFIG.tituloLibro;
  D.coverSubtitle.textContent = CONFIG.subtituloLibro;
  D.coverHint.textContent = CONFIG.texto_instruccion_portada || 'Toca la portada para abrir el libro 💗';
  D.coverBackText.textContent = CONFIG.tapas.contraportada.texto;
  D.coverBackSub.textContent = CONFIG.tapas.contraportada.subtexto;
  document.title = CONFIG.tituloLibro + ' 💗';
}

// ════════════════════════════════════════════
// CONSTRUIR VISTAS
// ════════════════════════════════════════════
function buildVistas() {
  var n = CONFIG.paginas.length;
  var esPar = n % 2 === 0;
  VISTAS = [];

  VISTAS.push({ left: { type: 'portada_interior' }, right: { type: 'pagina', idx: 0 } });

  if (esPar) {
    for (var j = 1; j <= n - 2; j += 2) {
      VISTAS.push({ left: { type: 'pagina', idx: j }, right: { type: 'pagina', idx: j + 1 } });
    }
    VISTAS.push({ left: { type: 'pagina', idx: n - 1 }, right: { type: 'contraportada_exterior' } });
  } else {
    for (var k = 1; k <= n - 2; k += 2) {
      VISTAS.push({ left: { type: 'pagina', idx: k }, right: { type: 'pagina', idx: k + 1 } });
    }
    VISTAS.push({ left: { type: 'pagina', idx: n - 1 }, right: { type: 'contraportada_interior' } });
  }
}

// ════════════════════════════════════════════
// FASE 1A — CÓDIGO DE ACCESO (CORREGIDO PARA ANDROID)
// ════════════════════════════════════════════
function initEntryCode() {
  // Numpad: usar click para Android
  D.numpad.querySelectorAll('.nk[data-d]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      addDigit(this.dataset.d);
    });
  });

  D.delBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    delDigit();
  });

  D.okBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    checkCode();
  });

  // Teclado físico
  document.addEventListener('keydown', function(e) {
    if (S.fase !== 'code') return;
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      addDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      delDigit();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      checkCode();
    }
  });

  S.digits = '';
  renderPips();
  D.codeMsg.textContent = '';
}

function addDigit(d) {
  var digito = String(d).trim();
  if (!/^[0-9]$/.test(digito)) return;
  if (S.digits.length >= 6) return;

  S.digits += digito;
  renderPips();

  if (S.digits.length === 6) {
    setTimeout(function() {
      checkCode();
    }, 300);
  }
}

function delDigit() {
  if (S.digits.length > 0) {
    S.digits = S.digits.slice(0, -1);
    renderPips();
    D.codeMsg.textContent = '';
  }
}

function renderPips() {
  D.codePips.forEach(function(pip, i) {
    if (i < S.digits.length) {
      pip.classList.add('on');
    } else {
      pip.classList.remove('on');
    }
  });
}

function checkCode() {
  var ingresado = S.digits;
  var correcto = String(CONFIG.codigoAcceso).trim();

  if (ingresado === correcto) {
    D.codeMsg.style.color = '#4caf50';
    D.codeMsg.textContent = '✅ ¡Código correcto! 💗';
    S.digits = '';
    renderPips();
    setTimeout(function() {
      goToCarta();
    }, 800);
  } else {
    D.codePips.forEach(function(p) { p.classList.add('err'); });
    D.codeMsg.style.color = '#ef5350';
    D.codeMsg.textContent = '❌ Código incorrecto. Intenta de nuevo.';
    if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
    setTimeout(function() {
      D.codePips.forEach(function(p) { p.classList.remove('err'); });
      S.digits = '';
      renderPips();
      D.codeMsg.textContent = '';
    }, 1000);
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

  D.cartaEnvelope.classList.remove('pulsing');
  void D.cartaEnvelope.offsetWidth;
  D.cartaEnvelope.classList.add('pulsing');
  setTimeout(function() { D.cartaEnvelope.classList.remove('pulsing'); }, 360);

  D.ringCount.textContent = S.clics;

  var circ = 326.7;
  var offset = circ - (S.clics / CONFIG.clicsNecesarios) * circ;
  D.ringFg.style.strokeDashoffset = offset;

  var hito = CONFIG.hitos.find(function(h) { return h.clic === S.clics; });
  if (hito) {
    D.cartaHito.textContent = hito.mensaje;
    D.cartaHito.style.animation = 'none';
    void D.cartaHito.offsetWidth;
    D.cartaHito.style.animation = '';
  }

  if (S.clics % 5 === 0) {
    var r = D.cartaEnvelope.getBoundingClientRect();
    spawnFx(r.left + r.width / 2, r.top + r.height / 2, 7);
  }

  if (S.clics >= CONFIG.clicsNecesarios) abrirCarta();
}

function abrirCarta() {
  D.cartaFlap.classList.add('open');
  launchConfetti(70);
  spawnFx(window.innerWidth / 2, window.innerHeight / 2, 18);

  setTimeout(function() {
    D.cartaClosed.classList.add('hidden');
    D.cartaAbierta.classList.remove('hidden');
  }, 650);
}

function handleBtnSi() {
  D.entryScreen.classList.add('closing');
  setTimeout(function() {
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
  setBookState('closed-front');
  updateNav();
  initBookEvents();
  startMusicOnInteract();
}

function setBookState(state) {
  var book = D.book;
  book.classList.remove('closed', 'open', 'closed-back', 'opening', 'closing');

  if (state === 'closed-front') {
    S.bookOpen = false;
    S.showBack = false;
    book.classList.add('closed');
    D.coverFront.classList.remove('hidden');
    D.coverBack.classList.add('hidden');
    D.groundShadow.style.opacity = '0.5';
  } else if (state === 'open') {
    S.bookOpen = true;
    S.showBack = false;
    book.classList.add('open');
    D.coverFront.classList.add('hidden');
    D.coverBack.classList.add('hidden');
    D.groundShadow.style.opacity = '0.65';
  } else if (state === 'closed-back') {
    S.bookOpen = false;
    S.showBack = true;
    book.classList.add('closed', 'closed-back');
    D.coverFront.classList.add('hidden');
    D.coverBack.classList.remove('hidden');
    D.groundShadow.style.opacity = '0.5';
  }
}

function abrirLibro() {
  if (S.bookOpen || S.flipping) return;
  var book = D.book;
  book.classList.add('opening');
  book.addEventListener('animationend', function() {
    book.classList.remove('opening');
    setBookState('open');
    S.vista = 0;
    renderVista(0);
    updateNav();
  }, { once: true });
  launchConfetti(50);
  spawnFx(window.innerWidth / 2, window.innerHeight / 2, 12);
}

function cerrarLibro() {
  if (!S.bookOpen || S.flipping) return;
  var book = D.book;
  book.classList.add('closing');
  book.addEventListener('animationend', function() {
    book.classList.remove('closing');
    setBookState('closed-back');
    updateNav();
    showToast('Libro cerrado 💗');
  }, { once: true });
}

function restaurarInicio() {
  S.flipping = false;
  S.vista = 0;
  D.pageRInner.style.transition = 'none';
  D.pageRInner.classList.remove('flip-fwd');
  D.pageRInner.style.transform = '';
  void D.pageRInner.offsetWidth;
  D.pageRInner.style.transition = '';
  D.flipShadow.style.opacity = '0';
  D.flipShine.style.opacity = '0';
  setBookState('closed-front');
  updateNav();
}

// ════════════════════════════════════════════
// RENDERIZADO DE PÁGINAS
// ════════════════════════════════════════════
function buildPageHTML(desc) {
  if (!desc) return '<div class="pg-wrap"></div>';
  var t = CONFIG.tapas;

  switch (desc.type) {
    case 'portada_interior': {
      var cfg = t.portadaInterior;
      return '<div class="pg-wrap" style="padding:0;position:relative;overflow:hidden">' +
        '<img src="' + cfg.imagen + '" alt="Portada interior" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<div class="tapa-wrap" style="display:none;position:relative;z-index:1">' +
        '<div class="tapa-ornament">🌸</div>' +
        '<div class="tapa-overlay">' +
        '<div class="tapa-text">' + cfg.textoDefault + '</div>' +
        '<div class="tapa-sub">' + cfg.subDefault + '</div>' +
        '</div></div></div>';
    }
    case 'contraportada_interior': {
      var cfg2 = t.contraportadaInterior;
      return '<div class="pg-wrap" style="padding:0;position:relative;overflow:hidden">' +
        '<img src="' + cfg2.imagen + '" alt="Contraportada interior" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<div class="tapa-wrap" style="display:none;position:relative;z-index:1">' +
        '<div class="tapa-ornament">💗</div>' +
        '<div class="tapa-overlay">' +
        '<div class="tapa-text">' + cfg2.textoDefault + '</div>' +
        '<div class="tapa-sub">' + cfg2.subDefault + '</div>' +
        '</div></div></div>';
    }
    case 'contraportada_exterior': {
      var cfg3 = t.contraportada;
      return '<div class="pg-wrap" style="padding:0;position:relative;overflow:hidden">' +
        '<img src="' + cfg3.imagen + '" alt="Contraportada" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<div class="tapa-wrap" style="display:none;position:relative;z-index:1">' +
        '<div class="tapa-ornament">💕</div>' +
        '<div class="tapa-overlay">' +
        '<div class="tapa-text">' + cfg3.texto + '</div>' +
        '<div class="tapa-sub">' + cfg3.subtexto + '</div>' +
        '</div></div></div>';
    }
    case 'pagina': {
      var pag = CONFIG.paginas[desc.idx];
      if (!pag) return '<div class="pg-wrap"></div>';
      return '<div class="pg-wrap">' +
        '<div class="pg-img-box">' +
        '<img class="pg-img" src="' + pag.imagen + '" alt="Página ' + (desc.idx + 1) + '" loading="lazy" onerror="this.style.background=\'var(--r0)\';this.removeAttribute(\'src\')">' +
        '</div>' +
        '<p class="pg-frase">' + (pag.frase || '') + '</p>' +
        '</div>';
    }
    default:
      return '<div class="pg-wrap"></div>';
  }
}

function renderVista(vistaIdx) {
  if (vistaIdx < 0 || vistaIdx >= VISTAS.length) return;
  var v = VISTAS[vistaIdx];
  D.pageLFront.innerHTML = buildPageHTML(v.left);
  D.pageRFront.innerHTML = buildPageHTML(v.right);
  preRenderNext(vistaIdx);
}

function preRenderNext(vistaIdx) {
  var next = VISTAS[vistaIdx + 1];
  if (next) {
    D.pageRBack.innerHTML = buildPageHTML(next.right);
    D.pageLBack.innerHTML = buildPageHTML(next.left);
  } else {
    D.pageRBack.innerHTML = '';
    D.pageLBack.innerHTML = '';
  }
}

// ════════════════════════════════════════════
// VOLTEO CON CURVATURA 3D
// ════════════════════════════════════════════
function voltearAdelante() {
  if (S.flipping) return;
  if (S.vista >= VISTAS.length - 1) { cerrarLibro(); return; }
  S.flipping = true;
  S.flipDir = 1;

  preRenderNext(S.vista);
  animateCurvatura('fwd');
  D.pageRInner.classList.add('flip-fwd');

  D.pageRInner.addEventListener('transitionend', function() {
    S.vista++;
    renderVista(S.vista);
    D.pageRInner.style.transition = 'none';
    D.pageRInner.classList.remove('flip-fwd');
    D.pageRInner.style.transform = '';
    void D.pageRInner.offsetWidth;
    D.pageRInner.style.transition = '';
    D.flipShadow.style.opacity = '0';
    D.flipShine.style.opacity = '0';
    S.flipping = false;
    updateNav();
  }, { once: true });

  updateNav();
}

function voltearAtras() {
  if (S.flipping) return;
  if (S.vista <= 0) return;
  S.flipping = true;
  S.flipDir = -1;

  var prev = VISTAS[S.vista - 1];
  D.pageRBack.innerHTML = prev ? buildPageHTML(prev.right) : '';
  D.pageLBack.innerHTML = prev ? buildPageHTML(prev.left) : '';

  D.pageRInner.style.transition = 'none';
  D.pageRInner.style.transform = 'rotateY(-180deg)';
  void D.pageRInner.offsetWidth;
  D.pageRInner.style.transition = '';

  animateCurvatura('back');

  D.pageRInner.addEventListener('transitionend', function() {
    S.vista--;
    renderVista(S.vista);
    D.pageRInner.style.transition = 'none';
    D.pageRInner.style.transform = '';
    void D.pageRInner.offsetWidth;
    D.pageRInner.style.transition = '';
    D.flipShadow.style.opacity = '0';
    D.flipShine.style.opacity = '0';
    S.flipping = false;
    updateNav();
  }, { once: true });

  updateNav();
}

function animateCurvatura(dir) {
  var dur = CONFIG.duracionVolteo;
  var start = performance.now();

  function frame(now) {
    var t = Math.min(1, (now - start) / dur);
    var curvature = Math.sin(t * Math.PI);
    D.flipShadow.style.opacity = (curvature * 0.65).toFixed(3);
    D.flipShine.style.opacity = (curvature * 0.55).toFixed(3);

    var pos = dir === 'fwd' ? 30 + t * 40 : 70 - t * 40;
    D.flipShine.style.background = 'linear-gradient(90deg, ' +
      'transparent ' + (pos - 12) + '%, ' +
      'rgba(255,255,255,0.32) ' + pos + '%, ' +
      'rgba(255,255,255,0.10) ' + (pos + 8) + '%, ' +
      'transparent ' + (pos + 20) + '%)';

    if (t < 1 && S.flipping) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ════════════════════════════════════════════
// SWIPE CON FÍSICA (Apple design)
// ════════════════════════════════════════════
function initSwipe() {
  var target = D.bookStage;

  target.addEventListener('pointerdown', onSwipeStart, { passive: true });
  target.addEventListener('pointermove', onSwipeMove, { passive: true });
  target.addEventListener('pointerup', onSwipeEnd, { passive: true });
  target.addEventListener('pointercancel', resetSwipe, { passive: true });
}

function onSwipeStart(e) {
  if (!S.bookOpen) return;
  S.swipeStartX = e.clientX;
  S.swipeStartY = e.clientY;
  S.swipeStartTime = performance.now();
  S.swipeDelta = 0;
  S.swipePeaking = false;
}

function onSwipeMove(e) {
  if (S.swipeStartX === null) return;

  var dx = e.clientX - S.swipeStartX;
  var dy = e.clientY - S.swipeStartY;

  if (Math.abs(dy) > Math.abs(dx) * 1.4) { resetSwipe(); return; }

  S.swipeDelta = dx;

  var maxDx = D.pageR.offsetWidth || 280;
  var ratio = Math.max(-1, Math.min(1, dx / maxDx));
  var degrees = ratio * 180;
  var absRatio = Math.abs(ratio);
  var rubberDeg = absRatio > 0.85
    ? Math.sign(degrees) * (153 + (absRatio - 0.85) * 200)
    : degrees;

  if (S.flipping) return;

  D.pageRInner.style.transition = 'none';

  if (dx < 0) {
    if (S.vista < VISTAS.length - 1) {
      D.pageRInner.style.transform = 'rotateY(' + Math.max(-180, rubberDeg) + 'deg)';
      var prog = Math.min(1, Math.abs(ratio) * 2);
      var curve = Math.sin(prog * Math.PI);
      D.flipShadow.style.opacity = (curve * 0.6).toFixed(3);
      D.flipShine.style.opacity = (curve * 0.5).toFixed(3);
      S.swipePeaking = Math.abs(dx) > maxDx * 0.3;
    }
  } else if (dx > 0) {
    if (S.vista > 0) {
      var backDeg = Math.min(0, -180 + Math.min(180, Math.abs(rubberDeg)));
      D.pageRInner.style.transform = 'rotateY(' + backDeg + 'deg)';
      var prog2 = Math.min(1, Math.abs(ratio) * 2);
      var curve2 = Math.sin(prog2 * Math.PI);
      D.flipShadow.style.opacity = (curve2 * 0.5).toFixed(3);
      D.flipShine.style.opacity = (curve2 * 0.45).toFixed(3);
    }
  }
}

function onSwipeEnd(e) {
  if (S.swipeStartX === null) return;

  var dx = e.clientX - S.swipeStartX;
  var dt = performance.now() - S.swipeStartTime;
  var vel = dt > 0 ? Math.abs(dx) / dt : 0;

  var maxDx = D.pageR.offsetWidth || 280;
  var threshold = maxDx * 0.28;
  var velThresh = 0.28;

  D.pageRInner.style.transition = '';

  if (!S.flipping) {
    if (dx < -threshold || (dx < -30 && vel > velThresh)) {
      voltearAdelante();
    } else if (dx > threshold || (dx > 30 && vel > velThresh)) {
      voltearAtras();
    } else {
      snapBack();
    }
  }

  resetSwipe();
}

function resetSwipe() {
  S.swipeStartX = null;
  S.swipeStartY = null;
  S.swipeDelta = 0;
  S.swipePeaking = false;
}

function snapBack() {
  D.pageRInner.style.transition = 'transform 260ms cubic-bezier(0.23,1,0.32,1)';
  D.pageRInner.style.transform = 'rotateY(0deg)';
  D.flipShadow.style.opacity = '0';
  D.flipShine.style.opacity = '0';
  D.pageRInner.addEventListener('transitionend', function() {
    D.pageRInner.style.transition = '';
    D.pageRInner.style.transform = '';
  }, { once: true });
}

// ════════════════════════════════════════════
// BOTONES DE NAVEGACIÓN
// ════════════════════════════════════════════
function initBookEvents() {
  D.coverFront.addEventListener('click', function() { if (!S.bookOpen) abrirLibro(); });

  D.btnNext.addEventListener('click', function() {
    if (!S.bookOpen) { abrirLibro(); return; }
    voltearAdelante();
  });

  D.btnPrev.addEventListener('click', function() {
    if (!S.bookOpen) return;
    if (S.vista === 0) { cerrarLibro(); return; }
    voltearAtras();
  });

  D.btnClose.addEventListener('click', function() { if (S.bookOpen) cerrarLibro(); });
  D.btnRestore.addEventListener('click', restaurarInicio);

  initSwipe();

  document.addEventListener('keydown', function(e) {
    if (S.fase !== 'book') return;
    if (e.key === 'ArrowRight') D.btnNext.click();
    if (e.key === 'ArrowLeft') D.btnPrev.click();
  });
}

function updateNav() {
  var total = VISTAS.length;
  var actual = S.vista + 1;

  if (!S.bookOpen) {
    D.navLabel.textContent = S.showBack ? 'Contraportada' : 'Portada';
  } else {
    D.navLabel.textContent = 'Vista ' + actual + ' de ' + total;
  }

  var pct = S.bookOpen ? (actual / total) * 100 : (S.showBack ? 100 : 0);
  D.navFill.style.width = pct + '%';

  D.btnPrev.disabled = S.flipping || (!S.bookOpen);
  D.btnNext.disabled = S.flipping;

  D.btnClose.style.opacity = S.bookOpen ? '1' : '0.35';
  D.btnClose.style.pointerEvents = S.bookOpen ? 'auto' : 'none';
}

// ════════════════════════════════════════════
// REPRODUCTOR DE MÚSICA
// ════════════════════════════════════════════
function initPlayer() {
  D.playerToggle.addEventListener('click', function(e) { e.stopPropagation(); togglePlayer(); });
  D.pcPlay.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });
  D.pcPrev.addEventListener('click', function(e) { e.stopPropagation(); changeSong(-1); });
  D.pcNext.addEventListener('click', function(e) { e.stopPropagation(); changeSong(1); });

  D.playerTrack.addEventListener('click', function(e) {
    if (!D.audio.duration) return;
    var r = D.playerTrack.getBoundingClientRect();
    D.audio.currentTime = ((e.clientX - r.left) / r.width) * D.audio.duration;
  });

  D.playerVol.addEventListener('input', function(e) {
    D.audio.volume = +e.target.value;
    var p = +e.target.value * 100;
    e.target.style.background = 'linear-gradient(90deg,var(--r4) ' + p + '%,var(--r1) ' + p + '%)';
  });

  D.audio.addEventListener('timeupdate', updateProgress);
  D.audio.addEventListener('play', function() {
    S.playing = true;
    D.pcPlay.textContent = '⏸';
    D.playerDisc.classList.add('playing');
  });
  D.audio.addEventListener('pause', function() {
    S.playing = false;
    D.pcPlay.textContent = '▶';
    D.playerDisc.classList.remove('playing');
  });
  D.audio.addEventListener('ended', function() { changeSong(1); });
  D.audio.volume = 0.7;

  D.playerBody.classList.add('mini');
  loadSong(0, false);
}

function startMusicOnInteract() {
  var go = function() {
    D.audio.play().catch(function() {});
    document.removeEventListener('pointerdown', go);
  };
  document.addEventListener('pointerdown', go, { once: true });
}

function loadSong(idx, autoplay) {
  S.songIdx = ((idx % CONFIG.playlist.length) + CONFIG.playlist.length) % CONFIG.playlist.length;
  var song = CONFIG.playlist[S.songIdx];
  D.audio.src = song.archivo;
  D.playerName.textContent = song.nombre;
  if (autoplay) D.audio.play().catch(function() {});
}

function togglePlay() {
  S.playing ? D.audio.pause() : D.audio.play().catch(function() {});
}

function changeSong(d) {
  loadSong(S.songIdx + d, true);
}

function togglePlayer() {
  S.playerOpen = !S.playerOpen;
  D.playerBody.classList.toggle('mini', !S.playerOpen);
}

function updateProgress() {
  if (!D.audio.duration) return;
  var pct = D.audio.currentTime / D.audio.duration * 100;
  D.playerFill.style.width = pct + '%';
  D.playerKnob.style.left = pct + '%';
  D.playerCur.textContent = fmt(D.audio.currentTime);
  D.playerTot.textContent = fmt(D.audio.duration);
}

function fmt(s) {
  if (isNaN(s)) return '0:00';
  var m = Math.floor(s / 60),
    ss = Math.floor(s % 60);
  return m + ':' + (ss < 10 ? '0' : '') + ss;
}

// ════════════════════════════════════════════
// CANVAS DE BRILLO DE FONDO
// ════════════════════════════════════════════
var glowParts = [],
  glowCtx;

function initGlowCanvas() {
  var cv = D.glowCanvas;
  glowCtx = cv.getContext('2d');
  resizeGlow();
  window.addEventListener('resize', resizeGlow);
  spawnGlow();
  requestAnimationFrame(loopGlow);
}

function resizeGlow() {
  var cv = D.glowCanvas;
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
}

function spawnGlow() {
  glowParts = [];
  var n = Math.min(55, Math.floor(window.innerWidth * window.innerHeight / 15000));
  var cols = ['rgba(240,98,146,', 'rgba(213,0,99,', 'rgba(244,143,177,', 'rgba(229,115,115,'];
  for (var i = 0; i < n; i++) {
    glowParts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3.5 + 1,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22,
      col: cols[Math.floor(Math.random() * cols.length)],
      a: Math.random() * .42 + .07,
      tw: Math.random() * Math.PI * 2,
      ts: Math.random() * .022 + .008,
    });
  }
}

function loopGlow() {
  var cv = D.glowCanvas;
  glowCtx.clearRect(0, 0, cv.width, cv.height);
  glowParts.forEach(function(p) {
    p.x += p.vx;
    p.y += p.vy;
    p.tw += p.ts;
    if (p.x < -10) p.x = cv.width + 10;
    if (p.x > cv.width + 10) p.x = -10;
    if (p.y < -10) p.y = cv.height + 10;
    if (p.y > cv.height + 10) p.y = -10;
    var alpha = p.a * (.6 + Math.sin(p.tw) * .4);
    var g = glowCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
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
// ════════════════════════════════════════════
var fxParts = [],
  fxRunning = false;
var fxCtx;
var MAX_FX = 400;
var EMOJIS = ['💗', '💕', '💖', '🌸', '✨', '🌷', '💫', '💝'];
var WORDS = ['Te amo', 'Siempre', 'Para ti', 'Amor', '💗'];

function initFxCanvas() {
  var cv = D.fxCanvas;
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  fxCtx = cv.getContext('2d');
  window.addEventListener('resize', function() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  });
}

function spawnFx(x, y, n) {
  var safe = Math.min(n || 10, 14);
  for (var i = 0; i < safe; i++) {
    if (fxParts.length >= MAX_FX) break;
    var emoji = Math.random() > .42;
    var ang = Math.random() * Math.PI * 2;
    var spd = Math.random() * 3 + 1.2;
    fxParts.push({
      x: x,
      y: y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 1.4,
      g: .045,
      life: 1,
      decay: .022,
      sz: emoji ? Math.random() * 13 + 14 : Math.random() * 4 + 9,
      t: emoji ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : WORDS[Math.floor(Math.random() * WORDS.length)],
      emoji: emoji,
      col: ['#f06292', '#e91e63', '#f48fb1', '#ab47bc'][Math.floor(Math.random() * 4)],
    });
  }
  if (!fxRunning) { fxRunning = true;
    requestAnimationFrame(loopFx); }
}

function loopFx() {
  var cv = D.fxCanvas;
  fxCtx.clearRect(0, 0, cv.width, cv.height);
  fxCtx.textAlign = 'center';
  fxCtx.textBaseline = 'middle';

  for (var i = fxParts.length - 1; i >= 0; i--) {
    var p = fxParts[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.life -= p.decay;
    if (p.life <= 0) { fxParts.splice(i, 1); continue; }
    fxCtx.globalAlpha = Math.max(0, p.life);
    fxCtx.font = p.emoji ? p.sz + 'px sans-serif' : '600 ' + p.sz + 'px \'Dancing Script\',cursive';
    fxCtx.fillStyle = p.col;
    fxCtx.fillText(p.t, p.x, p.y);
  }
  fxCtx.globalAlpha = 1;
  fxRunning = fxParts.length > 0;
  if (fxRunning) requestAnimationFrame(loopFx);
}

document.addEventListener('pointerdown', function(e) {
  if (S.fase !== 'book') return;
  if (e.target.closest('button, input, .player, .book-nav, .book-aux, .cover')) return;
  spawnFx(e.clientX, e.clientY, 8);
});

// ════════════════════════════════════════════
// CORAZONES FLOTANTES
// ════════════════════════════════════════════
function startHearts() {
  var pool = ['💗', '💕', '💖', '🌸', '✨', '💝', '🌷', '💞'];

  function spawn() {
    var el = document.createElement('div');
    el.className = 'heart-float';
    el.textContent = pool[Math.floor(Math.random() * pool.length)];
    el.style.cssText =
      'left:' + Math.random() * 100 + '%;' +
      'font-size:' + (Math.random() * 14 + 12) + 'px;' +
      'animation-duration:' + (Math.random() * 8 + 10) + 's;' +
      'animation-delay:' + (Math.random() * 2) + 's;' +
      'opacity:' + ((Math.random() * .3 + .14).toFixed(2)) + ';';
    D.heartsLayer.appendChild(el);
    setTimeout(function() { el.remove(); }, 20000);
  }
  for (var i = 0; i < 8; i++) setTimeout(spawn, i * 350);
  setInterval(spawn, 1100);
}

// ════════════════════════════════════════════
// CONFETI
// ════════════════════════════════════════════
function launchConfetti(n) {
  var cols = ['#f06292', '#f48fb1', '#ce93d8', '#fff176', '#b2dfdb', '#fce4ec'];
  for (var i = 0; i < (n || 80); i++) {
    setTimeout(function() {
      var el = document.createElement('div');
      el.className = 'cfp';
      el.style.cssText =
        'left:' + Math.random() * 100 + 'vw;' +
        'background:' + cols[Math.floor(Math.random() * cols.length)] + ';' +
        'width:' + (Math.random() * 10 + 5) + 'px;' +
        'height:' + (Math.random() * 10 + 5) + 'px;' +
        'border-radius:' + (Math.random() > .5 ? '50%' : '3px') + ';' +
        'animation-duration:' + (Math.random() * 2 + 1.5) + 's;' +
        'animation-delay:' + (Math.random() * .4) + 's;';
      D.confettiCont.appendChild(el);
      setTimeout(function() { el.remove(); }, 3500);
    }, i * 11);
  }
}

// ════════════════════════════════════════════
// TOAST NOTIFICATION
// ════════════════════════════════════════════
var toastTimer;

function showToast(msg) {
  D.toast.textContent = msg;
  D.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { D.toast.classList.remove('show'); }, 3200);
}
