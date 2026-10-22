
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Package,
  CalendarDays,
  IndianRupee,
  History,
  Download,
  ChevronDown,
  Check,
} from "lucide-react";

const EQUIPMENT_KEY = "studioraw_equipment";
const HISTORY_KEY = "studioraw_equipment_history";

const categories = [
  "Camera",
  "Lens",
  "Lighting",
  "Audio",
  "Tripod",
  "Drone",
  "Computer",
  "Storage",
  "Accessories",
  "Other",
];

const statuses = ["Available", "In Use", "Maintenance", "Damaged"];
const conditions = ["Excellent", "Good", "Fair", "Poor"];

const today = new Date().toISOString().slice(0, 10);

const demoEquipment = [
  {
    id: "EQ-001",
    name: "Canon EOS R5",
    category: "Camera",
    brand: "Canon",
    model: "EOS R5",
    serialNumber: "CAN-R5-2025-001",
    quantity: 3,
    purchaseDate: "2025-01-15",
    purchasePrice: 285000,
    condition: "Excellent",
    status: "Available",
    assignedTo: "",
    location: "Main Studio",
    lastServiceDate: "2026-08-10",
    nextServiceDate: "2027-02-10",
    notes: "Professional wedding photography camera.",
  },
  {
    id: "EQ-002",
    name: "Sony Alpha A7 IV",
    category: "Camera",
    brand: "Sony",
    model: "A7 IV",
    serialNumber: "SON-A74-2025-002",
    quantity: 2,
    purchaseDate: "2025-03-12",
    purchasePrice: 215000,
    condition: "Good",
    status: "In Use",
    assignedTo: "Arun Kumar",
    location: "Wedding Team",
    lastServiceDate: "2026-07-18",
    nextServiceDate: "2027-01-18",
    notes: "Assigned to the wedding photography team.",
  },
  {
    id: "EQ-003",
    name: "Canon RF 70-200mm Lens",
    category: "Lens",
    brand: "Canon",
    model: "RF 70-200mm F2.8",
    serialNumber: "CAN-LENS-003",
    quantity: 2,
    purchaseDate: "2025-02-20",
    purchasePrice: 245000,
    condition: "Excellent",
    status: "Available",
    assignedTo: "",
    location: "Equipment Room",
    lastServiceDate: "2026-09-01",
    nextServiceDate: "2027-03-01",
    notes: "Stored in the protective lens case.",
  },
  {
    id: "EQ-004",
    name: "Godox Studio Flash Kit",
    category: "Lighting",
    brand: "Godox",
    model: "AD600 Pro",
    serialNumber: "GDX-AD600-004",
    quantity: 4,
    purchaseDate: "2024-11-05",
    purchasePrice: 65000,
    condition: "Good",
    status: "In Use",
    assignedTo: "Priya",
    location: "Portrait Studio",
    lastServiceDate: "2026-06-20",
    nextServiceDate: "2026-12-20",
    notes: "Used for portrait and indoor studio shoots.",
  },
  {
    id: "EQ-005",
    name: "DJI Mini 4 Pro Drone",
    category: "Drone",
    brand: "DJI",
    model: "Mini 4 Pro",
    serialNumber: "DJI-M4P-005",
    quantity: 1,
    purchaseDate: "2025-06-10",
    purchasePrice: 115000,
    condition: "Fair",
    status: "Maintenance",
    assignedTo: "",
    location: "Service Desk",
    lastServiceDate: "2026-09-15",
    nextServiceDate: "2026-10-30",
    notes: "Propeller inspection and maintenance required.",
  },
  {
    id: "EQ-006",
    name: "Manfrotto Tripod",
    category: "Tripod",
    brand: "Manfrotto",
    model: "MT055XPRO3",
    serialNumber: "MAN-TRI-006",
    quantity: 5,
    purchaseDate: "2024-08-22",
    purchasePrice: 18500,
    condition: "Good",
    status: "Available",
    assignedTo: "",
    location: "Main Studio",
    lastServiceDate: "2026-08-05",
    nextServiceDate: "2027-02-05",
    notes: "Check tripod locks before outdoor shoots.",
  },
];

const demoHistory = [
  {
    id: "H-001",
    action: "Added",
    itemName: "Canon EOS R5",
    details: "Equipment registered in inventory",
    date: "2026-10-20T09:30:00",
  },
  {
    id: "H-002",
    action: "Assigned",
    itemName: "Sony Alpha A7 IV",
    details: "Assigned to Arun Kumar",
    date: "2026-10-20T11:15:00",
  },
  {
    id: "H-003",
    action: "Maintenance",
    itemName: "DJI Mini 4 Pro Drone",
    details: "Sent for propeller inspection",
    date: "2026-10-21T10:00:00",
  },
];

const emptyForm = () => ({
  name: "",
  category: "Camera",
  brand: "",
  model: "",
  serialNumber: "",
  quantity: "1",
  purchaseDate: "",
  purchasePrice: "",
  condition: "Excellent",
  status: "Available",
  assignedTo: "",
  location: "",
  lastServiceDate: "",
  nextServiceDate: "",
  notes: "",
});

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400";

const statusStyle = {
  Available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "In Use": "bg-blue-50 text-blue-700 ring-blue-200",
  Maintenance: "bg-amber-50 text-amber-700 ring-amber-200",
  Damaged: "bg-rose-50 text-rose-700 ring-rose-200",
};

function readInitialData(key, demoData) {
  try {
    const stored = localStorage.getItem(key);

    if (stored === null) {
      return demoData;
    }

    const parsed = JSON.parse(stored);

    // Restore sample records if the existing saved array is empty.
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : demoData;
  } catch {
    return demoData;
  }
}

function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`${inputClass} flex items-center justify-between gap-2 text-left`}
      >
        <span className="truncate">{value || "Select option"}</span>
        <ChevronDown size={16} className="shrink-0" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close dropdown"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                  value === option
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option}
                {value === option && <Check size={15} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, children, required = false }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Badge({ status }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        statusStyle[status] ||
        "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Available"}
    </span>
  );
}

export default function Equipment() {
  const [equipment, setEquipment] = useState(() =>
    readInitialData(EQUIPMENT_KEY, demoEquipment)
  );

  const [history, setHistory] = useState(() =>
    readInitialData(HISTORY_KEY, demoHistory)
  );

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Equipment");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (!showForm) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") closeForm();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const openAdd = () => {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ ...emptyForm(), ...item });
    setEditingId(item.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setError("");
  };

  const addHistory = (action, itemName, details) => {
    const entry = {
      id:
        globalThis.crypto?.randomUUID?.() ||
        `H-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      action,
      itemName,
      details,
      date: new Date().toISOString(),
    };

    setHistory((prev) => [entry, ...prev]);
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Equipment name is required.");
      return;
    }

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Enter a valid quantity of at least 1.");
      return;
    }

    const price =
      form.purchasePrice === "" ? "" : Number(form.purchasePrice);

    if (price !== "" && (!Number.isFinite(price) || price < 0)) {
      setError("Enter a valid purchase price.");
      return;
    }

    const data = {
      ...form,
      name: form.name.trim(),
      quantity,
      purchasePrice: price,
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `EQ-${Date.now()}`,
    };

    if (editingId) {
      const previous = equipment.find((item) => item.id === editingId);

      setEquipment((prev) =>
        prev.map((item) => (item.id === editingId ? data : item))
      );

      addHistory(
        "Updated",
        data.name,
        previous?.status !== data.status
          ? `Status changed from ${previous?.status} to ${data.status}`
          : "Equipment details updated"
      );
    } else {
      setEquipment((prev) => [data, ...prev]);
      addHistory("Added", data.name, "New equipment registered");
    }

    closeForm();
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    setEquipment((prev) =>
      prev.filter((record) => record.id !== item.id)
    );

    addHistory("Deleted", item.name, "Equipment record deleted");
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch = [
        item.name,
        item.category,
        item.brand,
        item.model,
        item.serialNumber,
        item.assignedTo,
        item.location,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matchesSearch &&
        (statusFilter === "All" || item.status === statusFilter)
      );
    });
  }, [equipment, search, statusFilter]);

  const stats = [
    {
      label: "Total Equipment",
      value: equipment.length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "bg-blue-600",
    },
    {
      label: "Available",
      value: equipment.filter((item) => item.status === "Available").length,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "bg-emerald-500",
    },
    {
      label: "In Use",
      value: equipment.filter((item) => item.status === "In Use").length,
      icon: Camera,
      color: "text-violet-600",
      bg: "bg-violet-50",
      accent: "bg-violet-500",
    },
    {
      label: "Maintenance",
      value: equipment.filter((item) => item.status === "Maintenance").length,
      icon: Wrench,
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "bg-amber-500",
    },
  ];

  const exportCSV = () => {
    const keys = [
      "name",
      "category",
      "brand",
      "model",
      "serialNumber",
      "quantity",
      "purchaseDate",
      "purchasePrice",
      "condition",
      "status",
      "assignedTo",
      "location",
      "lastServiceDate",
      "nextServiceDate",
      "notes",
    ];

    const csvValue = (value) => {
      const raw = String(value ?? "");
      const safe = /^[\s]*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.replace(/"/g, '""')}"`;
    };

    const rows = [
      keys.map(csvValue).join(","),
      ...filtered.map((item) =>
        keys.map((key) => csvValue(item[key])).join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF", rows.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "studioraw_equipment.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="min-h-screen min-w-0 bg-[#f6f8fc] px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Operations
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Equipment Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track photography equipment, assignments and maintenance.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#10264d] shadow-sm hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 hover:bg-blue-900"
          >
            <Plus size={18} />
            Add Equipment
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute left-0 top-0 h-1 w-full ${stat.accent}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold text-[#10264d]">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-2xl p-3 ${stat.bg}`}>
                  <Icon size={23} className={stat.color} />
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Equipment inventory overview
              </p>
            </div>
          );
        })}
      </div>

      {/* MAIN PANEL */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {["Equipment", "History"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    activeTab === tab
                      ? "bg-[#10264d] text-white"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {tab === "Equipment" ? (
                    <Camera size={17} />
                  ) : (
                    <History size={17} />
                  )}
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Equipment" && (
              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-3.5 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search equipment..."
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <div className="w-full sm:w-44">
                  <Dropdown
                    value={statusFilter}
                    options={["All", ...statuses]}
                    onChange={setStatusFilter}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {activeTab === "Equipment" ? (
          filtered.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-20 text-center">
              <Camera size={46} className="mb-5 text-slate-300" />
              <h3 className="text-lg font-bold text-[#10264d]">
                No equipment found
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Add equipment or adjust your search filters.
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="mt-7 flex items-center gap-2 rounded-xl bg-[#10264d] px-6 py-4 text-sm font-semibold text-white hover:bg-blue-900"
              >
                <Plus size={18} />
                Add Equipment
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400 sm:px-6">
                Showing {filtered.length} of {equipment.length} equipment items
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-[#f8faff]">
                    <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">Equipment</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Quantity</th>
                      <th className="px-5 py-4">Assigned To</th>
                      <th className="px-5 py-4">Condition</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-blue-50/30"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                              <Camera size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#10264d]">
                                {item.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {[item.brand, item.model]
                                  .filter(Boolean)
                                  .join(" ") || "No model"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {item.category}
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-[#10264d]">
                          {item.quantity}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {item.assignedTo || "Unassigned"}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {item.condition}
                        </td>

                        <td className="px-5 py-5">
                          <Badge status={item.status} />
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Edit equipment"
                              onClick={() => openEdit(item)}
                              className="rounded-lg bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-100"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete equipment"
                              onClick={() => handleDelete(item)}
                              className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RESPONSIVE MOBILE CARDS */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words font-bold text-[#10264d]">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.category}
                        </p>
                      </div>
                      <Camera size={21} className="shrink-0 text-blue-600" />
                    </div>

                    <div className="mb-4">
                      <Badge status={item.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Brand</p>
                        <p className="mt-1 break-words font-semibold text-slate-700">
                          {item.brand || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Model</p>
                        <p className="mt-1 break-words font-semibold text-slate-700">
                          {item.model || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Quantity</p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {item.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Condition</p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {item.condition}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400">Assigned To</p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {item.assignedTo || "Unassigned"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {item.location || "—"}
                        </p>
                      </div>
                      <div className="col-span-2 border-t border-slate-100 pt-3">
                        <p className="text-xs text-slate-400">Purchase Price</p>
                        <p className="mt-1 font-bold text-[#10264d]">
                          {item.purchasePrice !== "" &&
                          item.purchasePrice != null
                            ? `₹${Number(item.purchasePrice).toLocaleString("en-IN")}`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : (
          /* HISTORY TAB */
          <div className="p-4 sm:p-6">
            {history.length === 0 ? (
              <div className="py-16 text-center">
                <History
                  size={38}
                  className="mx-auto mb-3 text-slate-300"
                />
                <p className="text-sm text-slate-500">
                  No equipment history yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                        <History size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold text-[#10264d]">
                          {entry.itemName}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-500">
                          {entry.action} — {entry.details}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-xs text-slate-400">
                      {entry.date
                        ? new Date(entry.date).toLocaleString("en-IN")
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ADD / EDIT MODAL */}
      {showForm &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
            <button
              type="button"
              aria-label="Close equipment form"
              className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
              onClick={closeForm}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label={editingId ? "Edit Equipment" : "Add Equipment"}
              className="relative z-10 mx-auto flex max-h-[92dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8faff] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
            >
              {/* MODAL HEADER */}
              <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">
                      Equipment Operations
                    </p>
                    <h2 className="text-xl font-extrabold text-[#10264d] sm:text-2xl">
                      {editingId ? "Edit Equipment" : "Add Equipment"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Manage photography equipment details.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSave}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
                  {/* BASIC INFORMATION */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                      <Camera size={18} className="text-blue-600" />
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Equipment Name" required>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Canon EOS R5"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Category">
                        <Dropdown
                          value={form.category}
                          options={categories}
                          onChange={(value) => update("category", value)}
                        />
                      </Field>

                      <Field label="Brand">
                        <input
                          value={form.brand}
                          onChange={(e) => update("brand", e.target.value)}
                          placeholder="Canon"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Model">
                        <input
                          value={form.model}
                          onChange={(e) => update("model", e.target.value)}
                          placeholder="EOS R5"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Serial Number">
                        <input
                          value={form.serialNumber}
                          onChange={(e) =>
                            update("serialNumber", e.target.value)
                          }
                          placeholder="Enter serial number"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Quantity" required>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={form.quantity}
                          onChange={(e) =>
                            update("quantity", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* PURCHASE DETAILS */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                      <IndianRupee size={18} className="text-blue-600" />
                      Purchase Details
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Purchase Date">
                        <input
                          type="date"
                          max={today}
                          value={form.purchaseDate}
                          onChange={(e) =>
                            update("purchaseDate", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Purchase Price (₹)">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.purchasePrice}
                          onChange={(e) =>
                            update("purchasePrice", e.target.value)
                          }
                          placeholder="Enter amount"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* STATUS & ASSIGNMENT */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                      <Wrench size={18} className="text-blue-600" />
                      Equipment Status & Assignment
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Condition">
                        <Dropdown
                          value={form.condition}
                          options={conditions}
                          onChange={(value) => update("condition", value)}
                        />
                      </Field>

                      <Field label="Status">
                        <Dropdown
                          value={form.status}
                          options={statuses}
                          onChange={(value) => update("status", value)}
                        />
                      </Field>

                      <Field label="Assigned To">
                        <input
                          value={form.assignedTo}
                          onChange={(e) =>
                            update("assignedTo", e.target.value)
                          }
                          placeholder="Staff name"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Location">
                        <input
                          value={form.location}
                          onChange={(e) => update("location", e.target.value)}
                          placeholder="Studio / Branch"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* MAINTENANCE */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                      <CalendarDays size={18} className="text-blue-600" />
                      Maintenance Details
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Last Service Date">
                        <input
                          type="date"
                          value={form.lastServiceDate}
                          onChange={(e) =>
                            update("lastServiceDate", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Next Service Date">
                        <input
                          type="date"
                          value={form.nextServiceDate}
                          onChange={(e) =>
                            update("nextServiceDate", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                      <div className="sm:col-span-2">
                        <Field label="Notes">
                          <textarea
                            rows={3}
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                            placeholder="Equipment notes..."
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                      <AlertTriangle size={18} />
                      {error}
                    </div>
                  )}
                </div>

                {/* MODAL FOOTER */}
                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-7 py-3 text-sm font-semibold text-white hover:bg-blue-900"
                    >
                      <Save size={17} />
                      {editingId ? "Update Equipment" : "Save Equipment"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}