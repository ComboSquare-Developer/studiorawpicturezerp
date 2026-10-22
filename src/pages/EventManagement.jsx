
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
  IndianRupee,
  ChevronDown,
  MapPin,
  Phone,
  UserRound,
  Wallet,
  CalendarCheck2,
  BriefcaseBusiness,
  ClipboardList,
  Clock3,
  Volume2,
  VolumeX,
  Check,
  FileText,
  AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "studioraw_event_management";
const SOUND_KEY = "studioraw_dashboard_sound";

const EVENT_TYPES = [
  "Wedding",
  "Engagement",
  "Reception",
  "Birthday Party",
  "Baby Shower",
  "Naming Ceremony",
  "Puberty Ceremony",
  "Housewarming",
  "Wedding Anniversary",
  "Haldi Ceremony",
  "Mehendi Ceremony",
  "Sangeet",
  "Pre-Wedding Event",
  "Corporate Event",
  "Product Launch",
  "Conference",
  "Seminar",
  "Award Ceremony",
  "College Function",
  "School Annual Day",
  "Cultural Event",
  "Music Concert",
  "Exhibition",
  "Family Function",
  "Other",
];

const SERVICES = [
  "Event Planning",
  "Venue Decoration",
  "Stage Decoration",
  "Photography",
  "Videography",
  "Candid Photography",
  "Cinematic Videography",
  "Drone Coverage",
  "Live Streaming",
  "Lighting",
  "Sound System",
  "DJ",
  "Catering",
  "Makeup",
  "Invitation Design",
  "Guest Management",
  "Transportation",
  "Security",
  "Other",
];

const STATUSES = [
  "Planning",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

const PRIORITIES = ["Low", "Medium", "High"];

const COORDINATORS = [
  "Karthik",
  "Rahul",
  "Manoj",
  "Ajay",
  "Sanjay",
  "Arun",
  "Vignesh",
  "Priya",
  "Divya",
  "Not Assigned",
];

const VENUES = [
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
  "Other",
];

const CUSTOMERS = [
  "Arun Kumar",
  "Priya",
  "ABC Technologies",
  "Divya",
  "XYZ College",
  "Karthik",
  "Anitha",
  "Rahul",
  "Keerthana",
  "Sanjay",
  "Meena",
  "Praveen",
  "Swetha",
  "Ajay Kumar",
  "Nithya",
  "Ramesh",
  "Harini",
  "Manoj Kumar",
  "Deepika",
  "Suresh",
];

const DEMO_EVENT_TYPES = [
  "Wedding",
  "Birthday Party",
  "Corporate Event",
  "Baby Shower",
  "College Function",
  "Engagement",
  "Reception",
  "Housewarming",
  "Naming Ceremony",
  "Wedding Anniversary",
  "Haldi Ceremony",
  "Mehendi Ceremony",
  "Product Launch",
  "Conference",
  "Seminar",
  "Award Ceremony",
  "School Annual Day",
  "Music Concert",
  "Exhibition",
  "Family Function",
];

const DEMO_SERVICES = [
  ["Event Planning", "Photography", "Videography", "Venue Decoration"],
  ["Venue Decoration", "Photography", "Catering"],
  ["Event Planning", "Lighting", "Sound System", "Photography"],
  ["Photography", "Videography", "Venue Decoration"],
  ["Event Planning", "Stage Decoration", "Lighting", "Sound System"],
  ["Photography", "Candid Photography", "Makeup"],
  ["Videography", "Drone Coverage", "Live Streaming"],
  ["Venue Decoration", "Photography", "Catering"],
  ["Photography", "Invitation Design"],
  ["Photography", "Videography", "Stage Decoration"],
  ["Makeup", "Photography", "Venue Decoration"],
  ["Photography", "Videography", "DJ"],
  ["Event Planning", "Photography", "Sound System"],
  ["Guest Management", "Lighting", "Live Streaming"],
  ["Event Planning", "Videography", "Catering"],
  ["Stage Decoration", "Photography", "Sound System"],
  ["Photography", "Videography", "Lighting"],
  ["DJ", "Lighting", "Security", "Videography"],
  ["Event Planning", "Transportation", "Security"],
  ["Photography", "Videography", "Catering"],
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

const DEMO_DATA = CUSTOMERS.map((customer, index) => {
  const amount = 35000 + (index % 9) * 25000;
  const advance =
    index % 5 === 0
      ? amount
      : Math.round(amount * (index % 2 === 0 ? 0.4 : 0.3));

  const eventType = DEMO_EVENT_TYPES[index];

  return {
    id: `EVENT-DEMO-${String(index + 1).padStart(3, "0")}`,
    eventName: `${customer} - ${eventType}`,
    customer,
    phone: `98765${String(10000 + index).slice(-5)}`,
    eventType,
    eventDate: dateOffset(index < 5 ? -(25 - index * 4) : index * 4),
    startTime: index % 3 === 0 ? "09:00" : "10:00",
    endTime: index % 3 === 0 ? "17:00" : "18:00",
    venue: VENUES[index % (VENUES.length - 1)],
    coordinator: COORDINATORS[index % (COORDINATORS.length - 1)],
    guests: 100 + (index % 8) * 100,
    services: DEMO_SERVICES[index],
    amount,
    advance,
    status:
      index < 4
        ? "Completed"
        : index < 7
        ? "Confirmed"
        : index < 10
        ? "In Progress"
        : index === 19
        ? "Cancelled"
        : "Planning",
    priority: PRIORITIES[index % PRIORITIES.length],
    notes: `Demo event management booking for ${eventType}`,
  };
});

const emptyForm = {
  eventName: "",
  customer: "",
  phone: "",
  eventType: "Wedding",
  eventDate: "",
  startTime: "",
  endTime: "",
  venue: "",
  coordinator: "Not Assigned",
  guests: "",
  services: [],
  amount: "",
  advance: "",
  status: "Planning",
  priority: "Medium",
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

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#dce5f1] bg-white px-3.5 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#376ca9] focus:ring-2 focus:ring-blue-100";

const STATUS_COLORS = {
  Planning: "border-violet-100 bg-violet-50 text-violet-700",
  Confirmed: "border-blue-100 bg-blue-50 text-blue-700",
  "In Progress": "border-amber-100 bg-amber-50 text-amber-700",
  Completed: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Cancelled: "border-red-100 bg-red-50 text-red-700",
};

const PRIORITY_COLORS = {
  Low: "border-green-100 bg-green-50 text-green-700",
  Medium: "border-amber-100 bg-amber-50 text-amber-700",
  High: "border-red-100 bg-red-50 text-red-700",
};

function playTone(type = "click") {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();

    const notes =
      type === "success"
        ? [520, 660, 880]
        : type === "delete"
        ? [440, 310]
        : type === "open"
        ? [450, 620]
        : [550];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      const start = context.currentTime + index * 0.075;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.05, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.14);
    });

    setTimeout(() => context.close().catch(() => {}), 600);
  } catch {
    // Sound is optional.
  }
}

function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const outside = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
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

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className={`${inputClass} flex items-center justify-between gap-2 text-left`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#607b9f] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-[150] mt-1 max-h-48 overflow-y-auto overscroll-contain rounded-xl border border-[#dce5f1] bg-white p-1 shadow-xl"
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
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                value === option
                  ? "bg-[#edf3fc] font-semibold text-[#102f62]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="min-w-0 break-words">{option}</span>
              {value === option && (
                <Check size={15} className="shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = Array.isArray(value) ? value : [];

  useEffect(() => {
    const outside = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
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

  const toggleService = (service) => {
    onChange(
      selected.includes(service)
        ? selected.filter((item) => item !== service)
        : [...selected, service]
    );
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={`${inputClass} flex items-center justify-between gap-2 text-left`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected.length
            ? `${selected.length} services selected`
            : "Select event services"}
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[150] mt-1 max-h-56 overflow-y-auto rounded-xl border border-[#dce5f1] bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
            <span className="text-xs font-semibold text-[#10264d]">
              Select Services
            </span>

            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-blue-700"
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
                onClick={() => toggleService(service)}
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
                <span className="break-words">{service}</span>
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
                onClick={() => toggleService(service)}
                aria-label={`Remove ${service}`}
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
        <Dropdown
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
          className={inputClass}
        />
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-2.5 border-b border-[#edf1f6] pb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3fc] text-[#17477e]">
        <Icon size={17} />
      </div>
      <h3 className="text-sm font-bold text-[#10264d]">{title}</h3>
    </div>
  );
}

function Badge({ value, colors }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        colors[value] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {value || "—"}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#e5ebf3] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
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
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
        {value === "" || value === undefined || value === null
          ? "—"
          : value}
      </p>
    </div>
  );
}

export default function EventManagement() {
  const [events, setEvents] = useState(() => {
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    ...emptyForm,
    services: [],
  });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "false";
    } catch {
      return true;
    }
  });

  const firstInputRef = useRef(null);

  const sound = (type = "click") => {
    if (soundEnabled) playTone(type);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Ignore storage errors.
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(soundEnabled));
    } catch {
      // Ignore storage errors.
    }
  }, [soundEnabled]);

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

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return events.filter((item) => {
      const matchesSearch = [
        item.eventName,
        item.customer,
        item.phone,
        item.eventType,
        item.venue,
        item.coordinator,
        item.status,
        item.priority,
        item.id,
        ...(Array.isArray(item.services) ? item.services : []),
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesType =
        typeFilter === "All" || item.eventType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [events, search, statusFilter, typeFilter]);

  const totalBalance = events.reduce(
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
      title: "Total Events",
      value: events.length,
      icon: PartyPopper,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Planning Events",
      value: events.filter((item) => item.status === "Planning").length,
      icon: ClipboardList,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "Completed Events",
      value: events.filter((item) => item.status === "Completed").length,
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
    sound("open");
    setEditingId(null);
    setForm({ ...emptyForm, services: [] });
    setError("");
    setOpen(true);
  };

  const openEdit = (item) => {
    sound("open");
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      ...item,
      services: Array.isArray(item.services)
        ? [...item.services]
        : [],
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

  const saveEvent = (event) => {
    event.preventDefault();

    const customer = String(form.customer || "").trim();
    const eventName = String(form.eventName || "").trim();
    const phone = String(form.phone || "").trim();

    if (!customer || !eventName) {
      setError("Please enter event name and customer name.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!form.eventDate || !String(form.venue || "").trim()) {
      setError("Please enter event date and venue.");
      return;
    }

    if (
      form.startTime &&
      form.endTime &&
      form.endTime <= form.startTime
    ) {
      setError("End time must be after start time.");
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
            `EVENT-${Date.now()}`,
      eventName,
      customer,
      phone,
      venue: String(form.venue || "").trim(),
      guests: Number(form.guests || 0),
      amount,
      advance,
      services: Array.isArray(form.services) ? form.services : [],
    };

    if (editingId !== null) {
      setEvents((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );

      setNotice("Event updated successfully.");
    } else {
      setEvents((previous) => [record, ...previous]);
      setNotice("Event added successfully.");
    }

    sound("success");
    closeForm();
  };

  const deleteEvent = (item) => {
    if (
      !window.confirm(`Delete "${item.eventName}" event?`)
    ) {
      return;
    }

    setEvents((previous) =>
      previous.filter((record) => record.id !== item.id)
    );

    sound("delete");
    setNotice("Event deleted successfully.");
  };

  const updateStatus = (id, status) => {
    setEvents((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    sound();
    setNotice("Event status updated.");
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f5f7fb] px-3 py-5 text-[#10264d] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* NOTIFICATION */}
        {notice &&
          createPortal(
            <div className="fixed left-3 right-3 top-4 z-[10001] flex items-center gap-3 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 shadow-xl sm:left-auto sm:right-5 sm:max-w-md">
              <CheckCircle2
                size={19}
                className="shrink-0 text-emerald-600"
              />
              <p className="flex-1 text-sm font-semibold">
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
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white">
                <PartyPopper size={22} />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-[29px]">
                  Event Management
                </h1>
                <p className="mt-1 text-xs text-[#8290a5] sm:text-sm">
                  Manage events, planning, coordinators and payments.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setSoundEnabled((previous) => !previous)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm font-semibold text-[#102f62] hover:bg-blue-50"
            >
              {soundEnabled ? (
                <Volume2 size={18} />
              ) : (
                <VolumeX size={18} />
              )}
              Sound {soundEnabled ? "On" : "Off"}
            </button>

            <button
              type="button"
              onClick={openAdd}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#102f62] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c477e]"
            >
              <Plus size={18} />
              Add Event
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* EVENT DIRECTORY */}
        <section className="min-w-0 rounded-2xl border border-[#e5ebf3] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#edf1f6] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div>
              <h2 className="text-lg font-bold">Event Bookings</h2>
              <p className="mt-1 text-xs text-[#8290a5]">
                {filteredEvents.length} events found
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[230px_190px_160px]">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search events..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <Dropdown
                value={
                  typeFilter === "All"
                    ? "All Event Types"
                    : typeFilter
                }
                options={["All Event Types", ...EVENT_TYPES]}
                onChange={(value) => {
                  setTypeFilter(
                    value === "All Event Types" ? "All" : value
                  );
                  sound();
                }}
              />

              <Dropdown
                value={
                  statusFilter === "All"
                    ? "All Status"
                    : statusFilter
                }
                options={["All Status", ...STATUSES]}
                onChange={(value) => {
                  setStatusFilter(
                    value === "All Status" ? "All" : value
                  );
                  sound();
                }}
              />
            </div>
          </div>

          {/* MOBILE / TABLET CARDS */}
          <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 xl:hidden">
            {filteredEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center sm:col-span-2">
                <Users size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  No events found.
                </p>
              </div>
            ) : (
              filteredEvents.map((item) => (
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
                        <h3 className="break-words text-sm font-bold">
                          {item.eventName}
                        </h3>
                        <p className="mt-1 text-xs text-[#7e93af]">
                          {item.customer}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge
                            value={item.status}
                            colors={STATUS_COLORS}
                          />
                          <Badge
                            value={item.priority}
                            colors={PRIORITY_COLORS}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        aria-label="Edit event"
                        className="rounded-lg bg-blue-50 p-2 text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteEvent(item)}
                        aria-label="Delete event"
                        className="rounded-lg bg-red-50 p-2 text-red-600"
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
                    <Detail
                      label="Start Time"
                      value={item.startTime || "—"}
                    />
                    <Detail
                      label="End Time"
                      value={item.endTime || "—"}
                    />
                    <Detail label="Venue" value={item.venue} />
                    <Detail
                      label="Coordinator"
                      value={item.coordinator}
                    />
                    <Detail label="Guests" value={item.guests} />
                    <Detail label="Phone" value={item.phone} />
                    <Detail
                      label="Total Budget"
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
                      Event Services
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
                      Update Status
                    </p>

                    <Dropdown
                      value={item.status || "Planning"}
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
            <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
              <thead className="bg-[#f7f9fd]">
                <tr className="text-[11px] font-bold uppercase tracking-wide text-[#8290a5]">
                  {[
                    "Event / Customer",
                    "Event Type",
                    "Date & Time",
                    "Venue",
                    "Coordinator",
                    "Guests",
                    "Budget",
                    "Balance",
                    "Priority",
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
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-16 text-center text-slate-400"
                    >
                      No events found.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#f8faff]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#10264d]">
                          {item.eventName}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.customer}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {item.phone}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-[#52627b]">
                        {item.eventType}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <p className="text-[#52627b]">
                          {formatDate(item.eventDate)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.startTime || "—"} -{" "}
                          {item.endTime || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-[#52627b]">
                        {item.venue || "—"}
                      </td>

                      <td className="px-4 py-4 text-[#52627b]">
                        {item.coordinator || "—"}
                      </td>

                      <td className="px-4 py-4 text-[#52627b]">
                        {item.guests || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold">
                        {money(item.amount)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-red-600">
                        {money(
                          Math.max(
                            0,
                            Number(item.amount || 0) -
                              Number(item.advance || 0)
                          )
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          value={item.priority}
                          colors={PRIORITY_COLORS}
                        />
                      </td>

                      <td className="min-w-[160px] px-4 py-4">
                        <div className="mb-2">
                          <Badge
                            value={item.status}
                            colors={STATUS_COLORS}
                          />
                        </div>

                        <Dropdown
                          value={item.status || "Planning"}
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
                            title="Edit event"
                            className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteEvent(item)}
                            title="Delete event"
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
              Showing {filteredEvents.length} of {events.length} events
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
              if (event.target === event.currentTarget) {
                closeForm();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-modal-title"
              className="flex max-h-[calc(100dvh-16px)] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-[#dce5f1] bg-white shadow-2xl sm:max-h-[calc(100dvh-32px)]"
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
                      id="event-modal-title"
                      className="text-base font-bold sm:text-xl"
                    >
                      {editingId !== null
                        ? "Edit Event"
                        : "Add New Event"}
                    </h2>
                    <p className="mt-1 text-xs text-[#8290a5]">
                      Enter event planning and booking details
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
                onSubmit={saveEvent}
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
                          Customer / Client Name
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
                          className={inputClass}
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
                      title="Event Information"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Event Name"
                        name="eventName"
                        value={form.eventName}
                        onChange={updateForm}
                        placeholder="Enter event name"
                        required
                      />

                      <Field
                        label="Event Type"
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
                        options={
                          VENUES.includes(form.venue)
                            ? VENUES
                            : [form.venue, ...VENUES]
                        }
                        required
                      />

                      <Field
                        label="Start Time"
                        name="startTime"
                        type="time"
                        value={form.startTime}
                        onChange={updateForm}
                      />

                      <Field
                        label="End Time"
                        name="endTime"
                        type="time"
                        value={form.endTime}
                        onChange={updateForm}
                      />

                      <Field
                        label="Event Coordinator"
                        name="coordinator"
                        value={form.coordinator}
                        onChange={updateForm}
                        options={
                          COORDINATORS.includes(form.coordinator)
                            ? COORDINATORS
                            : [form.coordinator, ...COORDINATORS]
                        }
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
                        label="Event Priority"
                        name="priority"
                        value={form.priority}
                        onChange={updateForm}
                        options={PRIORITIES}
                      />

                      <Field
                        label="Event Status"
                        name="status"
                        value={form.status}
                        onChange={updateForm}
                        options={STATUSES}
                      />
                    </div>
                  </section>

                  {/* SERVICES */}
                  <section>
                    <SectionTitle
                      icon={BriefcaseBusiness}
                      title="Event Services"
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
                      title="Budget & Payment Details"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Total Event Budget (₹)"
                        name="amount"
                        type="number"
                        value={form.amount}
                        onChange={updateForm}
                        placeholder="Enter event budget"
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
                        placeholder="Enter event requirements, special instructions or planning notes..."
                        className={`${inputClass} resize-y`}
                      />
                    </label>
                  </section>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                    >
                      <AlertCircle size={18} className="shrink-0" />
                      {error}
                    </div>
                  )}
                </div>

                {/* MODAL FOOTER */}
                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e9eef5] bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-7">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="w-full rounded-xl border border-[#dce5f1] bg-[#f8fafd] px-6 py-3 text-sm font-semibold text-[#344767] hover:bg-[#edf3fc] sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102f62] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1c477e] sm:w-auto"
                  >
                    <Save size={17} />
                    {editingId !== null
                      ? "Update Event"
                      : "Save Event"}
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
