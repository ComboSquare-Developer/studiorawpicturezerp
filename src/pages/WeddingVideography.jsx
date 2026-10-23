
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Video,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  CalendarDays,
  IndianRupee,
  Clock3,
  CheckCircle2,
  Wallet,
  MapPin,
  Phone,
  UserRound,
  Film,
  ChevronDown,
  Check,
  AlertCircle,
  Filter,
} from "lucide-react";

const KEY = "studioraw_wedding_videography";
const DEMO_KEY = "studioraw_videography_demo_30_v1";
const SOUND_KEY = "studioraw_dashboard_sound";

const EVENT_TYPES = [
  "Traditional VideoGraphy",
  "Candid VideoGraphy",
  "Helicam (Drone) Videography",
  "PreWedding VideoGraphy",
  "Post Wedding VideoGraphy",
  "Custom Package",
 
];

const PACKAGES = [
  "Basic Videography",
  "Standard Videography",
  "Premium Videography",
  "Cinematic Package",
  "Traditional Package",
  "Full Wedding Coverage",
  "Custom Package",
];

const STATUSES = [
  "Upcoming",
  "In Progress",
  "Completed",
  "Cancelled",
];

const VENUES = [
  "Nagercoil",
  "Kanyakumari",
  "Marthandam",
  "Chennai",
  "Madurai",
  "Tirunelveli",
  "Trivandrum",
  "Coimbatore",
  "Thoothukudi",
  "Colachel",
  "Thuckalay",
  "Other",
];

const VIDEOGRAPHERS = [
  "Karthik",
  "Rahul",
  "Ajay",
  "Manoj",
  "Vignesh",
  "Arun",
  "Sanjay",
  "Dinesh",
  "Praveen",
  "Ashwin",
  "Not Assigned",
];

const COUPLES = [
  "Arun & Priya",
  "Vijay & Meena",
  "Sanjay & Divya",
  "Ramesh & Anu",
  "Karthik & Keerthana",
  "Rahul & Swetha",
  "Vignesh & Harini",
  "Dinesh & Aishwarya",
  "Ajay & Kavya",
  "Naveen & Ramya",
  "Surya & Abinaya",
  "Aravind & Janani",
  "Bala & Deepika",
  "Ashwin & Pavithra",
  "Gokul & Shalini",
  "Sathish & Monisha",
  "Manoj & Rithika",
  "Hari & Gayathri",
  "Prakash & Sneha",
  "Praveen & Nithya",
  "Akash & Dharshini",
  "Vimal & Revathi",
  "Suresh & Lakshmi",
  "Rohith & Nandhini",
  "Bharath & Yazhini",
  "Krishna & Shreya",
  "Nithin & Pooja",
  "Vasanth & Hema",
  "Ranjith & Sindhu",
  "Abishek & Vaishnavi",
];

const NOTES = [
  "Full wedding cinematic coverage",
  "Reception highlights and family moments",
  "Outdoor couple cinematic shoot",
  "Traditional ceremony coverage",
  "Drone shots and wedding highlights",
  "Full HD video with edited highlights",
  "Candid moments and cinematic teaser",
  "Multi-camera wedding coverage",
  "Couple shoot with slow-motion clips",
  "Complete event documentary",
];

const AMOUNTS = [
  65000, 45000, 25000, 30000, 85000,
  55000, 70000, 42000, 28000, 95000,
  60000, 35000, 75000, 110000, 48000,
  82000, 40000, 58000, 32000, 120000,
  68000, 45000, 90000, 38000, 52000,
  105000, 62000, 44000, 78000, 98000,
];

const dummyBookings = COUPLES.map((customer, index) => {
  const date = new Date(2026, 9, 12 + index * 4);

  const dateString = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  const amount = AMOUNTS[index];

  return {
    id: `VID-DEMO-${String(index + 1).padStart(3, "0")}`,
    customer,
    phone: String(9000020001 + index),
    event: EVENT_TYPES[index % (EVENT_TYPES.length - 1)],
    date: dateString,
    venue: VENUES[index % (VENUES.length - 1)],
    packageName: PACKAGES[index % (PACKAGES.length - 1)],
    videographer: VIDEOGRAPHERS[index % (VIDEOGRAPHERS.length - 1)],
    amount,
    advance:
      index % 6 === 0
        ? amount
        : Math.floor(amount * (0.25 + (index % 4) * 0.1) / 1000) * 1000,
    status: [
      "Upcoming",
      "Upcoming",
      "In Progress",
      "Completed",
      "Upcoming",
    ][index % 5],
    notes: NOTES[index % NOTES.length],
    isDemo: true,
  };
});

const emptyForm = {
  customer: "",
  phone: "",
  event: "Wedding",
  date: "",
  venue: "Nagercoil",
  packageName: "Standard Videography",
  videographer: "Not Assigned",
  amount: "",
  advance: "",
  status: "Upcoming",
  notes: "",
};

const inputClass =
  "block h-11 w-full min-w-0 rounded-xl border border-[#dce4ef] bg-white px-3.5 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

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

function loadBookings() {
  try {
    const saved = localStorage.getItem(KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const existing = Array.isArray(parsed) ? parsed : [];

    if (localStorage.getItem(DEMO_KEY) === "true") {
      return existing;
    }

    const existingIds = new Set(
      existing.map((item) => String(item.id))
    );

    const missing = dummyBookings.filter(
      (item) => !existingIds.has(String(item.id))
    );

    const merged = [...existing, ...missing];

    localStorage.setItem(KEY, JSON.stringify(merged));
    localStorage.setItem(DEMO_KEY, "true");

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

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    const sounds = {
      click: [440],
      open: [440, 587],
      select: [560],
      save: [523, 659, 784],
      delete: [330, 220],
      error: [240, 200],
      close: [440, 330],
    };

    (sounds[type] || sounds.click).forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      const start = audioContext.currentTime + index * 0.075;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.03, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.16);
    });
  } catch {
    // Sound is optional.
  }
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();

      if (!rect) return;

      const desiredHeight = Math.min(options.length * 43 + 12, 230);
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove =
        spaceBelow < desiredHeight + 12 && rect.top > spaceBelow;

      setMenuStyle({
        position: "fixed",
        left: Math.max(8, rect.left),
        width: Math.min(rect.width, window.innerWidth - 16),
        top: showAbove
          ? Math.max(8, rect.top - desiredHeight - 5)
          : rect.bottom + 5,
        maxHeight: Math.max(
          60,
          Math.min(
            230,
            showAbove
              ? rect.top - 16
              : window.innerHeight - rect.bottom - 16
          )
        ),
        zIndex: 10050,
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

    updatePosition();

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);

      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  return (
    <div className="relative w-full min-w-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          playSound("click");
          setOpen((previous) => !previous);
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#dce4ef] bg-white px-3.5 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 transition-transform ${
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
                  onChange(option);
                  setOpen(false);
                  playSound("select");
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  value === option
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

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

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="col-span-full flex items-center gap-2.5 border-b border-[#edf1f6] pb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3fc] text-[#17477e]">
        <Icon size={17} />
      </div>

      <h3 className="text-sm font-bold text-[#10264d]">
        {title}
      </h3>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#e5ebf3] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">
          {title}
        </p>

        <h2 className="mt-2 truncate whitespace-nowrap text-lg font-extrabold text-[#10264d] sm:text-xl xl:text-2xl">
          {value}
        </h2>
      </div>

      <div className={`shrink-0 rounded-xl p-3 ${color}`}>
        <Icon size={21} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Upcoming: "border-blue-100 bg-blue-50 text-blue-700",
    "In Progress": "border-amber-100 bg-amber-50 text-amber-700",
    Completed: "border-emerald-100 bg-emerald-50 text-emerald-700",
    Cancelled: "border-rose-100 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        styles[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "—"}
    </span>
  );
}

function MobileDetail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

export default function WeddingVideography() {
  const [bookings, setBookings] = useState(loadBookings);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem(SOUND_KEY) === "true"
  );

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3000);

    return () => clearTimeout(timer);
  }, [notice]);

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
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => firstInputRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
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
  }, [open]);

  const filteredBookings = useMemo(() => {
    const query = search.toLowerCase().trim();

    return bookings.filter((item) => {
      const matchesSearch = [
        item.customer,
        item.phone,
        item.event,
        item.venue,
        item.videographer,
        item.status,
        item.packageName,
        item.notes,
        item.id,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesEvent =
        eventFilter === "All" || item.event === eventFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [bookings, search, eventFilter, statusFilter]);

  const totalAmount = bookings.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalAdvance = bookings.reduce(
    (sum, item) => sum + Number(item.advance || 0),
    0
  );

  const totalPending = bookings.reduce(
    (sum, item) =>
      sum +
      Math.max(
        0,
        Number(item.amount || 0) - Number(item.advance || 0)
      ),
    0
  );

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: Video,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Upcoming Shoots",
      value: bookings.filter(
        (item) => item.status === "Upcoming"
      ).length,
      icon: CalendarDays,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "Completed Shoots",
      value: bookings.filter(
        (item) => item.status === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Pending Payments",
      value: money(totalPending),
      icon: Wallet,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  const updateForm = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const openAdd = () => {
    previousFocusRef.current = document.activeElement;

    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setOpen(true);

    playSound("open");
  };

  const openEdit = (item) => {
    previousFocusRef.current = document.activeElement;

    setEditingId(item.id);
    setForm({ ...emptyForm, ...item });
    setError("");
    setOpen(true);

    playSound("open");
  };

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");

    playSound("close");
  };

  const saveBooking = (event) => {
    event.preventDefault();

    const customer = String(form.customer || "").trim();
    const phone = String(form.phone || "").trim();

    if (!customer) {
      setError("Please enter customer / couple name.");
      playSound("error");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      playSound("error");
      return;
    }

    if (!form.date) {
      setError("Please select event date.");
      playSound("error");
      return;
    }

    const amount = Number(form.amount || 0);
    const advance = Number(form.advance || 0);

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(advance) ||
      amount < 0 ||
      advance < 0 ||
      advance > amount
    ) {
      setError("Advance amount cannot exceed total amount.");
      playSound("error");
      return;
    }

    const record = {
      ...form,
      id: editingId ?? `VID-${Date.now()}`,
      customer,
      phone,
      amount,
      advance,
      venue: String(form.venue || "").trim(),
      videographer: String(form.videographer || "").trim(),
      notes: String(form.notes || "").trim(),
    };

    if (editingId !== null) {
      setBookings((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );

      setNotice("Videography booking updated successfully.");
    } else {
      setBookings((previous) => [record, ...previous]);

      setNotice("Videography booking added successfully.");
    }

    playSound("save");

    setOpen(false);
    setEditingId(null);
    setError("");
  };

  const deleteBooking = (item) => {
    if (
      !window.confirm(
        `Delete videography booking for ${item.customer}?`
      )
    ) {
      return;
    }

    setBookings((previous) =>
      previous.filter((booking) => booking.id !== item.id)
    );

    setNotice("Videography booking deleted successfully.");
    playSound("delete");
  };

  const changeStatus = (id, status) => {
    setBookings((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
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

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-[#f5f7fb] px-3 py-5 text-slate-800 sm:px-6 lg:space-y-7 lg:px-8 lg:py-8">
      {/* NOTIFICATION */}
      {notice &&
        createPortal(
          <div className="fixed left-3 right-3 top-4 z-[11000] flex items-center gap-3 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm font-medium text-[#10264d] shadow-xl sm:left-auto sm:right-6 sm:max-w-md">
            <CheckCircle2
              size={19}
              className="shrink-0 text-blue-600"
            />

            <span className="min-w-0 flex-1">{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>,
          document.body
        )}

      {/* HEADER */}
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#7e93af]">
            Studio Raw Picturez
          </p>

          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-[#10264d] sm:text-3xl">
            <Video
              size={28}
              className="shrink-0 text-[#315f9a]"
            />
            <span>Wedding Videography</span>
          </h1>

          <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
            Manage videography bookings, shoots, packages and payments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#1b467e] sm:flex-none sm:text-sm"
          >
            <Plus size={18} />
            Add Booking
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* PAYMENT SUMMARY */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">
            Total Package Value
          </p>
          <p className="mt-2 truncate whitespace-nowrap text-lg font-extrabold text-[#10264d] sm:text-xl">
            {money(totalAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">
            Total Advance Collected
          </p>
          <p className="mt-2 truncate whitespace-nowrap text-lg font-extrabold text-[#10264d] sm:text-xl">
            {money(totalAdvance)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5ebf3] bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">
            Remaining Balance
          </p>
          <p className="mt-2 truncate whitespace-nowrap text-lg font-extrabold text-[#10264d] sm:text-xl">
            {money(totalPending)}
          </p>
        </div>
      </div>

      {/* BOOKINGS DIRECTORY */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#edf1f6] p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#10264d]">
              Videography Bookings
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative w-full sm:w-[240px]">
              <Search
                size={17}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search bookings..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="w-full sm:w-[180px]">
              <CustomDropdown
                value={
                  eventFilter === "All"
                    ? "All Events"
                    : eventFilter
                }
                options={["All Events", ...EVENT_TYPES]}
                onChange={(value) =>
                  setEventFilter(
                    value === "All Events" ? "All" : value
                  )
                }
              />
            </div>

            <div className="w-full sm:w-[160px]">
              <CustomDropdown
                value={
                  statusFilter === "All"
                    ? "All Status"
                    : statusFilter
                }
                options={["All Status", ...STATUSES]}
                onChange={(value) =>
                  setStatusFilter(
                    value === "All Status" ? "All" : value
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* MOBILE / TABLET CARDS */}
        <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 xl:hidden">
          {filteredBookings.length === 0 ? (
            <div className="col-span-full py-14 text-center">
              <Video
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-400">
                No videography bookings found.
              </p>
            </div>
          ) : (
            filteredBookings.map((item) => (
              <article
                key={item.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#edf1f6] bg-[#f8fafd] p-4">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-[#315f9a]">
                      <Film size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold text-[#10264d]">
                        {item.customer}
                      </h3>

                      <p className="mt-1 break-all text-[11px] text-slate-400">
                        {item.id}
                      </p>

                      <div className="mt-2">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded-lg bg-blue-50 p-2 text-blue-700"
                      aria-label="Edit booking"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteBooking(item)}
                      className="rounded-lg bg-red-50 p-2 text-red-600"
                      aria-label="Delete booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4">
                  <MobileDetail
                    label="Event Type"
                    value={item.event}
                  />

                  <MobileDetail
                    label="Event Date"
                    value={formatDate(item.date)}
                  />

                  <MobileDetail
                    label="Phone"
                    value={item.phone}
                  />

                  <MobileDetail
                    label="Venue"
                    value={item.venue}
                  />

                  <MobileDetail
                    label="Package"
                    value={item.packageName}
                  />

                  <MobileDetail
                    label="Videographer"
                    value={item.videographer || "Not Assigned"}
                  />

                  <MobileDetail
                    label="Total Amount"
                    value={money(item.amount)}
                  />

                  <MobileDetail
                    label="Advance"
                    value={money(item.advance)}
                  />

                  <div className="col-span-2 rounded-xl bg-[#f1f5fb] p-3">
                    <p className="text-xs font-medium text-slate-500">
                      Remaining Balance
                    </p>

                    <p className="mt-1 text-base font-bold text-[#10264d]">
                      {money(
                        Math.max(
                          0,
                          Number(item.amount || 0) -
                            Number(item.advance || 0)
                        )
                      )}
                    </p>
                  </div>

                  {item.notes && (
                    <div className="col-span-2">
                      <MobileDetail
                        label="Additional Notes"
                        value={item.notes}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-[#edf1f6] bg-[#fafcff] p-4">
                  <p className="mb-2 text-xs font-semibold text-[#52627b]">
                    Booking Status
                  </p>

                  <CustomDropdown
                    value={item.status || "Upcoming"}
                    options={STATUSES}
                    onChange={(status) =>
                      changeStatus(item.id, status)
                    }
                  />
                </div>
              </article>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden w-full overflow-x-auto xl:block">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead className="bg-[#f7f9fd]">
              <tr className="text-[11px] font-bold uppercase tracking-wide text-[#8290a5]">
                <th className="px-3 py-4">Customer</th>
                <th className="px-3 py-4">Event Type</th>
                <th className="px-3 py-4">Event Date</th>
                <th className="px-3 py-4">Venue</th>
                <th className="px-3 py-4">Package</th>
                <th className="px-3 py-4">Total</th>
                <th className="px-3 py-4">Balance</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf1f6]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    No videography bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[#f8faff]"
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold text-[#10264d]">
                        {item.customer}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.phone}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <span className="inline-block max-w-[130px] break-words rounded-lg bg-[#edf3fc] px-2 py-1.5 text-xs font-medium text-[#315f9a]">
                        {item.event}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-xs text-[#52627b]">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-3 py-4 text-sm text-[#52627b]">
                      {item.venue || "—"}
                    </td>

                    <td className="px-3 py-4 text-xs text-[#52627b]">
                      {item.packageName}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-[#10264d]">
                      {money(item.amount)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-[#10264d]">
                      {money(
                        Math.max(
                          0,
                          Number(item.amount || 0) -
                            Number(item.advance || 0)
                        )
                      )}
                    </td>

                    <td className="min-w-[145px] px-3 py-4">
                      <div className="mb-2">
                        <StatusBadge status={item.status} />
                      </div>

                      <CustomDropdown
                        value={item.status || "Upcoming"}
                        options={STATUSES}
                        onChange={(status) =>
                          changeStatus(item.id, status)
                        }
                      />
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          aria-label="Edit booking"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteBooking(item)}
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
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </section>

      {/* ADD / EDIT FORM MODAL */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07172d]/70 p-2 backdrop-blur-[3px] sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeForm();
              }
            }}
          >
            <section
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="videography-modal-title"
              className="flex max-h-[calc(100dvh-16px)] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-40px)]"
            >
              {/* MODAL HEADER */}
              <div className="flex shrink-0 items-center justify-between gap-3 bg-[#10264d] px-4 py-4 text-white sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Film size={20} />
                  </div>

                  <div className="min-w-0">
                    <h2
                      id="videography-modal-title"
                      className="text-base font-bold sm:text-lg"
                    >
                      {editingId !== null
                        ? "Edit Videography Booking"
                        : "Add Videography Booking"}
                    </h2>

                    <p className="mt-1 text-[11px] text-blue-100">
                      Enter event and video shoot details
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
                  {/* CUSTOMER DETAILS */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SectionTitle
                      icon={UserRound}
                      title="Customer Information"
                    />

                    <FormField
                      label="Customer / Couple Name"
                      required
                    >
                      <input
                        ref={firstInputRef}
                        type="text"
                        required
                        className={inputClass}
                        placeholder="Enter customer / couple name"
                        value={form.customer}
                        onChange={(event) =>
                          updateForm("customer", event.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Phone Number" required>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        className={inputClass}
                        placeholder="Enter 10-digit phone number"
                        value={form.phone}
                        onChange={(event) =>
                          updateForm(
                            "phone",
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                      />
                    </FormField>
                  </div>

                  {/* EVENT DETAILS */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SectionTitle
                      icon={Video}
                      title="Event & Shoot Details"
                    />

                    <FormField label="Event Type" required>
                      <CustomDropdown
                        value={form.event}
                        options={
                          EVENT_TYPES.includes(form.event)
                            ? EVENT_TYPES
                            : [form.event, ...EVENT_TYPES]
                        }
                        onChange={(value) =>
                          updateForm("event", value)
                        }
                      />
                    </FormField>

                    <FormField label="Event Date" required>
                      <input
                        type="date"
                        required
                        className={inputClass}
                        value={form.date}
                        onChange={(event) =>
                          updateForm("date", event.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Venue / Location">
                      <CustomDropdown
                        value={form.venue}
                        options={
                          VENUES.includes(form.venue)
                            ? VENUES
                            : [form.venue, ...VENUES]
                        }
                        onChange={(value) =>
                          updateForm("venue", value)
                        }
                      />
                    </FormField>

                    <FormField label="Videography Package">
                      <CustomDropdown
                        value={form.packageName}
                        options={
                          PACKAGES.includes(form.packageName)
                            ? PACKAGES
                            : [form.packageName, ...PACKAGES]
                        }
                        onChange={(value) =>
                          updateForm("packageName", value)
                        }
                      />
                    </FormField>

                    <FormField label="Videographer">
                      <CustomDropdown
                        value={form.videographer}
                        options={
                          VIDEOGRAPHERS.includes(form.videographer)
                            ? VIDEOGRAPHERS
                            : [form.videographer, ...VIDEOGRAPHERS]
                        }
                        onChange={(value) =>
                          updateForm("videographer", value)
                        }
                      />
                    </FormField>

                    <FormField label="Booking Status">
                      <CustomDropdown
                        value={form.status}
                        options={STATUSES}
                        onChange={(value) =>
                          updateForm("status", value)
                        }
                      />
                    </FormField>
                  </div>

                  {/* PAYMENT DETAILS */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SectionTitle
                      icon={IndianRupee}
                      title="Payment Details"
                    />

                    <FormField label="Total Amount (₹)" required>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className={inputClass}
                        placeholder="Enter total amount"
                        value={form.amount}
                        onChange={(event) =>
                          updateForm("amount", event.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Advance Paid (₹)" required>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className={inputClass}
                        placeholder="Enter advance amount"
                        value={form.advance}
                        onChange={(event) =>
                          updateForm("advance", event.target.value)
                        }
                      />
                    </FormField>

                    <div className="col-span-full rounded-xl border border-[#dce4ef] bg-[#f4f7fc] p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Remaining Balance
                      </p>

                      <p className="mt-1 text-xl font-extrabold text-[#10264d]">
                        {money(
                          Math.max(
                            0,
                            Number(form.amount || 0) -
                              Number(form.advance || 0)
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  {/* NOTES */}
                  <div className="grid grid-cols-1 gap-4">
                    <SectionTitle
                      icon={Film}
                      title="Additional Requirements"
                    />

                    <FormField label="Additional Notes">
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(event) =>
                          updateForm("notes", event.target.value)
                        }
                        placeholder="Enter shoot requirements, equipment, delivery notes..."
                        className="block w-full min-w-0 resize-y rounded-xl border border-[#dce4ef] bg-white px-3.5 py-3 text-sm text-[#10264d] outline-none focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100"
                      />
                    </FormField>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                    >
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      {error}
                    </div>
                  )}
                </div>

                {/* MODAL FOOTER */}
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

                    {editingId !== null
                      ? "Update Booking"
                      : "Save Booking"}
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
