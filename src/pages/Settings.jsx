
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
  ChevronDown,
  Eye,
  ShieldCheck,
} from "lucide-react";

const STAFF_KEY = "studioraw_staff";
const STUDIO_KEY = "studioraw_studio_settings";
const SEED_KEY = "studioraw_staff_demo_seeded_v2";

const DEMO_STAFF = [
  {
    id: "demo-01",
    name: "Arun Kumar",
    phone: "9000001001",
    email: "arun.demo@example.com",
    role: "Photographer",
    department: "Production",
    salary: 28000,
    joiningDate: "2025-06-12",
    status: "Active",
    notes: "Wedding and outdoor photography",
  },
  {
    id: "demo-02",
    name: "Priya Devi",
    phone: "9000001002",
    email: "priya.demo@example.com",
    role: "Photo Editor",
    department: "Editing",
    salary: 26000,
    joiningDate: "2025-08-05",
    status: "Active",
    notes: "Photo editing and retouching",
  },
  {
    id: "demo-03",
    name: "Karthik Raj",
    phone: "9000001003",
    email: "karthik.demo@example.com",
    role: "Videographer",
    department: "Production",
    salary: 32000,
    joiningDate: "2024-11-18",
    status: "Active",
    notes: "Wedding cinematography",
  },
  {
    id: "demo-04",
    name: "Divya S",
    phone: "9000001004",
    email: "divya.demo@example.com",
    role: "Album Designer",
    department: "Design",
    salary: 24000,
    joiningDate: "2025-02-10",
    status: "On Leave",
    notes: "Wedding album design",
  },
  {
    id: "demo-05",
    name: "Vijay Anand",
    phone: "9000001005",
    email: "vijay.demo@example.com",
    role: "Studio Manager",
    department: "Administration",
    salary: 45000,
    joiningDate: "2023-07-01",
    status: "Active",
    notes: "Studio operations management",
  },
  {
    id: "demo-06",
    name: "Meena R",
    phone: "9000001006",
    email: "meena.demo@example.com",
    role: "Sales Executive",
    department: "Sales",
    salary: 23000,
    joiningDate: "2025-09-22",
    status: "Active",
    notes: "Customer bookings and enquiries",
  },
  {
    id: "demo-07",
    name: "Sanjay Kumar",
    phone: "9000001007",
    email: "sanjay.demo@example.com",
    role: "Candid Photographer",
    department: "Production",
    salary: 30000,
    joiningDate: "2025-01-15",
    status: "Active",
    notes: "Candid wedding photography",
  },
  {
    id: "demo-08",
    name: "Nithya P",
    phone: "9000001008",
    email: "nithya.demo@example.com",
    role: "Video Editor",
    department: "Editing",
    salary: 27500,
    joiningDate: "2025-04-09",
    status: "Active",
    notes: "Video editing and colour grading",
  },
  {
    id: "demo-09",
    name: "Rahul M",
    phone: "9000001009",
    email: "rahul.demo@example.com",
    role: "Delivery Staff",
    department: "Delivery",
    salary: 18000,
    joiningDate: "2026-01-20",
    status: "Inactive",
    notes: "Album and product delivery",
  },
  {
    id: "demo-10",
    name: "Anitha S",
    phone: "9000001010",
    email: "anitha.demo@example.com",
    role: "Photographer",
    department: "Production",
    salary: 29000,
    joiningDate: "2025-10-03",
    status: "Active",
    notes: "Portrait and baby photography",
  },
];

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
  "Administration",
  "Sales",
  "Delivery",
  "Other",
];

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

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon: Icon,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-bold text-[#334b70]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c9ab0]"
          />
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || label}
          required={required}
          className={`w-full min-w-0 rounded-xl border border-[#e0e7f1] bg-white py-3 pr-3 text-sm text-[#10264d] outline-none transition focus:border-[#244d8b] focus:ring-2 focus:ring-blue-100 ${
            Icon ? "pl-10" : "pl-3"
          }`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-bold text-[#334b70]">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#e0e7f1] bg-white px-3 py-3 pr-10 text-sm text-[#10264d] outline-none focus:border-[#244d8b] focus:ring-2 focus:ring-blue-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-blue-50 text-blue-700 border-blue-100",
    Inactive: "bg-slate-100 text-slate-600 border-slate-200",
    "On Leave": "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || styles.Inactive
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#e4eaf3] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#8190a7]">{title}</p>
          <h3 className="mt-3 text-2xl font-extrabold text-[#10264d]">
            {value}
          </h3>
        </div>

        <div className="rounded-xl bg-[#edf3fc] p-3 text-[#244d8b]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children, width = "max-w-3xl" }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07172b]/65 p-3 backdrop-blur-sm sm:p-5">
      <div
        role="presentation"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[95vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e8edf5] px-5 py-5 sm:px-7">
          <div>
            <h2 className="text-lg font-extrabold text-[#10264d]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-[#8a98ab]">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#f0f4fa] p-2.5 text-[#10264d] transition hover:bg-[#e4ecf7]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("studio");

  const [studio, setStudio] = useState(() => ({
    ...initialStudio,
    ...readStored(STUDIO_KEY, {}),
  }));

  const [staff, setStaff] = useState(() => {
    const saved = readStored(STAFF_KEY, null);

    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }

    if (localStorage.getItem(SEED_KEY) === "true") {
      return Array.isArray(saved) ? saved : [];
    }

    localStorage.setItem(SEED_KEY, "true");
    return DEMO_STAFF.map((item) => ({ ...item }));
  });

  const [form, setForm] = useState({ ...emptyStaff });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);
  const [deleteStaff, setDeleteStaff] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STAFF_KEY, JSON.stringify(staff));
  }, [staff]);

  const updateStudio = (key, value) => {
    setStudio((previous) => ({ ...previous, [key]: value }));
  };

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  function showMessage(message) {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(""), 3000);
  }

  function saveStudio(event) {
    event.preventDefault();
    localStorage.setItem(STUDIO_KEY, JSON.stringify(studio));
    showMessage("Studio settings saved successfully");
  }

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyStaff });
    setError("");
    setShowForm(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setForm({ ...emptyStaff, ...item });
    setError("");
    setShowForm(true);
  }

  function saveStaff(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Staff name is required");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    const duplicate = staff.some(
      (item) =>
        item.id !== editingId &&
        String(item.phone).trim() === form.phone.trim()
    );

    if (duplicate) {
      setError("This phone number is already registered");
      return;
    }

    const record = {
      ...form,
      id:
        editingId ||
        (window.crypto?.randomUUID?.() ||
          `staff-${Date.now()}`),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      salary: Number(form.salary) || 0,
    };

    if (editingId) {
      setStaff((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );
      showMessage("Staff updated successfully");
    } else {
      setStaff((previous) => [record, ...previous]);
      showMessage("Staff added successfully");
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyStaff });
  }

  function confirmDelete() {
    if (!deleteStaff) return;

    setStaff((previous) =>
      previous.filter((item) => item.id !== deleteStaff.id)
    );

    setDeleteStaff(null);
    showMessage("Staff deleted successfully");
  }

  const filteredStaff = useMemo(() => {
    const query = search.toLowerCase().trim();

    return staff.filter((item) => {
      const matchesSearch = [
        item.name,
        item.phone,
        item.email,
        item.role,
        item.department,
      ]
        .some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      const matchesRole =
        roleFilter === "All" || item.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [staff, search, roleFilter]);

  const activeCount = staff.filter(
    (item) => item.status === "Active"
  ).length;

  const inactiveCount = staff.filter(
    (item) => item.status === "Inactive"
  ).length;

  const onLeaveCount = staff.filter(
    (item) => item.status === "On Leave"
  ).length;

  const totalSalary = staff.reduce(
    (sum, item) => sum + (Number(item.salary) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-2 text-[#10264d] sm:p-4 lg:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8b9bb1]">
            <SettingsIcon size={15} />
            Studio Administration
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-[#8290a5]">
            Manage studio information and team members
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#e3eaf4] bg-white px-4 py-3 text-xs font-semibold text-[#244d8b]">
          <ShieldCheck size={17} />
          Studio Raw Picturez ERP
        </div>
      </div>

      {savedMessage && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#244d8b]">
          <CheckCircle2 size={19} />
          {savedMessage}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-[#e5eaf3] bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("studio")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
            activeTab === "studio"
              ? "bg-[#10264d] text-white shadow-md"
              : "text-[#65758d] hover:bg-[#f0f4fa]"
          }`}
        >
          <Building2 size={18} />
          Studio Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
            activeTab === "staff"
              ? "bg-[#10264d] text-white shadow-md"
              : "text-[#65758d] hover:bg-[#f0f4fa]"
          }`}
        >
          <Users size={18} />
          Team Members
          <span
            className={`rounded-lg px-2 py-0.5 text-xs ${
              activeTab === "staff"
                ? "bg-white/20 text-white"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {staff.length}
          </span>
        </button>
      </div>

      {activeTab === "studio" && (
        <form onSubmit={saveStudio}>
          <div className="overflow-hidden rounded-2xl border border-[#e4eaf3] bg-white shadow-sm">
            <div className="border-b border-[#e8edf5] bg-gradient-to-r from-[#10264d] to-[#244d8b] px-6 py-6 text-white sm:px-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-3">
                  <Building2 size={23} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold">
                    Studio Information
                  </h2>
                  <p className="mt-1 text-xs text-blue-100">
                    Manage your studio profile and business details
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-8">
              <Field
                label="Studio Name"
                value={studio.name}
                onChange={(value) => updateStudio("name", value)}
                icon={Building2}
                required
              />

              <Field
                label="Email Address"
                value={studio.email}
                onChange={(value) => updateStudio("email", value)}
                icon={Mail}
                type="email"
              />

              <Field
                label="Phone Number"
                value={studio.phone}
                onChange={(value) => updateStudio("phone", value)}
                icon={Phone}
              />

              <Field
                label="WhatsApp Number"
                value={studio.whatsapp}
                onChange={(value) => updateStudio("whatsapp", value)}
                icon={Phone}
              />

              <div className="sm:col-span-2">
                <Field
                  label="Studio Address"
                  value={studio.address}
                  onChange={(value) => updateStudio("address", value)}
                  icon={MapPin}
                />
              </div>

              <Field
                label="City"
                value={studio.city}
                onChange={(value) => updateStudio("city", value)}
              />

              <Field
                label="State"
                value={studio.state}
                onChange={(value) => updateStudio("state", value)}
              />

              <Field
                label="GST Number"
                value={studio.gst}
                onChange={(value) => updateStudio("gst", value)}
              />

              <Field
                label="Invoice Prefix"
                value={studio.invoicePrefix}
                onChange={(value) =>
                  updateStudio("invoicePrefix", value)
                }
              />

              <SelectField
                label="Currency"
                value={studio.currency}
                onChange={(value) => updateStudio("currency", value)}
                options={["INR", "USD", "EUR"]}
              />

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold text-[#334b70]">
                  Studio Description
                </label>

                <textarea
                  rows={4}
                  value={studio.description}
                  onChange={(e) =>
                    updateStudio("description", e.target.value)
                  }
                  placeholder="Enter studio description"
                  className="w-full resize-none rounded-xl border border-[#e0e7f1] bg-white p-4 text-sm text-[#10264d] outline-none focus:border-[#244d8b] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e8edf5] bg-[#fafcff] px-6 py-5 sm:px-8">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#244d8b]"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === "staff" && (
        <div>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Staff"
              value={staff.length}
              icon={Users}
            />
            <StatCard
              title="Active Staff"
              value={activeCount}
              icon={CheckCircle2}
            />
            <StatCard
              title="On Leave"
              value={onLeaveCount}
              icon={Clock3}
            />
            <StatCard
              title="Monthly Salary"
              value={money(totalSalary)}
              icon={IndianRupee}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e4eaf3] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#e8edf5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#10264d]">
                  <Users size={21} />
                  Team Members
                </h2>

                <p className="mt-1 text-xs text-[#8a98ab]">
                  Manage photographers, editors and studio employees
                </p>
              </div>

              <button
                type="button"
                onClick={openAdd}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#244d8b]"
              >
                <Plus size={18} />
                Add Staff
              </button>
            </div>

            <div className="flex flex-col gap-3 border-b border-[#e8edf5] p-5 sm:flex-row sm:p-6">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, phone, role or department..."
                  className="w-full rounded-xl border border-[#e1e7f0] bg-[#fafcff] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#244d8b]"
                />
              </div>

              <div className="relative sm:w-56">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#e1e7f0] bg-[#fafcff] px-4 py-3 pr-10 text-sm text-[#10264d] outline-none focus:border-[#244d8b]"
                >
                  <option value="All">All Roles</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 rounded-2xl bg-blue-50 p-5 text-[#244d8b]">
                  <Users size={32} />
                </div>

                <h3 className="text-base font-bold text-[#10264d]">
                  No staff found
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Try another search or add a new team member
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
                {filteredStaff.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl border border-[#e5ebf4] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#b9cce7] hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10264d] to-[#28548b] text-lg font-extrabold text-white">
                          {String(item.name || "S")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-extrabold text-[#10264d]">
                            {item.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-[#8a98ab]">
                            {item.role}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={item.status} />
                    </div>

                    <div className="mt-5 space-y-3 border-t border-[#edf1f7] pt-4">
                      <div className="flex items-center gap-3 text-xs text-[#62748e]">
                        <Phone size={15} className="shrink-0" />
                        <span>{item.phone || "—"}</span>
                      </div>

                      <div className="flex min-w-0 items-center gap-3 text-xs text-[#62748e]">
                        <Mail size={15} className="shrink-0" />
                        <span className="truncate">
                          {item.email || "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#62748e]">
                        <BriefcaseBusiness size={15} />
                        <span>{item.department || "—"}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#62748e]">
                        <CalendarDays size={15} />
                        <span>{formatDate(item.joiningDate)}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-[#f4f7fc] px-4 py-3">
                        <span className="text-xs font-semibold text-[#8a98ab]">
                          Monthly Salary
                        </span>

                        <span className="text-sm font-extrabold text-[#10264d]">
                          {money(item.salary)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#edf1f7] pt-4">
                      <button
                        type="button"
                        onClick={() => setViewStaff(item)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f1f5fb] px-2 py-2.5 text-xs font-bold text-[#244d8b] hover:bg-blue-100"
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f1f5fb] px-2 py-2.5 text-xs font-bold text-[#244d8b] hover:bg-blue-100"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteStaff(item)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-[#e3e8f0] px-2 py-2.5 text-xs font-bold text-[#53647d] hover:bg-[#f1f5fb]"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[#edf1f7] px-6 py-4 text-xs text-[#8a98ab]">
              Showing {filteredStaff.length} of {staff.length} team members
              {inactiveCount > 0 && ` · ${inactiveCount} inactive`}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <Modal
          title={editingId ? "Edit Staff Member" : "Add Staff Member"}
          subtitle="Enter team member details"
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={saveStaff}>
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={form.name}
                onChange={(value) => updateForm("name", value)}
                icon={UserRound}
                required
              />

              <Field
                label="Phone Number"
                value={form.phone}
                onChange={(value) => updateForm("phone", value)}
                icon={Phone}
                required
              />

              <div className="sm:col-span-2">
                <Field
                  label="Email Address"
                  value={form.email}
                  onChange={(value) => updateForm("email", value)}
                  type="email"
                  icon={Mail}
                />
              </div>

              <SelectField
                label="Role"
                value={form.role}
                onChange={(value) => updateForm("role", value)}
                options={roles}
              />

              <SelectField
                label="Department"
                value={form.department}
                onChange={(value) => updateForm("department", value)}
                options={departments}
              />

              <Field
                label="Monthly Salary"
                value={form.salary}
                onChange={(value) => updateForm("salary", value)}
                type="number"
                icon={IndianRupee}
              />

              <Field
                label="Joining Date"
                value={form.joiningDate}
                onChange={(value) => updateForm("joiningDate", value)}
                type="date"
                icon={CalendarDays}
              />

              <div className="sm:col-span-2">
                <SelectField
                  label="Staff Status"
                  value={form.status}
                  onChange={(value) => updateForm("status", value)}
                  options={["Active", "On Leave", "Inactive"]}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold text-[#334b70]">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Additional staff information..."
                  className="w-full resize-none rounded-xl border border-[#e0e7f1] p-4 text-sm text-[#10264d] outline-none focus:border-[#244d8b]"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-[#edf1f7] pt-5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#e1e7f0] px-5 py-3 text-sm font-semibold text-[#52647f] hover:bg-[#f5f7fb]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white hover:bg-[#244d8b]"
              >
                <Save size={17} />
                {editingId ? "Update Staff" : "Save Staff"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewStaff && (
        <Modal
          title="Staff Details"
          subtitle="Team member information"
          onClose={() => setViewStaff(null)}
          width="max-w-xl"
        >
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-[#f3f7fc] p-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10264d] text-2xl font-extrabold text-white">
              {String(viewStaff.name || "S").charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-[#10264d]">
                {viewStaff.name}
              </h3>
              <p className="mt-1 text-sm text-[#8190a6]">
                {viewStaff.role}
              </p>
              <div className="mt-2">
                <StatusBadge status={viewStaff.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["Phone Number", viewStaff.phone],
              ["Email Address", viewStaff.email],
              ["Role", viewStaff.role],
              ["Department", viewStaff.department],
              ["Monthly Salary", money(viewStaff.salary)],
              ["Joining Date", formatDate(viewStaff.joiningDate)],
              ["Status", viewStaff.status],
              ["Notes", viewStaff.notes],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[#e7edf5] bg-white p-4"
              >
                <p className="text-xs text-[#8a98ab]">{label}</p>
                <p className="mt-2 break-words text-sm font-bold text-[#10264d]">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setViewStaff(null)}
              className="rounded-xl border border-[#e1e7f0] px-5 py-3 text-sm font-semibold text-[#52647f]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                const item = viewStaff;
                setViewStaff(null);
                openEdit(item);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-bold text-white"
            >
              <Pencil size={16} />
              Edit Staff
            </button>
          </div>
        </Modal>
      )}

      {deleteStaff && (
        <Modal
          title="Delete Staff Member"
          subtitle="Please confirm this action"
          onClose={() => setDeleteStaff(null)}
          width="max-w-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-2xl bg-[#edf3fc] p-5 text-[#244d8b]">
              <Trash2 size={28} />
            </div>

            <h3 className="text-lg font-extrabold text-[#10264d]">
              Delete {deleteStaff.name}?
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#8290a5]">
              This staff record will be removed from the saved team
              members list. This action cannot be undone.
            </p>
          </div>

          <div className="mt-7 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setDeleteStaff(null)}
              className="rounded-xl border border-[#e1e7f0] px-6 py-3 text-sm font-semibold text-[#52647f]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={confirmDelete}
              className="flex items-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white hover:bg-[#244d8b]"
            >
              <Trash2 size={16} />
              Delete Staff
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
