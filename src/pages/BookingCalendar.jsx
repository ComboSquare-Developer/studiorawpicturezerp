import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays, CalendarCheck2, Clock3, CheckCircle2, Plus, Search, X,
  MapPin, UserRound, Camera, Trash2, Pencil, ChevronLeft, ChevronRight,
  Phone, Filter, Save, CalendarPlus, CalendarRange, ClipboardList,
  IndianRupee, Link2
} from "lucide-react";

const STORAGE_KEY = "studioraw_bookings";
const CUSTOMER_KEY = "studio_raw_customers";
const PAYMENT_KEY = "studioraw_payments";
const ENQUIRY_KEYS = ["studioraw_enquiries", "studio_raw_enquiries"];
const DEMO_KEY = "studioraw_bookings_demo_20_v1";
const UPDATE_EVENT = "studioraw:data-updated";

const events = ["Wedding Photography","Traditional photography","Candid photography","Helicam photography","Pre-Wedding photography","Post Wedding photography","Custom Package","Wedding Videography","Functions We Arrange","Event Management","Customized Gifts","Pre-Wedding / Outdoor Shoot","Baby / Kids Shoot","Complete Wedding Package"];
const statuses = ["Confirmed","Pending","Completed","Cancelled"];
const photographers = ["Rahul","Karthik","Arun","Vignesh","Sanjay","Priya","Divya","Not Assigned"];
const locations = ["Nagercoil","Marthandam","Kanyakumari","Chennai","Tirunelveli","Trivandrum","Madurai","Coimbatore","Other"];
const demoNames = ["Arun Kumar","Priya","Vijay","Divya","Karthik Raj","Meena Devi","Sanjay Kumar","Nithya","Rahul S","Keerthana","Ajay Kumar","Harini","Dinesh Raj","Swetha","Praveen","Aishwarya","Vignesh","Ramya","Naveen Kumar","Abinaya"];
const emptyForm = {customerId:"",customer:"",phone:"",event:"Wedding Photography",date:"",time:"10:00",location:"Nagercoil",photographer:"Not Assigned",totalAmount:"",status:"Confirmed"};
const inputClass = "w-full min-w-0 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-[#6b99d5] focus:ring-2 focus:ring-blue-100";

function dateKey(d) {return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function addDays(days){const d=new Date();d.setDate(d.getDate()+days);return dateKey(d);}
function parseDate(v){
  if(!v)return null;
  if(v instanceof Date)return Number.isNaN(v.getTime())?null:v;
  const s=String(v).trim();let d;
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))d=new Date(`${s}T12:00:00`);
  else if(/^\d{2}\/\d{2}\/\d{4}$/.test(s)){const [day,month,year]=s.split("/").map(Number);d=new Date(year,month-1,day,12);}
  else d=new Date(s);
  return Number.isNaN(d.getTime())?null:d;
}
function formatDate(v){const d=parseDate(v);return d?d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";}
function formatTime(v){if(!v)return "—";const [h,m]=String(v).split(":").map(Number);return Number.isFinite(h)&&Number.isFinite(m)?new Date(2000,0,1,h,m).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}):String(v);}
function amount(v){const n=Number(String(v??0).replace(/[₹,\s]/g,""));return Number.isFinite(n)?n:0;}
function money(v){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(amount(v));}
function normalizePhone(v){return String(v||"").replace(/\D/g,"").slice(-10);}
function readArray(key){try{const p=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(p))return p;for(const k of ["data","records","items","list","customers","bookings","payments","enquiries"])if(Array.isArray(p?.[k]))return p[k];}catch{}return [];}
function notify(key){window.dispatchEvent(new CustomEvent(UPDATE_EVENT,{detail:{key,module:"bookings"}}));}
function writeArray(key,records){localStorage.setItem(key,JSON.stringify(records));notify(key);}
function customerName(c){return String(c?.name||c?.customerName||c?.customer||"").trim();}
function customerPhone(c){return normalizePhone(c?.phone||c?.mobile||c?.contactNumber);}
function matchingCustomer(customers,booking){return customers.find(c=>String(c.id)===String(booking.customerId)&&booking.customerId)||customers.find(c=>customerPhone(c)&&customerPhone(c)===normalizePhone(booking.phone));}
function paymentTotal(p){return amount(p.total??p.totalAmount??p.grandTotal??p.packageAmount??p.bookingAmount??p.amount);}
function paymentReceived(p){
  if(Array.isArray(p.transactions)&&p.transactions.length)return p.transactions.reduce((s,t)=>{
    const status=String(t.status||"").toLowerCase();if(["failed","cancelled","canceled"].includes(status))return s;
    const n=amount(t.amount??t.paidAmount??t.received);return s+(status==="refunded"||String(t.type||"").toLowerCase()==="refund"?-n:n);
  },0);
  return amount(p.paidAmount??p.amountPaid??p.receivedAmount??p.amountReceived??p.totalPaid??p.paid??p.advance??p.advanceAmount);
}
function financialsFor(booking,payments){
  const invoices=payments.filter(p=>p.bookingId!=null&&String(p.bookingId)===String(booking.id));
  const billed=invoices.reduce((s,p)=>s+paymentTotal(p),0),received=invoices.reduce((s,p)=>s+paymentReceived(p),0);
  return {invoices,billed,received,pending:Math.max(0,billed-received),paymentStatus:!invoices.length?"Not Invoiced":billed>0&&received>=billed?"Paid":received>0?"Partial":"Pending",invoice:invoices[0]};
}
function syncInvoice(booking){
  const payments=readArray(PAYMENT_KEY),linked=payments.filter(p=>String(p.bookingId||"")===String(booking.id));
  if(!linked.length)return {payments,updated:false,requiresReview:false};
  const received=linked.reduce((s,p)=>s+paymentReceived(p),0),review=linked.length>1||amount(booking.totalAmount)<received;
  const next=payments.map(p=>{
    if(String(p.bookingId||"")!==String(booking.id))return p;
    const common={...p,customerId:booking.customerId||"",customer:booking.customer,phone:booking.phone,updatedAt:new Date().toISOString()};
    return linked.length===1&&amount(booking.totalAmount)>=paymentReceived(p)?{...common,total:amount(booking.totalAmount)}:common;
  });
  writeArray(PAYMENT_KEY,next);return {payments:next,updated:true,requiresReview:review};
}

/* Enquiries -> Customers + Bookings: idempotent sync, including old saved enquiries. */
function syncEnquiryBookings(){
  const enquiriesById=new Map();
  ENQUIRY_KEYS.forEach(key=>readArray(key).forEach(e=>enquiriesById.set(String(e.id),e)));
  if(!enquiriesById.size)return;
  let customers=readArray(CUSTOMER_KEY),bookings=readArray(STORAGE_KEY);
  let customersChanged=false,bookingsChanged=false;
  for(const enquiry of enquiriesById.values()){
    const name=String(enquiry.name||enquiry.customer||"").trim();
    const phone=normalizePhone(enquiry.number||enquiry.phone);
    if(!name||phone.length!==10)continue;
    const enquiryId=String(enquiry.id);
    let customer=customers.find(c=>String(c.enquiryId||"")===enquiryId)||customers.find(c=>customerPhone(c)===phone);
    if(!customer){
      customer={id:`CUS${Date.now()}${Math.random().toString(36).slice(2,7)}`,name,phone,email:enquiry.email||"",address:enquiry.city||"",source:"Enquiry",enquiryId:enquiry.id,createdAt:new Date().toISOString()};
      customers=[customer,...customers];customersChanged=true;
    }else if(!customer.enquiryId){
      customers=customers.map(c=>String(c.id)===String(customer.id)?{...c,enquiryId:enquiry.id}:c);
      customersChanged=true;
    }
    const date=parseDate(enquiry.eventDate||enquiry.date);
    const existing=bookings.find(b=>String(b.enquiryId||"")===enquiryId)||bookings.find(b=>String(b.id)===`BOOK-ENQ-${enquiryId}`);
    const confirmed=String(enquiry.status||"").toLowerCase()==="confirmed";
    const next={
      ...(existing||{}),id:existing?.id||`BOOK-ENQ-${enquiryId}`,enquiryId:enquiry.id,
      customerId:String(customer.id),customer:name,phone,
      event:enquiry.mainEvent||enquiry.event||"Wedding Photography",
      date:date?dateKey(date):existing?.date||"",
      time:existing?.time||"10:00",location:enquiry.city||existing?.location||"Nagercoil",
      photographer:existing?.photographer||"Not Assigned",
      totalAmount:amount(enquiry.budget||existing?.totalAmount),
      status:existing&&["Completed","Cancelled"].includes(existing.status)?existing.status:confirmed?"Confirmed":"Pending",
      createdAt:existing?.createdAt||new Date().toISOString(),
      updatedAt:existing?.updatedAt||new Date().toISOString()
    };
    if(existing){
      if(JSON.stringify({...existing,updatedAt:null})!==JSON.stringify({...next,updatedAt:null})){
        bookings=bookings.map(b=>String(b.id)===String(existing.id)?{...next,updatedAt:new Date().toISOString()}:b);
        bookingsChanged=true;
      }
    }else{bookings=[next,...bookings];bookingsChanged=true;}
  }
  if(customersChanged)writeArray(CUSTOMER_KEY,customers);
  if(bookingsChanged)writeArray(STORAGE_KEY,bookings);
}
const dummyBookings=demoNames.map((customer,i)=>({id:`BOOK-DEMO-${String(i+1).padStart(3,"0")}`,customerId:"",customer,phone:String(9876543210-i*137),event:events[i%events.length],date:addDays(i*2-8),time:["09:00","10:00","11:30","14:00","16:00","17:30"][i%6],location:locations[i%(locations.length-1)],photographer:photographers[i%photographers.length],totalAmount:0,status:statuses[i%4],createdAt:addDays(-i-1),isDemo:true}));
function loadBookings(){
  const existing=readArray(STORAGE_KEY);
  if(localStorage.getItem(DEMO_KEY)==="true")return existing;
  const ids=new Set(existing.map(b=>String(b.id)));
  const merged=[...existing,...dummyBookings.filter(b=>!ids.has(String(b.id)))];
  localStorage.setItem(STORAGE_KEY,JSON.stringify(merged));localStorage.setItem(DEMO_KEY,"true");
  return merged;
}
const statusTheme={
  Confirmed:{badge:"bg-blue-50 text-blue-700 border-blue-200",dot:"bg-blue-500",event:"bg-[#e7f0ff] text-[#245da4] border-[#cfe1fc]"},
  Pending:{badge:"bg-amber-50 text-amber-700 border-amber-200",dot:"bg-amber-500",event:"bg-[#fff1d9] text-[#9b6816] border-[#f8e2b5]"},
  Completed:{badge:"bg-emerald-50 text-emerald-700 border-emerald-200",dot:"bg-emerald-500",event:"bg-[#def8eb] text-[#167650] border-[#bcebd2]"},
  Cancelled:{badge:"bg-rose-50 text-rose-700 border-rose-200",dot:"bg-rose-500",event:"bg-[#ffe7eb] text-[#b5445e] border-[#ffd0d9]"}
};
const cardThemes=[
 {surface:"bg-[#deedff] border-[#bcd9ff]",icon:"bg-[#c4ddff] text-[#1e5da7]",accent:"bg-[#4287d4]"},
 {surface:"bg-[#ede3ff] border-[#d9c8ff]",icon:"bg-[#dfceff] text-[#7046b2]",accent:"bg-[#a17ce2]"},
 {surface:"bg-[#fff0cf] border-[#f4dfa9]",icon:"bg-[#ffe3aa] text-[#a16a17]",accent:"bg-[#e6b44d]"},
 {surface:"bg-[#dcf8e9] border-[#b6ebcf]",icon:"bg-[#c3efd8] text-[#197b55]",accent:"bg-[#42b78b]"}
];
function StatusBadge({status}){const t=statusTheme[status]||statusTheme.Pending;return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${t.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${t.dot}`}/>{status||"Pending"}</span>;}
function PaymentBadge({status}){const colors={Paid:"bg-emerald-50 text-emerald-700 border-emerald-200",Partial:"bg-blue-50 text-blue-700 border-blue-200",Pending:"bg-amber-50 text-amber-700 border-amber-200","Not Invoiced":"bg-slate-50 text-slate-600 border-slate-200"};return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${colors[status]||colors["Not Invoiced"]}`}>{status}</span>;}
function useCountUp(target,duration=1100){
 const [value,setValue]=useState(0),frame=useRef(null);
 const replay=useCallback(()=>{if(frame.current)cancelAnimationFrame(frame.current);const end=Math.max(0,Number(target)||0);if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches){setValue(end);return;}const start=performance.now();setValue(0);const tick=now=>{const p=Math.min((now-start)/duration,1);setValue(Math.round(end*(1-(1-p)**3)));if(p<1)frame.current=requestAnimationFrame(tick);};frame.current=requestAnimationFrame(tick);},[target,duration]);
 useEffect(()=>{replay();return()=>{if(frame.current)cancelAnimationFrame(frame.current);};},[replay]);return {value,replay};
}
function StatCard({title,value,icon:Icon,index}){const t=cardThemes[index%4],c=useCountUp(value,1200);return <button type="button" onClick={c.replay} style={{"--float-delay":`${index*-.85}s`}} className={`sr-stat-float group relative w-full min-w-0 overflow-hidden rounded-[22px] border p-4 text-left shadow-[0_8px_25px_rgba(20,50,90,0.06)] sm:p-5 ${t.surface}`}><div className="relative flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-[#526781] sm:text-sm">{title}</p><h2 className="mt-3 text-[30px] font-black text-[#10264d] sm:text-[35px]">{c.value.toLocaleString("en-IN")}</h2><p className="mt-3 text-[10px] font-semibold text-[#61758d]">Studio booking overview</p></div><div className={`sr-stat-icon flex h-11 w-11 items-center justify-center rounded-2xl ${t.icon}`}><Icon size={22}/></div></div><div className={`absolute bottom-0 left-0 h-[3px] w-full ${t.accent}`}/></button>;}
function SectionHeader({eyebrow,title,description,icon:Icon,count,alternate=false}){return <div className={`border-b border-[#d3e4f9] px-4 py-5 sm:px-6 ${alternate?"bg-gradient-to-r from-[#c5ddfb] via-[#d9e9ff] to-[#edf5ff]":"bg-gradient-to-r from-[#d5e7ff] via-[#e3efff] to-[#f0f7ff]"}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b5d3fa] text-[#285a99]"><Icon size={24}/></div><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-[#557aa9]">{eyebrow}</p><h2 className="mt-1 text-lg font-black text-[#173f74] sm:text-xl">{title}</h2><p className="mt-1 text-xs text-[#6485ac]">{description}</p></div></div><div className="rounded-2xl bg-[#afcdf5] px-3 py-2 text-lg font-black text-[#173f74]">{String(count).padStart(2,"0")}</div></div></div>;}
function BookingModal({booking,customers,payments,onClose,onSave}){
 const [form,setForm]=useState({...emptyForm,...booking,totalAmount:booking?.totalAmount??booking?.total??booking?.amount??""}),[error,setError]=useState("");
 const financials=booking?.id?financialsFor(booking,payments):null;
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow="hidden";const escape=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",escape);return()=>{document.body.style.overflow=previous;document.removeEventListener("keydown",escape);};},[onClose]);
 const update=(name,value)=>{setForm(p=>({...p,[name]:value}));setError("");};
 const selectCustomer=id=>{const c=customers.find(c=>String(c.id)===String(id));setForm(p=>({...p,customerId:c?String(c.id):"",...(c?{customer:customerName(c),phone:customerPhone(c)}:{})}));};
 const submit=e=>{e.preventDefault();const name=String(form.customer||"").trim(),phone=normalizePhone(form.phone);if(!name)return setError("Please enter customer name.");if(!/^\d{10}$/.test(phone))return setError("Please enter a valid 10-digit phone number.");if(!parseDate(form.date)||!form.time)return setError("Please select a valid booking date and time.");if(amount(form.totalAmount)<0)return setError("Please enter a valid booking amount.");const match=customers.find(c=>String(c.id)===String(form.customerId)&&form.customerId)||customers.find(c=>customerPhone(c)===phone);onSave({...form,customerId:match?String(match.id):"",customer:name,phone,totalAmount:amount(form.totalAmount)});};
 const fields=[["Customer Name","customer",UserRound,"text"],["Phone Number","phone",Phone,"tel"],["Event Type","event",Camera,events],["Booking Date","date",CalendarDays,"date"],["Booking Time","time",Clock3,"time"],["Location","location",MapPin,locations],["Photographer","photographer",Camera,photographers],["Booking Status","status",CheckCircle2,statuses]];
 return createPortal(<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07182f]/65 p-3 backdrop-blur-[3px] sm:p-5" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div role="dialog" aria-modal="true" className="flex max-h-[94dvh] w-full max-w-[600px] flex-col overflow-hidden rounded-[25px] bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#e7edf5] bg-gradient-to-r from-[#d5e7ff] to-[#f4f9ff] px-5 py-5 sm:px-7"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#b5d3fa] p-3 text-[#285a99]"><CalendarPlus size={22}/></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6686ad]">Studio Raw Picturez</p><h2 className="mt-1 text-lg font-black text-[#173f74]">{booking?.id?"Edit Booking":"New Booking"}</h2></div></div><button type="button" onClick={onClose} className="rounded-xl bg-white p-2.5 text-[#55779e]"><X size={18}/></button></div><form onSubmit={submit} className="flex min-h-0 flex-1 flex-col"><div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#f8fbff] px-5 py-6 sm:px-7"><label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><Link2 size={14}/>Select Existing Customer</span><select value={form.customerId||""} onChange={e=>selectCustomer(e.target.value)} className={inputClass}><option value="">Select customer / Enter manually</option>{customers.map(c=><option key={c.id} value={String(c.id)}>{customerName(c)} - {customerPhone(c)}</option>)}</select><p className="mt-2 text-[11px] text-[#6485ac]">Existing customer select pannina name and phone auto-fill aagum.</p></label>{fields.map(([label,key,Icon,kind])=><label key={key} className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><span className="rounded-lg bg-[#e8f1ff] p-1.5 text-[#4077b4]"><Icon size={14}/></span>{label}</span>{Array.isArray(kind)?<select className={inputClass} value={form[key]||""} onChange={e=>update(key,e.target.value)}>{kind.map(v=><option key={v} value={v}>{v}</option>)}</select>:<input className={inputClass} type={kind} required={["customer","phone","date","time"].includes(key)} value={form[key]||""} onChange={e=>{const value=key==="phone"?e.target.value.replace(/\D/g,"").slice(0,10):e.target.value;setForm(p=>({...p,[key]:value,...(["customer","phone"].includes(key)?{customerId:""}:{})}));setError("");}}/>}</label>)}<label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]"><IndianRupee size={14}/>Total Booking Amount (₹)</span><input className={inputClass} type="number" min="0" step="0.01" value={form.totalAmount??""} onChange={e=>update("totalAmount",e.target.value)}/><p className="mt-2 text-[11px] text-[#6485ac]">Payments-la booking select pannina amount auto-fill aagum.</p></label>{booking?.id&&<div className="rounded-2xl border border-[#dce8f8] bg-white p-4"><div className="flex justify-between"><p className="text-xs font-black text-[#173f74]">Payment Connection</p><PaymentBadge status={financials.paymentStatus}/></div><div className="mt-4 grid grid-cols-3 gap-2">{[["Billed",financials.billed],["Received",financials.received],["Pending",financials.pending]].map(([label,value])=><div key={label} className="rounded-xl bg-[#edf5ff] p-3"><p className="text-[10px] text-[#7890ac]">{label}</p><p className="mt-2 break-words text-xs font-black text-[#173f74]">{money(value)}</p></div>)}</div></div>}{error&&<p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</p>}</div><div className="flex flex-col-reverse gap-3 border-t bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7"><button type="button" onClick={onClose} className="rounded-xl border px-6 py-3 text-sm font-bold text-[#5b7190]">Cancel</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285a99] px-6 py-3 text-sm font-bold text-white"><Save size={17}/>Save Booking</button></div></form></div></div>,document.body);
}
function BookingCard({booking,index=0,onEdit,onDelete,onStatus,financials}){
 return <article className="sr-booking-card relative min-w-0 overflow-hidden rounded-[20px] border border-[#d5e5fa] bg-gradient-to-br from-[#e8f2ff] via-[#f1f7ff] to-[#e2efff] p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7694b9]">Booking {String(index+1).padStart(2,"0")}</p><h3 className="mt-2 truncate text-base font-black text-[#173f74]">{booking.customer||"Customer"}</h3></div><StatusBadge status={booking.status}/></div><div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#d3e4f8] pt-4">{[["Event Type",booking.event],["Event Date",formatDate(booking.date)],["Time",formatTime(booking.time)],["Location",booking.location]].map(([label,value])=><div key={label} className="min-w-0 rounded-xl border border-[#dce9f8] bg-white/90 p-3"><p className="text-[10px] font-bold uppercase text-[#8a9fba]">{label}</p><p className="mt-1.5 break-words text-xs font-extrabold text-[#285a99]">{value||"—"}</p></div>)}</div><div className="mt-3 flex items-center justify-between rounded-xl border border-[#dce9f8] bg-white/75 p-3"><div><p className="text-[10px] font-bold uppercase text-[#8a9fba]">Booking Amount</p><p className="mt-1 text-xs font-black text-[#173f74]">{money(booking.totalAmount)}</p></div><PaymentBadge status={financials?.paymentStatus||"Not Invoiced"}/></div><div className="mt-4 flex items-center gap-2"><select value={booking.status||"Pending"} onChange={e=>onStatus(booking.id,e.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#cfdef2] bg-white px-3 py-2.5 text-xs font-bold text-[#285a99]">{statuses.map(s=><option key={s}>{s}</option>)}</select><button type="button" onClick={()=>onEdit(booking)} className="rounded-xl border bg-white p-2.5 text-[#356cae]"><Pencil size={17}/></button><button type="button" onClick={()=>onDelete(booking.id)} className="rounded-xl border bg-white p-2.5 text-[#d65c72]"><Trash2 size={17}/></button></div></article>;
}
function DateBookingsModal({date,bookings,onClose,onEdit,onNew}){
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow="hidden";const onKey=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",onKey);return()=>{document.body.style.overflow=previous;document.removeEventListener("keydown",onKey);};},[onClose]);
 return createPortal(<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07182f]/65 p-3 backdrop-blur-[3px] sm:p-5" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div role="dialog" aria-modal="true" aria-label="Booked customer details" className="flex max-h-[94dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-[25px] bg-white shadow-2xl"><div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#dce8f8] bg-gradient-to-r from-[#d5e7ff] to-[#f4f9ff] p-5 sm:px-7"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#b5d3fa] p-3 text-[#285a99]"><CalendarCheck2 size={23}/></div><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#6686ad]">Studio Raw Picturez</p><h2 className="mt-1 text-lg font-black text-[#173f74]">Booked Customer Details</h2><p className="mt-1 text-xs font-semibold text-[#6586ad]">{formatDate(date)} · {bookings.length} booking{bookings.length===1?"":"s"}</p></div></div><button type="button" onClick={onClose} className="rounded-xl border border-[#d3e3f6] bg-white p-2.5 text-[#55779e]" aria-label="Close"><X size={19}/></button></div><div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8fbff] p-4 sm:p-6">{bookings.map((b,i)=><div key={b.id} className="rounded-2xl border border-[#dce8f8] bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a9fba]">Booking {String(i+1).padStart(2,"0")}</p><h3 className="mt-1 text-base font-black text-[#173f74]">{b.customer||"Customer"}</h3></div><StatusBadge status={b.status}/></div><div className="mt-4 grid gap-2">{[["Phone",b.phone],["Event",b.event],["Date",formatDate(b.date)],["Time",formatTime(b.time)],["Location",b.location],["Photographer",b.photographer],["Booking Amount",money(b.totalAmount)]].map(([label,value])=><div key={label} className="flex items-start justify-between gap-4 border-b border-[#e5edf8] py-2 text-xs"><span className="shrink-0 font-semibold text-[#7890ac]">{label}</span><span className="break-words text-right font-bold text-[#173f74]">{value||"—"}</span></div>)}</div><button type="button" onClick={()=>onEdit(b)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#285a99] px-4 py-3 text-sm font-bold text-white hover:bg-[#173f74]"><Pencil size={16}/>Edit Booking</button></div>)}</div><div className="flex shrink-0 flex-col-reverse gap-2 border-t bg-white p-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={onClose} className="rounded-xl border border-[#dce5f1] px-5 py-3 text-sm font-bold text-[#5b7190]">Close</button><button type="button" onClick={onNew} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285a99] px-5 py-3 text-sm font-bold text-white"><Plus size={17}/>Add Another Booking</button></div></div></div>,document.body);
}
export default function BookingCalendar(){
 const [bookings,setBookings]=useState(loadBookings),[customers,setCustomers]=useState(()=>readArray(CUSTOMER_KEY)),[payments,setPayments]=useState(()=>readArray(PAYMENT_KEY));
 const bookingsRef=useRef(bookings);bookingsRef.current=bookings;
 const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
 const [showForm,setShowForm]=useState(false),[editingBooking,setEditingBooking]=useState(null),[selectedDate,setSelectedDate]=useState(null);
 const [search,setSearch]=useState(""),[filter,setFilter]=useState("All");
 useEffect(()=>{
   const refresh=event=>{const key=event?.detail?.key||event?.key;
     if(!key||ENQUIRY_KEYS.includes(key)){syncEnquiryBookings();}
     if(!key||key===CUSTOMER_KEY)setCustomers(readArray(CUSTOMER_KEY));
     if(!key||key===PAYMENT_KEY)setPayments(readArray(PAYMENT_KEY));
     if(!key||key===STORAGE_KEY||ENQUIRY_KEYS.includes(key)){const latest=readArray(STORAGE_KEY);if(JSON.stringify(latest)!==JSON.stringify(bookingsRef.current)){bookingsRef.current=latest;setBookings(latest);}}
   };
   syncEnquiryBookings();refresh({key:STORAGE_KEY});refresh({key:CUSTOMER_KEY});
   window.addEventListener("storage",refresh);window.addEventListener(UPDATE_EVENT,refresh);window.addEventListener("focus",refresh);
   return()=>{window.removeEventListener("storage",refresh);window.removeEventListener(UPDATE_EVENT,refresh);window.removeEventListener("focus",refresh);};
 },[]);
 const commit=next=>{try{bookingsRef.current=next;writeArray(STORAGE_KEY,next);setBookings(next);return true;}catch(e){console.error(e);window.alert("Unable to save bookings in browser storage.");return false;}};
 const financialMap=useMemo(()=>new Map(bookings.map(b=>[String(b.id),financialsFor(b,payments)])),[bookings,payments]);
 const stats=[["Total Bookings",bookings.length,CalendarDays],["Confirmed",bookings.filter(b=>String(b.status).toLowerCase()==="confirmed").length,CalendarCheck2],["Pending",bookings.filter(b=>String(b.status).toLowerCase()==="pending").length,Clock3],["Completed",bookings.filter(b=>String(b.status).toLowerCase()==="completed").length,CheckCircle2]];
 const filtered=useMemo(()=>bookings.filter(b=>[b.customer,b.phone,b.event,b.location,b.photographer,b.package,b.id,b.customerId].some(v=>String(v||"").toLowerCase().includes(search.trim().toLowerCase()))&&(filter==="All"||String(b.status||"").toLowerCase()===filter.toLowerCase())),[bookings,search,filter]);
 const upcoming=useMemo(()=>bookings.filter(b=>{const d=parseDate(b.date);return d&&dateKey(d)>=dateKey(new Date())&&!["completed","cancelled","canceled"].includes(String(b.status||"").toLowerCase());}).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.time).localeCompare(String(b.time))).slice(0,6),[bookings]);
 const bookingMap=useMemo(()=>{const map=new Map();bookings.forEach(b=>{const d=parseDate(b.date);if(!d)return;const key=dateKey(d);if(!map.has(key))map.set(key,[]);map.get(key).push(b);});return map;},[bookings]);
 const firstDay=new Date(month.getFullYear(),month.getMonth(),1),daysInMonth=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const cells=[...Array(firstDay.getDay()).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];while(cells.length%7)cells.push(null);
 const prefix=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,"0")}`;
 const monthlyCount=bookings.filter(b=>{const d=parseDate(b.date);return d&&dateKey(d).startsWith(prefix);}).length;
 const changeMonth=offset=>setMonth(p=>new Date(p.getFullYear(),p.getMonth()+offset,1));
 const openNew=(date="")=>{setCustomers(readArray(CUSTOMER_KEY));setPayments(readArray(PAYMENT_KEY));setEditingBooking({...emptyForm,date});setSelectedDate(null);setShowForm(true);};
 const openEdit=b=>{const cs=readArray(CUSTOMER_KEY),match=matchingCustomer(cs,b);setCustomers(cs);setPayments(readArray(PAYMENT_KEY));setEditingBooking({...b,customerId:b.customerId||match?.id||""});setSelectedDate(null);setShowForm(true);};
 const closeForm=useCallback(()=>{setShowForm(false);setEditingBooking(null);},[]);
 const saveBooking=data=>{const now=new Date().toISOString();if(editingBooking?.id){const updated={...editingBooking,...data,id:editingBooking.id,createdAt:editingBooking.createdAt||now,updatedAt:now};if(!commit(bookingsRef.current.map(b=>String(b.id)===String(updated.id)?updated:b)))return;try{const r=syncInvoice(updated);if(r.updated)setPayments(r.payments);if(r.requiresReview)window.alert("Booking saved. Please review linked invoices in Payments.");}catch(e){console.error(e);window.alert("Booking saved, but linked invoice could not be updated.");}closeForm();return;}const created={...data,id:globalThis.crypto?.randomUUID?.()||`BOOK-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,createdAt:now,updatedAt:now};if(commit([created,...bookingsRef.current]))closeForm();};
 const deleteBooking=id=>{if(readArray(PAYMENT_KEY).some(p=>String(p.bookingId||"")===String(id)))return window.alert("This booking has a linked payment invoice. Unlink the invoice before deleting.");if(window.confirm("Delete this booking?"))commit(bookingsRef.current.filter(b=>String(b.id)!==String(id)));};
 const changeStatus=(id,status)=>commit(bookingsRef.current.map(b=>String(b.id)===String(id)?{...b,status,updatedAt:new Date().toISOString()}:b));
 return <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f9fd] px-3 py-5 text-[#10264d] sm:px-5 lg:px-7">
 <style>{`
 @keyframes srFloat3D{0%,100%{transform:perspective(1100px) translateY(0) rotateX(0)}50%{transform:perspective(1100px) translateY(-7px) rotateX(1.2deg)}}
 @keyframes srCalendarGlow{0%,100%{box-shadow:0 12px 40px rgba(22,53,96,.07)}50%{box-shadow:0 18px 45px rgba(40,90,153,.12)}}
 .sr-stat-float{animation:srFloat3D 5.5s ease-in-out infinite;animation-delay:var(--float-delay,0s);transform-style:preserve-3d;transition:box-shadow .3s ease,filter .3s ease}
 .sr-stat-float:hover{animation-play-state:paused;filter:saturate(1.08);box-shadow:0 18px 38px rgba(22,53,96,.16)}
 .sr-stat-icon{transition:transform .35s ease}.sr-stat-float:hover .sr-stat-icon{transform:rotate(-8deg) scale(1.1)}
 .sr-calendar-premium{animation:srCalendarGlow 7s ease-in-out infinite}
 .sr-booking-card{transform-style:preserve-3d;transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease}
 .sr-booking-card:hover{transform:perspective(1000px) translateY(-7px) rotateX(2deg);border-color:#abcdf4;box-shadow:0 20px 38px rgba(43,92,153,.15)}
 .sr-calendar-day{transform-style:preserve-3d;transition:transform .3s ease,border-color .3s ease,box-shadow .3s ease,background .3s ease}
 .sr-calendar-day:hover{transform:perspective(900px) translateY(-5px) rotateX(4deg);border-color:#8fb9ee;background:#f0f7ff;box-shadow:0 15px 30px rgba(30,70,130,.14)}
 .sr-calendar-event{transition:transform .25s ease,box-shadow .25s ease}.sr-calendar-event:hover{transform:translateX(3px);box-shadow:0 5px 12px rgba(30,70,130,.12)}
 @media(prefers-reduced-motion:reduce){.sr-stat-float,.sr-calendar-premium{animation:none!important}.sr-booking-card,.sr-calendar-day,.sr-calendar-event,.sr-stat-icon{transition:none!important}.sr-booking-card:hover,.sr-calendar-day:hover,.sr-calendar-event:hover{transform:none!important}}
 `}</style>
 <div className="mx-auto max-w-[1800px] space-y-6">
 <div className="flex justify-end"><button type="button" onClick={()=>openNew()} className="inline-flex items-center gap-2 rounded-xl bg-[#285a99] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#173f74]"><Plus size={18}/>New Booking</button></div>
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">{stats.map(([title,value,icon],i)=><StatCard key={title} title={title} value={value} icon={icon} index={i}/>)}</div>
 <section className="sr-calendar-premium overflow-hidden rounded-[26px] border border-[#dce6f4] bg-white shadow-[0_12px_40px_rgba(22,53,96,0.07)]">
 <div className="h-1 bg-gradient-to-r from-[#8ab9f6] via-[#b4a0ed] to-[#91dfc0]"/>
 <div className="flex flex-col gap-5 border-b border-[#e8eef7] bg-gradient-to-r from-[#f1f7ff] via-white to-[#f8f4ff] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#d7e6fa] bg-[#e4efff] text-[#2e65a7]"><CalendarRange size={26}/></div><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8298b7]">Photography Calendar</p><h2 className="mt-1 text-[22px] font-black text-[#10264d] sm:text-[27px]">{month.toLocaleString("en-IN",{month:"long",year:"numeric"})}</h2><p className="mt-1 text-xs text-[#8194ae]">Click a booked date to view customer details</p></div></div><div className="flex flex-wrap items-center gap-3"><div className="rounded-2xl border border-[#dce8f8] bg-white px-4 py-2.5"><p className="text-lg font-black text-[#10264d]">{monthlyCount}</p><p className="text-[10px] text-[#8a9bb0]">Monthly Bookings</p></div><div className="flex items-center gap-1.5 rounded-2xl border border-[#e1e9f4] bg-white p-1.5"><button type="button" onClick={()=>changeMonth(-1)} className="rounded-xl p-2.5 text-[#536f91]" aria-label="Previous month"><ChevronLeft size={19}/></button><button type="button" onClick={()=>{const d=new Date();setMonth(new Date(d.getFullYear(),d.getMonth(),1));}} className="rounded-xl bg-[#285a99] px-4 py-2.5 text-xs font-bold text-white">Today</button><button type="button" onClick={()=>changeMonth(1)} className="rounded-xl p-2.5 text-[#536f91]" aria-label="Next month"><ChevronRight size={19}/></button></div></div></div>
 <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-[#edf1f7] px-4 py-4 sm:px-6">{statuses.map(s=><div key={s} className="flex items-center gap-2 text-[11px] font-semibold text-[#657992]"><span className={`h-2.5 w-2.5 rounded-full ${statusTheme[s].dot}`}/>{s}</div>)}</div>
 <div className="bg-[#fcfdff] p-2.5 sm:p-5 lg:p-6"><div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 lg:gap-3">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><div key={day} className="rounded-xl border border-[#e4ebf5] bg-[#edf4ff] py-3.5 text-center text-[10px] font-extrabold text-[#5679a4] sm:text-xs">{day}</div>)}{cells.map((day,index)=>{if(!day)return <div key={`empty-${index}`} className="min-h-[78px] rounded-2xl border border-dashed border-[#edf1f7] bg-[#f8faff] sm:min-h-[125px] lg:min-h-[155px]"/>;const date=dateKey(new Date(month.getFullYear(),month.getMonth(),day)),dayBookings=bookingMap.get(date)||[],today=date===dateKey(new Date());return <button key={date} type="button" onClick={()=>dayBookings.length?setSelectedDate(date):openNew(date)} aria-label={`${dayBookings.length?`View ${dayBookings.length} bookings`:"Add booking"} for ${formatDate(date)}`} className={`sr-calendar-day group relative flex min-h-[78px] min-w-0 flex-col overflow-hidden rounded-2xl border p-1.5 text-left sm:min-h-[125px] sm:p-3 lg:min-h-[155px] lg:p-3.5 ${today?"border-[#9fbfea] bg-[#eff6ff]":dayBookings.length?"border-[#dce7f6] bg-white":"border-[#e8edf5] bg-white"}`}><div className="flex w-full items-center justify-between gap-1"><span className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-extrabold sm:h-9 sm:w-9 sm:text-sm ${today?"bg-[#285a99] text-white":"bg-[#f0f5fc] text-[#47617f]"}`}>{day}</span>{dayBookings.length>0&&<span className="rounded-lg border border-[#d6e5f9] bg-[#e9f3ff] px-1.5 py-1 text-[9px] font-extrabold text-[#3c6fae] sm:px-2">{dayBookings.length}</span>}</div>{dayBookings.length>0&&<div className="mt-2 flex flex-wrap gap-1 sm:hidden">{dayBookings.slice(0,4).map(b=><span key={b.id} className={`h-1.5 w-1.5 rounded-full ${statusTheme[b.status]?.dot||"bg-slate-400"}`}/>)}</div>}<div className="mt-3 hidden w-full min-w-0 space-y-1.5 sm:block">{dayBookings.slice(0,2).map(b=><div key={b.id} title={`${b.customer} - ${b.event}`} className={`sr-calendar-event flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-[10px] font-bold ${statusTheme[b.status]?.event||"border-slate-100 bg-slate-50 text-slate-600"}`}><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusTheme[b.status]?.dot||"bg-slate-400"}`}/><span className="min-w-0 truncate">{b.customer}</span></div>)}{dayBookings.length>2&&<p className="pl-1 text-[10px] font-bold text-[#6686b2]">+{dayBookings.length-2} more</p>}</div>{today&&<span className="absolute bottom-2 left-2 hidden rounded-md bg-[#dceaff] px-2 py-0.5 text-[9px] font-extrabold text-[#376aa8] sm:block">TODAY</span>}</button>;})}</div></div>
 <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1f7] bg-[#f9fbff] px-5 py-4"><p className="flex items-center gap-2 text-[11px] text-[#8b9db4]"><CalendarPlus size={14}/>Booked date: view details · Empty date: new booking</p><p className="text-[11px] font-extrabold text-[#7391b7]">STUDIO RAW PICTUREZ</p></div></section>
 <section className="overflow-hidden rounded-[25px] border border-[#d4e4fa] bg-[#f8fbff] shadow-sm"><SectionHeader eyebrow="Studio Schedule" title="Upcoming Shoots" description="Scheduled customer photography events" icon={CalendarDays} count={upcoming.length}/><div className="p-4 sm:p-6">{upcoming.length?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{upcoming.map((b,i)=><BookingCard key={b.id} booking={b} index={i} onEdit={openEdit} onDelete={deleteBooking} onStatus={changeStatus} financials={financialMap.get(String(b.id))}/>)}</div>:<div className="rounded-2xl border border-dashed border-[#cbdff8] bg-[#eaf3ff] p-10 text-center text-sm font-bold text-[#55779e]">No upcoming bookings</div>}</div></section>
 <section className="overflow-hidden rounded-[25px] border border-[#d4e4fa] bg-[#f8fbff] shadow-sm"><SectionHeader eyebrow="Booking Management" title="All Bookings" description="Manage customer bookings and assignments" icon={ClipboardList} count={bookings.length} alternate/><div className="border-b border-[#e0eaf7] bg-[#f4f9ff] p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-semibold text-[#6685ab]">{filtered.length} bookings found</p><div className="flex flex-col gap-3 sm:flex-row"><div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da5c2]"/><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bookings..." className={`${inputClass} pl-10`}/></div><div className="relative"><Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da5c2]"/><select value={filter} onChange={e=>setFilter(e.target.value)} className={`${inputClass} pl-10`}><option value="All">All Status</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div></div></div></div>
 <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1050px] text-left"><thead><tr className="bg-[#e1eeff] text-[11px] font-extrabold uppercase tracking-wide text-[#557ba9]">{["Customer","Event","Date & Time","Location","Photographer","Payment","Status","Actions"].map(h=><th key={h} className="px-5 py-4">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#dce8f8]">{filtered.map((b,i)=>{const f=financialMap.get(String(b.id));return <tr key={b.id} className={i%2===0?"bg-[#f8fbff]":"bg-[#edf5ff]"}><td className="px-5 py-4"><p className="text-xs font-extrabold text-[#173f74]">{b.customer}</p><p className="mt-1 text-[11px] text-[#8a9fba]">{b.phone}</p></td><td className="px-5 py-4 text-xs font-semibold text-[#385b85]">{b.event}</td><td className="px-5 py-4"><p className="text-xs font-bold text-[#173f74]">{formatDate(b.date)}</p><p className="mt-1 text-[11px] text-[#8a9fba]">{formatTime(b.time)}</p></td><td className="px-5 py-4 text-xs text-[#55779e]">{b.location}</td><td className="px-5 py-4 text-xs text-[#55779e]">{b.photographer}</td><td className="px-5 py-4"><PaymentBadge status={f?.paymentStatus||"Not Invoiced"}/>{f?.invoices?.length>0&&<p className="mt-1 text-[10px] text-[#6485ac]">Due: {money(f.pending)}</p>}</td><td className="px-5 py-4"><select value={b.status||"Pending"} onChange={e=>changeStatus(b.id,e.target.value)} className="max-w-[135px] rounded-xl border border-[#cfdef2] bg-white px-2 py-2 text-xs font-bold text-[#285a99]">{statuses.map(s=><option key={s}>{s}</option>)}</select></td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={()=>openEdit(b)} className="rounded-xl border bg-white p-2.5 text-[#356cae]"><Pencil size={16}/></button><button type="button" onClick={()=>deleteBooking(b.id)} className="rounded-xl border bg-white p-2.5 text-[#d65c72]"><Trash2 size={16}/></button></div></td></tr>;})}</tbody></table></div>
 <div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">{filtered.map((b,i)=><BookingCard key={b.id} booking={b} index={i} onEdit={openEdit} onDelete={deleteBooking} onStatus={changeStatus} financials={financialMap.get(String(b.id))}/>)}</div>{!filtered.length&&<div className="py-12 text-center text-sm font-bold text-[#6685ab]">No bookings found <button type="button" onClick={()=>{setSearch("");setFilter("All");}} className="ml-2 text-[#356cae]">Clear Filters</button></div>}<div className="border-t border-[#dce8f8] bg-[#eaf3ff] px-5 py-4 text-xs text-[#6685ab]">Showing {filtered.length} of {bookings.length} bookings</div></section>
 <p className="pb-3 text-center text-[11px] font-semibold text-[#9aabc0]">Studio Raw Picturez · Booking Management</p>
 </div>
 {selectedDate&&<DateBookingsModal date={selectedDate} bookings={bookingMap.get(selectedDate)||[]} onClose={()=>setSelectedDate(null)} onEdit={openEdit} onNew={()=>openNew(selectedDate)}/>}
 {showForm&&<BookingModal booking={editingBooking} customers={customers} payments={payments} onClose={closeForm} onSave={saveBooking}/>}
 </div>;
}
