type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export const SOUNDBOARD_SOUNDS = [
  { id: "alarm", label: "Airhorn" },
  { id: "drumroll", label: "Trommelwirbel" },
  { id: "ta-da", label: "Ta-Da" },
  { id: "gryffindor", label: "Gryffindor" },
  { id: "one-does-not-simply", label: "One Does Not Simply" },
  { id: "fart", label: "Fart" }
] as const;

export type SoundboardSoundId = (typeof SOUNDBOARD_SOUNDS)[number]["id"];

let sharedAudioContext: AudioContext | null = null;
let victorySampleAudio: HTMLAudioElement | null = null;
const soundboardSampleAudios = new Map<SoundboardSoundId, HTMLAudioElement>();
let audioPlaybackEnabled = false;

const DEFAULT_VICTORY_SAMPLE_URL = "/audio/843046__silverillusionist__victory-fanfare-8-bit-thunder-4.wav";
const DEFAULT_SOUNDBOARD_SAMPLE_URLS: Record<SoundboardSoundId, string> = {
  alarm: "/audio/528807__pfranzen__dj-airhorn-sound.ogg",
  drumroll: "/audio/191718__adriann__drumroll.wav",
  "ta-da": "/audio/850021__yoshicakes77__tada.wav",
  gryffindor: "/audio/gryffindor.wav",
  "one-does-not-simply": "/audio/one_does_not_simply.wav",
  fart: "/audio/446000__breviceps__fart-3.wav"
};

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

function getSoundboardSampleUrl(soundId: SoundboardSoundId): string {
  return DEFAULT_SOUNDBOARD_SAMPLE_URLS[soundId];
}

function getSoundboardSampleAudio(soundId: SoundboardSoundId): HTMLAudioElement | null {
  if (typeof window === "undefined") {
    return null;
  }

  const existingAudio = soundboardSampleAudios.get(soundId);
  if (existingAudio) {
    return existingAudio;
  }

  const sampleAudio = new Audio(getSoundboardSampleUrl(soundId));
  sampleAudio.preload = "auto";
  soundboardSampleAudios.set(soundId, sampleAudio);
  return sampleAudio;
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
  for (const sound of SOUNDBOARD_SOUNDS) {
    getSoundboardSampleAudio(sound.id)?.load();
  }
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

function scheduleTone(
  context: AudioContext,
  startAt: number,
  duration: number,
  frequency: number,
  gainValue: number,
  type: OscillatorType = "triangle"
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
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

async function playSoundboardSample(soundId: SoundboardSoundId): Promise<boolean> {
  const sampleAudio = getSoundboardSampleAudio(soundId);

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

export async function playSoundboardCue(soundId: SoundboardSoundId): Promise<void> {
  const sampleStarted = await playSoundboardSample(soundId);

  if (sampleStarted) {
    return;
  }

  if (!audioPlaybackEnabled) {
    return;
  }

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

  const startAt = context.currentTime + 0.02;

  switch (soundId) {
    case "alarm":
      scheduleTone(context, startAt, 0.16, 880, 0.12, "square");
      scheduleTone(context, startAt + 0.22, 0.16, 660, 0.12, "square");
      scheduleTone(context, startAt + 0.44, 0.16, 880, 0.12, "square");
      scheduleTone(context, startAt + 0.66, 0.16, 660, 0.12, "square");
      break;
    case "drumroll":
      for (let index = 0; index < 10; index += 1) {
        scheduleTone(context, startAt + index * 0.06, 0.045, 110 + index * 8, 0.09, "square");
      }
      scheduleTone(context, startAt + 0.72, 0.28, 220, 0.14, "triangle");
      break;
    case "ta-da":
      scheduleTone(context, startAt, 0.14, 523.25, 0.12);
      scheduleTone(context, startAt + 0.16, 0.16, 659.25, 0.12);
      scheduleTone(context, startAt + 0.34, 0.32, 783.99, 0.14);
      break;
    default:
      break;
  }
}
