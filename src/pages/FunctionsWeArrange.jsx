
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  PartyPopper,
  Users,
  CheckCircle2,
  Clock3,
  IndianRupee,
  ChevronDown,
  MapPin,
  Phone,
  UserRound,
  Wallet,
  Check,
  Volume2,
  VolumeX,
  CalendarCheck2,
  BriefcaseBusiness,
  FileText,
  Filter,
} from "lucide-react";

const STORAGE_KEY = "studioraw_functions_we_arrange";
const SOUND_KEY = "studioraw_functions_sounds";

const EVENT_TYPES = [
  "Puberty Ceremony",
  "Engagement Ceremony",
  "Birthday Celebrations",
  "Inauguration Ceremony",
  "Mehndi Ceremony",
  "Bachelor Party",
  
];

const SERVICES = [
  "Photography",
  "Videography",
  "Candid Photography",
  "Cinematic Videography",
  "Drone Coverage",
  "Live Streaming",
  "Decoration",
  "Stage Setup",
  "Lighting",
  "Sound System",
  "DJ",
  "Catering",
  "Makeup",
  "Album Printing",
  "Invitation Design",
];

const STATUSES = [
  "Upcoming",
  "In Progress",
  "Completed",
  "Cancelled",
];

const DEMO_NAMES = [
  "Arun Kumar",
  "Priya",
  "Vijay Kumar",
  "Divya",
  "Karthik",
  "Anitha",
  "Rahul",
  "Keerthana",
  "Sanjay",
  "Meena",
  "Praveen",
  "Swetha",
  "Ajay",
  "Nithya",
  "Ramesh",
  "Harini",
  "Manoj",
  "Deepika",
  "Suresh",
  "Kavitha",
];

const DEMO_VENUES = [
  "Nagercoil",
  "Chennai",
  "Kanyakumari",
  "Marthandam",
  "Tirunelveli",
  "Madurai",
  "Trivandrum",
  "Coimbatore",
  "Tenkasi",
  "Tuticorin",
];

const DEMO_EVENTS = [
  "Wedding",
  "Birthday Party",
  "Engagement",
  "Baby Shower",
  "Reception",
  "Housewarming",
  "Corporate Event",
  "Naming Ceremony",
  "Wedding Anniversary",
  "College Function",
  "Haldi Ceremony",
  "Mehendi Ceremony",
  "Cultural Event",
  "Family Function",
  "Product Launch",
  "School Annual Day",
  "Pre-Wedding Event",
  "Sangeet",
  "Puberty Ceremony",
  "Other",
];

const DEMO_SERVICES = [
  ["Photography", "Videography", "Drone Coverage"],
  ["Photography", "Decoration"],
  ["Photography", "Videography"],
  ["Photography", "Decoration", "Videography"],
  ["Candid Photography", "Cinematic Videography"],
  ["Decoration", "Stage Setup", "Lighting"],
  ["Photography", "Live Streaming"],
  ["Photography", "Album Printing"],
  ["Videography", "Sound System", "DJ"],
  ["Photography", "Catering"],
  ["Photography", "Videography", "Makeup"],
  ["Stage Setup", "Lighting", "Sound System"],
  ["Cinematic Videography", "Drone Coverage"],
  ["Photography", "Invitation Design"],
  ["Photography", "Videography", "Catering"],
  ["Live Streaming", "Videography"],
  ["Photography", "Candid Photography"],
  ["Decoration", "DJ", "Lighting"],
  ["Photography", "Stage Setup"],
  ["Photography", "Videography", "Decoration"],
];

const dateOffset = (days) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const DEMO_DATA = DEMO_NAMES.map((customer, index) => {
  const amount = 20000 + (index % 8) * 15000;
  const advance = Math.round(
    amount * (index % 4 === 0 ? 1 : index % 3 === 0 ? 0.5 : 0.3)
  );

  return {
    id: `FUNC-DEMO-${String(index + 1).padStart(3, "0")}`,
    customer,
    phone: `98765${String(10000 + index).slice(-5)}`,
    eventType: DEMO_EVENTS[index],
    eventDate: dateOffset(index < 6 ? -(20 - index * 3) : index * 4),
    venue: DEMO_VENUES[index % DEMO_VENUES.length],
    guests: 80 + (index % 8) * 75,
    services: DEMO_SERVICES[index],
    amount,
    advance,
    status:
      index < 4
        ? "Completed"
        : index === 4 || index === 5
        ? "In Progress"
        : index === 18
        ? "Cancelled"
        : "Upcoming",
    notes: `Demo booking for ${DEMO_EVENTS[index]}`,
  };
});

const emptyForm = {
  customer: "",
  phone: "",
  eventType: "Wedding",
  eventDate: "",
  venue: "",
  guests: "",
  services: [],
  amount: "",
  advance: "",
  status: "Upcoming",
  notes: "",
};

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

const inputStyle =
  "block w-full min-w-0 rounded-xl border border-[#dce5f1] bg-white px-3.5 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#376ca9] focus:ring-2 focus:ring-blue-100";

const statusColors = {
  Upcoming: "border-blue-100 bg-blue-50 text-blue-700",
  "In Progress": "border-amber-100 bg-amber-50 text-amber-700",
  Completed: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Cancelled: "border-rose-100 bg-rose-50 text-rose-700",
};

function useSound() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "false";
    } catch {
      return true;
    }
  });

  const audioRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(enabled));
    } catch {
      // Ignore storage errors.
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      audioRef.current?.close?.();
    };
  }, []);

  const play = (type = "click") => {
    if (!enabled) return;

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

      const notes =
        type === "success"
          ? [520, 660, 880]
          : type === "delete"
          ? [420, 310]
          : type === "open"
          ? [440, 620]
          : [540];

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        const start = context.currentTime + index * 0.07;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.055, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(start + 0.13);
      });
    } catch {
      // Audio may be unavailable in some browsers.
    }
  };

  return { enabled, setEnabled, play };
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const closeOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const closeEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={`${inputStyle} flex items-center justify-between gap-2 text-left font-medium disabled:opacity-60`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-[#607b9f] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-[120] mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#dce5f1] bg-white p-1 shadow-[0_15px_35px_rgba(16,38,77,0.18)]"
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
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                value === option
                  ? "bg-[#eaf1fc] font-semibold text-[#123a70]"
                  : "text-[#52627b] hover:bg-[#f5f8fd]"
              }`}
            >
              <span className="min-w-0 break-words">{option}</span>
              {value === option && (
                <Check size={16} className="shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesDropdown({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const outside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const selected = Array.isArray(value) ? value : [];

  const toggle = (service) => {
    if (selected.includes(service)) {
      onChange(selected.filter((item) => item !== service));
    } else {
      onChange([...selected, service]);
    }
  };

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className={`${inputStyle} flex items-center justify-between gap-3 text-left`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected.length
            ? `${selected.length} services selected`
            : "Select required services"}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[120] mt-1 max-h-60 overflow-y-auto rounded-xl border border-[#dce5f1] bg-white p-2 shadow-[0_15px_35px_rgba(16,38,77,0.18)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
            <span className="text-xs font-semibold text-[#10264d]">
              Choose Services
            </span>

            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Clear
            </button>
          </div>

          {SERVICES.map((service) => {
            const checked = selected.includes(service);

            return (
              <button
                key={service}
                type="button"
                onClick={() => toggle(service)}
                className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  checked
                    ? "bg-blue-50 text-[#102f62]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? "border-[#102f62] bg-[#102f62] text-white"
                      : "border-slate-300"
                  }`}
                >
                  {checked && <Check size={12} />}
                </span>

                <span className="min-w-0 break-words">{service}</span>
              </button>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((service) => (
            <span
              key={service}
              className="inline-flex max-w-full items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-800"
            >
              <span className="truncate">{service}</span>
              <button
                type="button"
                aria-label={`Remove ${service}`}
                onClick={() => toggle(service)}
                className="shrink-0"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  options,
  placeholder = "",
  required = false,
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block text-xs font-semibold text-[#344767]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {options ? (
        <CustomDropdown
          value={value}
          options={options}
          onChange={(selected) => onChange(name, selected)}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(event) =>
            onChange(
              name,
              type === "tel"
                ? event.target.value.replace(/\D/g, "").slice(0, 10)
                : event.target.value
            )
          }
          placeholder={placeholder}
          required={required}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "0.01" : undefined}
          inputMode={type === "tel" ? "numeric" : undefined}
          maxLength={type === "tel" ? 10 : undefined}
          className={inputStyle}
        />
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-2.5 border-b border-[#edf1f6] pb-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf1fc] text-[#17477e]">
        <Icon size={17} />
      </span>
      <h3 className="text-sm font-bold text-[#10264d]">{title}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        statusColors[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "—"}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#e5ebf3] bg-white p-4 shadow-[0_4px_18px_rgba(16,38,77,0.04)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#8290a5] sm:text-sm">
          {title}
        </p>
        <h2 className="mt-2 break-words text-xl font-extrabold text-[#10264d] sm:text-2xl">
          {value}
        </h2>
      </div>

      <div className={`shrink-0 rounded-xl p-3 ${color}`}>
        <Icon size={21} />
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
        {value === "" || value === null || value === undefined
          ? "—"
          : value}
      </p>
    </div>
  );
}

export default function FunctionsWeArrange() {
  const [functions, setFunctions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved !== null) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : DEMO_DATA;
      }

      return DEMO_DATA;
    } catch {
      return DEMO_DATA;
    }
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    ...emptyForm,
    services: [],
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const { enabled, setEnabled, play } = useSound();

  const firstInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(functions));
    } catch {
      // Ignore storage errors.
    }
  }, [functions]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3000);

    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => firstInputRef.current?.focus(), 30);

    const escape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setEditingId(null);
        setError("");
      }
    };

    window.addEventListener("keydown", escape);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", escape);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return functions.filter((item) => {
      const matchesSearch = [
        item.customer,
        item.phone,
        item.eventType,
        item.venue,
        item.status,
        item.id,
        ...(Array.isArray(item.services) ? item.services : []),
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesEvent =
        filter === "All" || item.eventType === filter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [functions, search, filter, statusFilter]);

  const totalBalance = functions.reduce(
    (sum, item) =>
      sum +
      Math.max(
        0,
        Number(item.amount || 0) - Number(item.advance || 0)
      ),
    0
  );

  const completed = functions.filter(
    (item) => item.status === "Completed"
  ).length;

  const stats = [
    {
      title: "Total Functions",
      value: functions.length,
      icon: PartyPopper,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Upcoming Events",
      value: functions.filter((item) => item.status === "Upcoming")
        .length,
      icon: CalendarCheck2,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "Completed Events",
      value: completed,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Pending Balance",
      value: money(totalBalance),
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
    play("open");
    setEditingId(null);
    setForm({ ...emptyForm, services: [] });
    setError("");
    setOpen(true);
  };

  const openEdit = (item) => {
    play("open");
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      ...item,
      services: Array.isArray(item.services) ? [...item.services] : [],
    });
    setError("");
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm, services: [] });
    setError("");
  };

  const saveFunction = (event) => {
    event.preventDefault();

    const customer = String(form.customer || "").trim();
    const phone = String(form.phone || "").trim();

    if (!customer) {
      setError("Please enter customer name.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!form.eventDate || !form.venue.trim()) {
      setError("Please enter event date and venue.");
      return;
    }

    const amount = Number(form.amount);
    const advance = Number(form.advance);

    if (
      form.amount === "" ||
      form.advance === "" ||
      !Number.isFinite(amount) ||
      !Number.isFinite(advance) ||
      amount < 0 ||
      advance < 0
    ) {
      setError("Please enter valid payment amounts.");
      return;
    }

    if (advance > amount) {
      setError("Advance amount cannot exceed total amount.");
      return;
    }

    const record = {
      ...form,
      id:
        editingId !== null
          ? editingId
          : globalThis.crypto?.randomUUID?.() ||
            `FUNC-${Date.now()}`,
      customer,
      phone,
      venue: String(form.venue || "").trim(),
      guests: Number(form.guests || 0),
      amount,
      advance,
      services: Array.isArray(form.services) ? form.services : [],
    };

    if (editingId !== null) {
      setFunctions((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );

      setNotice("Function updated successfully.");
    } else {
      setFunctions((previous) => [record, ...previous]);
      setNotice("Function added successfully.");
    }

    play("success");
    closeForm();
  };

  const deleteFunction = (item) => {
    if (
      !window.confirm(
        `Delete ${item.customer}'s ${item.eventType} booking?`
      )
    ) {
      return;
    }

    setFunctions((previous) =>
      previous.filter((record) => record.id !== item.id)
    );

    play("delete");
    setNotice("Function deleted successfully.");
  };

  const updateStatus = (id, status) => {
    setFunctions((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    play("click");
    setNotice("Function status updated.");
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full bg-[#f5f7fb] px-3 py-5 text-[#10264d] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        {/* NOTIFICATION */}
        {notice &&
          createPortal(
            <div className="fixed left-3 right-3 top-4 z-[10001] flex items-center gap-3 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 shadow-xl sm:left-auto sm:right-5 sm:w-auto sm:max-w-md">
              <CheckCircle2
                size={19}
                className="shrink-0 text-emerald-600"
              />
              <p className="flex-1 text-sm font-semibold text-[#10264d]">
                {notice}
              </p>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Close notification"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>,
            document.body
          )}

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#7e93af]">
              Studio Raw Picturez ERP
            </p>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white shadow-sm">
                <PartyPopper size={22} />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-extrabold tracking-tight text-[#10264d] sm:text-2xl lg:text-[29px]">
                  Functions We Arrange
                </h1>
                <p className="mt-1 text-xs text-[#8290a5] sm:text-sm">
                  Manage events, services, bookings and payments.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                setEnabled((previous) => !previous);
              }}
              title={enabled ? "Mute sounds" : "Enable sounds"}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm font-semibold text-[#102f62] transition hover:bg-blue-50"
            >
              {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              Sound {enabled ? "On" : "Off"}
            </button>

            <button
              type="button"
              onClick={openAdd}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#102f62] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c477e]"
            >
              <Plus size={18} />
              Add Function
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* DIRECTORY */}
        <section className="min-w-0 overflow-visible rounded-2xl border border-[#e5ebf3] bg-white shadow-[0_4px_18px_rgba(16,38,77,0.04)]">
          <div className="flex flex-col gap-4 border-b border-[#edf1f6] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#10264d]">
                Function Bookings
              </h2>
              <p className="mt-1 text-xs text-[#8290a5]">
                {filtered.length} functions found · {completed} completed
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[240px_180px_155px]">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search functions..."
                  className={`${inputStyle} pl-10`}
                />
              </div>

              <CustomDropdown
                value={filter === "All" ? "All Events" : filter}
                options={["All Events", ...EVENT_TYPES]}
                onChange={(value) => {
                  setFilter(value === "All Events" ? "All" : value);
                  play("click");
                }}
              />

              <CustomDropdown
                value={
                  statusFilter === "All" ? "All Status" : statusFilter
                }
                options={["All Status", ...STATUSES]}
                onChange={(value) => {
                  setStatusFilter(
                    value === "All Status" ? "All" : value
                  );
                  play("click");
                }}
              />
            </div>
          </div>

          {/* MOBILE & TABLET CARDS */}
          <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 xl:hidden">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center sm:col-span-2">
                <Users
                  size={32}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 text-sm text-slate-500">
                  No functions found.
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <article
                  key={item.id}
                  className="min-w-0 rounded-2xl border border-[#e5ebf3] bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-[#edf1f6] bg-[#f8fafd] p-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-[#315f9a]">
                        <PartyPopper size={19} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-bold text-[#10264d]">
                          {item.customer}
                        </h3>
                        <p className="mt-1 break-all text-[11px] text-[#7e93af]">
                          {item.id}
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        aria-label={`Edit ${item.customer}`}
                        className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteFunction(item)}
                        aria-label={`Delete ${item.customer}`}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4">
                    <Detail label="Event Type" value={item.eventType} />
                    <Detail
                      label="Event Date"
                      value={formatDate(item.eventDate)}
                    />
                    <Detail label="Phone Number" value={item.phone} />
                    <Detail label="Venue" value={item.venue} />
                    <Detail label="Guests" value={item.guests} />
                    <Detail
                      label="Total Amount"
                      value={money(item.amount)}
                    />
                    <Detail
                      label="Advance Paid"
                      value={money(item.advance)}
                    />
                    <Detail
                      label="Pending Balance"
                      value={money(
                        Math.max(
                          0,
                          Number(item.amount || 0) -
                            Number(item.advance || 0)
                        )
                      )}
                    />
                  </div>

                  <div className="border-t border-[#edf1f6] px-4 py-3">
                    <p className="mb-2 text-xs font-semibold text-[#52627b]">
                      Services
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(item.services) &&
                      item.services.length > 0 ? (
                        item.services.map((service) => (
                          <span
                            key={service}
                            className="rounded-lg bg-[#edf3fc] px-2 py-1 text-[11px] font-medium text-[#315f9a]"
                          >
                            {service}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          No services selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#edf1f6] bg-[#fafcff] px-4 py-3">
                    <p className="mb-2 text-xs font-semibold text-[#52627b]">
                      Function Status
                    </p>
                    <CustomDropdown
                      value={item.status || "Upcoming"}
                      options={STATUSES}
                      onChange={(status) =>
                        updateStatus(item.id, status)
                      }
                    />
                  </div>
                </article>
              ))
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden w-full overflow-x-auto xl:block">
            <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
              <thead className="bg-[#f7f9fd]">
                <tr className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8290a5]">
                  {[
                    "Customer",
                    "Event",
                    "Date",
                    "Venue",
                    "Guests",
                    "Services",
                    "Total",
                    "Balance",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-4"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf1f6]">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-16 text-center text-slate-400"
                    >
                      No functions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#f8faff]"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf3fc] text-[#315f9a]">
                            <UserRound size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#10264d]">
                              {item.customer}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {item.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-[#52627b]">
                        {item.eventType}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-[#52627b]">
                        {formatDate(item.eventDate)}
                      </td>

                      <td className="px-4 py-4 text-[#52627b]">
                        {item.venue || "—"}
                      </td>

                      <td className="px-4 py-4 text-[#52627b]">
                        {item.guests || "—"}
                      </td>

                      <td className="max-w-[175px] px-4 py-4">
                        <p
                          className="truncate text-xs text-[#52627b]"
                          title={
                            Array.isArray(item.services)
                              ? item.services.join(", ")
                              : ""
                          }
                        >
                          {Array.isArray(item.services)
                            ? item.services.join(", ") || "—"
                            : "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#10264d]">
                        {money(item.amount)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-rose-600">
                        {money(
                          Math.max(
                            0,
                            Number(item.amount || 0) -
                              Number(item.advance || 0)
                          )
                        )}
                      </td>

                      <td className="min-w-[155px] px-4 py-4">
                        <div className="mb-2">
                          <StatusBadge status={item.status} />
                        </div>
                        <CustomDropdown
                          value={item.status || "Upcoming"}
                          options={STATUSES}
                          onChange={(status) =>
                            updateStatus(item.id, status)
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            title="Edit function"
                            className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFunction(item)}
                            title="Delete function"
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
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

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1f6] px-4 py-4 text-xs text-[#8290a5] sm:px-6">
            <span>
              Showing {filtered.length} of {functions.length} functions
            </span>
            <span>Studio Raw Picturez ERP</span>
          </div>
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07172d]/70 p-2 backdrop-blur-[3px] sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="function-modal-title"
              className="flex max-h-[calc(100dvh-16px)] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl border border-[#dce5f1] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:max-h-[calc(100dvh-32px)]"
            >
              {/* MODAL HEADER */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e9eef5] bg-white px-4 py-4 sm:px-7 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white">
                    {editingId !== null ? (
                      <Pencil size={19} />
                    ) : (
                      <PartyPopper size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2
                      id="function-modal-title"
                      className="text-base font-bold text-[#10264d] sm:text-xl"
                    >
                      {editingId !== null
                        ? "Edit Function"
                        : "Add New Function"}
                    </h2>
                    <p className="mt-1 text-xs text-[#8290a5]">
                      Enter function and event details
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close form"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={saveFunction}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
                  {/* CUSTOMER DETAILS */}
                  <section>
                    <SectionTitle
                      icon={UserRound}
                      title="Customer Information"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="min-w-0 space-y-1.5">
                        <label className="block text-xs font-semibold text-[#344767]">
                          Customer Name
                          <span className="ml-1 text-red-500">*</span>
                        </label>
                        <input
                          ref={firstInputRef}
                          type="text"
                          value={form.customer}
                          onChange={(event) =>
                            updateForm("customer", event.target.value)
                          }
                          placeholder="Enter customer name"
                          required
                          className={inputStyle}
                        />
                      </div>

                      <Field
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateForm}
                        placeholder="Enter 10-digit phone number"
                        required
                      />
                    </div>
                  </section>

                  {/* EVENT DETAILS */}
                  <section>
                    <SectionTitle
                      icon={CalendarDays}
                      title="Function & Event Details"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Function / Event Type"
                        name="eventType"
                        value={form.eventType}
                        onChange={updateForm}
                        options={EVENT_TYPES}
                        required
                      />

                      <Field
                        label="Event Date"
                        name="eventDate"
                        type="date"
                        value={form.eventDate}
                        onChange={updateForm}
                        required
                      />

                      <Field
                        label="Venue / Location"
                        name="venue"
                        value={form.venue}
                        onChange={updateForm}
                        placeholder="Enter function venue"
                        required
                      />

                      <Field
                        label="Expected Guests"
                        name="guests"
                        type="number"
                        value={form.guests}
                        onChange={updateForm}
                        placeholder="Enter number of guests"
                      />

                      <Field
                        label="Function Status"
                        name="status"
                        value={form.status}
                        onChange={updateForm}
                        options={STATUSES}
                        required
                      />
                    </div>
                  </section>

                  {/* SERVICES */}
                  <section>
                    <SectionTitle
                      icon={BriefcaseBusiness}
                      title="Services Required"
                    />

                    <p className="mb-3 text-xs text-[#8290a5]">
                      Select one or multiple services from the dropdown.
                    </p>

                    <ServicesDropdown
                      value={form.services}
                      onChange={(services) =>
                        updateForm("services", services)
                      }
                    />
                  </section>

                  {/* PAYMENT */}
                  <section>
                    <SectionTitle
                      icon={IndianRupee}
                      title="Payment Details"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Total Amount (₹)"
                        name="amount"
                        type="number"
                        value={form.amount}
                        onChange={updateForm}
                        placeholder="Enter total amount"
                        required
                      />

                      <Field
                        label="Advance Paid (₹)"
                        name="advance"
                        type="number"
                        value={form.advance}
                        onChange={updateForm}
                        placeholder="Enter advance amount"
                        required
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce8f7] bg-[#edf3fc] px-4 py-3">
                      <span className="text-sm font-semibold text-[#315f9a]">
                        Remaining Balance
                      </span>
                      <span className="text-lg font-extrabold text-[#102f62]">
                        {money(
                          Math.max(
                            0,
                            Number(form.amount || 0) -
                              Number(form.advance || 0)
                          )
                        )}
                      </span>
                    </div>
                  </section>

                  {/* NOTES */}
                  <section>
                    <SectionTitle
                      icon={FileText}
                      title="Additional Information"
                    />

                    <label className="block space-y-2">
                      <span className="text-xs font-semibold text-[#344767]">
                        Additional Notes
                      </span>
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(event) =>
                          updateForm("notes", event.target.value)
                        }
                        placeholder="Enter function requirements or special instructions..."
                        className={`${inputStyle} resize-y`}
                      />
                    </label>
                  </section>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                    >
                      {error}
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e9eef5] bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-7">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="w-full rounded-xl border border-[#dce5f1] bg-[#f8fafd] px-6 py-3 text-sm font-semibold text-[#344767] transition hover:bg-[#edf3fc] sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102f62] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1c477e] sm:w-auto"
                  >
                    <Save size={17} />
                    {editingId !== null
                      ? "Update Function"
                      : "Save Function"}
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
