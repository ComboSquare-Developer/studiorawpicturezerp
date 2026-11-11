/**
 * Studio Raw ERP - Centralized Demo Inventory & Consumables Data
 *
 * 4 realistic photography studio supplies and consumables:
 * 1. SanDisk Extreme Pro 128GB V90 SDXC Cards
 * 2. Acrylic Photobook Blanks (12x36 Flush Mount)
 * 3. Full-Frame Camera Sensor Cleaning Swabs
 * 4. Seamless Paper Backdrop Roll (Super White 9ft)
 */

export const demoInventory = [
  {
    id: "INV-2026-001",
    name: "SanDisk Extreme Pro 128GB V90 SDXC",
    category: "Storage Media",
    sku: "MED-SD-128V90",
    stockQuantity: 14,
    reorderLevel: 5,
    unit: "Pieces",
    costPrice: 9500,
    status: "In Stock",
    location: "Media Vault - Tray 1",
    notes: "High-speed 300MB/s cards for high-bitrate All-Intra 4K capture.",
  },
  {
    id: "INV-2026-002",
    name: "Acrylic Photobook Cover Blanks (12x36)",
    category: "Album Production",
    sku: "ALB-ACR-1236",
    stockQuantity: 8,
    reorderLevel: 4,
    unit: "Sets",
    costPrice: 4200,
    status: "In Stock",
    location: "Album Workshop - Shelf C",
    notes: "Premium crystal clear acrylic covers for luxury wedding albums.",
  },
  {
    id: "INV-2026-003",
    name: "VSGO Full-Frame Sensor Cleaning Swabs",
    category: "Maintenance Kits",
    sku: "CLN-SWB-FF24",
    stockQuantity: 24,
    reorderLevel: 8,
    unit: "Boxes",
    costPrice: 1650,
    status: "In Stock",
    location: "Tech Care Bay - Cabinet B",
    notes: "Vacuum packaged sensor cleaning swabs with optic cleaner liquid.",
  },
  {
    id: "INV-2026-004",
    name: "Savage Seamless Paper Backdrop (Super White 9ft)",
    category: "Studio Sets",
    sku: "BKP-SAV-WHT09",
    stockQuantity: 3,
    reorderLevel: 2,
    unit: "Rolls",
    costPrice: 5800,
    status: "Low Stock",
    location: "Studio Studio Floor - Rack 1",
    notes: "Non-reflective fine-tooth paper roll for fashion and portrait backdrops.",
  },
];
