// FILE: src/pages/Staff.jsx
// Production-quality Staff Management with Service-Based Role & Department

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
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import { api } from "../api/client";
import { syncStaffSalaryExpenses } from "../services/financialService";

const STAFF_KEY = "studioraw_staff";
const UPDATE_EVENT = "studioraw:data-updated";

export const STAFF_SERVICES = [
  "Wedding Photography",
  "Wedding Videography",
  "Functions We Arrange",
  "Event Management",
  "Customer Gifts",
  "Others",
];

export const SERVICE_SPECIALIZATIONS = {
  "Wedding Photography": [
    "Traditional Photographer",
    "Candid Photographer",
    "Helicam Photographer",
    "Pre-Wedding Photographer",
    "Post-Wedding Photographer",
    "Other",
  ],
  "Wedding Videography": [
    "Traditional Wedding Videographer",
    "Cinematic Wedding Videographer",
    "Traditional + Candid Video",
    "Pre-Wedding Videographer",
    "Post-Wedding Videographer",
    "Drone / Helicam Videographer",
    "Other",
  ],
  "Functions We Arrange": [
    "Engagement",
    "Reception",
    "Wedding",
    "Birthday Function",
    "Baby Shower",
    "Naming Ceremony",
    "Corporate Function",
    "Other Function",
  ],
  "Event Management": [
    "Wedding Event Management",
    "Engagement Event Management",
    "Birthday Event Management",
    "Corporate Event Management",
    "Stage & Decoration",
    "Other Event",
  ],
  "Customer Gifts": [
    "Customized Photo Frame",
    "Album",
    "Mug Printing",
    "Customized Gifts",
    "Return Gifts",
    "Other Gift",
  ],
};

export const isOtherSpecialization = (spec) => {
  return [
    "Other",
    "Other Function",
    "Other Event",
    "Other Gift",
  ].includes(spec);
};

const STATUSES = ["Active", "Inactive", "On Leave"];

const emptyForm = {
  staff_name: "",
  employee_id: "",
  email: "",
  phone: "",
  address: "",
  service: "Wedding Photography",
  specialization: "Candid Photographer",
  custom_service: "",
  custom_specialization: "",
  role: "Candid Photographer",
  department: "Wedding Photography",
  joining_date: new Date().toISOString().slice(0, 10),
  salary: "",
  salary_date: "",
  status: "Active",
  notes: "",
};

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
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error("Unable to read staff data:", error);
    return [];
  }
}

export default function Staff() {
  const [staffList, setStaffList] = useState(readStoredStaff);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
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
      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, { detail: { key: STAFF_KEY, module: "staff" } })
      );
      syncStaffSalaryExpenses();
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
        setStaffList(list);
        saveLocalStaff(list);
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

      const staffService = item.service || item.department || "";
      const staffSpec = item.specialization || item.role || "";

      const matchesSearch =
        !searchText ||
        (item.staff_name || "").toLowerCase().includes(searchText) ||
        (item.employee_id || "").toLowerCase().includes(searchText) ||
        (item.phone || "").toLowerCase().includes(searchText) ||
        (item.email || "").toLowerCase().includes(searchText) ||
        staffService.toLowerCase().includes(searchText) ||
        staffSpec.toLowerCase().includes(searchText);

      let matchesService = true;
      if (serviceFilter !== "All") {
        if (serviceFilter === "Others") {
          matchesService =
            item.service === "Others" ||
            (!STAFF_SERVICES.slice(0, 5).includes(item.service) &&
              !STAFF_SERVICES.slice(0, 5).includes(item.department));
        } else {
          matchesService =
            item.service === serviceFilter ||
            item.department === serviceFilter ||
            (serviceFilter === "Wedding Photography" &&
              (item.department === "Photography" || (item.role || "").toLowerCase().includes("photo"))) ||
            (serviceFilter === "Wedding Videography" &&
              (item.department === "Videography" || (item.role || "").toLowerCase().includes("video")));
        }
      }

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return (
        matchesSearch &&
        matchesService &&
        matchesStatus
      );
    });
  }, [
    staffList,
    search,
    serviceFilter,
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
      service: "Wedding Photography",
      specialization: "Traditional Photographer",
      custom_service: "",
      custom_specialization: "",
    });

    setError("");
    setFormOpen(true);
  };

  const openEdit = (staff) => {
    setEditingStaff(staff);

    // Determine normalized service
    let service = staff.service || "";
    let customService = staff.custom_service || "";
    let specialization = staff.specialization || staff.role || "";
    let customSpecialization = staff.custom_specialization || "";

    if (!service) {
      const dept = String(staff.department || "").toLowerCase();
      const role = String(staff.role || "").toLowerCase();
      if (dept.includes("videography") || role.includes("video") || role.includes("cinema")) {
        service = "Wedding Videography";
      } else if (dept.includes("management") || role.includes("event")) {
        service = "Event Management";
      } else if (
        dept.includes("gift") ||
        dept.includes("post-production") ||
        role.includes("album") ||
        role.includes("designer")
      ) {
        service = "Customer Gifts";
      } else if (role.includes("function") || dept.includes("function")) {
        service = "Functions We Arrange";
      } else if (dept === "other" || dept === "others") {
        service = "Others";
        customService = staff.role || staff.designation || "";
      } else {
        service = "Wedding Photography";
      }
    }

    if (service === "Others") {
      if (!customService) {
        customService = staff.custom_service || staff.role || staff.designation || "";
      }
    } else {
      const allowedSpecs = SERVICE_SPECIALIZATIONS[service] || [];
      if (!allowedSpecs.includes(specialization)) {
        if (specialization) {
          const otherChoice = allowedSpecs.find((s) => s.toLowerCase().startsWith("other")) || "Other";
          customSpecialization = specialization;
          specialization = otherChoice;
        } else {
          specialization = allowedSpecs[0] || "";
        }
      }
    }

    setForm({
      staff_name: staff.staff_name || "",
      employee_id: staff.employee_id || "",
      email: staff.email || "",
      phone: staff.phone || "",
      address: staff.address || "",
      service,
      specialization,
      custom_service: customService,
      custom_specialization: customSpecialization,
      role: specialization || staff.role || "",
      department: service || staff.department || "",
      joining_date: staff.joining_date || new Date().toISOString().slice(0, 10),
      salary: staff.salary ?? "",
      salary_date: staff.salary_date || "",
      status: staff.status || "Active",
      notes: staff.notes || "",
    });

    setError("");
    setFormOpen(true);
  };

  const handleServiceChange = (newService) => {
    const allowedSpecs = SERVICE_SPECIALIZATIONS[newService] || [];
    setForm((prev) => ({
      ...prev,
      service: newService,
      specialization: allowedSpecs[0] || "",
      custom_service: "",
      custom_specialization: "",
    }));
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

    if (form.service === "Others" && !form.custom_service.trim()) {
      setError("Please enter the custom service or designation.");
      return;
    }

    if (
      form.service !== "Others" &&
      isOtherSpecialization(form.specialization) &&
      !form.custom_specialization.trim()
    ) {
      setError("Please enter the custom department or specialization.");
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
      const finalService =
        form.service === "Others"
          ? form.custom_service.trim()
          : form.service;

      const finalSpecialization =
        form.service === "Others"
          ? form.custom_service.trim()
          : isOtherSpecialization(form.specialization)
          ? form.custom_specialization.trim()
          : form.specialization;

      const payload = {
        ...form,
        staff_name: form.staff_name.trim(),
        employee_id: form.employee_id.trim(),
        service: form.service,
        custom_service: form.custom_service.trim(),
        specialization: finalSpecialization,
        custom_specialization: form.custom_specialization.trim(),
        role: finalSpecialization,
        designation: finalSpecialization,
        department: finalService,
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
          String(staff.id) !== String(deleteStaff.id) &&
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
      "Service",
      "Specialization",
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
      `"${(staff.service || staff.department || "").replace(/"/g, '""')}"`,
      `"${(staff.specialization || staff.role || "").replace(/"/g, '""')}"`,
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
            Export CSV
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#10264d] to-[#254f8e] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-95"
          >
            <Plus size={16} />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">Total Team</p>
          <p className="mt-2 text-2xl font-black text-[#10264d]">
            {stats.totalStaff}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            Registered employees
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">Active Staff</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {stats.activeStaff}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600">
            Available on roster
          </p>
        </div>

        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">On Leave</p>
          <p className="mt-2 text-2xl font-black text-amber-500">
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

      {/* SERVICE SUMMARY CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: "Wedding Photography",
            count: staffList.filter(
              (s) =>
                (s.service || s.department) === "Wedding Photography" ||
                s.department === "Photography"
            ).length,
          },
          {
            name: "Wedding Videography",
            count: staffList.filter(
              (s) =>
                (s.service || s.department) === "Wedding Videography" ||
                s.department === "Videography"
            ).length,
          },
          {
            name: "Functions & Events",
            count: staffList.filter((s) =>
              ["Functions We Arrange", "Event Management"].includes(
                s.service || s.department
              )
            ).length,
          },
          {
            name: "Gifts & Others",
            count: staffList.filter(
              (s) =>
                ![
                  "Wedding Photography",
                  "Photography",
                  "Wedding Videography",
                  "Videography",
                  "Functions We Arrange",
                  "Event Management",
                ].includes(s.service || s.department)
            ).length,
          },
        ].map((team) => (
          <button
            key={team.name}
            type="button"
            onClick={() => {
              if (team.name === "Wedding Photography") setServiceFilter("Wedding Photography");
              else if (team.name === "Wedding Videography") setServiceFilter("Wedding Videography");
              else setServiceFilter("All");
            }}
            className="rounded-2xl border border-[#dce7f5] bg-white p-4 text-left shadow-sm transition hover:border-[#9bb9df] hover:bg-[#f8fbff]"
          >
            <p className="text-xs font-bold text-[#647c9d]">{team.name}</p>
            <p className="mt-1 text-2xl font-black text-[#10264d]">{team.count}</p>
            <p className="mt-1 text-[11px] font-semibold text-[#7990af]">
              Team members
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
            placeholder="Search staff by name, employee ID, phone, role or service..."
            className="w-full rounded-xl border border-[#dce7f5] bg-[#f9fbfe] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#10264d] outline-none transition placeholder:text-[#9bb0cc] focus:border-[#244d8b] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#647c9d]">Service:</span>
            <select
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
              className="rounded-xl border border-[#dce7f5] bg-[#f9fbfe] px-3 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#244d8b]"
            >
              <option value="All">All Services</option>
              {STAFF_SERVICES.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
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
              <option value="All">All Status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STAFF TABLE & CARDS */}
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
              {staffList.length === 0 ? "No staff members added yet." : "No Staff Members Found"}
            </h3>

            <p className="mt-1 text-xs text-[#647c9d]">
              {staffList.length === 0
                ? "Add your first team member to get started."
                : "Try clearing filters or add your studio team members."}
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
                        Designation
                      </span>
                      <p className="mt-1 font-bold text-[#10264d]">
                        {staff.specialization || staff.role || "Staff Member"}
                      </p>
                      <p className="text-[11px] text-[#6d84a3]">
                        {staff.service || staff.department || "Wedding Photography"}
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
                    <th className="px-4 py-4">Designation & Service</th>
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
                          {staff.specialization || staff.role || "Staff Member"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[#6d84a3]">
                          {staff.service || staff.department || "Wedding Photography"}
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
                      Register photographers, cinematographers, and studio roles
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

                  {/* SERVICE / DESIGNATION DROPDOWN */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Service / Designation
                    </label>
                    <select
                      value={form.service}
                      onChange={(event) => handleServiceChange(event.target.value)}
                      className={inputClass}
                    >
                      {STAFF_SERVICES.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DYNAMIC DEPARTMENT / SPECIALIZATION OR CUSTOM SERVICE INPUT */}
                  {form.service === "Others" ? (
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                        Enter Service / Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter custom service or designation"
                        value={form.custom_service}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            custom_service: event.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                        Department / Specialization
                      </label>
                      <select
                        value={form.specialization}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            specialization: event.target.value,
                            custom_specialization: "",
                          })
                        }
                        className={inputClass}
                      >
                        {(SERVICE_SPECIALIZATIONS[form.service] || []).map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* CUSTOM SPECIALIZATION TEXT INPUT IF OTHER SELECTED */}
                  {form.service !== "Others" &&
                    isOtherSpecialization(form.specialization) && (
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                          Enter Specialization <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter custom department or specialization"
                          value={form.custom_specialization}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              custom_specialization: event.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </div>
                    )}

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

                  <div className="sm:col-span-2">
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
