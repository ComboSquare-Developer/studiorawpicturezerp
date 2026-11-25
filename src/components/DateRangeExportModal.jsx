import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarRange, Download, X, AlertCircle } from "lucide-react";
import {
  formatReadableDate,
  getPresetDateRange,
  toLocalDateKey,
} from "../utils/dateRangeExport";

/**
 * Reusable Date-Range Selection Modal for CSV Exports across all ERP modules.
 */
export default function DateRangeExportModal({
  isOpen,
  title = "Select Export Date Range",
  description = "Choose the period for which you want to export records.",
  moduleLabel = "",
  allowFutureDates = false,
  onClose,
  onExport,
}) {
  const todayStr = useMemo(() => toLocalDateKey(new Date()), []);
  const [rangeType, setRangeType] = useState("6m");
  const [customFrom, setCustomFrom] = useState(() => getPresetDateRange("6m").fromDate);
  const [customTo, setCustomTo] = useState(() => toLocalDateKey(new Date()));
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const exportingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setRangeType("6m");
    setCustomTo(toLocalDateKey(new Date()));
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !exportingRef.current) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const effectiveRange = useMemo(() => {
    if (rangeType === "6m" || rangeType === "12m") {
      return getPresetDateRange(rangeType);
    }
    return { fromDate: customFrom, toDate: customTo };
  }, [rangeType, customFrom, customTo]);

  const validationError = useMemo(() => {
    if (rangeType !== "custom") return "";
    if (!customFrom || !customTo) {
      return "Please select both From Date and To Date.";
    }
    if (customFrom > customTo) {
      return "From Date cannot be later than To Date.";
    }
    if (!allowFutureDates && customTo > todayStr) {
      return "To Date cannot be in the future.";
    }
    return "";
  }, [rangeType, customFrom, customTo, allowFutureDates, todayStr]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (exportingRef.current || validationError) return;
    setError("");
    exportingRef.current = true;
    setIsExporting(true);

    try {
      const result = await onExport({
        rangeType,
        fromDate: effectiveRange.fromDate,
        toDate: effectiveRange.toDate,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      onClose();
    } catch (err) {
      setError(err?.message || "Failed to generate CSV export.");
    } finally {
      exportingRef.current = false;
      setIsExporting(false);
    }
  };

  const preset6m = getPresetDateRange("6m");
  const preset12m = getPresetDateRange("12m");

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152b]/65 p-3 backdrop-blur-[3px] sm:p-5">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!isExporting) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#d6e7fa] bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-[#e5edf7] bg-gradient-to-r from-[#f6faff] to-[#e9f2ff] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10264d] text-[#f3d27a]">
              <CalendarRange size={19} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#10264d] sm:text-lg">
                {title}
              </h2>
              <p className="mt-0.5 text-xs text-[#607699]">
                {moduleLabel ? `${moduleLabel} · ${description}` : description}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl border border-[#d6e7fa] bg-white p-2 text-[#10264d] hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {[
              { id: "6m", label: "Last 6 Months" },
              { id: "12m", label: "Last 12 Months" },
              { id: "custom", label: "Custom Date Range" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setRangeType(opt.id);
                  setError("");
                }}
                className={`rounded-xl border px-3 py-3 text-xs font-bold transition ${
                  rangeType === opt.id
                    ? "border-[#10264d] bg-[#10264d] text-white shadow-sm"
                    : "border-[#d5e4f4] bg-white text-[#10264d] hover:bg-[#f3f8fe]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {rangeType !== "custom" ? (
            <div className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] px-4 py-3 text-xs">
              <p className="font-semibold text-[#607699]">Selected Export Period</p>
              <p className="mt-1 font-extrabold text-[#10264d]">
                {formatReadableDate(
                  rangeType === "12m" ? preset12m.fromDate : preset6m.fromDate
                )}{" "}
                –{" "}
                {formatReadableDate(
                  rangeType === "12m" ? preset12m.toDate : preset6m.toDate
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#dce8f6] bg-[#f8fbff] p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#355d8d]">
                  From Date *
                </label>
                <input
                  type="date"
                  value={customFrom}
                  max={allowFutureDates ? undefined : todayStr}
                  onChange={(e) => {
                    setCustomFrom(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-xl border border-[#d6e7fa] bg-white px-3 py-2 text-xs font-semibold text-[#10264d] outline-none focus:border-[#3b73b9]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#355d8d]">
                  To Date *
                </label>
                <input
                  type="date"
                  value={customTo}
                  max={allowFutureDates ? undefined : todayStr}
                  onChange={(e) => {
                    setCustomTo(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-xl border border-[#d6e7fa] bg-white px-3 py-2 text-xs font-semibold text-[#10264d] outline-none focus:border-[#3b73b9]"
                />
              </div>
            </div>
          )}

          {(validationError || error) && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t border-[#e5edf7] bg-[#fafcff] px-5 py-3.5">
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="rounded-xl border border-[#d5e4f4] bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={Boolean(validationError) || isExporting}
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1b3f7a] disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
          >
            <Download size={15} className="text-[#f3d27a]" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
