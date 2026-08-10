/* ============================================================
   CONFIG.JS — Libro Virtual Interactivo para May
   ✏️  EDITA AQUÍ todo lo personalizable.
   ============================================================ */
'use strict';

const CONFIG = {

  // ╔══════════════════════════════════════════════╗
  // ║  👤 IDENTIDAD                                ║
  // ╚══════════════════════════════════════════════╝
  nombre: "May",                             // Nombre que aparece en la pantalla inicial
  pareja: "Liam",                            // Nombre de quien regala
  titulo_libro: "Nuestra Historia",          // Título visible en la portada cerrada
  subtitulo_libro: "May & Liam",             // Subtítulo visible en la portada cerrada

  // ╔══════════════════════════════════════════════╗
  // ║  🔐 CÓDIGO DE ACCESO                         ║
  // ╚══════════════════════════════════════════════╝
  codigo_acceso: "140726",                   // Código de 6 dígitos (solo números)
  mensaje_codigo_correcto: "¡Perfecto! 💗 Abriendo tu regalo...",
  mensaje_codigo_incorrecto: "Código incorrecto 💕 Intenta de nuevo",

  // ╔══════════════════════════════════════════════╗
  // ║  ✉️  RITUAL DE CLICS (apertura de la carta)   ║
  // ╚══════════════════════════════════════════════╝
  clics_necesarios: 30,
  titulo_carta: "Tengo algo especial para ti",
  subtitulo_carta: "Toca la carta para abrirla poco a poco... 💗",

  // Hitos: mensajes que aparecen en clics específicos
  // Formato: { clic: N, mensaje: "texto" }
  hitos: [
    { clic: 10, mensaje: "¡Vas muy bien! Sigue abriendo 🌸" },
    { clic: 20, mensaje: "¡Ya casi! Un poco más 💕" },
    { clic: 25, mensaje: "¡Ya casi, ya casi! 🥺💗" },
    { clic: 30, mensaje: "¡Lo lograste! 🎉✨" },
  ],

  // Mensaje dentro de la carta cuando se abre completamente
  mensaje_dentro_carta: "Este libro fue hecho con todo mi amor para ti, May.\nCada página guarda un pedacito de lo que somos. 💗",

  // ╔══════════════════════════════════════════════╗
  // ║  📖 PÁGINAS DEL LIBRO                        ║
  // ║  Agrega o quita páginas libremente.          ║
  // ║  El sistema calcula todo automáticamente.    ║
  // ╚══════════════════════════════════════════════╝
  paginas: [
    { imagen: "assets/pagina1.webp",  frase: "El día que todo comenzó... 💗" },
    { imagen: "assets/pagina2.webp",  frase: "Cada momento a tu lado es único ✨" },
    { imagen: "assets/pagina3.webp",  frase: "Tu risa ilumina mis días 🌸" },
    { imagen: "assets/pagina4.webp",  frase: "Juntos somos invencibles 💕" },
    { imagen: "assets/pagina5.webp",  frase: "Eres mi persona favorita en el mundo 💖" },
    { imagen: "assets/pagina6.webp",  frase: "Cada foto guarda un recuerdo hermoso 🌷" },
    { imagen: "assets/pagina7.webp",  frase: "Siempre hay algo nuevo por descubrir juntos 💫" },
    { imagen: "assets/pagina8.webp",  frase: "Te amo más de lo que las palabras pueden decir 💗" },
  ],
  // ┌─ FÁCIL: agrega más páginas así:
  // { imagen: "assets/pagina9.webp", frase: "Tu frase aquí..." },

  // ╔══════════════════════════════════════════════╗
  // ║  🎨 TAPAS INTERIORES (si no hay imagen)      ║
  // ╚══════════════════════════════════════════════╝
  // Si portada_interior.webp / contraportada_interior.webp existen
  // en la carpeta assets/, se usan automáticamente.
  // Si NO existen, se muestra el diseño por defecto:
  portada_interior_default: {
    color_fondo: "linear-gradient(160deg, #fff0f5 0%, #fce4ec 100%)",
    texto:       "Nuestra historia comienza aquí... 🌸",
    subtexto:    "Cada página es un recuerdo que guardaré para siempre",
  },
  contraportada_interior_default: {
    color_fondo: "linear-gradient(160deg, #fce4ec 0%, #f8bbd0 100%)",
    texto:       "El amor nunca termina... 💗",
    subtexto:    "Gracias por existir, por estar, por ser tú.",
  },

  // ╔══════════════════════════════════════════════╗
  // ║  🔄 CONTRAPORTADA (tapa trasera)             ║
  // ╚══════════════════════════════════════════════╝
  contraportada_texto: "Fin de nuestro libro",
  contraportada_subtexto: "Pero el comienzo de muchas más historias juntos 💗",

  // ╔══════════════════════════════════════════════╗
  // ║  🎵 MÚSICA                                   ║
  // ╚══════════════════════════════════════════════╝
  canciones: [
    { nombre: "Nuestra canción ♪",   archivo: "assets/songs/song1.mp3" },
    { nombre: "Para siempre 💗",      archivo: "assets/songs/song2.mp3" },
    { nombre: "Amor eterno ✨",       archivo: "assets/songs/song3.mp3" },
    { nombre: "Contigo 🌸",           archivo: "assets/songs/song4.mp3" },
    { nombre: "Te amo 💕",            archivo: "assets/songs/song5.mp3" },
  ],

  // ╔══════════════════════════════════════════════╗
  // ║  🌸 TEXTOS GENERALES DE LA UI                ║
  // ╚══════════════════════════════════════════════╝
  texto_entrada_titulo: "Un regalo especial para ti",
  texto_entrada_subtitulo: "Ingresa tu código para abrir este regalo 💗",
  texto_instruccion_portada: "Toca la portada para abrir el libro 💗",
  texto_btn_si: "💗 Sí, quiero abrirla",
  texto_btn_no: "Espera un momento...",
  mensaje_no_click: "Cuando estés lista, aquí estaré esperándote 🌸",
  mensaje_libro_completo: "¡Llegaste al final! Gracias por leer nuestra historia 💗",

  // ╔══════════════════════════════════════════════╗
  // ║  ⚡ ANIMACIÓN Y FÍSICA                        ║
  // ╚══════════════════════════════════════════════╝
  duracion_volteo: 700,     // ms que dura el volteo de página (400–900)
  duracion_apertura: 1100,  // ms que dura la animación de apertura del libro
  duracion_cierre: 900,     // ms que dura la animación de cierre del libro
};
