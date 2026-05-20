// Instrucciones
export let pasoActual = 0;

const secInstruc = document.getElementById("instrucciones-box");

const card = document.getElementById("instrucciones-card");
const stepCircle = document.getElementById("step-circle");
const cardText = document.getElementById("card-description");
const cardImgA = document.getElementById("card-img-character");
const cardImgB = document.getElementById("card-img-tutorial");

const cardBeforeBtn = document.getElementById("btn-anterior");
const cardAfterBtn = document.getElementById("btn-siguiente");
const cardEntendidoBtn = document.getElementById("btn-entendido");

const instruccionesData = {
  A: [
    {
      imgA: "../src/chars-01.png",
      imgB: "../src/game-a/guide-a.gif",
      step: "Paso 1",
      text: "Mueve los personajes a la izquierda o a la derecha para atrapar la comida con borde verde.",
    },
    {
      imgA: "../src/chars-02.png",
      imgB: "../src/game-a/guide-b.gif",
      step: "Paso 2",
      text: "No atrapes la comida con borde rojo, te harán perder vidas.",
    },
    {
      imgA: "../src/chars-03.png",
      imgB: "../src/game-a/guide-c.gif",
      step: "Paso 3",
      text: "Recolectar las croquetas con borde amarillo te harán recuperar vidas.",
    },
  ],

  B: [
    {
      imgA: "../src/chars-01.png",
      imgB: "../src/game-b/guide-a.gif",
      step: "Paso 1",
      text: "Arrastra las piezas hacia el tablero para formar la imagen.",
    },
    {
      imgA: "../src/chars-03.png",
      imgB: "../src/game-b/guide-b.gif",
      step: "Paso 2",
      text: "Ordena las piezas hasta formar la imagen completa.",
    },
    {
      imgA: "../src/chars-01.png",
      imgB: "../src/game-b/guide-c.gif",
      step: "Paso 3",
      text: "Completa el rompecabezas antes de que el tiempo se acabe.",
    },
  ],

  C: [
    {
      imgA: "../src/chars-01.png",
      imgB: "../src/game-c/guide-a.gif",
      step: "Paso 1",
      text: "Presiona sobre las pulgas y moscas para eliminarlas.",
    },
    {
      imgA: "../src/chars-02.png",
      imgB: "../src/game-c/guide-b.gif",
      step: "Paso 2",
      text: "Si los enemigos llegan al collar perderás vidas.",
    },
    {
      imgA: "../src/chars-03.png",
      imgB: "../src/game-c/guide-c.gif",
      step: "Paso 3",
      text: "Consigue los puntos necesarios antes de que  tus vidas se acaben.",
    },
  ],

  D: [
    {
      imgA: "../src/chars-01.png",
      imgB: "../src/game-d/guide-a.gif",
      step: "Paso 1",
      text: "Busca en el mapa todos los objetos que están en la lista.",
    },
    {
      imgA: "../src/chars-03.png",
      imgB: "../src/game-d/guide-b.gif",
      step: "Paso 2",
      text: "Presiona sobre el objeto cuando los encuentres. (Por ejemplo: Calcetín)",
    },
    {
      imgA: "../src/chars-03.png",
      imgB: "../src/game-d/guide-c.gif",
      step: "Paso 3",
      text: "Encuentra todos los objetos antes de que el tiempo termine.",
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

  cardImgA.src = paso.imgA;
  cardImgB.src = paso.imgB;
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
