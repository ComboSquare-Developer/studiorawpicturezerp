import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Plus,
  Search,
  Download,
  Eye,
  Pencil,
  Trash2,
  ArrowRightLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Wrench,
  PackageCheck,
  Boxes,
  X,
  Save,
  CalendarDays,
  UserRound,
  Filter,
  ChevronDown,
} from "lucide-react";
import { api } from "../api/client";
import { demoAuthService } from "../services/demo/demoAuthService";
import DateRangeExportModal from "../components/DateRangeExportModal";
import {
  buildExportFilename,
  downloadCsvFile,
  isDateInRange,
} from "../utils/dateRangeExport";

const EQUIPMENT_KEY = "studioraw_equipment";
const HANDOVER_KEY = "studioraw_equipment_handovers";
const BOOKING_KEY = "studioraw_bookings";
const STAFF_KEY = "studioraw_staff";
const UPDATE_EVENT = "studioraw:data-updated";

const CATEGORIES = [
  "Camera",
  "Lens",
  "Lighting",
  "Audio Equipment",
  "Video Equipment",
  "Tripod & Stabilizer",
  "Accessories",
  "Computer & Editing Equipment",
  "Other",
];

const EQUIPMENT_STATUSES = [
  "Available",
  "Assigned",
  "Returned",
  "Under Maintenance",
];
const RETURN_CONDITIONS = ["Good", "Damaged", "Needs Maintenance"];
const MANUAL_EVENT_VALUE = "__manual__";

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#d6e7fa] bg-[#f9fcff] px-3.5 py-2.5 text-sm text-[#102b53] outline-none transition focus:border-[#3b73b9] focus:ring-[3px] focus:ring-[#e4f1ff]";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(`${String(val).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function readStorageArray(key, fallbackKey) {
  try {
    const raw =
      localStorage.getItem(key) ??
      (fallbackKey ? localStorage.getItem(fallbackKey) : null);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function normalizeEquipmentStatus(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "assigned" || s === "handed over") return "Assigned";
  if (s === "returned") return "Returned";
  if (s === "under maintenance" || s === "maintenance") return "Under Maintenance";
  return "Available";
}

function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "available") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (s === "assigned" || s === "handed over") return "border-blue-200 bg-blue-50 text-blue-700";
  if (s === "under maintenance" || s === "maintenance") return "border-amber-200 bg-amber-50 text-amber-700";
  if (s === "returned") return "border-teal-200 bg-teal-50 text-teal-700";
  if (s === "partial return") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function SearchableDropdown({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value));
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`${inputClass} flex items-center justify-between gap-2 text-left`}
      >
        <span className={`truncate ${selectedOption ? "text-[#102b53] font-medium" : "text-slate-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className="shrink-0 text-[#607699]" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-[#cfe0f4] bg-white shadow-xl">
          <div className="border-b border-[#edf2f9] p-2">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#607699]"
              />
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-[#dce7f4] bg-[#f8fbff] py-1.5 pl-8 pr-3 text-xs text-[#102b53] outline-none focus:border-[#3b73b9]"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs text-slate-400">
                {emptyLabel}
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value, opt);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                    String(opt.value) === String(value)
                      ? "bg-[#10264d] font-bold text-white"
                      : "text-[#102b53] hover:bg-[#eef5ff]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.meta && (
                    <span
                      className={`ml-2 shrink-0 text-[10px] ${
                        String(opt.value) === String(value)
                          ? "text-blue-200"
                          : "text-[#607699]"
                      }`}
                    >
                      {opt.meta}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({ title, subtitle, icon: Icon, onClose, children, maxWidth = "max-w-2xl" }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152b]/65 p-3 backdrop-blur-[3px] sm:p-5">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[94dvh] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl border border-[#d6e7fa] bg-white shadow-2xl`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d6e7fa] bg-gradient-to-r from-[#f5faff] to-[#e6f1ff] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10264d] text-white">
              <Icon size={19} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#10264d] sm:text-lg">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-[#607699]">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl border border-[#d6e7fa] bg-white p-2 text-[#10264d] hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

const emptyEquipmentForm = () => ({
  equipmentName: "",
  category: "Camera",
  serialNumber: "",
  totalQuantity: "1",
  status: "Available",
  description: "",
  bookingId: "",
  manualEventName: "",
  handedOverToStaffId: "",
  handoverDate: todayKey(),
  expectedReturnDate: "",
  handoverNotes: "",
});

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState(() =>
    readStorageArray(EQUIPMENT_KEY)
  );
  const [handovers, setHandovers] = useState(() =>
    readStorageArray(HANDOVER_KEY)
  );
  const [bookings, setBookings] = useState(() =>
    readStorageArray(BOOKING_KEY, "studio_raw_bookings")
  );
  const [staffList, setStaffList] = useState(() =>
    readStorageArray(STAFF_KEY)
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");

  const [modal, setModal] = useState(""); // "add" | "edit" | "handover" | "return" | "view"
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [eqForm, setEqForm] = useState(emptyEquipmentForm);
  const [handoverForm, setHandoverForm] = useState({
    bookingId: "",
    manualEventName: "",
    handoverDate: todayKey(),
    receivedByStaffId: "",
    quantity: "1",
    expectedReturnDate: "",
    notes: "",
  });
  const [returnForm, setReturnForm] = useState({
    handoverId: "",
    actualReturnDate: todayKey(),
    quantityReturned: "1",
    returnCondition: "Good",
    returnNotes: "",
  });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const currentUser = demoAuthService.getCurrentUser();
  const loggedInAdminName =
    currentUser?.name || currentUser?.username || "Admin";

  const refreshContext = () => {
    setBookings(readStorageArray(BOOKING_KEY, "studio_raw_bookings"));
    setStaffList(readStorageArray(STAFF_KEY));
  };

  useEffect(() => {
    api.equipment
      .list()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setEquipmentList(res);
        }
      })
      .catch(() => {});

    const onUpdate = () => refreshContext();
    window.addEventListener("storage", onUpdate);
    window.addEventListener(UPDATE_EVENT, onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener(UPDATE_EVENT, onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, []);

  const persistEquipment = (nextList) => {
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(nextList));
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT, { detail: { key: EQUIPMENT_KEY } })
    );
  };

  const persistHandovers = (nextList) => {
    localStorage.setItem(HANDOVER_KEY, JSON.stringify(nextList));
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT, { detail: { key: HANDOVER_KEY } })
    );
  };

  const activeStaff = useMemo(
    () =>
      staffList.filter(
        (s) => String(s.status || "Active").trim().toLowerCase() === "active"
      ),
    [staffList]
  );

  const bookingOptions = useMemo(() => {
    const mapped = bookings.map((b) => {
      const cust = b.customer || b.customerName || "Customer";
      const svc = b.event || b.service || b.eventType || "Event";
      const dt = formatDate(b.date || b.eventDate);
      return {
        value: String(b.id),
        label: `${cust} – ${svc} – ${dt}`,
        meta: String(b.id),
      };
    });
    mapped.push({
      value: MANUAL_EVENT_VALUE,
      label: "Other / Enter Event Name Manually",
      meta: "Manual",
    });
    return mapped;
  }, [bookings]);

  const staffOptions = useMemo(
    () =>
      activeStaff.map((s) => ({
        value: String(s.id),
        label: s.staff_name || s.name || "Staff Member",
        meta: s.specialization || s.role || "Staff",
      })),
    [activeStaff]
  );

  // Enrich equipment with live calculated quantities and handover lists
  const enrichedEquipment = useMemo(() => {
    return equipmentList.map((eq) => {
      const totalQty = Math.max(
        1,
        Number(eq.totalQuantity ?? eq.quantity ?? 1)
      );
      const eqHandovers = handovers
        .filter((h) => String(h.equipmentId) === String(eq.id))
        .sort((a, b) =>
          String(b.handoverDate || "").localeCompare(String(a.handoverDate || ""))
        );

      const activeH = eqHandovers.filter((h) => {
        const out = Math.max(0, Number(h.quantity || 0) - Number(h.returnedQuantity || 0));
        return h.status !== "Returned" && out > 0;
      });

      const assignedQty = activeH.reduce(
        (sum, h) =>
          sum + Math.max(0, Number(h.quantity || 0) - Number(h.returnedQuantity || 0)),
        0
      );
      const availableQty = Math.max(0, totalQty - assignedQty);

      let computedStatus = normalizeEquipmentStatus(eq.status);
      if (computedStatus !== "Under Maintenance") {
        if (assignedQty > 0) {
          computedStatus = "Assigned";
        } else if (computedStatus === "Assigned" && eqHandovers.length === 0 && !eq.handedOverToName) {
          computedStatus = "Available";
        }
      }

      const latestHandover = activeH[0] || eqHandovers[0] || null;
      const displayEvent =
        eq.eventName || latestHandover?.bookingLabel || "—";
      const displayStaff =
        eq.handedOverToName || latestHandover?.receivedByName || "—";
      const displayHandoverDate =
        eq.handoverDate || latestHandover?.handoverDate || "";
      const displayExpectedReturn =
        eq.expectedReturnDate || latestHandover?.expectedReturnDate || "";

      return {
        ...eq,
        equipmentName: eq.equipmentName || eq.name || "Equipment",
        equipmentCode: eq.equipmentCode || eq.serialNumber || eq.id,
        totalQuantity: totalQty,
        assignedQuantity: assignedQty,
        availableQuantity: availableQty,
        computedStatus,
        displayEvent,
        displayStaff,
        displayHandoverDate,
        displayExpectedReturn,
        handovers: eqHandovers,
        activeHandovers: activeH,
      };
    });
  }, [equipmentList, handovers]);

  const stats = useMemo(() => {
    const total = enrichedEquipment.length;
    const available = enrichedEquipment.filter(
      (e) => e.computedStatus === "Available" || e.computedStatus === "Returned"
    ).length;
    const assigned = enrichedEquipment.filter(
      (e) => e.computedStatus === "Assigned"
    ).length;
    const maintenance = enrichedEquipment.filter(
      (e) => e.computedStatus === "Under Maintenance"
    ).length;
    return { total, available, assigned, maintenance };
  }, [enrichedEquipment]);

  const filteredEquipment = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedEquipment.filter((eq) => {
      if (
        q &&
        ![
          eq.equipmentName,
          eq.equipmentCode,
          eq.serialNumber,
          eq.id,
          eq.category,
          eq.displayEvent,
          eq.displayStaff,
        ].some((v) => String(v ?? "").toLowerCase().includes(q))
      ) {
        return false;
      }
      if (categoryFilter !== "All" && eq.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "All" && eq.computedStatus !== statusFilter) {
        return false;
      }
      if (conditionFilter === "available" && eq.availableQuantity <= 0) {
        return false;
      }
      if (conditionFilter === "assigned" && eq.assignedQuantity <= 0) {
        return false;
      }
      if (
        conditionFilter === "maintenance" &&
        eq.computedStatus !== "Under Maintenance"
      ) {
        return false;
      }
      return true;
    });
  }, [
    enrichedEquipment,
    search,
    categoryFilter,
    statusFilter,
    conditionFilter,
  ]);

  const closeModal = () => {
    setModal("");
    setSelectedEquipment(null);
    setError("");
  };

  const openAddModal = () => {
    refreshContext();
    setEqForm(emptyEquipmentForm());
    setSelectedEquipment(null);
    setError("");
    setModal("add");
  };

  const openEditModal = (eq) => {
    refreshContext();
    setSelectedEquipment(eq);
    const hasBooking = Boolean(
      eq.bookingId && bookings.some((b) => String(b.id) === String(eq.bookingId))
    );
    setEqForm({
      equipmentName: eq.equipmentName || "",
      category: eq.category || "Camera",
      serialNumber: eq.serialNumber || "",
      totalQuantity: String(eq.totalQuantity || 1),
      status: normalizeEquipmentStatus(eq.status || eq.computedStatus),
      description: eq.description || "",
      bookingId: hasBooking
        ? String(eq.bookingId)
        : eq.eventName
        ? MANUAL_EVENT_VALUE
        : "",
      manualEventName: hasBooking ? "" : eq.eventName || "",
      handedOverToStaffId: eq.handedOverToStaffId ? String(eq.handedOverToStaffId) : "",
      handoverDate: eq.handoverDate || todayKey(),
      expectedReturnDate: eq.expectedReturnDate || "",
      handoverNotes: eq.handoverNotes || eq.notes || "",
    });
    setError("");
    setModal("edit");
  };

  const openHandoverModal = (eq) => {
    refreshContext();
    setSelectedEquipment(eq);
    setHandoverForm({
      bookingId: "",
      manualEventName: "",
      handoverDate: todayKey(),
      receivedByStaffId: "",
      quantity: "1",
      expectedReturnDate: "",
      notes: "",
    });
    setError("");
    setModal("handover");
  };

  const openReturnModal = (eq) => {
    const firstActive = eq.activeHandovers[0];
    if (!firstActive) return;
    const out = Math.max(
      1,
      Number(firstActive.quantity || 0) - Number(firstActive.returnedQuantity || 0)
    );
    setSelectedEquipment(eq);
    setReturnForm({
      handoverId: firstActive.id,
      actualReturnDate: todayKey(),
      quantityReturned: String(out),
      returnCondition: "Good",
      returnNotes: "",
    });
    setError("");
    setModal("return");
  };

  const resolveEventDetails = (bookingId, manualEventName) => {
    if (bookingId === MANUAL_EVENT_VALUE) {
      return {
        bookingId: "",
        eventName: String(manualEventName || "").trim(),
      };
    }
    const booking = bookings.find((b) => String(b.id) === String(bookingId));
    if (booking) {
      const cust = booking.customer || booking.customerName || "Customer";
      const svc = booking.event || booking.service || booking.eventType || "Event";
      const dt = formatDate(booking.date || booking.eventDate);
      return {
        bookingId: String(booking.id),
        eventName: `${cust} – ${svc} – ${dt}`,
      };
    }
    return {
      bookingId: "",
      eventName: String(manualEventName || "").trim(),
    };
  };

  const saveEquipment = async (e) => {
    e.preventDefault();
    if (savingRef.current) return;

    const name = eqForm.equipmentName.trim();
    const totalQty = Number(eqForm.totalQuantity);
    const { bookingId, eventName } = resolveEventDetails(
      eqForm.bookingId,
      eqForm.manualEventName
    );
    const staffMember = activeStaff.find(
      (s) => String(s.id) === String(eqForm.handedOverToStaffId)
    );

    if (!name) {
      setError("Equipment Name is required.");
      return;
    }
    if (!Number.isInteger(totalQty) || totalQty < 1) {
      setError("Quantity must be a positive whole number.");
      return;
    }
    if (!eventName) {
      setError("Please select an Event / Booking or enter an Event Name.");
      return;
    }
    if (!eqForm.handedOverToStaffId || !staffMember) {
      setError("Please select the staff member receiving the equipment.");
      return;
    }
    if (!eqForm.handoverDate) {
      setError("Handover Date is required.");
      return;
    }
    if (
      eqForm.expectedReturnDate &&
      eqForm.expectedReturnDate < eqForm.handoverDate
    ) {
      setError("Expected Return Date cannot be earlier than Handover Date.");
      return;
    }
    if (
      modal === "edit" &&
      selectedEquipment &&
      totalQty < selectedEquipment.assignedQuantity
    ) {
      setError(
        `Total Quantity cannot be less than currently assigned quantity (${selectedEquipment.assignedQuantity}).`
      );
      return;
    }

    const staffName =
      staffMember.staff_name || staffMember.name || "Staff Member";
    const staffRole = staffMember.specialization || staffMember.role || "Staff";
    const resolvedStatus = normalizeEquipmentStatus(eqForm.status);

    savingRef.current = true;
    setIsSaving(true);
    setError("");

    try {
      const nowIso = new Date().toISOString();
      const assignmentFields = {
        bookingId,
        eventName,
        handedOverToStaffId: String(staffMember.id),
        handedOverToName: staffName,
        handedOverToRole: staffRole,
        handoverDate: eqForm.handoverDate,
        expectedReturnDate: eqForm.expectedReturnDate || "",
        handoverNotes: eqForm.handoverNotes.trim(),
      };

      if (modal === "edit" && selectedEquipment) {
        const updatedRecord = {
          ...selectedEquipment,
          equipmentName: name,
          category: eqForm.category || "Other",
          serialNumber: eqForm.serialNumber.trim(),
          equipmentCode:
            eqForm.serialNumber.trim() ||
            selectedEquipment.equipmentCode ||
            selectedEquipment.id,
          totalQuantity: totalQty,
          description: eqForm.description.trim(),
          status: resolvedStatus,
          ...assignmentFields,
          updatedAt: nowIso,
        };

        await api.equipment.update(selectedEquipment.id, updatedRecord);
        setEquipmentList((prev) => {
          const next = prev.map((item) =>
            item.id === selectedEquipment.id ? updatedRecord : item
          );
          persistEquipment(next);
          return next;
        });

        // If marked Assigned and no active handover exists yet, create initial handover transaction
        if (
          resolvedStatus === "Assigned" &&
          selectedEquipment.activeHandovers.length === 0
        ) {
          const tx = {
            id: makeId("HND"),
            equipmentId: selectedEquipment.id,
            equipmentName: name,
            bookingId,
            bookingLabel: eventName,
            receivedByStaffId: String(staffMember.id),
            receivedByName: staffName,
            handoverDate: eqForm.handoverDate,
            quantity: totalQty,
            returnedQuantity: 0,
            expectedReturnDate: eqForm.expectedReturnDate || "",
            actualReturnDate: "",
            handoverBy: loggedInAdminName,
            returnCondition: "",
            status: "Assigned",
            notes: eqForm.handoverNotes.trim(),
            returnNotes: "",
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          setHandovers((prev) => {
            const next = [tx, ...prev];
            persistHandovers(next);
            return next;
          });
        }

        setNotice(`Equipment "${name}" updated successfully.`);
      } else {
        const payload = {
          equipmentName: name,
          category: eqForm.category || "Other",
          serialNumber: eqForm.serialNumber.trim(),
          totalQuantity: totalQty,
          description: eqForm.description.trim(),
          status: resolvedStatus,
          ...assignmentFields,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        const created = await api.equipment.create(payload);
        const createdId = created?.id || makeId("EQP");
        const newRecord = {
          ...payload,
          id: createdId,
          equipmentCode: payload.serialNumber || createdId,
        };

        setEquipmentList((prev) => {
          const next = [newRecord, ...prev.filter((x) => x.id !== createdId)];
          persistEquipment(next);
          return next;
        });

        if (resolvedStatus === "Assigned") {
          const tx = {
            id: makeId("HND"),
            equipmentId: createdId,
            equipmentName: name,
            bookingId,
            bookingLabel: eventName,
            receivedByStaffId: String(staffMember.id),
            receivedByName: staffName,
            handoverDate: eqForm.handoverDate,
            quantity: totalQty,
            returnedQuantity: 0,
            expectedReturnDate: eqForm.expectedReturnDate || "",
            actualReturnDate: "",
            handoverBy: loggedInAdminName,
            returnCondition: "",
            status: "Assigned",
            notes: eqForm.handoverNotes.trim(),
            returnNotes: "",
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          setHandovers((prev) => {
            const next = [tx, ...prev];
            persistHandovers(next);
            return next;
          });
        }

        setNotice(`Equipment "${name}" saved successfully.`);
      }
      closeModal();
    } catch (err) {
      setError(err?.message || "Failed to save equipment.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const confirmHandover = (e) => {
    e.preventDefault();
    if (!selectedEquipment || savingRef.current) return;

    const qty = Number(handoverForm.quantity);
    const { bookingId, eventName } = resolveEventDetails(
      handoverForm.bookingId,
      handoverForm.manualEventName
    );
    if (!eventName) {
      setError("Please select an Event / Booking or enter an Event Name.");
      return;
    }
    if (!handoverForm.handoverDate) {
      setError("Handover Date is required.");
      return;
    }
    if (
      handoverForm.expectedReturnDate &&
      handoverForm.expectedReturnDate < handoverForm.handoverDate
    ) {
      setError("Expected Return Date cannot be earlier than Handover Date.");
      return;
    }
    if (!handoverForm.receivedByStaffId) {
      setError("Please select the staff member receiving the equipment.");
      return;
    }
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Quantity Handed Over must be at least 1.");
      return;
    }
    if (qty > selectedEquipment.availableQuantity) {
      setError(
        `Cannot hand over ${qty} unit(s). Only ${selectedEquipment.availableQuantity} available.`
      );
      return;
    }

    const staffMember = activeStaff.find(
      (s) => String(s.id) === String(handoverForm.receivedByStaffId)
    );
    const staffName =
      staffMember?.staff_name || staffMember?.name || "Staff Member";

    const nowIso = new Date().toISOString();
    const tx = {
      id: makeId("HND"),
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.equipmentName,
      bookingId,
      bookingLabel: eventName,
      receivedByStaffId: String(handoverForm.receivedByStaffId),
      receivedByName: staffName,
      handoverDate: handoverForm.handoverDate,
      quantity: qty,
      returnedQuantity: 0,
      expectedReturnDate: handoverForm.expectedReturnDate || "",
      actualReturnDate: "",
      handoverBy: loggedInAdminName,
      returnCondition: "",
      status: "Assigned",
      notes: handoverForm.notes.trim(),
      returnNotes: "",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setHandovers((prev) => {
      const next = [tx, ...prev];
      persistHandovers(next);
      return next;
    });

    setEquipmentList((prev) => {
      const next = prev.map((eq) =>
        eq.id === selectedEquipment.id
          ? {
              ...eq,
              status: "Assigned",
              bookingId,
              eventName,
              handedOverToStaffId: String(handoverForm.receivedByStaffId),
              handedOverToName: staffName,
              handoverDate: handoverForm.handoverDate,
              expectedReturnDate: handoverForm.expectedReturnDate || "",
              handoverNotes: handoverForm.notes.trim(),
              updatedAt: nowIso,
            }
          : eq
      );
      persistEquipment(next);
      return next;
    });

    setNotice(
      `Handed over ${qty} × ${selectedEquipment.equipmentName} to ${staffName}.`
    );
    closeModal();
  };

  const confirmReturn = (e) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    const targetTx = selectedEquipment.activeHandovers.find(
      (h) => h.id === returnForm.handoverId
    );
    if (!targetTx) {
      setError("Please select an active handover record.");
      return;
    }

    const outstanding = Math.max(
      0,
      Number(targetTx.quantity || 0) - Number(targetTx.returnedQuantity || 0)
    );
    const qtyReturned = Number(returnForm.quantityReturned);

    if (!returnForm.actualReturnDate) {
      setError("Actual Return Date is required.");
      return;
    }
    if (!Number.isInteger(qtyReturned) || qtyReturned < 1) {
      setError("Quantity Returned must be at least 1.");
      return;
    }
    if (qtyReturned > outstanding) {
      setError(
        `Cannot return ${qtyReturned} unit(s). Outstanding handed-over quantity is ${outstanding}.`
      );
      return;
    }

    const newReturnedQty = Number(targetTx.returnedQuantity || 0) + qtyReturned;
    const isFullyReturned = newReturnedQty >= Number(targetTx.quantity || 0);
    const remainingAssignedAfter = Math.max(
      0,
      selectedEquipment.assignedQuantity - qtyReturned
    );
    const nowIso = new Date().toISOString();

    setHandovers((prev) => {
      const next = prev.map((h) =>
        h.id !== targetTx.id
          ? h
          : {
              ...h,
              returnedQuantity: newReturnedQty,
              actualReturnDate: returnForm.actualReturnDate,
              returnCondition: returnForm.returnCondition,
              returnNotes: returnForm.returnNotes.trim(),
              status: isFullyReturned ? "Returned" : "Partial Return",
              updatedAt: nowIso,
            }
      );
      persistHandovers(next);
      return next;
    });

    const nextEqStatus =
      returnForm.returnCondition === "Needs Maintenance" ||
      returnForm.returnCondition === "Damaged"
        ? "Under Maintenance"
        : remainingAssignedAfter === 0
        ? "Returned"
        : "Assigned";

    setEquipmentList((prev) => {
      const next = prev.map((eq) =>
        eq.id === selectedEquipment.id
          ? { ...eq, status: nextEqStatus, updatedAt: nowIso }
          : eq
      );
      persistEquipment(next);
      return next;
    });

    setNotice(
      `Recorded return of ${qtyReturned} × ${selectedEquipment.equipmentName} (${returnForm.returnCondition}).`
    );
    closeModal();
  };

  const deleteEquipment = async (eq) => {
    if (eq.assignedQuantity > 0) {
      setNotice("");
      setError(
        `Cannot delete "${eq.equipmentName}" while ${eq.assignedQuantity} unit(s) are assigned. Record their return first.`
      );
      return;
    }
    if (!window.confirm(`Delete "${eq.equipmentName}" from Equipment Management?`)) {
      return;
    }
    try {
      await api.equipment.delete(eq.id);
    } catch {}
    setEquipmentList((prev) => {
      const next = prev.filter((item) => item.id !== eq.id);
      persistEquipment(next);
      return next;
    });
    setNotice(`Equipment "${eq.equipmentName}" deleted.`);
  };

  const handleExportCSV = ({ rangeType, fromDate, toDate }) => {
    const records = filteredEquipment.filter((eq) =>
      isDateInRange(eq.displayHandoverDate || eq.createdAt, fromDate, toDate)
    );

    if (records.length === 0) {
      return { error: "No records found for the selected date range." };
    }

    downloadCsvFile({
      headers: [
        "Equipment ID",
        "Equipment Name",
        "Category",
        "Serial Number",
        "Total Quantity",
        "Available Quantity",
        "Assigned Quantity",
        "Status",
        "Event Assignment",
        "Handed Over To",
        "Handover Date",
        "Expected Return Date",
      ],
      rows: records.map((eq) => [
        eq.equipmentCode,
        eq.equipmentName,
        eq.category,
        eq.serialNumber || "",
        eq.totalQuantity,
        eq.availableQuantity,
        eq.assignedQuantity,
        eq.computedStatus,
        eq.displayEvent,
        eq.displayStaff,
        eq.displayHandoverDate || "",
        eq.displayExpectedReturn || "",
      ]),
      filename: buildExportFilename("Equipment", { rangeType, fromDate, toDate }),
    });

    setNotice(
      `Exported ${records.length} equipment ${records.length === 1 ? "record" : "records"} (${fromDate} to ${toDate}).`
    );
    return { count: records.length };
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-[#f8fbff] via-[#f2f7ff] to-[#e9f2ff] px-3 py-5 text-[#10264d] sm:px-5 sm:py-7 lg:px-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#10264d] sm:text-3xl">
            Equipment Management
          </h1>
          <p className="mt-1 text-xs font-medium text-[#607699] sm:text-sm">
            Manage studio equipment, assignments and event-wise handovers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d6e7fa] bg-white px-4 py-2.5 text-xs font-bold text-[#10264d] shadow-xs transition hover:bg-[#f2f7ff] sm:text-sm"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10264d] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#1b3f7a] sm:text-sm"
          >
            <Plus size={17} />
            Add Equipment
          </button>
        </div>
      </div>

      {/* NOTICES */}
      {notice && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 sm:text-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={17} />
            {notice}
          </span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {error && !modal && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800 sm:text-sm">
          <span className="flex items-center gap-2">
            <AlertCircle size={17} />
            {error}
          </span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          {
            title: "Total Equipment",
            value: stats.total,
            icon: Boxes,
            bg: "bg-blue-50 text-[#10264d]",
          },
          {
            title: "Available",
            value: stats.available,
            icon: PackageCheck,
            bg: "bg-emerald-50 text-emerald-700",
          },
          {
            title: "Assigned / Handed Over",
            value: stats.assigned,
            icon: ArrowRightLeft,
            bg: "bg-indigo-50 text-indigo-700",
          },
          {
            title: "Under Maintenance",
            value: stats.maintenance,
            icon: Wrench,
            bg: "bg-amber-50 text-amber-700",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-[22px] border border-[#dce7f4] bg-white p-4 shadow-xs sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#607699]">
                    {card.title}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-[#10264d] sm:text-3xl">
                    {card.value}
                  </h3>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.bg}`}
                >
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-[#dce7f4] bg-white p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#607699]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment, event or staff..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="shrink-0 text-[#607699]" />
          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={inputClass}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass}
        >
          <option value="All">All Statuses</option>
          {EQUIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by condition"
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className={inputClass}
        >
          <option value="All">All Availability</option>
          <option value="available">Available Stock</option>
          <option value="assigned">Currently Assigned</option>
          <option value="maintenance">Under Maintenance</option>
        </select>
      </div>

      {/* EQUIPMENT DIRECTORY */}
      <section className="overflow-hidden rounded-[24px] border border-[#dce7f4] bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e5edf7] px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold text-[#10264d]">
              Equipment Records
            </h2>
            <p className="text-xs text-[#607699]">
              Showing {filteredEquipment.length} of {enrichedEquipment.length} items
            </p>
          </div>
          <Camera size={20} className="text-[#24558d]" />
        </div>

        {filteredEquipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="rounded-2xl bg-[#edf4ff] p-4 text-[#24558d]">
              <Camera size={32} />
            </div>
            <h3 className="mt-4 text-sm font-extrabold text-[#10264d]">
              {enrichedEquipment.length === 0
                ? "No equipment registered yet."
                : "No matching equipment found."}
            </h3>
            <p className="mt-1 text-xs text-[#607699]">
              Register your cameras, lenses, lighting and studio gear to track event handovers.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#10264d] px-4 py-2.5 text-xs font-bold text-white"
            >
              <Plus size={15} />
              Add Equipment
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1060px] text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e5edf7] bg-[#f4f8ff] text-[11px] font-extrabold uppercase tracking-wider text-[#4b6488]">
                    <th className="px-4 py-3.5">Equipment</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Event Assignment</th>
                    <th className="px-4 py-3.5">Handed Over To</th>
                    <th className="px-4 py-3.5">Handover / Return</th>
                    <th className="px-4 py-3.5 text-center">Qty (Avail / Total)</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f9]">
                  {filteredEquipment.map((eq) => (
                    <tr key={eq.id} className="transition hover:bg-[#f7faff]">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-[#10264d]">{eq.equipmentName}</p>
                        <p className="font-mono text-[10px] text-[#607699]">
                          {eq.equipmentCode}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-[#385d89]">{eq.category}</td>
                      <td className="max-w-[200px] truncate px-4 py-3.5 font-medium text-[#10264d]">
                        {eq.displayEvent}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[#10264d]">
                        {eq.displayStaff}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-[#10264d]">
                          {formatDate(eq.displayHandoverDate)}
                        </p>
                        {eq.displayExpectedReturn && (
                          <p className="text-[10px] text-[#607699]">
                            Due: {formatDate(eq.displayExpectedReturn)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold">
                        <span className="text-emerald-700">{eq.availableQuantity}</span>
                        {" / "}
                        <span>{eq.totalQuantity}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass(
                            eq.computedStatus
                          )}`}
                        >
                          {eq.computedStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Details & History"
                            onClick={() => {
                              setSelectedEquipment(eq);
                              setModal("view");
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-[#10264d] hover:bg-slate-50"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            title="Edit Equipment"
                            onClick={() => openEditModal(eq)}
                            className="rounded-lg border border-slate-200 p-2 text-amber-700 hover:bg-amber-50"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={
                              eq.availableQuantity <= 0 ||
                              eq.computedStatus === "Under Maintenance"
                            }
                            onClick={() => openHandoverModal(eq)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#10264d] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#1b3f7a] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ArrowRightLeft size={13} />
                            Hand Over
                          </button>
                          {eq.assignedQuantity > 0 && (
                            <button
                              type="button"
                              onClick={() => openReturnModal(eq)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                            >
                              <RotateCcw size={13} />
                              Return
                            </button>
                          )}
                          <button
                            type="button"
                            title="Delete Equipment"
                            onClick={() => deleteEquipment(eq)}
                            className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:hidden">
              {filteredEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className="flex flex-col rounded-2xl border border-[#dce7f4] bg-[#fbfdff] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#10264d]">
                        {eq.equipmentName}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-[#607699]">
                        {eq.equipmentCode} · {eq.category}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadgeClass(
                        eq.computedStatus
                      )}`}
                    >
                      {eq.computedStatus}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 rounded-xl border border-[#e6eef8] bg-white p-3 text-xs">
                    <p className="truncate">
                      <span className="text-[#607699]">Event: </span>
                      <strong className="text-[#10264d]">{eq.displayEvent}</strong>
                    </p>
                    <p>
                      <span className="text-[#607699]">Handed Over To: </span>
                      <strong className="text-[#10264d]">{eq.displayStaff}</strong>
                    </p>
                    <div className="flex flex-wrap gap-x-4 text-[11px] text-[#607699]">
                      <span>Handover: <strong className="text-[#10264d]">{formatDate(eq.displayHandoverDate)}</strong></span>
                      {eq.displayExpectedReturn && (
                        <span>Return Due: <strong className="text-[#10264d]">{formatDate(eq.displayExpectedReturn)}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-[#e6eef8] bg-white p-2.5 text-center">
                    <div>
                      <p className="text-[10px] text-[#607699]">Total</p>
                      <p className="text-sm font-black">{eq.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#607699]">Available</p>
                      <p className="text-sm font-black text-emerald-700">
                        {eq.availableQuantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#607699]">Assigned</p>
                      <p className="text-sm font-black text-blue-700">
                        {eq.assignedQuantity}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={
                        eq.availableQuantity <= 0 ||
                        eq.computedStatus === "Under Maintenance"
                      }
                      onClick={() => openHandoverModal(eq)}
                      className="flex-1 rounded-xl bg-[#10264d] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                    >
                      Hand Over
                    </button>
                    {eq.assignedQuantity > 0 && (
                      <button
                        type="button"
                        onClick={() => openReturnModal(eq)}
                        className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                      >
                        Return
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEquipment(eq);
                        setModal("view");
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-[#10264d]"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(eq)}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-amber-700"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEquipment(eq)}
                      className="rounded-xl border border-rose-200 bg-white p-2 text-rose-600"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ADD / EDIT EQUIPMENT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <Modal
          title={modal === "edit" ? "Edit Equipment" : "Add Equipment"}
          subtitle="Register studio gear and record event handover assignment"
          icon={Camera}
          onClose={closeModal}
        >
          <form onSubmit={saveEquipment} className="space-y-6">
            {/* EQUIPMENT DETAILS */}
            <div>
              <h3 className="mb-3 border-b border-[#e5edf7] pb-2 text-xs font-extrabold uppercase tracking-wider text-[#4b6488]">
                Equipment Details
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Equipment Name *
                  </label>
                  <input
                    required
                    value={eqForm.equipmentName}
                    onChange={(e) =>
                      setEqForm((p) => ({ ...p, equipmentName: e.target.value }))
                    }
                    placeholder="e.g. Sony A7 IV Body"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Equipment Category
                  </label>
                  <select
                    value={eqForm.category}
                    onChange={(e) =>
                      setEqForm((p) => ({ ...p, category: e.target.value }))
                    }
                    className={inputClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Equipment ID / Serial Number
                  </label>
                  <input
                    value={eqForm.serialNumber}
                    onChange={(e) =>
                      setEqForm((p) => ({ ...p, serialNumber: e.target.value }))
                    }
                    placeholder="Optional serial number"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Quantity *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={eqForm.totalQuantity}
                    onChange={(e) =>
                      setEqForm((p) => ({ ...p, totalQuantity: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Equipment Status
                  </label>
                  <select
                    value={eqForm.status}
                    onChange={(e) =>
                      setEqForm((p) => ({ ...p, status: e.target.value }))
                    }
                    className={inputClass}
                  >
                    {EQUIPMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Equipment Description
                  </label>
                  <textarea
                    rows={2}
                    value={eqForm.description}
                    onChange={(e) =>
                      setEqForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Optional specifications or included accessories"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* ASSIGNMENT DETAILS */}
            <div>
              <h3 className="mb-3 border-b border-[#e5edf7] pb-2 text-xs font-extrabold uppercase tracking-wider text-[#4b6488]">
                Assignment Details
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Which Event Is This Equipment For? *
                  </label>
                  <SearchableDropdown
                    value={eqForm.bookingId}
                    options={bookingOptions}
                    placeholder="Select event / booking..."
                    searchPlaceholder="Search customer, service or booking ID..."
                    emptyLabel="No matching bookings found."
                    onChange={(val) =>
                      setEqForm((p) => ({
                        ...p,
                        bookingId: val,
                        manualEventName:
                          val === MANUAL_EVENT_VALUE ? p.manualEventName : "",
                      }))
                    }
                  />
                </div>

                {eqForm.bookingId === MANUAL_EVENT_VALUE && (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                      Manual Event Name *
                    </label>
                    <input
                      required
                      value={eqForm.manualEventName}
                      onChange={(e) =>
                        setEqForm((p) => ({
                          ...p,
                          manualEventName: e.target.value,
                        }))
                      }
                      placeholder="Enter event name (e.g. Corporate Shoot – 28 Nov 2026)"
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Handed Over To *
                  </label>
                  <SearchableDropdown
                    value={eqForm.handedOverToStaffId}
                    options={staffOptions}
                    placeholder="Select active staff member..."
                    searchPlaceholder="Search staff name or role..."
                    emptyLabel="No active staff members found."
                    onChange={(val) =>
                      setEqForm((p) => ({ ...p, handedOverToStaffId: val }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Handover Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={eqForm.handoverDate}
                    onChange={(e) =>
                      setEqForm((p) => ({ ...p, handoverDate: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Expected Return Date
                  </label>
                  <input
                    type="date"
                    min={eqForm.handoverDate || undefined}
                    value={eqForm.expectedReturnDate}
                    onChange={(e) =>
                      setEqForm((p) => ({
                        ...p,
                        expectedReturnDate: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Handover Notes
                  </label>
                  <textarea
                    rows={2}
                    value={eqForm.handoverNotes}
                    onChange={(e) =>
                      setEqForm((p) => ({ ...p, handoverNotes: e.target.value }))
                    }
                    placeholder="Equipment condition, accessories handed over, or special instructions..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-[#e5edf7] pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#d6e7fa] px-5 py-2.5 text-sm font-bold text-[#607699]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Equipment"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* HANDOVER MODAL */}
      {modal === "handover" && selectedEquipment && (
        <Modal
          title="Hand Over Equipment"
          subtitle={`Available: ${selectedEquipment.availableQuantity} of ${selectedEquipment.totalQuantity} unit(s)`}
          icon={ArrowRightLeft}
          onClose={closeModal}
        >
          <form onSubmit={confirmHandover} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Equipment Name
                </label>
                <input
                  readOnly
                  value={`${selectedEquipment.equipmentName} (${selectedEquipment.equipmentCode})`}
                  className={`${inputClass} bg-[#edf5ff] font-bold`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Which Event Is This Equipment For? *
                </label>
                <SearchableDropdown
                  value={handoverForm.bookingId}
                  options={bookingOptions}
                  placeholder="Select event / booking..."
                  searchPlaceholder="Search customer, service or booking ID..."
                  emptyLabel="No matching bookings found."
                  onChange={(val) =>
                    setHandoverForm((p) => ({
                      ...p,
                      bookingId: val,
                      manualEventName:
                        val === MANUAL_EVENT_VALUE ? p.manualEventName : "",
                    }))
                  }
                />
              </div>

              {handoverForm.bookingId === MANUAL_EVENT_VALUE && (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                    Manual Event Name *
                  </label>
                  <input
                    required
                    value={handoverForm.manualEventName}
                    onChange={(e) =>
                      setHandoverForm((p) => ({
                        ...p,
                        manualEventName: e.target.value,
                      }))
                    }
                    placeholder="Enter event name"
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Handover Date *
                </label>
                <input
                  required
                  type="date"
                  value={handoverForm.handoverDate}
                  onChange={(e) =>
                    setHandoverForm((p) => ({ ...p, handoverDate: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Handed Over To *
                </label>
                <SearchableDropdown
                  value={handoverForm.receivedByStaffId}
                  options={staffOptions}
                  placeholder="Select active staff member..."
                  searchPlaceholder="Search staff name or role..."
                  emptyLabel="No active staff members found."
                  onChange={(val) =>
                    setHandoverForm((p) => ({ ...p, receivedByStaffId: val }))
                  }
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Quantity Handed Over *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max={selectedEquipment.availableQuantity}
                  step="1"
                  value={handoverForm.quantity}
                  onChange={(e) =>
                    setHandoverForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  min={handoverForm.handoverDate || undefined}
                  value={handoverForm.expectedReturnDate}
                  onChange={(e) =>
                    setHandoverForm((p) => ({
                      ...p,
                      expectedReturnDate: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Handover By
                </label>
                <input
                  readOnly
                  value={loggedInAdminName}
                  className={`${inputClass} bg-[#edf5ff] font-semibold`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Handover Notes
                </label>
                <textarea
                  rows={2}
                  value={handoverForm.notes}
                  onChange={(e) =>
                    setHandoverForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Equipment condition, accessories handed over, or special instructions"
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-[#e5edf7] pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#d6e7fa] px-5 py-2.5 text-sm font-bold text-[#607699]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-2.5 text-sm font-bold text-white"
              >
                <CheckCircle2 size={16} />
                Confirm Handover
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* RETURN MODAL */}
      {modal === "return" && selectedEquipment && (
        <Modal
          title="Record Equipment Return"
          subtitle={selectedEquipment.equipmentName}
          icon={RotateCcw}
          onClose={closeModal}
        >
          <form onSubmit={confirmReturn} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Active Handover Record *
                </label>
                <select
                  required
                  value={returnForm.handoverId}
                  onChange={(e) => {
                    const tx = selectedEquipment.activeHandovers.find(
                      (h) => h.id === e.target.value
                    );
                    const out = tx
                      ? Math.max(
                          1,
                          Number(tx.quantity || 0) - Number(tx.returnedQuantity || 0)
                        )
                      : 1;
                    setReturnForm((p) => ({
                      ...p,
                      handoverId: e.target.value,
                      quantityReturned: String(out),
                    }));
                  }}
                  className={inputClass}
                >
                  {selectedEquipment.activeHandovers.map((h) => {
                    const out = Math.max(
                      0,
                      Number(h.quantity || 0) - Number(h.returnedQuantity || 0)
                    );
                    return (
                      <option key={h.id} value={h.id}>
                        {h.receivedByName} · {h.bookingLabel} · {out} unit(s) out
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Actual Return Date *
                </label>
                <input
                  required
                  type="date"
                  value={returnForm.actualReturnDate}
                  onChange={(e) =>
                    setReturnForm((p) => ({
                      ...p,
                      actualReturnDate: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Quantity Returned *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={returnForm.quantityReturned}
                  onChange={(e) =>
                    setReturnForm((p) => ({
                      ...p,
                      quantityReturned: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Equipment Condition
                </label>
                <select
                  value={returnForm.returnCondition}
                  onChange={(e) =>
                    setReturnForm((p) => ({
                      ...p,
                      returnCondition: e.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  {RETURN_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#385d89]">
                  Return Notes
                </label>
                <textarea
                  rows={2}
                  value={returnForm.returnNotes}
                  onChange={(e) =>
                    setReturnForm((p) => ({ ...p, returnNotes: e.target.value }))
                  }
                  placeholder="Condition notes or missing items"
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-[#e5edf7] pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#d6e7fa] px-5 py-2.5 text-sm font-bold text-[#607699]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 size={16} />
                Confirm Return
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW DETAILS & HANDOVER HISTORY MODAL */}
      {modal === "view" && selectedEquipment && (
        <Modal
          title={selectedEquipment.equipmentName}
          subtitle={`${selectedEquipment.equipmentCode} · ${selectedEquipment.category}`}
          icon={Camera}
          onClose={closeModal}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-[#e3ecf7] bg-[#f7faff] p-3">
                <p className="text-[10px] font-semibold text-[#607699]">Total Qty</p>
                <p className="mt-1 text-base font-black">{selectedEquipment.totalQuantity}</p>
              </div>
              <div className="rounded-xl border border-[#e3ecf7] bg-[#f7faff] p-3">
                <p className="text-[10px] font-semibold text-[#607699]">Available</p>
                <p className="mt-1 text-base font-black text-emerald-700">
                  {selectedEquipment.availableQuantity}
                </p>
              </div>
              <div className="rounded-xl border border-[#e3ecf7] bg-[#f7faff] p-3">
                <p className="text-[10px] font-semibold text-[#607699]">Assigned</p>
                <p className="mt-1 text-base font-black text-blue-700">
                  {selectedEquipment.assignedQuantity}
                </p>
              </div>
              <div className="rounded-xl border border-[#e3ecf7] bg-[#f7faff] p-3">
                <p className="text-[10px] font-semibold text-[#607699]">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusBadgeClass(
                    selectedEquipment.computedStatus
                  )}`}
                >
                  {selectedEquipment.computedStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#e3ecf7] bg-white p-4 text-xs sm:grid-cols-2">
              <div>
                <span className="text-[#607699]">Serial / ID: </span>
                <strong className="text-[#10264d]">
                  {selectedEquipment.serialNumber || selectedEquipment.equipmentCode}
                </strong>
              </div>
              <div>
                <span className="text-[#607699]">Event Assignment: </span>
                <strong className="text-[#10264d]">{selectedEquipment.displayEvent}</strong>
              </div>
              <div>
                <span className="text-[#607699]">Handed Over To: </span>
                <strong className="text-[#10264d]">{selectedEquipment.displayStaff}</strong>
              </div>
              <div>
                <span className="text-[#607699]">Handover Date: </span>
                <strong className="text-[#10264d]">
                  {formatDate(selectedEquipment.displayHandoverDate)}
                </strong>
              </div>
              <div>
                <span className="text-[#607699]">Expected Return: </span>
                <strong className="text-[#10264d]">
                  {formatDate(selectedEquipment.displayExpectedReturn)}
                </strong>
              </div>
              {selectedEquipment.description && (
                <div className="sm:col-span-2">
                  <span className="text-[#607699]">Description: </span>
                  <span className="text-[#10264d]">{selectedEquipment.description}</span>
                </div>
              )}
              {(selectedEquipment.handoverNotes || selectedEquipment.notes) && (
                <div className="sm:col-span-2">
                  <span className="text-[#607699]">Handover Notes: </span>
                  <span className="text-[#10264d]">
                    {selectedEquipment.handoverNotes || selectedEquipment.notes}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#10264d]">
                <CalendarDays size={16} className="text-[#24558d]" />
                Handover History ({selectedEquipment.handovers.length})
              </h3>

              {selectedEquipment.handovers.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#dce7f4] bg-[#f9fbff] p-6 text-center text-xs text-[#607699]">
                  No handover transactions recorded for this equipment yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedEquipment.handovers.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-2xl border border-[#dce7f4] bg-[#fbfdff] p-3.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold text-[#10264d]">
                          <UserRound size={14} className="text-[#24558d]" />
                          <span>{h.receivedByName}</span>
                          <span className="text-[11px] font-normal text-[#607699]">
                            · {h.bookingLabel}
                          </span>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadgeClass(
                            h.status
                          )}`}
                        >
                          {h.status}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#587298] sm:grid-cols-4">
                        <div>
                          Handed: <strong className="text-[#10264d]">{formatDate(h.handoverDate)}</strong>
                        </div>
                        <div>
                          Qty: <strong className="text-[#10264d]">{h.quantity}</strong> (Returned:{" "}
                          <strong className="text-[#10264d]">{h.returnedQuantity || 0}</strong>)
                        </div>
                        <div>
                          Expected: <strong className="text-[#10264d]">{formatDate(h.expectedReturnDate)}</strong>
                        </div>
                        <div>
                          Actual Return: <strong className="text-[#10264d]">{formatDate(h.actualReturnDate)}</strong>
                        </div>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#607699]">
                        <span>Handover By: <strong className="text-[#10264d]">{h.handoverBy}</strong></span>
                        {h.returnCondition && (
                          <span>Condition: <strong className="text-[#10264d]">{h.returnCondition}</strong></span>
                        )}
                        {h.notes && <span>Notes: {h.notes}</span>}
                        {h.returnNotes && <span>Return Notes: {h.returnNotes}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
      <DateRangeExportModal
        isOpen={showExportModal}
        moduleLabel="Equipment Management"
        allowFutureDates
        onClose={() => setShowExportModal(false)}
        onExport={handleExportCSV}
      />
    </div>
  );
}
