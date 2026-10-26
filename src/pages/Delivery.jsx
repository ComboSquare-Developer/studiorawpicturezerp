
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
  Filter,
  Images,
  Sparkles,
  RotateCcw,
  CalendarClock,
  Image as ImageIcon,
  Camera,
  BellRing,
  CircleCheck,
} from "lucide-react";

/* =====================================================
   STORAGE
===================================================== */

const DELIVERY_KEY = "studioraw_deliveries";
const SELECTION_KEY = "studioraw_photo_selections";
const SOUND_KEY = "studioraw_delivery_sounds";
const CUSTOMER_KEY = "studio_raw_customers";
const BOOKING_KEY = "studioraw_bookings";
const UPDATE_EVENT = "studioraw:data-updated";

function readStoredRecords(key, fallbackKey) {
  try {
    const raw =
      localStorage.getItem(key) ||
      (fallbackKey ? localStorage.getItem(fallbackKey) : null);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parsed;

    for (const field of [
      "data",
      "records",
      "items",
      "list",
      "customers",
      "bookings",
      "deliveries",
      "selections",
    ]) {
      if (Array.isArray(parsed?.[field])) return parsed[field];
    }
  } catch {}

  return [];
}

const normalizePhone = (value) =>
  String(value ?? "").replace(/\D/g, "").slice(-10);

const customerNameOf = (c) =>
  String(c?.name || c?.customerName || c?.customer || "").trim();

const customerPhoneOf = (c) =>
  normalizePhone(c?.phone || c?.mobile || c?.contactNumber);

const customerAddressOf = (c) =>
  String(c?.address || c?.city || "").trim();

const EVENTS = [
  "Wedding Photography",
  "Traditional Photography",
  "Candid Photography",
  "Helicam (Drone) Photography",
  "PreWedding Photography",
  "Post Wedding Photography",
  "Custom Package",
  "Wedding Videography",
  "Function We Arrange",
  "Event Management",
  "Customized Gifts",
  "Pre-Wedding / Outdoor Shoot",
  "Baby & Kids Shoot",
  "Complete Wedding Package",
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

const DELIVERY_STATUSES = [
  "Pending",
  "Packed",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = ["Pending", "Partial", "Paid"];

const SELECTION_METHODS = [
  "Google Drive",
  "WhatsApp",
  "USB Drive",
  "Online Gallery",
  "Studio Visit",
  "Other",
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

const CUSTOMERS = [
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

const LOCATIONS = [
  "Nagercoil, Tamil Nadu",
  "Marthandam, Tamil Nadu",
  "Kanyakumari, Tamil Nadu",
  "Tirunelveli, Tamil Nadu",
  "Chennai, Tamil Nadu",
];

/* =====================================================
   HELPERS
===================================================== */

function dateOffset(days = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

const todayKey = () => dateOffset(0);

function formatDate(value) {
  if (!value) return "Not recorded";

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysBetween(from, to) {
  if (!from || !to) return 0;

  return Math.round(
    (new Date(`${to}T12:00:00`) -
      new Date(`${from}T12:00:00`)) /
      86400000
  );
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function getSelectionStatus(item) {
  if (item.returnedDate) return "Returned";

  if (item.dueDate && item.dueDate < todayKey()) {
    return "Overdue";
  }

  return "Pending";
}

function getSelectionProgress(item) {
  if (item.returnedDate) return 100;

  if (!item.givenDate || !item.dueDate) return 10;

  const total = Math.max(
    1,
    daysBetween(item.givenDate, item.dueDate)
  );

  const elapsed = daysBetween(item.givenDate, todayKey());

  return Math.max(
    8,
    Math.min(96, Math.round((elapsed / total) * 100))
  );
}

function createEmptyDelivery() {
  return {
    customerId: "",
    bookingId: "",
    customer: "",
    phone: "",
    event: EVENTS[0],
    item: DELIVERY_ITEMS[0],
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
  };
}

function createEmptySelection() {
  return {
    customerId: "",
    bookingId: "",
    customer: "",
    phone: "",
    project: EVENTS[0],
    givenDate: todayKey(),
    dueDate: dateOffset(7),
    returnedDate: "",
    photoCount: "",
    selectedCount: "",
    method: "Google Drive",
    assignedTo: "Not Assigned",
    notes: "",
  };
}

/* =====================================================
   DEMO DATA
===================================================== */

const DEMO_DELIVERIES = Array.from(
  { length: 20 },
  (_, index) => {
    const deliveryMethod =
      DELIVERY_METHODS[index % DELIVERY_METHODS.length];

    const status =
      DELIVERY_STATUSES[index % DELIVERY_STATUSES.length];

    return {
      id: `DEL-${String(index + 1).padStart(5, "0")}`,
      customer: CUSTOMERS[index],
      phone: `98765${String(10000 + index).slice(-5)}`,
      event: EVENTS[index % EVENTS.length],
      item: DELIVERY_ITEMS[index % DELIVERY_ITEMS.length],
      quantity: (index % 4) + 1,
      deliveryMethod,
      address: ["Courier", "Home Delivery"].includes(
        deliveryMethod
      )
        ? LOCATIONS[index % LOCATIONS.length]
        : "",
      courier:
        deliveryMethod === "Courier"
          ? COURIERS[index % (COURIERS.length - 1)]
          : "",
      trackingNumber:
        deliveryMethod === "Courier"
          ? `TRK${102450 + index}`
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
          : "",
    };
  }
);

const DEMO_SELECTIONS = [
  { customer: "Arun Kumar", given: -14, due: -7, returned: null, count: 850, selected: 0 },
  { customer: "Priya S", given: -12, due: -4, returned: -5, count: 1200, selected: 160 },
  { customer: "Vijay Raj", given: -9, due: 1, returned: null, count: 960, selected: 0 },
  { customer: "Divya R", given: -19, due: -12, returned: null, count: 720, selected: 0 },
  { customer: "Karthik S", given: -6, due: 4, returned: null, count: 1400, selected: 0 },
  { customer: "Meena Devi", given: -16, due: -9, returned: -10, count: 540, selected: 85 },
  { customer: "Rahul Kumar", given: -4, due: 6, returned: null, count: 1100, selected: 0 },
  { customer: "Anitha", given: -13, due: -6, returned: null, count: 680, selected: 0 },
  { customer: "Sanjay", given: -2, due: 8, returned: null, count: 930, selected: 0 },
  { customer: "Deepa", given: -11, due: -2, returned: -3, count: 760, selected: 105 },
  { customer: "Manoj", given: -8, due: -1, returned: null, count: 820, selected: 0 },
  { customer: "Keerthana", given: -1, due: 9, returned: null, count: 1500, selected: 0 },
].map((item, index) => ({
  id: `SEL-${String(index + 1).padStart(5, "0")}`,
  customer: item.customer,
  phone: `98765${String(20000 + index).slice(-5)}`,
  project: EVENTS[index % EVENTS.length],
  givenDate: dateOffset(item.given),
  dueDate: dateOffset(item.due),
  returnedDate:
    item.returned === null ? "" : dateOffset(item.returned),
  photoCount: item.count,
  selectedCount: item.selected,
  method: SELECTION_METHODS[index % SELECTION_METHODS.length],
  assignedTo: STAFF[index % STAFF.length],
  notes:
    index % 3 === 0
      ? "Follow up with customer for final photo selection."
      : "",
}));

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (saved === null) return fallback;

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/* =====================================================
   PREMIUM LIGHT BLUE THEME
===================================================== */

const themeCSS = `
.sr-delivery-page,
.sr-delivery-portal {
  --sd-bg: #f0f7ff;
  --sd-surface: #ffffff;
  --sd-soft: #edf5ff;
  --sd-input: #f9fcff;
  --sd-text: #102b53;
  --sd-label: #385d89;
  --sd-muted: #748eae;
  --sd-border: #d6e7fa;
  --sd-primary: #173b70;
  --sd-primary-hover: #24548f;
  --sd-icon-bg: #e0efff;
  --sd-icon: #24558d;
}

.sr-delivery-page {
  background: linear-gradient(
    135deg,
    #f9fcff 0%,
    #f0f7ff 48%,
    #e5f1ff 100%
  );
  color: var(--sd-text);
}

.sr-delivery-page .sd-surface,
.sr-delivery-portal .sd-surface {
  background: var(--sd-surface);
  color: var(--sd-text);
  border-color: var(--sd-border);
}

.sr-delivery-page .sd-soft,
.sr-delivery-portal .sd-soft {
  background: var(--sd-soft);
  border-color: var(--sd-border);
}

.sr-delivery-page .sd-title,
.sr-delivery-portal .sd-title {
  color: var(--sd-text);
}

.sr-delivery-page .sd-label,
.sr-delivery-portal .sd-label {
  color: var(--sd-label);
}

.sr-delivery-page .sd-muted,
.sr-delivery-portal .sd-muted {
  color: var(--sd-muted);
}

.sr-delivery-page .sd-divider,
.sr-delivery-portal .sd-divider {
  border-color: var(--sd-border);
}

.sr-delivery-page .sd-icon,
.sr-delivery-portal .sd-icon {
  background: var(--sd-icon-bg);
  color: var(--sd-icon);
}

.sr-delivery-page .sd-primary,
.sr-delivery-portal .sd-primary {
  background: var(--sd-primary);
  color: white;
}

.sr-delivery-page .sd-primary:hover,
.sr-delivery-portal .sd-primary:hover {
  background: var(--sd-primary-hover);
}

.sr-delivery-page .sd-secondary,
.sr-delivery-portal .sd-secondary {
  background: white;
  color: var(--sd-text);
  border-color: var(--sd-border);
}

.sr-delivery-page .sd-secondary:hover,
.sr-delivery-portal .sd-secondary:hover {
  background: var(--sd-soft);
}

.sr-delivery-page .sd-input,
.sr-delivery-portal .sd-input {
  background: var(--sd-input);
  color: var(--sd-text);
  border-color: var(--sd-border);
}

.sr-delivery-page .sd-input::placeholder,
.sr-delivery-portal .sd-input::placeholder {
  color: var(--sd-muted);
}

.sr-delivery-page .sd-input:focus,
.sr-delivery-portal .sd-input:focus {
  border-color: #8dbcf3;
  box-shadow: 0 0 0 3px rgba(89,154,231,.12);
}

.sr-delivery-page .sd-card {
  animation: sd-card-in .45s ease both;
}

.sr-delivery-page .sd-card:hover {
  box-shadow: 0 16px 35px rgba(30,76,142,.10);
}

.sr-delivery-page .sd-progress {
  animation: sd-grow 1s ease both;
  transform-origin: left;
}

.sr-delivery-page .sd-tab-active {
  background: linear-gradient(135deg,#173b70,#3265a8);
  color: white;
  box-shadow: 0 7px 18px rgba(30,76,142,.18);
}

.sr-delivery-page .sd-hero {
  background: linear-gradient(
    120deg,
    #ffffff,
    #eaf4ff 55%,
    #d6eaff
  );
  border: 1px solid #cfe2fa;
  color: #102b53;
}

.sr-delivery-page .sd-surface {
  box-shadow: 0 6px 24px rgba(32,83,150,.045);
}

.sr-delivery-page .sd-scroll::-webkit-scrollbar,
.sr-delivery-portal .sd-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sr-delivery-page .sd-scroll::-webkit-scrollbar-thumb,
.sr-delivery-portal .sd-scroll::-webkit-scrollbar-thumb {
  background: #a4bddb;
  border-radius: 20px;
}

@keyframes sd-card-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sd-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .sr-delivery-page .sd-card,
  .sr-delivery-page .sd-progress {
    animation: none !important;
  }
}
`;

const inputClass =
  "sd-input w-full min-w-0 rounded-xl border px-3.5 py-3 text-sm outline-none transition";

/* =====================================================
   CLICK SOUND
===================================================== */

function useDeliverySounds() {
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;

      if (audio && audio.state !== "closed") {
        audio.close().catch(() => {});
      }
    };
  }, []);

  const playSound = (type = "click") => {
    try {
      if (localStorage.getItem(SOUND_KEY) === "false") return;

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

      const frequencies = {
        click: [600],
        open: [520, 720],
        success: [520, 660, 880],
        delete: [460, 310],
        error: [240, 200],
      };

      (frequencies[type] || frequencies.click).forEach(
        (frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();

          const start = context.currentTime + index * 0.095;
          const duration = type === "success" ? 0.13 : 0.09;

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, start);

          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(
            0.04,
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
        }
      );
    } catch {
      // Sound is optional.
    }
  };

  return playSound;
}

/* =====================================================
   COUNT UP ANIMATION
===================================================== */

function useCountUp(target, duration = 1500) {
  const finalValue = Math.max(0, Number(target) || 0);

  const [display, setDisplay] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const currentRef = useRef(0);

  const replay = () => {
    currentRef.current = 0;
    setDisplay(0);
    setReplayKey((previous) => previous + 1);
  };

  useEffect(() => {
    const startValue = currentRef.current;

    if (
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches
    ) {
      currentRef.current = finalValue;
      setDisplay(finalValue);
      return;
    }

    let frameId;
    let startTime = null;

    const animate = (timestamp) => {
      if (startTime === null) startTime = timestamp;

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      const next =
        startValue + (finalValue - startValue) * eased;

      currentRef.current = next;
      setDisplay(Math.round(next));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        currentRef.current = finalValue;
        setDisplay(finalValue);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [finalValue, duration, replayKey]);

  return { display, replay };
}

/* =====================================================
   COMMON COMPONENTS
===================================================== */

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
  playSound,
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const allOptions = useMemo(
    () =>
      value && !options.includes(value)
        ? [value, ...options]
        : options,
    [value, options]
  );

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    const below = window.innerHeight - rect.bottom;
    const above = rect.top;

    const desired = Math.min(
      260,
      allOptions.length * 43 + 12
    );

    const openAbove =
      below < desired + 12 && above > below;

    const height = Math.min(
      desired,
      Math.max(80, (openAbove ? above : below) - 12)
    );

    setPosition({
      position: "fixed",
      left: Math.max(
        8,
        Math.min(
          rect.left,
          window.innerWidth - rect.width - 8
        )
      ),
      width: Math.min(rect.width, window.innerWidth - 16),
      maxHeight: height,
      top: openAbove
        ? Math.max(8, rect.top - height - 6)
        : rect.bottom + 6,
      zIndex: 100000,
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const outside = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const escape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const scroll = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const resize = () => setOpen(false);

    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);

    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", resize);

    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);

      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", resize);
    };
  }, [open, allOptions.length]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        onClick={() => {
          playSound?.("click");

          if (!open) updatePosition();

          setOpen((previous) => !previous);
        }}
        className={`${inputClass} flex items-center justify-between gap-2 text-left font-medium`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
          className={`sd-muted shrink-0 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            style={position}
            className="sr-delivery-portal sd-surface sd-scroll overflow-y-auto rounded-xl border p-1.5 shadow-2xl"
          >
            {allOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  playSound?.("click");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-[#173b70] transition hover:bg-[#edf5ff]"
              >
                <span>{option}</span>

                {value === option && (
                  <Check size={16} className="shrink-0" />
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
  const colors = payment
    ? {
        Pending: "bg-rose-50 text-rose-700 border-rose-200",
        Partial: "bg-amber-50 text-amber-700 border-amber-200",
        Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      }
    : {
        Pending: "bg-amber-50 text-amber-700 border-amber-200",
        Packed: "bg-violet-50 text-violet-700 border-violet-200",
        Dispatched: "bg-blue-50 text-blue-700 border-blue-200",
        Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
        Returned: "bg-emerald-50 text-emerald-700 border-emerald-200",
        Overdue: "bg-rose-50 text-rose-700 border-rose-200",
      };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        colors[value] ||
        "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value || "Pending"}
    </span>
  );
}

function FormField({ label, required, children }) {
  return (
    <div className="min-w-0">
      <label className="sd-label mb-2 block text-xs font-semibold">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="sd-divider mb-5 flex items-center gap-3 border-b pb-4">
      <div className="sd-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <Icon size={19} />
      </div>

      <div>
        <h3 className="sd-title text-sm font-bold">
          {title}
        </h3>

        {subtitle && (
          <p className="sd-muted mt-1 text-xs">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, children }) {
  return (
    <div className="sd-soft min-w-0 rounded-xl border p-3">
      <div className="sd-muted mb-1.5 flex items-center gap-1.5 text-[10px] font-medium">
        {Icon && <Icon size={12} />}

        <span>{label}</span>
      </div>

      {children || (
        <p className="sd-title break-words text-xs font-bold leading-5">
          {value === 0 ? 0 : value || "—"}
        </p>
      )}
    </div>
  );
}

/* =====================================================
   PREMIUM ANIMATED STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  icon: Icon,
  tone = "blue",
  detail,
  playSound,
}) {
  const { display, replay } = useCountUp(value);

  const tones = {
    blue: {
      card: "from-white via-[#edf6ff] to-[#dcecff]",
      icon: "from-[#dbeafe] to-[#bfdbfe] text-blue-700",
      border: "border-[#cfe2ff]",
    },
    amber: {
      card: "from-white via-[#f0f7ff] to-[#e0edff]",
      icon: "from-[#e0edff] to-[#c7dcff] text-[#2853a1]",
      border: "border-[#d4e5ff]",
    },
    red: {
      card: "from-white via-[#edf5ff] to-[#dceaff]",
      icon: "from-[#dceaff] to-[#bfd7ff] text-[#3155a0]",
      border: "border-[#d0e2ff]",
    },
    green: {
      card: "from-white via-[#eef8ff] to-[#d7f0ff]",
      icon: "from-[#d9f0ff] to-[#bce5ff] text-[#0873a8]",
      border: "border-[#cce8fb]",
    },
    purple: {
      card: "from-white via-[#f1f5ff] to-[#e3e9ff]",
      icon: "from-[#e7eaff] to-[#d1d8ff] text-[#5146a5]",
      border: "border-[#dce3ff]",
    },
  };

  const style = tones[tone] || tones.blue;

  return (
    <button
      type="button"
      title="Click to replay count animation"
      onClick={() => {
        replay();
        playSound?.("click");
      }}
      className={`sd-card group relative w-full min-w-0 overflow-hidden rounded-[22px] border bg-gradient-to-br p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${style.card} ${style.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#587298] sm:text-xs">
            {title}
          </p>

          <h3 className="mt-3 text-2xl font-black tracking-tight text-[#102b53] sm:text-3xl">
            {display.toLocaleString("en-IN")}
          </h3>

          {detail && (
            <p className="mt-2 text-[10px] text-[#7188a8] sm:text-xs">
              {detail}
            </p>
          )}

          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[#6482ae]">
            <RotateCcw size={12} />
            Click to replay
          </div>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:scale-110 ${style.icon}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </button>
  );
}

/* =====================================================
   MODAL
===================================================== */

function ModalShell({
  title,
  description,
  icon: Icon,
  onClose,
  onSubmit,
  submitLabel,
  children,
  maxWidth = "max-w-[900px]",
}) {
  return createPortal(
    <div className="sr-delivery-portal fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152b]/70 p-2 backdrop-blur-[4px] sm:p-5">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`sd-surface relative flex max-h-[96dvh] w-full min-w-0 ${maxWidth} flex-col overflow-hidden rounded-[22px] border shadow-2xl sm:max-h-[93dvh] sm:rounded-[28px]`}
      >
        <div className="sd-divider flex shrink-0 items-start justify-between gap-3 border-b bg-gradient-to-r from-[#f5faff] to-[#e5f2ff] px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="sd-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
              <Icon size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="sd-title text-lg font-extrabold sm:text-xl">
                {title}
              </h2>

              <p className="sd-muted mt-1 text-xs">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sd-secondary shrink-0 rounded-xl border p-2"
          >
            <X size={19} />
          </button>
        </div>

        {onSubmit ? (
          <form
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="sd-scroll min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
              {children}
            </div>

            <div className="sd-divider flex shrink-0 flex-col-reverse gap-2 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="sd-secondary rounded-xl border px-6 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="sd-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
              >
                <Save size={17} />
                {submitLabel}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="sd-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7">
              {children}
            </div>

            <div className="sd-divider flex justify-end border-t px-4 py-4 sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="sd-primary rounded-xl px-6 py-3 text-sm font-semibold"
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

/* =====================================================
   DELIVERY CARD
===================================================== */

function DeliveryCard({
  item,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  playSound,
}) {
  return (
    <article className="sd-card sd-surface flex min-w-0 flex-col rounded-[22px] border p-4 shadow-sm transition-all duration-300">
      <div className="sd-divider flex items-start justify-between gap-2 border-b pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="sd-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
            <UserRound size={19} />
          </div>

          <div className="min-w-0">
            <h3 className="sd-title truncate text-sm font-extrabold">
              {item.customer}
            </h3>

            <p className="sd-muted mt-1 truncate text-[11px]">
              {item.customerId ? `${item.customerId} · ` : ""}{item.deliveryId || item.id}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onView(item)}
            className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
            title="View"
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"
            title="Edit"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 py-3">
        <span className="sd-label text-xs font-medium">
          Delivery Status
        </span>

        <StatusBadge value={item.status} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoBox
          label="Delivery Item"
          value={item.item}
          icon={Package}
        />

        <InfoBox
          label="Quantity"
          value={item.quantity}
          icon={Box}
        />

        <InfoBox
          label="Phone"
          value={item.phone}
          icon={Phone}
        />

        <InfoBox
          label="Delivery Method"
          value={item.deliveryMethod}
          icon={Truck}
        />

        <InfoBox
          label="Event"
          value={item.event}
          icon={Camera}
        />

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
          <StatusBadge
            value={item.paymentStatus}
            payment
          />
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
          <InfoBox
            label="Courier"
            value={item.courier}
            icon={Building2}
          />
        )}

        {item.notes && (
          <div className="col-span-2">
            <InfoBox
              label="Notes"
              value={item.notes}
              icon={FileText}
            />
          </div>
        )}
      </div>

      <div className="sd-divider mt-auto border-t pt-3">
        <p className="sd-label mb-2 text-[11px] font-semibold">
          Update Status
        </p>

        <CustomDropdown
          value={item.status || "Pending"}
          options={DELIVERY_STATUSES}
          onChange={(status) => onStatusChange(item, status)}
          playSound={playSound}
        />
      </div>
    </article>
  );
}

/* =====================================================
   PHOTO SELECTION CARD
===================================================== */

function SelectionCard({
  item,
  onView,
  onEdit,
  onDelete,
  onReturn,
}) {
  const status = getSelectionStatus(item);
  const progress = getSelectionProgress(item);

  const isReturned = status === "Returned";
  const isOverdue = status === "Overdue";

  const overdueDays = isOverdue
    ? daysBetween(item.dueDate, todayKey())
    : 0;

  return (
    <article className="sd-card sd-surface flex min-w-0 flex-col overflow-hidden rounded-[24px] border shadow-sm transition-all duration-300">
      <div
        className={`h-1.5 w-full ${
          isReturned
            ? "bg-gradient-to-r from-emerald-400 to-teal-500"
            : isOverdue
            ? "bg-gradient-to-r from-rose-400 to-orange-400"
            : "bg-gradient-to-r from-blue-400 to-indigo-500"
        }`}
      />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="sd-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Images size={22} />
            </div>

            <div className="min-w-0">
              <h3 className="sd-title truncate text-sm font-extrabold sm:text-base">
                {item.customer}
              </h3>

              <p className="sd-muted mt-1 truncate text-[11px]">
                {item.customerId ? `${item.customerId} · ` : ""}{item.id}
              </p>
            </div>
          </div>

          <StatusBadge value={status} />
        </div>

        <p className="sd-muted mt-4 min-h-8 text-xs leading-5">
          {item.project}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <InfoBox
            label="Given Date"
            value={formatDate(item.givenDate)}
            icon={CalendarDays}
          />

          <InfoBox
            label="Return Due"
            value={formatDate(item.dueDate)}
            icon={CalendarClock}
          />
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="sd-label text-[11px] font-semibold">
              {isReturned
                ? "Selection completed"
                : "Selection timeline"}
            </span>

            <span className="sd-muted text-[11px] font-bold">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#e4effd]">
            <div
              className={`sd-progress h-full rounded-full ${
                isReturned
                  ? "bg-emerald-500"
                  : isOverdue
                  ? "bg-rose-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <p
            className={`mt-2 text-[11px] font-semibold ${
              isOverdue
                ? "text-rose-600"
                : isReturned
                ? "text-emerald-600"
                : "text-[#748eae]"
            }`}
          >
            {isReturned
              ? `Returned on ${formatDate(item.returnedDate)}`
              : isOverdue
              ? `${overdueDays} day(s) overdue`
              : `${Math.max(
                  0,
                  daysBetween(todayKey(), item.dueDate)
                )} day(s) remaining`}
          </p>
        </div>

        <div className="sd-divider mt-4 grid grid-cols-2 gap-3 border-t pt-4">
          <div>
            <p className="sd-muted text-[10px]">
              Photos Shared
            </p>

            <p className="sd-title mt-1 text-sm font-extrabold">
              {Number(item.photoCount || 0).toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          <div>
            <p className="sd-muted text-[10px]">
              Photos Selected
            </p>

            <p className="sd-title mt-1 text-sm font-extrabold">
              {Number(item.selectedCount || 0).toLocaleString(
                "en-IN"
              )}
            </p>
          </div>
        </div>

        <div className="sd-divider mt-auto flex flex-wrap items-center gap-2 border-t pt-4">
          {!isReturned && (
            <button
              type="button"
              onClick={() => onReturn(item)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <CircleCheck size={15} />
              Mark Returned
            </button>
          )}

          <button
            type="button"
            onClick={() => onView(item)}
            title="View Details"
            className="rounded-xl bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-100"
          >
            <Eye size={17} />
          </button>

          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit"
            className="rounded-xl bg-amber-50 p-2.5 text-amber-700 hover:bg-amber-100"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            title="Delete"
            className="rounded-xl bg-rose-50 p-2.5 text-rose-600 hover:bg-rose-100"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function Delivery() {
  const playSound = useDeliverySounds();

  const [deliveries, setDeliveries] = useState(() =>
    readStorage(DELIVERY_KEY, DEMO_DELIVERIES)
  );

  const [selections, setSelections] = useState(() =>
    readStorage(SELECTION_KEY, DEMO_SELECTIONS)
  );

  const [customers, setCustomers] = useState(() =>
    readStoredRecords(CUSTOMER_KEY, "studioraw_customers")
  );

  const [bookings, setBookings] = useState(() =>
    readStoredRecords(BOOKING_KEY, "studio_raw_bookings")
  );

  const [activeTab, setActiveTab] = useState("selection");

  const [deliveryForm, setDeliveryForm] = useState(
    createEmptyDelivery
  );

  const [selectionForm, setSelectionForm] = useState(
    createEmptySelection
  );

  const [formType, setFormType] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [viewType, setViewType] = useState(null);
  const [viewId, setViewId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");

  /* ---------------- REAL-TIME SYNC ---------------- */

  useEffect(() => {
    const syncData = () => {
      setCustomers(readStoredRecords(CUSTOMER_KEY, "studioraw_customers"));
      setBookings(readStoredRecords(BOOKING_KEY, "studio_raw_bookings"));
    };

    window.addEventListener("storage", syncData);
    window.addEventListener(UPDATE_EVENT, syncData);
    window.addEventListener("focus", syncData);

    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener(UPDATE_EVENT, syncData);
      window.removeEventListener("focus", syncData);
    };
  }, []);

  /* ---------------- STORAGE ---------------- */

  useEffect(() => {
    try {
      localStorage.setItem(
        DELIVERY_KEY,
        JSON.stringify(deliveries)
      );

      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, {
          detail: { key: DELIVERY_KEY },
        })
      );
    } catch {
      console.error("Unable to save deliveries.");
    }
  }, [deliveries]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SELECTION_KEY,
        JSON.stringify(selections)
      );

      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, {
          detail: { key: SELECTION_KEY },
        })
      );
    } catch {
      console.error("Unable to save photo selections.");
    }
  }, [selections]);

  useEffect(() => {
    if (!formType && !viewType) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const escape = (event) => {
      if (event.key === "Escape") {
        setFormType(null);
        setViewType(null);
      }
    };

    document.addEventListener("keydown", escape);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [formType, viewType]);

  /* ---------------- FORM HELPERS ---------------- */

  const updateDelivery = (key, value) => {
    setDeliveryForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
  };

  const updateSelection = (key, value) => {
    setSelectionForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
  };

  const closeForm = () => {
    playSound("click");
    setFormType(null);
    setEditingId(null);
    setError("");
  };

  const refreshLinkedData = () => {
    setCustomers(readStoredRecords(CUSTOMER_KEY, "studioraw_customers"));
    setBookings(readStoredRecords(BOOKING_KEY, "studio_raw_bookings"));
  };

  const openCreate = () => {
    playSound("open");
    refreshLinkedData();

    setEditingId(null);
    setViewType(null);
    setError("");

    if (activeTab === "selection") {
      setSelectionForm(createEmptySelection());
      setFormType("selection");
    } else {
      setDeliveryForm(createEmptyDelivery());
      setFormType("delivery");
    }
  };

  const openEditDelivery = (item) => {
    playSound("open");
    refreshLinkedData();

    const matchedCust = customers.find(
      (c) =>
        (item.customerId && String(c.id) === String(item.customerId)) ||
        (customerPhoneOf(c) && customerPhoneOf(c) === normalizePhone(item.phone)) ||
        (customerNameOf(c).toLowerCase() === String(item.customer || "").trim().toLowerCase())
    );

    setDeliveryForm({
      ...createEmptyDelivery(),
      ...item,
      customerId: item.customerId || (matchedCust ? String(matchedCust.id) : ""),
      bookingId: item.bookingId || "",
    });

    setEditingId(item.id);
    setViewType(null);
    setError("");
    setFormType("delivery");
  };

  const openEditSelection = (item) => {
    playSound("open");
    refreshLinkedData();

    const matchedCust = customers.find(
      (c) =>
        (item.customerId && String(c.id) === String(item.customerId)) ||
        (customerPhoneOf(c) && customerPhoneOf(c) === normalizePhone(item.phone)) ||
        (customerNameOf(c).toLowerCase() === String(item.customer || "").trim().toLowerCase())
    );

    setSelectionForm({
      ...createEmptySelection(),
      ...item,
      customerId: item.customerId || (matchedCust ? String(matchedCust.id) : ""),
      bookingId: item.bookingId || "",
    });

    setEditingId(item.id);
    setViewType(null);
    setError("");
    setFormType("selection");
  };

  const openView = (type, item) => {
    playSound("open");
    setViewType(type);
    setViewId(item.id);
  };

  /* ---------------- CUSTOMER LINKING HELPERS ---------------- */

  const availableDeliveryBookings = useMemo(() => {
    if (!deliveryForm.customerId && !deliveryForm.phone) return [];
    const phone = normalizePhone(deliveryForm.phone);
    return bookings.filter(
      (b) =>
        (deliveryForm.customerId && String(b.customerId) === String(deliveryForm.customerId)) ||
        (phone && normalizePhone(b.phone) === phone)
    );
  }, [bookings, deliveryForm.customerId, deliveryForm.phone]);

  const availableSelectionBookings = useMemo(() => {
    if (!selectionForm.customerId && !selectionForm.phone) return [];
    const phone = normalizePhone(selectionForm.phone);
    return bookings.filter(
      (b) =>
        (selectionForm.customerId && String(b.customerId) === String(selectionForm.customerId)) ||
        (phone && normalizePhone(b.phone) === phone)
    );
  }, [bookings, selectionForm.customerId, selectionForm.phone]);

  const onSelectDeliveryCustomer = (selectedId) => {
    if (!selectedId) {
      setDeliveryForm((previous) => ({
        ...previous,
        customerId: "",
        bookingId: "",
      }));
      return;
    }

    const c = customers.find((item) => String(item.id) === String(selectedId));
    if (!c) return;

    const name = customerNameOf(c);
    const phone = customerPhoneOf(c);
    const address = customerAddressOf(c);

    const custBookings = bookings.filter(
      (b) =>
        (b.customerId && String(b.customerId) === String(c.id)) ||
        (phone && normalizePhone(b.phone) === phone)
    );
    const primary = custBookings[0];
    const eventName = primary ? (primary.event || primary.package || "") : "";

    setDeliveryForm((previous) => ({
      ...previous,
      customerId: String(c.id),
      bookingId: primary ? String(primary.id) : previous.bookingId,
      customer: name,
      phone: phone || previous.phone,
      address: address || previous.address,
      event: eventName && EVENTS.includes(eventName) ? eventName : previous.event,
    }));
    setError("");
  };

  const onSelectSelectionCustomer = (selectedId) => {
    if (!selectedId) {
      setSelectionForm((previous) => ({
        ...previous,
        customerId: "",
        bookingId: "",
      }));
      return;
    }

    const c = customers.find((item) => String(item.id) === String(selectedId));
    if (!c) return;

    const name = customerNameOf(c);
    const phone = customerPhoneOf(c);

    const custBookings = bookings.filter(
      (b) =>
        (b.customerId && String(b.customerId) === String(c.id)) ||
        (phone && normalizePhone(b.phone) === phone)
    );
    const primary = custBookings[0];
    const eventName = primary ? (primary.event || primary.package || "") : "";

    setSelectionForm((previous) => ({
      ...previous,
      customerId: String(c.id),
      bookingId: primary ? String(primary.id) : previous.bookingId,
      customer: name,
      phone: phone || previous.phone,
      project: eventName && EVENTS.includes(eventName) ? eventName : previous.project,
    }));
    setError("");
  };

  const onSelectDeliveryBooking = (bId) => {
    const booking = bookings.find((b) => String(b.id) === String(bId));
    if (!booking) {
      setDeliveryForm((prev) => ({ ...prev, bookingId: "" }));
      return;
    }
    const eventName = booking.event || booking.package || "";
    setDeliveryForm((prev) => ({
      ...prev,
      bookingId: String(booking.id),
      event: eventName && EVENTS.includes(eventName) ? eventName : prev.event,
    }));
  };

  const onSelectSelectionBooking = (bId) => {
    const booking = bookings.find((b) => String(b.id) === String(bId));
    if (!booking) {
      setSelectionForm((prev) => ({ ...prev, bookingId: "" }));
      return;
    }
    const eventName = booking.event || booking.package || "";
    setSelectionForm((prev) => ({
      ...prev,
      bookingId: String(booking.id),
      project: eventName && EVENTS.includes(eventName) ? eventName : prev.project,
    }));
  };

  /* ---------------- DELIVERY ACTIONS ---------------- */

  const saveDelivery = (event) => {
    event.preventDefault();

    const customer = String(
      deliveryForm.customer || ""
    ).trim();

    const phone = String(
      deliveryForm.phone || ""
    ).trim();

    const quantity = Number(deliveryForm.quantity);

    const fail = (message) => {
      setError(message);
      playSound("error");
    };

    if (!customer) {
      return fail("Please enter customer name.");
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return fail("Enter a valid 10-digit phone number.");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return fail("Quantity must be at least 1.");
    }

    if (
      deliveryForm.status === "Delivered" &&
      !deliveryForm.deliveredDate
    ) {
      return fail("Please select actual delivery date.");
    }

    if (
      ["Courier", "Home Delivery"].includes(
        deliveryForm.deliveryMethod
      ) &&
      !String(deliveryForm.address || "").trim()
    ) {
      return fail("Please enter delivery address.");
    }

    // End-to-end customer sync with main customer registry
    let effectiveCustomerId = deliveryForm.customerId;
    const phoneNorm = normalizePhone(phone);

    const existingCustomerIndex = customers.findIndex(
      (c) =>
        (effectiveCustomerId && String(c.id) === String(effectiveCustomerId)) ||
        (phoneNorm && customerPhoneOf(c) === phoneNorm) ||
        (customerNameOf(c).toLowerCase() === customer.toLowerCase())
    );

    let updatedCustomers = [...customers];
    let customerStorageChanged = false;

    if (existingCustomerIndex >= 0) {
      const existingCust = updatedCustomers[existingCustomerIndex];
      effectiveCustomerId = String(existingCust.id);
      if (!existingCust.address && deliveryForm.address) {
        updatedCustomers[existingCustomerIndex] = {
          ...existingCust,
          address: deliveryForm.address,
          updatedAt: new Date().toISOString(),
        };
        customerStorageChanged = true;
      }
    } else {
      // Auto-create customer record in main customer database so workflow is 100% end-to-end
      effectiveCustomerId = `CUS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const newCustomerRecord = {
        id: effectiveCustomerId,
        name: customer,
        phone: phoneNorm || phone,
        email: "",
        gender: "",
        language: "Tamil",
        source: "Deliverable",
        address: deliveryForm.address || "",
        notes: deliveryForm.notes ? `Delivery: ${deliveryForm.notes}` : "Created from Deliveries",
        createdAt: todayKey(),
        updatedAt: new Date().toISOString(),
        isDemo: false,
      };
      updatedCustomers = [newCustomerRecord, ...updatedCustomers];
      customerStorageChanged = true;
    }

    if (customerStorageChanged) {
      try {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(updatedCustomers));
        setCustomers(updatedCustomers);
        window.dispatchEvent(
          new CustomEvent(UPDATE_EVENT, { detail: { key: CUSTOMER_KEY, module: "customers" } })
        );
      } catch (err) {
        console.error("Failed to sync customer:", err);
      }
    }

    const record = {
      ...deliveryForm,
      id: editingId || createId("DEL"),
      customerId: effectiveCustomerId,
      customer,
      phone,
      quantity,
      assignedTo:
        deliveryForm.assignedTo || "Not Assigned",
    };

    setDeliveries((previous) =>
      editingId
        ? previous.map((item) =>
            item.id === editingId ? record : item
          )
        : [record, ...previous]
    );

    playSound("success");

    setFormType(null);
    setEditingId(null);
    setError("");
    setStatusError("");
  };

  const deleteDelivery = (id) => {
    playSound("click");

    if (!window.confirm("Delete this delivery record?")) {
      return;
    }

    setDeliveries((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (viewId === id) setViewType(null);

    playSound("delete");
  };

  const updateDeliveryStatus = (item, status) => {
    setStatusError("");

    if (status === item.status) return;

    if (status === "Delivered" && !item.deliveredDate) {
      setStatusError(
        `Confirm the actual delivery date for ${item.customer}.`
      );

      setDeliveryForm({
        ...createEmptyDelivery(),
        ...item,
        status: "Delivered",
        deliveredDate: todayKey(),
      });

      setEditingId(item.id);
      setFormType("delivery");

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

  /* ---------------- SELECTION ACTIONS ---------------- */

  const saveSelection = (event) => {
    event.preventDefault();

    const customer = String(
      selectionForm.customer || ""
    ).trim();

    const phone = String(
      selectionForm.phone || ""
    ).trim();

    const photoCount = Number(
      selectionForm.photoCount || 0
    );

    const selectedCount = Number(
      selectionForm.selectedCount || 0
    );

    const fail = (message) => {
      setError(message);
      playSound("error");
    };

    if (!customer) {
      return fail("Please enter customer name.");
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return fail("Enter a valid 10-digit phone number.");
    }

    if (!selectionForm.givenDate) {
      return fail("Please select the photos given date.");
    }

    if (!selectionForm.dueDate) {
      return fail("Please select the expected return date.");
    }

    if (
      selectionForm.dueDate < selectionForm.givenDate
    ) {
      return fail(
        "Expected return date cannot be before given date."
      );
    }

    if (
      selectionForm.returnedDate &&
      selectionForm.returnedDate < selectionForm.givenDate
    ) {
      return fail(
        "Actual return date cannot be before given date."
      );
    }

    if (
      !Number.isInteger(photoCount) ||
      !Number.isInteger(selectedCount) ||
      photoCount < 0 ||
      selectedCount < 0
    ) {
      return fail(
        "Photo counts must be valid whole numbers."
      );
    }

    if (selectedCount > photoCount) {
      return fail(
        "Selected photos cannot exceed shared photos."
      );
    }

    // End-to-end customer sync with main customer registry
    let effectiveCustomerId = selectionForm.customerId;
    const phoneNorm = normalizePhone(phone);

    const existingCustomerIndex = customers.findIndex(
      (c) =>
        (effectiveCustomerId && String(c.id) === String(effectiveCustomerId)) ||
        (phoneNorm && customerPhoneOf(c) === phoneNorm) ||
        (customerNameOf(c).toLowerCase() === customer.toLowerCase())
    );

    let updatedCustomers = [...customers];
    let customerStorageChanged = false;

    if (existingCustomerIndex >= 0) {
      effectiveCustomerId = String(updatedCustomers[existingCustomerIndex].id);
    } else {
      // Auto-create customer record in main customer database
      effectiveCustomerId = `CUS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const newCustomerRecord = {
        id: effectiveCustomerId,
        name: customer,
        phone: phoneNorm || phone,
        email: "",
        gender: "",
        language: "Tamil",
        source: "Deliverable",
        address: "",
        notes: selectionForm.notes ? `Photo Selection: ${selectionForm.notes}` : "Created from Photo Selection",
        createdAt: todayKey(),
        updatedAt: new Date().toISOString(),
        isDemo: false,
      };
      updatedCustomers = [newCustomerRecord, ...updatedCustomers];
      customerStorageChanged = true;
    }

    if (customerStorageChanged) {
      try {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(updatedCustomers));
        setCustomers(updatedCustomers);
        window.dispatchEvent(
          new CustomEvent(UPDATE_EVENT, { detail: { key: CUSTOMER_KEY, module: "customers" } })
        );
      } catch (err) {
        console.error("Failed to sync customer:", err);
      }
    }

    const record = {
      ...selectionForm,
      id: editingId || createId("SEL"),
      customerId: effectiveCustomerId,
      customer,
      phone,
      photoCount,
      selectedCount,
      assignedTo:
        selectionForm.assignedTo || "Not Assigned",
    };

    setSelections((previous) =>
      editingId
        ? previous.map((item) =>
            item.id === editingId ? record : item
          )
        : [record, ...previous]
    );

    playSound("success");

    setFormType(null);
    setEditingId(null);
    setError("");
  };

  const markReturned = (item) => {
    playSound("click");

    const confirmed = window.confirm(
      `Mark ${item.customer}'s photo selection as returned today?`
    );

    if (!confirmed) return false;

    setSelections((previous) =>
      previous.map((selection) =>
        selection.id === item.id
          ? {
              ...selection,
              returnedDate: todayKey(),
            }
          : selection
      )
    );

    playSound("success");

    return true;
  };

  const deleteSelection = (id) => {
    playSound("click");

    if (
      !window.confirm(
        "Delete this photo selection record?"
      )
    ) {
      return;
    }

    setSelections((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (viewId === id) setViewType(null);

    playSound("delete");
  };

  /* ---------------- FILTERS ---------------- */

  const filteredDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return deliveries.filter((item) => {
      const match = [
        item.id,
        item.deliveryId,
        item.customerId,
        item.bookingId,
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
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      );

      return (
        match &&
        (filter === "All" || item.status === filter)
      );
    });
  }, [deliveries, search, filter]);

  const filteredSelections = useMemo(() => {
    const query = search.trim().toLowerCase();

    return selections.filter((item) => {
      const match = [
        item.id,
        item.customerId,
        item.bookingId,
        item.customer,
        item.phone,
        item.project,
        item.method,
        item.assignedTo,
        item.notes,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      );

      return (
        match &&
        (filter === "All" ||
          getSelectionStatus(item) === filter)
      );
    });
  }, [selections, search, filter]);

  /* ---------------- STATISTICS ---------------- */

  const selectionStats = useMemo(
    () => ({
      total: selections.length,

      pending: selections.filter(
        (item) =>
          getSelectionStatus(item) === "Pending"
      ).length,

      overdue: selections.filter(
        (item) =>
          getSelectionStatus(item) === "Overdue"
      ).length,

      returned: selections.filter(
        (item) =>
          getSelectionStatus(item) === "Returned"
      ).length,
    }),
    [selections]
  );

  const deliveryStats = useMemo(
    () => ({
      total: deliveries.length,

      pending: deliveries.filter((item) =>
        ["Pending", "Packed"].includes(item.status)
      ).length,

      dispatched: deliveries.filter(
        (item) => item.status === "Dispatched"
      ).length,

      delivered: deliveries.filter(
        (item) => item.status === "Delivered"
      ).length,
    }),
    [deliveries]
  );

  const overdueSelections = useMemo(
    () =>
      selections
        .filter(
          (item) =>
            getSelectionStatus(item) === "Overdue"
        )
        .sort((a, b) =>
          String(a.dueDate || "").localeCompare(
            String(b.dueDate || "")
          )
        ),
    [selections]
  );

  const selectedView =
    viewType === "selection"
      ? selections.find((item) => item.id === viewId)
      : viewType === "delivery"
      ? deliveries.find((item) => item.id === viewId)
      : null;

  /* ---------------- CSV EXPORT ---------------- */

  const exportCSV = () => {
    const isSelection = activeTab === "selection";

    const columns = isSelection
      ? [
          "id",
          "customer",
          "phone",
          "project",
          "givenDate",
          "dueDate",
          "returnedDate",
          "photoCount",
          "selectedCount",
          "method",
          "assignedTo",
          "notes",
          "status",
        ]
      : [
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

    const records = isSelection
      ? filteredSelections.map((item) => ({
          ...item,
          status: getSelectionStatus(item),
        }))
      : filteredDeliveries;

    const escapeCSV = (value) => {
      const text = String(value ?? "");

      const safe = /^\s*[=+\-@\t\r]/.test(text)
        ? `'${text}`
        : text;

      return `"${safe.replace(/"/g, '""')}"`;
    };

    const rows = [
      columns.map(escapeCSV).join(","),

      ...records.map((item) =>
        columns
          .map((key) => escapeCSV(item[key]))
          .join(",")
      ),
    ];

    const blob = new Blob(
      ["\uFEFF", rows.join("\r\n")],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.download = isSelection
      ? "studioraw_photo_selections.csv"
      : "studioraw_deliveries.csv";

    document.body.appendChild(link);

    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    playSound("success");
  };

  const switchTab = (tab) => {
    playSound("click");

    setActiveTab(tab);
    setSearch("");
    setFilter("All");
    setStatusError("");
  };

  const isSelection = activeTab === "selection";

  const filtered = isSelection
    ? filteredSelections
    : filteredDeliveries;

  const total = isSelection
    ? selections.length
    : deliveries.length;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="sr-delivery-page min-h-screen w-full min-w-0 overflow-x-hidden px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
      <style>{themeCSS}</style>

      {/* HEADER */}

      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={exportCSV}
          className="sd-secondary flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold sm:flex-none sm:text-sm"
        >
          <Download size={17} />
          Export CSV
        </button>

        <button
          type="button"
          onClick={openCreate}
          className="sd-primary flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold sm:flex-none sm:text-sm"
        >
          <Plus size={18} />

          {isSelection
            ? "New Photo Selection"
            : "New Delivery"}
        </button>
      </div>

      {/* PREMIUM STATIC HERO */}

      {/* <section className="sd-hero relative mb-6 overflow-hidden rounded-[26px] p-5 shadow-sm sm:p-7 lg:p-8">
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9ddf5] bg-white/70 px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#24558d]">
              <Sparkles size={13} />
              SMART STUDIO WORKFLOW
            </div>

            <h2 className="text-xl font-black leading-tight text-[#102b53] sm:text-2xl lg:text-3xl">
              Every photo. Every promise.

              <span className="block text-[#3873b5]">
                Perfectly tracked.
              </span>
            </h2>

            <p className="mt-3 max-w-lg text-xs leading-6 text-[#58769c] sm:text-sm">
              Track customer photo selections, monitor
              return deadlines, and manage deliveries
              from one organized workspace.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Live Status",
                "Auto Overdue",
                "Return Tracking",
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[#cbdff7] bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-[#34649b]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-[30px] border border-[#c5def9] bg-white/50 shadow-sm sm:flex lg:h-36 lg:w-36">
            <Images
              size={64}
              strokeWidth={1.2}
              className="text-[#3b73b2]"
            />
          </div>
        </div>
      </section> */}

      {/* TABS */}

      <div className="sd-surface mb-6 flex flex-wrap gap-2 rounded-[20px] border p-2 shadow-sm">
        <button
          type="button"
          onClick={() => switchTab("selection")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold transition-all sm:flex-none sm:px-6 sm:text-sm ${
            isSelection
              ? "sd-tab-active"
              : "sd-label hover:bg-[#edf5ff]"
          }`}
        >
          <Images size={17} />

          Photo Selection

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              isSelection
                ? "bg-white/20"
                : "bg-[#e7f1ff] text-[#385d89]"
            }`}
          >
            {selections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("delivery")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold transition-all sm:flex-none sm:px-6 sm:text-sm ${
            !isSelection
              ? "sd-tab-active"
              : "sd-label hover:bg-[#edf5ff]"
          }`}
        >
          <Truck size={17} />

          Deliveries

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              !isSelection
                ? "bg-white/20"
                : "bg-[#e7f1ff] text-[#385d89]"
            }`}
          >
            {deliveries.length}
          </span>
        </button>
      </div>

      {/* ANIMATED STATISTICS */}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {isSelection ? (
          <>
            <StatCard
              title="Photos Given"
              value={selectionStats.total}
              icon={Images}
              tone="blue"
              detail="Total selection records"
              playSound={playSound}
            />

            <StatCard
              title="Awaiting Return"
              value={selectionStats.pending}
              icon={Clock3}
              tone="amber"
              detail="Within return deadline"
              playSound={playSound}
            />

            <StatCard
              title="Overdue Selections"
              value={selectionStats.overdue}
              icon={BellRing}
              tone="red"
              detail="Customer follow-up needed"
              playSound={playSound}
            />

            <StatCard
              title="Photos Returned"
              value={selectionStats.returned}
              icon={CheckCircle2}
              tone="green"
              detail="Completed selections"
              playSound={playSound}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Deliveries"
              value={deliveryStats.total}
              icon={Package}
              tone="blue"
              playSound={playSound}
            />

            <StatCard
              title="Pending Deliveries"
              value={deliveryStats.pending}
              icon={Clock3}
              tone="amber"
              playSound={playSound}
            />

            <StatCard
              title="Dispatched"
              value={deliveryStats.dispatched}
              icon={Truck}
              tone="purple"
              playSound={playSound}
            />

            <StatCard
              title="Delivered"
              value={deliveryStats.delivered}
              icon={CheckCircle2}
              tone="green"
              playSound={playSound}
            />
          </>
        )}
      </div>

      {/* OVERDUE ALERT */}

      {isSelection && overdueSelections.length > 0 && (
        <section className="mb-6 rounded-[22px] border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
              <BellRing size={20} />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-rose-900 sm:text-base">
                Smart Follow-up Alert
              </h3>

              <p className="mt-1 text-xs leading-5 text-rose-800">
                {overdueSelections.length} customers have
                not returned their photo selections within
                the expected date.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {overdueSelections.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  openView("selection", item)
                }
                className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50"
              >
                {item.customer} ·{" "}
                {daysBetween(
                  item.dueDate,
                  todayKey()
                )}
                d late
              </button>
            ))}
          </div>
        </section>
      )}

      {/* RECORDS */}

      <section className="sd-surface min-w-0 rounded-[24px] border shadow-sm">
        <div className="sd-divider border-b p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="sd-title flex items-center gap-2 text-lg font-extrabold">
                {isSelection ? (
                  <Images size={21} />
                ) : (
                  <ClipboardList size={21} />
                )}

                {isSelection
                  ? "Photo Selection Records"
                  : "Delivery Records"}
              </h2>

              <p className="sd-muted mt-1 text-xs">
                Showing {filtered.length} of {total} records
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:flex-1 xl:w-72">
                <Search
                  size={17}
                  className="sd-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={
                    isSelection
                      ? "Search photo selections..."
                      : "Search deliveries..."
                  }
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="flex w-full items-center gap-2 sm:w-52">
                <Filter
                  size={17}
                  className="sd-label shrink-0"
                />

                <CustomDropdown
                  value={filter}
                  options={
                    isSelection
                      ? [
                          "All",
                          "Pending",
                          "Overdue",
                          "Returned",
                        ]
                      : ["All", ...DELIVERY_STATUSES]
                  }
                  onChange={setFilter}
                  playSound={playSound}
                />
              </div>
            </div>
          </div>
        </div>

        {statusError && (
          <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle size={17} />

            <span className="flex-1">
              {statusError}
            </span>

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
            <div className="sd-icon rounded-3xl p-5">
              {isSelection ? (
                <Images size={35} />
              ) : (
                <Truck size={35} />
              )}
            </div>

            <h3 className="sd-title mt-4 font-extrabold">
              No records found
            </h3>

            <p className="sd-muted mt-2 text-sm">
              Try another search or create a new record.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="sd-primary mt-5 flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold"
            >
              <Plus size={16} />
              Add New Record
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 2xl:grid-cols-3">
            {isSelection
              ? filteredSelections.map((item) => (
                  <SelectionCard
                    key={item.id}
                    item={item}
                    onView={(record) =>
                      openView("selection", record)
                    }
                    onEdit={openEditSelection}
                    onDelete={deleteSelection}
                    onReturn={markReturned}
                  />
                ))
              : filteredDeliveries.map((item) => (
                  <DeliveryCard
                    key={item.id}
                    item={item}
                    onView={(record) =>
                      openView("delivery", record)
                    }
                    onEdit={openEditDelivery}
                    onDelete={deleteDelivery}
                    onStatusChange={updateDeliveryStatus}
                    playSound={playSound}
                  />
                ))}
          </div>
        )}

        <div className="sd-divider sd-muted flex flex-col gap-2 border-t px-4 py-4 text-xs sm:flex-row sm:justify-between sm:px-6">
          <span>
            Showing {filtered.length} of {total} records
          </span>

          <span>Studio Raw Picturez ERP</span>
        </div>
      </section>

      {/* PHOTO SELECTION FORM */}

      {formType === "selection" && (
        <ModalShell
          title={
            editingId
              ? "Edit Photo Selection"
              : "New Photo Selection"
          }
          description="Track photos shared with customers and their return dates"
          icon={Images}
          onClose={closeForm}
          onSubmit={saveSelection}
          submitLabel={
            editingId
              ? "Update Selection"
              : "Save Photo Selection"
          }
        >
          <div className="rounded-2xl border border-[#d3e5fa] bg-gradient-to-r from-[#edf6ff] to-[#e2efff] p-4">
            <div className="flex items-start gap-3">
              <Sparkles
                size={20}
                className="shrink-0 text-[#24558d]"
              />

              <div>
                <p className="text-sm font-bold text-[#102b53]">
                  Smart Photo Selection Tracking
                </p>

                <p className="mt-1 text-xs leading-5 text-[#58769c]">
                  Enter photos given date and expected
                  return date. Overdue status is
                  calculated automatically.
                </p>
              </div>
            </div>
          </div>

          <section>
            <SectionHeading
              icon={UserRound}
              title="Customer Information"
              subtitle="Select registered customer or enter details"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Select Registered Customer">
                  <select
                    value={selectionForm.customerId || ""}
                    onChange={(event) =>
                      onSelectSelectionCustomer(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      -- Select Existing Customer / Enter Manually --
                    </option>
                    {customers.map((c) => {
                      const cName = customerNameOf(c);
                      const cPhone = customerPhoneOf(c);
                      return (
                        <option key={c.id} value={String(c.id)}>
                          {cName} {cPhone ? `· ${cPhone}` : ""} ({c.id})
                        </option>
                      );
                    })}
                  </select>
                  {selectionForm.customerId && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                      Connected to Customer: {selectionForm.customer} ({selectionForm.customerId}) · Auto-filled
                    </p>
                  )}
                </FormField>
              </div>

              <FormField label="Customer Name" required>
                <input
                  required
                  type="text"
                  value={selectionForm.customer}
                  onChange={(event) =>
                    updateSelection(
                      "customer",
                      event.target.value
                    )
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
                  value={selectionForm.phone}
                  onChange={(event) =>
                    updateSelection(
                      "phone",
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="10-digit phone number"
                  className={inputClass}
                />
              </FormField>

              {availableSelectionBookings.length > 0 && (
                <div className="sm:col-span-2">
                  <FormField label="Linked Shoot / Booking">
                    <select
                      value={selectionForm.bookingId || ""}
                      onChange={(e) => onSelectSelectionBooking(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">-- Choose Shoot / Booking --</option>
                      {availableSelectionBookings.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.event || "Shoot"} ({b.date || "Scheduled"}) · {b.id}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              )}

              <div className="sm:col-span-2">
                <FormField label="Photography Package">
                  <CustomDropdown
                    value={selectionForm.project}
                    options={EVENTS}
                    onChange={(value) =>
                      updateSelection("project", value)
                    }
                    playSound={playSound}
                  />
                </FormField>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading
              icon={CalendarClock}
              title="Photo Selection Timeline"
              subtitle="Given date, expected return and actual return"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Photos Given Date" required>
                <input
                  required
                  type="date"
                  value={selectionForm.givenDate}
                  onChange={(event) =>
                    updateSelection(
                      "givenDate",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Expected Return Date" required>
                <input
                  required
                  type="date"
                  min={selectionForm.givenDate || undefined}
                  value={selectionForm.dueDate}
                  onChange={(event) =>
                    updateSelection(
                      "dueDate",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Actual Return Date">
                <input
                  type="date"
                  min={selectionForm.givenDate || undefined}
                  value={selectionForm.returnedDate}
                  onChange={(event) =>
                    updateSelection(
                      "returnedDate",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="sd-soft mt-4 flex items-center justify-between gap-3 rounded-2xl border p-4">
              <div>
                <p className="sd-muted text-[11px] font-semibold">
                  Automatic Selection Status
                </p>

                <p className="sd-title mt-1 text-xs">
                  Calculated from entered dates
                </p>
              </div>

              <StatusBadge
                value={getSelectionStatus(selectionForm)}
              />
            </div>
          </section>

          <section>
            <SectionHeading
              icon={ImageIcon}
              title="Photo Selection Details"
              subtitle="Shared photos, selected photos and sharing method"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Total Photos Shared">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={selectionForm.photoCount}
                  onChange={(event) =>
                    updateSelection(
                      "photoCount",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 1200"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Photos Selected">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={selectionForm.selectedCount}
                  onChange={(event) =>
                    updateSelection(
                      "selectedCount",
                      event.target.value
                    )
                  }
                  placeholder="e.g. 150"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Photos Shared Through">
                <CustomDropdown
                  value={selectionForm.method}
                  options={SELECTION_METHODS}
                  onChange={(value) =>
                    updateSelection("method", value)
                  }
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Assigned Staff">
                <CustomDropdown
                  value={selectionForm.assignedTo}
                  options={STAFF}
                  onChange={(value) =>
                    updateSelection("assignedTo", value)
                  }
                  playSound={playSound}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Selection Notes">
                  <textarea
                    rows={3}
                    value={selectionForm.notes}
                    onChange={(event) =>
                      updateSelection(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Customer follow-up and special instructions..."
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </ModalShell>
      )}

      {/* DELIVERY FORM */}

      {formType === "delivery" && (
        <ModalShell
          title={
            editingId ? "Edit Delivery" : "New Delivery"
          }
          description="Enter customer and delivery information"
          icon={Truck}
          onClose={closeForm}
          onSubmit={saveDelivery}
          submitLabel={
            editingId
              ? "Update Delivery"
              : "Save Delivery"
          }
        >
          <section>
            <SectionHeading
              icon={UserRound}
              title="Customer Information"
              subtitle="Select registered customer or enter details"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Select Registered Customer">
                  <select
                    value={deliveryForm.customerId || ""}
                    onChange={(event) =>
                      onSelectDeliveryCustomer(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">
                      -- Select Existing Customer / Enter Manually --
                    </option>
                    {customers.map((c) => {
                      const cName = customerNameOf(c);
                      const cPhone = customerPhoneOf(c);
                      return (
                        <option key={c.id} value={String(c.id)}>
                          {cName} {cPhone ? `· ${cPhone}` : ""} ({c.id})
                        </option>
                      );
                    })}
                  </select>
                  {deliveryForm.customerId && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                      Connected to Customer: {deliveryForm.customer} ({deliveryForm.customerId}) · Details & Address auto-filled
                    </p>
                  )}
                </FormField>
              </div>

              <FormField label="Customer Name" required>
                <input
                  required
                  type="text"
                  value={deliveryForm.customer}
                  onChange={(event) =>
                    updateDelivery(
                      "customer",
                      event.target.value
                    )
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
                  value={deliveryForm.phone}
                  onChange={(event) =>
                    updateDelivery(
                      "phone",
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="10-digit phone number"
                  className={inputClass}
                />
              </FormField>

              {availableDeliveryBookings.length > 0 && (
                <div className="sm:col-span-2">
                  <FormField label="Linked Shoot / Booking">
                    <select
                      value={deliveryForm.bookingId || ""}
                      onChange={(e) => onSelectDeliveryBooking(e.target.value)}
                      className={inputClass}
                    >
                      <option value="">-- Choose Shoot / Booking --</option>
                      {availableDeliveryBookings.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.event || "Shoot"} ({b.date || "Scheduled"}) · {b.id}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              )}

              <FormField label="Event Type">
                <CustomDropdown
                  value={deliveryForm.event}
                  options={EVENTS}
                  onChange={(value) =>
                    updateDelivery("event", value)
                  }
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Delivery Item">
                <CustomDropdown
                  value={deliveryForm.item}
                  options={DELIVERY_ITEMS}
                  onChange={(value) =>
                    updateDelivery("item", value)
                  }
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
                  value={deliveryForm.deliveryMethod}
                  options={DELIVERY_METHODS}
                  onChange={(value) =>
                    updateDelivery(
                      "deliveryMethod",
                      value
                    )
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
                  value={deliveryForm.quantity}
                  onChange={(event) =>
                    updateDelivery(
                      "quantity",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              {["Courier", "Home Delivery"].includes(
                deliveryForm.deliveryMethod
              ) && (
                <div className="sm:col-span-2">
                  <FormField
                    label="Delivery Address"
                    required
                  >
                    <textarea
                      required
                      rows={3}
                      value={deliveryForm.address}
                      onChange={(event) =>
                        updateDelivery(
                          "address",
                          event.target.value
                        )
                      }
                      placeholder="Enter delivery address"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              )}

              {deliveryForm.deliveryMethod ===
                "Courier" && (
                <>
                  <FormField label="Courier Company">
                    <CustomDropdown
                      value={deliveryForm.courier}
                      options={COURIERS}
                      onChange={(value) =>
                        updateDelivery("courier", value)
                      }
                      playSound={playSound}
                    />
                  </FormField>

                  <FormField label="Tracking Number">
                    <input
                      type="text"
                      value={deliveryForm.trackingNumber}
                      onChange={(event) =>
                        updateDelivery(
                          "trackingNumber",
                          event.target.value
                        )
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
                  value={deliveryForm.expectedDate}
                  onChange={(event) =>
                    updateDelivery(
                      "expectedDate",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Actual Delivery Date">
                <input
                  type="date"
                  value={deliveryForm.deliveredDate}
                  onChange={(event) =>
                    updateDelivery(
                      "deliveredDate",
                      event.target.value
                    )
                  }
                  className={inputClass}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Assigned Staff">
                  <CustomDropdown
                    value={deliveryForm.assignedTo}
                    options={STAFF}
                    onChange={(value) =>
                      updateDelivery(
                        "assignedTo",
                        value
                      )
                    }
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
                  value={deliveryForm.paymentStatus}
                  options={PAYMENT_STATUSES}
                  onChange={(value) =>
                    updateDelivery(
                      "paymentStatus",
                      value
                    )
                  }
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Delivery Status">
                <CustomDropdown
                  value={deliveryForm.status}
                  options={DELIVERY_STATUSES}
                  onChange={(value) =>
                    updateDelivery("status", value)
                  }
                  playSound={playSound}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Delivery Notes">
                  <textarea
                    rows={3}
                    value={deliveryForm.notes}
                    onChange={(event) =>
                      updateDelivery(
                        "notes",
                        event.target.value
                      )
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
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </ModalShell>
      )}

      {/* PHOTO SELECTION DETAILS */}

      {viewType === "selection" && selectedView && (
        <ModalShell
          title="Photo Selection Details"
          description={selectedView.customer}
          icon={Images}
          onClose={() => {
            playSound("click");
            setViewType(null);
          }}
          maxWidth="max-w-[700px]"
        >
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#edf6ff] to-[#dcecff] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#3873b5]">
                  Photo Selection Status
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-[#102b53]">
                  {selectedView.customer}
                </h3>
              </div>

              <StatusBadge
                value={getSelectionStatus(selectedView)}
              />
            </div>
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

            {selectedView.customerId && (
              <InfoBox
                label="Customer Profile ID"
                value={selectedView.customerId}
                icon={Hash}
              />
            )}

            {selectedView.bookingId && (
              <InfoBox
                label="Linked Booking"
                value={selectedView.bookingId}
                icon={Camera}
              />
            )}

            <div className="col-span-2">
              <InfoBox
                label="Photography Package"
                value={selectedView.project}
                icon={Camera}
              />
            </div>

            <InfoBox
              label="Photos Given Date"
              value={formatDate(selectedView.givenDate)}
              icon={CalendarDays}
            />

            <InfoBox
              label="Expected Return Date"
              value={formatDate(selectedView.dueDate)}
              icon={CalendarClock}
            />

            <InfoBox
              label="Actual Return Date"
              value={formatDate(selectedView.returnedDate)}
              icon={CheckCircle2}
            />

            <InfoBox
              label="Sharing Method"
              value={selectedView.method}
              icon={Images}
            />

            <InfoBox
              label="Total Photos Shared"
              value={selectedView.photoCount}
              icon={ImageIcon}
            />

            <InfoBox
              label="Photos Selected"
              value={selectedView.selectedCount}
              icon={Check}
            />

            <div className="col-span-2">
              <InfoBox
                label="Assigned Staff"
                value={selectedView.assignedTo}
                icon={UserRound}
              />
            </div>

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

          <div className="mt-5 flex flex-wrap gap-2">
            {getSelectionStatus(selectedView) !==
              "Returned" && (
              <button
                type="button"
                onClick={() => {
                  if (markReturned(selectedView)) {
                    setViewType(null);
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 size={17} />
                Mark Returned
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                openEditSelection(selectedView)
              }
              className="sd-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              <Pencil size={16} />
              Edit Selection
            </button>
          </div>
        </ModalShell>
      )}

      {/* DELIVERY DETAILS */}

      {viewType === "delivery" && selectedView && (
        <ModalShell
          title="Delivery Details"
          description={selectedView.customer}
          icon={Package}
          onClose={() => {
            playSound("click");
            setViewType(null);
          }}
          maxWidth="max-w-[700px]"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="sd-label text-sm font-semibold">
              Delivery Status
            </span>

            <StatusBadge
              value={selectedView.status}
            />
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

            {selectedView.customerId && (
              <InfoBox
                label="Customer Profile ID"
                value={selectedView.customerId}
                icon={Hash}
              />
            )}

            {selectedView.bookingId && (
              <InfoBox
                label="Linked Booking"
                value={selectedView.bookingId}
                icon={Camera}
              />
            )}

            <InfoBox
              label="Event"
              value={selectedView.event}
              icon={Camera}
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

            <InfoBox
              label="Payment Status"
              icon={CreditCard}
            >
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
            onClick={() =>
              openEditDelivery(selectedView)
            }
            className="sd-primary mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
          >
            <Pencil size={16} />
            Edit Delivery
          </button>
        </ModalShell>
      )}
    </div>
  );
}
