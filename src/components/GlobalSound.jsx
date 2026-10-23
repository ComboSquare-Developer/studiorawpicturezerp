
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
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    const start = audioContext.currentTime;

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(580, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      460,
      start + 0.07
    );

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      0.018,
      start + 0.008
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + 0.085
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(start);
    oscillator.stop(start + 0.09);
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

    // Only actual button clicks trigger sound.
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        true
      );
    };
  }, []);

  return null;
}
