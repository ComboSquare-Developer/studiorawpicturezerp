
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  ClipboardCheck,
  Camera,
  CalendarDays,
  MapPin,
  UserRound,
  Trash2,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Pencil,
  ChevronDown,
  Save,
  Users,
  Check,
  PackageCheck,
  CalendarClock,
} from "lucide-react";

const STORAGE_KEY = "studioraw_shoot_readiness";

const photographers = [
  "Arun Kumar",
  "Praveen Raj",
  "Karthik S",
  "Vignesh Kumar",
  "Sanjay R",
  "Rahul Photography",
  "Divya Photography",
];

const equipmentOptions = [
  "Sony A7 IV + 24-70mm Lens",
  "Canon EOS R6 + 50mm Lens",
  "Nikon Z6 II + 24-120mm Lens",
  "Camera + Portrait Lens Kit",
  "Wedding Photography Kit",
  "Studio Lighting + Softbox Kit",
  "Gimbal + Camera Stabilizer",
  "Drone + Aerial Photography Kit",
  "Tripod + External Flash Kit",
  "Complete Photography Equipment Kit",
];

const teamOptions = [
  "Photographer + 1 Assistant",
  "Photographer + 2 Assistants",
  "Photographer + Videographer",
  "Photographer + Videographer + Editor",
  "2 Photographers + 1 Videographer",
  "Full Wedding Photography Team",
  "Studio Photography Team",
];

const checklistItems = [
  "Client requirements confirmed",
  "Shoot date and schedule confirmed",
  "Photographer and team assigned",
  "Camera body and backup camera checked",
  "Lenses cleaned and tested",
  "Lighting and flash equipment checked",
  "Batteries charged and spares packed",
  "Memory cards formatted and ready",
  "Shoot location and travel confirmed",
  "Client reminder and call completed",
];

const createEmptyForm = () => ({
  customer: "",
  event: "Wedding",
  shootDate: "",
  shootTime: "10:00",
  location: "",
  photographer: "",
  team: "",
  equipment: "",
  checklist: [],
});

const eventOptions = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Pre-Wedding",
  "Baby Shoot",
  "Portrait",
  "Corporate",
  "Fashion Shoot",
  "Product Photography",
  "Other",
];

const filterOptions = ["All", "Ready", "In Progress", "Pending"];

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getCompletedTasks = (item) => {
  const selected = Array.isArray(item?.checklist)
    ? item.checklist
    : [];

  return checklistItems.filter((task) =>
    selected.includes(task)
  ).length;
};

const getProgress = (item) =>
  Math.round(
    (getCompletedTasks(item) / checklistItems.length) * 100
  );

const getStatus = (item) => {
  const progress = getProgress(item);

  if (progress === 100) return "Ready";
  if (progress > 0) return "In Progress";
  return "Pending";
};

const statusStyle = {
  Ready: "border-emerald-100 bg-emerald-50 text-emerald-700",
  "In Progress": "border-blue-100 bg-blue-50 text-blue-700",
  Pending: "border-amber-100 bg-amber-50 text-amber-700",
};

const dateOffset = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

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

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return String(value);
  }

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
};

/* SAMPLE SHOOT DATA */

const createDemoShoots = () => [
  {
    id: "SHOOT-1001",
    customer: "Arun & Priya",
    event: "Wedding",
    shootDate: dateOffset(2),
    shootTime: "06:30",
    location: "Taj Wedding Hall, Nagercoil",
    photographer: "Arun Kumar",
    team: "Full Wedding Photography Team",
    equipment: "Wedding Photography Kit",
    checklist: checklistItems.slice(0, 8),
  },
  {
    id: "SHOOT-1002",
    customer: "Rahul & Divya",
    event: "Engagement",
    shootDate: dateOffset(4),
    shootTime: "10:00",
    location: "Ocean View Convention Centre",
    photographer: "Praveen Raj",
    team: "Photographer + Videographer",
    equipment: "Sony A7 IV + 24-70mm Lens",
    checklist: checklistItems.slice(0, 5),
  },
  {
    id: "SHOOT-1003",
    customer: "Kavin Birthday Shoot",
    event: "Birthday",
    shootDate: dateOffset(6),
    shootTime: "16:00",
    location: "Happy Moments Party Hall",
    photographer: "Divya Photography",
    team: "Studio Photography Team",
    equipment: "Studio Lighting + Softbox Kit",
    checklist: checklistItems.slice(0, 3),
  },
  {
    id: "SHOOT-1004",
    customer: "Vijay & Nisha",
    event: "Pre-Wedding",
    shootDate: dateOffset(8),
    shootTime: "07:00",
    location: "Muttom Beach",
    photographer: "Karthik S",
    team: "Photographer + 2 Assistants",
    equipment: "Drone + Aerial Photography Kit",
    checklist: [],
  },
  {
    id: "SHOOT-1005",
    customer: "Meera Portrait Session",
    event: "Portrait",
    shootDate: dateOffset(10),
    shootTime: "11:30",
    location: "Studio Raw Picturez",
    photographer: "Sanjay R",
    team: "Photographer + 1 Assistant",
    equipment: "Camera + Portrait Lens Kit",
    checklist: checklistItems.slice(0, 10),
  },
];

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select an option",
}) {
  return (
    <div className="relative w-full min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-11`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-semibold text-[#29416a]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#174b91] sm:h-11 sm:w-11">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[#10264d]">
          {title}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${
        statusStyle[status] || statusStyle.Pending
      }`}
    >
      {status}
    </span>
  );
}

function MobileDetail({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-[#91a0b5] sm:text-xs">
        {label}
      </p>

      <div className="mt-1 flex min-w-0 items-start gap-1.5">
        {Icon && (
          <Icon size={13} className="mt-0.5 shrink-0 text-[#4972a8]" />
        )}
        <p className="min-w-0 break-words text-[12px] font-semibold leading-5 text-[#10264d] sm:text-[13px]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ progress, completed, compact = false }) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-[#e6edf7] bg-[#f7faff] p-3"
          : "rounded-xl border border-slate-100 bg-white p-4"
      }
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className={`font-medium text-slate-500 ${compact ? "text-[11px]" : "text-xs"}`}>
          Preparation Progress
        </p>
        <p className={`font-bold text-[#10264d] ${compact ? "text-xs" : "text-sm"}`}>
          {progress}%
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Preparation progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className={`w-full overflow-hidden rounded-full bg-[#e4ebf5] ${
          compact ? "h-1.5" : "h-2.5"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            progress === 100 ? "bg-emerald-500" : "bg-blue-700"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className={`mt-2 text-slate-400 ${compact ? "text-[10px]" : "text-xs"}`}>
        {completed} of {checklistItems.length} tasks completed
      </p>
    </div>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  onSubmit,
  submitLabel,
  children,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152d]/65 p-2 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[96dvh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[93dvh] sm:rounded-[22px]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e5ebf3] bg-white px-5 py-4 sm:px-9 sm:py-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#112e60] text-white sm:h-12 sm:w-12">
              <ClipboardCheck size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold text-[#10264d] sm:text-[23px]">
                {title}
              </h2>
              <p className="mt-1 text-xs text-[#8090aa] sm:text-sm">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preparation form"
            className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-9 sm:py-6">
            {children}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e5ebf3] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-9">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#d9e3f2] bg-[#f7f9fd] px-7 py-3 text-sm font-semibold text-[#18345f] transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384]"
            >
              <Save size={18} />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function ShootReadiness() {
  const [shoots, setShoots] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      return Array.isArray(saved) && saved.length > 0
        ? saved
        : createDemoShoots();
    } catch {
      return createDemoShoots();
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shoots));
  }, [shoots]);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const openCreate = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      ...createEmptyForm(),
      ...item,
      checklist: Array.isArray(item.checklist) ? [...item.checklist] : [],
    });
    setEditingId(item.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
  };

  const saveShoot = (event) => {
    event.preventDefault();

    if (!form.customer.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!form.shootDate || !form.shootTime) {
      setError("Please select shoot date and time.");
      return;
    }

    const data = {
      ...form,
      customer: form.customer.trim(),
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `SHOOT-${Date.now()}`,
    };

    if (editingId) {
      setShoots((previous) =>
        previous.map((item) => item.id === editingId ? data : item)
      );
    } else {
      setShoots((previous) => [data, ...previous]);
    }

    closeForm();
  };

  const deleteShoot = (id) => {
    if (!window.confirm("Delete this shoot preparation?")) return;

    setShoots((previous) => previous.filter((item) => item.id !== id));
  };

  const toggleChecklist = (task) => {
    setForm((previous) => {
      const current = Array.isArray(previous.checklist)
        ? previous.checklist
        : [];

      return {
        ...previous,
        checklist: current.includes(task)
          ? current.filter((item) => item !== task)
          : [...current, task],
      };
    });
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return shoots.filter((item) => {
      const matches = [
        item.customer,
        item.event,
        item.photographer,
        item.location,
        item.team,
        item.equipment,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      return matches && (filter === "All" || getStatus(item) === filter);
    });
  }, [shoots, search, filter]);

  const stats = [
    {
      label: "Total Preparations",
      value: shoots.length,
      icon: ClipboardCheck,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Ready for Shoot",
      value: shoots.filter((item) => getStatus(item) === "Ready").length,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "In Progress",
      value: shoots.filter((item) => getStatus(item) === "In Progress").length,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Pending",
      value: shoots.filter((item) => getStatus(item) === "Pending").length,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-5 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:space-y-7 lg:bg-[#f5f7fb] lg:px-8 lg:py-8 2xl:px-10">
      {/* PAGE HEADER */}
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 hidden text-[11px] font-bold uppercase tracking-[0.17em] text-[#7e93af] lg:block">
            Photography Operations
          </p>

          <h1 className="text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl lg:text-[29px] lg:font-extrabold">
            Shoot Readiness & Equipment
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage shoot schedules, photography teams, equipment and readiness checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384] lg:w-auto lg:px-6"
        >
          <Plus size={18} />
          New Preparation
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="min-w-0 rounded-2xl border border-[#e5ebf3] bg-white p-3.5 shadow-[0_3px_14px_rgba(16,38,77,0.035)] transition hover:shadow-md sm:p-5 lg:hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold leading-4 text-slate-500 sm:text-sm">
                    {stat.label}
                  </p>
                  <h2 className={`mt-2 text-xl font-extrabold sm:mt-3 sm:text-3xl ${stat.color}`}>
                    {stat.value}
                  </h2>
                </div>

                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 sm:rounded-xl ${stat.bg}`}>
                  <Icon size={17} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SHOOT READINESS LIST */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-sm lg:rounded-[22px]">
        <div className="border-b border-[#edf1f6] p-4 sm:p-5 lg:px-6 lg:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Shoot Readiness List
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Monitor upcoming shoots and preparation progress.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full lg:w-72">
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer, event, team..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="w-full sm:w-44">
                <CustomDropdown
                  value={filter}
                  options={filterOptions}
                  onChange={setFilter}
                  placeholder="Filter status"
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <ClipboardCheck size={42} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-400">No shoot preparations found</p>
            <p className="mt-1 text-xs text-slate-400">Try another search or create a new preparation.</p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead className="bg-[#f7f9fd]">
                  <tr className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8290a5]">
                    {[
                      "Customer / Event",
                      "Shoot Date",
                      "Location",
                      "Photographer",
                      "Progress",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th key={heading} className="px-5 py-4">{heading}</th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf1f6]">
                  {filtered.map((item) => {
                    const progress = getProgress(item);
                    const status = getStatus(item);

                    return (
                      <tr key={item.id} className="transition hover:bg-[#f8faff]">
                        <td className="px-5 py-5">
                          <p className="max-w-44 break-words text-sm font-semibold text-[#10264d]">{item.customer}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.event}</p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="whitespace-nowrap text-sm text-[#10264d]">{formatDate(item.shootDate)}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatTime(item.shootTime)}</p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="max-w-40 break-words text-sm text-slate-700">{item.location || "Not assigned"}</p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="max-w-40 break-words text-sm text-slate-700">{item.photographer || "Not assigned"}</p>
                          <p className="mt-1 max-w-44 break-words text-xs text-slate-400">{item.equipment || "Equipment not selected"}</p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="w-32">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs text-slate-500">{getCompletedTasks(item)}/{checklistItems.length}</span>
                              <span className="text-xs font-bold text-[#10264d]">{progress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${progress === 100 ? "bg-green-500" : "bg-blue-700"}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5"><StatusBadge status={status} /></td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              title="Manage Preparation"
                              aria-label="Manage preparation"
                              className="rounded-lg bg-blue-50 p-2.5 text-blue-700 transition hover:bg-blue-100"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteShoot(item.id)}
                              title="Delete Preparation"
                              aria-label="Delete preparation"
                              className="rounded-lg bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:hidden">
              {filtered.map((item) => {
                const progress = getProgress(item);
                const status = getStatus(item);
                const completed = getCompletedTasks(item);

                return (
                  <article key={item.id} className="min-w-0 rounded-2xl border border-[#e3eaf4] bg-white p-3.5 shadow-[0_3px_12px_rgba(16,38,77,0.04)] sm:p-4">
                    <div className="flex min-w-0 items-start justify-between gap-2 border-b border-[#edf1f6] pb-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf3fc] text-[#315f9a]">
                          <UserRound size={18} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#10264d]">{item.customer}</h3>
                          <p className="mt-0.5 truncate text-[11px] text-slate-500">{item.event}</p>
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3.5">
                      <MobileDetail label="Shoot Date" value={formatDate(item.shootDate)} icon={CalendarDays} />
                      <MobileDetail label="Shoot Time" value={formatTime(item.shootTime)} icon={Clock3} />
                      <MobileDetail label="Location" value={item.location || "Not assigned"} icon={MapPin} />
                      <MobileDetail label="Photographer" value={item.photographer || "Not assigned"} icon={UserRound} />
                      <MobileDetail label="Team Members" value={item.team || "Not assigned"} icon={Users} />
                      <MobileDetail label="Equipment" value={item.equipment || "Not selected"} icon={Camera} />
                    </div>

                    <div className="mt-3">
                      <ProgressBar progress={progress} completed={completed} compact />
                    </div>

                    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-[#edf1f6] pt-3">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="flex min-w-0 items-center justify-center gap-2 rounded-lg bg-[#112e60] px-3 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#1a4384] sm:text-xs"
                      >
                        <Pencil size={15} className="shrink-0" />
                        <span className="truncate">Manage Preparation</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteShoot(item.id)}
                        aria-label={`Delete preparation for ${item.customer}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="hidden items-center justify-between border-t border-[#edf1f6] px-6 py-4 lg:flex">
          <p className="text-xs text-[#8290a5]">
            Showing {filtered.length} of {shoots.length} preparations
          </p>
          <span className="text-xs text-[#8290a5]">Studio Raw Picturez ERP</span>
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <ModalShell
          title={editingId ? "Manage Shoot Preparation" : "New Shoot Preparation"}
          description="Assign your photography team and prepare the shoot equipment"
          onClose={closeForm}
          onSubmit={saveShoot}
          submitLabel={editingId ? "Update Preparation" : "Save Preparation"}
        >
          <div className="space-y-7">
            {/* SHOOT INFORMATION */}
            <section>
              <SectionHeading
                icon={CalendarDays}
                title="Shoot Information"
                description="Customer, event and schedule"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Customer Name" required>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.customer}
                    onChange={(event) => update("customer", event.target.value)}
                    placeholder="Enter customer name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Event Type">
                  <CustomDropdown
                    value={form.event}
                    options={eventOptions}
                    onChange={(value) => update("event", value)}
                  />
                </FormField>

                <FormField label="Shoot Date" required>
                  <input
                    type="date"
                    required
                    value={form.shootDate}
                    onChange={(event) => update("shootDate", event.target.value)}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Shoot Time" required>
                  <input
                    type="time"
                    required
                    value={form.shootTime}
                    onChange={(event) => update("shootTime", event.target.value)}
                    className={inputClass}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Shoot Location">
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) => update("location", event.target.value)}
                      placeholder="e.g. Wedding hall, beach or studio"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* PHOTOGRAPHY TEAM */}
            <section>
              <SectionHeading
                icon={Users}
                title="Photography Team"
                description="Choose an assigned photographer and crew"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Photographer">
                  <CustomDropdown
                    value={form.photographer}
                    options={photographers}
                    onChange={(value) => update("photographer", value)}
                    placeholder="Choose photographer"
                  />
                </FormField>

                <FormField label="Team Members">
                  <CustomDropdown
                    value={form.team}
                    options={teamOptions}
                    onChange={(value) => update("team", value)}
                    placeholder="Choose photography team"
                  />
                </FormField>
              </div>
            </section>

            {/* EQUIPMENT */}
            <section>
              <SectionHeading
                icon={Camera}
                title="Equipment Assignment"
                description="Select the camera and equipment kit needed for this shoot"
              />

              <FormField label="Required Equipment">
                <CustomDropdown
                  value={form.equipment}
                  options={equipmentOptions}
                  onChange={(value) => update("equipment", value)}
                  placeholder="Choose equipment kit"
                />
              </FormField>

              {form.equipment && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
                    <PackageCheck size={21} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      Selected Equipment
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
                      {form.equipment}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Include this kit in the equipment check before leaving for the shoot.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* CHECKLIST */}
            <section>
              <SectionHeading
                icon={ClipboardCheck}
                title="Shoot Preparation Checklist"
                description="Tick each task when it has been completed"
              />

              <div className="rounded-2xl border border-[#dbe4f0] bg-[#f8faff] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#10264d]">
                    Readiness Progress
                  </p>
                  <span className="text-sm font-bold text-blue-700">
                    {getProgress(form)}%
                  </span>
                </div>

                <ProgressBar
                  progress={getProgress(form)}
                  completed={getCompletedTasks(form)}
                />

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {checklistItems.map((task) => {
                    const checked = Array.isArray(form.checklist) &&
                      form.checklist.includes(task);

                    return (
                      <label
                        key={task}
                        className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition sm:p-4 ${
                          checked
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChecklist(task)}
                          className="sr-only"
                        />

                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            checked
                              ? "border-blue-700 bg-blue-700 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {checked && <Check size={14} />}
                        </span>

                        <span className="min-w-0 break-words text-sm leading-5 text-[#29416a]">
                          {task}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">
                    Current Status
                  </p>
                  <StatusBadge status={getStatus(form)} />
                </div>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
