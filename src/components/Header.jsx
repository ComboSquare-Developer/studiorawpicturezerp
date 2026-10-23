
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
} from "lucide-react";

const THEME_KEY = "studioraw_theme";
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
    // Use default profile.
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

function useTheme() {
  const [theme, setTheme] = useState(() =>
    readSetting(THEME_KEY, "dark")
  );

  useEffect(() => {
    const handleThemeChange = (event) => {
      const nextTheme = event.detail?.theme;

      if (nextTheme === "dark" || nextTheme === "light") {
        setTheme(nextTheme);
      }
    };

    const handleStorage = (event) => {
      if (event.key === THEME_KEY) {
        setTheme(event.newValue || "dark");
      }
    };

    window.addEventListener(
      "studioraw-theme-change",
      handleThemeChange
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "studioraw-theme-change",
        handleThemeChange
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return theme;
}

function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(() =>
    readSetting(SOUND_KEY, "true") !== "false"
  );

  useEffect(() => {
    const syncSound = () => {
      setSoundEnabled(
        readSetting(SOUND_KEY, "true") !== "false"
      );
    };

    const handleStorage = (event) => {
      if (event.key === SOUND_KEY) syncSound();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("studioraw-sound-change", syncSound);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "studioraw-sound-change",
        syncSound
      );
    };
  }, []);

  return soundEnabled;
}

function useBeautifulSound() {
  const soundEnabled = useSound();
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.close().catch(() => {});
      }
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

      const soundNotes = {
        click: [659.25],
        search: [523.25, 659.25],
        profile: [587.33, 783.99],
        notification: [783.99, 987.77],
        save: [523.25, 659.25, 783.99],
        logout: [659.25, 523.25, 392],
        close: [587.33, 493.88],
      };

      const notes = soundNotes[type] || soundNotes.click;

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
  theme,
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

  const isDark = theme === "dark";

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
    setForm((previous) => ({ ...previous, [key]: value }));
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
      setForm((previous) => ({ ...previous, password: "" }));
      setSuccess(true);
      setError("");
    } else {
      setError("Unable to save profile changes.");
    }
  };

  const labelClass = isDark
    ? "text-white"
    : "text-[#10264d]";

  const inputWrapperClass = isDark
    ? "border-[#375477] bg-[#10264d]"
    : "border-[#dce5f2] bg-white";

  const inputClass = isDark
    ? "text-white placeholder:text-[#8fa9cb]"
    : "text-[#10264d] placeholder:text-[#8c9bb0]";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-[#06152b]/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className={`sr-modal-enter relative flex max-h-[95dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl sm:rounded-3xl ${
          isDark
            ? "border-[#375477] bg-[#132746] text-white"
            : "border-[#dce5f2] bg-white text-[#10264d]"
        }`}
      >
        {/* MODAL HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-[#10264d] px-4 py-5 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <UserCircle size={27} />
            </div>

            <div className="min-w-0">
              <h2
                id="edit-profile-title"
                className="text-lg font-extrabold sm:text-xl"
              >
                Edit Admin Profile
              </h2>
              <p className="mt-1 text-xs text-blue-100">
                Update administrator details
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
            className="sr-header-control flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={19} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div
            className={`mb-5 flex items-center gap-3 rounded-xl border p-4 ${
              isDark
                ? "border-[#375477] bg-[#10264d]"
                : "border-[#dce5f2] bg-[#f5f8fd]"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#244d8b] text-sm font-extrabold text-white">
              {getInitials(profile.name)}
            </div>

            <div className="min-w-0">
              <p className={`truncate text-sm font-bold ${labelClass}`}>
                {profile.name}
              </p>
              <p
                className={`mt-1 truncate text-xs ${
                  isDark ? "text-[#b7cbe6]" : "text-[#7185a3]"
                }`}
              >
                {profile.role}
              </p>
            </div>
          </div>

          <form
            id="edit-profile-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="admin-name"
                className={`mb-2 block text-sm font-bold ${labelClass}`}
              >
                Admin Name
              </label>

              <div
                className={`flex min-w-0 items-center gap-3 rounded-xl border px-3.5 transition focus-within:border-[#5c86c5] focus-within:ring-2 focus-within:ring-blue-400/20 ${inputWrapperClass}`}
              >
                <User size={18} className="shrink-0 text-[#8fa9cb]" />
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
                  className={`w-full min-w-0 bg-transparent py-3.5 text-sm outline-none ${inputClass}`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-email"
                className={`mb-2 block text-sm font-bold ${labelClass}`}
              >
                Email Address
              </label>

              <div
                className={`flex min-w-0 items-center gap-3 rounded-xl border px-3.5 transition focus-within:border-[#5c86c5] focus-within:ring-2 focus-within:ring-blue-400/20 ${inputWrapperClass}`}
              >
                <Mail size={18} className="shrink-0 text-[#8fa9cb]" />
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
                  className={`w-full min-w-0 bg-transparent py-3.5 text-sm outline-none ${inputClass}`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className={`mb-2 block text-sm font-bold ${labelClass}`}
              >
                New Password
                <span className="ml-2 text-xs font-normal opacity-60">
                  (Optional)
                </span>
              </label>

              <div
                className={`flex min-w-0 items-center gap-3 rounded-xl border px-3.5 transition focus-within:border-[#5c86c5] focus-within:ring-2 focus-within:ring-blue-400/20 ${inputWrapperClass}`}
              >
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-[#8fa9cb]"
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
                  className={`w-full min-w-0 bg-transparent py-3.5 text-sm outline-none ${inputClass}`}
                />

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setShowPassword((previous) => !previous);
                  }}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="shrink-0 text-[#8fa9cb] transition hover:text-blue-400"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p
                className={`mt-2 text-xs leading-5 ${
                  isDark ? "text-[#b7cbe6]" : "text-slate-500"
                }`}
              >
                Demo interface only. Changing this field does not
                update your actual login password.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#173d77]"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                Profile name and email saved successfully.
              </div>
            )}
          </form>
        </div>

        {/* MODAL FOOTER */}
        <div
          className={`flex shrink-0 flex-col-reverse gap-2 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-6 ${
            isDark
              ? "border-[#375477] bg-[#132746]"
              : "border-[#e3eaf4] bg-white"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              playSound("close");
              onClose();
            }}
            className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${
              isDark
                ? "border-[#375477] text-white hover:bg-white/10"
                : "border-[#dce5f2] bg-white text-[#10264d] hover:bg-[#f0f4fa]"
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-profile-form"
            className="sr-header-control flex items-center justify-center gap-2 rounded-xl bg-[#244d8b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#315b99]"
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
  const theme = useTheme();
  const playSound = useBeautifulSound();
  const isDark = theme === "dark";

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
      document.removeEventListener("pointerdown", handleOutsideClick);
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
      page === "notifications" ? "notification" : "search"
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

  const SearchResults = () => {
    if (!search.trim()) return null;

    return (
      <div
        className={`sr-dropdown-enter mt-2 overflow-hidden rounded-xl border shadow-lg ${
          isDark
            ? "border-[#375477] bg-[#132746]"
            : "border-[#dce5f2] bg-white"
        }`}
      >
        <div
          className={`border-b px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${
            isDark
              ? "border-[#375477] bg-[#10264d] text-[#b7cbe6]"
              : "border-[#e7edf6] bg-[#f5f8fd] text-[#526b90]"
          }`}
        >
          Workspace Pages
        </div>

        {filteredPages.length > 0 ? (
          <div className="max-h-60 overflow-y-auto p-1.5">
            {filteredPages.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => navigateTo(key)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isDark
                    ? "text-white hover:bg-white/10"
                    : "text-[#10264d] hover:bg-[#eaf1fc]"
                }`}
              >
                <span className="truncate">{label}</span>
                <ChevronRight
                  size={16}
                  className={
                    isDark
                      ? "shrink-0 text-[#b7cbe6]"
                      : "shrink-0 text-[#7185a3]"
                  }
                />
              </button>
            ))}
          </div>
        ) : (
          <div
            className={`px-4 py-5 text-center text-sm ${
              isDark ? "text-[#b7cbe6]" : "text-slate-500"
            }`}
          >
            No matching workspace pages.
          </div>
        )}
      </div>
    );
  };

  const headerClass = isDark
    ? "border-[#284267] bg-[#10264d]/95 text-white"
    : "border-[#dce5f2] bg-white/95 text-[#10264d]";

  const controlClass = isDark
    ? "border-[#375477] bg-[#18345a] text-white hover:bg-[#244d8b]"
    : "border-[#dce5f2] bg-white text-[#10264d] hover:bg-[#eaf1fc]";

  const mutedClass = isDark
    ? "text-[#b7cbe6]"
    : "text-[#7185a3]";

  return (
    <>
      <header
        className={`sr-header-animated sticky top-0 z-30 w-full min-w-0 border-b shadow-[0_3px_20px_rgba(16,38,77,0.06)] backdrop-blur-xl transition-colors duration-300 ${headerClass}`}
      >
        {/* SUBTLE TOP GRADIENT */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 opacity-80" />

        {/* MAIN HEADER */}
        <div className="flex h-[68px] w-full min-w-0 items-center justify-between gap-2 px-3 sm:h-[76px] sm:px-5 lg:h-[84px] lg:px-7 xl:px-9">
          {/* LEFT */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Open sidebar"
              className={`sr-header-control flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition lg:hidden ${controlClass}`}
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 flex-1">
              <div
                className={`mb-1 hidden items-center gap-1.5 text-[11px] font-medium sm:flex ${mutedClass}`}
              >
                <span>Studio Management</span>
                <ChevronRight size={12} />
                <span>Workspace</span>
              </div>

              <h1
                key={activePage}
                className={`sr-header-title truncate text-sm font-extrabold tracking-tight min-[390px]:text-base sm:text-xl lg:text-2xl xl:text-[26px] ${
                  isDark ? "text-white" : "text-[#10264d]"
                }`}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
            {/* DESKTOP SEARCH */}
            <div ref={searchRef} className="relative hidden xl:block">
              <div
                className={`sr-search-box flex h-11 w-[210px] items-center gap-2 rounded-xl border px-3 transition focus-within:border-[#5c86c5] 2xl:w-[280px] ${controlClass}`}
              >
                <Search
                  size={17}
                  className={`shrink-0 ${mutedClass}`}
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search pages..."
                  aria-label="Search workspace pages"
                  className={`w-full min-w-0 flex-1 bg-transparent text-sm outline-none ${
                    isDark
                      ? "text-white placeholder:text-[#8fa9cb]"
                      : "text-[#10264d] placeholder:text-[#91a0b4]"
                  }`}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      playSound("close");
                      setSearch("");
                    }}
                    aria-label="Clear search"
                    className={mutedClass}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {search.trim() && (
                <div className="absolute left-0 right-0 top-full z-50">
                  <SearchResults />
                </div>
              )}
            </div>

            {/* BRANCH */}
            <div
              className={`hidden h-11 items-center gap-2 rounded-xl border px-3 2xl:flex ${controlClass}`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isDark
                    ? "bg-white/10 text-white"
                    : "bg-[#eaf1fc] text-[#173d77]"
                }`}
              >
                <Building2 size={15} />
              </div>

              <span className="text-xs font-bold">
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
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className={`sr-header-control flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition sm:h-11 sm:w-11 xl:hidden ${controlClass}`}
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>

            {/* NOTIFICATIONS */}
            <button
              type="button"
              onClick={() => navigateTo("notifications")}
              aria-label="Open notifications"
              title="Notifications"
              className={`sr-header-control sr-notification-bell relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition sm:h-11 sm:w-11 ${controlClass}`}
            >
              <Bell size={19} />

              <span className="sr-notification-dot absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#5c86c5]" />
            </button>

            <div
              className={`mx-0.5 hidden h-8 w-px sm:block ${
                isDark ? "bg-[#375477]" : "bg-[#dce5f2]"
              }`}
            />

            {/* PROFILE */}
            <div ref={profileRef} className="relative shrink-0">
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
                className={`sr-header-control flex items-center gap-1.5 rounded-xl border border-transparent p-0.5 transition sm:gap-2 sm:p-1 ${
                  isDark
                    ? "hover:border-[#375477] hover:bg-white/10"
                    : "hover:border-[#dce5f2] hover:bg-[#f5f8fd]"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold sm:h-10 sm:w-10 lg:h-11 lg:w-11 ${
                    isDark
                      ? "bg-white text-[#10264d]"
                      : "bg-[#10264d] text-white"
                  }`}
                >
                  {getInitials(profile.name)}
                </div>

                <div className="hidden min-w-0 text-left 2xl:block">
                  <p
                    className={`max-w-32 truncate text-sm font-bold ${
                      isDark ? "text-white" : "text-[#10264d]"
                    }`}
                  >
                    {profile.name}
                  </p>

                  <p className={`text-[11px] ${mutedClass}`}>
                    {profile.role}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className={`hidden shrink-0 transition-transform duration-300 sm:block ${
                    profileOpen ? "rotate-180" : ""
                  } ${mutedClass}`}
                />
              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div
                  role="menu"
                  className={`sr-profile-menu absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-16px)] overflow-hidden rounded-2xl border shadow-[0_20px_55px_rgba(16,38,77,0.18)] ${
                    isDark
                      ? "border-[#375477] bg-[#132746]"
                      : "border-[#dce5f2] bg-white"
                  }`}
                >
                  <div className="bg-[#10264d] p-4 text-white">
                    <div className="flex items-center gap-3">
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

                    <p className="mt-3 truncate border-t border-white/15 pt-3 text-[11px] text-blue-100">
                      {profile.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={openEditProfile}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                        isDark
                          ? "text-white hover:bg-white/10"
                          : "text-[#10264d] hover:bg-[#eaf1fc]"
                      }`}
                    >
                      <Pencil size={17} />
                      Edit Profile
                      <ChevronRight size={15} className="ml-auto" />
                    </button>

                    <div
                      className={`my-1 border-t ${
                        isDark
                          ? "border-[#375477]"
                          : "border-[#e7edf6]"
                      }`}
                    />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10"
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
          <div
            className={`sr-dropdown-enter border-t px-3 py-3 sm:px-5 xl:hidden ${
              isDark
                ? "border-[#375477] bg-[#10264d]"
                : "border-[#e7edf6] bg-white"
            }`}
          >
            <div className="mx-auto max-w-3xl">
              <div
                className={`sr-search-box flex min-w-0 items-center gap-2 rounded-xl border px-3 ${controlClass}`}
              >
                <Search
                  size={18}
                  className={`shrink-0 ${mutedClass}`}
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
                  className={`w-full min-w-0 flex-1 bg-transparent py-3 text-sm outline-none ${
                    isDark
                      ? "text-white placeholder:text-[#8fa9cb]"
                      : "text-[#10264d] placeholder:text-[#91a0b4]"
                  }`}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      playSound("close");
                      setSearch("");
                    }}
                    aria-label="Clear search"
                    className={mutedClass}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <SearchResults />
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
          theme={theme}
          playSound={playSound}
        />
      )}
    </>
  );
}
