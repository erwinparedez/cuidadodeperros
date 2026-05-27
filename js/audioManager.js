// audioManager.js
let musicEnabled = true;
let sfxEnabled = true;

const MUSIC_VOLUME = 0.03;
const SFX_LOOP_VOLUME = 0.02;

let currentMusic = null;
let currentSFXLoop = null;

export function setMusic(enabled) {
  musicEnabled = enabled;
  if (currentMusic) {
    currentMusic.volume = enabled ? MUSIC_VOLUME : 0;
  }
}

export function setSFX(enabled) {
  sfxEnabled = enabled;
  if (currentSFXLoop) {
    currentSFXLoop.volume = enabled ? SFX_LOOP_VOLUME : 0;
  }
}

export function getMusicEnabled() {
  return musicEnabled;
}
export function getSFXEnabled() {
  return sfxEnabled;
}

export function playMusic(src, loop = true) {
  stopMusic();

  currentMusic = new Audio(src);
  currentMusic.loop = loop;
  currentMusic.volume = musicEnabled ? MUSIC_VOLUME : 0;
  currentMusic.play().catch(() => {});
}

export function stopMusic() {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
  }
}

export function playSFX(src, volume = 0.02) {
  if (!sfxEnabled) return;
  const sfx = new Audio(src);
  sfx.volume = volume;
  sfx.play().catch(() => {});
}

export function playSFXLoop(src, volume = SFX_LOOP_VOLUME) {
  stopSFXLoop();

  currentSFXLoop = new Audio(src);
  currentSFXLoop.loop = true;
  currentSFXLoop.volume = sfxEnabled ? volume : 0;
  currentSFXLoop.play().catch(() => {});
}

export function stopSFXLoop() {
  if (currentSFXLoop) {
    currentSFXLoop.pause();
    currentSFXLoop.currentTime = 0;
    currentSFXLoop = null;
  }
}

// Detener todo
export function stopAll() {
  stopMusic();
  stopSFXLoop();
}
