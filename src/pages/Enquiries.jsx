import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  CalendarDays,
  MapPin,
  Mail,
  Phone,
  Users,
  Camera,
  Plus,
  X,
  Check,
  Sparkles,
  Filter,
  Eye,
  Trash2,
  Tag,
  FileText,
  Clock,
  HeartHandshake,
  Cake,
  Baby,
  PartyPopper,
  Building2,
  IndianRupee,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";

// ORIGINAL DUMMY DATA - PRESERVED 100% UNCHANGED
const initialDummyData = [
  {
    id: 1,
    name: "Arun Kumar",
    email: "arun@gmail.com",
    number: "9876543210",
    mainEvent: "Wedding",
    eventDate: "2026-11-15",
    city: "Chennai",
    function: "Wedding & Reception",
    weddingCoverage: "Full Day",
    notes: "Candid photography and cinematic video",
    status: "New",
    budget: "₹1,20,000",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@gmail.com",
    number: "9876501234",
    mainEvent: "Wedding",
    eventDate: "2026-12-05",
    city: "Coimbatore",
    function: "Wedding & Reception",
    weddingCoverage: "Full Day",
    notes: "Traditional photography with wedding album",
    status: "In Discussion",
    budget: "₹85,000",
  },
  {
    id: 3,
    name: "Vijay Raj",
    email: "vijay@gmail.com",
    number: "9123456780",
    mainEvent: "Engagement",
    eventDate: "2026-11-25",
    city: "Madurai",
    function: "Engagement",
    weddingCoverage: "Half Day",
    notes: "Photography and highlight video",
    status: "Follow-up",
    budget: "₹45,000",
  },
  {
    id: 4,
    name: "Divya R",
    email: "divya@gmail.com",
    number: "9988776655",
    mainEvent: "Wedding",
    eventDate: "2026-12-20",
    city: "Tirunelveli",
    function: "Mehendi & Reception",
    weddingCoverage: "Two Days",
    notes: "Candid photos and outdoor couple shoot",
    status: "Confirmed",
    budget: "₹1,50,000",
  },
  {
    id: 5,
    name: "Karthik M",
    email: "karthik@gmail.com",
    number: "9090901234",
    mainEvent: "Wedding",
    eventDate: "2027-01-10",
    city: "Nagercoil",
    function: "Wedding",
    weddingCoverage: "Full Day",
    notes: "Traditional photography and video coverage",
    status: "New",
    budget: "₹95,000",
  },
  {
    id: 6,
    name: "Meena Devi",
    email: "meena@gmail.com",
    number: "9876123450",
    mainEvent: "Birthday",
    eventDate: "2026-11-30",
    city: "Trichy",
    function: "Birthday Party",
    weddingCoverage: "Not Applicable",
    notes: "Family portraits and event photography",
    status: "In Discussion",
    budget: "₹25,000",
  },
  {
    id: 7,
    name: "Rahul S",
    email: "rahul@gmail.com",
    number: "9845671230",
    mainEvent: "Wedding",
    eventDate: "2027-02-14",
    city: "Salem",
    function: "Wedding & Reception",
    weddingCoverage: "Two Days",
    notes: "Candid photography and cinematic film",
    status: "Confirmed",
    budget: "₹1,80,000",
  },
  {
    id: 8,
    name: "Anitha R",
    email: "anitha@gmail.com",
    number: "9789012345",
    mainEvent: "Baby Shower",
    eventDate: "2026-12-12",
    city: "Erode",
    function: "Baby Shower",
    weddingCoverage: "Not Applicable",
    notes: "Family photos and event highlights",
    status: "New",
    budget: "₹30,000",
  },
  {
    id: 9,
    name: "Sanjay Kumar",
    email: "sanjay@gmail.com",
    number: "9840012345",
    mainEvent: "Wedding",
    eventDate: "2027-01-22",
    city: "Bengaluru",
    function: "Wedding",
    weddingCoverage: "Full Day",
    notes: "Premium wedding photography package",
    status: "Follow-up",
    budget: "₹1,40,000",
  },
  {
    id: 10,
    name: "Keerthana S",
    email: "keerthana@gmail.com",
    number: "9894012345",
    mainEvent: "Engagement",
    eventDate: "2026-12-28",
    city: "Chennai",
    function: "Engagement & Reception",
    weddingCoverage: "Half Day",
    notes: "Couple portraits and candid photography",
    status: "Confirmed",
    budget: "₹50,000",
  },
  {
    id: 11,
    name: "Ajay Kumar",
    email: "ajay@gmail.com",
    number: "9790012345",
    mainEvent: "Wedding",
    eventDate: "2027-02-05",
    city: "Coimbatore",
    function: "Wedding & Reception",
    weddingCoverage: "Two Days",
    notes: "Wedding album and cinematic video",
    status: "In Discussion",
    budget: "₹1,60,000",
  },
  {
    id: 12,
    name: "Nithya R",
    email: "nithya@gmail.com",
    number: "9677012345",
    mainEvent: "Birthday",
    eventDate: "2026-11-18",
    city: "Madurai",
    function: "Birthday Celebration",
    weddingCoverage: "Not Applicable",
    notes: "Birthday event and family photography",
    status: "New",
    budget: "₹20,000",
  },
];

const STORAGE_KEY = "studioraw_enquiries";

const formatDate = (date) => {
  if (!date) return "Not specified";
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

const getEventStyle = (event, isDark) => {
  switch (event) {
    case "Wedding":
      return {
        bg: isDark ? "bg-[#351528] text-pink-200 border-[#5e2144]" : "bg-[#fdf2f8] text-[#9d174d] border-[#fbcfe8]",
        dot: "bg-pink-500",
        icon: Camera,
      };
    case "Engagement":
      return {
        bg: isDark ? "bg-[#142646] text-blue-200 border-[#1f427d]" : "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
        dot: "bg-blue-500",
        icon: HeartHandshake,
      };
    case "Birthday":
      return {
        bg: isDark ? "bg-[#33220f] text-amber-200 border-[#5c3e17]" : "bg-[#fffbeb] text-[#b45309] border-[#fde68a]",
        dot: "bg-amber-500",
        icon: Cake,
      };
    case "Baby Shower":
      return {
        bg: isDark ? "bg-[#102d24] text-emerald-200 border-[#1d5440]" : "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]",
        dot: "bg-emerald-500",
        icon: Baby,
      };
    default:
      return {
        bg: isDark ? "bg-[#271b3d] text-purple-200 border-[#472f6e]" : "bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]",
        dot: "bg-purple-500",
        icon: PartyPopper,
      };
  }
};

const getStatusStyle = (status, isDark) => {
  switch (status) {
    case "Confirmed":
      return isDark
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Discussion":
      return isDark
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200";
    case "Follow-up":
      return isDark
        ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
        : "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return isDark
        ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
        : "bg-purple-50 text-purple-700 border-purple-200";
  }
};

export default function Enquiries() {
  // Sync with global theme
  const [dark, setDark] = useState(() => {
    if (typeof document !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        document.documentElement.dataset.theme === "dark"
      );
    }
    return false;
  });

  useEffect(() => {
    const updateTheme = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.dataset.theme === "dark";
      setDark(isDark);
    };
    updateTheme();
    const handleThemeChange = (event) => {
      if (event.detail?.theme) {
        setDark(event.detail.theme === "dark");
      }
    };
    window.addEventListener("studioraw-theme-change", handleThemeChange);
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => {
      window.removeEventListener("studioraw-theme-change", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  // Enquiries state
  const [enquiries, setEnquiries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialDummyData;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
    } catch {}
  }, [enquiries]);

  // Filters & view modes
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  // New Enquiry Form State
  const initialFormState = {
    name: "",
    email: "",
    number: "",
    mainEvent: "Wedding",
    eventDate: "",
    city: "",
    function: "",
    weddingCoverage: "Full Day",
    notes: "",
    budget: "",
    status: "New",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  const showNotification = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = "Customer name is required";
    if (!formData.number.trim()) {
      errors.number = "Phone number is required";
    } else if (formData.number.trim().length < 10) {
      errors.number = "Please enter a valid 10-digit number";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newEnquiry = {
      id: enquiries.length ? Math.max(...enquiries.map((e) => e.id)) + 1 : 1,
      name: formData.name.trim(),
      email: formData.email.trim() || "Not provided",
      number: formData.number.trim(),
      mainEvent: formData.mainEvent || "Wedding",
      eventDate: formData.eventDate || new Date().toISOString().split("T")[0],
      city: formData.city.trim() || "Tamil Nadu",
      function: formData.function.trim() || formData.mainEvent,
      weddingCoverage: formData.weddingCoverage || "Full Day",
      notes: formData.notes.trim() || "No additional notes",
      budget: formData.budget.trim() ? (formData.budget.startsWith("₹") ? formData.budget : `₹${formData.budget}`) : "₹50,000",
      status: formData.status || "New",
    };

    setEnquiries([newEnquiry, ...enquiries]);
    setIsAddModalOpen(false);
    setFormData(initialFormState);
    setFormErrors({});
    showNotification(`Enquiry for "${newEnquiry.name}" added successfully!`);
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      setEnquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      showNotification("Enquiry deleted successfully.");
    }
  };

  // Filtered Enquiries
  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();
    return enquiries.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.name,
          item.email,
          item.number,
          item.mainEvent,
          item.city,
          item.function,
          item.weddingCoverage,
          item.notes,
        ].some((val) => val && String(val).toLowerCase().includes(query));

      const matchesEvent = eventFilter === "All" || item.mainEvent === eventFilter;
      const matchesCity = cityFilter === "All" || item.city === cityFilter;

      return matchesSearch && matchesEvent && matchesCity;
    });
  }, [enquiries, search, eventFilter, cityFilter]);

  const eventTypes = ["All", ...new Set(enquiries.map((item) => item.mainEvent))];
  const cityList = ["All", ...new Set(enquiries.map((item) => item.city).filter(Boolean))];

  // Stats in DIFFERENT MINIMAL PASTEL COLORS
  const totalCount = enquiries.length;
  const weddingCount = enquiries.filter((i) => i.mainEvent === "Wedding").length;
  const otherCount = enquiries.filter((i) => i.mainEvent !== "Wedding").length;
  const citiesCount = new Set(enquiries.map((i) => i.city)).size;

  return (
    <div
      className={`min-h-screen px-4 py-6 sm:px-7 sm:py-8 transition-colors duration-300 font-sans ${
        dark ? "bg-[#0b1528] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* ================= PAGE HEADER ================= */}
        {/* <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> */}
          <div>
            {/* <div className="mb-2 flex items-center gap-2"> */}
              {/* <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
                
                Customer Pipeline
              </span> */}
              {/* <span className={`text-xs font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>
                • Studio Management
              </span> */}
            {/* </div> */}

            {/* <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${dark ? "text-white" : "text-[#0f2444]"}`}>
              Customer Enquiries
            </h1> */}

            {/* <p className={`mt-1.5 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Manage incoming event requests, customer leads, and photography bookings.
            </p> */}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#102b53] to-[#1e457f] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,43,83,0.22)] transition-all duration-300 hover:scale-[1.02] hover:from-[#163a6e] hover:to-[#265394] hover:shadow-[0_12px_28px_rgba(16,43,83,0.3)] active:scale-[0.98]"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add New Enquiry</span>
            </button>
          </div>
        {/* </header> */}

        {/* ================= SUCCESS TOAST ================= */}
        {successToast && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-800 dark:text-emerald-200 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={14} strokeWidth={3} />
              </span>
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast("")}
              className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-300"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ================= SUMMARY BOXES (DIFFERENT MINIMAL COLORS) ================= */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* BOX 1: TOTAL ENQUIRIES - MINIMAL SKY / BLUE */}
          <article
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              dark
                ? "border-[#1e3a63] bg-gradient-to-br from-[#0e213b] via-[#0b1a2f] to-[#081426] shadow-[0_10px_30px_rgba(14,33,59,0.4)]"
                : "border-[#bfdbfe]/80 bg-gradient-to-br from-[#eff6ff] via-[#f4f8ff] to-[#e0ecfc] shadow-[0_6px_20px_rgba(30,58,138,0.06)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                  dark ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-blue-100/80 text-blue-800 border border-blue-200"
                }`}>
                  Overview
                </span>
                <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${dark ? "text-blue-200/70" : "text-blue-900/70"}`}>
                  Total Enquiries
                </p>
                <h3 className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight ${dark ? "text-white" : "text-[#1e3a8a]"}`}>
                  {totalCount}
                </h3>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                  dark
                    ? "border border-blue-400/30 bg-blue-500/20 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    : "border border-blue-200 bg-white text-blue-700 shadow-sm"
                }`}
              >
                <Users size={22} strokeWidth={2.2} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-blue-500/15 pt-3 text-xs">
              <span className={dark ? "text-blue-200/60" : "text-blue-800/70"}>
                Active Pipeline
              </span>
              <span className={`font-semibold ${dark ? "text-blue-300" : "text-blue-700"}`}>
                100% Leads Tracked
              </span>
            </div>
          </article>

          {/* BOX 2: WEDDING EVENTS - MINIMAL ROSE / LAVENDER */}
          <article
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              dark
                ? "border-[#4a1c36] bg-gradient-to-br from-[#27101e] via-[#1f0b17] to-[#150710] shadow-[0_10px_30px_rgba(74,28,54,0.4)]"
                : "border-[#fbcfe8]/80 bg-gradient-to-br from-[#fdf2f8] via-[#fff5f9] to-[#fce7f3] shadow-[0_6px_20px_rgba(190,24,93,0.06)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                  dark ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "bg-pink-100/80 text-pink-800 border border-pink-200"
                }`}>
                  High Value
                </span>
                <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${dark ? "text-pink-200/70" : "text-pink-900/70"}`}>
                  Wedding Events
                </p>
                <h3 className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight ${dark ? "text-white" : "text-[#831843]"}`}>
                  {weddingCount}
                </h3>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                  dark
                    ? "border border-pink-400/30 bg-pink-500/20 text-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.2)]"
                    : "border border-pink-200 bg-white text-pink-700 shadow-sm"
                }`}
              >
                <Camera size={22} strokeWidth={2.2} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-pink-500/15 pt-3 text-xs">
              <span className={dark ? "text-pink-200/60" : "text-pink-800/70"}>
                Full &amp; Two Day Shoots
              </span>
              <span className={`font-semibold ${dark ? "text-pink-300" : "text-pink-700"}`}>
                {totalCount > 0 ? `${Math.round((weddingCount / totalCount) * 100)}% of total` : "0%"}
              </span>
            </div>
          </article>

          {/* BOX 3: OTHER EVENTS - MINIMAL WARM AMBER / GOLD */}
          <article
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              dark
                ? "border-[#4e3717] bg-gradient-to-br from-[#281c0c] via-[#1f1508] to-[#150e05] shadow-[0_10px_30px_rgba(78,55,23,0.4)]"
                : "border-[#fde68a]/90 bg-gradient-to-br from-[#fffbeb] via-[#fffdf5] to-[#fef3c7] shadow-[0_6px_20px_rgba(180,83,9,0.06)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                  dark ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-amber-100/80 text-amber-900 border border-amber-200"
                }`}>
                  Functions
                </span>
                <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${dark ? "text-amber-200/70" : "text-amber-900/70"}`}>
                  Other Events
                </p>
                <h3 className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight ${dark ? "text-white" : "text-[#78350f]"}`}>
                  {otherCount}
                </h3>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                  dark
                    ? "border border-amber-400/30 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                    : "border border-amber-200 bg-white text-amber-700 shadow-sm"
                }`}
              >
                <CalendarDays size={22} strokeWidth={2.2} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-amber-500/15 pt-3 text-xs">
              <span className={dark ? "text-amber-200/60" : "text-amber-900/70"}>
                Engagements &amp; Parties
              </span>
              <span className={`font-semibold ${dark ? "text-amber-300" : "text-amber-800"}`}>
                {otherCount} Bookings
              </span>
            </div>
          </article>

          {/* BOX 4: CITIES / LOCATIONS - MINIMAL EMERALD / SAGE */}
          <article
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              dark
                ? "border-[#1b4332] bg-gradient-to-br from-[#0e271d] via-[#091e16] to-[#06140e] shadow-[0_10px_30px_rgba(27,67,50,0.4)]"
                : "border-[#bbf7d0]/80 bg-gradient-to-br from-[#f0fdf4] via-[#f7fef9] to-[#dcfce7] shadow-[0_6px_20px_rgba(21,128,61,0.06)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                  dark ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                }`}>
                  Coverage
                </span>
                <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${dark ? "text-emerald-200/70" : "text-emerald-900/70"}`}>
                  Active Cities
                </p>
                <h3 className={`mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight ${dark ? "text-white" : "text-[#14532d]"}`}>
                  {citiesCount}
                </h3>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                  dark
                    ? "border border-emerald-400/30 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                    : "border border-emerald-200 bg-white text-emerald-700 shadow-sm"
                }`}
              >
                <MapPin size={22} strokeWidth={2.2} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-emerald-500/15 pt-3 text-xs">
              <span className={dark ? "text-emerald-200/60" : "text-emerald-900/70"}>
                Locations Served
              </span>
              <span className={`font-semibold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
                {/* TN &amp; Karnataka */}
              </span>
            </div>
          </article>
        </section>

        {/* ================= CONTROLS & FILTER BAR ================= */}
        <section
          className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
            dark ? "border-[#1e3456] bg-[#0f213d]/90 shadow-lg" : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Event Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {eventTypes.map((event) => {
                const count = event === "All" ? enquiries.length : enquiries.filter((i) => i.mainEvent === event).length;
                const active = eventFilter === event;

                return (
                  <button
                    key={event}
                    type="button"
                    onClick={() => setEventFilter(event)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                      active
                        ? "bg-[#102b53] text-white shadow-sm ring-2 ring-[#102b53]/20"
                        : dark
                        ? "border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{event === "All" ? "All Events" : event}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                        active
                          ? "bg-white/20 text-white"
                          : dark
                          ? "bg-slate-700 text-slate-300"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search, City Filter & View Mode */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative min-w-[220px] flex-1 sm:w-64 sm:flex-initial">
                <Search
                  size={16}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    dark ? "text-slate-400" : "text-slate-400"
                  }`}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by client, city, note..."
                  className={`w-full rounded-xl border py-2.5 pl-9 pr-8 text-xs font-medium outline-none transition ${
                    dark
                      ? "border-slate-700 bg-slate-900/80 text-white placeholder:text-slate-500 focus:border-blue-500"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* City Filter */}
              <div className="relative">
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className={`rounded-xl border py-2.5 pl-3 pr-8 text-xs font-semibold outline-none appearance-none cursor-pointer transition ${
                    dark
                      ? "border-slate-700 bg-slate-900/80 text-white focus:border-blue-500"
                      : "border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500"
                  }`}
                >
                  <option value="All">All Cities</option>
                  {cityList
                    .filter((c) => c !== "All")
                    .map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* View Mode Toggle */}
              <div className={`flex items-center rounded-xl border p-1 ${
                dark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-slate-50"
              }`}>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === "table"
                      ? "bg-[#102b53] text-white shadow-sm"
                      : dark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Card View"
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === "grid"
                      ? "bg-[#102b53] text-white shadow-sm"
                      : dark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ENQUIRIES CONTENT (TABLE OR GRID) ================= */}
        {viewMode === "table" ? (
          /* TABLE VIEW */
          <section
            className={`overflow-hidden rounded-2xl border transition-colors ${
              dark ? "border-[#1e3456] bg-[#0f213d] shadow-xl" : "border-slate-200 bg-white shadow-sm"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                      dark
                        ? "border-slate-800 bg-[#0a182e] text-slate-300"
                        : "border-slate-200 bg-slate-100/70 text-slate-700"
                    }`}
                  >
                    <th className="px-5 py-4">Customer Details</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Event Type</th>
                    <th className="px-5 py-4">Event Date</th>
                    <th className="px-5 py-4">City</th>
                    <th className="px-5 py-4">Function &amp; Coverage</th>
                    <th className="px-5 py-4">Budget</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className={`divide-y text-xs ${dark ? "divide-slate-800" : "divide-slate-100"}`}>
                  {filteredData.map((item) => {
                    const eventStyle = getEventStyle(item.mainEvent, dark);
                    const EventIcon = eventStyle.icon;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedEnquiry(item)}
                        className={`group cursor-pointer transition-colors duration-150 ${
                          dark ? "hover:bg-slate-800/50" : "hover:bg-blue-50/40"
                        }`}
                      >
                        {/* Customer */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-extrabold text-xs shadow-sm ${
                              dark
                                ? "bg-gradient-to-br from-blue-900 to-indigo-950 text-blue-200 border border-blue-700/40"
                                : "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                            }`}>
                              {item.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${dark ? "text-white" : "text-slate-900"}`}>
                                {item.name}
                              </p>
                              <span className="font-mono text-[10px] text-slate-400">
                                #ENQ-{String(item.id).padStart(4, "0")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <a
                              href={`tel:${item.number}`}
                              onClick={(e) => e.stopPropagation()}
                              className={`flex items-center gap-1.5 font-semibold transition ${
                                dark ? "text-slate-300 hover:text-emerald-400" : "text-slate-700 hover:text-emerald-600"
                              }`}
                            >
                              <Phone size={13} className="text-emerald-500" />
                              <span>{item.number}</span>
                            </a>
                            <a
                              href={`mailto:${item.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-500"
                            >
                              <Mail size={12} className="text-blue-500" />
                              <span className="truncate max-w-[160px]">{item.email}</span>
                            </a>
                          </div>
                        </td>

                        {/* Event */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${eventStyle.bg}`}
                          >
                            <EventIcon size={12} />
                            <span>{item.mainEvent}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium">
                            <CalendarDays size={14} className="text-amber-500" />
                            <span className={dark ? "text-slate-300" : "text-slate-700"}>
                              {formatDate(item.eventDate)}
                            </span>
                          </div>
                        </td>

                        {/* City */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium">
                            <MapPin size={14} className="text-rose-500" />
                            <span className={dark ? "text-slate-300" : "text-slate-700"}>
                              {item.city}
                            </span>
                          </div>
                        </td>

                        {/* Function & Coverage */}
                        <td className="px-5 py-4">
                          <div>
                            <p className={`font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>
                              {item.function}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {item.weddingCoverage}
                            </p>
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`font-bold font-mono ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
                            {item.budget || "₹60,000"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold ${getStatusStyle(
                              item.status || "New",
                              dark
                            )}`}
                          >
                            {item.status || "New"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEnquiry(item);
                              }}
                              title="View Details"
                              className={`rounded-lg p-2 transition ${
                                dark
                                  ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(item.id, e)}
                              title="Delete Enquiry"
                              className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-500/15 hover:text-rose-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-16 text-center">
                        <Search size={34} className="mx-auto mb-3 text-slate-400" />
                        <p className={`text-base font-bold ${dark ? "text-white" : "text-slate-900"}`}>
                          No enquiries matched your filter
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Try adjusting your search query, event filter, or city.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setEventFilter("All");
                            setCityFilter("All");
                          }}
                          className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Clear All Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <footer
              className={`flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5 text-xs ${
                dark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
              }`}
            >
              <span>
                Showing <strong>{filteredData.length}</strong> of <strong>{enquiries.length}</strong> total enquiries
              </span>
              <span>Studio Raw Picturez · Customer Ingestion</span>
            </footer>
          </section>
        ) : (
          /* GRID CARD VIEW */
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((item) => {
              const eventStyle = getEventStyle(item.mainEvent, dark);
              const EventIcon = eventStyle.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEnquiry(item)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                    dark
                      ? "border-slate-800 bg-[#0f213d] hover:border-blue-500/40"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold text-sm ${
                            dark
                              ? "bg-blue-900/60 text-blue-200 border border-blue-700/50"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {item.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${dark ? "text-white" : "text-slate-900"}`}>
                            {item.name}
                          </h4>
                          <span className="font-mono text-[11px] text-slate-400">
                            #ENQ-{String(item.id).padStart(4, "0")}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${eventStyle.bg}`}
                      >
                        <EventIcon size={11} />
                        <span>{item.mainEvent}</span>
                      </span>
                    </div>

                    {/* Event & Function */}
                    <div className="mt-4 space-y-2 rounded-xl bg-slate-500/5 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Function</span>
                        <span className={`font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>
                          {item.function}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Coverage</span>
                        <span className={`font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>
                          {item.weddingCoverage}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Date</span>
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                          <CalendarDays size={13} />
                          {formatDate(item.eventDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Location</span>
                        <span className="flex items-center gap-1 font-semibold text-rose-500">
                          <MapPin size={13} />
                          {item.city}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <p className={`mt-3 line-clamp-2 text-xs leading-relaxed italic ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-500/15 pt-3">
                    <span className={`font-bold font-mono text-sm ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
                      {item.budget || "₹50,000"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${item.number}`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-lg p-2 text-emerald-500 transition hover:bg-emerald-500/15"
                        title="Call Customer"
                      >
                        <Phone size={15} />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-500/15"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* ================= ADD NEW ENQUIRY MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className={`relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              dark
                ? "border-[#1e3a63] bg-[#0c1a2f] text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                : "border-slate-200 bg-white text-slate-900 shadow-2xl"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b pb-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Add New Enquiry</h3>
                  <p className="text-xs text-slate-400">
                    Record customer booking enquiry details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Customer Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Anandha Krishnan"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      formErrors.name
                        ? "border-rose-500 ring-2 ring-rose-500/20"
                        : dark
                        ? "border-slate-700 bg-slate-900/80 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-500">{formErrors.name}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="number"
                    value={formData.number}
                    onChange={handleFormChange}
                    placeholder="e.g. 9876543210"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      formErrors.number
                        ? "border-rose-500 ring-2 ring-rose-500/20"
                        : dark
                        ? "border-slate-700 bg-slate-900/80 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  {formErrors.number && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-500">{formErrors.number}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="e.g. anand@gmail.com"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      dark
                        ? "border-slate-700 bg-slate-900/80 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    City / Location
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="e.g. Chennai / Coimbatore"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      dark
                        ? "border-slate-700 bg-slate-900/80 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>

                {/* Main Event */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Main Event
                  </label>
                  <select
                    name="mainEvent"
                    value={formData.mainEvent}
                    onChange={handleFormChange}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      dark
                        ? "border-slate-700 bg-slate-900 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Reception">Reception</option>
                    <option value="Pre-Wedding">Pre-Wedding Shoot</option>
                    <option value="Corporate">Corporate Event</option>
                    <option value="Other">Other Event</option>
                  </select>
                </div>

                {/* Event Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleFormChange}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      dark
                        ? "border-slate-700 bg-slate-900 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>

                {/* Function Details */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Function Details
                  </label>
                  <input
                    type="text"
                    name="function"
                    value={formData.function}
                    onChange={handleFormChange}
                    placeholder="e.g. Wedding & Reception"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      dark
                        ? "border-slate-700 bg-slate-900/80 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>

                {/* Coverage Type */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Coverage Type
                  </label>
                  <select
                    name="weddingCoverage"
                    value={formData.weddingCoverage}
                    onChange={handleFormChange}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      dark
                        ? "border-slate-700 bg-slate-900 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  >
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Two Days">Two Days</option>
                    <option value="Three Days">Three Days</option>
                    <option value="Candid Only">Candid Only</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Estimated Budget (₹)
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleFormChange}
                    placeholder="e.g. ₹1,20,000"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      dark
                        ? "border-slate-700 bg-slate-900/80 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Initial Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                      dark
                        ? "border-slate-700 bg-slate-900 text-white focus:border-blue-500"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  >
                    <option value="New">New</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notes / Package Requirements
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="e.g. Candid photography, drone, teaser video, 2 luxury photo albums..."
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition resize-none ${
                    dark
                      ? "border-slate-700 bg-slate-900/80 text-white focus:border-blue-500"
                      : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                  }`}
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 border-t pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#102b53] to-[#1e457f] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] hover:from-[#163a6e] hover:to-[#265394]"
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span>Save Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ENQUIRY DETAILS MODAL ================= */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className={`relative w-full max-w-xl rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
              dark
                ? "border-[#1e3a63] bg-[#0c1a2f] text-white"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm shadow-md">
                  {selectedEnquiry.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedEnquiry.name}</h3>
                  <span className="font-mono text-xs text-slate-400">
                    #ENQ-{String(selectedEnquiry.id).padStart(4, "0")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Details Content */}
            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-500/5 p-4">
                <div>
                  <p className="text-slate-400 font-medium">Event Type</p>
                  <p className="mt-1 font-bold text-sm text-blue-500">{selectedEnquiry.mainEvent}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Event Date</p>
                  <p className="mt-1 font-bold text-sm text-amber-500">{formatDate(selectedEnquiry.eventDate)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">City / Location</p>
                  <p className="mt-1 font-bold text-sm text-rose-500">{selectedEnquiry.city}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Estimated Budget</p>
                  <p className="mt-1 font-bold text-sm text-emerald-500">{selectedEnquiry.budget || "₹60,000"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Function</p>
                  <p className="mt-1 font-semibold">{selectedEnquiry.function}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Coverage</p>
                  <p className="mt-1 font-semibold">{selectedEnquiry.weddingCoverage}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl border p-4 dark:border-slate-800">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Contact Info</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-4">
                  <a
                    href={`tel:${selectedEnquiry.number}`}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    <Phone size={14} />
                    <span>{selectedEnquiry.number}</span>
                  </a>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="flex items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-2 font-bold text-blue-600 dark:text-blue-400"
                  >
                    <Mail size={14} />
                    <span>{selectedEnquiry.email}</span>
                  </a>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-2xl border p-4 dark:border-slate-800">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Notes &amp; Requirements</p>
                <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedEnquiry.notes || "No special notes recorded."}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between border-t pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDelete(selectedEnquiry.id)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 size={14} />
                <span>Delete Enquiry</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="rounded-xl bg-[#102b53] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#163a6e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}