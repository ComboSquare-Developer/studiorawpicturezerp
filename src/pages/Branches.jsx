
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Plus,
  Search,
  Eye,
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
  Hash,
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
  "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

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

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
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
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
        {!items.some(
          (item) => String(item.value) === String(value ?? "")
        ) && (
          <option value="">{placeholder}</option>
        )}

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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {status || "Inactive"}
    </span>
  );
}

function InfoBox({ icon: Icon, label, value, full = false }) {
  return (
    <div
      className={`min-w-0 rounded-xl bg-[#f7f9fc] p-3.5 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon size={14} className="shrink-0" />}
        <span className="truncate text-[11px] font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-[13px] font-bold leading-5 text-[#10264d]">
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  color = "blue",
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    red: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
        colors[color]
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <h3 className={`mt-3 text-3xl font-extrabold ${stat.color}`}>
            {stat.value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${stat.bg}`}>
          <Icon size={22} className={stat.color} />
        </div>
      </div>
    </div>
  );
}

function BranchCard({
  branch,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      {/* CARD HEADER */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Building2 size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-sm font-extrabold leading-5 text-[#10264d] sm:text-base">
              {branch.name || "Unnamed Branch"}
            </h3>

            <p className="mt-1 break-all text-[11px] font-medium text-slate-400">
              {branch.code || "No Code"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ActionButton
            icon={Eye}
            label="View Branch"
            onClick={() => onView(branch)}
          />

          <ActionButton
            icon={Pencil}
            label="Edit Branch"
            color="amber"
            onClick={() => onEdit(branch)}
          />

          <ActionButton
            icon={Trash2}
            label="Delete Branch"
            color="red"
            onClick={() => onDelete(branch)}
          />
        </div>
      </div>

      <div className="my-4 border-t border-slate-100" />

      {/* STATUS */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500">
          Branch Status
        </span>

        <StatusBadge status={branch.status} />
      </div>

      {/* DETAIL BOXES */}
      <div className="grid grid-cols-2 gap-2.5">
        <InfoBox
          icon={UserRound}
          label="Branch Manager"
          value={branch.manager || "Not assigned"}
        />

        <InfoBox
          icon={Phone}
          label="Phone Number"
          value={branch.phone}
        />

        <InfoBox
          icon={MapPin}
          label="City"
          value={branch.city}
        />

        <InfoBox
          icon={MapPin}
          label="State"
          value={branch.state}
        />

        <InfoBox
          icon={Hash}
          label="Pincode"
          value={branch.pincode}
        />

        <InfoBox
          icon={CalendarDays}
          label="Opening Date"
          value={formatDate(branch.openingDate)}
        />

        <InfoBox
          icon={Mail}
          label="Email Address"
          value={branch.email}
          full
        />

        {branch.address && (
          <InfoBox
            icon={MapPin}
            label="Full Address"
            value={branch.address}
            full
          />
        )}

        {branch.notes && (
          <InfoBox
            icon={FileText}
            label="Notes"
            value={branch.notes}
            full
          />
        )}
      </div>

      {/* QUICK STATUS */}
      <div className="mt-auto border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">
          Quick Status Update
        </p>

        <CustomDropdown
          value={branch.status || "Inactive"}
          options={["Active", "Inactive"]}
          onChange={(value) => onStatusChange(branch.id, value)}
        />
      </div>
    </article>
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
        onClick={closeForm}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={editingId ? "Edit Branch" : "Add Branch"}
        className="relative z-10 flex max-h-[94dvh] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8faff] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
      >
        {/* HEADER */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10264d] text-white">
                <Building2 size={22} />
              </div>

              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-blue-600">
                  Studio Raw / Branches
                </p>

                <h2 className="text-xl font-extrabold text-[#10264d]">
                  {editingId ? "Edit Branch" : "Add New Branch"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter studio branch information
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close"
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={saveBranch}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* SCROLLABLE CONTENT */}
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <SectionHeading
                icon={Building2}
                title="Branch Information"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <SectionHeading
                icon={Phone}
                title="Contact Information"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {renderField("phone")}
                {renderField("email")}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <SectionHeading
                icon={MapPin}
                title="Location Details"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <SectionHeading
                icon={FileText}
                title="Additional Information"
              />

              <FormField label="Notes">
                <textarea
                  rows={3}
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
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
              >
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                {error}
              </div>
            )}
          </div>

          {/* FIXED FOOTER */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button type="submit" className={primaryButton}>
                <Save size={17} />
                {editingId ? "Update Branch" : "Save Branch"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function ViewBranchModal({ branch, onClose, onEdit }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Branch Details"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Building2 size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold text-[#10264d]">
                {branch.name || "Branch Details"}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {branch.code || "No Code"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="mb-5">
            <StatusBadge status={branch.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox
              icon={Building2}
              label="Branch Name"
              value={branch.name}
              full
            />

            <InfoBox
              icon={Hash}
              label="Branch Code"
              value={branch.code}
            />

            <InfoBox
              icon={UserRound}
              label="Manager"
              value={branch.manager || "Not assigned"}
            />

            <InfoBox
              icon={Phone}
              label="Phone"
              value={branch.phone}
            />

            <InfoBox
              icon={Mail}
              label="Email"
              value={branch.email}
            />

            <InfoBox
              icon={MapPin}
              label="City"
              value={branch.city}
            />

            <InfoBox
              icon={MapPin}
              label="State"
              value={branch.state}
            />

            <InfoBox
              icon={Hash}
              label="Pincode"
              value={branch.pincode}
            />

            <InfoBox
              icon={CalendarDays}
              label="Opening Date"
              value={formatDate(branch.openingDate)}
            />

            <InfoBox
              icon={MapPin}
              label="Full Address"
              value={branch.address}
              full
            />

            <InfoBox
              icon={FileText}
              label="Notes"
              value={branch.notes}
              full
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 p-4 sm:flex-row sm:justify-end sm:p-5">
          <button
            type="button"
            onClick={onClose}
            className={secondaryButton}
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onEdit(branch)}
            className={primaryButton}
          >
            <Pencil size={16} />
            Edit Branch
          </button>
        </div>
      </div>
    </div>,
    document.body
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
  const [viewBranch, setViewBranch] = useState(null);
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
    window.addEventListener("storage", refreshStaff);

    return () => {
      window.removeEventListener("focus", refreshStaff);
      window.removeEventListener("storage", refreshStaff);
    };
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }, []);

  useEffect(() => {
    if (!showForm && !viewBranch) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (showForm) {
        closeForm();
      } else {
        setViewBranch(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm, viewBranch, closeForm]);

  const openAdd = () => {
    setStaff(readArray(STAFF_KEY));
    setEditingId(null);
    setForm({ ...initialForm });
    setError("");
    setViewBranch(null);
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
    setViewBranch(null);
    setShowForm(true);
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
        `Are you sure you want to delete "${branch.name}"?`
      )
    ) {
      return;
    }

    setBranches((previous) =>
      previous.filter((item) => item.id !== branch.id)
    );

    if (viewBranch?.id === branch.id) {
      setViewBranch(null);
    }

    if (editingId === branch.id) {
      closeForm();
    }
  };

  const updateStatus = (id, status) => {
    setBranches((previous) =>
      previous.map((branch) =>
        branch.id === id
          ? {
              ...branch,
              status,
              updatedAt: new Date().toISOString(),
            }
          : branch
      )
    );

    setViewBranch((previous) =>
      previous?.id === id
        ? { ...previous, status }
        : previous
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
        branch.email,
        branch.state,
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
      color: "text-emerald-700",
      bg: "bg-emerald-50",
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
        "Notes",
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
        branch.notes,
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
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      {/* PAGE HEADER */}
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Management
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Multi-Branch Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage studio locations, branch managers and operations.
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
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* BRANCH RECORDS */}
      <section className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* TOOLBAR */}
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#10264d]">
                <Building2 size={20} className="text-blue-600" />
                Studio Branches
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing {filteredBranches.length} of {branches.length} branches
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search branches..."
                  className={`${inputClass} pl-11`}
                />
              </div>

              <div className="w-full sm:w-44">
                <CustomDropdown
                  value={statusFilter}
                  options={[
                    { label: "All Status", value: "All" },
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                  onChange={setStatusFilter}
                />
              </div>

              <button
                type="button"
                onClick={exportCSV}
                className={secondaryButton}
              >
                <Download size={17} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* CARDS */}
        {filteredBranches.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-slate-50 p-5">
              <Building2 size={36} className="text-slate-300" />
            </div>

            <h3 className="font-bold text-[#10264d]">
              No branches found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Add your first studio branch or change your filters.
            </p>

            {branches.length === 0 && (
              <button
                type="button"
                onClick={openAdd}
                className={`${primaryButton} mt-5`}
              >
                <Plus size={16} />
                Add Branch
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 2xl:grid-cols-3">
            {filteredBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onView={setViewBranch}
                onEdit={openEdit}
                onDelete={deleteBranch}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <p className="mt-6 text-xs leading-6 text-slate-400">
        Branch details are saved locally in this browser.
        Branch-wise booking and revenue reports require branch
        assignment in the related modules.
      </p>

      {/* ADD / EDIT MODAL */}
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

      {/* VIEW MODAL */}
      {viewBranch && !showForm && (
        <ViewBranchModal
          branch={viewBranch}
          onClose={() => setViewBranch(null)}
          onEdit={openEdit}
        />
      )}
    </div>
  );
}
