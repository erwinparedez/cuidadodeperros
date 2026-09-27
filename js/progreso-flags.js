const CLAVES_POR_FLAG = {
  gameA_moduleCompletadoPorAvatar: "gameA_progresoPorAvatar",
  gameB_moduleCompletadoPorAvatar: "gameB_progresoPorAvatar",
  gameC_moduleCompletadoPorAvatar: "gameC_progresoPorAvatar",
  gameD_moduleCompletadoPorAvatar: "gameD_progresoPorAvatar",
};

export function actualizarFlagsDesdeStorage() {
  Object.entries(CLAVES_POR_FLAG).forEach(
    ([nombreFlagGlobal, claveStorage]) => {
      let all = {};
      try {
        const raw = localStorage.getItem(claveStorage);
        all = raw ? JSON.parse(raw) : {};
      } catch (e) {
        all = {};
      }

      window[nombreFlagGlobal] = {
        A: !!all.A?.moduleCompletado,
        B: !!all.B?.moduleCompletado,
        C: !!all.C?.moduleCompletado,
      };
    },
  );
}
