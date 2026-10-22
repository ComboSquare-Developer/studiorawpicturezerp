
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  X,
  Building2,
  Users,
  MapPin,
  CheckCircle,
  Phone,
  Mail,
  Download,
  Filter,
  RotateCcw,
} from "lucide-react";

const STORAGE_KEY = "studioraw_branches";
const STAFF_KEY = "studioraw_staff";

const demoBranches = [
  {
    id: "BR-1001",
    branchName: "Nagercoil Main Branch",
    branchCode: "NGL001",
    branchType: "Head Office",
    manager: "Praveen",
    phone: "9876543210",
    email: "nagercoil@studioraw.com",
    address: "Main Road, Nagercoil",
    city: "Nagercoil",
    state: "Tamil Nadu",
    pincode: "629001",
    openingDate: "2024-01-15",
    status: "Active",
    staffCount: 8,
    notes: "Main photography studio",
  },
  {
    id: "BR-1002",
    branchName: "Chennai Studio",
    branchCode: "CHN002",
    branchType: "Studio",
    manager: "Karthik",
    phone: "9876501234",
    email: "chennai@studioraw.com",
    address: "Anna Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600040",
    openingDate: "2024-04-10",
    status: "Active",
    staffCount: 6,
    notes: "Photography and album services",
  },
  {
    id: "BR-1003",
    branchName: "Marthandam Branch",
    branchCode: "MAR003",
    branchType: "Studio",
    manager: "Arun",
    phone: "9876512345",
    email: "marthandam@studioraw.com",
    address: "Market Road",
    city: "Marthandam",
    state: "Tamil Nadu",
    pincode: "629165",
    openingDate: "2024-06-01",
    status: "Active",
    staffCount: 4,
    notes: "Local photography services",
  },
  {
    id: "BR-1004",
    branchName: "Tirunelveli Branch",
    branchCode: "TNV004",
    branchType: "Sales Office",
    manager: "Suresh",
    phone: "9876523456",
    email: "tirunelveli@studioraw.com",
    address: "Palayamkottai Road",
    city: "Tirunelveli",
    state: "Tamil Nadu",
    pincode: "627002",
    openingDate: "2025-01-12",
    status: "Inactive",
    staffCount: 3,
    notes: "Branch temporarily inactive",
  },
  {
    id: "BR-1005",
    branchName: "Madurai Studio",
    branchCode: "MDU005",
    branchType: "Studio",
    manager: "Divya",
    phone: "9876534567",
    email: "madurai@studioraw.com",
    address: "KK Nagar",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625020",
    openingDate: "2025-03-05",
    status: "Active",
    staffCount: 5,
    notes: "Portrait and wedding photography",
  },
];

const emptyForm = {
  branchName: "",
  branchCode: "",
  branchType: "Studio",
  manager: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "Tamil Nadu",
  pincode: "",
  openingDate: new Date().toISOString().slice(0, 10),
  status: "Active",
  staffCount: "1",
  notes: "",
};

const branchTypes = [
  "Head Office",
  "Studio",
  "Sales Office",
  "Warehouse",
  "Service Center",
];

const statusOptions = ["Active", "Inactive", "Under Maintenance"];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function makeId() {
  return `BR-${Date.now().toString().slice(-7)}`;
}

function Badge({ value }) {
  const active = value === "Active";
  const inactive = value === "Inactive";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : inactive
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700"
      }`}
    >
      {value}
    </span>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Branches() {
  const [branches, setBranches] = useState(() => {
    const saved = readStorage(STORAGE_KEY, null);
    return Array.isArray(saved) && saved.length ? saved : demoBranches;
  });

  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [viewBranch, setViewBranch] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    const staffData = readStorage(STAFF_KEY, []);
    if (Array.isArray(staffData)) setStaff(staffData);
  }, []);

  const managerOptions = useMemo(() => {
    const names = staff
      .map((person) =>
        typeof person === "string"
          ? person
          : person.name ||
            person.staffName ||
            person.fullName ||
            person.employeeName
      )
      .filter(Boolean);

    return [...new Set([...names, "Praveen", "Karthik", "Arun", "Suresh", "Divya"])];
  }, [staff]);

  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase();

    return branches.filter((branch) => {
      const matchesSearch = [
        branch.branchName,
        branch.branchCode,
        branch.manager,
        branch.city,
        branch.phone,
        branch.email,
      ].some((value) => String(value || "").toLowerCase().includes(q));

      return (
        matchesSearch &&
        (statusFilter === "All" || branch.status === statusFilter) &&
        (typeFilter === "All" || branch.branchType === typeFilter)
      );
    });
  }, [branches, search, statusFilter, typeFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Total Branches",
        value: branches.length,
        icon: Building2,
        color: "bg-blue-50 text-blue-600",
      },
      {
        label: "Active Branches",
        value: branches.filter((b) => b.status === "Active").length,
        icon: CheckCircle,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Total Staff",
        value: branches.reduce((sum, b) => sum + Number(b.staffCount || 0), 0),
        icon: Users,
        color: "bg-violet-50 text-violet-600",
      },
      {
        label: "Cities Covered",
        value: new Set(branches.map((b) => b.city).filter(Boolean)).size,
        icon: MapPin,
        color: "bg-amber-50 text-amber-600",
      },
    ],
    [branches]
  );

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      branchCode: `BR${String(branches.length + 1).padStart(3, "0")}`,
      manager: managerOptions[0] || "",
    });
    setShowForm(true);
  };

  const openEditForm = (branch) => {
    setEditingId(branch.id);
    setForm({
      ...emptyForm,
      ...branch,
      staffCount: String(branch.staffCount ?? 1),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.branchName.trim() || !form.branchCode.trim()) {
      alert("Please enter branch name and branch code.");
      return;
    }

    const duplicate = branches.some(
      (b) =>
        b.branchCode.toLowerCase() === form.branchCode.trim().toLowerCase() &&
        b.id !== editingId
    );

    if (duplicate) {
      alert("This branch code already exists. Please use another code.");
      return;
    }

    const record = {
      ...form,
      id: editingId || makeId(),
      branchName: form.branchName.trim(),
      branchCode: form.branchCode.trim(),
      staffCount: Math.max(0, Number(form.staffCount) || 0),
    };

    setBranches((previous) =>
      editingId
        ? previous.map((b) => (b.id === editingId ? record : b))
        : [record, ...previous]
    );

    closeForm();
  };

  const deleteBranch = (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      setBranches((previous) => previous.filter((b) => b.id !== id));
    }
  };

  const exportCSV = () => {
    const headers = [
      "Branch ID",
      "Branch Name",
      "Branch Code",
      "Branch Type",
      "Manager",
      "Phone",
      "Email",
      "Address",
      "City",
      "State",
      "Pincode",
      "Opening Date",
      "Status",
      "Staff Count",
      "Notes",
    ];

    const rows = filteredBranches.map((b) => [
      b.id,
      b.branchName,
      b.branchCode,
      b.branchType,
      b.manager,
      b.phone,
      b.email,
      b.address,
      b.city,
      b.state,
      b.pincode,
      b.openingDate,
      b.status,
      b.staffCount,
      b.notes,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "branch-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetDemoData = () => {
    if (window.confirm("Replace current branches with demo data?")) {
      setBranches(demoBranches);
      setSearch("");
      setStatusFilter("All");
      setTypeFilter("All");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Page Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Building2 size={18} />
              Studio Management
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Branch Management
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage branch locations, managers, staff and branch status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100"
            >
              <Download size={17} />
              Export CSV
            </button>
            <button
              onClick={resetDemoData}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100"
            >
              <RotateCcw size={16} />
              Demo Data
            </button>
            <button
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Branch
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-2xl p-3 ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search branch, code, manager..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} pl-10`}
              >
                <option value="All">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={inputClass}
            >
              <option value="All">All Branch Types</option>
              {branchTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setTypeFilter("All");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Branch Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredBranches.length} branch
                {filteredBranches.length !== 1 ? "es" : ""} found
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4 font-bold">Branch</th>
                  <th className="px-5 py-4 font-bold">Type</th>
                  <th className="px-5 py-4 font-bold">Manager</th>
                  <th className="px-5 py-4 font-bold">Contact</th>
                  <th className="px-5 py-4 font-bold">City</th>
                  <th className="px-5 py-4 font-bold">Staff</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBranches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Building2 size={21} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {branch.branchName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {branch.branchCode} · {branch.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                        {branch.branchType}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {branch.manager || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Phone size={13} className="text-slate-400" />
                        {branch.phone || "—"}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail size={13} className="text-slate-400" />
                        {branch.email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-sm text-slate-700">
                        <MapPin size={14} className="text-slate-400" />
                        {branch.city || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {branch.state}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-slate-700">
                      {branch.staffCount}
                    </td>

                    <td className="px-5 py-4">
                      <Badge value={branch.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          title="View Branch"
                          onClick={() => setViewBranch(branch)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          title="Edit Branch"
                          onClick={() => openEditForm(branch)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          title="Delete Branch"
                          onClick={() => deleteBranch(branch.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBranches.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <Building2
                        size={35}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="font-bold text-slate-700">
                        No branches found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try changing the search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile / Tablet Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Building2 size={23} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="break-words font-bold text-slate-900">
                      {branch.branchName}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {branch.branchCode}
                    </p>
                  </div>
                </div>
                <Badge value={branch.status} />
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Branch Type</span>
                  <span className="text-right font-semibold text-slate-800">
                    {branch.branchType}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Manager</span>
                  <span className="text-right font-semibold text-slate-800">
                    {branch.manager || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Phone</span>
                  <span className="text-right font-semibold text-slate-800">
                    {branch.phone || "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Location</span>
                  <span className="text-right font-semibold text-slate-800">
                    {branch.city}, {branch.state}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Staff Count</span>
                  <span className="font-bold text-slate-800">
                    {branch.staffCount}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setViewBranch(branch)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => openEditForm(branch)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  onClick={() => deleteBranch(branch.id)}
                  className="flex items-center justify-center rounded-lg bg-red-50 px-3 py-2.5 text-red-600 hover:bg-red-100"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredBranches.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center sm:col-span-2">
              <Building2
                size={35}
                className="mx-auto mb-3 text-slate-300"
              />
              <p className="font-bold text-slate-700">No branches found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try changing the search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Branch Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editingId ? "Manage Branch" : "New Branch"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update branch information"
                    : "Enter the new branch details"}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto p-5 sm:p-7"
            >
              <div className="mb-5">
                <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-blue-600">
                  Branch Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Branch Name" required>
                    <input
                      required
                      value={form.branchName}
                      onChange={(e) =>
                        updateField("branchName", e.target.value)
                      }
                      placeholder="Enter branch name"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Branch Code" required>
                    <input
                      required
                      value={form.branchCode}
                      onChange={(e) =>
                        updateField("branchCode", e.target.value)
                      }
                      placeholder="Example: NGL006"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Branch Type" required>
                    <select
                      required
                      value={form.branchType}
                      onChange={(e) =>
                        updateField("branchType", e.target.value)
                      }
                      className={inputClass}
                    >
                      {branchTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Branch Manager">
                    <select
                      value={form.manager}
                      onChange={(e) => updateField("manager", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Manager</option>
                      {managerOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Branch Status" required>
                    <select
                      required
                      value={form.status}
                      onChange={(e) => updateField("status", e.target.value)}
                      className={inputClass}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Opening Date" required>
                    <input
                      type="date"
                      required
                      value={form.openingDate}
                      onChange={(e) =>
                        updateField("openingDate", e.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <div className="mb-5 border-t border-slate-100 pt-5">
                <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-blue-600">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Phone Number" required>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Enter phone number"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Email Address">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="branch@example.com"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="City" required>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Enter city"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="State" required>
                    <select
                      required
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className={inputClass}
                    >
                      {[
                        "Tamil Nadu",
                        "Kerala",
                        "Karnataka",
                        "Andhra Pradesh",
                        "Telangana",
                        "Maharashtra",
                        "Other",
                      ].map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Pincode">
                    <input
                      value={form.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      placeholder="Enter pincode"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Number of Staff">
                    <select
                      value={form.staffCount}
                      onChange={(e) =>
                        updateField("staffCount", e.target.value)
                      }
                      className={inputClass}
                    >
                      {Array.from({ length: 51 }, (_, index) => (
                        <option key={index} value={String(index)}>
                          {index} Staff
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="Full Address" required>
                      <textarea
                        required
                        rows={2}
                        value={form.address}
                        onChange={(e) =>
                          updateField("address", e.target.value)
                        }
                        placeholder="Enter full branch address"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-blue-600">
                  Additional Details
                </h3>

                <Field label="Notes">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Additional branch details..."
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                >
                  {editingId ? "Save Changes" : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Branch Modal */}
      {viewBranch && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewBranch(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Branch Details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {viewBranch.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewBranch(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {viewBranch.branchName}
                </h3>
                <Badge value={viewBranch.status} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Branch Code", viewBranch.branchCode],
                  ["Branch Type", viewBranch.branchType],
                  ["Branch Manager", viewBranch.manager],
                  ["Phone Number", viewBranch.phone],
                  ["Email Address", viewBranch.email],
                  ["City", viewBranch.city],
                  ["State", viewBranch.state],
                  ["Pincode", viewBranch.pincode],
                  ["Opening Date", viewBranch.openingDate],
                  ["Number of Staff", viewBranch.staffCount],
                  ["Full Address", viewBranch.address],
                  ["Notes", viewBranch.notes],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="break-words text-sm font-semibold text-slate-800">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setViewBranch(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const branch = viewBranch;
                    setViewBranch(null);
                    openEditForm(branch);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  <Pencil size={16} />
                  Edit Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Branches;
