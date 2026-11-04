import React from "react";
import { Building2, MapPin, Users, Phone, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function Branches() {
  const branches = [
    {
      id: "BR-01",
      name: "Main Branch · Nagercoil",
      type: "Headquarters & Central Studio",
      address: "Cape Road, Nagercoil, Tamil Nadu - 629001",
      phone: "+91 98765 43210",
      email: "nagercoil@studiorawpicturez.com",
      status: "Active",
      staffCount: 18,
      shootsCount: 42,
    },
    {
      id: "BR-02",
      name: "Chennai Hub",
      type: "Destination & Editing Studio",
      address: "T. Nagar, Chennai, Tamil Nadu - 600017",
      phone: "+91 98765 01234",
      email: "chennai@studiorawpicturez.com",
      status: "Expansion",
      staffCount: 8,
      shootsCount: 16,
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f7f9fd] px-3.5 py-4 sm:px-6 sm:py-7 text-[#10264d]">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10264d] to-[#254f8e] text-white shadow-md">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#10264d]">
                Branches & Locations
              </h1>
              <p className="text-xs font-semibold text-[#647c9d]">
                Studio Raw Picturez multi-branch infrastructure
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#1a4a88]">
            <Sparkles size={13} /> Multi-Branch Network
          </span>
        </div>

        {/* BRANCH CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {branches.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-[#dce7f5] bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#edf3fa] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#10264d]">{b.name}</h3>
                  <p className="text-xs font-semibold text-[#6682a3]">{b.type}</p>
                </div>
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                  {b.status}
                </span>
              </div>

              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-[#254f8e]" />
                  <span>{b.address}</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-[#10264d]">
                  <Phone size={14} className="text-[#254f8e]" />
                  <a href={`tel:${b.phone}`} className="hover:underline">{b.phone}</a>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail size={14} className="text-[#254f8e]" />
                  <a href={`mailto:${b.email}`} className="truncate hover:underline">{b.email}</a>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#edf3fa] pt-3 text-center">
                <div className="rounded-xl bg-[#f8fbff] p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7990af]">Staff</span>
                  <p className="text-sm font-black text-[#10264d]">{b.staffCount} Members</p>
                </div>
                <div className="rounded-xl bg-[#f8fbff] p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7990af]">Shoots</span>
                  <p className="text-sm font-black text-[#10264d]">{b.shootsCount} Events</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
