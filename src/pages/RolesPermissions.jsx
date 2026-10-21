
import { useEffect, useMemo, useRef, useState } from "react";
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

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readArray(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

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

  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const [error, setError] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    const refreshStaff = () => {
      setStaff(readArray(STAFF_KEY));
    };

    window.addEventListener("focus", refreshStaff);

    return () => {
      window.removeEventListener("focus", refreshStaff);
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

    setForm({
      name: "",
      description: "",
      permissions: ["dashboard"],
    });

    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const openEdit = (role) => {
    if (role.name === "Admin") {
      return;
    }

    setEditingId(role.id);

    setForm({
      name: role.name,
      description: role.description || "",
      permissions: [...(role.permissions || [])],
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
    setForm((previous) => ({
      ...previous,
      permissions: [...allPermissions],
    }));
  };

  const clearAll = () => {
    setForm((previous) => ({
      ...previous,
      permissions: [],
    }));
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

    if (currentRole?.name === "Admin") {
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
    if (role.system) {
      alert("Default system roles cannot be deleted.");
      return;
    }

    const assignedStaff = staff.some(
      (person) =>
        String(person.role || "").toLowerCase() ===
        role.name.toLowerCase()
    );

    if (assignedStaff) {
      alert(
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
    },
    {
      label: "Total Permissions",
      value: modules.length,
      icon: LockKeyhole,
      color: "text-indigo-700",
    },
    {
      label: "Staff Members",
      value: staff.length,
      icon: Users,
      color: "text-green-700",
    },
    {
      label: "Assigned Staff",
      value: totalAssigned,
      icon: CheckCircle2,
      color: "text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
            <ShieldCheck size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold text-[#10264d]">
              Roles & Permissions
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage studio user roles and module access
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
        >
          <Plus size={18} />
          Add New Role
        </button>
      </div>

      {/* Summary Cards */}
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

      {/* Role Management */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex w-full min-w-0 flex-col gap-4">
          <h2 className="break-words text-lg font-bold text-[#10264d]">
            Role Management
          </h2>

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
              placeholder="Search roles..."
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {/* Role Cards */}
        <div className="flex w-full min-w-0 flex-col gap-4">
          {filteredRoles.map((role) => {
            const isAdmin = role.name === "Admin";

            return (
              <article
                key={role.id}
                className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
              >
                <div className="flex w-full min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#10264d]">
                    <ShieldCheck size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-bold text-[#10264d]">
                      {role.name}
                    </h3>

                    <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                      {role.description || "No description"}
                    </p>

                    <span className="mt-3 inline-flex max-w-full rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {role.system
                        ? "Default Role"
                        : "Custom Role"}
                    </span>
                  </div>
                </div>

                {/* Role Details */}
                <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                  <div className="w-full min-w-0 rounded-xl bg-white p-4">
                    <p className="text-xs text-slate-500">
                      Module Access
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#10264d]">
                      {role.permissions?.length || 0}
                    </p>
                  </div>

                  <div className="w-full min-w-0 rounded-xl bg-white p-4">
                    <p className="text-xs text-slate-500">
                      Assigned Staff
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#10264d]">
                      {staffCount(role.name)}
                    </p>
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="flex w-full min-w-0 flex-col gap-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Allowed Modules
                  </p>

                  {(role.permissions || [])
                    .slice(0, 4)
                    .map((permission) => {
                      const module = modules.find(
                        (item) => item.key === permission
                      );

                      return (
                        <div
                          key={permission}
                          className="w-full min-w-0 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700"
                        >
                          <span className="break-words">
                            {module?.label || permission}
                          </span>
                        </div>
                      );
                    })}

                  {(role.permissions?.length || 0) > 4 && (
                    <p className="text-xs font-medium text-slate-500">
                      +{role.permissions.length - 4} more modules
                    </p>
                  )}

                  {(role.permissions?.length || 0) === 0 && (
                    <p className="text-sm text-slate-400">
                      No module permissions assigned.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    disabled={isAdmin}
                    onClick={() => openEdit(role)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Pencil size={17} />
                    Edit Role
                  </button>

                  <button
                    type="button"
                    disabled={role.system}
                    onClick={() => deleteRole(role)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-30"
                    title={
                      role.system
                        ? "Default roles cannot be deleted"
                        : "Delete role"
                    }
                  >
                    <Trash2 size={17} />
                    Delete Role
                  </button>
                </div>
              </article>
            );
          })}

          {filteredRoles.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <ShieldCheck
                size={32}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="text-sm font-medium text-slate-500">
                No roles found.
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
                {editingId ? "Edit Role" : "Add New Role"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Configure role details and module permissions
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close role form"
              className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={saveRole}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Role Name">
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                className={inputClass}
                placeholder="e.g. Senior Photographer"
              />
            </FormField>

            <FormField label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                className={`${inputClass} resize-y`}
                placeholder="Describe this role..."
              />
            </FormField>

            {/* Permission Controls */}
            <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-100 pt-5">
              <h3 className="break-words text-base font-bold text-[#10264d]">
                Module Permissions
              </h3>

              <p className="text-sm text-slate-500">
                Selected: {form.permissions.length} /{" "}
                {modules.length}
              </p>

              <button
                type="button"
                onClick={selectAll}
                className="w-full rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Select All Permissions
              </button>

              <button
                type="button"
                onClick={clearAll}
                className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Clear All Permissions
              </button>
            </div>

            {/* Permission Checkboxes */}
            <div className="flex w-full min-w-0 flex-col gap-3">
              {modules.map((module) => {
                const checked =
                  form.permissions.includes(module.key);

                return (
                  <label
                    key={module.key}
                    className={`flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
                      checked
                        ? "border-blue-200 bg-blue-50 text-[#10264d]"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        togglePermission(module.key)
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#10264d]"
                    />

                    <span className="min-w-0 flex-1 break-words font-medium">
                      {module.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Permission Notice */}
            <div className="flex w-full min-w-0 items-start gap-3 rounded-xl bg-amber-50 p-4">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="min-w-0 break-words text-xs leading-6 text-amber-900">
                These permissions are saved for the frontend
                demo. They do not yet enforce secure login
                access. Real authorization must be implemented
                and validated on the backend.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="break-words rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {/* Form Actions */}
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
                {editingId ? "Update Role" : "Save Role"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
