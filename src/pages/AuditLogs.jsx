
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Search,
  Download,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  RefreshCw,
  X,
  Save,
  UserRound,
  ChevronDown,
  Check,
} from "lucide-react";

const STORAGE_KEY = "studioraw_audit_logs";

const modules = [
  "Dashboard",
  "Enquiries & Leads",
  "Customers",
  "Booking & Calendar",
  "Payment & Billing",
  "Pre-Shoot Preparation",
  "Photo Shoot & Data",
  "Photo Selection & Editing",
  "Album Design & Printing",
  "Delivery Management",
  "Follow-up & CRM",
  "Inventory Management",
  "Equipment Management",
  "Staff Attendance",
  "Expense & Profit",
  "Multi-Branch Management",
  "Reports & Analytics",
  "Roles & Permissions",
  "Notifications & Reminders",
  "Settings & Staff",
  "Authentication",
  "Other",
];

const actions = [
  "Created",
  "Updated",
  "Deleted",
  "Viewed",
  "Login",
  "Logout",
  "Exported",
  "Other",
];

const emptyForm = {
  user: "",
  module: "Other",
  action: "Created",
  description: "",
  recordId: "",
};

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700";

const primaryButton =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950";

const secondaryButton =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

const actionColors = {
  Created: "bg-green-100 text-green-700",
  Updated: "bg-blue-100 text-blue-700",
  Deleted: "bg-red-100 text-red-700",
  Viewed: "bg-slate-100 text-slate-700",
  Login: "bg-indigo-100 text-indigo-700",
  Logout: "bg-amber-100 text-amber-700",
  Exported: "bg-purple-100 text-purple-700",
  Other: "bg-slate-100 text-slate-600",
};

function readLogs() {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function localDate() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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
      ? { value: option, label: option }
      : option
  );

  const selected = items.find(
    (item) => item.value === value
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
              item.value === value;

            return (
              <button
                key={item.value}
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

function DetailField({ label, value }) {
  return (
    <div className="w-full min-w-0 rounded-xl bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
        {value || "-"}
      </p>
    </div>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState(readLogs);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] =
    useState("All");
  const [actionFilter, setActionFilter] =
    useState("All");
  const [dateFilter, setDateFilter] =
    useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ...emptyForm,
  });

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(logs)
    );
  }, [logs]);

  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showForm]);

  const refreshLogs = () => {
    setLogs(readLogs());
  };

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs
      .filter((log) => {
        const matchesSearch = [
          log.user,
          log.module,
          log.action,
          log.description,
          log.recordId,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );

        const matchesModule =
          moduleFilter === "All" ||
          log.module === moduleFilter;

        const matchesAction =
          actionFilter === "All" ||
          log.action === actionFilter;

        const matchesDate =
          !dateFilter ||
          String(log.timestamp || "").slice(0, 10) ===
            dateFilter;

        return (
          matchesSearch &&
          matchesModule &&
          matchesAction &&
          matchesDate
        );
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );
  }, [
    logs,
    search,
    moduleFilter,
    actionFilter,
    dateFilter,
  ]);

  const openAdd = () => {
    setForm({ ...emptyForm });
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
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveLog = (event) => {
    event.preventDefault();

    if (
      !form.user.trim() ||
      !form.description.trim()
    ) {
      alert(
        "User and description are required."
      );
      return;
    }

    const record = {
      id: crypto.randomUUID(),
      user: form.user.trim(),
      module: form.module,
      action: form.action,
      description: form.description.trim(),
      recordId: form.recordId.trim(),
      timestamp: new Date().toISOString(),
      source: "Manual",
    };

    setLogs((previous) => [
      record,
      ...previous,
    ]);

    closeForm();
  };

  const deleteLog = (log) => {
    if (log.source !== "Manual") {
      return;
    }

    if (
      !window.confirm(
        "Delete this demo activity record?"
      )
    ) {
      return;
    }

    setLogs((previous) =>
      previous.filter(
        (item) => item.id !== log.id
      )
    );
  };

  const exportCSV = () => {
    const rows = [
      [
        "Timestamp",
        "User",
        "Module",
        "Action",
        "Description",
        "Record ID",
        "Source",
      ],
      ...filteredLogs.map((log) => [
        formatDateTime(log.timestamp),
        log.user,
        log.module,
        log.action,
        log.description,
        log.recordId,
        log.source,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map(csvCell).join(",")
      )
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF", csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "studioraw-audit-logs.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const today = localDate();

  const todayCount = logs.filter(
    (log) =>
      String(log.timestamp || "").slice(0, 10) ===
      today
  ).length;

  const createdCount = logs.filter(
    (log) =>
      log.action === "Created"
  ).length;

  const updatedCount = logs.filter(
    (log) =>
      log.action === "Updated"
  ).length;

  const deletedCount = logs.filter(
    (log) =>
      log.action === "Deleted"
  ).length;

  const stats = [
    {
      label: "Total Activities",
      value: logs.length,
      icon: Activity,
      color: "text-blue-700",
    },
    {
      label: "Today's Activities",
      value: todayCount,
      icon: CalendarDays,
      color: "text-indigo-700",
    },
    {
      label: "Created Records",
      value: createdCount,
      icon: Plus,
      color: "text-green-700",
    },
    {
      label: "Updated Records",
      value: updatedCount,
      icon: Pencil,
      color: "text-amber-700",
    },
    {
      label: "Deleted Records",
      value: deletedCount,
      icon: Trash2,
      color: "text-red-700",
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
              Audit Logs & Activity History
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review studio activity records and changes
            </p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3">
          <button
            type="button"
            onClick={refreshLogs}
            className={secondaryButton}
          >
            <RefreshCw size={18} />
            Refresh Logs
          </button>

          <button
            type="button"
            onClick={openAdd}
            className={primaryButton}
          >
            <Plus size={18} />
            Add Activity
          </button>
        </div>
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

      {/* Activity Records */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex w-full min-w-0 flex-col gap-4">
          <h2 className="break-words text-lg font-bold text-[#10264d]">
            Activity Records
          </h2>

          <button
            type="button"
            onClick={exportCSV}
            className={secondaryButton}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex w-full min-w-0 flex-col gap-4">
          <FormField label="Search Activity">
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
                placeholder="Search activity..."
                className={`${inputClass} pl-11`}
              />
            </div>
          </FormField>

          <FormField label="Filter by Module">
            <CustomDropdown
              value={moduleFilter}
              options={[
                {
                  value: "All",
                  label: "All Modules",
                },
                ...modules,
              ]}
              onChange={setModuleFilter}
            />
          </FormField>

          <FormField label="Filter by Action">
            <CustomDropdown
              value={actionFilter}
              options={[
                {
                  value: "All",
                  label: "All Actions",
                },
                ...actions,
              ]}
              onChange={setActionFilter}
            />
          </FormField>

          <FormField label="Filter by Date">
            <input
              type="date"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value)
              }
              className={inputClass}
            />
          </FormField>

          {dateFilter && (
            <button
              type="button"
              onClick={() =>
                setDateFilter("")
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
            >
              <X size={16} />
              Clear Date Filter
            </button>
          )}
        </div>

        {/* Vertical Log Cards */}
        <div className="flex w-full min-w-0 flex-col gap-4">
          {filteredLogs.map((log) => (
            <article
              key={log.id}
              className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
                  <Activity size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-base font-bold text-[#10264d]">
                    {log.module}
                  </h3>

                  <p className="mt-2 break-words text-sm text-slate-500">
                    {formatDateTime(log.timestamp)}
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${
                    actionColors[log.action] ||
                    actionColors.Other
                  }`}
                >
                  {log.action}
                </span>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                <div className="w-full min-w-0 rounded-xl bg-white p-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    User / Staff
                  </p>

                  <div className="flex min-w-0 items-start gap-2">
                    <UserRound
                      size={17}
                      className="mt-0.5 shrink-0 text-[#10264d]"
                    />

                    <p className="min-w-0 break-words text-sm font-semibold text-[#10264d]">
                      {log.user || "-"}
                    </p>
                  </div>
                </div>

                <DetailField
                  label="Description"
                  value={log.description}
                />

                <DetailField
                  label="Record ID"
                  value={log.recordId}
                />

                <DetailField
                  label="Source"
                  value={log.source || "System"}
                />
              </div>

              <div className="border-t border-slate-200 pt-4">
                {log.source === "Manual" ? (
                  <button
                    type="button"
                    onClick={() =>
                      deleteLog(log)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={17} />
                    Delete Manual Activity
                  </button>
                ) : (
                  <div className="w-full rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-500">
                    Read Only
                  </div>
                )}
              </div>
            </article>
          ))}

          {filteredLogs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <Activity
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="text-sm text-slate-400">
                No activity records found.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Inline Add Activity Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex w-full min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0 flex-1">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                Add Activity Record
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create a manual demo activity entry
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close activity form"
              className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={saveLog}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="User / Staff Name">
              <input
                required
                value={form.user}
                onChange={(event) =>
                  updateField(
                    "user",
                    event.target.value
                  )
                }
                className={inputClass}
                placeholder="e.g. Admin"
              />
            </FormField>

            <FormField label="Module">
              <CustomDropdown
                value={form.module}
                options={modules}
                onChange={(value) =>
                  updateField("module", value)
                }
              />
            </FormField>

            <FormField label="Action">
              <CustomDropdown
                value={form.action}
                options={actions}
                onChange={(value) =>
                  updateField("action", value)
                }
              />
            </FormField>

            <FormField label="Record ID (Optional)">
              <input
                value={form.recordId}
                onChange={(event) =>
                  updateField(
                    "recordId",
                    event.target.value
                  )
                }
                className={inputClass}
                placeholder="Related record ID"
              />
            </FormField>

            <FormField label="Description">
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                className={`${inputClass} resize-y`}
                placeholder="Describe the activity..."
              />
            </FormField>

            {/* Form Actions */}
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
                Save Activity
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Demo Notice */}
      <p className="w-full min-w-0 break-words text-xs leading-6 text-slate-400">
        Demo activity records are stored in this browser.
        This is not a tamper-proof security audit trail.
        Automatic event logging requires integration with
        each module and server-side logging for production.
      </p>
    </div>
  );
}
