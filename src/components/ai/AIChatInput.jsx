import { useRef } from "react";
import { SendHorizontal } from "lucide-react";

/**
 * Chat input with Enter-to-send, Shift+Enter newline, and send button.
 */
export default function AIChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}) {
  const textareaRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && !disabled) {
          onSubmit();
        }
      }}
      className="flex items-end gap-2 border-t border-[#e2e9f3] bg-white px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about bookings, payments, expenses..."
        aria-label="Ask Studio Assistant"
        className="max-h-24 min-h-[38px] flex-1 resize-none rounded-xl border border-[#d6e2f2] bg-[#f8fafd] px-3 py-2 text-[13px] text-[#10264d] placeholder:text-slate-400 focus:border-[#10264d] focus:bg-white focus:outline-none disabled:opacity-60"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10264d] to-[#1c4282] text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <SendHorizontal size={16} className="text-[#f3d27a]" />
      </button>
    </form>
  );
}
