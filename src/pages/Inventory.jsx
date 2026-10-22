
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  Clock3,
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
  "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function currency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `INV-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

const typeColors = {
  IN: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OUT: "bg-amber-50 text-amber-700 ring-amber-200",
  OPENING: "bg-blue-50 text-blue-700 ring-blue-200",
  ADJUSTMENT: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  DELETED: "bg-red-50 text-red-700 ring-red-200",
};

function CustomDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : option
  );

  const selected = normalizedOptions.find(
    (option) => String(option.value) === String(value)
  );

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
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left font-medium`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.label || "Select"}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {normalizedOptions.map((option) => {
            const isSelected =
              String(option.value) === String(value);

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
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

function DetailBox({ label, value, icon: Icon, full = false }) {
  return (
    <div
      className={`min-w-0 rounded-xl border border-slate-100 bg-[#f7f9fc] p-3 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        {Icon && (
          <Icon size={13} className="shrink-0 text-slate-400" />
        )}

        <p className="text-[11px] font-medium text-slate-500">
          {label}
        </p>
      </div>

      <p className="min-w-0 whitespace-pre-wrap break-words text-sm font-bold text-[#10264d]">
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function StatusBadge({ low }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        low
          ? "bg-red-50 text-red-700 ring-red-200"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {low ? "Low Stock" : "In Stock"}
    </span>
  );
}

function MovementBadge({ type }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
        typeColors[type] ||
        "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
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
    slate:
      "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
    green:
      "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    amber:
      "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100",
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
  const modalRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 mx-auto flex max-h-[92dvh] w-full ${width} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8faff] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">
              Studio Raw / Inventory
            </p>

            <h2 className="text-xl font-extrabold text-[#10264d] sm:text-2xl">
              {title}
            </h2>

            <p className="mt-1 break-words text-sm text-slate-500">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}

function InventoryCard({
  item,
  onView,
  onEdit,
  onDelete,
  onStock,
}) {
  const quantity = Number(item.quantity || 0);
  const minimumStock = Number(item.minimumStock || 0);
  const isLowStock = quantity <= minimumStock;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md sm:p-5">
      {/* CARD HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Package size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-extrabold text-[#10264d] sm:text-base">
              {item.name}
            </h3>

            <p className="mt-1 break-all text-xs text-slate-400">
              {item.sku || "No SKU"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            icon={Eye}
            title="View Inventory"
            onClick={() => onView(item)}
            color="slate"
          />

          <IconButton
            icon={Pencil}
            title="Edit Inventory"
            onClick={() => onEdit(item)}
          />

          <IconButton
            icon={Trash2}
            title="Delete Inventory"
            onClick={() => onDelete(item)}
            color="red"
          />
        </div>
      </div>

      {/* CATEGORY AND STATUS */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {item.category || "Other"}
        </span>

        <StatusBadge low={isLowStock} />
      </div>

      {/* DETAILS */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <DetailBox
          label="Available Stock"
          value={`${quantity.toLocaleString("en-IN")} ${
            item.unit || "Pieces"
          }`}
          icon={Boxes}
        />

        <DetailBox
          label="Minimum Stock"
          value={minimumStock}
          icon={AlertTriangle}
        />

        <DetailBox
          label="Unit Cost"
          value={currency(item.unitCost)}
          icon={IndianRupee}
        />

        <DetailBox
          label="Stock Value"
          value={currency(
            quantity * Number(item.unitCost || 0)
          )}
          icon={IndianRupee}
        />

        <DetailBox
          label="Supplier"
          value={item.supplier || "Not specified"}
          icon={Building2}
          full
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-auto grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onStock(item, "IN")}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 sm:text-sm"
        >
          <ArrowDownToLine size={17} />
          Stock In
        </button>

        <button
          type="button"
          onClick={() => onStock(item, "OUT")}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-3 text-xs font-bold text-amber-700 transition hover:bg-amber-100 sm:text-sm"
        >
          <ArrowUpFromLine size={17} />
          Stock Out
        </button>
      </div>
    </article>
  );
}

function HistoryCard({ record }) {
  const quantity = Number(record.quantity || 0);

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <History size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-extrabold text-[#10264d] sm:text-base">
              {record.itemName}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Stock Movement
            </p>
          </div>
        </div>

        <MovementBadge type={record.type} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <DetailBox
          label="Movement"
          value={record.type}
          icon={ArrowRightLeft}
        />

        <DetailBox
          label="Stock Change"
          value={quantity > 0 ? `+${quantity}` : quantity}
          icon={Boxes}
        />

        <DetailBox
          label="Date & Time"
          value={formatDate(record.date)}
          icon={CalendarDays}
          full
        />

        <DetailBox
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
    readArray(INVENTORY_KEY)
  );

  const [history, setHistory] = useState(() =>
    readArray(HISTORY_KEY)
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
    localStorage.setItem(
      INVENTORY_KEY,
      JSON.stringify(items)
    );
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );
  }, [history]);

  const addHistory = (record) => {
    setHistory((previous) => [
      {
        id: createId(),
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

    if (error) setError("");
  };

  const openAdd = () => {
    setTab("inventory");
    setForm(createEmptyForm());
    setEditingId(null);
    setStockItem(null);
    setViewItem(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setTab("inventory");

    setForm({
      ...createEmptyForm(),
      ...item,
      quantity: String(item.quantity ?? ""),
      minimumStock: String(item.minimumStock ?? 0),
      unitCost: String(item.unitCost ?? ""),
    });

    setEditingId(item.id);
    setStockItem(null);
    setViewItem(null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
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

    const record = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      quantity,
      minimumStock,
      unitCost,
      id: editingId || createId(),
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
    if (!window.confirm(`Delete ${item.name}?`)) {
      return;
    }

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

    if (editingId === item.id) closeForm();
    if (stockItem?.id === item.id) closeStock();
    if (viewItem?.id === item.id) setViewItem(null);
  };

  const openStock = (item, type) => {
    setTab("inventory");
    closeForm();
    setViewItem(null);

    setStockItem(item);
    setStockType(type);
    setStockQty("");
    setStockNote("");
    setStockError("");
  };

  const closeStock = () => {
    setStockItem(null);
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
      const matchesSearch = [
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
        matchesSearch &&
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
    (sum, item) => sum + Number(item.quantity || 0),
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
    ? items.find((item) => item.id === stockItem.id)
    : null;

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Stock Control
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Inventory Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage studio materials, stock and supplies.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-900"
        >
          <Plus size={18} />
          Add Inventory
        </button>
      </div>

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute left-0 top-0 h-1 w-full ${stat.accent}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h2
                    className={`mt-3 break-words text-3xl font-extrabold ${stat.color}`}
                  >
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`shrink-0 rounded-2xl p-3 ${stat.bg}`}
                >
                  <Icon size={23} className={stat.color} />
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Inventory overview
              </p>
            </div>
          );
        })}
      </div>

      {/* MAIN SECTION */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* TABS */}
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setTab("inventory")}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              tab === "inventory"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Package size={17} />
            Inventory
          </button>

          <button
            type="button"
            onClick={() => setTab("history")}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              tab === "history"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <History size={17} />
            Stock History
          </button>
        </div>

        {tab === "inventory" ? (
          <>
            {/* FILTERS */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Inventory Items
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Showing {filteredItems.length} of {items.length} items
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative w-full sm:w-72">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      { label: "All Categories", value: "All" },
                      ...categories,
                    ]}
                    onChange={setCategoryFilter}
                  />
                </div>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <div className="mb-4 rounded-2xl bg-slate-50 p-5">
                  <Package
                    size={36}
                    className="text-slate-300"
                  />
                </div>

                <h3 className="font-bold text-[#10264d]">
                  No inventory items found
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {items.length === 0
                    ? "Start by adding your first inventory item."
                    : "Try changing your search or category filter."}
                </p>

                <button
                  type="button"
                  onClick={openAdd}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white"
                >
                  <Plus size={16} />
                  Add Inventory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 bg-[#fbfcff] p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-6">
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
            {/* HISTORY HEADER */}
            <div className="border-b border-slate-100 p-4 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#10264d]">
                <History size={20} className="text-blue-700" />
                Stock History
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {history.length} stock movement records
              </p>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <History
                  size={42}
                  className="mb-4 text-slate-300"
                />

                <h3 className="font-bold text-[#10264d]">
                  No stock history available
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Stock movements will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 bg-[#fbfcff] p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-6">
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

      {/* VIEW INVENTORY MODAL */}
      {viewItem && (
        <Modal
          title="Inventory Details"
          subtitle="View complete stock item information."
          onClose={() => setViewItem(null)}
          width="max-w-[650px]"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <Package size={24} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-lg font-extrabold text-[#10264d]">
                    {viewItem.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
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
                <DetailBox
                  label="SKU / Item Code"
                  value={viewItem.sku || "Not specified"}
                  icon={Hash}
                  full
                />

                <DetailBox
                  label="Available Stock"
                  value={`${Number(
                    viewItem.quantity || 0
                  ).toLocaleString("en-IN")} ${
                    viewItem.unit || "Pieces"
                  }`}
                  icon={Boxes}
                />

                <DetailBox
                  label="Minimum Stock"
                  value={viewItem.minimumStock}
                  icon={AlertTriangle}
                />

                <DetailBox
                  label="Unit Cost"
                  value={currency(viewItem.unitCost)}
                  icon={IndianRupee}
                />

                <DetailBox
                  label="Total Value"
                  value={currency(
                    Number(viewItem.quantity || 0) *
                      Number(viewItem.unitCost || 0)
                  )}
                  icon={IndianRupee}
                />

                <DetailBox
                  label="Supplier"
                  value={viewItem.supplier || "Not specified"}
                  icon={Building2}
                  full
                />

                <DetailBox
                  label="Notes"
                  value={viewItem.notes || "No notes"}
                  icon={StickyNote}
                  full
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => openEdit(viewItem)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                <Pencil size={16} />
                Edit Inventory
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT INVENTORY MODAL */}
      {showForm && (
        <Modal
          title={editingId ? "Edit Inventory" : "Add Inventory"}
          subtitle="Enter stock item information."
          onClose={closeForm}
        >
          <form
            onSubmit={saveItem}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
              {/* ITEM INFORMATION */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                  <Package
                    size={18}
                    className="text-blue-600"
                  />
                  Item Information
                </h3>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Item Name" required>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(event) =>
                        update("name", event.target.value)
                      }
                      placeholder="Enter item name"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="SKU / Item Code">
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(event) =>
                        update("sku", event.target.value)
                      }
                      placeholder="Enter SKU or item code"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Category">
                    <CustomDropdown
                      value={form.category}
                      options={categories}
                      onChange={(value) =>
                        update("category", value)
                      }
                    />
                  </FormField>

                  <FormField label="Unit">
                    <CustomDropdown
                      value={form.unit}
                      options={units}
                      onChange={(value) =>
                        update("unit", value)
                      }
                    />
                  </FormField>
                </div>
              </div>

              {/* STOCK & PRICING */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                  <Boxes
                    size={18}
                    className="text-blue-600"
                  />
                  Stock & Pricing
                </h3>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Quantity" required>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.quantity}
                      onChange={(event) =>
                        update("quantity", event.target.value)
                      }
                      placeholder="Enter quantity"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Minimum Stock" required>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.minimumStock}
                      onChange={(event) =>
                        update(
                          "minimumStock",
                          event.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Unit Cost (₹)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.unitCost}
                      onChange={(event) =>
                        update("unitCost", event.target.value)
                      }
                      placeholder="Enter unit cost"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Supplier">
                    <input
                      type="text"
                      value={form.supplier}
                      onChange={(event) =>
                        update("supplier", event.target.value)
                      }
                      placeholder="Enter supplier name"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>

              {/* NOTES */}
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <FormField label="Notes">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      update("notes", event.target.value)
                    }
                    placeholder="Additional item details..."
                    className={`${inputClass} resize-y`}
                  />
                </FormField>
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

            {/* FIXED FOOTER */}
            <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-7 py-3 text-sm font-semibold text-white hover:bg-blue-900"
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
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Currently Available
                </p>

                <p className="mt-3 break-words text-3xl font-extrabold text-[#10264d]">
                  {Number(
                    currentStockItem?.quantity || 0
                  ).toLocaleString("en-IN")}{" "}
                  <span className="text-base font-semibold text-slate-500">
                    {stockItem.unit || "Pieces"}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="space-y-5">
                  <FormField label="Quantity" required>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={stockQty}
                      onChange={(event) => {
                        setStockQty(event.target.value);
                        setStockError("");
                      }}
                      placeholder="Enter stock quantity"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Stock Note">
                    <textarea
                      rows={4}
                      value={stockNote}
                      onChange={(event) =>
                        setStockNote(event.target.value)
                      }
                      placeholder="Reason for stock movement..."
                      className={`${inputClass} resize-y`}
                    />
                  </FormField>
                </div>
              </div>

              {stockError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  <AlertTriangle
                    size={18}
                    className="shrink-0"
                  />
                  {stockError}
                </div>
              )}
            </div>

            {/* FIXED FOOTER */}
            <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeStock}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white ${
                    stockType === "IN"
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-[#10264d] hover:bg-blue-900"
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
