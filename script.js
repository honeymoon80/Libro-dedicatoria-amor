/* ============================================================
   SCRIPT.JS — Carrusel de Amor
   ============================================================ */
'use strict';

// ═══════════ ESTADO GLOBAL ═══════════
const S = {
  digits: '',
  clics: 0,
  fase: 'code',
  songIdx: 0,
  playing: false,
  playerOpen: false,
  carouselIndex: 0,
};

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
    carouselTrack: $('carouselTrack'),
    carouselDots: $('carouselDots'),
    carouselFrase: $('carouselFrase'),
    carouselProgress: $('carouselProgress'),
    carouselPrev: $('carouselPrev'),
    carouselNext: $('carouselNext'),
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
  document.title = 'Carrusel de Amor 💗';
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

// ═══════════ FASE 2 — CARRUSEL ═══════════
function showBookScreen() {
  S.fase = 'book';
  D.bookScreen.classList.remove('hidden');
  initCarousel();
  startMusicOnInteract();
}

// ═══════════ CARRUSEL ═══════════
function initCarousel() {
  var imagenes = CONFIG.carrusel.imagenes;
  var frases = CONFIG.carrusel.frases;
  var total = imagenes.length;

  // Construir slides
  D.carouselTrack.innerHTML = '';
  imagenes.forEach(function(img, i) {
    var slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.innerHTML = '<img src="' + img + '" alt="Imagen ' + (i + 1) + '" loading="lazy" onerror="this.style.background=\'#fce4ec\';this.removeAttribute(\'src\')">';
    D.carouselTrack.appendChild(slide);
  });

  // Construir dots
  D.carouselDots.innerHTML = '';
  for (var i = 0; i < total; i++) {
    var dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', (function(index) {
      return function() { goToSlide(index); };
    })(i));
    D.carouselDots.appendChild(dot);
  }

  // Actualizar info
  S.carouselIndex = 0;
  updateCarousel();

  // Botones
  D.carouselPrev.addEventListener('click', function() { goToSlide(S.carouselIndex - 1); });
  D.carouselNext.addEventListener('click', function() { goToSlide(S.carouselIndex + 1); });

  // Swipe táctil
  var startX = 0;
  var wrapper = document.querySelector('.carousel-wrapper');
  wrapper.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  wrapper.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goToSlide(S.carouselIndex + 1) : goToSlide(S.carouselIndex - 1);
    }
  }, { passive: true });

  // Teclado
  document.addEventListener('keydown', function(e) {
    if (D.bookScreen.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') goToSlide(S.carouselIndex + 1);
    if (e.key === 'ArrowLeft') goToSlide(S.carouselIndex - 1);
  });
}

function goToSlide(index) {
  var total = CONFIG.carrusel.imagenes.length;
  if (index < 0) index = total - 1;
  if (index >= total) index = 0;
  S.carouselIndex = index;
  updateCarousel();
}

function updateCarousel() {
  var total = CONFIG.carrusel.imagenes.length;
  var frases = CONFIG.carrusel.frases;

  D.carouselTrack.style.transform = 'translateX(-' + (S.carouselIndex * 100) + '%)';
  D.carouselFrase.textContent = frases[S.carouselIndex] || '💗';
  D.carouselProgress.textContent = (S.carouselIndex + 1) + ' / ' + total;

  var dots = D.carouselDots.querySelectorAll('.carousel-dot');
  dots.forEach(function(dot, i) {
    dot.classList.toggle('active', i === S.carouselIndex);
  });
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
  initEntryCode();
  initFxCanvas();
  startHearts();
  initPlayer();
  console.log('✨ Carrusel de Amor cargado');
});
