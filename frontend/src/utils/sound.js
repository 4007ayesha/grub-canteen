// Small synthesized sound effects (no audio files needed).
// Set SOUND_ENABLED to false to turn the sounds off everywhere.
const SOUND_ENABLED = true;

let audioCtx = null;

function getContext() {
  if (!SOUND_ENABLED || typeof window === "undefined") return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

function tone(frequency, startAt, duration, volume) {
  const ctx = getContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + startAt;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

// happy two-note "pop" when something is added
export function playAddSound() {
  try {
    tone(660, 0, 0.12, 0.12);
    tone(880, 0.09, 0.18, 0.12);
  } catch (error) {
    // sound is optional, so ignore any audio errors
  }
}

// softer falling tone when something is removed
export function playRemoveSound() {
  try {
    tone(500, 0, 0.12, 0.1);
    tone(380, 0.08, 0.18, 0.1);
  } catch (error) {
    // sound is optional, so ignore any audio errors
  }
}