
import { useEffect, useMemo, useState } from "react";
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
  CalendarDays,
  FileText,
  RefreshCw,
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
  "block w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-[#8ca0bd] focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButton =
  "flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384]";

const secondaryButton =
  "flex items-center justify-center gap-2 rounded-xl border border-[#d9e3f2] bg-white px-5 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

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
  let text = String(value ?? "");
  if (/^\s*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
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

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#174b91]">
        <Icon size={19} />
      </div>
      <h3 className="text-sm font-bold text-[#10264d]">
        {title}
      </h3>
    </div>
  );
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
}) {
  const items = options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : option
  );

  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
        {items.some((item) => String(item.value) === String(value))
          ? null
          : <option value="">{placeholder}</option>}

        {items.map((item) => (
          <option key={String(item.value)} value={item.value}>
            {item.label}
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

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {status || "Inactive"}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0 border-b border-slate-100 pb-3 last:border-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
        {value === undefined || value === null || value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function BranchModal({
  form,
  editingId,
  managerOptions,
  updateField,
  closeForm,
  saveBranch,
  error,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") closeForm();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeForm]);

  const fields = [
    {
      label: "Branch Name",
      key: "name",
      type: "text",
      required: true,
      placeholder: "Enter branch name",
    },
    {
      label: "Branch Code",
      key: "code",
      type: "text",
      required: true,
      placeholder: "e.g. SRP-001",
    },
    {
      label: "Phone Number",
      key: "phone",
      type: "tel",
      placeholder: "Enter contact number",
    },
    {
      label: "Email Address",
      key: "email",
      type: "email",
      placeholder: "Enter email address",
    },
    {
      label: "City",
      key: "city",
      type: "text",
      required: true,
      placeholder: "Enter city",
    },
    {
      label: "State",
      key: "state",
      type: "text",
      placeholder: "Enter state",
    },
    {
      label: "Pincode",
      key: "pincode",
      type: "text",
      placeholder: "Enter pincode",
    },
    {
      label: "Opening Date",
      key: "openingDate",
      type: "date",
    },
  ];

  const renderField = (key) => {
    const field = fields.find((item) => item.key === key);
    if (!field) return null;

    return (
      <FormField
        key={field.key}
        label={field.label}
        required={field.required}
      >
        <input
          type={field.type}
          required={field.required}
          value={form[field.key] ?? ""}
          onChange={(event) =>
            updateField(field.key, event.target.value)
          }
          placeholder={field.placeholder}
          className={inputClass}
        />
      </FormField>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152d]/65 p-2 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeForm();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editingId ? "Edit Branch" : "Add Branch"}
        className="flex max-h-[96dvh] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[93dvh] sm:rounded-[22px]"
      >
        {/* MODAL HEADER */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5ebf3] bg-white px-5 py-5 sm:px-9 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white">
              <Building2 size={23} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#10264d] sm:text-[23px]">
                {editingId ? "Edit Branch" : "Add New Branch"}
              </h2>
              <p className="mt-1 text-xs text-[#8090aa] sm:text-sm">
                Enter studio branch information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeForm}
            aria-label="Close branch form"
            className="rounded-lg p-2 text-[#627895] hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={saveBranch}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* SCROLLABLE BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-9 sm:py-7">
            <div className="space-y-8">

              {/* BASIC INFORMATION */}
              <section>
                <SectionHeading
                  icon={Building2}
                  title="Branch Information"
                />
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  {renderField("name")}
                  {renderField("code")}

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
                </div>
              </section>

              {/* CONTACT DETAILS */}
              <section>
                <SectionHeading
                  icon={Phone}
                  title="Contact Information"
                />
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  {renderField("phone")}
                  {renderField("email")}
                </div>
              </section>

              {/* LOCATION DETAILS */}
              <section>
                <SectionHeading
                  icon={MapPin}
                  title="Location Details"
                />
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  {renderField("city")}
                  {renderField("state")}
                  {renderField("pincode")}
                  {renderField("openingDate")}
                </div>

                <div className="mt-5">
                  <FormField label="Full Address">
                    <textarea
                      rows={3}
                      value={form.address ?? ""}
                      onChange={(event) =>
                        updateField("address", event.target.value)
                      }
                      placeholder="Street, area, landmark..."
                      className={`${inputClass} resize-y`}
                    />
                  </FormField>
                </div>
              </section>

              {/* NOTES */}
              <section>
                <SectionHeading
                  icon={FileText}
                  title="Additional Information"
                />
                <FormField label="Notes">
                  <textarea
                    rows={4}
                    value={form.notes ?? ""}
                    onChange={(event) =>
                      updateField("notes", event.target.value)
                    }
                    placeholder="Additional branch information..."
                    className={`${inputClass} resize-y`}
                  />
                </FormField>
              </section>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                >
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* FIXED FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e5ebf3] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-9 sm:py-5">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-[#d9e3f2] bg-[#f7f9fd] px-7 py-3.5 text-sm font-semibold text-[#18345f] hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#1a4384]"
            >
              <Save size={18} />
              {editingId ? "Update Branch" : "Save Branch"}
            </button>
          </div>
        </form>
      </div>
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

  const openAdd = () => {
    setStaff(readArray(STAFF_KEY));
    setEditingId(null);
    setForm({ ...initialForm });
    setError("");
    setShowForm(true);
  };

  const openEdit = (branch) => {
    setStaff(readArray(STAFF_KEY));
    setEditingId(branch.id);
    setForm({
      ...initialForm,
      ...branch,
    });
    setError("");
    setShowForm(true);
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
    setError("");
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
        String(branch.code || "").trim().toUpperCase() === code
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

    if (editingId === branch.id) closeForm();
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

  const stats = [
    {
      label: "Total Branches",
      value: branches.length,
      icon: Building2,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Active Branches",
      value: branches.filter(
        (branch) => branch.status === "Active"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Inactive Branches",
      value: branches.filter(
        (branch) => branch.status === "Inactive"
      ).length,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Cities Covered",
      value: new Set(
        branches
          .map((branch) =>
            String(branch.city || "").trim().toLowerCase()
          )
          .filter(Boolean)
      ).size,
      icon: MapPin,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
  ];

  const exportCSV = () => {
    const rows = [
      [
        "Branch Name", "Code", "Manager", "Phone",
        "Email", "Address", "City", "State",
        "Pincode", "Opening Date", "Status",
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
    { label: "Select Manager", value: "" },
    ...(form.manager &&
    !staff.some((person) => person.name === form.manager)
      ? [{ label: form.manager, value: form.manager }]
      : []),
    ...staff
      .filter((person) => person.name)
      .map((person) => ({
        label: `${person.name} - ${person.role || "Staff"}`,
        value: person.name,
      })),
  ];

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl">
            Multi-Branch Management
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage studio locations, branch managers and operations
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className={`${primaryButton} w-full shrink-0 sm:w-auto`}
        >
          <Plus size={18} />
          Add Branch
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="group min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <h2 className={`mt-3 text-2xl font-bold ${stat.color}`}>
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

      {/* BRANCH RECORDS */}
      <section className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Studio Branches
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage all your studio branch locations.
              </p>
            </div>

            <button
              type="button"
              onClick={exportCSV}
              className={`${secondaryButton} w-full sm:w-auto`}
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {/* FILTERS */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Search Branches">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search branch, code, city or manager..."
                  className={`${inputClass} pl-11`}
                />
              </div>
            </FormField>

            <FormField label="Filter Status">
              <CustomDropdown
                value={statusFilter}
                options={[
                  { label: "All Status", value: "All" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                onChange={setStatusFilter}
              />
            </FormField>
          </div>
        </div>

        {filteredBranches.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <Building2
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="text-sm font-semibold text-slate-500">
              No branches found.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Add your first studio branch or change your filters.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {[
                      "Branch", "Manager", "Contact",
                      "Location", "Opening Date", "Status", "Actions",
                    ].map((heading) => (
                      <th key={heading} className="px-5 py-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBranches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="align-top transition hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 rounded-xl bg-blue-50 p-2.5 text-[#10264d]">
                            <Building2 size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#10264d]">
                              {branch.name || "Unnamed Branch"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {branch.code || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm text-[#10264d]">
                          <UserRound size={16} className="shrink-0 text-blue-600" />
                          {branch.manager || "Not assigned"}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="space-y-2">
                          <p className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone size={14} className="shrink-0" />
                            {branch.phone || "—"}
                          </p>
                          <p className="flex items-center gap-2 break-all text-xs text-slate-600">
                            <Mail size={14} className="shrink-0" />
                            {branch.email || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="max-w-[220px] px-5 py-5">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="mt-0.5 shrink-0 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-[#10264d]">
                              {branch.city || "—"}
                            </p>
                            <p className="mt-1 break-words text-xs text-slate-500">
                              {branch.state || "—"}
                              {branch.pincode ? ` - ${branch.pincode}` : ""}
                            </p>
                            {branch.address && (
                              <p className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-500">
                                {branch.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-600">
                        {branch.openingDate || "—"}
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge status={branch.status} />
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Edit Branch"
                            aria-label={`Edit ${branch.name}`}
                            onClick={() => openEdit(branch)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete Branch"
                            aria-label={`Delete ${branch.name}`}
                            onClick={() => deleteBranch(branch)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE AND TABLET CARDS */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
              {filteredBranches.map((branch) => (
                <article
                  key={branch.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#10264d]">
                      <Building2 size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {branch.name || "Unnamed Branch"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Code: {branch.code || "—"}
                      </p>
                      <div className="mt-3">
                        <StatusBadge status={branch.status} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Detail label="Branch Manager" value={branch.manager || "Not assigned"} />
                    <Detail label="Phone Number" value={branch.phone} />
                    <Detail label="Email Address" value={branch.email} />
                    <Detail label="Full Address" value={branch.address} />
                    <Detail label="City" value={branch.city} />
                    <Detail label="State" value={branch.state} />
                    <Detail label="Pincode" value={branch.pincode} />
                    <Detail label="Opening Date" value={branch.openingDate} />
                    <Detail label="Notes" value={branch.notes} />
                  </div>

                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(branch)}
                      className={`${primaryButton} w-full`}
                    >
                      <Pencil size={17} />
                      Edit Branch
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteBranch(branch)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete Branch
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* LOCAL STORAGE NOTICE */}
      <p className="break-words text-xs leading-6 text-slate-400">
        Branch details are saved locally in this browser.
        Branch-wise booking and revenue reports will require
        branch assignment in the related modules.
      </p>

      {/* ADD / EDIT BRANCH MODAL */}
      {showForm && (
        <BranchModal
          form={form}
          editingId={editingId}
          managerOptions={managerOptions}
          updateField={updateField}
          closeForm={closeForm}
          saveBranch={saveBranch}
          error={error}
        />
      )}
    </div>
  );
}
