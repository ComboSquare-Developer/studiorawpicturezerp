import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
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
  RotateCcw,
  Sparkles,
  AlertCircle,
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
  "Photo Frame / Photo Click",
  "Photo Cap / Photo Bottle",
  "Magic Mirror / Magic Cup",
  "Printed Cup",
  "Magic Pillow",
  "Wedding Calendar",
  "3D Name / Modelling",
  "Handmade Calligraphy",
  "Custom Package",
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

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Card"];

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
  giftType: "",
  occasion: "",
  quantity: "1",
  orderDate: today(),
  deliveryDate: "",
  customization: "",
  size: "",
  amount: "",
  advance: "",
  paymentMode: "",
  status: "",
  notes: "",
});

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const balanceOf = (gift) =>
  Math.max(
    0,
    Number(gift.amount || 0) - Number(gift.advance || 0)
  );

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#cfe2f7] bg-white px-3.5 py-3 text-sm text-[#183c68] outline-none transition placeholder:text-[#94abc4] focus:border-[#63a6e7] focus:ring-4 focus:ring-[#dcefff]";

const statusClass = (status) => {
  const styles = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Designing: "border-violet-200 bg-violet-50 text-violet-700",
    Printing: "border-sky-200 bg-sky-50 text-sky-700",
    Ready: "border-cyan-200 bg-cyan-50 text-cyan-700",
    Delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return styles[status] || "border-slate-200 bg-slate-50 text-slate-600";
};

function useCountUp(target, replayKey = 0, duration = 1350) {
  const [display, setDisplay] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const end = Number(target) || 0;

    if (
      typeof window === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      currentRef.current = end;
      setDisplay(end);
      return;
    }

    const start = replayKey ? 0 : currentRef.current;
    let frame;
    let startTime;

    currentRef.current = start;
    setDisplay(start);

    const animate = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(start + (end - start) * eased);

      currentRef.current = next;
      setDisplay(next);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        currentRef.current = end;
        setDisplay(end);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [target, replayKey, duration]);

  return display;
}

function StatCard({
  title,
  value,
  icon: Icon,
  currency = false,
  shade,
}) {
  const [replay, setReplay] = useState(0);
  const animated = useCountUp(value, replay);

  return (
    <button
      type="button"
      onClick={() => setReplay((previous) => previous + 1)}
      title="Click to replay counting animation"
      aria-label={`Replay ${title} count animation`}
      className="group relative w-full min-w-0 overflow-hidden rounded-[22px] border border-[#cfe5fb] bg-white p-5 text-left shadow-[0_8px_28px_rgba(50,112,180,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#8ac2f4] hover:shadow-[0_14px_35px_rgba(50,112,180,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r ${shade}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#6685a6] sm:text-sm">
            {title}
          </p>

          <h2 className="mt-4 truncate text-[25px] font-extrabold tracking-tight text-[#164579] sm:text-[28px]">
            {currency ? money(animated) : animated.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d5e9fd] bg-gradient-to-br from-[#e5f4ff] to-[#c9e6ff] text-[#2873b7]">
          <Icon size={23} strokeWidth={2.1} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-[#8aa6c1]">
        <RotateCcw
          size={12}
          className="transition-transform duration-500 group-hover:rotate-90"
        />
        Click to replay
      </div>
    </button>
  );
}

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
  const id = `gift-${name}`;

  return (
    <div className="min-w-0 space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-bold text-[#315b85]"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      {options ? (
        <div className="relative">
          <select
            id={id}
            value={value ?? ""}
            onChange={(event) => onChange(name, event.target.value)}
            required={required}
            className={`${inputClass} appearance-none pr-10`}
          >
            <option value="">
              Select {label.toLowerCase()}
            </option>

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
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6592bd]"
          />
        </div>
      ) : (
        <input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={(event) =>
            onChange(
              name,
              type === "tel"
                ? event.target.value.replace(/\D/g, "").slice(0, 10)
                : event.target.value
            )
          }
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
          inputMode={type === "tel" ? "numeric" : undefined}
          maxLength={type === "tel" ? 10 : undefined}
          className={inputClass}
        />
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-[#dcebf9] pb-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#e7f5ff] to-[#cde8ff] text-[#2873b7]">
        <Icon size={18} />
      </div>

      <h3 className="text-sm font-extrabold text-[#164579]">
        {title}
      </h3>
    </div>
  );
}

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
    // Sound is optional.
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
  const [notice, setNotice] = useState("");

  const [soundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) === "true";
    } catch {
      return false;
    }
  });

  /* =========================================
     BACKEND API INTEGRATION
  ========================================= */

  useEffect(() => {
    let isMounted = true;
    api.customizedGifts
      .list()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setGifts(
            data.map((item) => ({
              id: item.id,
              customer: item.customer_name || "Customer",
              phone: item.phone || "",
              giftType: item.gift_type || item.gift_name || "Custom Package",
              occasion: item.gift_name || "",
              quantity: Number(item.quantity || 1),
              orderDate: item.order_date || today(),
              deliveryDate: item.delivery_date || "",
              customization: item.customization_details || "",
              size: item.delivery_address || "Standard",
              amount: Number(item.total_amount || 0),
              advance: Number(item.advance_amount || 0),
              paymentMode: "Cash",
              status: item.status || "Pending",
              notes: item.notes || "",
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Backend customized gifts load notice:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(gifts));
    } catch {
      // Keep session data when storage is unavailable.
    }
  }, [gifts]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setEditingId(null);
        setError("");
      }
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
        gift.paymentMode,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matchesSearch &&
        (statusFilter === "All" || gift.status === statusFilter) &&
        (typeFilter === "All" || gift.giftType === typeFilter)
      );
    });
  }, [gifts, search, statusFilter, typeFilter]);

  const pendingBalance = useMemo(
    () => gifts.reduce((sum, gift) => sum + balanceOf(gift), 0),
    [gifts]
  );

  const stats = [
    {
      title: "Total Gift Orders",
      value: gifts.length,
      icon: Gift,
      shade: "from-[#4a9be7] to-[#9bd6ff]",
    },
    {
      title: "Pending Orders",
      value: gifts.filter((gift) =>
        ["Pending", "Designing", "Printing"].includes(gift.status)
      ).length,
      icon: Clock3,
      shade: "from-[#5a9ee7] to-[#b6ddff]",
    },
    {
      title: "Delivered Gifts",
      value: gifts.filter((gift) => gift.status === "Delivered").length,
      icon: CheckCircle2,
      shade: "from-[#3688d0] to-[#8bc8f4]",
    },
    {
      title: "Pending Balance",
      value: pendingBalance,
      icon: Wallet,
      currency: true,
      shade: "from-[#2372bd] to-[#8fc9f5]",
    },
  ];

  const giftTypeOptions = useMemo(
    () => [
      ...new Set([
        ...GIFT_TYPES,
        ...gifts.map((gift) => gift.giftType).filter(Boolean),
      ]),
    ],
    [gifts]
  );

  const updateForm = (name, value) => {
    setForm((previous) => ({
      ...previous,
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

  const saveGift = async (event) => {
    event.preventDefault();

    const customer = String(form.customer || "").trim();
    const phone = String(form.phone || "").trim();

    if (!customer || !phone) {
      setError("Please enter customer details.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!form.giftType || !form.orderDate || !form.deliveryDate) {
      setError("Please enter gift type, order date and delivery date.");
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

    if (form.deliveryDate < form.orderDate) {
      setError("Delivery date cannot be before order date.");
      return;
    }

    const payload = {
      customer_name: customer,
      phone,
      gift_name: form.giftType || "Customized Gift",
      gift_type: form.giftType,
      quantity: Number(form.quantity || 1),
      order_date: form.orderDate || null,
      delivery_date: form.deliveryDate || null,
      delivery_address: form.size || "",
      total_amount: Number(form.amount || 0),
      advance_amount: Number(form.advance || 0),
      status: form.status || "Pending",
      payment_status:
        Number(form.advance) >= Number(form.amount)
          ? "Paid"
          : Number(form.advance) > 0
          ? "Partial"
          : "Pending",
      customization_details: form.customization || "",
      notes: form.notes || "",
    };

    try {
      if (editingId !== null) {
        if (typeof editingId === "number") {
          await api.customizedGifts.update(editingId, payload);
        }

        const record = {
          ...form,
          id: editingId,
          customer,
          phone,
          quantity: Number(form.quantity),
          amount: Number(form.amount),
          advance: Number(form.advance),
        };

        setGifts((previous) =>
          previous.map((gift) =>
            gift.id === editingId ? record : gift
          )
        );
        setNotice("Gift order updated successfully.");
      } else {
        let createdId = `GIFT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        try {
          const res = await api.customizedGifts.create(payload);
          if (res?.id) createdId = res.id;
        } catch (apiErr) {
          console.warn("Backend create gift notice:", apiErr.message);
        }

        const record = {
          ...form,
          id: createdId,
          customer,
          phone,
          quantity: Number(form.quantity),
          amount: Number(form.amount),
          advance: Number(form.advance),
        };

        setGifts((previous) => [record, ...previous]);
        setNotice("Gift order added successfully.");
      }

      playSound("save", soundEnabled);
      closeForm();
    } catch (err) {
      console.error("Save gift error:", err);
      setError(err.message || "Failed to save gift order.");
    }
  };

  const deleteGift = async (id) => {
    if (!window.confirm("Delete this gift order?")) return;

    try {
      if (typeof id === "number") {
        await api.customizedGifts.delete(id);
      }
    } catch (err) {
      console.warn("Backend delete gift notice:", err.message);
    }

    setGifts((previous) =>
      previous.filter((gift) => gift.id !== id)
    );

    playSound("delete", soundEnabled);
    setNotice("Gift order deleted successfully.");
  };

  return (
    <div className="min-h-screen min-w-0 bg-gradient-to-br from-[#f5faff] via-[#eaf5ff] to-[#dceeff] p-3 text-[#183c68] sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        {notice &&
          createPortal(
            <div className="fixed left-3 right-3 top-4 z-[10001] flex items-center gap-3 rounded-2xl border border-[#b9ddf9] bg-white px-4 py-3 shadow-xl sm:left-auto sm:right-5 sm:max-w-md">
              <CheckCircle2
                size={20}
                className="shrink-0 text-[#348acb]"
              />
              <p className="flex-1 text-sm font-semibold text-[#164579]">
                {notice}
              </p>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Close notification"
              >
                <X size={17} />
              </button>
            </div>,
            document.body
          )}

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Existing page heading intentionally hidden */}
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#368bd0] to-[#1c65a9] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(45,126,195,0.18)] transition hover:from-[#287fc5] hover:to-[#15558f]"
          >
            <Plus size={18} />
            Add Gift Order
          </button>
        </div>

        {/* ANIMATED STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* GIFT ORDERS */}
        <section className="overflow-hidden rounded-[24px] border border-[#cfe5fb] bg-white shadow-[0_12px_36px_rgba(49,110,176,0.08)]">
          <div className="flex flex-col gap-4 border-b border-[#dcecfb] bg-gradient-to-r from-[#f5fbff] to-[#e8f4ff] p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#164579]">
                <Package size={20} className="text-[#388ac9]" />
                Gift Orders
              </h2>
              <p className="mt-1 text-xs text-[#7898b7]">
                {filtered.length} orders found
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[210px_190px_155px]">
              <div className="relative sm:col-span-2 xl:col-span-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#78a4c9]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search gifts..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="All">All Gift Types</option>
                  {giftTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6592bd]"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
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
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6592bd]"
                />
              </div>
            </div>
          </div>

          {/* MOBILE / TABLET */}
          <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-[#d2e7fb] bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#e0effc] bg-gradient-to-r from-[#f0f9ff] to-[#e1f1ff] p-4">
                  <div className="min-w-0">
                    <h3 className="break-words font-extrabold text-[#164579]">
                      {item.customer}
                    </h3>
                    <p className="mt-1 text-xs text-[#7898b7]">
                      {item.phone}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}
                    >
                      {item.status || "—"}
                    </span>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      title="Edit order"
                      className="rounded-lg border border-[#c6e2fa] bg-white p-2 text-[#2873b7]"
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
                    ["Size", item.size],
                    ["Order Date", item.orderDate],
                    ["Delivery Date", item.deliveryDate],
                    ["Total", money(item.amount)],
                    ["Balance", money(balanceOf(item))],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-xs text-[#8aa6c1]">{label}</p>
                      <p className="mt-1 break-words text-sm font-bold text-[#164579]">
                        {value === "" || value == null ? "—" : value}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#cfe5fb] bg-[#f7fbff] py-12 text-center text-sm text-[#7898b7] sm:col-span-2">
                No gift orders found.
              </div>
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-gradient-to-r from-[#e1f1ff] to-[#cce6fc]">
                <tr className="text-[11px] font-extrabold uppercase tracking-wide text-[#326b9f]">
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
                      className="whitespace-nowrap px-4 py-4"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5f0fb]">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[#f2f9ff]"
                  >
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#164579]">
                        {item.customer}
                      </p>
                      <p className="mt-1 text-xs text-[#89a3bb]">
                        {item.phone}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-[#42698f]">
                      {item.giftType}
                    </td>
                    <td className="px-4 py-4 text-[#42698f]">
                      {item.occasion || "—"}
                    </td>
                    <td className="px-4 py-4 text-[#42698f]">
                      {item.quantity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-[#42698f]">
                      {item.orderDate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-[#42698f]">
                      {item.deliveryDate || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-bold text-[#164579]">
                      {money(item.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-bold text-rose-600">
                      {money(balanceOf(item))}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass(item.status)}`}
                      >
                        {item.status || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          title="Edit order"
                          className="rounded-lg border border-[#cfe5fb] bg-[#f1f9ff] p-2 text-[#2873b7] transition hover:bg-[#dcefff]"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteGift(item.id)}
                          title="Delete order"
                          className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
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
                      className="py-14 text-center text-[#7898b7]"
                    >
                      No gift orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e1effc] bg-[#f8fcff] px-4 py-4 text-xs text-[#7898b7] sm:px-6">
            <span>
              Showing {filtered.length} of {gifts.length} gift orders
            </span>
            <span>Studio Raw Picturez ERP</span>
          </div>
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a2748]/65 p-2 backdrop-blur-[3px] sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="gift-modal-title"
              className="flex max-h-[calc(100dvh-16px)] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-[#b9daf5] bg-white shadow-2xl sm:max-h-[calc(100dvh-32px)]"
            >
              {/* MODAL HEADER */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d8eafa] bg-gradient-to-r from-[#e8f5ff] to-[#cce7ff] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4a9cdd] to-[#2472b5] text-white shadow-sm">
                    {editingId !== null ? (
                      <Pencil size={20} />
                    ) : (
                      <Gift size={21} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2
                      id="gift-modal-title"
                      className="text-base font-extrabold text-[#164579] sm:text-xl"
                    >
                      {editingId !== null
                        ? "Edit Gift Order"
                        : "Add Gift Order"}
                    </h2>

                    <p className="mt-1 flex items-center gap-1 text-xs text-[#6d93b6]">
                      <Sparkles size={12} />
                      Gift customization and delivery details
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close form"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[#315f8c] transition hover:bg-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={saveGift}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain bg-[#fbfdff] px-4 py-5 sm:px-6">
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
                        placeholder="Enter 10-digit phone number"
                        required
                      />
                    </div>
                  </section>

                  {/* GIFT DETAILS */}
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
                      <span className="text-xs font-bold text-[#315b85]">
                        Customization Details
                      </span>

                      <textarea
                        rows={3}
                        value={form.customization}
                        onChange={(event) =>
                          updateForm("customization", event.target.value)
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

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#b9ddf9] bg-gradient-to-r from-[#eaf6ff] to-[#d5ebff] px-4 py-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#315f8c]">
                        <Wallet size={17} />
                        Remaining Balance
                      </div>

                      <span className="break-words text-xl font-extrabold text-[#164579]">
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
                      <span className="text-xs font-bold text-[#315b85]">
                        Additional Notes
                      </span>

                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(event) =>
                          updateForm("notes", event.target.value)
                        }
                        placeholder="Enter additional requirements..."
                        className={`${inputClass} resize-y`}
                      />
                    </label>
                  </section>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                    >
                      <AlertCircle size={18} className="shrink-0" />
                      {error}
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[#d8eafa] bg-[#f0f8ff] px-4 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="flex-1 rounded-xl border border-[#c5def5] bg-white px-5 py-3 text-sm font-bold text-[#315f8c] transition hover:bg-[#e6f3ff] sm:flex-none"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#368bd0] to-[#1c65a9] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:from-[#287fc5] hover:to-[#15558f] sm:flex-none"
                  >
                    <Save size={17} />
                    {editingId !== null
                      ? "Update Gift Order"
                      : "Save Gift Order"}
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body
        )}
    </div>
  );
}