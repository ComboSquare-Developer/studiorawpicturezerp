/**
 * Studio Raw ERP - Demo Attendance Data
 *
 * Daily attendance records with check-in/out times, statuses,
 * and notes referencing the consistent 3-employee roster:
 * EMP-2026-001 (Vignesh Sundaram)
 * EMP-2026-002 (Santhosh Kumar)
 * EMP-2026-003 (Priya Natarajan)
 */

const getRecentDate = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const demoAttendance = [
  // TODAY'S ATTENDANCE
  {
    id: "ATT-2026-001",
    staffId: 1,
    employeeId: "EMP-2026-001",
    employee_id: "EMP-2026-001",
    staffName: "Vignesh Sundaram",
    staff_name: "Vignesh Sundaram",
    role: "Photographer",
    date: getRecentDate(0),
    status: "Present",
    checkIn: "09:15",
    checkOut: "18:30",
    notes: "Main studio shoot for Leela Palace wedding couple.",
  },
  {
    id: "ATT-2026-002",
    staffId: 2,
    employeeId: "EMP-2026-002",
    employee_id: "EMP-2026-002",
    staffName: "Santhosh Kumar",
    staff_name: "Santhosh Kumar",
    role: "Cinematographer",
    date: getRecentDate(0),
    status: "Present",
    checkIn: "09:20",
    checkOut: "19:00",
    notes: "Wedding teaser video shoot with Sony FX3 setup.",
  },
  {
    id: "ATT-2026-003",
    staffId: 3,
    employeeId: "EMP-2026-003",
    employee_id: "EMP-2026-003",
    staffName: "Priya Natarajan",
    staff_name: "Priya Natarajan",
    role: "Photo Editor",
    date: getRecentDate(0),
    status: "Present",
    checkIn: "09:00",
    checkOut: "18:00",
    notes: "Color grading of Priya & Karthik wedding photos.",
  },

  // YESTERDAY'S ATTENDANCE
  {
    id: "ATT-2026-004",
    staffId: 1,
    employeeId: "EMP-2026-001",
    employee_id: "EMP-2026-001",
    staffName: "Vignesh Sundaram",
    staff_name: "Vignesh Sundaram",
    role: "Photographer",
    date: getRecentDate(1),
    status: "Present",
    checkIn: "09:10",
    checkOut: "18:45",
    notes: "Outdoor pre-wedding portrait session at Beach Road.",
  },
  {
    id: "ATT-2026-005",
    staffId: 2,
    employeeId: "EMP-2026-002",
    employee_id: "EMP-2026-002",
    staffName: "Santhosh Kumar",
    staff_name: "Santhosh Kumar",
    role: "Cinematographer",
    date: getRecentDate(1),
    status: "Present",
    checkIn: "09:30",
    checkOut: "19:15",
    notes: "Gimbal camera setup & drone footage backup.",
  },
  {
    id: "ATT-2026-006",
    staffId: 3,
    employeeId: "EMP-2026-003",
    employee_id: "EMP-2026-003",
    staffName: "Priya Natarajan",
    staff_name: "Priya Natarajan",
    role: "Photo Editor",
    date: getRecentDate(1),
    status: "Present",
    checkIn: "09:05",
    checkOut: "18:10",
    notes: "Album layout design and high-res print export.",
  },

  // 2 DAYS AGO
  {
    id: "ATT-2026-007",
    staffId: 1,
    employeeId: "EMP-2026-001",
    employee_id: "EMP-2026-001",
    staffName: "Vignesh Sundaram",
    staff_name: "Vignesh Sundaram",
    role: "Photographer",
    date: getRecentDate(2),
    status: "Present",
    checkIn: "09:00",
    checkOut: "18:15",
    notes: "Traditional ritual and stage portraits setup.",
  },
  {
    id: "ATT-2026-008",
    staffId: 2,
    employeeId: "EMP-2026-002",
    employee_id: "EMP-2026-002",
    staffName: "Santhosh Kumar",
    staff_name: "Santhosh Kumar",
    role: "Cinematographer",
    date: getRecentDate(2),
    status: "Half Day",
    checkIn: "09:15",
    checkOut: "14:00",
    notes: "Half day shoot & gear maintenance.",
  },
  {
    id: "ATT-2026-009",
    staffId: 3,
    employeeId: "EMP-2026-003",
    employee_id: "EMP-2026-003",
    staffName: "Priya Natarajan",
    staff_name: "Priya Natarajan",
    role: "Photo Editor",
    date: getRecentDate(2),
    status: "Present",
    checkIn: "08:55",
    checkOut: "18:00",
    notes: "Teaser video color grading.",
  },
];

export default demoAttendance;
