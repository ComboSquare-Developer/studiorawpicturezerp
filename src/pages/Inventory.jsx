import React, { useState } from "react";
import { Package, Boxes, AlertTriangle, CheckCircle2, Search, ArrowUpDown, Plus, Sparkles } from "lucide-react";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const inventoryItems = [
    {
      id: "INV-101",
      name: "Premium Leather Wedding Album (12x36)",
      category: "Albums",
      sku: "ALB-LTH-1236",
      inStock: 48,
      minStock: 15,
      unitPrice: "₹1,850",
      status: "In Stock",
      location: "Rack A-2",
    },
    {
      id: "INV-102",
      name: "Custom Engraved Wooden USB Gift Box (64GB)",
      category: "Media",
      sku: "USB-WD-64G",
      inStock: 120,
      minStock: 30,
      unitPrice: "₹450",
      status: "In Stock",
      location: "Drawer B-1",
    },
    {
      id: "INV-103",
      name: "Crystal Acrylic Tabletop Photo Frame (8x12)",
      category: "Frames",
      sku: "FRM-ACR-812",
      inStock: 8,
      minStock: 20,
      unitPrice: "₹720",
      status: "Low Stock",
      location: "Rack C-3",
    },
    {
      id: "INV-104",
      name: "High Gloss Lustre Photo Paper (Roll 24\")",
      category: "Printing",
      sku: "PPR-LST-24R",
      inStock: 14,
      minStock: 10,
      unitPrice: "₹3,400",
      status: "In Stock",
      location: "Print Bay 1",
    },
    {
      id: "INV-105",
      name: "Velvet Ribbon Luxury Delivery Bags",
      category: "Packaging",
      sku: "PKG-VLV-BAG",
      inStock: 4,
      minStock: 25,
      unitPrice: "₹85",
      status: "Low Stock",
      location: "Packing Section",
    },
    {
      id: "INV-106",
      name: "Canvas Stretcher Wooden Bars (16x24)",
      category: "Canvas",
      sku: "CNV-BAR-1624",
      inStock: 35,
      minStock: 15,
      unitPrice: "₹320",
      status: "In Stock",
      location: "Framing Dept",
    },
  ];

  const filtered = inventoryItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f7f9fd] px-3.5 py-4 sm:px-6 sm:py-7 text-[#10264d]">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10264d] to-[#254f8e] text-white shadow-md">
              <Boxes size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#10264d]">
                Inventory & Stock
              </h1>
              <p className="text-xs font-semibold text-[#647c9d]">
                Albums, USB gift drives, framing supplies, papers and packaging
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#1a4a88]">
            <Sparkles size={13} /> {inventoryItems.length} Tracked SKUs
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="rounded-2xl border border-[#dce7f5] bg-white p-3.5 sm:p-4 shadow-sm">
            <p className="text-xs font-bold text-[#647c9d]">Total Items</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-[#10264d]">
              {inventoryItems.reduce((acc, curr) => acc + curr.inStock, 0)} pcs
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 sm:p-4 shadow-sm">
            <p className="text-xs font-bold text-emerald-800">Healthy Stock</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-700">
              {inventoryItems.filter((e) => e.status === "In Stock").length} SKUs
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 sm:p-4 shadow-sm">
            <p className="text-xs font-bold text-amber-800">Low Stock Alert</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-amber-700">
              {inventoryItems.filter((e) => e.status === "Low Stock").length} SKUs
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5 sm:p-4 shadow-sm">
            <p className="text-xs font-bold text-blue-800">Total Categories</p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-[#1a4a88]">
              {new Set(inventoryItems.map((e) => e.category)).size}
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-[#dce7f5] bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8299b7]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory by item name, SKU or category..."
              className="w-full rounded-xl border border-[#dce7f5] bg-[#f9fbfe] py-2 pl-9 pr-3 text-xs font-semibold text-[#10264d] outline-none focus:border-[#244d8b]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {["All", "In Stock", "Low Stock"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition ${
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

        {/* INVENTORY LIST - RESPONSIVE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#dce7f5] bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#edf3fa] pb-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7990af]">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#10264d] truncate">{item.name}</h3>
                  <p className="font-mono text-[10px] text-slate-400">{item.sku}</p>
                </div>
                <span
                  className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    item.status === "In Stock"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-[#f8fbff] p-2">
                  <span className="block text-[10px] font-bold text-[#7990af]">Stock</span>
                  <p className={`mt-0.5 font-black ${item.inStock <= item.minStock ? "text-amber-600" : "text-[#10264d]"}`}>
                    {item.inStock}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f8fbff] p-2">
                  <span className="block text-[10px] font-bold text-[#7990af]">Min Level</span>
                  <p className="mt-0.5 font-bold text-[#556e91]">{item.minStock}</p>
                </div>
                <div className="rounded-xl bg-[#f8fbff] p-2">
                  <span className="block text-[10px] font-bold text-[#7990af]">Unit Cost</span>
                  <p className="mt-0.5 font-bold text-[#10264d]">{item.unitPrice}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#6d84a3] border-t border-[#f2f6fb] pt-2">
                <span>Location: <strong className="text-[#10264d]">{item.location}</strong></span>
                <span className="text-[10px] font-semibold text-blue-600 cursor-pointer hover:underline">
                  + Log Usage
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
