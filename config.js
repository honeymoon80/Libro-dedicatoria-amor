// ============================================================
//  CONFIG.JS — Carrusel de Amor para May
//  ✏️  TODA la personalización está aquí
// ============================================================
'use strict';

const CONFIG = {

  nombrePareja: "May",
  nombreRemitente: "Liam",

  codigoAcceso: "250826",
  msgCodigoCorrecto: "Perfecto... abriendo tu regalo",
  msgCodigoIncorrecto: "Intentalo de nuevo",

  clicsNecesarios: 30,
  tituloCarta: "Tengo algo especial para ti",
  subtituloCarta: "Toca la carta para abrirla",

  hitos: [
    { clic: 10, mensaje: "Vas muy bien. Sigue abriendo" },
    { clic: 20, mensaje: "Ya casi... un poco mas" },
    { clic: 25, mensaje: "Ya casi, ya casi" },
  ],

  mensajeDentroCarta: "🌸💗este librito fue hesho con todito mi amolshito para ti mi bellíshima niñita bem peshoshita y perfecta de mi korashon HEHE:3💗🌸",

  // ─── CARRUSEL ───
  carrusel: {
    imagenes: [
      "assets/pagina1.webp",
      "assets/pagina2.webp",
      "assets/pagina3.webp",
      "assets/pagina4.webp",
      "assets/pagina5.webp",
      "assets/pagina6.webp",
      "assets/pagina7.webp",
      "assets/pagina8.webp"
    ],
    frases: [
      "Inicio de nuestro eterno amor💗",
      "Cada momento a tu lado es unico ✨",
      "Tu risa ilumina mis dias 🌸",
      "Juntos pol siempre mi amor 💕",
      "Eres mi persona favorita 💖",
      "Cada instante eterno guarda un recuerdo hermoso 🌷",
      "Siempre hay algo nuevo por descubrir juntos 💫",
      "Te amo mas de lo que las palabras pueden decir 💗"
    ]
  },

  // ─── MÚSICA ───
  playlist: [
    { nombre: "Nuestra cancion", archivo: "assets/songs/song1.mp3" },
    { nombre: "Para siempre", archivo: "assets/songs/song2.mp3" },
    { nombre: "Amor eterno", archivo: "assets/songs/song3.mp3" },
    { nombre: "Contigo", archivo: "assets/songs/song4.mp3" },
    { nombre: "Te amo", archivo: "assets/songs/song5.mp3" },
  ],

};
