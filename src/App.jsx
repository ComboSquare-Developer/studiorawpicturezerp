
import { useEffect, useRef, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Enquiries from "./pages/Enquiries";
import Customers from "./pages/Customers";
import BookingCalendar from "./pages/BookingCalendar";
import Payments from "./pages/Payments";
import PreShoot from "./pages/PreShoot";
import PhotoShoot from "./pages/PhotoShoot";
import Delivery from "./pages/Delivery";
import Inventory from "./pages/Inventory";
import Equipment from "./pages/Equipment";
import Expenses from "./pages/Expenses";
import Branches from "./pages/Branches";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

const SOUND_KEY = "studioraw_dashboard_sound";

function createSoundEngine() {
  let ctx = null;
  let output = null;
  let noiseBuffer = null;

  function getContext() {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return null;

      if (!ctx || ctx.state === "closed") {
        ctx = new AudioContextClass();

        const compressor =
          ctx.createDynamicsCompressor();

        compressor.threshold.value = -16;
        compressor.knee.value = 10;
        compressor.ratio.value = 5;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.18;

        output = ctx.createGain();
        output.gain.value = 0.75;

        output.connect(compressor);
        compressor.connect(ctx.destination);

        noiseBuffer = null;
      }

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      return ctx;
    } catch {
      return null;
    }
  }

  function tone({
    frequency = 180,
    endFrequency = 60,
    duration = 0.2,
    volume = 0.25,
    delay = 0,
    type = "triangle",
  } = {}) {
    const audio = getContext();
    if (!audio || !output) return;

    const start = audio.currentTime + delay + 0.005;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      Math.max(20, frequency),
      start
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      start + duration
    );

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      volume,
      start + Math.min(0.012, duration / 4)
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration
    );

    oscillator.connect(gain);
    gain.connect(output);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function whoosh(delay = 0) {
    const audio = getContext();
    if (!audio || !output) return;

    if (!noiseBuffer) {
      noiseBuffer = audio.createBuffer(
        1,
        Math.floor(audio.sampleRate * 0.4),
        audio.sampleRate
      );

      const samples = noiseBuffer.getChannelData(0);

      for (let i = 0; i < samples.length; i++) {
        samples[i] = Math.random() * 2 - 1;
      }
    }

    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();

    const start = audio.currentTime + delay + 0.005;
    const duration = 0.24;

    source.buffer = noiseBuffer;

    filter.type = "bandpass";
    filter.Q.value = 0.8;

    filter.frequency.setValueAtTime(380, start);
    filter.frequency.exponentialRampToValueAtTime(
      2600,
      start + duration * 0.7
    );

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(
      0.15,
      start + duration * 0.3
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration
    );

    source.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    source.start(start);
    source.stop(start + duration);
  }

  function bass(strength = 0.36, delay = 0) {
    tone({
      frequency: 175,
      endFrequency: 55,
      duration: 0.23,
      volume: strength,
      delay,
      type: "triangle",
    });
  }

  function click(delay = 0) {
    tone({
      frequency: 1250,
      endFrequency: 390,
      duration: 0.085,
      volume: 0.13,
      delay,
      type: "square",
    });
  }

  function play(type = "click") {
    switch (type) {
      case "navigate":
        bass(0.4);
        whoosh(0.02);
        click(0.13);
        break;

      case "success":
        bass(0.32);

        [523, 659, 784, 1046].forEach(
          (frequency, index) => {
            tone({
              frequency,
              endFrequency: frequency * 1.03,
              duration: 0.2,
              volume: 0.15,
              delay: 0.05 + index * 0.08,
              type: "sine",
            });
          }
        );
        break;

      case "delete":
        bass(0.45);

        tone({
          frequency: 450,
          endFrequency: 130,
          duration: 0.3,
          volume: 0.25,
          delay: 0.04,
          type: "sawtooth",
        });

        click(0.07);
        break;

      case "open":
        bass(0.3);
        whoosh(0.03);

        tone({
          frequency: 430,
          endFrequency: 850,
          duration: 0.2,
          volume: 0.13,
          delay: 0.07,
        });
        break;

      case "close":
        tone({
          frequency: 680,
          endFrequency: 230,
          duration: 0.2,
          volume: 0.23,
        });

        bass(0.24, 0.04);
        break;

      case "select":
        click();

        tone({
          frequency: 550,
          endFrequency: 850,
          duration: 0.12,
          volume: 0.11,
          delay: 0.02,
        });
        break;

      case "welcome":
        bass(0.4);
        whoosh(0.04);

        [392, 523, 659, 784, 1046].forEach(
          (frequency, index) => {
            tone({
              frequency,
              endFrequency: frequency * 1.02,
              duration: 0.24,
              volume: 0.14,
              delay: 0.08 + index * 0.1,
              type: "sine",
            });
          }
        );
        break;

      default:
        bass(0.35);
        click(0.012);
        break;
    }
  }

  return {
    play,
    unlock: getContext,
  };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return (
      localStorage.getItem("studioraw_logged_in") === "true"
    );
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem(SOUND_KEY) !== "false";
  });

  const soundEngineRef = useRef(null);
  const lastSoundRef = useRef(0);
  const soundEnabledRef = useRef(soundEnabled);

  if (!soundEngineRef.current) {
    soundEngineRef.current = createSoundEngine();
  }

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;

    localStorage.setItem(
      SOUND_KEY,
      String(soundEnabled)
    );
  }, [soundEnabled]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(
        "studioraw_logged_in",
        "true"
      );
    } else {
      localStorage.removeItem("studioraw_logged_in");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    function syncSound() {
      const enabled =
        localStorage.getItem(SOUND_KEY) === "true";

      soundEnabledRef.current = enabled;
      setSoundEnabled(enabled);
    }

    window.addEventListener("storage", syncSound);
    window.addEventListener(
      "studioraw-sound-change",
      syncSound
    );

    return () => {
      window.removeEventListener("storage", syncSound);
      window.removeEventListener(
        "studioraw-sound-change",
        syncSound
      );
    };
  }, []);

  useEffect(() => {
    function playLimited(type) {
      if (!soundEnabledRef.current) return;

      const now = Date.now();

      if (now - lastSoundRef.current < 85) {
        return;
      }

      lastSoundRef.current = now;
      soundEngineRef.current?.play(type);
    }

    function detectType(element) {
      const text = [
        element.getAttribute("aria-label"),
        element.getAttribute("title"),
        element.getAttribute("data-sound"),
        element.textContent,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (/delete|remove|discard|clear/i.test(text)) {
        return "delete";
      }

      if (
        /save|submit|confirm|update|complete|approve/i.test(
          text
        )
      ) {
        return "success";
      }

      if (/cancel|close|dismiss/i.test(text)) {
        return "close";
      }

      if (/add|create|new|open|edit|view/i.test(text)) {
        return "open";
      }

      if (
        element.matches(
          'select, [role="option"], [role="combobox"]'
        )
      ) {
        return "select";
      }

      return "click";
    }

    function handleClick(event) {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const element = target.closest(
        'button, a, [role="button"], [role="tab"], [role="menuitem"], [role="option"], [role="combobox"], input, select, textarea, label, summary'
      );

      if (!element) return;

      if (
        element.hasAttribute("disabled") ||
        element.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }

      soundEngineRef.current?.unlock();
      playLimited(detectType(element));
    }

    function handleChange(event) {
      const target = event.target;

      if (
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLInputElement &&
          ["checkbox", "radio", "range"].includes(
            target.type
          ))
      ) {
        playLimited("select");
      }
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("change", handleChange, true);

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        true
      );
      document.removeEventListener(
        "change",
        handleChange,
        true
      );
    };
  }, []);

  const handleLogin = () => {
    localStorage.setItem(
      "studioraw_logged_in",
      "true"
    );

    setIsLoggedIn(true);
    setActivePage("dashboard");

    if (soundEnabledRef.current) {
      soundEngineRef.current?.play("welcome");
    }
  };

  const handleLogout = () => {
    if (soundEnabledRef.current) {
      soundEngineRef.current?.play("close");
    }

    localStorage.removeItem(
      "studioraw_logged_in"
    );

    setIsLoggedIn(false);
    setSidebarOpen(false);
    setActivePage("dashboard");
  };

  const handleNavigate = (page) => {
    const nextPage = String(page).toLowerCase();

    if (
      nextPage !== activePage &&
      soundEnabledRef.current
    ) {
      soundEngineRef.current?.play("navigate");
      lastSoundRef.current = Date.now();
    }

    setActivePage(nextPage);
    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard setActivePage={handleNavigate} />
        );

      case "enquiries":
      case "leads":
        return <Enquiries />;

      case "customers":
        return <Customers />;

      case "bookings":
      case "bookingcalendar":
      case "calendar":
        return <BookingCalendar />;

      case "payments":
      case "billing":
        return <Payments />;

      case "preshoot":
      case "shootreadiness":
        return <PreShoot />;

      case "photoshoot":
        return <PhotoShoot />;

      case "delivery":
        return <Delivery />;

      case "inventory":
        return <Inventory />;

      case "equipment":
        return <Equipment />;

      case "expenses":
        return <Expenses />;

      case "branches":
        return <Branches />;

      case "reports":
        return <Reports />;

      case "notifications":
        return <Notifications />;

      case "auditlogs":
      case "audit-logs":
        return <AuditLogs />;

      case "settings":
        return <Settings />;

      default:
        return (
          <Dashboard setActivePage={handleNavigate} />
        );
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activePage={activePage}
        setActivePage={handleNavigate}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="min-h-screen min-w-0 lg:ml-[280px]">
        <Header
          activePage={activePage}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
        />

        <main className="min-w-0 p-3 sm:p-5 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
