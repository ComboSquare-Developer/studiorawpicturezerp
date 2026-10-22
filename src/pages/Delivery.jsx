
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Search, X, Truck, Package, CheckCircle2, Clock3,
  Pencil, Trash2, CalendarDays, UserRound, MapPin, Save,
  Phone, Download, ChevronDown, Check, AlertCircle,
  CreditCard, ClipboardList, ArrowUpRight, Eye, Hash,
  FileText, Box, Building2,
} from "lucide-react";

const STORAGE_KEY = "studioraw_deliveries";

const DUMMY_DELIVERIES = [
  {
    id: "DEL-00001",
    customer: "Arun Kumar",
    phone: "9876543210",
    event: "Wedding",
    item: "Wedding Album",
    quantity: 2,
    deliveryMethod: "Studio Pickup",
    address: "",
    courier: "",
    trackingNumber: "",
    expectedDate: "2026-10-25",
    deliveredDate: "",
    assignedTo: "Karthik",
    paymentStatus: "Paid",
    status: "Pending",
    notes: "Premium wedding album",
  },
  {
    id: "DEL-00002",
    customer: "Priya S",
    phone: "9876501234",
    event: "Engagement",
    item: "Photo Album",
    quantity: 1,
    deliveryMethod: "Courier",
    address: "Nagercoil, Tamil Nadu",
    courier: "DTDC",
    trackingNumber: "DTDC102456",
    expectedDate: "2026-10-23",
    deliveredDate: "",
    assignedTo: "Ramesh",
    paymentStatus: "Partial",
    status: "Dispatched",
    notes: "Handle with care",
  },
  {
    id: "DEL-00003",
    customer: "Vijay Raj",
    phone: "9876512345",
    event: "Birthday",
    item: "Printed Frames",
    quantity: 3,
    deliveryMethod: "Home Delivery",
    address: "Marthandam, Tamil Nadu",
    courier: "",
    trackingNumber: "",
    expectedDate: "2026-10-20",
    deliveredDate: "2026-10-20",
    assignedTo: "Suresh",
    paymentStatus: "Paid",
    status: "Delivered",
    notes: "Three framed photographs",
  },
  {
    id: "DEL-00004",
    customer: "Divya R",
    phone: "9876523456",
    event: "Pre-Wedding",
    item: "Edited Photos",
    quantity: 1,
    deliveryMethod: "Digital Delivery",
    address: "",
    courier: "",
    trackingNumber: "",
    expectedDate: "2026-10-28",
    deliveredDate: "",
    assignedTo: "Karthik",
    paymentStatus: "Pending",
    status: "Packed",
    notes: "Digital photo collection",
  },
];

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

const getDeliveryId = (item, index) =>
  item.deliveryId ||
  (String(item.id || "").startsWith("DEL-")
    ? item.id
    : `DEL-${String(index + 1).padStart(5, "0")}`);

function CustomDropdown({ value, options, onChange, compact = false }) {
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
        className={`flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
          compact ? "px-3 py-2.5" : "px-4 py-3"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{value}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
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
              {value === option && <Check size={15} className="shrink-0" />}
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
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
        colors[display] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {display}
    </span>
  );
}

function FormField({ label, children, required = false }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, children }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-[#f7f9fc] p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
        {Icon && <Icon size={12} className="shrink-0 text-blue-500" />}
        <span>{label}</span>
      </div>
      {children || (
        <p className="break-words text-xs font-bold leading-relaxed text-[#10264d]">
          {value === 0 ? 0 : value || "—"}
        </p>
      )}
    </div>
  );
}

function DeliveryCard({ item, deliveryId, onView, onEdit, onDelete, onStatusChange }) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-blue-100 hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserRound size={19} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[#10264d]">{item.customer}</h3>
            <p className="mt-0.5 truncate text-[10px] font-medium text-blue-600">{deliveryId}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" title="View Delivery" onClick={() => onView(item)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Eye size={15} /></button>
          <button type="button" title="Edit Delivery" onClick={() => onEdit(item)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"><Pencil size={15} /></button>
          <button type="button" title="Delete Delivery" onClick={() => onDelete(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 size={15} /></button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 py-3">
        <p className="text-[11px] font-medium text-slate-400">Delivery Status</p>
        <StatusBadge value={item.status} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoBox label="Delivery Item" value={item.item} icon={Package} />
        <InfoBox label="Quantity" value={item.quantity} icon={Box} />
        <InfoBox label="Phone" value={item.phone || "No phone"} icon={Phone} />
        <InfoBox label="Delivery Method" value={item.deliveryMethod} icon={Truck} />
        <InfoBox label="Event" value={item.event} icon={CalendarDays} />
        <InfoBox label="Expected Date" value={formatDate(item.expectedDate)} icon={CalendarDays} />
        <InfoBox label="Actual Date" value={formatDate(item.deliveredDate)} icon={CheckCircle2} />
        <InfoBox label="Assigned Staff" value={item.assignedTo || "Not assigned"} icon={UserRound} />
        <InfoBox label="Payment Status" icon={CreditCard}><StatusBadge value={item.paymentStatus} payment /></InfoBox>
        <InfoBox label="Tracking Number" value={item.trackingNumber || "—"} icon={Hash} />
        {item.address && <div className="col-span-2"><InfoBox label="Delivery Address" value={item.address} icon={MapPin} /></div>}
        {item.courier && <InfoBox label="Courier" value={item.courier} icon={Building2} />}
        {item.notes && <div className="col-span-2"><InfoBox label="Notes" value={item.notes} icon={FileText} /></div>}
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <CustomDropdown
          compact
          value={item.status || "Pending"}
          options={deliveryStatuses}
          onChange={(status) => onStatusChange(item, status)}
        />
      </div>
    </article>
  );
}

export default function Delivery() {
  const [deliveries, setDeliveries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_DELIVERIES));
        return DUMMY_DELIVERIES;
      }
      const parsed = JSON.parse(saved);
      // Existing empty array? Seed sample records so the page is not empty.
      if (Array.isArray(parsed) && parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_DELIVERIES));
        return DUMMY_DELIVERIES;
      }
      return Array.isArray(parsed) ? parsed : DUMMY_DELIVERIES;
    } catch (error) {
      console.error("Unable to load delivery records:", error);
      return DUMMY_DELIVERIES;
    }
  });

  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    if (!showForm && !viewItem) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setViewItem(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm, viewItem]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  };

  const openCreate = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setViewItem(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (delivery) => {
    setForm({ ...createEmptyForm(), ...delivery });
    setEditingId(delivery.id);
    setViewItem(null);
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
    if (String(form.quantity).trim() === "" || !Number.isInteger(quantity) || quantity <= 0) {
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
      setDeliveries((prev) => prev.map((item) => item.id === editingId ? data : item));
    } else {
      setDeliveries((prev) => [data, ...prev]);
    }
    closeForm();
  };

  const deleteDelivery = (id) => {
    if (!window.confirm("Delete this delivery record?")) return;
    setDeliveries((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) closeForm();
    if (viewItem?.id === id) setViewItem(null);
  };

  const updateDeliveryStatus = (item, status) => {
    setStatusError("");
    if (status === "Delivered" && !item.deliveredDate) {
      setStatusError(`Please enter the actual delivery date for ${item.customer} before marking it as Delivered.`);
      setForm({ ...createEmptyForm(), ...item, status: "Delivered" });
      setEditingId(item.id);
      setShowForm(true);
      return;
    }
    setDeliveries((prev) => prev.map((delivery) =>
      delivery.id === item.id
        ? { ...delivery, status, ...(status === "Delivered" && !delivery.deliveredDate ? { deliveredDate: new Date().toISOString().slice(0, 10) } : {}) }
        : delivery
    ));
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return deliveries.filter((item) => {
      const matches = [
        item.customer, item.phone, item.event, item.item,
        item.trackingNumber, item.assignedTo, item.courier, item.deliveryMethod,
      ].some((value) => String(value || "").toLowerCase().includes(query));
      return matches && (filter === "All" || item.status === filter);
    });
  }, [deliveries, search, filter]);

  const stats = [
    { title: "Total Deliveries", value: deliveries.length, icon: Package, color: "text-blue-600", bg: "bg-blue-50", accent: "from-blue-500 to-blue-600" },
    { title: "Pending Deliveries", value: deliveries.filter((item) => item.status === "Pending").length, icon: Clock3, color: "text-amber-600", bg: "bg-amber-50", accent: "from-amber-400 to-orange-500" },
    { title: "Dispatched", value: deliveries.filter((item) => item.status === "Dispatched").length, icon: Truck, color: "text-violet-600", bg: "bg-violet-50", accent: "from-violet-500 to-indigo-600" },
    { title: "Delivered", value: deliveries.filter((item) => item.status === "Delivered").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", accent: "from-emerald-400 to-green-600" },
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
      ...filtered.map((item) => columns.map((key) => escapeCSV(item[key])).join(",")),
    ].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "studioraw_deliveries.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const selectedView = viewItem ? deliveries.find((item) => item.id === viewItem.id) : null;

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Studio Raw / Operations
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">Delivery Management</h1>
          <p className="mt-2 text-sm text-slate-500">Manage and track albums, photos, videos and customer deliveries.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={exportCSV} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#10264d] shadow-sm hover:bg-slate-50">
            <Download size={17} /> Export CSV
          </button>
          <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 hover:bg-[#193b73]">
            <Plus size={18} /> New Delivery
          </button>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#10264d]">{stat.value}</h2>
                </div>
                <div className={`rounded-2xl p-3.5 ${stat.bg}`}><Icon size={23} className={stat.color} /></div>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <ArrowUpRight size={14} className={stat.color} /> Current delivery records
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#10264d]"><ClipboardList size={20} className="text-blue-600" /> Delivery Records</h2>
              <p className="mt-1 text-xs text-slate-400">Showing {filtered.length} of {deliveries.length} deliveries</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:w-72">
                <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deliveries..." className={`${inputClass} pl-10`} />
              </div>
              <div className="w-full sm:w-48"><CustomDropdown value={filter} options={["All", ...deliveryStatuses]} onChange={setFilter} /></div>
            </div>
          </div>
        </div>

        {statusError && (
          <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-700 sm:mx-6">
            <AlertCircle size={16} className="shrink-0" />
            {statusError}
            <button type="button" onClick={() => setStatusError("")} className="ml-auto"><X size={15} /></button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-slate-50 p-5"><Truck size={36} className="text-slate-300" /></div>
            <h3 className="font-bold text-[#10264d]">No delivery records found</h3>
            <p className="mt-2 text-sm text-slate-400">{deliveries.length === 0 ? "Start by adding your first delivery." : "Try changing your search or status filter."}</p>
            {deliveries.length === 0 && (
              <button type="button" onClick={openCreate} className="mt-5 flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add Delivery</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 p-3 sm:grid-cols-2 sm:p-5 2xl:grid-cols-3">
            {filtered.map((item) => (
              <DeliveryCard
                key={item.id}
                item={item}
                deliveryId={getDeliveryId(item, deliveries.findIndex((d) => d.id === item.id))}
                onView={setViewItem}
                onEdit={openEdit}
                onDelete={deleteDelivery}
                onStatusChange={updateDeliveryStatus}
              />
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Showing {filtered.length} of {deliveries.length} records</span>
          <span>Studio Raw ERP</span>
        </div>
      </section>

      {showForm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 lg:p-8">
          <div className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-[4px]" onClick={closeForm} />
          <div role="dialog" aria-modal="true" aria-label={editingId ? "Manage Delivery" : "New Delivery"} className="relative flex max-h-[94dvh] w-full max-w-[760px] flex-col overflow-visible rounded-2xl border border-white/50 bg-[#f8faff] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl">
            <div className="shrink-0 rounded-t-2xl border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Delivery Operations</p>
                  <h2 className="text-xl font-extrabold text-[#10264d] sm:text-2xl">{editingId ? "Manage Delivery" : "New Delivery"}</h2>
                  <p className="mt-1 text-sm text-slate-500">Enter customer and delivery information.</p>
                </div>
                <button type="button" onClick={closeForm} aria-label="Close delivery form" className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
              </div>
            </div>

            <form onSubmit={saveDelivery} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-7">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]"><UserRound size={18} className="text-blue-600" /> Customer Information</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Customer Name" required>
                      <input type="text" required value={form.customer} onChange={(e) => update("customer", e.target.value)} placeholder="Enter customer name" className={inputClass} />
                    </FormField>
                    <FormField label="Phone Number">
                      <input type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))} placeholder="10-digit phone number" className={inputClass} />
                    </FormField>
                    <FormField label="Event Type"><CustomDropdown value={form.event} options={events} onChange={(v) => update("event", v)} /></FormField>
                    <FormField label="Delivery Item"><CustomDropdown value={form.item} options={deliveryItems} onChange={(v) => update("item", v)} /></FormField>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]"><Truck size={18} className="text-blue-600" /> Delivery Information</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Delivery Method"><CustomDropdown value={form.deliveryMethod} options={deliveryMethods} onChange={(v) => update("deliveryMethod", v)} /></FormField>
                    <FormField label="Quantity" required><input type="number" min="1" step="1" required value={form.quantity} onChange={(e) => update("quantity", e.target.value)} className={inputClass} /></FormField>

                    {form.deliveryMethod !== "Digital Delivery" && form.deliveryMethod !== "Studio Pickup" && (
                      <div className="sm:col-span-2">
                        <FormField label="Delivery Address"><textarea rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Enter delivery address" className={inputClass} /></FormField>
                      </div>
                    )}

                    {form.deliveryMethod === "Courier" && (
                      <>
                        <FormField label="Courier Company"><input type="text" value={form.courier} onChange={(e) => update("courier", e.target.value)} placeholder="Courier company" className={inputClass} /></FormField>
                        <FormField label="Tracking Number"><input type="text" value={form.trackingNumber} onChange={(e) => update("trackingNumber", e.target.value)} placeholder="Tracking number" className={inputClass} /></FormField>
                      </>
                    )}

                    <FormField label="Expected Delivery Date"><input type="date" value={form.expectedDate} onChange={(e) => update("expectedDate", e.target.value)} className={inputClass} /></FormField>
                    <FormField label="Actual Delivery Date"><input type="date" value={form.deliveredDate} onChange={(e) => update("deliveredDate", e.target.value)} className={inputClass} /></FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Assigned Staff"><input type="text" value={form.assignedTo} onChange={(e) => update("assignedTo", e.target.value)} placeholder="Enter assigned staff name" className={inputClass} /></FormField>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]"><CreditCard size={18} className="text-blue-600" /> Payment & Status</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField label="Payment Status"><CustomDropdown value={form.paymentStatus} options={paymentStatuses} onChange={(v) => update("paymentStatus", v)} /></FormField>
                    <FormField label="Delivery Status"><CustomDropdown value={form.status} options={deliveryStatuses} onChange={(v) => update("status", v)} /></FormField>
                    <div className="sm:col-span-2">
                      <FormField label="Delivery Notes"><textarea rows={4} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Special instructions..." className={inputClass} /></FormField>
                    </div>
                  </div>
                </div>

                {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
              </div>

              <div className="shrink-0 rounded-b-2xl border-t border-slate-200 bg-white px-4 py-4 sm:px-7">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-7 py-3 text-sm font-semibold text-white hover:bg-blue-900"><Save size={17} />{editingId ? "Update Delivery" : "Save Delivery"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedView && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-[4px]" onClick={() => setViewItem(null)} />
          <div role="dialog" aria-modal="true" aria-label="Delivery Details" className="relative flex max-h-[90dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Delivery Details</p>
                <h2 className="mt-1 text-xl font-extrabold text-[#10264d]">{selectedView.customer}</h2>
              </div>
              <button type="button" onClick={() => setViewItem(null)} className="rounded-xl bg-slate-100 p-2.5 text-slate-500 hover:bg-slate-200"><X size={19} /></button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-500">Delivery Status</span><StatusBadge value={selectedView.status} /></div>
              <div className="grid grid-cols-2 gap-3">
                <InfoBox label="Customer" value={selectedView.customer} icon={UserRound} />
                <InfoBox label="Phone" value={selectedView.phone || "No phone"} icon={Phone} />
                <InfoBox label="Event" value={selectedView.event} icon={CalendarDays} />
                <InfoBox label="Delivery Item" value={selectedView.item} icon={Package} />
                <InfoBox label="Quantity" value={selectedView.quantity} icon={Box} />
                <InfoBox label="Delivery Method" value={selectedView.deliveryMethod} icon={Truck} />
                <InfoBox label="Expected Date" value={formatDate(selectedView.expectedDate)} icon={CalendarDays} />
                <InfoBox label="Actual Date" value={formatDate(selectedView.deliveredDate)} icon={CheckCircle2} />
                <InfoBox label="Assigned Staff" value={selectedView.assignedTo || "Not assigned"} icon={UserRound} />
                <InfoBox label="Payment" icon={CreditCard}><StatusBadge value={selectedView.paymentStatus} payment /></InfoBox>
                {selectedView.address && <div className="col-span-2"><InfoBox label="Delivery Address" value={selectedView.address} icon={MapPin} /></div>}
                {selectedView.courier && <InfoBox label="Courier Company" value={selectedView.courier} icon={Building2} />}
                {selectedView.trackingNumber && <InfoBox label="Tracking Number" value={selectedView.trackingNumber} icon={Hash} />}
                {selectedView.notes && <div className="col-span-2"><InfoBox label="Notes" value={selectedView.notes} icon={FileText} /></div>}
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
              <button type="button" onClick={() => setViewItem(null)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">Close</button>
              <button type="button" onClick={() => openEdit(selectedView)} className="flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-2.5 text-sm font-semibold text-white"><Pencil size={15} /> Edit Delivery</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}