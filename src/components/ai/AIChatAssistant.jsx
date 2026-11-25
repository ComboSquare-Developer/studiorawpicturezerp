import { lazy, Suspense, useEffect, useState } from "react";
import { demoAuthService } from "../../services/demo/demoAuthService";
import AIChatLauncher from "./AIChatLauncher";

const AIChatWindow = lazy(() => import("./AIChatWindow"));

/**
 * Global Floating Studio Assistant mounted once in the authenticated ERP layout.
 * Lazy-loads the chat window and AI engine only when opened.
 */
export default function AIChatAssistant({ activePage = "dashboard", onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [userName, setUserName] = useState(() => {
    const user = demoAuthService.getCurrentUser();
    return user?.name || "Admin";
  });

  useEffect(() => {
    const syncUser = () => {
      const user = demoAuthService.getCurrentUser();
      setUserName(user?.name || "Admin");
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setHasOpenedOnce(true);
      return next;
    });
  };

  return (
    <>
      <style>{`
        @keyframes srAiFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes srAiWindowPop {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes srAiMsgIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes srTypingBounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          40% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        .sr-ai-launcher {
          animation: srAiFloat 3.6s ease-in-out infinite;
        }

        .sr-ai-window {
          animation: srAiWindowPop 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .sr-ai-msg {
          animation: srAiMsgIn 0.2s ease-out forwards;
        }

        .sr-typing-dot {
          animation: srTypingBounce 1.1s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sr-ai-launcher,
          .sr-ai-window,
          .sr-ai-msg,
          .sr-typing-dot {
            animation: none !important;
          }
        }
      `}</style>

      {isOpen && (
        <Suspense
          fallback={
            <div className="fixed bottom-24 right-6 z-40 flex h-24 w-72 items-center justify-center rounded-2xl border border-[#d4a437]/40 bg-white text-xs font-bold text-[#10264d] shadow-xl">
              Loading Studio Assistant...
            </div>
          }
        >
          <AIChatWindow
            activePage={activePage}
            userName={userName}
            onNavigate={onNavigate}
            onClose={() => setIsOpen(false)}
          />
        </Suspense>
      )}

      <AIChatLauncher
        isOpen={isOpen}
        hasUnread={!hasOpenedOnce}
        onToggle={handleToggle}
      />
    </>
  );
}
