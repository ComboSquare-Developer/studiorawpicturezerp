import React, { useState } from "react";
import { Wrench, Camera, Video, Sparkles, CheckCircle2, AlertTriangle, Search, Plus } from "lucide-react";

export default function Equipment() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const equipmentList = [
    {
      id: "EQ-001",
      name: "Sony FX3 Full-Frame Cinema Camera",
      category: "Camera Body",
      serial: "SN-8492019",
      status: "Available",
      assignedTo: "Arun Kumar",
      health: "100%",
    },
    {
      id: "EQ-002",
      name: "Sony A7 IV Full-Frame Hybrid",
      category: "Camera Body",
      serial: "SN-7391024",
      status: "In Shoot",
      assignedTo: "Karthik M",
      health: "98%",
    },
    {
      id: "EQ-003",
      name: "Sony FE 24-70mm f/2.8 GM II",
      category: "Lens",
      serial: "SN-5819032",
      status: "Available",
      assignedTo: "Unassigned",
      health: "100%",
    },
    {
      id: "EQ-004",
      name: "DJI Mavic 3 Pro Cine Drone",
      category: "Drone",
      serial: "SN-3910294",
      status: "In Shoot",
      assignedTo: "Vignesh",
      health: "95%",
    },
    {
      id: "EQ-005",
      name: "Godox AD600 Pro Strobe Kit",
      category: "Lighting",
      serial: "SN-4810294",
      status: "Available",
      assignedTo: "Studio 1",
      health: "100%",
    },
    {
      id: "EQ-006",
      name: "DJI RS 3 Pro Gimbal Stabilizer",
      category: "Gimbal",
      serial: "SN-2940194",
      status: "Maintenance",
      assignedTo: "Service Bay",
      health: "85%",
    },
  ];

  const filtered = equipmentList.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.serial.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f7f9fd] px-3.5 py-4 sm:px-6 sm:py-7 text-[#10264d]">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10264d] to-[#254f8e] text-white shadow-md">
              <Wrench size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#10264d]">
                Equipment & Gear Management
              </h1>
              <p className="text-xs font-semibold text-[#647c9d]">
                Cameras, lenses, cinema rigs, drones and lighting inventory
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#1a4a88]">
            <Sparkles size={13} /> {equipmentList.length} Registered Gears
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="rounded-2xl border border-[#dce7f5] bg-white p-3.5 sm:p-4 shadow-sm">
            <p className="text-xs font-bold text-[#647c9d]">Total Assets</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-[#10264d]">{equipmentList.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 sm:p-4 shadow-sm">
            <p className="text-xs font-bold text-emerald-800">Available</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-700">
              {equipmentList.filter((e) => e.status === "Available").length}
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5 sm:p-4 shadow-sm">
            <p className="text-xs font-bold text-blue-800">On Live Shoot</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-[#1a4a88]">
              {equipmentList.filter((e) => e.status === "In Shoot").length}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 sm:p-4 shadow-sm">
            <p className="text-xs font-bold text-amber-800">Service / Check</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-amber-700">
              {equipmentList.filter((e) => e.status === "Maintenance").length}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-[#dce7f5] bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8299b7]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment by model, serial, or category..."
              className="w-full rounded-xl border border-[#dce7f5] bg-[#f9fbfe] py-2 pl-9 pr-3 text-xs font-semibold text-[#10264d] outline-none focus:border-[#244d8b]"
            />
          </div>
          <div className="flex items-center gap-2">
            {["All", "Available", "In Shoot", "Maintenance"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  filter === s
                    ? "bg-[#10264d] text-white shadow-sm"
                    : "border border-[#dce7f5] bg-white text-[#526b8b] hover:bg-[#edf5ff]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* GEAR LIST - RESPONSIVE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#edf3fa] pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7990af]">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#10264d] line-clamp-1">{item.name}</h3>
                  <p className="font-mono text-[10px] text-slate-400">{item.serial}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    item.status === "Available"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : item.status === "In Shoot"
                      ? "border border-blue-200 bg-blue-50 text-blue-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[#f8fbff] p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7990af]">Assigned To</span>
                  <p className="mt-0.5 font-bold text-[#10264d] truncate">{item.assignedTo}</p>
                </div>
                <div className="rounded-xl bg-[#f8fbff] p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7990af]">Condition</span>
                  <p className="mt-0.5 font-black text-emerald-700">{item.health}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
