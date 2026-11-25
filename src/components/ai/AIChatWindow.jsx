import { useEffect, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import charImage from "../../../char.png";
import { askStudioAssistant } from "../../services/aiAssistantEngine";
import AIChatInput from "./AIChatInput";
import AIChatMessage from "./AIChatMessage";
import AIChatSuggestions from "./AIChatSuggestions";
import AIChatTypingIndicator from "./AIChatTypingIndicator";

const MAX_HISTORY_MESSAGES = 30;

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildWelcomeMessage(userName) {
  const displayName = userName && userName.trim() ? userName.trim() : "Admin";
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    isWelcome: true,
    timestamp: formatTime(),
    text:
      `Hello, ${displayName}! 👋\n\n` +
      "Welcome to Studio Raw Picturez Assistant.\n\n" +
      "I'm here to help you manage your studio smarter. You can ask me about bookings, customers, enquiries, payments, expenses, staff and other studio activities.\n\n" +
      "What would you like to know today?",
  };
}

/**
 * Floating Studio Assistant chat window with deep navy & gold branding,
 * responsive desktop/tablet/mobile layout, and verified ERP data responses.
 */
export default function AIChatWindow({
  activePage = "dashboard",
  userName = "Admin",
  onNavigate,
  onClose,
}) {
  const [messages, setMessages] = useState(() => [buildWelcomeMessage(userName)]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarReacting, setAvatarReacting] = useState(true);

  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const reactionTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      abortRef.current?.abort();
      window.clearTimeout(reactionTimerRef.current);
    };
  }, [onClose]);

  const triggerAvatarReaction = () => {
    setAvatarReacting(true);
    window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => {
      setAvatarReacting(false);
    }, 900);
  };

  const handleNewConversation = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setInputValue("");
    setMessages([buildWelcomeMessage(userName)]);
    triggerAvatarReaction();
  };

  const submitQuestion = async (rawQuestion) => {
    const trimmed = String(rawQuestion ?? inputValue).trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: formatTime(),
    };

    setInputValue("");
    setMessages((prev) => [...prev.slice(-(MAX_HISTORY_MESSAGES - 1)), userMsg]);
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await askStudioAssistant({
        question: trimmed,
        activePage,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response.text,
        action: response.action || null,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev.slice(-(MAX_HISTORY_MESSAGES - 1)), assistantMsg]);
      triggerAvatarReaction();
    } catch {
      if (controller.signal.aborted) return;

      setMessages((prev) => [
        ...prev.slice(-(MAX_HISTORY_MESSAGES - 1)),
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          isError: true,
          retryQuestion: trimmed,
          text: "I couldn't retrieve that information right now. Please try again.",
          timestamp: formatTime(),
        },
      ]);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const handleNavigateFromChat = (pageId) => {
    if (typeof onNavigate === "function") {
      onNavigate(pageId);
    }
  };

  const showSuggestions = messages.length <= 2;

  return (
    <section
      role="dialog"
      aria-label="Studio Assistant"
      className="sr-ai-window fixed inset-x-2 bottom-20 top-16 z-40 flex flex-col overflow-hidden rounded-3xl border border-[#d4a437]/40 bg-[#f6f8fc] shadow-[0_24px_60px_rgba(10,24,48,0.34)] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(600px,calc(100dvh-7.5rem))] sm:w-[400px] sm:max-w-[calc(100vw-2rem)]"
    >
      {/* HEADER */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d4a437]/30 bg-gradient-to-r from-[#0a1933] via-[#10264d] to-[#173668] px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#d4a437]/80 bg-[#0d1f3d] shadow-sm transition-transform duration-500 ${
              avatarReacting ? "scale-105 -rotate-3" : "scale-100"
            }`}
          >
            <img
              src={charImage}
              alt="Studio Assistant avatar"
              draggable={false}
              className="h-full w-full object-cover object-top"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[#0d1f3d] bg-emerald-400"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-extrabold tracking-tight text-white">
                Studio Assistant
              </h2>
              <span className="rounded-full bg-[#d4a437]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#f3d27a]">
                Ready
              </span>
            </div>
            <p className="truncate text-[11px] text-[#bfd2ee]">
              Your intelligent studio management assistant
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleNewConversation}
            title="New conversation"
            aria-label="New conversation"
            className="rounded-xl p-2 text-[#cbd9ef] transition hover:bg-white/10 hover:text-[#f3d27a]"
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close assistant"
            aria-label="Close assistant"
            className="rounded-xl p-2 text-[#cbd9ef] transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* MESSAGES */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3.5">
        {messages.map((msg) => (
          <div key={msg.id}>
            <AIChatMessage
              message={msg}
              onNavigate={handleNavigateFromChat}
              onRetry={(q) => submitQuestion(q)}
            />
            {msg.isWelcome && showSuggestions && (
              <AIChatSuggestions
                activePage={activePage}
                disabled={isLoading}
                onSelect={(q) => submitQuestion(q)}
              />
            )}
          </div>
        ))}

        {isLoading && <AIChatTypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <AIChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={() => submitQuestion(inputValue)}
        disabled={isLoading}
      />
    </section>
  );
}
