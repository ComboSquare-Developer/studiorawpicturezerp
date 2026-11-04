

import { useEffect, useRef, useState } from "react";

import {

  LayoutDashboard,

  MessageSquare,

  Users,

  CalendarDays,

  Wallet,


  PackageCheck,

  Boxes,

  Wrench,

  Receipt,

  Building2,

  BarChart3,


  Settings,

  LogOut,




  Menu,

  X,

  ChevronLeft,

  ChevronRight,

  Sparkles,

} from "lucide-react";



import studioLogo from "../assets/favicon.png";



const SOUND_KEY = "studioraw_sound";



const menuGroups = [

  {

    title: "OVERVIEW",

    items: [

      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },

      { id: "enquiries", label: "Enquiries", icon: MessageSquare },

      { id: "customers", label: "Customers", icon: Users },

    ],

  },

  {

    title: "SHOOT BOOKINGS & EVENTS",

    items: [

      { id: "bookings", label: "Bookings", icon: CalendarDays },

    ],

  },

  {

    title: "OPERATIONS",

    items: [

      { id: "payments", label: "Payments", icon: Wallet },

      { id: "deliveries", label: "Deliveries", icon: PackageCheck },

      { id: "inventory", label: "Inventory", icon: Boxes },

      { id: "equipment", label: "Equipment", icon: Wrench },

      { id: "expenses", label: "Expenses", icon: Receipt },

    ],

  },

  {

    title: "MANAGEMENT",

    items: [

      { id: "staff", label: "Staff", icon: Users },

      { id: "branches", label: "Branches", icon: Building2 },

      { id: "reports", label: "Reports", icon: BarChart3 },


      { id: "settings", label: "Settings", icon: Settings },

    ],

  },

];



function readSetting(key, fallback) {

  try {

    return localStorage.getItem(key) ?? fallback;

  } catch {

    return fallback;

  }

}



export default function Sidebar({

  activePage = "dashboard",

  setActivePage = () => {},

  onLogout = () => {},

  sidebarOpen,

  setSidebarOpen,

}) {

  const [collapsed, setCollapsed] = useState(false);

  const [internalMobileOpen, setInternalMobileOpen] = useState(false);



  const [soundEnabled] = useState(

    () => readSetting(SOUND_KEY, "true") !== "false"

  );



  const [clickedItem, setClickedItem] = useState(null);



  const audioRef = useRef(null);



  const isControlled =

    typeof sidebarOpen === "boolean" &&

    typeof setSidebarOpen === "function";



  const mobileOpen = isControlled

    ? sidebarOpen

    : internalMobileOpen;



  const setMobileOpen = (value) => {

    if (isControlled) {

      setSidebarOpen(value);

    } else {

      setInternalMobileOpen(value);

    }

  };



  // Keep the application in light mode

  useEffect(() => {

    const root = document.documentElement;



    root.dataset.theme = "light";

    root.classList.remove("dark");

    root.style.colorScheme = "light";



    try {

      localStorage.setItem("studioraw_theme", "light");

    } catch {

      // Storage unavailable

    }



    window.dispatchEvent(

      new CustomEvent("studioraw-theme-change", {

        detail: { theme: "light" },

      })

    );

  }, []);



  // Sound sync

  useEffect(() => {

    try {

      localStorage.setItem(SOUND_KEY, String(soundEnabled));

    } catch {

      // Storage unavailable

    }



    window.dispatchEvent(

      new CustomEvent("studioraw-sound-change", {

        detail: { enabled: soundEnabled },

      })

    );

  }, [soundEnabled]);



  // Mobile sidebar

  useEffect(() => {

    if (!mobileOpen) return;



    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";



    const handleEscape = (event) => {

      if (event.key === "Escape") {

        setMobileOpen(false);

      }

    };



    window.addEventListener("keydown", handleEscape);



    return () => {

      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);

    };

  }, [mobileOpen]);



  // Audio cleanup

  useEffect(() => {

    return () => {

      audioRef.current?.close?.();

    };

  }, []);



  // Sound effects

  const playSound = (type = "click") => {

    if (!soundEnabled) return;



    try {

      const AudioContextClass =

        window.AudioContext || window.webkitAudioContext;



      if (!AudioContextClass) return;



      if (!audioRef.current) {

        audioRef.current = new AudioContextClass();

      }



      const context = audioRef.current;



      if (context.state === "suspended") {

        context.resume();

      }



      const sounds = {

        click: [660],

        navigate: [523.25, 659.25],

        expand: [440, 587.33],

        collapse: [587.33, 440],

        logout: [659.25, 523.25, 392],

      };



      const notes = sounds[type] || sounds.click;



      notes.forEach((frequency, index) => {

        const oscillator = context.createOscillator();

        const gain = context.createGain();



        const start = context.currentTime + index * 0.085;

        const end = start + 0.22;



        oscillator.type = "sine";



        oscillator.frequency.setValueAtTime(

          frequency,

          start

        );



        oscillator.frequency.exponentialRampToValueAtTime(

          frequency * 1.015,

          end

        );



        gain.gain.setValueAtTime(0.0001, start);



        gain.gain.exponentialRampToValueAtTime(

          0.045,

          start + 0.025

        );



        gain.gain.exponentialRampToValueAtTime(

          0.0001,

          end

        );



        oscillator.connect(gain);

        gain.connect(context.destination);



        oscillator.start(start);

        oscillator.stop(end + 0.01);

      });

    } catch (error) {

      console.warn("Audio unavailable:", error);

    }

  };



  const handleNavigation = (id) => {

    playSound(

      id !== activePage ? "navigate" : "click"

    );



    setClickedItem(id);

    setActivePage(id);

    setMobileOpen(false);

  };



  const handleLogout = () => {

    playSound("logout");

    setMobileOpen(false);

    onLogout();

  };



  const handleCollapse = () => {

    playSound(collapsed ? "expand" : "collapse");

    setCollapsed((previous) => !previous);

  };



  const renderSidebarContent = (isMobile = false) => {

    const showLabels = !collapsed || isMobile;



    return (

      <>

        {/* BRAND */}

        <div

          className={`relative flex h-[86px] shrink-0 items-center border-b border-[#e5eaf3] ${

            showLabels

              ? "justify-between px-4"

              : "justify-center px-2"

          }`}

        >

          <div

            className={`flex min-w-0 items-center ${

              showLabels ? "gap-3" : ""

            }`}

          >

            {/* Logo */}

            <div className="flex h-12 w-12 shrink-0 items-center justify-center">

              <img

                src={studioLogo}

                alt="Studio Raw Picturez Logo"

                className="h-full w-full object-contain"

                draggable={false}

              />

            </div>



            {showLabels && (

              <div className="min-w-0">

                <h1 className="truncate text-[13px] font-extrabold tracking-[0.045em] text-[#102b53]">

                  STUDIO RAW PICTUREZ

                </h1>



                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-[#a68a5c]">

                  <Sparkles size={11} />

                  ERP & CRM

                </p>

              </div>

            )}

          </div>



          {isMobile ? (

            <button

              type="button"

              onClick={() => {

                playSound("click");

                setMobileOpen(false);

              }}

              aria-label="Close sidebar"

              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dfe6f0] text-[#102b53] transition-all duration-300 hover:rotate-90 hover:bg-[#eef4ff]"

            >

              <X size={19} />

            </button>

          ) : (

            showLabels && (

              <button

                type="button"

                onClick={handleCollapse}

                aria-label="Collapse sidebar"

                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dfe6f0] text-[#102b53] transition-all duration-300 hover:scale-110 hover:bg-[#edf4ff]"

              >

                <ChevronLeft size={19} />

              </button>

            )

          )}

        </div>



        {/* EXPAND BUTTON */}

        {!isMobile && collapsed && (

          <div className="border-b border-[#e6eaf2] px-3 py-3">

            <button

              type="button"

              onClick={handleCollapse}

              title="Expand Sidebar"

              aria-label="Expand sidebar"

              className="flex h-11 w-full items-center justify-center rounded-xl border border-[#dfe6f0] text-[#102b53] transition-all duration-300 hover:scale-105 hover:bg-[#edf4ff]"

            >

              <ChevronRight size={19} />

            </button>

          </div>

        )}



        {/* NAVIGATION */}

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-5 [scrollbar-width:thin]">



          {menuGroups.map((group, groupIndex) => (

            <div key={group.title}>



              {/* Group title */}

              {showLabels ? (

                <p className="mb-3 px-3 text-[10px] font-extrabold tracking-[0.17em] text-[#8b9bb3]">

                  {group.title}

                </p>

              ) : (

                groupIndex > 0 && (

                  <div className="mx-2 mb-3 border-t border-[#e5eaf2]" />

                )

              )}



              <div className="space-y-1.5">

                {group.items.map((item) => {

                  const Icon = item.icon;

                  const active = activePage === item.id;

                  const recentlyClicked =

                    clickedItem === item.id;



                  return (

                    <button

                      key={item.id}

                      type="button"

                      title={

                        !showLabels

                          ? item.label

                          : undefined

                      }

                      aria-current={

                        active ? "page" : undefined

                      }

                      onClick={() =>

                        handleNavigation(item.id)

                      }

                      className={`

                        group relative flex w-full min-w-0

                        items-center overflow-hidden

                        rounded-[13px] border

                        text-left text-[13px] font-semibold

                        outline-none

                        transition-all duration-300 ease-out

                        focus-visible:ring-2

                        focus-visible:ring-[#2563eb]

                        focus-visible:ring-offset-2

                        ${

                          showLabels

                            ? "gap-3 px-3 py-3"

                            : "justify-center px-2 py-3"

                        }

                        ${

                          active

                            ? "border-[#123e7b] bg-[#eef5ff] text-[#102b53] shadow-[0_0_0_1px_rgba(18,62,123,0.12),0_5px_20px_rgba(35,91,173,0.13)]"

                            : "border-transparent text-[#586b86] hover:translate-x-[3px] hover:border-[#d8e5f7] hover:bg-[#f2f7ff] hover:text-[#102b53]"

                        }

                        active:scale-[0.98]

                      `}

                    >

                      {/* Active glow */}

                      {active && (

                        <>

                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#c8e0ff]/30 via-transparent to-[#dbeafe]/20" />



                          <span className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#174b94] shadow-[0_0_12px\_#3b82f6]" />



                          <span className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-[#60a5fa]/15 blur-xl" />

                        </>

                      )}



                      {/* Icon */}

                      <span

                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-300 group-hover:scale-110 ${

                          active ? "text-[#123e7b]" : ""

                        }`}

                      >

                        <Icon

                          size={19}

                          strokeWidth={active ? 2.4 : 1.9}

                        />

                      </span>



                      {/* Menu title */}

                      {showLabels && (

                        <>

                          <span className="relative z-10 min-w-0 flex-1 truncate">

                            {item.label}

                          </span>



                          {active && (

                            <ChevronRight

                              size={15}

                              className="relative z-10 shrink-0 text-[#2d65a8] transition-transform duration-300 group-hover:translate-x-1"

                            />

                          )}

                        </>

                      )}



                      {/* Click highlight */}

                      {recentlyClicked && active && (

                        <span className="pointer-events-none absolute inset-0 rounded-[13px] ring-1 ring-[#5b9cff]/30" />

                      )}

                    </button>

                  );

                })}

              </div>

            </div>

          ))}

        </nav>



        {/* FOOTER - LOGOUT ONLY */}

        <div className="shrink-0 border-t border-[#e5eaf2] bg-[#f9fbff] p-3">



          <button

            type="button"

            onClick={handleLogout}

            title={!showLabels ? "Logout" : undefined}

            className={`group flex w-full items-center rounded-xl border border-blue-900 bg-blue-200 text-sm font-semibold text-blue-900 transition-all duration-300 hover:scale-[1.02] hover:border-[#e8bcbc] hover:bg-[#fff0f0] ${

              showLabels

                ? "gap-3 px-3 py-3"

                : "justify-center px-2 py-3"

            }`}

          >

            <LogOut

              size={19}

              className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1"

            />



            {showLabels && <span>Logout</span>}

          </button>

        </div>

      </>

    );

  };



  return (

    <>

      {/* MOBILE MENU BUTTON */}

      {!isControlled && (

        <button

          type="button"

          onClick={() => {

            playSound("click");

            setMobileOpen(true);

          }}

          aria-label="Open sidebar"

          className="fixed left-3 top-3 z-[80] flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5f2] bg-white text-[#10264d] shadow-[0_5px_20px_rgba(16,38,77,0.14)] transition-all duration-300 hover:scale-105 lg:hidden"

        >

          <Menu size={21} />

        </button>

      )}



      {/* MOBILE OVERLAY */}

      {mobileOpen && (

        <div

          className="fixed inset-0 z-[90] bg-[#06152b]/60 backdrop-blur-[3px] lg:hidden"

          onClick={() => setMobileOpen(false)}

        />

      )}



      {/* MOBILE SIDEBAR */}

      <aside

        aria-label="Mobile navigation"

        className={`fixed inset-y-0 left-0 z-[100] flex w-[min(290px,85vw)] flex-col border-r border-[#e5eaf2] bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${

          mobileOpen

            ? "translate-x-0"

            : "-translate-x-full"

        }`}

      >

        {renderSidebarContent(true)}

      </aside>



      {/* DESKTOP SIDEBAR */}

      <aside

        aria-label="Desktop navigation"

        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#e5eaf2] bg-white shadow-[4px_0_25px_rgba(16,38,77,0.055)] transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${

          collapsed

            ? "w-[78px]"

            : "w-[265px]"

        }`}

      >

        {renderSidebarContent(false)}

      </aside>

    </>

  );

}