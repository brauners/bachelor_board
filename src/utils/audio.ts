export function playVictoryFanfare(): void {
  if (typeof window === "undefined") {
    return;
  }

  const audioWindow = window as Window &
    typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextCtor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;

  if (!AudioContextCtor) {
    return;
  }

  const context = new AudioContextCtor();
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

  window.setTimeout(() => {
    void context.close().catch(() => undefined);
  }, 1500);
}
