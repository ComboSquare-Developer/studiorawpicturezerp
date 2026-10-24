
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserCircle,
  Building2,
  X,
  Pencil,
  Mail,
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Command,
  ArrowUpRight,
  ShieldCheck,
  Camera,
} from "lucide-react";

const SOUND_KEY = "studioraw_sound";
const PROFILE_KEY = "studioraw_admin_profile";

const pageTitles = {
  dashboard: "Dashboard",
  enquiries: "Enquiries & Leads",
  leads: "Enquiries & Leads",
  customers: "Customers",
  bookings: "Booking & Calendar",
  "booking-calendar": "Booking & Calendar",
  calendar: "Booking & Calendar",
  "wedding-photography": "Wedding Photography",
  "wedding-videography": "Wedding Videography",
  "functions-we-arrange": "Functions We Arrange",
  "event-management": "Event Management",
  "customized-gifts": "Customized Gifts",
  payments: "Payment & Billing",
  billing: "Payment & Billing",
  preshoot: "Pre-Shoot Preparation",
  photoshoot: "Photo Shoot & Data",
  photoediting: "Photo Selection & Editing",
  albumprinting: "Album Design & Printing",
  deliveries: "Delivery Management",
  delivery: "Delivery Management",
  followup: "Follow-up & CRM",
  inventory: "Inventory Management",
  equipment: "Equipment Management",
  attendance: "Staff Attendance",
  staff: "Staff Management",
  expenses: "Expense & Profit",
  branches: "Multi-Branch Management",
  reports: "Reports & Analytics",
  roles: "Roles & Permissions",
  notifications: "Notifications & Reminders",
  auditlogs: "Audit Logs & Activity",
  settings: "Settings & Staff",
};

const searchPages = [
  ["dashboard", "Dashboard"],
  ["enquiries", "Enquiries & Leads"],
  ["customers", "Customers"],
  ["bookings", "Booking & Calendar"],
  ["wedding-photography", "Wedding Photography"],
  ["wedding-videography", "Wedding Videography"],
  ["functions-we-arrange", "Functions We Arrange"],
  ["event-management", "Event Management"],
  ["customized-gifts", "Customized Gifts"],
  ["payments", "Payment & Billing"],
  ["deliveries", "Delivery Management"],
  ["inventory", "Inventory Management"],
  ["equipment", "Equipment Management"],
  ["expenses", "Expense & Profit"],
  ["staff", "Staff Management"],
  ["branches", "Multi-Branch Management"],
  ["reports", "Reports & Analytics"],
  ["notifications", "Notifications & Reminders"],
  ["settings", "Settings & Staff"],
];

const defaultProfile = {
  name: "Demo Admin",
  role: "Administrator",
  email: "admin@studiorawpicturez.com",
};

function readSetting(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function readProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed && typeof parsed === "object") {
        return { ...defaultProfile, ...parsed };
      }
    }
  } catch {
    // Use default
  }

  return { ...defaultProfile };
}

function getInitials(name) {
  return String(name || "Admin")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function useBeautifulSound() {
  const [soundEnabled, setSoundEnabled] = useState(
    () => readSetting(SOUND_KEY, "true") !== "false"
  );

  const audioRef = useRef(null);

  useEffect(() => {
    const syncSound = () => {
      setSoundEnabled(
        readSetting(SOUND_KEY, "true") !== "false"
      );
    };

    window.addEventListener("storage", syncSound);
    window.addEventListener("studioraw-sound-change", syncSound);

    return () => {
      window.removeEventListener("storage", syncSound);
      window.removeEventListener(
        "studioraw-sound-change",
        syncSound
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.close?.();
    };
  }, []);

  const playSound = (type = "click") => {
    if (!soundEnabled) return;

    if (readSetting(SOUND_KEY, "true") === "false") return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioRef.current) {
        audioRef.current = new AudioContextClass();
      }

      const context = audioRef.current;

      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const sounds = {
        click: [659.25],
        search: [523.25, 659.25],
        profile: [587.33, 783.99],
        notification: [783.99, 987.77],
        save: [523.25, 659.25, 783.99],
        logout: [659.25, 523.25, 392],
        close: [587.33, 493.88],
      };

      const notes = sounds[type] || sounds.click;

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        const start = context.currentTime + index * 0.075;
        const end = start + 0.19;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0.0001, start);

        gain.gain.exponentialRampToValueAtTime(
          0.035,
          start + 0.02
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
      console.warn("Sound unavailable:", error);
    }
  };

  return playSound;
}

/* ==========================================
   EDIT PROFILE MODAL
========================================== */

function EditProfileModal({
  profile,
  onClose,
  onSave,
  playSound,
}) {
  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
    setSuccess(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError("Please enter the admin name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password && form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const result = onSave({
      name,
      email,
      role: profile.role,
    });

    if (result) {
      playSound("save");

      setForm((previous) => ({
        ...previous,
        password: "",
      }));

      setSuccess(true);
      setError("");
    } else {
      setError("Unable to save profile changes.");
    }
  };

  const inputClass =
    "flex min-w-0 items-center gap-3 rounded-2xl border border-[#dce5f2] bg-[#f8fbff] px-4 transition-all duration-300 focus-within:border-[#173d77] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(36,77,139,0.09),0_8px_22px_rgba(16,38,77,0.06)]";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-[#06152b]/65 backdrop-blur-[6px]"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="sr-premium-modal relative flex max-h-[95dvh] w-full max-w-lg flex-col overflow-hidden rounded-[26px] border border-[#dce5f2] bg-white text-[#10264d] shadow-[0_30px_90px_rgba(5,20,45,0.25)]"
      >
        {/* HEADER */}
        <div className="relative overflow-hidden bg-[#10264d] px-5 py-6 text-white sm:px-7">
          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <UserCircle size={27} />
              </div>

              <div>
                <h2
                  id="edit-profile-title"
                  className="text-lg font-extrabold sm:text-xl"
                >
                  Edit Admin Profile
                </h2>

                <p className="mt-1 text-xs text-blue-100">
                  Personalize your workspace details
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound("close");
                onClose();
              }}
              aria-label="Close edit profile"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition-all duration-300 hover:rotate-90 hover:bg-white/20"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#e1e8f3] bg-[#f5f8fd] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10264d] text-sm font-extrabold text-white">
              {getInitials(profile.name)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {profile.name}
              </p>
              <p className="mt-1 text-xs text-[#7185a3]">
                {profile.role}
              </p>
            </div>
          </div>

          <form
            id="edit-profile-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* NAME */}
            <div>
              <label
                htmlFor="admin-name"
                className="mb-2 block text-sm font-bold"
              >
                Admin Name
              </label>

              <div className={inputClass}>
                <User
                  size={18}
                  className="shrink-0 text-[#8195b2]"
                />

                <input
                  id="admin-name"
                  type="text"
                  required
                  maxLength={80}
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  placeholder="Enter admin name"
                  className="w-full min-w-0 bg-transparent py-3.5 text-sm text-[#10264d] outline-none placeholder:text-[#91a0b4]"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-bold"
              >
                Email Address
              </label>

              <div className={inputClass}>
                <Mail
                  size={18}
                  className="shrink-0 text-[#8195b2]"
                />

                <input
                  id="admin-email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    updateForm("email", event.target.value)
                  }
                  placeholder="Enter email address"
                  className="w-full min-w-0 bg-transparent py-3.5 text-sm text-[#10264d] outline-none placeholder:text-[#91a0b4]"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-bold"
              >
                New Password
                <span className="ml-2 text-xs font-normal text-[#91a0b4]">
                  (Optional)
                </span>
              </label>

              <div className={inputClass}>
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-[#8195b2]"
                />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) =>
                    updateForm("password", event.target.value)
                  }
                  placeholder="Enter new password"
                  className="w-full min-w-0 bg-transparent py-3.5 text-sm text-[#10264d] outline-none placeholder:text-[#91a0b4]"
                />

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setShowPassword((previous) => !previous);
                  }}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="shrink-0 text-[#8195b2] transition hover:text-[#10264d]"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Demo interface only. Changing this field does not
                update your actual login password.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#173d77]"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                Profile name and email saved successfully.
              </div>
            )}
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#e3eaf4] bg-[#fbfcff] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={() => {
              playSound("close");
              onClose();
            }}
            className="rounded-xl border border-[#dce5f2] bg-white px-5 py-3 text-sm font-bold text-[#10264d] transition hover:bg-[#f0f4fa]"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-profile-form"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#244d8b] hover:shadow-[0_10px_24px_rgba(16,38,77,0.2)]"
          >
            <CheckCircle2 size={17} />
            Save Changes
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

/* ==========================================
   MAIN HEADER
========================================== */

export default function Header({
  activePage = "dashboard",
  setSidebarOpen,
  onMenuClick,
  onLogout,
  onNavigate,
}) {
  const playSound = useBeautifulSound();

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(readProfile);

  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const title = pageTitles[activePage] || "Dashboard";

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return searchPages.filter(([key, label]) =>
      `${key} ${label}`.toLowerCase().includes(query)
    );
  }, [search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setSearchOpen(false);
    setSearch("");
  }, [activePage]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  const openSidebar = () => {
    playSound("click");
    setProfileOpen(false);
    setSearchOpen(false);

    if (typeof onMenuClick === "function") {
      onMenuClick();
    } else {
      setSidebarOpen?.(true);
    }
  };

  const navigateTo = (page) => {
    playSound(
      page === "notifications"
        ? "notification"
        : "search"
    );

    setSearch("");
    setSearchOpen(false);
    setProfileOpen(false);

    onNavigate?.(page);
  };

  const handleLogout = () => {
    playSound("logout");
    setProfileOpen(false);
    setSearchOpen(false);
    onLogout?.();
  };

  const openEditProfile = () => {
    playSound("profile");
    setProfileOpen(false);
    setEditOpen(true);
  };

  const saveProfile = (updatedProfile) => {
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(updatedProfile)
      );

      setProfile(updatedProfile);
      return true;
    } catch {
      return false;
    }
  };

  const SearchResults = ({ mobile = false }) => {
    if (!search.trim()) return null;

    return (
      <div
        className={`sr-search-results overflow-hidden rounded-2xl border border-[#dce5f2] bg-white shadow-[0_20px_55px_rgba(16,38,77,0.16)] ${
          mobile ? "mt-3" : "absolute left-0 right-0 top-full z-50 mt-3"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e8edf5] bg-[#f8fbff] px-4 py-3">
          <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#627895]">
            <Sparkles size={13} className="text-[#315b99]" />
            Workspace Pages
          </span>

          <span className="rounded-lg bg-[#eaf1fc] px-2 py-1 text-[10px] font-bold text-[#315b99]">
            {filteredPages.length} found
          </span>
        </div>

        {filteredPages.length > 0 ? (
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredPages.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => navigateTo(key)}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-3 text-left text-sm font-semibold text-[#10264d] transition-all duration-200 hover:translate-x-1 hover:border-[#dce7f8] hover:bg-[#eef5ff]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf3fc] text-[#315b99] transition group-hover:bg-[#dceaff]">
                    <Search size={15} />
                  </span>

                  <span className="truncate">{label}</span>
                </span>

                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-[#91a0b4] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#173d77]"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <Search
              size={24}
              className="mx-auto mb-3 text-[#9aacbf]"
            />

            <p className="text-sm font-semibold text-[#10264d]">
              No matching pages
            </p>

            <p className="mt-1 text-xs text-[#91a0b4]">
              Try searching with another keyword.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes srHeaderEnter {
          from {
            opacity: 0;
            transform: translateY(-14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes srTitleEnter {
          from {
            opacity: 0;
            transform: translateY(9px);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes srSearchEnter {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes srBellRing {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(12deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(7deg); }
          60% { transform: rotate(-4deg); }
        }

        @keyframes srPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(49,91,153,0.25);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(49,91,153,0);
          }
        }

        @keyframes srShimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }

        .sr-premium-header {
          animation: srHeaderEnter 0.55s ease-out both;
        }

        .sr-premium-title {
          animation: srTitleEnter 0.45s ease-out both;
        }

        .sr-search-results,
        .sr-premium-dropdown {
          animation: srSearchEnter 0.25s ease-out both;
        }

        .sr-premium-modal {
          animation: srSearchEnter 0.35s
            cubic-bezier(0.22,1,0.36,1) both;
        }

        .sr-premium-control {
          transition:
            transform 0.25s ease,
            background-color 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .sr-premium-control:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 18px rgba(16,38,77,0.09);
        }

        .sr-premium-control:active {
          transform: scale(0.95);
        }

        .sr-premium-search {
          transition:
            border-color 0.35s ease,
            background-color 0.35s ease,
            box-shadow 0.35s ease,
            transform 0.35s ease;
        }

        .sr-premium-search:focus-within {
          border-color: #173d77;
          background: #fff;
          box-shadow:
            0 0 0 4px rgba(36,77,139,0.09),
            0 9px 28px rgba(16,38,77,0.09);
          transform: translateY(-1px);
        }

        .sr-premium-search:focus-within .sr-search-icon {
          color: #173d77;
          transform: scale(1.12);
        }

        .sr-search-icon {
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .sr-premium-bell:hover svg {
          animation: srBellRing 0.65s ease-in-out;
          transform-origin: top center;
        }

        .sr-premium-dot {
          animation: srPulse 2.5s infinite;
        }

        .sr-header-shimmer {
          animation: srShimmer 5s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sr-premium-header,
          .sr-premium-title,
          .sr-search-results,
          .sr-premium-dropdown,
          .sr-premium-modal,
          .sr-premium-dot,
          .sr-header-shimmer {
            animation: none !important;
          }

          .sr-premium-control,
          .sr-premium-search {
            transition: none !important;
          }
        }
      `}</style>

      <header className="sr-premium-header sticky top-0 z-30 w-full min-w-0 border-b border-[#e2e9f3] bg-white/95 text-[#10264d] shadow-[0_4px_25px_rgba(16,38,77,0.055)] backdrop-blur-xl">

        {/* ANIMATED TOP LINE */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-[#e8f0fc]">
          <div className="sr-header-shimmer h-full w-1/2 bg-gradient-to-r from-transparent via-[#244d8b] to-transparent" />
        </div>

        {/* HEADER CONTENT */}
        <div className="flex h-[70px] w-full min-w-0 items-center justify-between gap-2 px-3 sm:h-[78px] sm:px-5 lg:h-[84px] lg:px-7 xl:px-9">

          {/* LEFT */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Open sidebar"
              className="sr-premium-control flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce5f2] bg-white text-[#10264d] lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="mb-1 hidden items-center gap-1.5 text-[10px] font-semibold tracking-[0.04em] text-[#8b9bb3] sm:flex">
                <Camera size={12} />
                <span>Studio Management</span>
                <ChevronRight size={12} />
                <span>Workspace</span>
              </div>

              <h1
                key={activePage}
                className="sr-premium-title truncate text-sm font-extrabold tracking-[-0.035em] text-[#10264d] min-[390px]:text-base sm:text-xl lg:text-2xl xl:text-[26px]"
              >
                {title}
              </h1>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">

            {/* PREMIUM DESKTOP SEARCH */}
            <div
              ref={searchRef}
              className="relative hidden xl:block"
            >
              <div className="sr-premium-search group flex h-12 w-[225px] items-center gap-3 rounded-2xl border border-[#dce5f2] bg-[#f8fbff] px-3.5 2xl:w-[300px]">
                <Search
                  size={19}
                  className="sr-search-icon shrink-0 text-[#8195b2]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search workspace..."
                  aria-label="Search workspace pages"
                  className="w-full min-w-0 flex-1 bg-transparent text-sm font-medium text-[#10264d] outline-none placeholder:text-[#91a0b4]"
                />

                {search ? (
                  <button
                    type="button"
                    onClick={() => {
                      playSound("close");
                      setSearch("");
                    }}
                    aria-label="Clear search"
                    className="text-[#8195b2] transition hover:text-[#10264d]"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <span className="flex h-6 shrink-0 items-center gap-0.5 rounded-md border border-[#e1e8f2] bg-white px-1.5 text-[10px] font-bold text-[#8195b2]">
                    <Command size={11} /> K
                  </span>
                )}
              </div>

              {search.trim() && <SearchResults />}
            </div>

            {/* BRANCH */}
            <div className="hidden h-11 items-center gap-2 rounded-2xl border border-[#e1e8f2] bg-[#f8fbff] px-3 2xl:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f0fb] text-[#244d8b]">
                <Building2 size={15} />
              </span>

              <span className="text-xs font-bold text-[#344c6d]">
                Main Branch
              </span>
            </div>

            {/* MOBILE SEARCH */}
            <button
              type="button"
              onClick={() => {
                playSound("search");
                setProfileOpen(false);
                setSearchOpen((previous) => !previous);
              }}
              aria-label={
                searchOpen ? "Close search" : "Open search"
              }
              aria-expanded={searchOpen}
              className="sr-premium-control flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce5f2] bg-[#f8fbff] text-[#10264d] sm:h-11 sm:w-11 xl:hidden"
            >
              {searchOpen ? (
                <X size={19} />
              ) : (
                <Search size={19} />
              )}
            </button>

            {/* NOTIFICATIONS */}
            <button
              type="button"
              onClick={() => navigateTo("notifications")}
              aria-label="Open notifications"
              title="Notifications"
              className="sr-premium-control sr-premium-bell relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce5f2] bg-[#f8fbff] text-[#10264d] sm:h-11 sm:w-11"
            >
              <Bell size={19} />

              <span className="sr-premium-dot absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#315b99]" />
            </button>

            {/* DIVIDER */}
            <div className="mx-0.5 hidden h-8 w-px bg-[#e1e8f2] sm:block" />

            {/* PROFILE */}
            <div
              ref={profileRef}
              className="relative shrink-0"
            >
              <button
                type="button"
                onClick={() => {
                  playSound("profile");
                  setSearchOpen(false);
                  setProfileOpen((previous) => !previous);
                }}
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className={`sr-premium-control flex items-center gap-2 rounded-2xl border p-1 transition-all duration-300 ${
                  profileOpen
                    ? "border-[#244d8b] bg-[#eef5ff] shadow-[0_0_0_3px_rgba(36,77,139,0.08)]"
                    : "border-transparent hover:border-[#dce5f2] hover:bg-[#f5f8fd]"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10264d] to-[#315b99] text-xs font-extrabold text-white shadow-[0_5px_14px_rgba(16,38,77,0.18)] sm:h-10 sm:w-10">
                  {getInitials(profile.name)}
                </div>

                <div className="hidden min-w-0 text-left 2xl:block">
                  <p className="max-w-32 truncate text-sm font-extrabold text-[#10264d]">
                    {profile.name}
                  </p>

                  <p className="text-[11px] text-[#8195b2]">
                    {profile.role}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className={`hidden shrink-0 text-[#8195b2] transition-transform duration-300 sm:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div
                  role="menu"
                  className="sr-premium-dropdown absolute right-0 top-full z-50 mt-3 w-64 max-w-[calc(100vw-16px)] overflow-hidden rounded-[20px] border border-[#dce5f2] bg-white shadow-[0_20px_55px_rgba(16,38,77,0.16)]"
                >
                  <div className="relative overflow-hidden bg-[#10264d] p-4 text-white">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-300/15 blur-2xl" />

                    <div className="relative flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-extrabold">
                        {getInitials(profile.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold">
                          {profile.name}
                        </p>

                        <p className="mt-0.5 text-xs text-blue-100">
                          {profile.role}
                        </p>
                      </div>
                    </div>

                    <p className="relative mt-3 truncate border-t border-white/15 pt-3 text-[11px] text-blue-100">
                      {profile.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={openEditProfile}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#10264d] transition-all duration-200 hover:bg-[#eef5ff]"
                    >
                      <Pencil size={17} />
                      Edit Profile

                      <ChevronRight
                        size={15}
                        className="ml-auto transition-transform group-hover:translate-x-1"
                      />
                    </button>

                    <div className="my-1 border-t border-[#e7edf6]" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH PANEL */}
        {searchOpen && (
          <div className="sr-search-results border-t border-[#e7edf6] bg-white px-3 py-4 sm:px-5 xl:hidden">
            <div className="mx-auto max-w-3xl">
              <div className="sr-premium-search flex min-w-0 items-center gap-3 rounded-2xl border border-[#dce5f2] bg-[#f8fbff] px-4">
                <Search
                  size={19}
                  className="sr-search-icon shrink-0 text-[#8195b2]"
                />

                <input
                  ref={searchInputRef}
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search workspace pages..."
                  aria-label="Search workspace pages"
                  className="w-full min-w-0 flex-1 bg-transparent py-3.5 text-sm font-medium text-[#10264d] outline-none placeholder:text-[#91a0b4]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      playSound("close");
                      setSearch("");
                    }}
                    aria-label="Clear search"
                    className="text-[#8195b2]"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <SearchResults mobile />
            </div>
          </div>
        )}
      </header>

      {/* EDIT PROFILE MODAL */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={saveProfile}
          playSound={playSound}
        />
      )}
    </>
  );
}
