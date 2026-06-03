type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let sharedAudioContext: AudioContext | null = null;

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
