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
let intervalTime;
let intervalSpawn;
let animationId;

// Imágenes
let imgBackground, imgPlayer;
let imgBtnEasy, imgBtnNormal, imgBtnHard;
let imgWin, imgLose, imgBtnRestart, imgBtnDiff;
let imgLife, imgBarIcon;
let imgGood, imgBad, imgBonus;
let imgCover, imgCoverBtn;

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
    img: "src/game-a/gamea-t1.webp",
    subtitle: "Agua Limpia",
    text: "Asegurate que tu perro siempre tiene agua limpia para tomar.",
  },
  {
    img: "src/game-a/gamea-t2.webp",
    subtitle: "No Chocolate",
    text: "El chocolate puede enfermar mucho a los perros.",
  },
  {
    img: "src/game-a/gamea-t3.webp",
    subtitle: "Comida de Perro",
    text: "Los perros deben comer comida especial para ellos.",
  },
  {
    img: "src/game-a/gamea-t4.webp",
    subtitle: "Cantidad Justa",
    text: "Comer demasiado también puede hacerle daño a tu perro.",
  },
  {
    img: "src/game-a/gamea-t5.webp",
    subtitle: "Pregunta a un Adulto",
    text: "Antes de darle algo nuevo, pide ayuda a un adulto.",
  },
  {
    img: "src/game-a/gamea-t6.webp",
    subtitle: "No Picante",
    text: "Evita darle a tu perro comidas picantes, pueden hacerle doler mucho el estómago.",
  },
];

let cardImages = [];

// Botones especiales
const coverBtn = { x: 750, y: 390, w: 210, h: 90 };
const entendidoBtn = { x: 560, y: 310, w: 160, h: 42 };
const pauseBtn = { x: 940, y: 420, r: 35 };

// Hover
let hoverRestart, hoverDiff;
let hoverEasy, hoverNormal, hoverHard;
let hoverCoverBtn = false;
let hoverEntendido = false;
let hoverPause = false;

// Botones fin de partida
let restartBtn, diffBtn;

// Jugador
let player;

const ITEM_SIZE = 90;

const configs = {
  easy: {
    time: 180,
    target: 250,
    fallSpeed: 1.5,
    spawnInterval: 1100,
  },

  normal: {
    time: 120,
    target: 280,
    fallSpeed: 1.8,
    spawnInterval: 850,
  },

  hard: {
    time: 90,
    target: 300,
    fallSpeed: 2.5,
    spawnInterval: 750,
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

// Solo esquinas izquierdas redondeadas (imagen dentro de la tarjeta)
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

// ─── init ─────────────────────────────────────────────────────────────────────

export function init() {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  imgCover = new Image();
  imgCover.src = "src/portada-cocina.bmp";

  imgCoverBtn = new Image();
  imgCoverBtn.src = "src/play-btn.png";

  imgBackground = new Image();
  imgBackground.src = "src/game-a/bg-uno-a.webp";

  imgPlayer = new Image();
  imgPlayer.src = "src/game-a/dog.webp";

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
  imgBarIcon.src = "src/icon.webp";

  imgPauseBtn = new Image();
  imgPauseBtn.src = "src/btn-pause.png";

  imgResumeBtn = new Image();
  imgResumeBtn.src = "src/btn-play.png";

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
  paused = false;

  player = { x: 450, y: 430, w: 100, h: 40 };
  hoverRestart = hoverDiff = false;
  hoverEasy = hoverNormal = hoverHard = false;
  hoverCoverBtn = hoverEntendido = false;
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

  // mousemove: hover
  mouseMoveHandler2 = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    hoverRestart = hoverDiff = false;
    hoverEasy = hoverNormal = hoverHard = false;
    hoverCoverBtn = hoverEntendido = false;
    hoverPause = false;

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
    }

    canvas.style.cursor =
      hoverRestart ||
      hoverDiff ||
      hoverCoverBtn ||
      hoverEntendido ||
      hoverEasy ||
      hoverNormal ||
      hoverHard ||
      hoverPause
        ? "pointer"
        : "default";
  };
  canvas.addEventListener("mousemove", mouseMoveHandler2);

  mouseLeaveHandler = () => {
    if (state === "playing") {
      paused = true;
    }
    hoverRestart = hoverDiff = false;
    hoverEasy = hoverNormal = hoverHard = false;
    hoverCoverBtn = hoverEntendido = false;
    hoverPause = false;
    canvas.style.cursor = "default";
  };
  canvas.addEventListener("mouseleave", mouseLeaveHandler);

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
      if (Math.hypot(x - pauseBtn.x, y - pauseBtn.y) < pauseBtn.r) {
        paused = !paused;
        return;
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

  // Temporizador
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
  canvas.removeEventListener("mousemove", mouseMoveHandler1);
  canvas.removeEventListener("mousemove", mouseMoveHandler2);
  canvas.removeEventListener("mouseleave", mouseLeaveHandler);
  canvas.removeEventListener("click", clickHandler);
  clearInterval(intervalTime);
  clearInterval(intervalSpawn);
  cancelAnimationFrame(animationId);
  canvas.style.cursor = "default";
}

function spawnItem() {
  const rand = Math.random();
  let color, imgRef;

  if (rand < 0.03 && lives < 3) {
    color = "yellow";
    imgRef = imgBonus;
  } else if (rand < 0.5) {
    color = "green";
    imgRef = imgGood[Math.floor(Math.random() * imgGood.length)];
  } else {
    color = "red";
    imgRef = imgBad[Math.floor(Math.random() * imgBad.length)];
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

  items.forEach((item, i) => {
    item.y += item.speed;

    if (collide(player, item)) {
      if (item.color === "green") {
        score += 10;
        AudioManager.playSFX("src/game-a/gooditem.mp3");
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
    }

    if (item.y > BASE_H) items.splice(i, 1);
  });

  if (lives <= 0 && state === "playing") {
    paused = false;
    state = "gameover";
    endScreenTime = performance.now();
    AudioManager.stopMusic();
    AudioManager.playSFX("src/sounds/gameover.mp3");
  }

  if (score >= config.target && state === "playing") {
    state = "finished";
    paused = false;

    AudioManager.stopMusic();
    AudioManager.playSFX("src/sounds/victory.mp3");

    setTimeout(() => {
      if (circuitMode) {
        if (currentLevelIndex < 2) {
          // Avanza al siguiente nivel del circuito
          currentLevelIndex++;
          items = [];
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

  ctx.fillStyle = "#091C53";
  ctx.font = `${40 * scale}px sans-serif`;
  let m = Math.floor(time / 60);
  let s = time % 60;
  if (s < 10) s = "0" + s;
  ctx.fillText(`${m}:${s}`, (BASE_W - 120) * scale, 50 * scale);
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

function drawPauseButton() {
  const { x, y, r } = pauseBtn;

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
