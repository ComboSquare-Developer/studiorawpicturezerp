/**
 * Studio Raw ERP - Demo Leave Requests Data
 *
 * Staff leave applications for the 3 employees:
 * EMP-2026-001 (Vignesh Sundaram)
 * EMP-2026-002 (Santhosh Kumar)
 * EMP-2026-003 (Priya Natarajan)
 */

export const demoLeaves = [
  {
    id: "LEV-2026-001",
    employee_id: "EMP-2026-001",
    staffId: 1,
    staffName: "Vignesh Sundaram",
    role: "Photographer",
    department: "Photography",
    leaveType: "Casual Leave",
    startDate: "2026-11-28",
    endDate: "2026-11-29",
    totalDays: 2,
    status: "Pending",
    appliedOn: "2026-11-09",
    reason: "Attending family function in Coimbatore.",
    approvedBy: null,
  },
  {
    id: "LEV-2026-002",
    employee_id: "EMP-2026-002",
    staffId: 2,
    staffName: "Santhosh Kumar",
    role: "Cinematographer",
    department: "Videography",
    leaveType: "Medical Leave",
    startDate: "2026-11-10",
    endDate: "2026-11-11",
    totalDays: 2,
    status: "Approved",
    appliedOn: "2026-11-08",
    reason: "Doctor advised rest due to fever and viral recovery.",
    approvedBy: "Studio Manager",
  },
  {
    id: "LEV-2026-003",
    employee_id: "EMP-2026-003",
    staffId: 3,
    staffName: "Priya Natarajan",
    role: "Photo Editor",
    department: "Post-Production",
    leaveType: "Annual Leave",
    startDate: "2026-12-01",
    endDate: "2026-12-04",
    totalDays: 4,
    status: "Approved",
    appliedOn: "2026-11-01",
    reason: "Family vacation planned in advance with editing tasks pre-cleared.",
    approvedBy: "Studio Manager",
  },
];

export default demoLeaves;
