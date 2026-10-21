
import { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";

const STORAGE_KEY = "studioraw_deliveries";

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
  expectedDate: "",
  deliveredDate: "",
  assignedTo: "",
  paymentStatus: "Pending",
  status: "Pending",
  notes: "",
});

const events = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Pre-Wedding",
  "Baby Shoot",
  "Portrait",
  "Corporate",
  "Other",
];

const deliveryItems = [
  "Wedding Album",
  "Photo Album",
  "Edited Photos",
  "Wedding Video",
  "Photo & Video",
  "USB Drive",
  "Printed Frames",
  "Other",
];

const deliveryMethods = [
  "Studio Pickup",
  "Home Delivery",
  "Courier",
  "Digital Delivery",
];

const paymentStatuses = [
  "Pending",
  "Partial",
  "Paid",
];

const deliveryStatuses = [
  "Pending",
  "Packed",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

const statusColors = {
  Pending: "bg-amber-100 text-amber-700",
  Packed: "bg-indigo-100 text-indigo-700",
  Dispatched: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const paymentColors = {
  Pending: "bg-red-100 text-red-700",
  Partial: "bg-amber-100 text-amber-700",
  Paid: "bg-green-100 text-green-700",
};

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const formatDate = (date) => {
  if (!date) return "Not scheduled";

  const parsed = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

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

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {value}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="mt-2 max-h-60 w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          {options.map((option) => {
            const selected = value === option;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {selected && (
                  <Check
                    size={16}
                    className="shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="flex min-w-0 items-start gap-2">
        {Icon && (
          <Icon
            size={16}
            className="mt-0.5 shrink-0 text-blue-600"
          />
        )}

        <p className="min-w-0 break-words text-sm font-semibold text-[#10264d]">
          {value || "—"}
        </p>
      </div>
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

export default function Delivery() {
  const [deliveries, setDeliveries] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(
    createEmptyForm
  );

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(deliveries)
    );
  }, [deliveries]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const openCreate = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const openEdit = (delivery) => {
    setForm({
      ...createEmptyForm(),
      ...delivery,
    });

    setEditingId(delivery.id);
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
  };

  const saveDelivery = (event) => {
    event.preventDefault();

    if (!form.customer.trim()) {
      setError("Please enter customer name.");
      return;
    }

    const quantity = Number(form.quantity);

    if (
      String(form.quantity).trim() === "" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setError("Please enter a valid quantity.");
      return;
    }

    const phone = String(form.phone || "").trim();

    if (
      phone &&
      !/^[0-9]{10}$/.test(phone)
    ) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (
      form.status === "Delivered" &&
      !form.deliveredDate
    ) {
      setError(
        "Please enter the actual delivery date."
      );
      return;
    }

    const data = {
      ...form,
      customer: form.customer.trim(),
      phone,
      quantity,
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `DEL-${Date.now()}`,
    };

    if (editingId) {
      setDeliveries((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? data
            : item
        )
      );
    } else {
      setDeliveries((previous) => [
        data,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteDelivery = (id) => {
    if (
      !window.confirm(
        "Delete this delivery record?"
      )
    ) {
      return;
    }

    setDeliveries((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    if (editingId === id) {
      closeForm();
    }
  };

  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return deliveries.filter((item) => {
      const matches = [
        item.customer,
        item.phone,
        item.event,
        item.item,
        item.trackingNumber,
        item.assignedTo,
        item.courier,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matches &&
        (filter === "All" ||
          item.status === filter)
      );
    });
  }, [deliveries, search, filter]);

  const stats = [
    {
      title: "Total Deliveries",
      value: deliveries.length,
      icon: Package,
      color: "text-blue-700",
    },
    {
      title: "Pending Deliveries",
      value: deliveries.filter(
        (item) =>
          item.status === "Pending"
      ).length,
      icon: Clock3,
      color: "text-amber-600",
    },
    {
      title: "Dispatched",
      value: deliveries.filter(
        (item) =>
          item.status === "Dispatched"
      ).length,
      icon: Truck,
      color: "text-indigo-700",
    },
    {
      title: "Delivered",
      value: deliveries.filter(
        (item) =>
          item.status === "Delivered"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
    },
  ];

  const exportCSV = () => {
    const columns = [
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

      const safe = /^[\s]*[=+\-@]/.test(text)
        ? `'${text}`
        : text;

      return `"${safe.replace(/"/g, '""')}"`;
    };

    const csv = [
      columns.map(escapeCSV).join(","),
      ...filtered.map((item) =>
        columns
          .map((key) => escapeCSV(item[key]))
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF", csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "studioraw_deliveries.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Delivery Management
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Track album, photo and video deliveries.
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3">
          <button
            type="button"
            onClick={exportCSV}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            <Plus size={18} />
            New Delivery
          </button>
        </div>
      </div>

      {/* Statistics - Vertical */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
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

      {/* Delivery Records */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          Delivery Records
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
            placeholder="Search deliveries..."
            className={`${inputClass} pl-10`}
          />
        </div>

        {/* Filter */}
        <div className="mb-5 w-full min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Filter by Delivery Status
          </p>

          <CustomDropdown
            value={filter}
            options={["All", ...deliveryStatuses]}
            onChange={setFilter}
          />
        </div>

        {/* Delivery Cards */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Truck
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm text-slate-400">
              No delivery records found
            </p>
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-4">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
              >
                {/* Card Header */}
                <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-bold text-[#10264d]">
                      {item.customer}
                    </h3>

                    <p className="mt-1 break-words text-sm text-slate-500">
                      {item.event}
                    </p>
                  </div>

                  <span
                    className={`w-fit max-w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                      statusColors[item.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status || "Pending"}
                  </span>
                </div>

                {/* Delivery Details */}
                <Detail
                  label="Delivery Item"
                  value={item.item}
                  icon={Package}
                />

                <Detail
                  label="Quantity"
                  value={item.quantity}
                />

                <Detail
                  label="Phone Number"
                  value={item.phone || "No phone"}
                  icon={Phone}
                />

                <Detail
                  label="Delivery Method"
                  value={item.deliveryMethod}
                  icon={Truck}
                />

                {item.address && (
                  <Detail
                    label="Delivery Address"
                    value={item.address}
                    icon={MapPin}
                  />
                )}

                {item.courier && (
                  <Detail
                    label="Courier Company"
                    value={item.courier}
                    icon={Truck}
                  />
                )}

                {item.trackingNumber && (
                  <div className="w-full min-w-0 rounded-xl bg-blue-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Tracking Number
                    </p>

                    <p className="mt-2 break-all text-sm font-bold text-blue-800">
                      {item.trackingNumber}
                    </p>
                  </div>
                )}

                <Detail
                  label="Expected Delivery"
                  value={formatDate(item.expectedDate)}
                  icon={CalendarDays}
                />

                <Detail
                  label="Actual Delivery"
                  value={formatDate(item.deliveredDate)}
                  icon={CalendarDays}
                />

                <Detail
                  label="Assigned Staff"
                  value={
                    item.assignedTo ||
                    "Not assigned"
                  }
                  icon={UserRound}
                />

                {/* Payment Status */}
                <div className="flex w-full min-w-0 flex-col gap-2 rounded-xl bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Payment Status
                  </p>

                  <span
                    className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                      paymentColors[item.paymentStatus] ||
                      paymentColors.Pending
                    }`}
                  >
                    {item.paymentStatus || "Pending"}
                  </span>
                </div>

                {item.notes && (
                  <Detail
                    label="Delivery Notes"
                    value={item.notes}
                  />
                )}

                {/* Actions */}
                <div className="flex w-full flex-col gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      openEdit(item)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                  >
                    <Pencil size={17} />
                    Manage Delivery
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteDelivery(item.id)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                    Delete Delivery
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* New / Edit Delivery Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Manage Delivery"
                  : "New Delivery"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter customer and delivery information.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close delivery form"
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveDelivery}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Customer Name">
              <input
                type="text"
                required
                value={form.customer}
                onChange={(event) =>
                  update(
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
                value={form.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter 10-digit phone number"
                className={inputClass}
              />
            </FormField>

            <FormField label="Event Type">
              <CustomDropdown
                value={form.event}
                options={events}
                onChange={(value) =>
                  update("event", value)
                }
              />
            </FormField>

            <FormField label="Delivery Item">
              <CustomDropdown
                value={form.item}
                options={deliveryItems}
                onChange={(value) =>
                  update("item", value)
                }
              />
            </FormField>

            <FormField label="Delivery Method">
              <CustomDropdown
                value={form.deliveryMethod}
                options={deliveryMethods}
                onChange={(value) =>
                  update(
                    "deliveryMethod",
                    value
                  )
                }
              />
            </FormField>

            <FormField label="Quantity">
              <input
                type="number"
                min="1"
                step="1"
                required
                value={form.quantity}
                onChange={(event) =>
                  update(
                    "quantity",
                    event.target.value
                  )
                }
                placeholder="Enter quantity"
                className={inputClass}
              />
            </FormField>

            {form.deliveryMethod !== "Digital Delivery" &&
              form.deliveryMethod !== "Studio Pickup" && (
                <FormField label="Delivery Address">
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(event) =>
                      update(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Enter delivery address"
                    className={inputClass}
                  />
                </FormField>
              )}

            {form.deliveryMethod === "Courier" && (
              <>
                <FormField label="Courier Company">
                  <input
                    type="text"
                    value={form.courier}
                    onChange={(event) =>
                      update(
                        "courier",
                        event.target.value
                      )
                    }
                    placeholder="Enter courier company"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Tracking Number">
                  <input
                    type="text"
                    value={form.trackingNumber}
                    onChange={(event) =>
                      update(
                        "trackingNumber",
                        event.target.value
                      )
                    }
                    placeholder="Enter tracking number"
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
                  update(
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
                value={form.deliveredDate}
                onChange={(event) =>
                  update(
                    "deliveredDate",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Assigned Staff">
              <input
                type="text"
                value={form.assignedTo}
                onChange={(event) =>
                  update(
                    "assignedTo",
                    event.target.value
                  )
                }
                placeholder="Enter staff name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Payment Status">
              <CustomDropdown
                value={form.paymentStatus}
                options={paymentStatuses}
                onChange={(value) =>
                  update(
                    "paymentStatus",
                    value
                  )
                }
              />
            </FormField>

            <FormField label="Delivery Status">
              <CustomDropdown
                value={form.status}
                options={deliveryStatuses}
                onChange={(value) =>
                  update("status", value)
                }
              />
            </FormField>

            <FormField label="Delivery Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  update(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Special instructions..."
                className={inputClass}
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 break-words text-sm font-medium text-red-600"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                {error}
              </p>
            )}

            {/* Form Actions */}
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
                  ? "Update Delivery"
                  : "Save Delivery"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
