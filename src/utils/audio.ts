type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let sharedAudioContext: AudioContext | null = null;
let victorySampleAudio: HTMLAudioElement | null = null;
let audioPlaybackEnabled = false;

const DEFAULT_VICTORY_SAMPLE_URL = "/audio/victory.wav";

function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as AudioWindow;
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

function getSharedAudioContext(): AudioContext | null {
  if (sharedAudioContext && sharedAudioContext.state !== "closed") {
    return sharedAudioContext;
  }

  const AudioContextCtor = getAudioContextCtor();

  if (!AudioContextCtor) {
    return null;
  }

  sharedAudioContext = new AudioContextCtor();
  return sharedAudioContext;
}

function getVictorySampleUrl(): string {
  return import.meta.env.VITE_VICTORY_SAMPLE_URL?.trim() || DEFAULT_VICTORY_SAMPLE_URL;
}

function getVictorySampleAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!victorySampleAudio) {
    victorySampleAudio = new Audio(getVictorySampleUrl());
    victorySampleAudio.preload = "auto";
  }

  return victorySampleAudio;
}

export async function unlockAudio(): Promise<void> {
  const context = getSharedAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      // Ignore browsers that still refuse resume here.
    }
  }

  getVictorySampleAudio()?.load();
}

export async function enableAudioPlayback(): Promise<boolean> {
  await unlockAudio();

  const sampleAudio = getVictorySampleAudio();

  if (sampleAudio) {
    const previousMuted = sampleAudio.muted;
    const previousVolume = sampleAudio.volume;

    try {
      sampleAudio.muted = true;
      sampleAudio.volume = 0;
      sampleAudio.currentTime = 0;
      await sampleAudio.play();
      sampleAudio.pause();
      sampleAudio.currentTime = 0;
      sampleAudio.muted = previousMuted;
      sampleAudio.volume = previousVolume;
      audioPlaybackEnabled = true;
      return true;
    } catch {
      sampleAudio.muted = previousMuted;
      sampleAudio.volume = previousVolume;
    }
  }

  const context = getSharedAudioContext();

  if (context?.state === "running") {
    audioPlaybackEnabled = true;
    return true;
  }

  return false;
}

export function isAudioPlaybackEnabled(): boolean {
  return audioPlaybackEnabled;
}

export async function playVictoryFanfare(): Promise<void> {
  const context = getSharedAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return;
    }
  }

  const notes = [
    { frequency: 392.0, duration: 0.14 },
    { frequency: 523.25, duration: 0.16 },
    { frequency: 659.25, duration: 0.2 },
    { frequency: 783.99, duration: 0.34 }
  ];

  let time = context.currentTime + 0.02;

  for (const note of notes) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(note.frequency, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.18, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + note.duration);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(time);
    oscillator.stop(time + note.duration + 0.03);

    time += note.duration * 0.88;
  }
}

export async function playVictorySample(): Promise<boolean> {
  const sampleAudio = getVictorySampleAudio();

  if (!sampleAudio || !audioPlaybackEnabled) {
    return false;
  }

  try {
    sampleAudio.pause();
    sampleAudio.currentTime = 0;
    await sampleAudio.play();
    return true;
  } catch {
    return false;
  }
}

export async function playVictoryCue(): Promise<void> {
  const sampleStarted = await playVictorySample();

  if (!sampleStarted) {
    await playVictoryFanfare();
  }
}
