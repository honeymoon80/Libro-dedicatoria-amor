/* ============================================================
   CONFIG.JS — Libro Virtual Interactivo
   ✏️ EDITA AQUÍ todo lo personalizable.
   ============================================================ */
'use strict';

const CONFIG = {

  // ─── IDENTIDAD ──────────────────────────────────────────────
  nombrePareja:    "May",
  nombreRemitente: "Liam",
  tituloLibro:     "Nuestra Historia",
  subtituloLibro:  "May & Liam",

  // ─── ACCESO ─────────────────────────────────────────────────
  codigoAcceso: "140726",          // exactamente 6 dígitos
  msgCodigoCorrecto:   "💗 Perfecto… abriendo tu regalo",
  msgCodigoIncorrecto: "Inténtalo de nuevo 💕",

  // ─── CARTA (ritual de clics) ─────────────────────────────────
  clicsNecesarios: 30,
  tituloCarta:    "Tengo algo especial para ti",
  subtituloCarta: "Toca la carta para abrirla... 💗",
  mensajeDentroCarta: "Este libro fue hecho con todo mi amor.\nCada página guarda un pedacito de lo que somos. 💗",

  // Hitos: mensajes en clics específicos
  hitos: [
    { clic: 10, mensaje: "¡Vas muy bien! Sigue abriendo 🌸" },
    { clic: 20, mensaje: "¡Ya casi! Un poco más 💕" },
    { clic: 25, mensaje: "¡Ya casi, ya casi! 🥺💗" },
  ],

  // ─── TAPAS ──────────────────────────────────────────────────
  tapas: {
    portada:                { imagen: "assets/portada.webp" },
    portadaInterior:        { imagen: "assets/portada_interior.webp",
                              textoDefault: "Nuestra historia comienza aquí... 🌸",
                              subDefault:   "Cada página es un recuerdo que guardaré para siempre" },
    contraportada:          { imagen: "assets/contraportada.webp",
                              texto: "Fin de nuestro libro",
                              subtexto: "Pero el comienzo de muchas más historias juntos 💗" },
    contraportadaInterior:  { imagen: "assets/contraportada_interior.webp",
                              textoDefault: "El amor nunca termina... 💗",
                              subDefault:   "Gracias por existir, por estar, por ser tú." },
  },

  // ─── PÁGINAS ────────────────────────────────────────────────
  // Agrega o quita libremente. La lógica par/impar es automática.
  paginas: [
    { imagen: "assets/pagina1.webp",  frase: "El día que todo comenzó... 💗" },
    { imagen: "assets/pagina2.webp",  frase: "Cada momento a tu lado es único ✨" },
    { imagen: "assets/pagina3.webp",  frase: "Tu risa ilumina mis días 🌸" },
    { imagen: "assets/pagina4.webp",  frase: "Juntos somos invencibles 💕" },
    { imagen: "assets/pagina5.webp",  frase: "Eres mi persona favorita 💖" },
    { imagen: "assets/pagina6.webp",  frase: "Cada foto guarda un recuerdo hermoso 🌷" },
    { imagen: "assets/pagina7.webp",  frase: "Siempre hay algo nuevo por descubrir juntos 💫" },
    { imagen: "assets/pagina8.webp",  frase: "Te amo más de lo que las palabras pueden decir 💗" },
  ],

  // ─── MÚSICA ─────────────────────────────────────────────────
  playlist: [
    { nombre: "Nuestra canción ♪",   archivo: "assets/songs/song1.mp3" },
    { nombre: "Para siempre 💗",      archivo: "assets/songs/song2.mp3" },
    { nombre: "Amor eterno ✨",       archivo: "assets/songs/song3.mp3" },
    { nombre: "Contigo 🌸",           archivo: "assets/songs/song4.mp3" },
    { nombre: "Te amo 💕",            archivo: "assets/songs/song5.mp3" },
  ],

  // ─── TIEMPOS DE ANIMACIÓN (ms) ───────────────────────────────
  duracionApertura: 1200,  // apertura cinematic del libro
  duracionCierre:    900,  // cierre del libro
  duracionVolteo:    680,  // volteo de página
};
