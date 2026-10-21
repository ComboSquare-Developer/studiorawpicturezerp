
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
  ClipboardList,
  Check,
} from "lucide-react";

const STORAGE_KEY = "studioraw_preshoot";

const checklistItems = [
  "Client requirements confirmed",
  "Shoot schedule confirmed",
  "Photographer assigned",
  "Camera equipment checked",
  "Lenses and lighting ready",
  "Batteries fully charged",
  "Memory cards prepared",
  "Location confirmed",
  "Transport arranged",
  "Client reminder sent",
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
  notes: "",
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
  "Other",
];

const filterOptions = [
  "All",
  "Ready",
  "In Progress",
  "Pending",
];

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
  Ready: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
};

function CustomDropdown({ value, options, onChange }) {
  return (
    <div className="relative w-full min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-11`}
      >
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
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#174b91]">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[#10264d]">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 flex min-w-0 items-start gap-2">
        {Icon && (
          <Icon
            size={16}
            className="mt-0.5 shrink-0 text-blue-600"
          />
        )}

        <p className="min-w-0 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
        statusStyle[status] || statusStyle.Pending
      }`}
    >
      {status}
    </span>
  );
}

function ProgressBar({ progress, completed }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">
          Preparation Progress
        </p>

        <p className="text-sm font-bold text-[#10264d]">
          {progress}%
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Preparation progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={`h-full rounded-full transition-all ${
            progress === 100 ? "bg-green-500" : "bg-blue-700"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
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
        {/* Fixed Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5ebf3] bg-white px-5 py-5 sm:px-9 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white">
              <ClipboardCheck size={23} />
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
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Scrollable Body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-9 sm:py-7">
            {children}
          </div>

          {/* Fixed Footer */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e5ebf3] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-9 sm:py-5">
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

export default function PreShoot() {
  const [shoots, setShoots] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(shoots)
    );
  }, [shoots]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
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
      checklist: Array.isArray(item.checklist)
        ? [...item.checklist]
        : [],
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
        `PRE-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };

    if (editingId) {
      setShoots((previous) =>
        previous.map((item) =>
          item.id === editingId ? data : item
        )
      );
    } else {
      setShoots((previous) => [data, ...previous]);
    }

    closeForm();
  };

  const deleteShoot = (id) => {
    if (!window.confirm("Delete this shoot preparation?")) {
      return;
    }

    setShoots((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) closeForm();
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
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matches &&
        (filter === "All" || getStatus(item) === filter)
      );
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
      value: shoots.filter(
        (item) => getStatus(item) === "Ready"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "In Progress",
      value: shoots.filter(
        (item) => getStatus(item) === "In Progress"
      ).length,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Pending",
      value: shoots.filter(
        (item) => getStatus(item) === "Pending"
      ).length,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl">
            Pre-Shoot Preparation
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Organize shoot schedules, teams, equipment and checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384] sm:w-auto"
        >
          <Plus size={18} />
          New Preparation
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <h2
                    className={`mt-3 text-3xl font-bold ${stat.color}`}
                  >
                    {stat.value}
                  </h2>
                </div>

                <div className={`shrink-0 rounded-xl p-3 ${stat.bg}`}>
                  <Icon size={22} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preparation List */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Shoot Preparation List
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track and manage pre-shoot preparations.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full lg:w-72">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search preparations..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="w-full sm:w-44">
                <CustomDropdown
                  value={filter}
                  options={filterOptions}
                  onChange={setFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <ClipboardCheck
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm text-slate-400">
              No shoot preparations found
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {[
                      "Customer / Event",
                      "Shoot Date",
                      "Location",
                      "Photographer",
                      "Progress",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th key={heading} className="px-5 py-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const progress = getProgress(item);
                    const status = getStatus(item);

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-5">
                          <p className="max-w-44 break-words text-sm font-semibold text-[#10264d]">
                            {item.customer}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.event}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="whitespace-nowrap text-sm text-[#10264d]">
                            {item.shootDate || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.shootTime || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="max-w-40 break-words text-sm text-slate-700">
                            {item.location || "Not assigned"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="max-w-40 break-words text-sm text-slate-700">
                            {item.photographer || "Not assigned"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="w-32">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                {getCompletedTasks(item)}/
                                {checklistItems.length}
                              </span>

                              <span className="text-xs font-bold text-[#10264d]">
                                {progress}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${
                                  progress === 100
                                    ? "bg-green-500"
                                    : "bg-blue-700"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={status} />
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              title="Manage Preparation"
                              className="rounded-lg bg-blue-50 p-2.5 text-blue-700 transition hover:bg-blue-100"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteShoot(item.id)}
                              title="Delete Preparation"
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

            {/* Mobile / Tablet Cards */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
              {filtered.map((item) => {
                const progress = getProgress(item);
                const status = getStatus(item);
                const completed = getCompletedTasks(item);

                return (
                  <article
                    key={item.id}
                    className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-bold text-[#10264d]">
                          {item.customer}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.event}
                        </p>
                      </div>

                      <StatusBadge status={status} />
                    </div>

                    <div className="mt-4 space-y-3">
                      <Detail
                        label="Shoot Date"
                        value={item.shootDate}
                        icon={CalendarDays}
                      />

                      <Detail
                        label="Shoot Time"
                        value={item.shootTime}
                        icon={Clock3}
                      />

                      <Detail
                        label="Location"
                        value={item.location || "Not assigned"}
                        icon={MapPin}
                      />

                      <Detail
                        label="Photographer"
                        value={item.photographer || "Not assigned"}
                        icon={UserRound}
                      />

                      <Detail
                        label="Team Members"
                        value={item.team || "Not assigned"}
                        icon={Users}
                      />

                      <Detail
                        label="Required Equipment"
                        value={item.equipment || "Not specified"}
                        icon={Camera}
                      />

                      {item.notes && (
                        <Detail
                          label="Additional Notes"
                          value={item.notes}
                        />
                      )}

                      <ProgressBar
                        progress={progress}
                        completed={completed}
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-4 py-3 text-sm font-semibold text-white"
                      >
                        <Pencil size={17} />
                        Manage Preparation
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteShoot(item.id)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
                      >
                        <Trash2 size={17} />
                        Delete Preparation
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Center Popup Modal */}
      {showForm && (
        <ModalShell
          title={
            editingId
              ? "Manage Shoot Preparation"
              : "New Shoot Preparation"
          }
          description="Complete preparation details and checklist"
          onClose={closeForm}
          onSubmit={saveShoot}
          submitLabel={
            editingId
              ? "Update Preparation"
              : "Save Preparation"
          }
        >
          <div className="space-y-8">
            {/* Shoot Information */}
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
                    onChange={(event) =>
                      update("customer", event.target.value)
                    }
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
                    onChange={(event) =>
                      update("shootDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Shoot Time" required>
                  <input
                    type="time"
                    required
                    value={form.shootTime}
                    onChange={(event) =>
                      update("shootTime", event.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Shoot Location">
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) =>
                        update("location", event.target.value)
                      }
                      placeholder="Enter shoot location"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* Team and Equipment */}
            <section>
              <SectionHeading
                icon={Users}
                title="Team & Equipment"
                description="Assign team members and required equipment"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Photographer">
                  <input
                    type="text"
                    value={form.photographer}
                    onChange={(event) =>
                      update("photographer", event.target.value)
                    }
                    placeholder="Enter photographer name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Team Members">
                  <input
                    type="text"
                    value={form.team}
                    onChange={(event) =>
                      update("team", event.target.value)
                    }
                    placeholder="Enter team members"
                    className={inputClass}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Required Equipment">
                    <input
                      type="text"
                      value={form.equipment}
                      onChange={(event) =>
                        update("equipment", event.target.value)
                      }
                      placeholder="Enter required equipment"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* Preparation Checklist */}
            <section>
              <SectionHeading
                icon={ClipboardCheck}
                title="Preparation Checklist"
                description="Track every task before the shoot"
              />

              <div className="rounded-2xl border border-[#dbe4f0] bg-[#f8faff] p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#10264d]">
                    Checklist Progress
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
                    const checked = Array.isArray(form.checklist)
                      ? form.checklist.includes(task)
                      : false;

                    return (
                      <label
                        key={task}
                        className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
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
                    Preparation Status
                  </p>

                  <StatusBadge status={getStatus(form)} />
                </div>
              </div>
            </section>

            {/* Additional Notes */}
            <section>
              <SectionHeading
                icon={ClipboardList}
                title="Additional Information"
                description="Special instructions and shoot notes"
              />

              <FormField label="Additional Notes">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    update("notes", event.target.value)
                  }
                  placeholder="Special instructions..."
                  className={`${inputClass} resize-y`}
                />
              </FormField>
            </section>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span className="break-words">{error}</span>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
