import { ArrowUpRight, RotateCcw } from "lucide-react";

function renderFormattedText(text) {
  const lines = String(text || "").split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx} className="block min-h-[1.15em]">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (
              <strong key={partIdx} className="font-bold text-inherit">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
      </span>
    );
  });
}

/**
 * Individual chat message bubble (user or assistant) with timestamp,
 * optional navigation action, and retry support on errors.
 */
export default function AIChatMessage({ message, onNavigate, onRetry }) {
  const isUser = message.role === "user";
  const isError = Boolean(message.isError);

  return (
    <div className={`sr-ai-msg flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-xs ${
          isUser
            ? "rounded-br-md bg-gradient-to-br from-[#10264d] to-[#1b3f7a] text-white"
            : isError
            ? "rounded-tl-md border border-rose-200 bg-rose-50 text-rose-800"
            : "rounded-tl-md border border-[#e1e9f4] bg-white text-[#10264d]"
        }`}
      >
        <div className="space-y-0.5 break-words">{renderFormattedText(message.text)}</div>

        {message.action?.type === "navigate" && message.action.id && (
          <button
            type="button"
            onClick={() => onNavigate(message.action.id)}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border border-[#d4a437]/55 bg-gradient-to-r from-[#10264d] to-[#193b72] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110"
          >
            <span>Open {message.action.label}</span>
            <ArrowUpRight size={14} className="text-[#f3d27a]" />
          </button>
        )}

        {isError && typeof onRetry === "function" && (
          <button
            type="button"
            onClick={() => onRetry(message.retryQuestion)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        )}
      </div>

      {message.timestamp && (
        <span className="mt-1 px-1 text-[10px] font-medium text-slate-400">
          {message.timestamp}
        </span>
      )}
    </div>
  );
}
