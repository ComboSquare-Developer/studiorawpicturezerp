
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  Truck,
  Package,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  CalendarDays,
  UserRound,
  MapPin,
  Save,
  Phone,
  Download,
  ChevronDown,
  Check,
  AlertCircle,
  CreditCard,
  ClipboardList,
  Eye,
  Hash,
  FileText,
  Box,
  Building2,
  Volume2,
  VolumeX,
  Filter,
} from "lucide-react";

const STORAGE_KEY = "studioraw_deliveries";
const SOUND_KEY = "studioraw_delivery_sounds";

const NAVY = "#10264d";

const EVENTS = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Pre-Wedding",
  "Baby Shoot",
  "Maternity Shoot",
  "Portrait",
  "Corporate",
  "Anniversary",
  "Housewarming",
  "Graduation",
  "Fashion Shoot",
  "Product Photography",
  "Other",
];

const DELIVERY_ITEMS = [
  "Wedding Album",
  "Photo Album",
  "Edited Photos",
  "Wedding Video",
  "Photo & Video",
  "USB Drive",
  "Printed Frames",
  "Canvas Print",
  "Photo Book",
  "Digital Gallery",
  "Customized Gifts",
  "Other",
];

const DELIVERY_METHODS = [
  "Studio Pickup",
  "Home Delivery",
  "Courier",
  "Digital Delivery",
];

const PAYMENT_STATUSES = ["Pending", "Partial", "Paid"];

const DELIVERY_STATUSES = [
  "Pending",
  "Packed",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

const STAFF = [
  "Karthik",
  "Ramesh",
  "Suresh",
  "Arun",
  "Vignesh",
  "Rahul",
  "Manoj",
  "Priya",
  "Divya",
  "Not Assigned",
];

const COURIERS = [
  "DTDC",
  "Blue Dart",
  "Delhivery",
  "India Post",
  "Professional Couriers",
  "ST Courier",
  "Other",
];

const DEMO_CUSTOMERS = [
  "Arun Kumar",
  "Priya S",
  "Vijay Raj",
  "Divya R",
  "Karthik S",
  "Meena Devi",
  "Rahul Kumar",
  "Anitha",
  "Sanjay",
  "Deepa",
  "Manoj",
  "Keerthana",
  "Suresh",
  "Nithya",
  "Vignesh",
  "Harini",
  "Ajay",
  "Swetha",
  "Ramesh",
  "Pavithra",
];

const DEMO_LOCATIONS = [
  "Nagercoil, Tamil Nadu",
  "Marthandam, Tamil Nadu",
  "Kanyakumari, Tamil Nadu",
  "Tirunelveli, Tamil Nadu",
  "Chennai, Tamil Nadu",
];

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const todayKey = () => dateOffset(0);

const DUMMY_DELIVERIES = Array.from(
  { length: 20 },
  (_, index) => {
    const method = DELIVERY_METHODS[index % DELIVERY_METHODS.length];
    const status = DELIVERY_STATUSES[index % DELIVERY_STATUSES.length];

    return {
      id: `DEL-${String(index + 1).padStart(5, "0")}`,
      customer: DEMO_CUSTOMERS[index],
      phone: `98765${String(10000 + index).slice(-5)}`,
      event: EVENTS[index % EVENTS.length],
      item: DELIVERY_ITEMS[index % DELIVERY_ITEMS.length],
      quantity: (index % 4) + 1,
      deliveryMethod: method,
      address:
        method === "Courier" || method === "Home Delivery"
          ? DEMO_LOCATIONS[index % DEMO_LOCATIONS.length]
          : "",
      courier:
        method === "Courier"
          ? COURIERS[index % (COURIERS.length - 1)]
          : "",
      trackingNumber:
        method === "Courier"
          ? `TRK${String(102450 + index)}`
          : "",
      expectedDate: dateOffset(index - 8),
      deliveredDate:
        status === "Delivered"
          ? dateOffset(index - 9)
          : "",
      assignedTo: STAFF[index % STAFF.length],
      paymentStatus:
        PAYMENT_STATUSES[index % PAYMENT_STATUSES.length],
      status,
      notes:
        index % 3 === 0
          ? "Handle carefully and confirm with customer."
          : index % 3 === 1
          ? "Customer requested timely delivery."
          : "",
    };
  }
);

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
  expectedDate: todayKey(),
  deliveredDate: "",
  assignedTo: "Not Assigned",
  paymentStatus: "Pending",
  status: "Pending",
  notes: "",
});

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-3.5 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#315b99] focus:ring-2 focus:ring-blue-100";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Packed: "bg-violet-50 text-violet-700 border-violet-200",
  Dispatched: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const paymentStyles = {
  Pending: "bg-rose-50 text-rose-700 border-rose-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatDate(value) {
  if (!value) return "Not scheduled";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `DEL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );
}

function readDeliveries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) return DUMMY_DELIVERIES;

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : DUMMY_DELIVERIES;
  } catch {
    return DUMMY_DELIVERIES;
  }
}

function useDeliverySounds() {
  const audioRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      if (
        audioRef.current &&
        audioRef.current.state !== "closed"
      ) {
        audioRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playSound = (type = "click") => {
    if (!soundEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioRef.current || audioRef.current.state === "closed") {
        audioRef.current = new AudioContextClass();
      }

      const context = audioRef.current;

      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const sounds = {
        click: [600],
        open: [520, 720],
        success: [520, 660, 880],
        delete: [460, 310],
        error: [240, 200],
      };

      (sounds[type] || sounds.click).forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        const start = context.currentTime + index * 0.095;
        const duration = type === "success" ? 0.12 : 0.09;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(
          0.045,
          start + 0.012
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + duration
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(start + duration + 0.01);
      });
    } catch {
      // Sound errors must not interrupt delivery actions.
    }
  };

  return { soundEnabled, setSoundEnabled, playSound };
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
  playSound,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const allOptions = useMemo(() => {
    if (value && !options.includes(value)) {
      return [value, ...options];
    }
    return options;
  }, [options, value]);

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const menuHeight = Math.min(
      240,
      allOptions.length * 43 + 12
    );

    const openAbove =
      spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;

    const available = openAbove
      ? Math.max(80, spaceAbove - 12)
      : Math.max(80, spaceBelow - 12);

    setPosition({
      left: Math.max(8, rect.left),
      width: Math.min(rect.width, window.innerWidth - 16),
      maxHeight: Math.min(menuHeight, available),
      top: openAbove
        ? Math.max(8, rect.top - Math.min(menuHeight, available) - 6)
        : rect.bottom + 6,
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleOutside = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const handleScroll = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    const handleResize = () => setOpen(false);

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open, allOptions.length]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          playSound?.("click");

          if (!open) updatePosition();

          setOpen((previous) => !previous);
        }}
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#d9e3f2] bg-white text-left text-sm font-medium text-[#10264d] outline-none transition hover:border-[#315b99] focus:ring-2 focus:ring-blue-100 ${
          compact ? "px-3 py-2.5" : "px-3.5 py-3"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-[#627895] transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
              zIndex: 100000,
            }}
            className="overflow-y-auto overscroll-contain rounded-xl border border-[#d9e3f2] bg-white p-1.5 shadow-2xl"
          >
            {allOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  onChange(option);
                  playSound?.("click");
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  value === option
                    ? "bg-[#eaf1fc] font-semibold text-[#10264d]"
                    : "text-slate-600 hover:bg-[#f4f7fc]"
                }`}
              >
                <span className="min-w-0 break-words">{option}</span>

                {value === option && (
                  <Check size={16} className="shrink-0 text-[#173d77]" />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function StatusBadge({ value, payment = false }) {
  const styles = payment ? paymentStyles : statusStyles;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        styles[value] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span className="truncate">{value || "Pending"}</span>
    </span>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-[#29416a]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-[#edf1f6] pb-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-[#173d77]">
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-bold text-[#10264d]">
        {title}
      </h3>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, children }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#e5ebf4] bg-[#f7f9fd] p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
        {Icon && <Icon size={12} className="shrink-0 text-[#173d77]" />}
        <span>{label}</span>
      </div>

      {children || (
        <p className="break-words text-xs font-bold leading-5 text-[#10264d]">
          {value === 0 ? 0 : value || "—"}
        </p>
      )}
    </div>
  );
}

function DeliveryCard({
  item,
  deliveryId,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  playSound,
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-[#e0e7f1] bg-white p-3.5 shadow-sm transition hover:border-[#b6c9e4] hover:shadow-md sm:p-4">
      <div className="flex min-w-0 items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-[#10264d]">
            <UserRound size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-[#10264d]">
              {item.customer}
            </h3>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-[#315b99]">
              {deliveryId}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            title="View"
            onClick={() => onView(item)}
            className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            title="Edit"
            onClick={() => onEdit(item)}
            className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            title="Delete"
            onClick={() => onDelete(item.id)}
            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 py-3">
        <span className="text-xs font-medium text-slate-500">
          Delivery Status
        </span>
        <StatusBadge value={item.status} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoBox label="Delivery Item" value={item.item} icon={Package} />
        <InfoBox label="Quantity" value={item.quantity} icon={Box} />
        <InfoBox label="Phone" value={item.phone} icon={Phone} />
        <InfoBox
          label="Delivery Method"
          value={item.deliveryMethod}
          icon={Truck}
        />
        <InfoBox label="Event" value={item.event} icon={CalendarDays} />
        <InfoBox
          label="Expected Date"
          value={formatDate(item.expectedDate)}
          icon={CalendarDays}
        />
        <InfoBox
          label="Actual Date"
          value={formatDate(item.deliveredDate)}
          icon={CheckCircle2}
        />
        <InfoBox
          label="Assigned Staff"
          value={item.assignedTo || "Not Assigned"}
          icon={UserRound}
        />
        <InfoBox label="Payment Status" icon={CreditCard}>
          <StatusBadge value={item.paymentStatus} payment />
        </InfoBox>
        <InfoBox
          label="Tracking Number"
          value={item.trackingNumber}
          icon={Hash}
        />

        {item.address && (
          <div className="col-span-2">
            <InfoBox
              label="Delivery Address"
              value={item.address}
              icon={MapPin}
            />
          </div>
        )}

        {item.courier && (
          <InfoBox label="Courier" value={item.courier} icon={Building2} />
        )}

        {item.notes && (
          <div className="col-span-2">
            <InfoBox label="Notes" value={item.notes} icon={FileText} />
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-slate-100 pt-3">
        <p className="mb-2 text-[11px] font-semibold text-[#29416a]">
          Update Status
        </p>

        <CustomDropdown
          value={item.status || "Pending"}
          options={DELIVERY_STATUSES}
          onChange={(status) => onStatusChange(item, status)}
          playSound={playSound}
          compact
        />
      </div>
    </article>
  );
}

function ModalShell({
  title,
  description,
  icon: Icon,
  onClose,
  onSubmit,
  submitLabel,
  children,
  maxWidth = "max-w-[850px]",
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152b]/70 p-2 backdrop-blur-[4px] sm:p-5">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[96dvh] w-full min-w-0 ${maxWidth} flex-col overflow-hidden rounded-2xl border border-[#e0e7f1] bg-white shadow-2xl sm:max-h-[93dvh] sm:rounded-3xl`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e5ebf3] px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10264d] text-white">
              <Icon size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#10264d] sm:text-xl">
                {title}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-2 text-[#627895] hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        {onSubmit ? (
          <form
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
              {children}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#e5ebf3] bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#d9e3f2] px-6 py-3 text-sm font-semibold text-[#10264d] hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#193b73]"
              >
                <Save size={17} />
                {submitLabel}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
              {children}
            </div>

            <div className="flex shrink-0 justify-end border-t border-[#e5ebf3] px-4 py-4 sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#10264d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#193b73]"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function Delivery() {
  const { soundEnabled, setSoundEnabled, playSound } =
    useDeliverySounds();

  const [deliveries, setDeliveries] = useState(readDeliveries);

  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewId, setViewId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(deliveries)
      );
    } catch {
      console.error("Unable to save deliveries.");
    }
  }, [deliveries]);

  useEffect(() => {
    if (!showForm && !viewId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setViewId(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm, viewId]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
  };

  const openCreate = () => {
    playSound("open");
    setForm(createEmptyForm());
    setEditingId(null);
    setViewId(null);
    setError("");
    setStatusError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    playSound("open");

    setForm({
      ...createEmptyForm(),
      ...item,
    });

    setEditingId(item.id);
    setViewId(null);
    setError("");
    setShowForm(true);
  };

  const openView = (item) => {
    playSound("open");
    setViewId(item.id);
  };

  const closeForm = () => {
    playSound("click");
    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
  };

  const saveDelivery = (event) => {
    event.preventDefault();

    const customer = form.customer.trim();
    const phone = String(form.phone || "").trim();
    const quantity = Number(form.quantity);

    if (!customer) {
      setError("Please enter customer name.");
      playSound("error");
      return;
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number.");
      playSound("error");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Quantity must be at least 1.");
      playSound("error");
      return;
    }

    if (
      form.expectedDate &&
      form.deliveredDate &&
      form.deliveredDate < form.expectedDate &&
      form.status !== "Delivered"
    ) {
      // Early delivery is allowed; no blocking validation needed.
    }

    if (form.status === "Delivered" && !form.deliveredDate) {
      setError("Please select the actual delivery date.");
      playSound("error");
      return;
    }

    if (
      ["Courier", "Home Delivery"].includes(form.deliveryMethod) &&
      !form.address.trim()
    ) {
      setError("Please enter the delivery address.");
      playSound("error");
      return;
    }

    const record = {
      ...form,
      id: editingId || createId(),
      customer,
      phone,
      quantity,
      assignedTo: form.assignedTo || "Not Assigned",
      deliveredDate:
        form.status === "Delivered"
          ? form.deliveredDate
          : form.deliveredDate || "",
    };

    if (editingId !== null) {
      setDeliveries((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );
    } else {
      setDeliveries((previous) => [record, ...previous]);
    }

    playSound("success");
    setStatusError("");
    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
  };

  const deleteDelivery = (id) => {
    playSound("click");

    if (!window.confirm("Delete this delivery record?")) return;

    setDeliveries((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (viewId === id) setViewId(null);

    if (editingId === id) {
      setShowForm(false);
      setEditingId(null);
    }

    playSound("delete");
  };

  const updateDeliveryStatus = (item, status) => {
    setStatusError("");

    if (status === item.status) return;

    if (status === "Delivered" && !item.deliveredDate) {
      setStatusError(
        `Enter the actual delivery date for ${item.customer} before marking it as Delivered.`
      );

      setForm({
        ...createEmptyForm(),
        ...item,
        status: "Delivered",
        deliveredDate: todayKey(),
      });

      setEditingId(item.id);
      setError("");
      setShowForm(true);
      playSound("error");
      return;
    }

    setDeliveries((previous) =>
      previous.map((delivery) =>
        delivery.id === item.id
          ? { ...delivery, status }
          : delivery
      )
    );

    playSound("success");
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return deliveries.filter((item) => {
      const matchesSearch = [
        item.id,
        item.deliveryId,
        item.customer,
        item.phone,
        item.event,
        item.item,
        item.trackingNumber,
        item.assignedTo,
        item.courier,
        item.deliveryMethod,
        item.address,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      return (
        matchesSearch &&
        (filter === "All" || item.status === filter)
      );
    });
  }, [deliveries, search, filter]);

  const stats = [
    {
      title: "Total Deliveries",
      value: deliveries.length,
      icon: Package,
      bg: "bg-[#eaf1fc]",
      color: "text-[#173d77]",
    },
    {
      title: "Pending Deliveries",
      value: deliveries.filter((item) =>
        ["Pending", "Packed"].includes(item.status)
      ).length,
      icon: Clock3,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      title: "Dispatched",
      value: deliveries.filter(
        (item) => item.status === "Dispatched"
      ).length,
      icon: Truck,
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      title: "Delivered",
      value: deliveries.filter(
        (item) => item.status === "Delivered"
      ).length,
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
  ];

  const exportCSV = () => {
    const columns = [
      "id",
      "customer",
      "phone",
      "event",
      "item",
      "quantity",
      "deliveryMethod",
      "address",
      "courier",
      "trackingNumber",
      "expectedDate",
      "deliveredDate",
      "assignedTo",
      "paymentStatus",
      "status",
      "notes",
    ];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      const safe = /^\s*[=+\-@\t\r]/.test(text)
        ? `'${text}`
        : text;

      return `"${safe.replace(/"/g, '""')}"`;
    };

    const rows = [
      columns.map(escapeCSV).join(","),
      ...filtered.map((item) =>
        columns.map((key) => escapeCSV(item[key])).join(",")
      ),
    ];

    const blob = new Blob(
      ["\uFEFF", rows.join("\r\n")],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "studioraw_deliveries.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    playSound("success");
  };

  const selectedView = deliveries.find(
    (item) => item.id === viewId
  );

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f7fc] px-3 py-4 text-[#10264d] sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#315b99]">
            Studio Raw / Operations
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Delivery Management
          </h1>

          <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
            Manage albums, photos, videos and customer deliveries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled((previous) => !previous)}
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d9e3f2] bg-white text-[#10264d] hover:bg-[#eaf1fc]"
          >
            {soundEnabled ? (
              <Volume2 size={19} />
            ) : (
              <VolumeX size={19} />
            )}
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d9e3f2] bg-white px-4 py-2.5 text-xs font-semibold text-[#10264d] hover:bg-[#eaf1fc] sm:flex-none sm:text-sm"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#193b73] sm:flex-none sm:text-sm"
          >
            <Plus size={18} />
            New Delivery
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="min-w-0 rounded-2xl border border-[#e0e7f1] bg-white p-3.5 shadow-sm transition hover:shadow-md sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium leading-5 text-slate-500 sm:text-sm">
                    {stat.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-extrabold text-[#10264d] sm:text-3xl">
                    {stat.value}
                  </h2>
                </div>

                <div className={`shrink-0 rounded-xl p-2.5 ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DELIVERY RECORDS */}
      <section className="min-w-0 rounded-2xl border border-[#e0e7f1] bg-white shadow-sm">
        <div className="border-b border-[#edf1f6] p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ClipboardList size={20} />
                Delivery Records
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing {filtered.length} of {deliveries.length} records
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:flex-1 xl:w-72">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search deliveries..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="flex w-full items-center gap-2 sm:w-52">
                <Filter size={17} className="shrink-0 text-[#315b99]" />

                <CustomDropdown
                  value={filter}
                  options={["All", ...DELIVERY_STATUSES]}
                  onChange={setFilter}
                  playSound={playSound}
                />
              </div>
            </div>
          </div>
        </div>

        {statusError && (
          <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <AlertCircle size={17} className="shrink-0" />
            <span className="flex-1">{statusError}</span>

            <button
              type="button"
              onClick={() => setStatusError("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <Truck size={36} className="text-[#9cb2d0]" />

            <h3 className="mt-4 font-bold">
              No delivery records found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or add a new delivery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 2xl:grid-cols-3">
            {filtered.map((item) => {
              const index = deliveries.findIndex(
                (delivery) => delivery.id === item.id
              );

              const deliveryId =
                item.deliveryId ||
                (String(item.id).startsWith("DEL-")
                  ? item.id
                  : `DEL-${String(index + 1).padStart(5, "0")}`);

              return (
                <DeliveryCard
                  key={item.id}
                  item={item}
                  deliveryId={deliveryId}
                  onView={openView}
                  onEdit={openEdit}
                  onDelete={deleteDelivery}
                  onStatusChange={updateDeliveryStatus}
                  playSound={playSound}
                />
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-[#edf1f6] px-4 py-4 text-xs text-slate-400 sm:flex-row sm:justify-between sm:px-6">
          <span>
            Showing {filtered.length} of {deliveries.length} deliveries
          </span>
          <span>Studio Raw Picturez ERP</span>
        </div>
      </section>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <ModalShell
          title={editingId ? "Edit Delivery" : "New Delivery"}
          description="Enter customer and delivery information"
          icon={Truck}
          onClose={closeForm}
          onSubmit={saveDelivery}
          submitLabel={editingId ? "Update Delivery" : "Save Delivery"}
        >
          <section>
            <SectionHeading
              icon={UserRound}
              title="Customer Information"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Customer Name" required>
                <input
                  required
                  type="text"
                  value={form.customer}
                  onChange={(event) =>
                    update("customer", event.target.value)
                  }
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
                  onChange={(event) =>
                    update(
                      "phone",
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="10-digit phone number"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Event Type">
                <CustomDropdown
                  value={form.event}
                  options={EVENTS}
                  onChange={(value) => update("event", value)}
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Delivery Item">
                <CustomDropdown
                  value={form.item}
                  options={DELIVERY_ITEMS}
                  onChange={(value) => update("item", value)}
                  playSound={playSound}
                />
              </FormField>
            </div>
          </section>

          <section>
            <SectionHeading
              icon={Truck}
              title="Delivery Information"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Delivery Method">
                <CustomDropdown
                  value={form.deliveryMethod}
                  options={DELIVERY_METHODS}
                  onChange={(value) =>
                    update("deliveryMethod", value)
                  }
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Quantity" required>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) =>
                    update("quantity", event.target.value)
                  }
                  className={inputClass}
                />
              </FormField>

              {["Courier", "Home Delivery"].includes(
                form.deliveryMethod
              ) && (
                <div className="sm:col-span-2">
                  <FormField label="Delivery Address" required>
                    <textarea
                      required
                      rows={3}
                      value={form.address}
                      onChange={(event) =>
                        update("address", event.target.value)
                      }
                      placeholder="Enter delivery address"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              )}

              {form.deliveryMethod === "Courier" && (
                <>
                  <FormField label="Courier Company">
                    <CustomDropdown
                      value={form.courier}
                      options={COURIERS}
                      placeholder="Select courier"
                      onChange={(value) => update("courier", value)}
                      playSound={playSound}
                    />
                  </FormField>

                  <FormField label="Tracking Number">
                    <input
                      type="text"
                      value={form.trackingNumber}
                      onChange={(event) =>
                        update("trackingNumber", event.target.value)
                      }
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
                  onChange={(event) =>
                    update("expectedDate", event.target.value)
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Actual Delivery Date">
                <input
                  type="date"
                  value={form.deliveredDate}
                  onChange={(event) =>
                    update("deliveredDate", event.target.value)
                  }
                  className={inputClass}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Assigned Staff">
                  <CustomDropdown
                    value={form.assignedTo}
                    options={STAFF}
                    onChange={(value) => update("assignedTo", value)}
                    playSound={playSound}
                  />
                </FormField>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading
              icon={CreditCard}
              title="Payment & Status"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Payment Status">
                <CustomDropdown
                  value={form.paymentStatus}
                  options={PAYMENT_STATUSES}
                  onChange={(value) =>
                    update("paymentStatus", value)
                  }
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Delivery Status">
                <CustomDropdown
                  value={form.status}
                  options={DELIVERY_STATUSES}
                  onChange={(value) => update("status", value)}
                  playSound={playSound}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Delivery Notes">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      update("notes", event.target.value)
                    }
                    placeholder="Enter special instructions..."
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </ModalShell>
      )}

      {/* VIEW DETAILS */}
      {selectedView && (
        <ModalShell
          title="Delivery Details"
          description={selectedView.customer}
          icon={Package}
          onClose={() => {
            playSound("click");
            setViewId(null);
          }}
          maxWidth="max-w-[650px]"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-500">
              Delivery Status
            </span>

            <StatusBadge value={selectedView.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox
              label="Customer"
              value={selectedView.customer}
              icon={UserRound}
            />
            <InfoBox
              label="Phone"
              value={selectedView.phone}
              icon={Phone}
            />
            <InfoBox
              label="Event"
              value={selectedView.event}
              icon={CalendarDays}
            />
            <InfoBox
              label="Delivery Item"
              value={selectedView.item}
              icon={Package}
            />
            <InfoBox
              label="Quantity"
              value={selectedView.quantity}
              icon={Box}
            />
            <InfoBox
              label="Delivery Method"
              value={selectedView.deliveryMethod}
              icon={Truck}
            />
            <InfoBox
              label="Expected Date"
              value={formatDate(selectedView.expectedDate)}
              icon={CalendarDays}
            />
            <InfoBox
              label="Actual Date"
              value={formatDate(selectedView.deliveredDate)}
              icon={CheckCircle2}
            />
            <InfoBox
              label="Assigned Staff"
              value={selectedView.assignedTo}
              icon={UserRound}
            />
            <InfoBox label="Payment Status" icon={CreditCard}>
              <StatusBadge
                value={selectedView.paymentStatus}
                payment
              />
            </InfoBox>

            {selectedView.address && (
              <div className="col-span-2">
                <InfoBox
                  label="Delivery Address"
                  value={selectedView.address}
                  icon={MapPin}
                />
              </div>
            )}

            {selectedView.courier && (
              <InfoBox
                label="Courier"
                value={selectedView.courier}
                icon={Building2}
              />
            )}

            {selectedView.trackingNumber && (
              <InfoBox
                label="Tracking Number"
                value={selectedView.trackingNumber}
                icon={Hash}
              />
            )}

            {selectedView.notes && (
              <div className="col-span-2">
                <InfoBox
                  label="Notes"
                  value={selectedView.notes}
                  icon={FileText}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => openEdit(selectedView)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#193b73]"
          >
            <Pencil size={16} />
            Edit Delivery
          </button>
        </ModalShell>
      )}
    </div>
  );
}
