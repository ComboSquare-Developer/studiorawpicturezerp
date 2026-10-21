
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  MapPin,
  Phone,
  Mail,
  UserRound,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronDown,
  Check,
} from "lucide-react";

const BRANCH_KEY = "studioraw_branches";
const STAFF_KEY = "studioraw_staff";

const initialForm = {
  name: "",
  code: "",
  manager: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "Tamil Nadu",
  pincode: "",
  openingDate: "",
  status: "Active",
  notes: "",
};

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `BR-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
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
      ? { label: option, value: option }
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
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  <Check size={16} className="shrink-0" />
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

export default function Branches() {
  const [branches, setBranches] = useState(() =>
    readArray(BRANCH_KEY)
  );

  const [staff, setStaff] = useState(() =>
    readArray(STAFF_KEY)
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [error, setError] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      BRANCH_KEY,
      JSON.stringify(branches)
    );
  }, [branches]);

  useEffect(() => {
    const refreshStaff = () => {
      setStaff(readArray(STAFF_KEY));
    };

    window.addEventListener("focus", refreshStaff);

    return () => {
      window.removeEventListener("focus", refreshStaff);
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

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...initialForm });
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const openEdit = (branch) => {
    setEditingId(branch.id);
    setForm({
      ...initialForm,
      ...branch,
    });
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveBranch = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const city = form.city.trim();

    if (!name || !code || !city) {
      setError("Branch name, code and city are required.");
      return;
    }

    const duplicateCode = branches.some(
      (branch) =>
        branch.id !== editingId &&
        String(branch.code || "").toUpperCase() === code
    );

    if (duplicateCode) {
      setError("Branch code already exists.");
      return;
    }

    const record = {
      ...form,
      id: editingId || createId(),
      name,
      code,
      city,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setBranches((previous) =>
        previous.map((branch) =>
          branch.id === editingId ? record : branch
        )
      );
    } else {
      setBranches((previous) => [record, ...previous]);
    }

    closeForm();
  };

  const deleteBranch = (branch) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${branch.name}?`
      )
    ) {
      return;
    }

    setBranches((previous) =>
      previous.filter((item) => item.id !== branch.id)
    );
  };

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return branches.filter((branch) => {
      const matchesSearch = [
        branch.name,
        branch.code,
        branch.city,
        branch.manager,
        branch.phone,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "All" ||
        branch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  const totalBranches = branches.length;

  const activeBranches = branches.filter(
    (branch) => branch.status === "Active"
  ).length;

  const inactiveBranches = branches.filter(
    (branch) => branch.status === "Inactive"
  ).length;

  const cities = new Set(
    branches
      .map((branch) =>
        String(branch.city || "").trim().toLowerCase()
      )
      .filter(Boolean)
  ).size;

  const stats = [
    {
      label: "Total Branches",
      value: totalBranches,
      icon: Building2,
      color: "text-blue-700",
    },
    {
      label: "Active Branches",
      value: activeBranches,
      icon: CheckCircle2,
      color: "text-green-700",
    },
    {
      label: "Inactive Branches",
      value: inactiveBranches,
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      label: "Cities Covered",
      value: cities,
      icon: MapPin,
      color: "text-indigo-700",
    },
  ];

  const exportCSV = () => {
    const rows = [
      [
        "Branch Name",
        "Code",
        "Manager",
        "Phone",
        "Email",
        "Address",
        "City",
        "State",
        "Pincode",
        "Opening Date",
        "Status",
      ],
      ...filteredBranches.map((branch) => [
        branch.name,
        branch.code,
        branch.manager,
        branch.phone,
        branch.email,
        branch.address,
        branch.city,
        branch.state,
        branch.pincode,
        branch.openingDate,
        branch.status,
      ]),
    ];

    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "studioraw-branches.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const managerOptions = [
    {
      label: "Select Manager",
      value: "",
    },
    ...(form.manager &&
    !staff.some((person) => person.name === form.manager)
      ? [
          {
            label: form.manager,
            value: form.manager,
          },
        ]
      : []),
    ...staff.map((person) => ({
      label: `${person.name} - ${person.role || "Staff"}`,
      value: person.name,
    })),
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-[#10264d]">
            Multi-Branch Management
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage studio locations, branch managers and operations
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
        >
          <Plus size={18} />
          Add Branch
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

      {/* Branch Records */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex w-full min-w-0 flex-col gap-4">
          <h2 className="break-words text-lg font-bold text-[#10264d]">
            Studio Branches
          </h2>

          <button
            type="button"
            onClick={exportCSV}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex w-full min-w-0 flex-col gap-4">
          <FormField label="Search Branches">
            <div className="relative w-full min-w-0">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search branch, code, city or manager..."
                className={`${inputClass} pl-11`}
              />
            </div>
          </FormField>

          <FormField label="Filter Status">
            <CustomDropdown
              value={statusFilter}
              options={[
                {
                  label: "All Status",
                  value: "All",
                },
                {
                  label: "Active",
                  value: "Active",
                },
                {
                  label: "Inactive",
                  value: "Inactive",
                },
              ]}
              onChange={setStatusFilter}
            />
          </FormField>
        </div>

        {/* Branch Cards */}
        <div className="flex w-full min-w-0 flex-col gap-4">
          {filteredBranches.map((branch) => (
            <article
              key={branch.id}
              className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
            >
              <div className="flex w-full min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#10264d]">
                  <Building2 size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-base font-bold text-[#10264d]">
                    {branch.name || "Unnamed Branch"}
                  </h3>

                  <p className="mt-1 break-words text-xs text-slate-500">
                    Branch Code: {branch.code || "—"}
                  </p>

                  <span
                    className={`mt-3 inline-flex max-w-full rounded-full px-3 py-1 text-xs font-semibold ${
                      branch.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {branch.status || "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                <Detail
                  label="Branch Name"
                  value={branch.name}
                />

                <Detail
                  label="Branch Code"
                  value={branch.code}
                />

                <Detail
                  label="Branch Manager"
                  value={branch.manager || "Manager not assigned"}
                />

                <Detail
                  label="Phone Number"
                  value={branch.phone || "No phone number"}
                />

                <Detail
                  label="Email Address"
                  value={branch.email || "No email"}
                />

                <Detail
                  label="Full Address"
                  value={branch.address}
                />

                <Detail
                  label="City"
                  value={branch.city}
                />

                <Detail
                  label="State"
                  value={branch.state}
                />

                <Detail
                  label="Pincode"
                  value={branch.pincode}
                />

                <Detail
                  label="Opening Date"
                  value={branch.openingDate}
                />

                <Detail
                  label="Status"
                  value={branch.status}
                />

                <Detail
                  label="Notes"
                  value={branch.notes}
                />
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => openEdit(branch)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
                >
                  <Pencil size={17} />
                  Edit Branch
                </button>

                <button
                  type="button"
                  onClick={() => deleteBranch(branch)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={17} />
                  Delete Branch
                </button>
              </div>
            </article>
          ))}

          {filteredBranches.length === 0 && (
            <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <Building2
                size={32}
                className="mb-3 text-slate-300"
              />

              <p className="text-sm font-semibold text-slate-600">
                No branches found.
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Add your first studio branch or change your filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Inline Add / Edit Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex w-full min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId ? "Edit Branch" : "Add Branch"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter studio branch information
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close branch form"
              className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={saveBranch}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            {[
              ["Branch Name", "name", "text", true],
              ["Branch Code", "code", "text", true],
              ["Phone Number", "phone", "tel", false],
              ["Email Address", "email", "email", false],
              ["City", "city", "text", true],
              ["State", "state", "text", false],
              ["Pincode", "pincode", "text", false],
              ["Opening Date", "openingDate", "date", false],
            ].map(([label, key, type, required]) => (
              <FormField key={key} label={label}>
                <input
                  type={type}
                  required={required}
                  value={form[key] ?? ""}
                  onChange={(event) =>
                    updateField(key, event.target.value)
                  }
                  className={inputClass}
                  placeholder={
                    type === "text"
                      ? `Enter ${label}`
                      : undefined
                  }
                />
              </FormField>
            ))}

            <FormField label="Branch Manager">
              <CustomDropdown
                value={form.manager}
                options={managerOptions}
                onChange={(value) =>
                  updateField("manager", value)
                }
                placeholder="Select Manager"
              />
            </FormField>

            <FormField label="Branch Status">
              <CustomDropdown
                value={form.status}
                options={["Active", "Inactive"]}
                onChange={(value) =>
                  updateField("status", value)
                }
              />
            </FormField>

            <FormField label="Full Address">
              <textarea
                rows={4}
                value={form.address ?? ""}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
                className={`${inputClass} resize-y`}
                placeholder="Street, area, landmark..."
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                rows={4}
                value={form.notes ?? ""}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                className={`${inputClass} resize-y`}
                placeholder="Additional branch information..."
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="break-words rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
              >
                <Save size={18} />
                {editingId
                  ? "Update Branch"
                  : "Save Branch"}
              </button>
            </div>
          </form>
        </section>
      )}

      <p className="break-words text-xs leading-6 text-slate-400">
        Branch details are saved locally in this browser.
        Branch-wise booking and revenue reports will require
        branch assignment in the related modules.
      </p>
    </div>
  );
}
