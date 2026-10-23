
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Settings as SettingsIcon,
  Users,
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Phone,
  Mail,
  UserRound,
  IndianRupee,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  ChevronDown,
  Eye,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const STAFF_KEY = "studioraw_staff";
const STUDIO_KEY = "studioraw_studio_settings";
const SOUND_KEY = "studioraw_settings_sounds";

const STAFF_NAMES = [
  "Arun Kumar",
  "Priya Devi",
  "Karthik Raj",
  "Divya S",
  "Vijay Anand",
  "Meena R",
  "Sanjay Kumar",
  "Nithya P",
  "Rahul M",
  "Anitha S",
  "Praveen Raj",
  "Keerthana M",
  "Dinesh Kumar",
  "Swetha R",
  "Manoj S",
  "Harini Devi",
  "Ajith Kumar",
  "Kavya R",
  "Rohit S",
  "Deepa N",
  "Sathish Kumar",
  "Lakshmi P",
  "Ganesh R",
  "Aishwarya S",
  "Bala Murugan",
  "Fathima A",
  "Ramesh K",
  "Anu Joseph",
  "Saravanan M",
  "Janani R",
];

const STAFF_DETAILS = [
  ["Photographer", "Production", 28000, "Active"],
  ["Photo Editor", "Editing", 26000, "Active"],
  ["Videographer", "Production", 32000, "Active"],
  ["Album Designer", "Design", 24000, "On Leave"],
  ["Studio Manager", "Administration", 45000, "Active"],
  ["Sales Executive", "Sales", 23000, "Active"],
  ["Candid Photographer", "Production", 30000, "Active"],
  ["Video Editor", "Editing", 27500, "Active"],
  ["Delivery Staff", "Delivery", 18000, "Inactive"],
  ["Photographer", "Production", 29000, "Active"],
  ["Videographer", "Production", 31000, "Active"],
  ["Album Designer", "Design", 25000, "Active"],
  ["Photo Editor", "Editing", 26500, "On Leave"],
  ["Sales Executive", "Sales", 22000, "Active"],
  ["Delivery Staff", "Delivery", 18500, "Active"],
  ["Photographer", "Production", 28500, "Active"],
  ["Video Editor", "Editing", 29000, "Active"],
  ["Studio Coordinator", "Administration", 30000, "Active"],
  ["Candid Photographer", "Production", 31500, "On Leave"],
  ["Album Designer", "Design", 24500, "Active"],
  ["Videographer", "Production", 33500, "Active"],
  ["Receptionist", "Administration", 20000, "Active"],
  ["Photo Editor", "Editing", 27000, "Active"],
  ["Sales Executive", "Sales", 23500, "Inactive"],
  ["Lighting Technician", "Production", 22500, "Active"],
  ["Customer Support", "Sales", 21500, "Active"],
  ["Delivery Staff", "Delivery", 19000, "Active"],
  ["Photographer", "Production", 30500, "Active"],
  ["Video Editor", "Editing", 28000, "On Leave"],
  ["Studio Assistant", "Administration", 19500, "Active"],
];

const DEMO_STAFF = STAFF_NAMES.map((name, index) => {
  const [role, department, salary, status] = STAFF_DETAILS[index];

  return {
    id: `demo-${String(index + 1).padStart(2, "0")}`,
    name,
    phone: `900000${String(index + 1001)}`,
    email: `${name
      .toLowerCase()
      .replace(/[^a-z ]/g, "")
      .replace(/\s+/g, ".")}.${index + 1}@example.com`,
    role,
    department,
    salary,
    joiningDate: `${2024 + (index % 3)}-${String(
      (index % 12) + 1
    ).padStart(2, "0")}-${String((index % 25) + 1).padStart(2, "0")}`,
    status,
    notes: `${role} responsible for ${department.toLowerCase()} activities at Studio Raw Picturez.`,
  };
});

const roles = [
  "Photographer",
  "Videographer",
  "Candid Photographer",
  "Photo Editor",
  "Video Editor",
  "Album Designer",
  "Studio Manager",
  "Studio Coordinator",
  "Studio Assistant",
  "Receptionist",
  "Sales Executive",
  "Customer Support",
  "Lighting Technician",
  "Delivery Staff",
  "Other",
];

const departments = [
  "Production",
  "Editing",
  "Design",
  "Administration",
  "Sales",
  "Delivery",
  "Other",
];

const statuses = ["Active", "On Leave", "Inactive"];

const initialStudio = {
  name: "Studio Raw Picturez",
  email: "contact@studiorawpicturez.com",
  phone: "9876543210",
  whatsapp: "9876543210",
  address: "Studio Raw Picturez, Main Road",
  city: "Nagercoil",
  state: "Tamil Nadu",
  gst: "",
  currency: "INR",
  invoicePrefix: "SRP",
  description:
    "Professional wedding photography, cinematography, portraits, albums and creative photography services.",
};

const emptyStaff = {
  name: "",
  phone: "",
  email: "",
  role: "Photographer",
  department: "Production",
  salary: "",
  joiningDate: "",
  status: "Active",
  notes: "",
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#dce5f2] bg-white px-3.5 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#244d8b] focus:ring-2 focus:ring-blue-100";

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `staff-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );
}

function useSettingsSounds() {
  const [enabled, setEnabled] = useState(
    () => readStored(SOUND_KEY, true) !== false
  );

  const audioRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, JSON.stringify(enabled));
    } catch {
      // Ignore unavailable storage.
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio && audio.state !== "closed") {
        audio.close().catch(() => {});
      }
    };
  }, []);

  const play = (type = "click") => {
    if (!enabled) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioRef.current || audioRef.current.state === "closed") {
        audioRef.current = new AudioContextClass();
      }

      const ctx = audioRef.current;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const notes = {
        click: [[580, 0, 0.055]],
        open: [
          [520, 0, 0.07],
          [720, 0.08, 0.09],
        ],
        success: [
          [520, 0, 0.08],
          [660, 0.09, 0.09],
          [880, 0.19, 0.13],
        ],
        delete: [
          [440, 0, 0.09],
          [290, 0.1, 0.12],
        ],
        error: [
          [250, 0, 0.09],
          [190, 0.1, 0.12],
        ],
      };

      (notes[type] || notes.click).forEach(
        ([frequency, delay, duration]) => {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = ctx.currentTime + delay;

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, start);

          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(
            0.045,
            start + 0.012
          );
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            start + duration
          );

          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.start(start);
          oscillator.stop(start + duration + 0.01);
        }
      );
    } catch {
      // Sound is optional.
    }
  };

  return { enabled, setEnabled, play };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
  min,
  maxLength,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-bold text-[#29416a]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative min-w-0">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8196b6]"
          />
        )}

        <input
          type={type}
          min={min}
          maxLength={maxLength}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder || label}
          required={required}
          className={`${inputClass} ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-bold text-[#29416a]">
        {label}
      </label>

      <div className="relative min-w-0">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} appearance-none pr-10`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8196b6]"
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "border-blue-200 bg-blue-50 text-blue-800",
    Inactive: "border-slate-200 bg-slate-100 text-slate-600",
    "On Leave": "border-indigo-200 bg-indigo-50 text-indigo-700",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        styles[status] || styles.Inactive
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Inactive"}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#10264d] to-[#315b99]" />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {title}
          </p>

          <h3 className="mt-3 break-words text-xl font-extrabold text-[#10264d] sm:text-2xl">
            {value}
          </h3>
        </div>

        <div className="shrink-0 rounded-xl bg-[#eaf1fc] p-2.5 text-[#173d77] sm:p-3">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  width = "max-w-3xl",
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-5">
      <div
        className="absolute inset-0 bg-[#07172b]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[95dvh] w-full min-w-0 ${width} flex-col overflow-hidden rounded-2xl border border-white/30 bg-[#f4f7fc] shadow-2xl sm:rounded-3xl`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e0e7f1] bg-white px-4 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#315b99]">
              Studio Raw / Settings
            </p>

            <h2 className="text-lg font-extrabold text-[#10264d] sm:text-xl">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-xs text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-xl border border-[#dce5f2] bg-white p-2.5 text-[#10264d] transition hover:bg-[#eaf1fc]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#e5ebf4] bg-[#f7f9fd] p-3.5">
      <p className="text-[11px] text-slate-500">{label}</p>

      <p className="mt-1.5 break-words text-sm font-bold leading-relaxed text-[#10264d]">
        {value || "—"}
      </p>
    </div>
  );
}

function StaffCard({ item, onView, onEdit, onDelete }) {
  return (
    <article className="group flex min-w-0 flex-col rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#b9cce7] hover:shadow-lg sm:p-5">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10264d] to-[#315b99] text-lg font-extrabold text-white">
            {String(item.name || "S").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-extrabold text-[#10264d]">
              {item.name}
            </h3>

            <p className="mt-1 truncate text-xs text-[#8190a6]">
              {item.role}
            </p>
          </div>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <InfoBox label="Phone" value={item.phone} />
        <InfoBox label="Department" value={item.department} />
        <InfoBox
          label="Joining Date"
          value={formatDate(item.joiningDate)}
        />
        <InfoBox
          label="Monthly Salary"
          value={money(item.salary)}
        />
      </div>

      <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl bg-[#f7f9fd] px-3 py-3 text-xs text-slate-500">
        <Mail size={14} className="shrink-0 text-[#315b99]" />
        <span className="min-w-0 truncate">
          {item.email || "No email available"}
        </span>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[#edf1f7] pt-4">
        <button
          type="button"
          onClick={() => onView(item)}
          className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#eaf1fc] px-2 py-2.5 text-xs font-bold text-[#173d77] transition hover:bg-[#dce9fb]"
        >
          <Eye size={15} />
          View
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[#eaf1fc] px-2 py-2.5 text-xs font-bold text-[#173d77] transition hover:bg-[#dce9fb]"
        >
          <Pencil size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(item)}
          className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </article>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("studio");

  const [studio, setStudio] = useState(() => ({
    ...initialStudio,
    ...readStored(STUDIO_KEY, {}),
  }));

  const [staff, setStaff] = useState(() => {
    const saved = readStored(STAFF_KEY, null);

    if (Array.isArray(saved)) {
      return saved;
    }

    return DEMO_STAFF.map((item) => ({ ...item }));
  });

  const [form, setForm] = useState({ ...emptyStaff });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);
  const [deleteStaff, setDeleteStaff] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");

  const toastTimer = useRef(null);

  const { enabled, setEnabled, play } = useSettingsSounds();

  useEffect(() => {
    try {
      localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
    } catch (error) {
      console.error("Unable to save staff:", error);
    }
  }, [staff]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showMessage = (message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setSavedMessage(message);

    toastTimer.current = setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  const updateStudio = (key, value) => {
    setStudio((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
  };

  const saveStudio = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(STUDIO_KEY, JSON.stringify(studio));
      play("success");
      showMessage("Studio settings saved successfully.");
    } catch {
      play("error");
      showMessage("Unable to save studio settings.");
    }
  };

  const openAdd = () => {
    play("open");
    setEditingId(null);
    setForm({ ...emptyStaff });
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    play("open");
    setEditingId(item.id);
    setForm({ ...emptyStaff, ...item });
    setError("");
    setViewStaff(null);
    setShowForm(true);
  };

  const closeForm = () => {
    play("click");
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const saveStaff = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Staff name is required.");
      play("error");
      return;
    }

    if (!/^\d{10}$/.test(String(form.phone).trim())) {
      setError("Please enter a valid 10-digit phone number.");
      play("error");
      return;
    }

    if (
      form.salary !== "" &&
      (!Number.isFinite(Number(form.salary)) ||
        Number(form.salary) < 0)
    ) {
      setError("Please enter a valid monthly salary.");
      play("error");
      return;
    }

    const duplicate = staff.some(
      (item) =>
        item.id !== editingId &&
        String(item.phone).trim() === String(form.phone).trim()
    );

    if (duplicate) {
      setError("This phone number is already registered.");
      play("error");
      return;
    }

    const record = {
      ...form,
      id: editingId || makeId(),
      name: form.name.trim(),
      phone: String(form.phone).trim(),
      email: form.email.trim(),
      salary: Number(form.salary) || 0,
      notes: form.notes.trim(),
    };

    if (editingId) {
      setStaff((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );

      showMessage("Staff updated successfully.");
    } else {
      setStaff((previous) => [record, ...previous]);
      showMessage("Staff added successfully.");
    }

    play("success");
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyStaff });
    setError("");
  };

  const confirmDelete = () => {
    if (!deleteStaff) return;

    setStaff((previous) =>
      previous.filter((item) => item.id !== deleteStaff.id)
    );

    setDeleteStaff(null);
    setViewStaff(null);

    play("delete");
    showMessage("Staff deleted successfully.");
  };

  const resetDemo = () => {
    play("click");

    if (
      !window.confirm(
        "Restore all 30 demo staff records? This will replace your current saved staff records."
      )
    ) {
      return;
    }

    setStaff(DEMO_STAFF.map((item) => ({ ...item })));
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");

    play("success");
    showMessage("30 demo staff records restored.");
  };

  const filteredStaff = useMemo(() => {
    const query = search.toLowerCase().trim();

    return staff.filter((item) => {
      const matchesSearch = [
        item.name,
        item.phone,
        item.email,
        item.role,
        item.department,
        item.status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesRole =
        roleFilter === "All" || item.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, search, roleFilter, statusFilter]);

  const activeCount = staff.filter(
    (item) => item.status === "Active"
  ).length;

  const inactiveCount = staff.filter(
    (item) => item.status === "Inactive"
  ).length;

  const onLeaveCount = staff.filter(
    (item) => item.status === "On Leave"
  ).length;

  const totalSalary = staff.reduce(
    (sum, item) => sum + (Number(item.salary) || 0),
    0
  );

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f7fc] px-3 py-4 text-[#10264d] sm:px-5 sm:py-6 lg:px-7 lg:py-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#315b99]">
            <SettingsIcon size={15} />
            Studio Administration
          </div>

          <h1 className="text-2xl font-extrabold  text-blue-900 sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-xs text-slate-500 sm:text-sm">
            Manage studio information and team members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3 py-2.5 text-xs font-semibold text-[#173d77] shadow-sm sm:px-4">
            <ShieldCheck size={17} />
            Studio Raw Picturez ERP
          </div>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {savedMessage && (
        <div
          role="status"
          className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#173d77]"
        >
          <CheckCircle2 size={19} className="shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* TABS */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-[#e0e7f1] bg-white p-2 shadow-sm sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => {
            play("click");
            setActiveTab("studio");
          }}
          className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-bold transition sm:px-5 sm:text-sm ${
            activeTab === "studio"
              ? "bg-[#10264d] text-white shadow-md"
              : "text-[#526581] hover:bg-[#f0f4fa]"
          }`}
        >
          <Building2 size={17} className="shrink-0" />
          <span>Studio Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            play("click");
            setActiveTab("staff");
          }}
          className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-bold transition sm:px-5 sm:text-sm ${
            activeTab === "staff"
              ? "bg-[#10264d] text-white shadow-md"
              : "text-[#526581] hover:bg-[#f0f4fa]"
          }`}
        >
          <Users size={17} className="shrink-0" />
          <span>Team Members</span>

          <span
            className={`rounded-lg px-1.5 py-0.5 text-[10px] ${
              activeTab === "staff"
                ? "bg-white/20 text-white"
                : "bg-[#eaf1fc] text-[#173d77]"
            }`}
          >
            {staff.length}
          </span>
        </button>
      </div>

      {/* STUDIO SETTINGS */}
      {activeTab === "studio" && (
        <form onSubmit={saveStudio}>
          <div className="overflow-hidden rounded-2xl border border-[#e0e7f1] bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#10264d] to-[#244d8b] px-4 py-5 text-white sm:px-8 sm:py-6">
              <div className="flex items-center gap-3">
                <div className="shrink-0 rounded-xl bg-white/15 p-3">
                  <Building2 size={23} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold">
                    Studio Information
                  </h2>

                  <p className="mt-1 text-xs text-blue-100">
                    Manage your studio profile and business details.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-7 lg:p-8">
              <Field
                label="Studio Name"
                value={studio.name}
                onChange={(value) => updateStudio("name", value)}
                icon={Building2}
                required
              />

              <Field
                label="Email Address"
                value={studio.email}
                onChange={(value) => updateStudio("email", value)}
                icon={Mail}
                type="email"
              />

              <Field
                label="Phone Number"
                value={studio.phone}
                onChange={(value) => updateStudio("phone", value)}
                icon={Phone}
              />

              <Field
                label="WhatsApp Number"
                value={studio.whatsapp}
                onChange={(value) => updateStudio("whatsapp", value)}
                icon={Phone}
              />

              <div className="sm:col-span-2">
                <Field
                  label="Studio Address"
                  value={studio.address}
                  onChange={(value) => updateStudio("address", value)}
                  icon={MapPin}
                />
              </div>

              <Field
                label="City"
                value={studio.city}
                onChange={(value) => updateStudio("city", value)}
              />

              <Field
                label="State"
                value={studio.state}
                onChange={(value) => updateStudio("state", value)}
              />

              <Field
                label="GST Number"
                value={studio.gst}
                onChange={(value) => updateStudio("gst", value)}
              />

              <Field
                label="Invoice Prefix"
                value={studio.invoicePrefix}
                onChange={(value) =>
                  updateStudio("invoicePrefix", value)
                }
              />

              {/* <SelectField
                label="Currency"
                value={studio.currency}
                onChange={(value) => updateStudio("currency", value)}
                options={["INR", "USD", "EUR"]}
              /> */}

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold text-[#29416a]">
                  Studio Description
                </label>

                <textarea
                  rows={4}
                  value={studio.description}
                  onChange={(event) =>
                    updateStudio("description", event.target.value)
                  }
                  placeholder="Enter studio description"
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e0e7f1] bg-[#fafcff] px-4 py-4 sm:px-8 sm:py-5">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#244d8b] sm:w-auto"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TEAM MEMBERS */}
      {activeTab === "staff" && (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              title="Total Staff"
              value={staff.length}
              icon={Users}
              subtitle="Registered team members"
            />

            <StatCard
              title="Active Staff"
              value={activeCount}
              icon={CheckCircle2}
              subtitle="Currently active"
            />

            <StatCard
              title="On Leave"
              value={onLeaveCount}
              icon={Clock3}
              subtitle="Currently on leave"
            />

            <StatCard
              title="Monthly Salary"
              value={money(totalSalary)}
              icon={IndianRupee}
              subtitle="Total monthly payroll"
            />
          </div>

          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e0e7f1] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#e0e7f1] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#10264d]">
                  <Users size={21} />
                  Team Members
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage photographers, editors and studio employees.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetDemo}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3 py-2.5 text-xs font-bold text-[#173d77] transition hover:bg-[#eaf1fc] sm:flex-none sm:px-4 sm:text-sm"
                >
                  <RefreshCw size={16} />
                  Reset Demo
                </button>

                <button
                  type="button"
                  onClick={openAdd}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#244d8b] sm:flex-none sm:px-5 sm:text-sm"
                >
                  <Plus size={18} />
                  Add Staff
                </button>
              </div>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 gap-3 border-b border-[#e0e7f1] p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-[minmax(0,1fr)_220px_180px]">
              <div className="relative min-w-0">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search staff, phone, role..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="relative min-w-0">
                <select
                  value={roleFilter}
                  onChange={(event) => {
                    play("click");
                    setRoleFilter(event.target.value);
                  }}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="All">All Roles</option>

                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    play("click");
                    setStatusFilter(event.target.value);
                  }}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="All">All Status</option>

                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* STAFF CARDS */}
            {filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="mb-4 rounded-2xl bg-[#eaf1fc] p-5 text-[#173d77]">
                  <Users size={32} />
                </div>

                <h3 className="text-base font-bold text-[#10264d]">
                  No staff found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search or add a new team member.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("All");
                    setStatusFilter("All");
                    play("click");
                  }}
                  className="mt-5 rounded-xl bg-[#10264d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#244d8b]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 2xl:grid-cols-3">
                {filteredStaff.map((item) => (
                  <StaffCard
                    key={item.id}
                    item={item}
                    onView={(record) => {
                      play("open");
                      setViewStaff(record);
                    }}
                    onEdit={openEdit}
                    onDelete={(record) => {
                      play("click");
                      setDeleteStaff(record);
                    }}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1 border-t border-[#edf1f7] px-4 py-4 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6">
              <span>
                Showing {filteredStaff.length} of {staff.length} team members
              </span>

              <span>{inactiveCount} inactive members</span>
            </div>
          </section>
        </div>
      )}

      {/* ADD / EDIT STAFF */}
      {showForm && (
        <Modal
          title={editingId ? "Edit Staff Member" : "Add Staff Member"}
          subtitle="Enter team member details."
          onClose={closeForm}
        >
          <form onSubmit={saveStaff}>
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle size={17} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#e0e7f1] bg-white p-4 sm:grid-cols-2 sm:gap-5 sm:p-5">
              <div className="sm:col-span-2">
                <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#10264d]">
                  <UserRound size={17} />
                  Personal Information
                </h3>
                <p className="mb-4 text-xs text-slate-500">
                  Basic contact information.
                </p>
              </div>

              <Field
                label="Full Name"
                value={form.name}
                onChange={(value) => updateForm("name", value)}
                icon={UserRound}
                required
              />

              <Field
                label="Phone Number"
                value={form.phone}
                onChange={(value) => updateForm("phone", value)}
                icon={Phone}
                type="tel"
                maxLength={10}
                required
              />

              <div className="sm:col-span-2">
                <Field
                  label="Email Address"
                  value={form.email}
                  onChange={(value) => updateForm("email", value)}
                  type="email"
                  icon={Mail}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-[#e0e7f1] bg-white p-4 sm:grid-cols-2 sm:gap-5 sm:p-5">
              <div className="sm:col-span-2">
                <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#10264d]">
                  <BriefcaseBusiness size={17} />
                  Employment Details
                </h3>
                <p className="mb-4 text-xs text-slate-500">
                  Role, salary and joining information.
                </p>
              </div>

              <SelectField
                label="Role"
                value={form.role}
                onChange={(value) => updateForm("role", value)}
                options={roles}
              />

              <SelectField
                label="Department"
                value={form.department}
                onChange={(value) => updateForm("department", value)}
                options={departments}
              />

              <Field
                label="Monthly Salary"
                value={form.salary}
                onChange={(value) => updateForm("salary", value)}
                type="number"
                min="0"
                icon={IndianRupee}
              />

              <Field
                label="Joining Date"
                value={form.joiningDate}
                onChange={(value) => updateForm("joiningDate", value)}
                type="date"
                icon={CalendarDays}
              />

              <div className="sm:col-span-2">
                <SelectField
                  label="Staff Status"
                  value={form.status}
                  onChange={(value) => updateForm("status", value)}
                  options={statuses}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold text-[#29416a]">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    updateForm("notes", event.target.value)
                  }
                  placeholder="Additional staff information..."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-[#dce5f2] bg-white px-5 py-3 text-sm font-bold text-[#526581] hover:bg-[#eaf1fc]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white hover:bg-[#244d8b]"
              >
                <Save size={17} />
                {editingId ? "Update Staff" : "Save Staff"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW STAFF */}
      {viewStaff && (
        <Modal
          title="Staff Details"
          subtitle="Complete team member information."
          onClose={() => {
            play("click");
            setViewStaff(null);
          }}
          width="max-w-xl"
        >
          <div className="mb-5 flex min-w-0 flex-wrap items-center gap-4 rounded-2xl border border-[#e0e7f1] bg-white p-4 sm:p-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#10264d] text-2xl font-extrabold text-white">
              {String(viewStaff.name || "S").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-lg font-extrabold text-[#10264d]">
                {viewStaff.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {viewStaff.role}
              </p>

              <div className="mt-2">
                <StatusBadge status={viewStaff.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {[
              ["Phone Number", viewStaff.phone],
              ["Email Address", viewStaff.email],
              ["Role", viewStaff.role],
              ["Department", viewStaff.department],
              ["Monthly Salary", money(viewStaff.salary)],
              ["Joining Date", formatDate(viewStaff.joiningDate)],
              ["Status", viewStaff.status],
              ["Notes", viewStaff.notes],
            ].map(([label, value]) => (
              <InfoBox key={label} label={label} value={value} />
            ))}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => {
                play("click");
                setViewStaff(null);
              }}
              className="rounded-xl border border-[#dce5f2] bg-white px-5 py-3 text-sm font-bold text-[#526581]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => openEdit(viewStaff)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-bold text-white hover:bg-[#244d8b]"
            >
              <Pencil size={16} />
              Edit Staff
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteStaff && (
        <Modal
          title="Delete Staff Member"
          subtitle="Please confirm this action."
          onClose={() => {
            play("click");
            setDeleteStaff(null);
          }}
          width="max-w-md"
        >
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 rounded-2xl bg-rose-50 p-5 text-rose-600">
              <Trash2 size={28} />
            </div>

            <h3 className="break-words text-lg font-extrabold text-[#10264d]">
              Delete {deleteStaff.name}?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              This staff record will be removed from the saved team
              members list. This action cannot be undone.
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center sm:gap-3">
            <button
              type="button"
              onClick={() => {
                play("click");
                setDeleteStaff(null);
              }}
              className="rounded-xl border border-[#dce5f2] bg-white px-6 py-3 text-sm font-bold text-[#526581]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white hover:bg-rose-700"
            >
              <Trash2 size={16} />
              Delete Staff
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
