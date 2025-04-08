import { format, addDays, subDays } from 'date-fns';


export interface Department {
  id: string;
  code: string;
  name: string;
  manager: string;
  status: 'active' | 'inactive';
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: "storage" | "kitchen" | "restaurant" | "bar" | "housekeeping" | "maintenance";
  floor: number;
  building?: string;
  status: "active" | "inactive" | "maintenance";
  capacity?: number;
  responsibleDepartment: string;
  itemCount: number;
  lastCount?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  brand?: string;
  uom: string;
  packSize: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  currentStock: number;
  value: number;
  supplier?: string;
  expiryDate?: Date;
  locationId: string;
  lastCountDate?: Date;
  status: "active" | "inactive" | "discontinued";
}

export interface Count {
  id: string;
  type: 'physical' | 'spot';
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  department: string;
  counter: string;
  locations: string[];
  itemCount: number;
  discrepancies: number;
  notes?: string;
}

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: "dept-001",
    code: "FB",
    name: "Food & Beverage",
    manager: "John Smith",
    status: "active",
  },
  {
    id: "dept-002",
    code: "HK",
    name: "Housekeeping",
    manager: "Sarah Johnson",
    status: "active",
  },
  {
    id: "dept-003",
    code: "MT",
    name: "Maintenance",
    manager: "Mike Brown",
    status: "active",
  },
  {
    id: "dept-004",
    code: "FO",
    name: "Front Office",
    manager: "Lisa Davis",
    status: "active",
  },
  {
    id: "dept-005",
    code: "SP",
    name: "Spa & Recreation",
    manager: "David Wilson",
    status: "active",
  },
];

// Mock Locations
export const mockLocations: Location[] = [
  // F&B Locations
  {
    id: "ms-001",
    code: "MS001",
    name: "Main Storage",
    type: "storage",
    floor: -1,
    building: "Main Building",
    status: "active",
    capacity: 1000,
    responsibleDepartment: "Food & Beverage",
    itemCount: 0,
  },
  {
    id: "fs-001",
    code: "FS001",
    name: "F&B Storage",
    type: "storage",
    floor: -1,
    building: "Main Building",
    status: "active",
    capacity: 500,
    responsibleDepartment: "Food & Beverage",
    itemCount: 0,
  },
  {
    id: "mk-001",
    code: "MK001",
    name: "Main Kitchen",
    type: "kitchen",
    floor: 1,
    building: "Main Building",
    status: "active",
    responsibleDepartment: "Food & Beverage",
    itemCount: 0,
  },
  {
    id: "rb-001",
    code: "RB001",
    name: "Rooftop Bar",
    type: "bar",
    floor: 20,
    building: "Main Building",
    status: "active",
    responsibleDepartment: "Food & Beverage",
    itemCount: 0,
  },
  {
    id: "lr-001",
    code: "LR001",
    name: "Lobby Restaurant",
    type: "restaurant",
    floor: 1,
    building: "Main Building",
    status: "active",
    responsibleDepartment: "Food & Beverage",
    itemCount: 0,
  },
  
  // Housekeeping Locations
  {
    id: "hs-001",
    code: "HS001",
    name: "Housekeeping Storage",
    type: "storage",
    floor: -1,
    building: "Main Building",
    status: "active",
    capacity: 300,
    responsibleDepartment: "Housekeeping",
    itemCount: 0,
  },
  {
    id: "hs-002",
    code: "HS002",
    name: "Linen Room",
    type: "storage",
    floor: 2,
    building: "Main Building",
    status: "active",
    capacity: 200,
    responsibleDepartment: "Housekeeping",
    itemCount: 0,
  },
  {
    id: "hs-003",
    code: "HS003",
    name: "Amenities Storage",
    type: "storage",
    floor: -1,
    building: "Main Building",
    status: "active",
    capacity: 150,
    responsibleDepartment: "Housekeeping",
    itemCount: 0,
  },

  // Maintenance Locations
  {
    id: "mt-001",
    code: "MT001",
    name: "Maintenance Workshop",
    type: "maintenance",
    floor: -2,
    building: "Main Building",
    status: "active",
    responsibleDepartment: "Maintenance",
    itemCount: 0,
  },
  {
    id: "mt-002",
    code: "MT002",
    name: "Tools Storage",
    type: "storage",
    floor: -2,
    building: "Main Building",
    status: "active",
    capacity: 100,
    responsibleDepartment: "Maintenance",
    itemCount: 0,
  }
];

// Mock Products
export const mockProducts: Product[] = [
  // F&B Products - Main Storage (ms-001)
  {
    id: "p-001",
    code: "FB001",
    name: "Basmati Rice",
    category: "Dry Goods",
    subcategory: "Rice",
    brand: "Royal",
    uom: "kg",
    packSize: 25,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 150,
    currentStock: 275,
    value: 45.99,
    supplier: "Global Foods Inc",
    locationId: "ms-001",
    lastCountDate: subDays(new Date(), 30),
    status: "active",
  },
  {
    id: "p-002",
    code: "FB002",
    name: "All Purpose Flour",
    category: "Dry Goods",
    subcategory: "Flour",
    brand: "Gold Medal",
    uom: "kg",
    packSize: 20,
    minStock: 80,
    maxStock: 400,
    reorderPoint: 120,
    currentStock: 160,
    value: 32.50,
    supplier: "Global Foods Inc",
    locationId: "ms-001",
    lastCountDate: subDays(new Date(), 30),
    status: "active",
  },
  {
    id: "p-003",
    code: "FB003",
    name: "Sugar White",
    category: "Dry Goods",
    subcategory: "Sugar",
    brand: "Domino",
    uom: "kg",
    packSize: 25,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 150,
    currentStock: 180,
    value: 35.99,
    supplier: "Global Foods Inc",
    locationId: "ms-001",
    lastCountDate: subDays(new Date(), 35),
    status: "active",
  },
  {
    id: "p-004",
    code: "FB004",
    name: "Canned Tomatoes",
    category: "Canned Goods",
    subcategory: "Vegetables",
    brand: "San Marzano",
    uom: "can",
    packSize: 24,
    minStock: 120,
    maxStock: 480,
    reorderPoint: 144,
    currentStock: 216,
    value: 4.99,
    supplier: "Italian Imports Co",
    locationId: "ms-001",
    lastCountDate: subDays(new Date(), 25),
    status: "active",
  },

  // F&B Products - Kitchen (mk-001)
  {
    id: "p-005",
    code: "FB005",
    name: "Olive Oil Extra Virgin",
    category: "Oils & Vinegars",
    subcategory: "Cooking Oil",
    brand: "Bertolli",
    uom: "liter",
    packSize: 5,
    minStock: 20,
    maxStock: 100,
    reorderPoint: 30,
    currentStock: 45,
    value: 89.99,
    supplier: "Mediterranean Imports",
    locationId: "mk-001",
    lastCountDate: subDays(new Date(), 15),
    status: "active",
  },
  {
    id: "p-006",
    code: "FB006",
    name: "Black Pepper Ground",
    category: "Spices",
    subcategory: "Pepper",
    brand: "McCormick",
    uom: "kg",
    packSize: 1,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 15,
    currentStock: 8,
    value: 45.00,
    supplier: "Spice Traders Inc",
    locationId: "mk-001",
    lastCountDate: subDays(new Date(), 20),
    status: "active",
  },
  {
    id: "p-007",
    code: "FB007",
    name: "Sea Salt",
    category: "Spices",
    subcategory: "Salt",
    brand: "Morton",
    uom: "kg",
    packSize: 2,
    minStock: 15,
    maxStock: 60,
    reorderPoint: 20,
    currentStock: 22,
    value: 25.00,
    supplier: "Spice Traders Inc",
    locationId: "mk-001",
    lastCountDate: subDays(new Date(), 18),
    status: "active",
  },

  // F&B Products - Bar (rb-001)
  {
    id: "p-008",
    code: "FB008",
    name: "Vodka Premium",
    category: "Spirits",
    subcategory: "Vodka",
    brand: "Grey Goose",
    uom: "bottle",
    packSize: 6,
    minStock: 24,
    maxStock: 96,
    reorderPoint: 36,
    currentStock: 42,
    value: 45.99,
    supplier: "Premium Spirits Co",
    locationId: "rb-001",
    lastCountDate: subDays(new Date(), 10),
    status: "active",
  },
  {
    id: "p-009",
    code: "FB009",
    name: "Gin London Dry",
    category: "Spirits",
    subcategory: "Gin",
    brand: "Tanqueray",
    uom: "bottle",
    packSize: 6,
    minStock: 18,
    maxStock: 72,
    reorderPoint: 24,
    currentStock: 15,
    value: 39.99,
    supplier: "Premium Spirits Co",
    locationId: "rb-001",
    lastCountDate: subDays(new Date(), 12),
    status: "active",
  },
  {
    id: "p-010",
    code: "FB010",
    name: "Tonic Water",
    category: "Mixers",
    subcategory: "Carbonated",
    brand: "Fever-Tree",
    uom: "bottle",
    packSize: 24,
    minStock: 96,
    maxStock: 288,
    reorderPoint: 120,
    currentStock: 144,
    value: 2.99,
    supplier: "Premium Mixers Ltd",
    locationId: "rb-001",
    lastCountDate: subDays(new Date(), 8),
    status: "active",
  },

  // Housekeeping Products - Linen Room (hs-002)
  {
    id: "p-011",
    code: "HK001",
    name: "Bath Towel Large",
    category: "Linens",
    subcategory: "Towels",
    brand: "Standard Textile",
    uom: "piece",
    packSize: 12,
    minStock: 200,
    maxStock: 800,
    reorderPoint: 300,
    currentStock: 450,
    value: 12.99,
    supplier: "Standard Textile Co",
    locationId: "hs-002",
    lastCountDate: subDays(new Date(), 45),
    status: "active",
  },
  {
    id: "p-012",
    code: "HK002",
    name: "Hand Towel",
    category: "Linens",
    subcategory: "Towels",
    brand: "Standard Textile",
    uom: "piece",
    packSize: 24,
    minStock: 300,
    maxStock: 1000,
    reorderPoint: 400,
    currentStock: 280,
    value: 5.99,
    supplier: "Standard Textile Co",
    locationId: "hs-002",
    lastCountDate: subDays(new Date(), 45),
    status: "active",
  },
  {
    id: "p-013",
    code: "HK003",
    name: "Bed Sheet King",
    category: "Linens",
    subcategory: "Bedding",
    brand: "Standard Textile",
    uom: "piece",
    packSize: 6,
    minStock: 100,
    maxStock: 400,
    reorderPoint: 150,
    currentStock: 180,
    value: 24.99,
    supplier: "Standard Textile Co",
    locationId: "hs-002",
    lastCountDate: subDays(new Date(), 40),
    status: "active",
  },

  // Housekeeping Products - Amenities Storage (hs-003)
  {
    id: "p-014",
    code: "HK004",
    name: "Shampoo Luxury",
    category: "Amenities",
    subcategory: "Bath Amenities",
    brand: "L'Occitane",
    uom: "bottle",
    packSize: 48,
    minStock: 200,
    maxStock: 800,
    reorderPoint: 300,
    currentStock: 524,
    value: 2.99,
    supplier: "L'Occitane Inc",
    locationId: "hs-003",
    lastCountDate: subDays(new Date(), 20),
    status: "active",
  },
  {
    id: "p-015",
    code: "HK005",
    name: "Body Lotion",
    category: "Amenities",
    subcategory: "Bath Amenities",
    brand: "L'Occitane",
    uom: "bottle",
    packSize: 48,
    minStock: 200,
    maxStock: 800,
    reorderPoint: 300,
    currentStock: 410,
    value: 2.99,
    supplier: "L'Occitane Inc",
    locationId: "hs-003",
    lastCountDate: subDays(new Date(), 20),
    status: "active",
  },
  {
    id: "p-016",
    code: "HK006",
    name: "Shower Cap",
    category: "Amenities",
    subcategory: "Bath Amenities",
    brand: "Generic",
    uom: "piece",
    packSize: 100,
    minStock: 500,
    maxStock: 2000,
    reorderPoint: 750,
    currentStock: 1200,
    value: 0.25,
    supplier: "Global Amenities Co",
    locationId: "hs-003",
    lastCountDate: subDays(new Date(), 25),
    status: "active",
  },

  // Maintenance Products - Tools Storage (mt-002)
  {
    id: "p-017",
    code: "MT001",
    name: "Light Bulb LED 10W",
    category: "Electrical",
    subcategory: "Lighting",
    brand: "Philips",
    uom: "piece",
    packSize: 24,
    minStock: 100,
    maxStock: 400,
    reorderPoint: 150,
    currentStock: 286,
    value: 4.99,
    supplier: "Philips Lighting",
    locationId: "mt-002",
    lastCountDate: subDays(new Date(), 60),
    status: "active",
  },
  {
    id: "p-018",
    code: "MT002",
    name: "Light Bulb LED 15W",
    category: "Electrical",
    subcategory: "Lighting",
    brand: "Philips",
    uom: "piece",
    packSize: 24,
    minStock: 100,
    maxStock: 400,
    reorderPoint: 150,
    currentStock: 142,
    value: 5.99,
    supplier: "Philips Lighting",
    locationId: "mt-002",
    lastCountDate: subDays(new Date(), 60),
    status: "active",
  },
  {
    id: "p-019",
    code: "MT003",
    name: "Air Filter HVAC",
    category: "HVAC",
    subcategory: "Filters",
    brand: "3M",
    uom: "piece",
    packSize: 12,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 75,
    currentStock: 68,
    value: 15.99,
    supplier: "HVAC Supplies Co",
    locationId: "mt-002",
    lastCountDate: subDays(new Date(), 45),
    status: "active",
  },
  {
    id: "p-020",
    code: "MT004",
    name: "Screwdriver Set",
    category: "Tools",
    subcategory: "Hand Tools",
    brand: "Stanley",
    uom: "set",
    packSize: 1,
    minStock: 10,
    maxStock: 40,
    reorderPoint: 15,
    currentStock: 12,
    value: 29.99,
    supplier: "Tools Direct",
    locationId: "mt-002",
    lastCountDate: subDays(new Date(), 90),
    status: "active",
  }
];

// Mock Counts
export const mockCounts: Count[] = [
  {
    id: "cnt-001",
    type: "physical",
    status: "completed",
    startDate: subDays(new Date(), 7),
    endDate: subDays(new Date(), 6),
    department: "Food & Beverage",
    counter: "John Doe",
    locations: ["ms-001", "fs-001"],
    itemCount: 150,
    discrepancies: 12,
    notes: "Annual inventory count",
  },
  {
    id: "cnt-002",
    type: "spot",
    status: "completed",
    startDate: subDays(new Date(), 3),
    endDate: subDays(new Date(), 3),
    department: "Food & Beverage",
    counter: "Jane Smith",
    locations: ["mk-001"],
    itemCount: 30,
    discrepancies: 2,
    notes: "Random spot check",
  },
  {
    id: "cnt-003",
    type: "physical",
    status: "in_progress",
    startDate: new Date(),
    department: "Housekeeping",
    counter: "Alice Brown",
    locations: ["hs-001"],
    itemCount: 80,
    discrepancies: 5,
    notes: "Monthly inventory verification",
  },
];

// Helper Functions
export const getLocationsByDepartment = (department: string) => {
  return mockLocations.filter(loc => loc.responsibleDepartment === department);
};

export const getCountsByDepartment = (department: string) => {
  return mockCounts.filter(count => count.department === department);
};

export const getCountsByType = (type: 'physical' | 'spot') => {
  return mockCounts.filter(count => count.type === type);
};

export const getLocationsByType = (type: Location["type"]) => {
  return mockLocations.filter(loc => loc.type === type);
};

export const getProductsByLocation = (locationId: string) => {
  return mockProducts.filter(product => product.locationId === locationId);
};

export const getProductsByDepartment = (department: string) => {
  const departmentLocations = getLocationsByDepartment(department);
  const locationIds = departmentLocations.map(loc => loc.id);
  return mockProducts.filter(product => locationIds.includes(product.locationId));
};

export const getProductsByCategory = (category: string) => {
  return mockProducts.filter(product => product.category === category);
};

export const getLowStockProducts = () => {
  return mockProducts.filter(product => product.currentStock <= product.reorderPoint);
};

export const getProductsNeedingCount = (daysThreshold: number = 30) => {
  const thresholdDate = subDays(new Date(), daysThreshold);
  return mockProducts.filter(product => 
    !product.lastCountDate || product.lastCountDate <= thresholdDate
  );
};
