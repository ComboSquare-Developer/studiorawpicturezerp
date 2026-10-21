
import { useEffect, useMemo, useRef, useState } from "react";
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

const priorities = [
  "Low",
  "Normal",
  "High",
  "Urgent",
];

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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const formatCount = (value) => {
  const number = Number(value || 0);

  return (
    Number.isFinite(number) ? number : 0
  ).toLocaleString("en-IN");
};

const getProgress = (status) => {
  if (status === "Completed") return 100;
  if (status === "In Progress") return 50;
  return 0;
};

function CustomDropdown({
  value,
  options,
  onChange,
}) {
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
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
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
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {value}
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
          className="mt-2 max-h-60 w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
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
                className={`flex w-full min-w-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {selected && (
                  <Check
                    size={16}
                    className="shrink-0"
                  />
                )}
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
    <div className="flex w-full min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
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

        <p className="min-w-0 break-words text-sm font-semibold text-[#10264d]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="w-full min-w-0">
      <p className="mb-2 text-sm font-medium text-slate-700">
        {label}
      </p>

      {children}
    </div>
  );
}

export default function PhotoEditing() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(
    createEmptyForm
  );

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records)
    );
  }, [records]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const openCreate = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const openEdit = (record) => {
    setForm({
      ...createEmptyForm(),
      ...record,
    });

    setEditingId(record.id);
    setError("");
    setShowForm(true);
    scrollToForm();
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
      !form.totalPhotos.toString().trim() ||
      !form.selectedPhotos.toString().trim() ||
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
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `EDIT-${Date.now()}`,
      totalPhotos: total,
      selectedPhotos: selected,
    };

    if (editingId) {
      setRecords((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? data
            : item
        )
      );
    } else {
      setRecords((previous) => [
        data,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteRecord = (id) => {
    if (
      !window.confirm(
        "Delete this editing record?"
      )
    ) {
      return;
    }

    setRecords((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    if (editingId === id) {
      closeForm();
    }
  };

  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return records.filter((item) => {
      const matches = [
        item.customer,
        item.event,
        item.editor,
        item.notes,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matches &&
        (filter === "All" ||
          item.editingStatus === filter)
      );
    });
  }, [records, search, filter]);

  const totalSelected = records.reduce(
    (sum, item) =>
      sum + Number(item.selectedPhotos || 0),
    0
  );

  const stats = [
    {
      title: "Total Projects",
      value: records.length,
      icon: Images,
      color: "text-blue-700",
    },
    {
      title: "Photos Selected",
      value: totalSelected.toLocaleString("en-IN"),
      icon: ImageIcon,
      color: "text-indigo-700",
    },
    {
      title: "Editing In Progress",
      value: records.filter(
        (item) =>
          item.editingStatus === "In Progress"
      ).length,
      icon: Clock3,
      color: "text-amber-600",
    },
    {
      title: "Editing Completed",
      value: records.filter(
        (item) =>
          item.editingStatus === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          New Editing Project
        </button>
      </div>

      {/* Statistics - Vertical */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                  <Icon
                    size={22}
                    className={stat.color}
                  />
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

      {/* Editing Projects */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          Editing Projects
        </h2>

        {/* Search */}
        <div className="relative mb-4 w-full min-w-0">
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
            placeholder="Search projects..."
            className={`${inputClass} pl-10`}
          />
        </div>

        {/* Filter */}
        <div className="mb-5 w-full min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Filter by Editing Status
          </p>

          <CustomDropdown
            value={filter}
            options={["All", ...editingStatuses]}
            onChange={setFilter}
          />
        </div>

        {/* Project Cards */}
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
          <div className="flex w-full min-w-0 flex-col gap-4">
            {filtered.map((item) => {
              const progress = getProgress(
                item.editingStatus
              );

              return (
                <article
                  key={item.id}
                  className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                >
                  {/* Card Header */}
                  <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {item.customer}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {item.event}
                      </p>
                    </div>

                    <span
                      className={`w-fit max-w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColors[item.editingStatus] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.editingStatus || "Not Started"}
                    </span>
                  </div>

                  {/* Project Details */}
                  <Detail
                    label="Shoot Date"
                    value={
                      item.shootDate ||
                      "Not specified"
                    }
                    icon={CalendarDays}
                  />

                  <Detail
                    label="Assigned Editor"
                    value={
                      item.editor ||
                      "Not assigned"
                    }
                    icon={UserRound}
                  />

                  <Detail
                    label="Editing Deadline"
                    value={
                      item.deadline ||
                      "Not assigned"
                    }
                    icon={Clock3}
                  />

                  {/* Photo Counts */}
                  <div className="flex w-full min-w-0 flex-col gap-3">
                    <div className="w-full min-w-0 rounded-xl bg-blue-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Images size={16} />
                        Total Photos
                      </p>

                      <p className="mt-2 break-all text-2xl font-bold text-blue-800">
                        {formatCount(item.totalPhotos)}
                      </p>
                    </div>

                    <div className="w-full min-w-0 rounded-xl bg-indigo-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <ImageIcon size={16} />
                        Selected Photos
                      </p>

                      <p className="mt-2 break-all text-2xl font-bold text-indigo-800">
                        {formatCount(item.selectedPhotos)}
                      </p>
                    </div>
                  </div>

                  {/* Selection Status */}
                  <div className="flex w-full min-w-0 flex-col gap-2 border-b border-slate-100 pb-3">
                    <p className="text-xs font-medium text-slate-400">
                      Selection Status
                    </p>

                    <span
                      className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColors[item.selectionStatus] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.selectionStatus || "Pending"}
                    </span>
                  </div>

                  {/* Approval Status */}
                  <div className="flex w-full min-w-0 flex-col gap-2 border-b border-slate-100 pb-3">
                    <p className="text-xs font-medium text-slate-400">
                      Client Approval
                    </p>

                    <span
                      className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColors[item.approvalStatus] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.approvalStatus || "Pending"}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="flex w-full min-w-0 flex-col gap-2 border-b border-slate-100 pb-3">
                    <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Flag size={15} />
                      Priority
                    </p>

                    <span
                      className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                        priorityColors[item.priority] ||
                        priorityColors.Normal
                      }`}
                    >
                      {item.priority || "Normal"}
                    </span>
                  </div>

                  {/* Editing Progress */}
                  <div className="w-full min-w-0 rounded-xl bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-slate-500">
                        Editing Progress
                      </p>

                      <p className="shrink-0 text-sm font-bold text-[#10264d]">
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
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <Detail
                      label="Editing Notes"
                      value={item.notes}
                    />
                  )}

                  {/* Actions */}
                  <div className="flex w-full flex-col gap-3 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        openEdit(item)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                    >
                      <Pencil size={17} />
                      Manage Editing
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteRecord(item.id)
                      }
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

      {/* New / Edit Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Manage Editing Project"
                  : "New Editing Project"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter selection and editing details.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close editing form"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveRecord}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Customer Name">
              <input
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
                className={inputClass}
              />
            </FormField>

            <FormField label="Event Type">
              <CustomDropdown
                value={form.event}
                options={events}
                onChange={(value) =>
                  update("event", value)
                }
              />
            </FormField>

            <FormField label="Shoot Date">
              <input
                type="date"
                value={form.shootDate}
                onChange={(event) =>
                  update(
                    "shootDate",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Editing Deadline">
              <input
                type="date"
                value={form.deadline}
                onChange={(event) =>
                  update(
                    "deadline",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Assigned Editor">
              <input
                type="text"
                value={form.editor}
                onChange={(event) =>
                  update(
                    "editor",
                    event.target.value
                  )
                }
                placeholder="Enter editor name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Total Photos">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={form.totalPhotos}
                onChange={(event) =>
                  update(
                    "totalPhotos",
                    event.target.value
                  )
                }
                placeholder="Enter total photos"
                className={inputClass}
              />
            </FormField>

            <FormField label="Selected Photos">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={form.selectedPhotos}
                onChange={(event) =>
                  update(
                    "selectedPhotos",
                    event.target.value
                  )
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
                  update(
                    "selectionStatus",
                    value
                  )
                }
              />
            </FormField>

            <FormField label="Client Approval">
              <CustomDropdown
                value={form.approvalStatus}
                options={approvalStatuses}
                onChange={(value) =>
                  update(
                    "approvalStatus",
                    value
                  )
                }
              />
            </FormField>

            <FormField label="Editing Status">
              <CustomDropdown
                value={form.editingStatus}
                options={editingStatuses}
                onChange={(value) =>
                  update(
                    "editingStatus",
                    value
                  )
                }
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

            <FormField label="Editing Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  update(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Retouching instructions, client requests..."
                className={inputClass}
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 break-words text-sm font-medium text-red-600"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                {error}
              </p>
            )}

            {/* Form Actions */}
            <div className="flex w-full flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                <Save size={17} />
                {editingId
                  ? "Update Project"
                  : "Save Project"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
