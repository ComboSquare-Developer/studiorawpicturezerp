import React, { useState } from "react";
import {
  Search,
  CalendarDays,
  MapPin,
  Mail,
  Phone,
  Sun,
  Moon,
  Users,
  Camera,
} from "lucide-react";

const dummyData = [
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
  },
];

const formatDate = (date) => {
  if (!date) return "Not specified";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export default function Enquiries() {
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");

  const theme = {
    page: dark
      ? "bg-[#111827] text-white"
      : "bg-[#f5f7fb] text-gray-900",

    card: dark
      ? "bg-[#1f2937] border-[#374151]"
      : "bg-white border-gray-200",

    heading: dark
      ? "text-white"
      : "text-[#172554]",

    secondary: dark
      ? "text-gray-300"
      : "text-gray-600",

    input: dark
      ? "bg-[#111827] border-gray-600 text-white placeholder:text-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500",

    tableHead: dark
      ? "bg-[#273449] text-gray-100"
      : "bg-[#eef2f8] text-gray-700",

    row: dark
      ? "border-gray-700 hover:bg-[#273449]"
      : "border-gray-100 hover:bg-gray-50",

    detailBox: dark
      ? "bg-[#111827] border-gray-700"
      : "bg-[#f8fafc] border-gray-200",
  };

  const filteredData = dummyData.filter((item) => {
    const query = search.toLowerCase().trim();

    const matchesSearch = [
      item.name,
      item.email,
      item.number,
      item.mainEvent,
      item.city,
      item.function,
      item.weddingCoverage,
    ].some((value) =>
      value.toLowerCase().includes(query)
    );

    const matchesEvent =
      eventFilter === "All" ||
      item.mainEvent === eventFilter;

    return matchesSearch && matchesEvent;
  });

  const eventTypes = [
    "All",
    ...new Set(dummyData.map((item) => item.mainEvent)),
  ];

  const stats = [
    {
      label: "Total Enquiries",
      value: dummyData.length,
      icon: Users,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Wedding Events",
      value: dummyData.filter(
        (item) => item.mainEvent === "Wedding"
      ).length,
      icon: Camera,
      color: "bg-purple-100 text-purple-800",
    },
    {
      label: "Other Events",
      value: dummyData.filter(
        (item) => item.mainEvent !== "Wedding"
      ).length,
      icon: CalendarDays,
      color: "bg-amber-100 text-amber-900",
    },
    {
      label: "Cities",
      value: new Set(dummyData.map((item) => item.city)).size,
      icon: MapPin,
      color: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <main
      className={`min-h-screen p-4 transition-colors duration-300 sm:p-6 lg:p-8 ${theme.page}`}
    >
      <div className="mx-auto max-w-[1600px]">

        {/* Page Header */}

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-lg bg-amber-100 p-2 text-amber-900">
                <Camera size={20} />
              </span>

              <span
                className={`text-sm font-bold uppercase tracking-[0.2em] ${theme.secondary}`}
              >
                Studio Management
              </span>
            </div>

            <h1
              className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${theme.heading}`}
            >
              Enquiries
            </h1>

            <p className={`mt-2 text-sm ${theme.secondary}`}>
              View and manage your customer enquiry details.
            </p>
          </div>

          {/* Theme Toggle */}

          {/* <button
            type="button"
            onClick={() => setDark((previous) => !previous)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-sm transition ${
              dark
                ? "border-gray-600 bg-[#273449] text-white hover:bg-[#374151]"
                : "border-gray-200 bg-white text-gray-900 hover:bg-gray-100"
            }`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? "Light Theme" : "Dark Theme"}
          </button> */}
        </header>

        {/* Summary Cards */}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className={`rounded-2xl border p-5 shadow-sm ${theme.card}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-sm font-semibold ${theme.secondary}`}>
                      {stat.label}
                    </p>

                    <p className={`mt-3 text-3xl font-extrabold ${theme.heading}`}>
                      {stat.value}
                    </p>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={23} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Enquiry Table */}

        <section
          className={`overflow-hidden rounded-2xl border shadow-sm ${theme.card}`}
        >
          <div className="flex flex-col gap-4 border-b border-gray-500/20 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={`text-xl font-extrabold ${theme.heading}`}>
                Customer Enquiry Details
              </h2>

              <p className={`mt-1 text-sm ${theme.secondary}`}>
                {filteredData.length} enquiries displayed
              </p>
            </div>

            {/* Search and Filter */}

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.secondary}`}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search enquiries..."
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 sm:w-72 ${theme.input}`}
                />
              </div>

              <select
                value={eventFilter}
                onChange={(event) => setEventFilter(event.target.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 ${theme.input}`}
              >
                {eventTypes.map((event) => (
                  <option key={event} value={event}>
                    {event === "All" ? "All Events" : event}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-left">
              <thead className={theme.tableHead}>
                <tr>
                  {[
                    "Customer",
                    "Contact Details",
                    "Main Event",
                    "Event Date",
                    "City",
                    "Function",
                    "Wedding Coverage",
                    "Notes",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-5 py-4 text-xs font-extrabold uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-t transition-colors ${theme.row}`}
                  >
                    {/* Name: Always Dark */}

                    <td className="px-5 py-5">
                      <p className="whitespace-nowrap text-sm font-bold text-gray-950">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-700">
                        ENQ-{String(item.id).padStart(4, "0")}
                      </p>
                    </td>

                    {/* Email and Phone */}

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <Mail
                          size={15}
                          className="shrink-0 text-blue-500"
                        />

                        <span className={`text-sm ${theme.secondary}`}>
                          {item.email}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Phone
                          size={15}
                          className="shrink-0 text-emerald-500"
                        />

                        <span className={`text-sm ${theme.secondary}`}>
                          {item.number}
                        </span>
                      </div>
                    </td>

                    {/* Main Event */}

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${
                          item.mainEvent === "Wedding"
                            ? "bg-purple-100 text-purple-900"
                            : item.mainEvent === "Engagement"
                            ? "bg-blue-100 text-blue-900"
                            : item.mainEvent === "Birthday"
                            ? "bg-amber-100 text-amber-950"
                            : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {item.mainEvent}
                      </span>
                    </td>

                    {/* Event Date */}

                    <td className="whitespace-nowrap px-5 py-5">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-amber-600" />

                        <span className={`text-sm font-medium ${theme.secondary}`}>
                          {formatDate(item.eventDate)}
                        </span>
                      </div>
                    </td>

                    {/* City */}

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-rose-500" />

                        <span className={`text-sm font-medium ${theme.secondary}`}>
                          {item.city}
                        </span>
                      </div>
                    </td>

                    {/* Function */}

                    <td className="px-5 py-5">
                      <span className={`whitespace-nowrap text-sm font-medium ${theme.secondary}`}>
                        {item.function}
                      </span>
                    </td>

                    {/* Wedding Coverage */}

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${
                          dark
                            ? "bg-[#374151] text-gray-100"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.weddingCoverage}
                      </span>
                    </td>

                    {/* Notes */}

                    <td className="max-w-[260px] px-5 py-5">
                      <p className={`min-w-[180px] text-sm leading-6 ${theme.secondary}`}>
                        {item.notes}
                      </p>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <Search
                        size={32}
                        className={`mx-auto mb-3 ${theme.secondary}`}
                      />

                      <p className={`font-bold ${theme.heading}`}>
                        No enquiries found
                      </p>

                      <p className={`mt-1 text-sm ${theme.secondary}`}>
                        Try another name, city, email or event type.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}

          <footer
            className={`flex flex-wrap items-center justify-between gap-2 border-t border-gray-500/20 px-5 py-4 text-xs ${theme.secondary}`}
          >
            <span>
              Showing {filteredData.length} of {dummyData.length} sample records
            </span>

            <span>Demo data · Studio Enquiries</span>
          </footer>
        </section>
      </div>
    </main>
  );
}