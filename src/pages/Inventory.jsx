
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Boxes,
  History,
  ChevronDown,
  Check,
  IndianRupee,
  CalendarDays,
  Building2,
  Hash,
  StickyNote,
  ArrowRightLeft,
} from "lucide-react";

const INVENTORY_KEY = "studioraw_inventory";
const HISTORY_KEY = "studioraw_inventory_history";

const categories = [
  "Albums",
  "Frames",
  "Printing Materials",
  "Packaging",
  "Storage Devices",
  "Office Supplies",
  "Other",
];

const units = ["Pieces", "Boxes", "Rolls", "Packs", "Sets"];

const demoInventory = [
  {
    id: "DEMO-001",
    name: "Wedding Album 12x36",
    category: "Albums",
    sku: "ALB-001",
    quantity: 25,
    minimumStock: 5,
    unit: "Pieces",
    unitCost: 850,
    supplier: "Classic Album Suppliers",
    notes: "Premium wedding album",
  },
  {
    id: "DEMO-002",
    name: "Premium Photo Frame",
    category: "Frames",
    sku: "FRM-002",
    quantity: 18,
    minimumStock: 5,
    unit: "Pieces",
    unitCost: 450,
    supplier: "Royal Frame Works",
    notes: "12x18 inch photo frame",
  },
  {
    id: "DEMO-003",
    name: "Photo Printing Paper",
    category: "Printing Materials",
    sku: "PRT-003",
    quantity: 42,
    minimumStock: 10,
    unit: "Packs",
    unitCost: 320,
    supplier: "Digital Print Solutions",
    notes: "Glossy printing paper",
  },
  {
    id: "DEMO-004",
    name: "Album Packaging Box",
    category: "Packaging",
    sku: "PKG-004",
    quantity: 3,
    minimumStock: 5,
    unit: "Boxes",
    unitCost: 120,
    supplier: "SafePack Traders",
    notes: "Protective album packaging",
  },
  {
    id: "DEMO-005",
    name: "USB Drive 64GB",
    category: "Storage Devices",
    sku: "USB-005",
    quantity: 12,
    minimumStock: 4,
    unit: "Pieces",
    unitCost: 550,
    supplier: "Tech World",
    notes: "Client photo delivery",
  },
  {
    id: "DEMO-006",
    name: "Office Paper Pack",
    category: "Office Supplies",
    sku: "OFF-006",
    quantity: 20,
    minimumStock: 5,
    unit: "Packs",
    unitCost: 280,
    supplier: "City Office Supplies",
    notes: "A4 office paper",
  },
];

const createEmptyForm = () => ({
  name: "",
  category: "Albums",
  sku: "",
  quantity: "",
  minimumStock: "5",
  unit: "Pieces",
  unitCost: "",
  supplier: "",
  notes: "",
});

const inputClass =
  "inv-input block w-full min-w-0 rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/20";

const themeCSS = `
.sr-inventory {
  --inv-bg: #f6f8fc;
  --inv-card: #ffffff;
  --inv-soft: #f7f9fc;
  --inv-text: #10264d;
  --inv-label: #334155;
  --inv-muted: #64748b;
  --inv-border: #e2e8f0;
  --inv-input: #ffffff;
}

html[data-theme="dark"] .sr-inventory,
html.dark .sr-inventory,
body.dark .sr-inventory {
  --inv-bg: #0b1424;
  --inv-card: #152238;
  --inv-soft: #1d3049;
  --inv-text: #f1f5f9;
  --inv-label: #dce7f7;
  --inv-muted: #b5c5db;
  --inv-border: #344761;
  --inv-input: #1b2b43;
}

.sr-inventory.inv-page {
  background: var(--inv-bg) !important;
  color: var(--inv-text) !important;
}

.sr-inventory .inv-card {
  background: var(--inv-card) !important;
  border-color: var(--inv-border) !important;
  color: var(--inv-text) !important;
}

.sr-inventory .inv-soft {
  background: var(--inv-soft) !important;
  border-color: var(--inv-border) !important;
}

.sr-inventory .inv-title {
  color: var(--inv-text) !important;
}

.sr-inventory .inv-label {
  color: var(--inv-label) !important;
}

.sr-inventory .inv-muted {
  color: var(--inv-muted) !important;
}

.sr-inventory .inv-border {
  border-color: var(--inv-border) !important;
}

.sr-inventory .inv-input {
  background: var(--inv-input) !important;
  border-color: var(--inv-border) !important;
  color: var(--inv-text) !important;
}

.sr-inventory .inv-input::placeholder {
  color: var(--inv-muted) !important;
}

.sr-inventory .inv-option {
  color: var(--inv-text) !important;
}

.sr-inventory .inv-option:hover,
.sr-inventory .inv-option[data-selected="true"] {
  background: var(--inv-soft) !important;
}

.sr-inventory .inv-primary {
  background: #10264d !important;
  color: #ffffff !important;
}

.sr-inventory .inv-primary:hover {
  background: #193b73 !important;
}

.sr-inventory .inv-secondary {
  background: var(--inv-card) !important;
  color: var(--inv-text) !important;
  border-color: var(--inv-border) !important;
}

.sr-inventory .inv-secondary:hover {
  background: var(--inv-soft) !important;
}

.sr-inventory .inv-tab-inactive {
  background: var(--inv-soft) !important;
  color: var(--inv-label) !important;
}

.sr-inventory .inv-tab-inactive:hover {
  background: var(--inv-border) !important;
}

html[data-theme="dark"] .sr-inventory input[type="date"],
html.dark .sr-inventory input[type="date"] {
  color-scheme: dark;
}
`;

function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `INV-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function currency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function makeOpeningHistory(items) {
  return items.map((item, index) => ({
    id: `OPENING-${item.id || index}`,
    itemId: item.id,
    itemName: item.name,
    type: "OPENING",
    quantity: Number(item.quantity || 0),
    note: "Demo opening stock",
    date: new Date().toISOString(),
  }));
}

function readInitial(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (saved === null) return fallback;

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function Field({ label, children, required = false }) {
  return (
    <div className="min-w-0">
      <label className="inv-label mb-2 block text-xs font-semibold uppercase tracking-wider">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const normalized = options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : option
  );

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);

    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const selected = normalized.find(
    (option) => String(option.value) === String(value)
  );

  return (
    <div ref={ref} className="relative w-full min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.label || placeholder}
        </span>

        <ChevronDown
          size={17}
          className={`inv-muted shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="inv-card absolute left-0 right-0 top-full z-[100] mt-2 max-h-56 overflow-y-auto rounded-xl border p-1 shadow-xl"
        >
          {normalized.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              role="option"
              aria-selected={String(option.value) === String(value)}
              data-selected={String(option.value) === String(value)}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="inv-option flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm"
            >
              <span>{option.label}</span>

              {String(option.value) === String(value) && (
                <Check size={16} className="shrink-0 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SuggestionInput({
  value,
  onChange,
  options = [],
  placeholder,
  type = "text",
  min,
  step,
  required = false,
}) {
  const [open, setOpen] = useState(false);

  const filtered = [...new Set(options.map(String))].filter((option) =>
    option.toLowerCase().includes(String(value || "").toLowerCase())
  );

  return (
    <div className="relative min-w-0">
      <input
        type={type}
        min={min}
        step={step}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder}
        className={inputClass}
      />

      {open && filtered.length > 0 && (
        <div className="inv-card absolute left-0 right-0 top-full z-[100] mt-1 max-h-48 overflow-y-auto rounded-xl border p-1 shadow-xl">
          {filtered.map((option) => (
            <button
              type="button"
              key={option}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="inv-option block w-full rounded-lg px-3 py-2.5 text-left text-sm"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, icon: Icon, full = false }) {
  return (
    <div
      className={`inv-soft min-w-0 rounded-xl border p-3 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        {Icon && (
          <Icon size={13} className="inv-muted shrink-0" />
        )}

        <p className="inv-muted text-[11px] font-medium">
          {label}
        </p>
      </div>

      <p className="inv-title break-words whitespace-pre-wrap text-sm font-bold">
        {value === undefined || value === null || value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function StatusBadge({ low }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        low
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
      style={{
        backgroundColor: low ? "#fff1f2" : "#ecfdf5",
        color: low ? "#b91c1c" : "#047857",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {low ? "Low Stock" : "In Stock"}
    </span>
  );
}

function TypeBadge({ type }) {
  const colors = {
    IN: ["#ecfdf5", "#047857"],
    OUT: ["#fffbeb", "#b45309"],
    OPENING: ["#eff6ff", "#1d4ed8"],
    ADJUSTMENT: ["#eef2ff", "#4338ca"],
    DELETED: ["#fff1f2", "#be123c"],
  };

  const [backgroundColor, color] = colors[type] || [
    "#f1f5f9",
    "#475569",
  ];

  return (
    <span
      style={{ backgroundColor, color }}
      className="inline-flex rounded-full px-3 py-1.5 text-xs font-bold"
    >
      {type}
    </span>
  );
}

function IconButton({
  icon: Icon,
  title,
  onClick,
  color = "blue",
}) {
  const colors = {
    blue: "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100",
    red: "border-red-100 bg-red-50 text-red-600 hover:bg-red-100",
    slate: "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${colors[color]}`}
    >
      <Icon size={16} />
    </button>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  width = "max-w-[780px]",
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const escape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", escape);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`inv-card relative z-10 mx-auto flex max-h-[92dvh] w-full ${width} flex-col overflow-hidden rounded-2xl border shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl`}
      >
        <div className="inv-card inv-border flex shrink-0 items-start justify-between gap-4 border-b px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-500">
              Studio Raw / Inventory
            </p>

            <h2 className="inv-title text-xl font-extrabold sm:text-2xl">
              {title}
            </h2>

            <p className="inv-muted mt-1 text-sm">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inv-secondary shrink-0 rounded-xl border p-2.5"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function InventoryCard({
  item,
  onView,
  onEdit,
  onDelete,
  onStock,
}) {
  const qty = Number(item.quantity || 0);
  const low = qty <= Number(item.minimumStock || 0);

  return (
    <article className="inv-card flex min-w-0 flex-col rounded-2xl border p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Package size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="inv-title break-words text-sm font-extrabold sm:text-base">
              {item.name}
            </h3>

            <p className="inv-muted mt-1 break-all text-xs">
              {item.sku || "No SKU"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <IconButton
            icon={Eye}
            title="View"
            color="slate"
            onClick={() => onView(item)}
          />

          <IconButton
            icon={Pencil}
            title="Edit"
            onClick={() => onEdit(item)}
          />

          <IconButton
            icon={Trash2}
            title="Delete"
            color="red"
            onClick={() => onDelete(item)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
          }}
        >
          {item.category}
        </span>

        <StatusBadge low={low} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Detail
          label="Available Stock"
          value={`${qty} ${item.unit || "Pieces"}`}
          icon={Boxes}
        />

        <Detail
          label="Minimum Stock"
          value={item.minimumStock}
          icon={AlertTriangle}
        />

        <Detail
          label="Unit Cost"
          value={currency(item.unitCost)}
          icon={IndianRupee}
        />

        <Detail
          label="Stock Value"
          value={currency(qty * Number(item.unitCost || 0))}
          icon={IndianRupee}
        />

        <Detail
          label="Supplier"
          value={item.supplier || "Not specified"}
          icon={Building2}
          full
        />
      </div>

      <div className="inv-border mt-auto grid grid-cols-2 gap-2.5 border-t pt-4">
        <button
          type="button"
          onClick={() => onStock(item, "IN")}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 sm:text-sm"
        >
          <ArrowDownToLine size={17} />
          Stock In
        </button>

        <button
          type="button"
          onClick={() => onStock(item, "OUT")}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-3 text-xs font-bold text-amber-700 hover:bg-amber-100 sm:text-sm"
        >
          <ArrowUpFromLine size={17} />
          Stock Out
        </button>
      </div>
    </article>
  );
}

function HistoryCard({ record }) {
  return (
    <article className="inv-card min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
            <History size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="inv-title break-words text-sm font-extrabold">
              {record.itemName}
            </h3>

            <p className="inv-muted mt-1 text-xs">
              Stock movement
            </p>
          </div>
        </div>

        <TypeBadge type={record.type} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Detail
          label="Movement"
          value={record.type}
          icon={ArrowRightLeft}
        />

        <Detail
          label="Stock Change"
          value={
            Number(record.quantity) > 0
              ? `+${record.quantity}`
              : record.quantity
          }
          icon={Boxes}
        />

        <Detail
          label="Date & Time"
          value={formatDate(record.date)}
          icon={CalendarDays}
          full
        />

        <Detail
          label="Notes"
          value={record.note || "No notes"}
          icon={StickyNote}
          full
        />
      </div>
    </article>
  );
}

export default function Inventory() {
  const [items, setItems] = useState(() =>
    readInitial(INVENTORY_KEY, demoInventory)
  );

  const [history, setHistory] = useState(() =>
    readInitial(
      HISTORY_KEY,
      makeOpeningHistory(demoInventory)
    )
  );

  const [tab, setTab] = useState("inventory");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm);

  const [viewItem, setViewItem] = useState(null);
  const [stockItem, setStockItem] = useState(null);
  const [stockType, setStockType] = useState("IN");
  const [stockQty, setStockQty] = useState("");
  const [stockNote, setStockNote] = useState("");

  const [error, setError] = useState("");
  const [stockError, setStockError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(
        INVENTORY_KEY,
        JSON.stringify(items)
      );
    } catch {
      console.error("Unable to save inventory.");
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
      );
    } catch {
      console.error("Unable to save stock history.");
    }
  }, [history]);

  const addHistory = (record) => {
    setHistory((previous) => [
      {
        id: makeId(),
        date: new Date().toISOString(),
        ...record,
      },
      ...previous,
    ]);
  };

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
  };

  const openAdd = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setViewItem(null);
    setStockItem(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      ...createEmptyForm(),
      ...item,
      quantity: String(item.quantity ?? ""),
      minimumStock: String(item.minimumStock ?? 0),
      unitCost: String(item.unitCost ?? ""),
    });

    setEditingId(item.id);
    setViewItem(null);
    setStockItem(null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
  };

  const closeStock = () => {
    setStockItem(null);
    setStockQty("");
    setStockNote("");
    setStockError("");
  };

  const saveItem = (event) => {
    event.preventDefault();

    const quantity = Number(form.quantity);
    const minimumStock = Number(form.minimumStock);
    const unitCost = Number(form.unitCost || 0);

    if (!form.name.trim()) {
      setError("Please enter item name.");
      return;
    }

    if (
      form.quantity === "" ||
      form.minimumStock === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isInteger(minimumStock) ||
      minimumStock < 0 ||
      !Number.isFinite(unitCost) ||
      unitCost < 0
    ) {
      setError(
        "Enter valid quantity, minimum stock and unit cost."
      );
      return;
    }

    const duplicateSku = items.some(
      (item) =>
        item.id !== editingId &&
        form.sku.trim() &&
        String(item.sku || "").toLowerCase() ===
          form.sku.trim().toLowerCase()
    );

    if (duplicateSku) {
      setError(
        "This SKU already exists. Please use a different SKU."
      );
      return;
    }

    const record = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      quantity,
      minimumStock,
      unitCost,
      id: editingId || makeId(),
    };

    if (editingId) {
      const old = items.find(
        (item) => item.id === editingId
      );

      setItems((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );

      if (old && Number(old.quantity) !== quantity) {
        addHistory({
          itemId: record.id,
          itemName: record.name,
          type: "ADJUSTMENT",
          quantity:
            quantity - Number(old.quantity || 0),
          note: "Quantity adjusted while editing",
        });
      }
    } else {
      setItems((previous) => [record, ...previous]);

      addHistory({
        itemId: record.id,
        itemName: record.name,
        type: "OPENING",
        quantity,
        note: "Opening stock",
      });
    }

    closeForm();
  };

  const deleteItem = (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    setItems((previous) =>
      previous.filter(
        (record) => record.id !== item.id
      )
    );

    addHistory({
      itemId: item.id,
      itemName: item.name,
      type: "DELETED",
      quantity: 0,
      note: "Inventory item deleted",
    });

    if (viewItem?.id === item.id) setViewItem(null);
    if (stockItem?.id === item.id) closeStock();
    if (editingId === item.id) closeForm();
  };

  const openStock = (item, type) => {
    closeForm();
    setViewItem(null);
    setStockItem(item);
    setStockType(type);
    setStockQty("");
    setStockNote("");
    setStockError("");
  };

  const saveStock = (event) => {
    event.preventDefault();

    const quantity = Number(stockQty);

    if (
      stockQty === "" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setStockError(
        "Please enter a valid stock quantity."
      );
      return;
    }

    const current = items.find(
      (item) => item.id === stockItem?.id
    );

    if (!current) {
      setStockError("Inventory item not found.");
      return;
    }

    if (
      stockType === "OUT" &&
      quantity > Number(current.quantity)
    ) {
      setStockError("Not enough stock available.");
      return;
    }

    const change =
      stockType === "IN" ? quantity : -quantity;

    setItems((previous) =>
      previous.map((item) =>
        item.id === current.id
          ? {
              ...item,
              quantity:
                Number(item.quantity || 0) + change,
            }
          : item
      )
    );

    addHistory({
      itemId: current.id,
      itemName: current.name,
      type: stockType,
      quantity: change,
      note: stockNote.trim(),
    });

    closeStock();
  };

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();

    return items.filter((item) => {
      const matches = [
        item.name,
        item.sku,
        item.supplier,
        item.category,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matches &&
        (categoryFilter === "All" ||
          item.category === categoryFilter)
      );
    });
  }, [items, search, categoryFilter]);

  const lowStock = items.filter(
    (item) =>
      Number(item.quantity || 0) <=
      Number(item.minimumStock || 0)
  ).length;

  const totalStock = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const totalValue = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.unitCost || 0),
    0
  );

  const stats = [
    {
      title: "Total Items",
      value: items.length,
      icon: Package,
      color: "text-blue-700",
      bg: "bg-blue-50",
      accent: "bg-blue-600",
    },
    {
      title: "Total Stock",
      value: totalStock.toLocaleString("en-IN"),
      icon: Boxes,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      accent: "bg-indigo-600",
    },
    {
      title: "Low Stock",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      accent: "bg-red-500",
    },
    {
      title: "Stock Value",
      value: currency(totalValue),
      icon: IndianRupee,
      color: "text-green-700",
      bg: "bg-green-50",
      accent: "bg-green-600",
    },
  ];

  const currentStockItem = stockItem
    ? items.find(
        (item) => item.id === stockItem.id
      )
    : null;

  return (
    <div className="sr-inventory inv-page min-h-screen w-full min-w-0 px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
      <style>{themeCSS}</style>

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">
            Studio Raw / Stock Control
          </p>

          <h1 className="inv-title text-2xl font-extrabold tracking-tight sm:text-3xl">
            Inventory Management
          </h1>

          <p className="inv-muted mt-2 text-sm">
            Manage studio materials, stock and supplies.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="inv-primary flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition"
        >
          <Plus size={18} />
          Add Inventory
        </button>
      </div>

      {/* STATS */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="inv-card relative overflow-hidden rounded-2xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute left-0 top-0 h-1 w-full ${stat.accent}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="inv-muted text-sm font-medium">
                    {stat.title}
                  </p>

                  <h2
                    className={`mt-3 truncate whitespace-nowrap text-xl font-extrabold sm:text-2xl xl:text-3xl ${stat.color}`}
                  >
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-2xl p-3 ${stat.bg}`}>
                  <Icon
                    size={23}
                    className={stat.color}
                  />
                </div>
              </div>

              <p className="inv-muted mt-5 text-xs">
                Inventory overview
              </p>
            </div>
          );
        })}
      </div>

      {/* MAIN SECTION */}

      <section className="inv-card overflow-hidden rounded-2xl border shadow-sm">
        <div className="inv-border flex flex-wrap gap-3 border-b p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setTab("inventory")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              tab === "inventory"
                ? "inv-primary"
                : "inv-tab-inactive"
            }`}
          >
            <Package size={17} />
            Inventory
          </button>

          <button
            type="button"
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              tab === "history"
                ? "inv-primary"
                : "inv-tab-inactive"
            }`}
          >
            <History size={17} />
            Stock History
          </button>
        </div>

        {tab === "inventory" ? (
          <>
            <div className="inv-border flex flex-col gap-4 border-b p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="inv-title text-lg font-bold">
                  Inventory Items
                </h2>

                <p className="inv-muted mt-1 text-xs">
                  Showing {filteredItems.length} of {items.length} items
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative w-full sm:w-72">
                  <Search
                    size={17}
                    className="inv-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search name, SKU or supplier..."
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <div className="w-full sm:w-52">
                  <CustomDropdown
                    value={categoryFilter}
                    options={[
                      {
                        label: "All Categories",
                        value: "All",
                      },
                      ...categories,
                    ]}
                    onChange={setCategoryFilter}
                  />
                </div>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <Package
                  size={40}
                  className="inv-muted mb-4"
                />

                <h3 className="inv-title font-bold">
                  No inventory items found
                </h3>

                <p className="inv-muted mt-2 text-sm">
                  Try changing the search or add an inventory item.
                </p>

                <button
                  type="button"
                  onClick={openAdd}
                  className="inv-primary mt-5 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                >
                  <Plus size={16} />
                  Add Inventory
                </button>
              </div>
            ) : (
              <div className="inv-soft grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    onView={setViewItem}
                    onEdit={openEdit}
                    onDelete={deleteItem}
                    onStock={openStock}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="inv-border border-b p-4 sm:p-6">
              <h2 className="inv-title flex items-center gap-2 text-lg font-bold">
                <History
                  size={20}
                  className="text-blue-500"
                />
                Stock History
              </h2>

              <p className="inv-muted mt-1 text-xs">
                {history.length} stock movement records
              </p>
            </div>

            {history.length === 0 ? (
              <div className="px-4 py-20 text-center">
                <History
                  size={42}
                  className="inv-muted mx-auto mb-4"
                />

                <h3 className="inv-title font-bold">
                  No stock history available
                </h3>

                <p className="inv-muted mt-2 text-sm">
                  Stock movements will appear here.
                </p>
              </div>
            ) : (
              <div className="inv-soft grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3 2xl:grid-cols-4">
                {history.map((record) => (
                  <HistoryCard
                    key={record.id}
                    record={record}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* VIEW MODAL */}

      {viewItem && (
        <Modal
          title="Inventory Details"
          subtitle="View complete stock item information."
          onClose={() => setViewItem(null)}
          width="max-w-[650px]"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
            <div className="inv-card rounded-2xl border p-5 shadow-sm">
              <div className="inv-border flex items-start gap-3 border-b pb-5">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <Package size={24} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="inv-title break-words text-lg font-extrabold">
                    {viewItem.name}
                  </h3>

                  <p className="inv-muted mt-1 text-sm">
                    {viewItem.category}
                  </p>

                  <div className="mt-3">
                    <StatusBadge
                      low={
                        Number(viewItem.quantity || 0) <=
                        Number(viewItem.minimumStock || 0)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Detail
                  label="SKU / Item Code"
                  value={viewItem.sku}
                  icon={Hash}
                  full
                />

                <Detail
                  label="Available Stock"
                  value={`${viewItem.quantity} ${viewItem.unit}`}
                  icon={Boxes}
                />

                <Detail
                  label="Minimum Stock"
                  value={viewItem.minimumStock}
                  icon={AlertTriangle}
                />

                <Detail
                  label="Unit Cost"
                  value={currency(viewItem.unitCost)}
                  icon={IndianRupee}
                />

                <Detail
                  label="Total Value"
                  value={currency(
                    Number(viewItem.quantity || 0) *
                      Number(viewItem.unitCost || 0)
                  )}
                  icon={IndianRupee}
                />

                <Detail
                  label="Supplier"
                  value={viewItem.supplier}
                  icon={Building2}
                  full
                />

                <Detail
                  label="Notes"
                  value={viewItem.notes}
                  icon={StickyNote}
                  full
                />
              </div>
            </div>
          </div>

          <div className="inv-card inv-border shrink-0 border-t px-5 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="inv-secondary rounded-xl border px-6 py-3 text-sm font-semibold"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => openEdit(viewItem)}
                className="inv-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
              >
                <Pencil size={16} />
                Edit Inventory
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <Modal
          title={editingId ? "Edit Inventory" : "Add Inventory"}
          subtitle="Enter stock item information. Select a suggestion or type your own value."
          onClose={closeForm}
        >
          <form
            onSubmit={saveItem}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
              <div className="inv-card rounded-2xl border p-5 shadow-sm">
                <h3 className="inv-title inv-border mb-5 flex items-center gap-2 border-b pb-4 text-sm font-bold">
                  <Package
                    size={18}
                    className="text-blue-500"
                  />
                  Item Information
                </h3>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Item Name" required>
                    <SuggestionInput
                      value={form.name}
                      onChange={(value) =>
                        update("name", value)
                      }
                      options={demoInventory.map(
                        (item) => item.name
                      )}
                      placeholder="Enter item name"
                      required
                    />
                  </Field>

                  <Field label="SKU / Item Code">
                    <SuggestionInput
                      value={form.sku}
                      onChange={(value) =>
                        update("sku", value)
                      }
                      options={demoInventory.map(
                        (item) => item.sku
                      )}
                      placeholder="Enter SKU or item code"
                    />
                  </Field>

                  <Field label="Category">
                    <CustomDropdown
                      value={form.category}
                      options={categories}
                      onChange={(value) =>
                        update("category", value)
                      }
                    />
                  </Field>

                  <Field label="Unit">
                    <CustomDropdown
                      value={form.unit}
                      options={units}
                      onChange={(value) =>
                        update("unit", value)
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="inv-card rounded-2xl border p-5 shadow-sm">
                <h3 className="inv-title inv-border mb-5 flex items-center gap-2 border-b pb-4 text-sm font-bold">
                  <Boxes
                    size={18}
                    className="text-blue-500"
                  />
                  Stock & Pricing
                </h3>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Quantity" required>
                    <SuggestionInput
                      type="number"
                      min="0"
                      step="1"
                      value={form.quantity}
                      onChange={(value) =>
                        update("quantity", value)
                      }
                      options={[
                        "0", "5", "10", "20",
                        "25", "50", "100",
                      ]}
                      placeholder="Enter quantity"
                      required
                    />
                  </Field>

                  <Field label="Minimum Stock" required>
                    <SuggestionInput
                      type="number"
                      min="0"
                      step="1"
                      value={form.minimumStock}
                      onChange={(value) =>
                        update("minimumStock", value)
                      }
                      options={[
                        "0", "5", "10", "15", "20",
                      ]}
                      placeholder="Minimum stock"
                      required
                    />
                  </Field>

                  <Field label="Unit Cost (₹)">
                    <SuggestionInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.unitCost}
                      onChange={(value) =>
                        update("unitCost", value)
                      }
                      options={[
                        "120", "280", "320",
                        "450", "550", "850",
                      ]}
                      placeholder="Enter unit cost"
                    />
                  </Field>

                  <Field label="Supplier">
                    <SuggestionInput
                      value={form.supplier}
                      onChange={(value) =>
                        update("supplier", value)
                      }
                      options={demoInventory.map(
                        (item) => item.supplier
                      )}
                      placeholder="Enter supplier name"
                    />
                  </Field>
                </div>
              </div>

              <div className="inv-card rounded-2xl border p-5 shadow-sm">
                <Field label="Notes">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      update("notes", event.target.value)
                    }
                    placeholder="Enter item notes"
                    className={`${inputClass} resize-y`}
                  />
                </Field>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  <AlertTriangle
                    size={18}
                    className="shrink-0"
                  />
                  {error}
                </div>
              )}
            </div>

            <div className="inv-card inv-border shrink-0 border-t px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inv-secondary rounded-xl border px-6 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inv-primary flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold"
                >
                  <Save size={17} />
                  {editingId
                    ? "Update Inventory"
                    : "Save Inventory"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* STOCK IN / OUT MODAL */}

      {stockItem && (
        <Modal
          title={`Stock ${stockType === "IN" ? "In" : "Out"}`}
          subtitle={stockItem.name}
          onClose={closeStock}
          width="max-w-[620px]"
        >
          <form
            onSubmit={saveStock}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
              <div className="inv-soft rounded-2xl border p-5">
                <p className="inv-muted text-xs font-semibold uppercase tracking-wider">
                  Currently Available
                </p>

                <p className="inv-title mt-3 text-3xl font-extrabold">
                  {Number(
                    currentStockItem?.quantity || 0
                  ).toLocaleString("en-IN")}{" "}
                  <span className="inv-muted text-base font-semibold">
                    {stockItem.unit || "Pieces"}
                  </span>
                </p>
              </div>

              <div className="inv-card space-y-5 rounded-2xl border p-5 shadow-sm">
                <Field label="Quantity" required>
                  <SuggestionInput
                    type="number"
                    min="1"
                    step="1"
                    value={stockQty}
                    onChange={(value) => {
                      setStockQty(value);
                      setStockError("");
                    }}
                    options={[
                      "1", "2", "5", "10", "20", "50",
                    ]}
                    placeholder="Enter stock quantity"
                    required
                  />
                </Field>

                <Field label="Stock Note">
                  <SuggestionInput
                    value={stockNote}
                    onChange={setStockNote}
                    options={[
                      "New stock received",
                      "Materials used for client order",
                      "Damaged items",
                      "Supplier delivery",
                    ]}
                    placeholder="Reason for stock movement"
                  />
                </Field>
              </div>

              {stockError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  {stockError}
                </div>
              )}
            </div>

            <div className="inv-card inv-border shrink-0 border-t px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeStock}
                  className="inv-secondary rounded-xl border px-6 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white ${
                    stockType === "IN"
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "inv-primary"
                  }`}
                >
                  {stockType === "IN" ? (
                    <ArrowDownToLine size={17} />
                  ) : (
                    <ArrowUpFromLine size={17} />
                  )}

                  Confirm Stock{" "}
                  {stockType === "IN" ? "In" : "Out"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
