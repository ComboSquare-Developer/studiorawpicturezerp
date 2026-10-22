
import { useCallback, useEffect, useMemo, useState } from "react";
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
  ChevronDown,
  Eye,
  ShieldCheck,
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
  Active: "bg-emerald-50 text-emerald-700",
  "On Leave": "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

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

function formatSalary(value) {
  if (value === "" || value == null) return "Not set";

  const number = Number(value);

  return Number.isFinite(number)
    ? `₹${number.toLocaleString("en-IN")}`
    : "Not set";
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) return String(value);

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
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`${inputClass} appearance-none pr-11`}
      >
        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option
              key={String(item.value)}
              value={item.value}
            >
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

function SectionHeading({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[#10264d]">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function DetailBox({
  icon: Icon,
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={`min-w-0 rounded-xl bg-[#f7f9fc] p-3 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 text-slate-400">
        {Icon && (
          <Icon size={14} className="shrink-0" />
        )}

        <span className="truncate text-[11px] font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-[13px] font-bold leading-5 text-[#10264d]">
        {value === "" || value == null
          ? "Not provided"
          : value}
      </p>
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {stat.label}
          </p>

          <h3
            className={`mt-3 text-2xl font-extrabold sm:text-3xl ${stat.color}`}
          >
            {stat.value}
          </h3>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
        >
          <Icon size={20} className={stat.color} />
        </div>
      </div>
    </div>
  );
}

function IconButton({
  icon: Icon,
  label,
  color,
  onClick,
}) {
  const colors = {
    view: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    edit: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    delete: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
        colors[color] || colors.edit
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function StaffCard({
  item,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      {/* CARD HEADER */}
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <UserRound size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-sm font-extrabold leading-5 text-[#10264d] sm:text-base">
              {item.name || "Unnamed Staff"}
            </h3>

            <p className="mt-1 break-words text-[11px] text-slate-400">
              {item.role || "Staff Member"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            icon={Eye}
            label="View Staff"
            color="view"
            onClick={() => onView(item)}
          />

          <IconButton
            icon={Pencil}
            label="Edit Staff"
            color="edit"
            onClick={() => onEdit(item)}
          />

          <IconButton
            icon={Trash2}
            label="Delete Staff"
            color="delete"
            onClick={() => onDelete(item.id)}
          />
        </div>
      </div>

      <div className="my-4 border-t border-slate-100" />

      {/* STATUS */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ${
            statusColors[item.status] ||
            statusColors.Inactive
          }`}
        >
          {item.status || "Inactive"}
        </span>

        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700">
          {item.department || "No Department"}
        </span>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-2 gap-2.5">
        <DetailBox
          icon={Phone}
          label="Phone Number"
          value={item.phone}
        />

        <DetailBox
          icon={Mail}
          label="Email Address"
          value={item.email}
        />

        <DetailBox
          icon={BriefcaseBusiness}
          label="Department"
          value={item.department}
        />

        <DetailBox
          icon={IndianRupee}
          label="Monthly Salary"
          value={formatSalary(item.salary)}
        />

        <DetailBox
          icon={CalendarDays}
          label="Joining Date"
          value={formatDate(item.joiningDate)}
          full
        />

        {item.notes && (
          <DetailBox
            icon={FileText}
            label="Notes"
            value={item.notes}
            full
          />
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={14} />
            Team Member
          </span>

          <button
            type="button"
            onClick={() => onView(item)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            <Eye size={15} />
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

function Modal({
  title,
  description,
  icon: Icon,
  onClose,
  children,
  width = "max-w-[760px]",
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[#07152b]/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[94dvh] w-full ${width} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8faff] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10264d] text-white">
              <Icon size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-xl font-extrabold text-[#10264d]">
                {title}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
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
  const [viewStaff, setViewStaff] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [savedMessage, setSavedMessage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(
      STAFF_KEY,
      JSON.stringify(staff)
    );
  }, [staff]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyStaff });
    setError("");
  }, []);

  useEffect(() => {
    if (!showForm && !viewStaff) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (showForm) {
        closeForm();
      } else {
        setViewStaff(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [showForm, viewStaff, closeForm]);

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

    if (error) setError("");
  };

  const openCreate = () => {
    setForm({ ...emptyStaff });
    setEditingId(null);
    setViewStaff(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      ...emptyStaff,
      ...item,
    });

    setEditingId(item.id);
    setViewStaff(null);
    setError("");
    setShowForm(true);
  };

  const saveStaff = (event) => {
    event.preventDefault();

    const salary =
      form.salary === ""
        ? ""
        : Number(form.salary);

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
      setStaff((previous) => [
        data,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteStaff = (id) => {
    if (
      !window.confirm(
        "Delete this staff member?"
      )
    ) {
      return;
    }

    setStaff((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    if (viewStaff?.id === id) {
      setViewStaff(null);
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
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matchesSearch &&
        (roleFilter === "All" ||
          item.role === roleFilter)
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
      color: "text-emerald-700",
      bg: "bg-emerald-50",
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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
          Studio Raw / Administration
        </p>

        <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
          Settings & Staff Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage studio information and team members.
        </p>
      </div>

      {/* TABS */}
      <div className="mb-7 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("studio");
            closeForm();
            setViewStaff(null);
          }}
          className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition sm:px-6 sm:text-sm ${
            activeTab === "studio"
              ? "bg-[#10264d] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Building2 size={16} />
          Studio Settings
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("staff")
          }
          className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition sm:px-6 sm:text-sm ${
            activeTab === "staff"
              ? "bg-[#10264d] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users size={16} />
          Staff Management
        </button>
      </div>

      {/* STUDIO SETTINGS */}
      {activeTab === "studio" && (
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-7">
          <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Building2 size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Studio Information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Update your studio business profile
              </p>
            </div>
          </div>

          <form
            onSubmit={saveStudio}
            className="space-y-8"
          >
            {/* BUSINESS INFORMATION */}
            <section>
              <SectionHeading
                icon={Building2}
                title="Business Information"
                description="Studio identity and contact details"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {[
                  ["Studio Name", "name", "text", true],
                  ["Email Address", "email", "email", false],
                  ["Phone Number", "phone", "tel", false],
                  ["WhatsApp Number", "whatsapp", "tel", false],
                ].map(
                  ([label, key, type, required]) => (
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
                          updateStudio(
                            key,
                            event.target.value
                          )
                        }
                        className={inputClass}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </FormField>
                  )
                )}
              </div>
            </section>

            {/* LOCATION */}
            <section>
              <SectionHeading
                icon={MapPin}
                title="Location Information"
                description="Studio address and location"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="City">
                  <input
                    type="text"
                    value={studio.city ?? ""}
                    onChange={(event) =>
                      updateStudio(
                        "city",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="State">
                  <input
                    type="text"
                    value={studio.state ?? ""}
                    onChange={(event) =>
                      updateStudio(
                        "state",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Studio Address">
                    <textarea
                      rows={3}
                      value={studio.address ?? ""}
                      onChange={(event) =>
                        updateStudio(
                          "address",
                          event.target.value
                        )
                      }
                      className={`${inputClass} resize-y`}
                      placeholder="Enter full studio address"
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* BILLING */}
            <section>
              <SectionHeading
                icon={FileText}
                title="Billing Information"
                description="Invoice and business tax details"
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="GST Number">
                  <input
                    type="text"
                    value={studio.gst ?? ""}
                    onChange={(event) =>
                      updateStudio(
                        "gst",
                        event.target.value
                      )
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
                      updateStudio(
                        "currency",
                        value
                      )
                    }
                  />
                </FormField>
              </div>
            </section>

            {/* DESCRIPTION */}
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

            {/* SAVE */}
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {savedMessage ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={18} />
                  Studio settings saved successfully
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Changes are saved when you click Save Settings.
                </p>
              )}

              <button
                type="submit"
                className={`${primaryButton} w-full sm:w-auto`}
              >
                <Save size={17} />
                Save Settings
              </button>
            </div>
          </form>
        </section>
      )}

      {/* STAFF MANAGEMENT */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          {/* STATISTICS */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                stat={stat}
              />
            ))}
          </div>

          {/* STAFF RECORDS */}
          <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#10264d]">
                    Team Members
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Showing {filteredStaff.length} of{" "}
                    {staff.length} team members
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreate}
                  className={`${primaryButton} w-full sm:w-auto`}
                >
                  <Plus size={17} />
                  Add Staff
                </button>
              </div>

              {/* FILTERS */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Search Staff">
                  <div className="relative">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search staff..."
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormField>

                <FormField label="Filter by Role">
                  <CustomDropdown
                    value={roleFilter}
                    options={[
                      {
                        value: "All",
                        label: "All Roles",
                      },
                      ...roles,
                    ]}
                    onChange={setRoleFilter}
                  />
                </FormField>
              </div>
            </div>

            {/* STAFF CARDS */}
            {filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-16 text-center">
                <div className="mb-4 rounded-2xl bg-slate-50 p-5">
                  <Users
                    size={36}
                    className="text-slate-300"
                  />
                </div>

                <h3 className="font-bold text-[#10264d]">
                  No staff members found
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Add a team member or change your filters.
                </p>

                {staff.length === 0 && (
                  <button
                    type="button"
                    onClick={openCreate}
                    className={`${primaryButton} mt-5`}
                  >
                    <Plus size={16} />
                    Add Staff
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-6">
                {filteredStaff.map((item) => (
                  <StaffCard
                    key={item.id}
                    item={item}
                    onView={setViewStaff}
                    onEdit={openEdit}
                    onDelete={deleteStaff}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ADD / EDIT STAFF MODAL */}
      {activeTab === "staff" && showForm && (
        <Modal
          title={
            editingId
              ? "Edit Staff"
              : "Add Staff Member"
          }
          description="Enter team member information"
          icon={Users}
          onClose={closeForm}
        >
          <form
            onSubmit={saveStaff}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-7">
              {/* PERSONAL INFORMATION */}
              <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <SectionHeading
                  icon={UserRound}
                  title="Personal Information"
                  description="Basic contact details"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    label="Full Name"
                    required
                  >
                    <input
                      type="text"
                      required
                      autoFocus
                      value={form.name}
                      onChange={(event) =>
                        updateStaff(
                          "name",
                          event.target.value
                        )
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
                        updateStaff(
                          "phone",
                          event.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="Enter phone number"
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Email Address">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateStaff(
                            "email",
                            event.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Enter email address"
                      />
                    </FormField>
                  </div>
                </div>
              </section>

              {/* EMPLOYMENT */}
              <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <SectionHeading
                  icon={BriefcaseBusiness}
                  title="Employment Details"
                  description="Role, department and salary"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Staff Role">
                    <CustomDropdown
                      value={form.role}
                      options={roles}
                      onChange={(value) =>
                        updateStaff(
                          "role",
                          value
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Department">
                    <CustomDropdown
                      value={form.department}
                      options={departments}
                      onChange={(value) =>
                        updateStaff(
                          "department",
                          value
                        )
                      }
                    />
                  </FormField>

                  <FormField label="Monthly Salary (₹)">
                    <input
                      type="number"
                      min="0"
                      value={form.salary}
                      onChange={(event) =>
                        updateStaff(
                          "salary",
                          event.target.value
                        )
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
                        updateStaff(
                          "status",
                          value
                        )
                      }
                    />
                  </FormField>
                </div>
              </section>

              {/* NOTES */}
              <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <SectionHeading
                  icon={FileText}
                  title="Additional Information"
                  description="Any special notes"
                />

                <FormField label="Notes">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      updateStaff(
                        "notes",
                        event.target.value
                      )
                    }
                    className={`${inputClass} resize-y`}
                    placeholder="Additional staff details..."
                  />
                </FormField>
              </section>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle
                    size={18}
                    className="shrink-0"
                  />
                  {error}
                </div>
              )}
            </div>

            {/* FIXED FOOTER */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeForm}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={primaryButton}
              >
                <Save size={17} />
                {editingId
                  ? "Update Staff"
                  : "Save Staff"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW STAFF MODAL */}
      {activeTab === "staff" &&
        viewStaff &&
        !showForm && (
          <Modal
            title="Staff Details"
            description="Complete team member information"
            icon={UserRound}
            onClose={() => setViewStaff(null)}
            width="max-w-[650px]"
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <UserRound size={23} />
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-lg font-extrabold text-[#10264d]">
                    {viewStaff.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {viewStaff.role}
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                    statusColors[viewStaff.status] ||
                    statusColors.Inactive
                  }`}
                >
                  {viewStaff.status || "Inactive"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailBox
                  icon={Phone}
                  label="Phone Number"
                  value={viewStaff.phone}
                />

                <DetailBox
                  icon={Mail}
                  label="Email Address"
                  value={viewStaff.email}
                />

                <DetailBox
                  icon={BriefcaseBusiness}
                  label="Staff Role"
                  value={viewStaff.role}
                />

                <DetailBox
                  icon={Building2}
                  label="Department"
                  value={viewStaff.department}
                />

                <DetailBox
                  icon={IndianRupee}
                  label="Monthly Salary"
                  value={formatSalary(viewStaff.salary)}
                />

                <DetailBox
                  icon={CalendarDays}
                  label="Joining Date"
                  value={formatDate(viewStaff.joiningDate)}
                />

                <DetailBox
                  icon={ShieldCheck}
                  label="Status"
                  value={viewStaff.status}
                  full
                />

                <DetailBox
                  icon={FileText}
                  label="Notes"
                  value={viewStaff.notes}
                  full
                />
              </div>
            </div>

            {/* VIEW FOOTER */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setViewStaff(null)
                }
                className={secondaryButton}
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  openEdit(viewStaff)
                }
                className={primaryButton}
              >
                <Pencil size={17} />
                Edit Staff
              </button>
            </div>
          </Modal>
        )}
    </div>
  );
}
