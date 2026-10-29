import { useEffect, useMemo, useState } from "react";

import { api } from "../api/client";

import { createPortal } from "react-dom";

import { jsPDF } from "jspdf";

import {

  Plus, Search, Wallet, Receipt, IndianRupee, CheckCircle2, Clock3,

  CreditCard, Download, Printer, Pencil, Trash2, X, Save, RefreshCw,

  History, AlertCircle

} from "lucide-react";



const KEYS={payments:"studioraw_payments",bookings:"studioraw_bookings",customers:"studio_raw_customers",actions:"studioraw_payment_action_counts"};

const EVENT="studioraw:data-updated";

const METHODS=["Cash","UPI","Bank Transfer","Card","Cheque","Other"];

const number=v=>{const n=Number(typeof v==="string"?v.replace(/[₹,\s]/g,""):v);return Number.isFinite(n)?n:0};

const round=v=>Math.round((number(v)+Number.EPSILON)*100)/100;

const money=v=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(number(v));

const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};

const dateOf=v=>{if(!v)return "";const s=String(v);if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);const d=new Date(v);return Number.isNaN(d.getTime())?"":`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};

const showDate=v=>{const s=dateOf(v);return s?new Date(s+"T12:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"};

const uid=(prefix="ID")=>`${prefix}-${typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2,9)}`}`;

function read(key){try{const p=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(p))return p;for(const k of ["data","items","records","list","payments","bookings","customers"])if(Array.isArray(p?.[k]))return p[k]}catch{}return []}

function readModule(primary,secondary){const a=read(primary);return a.length?a:read(secondary)}

function nameOf(v){return v?.customerName||(typeof v?.customer==="string"?v.customer:v?.customer?.name)||v?.name||v?.clientName||""}

const bookingTotal=v=>number(v?.totalAmount??v?.total??v?.packageAmount??v?.amount??0);

const totalOf=v=>number(v?.total??v?.totalAmount??v?.grandTotal??v?.bookingAmount??0);

const txAmount=v=>number(v?.amount??v?.paidAmount??v?.receivedAmount??0);

const invalid=["failed","cancelled","canceled","refunded","reversed","void"];

const validTx=t=>!invalid.includes(String(t?.status||"").toLowerCase());

function paidOf(invoice){

 for(const k of ["transactions","paymentHistory","payment_history","receipts"])

  if(Array.isArray(invoice?.[k]))return round(invoice[k].filter(validTx).reduce((s,t)=>s+Math.max(0,txAmount(t)),0));

 for(const k of ["advance","paidAmount","amountPaid","receivedAmount","amountReceived","totalPaid","totalReceived","advanceAmount"])

  if(invoice?.[k]!==undefined&&invoice[k]!==null&&invoice[k]!=="")return Math.max(0,number(invoice[k]));

 return ["paid","completed","fully paid"].includes(String(invoice?.status||"").toLowerCase())?totalOf(invoice):0;

}

const balanceOf=i=>Math.max(0,round(totalOf(i)-paidOf(i)));

const statusOf=i=>totalOf(i)>0&&paidOf(i)>=totalOf(i)-.005?"Paid":paidOf(i)>0?"Partial":"Pending";

function historyOf(invoice){

 for(const k of ["transactions","paymentHistory","payment_history","receipts"])if(Array.isArray(invoice?.[k]))return invoice[k];

 const paid=paidOf(invoice);return paid>0?[{id:`${invoice.id}-legacy`,amount:paid,method:invoice.method||"Cash",date:invoice.date||invoice.createdAt||today(),note:"Previous payment",status:"Paid"}]:[];

}

function normalized(invoice){

 const transactions=historyOf(invoice).map((t,i)=>({...t,id:t.id||`${invoice.id||"invoice"}-${i}`,amount:txAmount(t),method:t.method||t.paymentMethod||invoice.method||"Cash",date:dateOf(t.date||t.paymentDate)||dateOf(invoice.date)||today()}));

 const next={...invoice,id:invoice.id||uid("PAY"),invoice:invoice.invoice||invoice.invoiceNumber||"",customer:nameOf(invoice),customerId:invoice.customerId||"",bookingId:invoice.bookingId||"",phone:invoice.phone||"",packageName:invoice.packageName||invoice.package||"",total:totalOf(invoice),date:dateOf(invoice.date)||today(),method:invoice.method||"Cash",notes:invoice.notes||"",transactions};

 return {...next,advance:paidOf(next),status:statusOf(next)};

}

function nextInvoiceNumber(items){

 const year=new Date().getFullYear();let max=0;

 items.forEach(x=>{const m=String(x.invoice||x.invoiceNumber||"").match(new RegExp(`^SRP-${year}-(\\d+)$`));if(m)max=Math.max(max,Number(m[1]))});

 return `SRP-${year}-${String(max+1).padStart(5,"0")}`;

}

function readCounts(){try{const v=JSON.parse(localStorage.getItem(KEYS.actions)||"{}");return {print:Number(v.print)||0,edit:Number(v.edit)||0,delete:Number(v.delete)||0}}catch{return {print:0,edit:0,delete:0}}}

const input="w-full min-w-0 rounded-xl border border-[#d7e5f4] bg-white px-4 py-3 text-sm font-medium text-[#173e73] outline-none transition placeholder:text-[#9badc0] focus:border-[#3778bb] focus:ring-4 focus:ring-[#e6f1ff]";

const button="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10264d] to-[#2e65a5] px-5 py-3 text-sm font-bold text-white";

const EMPTY={customerId:"",bookingId:"",customer:"",phone:"",packageName:"",total:"",initialPayment:"",method:"Cash",date:"",notes:""};

function Field({label,required,children,hint}){return <div className="space-y-2"><label className="block text-xs font-bold text-[#567493]">{label}{required&&<span className="ml-1 text-red-500">*</span>}</label>{children}{hint&&<p className="text-[11px] text-[#8ca3bb]">{hint}</p>}</div>}

function Badge({status}){const theme={Paid:"bg-[#e0f7eb] text-[#158563]",Partial:"bg-[#fff0d8] text-[#ac7625]",Pending:"bg-[#ffe7ec] text-[#bf4c65]"};return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${theme[status]||theme.Pending}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{status}</span>}

function Modal({title,subtitle,icon:Icon,onClose,children,width="max-w-2xl"}){

 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow="hidden";const escape=e=>{if(e.key==="Escape")onClose()};document.addEventListener("keydown",escape);return()=>{document.body.style.overflow=previous;document.removeEventListener("keydown",escape)}},[onClose]);

 return createPortal(<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a34]/65 p-3 backdrop-blur-[3px] sm:p-5"><div role="dialog" aria-modal="true" aria-label={title} className={`flex max-h-[94vh] w-full ${width} flex-col overflow-hidden rounded-[26px] border border-[#dbe8f7] bg-[#f8fbff] shadow-2xl`}><div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e0eaf6] bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4f0ff] text-[#245f9f]"><Icon size={23}/></div><div><h2 className="text-lg font-black text-[#10264d]">{title}</h2><p className="mt-1 text-xs text-[#839bb4]">{subtitle}</p></div></div><button type="button" onClick={onClose} className="rounded-xl bg-[#edf4fc] p-2.5 text-[#527393]"><X size={20}/></button></div><div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div></div></div>,document.body);

}

function Stat({title,value,subtitle,icon:Icon,color="blue"}){

 const colors={blue:"from-[#eff7ff] to-[#d2e7ff]",green:"from-[#f0fcf7] to-[#cceedd]",amber:"from-[#fffaf0] to-[#ffe5bf]",purple:"from-[#faf7ff] to-[#e1d8fb]"};

 return <div className={`sr-payment-3d rounded-[23px] border border-white bg-gradient-to-br ${colors[color]} p-4 shadow-[0_8px_25px_rgba(20,65,120,.06)] sm:p-5`}><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-[#6c88a4]">{title}</p><h3 className="mt-3 break-words text-xl font-black text-[#153f75] sm:text-2xl">{value}</h3></div><div className="rounded-2xl bg-white/50 p-3 text-[#2767a8]"><Icon size={21}/></div></div><p className="mt-5 border-t border-white/80 pt-3 text-[11px] text-[#7994ad]">{subtitle}</p></div>;

}

function pdfInvoice(invoice,action="download"){

 const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"}),navy=[16,38,77],gray=[99,119,145];

 const total=totalOf(invoice),received=paidOf(invoice),balance=balanceOf(invoice);

 doc.setFillColor(...navy);doc.rect(0,0,210,47,"F");doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(20);doc.text("STUDIO RAW PICTUREZ",15,22);doc.setFont("helvetica","normal");doc.setFontSize(10);doc.text("PHOTOGRAPHY | EVENTS | CREATIVE SERVICES",15,31);doc.setFont("helvetica","bold");doc.setFontSize(17);doc.text("INVOICE",195,22,{align:"right"});doc.setFontSize(9);doc.text(String(invoice.invoice||invoice.id),195,31,{align:"right"});

 doc.setTextColor(...navy);doc.setFontSize(10);doc.text("BILL TO",15,61);doc.setFont("helvetica","normal");doc.setFontSize(12);doc.text(doc.splitTextToSize(String(invoice.customer||"Customer"),95),15,70);doc.setFontSize(10);doc.setTextColor(...gray);doc.text(`Phone: ${invoice.phone||"N/A"}`,15,83);doc.setTextColor(...navy);doc.setFont("helvetica","bold");doc.text("INVOICE DETAILS",125,61);doc.setFont("helvetica","normal");doc.setTextColor(...gray);doc.text(`Date: ${showDate(invoice.date)}`,125,70);doc.text(`Status: ${statusOf(invoice)}`,125,78);

 doc.setDrawColor(218,231,245);doc.line(15,91,195,91);doc.setFillColor(237,245,255);doc.roundedRect(15,98,180,18,3,3,"F");doc.setFont("helvetica","bold");doc.setTextColor(...navy);doc.text("SERVICE / PACKAGE",20,109);doc.text("AMOUNT",189,109,{align:"right"});doc.setFont("helvetica","normal");doc.text(doc.splitTextToSize(String(invoice.packageName||"Photography / Event Service"),120).slice(0,3),20,127);doc.text(`Rs. ${total.toFixed(2)}`,189,127,{align:"right"});doc.line(15,149,195,149);

 doc.setFillColor(237,245,255);doc.roundedRect(105,157,90,52,4,4,"F");doc.setTextColor(...gray);doc.text("Total Amount",111,169);doc.text("Received",111,181);doc.text("Pending Balance",111,193);doc.setFont("helvetica","bold");doc.setTextColor(...navy);doc.text(`Rs. ${total.toFixed(2)}`,189,169,{align:"right"});doc.setTextColor(18,125,94);doc.text(`Rs. ${received.toFixed(2)}`,189,181,{align:"right"});doc.setTextColor(177,115,36);doc.text(`Rs. ${balance.toFixed(2)}`,189,193,{align:"right"});

 doc.setTextColor(...navy);doc.setFont("helvetica","bold");doc.text("PAYMENT HISTORY",15,223);

 let y=234;const history=historyOf(invoice).filter(validTx);

 if(!history.length){doc.setFont("helvetica","normal");doc.setTextColor(...gray);doc.text("No payments received yet.",15,y)}

 else history.forEach((tx,i)=>{if(y>264){doc.addPage();y=25}doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(...gray);doc.text(`${i+1}. ${showDate(tx.date)} - ${tx.method||"Cash"}`,15,y);doc.setTextColor(...navy);doc.text(`Rs. ${txAmount(tx).toFixed(2)}`,189,y,{align:"right"});y+=9});

 for(let page=1;page<=doc.internal.getNumberOfPages();page++){doc.setPage(page);doc.setDrawColor(218,231,245);doc.line(15,278,195,278);doc.setFontSize(9);doc.setTextColor(...gray);doc.text("Thank you for choosing Studio Raw Picturez!",105,286,{align:"center"})}

 const filename=`Invoice-${String(invoice.invoice||invoice.id).replace(/[^a-zA-Z0-9_-]/g,"_")}.pdf`;

 if(action==="print"){const url=doc.output("bloburl");if(!window.open(url,"_blank")){doc.save(filename);window.alert("Popup blocked. Invoice downloaded instead.")}}else doc.save(filename);

}

export default function Payments(){

 const [payments,setPayments]=useState(()=>read(KEYS.payments)),[bookings,setBookings]=useState(()=>readModule(KEYS.bookings,"studio_raw_bookings")),[customers,setCustomers]=useState(()=>readModule(KEYS.customers,"studioraw_customers")),[counts,setCounts]=useState(readCounts);

 const refresh=()=>{
   setBookings(readModule(KEYS.bookings,"studio_raw_bookings"));
   setCustomers(readModule(KEYS.customers,"studioraw_customers"));
   setPayments(read(KEYS.payments));
   setCounts(readCounts());
 };

 const [search,setSearch]=useState(""),[statusFilter,setStatusFilter]=useState("All"),[monthFilter,setMonthFilter]=useState("All");

 const [modal,setModal]=useState(""),[selected,setSelected]=useState(null),[editing,setEditing]=useState(null),[form,setForm]=useState({...EMPTY,date:today()}),[receipt,setReceipt]=useState({amount:"",method:"Cash",date:today(),note:""}),[error,setError]=useState(""),[notice,setNotice]=useState("");

 const invoices=useMemo(()=>payments.map(normalized),[payments]);

 useEffect(()=>{

   let isMounted=true;

   api.payments.list().then(res=>{

     const items=Array.isArray(res)?res:res?.results;

     if(isMounted&&Array.isArray(items)&&items.length>0){

       const mapped=items.map(p=>({

         id:p.id,

         invoice:p.transaction_id||`SRP-${p.id}`,

         customer:p.customer_name||"Customer",

         bookingId:p.booking||"",

         total:Number(p.total_amount)||Number(p.amount)||0,

         advance:Number(p.paid_amount)||0,

         date:p.payment_date||today(),

         method:p.payment_method||"Cash",

         status:p.status||"Pending",

         notes:p.notes||"",

         transactions:[],

       }));

       setPayments(mapped);

     }

   }).catch(err=>console.warn("Using local payments fallback:",err.message));

   const listener=()=>refresh();

   window.addEventListener("storage",listener);

   window.addEventListener(EVENT,listener);

   window.addEventListener("focus",listener);

   const timer=window.setInterval(listener,5000);

   return()=>{isMounted=false;window.removeEventListener("storage",listener);window.removeEventListener(EVENT,listener);window.removeEventListener("focus",listener);window.clearInterval(timer)};

 },[]);

 const countAction=k=>{const current=readCounts(),next={...current,[k]:current[k]+1};try{localStorage.setItem(KEYS.actions,JSON.stringify(next));setCounts(next)}catch{setCounts(next)}};

 const save=next=>{try{localStorage.setItem(KEYS.payments,JSON.stringify(next));setPayments(next);window.dispatchEvent(new CustomEvent(EVENT,{detail:{module:"payments",key:KEYS.payments}}));setNotice("Payment records updated successfully.");return true}catch{setError("Unable to save payment data.");return false}};

 const close=()=>{setModal("");setSelected(null);setEditing(null);setError("")};

 const openCreate=()=>{setEditing(null);setForm({...EMPTY,date:today()});setError("");setModal("form")};

 const openEdit=i=>{setEditing(i);setForm({customerId:String(i.customerId||""),bookingId:String(i.bookingId||""),customer:i.customer||"",phone:i.phone||"",packageName:i.packageName||"",total:String(totalOf(i)),initialPayment:"",method:i.method||"Cash",date:dateOf(i.date)||today(),notes:i.notes||""});setError("");setModal("form")};

 const openCollect=i=>{setSelected(i);setReceipt({amount:"",method:"Cash",date:today(),note:""});setError("");setModal("collect")};

 const chooseCustomer=id=>{const c=customers.find(c=>String(c.id)===String(id));setForm(p=>({...p,customerId:id,bookingId:"",customer:c?nameOf(c):"",phone:c?.phone||"",packageName:"",total:""}))};

 const chooseBooking=id=>{const b=bookings.find(b=>String(b.id)===String(id));if(!b){setForm(p=>({...p,bookingId:""}));return}const c=customers.find(c=>String(c.id)===String(b.customerId));setForm(p=>({...p,bookingId:String(b.id),customerId:String(b.customerId||p.customerId||""),customer:nameOf(b)||nameOf(c)||p.customer,phone:b.phone||c?.phone||p.phone,packageName:b.package||b.packageName||b.event||"",total:String(bookingTotal(b))}))};

 const availableBookings=useMemo(()=>!form.customerId?bookings:bookings.filter(b=>String(b.customerId||"")===String(form.customerId)),[bookings,form.customerId]);

 const linkedInvoice=useMemo(()=>!editing&&form.bookingId?invoices.find(i=>String(i.bookingId||"")===String(form.bookingId)):null,[editing,form.bookingId,invoices]);

 const submitInvoice=async e=>{

  e.preventDefault();setError("");const total=round(number(form.total)),initial=round(number(form.initialPayment));

  if(!form.customer.trim())return setError("Customer name is required.");

  if(total<=0)return setError("Enter a valid total amount.");

  if(!editing&&(initial<0||initial>total))return setError("Advance must be between 0 and the invoice total.");

  if(editing&&total<paidOf(editing))return setError("Invoice total cannot be lower than amount already received.");

  if(form.bookingId){const duplicate=invoices.find(i=>String(i.bookingId||"")===String(form.bookingId)&&String(i.id)!==String(editing?.id||""));if(duplicate)return setError(`This booking already has invoice ${duplicate.invoice||duplicate.id}. Use Add Payment on the existing invoice.`);}

  const now=new Date().toISOString();

  if(editing){

    try{await api.payments.update(editing.id,{customer_name:form.customer.trim(),total_amount:total,payment_method:form.method,notes:form.notes.trim()});}catch(err){console.warn("Backend payment update notice:",err.message);}

    const next=payments.map(item=>{if(String(item.id)!==String(editing.id))return item;const prev=normalized(item),updated={...prev,customerId:form.customerId,bookingId:form.bookingId,customer:form.customer.trim(),phone:form.phone.trim(),packageName:form.packageName.trim(),total,date:form.date||today(),method:form.method,notes:form.notes.trim(),updatedAt:now};return {...updated,advance:paidOf(updated),status:statusOf(updated)}});if(save(next))close();return;

  }

  let createdId=uid("PAY");

  const invNumber=nextInvoiceNumber(payments);

  try{

    const remote=await api.payments.create({customer_name:form.customer.trim(),total_amount:total,paid_amount:initial,payment_method:form.method,payment_date:form.date||today(),status:initial>=total?"Paid":initial>0?"Partial":"Pending",transaction_id:invNumber,notes:form.notes.trim()});

    if(remote&&remote.id)createdId=remote.id;

  }catch(err){console.warn("Backend payment create notice:",err.message);}

  const transactions=initial>0?[{id:uid("TXN"),amount:initial,method:form.method,date:form.date||today(),note:"Initial / Advance Payment",status:"Paid",createdAt:now}]:[];

  const invoice={id:createdId,invoice:invNumber,customerId:form.customerId,bookingId:form.bookingId,customer:form.customer.trim(),phone:form.phone.trim(),packageName:form.packageName.trim(),total,advance:initial,method:form.method,date:form.date||today(),notes:form.notes.trim(),transactions,createdAt:now,updatedAt:now};

  invoice.status=statusOf(invoice);if(save([invoice,...payments]))close();

 };

 const collectPayment=async e=>{

  e.preventDefault();setError("");if(!selected)return;

  const latest=read(KEYS.payments),raw=latest.find(i=>String(i.id)===String(selected.id));

  if(!raw)return setError("Invoice not found. Refresh and try again.");

  const amount=round(number(receipt.amount)),pending=balanceOf(raw);

  if(amount<=0||amount>pending)return setError(`Enter an amount between Rs. 0.01 and ${money(pending)}.`);

  const now=new Date().toISOString();

  const newPaid=round(paidOf(raw)+amount);

  const newStatus=newPaid>=totalOf(raw)?"Paid":"Partial";

  try{await api.payments.update(selected.id,{paid_amount:newPaid,status:newStatus,payment_method:receipt.method});}catch(err){console.warn("Backend collect update notice:",err.message);}

  const next=latest.map(item=>{if(String(item.id)!==String(selected.id))return item;const invoice=normalized(item),updated={...invoice,transactions:[...invoice.transactions,{id:uid("TXN"),amount,method:receipt.method,date:receipt.date||today(),note:receipt.note.trim(),status:"Paid",createdAt:now}],method:receipt.method,updatedAt:now};return {...updated,advance:paidOf(updated),status:statusOf(updated)}});

  if(save(next)){setNotice(`Payment ${money(amount)} added to invoice ${selected.invoice||selected.id}. Same invoice number retained.`);close();}

 };

 const deleteInvoice=async ()=>{if(!selected)return;if(paidOf(selected)>0)return setError("Invoice has received payments. Deleting it would erase payment history. Keep the invoice for your records.");try{await api.payments.delete(selected.id);}catch(err){console.warn("Backend delete notice:",err.message);}if(save(payments.filter(i=>String(i.id)!==String(selected.id)))){countAction("delete");close()}};

 const summary=useMemo(()=>({total:round(invoices.reduce((s,i)=>s+totalOf(i),0)),received:round(invoices.reduce((s,i)=>s+paidOf(i),0)),pending:round(invoices.reduce((s,i)=>s+balanceOf(i),0)),paid:invoices.filter(i=>statusOf(i)==="Paid").length,partial:invoices.filter(i=>statusOf(i)==="Partial").length}),[invoices]);

 const percent=summary.total?Math.min(100,summary.received/summary.total*100):0;

 const months=useMemo(()=>[...new Set(invoices.map(i=>dateOf(i.date).slice(0,7)).filter(Boolean))].sort().reverse(),[invoices]);

 const filtered=useMemo(()=>invoices.filter(i=>(statusFilter==="All"||statusOf(i)===statusFilter)&&(monthFilter==="All"||dateOf(i.date).slice(0,7)===monthFilter)&&(!search.trim()||[i.invoice,i.customer,i.phone,i.packageName,i.bookingId,i.method,statusOf(i)].some(v=>String(v||"").toLowerCase().includes(search.trim().toLowerCase())))).sort((a,b)=>String(b.date).localeCompare(String(a.date))),[invoices,search,statusFilter,monthFilter]);

 const exportCSV=()=>{const rows=[["Invoice","Date","Customer","Phone","Booking ID","Package","Total","Received","Pending","Status"],...filtered.map(i=>[i.invoice,i.date,i.customer,i.phone,i.bookingId,i.packageName,totalOf(i),paidOf(i),balanceOf(i),statusOf(i)])];const esc=v=>{const raw=String(v??""),safe=/^\s*[=+\-@\t\r]/.test(raw)?"'"+raw:raw;return `"${safe.replace(/"/g,'""')}"`};const blob=new Blob(["\uFEFF"+rows.map(r=>r.map(esc).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`StudioRaw-Payments-${today()}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};

 const actionButtons=i=><div className="flex flex-wrap items-center gap-2">

  {balanceOf(i)>0&&<button type="button" title="Add Payment to Same Invoice" onClick={()=>openCollect(i)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#e0f7eb] px-3 py-2.5 text-xs font-black text-[#168363] hover:bg-[#c8eedb]"><Plus size={16}/>Add Payment</button>}

  <button type="button" title="Payment History" onClick={()=>{setSelected(i);setModal("history")}} className="rounded-xl bg-[#f1ebff] p-2.5 text-[#7457b5]"><History size={18}/></button>

  <button type="button" title="Download PDF" onClick={()=>pdfInvoice(i)} className="rounded-xl bg-[#e7f3ff] p-2.5 text-[#3474ad]"><Download size={18}/></button>

  <button type="button" title="Print Invoice" onClick={()=>{pdfInvoice(i,"print");countAction("print")}} className="rounded-xl bg-[#e7f3ff] p-2.5 text-[#3474ad]"><Printer size={18}/></button>

  <button type="button" title="Edit Invoice Details" onClick={()=>{countAction("edit");openEdit(i)}} className="rounded-xl bg-[#fff0db] p-2.5 text-[#b27b2a]"><Pencil size={18}/></button>

  <button type="button" title="Delete Invoice" onClick={()=>{setSelected(i);setError("");setModal("delete")}} className="rounded-xl bg-[#ffe7ec] p-2.5 text-[#c64f69]"><Trash2 size={18}/></button>

 </div>;

 return <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-[#f5faff] via-[#edf5ff] to-[#e6f1ff] px-3 py-5 text-[#10264d] sm:px-5 sm:py-7 lg:px-8">

 <style>{`@keyframes srPayEnter{from{opacity:0;transform:perspective(1200px) translateY(22px) rotateX(3deg)}to{opacity:1;transform:perspective(1200px) translateY(0) rotateX(0)}}@keyframes srPayFloat{0%,100%{transform:perspective(1200px) translateY(0)}50%{transform:perspective(1200px) translateY(-7px) rotateX(1deg)}}.sr-payment-3d{animation:srPayEnter .65s ease-out both,srPayFloat 5.5s ease-in-out .65s infinite;transform-style:preserve-3d}.sr-payment-3d:hover{animation-play-state:paused;box-shadow:0 18px 35px rgba(16,38,77,.12)}@media(prefers-reduced-motion:reduce){.sr-payment-3d{animation:none!important}}`}</style>

 <div className="mx-auto max-w-[1650px] space-y-6">

 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcecff] text-[#245f9f]"><Wallet size={24}/></div><div><h1 className="text-xl font-black sm:text-2xl">Payments</h1><p className="mt-1 text-xs text-[#8099b3]">Studio Raw Picturez / Finance</p></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={refresh} className="flex items-center gap-2 rounded-xl border border-[#d5e5f5] bg-white px-4 py-3 text-sm font-bold text-[#2867a7]"><RefreshCw size={17}/>Refresh</button><button type="button" onClick={exportCSV} className="flex items-center gap-2 rounded-xl border border-[#d5e5f5] bg-white px-4 py-3 text-sm font-bold text-[#2867a7]"><Download size={17}/>Export CSV</button><button type="button" onClick={openCreate} className={button}><Plus size={18}/>Add Invoice</button></div></div>

 {notice&&<div className="flex items-center justify-between gap-3 rounded-xl border border-[#bce8d0] bg-[#eafaf1] p-3 text-sm font-bold text-[#177d5f]"><span className="flex items-center gap-2"><CheckCircle2 size={18}/>{notice}</span><button type="button" onClick={()=>setNotice("")}><X size={17}/></button></div>}

 <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"><Stat title="Total Invoice Amount" value={money(summary.total)} subtitle={`${invoices.length} invoices`} icon={Receipt}/><Stat title="Amount Received" value={money(summary.received)} subtitle={`${summary.paid} fully paid`} icon={CheckCircle2} color="green"/><Stat title="Pending Balance" value={money(summary.pending)} subtitle="Outstanding amount" icon={Clock3} color="amber"/><Stat title="Partial Payments" value={summary.partial} subtitle="Partially paid invoices" icon={CreditCard} color="purple"/></div>

 <div className="space-y-3"><div><h2 className="text-sm font-black text-[#153d70] sm:text-base">Action Activity</h2><p className="mt-1 text-xs text-[#8ba2ba]">Automatic Print, Edit and Delete tracking</p></div><div className="grid grid-cols-3 gap-3 sm:gap-4">{[["Print Count",counts.print,Printer],["Edit Count",counts.edit,Pencil],["Delete Count",counts.delete,Trash2]].map(([title,count,Icon])=><div key={title} className="rounded-[22px] border border-[#dbe8f7] bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-2"><div><p className="text-xs font-bold text-[#7994ad]">{title}</p><h3 className="mt-2 text-2xl font-black text-[#10264d]">{count.toLocaleString("en-IN")}</h3></div><div className="rounded-2xl bg-[#e6f1ff] p-3 text-[#2869ac]"><Icon size={21}/></div></div><p className="mt-3 border-t border-[#edf3fa] pt-3 text-[11px] text-[#91a7bd]">Automatically tracked actions</p></div>)}</div></div>

 <div className="rounded-[24px] border border-[#d9e7f6] bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-[#153d70]">Payment Collection Overview</h2><p className="mt-1 text-xs text-[#8ba2ba]">Total received and outstanding amount</p></div><span className="rounded-xl bg-[#e5f6ed] px-4 py-2 text-sm font-black text-[#168363]">{percent.toFixed(1)}% Collected</span></div><div className="mt-5 h-4 overflow-hidden rounded-full bg-[#e7eff9]"><div className="h-full rounded-full bg-gradient-to-r from-[#17866c] to-[#77d1b7] transition-all duration-700" style={{width:`${percent}%`}}/></div><div className="mt-4 flex flex-wrap justify-between gap-3 text-xs font-bold"><span className="text-[#168363]">Received: {money(summary.received)}</span><span className="text-[#b77b2c]">Pending: {money(summary.pending)}</span></div></div>

 <div className="flex flex-col gap-3 rounded-[22px] border border-[#d9e7f6] bg-white p-4 lg:flex-row"><div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ba3ba]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoice, customer, booking..." className={`${input} pl-11`}/></div><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className={`${input} lg:w-44`}>{["All","Paid","Partial","Pending"].map(s=><option key={s} value={s}>{s==="All"?"All Status":s}</option>)}</select><select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)} className={`${input} lg:w-48`}><option value="All">All Months</option>{months.map(m=><option key={m} value={m}>{m}</option>)}</select></div>

 <div className="overflow-hidden rounded-[25px] border border-[#d9e7f6] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#e3edf7] p-5"><div><h2 className="font-black text-[#10264d]">Payment Records</h2><p className="mt-1 text-xs text-[#8ca2b9]">{filtered.length} invoices · Add Payment updates the same invoice number</p></div><Receipt size={22} className="text-[#3575b6]"/></div>

 {filtered.length?<><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1350px] text-left"><thead className="bg-[#edf5ff]"><tr>{["Invoice","Customer","Date","Service","Total","Received","Pending","Status","Actions"].map(h=><th key={h} className="whitespace-nowrap px-4 py-4 text-[11px] font-black uppercase tracking-wide text-[#6685a4]">{h}</th>)}</tr></thead><tbody className="divide-y divide-[#e8eff8]">{filtered.map(i=><tr key={i.id} className="hover:bg-[#f5faff]"><td className="px-4 py-4 text-sm font-black text-[#245f9f]">{i.invoice||i.id}</td><td className="px-4 py-4"><p className="text-sm font-bold text-[#173f72]">{i.customer}</p><p className="mt-1 text-xs text-[#8ba2b9]">{i.phone||"—"}</p></td><td className="whitespace-nowrap px-4 py-4 text-sm text-[#6785a4]">{showDate(i.date)}</td><td className="px-4 py-4 text-sm text-[#6785a4]">{i.packageName||"—"}</td><td className="px-4 py-4 text-sm font-black text-[#173f72]">{money(totalOf(i))}</td><td className="px-4 py-4 text-sm font-black text-[#168363]">{money(paidOf(i))}</td><td className="px-4 py-4 text-sm font-black text-[#b77b2c]">{money(balanceOf(i))}</td><td className="px-4 py-4"><Badge status={statusOf(i)}/></td><td className="px-4 py-4">{actionButtons(i)}</td></tr>)}</tbody></table></div>

 <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">{filtered.map(i=><div key={i.id} className="rounded-2xl border border-[#dce8f6] bg-[#fbfdff] p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="break-all text-sm font-black text-[#245f9f]">{i.invoice||i.id}</p><p className="mt-1 text-xs text-[#8ba2b9]">{showDate(i.date)}</p></div><Badge status={statusOf(i)}/></div><p className="mt-4 font-black text-[#173f72]">{i.customer}</p><p className="mt-1 text-xs text-[#819ab3]">{i.phone||"No phone"}</p><p className="mt-2 text-xs text-[#6785a4]">{i.packageName||"Photography / Event"}</p><div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#edf5ff] p-3">{[["Total",totalOf(i)],["Received",paidOf(i)],["Pending",balanceOf(i)]].map(([label,v])=><div key={label}><p className="text-[10px] text-[#829ab3]">{label}</p><p className="mt-1 break-words text-xs font-black text-[#173f72]">{money(v)}</p></div>)}</div><div className="mt-4 border-t border-[#e5edf7] pt-3">{actionButtons(i)}</div></div>)}</div></>:<div className="flex flex-col items-center justify-center py-20 text-center"><Receipt size={42} className="text-[#82acd5]"/><h3 className="mt-4 font-black text-[#24558a]">No Payment Records</h3><p className="mt-2 text-sm text-[#8ba2b9]">Add your first invoice or change filters.</p></div>}</div>

 </div>

 {modal==="form"&&<Modal title={editing?"Edit Invoice":"Create New Invoice"} subtitle={editing?`Invoice ${editing.invoice||editing.id} · Same number retained`:"Studio Raw Picturez Payment Form"} icon={Receipt} onClose={close}><form onSubmit={submitInvoice} className="space-y-5">

 {editing&&<div className="rounded-xl border border-[#cfe3f8] bg-[#eaf4ff] p-4 text-sm font-bold text-[#245f9f]">Invoice Number: {editing.invoice||editing.id} (unchanged)<p className="mt-2 text-xs font-medium">To collect a new installment, use Add Payment. Editing invoice details does not replace old payment history.</p><button type="button" onClick={()=>openCollect(editing)} disabled={balanceOf(editing)<=0} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#168363] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"><Plus size={16}/>Add Payment to This Invoice</button></div>}

 <Field label="Select Customer"><select value={form.customerId} onChange={e=>chooseCustomer(e.target.value)} className={input}><option value="">Manual Entry / Select Customer</option>{customers.map(c=><option key={c.id} value={String(c.id)}>{nameOf(c)}</option>)}</select></Field>

 <Field label="Select Booking"><select value={form.bookingId} onChange={e=>chooseBooking(e.target.value)} className={input}><option value="">Manual Invoice / Select Booking</option>{availableBookings.map(b=><option key={b.id} value={String(b.id)}>{nameOf(b)} - {b.event||"Booking"} - {money(bookingTotal(b))}</option>)}</select></Field>

 {linkedInvoice&&<div className="rounded-xl border border-[#bce8d0] bg-[#eafaf1] p-4 text-sm text-[#177d5f]"><p className="font-black">Existing Invoice Found: {linkedInvoice.invoice||linkedInvoice.id}</p><p className="mt-1 text-xs">Do not create another invoice. Add the new payment to the existing invoice.</p><button type="button" onClick={()=>openCollect(linkedInvoice)} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#168363] px-4 py-2.5 text-xs font-bold text-white"><Plus size={16}/>Add Payment to Existing Invoice</button></div>}

 {[[ "Customer Name","customer","text"],["Phone Number","phone","tel"],["Package / Service","packageName","text"],["Total Invoice Amount","total","number"]].map(([label,key,type])=><Field key={key} label={label} required={key==="customer"||key==="total"}><input type={type} min={type==="number"?"0.01":undefined} step={type==="number"?"0.01":undefined} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} className={input} required={key==="customer"||key==="total"}/></Field>)}

 {!editing&&<Field label="Advance Payment"><input type="number" min="0" step="0.01" value={form.initialPayment} onChange={e=>setForm(p=>({...p,initialPayment:e.target.value}))} className={input} placeholder="Enter advance amount"/></Field>}

 <Field label="Invoice Date"><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} className={input}/></Field>

 <Field label="Payment Method"><select value={form.method} onChange={e=>setForm(p=>({...p,method:e.target.value}))} className={input}>{METHODS.map(m=><option key={m}>{m}</option>)}</select></Field>

 <Field label="Notes"><textarea rows={3} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className={`${input} resize-none`}/></Field>

 <div className="rounded-2xl bg-[#eaf4ff] p-4"><p className="text-xs font-bold text-[#6e8ca9]">Payment Summary</p>{[["Total",number(form.total)],["Received",editing?paidOf(editing):number(form.initialPayment)],["Pending",Math.max(0,number(form.total)-(editing?paidOf(editing):number(form.initialPayment)))]].map(([label,value])=><div key={label} className="mt-3 flex justify-between gap-3 text-sm"><span>{label}</span><strong>{money(value)}</strong></div>)}</div>

 {error&&<p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#c34b65]">{error}</p>}

 <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row"><button type="button" onClick={close} className="flex-1 rounded-xl border border-[#d5e4f4] bg-white px-5 py-3 text-sm font-bold">Cancel</button><button type="submit" disabled={!!linkedInvoice} className={`${button} flex-1 disabled:cursor-not-allowed disabled:opacity-40`}><Save size={17}/>{editing?"Save Changes":"Save & Generate Invoice"}</button></div>

 </form></Modal>}

 {modal==="collect"&&selected&&<Modal title="Add Payment to Existing Invoice" subtitle={`Same Invoice Number: ${selected.invoice||selected.id}`} icon={IndianRupee} onClose={close} width="max-w-lg"><form onSubmit={collectPayment} className="space-y-5"><div className="rounded-2xl bg-[#eaf4ff] p-5"><p className="font-black text-[#173e72]">{selected.customer}</p><p className="mt-1 text-xs font-bold text-[#2869ac]">{selected.invoice||selected.id}</p>{[["Total",totalOf(selected)],["Already Received",paidOf(selected)],["Pending",balanceOf(selected)]].map(([label,v])=><div key={label} className="mt-3 flex justify-between border-t border-[#d0e3f5] pt-3 text-sm"><span>{label}</span><strong>{money(v)}</strong></div>)}</div>

 <Field label="New Payment Amount" required><input type="number" min="0.01" step="0.01" max={balanceOf(selected)} value={receipt.amount} onChange={e=>setReceipt(p=>({...p,amount:e.target.value}))} className={input} required/></Field><button type="button" onClick={()=>setReceipt(p=>({...p,amount:String(balanceOf(selected))}))} className="text-xs font-bold text-[#2869ac]">Collect Full Pending</button>

 <Field label="Payment Method"><select value={receipt.method} onChange={e=>setReceipt(p=>({...p,method:e.target.value}))} className={input}>{METHODS.map(m=><option key={m}>{m}</option>)}</select></Field><Field label="Payment Date"><input type="date" value={receipt.date} onChange={e=>setReceipt(p=>({...p,date:e.target.value}))} className={input}/></Field><Field label="Notes"><textarea rows={3} value={receipt.note} onChange={e=>setReceipt(p=>({...p,note:e.target.value}))} className={`${input} resize-none`}/></Field>

 {error&&<p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#c34b65]">{error}</p>}<button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#168363] px-5 py-3 text-sm font-bold text-white"><CheckCircle2 size={18}/>Save Payment to Same Invoice</button></form></Modal>}

 {modal==="history"&&selected&&<Modal title="Payment History" subtitle={`Invoice ${selected.invoice||selected.id}`} icon={History} onClose={close} width="max-w-lg"><div className="space-y-4"><div className="rounded-xl bg-[#eaf4ff] p-4"><p className="font-black text-[#173e72]">{selected.customer}</p><p className="mt-2 text-xs">Total {money(totalOf(selected))} · Received {money(paidOf(selected))} · Pending {money(balanceOf(selected))}</p></div>{historyOf(selected).length?historyOf(selected).map((tx,index)=><div key={tx.id||index} className="rounded-xl border border-[#dce8f6] bg-white p-4"><div className="flex justify-between gap-3"><p className="text-sm font-bold text-[#173e72]">Payment {index+1}</p><p className="text-sm font-black text-[#168363]">{money(txAmount(tx))}</p></div><p className="mt-2 text-xs text-[#819ab3]">{showDate(tx.date)} · {tx.method||"Cash"} · {tx.status||"Paid"}</p>{tx.note&&<p className="mt-2 text-xs text-[#6785a4]">{tx.note}</p>}</div>):<p className="text-sm text-[#819ab3]">No payments received yet.</p>}{balanceOf(selected)>0&&<button type="button" onClick={()=>openCollect(selected)} className={`${button} w-full`}><Plus size={17}/>Add Payment</button>}<button type="button" onClick={()=>pdfInvoice(selected)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce8f6] bg-white px-4 py-3 text-sm font-bold text-[#2869ac]"><Download size={17}/>Download Updated Invoice</button></div></Modal>}

 {modal==="delete"&&selected&&<Modal title="Delete Invoice" subtitle="Confirm deletion" icon={Trash2} onClose={close} width="max-w-md"><div className="space-y-5"><div className="rounded-xl bg-[#fff0f3] p-5 text-sm leading-6 text-[#ad4961]"><AlertCircle className="mb-3"/>Delete invoice <strong>{selected.invoice||selected.id}</strong> for <strong>{selected.customer}</strong>?{paidOf(selected)>0&&<p className="mt-2 font-bold">This invoice contains payments and cannot be deleted here.</p>}</div>{error&&<p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#c34b65]">{error}</p>}<div className="flex gap-3"><button type="button" onClick={close} className="flex-1 rounded-xl border border-[#d5e4f4] bg-white px-5 py-3 text-sm font-bold">Cancel</button><button type="button" onClick={deleteInvoice} disabled={paidOf(selected)>0} className="flex-1 rounded-xl bg-[#c34b65] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">Delete Invoice</button></div></div></Modal>}

 </div>;

}
