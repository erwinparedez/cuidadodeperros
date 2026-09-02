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
let animationId;
let spawnTimeout;
let raceDifficultyInterval;

// Imágenes
let imgBackground;
let imgBtnEasy, imgBtnNormal, imgBtnHard;
let imgWin, imgLose, imgBtnRestart, imgBtnDiff, imgBtnDiffPause;
let imgLife, imgBarIcon;
let imgEnemy, imgEnemyBlue, imgEnemyPurple;
let imgLifeItem;
let imgGhostA, imgGhostB;
let imgCover, imgCoverBtn, imgCoverBtnRace;
let imgPauseBtn, imgResumeBtn;
let preloadedPairs = [];

// Estado del juego
let state;
let config;
let dificultadActual;
let items;
let ghosts;
let score;
let lives;
let endScreenTime;
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

// Modo carrera / ilimitado
let raceMode = false;
let raceFinished = false;
let lastRaceScore = null;
let bestRaceScore = null;
let isNewRecord = false;
let raceWave = 1;

// Level intro
let currentCardData = null;

// Tarjetas
const cardsData = [
  {
    img: "src/game-c/gamec-t1.webp",
    subtitle: "Atento a señales de alerta",
    text: "Si tu perro se rasca mucho, avisa a un adulto.",
  },
  {
    img: "src/game-c/gamec-t2.webp",
    subtitle: "Una cama limpia para dormir",
    text: "Mantén limpia la cama de tu perro para ayudar a evitar bichitos y suciedad.",
  },
  {
    img: "src/game-c/gamec-t3.webp",
    subtitle: "Sus vacunas al día",
    text: "Las vacunas ayudan a proteger a tu perro de que se enferme. Lo mantienen sano y fuerte",
  },
  {
    img: "src/game-c/gamec-t4.webp",
    subtitle: "Juguetes seguros para perros",
    text: "Un perro puede morder un juguete hasta arrancar pedazos y después tragárselos. Asegúrate de escoger juguetes seguros para ellos.",
  },
  {
    img: "src/game-c/gamec-t5.webp",
    subtitle: "Mantenlo alejado de la basura",
    text: "Tu perro no debe comer cosas de la basura porque podrían enfermarlo. Mantén la basura lejos para protegerlo.",
  },
  {
    img: "src/game-c/gamec-t6.webp",
    subtitle: "Collares especiales para perros",
    text: "Algunos collares ayudan a cuidar a tu perro y mantener alejados algunos bichitos que le hacen daño.",
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
let hoverRestart, hoverDiff, hoverEasy, hoverNormal, hoverHard;
let hoverCoverBtn = false;
let hoverCoverBtnRace = false;
let hoverEntendido = false;
let hoverPause = false;
let hoverPauseDiff = false;

// Botones fin de partida
let restartBtn, diffBtn;

// Constantes
const ITEM_SIZE = 130;
const LIFE_SIZE = 80;

const columns = [250, 375, 500, 625, 750];
const spawnDefs = [
  { from: 0, to: 1 },
  { from: 2, to: 2 },
  { from: 4, to: 3 },
];

// Configuraciones
const configs = {
  easy: {
    target: 300,
    speed: 2.3,
    spawnInterval: 1000,
    pRed: 0.8,
    pBlue: 0.18,
    pPurple: 0.02,
  },
  normal: {
    target: 600,
    speed: 2.9,
    spawnInterval: 700,
    pRed: 0.4,
    pBlue: 0.4,
    pPurple: 0.2,
  },
  hard: {
    target: 900,
    speed: 3.2,
    spawnInterval: 600,
    pRed: 0.34,
    pBlue: 0.33,
    pPurple: 0.33,
  },
};

// Cada cuánto tiempo (ms) sube la dificultad en modo carrera, y en cuánto sube
const RACE_RAMP_INTERVAL_MS = 12000;
const RACE_RAMP_STEP = 0.1;

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

// ── Persistencia de progreso por avatar ──────────────────────────────────────

const PROGRESS_STORAGE_KEY = "gameC_progresoPorAvatar";

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
  window.gameC_moduleCompletadoPorAvatar = flags;
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
    A: "src/game-c/portada-vet-a.webp",
    B: "src/game-c/portada-vet-b.webp",
    C: "src/game-c/portada-vet-c.webp",
  };
  imgCover.src = coverSrcs[cardVariant] ?? coverSrcs["A"];

  imgCoverBtn = new Image();
  imgCoverBtn.src = "src/play-btn.webp";

  imgCoverBtnRace = new Image();
  imgCoverBtnRace.src = "src/unlimit-btn.webp";

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

  imgPauseBtn = new Image();
  imgPauseBtn.src = "src/btn-pause.webp";
  imgResumeBtn = new Image();
  imgResumeBtn.src = "src/btn-play.webp";

  imgEnemy = new Image();
  imgEnemy.src = "src/game-c/bug01.webp";
  imgEnemyBlue = new Image();
  imgEnemyBlue.src = "src/game-c/bug02.webp";
  imgEnemyPurple = new Image();
  imgEnemyPurple.src = "src/game-c/bug03.webp";
  imgLifeItem = new Image();
  imgLifeItem.src = "src/life.webp";
  imgGhostA = new Image();
  imgGhostA.src = "src/game-c/defeat-a.webp";
  imgGhostB = new Image();
  imgGhostB.src = "src/game-c/defeat-b.webp";

  const themePairs = {
    A: [
      { bg: "src/game-c/bg-a.webp", icon: "src/icon-a.webp" },
      { bg: "src/game-c/bg-b.webp", icon: "src/icon-b.webp" },
    ],
    B: [
      { bg: "src/game-c/bg-c.webp", icon: "src/icon-c.webp" },
      { bg: "src/game-c/bg-d.webp", icon: "src/icon-d.webp" },
    ],
    C: [
      { bg: "src/game-c/bg-e.webp", icon: "src/icon-e.webp" },
      { bg: "src/game-c/bg-f.webp", icon: "src/icon-f.webp" },
    ],
  };

  const pairs = themePairs[cardVariant] ?? themePairs["A"];
  preloadedPairs = pairs.map((p) => {
    const bgImg = new Image();
    bgImg.src = p.bg;
    const iconImg = new Image();
    iconImg.src = p.icon;
    return { bgImg, iconImg };
  });

  // Asignación inicial (hasta que el primer nivel elija)
  imgBackground = preloadedPairs[0].bgImg;
  imgBarIcon = preloadedPairs[0].iconImg;

  cardImages = cardsData.map((card) => {
    const img = new Image();
    img.src = card.img;
    return img;
  });

  // ── Estado inicial ─────────────────────────
  state = "cover";
  config = configs.easy;
  items = [];
  ghosts = [];
  score = 0;
  lives = 3;
  endScreenTime = null;
  circuitMode = false;
  currentLevelIndex = 0;
  standaloneLevel = false;
  paused = false;

  // Modo carrera / ilimitado
  raceMode = false;
  raceFinished = false;
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
      if (performance.now() - endScreenTime < 600) return;
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

    // Hover sobre items (solo si no está pausado)
    let hoverSquare = false;
    if (state === "playing" && !paused) {
      items.forEach((item) => {
        if (
          x > item.x &&
          x < item.x + item.size &&
          y > item.y &&
          y < item.y + item.size
        )
          hoverSquare = true;
      });
    }

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
      hoverSquare ||
      hoverPauseDiff
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
        return;
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
        return;
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

      // Clicks sobre enemigos
      if (!paused) {
        items.forEach((item, i) => {
          if (
            x > item.x &&
            x < item.x + item.size &&
            y > item.y &&
            y < item.y + item.size
          ) {
            if (item.type === "enemy") {
              score += 10;
              AudioManager.playSFX("src/game-c/enemydefeat00.mp3");
              ghosts.push({
                x: item.x,
                y: item.y,
                size: item.size,
                born: performance.now(),
                ghostType: "B",
              });
            } else if (item.type === "enemy_blue") {
              score += 10;
              AudioManager.playSFX("src/game-c/enemydefeat01.mp3");
              AudioManager.playSFX("src/game-c/aplastado.mp3");
              ghosts.push({
                x: item.x,
                y: item.y,
                size: item.size,
                born: performance.now(),
                ghostType: "A",
              });
            } else if (item.type === "enemy_purple") {
              if (!item.hits) {
                item.hits = 1;
                AudioManager.playSFX("src/game-c/oops03.mp3");
                return;
              }

              score += 10;
              AudioManager.playSFX("src/game-c/enemydefeat05.mp3");
              AudioManager.playSFX("src/game-c/aplastado.mp3");
              ghosts.push({
                x: item.x,
                y: item.y,
                size: item.size,
                born: performance.now(),
                ghostType: "A",
              });
            } else if (item.type === "life") {
              if (lives < 3) lives++;
              AudioManager.playSFX("src/game-c/powerup.mp3");
            }

            items.splice(i, 1);
          }
        });
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
  canvas.addEventListener("pointerdown", clickHandler);

  // ── Spawn dinámico ─────────────────────────
  scheduleSpawn();

  // ── Dificultad progresiva del modo carrera ─
  raceDifficultyInterval = setInterval(() => {
    if (raceMode && state === "playing" && !paused) {
      config.speed = Math.round((config.speed + RACE_RAMP_STEP) * 100) / 100;

      const currentFrequency = 1000 / config.spawnInterval;
      const newFrequency = currentFrequency + RACE_RAMP_STEP;
      config.spawnInterval = 1000 / newFrequency;

      raceWave++;
    }
  }, RACE_RAMP_INTERVAL_MS);

  // ── Loop ───────────────────────────────────
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
  pickLevelTheme();
  state = "levelIntro";
}

// ─────────────────────────────────────────────
export function cleanup() {
  AudioManager.stopAll();
  window.removeEventListener("resize", resizeHandler);
  canvas.removeEventListener("mousemove", mouseMoveHandler);
  canvas.removeEventListener("mouseleave", mouseLeaveHandler);
  canvas.removeEventListener("pointerdown", clickHandler);

  clearTimeout(spawnTimeout);
  clearInterval(raceDifficultyInterval);
  cancelAnimationFrame(animationId);

  canvas.style.cursor = "default";
}

// ─────────────────────────────────────────────

function scheduleSpawn() {
  spawnTimeout = setTimeout(() => {
    if (state === "playing" && !paused) {
      spawnItem();
      if (lives < 3 && Math.random() < 0.03) spawnLife();
    }
    scheduleSpawn();
  }, config.spawnInterval);
}

function spawnItem() {
  const roll = Math.random();
  let enemyType;
  if (roll < config.pRed) enemyType = "enemy";
  else if (roll < config.pRed + config.pBlue) enemyType = "enemy_blue";
  else enemyType = "enemy_purple";

  const def = spawnDefs[Math.floor(Math.random() * spawnDefs.length)];
  const xStart = columns[def.from] - ITEM_SIZE / 2;
  const xEnd = columns[def.to] - ITEM_SIZE / 2;
  const travelY = BASE_H - 20;
  const baseDx = (xEnd - xStart) / (travelY / config.speed);

  if (enemyType === "enemy") {
    items.push({
      x: xStart,
      y: BASE_H,
      size: ITEM_SIZE,
      speed: config.speed,
      dx: baseDx,
      type: "enemy",
    });
  } else if (enemyType === "enemy_blue") {
    items.push({
      x: xStart,
      y: BASE_H,
      size: ITEM_SIZE,
      speed: config.speed,
      dx: baseDx,
      amplitude: 50,
      phase: Math.random() * Math.PI * 2,
      traveledY: 0,
      type: "enemy_blue",
    });
  } else {
    const pxDestIndex =
      def.from === 2 ? (Math.random() < 0.5 ? 1 : 3) : { 0: 3, 4: 1 }[def.from];
    const pxEnd = columns[pxDestIndex] - ITEM_SIZE / 2;
    const purpleDx = (pxEnd - xStart) / (travelY / config.speed);
    items.push({
      x: xStart,
      y: BASE_H,
      size: ITEM_SIZE,
      speed: config.speed,
      dx: purpleDx,
      type: "enemy_purple",
    });
  }
}

function spawnLife() {
  const def = spawnDefs[Math.floor(Math.random() * spawnDefs.length)];
  const lifeSpeed = 1.6;
  const xStart = columns[def.from] - ITEM_SIZE / 2;
  const xEnd = columns[def.to] - ITEM_SIZE / 2;
  const travelY = BASE_H - 20;
  const dx = (xEnd - xStart) / (travelY / lifeSpeed);
  items.push({
    x: xStart,
    y: -LIFE_SIZE,
    size: LIFE_SIZE,
    speed: lifeSpeed,
    dx,
    type: "life",
  });
}

function pickLevelTheme() {
  const pair =
    preloadedPairs[Math.floor(Math.random() * preloadedPairs.length)];
  imgBackground = pair.bgImg;
  imgBarIcon = pair.iconImg;
}

function resetGame() {
  items = [];
  ghosts = [];
  score = 0;
  lives = 3;
  state = "playing";
  paused = false;
  endScreenTime = null;
  if (!circuitMode) pickLevelTheme();
  AudioManager.playMusic("src/game-c/bgmusic-c.mp3");
}

function startRaceMode() {
  raceMode = true;
  raceFinished = false;
  circuitMode = false;
  currentLevelIndex = 0;
  standaloneLevel = false;

  config = {
    ...configs.easy,
    pRed: configs.normal.pRed,
    pBlue: configs.normal.pBlue,
    pPurple: configs.normal.pPurple,
  };

  items = [];
  ghosts = [];
  score = 0;
  lives = 3;
  state = "playing";
  paused = false;
  endScreenTime = null;
  lastRaceScore = null;
  isNewRecord = false;
  raceWave = 1;

  pickLevelTheme();
  AudioManager.playMusic("src/game-c/bgmusic-c.mp3");
}

function update() {
  if (state !== "playing" || paused) return;

  items.forEach((item, i) => {
    if (item.type === "life") {
      item.y += item.speed;
      item.x += item.dx;
    } else if (item.type === "enemy_blue") {
      item.y -= item.speed;
      item.traveledY += item.speed;
      item.x +=
        item.dx +
        Math.sin(item.traveledY * 0.08 + item.phase) * item.amplitude * 0.08;
    } else {
      item.y -= item.speed;
      item.x += item.dx;
    }

    if (item.type !== "life" && item.y <= 20) {
      lives--;
      AudioManager.playSFX("src/game-c/baditem.mp3");
      items.splice(i, 1);
      return;
    }
    if (item.type === "life" && item.y > BASE_H) items.splice(i, 1);
  });

  if (lives <= 0) {
    paused = false;

    if (raceMode) {
      // En modo carrera, perder todas las vidas termina la partida
      // pero se muestra la pantalla de victoria con el puntaje final.
      raceMode = false;
      raceFinished = true;
      lastRaceScore = score;
      state = "victory";
      endScreenTime = performance.now();
      AudioManager.stopMusic();
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
      AudioManager.stopMusic();
      AudioManager.playSFX("src/sounds/gameover.mp3");
    }
  }

  if (!raceMode && score >= config.target && state === "playing") {
    state = "finished";

    if (currentLevelIndex + 1 > maxUnlockedLevel) {
      maxUnlockedLevel = Math.min(currentLevelIndex + 1, 2);
    }

    if (currentLevelIndex === 2 && !moduleCompletado) {
      moduleCompletado = true;
      // console.log(
      //   `3er Módulo de parasitos completado, con el avatar ${currentCardVariant}.`,
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
          // Avanza al siguiente nivel del circuito
          currentLevelIndex++;
          items = [];
          ghosts = [];
          showLevelIntro();
        } else {
          // Completó los 3 niveles
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

  const now = performance.now();
  ghosts = ghosts.filter((g) => now - g.born < 1500);
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

  // Ghosts (efectos de derrota)
  const now = performance.now();
  ghosts.forEach((g) => {
    const alpha = Math.max(0, 1 - (now - g.born) / 1500);
    ctx.globalAlpha = alpha;
    const ghostImg = g.ghostType === "B" ? imgGhostA : imgGhostB;
    if (ghostImg.complete && ghostImg.naturalWidth > 0) {
      ctx.drawImage(
        ghostImg,
        g.x * scale,
        g.y * scale,
        g.size * scale,
        g.size * scale,
      );
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(g.x * scale, g.y * scale, g.size * scale, g.size * scale);
    }
  });
  ctx.globalAlpha = 1;

  // Items (enemigos y vida)
  items.forEach((item) => {
    let img = null;
    if (item.type === "enemy") img = imgEnemy;
    if (item.type === "enemy_blue") img = imgEnemyBlue;
    if (item.type === "enemy_purple") img = imgEnemyPurple;
    if (item.type === "life") img = imgLifeItem;

    if (img && img.complete && img.naturalWidth > 0) {
      const ratio = img.naturalWidth / img.naturalHeight;
      let drawW, drawH;
      if (ratio >= 1) {
        drawW = item.size;
        drawH = item.size / ratio;
      } else {
        drawH = item.size;
        drawW = item.size * ratio;
      }
      const ox = (item.size - drawW) / 2;
      const oy = (item.size - drawH) / 2;
      ctx.drawImage(
        img,
        (item.x + ox) * scale,
        (item.y + oy) * scale,
        drawW * scale,
        drawH * scale,
      );
    } else {
      if (item.type === "enemy") ctx.fillStyle = "red";
      if (item.type === "enemy_blue") ctx.fillStyle = "#4fc3f7";
      if (item.type === "enemy_purple") ctx.fillStyle = "#ab47bc";
      if (item.type === "life") ctx.fillStyle = "yellow";
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

// ─── Pantalla de portada ───────────────────────────────────────────────────────

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

  // Sombra
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 18 * scale;

  // Fondo blanco
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

  // Texto de la tarjeta
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

// ─── UI de juego ──────────────────────────────────────────────────────────────

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

    ctx.fillStyle = "#091C53";
    ctx.font = `bold ${30 * scale}px sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(`Oleada ${raceWave}`, (BASE_W - 60) * scale, 50 * scale);
    ctx.textAlign = "left";
  } else {
    ctx.fillStyle = "#F8C436";
    ctx.fillRect(
      barX * scale,
      barY * scale,
      barW * (score / config.target) * scale,
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
