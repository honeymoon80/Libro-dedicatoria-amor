/* ============================================================
   SCRIPT.JS — Libro Virtual Interactivo 10/10
   Skills: emil-design-eng, apple-design, impeccable,
   taste-skill, cinematic-ui, motion-and-interaction
   ============================================================ */
'use strict';

// ═══════════ ESTADO GLOBAL ═══════════
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

// ═══════════ DOM ═══════════
const $ = id => document.getElementById(id);
let D = {};

function cacheDom() {
  D = {
    toast: $('toast'),
    confettiCont: $('confettiCont'),
    heartsLayer: $('heartsLayer'),
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
    bookShadow: $('bookShadow'),
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

// ═══════════ CONFIGURACIÓN ═══════════
function applyConfig() {
  D.entryTitle.textContent = 'Un regalo especial para ti';
  D.entrySub.textContent = 'Ingresa tu codigo para abrir este regalo';
  D.cartaTitle.textContent = CONFIG.tituloCarta;
  D.cartaSub.textContent = CONFIG.subtituloCarta;
  D.ringTotal.textContent = '/ ' + CONFIG.clicsNecesarios;
  D.cartaOpenMsg.textContent = CONFIG.mensajeDentroCarta;
  D.btnSi.textContent = 'Si, quiero abrirla';
  D.btnNo.textContent = 'Espera un momento...';
  D.coverTitle.textContent = CONFIG.tituloLibro;
  D.coverSubtitle.textContent = CONFIG.subtituloLibro;
  D.coverHint.textContent = 'Toca la portada para abrir el libro';
  D.coverBackText.textContent = CONFIG.tapas.contraportada.texto;
  D.coverBackSub.textContent = CONFIG.tapas.contraportada.subtexto;
  document.title = CONFIG.tituloLibro + ' 💗';
}

// ═══════════ CONSTRUIR VISTAS ═══════════
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

// ═══════════ FASE 1A — CÓDIGO DE ACCESO ═══════════
function initEntryCode() {
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
    setTimeout(function() { checkCode(); }, 300);
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
    pip.classList.toggle('on', i < S.digits.length);
  });
}

function checkCode() {
  var ingresado = S.digits;
  var correcto = String(CONFIG.codigoAcceso).trim();

  if (ingresado === correcto) {
    D.codeMsg.style.color = '#4caf50';
    D.codeMsg.textContent = 'Codigo correcto. Abriendo tu regalo...';
    S.digits = '';
    renderPips();
    setTimeout(function() { goToCarta(); }, 800);
  } else {
    D.codePips.forEach(function(p) { p.classList.add('err'); });
    D.codeMsg.style.color = '#ef5350';
    D.codeMsg.textContent = 'Codigo incorrecto. Intentalo de nuevo.';
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

// ═══════════ FASE 1B — RITUAL DE CLICS ═══════════
function initCartaEvents() {
  D.cartaEnvelope.addEventListener('pointerdown', handleCartaClick);
  D.btnSi.addEventListener('click', handleBtnSi);
  D.btnNo.addEventListener('click', handleBtnNo);
}

function handleCartaClick() {
  if (!D.cartaClosed.classList.contains('hidden')) {
    incrementarClic();
  }
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

  if (S.clics >= CONFIG.clicsNecesarios) {
    abrirCarta();
  }
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
  showToast('Cuando estes lista, aqui estare esperandote');
}

// ═══════════ FASE 2 — LIBRO VIRTUAL ═══════════
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
    D.bookShadow.style.opacity = '0.5';
  } else if (state === 'open') {
    S.bookOpen = true;
    S.showBack = false;
    book.classList.add('open');
    D.coverFront.classList.add('hidden');
    D.coverBack.classList.add('hidden');
    D.bookShadow.style.opacity = '0.65';
  } else if (state === 'closed-back') {
    S.bookOpen = false;
    S.showBack = true;
    book.classList.add('closed', 'closed-back');
    D.coverFront.classList.add('hidden');
    D.coverBack.classList.remove('hidden');
    D.bookShadow.style.opacity = '0.5';
  }
}

// ═══════════ DESTELLO DE LUZ (cinematic-ui 10/10) ═══════════
function triggerFlash() {
  var flash = document.createElement('div');
  flash.className = 'book-flash';
  document.body.appendChild(flash);
  setTimeout(function() {
    flash.remove();
  }, 1300);
}

// ═══════════ APERTURA Y CIERRE (10/10) ═══════════
function abrirLibro() {
  if (S.bookOpen || S.flipping) return;
  var book = D.book;

  // Destello de luz (cinematic-ui 10/10)
  triggerFlash();

  book.classList.add('opening');
  book.addEventListener('animationend', function() {
    book.classList.remove('opening');
    setBookState('open');
    S.vista = 0;
    renderVista(0);
    // Stagger en páginas
    document.querySelectorAll('.page').forEach(function(p, i) {
      p.classList.add('page-enter');
      p.style.animationDelay = (i * 80) + 'ms';
    });
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
    showToast('Libro cerrado');
  }, { once: true });
}

function restaurarInicio() {
  S.flipping = false;
  S.vista = 0;
  D.pageRInner.style.transition = 'none';
  D.pageRInner.classList.remove('flip-fwd');
  D.pageRInner.style.transform = '';
  D.pageRInner.style.clipPath = '';
  void D.pageRInner.offsetWidth;
  D.pageRInner.style.transition = '';
  D.flipShadow.style.opacity = '0';
  D.flipShine.style.opacity = '0';
  setBookState('closed-front');
  updateNav();
}

// ═══════════ RENDERIZADO DE PÁGINAS ═══════════
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
        '<img class="pg-img" src="' + pag.imagen + '" alt="Pagina ' + (desc.idx + 1) + '" loading="lazy" onerror="this.style.background=\'var(--r0)\';this.removeAttribute(\'src\')">' +
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

  // Stagger en páginas
  var pages = document.querySelectorAll('.page');
  pages.forEach(function(p, i) {
    p.classList.remove('page-enter');
    void p.offsetWidth;
    p.classList.add('page-enter');
    p.style.animationDelay = (i * 80) + 'ms';
  });
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

// ═══════════ RUBBER-BANDING FÍSICO (10/10) ═══════════
function rubberband(overshoot, dimension, constant) {
  constant = constant || 0.55;
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

// ═══════════ VOLTEO CON CURVATURA 3D REAL (10/10) ═══════════
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
    D.pageRInner.style.clipPath = '';
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
  D.pageRInner.style.transform = 'perspective(1200px) rotateY(-180deg)';
  D.pageRInner.style.clipPath = 'polygon(0 0, 98% 0, 95% 100%, 0 100%)';
  void D.pageRInner.offsetWidth;
  D.pageRInner.style.transition = '';

  animateCurvatura('back');

  D.pageRInner.addEventListener('transitionend', function() {
    S.vista--;
    renderVista(S.vista);
    D.pageRInner.style.transition = 'none';
    D.pageRInner.style.transform = '';
    D.pageRInner.style.clipPath = '';
    void D.pageRInner.offsetWidth;
    D.pageRInner.style.transition = '';
    D.flipShadow.style.opacity = '0';
    D.flipShine.style.opacity = '0';
    S.flipping = false;
    updateNav();
  }, { once: true });

  updateNav();
}

// ═══════════ CURVATURA CON LUZ Y SOMBRA (10/10) ═══════════
function animateCurvatura(dir) {
  var dur = CONFIG.tiempos.volteo || 600;
  var start = performance.now();

  function frame(now) {
    var t = Math.min(1, (now - start) / dur);
    var curvature = Math.sin(t * Math.PI);

    // Sombra más profunda
    D.flipShadow.style.opacity = (curvature * 0.8).toFixed(3);
    D.flipShadow.style.background =
      'linear-gradient(90deg, ' +
      'rgba(0,0,0,0.35) 0%, ' +
      'rgba(0,0,0,0.15) 20%, ' +
      'rgba(0,0,0,0.05) 40%, ' +
      'transparent 60%)';

    // Brillo más intenso
    var shine = Math.sin(t * Math.PI * 1.2) * 0.7 + 0.3;
    D.flipShine.style.opacity = (shine * 0.7).toFixed(3);
    var pos = dir === 'fwd' ? 15 + t * 70 : 85 - t * 70;
    D.flipShine.style.background =
      'linear-gradient(90deg, ' +
      'transparent ' + (pos - 20) + '%, ' +
      'rgba(255,255,255,0.5) ' + pos + '%, ' +
      'rgba(255,255,255,0.15) ' + (pos + 15) + '%, ' +
      'transparent ' + (pos + 35) + '%)';

    if (t < 1 && S.flipping) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ═══════════ SWIPE CON FÍSICA E INTERRUPCIÓN (10/10) ═══════════
function initSwipe() {
  var target = D.bookStage;
  target.addEventListener('pointerdown', onSwipeStart, { passive: true });
  target.addEventListener('pointermove', onSwipeMove, { passive: true });
  target.addEventListener('pointerup', onSwipeEnd, { passive: true });
  target.addEventListener('pointercancel', resetSwipe, { passive: true });
}

function onSwipeStart(e) {
  // INTERRUPCIÓN REAL: si está en vuelo, cancelar y seguir al dedo
  if (S.flipping) {
    S.flipping = false;
    var currentTransform = window.getComputedStyle(D.pageRInner).transform;
    D.pageRInner.style.transition = 'none';
  }
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

  // RUBBER-BANDING REAL
  var overshoot = 0;
  if (dx < 0 && S.vista >= VISTAS.length - 1) {
    overshoot = -rubberband(Math.abs(dx), maxDx, 0.5);
  } else if (dx > 0 && S.vista <= 0) {
    overshoot = rubberband(Math.abs(dx), maxDx, 0.5);
  }

  var effectiveDx = dx + overshoot;
  var degrees = (effectiveDx / maxDx) * 180;

  D.pageRInner.style.transition = 'none';

  if (dx < 0 && S.vista < VISTAS.length - 1) {
    // Avanzar
    D.pageRInner.style.transform = 'perspective(1200px) rotateY(' + Math.max(-180, degrees) + 'deg)';
    D.pageRInner.style.clipPath = 'polygon(0 0, ' + (98 - Math.abs(ratio) * 30) + '% 0, ' + (95 - Math.abs(ratio) * 25) + '% 100%, 0 100%)';
    var prog = Math.min(1, Math.abs(ratio) * 2);
    var curve = Math.sin(prog * Math.PI);
    D.flipShadow.style.opacity = (curve * 0.7).toFixed(3);
    D.flipShine.style.opacity = (curve * 0.6).toFixed(3);
    var pos = 30 + prog * 40;
    D.flipShine.style.left = pos + '%';
    D.flipShine.style.opacity = (curve * 0.55).toFixed(3);
    S.swipePeaking = Math.abs(dx) > maxDx * 0.3;
  } else if (dx > 0 && S.vista > 0) {
    // Retroceder
    var backDeg = Math.min(0, -180 + Math.min(180, Math.abs(degrees)));
    D.pageRInner.style.transform = 'perspective(1200px) rotateY(' + backDeg + 'deg)';
    D.pageRInner.style.clipPath = 'polygon(0 0, ' + (2 + Math.abs(ratio) * 30) + '% 0, ' + (5 + Math.abs(ratio) * 25) + '% 100%, 0 100%)';
    var prog2 = Math.min(1, Math.abs(ratio) * 2);
    var curve2 = Math.sin(prog2 * Math.PI);
    D.flipShadow.style.opacity = (curve2 * 0.6).toFixed(3);
    D.flipShine.style.opacity = (curve2 * 0.5).toFixed(3);
    var pos2 = 70 - prog2 * 40;
    D.flipShine.style.left = pos2 + '%';
    D.flipShine.style.opacity = (curve2 * 0.5).toFixed(3);
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
  D.pageRInner.style.transition = 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), clip-path 260ms cubic-bezier(0.34, 1.56, 0.64, 1)';
  D.pageRInner.style.transform = 'rotateY(0deg)';
  D.pageRInner.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
  D.flipShadow.style.opacity = '0';
  D.flipShine.style.opacity = '0';
  D.pageRInner.addEventListener('transitionend', function() {
    D.pageRInner.style.transition = '';
    D.pageRInner.style.transform = '';
    D.pageRInner.style.clipPath = '';
  }, { once: true });
}

// ═══════════ BOTONES DE NAVEGACIÓN ═══════════
function initBookEvents() {
  D.coverFront.addEventListener('click', function() {
    if (!S.bookOpen) abrirLibro();
  });

  D.btnNext.addEventListener('click', function() {
    if (!S.bookOpen) { abrirLibro(); return; }
    voltearAdelante();
  });

  D.btnPrev.addEventListener('click', function() {
    if (!S.bookOpen) return;
    if (S.vista === 0) { cerrarLibro(); return; }
    voltearAtras();
  });

  D.btnClose.addEventListener('click', function() {
    if (S.bookOpen) cerrarLibro();
  });

  D.btnRestore.addEventListener('click', restaurarInicio);

  initSwipe();

  document.addEventListener('keydown', function(e) {
    if (S.fase !== 'book') return;
    if (e.key === 'ArrowRight') D.btnNext.click();
    if (e.key === 'ArrowLeft') D.btnPrev.click();
  });
}

// ═══════════ NAVEGACIÓN — UI ═══════════
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

// ═══════════ REPRODUCTOR DE MÚSICA ═══════════
function initPlayer() {
  D.playerToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    togglePlayer();
  });

  D.pcPlay.addEventListener('click', function(e) {
    e.stopPropagation();
    togglePlay();
  });

  D.pcPrev.addEventListener('click', function(e) {
    e.stopPropagation();
    changeSong(-1);
  });

  D.pcNext.addEventListener('click', function(e) {
    e.stopPropagation();
    changeSong(1);
  });

  D.playerTrack.addEventListener('click', function(e) {
    if (!D.audio.duration) return;
    var r = D.playerTrack.getBoundingClientRect();
    D.audio.currentTime = ((e.clientX - r.left) / r.width) * D.audio.duration;
  });

  D.playerVol.addEventListener('input', function(e) {
    D.audio.volume = +e.target.value;
    var p = +e.target.value * 100;
    e.target.style.background = 'linear-gradient(90deg, var(--r4) ' + p + '%, var(--r1) ' + p + '%)';
  });

  D.audio.addEventListener('timeupdate', updatePlayerProgress);
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

function updatePlayerProgress() {
  if (!D.audio.duration) return;
  var pct = D.audio.currentTime / D.audio.duration * 100;
  D.playerFill.style.width = pct + '%';
  D.playerKnob.style.left = pct + '%';
  D.playerCur.textContent = fmt(D.audio.currentTime);
  D.playerTot.textContent = fmt(D.audio.duration);
}

function fmt(s) {
  if (isNaN(s)) return '0:00';
  var m = Math.floor(s / 60);
  var ss = Math.floor(s % 60);
  return m + ':' + (ss < 10 ? '0' : '') + ss;
}

// ═══════════ EFECTOS VISUALES ═══════════
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
      'opacity:' + ((Math.random() * 0.3 + 0.14).toFixed(2)) + ';';
    D.heartsLayer.appendChild(el);
    setTimeout(function() { el.remove(); }, 20000);
  }
  for (var i = 0; i < 8; i++) setTimeout(spawn, i * 350);
  setInterval(spawn, 1100);
}

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
        'border-radius:' + (Math.random() > 0.5 ? '50%' : '3px') + ';' +
        'animation-duration:' + (Math.random() * 2 + 1.5) + 's;' +
        'animation-delay:' + (Math.random() * 0.4) + 's;';
      D.confettiCont.appendChild(el);
      setTimeout(function() { el.remove(); }, 3500);
    }, i * 11);
  }
}

var fxParts = [];
var fxRunning = false;
var fxCtx;
var MAX_FX = 400;
var EMOJIS = ['💗', '💕', '💖', '🌸', '✨', '🌷', '💫', '💝'];
var WORDS = ['Te amo', 'Siempre', 'Para ti', 'Amor', '💗'];

function initFxCanvas() {
  var cv = document.createElement('canvas');
  cv.id = 'fxCanvas';
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9000;';
  document.body.appendChild(cv);
  fxCtx = cv.getContext('2d');
  resizeFxCanvas();
  window.addEventListener('resize', resizeFxCanvas);
}

function resizeFxCanvas() {
  var cv = document.getElementById('fxCanvas');
  if (cv) { cv.width = window.innerWidth;
    cv.height = window.innerHeight; }
}

function spawnFx(x, y, n) {
  var safe = Math.min(n || 10, 14);
  for (var i = 0; i < safe; i++) {
    if (fxParts.length >= MAX_FX) break;
    var emoji = Math.random() > 0.42;
    var ang = Math.random() * Math.PI * 2;
    var spd = Math.random() * 3 + 1.2;
    fxParts.push({
      x: x,
      y: y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 1.4,
      g: 0.045,
      life: 1,
      decay: 0.022,
      sz: emoji ? Math.random() * 13 + 14 : Math.random() * 4 + 9,
      t: emoji ?
        EMOJIS[Math.floor(Math.random() * EMOJIS.length)] :
        WORDS[Math.floor(Math.random() * WORDS.length)],
      emoji: emoji,
      col: ['#f06292', '#e91e63', '#f48fb1', '#ab47bc'][Math.floor(Math.random() * 4)],
    });
  }
  if (!fxRunning) {
    fxRunning = true;
    requestAnimationFrame(loopFx);
  }
}

function loopFx() {
  var cv = document.getElementById('fxCanvas');
  if (!cv) return;
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
    fxCtx.font = p.emoji ?
      p.sz + 'px sans-serif' :
      '600 ' + p.sz + 'px "Dancing Script",cursive';
    fxCtx.fillStyle = p.col;
    fxCtx.fillText(p.t, p.x, p.y);
  }
  fxCtx.globalAlpha = 1;
  fxRunning = fxParts.length > 0;
  if (fxRunning) requestAnimationFrame(loopFx);
}

var toastTimer;
function showToast(msg) {
  D.toast.textContent = msg;
  D.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { D.toast.classList.remove('show'); }, 3200);
}

// ═══════════ INIT ═══════════
document.addEventListener('DOMContentLoaded', function() {
  cacheDom();
  applyConfig();
  buildVistas();
  initEntryCode();
  initFxCanvas();
  startHearts();
  initPlayer();
  initBookEvents();
  console.log('✨ Libro Virtual 10/10 cargado');
  console.log('📖 Skills activas: emil-design-eng, apple-design, impeccable, taste-skill, cinematic-ui, motion-and-interaction, frontend-ui-ux, claude-design-skill');
  console.log('🎯 Curvatura 3D REAL, Destello de luz, Interrupción, Rubber-banding, Stagger, Sombras y brillos 10/10');
});