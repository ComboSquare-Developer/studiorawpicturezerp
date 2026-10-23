
import { useEffect } from "react";

const SOUND_KEY = "studioraw_sound";

let audioContext = null;

function playButtonSound() {
  try {
    if (localStorage.getItem(SOUND_KEY) === "false") {
      return;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    const start = audioContext.currentTime;

    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.75;
    masterGain.connect(audioContext.destination);

    const notes = [
      { frequency: 720, delay: 0, duration: 0.11, volume: 0.16 },
      { frequency: 480, delay: 0.025, duration: 0.13, volume: 0.12 },
    ];

    notes.forEach(({ frequency, delay, duration, volume }) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      const noteStart = start + delay;
      const noteEnd = noteStart + duration;

      oscillator.type = "triangle";

      oscillator.frequency.setValueAtTime(
        frequency,
        noteStart
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 0.85,
        noteEnd
      );

      gain.gain.setValueAtTime(0.0001, noteStart);

      gain.gain.exponentialRampToValueAtTime(
        volume,
        noteStart + 0.012
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteEnd
      );

      oscillator.connect(gain);
      gain.connect(masterGain);

      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.01);
    });
  } catch {
    // Sound is optional.
  }
}

export default function GlobalSound() {
  useEffect(() => {
    const handleClick = (event) => {
      if (!event.isTrusted) return;

      const target = event.target;

      if (!(target instanceof Element)) return;

      const button = target.closest(
        "button, input[type='button'], input[type='submit'], input[type='reset'], [role='button']"
      );

      if (!button) return;

      if (
        button.matches(":disabled") ||
        button.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }

      playButtonSound();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
