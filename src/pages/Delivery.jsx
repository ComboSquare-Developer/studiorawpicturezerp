import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  CalendarDays,
  UserRound,
  Save,
  Phone,
  Download,
  ChevronDown,
  AlertCircle,
  ClipboardList,
  Eye,
  Hash,
  FileText,
  Filter,
  Images,
  Sparkles,
  CalendarClock,
  Image as ImageIcon,
  Camera,
  BellRing,
  CircleCheck,
  Video,
  Film,
} from "lucide-react";

const PHOTO_SELECTION_KEY = "studioraw_photo_selections";
const VIDEO_SELECTION_KEY = "studioraw_video_selections";
const CUSTOMER_KEY = "studio_raw_customers";
const BOOKING_KEY = "studioraw_bookings";
const UPDATE_EVENT = "studioraw:data-updated";
const SOUND_KEY = "studioraw_delivery_sounds";

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

const SELECTION_STATUSES = ["Pending", "In Progress", "Returned"];
const SELECTION_METHODS = [
  "Google Drive",
  "WhatsApp",
  "USB Drive",
  "Online Gallery",
  "Studio Visit",
  "Other",
];
const STAFF = [
  "Vignesh Sundaram",
  "Santhosh Kumar",
  "Priya Natarajan",
  "Not Assigned",
];

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#d6e7fa] bg-[#f9fcff] px-3.5 py-3 text-sm text-[#102b53] outline-none transition focus:border-[#8dbcf3] focus:ring-[3px] focus:ring-[#e4f1ff]";

function readRecords(key, fallbackKey) {
  try {
    const raw =
      localStorage.getItem(key) ??
      (fallbackKey ? localStorage.getItem(fallbackKey) : null);
    if (raw == null) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    for (const field of [
      "data",
      "records",
      "items",
      "list",
      "customers",
      "bookings",
      "selections",
    ]) {
      if (Array.isArray(data?.[field])) return data[field];
    }
  } catch (error) {
    console.error(`Cannot read ${key}`, error);
  }
  return [];
}

function readSaved(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const phoneOf = (c) =>
  String(c?.phone ?? c?.mobile ?? c?.contactNumber ?? "")
    .replace(/\D/g, "")
    .slice(-10);
const nameOf = (c) =>
  String(c?.name ?? c?.customerName ?? c?.customer ?? "").trim();
const emailOf = (c) => String(c?.email ?? "").trim();

function dateOffset(days = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

const todayKey = () => dateOffset(0);

function formatDate(value) {
  if (!value) return "Not recorded";
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.round(
    (new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000
  );
}

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Normalize selection status safely into: "Pending" | "In Progress" | "Returned".
 */
function normalizeSelectionStatus(record) {
  const raw = String(record?.status || "").trim().toLowerCase();
  if (raw === "returned" || raw === "completed" || Boolean(record?.returnedDate)) {
    return "Returned";
  }
  if (raw === "in progress" || raw === "in_progress" || raw === "in-progress") {
    return "In Progress";
  }
  return "Pending";
}

function isSelectionOverdue(record) {
  const st = normalizeSelectionStatus(record);
  if (st === "Returned") return false;
  return Boolean(record?.dueDate && record.dueDate < todayKey());
}

/**
 * Progress rules:
 * - Pending: 0% by default
 * - In Progress: actual selected / shared percentage when available (clamped 1..99)
 * - Returned: 100% only after customer has submitted the selection
 */
function getSelectionProgress(record, kind = "photo") {
  const st = normalizeSelectionStatus(record);
  if (st === "Returned") return 100;
  if (st === "Pending") return 0;

  const total =
    kind === "video"
      ? Number(record?.videoCount || 0)
      : Number(record?.photoCount || 0);
  const selected = Number(record?.selectedCount || 0);

  if (total > 0 && selected > 0) {
    return Math.min(99, Math.max(1, Math.round((selected / total) * 100)));
  }
  return 25;
}

function getSelectionStatusTheme(status) {
  if (status === "Returned") {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      topBar: "bg-emerald-500",
      bar: "bg-emerald-500",
    };
  }
  if (status === "In Progress") {
    return {
      badge: "border-blue-200 bg-blue-50 text-blue-700",
      topBar: "bg-blue-500",
      bar: "bg-blue-500",
    };
  }
  return {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    topBar: "bg-amber-400",
    bar: "bg-amber-400",
  };
}

const emptyPhotoSelection = () => ({
  customerId: "",
  bookingId: "",
  customer: "",
  phone: "",
  email: "",
  project: EVENTS[0],
  eventDate: "",
  givenDate: todayKey(),
  dueDate: dateOffset(7),
  returnedDate: "",
  photoCount: "",
  selectedCount: "",
  method: "Google Drive",
  assignedTo: "Not Assigned",
  status: "Pending",
  notes: "",
});

const emptyVideoSelection = () => ({
  customerId: "",
  bookingId: "",
  customer: "",
  phone: "",
  email: "",
  project: "Wedding Videography",
  eventDate: "",
  givenDate: todayKey(),
  dueDate: dateOffset(7),
  returnedDate: "",
  videoCount: "",
  selectedCount: "",
  method: "Google Drive",
  assignedTo: "Not Assigned",
  status: "Pending",
  notes: "",
  requirements: "",
});

function useSounds() {
  const ctx = useRef(null);
  useEffect(
    () => () => {
      if (ctx.current && ctx.current.state !== "closed") {
        ctx.current.close().catch(() => {});
      }
    },
    []
  );
  return (kind = "click") => {
    try {
      if (localStorage.getItem(SOUND_KEY) === "false") return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx.current || ctx.current.state === "closed") ctx.current = new AC();
      if (ctx.current.state === "suspended") ctx.current.resume().catch(() => {});
      const freqs = {
        click: [600],
        open: [520, 720],
        success: [520, 660, 880],
        delete: [460, 310],
        error: [240, 200],
      };
      (freqs[kind] || freqs.click).forEach((f, i) => {
        const c = ctx.current;
        const o = c.createOscillator();
        const g = c.createGain();
        const t = c.currentTime + i * 0.095;
        const duration = kind === "success" ? 0.13 : 0.09;
        o.type = "sine";
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.04, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        o.connect(g);
        g.connect(c.destination);
        o.start(t);
        o.stop(t + duration + 0.01);
      });
    } catch {}
  };
}

function Count({ value }) {
  const [n, setN] = useState(0);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      setN(value);
      return;
    }
    let id;
    let start;
    const run = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 1300, 1);
      setN(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) id = requestAnimationFrame(run);
    };
    id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [value, replay]);
  return <span onClick={() => setReplay((x) => x + 1)}>{n.toLocaleString("en-IN")}</span>;
}

function StatusBadge({ value }) {
  const theme = getSelectionStatusTheme(value);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${theme.badge}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value || "Pending"}
    </span>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-[#385d89]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3 border-b border-[#d6e7fa] pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e0efff] text-[#24558d]">
          <Icon size={19} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#102b53]">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-xs text-[#748eae]">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Info({ label, value, icon: Icon, children }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#d6e7fa] bg-[#edf5ff] p-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] text-[#748eae]">
        {Icon && <Icon size={12} />} {label}
      </p>
      {children || (
        <p className="break-words text-xs font-bold leading-5 text-[#102b53]">
          {value === 0 ? 0 : value || "—"}
        </p>
      )}
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
  placeholder = "Select option",
  disabled = false,
}) {
  return (
    <div className="relative">
      <select
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-9 disabled:cursor-not-allowed disabled:bg-[#edf5ff]`}
      >
        <option value="">{placeholder}</option>
        {value && !options.includes(value) && (
          <option value={value}>{value}</option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#748eae]"
      />
    </div>
  );
}

function Modal({
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152b]/70 p-2 backdrop-blur-[4px] sm:p-5">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[96dvh] w-full min-w-0 ${maxWidth} flex-col overflow-hidden rounded-[22px] border border-[#d6e7fa] bg-white shadow-2xl sm:max-h-[93dvh] sm:rounded-[28px]`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#d6e7fa] bg-gradient-to-r from-[#f5faff] to-[#e5f2ff] px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#173b70] text-white">
              <Icon size={21} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#102b53] sm:text-xl">
                {title}
              </h2>
              <p className="mt-1 text-xs text-[#748eae]">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#d6e7fa] bg-white p-2 text-[#102b53]"
          >
            <X size={19} />
          </button>
        </div>

        {onSubmit ? (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
              {children}
            </div>
            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#d6e7fa] px-4 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#d6e7fa] px-6 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#173b70] px-6 py-3 text-sm font-semibold text-white hover:bg-[#24548f]"
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
            <div className="flex justify-end border-t border-[#d6e7fa] px-4 py-4 sm:px-7">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#173b70] px-6 py-3 text-sm font-semibold text-white"
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

function Stat({ title, value, icon: Icon, tone = "blue", detail }) {
  const tones = {
    blue: "from-white via-[#edf6ff] to-[#dcecff] border-[#cfe2ff]",
    amber: "from-white via-[#fffbeb] to-[#fef3c7]/60 border-amber-200",
    red: "from-white via-[#fff1f2] to-[#ffe4e6]/70 border-rose-200",
    green: "from-white via-[#ecfdf5] to-[#d1fae5]/60 border-emerald-200",
  };
  return (
    <div
      className={`group rounded-[22px] border bg-gradient-to-br p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-5 ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-[#587298]">{title}</p>
          <h3 className="mt-3 text-2xl font-black text-[#102b53] sm:text-3xl">
            <Count value={value} />
          </h3>
          {detail && <p className="mt-2 text-xs text-[#7188a8]">{detail}</p>}
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dbeafe] text-[#24558d] transition group-hover:scale-110">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function SelectionCard({
  item,
  kind = "photo",
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const status = normalizeSelectionStatus(item);
  const progress = getSelectionProgress(item, kind);
  const overdue = isSelectionOverdue(item);
  const returned = status === "Returned";
  const theme = getSelectionStatusTheme(status);
  const isVideo = kind === "video";
  const sharedCount = isVideo ? item.videoCount : item.photoCount;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#d6e7fa] bg-white shadow-sm transition hover:shadow-lg">
      <div className={`h-1.5 ${theme.topBar}`} />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-2xl bg-[#e0efff] p-3 text-[#24558d]">
              {isVideo ? <Video size={22} /> : <Images size={22} />}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-extrabold text-[#102b53]">
                {item.customer}
              </h3>
              <p className="mt-1 truncate text-[11px] text-[#748eae]">
                {item.customerId ? `${item.customerId} · ` : ""}
                {item.id}
              </p>
            </div>
          </div>
          <StatusBadge value={status} />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#587298]">
          <span className="font-semibold text-[#102b53]">{item.project}</span>
          {item.bookingId && (
            <span className="rounded-lg bg-[#edf5ff] px-2 py-0.5 text-[10px] font-bold text-[#24558d]">
              {item.bookingId}
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Info label="Given Date" value={formatDate(item.givenDate)} icon={CalendarDays} />
          <Info label="Return Due" value={formatDate(item.dueDate)} icon={CalendarClock} />
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-[11px] text-[#385d89]">
            <span>
              {returned
                ? "Selection completed"
                : status === "In Progress"
                ? "Selection in progress"
                : "Awaiting selection"}
            </span>
            <b>{progress}%</b>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e4effd]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${theme.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p
            className={`mt-2 text-[11px] font-semibold ${
              overdue
                ? "text-rose-600"
                : returned
                ? "text-emerald-600"
                : "text-[#748eae]"
            }`}
          >
            {returned
              ? `Returned on ${formatDate(item.returnedDate)}`
              : overdue
              ? `${daysBetween(item.dueDate, todayKey())} day(s) overdue`
              : `${Math.max(0, daysBetween(todayKey(), item.dueDate))} day(s) remaining`}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#d6e7fa] pt-4">
          <div>
            <p className="text-[10px] text-[#748eae]">
              {isVideo ? "Videos Shared" : "Photos Shared"}
            </p>
            <b className="text-sm text-[#102b53]">
              {Number(sharedCount || 0).toLocaleString("en-IN")}
            </b>
          </div>
          <div>
            <p className="text-[10px] text-[#748eae]">
              {isVideo ? "Videos Selected" : "Photos Selected"}
            </p>
            <b className="text-sm text-[#102b53]">
              {Number(item.selectedCount || 0).toLocaleString("en-IN")}
            </b>
          </div>
        </div>

        <div className="mt-4 border-t border-[#d6e7fa] pt-3">
          <label className="mb-1.5 block text-[10px] font-semibold text-[#385d89]">
            Selection Status
          </label>
          <Select
            value={status}
            options={SELECTION_STATUSES}
            onChange={(nextStatus) => onStatusChange(item, nextStatus)}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#d6e7fa] pt-3">
          {!returned && (
            <button
              type="button"
              onClick={() => onStatusChange(item, "Returned")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              <CircleCheck size={15} />
              Mark Returned
            </button>
          )}
          <button
            type="button"
            onClick={() => onView(item)}
            className="rounded-xl bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-100"
            title="View"
          >
            <Eye size={17} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-xl bg-amber-50 p-2.5 text-amber-700 hover:bg-amber-100"
            title="Edit"
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-xl bg-rose-50 p-2.5 text-rose-600 hover:bg-rose-100"
            title="Delete"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function CustomerBookingFields({
  kind,
  form,
  bookings,
  updateField,
  chooseCustomer,
  chooseBooking,
  customerOptions,
  registeredCustomer,
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Field label="Customer" required={kind === "video"}>
          <select
            required={kind === "video"}
            value={form.customerId || ""}
            onChange={(e) => chooseCustomer(e.target.value, kind)}
            className={inputClass}
          >
            <option value="">
              {kind === "video"
                ? "-- Select Existing Customer --"
                : "-- Enter Manually / Select Existing Customer --"}
            </option>
            {customerOptions.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {nameOf(c)} {phoneOf(c) ? `· ${phoneOf(c)}` : ""} ({c.id})
              </option>
            ))}
          </select>
        </Field>
        {form.customerId && registeredCustomer(form.customerId) && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 size={14} />
            Connected to Customer: {form.customer} · Details auto-filled
          </p>
        )}
      </div>

      {kind === "photo" && (
        <>
          <Field label="Customer Name" required>
            <input
              required
              value={form.customer || ""}
              onChange={(e) => updateField("customer", e.target.value)}
              placeholder="Enter customer name"
              className={inputClass}
            />
          </Field>
          <Field label="Phone Number">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone || ""}
              onChange={(e) =>
                updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="10-digit phone number"
              className={inputClass}
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Email address"
              className={inputClass}
            />
          </Field>
        </>
      )}

      <Field label="Related Booking" required={kind === "video"}>
        <select
          required={kind === "video"}
          value={form.bookingId || ""}
          onChange={(e) => chooseBooking(e.target.value, kind)}
          className={inputClass}
        >
          <option value="">
            {bookings.length > 0
              ? "-- Choose Shoot / Booking --"
              : "-- No bookings found for selected customer --"}
          </option>
          {bookings.map((b) => (
            <option key={String(b.id)} value={String(b.id)}>
              {b.event || b.eventType || b.service || "Shoot"} (
              {b.date || b.eventDate || "Scheduled"}) · {b.id}
            </option>
          ))}
        </select>
      </Field>

      {form.eventDate && (
        <Field label="Event Date">
          <input
            readOnly
            value={formatDate(form.eventDate)}
            className={`${inputClass} bg-[#edf5ff]`}
          />
        </Field>
      )}

      <Field label="Service / Event" required>
        <Select
          value={form.project}
          options={EVENTS}
          onChange={(v) => updateField("project", v)}
        />
      </Field>
    </div>
  );
}

export default function Delivery() {
  const sound = useSounds();
  const [photoSelections, setPhotoSelections] = useState(() =>
    readSaved(PHOTO_SELECTION_KEY)
  );
  const [videoSelections, setVideoSelections] = useState(() =>
    readSaved(VIDEO_SELECTION_KEY)
  );
  const [customers, setCustomers] = useState(() =>
    readRecords(CUSTOMER_KEY, "studioraw_customers")
  );
  const [bookings, setBookings] = useState(() =>
    readRecords(BOOKING_KEY, "studio_raw_bookings")
  );

  const [activeTab, setActiveTab] = useState("photo");
  const [photoForm, setPhotoForm] = useState(emptyPhotoSelection);
  const [videoForm, setVideoForm] = useState(emptyVideoSelection);
  const [formType, setFormType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [viewType, setViewType] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const refresh = () => {
    setCustomers(readRecords(CUSTOMER_KEY, "studioraw_customers"));
    setBookings(readRecords(BOOKING_KEY, "studio_raw_bookings"));
  };

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener("storage", onChange);
    window.addEventListener(UPDATE_EVENT, onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(UPDATE_EVENT, onChange);
      window.removeEventListener("focus", onChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(PHOTO_SELECTION_KEY, JSON.stringify(photoSelections));
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT, { detail: { key: PHOTO_SELECTION_KEY } })
    );
  }, [photoSelections]);

  useEffect(() => {
    localStorage.setItem(VIDEO_SELECTION_KEY, JSON.stringify(videoSelections));
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT, { detail: { key: VIDEO_SELECTION_KEY } })
    );
  }, [videoSelections]);

  useEffect(() => {
    if (!formType && !viewType) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") {
        setFormType(null);
        setViewType(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", onKey);
    };
  }, [formType, viewType]);

  const customerOptions = useMemo(
    () => customers.filter((c) => c?.id != null && nameOf(c)),
    [customers]
  );

  const bookingMatches = (customerId, phone) =>
    bookings.filter(
      (b) =>
        (String(b.customerId || "") === String(customerId) && !!customerId) ||
        (phone && phoneOf(b) === phone)
    );

  const photoBookings = useMemo(
    () =>
      photoForm.customerId
        ? bookingMatches(photoForm.customerId, phoneOf(photoForm))
        : [],
    [bookings, photoForm.customerId, photoForm.phone]
  );

  const videoBookings = useMemo(
    () =>
      videoForm.customerId
        ? bookingMatches(videoForm.customerId, phoneOf(videoForm))
        : [],
    [bookings, videoForm.customerId, videoForm.phone]
  );

  const registeredCustomer = (id) =>
    customers.find((c) => String(c.id) === String(id));

  const chooseCustomer = (id, kind) => {
    const c = registeredCustomer(id);
    const setter = kind === "video" ? setVideoForm : setPhotoForm;
    if (!c) {
      setter((p) => ({
        ...p,
        customerId: "",
        bookingId: "",
        customer: "",
        phone: "",
        email: "",
        eventDate: "",
      }));
      setError("");
      return;
    }
    const phone = phoneOf(c);
    const matches = bookingMatches(String(c.id), phone);
    const b = matches.length === 1 ? matches[0] : null;
    setter((p) => ({
      ...p,
      customerId: String(c.id),
      customer: nameOf(c),
      phone,
      email: emailOf(c),
      bookingId: b ? String(b.id) : "",
      eventDate: b ? String(b.date || b.eventDate || "").slice(0, 10) : "",
      project: b
        ? b.event || b.eventType || b.service || p.project
        : p.project,
    }));
    setError("");
    sound("click");
  };

  const chooseBooking = (id, kind) => {
    const b = bookings.find((x) => String(x.id) === String(id));
    const setter = kind === "video" ? setVideoForm : setPhotoForm;
    setter((p) => ({
      ...p,
      bookingId: b ? String(b.id) : "",
      eventDate: b ? String(b.date || b.eventDate || "").slice(0, 10) : "",
      project: b
        ? b.event || b.eventType || b.service || p.project
        : p.project,
    }));
    sound("click");
  };

  const updatePhoto = (k, v) => {
    setPhotoForm((p) => {
      const next = { ...p, [k]: v };
      if (k === "status") {
        if (v === "Returned" && !next.returnedDate) {
          next.returnedDate = todayKey();
        } else if (v !== "Returned") {
          next.returnedDate = "";
        }
      }
      return next;
    });
    setError("");
  };

  const updateVideo = (k, v) => {
    setVideoForm((p) => {
      const next = { ...p, [k]: v };
      if (k === "status") {
        if (v === "Returned" && !next.returnedDate) {
          next.returnedDate = todayKey();
        } else if (v !== "Returned") {
          next.returnedDate = "";
        }
      }
      return next;
    });
    setError("");
  };

  const closeForm = () => {
    sound("click");
    setFormType(null);
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    sound("open");
    refresh();
    setEditingId(null);
    setViewType(null);
    setError("");
    if (activeTab === "photo") {
      setPhotoForm(emptyPhotoSelection());
      setFormType("photo");
    } else {
      setVideoForm(emptyVideoSelection());
      setFormType("video");
    }
  };

  const findExistingCustomer = (item) =>
    customers.find(
      (c) => item.customerId && String(c.id) === String(item.customerId)
    ) ||
    customers.find((c) => phoneOf(item) && phoneOf(c) === phoneOf(item)) ||
    customers.find(
      (c) =>
        nameOf(c).toLowerCase() ===
        String(item.customer || "").trim().toLowerCase()
    );

  const openEdit = (kind, item) => {
    sound("open");
    refresh();
    const c = findExistingCustomer(item);
    const base =
      kind === "video" ? emptyVideoSelection() : emptyPhotoSelection();
    const normalizedStatus = normalizeSelectionStatus(item);
    const data = {
      ...base,
      ...item,
      status: normalizedStatus,
      customerId: c ? String(c.id) : item.customerId || "",
      customer: c ? nameOf(c) : item.customer,
      phone: c ? phoneOf(c) : item.phone,
      email: c ? emailOf(c) : item.email || "",
    };
    if (kind === "video") setVideoForm(data);
    else setPhotoForm(data);
    setEditingId(item.id);
    setViewType(null);
    setError("");
    setFormType(kind);
  };

  const fail = (msg) => {
    setError(msg);
    sound("error");
  };

  const savePhotoSelection = (e) => {
    e.preventDefault();
    const c = registeredCustomer(photoForm.customerId);
    const customer = String(photoForm.customer || "").trim();
    const phone = phoneOf(photoForm.phone);
    if (!customer)
      return fail("Please enter customer name or select a registered customer.");
    const total = Number(photoForm.photoCount || 0);
    const selected = Number(photoForm.selectedCount || 0);
    if (!photoForm.givenDate || !photoForm.dueDate)
      return fail("Please select given date and return due date.");
    if (photoForm.dueDate < photoForm.givenDate)
      return fail("Return due date cannot be before given date.");
    if (
      photoForm.returnedDate &&
      photoForm.returnedDate < photoForm.givenDate
    )
      return fail("Actual return date cannot be before given date.");
    if (![total, selected].every((n) => Number.isInteger(n) && n >= 0))
      return fail("Photo counts must be valid whole numbers.");
    if (selected > total)
      return fail("Selected photos cannot exceed shared photos.");

    const finalStatus = photoForm.returnedDate
      ? "Returned"
      : SELECTION_STATUSES.includes(photoForm.status)
      ? photoForm.status
      : "Pending";

    const record = {
      ...photoForm,
      id: editingId || makeId("SEL"),
      customerId: c ? String(c.id) : photoForm.customerId || "",
      customer,
      phone,
      photoCount: total,
      selectedCount: selected,
      status: finalStatus,
      returnedDate:
        finalStatus === "Returned"
          ? photoForm.returnedDate || todayKey()
          : "",
      assignedTo: photoForm.assignedTo || "Not Assigned",
    };

    setPhotoSelections((p) =>
      editingId ? p.map((x) => (x.id === editingId ? record : x)) : [record, ...p]
    );
    sound("success");
    setFormType(null);
    setEditingId(null);
    setError("");
  };

  const saveVideoSelection = (e) => {
    e.preventDefault();
    const c = registeredCustomer(videoForm.customerId);
    if (!c) return fail("Please select a registered customer.");
    if (!videoForm.bookingId)
      return fail("Please select the customer's related booking.");
    if (!videoForm.project) return fail("Please select Service / Event.");
    if (!videoForm.givenDate || !videoForm.dueDate)
      return fail("Please select Given Date and Return Due Date.");
    if (videoForm.dueDate < videoForm.givenDate)
      return fail("Return Due Date cannot be before Given Date.");
    if (
      videoForm.returnedDate &&
      videoForm.returnedDate < videoForm.givenDate
    )
      return fail("Actual Return Date cannot be before Given Date.");

    const shared = Number(videoForm.videoCount);
    const selected = Number(videoForm.selectedCount || 0);
    if (!Number.isInteger(shared) || shared < 1)
      return fail("Number of Videos Shared must be at least 1.");
    if (!Number.isInteger(selected) || selected < 0)
      return fail("Number of Videos Selected must be a valid whole number.");
    if (selected > shared)
      return fail("Videos Selected cannot exceed Videos Shared.");

    const finalStatus = videoForm.returnedDate
      ? "Returned"
      : SELECTION_STATUSES.includes(videoForm.status)
      ? videoForm.status
      : "Pending";

    const record = {
      ...videoForm,
      id: editingId || makeId("VID"),
      customerId: String(c.id),
      customer: nameOf(c),
      phone: phoneOf(c),
      email: emailOf(c),
      videoCount: shared,
      selectedCount: selected,
      status: finalStatus,
      returnedDate:
        finalStatus === "Returned"
          ? videoForm.returnedDate || todayKey()
          : "",
      assignedTo: videoForm.assignedTo || "Not Assigned",
    };

    setVideoSelections((p) =>
      editingId ? p.map((x) => (x.id === editingId ? record : x)) : [record, ...p]
    );
    sound("success");
    setFormType(null);
    setEditingId(null);
    setError("");
  };

  const deleteRecord = (kind, id) => {
    sound("click");
    const label = kind === "video" ? "video selection" : "photo selection";
    if (!window.confirm(`Delete this ${label} record?`)) return;
    if (kind === "video") {
      setVideoSelections((p) => p.filter((x) => x.id !== id));
    } else {
      setPhotoSelections((p) => p.filter((x) => x.id !== id));
    }
    if (viewId === id) setViewType(null);
    sound("delete");
  };

  const handleStatusChange = (kind, item, nextStatus) => {
    if (!SELECTION_STATUSES.includes(nextStatus)) return;
    const setter = kind === "video" ? setVideoSelections : setPhotoSelections;
    setter((p) =>
      p.map((x) => {
        if (x.id !== item.id) return x;
        return {
          ...x,
          status: nextStatus,
          returnedDate:
            nextStatus === "Returned" ? x.returnedDate || todayKey() : "",
        };
      })
    );
    sound("success");
  };

  const isPhotoTab = activeTab === "photo";
  const currentList = isPhotoTab ? photoSelections : videoSelections;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return currentList.filter((x) => {
      const matchesSearch =
        !q ||
        [
          x.id,
          x.customerId,
          x.bookingId,
          x.customer,
          x.phone,
          x.project,
          x.method,
          x.assignedTo,
          x.notes,
          x.requirements,
        ].some((v) => String(v ?? "").toLowerCase().includes(q));
      if (!matchesSearch) return false;
      if (filter === "All") return true;
      if (filter === "Overdue") return isSelectionOverdue(x);
      return normalizeSelectionStatus(x) === filter;
    });
  }, [currentList, search, filter]);

  const photoStats = useMemo(
    () => ({
      total: photoSelections.length,
      pending: photoSelections.filter(
        (s) => normalizeSelectionStatus(s) === "Pending"
      ).length,
      overdue: photoSelections.filter(isSelectionOverdue).length,
      returned: photoSelections.filter(
        (s) => normalizeSelectionStatus(s) === "Returned"
      ).length,
    }),
    [photoSelections]
  );

  const videoStats = useMemo(
    () => ({
      total: videoSelections.length,
      pending: videoSelections.filter(
        (s) => normalizeSelectionStatus(s) === "Pending"
      ).length,
      overdue: videoSelections.filter(isSelectionOverdue).length,
      returned: videoSelections.filter(
        (s) => normalizeSelectionStatus(s) === "Returned"
      ).length,
    }),
    [videoSelections]
  );

  const overdueList = useMemo(
    () =>
      currentList
        .filter(isSelectionOverdue)
        .sort((a, b) =>
          String(a.dueDate || "").localeCompare(String(b.dueDate || ""))
        ),
    [currentList]
  );

  const selectedView =
    viewType === "photo"
      ? photoSelections.find((s) => s.id === viewId)
      : viewType === "video"
      ? videoSelections.find((s) => s.id === viewId)
      : null;

  const exportCSV = () => {
    const columns = isPhotoTab
      ? [
          "id",
          "customerId",
          "bookingId",
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
          "customerId",
          "bookingId",
          "customer",
          "phone",
          "project",
          "givenDate",
          "dueDate",
          "returnedDate",
          "videoCount",
          "selectedCount",
          "method",
          "assignedTo",
          "notes",
          "requirements",
          "status",
        ];

    const records = filtered.map((s) => ({
      ...s,
      status: normalizeSelectionStatus(s),
    }));

    const escape = (v) => {
      const str = String(v ?? "");
      const safe = /^\s*[=+\-@\t\r]/.test(str) ? `'${str}` : str;
      return `"${safe.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(escape).join(","),
      ...records.map((r) => columns.map((c) => escape(r[c])).join(",")),
    ].join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = isPhotoTab
      ? "studioraw_photo_selections.csv"
      : "studioraw_video_selections.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    sound("success");
  };

  const switchTab = (tab) => {
    sound("click");
    setActiveTab(tab);
    setSearch("");
    setFilter("All");
  };

  const activeStats = isPhotoTab ? photoStats : videoStats;

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-[#f9fcff] via-[#f0f7ff] to-[#e5f1ff] px-3 py-5 text-[#102b53] sm:px-5 sm:py-7 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#102b53] sm:text-3xl">
            {isPhotoTab ? "Photo Selection" : "Video Selection"}
          </h1>
          <p className="mt-1 text-xs text-[#587298] sm:text-sm">
            {isPhotoTab
              ? "Manage customer photo review and selection records."
              : "Manage customer video review and selection records."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d6e7fa] bg-white px-4 py-2.5 text-xs font-bold sm:flex-none sm:text-sm"
          >
            <Download size={17} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#173b70] px-4 py-2.5 text-xs font-bold text-white sm:flex-none sm:text-sm"
          >
            <Plus size={18} />
            {isPhotoTab ? "New Photo Selection" : "New Video Selection"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-[20px] border border-[#d6e7fa] bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => switchTab("photo")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold sm:flex-none sm:px-6 sm:text-sm ${
            isPhotoTab
              ? "bg-gradient-to-br from-[#173b70] to-[#3265a8] text-white"
              : "text-[#385d89] hover:bg-[#edf5ff]"
          }`}
        >
          <Images size={17} />
          Photo Selection{" "}
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
            {photoSelections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("video")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold sm:flex-none sm:px-6 sm:text-sm ${
            !isPhotoTab
              ? "bg-gradient-to-br from-[#173b70] to-[#3265a8] text-white"
              : "text-[#385d89] hover:bg-[#edf5ff]"
          }`}
        >
          <Video size={17} />
          Video Selection{" "}
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
            {videoSelections.length}
          </span>
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat
          title={isPhotoTab ? "Photos Given" : "Videos Given"}
          value={activeStats.total}
          icon={isPhotoTab ? Images : Video}
          detail={
            isPhotoTab
              ? "Total photo selection records"
              : "Total video selection records"
          }
        />
        <Stat
          title={isPhotoTab ? "Awaiting Return" : "Awaiting Selection"}
          value={activeStats.pending}
          icon={Clock3}
          tone="amber"
          detail="Selection pending"
        />
        <Stat
          title="Overdue Selections"
          value={activeStats.overdue}
          icon={BellRing}
          tone="red"
          detail="Past return deadline"
        />
        <Stat
          title={isPhotoTab ? "Photos Returned" : "Videos Selected"}
          value={activeStats.returned}
          icon={CheckCircle2}
          tone="green"
          detail="Completed selections"
        />
      </div>

      {/* SMART FOLLOW-UP ALERT */}
      {overdueList.length > 0 && (
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
                {overdueList.length} customers have not returned their{" "}
                {isPhotoTab ? "photo" : "video"} selections within the expected
                date.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {overdueList.slice(0, 5).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  sound("open");
                  setViewType(activeTab);
                  setViewId(s.id);
                }}
                className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-800"
              >
                {s.customer} · {daysBetween(s.dueDate, todayKey())}d late
              </button>
            ))}
          </div>
        </section>
      )}

      {/* RECORDS LIST */}
      <section className="min-w-0 rounded-[24px] border border-[#d6e7fa] bg-white shadow-sm">
        <div className="border-b border-[#d6e7fa] p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                {isPhotoTab ? <Images size={21} /> : <Film size={21} />}
                {isPhotoTab
                  ? "Photo Selection Records"
                  : "Video Selection Records"}
              </h2>
              <p className="mt-1 text-xs text-[#748eae]">
                Showing {filtered.length} of {currentList.length} records
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:flex-1 xl:w-72">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#748eae]"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    isPhotoTab
                      ? "Search photo selections..."
                      : "Search video selections..."
                  }
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="flex w-full items-center gap-2 sm:w-52">
                <Filter size={17} className="shrink-0 text-[#385d89]" />
                <Select
                  value={filter}
                  options={["All", "Pending", "In Progress", "Returned", "Overdue"]}
                  onChange={setFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="rounded-3xl bg-[#e0efff] p-5 text-[#24558d]">
              {isPhotoTab ? <Images size={35} /> : <Video size={35} />}
            </div>
            <h3 className="mt-4 font-extrabold">
              {currentList.length === 0
                ? isPhotoTab
                  ? "No photo selections available."
                  : "No video selections available."
                : "No records found"}
            </h3>
            <p className="mt-2 text-sm text-[#748eae]">
              Try another search or create a new record.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#173b70] px-5 py-3 text-xs font-bold text-white"
            >
              <Plus size={16} />
              {isPhotoTab ? "New Photo Selection" : "New Video Selection"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 2xl:grid-cols-3">
            {filtered.map((item) => (
              <SelectionCard
                key={item.id}
                item={item}
                kind={activeTab}
                onView={(x) => {
                  sound("open");
                  setViewType(activeTab);
                  setViewId(x.id);
                }}
                onEdit={(x) => openEdit(activeTab, x)}
                onDelete={(id) => deleteRecord(activeTab, id)}
                onStatusChange={(rec, st) =>
                  handleStatusChange(activeTab, rec, st)
                }
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-[#d6e7fa] px-4 py-4 text-xs text-[#748eae] sm:flex-row sm:justify-between sm:px-6">
          <span>
            Showing {filtered.length} of {currentList.length} records
          </span>
          <span>Studio Raw Picturez ERP</span>
        </div>
      </section>

      {/* PHOTO SELECTION MODAL */}
      {formType === "photo" && (
        <Modal
          title={editingId ? "Edit Photo Selection" : "New Photo Selection"}
          description="Track photos shared with customers and their selection status"
          icon={Images}
          onClose={closeForm}
          onSubmit={savePhotoSelection}
          submitLabel={editingId ? "Update Selection" : "Save Photo Selection"}
        >
          <div className="rounded-2xl border border-[#d3e5fa] bg-gradient-to-r from-[#edf6ff] to-[#e2efff] p-4">
            <div className="flex gap-3">
              <Sparkles size={20} className="shrink-0 text-[#24558d]" />
              <div>
                <p className="text-sm font-bold">Photo Selection Lifecycle</p>
                <p className="mt-1 text-xs text-[#58769c]">
                  New records default to Pending. Update status to In Progress
                  while the customer selects photos, and Returned once submitted.
                </p>
              </div>
            </div>
          </div>

          <Section
            icon={UserRound}
            title="Customer Information"
            subtitle="Select existing customer or enter customer details manually"
          >
            <CustomerBookingFields
              kind="photo"
              form={photoForm}
              bookings={photoBookings}
              updateField={updatePhoto}
              chooseCustomer={chooseCustomer}
              chooseBooking={chooseBooking}
              customerOptions={customerOptions}
              registeredCustomer={registeredCustomer}
            />
          </Section>

          <Section
            icon={CalendarClock}
            title="Photo Selection Timeline & Status"
            subtitle="Given date, return due date, and selection status"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Photos Given Date" required>
                <input
                  required
                  type="date"
                  value={photoForm.givenDate}
                  onChange={(e) => updatePhoto("givenDate", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Return Due Date" required>
                <input
                  required
                  type="date"
                  min={photoForm.givenDate || undefined}
                  value={photoForm.dueDate}
                  onChange={(e) => updatePhoto("dueDate", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Selection Status">
                <Select
                  value={photoForm.status || "Pending"}
                  options={SELECTION_STATUSES}
                  onChange={(v) => updatePhoto("status", v)}
                />
              </Field>
              <Field label="Actual Return Date">
                <input
                  type="date"
                  min={photoForm.givenDate || undefined}
                  value={photoForm.returnedDate}
                  onChange={(e) => updatePhoto("returnedDate", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={ImageIcon}
            title="Photo Selection Details"
            subtitle="Shared photos, selected photos and sharing method"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Total Photos Shared">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={photoForm.photoCount}
                  onChange={(e) => updatePhoto("photoCount", e.target.value)}
                  placeholder="e.g. 1200"
                  className={inputClass}
                />
              </Field>
              <Field label="Photos Selected">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={photoForm.selectedCount}
                  onChange={(e) => updatePhoto("selectedCount", e.target.value)}
                  placeholder="e.g. 150"
                  className={inputClass}
                />
              </Field>
              <Field label="Photos Shared Through">
                <Select
                  value={photoForm.method}
                  options={SELECTION_METHODS}
                  onChange={(v) => updatePhoto("method", v)}
                />
              </Field>
              <Field label="Assigned Staff">
                <Select
                  value={photoForm.assignedTo}
                  options={STAFF}
                  onChange={(v) => updatePhoto("assignedTo", v)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Selection Notes">
                  <textarea
                    rows={3}
                    value={photoForm.notes}
                    onChange={(e) => updatePhoto("notes", e.target.value)}
                    placeholder="Customer follow-up and special instructions..."
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </Modal>
      )}

      {/* VIDEO SELECTION MODAL */}
      {formType === "video" && (
        <Modal
          title={editingId ? "Edit Video Selection" : "New Video Selection"}
          description="Track customer video review and clip selection records"
          icon={Video}
          onClose={closeForm}
          onSubmit={saveVideoSelection}
          submitLabel={
            editingId ? "Update Video Selection" : "Save Video Selection"
          }
        >
          <Section
            icon={UserRound}
            title="Customer & Booking"
            subtitle="Link the video selection to an existing customer and booking"
          >
            <CustomerBookingFields
              kind="video"
              form={videoForm}
              bookings={videoBookings}
              updateField={updateVideo}
              chooseCustomer={chooseCustomer}
              chooseBooking={chooseBooking}
              customerOptions={customerOptions}
              registeredCustomer={registeredCustomer}
            />
          </Section>

          <Section
            icon={CalendarClock}
            title="Video Selection Timeline & Status"
            subtitle="Given date, return due date, and current status"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Given Date" required>
                <input
                  required
                  type="date"
                  value={videoForm.givenDate}
                  onChange={(e) => updateVideo("givenDate", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Return Due Date" required>
                <input
                  required
                  type="date"
                  min={videoForm.givenDate || undefined}
                  value={videoForm.dueDate}
                  onChange={(e) => updateVideo("dueDate", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Selection Status">
                <Select
                  value={videoForm.status || "Pending"}
                  options={SELECTION_STATUSES}
                  onChange={(v) => updateVideo("status", v)}
                />
              </Field>
              <Field label="Actual Return Date">
                <input
                  type="date"
                  min={videoForm.givenDate || undefined}
                  value={videoForm.returnedDate}
                  onChange={(e) => updateVideo("returnedDate", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          <Section
            icon={Film}
            title="Video Selection Details"
            subtitle="Videos shared, selected clips, notes and requirements"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Number of Videos Shared" required>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={videoForm.videoCount}
                  onChange={(e) => updateVideo("videoCount", e.target.value)}
                  placeholder="e.g. 25"
                  className={inputClass}
                />
              </Field>
              <Field label="Number of Videos Selected">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={videoForm.selectedCount}
                  onChange={(e) => updateVideo("selectedCount", e.target.value)}
                  placeholder="e.g. 12"
                  className={inputClass}
                />
              </Field>
              <Field label="Shared Through">
                <Select
                  value={videoForm.method}
                  options={SELECTION_METHODS}
                  onChange={(v) => updateVideo("method", v)}
                />
              </Field>
              <Field label="Assigned Staff">
                <Select
                  value={videoForm.assignedTo}
                  options={STAFF}
                  onChange={(v) => updateVideo("assignedTo", v)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Selection Notes">
                  <textarea
                    rows={2}
                    value={videoForm.notes}
                    onChange={(e) => updateVideo("notes", e.target.value)}
                    placeholder="Notes about song choices, highlight reels, etc."
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Additional Requirements">
                  <textarea
                    rows={2}
                    value={videoForm.requirements}
                    onChange={(e) => updateVideo("requirements", e.target.value)}
                    placeholder="Optional editing or delivery requirements..."
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </Section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </Modal>
      )}

      {/* VIEW MODAL */}
      {viewType && selectedView && (
        <Modal
          title={
            viewType === "video"
              ? "Video Selection Details"
              : "Photo Selection Details"
          }
          description={selectedView.customer}
          icon={viewType === "video" ? Video : Images}
          onClose={() => {
            sound("click");
            setViewType(null);
          }}
          maxWidth="max-w-[700px]"
        >
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#edf6ff] to-[#dcecff] p-5">
            <div>
              <h3 className="text-lg font-extrabold text-[#102b53]">
                {selectedView.customer}
              </h3>
              <p className="mt-0.5 text-xs text-[#587298]">{selectedView.id}</p>
            </div>
            <StatusBadge value={normalizeSelectionStatus(selectedView)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Info label="Customer" value={selectedView.customer} icon={UserRound} />
            <Info label="Phone" value={selectedView.phone} icon={Phone} />
            {selectedView.customerId && (
              <Info
                label="Customer Profile ID"
                value={selectedView.customerId}
                icon={Hash}
              />
            )}
            {selectedView.bookingId && (
              <Info
                label="Linked Booking"
                value={selectedView.bookingId}
                icon={Camera}
              />
            )}
            <div className="col-span-2">
              <Info
                label="Service / Event"
                value={selectedView.project}
                icon={Camera}
              />
            </div>
            <Info
              label="Given Date"
              value={formatDate(selectedView.givenDate)}
              icon={CalendarDays}
            />
            <Info
              label="Return Due Date"
              value={formatDate(selectedView.dueDate)}
              icon={CalendarClock}
            />
            <Info
              label="Actual Return Date"
              value={formatDate(selectedView.returnedDate)}
              icon={CheckCircle2}
            />
            <Info
              label="Sharing Method"
              value={selectedView.method}
              icon={viewType === "video" ? Video : Images}
            />
            <Info
              label={viewType === "video" ? "Videos Shared" : "Photos Shared"}
              value={
                viewType === "video"
                  ? selectedView.videoCount
                  : selectedView.photoCount
              }
              icon={viewType === "video" ? Film : ImageIcon}
            />
            <Info
              label={
                viewType === "video" ? "Videos Selected" : "Photos Selected"
              }
              value={selectedView.selectedCount}
              icon={CheckCircle2}
            />
            <div className="col-span-2">
              <Info
                label="Assigned Staff"
                value={selectedView.assignedTo}
                icon={UserRound}
              />
            </div>
            {selectedView.notes && (
              <div className="col-span-2">
                <Info
                  label="Selection Notes"
                  value={selectedView.notes}
                  icon={FileText}
                />
              </div>
            )}
            {selectedView.requirements && (
              <div className="col-span-2">
                <Info
                  label="Additional Requirements"
                  value={selectedView.requirements}
                  icon={ClipboardList}
                />
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-2">
            {normalizeSelectionStatus(selectedView) !== "Returned" && (
              <button
                type="button"
                onClick={() => {
                  handleStatusChange(viewType, selectedView, "Returned");
                  setViewType(null);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
              >
                <CheckCircle2 size={17} />
                Mark Returned
              </button>
            )}
            <button
              type="button"
              onClick={() => openEdit(viewType, selectedView)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#173b70] px-5 py-3 text-sm font-bold text-white"
            >
              <Pencil size={16} />
              Edit Selection
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
