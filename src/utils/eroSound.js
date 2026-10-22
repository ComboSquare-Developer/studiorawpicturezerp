
const SOUND_KEY = "studioraw_dashboard_sound";

let audioContext = null;
let masterGain = null;
let noiseBuffer = null;

function getAudio() {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContext || audioContext.state === "closed") {
      audioContext = new AudioContextClass();

      const compressor =
        audioContext.createDynamicsCompressor();

      compressor.threshold.value = -16;
      compressor.knee.value = 10;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.18;

      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.8;

      masterGain.connect(compressor);
      compressor.connect(audioContext.destination);

      noiseBuffer = null;
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  } catch {
    return null;
  }
}

function tone({
  frequency = 180,
  endFrequency = 60,
  duration = 0.22,
  volume = 0.35,
  delay = 0,
  type = "triangle",
  filterFrequency = 1800,
} = {}) {
  const ctx = getAudio();
  if (!ctx || !masterGain) return;

  const start = ctx.currentTime + delay + 0.005;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.type = type;

  oscillator.frequency.setValueAtTime(
    Math.max(20, frequency),
    start
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(20, endFrequency),
    start + duration
  );

  filter.type = "lowpass";
  filter.frequency.value = filterFrequency;

  const attack = Math.min(0.012, duration / 4);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(0.001, volume),
    start + attack
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.015);
}

function noise({
  duration = 0.2,
  volume = 0.16,
  delay = 0,
  startFrequency = 400,
  endFrequency = 2400,
} = {}) {
  const ctx = getAudio();
  if (!ctx || !masterGain) return;

  if (!noiseBuffer) {
    const length = Math.floor(ctx.sampleRate * 0.6);

    noiseBuffer = ctx.createBuffer(
      1,
      length,
      ctx.sampleRate
    );

    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  const start = ctx.currentTime + delay + 0.005;

  source.buffer = noiseBuffer;

  filter.type = "bandpass";
  filter.Q.value = 0.75;

  filter.frequency.setValueAtTime(
    startFrequency,
    start
  );

  filter.frequency.exponentialRampToValueAtTime(
    endFrequency,
    start + duration * 0.7
  );

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(
    volume,
    start + duration * 0.3
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + duration
  );

  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  source.start(start);
  source.stop(start + duration);
}

function bassHit(delay = 0, strength = 0.38) {
  tone({
    frequency: 175,
    endFrequency: 52,
    duration: 0.24,
    volume: strength,
    delay,
    type: "triangle",
    filterFrequency: 550,
  });
}

function digitalClick(delay = 0) {
  tone({
    frequency: 1250,
    endFrequency: 380,
    duration: 0.085,
    volume: 0.14,
    delay,
    type: "square",
    filterFrequency: 2400,
  });
}

function whoosh(delay = 0) {
  noise({
    duration: 0.28,
    volume: 0.14,
    delay,
    startFrequency: 350,
    endFrequency: 2700,
  });

  tone({
    frequency: 280,
    endFrequency: 900,
    duration: 0.25,
    volume: 0.12,
    delay,
    type: "sawtooth",
    filterFrequency: 1600,
  });
}

export function isERPSoundEnabled() {
  return localStorage.getItem(SOUND_KEY) === "true";
}

export function setERPSoundEnabled(enabled) {
  localStorage.setItem(SOUND_KEY, String(enabled));

  window.dispatchEvent(
    new CustomEvent("studioraw-sound-change", {
      detail: { enabled },
    })
  );
}

export function unlockERPAudio() {
  getAudio();
}

export function playERPSound(type = "click", index = 0) {
  if (!isERPSoundEnabled()) return;

  switch (type) {
    case "click":
      bassHit(0, 0.42);
      digitalClick(0.015);
      break;

    case "navigate":
      bassHit(0, 0.48);
      whoosh(0.035);
      digitalClick(0.16);
      break;

    case "open":
      bassHit(0, 0.34);
      whoosh(0.025);

      tone({
        frequency: 430,
        endFrequency: 850,
        duration: 0.2,
        volume: 0.15,
        delay: 0.08,
      });
      break;

    case "close":
      tone({
        frequency: 650,
        endFrequency: 230,
        duration: 0.22,
        volume: 0.24,
      });

      bassHit(0.055, 0.28);
      break;

    case "success":
      bassHit(0, 0.35);

      [523, 659, 784, 1046].forEach(
        (frequency, i) => {
          tone({
            frequency,
            endFrequency: frequency * 1.02,
            duration: 0.22,
            volume: 0.18,
            delay: 0.06 + i * 0.085,
            type: "sine",
          });
        }
      );
      break;

    case "delete":
      bassHit(0, 0.52);

      tone({
        frequency: 480,
        endFrequency: 140,
        duration: 0.33,
        volume: 0.3,
        delay: 0.045,
        type: "sawtooth",
        filterFrequency: 850,
      });

      digitalClick(0.07);
      break;

    case "select":
      digitalClick();

      tone({
        frequency: 570,
        endFrequency: 850,
        duration: 0.12,
        volume: 0.14,
        delay: 0.025,
      });
      break;

    case "refresh":
      whoosh();
      bassHit(0.05, 0.4);

      [440, 554, 659, 880].forEach(
        (frequency, i) => {
          tone({
            frequency,
            endFrequency: frequency * 1.08,
            duration: 0.2,
            volume: 0.13,
            delay: 0.09 + i * 0.075,
          });
        }
      );
      break;

    case "welcome":
      bassHit(0, 0.42);
      whoosh(0.06);

      [392, 523, 659, 784, 1046].forEach(
        (frequency, i) => {
          tone({
            frequency,
            endFrequency: frequency * 1.03,
            duration: 0.26,
            volume: 0.15,
            delay: 0.1 + i * 0.11,
          });
        }
      );
      break;

    case "graph":
      tone({
        frequency: 240 + (index % 12) * 52,
        endFrequency: 480 + (index % 12) * 72,
        duration: 0.18,
        volume: 0.16,
        type: "triangle",
      });

      if (index % 3 === 0) {
        bassHit(0, 0.18);
      }
      break;

    case "counter":
      tone({
        frequency: 400 + (index % 10) * 35,
        endFrequency: 550 + (index % 10) * 45,
        duration: 0.07,
        volume: 0.07,
      });
      break;

    default:
      bassHit();
      digitalClick();
  }
}
