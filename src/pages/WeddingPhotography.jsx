
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { createPortal } from "react-dom";
import {
  Camera,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Heart,
  IndianRupee,
  CheckCircle2,
  Clock3,
  Users,
  ChevronDown,
  Check,
  Save,
  Wallet,
  AlertCircle,
  Filter,
} from "lucide-react";

const STORAGE_KEY = "studioraw_wedding_photography";
const DEMO_SEED_KEY = "studioraw_wedding_demo_20_v1";
const SOUND_KEY = "studioraw_dashboard_sound";

const eventTypes = [
  "Traditional Photography",
  "Candid Photography",
  "Helicam (Drone) Photography",
  "PreWedding Photography",
  "Post Wedding Photography",
  "Custom Package",
];

const packages = ["Standard", "Premium", "Luxury", "Custom"];

const statuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

const venues = [
  "Nagercoil",
  "Kanyakumari",
  "Marthandam",
  "Tirunelveli",
  "Chennai",
  "Madurai",
  "Trivandrum",
  "Coimbatore",
  "Thoothukudi",
  "Other",
];

const demoCouples = [
  ["Priya", "Arun"],
  ["Divya", "Karthik"],
  ["Anitha", "Vijay"],
  ["Keerthana", "Praveen"],
  ["Swetha", "Rahul"],
  ["Nithya", "Sanjay"],
  ["Harini", "Vignesh"],
  ["Aishwarya", "Dinesh"],
  ["Meena", "Ajay"],
  ["Ramya", "Naveen"],
  ["Abinaya", "Surya"],
  ["Kavya", "Aravind"],
  ["Janani", "Bala"],
  ["Deepika", "Ashwin"],
  ["Pavithra", "Ramesh"],
  ["Shalini", "Gokul"],
  ["Monisha", "Sathish"],
  ["Rithika", "Manoj"],
  ["Gayathri", "Hari"],
  ["Sneha", "Prakash"],
];

const demoAmounts = [
  85000, 150000, 45000, 95000, 180000,
  55000, 125000, 75000, 65000, 110000,
  140000, 48000, 92000, 175000, 58000,
  120000, 88000, 160000, 68000, 105000,
];

const demoAdvances = [
  30000, 50000, 10000, 45000, 80000,
  55000, 50000, 25000, 15000, 40000,
  70000, 12000, 35000, 80000, 20000,
  60000, 30000, 75000, 25000, 45000,
];

const demoWeddings = demoCouples.map(([bride, groom], index) => {
  const date = new Date(2026, 9, 10 + index * 5);

  const dateString = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    id: `WED${String(index + 1).padStart(3, "0")}`,
    bride,
    groom,
    phone: String(9000010001 + index),
    date: dateString,
    venue: venues[index % (venues.length - 1)],
    eventType: eventTypes[index % eventTypes.length],
    package: packages[index % 3],
    amount: demoAmounts[index],
    advance: demoAdvances[index],
    status: ["Confirmed", "Confirmed", "Pending", "Completed"][
      index % 4
    ],
    isDemo: true,
  };
});

const emptyForm = {
  bride: "",
  groom: "",
  phone: "",
  date: "",
  venue: "Nagercoil",
  eventType: "Traditional Photography",
  package: "Standard",
  amount: "",
  advance: "",
  status: "Pending",
};

const inputClass =
  "block h-11 w-full min-w-0 rounded-xl border border-[#d4e4fa] bg-white px-3.5 text-sm text-[#173f74] outline-none transition placeholder:text-[#98aac0] focus:border-[#8fb9ee] focus:ring-2 focus:ring-[#e5f0ff]";

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

function loadWeddings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const existing = Array.isArray(parsed) ? parsed : [];

    if (localStorage.getItem(DEMO_SEED_KEY) === "true") {
      return existing;
    }

    const existingIds = new Set(existing.map((item) => item.id));

    const missingDemo = demoWeddings.filter(
      (item) => !existingIds.has(item.id)
    );

    const merged = [...existing, ...missingDemo];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    localStorage.setItem(DEMO_SEED_KEY, "true");

    return merged;
  } catch {
    return demoWeddings;
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
      error: [240, 200],
      select: [560],
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
    // Sound is optional.
  }
}

/* ==========================================
   NEW: AUTOMATIC NUMBER COUNTING
========================================== */

function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  const currentValueRef = useRef(0);

  useEffect(() => {
    const start = currentValueRef.current;
    const end = Number(target) || 0;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setCount(end);
      currentValueRef.current = end;
      return;
    }

    let frameId;
    let startTime = null;

    const animate = (timestamp) => {
      if (startTime === null) startTime = timestamp;

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(
        start + (end - start) * eased
      );

      setCount(nextValue);
      currentValueRef.current = nextValue;

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
        currentValueRef.current = end;
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [target, duration]);

  return count;
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

      const menuHeight = Math.min(options.length * 43 + 12, 230);
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove =
        spaceBelow < menuHeight + 12 && rect.top > spaceBelow;

      setMenuStyle({
        position: "fixed",
        left: Math.max(8, rect.left),
        width: Math.min(rect.width, window.innerWidth - 16),
        top: showAbove
          ? Math.max(8, rect.top - menuHeight - 5)
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
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#d4e4fa] bg-white px-3.5 text-left text-sm font-medium text-[#173f74] transition hover:border-[#8fb9ee] focus:outline-none focus:ring-2 focus:ring-[#e5f0ff]"
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#6485ac] transition-transform ${
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
            className="overflow-y-auto overscroll-contain rounded-xl border border-[#d4e4fa] bg-white p-1 shadow-[0_15px_45px_rgba(43,92,153,0.16)]"
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
                    ? "bg-[#e8f2ff] font-semibold text-[#285a99]"
                    : "text-[#526781] hover:bg-[#f0f7ff]"
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

/* ==========================================
   PREMIUM COMPACT DOUBLE-SHADE STAT CARD
========================================== */

const statThemes = [
  {
    outer: "bg-[#deedff] border-[#bdd9fa]",
    iconBg: "bg-[#c4ddff]",
    iconColor: "text-[#285a99]",
    line: "bg-[#80afe8]",
  },
  {
    outer: "bg-[#d9eaff] border-[#b9d6f8]",
    iconBg: "bg-[#bdd9ff]",
    iconColor: "text-[#2f69aa]",
    line: "bg-[#659bdc]",
  },
  {
    outer: "bg-[#e7f2ff] border-[#cddff8]",
    iconBg: "bg-[#d1e5ff]",
    iconColor: "text-[#4175b1]",
    line: "bg-[#9bc1f1]",
  },
  {
    outer: "bg-[#d4e5fc] border-[#b4d0f3]",
    iconBg: "bg-[#bdd8fa]",
    iconColor: "text-[#285a99]",
    line: "bg-[#548ccf]",
  },
];

/* ==========================================
   UPDATED STAT CARD - AUTO COUNT
========================================== */

function StatCard({ title, value, icon: Icon, index = 0 }) {
  const theme = statThemes[index % statThemes.length];

  const isMoney =
    typeof value === "string" && value.includes("₹");

  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[₹,]/g, "")) || 0;

  const animatedValue = useCountUp(numericValue, 1400);

  const displayValue = isMoney
    ? money(animatedValue)
    : animatedValue.toLocaleString("en-IN");

  return (
    <div
      style={{ "--float-delay": `${index * -0.7}s` }}
      className={`wed-stat-float group relative flex min-w-0 items-center justify-between gap-3 overflow-hidden rounded-[20px] border p-4 shadow-[0_7px_20px_rgba(43,92,153,0.05)] sm:p-5 ${theme.outer}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/30 blur-xl" />

      <div className="relative z-10 min-w-0">
        <p className="text-xs font-semibold text-[#5e7fa6] sm:text-sm">
          {title}
        </p>

        <h3 className="mt-2 truncate whitespace-nowrap text-lg font-black tabular-nums text-[#173f74] sm:text-xl xl:text-2xl">
          {displayValue}
        </h3>
      </div>

      <div
        className={`wed-stat-icon relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm ${theme.iconBg}`}
      >
        <Icon size={21} className={theme.iconColor} />
      </div>

      <div className={`absolute bottom-0 left-0 h-[3px] w-full ${theme.line}`} />
    </div>
  );
}

/* ==========================================
   UPDATED PAYMENT CARD - AUTO COUNT
========================================== */

function PaymentCard({ title, value, icon: Icon, index = 0 }) {
  const shades = [
    "from-[#d5e7ff] via-[#e6f1ff] to-[#f5faff]",
    "from-[#c5ddfb] via-[#deecff] to-[#f3f8ff]",
    "from-[#dcecff] via-[#eaf4ff] to-[#f8fbff]",
  ];

  const isMoney =
    typeof value === "string" && value.includes("₹");

  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[₹,]/g, "")) || 0;

  const animatedValue = useCountUp(numericValue, 1500);

  const displayValue = isMoney
    ? money(animatedValue)
    : animatedValue.toLocaleString("en-IN");

  return (
    <div
      className={`wed-hover-card relative min-w-0 overflow-hidden rounded-[20px] border border-[#cddff6] bg-gradient-to-br ${shades[index % shades.length]} p-4 shadow-[0_7px_20px_rgba(43,92,153,0.05)] sm:p-5`}
    >
      <div className="pointer-events-none absolute -right-6 -top-7 h-24 w-24 rounded-full border border-white/60" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#6485ac]">
            {title}
          </p>

          <p className="mt-3 truncate whitespace-nowrap text-lg font-black tabular-nums text-[#173f74] sm:text-xl">
            {displayValue}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-[#b9d6fa] text-[#285a99]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   PREMIUM DOUBLE-SHADE SECTION HEADER
========================================== */

function SectionHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="relative overflow-hidden border-b border-[#d4e4fa] bg-gradient-to-r from-[#c5ddfb] via-[#dceaff] to-[#f0f7ff] px-4 py-5 sm:px-6">
      <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full border border-white/60" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-[#b5d3fa] text-[#285a99] shadow-sm">
          <Icon size={23} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6485ac]">
            Studio Raw Picturez
          </p>

          <h2 className="mt-1 text-lg font-black text-[#173f74] sm:text-xl">
            {title}
          </h2>

          <p className="mt-1 text-xs font-medium text-[#6485ac]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Confirmed: "border-blue-200 bg-[#e5f0ff] text-[#285a99]",
    Pending: "border-amber-100 bg-amber-50 text-amber-700",
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

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-[#385b85]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="col-span-full flex items-center gap-2.5 border-b border-[#dce8f8] pb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcecff] text-[#285a99]">
        <Icon size={17} />
      </div>
      <h4 className="text-sm font-bold text-[#173f74]">{title}</h4>
    </div>
  );
}

function MobileDetail({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#dce9f8] bg-white/85 p-3">
      <p className="text-[11px] font-medium text-[#8a9fba]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#173f74]">
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

export default function WeddingPhotography() {
  const [weddings, setWeddings] = useState(loadWeddings);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weddings));
  }, [weddings]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!modalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => firstInputRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setModalOpen(false);
        setEditing(null);
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
  }, [modalOpen]);

  const confirmed = weddings.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const pending = weddings.filter(
    (item) => item.status === "Pending"
  ).length;

  const completed = weddings.filter(
    (item) => item.status === "Completed"
  ).length;

  const totalAmount = weddings.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalAdvance = weddings.reduce(
    (sum, item) => sum + Number(item.advance || 0),
    0
  );

  const totalDue = Math.max(0, totalAmount - totalAdvance);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return weddings.filter((item) => {
      const matchesSearch = [
        item.bride,
        item.groom,
        item.phone,
        item.venue,
        item.id,
        item.package,
        item.eventType,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      );

      const matchesStatus =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [weddings, search, filter]);

  const openAdd = () => {
    previousFocusRef.current = document.activeElement;
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
    setModalOpen(true);
    playSound("open");
  };

  const openEdit = (item) => {
    previousFocusRef.current = document.activeElement;
    setEditing(item);
    setForm({
      ...emptyForm,
      ...item,
      eventType: item.eventType || "Traditional Photography",
    });
    setError("");
    setModalOpen(true);
    playSound("open");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setError("");
    playSound("close");
  };

  const update = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) setError("");
  };

  useEffect(() => {
    let isMounted = true;
    api.weddingPhotography
      .list()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setWeddings(
            data.map((item) => ({
              id: item.id,
              bride: item.bride_name || "",
              groom: item.groom_name || "",
              phone: item.phone || "",
              email: item.email || "",
              venue: item.event_location || "",
              eventType: item.service_type || "Traditional Photography",
              date: item.event_date || "",
              amount: Number(item.package_amount || 0),
              advance: Number(item.advance_amount || 0),
              status: item.status || "Pending",
              notes: item.notes || "",
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Backend wedding photography load notice:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveWedding = async (event) => {
    event.preventDefault();

    const bride = String(form.bride || "").trim();
    const groom = String(form.groom || "").trim();
    const phone = String(form.phone || "").trim();

    if (!bride || !groom) {
      setError("Please enter bride and groom names.");
      playSound("error");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      playSound("error");
      return;
    }

    if (!form.date) {
      setError("Please select the wedding date.");
      playSound("error");
      return;
    }

    if (!eventTypes.includes(form.eventType)) {
      setError("Please select a valid event type.");
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
      setError("Advance amount cannot exceed the package amount.");
      playSound("error");
      return;
    }

    const data = {
      ...form,
      bride,
      groom,
      phone,
      venue: String(form.venue || "").trim(),
      eventType: form.eventType,
      amount,
      advance,
    };

    const payload = {
      customer_name: `${groom} & ${bride}`.trim() || bride || groom || "Customer",
      bride_name: bride,
      groom_name: groom,
      phone,
      email: form.email || "",
      service_type: form.eventType,
      event_date: form.date || null,
      event_location: String(form.venue || "").trim(),
      package_amount: amount,
      advance_amount: advance,
      status: form.status || "Pending",
      notes: form.notes || "",
    };

    try {
      if (editing) {
        if (typeof editing.id === "number") {
          await api.weddingPhotography.update(editing.id, payload);
        }
        setWeddings((previous) =>
          previous.map((item) =>
            item.id === editing.id ? { ...item, ...data } : item
          )
        );
        setNotice("Wedding updated successfully.");
      } else {
        let createdId = `WED-${Date.now()}`;
        try {
          const res = await api.weddingPhotography.create(payload);
          if (res?.id) createdId = res.id;
        } catch (apiErr) {
          console.warn("Backend create wedding photography notice:", apiErr.message);
        }
        const newWedding = {
          ...data,
          id: createdId,
          isDemo: false,
        };
        setWeddings((previous) => [newWedding, ...previous]);
        setNotice("Wedding added successfully.");
      }

      playSound("save");
      setModalOpen(false);
      setEditing(null);
      setError("");
    } catch (err) {
      console.error("Save wedding error:", err);
      setError(err.message || "Failed to save wedding.");
    }
  };

  const deleteWedding = async (item) => {
    if (
      !window.confirm(
        `Delete ${item.bride} & ${item.groom}'s wedding?`
      )
    ) {
      return;
    }

    try {
      if (typeof item.id === "number") {
        await api.weddingPhotography.delete(item.id);
      }
    } catch (err) {
      console.warn("Backend delete wedding photography notice:", err.message);
    }

    setWeddings((previous) =>
      previous.filter((wedding) => wedding.id !== item.id)
    );

    setNotice("Wedding deleted successfully.");
    playSound("delete");
  };

  const changeStatus = async (id, status) => {
    try {
      if (typeof id === "number") {
        await api.weddingPhotography.update(id, { status });
      }
    } catch (err) {
      console.warn("Backend status update notice:", err.message);
    }

    setWeddings((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    playSound("select");
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-[#f7f9fd] px-3 py-5 text-[#173f74] sm:px-6 lg:space-y-7 lg:px-8 lg:py-8">
      <style>{`
        @keyframes wedFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes wedModalIn {
          from {
            opacity: 0;
            transform: scale(.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .wed-stat-float {
          animation: wedFloat 5s ease-in-out infinite;
          animation-delay: var(--float-delay, 0s);
          transition: box-shadow .3s ease;
        }

        .wed-stat-float:hover {
          animation-play-state: paused;
          box-shadow: 0 14px 28px rgba(43,92,153,.13);
        }

        .wed-stat-icon {
          transition: transform .3s ease;
        }

        .wed-stat-float:hover .wed-stat-icon {
          transform: rotate(-7deg) scale(1.08);
        }

        .wed-hover-card {
          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .wed-hover-card:hover {
          transform: translateY(-4px);
          border-color: #a9caf3;
          box-shadow: 0 13px 27px rgba(43,92,153,.12);
        }

        .wed-modal-enter {
          animation: wedModalIn .22s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .wed-stat-float,
          .wed-modal-enter {
            animation: none !important;
          }

          .wed-hover-card,
          .wed-stat-icon {
            transition: none !important;
          }

          .wed-hover-card:hover {
            transform: none;
          }
        }
      `}</style>

      {/* NOTIFICATION */}
      {notice &&
        createPortal(
          <div className="fixed left-3 right-3 top-4 z-[11000] flex items-center gap-3 rounded-xl border border-[#d4e4fa] bg-white px-4 py-3 text-sm font-medium text-[#173f74] shadow-xl sm:left-auto sm:right-6 sm:max-w-md">
            <CheckCircle2
              size={19}
              className="shrink-0 text-[#356cae]"
            />

            <span className="min-w-0 flex-1">{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              className="shrink-0 rounded-lg p-1 text-[#8a9fba] hover:bg-[#eaf3ff]"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>,
          document.body
        )}

      {/* HEADER */}
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0" />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#285a99] px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#173f74] sm:flex-none sm:text-sm"
          >
            <Plus size={18} />
            Add Wedding
          </button>
        </div>
      </div>

      {/* SUMMARY - AUTO COUNT */}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Weddings"
          value={weddings.length}
          icon={Heart}
          index={0}
        />

        <StatCard
          title="Confirmed"
          value={confirmed}
          icon={CheckCircle2}
          index={1}
        />

        <StatCard
          title="Pending"
          value={pending}
          icon={Clock3}
          index={2}
        />

        <StatCard
          title="Package Value"
          value={money(totalAmount)}
          icon={IndianRupee}
          index={3}
        />
      </div>

      {/* PAYMENT SUMMARY - AUTO COUNT */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <PaymentCard
          title="Total Advance Collected"
          value={money(totalAdvance)}
          icon={Wallet}
          index={0}
        />

        <PaymentCard
          title="Pending Balance"
          value={money(totalDue)}
          icon={IndianRupee}
          index={1}
        />

        <PaymentCard
          title="Completed Weddings"
          value={completed}
          icon={CheckCircle2}
          index={2}
        />
      </div>

      {/* DIRECTORY */}
      <section className="min-w-0 overflow-hidden rounded-[25px] border border-[#d4e4fa] bg-[#f8fbff] shadow-[0_8px_28px_rgba(43,92,153,0.06)]">
        <SectionHeader
          title="Wedding Directory"
          subtitle={`${filtered.length} of ${weddings.length} wedding records`}
          icon={Heart}
        />

        <div className="flex flex-col gap-4 border-b border-[#dce8f8] bg-[#f4f9ff] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-[270px]">
              <Search
                size={17}
                className="absolute left-3 top-3.5 text-[#8da5c2]"
              />

              <input
                type="search"
                className={`${inputClass} pl-10`}
                placeholder="Search weddings..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-[175px]">
              <Filter
                size={16}
                className="shrink-0 text-[#8da5c2] sm:hidden"
              />

              <CustomDropdown
                value={filter}
                options={["All", ...statuses]}
                onChange={setFilter}
              />
            </div>
          </div>
        </div>

        {/* MOBILE / TABLET */}
        <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
          {filtered.length === 0 ? (
            <div className="col-span-full py-14 text-center">
              <Users
                size={34}
                className="mx-auto text-[#9bb9dc]"
              />
              <p className="mt-3 text-sm text-[#8a9fba]">
                No wedding records found.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id}
                className="wed-hover-card min-w-0 overflow-hidden rounded-[20px] border border-[#d5e5fa] bg-gradient-to-br from-[#e8f2ff] via-[#f1f7ff] to-[#e2efff] shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#d4e4fa] bg-[#dcecff]/65 p-4">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-[#bdd9ff] text-[#285a99]">
                      <Heart size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold text-[#173f74]">
                        {item.bride} & {item.groom}
                      </h3>

                      <p className="mt-1 text-[11px] text-[#8a9fba]">
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
                      className="rounded-lg border border-[#d4e4fa] bg-white p-2 text-[#285a99]"
                      aria-label="Edit wedding"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteWedding(item)}
                      className="rounded-lg border border-red-100 bg-white p-2 text-red-600"
                      aria-label="Delete wedding"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 p-4">
                  <MobileDetail
                    label="Wedding Date"
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
                    label="Event Type"
                    value={
                      item.eventType || "Traditional Photography"
                    }
                  />

                  <MobileDetail
                    label="Package"
                    value={item.package}
                  />

                  <MobileDetail
                    label="Package Amount"
                    value={money(item.amount)}
                  />

                  <MobileDetail
                    label="Advance"
                    value={money(item.advance)}
                  />

                  <div className="col-span-2 rounded-xl border border-[#cbdff8] bg-[#dcecff] p-3">
                    <p className="text-xs font-medium text-[#6485ac]">
                      Pending Balance
                    </p>

                    <p className="mt-1 text-base font-black text-[#173f74]">
                      {money(
                        Math.max(
                          0,
                          Number(item.amount || 0) -
                            Number(item.advance || 0)
                        )
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#d4e4fa] bg-[#edf5ff] p-4">
                  <p className="mb-2 text-xs font-semibold text-[#55779e]">
                    Wedding Status
                  </p>

                  <CustomDropdown
                    value={item.status || "Pending"}
                    options={statuses}
                    onChange={(value) =>
                      changeStatus(item.id, value)
                    }
                  />
                </div>
              </article>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden w-full overflow-x-auto lg:block">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead className="bg-[#dcecff]">
              <tr className="text-[11px] font-bold uppercase tracking-wide text-[#557ba9]">
                <th className="px-4 py-4">Wedding Couple</th>
                <th className="px-4 py-4">Wedding Date</th>
                <th className="px-4 py-4">Venue</th>
                <th className="px-4 py-4">Event Type</th>
                <th className="px-4 py-4">Package</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#dce8f8]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-[#8a9fba]"
                  >
                    No wedding records found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`transition hover:bg-[#dcecff] ${
                      index % 2 === 0
                        ? "bg-[#f8fbff]"
                        : "bg-[#edf5ff]"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dcecff] text-[#285a99]">
                          <Heart size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-[#173f74]">
                            {item.bride} & {item.groom}
                          </p>

                          <p className="mt-1 text-xs text-[#8a9fba]">
                            {item.id}
                          </p>

                          <p className="mt-1 text-xs text-[#6485ac]">
                            {item.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#526f92]">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-4 py-4 text-sm text-[#526f92]">
                      {item.venue || "—"}
                    </td>

                    <td className="min-w-[175px] px-4 py-4 text-sm font-medium text-[#526f92]">
                      {item.eventType || "Traditional Photography"}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-[#526f92]">
                      {item.package}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#173f74]">
                        {money(item.amount)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a9fba]">
                        Due:{" "}
                        {money(
                          Math.max(
                            0,
                            Number(item.amount || 0) -
                              Number(item.advance || 0)
                          )
                        )}
                      </p>
                    </td>

                    <td className="min-w-[145px] px-4 py-4">
                      <div className="mb-2">
                        <StatusBadge status={item.status} />
                      </div>

                      <CustomDropdown
                        value={item.status || "Pending"}
                        options={statuses}
                        onChange={(value) =>
                          changeStatus(item.id, value)
                        }
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-2 text-[#285a99] hover:bg-[#dcecff]"
                          aria-label="Edit wedding"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteWedding(item)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          aria-label="Delete wedding"
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

        <div className="border-t border-[#dce8f8] bg-[#eaf3ff] px-4 py-4 text-xs text-[#6485ac] sm:px-5">
          Showing {filtered.length} of {weddings.length} weddings
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {modalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07172d]/65 p-2 backdrop-blur-[3px] sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >
            <section
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="wedding-modal-title"
              className="wed-modal-enter flex max-h-[calc(100dvh-16px)] w-full max-w-[780px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:max-h-[calc(100dvh-40px)]"
            >
              {/* MODAL HEADER */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d4e4fa] bg-gradient-to-r from-[#c5ddfb] via-[#deecff] to-[#f1f7ff] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-[#b5d3fa] text-[#285a99]">
                    {editing ? (
                      <Pencil size={19} />
                    ) : (
                      <Heart size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2
                      id="wedding-modal-title"
                      className="text-base font-black text-[#173f74] sm:text-lg"
                    >
                      {editing
                        ? "Edit Wedding"
                        : "Add New Wedding"}
                    </h2>

                    <p className="mt-1 text-[11px] text-[#6485ac]">
                      Wedding photography booking details
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[#d4e4fa] bg-white p-2 text-[#55779e] hover:bg-[#eaf3ff]"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={saveWedding}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain bg-[#f8fbff] px-4 py-5 sm:px-6">

                  {/* COUPLE DETAILS */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SectionTitle
                      icon={Heart}
                      title="Couple Information"
                    />

                    <FormField label="Bride Name" required>
                      <input
                        ref={firstInputRef}
                        type="text"
                        required
                        className={inputClass}
                        placeholder="Enter bride name"
                        value={form.bride}
                        onChange={(event) =>
                          update("bride", event.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Groom Name" required>
                      <input
                        type="text"
                        required
                        className={inputClass}
                        placeholder="Enter groom name"
                        value={form.groom}
                        onChange={(event) =>
                          update("groom", event.target.value)
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
                          update(
                            "phone",
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                      />
                    </FormField>

                    <FormField label="Wedding Date" required>
                      <input
                        type="date"
                        required
                        className={inputClass}
                        value={form.date}
                        onChange={(event) =>
                          update("date", event.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Wedding Venue">
                      <CustomDropdown
                        value={form.venue}
                        options={venues}
                        onChange={(value) =>
                          update("venue", value)
                        }
                      />
                    </FormField>
                  </div>

                  {/* EVENT TYPE */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SectionTitle
                      icon={Camera}
                      title="Photography Event Type"
                    />

                    <div className="sm:col-span-2">
                      <FormField label="Event Type" required>
                        <CustomDropdown
                          value={form.eventType}
                          options={eventTypes}
                          onChange={(value) =>
                            update("eventType", value)
                          }
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* PACKAGE & PAYMENT */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SectionTitle
                      icon={Wallet}
                      title="Package & Payment Details"
                    />

                    <FormField label="Wedding Package">
                      <CustomDropdown
                        value={form.package}
                        options={packages}
                        onChange={(value) =>
                          update("package", value)
                        }
                      />
                    </FormField>

                    <FormField label="Booking Status">
                      <CustomDropdown
                        value={form.status}
                        options={statuses}
                        onChange={(value) =>
                          update("status", value)
                        }
                      />
                    </FormField>

                    <FormField label="Package Amount">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        placeholder="Enter total amount"
                        value={form.amount}
                        onChange={(event) =>
                          update("amount", event.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Advance Amount">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        placeholder="Enter advance amount"
                        value={form.advance}
                        onChange={(event) =>
                          update("advance", event.target.value)
                        }
                      />
                    </FormField>

                    <div className="col-span-full rounded-xl border border-[#cbdff8] bg-gradient-to-r from-[#d5e7ff] to-[#eaf3ff] p-4">
                      <p className="text-xs font-semibold text-[#6485ac]">
                        Remaining Balance
                      </p>

                      <p className="mt-1 text-xl font-black text-[#173f74]">
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
                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#dce8f8] bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full rounded-xl border border-[#d4e4fa] bg-[#f4f9ff] px-6 py-3 text-sm font-semibold text-[#385b85] hover:bg-[#eaf3ff] sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#285a99] px-6 py-3 text-sm font-semibold text-white hover:bg-[#173f74] sm:w-auto"
                  >
                    <Save size={17} />
                    {editing
                      ? "Update Wedding"
                      : "Save Wedding"}
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
