import * as AudioManager from "./audioManager.js";

const botonesAudio = document.querySelectorAll(".audio-btn button");

function actualizarBoton(btn, activo) {
  const contenedor = btn.closest(".audio-btn");
  const span = contenedor.querySelector("span");

  const esMusica = span.textContent.toLowerCase().includes("música");

  // Cambiar estado visual
  btn.classList.toggle("activo", activo);

  // Cambiar texto
  span.textContent = activo
    ? span.textContent.replace("Con", "Sin")
    : span.textContent.replace("Sin", "Con");

  // Aplicar cambio
  if (esMusica) {
    AudioManager.setMusic(!activo);
  } else {
    AudioManager.setSFX(!activo);
  }
}

botonesAudio.forEach((btn) => {
  btn.addEventListener("click", () => {
    const activo = !btn.classList.contains("activo");

    if (activo) {
      btn.style.backgroundColor = "";
    } else {
      btn.style.backgroundColor = btn.dataset.colorTema || "";
    }

    actualizarBoton(btn, activo);
  });
});
