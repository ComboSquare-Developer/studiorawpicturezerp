/**
 * Subtle three-dot typing indicator for Studio Assistant.
 */
export default function AIChatTypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[#e2e9f3] bg-white px-3.5 py-2.5 shadow-xs w-fit">
      <span className="sr-typing-dot h-2 w-2 rounded-full bg-[#10264d]" style={{ animationDelay: "0ms" }} />
      <span className="sr-typing-dot h-2 w-2 rounded-full bg-[#c9972c]" style={{ animationDelay: "160ms" }} />
      <span className="sr-typing-dot h-2 w-2 rounded-full bg-[#10264d]" style={{ animationDelay: "320ms" }} />
    </div>
  );
}
