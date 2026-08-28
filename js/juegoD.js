import * as AudioManager from "./audioManager.js";

let canvas, ctx;

const BASE_W = 1000;
const BASE_H = 500;
const PANEL_X = 760;

let scale = 1;
let resizeHandler;
let mouseMoveHandler;
let mouseLeaveHandler;
let clickHandler;
let intervalTime;
let animationId;

// Imágenes
let imgBgEasy, imgBgNormal, imgBgHard;
let imgBackground, imgPanelBg;
let imgBtnEasy, imgBtnNormal, imgBtnHard;
let imgWin, imgLose, imgBtnRestart, imgBtnDiff, imgBtnDiffPause;
let imgBarIcon;
let imgCover, imgCoverBtn, imgCoverBtnRace;
let imgPauseBtn, imgResumeBtn;

// Estado del juego
let state;
let config;
let dificultadActual;
let configKey;
let items;
let foundCount;
let time;
let endScreenTime = null;
let paused = false;

// Circuit mode
let circuitMode = false;
let circuitCompleted = false;
let currentLevelIndex = 0;
let usedCardIndices = [];
let standaloneLevel = false;
const circuitLevels = ["easy", "normal", "hard"];
const circuitNames = ["Nivel 1", "Nivel 2", "Nivel 3"];

// Desbloqueo progresivo de niveles
// 0 = solo Nivel 1 (easy) habilitado, 1 = hasta Nivel 2 (normal), 2 = hasta Nivel 3 (hard)
let maxUnlockedLevel = 0;
let moduleCompletado = false;
let currentCardVariant = "A";

let raceMode = false;
let raceLevelIndex = 0;
let raceTime = 0;
let raceFinished = false;
let bestRaceTime = null;
let lastRaceTime = null;
let isNewRecord = false;

// Level intro
let currentCardData = null;

// Tarjetas
const cardsData = [
  {
    img: "src/game-d/gamed-t1.webp",
    subtitle: "Hora De Descansar",
    text: "Después de jugar, tu perro necesita descansar para recuperar energía.",
  },
  {
    img: "src/game-d/gamed-t2.webp",
    subtitle: "Ofrecele agua limpia",
    text: "Siempre ofrece agua a tu perro después de jugar. Beber agua ayuda a tu perro a refrescarse y recuperar fuerzas.",
  },
  {
    img: "src/game-d/gamed-t6.webp",
    subtitle: "No lo dejes encerrado",
    text: "Tu perro necesita moverse y jugar todos los días. Moverse y explorar ayuda a tu perro a estar saludable y contento.",
  },
  {
    img: "src/game-d/gamed-t4.webp",
    subtitle: "Juegos y jueguetes seguros",
    text: "Asegurate que los juguetes sean seguros y mantén fuera de su alcance cualquier cosa que pueda lastimarlos.",
  },
  {
    img: "src/game-d/gamed-t5.webp",
    subtitle: "Paseos seguros",
    text: "Siempre pasea a tu perro con correa para que esté protegido y no se pierda.",
  },
  {
    img: "src/game-d/gamed-t3.webp",
    subtitle: "Paseos Diarios",
    text: "Salir a pasear los ayuda a ser felices, pero siempre bajo supervisión.",
  },
];
let cardImages = [];
const coverBtn = { x: 750, y: 290, w: 210, h: 90 };
const coverBtnRace = { x: 750, y: 290 + 70, w: 210, h: 90 };
const entendidoBtn = { x: 560, y: 310, w: 160, h: 42 };
const pauseBtn = { x: 940, y: 420, r: 30 };
const pauseDiffBtn = { x: 940, y: 300, r: 35 };

// Hover
let hoverRestart, hoverDiff, hoverEasy, hoverNormal, hoverHard;
let hoverCoverBtn = false;
let hoverCoverBtnRace = false;
let hoverEntendido = false;
let hoverPause = false;
let hoverPauseDiff = false;

// Botones
let restartBtn, diffBtn;

const mapImageSrcsByVariant = {
  A: {
    easy: "src/game-d/game-daa.webp",
    normal: "src/game-d/game-dba.webp",
    hard: "src/game-d/game-dca.webp",
  },
  B: {
    easy: "src/game-d/game-dab.webp",
    normal: "src/game-d/game-dbb.webp",
    hard: "src/game-d/game-dcb.webp",
  },
  C: {
    easy: "src/game-d/game-dac.webp",
    normal: "src/game-d/game-dbc.webp",
    hard: "src/game-d/game-dcc.webp",
  },
};

const levelItemsByVariant = {
  A: {
    easy: [
      //15 objetos disponibles
      { name: "Gnomo verde", x: 742, y: 250, r: 24 },
      { name: "Regalo", x: 735, y: 290, r: 24 },
      { name: "Cámara de fotos", x: 590, y: 263, r: 24 },
      { name: "Frisbee verde", x: 527, y: 220, r: 24 },
      { name: "Manzana", x: 15, y: 315, r: 24 },
      { name: "Calcetín", x: 112, y: 407, r: 24 },
      { name: "Pelota de Fútbol", x: 390, y: 435, r: 25 },
      { name: "Llave antigua", x: 324, y: 458, r: 25 },
      { name: "Patito de hule", x: 137, y: 270, r: 24 },
      { name: "Cono de tránsito", x: 222, y: 264, r: 24 },
      { name: "Conejo blanco", x: 179, y: 188, r: 25 },
      { name: "Hot dog", x: 298, y: 145, r: 24 },
      { name: "Yo-yo", x: 395, y: 240, r: 24 },
      { name: "Tren de juguete", x: 685, y: 453, r: 25 },
      { name: "Gafas de sol", x: 673, y: 268, r: 24 },
    ],
    normal: [
      //17 objetos disponibles
      { name: "Mochila verde", x: 170, y: 452, r: 24 },
      { name: "Hueso rojo", x: 627, y: 207, r: 24 },
      { name: "Hueso verde", x: 42, y: 180, r: 24 },
      { name: "Hueso amarillo", x: 737, y: 370, r: 24 },
      { name: "Barco de papel", x: 176, y: 233, r: 24 },
      { name: "Canasta de picnic", x: 593, y: 437, r: 24 },
      { name: "Sombrero rosa", x: 468, y: 247, r: 24 },
      { name: "Gatito con toalla", x: 160, y: 285, r: 24 },
      { name: "Plato verde vacío", x: 705, y: 243, r: 24 },
      { name: "Pelota de fútbol", x: 600, y: 155, r: 24 },
      { name: "Cámara con sombrero", x: 415, y: 112, r: 24 },
      { name: "Gato baterista", x: 518, y: 80, r: 25 },
      { name: "Cono de tránsito", x: 290, y: 460, r: 25 },
      { name: "Conejo leyendo", x: 440, y: 400, r: 30 },
      { name: "Patito de hule", x: 107, y: 260, r: 24 },
      { name: "Globo verde claro", x: 443, y: 12, r: 24 },
      { name: "Plato rojo", x: 653, y: 352, r: 24 },
    ],
    hard: [
      //20 objetos disponibles
      { name: "Oso de peluche", x: 120, y: 105, r: 24 },
      { name: "Uvas", x: 43, y: 91, r: 24 },
      { name: "Gorra roja", x: 94, y: 213, r: 24 },
      { name: "Hueso rojo", x: 332, y: 152, r: 24 },
      { name: "Manzana amarilla", x: 134, y: 364, r: 24 },
      { name: "Estrella", x: 277, y: 345, r: 24 },
      { name: "Cronómetro", x: 280, y: 460, r: 24 },
      { name: "Collar café", x: 543, y: 345, r: 24 },
      { name: "Burbuja", x: 340, y: 312, r: 24 },
      { name: "Hueso rosado", x: 440, y: 454, r: 24 },
      { name: "Maceta vacía", x: 517, y: 436, r: 24 },
      { name: "Collar rojo", x: 683, y: 469, r: 30 },
      { name: "Globo Morado", x: 690, y: 372, r: 24 },
      { name: "Anteojos", x: 696, y: 303, r: 24 },
      { name: "Mariposa verde", x: 620, y: 253, r: 24 },
      { name: "Plato naranja", x: 664, y: 168, r: 24 },
      { name: "Mariposa amarilla", x: 591, y: 132, r: 24 },
      { name: "Trofeo", x: 707, y: 98, r: 24 },
      { name: "Pelota de basquet", x: 478, y: 165, r: 24 },
      { name: "Cometa", x: 393, y: 26, r: 24 },
    ],
  },
  B: {
    easy: [
      // 11 objetos disponibles
      { name: "Trofeo", x: 377, y: 326, r: 24 },
      { name: "Hot dog", x: 173, y: 142, r: 24 },
      { name: "Gnomo verde", x: 286, y: 234, r: 24 },
      { name: "Mariposa", x: 736, y: 268, r: 24 },
      { name: "Medalla", x: 346, y: 377, r: 26 },
      { name: "Conejo", x: 473, y: 433, r: 24 },
      { name: "Patito morado", x: 594, y: 464, r: 24 },
      { name: "Lupa", x: 513, y: 441, r: 24 },
      { name: "Pajarito", x: 109, y: 124, r: 24 },
      { name: "Plato con agua", x: 324, y: 425, r: 24 },
      { name: "Hidrante rojo", x: 695, y: 441, r: 24 },
    ],
    normal: [
      // 14 objetos disponibles
      { name: "Barco de juguete", x: 628, y: 296, r: 24 },
      { name: "Paleta roja", x: 333, y: 470, r: 24 },
      { name: "Mochila morada", x: 220, y: 205, r: 24 },
      { name: "Hueso rojo", x: 477, y: 189, r: 24 },
      { name: "Hueso amarillo", x: 379, y: 187, r: 24 },
      { name: "Cojín rosado", x: 570, y: 185, r: 24 },
      { name: "Botiquín", x: 12, y: 485, r: 24 },
      { name: "Mariposa amarilla", x: 457, y: 437, r: 24 },
      { name: "Mariposa morada", x: 84, y: 244, r: 24 },
      { name: "Patito de hule", x: 570, y: 371, r: 24 },
      { name: "Frisbee rojo", x: 608, y: 204, r: 24 },
      { name: "Frisbee morado", x: 207, y: 394, r: 24 },
      { name: "Frisbee azul", x: 220, y: 172, r: 24 },
      { name: "Mochila azul", x: 133, y: 307, r: 24 },
    ],
    hard: [
      //16 objetos disponibles
      { name: "Pluma de ave", x: 673, y: 388, r: 24 },
      { name: "Mochila azul", x: 674, y: 434, r: 24 },
      { name: "Bicicleta", x: 728, y: 119, r: 27 },
      { name: "Tucán", x: 736, y: 314, r: 25 },
      { name: "Casita de pájaro", x: 325, y: 53, r: 24 },
      { name: "Barco de juguete", x: 104, y: 222, r: 24 },
      { name: "Rana", x: 147, y: 358, r: 24 },
      { name: "Telescopio gris", x: 576, y: 86, r: 27 },
      { name: "Pez con manchas", x: 122, y: 423, r: 24 },
      { name: "Tortuga", x: 185, y: 245, r: 24 },
      { name: "Mochila roja", x: 227, y: 469, r: 24 },
      { name: "Patito de hule", x: 185, y: 394, r: 24 },
      { name: "Canasta de picnic", x: 341, y: 418, r: 24 },
      { name: "Burbujas", x: 614, y: 233, r: 24 },
      { name: "Libro rojo cerrado", x: 360, y: 173, r: 24 },
      { name: "Brújula", x: 634, y: 483, r: 24 },
    ],
  },
  C: {
    easy: [
      //13 objetos disponibles
      { name: "Globo rosado", x: 613, y: 136, r: 24 },
      { name: "Calcetín", x: 113, y: 407, r: 24 },
      { name: "Gafas de sol", x: 40, y: 399, r: 25 },
      { name: "Huella de perro", x: 722, y: 398, r: 24 },
      { name: "Llave antigua", x: 324, y: 455, r: 24 },
      { name: "Botalla de agua", x: 389, y: 431, r: 24 },
      { name: "Radio naranja", x: 446, y: 427, r: 24 },
      { name: "Pelota de Tenis", x: 244, y: 477, r: 24 },
      { name: "Frisbee azul", x: 189, y: 128, r: 24 },
      { name: "Plato verde vacío", x: 459, y: 259, r: 24 },
      { name: "Mariposa morada", x: 598, y: 310, r: 24 },
      { name: "Mariposa rosada", x: 13, y: 319, r: 24 },
      { name: "Mariposa amarilla", x: 749, y: 283, r: 24 },
    ],
    normal: [
      //15 objetos disponibles
      { name: "Pájaro rojo", x: 580, y: 78, r: 24 },
      { name: "Dulce azul", x: 605, y: 409, r: 24 },
      { name: "Patito de hule", x: 117, y: 349, r: 24 },
      { name: "Pez rojo", x: 72, y: 395, r: 24 },
      { name: "Huella de perro", x: 487, y: 483, r: 24 },
      { name: "Hueso rosado", x: 374, y: 283, r: 24 },
      { name: "Remo de bote", x: 55, y: 257, r: 24 },
      { name: "Libélula amarilla", x: 136, y: 431, r: 24 },
      { name: "Flor azul", x: 705, y: 470, r: 24 },
      { name: "Frisbee rojo", x: 314, y: 360, r: 24 },
      { name: "Dona", x: 71, y: 343, r: 30 },
      { name: "Llanta de auto", x: 351, y: 225, r: 24 },
      { name: "Globo verde", x: 393, y: 22, r: 24 },
      { name: "Pelota amarilla", x: 516, y: 392, r: 24 },
      { name: "Plato celeste con agua", x: 244, y: 176, r: 24 },
    ],
    hard: [
      // 26 objetos disponibles
      { name: "Globo terraquio", x: 236, y: 304, r: 24 },
      { name: "Gnomo verde", x: 168, y: 274, r: 30 },
      { name: "Tortuga", x: 459, y: 343, r: 24 },
      { name: "Pelota de fútbol", x: 349, y: 273, r: 24 },
      { name: "Pluma azul", x: 593, y: 190, r: 24 },
      { name: "Gorra roja", x: 553, y: 216, r: 24 },
      { name: "Hueso rojo", x: 411, y: 398, r: 24 },
      { name: "Llanta de auto", x: 563, y: 285, r: 24 },
      { name: "Calcetín", x: 51, y: 159, r: 24 },
      { name: "Pelota de tenis", x: 651, y: 449, r: 24 },
      { name: "Mariposa amarilla", x: 603, y: 29, r: 24 },
      { name: "Dona", x: 624, y: 326, r: 24 },
      { name: "Mochila azul", x: 288, y: 451, r: 24 },
      { name: "Estrella verde", x: 677, y: 68, r: 24 },
      { name: "Globo rojo", x: 497, y: 130, r: 24 },
      { name: "Frisbee morado", x: 629, y: 65, r: 24 },
      { name: "Regalo", x: 332, y: 192, r: 24 },
      { name: "Collar rojo", x: 445, y: 382, r: 24 },
      { name: "Oso de peluche", x: 371, y: 344, r: 24 },
      { name: "Rana", x: 267, y: 412, r: 24 },
      { name: "Patito de hule", x: 164, y: 427, r: 24 },
      { name: "Plato naranja vacío", x: 116, y: 476, r: 24 },
      { name: "Gato leyendo", x: 477, y: 179, r: 24 },
      { name: "Pajarito amarillo", x: 429, y: 165, r: 24 },
      { name: "Trofeo", x: 389, y: 62, r: 24 },
      { name: "Mochila morada", x: 325, y: 127, r: 24 },
    ],
  },
};
function getLevelItems(levelKey) {
  const variantItems =
    levelItemsByVariant[currentCardVariant] ?? levelItemsByVariant.A;
  return variantItems[levelKey] ?? [];
}

//Configuraciones
const configs = {
  easy: { time: 180, count: 5 },
  normal: { time: 180, count: 7 },
  hard: { time: 300, count: 10 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectLeft(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function isLevelUnlocked(levelIndex) {
  return levelIndex <= maxUnlockedLevel;
}

function formatMMSS(totalSeconds) {
  const total = Math.max(0, Math.floor(totalSeconds));
  let m = Math.floor(total / 60);
  let s = total % 60;
  if (m < 10) m = "0" + m;
  if (s < 10) s = "0" + s;
  return `${m}:${s}`;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const PROGRESS_STORAGE_KEY = "gameD_progresoPorAvatar";

function loadAllProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("No se pudo leer el progreso guardado:", e);
    return {};
  }
}

function loadProgress(variant) {
  const all = loadAllProgress();
  const data = all[variant];
  return {
    maxUnlockedLevel: data?.maxUnlockedLevel ?? 0,
    moduleCompletado: data?.moduleCompletado ?? false,
    bestRaceTime: data?.bestRaceTime ?? null,
  };
}

function saveProgress(variant, progress) {
  try {
    const all = loadAllProgress();
    all[variant] = progress;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn("No se pudo guardar el progreso:", e);
  }
  refreshGlobalCompletionFlags();
}

function refreshGlobalCompletionFlags() {
  const all = loadAllProgress();
  const flags = {
    A: !!all.A?.moduleCompletado,
    B: !!all.B?.moduleCompletado,
    C: !!all.C?.moduleCompletado,
  };
  window.gameD_moduleCompletadoPorAvatar = flags;
  return flags;
}

// ─────────────────────────────────────────────
export function init() {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  const cardVariant = (window.customCardSeleccionada || "A").toUpperCase();

  // ── Imágenes ──────────────────────────────

  imgCover = new Image();
  const coverSrcs = {
    A: "src/game-d/portada-parque-a.webp",
    B: "src/game-d/portada-parque-b.webp",
    C: "src/game-d/portada-parque-c.webp",
  };
  imgCover.src = coverSrcs[cardVariant] ?? coverSrcs["A"];

  imgCoverBtn = new Image();
  imgCoverBtn.src = "src/play-btn.webp";

  imgCoverBtnRace = new Image();
  imgCoverBtnRace.src = "src/unlimit-btn.webp";

  imgPauseBtn = new Image();
  imgPauseBtn.src = "src/btn-pause.webp";

  imgResumeBtn = new Image();
  imgResumeBtn.src = "src/btn-play.webp";

  // Mapas de fondo según el avatar seleccionado (A/B/C)
  const bgSrcs = mapImageSrcsByVariant[cardVariant] ?? mapImageSrcsByVariant.A;
  imgBgEasy = new Image();
  imgBgEasy.src = bgSrcs.easy;
  imgBgNormal = new Image();
  imgBgNormal.src = bgSrcs.normal;
  imgBgHard = new Image();
  imgBgHard.src = bgSrcs.hard;

  imgBackground = new Image();
  imgBackground.src = "src/game-d/portada-parque-a.webp";
  imgPanelBg = new Image();
  imgPanelBg.src = "src/game-d/panel-bg.webp";

  imgBtnEasy = new Image();
  imgBtnEasy.src = "src/btn-level-one.webp";
  imgBtnNormal = new Image();
  imgBtnNormal.src = "src/btn-level-two.webp";
  imgBtnHard = new Image();
  imgBtnHard.src = "src/btn-level-three.webp";

  imgWin = new Image();
  const winSrcs = {
    A: "src/gamewin-a.webp",
    B: "src/gamewin-b.webp",
    C: "src/gamewin-c.webp",
  };
  imgWin.src = winSrcs[cardVariant] ?? winSrcs["A"];

  imgLose = new Image();
  const loseSrcs = {
    A: "src/gameover-a.webp",
    B: "src/gameover-b.webp",
    C: "src/gameover-c.webp",
  };
  imgLose.src = loseSrcs[cardVariant] ?? loseSrcs["A"];

  imgBtnRestart = new Image();
  imgBtnRestart.src = "src/resetbtn.webp";

  imgBtnDiff = new Image();
  imgBtnDiff.src = "src/selectbtn.webp";

  imgBtnDiffPause = new Image();
  imgBtnDiffPause.src = "src/selectbtn-b.webp";

  imgBarIcon = new Image();
  const iconSrcs = {
    A: Math.random() < 0.5 ? "src/icon-a.webp" : "src/icon-b.webp",
    B: Math.random() < 0.5 ? "src/icon-c.webp" : "src/icon-d.webp",
    C: Math.random() < 0.5 ? "src/icon-e.webp" : "src/icon-f.webp",
  };
  imgBarIcon.src = iconSrcs[cardVariant] ?? iconSrcs["A"];

  cardImages = cardsData.map((card) => {
    const img = new Image();
    img.src = card.img;
    return img;
  });

  // ── Estado inicial ─────────────────────────

  state = "cover";
  config = configs.easy;
  configKey = "easy";
  items = [];
  foundCount = 0;
  time = 0;
  endScreenTime = null;
  circuitMode = false;
  currentLevelIndex = 0;
  standaloneLevel = false;
  paused = false;

  // Modo carrera / ilimitado
  raceMode = false;
  raceLevelIndex = 0;
  raceTime = 0;
  raceFinished = false;
  lastRaceTime = null;
  isNewRecord = false;

  // Progreso por avatar: se recupera lo que ya tenía desbloqueado/completado
  // este avatar en particular (independiente de los demás avatares).
  currentCardVariant = cardVariant;
  const savedProgress = loadProgress(currentCardVariant);
  maxUnlockedLevel = savedProgress.maxUnlockedLevel;
  moduleCompletado = savedProgress.moduleCompletado;
  bestRaceTime = savedProgress.bestRaceTime;
  refreshGlobalCompletionFlags();

  hoverRestart = hoverDiff = hoverEasy = hoverNormal = hoverHard = false;
  hoverCoverBtn = hoverCoverBtnRace = hoverEntendido = hoverPause = false;

  restartBtn = { x: 645, y: 270, r: 80 };
  diffBtn = { x: 825, y: 270, r: 80 };

  // ── resize ─────────────────────────────────

  resizeHandler = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    scale = canvas.width / BASE_W;
  };
  window.addEventListener("resize", resizeHandler);
  resizeHandler();

  // ── mousemove ──────────────────────────────

  mouseMoveHandler = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    hoverRestart = hoverDiff = false;
    hoverEasy = hoverNormal = hoverHard = false;
    hoverCoverBtn = hoverCoverBtnRace = hoverEntendido = hoverPause = false;

    if (state === "cover") {
      hoverCoverBtn =
        x > coverBtn.x &&
        x < coverBtn.x + coverBtn.w &&
        y > coverBtn.y &&
        y < coverBtn.y + coverBtn.h;
      hoverCoverBtnRace =
        moduleCompletado &&
        x > coverBtnRace.x &&
        x < coverBtnRace.x + coverBtnRace.w &&
        y > coverBtnRace.y &&
        y < coverBtnRace.y + coverBtnRace.h;
    }

    if (state === "levelIntro") {
      hoverEntendido =
        x > entendidoBtn.x &&
        x < entendidoBtn.x + entendidoBtn.w &&
        y > entendidoBtn.y &&
        y < entendidoBtn.y + entendidoBtn.h;
    }

    if (state === "gameover" || state === "victory") {
      hoverRestart =
        Math.hypot(x - restartBtn.x, y - restartBtn.y) < restartBtn.r;
      hoverDiff = Math.hypot(x - diffBtn.x, y - diffBtn.y) < diffBtn.r;
    }

    if (state === "difficulty") {
      hoverEasy =
        isLevelUnlocked(0) && x > 220 && x < 380 && y > 220 && y < 310;
      hoverNormal =
        isLevelUnlocked(1) && x > 420 && x < 580 && y > 220 && y < 310;
      hoverHard =
        isLevelUnlocked(2) && x > 620 && x < 780 && y > 220 && y < 310;
    }

    if (state === "playing") {
      hoverPause = Math.hypot(x - pauseBtn.x, y - pauseBtn.y) < pauseBtn.r;
      if (paused) {
        hoverPauseDiff =
          Math.hypot(x - pauseDiffBtn.x, y - pauseDiffBtn.y) < pauseDiffBtn.r;
      }
    }

    const onMap = state === "playing" && !paused && x < PANEL_X;

    canvas.style.cursor =
      hoverRestart ||
      hoverDiff ||
      hoverEasy ||
      hoverNormal ||
      hoverHard ||
      hoverCoverBtn ||
      hoverCoverBtnRace ||
      hoverEntendido ||
      hoverPause ||
      hoverPauseDiff ||
      onMap
        ? "pointer"
        : "default";
  };
  canvas.addEventListener("mousemove", mouseMoveHandler);

  // ── mouseleave: pausa automática ───────────

  mouseLeaveHandler = () => {
    if (state === "playing") paused = true;
    hoverRestart = hoverDiff = false;
    hoverEasy = hoverNormal = hoverHard = false;
    hoverCoverBtn = hoverCoverBtnRace = hoverEntendido = hoverPause = false;
    hoverPauseDiff = false;
    canvas.style.cursor = "default";
  };
  canvas.addEventListener("mouseleave", mouseLeaveHandler);

  // ── click ──────────────────────────────────

  clickHandler = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (state === "cover") {
      if (
        x > coverBtn.x &&
        x < coverBtn.x + coverBtn.w &&
        y > coverBtn.y &&
        y < coverBtn.y + coverBtn.h
      ) {
        circuitMode = true;
        raceMode = false;
        standaloneLevel = false;
        currentLevelIndex = 0;
        usedCardIndices = [];
        showLevelIntro();
        return;
      }

      if (
        moduleCompletado &&
        x > coverBtnRace.x &&
        x < coverBtnRace.x + coverBtnRace.w &&
        y > coverBtnRace.y &&
        y < coverBtnRace.y + coverBtnRace.h
      ) {
        startRaceMode();
        return;
      }
    }

    if (state === "levelIntro") {
      if (
        x > entendidoBtn.x &&
        x < entendidoBtn.x + entendidoBtn.w &&
        y > entendidoBtn.y &&
        y < entendidoBtn.y + entendidoBtn.h
      ) {
        configKey = circuitLevels[currentLevelIndex];
        config = configs[configKey];
        dificultadActual = ["Fácil", "Media", "Difícil"][currentLevelIndex];
        resetGame();
        return;
      }
    }

    if (state === "difficulty") {
      if (isLevelUnlocked(0) && x > 220 && x < 380 && y > 220 && y < 310) {
        configKey = "easy";
        config = configs.easy;
        dificultadActual = "Fácil";
        currentLevelIndex = 0;
        circuitMode = false;
        raceMode = false;
        raceFinished = false;
        standaloneLevel = true;
        resetGame();
        return;
      }

      if (isLevelUnlocked(1) && x > 420 && x < 580 && y > 220 && y < 310) {
        configKey = "normal";
        config = configs.normal;
        dificultadActual = "Media";
        currentLevelIndex = 1;
        circuitMode = false;
        raceMode = false;
        raceFinished = false;
        standaloneLevel = true;
        resetGame();
        return;
      }

      if (isLevelUnlocked(2) && x > 620 && x < 780 && y > 220 && y < 310) {
        configKey = "hard";
        config = configs.hard;
        dificultadActual = "Difícil";
        currentLevelIndex = 2;
        circuitMode = false;
        raceMode = false;
        raceFinished = false;
        standaloneLevel = true;
        resetGame();
        return;
      }
    }

    if (state === "playing") {
      // Botón pausa/reanudar
      if (Math.hypot(x - pauseBtn.x, y - pauseBtn.y) < pauseBtn.r) {
        paused = !paused;
        return;
      }
      if (
        paused &&
        Math.hypot(x - pauseDiffBtn.x, y - pauseDiffBtn.y) < pauseDiffBtn.r
      ) {
        AudioManager.stopMusic();
        if (raceMode) {
          raceMode = false;
          raceFinished = false;
          circuitMode = false;
          paused = false;
          state = "cover";
        } else {
          circuitMode = false;
          raceMode = false;
          raceFinished = false;
          paused = false;
          state = "difficulty";
        }
        return;
      }

      // Clicks sobre items del mapa
      if (!paused) {
        let hit = false;

        items.forEach((item) => {
          if (!item.found && Math.hypot(x - item.x, y - item.y) < item.r) {
            item.found = true;
            foundCount++;
            hit = true;
            AudioManager.playSFX("src/game-d/found.mp3");

            if (foundCount >= items.length) {
              state = "finished";
              AudioManager.stopMusic();
              AudioManager.playSFX("src/sounds/victory.mp3");

              if (!raceMode) {
                if (currentLevelIndex + 1 > maxUnlockedLevel) {
                  maxUnlockedLevel = Math.min(currentLevelIndex + 1, 2);
                }

                if (currentLevelIndex === 2 && !moduleCompletado) {
                  moduleCompletado = true;
                  // console.log(
                  //   `4to Módulo de Salud fisica-emocional completado, con el avatar ${currentCardVariant}.`,
                  // );
                }

                saveProgress(currentCardVariant, {
                  maxUnlockedLevel,
                  moduleCompletado,
                  bestRaceTime,
                });
              }

              setTimeout(() => {
                if (raceMode) {
                  if (raceLevelIndex < 2) {
                    raceLevelIndex++;
                    startRaceLevel();
                  } else {
                    raceMode = false;
                    raceFinished = true;
                    state = "victory";
                    endScreenTime = performance.now();
                    lastRaceTime = raceTime;

                    const stored = loadProgress(currentCardVariant);
                    const previousBest = stored.bestRaceTime;
                    isNewRecord =
                      previousBest === null || lastRaceTime < previousBest;
                    const newBest = isNewRecord ? lastRaceTime : previousBest;
                    bestRaceTime = newBest;

                    saveProgress(currentCardVariant, {
                      maxUnlockedLevel: stored.maxUnlockedLevel,
                      moduleCompletado: stored.moduleCompletado,
                      bestRaceTime: newBest,
                    });
                  }
                } else if (circuitMode) {
                  if (currentLevelIndex < 2) {
                    currentLevelIndex++;
                    showLevelIntro();
                  } else {
                    state = "victory";
                    endScreenTime = performance.now();
                    circuitCompleted = true;
                    circuitMode = false;
                  }
                } else {
                  state = "victory";
                  endScreenTime = performance.now();
                }
              }, 2500);
            }
          }
        });

        if (!hit && x < PANEL_X) {
          AudioManager.playSFX("src/game-d/miss04.mp3");
        }
      }
    }

    if (state === "gameover" || state === "victory") {
      if (performance.now() - endScreenTime < 600) return;
      if (Math.hypot(x - restartBtn.x, y - restartBtn.y) < restartBtn.r) {
        if (raceFinished) {
          startRaceMode();
        } else {
          resetGame();
        }
      }
      if (Math.hypot(x - diffBtn.x, y - diffBtn.y) < diffBtn.r) {
        AudioManager.stopMusic();
        if (raceFinished) {
          raceFinished = false;
          raceMode = false;
          circuitMode = false;
          state = "cover";
        } else if (standaloneLevel) {
          // Se jugó un solo nivel desde "Seleccionar nivel": vuelve ahí
          circuitMode = false;
          state = "difficulty";
        } else {
          // Se jugó el circuito completo (ganado o perdido): vuelve al menú principal
          circuitMode = false;
          circuitCompleted = false;
          state = "cover";
        }
      }
    }
  };
  canvas.addEventListener("click", clickHandler);

  // ── Temporizador ───────────────────────────

  intervalTime = setInterval(() => {
    if (raceMode) {
      if (!paused && (state === "playing" || state === "finished")) {
        raceTime++;
      }
      return;
    }

    if (state === "playing" && !paused) {
      time--;
      if (time <= 0) {
        paused = false;
        state = "gameover";
        endScreenTime = performance.now();
        AudioManager.stopMusic();
        AudioManager.playSFX("src/sounds/gameover.mp3");
      }
    }
  }, 1000);

  // ── Loop ───────────────────────────────────

  function loop() {
    draw();
    animationId = requestAnimationFrame(loop);
  }
  loop();
}

function showLevelIntro() {
  const available = cardsData
    .map((_, i) => i)
    .filter((i) => !usedCardIndices.includes(i));
  const pool = available.length > 0 ? available : cardsData.map((_, i) => i);
  const idx = pool[Math.floor(Math.random() * pool.length)];
  usedCardIndices.push(idx);
  currentCardData = { ...cardsData[idx], imgObj: cardImages[idx] };
  state = "levelIntro";
}

// ─────────────────────────────────────────────
export function cleanup() {
  AudioManager.stopAll();
  window.removeEventListener("resize", resizeHandler);
  canvas.removeEventListener("mousemove", mouseMoveHandler);
  canvas.removeEventListener("mouseleave", mouseLeaveHandler);
  canvas.removeEventListener("click", clickHandler);

  clearInterval(intervalTime);
  cancelAnimationFrame(animationId);

  canvas.style.cursor = "default";
}

// ─────────────────────────────────────────────

function resetGame() {
  const source = getLevelItems(configKey);
  const pool = [...source];
  const chosen = [];
  const count = Math.min(config.count, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    chosen.push({ ...pool[idx], found: false });
    pool.splice(idx, 1);
  }
  items = chosen;
  foundCount = 0;
  time = config.time;
  state = "playing";
  paused = false;
  endScreenTime = null;
  AudioManager.playMusic("src/game-d/bgmusic-d.mp3");
}

function startRaceMode() {
  raceMode = true;
  raceFinished = false;
  circuitMode = false;
  standaloneLevel = false;
  raceLevelIndex = 0;
  raceTime = 0;
  lastRaceTime = null;
  isNewRecord = false;
  startRaceLevel();
}

function startRaceLevel() {
  configKey = circuitLevels[raceLevelIndex];
  config = configs[configKey];
  currentLevelIndex = raceLevelIndex;
  dificultadActual = ["Fácil", "Media", "Difícil"][raceLevelIndex];

  items = shuffleArray(getLevelItems(configKey)).map((it) => ({
    ...it,
    found: false,
  }));
  foundCount = 0;
  state = "playing";
  paused = false;
  endScreenTime = null;
  AudioManager.playMusic("src/game-d/bgmusic-d.mp3");
}

function getMapImage() {
  if (configKey === "easy") return imgBgEasy;
  if (configKey === "normal") return imgBgNormal;
  return imgBgHard;
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === "cover") {
    drawCover();
    return;
  }
  if (state === "levelIntro") {
    drawLevelIntro();
    return;
  }
  if (state === "difficulty") {
    drawDifficulty();
    return;
  }

  drawBackground();
  drawPanel();
  drawCircles();
  drawUI();

  if (state === "playing") {
    if (paused) drawPauseOverlay();
    drawPauseButton();
  }

  if (state === "gameover") drawGameOver();
  if (state === "victory") drawVictory();
}

// ─── Portada ──────────────────────────────────────────────────────────────────

function drawCover() {
  coverBtn.y = moduleCompletado ? 290 : 390;

  if (imgCover.complete && imgCover.naturalWidth > 0) {
    ctx.drawImage(imgCover, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Efecto de rebote/pulso en el botón
  const pulse = 1 + Math.sin(performance.now() / 180) * 0.04;
  const cx = coverBtn.x + coverBtn.w / 2;
  const cy = coverBtn.y + coverBtn.h / 2;
  const drawW = coverBtn.w * pulse;
  const drawH = coverBtn.h * pulse;

  ctx.globalAlpha = hoverCoverBtn ? 0.8 : 1;

  if (imgCoverBtn.complete && imgCoverBtn.naturalWidth > 0) {
    const ratio = imgCoverBtn.naturalWidth / imgCoverBtn.naturalHeight;
    let finalW = drawW;
    let finalH = finalW / ratio;
    if (finalH > drawH) {
      finalH = drawH;
      finalW = finalH * ratio;
    }
    ctx.drawImage(
      imgCoverBtn,
      (cx - finalW / 2) * scale,
      (cy - finalH / 2) * scale,
      finalW * scale,
      finalH * scale,
    );
  } else {
    ctx.fillStyle = "#F8C436";
    roundRect(
      ctx,
      (cx - drawW / 2) * scale,
      (cy - drawH / 2) * scale,
      drawW * scale,
      drawH * scale,
      12 * scale,
    );
    ctx.fill();
    ctx.fillStyle = "#091C53";
    ctx.font = `bold ${22 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("¡JUGAR!", cx * scale, (cy + 8) * scale);
    ctx.textAlign = "left";
  }
  ctx.globalAlpha = 1;

  if (moduleCompletado) {
    const cx2 = coverBtnRace.x + coverBtnRace.w / 2;
    const cy2 = coverBtnRace.y + coverBtnRace.h / 2;

    ctx.globalAlpha = hoverCoverBtnRace ? 0.8 : 1;

    if (imgCoverBtnRace.complete && imgCoverBtnRace.naturalWidth > 0) {
      const ratio2 =
        imgCoverBtnRace.naturalWidth / imgCoverBtnRace.naturalHeight;
      let finalW2 = coverBtnRace.w;
      let finalH2 = finalW2 / ratio2;
      if (finalH2 > coverBtnRace.h) {
        finalH2 = coverBtnRace.h;
        finalW2 = finalH2 * ratio2;
      }
      ctx.drawImage(
        imgCoverBtnRace,
        (cx2 - finalW2 / 2) * scale,
        (cy2 - finalH2 / 2) * scale,
        finalW2 * scale,
        finalH2 * scale,
      );
    } else {
      ctx.fillStyle = "#F8C436";
      roundRect(
        ctx,
        (cx2 - coverBtnRace.w / 2) * scale,
        (cy2 - coverBtnRace.h / 2) * scale,
        coverBtnRace.w * scale,
        coverBtnRace.h * scale,
        12 * scale,
      );
      ctx.fill();
      ctx.fillStyle = "#091C53";
      ctx.font = `bold ${22 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("¡JUGAR!", cx2 * scale, (cy2 + 8) * scale);
      ctx.textAlign = "left";
    }
    ctx.globalAlpha = 1;
  }
}

// ─── Intro de nivel ───────────────────────────────────────────────────────────

function drawLevelIntro() {
  if (imgBackground.complete && imgBackground.naturalWidth > 0) {
    ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawOverlay();

  // Título del nivel
  ctx.fillStyle = "white";
  ctx.font = `bold ${58 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    circuitNames[currentLevelIndex],
    (BASE_W / 2) * scale,
    110 * scale,
  );
  ctx.textAlign = "left";

  // Tarjeta
  const cardX = 160,
    cardY = 145,
    cardW = 680,
    cardH = 265,
    cardR = 18;
  const imgW = cardW * 0.4;
  const rightX = cardX + imgW + 28;
  const rightY = cardY + 60;
  const rightW = cardW - imgW - 55;

  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 18 * scale;

  ctx.fillStyle = "white";
  roundRect(
    ctx,
    cardX * scale,
    cardY * scale,
    cardW * scale,
    cardH * scale,
    cardR * scale,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  if (
    currentCardData?.imgObj?.complete &&
    currentCardData.imgObj.naturalWidth > 0
  ) {
    ctx.save();
    roundRectLeft(
      ctx,
      cardX * scale,
      cardY * scale,
      imgW * scale,
      cardH * scale,
      cardR * scale,
    );
    ctx.clip();
    ctx.drawImage(
      currentCardData.imgObj,
      cardX * scale,
      cardY * scale,
      imgW * scale,
      cardH * scale,
    );
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = "#cce0ff";
    roundRectLeft(
      ctx,
      cardX * scale,
      cardY * scale,
      imgW * scale,
      cardH * scale,
      cardR * scale,
    );
    ctx.fill();
    ctx.restore();
  }

  if (currentCardData) {
    ctx.fillStyle = "#091C53";
    ctx.font = `bold ${22 * scale}px sans-serif`;
    ctx.fillText(currentCardData.subtitle, rightX * scale, rightY * scale);

    ctx.fillStyle = "#111111";
    ctx.font = `${17 * scale}px sans-serif`;
    wrapText(
      ctx,
      currentCardData.text,
      rightX * scale,
      (rightY + 35) * scale,
      rightW * scale,
      24 * scale,
    );
  }

  // Botón "Entendido"
  const { x: bx, y: by, w: bw, h: bh } = entendidoBtn;
  ctx.fillStyle = hoverEntendido ? "#0a2875" : "#091C53";
  roundRect(ctx, bx * scale, by * scale, bw * scale, bh * scale, 10 * scale);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = `bold ${17 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("Entendido", (bx + bw / 2) * scale, (by + bh / 2 + 6) * scale);
  ctx.textAlign = "left";
}

// ─── Fondo del juego ──────────────────────────────────────────────────────────

function drawBackground() {
  const mapImg = getMapImage();
  if (mapImg.complete && mapImg.naturalWidth > 0) {
    ctx.drawImage(mapImg, 0, 0, PANEL_X * scale, canvas.height);
  } else {
    ctx.fillStyle = "#888";
    ctx.fillRect(0, 0, PANEL_X * scale, canvas.height);
  }
}

// ─── Panel derecho ────────────────────────────────────────────────────────────

function drawPanel() {
  const px = PANEL_X;
  const pw = BASE_W - PANEL_X;

  if (imgPanelBg.complete && imgPanelBg.naturalWidth > 0) {
    ctx.drawImage(imgPanelBg, px * scale, 0, pw * scale, canvas.height);
  } else {
    ctx.fillStyle = "white";
    ctx.fillRect(px * scale, 0, pw * scale, canvas.height);
  }

  // Sombra lateral
  ctx.save();
  const shadowWidth = 12 * scale;
  const gradient = ctx.createLinearGradient(
    px * scale,
    0,
    px * scale - shadowWidth,
    0,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0.25)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(px * scale - shadowWidth, 0, shadowWidth, canvas.height);
  ctx.restore();

  // Borde del panel
  ctx.save();
  ctx.strokeStyle = "#B5C350";
  ctx.lineWidth = 4 * scale;
  ctx.strokeRect(
    px * scale + 2.5 * scale,
    2.5 * scale,
    pw * scale - 5 * scale,
    canvas.height - 5 * scale,
  );
  ctx.restore();

  // Temporizador
  if (raceMode) {
    ctx.fillStyle = "white";
    ctx.font = `${40 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(formatMMSS(raceTime), (px + pw / 2) * scale, 50 * scale);
    ctx.textAlign = "left";
  } else {
    let m = Math.floor(time / 60);
    let s = time % 60;
    if (s < 10) s = "0" + s;
    ctx.fillStyle = "white";
    ctx.font = `${40 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`${m}:${s}`, (px + pw / 2) * scale, 50 * scale);
    ctx.textAlign = "left";
  }

  // Modo Carrera
  if (raceMode) {
    const visibleItems = items.filter((item) => !item.found).slice(0, 10);
    visibleItems.forEach((item, i) => {
      const ly = 90 + i * 32;
      const lx = px + 10;

      ctx.fillStyle = "white";
      ctx.font = `bold ${18 * scale}px sans-serif`;
      ctx.fillText(item.name, (lx + 10) * scale, (ly + 7) * scale);
    });
  } else {
    items.forEach((item, i) => {
      const ly = 90 + i * 32;
      const lx = px + 10;

      ctx.fillStyle = item.found ? "#BBBBBB" : "white";
      ctx.font = `bold ${18 * scale}px sans-serif`;
      ctx.fillText(item.name, (lx + 10) * scale, (ly + 7) * scale);

      if (item.found) {
        const tw = ctx.measureText(item.name).width;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo((lx + 10) * scale, (ly + 2) * scale);
        ctx.lineTo((lx + 10) * scale + tw, (ly + 2) * scale);
        ctx.stroke();
      }
    });
  }
}

function drawCircles() {
  items.forEach((item) => {
    if (item.found) {
      ctx.beginPath();
      ctx.arc(item.x * scale, item.y * scale, item.r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3 * scale;
      ctx.stroke();
    }
  });
}

function drawUI() {
  const barX = 60,
    barY = 20,
    barW = 320,
    barH = 22;

  ctx.fillStyle = "#091C53";
  ctx.fillRect(barX * scale, barY * scale, barW * scale, barH * scale);

  const progress = items.length > 0 ? foundCount / items.length : 0;
  ctx.fillStyle = "#F8C436";
  ctx.fillRect(
    barX * scale,
    barY * scale,
    barW * progress * scale,
    barH * scale,
  );

  const iconSize = barH + 35;
  if (imgBarIcon.complete && imgBarIcon.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      (barX - iconSize / 2 + 10) * scale,
      (barY + barH / 2) * scale,
      (iconSize / 2) * scale,
      0,
      Math.PI * 2,
    );
    ctx.clip();
    ctx.drawImage(
      imgBarIcon,
      (barX - iconSize + 10) * scale,
      (barY + barH / 2 - iconSize / 2) * scale,
      iconSize * scale,
      iconSize * scale,
    );
    ctx.restore();
  }
}

function drawOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGameOver() {
  drawOverlay();
  ctx.fillStyle = "#CE1919";
  ctx.font = `bold ${66 * scale}px sans-serif`;
  ctx.fillText("¡PERDISTE!", 550 * scale, 140 * scale);
  ctx.fillStyle = "white";
  ctx.font = `${25 * scale}px sans-serif`;
  ctx.fillText("¿Quieres volver a intentarlo?", 580 * scale, 175 * scale);
  drawEndScreen(false);
}

function drawVictory() {
  drawOverlay();
  ctx.fillStyle = "#5ED846";
  ctx.font = `bold ${62 * scale}px sans-serif`;
  ctx.fillText("¡GANASTE!", 560 * scale, 140 * scale);
  ctx.fillStyle = "white";
  ctx.font = `${22 * scale}px sans-serif`;
  ctx.fillText("¿Te gustaría volver a jugar?", 595 * scale, 175 * scale);
  drawEndScreen(true);
}

function drawEndScreen(win) {
  const stateImg = win ? imgWin : imgLose;
  const maxW = 450,
    maxH = BASE_H - 60;

  if (stateImg.complete && stateImg.naturalWidth > 0) {
    const ratio = stateImg.naturalWidth / stateImg.naturalHeight;
    let drawW = maxW,
      drawH = drawW / ratio;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * ratio;
    }
    ctx.drawImage(
      stateImg,
      (maxW / 2 - drawW / 2 + 50) * scale,
      (BASE_H / 2 - drawH / 2) * scale,
      drawW * scale,
      drawH * scale,
    );
  } else {
    ctx.fillStyle = win ? "#5ED846" : "#CE1919";
    ctx.fillRect(30 * scale, 150 * scale, 480 * scale, 200 * scale);
  }

  drawEndButton(imgBtnRestart, restartBtn, 55, hoverRestart);
  drawEndButton(
    imgBtnDiff,
    diffBtn,
    55,
    hoverDiff,
    raceFinished || !standaloneLevel
      ? ["Volver", "al menú"]
      : ["Seleccionar", "un nivel"],
  );

  ctx.fillStyle = "white";
  ctx.font = `${20 * scale}px sans-serif`;
  ctx.textAlign = "left";
  if (raceFinished) {
    const currentTimeStr = formatMMSS(lastRaceTime ?? raceTime);
    const bestTimeStr =
      bestRaceTime !== null ? formatMMSS(bestRaceTime) : currentTimeStr;
    const baseText = `Tiempo actual: ${currentTimeStr} - Mejor tiempo: ${bestTimeStr}`;
    ctx.fillText(baseText, 40 * scale, (BASE_H - 20) * scale);
    if (isNewRecord) {
      const textWidth = ctx.measureText(baseText + " ").width;
      ctx.fillStyle = "#FFD700";
      ctx.fillText(
        " NUEVO RECORD",
        40 * scale + textWidth,
        (BASE_H - 20) * scale,
      );
    }
  } else {
    ctx.fillText(
      `Nivel: ${currentLevelIndex + 1} (${dificultadActual})`,
      40 * scale,
      (BASE_H - 20) * scale,
    );
  }
}

function drawEndButton(img, btn, r, hover, labelLines) {
  const radius = hover ? r * 1.1 : r;
  ctx.globalAlpha = hover ? 0.9 : 1;
  ctx.save();
  ctx.beginPath();
  ctx.arc(btn.x * scale, btn.y * scale, radius * scale, 0, Math.PI * 2);
  ctx.clip();
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(
      img,
      (btn.x - radius) * scale,
      (btn.y - radius) * scale,
      radius * 2 * scale,
      radius * 2 * scale,
    );
  } else {
    ctx.fillStyle = "#4fc3f7";
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "white";
  ctx.font = `${20 * scale}px sans-serif`;
  ctx.textAlign = "left";
  if (btn === restartBtn) {
    const lines = labelLines || ["Volver", "a jugar"];
    ctx.fillText(lines[0], 615 * scale, 355 * scale);
    ctx.fillText(lines[1], 613 * scale, 380 * scale);
  } else {
    const lines = labelLines || ["Volver", "al menú"];
    const isSelectLevel = lines[0] === "Seleccionar";
    const x0 = isSelectLevel ? 775 : 795;
    const x1 = isSelectLevel ? 790 : 785;
    ctx.fillText(lines[0], x0 * scale, 355 * scale);
    ctx.fillText(lines[1], x1 * scale, 380 * scale);
  }
  ctx.textAlign = "left";
}

function drawDifficulty() {
  if (imgBackground.complete && imgBackground.naturalWidth > 0) {
    ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawOverlay();

  ctx.fillStyle = "white";
  ctx.font = `bold ${58 * scale}px sans-serif`;
  ctx.fillText("Selecciona el nivel", (BASE_W / 2 - 265) * scale, 120 * scale);

  drawDiffButton(imgBtnEasy, 300, hoverEasy, isLevelUnlocked(0));
  drawDiffButton(imgBtnNormal, 500, hoverNormal, isLevelUnlocked(1));
  drawDiffButton(imgBtnHard, 700, hoverHard, isLevelUnlocked(2));
}

function drawDiffButton(img, x, hover, unlocked = true) {
  const baseR = 75;
  const r = hover && unlocked ? baseR * 1.1 : baseR;
  const cy = 265;

  ctx.globalAlpha = !unlocked ? 0.5 : hover ? 0.9 : 1;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x * scale, cy * scale, r * scale, 0, Math.PI * 2);
  ctx.clip();
  if (!unlocked) {
    ctx.filter = "grayscale(1)";
  }
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(
      img,
      (x - r) * scale,
      (cy - r) * scale,
      r * 2 * scale,
      r * 2 * scale,
    );
  } else {
    ctx.fillStyle = "white";
    ctx.fill();
  }
  ctx.filter = "none";
  ctx.restore();
  ctx.globalAlpha = 1;

  if (!unlocked) {
    ctx.fillStyle = "white";
    ctx.font = `bold ${16 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Bloqueado", x * scale, (cy + r + 24) * scale);
    ctx.textAlign = "left";
  }
}

// ─── Pausa ────────────────────────────────────────────────────────────────────

function drawPauseButton() {
  const { x, y, r } = pauseBtn;
  const img = paused ? imgResumeBtn : imgPauseBtn;

  if (paused) {
    const { x: dx, y: dy, r: dr } = pauseDiffBtn;
    ctx.save();
    ctx.beginPath();
    ctx.arc(dx * scale, dy * scale, dr * scale, 0, Math.PI * 2);
    ctx.clip();
    if (imgBtnDiffPause.complete && imgBtnDiffPause.naturalWidth > 0) {
      ctx.drawImage(
        imgBtnDiffPause,
        (dx - dr) * scale,
        (dy - dr) * scale,
        dr * 2 * scale,
        dr * 2 * scale,
      );
    } else {
      ctx.fillStyle = hoverPauseDiff ? "#0a2875" : "#091C53";
      ctx.fill();
    }
    ctx.restore();

    ctx.globalAlpha = hoverPauseDiff ? 0.85 : 1;
    ctx.fillStyle = "white";
    ctx.font = `${18 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      raceMode ? "Volver" : "Seleccionar",
      dx * scale,
      (dy + dr + 18) * scale,
    );
    ctx.fillText(
      raceMode ? "al menú" : "un nivel",
      dx * scale,
      (dy + dr + 38) * scale,
    );
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  // Botón pausa / reanudar
  ctx.save();
  ctx.beginPath();
  ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2);
  ctx.clip();
  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(
      img,
      (x - r) * scale,
      (y - r) * scale,
      r * 2 * scale,
      r * 2 * scale,
    );
  } else {
    ctx.fillStyle = paused ? "#FFFFFF" : "#FFFFFF";
    ctx.fillRect(
      (x - r) * scale,
      (y - r) * scale,
      r * 2 * scale,
      r * 2 * scale,
    );
  }
  ctx.restore();

  ctx.fillStyle = paused ? "#FFFFFF" : "#FFFFFF";
  ctx.font = `${18 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(paused ? "Reanudar" : "Pausa", x * scale, (y + r + 22) * scale);
  ctx.textAlign = "left";
}

function drawPauseOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.95)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = `bold ${64 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("PAUSA", (BASE_W / 2) * scale, 220 * scale);

  ctx.font = `${24 * scale}px sans-serif`;
  ctx.fillText(
    "Presiona el botón para reanudar",
    (BASE_W / 2) * scale,
    270 * scale,
  );
  ctx.textAlign = "left";
}
