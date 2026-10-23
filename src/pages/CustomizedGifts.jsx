
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Gift,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Package,
  CheckCircle2,
  Clock3,
  Wallet,
  ChevronDown,
  UserRound,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

const KEY = "studioraw_customized_gifts";
const SOUND_KEY = "studioraw_dashboard_sound";

const GIFT_TYPES = [
  "Photo Frame / Photo Click",
  "Photo Cap / Photo Bottle",
  "Magic Mirror / Magic Cup",
  "Printed Cup",
  "Magic Pillow",
  "Wedding Calendar",
  "3D Name / Modelling",
  "Handmade Calligraphy",
  "Handmade Gifts",
  "Custom Package",
  
];

const OCCASIONS = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Anniversary",
  "Valentine's Day",
  "Baby Shower",
  "Housewarming",
  "Graduation",
  "Farewell",
  "Corporate Gift",
  "Festival",
  "Other",
];

const SIZES = [
  "Standard",
  "Small",
  "Medium",
  "Large",
  "4x6 inches",
  "5x7 inches",
  "6x8 inches",
  "8x10 inches",
  "8x12 inches",
  "10x12 inches",
  "12x12 inches",
  "12x18 inches",
  "16x16 inches",
  "16x20 inches",
  "18x24 inches",
  "A4",
  "A3",
  "Custom Size",
];

const STATUSES = [
  "Pending",
  "Designing",
  "Printing",
  "Ready",
  "Delivered",
  "Cancelled",
];

const PAYMENT_MODES = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
];

const demoData = [
  {
    id: 1,
    customer: "Arun Kumar",
    phone: "9876543210",
    giftType: "LED Photo Frame",
    occasion: "Wedding",
    quantity: 2,
    orderDate: "2026-10-20",
    deliveryDate: "2026-10-28",
    customization: "Couple photo with names",
    size: "12x18 inches",
    amount: 3500,
    advance: 1500,
    paymentMode: "UPI",
    status: "Designing",
    notes: "Warm white LED",
  },
  {
    id: 2,
    customer: "Priya",
    phone: "9876501234",
    giftType: "Photo Mug",
    occasion: "Birthday",
    quantity: 5,
    orderDate: "2026-10-18",
    deliveryDate: "2026-10-25",
    customization: "Birthday photos and wishes",
    size: "Standard",
    amount: 2500,
    advance: 2500,
    paymentMode: "Cash",
    status: "Ready",
    notes: "",
  },
  {
    id: 3,
    customer: "Vijay",
    phone: "9876512345",
    giftType: "Customized Photo Album",
    occasion: "Anniversary",
    quantity: 1,
    orderDate: "2026-10-12",
    deliveryDate: "2026-10-21",
    customization: "30-page couple album",
    size: "12x12 inches",
    amount: 6500,
    advance: 6500,
    paymentMode: "UPI",
    status: "Delivered",
    notes: "Premium matte finish",
  },
  {
    id: 4,
    customer: "Divya",
    phone: "9876523456",
    giftType: "Photo Cushion",
    occasion: "Birthday",
    quantity: 3,
    orderDate: "2026-10-21",
    deliveryDate: "2026-11-02",
    customization: "Family photo print",
    size: "16x16 inches",
    amount: 3000,
    advance: 1000,
    paymentMode: "Cash",
    status: "Pending",
    notes: "",
  },
  {
    id: 5,
    customer: "Karthik",
    phone: "9876534567",
    giftType: "Crystal Photo Gift",
    occasion: "Anniversary",
    quantity: 2,
    orderDate: "2026-10-22",
    deliveryDate: "2026-11-04",
    customization: "Couple portrait engraving",
    size: "Medium",
    amount: 4800,
    advance: 2000,
    paymentMode: "UPI",
    status: "Printing",
    notes: "Gift wrapping required",
  },
  {
    id: 6,
    customer: "Meena",
    phone: "9876545670",
    giftType: "Photo Calendar",
    occasion: "Corporate Gift",
    quantity: 20,
    orderDate: "2026-10-19",
    deliveryDate: "2026-11-10",
    customization: "Company branding",
    size: "A4",
    amount: 12000,
    advance: 5000,
    paymentMode: "Bank Transfer",
    status: "Pending",
    notes: "Bulk order",
  },
];

const today = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const emptyForm = () => ({
  customer: "",
  phone: "",
  giftType: "Photo Frame",
  occasion: "Birthday",
  quantity: "1",
  orderDate: today(),
  deliveryDate: "",
  customization: "",
  size: "Standard",
  amount: "",
  advance: "",
  paymentMode: "Cash",
  status: "Pending",
  notes: "",
});

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#dce5f1] bg-white px-3.5 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#1c477e] focus:ring-2 focus:ring-blue-100";

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  options,
  placeholder = "",
  required = false,
  min,
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label
        htmlFor={`gift-${name}`}
        className="block text-xs font-semibold text-[#344767]"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {options ? (
        <div className="relative">
          <select
            id={`gift-${name}`}
            value={value ?? ""}
            onChange={(e) => onChange(name, e.target.value)}
            required={required}
            className={`${inputClass} appearance-none pr-10`}
          >
            {[
              ...new Set(
                value && !options.includes(value)
                  ? [value, ...options]
                  : options
              ),
            ].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#607b9f]"
          />
        </div>
      ) : (
        <input
          id={`gift-${name}`}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          required={required}
          min={min ?? (type === "number" ? 0 : undefined)}
          step={
            type === "number"
              ? name === "quantity"
                ? 1
                : "0.01"
              : undefined
          }
          className={inputClass}
        />
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-[#e7edf5] pb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf1fa] text-[#102f62]">
        <Icon size={18} />
      </div>

      <h3 className="text-sm font-bold text-[#10264d]">
        {title}
      </h3>
    </div>
  );
}

const statusClass = (status) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-700",
    Designing: "bg-purple-50 text-purple-700",
    Printing: "bg-blue-50 text-blue-700",
    Ready: "bg-cyan-50 text-cyan-700",
    Delivered: "bg-green-50 text-green-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
};

function playSound(type, enabled) {
  if (!enabled) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value =
      type === "save" ? 740 : type === "delete" ? 320 : 520;

    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.13
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.13);

    oscillator.onended = () => {
      context.close().catch(() => {});
    };
  } catch {
    // Audio is optional.
  }
}

export default function CustomizedGifts() {
  const [gifts, setGifts] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);

      if (saved === null) return demoData;

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : demoData;
    } catch {
      return demoData;
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(gifts));
    } catch {
      // Keep current session data if storage is unavailable.
    }
  }, [gifts]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SOUND_KEY,
        String(soundEnabled)
      );
    } catch {
      // Sound preference is optional.
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return gifts.filter((gift) => {
      const matchesSearch = [
        gift.customer,
        gift.phone,
        gift.giftType,
        gift.occasion,
        gift.customization,
        gift.status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matchesSearch &&
        (statusFilter === "All" ||
          gift.status === statusFilter) &&
        (typeFilter === "All" ||
          gift.giftType === typeFilter)
      );
    });
  }, [gifts, search, statusFilter, typeFilter]);

  const pendingBalance = gifts.reduce(
    (sum, gift) =>
      sum +
      Math.max(
        0,
        Number(gift.amount || 0) -
          Number(gift.advance || 0)
      ),
    0
  );

  const stats = [
    {
      title: "Total Gift Orders",
      value: gifts.length,
      icon: Gift,
      color: "bg-[#eaf1fa] text-[#102f62]",
    },
    {
      title: "Pending Orders",
      value: gifts.filter((gift) =>
        ["Pending", "Designing", "Printing"].includes(
          gift.status
        )
      ).length,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Delivered Gifts",
      value: gifts.filter(
        (gift) => gift.status === "Delivered"
      ).length,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Pending Balance",
      value: money(pendingBalance),
      icon: Wallet,
      color: "bg-red-50 text-red-700",
    },
  ];

  const updateForm = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setOpen(true);
    playSound("open", soundEnabled);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      ...emptyForm(),
      ...item,
    });
    setError("");
    setOpen(true);
    playSound("open", soundEnabled);
  };

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setError("");
  };

  const saveGift = (e) => {
    e.preventDefault();

    if (
      !String(form.customer).trim() ||
      !String(form.phone).trim()
    ) {
      setError("Please enter customer details.");
      return;
    }

    if (
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 1
    ) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (
      form.amount === "" ||
      form.advance === "" ||
      !Number.isFinite(Number(form.amount)) ||
      !Number.isFinite(Number(form.advance)) ||
      Number(form.amount) < 0 ||
      Number(form.advance) < 0
    ) {
      setError("Please enter valid payment amounts.");
      return;
    }

    if (Number(form.advance) > Number(form.amount)) {
      setError("Advance cannot exceed total amount.");
      return;
    }

    if (
      form.deliveryDate &&
      form.orderDate &&
      form.deliveryDate < form.orderDate
    ) {
      setError("Delivery date cannot be before order date.");
      return;
    }

    const record = {
      ...form,
      id:
        editingId !== null
          ? editingId
          : `GIFT-${Date.now()}`,
      quantity: Number(form.quantity),
      amount: Number(form.amount),
      advance: Number(form.advance),
    };

    if (editingId !== null) {
      setGifts((prev) =>
        prev.map((gift) =>
          gift.id === editingId ? record : gift
        )
      );
    } else {
      setGifts((prev) => [record, ...prev]);
    }

    playSound("save", soundEnabled);
    closeForm();
  };

  const deleteGift = (id) => {
    if (!window.confirm("Delete this gift order?")) return;

    setGifts((prev) =>
      prev.filter((gift) => gift.id !== id)
    );

    playSound("delete", soundEnabled);
  };

  const balanceOf = (gift) =>
    Math.max(
      0,
      Number(gift.amount || 0) -
        Number(gift.advance || 0)
    );

  return (
    <div className="min-h-screen min-w-0 bg-[#f3f6fb] p-3 text-[#10264d] sm:p-5 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#102f62] p-3 text-white shadow-sm">
              <Gift size={23} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold sm:text-2xl">
                Customized Gifts
              </h1>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Manage personalized gift orders and deliveries
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAdd}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102f62] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c477e] sm:flex-none"
            >
              <Plus size={18} />
              Add Gift Order
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <div
                    className={`shrink-0 rounded-xl p-2.5 ${stat.color}`}
                  >
                    <Icon size={19} />
                  </div>
                </div>

                <h2 className="mt-4 truncate whitespace-nowrap text-lg font-bold text-[#10264d] sm:text-xl xl:text-2xl">
                  {stat.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* ORDERS */}
        <div className="overflow-hidden rounded-2xl border border-[#e0e8f2] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#e9eef5] p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Gift Orders
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filtered.length} orders found
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[210px_190px_155px]">
              <div className="relative sm:col-span-2 xl:col-span-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search gifts..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value)
                  }
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="All">All Gift Types</option>

                  {GIFT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="All">All Status</option>

                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* MOBILE / TABLET CARDS */}
          <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="min-w-0 overflow-hidden rounded-xl border border-[#e0e8f2] bg-white"
              >
                <div className="flex items-start justify-between gap-3 bg-[#f5f8fd] p-4">
                  <div className="min-w-0">
                    <h3 className="break-words font-bold text-[#10264d]">
                      {item.customer}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.phone}
                    </p>

                    <span
                      className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      title="Edit order"
                      className="rounded-lg border border-blue-100 bg-white p-2 text-[#17477e]"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteGift(item.id)}
                      title="Delete order"
                      className="rounded-lg border border-red-100 bg-white p-2 text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4">
                  {[
                    ["Gift Type", item.giftType],
                    ["Occasion", item.occasion],
                    ["Quantity", item.quantity],
                    ["Size", item.size || "—"],
                    ["Order Date", item.orderDate],
                    ["Delivery Date", item.deliveryDate],
                    ["Total", money(item.amount)],
                    ["Balance", money(balanceOf(item))],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-xs text-slate-400">
                        {label}
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500 sm:col-span-2">
                No gift orders found.
              </div>
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#102f62] text-xs uppercase text-white">
                <tr>
                  {[
                    "Customer",
                    "Gift Type",
                    "Occasion",
                    "Qty",
                    "Order Date",
                    "Delivery Date",
                    "Total",
                    "Balance",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-4 font-semibold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf1f6]">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[#f4f8fe]"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#10264d]">
                        {item.customer}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.phone}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {item.giftType}
                    </td>

                    <td className="px-4 py-4">
                      {item.occasion}
                    </td>

                    <td className="px-4 py-4">
                      {item.quantity}
                    </td>

                    <td className="px-4 py-4">
                      {item.orderDate}
                    </td>

                    <td className="px-4 py-4">
                      {item.deliveryDate}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {money(item.amount)}
                    </td>

                    <td className="px-4 py-4 font-semibold text-red-600">
                      {money(balanceOf(item))}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          title="Edit order"
                          className="rounded-lg border border-[#dce5f1] p-2 text-[#17477e] hover:bg-blue-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteGift(item.id)}
                          title="Delete order"
                          className="rounded-lg border border-[#dce5f1] p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-14 text-center text-slate-500"
                    >
                      No gift orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#06152b]/75 p-2 sm:p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                closeForm();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Customized Gift Order Form"
              className="flex max-h-[calc(100dvh-16px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-32px)]"
            >
              {/* DARK BLUE MODAL HEADER */}
              <div className="flex shrink-0 items-center justify-between gap-3 bg-[#102f62] px-4 py-4 text-white sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0 rounded-xl bg-white/15 p-2.5">
                    <Gift size={20} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-bold sm:text-lg">
                      {editingId !== null
                        ? "Edit Gift Order"
                        : "Add Gift Order"}
                    </h2>

                    <p className="mt-1 text-xs text-blue-100">
                      Gift customization and delivery details
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  title="Close"
                  className="shrink-0 rounded-lg p-2 text-white hover:bg-white/15"
                >
                  <X size={21} />
                </button>
              </div>

              <form
                onSubmit={saveGift}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-white px-4 py-5 sm:px-6">
                  {/* CUSTOMER */}
                  <section>
                    <SectionTitle
                      icon={UserRound}
                      title="Customer Details"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Customer Name"
                        name="customer"
                        value={form.customer}
                        onChange={updateForm}
                        placeholder="Enter customer name"
                        required
                      />

                      <Field
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateForm}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                  </section>

                  {/* GIFT */}
                  <section>
                    <SectionTitle
                      icon={Package}
                      title="Gift Details"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Gift Type"
                        name="giftType"
                        value={form.giftType}
                        onChange={updateForm}
                        options={GIFT_TYPES}
                        required
                      />

                      <Field
                        label="Occasion"
                        name="occasion"
                        value={form.occasion}
                        onChange={updateForm}
                        options={OCCASIONS}
                      />

                      <Field
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={form.quantity}
                        onChange={updateForm}
                        min={1}
                        required
                      />

                      <Field
                        label="Size / Dimension"
                        name="size"
                        value={form.size}
                        onChange={updateForm}
                        options={SIZES}
                      />

                      <Field
                        label="Order Date"
                        name="orderDate"
                        type="date"
                        value={form.orderDate}
                        onChange={updateForm}
                        required
                      />

                      <Field
                        label="Expected Delivery Date"
                        name="deliveryDate"
                        type="date"
                        value={form.deliveryDate}
                        onChange={updateForm}
                        required
                      />

                      <Field
                        label="Order Status"
                        name="status"
                        value={form.status}
                        onChange={updateForm}
                        options={STATUSES}
                      />

                      <Field
                        label="Payment Mode"
                        name="paymentMode"
                        value={form.paymentMode}
                        onChange={updateForm}
                        options={PAYMENT_MODES}
                      />
                    </div>

                    <label className="mt-4 block space-y-2">
                      <span className="text-xs font-semibold text-[#344767]">
                        Customization Details
                      </span>

                      <textarea
                        rows={3}
                        value={form.customization}
                        onChange={(e) =>
                          updateForm(
                            "customization",
                            e.target.value
                          )
                        }
                        placeholder="Photo, name, text, color or design requirements..."
                        className={`${inputClass} resize-y`}
                      />
                    </label>
                  </section>

                  {/* PAYMENT */}
                  <section>
                    <SectionTitle
                      icon={IndianRupee}
                      title="Payment Details"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Total Amount (₹)"
                        name="amount"
                        type="number"
                        value={form.amount}
                        onChange={updateForm}
                        placeholder="Enter total amount"
                        required
                      />

                      <Field
                        label="Advance Paid (₹)"
                        name="advance"
                        type="number"
                        value={form.advance}
                        onChange={updateForm}
                        placeholder="Enter advance"
                        required
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce7f6] bg-[#eef4fc] px-4 py-4">
                      <span className="text-sm font-semibold text-[#234e81]">
                        Remaining Balance
                      </span>

                      <span className="break-words text-lg font-bold text-[#102f62]">
                        {money(
                          Math.max(
                            0,
                            Number(form.amount || 0) -
                              Number(form.advance || 0)
                          )
                        )}
                      </span>
                    </div>
                  </section>

                  {/* NOTES */}
                  <section>
                    <SectionTitle
                      icon={CalendarDays}
                      title="Additional Information"
                    />

                    <label className="block space-y-2">
                      <span className="text-xs font-semibold text-[#344767]">
                        Additional Notes
                      </span>

                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) =>
                          updateForm("notes", e.target.value)
                        }
                        placeholder="Enter additional requirements..."
                        className={`${inputClass} resize-y`}
                      />
                    </label>
                  </section>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[#e7edf5] bg-[#f8fafd] px-4 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 rounded-xl border border-[#dce5f1] bg-white px-5 py-3 text-sm font-semibold text-[#102f62] hover:bg-slate-50 sm:flex-none"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102f62] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1c477e] sm:flex-none"
                  >
                    <Save size={17} />

                    {editingId !== null
                      ? "Update Gift Order"
                      : "Save Gift Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
