"use client";

// Chat alert sound, made with the Web Audio API so there is no sound file to load.
// Browsers only allow sound after the person has tapped or typed on the page,
// so the audio is "unlocked" on the first tap and then reused.

const STORAGE_KEY = "chat-sound";
export const CHAT_SOUND_EVENT = "chat-sound-change";

let context: AudioContext | null = null;
let lastPlayed = 0;

/** Sound is on unless this device turned it off. */
export function chatSoundOn() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setChatSoundOn(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Private mode etc.: the setting just won't stick.
  }
  window.dispatchEvent(new Event(CHAT_SOUND_EVENT));
}

function audio() {
  if (context) return context;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

/** Call from a tap/keypress so later alerts are allowed to play. */
export function unlockChatSound() {
  const ctx = audio();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

/**
 * Play the alert. A direct message gets a rising two-note chime, a whole-team
 * post a single softer note. Several messages at once only chime once.
 */
export function playChatSound(kind: "direct" | "team", force = false) {
  if (!force && !chatSoundOn()) return;
  const now = Date.now();
  if (!force && now - lastPlayed < 1500) return;
  lastPlayed = now;

  const ctx = audio();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const notes = kind === "direct" ? [880, 1318.5] : [659.3];
  const start = ctx.currentTime + 0.02;
  notes.forEach((freq, i) => {
    const t = start + i * 0.16;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(kind === "direct" ? 0.35 : 0.25, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}
