
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  Plus,
  Search,
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
  Tag,
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

const units = [
  "Pieces",
  "Boxes",
  "Rolls",
  "Packs",
  "Sets",
];

const emptyForm = {
  name: "",
  category: "Albums",
  sku: "",
  quantity: "",
  minimumStock: "5",
  unit: "Pieces",
  unitCost: "",
  supplier: "",
  notes: "",
};

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

function CustomDropdown({
  value,
  options,
  onChange,
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

  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : option
  );

  const selected = normalizedOptions.find(
    (option) => String(option.value) === String(value)
  );

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {selected?.label || value || "Select"}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="mt-2 max-h-60 w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
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
  const [form, setForm] = useState({ ...emptyForm });

  const [stockItem, setStockItem] = useState(null);
  const [stockType, setStockType] = useState("IN");
  const [stockQty, setStockQty] = useState("");
  const [stockNote, setStockNote] = useState("");

  const [error, setError] = useState("");
  const [stockError, setStockError] = useState("");

  const formRef = useRef(null);
  const stockRef = useRef(null);

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

  const scrollTo = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

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
  };

  const openAdd = () => {
    setTab("inventory");
    setForm({ ...emptyForm });
    setEditingId(null);
    setStockItem(null);
    setError("");
    setShowForm(true);
    scrollTo(formRef);
  };

  const openEdit = (item) => {
    setTab("inventory");

    setForm({
      ...emptyForm,
      ...item,
      quantity: String(item.quantity ?? ""),
      minimumStock: String(item.minimumStock ?? 0),
      unitCost: String(item.unitCost ?? ""),
    });

    setEditingId(item.id);
    setStockItem(null);
    setError("");
    setShowForm(true);
    scrollTo(formRef);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
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

      if (
        old &&
        Number(old.quantity) !== quantity
      ) {
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
      setItems((previous) => [
        record,
        ...previous,
      ]);

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
    if (
      !window.confirm(
        `Delete ${item.name}?`
      )
    ) {
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

    if (editingId === item.id) {
      closeForm();
    }

    if (stockItem?.id === item.id) {
      setStockItem(null);
    }
  };

  const openStock = (item, type) => {
    setTab("inventory");
    closeForm();

    setStockItem(item);
    setStockType(type);
    setStockQty("");
    setStockNote("");
    setStockError("");

    scrollTo(stockRef);
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
      setStockError(
        "Inventory item not found."
      );
      return;
    }

    if (
      stockType === "OUT" &&
      quantity > Number(current.quantity)
    ) {
      setStockError(
        "Not enough stock available."
      );
      return;
    }

    const change =
      stockType === "IN"
        ? quantity
        : -quantity;

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
    },
    {
      title: "Total Stock",
      value: totalStock.toLocaleString("en-IN"),
      icon: Boxes,
      color: "text-indigo-700",
    },
    {
      title: "Low Stock",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Stock Value",
      value: currency(totalValue),
      icon: IndianRupee,
      color: "text-green-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Inventory Management
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage studio materials, stock and supplies.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          Add Inventory
        </button>
      </div>

      {/* Statistics */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                  <Icon
                    size={22}
                    className={stat.color}
                  />
                </div>
              </div>

              <h2
                className={`mt-3 break-words text-3xl font-bold ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Main Section */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">

        {/* Tabs */}
        <div className="mb-5 flex w-full min-w-0 flex-col gap-3 border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => setTab("inventory")}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              tab === "inventory"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Package size={17} />
            Inventory
          </button>

          <button
            type="button"
            onClick={() => setTab("history")}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
              tab === "history"
                ? "bg-[#10264d] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <History size={17} />
            Stock History
          </button>
        </div>

        {tab === "inventory" ? (
          <>
            <h2 className="mb-5 text-lg font-bold text-[#10264d]">
              Inventory Items
            </h2>

            {/* Search */}
            <div className="relative mb-4 w-full min-w-0">
              <Search
                size={17}
                className="absolute left-3 top-3.5 text-slate-400"
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

            {/* Category Filter */}
            <div className="mb-5 w-full min-w-0">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Filter by Category
              </p>

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

            {/* Inventory Cards */}
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center">
                <Package
                  size={42}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm text-slate-400">
                  No inventory items found
                </p>
              </div>
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-4">
                {filteredItems.map((item) => {
                  const quantity = Number(
                    item.quantity || 0
                  );

                  const minimumStock = Number(
                    item.minimumStock || 0
                  );

                  const isLowStock =
                    quantity <= minimumStock;

                  return (
                    <article
                      key={item.id}
                      className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                    >
                      <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-bold text-[#10264d]">
                            {item.name}
                          </h3>

                          <p className="mt-1 break-words text-sm text-slate-500">
                            {item.category}
                          </p>
                        </div>

                        <span
                          className={`w-fit max-w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                            isLowStock
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isLowStock
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </div>

                      <Detail
                        label="SKU / Item Code"
                        value={item.sku || "Not specified"}
                      />

                      <Detail
                        label="Available Stock"
                        value={`${quantity.toLocaleString("en-IN")} ${
                          item.unit || "Pieces"
                        }`}
                      />

                      <Detail
                        label="Minimum Stock"
                        value={minimumStock}
                      />

                      <Detail
                        label="Unit Cost"
                        value={currency(item.unitCost)}
                      />

                      <Detail
                        label="Total Stock Value"
                        value={currency(
                          quantity *
                            Number(item.unitCost || 0)
                        )}
                      />

                      <Detail
                        label="Supplier"
                        value={
                          item.supplier || "Not specified"
                        }
                      />

                      {item.notes && (
                        <Detail
                          label="Notes"
                          value={item.notes}
                        />
                      )}

                      {/* Actions */}
                      <div className="flex w-full flex-col gap-3 border-t border-slate-200 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            openStock(item, "IN")
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
                        >
                          <ArrowDownToLine size={17} />
                          Stock In
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openStock(item, "OUT")
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                        >
                          <ArrowUpFromLine size={17} />
                          Stock Out
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900"
                        >
                          <Pencil size={17} />
                          Edit Inventory
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteItem(item)
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                          Delete Item
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-2">
              <History
                size={20}
                className="text-blue-700"
              />

              <h2 className="text-lg font-bold text-[#10264d]">
                Stock History
              </h2>
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center">
                <History
                  size={42}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm text-slate-400">
                  No stock history available
                </p>
              </div>
            ) : (
              <div className="flex w-full min-w-0 flex-col gap-4">
                {history.map((record) => {
                  const typeColors = {
                    IN: "bg-green-100 text-green-700",
                    OUT: "bg-amber-100 text-amber-700",
                    OPENING: "bg-blue-100 text-blue-700",
                    ADJUSTMENT:
                      "bg-indigo-100 text-indigo-700",
                    DELETED: "bg-red-100 text-red-700",
                  };

                  return (
                    <article
                      key={record.id}
                      className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
                    >
                      <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                        <h3 className="break-words text-base font-bold text-[#10264d]">
                          {record.itemName}
                        </h3>

                        <span
                          className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                            typeColors[record.type] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {record.type}
                        </span>
                      </div>

                      <Detail
                        label="Date & Time"
                        value={formatDate(record.date)}
                      />

                      <Detail
                        label="Stock Change"
                        value={
                          Number(record.quantity) > 0
                            ? `+${record.quantity}`
                            : String(record.quantity)
                        }
                      />

                      <Detail
                        label="Note"
                        value={
                          record.note || "No notes"
                        }
                      />
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Add / Edit Inventory Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Edit Inventory"
                  : "Add Inventory"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter stock item information.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close form"
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveItem}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Item Name">
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

            <FormField label="Quantity">
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

            <FormField label="Minimum Stock">
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

            <FormField label="Unit">
              <CustomDropdown
                value={form.unit}
                options={units}
                onChange={(value) =>
                  update("unit", value)
                }
              />
            </FormField>

            <FormField label="Unit Cost (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(event) =>
                  update(
                    "unitCost",
                    event.target.value
                  )
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
                  update(
                    "supplier",
                    event.target.value
                  )
                }
                placeholder="Enter supplier name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  update(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Additional item details..."
                className={inputClass}
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 break-words text-sm font-medium text-red-600"
              >
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                {error}
              </p>
            )}

            <div className="flex w-full flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                <Save size={17} />
                {editingId
                  ? "Update Inventory"
                  : "Save Inventory"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Stock In / Stock Out Form */}
      {stockItem && (
        <section
          ref={stockRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                Stock {stockType === "IN" ? "In" : "Out"}
              </h2>

              <p className="mt-2 break-words text-sm text-slate-500">
                {stockItem.name}
              </p>
            </div>

            <button
              type="button"
              onClick={closeStock}
              aria-label="Close stock form"
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={21} />
            </button>
          </div>

          <div className="mb-5 rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Currently Available
            </p>

            <p className="mt-2 break-words text-2xl font-bold text-[#10264d]">
              {Number(
                items.find(
                  (item) => item.id === stockItem.id
                )?.quantity || 0
              ).toLocaleString("en-IN")}{" "}
              {stockItem.unit || "Pieces"}
            </p>
          </div>

          <form
            onSubmit={saveStock}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Quantity">
              <input
                type="number"
                min="1"
                step="1"
                required
                value={stockQty}
                onChange={(event) =>
                  setStockQty(event.target.value)
                }
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
                className={inputClass}
              />
            </FormField>

            {stockError && (
              <p
                role="alert"
                className="flex items-start gap-2 break-words text-sm font-medium text-red-600"
              >
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                {stockError}
              </p>
            )}

            <div className="flex w-full flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeStock}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white ${
                  stockType === "IN"
                    ? "bg-green-700 hover:bg-green-800"
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
          </form>
        </section>
      )}
    </div>
  );
}
