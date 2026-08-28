import { resetInstrucciones } from "./instrucciones.js";

window.juegoActual = null;
window.juegoActualId = null;

async function cargarJuego(ruta) {
  if (juegoActual && juegoActual.cleanup) {
    juegoActual.cleanup();
  }

  window.juegoActual = await import(ruta);

  if (juegoActual.init) {
    juegoActual.init();
  }
}

const juegosVisitados = new Set();

function abrirJuegoConInstrucciones(id) {
  const secInstruc = document.getElementById("instrucciones-box");
  const canvasBox = document.querySelector(".canvas-box");

  if (!juegosVisitados.has(id)) {
    canvasBox.classList.add("oculto");
    resetInstrucciones();
    secInstruc.classList.add("activo");
    juegosVisitados.add(id);

    setTimeout(() => {
      requestAnimationFrame(() => {
        canvasBox.classList.remove("oculto");
      });
    }, 1000);
  }
}

const menuJuegos = document.getElementById("menu-juegos");
window.menuJuegos = menuJuegos;

const navbarbox = document.getElementById("navbar-box");
const btn1 = document.getElementById("btn-nav1");
const btn2 = document.getElementById("btn-nav2");
const btn3 = document.getElementById("btn-nav3");
const btn4 = document.getElementById("btn-nav4");

const card = document.getElementById("instrucciones-card");
const stepCircle = document.getElementById("step-circle");
const stepContent = document.getElementById("step-content");
const cardAfterBtn = document.getElementById("btn-siguiente");
const cardEntendidoBtn = document.getElementById("btn-entendido");

document.body.classList.add("sin-scroll");

function aplicarColorBtn(btn, color) {
  btn.dataset.colorTema = color;
  if (!btn.classList.contains("activo")) {
    btn.style.backgroundColor = color;
  }
}

// Abrir Minijuegos desde Menú
document
  .querySelectorAll(".juego-item")[0]
  .addEventListener("click", async () => {
    // Visualizar Primer módulo
    window.juegoActualId = "A";
    navbarbox.style.backgroundColor = "var(--naranja)";
    navbarbox.style.borderRightColor = "var(--naranja-claro)";

    btn1.style.backgroundColor = "var(--naranja-claro)";
    btn2.style.backgroundColor = "var(--naranja-claro)";
    aplicarColorBtn(btn3, "var(--naranja-claro)");
    aplicarColorBtn(btn4, "var(--naranja-claro)");
    btn1.dataset.colorTema = "var(--naranja-claro)";
    btn2.dataset.colorTema = "var(--naranja-claro)";
    btn3.dataset.colorTema = "var(--naranja-claro)";
    btn4.dataset.colorTema = "var(--naranja-claro)";

    stepCircle.style.background = "var(--naranja-claro)";
    stepContent.style.background = "var(--naranja-suave)";
    card.style.borderBottom = "12px solid var(--naranja-claro)";
    cardAfterBtn.style.backgroundColor = "var(--naranja)";
    cardEntendidoBtn.style.backgroundColor = "var(--naranja)";

    menuJuegos.classList.remove("activo");
    document.body.classList.remove("sin-scroll");

    await cargarJuego("../js/juegoA.js");
    abrirJuegoConInstrucciones("A");
  });

document
  .querySelectorAll(".juego-item")[1]
  .addEventListener("click", async () => {
    // Visualizar Segundo módulo
    window.juegoActualId = "B";
    navbarbox.style.backgroundColor = "var(--morado)";
    navbarbox.style.borderRightColor = "var(--morado-claro)";

    btn1.style.backgroundColor = "var(--morado-claro)";
    btn2.style.backgroundColor = "var(--morado-claro)";
    aplicarColorBtn(btn3, "var(--morado-claro)");
    aplicarColorBtn(btn4, "var(--morado-claro)");
    btn1.dataset.colorTema = "var(--morado-claro)";
    btn2.dataset.colorTema = "var(--morado-claro)";
    btn3.dataset.colorTema = "var(--morado-claro)";
    btn4.dataset.colorTema = "var(--morado-claro)";

    stepCircle.style.background = "var(--morado-claro)";
    stepContent.style.background = "var(--morado-suave)";
    card.style.borderBottom = "12px solid var(--morado-claro)";
    cardAfterBtn.style.backgroundColor = "var(--morado)";
    cardEntendidoBtn.style.backgroundColor = "var(--morado)";

    menuJuegos.classList.remove("activo");
    document.body.classList.remove("sin-scroll");
    await cargarJuego("../js/juegoB.js");
    abrirJuegoConInstrucciones("B");
  });

document
  .querySelectorAll(".juego-item")[2]
  .addEventListener("click", async () => {
    // Visualizar Tercer módulo
    window.juegoActualId = "C";
    navbarbox.style.backgroundColor = "var(--azul)";
    navbarbox.style.borderRightColor = "var(--azul-claro)";

    btn1.style.backgroundColor = "var(--azul-claro)";
    btn2.style.backgroundColor = "var(--azul-claro)";
    aplicarColorBtn(btn3, "var(--azul-claro)");
    aplicarColorBtn(btn4, "var(--azul-claro)");
    btn1.dataset.colorTema = "var(--azul-claro)";
    btn2.dataset.colorTema = "var(--azul-claro)";
    btn3.dataset.colorTema = "var(--azul-claro)";
    btn4.dataset.colorTema = "var(--azul-claro)";

    stepCircle.style.background = "var(--azul-claro)";
    stepContent.style.background = "var(--azul-suave)";
    card.style.borderBottom = "12px solid var(--azul-claro)";
    cardAfterBtn.style.backgroundColor = "var(--azul)";
    cardEntendidoBtn.style.backgroundColor = "var(--azul)";

    menuJuegos.classList.remove("activo");
    document.body.classList.remove("sin-scroll");
    await cargarJuego("../js/juegoC.js");
    abrirJuegoConInstrucciones("C");
  });

document
  .querySelectorAll(".juego-item")[3]
  .addEventListener("click", async () => {
    // Visualizar Cuarto módulo
    window.juegoActualId = "D";
    navbarbox.style.backgroundColor = "var(--verde)";
    navbarbox.style.borderRightColor = "var(--verde-claro)";

    btn1.style.backgroundColor = "var(--verde-claro)";
    btn2.style.backgroundColor = "var(--verde-claro)";
    aplicarColorBtn(btn3, "var(--verde-claro)");
    aplicarColorBtn(btn4, "var(--verde-claro)");
    btn1.dataset.colorTema = "var(--verde-claro)";
    btn2.dataset.colorTema = "var(--verde-claro)";
    btn3.dataset.colorTema = "var(--verde-claro)";
    btn4.dataset.colorTema = "var(--verde-claro)";

    stepCircle.style.background = "var(--verde-claro)";
    stepContent.style.background = "var(--verde-suave)";
    card.style.borderBottom = "12px solid var(--verde-claro)";
    cardAfterBtn.style.backgroundColor = "var(--verde)";
    cardEntendidoBtn.style.backgroundColor = "var(--verde)";

    menuJuegos.classList.remove("activo");
    document.body.classList.remove("sin-scroll");

    await cargarJuego("../js/juegoD.js");
    abrirJuegoConInstrucciones("D");
  });

// SELECCIÓN DE TARJETAS - Personalización
const cards = document.querySelectorAll(".customCard");
const portada = document.getElementById("menu-juegos");
const miniaturaA = document.getElementById("main-miniatura-a");
const miniaturaB = document.getElementById("main-miniatura-b");
const miniaturaC = document.getElementById("main-miniatura-c");
const miniaturaD = document.getElementById("main-miniatura-d");
const icon = document.getElementById("icon-custom");

window.customCardSeleccionada = null;

function seleccionarCard(cardSeleccionada) {
  cards.forEach((card) => {
    const img = card.querySelector(".customCard-img");

    const defaultSrc = card.dataset.defaultSrc;
    const selectedSrc = card.dataset.selectedSrc;

    const isSelected = card === cardSeleccionada;

    card.classList.toggle("selected", isSelected);

    if (img) {
      img.src = isSelected ? selectedSrc : defaultSrc;
    }
  });

  // Guardar valor global
  window.customCardSeleccionada = cardSeleccionada.dataset.value;

  // Personalización - Avatares
  if (window.customCardSeleccionada === "A") {
    portada.style.background = `
    url("./src/portada-main-a.webp")
    no-repeat
    right / cover`;
    miniaturaA.src = "./src/game-a/miniatura-cocina-a.webp";
    miniaturaB.src = "./src/game-b/miniatura-bano-a.webp";
    miniaturaC.src = "./src/game-c/miniatura-vet-a.webp";
    miniaturaD.src = "./src/game-d/miniatura-parque-a.webp";
    icon.src = Math.random() < 0.5 ? "./src/icon-a.webp" : "./src/icon-b.webp";
    actualizarProgresion();
  }

  if (window.customCardSeleccionada === "B") {
    portada.style.background = `
    url("./src/portada-main-b.webp")
    no-repeat
    right / cover`;
    miniaturaA.src = "./src/game-a/miniatura-cocina-b.webp";
    miniaturaB.src = "./src/game-b/miniatura-bano-b.webp";
    miniaturaC.src = "./src/game-c/miniatura-vet-b.webp";
    miniaturaD.src = "./src/game-d/miniatura-parque-b.webp";
    icon.src = Math.random() < 0.5 ? "./src/icon-c.webp" : "./src/icon-d.webp";
    actualizarProgresion();
  }

  if (window.customCardSeleccionada === "C") {
    portada.style.background = `
    url("./src/portada-main-c.webp")
    no-repeat
    right / cover`;
    miniaturaA.src = "./src/game-a/miniatura-cocina-c.webp";
    miniaturaB.src = "./src/game-b/miniatura-bano-c.webp";
    miniaturaC.src = "./src/game-c/miniatura-vet-c.webp";
    miniaturaD.src = "./src/game-d/miniatura-parque-c.webp";
    icon.src = Math.random() < 0.5 ? "./src/icon-e.webp" : "./src/icon-f.webp";
    actualizarProgresion();
  }
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    seleccionarCard(card);
  });
});

// Selección inicial por defecto
const cardInicial = document.querySelector("#customCard-a");

if (cardInicial) {
  seleccionarCard(cardInicial);
}
// --- LÓGICA DE PROGRESIÓN Y DESBLOQUEOS (CORREGIDA Y COMPLETA) ---

const notificacionesMostradas = { A: false, B: false, C: false };

// Función robusta para verificar si UN módulo específico de un avatar está completado
function verificarUnModulo(avatar, moduloIndex) {
  let completado = false;

  if (moduloIndex === 0 && window.gameA_moduleCompletadoPorAvatar) {
    completado = window.gameA_moduleCompletadoPorAvatar[avatar] === true;
  } else if (moduloIndex === 1 && window.gameB_moduleCompletadoPorAvatar) {
    completado = window.gameB_moduleCompletadoPorAvatar[avatar] === true;
  } else if (moduloIndex === 2 && window.gameC_moduleCompletadoPorAvatar) {
    completado = window.gameC_moduleCompletadoPorAvatar[avatar] === true;
  } else if (moduloIndex === 3 && window.gameD_moduleCompletadoPorAvatar) {
    completado = window.gameD_moduleCompletadoPorAvatar[avatar] === true;
  }

  return completado;
}

// Verifica si LOS 4 MÓDULOS de un avatar específico han sido completados
function avatarCompleto(avatar) {
  const m0 = verificarUnModulo(avatar, 0);
  const m1 = verificarUnModulo(avatar, 1);
  const m2 = verificarUnModulo(avatar, 2);
  const m3 = verificarUnModulo(avatar, 3);

  // console.log(
  //   `Progreso de los 4 módulos para Avatar [${avatar}]: M1=${m0}, M2=${m1}, M3=${m2}, M4=${m3}`,
  // );
  return m0 && m1 && m2 && m3;
}

function mostrarNotificacion(avatarTerminado) {
  if (notificacionesMostradas[avatarTerminado]) return;

  // Creamos o buscamos el contenedor de la notificación de forma dinámica para asegurar que exista
  let notif = document.getElementById("notificacion-desbloqueo");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notificacion-desbloqueo";
    notif.className = "notificacion-msj";
    const menuJuegosEl = document.getElementById("menu-juegos");
    if (menuJuegosEl) menuJuegosEl.appendChild(notif);
  }

  if (avatarTerminado === "A" || avatarTerminado === "B") {
    notif.textContent = "Has desbloqueado nuevos personajes";
  } else if (avatarTerminado === "C") {
    notif.textContent = "¡Felicidades! Has completado todo el juego";
  }

  notif.classList.add("mostrar");
  notificacionesMostradas[avatarTerminado] = true;
  // console.log(
  //   `Mostrando notificación por completar avatar: ${avatarTerminado}`,
  // );

  setTimeout(() => {
    notif.classList.remove("mostrar");
  }, 10000);
}

export function actualizarProgresion() {
  // console.log("=== ACTUALIZANDO PROGRESIÓN EN MENÚ ===");
  const modulos = document.querySelectorAll(".juego-item");
  const avatarActual = window.customCardSeleccionada || "A";

  // 1. Colorear módulos del avatar actual de verde si están completados
  modulos.forEach((mod, index) => {
    if (verificarUnModulo(avatarActual, index)) {
      mod.classList.add("completado");
    } else {
      mod.classList.remove("completado");
    }
  });

  // 2. Evaluar estado de completitud por cada avatar
  const aCompletado = avatarCompleto("A");
  const bCompletado = avatarCompleto("B");
  const cCompletado = avatarCompleto("C");

  const cardB = document.getElementById("customCard-b");
  const cardC = document.getElementById("customCard-c");

  // Desbloqueo Avatar B (requiere que A esté completo)
  if (aCompletado && cardB) {
    if (cardB.classList.contains("bloqueado")) {
      // console.log("¡Desbloqueando Avatar B!");
      cardB.classList.remove("bloqueado");
    }
    mostrarNotificacion("A");
  }

  // Desbloqueo Avatar C (requiere que B esté completo)
  if (bCompletado && cardC) {
    if (cardC.classList.contains("bloqueado")) {
      // console.log("¡Desbloqueando Avatar C!");
      cardC.classList.remove("bloqueado");
    }
    mostrarNotificacion("B");
  }

  // Fin de todo el juego (requiere que C esté completo)
  if (cCompletado) {
    mostrarNotificacion("C");
  }
  // console.log("=== FIN ACTUALIZACIÓN DE MENÚ ===");
}

// --- CONECTAR AL BOTÓN "VOLVER" Y CAMBIO DE AVATAR ---
const btnVolverMenu = document.getElementById("btn-nav1");
if (btnVolverMenu) {
  btnVolverMenu.addEventListener("click", () => {
    setTimeout(actualizarProgresion, 100);
  });
}
