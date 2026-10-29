import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
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
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import { api } from "../api/client";

const STATUSES = ["Active", "Inactive"];

const emptyForm = {
  branch_name: "",
  branch_code: "",
  address: "",
  city: "Nagercoil",
  state: "Tamil Nadu",
  pincode: "629001",
  phone: "",
  email: "",
  manager_name: "",
  opening_date: new Date().toISOString().slice(0, 10),
  status: "Active",
  notes: "",
};

const inputClass =
  "block w-full min-w-0 rounded-2xl border border-[#d6e5f7] bg-white px-4 py-3 text-sm font-semibold text-[#10264d] outline-none transition-all duration-200 placeholder:text-[#9aacc1] focus:border-[#244d8b] focus:ring-4 focus:ring-[#e4f0ff]";

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [deleteBranch, setDeleteBranch] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadBranches = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.branches.list();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setError("Unable to load branch records from server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const total = branches.length;
    const active = branches.filter((b) => b.status === "Active").length;
    const inactive = branches.filter((b) => b.status === "Inactive").length;
    const citiesCount = new Set(branches.map((b) => b.city).filter(Boolean)).size;

    return { total, active, inactive, citiesCount };
  }, [branches]);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        !search.trim() ||
        (b.branch_name && b.branch_name.toLowerCase().includes(search.toLowerCase())) ||
        (b.branch_code && b.branch_code.toLowerCase().includes(search.toLowerCase())) ||
        (b.city && b.city.toLowerCase().includes(search.toLowerCase())) ||
        (b.manager_name && b.manager_name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "All" || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  const openAdd = () => {
    setEditingBranch(null);
    const nextCode = `BR-${String(branches.length + 1).padStart(2, "0")}`;
    setForm({ ...emptyForm, branch_code: nextCode });
    setError("");
    setFormOpen(true);
  };

  const openEdit = (branch) => {
    setEditingBranch(branch);
    setForm({
      branch_name: branch.branch_name || "",
      branch_code: branch.branch_code || "",
      address: branch.address || "",
      city: branch.city || "Nagercoil",
      state: branch.state || "Tamil Nadu",
      pincode: branch.pincode || "",
      phone: branch.phone || "",
      email: branch.email || "",
      manager_name: branch.manager_name || "",
      opening_date: branch.opening_date || new Date().toISOString().slice(0, 10),
      status: branch.status || "Active",
      notes: branch.notes || "",
    });
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.branch_name.trim()) {
      setError("Branch name is required.");
      return;
    }
    if (!form.branch_code.trim()) {
      setError("Branch code is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        opening_date: form.opening_date || null,
      };

      if (editingBranch) {
        await api.branches.update(editingBranch.id, payload);
        setToast("Branch updated successfully.");
      } else {
        await api.branches.create(payload);
        setToast("Branch added successfully.");
      }

      setFormOpen(false);
      loadBranches();
    } catch (err) {
      setError(err.message || "Failed to save branch.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteBranch) return;
    try {
      await api.branches.delete(deleteBranch.id);
      setToast("Branch record removed.");
      setDeleteBranch(null);
      loadBranches();
    } catch (err) {
      alert("Failed to delete branch: " + err.message);
    }
  };

  const exportCsv = () => {
    if (!branches.length) return;
    const headers = [
      "ID",
      "Branch Code",
      "Branch Name",
      "City",
      "State",
      "Phone",
      "Email",
      "Manager Name",
      "Opening Date",
      "Status",
    ];
    const rows = branches.map((b) => [
      b.id,
      b.branch_code,
      `"${(b.branch_name || "").replace(/"/g, '""')}"`,
      `"${(b.city || "").replace(/"/g, '""')}"`,
      `"${(b.state || "").replace(/"/g, '""')}"`,
      b.phone || "",
      b.email || "",
      `"${(b.manager_name || "").replace(/"/g, '""')}"`,
      b.opening_date || "",
      b.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `studio_raw_branches_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] px-4 py-6 sm:px-8 sm:py-8 font-sans text-[#10264d]">
      {/* HEADER SECTION */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10264d] to-[#254f8e] text-white shadow-md">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#10264d] sm:text-2xl">
                Multi-Branch Management
              </h1>
              <p className="text-xs font-semibold text-[#5c7292]">
                Manage studio branches, satellite offices, and regional locations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadBranches(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-[#d6e5f7] bg-white px-3.5 py-2.5 text-xs font-bold text-[#10264d] shadow-sm transition hover:bg-[#edf5ff]"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-[#244d8b]" : ""} />
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
            Add Branch
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">Total Branches</p>
          <p className="mt-2 text-2xl font-black text-[#10264d]">{stats.total}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Locations in network</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-emerald-800">Active Branches</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{stats.active}</p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600">Open & accepting bookings</p>
        </div>

        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">Inactive / Planned</p>
          <p className="mt-2 text-2xl font-black text-[#526b8b]">{stats.inactive}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Temporary closed or planned</p>
        </div>

        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">Operating Cities</p>
          <p className="mt-2 text-2xl font-black text-[#254f8e]">{stats.citiesCount}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Regional coverage area</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8299b7]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches by name, code, city, manager..."
            className="w-full rounded-xl border border-[#dce7f5] bg-[#f9fbfe] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#10264d] outline-none transition placeholder:text-[#9bb0cc] focus:border-[#244d8b] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#647c9d]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#dce7f5] bg-[#f9fbfe] px-3 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#244d8b]"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#dce7f5] bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2edf9] border-t-[#10264d]" />
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#244d8b]">
              <Building2 size={28} />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-[#10264d]">No Branches Found</h3>
            <p className="mt-1 text-xs text-[#647c9d]">
              {search || statusFilter !== "All"
                ? "Try clearing your search query or filter."
                : "Add your main studio branch and satellite locations."}
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#10264d] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#204678]"
            >
              <Plus size={15} /> Add Branch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e7eef7] bg-[#f8fbff] text-[11px] font-extrabold uppercase tracking-wider text-[#526b8b]">
                  <th className="px-5 py-4">Branch Details</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Branch Manager</th>
                  <th className="px-4 py-4">Contact</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Opening Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3fa]">
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="transition hover:bg-[#f6faff]">
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-[#10264d]">{branch.branch_name}</div>
                      <div className="mt-0.5 font-mono text-[11px] font-semibold text-[#6d84a3]">
                        Code: {branch.branch_code}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#10264d]">
                        <MapPin size={13} className="text-[#244d8b]" />
                        {branch.city}, {branch.state}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#6d84a3]">{branch.address || "—"}</div>
                    </td>

                    <td className="px-4 py-4 font-bold text-[#10264d]">
                      {branch.manager_name ? (
                        <span className="inline-flex items-center gap-1.5">
                          <User size={13} className="text-[#244d8b]" />
                          {branch.manager_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-[#10264d]">
                        <Phone size={13} className="text-[#244d8b]" />
                        {branch.phone || "—"}
                      </div>
                      {branch.email && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6d84a3]">
                          <Mail size={12} />
                          {branch.email}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                          branch.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {branch.status || "Active"}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-semibold text-[#526b8b]">
                      {branch.opening_date || "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(branch)}
                          className="rounded-lg p-1.5 text-[#244d8b] transition hover:bg-[#edf5ff]"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteBranch(branch)}
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
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#10264d]">
                      {editingBranch ? "Edit Branch" : "Add Branch"}
                    </h2>
                    <p className="text-xs font-semibold text-[#6680a1]">
                      Register studio branches and contact info
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

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
                {error && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Studio Raw Main Branch"
                      value={form.branch_name}
                      onChange={(e) => setForm({ ...form, branch_name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Branch Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BR-01"
                      value={form.branch_code}
                      onChange={(e) => setForm({ ...form, branch_code: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Branch Manager</label>
                    <input
                      type="text"
                      placeholder="e.g. Prathiksha / Manager"
                      value={form.manager_name}
                      onChange={(e) => setForm({ ...form, manager_name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Email</label>
                    <input
                      type="email"
                      placeholder="e.g. nagercoil@studiorawpicturez.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={inputClass}
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Nagercoil"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Tamil Nadu"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">PIN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 629001"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Opening Date</label>
                    <input
                      type="date"
                      value={form.opening_date}
                      onChange={(e) => setForm({ ...form, opening_date: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Road, Near Tower Clock"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Studio facilities, floor area, parking details..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                    {saving ? "Saving..." : editingBranch ? "Update Branch" : "Add Branch"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteBranch &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a34]/65 p-3 backdrop-blur-[4px]">
            <div className="w-full max-w-sm rounded-[24px] border border-[#dbe8f7] bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 size={26} />
              </div>
              <h3 className="mt-4 text-base font-black text-[#10264d]">Delete Branch?</h3>
              <p className="mt-2 text-xs font-medium text-[#647c9d]">
                Are you sure you want to delete <strong>{deleteBranch.branch_name}</strong>? This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteBranch(null)}
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
