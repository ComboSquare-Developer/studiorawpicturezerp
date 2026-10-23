
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Plus,
  Search,
  X,
  MapPin,
  UserRound,
  Camera,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Clock3,
  CalendarCheck2,
  CheckCircle2,
  Save,
  Phone,
  Package,
  Filter,
} from "lucide-react";

const STORAGE_KEY = "studioraw_bookings";
const DEMO_SEED_KEY = "studioraw_bookings_demo_20_v1";
const SOUND_KEY = "studioraw_dashboard_sound";

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateKey(date);
};

const events = [
  "Wedding Photography",
  "Traditional photography",
  "candid photography",
  "helicom photography",
  "Pre-Wedding photography",
  "Post wedding photography",
  "Custom Package",
  "Wedding Videpgraphy",
  "Function me arrange",
  "Eventt Managemnet",
  "Customized Gifts",
  "Pre-Wedding /OutDoor Shoot",
  "Bady/Kids Shoot",
  "Complete Wedding Package"
];

const statuses = [
  "Confirmed",
  "Pending",
  "Completed",
  "Cancelled",
];

const photographers = [
  "Rahul",
  "Karthik",
  "Arun",
  "Vignesh",
  "Sanjay",
  "Priya",
  "Divya",
  "Not Assigned",
];

const packages = [
  "Basic Photography",
  "Standard Photography",
  "Premium Wedding",
  "Wedding Photography & Videography",
  "Engagement Package",
  "Birthday Photography",
  "Pre-Wedding Shoot",
  "Baby Shoot Package",
  "Corporate Event Package",
  "Custom Package",
];

const locations = [
  "Nagercoil",
  "Marthandam",
  "Kanyakumari",
  "Chennai",
  "Tirunelveli",
  "Trivandrum",
  "Madurai",
  "Coimbatore",
  "Other",
];

const demoNames = [
  "Arun Kumar",
  "Priya",
  "Vijay",
  "Divya",
  "Karthik Raj",
  "Meena Devi",
  "Sanjay Kumar",
  "Nithya",
  "Rahul S",
  "Keerthana",
  "Ajay Kumar",
  "Harini",
  "Dinesh Raj",
  "Swetha",
  "Praveen",
  "Aishwarya",
  "Vignesh",
  "Ramya",
  "Naveen Kumar",
  "Abinaya",
];

const dummyBookings = Array.from({ length: 20 }, (_, index) => ({
  id: `BOOK-DEMO-${String(index + 1).padStart(3, "0")}`,
  customer: demoNames[index],
  phone: String(9876543210 - index * 137),
  event: events[index % (events.length - 1)],
  date: addDays(index * 2 - 8),
  time: [
    "09:00",
    "10:00",
    "11:30",
    "14:00",
    "16:00",
    "17:30",
  ][index % 6],
  location: locations[index % (locations.length - 1)],
  photographer: photographers[index % photographers.length],
  package: packages[index % packages.length],
  status: statuses[index % statuses.length],
  createdAt: addDays(-index - 1),
}));

const emptyForm = {
  customer: "",
  phone: "",
  event: "Wedding",
  date: "",
  time: "10:00",
  location: "Nagercoil",
  photographer: "Not Assigned",
  package: "Basic Photography",
  status: "Confirmed",
};

const statusStyle = {
  Confirmed: "border-blue-100 bg-blue-50 text-blue-700",
  Pending: "border-amber-100 bg-amber-50 text-amber-700",
  Completed: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Cancelled: "border-rose-100 bg-rose-50 text-rose-700",
};

const inputClass =
  "block h-11 w-full min-w-0 rounded-xl border border-[#dce4ef] bg-white px-3.5 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const [hours, minutes] = String(value).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
    "en-IN",
    { hour: "2-digit", minute: "2-digit", hour12: true }
  );
};

function loadBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const existing = Array.isArray(parsed) ? parsed : [];

    if (localStorage.getItem(DEMO_SEED_KEY) === "true") {
      return existing;
    }

    const existingIds = new Set(existing.map((item) => item.id));

    const newDemo = dummyBookings.filter(
      (item) => !existingIds.has(item.id)
    );

    const merged = [...existing, ...newDemo];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    localStorage.setItem(DEMO_SEED_KEY, "true");

    return merged;
  } catch {
    return dummyBookings;
  }
}

let audioContext;

function playSound(type = "click") {
  try {
    if (localStorage.getItem(SOUND_KEY) !== "true") return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) audioContext = new AudioContextClass();

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    const notes = {
      click: [440],
      open: [440, 587],
      save: [523, 659, 784],
      delete: [330, 220],
      select: [560],
      error: [240, 200],
      close: [440, 330],
    };

    (notes[type] || notes.click).forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = audioContext.currentTime + index * 0.075;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.025, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.16);
    });
  } catch {
    // Audio is optional.
  }
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const positionMenu = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const availableBelow = window.innerHeight - rect.bottom;
      const menuHeight = Math.min(options.length * 43 + 12, 230);
      const showAbove =
        availableBelow < menuHeight + 12 && rect.top > availableBelow;

      setMenuStyle({
        position: "fixed",
        left: Math.max(8, rect.left),
        width: Math.min(rect.width, window.innerWidth - 16),
        top: showAbove
          ? Math.max(8, rect.top - menuHeight - 5)
          : rect.bottom + 5,
        maxHeight: Math.min(
          230,
          showAbove ? rect.top - 16 : window.innerHeight - rect.bottom - 16
        ),
        zIndex: 9999,
      });
    };

    const handleOutside = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    positionMenu();

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open, options.length]);

  return (
    <div className="relative w-full min-w-0">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          playSound("click");
          setOpen((previous) => !previous);
        }}
        className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#dce4ef] bg-white px-3.5 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={menuStyle}
            className="overflow-y-auto overscroll-contain rounded-xl border border-[#dce4ef] bg-white p-1 shadow-[0_15px_45px_rgba(16,38,77,0.2)]"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  playSound("select");
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  value === option
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">{option}</span>
                {value === option && <Check size={15} />}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-[#344767]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function FormSectionTitle({ icon: Icon, title }) {
  return (
    <div className="col-span-full flex items-center gap-2.5 border-b border-[#edf1f6] pb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3fc] text-[#17477e]">
        <Icon size={17} />
      </div>
      <h4 className="text-sm font-bold text-[#10264d]">{title}</h4>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        statusStyle[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "—"}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#e5ebf3] bg-white p-4 shadow-sm sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">
          {title}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-[#10264d] sm:text-3xl">
          {value}
        </h2>
      </div>
      <div className={`shrink-0 rounded-xl p-3 ${color}`}>
        <Icon size={21} />
      </div>
    </div>
  );
}

function MobileDetail({ label, value, fullWidth = false }) {
  return (
    <div className={`min-w-0 ${fullWidth ? "col-span-2" : ""}`}>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

export default function BookingCalendar() {
  const [bookings, setBookings] = useState(loadBookings);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem(SOUND_KEY) === "true"
  );

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    const syncSound = (event) => {
      if (event.key === SOUND_KEY) {
        setSoundEnabled(event.newValue === "true");
      }
    };

    window.addEventListener("storage", syncSound);
    return () => window.removeEventListener("storage", syncSound);
  }, []);

  useEffect(() => {
    if (!showForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => firstInputRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setEditingId(null);
        setError("");
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [showForm]);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (error) setError("");
  };

  const openBooking = (date = "") => {
    previousFocusRef.current = document.activeElement;
    setEditingId(null);
    setForm({ ...emptyForm, date });
    setError("");
    setShowForm(true);
    playSound("open");
  };

  const editBooking = (booking) => {
    previousFocusRef.current = document.activeElement;
    setEditingId(booking.id);
    setForm({ ...emptyForm, ...booking });
    setError("");
    setShowForm(true);
    playSound("open");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    playSound("close");
  };

  const saveBooking = (event) => {
    event.preventDefault();

    const customer = String(form.customer || "").trim();
    const phone = String(form.phone || "").trim();

    if (!customer || !/^\d{10}$/.test(phone)) {
      setError("Enter customer name and valid 10-digit phone number.");
      playSound("error");
      return;
    }

    if (!form.date || !form.time) {
      setError("Please select booking date and time.");
      playSound("error");
      return;
    }

    if (editingId) {
      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === editingId
            ? { ...booking, ...form, customer, phone }
            : booking
        )
      );
    } else {
      const booking = {
        ...form,
        id: globalThis.crypto?.randomUUID?.() || `BOOK-${Date.now()}`,
        customer,
        phone,
        createdAt: dateKey(new Date()),
      };

      setBookings((previous) => [booking, ...previous]);
    }

    playSound("save");
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const deleteBooking = (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    setBookings((previous) => previous.filter((booking) => booking.id !== id));

    if (editingId === id) closeForm();
    playSound("delete");
  };

  const changeStatus = (id, status) => {
    setBookings((previous) =>
      previous.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
    playSound("select");
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    localStorage.setItem(SOUND_KEY, String(next));
    setSoundEnabled(next);
    if (next) playSound("save");
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return bookings.filter((booking) => {
      const matchesSearch = [
        booking.customer,
        booking.phone,
        booking.event,
        booking.photographer,
        booking.location,
        booking.id,
        booking.package,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return matchesSearch && (filter === "All" || booking.status === filter);
    });
  }, [bookings, search, filter]);

  const upcoming = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            String(booking.date || "") >= dateKey(new Date()) &&
            !["Cancelled", "Completed"].includes(booking.status)
        )
        .sort(
          (a, b) =>
            String(a.date || "").localeCompare(String(b.date || "")) ||
            String(a.time || "").localeCompare(String(b.time || ""))
        )
        .slice(0, 6),
    [bookings]
  );

  const monthBookings = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      const key = String(booking.date || "").slice(0, 10);
      if (!key) return;

      if (!map.has(key)) map.set(key, []);
      map.get(key).push(booking);
    });

    return map;
  }, [bookings]);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const totalDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const cells = [
    ...Array(firstDay.getDay()).fill(null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];

  const changeMonth = (offset) => {
    playSound("click");
    setMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + offset, 1)
    );
  };

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Confirmed",
      value: bookings.filter((b) => b.status === "Confirmed").length,
      icon: CalendarCheck2,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "Pending",
      value: bookings.filter((b) => b.status === "Pending").length,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Completed",
      value: bookings.filter((b) => b.status === "Completed").length,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-5 overflow-x-hidden bg-[#f5f7fb] px-3 py-5 text-slate-800 sm:space-y-6 sm:px-6 lg:space-y-7 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#7e93af]">
            Photography Operations
          </p>
          <h1 className="text-2xl font-extrabold text-[#10264d] sm:text-3xl">
            Booking & Calendar
          </h1>
          <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
            Manage photography bookings, schedules and assignments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openBooking()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#1c4277] sm:flex-none sm:text-sm"
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* CALENDAR + UPCOMING */}
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
        <section className="min-w-0 rounded-2xl border border-[#e5ebf3] bg-white p-3 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#10264d] sm:text-lg">
              <CalendarDays size={18} />
              {month.toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-blue-50"
                aria-label="Previous month"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setMonth(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    )
                  );
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#10264d] hover:bg-blue-50"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-blue-50"
                aria-label="Next month"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="min-w-0 py-2 text-center text-[10px] font-bold text-slate-500 sm:text-xs"
              >
                {day}
              </div>
            ))}

            {cells.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />;

              const date = dateKey(
                new Date(month.getFullYear(), month.getMonth(), day)
              );

              const dayBookings = monthBookings.get(date) || [];
              const isToday = date === dateKey(new Date());

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => openBooking(date)}
                  aria-label={`Add booking for ${date}`}
                  className={`flex min-h-[52px] min-w-0 flex-col items-start overflow-hidden rounded-lg border p-1 text-left transition hover:border-blue-400 hover:bg-blue-50 sm:min-h-[72px] sm:p-2 lg:min-h-[82px] ${
                    isToday
                      ? "border-blue-400 bg-blue-50"
                      : "border-[#edf1f6] bg-white"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold sm:h-6 sm:w-6 sm:text-xs ${
                      isToday
                        ? "bg-[#102f62] text-white"
                        : "text-slate-600"
                    }`}
                  >
                    {day}
                  </span>

                  {dayBookings.length > 0 && (
                    <div className="mt-1 w-full min-w-0">
                      <span className="inline-block rounded bg-[#eaf1fc] px-1 text-[9px] font-bold text-[#315f9a]">
                        {dayBookings.length}
                      </span>

                      <p className="mt-1 hidden w-full truncate rounded bg-[#eaf1fc] px-1 py-0.5 text-[10px] font-medium text-[#315f9a] sm:block">
                        {dayBookings[0].customer}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Select any date to create a booking.
          </p>
        </section>

        <section className="min-w-0 rounded-2xl border border-[#e5ebf3] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Upcoming Shoots
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Next scheduled photography events
              </p>
            </div>

            <span className="rounded-lg bg-[#edf3fc] px-3 py-1.5 text-xs font-bold text-[#315f9a]">
              {upcoming.length}
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-12 text-center">
              <CalendarDays size={30} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">
                No upcoming shoots
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {upcoming.map((booking) => (
                <div
                  key={booking.id}
                  className="min-w-0 rounded-xl border border-[#e9eef6] bg-[#f9fbfe] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#10264d]">
                        {booking.customer}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.event}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={13} />
                      {formatTime(booking.time)}
                    </span>
                  </div>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={13} />
                    {booking.location || "Not specified"}
                  </p>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Camera size={13} />
                    {booking.photographer || "Not Assigned"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* BOOKINGS LIST */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#edf1f6] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#10264d]">
              All Bookings
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {filtered.length} of {bookings.length} bookings
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-[270px]">
              <Search
                size={17}
                className="absolute left-3 top-3.5 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bookings..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-[175px]">
              <Filter size={16} className="shrink-0 text-slate-400 sm:hidden" />
              <CustomDropdown
                value={filter}
                options={["All", ...statuses]}
                onChange={setFilter}
              />
            </div>
          </div>
        </div>

        {/* MOBILE + TABLET CARDS */}
        <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-slate-400">
              No bookings found
            </div>
          ) : (
            filtered.map((booking) => (
              <article
                key={booking.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#edf1f6] bg-[#f8fafd] p-4">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-[#315f9a]">
                      <UserRound size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold text-[#10264d]">
                        {booking.customer}
                      </h3>
                      <p className="mt-1 break-all text-[10px] text-slate-400">
                        {booking.id}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => editBooking(booking)}
                      aria-label="Edit booking"
                      className="rounded-lg bg-blue-50 p-2 text-blue-700"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBooking(booking.id)}
                      aria-label="Delete booking"
                      className="rounded-lg bg-red-50 p-2 text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4">
                  <MobileDetail label="Event" value={booking.event} />
                  <MobileDetail label="Phone" value={booking.phone} />
                  <MobileDetail
                    label="Date"
                    value={formatDate(booking.date)}
                  />
                  <MobileDetail
                    label="Time"
                    value={formatTime(booking.time)}
                  />
                  <MobileDetail label="Location" value={booking.location} />
                  <MobileDetail
                    label="Photographer"
                    value={booking.photographer}
                  />
                  <MobileDetail
                    label="Package"
                    value={booking.package}
                    fullWidth
                  />
                </div>

                <div className="border-t border-[#edf1f6] bg-[#fafcff] p-4">
                  <p className="mb-2 text-xs font-semibold text-[#52627b]">
                    Change Status
                  </p>
                  <CustomDropdown
                    value={booking.status || "Confirmed"}
                    options={statuses}
                    onChange={(value) => changeStatus(booking.id, value)}
                  />
                </div>
              </article>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden w-full overflow-x-auto lg:block">
          <table className="w-full min-w-[950px] border-collapse text-left">
            <thead className="bg-[#f7f9fd]">
              <tr className="text-[11px] font-bold uppercase tracking-wide text-[#8290a5]">
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Event</th>
                <th className="px-4 py-4">Date & Time</th>
                <th className="px-4 py-4">Location</th>
                <th className="px-4 py-4">Photographer</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf1f6]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-sm text-slate-400"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition hover:bg-[#f8faff]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3fc] text-[#315f9a]">
                          <UserRound size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#10264d]">
                            {booking.customer}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {booking.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-[#52627b]">
                      {booking.event}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="text-sm font-medium text-[#52627b]">
                        {formatDate(booking.date)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatTime(booking.time)}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-[#52627b]">
                      {booking.location || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-[#52627b]">
                      {booking.photographer || "Not Assigned"}
                    </td>

                    <td className="min-w-[150px] px-4 py-4">
                      <div className="mb-2">
                        <StatusBadge status={booking.status} />
                      </div>
                      <CustomDropdown
                        value={booking.status || "Confirmed"}
                        options={statuses}
                        onChange={(value) =>
                          changeStatus(booking.id, value)
                        }
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => editBooking(booking)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          aria-label="Edit booking"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBooking(booking.id)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          aria-label="Delete booking"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#edf1f6] px-4 py-4 text-xs text-slate-400 sm:px-5">
          Showing {filtered.length} of {bookings.length} bookings
        </div>
      </section>

      {/* ADD / EDIT FORM */}
      {showForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07172d]/70 p-2 backdrop-blur-[3px] sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
            <section
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-modal-title"
              className="flex max-h-[calc(100dvh-16px)] w-full max-w-[780px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-40px)]"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 bg-[#10264d] px-4 py-4 text-white sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    {editingId ? <Pencil size={19} /> : <CalendarDays size={20} />}
                  </div>

                  <div className="min-w-0">
                    <h3
                      id="booking-modal-title"
                      className="text-base font-bold sm:text-lg"
                    >
                      {editingId ? "Edit Booking" : "Create New Booking"}
                    </h3>
                    <p className="mt-1 text-[11px] text-blue-100">
                      {editingId
                        ? "Update photography booking details"
                        : "Schedule a photography event"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg p-2 hover:bg-white/15"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={saveBooking}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                  {/* CUSTOMER */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormSectionTitle
                      icon={UserRound}
                      title="Customer Information"
                    />

                    <FormField label="Customer Name" required>
                      <div className="relative">
                        <UserRound
                          size={16}
                          className="absolute left-3 top-3.5 text-slate-400"
                        />
                        <input
                          ref={firstInputRef}
                          type="text"
                          required
                          value={form.customer}
                          onChange={(event) =>
                            update("customer", event.target.value)
                          }
                          placeholder="Enter customer name"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </FormField>

                    <FormField label="Phone Number" required>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-3 top-3.5 text-slate-400"
                        />
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          required
                          value={form.phone}
                          onChange={(event) =>
                            update(
                              "phone",
                              event.target.value.replace(/\D/g, "")
                            )
                          }
                          placeholder="10-digit phone number"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </FormField>
                  </div>

                  {/* EVENT */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormSectionTitle
                      icon={CalendarDays}
                      title="Event & Schedule"
                    />

                    <FormField label="Event Type">
                      <CustomDropdown
                        value={form.event}
                        options={events}
                        onChange={(value) => update("event", value)}
                      />
                    </FormField>

                    <FormField label="Booking Date" required>
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(event) =>
                          update("date", event.target.value)
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Booking Time" required>
                      <input
                        type="time"
                        required
                        value={form.time}
                        onChange={(event) =>
                          update("time", event.target.value)
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Location">
                      <CustomDropdown
                        value={form.location}
                        options={locations}
                        onChange={(value) => update("location", value)}
                      />
                    </FormField>
                  </div>

                  {/* ASSIGNMENT */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormSectionTitle
                      icon={Camera}
                      title="Photography Assignment"
                    />

                    <FormField label="Photographer">
                      <CustomDropdown
                        value={form.photographer}
                        options={photographers}
                        onChange={(value) =>
                          update("photographer", value)
                        }
                      />
                    </FormField>

                    <FormField label="Photography Package">
                      <CustomDropdown
                        value={form.package}
                        options={packages}
                        onChange={(value) => update("package", value)}
                      />
                    </FormField>

                    <FormField label="Booking Status">
                      <CustomDropdown
                        value={form.status}
                        options={statuses}
                        onChange={(value) => update("status", value)}
                      />
                    </FormField>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                    >
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e9eef5] bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="w-full rounded-xl border border-[#dce4ef] bg-[#f8fafd] px-6 py-3 text-sm font-semibold text-[#344767] hover:bg-[#eef3f9] sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b467e] sm:w-auto"
                  >
                    <Save size={17} />
                    {editingId ? "Update Booking" : "Save Booking"}
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body
        )}
    </div>
  );
}
