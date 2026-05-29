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
let imgWin, imgLose, imgBtnRestart, imgBtnDiff;
let imgBarIcon;
let imgCover, imgCoverBtn;
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
const circuitLevels = ["easy", "normal", "hard"];
const circuitNames = ["Nivel 1", "Nivel 2", "Nivel 3"];

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
    subtitle: "Tomar Agua",
    text: "Siempre ofrece agua a tu perro después de jugar. Beber agua ayuda a tu perro a refrescarse y recuperar fuerzas.",
  },
  {
    img: "src/game-d/gamed-t6.webp",
    subtitle: "No Encerrado",
    text: "Tu perro necesita moverse y jugar todos los días. Moverse y explorar ayuda a tu perro a estar saludable y contento.",
  },
  {
    img: "src/game-d/gamed-t4.webp",
    subtitle: "Juego Seguro",
    text: "Asegurate que los juguetes sean seguros y mantén fuera de su alcance cualquier cosa que pueda lastimarlos.",
  },
  {
    img: "src/game-d/gamed-t5.webp",
    subtitle: "Con Correa",
    text: "Siempre pasea a tu perro con correa para que esté protegido y no se pierda.",
  },
  {
    img: "src/game-d/gamed-t3.webp",
    subtitle: "Paseos Diarios",
    text: "Salir a pasear los ayuda a ser felices, pero siempre bajo supervisión.",
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

// Botones
let restartBtn, diffBtn;

// Datos de items por nivel
const levelItems = {
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
};

// Configuraciones
const configs = {
  easy: { time: 180, count: 5 },
  normal: { time: 150, count: 7 },
  hard: { time: 150, count: 10 },
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
    A: "src/game-d/portada-parque-a.webp",
    B: "src/game-d/portada-parque-b.webp",
    C: "src/game-d/portada-parque-c.webp",
  };
  imgCover.src = coverSrcs[cardVariant] ?? coverSrcs["A"];

  imgCoverBtn = new Image();
  imgCoverBtn.src = "src/play-btn.webp";

  imgPauseBtn = new Image();
  imgPauseBtn.src = "src/btn-pause.webp";

  imgResumeBtn = new Image();
  imgResumeBtn.src = "src/btn-play.webp";

  imgBgEasy = new Image();
  imgBgEasy.src = "src/game-d/game-da.webp";
  imgBgNormal = new Image();
  imgBgNormal.src = "src/game-d/game-db.webp";
  imgBgHard = new Image();
  imgBgHard.src = "src/game-d/game-dc.webp";
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

    const onMap = state === "playing" && !paused && x < PANEL_X;

    canvas.style.cursor =
      hoverRestart ||
      hoverDiff ||
      hoverEasy ||
      hoverNormal ||
      hoverHard ||
      hoverCoverBtn ||
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
    hoverCoverBtn = hoverEntendido = hoverPause = false;
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
        configKey = circuitLevels[currentLevelIndex];
        config = configs[configKey];
        dificultadActual = ["Fácil", "Media", "Difícil"][currentLevelIndex];
        resetGame();
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
      // Botón pausa/reanudar
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

              setTimeout(() => {
                if (circuitMode) {
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
      if (Math.hypot(x - restartBtn.x, y - restartBtn.y) < restartBtn.r)
        resetGame();
      if (Math.hypot(x - diffBtn.x, y - diffBtn.y) < diffBtn.r) {
        circuitMode = false;
        state = "difficulty";
      }
    }
  };
  canvas.addEventListener("click", clickHandler);

  // ── Temporizador ───────────────────────────

  intervalTime = setInterval(() => {
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
  const pool = [...levelItems[configKey]];
  const chosen = [];
  for (let i = 0; i < config.count; i++) {
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
  let m = Math.floor(time / 60);
  let s = time % 60;
  if (s < 10) s = "0" + s;
  ctx.fillStyle = "white";
  ctx.font = `${40 * scale}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(`${m}:${s}`, (px + pw / 2) * scale, 50 * scale);
  ctx.textAlign = "left";

  // Lista de items
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
    ctx.fillText("Volver", 615 * scale, 355 * scale);
    ctx.fillText("a jugar", 613 * scale, 380 * scale);
  } else {
    ctx.fillText("Seleccionar", 770 * scale, 355 * scale);
    ctx.fillText("dificultad", 785 * scale, 380 * scale);
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
