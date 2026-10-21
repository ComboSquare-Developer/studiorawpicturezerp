
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
  Package,
  History,
  ChevronDown,
  Check,
} from "lucide-react";

const EQUIPMENT_KEY = "studioraw_equipment";
const HISTORY_KEY = "studioraw_equipment_history";
const STAFF_KEY = "studioraw_staff";

const categories = [
  "Camera",
  "Lens",
  "Lighting",
  "Tripod",
  "Drone",
  "Audio Equipment",
  "Gimbal",
  "Memory & Storage",
  "Other",
];

const statuses = [
  "Available",
  "In Use",
  "Maintenance",
  "Unavailable",
];

const emptyForm = {
  name: "",
  category: "Camera",
  brand: "",
  model: "",
  serialNumber: "",
  purchaseDate: "",
  purchaseCost: "",
  status: "Available",
  assignedTo: "",
  shootName: "",
  lastServiceDate: "",
  nextServiceDate: "",
  maintenanceCost: "",
  notes: "",
};

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const statusStyles = {
  Available: "bg-green-100 text-green-700",
  "In Use": "bg-blue-100 text-blue-700",
  Maintenance: "bg-amber-100 text-amber-700",
  Unavailable: "bg-red-100 text-red-700",
};

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `EQ-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function formatHistoryDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function todayKey() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

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

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option
  );

  const selected = normalizedOptions.find(
    (option) => String(option.value) === String(value)
  );

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {selected?.label || placeholder}
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
          {normalizedOptions.map((option) => {
            const isSelected =
              String(option.value) === String(value);

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option.label}
                </span>

                {isSelected && (
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

function Detail({ label, value }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="min-w-0 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

export default function Equipment() {
  const [equipment, setEquipment] = useState(() =>
    readArray(EQUIPMENT_KEY)
  );

  const [history, setHistory] = useState(() =>
    readArray(HISTORY_KEY)
  );

  const [staff, setStaff] = useState(() =>
    readArray(STAFF_KEY)
  );

  const [activeTab, setActiveTab] = useState("equipment");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      EQUIPMENT_KEY,
      JSON.stringify(equipment)
    );
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );
  }, [history]);

  useEffect(() => {
    const syncStaff = () => {
      setStaff(readArray(STAFF_KEY));
    };

    window.addEventListener("storage", syncStaff);
    window.addEventListener("focus", syncStaff);

    return () => {
      window.removeEventListener("storage", syncStaff);
      window.removeEventListener("focus", syncStaff);
    };
  }, []);

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const addHistory = (record) => {
    setHistory((previous) => [
      {
        id: createId(),
        date: new Date().toISOString(),
        ...record,
      },
      ...previous,
    ]);
  };

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const openAdd = () => {
    setActiveTab("equipment");
    setStaff(readArray(STAFF_KEY));
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const openEdit = (item) => {
    setActiveTab("equipment");
    setStaff(readArray(STAFF_KEY));
    setForm({
      ...emptyForm,
      ...item,
      purchaseCost: String(item.purchaseCost ?? ""),
      maintenanceCost: String(item.maintenanceCost ?? ""),
    });
    setEditingId(item.id);
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const saveEquipment = (event) => {
    event.preventDefault();

    const purchaseCost = Number(form.purchaseCost || 0);
    const maintenanceCost = Number(
      form.maintenanceCost || 0
    );

    if (!form.name.trim()) {
      setError("Please enter equipment name.");
      return;
    }

    if (
      !Number.isFinite(purchaseCost) ||
      purchaseCost < 0 ||
      !Number.isFinite(maintenanceCost) ||
      maintenanceCost < 0
    ) {
      setError("Please enter valid cost values.");
      return;
    }

    const serial = String(
      form.serialNumber || ""
    ).trim();

    const duplicateSerial = equipment.some(
      (item) =>
        serial !== "" &&
        String(item.serialNumber || "")
          .trim()
          .toLowerCase() === serial.toLowerCase() &&
        item.id !== editingId
    );

    if (duplicateSerial) {
      setError(
        "This serial number already exists."
      );
      return;
    }

    const record = {
      ...form,
      id: editingId || createId(),
      name: form.name.trim(),
      serialNumber: serial,
      purchaseCost,
      maintenanceCost,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      const oldItem = equipment.find(
        (item) => item.id === editingId
      );

      setEquipment((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );

      addHistory({
        equipmentId: record.id,
        equipmentName: record.name,
        action: "Updated",
        details:
          oldItem?.status !== record.status
            ? `Status: ${oldItem?.status || "Unknown"} → ${record.status}`
            : "Equipment details updated",
      });
    } else {
      setEquipment((previous) => [
        record,
        ...previous,
      ]);

      addHistory({
        equipmentId: record.id,
        equipmentName: record.name,
        action: "Added",
        details: "New equipment registered",
      });
    }

    closeForm();
  };

  const deleteEquipment = (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) {
      return;
    }

    setEquipment((previous) =>
      previous.filter(
        (record) => record.id !== item.id
      )
    );

    addHistory({
      equipmentId: item.id,
      equipmentName: item.name,
      action: "Deleted",
      details: "Equipment removed from inventory",
    });

    if (editingId === item.id) {
      closeForm();
    }
  };

  const changeStatus = (item, newStatus) => {
    if (item.status === newStatus) {
      return;
    }

    setEquipment((previous) =>
      previous.map((record) =>
        record.id === item.id
          ? {
              ...record,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }
          : record
      )
    );

    addHistory({
      equipmentId: item.id,
      equipmentName: item.name,
      action: "Status Changed",
      details: `${item.status} → ${newStatus}`,
    });

    if (editingId === item.id) {
      setForm((previous) => ({
        ...previous,
        status: newStatus,
      }));
    }
  };

  const filteredEquipment = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch = [
        item.name,
        item.brand,
        item.model,
        item.serialNumber,
        item.assignedTo,
        item.shootName,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    equipment,
    search,
    categoryFilter,
    statusFilter,
  ]);

  const today = todayKey();

  const maintenanceDue = equipment.filter(
    (item) =>
      item.nextServiceDate &&
      item.nextServiceDate <= today
  ).length;

  const stats = [
    {
      label: "Total Equipment",
      value: equipment.length,
      icon: Camera,
      color: "text-blue-700",
    },
    {
      label: "Available",
      value: equipment.filter(
        (item) => item.status === "Available"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
    },
    {
      label: "In Use",
      value: equipment.filter(
        (item) => item.status === "In Use"
      ).length,
      icon: Package,
      color: "text-indigo-700",
    },
    {
      label: "Maintenance Due",
      value: maintenanceDue,
      icon: AlertTriangle,
      color: "text-amber-700",
    },
  ];

  const staffOptions = [
    {
      label: "Not Assigned",
      value: "",
    },
    ...staff
      .filter((person) => person.name)
      .map((person) => ({
        label: `${person.name}${
          person.role ? ` – ${person.role}` : ""
        }`,
        value: person.name,
      })),
  ];

  if (
    form.assignedTo &&
    !staffOptions.some(
      (option) => option.value === form.assignedTo
    )
  ) {
    staffOptions.push({
      label: form.assignedTo,
      value: form.assignedTo,
    });
  }

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Equipment Management
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage studio cameras, lenses, lighting and equipment.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          Add Equipment
        </button>
      </div>

      {/* Statistics */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-slate-500">
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
                className={`mt-3 break-words text-3xl font-bold ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Main Section */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">

        {/* Tabs */}
        <div className="mb-5 flex w-full min-w-0 flex-col gap-3 border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() =>
              setActiveTab("equipment")
            }
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              activeTab === "equipment"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Camera size={17} />
            Equipment List
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("history")
            }
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              activeTab === "history"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <History size={17} />
            Activity History
          </button>
        </div>

        {activeTab === "equipment" ? (
          <>
            <h2 className="mb-5 text-lg font-bold text-[#10264d]">
              Equipment List
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
                placeholder="Search equipment..."
                className={`${inputClass} pl-10`}
              />
            </div>

            {/* Filters */}
            <div className="mb-5 flex w-full min-w-0 flex-col gap-4">
              <FormField label="Filter by Category">
                <CustomDropdown
                  value={categoryFilter}
                  options={[
                    {
                      label: "All Categories",
                      value: "All",
                    },
                    ...categories,
                  ]}
                  onChange={setCategoryFilter}
                />
              </FormField>

              <FormField label="Filter by Status">
                <CustomDropdown
                  value={statusFilter}
                  options={[
                    {
                      label: "All Status",
                      value: "All",
                    },
                    ...statuses,
                  ]}
                  onChange={setStatusFilter}
                />
              </FormField>
            </div>

            {/* Equipment Cards */}
            {filteredEquipment.length === 0 ? (
              <div className="py-12 text-center">
                <Camera
                  size={44}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm text-slate-400">
                  No equipment found
                </p>
              </div>
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-4">
                {filteredEquipment.map((item) => {
                  const serviceDue =
                    item.nextServiceDate &&
                    item.nextServiceDate <= today;

                  return (
                    <article
                      key={item.id}
                      className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                    >
                      {/* Equipment Title */}
                      <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
                            <Camera size={23} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-lg font-bold text-[#10264d]">
                              {item.name}
                            </h3>

                            <p className="mt-1 break-words text-sm text-slate-500">
                              {[item.brand, item.model]
                                .filter(Boolean)
                                .join(" ") ||
                                "Brand / Model not specified"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`w-fit max-w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                            statusStyles[item.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>

                        {serviceDue && (
                          <span className="flex w-fit max-w-full items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
                            <AlertTriangle size={14} />
                            Maintenance Due
                          </span>
                        )}
                      </div>

                      {/* Equipment Details */}
                      <Detail
                        label="Category"
                        value={item.category}
                      />

                      <Detail
                        label="Serial Number"
                        value={
                          item.serialNumber ||
                          "Not specified"
                        }
                      />

                      <Detail
                        label="Assigned Staff"
                        value={
                          item.assignedTo ||
                          "Not assigned"
                        }
                      />

                      <Detail
                        label="Shoot / Project"
                        value={
                          item.shootName ||
                          "Not assigned"
                        }
                      />

                      <Detail
                        label="Purchase Date"
                        value={formatDate(
                          item.purchaseDate
                        )}
                      />

                      <Detail
                        label="Purchase Cost"
                        value={money(
                          item.purchaseCost
                        )}
                      />

                      <Detail
                        label="Last Service Date"
                        value={formatDate(
                          item.lastServiceDate
                        )}
                      />

                      <Detail
                        label="Next Service Date"
                        value={formatDate(
                          item.nextServiceDate
                        )}
                      />

                      <Detail
                        label="Maintenance Cost"
                        value={money(
                          item.maintenanceCost
                        )}
                      />

                      {item.notes && (
                        <Detail
                          label="Notes"
                          value={item.notes}
                        />
                      )}

                      {/* Quick Status Update */}
                      <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-4">
                        <FormField label="Update Availability">
                          <CustomDropdown
                            value={item.status}
                            options={statuses}
                            onChange={(value) =>
                              changeStatus(item, value)
                            }
                          />
                        </FormField>
                      </div>

                      {/* Actions */}
                      <div className="flex w-full flex-col gap-3 border-t border-slate-200 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(item)
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900"
                        >
                          <Pencil size={17} />
                          Edit Equipment
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteEquipment(item)
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                          Delete Equipment
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-2">
              <History
                size={20}
                className="text-blue-700"
              />

              <h2 className="text-lg font-bold text-[#10264d]">
                Equipment Activity History
              </h2>
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center">
                <History
                  size={42}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm text-slate-400">
                  No equipment activity recorded
                </p>
              </div>
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-4">
                {history.map((record) => {
                  const actionStyles = {
                    Added:
                      "bg-green-100 text-green-700",
                    Updated:
                      "bg-blue-100 text-blue-700",
                    Deleted:
                      "bg-red-100 text-red-700",
                    "Status Changed":
                      "bg-indigo-100 text-indigo-700",
                  };

                  return (
                    <article
                      key={record.id}
                      className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
                    >
                      <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                        <h3 className="break-words text-base font-bold text-[#10264d]">
                          {record.equipmentName}
                        </h3>

                        <span
                          className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                            actionStyles[
                              record.action
                            ] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {record.action}
                        </span>
                      </div>

                      <Detail
                        label="Date & Time"
                        value={formatHistoryDate(
                          record.date
                        )}
                      />

                      <Detail
                        label="Activity Details"
                        value={
                          record.details ||
                          "No details"
                        }
                      />
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Add / Edit Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Edit Equipment"
                  : "Add Equipment"}
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Equipment details and maintenance information.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close form"
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveEquipment}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Equipment Name">
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter equipment name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Equipment Category">
              <CustomDropdown
                value={form.category}
                options={categories}
                onChange={(value) =>
                  updateField("category", value)
                }
              />
            </FormField>

            <FormField label="Brand">
              <input
                type="text"
                value={form.brand}
                onChange={(event) =>
                  updateField(
                    "brand",
                    event.target.value
                  )
                }
                placeholder="Enter brand"
                className={inputClass}
              />
            </FormField>

            <FormField label="Model">
              <input
                type="text"
                value={form.model}
                onChange={(event) =>
                  updateField(
                    "model",
                    event.target.value
                  )
                }
                placeholder="Enter model"
                className={inputClass}
              />
            </FormField>

            <FormField label="Serial Number">
              <input
                type="text"
                value={form.serialNumber}
                onChange={(event) =>
                  updateField(
                    "serialNumber",
                    event.target.value
                  )
                }
                placeholder="Enter serial number"
                className={inputClass}
              />
            </FormField>

            <FormField label="Purchase Date">
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(event) =>
                  updateField(
                    "purchaseDate",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Purchase Cost (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.purchaseCost}
                onChange={(event) =>
                  updateField(
                    "purchaseCost",
                    event.target.value
                  )
                }
                placeholder="Enter purchase cost"
                className={inputClass}
              />
            </FormField>

            <FormField label="Availability Status">
              <CustomDropdown
                value={form.status}
                options={statuses}
                onChange={(value) =>
                  updateField("status", value)
                }
              />
            </FormField>

            <FormField label="Assign Staff">
              <CustomDropdown
                value={form.assignedTo}
                options={staffOptions}
                onChange={(value) =>
                  updateField("assignedTo", value)
                }
                placeholder="Not Assigned"
              />
            </FormField>

            <FormField label="Shoot / Project Name">
              <input
                type="text"
                value={form.shootName}
                onChange={(event) =>
                  updateField(
                    "shootName",
                    event.target.value
                  )
                }
                placeholder="Enter shoot or project name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Last Service Date">
              <input
                type="date"
                value={form.lastServiceDate}
                onChange={(event) =>
                  updateField(
                    "lastServiceDate",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Next Service Date">
              <input
                type="date"
                value={form.nextServiceDate}
                onChange={(event) =>
                  updateField(
                    "nextServiceDate",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Maintenance Cost (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.maintenanceCost}
                onChange={(event) =>
                  updateField(
                    "maintenanceCost",
                    event.target.value
                  )
                }
                placeholder="Enter maintenance cost"
                className={inputClass}
              />
            </FormField>

            <FormField label="Equipment Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Enter equipment notes..."
                className={inputClass}
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 break-words text-sm font-medium text-red-600"
              >
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                {error}
              </p>
            )}

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
                  ? "Update Equipment"
                  : "Save Equipment"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
