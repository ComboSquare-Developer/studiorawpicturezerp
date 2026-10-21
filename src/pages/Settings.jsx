
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Settings as SettingsIcon,
  Users,
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Phone,
  Mail,
  UserRound,
  IndianRupee,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
  MapPin,
  FileText,
  BriefcaseBusiness,
  Clock3,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

const STAFF_KEY = "studioraw_staff";
const STUDIO_KEY = "studioraw_studio_settings";

const initialStudio = {
  name: "Studio Raw Picturez",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  city: "Nagercoil",
  state: "Tamil Nadu",
  gst: "",
  currency: "INR",
  invoicePrefix: "SRP",
  description: "",
};

const emptyStaff = {
  name: "",
  phone: "",
  email: "",
  role: "Photographer",
  department: "Production",
  salary: "",
  joiningDate: "",
  status: "Active",
  notes: "",
};

const roles = [
  "Photographer",
  "Videographer",
  "Candid Photographer",
  "Photo Editor",
  "Video Editor",
  "Album Designer",
  "Studio Manager",
  "Sales Executive",
  "Delivery Staff",
  "Other",
];

const departments = [
  "Production",
  "Editing",
  "Design",
  "Sales",
  "Administration",
  "Delivery",
];

const staffStatuses = ["Active", "On Leave", "Inactive"];

const statusColors = {
  Active: "bg-green-100 text-green-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) return fallback;

    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `STAFF-${Date.now()}-${Math.random().toString(36).slice(2)}`
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

function CustomDropdown({ value, options, onChange }) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-11`}
      >
        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>

      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
      />
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
              <Users size={23} />
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
            aria-label="Close staff form"
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fafcff] px-5 py-6 sm:px-9 sm:py-7">
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

function StaffDetail({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-[#f8faff] p-3.5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-lg bg-white p-2 text-[#174b91]">
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-[#8190a7]">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
            {value || "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="min-w-0 rounded-2xl border border-[#e8edf5] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#72819a]">
            {stat.label}
          </p>

          <h3 className={`mt-3 text-3xl font-bold ${stat.color}`}>
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

export default function Settings() {
  const [activeTab, setActiveTab] = useState("studio");

  const [studio, setStudio] = useState(() => {
    const saved = readStored(STUDIO_KEY, {});

    return {
      ...initialStudio,
      ...(saved &&
      typeof saved === "object" &&
      !Array.isArray(saved)
        ? saved
        : {}),
    };
  });

  const [staff, setStaff] = useState(() => {
    const saved = readStored(STAFF_KEY, []);
    return Array.isArray(saved) ? saved : [];
  });

  const [form, setForm] = useState({ ...emptyStaff });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [savedMessage, setSavedMessage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  }, [staff]);

  const updateStudio = (key, value) => {
    setStudio((previous) => ({
      ...previous,
      [key]: value,
    }));
    setSavedMessage(false);
  };

  const saveStudio = (event) => {
    event.preventDefault();

    localStorage.setItem(
      STUDIO_KEY,
      JSON.stringify(studio)
    );

    setSavedMessage(true);
  };

  const updateStaff = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
  };

  const openCreate = () => {
    setForm({ ...emptyStaff });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      ...emptyStaff,
      ...item,
    });
    setEditingId(item.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyStaff });
    setError("");
  };

  const saveStaff = (event) => {
    event.preventDefault();

    const salary =
      form.salary === "" ? "" : Number(form.salary);

    if (
      salary !== "" &&
      (!Number.isFinite(salary) || salary < 0)
    ) {
      setError("Enter a valid salary.");
      return;
    }

    const name = form.name.trim();

    if (!name) {
      setError("Staff name is required.");
      return;
    }

    const data = {
      ...form,
      name,
      id: editingId || createId(),
      salary,
    };

    if (editingId) {
      setStaff((previous) =>
        previous.map((item) =>
          item.id === editingId ? data : item
        )
      );
    } else {
      setStaff((previous) => [data, ...previous]);
    }

    closeForm();
  };

  const deleteStaff = (id) => {
    if (window.confirm("Delete this staff member?")) {
      setStaff((previous) =>
        previous.filter((item) => item.id !== id)
      );
    }
  };

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((item) => {
      const matchesSearch = [
        item.name,
        item.phone,
        item.email,
        item.role,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matchesSearch &&
        (roleFilter === "All" || item.role === roleFilter)
      );
    });
  }, [staff, search, roleFilter]);

  const stats = [
    {
      label: "Total Staff",
      value: staff.length,
      color: "text-blue-700",
      bg: "bg-blue-50",
      icon: Users,
    },
    {
      label: "Active Staff",
      value: staff.filter(
        (item) => item.status === "Active"
      ).length,
      color: "text-green-700",
      bg: "bg-green-50",
      icon: CheckCircle2,
    },
    {
      label: "On Leave",
      value: staff.filter(
        (item) => item.status === "On Leave"
      ).length,
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: Clock3,
    },
    {
      label: "Departments",
      value: new Set(
        staff.map((item) => item.department)
      ).size,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-[#f7f9fc] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      {/* Header */}
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white shadow-sm">
          <SettingsIcon size={24} />
        </div>

        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl">
            Settings & Staff Management
          </h1>

          <p className="mt-1 text-sm leading-6 text-[#8190a7]">
            Manage studio information and team members
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            setActiveTab("studio");
            closeForm();
          }}
          className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
            activeTab === "studio"
              ? "bg-[#112e60] text-white shadow-sm"
              : "border border-[#e1e7f0] bg-white text-[#52627d] hover:bg-slate-50"
          }`}
        >
          <Building2 size={18} />
          Studio Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
            activeTab === "staff"
              ? "bg-[#112e60] text-white shadow-sm"
              : "border border-[#e1e7f0] bg-white text-[#52627d] hover:bg-slate-50"
          }`}
        >
          <Users size={18} />
          Staff Management
        </button>
      </div>

      {/* Studio Settings */}
      {activeTab === "studio" && (
        <section className="min-w-0 rounded-2xl border border-[#e7edf6] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="rounded-xl bg-blue-50 p-3 text-[#174b91]">
              <Building2 size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Studio Information
              </h2>

              <p className="mt-1 text-sm text-[#8190a7]">
                Update your studio business profile
              </p>
            </div>
          </div>

          <form onSubmit={saveStudio} className="space-y-8">
            <section>
              <SectionHeading
                icon={Building2}
                title="Business Information"
                description="Studio identity and contact details"
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {[
                  ["Studio Name", "name", "text", true],
                  ["Email Address", "email", "email", false],
                  ["Phone Number", "phone", "tel", false],
                  ["WhatsApp Number", "whatsapp", "tel", false],
                ].map(([label, key, type, required]) => (
                  <FormField
                    key={key}
                    label={label}
                    required={required}
                  >
                    <input
                      type={type}
                      required={required}
                      value={studio[key] ?? ""}
                      onChange={(event) =>
                        updateStudio(key, event.target.value)
                      }
                      className={inputClass}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </FormField>
                ))}
              </div>
            </section>

            <section>
              <SectionHeading
                icon={MapPin}
                title="Location Information"
                description="Studio address and location"
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="City">
                  <input
                    type="text"
                    value={studio.city ?? ""}
                    onChange={(event) =>
                      updateStudio("city", event.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="State">
                  <input
                    type="text"
                    value={studio.state ?? ""}
                    onChange={(event) =>
                      updateStudio("state", event.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Studio Address">
                    <textarea
                      rows={3}
                      value={studio.address ?? ""}
                      onChange={(event) =>
                        updateStudio("address", event.target.value)
                      }
                      className={`${inputClass} resize-y`}
                      placeholder="Enter full studio address"
                    />
                  </FormField>
                </div>
              </div>
            </section>

            <section>
              <SectionHeading
                icon={FileText}
                title="Billing Information"
                description="Invoice and business tax details"
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="GST Number">
                  <input
                    type="text"
                    value={studio.gst ?? ""}
                    onChange={(event) =>
                      updateStudio("gst", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Enter GST number"
                  />
                </FormField>

                <FormField label="Invoice Prefix">
                  <input
                    type="text"
                    value={studio.invoicePrefix ?? ""}
                    onChange={(event) =>
                      updateStudio(
                        "invoicePrefix",
                        event.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="e.g. SRP"
                  />
                </FormField>

                <FormField label="Currency">
                  <CustomDropdown
                    value={studio.currency}
                    options={[
                      {
                        value: "INR",
                        label: "INR – Indian Rupee",
                      },
                    ]}
                    onChange={(value) =>
                      updateStudio("currency", value)
                    }
                  />
                </FormField>
              </div>
            </section>

            <section>
              <SectionHeading
                icon={FileText}
                title="About the Studio"
                description="Additional business description"
              />

              <FormField label="Business Description">
                <textarea
                  rows={4}
                  value={studio.description ?? ""}
                  onChange={(event) =>
                    updateStudio(
                      "description",
                      event.target.value
                    )
                  }
                  className={`${inputClass} resize-y`}
                  placeholder="About your photography studio..."
                />
              </FormField>
            </section>

            <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {savedMessage ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                  <CheckCircle2 size={19} />
                  Studio settings saved successfully
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Changes are saved when you click Save Settings.
                </p>
              )}

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4384]"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Staff Management */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          {/* Staff Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>

          {/* Staff List */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e7edf6] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Team Members
                </h2>

                <p className="mt-1 text-sm text-[#8190a7]">
                  Manage photographers, editors and studio staff
                </p>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4384]"
              >
                <Plus size={18} />
                Add Staff
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-end sm:p-6">
              <div className="w-full sm:flex-1">
                <FormField label="Search Staff">
                  <div className="relative">
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
                      placeholder="Search staff..."
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </FormField>
              </div>

              <div className="w-full sm:w-56">
                <FormField label="Filter by Role">
                  <CustomDropdown
                    value={roleFilter}
                    options={[
                      { value: "All", label: "All Roles" },
                      ...roles,
                    ]}
                    onChange={setRoleFilter}
                  />
                </FormField>
              </div>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Users
                  size={42}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm text-slate-400">
                  No staff members found
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[950px] border-collapse text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {[
                          "Staff Member",
                          "Contact",
                          "Department",
                          "Salary",
                          "Joining Date",
                          "Status",
                          "Actions",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredStaff.map((item) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-blue-50/40"
                        >
                          <td className="px-5 py-5">
                            <p className="max-w-40 break-words text-sm font-semibold text-[#10264d]">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.role}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm text-[#10264d]">
                              {item.phone || "—"}
                            </p>

                            <p className="mt-1 max-w-48 break-words text-xs text-slate-500">
                              {item.email || "—"}
                            </p>
                          </td>

                          <td className="px-5 py-5 text-sm text-slate-700">
                            {item.department || "—"}
                          </td>

                          <td className="px-5 py-5 text-sm font-semibold text-[#10264d]">
                            {item.salary === "" ||
                            item.salary == null
                              ? "Not set"
                              : `₹${Number(
                                  item.salary
                                ).toLocaleString("en-IN")}`}
                          </td>

                          <td className="px-5 py-5 text-sm text-slate-700">
                            {item.joiningDate || "—"}
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                statusColors[item.status] ||
                                statusColors.Inactive
                              }`}
                            >
                              {item.status || "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                title="Edit Staff"
                                className="rounded-lg bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-100"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteStaff(item.id)
                                }
                                title="Delete Staff"
                                className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
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

                {/* Mobile / Tablet Cards */}
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
                  {filteredStaff.map((item) => (
                    <article
                      key={item.id}
                      className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-[#174b91]">
                          <UserRound size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-base font-bold text-[#10264d]">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {item.role}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`mt-4 inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          statusColors[item.status] ||
                          statusColors.Inactive
                        }`}
                      >
                        {item.status || "Inactive"}
                      </span>

                      <div className="mt-5 grid grid-cols-1 gap-3">
                        <StaffDetail
                          icon={Phone}
                          label="Phone Number"
                          value={item.phone}
                        />

                        <StaffDetail
                          icon={Mail}
                          label="Email Address"
                          value={item.email}
                        />

                        <StaffDetail
                          icon={Users}
                          label="Department"
                          value={item.department}
                        />

                        <StaffDetail
                          icon={IndianRupee}
                          label="Monthly Salary"
                          value={
                            item.salary === "" ||
                            item.salary == null
                              ? "Salary not set"
                              : `₹${Number(
                                  item.salary
                                ).toLocaleString("en-IN")}`
                          }
                        />

                        <StaffDetail
                          icon={CalendarDays}
                          label="Joining Date"
                          value={item.joiningDate}
                        />

                        {item.notes && (
                          <div className="rounded-xl bg-[#f8faff] p-4">
                            <p className="text-xs text-slate-500">
                              Notes
                            </p>

                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#112e60] px-4 py-3 text-sm font-semibold text-white"
                        >
                          <Pencil size={17} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteStaff(item.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
                        >
                          <Trash2 size={17} />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Add / Edit Staff Center Popup */}
      {activeTab === "staff" && showForm && (
        <ModalShell
          title={editingId ? "Edit Staff" : "Add Staff Member"}
          description="Enter team member information"
          onClose={closeForm}
          onSubmit={saveStaff}
          submitLabel={
            editingId ? "Update Staff" : "Save Staff"
          }
        >
          <div className="space-y-8">
            {/* Personal Information */}
            <section>
              <SectionHeading
                icon={UserRound}
                title="Personal Information"
                description="Basic contact details of the team member"
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Full Name" required>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.name}
                    onChange={(event) =>
                      updateStaff("name", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Enter full name"
                  />
                </FormField>

                <FormField label="Phone Number">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateStaff("phone", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Enter phone number"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Email Address">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateStaff("email", event.target.value)
                      }
                      className={inputClass}
                      placeholder="Enter email address"
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* Employment Details */}
            <section>
              <SectionHeading
                icon={BriefcaseBusiness}
                title="Employment Details"
                description="Role, department and salary information"
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Staff Role">
                  <CustomDropdown
                    value={form.role}
                    options={roles}
                    onChange={(value) =>
                      updateStaff("role", value)
                    }
                  />
                </FormField>

                <FormField label="Department">
                  <CustomDropdown
                    value={form.department}
                    options={departments}
                    onChange={(value) =>
                      updateStaff("department", value)
                    }
                  />
                </FormField>

                <FormField label="Monthly Salary (₹)">
                  <input
                    type="number"
                    min="0"
                    value={form.salary}
                    onChange={(event) =>
                      updateStaff("salary", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Enter monthly salary"
                  />
                </FormField>

                <FormField label="Joining Date">
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(event) =>
                      updateStaff(
                        "joiningDate",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Staff Status">
                  <CustomDropdown
                    value={form.status}
                    options={staffStatuses}
                    onChange={(value) =>
                      updateStaff("status", value)
                    }
                  />
                </FormField>
              </div>
            </section>

            {/* Notes */}
            <section>
              <SectionHeading
                icon={FileText}
                title="Additional Information"
                description="Any special notes about this staff member"
              />

              <FormField label="Notes">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    updateStaff("notes", event.target.value)
                  }
                  className={`${inputClass} resize-y`}
                  placeholder="Additional staff details..."
                />
              </FormField>
            </section>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
