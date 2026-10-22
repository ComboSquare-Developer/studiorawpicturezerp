
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  Clock3,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  ChevronDown,
  ClipboardCheck,
  CalendarCheck2,
  UserRound,
  StickyNote,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const STAFF_KEY = "studioraw_staff";
const ATTENDANCE_KEY = "studioraw_attendance";

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const currentTime = () => new Date().toTimeString().slice(0, 5);

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `AT-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

const inputStyle =
  "block w-full min-w-0 rounded-xl border border-[#dbe4f0] bg-white px-3 py-2.5 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const statusColors = {
  Present: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Absent: "bg-red-50 text-red-700 ring-red-200",
  Leave: "bg-amber-50 text-amber-700 ring-amber-200",
  "Half Day": "bg-blue-50 text-blue-700 ring-blue-200",
};

const statusOptions = [
  { label: "Not Marked", value: "" },
  { label: "Present", value: "Present" },
  { label: "Absent", value: "Absent" },
  { label: "Leave", value: "Leave" },
  { label: "Half Day", value: "Half Day" },
];

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        statusColors[status] ||
        "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Not Marked"}
    </span>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <div className="relative w-full min-w-0">
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-0 appearance-none rounded-xl border border-[#dbe4f0] px-3 py-2.5 pr-8 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
          statusColors[value] ||
          "bg-white text-slate-600"
        }`}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`absolute left-0 top-0 h-1 w-full ${stat.accent}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <h3
            className={`mt-3 text-3xl font-extrabold ${stat.color}`}
          >
            {stat.value}
          </h3>
        </div>

        <div className={`shrink-0 rounded-2xl p-3 ${stat.bg}`}>
          <Icon size={23} className={stat.color} />
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Staff attendance overview
      </p>
    </div>
  );
}

function DetailBox({
  label,
  value,
  icon: Icon,
  color = "text-[#10264d]",
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-[#f7f9fc] p-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        {Icon && (
          <Icon
            size={13}
            className="shrink-0 text-slate-400"
          />
        )}

        <p className="text-[11px] font-medium text-slate-500">
          {label}
        </p>
      </div>

      <p
        className={`min-w-0 break-words text-sm font-bold ${color}`}
      >
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function TimeInput({ value, onChange }) {
  return (
    <input
      type="time"
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className={`${inputStyle} w-full`}
    />
  );
}

function AttendanceCard({
  person,
  record,
  onUpdate,
  onCheckIn,
  onCheckOut,
}) {
  const status = record?.status || "";

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md sm:p-5">
      {/* CARD HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <UserRound size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-extrabold text-[#10264d] sm:text-base">
              {person.name || "Unnamed Staff"}
            </h3>

            <p className="mt-1 break-words text-xs text-slate-400">
              {person.role || "Staff"}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      {/* ATTENDANCE STATUS */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-2 text-xs font-semibold text-slate-500">
          Attendance Status
        </p>

        <StatusSelect
          value={status}
          onChange={(value) =>
            onUpdate(person, { status: value })
          }
        />
      </div>

      {/* CHECK IN / CHECK OUT */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="min-w-0 rounded-xl border border-slate-100 bg-[#f7f9fc] p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <UserCheck
              size={13}
              className="text-slate-400"
            />

            <p className="text-[11px] font-medium text-slate-500">
              Check In
            </p>
          </div>

          <TimeInput
            value={record?.checkIn || ""}
            onChange={(value) =>
              onUpdate(person, { checkIn: value })
            }
          />
        </div>

        <div className="min-w-0 rounded-xl border border-slate-100 bg-[#f7f9fc] p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Clock3
              size={13}
              className="text-slate-400"
            />

            <p className="text-[11px] font-medium text-slate-500">
              Check Out
            </p>
          </div>

          <TimeInput
            value={record?.checkOut || ""}
            onChange={(value) =>
              onUpdate(person, { checkOut: value })
            }
          />
        </div>
      </div>

      {/* NOTES */}
      <div className="mt-3 rounded-xl border border-slate-100 bg-[#f7f9fc] p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <StickyNote
            size={13}
            className="text-slate-400"
          />

          <p className="text-[11px] font-medium text-slate-500">
            Attendance Notes
          </p>
        </div>

        <textarea
          rows={2}
          value={record?.notes || ""}
          onChange={(event) =>
            onUpdate(person, {
              notes: event.target.value,
            })
          }
          placeholder="Add attendance note..."
          className={`${inputStyle} resize-y`}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-auto grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onCheckIn(person)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 sm:text-sm"
        >
          <UserCheck size={17} />
          Check In
        </button>

        <button
          type="button"
          onClick={() => onCheckOut(person)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100 sm:text-sm"
        >
          <Clock3 size={17} />
          Check Out
        </button>
      </div>
    </article>
  );
}

function MonthlyCard({ item, month }) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md sm:p-5">
      {/* HEADER */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <UserRound size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-extrabold text-[#10264d] sm:text-base">
            {item.person.name || "Unnamed Staff"}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {item.person.role || "Staff"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <CalendarDays
          size={14}
          className="text-blue-600"
        />

        <p className="text-xs font-semibold text-slate-500">
          Report Month: {month}
        </p>
      </div>

      {/* MONTHLY DETAILS */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <DetailBox
          label="Present"
          value={item.present}
          icon={UserCheck}
          color="text-emerald-700"
        />

        <DetailBox
          label="Absent"
          value={item.absent}
          icon={UserX}
          color="text-red-600"
        />

        <DetailBox
          label="Leave"
          value={item.leave}
          icon={CalendarDays}
          color="text-amber-600"
        />

        <DetailBox
          label="Half Day"
          value={item.halfDay}
          icon={Clock3}
          color="text-blue-700"
        />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
        <p className="text-xs font-semibold text-blue-700">
          Total Marked Days
        </p>

        <p className="text-lg font-extrabold text-[#10264d]">
          {item.present +
            item.absent +
            item.leave +
            item.halfDay}
        </p>
      </div>
    </article>
  );
}

export default function StaffAttendance() {
  const [staff, setStaff] = useState(() =>
    readArray(STAFF_KEY)
  );

  const [attendance, setAttendance] = useState(() =>
    readArray(ATTENDANCE_KEY)
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("daily");

  useEffect(() => {
    localStorage.setItem(
      ATTENDANCE_KEY,
      JSON.stringify(attendance)
    );
  }, [attendance]);

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

  const recordMap = useMemo(() => {
    const map = new Map();

    attendance.forEach((record) => {
      if (record.date === selectedDate) {
        map.set(String(record.staffId), record);
      }
    });

    return map;
  }, [attendance, selectedDate]);

  const getRecord = (staffId) =>
    recordMap.get(String(staffId));

  const updateAttendance = (person, updates) => {
    setAttendance((previous) => {
      const index = previous.findIndex(
        (record) =>
          String(record.staffId) === String(person.id) &&
          record.date === selectedDate
      );

      if (index !== -1) {
        return previous.map((record, i) =>
          i === index
            ? { ...record, ...updates }
            : record
        );
      }

      return [
        ...previous,
        {
          id: createId(),
          staffId: person.id,
          staffName: person.name,
          role: person.role || "Staff",
          date: selectedDate,
          status: "Present",
          checkIn: "",
          checkOut: "",
          notes: "",
          ...updates,
        },
      ];
    });
  };

  const markAllPresent = () => {
    if (!staff.length) return;

    setAttendance((previous) => {
      const updated = [...previous];

      staff.forEach((person) => {
        const index = updated.findIndex(
          (record) =>
            String(record.staffId) === String(person.id) &&
            record.date === selectedDate
        );

        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            status: "Present",
          };
        } else {
          updated.push({
            id: createId(),
            staffId: person.id,
            staffName: person.name,
            role: person.role || "Staff",
            date: selectedDate,
            status: "Present",
            checkIn: "",
            checkOut: "",
            notes: "",
          });
        }
      });

      return updated;
    });
  };

  const changeDate = (days) => {
    const [year, month, day] = selectedDate
      .split("-")
      .map(Number);

    const date = new Date(year, month - 1, day + days);

    setSelectedDate(
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`
    );
  };

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((person) =>
      `${person.name || ""} ${person.role || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [staff, search]);

  const dailyRecords = staff.map((person) => ({
    person,
    record: getRecord(person.id),
  }));

  const presentCount = dailyRecords.filter(
    ({ record }) => record?.status === "Present"
  ).length;

  const absentCount = dailyRecords.filter(
    ({ record }) => record?.status === "Absent"
  ).length;

  const leaveCount = dailyRecords.filter(
    ({ record }) => record?.status === "Leave"
  ).length;

  const month = selectedDate.slice(0, 7);

  const monthlySummary = useMemo(
    () =>
      staff.map((person) => {
        const records = attendance.filter(
          (record) =>
            String(record.staffId) === String(person.id) &&
            String(record.date || "").startsWith(month)
        );

        return {
          person,
          present: records.filter(
            (record) => record.status === "Present"
          ).length,
          absent: records.filter(
            (record) => record.status === "Absent"
          ).length,
          leave: records.filter(
            (record) => record.status === "Leave"
          ).length,
          halfDay: records.filter(
            (record) => record.status === "Half Day"
          ).length,
        };
      }),
    [staff, attendance, month]
  );

  const exportCSV = () => {
    const rows = [
      [
        "Staff",
        "Role",
        "Present",
        "Absent",
        "Leave",
        "Half Day",
      ],
      ...monthlySummary.map((item) => [
        item.person.name,
        item.person.role || "Staff",
        item.present,
        item.absent,
        item.leave,
        item.halfDay,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${month}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const checkInNow = (person) => {
    updateAttendance(person, {
      status: "Present",
      checkIn: currentTime(),
    });
  };

  const checkOutNow = (person) => {
    updateAttendance(person, {
      checkOut: currentTime(),
    });
  };

  const stats = [
    {
      label: "Total Staff",
      value: staff.length,
      icon: Users,
      color: "text-blue-700",
      bg: "bg-blue-50",
      accent: "bg-blue-600",
    },
    {
      label: "Present",
      value: presentCount,
      icon: UserCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      accent: "bg-emerald-600",
    },
    {
      label: "Absent",
      value: absentCount,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
      accent: "bg-red-500",
    },
    {
      label: "On Leave",
      value: leaveCount,
      icon: CalendarDays,
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "bg-amber-500",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Staff Management
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Staff Attendance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Daily attendance, check-in and monthly reports.
          </p>
        </div>

        {/* DATE NAVIGATION */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => changeDate(-1)}
            title="Previous Day"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-[#10264d] transition hover:bg-slate-50"
          >
            <ChevronLeft size={19} />
          </button>

          <div className="relative min-w-0 flex-1">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-700"
            />

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                if (event.target.value) {
                  setSelectedDate(event.target.value);
                }
              }}
              className={`${inputStyle} pl-10`}
            />
          </div>

          <button
            type="button"
            onClick={() => changeDate(1)}
            title="Next Day"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-[#10264d] transition hover:bg-slate-50"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* TABS */}
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "daily"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ClipboardCheck size={17} />
            Daily Attendance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "monthly"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CalendarCheck2 size={17} />
            Monthly Report
          </button>
        </div>

        {activeTab === "daily" ? (
          <>
            {/* DAILY TOOLBAR */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Daily Attendance Register
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Attendance for {formatDate(selectedDate)}
                </p>
              </div>

              <button
                type="button"
                onClick={markAllPresent}
                disabled={!staff.length}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserCheck size={18} />
                Mark All Present
              </button>
            </div>

            {/* SEARCH */}
            <div className="border-b border-slate-100 p-4 sm:px-6">
              <div className="relative w-full sm:max-w-sm">
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
                  placeholder="Search staff name or role..."
                  className={`${inputStyle} pl-10`}
                />
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Showing {filteredStaff.length} of {staff.length} staff
              </p>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <Users
                  size={42}
                  className="mb-4 text-slate-300"
                />

                <h3 className="font-bold text-[#10264d]">
                  {staff.length === 0
                    ? "No staff available"
                    : "No matching staff found"}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {staff.length === 0
                    ? "Add staff in Settings first."
                    : "Try another staff name or role."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 bg-[#fbfcff] p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-6">
                {filteredStaff.map((person) => (
                  <AttendanceCard
                    key={person.id}
                    person={person}
                    record={getRecord(person.id)}
                    onUpdate={updateAttendance}
                    onCheckIn={checkInNow}
                    onCheckOut={checkOutNow}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* MONTHLY TOOLBAR */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Monthly Attendance Report
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Report Month: {month}
                </p>
              </div>

              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>

            {monthlySummary.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <CalendarDays
                  size={42}
                  className="mb-4 text-slate-300"
                />

                <h3 className="font-bold text-[#10264d]">
                  No staff available
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Add staff to generate monthly reports.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 bg-[#fbfcff] p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-6">
                {monthlySummary.map((item) => (
                  <MonthlyCard
                    key={item.person.id}
                    item={item}
                    month={month}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <p className="mt-5 text-xs leading-5 text-slate-400">
        Attendance is automatically saved in this browser.
      </p>
    </div>
  );
}
