import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const SUGGESTION_GROUPS = [
  {
    module: "expenses",
    label: "Finance",
    items: [
      "What is my total expense this month?",
      "Show this month's salary expenses.",
    ],
  },
  {
    module: "payments",
    label: "Payments",
    items: [
      "How much revenue have we received this month?",
      "What is the pending payment amount?",
    ],
  },
  {
    module: "bookings",
    label: "Bookings",
    items: [
      "How many bookings do we have this month?",
      "Show today's bookings.",
      "How many bookings are pending?",
      "How many bookings are cancelled?",
    ],
  },
  {
    module: "customers",
    label: "Customers",
    items: [
      "How many customers are registered?",
      "Which cities have the most customers?",
    ],
  },
  {
    module: "enquiries",
    label: "Enquiries",
    items: [
      "How many enquiries have we received?",
      "How many enquiries are confirmed?",
    ],
  },
  {
    module: "staff",
    label: "Staff",
    items: [
      "How many active staff members do we have?",
      "Show the staff directory.",
    ],
  },
];

/**
 * Module-aware clickable quick suggestion chips with compact "View more" toggle.
 */
export default function AIChatSuggestions({
  activePage = "dashboard",
  onSelect,
  disabled = false,
}) {
  const [expanded, setExpanded] = useState(false);

  const prioritized = [
    ...SUGGESTION_GROUPS.filter((g) => g.module === activePage),
    ...SUGGESTION_GROUPS.filter((g) => g.module !== activePage),
  ];

  const allQuestions = prioritized.flatMap((g) => g.items);
  const visibleQuestions = expanded ? allQuestions.slice(0, 10) : allQuestions.slice(0, 4);

  return (
    <div className="mt-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#607699]">
          <Sparkles size={11} className="text-[#c9972c]" />
          Quick Questions
        </span>

        {allQuestions.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#173d77] hover:text-[#c9972c]"
          >
            <span>{expanded ? "Show less" : "View more"}</span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visibleQuestions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="rounded-xl border border-[#d6e2f2] bg-white px-2.5 py-1.5 text-left text-[11.5px] font-semibold text-[#10264d] shadow-2xs transition hover:border-[#d4a437] hover:bg-[#fffaf0] disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
