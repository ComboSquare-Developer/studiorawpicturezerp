
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Search, X, Truck, Package, CheckCircle2, Clock3,
  Pencil, Trash2, CalendarDays, UserRound, MapPin, Save,
  Phone, Download, ChevronDown, Check, AlertCircle,
  CreditCard, ClipboardList, ArrowUpRight,
} from "lucide-react";

const STORAGE_KEY = "studioraw_deliveries";

const createEmptyForm = () => ({
  customer: "",
  phone: "",
  event: "Wedding",
  item: "Wedding Album",
  quantity: "1",
  deliveryMethod: "Studio Pickup",
  address: "",
  courier: "",
  trackingNumber: "",
  expectedDate: "",
  deliveredDate: "",
  assignedTo: "",
  paymentStatus: "Pending",
  status: "Pending",
  notes: "",
});

const events = [
  "Wedding", "Engagement", "Birthday", "Pre-Wedding",
  "Baby Shoot", "Portrait", "Corporate", "Other",
];

const deliveryItems = [
  "Wedding Album", "Photo Album", "Edited Photos",
  "Wedding Video", "Photo & Video", "USB Drive",
  "Printed Frames", "Other",
];

const deliveryMethods = [
  "Studio Pickup", "Home Delivery", "Courier", "Digital Delivery",
];

const paymentStatuses = ["Pending", "Partial", "Paid"];

const deliveryStatuses = [
  "Pending", "Packed", "Dispatched", "Delivered", "Cancelled",
];

const statusColors = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Packed: "bg-violet-50 text-violet-700 ring-violet-200",
  Dispatched: "bg-blue-50 text-blue-700 ring-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const paymentColors = {
  Pending: "bg-rose-50 text-rose-700 ring-rose-200",
  Partial: "bg-amber-50 text-amber-700 ring-amber-200",
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const formatDate = (date) => {
  if (!date) return "Not scheduled";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

function CustomDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 truncate">{value}</span>
        <ChevronDown size={17} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                value === option
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="break-words">{option}</span>
              {value === option && <Check size={16} className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ value, payment = false }) {
  const colors = payment ? paymentColors : statusColors;
  const display = value || "Pending";

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${colors[display] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {display}
    </span>
  );
}

function FormField({ label, children, required = false }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
      <div className="flex min-w-0 items-start gap-2">
        {Icon && <Icon size={15} className="mt-0.5 shrink-0 text-blue-600" />}
        <p className="min-w-0 break-words text-sm font-semibold text-[#10264d]">
          {value === 0 ? 0 : value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function Delivery() {
  const [deliveries, setDeliveries] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    if (!showForm) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") setShowForm(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showForm]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  };

  const openCreate = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (delivery) => {
    setForm({ ...createEmptyForm(), ...delivery });
    setEditingId(delivery.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
  };

  const saveDelivery = (event) => {
    event.preventDefault();

    if (!form.customer.trim()) {
      setError("Please enter customer name.");
      return;
    }

    const quantity = Number(form.quantity);
    if (
      String(form.quantity).trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setError("Please enter a valid quantity.");
      return;
    }

    const phone = String(form.phone || "").trim();
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (form.status === "Delivered" && !form.deliveredDate) {
      setError("Please enter the actual delivery date.");
      return;
    }

    const data = {
      ...form,
      customer: form.customer.trim(),
      phone,
      quantity,
      id: editingId || globalThis.crypto?.randomUUID?.() || `DEL-${Date.now()}`,
    };

    if (editingId) {
      setDeliveries((prev) =>
        prev.map((item) => item.id === editingId ? data : item)
      );
    } else {
      setDeliveries((prev) => [data, ...prev]);
    }

    closeForm();
  };

  const deleteDelivery = (id) => {
    if (!window.confirm("Delete this delivery record?")) return;
    setDeliveries((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) closeForm();
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return deliveries.filter((item) => {
      const matches = [
        item.customer, item.phone, item.event, item.item,
        item.trackingNumber, item.assignedTo, item.courier,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      return matches && (filter === "All" || item.status === filter);
    });
  }, [deliveries, search, filter]);

  const stats = [
    {
      title: "Total Deliveries",
      value: deliveries.length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "from-blue-500 to-blue-600",
    },
    {
      title: "Pending Deliveries",
      value: deliveries.filter((item) => item.status === "Pending").length,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "from-amber-400 to-orange-500",
    },
    {
      title: "Dispatched",
      value: deliveries.filter((item) => item.status === "Dispatched").length,
      icon: Truck,
      color: "text-violet-600",
      bg: "bg-violet-50",
      accent: "from-violet-500 to-indigo-600",
    },
    {
      title: "Delivered",
      value: deliveries.filter((item) => item.status === "Delivered").length,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "from-emerald-400 to-green-600",
    },
  ];

  const exportCSV = () => {
    const columns = [
      "customer", "phone", "event", "item", "quantity",
      "deliveryMethod", "address", "courier", "trackingNumber",
      "expectedDate", "deliveredDate", "assignedTo",
      "paymentStatus", "status", "notes",
    ];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      const safe = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(escapeCSV).join(","),
      ...filtered.map((item) =>
        columns.map((key) => escapeCSV(item[key])).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "studioraw_deliveries.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">

      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Studio Raw / Operations
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Delivery Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage and track albums, photos, videos and customer deliveries.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#10264d] shadow-sm transition hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#193b73]"
          >
            <Plus size={18} />
            New Delivery
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#10264d]">
                    {stat.value}
                  </h2>
                </div>
                <div className={`rounded-2xl p-3.5 ${stat.bg}`}>
                  <Icon size={23} className={stat.color} />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <ArrowUpRight size={14} className={stat.color} />
                Current delivery records
              </div>
            </div>
          );
        })}
      </div>

      {/* RECORDS */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#10264d]">
                <ClipboardList size={20} className="text-blue-600" />
                Delivery Records
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Showing {filtered.length} of {deliveries.length} deliveries
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:w-72">
                <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search deliveries..."
                  className={`${inputClass} pl-10`}
                />
              </div>
              <div className="w-full sm:w-48">
                <CustomDropdown
                  value={filter}
                  options={["All", ...deliveryStatuses]}
                  onChange={setFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-slate-50 p-5">
              <Truck size={36} className="text-slate-300" />
            </div>
            <h3 className="font-bold text-[#10264d]">No delivery records found</h3>
            <p className="mt-2 text-sm text-slate-400">
              {deliveries.length === 0
                ? "Start by adding your first delivery."
                : "Try changing your search or status filter."}
            </p>
            {deliveries.length === 0 && (
              <button
                onClick={openCreate}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Add Delivery
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-[#f8faff]">
                  <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Delivery Details</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Expected Date</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="transition hover:bg-blue-50/30">
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                            {(item.customer || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-40 truncate text-sm font-bold text-[#10264d]">
                              {item.customer}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {item.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold text-[#10264d]">{item.item}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.event} · Qty: {item.quantity}
                        </p>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Truck size={15} className="text-blue-500" />
                          {item.deliveryMethod}
                        </div>
                      </td>
                      <td className="px-5 py-5 text-sm text-slate-600">
                        {formatDate(item.expectedDate)}
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge value={item.paymentStatus} payment />
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge value={item.status} />
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            title="Manage Delivery"
                            className="rounded-lg border border-blue-100 bg-blue-50 p-2.5 text-blue-700 transition hover:bg-blue-100"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteDelivery(item.id)}
                            title="Delete Delivery"
                            className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {item.customer}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">{item.event}</p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Detail label="Delivery Item" value={item.item} icon={Package} />
                    <Detail label="Quantity" value={item.quantity} />
                    <Detail label="Phone Number" value={item.phone || "No phone"} icon={Phone} />
                    <Detail label="Delivery Method" value={item.deliveryMethod} icon={Truck} />
                    {item.address && (
                      <Detail label="Delivery Address" value={item.address} icon={MapPin} />
                    )}
                    {item.courier && (
                      <Detail label="Courier Company" value={item.courier} icon={Truck} />
                    )}
                    {item.trackingNumber && (
                      <Detail label="Tracking Number" value={item.trackingNumber} />
                    )}
                    <Detail label="Expected Delivery" value={formatDate(item.expectedDate)} icon={CalendarDays} />
                    <Detail label="Actual Delivery" value={formatDate(item.deliveredDate)} icon={CalendarDays} />
                    <Detail label="Assigned Staff" value={item.assignedTo || "Not assigned"} icon={UserRound} />
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">Payment Status</p>
                      <StatusBadge value={item.paymentStatus} payment />
                    </div>
                    {item.notes && <Detail label="Delivery Notes" value={item.notes} />}
                  </div>

                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Pencil size={16} /> Manage Delivery
                    </button>
                    <button
                      onClick={() => deleteDelivery(item.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
                    >
                      <Trash2 size={16} /> Delete Delivery
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CREATE / EDIT SIDE PANEL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-[#07152b]/60 backdrop-blur-[3px]"
            onClick={closeForm}
          />

          <div
            ref={formRef}
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Manage Delivery" : "New Delivery"}
            className="relative flex h-full w-full flex-col overflow-hidden bg-[#f8faff] shadow-2xl sm:max-w-[600px] xl:max-w-[680px]"
          >
            <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">
                    Delivery Operations
                  </p>
                  <h2 className="text-xl font-extrabold text-[#10264d] sm:text-2xl">
                    {editingId ? "Manage Delivery" : "New Delivery"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter customer and delivery information.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close delivery form"
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form
              onSubmit={saveDelivery}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-7">

                {/* CUSTOMER INFORMATION */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                    <UserRound size={18} className="text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Customer Name" required>
                      <input
                        type="text"
                        required
                        value={form.customer}
                        onChange={(e) => update("customer", e.target.value)}
                        placeholder="Enter customer name"
                        className={inputClass}
                      />
                    </FormField>
                    <FormField label="Phone Number">
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit phone number"
                        className={inputClass}
                      />
                    </FormField>
                    <FormField label="Event Type">
                      <CustomDropdown
                        value={form.event}
                        options={events}
                        onChange={(v) => update("event", v)}
                      />
                    </FormField>
                    <FormField label="Delivery Item">
                      <CustomDropdown
                        value={form.item}
                        options={deliveryItems}
                        onChange={(v) => update("item", v)}
                      />
                    </FormField>
                  </div>
                </div>

                {/* DELIVERY INFORMATION */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                    <Truck size={18} className="text-blue-600" />
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Delivery Method">
                      <CustomDropdown
                        value={form.deliveryMethod}
                        options={deliveryMethods}
                        onChange={(v) => update("deliveryMethod", v)}
                      />
                    </FormField>
                    <FormField label="Quantity" required>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={form.quantity}
                        onChange={(e) => update("quantity", e.target.value)}
                        className={inputClass}
                      />
                    </FormField>

                    {form.deliveryMethod !== "Digital Delivery" &&
                      form.deliveryMethod !== "Studio Pickup" && (
                        <div className="sm:col-span-2">
                          <FormField label="Delivery Address">
                            <textarea
                              rows={3}
                              value={form.address}
                              onChange={(e) => update("address", e.target.value)}
                              placeholder="Enter delivery address"
                              className={inputClass}
                            />
                          </FormField>
                        </div>
                      )}

                    {form.deliveryMethod === "Courier" && (
                      <>
                        <FormField label="Courier Company">
                          <input
                            type="text"
                            value={form.courier}
                            onChange={(e) => update("courier", e.target.value)}
                            placeholder="Courier company"
                            className={inputClass}
                          />
                        </FormField>
                        <FormField label="Tracking Number">
                          <input
                            type="text"
                            value={form.trackingNumber}
                            onChange={(e) => update("trackingNumber", e.target.value)}
                            placeholder="Tracking number"
                            className={inputClass}
                          />
                        </FormField>
                      </>
                    )}

                    <FormField label="Expected Delivery Date">
                      <input
                        type="date"
                        value={form.expectedDate}
                        onChange={(e) => update("expectedDate", e.target.value)}
                        className={inputClass}
                      />
                    </FormField>
                    <FormField label="Actual Delivery Date">
                      <input
                        type="date"
                        value={form.deliveredDate}
                        onChange={(e) => update("deliveredDate", e.target.value)}
                        className={inputClass}
                      />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Assigned Staff">
                        <input
                          type="text"
                          value={form.assignedTo}
                          onChange={(e) => update("assignedTo", e.target.value)}
                          placeholder="Enter assigned staff name"
                          className={inputClass}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                    <CreditCard size={18} className="text-blue-600" />
                    Payment & Status
                  </h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Payment Status">
                      <CustomDropdown
                        value={form.paymentStatus}
                        options={paymentStatuses}
                        onChange={(v) => update("paymentStatus", v)}
                      />
                    </FormField>
                    <FormField label="Delivery Status">
                      <CustomDropdown
                        value={form.status}
                        options={deliveryStatuses}
                        onChange={(v) => update("status", v)}
                      />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Delivery Notes">
                        <textarea
                          rows={4}
                          value={form.notes}
                          onChange={(e) => update("notes", e.target.value)}
                          placeholder="Special instructions..."
                          className={inputClass}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              {/* FIXED FOOTER */}
              <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-7">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900"
                  >
                    <Save size={17} />
                    {editingId ? "Update Delivery" : "Save Delivery"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
