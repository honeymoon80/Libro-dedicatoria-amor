// ============================================================
//  CONFIG.JS — Libro Virtual Interactivo para May
//  ✏️  TODA la personalización está aquí
// ============================================================
'use strict';

const CONFIG = {

  nombrePareja: "May",
  nombreRemitente: "Liam",
  tituloLibro: "Nuestra Historia",
  subtituloLibro: "May & Liam",

  codigoAcceso: "140726",
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

  mensajeDentroCarta: "Este libro fue hecho con todo mi amor. Cada pagina guarda un pedacito de lo que somos.",

  tapas: {
    portada: { imagen: "assets/portada.webp" },
    portadaInterior: {
      imagen: "assets/portada_interior.webp",
      textoDefault: "Nuestra historia comienza aqui",
      subDefault: "Cada pagina es un recuerdo que guardare para siempre"
    },
    contraportada: {
      imagen: "assets/contraportada.webp",
      texto: "Fin de nuestro libro",
      subtexto: "Pero el comienzo de muchas mas historias juntos"
    },
    contraportadaInterior: {
      imagen: "assets/contraportada_interior.webp",
      textoDefault: "El amor nunca termina",
      subDefault: "Gracias por existir, por estar, por ser tu"
    }
  },

  paginas: [
    { imagen: "assets/pagina1.webp", frase: "El dia que todo comenzo" },
    { imagen: "assets/pagina2.webp", frase: "Cada momento a tu lado es unico" },
    { imagen: "assets/pagina3.webp", frase: "Tu risa ilumina mis dias" },
    { imagen: "assets/pagina4.webp", frase: "Juntos somos invencibles" },
    { imagen: "assets/pagina5.webp", frase: "Eres mi persona favorita" },
    { imagen: "assets/pagina6.webp", frase: "Cada foto guarda un recuerdo hermoso" },
    { imagen: "assets/pagina7.webp", frase: "Siempre hay algo nuevo por descubrir juntos" },
    { imagen: "assets/pagina8.webp", frase: "Te amo mas de lo que las palabras pueden decir" },
  ],

  playlist: [
    { nombre: "Nuestra cancion", archivo: "assets/songs/song1.mp3" },
    { nombre: "Para siempre", archivo: "assets/songs/song2.mp3" },
    { nombre: "Amor eterno", archivo: "assets/songs/song3.mp3" },
    { nombre: "Contigo", archivo: "assets/songs/song4.mp3" },
    { nombre: "Te amo", archivo: "assets/songs/song5.mp3" },
  ],

  tiempos: {
    apertura: 1100,
    cierre: 800,
    volteo: 600,
    feedback: 160,
    toast: 280,
  },

  portadaInteriorDefault: {
    color: "linear-gradient(160deg, #fff0f5 0%, #fce4ec 100%)",
    texto: "Nuestra historia comienza aqui",
    subtexto: "Cada pagina guarda un recuerdo"
  },
  contraportadaInteriorDefault: {
    color: "linear-gradient(160deg, #fce4ec 0%, #f8bbd0 100%)",
    texto: "El amor nunca termina",
    subtexto: "Gracias por existir"
  },
};