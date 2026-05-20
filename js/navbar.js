import { renderPaso, pasoActual, resetInstrucciones } from "./instrucciones.js";

// Navbar
const btnNav1 = document.getElementById("btn-nav1");
const btnNav2 = document.getElementById("btn-nav2");

// Botón 1 --> Abrir Menú Principal
btnNav1.addEventListener("click", () => {
  if (juegoActual && juegoActual.cleanup) {
    juegoActual.cleanup();
    juegoActual = null;
  }
  menuJuegos.classList.add("activo");
  document.body.classList.add("sin-scroll");
  secInstruc.classList.remove("activo");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const secInstruc = document.getElementById("instrucciones-box");

btnNav2.addEventListener("click", () => {
  resetInstrucciones();
  secInstruc.classList.add("activo");
});
