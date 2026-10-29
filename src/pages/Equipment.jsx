import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Wrench,
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
  Camera,
  Calendar,
  User,
  ShieldAlert,
} from "lucide-react";
import { api } from "../api/client";

const TYPES = [
  "All",
  "Camera Body",
  "Lens",
  "Drone",
  "Gimbal & Stabilizer",
  "Lighting & Strobe",
  "Audio & Wireless Mic",
  "Tripod & Monopod",
  "Studio Backdrop & Stand",
  "Battery & Charger",
  "Other",
];

const STATUSES = ["Available", "In Use", "Maintenance", "Damaged", "Retired"];

const emptyForm = {
  equipment_name: "",
  equipment_type: "Camera Body",
  brand: "Sony",
  model_number: "",
  serial_number: "",
  purchase_date: new Date().toISOString().slice(0, 10),
  purchase_amount: "",
  assigned_to: "",
  location: "Main Studio Storage",
  next_maintenance_date: "",
  status: "Available",
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

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [deleteEquipment, setDeleteEquipment] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadEquipment = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.equipment.list();
      setEquipmentList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
      setError("Unable to load equipment list from server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const totalCount = equipmentList.length;
    const availableCount = equipmentList.filter((e) => e.status === "Available").length;
    const inUseCount = equipmentList.filter((e) => e.status === "In Use").length;
    const maintenanceCount = equipmentList.filter(
      (e) => e.status === "Maintenance" || e.status === "Damaged"
    ).length;
    const totalAssetValue = equipmentList.reduce(
      (sum, e) => sum + (Number(e.purchase_amount) || 0),
      0
    );

    return { totalCount, availableCount, inUseCount, maintenanceCount, totalAssetValue };
  }, [equipmentList]);

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        (item.equipment_name && item.equipment_name.toLowerCase().includes(search.toLowerCase())) ||
        (item.brand && item.brand.toLowerCase().includes(search.toLowerCase())) ||
        (item.serial_number && item.serial_number.toLowerCase().includes(search.toLowerCase())) ||
        (item.assigned_to && item.assigned_to.toLowerCase().includes(search.toLowerCase()));

      const matchesType = typeFilter === "All" || item.equipment_type === typeFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [equipmentList, search, typeFilter, statusFilter]);

  const openAdd = () => {
    setEditingEquipment(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingEquipment(item);
    setForm({
      equipment_name: item.equipment_name || "",
      equipment_type: item.equipment_type || "Camera Body",
      brand: item.brand || "Sony",
      model_number: item.model_number || "",
      serial_number: item.serial_number || "",
      purchase_date: item.purchase_date || new Date().toISOString().slice(0, 10),
      purchase_amount: item.purchase_amount || "",
      assigned_to: item.assigned_to || "",
      location: item.location || "Main Studio Storage",
      next_maintenance_date: item.next_maintenance_date || "",
      status: item.status || "Available",
      notes: item.notes || "",
    });
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.equipment_name.trim()) {
      setError("Equipment name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        purchase_amount: parseFloat(form.purchase_amount) || 0,
        next_maintenance_date: form.next_maintenance_date || null,
        purchase_date: form.purchase_date || null,
      };

      if (editingEquipment) {
        await api.equipment.update(editingEquipment.id, payload);
        setToast("Equipment updated successfully.");
      } else {
        await api.equipment.create(payload);
        setToast("Equipment added successfully.");
      }

      setFormOpen(false);
      loadEquipment();
    } catch (err) {
      setError(err.message || "Failed to save equipment.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteEquipment) return;
    try {
      await api.equipment.delete(deleteEquipment.id);
      setToast("Equipment record removed.");
      setDeleteEquipment(null);
      loadEquipment();
    } catch (err) {
      alert("Failed to delete equipment: " + err.message);
    }
  };

  const exportCsv = () => {
    if (!equipmentList.length) return;
    const headers = [
      "ID",
      "Equipment Name",
      "Type",
      "Brand",
      "Model",
      "Serial Number",
      "Purchase Date",
      "Purchase Cost",
      "Assigned To",
      "Location",
      "Next Maintenance",
      "Status",
    ];
    const rows = equipmentList.map((e) => [
      e.id,
      `"${(e.equipment_name || "").replace(/"/g, '""')}"`,
      `"${(e.equipment_type || "").replace(/"/g, '""')}"`,
      `"${(e.brand || "").replace(/"/g, '""')}"`,
      `"${(e.model_number || "").replace(/"/g, '""')}"`,
      e.serial_number || "",
      e.purchase_date || "",
      e.purchase_amount,
      `"${(e.assigned_to || "").replace(/"/g, '""')}"`,
      `"${(e.location || "").replace(/"/g, '""')}"`,
      e.next_maintenance_date || "",
      e.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `studio_raw_equipment_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <Wrench size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#10264d] sm:text-2xl">
                Equipment Management
              </h1>
              <p className="text-xs font-semibold text-[#5c7292]">
                Track camera bodies, cinematic lenses, drones, lights, and maintenance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadEquipment(true)}
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
            Add Equipment
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">Total Gear Assets</p>
          <p className="mt-2 text-2xl font-black text-[#10264d]">{stats.totalCount}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Cameras, lenses & drones</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-emerald-800">Available in Studio</p>
          <p className="mt-2 text-2xl font-black text-emerald-700">{stats.availableCount}</p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600">Ready for booking shoots</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-blue-800">Currently In Use</p>
          <p className="mt-2 text-2xl font-black text-[#254f8e]">{stats.inUseCount}</p>
          <p className="mt-1 text-[11px] font-semibold text-blue-600">Assigned to ongoing events</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-amber-800">Under Maintenance</p>
          <p className="mt-2 text-2xl font-black text-amber-700">{stats.maintenanceCount}</p>
          <p className="mt-1 text-[11px] font-semibold text-amber-600">Service or repair required</p>
        </div>

        <div className="col-span-2 rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm lg:col-span-1">
          <p className="text-xs font-bold text-[#647c9d]">Total Asset Value</p>
          <p className="mt-2 text-xl font-black text-emerald-700">{money(stats.totalAssetValue)}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Total gear capital</p>
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
            placeholder="Search gear by name, brand, serial number, assigned crew..."
            className="w-full rounded-xl border border-[#dce7f5] bg-[#f9fbfe] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#10264d] outline-none transition placeholder:text-[#9bb0cc] focus:border-[#244d8b] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#647c9d]">Gear Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-[#dce7f5] bg-[#f9fbfe] px-3 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#244d8b]"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
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
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#dce7f5] bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e2edf9] border-t-[#10264d]" />
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#244d8b]">
              <Wrench size={28} />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-[#10264d]">No Equipment Found</h3>
            <p className="mt-1 text-xs text-[#647c9d]">
              {search || typeFilter !== "All" || statusFilter !== "All"
                ? "Try adjusting your search criteria."
                : "Register cameras, drones, and lighting to track gear custody and maintenance."}
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#10264d] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#204678]"
            >
              <Plus size={15} /> Add Equipment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e7eef7] bg-[#f8fbff] text-[11px] font-extrabold uppercase tracking-wider text-[#526b8b]">
                  <th className="px-5 py-4">Equipment Details</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Serial Number</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Assigned To</th>
                  <th className="px-4 py-4 text-right">Asset Cost</th>
                  <th className="px-4 py-4">Next Maintenance</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3fa]">
                {filteredEquipment.map((item) => (
                  <tr key={item.id} className="transition hover:bg-[#f6faff]">
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-[#10264d]">{item.equipment_name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#6d84a3]">
                        <span className="font-bold text-[#24508e]">{item.brand}</span>
                        {item.model_number && <span>· Model: {item.model_number}</span>}
                        {item.location && <span>· Loc: {item.location}</span>}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-block rounded-lg bg-[#eef4fd] px-2.5 py-1 text-[11px] font-bold text-[#24508e]">
                        {item.equipment_type || "General"}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-mono font-bold text-[#355275]">
                      {item.serial_number || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                          item.status === "Available"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "In Use"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : item.status === "Maintenance" || item.status === "Damaged"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.status || "Available"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {item.assigned_to ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#10264d]">
                          <User size={13} className="text-[#244d8b]" />
                          {item.assigned_to}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right font-bold text-[#10264d]">
                      {money(item.purchase_amount)}
                    </td>

                    <td className="px-4 py-4 font-semibold text-[#526b8b]">
                      {item.next_maintenance_date || "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-1.5 text-[#244d8b] transition hover:bg-[#edf5ff]"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteEquipment(item)}
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
                    <Wrench size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#10264d]">
                      {editingEquipment ? "Edit Equipment" : "Add Equipment"}
                    </h2>
                    <p className="text-xs font-semibold text-[#6680a1]">
                      Register cameras, lenses, drones, and equipment specs
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
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sony Alpha 7 IV Mirrorless Camera"
                      value={form.equipment_name}
                      onChange={(e) => setForm({ ...form, equipment_name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Equipment Type</label>
                    <select
                      value={form.equipment_type}
                      onChange={(e) => setForm({ ...form, equipment_type: e.target.value })}
                      className={inputClass}
                    >
                      {TYPES.filter((t) => t !== "All").map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Brand / Manufacturer</label>
                    <input
                      type="text"
                      placeholder="e.g. Sony, Canon, DJI, Godox"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Model Number</label>
                    <input
                      type="text"
                      placeholder="e.g. ILCE-7M4"
                      value={form.model_number}
                      onChange={(e) => setForm({ ...form, model_number: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Serial Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SONY-9843217"
                      value={form.serial_number}
                      onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
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
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Assigned Crew Member</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Photographer Karthik"
                      value={form.assigned_to}
                      onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Purchase Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.purchase_amount}
                      onChange={(e) => setForm({ ...form, purchase_amount: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Purchase Date</label>
                    <input
                      type="date"
                      value={form.purchase_date}
                      onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Studio Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Studio Storage Locker #3"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Next Maintenance Due</label>
                    <input
                      type="date"
                      value={form.next_maintenance_date}
                      onChange={(e) => setForm({ ...form, next_maintenance_date: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Maintenance / Condition Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Sensor cleaning, lens calibration history, condition notes..."
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
                    {saving ? "Saving..." : editingEquipment ? "Update Equipment" : "Add Equipment"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteEquipment &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a34]/65 p-3 backdrop-blur-[4px]">
            <div className="w-full max-w-sm rounded-[24px] border border-[#dbe8f7] bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 size={26} />
              </div>
              <h3 className="mt-4 text-base font-black text-[#10264d]">Delete Equipment?</h3>
              <p className="mt-2 text-xs font-medium text-[#647c9d]">
                Are you sure you want to remove <strong>{deleteEquipment.equipment_name}</strong>? This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteEquipment(null)}
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
