
import { useEffect, useMemo, useRef, useState } from "react";
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
  ChevronDown,
  Check,
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

const staffStatuses = [
  "Active",
  "On Leave",
  "Inactive",
];

const statusColors = {
  Active: "bg-green-100 text-green-700",
  "On Leave": "bg-amber-100 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700";

const primaryButton =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950";

const secondaryButton =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
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

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const items = options.map((option) =>
    typeof option === "string"
      ? {
          value: option,
          label: option,
        }
      : option
  );

  const selected = items.find(
    (item) =>
      String(item.value) === String(value)
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
        onClick={() =>
          setOpen((previous) => !previous)
        }
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-[#10264d] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          {items.map((item) => {
            const isSelected =
              String(item.value) === String(value);

            return (
              <button
                key={String(item.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {item.label}
                </span>

                {isSelected && (
                  <Check
                    size={16}
                    className="shrink-0"
                  />
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
      <label className={labelClass}>
        {label}
      </label>

      {children}
    </div>
  );
}

function StaffDetail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="w-full min-w-0 rounded-xl bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-lg bg-blue-50 p-2 text-[#10264d]">
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">
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

export default function Settings() {
  const [activeTab, setActiveTab] =
    useState("studio");

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

    return Array.isArray(saved)
      ? saved
      : [];
  });

  const [form, setForm] = useState({
    ...emptyStaff,
  });

  const [editingId, setEditingId] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("All");

  const [savedMessage, setSavedMessage] =
    useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STAFF_KEY,
      JSON.stringify(staff)
    );
  }, [staff]);

  useEffect(() => {
    if (showForm && activeTab === "staff") {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showForm, activeTab]);

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
  };

  const openCreate = () => {
    setForm({ ...emptyStaff });
    setEditingId(null);
    setShowForm(true);

    if (showForm) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const openEdit = (item) => {
    setForm({
      ...emptyStaff,
      ...item,
    });

    setEditingId(item.id);
    setShowForm(true);

    if (showForm) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyStaff });
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
      alert("Enter a valid salary.");
      return;
    }

    const data = {
      ...form,
      name: form.name.trim(),
      id: editingId || crypto.randomUUID(),
      salary,
    };

    if (!data.name) {
      alert("Staff name is required.");
      return;
    }

    if (editingId) {
      setStaff((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? data
            : item
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
      window.confirm(
        "Delete this staff member?"
      )
    ) {
      setStaff((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );
    }
  };

  const filteredStaff = useMemo(() => {
    const query =
      search.trim().toLowerCase();

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

      const matchesRole =
        roleFilter === "All" ||
        item.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [staff, search, roleFilter]);

  const stats = [
    {
      label: "Total Staff",
      value: staff.length,
      color: "text-blue-700",
      icon: Users,
    },
    {
      label: "Active Staff",
      value: staff.filter(
        (item) =>
          item.status === "Active"
      ).length,
      color: "text-green-700",
      icon: CheckCircle2,
    },
    {
      label: "On Leave",
      value: staff.filter(
        (item) =>
          item.status === "On Leave"
      ).length,
      color: "text-amber-600",
      icon: UserRound,
    },
    {
      label: "Departments",
      value: new Set(
        staff.map(
          (item) => item.department
        )
      ).size,
      color: "text-indigo-700",
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* Header */}
      <div className="flex min-w-0 items-start gap-3">
        <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
          <SettingsIcon size={24} />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="break-words text-2xl font-bold text-[#10264d]">
            Settings & Staff Management
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage studio information and team members
          </p>
        </div>
      </div>

      {/* Vertical Tabs */}
      <div className="flex w-full min-w-0 flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("studio");
            closeForm();
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
            activeTab === "studio"
              ? "bg-[#10264d] text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          <Building2 size={18} />
          Studio Settings
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab("staff")
          }
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
            activeTab === "staff"
              ? "bg-[#10264d] text-white"
              : "border border-slate-200 bg-white text-slate-600"
          }`}
        >
          <Users size={18} />
          Staff Management
        </button>
      </div>

      {/* Studio Settings */}
      {activeTab === "studio" && (
        <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex min-w-0 items-start gap-3 border-b border-slate-100 pb-5">
            <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
              <Building2 size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-lg font-bold text-[#10264d]">
                Studio Information
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Update your studio business profile
              </p>
            </div>
          </div>

          <form
            onSubmit={saveStudio}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            {[
              ["Studio Name", "name", "text", true],
              ["Email Address", "email", "email", false],
              ["Phone Number", "phone", "tel", false],
              ["WhatsApp Number", "whatsapp", "tel", false],
              ["City", "city", "text", false],
              ["State", "state", "text", false],
              ["GST Number", "gst", "text", false],
              [
                "Invoice Prefix",
                "invoicePrefix",
                "text",
                false,
              ],
            ].map(
              ([label, key, type, required]) => (
                <FormField
                  key={key}
                  label={label}
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

            <div className="flex w-full min-w-0 flex-col gap-4 border-t border-slate-100 pt-5">
              {savedMessage ? (
                <div className="flex min-w-0 items-start gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <span className="min-w-0 break-words">
                    Studio settings saved successfully
                  </span>
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-400">
                  Changes are saved when you click Save Settings.
                </p>
              )}

              <button
                type="submit"
                className={primaryButton}
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
        <div className="flex w-full min-w-0 flex-col gap-6">
          {/* Staff Stats */}
          <div className="flex w-full min-w-0 flex-col gap-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 text-sm font-medium text-slate-500">
                      {item.label}
                    </p>

                    <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                      <Icon
                        size={22}
                        className={item.color}
                      />
                    </div>
                  </div>

                  <h2
                    className={`mt-3 break-words text-3xl font-bold ${item.color}`}
                  >
                    {item.value}
                  </h2>
                </div>
              );
            })}
          </div>

          {/* Staff List */}
          <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex w-full min-w-0 flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Team Members
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Manage photographers, editors and studio staff
                </p>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className={primaryButton}
              >
                <Plus size={18} />
                Add Staff
              </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex w-full min-w-0 flex-col gap-4">
              <FormField label="Search Staff">
                <div className="relative w-full min-w-0">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search staff..."
                    className={`${inputClass} pl-11`}
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

            {/* Vertical Staff Cards */}
            <div className="flex w-full min-w-0 flex-col gap-4">
              {filteredStaff.map((item) => (
                <article
                  key={item.id}
                  className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
                      <UserRound size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-lg font-bold text-[#10264d]">
                        {item.name}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {item.role}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColors[item.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
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
                        item.salary === null ||
                        item.salary === undefined
                          ? "Salary not set"
                          : `₹${Number(
                              item.salary
                            ).toLocaleString("en-IN")}`
                      }
                    />

                    <StaffDetail
                      icon={CalendarDaysIcon}
                      label="Joining Date"
                      value={item.joiningDate}
                    />

                    {item.notes && (
                      <div className="w-full min-w-0 rounded-xl bg-white p-4">
                        <p className="text-xs text-slate-500">
                          Notes
                        </p>

                        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        openEdit(item)
                      }
                      className={primaryButton}
                    >
                      <Pencil size={17} />
                      Edit Staff
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteStaff(item.id)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={17} />
                      Delete Staff
                    </button>
                  </div>
                </article>
              ))}

              {filteredStaff.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
                  <Users
                    size={42}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="text-sm text-slate-400">
                    No staff members found
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Inline Add / Edit Staff */}
          {showForm && (
            <section
              ref={formRef}
              className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="mb-6 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-xl font-bold text-[#10264d]">
                    {editingId
                      ? "Edit Staff"
                      : "Add Staff Member"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Enter team member information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close staff form"
                  className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={saveStaff}
                className="flex w-full min-w-0 flex-col gap-5"
              >
                {[
                  ["Full Name", "name", "text", true],
                  [
                    "Phone Number",
                    "phone",
                    "tel",
                    false,
                  ],
                  [
                    "Email Address",
                    "email",
                    "email",
                    false,
                  ],
                ].map(
                  ([label, key, type, required]) => (
                    <FormField
                      key={key}
                      label={label}
                    >
                      <input
                        type={type}
                        required={required}
                        value={form[key] ?? ""}
                        onChange={(event) =>
                          updateStaff(
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
                    placeholder="Enter salary"
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

                <FormField label="Notes">
                  <textarea
                    rows={3}
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

                <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-100 pt-5">
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
                    <Save size={18} />
                    {editingId
                      ? "Update Staff"
                      : "Save Staff"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function CalendarDaysIcon({ size = 17 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
