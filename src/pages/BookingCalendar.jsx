import React, { useCallback, useEffect, useMemo, useState } from "react";

import { createPortal } from "react-dom";

import { api } from "../api/client";

import { syncEnquiriesToBookings } from "../utils/enquiryBookingSync";

import { CalendarDays, CalendarCheck2, Clock3, CheckCircle2, Plus, Search, X, MapPin, UserRound, Camera, Trash2, Pencil, ChevronLeft, ChevronRight, Phone, Filter, Save, CalendarPlus, CalendarRange, ClipboardList, IndianRupee, Link2, RefreshCw, Download } from "lucide-react";



const STORAGE_KEY = "studioraw_bookings";

const CUSTOMER_KEY = "studio_raw_customers";

const PAYMENT_KEY = "studioraw_payments";

const ENQUIRY_KEYS = ["studioraw_enquiries", "studio_raw_enquiries"];

const UPDATE_EVENT = "studioraw:data-updated";

const services = ["Wedding Photography", "Wedding Videography", "Functions We Arrange", "Event Management", "Customer Gifts"];
const serviceEventTypes = {
  "Wedding Photography": ["Traditional Photography", "Candid Photography", "Helicam Photography", "Pre-Wedding Photography", "Post-Wedding Photography"],
  "Wedding Videography": ["Traditional Wedding Videography", "Cinematic Wedding Videography", "Traditional + Candid Video", "Pre-Wedding Video", "Post-Wedding Video", "Drone / Helicam Video"],
  "Functions We Arrange": ["Engagement", "Reception", "Wedding", "Birthday Function", "Baby Shower", "Naming Ceremony", "Corporate Function", "Other Function"],
  "Event Management": ["Wedding Event Management", "Engagement Event Management", "Birthday Event Management", "Corporate Event Management", "Stage & Decoration", "Other Event"],
  "Customer Gifts": ["Customized Photo Frame", "Album", "Mug Printing", "Customized Gifts", "Return Gifts", "Other Gift"]
};

const statuses = ["Confirmed", "Pending", "Completed", "Cancelled"];

const photographers = ["Rahul", "Karthik", "Arun", "Vignesh", "Sanjay", "Priya", "Divya", "Not Assigned"];

const locations = ["Nagercoil", "Marthandam", "Kanyakumari", "Chennai", "Tirunelveli", "Trivandrum", "Madurai", "Coimbatore", "Other"];

const emptyForm = { customerId: "", customer: "", phone: "", service: "Wedding Photography", event: "Traditional Photography", date: "", time: "10:00", location: "Nagercoil", photographer: "Not Assigned", totalAmount: "", status: "Confirmed", invoiceNumber: "", invoiceDate: new Date().toISOString().slice(0, 10), advance: "", paymentMethod: "Cash" };

const inputClass = "w-full min-w-0 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-[#6b99d5] focus:ring-2 focus:ring-blue-100";

const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#285a99] px-5 py-3 text-sm font-bold text-white hover:bg-[#173f74]";

const dateKey = d => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");

function parseDate(v) { if (!v) return null; const d = /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? new Date(`${v}T12:00:00`) : new Date(v); return Number.isNaN(d.getTime()) ? null : d; }

const formatDate = v => { const d = parseDate(v); return d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"; };

const formatTime = v => { if (!v) return "—"; const [h, m] = String(v).split(":").map(Number); return Number.isFinite(h) && Number.isFinite(m) ? new Date(2000, 0, 1, h, m).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : String(v); };

const amount = v => { const n = Number(String(v ?? 0).replace(/[₹,\s]/g, "")); return Number.isFinite(n) ? n : 0; };

const money = v => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount(v));

const normalizePhone = v => String(v || "").replace(/\D/g, "").slice(-10);

function readArray(key) { try { const p = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(p)) return p; for (const k of ["data", "records", "items", "list", "customers", "bookings", "payments", "enquiries"]) if (Array.isArray(p?.[k])) return p[k]; } catch {} return []; }

function notify(key) { window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { key, module: "bookings" } })); }

function writeArray(key, items) { localStorage.setItem(key, JSON.stringify(items)); notify(key); }

const customerName = c => String(c?.name || c?.customerName || c?.customer || "").trim();

const customerPhone = c => normalizePhone(c?.phone || c?.mobile || c?.contactNumber);

const paymentTotal = p => amount(p.total ?? p.totalAmount ?? p.total_amount ?? p.grandTotal ?? p.packageAmount ?? p.bookingAmount ?? p.amount);

function paymentReceived(p) {

  if (Array.isArray(p.transactions) && p.transactions.length) return p.transactions.reduce((sum, t) => { const status = String(t.status || "").toLowerCase(); if (["failed", "cancelled", "canceled", "void"].includes(status)) return sum; const n = amount(t.amount ?? t.paidAmount ?? t.received); return sum + (status === "refunded" || String(t.type || "").toLowerCase() === "refund" ? -n : n); }, 0);

  return amount(p.paidAmount ?? p.paid_amount ?? p.amountPaid ?? p.receivedAmount ?? p.amountReceived ?? p.totalPaid ?? p.advance ?? p.advanceAmount);

}

function paymentBookingId(p) { const id = p.bookingId ?? p.booking_id ?? p.booking; return id && typeof id === "object" ? id.id : id; }

function financialsFor(booking, payments) {

  const invoices = payments.filter(p => paymentBookingId(p) != null && String(paymentBookingId(p)) === String(booking.id));

  const billed = invoices.reduce((s, p) => s + paymentTotal(p), 0);

  const received = invoices.reduce((s, p) => s + paymentReceived(p), 0);

  const total = amount(booking.totalAmount) || billed;

  return { invoices, billed: total, received, pending: Math.max(0, total - received), paymentStatus: !invoices.length ? "Not Invoiced" : total > 0 && received >= total ? "Paid" : received > 0 ? "Partial" : "Pending" };

}

function mergeRemotePayments(local, remote) {

  const byId = new Map(local.map(p => [String(p.id), p]));

  for (const p of remote) {

    const old = byId.get(String(p.id)) || {};

    byId.set(String(p.id), { ...old, id: p.id, invoice: p.transaction_id || old.invoice || `SRP-${p.id}`, bookingId: paymentBookingId(p) ?? old.bookingId ?? "", customer: p.customer_name || old.customer || "", total: amount(p.total_amount ?? p.amount ?? old.total), advance: amount(p.paid_amount ?? old.advance), paid_amount: amount(p.paid_amount ?? old.advance), method: p.payment_method || old.method || "Cash", date: p.payment_date || old.date || "", status: p.status || old.status || "Pending", transactions: Array.isArray(old.transactions) && old.transactions.length && Math.abs(paymentReceived(old) - amount(p.paid_amount)) < 0.01 ? old.transactions : [] });

  }

  return [...byId.values()];

}

const statusTheme = { Confirmed: "border-blue-200 bg-blue-50 text-blue-700", Pending: "border-amber-200 bg-amber-50 text-amber-700", Completed: "border-emerald-200 bg-emerald-50 text-emerald-700", Cancelled: "border-rose-200 bg-rose-50 text-rose-700" };

function StatusBadge({ status }) { return <span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold ${statusTheme[status] || statusTheme.Pending}`}>{status || "Pending"}</span>; }

function PaymentBadge({ status }) { const styles = { Paid: "bg-emerald-50 text-emerald-700 border-emerald-200", Partial: "bg-blue-50 text-blue-700 border-blue-200", Pending: "bg-amber-50 text-amber-700 border-amber-200", "Not Invoiced": "bg-slate-50 text-slate-600 border-slate-200" }; return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status] || styles["Not Invoiced"]}`}>{status}</span>; }

function PaymentSummary({ booking, financials }) { const total = amount(booking.totalAmount) || financials?.billed || 0; return <div className="mt-3 rounded-xl border border-[#dce9f8] bg-white/80 p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-black text-[#173f74]">Payment Summary</p><PaymentBadge status={financials?.paymentStatus || "Not Invoiced"}/></div><div className="mt-3 grid grid-cols-3 gap-2">{[["Total", total], ["Received", financials?.received || 0], ["Pending", financials?.pending ?? total]].map(([label, value]) => <div key={label} className="min-w-0 rounded-xl bg-[#edf5ff] p-2"><p className="text-[10px] text-[#7890ac]">{label}</p><p className="mt-1 break-words text-xs font-black text-[#173f74]">{money(value)}</p></div>)}</div></div>; }

function BookingCard({ booking, index, onEdit, onDelete, onStatus, onInvoice, financials }) { return <article className="sr-booking-card min-w-0 rounded-[20px] border border-[#d5e5fa] bg-gradient-to-br from-[#e8f2ff] via-[#f1f7ff] to-[#e2efff] p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7694b9]">Booking {String(index + 1).padStart(2, "0")}</p><h3 className="mt-2 truncate text-base font-black text-[#173f74]">{booking.customer || "Customer"}</h3></div><StatusBadge status={booking.status}/></div><div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#d3e4f8] pt-4">{[["Event Type", booking.event], ["Event Date", formatDate(booking.date)], ["Time", formatTime(booking.time)], ["Location", booking.location]].map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border border-[#dce9f8] bg-white/90 p-3"><p className="text-[10px] font-bold uppercase text-[#8a9fba]">{label}</p><p className="mt-1.5 break-words text-xs font-extrabold text-[#285a99]">{value || "—"}</p></div>)}</div><div className="mt-4 flex items-center gap-2"><button type="button" title="Download Invoice" onClick={() => onInvoice?.(booking)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-xs font-bold text-emerald-700"><Download size={16}/>Download Invoice</button><select value={booking.status || "Pending"} onChange={e => onStatus(booking.id, e.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#cfdef2] bg-white px-3 py-2.5 text-xs font-bold text-[#285a99]">{statuses.map(s => <option key={s}>{s}</option>)}</select><button type="button" onClick={() => onEdit(booking)} className="rounded-xl border bg-white p-2.5 text-[#356cae]"><Pencil size={17}/></button><button type="button" onClick={() => onDelete(booking.id)} className="rounded-xl border bg-white p-2.5 text-[#d65c72]"><Trash2 size={17}/></button></div></article>; }

function ModalShell({ title, subtitle, icon: Icon, onClose, children }) { useEffect(() => { const prev = document.body.style.overflow; document.body.style.overflow = "hidden"; const onKey = e => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", onKey); return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); }; }, [onClose]); return createPortal(<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07182f]/65 p-3 backdrop-blur-[3px] sm:p-5" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" className="flex max-h-[94dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-[25px] bg-white shadow-2xl"><div className="flex shrink-0 items-center justify-between border-b border-[#dce8f8] bg-gradient-to-r from-[#d5e7ff] to-[#f4f9ff] p-5 sm:px-7"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#b5d3fa] p-3 text-[#285a99]"><Icon size={22}/></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6686ad]">Studio Raw Picturez</p><h2 className="mt-1 text-lg font-black text-[#173f74]">{title}</h2>{subtitle && <p className="mt-1 text-xs text-[#6586ad]">{subtitle}</p>}</div></div><button type="button" onClick={onClose} className="rounded-xl bg-white p-2.5 text-[#55779e]"><X size={18}/></button></div>{children}</div></div>, document.body); }

function BookingModal({ booking, customers, payments, onClose, onSave }) {
  const initial = { ...emptyForm, ...booking, totalAmount: booking?.totalAmount ?? "" };
  if (!initial.service) initial.service = services.includes(initial.event) ? initial.event : "Wedding Photography";
  const allowedEvents = serviceEventTypes[initial.service] || serviceEventTypes["Wedding Photography"];
  if (!allowedEvents.includes(initial.event)) initial.event = allowedEvents[0];
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const financials = booking?.id ? financialsFor(booking, payments) : null;
  const update = (key, value) => { setForm(p => ({ ...p, [key]: value })); setError(""); };
  const changeService = service => setForm(p => ({ ...p, service, event: (serviceEventTypes[service] || [])[0] || "" }));
  const selectCustomer = id => { const c = customers.find(x => String(x.id) === String(id)); setForm(p => ({ ...p, customerId: c ? String(c.id) : "", ...(c ? { customer: customerName(c), phone: customerPhone(c) } : {}) })); };
  const submit = e => {
    e.preventDefault();
    const name = String(form.customer || "").trim(), phone = normalizePhone(form.phone);
    if (!name) return setError("Enter customer name.");
    if (phone.length !== 10) return setError("Enter valid 10-digit phone number.");
    if (!parseDate(form.date) || !form.time) return setError("Select valid booking date and time.");
    if (amount(form.totalAmount) < 0 || amount(form.advance) < 0) return setError("Enter valid invoice amount.");
    if (amount(form.advance) > amount(form.totalAmount)) return setError("Advance cannot be greater than total amount.");
    const match = customers.find(c => String(c.id) === String(form.customerId) && form.customerId) || customers.find(c => customerPhone(c) === phone);
    onSave({ ...form, customerId: match ? String(match.id) : "", customer: name, phone, totalAmount: amount(form.totalAmount), advance: amount(form.advance) });
  };
  const fields = [["Customer Name", "customer", UserRound, "text"], ["Phone Number", "phone", Phone, "tel"], ["Booking Date", "date", CalendarDays, "date"], ["Booking Time", "time", Clock3, "time"], ["Location", "location", MapPin, locations], ["Photographer", "photographer", Camera, photographers], ["Booking Status", "status", CheckCircle2, statuses]];
  return <ModalShell title={booking?.id ? "Edit Booking" : "New Booking"} subtitle="Booking details and invoice form" icon={CalendarPlus} onClose={onClose}>
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#f8fbff] px-5 py-6 sm:px-7">
        <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><Link2 size={14}/>Select Existing Customer</span><select value={form.customerId || ""} onChange={e => selectCustomer(e.target.value)} className={inputClass}><option value="">Select customer / Enter manually</option>{customers.map(c => <option key={c.id} value={String(c.id)}>{customerName(c)} - {customerPhone(c)}</option>)}</select></label>
        {fields.slice(0, 2).map(([label, key, Icon, kind]) => <label key={key} className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><Icon size={14}/>{label}</span><input className={inputClass} type={kind} required value={form[key] || ""} onChange={e => { const value = key === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value; setForm(p => ({ ...p, [key]: value, customerId: "" })); setError(""); }}/></label>)}
        <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><Camera size={14}/>Service</span><select className={inputClass} value={form.service} onChange={e => changeService(e.target.value)}>{services.map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><ClipboardList size={14}/>Event Type</span><select className={inputClass} value={form.event} onChange={e => update("event", e.target.value)}>{(serviceEventTypes[form.service] || []).map(v => <option key={v}>{v}</option>)}</select></label>
        {fields.slice(2).map(([label, key, Icon, kind]) => <label key={key} className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><Icon size={14}/>{label}</span>{Array.isArray(kind) ? <select className={inputClass} value={form[key] || ""} onChange={e => update(key, e.target.value)}>{kind.map(v => <option key={v}>{v}</option>)}</select> : <input className={inputClass} type={kind} required={key === "date" || key === "time"} value={form[key] || ""} onChange={e => update(key, e.target.value)}/>}</label>)}
        <section className="space-y-4 rounded-2xl border border-[#cbdcf2] bg-white p-4 sm:p-5"><div><p className="text-sm font-black text-[#173f74]">Invoice Form</p><p className="mt-1 text-xs text-[#7890ac]">Booking invoice and advance payment details</p></div>
          <label className="block"><span className="mb-2 block text-xs font-bold text-[#38506f]">Invoice Number</span><input className={inputClass} value={form.invoiceNumber || ""} placeholder="Auto generate if empty" onChange={e => update("invoiceNumber", e.target.value)}/></label>
          <label className="block"><span className="mb-2 block text-xs font-bold text-[#38506f]">Invoice Date</span><input className={inputClass} type="date" value={form.invoiceDate || ""} onChange={e => update("invoiceDate", e.target.value)}/></label>
          <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><IndianRupee size={14}/>Total Invoice Amount (₹)</span><input className={inputClass} type="number" min="0" step="0.01" value={form.totalAmount ?? ""} onChange={e => update("totalAmount", e.target.value)}/></label>
          <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><IndianRupee size={14}/>Advance Received (₹)</span><input className={inputClass} type="number" min="0" step="0.01" value={form.advance ?? ""} onChange={e => update("advance", e.target.value)}/></label>
          <label className="block"><span className="mb-2 block text-xs font-bold text-[#38506f]">Payment Method</span><select className={inputClass} value={form.paymentMethod || "Cash"} onChange={e => update("paymentMethod", e.target.value)}>{["Cash", "UPI", "Card", "Bank Transfer", "Cheque", "Other"].map(v => <option key={v}>{v}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#edf5ff] p-3"><p className="text-[10px] text-[#7890ac]">Received</p><p className="mt-1 font-black text-[#173f74]">{money(form.advance)}</p></div><div className="rounded-xl bg-[#fff4df] p-3"><p className="text-[10px] text-[#9b7a43]">Balance</p><p className="mt-1 font-black text-[#9b6416]">{money(Math.max(0, amount(form.totalAmount) - amount(form.advance)))}</p></div></div>
        </section>
        {booking?.id && <PaymentSummary booking={booking} financials={financials}/>}{error && <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</p>}
      </div>
      <div className="flex flex-col-reverse gap-3 border-t bg-white px-5 py-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border px-6 py-3 text-sm font-bold text-[#5b7190]">Cancel</button><button type="submit" className={buttonClass}><Save size={17}/>Save Booking</button></div>
    </form>
  </ModalShell>;
}
function InvoicePreview({ booking, invoice, onClose }) {
  const total = amount(invoice?.total ?? booking?.totalAmount);
  const received = paymentReceived(invoice || {});
  const invoiceNo = invoice?.invoice || invoice?.transaction_id || booking?.invoiceNumber || `SRP-${booking?.id}`;
  return <ModalShell title="Booking Invoice" subtitle={`Invoice ${invoiceNo}`} icon={IndianRupee} onClose={onClose}>
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fbff] p-5 sm:p-7">
      <div id="sr-booking-invoice" className="rounded-2xl border border-[#dce8f8] bg-white p-5 text-[#173f74]">
        <div className="flex items-start justify-between gap-3 border-b pb-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#7890ac]">Studio Raw Picturez</p><h3 className="mt-2 text-xl font-black">INVOICE</h3></div><div className="text-right text-xs"><p><b>Invoice No:</b> {invoiceNo}</p><p className="mt-1"><b>Date:</b> {formatDate(invoice?.date || booking?.invoiceDate || booking?.createdAt)}</p></div></div>
        <div className="grid grid-cols-2 gap-4 py-5 text-sm"><div><p className="text-xs text-[#7890ac]">Bill To</p><p className="mt-1 font-bold">{booking?.customer || invoice?.customer || "—"}</p><p>{booking?.phone || invoice?.phone || "—"}</p></div><div><p className="text-xs text-[#7890ac]">Booking Details</p><p className="mt-1 font-bold">{booking?.service || invoice?.service || "Photography Service"}</p><p>{booking?.event || invoice?.event || "—"}</p><p>{formatDate(booking?.date)}</p></div></div>
        <div className="border-y py-4"><div className="flex justify-between text-sm"><span>{booking?.event || invoice?.event || "Booking Service"}</span><b>{money(total)}</b></div></div>
        <div className="ml-auto mt-4 max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span>Total Amount</span><b>{money(total)}</b></div><div className="flex justify-between"><span>Advance / Received</span><b>{money(received)}</b></div><div className="flex justify-between border-t pt-2 text-base"><span>Balance</span><b>{money(Math.max(0, total - received))}</b></div><p className="text-right text-xs text-[#7890ac]">Payment: {invoice?.method || invoice?.payment_method || booking?.paymentMethod || "—"}</p></div>
      </div>
    </div><div className="flex justify-end gap-2 border-t bg-white p-4"><button type="button" onClick={onClose} className="rounded-xl border px-5 py-3 text-sm font-bold">Close</button><button type="button" onClick={() => window.print()} className={buttonClass}><Download size={17}/>Download Invoice (PDF)</button></div>
  </ModalShell>;
}

function DateBookingsModal({ date, bookings, financialMap, onClose, onEdit, onNew }) { return <ModalShell title="Booked Customer Details" subtitle={`${formatDate(date)} · ${bookings.length} bookings`} icon={CalendarCheck2} onClose={onClose}><div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8fbff] p-4 sm:p-6">{bookings.map((b, i) => <div key={b.id} className="rounded-2xl border border-[#dce8f8] bg-white p-4"><div className="flex items-center justify-between gap-2"><div><p className="text-[10px] font-extrabold text-[#8a9fba]">BOOKING {i + 1}</p><h3 className="mt-1 font-black text-[#173f74]">{b.customer}</h3></div><StatusBadge status={b.status}/></div><div className="mt-4 space-y-2">{[["Phone", b.phone], ["Event", b.event], ["Date", formatDate(b.date)], ["Time", formatTime(b.time)], ["Location", b.location], ["Photographer", b.photographer]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-[#e5edf8] py-2 text-xs"><span className="text-[#7890ac]">{label}</span><strong className="text-right text-[#173f74]">{value || "—"}</strong></div>)}</div><PaymentSummary booking={b} financials={financialMap.get(String(b.id))}/><button type="button" onClick={() => onEdit(b)} className={`${buttonClass} mt-4 w-full`}><Pencil size={16}/>Edit Booking</button></div>)}</div><div className="flex justify-end gap-2 border-t bg-white p-4"><button type="button" onClick={onClose} className="rounded-xl border px-5 py-3 text-sm font-bold">Close</button><button type="button" onClick={onNew} className={buttonClass}><Plus size={17}/>Add Another Booking</button></div></ModalShell>; }

function mapBooking(b) { return { id: b.id, customerId: b.customer ?? b.customerId ?? "", customer: b.customer_name || b.customerName || (typeof b.customer === "string" && !/^\d+$/.test(b.customer) ? b.customer : "") || "Customer", phone: b.phone || "", event: b.event_type || b.event || "Wedding Photography", date: b.event_date || b.date || "", time: b.time || "10:00", location: b.location || "Nagercoil", photographer: b.photographer || "Not Assigned", totalAmount: amount(b.total_amount ?? b.totalAmount), status: b.status || "Pending", createdAt: b.created_at || b.createdAt || "", updatedAt: b.updated_at || b.updatedAt || "" }; }

export default function BookingCalendar() {

  const [bookings, setBookings] = useState(() => readArray(STORAGE_KEY));

  const [customers, setCustomers] = useState(() => readArray(CUSTOMER_KEY));

  const [payments, setPayments] = useState(() => readArray(PAYMENT_KEY));

  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const [showForm, setShowForm] = useState(false), [editingBooking, setEditingBooking] = useState(null), [selectedDate, setSelectedDate] = useState(null), [invoiceBooking, setInvoiceBooking] = useState(null);

  const [search, setSearch] = useState(""), [filter, setFilter] = useState("All"), [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {

    setCustomers(readArray(CUSTOMER_KEY));

    setBookings(readArray(STORAGE_KEY));

    setPayments(readArray(PAYMENT_KEY));

    try { const res = await api.bookings.list(); const items = Array.isArray(res) ? res : res?.results; if (Array.isArray(items) && items.length) { const local = readArray(STORAGE_KEY); const byId = new Map(local.map(b => [String(b.id), b])); for (const item of items) { const old = byId.get(String(item.id)) || {}; byId.set(String(item.id), { ...old, ...mapBooking(item), customer: item.customer_name || old.customer || mapBooking(item).customer }); } const merged = [...byId.values()]; setBookings(merged); localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } } catch (e) { console.warn("Bookings API unavailable:", e); }

    try { const res = await api.payments.list(); const items = Array.isArray(res) ? res : res?.results; if (Array.isArray(items)) { const merged = mergeRemotePayments(readArray(PAYMENT_KEY), items); setPayments(merged); localStorage.setItem(PAYMENT_KEY, JSON.stringify(merged)); } } catch (e) { console.warn("Payments API unavailable:", e); }

  }, []);

  useEffect(() => { syncEnquiriesToBookings(); refresh(); const onChange = () => { setCustomers(readArray(CUSTOMER_KEY)); setBookings(readArray(STORAGE_KEY)); setPayments(readArray(PAYMENT_KEY)); }; const onFocus = () => { refresh(); }; window.addEventListener(UPDATE_EVENT, onChange); window.addEventListener("storage", onChange); window.addEventListener("focus", onFocus); return () => { window.removeEventListener(UPDATE_EVENT, onChange); window.removeEventListener("storage", onChange); window.removeEventListener("focus", onFocus); }; }, [refresh]);

  const commit = next => { try { writeArray(STORAGE_KEY, next); setBookings(next); return true; } catch (e) { console.error(e); alert("Unable to save bookings."); return false; } };

  const financialMap = useMemo(() => new Map(bookings.map(b => [String(b.id), financialsFor(b, payments)])), [bookings, payments]);

  const stats = [["Total Bookings", bookings.length, CalendarDays], ["Confirmed", bookings.filter(b => String(b.status).toLowerCase() === "confirmed").length, CalendarCheck2], ["Pending", bookings.filter(b => String(b.status).toLowerCase() === "pending").length, Clock3], ["Completed", bookings.filter(b => String(b.status).toLowerCase() === "completed").length, CheckCircle2]];

  const filtered = useMemo(() => bookings.filter(b => [b.customer, b.phone, b.event, b.location, b.photographer, b.id].some(v => String(v || "").toLowerCase().includes(search.trim().toLowerCase())) && (filter === "All" || String(b.status || "").toLowerCase() === filter.toLowerCase())), [bookings, search, filter]);

  const upcoming = useMemo(() => bookings.filter(b => { const d = parseDate(b.date); return d && dateKey(d) >= dateKey(new Date()) && !["completed", "cancelled", "canceled"].includes(String(b.status || "").toLowerCase()); }).sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time))).slice(0, 6), [bookings]);

  const bookingMap = useMemo(() => { const m = new Map(); for (const b of bookings) { const d = parseDate(b.date); if (!d) continue; const key = dateKey(d); if (!m.has(key)) m.set(key, []); m.get(key).push(b); } return m; }, [bookings]);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1), daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const cells = [...Array(firstDay.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]; while (cells.length % 7) cells.push(null);

  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  const monthlyCount = bookings.filter(b => String(b.date || "").startsWith(prefix)).length;

  const openNew = (date = "") => { setEditingBooking({ ...emptyForm, date }); setSelectedDate(null); setShowForm(true); };

  const openEdit = b => { setEditingBooking({ ...b }); setSelectedDate(null); setShowForm(true); };

  const openInvoice = b => setInvoiceBooking(b);

  const closeForm = useCallback(() => { setShowForm(false); setEditingBooking(null); }, []);

  const saveBooking = async data => { const now = new Date().toISOString(); const currentCustomers = readArray(CUSTOMER_KEY); const phone = String(data.phone || "").replace(/\D/g, "").slice(-10); const customerMatch = currentCustomers.find(c => (data.customerId && String(c.id) === String(data.customerId)) || (phone && String(c.phone || "").replace(/\D/g, "").slice(-10) === phone)); let customerId = customerMatch ? String(customerMatch.id) : (data.customerId || ""); if (!customerMatch && data.customer) { customerId = `CUS-${Date.now()}`; const newCust = { id: customerId, name: data.customer.trim(), phone: data.phone || "", email: "", address: data.location || "", source: "Booking", notes: `Created from Booking: ${data.event}`, createdAt: now.slice(0, 10), updatedAt: now, isDemo: false }; const nextCusts = [newCust, ...currentCustomers]; localStorage.setItem(CUSTOMER_KEY, JSON.stringify(nextCusts)); notify(CUSTOMER_KEY); setCustomers(nextCusts); } const bookingData = { ...data, customerId }; const payload = { customer_name: bookingData.customer, phone: bookingData.phone, event_type: bookingData.event, event_date: bookingData.date || null, location: bookingData.location || "", total_amount: bookingData.totalAmount || 0, status: bookingData.status || "Pending", notes: bookingData.photographer ? `Photographer: ${bookingData.photographer}` : "" }; const saveInvoice = bookingId => { if (!bookingData.invoiceNumber && !bookingData.totalAmount && !bookingData.advance) return; const oldPayments = readArray(PAYMENT_KEY); const existing = oldPayments.find(p => String(paymentBookingId(p) || "") === String(bookingId)); const invoice = { ...(existing || {}), id: existing?.id || `PAY-${Date.now()}`, invoice: bookingData.invoiceNumber || existing?.invoice || `SRP-${Date.now()}`, bookingId, customer: bookingData.customer, phone: bookingData.phone, total: amount(bookingData.totalAmount), paidAmount: amount(bookingData.advance), advance: amount(bookingData.advance), method: bookingData.paymentMethod || "Cash", date: bookingData.invoiceDate || now.slice(0, 10), status: amount(bookingData.advance) >= amount(bookingData.totalAmount) && amount(bookingData.totalAmount) > 0 ? "Paid" : amount(bookingData.advance) > 0 ? "Partial" : "Pending", service: bookingData.service, event: bookingData.event }; const nextPayments = existing ? oldPayments.map(p => String(p.id) === String(existing.id) ? invoice : p) : [invoice, ...oldPayments]; writeArray(PAYMENT_KEY, nextPayments); setPayments(nextPayments); }; if (editingBooking?.id) { try { await api.bookings.update(editingBooking.id, payload); } catch (err) { console.warn("Backend booking update:", err); setNotice("Booking updated locally. Backend update needs checking."); } const updated = { ...editingBooking, ...bookingData, updatedAt: now }; saveInvoice(updated.id); if (commit(bookings.map(b => String(b.id) === String(updated.id) ? updated : b))) closeForm(); return; } let id = globalThis.crypto?.randomUUID?.() || `BOOK-${Date.now()}`; try { const remote = await api.bookings.create(payload); if (remote?.id) id = remote.id; } catch (err) { console.warn("Backend booking create:", err); setNotice("Booking saved locally. Backend create needs checking."); } saveInvoice(id); if (commit([{ ...bookingData, id, createdAt: now, updatedAt: now }, ...bookings])) closeForm(); };

  const deleteBooking = async id => { if (payments.some(p => String(paymentBookingId(p) || "") === String(id))) return alert("This booking has a linked payment invoice. Unlink invoice before deleting."); if (!confirm("Delete this booking?")) return; try { await api.bookings.delete(id); } catch (err) { console.warn("Backend booking delete:", err); setNotice("Booking deleted locally. Check backend deletion."); } commit(bookings.filter(b => String(b.id) !== String(id))); };

  const changeStatus = async (id, status) => {
    const target = bookings.find(b => String(b.id) === String(id));
    try { await api.bookings.update(id, { status }); } catch (err) { console.warn("Backend booking status:", err); }
    const updatedBooking = target ? { ...target, status } : null;
    commit(bookings.map(b => String(b.id) === String(id) ? { ...b, status } : b));
    if (updatedBooking && String(status).toLowerCase() === "confirmed") {
      // Create a pending payment/invoice record as soon as the booking is confirmed.
      // Keep an existing payment record intact so received amounts are never reset.
      const currentPayments = readArray(PAYMENT_KEY);
      const linkedPayment = currentPayments.find(p => String(paymentBookingId(p) ?? "") === String(updatedBooking.id));
      if (!linkedPayment) {
        const pendingInvoice = {
          id: `PAY-${Date.now()}`,
          invoice: updatedBooking.invoiceNumber || `SRP-${Date.now()}`,
          transaction_id: updatedBooking.invoiceNumber || `SRP-${Date.now()}`,
          bookingId: updatedBooking.id,
          booking_id: updatedBooking.id,
          customer: updatedBooking.customer || "Customer",
          customer_name: updatedBooking.customer || "Customer",
          phone: updatedBooking.phone || "",
          total: amount(updatedBooking.totalAmount),
          total_amount: amount(updatedBooking.totalAmount),
          amount: amount(updatedBooking.totalAmount),
          paidAmount: 0,
          paid_amount: 0,
          advance: 0,
          method: updatedBooking.paymentMethod || "Cash",
          payment_method: updatedBooking.paymentMethod || "Cash",
          date: new Date().toISOString().slice(0, 10),
          payment_date: new Date().toISOString().slice(0, 10),
          status: "Pending",
          service: updatedBooking.service || "",
          event: updatedBooking.event || "",
          event_type: updatedBooking.event || "",
          source: "Booking Confirmation",
        };
        const nextPayments = [pendingInvoice, ...currentPayments];
        writeArray(PAYMENT_KEY, nextPayments);
        setPayments(nextPayments);
      }
      const current = readArray(CUSTOMER_KEY);
      const phone = normalizePhone(updatedBooking.phone);
      const match = current.find(c => (updatedBooking.customerId && String(c.id) === String(updatedBooking.customerId)) || (phone && customerPhone(c) === phone));
      const customerId = match?.id || updatedBooking.customerId || `CUS-${Date.now()}`;
      const customerRecord = { ...(match || {}), id: customerId, name: updatedBooking.customer || customerName(match), customerName: updatedBooking.customer || customerName(match), phone: updatedBooking.phone || match?.phone || "", address: updatedBooking.location || match?.address || "", source: match?.source || "Booking", status: "Confirmed", bookingStatus: "Confirmed", bookingId: updatedBooking.id, event: updatedBooking.event, eventDate: updatedBooking.date, service: updatedBooking.service || "", updatedAt: new Date().toISOString(), isDemo: false };
      const nextCustomers = match ? current.map(c => String(c.id) === String(match.id) ? customerRecord : c) : [customerRecord, ...current];
      writeArray(CUSTOMER_KEY, nextCustomers); setCustomers(nextCustomers);
    }
  };

  return <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f9fd] px-3 py-5 text-[#10264d] sm:px-5 lg:px-7"><style>{`@keyframes srFloat3D{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}.sr-stat-float{animation:srFloat3D 5.5s ease-in-out infinite}.sr-booking-card{transition:transform .3s,box-shadow .3s}.sr-booking-card:hover{transform:translateY(-4px);box-shadow:0 18px 35px rgba(22,53,96,.12)}@media(prefers-reduced-motion:reduce){.sr-stat-float{animation:none}.sr-booking-card:hover{transform:none}}`}</style><div className="mx-auto max-w-[1800px] space-y-6"><div className="flex justify-end gap-2"><button type="button" onClick={refresh} className="inline-flex items-center gap-2 rounded-xl border border-[#d5e5f5] bg-white px-4 py-3 text-sm font-bold text-[#285a99]"><RefreshCw size={17}/>Refresh Payments</button><button type="button" onClick={() => openNew()} className={buttonClass}><Plus size={18}/>New Booking</button></div>{notice && <div className="flex justify-between rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{notice}<button onClick={() => setNotice("")}><X size={16}/></button></div>}<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([title, value, Icon], i) => <div key={title} className={`sr-stat-float rounded-[22px] border p-4 shadow-sm sm:p-5 ${["border-blue-200 bg-[#deedff]", "border-purple-200 bg-[#ede3ff]", "border-amber-200 bg-[#fff0cf]", "border-emerald-200 bg-[#dcf8e9]"][i]}`}><div className="flex justify-between gap-2"><div><p className="text-xs font-bold text-[#526781]">{title}</p><h2 className="mt-3 text-3xl font-black text-[#10264d]">{value.toLocaleString("en-IN")}</h2><p className="mt-3 text-[10px] text-[#61758d]">Studio booking overview</p></div><div className="rounded-2xl bg-white/50 p-3 text-[#285a99]"><Icon size={22}/></div></div></div>)}</div><section className="overflow-hidden rounded-[26px] border border-[#dce6f4] bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-[#e8eef7] bg-gradient-to-r from-[#f1f7ff] via-white to-[#f8f4ff] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#e4efff] p-3 text-[#2e65a7]"><CalendarRange size={26}/></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#8298b7]">Photography Calendar</p><h2 className="text-2xl font-black text-[#10264d]">{month.toLocaleString("en-IN", { month: "long", year: "numeric" })}</h2><p className="text-xs text-[#8194ae]">Click booked date to view details</p></div></div><div className="flex items-center gap-2"><div className="rounded-xl border bg-white px-3 py-2 text-center"><p className="font-black">{monthlyCount}</p><p className="text-[10px] text-[#8a9bb0]">Monthly Bookings</p></div><button className="rounded-xl border bg-white p-2" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}><ChevronLeft size={19}/></button><button className={buttonClass} onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button><button className="rounded-xl border bg-white p-2" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}><ChevronRight size={19}/></button></div></div><div className="flex flex-wrap gap-4 border-b p-4">{statuses.map(s => <span key={s} className="text-xs font-semibold text-[#657992]"><span className="mr-2">●</span>{s}</span>)}</div><div className="bg-[#fcfdff] p-2.5 sm:p-5"><div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="rounded-xl bg-[#edf4ff] py-3 text-center text-[10px] font-bold text-[#5679a4] sm:text-xs">{d}</div>)}{cells.map((day, i) => { if (!day) return <div key={`empty-${i}`} className="min-h-[78px] rounded-xl border border-dashed border-[#edf1f7] bg-[#f8faff] sm:min-h-[125px]"/>; const date = dateKey(new Date(month.getFullYear(), month.getMonth(), day)), dayBookings = bookingMap.get(date) || [], isToday = date === dateKey(new Date()); return <button key={date} type="button" onClick={() => dayBookings.length ? setSelectedDate(date) : openNew(date)} className={`min-h-[78px] min-w-0 rounded-xl border p-1.5 text-left transition hover:bg-[#f0f7ff] sm:min-h-[125px] sm:p-3 ${isToday ? "border-[#9fbfea] bg-[#eff6ff]" : "border-[#e8edf5] bg-white"}`}><div className="flex items-center justify-between"><span className={`rounded-lg px-2 py-1 text-xs font-black ${isToday ? "bg-[#285a99] text-white" : "bg-[#f0f5fc] text-[#47617f]"}`}>{day}</span>{dayBookings.length > 0 && <span className="rounded-lg bg-[#e9f3ff] px-1 text-[9px] font-black text-[#3c6fae]">{dayBookings.length}</span>}</div><div className="mt-2 hidden space-y-1 sm:block">{dayBookings.slice(0, 2).map(b => <div key={b.id} className="truncate rounded-md bg-[#e7f0ff] px-2 py-1 text-[10px] font-bold text-[#245da4]">{b.customer}</div>)}{dayBookings.length > 2 && <p className="text-[10px]">+{dayBookings.length - 2} more</p>}</div>{dayBookings.length > 0 && <div className="mt-2 flex gap-1 sm:hidden">{dayBookings.slice(0, 4).map(b => <span key={b.id} className="h-1.5 w-1.5 rounded-full bg-blue-500"/>)}</div>}</button>; })}</div></div><div className="border-t bg-[#f9fbff] p-4 text-center text-[11px] text-[#8b9db4]">Booked date: view details · Empty date: new booking</div></section><section className="overflow-hidden rounded-[25px] border border-[#d4e4fa] bg-[#f8fbff]"><div className="flex items-center justify-between bg-gradient-to-r from-[#d5e7ff] to-[#f0f7ff] p-5"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#557aa9]">Studio Schedule</p><h2 className="text-xl font-black text-[#173f74]">Upcoming Shoots</h2><p className="text-xs text-[#6485ac]">Scheduled customer photography events</p></div><CalendarDays size={25} className="text-[#285a99]"/></div><div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{upcoming.length ? upcoming.map((b, i) => <BookingCard key={b.id} booking={b} index={i} onEdit={openEdit} onDelete={deleteBooking} onStatus={changeStatus} onInvoice={openInvoice} financials={financialMap.get(String(b.id))}/>) : <p className="col-span-full rounded-xl bg-[#eaf3ff] p-8 text-center text-sm text-[#55779e]">No upcoming bookings</p>}</div></section><section className="overflow-hidden rounded-[25px] border border-[#d4e4fa] bg-[#f8fbff]"><div className="flex items-center justify-between bg-gradient-to-r from-[#c5ddfb] to-[#edf5ff] p-5"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#557aa9]">Booking Management</p><h2 className="text-xl font-black text-[#173f74]">All Bookings</h2><p className="text-xs text-[#6485ac]">Manage customer bookings and assignments</p></div><ClipboardList size={25} className="text-[#285a99]"/></div><div className="flex flex-col gap-3 border-b bg-[#f4f9ff] p-4 sm:flex-row sm:justify-between"><p className="text-xs text-[#6685ab]">{filtered.length} bookings found</p><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da5c2]"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings..." className={`${inputClass} pl-10`}/></div><div className="relative"><Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da5c2]"/><select value={filter} onChange={e => setFilter(e.target.value)} className={`${inputClass} pl-10`}><option value="All">All Status</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></div></div></div><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1150px] text-left"><thead><tr className="bg-[#e1eeff] text-[11px] font-black uppercase text-[#557ba9]">{["Customer", "Event", "Date & Time", "Location", "Photographer", "Payment", "Status", "Actions"].map(h => <th key={h} className="px-4 py-4">{h}</th>)}</tr></thead><tbody>{filtered.map((b, i) => { const f = financialMap.get(String(b.id)); return <tr key={b.id} className={i % 2 ? "bg-[#edf5ff]" : "bg-[#f8fbff]"}><td className="px-4 py-4"><p className="text-xs font-black text-[#173f74]">{b.customer}</p><p className="text-[11px] text-[#8a9fba]">{b.phone}</p></td><td className="px-4 py-4 text-xs">{b.event}</td><td className="px-4 py-4 text-xs">{formatDate(b.date)}<p className="text-[#8a9fba]">{formatTime(b.time)}</p></td><td className="px-4 py-4 text-xs">{b.location}</td><td className="px-4 py-4 text-xs">{b.photographer}</td><td className="px-4 py-4"><button type="button" onClick={() => openInvoice(b)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"><Download size={14}/>Download Invoice</button></td><td className="px-4 py-4"><select value={b.status || "Pending"} onChange={e => changeStatus(b.id, e.target.value)} className="rounded-xl border bg-white px-2 py-2 text-xs">{statuses.map(s => <option key={s}>{s}</option>)}</select></td><td className="px-4 py-4"><div className="flex gap-2"><button title="Edit Booking" onClick={() => openEdit(b)} className="rounded-xl border bg-white p-2 text-[#356cae]"><Pencil size={16}/></button><button title="Delete Booking" onClick={() => deleteBooking(b.id)} className="rounded-xl border bg-white p-2 text-[#d65c72]"><Trash2 size={16}/></button></div></td></tr>; })}</tbody></table></div><div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">{filtered.map((b, i) => <BookingCard key={b.id} booking={b} index={i} onEdit={openEdit} onDelete={deleteBooking} onStatus={changeStatus} onInvoice={openInvoice} financials={financialMap.get(String(b.id))}/>)}</div>{!filtered.length && <div className="p-12 text-center text-sm text-[#6685ab]">No bookings found</div>}<div className="border-t bg-[#eaf3ff] p-4 text-xs text-[#6685ab]">Showing {filtered.length} of {bookings.length} bookings</div></section><p className="pb-3 text-center text-[11px] text-[#9aabc0]">Studio Raw Picturez · Booking Management</p></div>{selectedDate && <DateBookingsModal date={selectedDate} bookings={bookingMap.get(selectedDate) || []} financialMap={financialMap} onClose={() => setSelectedDate(null)} onEdit={openEdit} onNew={() => openNew(selectedDate)}/ >}{showForm && <BookingModal booking={editingBooking} customers={customers} payments={payments} onClose={closeForm} onSave={saveBooking}/>} {invoiceBooking && <InvoicePreview booking={invoiceBooking} invoice={payments.find(p => String(paymentBookingId(p) || "") === String(invoiceBooking.id))} onClose={() => setInvoiceBooking(null)}/>}</div>;

}
