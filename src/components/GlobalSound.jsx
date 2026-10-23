
import { useEffect } from "react";

const SOUND_KEY = "studioraw_sound";

let audioContext = null;

function playGlobalSound(type = "click") {
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

    const sounds = {
      click: [540],
      button: [520, 680],
      input: [440],
      select: [600, 780],
      checkbox: [650, 850],
      navigation: [480, 620],
    };

    const notes = sounds[type] || sounds.click;

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      const start =
        audioContext.currentTime + index * 0.055;

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        frequency,
        start
      );

      gain.gain.setValueAtTime(0.0001, start);

      gain.gain.exponentialRampToValueAtTime(
        0.025,
        start + 0.012
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        start + 0.11
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.12);
    });
  } catch {
    // Audio is optional.
  }
}

export default function GlobalSound() {
  useEffect(() => {
    const handleInteraction = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const element = target.closest(
        "button, a, input, select, textarea, [role='button'], [role='option'], [role='checkbox'], [role='tab']"
      );

      if (!element) {
        playGlobalSound("click");
        return;
      }

      if (
        element.matches(
          "input[type='checkbox'], input[type='radio'], [role='checkbox']"
        )
      ) {
        playGlobalSound("checkbox");
      } else if (
        element.matches(
          "select, option, [role='option']"
        )
      ) {
        playGlobalSound("select");
      } else if (
        element.matches(
          "input, textarea"
        )
      ) {
        playGlobalSound("input");
      } else if (
        element.matches("a, [role='tab']")
      ) {
        playGlobalSound("navigation");
      } else if (
        element.matches("button, [role='button']")
      ) {
        playGlobalSound("button");
      } else {
        playGlobalSound("click");
      }
    };

    // Works for mouse, mobile touch and stylus.
    document.addEventListener(
      "pointerdown",
      handleInteraction,
      true
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleInteraction,
        true
      );
    };
  }, []);

  return null;
}
