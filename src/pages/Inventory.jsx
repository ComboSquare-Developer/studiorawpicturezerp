import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Boxes,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  Tag,
  Package,
  Layers,
  ChevronDown,
} from "lucide-react";
import { api } from "../api/client";

const CATEGORIES = [
  "All",
  "Albums",
  "Photo Frames",
  "Camera Accessories",
  "Memory Cards & Storage",
  "Lighting & Modifiers",
  "Printing Papers & Ink",
  "Packaging Materials",
  "Batteries & Power",
  "Other",
];

const UNITS = ["Pieces", "Boxes", "Sets", "Rolls", "Packs", "Units"];

const STATUSES = ["Available", "Low Stock", "Out of Stock", "Discontinued"];

const emptyForm = {
  item_name: "",
  category: "Albums",
  sku: "",
  quantity: 1,
  minimum_stock: 5,
  unit: "Pieces",
  purchase_price: "",
  selling_price: "",
  supplier: "",
  storage_location: "",
  purchase_date: new Date().toISOString().slice(0, 10),
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

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadInventory = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await api.inventory.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("Unable to load inventory from server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const lowStock = items.filter(
      (item) => Number(item.quantity) <= Number(item.minimum_stock) && Number(item.quantity) > 0
    ).length;
    const outOfStock = items.filter((item) => Number(item.quantity) <= 0).length;
    const totalValue = items.reduce(
      (sum, item) => sum + (Number(item.purchase_price) || 0) * (Number(item.quantity) || 0),
      0
    );

    return { totalItems, totalQty, lowStock, outOfStock, totalValue };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        (item.item_name && item.item_name.toLowerCase().includes(search.toLowerCase())) ||
        (item.sku && item.sku.toLowerCase().includes(search.toLowerCase())) ||
        (item.supplier && item.supplier.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Low Stock"
          ? Number(item.quantity) <= Number(item.minimum_stock) && Number(item.quantity) > 0
          : statusFilter === "Out of Stock"
          ? Number(item.quantity) <= 0
          : item.status === statusFilter);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      item_name: item.item_name || "",
      category: item.category || "Albums",
      sku: item.sku || "",
      quantity: item.quantity ?? 1,
      minimum_stock: item.minimum_stock ?? 5,
      unit: item.unit || "Pieces",
      purchase_price: item.purchase_price || "",
      selling_price: item.selling_price || "",
      supplier: item.supplier || "",
      storage_location: item.storage_location || "",
      purchase_date: item.purchase_date || new Date().toISOString().slice(0, 10),
      status: item.status || "Available",
      notes: item.notes || "",
    });
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.item_name.trim()) {
      setError("Item name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: Math.max(0, parseInt(form.quantity, 10) || 0),
        minimum_stock: Math.max(0, parseInt(form.minimum_stock, 10) || 0),
        purchase_price: parseFloat(form.purchase_price) || 0,
        selling_price: parseFloat(form.selling_price) || 0,
      };

      if (payload.quantity <= 0) {
        payload.status = "Out of Stock";
      } else if (payload.quantity <= payload.minimum_stock) {
        payload.status = "Low Stock";
      }

      if (editingItem) {
        await api.inventory.update(editingItem.id, payload);
        setToast("Inventory item updated successfully.");
      } else {
        await api.inventory.create(payload);
        setToast("Inventory item added successfully.");
      }

      setFormOpen(false);
      loadInventory();
    } catch (err) {
      setError(err.message || "Failed to save inventory item.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.inventory.delete(deleteItem.id);
      setToast("Inventory item removed.");
      setDeleteItem(null);
      loadInventory();
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  };

  const exportCsv = () => {
    if (!items.length) return;
    const headers = [
      "ID",
      "Item Name",
      "Category",
      "SKU",
      "Quantity",
      "Unit",
      "Min Stock",
      "Purchase Price",
      "Selling Price",
      "Status",
      "Supplier",
      "Location",
    ];
    const rows = items.map((i) => [
      i.id,
      `"${(i.item_name || "").replace(/"/g, '""')}"`,
      `"${(i.category || "").replace(/"/g, '""')}"`,
      i.sku || "",
      i.quantity,
      i.unit,
      i.minimum_stock,
      i.purchase_price,
      i.selling_price,
      i.status,
      `"${(i.supplier || "").replace(/"/g, '""')}"`,
      `"${(i.storage_location || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `studio_raw_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <Boxes size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#10264d] sm:text-2xl">
                Inventory Management
              </h1>
              <p className="text-xs font-semibold text-[#5c7292]">
                Track photo albums, raw stock, frames, and studio equipment supplies
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadInventory(true)}
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
            Add Item
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">Total Items</p>
          <p className="mt-2 text-2xl font-black text-[#10264d]">{stats.totalItems}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Products tracked</p>
        </div>

        <div className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-[#647c9d]">Total Stock Units</p>
          <p className="mt-2 text-2xl font-black text-[#254f8e]">{stats.totalQty}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Total physical quantity</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-amber-700">Low Stock Alerts</p>
          <p className="mt-2 text-2xl font-black text-amber-700">{stats.lowStock}</p>
          <p className="mt-1 text-[11px] font-semibold text-amber-600">Reorder threshold reached</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold text-rose-700">Out of Stock</p>
          <p className="mt-2 text-2xl font-black text-rose-700">{stats.outOfStock}</p>
          <p className="mt-1 text-[11px] font-semibold text-rose-600">Needs immediate purchase</p>
        </div>

        <div className="col-span-2 rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm lg:col-span-1">
          <p className="text-xs font-bold text-[#647c9d]">Inventory Valuation</p>
          <p className="mt-2 text-xl font-black text-emerald-700">{money(stats.totalValue)}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Based on purchase cost</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8299b7]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name, SKU, or supplier..."
            className="w-full rounded-xl border border-[#dce7f5] bg-[#f9fbfe] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#10264d] outline-none transition placeholder:text-[#9bb0cc] focus:border-[#244d8b] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#647c9d]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-[#dce7f5] bg-[#f9fbfe] px-3 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#244d8b]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
        ) : filteredItems.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#244d8b]">
              <Boxes size={28} />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-[#10264d]">No Inventory Items Found</h3>
            <p className="mt-1 text-xs text-[#647c9d]">
              {search || categoryFilter !== "All" || statusFilter !== "All"
                ? "Try clearing your filters or search terms."
                : "Get started by adding your first studio stock item."}
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#10264d] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#204678]"
            >
              <Plus size={15} /> Add Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e7eef7] bg-[#f8fbff] text-[11px] font-extrabold uppercase tracking-wider text-[#526b8b]">
                  <th className="px-5 py-4">Item Details</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4 text-right">In Stock</th>
                  <th className="px-4 py-4 text-right">Purchase Price</th>
                  <th className="px-4 py-4 text-right">Selling Price</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Storage Location</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf3fa]">
                {filteredItems.map((item) => {
                  const isLow = Number(item.quantity) <= Number(item.minimum_stock) && Number(item.quantity) > 0;
                  const isOut = Number(item.quantity) <= 0;

                  return (
                    <tr key={item.id} className="transition hover:bg-[#f6faff]">
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-[#10264d]">{item.item_name}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#6d84a3]">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          {item.supplier && <span>· Supplier: {item.supplier}</span>}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-block rounded-lg bg-[#eef4fd] px-2.5 py-1 text-[11px] font-bold text-[#24508e]">
                          {item.category || "General"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-black text-[#10264d]">{item.quantity}</span>{" "}
                        <span className="text-[11px] font-semibold text-slate-400">{item.unit || "pcs"}</span>
                        {isLow && (
                          <div className="text-[10px] font-bold text-amber-600">Min: {item.minimum_stock}</div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-[#334e6f]">
                        {money(item.purchase_price)}
                      </td>

                      <td className="px-4 py-4 text-right font-extrabold text-[#10264d]">
                        {money(item.selling_price)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                            isOut
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isLow
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {isOut ? "Out of Stock" : isLow ? "Low Stock" : item.status || "Available"}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-semibold text-[#526b8b]">
                        {item.storage_location || "—"}
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
                            onClick={() => setDeleteItem(item)}
                            className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                    <Boxes size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#10264d]">
                      {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
                    </h2>
                    <p className="text-xs font-semibold text-[#6680a1]">
                      Fill out the stock parameters and pricing
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
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12x36 Royal Silk Wedding Album"
                      value={form.item_name}
                      onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={inputClass}
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">SKU / Barcode</label>
                    <input
                      type="text"
                      placeholder="e.g. ALB-RW-1236"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Quantity in Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Minimum Stock Alert</label>
                    <input
                      type="number"
                      min="0"
                      value={form.minimum_stock}
                      onChange={(e) => setForm({ ...form, minimum_stock: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Unit</label>
                    <select
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className={inputClass}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={inputClass}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Purchase Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.purchase_price}
                      onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.selling_price}
                      onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Supplier / Vendor</label>
                    <input
                      type="text"
                      placeholder="e.g. Canvera Print Solutions"
                      value={form.supplier}
                      onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Storage Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Rack A - Shelf 2"
                      value={form.storage_location}
                      onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-[#10264d]">Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Additional details, reorder notes..."
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
                    {saving ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteItem &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a34]/65 p-3 backdrop-blur-[4px]">
            <div className="w-full max-w-sm rounded-[24px] border border-[#dbe8f7] bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 size={26} />
              </div>
              <h3 className="mt-4 text-base font-black text-[#10264d]">Delete Inventory Item?</h3>
              <p className="mt-2 text-xs font-medium text-[#647c9d]">
                Are you sure you want to delete <strong>{deleteItem.item_name}</strong>? This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteItem(null)}
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
