
import { useEffect, useMemo, useRef, useState } from "react";
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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select status",
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

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selected = options.find(
    (option) => String(option.value) === String(value)
  );

  return (
    <div ref={dropdownRef} className="w-full min-w-0 max-w-full">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
          statusColors[value] || "bg-white text-[#10264d]"
        }`}
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
          {options.map((option) => {
            const isSelected =
              String(option.value) === String(value);

            return (
              <button
                key={option.value || "not-marked"}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option.label}
                </span>

                {isSelected && (
                  <Check size={16} className="shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="min-w-0 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
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

    return () => {
      window.removeEventListener("focus", refreshStaff);
    };
  }, []);

  const getRecord = (staffId, date = selectedDate) =>
    attendance.find(
      (record) =>
        String(record.staffId) === String(staffId) &&
        record.date === date
    );

  const updateAttendance = (person, updates) => {
    setAttendance((previous) => {
      const index = previous.findIndex(
        (record) =>
          String(record.staffId) === String(person.id) &&
          record.date === selectedDate
      );

      if (index !== -1) {
        return previous.map((record, i) =>
          i === index ? { ...record, ...updates } : record
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

  const monthlySummary = staff.map((person) => {
    const records = attendance.filter(
      (record) =>
        String(record.staffId) === String(person.id) &&
        record.date.startsWith(month)
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
  });

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

  const stats = [
    {
      label: "Total Staff",
      value: staff.length,
      icon: Users,
      color: "text-blue-700",
    },
    {
      label: "Present",
      value: presentCount,
      icon: UserCheck,
      color: "text-green-700",
    },
    {
      label: "Absent",
      value: absentCount,
      icon: UserX,
      color: "text-red-600",
    },
    {
      label: "On Leave",
      value: leaveCount,
      icon: CalendarDays,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* Page Heading */}
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-[#10264d]">
            Staff Attendance
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Daily attendance, staff check-in and monthly reports
          </p>
        </div>

        {/* Date Navigation */}
        <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-[#10264d]">
            Attendance Date
          </p>

          <div className="flex w-full min-w-0 flex-col gap-3">
            <button
              type="button"
              onClick={() => changeDate(-1)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
              Previous Day
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              className={inputStyle}
            />

            <button
              type="button"
              onClick={() => changeDate(1)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
            >
              Next Day
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
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
                  <Icon size={22} className={item.color} />
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

      {/* Main Section */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        {/* Tabs */}
        <div className="mb-6 flex w-full min-w-0 flex-col gap-3 border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "daily"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Daily Attendance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "monthly"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Monthly Report
          </button>
        </div>

        {activeTab === "daily" ? (
          <div className="flex w-full min-w-0 flex-col gap-5">
            {/* Daily Actions */}
            <button
              type="button"
              onClick={markAllPresent}
              disabled={staff.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserCheck size={18} />
              Mark All Present
            </button>

            {/* Search */}
            <div className="w-full min-w-0">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Search Staff
              </p>

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
                  placeholder="Search staff name or role..."
                  className={`${inputStyle} pl-11`}
                />
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-4">
              {filteredStaff.map((person) => {
                const record = getRecord(person.id);

                return (
                  <article
                    key={person.id}
                    className="flex w-full min-w-0 flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                  >
                    {/* Staff Info */}
                    <div className="flex w-full min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Users size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-base font-bold text-[#10264d]">
                          {person.name || "Unnamed Staff"}
                        </h3>

                        <p className="mt-1 break-words text-sm text-slate-500">
                          {person.role || "Staff"}
                        </p>

                        <span
                          className={`mt-3 inline-flex max-w-full rounded-full px-3 py-1 text-xs font-semibold ${
                            statusColors[record?.status] ||
                            "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {record?.status || "Not Marked"}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full min-w-0 flex-col gap-4 border-t border-slate-200 pt-4">
                      {/* Status */}
                      <FormField label="Attendance Status">
                        <CustomDropdown
                          value={record?.status || ""}
                          options={statusOptions}
                          onChange={(value) =>
                            updateAttendance(person, {
                              status: value,
                            })
                          }
                        />
                      </FormField>

                      {/* Check In */}
                      <FormField label="Check In Time">
                        <input
                          type="time"
                          value={record?.checkIn || ""}
                          onChange={(event) =>
                            updateAttendance(person, {
                              checkIn: event.target.value,
                            })
                          }
                          className={inputStyle}
                        />
                      </FormField>

                      {/* Check Out */}
                      <FormField label="Check Out Time">
                        <input
                          type="time"
                          value={record?.checkOut || ""}
                          onChange={(event) =>
                            updateAttendance(person, {
                              checkOut: event.target.value,
                            })
                          }
                          className={inputStyle}
                        />
                      </FormField>

                      {/* Notes */}
                      <FormField label="Attendance Notes">
                        <textarea
                          value={record?.notes || ""}
                          onChange={(event) =>
                            updateAttendance(person, {
                              notes: event.target.value,
                            })
                          }
                          placeholder="Add attendance note..."
                          rows={3}
                          className={`${inputStyle} resize-y`}
                        />
                      </FormField>
                    </div>

                    {/* Actions */}
                    <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          updateAttendance(person, {
                            status: "Present",
                            checkIn: currentTime(),
                          })
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        <UserCheck size={18} />
                        Check In Now
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateAttendance(person, {
                            checkOut: currentTime(),
                          })
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
                      >
                        <Clock3 size={18} />
                        Check Out Now
                      </button>
                    </div>
                  </article>
                );
              })}

              {filteredStaff.length === 0 && (
                <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
                  <Users
                    size={32}
                    className="mb-3 text-slate-300"
                  />

                  <p className="text-sm font-semibold text-slate-600">
                    {staff.length === 0
                      ? "No staff available"
                      : "No matching staff found"}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {staff.length === 0
                      ? "Add staff in Settings first."
                      : "Try another staff name or role."}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Monthly Report */
          <div className="flex w-full min-w-0 flex-col gap-5">
            <div className="flex w-full min-w-0 flex-col gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Monthly Attendance Report
                </h2>

                <p className="mt-2 break-words text-sm text-slate-500">
                  Report Month: {month}
                </p>
              </div>

              <button
                type="button"
                onClick={exportCSV}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-4">
              {monthlySummary.map((item) => (
                <article
                  key={item.person.id}
                  className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                >
                  <div className="flex w-full min-w-0 items-center gap-3 border-b border-slate-200 pb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Users size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {item.person.name || "Unnamed Staff"}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {item.person.role || "Staff"}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full min-w-0 flex-col gap-3">
                    <Detail
                      label="Present Days"
                      value={item.present}
                    />

                    <Detail
                      label="Absent Days"
                      value={item.absent}
                    />

                    <Detail
                      label="Leave Days"
                      value={item.leave}
                    />

                    <Detail
                      label="Half Days"
                      value={item.halfDay}
                    />
                  </div>
                </article>
              ))}

              {monthlySummary.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
                  <CalendarDays
                    size={32}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="text-sm font-medium text-slate-500">
                    No staff available for the report.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <p className="break-words text-xs leading-5 text-slate-400">
        Attendance is automatically saved in this browser.
      </p>
    </div>
  );
}
