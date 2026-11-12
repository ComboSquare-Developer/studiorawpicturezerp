
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  FileText,
  Clock3,
  AlertCircle,
  Eye,
  Tag,
  Hash,
  Database,
  CheckCircle2,
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
  "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

const actionColors = {
  Created: "bg-emerald-50 text-emerald-700",
  Updated: "bg-blue-50 text-blue-700",
  Deleted: "bg-rose-50 text-rose-700",
  Viewed: "bg-slate-100 text-slate-700",
  Login: "bg-indigo-50 text-indigo-700",
  Logout: "bg-amber-50 text-amber-700",
  Exported: "bg-purple-50 text-purple-700",
  Other: "bg-slate-100 text-slate-600",
};

function readLogs() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `LOG-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function localDate(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function csvCell(value) {
  let text = String(value ?? "");

  if (/^\s*[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
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

function CustomDropdown({ value, options, onChange }) {
  const items = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option
  );

  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
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

function ActionBadge({ action }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[11px] font-bold ${
        actionColors[action] || actionColors.Other
      }`}
    >
      {action || "Other"}
    </span>
  );
}

function SourceBadge({ source }) {
  const manual = source === "Manual";

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold ${
        manual
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {manual ? <Pencil size={11} /> : <ShieldCheck size={11} />}
      {source || "System"}
    </span>
  );
}

function InfoBox({ icon: Icon, label, value, full = false }) {
  return (
    <div
      className={`min-w-0 rounded-xl bg-[#f7f9fc] p-3 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 text-slate-400">
        {Icon && <Icon size={14} className="shrink-0" />}
        <span className="truncate text-[11px] font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-[13px] font-bold leading-5 text-[#10264d]">
        {value === undefined || value === null || value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <h3 className={`mt-3 text-3xl font-extrabold ${stat.color}`}>
            {stat.value}
          </h3>
        </div>

        <div className={`shrink-0 rounded-xl p-3 ${stat.bg}`}>
          <Icon size={22} className={stat.color} />
        </div>
      </div>
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
    red: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${colors[color]}`}
    >
      <Icon size={16} />
    </button>
  );
}

function ActivityCard({ log, onView, onDelete }) {
  const manual = log.source === "Manual";

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      {/* CARD HEADER */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Activity size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-sm font-extrabold leading-5 text-[#10264d] sm:text-base">
              {log.module || "Other"}
            </h3>

            <p className="mt-1 text-[11px] text-slate-400">
              {formatDateTime(log.timestamp)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ActionButton
            icon={Eye}
            label="View Activity"
            onClick={() => onView(log)}
          />

          {manual && (
            <ActionButton
              icon={Trash2}
              label="Delete Manual Activity"
              color="red"
              onClick={() => onDelete(log)}
            />
          )}
        </div>
      </div>

      <div className="my-4 border-t border-slate-100" />

      {/* BADGES */}
      <div className="mb-4 flex flex-wrap gap-2">
        <ActionBadge action={log.action} />
        <SourceBadge source={log.source} />
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-2 gap-2.5">
        <InfoBox
          icon={UserRound}
          label="User / Staff"
          value={log.user}
        />

        <InfoBox
          icon={Tag}
          label="Action"
          value={log.action}
        />

        <InfoBox
          icon={Hash}
          label="Record ID"
          value={log.recordId}
        />

        <InfoBox
          icon={Clock3}
          label="Date & Time"
          value={formatDateTime(log.timestamp)}
        />

        <InfoBox
          icon={FileText}
          label="Activity Description"
          value={log.description}
          full
        />
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            {manual ? (
              <>
                <Pencil size={14} />
                Manual Entry
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                Read Only
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => onView(log)}
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
  subtitle,
  icon: Icon,
  onClose,
  children,
  width = "max-w-[720px]",
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
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
                {subtitle}
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

export default function AuditLogs() {
  const [logs, setLogs] = useState(readLogs);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [viewLog, setViewLog] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setError("");
  }, []);

  useEffect(() => {
    if (!showForm && !viewLog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (showForm) {
        closeForm();
      } else {
        setViewLog(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm, viewLog, closeForm]);

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
          String(value || "").toLowerCase().includes(query)
        );

        const matchesModule =
          moduleFilter === "All" || log.module === moduleFilter;

        const matchesAction =
          actionFilter === "All" || log.action === actionFilter;

        const matchesDate =
          !dateFilter || localDate(log.timestamp) === dateFilter;

        return matchesSearch && matchesModule && matchesAction && matchesDate;
      })
      .sort(
        (a, b) =>
          (new Date(b.timestamp).getTime() || 0) -
          (new Date(a.timestamp).getTime() || 0)
      );
  }, [logs, search, moduleFilter, actionFilter, dateFilter]);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setError("");
    setViewLog(null);
    setShowForm(true);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) setError("");
  };

  const saveLog = (event) => {
    event.preventDefault();

    if (!form.user.trim() || !form.description.trim()) {
      setError("User and description are required.");
      return;
    }

    const record = {
      id: createId(),
      user: form.user.trim(),
      module: form.module,
      action: form.action,
      description: form.description.trim(),
      recordId: form.recordId.trim(),
      timestamp: new Date().toISOString(),
      source: "Manual",
    };

    setLogs((previous) => [record, ...previous]);
    closeForm();
  };

  const deleteLog = (log) => {
    if (log.source !== "Manual") return;

    if (!window.confirm("Delete this activity record?")) {
      return;
    }

    setLogs((previous) =>
      previous.filter((item) => item.id !== log.id)
    );

    if (viewLog?.id === log.id) {
      setViewLog(null);
    }
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
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "studioraw-audit-logs.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const today = localDate();

  const stats = [
    {
      label: "Total Activities",
      value: logs.length,
      icon: Activity,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Today's Activities",
      value: logs.filter(
        (log) => localDate(log.timestamp) === today
      ).length,
      icon: CalendarDays,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      label: "Created Records",
      value: logs.filter((log) => log.action === "Created").length,
      icon: Plus,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Updated Records",
      value: logs.filter((log) => log.action === "Updated").length,
      icon: Pencil,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Deleted Records",
      value: logs.filter((log) => log.action === "Deleted").length,
      icon: Trash2,
      color: "text-rose-700",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Security
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Audit Logs & Activity History
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review studio activity records and changes.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={refreshLogs}
            className={`${secondaryButton} w-full sm:w-auto`}
          >
            <RefreshCw size={17} />
            Refresh Logs
          </button>

          <button
            type="button"
            onClick={openAdd}
            className={`${primaryButton} w-full sm:w-auto`}
          >
            <Plus size={17} />
            Add Activity
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* ACTIVITY RECORDS */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#10264d]">
                <Activity size={20} className="text-blue-600" />
                Activity Records
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing {filteredLogs.length} of {logs.length} activities
              </p>
            </div>

            <button
              type="button"
              onClick={exportCSV}
              className={`${secondaryButton} w-full sm:w-auto`}
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>

          {/* FILTERS */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FormField label="Search Activity">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search activity..."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </FormField>

            <FormField label="Filter by Module">
              <CustomDropdown
                value={moduleFilter}
                options={[
                  { value: "All", label: "All Modules" },
                  ...modules,
                ]}
                onChange={setModuleFilter}
              />
            </FormField>

            <FormField label="Filter by Action">
              <CustomDropdown
                value={actionFilter}
                options={[
                  { value: "All", label: "All Actions" },
                  ...actions,
                ]}
                onChange={setActionFilter}
              />
            </FormField>

            <FormField label="Filter by Date">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  className={inputClass}
                />

                {dateFilter && (
                  <button
                    type="button"
                    onClick={() => setDateFilter("")}
                    title="Clear date filter"
                    className="shrink-0 rounded-xl bg-blue-50 px-3 text-blue-700 hover:bg-blue-100"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            </FormField>
          </div>
        </div>

        {/* CARDS */}
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-slate-50 p-5">
              <Activity size={36} className="text-slate-300" />
            </div>

            <h3 className="font-bold text-[#10264d]">
              No activity records found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Add an activity or change your filters.
            </p>

            {logs.length === 0 && (
              <button
                type="button"
                onClick={openAdd}
                className={`${primaryButton} mt-5`}
              >
                <Plus size={16} />
                Add Activity
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-6">
            {filteredLogs.map((log) => (
              <ActivityCard
                key={log.id}
                log={log}
                onView={setViewLog}
                onDelete={deleteLog}
              />
            ))}
          </div>
        )}
      </section>

      {/* DEMO NOTICE */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0 text-amber-600"
        />

        <p className="text-xs leading-6 text-amber-800">
          Activity records are stored in this browser. This is
          not a tamper-proof security audit trail. Automatic event
          logging requires integration with each module and
          server-side logging for production.
        </p>
      </div>

      {/* ADD ACTIVITY MODAL */}
      {showForm && (
        <Modal
          title="Add Activity Record"
          subtitle="Create a manual activity entry"
          icon={Plus}
          onClose={closeForm}
        >
          <form
            onSubmit={saveLog}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <UserRound size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-[#10264d]">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="User / Staff Name" required>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={form.user}
                      onChange={(event) =>
                        updateField("user", event.target.value)
                      }
                      placeholder="e.g. Admin"
                      className={inputClass}
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
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Activity size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-[#10264d]">
                    Activity Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                      type="text"
                      value={form.recordId}
                      onChange={(event) =>
                        updateField("recordId", event.target.value)
                      }
                      placeholder="Related record ID"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <FileText size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-[#10264d]">
                    Activity Description
                  </h3>
                </div>

                <FormField label="Description" required>
                  <textarea
                    required
                    rows={5}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Describe the activity..."
                    className={`${inputClass} resize-y`}
                  />
                </FormField>
              </section>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}
            </div>

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
                  Save Activity
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewLog && !showForm && (
        <Modal
          title="Activity Details"
          subtitle="Recorded activity information"
          icon={ShieldCheck}
          width="max-w-[650px]"
          onClose={() => setViewLog(null)}
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <h3 className="mb-3 break-words text-lg font-bold text-[#10264d]">
              {viewLog.module || "Other"}
            </h3>

            <div className="mb-5 flex flex-wrap gap-2">
              <ActionBadge action={viewLog.action} />
              <SourceBadge source={viewLog.source} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoBox
                icon={UserRound}
                label="User / Staff"
                value={viewLog.user}
              />

              <InfoBox
                icon={Tag}
                label="Action"
                value={viewLog.action}
              />

              <InfoBox
                icon={Database}
                label="Module"
                value={viewLog.module}
                full
              />

              <InfoBox
                icon={Hash}
                label="Record ID"
                value={viewLog.recordId}
              />

              <InfoBox
                icon={Clock3}
                label="Date & Time"
                value={formatDateTime(viewLog.timestamp)}
              />

              <InfoBox
                icon={FileText}
                label="Description"
                value={viewLog.description}
                full
              />

              <InfoBox
                icon={ShieldCheck}
                label="Source"
                value={viewLog.source || "System"}
                full
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end sm:p-5">
            {viewLog.source === "Manual" ? (
              <button
                type="button"
                onClick={() => deleteLog(viewLog)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 size={16} />
                Delete Activity
              </button>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
                <ShieldCheck size={15} />
                Read Only
              </span>
            )}

            <button
              type="button"
              onClick={() => setViewLog(null)}
              className={secondaryButton}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
