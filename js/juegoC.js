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

// Imágenes
let imgBackground;
let imgBtnEasy, imgBtnNormal, imgBtnHard;
let imgWin, imgLose, imgBtnRestart, imgBtnDiff;
let imgLife, imgBarIcon;
let imgEnemy, imgEnemyBlue, imgEnemyPurple;
let imgLifeItem;
let imgGhostA, imgGhostB;
let imgCover, imgCoverBtn;
let imgPauseBtn, imgResumeBtn;

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
const circuitLevels = ["easy", "normal", "hard"];
const circuitNames = ["Nivel 1", "Nivel 2", "Nivel 3"];

// Level intro
let currentCardData = null;

// Tarjetas
const cardsData = [
  {
    img: "src/game-c/gamec-t1.webp",
    subtitle: "Ojos Atentos",
    text: "Si tu perro se rasca mucho, se muerde la piel o tiene muchas moscas alrededor, avisa a un adulto.",
  },
  {
    img: "src/game-c/gamec-t2.webp",
    subtitle: "Lugar Limpio",
    text: "Mantén limpio el espacio donde duerme tu perro para evitar parásitos y malos olores.",
  },
  {
    img: "src/game-c/gamec-t3.webp",
    subtitle: "Vacunas Al Día",
    text: "Las vacunas protegen a los perros de enfermedades peligrosas.",
  },
  {
    img: "src/game-c/gamec-t4.webp",
    subtitle: "Juguetes Limpios",
    text: "Lava los juguetes de tu perro para evitar suciedad y bacterias.",
  },
  {
    img: "src/game-c/gamec-t5.webp",
    subtitle: "Cuidado Con La Basura",
    text: "No permitas que tu perro revise bolsas de basura porque podría enfermarse.",
  },
  {
    img: "src/game-c/gamec-t6.webp",
    subtitle: "Collares Seguros",
    text: "Algunos perros usan collares especiales para protegerse de pulgas y garrapatas.",
  },
];
let cardImages = [];

// Botones especiales
const coverBtn = { x: 750, y: 390, w: 210, h: 90 };
const entendidoBtn = { x: 560, y: 310, w: 160, h: 42 };
const pauseBtn = { x: 940, y: 420, r: 35 };

// Hover
let hoverRestart, hoverDiff, hoverEasy, hoverNormal, hoverHard;
let hoverCoverBtn = false;
let hoverEntendido = false;
let hoverPause = false;

// Botones fin de partida
let restartBtn, diffBtn;

// Constantes
const ITEM_SIZE = 130;
const LIFE_SIZE = 80;

const columns = [200, 350, 500, 650, 800];
const spawnDefs = [
  { from: 0, to: 1 },
  { from: 2, to: 2 },
  { from: 4, to: 3 },
];

// Configuraciones
const configs = {
  easy: {
    target: 300,
    speed: 1.8,
    spawnInterval: 650,
    pRed: 0.8,
    pBlue: 0.17,
    pPurple: 0.03,
  },
  normal: {
    target: 600,
    speed: 3.5,
    spawnInterval: 750,
    pRed: 0.5,
    pBlue: 0.4,
    pPurple: 0.1,
  },
  hard: {
    target: 1000,
    speed: 4.2,
    spawnInterval: 750,
    pRed: 0.34,
    pBlue: 0.33,
    pPurple: 0.33,
  },
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

  // ── Imágenes ──────────────────────────────

  imgCover = new Image();
  imgCover.src = "src/portada-vet.bmp";

  imgCoverBtn = new Image();
  imgCoverBtn.src = "src/play-btn.png";

  imgBackground = new Image();
  imgBackground.src = "src/game-c/bg-c.webp";

  imgBtnEasy = new Image();
  imgBtnEasy.src = "src/btn-level-one.png";
  imgBtnNormal = new Image();
  imgBtnNormal.src = "src/btn-level-two.png";
  imgBtnHard = new Image();
  imgBtnHard.src = "src/btn-level-three.png";

  imgWin = new Image();
  imgWin.src = "src/gamewin.webp";
  imgLose = new Image();
  imgLose.src = "src/gameover.webp";
  imgBtnRestart = new Image();
  imgBtnRestart.src = "src/resetbtn.webp";
  imgBtnDiff = new Image();
  imgBtnDiff.src = "src/selectbtn.webp";
  imgLife = new Image();
  imgLife.src = "src/life.webp";
  imgBarIcon = new Image();
  imgBarIcon.src = "src/icon-b.webp";

  imgPauseBtn = new Image();
  imgPauseBtn.src = "src/btn-pause.png";
  imgResumeBtn = new Image();
  imgResumeBtn.src = "src/btn-play.png";

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
      if (performance.now() - endScreenTime < 600) return;
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
      hoverEntendido ||
      hoverPause ||
      hoverSquare
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
        resetGame();
        return;
      }
    }

    if (state === "difficulty") {
      if (x > 220 && x < 380 && y > 220 && y < 310) {
        config = configs.easy;
        dificultadActual = "Fácil";
        circuitMode = false;
        resetGame();
      }
      if (x > 420 && x < 580 && y > 220 && y < 310) {
        config = configs.normal;
        dificultadActual = "Media";
        circuitMode = false;
        resetGame();
      }
      if (x > 620 && x < 780 && y > 220 && y < 310) {
        config = configs.hard;
        dificultadActual = "Difícil";
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
      if (Math.hypot(x - restartBtn.x, y - restartBtn.y) < restartBtn.r)
        resetGame();
      if (Math.hypot(x - diffBtn.x, y - diffBtn.y) < diffBtn.r) {
        circuitMode = false;
        state = "difficulty";
      }
    }
  };
  canvas.addEventListener("pointerdown", clickHandler);

  // ── Spawn dinámico ─────────────────────────
  scheduleSpawn();

  // ── Loop ───────────────────────────────────
  function loop() {
    update();
    draw();
    animationId = requestAnimationFrame(loop);
  }
  loop();
}

function showLevelIntro() {
  const idx = Math.floor(Math.random() * cardsData.length);
  currentCardData = { ...cardsData[idx], imgObj: cardImages[idx] };
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
      amplitude: 30,
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

function resetGame() {
  items = [];
  ghosts = [];
  score = 0;
  lives = 3;
  state = "playing";
  paused = false;
  endScreenTime = null;
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
    state = "gameover";
    endScreenTime = performance.now();
    AudioManager.stopMusic();
    AudioManager.playSFX("src/sounds/gameover.mp3");
  }

  if (score >= config.target && state === "playing") {
    state = "finished";

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

  ctx.fillStyle = "#F8C436";
  ctx.fillRect(
    barX * scale,
    barY * scale,
    barW * (score / config.target) * scale,
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
