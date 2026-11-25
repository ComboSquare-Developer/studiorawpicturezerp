/**
 * Shared Date-Range Filtering, Monthly Bucketing & Excel-Compatible CSV Export Utilities
 */

export function toLocalDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

export function normalizeLocalDate(value) {
  if (!value) return "";
  if (value instanceof Date) return toLocalDateKey(value);
  const str = String(value).trim();
  if (!str) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const dmy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      parsed.getFullYear() === Number(year) &&
      parsed.getMonth() === Number(month) - 1 &&
      parsed.getDate() === Number(day)
    ) {
      return toLocalDateKey(parsed);
    }
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? "" : toLocalDateKey(parsed);
}

export function parseLocalDate(value) {
  const key = normalizeLocalDate(value);
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function formatReadableDate(value) {
  const d = parseLocalDate(value);
  if (!d) return String(value || "");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getPresetDateRange(preset, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const toDate = toLocalDateKey(today);
  const monthsBack = preset === "12m" ? 11 : 5;
  const start = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1);
  return {
    fromDate: toLocalDateKey(start),
    toDate,
  };
}

export function isDateInRange(rawDate, fromDate, toDate) {
  const key = normalizeLocalDate(rawDate);
  if (!key) return false;
  if (fromDate && key < fromDate) return false;
  if (toDate && key > toDate) return false;
  return true;
}

export function buildExportFilename(moduleName, { rangeType, fromDate, toDate }) {
  const cleanModule = String(moduleName || "Records").replace(/[^a-zA-Z0-9_-]/g, "");
  if (rangeType === "6m") return `StudioRaw_${cleanModule}_6Months.csv`;
  if (rangeType === "12m") return `StudioRaw_${cleanModule}_12Months.csv`;
  return `StudioRaw_${cleanModule}_Custom_${fromDate}_to_${toDate}.csv`;
}

export function escapeCsvCell(value) {
  const raw = String(value ?? "");
  const safe = /^\s*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function downloadCsvFile({ headers = [], rows = [], filename = "export.csv" }) {
  const allRows = headers.length ? [headers, ...rows] : rows;
  const csv = allRows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Build monthly buckets for 6m, 12m, or custom date ranges.
 */
export function buildMonthlyBuckets({
  rangeType = "6m",
  fromDate,
  toDate,
  now = new Date(),
}) {
  if (rangeType === "6m" || rangeType === "12m") {
    const count = rangeType === "12m" ? 12 : 6;
    return Array.from({ length: count }, (_, idx) => {
      const mStart = new Date(
        now.getFullYear(),
        now.getMonth() - (count - 1 - idx),
        1
      );
      const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0);
      return {
        key: `${mStart.getFullYear()}-${String(mStart.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
        label: mStart.toLocaleDateString("en-IN", {
          month: count > 6 ? "short" : "short",
          year: count > 6 ? "2-digit" : undefined,
        }),
        startDate: toLocalDateKey(mStart),
        endDate: toLocalDateKey(mEnd),
      };
    });
  }

  const start = parseLocalDate(fromDate) || new Date(now.getFullYear(), now.getMonth(), 1);
  const end = parseLocalDate(toDate) || new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (start > end) return [];

  const buckets = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const clampedStart = monthStart < start ? start : monthStart;
    const clampedEnd = monthEnd > end ? end : monthEnd;
    buckets.push({
      key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      label: cursor.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      }),
      startDate: toLocalDateKey(clampedStart),
      endDate: toLocalDateKey(clampedEnd),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}
