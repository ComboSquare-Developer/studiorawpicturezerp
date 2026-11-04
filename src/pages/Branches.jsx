import React from "react";
import { Building2, Sparkles } from "lucide-react";

export default function Branches() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f9fd] px-4 py-8 text-[#10264d]">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-[#dce7f5] bg-white px-6 py-12 text-center shadow-sm sm:px-10">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#10264d] to-[#254f8e] text-white shadow-lg">
          <Building2 size={36} />
        </div>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-[#1a4a88]">
          <Sparkles size={14} />
          Branches
        </div>

        <h1 className="text-2xl font-black tracking-tight text-[#10264d] sm:text-3xl">
          Coming Soon
        </h1>

        <p className="mt-3 max-w-xs text-sm font-medium leading-6 text-[#647c9d]">
          Branches & Locations module is currently under development.
          Stay tuned!
        </p>
      </div>
    </div>
  );
}