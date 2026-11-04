import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
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
  CheckCircle2,
  Wallet,
  UserRound,
  Film,
  ChevronDown,
  Check,
  AlertCircle,
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
    videographer:
      VIDEOGRAPHERS[index % (VIDEOGRAPHERS.length - 1)],
    amount,
    advance:
      index % 6 === 0
        ? amount
        : Math.floor(
            (amount * (0.25 + (index % 4) * 0.1)) / 1000
          ) * 1000,
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
  event: "",
  date: "",
  venue: "Location",
  packageName: "",
  videographer: "",
  amount: "",
  advance: "",
  status: "",
  notes: "",
};

const inputClass =
  "block h-11 w-full min-w-0 rounded-xl border border-[#c9def8] bg-white px-3.5 text-sm text-[#173f74] outline-none transition placeholder:text-slate-400 focus:border-[#6ca4ed] focus:ring-2 focus:ring-blue-100";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const balanceOf = (item) =>
  Math.max(
    0,
    Number(item.amount || 0) - Number(item.advance || 0)
  );

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

    (sounds[type] || sounds.click).forEach(
      (frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start =
          audioContext.currentTime + index * 0.075;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
          frequency,
          start
        );

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(
          0.025,
          start + 0.015
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 0.15
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(start);
        oscillator.stop(start + 0.16);
      }
    );
  } catch {
    // Optional click sound.
  }
}

/* =========================================
   ANIMATED NUMBER
========================================= */

function useCountUp(target, duration = 1100) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);
  const previousRef = useRef(0);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const startValue =
      replay > 0 ? 0 : previousRef.current;

    const endValue = Number(target) || 0;

    if (
      typeof window === "undefined" ||
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      setDisplay(endValue);
      previousRef.current = endValue;
      return;
    }

    let startTime = null;
    let cancelled = false;

    const animate = (timestamp) => {
      if (cancelled) return;

      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      const current =
        startValue +
        (endValue - startValue) * eased;

      setDisplay(Math.round(current));

      if (progress < 1) {
        frameRef.current =
          requestAnimationFrame(animate);
      } else {
        setDisplay(endValue);
        previousRef.current = endValue;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, replay]);

  const restart = () => {
    previousRef.current = 0;
    setDisplay(0);
    setReplay((value) => value + 1);
  };

  return [display, restart];
}

/* =========================================
   STAT CARD WITH CLICK ANIMATION
========================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  isMoney = false,
  index = 0,
}) {
  const [count, restart] = useCountUp(
    value,
    isMoney ? 1500 : 950
  );

  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  const trigger = () => {
    restart();
    playSound("click");

    setActive(false);

    requestAnimationFrame(() => {
      setActive(true);
    });

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setActive(false);
    }, 800);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const shades = [
    {
      outer: "from-[#c8e0ff] to-[#e9f3ff]",
      icon: "bg-white/75 text-[#245c9c]",
      line: "bg-[#478bd7]",
    },
    {
      outer: "from-[#d5e7ff] to-[#f0f7ff]",
      icon: "bg-white/75 text-[#356da9]",
      line: "bg-[#69a2e8]",
    },
    {
      outer: "from-[#c9e2ff] to-[#e9f3ff]",
      icon: "bg-white/75 text-[#245c9c]",
      line: "bg-[#478bd7]",
    },
    {
      outer: "from-[#d9eaff] to-[#f1f7ff]",
      icon: "bg-white/75 text-[#356da9]",
      line: "bg-[#69a2e8]",
    },
  ];

  const shade = shades[index % shades.length];

  return (
    <button
      type="button"
      onClick={trigger}
      title="Click to replay counting animation"
      className={`relative flex min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-2xl border border-[#bad6f8] bg-gradient-to-br ${shade.outer} p-4 text-left shadow-[0_5px_16px_rgba(66,121,191,0.09)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(65,128,205,0.18)] focus:outline-none focus:ring-2 focus:ring-[#6ca4ed] sm:p-5 ${
        active
          ? "vid-card-shake vid-card-glow"
          : ""
      }`}
    >
      <div className="relative z-10 min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#5477a1] sm:text-sm">
          {title}
        </p>

        <h2 className="mt-2 truncate text-lg font-extrabold tabular-nums text-[#173f74] sm:text-xl xl:text-2xl">
          {isMoney ? money(count) : count}
        </h2>

        <div
          className={`mt-3 h-1 w-9 rounded-full ${shade.line}`}
        />
      </div>

      <div
        className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${shade.icon}`}
      >
        <Icon size={21} />
      </div>

      <div className="pointer-events-none absolute -bottom-8 -right-7 h-24 w-24 rounded-full bg-white/25 blur-xl" />
    </button>
  );
}

/* =========================================
   CUSTOM DROPDOWN
========================================= */

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
      const rect =
        buttonRef.current?.getBoundingClientRect();

      if (!rect) return;

      const desiredHeight = Math.min(
        options.length * 43 + 12,
        230
      );

      const spaceBelow =
        window.innerHeight - rect.bottom;

      const showAbove =
        spaceBelow < desiredHeight + 12 &&
        rect.top > spaceBelow;

      setMenuStyle({
        position: "fixed",
        left: Math.max(8, rect.left),
        width: Math.min(
          rect.width,
          window.innerWidth - 16
        ),
        top: showAbove
          ? Math.max(
              8,
              rect.top - desiredHeight - 5
            )
          : rect.bottom + 5,
        maxHeight: Math.max(
          60,
          Math.min(
            230,
            showAbove
              ? rect.top - 16
              : window.innerHeight -
                  rect.bottom -
                  16
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
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    updatePosition();

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    window.addEventListener(
      "resize",
      updatePosition
    );

    window.addEventListener(
      "scroll",
      updatePosition,
      true
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );

      window.removeEventListener(
        "resize",
        updatePosition
      );

      window.removeEventListener(
        "scroll",
        updatePosition,
        true
      );
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
        className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#c9def8] bg-white px-3.5 text-left text-sm font-medium text-[#173f74] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#6083ae] transition-transform ${
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
            className="overflow-y-auto overscroll-contain rounded-xl border border-[#c9def8] bg-white p-1 shadow-[0_15px_45px_rgba(16,38,77,0.2)]"
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
                    ? "bg-[#e4f0ff] font-semibold text-[#245c9c]"
                    : "text-slate-700 hover:bg-[#f0f7ff]"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {value === option && (
                  <Check size={15} />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-[#45688e]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}) {
  return (
    <div className="col-span-full flex items-center gap-2.5 border-b border-[#d8e8fb] pb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dcecff] text-[#245c9c]">
        <Icon size={17} />
      </div>

      <h3 className="text-sm font-bold text-[#173f74]">
        {title}
      </h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Upcoming:
      "border-[#bcd8fb] bg-[#e2efff] text-[#245c9c]",
    "In Progress":
      "border-amber-100 bg-amber-50 text-amber-700",
    Completed:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    Cancelled:
      "border-rose-100 bg-rose-50 text-rose-700",
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

function MobileDetail({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-[#7893b3]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#173f74]">
        {value === "" || value == null
          ? "—"
          : value}
      </p>
    </div>
  );
}

/* =========================================
   MAIN COMPONENT
========================================= */

export default function WeddingVideography() {
  const [bookings, setBookings] =
    useState(loadBookings);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] =
    useState(null);
  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify(bookings)
    );
  }, [bookings]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(
      () => setNotice(""),
      3000
    );

    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setEditingId(null);
        setError("");
        return;
      }

      if (
        event.key !== "Tab" ||
        !modalRef.current
      ) {
        return;
      }

      const focusable = Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (element) =>
          element.getClientRects().length > 0
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last =
        focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

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
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      const matchesEvent =
        eventFilter === "All" ||
        item.event === eventFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesEvent &&
        matchesStatus
      );
    });
  }, [
    bookings,
    search,
    eventFilter,
    statusFilter,
  ]);

  const totalAmount = bookings.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  const totalAdvance = bookings.reduce(
    (sum, item) =>
      sum + Number(item.advance || 0),
    0
  );

  const totalPending = bookings.reduce(
    (sum, item) => sum + balanceOf(item),
    0
  );

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: Video,
    },
    {
      title: "Upcoming Shoots",
      value: bookings.filter(
        (item) => item.status === "Upcoming"
      ).length,
      icon: CalendarDays,
    },
    {
      title: "Completed Shoots",
      value: bookings.filter(
        (item) => item.status === "Completed"
      ).length,
      icon: CheckCircle2,
    },
    {
      title: "Pending Payments",
      value: totalPending,
      icon: Wallet,
      isMoney: true,
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
    previousFocusRef.current =
      document.activeElement;

    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setOpen(true);

    playSound("open");
  };

  const openEdit = (item) => {
    previousFocusRef.current =
      document.activeElement;

    setEditingId(item.id);
    setForm({
      ...emptyForm,
      ...item,
    });

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

  useEffect(() => {
    let isMounted = true;
    api.weddingVideography
      .list()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBookings(
            data.map((item) => ({
              id: item.id,
              customer: item.customer_name || `${item.bride_name || ""} & ${item.groom_name || ""}`.trim() || "Customer",
              phone: item.phone || "",
              email: item.email || "",
              event: item.service_type || "Traditional VideoGraphy",
              packageName: "Standard Videography",
              date: item.event_date || "",
              amount: Number(item.package_amount || 0),
              advance: Number(item.advance_amount || 0),
              venue: item.event_location || "",
              videographer: "",
              status: item.status || "Upcoming",
              notes: item.notes || "",
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Backend wedding videography load notice:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveBooking = async (event) => {
    event.preventDefault();

    const customer = String(
      form.customer || ""
    ).trim();

    const phone = String(
      form.phone || ""
    ).trim();

    if (!customer) {
      setError(
        "Please enter customer / couple name."
      );
      playSound("error");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      playSound("error");
      return;
    }

    if (!form.event || !EVENT_TYPES.includes(form.event)) {
      setError("Please select event type.");
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
      setError(
        "Advance amount cannot exceed total amount."
      );
      playSound("error");
      return;
    }

    const payload = {
      customer_name: customer,
      phone,
      email: form.email || "",
      service_type: form.event,
      event_date: form.date || null,
      event_location: String(form.venue || "").trim(),
      package_amount: amount,
      advance_amount: advance,
      status: form.status || "Upcoming",
      notes: String(form.notes || "").trim(),
    };

    try {
      if (editingId !== null) {
        if (typeof editingId === "number") {
          try {
            await api.weddingVideography.update(editingId, payload);
          } catch (apiErr) {
            console.warn("Backend update videography notice:", apiErr.message);
          }
        }

        const record = {
          ...form,
          id: editingId,
          customer,
          phone,
          amount,
          advance,
          venue: String(form.venue || "").trim(),
          videographer: String(form.videographer || "").trim(),
          notes: String(form.notes || "").trim(),
          status: form.status || "Upcoming",
        };

        setBookings((previous) =>
          previous.map((item) =>
            item.id === editingId ? record : item
          )
        );

        setNotice("Videography booking updated successfully.");
      } else {
        let createdId = `VID-${Date.now()}`;
        try {
          const res = await api.weddingVideography.create(payload);
          if (res?.id) createdId = res.id;
        } catch (apiErr) {
          console.warn("Backend create videography notice:", apiErr.message);
        }

        const record = {
          ...form,
          id: createdId,
          customer,
          phone,
          amount,
          advance,
          venue: String(form.venue || "").trim(),
          videographer: String(form.videographer || "").trim(),
          notes: String(form.notes || "").trim(),
          status: form.status || "Upcoming",
        };

        setBookings((previous) => [record, ...previous]);
        setNotice("Videography booking added successfully.");
      }

      playSound("save");
      setOpen(false);
      setEditingId(null);
      setError("");
    } catch (err) {
      console.error("Save videography booking error:", err);
      setError(err.message || "Failed to save videography booking.");
    }
  };

  const deleteBooking = async (item) => {
    if (
      !window.confirm(
        `Delete videography booking for ${item.customer}?`
      )
    ) {
      return;
    }

    try {
      if (typeof item.id === "number") {
        await api.weddingVideography.delete(item.id);
      }
    } catch (err) {
      console.warn("Backend delete videography notice:", err.message);
    }

    setBookings((previous) =>
      previous.filter((booking) => booking.id !== item.id)
    );

    setNotice("Videography booking deleted successfully.");
    playSound("delete");
  };

  const changeStatus = async (id, status) => {
    try {
      if (typeof id === "number") {
        await api.weddingVideography.update(id, { status });
      }
    } catch (err) {
      console.warn("Backend status update notice:", err.message);
    }

    setBookings((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    playSound("select");
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-[#f5f9ff] px-3 py-5 text-slate-800 sm:px-6 lg:space-y-7 lg:px-8 lg:py-8">

      {/* ANIMATION STYLES */}
      <style>{`
        @keyframes vidCardShake {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          20% {
            transform: translateX(-2px) scale(1.015);
          }
          40% {
            transform: translateX(2px) scale(1.02);
          }
          60% {
            transform: translateX(-1px) scale(1.015);
          }
          80% {
            transform: translateX(1px) scale(1.005);
          }
        }

        @keyframes vidCardGlow {
          0%, 100% {
            box-shadow:
              0 5px 16px rgba(66,121,191,.09);
          }
          50% {
            box-shadow:
              0 0 0 4px rgba(96,165,250,.18),
              0 12px 30px rgba(65,128,205,.26);
          }
        }

        .vid-card-shake {
          animation: vidCardShake .65s ease-in-out;
        }

        .vid-card-glow {
          animation: vidCardGlow .8s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .vid-card-shake,
          .vid-card-glow {
            animation: none !important;
          }
        }
      `}</style>

      {/* NOTIFICATION */}
      {notice &&
        createPortal(
          <div className="fixed left-3 right-3 top-4 z-[11000] flex items-center gap-3 rounded-xl border border-[#bfd8f7] bg-white px-4 py-3 text-sm font-medium text-[#173f74] shadow-xl sm:left-auto sm:right-6 sm:max-w-md">
            <CheckCircle2
              size={19}
              className="shrink-0 text-[#478bd7]"
            />

            <span className="min-w-0 flex-1">
              {notice}
            </span>

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
        <div className="min-w-0" />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#478bd7] px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3579c5] sm:flex-none sm:text-sm"
          >
            <Plus size={18} />
            Add Booking
          </button>
        </div>
      </div>

      {/* ANIMATED STATISTICS */}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            index={index}
          />
        ))}
      </div>

      {/* PAYMENT SUMMARY */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          {
            title: "Total Package Value",
            value: totalAmount,
          },
          {
            title: "Total Advance Collected",
            value: totalAdvance,
          },
          {
            title: "Remaining Balance",
            value: totalPending,
          },
        ].map((item, index) => (
          <div
            key={item.title}
            className={`rounded-2xl border border-[#c8dffb] bg-gradient-to-br p-4 shadow-sm ${
              index % 2 === 0
                ? "from-[#d9eaff] to-[#f0f7ff]"
                : "from-[#cde3ff] to-[#eaf4ff]"
            }`}
          >
            <p className="text-xs font-semibold text-[#5477a1]">
              {item.title}
            </p>

            <p className="mt-2 truncate whitespace-nowrap text-lg font-extrabold text-[#173f74] sm:text-xl">
              {money(item.value)}
            </p>
          </div>
        ))}
      </div>

      {/* BOOKINGS DIRECTORY */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#c8dffb] bg-[#eaf4ff] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#c5ddfb] bg-gradient-to-r from-[#c5ddfb] to-[#e3f0ff] p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#173f74]">
              Videography Bookings
            </h2>

            <p className="mt-1 text-xs text-[#6083ae]">
              {filteredBookings.length} of{" "}
              {bookings.length} bookings
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="relative w-full sm:w-[240px]">
              <Search
                size={17}
                className="absolute left-3 top-3.5 text-[#7893b3]"
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
                options={[
                  "All Events",
                  ...EVENT_TYPES,
                ]}
                onChange={(value) =>
                  setEventFilter(
                    value === "All Events"
                      ? "All"
                      : value
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
                options={[
                  "All Status",
                  ...STATUSES,
                ]}
                onChange={(value) =>
                  setStatusFilter(
                    value === "All Status"
                      ? "All"
                      : value
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
                className="mx-auto text-[#9abce5]"
              />

              <p className="mt-3 text-sm text-[#7893b3]">
                No videography bookings found.
              </p>
            </div>
          ) : (
            filteredBookings.map((item) => (
              <article
                key={item.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-[#c8dffb] bg-[#e8f2ff] shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#c8dffb] bg-gradient-to-r from-[#c8e0ff] to-[#e3f0ff] p-4">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#245c9c]">
                      <Film size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold text-[#173f74]">
                        {item.customer}
                      </h3>

                      <p className="mt-1 break-all text-[11px] text-[#7893b3]">
                        {item.id}
                      </p>

                      <div className="mt-2">
                        <StatusBadge
                          status={item.status}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded-lg bg-white/85 p-2 text-blue-700"
                      aria-label="Edit booking"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteBooking(item)
                      }
                      className="rounded-lg bg-red-50 p-2 text-red-600"
                      aria-label="Delete booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4">
                  {[
                    ["Event Type", item.event],
                    [
                      "Event Date",
                      formatDate(item.date),
                    ],
                    ["Phone", item.phone],
                    ["Venue", item.venue],
                    [
                      "Package",
                      item.packageName,
                    ],
                    [
                      "Videographer",
                      item.videographer ||
                        "Not Assigned",
                    ],
                    [
                      "Total Amount",
                      money(item.amount),
                    ],
                    [
                      "Advance",
                      money(item.advance),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="min-w-0 rounded-xl bg-white/85 p-3"
                    >
                      <MobileDetail
                        label={label}
                        value={value}
                      />
                    </div>
                  ))}

                  <div className="col-span-2 rounded-xl border border-[#bcd8fb] bg-[#d5e7ff] p-3">
                    <p className="text-xs font-medium text-[#5477a1]">
                      Remaining Balance
                    </p>

                    <p className="mt-1 text-base font-bold text-[#173f74]">
                      {money(balanceOf(item))}
                    </p>
                  </div>

                  {item.notes && (
                    <div className="col-span-2 rounded-xl bg-white/85 p-3">
                      <MobileDetail
                        label="Additional Notes"
                        value={item.notes}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-[#c8dffb] bg-[#deedff] p-4">
                  <p className="mb-2 text-xs font-semibold text-[#45688e]">
                    Booking Status
                  </p>

                  <CustomDropdown
                    value={
                      item.status || "Upcoming"
                    }
                    options={STATUSES}
                    onChange={(status) =>
                      changeStatus(
                        item.id,
                        status
                      )
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
            <thead className="bg-[#c5ddfb]">
              <tr className="text-[11px] font-bold uppercase tracking-wide text-[#45688e]">
                <th className="px-3 py-4">
                  Customer
                </th>
                <th className="px-3 py-4">
                  Event Type
                </th>
                <th className="px-3 py-4">
                  Event Date
                </th>
                <th className="px-3 py-4">
                  Venue
                </th>
                <th className="px-3 py-4">
                  Package
                </th>
                <th className="px-3 py-4">
                  Total
                </th>
                <th className="px-3 py-4">
                  Balance
                </th>
                <th className="px-3 py-4">
                  Status
                </th>
                <th className="px-3 py-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#d1e4fb]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center text-sm text-[#7893b3]"
                  >
                    No videography bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map(
                  (item, index) => (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-[#d6e9ff] ${
                        index % 2 === 0
                          ? "bg-[#eaf4ff]"
                          : "bg-[#deedff]"
                      }`}
                    >
                      <td className="px-3 py-4">
                        <p className="font-semibold text-[#173f74]">
                          {item.customer}
                        </p>

                        <p className="mt-1 text-xs text-[#7893b3]">
                          {item.phone}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <span className="inline-block max-w-[130px] break-words rounded-lg bg-white/80 px-2 py-1.5 text-xs font-medium text-[#245c9c]">
                          {item.event}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-xs text-[#45688e]">
                        {formatDate(item.date)}
                      </td>

                      <td className="px-3 py-4 text-sm text-[#45688e]">
                        {item.venue || "—"}
                      </td>

                      <td className="px-3 py-4 text-xs text-[#45688e]">
                        {item.packageName}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-[#173f74]">
                        {money(item.amount)}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-[#173f74]">
                        {money(balanceOf(item))}
                      </td>

                      <td className="min-w-[145px] px-3 py-4">
                        <div className="mb-2">
                          <StatusBadge
                            status={item.status}
                          />
                        </div>

                        <CustomDropdown
                          value={
                            item.status ||
                            "Upcoming"
                          }
                          options={STATUSES}
                          onChange={(status) =>
                            changeStatus(
                              item.id,
                              status
                            )
                          }
                        />
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(item)
                            }
                            className="rounded-lg p-2 text-blue-700 hover:bg-white/80"
                            aria-label="Edit booking"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteBooking(item)
                            }
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            aria-label="Delete booking"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#c8dffb] bg-[#e3f0ff] px-4 py-4 text-xs text-[#6083ae] sm:px-5">
          Showing {filteredBookings.length} of{" "}
          {bookings.length} bookings
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07172d]/70 p-2 backdrop-blur-[3px] sm:p-5"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
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
              <div className="flex shrink-0 items-center justify-between gap-3 bg-gradient-to-r from-[#478bd7] to-[#82b5ef] px-4 py-4 text-white sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
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

                    <p className="mt-1 text-[11px] text-white/85">
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
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain bg-[#f5f9ff] px-4 py-5 sm:px-6">

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
                          updateForm(
                            "customer",
                            event.target.value
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label="Phone Number"
                      required
                    >
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
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
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

                    <FormField
                      label="Event Type"
                      required
                    >
                      <CustomDropdown
                        value={form.event}
                        options={
                          EVENT_TYPES.includes(
                            form.event
                          ) || !form.event
                            ? EVENT_TYPES
                            : [
                                form.event,
                                ...EVENT_TYPES,
                              ]
                        }
                        onChange={(value) =>
                          updateForm(
                            "event",
                            value
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label="Event Date"
                      required
                    >
                      <input
                        type="date"
                        required
                        className={inputClass}
                        value={form.date}
                        onChange={(event) =>
                          updateForm(
                            "date",
                            event.target.value
                          )
                        }
                      />
                    </FormField>

                    <FormField label="Venue / Location">
                      <CustomDropdown
                        value={form.venue}
                        options={
                          VENUES.includes(
                            form.venue
                          )
                            ? VENUES
                            : [
                                form.venue,
                                ...VENUES,
                              ]
                        }
                        onChange={(value) =>
                          updateForm(
                            "venue",
                            value
                          )
                        }
                      />
                    </FormField>

                    <FormField label="Videographer">
                      <CustomDropdown
                        value={form.videographer}
                        options={
                          VIDEOGRAPHERS.includes(
                            form.videographer
                          ) || !form.videographer
                            ? VIDEOGRAPHERS
                            : [
                                form.videographer,
                                ...VIDEOGRAPHERS,
                              ]
                        }
                        onChange={(value) =>
                          updateForm(
                            "videographer",
                            value
                          )
                        }
                      />
                    </FormField>

                    <FormField label="Booking Status">
                      <CustomDropdown
                        value={form.status}
                        options={STATUSES}
                        onChange={(value) =>
                          updateForm(
                            "status",
                            value
                          )
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

                    <FormField
                      label="Total Amount (₹)"
                      required
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className={inputClass}
                        placeholder="Enter total amount"
                        value={form.amount}
                        onChange={(event) =>
                          updateForm(
                            "amount",
                            event.target.value
                          )
                        }
                      />
                    </FormField>

                    <FormField
                      label="Advance Paid (₹)"
                      required
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className={inputClass}
                        placeholder="Enter advance amount"
                        value={form.advance}
                        onChange={(event) =>
                          updateForm(
                            "advance",
                            event.target.value
                          )
                        }
                      />
                    </FormField>

                    <div className="col-span-full rounded-xl border border-[#c8dffb] bg-[#dcecff] p-4">
                      <p className="text-xs font-semibold text-[#5477a1]">
                        Remaining Balance
                      </p>

                      <p className="mt-1 text-xl font-extrabold text-[#173f74]">
                        {money(
                          Math.max(
                            0,
                            Number(
                              form.amount || 0
                            ) -
                              Number(
                                form.advance || 0
                              )
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
                          updateForm(
                            "notes",
                            event.target.value
                          )
                        }
                        placeholder="Enter shoot requirements, equipment, delivery notes..."
                        className="block w-full min-w-0 resize-y rounded-xl border border-[#c9def8] bg-white px-3.5 py-3 text-sm text-[#173f74] outline-none focus:border-[#6ca4ed] focus:ring-2 focus:ring-blue-100"
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
                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#d8e8fb] bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="w-full rounded-xl border border-[#c8dffb] bg-[#eef6ff] px-6 py-3 text-sm font-semibold text-[#45688e] hover:bg-[#deedff] sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#478bd7] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3579c5] sm:w-auto"
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