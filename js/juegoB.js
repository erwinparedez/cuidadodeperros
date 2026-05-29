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
let imgWin, imgLose, imgBtnRestart, imgBtnDiff, imgBarIcon;
let imgPuzzleEasy, imgPuzzleNormal, imgPuzzleHard;
let imgBlockEasy, imgBlockNormal, imgBlockHard;
let imgCover, imgCoverBtn;
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
const circuitLevels = ["easy", "normal", "hard"];
const circuitNames = ["Nivel 1", "Nivel 2", "Nivel 3"];

// Level intro
let currentCardData = null;

// Tarjetas
const cardsData = [
  {
    img: "src/game-b/gameb-t1.webp",
    subtitle: "Baño Con Ayuda",
    text: "Siempre pide ayuda a un adulto para bañar a tu perro.",
  },
  {
    img: "src/game-b/gameb-t2.webp",
    subtitle: "Agua Tibia",
    text: "El agua que tome no debe estar ni muy fría ni muy caliente.",
  },
  {
    img: "src/game-b/gameb-t3.webp",
    subtitle: "Su Toalla",
    text: "Tu perro debe tener una toalla limpia solo para él.",
  },
  {
    img: "src/game-b/gameb-t4.webp",
    subtitle: "Cuidado Con El Jabón",
    text: "El jabón no debe entrar en sus ojos, boca, ni orejas. Lava a tu perro con cuidado para que el jabón no le haga daño.",
  },
  {
    img: "src/game-b/gameb-t5.webp",
    subtitle: "Secarlo Bien",
    text: "Después del baño, el perro debe quedar seco. Secar bien a tu perro ayuda a que no tenga frío.",
  },
  {
    img: "src/game-b/gameb-t6.webp",
    subtitle: "Con Calma",
    text: "Bañarlo con calma ayuda a que no tenga miedo. Si lo bañas con paciencia, tu perro tendrá menos miedo.",
  },
];
let cardImages = [];

// Botones especiales
const coverBtn = { x: 750, y: 390, w: 210, h: 90 };
const entendidoBtn = { x: 560, y: 310, w: 160, h: 42 };
const pauseBtn = { x: 940, y: 420, r: 30 };
const pauseDiffBtn = { x: 940, y: 300, r: 35 };

// Hover
let hoverRestart, hoverDiff, hoverEasy, hoverNormal, hoverHard;
let hoverCoverBtn = false;
let hoverEntendido = false;
let hoverPause = false;
let hoverPauseDiff = false;

// Botones end screen
let restartBtn, diffBtn;

// Posición del tablero en canvas
const gridX = 50;
const gridY = 70;

// Configuraciones: tiempo + tablero por dificultad
const configs = {
  easy: { time: 300, board: { size: 3, cell: 120, gap: 6 } },
  normal: { time: 240, board: { size: 4, cell: 86, gap: 5 } },
  hard: { time: 240, board: { size: 5, cell: 66, gap: 4 } },
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
  currentLevelIndex = 0;
  paused = false;

  hoverRestart = hoverDiff = hoverEasy = hoverNormal = hoverHard = false;
  hoverCoverBtn = hoverEntendido = hoverPause = false;

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
    hoverCoverBtn = hoverEntendido = hoverPause = false;

    if (state === "cover") {
      hoverCoverBtn =
        x > coverBtn.x &&
        x < coverBtn.x + coverBtn.w &&
        y > coverBtn.y &&
        y < coverBtn.y + coverBtn.h;
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
      hoverEasy = x > 220 && x < 380 && y > 220 && y < 310;
      hoverNormal = x > 420 && x < 580 && y > 220 && y < 310;
      hoverHard = x > 620 && x < 780 && y > 220 && y < 310;
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
    hoverCoverBtn = hoverEntendido = hoverPause = false;
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
        showTimer = 300;
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
        currentLevelIndex = 0;
        usedCardIndices = [];
        showLevelIntro();
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
      if (x > 220 && x < 380 && y > 220 && y < 310) {
        config = configs.easy;
        dificultadActual = "Fácil";
        currentLevelIndex = 0;
        circuitMode = false;
        resetGame();
      }

      if (x > 420 && x < 580 && y > 220 && y < 310) {
        config = configs.normal;
        dificultadActual = "Media";
        currentLevelIndex = 1;
        circuitMode = false;
        resetGame();
      }

      if (x > 620 && x < 780 && y > 220 && y < 310) {
        config = configs.hard;
        dificultadActual = "Difícil";
        currentLevelIndex = 2;
        circuitMode = false;
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
        circuitMode = false;
        paused = false;
        state = "difficulty";
        return;
      }
    }

    if (state === "gameover" || state === "victory") {
      if (performance.now() - endScreenTime < 600) return;
      if (Math.hypot(x - restartBtn.x, y - restartBtn.y) < restartBtn.r)
        startGame();
      if (Math.hypot(x - diffBtn.x, y - diffBtn.y) < diffBtn.r) {
        circuitMode = false;
        state = "difficulty";
      }
    }
  };
  canvas.addEventListener("click", clickHandler);

  // ── Temporizador ───────────────────────────

  intervalTime = setInterval(() => {
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

            if (circuitMode) {
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

// ─────────────────────────────────────────────
// Lógica del juego
// ─────────────────────────────────────────────

/**
 * Genera posiciones aleatorias dentro de un área controlada (zona derecha).
 * Usa una rejilla blanda: divide el área en celdas y coloca cada pieza en
 * una celda distinta con ruido aleatorio, así no quedan amontonadas
 * ni perfectamente alineadas. Se permite solapamiento parcial.
 */
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
    // Centro de celda + ruido del 80% del tamaño de celda → natural sin amontonarse
    const px =
      areaX1 + col * cellW + cellW * 0.5 + (Math.random() - 0.5) * cellW * 0.8;
    const py =
      areaY1 + row * cellH + cellH * 0.5 + (Math.random() - 0.5) * cellH * 0.8;
    positions.push({
      x: Math.max(areaX1, Math.min(areaX2, px)),
      y: Math.max(areaY1, Math.min(areaY2, py)),
    });
  }

  // Fisher-Yates: cada pieza recibe una posición aleatoria
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
  let m = Math.floor(time / 60);
  let s = time % 60;
  if (s < 10) s = "0" + s;
  ctx.fillText(`${m}:${s}`, (BASE_W - 120) * scale, 50 * scale);
  const stageLabels = [
    "Etapa 1: Mojado",
    "Etapa 2: Shampoo y enjuague",
    "Etapa 3: Secado y cepillado",
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
  ctx.fillText("¿Te gustaría volver a jugar?", 595 * scale, 175 * scale);
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
  drawEndButton(imgBtnDiff, diffBtn, 55, hoverDiff);

  ctx.fillStyle = "white";
  ctx.font = `${20 * scale}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(
    `Nivel: ${currentLevelIndex + 1} (${dificultadActual})`,
    40 * scale,
    (BASE_H - 20) * scale,
  );
}

function drawEndButton(img, btn, r, hover) {
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
    ctx.fillText("Volver", 615 * scale, 355 * scale);
    ctx.fillText("a jugar", 613 * scale, 380 * scale);
  } else {
    ctx.fillText("Seleccionar", 770 * scale, 355 * scale);
    ctx.fillText("dificultad", 785 * scale, 380 * scale);
  }
}

function drawDifficulty() {
  if (imgBackground.complete) {
    ctx.drawImage(imgBackground, 0, 0, canvas.width, canvas.height);
  }
  drawOverlay();

  ctx.fillStyle = "white";
  ctx.font = `bold ${58 * scale}px sans-serif`;
  ctx.fillText(
    "Selecciona la Dificultad",
    (BASE_W / 2 - 320) * scale,
    120 * scale,
  );

  drawDiffButton(imgBtnEasy, 300, hoverEasy);
  drawDiffButton(imgBtnNormal, 500, hoverNormal);
  drawDiffButton(imgBtnHard, 700, hoverHard);
}

function drawDiffButton(img, x, hover) {
  const baseR = 75;
  const r = hover ? baseR * 1.1 : baseR;
  const cy = 265;

  ctx.globalAlpha = hover ? 0.9 : 1;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x * scale, cy * scale, r * scale, 0, Math.PI * 2);
  ctx.clip();
  if (img.complete) {
    ctx.drawImage(
      img,
      (x - r) * scale,
      (cy - r) * scale,
      r * 2 * scale,
      r * 2 * scale,
    );
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ─── Pausa ────────────────────────────────────────────────────────────────────

function drawPauseButton() {
  const { x, y, r } = pauseBtn;
  const img = paused ? imgResumeBtn : imgPauseBtn;

  if (paused) {
    // Botón seleccionar dificultad (solo visible en pausa)
    const { x: dx, y: dy, r: dr } = pauseDiffBtn;
    ctx.save();
    ctx.beginPath();
    ctx.arc(dx * scale, dy * scale, dr * scale, 0, Math.PI * 2);
    ctx.clip();
    if (imgBtnDiff.complete && imgBtnDiff.naturalWidth > 0) {
      ctx.drawImage(
        imgBtnDiff,
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
    ctx.fillText("Seleccionar", dx * scale, (dy + dr + 18) * scale);
    ctx.fillText("dificultad", dx * scale, (dy + dr + 38) * scale);
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
