
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  CalendarDays,
  Wallet,
  Camera,
  PackageCheck,
  Boxes,
  Wrench,
  Receipt,
  Building2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Video,
  PartyPopper,
  Gift,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

import studioLogo from "../assets/favicon.png";

const THEME_KEY = "studioraw_theme";
const SOUND_KEY = "studioraw_sound";

const menuGroups = [
  {
    title: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "enquiries", label: "Enquiries", icon: MessageSquare },
      { id: "customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "SHOOT BOOKINGS & EVENTS",
    items: [
      { id: "bookings", label: "Bookings", icon: CalendarDays },
      {
        id: "wedding-photography",
        label: "Wedding Photography",
        icon: Camera,
      },
      {
        id: "wedding-videography",
        label: "Wedding Videography",
        icon: Video,
      },
      {
        id: "functions-we-arrange",
        label: "Functions We Arrange",
        icon: PartyPopper,
      },
      {
        id: "event-management",
        label: "Event Management",
        icon: CalendarDays,
      },
      {
        id: "customized-gifts",
        label: "Customized Gifts",
        icon: Gift,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { id: "payments", label: "Payments", icon: Wallet },
      { id: "deliveries", label: "Deliveries", icon: PackageCheck },
      { id: "inventory", label: "Inventory", icon: Boxes },
      { id: "equipment", label: "Equipment", icon: Wrench },
      { id: "expenses", label: "Expenses", icon: Receipt },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { id: "branches", label: "Branches", icon: Building2 },
      { id: "reports", label: "Reports", icon: BarChart3 },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

function readSetting(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function applyTheme(nextTheme) {
  const root = document.documentElement;

  root.dataset.theme = nextTheme;
  root.classList.toggle("dark", nextTheme === "dark");
  root.style.colorScheme = nextTheme;

  window.dispatchEvent(
    new CustomEvent("studioraw-theme-change", {
      detail: { theme: nextTheme },
    })
  );
}

export default function Sidebar({
  activePage = "dashboard",
  setActivePage = () => {},
  onLogout = () => {},
  sidebarOpen,
  setSidebarOpen,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const [theme, setTheme] = useState(() =>
    readSetting(THEME_KEY, "dark")
  );

  // Sound functionality retained.
  // Only the Sound On/Off button is removed.
  const [soundEnabled] = useState(() =>
    readSetting(SOUND_KEY, "true") !== "false"
  );

  const audioRef = useRef(null);

  const isControlled =
    typeof sidebarOpen === "boolean" &&
    typeof setSidebarOpen === "function";

  const mobileOpen = isControlled
    ? sidebarOpen
    : internalMobileOpen;

  const setMobileOpen = (value) => {
    if (isControlled) {
      setSidebarOpen(value);
    } else {
      setInternalMobileOpen(value);
    }
  };

  // GLOBAL THEME SYNC
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Local storage unavailable.
    }

    applyTheme(theme);
  }, [theme]);

  // GLOBAL SOUND SYNC
  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(soundEnabled));
    } catch {
      // Local storage unavailable.
    }

    window.dispatchEvent(
      new CustomEvent("studioraw-sound-change", {
        detail: { enabled: soundEnabled },
      })
    );
  }, [soundEnabled]);

  // MOBILE SIDEBAR
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen, isControlled, setSidebarOpen]);

  // AUDIO CLEANUP
  useEffect(() => {
    return () => {
      audioRef.current?.close?.();
    };
  }, []);

  // SOUND EFFECTS
  const playSound = (type = "click", force = false) => {
    if (!soundEnabled && !force) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioRef.current) {
        audioRef.current = new AudioContextClass();
      }

      const context = audioRef.current;

      if (context.state === "suspended") {
        context.resume();
      }

      const sounds = {
        click: [660],
        navigate: [523.25, 659.25],
        expand: [440, 587.33],
        collapse: [587.33, 440],
        toggle: [659.25, 783.99, 1046.5],
        success: [523.25, 659.25, 783.99],
        logout: [659.25, 523.25, 392],
      };

      const notes = sounds[type] || sounds.click;

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        const start = context.currentTime + index * 0.085;
        const end = start + 0.22;

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(frequency, start);

        oscillator.frequency.exponentialRampToValueAtTime(
          frequency * 1.015,
          end
        );

        gain.gain.setValueAtTime(0.0001, start);

        gain.gain.exponentialRampToValueAtTime(
          0.045,
          start + 0.025
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          end
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(end + 0.01);
      });
    } catch (error) {
      console.warn("Audio is unavailable:", error);
    }
  };

  // NAVIGATION
  const handleNavigation = (id) => {
    playSound(id !== activePage ? "navigate" : "click");

    setActivePage(id);
    setMobileOpen(false);
  };

  // LOGOUT
  const handleLogout = () => {
    playSound("logout");
    setMobileOpen(false);
    onLogout();
  };

  // THEME TOGGLE
  const handleThemeToggle = () => {
    playSound("toggle");

    setTheme((previous) =>
      previous === "dark" ? "light" : "dark"
    );
  };

  // COLLAPSE
  const handleCollapse = () => {
    playSound(collapsed ? "expand" : "collapse");
    setCollapsed((previous) => !previous);
  };

  // SIDEBAR CONTENT
  const renderSidebarContent = (isMobile = false) => {
    const showLabels = !collapsed || isMobile;

    const footerBackground =
      theme === "dark" ? "bg-[#071126]" : "bg-[#0c1e3d]";

    return (
      <>
        {/* BRAND */}
        <div
          className={`flex h-[76px] shrink-0 items-center border-b border-white/15 ${
            showLabels
              ? "justify-between px-4"
              : "justify-center px-2"
          }`}
        >
          <div
            className={`flex min-w-0 items-center ${
              showLabels ? "gap-3" : ""
            }`}
          >
            {/* LOGO */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black p-1 shadow-sm">
              <img
                src={studioLogo}
                alt="Studio Raw Picturez Logo"
                className="h-full w-full object-contain"
                draggable={false}
              />
            </div>

            {showLabels && (
              <div className="min-w-0">
                <h1 className="truncate text-sm font-extrabold tracking-wide text-white">
                  STUDIO RAW PICTUREZ
                </h1>

                <p className="mt-1 text-[10px] font-bold tracking-[0.18em] text-white">
                   ERP & CRM
                </p>
              </div>
            )}
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setMobileOpen(false);
              }}
              aria-label="Close sidebar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 text-white transition hover:bg-white/15"
            >
              <X size={20} />
            </button>
          ) : (
            showLabels && (
              <button
                type="button"
                onClick={handleCollapse}
                aria-label="Collapse sidebar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 text-white transition hover:bg-white/15"
              >
                <ChevronLeft size={19} />
              </button>
            )
          )}
        </div>

        {/* EXPAND BUTTON */}
        {!isMobile && collapsed && (
          <div className="border-b border-white/15 px-3 py-3">
            <button
              type="button"
              onClick={handleCollapse}
              title="Expand Sidebar"
              aria-label="Expand sidebar"
              className="flex h-11 w-full items-center justify-center rounded-xl border border-white/15 text-white transition hover:bg-white/15"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-5 [scrollbar-width:thin]">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {showLabels ? (
                <p className="mb-2 px-3 text-[10px] font-extrabold tracking-[0.17em] text-[#b7cbe6]">
                  {group.title}
                </p>
              ) : (
                groupIndex > 0 && (
                  <div className="mx-2 mb-3 border-t border-white/15" />
                )
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={!showLabels ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={() => handleNavigation(item.id)}
                      className={`group flex w-full min-w-0 items-center rounded-xl text-left text-sm font-semibold transition-all duration-200 ${
                        showLabels
                          ? "gap-3 px-3 py-3"
                          : "justify-center px-2 py-3"
                      } ${
                        active
                          ? "bg-white text-[#10264d] shadow-md"
                          : "text-[#d0def2] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={19}
                        strokeWidth={active ? 2.5 : 1.9}
                        className="shrink-0"
                      />

                      {showLabels && (
                        <>
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>

                          {active && (
                            <ChevronRight
                              size={15}
                              className="shrink-0 opacity-70"
                            />
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div
          className={`shrink-0 border-t border-white/15 p-3 transition-colors duration-300 ${footerBackground}`}
        >
          {/* LIGHT / DARK THEME */}
          <button
            type="button"
            onClick={handleThemeToggle}
            title={!showLabels ? "Toggle Theme" : undefined}
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            className={`mb-2 flex w-full items-center rounded-xl border border-white/15 text-sm font-semibold text-white transition hover:bg-white/15 ${
              showLabels
                ? "gap-3 px-3 py-3"
                : "justify-center px-2 py-3"
            }`}
          >
            {theme === "dark" ? (
              <Sun size={19} className="shrink-0" />
            ) : (
              <Moon size={19} className="shrink-0" />
            )}

            {showLabels && (
              <span className="flex-1 text-left">
                {theme === "dark"
                  ? "Light Theme"
                  : "Dark Theme"}
              </span>
            )}
          </button>

          {/* SOUND BUTTON REMOVED */}
          {/* Sound effects still work in the background. */}

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            title={!showLabels ? "Logout" : undefined}
            className={`flex w-full items-center rounded-xl border border-white/15 bg-white/10 text-sm font-semibold text-white transition hover:bg-white/20 ${
              showLabels
                ? "gap-3 px-3 py-3"
                : "justify-center px-2 py-3"
            }`}
          >
            <LogOut size={19} className="shrink-0" />

            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      {!isControlled && (
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setMobileOpen(true);
          }}
          aria-label="Open sidebar"
          className="fixed left-3 top-3 z-[80] flex h-10 w-10 items-center justify-center rounded-xl bg-[#10264d] text-white shadow-lg lg:hidden"
        >
          <Menu size={21} />
        </button>
      )}

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[90] bg-[#06152b]/70 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        aria-label="Mobile navigation"
        className={`fixed inset-y-0 left-0 z-[100] flex w-[min(290px,85vw)] flex-col border-r border-white/10 text-white shadow-2xl transition-all duration-300 lg:hidden ${
          theme === "dark"
            ? "bg-[#0b1730]"
            : "bg-[#10264d]"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {renderSidebarContent(true)}
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside
        aria-label="Desktop navigation"
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/10 text-white shadow-[4px_0_20px_rgba(16,38,77,0.08)] transition-[width,background-color] duration-300 lg:flex ${
          theme === "dark"
            ? "bg-[#0b1730]"
            : "bg-[#10264d]"
        } ${
          collapsed
            ? "w-[78px]"
            : "w-[265px]"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>
    </>
  );
}
