// Instrucciones
export let pasoActual = 0;

const secInstruc = document.getElementById("instrucciones-box");

const card = document.getElementById("instrucciones-card");
const stepCircle = document.getElementById("step-circle");
const cardText = document.getElementById("card-description");
const cardImgA = document.getElementById("card-img-character");
const cardVideoB = document.getElementById("card-img-tutorial");

const cardBeforeBtn = document.getElementById("btn-anterior");
const cardAfterBtn = document.getElementById("btn-siguiente");
const cardEntendidoBtn = document.getElementById("btn-entendido");

function getChar(step) {
  const currentVariant = (window.customCardSeleccionada || "A").toUpperCase();

  return `./src/chars-${currentVariant.toLowerCase()}${step}.webp`;
}

const instruccionesData = {
  A: [
    {
      charStep: "01",
      imgB: "./src/game-a/videoguide-a01.webm",
      step: "Paso 1",
      text: "Mueve los personajes presionando Izquierda o Derecha en tu teclado, o muevelos con el mouse para atrapar la comida con borde verde.",
    },
    {
      charStep: "02",
      imgB: "./src/game-a/videoguide-a02.webm",
      step: "Paso 2",
      text: "Evita la comida con borde rojo, te harán perder vidas.",
    },
    {
      charStep: "03",
      imgB: "./src/game-a/videoguide-a03.webm",
      step: "Paso 3",
      text: "Recolectar las croquetas con borde amarillo te harán recuperar vidas.",
    },
  ],

  B: [
    {
      charStep: "01",
      imgB: "./src/game-b/videoguide-b01.webm",
      step: "Paso 1",
      text: "Arrastra las piezas hacia el tablero para armar la figura.",
    },
    {
      charStep: "03",
      imgB: "./src/game-b/videoguide-b02.webm",
      step: "Paso 2",
      text: "Coloca las piezas en el lugar correcto hasta formar la figura completa.",
    },
    {
      charStep: "01",
      imgB: "./src/game-b/videoguide-b03.webm",
      step: "Paso 3",
      text: "Completa el rompecabezas antes de que el tiempo se acabe.",
    },
  ],

  C: [
    {
      charStep: "01",
      imgB: "./src/game-c/videoguide-c01.webm",
      step: "Paso 1",
      text: "Presiona sobre las pulgas y moscas para eliminarlas.",
    },
    {
      charStep: "02",
      imgB: "./src/game-c/videoguide-c02.webm",
      step: "Paso 2",
      text: "Si los enemigos llegan al collar, perderás vidas.",
    },
    {
      charStep: "03",
      imgB: "./src/game-c/videoguide-c03.webm",
      step: "Paso 3",
      text: "Consigue todos los puntos necesarios antes de que tus vidas se acaben.",
    },
  ],

  D: [
    {
      charStep: "01",
      imgB: "./src/game-d/videoguide-d01.webm",
      step: "Paso 1",
      text: "Busca en el mapa todos los objetos que están en la lista.",
    },
    {
      charStep: "03",
      imgB: "./src/game-d/videoguide-d02.webm",
      step: "Paso 2",
      text: "Presiona sobre el objeto cuando lo encuentres. (Por ejemplo: Calcetín)",
    },
    {
      charStep: "01",
      imgB: "./src/game-d/videoguide-d03.webm",
      step: "Paso 3",
      text: "Encuentra todos los objetos antes de que el tiempo se acabe.",
    },
  ],
};

export function resetInstrucciones() {
  pasoActual = 0;
  renderPaso();
}

export function renderPaso() {
  const juego = window.juegoActualId;
  const pasos = instruccionesData[juego];
  const paso = pasos[pasoActual];

  cardImgA.src = getChar(paso.charStep);

  cardVideoB.pause();
  cardVideoB.src = paso.imgB;
  cardVideoB.load();
  cardVideoB.currentTime = 0;
  cardVideoB.play().catch(() => {});

  stepCircle.textContent = (pasoActual + 1).toString().padStart(2, "0");
  cardText.textContent = paso.text;

  cardBeforeBtn.style.display = pasoActual === 0 ? "none" : "inline-block";
  cardAfterBtn.style.display =
    pasoActual === pasos.length - 1 ? "none" : "inline-block";
  cardEntendidoBtn.style.display =
    pasoActual === pasos.length - 1 ? "inline-block" : "none";
}

cardAfterBtn.addEventListener("click", () => {
  pasoActual++;
  renderPaso();
});

cardBeforeBtn.addEventListener("click", () => {
  pasoActual--;
  renderPaso();
});

cardEntendidoBtn.addEventListener("click", () => {
  secInstruc.classList.remove("activo");
});
