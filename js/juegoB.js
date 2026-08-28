import * as AudioManager from "./audioManager.js";

let canvas, ctx;

const BASE_W = 1000;
const BASE_H = 500;

let scale = 1;

// Referencias a handlers y temporizadores
let resizeHandler;
let mouseMoveHandler;
let mouseLeaveHandler;
let clickHandler;
let mouseDownHandler;
let mouseUpHandler;
let intervalTime;
let animationId;

// Imágenes
let imgBackground;
let imgBtnEasy, imgBtnNormal, imgBtnHard;
let imgWin, imgLose, imgBtnRestart, imgBtnDiff, imgBtnDiffPause, imgBarIcon;
let imgPuzzleEasy, imgPuzzleNormal, imgPuzzleHard;
let imgBlockEasy, imgBlockNormal, imgBlockHard;
let imgCover, imgCoverBtn, imgCoverBtnRace;
let imgPauseBtn, imgResumeBtn;

// Estado del juego
let state;
let currentPuzzleImg;
let showFullImage;
let showTimer;
let config;
let dificultadActual;
let time;
let endScreenTime = null;
let paused = false;

// Sistema de piezas drag & drop
let pieces = [];
let dragPiece = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentBoardConfig = null;

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

// Modo carrera / ilimitado: armar los 3 rompecabezas consecutivos contra reloj
let raceMode = false;
let raceFinished = false;
let raceTime = 0;
let lastRaceTime = null;
let bestRaceTime = null;
let isNewRecord = false;

// Level intro
let currentCardData = null;

// Tarjetas
const cardsData = [
  {
    img: "src/game-b/gameb-t1.webp",
    subtitle: "Bajo la supervisión de un adulto",
    text: "No bañes a tu perro tú solo, siempre pide ayuda a un adulto.",
  },
  {
    img: "src/game-b/gameb-t2.webp",
    subtitle: "Con agua tibia por favor",
    text: "El agua que utilices no debe estar ni muy fría ni muy caliente.",
  },
  {
    img: "src/game-b/gameb-t3.webp",
    subtitle: "Una toalla propia",
    text: "No compartas tu toalla con tu perro, debes tener una toalla limpia solo para él.",
  },
  {
    img: "src/game-b/gameb-t4.webp",
    subtitle: "Cuidado con el jabón",
    text: "El jabón no debe entrar en sus ojos, boca, ni orejas. Lava a tu perro con cuidado para que el jabón no le haga daño.",
  },
  {
    img: "src/game-b/gameb-t5.webp",
    subtitle: "Secarlo Bien",
    text: "Después del baño, el perro debe quedar seco. Secar bien a tu perro ayuda a que no tenga frío.",
  },
  {
    img: "src/game-b/gameb-t6.webp",
    subtitle: "Baños seguros",
    text: "Bañarlo con calma ayuda a que no tenga miedo. Si lo bañas con paciencia, tu perro tendrá menos miedo.",
  },
];
let cardImages = [];

// Botones especiales
const coverBtn = { x: 750, y: 390, w: 210, h: 90 };
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

// Botones end screen
let restartBtn, diffBtn;

// Posición del tablero en canvas
const gridX = 50;
const gridY = 70;

// Configuraciones
const configs = {
  easy: { time: 180, board: { size: 3, cell: 120, gap: 6 } },
  normal: { time: 240, board: { size: 4, cell: 86, gap: 5 } },
  hard: { time: 300, board: { size: 5, cell: 66, gap: 4 } },
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

// ── Persistencia de progreso por avatar ──────────────────────────────────────

const PROGRESS_STORAGE_KEY = "gameB_progresoPorAvatar";

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
  window.gameB_moduleCompletadoPorAvatar = flags;
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
    A: "src/game-b/portada-bano-a.webp",
    B: "src/game-b/portada-bano-b.webp",
    C: "src/game-b/portada-bano-c.webp",
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

  imgBackground = new Image();
  imgBackground.src = "src/game-b/bg-bano.webp";

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

  imgPuzzleEasy = new Image();
  const easyBoardSrcs = {
    A: "src/game-b/puzzle-a01.webp",
    B: "src/game-b/puzzle-b01.webp",
    C: "src/game-b/puzzle-c01.webp",
  };
  imgPuzzleEasy.src = easyBoardSrcs[cardVariant] ?? easyBoardSrcs["A"];

  imgPuzzleNormal = new Image();
  const normalBoardSrcs = {
    A: "src/game-b/puzzle-a02.webp",
    B: "src/game-b/puzzle-b02.webp",
    C: "src/game-b/puzzle-c02.webp",
  };
  imgPuzzleNormal.src = normalBoardSrcs[cardVariant] ?? normalBoardSrcs["A"];

  imgPuzzleHard = new Image();
  const hardBoardSrcs = {
    A: "src/game-b/puzzle-a03.webp",
    B: "src/game-b/puzzle-b03.webp",
    C: "src/game-b/puzzle-c03.webp",
  };
  imgPuzzleHard.src = hardBoardSrcs[cardVariant] ?? hardBoardSrcs["A"];

  imgBlockEasy = new Image();
  const easyBlockSrcs = {
    A: "src/game-b/bath-chars-a01.webp",
    B: "src/game-b/bath-chars-b01.webp",
    C: "src/game-b/bath-chars-c01.webp",
  };
  imgBlockEasy.src = easyBlockSrcs[cardVariant] ?? easyBlockSrcs["A"];

  imgBlockNormal = new Image();
  const normalBlockSrcs = {
    A: "src/game-b/bath-chars-a02.webp",
    B: "src/game-b/bath-chars-b02.webp",
    C: "src/game-b/bath-chars-c02.webp",
  };
  imgBlockNormal.src = normalBlockSrcs[cardVariant] ?? normalBlockSrcs["A"];

  imgBlockHard = new Image();
  const hardBlockSrcs = {
    A: "src/game-b/bath-chars-a03.webp",
    B: "src/game-b/bath-chars-b03.webp",
    C: "src/game-b/bath-chars-c03.webp",
  };
  imgBlockHard.src = hardBlockSrcs[cardVariant] ?? hardBlockSrcs["A"];

  cardImages = cardsData.map((card) => {
    const img = new Image();
    img.src = card.img;
    return img;
  });

  // ── Estado inicial ─────────────────────────

  state = "cover";
  config = configs.easy;
  currentBoardConfig = config.board;
  currentPuzzleImg = imgPuzzleEasy;
  showFullImage = false;
  showTimer = 0;
  pieces = [];
  dragPiece = null;
  dragOffsetX = 0;
  dragOffsetY = 0;
  time = 300;
  endScreenTime = null;
  circuitMode = false;
  standaloneLevel = false;
  currentLevelIndex = 0;
  paused = false;

  // Modo carrera / ilimitado
  raceMode = false;
  raceFinished = false;
  raceTime = 0;
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

    // Actualizar posición de la pieza arrastrada
    if (dragPiece && state === "playing" && !paused && !showFullImage) {
      dragPiece.x = x - dragOffsetX;
      dragPiece.y = y - dragOffsetY;
    }

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

    // Cursor sobre pieza no colocada
    let overPiece = false;
    if (
      state === "playing" &&
      !paused &&
      !showFullImage &&
      currentBoardConfig
    ) {
      const { cell } = currentBoardConfig;
      overPiece = pieces.some(
        (p) =>
          !p.placed &&
          x >= p.x &&
          x <= p.x + cell &&
          y >= p.y &&
          y <= p.y + cell,
      );
    }

    canvas.style.cursor = dragPiece
      ? "grabbing"
      : overPiece
        ? "grab"
        : hoverRestart ||
            hoverDiff ||
            hoverEasy ||
            hoverNormal ||
            hoverHard ||
            hoverCoverBtn ||
            hoverCoverBtnRace ||
            hoverEntendido ||
            hoverPause ||
            hoverPauseDiff
          ? "pointer"
          : "default";
  };
  canvas.addEventListener("mousemove", mouseMoveHandler);

  // ── mouseleave: pausa automática + cancelar drag ───

  mouseLeaveHandler = () => {
    dragPiece = null;
    if (state === "playing" && !showFullImage) paused = true;
    hoverRestart = hoverDiff = false;
    hoverEasy = hoverNormal = hoverHard = false;
    hoverCoverBtn = hoverCoverBtnRace = hoverEntendido = hoverPause = false;
    hoverPauseDiff = false;
    canvas.style.cursor = "default";
  };
  canvas.addEventListener("mouseleave", mouseLeaveHandler);

  // ── mousedown: iniciar arrastre ────────────

  mouseDownHandler = (e) => {
    if (state !== "playing" || paused || showFullImage) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (Math.hypot(x - pauseBtn.x, y - pauseBtn.y) < pauseBtn.r) return;

    const { cell } = currentBoardConfig;

    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (
        !p.placed &&
        x >= p.x &&
        x <= p.x + cell &&
        y >= p.y &&
        y <= p.y + cell
      ) {
        dragPiece = p;
        dragOffsetX = x - p.x;
        dragOffsetY = y - p.y;
        // Traer al frente del orden de dibujo
        pieces.splice(i, 1);
        pieces.push(p);
        e.preventDefault();
        break;
      }
    }
  };
  canvas.addEventListener("mousedown", mouseDownHandler);

  // ── mouseup: soltar y verificar snap ──────

  mouseUpHandler = (e) => {
    if (!dragPiece) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const { cell } = currentBoardConfig;

    dragPiece.x = x - dragOffsetX;
    dragPiece.y = y - dragOffsetY;

    const pCx = dragPiece.x + cell / 2;
    const pCy = dragPiece.y + cell / 2;
    const tCx = dragPiece.targetX + cell / 2;
    const tCy = dragPiece.targetY + cell / 2;
    const snapThreshold = cell / 3;

    if (Math.hypot(pCx - tCx, pCy - tCy) <= snapThreshold) {
      dragPiece.x = dragPiece.targetX;
      dragPiece.y = dragPiece.targetY;
      dragPiece.placed = true;
      AudioManager.playSFX("src/game-b/move.mp3");
      if (isSolved()) {
        showFullImage = true;
        showTimer = raceMode ? 180 : 300;
      }
    }

    dragPiece = null;
  };
  window.addEventListener("mouseup", mouseUpHandler);

  // ── click: botones de UI ───────────────────

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
        startGame();
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
        startGame();
      }

      if (isLevelUnlocked(1) && x > 420 && x < 580 && y > 220 && y < 310) {
        config = configs.normal;
        dificultadActual = "Media";
        currentLevelIndex = 1;
        circuitMode = false;
        raceMode = false;
        raceFinished = false;
        standaloneLevel = true;
        startGame();
      }

      if (isLevelUnlocked(2) && x > 620 && x < 780 && y > 220 && y < 310) {
        config = configs.hard;
        dificultadActual = "Difícil";
        currentLevelIndex = 2;
        circuitMode = false;
        raceMode = false;
        raceFinished = false;
        standaloneLevel = true;
        startGame();
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
    }

    if (state === "gameover" || state === "victory") {
      if (performance.now() - endScreenTime < 600) return;
      if (Math.hypot(x - restartBtn.x, y - restartBtn.y) < restartBtn.r) {
        if (raceFinished) {
          startRaceMode();
        } else {
          startGame();
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
      if (!paused && state === "playing") {
        raceTime++;
      }
      return;
    }

    if (state === "playing" && !paused && !showFullImage) {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state === "cover") {
      drawCover();
    } else if (state === "levelIntro") {
      drawLevelIntro();
    } else if (state === "difficulty") {
      drawDifficulty();
    } else {
      if (imgBackground.complete) {
        ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
      }

      // Orden de capas: personajes → huecos → piezas → UI
      drawCharacters();
      drawBoardSlots();
      drawPieces();
      drawUI();

      // Animación de puzzle resuelto
      if (showFullImage && currentPuzzleImg.complete) {
        const { size, cell, gap } = currentBoardConfig;
        const boardW = size * (cell + gap) - gap;
        ctx.drawImage(
          currentPuzzleImg,
          gridX * scale,
          gridY * scale,
          boardW * scale,
          boardW * scale,
        );

        if (!paused) {
          showTimer--;
          if (showTimer <= 0) {
            showFullImage = false;
            paused = false;
            AudioManager.stopMusic();

            if (!raceMode) {
              if (currentLevelIndex + 1 > maxUnlockedLevel) {
                maxUnlockedLevel = Math.min(currentLevelIndex + 1, 2);
              }
              if (currentLevelIndex === 2 && !moduleCompletado) {
                moduleCompletado = true;
                // console.log(
                //   `2do Módulo de Baño completado, con el avatar ${currentCardVariant}.`,
                // );
              }
              saveProgress(currentCardVariant, {
                maxUnlockedLevel,
                moduleCompletado,
                bestRaceTime,
              });
            }

            if (raceMode) {
              if (currentLevelIndex < 2) {
                currentLevelIndex++;
                AudioManager.playSFX("src/sounds/victory.mp3");
                config = configs[circuitLevels[currentLevelIndex]];
                dificultadActual = ["Fácil", "Media", "Difícil"][
                  currentLevelIndex
                ];
                startGame();
              } else {
                raceMode = false;
                raceFinished = true;
                lastRaceTime = raceTime;
                state = "victory";
                endScreenTime = performance.now();
                AudioManager.playSFX("src/sounds/victory.mp3");

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
                AudioManager.playSFX("src/sounds/victory.mp3");
                showLevelIntro();
              } else {
                state = "victory";
                endScreenTime = performance.now();
                circuitCompleted = true;
                circuitMode = false;
                AudioManager.playSFX("src/sounds/victory.mp3");
              }
            } else {
              state = "victory";
              endScreenTime = performance.now();
              AudioManager.playSFX("src/sounds/victory.mp3");
            }
          }
        }
      } else {
        if (state === "playing") {
          if (paused) drawPauseOverlay();
          drawPauseButton();
        }
        if (state === "gameover") drawGameOver();
        if (state === "victory") drawVictory();
      }
    }

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
  window.removeEventListener("mouseup", mouseUpHandler);
  canvas.removeEventListener("mousemove", mouseMoveHandler);
  canvas.removeEventListener("mouseleave", mouseLeaveHandler);
  canvas.removeEventListener("mousedown", mouseDownHandler);
  canvas.removeEventListener("click", clickHandler);
  clearInterval(intervalTime);
  cancelAnimationFrame(animationId);
  canvas.style.cursor = "default";
}

function createScatterPositions(size, cell) {
  const total = size * size;

  // Área de dispersión: zona derecha del canvas
  const areaX1 = 458;
  const areaX2 = 968 - cell;
  const areaY1 = 22;
  const areaY2 = 468 - cell;
  const rangeX = areaX2 - areaX1;
  const rangeY = areaY2 - areaY1;

  // Rejilla blanda: número de columnas proporcional al aspecto del área
  const cols = Math.ceil(Math.sqrt(total * (rangeX / rangeY)));
  const rows = Math.ceil(total / cols);
  const cellW = rangeX / cols;
  const cellH = rangeY / rows;

  const positions = [];
  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const px =
      areaX1 + col * cellW + cellW * 0.5 + (Math.random() - 0.5) * cellW * 0.8;
    const py =
      areaY1 + row * cellH + cellH * 0.5 + (Math.random() - 0.5) * cellH * 0.8;
    positions.push({
      x: Math.max(areaX1, Math.min(areaX2, px)),
      y: Math.max(areaY1, Math.min(areaY2, py)),
    });
  }

  // Cada pieza recibe una posición aleatoria
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  return positions;
}

function isSolved() {
  return pieces.length > 0 && pieces.every((p) => p.placed);
}

function getProgress() {
  if (!pieces.length) return 0;
  return pieces.filter((p) => p.placed).length / pieces.length;
}

function startGame() {
  currentBoardConfig = config.board;
  const { size, cell, gap } = currentBoardConfig;

  if (config === configs.easy) currentPuzzleImg = imgPuzzleEasy;
  else if (config === configs.normal) currentPuzzleImg = imgPuzzleNormal;
  else currentPuzzleImg = imgPuzzleHard;

  const scatterPositions = createScatterPositions(size, cell);

  pieces = [];
  for (let id = 0; id < size * size; id++) {
    const row = Math.floor(id / size);
    const col = id % size;
    pieces.push({
      id,
      x: scatterPositions[id].x,
      y: scatterPositions[id].y,
      placed: false,
      targetX: gridX + col * (cell + gap),
      targetY: gridY + row * (cell + gap),
    });
  }

  dragPiece = null;
  showFullImage = false;
  showTimer = 0;
  time = config.time;
  state = "playing";
  paused = false;
  endScreenTime = null;
  AudioManager.playMusic("src/game-b/bgmusic-b.mp3");
}

function startRaceMode() {
  raceMode = true;
  raceFinished = false;
  circuitMode = false;
  standaloneLevel = false;
  currentLevelIndex = 0;
  usedCardIndices = [];
  raceTime = 0;
  lastRaceTime = null;
  isNewRecord = false;

  // Se asigna el primer nivel y se inicia directo sin tarjeta educativa
  config = configs[circuitLevels[currentLevelIndex]];
  dificultadActual = ["Fácil", "Media", "Difícil"][currentLevelIndex];
  startGame();
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function drawBoardSlots() {
  if (!currentBoardConfig) return;
  const { size, cell, gap } = currentBoardConfig;
  const snapThreshold = cell / 3;

  for (let id = 0; id < size * size; id++) {
    const row = Math.floor(id / size);
    const col = id % size;
    const tx = gridX + col * (cell + gap);
    const ty = gridY + row * (cell + gap);
    const piece = pieces.find((p) => p.id === id);
    const isPlaced = piece && piece.placed;

    // Fondo del hueco
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(tx * scale, ty * scale, cell * scale, cell * scale);

    // Resaltar hueco cuando la pieza arrastrada está cerca
    if (dragPiece && dragPiece.id === id && !isPlaced) {
      const dist = Math.hypot(
        dragPiece.x + cell / 2 - (tx + cell / 2),
        dragPiece.y + cell / 2 - (ty + cell / 2),
      );
      if (dist <= snapThreshold * 1.8) {
        ctx.fillStyle = "rgba(248,196,54,0.38)";
        ctx.fillRect(tx * scale, ty * scale, cell * scale, cell * scale);
      }
    }

    // Borde del hueco
    ctx.strokeStyle = isPlaced
      ? "rgba(255,255,255,0.2)"
      : "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(tx * scale, ty * scale, cell * scale, cell * scale);
  }
}

function drawPiece(p) {
  if (
    !currentBoardConfig ||
    !currentPuzzleImg.complete ||
    !currentPuzzleImg.naturalWidth
  )
    return;
  const { size, cell } = currentBoardConfig;
  const pieceW = currentPuzzleImg.naturalWidth / size;
  const pieceH = currentPuzzleImg.naturalHeight / size;
  const sx = (p.id % size) * pieceW;
  const sy = Math.floor(p.id / size) * pieceH;

  if (p === dragPiece) {
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = 14 * scale;
  }

  ctx.drawImage(
    currentPuzzleImg,
    sx,
    sy,
    pieceW,
    pieceH,
    p.x * scale,
    p.y * scale,
    cell * scale,
    cell * scale,
  );

  ctx.shadowBlur = 0;

  ctx.strokeStyle = p.placed
    ? "rgba(255,255,255,0.3)"
    : p === dragPiece
      ? "rgba(248,196,54,0.9)"
      : "rgba(255,255,255,0.75)";
  ctx.lineWidth = (p === dragPiece ? 2.5 : 1) * scale;
  ctx.strokeRect(p.x * scale, p.y * scale, cell * scale, cell * scale);
}

function drawPieces() {
  if (!pieces.length) return;
  const placed = pieces.filter((p) => p.placed);
  const unplaced = pieces.filter((p) => !p.placed && p !== dragPiece);
  placed.forEach((p) => drawPiece(p));
  unplaced.forEach((p) => drawPiece(p));
  if (dragPiece) drawPiece(dragPiece);
}

function drawUI() {
  const barX = 60,
    barY = 20,
    barW = 320,
    barH = 22;

  ctx.fillStyle = "#091C53";
  ctx.fillRect(barX * scale, barY * scale, barW * scale, barH * scale);

  ctx.fillStyle = "#F8C436";
  ctx.fillRect(
    barX * scale,
    barY * scale,
    barW * getProgress() * scale,
    barH * scale,
  );

  const iconSize = barH + 35;
  if (imgBarIcon.complete) {
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

  ctx.fillStyle = "#091C53";
  ctx.font = `${40 * scale}px sans-serif`;
  if (raceMode || raceFinished) {
    ctx.fillText(formatMMSS(raceTime), (BASE_W - 120) * scale, 50 * scale);
  } else {
    let m = Math.floor(time / 60);
    let s = time % 60;
    if (s < 10) s = "0" + s;
    ctx.fillText(`${m}:${s}`, (BASE_W - 120) * scale, 50 * scale);
  }
  const stageLabels = [
    "Paso 1: Mojar con agua limpia",
    "Paso 2: Aplica shampoo y enjuaga",
    "Paso 3: Seca y cepilla",
  ];
  const { size, cell, gap } = currentBoardConfig;
  const boardBottom = gridY + size * (cell + gap) - gap + 22;
  const boardCenterX = gridX + (size * (cell + gap) - gap) / 2;

  ctx.fillStyle = "black";
  ctx.font = `bold ${22 * scale}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(stageLabels[currentLevelIndex], 50 * scale, 483 * scale);
}

function drawCharacters() {
  let img;
  if (config === configs.easy) img = imgBlockEasy;
  else if (config === configs.normal) img = imgBlockNormal;
  else img = imgBlockHard;

  const x = 430,
    y = 10,
    w = 560,
    h = 500;

  if (img && img.complete) {
    const ratio = img.width / img.height;
    let drawW = w,
      drawH = drawW / ratio;
    if (drawH > h) {
      drawH = h;
      drawW = drawH * ratio;
    }
    ctx.drawImage(
      img,
      (x + (w - drawW) / 2) * scale,
      (y + (h - drawH) / 2) * scale,
      drawW * scale,
      drawH * scale,
    );
  }
}

function drawOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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

  const pulse = 1 + Math.sin(performance.now() / 180) * 0.04;
  const cx = coverBtn.x + coverBtn.w / 2;
  const cy = coverBtn.y + coverBtn.h / 2;
  const drawW = coverBtn.w * pulse;
  const drawH = coverBtn.h * pulse;

  ctx.globalAlpha = hoverCoverBtn ? 0.8 : 1;

  if (imgCoverBtn.complete && imgCoverBtn.naturalWidth > 0) {
    const ratio = imgCoverBtn.naturalWidth / imgCoverBtn.naturalHeight;
    let finalW = drawW,
      finalH = finalW / ratio;
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

  ctx.fillStyle = "white";
  ctx.font = `bold ${58 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    circuitNames[currentLevelIndex],
    (BASE_W / 2) * scale,
    110 * scale,
  );
  ctx.textAlign = "left";

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
      ? "¿Te gustaría intentar superar tu tiempo?"
      : "¿Te gustaría volver a jugar?",
    raceFinished ? 550 * scale : 595 * scale,
    175 * scale,
  );
  drawEndScreen(true);
}

function drawEndScreen(win) {
  const stateImg = win ? imgWin : imgLose;
  const maxW = 450,
    maxH = BASE_H - 60;

  if (stateImg.complete) {
    const ratio = stateImg.width / stateImg.height;
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
  if (img.complete) {
    ctx.drawImage(
      img,
      (btn.x - radius) * scale,
      (btn.y - radius) * scale,
      radius * 2 * scale,
      radius * 2 * scale,
    );
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
}

function drawDifficulty() {
  if (imgBackground.complete) {
    ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
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
  if (img.complete) {
    ctx.drawImage(
      img,
      (x - r) * scale,
      (cy - r) * scale,
      r * 2 * scale,
      r * 2 * scale,
    );
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
  ctx.font = `${16 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(paused ? "Reanudar" : "Pausa", x * scale, (y + r + 20) * scale);
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
