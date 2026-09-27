import { actualizarFlagsDesdeStorage } from "./progreso-flags.js";
import { actualizarProgresion } from "./menu.js";

const ALL_KEYS = [
  "gameA_progresoPorAvatar",
  "gameB_progresoPorAvatar",
  "gameC_progresoPorAvatar",
  "gameD_progresoPorAvatar",
];

function hayProgresoGuardado() {
  return ALL_KEYS.some((key) => {
    try {
      const value = localStorage.getItem(key);
      return (
        value !== null && value !== undefined && value !== "{}" && value !== ""
      );
    } catch (e) {
      console.warn("No se pudo leer localStorage para la clave:", key, e);
      return false;
    }
  });
}

function borrarProgresoApp() {
  ALL_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("No se pudo borrar la clave:", key, e);
    }
  });
}

function inyectarEstilos() {
  if (document.getElementById("pm-modal-styles")) return;

  const style = document.createElement("style");
  style.id = "pm-modal-styles";
  style.textContent = `
    .pm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(20, 20, 40, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 16px;
      animation: pm-fade-in 0.25s ease-out;
      font-family: 'Comic Sans MS', 'Trebuchet MS', Arial, sans-serif;
    }

    @keyframes pm-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .pm-modal {
      background: #fff8e7;
      border: 6px solid #ffb703;
      border-radius: 28px;
      max-width: 420px;
      width: 100%;
      padding: 28px 24px;
      text-align: center;
      box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      animation: pm-pop 0.3s ease-out;
    }

    @keyframes pm-pop {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .pm-emoji {
      font-size: 48px;
      margin-bottom: 8px;
      line-height: 1;
    }

    .pm-title {
      font-size: 22px;
      color: #d1495b;
      margin: 8px 0 12px;
      font-weight: 800;
    }

    .pm-text {
      font-size: 16px;
      color: #333;
      margin-bottom: 22px;
      line-height: 1.5;
    }

    .pm-buttons {
      padding-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pm-btn {
      border: none;
      border-radius: 18px;
      padding: 14px 18px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s ease, filter 0.15s ease;
      font-family: inherit;
    }

    .pm-btn:hover {
      transform: translateY(-2px);
      filter: brightness(1.05);
    }

    .pm-btn:active {
      transform: translateY(0);
    }

    .pm-btn-keep {
      background: #06d6a0;
      color: #06402a;
    }

    .pm-btn-reset {
      background: #ef476f;
      color: #ffffff;
    }

    @media (max-width: 380px) {
      .pm-title { font-size: 19px; }
      .pm-text { font-size: 14px; }
    }
  `;
  document.head.appendChild(style);
}

function mostrarModalProgreso(onKeep, onReset) {
  inyectarEstilos();

  const overlay = document.createElement("div");
  overlay.className = "pm-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "pm-title");

  overlay.innerHTML = `
    <div class="pm-modal">
    <p class='pm-emoji'>💿✨</p>
      <h2 class="pm-title" id="pm-title">¡Que bueno verte de nuevo!</h2>
      <p class="pm-text">
        Encontramos una partida guardada tuya.<br>
        ¿Quieres <strong>seguir jugando</strong> desde donde te quedaste,
        o prefieres <strong>empezar de cero</strong>?
      </p>
      <div class="pm-buttons">
        <button type="button" class="pm-btn pm-btn-keep" id="pm-btn-keep">
          Continuar donde me quedé
        </button>
        <button type="button" class="pm-btn pm-btn-reset" id="pm-btn-reset">
          Empezar de cero
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnKeep = overlay.querySelector("#pm-btn-keep");
  const btnReset = overlay.querySelector("#pm-btn-reset");

  function cerrarModal() {
    overlay.remove();
  }

  btnKeep.addEventListener("click", () => {
    cerrarModal();
    if (typeof onKeep === "function") onKeep();
  });

  btnReset.addEventListener("click", () => {
    cerrarModal();
    if (typeof onReset === "function") onReset();
  });
}

export function mostrarModalFelicidades(onAceptar) {
  inyectarEstilos();

  const overlay = document.createElement("div");
  overlay.className = "pm-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "pm-title-felicidades");

  overlay.innerHTML = `
    <div class="pm-modal">
      <div class="pm-emoji">🐶❤️🎉</div>
      <h2 class="pm-title" id="pm-title-felicidades">¡Guau, guau! ¡Lo lograste!</h2>
      <h2 class="pm-title" id="pm-title-felicidades">🏆 ¡HAS COMPLETADO TODO EL JUEGO! 🏆</h2>
      <p>Lograste superar todos los niveles y completado la aventura. Muchas FELICIDADES.</p>
      <div class="pm-buttons">
        <button type="button" class="pm-btn pm-btn-keep" id="pm-btn-entendido">
          Entendido
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnEntendido = overlay.querySelector("#pm-btn-entendido");

  function cerrarModal() {
    overlay.remove();
  }

  btnEntendido.addEventListener("click", () => {
    cerrarModal();
    if (typeof onAceptar === "function") onAceptar();
  });
}

function init() {
  if (!hayProgresoGuardado()) return;

  mostrarModalProgreso(
    function onKeep() {
      actualizarFlagsDesdeStorage();
      actualizarProgresion();
    },
    function onReset() {
      borrarProgresoApp();
      window.location.reload();
    },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
