
import { useEffect, useMemo, useState } from "react";
import {
  Activity, Search, Download, CalendarDays, Plus,
  Pencil, Trash2, ShieldCheck, RefreshCw, X,
  Save, UserRound, ChevronDown, FileText,
  Filter, Clock3, AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "studioraw_audit_logs";

const modules = [
  "Dashboard", "Enquiries & Leads", "Customers",
  "Booking & Calendar", "Payment & Billing",
  "Pre-Shoot Preparation", "Photo Shoot & Data",
  "Photo Selection & Editing", "Album Design & Printing",
  "Delivery Management", "Follow-up & CRM",
  "Inventory Management", "Equipment Management",
  "Staff Attendance", "Expense & Profit",
  "Multi-Branch Management", "Reports & Analytics",
  "Roles & Permissions", "Notifications & Reminders",
  "Settings & Staff", "Authentication", "Other",
];

const actions = [
  "Created", "Updated", "Deleted", "Viewed",
  "Login", "Logout", "Exported", "Other",
];

const emptyForm = {
  user: "",
  module: "Other",
  action: "Created",
  description: "",
  recordId: "",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-[#8ca0bd] focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButton =
  "flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384]";

const secondaryButton =
  "flex items-center justify-center gap-2 rounded-xl border border-[#d9e3f2] bg-white px-5 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

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
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function localDate(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
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
  if (/^[\s]*[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
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
}) {
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
          <option key={item.value} value={item.value}>
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
      className={`inline-flex w-fit rounded-lg px-3 py-1.5 text-xs font-semibold ${
        actionColors[action] || actionColors.Other
      }`}
    >
      {action || "Other"}
    </span>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="min-w-0 border-b border-slate-100 pb-3 last:border-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
        {value || "—"}
      </p>
    </div>
  );
}

function ActivityModal({ form, updateField, closeForm, saveLog }) {
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
        aria-label="Add Activity Record"
        className="flex max-h-[96dvh] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[93dvh] sm:rounded-[22px]"
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5ebf3] bg-white px-5 py-5 sm:px-9 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white">
              <Plus size={23} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#10264d] sm:text-[23px]">
                Add Activity Record
              </h2>
              <p className="mt-1 text-xs text-[#8090aa] sm:text-sm">
                Create a manual demo activity entry
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeForm}
            aria-label="Close activity form"
            className="rounded-lg p-2 text-[#627895] hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={saveLog} className="flex min-h-0 flex-1 flex-col">
          {/* SCROLLABLE CONTENT */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-9 sm:py-7">
            <div className="space-y-8">
              <section>
                <SectionHeading icon={UserRound} title="Basic Information" />
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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
                      onChange={(value) => updateField("module", value)}
                    />
                  </FormField>
                </div>
              </section>

              <section>
                <SectionHeading icon={Activity} title="Activity Details" />
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <FormField label="Action">
                    <CustomDropdown
                      value={form.action}
                      options={actions}
                      onChange={(value) => updateField("action", value)}
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

              <section>
                <SectionHeading icon={FileText} title="Activity Description" />
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
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState(readLogs);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  const refreshLogs = () => {
    setLogs(readLogs());
  };

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs
      .filter((log) => {
        const matchesSearch = [
          log.user, log.module, log.action,
          log.description, log.recordId,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

        const matchesModule =
          moduleFilter === "All" || log.module === moduleFilter;

        const matchesAction =
          actionFilter === "All" || log.action === actionFilter;

        const matchesDate =
          !dateFilter ||
          localDate(log.timestamp) === dateFilter;

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
  }, [logs, search, moduleFilter, actionFilter, dateFilter]);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setShowForm(true);
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

    if (!form.user.trim() || !form.description.trim()) {
      window.alert("User and description are required.");
      return;
    }

    const record = {
      id:
        globalThis.crypto?.randomUUID?.() ||
        `LOG-${Date.now()}`,
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

    if (!window.confirm("Delete this demo activity record?")) {
      return;
    }

    setLogs((previous) =>
      previous.filter((item) => item.id !== log.id)
    );
  };

  const exportCSV = () => {
    const rows = [
      [
        "Timestamp", "User", "Module", "Action",
        "Description", "Record ID", "Source",
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
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      color: "text-green-700",
      bg: "bg-green-50",
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
      color: "text-red-700",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">

      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
            <ShieldCheck size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
              Audit Logs & Activity History
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review studio activity records and changes
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={refreshLogs}
            className={`${secondaryButton} w-full sm:w-auto`}
          >
            <RefreshCw size={18} />
            Refresh Logs
          </button>
          <button
            type="button"
            onClick={openAdd}
            className={`${primaryButton} w-full sm:w-auto`}
          >
            <Plus size={18} />
            Add Activity
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
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

      {/* ACTIVITY RECORDS */}
      <section className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Activity Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Monitor recorded activity across studio modules.
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
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FormField label="Search Activity">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search activity..."
                  className={`${inputClass} pl-11`}
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
                    aria-label="Clear date filter"
                    className="shrink-0 rounded-xl bg-blue-50 px-3 text-blue-700 hover:bg-blue-100"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </FormField>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <Activity
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="text-sm text-slate-400">
              No activity records found.
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
                      "Date & Time", "User / Staff", "Module",
                      "Action", "Description", "Record ID",
                      "Source", "Actions",
                    ].map((heading) => (
                      <th key={heading} className="px-4 py-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="align-top transition hover:bg-blue-50/40"
                    >
                      <td className="whitespace-nowrap px-4 py-5 text-xs text-slate-600">
                        {formatDateTime(log.timestamp)}
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <UserRound
                            size={17}
                            className="shrink-0 text-blue-600"
                          />
                          <span className="text-sm font-semibold text-[#10264d]">
                            {log.user || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5 text-sm font-medium text-[#10264d]">
                        {log.module || "—"}
                      </td>

                      <td className="px-4 py-5">
                        <ActionBadge action={log.action} />
                      </td>

                      <td className="max-w-[280px] px-4 py-5">
                        <p className="whitespace-pre-wrap break-words text-sm text-slate-600">
                          {log.description || "—"}
                        </p>
                      </td>

                      <td className="max-w-[140px] break-all px-4 py-5 text-xs text-slate-600">
                        {log.recordId || "—"}
                      </td>

                      <td className="px-4 py-5">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                          {log.source || "System"}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        {log.source === "Manual" ? (
                          <button
                            type="button"
                            title="Delete Manual Activity"
                            aria-label="Delete manual activity"
                            onClick={() => deleteLog(log)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={17} />
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Read Only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE AND TABLET CARDS */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
              {filteredLogs.map((log) => (
                <article
                  key={log.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
                    <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
                      <Activity size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {log.module}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(log.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ActionBadge action={log.action} />
                  </div>

                  <div className="mt-4 space-y-3">
                    <DetailField
                      label="User / Staff"
                      value={log.user}
                    />
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

                  <div className="mt-5 border-t border-slate-200 pt-4">
                    {log.source === "Manual" ? (
                      <button
                        type="button"
                        onClick={() => deleteLog(log)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={17} />
                        Delete Manual Activity
                      </button>
                    ) : (
                      <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-500">
                        Read Only
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* DEMO NOTICE */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0 text-amber-600"
        />
        <p className="text-xs leading-6 text-amber-800">
          Demo activity records are stored in this browser.
          This is not a tamper-proof security audit trail.
          Automatic event logging requires integration with each
          module and server-side logging for production.
        </p>
      </div>

      {/* ADD ACTIVITY POPUP */}
      {showForm && (
        <ActivityModal
          form={form}
          updateField={updateField}
          closeForm={closeForm}
          saveLog={saveLog}
        />
      )}
    </div>
  );
}
