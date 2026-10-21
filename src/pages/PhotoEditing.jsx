
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  Images,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock3,
  CalendarDays,
  UserRound,
  Image as ImageIcon,
  Save,
  ChevronDown,
  Check,
  AlertCircle,
  Flag,
} from "lucide-react";

const STORAGE_KEY = "studioraw_photo_editing";

const createEmptyForm = () => ({
  customer: "",
  event: "Wedding",
  shootDate: "",
  totalPhotos: "",
  selectedPhotos: "",
  editor: "",
  deadline: "",
  selectionStatus: "Pending",
  approvalStatus: "Pending",
  editingStatus: "Not Started",
  priority: "Normal",
  notes: "",
});

const events = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Pre-Wedding",
  "Baby Shoot",
  "Portrait",
  "Corporate",
  "Other",
];

const editingStatuses = [
  "Not Started",
  "In Progress",
  "Completed",
];

const selectionStatuses = [
  "Pending",
  "In Progress",
  "Completed",
];

const approvalStatuses = [
  "Pending",
  "Approved",
  "Rejected",
];

const priorities = ["Low", "Normal", "High", "Urgent"];

const statusColors = {
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Not Started": "bg-slate-100 text-slate-600",
  Completed: "bg-green-100 text-green-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const priorityColors = {
  Low: "bg-slate-100 text-slate-600",
  Normal: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `EDIT-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function formatCount(value) {
  const number = Number(value || 0);
  return (Number.isFinite(number) ? number : 0).toLocaleString(
    "en-IN"
  );
}

function getProgress(status) {
  if (status === "Completed") return 100;
  if (status === "In Progress") return 50;
  return 0;
}

function CustomDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {value || "Select option"}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-md"
        >
          {options.map((option) => {
            const selected = value === option;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {selected && <Check size={16} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="flex min-w-0 items-start gap-2">
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

function FormField({ label, required = false, children }) {
  return (
    <div className="w-full min-w-0">
      <p className="mb-2 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </p>

      {children}
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152d]/70 p-2 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[96dvh] w-full max-w-[850px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[92dvh] sm:rounded-3xl"
      >
        {/* FIXED MODAL HEADER */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10264d] text-white">
              <Images size={23} />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold text-[#10264d] sm:text-2xl">
                {title}
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close editing form"
            className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* SCROLLABLE MODAL BODY */}
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain bg-[#f8faff] px-4 py-5 sm:px-8 sm:py-7">
            {children}
          </div>

          {/* FIXED MODAL FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 sm:w-auto"
            >
              <Save size={17} />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function PhotoEditing() {
  const [records, setRecords] = useState(readRecords);
  const [form, setForm] = useState(createEmptyForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (error) setError("");
  };

  const openCreate = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (record) => {
    setForm({
      ...createEmptyForm(),
      ...record,
    });

    setEditingId(record.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
  };

  const saveRecord = (event) => {
    event.preventDefault();

    if (!form.customer.trim()) {
      setError("Please enter customer name.");
      return;
    }

    const total = Number(form.totalPhotos);
    const selected = Number(form.selectedPhotos);

    if (
      !String(form.totalPhotos).trim() ||
      !String(form.selectedPhotos).trim() ||
      !Number.isFinite(total) ||
      !Number.isFinite(selected) ||
      total < 0 ||
      selected < 0 ||
      selected > total ||
      !Number.isInteger(total) ||
      !Number.isInteger(selected)
    ) {
      setError(
        "Enter valid photo counts. Selected photos cannot exceed total photos."
      );
      return;
    }

    const data = {
      ...form,
      customer: form.customer.trim(),
      id: editingId || createId(),
      totalPhotos: total,
      selectedPhotos: selected,
    };

    if (editingId) {
      setRecords((previous) =>
        previous.map((item) =>
          item.id === editingId ? data : item
        )
      );
    } else {
      setRecords((previous) => [data, ...previous]);
    }

    closeForm();
  };

  const deleteRecord = (id) => {
    if (!window.confirm("Delete this editing record?")) {
      return;
    }

    setRecords((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) closeForm();
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return records.filter((item) => {
      const matches = [
        item.customer,
        item.event,
        item.editor,
        item.notes,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matches &&
        (filter === "All" || item.editingStatus === filter)
      );
    });
  }, [records, search, filter]);

  const totalSelected = records.reduce(
    (sum, item) => sum + Number(item.selectedPhotos || 0),
    0
  );

  const stats = [
    {
      title: "Total Projects",
      value: records.length,
      icon: Images,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      title: "Photos Selected",
      value: totalSelected.toLocaleString("en-IN"),
      icon: ImageIcon,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      title: "Editing In Progress",
      value: records.filter(
        (item) => item.editingStatus === "In Progress"
      ).length,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Editing Completed",
      value: records.filter(
        (item) => item.editingStatus === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Photo Selection & Editing
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage photo selections, approvals and editing workflows.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 sm:w-auto"
        >
          <Plus size={18} />
          New Editing Project
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className={`shrink-0 rounded-xl p-3 ${stat.bg}`}>
                  <Icon size={22} className={stat.color} />
                </div>
              </div>

              <h2
                className={`mt-3 break-words text-3xl font-bold ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* EDITING PROJECTS */}
      <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#10264d]">
              Editing Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage photography editing projects.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full lg:w-64">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search projects..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="w-full sm:w-48">
              <CustomDropdown
                value={filter}
                options={["All", ...editingStatuses]}
                onChange={setFilter}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Images
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm text-slate-400">
              No editing projects found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filtered.map((item) => {
              const progress = getProgress(item.editingStatus);

              return (
                <article
                  key={item.id}
                  className="flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                >
                  {/* PROJECT HEADER */}
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {item.customer}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.event}
                      </p>
                    </div>

                    <span
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColors[item.editingStatus] ||
                        statusColors["Not Started"]
                      }`}
                    >
                      {item.editingStatus || "Not Started"}
                    </span>
                  </div>

                  {/* PROJECT DETAILS */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Detail
                      label="Shoot Date"
                      value={item.shootDate || "Not specified"}
                      icon={CalendarDays}
                    />

                    <Detail
                      label="Assigned Editor"
                      value={item.editor || "Not assigned"}
                      icon={UserRound}
                    />

                    <Detail
                      label="Editing Deadline"
                      value={item.deadline || "Not assigned"}
                      icon={Clock3}
                    />
                  </div>

                  {/* PHOTO COUNTS */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Images size={16} />
                        Total Photos
                      </p>

                      <p className="mt-2 break-all text-2xl font-bold text-blue-800">
                        {formatCount(item.totalPhotos)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-indigo-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <ImageIcon size={16} />
                        Selected Photos
                      </p>

                      <p className="mt-2 break-all text-2xl font-bold text-indigo-800">
                        {formatCount(item.selectedPhotos)}
                      </p>
                    </div>
                  </div>

                  {/* STATUS DETAILS */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">
                        Selection Status
                      </p>

                      <span
                        className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${
                          statusColors[item.selectionStatus] ||
                          statusColors.Pending
                        }`}
                      >
                        {item.selectionStatus || "Pending"}
                      </span>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">
                        Client Approval
                      </p>

                      <span
                        className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${
                          statusColors[item.approvalStatus] ||
                          statusColors.Pending
                        }`}
                      >
                        {item.approvalStatus || "Pending"}
                      </span>
                    </div>

                    <div>
                      <p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Flag size={15} />
                        Priority
                      </p>

                      <span
                        className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${
                          priorityColors[item.priority] ||
                          priorityColors.Normal
                        }`}
                      >
                        {item.priority || "Normal"}
                      </span>
                    </div>
                  </div>

                  {/* EDITING PROGRESS */}
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-slate-500">
                        Editing Progress
                      </p>

                      <p className="text-sm font-bold text-[#10264d]">
                        {progress}%
                      </p>
                    </div>

                    <div
                      role="progressbar"
                      aria-label="Editing progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100
                            ? "bg-green-500"
                            : "bg-blue-700"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <Detail
                      label="Editing Notes"
                      value={item.notes}
                    />
                  )}

                  {/* ACTIONS */}
                  <div className="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                    >
                      <Pencil size={17} />
                      Manage Editing
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteRecord(item.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete Project
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CENTERED NEW / EDIT MODAL */}
      {showForm && (
        <ModalShell
          title={
            editingId
              ? "Manage Editing Project"
              : "New Editing Project"
          }
          description="Enter photo selection, approval and editing details."
          onClose={closeForm}
          onSubmit={saveRecord}
          submitLabel={
            editingId ? "Update Project" : "Save Project"
          }
        >
          {/* CUSTOMER & EVENT */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <UserRound size={19} />
              </div>

              <h3 className="text-sm font-bold text-[#10264d]">
                Project Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                  options={events}
                  onChange={(value) => update("event", value)}
                />
              </FormField>

              <FormField label="Shoot Date">
                <input
                  type="date"
                  value={form.shootDate}
                  onChange={(event) =>
                    update("shootDate", event.target.value)
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Editing Deadline">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(event) =>
                    update("deadline", event.target.value)
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Assigned Editor">
                <input
                  type="text"
                  value={form.editor}
                  onChange={(event) =>
                    update("editor", event.target.value)
                  }
                  placeholder="Enter editor name"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Priority">
                <CustomDropdown
                  value={form.priority}
                  options={priorities}
                  onChange={(value) =>
                    update("priority", value)
                  }
                />
              </FormField>
            </div>
          </section>

          {/* PHOTO SELECTION */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700">
                <Images size={19} />
              </div>

              <h3 className="text-sm font-bold text-[#10264d]">
                Photo Selection
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Total Photos" required>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.totalPhotos}
                  onChange={(event) =>
                    update("totalPhotos", event.target.value)
                  }
                  placeholder="Enter total photos"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Selected Photos" required>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.selectedPhotos}
                  onChange={(event) =>
                    update("selectedPhotos", event.target.value)
                  }
                  placeholder="Enter selected photos"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Selection Status">
                <CustomDropdown
                  value={form.selectionStatus}
                  options={selectionStatuses}
                  onChange={(value) =>
                    update("selectionStatus", value)
                  }
                />
              </FormField>

              <FormField label="Client Approval">
                <CustomDropdown
                  value={form.approvalStatus}
                  options={approvalStatuses}
                  onChange={(value) =>
                    update("approvalStatus", value)
                  }
                />
              </FormField>
            </div>
          </section>

          {/* EDITING DETAILS */}
          <section className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-green-50 p-2.5 text-green-700">
                <CheckCircle2 size={19} />
              </div>

              <h3 className="text-sm font-bold text-[#10264d]">
                Editing Workflow
              </h3>
            </div>

            <div className="space-y-5">
              <FormField label="Editing Status">
                <CustomDropdown
                  value={form.editingStatus}
                  options={editingStatuses}
                  onChange={(value) =>
                    update("editingStatus", value)
                  }
                />
              </FormField>

              <FormField label="Editing Notes">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    update("notes", event.target.value)
                  }
                  placeholder="Retouching instructions, client requests..."
                  className={`${inputClass} resize-y`}
                />
              </FormField>
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />
              {error}
            </p>
          )}
        </ModalShell>
      )}
    </div>
  );
}
