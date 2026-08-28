import * as AudioManager from "./audioManager.js";

let canvas, ctx;

const BASE_W = 1000;
const BASE_H = 500;

let scale = 1;

// Referencias a handlers y temporizadores
let resizeHandler;
let mouseMoveHandler1;
let mouseMoveHandler2;
let mouseLeaveHandler;
let clickHandler;
let keyDownHandler;
let keyUpHandler;
let intervalTime;
let intervalSpawn;
let raceDifficultyInterval;
let animationId;

// Cursor auto-oculto
let cursorTimeout = null;

// Imágenes
let imgBackground, imgPlayer;
let imgBtnEasy, imgBtnNormal, imgBtnHard;
let imgWin, imgLose, imgBtnRestart, imgBtnDiff, imgBtnDiffPause;
let imgLife, imgBarIcon;
let imgGood, imgBad, imgBonus;
let imgCover, imgCoverBtn, imgCoverBtnRace;

let imgPauseBtn;
let imgResumeBtn;

// Estado del juego
let state;
let config;
let dificultadActual;
let items;
let score;
let lives;
let time;
let endScreenTime = null;
let paused = false;

// Teclas presionadas
const keysPressed = {};
const PLAYER_SPEED = 5;

// Circuit mode
let circuitMode = false;
let goodMessageToggle = false;
let circuitCompleted = false;
let currentLevelIndex = 0;
let usedCardIndices = [];
let standaloneLevel = false;
const circuitLevels = ["easy", "normal", "hard"];
const circuitNames = ["Nivel 1", "Nivel 2", "Nivel 3"];
const circuitLevelItems = {
  0: [0, 1, 2, 3, 4], // Nivel 1: a–e
  1: [5, 6, 7, 8, 9], // Nivel 2: f–j
  2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // Nivel 3: a–j
};

// Desbloqueo progresivo de niveles
// 0 = solo Nivel 1 (easy) habilitado, 1 = hasta Nivel 2 (normal), 2 = hasta Nivel 3 (hard)
let maxUnlockedLevel = 0;
let moduleCompletado = false;
let currentCardVariant = "A";

// Modo carrera / ilimitado: por oleadas, hasta perder las 3 vidas
let raceMode = false;
let raceFinished = false;
let raceWave = 1;
let lastRaceScore = null;
let bestRaceScore = null;
let isNewRecord = false;

const RACE_RAMP_INTERVAL_MS = 12000;
const RACE_RAMP_STEP = 0.2;

// Level intro
let currentCardData = null;

// Tarjetas
const cardsData = [
  {
    img: "src/game-a/gamea-t1.webp",
    subtitle: "Agua limpia para tomar",
    text: "Asegurate que tu perro siempre tenga agua limpia para tomar.",
  },
  {
    img: "src/game-a/gamea-t2.webp",
    subtitle: "Los chocolates son venenos",
    text: "Mantén el chocolate y los dulces lejos de tu perro, porque le hacen mucho daño.",
  },
  {
    img: "src/game-a/gamea-t3.webp",
    subtitle: "Comida hecha para perros",
    text: "La mejor comida para un perro es la que está hecha para él.",
  },
  {
    img: "src/game-a/gamea-t4.webp",
    subtitle: "Una cantidad justa",
    text: "Ni muy poca ni demasiada comida, comer demasiado también puede hacerle daño a tu perro.",
  },
  {
    img: "src/game-a/gamea-t5.webp",
    subtitle: "siempre pregunta a un adulto",
    text: "Antes de darle algo nuevo, pide ayuda a un adulto.",
  },
  {
    img: "src/game-a/gamea-t6.webp",
    subtitle: "Lo picante le hace daño",
    text: "La comida picante no es buena para los perros, pueden hacerle doler mucho el estómago.",
  },
];

let cardImages = [];

// Botones especiales
const coverBtn = { x: 750, y: 390, w: 210, h: 90 };
const coverBtnRace = { x: 750, y: 290 + 70, w: 210, h: 90 };
const entendidoBtn = { x: 560, y: 310, w: 160, h: 42 };
const pauseBtn = { x: 940, y: 420, r: 35 };
const pauseDiffBtn = { x: 940, y: 300, r: 35 };

// Hover
let hoverRestart, hoverDiff;
let hoverEasy, hoverNormal, hoverHard;
let hoverCoverBtn = false;
let hoverCoverBtnRace = false;
let hoverEntendido = false;
let hoverPause = false;
let hoverPauseDiff = false;

// Botones fin de partida
let restartBtn, diffBtn;

// Jugador
let player;

const ITEM_SIZE = 90;

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

// Esquinas izquierdas redondeadas (imagen dentro de la tarjeta)
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

// ── Persistencia de progreso por avatar ──────────────────────────────────────

const PROGRESS_STORAGE_KEY = "gameA_progresoPorAvatar";

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
    bestRaceScore: data?.bestRaceScore ?? null,
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
  window.gameA_moduleCompletadoPorAvatar = flags;
  return flags;
}

// ─── Cursor helpers ───────────────────────────────────────────────────────────

function showCursor(isPointer = false) {
  canvas.style.cursor = isPointer ? "pointer" : "default";
  clearTimeout(cursorTimeout);
  cursorTimeout = setTimeout(() => {
    if (state === "playing") {
      canvas.style.cursor = "none";
    }
  }, 3000);
}

function hideCursor() {
  clearTimeout(cursorTimeout);
  cursorTimeout = null;
  canvas.style.cursor = "none";
}

// ─── init ─────────────────────────────────────────────────────────────────────

export function init() {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");
  const cardVariant = (window.customCardSeleccionada || "A").toUpperCase();

  imgCover = new Image();
  const coverSrcs = {
    A: "src/game-a/portada-cocina-a.webp",
    B: "src/game-a/portada-cocina-b.webp",
    C: "src/game-a/portada-cocina-c.webp",
  };
  imgCover.src = coverSrcs[cardVariant] ?? coverSrcs["A"];

  imgCoverBtn = new Image();
  imgCoverBtn.src = "src/play-btn.webp";

  imgCoverBtnRace = new Image();
  imgCoverBtnRace.src = "src/unlimit-btn.webp";

  imgBackground = new Image();
  const bgSrcs = {
    A: "src/game-a/bg-uno-a.webp",
    B: "src/game-a/bg-uno-b.webp",
    C: "src/game-a/bg-uno-c.webp",
  };
  imgBackground.src = bgSrcs[cardVariant] ?? bgSrcs["A"];

  imgPlayer = new Image();
  const dogSrcs = {
    A: "src/game-a/dog.webp",
    B: "src/game-a/dog-b.webp",
    C: "src/game-a/dog-c.webp",
  };
  imgPlayer.src = dogSrcs[cardVariant] ?? dogSrcs["A"];

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

  imgLife = new Image();
  imgLife.src = "src/life.webp";

  imgBarIcon = new Image();
  const iconSrcs = {
    A: Math.random() < 0.5 ? "src/icon-a.webp" : "src/icon-b.webp",
    B: Math.random() < 0.5 ? "src/icon-c.webp" : "src/icon-d.webp",
    C: Math.random() < 0.5 ? "src/icon-e.webp" : "src/icon-f.webp",
  };
  imgBarIcon.src = iconSrcs[cardVariant] ?? iconSrcs["A"];

  imgPauseBtn = new Image();
  imgPauseBtn.src = "src/btn-pause.webp";

  imgResumeBtn = new Image();
  imgResumeBtn.src = "src/btn-play.webp";

  imgGood = [
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-a.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-b.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-c.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-d.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-e.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-f.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-g.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-h.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-i.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/goodfood-j.webp";
      return i;
    })(),
  ];

  imgBad = [
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-a.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-b.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-c.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-d.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-e.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-f.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-g.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-h.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-i.webp";
      return i;
    })(),
    (() => {
      const i = new Image();
      i.src = "src/game-a/badfood-j.webp";
      return i;
    })(),
  ];

  imgBonus = (() => {
    const i = new Image();
    i.src = "src/game-a/goodfood-plus.webp";
    return i;
  })();

  cardImages = cardsData.map((card) => {
    const img = new Image();
    img.src = card.img;
    return img;
  });

  // Estado inicial
  state = "cover";
  config = configs.easy;
  items = [];
  score = 0;
  lives = 3;
  time = configs.easy.time;
  endScreenTime = null;
  circuitMode = false;
  currentLevelIndex = 0;
  standaloneLevel = false;
  paused = false;

  // Modo carrera / ilimitado
  raceMode = false;
  raceFinished = false;
  raceWave = 1;
  lastRaceScore = null;
  isNewRecord = false;

  // Progreso por avatar: se recupera lo que ya tenía desbloqueado/completado
  // este avatar en particular (independiente de los demás avatares).
  currentCardVariant = cardVariant;
  const savedProgress = loadProgress(currentCardVariant);
  maxUnlockedLevel = savedProgress.maxUnlockedLevel;
  moduleCompletado = savedProgress.moduleCompletado;
  bestRaceScore = savedProgress.bestRaceScore;
  refreshGlobalCompletionFlags();

  player = { x: 450, y: 430, w: 100, h: 40 };
  hoverRestart = hoverDiff = false;
  hoverEasy = hoverNormal = hoverHard = false;
  hoverCoverBtn = hoverCoverBtnRace = hoverEntendido = false;
  hoverPause = false;

  restartBtn = { x: 645, y: 270, r: 80 };
  diffBtn = { x: 825, y: 270, r: 80 };

  // resize
  resizeHandler = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    scale = canvas.width / BASE_W;
  };
  window.addEventListener("resize", resizeHandler);
  resizeHandler();

  // mousemove: mover jugador
  mouseMoveHandler1 = (e) => {
    if (state !== "playing" || paused) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    player.x = x - player.w / 2;
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > BASE_W) player.x = BASE_W - player.w;
  };
  canvas.addEventListener("mousemove", mouseMoveHandler1);

  // mousemove: hover + cursor auto-oculto
  mouseMoveHandler2 = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    hoverRestart = hoverDiff = false;
    hoverEasy = hoverNormal = hoverHard = false;
    hoverCoverBtn = hoverCoverBtnRace = hoverEntendido = false;
    hoverPause = false;
    hoverPauseDiff = false;

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
      // Mostrar cursor y reiniciar el temporizador de ocultado
      const isPointer = hoverPause || hoverPauseDiff;
      showCursor(isPointer);
      return; // el cursor ya fue gestionado por showCursor, salimos
    }

    // Fuera de "playing": cursor normal sin temporizador
    canvas.style.cursor =
      hoverRestart ||
      hoverDiff ||
      hoverCoverBtn ||
      hoverCoverBtnRace ||
      hoverEntendido ||
      hoverEasy ||
      hoverNormal ||
      hoverHard ||
      hoverPause ||
      hoverPauseDiff
        ? "pointer"
        : "default";
  };
  canvas.addEventListener("mousemove", mouseMoveHandler2);

  mouseLeaveHandler = () => {
    if (state === "playing") {
      paused = true;
      hideCursor();
    }
    hoverRestart = hoverDiff = false;
    hoverEasy = hoverNormal = hoverHard = false;
    hoverCoverBtn = hoverCoverBtnRace = hoverEntendido = false;
    hoverPause = false;
    hoverPauseDiff = false;

    if (state !== "playing") {
      canvas.style.cursor = "default";
    }
  };
  canvas.addEventListener("mouseleave", mouseLeaveHandler);

  // teclado: registrar teclas presionadas
  keyDownHandler = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      keysPressed[e.key] = true;
    }
  };
  keyUpHandler = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      keysPressed[e.key] = false;
    }
  };
  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);

  // click
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
        config = configs[circuitLevels[currentLevelIndex]];
        dificultadActual = ["Fácil", "Media", "Difícil"][currentLevelIndex];
        resetGame();
        return;
      }
    }

    if (state === "difficulty") {
      if (isLevelUnlocked(0) && x > 220 && x < 380 && y > 220 && y < 310) {
        config = configs.easy;
        dificultadActual = "Fácil";
        currentLevelIndex = 0;
        circuitMode = false;
        raceMode = false;
        raceFinished = false;
        standaloneLevel = true;
        resetGame();
      }

      if (isLevelUnlocked(1) && x > 420 && x < 580 && y > 220 && y < 310) {
        config = configs.normal;
        dificultadActual = "Media";
        currentLevelIndex = 1;
        circuitMode = false;
        raceMode = false;
        raceFinished = false;
        standaloneLevel = true;
        resetGame();
      }

      if (isLevelUnlocked(2) && x > 620 && x < 780 && y > 220 && y < 310) {
        config = configs.hard;
        dificultadActual = "Difícil";
        currentLevelIndex = 2;
        circuitMode = false;
        raceMode = false;
        raceFinished = false;
        standaloneLevel = true;
        resetGame();
      }
    }

    if (state === "playing") {
      if (Math.hypot(x - pauseBtn.x, y - pauseBtn.y) < pauseBtn.r) {
        paused = !paused;
        return;
      }
      if (
        paused &&
        Math.hypot(x - pauseDiffBtn.x, y - pauseDiffBtn.y) < pauseDiffBtn.r
      ) {
        clearInterval(intervalSpawn);
        AudioManager.stopMusic();
        AudioManager.stopAll();
        items = [];
        paused = false;
        keysPressed["ArrowLeft"] = false;
        keysPressed["ArrowRight"] = false;
        // Restaurar cursor al salir de "playing"
        clearTimeout(cursorTimeout);
        cursorTimeout = null;
        canvas.style.cursor = "default";

        if (raceMode) {
          raceMode = false;
          raceFinished = false;
          circuitMode = false;
          state = "cover";
        } else {
          circuitMode = false;
          raceMode = false;
          raceFinished = false;
          state = "difficulty";
        }
        return;
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
        AudioManager.stopAll();
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

  // Temporizador
  intervalTime = setInterval(() => {
    if (raceMode) return;

    if (state === "playing" && !paused) {
      time--;
      if (time <= 0) {
        paused = false;
        state = "gameover";
        endScreenTime = performance.now();
        // Restaurar cursor al salir de "playing"
        clearTimeout(cursorTimeout);
        cursorTimeout = null;
        canvas.style.cursor = "default";
        AudioManager.stopMusic();
        AudioManager.playSFX("src/sounds/gameover.mp3");
      }
    }
  }, 1000);

  // Dificultad progresiva del modo carrera (oleadas)
  raceDifficultyInterval = setInterval(() => {
    if (raceMode && state === "playing" && !paused) {
      config.fallSpeed =
        Math.round((config.fallSpeed + RACE_RAMP_STEP) * 100) / 100;

      const currentFrequency = 1000 / config.spawnInterval;
      const newFrequency = currentFrequency + RACE_RAMP_STEP;
      config.spawnInterval = 1000 / newFrequency;

      raceWave++;

      clearInterval(intervalSpawn);
      startSpawnInterval();
    }
  }, RACE_RAMP_INTERVAL_MS);

  // Loop
  function loop() {
    update();
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

export function cleanup() {
  AudioManager.stopAll();
  window.removeEventListener("resize", resizeHandler);
  window.removeEventListener("keydown", keyDownHandler);
  window.removeEventListener("keyup", keyUpHandler);
  canvas.removeEventListener("mousemove", mouseMoveHandler1);
  canvas.removeEventListener("mousemove", mouseMoveHandler2);
  canvas.removeEventListener("mouseleave", mouseLeaveHandler);
  canvas.removeEventListener("click", clickHandler);
  clearInterval(intervalTime);
  clearInterval(intervalSpawn);
  clearInterval(raceDifficultyInterval);
  cancelAnimationFrame(animationId);
  // Limpiar timeout del cursor y restaurarlo
  clearTimeout(cursorTimeout);
  cursorTimeout = null;
  canvas.style.cursor = "default";
}

function spawnItem() {
  const rand = Math.random();
  let color, imgRef;

  const allowed = circuitMode
    ? circuitLevelItems[currentLevelIndex]
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const pick = allowed[Math.floor(Math.random() * allowed.length)];

  if (rand < 0.03 && lives < 3) {
    color = "yellow";
    imgRef = imgBonus;
  } else if (rand < 0.5) {
    color = "green";
    imgRef = imgGood[pick];
  } else {
    color = "red";
    imgRef = imgBad[pick];
  }

  items.push({
    x: Math.random() * (BASE_W - ITEM_SIZE),
    y: -ITEM_SIZE,
    size: ITEM_SIZE,
    color,
    img: imgRef,
    speed: config.fallSpeed,
  });
}

function startSpawnInterval() {
  clearInterval(intervalSpawn);

  intervalSpawn = setInterval(() => {
    if (state === "playing" && !paused) {
      spawnItem();
    }
  }, config.spawnInterval);
}

function resetGame() {
  items = [];
  score = 0;
  lives = 3;
  time = config.time;
  state = "playing";
  paused = false;
  endScreenTime = null;
  startSpawnInterval();
  AudioManager.playMusic("src/game-a/bgmusic-a.mp3");
}

function startRaceMode() {
  raceMode = true;
  raceFinished = false;
  circuitMode = false;
  standaloneLevel = false;
  currentLevelIndex = 2;
  config = { ...configs.normal };
  items = [];
  score = 0;
  lives = 3;
  raceWave = 1;
  lastRaceScore = null;
  isNewRecord = false;
  state = "playing";
  paused = false;
  endScreenTime = null;
  startSpawnInterval();
  AudioManager.playMusic("src/game-a/bgmusic-a.mp3");
}

function collide(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.w > b.x &&
    a.y < b.y + b.size &&
    a.y + a.h > b.y
  );
}

function update() {
  if (state !== "playing" || paused) return;

  if (keysPressed["ArrowLeft"]) {
    player.x -= PLAYER_SPEED;
    if (player.x < 0) player.x = 0;
  }
  if (keysPressed["ArrowRight"]) {
    player.x += PLAYER_SPEED;
    if (player.x + player.w > BASE_W) player.x = BASE_W - player.w;
  }

  const now = performance.now();

  items.forEach((item, i) => {
    if (item.color === "popup") {
      if (now >= item.popupUntil) items.splice(i, 1);
      return;
    }

    item.y += item.speed;

    if (collide(player, item)) {
      if (item.color === "green") {
        score += 10;
        AudioManager.playSFX("src/game-a/gooditem.mp3");

        item.color = "popup";
        item.text = goodMessageToggle ? "¡Genial!" : "¡Muy bien!";
        goodMessageToggle = !goodMessageToggle;
        item.popupUntil = now + 800;
        return;
      }
      if (item.color === "red") {
        lives--;
        AudioManager.playSFX("src/game-a/baditem.mp3");
      }
      if (item.color === "yellow") {
        if (lives < 3) lives++;
        AudioManager.playSFX("src/game-a/powerup.mp3");
      }
      items.splice(i, 1);
      return;
    }

    if (item.y > BASE_H) items.splice(i, 1);
  });

  if (lives <= 0 && state === "playing") {
    paused = false;
    clearTimeout(cursorTimeout);
    cursorTimeout = null;
    canvas.style.cursor = "default";
    clearInterval(intervalSpawn);
    AudioManager.stopMusic();

    if (raceMode) {
      raceMode = false;
      raceFinished = true;
      lastRaceScore = score;
      state = "victory";
      endScreenTime = performance.now();
      AudioManager.playSFX("src/sounds/victory.mp3");

      const stored = loadProgress(currentCardVariant);
      const previousBest = stored.bestRaceScore;
      isNewRecord = previousBest === null || lastRaceScore > previousBest;
      const newBest = isNewRecord ? lastRaceScore : previousBest;
      bestRaceScore = newBest;

      saveProgress(currentCardVariant, {
        maxUnlockedLevel: stored.maxUnlockedLevel,
        moduleCompletado: stored.moduleCompletado,
        bestRaceScore: newBest,
      });
    } else {
      state = "gameover";
      endScreenTime = performance.now();
      AudioManager.playSFX("src/sounds/gameover.mp3");
    }
    return;
  }

  if (!raceMode && score >= config.target && state === "playing") {
    state = "finished";
    paused = false;

    // Restaurar cursor al salir de "playing"
    clearTimeout(cursorTimeout);
    cursorTimeout = null;
    canvas.style.cursor = "default";

    if (currentLevelIndex + 1 > maxUnlockedLevel) {
      maxUnlockedLevel = Math.min(currentLevelIndex + 1, 2);
    }
    if (currentLevelIndex === 2 && !moduleCompletado) {
      moduleCompletado = true;
      // console.log(
      //   `1er Módulo de alimentos completado, con el avatar ${currentCardVariant}.`,
      // );
    }
    saveProgress(currentCardVariant, {
      maxUnlockedLevel,
      moduleCompletado,
      bestRaceScore,
    });

    AudioManager.stopMusic();
    AudioManager.playSFX("src/sounds/victory.mp3");

    setTimeout(() => {
      if (circuitMode) {
        if (currentLevelIndex < 2) {
          currentLevelIndex++;
          items = [];
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

  // Fondo
  if (imgBackground.complete && imgBackground.naturalWidth > 0) {
    ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Personaje
  if (imgPlayer.complete && imgPlayer.naturalWidth > 0) {
    const pImgW = player.w + 180;
    const pImgH = pImgW * (imgPlayer.naturalHeight / imgPlayer.naturalWidth);
    const offsetX = -35;
    const pImgX = player.x + player.w / 2 - pImgW / 2 + offsetX;
    const pImgY = player.y + player.h - pImgH + 30;
    ctx.drawImage(
      imgPlayer,
      pImgX * scale,
      pImgY * scale,
      pImgW * scale,
      pImgH * scale,
    );
  }

  ctx.fillStyle = "rgba(0,0,255,0)";
  ctx.fillRect(
    player.x * scale,
    player.y * scale,
    player.w * scale,
    player.h * scale,
  );

  items.forEach((item) => {
    if (item.color === "popup") {
      ctx.font = `bold ${24 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.lineJoin = "round";

      const px = (item.x + item.size / 2) * scale;
      const py = (item.y + item.size / 2) * scale;

      ctx.strokeStyle = "white";
      ctx.lineWidth = 4 * scale;
      ctx.strokeText(item.text, px, py);

      ctx.fillStyle = "#55E755";
      ctx.fillText(item.text, px, py);

      ctx.textAlign = "left";
      return;
    }

    const img = item.img;
    if (img && img.complete && img.naturalWidth > 0) {
      const imgSize = item.size * 1.4;
      const offsetImgX = (item.size - imgSize) / 2;
      const offsetImgY = (item.size - imgSize) / 2;
      const ratio = img.naturalWidth / img.naturalHeight;
      let drawW, drawH;
      if (ratio >= 1) {
        drawW = imgSize;
        drawH = imgSize / ratio;
      } else {
        drawH = imgSize;
        drawW = imgSize * ratio;
      }
      const cx = item.x + offsetImgX + (imgSize - drawW) / 2;
      const cy = item.y + offsetImgY + (imgSize - drawH) / 2;
      ctx.drawImage(img, cx * scale, cy * scale, drawW * scale, drawH * scale);
    } else {
      ctx.fillStyle = item.color;
      ctx.fillRect(
        item.x * scale,
        item.y * scale,
        item.size * scale,
        item.size * scale,
      );
    }
  });

  drawUI();

  if (state === "playing") {
    if (paused) drawPauseOverlay();
    drawPauseButton();
  }

  if (state === "gameover") drawGameOver();
  if (state === "victory") drawVictory();
}

function drawCover() {
  coverBtn.y = moduleCompletado ? 290 : 390;

  if (imgCover.complete && imgCover.naturalWidth > 0) {
    ctx.drawImage(imgCover, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // rebote suave solo en portada
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

    const dx = (cx - finalW / 2) * scale;
    const dy = (cy - finalH / 2) * scale;

    ctx.drawImage(imgCoverBtn, dx, dy, finalW * scale, finalH * scale);
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

function drawLevelIntro() {
  // Fondo
  if (imgBackground.complete && imgBackground.naturalWidth > 0) {
    ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawOverlay();

  // Título
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

  // Sombra
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 18 * scale;

  // Fondo blanco de la tarjeta
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

  // Imagen izquierda
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
    // Subtítulo
    ctx.fillStyle = "#091C53";
    ctx.font = `bold ${22 * scale}px sans-serif`;
    ctx.fillText(currentCardData.subtitle, rightX * scale, rightY * scale);

    // Texto con salto de línea automático
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

function drawUI() {
  const barX = 60,
    barY = 20,
    barW = 320,
    barH = 22;

  ctx.fillStyle = "#091C53";
  ctx.fillRect(barX * scale, barY * scale, barW * scale, barH * scale);

  if (raceMode || raceFinished) {
    ctx.fillStyle = "white";
    ctx.font = `bold ${18 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      `Puntos: ${raceFinished ? (lastRaceScore ?? score) : score}`,
      (barX + barW / 2) * scale,
      (barY + barH - 5) * scale,
    );
    ctx.textAlign = "left";
  } else {
    ctx.fillStyle = "#F8C436";
    ctx.fillRect(
      barX * scale,
      barY * scale,
      barW * Math.min(1, score / config.target) * scale,
      barH * scale,
    );
  }

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

  for (let i = 0; i < lives; i++) {
    if (imgLife.complete && imgLife.naturalWidth > 0) {
      ctx.drawImage(
        imgLife,
        (20 + i * 35) * scale,
        65 * scale,
        30 * scale,
        30 * scale,
      );
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect((20 + i * 35) * scale, 65 * scale, 30 * scale, 30 * scale);
    }
  }

  if (raceMode || raceFinished) {
    ctx.fillStyle = "#091C53";
    ctx.font = `bold ${30 * scale}px sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(`Oleada ${raceWave}`, (BASE_W - 60) * scale, 50 * scale);
    ctx.textAlign = "left";
  } else {
    ctx.fillStyle = "#091C53";
    ctx.font = `${40 * scale}px sans-serif`;
    let m = Math.floor(time / 60);
    let s = time % 60;
    if (s < 10) s = "0" + s;
    ctx.fillText(`${m}:${s}`, (BASE_W - 120) * scale, 50 * scale);
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
  ctx.fillText(
    raceFinished
      ? "¿Te gustaría intentar superar tu puntaje?"
      : "¿Te gustaría volver a jugar?",
    raceFinished ? 545 * scale : 595 * scale,
    175 * scale,
  );
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
    const currentScore = lastRaceScore ?? score;
    const bestScoreVal = bestRaceScore !== null ? bestRaceScore : currentScore;
    const baseText = `Puntuación actual: ${currentScore} - Mejor puntuación: ${bestScoreVal}`;
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
  ctx.fillText("Selecciona el Nivel", (BASE_W / 2 - 265) * scale, 120 * scale);

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

function drawPauseButton() {
  const { x, y, r } = pauseBtn;

  if (paused) {
    // Botón seleccionar nivel / volver al menú (solo visible en pausa)
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

  const img = paused ? imgResumeBtn : imgPauseBtn;

  if (img.complete && img.naturalWidth > 0) {
    ctx.drawImage(
      img,
      (x - r) * scale,
      (y - r) * scale,
      r * 2 * scale,
      r * 2 * scale,
    );
  } else {
    ctx.fillStyle = paused ? "#FFFFFF" : "#000000";
    ctx.fillRect(
      (x - r) * scale,
      (y - r) * scale,
      r * 2 * scale,
      r * 2 * scale,
    );
  }
  ctx.restore();

  ctx.fillStyle = paused ? "#FFFFFF" : "#000000";
  ctx.font = `${18 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(paused ? "Reanudar" : "Pausa", x * scale, (y + r + 22) * scale);
  ctx.textAlign = "left";
}

function drawPauseOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
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
