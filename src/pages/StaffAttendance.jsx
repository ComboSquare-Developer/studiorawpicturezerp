
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
  Check,
  ClipboardCheck,
  CalendarCheck2,
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

const inputStyle =
  "block w-full min-w-0 rounded-xl border border-[#dbe4f0] bg-white px-3 py-2.5 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const statusColors = {
  Present: "bg-green-100 text-green-700",
  Absent: "bg-red-100 text-red-700",
  Leave: "bg-amber-100 text-amber-700",
  "Half Day": "bg-blue-100 text-blue-700",
};

const statusOptions = [
  { label: "Not Marked", value: "" },
  { label: "Present", value: "Present" },
  { label: "Absent", value: "Absent" },
  { label: "Leave", value: "Leave" },
  { label: "Half Day", value: "Half Day" },
];

function StatusSelect({ value, onChange }) {
  return (
    <div className="relative min-w-0">
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-[125px] appearance-none rounded-xl border border-[#dbe4f0] px-3 py-2.5 pr-8 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
          statusColors[value] || "bg-white text-slate-600"
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
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
      />
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="min-w-0 rounded-2xl border border-[#e8edf5] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
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

function TimeInput({ value, onChange }) {
  return (
    <input
      type="time"
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className={`${inputStyle} min-w-[105px]`}
    />
  );
}

function AttendanceActions({
  person,
  onCheckIn,
  onCheckOut,
  compact = false,
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col gap-2"
          : "flex flex-col gap-2 sm:flex-row"
      }
    >
      <button
        type="button"
        onClick={() => onCheckIn(person)}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
      >
        <UserCheck size={15} />
        Check In
      </button>

      <button
        type="button"
        onClick={() => onCheckOut(person)}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-semibold text-[#174b91] transition hover:bg-blue-100"
      >
        <Clock3 size={15} />
        Check Out
      </button>
    </div>
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
    },
    {
      label: "Present",
      value: presentCount,
      icon: UserCheck,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Absent",
      value: absentCount,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "On Leave",
      value: leaveCount,
      icon: CalendarDays,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-[#f7f9fc] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white shadow-sm">
            <ClipboardCheck size={24} />
          </div>

          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl">
              Staff Attendance
            </h1>

            <p className="mt-1 text-sm leading-6 text-[#8190a7]">
              Daily attendance, staff check-in and monthly reports
            </p>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex flex-col gap-2 rounded-2xl border border-[#e7edf6] bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => changeDate(-1)}
            title="Previous Day"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#e1e7f0] px-4 py-2.5 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
          >
            <ChevronLeft size={18} />
            <span className="sm:hidden">Previous Day</span>
          </button>

          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#174b91]"
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
            className="flex items-center justify-center gap-2 rounded-xl border border-[#e1e7f0] px-4 py-2.5 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
          >
            <span className="sm:hidden">Next Day</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Main Content */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e7edf6] bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:p-6">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "daily"
                ? "bg-[#112e60] text-white"
                : "bg-[#f4f7fb] text-[#52627d] hover:bg-slate-100"
            }`}
          >
            <ClipboardCheck size={18} />
            Daily Attendance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "monthly"
                ? "bg-[#112e60] text-white"
                : "bg-[#f4f7fb] text-[#52627d] hover:bg-slate-100"
            }`}
          >
            <CalendarCheck2 size={18} />
            Monthly Report
          </button>
        </div>

        {activeTab === "daily" ? (
          <>
            {/* Daily Toolbar */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Daily Attendance Register
                </h2>

                <p className="mt-1 text-sm text-[#8190a7]">
                  Manage staff attendance for {selectedDate}
                </p>
              </div>

              <button
                type="button"
                onClick={markAllPresent}
                disabled={!staff.length}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserCheck size={18} />
                Mark All Present
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="relative w-full sm:max-w-sm">
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
                  placeholder="Search staff name or role..."
                  className={`${inputStyle} pl-11`}
                />
              </div>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Users
                  size={42}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm font-semibold text-slate-600">
                  {staff.length === 0
                    ? "No staff available"
                    : "No matching staff found"}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {staff.length === 0
                    ? "Add staff in Settings first."
                    : "Try another staff name or role."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto xl:block">
                  <table className="w-full min-w-[1080px] border-collapse text-left">
                    <thead className="bg-[#f7f9fc]">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-[#8190a7]">
                        {[
                          "Staff Member",
                          "Status",
                          "Check In",
                          "Check Out",
                          "Notes",
                          "Quick Actions",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-4 py-4"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredStaff.map((person) => {
                        const record = getRecord(person.id);

                        return (
                          <tr
                            key={person.id}
                            className="align-top transition hover:bg-blue-50/30"
                          >
                            <td className="px-4 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#174b91]">
                                  <Users size={19} />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-40 break-words text-sm font-semibold text-[#10264d]">
                                    {person.name || "Unnamed Staff"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    {person.role || "Staff"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-5">
                              <StatusSelect
                                value={record?.status || ""}
                                onChange={(value) =>
                                  updateAttendance(person, {
                                    status: value,
                                  })
                                }
                              />
                            </td>

                            <td className="px-4 py-5">
                              <TimeInput
                                value={record?.checkIn || ""}
                                onChange={(value) =>
                                  updateAttendance(person, {
                                    checkIn: value,
                                  })
                                }
                              />
                            </td>

                            <td className="px-4 py-5">
                              <TimeInput
                                value={record?.checkOut || ""}
                                onChange={(value) =>
                                  updateAttendance(person, {
                                    checkOut: value,
                                  })
                                }
                              />
                            </td>

                            <td className="px-4 py-5">
                              <textarea
                                rows={2}
                                value={record?.notes || ""}
                                onChange={(event) =>
                                  updateAttendance(person, {
                                    notes: event.target.value,
                                  })
                                }
                                placeholder="Add note..."
                                className={`${inputStyle} min-w-[150px] resize-y`}
                              />
                            </td>

                            <td className="px-4 py-5">
                              <AttendanceActions
                                person={person}
                                onCheckIn={checkInNow}
                                onCheckOut={checkOutNow}
                                compact
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / Tablet Cards */}
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:hidden sm:p-6">
                  {filteredStaff.map((person) => {
                    const record = getRecord(person.id);

                    return (
                      <article
                        key={person.id}
                        className="min-w-0 rounded-2xl border border-[#e1e7f0] bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#174b91]">
                            <Users size={22} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-base font-bold text-[#10264d]">
                              {person.name || "Unnamed Staff"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {person.role || "Staff"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                          <div>
                            <p className="mb-2 text-xs font-semibold text-slate-500">
                              Attendance Status
                            </p>

                            <StatusSelect
                              value={record?.status || ""}
                              onChange={(value) =>
                                updateAttendance(person, {
                                  status: value,
                                })
                              }
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-semibold text-slate-500">
                                Check In
                              </p>

                              <TimeInput
                                value={record?.checkIn || ""}
                                onChange={(value) =>
                                  updateAttendance(person, {
                                    checkIn: value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <p className="mb-2 text-xs font-semibold text-slate-500">
                                Check Out
                              </p>

                              <TimeInput
                                value={record?.checkOut || ""}
                                onChange={(value) =>
                                  updateAttendance(person, {
                                    checkOut: value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-xs font-semibold text-slate-500">
                              Attendance Notes
                            </p>

                            <textarea
                              rows={3}
                              value={record?.notes || ""}
                              onChange={(event) =>
                                updateAttendance(person, {
                                  notes: event.target.value,
                                })
                              }
                              placeholder="Add attendance note..."
                              className={`${inputStyle} resize-y`}
                            />
                          </div>
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <AttendanceActions
                            person={person}
                            onCheckIn={checkInNow}
                            onCheckOut={checkOutNow}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </>
        ) : (
          /* Monthly Report */
          <>
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Monthly Attendance Report
                </h2>

                <p className="mt-1 text-sm text-[#8190a7]">
                  Report Month: {month}
                </p>
              </div>

              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4384]"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>

            {monthlySummary.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <CalendarDays
                  size={40}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm text-slate-500">
                  No staff available for the report.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Monthly Table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[700px] border-collapse text-left">
                    <thead className="bg-[#f7f9fc]">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-[#8190a7]">
                        {[
                          "Staff Member",
                          "Present",
                          "Absent",
                          "Leave",
                          "Half Day",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-6 py-4"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {monthlySummary.map((item) => (
                        <tr
                          key={item.person.id}
                          className="transition hover:bg-blue-50/30"
                        >
                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold text-[#10264d]">
                              {item.person.name || "Unnamed Staff"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.person.role || "Staff"}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-green-700">
                            {item.present}
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-red-600">
                            {item.absent}
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-amber-600">
                            {item.leave}
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-blue-700">
                            {item.halfDay}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Monthly Cards */}
                <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                  {monthlySummary.map((item) => (
                    <article
                      key={item.person.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <h3 className="text-base font-bold text-[#10264d]">
                        {item.person.name || "Unnamed Staff"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.person.role || "Staff"}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {[
                          {
                            label: "Present",
                            value: item.present,
                            color: "text-green-700",
                          },
                          {
                            label: "Absent",
                            value: item.absent,
                            color: "text-red-600",
                          },
                          {
                            label: "Leave",
                            value: item.leave,
                            color: "text-amber-600",
                          },
                          {
                            label: "Half Day",
                            value: item.halfDay,
                            color: "text-blue-700",
                          },
                        ].map((entry) => (
                          <div
                            key={entry.label}
                            className="rounded-xl bg-[#f7f9fc] p-4"
                          >
                            <p className="text-xs text-slate-500">
                              {entry.label}
                            </p>

                            <p
                              className={`mt-2 text-2xl font-bold ${entry.color}`}
                            >
                              {entry.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-400">
        Attendance is automatically saved in this browser.
      </p>
    </div>
  );
}
