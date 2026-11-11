// FILE: src/pages/Staff.jsx
// Replace the entire existing file with this code.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import { api } from "../api/client";

const STAFF_KEY = "studioraw_staff";
const SEED_KEY = "studioraw_staff_seed_v6_exact3";

const ROLES = [
  "All",
  "Senior Photographer",
  "Photographer",
  "Candid Photographer",
  "Traditional Photographer",
  "Pre-Wedding Photographer",
  "Cinematographer",
  "Videographer",
  "Drone Pilot",
  "Video Editor",
  "Lead Editor",
  "Album Designer",
  "Graphic Designer",
  "Studio Manager",
  "Lighting Technician",
  "Production Assistant",
  "Customer Support",
  "Makeup Artist",
  "Event Coordinator",
];

const DEPARTMENTS = [
  "All",
  "Photography",
  "Videography",
  "Post-Production",
  "Management",
  "Operations",
  "Customer Support",
];

const STATUSES = ["Active", "Inactive", "On Leave"];

const emptyForm = {
  staff_name: "",
  employee_id: "",
  email: "",
  phone: "",
  address: "",
  role: "Photographer",
  department: "Photography",
  joining_date: new Date().toISOString().slice(0, 10),
  salary: "",
  salary_date: "",
  status: "Active",
  notes: "",
};

// Exactly 3 staff members for Studio Raw ERP, each with fixed basic salary of ₹10,000/month (Total ₹30,000).
const DEFAULT_STAFF = [
  {
    id: 1,
    staff_name: "Vignesh Sundaram",
    employee_id: "EMP-2026-001",
    role: "Photographer",
    department: "Photography",
    phone: "9988776655",
    email: "vignesh.s@studioraw.com",
    address: "12 Cross Street, RS Puram, Coimbatore, Tamil Nadu",
    joining_date: "2023-08-01",
    salary: 10000,
    salary_date: "01",
    status: "Active",
    notes: "Lead wedding and portrait photographer specializing in candid moments.",
  },
  {
    id: 2,
    staff_name: "Santhosh Kumar",
    employee_id: "EMP-2026-002",
    role: "Cinematographer",
    department: "Videography",
    phone: "9876501234",
    email: "santhosh.k@studioraw.com",
    address: "88 Main Bazaar, Nagercoil, Tamil Nadu",
    joining_date: "2022-11-10",
    salary: 10000,
    salary_date: "01",
    status: "Active",
    notes: "Expert gimbal operator and cinematic Sony FX3/FX6 visualizer.",
  },
  {
    id: 3,
    staff_name: "Priya Natarajan",
    employee_id: "EMP-2026-003",
    role: "Photo Editor",
    department: "Post-Production",
    phone: "9765432109",
    email: "priya.n@studioraw.com",
    address: "15 Temple View Street, Madurai, Tamil Nadu",
    joining_date: "2023-01-20",
    salary: 10000,
    salary_date: "01",
    status: "Active",
    notes: "Lead colorist and retoucher with DaVinci Resolve and Lightroom Mastery.",
  },
];

const inputClass =
  "block w-full min-w-0 rounded-2xl border border-[#d6e5f7] bg-white px-4 py-3 text-sm font-semibold text-[#10264d] outline-none transition-all duration-200 placeholder:text-[#9aacc1] focus:border-[#244d8b] focus:ring-4 focus:ring-[#e4f0ff]";

function money(amount) {
  const num = Number(amount) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

function readStoredStaff() {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    const stored = raw ? JSON.parse(raw) : [];

    const isSeeded = localStorage.getItem(SEED_KEY);
    const validIds = new Set(["EMP-2026-001", "EMP-2026-002", "EMP-2026-003"]);

    // If not seeded with exact 3 or if stored has more/less than 3, strictly enforce exactly the 3 staff
    if (
      isSeeded !== "true" ||
      !Array.isArray(stored) ||
      stored.length !== 3 ||
      stored.some((person) => !validIds.has(person.employee_id))
    ) {
      localStorage.setItem(STAFF_KEY, JSON.stringify(DEFAULT_STAFF));
      localStorage.setItem(SEED_KEY, "true");
      return DEFAULT_STAFF;
    }

    return stored;
  } catch (error) {
    console.error("Unable to read staff data:", error);
    return DEFAULT_STAFF;
  }
}

function mergeStaffLists(primary, secondary) {
  const result = [...primary];
  const existingIds = new Set(
    result.map((person) => person.employee_id).filter(Boolean)
  );

  secondary.forEach((person) => {
    if (
      person.employee_id &&
      !existingIds.has(person.employee_id)
    ) {
      result.push(person);
      existingIds.add(person.employee_id);
    }
  });

  return result;
}

export default function Staff() {
  const [staffList, setStaffList] = useState(readStoredStaff);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteStaff, setDeleteStaff] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const saveLocalStaff = (list) => {
    try {
      localStorage.setItem(STAFF_KEY, JSON.stringify(list));
    } catch (err) {
      console.error("Unable to save staff locally:", err);
    }
  };

  const loadStaff = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await api.staff.list();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : null;

      if (list) {
        // Enforce the 3 demo staff members
        const validIds = new Set(["EMP-2026-001", "EMP-2026-002", "EMP-2026-003"]);
        const validStaff = list.filter((p) => validIds.has(p.employee_id));
        const finalStaff = validStaff.length === 3 ? validStaff : DEFAULT_STAFF;
        setStaffList(finalStaff);
        saveLocalStaff(finalStaff);
      }
    } catch (err) {
      console.warn("Backend staff API notice:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const totalStaff = staffList.length;

    const activeStaff = staffList.filter(
      (staff) => staff.status === "Active"
    ).length;

    const onLeaveStaff = staffList.filter(
      (staff) => staff.status === "On Leave"
    ).length;

    const totalPayroll = staffList
      .filter((staff) => staff.status === "Active")
      .reduce(
        (sum, staff) => sum + (Number(staff.salary) || 0),
        0
      );

    return {
      totalStaff,
      activeStaff,
      onLeaveStaff,
      totalPayroll,
    };
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        (item.staff_name || "").toLowerCase().includes(searchText) ||
        (item.employee_id || "").toLowerCase().includes(searchText) ||
        (item.phone || "").toLowerCase().includes(searchText) ||
        (item.email || "").toLowerCase().includes(searchText) ||
        (item.role || "").toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "All" || item.role === roleFilter;

      const matchesDept =
        departmentFilter === "All" ||
        item.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesDept &&
        matchesStatus
      );
    });
  }, [
    staffList,
    search,
    roleFilter,
    departmentFilter,
    statusFilter,
  ]);

  const openAdd = () => {
    setEditingStaff(null);

    const nextId = `EMP-${new Date().getFullYear()}-${String(
      staffList.length + 1
    ).padStart(3, "0")}`;

    setForm({
      ...emptyForm,
      employee_id: nextId,
    });

    setError("");
    setFormOpen(true);
  };

  const openEdit = (staff) => {
    setEditingStaff(staff);

    setForm({
      staff_name: staff.staff_name || "",
      employee_id: staff.employee_id || "",
      email: staff.email || "",
      phone: staff.phone || "",
      address: staff.address || "",
      role: staff.role || "Photographer",
      department: staff.department || "Photography",
      joining_date:
        staff.joining_date || new Date().toISOString().slice(0, 10),
      salary: staff.salary ?? "",
      salary_date: staff.salary_date || "",
      status: staff.status || "Active",
      notes: staff.notes || "",
    });

    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.staff_name.trim()) {
      setError("Staff name is required.");
      return;
    }

    if (!form.employee_id.trim()) {
      setError("Employee ID is required.");
      return;
    }

    const duplicateId = staffList.some(
      (staff) =>
        staff.employee_id?.toLowerCase() ===
          form.employee_id.trim().toLowerCase() &&
        String(staff.id) !== String(editingStaff?.id)
    );

    if (duplicateId) {
      setError("This Employee ID already exists. Please use another ID.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        staff_name: form.staff_name.trim(),
        employee_id: form.employee_id.trim(),
        salary: parseFloat(form.salary) || 0,
        joining_date: form.joining_date || null,
        salary_date: form.salary_date || null,
      };

      if (editingStaff) {
        try {
          if (editingStaff.id) {
            await api.staff.update(editingStaff.id, payload);
          }
        } catch (apiErr) {
          console.warn("Backend staff update notice:", apiErr.message);
        }

        setStaffList((previous) => {
          const next = previous.map((staff) =>
            String(staff.id) === String(editingStaff.id)
              ? { ...staff, ...payload, id: staff.id }
              : staff
          );

          saveLocalStaff(next);
          return next;
        });

        setToast("Staff member updated successfully.");
      } else {
        let assignedId = `EMP-${Date.now()}`;

        try {
          const response = await api.staff.create(payload);

          if (response?.id) {
            assignedId = response.id;
          } else if (response?.data?.id) {
            assignedId = response.data.id;
          }
        } catch (apiErr) {
          console.warn("Backend staff create notice:", apiErr.message);
        }

        setStaffList((previous) => {
          const next = [
            { ...payload, id: assignedId },
            ...previous,
          ];

          saveLocalStaff(next);
          return next;
        });

        setToast("Staff member added successfully.");
      }

      setFormOpen(false);
      setEditingStaff(null);
    } catch (err) {
      setError(err.message || "Failed to save staff record.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteStaff) return;

    try {
      if (deleteStaff.id) {
        await api.staff.delete(deleteStaff.id);
      }
    } catch (err) {
      console.warn("Backend delete staff notice:", err.message);
    }

    setStaffList((previous) => {
      const next = previous.filter(
        (staff) =>
          String(staff.id) !== String(deleteStaff.id) ||
          staff.employee_id !== deleteStaff.employee_id
      );

      saveLocalStaff(next);
      return next;
    });

    setToast("Staff member deleted.");
    setDeleteStaff(null);
  };

  const exportCsv = () => {
    if (!staffList.length) return;

    const headers = [
      "ID",
      "Employee ID",
      "Staff Name",
      "Role",
      "Department",
      "Phone",
      "Email",
      "Joining Date",
      "Monthly Salary",
      "Salary Date",
      "Status",
    ];

    const rows = staffList.map((staff) => [
      staff.id || "",
      staff.employee_id || "",
      `"${(staff.staff_name || "").replace(/"/g, '""')}"`,
      `"${(staff.role || "").replace(/"/g, '""')}"`,
      `"${(staff.department || "").replace(/"/g, '""')}"`,
      staff.phone || "",
      staff.email || "",
      staff.joining_date || "",
      staff.salary ?? "",
      staff.salary_date || "",
      staff.status || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `studio_raw_staff_${new Date().toISOString().slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] px-4 py-6 font-sans text-[#10264d] sm:px-8 sm:py-8">
      {/* HEADER SECTION */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10264d] to-[#254f8e] text-white shadow-md">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#10264d] sm:text-2xl">
                Staff Management
              </h1>
              <p className="text-xs font-semibold text-[#5c7292]">
                Manage photographers, cinematographers, editors, and studio crew
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadStaff(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-[#d6e5f7] bg-white px-3.5 py-2.5 text-xs font-bold text-[#10264d] shadow-sm transition hover:bg-[#edf5ff]"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin text-[#244d8b]" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-[#d6e5f7] bg-white px-3.5 py-2.5 text-xs font-bold text-[#10264d] shadow-sm transition hover:bg-[#edf5ff]"
          >
            <Download size={15} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#10264d] to-[#254f8e] px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:opacity-95"
          >
            <Plus size={16} />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">
            Total Crew Members
          </p>
          <p className="mt-2 text-2xl font-black text-[#10264d]">
            {stats.totalStaff}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            Total registered staff
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-emerald-800">
            Active Working Staff
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-700">
            {stats.activeStaff}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600">
            On duty & available for events
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-amber-800">
            On Leave / Vacation
          </p>
          <p className="mt-2 text-2xl font-black text-amber-700">
            {stats.onLeaveStaff}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-amber-600">
            Temporary leave status
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">
            Monthly Active Payroll
          </p>
          <p className="mt-2 text-xl font-black text-[#254f8e]">
            {money(stats.totalPayroll)}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            Active monthly compensation
          </p>
        </div>
      </div>

      {/* SERVICE TEAM SUMMARY */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: "Photography",
            count: staffList.filter(
              (staff) => staff.department === "Photography"
            ).length,
          },
          {
            name: "Videography",
            count: staffList.filter(
              (staff) => staff.department === "Videography"
            ).length,
          },
          {
            name: "Post-Production",
            count: staffList.filter(
              (staff) => staff.department === "Post-Production"
            ).length,
          },
          {
            name: "Other Teams",
            count: staffList.filter(
              (staff) =>
                ![
                  "Photography",
                  "Videography",
                  "Post-Production",
                ].includes(staff.department)
            ).length,
          },
        ].map((team) => (
          <button
            key={team.name}
            type="button"
            onClick={() => setDepartmentFilter(team.name === "Other Teams" ? "All" : team.name)}
            className="rounded-2xl border border-[#dce7f5] bg-white p-4 text-left shadow-sm transition hover:border-[#9bb9df] hover:bg-[#f8fbff]"
          >
            <p className="text-xs font-bold text-[#647c9d]">
              {team.name}
            </p>
            <p className="mt-1 text-2xl font-black text-[#10264d]">
              {team.count}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-[#7990af]">
              Registered team members
            </p>
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8299b7]"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search staff by name, employee ID, phone, or email..."
            className="w-full rounded-xl border border-[#dce7f5] bg-[#f9fbfe] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#10264d] outline-none transition placeholder:text-[#9bb0cc] focus:border-[#244d8b] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#647c9d]">Role:</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-[#dce7f5] bg-[#f9fbfe] px-3 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#244d8b]"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#647c9d]">Dept:</span>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="rounded-xl border border-[#dce7f5] bg-[#f9fbfe] px-3 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#244d8b]"
            >
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#647c9d]">Status:</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-[#dce7f5] bg-[#f9fbfe] px-3 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#244d8b]"
            >
              <option value="All">All</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STAFF TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#dce7f5] bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2edf9] border-t-[#10264d]" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#244d8b]">
              <Users size={28} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#10264d]">
              No Staff Members Found
            </h3>

            <p className="mt-1 text-xs text-[#647c9d]">
              Try clearing filters or add your studio team members.
            </p>

            <button
              type="button"
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#10264d] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#204678]"
            >
              <Plus size={15} />
              Add Staff Member
            </button>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS */}
            <div className="grid grid-cols-1 gap-3.5 p-3.5 sm:p-5 lg:hidden">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id ?? staff.employee_id}
                  className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[#edf3fa] pb-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-extrabold text-[#10264d]">
                        {staff.staff_name}
                      </h3>
                      <p className="mt-0.5 font-mono text-xs font-semibold text-[#6d84a3]">
                        ID: {staff.employee_id}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                        staff.status === "Active"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : staff.status === "On Leave"
                          ? "border border-amber-200 bg-amber-50 text-amber-700"
                          : "border border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {staff.status || "Active"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-[#f8fbff] p-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7990af]">
                        Role
                      </span>
                      <p className="mt-1 font-bold text-[#10264d]">
                        {staff.role || "Photographer"}
                      </p>
                      <p className="text-[11px] text-[#6d84a3]">
                        {staff.department || "Photography"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#f8fbff] p-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7990af]">
                        Monthly Salary
                      </span>
                      <p className="mt-1 font-black text-[#10264d]">
                        {money(staff.salary)}
                      </p>
                      <p className="text-[11px] text-[#6d84a3]">
                        Joined: {staff.joining_date || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf3fa] pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {staff.phone && (
                        <a
                          href={`tel:${staff.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#d6e5f7] bg-[#f0f6ff] px-3 py-1.5 text-xs font-bold text-[#1a4a88]"
                        >
                          <Phone size={13} />
                          {staff.phone}
                        </a>
                      )}

                      {staff.email && (
                        <a
                          href={`mailto:${staff.email}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          <Mail size={12} />
                          Email
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(staff)}
                        className="inline-flex items-center gap-1 rounded-xl border border-[#d6e5f7] bg-white px-3 py-1.5 text-xs font-bold text-[#244d8b] shadow-sm hover:bg-[#edf5ff]"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteStaff(staff)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e7eef7] bg-[#f8fbff] text-[11px] font-extrabold uppercase tracking-wider text-[#526b8b]">
                    <th className="px-5 py-4">Staff Member</th>
                    <th className="px-4 py-4">Role & Dept</th>
                    <th className="px-4 py-4">Contact</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Monthly Salary</th>
                    <th className="px-4 py-4">Joining Date</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf3fa]">
                  {filteredStaff.map((staff) => (
                    <tr
                      key={staff.id ?? staff.employee_id}
                      className="transition hover:bg-[#f6faff]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-[#10264d]">
                          {staff.staff_name}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] font-semibold text-[#6d84a3]">
                          ID: {staff.employee_id}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-extrabold text-[#10264d]">
                          {staff.role || "Photographer"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#6d84a3]">
                          {staff.department || "Photography"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-[#10264d]">
                          <Phone size={13} className="text-[#244d8b]" />
                          {staff.phone || "—"}
                        </div>

                        {staff.email && (
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6d84a3]">
                            <Mail size={12} />
                            {staff.email}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${
                            staff.status === "Active"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : staff.status === "On Leave"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {staff.status || "Active"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right font-extrabold text-[#10264d]">
                        {money(staff.salary)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-[#526b8b]">
                        {staff.joining_date || "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(staff)}
                            className="rounded-lg p-1.5 text-[#244d8b] transition hover:bg-[#edf5ff]"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteStaff(staff)}
                            className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {formOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a34]/65 p-3 backdrop-blur-[4px] sm:p-5">
            <div
              role="dialog"
              aria-modal="true"
              className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] border border-[#dbe8f7] bg-white shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#e5eef7] bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#244d8b]">
                    <Users size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-[#10264d]">
                      {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
                    </h2>
                    <p className="text-xs font-semibold text-[#6680a1]">
                      Register photographers, editors, and studio roles
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl bg-[#f0f5fc] p-2 text-[#567396] hover:bg-[#e4effc]"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6"
              >
                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arun Kumar"
                      value={form.staff_name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          staff_name: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-2026-019"
                      value={form.employee_id}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          employee_id: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Role / Designation
                    </label>
                    <select
                      value={form.role}
                      onChange={(event) =>
                        setForm({ ...form, role: event.target.value })
                      }
                      className={inputClass}
                    >
                      {ROLES.filter((role) => role !== "All").map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Department
                    </label>
                    <select
                      value={form.department}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          department: event.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      {DEPARTMENTS.filter(
                        (department) => department !== "All"
                      ).map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. arun@studiorawpicturez.com"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.salary}
                      onChange={(event) =>
                        setForm({ ...form, salary: event.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Salary Date
                    </label>
                    <input
                      type="date"
                      value={form.salary_date}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          salary_date: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({ ...form, status: event.target.value })
                      }
                      className={inputClass}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={form.joining_date}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          joining_date: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nagercoil, Tamil Nadu"
                      value={form.address}
                      onChange={(event) =>
                        setForm({ ...form, address: event.target.value })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Notes & Skills
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specialized in candid photography, Sony FX3 cinema line..."
                      value={form.notes}
                      onChange={(event) =>
                        setForm({ ...form, notes: event.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-end gap-3 border-t border-[#e5eef7] pt-5">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#10264d] to-[#254f8e] px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                  >
                    <Save size={15} />
                    {saving
                      ? "Saving..."
                      : editingStaff
                      ? "Update Staff"
                      : "Add Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteStaff &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a34]/65 p-3 backdrop-blur-[4px]">
            <div className="w-full max-w-sm rounded-[24px] border border-[#dbe8f7] bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 size={26} />
              </div>

              <h3 className="mt-4 text-base font-black text-[#10264d]">
                Delete Staff Member?
              </h3>

              <p className="mt-2 text-xs font-medium text-[#647c9d]">
                Are you sure you want to remove{" "}
                <strong>{deleteStaff.staff_name}</strong>? This action cannot
                be undone.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteStaff(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-extrabold text-emerald-800 shadow-xl">
          <CheckCircle2 size={17} className="text-emerald-600" />
          {toast}
        </div>
      )}
    </div>
  );
}