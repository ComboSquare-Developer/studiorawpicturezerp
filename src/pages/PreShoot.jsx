
import { useEffect, useMemo, useRef, useState } from "react";
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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getCompletedTasks = (item) => {
  const selected = Array.isArray(item?.checklist)
    ? item.checklist
    : [];

  return checklistItems.filter((task) =>
    selected.includes(task)
  ).length;
};

const getProgress = (item) => {
  const completed = getCompletedTasks(item);

  return Math.round(
    (completed / checklistItems.length) * 100
  );
};

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

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
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
          {value || placeholder}
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

  const [form, setForm] = useState(
    createEmptyForm
  );

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const formRef = useRef(null);

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
    scrollToForm();
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
      setError(
        "Please select shoot date and time."
      );
      return;
    }

    const data = {
      ...form,
      customer: form.customer.trim(),
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `PRE-${Date.now()}`,
    };

    if (editingId) {
      setShoots((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? data
            : item
        )
      );
    } else {
      setShoots((previous) => [
        data,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteShoot = (id) => {
    if (
      !window.confirm(
        "Delete this shoot preparation?"
      )
    ) {
      return;
    }

    setShoots((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    if (editingId === id) {
      closeForm();
    }
  };

  const toggleChecklist = (task) => {
    setForm((previous) => {
      const current = Array.isArray(
        previous.checklist
      )
        ? previous.checklist
        : [];

      return {
        ...previous,
        checklist: current.includes(task)
          ? current.filter(
              (item) => item !== task
            )
          : [...current, task],
      };
    });
  };

  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return shoots.filter((item) => {
      const matches = [
        item.customer,
        item.event,
        item.photographer,
        item.location,
        item.team,
        item.equipment,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matches &&
        (filter === "All" ||
          getStatus(item) === filter)
      );
    });
  }, [shoots, search, filter]);

  const stats = [
    {
      label: "Total Preparations",
      value: shoots.length,
      icon: ClipboardCheck,
      color: "text-blue-700",
    },
    {
      label: "Ready for Shoot",
      value: shoots.filter(
        (item) =>
          getStatus(item) === "Ready"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
    },
    {
      label: "In Progress",
      value: shoots.filter(
        (item) =>
          getStatus(item) === "In Progress"
      ).length,
      icon: Clock3,
      color: "text-amber-600",
    },
    {
      label: "Pending",
      value: shoots.filter(
        (item) =>
          getStatus(item) === "Pending"
      ).length,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Pre-Shoot Preparation
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Organize shoot schedules, teams, equipment and checklists.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          New Preparation
        </button>
      </div>

      {/* Statistics - Vertical */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                  <Icon
                    size={22}
                    className={stat.color}
                  />
                </div>
              </div>

              <h2
                className={`mt-3 text-3xl font-bold ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Preparation List */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          Shoot Preparation List
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
            placeholder="Search preparations..."
            className={`${inputClass} pl-10`}
          />
        </div>

        {/* Status Filter */}
        <div className="mb-5 w-full min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Filter by Preparation Status
          </p>

          <CustomDropdown
            value={filter}
            options={filterOptions}
            onChange={setFilter}
          />
        </div>

        {/* Preparation Cards */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardCheck
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm text-slate-400">
              No shoot preparations found
            </p>
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-4">
            {filtered.map((item) => {
              const progress =
                getProgress(item);

              const status =
                getStatus(item);

              const completed =
                getCompletedTasks(item);

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
                        statusStyle[status]
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Details */}
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
                    value={
                      item.location ||
                      "Location not assigned"
                    }
                    icon={MapPin}
                  />

                  <Detail
                    label="Photographer"
                    value={
                      item.photographer ||
                      "Photographer not assigned"
                    }
                    icon={UserRound}
                  />

                  <Detail
                    label="Team Members"
                    value={
                      item.team ||
                      "Team not assigned"
                    }
                    icon={UserRound}
                  />

                  <Detail
                    label="Required Equipment"
                    value={
                      item.equipment ||
                      "Equipment not specified"
                    }
                    icon={Camera}
                  />

                  {item.notes && (
                    <Detail
                      label="Additional Notes"
                      value={item.notes}
                    />
                  )}

                  {/* Progress */}
                  <div className="w-full min-w-0 rounded-xl bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-slate-500">
                        Preparation Progress
                      </p>

                      <p className="shrink-0 text-sm font-bold text-[#10264d]">
                        {progress}%
                      </p>
                    </div>

                    <div
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Preparation progress"
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

                    <p className="mt-3 text-xs text-slate-400">
                      {completed} of{" "}
                      {checklistItems.length} tasks completed
                    </p>
                  </div>

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
                      Manage Preparation
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteShoot(item.id)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete Preparation
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* New / Edit Preparation Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Manage Shoot Preparation"
                  : "New Shoot Preparation"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complete the preparation details and checklist.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close preparation form"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveShoot}
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
                options={eventOptions}
                onChange={(value) =>
                  update("event", value)
                }
              />
            </FormField>

            <FormField label="Shoot Date">
              <input
                type="date"
                required
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

            <FormField label="Shoot Time">
              <input
                type="time"
                required
                value={form.shootTime}
                onChange={(event) =>
                  update(
                    "shootTime",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Shoot Location">
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  update(
                    "location",
                    event.target.value
                  )
                }
                placeholder="Enter shoot location"
                className={inputClass}
              />
            </FormField>

            <FormField label="Photographer">
              <input
                type="text"
                value={form.photographer}
                onChange={(event) =>
                  update(
                    "photographer",
                    event.target.value
                  )
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
                  update(
                    "team",
                    event.target.value
                  )
                }
                placeholder="Enter team members"
                className={inputClass}
              />
            </FormField>

            <FormField label="Required Equipment">
              <input
                type="text"
                value={form.equipment}
                onChange={(event) =>
                  update(
                    "equipment",
                    event.target.value
                  )
                }
                placeholder="Enter required equipment"
                className={inputClass}
              />
            </FormField>

            {/* Preparation Checklist */}
            <div className="w-full min-w-0 rounded-2xl border border-slate-200 p-3 sm:p-5">
              <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
                <h3 className="min-w-0 break-words text-base font-bold text-[#10264d]">
                  Preparation Checklist
                </h3>

                <span className="shrink-0 text-sm font-semibold text-blue-700">
                  {getProgress(form)}%
                </span>
              </div>

              <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    getProgress(form) === 100
                      ? "bg-green-500"
                      : "bg-blue-700"
                  }`}
                  style={{
                    width: `${getProgress(form)}%`,
                  }}
                />
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3">
                {checklistItems.map((task) => {
                  const checked =
                    form.checklist.includes(task);

                  return (
                    <label
                      key={task}
                      className={`flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        checked
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-100 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggleChecklist(task)
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 accent-blue-800"
                      />

                      <span className="min-w-0 flex-1 break-words text-sm leading-5 text-slate-700">
                        {task}
                      </span>
                    </label>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {getCompletedTasks(form)} of{" "}
                {checklistItems.length} tasks completed
              </p>
            </div>

            <FormField label="Additional Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  update(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Special instructions..."
                className={inputClass}
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="break-words text-sm font-medium text-red-600"
              >
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
                className="w-full rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                {editingId
                  ? "Update Preparation"
                  : "Save Preparation"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
