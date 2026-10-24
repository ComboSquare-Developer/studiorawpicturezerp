
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
  Filter,
  Sparkles,
  ArrowUpRight,
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

/* ORIGINAL DATA - UNCHANGED */

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
  "Complete Wedding Package",
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

const dummyBookings = Array.from(
  { length: 20 },
  (_, index) => ({
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
    photographer:
      photographers[index % photographers.length],
    package: packages[index % packages.length],
    status: statuses[index % statuses.length],
    createdAt: addDays(-index - 1),
  })
);

const emptyForm = {
  customer: "",
  phone: "",
  event: "",
  date: "",
  time: "10:00",
  location: "Nagercoil",
  photographer: "Not Assigned",
  package: "Basic Photography",
  status: "Confirmed",
};

const statusStyle = {
  Confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Completed:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusDot = {
  Confirmed: "bg-blue-500",
  Pending: "bg-amber-500",
  Completed: "bg-emerald-500",
  Cancelled: "bg-rose-500",
};

const calendarEventStyle = {
  Confirmed: "border-blue-100 bg-blue-50 text-blue-700",
  Pending: "border-amber-100 bg-amber-50 text-amber-700",
  Completed:
    "border-emerald-100 bg-emerald-50 text-emerald-700",
  Cancelled: "border-rose-100 bg-rose-50 text-rose-700",
};

const inputClass =
  "block h-11 w-full min-w-0 rounded-xl border border-[#dce4ef] bg-white px-3.5 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100";

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

const formatTime = (value) => {
  if (!value) return "—";

  const [hours, minutes] = String(value)
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  return new Date(
    2000,
    0,
    1,
    hours,
    minutes
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function loadBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const existing = Array.isArray(parsed) ? parsed : [];

    if (
      localStorage.getItem(DEMO_SEED_KEY) === "true"
    ) {
      return existing;
    }

    const existingIds = new Set(
      existing.map((item) => item.id)
    );

    const newDemo = dummyBookings.filter(
      (item) => !existingIds.has(item.id)
    );

    const merged = [...existing, ...newDemo];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(merged)
    );

    localStorage.setItem(DEMO_SEED_KEY, "true");

    return merged;
  } catch {
    return dummyBookings;
  }
}

/* SOUND */

let audioContext;

function playSound(type = "click") {
  try {
    if (
      localStorage.getItem(SOUND_KEY) !== "true"
    ) {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

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

    (notes[type] || notes.click).forEach(
      (frequency, index) => {
        const oscillator =
          audioContext.createOscillator();

        const gain = audioContext.createGain();

        const start =
          audioContext.currentTime +
          index * 0.075;

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
          frequency,
          start
        );

        gain.gain.setValueAtTime(
          0.0001,
          start
        );

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
    // Optional sound.
  }
}

/* CUSTOM DROPDOWN */

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
      const rect =
        buttonRef.current?.getBoundingClientRect();

      if (!rect) return;

      const availableBelow =
        window.innerHeight - rect.bottom;

      const menuHeight = Math.min(
        options.length * 43 + 12,
        230
      );

      const showAbove =
        availableBelow < menuHeight + 12 &&
        rect.top > availableBelow;

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
              rect.top - menuHeight - 5
            )
          : rect.bottom + 5,
        maxHeight: Math.max(
          70,
          Math.min(
            230,
            showAbove
              ? rect.top - 16
              : window.innerHeight -
                  rect.bottom -
                  16
          )
        ),
        zIndex: 9999,
      });
    };

    const handleOutside = (event) => {
      if (
        !buttonRef.current?.contains(
          event.target
        ) &&
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

    positionMenu();

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
      positionMenu
    );

    window.addEventListener(
      "scroll",
      positionMenu,
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
        positionMenu
      );

      window.removeEventListener(
        "scroll",
        positionMenu,
        true
      );
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
        className="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#e1e8f2] bg-white px-3.5 text-left text-sm font-medium text-[#10264d] transition-all duration-300 hover:border-blue-300 hover:shadow-[0_3px_12px_rgba(40,85,145,0.07)] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 transition-transform duration-300 ${
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
            className="animate-[bookingFade_.2s_ease-out] overflow-y-auto overscroll-contain rounded-xl border border-[#dce4ef] bg-white p-1 shadow-[0_15px_45px_rgba(16,38,77,0.15)]"
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
      <label className="mb-1.5 block text-xs font-semibold text-[#344767]">
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

function FormSectionTitle({
  icon: Icon,
  title,
}) {
  return (
    <div className="col-span-full flex items-center gap-2.5 border-b border-[#edf1f6] pb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#17477e]">
        <Icon size={17} />
      </div>

      <h4 className="text-sm font-bold text-[#10264d]">
        {title}
      </h4>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        statusStyle[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          statusDot[status] || "bg-slate-400"
        }`}
      />

      {status || "—"}
    </span>
  );
}

/* ANIMATED STAT CARD */

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  surface,
  delay = 0,
}) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative min-w-0 overflow-hidden rounded-[20px] border p-4 shadow-[0_4px_20px_rgba(15,40,80,0.035)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,40,80,0.09)] sm:p-5 ${surface} animate-[bookingRise_.55s_ease-out_both]`}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {title}
          </p>

          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 ${color}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#648fcb]/35 transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );
}

function MobileDetail({
  label,
  value,
  fullWidth = false,
}) {
  return (
    <div
      className={`min-w-0 ${
        fullWidth ? "col-span-2" : ""
      }`}
    >
      <p className="text-[11px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
        {value === "" || value == null
          ? "—"
          : value}
      </p>
    </div>
  );
}

/* MAIN COMPONENT */

export default function BookingCalendar() {
  const [bookings, setBookings] =
    useState(loadBookings);

  const [month, setMonth] = useState(
    () =>
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
  );

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  const [soundEnabled, setSoundEnabled] =
    useState(
      () =>
        localStorage.getItem(SOUND_KEY) ===
        "true"
    );

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(bookings)
    );
  }, [bookings]);

  useEffect(() => {
    const syncSound = (event) => {
      if (event.key === SOUND_KEY) {
        setSoundEnabled(
          event.newValue === "true"
        );
      }
    };

    window.addEventListener(
      "storage",
      syncSound
    );

    return () =>
      window.removeEventListener(
        "storage",
        syncSound
      );
  }, []);

  useEffect(() => {
    if (!showForm) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    requestAnimationFrame(() =>
      firstInputRef.current?.focus()
    );

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
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
  }, [showForm]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (error) setError("");
  };

  const openBooking = (date = "") => {
    previousFocusRef.current =
      document.activeElement;

    setEditingId(null);
    setForm({ ...emptyForm, date });
    setError("");
    setShowForm(true);
    playSound("open");
  };

  const editBooking = (booking) => {
    previousFocusRef.current =
      document.activeElement;

    setEditingId(booking.id);

    setForm({
      ...emptyForm,
      ...booking,
    });

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

    const customer = String(
      form.customer || ""
    ).trim();

    const phone = String(
      form.phone || ""
    ).trim();

    if (
      !customer ||
      !/^\d{10}$/.test(phone)
    ) {
      setError(
        "Enter customer name and valid 10-digit phone number."
      );

      playSound("error");
      return;
    }

    if (!form.date || !form.time) {
      setError(
        "Please select booking date and time."
      );

      playSound("error");
      return;
    }

    if (editingId) {
      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === editingId
            ? {
                ...booking,
                ...form,
                customer,
                phone,
              }
            : booking
        )
      );
    } else {
      const booking = {
        ...form,
        id:
          globalThis.crypto?.randomUUID?.() ||
          `BOOK-${Date.now()}`,
        customer,
        phone,
        createdAt: dateKey(new Date()),
      };

      setBookings((previous) => [
        booking,
        ...previous,
      ]);
    }

    playSound("save");

    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const deleteBooking = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this booking?"
      )
    ) {
      return;
    }

    setBookings((previous) =>
      previous.filter(
        (booking) => booking.id !== id
      )
    );

    if (editingId === id) {
      closeForm();
    }

    playSound("delete");
  };

  const changeStatus = (id, status) => {
    setBookings((previous) =>
      previous.map((booking) =>
        booking.id === id
          ? { ...booking, status }
          : booking
      )
    );

    playSound("select");
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
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matchesSearch &&
        (filter === "All" ||
          booking.status === filter)
      );
    });
  }, [bookings, search, filter]);

  const upcoming = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            String(booking.date || "") >=
              dateKey(new Date()) &&
            ![
              "Cancelled",
              "Completed",
            ].includes(booking.status)
        )
        .sort(
          (a, b) =>
            String(a.date || "").localeCompare(
              String(b.date || "")
            ) ||
            String(a.time || "").localeCompare(
              String(b.time || "")
            )
        )
        .slice(0, 6),
    [bookings]
  );

  const monthBookings = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      const key = String(
        booking.date || ""
      ).slice(0, 10);

      if (!key) return;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(booking);
    });

    return map;
  }, [bookings]);

  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1
  );

  const totalDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const cells = [
    ...Array(firstDay.getDay()).fill(null),
    ...Array.from(
      { length: totalDays },
      (_, index) => index + 1
    ),
  ];

  const calendarCells = [
    ...cells,
    ...Array(
      (7 - (cells.length % 7)) % 7
    ).fill(null),
  ];

  const changeMonth = (offset) => {
    playSound("click");

    setMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + offset,
          1
        )
    );

    setSelectedDate("");
  };

  const monthPrefix = `${month.getFullYear()}-${String(
    month.getMonth() + 1
  ).padStart(2, "0")}`;

  const currentMonthCount = bookings.filter(
    (booking) =>
      String(booking.date || "").startsWith(
        monthPrefix
      )
  ).length;

  const selectedDayBookings = selectedDate
    ? monthBookings.get(selectedDate) || []
    : [];

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarDays,
      color: "bg-blue-100 text-blue-700",
      surface: "border-blue-100 bg-[#f2f7ff]",
    },
    {
      title: "Confirmed",
      value: bookings.filter(
        (b) => b.status === "Confirmed"
      ).length,
      icon: CalendarCheck2,
      color: "bg-indigo-100 text-indigo-700",
      surface: "border-indigo-100 bg-[#f5f5ff]",
    },
    {
      title: "Pending",
      value: bookings.filter(
        (b) => b.status === "Pending"
      ).length,
      icon: Clock3,
      color: "bg-amber-100 text-amber-700",
      surface: "border-amber-100 bg-[#fffaf0]",
    },
    {
      title: "Completed",
      value: bookings.filter(
        (b) => b.status === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-700",
      surface: "border-emerald-100 bg-[#f0fcf7]",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-[#f7f9fc] px-3 py-5 text-slate-800 sm:px-5 lg:px-7 lg:py-7">
      <style>{`
        @keyframes bookingRise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bookingFade {
          from {
            opacity: 0;
            transform: scale(.985);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bookingPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(57, 105, 177, .18);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(57, 105, 177, 0);
          }
        }

        @keyframes bookingShine {
          from {
            transform: translateX(-150%);
          }
          to {
            transform: translateX(250%);
          }
        }

        .booking-day {
          transition:
            transform .28s ease,
            border-color .28s ease,
            background .28s ease,
            box-shadow .28s ease;
        }

        .booking-day:hover {
          transform: translateY(-3px);
          border-color: #a8c4e9;
          box-shadow: 0 9px 22px rgba(31, 73, 132, .09);
          z-index: 2;
        }

        .booking-event {
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .booking-event:hover {
          transform: translateX(3px);
          box-shadow: 0 3px 9px rgba(30, 70, 130, .07);
        }

        .booking-premium-card {
          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .booking-premium-card:hover {
          transform: translateY(-4px);
          border-color: #bfd3ef;
          box-shadow: 0 12px 30px rgba(24, 59, 110, .08);
        }

        @media (prefers-reduced-motion: reduce) {
          .booking-day,
          .booking-event,
          .booking-premium-card {
            animation: none !important;
            transition: none !important;
          }

          .booking-day:hover,
          .booking-premium-card:hover {
            transform: none;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {/* <Sparkles
              size={14}
              className="text-[#6587b7]"
            /> */}

            {/* <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#8195b0]">
              Photography Operations
            </p> */}
          </div>

          {/* <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Booking & Calendar
          </h1>

          <p className="mt-2 text-xs text-slate-500 sm:text-sm">
            Manage photography bookings, schedules and assignments.
          </p> */}
        </div>

        <button
          type="button"
          onClick={() => openBooking()}
          className="group relative flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#102f62] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_16px_rgba(16,47,98,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1b467e] hover:shadow-lg"
        >
          <Plus
            size={18}
            className="transition-transform duration-300 group-hover:rotate-90"
          />
          New Booking
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            delay={index * 90}
          />
        ))}
      </div>

    
{/* ================= PREMIUM FULL WIDTH CALENDAR ================= */}
<section className="sr-calendar relative isolate min-w-0 overflow-hidden rounded-[28px] border border-[#dce6f4] bg-white shadow-[0_14px_55px_rgba(23,57,104,0.08)]">
  <style>{`
    @keyframes srCalendarEnter {
      from { opacity: 0; transform: translateY(22px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes srDayEnter {
      from { opacity: 0; transform: translateY(9px) scale(.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes srSelectedGlow {
      0%, 100% { box-shadow: 0 5px 18px rgba(54, 105, 176, .08); }
      50% { box-shadow: 0 8px 28px rgba(54, 105, 176, .16); }
    }

    @keyframes srTodayPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(46, 105, 185, .16); }
      50% { box-shadow: 0 0 0 6px rgba(46, 105, 185, 0); }
    }

    @keyframes srShine {
      from { transform: translateX(-160%) skewX(-20deg); }
      to { transform: translateX(260%) skewX(-20deg); }
    }

    @keyframes srDetailsEnter {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .sr-calendar {
      animation: srCalendarEnter .65s ease-out both;
    }

    .sr-calendar-day {
      animation: srDayEnter .42s ease-out both;
      transition:
        transform .28s cubic-bezier(.2,.8,.2,1),
        border-color .28s ease,
        background .28s ease,
        box-shadow .28s ease;
    }

    .sr-calendar-day:hover {
      transform: translateY(-4px);
      border-color: #a9c5eb;
      box-shadow: 0 10px 24px rgba(35, 81, 145, .10);
      z-index: 2;
    }

    .sr-calendar-selected {
      animation: srDayEnter .42s ease-out both,
                 srSelectedGlow 3s ease-in-out infinite;
    }

    .sr-calendar-today {
      animation: srTodayPulse 3s ease-in-out infinite;
    }

    .sr-calendar-event {
      transition: transform .25s ease, filter .25s ease;
    }

    .sr-calendar-event:hover {
      transform: translateX(3px);
      filter: saturate(1.2);
    }

    .sr-calendar-action {
      transition: transform .25s ease, box-shadow .25s ease;
    }

    .sr-calendar-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(29, 71, 131, .13);
    }

    .sr-calendar-details {
      animation: srDetailsEnter .35s ease-out both;
    }

    .sr-calendar-booking {
      transition: transform .3s ease, box-shadow .3s ease;
    }

    .sr-calendar-booking:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(32, 70, 122, .10);
    }

    .sr-calendar-shine {
      position: relative;
      overflow: hidden;
    }

    .sr-calendar-shine::after {
      content: "";
      position: absolute;
      inset: 0;
      width: 35%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,.36),
        transparent
      );
      transform: translateX(-160%) skewX(-20deg);
      pointer-events: none;
    }

    .sr-calendar-shine:hover::after {
      animation: srShine .85s ease-out;
    }

    @media (prefers-reduced-motion: reduce) {
      .sr-calendar,
      .sr-calendar-day,
      .sr-calendar-selected,
      .sr-calendar-today,
      .sr-calendar-details {
        animation: none !important;
      }
      .sr-calendar-day:hover,
      .sr-calendar-booking:hover {
        transform: none;
      }
    }
  `}</style>

  {/* PREMIUM TOP ACCENT */}
  <div className="h-[4px] w-full bg-gradient-to-r from-[#bdd6fb] via-[#b5b2ed] to-[#c6e9e0]" />

  {/* HEADER */}
  <div className="relative flex flex-col gap-5 border-b border-[#e9eef7] bg-gradient-to-r from-[#f8fbff] via-white to-[#faf8ff] px-4 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex min-w-0 items-center gap-4">
      <div className="sr-calendar-shine flex h-14 w-14 shrink-0 items-center justify-center rounded-[19px] border border-[#d9e6fa] bg-[#eaf3ff] text-[#285b9c] shadow-[0_5px_15px_rgba(40,91,156,0.07)]">
        <CalendarDays size={25} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7198d6]" />
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8298b7]">
            Studio Schedule
          </p>
        </div>

        <h2 className="text-xl font-black tracking-tight text-[#10264d] sm:text-[26px]">
          {month.toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <p className="mt-1 text-xs text-[#8290a5]">
          Your monthly photography booking calendar
        </p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3 rounded-2xl border border-[#e0e9f7] bg-white px-4 py-2.5 shadow-[0_3px_12px_rgba(22,53,96,0.035)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf4ff] text-[#3869a9]">
          <CalendarCheck2 size={18} />
        </div>

        <div>
          <p className="text-lg font-black leading-none text-[#10264d]">
            {currentMonthCount}
          </p>
          <p className="mt-1 text-[10px] font-medium text-[#8a9bb0]">
            Monthly Bookings
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-[#e4eaf4] bg-white p-1.5 shadow-[0_3px_12px_rgba(22,53,96,0.035)]">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
          className="sr-calendar-action flex h-9 w-9 items-center justify-center rounded-xl text-[#536a89] hover:bg-[#edf4ff] hover:text-[#285b9c]"
        >
          <ChevronLeft size={19} />
        </button>

        <button
          type="button"
          onClick={() => {
            playSound("click");
            const today = new Date();
            setMonth(
              new Date(today.getFullYear(), today.getMonth(), 1)
            );
            setSelectedDate(dateKey(today));
          }}
          className="sr-calendar-action h-9 rounded-xl bg-[#edf4ff] px-4 text-xs font-extrabold text-[#315e99] hover:bg-[#e1edff]"
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
          className="sr-calendar-action flex h-9 w-9 items-center justify-center rounded-xl text-[#536a89] hover:bg-[#edf4ff] hover:text-[#285b9c]"
        >
          <ChevronRight size={19} />
        </button>
      </div>
    </div>
  </div>

  {/* STATUS LEGEND */}
  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[#edf1f7] bg-white px-4 py-4 sm:px-7">
    {statuses.map((status) => (
      <div
        key={status}
        className="flex items-center gap-2 text-[11px] font-semibold text-[#657992]"
      >
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span
            className={`absolute h-2.5 w-2.5 rounded-full ${
              statusDot[status] || "bg-slate-400"
            }`}
          />
        </span>
        {status}
      </div>
    ))}

    <span className="ml-auto hidden items-center gap-1.5 text-[11px] font-medium text-[#9aabc0] md:flex">
      <CalendarDays size={13} />
      Select a date to view events
    </span>
  </div>

  {/* FULL WIDTH HORIZONTAL CALENDAR */}
  <div className="w-full min-w-0 bg-[#fcfdff] p-2.5 sm:p-5 lg:p-6">
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 lg:gap-3">
      {[
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
      ].map((day) => (
        <div
          key={day}
          className="rounded-xl border border-[#e8edf5] bg-white py-3.5 text-center text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8195b0] shadow-[0_2px_8px_rgba(20,50,90,0.02)] sm:text-xs"
        >
          {day}
        </div>
      ))}

      {calendarCells.map((day, index) => {
        if (!day) {
          return (
            <div
              key={`empty-${index}`}
              className="min-h-[80px] rounded-2xl border border-dashed border-[#edf1f7] bg-[#f9fbfe] sm:min-h-[125px] lg:min-h-[155px]"
            />
          );
        }

        const date = dateKey(
          new Date(
            month.getFullYear(),
            month.getMonth(),
            day
          )
        );

        const dayBookings = monthBookings.get(date) || [];
        const isToday = date === dateKey(new Date());
        const isSelected = selectedDate === date;

        return (
          <button
            key={date}
            type="button"
            onClick={() => {
              setSelectedDate(date);
              playSound("click");
            }}
            aria-label={`View bookings for ${formatDate(date)}`}
            aria-pressed={isSelected}
            style={{
              animationDelay: `${Math.min(index * 12, 240)}ms`,
            }}
            className={`sr-calendar-day relative flex min-h-[80px] min-w-0 flex-col overflow-hidden rounded-2xl border p-1.5 text-left sm:min-h-[125px] sm:p-3 lg:min-h-[155px] lg:p-3.5 ${
              isSelected
                ? "sr-calendar-selected border-[#8eafe1] bg-[#eff6ff]"
                : isToday
                ? "border-[#b5cdf0] bg-[#f5f9ff]"
                : dayBookings.length > 0
                ? "border-[#dce7f6] bg-white"
                : "border-[#e9eef5] bg-white"
            }`}
          >
            {/* DAY HEADER */}
            <div className="flex w-full items-center justify-between gap-1">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold sm:h-9 sm:w-9 sm:text-sm ${
                  isToday
                    ? "sr-calendar-today bg-[#214c88] text-white"
                    : isSelected
                    ? "bg-[#d8e8ff] text-[#25528e]"
                    : "bg-[#f4f7fb] text-[#455b79]"
                }`}
              >
                {day}
              </span>

              {dayBookings.length > 0 && (
                <span className="rounded-lg border border-[#dce8fa] bg-[#edf5ff] px-1.5 py-1 text-[9px] font-extrabold text-[#3c6fae] sm:px-2 sm:text-[10px]">
                  {dayBookings.length}
                </span>
              )}
            </div>

            {/* MOBILE STATUS DOTS */}
            {dayBookings.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                {dayBookings.slice(0, 4).map((booking) => (
                  <span
                    key={booking.id}
                    className={`h-1.5 w-1.5 rounded-full ${
                      statusDot[booking.status] || "bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* BOOKING EVENTS */}
            <div className="mt-3 hidden w-full min-w-0 space-y-1.5 sm:block">
              {dayBookings.slice(0, 2).map((booking) => (
                <div
                  key={booking.id}
                  title={`${booking.customer} - ${booking.event}`}
                  className={`sr-calendar-event flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-[10px] font-bold ${
                    calendarEventStyle[booking.status] ||
                    "border-slate-100 bg-slate-50 text-slate-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      statusDot[booking.status] || "bg-slate-400"
                    }`}
                  />

                  <span className="min-w-0 truncate">
                    {booking.customer}
                  </span>
                </div>
              ))}

              {dayBookings.length > 2 && (
                <p className="pl-1 text-[10px] font-bold text-[#6686b2]">
                  +{dayBookings.length - 2} more bookings
                </p>
              )}
            </div>

            {/* TODAY LABEL */}
            {isToday && (
              <span className="absolute bottom-2 right-2 hidden rounded-md bg-[#e4efff] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#396ba8] sm:block">
                Today
              </span>
            )}

            {/* SELECTED BOTTOM ACCENT */}
            {isSelected && (
              <div className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full bg-[#7fa7df]" />
            )}
          </button>
        );
      })}
    </div>
  </div>

  {/* SELECTED DAY DETAILS */}
  {selectedDate && (
    <div
      key={selectedDate}
      className="sr-calendar-details border-t border-[#e5edf7] bg-gradient-to-b from-[#f6faff] to-white px-4 py-6 sm:px-7"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#dce8fa] bg-white text-[#3569a9]">
            <CalendarCheck2 size={20} />
          </div>

          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#91a4bd]">
              Selected Schedule
            </p>

            <h3 className="text-base font-extrabold text-[#10264d] sm:text-lg">
              {formatDate(selectedDate)}
            </h3>

            <p className="mt-1 text-xs text-[#91a0b4]">
              {selectedDayBookings.length} booking
              {selectedDayBookings.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openBooking(selectedDate)}
            className="sr-calendar-action flex items-center gap-2 rounded-xl bg-[#173c74] px-4 py-3 text-xs font-bold text-white hover:bg-[#25558f]"
          >
            <Plus size={16} />
            Add Booking
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate("")}
            aria-label="Close selected date"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1e8f2] bg-white text-[#8090a6] hover:bg-slate-50"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {selectedDayBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8e4f3] bg-white px-5 py-10 text-center">
          <CalendarDays
            size={28}
            className="mx-auto text-[#b3c4dc]"
          />
          <p className="mt-3 text-sm font-semibold text-[#6f819a]">
            No bookings scheduled for this date
          </p>
          <p className="mt-1 text-xs text-[#a0aec0]">
            You can create a new photography booking.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {selectedDayBookings.map((booking, index) => {
            const accents = [
              {
                border: "border-[#dce9fa]",
                bg: "bg-[#f5f9ff]",
                icon: "bg-[#e2eeff] text-[#386da9]",
              },
              {
                border: "border-[#e5e0f8]",
                bg: "bg-[#faf8ff]",
                icon: "bg-[#ebe5ff] text-[#785eb3]",
              },
              {
                border: "border-[#dcefe7]",
                bg: "bg-[#f6fcf9]",
                icon: "bg-[#def5e9] text-[#348565]",
              },
            ];

            const accent = accents[index % accents.length];

            return (
              <article
                key={booking.id}
                className={`sr-calendar-booking overflow-hidden rounded-2xl border ${accent.border} bg-white shadow-[0_4px_15px_rgba(24,61,111,0.035)]`}
              >
                <div className={`${accent.bg} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}
                      >
                        <Camera size={18} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="break-words text-sm font-extrabold text-[#10264d]">
                          {booking.customer}
                        </h4>

                        <p className="mt-1 break-words text-xs text-[#75869d]">
                          {booking.event}
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={booking.status} />
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-[#687b94]">
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={14} className="text-[#5d83b4]" />
                      {formatTime(booking.time)}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#5d83b4]" />
                      {booking.location || "—"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => editBooking(booking)}
                    className="mt-4 flex w-full items-center justify-between border-t border-[#edf1f7] pt-3 text-xs font-extrabold text-[#396ba8] transition hover:text-[#173c74]"
                  >
                    <span className="flex items-center gap-1.5">
                      <Pencil size={14} />
                      Edit Booking
                    </span>

                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  )}

  {/* FOOTER */}
  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1f7] bg-[#fbfcff] px-4 py-4 sm:px-7">
    <p className="text-[11px] font-medium text-[#91a1b6]">
      Select any date to view or manage bookings
    </p>

    <p className="text-[11px] font-extrabold tracking-wide text-[#7391b7]">
      STUDIO RAW PICTUREZ
    </p>
  </div>
</section>
    
{/* UPCOMING SHOOTS - DUAL TONE ANIMATED CARDS */}
<section className="min-w-0 overflow-hidden rounded-[22px] border border-[#e3eaf4] bg-white p-4 shadow-[0_6px_25px_rgba(22,53,96,0.035)] sm:p-6">
  <style>{`
    @keyframes shootFloat {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-6px);
      }
    }

    @keyframes shootReveal {
      from {
        opacity: 0;
        transform: translateY(18px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .shoot-card {
      animation: shootReveal .6s ease-out both,
                 shootFloat 5s ease-in-out infinite;
      animation-delay:
        var(--reveal-delay),
        var(--float-delay);
      transition:
        box-shadow .35s ease,
        border-color .35s ease;
    }

    .shoot-card:hover {
      animation-play-state: paused;
      border-color: #b7cbed;
      box-shadow: 0 16px 35px rgba(27, 66, 120, .12);
    }

    @media (prefers-reduced-motion: reduce) {
      .shoot-card {
        animation: none;
      }
    }
  `}</style>

  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7c93b0]">
          Photography Schedule
        </span>
      </div>

      <h2 className="text-lg font-extrabold text-[#10264d] sm:text-xl">
        Upcoming Shoots
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        Next scheduled photography events
      </p>
    </div>

    <span className="rounded-xl border border-blue-100 bg-[#eff6ff] px-4 py-2 text-xs font-bold text-blue-700">
      {upcoming.length} Upcoming
    </span>
  </div>

  {upcoming.length === 0 ? (
    <div className="py-12 text-center">
      <CalendarDays
        size={30}
        className="mx-auto text-slate-300"
      />
      <p className="mt-3 text-sm text-slate-400">
        No upcoming shoots
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-5 pb-3 pt-2 sm:grid-cols-2 xl:grid-cols-3">
      {upcoming.map((booking, index) => {
        const themes = [
          {
            top: "bg-[#edf5ff]",
            bottom: "bg-[#fafcff]",
            border: "border-[#dceafb]",
            icon: "bg-[#dceaff] text-[#315f9a]",
            accent: "text-[#315f9a]",
          },
          {
            top: "bg-[#f2efff]",
            bottom: "bg-[#fcfbff]",
            border: "border-[#e6defb]",
            icon: "bg-[#e7dfff] text-[#7655af]",
            accent: "text-[#7655af]",
          },
          {
            top: "bg-[#eafaf4]",
            bottom: "bg-[#fafffc]",
            border: "border-[#d9f0e5]",
            icon: "bg-[#d5f4e7] text-[#278365]",
            accent: "text-[#278365]",
          },
          {
            top: "bg-[#fff3e8]",
            bottom: "bg-[#fffdf9]",
            border: "border-[#f5e5d5]",
            icon: "bg-[#ffe6cd] text-[#bb773d]",
            accent: "text-[#bb773d]",
          },
          {
            top: "bg-[#fff0f5]",
            bottom: "bg-[#fffbfd]",
            border: "border-[#f5e0e8]",
            icon: "bg-[#ffe0eb] text-[#b65b80]",
            accent: "text-[#b65b80]",
          },
          {
            top: "bg-[#eaf7fa]",
            bottom: "bg-[#faffff]",
            border: "border-[#d8ecf2]",
            icon: "bg-[#d5f0f5] text-[#337f95]",
            accent: "text-[#337f95]",
          },
        ];

        const theme = themes[index % themes.length];

        return (
          <article
            key={booking.id}
            style={{
              "--reveal-delay": `${index * 100}ms`,
              "--float-delay": `${index * -0.7}s`,
            }}
            className={`shoot-card group min-w-0 overflow-hidden rounded-[20px] border ${theme.border} shadow-[0_5px_18px_rgba(25,60,110,0.04)]`}
          >
            {/* TOP COLOUR */}
            <div className={`${theme.top} p-5`}>
              <div className="mb-4 flex items-start justify-between gap-2">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme.icon} transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110`}
                >
                  <Camera size={21} />
                </div>

                <StatusBadge status={booking.status} />
              </div>

              <h3 className="break-words text-base font-extrabold text-[#10264d]">
                {booking.customer}
              </h3>

              <p className="mt-1.5 min-h-[32px] text-xs leading-5 text-[#60738d]">
                {booking.event}
              </p>
            </div>

            {/* BOTTOM COLOUR */}
            <div className={`${theme.bottom} p-5`}>
              <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-400">
                    Event Date
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-[#344767]">
                    <CalendarDays
                      size={14}
                      className={theme.accent}
                    />
                    {formatDate(booking.date)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-400">
                    Event Time
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-[#344767]">
                    <Clock3
                      size={14}
                      className={theme.accent}
                    />
                    {formatTime(booking.time)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-400">
                    Location
                  </p>
                  <p className="mt-1.5 flex items-start gap-1.5 break-words text-xs font-bold text-[#344767]">
                    <MapPin
                      size={14}
                      className={`shrink-0 ${theme.accent}`}
                    />
                    {booking.location || "—"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-slate-400">
                    Photographer
                  </p>
                  <p className="mt-1.5 flex items-start gap-1.5 break-words text-xs font-bold text-[#344767]">
                    <Camera
                      size={14}
                      className={`shrink-0 ${theme.accent}`}
                    />
                    {booking.photographer || "Not Assigned"}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#e8edf5] pt-4">
                <button
                  type="button"
                  onClick={() => editBooking(booking)}
                  className={`flex w-full items-center justify-between text-xs font-bold ${theme.accent} transition-all duration-300 hover:tracking-wide`}
                >
                  <span>View / Edit Booking</span>
                  <ArrowUpRight
                    size={17}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  )}
</section>


      {/* ALL BOOKINGS */}
      <section className="min-w-0 overflow-hidden rounded-[22px] border border-[#e3eaf4] bg-white shadow-[0_6px_25px_rgba(22,53,96,0.035)]">
        <div className="flex flex-col gap-4 border-b border-[#edf1f6] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#10264d]">
              All Bookings
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {filtered.length} of{" "}
              {bookings.length} bookings
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-[270px]">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
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

            <div className="flex w-full items-center gap-2 sm:w-[175px]">
              <Filter
                size={16}
                className="shrink-0 text-slate-400 sm:hidden"
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
            <div className="col-span-full py-12 text-center text-sm text-slate-400">
              No bookings found
            </div>
          ) : (
            filtered.map((booking) => (
              <article
                key={booking.id}
                className="booking-premium-card min-w-0 overflow-hidden rounded-2xl border border-[#e3eaf4] bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#edf1f6] bg-[#f9fbfe] p-4">
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
                        <StatusBadge
                          status={booking.status}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        editBooking(booking)
                      }
                      aria-label="Edit booking"
                      className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteBooking(booking.id)
                      }
                      aria-label="Delete booking"
                      className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4">
                  <MobileDetail
                    label="Event"
                    value={booking.event}
                  />

                  <MobileDetail
                    label="Phone"
                    value={booking.phone}
                  />

                  <MobileDetail
                    label="Date"
                    value={formatDate(booking.date)}
                  />

                  <MobileDetail
                    label="Time"
                    value={formatTime(booking.time)}
                  />

                  <MobileDetail
                    label="Location"
                    value={booking.location}
                  />

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
                    value={
                      booking.status ||
                      "Confirmed"
                    }
                    options={statuses}
                    onChange={(value) =>
                      changeStatus(
                        booking.id,
                        value
                      )
                    }
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
                <th className="px-4 py-4">
                  Customer
                </th>

                <th className="px-4 py-4">
                  Event
                </th>

                <th className="px-4 py-4">
                  Date & Time
                </th>

                <th className="px-4 py-4">
                  Location
                </th>

                <th className="px-4 py-4">
                  Photographer
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="px-4 py-4 text-center">
                  Actions
                </th>
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
                    className="transition-all duration-300 hover:bg-[#f5f9ff]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-[#edf3fc] text-[#315f9a]">
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
                        {formatDate(
                          booking.date
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatTime(
                          booking.time
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-[#52627b]">
                      {booking.location || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm text-[#52627b]">
                      {booking.photographer ||
                        "Not Assigned"}
                    </td>

                    <td className="min-w-[150px] px-4 py-4">
                      <div className="mb-2">
                        <StatusBadge
                          status={booking.status}
                        />
                      </div>

                      <CustomDropdown
                        value={
                          booking.status ||
                          "Confirmed"
                        }
                        options={statuses}
                        onChange={(value) =>
                          changeStatus(
                            booking.id,
                            value
                          )
                        }
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            editBooking(booking)
                          }
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          aria-label="Edit booking"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteBooking(
                              booking.id
                            )
                          }
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
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
          Showing {filtered.length} of{" "}
          {bookings.length} bookings
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {showForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07172d]/65 p-2 backdrop-blur-[3px] sm:p-5"
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
              aria-labelledby="booking-modal-title"
              className="animate-[bookingFade_.25s_ease-out] flex max-h-[calc(100dvh-16px)] w-full max-w-[780px] flex-col overflow-hidden rounded-2xl border border-[#e3eaf4] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.22)] sm:max-h-[calc(100dvh-40px)]"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 bg-[#10264d] px-4 py-4 text-white sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    {editingId ? (
                      <Pencil size={19} />
                    ) : (
                      <CalendarDays size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3
                      id="booking-modal-title"
                      className="text-base font-bold sm:text-lg"
                    >
                      {editingId
                        ? "Edit Booking"
                        : "Create New Booking"}
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
                  className="rounded-lg p-2 transition hover:bg-white/15"
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

                    <FormField
                      label="Customer Name"
                      required
                    >
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
                            update(
                              "customer",
                              event.target.value
                            )
                          }
                          placeholder="Enter customer name"
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Phone Number"
                      required
                    >
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
                              event.target.value.replace(
                                /\D/g,
                                ""
                              )
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
                        onChange={(value) =>
                          update("event", value)
                        }
                      />
                    </FormField>

                    <FormField
                      label="Booking Date"
                      required
                    >
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(event) =>
                          update(
                            "date",
                            event.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField
                      label="Booking Time"
                      required
                    >
                      <input
                        type="time"
                        required
                        value={form.time}
                        onChange={(event) =>
                          update(
                            "time",
                            event.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Location">
                      <CustomDropdown
                        value={form.location}
                        options={locations}
                        onChange={(value) =>
                          update(
                            "location",
                            value
                          )
                        }
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
                        value={
                          form.photographer
                        }
                        options={photographers}
                        onChange={(value) =>
                          update(
                            "photographer",
                            value
                          )
                        }
                      />
                    </FormField>

                    <FormField label="Photography Package">
                      <CustomDropdown
                        value={form.package}
                        options={packages}
                        onChange={(value) =>
                          update(
                            "package",
                            value
                          )
                        }
                      />
                    </FormField>

                    <FormField label="Booking Status">
                      <CustomDropdown
                        value={form.status}
                        options={statuses}
                        onChange={(value) =>
                          update(
                            "status",
                            value
                          )
                        }
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
                    className="w-full rounded-xl border border-[#dce4ef] bg-[#f8fafd] px-6 py-3 text-sm font-semibold text-[#344767] transition hover:bg-[#eef3f9] sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1b467e] sm:w-auto"
                  >
                    <Save size={17} />

                    {editingId
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
