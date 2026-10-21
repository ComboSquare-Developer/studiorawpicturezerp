
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  Users,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
  Check,
  Settings2,
  Crown,
} from "lucide-react";

const ROLES_KEY = "studioraw_roles";
const STAFF_KEY = "studioraw_staff";

const modules = [
  { key: "dashboard", label: "Dashboard" },
  { key: "enquiries", label: "Enquiries & Leads" },
  { key: "customers", label: "Customers" },
  { key: "bookings", label: "Booking & Calendar" },
  { key: "payments", label: "Payment & Billing" },
  { key: "preshoot", label: "Pre-Shoot Preparation" },
  { key: "photoshoot", label: "Photo Shoot & Data" },
  { key: "photoediting", label: "Photo Selection & Editing" },
  { key: "albumprinting", label: "Album Design & Printing" },
  { key: "delivery", label: "Delivery Management" },
  { key: "followup", label: "Follow-up & CRM" },
  { key: "inventory", label: "Inventory Management" },
  { key: "equipment", label: "Equipment Management" },
  { key: "attendance", label: "Staff Attendance" },
  { key: "expenses", label: "Expense & Profit" },
  { key: "branches", label: "Multi-Branch Management" },
  { key: "reports", label: "Reports & Analytics" },
  { key: "roles", label: "Roles & Permissions" },
  { key: "notifications", label: "Notifications & Reminders" },
  { key: "auditlogs", label: "Audit Logs" },
  { key: "settings", label: "Settings & Staff" },
];

const allPermissions = modules.map((module) => module.key);

const defaultRoles = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Full studio management access",
    permissions: allPermissions,
    system: true,
  },
  {
    id: "role-manager",
    name: "Manager",
    description: "Manage daily studio operations",
    permissions: [
      "dashboard",
      "enquiries",
      "customers",
      "bookings",
      "payments",
      "preshoot",
      "photoshoot",
      "photoediting",
      "albumprinting",
      "delivery",
      "followup",
      "inventory",
      "equipment",
      "attendance",
      "branches",
      "reports",
    ],
    system: true,
  },
  {
    id: "role-photographer",
    name: "Photographer",
    description: "Manage shoots and assigned equipment",
    permissions: [
      "dashboard",
      "bookings",
      "preshoot",
      "photoshoot",
      "equipment",
    ],
    system: true,
  },
  {
    id: "role-editor",
    name: "Editor",
    description: "Photo editing and album processing",
    permissions: [
      "dashboard",
      "photoediting",
      "albumprinting",
    ],
    system: true,
  },
  {
    id: "role-accountant",
    name: "Accountant",
    description: "Manage payments, expenses and reports",
    permissions: [
      "dashboard",
      "payments",
      "expenses",
      "reports",
    ],
    system: true,
  },
  {
    id: "role-staff",
    name: "Staff",
    description: "Basic studio workflow access",
    permissions: [
      "dashboard",
      "customers",
      "bookings",
      "followup",
    ],
    system: true,
  },
];

const emptyForm = () => ({
  name: "",
  description: "",
  permissions: ["dashboard"],
});

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readArray(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) return fallback;

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `ROLE-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
        {/* Fixed Modal Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5ebf3] bg-white px-5 py-5 sm:px-9 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white">
              <ShieldCheck size={23} />
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
            aria-label="Close role form"
            className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Scrollable Modal Content */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fafcff] px-5 py-6 sm:px-9 sm:py-7">
            {children}
          </div>

          {/* Fixed Modal Footer */}
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

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="group min-w-0 rounded-2xl border border-[#e8edf5] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#72819a]">
            {stat.label}
          </p>

          <h3
            className={`mt-3 text-3xl font-bold ${stat.color}`}
          >
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

function RoleCard({
  role,
  assignedCount,
  onEdit,
  onDelete,
}) {
  const isAdmin =
    role.id === "role-admin" || role.name === "Admin";

  const permissions = Array.isArray(role.permissions)
    ? role.permissions
    : [];

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-[#e4eaf3] bg-white p-5 shadow-sm transition duration-300 hover:border-blue-200 hover:shadow-lg sm:p-6">
      {/* Role Header */}
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            isAdmin
              ? "bg-[#112e60] text-white"
              : "bg-[#eef4ff] text-[#174b91]"
          }`}
        >
          {isAdmin ? (
            <Crown size={23} />
          ) : (
            <ShieldCheck size={23} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-lg font-bold text-[#10264d]">
              {role.name}
            </h3>

            {isAdmin && (
              <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                Protected
              </span>
            )}
          </div>

          <p className="mt-2 min-h-[40px] break-words text-sm leading-5 text-[#8190a7]">
            {role.description || "No description"}
          </p>

          <span
            className={`mt-3 inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
              role.system
                ? "bg-blue-50 text-blue-700"
                : "bg-violet-50 text-violet-700"
            }`}
          >
            {role.system ? "Default Role" : "Custom Role"}
          </span>
        </div>
      </div>

      {/* Counts */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
        <div className="min-w-0 rounded-xl bg-[#f7f9fc] p-4">
          <p className="text-xs text-[#8190a7]">
            Module Access
          </p>

          <p className="mt-2 text-2xl font-bold text-[#10264d]">
            {permissions.length}
          </p>
        </div>

        <div className="min-w-0 rounded-xl bg-[#f7f9fc] p-4">
          <p className="text-xs text-[#8190a7]">
            Assigned Staff
          </p>

          <p className="mt-2 text-2xl font-bold text-[#10264d]">
            {assignedCount}
          </p>
        </div>
      </div>

      {/* Allowed Modules */}
      <div className="mt-5 min-w-0 flex-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8190a7]">
          Allowed Modules
        </p>

        <div className="flex flex-wrap gap-2">
          {permissions.slice(0, 5).map((permission) => {
            const module = modules.find(
              (item) => item.key === permission
            );

            return (
              <span
                key={permission}
                className="max-w-full break-words rounded-lg bg-[#edf4ff] px-3 py-2 text-xs font-medium text-[#174b91]"
              >
                {module?.label || permission}
              </span>
            );
          })}

          {permissions.length > 5 && (
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              +{permissions.length - 5} more
            </span>
          )}

          {permissions.length === 0 && (
            <p className="text-sm text-slate-400">
              No module permissions assigned.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
        <button
          type="button"
          disabled={isAdmin}
          onClick={() => onEdit(role)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#112e60] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4384] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Pencil size={17} />
          Edit Role
        </button>

        <button
          type="button"
          disabled={role.system || isAdmin}
          onClick={() => onDelete(role)}
          title={
            role.system
              ? "Default roles cannot be deleted"
              : "Delete role"
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 size={17} />
          Delete Role
        </button>
      </div>
    </article>
  );
}

export default function RolesPermissions() {
  const [roles, setRoles] = useState(() =>
    readArray(ROLES_KEY, defaultRoles)
  );

  const [staff, setStaff] = useState(() =>
    readArray(STAFF_KEY)
  );

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  }, [roles]);

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

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roles.filter((role) =>
      `${role.name} ${role.description || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [roles, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setShowForm(true);
  };

  const openEdit = (role) => {
    if (
      role.id === "role-admin" ||
      role.name === "Admin"
    ) {
      return;
    }

    setEditingId(role.id);

    setForm({
      name: role.name,
      description: role.description || "",
      permissions: Array.isArray(role.permissions)
        ? [...role.permissions]
        : [],
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setError("");
  };

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
  };

  const togglePermission = (key) => {
    setForm((previous) => {
      const exists = previous.permissions.includes(key);

      return {
        ...previous,
        permissions: exists
          ? previous.permissions.filter(
              (item) => item !== key
            )
          : [...previous.permissions, key],
      };
    });
  };

  const selectAll = () => {
    update("permissions", [...allPermissions]);
  };

  const clearAll = () => {
    update("permissions", []);
  };

  const saveRole = (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Role name is required.");
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.id !== editingId &&
        role.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      setError("Role name already exists.");
      return;
    }

    const currentRole = roles.find(
      (role) => role.id === editingId
    );

    if (
      currentRole?.id === "role-admin" ||
      currentRole?.name === "Admin"
    ) {
      setError("Admin role cannot be edited.");
      return;
    }

    const record = {
      id: editingId || createId(),
      name,
      description: form.description.trim(),
      permissions: [...new Set(form.permissions)],
      system: currentRole?.system || false,
    };

    if (editingId) {
      setRoles((previous) =>
        previous.map((role) =>
          role.id === editingId ? record : role
        )
      );
    } else {
      setRoles((previous) => [...previous, record]);
    }

    closeForm();
  };

  const deleteRole = (role) => {
    if (role.system || role.name === "Admin") {
      window.alert("Default system roles cannot be deleted.");
      return;
    }

    const currentStaff = readArray(STAFF_KEY);

    setStaff(currentStaff);

    const assignedStaff = currentStaff.some(
      (person) =>
        String(person.role || "").toLowerCase() ===
        role.name.toLowerCase()
    );

    if (assignedStaff) {
      window.alert(
        "This role is assigned to staff. Reassign them before deleting."
      );
      return;
    }

    if (!window.confirm(`Delete ${role.name} role?`)) {
      return;
    }

    setRoles((previous) =>
      previous.filter((item) => item.id !== role.id)
    );
  };

  const staffCount = (roleName) =>
    staff.filter(
      (person) =>
        String(person.role || "").toLowerCase() ===
        roleName.toLowerCase()
    ).length;

  const totalAssigned = staff.filter((person) =>
    roles.some(
      (role) =>
        role.name.toLowerCase() ===
        String(person.role || "").toLowerCase()
    )
  ).length;

  const stats = [
    {
      label: "Total Roles",
      value: roles.length,
      icon: ShieldCheck,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Total Permissions",
      value: modules.length,
      icon: LockKeyhole,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      label: "Staff Members",
      value: staff.length,
      icon: Users,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Assigned Staff",
      value: totalAssigned,
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-[#f7f9fc] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white shadow-sm">
            <ShieldCheck size={24} />
          </div>

          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl">
              Roles & Permissions
            </h1>

            <p className="mt-1 text-sm leading-6 text-[#8190a7]">
              Manage studio user roles and module access
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384] sm:w-auto"
        >
          <Plus size={18} />
          Add New Role
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Role Management */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e7edf6] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-[#10264d]">
              Role Management
            </h2>

            <p className="mt-1 text-sm text-[#8190a7]">
              Configure roles and control module permissions
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search roles..."
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {filteredRoles.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <ShieldCheck
              size={40}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm font-medium text-slate-500">
              No roles found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
            {filteredRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                assignedCount={staffCount(role.name)}
                onEdit={openEdit}
                onDelete={deleteRole}
              />
            ))}
          </div>
        )}
      </section>

      {/* Center Popup */}
      {showForm && (
        <ModalShell
          title={editingId ? "Edit Role" : "Add New Role"}
          description="Configure role details and module permissions"
          onClose={closeForm}
          onSubmit={saveRole}
          submitLabel={editingId ? "Update Role" : "Save Role"}
        >
          <div className="space-y-8">
            {/* Role Information */}
            <section>
              <SectionHeading
                icon={ShieldCheck}
                title="Role Information"
                description="Enter the role name and description"
              />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Role Name" required>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.name}
                    onChange={(event) =>
                      update("name", event.target.value)
                    }
                    placeholder="e.g. Senior Photographer"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                    placeholder="Describe this role..."
                    className={`${inputClass} resize-y`}
                  />
                </FormField>
              </div>
            </section>

            {/* Module Permissions */}
            <section>
              <SectionHeading
                icon={Settings2}
                title="Module Permissions"
                description="Select which modules this role can access"
              />

              <div className="rounded-2xl border border-[#dbe4f0] bg-white p-4 sm:p-6">
                {/* Permission Toolbar */}
                <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#10264d]">
                      Access Permissions
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {form.permissions.length} of{" "}
                      {modules.length} modules selected
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearAll}
                      className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Permission Progress */}
                <div className="mb-6 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#112e60] transition-all duration-300"
                    style={{
                      width: `${
                        (form.permissions.length /
                          modules.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                {/* Permission Checkboxes */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {modules.map((module) => {
                    const checked =
                      form.permissions.includes(module.key);

                    return (
                      <label
                        key={module.key}
                        className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                          checked
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            togglePermission(module.key)
                          }
                          className="peer sr-only"
                        />

                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            checked
                              ? "border-blue-700 bg-blue-700 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {checked && <Check size={14} />}
                        </span>

                        <span className="min-w-0 break-words text-sm font-medium text-[#29416a]">
                          {module.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Notice */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="min-w-0 break-words text-xs leading-6 text-amber-900">
                Permissions are saved in browser localStorage
                for this frontend demo. They do not enforce
                secure login or backend authorization.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
