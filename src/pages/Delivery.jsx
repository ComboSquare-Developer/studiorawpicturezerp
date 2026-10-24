
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Search, X, Truck, Package, CheckCircle2, Clock3,
  Pencil, Trash2, CalendarDays, UserRound, MapPin, Save,
  Phone, Download, ChevronDown, Check, AlertCircle,
  CreditCard, ClipboardList, Eye, Hash, FileText, Box,
  Building2, Filter, Images, Sparkles, RotateCcw,
  ArrowUpRight, CalendarClock, Image as ImageIcon,
  Activity, Camera, CircleCheck, BellRing, Layers3,
} from "lucide-react";

/* =========================================================
   STORAGE & OPTIONS
========================================================= */

const DELIVERY_KEY = "studioraw_deliveries";
const SELECTION_KEY = "studioraw_photo_selections";
const SOUND_KEY = "studioraw_delivery_sounds";
const UPDATE_EVENT = "studioraw:data-updated";

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
  "Wedding Album", "Photo Album", "Edited Photos",
  "Wedding Video", "Photo & Video", "USB Drive",
  "Printed Frames", "Canvas Print", "Photo Book",
  "Digital Gallery", "Customized Gifts", "Other",
];

const DELIVERY_METHODS = [
  "Studio Pickup", "Home Delivery", "Courier", "Digital Delivery",
];

const DELIVERY_STATUSES = [
  "Pending", "Packed", "Dispatched", "Delivered", "Cancelled",
];

const PAYMENT_STATUSES = ["Pending", "Partial", "Paid"];

const SELECTION_METHODS = [
  "Google Drive", "WhatsApp", "USB Drive",
  "Online Gallery", "Studio Visit", "Other",
];

const STAFF = [
  "Karthik", "Ramesh", "Suresh", "Arun", "Vignesh",
  "Rahul", "Manoj", "Priya", "Divya", "Not Assigned",
];

const COURIERS = [
  "DTDC", "Blue Dart", "Delhivery", "India Post",
  "Professional Couriers", "ST Courier", "Other",
];

const CUSTOMERS = [
  "Arun Kumar", "Priya S", "Vijay Raj", "Divya R",
  "Karthik S", "Meena Devi", "Rahul Kumar", "Anitha",
  "Sanjay", "Deepa", "Manoj", "Keerthana", "Suresh",
  "Nithya", "Vignesh", "Harini", "Ajay", "Swetha",
  "Ramesh", "Pavithra",
];

const LOCATIONS = [
  "Nagercoil, Tamil Nadu",
  "Marthandam, Tamil Nadu",
  "Kanyakumari, Tamil Nadu",
  "Tirunelveli, Tamil Nadu",
  "Chennai, Tamil Nadu",
];

/* =========================================================
   DATE & DATA HELPERS
========================================================= */

function dateOffset(days) {
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

  const first = new Date(`${from}T12:00:00`);
  const second = new Date(`${to}T12:00:00`);

  return Math.round((second - first) / 86400000);
}

function createId(prefix = "SR") {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}

function getSelectionStatus(item) {
  if (item.returnedDate) return "Returned";
  if (item.dueDate && item.dueDate < todayKey()) return "Overdue";
  return "Pending";
}

function getSelectionProgress(item) {
  if (item.returnedDate) return 100;
  if (!item.givenDate || !item.dueDate) return 12;

  const total = Math.max(1, daysBetween(item.givenDate, item.dueDate));
  const elapsed = daysBetween(item.givenDate, todayKey());

  return Math.max(8, Math.min(96, Math.round((elapsed / total) * 100)));
}

function createEmptyDelivery() {
  return {
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

const DEMO_DELIVERIES = Array.from({ length: 20 }, (_, index) => {
  const deliveryMethod = DELIVERY_METHODS[index % DELIVERY_METHODS.length];
  const status = DELIVERY_STATUSES[index % DELIVERY_STATUSES.length];

  return {
    id: `DEL-${String(index + 1).padStart(5, "0")}`,
    customer: CUSTOMERS[index],
    phone: `98765${String(10000 + index).slice(-5)}`,
    event: EVENTS[index % EVENTS.length],
    item: DELIVERY_ITEMS[index % DELIVERY_ITEMS.length],
    quantity: (index % 4) + 1,
    deliveryMethod,
    address: ["Courier", "Home Delivery"].includes(deliveryMethod)
      ? LOCATIONS[index % LOCATIONS.length]
      : "",
    courier: deliveryMethod === "Courier"
      ? COURIERS[index % (COURIERS.length - 1)]
      : "",
    trackingNumber: deliveryMethod === "Courier"
      ? `TRK${102450 + index}`
      : "",
    expectedDate: dateOffset(index - 8),
    deliveredDate: status === "Delivered" ? dateOffset(index - 9) : "",
    assignedTo: STAFF[index % STAFF.length],
    paymentStatus: PAYMENT_STATUSES[index % PAYMENT_STATUSES.length],
    status,
    notes: index % 3 === 0
      ? "Handle carefully and confirm with customer."
      : "",
  };
});

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
  returnedDate: item.returned === null ? "" : dateOffset(item.returned),
  photoCount: item.count,
  selectedCount: item.selected,
  method: SELECTION_METHODS[index % SELECTION_METHODS.length],
  assignedTo: STAFF[index % STAFF.length],
  notes: index % 3 === 0
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

/* =========================================================
   PREMIUM THEME + ANIMATIONS
========================================================= */

const themeCSS = `
.sr-delivery-page,
.sr-delivery-portal {
  --sd-bg: #f3f6fc;
  --sd-surface: #ffffff;
  --sd-soft: #f6f8fd;
  --sd-input: #ffffff;
  --sd-text: #142345;
  --sd-label: #405372;
  --sd-muted: #78869e;
  --sd-border: #e2e9f4;
  --sd-primary: #172d58;
  --sd-primary-hover: #274679;
  --sd-icon-bg: #eaf0fb;
  --sd-icon: #234b88;
}

html.dark .sr-delivery-page,
html.dark .sr-delivery-portal,
html[data-theme="dark"] .sr-delivery-page,
html[data-theme="dark"] .sr-delivery-portal {
  --sd-bg: #09111f;
  --sd-surface: #142238;
  --sd-soft: #1b2c45;
  --sd-input: #1c2d46;
  --sd-text: #f1f5fd;
  --sd-label: #d4e0f1;
  --sd-muted: #a7b7cf;
  --sd-border: #334761;
  --sd-primary: #365d9b;
  --sd-primary-hover: #4675bd;
  --sd-icon-bg: #263d60;
  --sd-icon: #c9dcff;
}

.sr-delivery-page {
  background: var(--sd-bg);
  color: var(--sd-text);
}

.sr-delivery-page .sd-surface,
.sr-delivery-portal .sd-surface,
.sr-delivery-portal.sd-surface {
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
  color: #ffffff;
}

.sr-delivery-page .sd-primary:hover,
.sr-delivery-portal .sd-primary:hover {
  background: var(--sd-primary-hover);
}

.sr-delivery-page .sd-secondary,
.sr-delivery-portal .sd-secondary {
  background: var(--sd-surface);
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

.sr-delivery-page .sd-badge,
.sr-delivery-portal .sd-badge {
  background: var(--badge-bg);
  color: var(--badge-fg);
  border-color: var(--badge-border);
}

.sr-delivery-page .sd-badge-dot,
.sr-delivery-portal .sd-badge-dot {
  background: var(--badge-fg);
}

.sr-delivery-page .sd-option,
.sr-delivery-portal .sd-option {
  color: var(--sd-text);
}

.sr-delivery-page .sd-option:hover,
.sr-delivery-portal .sd-option:hover,
.sr-delivery-portal .sd-option[aria-selected="true"] {
  background: var(--sd-soft);
}

html.dark .sr-delivery-page input[type="date"],
html.dark .sr-delivery-portal input[type="date"],
html[data-theme="dark"] .sr-delivery-page input[type="date"],
html[data-theme="dark"] .sr-delivery-portal input[type="date"] {
  color-scheme: dark;
}

.sr-delivery-page .sd-card {
  animation: sd-card-in .55s cubic-bezier(.2,.8,.2,1) both;
}

.sr-delivery-page .sd-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 38px rgba(31,54,96,.10);
}

.sr-delivery-page .sd-glow {
  animation: sd-glow 5s ease-in-out infinite;
}

.sr-delivery-page .sd-float {
  animation: sd-float 4s ease-in-out infinite;
}

.sr-delivery-page .sd-progress {
  animation: sd-grow 1.1s cubic-bezier(.2,.8,.2,1) both;
  transform-origin: left;
}

.sr-delivery-page .sd-tab-active {
  background: linear-gradient(135deg,#193968,#344d9d);
  color: white;
  box-shadow: 0 7px 18px rgba(40,75,150,.20);
}

.sr-delivery-page .sd-hero {
  background: linear-gradient(115deg,#172d58,#293f81 55%,#584b9b);
  color: #fff;
}

.sr-delivery-page .sd-hero-pattern {
  background-image: radial-gradient(rgba(255,255,255,.16) 1px,transparent 1px);
  background-size: 22px 22px;
}

.sr-delivery-page .sd-scroll::-webkit-scrollbar,
.sr-delivery-portal .sd-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sr-delivery-page .sd-scroll::-webkit-scrollbar-thumb,
.sr-delivery-portal .sd-scroll::-webkit-scrollbar-thumb {
  background: #a4b3ce;
  border-radius: 20px;
}

@keyframes sd-card-in {
  from { opacity:0; transform:translateY(16px) scale(.985); }
  to { opacity:1; transform:translateY(0) scale(1); }
}

@keyframes sd-float {
  0%,100% { transform:translateY(0) rotate(-5deg); }
  50% { transform:translateY(-9px) rotate(3deg); }
}

@keyframes sd-glow {
  0%,100% { opacity:.55; transform:scale(1); }
  50% { opacity:.85; transform:scale(1.12); }
}

@keyframes sd-grow {
  from { transform:scaleX(0); }
  to { transform:scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .sr-delivery-page .sd-card,
  .sr-delivery-page .sd-float,
  .sr-delivery-page .sd-glow,
  .sr-delivery-page .sd-progress {
    animation:none !important;
  }
  .sr-delivery-page .sd-card:hover {
    transform:none;
  }
}
`;

const inputClass =
  "sd-input w-full min-w-0 rounded-xl border px-3.5 py-3 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400/20";

/* =========================================================
   SOUNDS
========================================================= */

function useDeliverySounds() {
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current?.state !== "closed") {
        audioRef.current?.close().catch(() => {});
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

      (frequencies[type] || frequencies.click).forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * 0.095;
        const duration = type === "success" ? 0.13 : 0.09;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.04, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.01);
      });
    } catch {
      // Audio is optional.
    }
  };

  return playSound;
}

/* =========================================================
   UI COMPONENTS
========================================================= */

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
    () => value && !options.includes(value) ? [value, ...options] : options,
    [value, options]
  );

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    const desired = Math.min(260, allOptions.length * 43 + 12);
    const openAbove = below < desired + 12 && above > below;
    const height = Math.min(
      desired,
      Math.max(80, (openAbove ? above : below) - 12)
    );

    setPosition({
      position: "fixed",
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      width: Math.min(rect.width, window.innerWidth - 16),
      maxHeight: height,
      top: openAbove ? Math.max(8, rect.top - height - 6) : rect.bottom + 6,
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
      if (!menuRef.current?.contains(event.target)) setOpen(false);
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
        aria-haspopup="listbox"
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
          className={`sd-muted shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={position}
          className="sr-delivery-portal sd-surface sd-scroll overflow-y-auto overscroll-contain rounded-xl border p-1.5 shadow-2xl"
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
              className="sd-option flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition"
            >
              <span className="break-words">{option}</span>
              {value === option && <Check size={16} className="shrink-0" />}
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
        Pending: ["#fff1f2", "#9f1239", "#fda4af"],
        Partial: ["#fffbeb", "#92400e", "#fcd34d"],
        Paid: ["#ecfdf5", "#065f46", "#6ee7b7"],
      }
    : {
        Pending: ["#fff7ed", "#9a3412", "#fdba74"],
        Packed: ["#f5f3ff", "#6d28d9", "#c4b5fd"],
        Dispatched: ["#eff6ff", "#1d4ed8", "#93c5fd"],
        Delivered: ["#ecfdf5", "#047857", "#6ee7b7"],
        Cancelled: ["#fff1f2", "#be123c", "#fda4af"],
        Returned: ["#ecfdf5", "#047857", "#6ee7b7"],
        Overdue: ["#fff1f2", "#be123c", "#fda4af"],
      };

  const [bg, fg, border] = colors[value] || [
    "#f1f5f9", "#475569", "#cbd5e1",
  ];

  return (
    <span
      className="sd-badge inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold"
      style={{
        "--badge-bg": bg,
        "--badge-fg": fg,
        "--badge-border": border,
      }}
    >
      <span className="sd-badge-dot h-1.5 w-1.5 shrink-0 rounded-full" />
      <span className="truncate">{value || "Pending"}</span>
    </span>
  );
}

function FormField({ label, required, children }) {
  return (
    <div className="min-w-0">
      <label className="sd-label mb-2 block text-xs font-semibold">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
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
        <h3 className="sd-title text-sm font-bold">{title}</h3>
        {subtitle && <p className="sd-muted mt-1 text-xs">{subtitle}</p>}
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, children }) {
  return (
    <div className="sd-soft min-w-0 rounded-xl border p-3">
      <div className="sd-muted mb-1.5 flex items-center gap-1.5 text-[10px] font-medium">
        {Icon && <Icon size={12} className="shrink-0" />}
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

function StatCard({ title, value, icon: Icon, tone = "blue", detail }) {
  const tones = {
    blue: "from-blue-50 to-indigo-50 text-blue-700",
    amber: "from-amber-50 to-orange-50 text-amber-700",
    red: "from-rose-50 to-red-50 text-rose-700",
    green: "from-emerald-50 to-teal-50 text-emerald-700",
    purple: "from-violet-50 to-fuchsia-50 text-violet-700",
  };

  return (
    <div className="sd-card sd-surface min-w-0 rounded-[22px] border p-4 shadow-sm transition-all duration-300 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="sd-muted text-[11px] font-semibold sm:text-xs">
            {title}
          </p>
          <h3 className="sd-title mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {value}
          </h3>
          {detail && (
            <p className="sd-muted mt-2 text-[10px] sm:text-xs">{detail}</p>
          )}
        </div>
        <div className={`rounded-2xl bg-gradient-to-br p-3 ${tones[tone]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
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
  maxWidth = "max-w-[900px]",
}) {
  return createPortal(
    <div className="sr-delivery-portal fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152b]/75 p-2 backdrop-blur-[5px] sm:p-5">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`sd-surface relative flex max-h-[96dvh] w-full min-w-0 ${maxWidth} flex-col overflow-hidden rounded-[22px] border shadow-2xl sm:max-h-[93dvh] sm:rounded-[28px]`}
      >
        <div className="sd-divider flex shrink-0 items-start justify-between gap-3 border-b px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="sd-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
              <Icon size={21} />
            </div>
            <div className="min-w-0">
              <h2 className="sd-title text-lg font-extrabold sm:text-xl">
                {title}
              </h2>
              <p className="sd-muted mt-1 text-xs">{description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="sd-secondary shrink-0 rounded-xl border p-2"
          >
            <X size={19} />
          </button>
        </div>

        {onSubmit ? (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="sd-scroll min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
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
            <div className="sd-divider flex shrink-0 justify-end border-t px-4 py-4 sm:px-7">
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

/* =========================================================
   DELIVERY CARD
========================================================= */

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
              {deliveryId}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button onClick={() => onView(item)} title="View" className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100">
            <Eye size={15} />
          </button>
          <button onClick={() => onEdit(item)} title="Edit" className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(item.id)} title="Delete" className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 py-3">
        <span className="sd-label text-xs font-medium">Delivery Status</span>
        <StatusBadge value={item.status} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoBox label="Delivery Item" value={item.item} icon={Package} />
        <InfoBox label="Quantity" value={item.quantity} icon={Box} />
        <InfoBox label="Phone" value={item.phone} icon={Phone} />
        <InfoBox label="Delivery Method" value={item.deliveryMethod} icon={Truck} />
        <InfoBox label="Event" value={item.event} icon={Camera} />
        <InfoBox label="Expected Date" value={formatDate(item.expectedDate)} icon={CalendarDays} />
        <InfoBox label="Actual Date" value={formatDate(item.deliveredDate)} icon={CheckCircle2} />
        <InfoBox label="Assigned Staff" value={item.assignedTo || "Not Assigned"} icon={UserRound} />
        <InfoBox label="Payment Status" icon={CreditCard}>
          <StatusBadge value={item.paymentStatus} payment />
        </InfoBox>
        <InfoBox label="Tracking Number" value={item.trackingNumber} icon={Hash} />

        {item.address && (
          <div className="col-span-2">
            <InfoBox label="Delivery Address" value={item.address} icon={MapPin} />
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

      <div className="sd-divider mt-auto border-t pt-3">
        <p className="sd-label mb-2 text-[11px] font-semibold">Update Status</p>
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

/* =========================================================
   PHOTO SELECTION CARD
========================================================= */

function SelectionCard({
  item,
  onView,
  onEdit,
  onDelete,
  onReturn,
}) {
  const status = getSelectionStatus(item);
  const progress = getSelectionProgress(item);
  const overdueDays = status === "Overdue"
    ? daysBetween(item.dueDate, todayKey())
    : 0;

  const isOverdue = status === "Overdue";
  const isReturned = status === "Returned";

  return (
    <article className="sd-card sd-surface group relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border shadow-sm transition-all duration-300">
      <div
        className={`h-1.5 w-full ${
          isReturned
            ? "bg-gradient-to-r from-emerald-400 to-teal-500"
            : isOverdue
            ? "bg-gradient-to-r from-rose-400 to-orange-400"
            : "bg-gradient-to-r from-blue-400 to-violet-500"
        }`}
      />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isReturned
                  ? "bg-emerald-50 text-emerald-600"
                  : isOverdue
                  ? "bg-rose-50 text-rose-600"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <Images size={22} />
            </div>

            <div className="min-w-0">
              <h3 className="sd-title truncate text-sm font-extrabold sm:text-base">
                {item.customer}
              </h3>
              <p className="sd-muted mt-1 truncate text-[11px]">
                {item.id}
              </p>
            </div>
          </div>

          <StatusBadge value={status} />
        </div>

        <p className="sd-muted mt-4 line-clamp-2 min-h-8 text-xs leading-5">
          {item.project}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="sd-soft rounded-2xl border p-3">
            <div className="sd-muted flex items-center gap-1.5 text-[10px]">
              <CalendarDays size={12} />
              Given Date
            </div>
            <p className="sd-title mt-2 text-xs font-bold">
              {formatDate(item.givenDate)}
            </p>
          </div>

          <div className="sd-soft rounded-2xl border p-3">
            <div className="sd-muted flex items-center gap-1.5 text-[10px]">
              <CalendarClock size={12} />
              Return Due
            </div>
            <p className="sd-title mt-2 text-xs font-bold">
              {formatDate(item.dueDate)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="sd-label text-[11px] font-semibold">
              {isReturned ? "Selection completed" : "Selection timeline"}
            </span>
            <span className="sd-muted text-[11px] font-bold">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`sd-progress h-full rounded-full ${
                isReturned
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                  : isOverdue
                  ? "bg-gradient-to-r from-rose-400 to-orange-500"
                  : "bg-gradient-to-r from-blue-400 to-violet-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className={`mt-2 text-[11px] font-semibold ${
            isOverdue
              ? "text-rose-600"
              : isReturned
              ? "text-emerald-600"
              : "sd-muted"
          }`}>
            {isReturned
              ? `Returned on ${formatDate(item.returnedDate)}`
              : isOverdue
              ? `${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue · Follow up needed`
              : item.dueDate
              ? `${Math.max(0, daysBetween(todayKey(), item.dueDate))} day(s) remaining`
              : "Return date not set"}
          </p>
        </div>

        <div className="sd-divider mt-4 grid grid-cols-2 gap-3 border-t pt-4">
          <div>
            <p className="sd-muted text-[10px]">Photos Shared</p>
            <p className="sd-title mt-1 text-sm font-extrabold">
              {Number(item.photoCount || 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="sd-muted text-[10px]">Photos Selected</p>
            <p className="sd-title mt-1 text-sm font-extrabold">
              {Number(item.selectedCount || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="sd-divider mt-auto flex flex-wrap items-center gap-2 border-t pt-4">
          {!isReturned && (
            <button
              type="button"
              onClick={() => onReturn(item)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              <CircleCheck size={15} />
              Mark Returned
            </button>
          )}

          <button
            type="button"
            title="View Details"
            onClick={() => onView(item)}
            className="rounded-xl bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-100"
          >
            <Eye size={17} />
          </button>

          <button
            type="button"
            title="Edit"
            onClick={() => onEdit(item)}
            className="rounded-xl bg-amber-50 p-2.5 text-amber-700 hover:bg-amber-100"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            title="Delete"
            onClick={() => onDelete(item.id)}
            className="rounded-xl bg-rose-50 p-2.5 text-rose-600 hover:bg-rose-100"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Delivery() {
  const playSound = useDeliverySounds();

  const [deliveries, setDeliveries] = useState(() =>
    readStorage(DELIVERY_KEY, DEMO_DELIVERIES)
  );

  const [selections, setSelections] = useState(() =>
    readStorage(SELECTION_KEY, DEMO_SELECTIONS)
  );

  const [activeTab, setActiveTab] = useState("selection");

  const [deliveryForm, setDeliveryForm] = useState(createEmptyDelivery);
  const [selectionForm, setSelectionForm] = useState(createEmptySelection);

  const [formType, setFormType] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [viewType, setViewType] = useState(null);
  const [viewId, setViewId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");

  /* ---------------- STORAGE ---------------- */

  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveries));
      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, { detail: { key: DELIVERY_KEY } })
      );
    } catch {
      console.error("Unable to save deliveries.");
    }
  }, [deliveries]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTION_KEY, JSON.stringify(selections));
      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, { detail: { key: SELECTION_KEY } })
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

  /* ---------------- HELPERS ---------------- */

  const updateDelivery = (key, value) => {
    setDeliveryForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const updateSelection = (key, value) => {
    setSelectionForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const closeForm = () => {
    playSound("click");
    setFormType(null);
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    playSound("open");
    setEditingId(null);
    setError("");
    setViewType(null);

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
    setDeliveryForm({ ...createEmptyDelivery(), ...item });
    setEditingId(item.id);
    setViewType(null);
    setError("");
    setFormType("delivery");
  };

  const openEditSelection = (item) => {
    playSound("open");
    setSelectionForm({ ...createEmptySelection(), ...item });
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

  /* ---------------- DELIVERY ACTIONS ---------------- */

  const saveDelivery = (event) => {
    event.preventDefault();

    const customer = String(deliveryForm.customer || "").trim();
    const phone = String(deliveryForm.phone || "").trim();
    const quantity = Number(deliveryForm.quantity);

    const fail = (message) => {
      setError(message);
      playSound("error");
    };

    if (!customer) return fail("Please enter customer name.");

    if (phone && !/^\d{10}$/.test(phone)) {
      return fail("Enter a valid 10-digit phone number.");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return fail("Quantity must be at least 1.");
    }

    if (deliveryForm.status === "Delivered" && !deliveryForm.deliveredDate) {
      return fail("Please select actual delivery date.");
    }

    if (
      ["Courier", "Home Delivery"].includes(deliveryForm.deliveryMethod) &&
      !String(deliveryForm.address || "").trim()
    ) {
      return fail("Please enter delivery address.");
    }

    const record = {
      ...deliveryForm,
      id: editingId || createId("DEL"),
      customer,
      phone,
      quantity,
      assignedTo: deliveryForm.assignedTo || "Not Assigned",
    };

    setDeliveries((previous) =>
      editingId
        ? previous.map((item) => item.id === editingId ? record : item)
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

    if (!window.confirm("Delete this delivery record?")) return;

    setDeliveries((previous) => previous.filter((item) => item.id !== id));

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

    const customer = String(selectionForm.customer || "").trim();
    const phone = String(selectionForm.phone || "").trim();

    const photoCount = Number(selectionForm.photoCount || 0);
    const selectedCount = Number(selectionForm.selectedCount || 0);

    const fail = (message) => {
      setError(message);
      playSound("error");
    };

    if (!customer) return fail("Please enter customer name.");

    if (phone && !/^\d{10}$/.test(phone)) {
      return fail("Enter a valid 10-digit phone number.");
    }

    if (!selectionForm.givenDate) {
      return fail("Please select the photos given date.");
    }

    if (!selectionForm.dueDate) {
      return fail("Please select the expected return date.");
    }

    if (selectionForm.dueDate < selectionForm.givenDate) {
      return fail("Expected return date cannot be before given date.");
    }

    if (selectionForm.returnedDate && selectionForm.returnedDate < selectionForm.givenDate) {
      return fail("Actual return date cannot be before given date.");
    }

    if (
      !Number.isInteger(photoCount) ||
      !Number.isInteger(selectedCount) ||
      photoCount < 0 ||
      selectedCount < 0
    ) {
      return fail("Photo counts must be valid whole numbers.");
    }

    if (selectedCount > photoCount) {
      return fail("Selected photos cannot exceed shared photos.");
    }

    const record = {
      ...selectionForm,
      id: editingId || createId("SEL"),
      customer,
      phone,
      photoCount,
      selectedCount,
      assignedTo: selectionForm.assignedTo || "Not Assigned",
    };

    setSelections((previous) =>
      editingId
        ? previous.map((item) => item.id === editingId ? record : item)
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

    if (!confirmed) return;

    setSelections((previous) =>
      previous.map((selection) =>
        selection.id === item.id
          ? { ...selection, returnedDate: todayKey() }
          : selection
      )
    );

    playSound("success");
  };

  const deleteSelection = (id) => {
    playSound("click");

    if (!window.confirm("Delete this photo selection record?")) return;

    setSelections((previous) => previous.filter((item) => item.id !== id));

    if (viewId === id) setViewType(null);
    playSound("delete");
  };

  /* ---------------- FILTERS ---------------- */

  const filteredDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return deliveries.filter((item) => {
      const match = [
        item.id, item.deliveryId, item.customer, item.phone,
        item.event, item.item, item.trackingNumber,
        item.assignedTo, item.courier, item.deliveryMethod,
        item.address,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      return match && (filter === "All" || item.status === filter);
    });
  }, [deliveries, search, filter]);

  const filteredSelections = useMemo(() => {
    const query = search.trim().toLowerCase();

    return selections.filter((item) => {
      const match = [
        item.id, item.customer, item.phone, item.project,
        item.method, item.assignedTo, item.notes,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );

      return match &&
        (filter === "All" || getSelectionStatus(item) === filter);
    });
  }, [selections, search, filter]);

  /* ---------------- STATS ---------------- */

  const selectionStats = useMemo(() => ({
    total: selections.length,
    pending: selections.filter((item) => getSelectionStatus(item) === "Pending").length,
    overdue: selections.filter((item) => getSelectionStatus(item) === "Overdue").length,
    returned: selections.filter((item) => getSelectionStatus(item) === "Returned").length,
  }), [selections]);

  const deliveryStats = useMemo(() => ({
    total: deliveries.length,
    pending: deliveries.filter((item) =>
      ["Pending", "Packed"].includes(item.status)
    ).length,
    dispatched: deliveries.filter((item) => item.status === "Dispatched").length,
    delivered: deliveries.filter((item) => item.status === "Delivered").length,
  }), [deliveries]);

  const overdueSelections = useMemo(
    () => selections
      .filter((item) => getSelectionStatus(item) === "Overdue")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [selections]
  );

  const selectedView = viewType === "selection"
    ? selections.find((item) => item.id === viewId)
    : deliveries.find((item) => item.id === viewId);

  /* ---------------- CSV EXPORT ---------------- */

  const exportCSV = () => {
    const isSelection = activeTab === "selection";

    const columns = isSelection
      ? [
          "id", "customer", "phone", "project",
          "givenDate", "dueDate", "returnedDate",
          "photoCount", "selectedCount", "method",
          "assignedTo", "notes",
        ]
      : [
          "id", "customer", "phone", "event", "item",
          "quantity", "deliveryMethod", "address", "courier",
          "trackingNumber", "expectedDate", "deliveredDate",
          "assignedTo", "paymentStatus", "status", "notes",
        ];

    const records = isSelection
      ? filteredSelections.map((item) => ({
          ...item,
          status: getSelectionStatus(item),
        }))
      : filteredDeliveries;

    if (isSelection) columns.push("status");

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      const safe = /^\s*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };

    const rows = [
      columns.map(escapeCSV).join(","),
      ...records.map((item) =>
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
  const filtered = isSelection ? filteredSelections : filteredDeliveries;
  const total = isSelection ? selections.length : deliveries.length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="sr-delivery-page min-h-screen w-full min-w-0 overflow-x-hidden px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
      <style>{themeCSS}</style>

      {/* PREMIUM HEADER */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            {/* <span className="sd-label text-[11px] font-bold uppercase tracking-[.2em]">
              Studio Raw / Operations
            </span> */}
            {/* <Sparkles size={14} className="text-violet-500" /> */}
          </div>

          {/* <h1 className="sd-title text-2xl font-black tracking-tight sm:text-3xl">
            Delivery & Photo Selection
          </h1> */}

          {/* <p className="sd-muted mt-2 text-xs leading-6 sm:text-sm">
            Manage client photo selections, follow-ups and final deliveries.
          </p> */}
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            {isSelection ? "New Photo Selection" : "New Delivery"}
          </button>
        </div>
      </div>

      {/* PREMIUM HERO */}

      <div className="sd-hero relative mb-6 overflow-hidden rounded-[26px] p-5 shadow-xl sm:p-7 lg:p-8">
        <div className="sd-hero-pattern absolute inset-0 opacity-40" />

        <div className="sd-glow absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="sd-glow absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white/90">
              <Sparkles size={13} />
              SMART STUDIO WORKFLOW
            </div>

            <h2 className="text-xl font-black leading-tight sm:text-2xl lg:text-3xl">
              Every photo. Every promise.
              <span className="block text-blue-200">Perfectly tracked.</span>
            </h2>

            <p className="mt-3 max-w-lg text-xs leading-6 text-blue-100/85 sm:text-sm">
              Track when photos were shared, monitor customer selection
              deadlines and manage deliveries from one beautiful workspace.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold">
                <Activity size={12} className="mr-1 inline" />
                Live Status
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold">
                <CalendarClock size={12} className="mr-1 inline" />
                Auto Overdue
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold">
                <CheckCircle2 size={12} className="mr-1 inline" />
                Return Tracking
              </span>
            </div>
          </div>

          <div className="sd-float hidden h-28 w-28 shrink-0 items-center justify-center rounded-[30px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg sm:flex lg:h-36 lg:w-36">
            <Images size={64} strokeWidth={1.2} className="text-white" />
          </div>
        </div>
      </div>

      {/* TABS */}

      <div className="sd-surface mb-6 flex flex-wrap gap-2 rounded-[20px] border p-2 shadow-sm">
        <button
          type="button"
          onClick={() => switchTab("selection")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold transition-all sm:flex-none sm:px-6 sm:text-sm ${
            isSelection ? "sd-tab-active" : "sd-label hover:bg-slate-100/50"
          }`}
        >
          <Images size={17} />
          Photo Selection
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${
            isSelection ? "bg-white/20" : "bg-slate-100 text-slate-600"
          }`}>
            {selections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("delivery")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold transition-all sm:flex-none sm:px-6 sm:text-sm ${
            !isSelection ? "sd-tab-active" : "sd-label hover:bg-slate-100/50"
          }`}
        >
          <Truck size={17} />
          Deliveries
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${
            !isSelection ? "bg-white/20" : "bg-slate-100 text-slate-600"
          }`}>
            {deliveries.length}
          </span>
        </button>
      </div>

      {/* STATISTICS */}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {isSelection ? (
          <>
            <StatCard title="Photos Given" value={selectionStats.total} icon={Images} tone="blue" detail="Total selection records" />
            <StatCard title="Awaiting Return" value={selectionStats.pending} icon={Clock3} tone="amber" detail="Within return deadline" />
            <StatCard title="Overdue Selections" value={selectionStats.overdue} icon={BellRing} tone="red" detail="Customer follow-up needed" />
            <StatCard title="Photos Returned" value={selectionStats.returned} icon={CheckCircle2} tone="green" detail="Completed selections" />
          </>
        ) : (
          <>
            <StatCard title="Total Deliveries" value={deliveryStats.total} icon={Package} tone="blue" />
            <StatCard title="Pending Deliveries" value={deliveryStats.pending} icon={Clock3} tone="amber" />
            <StatCard title="Dispatched" value={deliveryStats.dispatched} icon={Truck} tone="purple" />
            <StatCard title="Delivered" value={deliveryStats.delivered} icon={CheckCircle2} tone="green" />
          </>
        )}
      </div>

      {/* SMART OVERDUE INSIGHTS */}

      {isSelection && overdueSelections.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-[22px] border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-600">
                <BellRing size={20} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-rose-900 sm:text-base">
                    Smart Follow-up Alert
                  </h3>
                  <span className="rounded-full bg-rose-200 px-2.5 py-1 text-[10px] font-bold text-rose-800">
                    {overdueSelections.length} Overdue
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-rose-800">
                  These customers have not returned their photo selections
                  within the expected date.
                </p>
              </div>
            </div>
            <Sparkles size={20} className="hidden text-rose-400 sm:block" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {overdueSelections.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openView("selection", item)}
                className="flex items-center gap-2 rounded-xl border border-rose-200 bg-white/80 px-3 py-2 text-xs font-semibold text-rose-800 transition hover:bg-white"
              >
                <UserRound size={13} />
                {item.customer}
                <span className="text-rose-500">
                  {daysBetween(item.dueDate, todayKey())}d late
                </span>
                <ArrowUpRight size={13} />
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
                {isSelection ? <Images size={21} /> : <ClipboardList size={21} />}
                {isSelection ? "Photo Selection Records" : "Delivery Records"}
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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={isSelection ? "Search photo selections..." : "Search deliveries..."}
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="flex w-full items-center gap-2 sm:w-52">
                <Filter size={17} className="sd-label shrink-0" />
                <CustomDropdown
                  value={filter}
                  options={isSelection
                    ? ["All", "Pending", "Overdue", "Returned"]
                    : ["All", ...DELIVERY_STATUSES]}
                  onChange={setFilter}
                  playSound={playSound}
                />
              </div>
            </div>
          </div>
        </div>

        {statusError && (
          <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle size={17} className="shrink-0" />
            <span className="flex-1">{statusError}</span>
            <button type="button" onClick={() => setStatusError("")}>
              <X size={15} />
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="sd-icon rounded-3xl p-5">
              {isSelection ? <Images size={35} /> : <Truck size={35} />}
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
                    onView={(record) => openView("selection", record)}
                    onEdit={openEditSelection}
                    onDelete={deleteSelection}
                    onReturn={markReturned}
                  />
                ))
              : filteredDeliveries.map((item) => {
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
                      onView={(record) => openView("delivery", record)}
                      onEdit={openEditDelivery}
                      onDelete={deleteDelivery}
                      onStatusChange={updateDeliveryStatus}
                      playSound={playSound}
                    />
                  );
                })}
          </div>
        )}

        <div className="sd-divider sd-muted flex flex-col gap-2 border-t px-4 py-4 text-xs sm:flex-row sm:justify-between sm:px-6">
          <span>Showing {filtered.length} of {total} records</span>
          <span>Studio Raw Picturez ERP</span>
        </div>
      </section>

      {/* =====================================================
         PHOTO SELECTION FORM
      ===================================================== */}

      {formType === "selection" && (
        <ModalShell
          title={editingId ? "Edit Photo Selection" : "New Photo Selection"}
          description="Track photos shared with customers and their return dates"
          icon={Images}
          onClose={closeForm}
          onSubmit={saveSelection}
          submitLabel={editingId ? "Update Selection" : "Save Photo Selection"}
        >
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-4">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="shrink-0 text-indigo-600" />
              <div>
                <p className="text-sm font-bold text-indigo-900">
                  Smart Photo Selection Tracking
                </p>
                <p className="mt-1 text-xs leading-5 text-indigo-700">
                  Enter when the customer received photos and when they
                  should return their selection. Overdue status is
                  calculated automatically.
                </p>
              </div>
            </div>
          </div>

          <section>
            <SectionHeading
              icon={UserRound}
              title="Customer Information"
              subtitle="Customer and photography project details"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Customer Name" required>
                <input
                  required
                  type="text"
                  value={selectionForm.customer}
                  onChange={(event) => updateSelection("customer", event.target.value)}
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
                    updateSelection("phone", event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10-digit phone number"
                  className={inputClass}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Photography Package">
                  <CustomDropdown
                    value={selectionForm.project}
                    options={EVENTS}
                    onChange={(value) => updateSelection("project", value)}
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
                  onChange={(event) => updateSelection("givenDate", event.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Expected Return Date" required>
                <input
                  required
                  type="date"
                  min={selectionForm.givenDate || undefined}
                  value={selectionForm.dueDate}
                  onChange={(event) => updateSelection("dueDate", event.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Actual Return Date">
                <input
                  type="date"
                  min={selectionForm.givenDate || undefined}
                  value={selectionForm.returnedDate}
                  onChange={(event) => updateSelection("returnedDate", event.target.value)}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="sd-soft mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4">
              <div>
                <p className="sd-muted text-[11px] font-semibold">
                  Automatic Selection Status
                </p>
                <p className="sd-title mt-1 text-xs font-medium">
                  Calculated from the entered dates
                </p>
              </div>
              <StatusBadge value={getSelectionStatus(selectionForm)} />
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
                  onChange={(event) => updateSelection("photoCount", event.target.value)}
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
                  onChange={(event) => updateSelection("selectedCount", event.target.value)}
                  placeholder="e.g. 150"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Photos Shared Through">
                <CustomDropdown
                  value={selectionForm.method}
                  options={SELECTION_METHODS}
                  onChange={(value) => updateSelection("method", value)}
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Assigned Staff">
                <CustomDropdown
                  value={selectionForm.assignedTo}
                  options={STAFF}
                  onChange={(value) => updateSelection("assignedTo", value)}
                  playSound={playSound}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Selection Notes">
                  <textarea
                    rows={3}
                    value={selectionForm.notes}
                    onChange={(event) => updateSelection("notes", event.target.value)}
                    placeholder="Customer follow-up, selected album photos, special instructions..."
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}
        </ModalShell>
      )}

      {/* =====================================================
         DELIVERY FORM
      ===================================================== */}

      {formType === "delivery" && (
        <ModalShell
          title={editingId ? "Edit Delivery" : "New Delivery"}
          description="Enter customer and delivery information"
          icon={Truck}
          onClose={closeForm}
          onSubmit={saveDelivery}
          submitLabel={editingId ? "Update Delivery" : "Save Delivery"}
        >
          <section>
            <SectionHeading icon={UserRound} title="Customer Information" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Customer Name" required>
                <input
                  required
                  type="text"
                  value={deliveryForm.customer}
                  onChange={(event) => updateDelivery("customer", event.target.value)}
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
                    updateDelivery("phone", event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10-digit phone number"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Event Type">
                <CustomDropdown
                  value={deliveryForm.event}
                  options={EVENTS}
                  onChange={(value) => updateDelivery("event", value)}
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Delivery Item">
                <CustomDropdown
                  value={deliveryForm.item}
                  options={DELIVERY_ITEMS}
                  onChange={(value) => updateDelivery("item", value)}
                  playSound={playSound}
                />
              </FormField>
            </div>
          </section>

          <section>
            <SectionHeading icon={Truck} title="Delivery Information" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Delivery Method">
                <CustomDropdown
                  value={deliveryForm.deliveryMethod}
                  options={DELIVERY_METHODS}
                  onChange={(value) => updateDelivery("deliveryMethod", value)}
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
                  onChange={(event) => updateDelivery("quantity", event.target.value)}
                  className={inputClass}
                />
              </FormField>

              {["Courier", "Home Delivery"].includes(deliveryForm.deliveryMethod) && (
                <div className="sm:col-span-2">
                  <FormField label="Delivery Address" required>
                    <textarea
                      required
                      rows={3}
                      value={deliveryForm.address}
                      onChange={(event) => updateDelivery("address", event.target.value)}
                      placeholder="Enter delivery address"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              )}

              {deliveryForm.deliveryMethod === "Courier" && (
                <>
                  <FormField label="Courier Company">
                    <CustomDropdown
                      value={deliveryForm.courier}
                      options={COURIERS}
                      onChange={(value) => updateDelivery("courier", value)}
                      playSound={playSound}
                    />
                  </FormField>

                  <FormField label="Tracking Number">
                    <input
                      type="text"
                      value={deliveryForm.trackingNumber}
                      onChange={(event) => updateDelivery("trackingNumber", event.target.value)}
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
                  onChange={(event) => updateDelivery("expectedDate", event.target.value)}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Actual Delivery Date">
                <input
                  type="date"
                  value={deliveryForm.deliveredDate}
                  onChange={(event) => updateDelivery("deliveredDate", event.target.value)}
                  className={inputClass}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Assigned Staff">
                  <CustomDropdown
                    value={deliveryForm.assignedTo}
                    options={STAFF}
                    onChange={(value) => updateDelivery("assignedTo", value)}
                    playSound={playSound}
                  />
                </FormField>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading icon={CreditCard} title="Payment & Status" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Payment Status">
                <CustomDropdown
                  value={deliveryForm.paymentStatus}
                  options={PAYMENT_STATUSES}
                  onChange={(value) => updateDelivery("paymentStatus", value)}
                  playSound={playSound}
                />
              </FormField>

              <FormField label="Delivery Status">
                <CustomDropdown
                  value={deliveryForm.status}
                  options={DELIVERY_STATUSES}
                  onChange={(value) => updateDelivery("status", value)}
                  playSound={playSound}
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Delivery Notes">
                  <textarea
                    rows={3}
                    value={deliveryForm.notes}
                    onChange={(event) => updateDelivery("notes", event.target.value)}
                    placeholder="Enter special instructions..."
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}
        </ModalShell>
      )}

      {/* =====================================================
         PHOTO SELECTION DETAILS
      ===================================================== */}

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
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-indigo-600">
                  Photo Selection Status
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-indigo-950">
                  {selectedView.customer}
                </h3>
              </div>
              <StatusBadge value={getSelectionStatus(selectedView)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Customer" value={selectedView.customer} icon={UserRound} />
            <InfoBox label="Phone" value={selectedView.phone} icon={Phone} />
            <div className="col-span-2">
              <InfoBox label="Photography Package" value={selectedView.project} icon={Camera} />
            </div>
            <InfoBox label="Photos Given Date" value={formatDate(selectedView.givenDate)} icon={CalendarDays} />
            <InfoBox label="Expected Return Date" value={formatDate(selectedView.dueDate)} icon={CalendarClock} />
            <InfoBox label="Actual Return Date" value={formatDate(selectedView.returnedDate)} icon={CheckCircle2} />
            <InfoBox label="Sharing Method" value={selectedView.method} icon={Images} />
            <InfoBox label="Total Photos Shared" value={selectedView.photoCount} icon={ImageIcon} />
            <InfoBox label="Photos Selected" value={selectedView.selectedCount} icon={Check} />
            <div className="col-span-2">
              <InfoBox label="Assigned Staff" value={selectedView.assignedTo} icon={UserRound} />
            </div>
            {selectedView.notes && (
              <div className="col-span-2">
                <InfoBox label="Notes" value={selectedView.notes} icon={FileText} />
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {getSelectionStatus(selectedView) !== "Returned" && (
              <button
                type="button"
                onClick={() => {
                  markReturned(selectedView);
                  setViewType(null);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 size={17} />
                Mark Returned
              </button>
            )}

            <button
              type="button"
              onClick={() => openEditSelection(selectedView)}
              className="sd-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              <Pencil size={16} />
              Edit Selection
            </button>
          </div>
        </ModalShell>
      )}

      {/* =====================================================
         DELIVERY DETAILS
      ===================================================== */}

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
            <span className="sd-label text-sm font-semibold">Delivery Status</span>
            <StatusBadge value={selectedView.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Customer" value={selectedView.customer} icon={UserRound} />
            <InfoBox label="Phone" value={selectedView.phone} icon={Phone} />
            <InfoBox label="Event" value={selectedView.event} icon={Camera} />
            <InfoBox label="Delivery Item" value={selectedView.item} icon={Package} />
            <InfoBox label="Quantity" value={selectedView.quantity} icon={Box} />
            <InfoBox label="Delivery Method" value={selectedView.deliveryMethod} icon={Truck} />
            <InfoBox label="Expected Date" value={formatDate(selectedView.expectedDate)} icon={CalendarDays} />
            <InfoBox label="Actual Date" value={formatDate(selectedView.deliveredDate)} icon={CheckCircle2} />
            <InfoBox label="Assigned Staff" value={selectedView.assignedTo} icon={UserRound} />
            <InfoBox label="Payment Status" icon={CreditCard}>
              <StatusBadge value={selectedView.paymentStatus} payment />
            </InfoBox>

            {selectedView.address && (
              <div className="col-span-2">
                <InfoBox label="Delivery Address" value={selectedView.address} icon={MapPin} />
              </div>
            )}

            {selectedView.courier && (
              <InfoBox label="Courier" value={selectedView.courier} icon={Building2} />
            )}

            {selectedView.trackingNumber && (
              <InfoBox label="Tracking Number" value={selectedView.trackingNumber} icon={Hash} />
            )}

            {selectedView.notes && (
              <div className="col-span-2">
                <InfoBox label="Notes" value={selectedView.notes} icon={FileText} />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => openEditDelivery(selectedView)}
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
