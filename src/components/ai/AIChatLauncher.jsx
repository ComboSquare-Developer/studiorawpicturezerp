/**
 * Floating circular AI chatbot launcher button for Studio Assistant.
 * Features a custom SVG chatbot face with naturally blinking eyes on a
 * navy-blue circle with subtle gold accents.
 */
export default function AIChatLauncher({ isOpen, onToggle, hasUnread = false }) {
  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
      <style>{`
        @keyframes srChatbotBlink {
          0%, 40%, 46%, 80%, 86%, 90%, 100% {
            transform: scaleY(1);
          }
          43%, 83%, 88% {
            transform: scaleY(0.08);
          }
        }

        .sr-bot-eye {
          transform-box: fill-box;
          transform-origin: center;
          animation: srChatbotBlink 5.8s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sr-bot-eye {
            animation: none !important;
          }
        }
      `}</style>

      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Close Studio Assistant" : "Open Studio Assistant"}
        aria-expanded={isOpen}
        className={`sr-ai-launcher group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d4a437]/85 bg-gradient-to-br from-[#0b1b36] via-[#10264d] to-[#1a3a70] text-white shadow-[0_10px_28px_rgba(16,38,77,0.38),0_0_18px_rgba(212,164,55,0.26)] transition-all duration-300 hover:scale-105 hover:shadow-[0_14px_34px_rgba(16,38,77,0.48),0_0_24px_rgba(212,164,55,0.42)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d4a437]/45 sm:h-15 sm:w-15 ${
          isOpen ? "scale-95 ring-2 ring-[#d4a437]/60" : ""
        }`}
      >
        <span className="pointer-events-none absolute -inset-1 rounded-full border border-[#d4a437]/35" />

        {/* Dedicated AI Chatbot Face SVG with animated eyes */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none transition-transform duration-300 group-hover:scale-105"
        >
          {/* Antenna */}
          <line
            x1="18"
            y1="5.5"
            x2="18"
            y2="9.5"
            stroke="#f3d27a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="18" cy="4.2" r="2" fill="#f3d27a" />

          {/* Head */}
          <rect
            x="6.5"
            y="9.5"
            width="23"
            height="19"
            rx="6.5"
            fill="#ffffff"
          />

          {/* Side ear accents */}
          <rect x="4" y="16" width="2.5" height="6" rx="1.25" fill="#f3d27a" />
          <rect x="29.5" y="16" width="2.5" height="6" rx="1.25" fill="#f3d27a" />

          {/* Visor / Face screen */}
          <rect
            x="9.5"
            y="13"
            width="17"
            height="10.5"
            rx="4"
            fill="#0d2144"
          />

          {/* Left & Right Animated Eyes */}
          <ellipse
            cx="14.2"
            cy="18.2"
            rx="1.8"
            ry="2.2"
            fill="#ffffff"
            className="sr-bot-eye"
          />
          <ellipse
            cx="21.8"
            cy="18.2"
            rx="1.8"
            ry="2.2"
            fill="#ffffff"
            className="sr-bot-eye"
          />

          {/* Friendly Smile */}
          <path
            d="M14.5 25.4C15.5 26.6 20.5 26.6 21.5 25.4"
            stroke="#10264d"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {/* Online / Notification indicator */}
        <span
          aria-hidden="true"
          className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-sm ${
            hasUnread ? "bg-[#d4a437]" : "bg-emerald-500"
          }`}
        >
          {hasUnread && (
            <span className="h-2 w-2 animate-ping rounded-full bg-white/90" />
          )}
        </span>
      </button>
    </div>
  );
}
